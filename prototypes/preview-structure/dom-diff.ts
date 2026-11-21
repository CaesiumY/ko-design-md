// PROTOTYPE — throwaway code. Answers one question: do two preview documents
// render the same?
//
// Each side is one HTML file, served at the contrast harness's virtual path on
// top of a `public/` tree (so `/preview/_runtime/*` and `/logos/*` resolve),
// from a loopback server on a random port — no dev server, no port to collide
// on when several worktrees run this at once.
//
// What is compared, element by element in document order:
//   - the element itself (tag, id, classes) and its own text
//   - its box (page coordinates, half-pixel tolerance)
//   - a fixed list of computed style properties, plus ::before / ::after
// in light and dark at 375 / 768 / 976 / 1440, and once more per theme with
// :hover, :active and :focus(-visible) forced on every element a stylesheet
// rule names with one of those pseudo-classes. A last pass without
// reduced-motion compares the declared transitions and animations.
//
//   pnpm exec tsx prototypes/preview-structure/dom-diff.ts \
//     --a <html> --b <html> [--public-a <dir>] [--public-b <dir>]
//     [--widths 375,768,976,1440] [--max 25] [--no-states]
//
// Exit 0: no difference. Exit 1: differences (printed). Exit 2: bad arguments.

import { existsSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  newMeasuringContext,
  serveStatic,
} from "../../scripts/audit-contrast-sweep"
import type { Browser, BrowserContext, Page } from "playwright"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

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

interface Row {
  who: string
  text: string
  rect: Array<number>
  style: Record<string, string>
}

interface Args {
  a: string
  b: string
  publicA: string
  publicB: string
  widths: Array<number>
  max: number
  states: boolean
}

function parseArgs(argv: Array<string>): Args {
  const get = (flag: string): string | undefined => {
    const at = argv.indexOf(flag)
    return at === -1 ? undefined : argv[at + 1]
  }
  const a = get("--a")
  const b = get("--b")
  if (a === undefined || b === undefined) {
    console.error(
      "usage: dom-diff.ts --a <html> --b <html> [--public-a <dir>] [--public-b <dir>] [--widths 375,768,976,1440] [--max 25] [--no-states]"
    )
    process.exit(2)
  }
  const args: Args = {
    a: resolve(a),
    b: resolve(b),
    publicA: resolve(get("--public-a") ?? join(ROOT, "public")),
    publicB: resolve(get("--public-b") ?? join(ROOT, "public")),
    widths: (get("--widths") ?? "375,768,976,1440").split(",").map(Number),
    max: Number(get("--max") ?? "25"),
    states: !argv.includes("--no-states"),
  }
  for (const path of [args.a, args.b, args.publicA, args.publicB]) {
    if (!existsSync(path)) {
      console.error(`dom-diff: no such path: ${path}`)
      process.exit(2)
    }
  }
  return args
}

/** Runs in the page. Every element under <body>, in document order. */
function collectRows(input: {
  props: Array<string>
  pseudoProps: Array<string>
}): Array<Row> {
  const rows: Array<Row> = []
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
      const cls =
        typeof el.className === "string" && el.className.trim() !== ""
          ? "." + el.className.trim().split(/\s+/).join(".")
          : ""
      rows.push({
        who: el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + cls,
        text: text.replace(/\s+/g, " ").trim(),
        rect: [
          r.x + window.scrollX,
          r.y + window.scrollY,
          r.width,
          r.height,
        ].map((v) => Math.round(v * 2) / 2),
        style,
      })
    }
    node = walker.nextNode()
  }
  return rows
}

/** Runs in the page. Marks every element a :hover/:active/:focus rule names. */
function markStateTargets(): number {
  const strip = /:(hover|active|focus-visible|focus-within|focus)\b/g
  const seen = new Set<Element>()
  const visit = (rules: CSSRuleList): void => {
    for (const rule of Array.from(rules)) {
      const nested = (rule as CSSGroupingRule).cssRules
      const selector = (rule as CSSStyleRule).selectorText
      if (typeof selector === "string") {
        for (const part of selector.split(",")) {
          if (!strip.test(part)) continue
          strip.lastIndex = 0
          // `.thumb:hover::before` names the element `.thumb`; a selector that
          // still ends in a pseudo-element matches nothing in querySelectorAll.
          const base = part
            .replace(strip, "")
            .replace(/::[a-z-]+/g, "")
            .trim()
          strip.lastIndex = 0
          if (base === "") continue
          try {
            document.querySelectorAll(base).forEach((el) => seen.add(el))
          } catch {
            // A selector the stripping broke names nothing.
          }
        }
      } else if (nested !== undefined) {
        visit(nested)
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules)
    } catch {
      // A cross-origin sheet (the font import) is not readable, and not ours.
    }
  }
  let n = 0
  seen.forEach((el) => {
    el.setAttribute("data-dd-force", String(n++))
  })
  return n
}

