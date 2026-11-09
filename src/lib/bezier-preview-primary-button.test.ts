import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { JSDOM } from "jsdom"
import { describe, expect, it } from "vitest"
import { findKey, readFrontmatter } from "./frontmatter"
import { splitFrontmatter } from "./frontmatter-fence"
import { deltaE, hexToOklab, parseOklch } from "./oklch-convert"
import { DELTA_E_TOLERANCE } from "./oklch-tolerance"
import { applyDarkVariants } from "./preview-halves"

// bezier's primary button is the one place where the preview, the md's
// 「beta hover」 table and upstream must agree on a value that no other gate
// compares. `audit:oklch` matches nothing on bezier (its preview is hex, not
// oklch — see `oklch-drift-corpus.test.ts`), `role-reference-rows.test.ts`
// compares the md table against frontmatter only, and the sidecar carries
// neither the table cell nor the preview. The dark pair sat apart for months
// (#662): a hover of #6f64f0 that came from nowhere, on a base of blue-400
// where upstream's dark `fill-accent-blue-heavier` is blue-300.
//
// The expected values are upstream's, copied by hand from
// `@channel.io/bezier-tokens@0.6.0` `dist/beta/css/styles.css`:
//   dark  `--color-fill-accent-blue-heavier: var(--color-blue-300)` (#8082ff),
//         `--color-fill-accent-blue-heavier-hovered: #9698ffff`
//   light `--color-fill-accent-blue-heavier: var(--color-blue-400)` (#6157ea),
//         `--color-fill-accent-blue-heavier-hovered: #5146e4ff`
// When a re-audit moves to a newer upstream, change them here first.
const UPSTREAM = {
  light: { palette: "blue-400", base: "#6157ea", hovered: "#5146e4" },
  dark: { palette: "blue-300", base: "#8082ff", hovered: "#9698ff" },
} as const

const ROOT = fileURLToPath(new URL("../..", import.meta.url))

// Normalised for the same reason `role-reference-rows.test.ts` gives: a
// Windows checkout can leave the file `w/crlf`.
const md = readFileSync(join(ROOT, "services", "bezier.md"), "utf-8").replace(
  /\r\n/g,
  "\n"
)
const preview = readFileSync(
  join(ROOT, "public", "preview", "bezier", "preview.html"),
  "utf-8"
)

function colorsTableCells(role: string): [string, string] {
  const body = splitFrontmatter(md)?.body ?? ""
  const [, afterHeading = ""] = body.split(/^## Colors[ \t]*$/m)
  const section = afterHeading.split(/^## /m)[0]
  const row = section
    .split("\n")
    .find((line) => line.startsWith(`| \`${role}\` |`))
  if (row === undefined) throw new Error(`no \`${role}\` row in ## Colors`)
  const cells = row.split("|").map((c) => c.trim())
  return [cells[2], cells[3]]
}

interface Rule {
  selectors: Array<string>
  declarations: Array<[property: string, value: string]>
}

/**
 * Every innermost rule of the document's `<style>` elements, in document
 * order — read off the parsed document, so the tag's case does not matter and
 * a `<style>` inside a `<template>` is not counted. A rule inside an at-rule
 * (`@media`, `@supports`, `@layer`) comes out as a rule of its own, its
 * condition dropped: an extra rule under a condition is still counted and
 * refused, but the preview's own rule wrapped in one (`@media print`,
 * `<style media>`) reads as unconditional. `!important` is not weighed either
 * — a light rule carrying it fails the light comparison, not the dark one.
 * Both are stated limits.
 */
function rulesOf(document: Document): Array<Rule> {
  const css = [...document.querySelectorAll("style")]
    .map((s) => s.textContent ?? "")
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "")
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
    ([, prelude, body]) => ({
      // Only commas outside parentheses separate selectors — the one in
      // `.btn.pri:not(.s, .l)` does not.
      selectors: prelude
        .split(/,(?![^()]*\))/)
        .map((s) => s.trim().replace(/\s+/g, " ")),
      declarations: body
        .split(";")
        .map((d) => /^\s*([\w-]+)\s*:\s*([\s\S]+?)\s*$/.exec(d))
        .filter((m): m is RegExpExecArray => m !== null)
        .map((m): [string, string] => [m[1], m[2]]),
    })
  )
}

