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
// width, with :hover, :active and :focus forced — the last together with
// :focus-visible and :focus-within, which a real focus brings and a forced one
// does not (`FORCED_STATES`). A forced state
// lands on one node and does not reach its ancestors the way a pointer does,
// so the element forced is the one a stylesheet rule writes the pseudo-class
// on: the row for `.tbl tr:hover td`, not the cell (`stateTargetSelectors`).
// The pointer is taken off the page first, so no pass carries a hover that
// was not forced (`openPage`).
// A last pass without reduced motion compares the declared transitions and
// animations, of the element and of its ::before and ::after, and nothing
// else: with motion running a box is wherever its animation has taken it,
// which differs between two captures of one file.
//
// What "no difference" does NOT cover:
//   - properties outside the lists below. The lists were filled from what the
//     dark sheets of the previews still to be walked write (`STYLE_PROPS`), so
//     a property a preview starts to use later is not compared until it is
//     put there. Not there on purpose: the `src` and `font-display` of an
//     `@font-face` (see fonts, below), `-webkit-overflow-scrolling`, which
//     Chromium does not implement, and the longhands a shorthand resets
//     without a preview ever writing them (`font-stretch` under `font`)
//   - pseudo-elements other than ::before and ::after — ::placeholder,
//     ::selection, ::marker
//   - forced states at more than one width, and any state that is not hover,
//     active or focus (:checked, :disabled and [aria-*] are compared only as
//     the document ships them)
//   - a state written inside :has() or :not() — `.chip:has(input:focus-visible)`
//     forces the chip, and the input inside it is what would have to be
//     focused, so the rule never applies on either side. The focus rings some
//     previews hang on a label around a hidden input are written this way
//   - a state on no named element (`:focus-visible` alone, `.menu :hover`):
//     nothing is forced for it, so it shows only on elements another rule had
//     forced
//   - a state written in a rule nested inside another (`.card { &:hover { … } }`):
//     only the selectors of top-level rules and of rules under an at-rule are
//     read (`readRuleSelectors`), so nothing is forced for the nested one
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
  FORCED_STATES,
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
  // What the dark sheets still to be walked write and nothing above shows: a
  // change in one of these moves no box and no colour that is compared.
  "background-size",
  "background-position",
  "background-repeat",
  "background-clip",
  "-webkit-text-fill-color",
  "text-decoration-thickness",
  "text-underline-offset",
  "text-overflow",
  "overflow-wrap",
  "word-break",
  "-webkit-line-clamp",
  "-webkit-box-orient",
  "font-variant-numeric",
  "font-feature-settings",
  "-webkit-font-smoothing",
  "object-fit",
  "border-collapse",
  "list-style-type",
  "list-style-position",
  "list-style-image",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "vector-effect",
  "clip-path",
  "pointer-events",
  "user-select",
  "appearance",
  "resize",
  "scrollbar-width",
  "color-scheme",
  "scroll-margin-top",
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
  "animation-delay",
  "animation-direction",
  "animation-fill-mode",
  "animation-play-state",
]

// A pseudo-element has no box of its own to measure, so where it sits and how
// large it is are read as properties, next to everything an element is read
// for. One list rather than a shorter one of its own: the shorter one had left
// out the corner radius, the clip and the offsets of the very thumbs and ticks
// the previews draw with ::before.
const PSEUDO_PROPS = [
  "content",
  "width",
  "height",
  "top",
  "right",
  "bottom",
  "left",
  ...STYLE_PROPS,
]

