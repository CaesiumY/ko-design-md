// Do two versions of a preview render the same? (`pnpm preview:dom-diff`)
//
// TRANSITIONAL. This tool exists for the preview-standard migration (spec
// #724): walking the dark copies out of the previews, then moving them onto the
// shared frame, are both edits that must not change what a visitor sees, and
// reading two stylesheets side by side cannot show that — a rule that looks
// redundant can be the one holding a dark rendering in place. It goes when the
// frame migration ends.
//
// Each side is one HTML file, served at the contrast harness's virtual path on
// top of a `public/` tree (so `/preview/_runtime/*` and `/logos/*` resolve),
// from a loopback server on a random port — no dev server, and no port to
// collide on when several worktrees run this at once.
//
// What is compared, element by element in document order:
//   - the element itself (tag, id, classes) and its own text
//   - its box (page coordinates, half a pixel of tolerance)
//   - a fixed list of computed style properties, plus ::before and ::after
// in light and dark at 375 / 768 / 976 / 1440, and once more per theme, at one
// width, with :hover, :active and :focus(-visible) forced. A forced state
// lands on one node and does not reach its ancestors the way a pointer does,
// so the element forced is the one a stylesheet rule writes the pseudo-class
// on: the row for `.tbl tr:hover td`, not the cell (`stateTargetSelectors`).
// A last pass without reduced motion compares the declared transitions and
// animations, and nothing else: with motion running a box is wherever its
// animation has taken it, which differs between two captures of one file.
//
// What "no difference" does NOT cover:
//   - properties outside the lists below
//   - pseudo-elements other than ::before and ::after — ::placeholder,
//     ::selection, ::marker
//   - forced states at more than one width, and any state that is not hover,
//     active or focus (:checked, :disabled and [aria-*] are compared only as
//     the document ships them)
//   - a state written inside :has() or :not() — `.chip:has(input:focus-visible)`
//     forces the chip, and the input inside it is what would have to be
//     focused, so the rule never applies on either side. Of the 420 state
//     selectors the catalogue shipped when this was written, 13 are this shape,
//     all `:has(input:focus-visible)` in nol and zigbang
//   - a state on no named element (`:focus-visible` alone, `.menu :hover`):
//     nothing is forced for it, so it shows only on elements another rule had
//     forced. One such selector shipped, gs-retail's focus ring
//   - where an element sits while it animates (see the last pass above)
//   - anything a script does after a click: the pages are read, not operated
//   - fonts: outside requests are blocked, so both sides fall back alike
//
//   pnpm preview:dom-diff --a <html> --b <html>
//     [--public-a <dir>] [--public-b <dir>]
//     [--widths 375,768,976,1440] [--max 25] [--no-states]
//   pnpm preview:dom-diff --self-check
//
// Exit 0: no difference (or the self-check passed). Exit 3: differences,
// printed. Exit 1: the tool itself is broken — the self-check failed, or the
// run crashed. Exit 2: bad arguments. The same split `scripts/audit-contrast.ts`
// makes, so a log tells "the previews differ" from "the comparison no longer
// works".

import { existsSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  compareDomPasses,
  selfCheckProblems,
  stateTargetSelectors,
} from "../src/lib/preview-dom-diff"
import {
  hoverWidthOf,
  newMeasuringContext,
  serveStatic,
} from "./audit-contrast-sweep"
import type { Browser, BrowserContext, Page } from "playwright"
import type {
  DomDiff,
  DomPasses,
  DomRow,
  PlantedDifference,
} from "../src/lib/preview-dom-diff"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const ORACLE_PATH = "/__oracle/preview.html"

const EXIT_DIFFERENT = 3
const EXIT_BROKEN = 1
const EXIT_USAGE = 2

const DEFAULT_WIDTHS = [375, 768, 976, 1440]
const THEMES = ["light", "dark"]

const STYLE_PROPS = [
  "display",
  "position",
  "visibility",
  "opacity",
  "color",
  "background-color",
  "background-image",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
  "box-shadow",
  "outline-color",
  "outline-style",
  "outline-width",
  "outline-offset",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-transform",
  "text-align",
  "text-decoration-line",
  "text-decoration-color",
  "white-space",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "row-gap",
  "column-gap",
  "flex-direction",
  "flex-wrap",
  "justify-content",
  "align-items",
  "grid-template-columns",
  "overflow-x",
  "overflow-y",
  "transform",
  "filter",
  "backdrop-filter",
  "fill",
  "stroke",
  "cursor",
  "z-index",
  "caret-color",
  "accent-color",
]

