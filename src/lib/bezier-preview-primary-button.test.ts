import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
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
 * Every innermost rule of a sheet, in source order. A half is a whole
 * document, so only its `<style>` contents are read; a fixture is bare CSS. A
 * rule inside `@media` comes out as a rule of its own — counted, never
 * dropped, so a conditional override still makes a reader refuse the sheet.
 */
function rulesOf(sheet: string): Array<Rule> {
  const styles = [...sheet.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
  const css = (styles.length > 0 ? styles.map((m) => m[1]) : [sheet])
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
 * `.hero .btn.pri:hover` → the classes and state pseudo-classes of the
 * element it styles (its last compound). Functional pseudo-classes
 * (`:not(.s, .l)`, `:not(:is(.s))`) are dropped first, with what is inside
 * them, innermost first — so a space inside them is not read as a combinator,
 * and such a rule is read as painting the button. That reads `:is(:hover)` as
 * no state — a gap no preview rule uses today.
 */
function classesAndState(selector: string): {
  classes: Set<string>
  state: string
} {
  let stripped = selector
  for (let prev = ""; prev !== stripped;) {
    prev = stripped
    stripped = stripped.replace(/:[\w-]+\([^()]*\)/g, "")
  }
  const bare =
    stripped
      .trim()
      .split(/\s*[\s>+~]\s*/)
      .at(-1) ?? ""
  return {
    classes: new Set(bare.match(/\.[\w-]+/g) ?? []),
    state: (bare.match(/:[\w-]+/g) ?? []).sort().join(""),
  }
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

/**
 * The background of the one rule that paints `selector`'s element in that
 * state. A candidate is any rule whose last compound is in the same state and
 * whose classes are a subset or superset of the button's — `.hero .btn.pri`
 * and `.hero .pri` paint these buttons as surely as `.btn.pri` does. A second
 * candidate, or a second background property in the one rule, is refused
 * rather than ordered.
 */
function ruleBackground(sheet: string, selector: string): string {
  const want = classesAndState(selector)
  const painting = rulesOf(sheet).flatMap((r) => {
    const backgrounds = r.declarations.filter(([p]) =>
      /^background(-color|-image)?$/.test(p)
    )
    if (backgrounds.length === 0) return []
    return r.selectors
      .filter((s) => {
        const last = classesAndState(s)
        if (last.state !== want.state || last.classes.size === 0) return false
        const within = (a: Set<string>, b: Set<string>) =>
          [...a].every((c) => b.has(c))
        return (
          within(last.classes, want.classes) ||
          within(want.classes, last.classes)
        )
      })
      .map((s) => ({ selector: s, backgrounds }))
  })
  if (painting.length === 0) {
    throw new Error(`no rule paints \`${selector}\` in this sheet`)
  }
  if (painting.length > 1) {
    throw new Error(
      `more than one rule paints \`${selector}\`: ${painting.map((p) => p.selector).join(" | ")}`
    )
  }
  if (painting[0].selector !== selector) {
    throw new Error(
      `the rule that paints it is \`${painting[0].selector}\`, not \`${selector}\``
    )
  }
  const [{ backgrounds }] = painting
  if (backgrounds.length > 1) {
    throw new Error(
      `\`${selector}\` sets ${backgrounds.length} backgrounds (${backgrounds.map(([p]) => p).join(", ")}) — keep exactly one`
    )
  }
  return backgrounds[0][1]
}

// The cascade applies the LAST matching rule and declaration, not the first
// (#666 review). A reader that stops at the first match passes a sheet whose
// later rule re-breaks the button, so these readers refuse a sheet where more
// than one rule could paint the button, where that rule sets more than one
// background property, or where a custom property it reads is declared twice.
describe("the sheet readers do not stop at the first match", () => {
  const BASE = ":root{--x:#8082ff;}\n.btn.pri{background:var(--x);}\n"

  it("read a sheet with one rule and one declaration", () => {
    expect(resolveVar(BASE, ruleBackground(BASE, ".btn.pri"))).toBe("#8082ff")
  })

  it("refuse a later rule for the same selector", () => {
    const sheet = `${BASE}.btn.pri{background:#6157ea;}\n`
    expect(() => ruleBackground(sheet, ".btn.pri")).toThrow(/more than one/)
  })

  it("refuse a later redeclaration of the property the rule reads", () => {
    const sheet = `${BASE}:root{--x:#6157ea;}\n`
    expect(() => resolveVar(sheet, ruleBackground(sheet, ".btn.pri"))).toThrow(
      /declared 2 times/
    )
  })

  it("refuse a descendant rule that also paints the button", () => {
    const sheet = `${BASE}.hero .btn.pri{background:#6157ea;}\n`
    expect(() => ruleBackground(sheet, ".btn.pri")).toThrow(/more than one/)
  })

  it("do not take a descendant rule for the button's own rule", () => {
    const sheet = ".hero .btn.pri{background:#6157ea;}\n"
    expect(() => ruleBackground(sheet, ".btn.pri")).toThrow(/not `\.btn\.pri`/)
  })

  it("refuse a second background in the button's own rule", () => {
    for (const second of ["background:#ff0000", "background-color:#ff0000"]) {
      const sheet = `:root{--x:#8082ff;}\n.btn.pri{background:var(--x);${second};}\n`
      expect(() => ruleBackground(sheet, ".btn.pri")).toThrow(
        /sets 2 backgrounds/
      )
    }
  })

  it("refuse a later rule that differs only by :not()", () => {
    for (const not of [":not(.s)", ":not(.s, .l)", ":not(:is(.s))"]) {
      const sheet = `${BASE}.btn.pri${not}{background:#6157ea;}\n`
      expect(() => ruleBackground(sheet, ".btn.pri")).toThrow(/more than one/)
    }
  })

  it("refuse a later rule that names fewer of the button's classes", () => {
    const sheet = `${BASE}.hero .pri{background:#6157ea;}\n`
    expect(() => ruleBackground(sheet, ".btn.pri")).toThrow(/more than one/)
  })

  it("refuse a later background-image on the button", () => {
    const sheet = `${BASE}.btn.pri{background-image:linear-gradient(red,red);}\n`
    expect(() => ruleBackground(sheet, ".btn.pri")).toThrow(/more than one/)
  })

  it("keep the hover rule apart from the base rule", () => {
    const sheet = `${BASE}.btn.pri:hover{background:#9698ff;}\n`
    expect(ruleBackground(sheet, ".btn.pri")).toBe("var(--x)")
    expect(ruleBackground(sheet, ".btn.pri:hover")).toBe("#9698ff")
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
      const base = resolveVar(sheet(), ruleBackground(sheet(), ".btn.pri"))
      expect(base.toLowerCase()).toBe(want.base)
    })

    it("the preview's hover is upstream's fill-accent-blue-heavier-hovered", () => {
      const hover = resolveVar(
        sheet(),
        ruleBackground(sheet(), ".btn.pri:hover")
      )
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
