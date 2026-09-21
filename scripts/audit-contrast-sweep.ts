// Driving the collector: a static server, a browser, and the loop over slugs,
// themes and widths.
//
// Split from `audit-contrast.ts` so that argument handling runs without
// importing Playwright. That is what lets `src/lib/audit-contrast-cli.test.ts`
// pin the CLI's contract in CI, where no browser is installed.

import { existsSync, readFileSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, normalize, resolve, sep } from "node:path"
import {
  blockerTally,
  dedupeFindings,
  renderFindingsTable,
  renderTotalsTable,
  totalsBySlug,
} from "../src/lib/contrast-report"
import { evaluateNonText, evaluateText, isEmojiOnly } from "../src/lib/contrast"
import {
  collectContrast,
  collectHoverSelectors,
} from "./audit-contrast-collector"
import type { Collected } from "./audit-contrast-collector"
import type {
  DedupedFinding,
  Finding,
  Judgement,
  SlugTotals,
  Theme,
} from "../src/lib/contrast-report"
import type { Server, ServerResponse } from "node:http"
// Type-only: erased at runtime, so the deferred `import("playwright")` in
// `sweep` is still what actually loads the browser driver.
import type { BrowserContext, Page } from "playwright"

export interface SweepArgs {
  slug?: string
  widths: Array<number>
  theme: "light" | "dark" | "both"
  jsonOut?: string
  reportOut?: string
  online: boolean
  selfCheck: boolean
  /** Compare the sweep's totals against the recorded baseline. */
  checkBaseline: boolean
  verbose: boolean
}

export interface SweepOptions {
  slugs: Array<string>
  themes: Array<Theme>
  args: SweepArgs
  root: string
  writeOut: (path: string, contents: string) => void
}

// The viewport height is fixed rather than grown to fit each document. Growing
// it would make `vh` units and `@media (min-height)` resolve differently and
// measure a rendering nobody is served; the collector scrolls instead.
const VIEWPORT_HEIGHT = 800

// Switching `data-theme` starts every colour transition the preview declares,
// and `getComputedStyle` reports the INTERPOLATED value while one runs. Read a
// frame after the switch, samsung`s `.btn` — `transition: background 250ms,
// color 250ms` — still reports the light colours, in `oklab()` because that is
// how Chromium writes an interpolated colour. Measured before this: the whole
// dark sweep came back with light values, and the dark accent button reported
// its light ratio. Waiting out the transitions instead would cost a wait per
// page and still guess at the longest one.
const NO_TRANSITION = "*, *::before, *::after { transition: none !important; }"

// How much of a run the report shows. Applied after the emoji judgement, never
// before it.
const SAMPLE_LIMIT = 60

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".otf": "font/otf",
  ".ttf": "font/ttf",
}

export interface StaticServer {
  port: number
  close: () => Promise<void>
  /** Serve one extra document at `/__oracle/preview.html`. */
  setOracle: (html: string | null) => void
}

/**
 * Serve `public/` over loopback.
 *
 * A server rather than `file://` because the previews reference
 * `/preview/_runtime/tokens.css` and `/logos/...` as absolute paths, and
 * rather than `page.route` fulfilment because the hover pass reads
 * `document.styleSheets[].cssRules`, which needs the sheets to be same-origin.
 *
 * The oracle fixture is served from a virtual path instead of a temporary
 * directory for the same absolute-path reason, and instead of a directory under
 * `public/` because anything there ships with `pnpm build`.
 */
export async function serveStatic(publicDir: string): Promise<StaticServer> {
  let oracle: string | null = null
  const root = resolve(publicDir)
  const server: Server = createServer((req, res) => {
    // Everything below runs inside a request handler, where a throw is an
    // uncaught exception that ends the process. That would end the sweep with
    // no report and no JSON, and with an error naming a URL rather than the
    // slug being measured — so nothing here is allowed to escape.
    try {
      handle(req.url ?? "/", res)
    } catch (error) {
      res.statusCode = 500
      res.end(`server error: ${String(error)}`)
    }
  })

  function handle(rawUrl: string, res: ServerResponse): void {
    const url = rawUrl.split("?")[0]
    if (url === "/__oracle/preview.html") {
      if (oracle === null) {
        res.statusCode = 404
        res.end("no oracle loaded")
        return
      }
      res.setHeader("content-type", MIME[".html"])
      res.end(oracle)
      return
    }
    // A malformed percent escape — `/logos/100%.png` is enough — makes
    // `decodeURIComponent` throw. It is a request that cannot name a file, so
    // it is refused rather than guessed at.
    let decoded: string
    try {
      decoded = decodeURIComponent(url)
    } catch {
      res.statusCode = 400
      res.end("malformed request path")
      return
    }
    const target = resolve(join(root, normalize(decoded)))
    // Refuse a path that climbed out of `public/`. Nothing here should be able
    // to reach the repository, and the check is cheap.
    if (target !== root && !target.startsWith(root + sep)) {
      res.statusCode = 403
      res.end("outside public")
      return
    }
    if (!existsSync(target) || !statSync(target).isFile()) {
      res.statusCode = 404
      res.end("not found")
      return
    }
    res.setHeader(
      "content-type",
      MIME[extname(target)] ?? "application/octet-stream"
    )
    res.end(readFileSync(target))
  }

  await new Promise<void>((done) => server.listen(0, "127.0.0.1", () => done()))
  const address = server.address()
  if (address === null || typeof address === "string") {
    throw new Error("static server did not bind a port")
  }
  return {
    port: address.port,
    setOracle: (html) => {
      oracle = html
    },
    close: () =>
      new Promise<void>((done) => {
        server.close(() => done())
      }),
  }
}