const MOTION_PROPS = [
  "transition-property",
  "transition-duration",
  "transition-timing-function",
  "transition-delay",
  "animation-name",
  "animation-duration",
  "animation-timing-function",
  "animation-iteration-count",
]

const PSEUDO_PROPS = [
  "content",
  "display",
  "color",
  "background-color",
  "background-image",
  "width",
  "height",
  "border-top-color",
  "border-top-width",
  "box-shadow",
  "opacity",
  "transform",
]

const STATES: Array<{ name: string; forced: Array<string> }> = [
  { name: "hover", forced: ["hover"] },
  { name: "active", forced: ["active"] },
  { name: "focus", forced: ["focus", "focus-visible"] },
]

interface CaptureOptions {
  widths: Array<number>
  states: boolean
}

interface Args extends CaptureOptions {
  a: string
  b: string
  publicA: string
  publicB: string
  max: number
}

const USAGE =
  "usage: pnpm preview:dom-diff --a <html> --b <html> [--public-a <dir>] [--public-b <dir>] [--widths 375,768,976,1440] [--max 25] [--no-states]\n" +
  "       pnpm preview:dom-diff --self-check"

function usageError(message: string): never {
  console.error(`preview:dom-diff: ${message}\n${USAGE}`)
  process.exit(EXIT_USAGE)
}

function parseArgs(argv: Array<string>): Args {
  const get = (flag: string): string | undefined => {
    const at = argv.indexOf(flag)
    return at === -1 ? undefined : argv[at + 1]
  }
  const a = get("--a")
  const b = get("--b")
  if (a === undefined || b === undefined) {
    usageError("--a and --b are both required")
  }
  const widths = (get("--widths") ?? DEFAULT_WIDTHS.join(","))
    .split(",")
    .map(Number)
  if (
    widths.length === 0 ||
    widths.some((w) => !Number.isInteger(w) || w <= 0)
  ) {
    usageError("--widths takes positive whole numbers, comma-separated")
  }
  const max = Number(get("--max") ?? "25")
  if (!Number.isInteger(max) || max <= 0) {
    usageError("--max takes a positive whole number")
  }
  const args: Args = {
    a: resolve(a),
    b: resolve(b),
    publicA: resolve(get("--public-a") ?? join(ROOT, "public")),
    publicB: resolve(get("--public-b") ?? join(ROOT, "public")),
    widths,
    max,
    states: !argv.includes("--no-states"),
  }
  for (const path of [args.a, args.b, args.publicA, args.publicB]) {
    if (!existsSync(path)) usageError(`no such path: ${path}`)
  }
  return args
}

/**
 * Runs in the page. Every element under <body>, in document order. `box: false`
 * leaves the boxes out (all zero) — for the pass that reads the page while its
 * animations run, where a box is wherever the animation happens to be.
 */
function collectRows(input: {
  props: Array<string>
  pseudoProps: Array<string>
  box: boolean
}): Array<DomRow> {
  const rows: Array<DomRow> = []
  const skip = new Set(["TEMPLATE", "SCRIPT", "STYLE"])
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT
  )
  let node: Node | null = document.body
  while (node !== null) {
    const el = node as Element
    if (!skip.has(el.tagName)) {
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      let text = ""
      el.childNodes.forEach((child) => {
        if (child.nodeType === 3) text += child.nodeValue ?? ""
      })
      const style: Record<string, string> = {}
      for (const p of input.props) style[p] = cs.getPropertyValue(p)
      for (const pseudo of ["::before", "::after"]) {
        const ps = getComputedStyle(el, pseudo)
        const content = ps.getPropertyValue("content")
        if (content === "none" || content === "normal" || content === "") {
          continue
        }
        for (const p of input.pseudoProps) {
          style[`${pseudo} ${p}`] = ps.getPropertyValue(p)
        }
      }
      // `className` is an SVGAnimatedString on an SVG element, so the attribute
      // is read instead.
      const classes = (el.getAttribute("class") ?? "").trim()
      rows.push({
        who:
          el.tagName.toLowerCase() +
          (el.id ? `#${el.id}` : "") +
          (classes === "" ? "" : `.${classes.split(/\s+/).join(".")}`),
        text: text.replace(/\s+/g, " ").trim(),
        rect: input.box
          ? [r.x + window.scrollX, r.y + window.scrollY, r.width, r.height].map(
              (v) => Math.round(v * 2) / 2
            )
          : [0, 0, 0, 0],
        style,
      })
    }
    node = walker.nextNode()
  }
  return rows
}