async function settle(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise((done) =>
        requestAnimationFrame(() => requestAnimationFrame(done))
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
): Promise<Array<Row>> {
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
    const rows = (await page.evaluate(collectRows, {
      props: STYLE_PROPS,
      pseudoProps: PSEUDO_PROPS,
    })) as Array<Row>
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

/** One side: every pass, keyed by a label the report prints. */
async function capture(
  browser: Browser,
  url: string,
  args: Args
): Promise<Map<string, Array<Row>>> {
  const out = new Map<string, Array<Row>>()
  const stateWidth = args.widths.includes(976) ? 976 : args.widths[0]

  for (const width of args.widths) {
    const context = await newMeasuringContext(browser, { width, online: false })
    const page = await context.newPage()
    await page.goto(url, { waitUntil: "load" })
    for (const theme of ["light", "dark"]) {
      await setTheme(page, theme)
      out.set(
        `${theme} @${width}`,
        (await page.evaluate(collectRows, {
          props: STYLE_PROPS,
          pseudoProps: PSEUDO_PROPS,
        })) as Array<Row>
      )
      if (args.states && width === stateWidth) {
        const marked = (await page.evaluate(markStateTargets)) as number
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

  // Declared motion, read where reduced-motion has not flattened it.
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
  for (const theme of ["light", "dark"]) {
    await setTheme(page, theme)
    out.set(
      `${theme} @${stateWidth} motion`,
      (await page.evaluate(collectRows, {
        props: MOTION_PROPS,
        pseudoProps: [],
      })) as Array<Row>
    )
  }
  await motion.close()
  return out
}

interface Diff {
  pass: string
  index: number
  who: string
  what: string
  a: string
  b: string
}

function compare(
  a: Map<string, Array<Row>>,
  b: Map<string, Array<Row>>
): Array<Diff> {
  const diffs: Array<Diff> = []
  for (const [pass, rowsA] of a) {
    const rowsB = b.get(pass) ?? []
    // The forced count is part of the label, so a pass that forced a different
    // number of elements shows up as a missing pass rather than being skipped.
    if (!b.has(pass)) {
      diffs.push({
        pass,
        index: -1,
        who: "(pass)",
        what: "pass missing on side b",
        a: `${rowsA.length} element(s)`,
        b:
          [...b.keys()]
            .filter((k) => k.startsWith(pass.split(" (")[0]))
            .join(" | ") || "(none)",
      })
      continue
    }
    if (rowsA.length !== rowsB.length) {
      diffs.push({
        pass,
        index: -1,
        who: "(document)",
        what: "element count",
        a: String(rowsA.length),
        b: String(rowsB.length),
      })
    }
    const n = Math.min(rowsA.length, rowsB.length)
    for (let i = 0; i < n; i++) {
      const ra = rowsA[i]
      const rb = rowsB[i]
      if (ra.who !== rb.who) {
        diffs.push({
          pass,
          index: i,
          who: ra.who,
          what: "element",
          a: ra.who,
          b: rb.who,
        })
        // Past the first structural mismatch every later row is misaligned.
        break
      }
      if (ra.text !== rb.text) {
        diffs.push({
          pass,
          index: i,
          who: ra.who,
          what: "text",
          a: ra.text,
          b: rb.text,
        })
      }
      const names = ["x", "y", "width", "height"]
      for (let k = 0; k < 4; k++) {
        if (Math.abs(ra.rect[k] - rb.rect[k]) > 0.5) {
          diffs.push({
            pass,
            index: i,
            who: ra.who,
            what: `box ${names[k]}`,
            a: String(ra.rect[k]),
            b: String(rb.rect[k]),
          })
        }
      }
      const keys = new Set([...Object.keys(ra.style), ...Object.keys(rb.style)])
      for (const key of keys) {
        const va = ra.style[key] ?? "(absent)"
        const vb = rb.style[key] ?? "(absent)"
        if (va !== vb) {
          diffs.push({ pass, index: i, who: ra.who, what: key, a: va, b: vb })
        }
      }
    }
  }
  return diffs
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const { chromium } = await import("playwright")
  const serverA = await serveStatic(args.publicA)
  const serverB = await serveStatic(args.publicB)
  serverA.setOracle(readFileSync(args.a, "utf8"))
  serverB.setOracle(readFileSync(args.b, "utf8"))
  const browser = await chromium.launch()
  let diffs: Array<Diff> = []
  let passes = 0
  let elements = 0
  try {
    const a = await capture(
      browser,
      `http://127.0.0.1:${serverA.port}/__oracle/preview.html`,
      args
    )
    const b = await capture(
      browser,
      `http://127.0.0.1:${serverB.port}/__oracle/preview.html`,
      args
    )
    passes = a.size
    elements = a.get(`light @${args.widths[0]}`)?.length ?? 0
    diffs = compare(a, b)
  } finally {
    await browser.close()
    await serverA.close()
    await serverB.close()
  }

  const byPass = new Map<string, number>()
  for (const d of diffs) byPass.set(d.pass, (byPass.get(d.pass) ?? 0) + 1)

  console.log(`dom-diff: ${passes} pass(es), ${elements} element(s) per pass`)
  console.log(`  a = ${args.a}`)
  console.log(`  b = ${args.b}`)
  if (diffs.length === 0) {
    console.log("SAME: no difference in any pass.")
    return
  }
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
  process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exit(2)
})