type State = "base" | "hover"
type Theme = "light" | "dark"

const DARK_SCOPE = '[data-theme="dark"]'

/**
 * The whole preview as the browser shows it in `theme`: every `<style>`
 * applies, `<html data-theme>` says which theme, and in dark the variant
 * templates are swapped in the way the runtime does. Not `readPreviewHalves`
 * — its dark half keeps only the last sheet, while the browser applies the
 * first one in dark too.
 */
function themeDocument(html: string, theme: Theme): Document {
  const { document } = new JSDOM(html).window
  document.documentElement.setAttribute("data-theme", theme)
  if (theme === "dark") applyDarkVariants(document)
  return document
}

// Stripped to find the element a rule styles; what is stripped is its state.
// Only user-action states: `:enabled`, `:last-child` and the like stay in the
// selector and are left to `matches`, which knows what they select.
const USER_ACTION =
  /:(?:hover|active|focus-visible|focus-within|focus)(?![\w-])/g
const PSEUDO_ELEMENT =
  /::[\w-]+(?:\([^()]*\))?|:(?:before|after|first-line|first-letter)(?![\w-])/g

/** Whether a user-action pseudo-class sits inside parentheses. */
function userActionInsideParens(selector: string): boolean {
  let depth = 0
  for (let i = 0; i < selector.length; i++) {
    if (selector[i] === "(") depth += 1
    else if (selector[i] === ")") depth -= 1
    else if (depth > 0 && selector[i] === ":") {
      USER_ACTION.lastIndex = i
      const m = USER_ACTION.exec(selector)
      USER_ACTION.lastIndex = 0
      if (m?.index === i) return true
    }
  }
  return false
}
// `@keyframes` steps come out of `rulesOf` as rules too; they style no element.
const KEYFRAME_STEP = /^(?:from|to|\d+(?:\.\d+)?%)$/

/**
 * How a selector reads against the document: the element it styles (its
 * user-action pseudo-classes and pseudo-element taken off), its user-action
 * state, and whether it styles a pseudo-element. A user-action pseudo-class
 * inside parentheses (`:is(:hover)`, `:not(:hover)`) cannot be taken off
 * without changing what the selector means, so it is refused.
 */
function readSelector(selector: string): {
  target: string
  states: Array<string>
  pseudoElement: boolean
} {
  if (userActionInsideParens(selector)) {
    throw new Error(
      `\`${selector}\` has a user-action pseudo-class inside parentheses — write the state outside them`
    )
  }
  let target = selector
    .replace(USER_ACTION, "")
    .replace(PSEUDO_ELEMENT, "")
    .trim()
  if (target === "" || /[\s>+~]$/.test(target)) target += "*"
  return {
    target,
    states: selector.match(USER_ACTION) ?? [],
    pseudoElement: (selector.match(PSEUDO_ELEMENT) ?? []).length > 0,
  }
}

/** `Element.matches` for any of `elements`; an unreadable selector fails with its text. */
function matchesAny(
  elements: Array<Element>,
  target: string,
  selector: string
): boolean {
  try {
    return elements.some((e) => e.matches(target))
  } catch {
    throw new Error(`cannot read selector \`${selector}\``)
  }
}

function primaryButtons(document: Document): Array<Element> {
  const buttons = [...document.querySelectorAll(".btn.pri")]
  if (buttons.length === 0) {
    throw new Error("no `.btn.pri` element in this document")
  }
  return buttons
}