/**
 * Findings the hover pass produced that the default pass did not already have.
 *
 * Forcing `:hover` re-measures the whole page, and almost every element is
 * unaffected. Keeping only what changed is what stops the report from carrying
 * a second copy of itself — and it doubles as the check that the forcing
 * worked at all: `CSS.forcePseudoState` does nothing, silently, when it is
 * handed a node id that no longer matches the document.
 */
export function hoverDelta(
  defaults: Array<Finding>,
  hovered: Array<Finding>
): Array<Finding> {
  // The key carries the verdict and its blockers, not just the ratio. Hover
  // can change what a reading MEANS without moving its number: toss hovers
  // every button with `filter: brightness(0.96)`, and a filter transforms the
  // painted pixels but not `color` or `background-color`, so the collector
  // reads the same ratio and flags the reading instead. On a ratio-only key
  // that flagged row looked unchanged and was dropped — the hover pass
  // reported nothing at all for the one preview that filters its hovers.
  //
  // It is NOT `contrast-report.ts`'s `keyOf`: that one carries the slug, theme
  // and state, and state is exactly what differs here — sharing it would call
  // every hover row new. What the two must agree on is which FIELDS make a
  // reading a different reading, and `threshold` is one of them: a `:hover`
  // rule that enlarges text past 18pt moves the bar from 4.5:1 to 3:1, and a
  // ratio that lands the same to three decimals on both sides would otherwise
  // look unchanged while the audit's question about it had changed. No preview
  // resizes text on hover today, so that one is latent. `opacityApprox` is
  // there for the same reason and is not latent: seven `:hover` rules in the
  // catalogue fade their element, and when the faded ratio lands the same to
  // three decimals that flag is all that is left to say the reading now rests
  // on an approximation.
  const keyOf = (f: Finding): string =>
    [
      f.path,
      f.kind,
      f.ratio.toFixed(3),
      f.threshold,
      f.verdict,
      [...f.blockers].sort().join("+"),
      f.opacityApprox ? "approx" : "",
    ].join("|")
  const seen = new Set(defaults.map(keyOf))
  return hovered.filter((f) => !seen.has(keyOf(f)))
}

/** Turn one page's raw collection into findings, with the judging done here. */
export function toFindings(
  collected: Collected,
  context: {
    slug: string
    theme: Theme
    width: number
    state: "default" | "hover"
  }
): Array<Finding> {
  const out: Array<Finding> = []
  for (const t of collected.text) {
    // Judged here, not in the collector: the collector cannot import, so a
    // test could never reach a predicate written inside it — and the first one
    // written there was wrong in a way nobody could see, swallowing every
    // digit-only run along with the emoji.
    //
    // On the WHOLE run, before truncation. Judging the 60-unit sample would
    // drop a run whose opening is a long enough stretch of emoji, which is the
    // same defect in a different place.
    if (isEmojiOnly(t.text)) continue
    const m = evaluateText({
      fontSizePx: t.fontSizePx,
      fontWeight: t.fontWeight,
      fg: t.fg,
      lines: t.lines,
      blockers: t.blockers,
    })
    out.push({
      ...context,
      kind: "text",
      path: t.path,
      sample: t.text.slice(0, SAMPLE_LIMIT),
      ratio: m.ratio,
      threshold: m.threshold,
      verdict: m.verdict,
      blockers: m.blockers,
      opacityApprox: m.opacityApprox,
      fg: m.fg,
      bg: m.bg,
    })
  }
  for (const n of collected.nonText) {
    const m = evaluateNonText({
      fill: n.fill,
      border: n.border,
      outer: n.outer,
      blockers: n.blockers,
    })
    if (m === null) continue
    out.push({
      ...context,
      kind: "non-text",
      path: n.path,
      sample: null,
      ratio: m.ratio,
      threshold: m.threshold,
      verdict: m.verdict,
      blockers: m.blockers,
      opacityApprox: m.opacityApprox,
      basis: m.basis,
      fg: m.fg,
      bg: m.bg,
    })
  }
  return out
}