interface CaptureOptions {
  widths: Array<number>
  states: boolean
  /**
   * Start every page with the pointer resting on it. The self-check sets this:
   * a Linux runner's fresh page has the pointer at the top-left corner and a
   * Windows one has it nowhere, so without it the check for a leaking hover
   * would only run where CI is.
   */
  pointerOnPage?: boolean
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
 *
 * The marks of an earlier call come off first. A page is marked once per
 * theme, and an element only the other theme's selectors found
 * (`[data-theme="light"] .a:hover`) would otherwise stay marked and be forced
 * beyond the count the label gives.
 */
function markElements(selectors: Array<string>): number {
  document.querySelectorAll("[data-dd-force]").forEach((el) => {
    el.removeAttribute("data-dd-force")
  })
  const seen = new Set<Element>()
  for (const selector of selectors) {
    try {
      document.querySelectorAll(selector).forEach((el) => seen.add(el))
    } catch {
      // A selector the browser cannot read names nothing.
    }
  }
  let n = 0
  seen.forEach((el) => {
    el.setAttribute("data-dd-force", String(n++))
  })
  return n
}

/**
 * Mark the elements the forced passes put into a state: the ones a rule hangs
 * one of the `FORCED_STATES` on, which `stateTargetSelectors` reads out of
 * each selector — the `tr` of `tr:hover td`, not the `td`.
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

/**
 * Open the document with the pointer off it.
 *
 * A page is rendered under a pointer whether or not anyone moved one. On a
 * Linux runner it rests at the top-left corner, and whatever sits there — and
 * every ancestor — is hovered for real in every pass, the ones that force
 * nothing included. A changed `:hover` rule then shows up in passes that are
 * not about hover, and only on the machines where CI runs. So the pointer is
 * put where no element is, and a page that still reports a hovered element
 * afterwards is the tool failing, said as that rather than left to surface as
 * differences nobody planted.
 */
async function openPage(
  context: BrowserContext,
  url: string,
  options: CaptureOptions
): Promise<Page> {
  const page = await context.newPage()
  await page.goto(url, { waitUntil: "load" })
  if (options.pointerOnPage) await page.mouse.move(1, 1)
  await page.mouse.move(-10, -10)
  await settle(page)
  const hovered = await page.evaluate(
    () => document.querySelectorAll(":hover").length
  )
  if (hovered > 0) {
    throw new Error(
      `the pointer could not be taken off the page: ${hovered} element(s) are still hovered before any state was forced`
    )
  }
  return page
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
    const page = await openPage(context, url, options)
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
        for (const state of FORCED_STATES) {
          out.set(
            `${theme} @${width} :${state.name} (${marked} forced)`,
            await forcedPass(context, page, [...state.forced])
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
  const page = await openPage(motion, url, options)
  for (const theme of THEMES) {
    await setTheme(page, theme)
    out.set(
      `${theme} @${stateWidth} motion`,
      await page.evaluate(collectRows, {
        props: MOTION_PROPS,
        // A thumb drawn with ::before carries the transition that moves it.
        pseudoProps: MOTION_PROPS,
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
 * The dark state colours the self-check's second document changes: a `:hover`
 * rule whose state sits on the element it styles (`.btn:hover`), one whose
 * state sits on an ancestor (`.card:hover .label`), and a `:focus-within` rule
 * (`.field:focus-within`). They are separate shapes because the tool reaches
 * each a different way — by a different element, or by a state that has to be
 * forced under its own name — and it was blind to one while it still saw the
 * others.
 */
interface SelfCheckColours {
  own: string
  ancestor: string
  within: string
}
const SELF_CHECK_SHIPPED: SelfCheckColours = {
  own: "rgb(119, 170, 255)",
  ancestor: "rgb(40, 50, 60)",
  within: "rgb(30, 40, 30)",
}
const SELF_CHECK_CHANGED: SelfCheckColours = {
  own: "rgb(153, 204, 255)",
  ancestor: "rgb(70, 60, 50)",
  within: "rgb(60, 30, 60)",
}

/**
 * A page small enough to read in full, shaped like a merged preview: the page's
 * own sheet, then the dark sheet. The dark state colours are the only things
 * the second document changes.
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
    ".field { display: block; padding: 4px; }",
    ".field:focus-within { background: rgb(238, 244, 238); }",
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
    `[data-theme="dark"] .field:focus-within { background: ${dark.within}; }`,
    "</style>",
    "</head>",
    '<body><main><div class="card"><p class="label">화면 비교 자기 확인</p><button class="btn">확인</button><label class="field">이름 <input class="in"></label><i class="slide"></i></div></main></body>',
    "</html>",
  ].join("\n")
}

const SELF_CHECK_DARK = `dark @${hoverWidthOf(DEFAULT_WIDTHS)}`
const SELF_CHECK_PLANTED: Array<PlantedDifference> = [
  {
    pass: `${SELF_CHECK_DARK} :hover`,
    who: "button.btn",
    what: "background-color",
  },
  {
    pass: `${SELF_CHECK_DARK} :hover`,
    who: "p.label",
    what: "background-color",
  },
  {
    pass: `${SELF_CHECK_DARK} :focus`,
    who: "label.field",
    what: "background-color",
  },
]

/**
 * Does the tool still see? A document against a second capture of itself must
 * show nothing; against a copy with the dark state rules changed, those
 * differences and no other.
 */
async function selfCheck(browser: Browser): Promise<Array<string>> {
  const server = await serveStatic(join(ROOT, "public"))
  const url = `http://127.0.0.1:${server.port}${ORACLE_PATH}`
  const options: CaptureOptions = {
    widths: DEFAULT_WIDTHS,
    states: true,
    pointerOnPage: true,
  }
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
        "preview:dom-diff self-check: a document matches itself, and the changed dark state rules — :hover on the element, :hover on an ancestor, :focus-within — show up as exactly those."
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