/** Runs in the page. The selector of every style rule the page's sheets hold. */
function readRuleSelectors(): Array<string> {
  const out: Array<string> = []
  const visit = (rules: CSSRuleList): void => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) out.push(rule.selectorText)
      else if (rule instanceof CSSGroupingRule) visit(rule.cssRules)
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules)
    } catch {
      // A cross-origin sheet (the font import) is not readable, and not ours.
    }
  }
  return out
}

/**
 * Runs in the page. Marks every element the given selectors find, and returns
 * how many — the count goes into the pass label, so two sides that force a
 * different number of elements do not compare as the same pass.
 */
function markElements(selectors: Array<string>): number {
  const seen = new Set<Element>()
  for (const selector of selectors) {
    try {
      document.querySelectorAll(selector).forEach((el) => seen.add(el))
    } catch {
      // A selector the stripping broke names nothing.
    }
  }
  let n = 0
  seen.forEach((el) => {
    el.setAttribute("data-dd-force", String(n++))
  })
  return n
}

/**
 * Mark the elements the forced passes put into a state: the ones a :hover /
 * :active / :focus rule hangs its state on, which `stateTargetSelectors` reads
 * out of each selector — the `tr` of `tr:hover td`, not the `td`.
 */
async function markStateTargets(page: Page): Promise<number> {
  const targets = new Set<string>()
  for (const selectorText of await page.evaluate(readRuleSelectors)) {
    for (const target of stateTargetSelectors(selectorText)) targets.add(target)
  }
  return page.evaluate(markElements, [...targets])
}

async function settle(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((done) =>
        requestAnimationFrame(() => requestAnimationFrame(() => done()))
      )
  )
  await page.waitForTimeout(60)
}

async function setTheme(page: Page, theme: string): Promise<void> {
  await page.evaluate((value: string) => {
    document.documentElement.setAttribute("data-theme", value)
  }, theme)
  await settle(page)
}

async function forcedPass(
  context: BrowserContext,
  page: Page,
  forced: Array<string>
): Promise<Array<DomRow>> {
  const cdp = await context.newCDPSession(page)
  try {
    await cdp.send("DOM.enable")
    await cdp.send("CSS.enable")
    const { root } = await cdp.send("DOM.getDocument", { depth: 0 })
    const { nodeIds } = await cdp.send("DOM.querySelectorAll", {
      nodeId: root.nodeId,
      selector: "[data-dd-force]",
    })
    for (const nodeId of nodeIds) {
      await cdp.send("CSS.forcePseudoState", {
        nodeId,
        forcedPseudoClasses: forced,
      })
    }
    await settle(page)
    const rows = await page.evaluate(collectRows, {
      props: STYLE_PROPS,
      pseudoProps: PSEUDO_PROPS,
      box: true,
    })
    for (const nodeId of nodeIds) {
      await cdp.send("CSS.forcePseudoState", {
        nodeId,
        forcedPseudoClasses: [],
      })
    }
    return rows
  } finally {
    await cdp.detach()
  }
}

