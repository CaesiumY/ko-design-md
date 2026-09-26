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
  expect(Object.fromEntries(refs), slug).toEqual(Object.fromEntries(expected))
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
    // The spec reserves these as brand colour roles (spec-config `color_roles`);
    // greeting's are text colours, so declaring them would tell standard tools
    // that 85% black is the brand's primary.
    const RESERVED = new Set(["primary", "secondary", "tertiary", "neutral"])
    const expected = new Map<string, string>()
    for (const [roleCell, paletteCell] of tableRows) {
      const roles = spans(roleCell)
      const palette = spans(paletteCell)
      // The `effect1` / … / `effect4` row pairs positionally with its palette.
      if (roles.length !== palette.length) continue
      if (!palette.every((p) => literals.has(p))) continue
      roles.forEach((role, i) => {
        if (!RESERVED.has(role)) expected.set(role, palette[i])
      })
    }
    for (const name of RESERVED) expect(refs.has(name), name).toBe(false)
    expectRowsToMatch("greeting", expected, refs, literals)
  })

  it("codeit — bundle names, single-step roles only", () => {
    const { literals, refs, tableRows } = load("codeit")
    // Upstream disagrees with the table's dark column here: the dark bundle
    // points at `purple-opacity-15`, not `purple-05` (#435). No dark row until
    // the table is re-audited.
    const NO_DARK_ROW = new Set(["bg-purple-primary"])
    const bundleName = (docs: string): string =>
      docs.replace(/^txt-/, "text-").replace(/^bg-/, "background-")
    const expected = new Map<string, string>()
    for (const [roleCell, basis] of tableRows) {
      const [docs] = spans(roleCell)
      // `gray-100 @ 60%` (the opacity ramp) and `리터럴` fall out here.
      const m =
        /^([a-z]+-\d+)(?:\(L\) \/ ([a-z]+-\d+)\(D\))?(?: \(⚠.*\))?$/.exec(basis)
      if (!m) continue
      // One step (`gray-00`) serves both themes; `x(L) / y(D)` splits them.
      const [, light, dark = light] = m
      const name = bundleName(docs)
      expected.set(name, `light-${light}`)
      if (!NO_DARK_ROW.has(docs)) expected.set(`dark-${name}`, `dark-${dark}`)
    }
    expectRowsToMatch("codeit", expected, refs, literals)
  })
})