/**
 * The background the primary buttons get in `theme` and `state`, unresolved
 * (#666 review). The whole preview is opened as `theme` (`themeDocument`), its
 * `.btn.pri` elements are collected, and every rule in every `<style>`, in
 * document order, that declares a `background*` property is matched against
 * them with `Element.matches` — after taking off the user-action
 * pseudo-classes, which are the rule's state. A rule paints a state if it
 * matches any primary button: no user-action state is the base state, and any
 * state that includes `:hover` (`:hover:focus-visible`, or `:hover` on an
 * ancestor) is the hover state. States without `:hover` (`:active`,
 * `:focus-visible`) are not checked — upstream publishes a hovered value
 * only. An inline `style` background on a primary button paints both states,
 * and a rule on a primary button's pseudo-element is refused outright.
 *
 * The rules that paint a state must be exactly the preview's own, in order:
 * `.btn.pri` (plus the state) in light, and in dark that rule followed by its
 * `[data-theme="dark"]` override — the merged layout's one designed
 * cross-sheet override. Each sets one background property. Anything else is
 * refused rather than ordered: which rule wins is the cascade's call, and
 * re-implementing it is how this reader missed `.btn.l` and a dark rule in the
 * first sheet before.
 */
function paintingValue(html: string, theme: Theme, state: State): string {
  const document = themeDocument(html, theme)
  const buttons = primaryButtons(document)
  const painters: Array<{
    selector: string
    backgrounds: Array<[string, string]>
  }> = []
  for (const rule of rulesOf(document)) {
    const backgrounds = rule.declarations.filter(([p]) =>
      /^background(?:-[\w-]+)?$/.test(p)
    )
    if (backgrounds.length === 0) continue
    for (const selector of rule.selectors) {
      if (KEYFRAME_STEP.test(selector)) continue
      const { target, states, pseudoElement } = readSelector(selector)
      if (!matchesAny(buttons, target, selector)) continue
      if (pseudoElement) {
        throw new Error(
          `\`${selector}\` paints a pseudo-element of a primary button`
        )
      }
      const ruleState =
        states.length === 0
          ? "base"
          : states.some((s) => s === ":hover")
            ? "hover"
            : undefined
      if (ruleState === state) painters.push({ selector, backgrounds })
    }
  }
  for (const b of buttons) {
    const inline = b.getAttribute("style") ?? ""
    if (/(?:^|;)\s*background/.test(inline)) {
      painters.push({
        selector: `style="${inline}"`,
        backgrounds: [["background", inline]],
      })
    }
  }
  const own = state === "hover" ? ".btn.pri:hover" : ".btn.pri"
  const expected = theme === "light" ? [own] : [own, `${DARK_SCOPE} ${own}`]
  const found = painters.map((p) => p.selector)
  const list = (xs: Array<string>) => xs.map((x) => `\`${x}\``).join(" | ")
  if (found.length === 0) {
    throw new Error(
      `no rule paints the ${state} state of a ${theme} primary button`
    )
  }
  if (found.length > expected.length) {
    throw new Error(
      `more than one rule paints the ${state} state of a ${theme} primary button: ${list(found)} — expected ${list(expected)}`
    )
  }
  if (found.join("\n") !== expected.join("\n")) {
    throw new Error(
      `the rules that paint the ${state} state of a ${theme} primary button are ${list(found)}, not ${list(expected)}`
    )
  }
  for (const { selector, backgrounds } of painters) {
    if (backgrounds.length > 1) {
      throw new Error(
        `\`${selector}\` sets ${backgrounds.length} backgrounds (${backgrounds.map(([p]) => p).join(", ")}) — keep exactly one`
      )
    }
  }
  return painters.at(-1)!.backgrounds[0][1]
}

/**
 * `value` with every `var(--name)` followed to a literal, as the primary
 * buttons inherit it in `theme`. A declaration counts if its rule (any
 * `<style>`, document order) matches `<html>` or a primary button or one of
 * its ancestors, or if it is inline on one of those. The declarations must be
 * exactly the preview's own: `:root` in light; in dark `:root`, the
 * `[data-theme="dark"]` block, or the first overridden by the second. The
 * last one is the value — anything else, such as a scoped `.hero{--x:…}`, is
 * refused.
 */