/** One side: every pass, keyed by the label the report prints. */
async function capture(
  browser: Browser,
  url: string,
  options: CaptureOptions
): Promise<DomPasses> {
  const out: DomPasses = new Map()
  const stateWidth = hoverWidthOf(options.widths)

  for (const width of options.widths) {
    const context = await newMeasuringContext(browser, { width, online: false })
    const page = await context.newPage()
    await page.goto(url, { waitUntil: "load" })
    for (const theme of THEMES) {
      await setTheme(page, theme)
      out.set(
        `${theme} @${width}`,
        await page.evaluate(collectRows, {
          props: STYLE_PROPS,
          pseudoProps: PSEUDO_PROPS,
          box: true,
        })
      )
      if (options.states && width === stateWidth) {
        const marked = await markStateTargets(page)
        for (const state of STATES) {
          out.set(
            `${theme} @${width} :${state.name} (${marked} forced)`,
            await forcedPass(context, page, state.forced)
          )
        }
      }
    }
    await context.close()
  }

  // Declared motion, read where reduced motion has not flattened it. The
  // measuring context asks for reduced motion, so this one is built by hand;
  // it blocks outside requests and carries the `__name` shim the same way.
  const motion = await browser.newContext({
    viewport: { width: stateWidth, height: 900 },
    reducedMotion: "no-preference",
  })
  await motion.route("**/*", (route) => {
    const host = new URL(route.request().url()).hostname
    return host === "127.0.0.1" ? route.continue() : route.abort()
  })
  await motion.addInitScript(() => {
    const g = globalThis as unknown as Record<string, unknown>
    if (g.__name === undefined) g.__name = (fn: unknown) => fn
  })
  const page = await motion.newPage()
  await page.goto(url, { waitUntil: "load" })
  for (const theme of THEMES) {
    await setTheme(page, theme)
    out.set(
      `${theme} @${stateWidth} motion`,
      await page.evaluate(collectRows, {
        props: MOTION_PROPS,
        pseudoProps: [],
        // The animations are running here, so a box is a moment, not a fact.
        box: false,
      })
    )
  }
  await motion.close()
  return out
}

// ── self-check ───────────────────────────────────────────────────────────────

/**
 * The two dark `:hover` colours the self-check's second document changes: one
 * on a rule whose state sits on the element it styles (`.btn:hover`), one on a
 * rule whose state sits on an ancestor (`.card:hover .label`). They are two
 * shapes because the tool reaches them by different elements, and it was blind
 * to the second while it still saw the first.
 */
interface SelfCheckColours {
  own: string
  ancestor: string
}
const SELF_CHECK_SHIPPED: SelfCheckColours = {
  own: "rgb(119, 170, 255)",
  ancestor: "rgb(40, 50, 60)",
}
const SELF_CHECK_CHANGED: SelfCheckColours = {
  own: "rgb(153, 204, 255)",
  ancestor: "rgb(70, 60, 50)",
}

/**
 * A page small enough to read in full, shaped like a merged preview: the page's
 * own sheet, then the dark sheet. The two dark hover colours are the only
 * things the second document changes.
 */
function selfCheckDocument(dark: SelfCheckColours): string {
  return [
    "<!doctype html>",
    '<html lang="ko" data-theme="light">',
    "<head>",
    '<meta charset="utf-8">',
    "<style>",
    ":root { --bg: rgb(255, 255, 255); --fg: rgb(17, 17, 17); }",
    "body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.5 sans-serif; }",
    ".card { padding: 16px; }",
    ".card:hover .label { background: rgb(238, 238, 238); }",
    ".btn { padding: 8px 12px; border: 0; background: rgb(51, 102, 204); color: rgb(255, 255, 255); }",
    ".btn:hover { background: rgb(34, 85, 170); }",
    // Something that moves, because the previews have spinners and progress
    // bars: a pass that reads a moving box reads a different one each time.
    "@keyframes dd-slide { from { margin-left: 0; } to { margin-left: 240px; } }",
    ".slide { display: block; width: 16px; height: 16px; animation: dd-slide 0.37s linear infinite alternate; }",
    "@media (prefers-reduced-motion: reduce) { .slide { animation: none; } }",
    "</style>",
    "<style>",
    '[data-theme="dark"] { --bg: rgb(17, 17, 17); --fg: rgb(238, 238, 238); }',
    // A background, not `color`: a colour change reaches every property that
    // reads `currentColor`, and the check asks for the planted property alone.
    `[data-theme="dark"] .card:hover .label { background: ${dark.ancestor}; }`,
    `[data-theme="dark"] .btn:hover { background: ${dark.own}; }`,
    "</style>",
    "</head>",
    '<body><main><div class="card"><p class="label">화면 비교 자기 확인</p><button class="btn">확인</button><i class="slide"></i></div></main></body>',
    "</html>",
  ].join("\n")
}

