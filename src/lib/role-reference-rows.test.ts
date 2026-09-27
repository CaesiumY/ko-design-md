import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { parse } from "yaml"
import { describe, expect, it } from "vitest"

// Three entries publish a semantic role layer twice (#435): as a Markdown table
// in `## Colors` — the reader's copy, carrying `[src:N]` and, for greeting, the
// dark values — and as quoted reference rows in frontmatter `colors:`
// (`bg-brand-solid: "{colors.carrot-600}"`), which is what standard DESIGN.md
// tooling reads. Nothing else compares the two. token-extractor skips reference
// rows, so `tokens:check` cannot see them, and the spec linter only checks that a
// reference resolves, not that it resolves to the palette step the table names.
// A re-audit that fixes one copy and not the other would pass every other gate.
//
// Pinned in both directions: every table role that maps to a single declared
// palette token has its row(s), and no row exists without a table role behind it.

const SERVICES = join(
  fileURLToPath(new URL("../..", import.meta.url)),
  "services"
)

function load(slug: string): {
  literals: Set<string>
  refs: Map<string, string>
  tableRows: Array<Array<string>>
} {
  const raw = readFileSync(join(SERVICES, `${slug}.md`), "utf-8")
  // Rejoin the rest: a body `---` rule (krds and wanted have one) would
  // otherwise end the body there.
  const [, frontmatter, ...rest] = raw.split(/^---$/m)
  const body = rest.join("---")
  const colors = (parse(frontmatter) as { colors: Record<string, string> })
    .colors
  const literals = new Set<string>()
  const refs = new Map<string, string>()
  for (const [key, value] of Object.entries(colors)) {
    const target = /^\{colors\.([^}]+)\}$/.exec(value)?.[1]
    if (target) refs.set(key, target)
    else literals.add(key)
  }
  // Only the `## Colors` section: other sections have two-column tables too
  // (radius aliases, type ramps) whose cells could look like palette steps.
  const colorsSection = body.split(/^## Colors$/m)[1].split(/^## /m)[0]
  const tableRows = colorsSection
    .split("\n")
    .filter((line) => line.startsWith("| `"))
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim())
    )
  return { literals, refs, tableRows }
}

// spec-config `color_roles`.
const SPEC_COLOR_ROLES = new Set([
  "primary",
  "secondary",
  "tertiary",
  "neutral",
])

const spans = (cell: string): Array<string> =>
  [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1])

function expectRowsToMatch(
  slug: string,
  expected: Map<string, string>,
  refs: Map<string, string>,
  literals: Set<string>
): void {
  // A table with nothing parsed would make every assertion below vacuous.
  expect(expected.size, `${slug}: no table roles parsed`).toBeGreaterThan(0)
  for (const target of expected.values()) {
    expect(
      literals.has(target),
      `${slug}: ${target} is not a palette key`
    ).toBe(true)
  }
  // The #381 brand alias (`primary: "{colors.blue500}"`) points at the brand
  // colour, not at a table role, so it is not compared. The other spec role
  // names have no such procedure: any row under them fails as unexpected.
  const roleRows = [...refs].filter(([key]) => key !== "primary")
  expect(Object.fromEntries(roleRows), slug).toEqual(
    Object.fromEntries(expected)
  )
}

describe("role reference rows agree with the body role tables", () => {
  it("seed-design — every role, light and `dark-` twin", () => {
    const { literals, refs, tableRows } = load("seed-design")
    const expected = new Map<string, string>()
    for (const [role, light = "", dark = ""] of tableRows) {
      const [name] = spans(role)
      const [l] = spans(light)
      const [d] = spans(dark)
      // Other backticked rows in `## Colors` are not role mappings.
      if (!/^(bg|fg|stroke)-/.test(name) || !l || !d) continue
      expected.set(name, l)
      // `static-*` is theme-invariant, so it has no `dark-` twin to point at.
      expected.set(`dark-${name}`, d.startsWith("static-") ? d : `dark-${d}`)
    }
    expectRowsToMatch("seed-design", expected, refs, literals)
  })

  it("greeting — light only, never the spec's colour-role names", () => {
    const { literals, refs, tableRows } = load("greeting")
    const expected = new Map<string, string>()
    for (const [roleCell, paletteCell] of tableRows) {
      const roles = spans(roleCell)
      // Frontmatter carries light values only, so a `x`(L) / `y`(D) cell
      // is judged by its light side.
      const split = /^`([^`]+)`\(L\) \/ `[^`]+`\(D\)$/.exec(paletteCell)
      const palette = split ? [split[1]] : spans(paletteCell)
      // The `effect1` / … / `effect4` row pairs positionally with its palette.
      if (roles.length !== palette.length) continue
      if (!palette.every((p) => literals.has(p))) continue
      roles.forEach((role, i) => {
        if (!SPEC_COLOR_ROLES.has(role)) expected.set(role, palette[i])
        // greeting's `primary`/`secondary`/`tertiary` are text colours and the
        // spec reads those names as brand roles. `primary` may still appear as
        // the #381 brand alias, but never pointing at the text colour.
        else expect(refs.get(role), role).not.toBe(palette[i])
      })
    }
    expectRowsToMatch("greeting", expected, refs, literals)
  })

  it("codeit — bundle names, single-step roles only", () => {
    const { literals, refs, tableRows } = load("codeit")
    const bundleName = (docs: string): string =>
      docs.replace(/^txt-/, "text-").replace(/^bg-/, "background-")
    const STEP = /^[a-z]+-\d+$/
    const expected = new Map<string, string>()
    for (const [roleCell, basis] of tableRows) {
      const [docs] = spans(roleCell)
      // `gray-00` serves both themes; `x(L) / y(D)` splits them. `gray-100 @ 60%`
      // (the opacity ramp) and `리터럴` fall out here.
      const m = /^([a-z]+-\d+)(?:\(L\) \/ ([a-z0-9-]+)\(D\))?$/.exec(basis)
      if (!m) continue
      const [, light, dark = light] = m
      const name = bundleName(docs)
      expected.set(name, `light-${light}`)
      // A dark side that is not a single step — `bg-purple-primary` points at
      // `purple-opacity-15` in the dark bundle — has no palette key to alias.
      if (STEP.test(dark)) expected.set(`dark-${name}`, `dark-${dark}`)
    }
    expectRowsToMatch("codeit", expected, refs, literals)
  })
})