/**
 * Force `:hover` on every element a hover rule targets. Returns how many.
 *
 * Playwright can hover one element at a time, which would mean a render per
 * hoverable element; CDP forces the state on many and leaves it forced, so one
 * re-collection sees all of them. The node ids come from a fresh
 * `DOM.getDocument` because the theme swap has already moved nodes around and
 * a stale id is accepted and then ignored.
 */
async function forceHover(
  context: BrowserContext,
  page: Page
): Promise<{ forced: number; release: () => Promise<void> }> {
  const noop = { forced: 0, release: async (): Promise<void> => {} }
  const selectors = await page.evaluate(collectHoverSelectors)
  if (selectors.length === 0) return noop
  const cdp = await context.newCDPSession(page)
  let forced = 0
  try {
    await cdp.send("DOM.enable")
    await cdp.send("CSS.enable")
    const { root } = await cdp.send("DOM.getDocument", { depth: -1 })
    for (const selector of selectors) {
      let nodeIds: Array<number> = []
      try {
        ;({ nodeIds } = await cdp.send("DOM.querySelectorAll", {
          nodeId: root.nodeId,
          selector,
        }))
      } catch {
        // A selector CDP will not parse — `:has()` and friends have been
        // rejected by older protocol builds. Skipping one loses that element's
        // hover state, not the pass.
        continue
      }
      for (const nodeId of nodeIds) {
        await cdp.send("CSS.forcePseudoState", {
          nodeId,
          forcedPseudoClasses: ["hover"],
        })
        forced += 1
      }
    }
  } catch (error) {
    await cdp.detach()
    throw error
  }
  // The session is deliberately left attached. Detaching drops every forced
  // pseudo-state with it, so closing here would put the page back to rest
  // before it could be re-measured — the hover pass would run, report that it
  // had forced hundreds of elements, and collect the resting values.
  return {
    forced,
    release: async () => {
      await cdp.detach()
    },
  }
}

/**
 * Measure one document in one theme, optionally with hover forced as well.
 *
 * Shared with `--self-check`, which runs the same steps against the pre-fix
 * samsung fixture. A separate copy for the oracle would be a check that the
 * copy works, not that the sweep does.
 */
export async function measureOne(
  context: BrowserContext,
  page: Page,
  url: string,
  context_: {
    slug: string
    theme: Theme
    width: number
    withHover: boolean
  }
): Promise<{ findings: Array<Finding>; collected: Collected; forced: number }> {
  await page.goto(url, { waitUntil: "load" })
  await page.addStyleTag({ content: NO_TRANSITION })
  await applyTheme(page, context_.theme)
  const collected = await page.evaluate(collectContrast)
  const { slug, theme, width } = context_
  const defaults = toFindings(collected, {
    slug,
    theme,
    width,
    state: "default",
  })
  const findings = [...defaults]
  let forced = 0
  if (context_.withHover) {
    const hover = await forceHover(context, page)
    forced = hover.forced
    try {
      if (forced > 0) {
        const after = await page.evaluate(collectContrast)
        findings.push(
          ...hoverDelta(
            defaults,
            toFindings(after, { slug, theme, width, state: "hover" })
          )
        )
      }
    } finally {
      await hover.release()
    }
  }
  return { findings, collected, forced }
}

/** What the sweep measured, folded once so every reader sees one answer. */
export interface SweepResult {
  findings: Array<Finding>
  deduped: Array<DedupedFinding>
  totals: Array<SlugTotals>
}

