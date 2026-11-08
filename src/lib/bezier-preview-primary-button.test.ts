import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { JSDOM } from "jsdom"
import { describe, expect, it } from "vitest"
import { findKey, readFrontmatter } from "./frontmatter"
import { splitFrontmatter } from "./frontmatter-fence"
import { deltaE, hexToOklab, parseOklch } from "./oklch-convert"
import { DELTA_E_TOLERANCE } from "./oklch-tolerance"
import { readPreviewHalves } from "./preview-halves"

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
const halves = readPreviewHalves(join(ROOT, "public", "preview", "bezier"))

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
 * Every innermost rule of a document's `<style>` contents, in source order. A
 * rule inside `@media` comes out as a rule of its own — counted, never
 * dropped, so a conditional override still makes a reader refuse the sheet.
 */
function rulesOf(html: string): Array<Rule> {
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1])
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

/**
 * A sheet's one declaration of `--name`, following `var()` to a literal.
 * Declared twice anywhere — a later `:root` or a scoped override — is refused:
 * which one reaches the button is the cascade's call, not this reader's. Only
 * `<style>` is read; an inline `style="--x:…"` is not (none in the preview).
 */
function resolveVar(sheet: string, value: string, seen = 0): string {
  const ref = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value.trim())?.[1]
  if (ref === undefined) return value.trim()
  if (seen > 8) throw new Error(`var() chain too deep at ${ref}`)
  const decls = rulesOf(sheet).flatMap((r) =>
    r.declarations.filter(([p]) => p === ref).map(([, v]) => v)
  )
  if (decls.length !== 1) {
    throw new Error(
      `${ref} is declared ${decls.length} times in this sheet — keep exactly one`
    )
  }
  return resolveVar(sheet, decls[0], seen + 1)
}

