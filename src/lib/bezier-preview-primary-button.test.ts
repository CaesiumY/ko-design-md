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

/** A sheet's own declaration of `--name`, following `var()` to a literal. */
function resolveVar(sheet: string, value: string, seen = 0): string {
  const ref = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value.trim())?.[1]
  if (ref === undefined) return value.trim()
  if (seen > 8) throw new Error(`var() chain too deep at ${ref}`)
  const decl = new RegExp(`(?:^|[\\s;{])${ref}\\s*:\\s*([^;]+);`).exec(sheet)
  if (decl === null) throw new Error(`${ref} is not declared in this sheet`)
  return resolveVar(sheet, decl[1], seen + 1)
}

function ruleBackground(sheet: string, selector: string): string {
  const escaped = selector.replace(/[.:]/g, "\\$&")
  const rule = new RegExp(`(?:^|[\\s}])${escaped}\\s*\\{([^}]*)\\}`).exec(sheet)
  if (rule === null) throw new Error(`no \`${selector}\` rule in this sheet`)
  const bg = /background\s*:\s*([^;]+);/.exec(rule[1])
  if (bg === null) throw new Error(`\`${selector}\` sets no background`)
  return bg[1]
}

describe.each(["light", "dark"] as const)(
  "bezier primary button, %s theme",
  (theme) => {
    const want = UPSTREAM[theme]
    const sheet = halves?.[theme] ?? ""

    it("the preview reads as a merged or split file", () => {
      expect(halves).not.toBeNull()
    })

    it("the preview's base is upstream's fill-accent-blue-heavier", () => {
      const base = resolveVar(sheet, ruleBackground(sheet, ".btn.pri"))
      expect(base.toLowerCase()).toBe(want.base)
    })

    it("the preview's hover is upstream's fill-accent-blue-heavier-hovered", () => {
      const hover = resolveVar(sheet, ruleBackground(sheet, ".btn.pri:hover"))
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