const SELF_CHECK_PASS = `dark @${hoverWidthOf(DEFAULT_WIDTHS)} :hover`
const SELF_CHECK_PLANTED: Array<PlantedDifference> = [
  { pass: SELF_CHECK_PASS, who: "button.btn", what: "background-color" },
  { pass: SELF_CHECK_PASS, who: "p.label", what: "background-color" },
]

/**
 * Does the tool still see? A document against a second capture of itself must
 * show nothing; against a copy with the two dark `:hover` rules changed, those
 * two differences and no other.
 */
async function selfCheck(browser: Browser): Promise<Array<string>> {
  const server = await serveStatic(join(ROOT, "public"))
  const url = `http://127.0.0.1:${server.port}${ORACLE_PATH}`
  const options: CaptureOptions = { widths: DEFAULT_WIDTHS, states: true }
  try {
    server.setOracle(selfCheckDocument(SELF_CHECK_SHIPPED))
    const first = await capture(browser, url, options)
    const again = await capture(browser, url, options)
    server.setOracle(selfCheckDocument(SELF_CHECK_CHANGED))
    const changed = await capture(browser, url, options)
    return selfCheckProblems(
      compareDomPasses(first, again),
      compareDomPasses(first, changed),
      SELF_CHECK_PLANTED
    )
  } finally {
    await server.close()
  }
}

// ── report ───────────────────────────────────────────────────────────────────

function report(args: Args, a: DomPasses, diffs: Array<DomDiff>): void {
  const elements = a.get(`light @${args.widths[0]}`)?.length ?? 0
  console.log(
    `preview:dom-diff: ${a.size} pass(es), ${elements} element(s) per pass`
  )
  console.log(`  a = ${args.a}`)
  console.log(`  b = ${args.b}`)
  if (diffs.length === 0) {
    console.log("SAME: no difference in any pass.")
    return
  }
  const byPass = new Map<string, number>()
  for (const d of diffs) byPass.set(d.pass, (byPass.get(d.pass) ?? 0) + 1)
  console.log(
    `DIFFERENT: ${diffs.length} difference(s) in ${byPass.size} pass(es).`
  )
  for (const [pass, count] of byPass) console.log(`  ${count}\t${pass}`)
  console.log("")
  for (const d of diffs.slice(0, args.max)) {
    console.log(`[${d.pass}] #${d.index} ${d.who}`)
    console.log(`    ${d.what}: ${d.a}  →  ${d.b}`)
  }
  if (diffs.length > args.max) {
    console.log(`… ${diffs.length - args.max} more (raise --max).`)
  }
}

async function launch(): Promise<Browser> {
  const { chromium } = await import("playwright")
  try {
    return await chromium.launch()
  } catch (error) {
    console.error(
      "preview:dom-diff: Chromium did not start. Run `pnpm exec playwright install chromium` first."
    )
    throw error
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2)
  if (argv.includes("--self-check")) {
    const browser = await launch()
    let problems: Array<string>
    try {
      problems = await selfCheck(browser)
    } finally {
      await browser.close()
    }
    if (problems.length === 0) {
      console.log(
        "preview:dom-diff self-check: a document matches itself, and two changed dark :hover rules — one on the element, one on an ancestor — show up as exactly those."
      )
      return
    }
    console.error("preview:dom-diff self-check FAILED — the tool is broken:")
    for (const problem of problems) console.error(`  - ${problem}`)
    process.exitCode = EXIT_BROKEN
    return
  }

  const args = parseArgs(argv)
  const browser = await launch()
  const serverA = await serveStatic(args.publicA)
  const serverB = await serveStatic(args.publicB)
  serverA.setOracle(readFileSync(args.a, "utf8"))
  serverB.setOracle(readFileSync(args.b, "utf8"))
  try {
    const a = await capture(
      browser,
      `http://127.0.0.1:${serverA.port}${ORACLE_PATH}`,
      args
    )
    const b = await capture(
      browser,
      `http://127.0.0.1:${serverB.port}${ORACLE_PATH}`,
      args
    )
    const diffs = compareDomPasses(a, b)
    report(args, a, diffs)
    if (diffs.length > 0) process.exitCode = EXIT_DIFFERENT
  } finally {
    await browser.close()
    await serverA.close()
    await serverB.close()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(EXIT_BROKEN)
})