function resolveVar(
  html: string,
  theme: Theme,
  value: string,
  seen = 0
): string {
  const ref = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value.trim())?.[1]
  if (ref === undefined) return value.trim()
  if (seen > 8) throw new Error(`var() chain too deep at ${ref}`)
  const document = themeDocument(html, theme)
  const chain = new Set<Element>([document.documentElement])
  for (const b of primaryButtons(document)) {
    for (let e: Element | null = b; e !== null; e = e.parentElement)
      chain.add(e)
  }
  const inherited = [...chain]
  const declarers: Array<{ selector: string; value: string }> = []
  for (const rule of rulesOf(document)) {
    const decls = rule.declarations.filter(([p]) => p === ref)
    if (decls.length === 0) continue
    for (const selector of rule.selectors) {
      if (KEYFRAME_STEP.test(selector)) continue
      const { target, pseudoElement } = readSelector(selector)
      if (pseudoElement || !matchesAny(inherited, target, selector)) continue
      for (const [, v] of decls) declarers.push({ selector, value: v })
    }
  }
  for (const e of inherited) {
    const inline = new RegExp(`(?:^|;)\\s*${ref}\\s*:\\s*([^;]+)`).exec(
      e.getAttribute("style") ?? ""
    )
    if (inline) declarers.push({ selector: 'style="…"', value: inline[1] })
  }
  const found = declarers.map((d) => d.selector).join(" | ")
  const allowed =
    theme === "light"
      ? [":root"]
      : [":root", DARK_SCOPE, `:root | ${DARK_SCOPE}`]
  if (!allowed.includes(found)) {
    throw new Error(
      `${ref} is declared by ${found || "nothing"} for the ${theme} primary buttons — expected one of ${allowed.map((a) => `\`${a}\``).join(", ")}`
    )
  }
  return resolveVar(html, theme, declarers.at(-1)!.value, seen + 1)
}

/** The literal background colour the primary buttons get in `theme` and `state`. */
function primaryColor(html: string, theme: Theme, state: State): string {
  return resolveVar(html, theme, paintingValue(html, theme, state))
}

// A preview carries both themes in one file: the first `<style>` is light and
// the last is `[data-theme="dark"]`-scoped, and in dark the browser applies
// BOTH. Rules from either sheet compete for the dark buttons (#666 review).
describe("both sheets compete for the primary buttons of each theme", () => {
  const LIGHT =
    ":root{--x:#6157ea;}\n.btn.pri{background:var(--x);}\n.btn.pri:hover{background:#5146e4;}\n"
  const DARK =
    '[data-theme="dark"]{--x:#8082ff;}\n[data-theme="dark"] .btn.pri{background:var(--x);}\n[data-theme="dark"] .btn.pri:hover{background:#9698ff;}\n'
  const BODY =
    '<button class="btn pri">a</button><button class="btn pri l">b</button>' +
    '<div class="hero"><button class="btn pri s">c</button></div>'
  const merged = (lightExtra = "", darkExtra = "") =>
    `<!doctype html><html data-theme="light"><head><style>${LIGHT}${lightExtra}</style><style>${DARK}${darkExtra}</style></head><body>${BODY}</body></html>`

  it("reads each theme's own rule and variable", () => {
    const html = merged()
    expect(primaryColor(html, "light", "base")).toBe("#6157ea")
    expect(primaryColor(html, "light", "hover")).toBe("#5146e4")
    expect(primaryColor(html, "dark", "base")).toBe("#8082ff")
    expect(primaryColor(html, "dark", "hover")).toBe("#9698ff")
  })

  const refused: Array<[string, string, string, State]> = [
    [
      "a dark-scoped rule in the first sheet",
      '[data-theme="dark"] .btn.pri.l{background:#123456;}',
      "",
      "base",
    ],
    [
      "a descendant hover rule in the first sheet",
      ".hero .btn.pri:hover{background:#123456;}",
      "",
      "hover",
    ],
    [
      "a rule that matches every theme but light",
      ':not([data-theme="light"]) .btn.pri{background:#123456;}',
      "",
      "base",
    ],
  ]
  for (const [name, lightExtra, darkExtra, state] of refused) {
    it(`refuses ${name} in dark`, () => {
      const html = merged(lightExtra, darkExtra)
      expect(() => primaryColor(html, "dark", state)).toThrow(
        /more than one rule paints|rules that paint/
      )
    })
  }

  it("refuses a variable the dark buttons inherit from a scoped rule", () => {
    const html = merged("", ".hero{--x:#123456;}")
    expect(() => primaryColor(html, "dark", "base")).toThrow(/--x is declared/)
  })

  it("reads a sheet whose tag is written in capitals", () => {
    const html = merged().replace(
      "</head>",
      "<STYLE>.btn.l{background:#123456;}</STYLE></head>"
    )
    expect(() => primaryColor(html, "light", "base")).toThrow(
      /more than one rule paints/
    )
  })
})

describe("the painting rule is read off the real primary buttons", () => {
  const BASE =
    ":root{--x:#8082ff;}\n.btn.pri{background:var(--x);}\n.btn.pri:hover{background:#9698ff;}\n"
  const BODY =
    '<button class="btn pri">a</button><button class="btn pri l" id="go">b</button>' +
    '<div class="hero"><button class="btn pri s">c</button></div><button class="ib pri">d</button>'
  const doc = (css: string, body = BODY) =>
    `<!doctype html><html><head><style>${css}</style></head><body>${body}</body></html>`

  it("reads one rule per state and one declaration", () => {
    const html = doc(`${BASE}.ib.pri{background:#ff0000;}\n`)
    expect(
      resolveVar(html, "light", paintingValue(html, "light", "base"))
    ).toBe("#8082ff")
    expect(paintingValue(html, "light", "hover")).toBe("#9698ff")
  })

  const refused: Array<[string, string, State, RegExp, string?]> = [
    [
      "a later rule for the same selector",
      ".btn.pri{background:#6157ea;}",
      "base",
      /more than one rule paints/,
    ],
    [
      "a descendant rule",
      ".hero .btn.pri{background:#6157ea;}",
      "base",
      /more than one rule paints/,
    ],
    [
      "a rule naming fewer of its classes",
      ".hero .pri{background:#6157ea;}",
      "base",
      /more than one rule paints/,
    ],
    [
      "a rule for a size class only",
      ".btn.l{background:#6157ea;}",
      "base",
      /more than one rule paints/,
    ],
    [
      "a rule that differs by :not()",
      ".btn.pri:not(.s, .l){background:#6157ea;}",
      "base",
      /more than one rule paints/,
    ],
    [
      "a non-state pseudo-class",
      ".btn.pri:enabled{background:#6157ea;}",
      "base",
      /more than one rule paints/,
    ],
    [
      "a non-state pseudo-class on hover",
      ".btn.pri:hover:enabled{background:#6f64f0;}",
      "hover",
      /more than one rule paints/,
    ],
    [
      "an id rule",
      "#go{background:#6157ea;}",
      "base",
      /more than one rule paints/,
    ],
    [
      "a type rule",
      "button{background:#6157ea;}",
      "base",
      /more than one rule paints/,
    ],
    [
      "a later background-image",
      ".btn.pri{background-image:linear-gradient(red,red);}",
      "base",
      /more than one rule paints/,
    ],
    [
      "hover inside a functional pseudo-class",
      ".btn.pri:is(:hover){background:#6f64f0;}",
      "hover",
      /user-action pseudo-class inside/,
    ],
    [
      "hover combined with another user-action state",
      ".btn.pri:hover:focus-visible{background:#6f64f0;}",
      "hover",
      /more than one rule paints/,
    ],
    [
      "a pseudo-element",
      ".btn.pri::before{background:#6157ea;}",
      "base",
      /pseudo-element/,
    ],
    [
      "an inline style",
      "",
      "base",
      /more than one rule paints/,
      '<button class="btn pri" style="background:#6157ea">e</button>',
    ],
  ]
  for (const [name, css, state, error, extra] of refused) {
    it(`refuses ${name}`, () => {
      const html = doc(`${BASE}${css}\n`, BODY + (extra ?? ""))
      expect(() => paintingValue(html, "light", state)).toThrow(error)
    })
  }

  it("refuses a second background in the button's own rule", () => {
    const html = doc(
      BASE.replace("var(--x);", "var(--x);background-color:#ff0000;")
    )
    expect(() => paintingValue(html, "light", "base")).toThrow(
      /sets 2 backgrounds/
    )
  })

  it("leaves rules for other buttons and for :active alone", () => {
    const html = doc(
      `${BASE}.ib.pri{background:#ff0000;}\n.seg button{background:transparent;}\n.btn.pri:active{background:#000000;}\n`
    )
    expect(paintingValue(html, "light", "base")).toBe("var(--x)")
    expect(paintingValue(html, "light", "hover")).toBe("#9698ff")
  })

  it("refuses a later redeclaration of the property the rule reads", () => {
    const html = doc(`${BASE}:root{--x:#6157ea;}\n`)
    expect(() =>
      resolveVar(html, "light", paintingValue(html, "light", "base"))
    ).toThrow(/--x is declared by :root \| :root for the light/)
  })

  it("does not take a descendant rule for the button's own rule", () => {
    const html = doc(
      ".hero .btn.pri{background:#6157ea;}\n.btn.pri:hover{background:#9698ff;}\n"
    )
    expect(() => paintingValue(html, "light", "base")).toThrow(
      /not `\.btn\.pri`/
    )
  })

  it("names a selector it cannot read", () => {
    const html = doc(`${BASE}.btn.pri:no-such-pseudo{background:#6157ea;}\n`)
    expect(() => paintingValue(html, "light", "base")).toThrow(
      /cannot read selector `\.btn\.pri:no-such-pseudo`/
    )
  })
})