export async function sweep(opts: SweepOptions): Promise<SweepResult> {
  const { chromium } = await import("playwright")
  const server = await serveStatic(join(opts.root, "public"))
  const browser = await chromium.launch()
  const findings: Array<Finding> = []
  // Hover is swept at one width only. It costs a second full collection per
  // page, and a hover rule that changes colour only at some widths would be a
  // `@media` block wrapping a `:hover` rule — which no preview has. 976 is the
  // detail page's embed width, so it is the one to keep if it is being swept.
  const hoverWidth = opts.args.widths.includes(976) ? 976 : opts.args.widths[0]

  try {
    for (const width of opts.args.widths) {
      const context = await browser.newContext({
        viewport: { width, height: VIEWPORT_HEIGHT },
        // Deterministic where a preview asks to be: several animate `opacity`,
        // and a `prefers-reduced-motion` branch pins those demos to a fixed
        // frame.
        //
        // Only three of the twenty-one previews carry such a branch, so this
        // does NOT make the sweep deterministic on its own — measured, the one
        // reading that moves between runs is toss's `div.loader-3 > span.dot`,
        // whose `tds-pulse` keyframes nothing here responds to. The animations
        // are deliberately not paused: pinning them would make every run agree
        // on one frame forever, and a frame that happens to pass would hide a
        // defect for good. `NON_TEXT_SLACK` absorbs the movement instead.
        reducedMotion: "reduce",
      })
      // Fonts come from jsDelivr, so an offline or slow run would otherwise
      // measure a half-loaded page. Blocking is the default because colour,
      // font-size and weight all come from CSS and are unaffected; only line
      // breaking changes, which moves sample points but not the values.
      if (!opts.args.online) {
        await context.route("**/*", (route) => {
          const host = new URL(route.request().url()).hostname
          return host === "127.0.0.1" ? route.continue() : route.abort()
        })
      }
      // tsx transpiles with esbuild's `keepNames`, which wraps every function
      // declaration in a `__name(fn, "...")` call. `page.evaluate` ships the
      // collector to the browser as source text, and that helper does not go
      // with it — without this the first call dies with `__name is not
      // defined` inside the page. An identity function is all the helper does
      // that matters here.
      await context.addInitScript(() => {
        const g = globalThis as unknown as Record<string, unknown>
        if (g.__name === undefined) g.__name = (fn: unknown) => fn
      })
      const page = await context.newPage()
      for (const slug of opts.slugs) {
        for (const theme of opts.themes) {
          const measured = await measureOne(
            context,
            page,
            `http://127.0.0.1:${server.port}/preview/${slug}/preview.html`,
            { slug, theme, width, withHover: width === hoverWidth }
          )
          findings.push(...measured.findings)

          if (opts.args.verbose) {
            const hovered = measured.findings.filter(
              (f) => f.state === "hover"
            ).length
            console.log(
              `  ${slug} ${theme} @${width} — ${measured.collected.text.length} text, ` +
                `${measured.collected.nonText.length} non-text, ` +
                `${hovered} hover-changed, ` +
                `${measured.collected.overlayCandidates} overlay candidate(s)`
            )
          }
        }
      }
      await context.close()
    }
  } finally {
    await browser.close()
    await server.close()
  }

  const deduped = dedupeFindings(findings)
  const totals = totalsBySlug(deduped)
  report(findings, deduped, totals, opts)
  return { findings, deduped, totals }
}

/**
 * Switch the document to a theme the way the runtime does.
 *
 * `public/preview/_runtime/iframe.js` watches `data-theme` with a
 * MutationObserver and swaps the `<template data-theme-variant="dark">` markup
 * when it changes, so setting the attribute is the whole switch. The observer
 * runs as a microtask, so the collector must not read the page in the same
 * evaluate that writes the attribute — the swap would not have happened yet.
 */
async function applyTheme(
  page: { evaluate: <T>(fn: (arg: T) => unknown, arg: T) => Promise<unknown> },
  theme: Theme
): Promise<void> {
  await page.evaluate((value: string) => {
    document.documentElement.setAttribute("data-theme", value)
  }, theme)
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(done)),
    undefined
  )
}

// The folding happens once, in `sweep`, and both the printed table and the
// baseline comparison are made from that one result. Folding again here would
// let the table a reader is shown and the table the gate judges disagree.
function report(
  findings: Array<Finding>,
  deduped: Array<DedupedFinding>,
  totals: Array<SlugTotals>,
  opts: SweepOptions
): void {
  const tally = blockerTally(deduped)
  const notable = deduped.filter((f) => f.verdict !== "pass")

  console.log(`\n${renderTotalsTable(totals)}\n`)
  const countOf = (verdict: Judgement): number =>
    deduped.filter((f) => f.verdict === verdict).length
  console.log(
    `${deduped.length} measured row(s) — ` +
      `${countOf("fail")} fail, ${countOf("borderline")} borderline, ` +
      `${countOf("indeterminate")} held, ${countOf("pass")} pass`
  )
  if (tally.length > 0) {
    console.log(
      `held for: ${tally.map((t) => `${t.blocker} ${t.count}`).join(", ")}`
    )
  }

  if (opts.args.reportOut !== undefined) {
    opts.writeOut(
      opts.args.reportOut,
      [
        renderTotalsTable(totals),
        "",
        renderFindingsTable(notable, opts.args.widths),
        "",
      ].join("\n")
    )
  }
  if (opts.args.jsonOut !== undefined) {
    opts.writeOut(opts.args.jsonOut, JSON.stringify(findings, null, 2))
  }
}