type State = "base" | "hover"

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
 * The background of the one rule that paints the primary buttons in `state`
 * (#666 review). Every `.btn.pri` element of the document is collected, and
 * every rule in its `<style>` that declares a `background*` property is
 * matched against them with `Element.matches` — after taking off the
 * user-action pseudo-classes, which are the rule's state. A rule paints a
 * state if it matches any primary button in it: no user-action state is the
 * base state, and any state that includes `:hover` (`:hover:focus-visible`, or
 * `:hover` on an ancestor) is the hover state. States without `:hover`
 * (`:active`, `:focus-visible`) are not checked — upstream publishes a hovered
 * value only. An inline `style` background on a primary button paints both
 * states, and a rule on a primary button's pseudo-element is refused outright:
 * either one can hide the button's own background from a reader of rules.
 *
 * For each state exactly one rule may paint, it must be exactly `.btn.pri`
 * (plus the state), and it may set one background property. Anything else is
 * refused rather than ordered — which rule wins is the cascade's call, and
 * re-implementing it here is how this reader missed `.btn.l` before. A
 * user-action pseudo-class inside parentheses (`:is(:hover)`, `:not(:hover)`)
 * cannot be taken off without changing what the selector means, so it is
 * refused too, as is a selector `matches` cannot read, with its text.
 */
function primaryBackground(html: string, state: State): string {
  const { document } = new JSDOM(html).window
  const buttons = [...document.querySelectorAll(".btn.pri")]
  if (buttons.length === 0) {
    throw new Error("no `.btn.pri` element in this document")
  }
  const painters: Array<{
    selector: string
    backgrounds: Array<[string, string]>
  }> = []
  for (const rule of rulesOf(html)) {
    const backgrounds = rule.declarations.filter(([p]) =>
      /^background(?:-[\w-]+)?$/.test(p)
    )
    if (backgrounds.length === 0) continue
    for (const selector of rule.selectors) {
      if (KEYFRAME_STEP.test(selector)) continue
      if (userActionInsideParens(selector)) {
        throw new Error(
          `\`${selector}\` has a user-action pseudo-class inside parentheses — write the state outside them`
        )
      }
      const states = selector.match(USER_ACTION) ?? []
      const pseudoElement = (selector.match(PSEUDO_ELEMENT) ?? []).length > 0
      let target = selector
        .replace(USER_ACTION, "")
        .replace(PSEUDO_ELEMENT, "")
        .trim()
      if (target === "" || /[\s>+~]$/.test(target)) target += "*"
      let hits: boolean
      try {
        hits = buttons.some((b) => b.matches(target))
      } catch {
        throw new Error(`cannot read selector \`${selector}\``)
      }
      if (!hits) continue
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
  if (painters.length === 0) {
    throw new Error(`no rule paints the ${state} state of a primary button`)
  }
  if (painters.length > 1) {
    throw new Error(
      `more than one rule paints the ${state} state of a primary button: ${painters.map((p) => p.selector).join(" | ")}`
    )
  }
  const [{ selector, backgrounds }] = painters
  if (selector !== own) {
    throw new Error(
      `the rule that paints it is \`${selector}\`, not \`${own}\``
    )
  }
  if (backgrounds.length > 1) {
    throw new Error(
      `\`${own}\` sets ${backgrounds.length} backgrounds (${backgrounds.map(([p]) => p).join(", ")}) — keep exactly one`
    )
  }
  return backgrounds[0][1]
}

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
    expect(resolveVar(html, primaryBackground(html, "base"))).toBe("#8082ff")
    expect(primaryBackground(html, "hover")).toBe("#9698ff")
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
      expect(() => primaryBackground(html, state)).toThrow(error)
    })
  }

  it("refuses a second background in the button's own rule", () => {
    const html = doc(
      BASE.replace("var(--x);", "var(--x);background-color:#ff0000;")
    )
    expect(() => primaryBackground(html, "base")).toThrow(/sets 2 backgrounds/)
  })

  it("leaves rules for other buttons and for :active alone", () => {
    const html = doc(
      `${BASE}.ib.pri{background:#ff0000;}\n.seg button{background:transparent;}\n.btn.pri:active{background:#000000;}\n`
    )
    expect(primaryBackground(html, "base")).toBe("var(--x)")
    expect(primaryBackground(html, "hover")).toBe("#9698ff")
  })

  it("refuses a later redeclaration of the property the rule reads", () => {
    const html = doc(`${BASE}:root{--x:#6157ea;}\n`)
    expect(() => resolveVar(html, primaryBackground(html, "base"))).toThrow(
      /declared 2 times/
    )
  })

  it("does not take a descendant rule for the button's own rule", () => {
    const html = doc(
      ".hero .btn.pri{background:#6157ea;}\n.btn.pri:hover{background:#9698ff;}\n"
    )
    expect(() => primaryBackground(html, "base")).toThrow(/not `\.btn\.pri`/)
  })

  it("names a selector it cannot read", () => {
    const html = doc(`${BASE}.btn.pri:no-such-pseudo{background:#6157ea;}\n`)
    expect(() => primaryBackground(html, "base")).toThrow(
      /cannot read selector `\.btn\.pri:no-such-pseudo`/
    )
  })
})

describe.each(["light", "dark"] as const)(
  "bezier primary button, %s theme",
  (theme) => {
    const want = UPSTREAM[theme]
    // Thrown by name, so a missing preview fails as that and not as a
    // "no `.btn.pri` rule" read off an empty string.
    const sheet = (): string => {
      if (halves === null) {
        throw new Error("public/preview/bezier has no readable preview")
      }
      return halves[theme]
    }

    it("the preview's base is upstream's fill-accent-blue-heavier", () => {
      const base = resolveVar(sheet(), primaryBackground(sheet(), "base"))
      expect(base.toLowerCase()).toBe(want.base)
    })

    it("the preview's hover is upstream's fill-accent-blue-heavier-hovered", () => {
      const hover = resolveVar(sheet(), primaryBackground(sheet(), "hover"))
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