describe.each(["light", "dark"] as const)(
  "bezier primary button, %s theme",
  (theme) => {
    const want = UPSTREAM[theme]

    it("the preview's base is upstream's fill-accent-blue-heavier", () => {
      const base = primaryColor(preview, theme, "base")
      expect(base.toLowerCase()).toBe(want.base)
    })

    it("the preview's hover is upstream's fill-accent-blue-heavier-hovered", () => {
      const hover = primaryColor(preview, theme, "hover")
      expect(hover.toLowerCase()).toBe(want.hovered)
    })

    it("the md 「beta hover」 table cell is upstream's hovered value", () => {
      const cell = colorsTableCells("fill-accent-blue-heavier-hovered")[
        theme === "light" ? 0 : 1
      ]
      const hex = /#([0-9a-f]{6})(?:ff)?\b/i.exec(cell)?.[1]
      expect(hex && `#${hex.toLowerCase()}`).toBe(want.hovered)
      const oklch = /`(oklch\([^`]+\))`/.exec(cell)?.[1] ?? ""
      const wrote = parseOklch(oklch)
      const target = hexToOklab(want.hovered)
      expect(wrote).not.toBeNull()
      expect(deltaE(wrote!.lab, target!.lab)).toBeLessThanOrEqual(
        DELTA_E_TOLERANCE
      )
    })

    it("the md role table points fill-accent-blue-heavier at upstream's palette step", () => {
      const cell = colorsTableCells("fill-accent-blue-heavier")[
        theme === "light" ? 0 : 1
      ]
      expect(cell).toBe(`\`{colors.${want.palette}}\``)
      const read = readFrontmatter(md)
      const colors = (
        read.ok ? (findKey(read.keys, "colors")?.value ?? {}) : {}
      ) as Record<string, string>
      const step = parseOklch(colors[want.palette] ?? "")
      expect(step).not.toBeNull()
      expect(deltaE(step!.lab, hexToOklab(want.base)!.lab)).toBeLessThanOrEqual(
        DELTA_E_TOLERANCE
      )
    })
  }
)
