import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { findKey, readFrontmatter } from "./frontmatter"
import { splitFrontmatter } from "./frontmatter-fence"

// The entries in CASES below publish a semantic role layer twice (#435): as a
// Markdown table in `## Colors` — the reader's copy, carrying `[src:N]` — and
// as quoted reference rows in frontmatter
// `colors:` (`bg-brand-solid: "{colors.carrot-600}"`), which is what standard
// DESIGN.md tooling reads. Nothing else compares the two. The sidecar carries the
// rows but not the table, so `tokens:check` cannot see the two drift apart, and
// the spec linter only checks that a reference resolves, not that it resolves to
// the palette step the table names.
// A re-audit that fixes one copy and not the other would pass every other gate.
//
// Pinned in both directions: every table role that maps to a single declared
// palette token has its row(s) — save one under a spec colour-role name, which
// stays in the table — and no row exists without a table role behind it.

const SERVICES = join(
  fileURLToPath(new URL("../..", import.meta.url)),
  "services"
)

function load(slug: string): {
  literals: Set<string>
  refs: Map<string, string>
  tableRows: Array<Array<string>>
  colorsSection: string
} {
  // Normalised: a Windows checkout can leave a `w/crlf` entry (see CLAUDE.md
  // 「Windows 로컬 주의」), and `^---$` / `^## Colors$` would miss every
  // `\r`-ended line. The guard reads the whole catalogue, so one such file
  // anywhere would fail it.
  const raw = readFileSync(join(SERVICES, `${slug}.md`), "utf-8").replace(
    /\r\n/g,
    "\n"
  )
  const body = splitFrontmatter(raw)?.body ?? ""
  const read = readFrontmatter(raw)
  const colors = (
    read.ok ? (findKey(read.keys, "colors")?.value ?? {}) : {}
  ) as Record<string, string>
  const literals = new Set<string>()
  const refs = new Map<string, string>()
  for (const [key, value] of Object.entries(colors)) {
    const target = /^\{colors\.([^}]+)\}$/.exec(value)?.[1]
    if (target) refs.set(key, target)
    else literals.add(key)
  }
  // Only the `## Colors` section: other sections have two-column tables too
  // (radius aliases, type ramps) whose cells could look like palette steps.
  const [, afterHeading = ""] = body.split(/^## Colors[ \t]*$/m)
  const colorsSection = afterHeading.split(/^## /m)[0]
  const tableRows = colorsSection
    .split("\n")
    .filter((line) => /^\s*\|\s*`/.test(line))
    .map((line) =>
      line
        .trim()
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim())
    )
  return { literals, refs, tableRows, colorsSection }
}

// spec-config `color_roles`.
const SPEC_COLOR_ROLES = new Set([
  "primary",
  "secondary",
  "tertiary",
  "neutral",
])

// A reference row's key less its theme marking — the `dark-` prefix, the one
// spelling the catalogue uses for a dark twin (#625).
const bare = (key: string): string => key.replace(/^dark-/, "")

const spans = (cell: string): Array<string> =>
  [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1])

// A cell that is exactly one `{colors.x}` reference. Anything else — color-mix,
// a literal, an opacity note — carries prose and lives in the table only.
const single = (cell: string): string | undefined =>
  /^`\{colors\.([^}]+)\}`$/.exec(cell)?.[1]

// Table roles whose light and dark cells are each one reference: the role's
// row and its `dark-` twin. Primitives do not change with the theme, so the
// twin points at an unprefixed palette key.
function singleReferenceRoles(
  tableRows: Array<Array<string>>
): Map<string, string> {
  const expected = new Map<string, string>()
  for (const [roleCell, light = "", dark = ""] of tableRows) {
    const [name] = spans(roleCell)
    // ridi's emotion-group table leads with a `{colors.x}` key, not a role.
    // Skip by that shape, not by what a role name looks like — a name filter
    // would also drop a role whose name it did not foresee.
    if (!name || name.startsWith("{colors.")) continue
    const l = single(light)
    const d = single(dark)
    if (l) expected.set(name, l)
    if (d) expected.set(`dark-${name}`, d)
  }
  return expected
}

function expectRowsToMatch(
  slug: string,
  expected: Map<string, string>,
  refs: Map<string, string>,
  literals: Set<string>
): void {
  for (const target of expected.values()) {
    expect(
      literals.has(target),
      `${slug}: ${target} is not a palette key`
    ).toBe(true)
  }
  // A table role under a spec colour-role name stays in the table only
  // (.claude/rules/catalog.md), so it is dropped from what the rows must match. Left in, it
  // would demand the very row refused below.
  const owed = [...expected].filter(([key]) => !SPEC_COLOR_ROLES.has(bare(key)))
  // A table with nothing left to compare would make the assertions vacuous.
  expect(owed.length, `${slug}: no table roles parsed`).toBeGreaterThan(0)
  // The #381 brand alias (`primary: "{colors.blue500}"`) points at the brand
  // colour, not at a table role, so it is not compared. The other spec role
  // names have no such procedure, and a row under one is refused here.
  // `dark-primary` is refused too — the alias has no dark twin.
  const roleRows = [...refs].filter(([key]) => key !== "primary")
  const specNamed = roleRows
    .map(([key]) => key)
    .filter((key) => SPEC_COLOR_ROLES.has(bare(key)))
  expect(
    specNamed,
    `${slug}: reference rows under a spec colour-role name`
  ).toEqual([])
  expect(Object.fromEntries(roleRows), slug).toEqual(Object.fromEntries(owed))
}

// One comparison per entry that publishes its role table twice. Registering
// an entry and writing its comparison are the same edit: the guard at the end
// checks the detected entries against these keys, so an entry cannot be
// listed without a case, nor use the form without being listed.
const CASES: Record<string, { title: string; check: () => void }> = {
  banksalad: {
    title: "family slots by the slot table, roles light and `dark-` twin",
    check: () => {
      const { literals, refs, tableRows, colorsSection } = load("banksalad")
      // `background-highlight` / `background-dim` carry `× 불투명도 …` and fall
      // out — they are painted through a separate opacity variable, so a
      // reference row would hand standard tools an opaque colour. Theme-invariant
      // roles say "`dark-` 짝 없음" and owe no twin.
      const expected = singleReferenceRoles(tableRows)
      // The five family slots are one rule for every family, written once as
      // an unbackticked table (`| bg | 95 | 20 (gray 만 25) |`) that tableRows
      // does not see, so it is read here and expanded over the palette families.
      const slots = [
        ...colorsSection.matchAll(
          /^\| (bg|weak|normal|strong|heavy) \| (\d+) \| (\d+)(?: \(([a-z-]+) 만 (\d+)\))? \|$/gm
        ),
      ]
      expect(slots.length, "slot table parsed").toBe(5)
      const families = new Set(
        [...literals]
          .filter((key) => !/^(legacy|dark)-/.test(key))
          .map((key) => /^([a-z-]+)-\d+$/.exec(key)?.[1])
          .filter((family): family is string => family !== undefined)
      )
      expect(families.size, "palette families").toBe(16)
      for (const [, slot, light, dark, odd, oddDark] of slots) {
        for (const family of families) {
          expected.set(`${family}-${slot}`, `${family}-${light}`)
          const step = family === odd ? oddDark : dark
          expected.set(`dark-${family}-${slot}`, `${family}-${step}`)
        }
      }
      expectRowsToMatch("banksalad", expected, refs, literals)
    },
  },
  "seed-design": {
    title: "every role, light and `dark-` twin",
    check: () => {
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
    },
  },
  greeting: {
    title: "roles light and `dark-` twin, brand alias off the text ladder",
    check: () => {
      const { literals, refs, tableRows } = load("greeting")
      const expected = new Map<string, string>()
      // Every light palette step the text ladder points at (`primary` →
      // `neutral600`, … `disabled` → `neutral300`).
      const TEXT_ROLES = new Set([
        "primary",
        "secondary",
        "tertiary",
        "disabled",
      ])
      const textColours = new Set<string>()
      for (const [roleCell, paletteCell] of tableRows) {
        const roles = spans(roleCell)
        // The table names one palette step per role, and the dark twin points
        // at that step's `dark-` key. A `x`(L) / `y`(D) cell — `baseBackground`,
        // which picks another step in dark — names each theme's step itself.
        const split = /^`([^`]+)`\(L\) \/ `([^`]+)`\(D\)$/.exec(paletteCell)
        const palette = split ? [split[1]] : spans(paletteCell)
        const darkPalette = split
          ? [`dark-${split[2]}`]
          : palette.map((p) => `dark-${p}`)
        // The `effect1` / … / `effect4` row pairs positionally with its palette.
        if (roles.length !== palette.length) continue
        if (!palette.every((p) => literals.has(p))) continue
        roles.forEach((role, i) => {
          expected.set(role, palette[i])
          expected.set(`dark-${role}`, darkPalette[i])
          if (TEXT_ROLES.has(role)) textColours.add(palette[i])
        })
      }
      expect(textColours.size, "text ladder parsed").toBe(4)
      // greeting's text ladder is named like the spec's brand roles. `primary`
      // may still appear as the #381 brand alias, but never pointing at any text
      // colour — the spec would read body text as the brand's key colour.
      const primary = refs.get("primary")
      if (primary) expect(textColours.has(primary), primary).toBe(false)
      expectRowsToMatch("greeting", expected, refs, literals)
    },
  },
  codeit: {
    title: "bundle names, single-step roles only",
    check: () => {
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
    },
  },
  likelion: {
    title: "single-reference roles by the palette column, no dark twin",
    check: () => {
      const { literals, refs, tableRows } = load("likelion")
      // Opacity-ramp and gradient roles carry prose and fall out. The third
      // column is the upstream variable, not a dark cell — likelion publishes
      // no dark semantic theme — and is never one bare reference, so the
      // shared reader yields no `dark-` expectation from it. Pinned, so a
      // future edit to that column cannot demand a phantom twin.
      const expected = singleReferenceRoles(tableRows)
      expect(
        [...expected.keys()].filter((key) => key.startsWith("dark-")),
        "likelion: dark twins read from the upstream-variable column"
      ).toEqual([])
      expectRowsToMatch("likelion", expected, refs, literals)
    },
  },
  ridi: {
    title: "single-reference roles, light and `dark-` twin",
    check: () => {
      const { literals, refs, tableRows } = load("ridi")
      const expected = singleReferenceRoles(tableRows)
      expectRowsToMatch("ridi", expected, refs, literals)
    },
  },
}

describe("role reference rows agree with the body role tables", () => {
  for (const [slug, { title, check }] of Object.entries(CASES)) {
    it(`${slug} — ${title}`, check)
  }

  it("passes a spec-named table role kept in the table, refuses its row", () => {
    // greeting keeps such roles in its table and so guards the first half;
    // no entry has carried such a row, so the refusal needs a fixture.
    const literals = new Set(["gray-500", "gray-600", "blue-500"])
    const expected = new Map([
      ["secondary", "gray-500"],
      ["dark-secondary", "gray-600"],
      ["bg-brand", "blue-500"],
    ])
    const tableOnly = new Map([["bg-brand", "blue-500"]])
    expectRowsToMatch("fixture", expected, tableOnly, literals)
    const withRow = new Map([...tableOnly, ["secondary", "gray-500"]])
    expect(() =>
      expectRowsToMatch("fixture", expected, withRow, literals)
    ).toThrow(/spec colour-role name/)
  })

  it("has a case for every entry whose reference rows alias its role table", () => {
    // Detected by shape, not by listing: a reference row whose key — less a
    // `dark-` prefix, and with codeit's `text-` / `background-` read as `txt-` /
    // `bg-` — is a backticked name in the first column of the entry's own `## Colors`
    // tables. Older reference rows elsewhere (toss's role chains, vapor-ui's
    // aliases) name no table role and are not caught. A role table written
    // without backticks, or with the role outside the first column, is not
    // seen either — .claude/rules/catalog.md states that shape.
    const docsName = (key: string): string =>
      bare(key)
        .replace(/^text-/, "txt-")
        .replace(/^background-/, "bg-")
    const using = readdirSync(SERVICES)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.slice(0, -".md".length))
      .filter((slug) => {
        const { refs, tableRows } = load(slug)
        const roles = new Set(tableRows.flatMap(([cell]) => spans(cell)))
        return [...refs.keys()].some(
          // The #381 `primary` alias is not this form — the comparison leaves
          // it out too — even where a table row is named `primary`.
          (key) =>
            key !== "primary" &&
            (roles.has(bare(key)) || roles.has(docsName(key)))
        )
      })
      .sort()
    expect(using).toEqual(Object.keys(CASES).sort())
  })
})
