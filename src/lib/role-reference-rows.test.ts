import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { findKey, readFrontmatter } from "./frontmatter"
import { alignToPreviewNames } from "./oklch-drift"
import { splitFrontmatter } from "./frontmatter-fence"
import { deltaE, hexToOklab, parseOklch } from "./oklch-convert"
import { ALPHA_TOLERANCE, DELTA_E_TOLERANCE } from "./oklch-tolerance"

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
// palette token, or to another such role, has its row(s) — save one under a
// spec colour-role name, which stays in the table — and no row exists without
// a table role behind it.

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
// row and its `dark-` twin, keyed as the table writes them. Where the twin
// points — a `dark-` palette, an unprefixed key, or another role's `dark-`
// twin — is each entry's own upstream; `expectRowsToMatch` holds only that a
// role → role twin keeps its theme.
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
  // A target is a palette key, or another role's row that ends at one — the
  // upstream's role → role hop is kept, not collapsed (#661). Walked here so
  // an undeclared key or a loop fails by name.
  const endsAtPalette = (target: string): boolean => {
    const seen = new Set<string>()
    let at: string | undefined = target
    while (at !== undefined && !seen.has(at)) {
      if (literals.has(at)) return true
      seen.add(at)
      at = refs.get(at)
    }
    return false
  }
  for (const target of expected.values()) {
    expect(
      endsAtPalette(target),
      `${slug}: ${target} is neither a palette key nor a role row that ends at one`
    ).toBe(true)
  }
  // A role → role row keeps its theme: a `dark-` twin points at the pointed
  // role's `dark-` twin where it has one, and a light row at no `dark-` role.
  const crossed = [...expected]
    .filter(([, to]) => refs.has(to) && !literals.has(to))
    .filter(([key, to]) =>
      key.startsWith("dark-")
        ? !to.startsWith("dark-") && refs.has(`dark-${to}`)
        : to.startsWith("dark-")
    )
    .map(([key, to]) => `${key} points at ${to}`)
  expect(
    crossed,
    `${slug}: role → role twins must keep their theme: ${crossed.join(", ")}`
  ).toEqual([])
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
  bezier: {
    title:
      "stable roles to `stable-*`, beta roles to beta steps, light and `dark-` twin",
    check: () => {
      const { literals, refs, tableRows } = load("bezier")
      // Two published role layers, each pointing at its own tier's primitives.
      // The stable tier's are carried as `stable-*` keys, so a stable colour
      // role (`bg-*` · `txt-*` · `bgtxt-*` · `bdr-*` · `shdw-*`) aliases a
      // `stable-*` key and a beta role a beta step —
      // never across, even where the values match. Neither tier redefines a
      // primitive per theme, so a `dark-` twin points at an unprefixed key.
      // The beta roles upstream writes as hex (`*-hovered`,
      // `chart-theme-default-*`) are literal values (hex ≈ OKLCH) and fall
      // out here.
      // A stable-tier role name, matched on the bare name (no backticks, no
      // `dark-` prefix) in both the table and the rows.
      const STABLE_ROLE = /^(bg|txt|bgtxt|bdr|shdw)-/
      const STABLE_KEY = /^stable-/
      const stableRows = tableRows.filter(([cell]) =>
        STABLE_ROLE.test(spans(cell)[0] ?? "")
      )
      // Both layers' tables must have parsed, or a dropped one would pass.
      expect(stableRows.length, "bezier: stable table rows").toBeGreaterThan(0)
      // Every stable cell is exactly one `stable-*` reference: a beta key, a
      // value, or a reference with words after it all fail here.
      const loose = stableRows.flatMap(([roleCell, light = "", dark = ""]) =>
        [light, dark]
          .filter((cell) => !STABLE_KEY.test(single(cell) ?? ""))
          .map((cell) => `${spans(roleCell)[0]}: ${cell}`)
      )
      expect(
        loose,
        "bezier: stable cells must each be one `{colors.stable-*}`"
      ).toEqual([])
      const expected = singleReferenceRoles(tableRows)
      expect(
        [...expected.keys()].some((key) =>
          /^(text|icon|fill|border|surface)\b/.test(bare(key))
        ),
        "bezier: beta role rows"
      ).toBe(true)
      expect(
        [...expected]
          .filter(
            ([key, to]) => !STABLE_ROLE.test(bare(key)) && STABLE_KEY.test(to)
          )
          .map(([key]) => key),
        "bezier: beta roles must not reference `stable-*` keys"
      ).toEqual([])
      expectRowsToMatch("bezier", expected, refs, literals)
      // The literal cells write the upstream hex beside its OKLCH
      // (`#9698ffff ≈ \`oklch(…)\``). `audit:oklch` does not read tables
      // (draft-validator.ts `scanBody` table note), so the pair is held here
      // with that gate's own tolerances. Every cell that is not one reference
      // must have this shape, so a malformed cell fails instead of dropping out
      // of the comparison: a 6- or 8-digit hex (the table has no shorthand), a
      // backticked OKLCH, and nothing after but the note a cell whose hex
      // equals an upstream primitive carries — naming either a palette key of
      // this entry or an upstream step it does not carry.
      const LITERAL_CELL =
        /^(#[0-9a-f]{6}(?:[0-9a-f]{2})?) ≈ `(oklch\([^)`]*\))`(?: — hex 가 (?:원시값 `([a-z0-9-]+)`|상류 원시값 `([a-z0-9-]+)`\(이 문서에 싣지 않은 단계\)) 그대로, 참조 아님)?$/i
      const literalCells = tableRows.flatMap(([roleCell, ...cells]) =>
        cells
          .filter((cell) => single(cell) === undefined)
          .map((cell) => ({ role: spans(roleCell)[0], cell }))
      )
      expect(
        literalCells
          .filter(({ cell }) => !LITERAL_CELL.test(cell))
          .map(({ role, cell }) => `${role}: ${cell}`),
        "bezier: non-reference cells must be `#hex ≈ \\`oklch(…)\\``"
      ).toEqual([])
      expect(
        literalCells.length,
        "bezier: literal cells parsed"
      ).toBeGreaterThan(0)
      const pairs = literalCells.map(({ cell }) => {
        const [, hex, oklch, carried, uncarried] = LITERAL_CELL.exec(cell) ?? []
        return { cell, hex, oklch, carried, uncarried }
      })
      // ΔE always. Alpha always too: an 8-digit hex below `ff` needs the
      // OKLCH to carry that alpha, so a dropped `/ 0.30` fails.
      const off = pairs.filter(({ hex, oklch }) => {
        const want = hexToOklab(hex)
        const wrote = parseOklch(oklch)
        if (!want || !wrote) return true
        const alphaOff =
          Math.abs((want.alpha ?? 1) - (wrote.alpha ?? 1)) > ALPHA_TOLERANCE
        return deltaE(wrote.lab, want.lab) > DELTA_E_TOLERANCE || alphaOff
      })
      expect(
        off.map(({ cell }) => cell),
        "bezier: table OKLCH must match its upstream hex"
      ).toEqual([])
      // The note's primitive: a palette key must carry the same hex on its
      // line; a step named as uncarried must really be absent from the palette.
      const raw = readFileSync(join(SERVICES, "bezier.md"), "utf-8")
      const lineHex = new Map(
        [
          ...raw.matchAll(
            /^ {2}([a-z0-9-]+): oklch\([^)]*\) +# (#[0-9a-f]+)/gm
          ),
        ].map((m) => [m[1], m[2].toLowerCase()])
      )
      const wrongNote = pairs.flatMap(({ cell, hex, carried, uncarried }) => {
        if (carried && lineHex.get(carried) !== hex.toLowerCase()) return [cell]
        if (uncarried && literals.has(uncarried)) return [cell]
        return []
      })
      expect(
        wrongNote,
        "bezier: a note's primitive must match the palette or be absent from it"
      ).toEqual([])
      expect(
        pairs.some(({ carried }) => carried) &&
          pairs.some(({ uncarried }) => uncarried),
        "bezier: both note forms parsed"
      ).toBe(true)
      // The `## Colors` audit note and the Semantic paragraph state these row
      // counts in prose (CODING_STANDARDS 「개수」), so they are pinned here: a
      // row added or dropped must update the prose with the count. How many
      // of the beta targets the entry already carried before the re-audit and
      // how many it added (84 + 46) is a dated record, not a table count, and
      // stays unpinned.
      const roleRows = tableRows.filter(
        ([cell]) => !(spans(cell)[0] ?? "").startsWith("{colors.")
      )
      const betaRows = roleRows.filter(
        ([cell]) => !STABLE_ROLE.test(spans(cell)[0] ?? "")
      )
      const literalRows = betaRows.filter(([, light = "", dark = ""]) =>
        [light, dark].every((cell) => single(cell) === undefined)
      )
      // A beta role row is either two single references or two literal cells.
      // A row with one of each would pass both checks above — the reference
      // half against its row, the literal half against its hex — so it is
      // refused here.
      const mixedRows = betaRows
        .filter(([, light = "", dark = ""]) => {
          const refsInRow = [light, dark].filter(
            (cell) => single(cell) !== undefined
          ).length
          return refsInRow === 1
        })
        .map(([cell]) => spans(cell)[0])
      expect(
        mixedRows,
        "bezier: beta rows must be all-reference or all-literal"
      ).toEqual([])
      const proseCounts = {
        stableRoles: stableRows.length,
        ...Object.fromEntries(
          ["bg", "txt", "bgtxt", "bdr", "shdw"].map((family) => [
            `stable-${family}`,
            stableRows.filter(([c]) => spans(c)[0]?.startsWith(`${family}-`))
              .length,
          ])
        ),
        betaRoles: betaRows.length,
        betaReferenceRoles: betaRows.length - literalRows.length,
        betaLiteralRoles: literalRows.length,
        hovered: literalRows.filter(([c]) => /-hovered`$/.test(c)).length,
        chart: literalRows.filter(([c]) =>
          /^`chart-theme-default-\d+`$/.test(c)
        ).length,
        rowsWithPrimitiveNote: literalRows.filter((row) =>
          row.slice(1).some((cell) => cell.includes(" — hex 가 "))
        ).length,
        // Distinct palette keys the beta reference rows point at.
        betaTargets: new Set(
          [...refs]
            .filter(
              ([key]) => key !== "primary" && !STABLE_ROLE.test(bare(key))
            )
            .map(([, to]) => to)
        ).size,
      }
      expect(proseCounts, "bezier: row counts the prose states").toEqual({
        stableRoles: 103,
        "stable-bg": 22,
        "stable-txt": 5,
        "stable-bgtxt": 65,
        "stable-bdr": 5,
        "stable-shdw": 6,
        betaRoles: 346,
        betaReferenceRoles: 163,
        betaLiteralRoles: 183,
        hovered: 173,
        chart: 10,
        rowsWithPrimitiveNote: 19,
        betaTargets: 130,
      })
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
  gmarket: {
    title: "light-only roles, each one palette step",
    check: () => {
      const { literals, refs, tableRows } = load("gmarket")
      // GDS publishes no dark palette, so the table has no dark column and no
      // role owes a `dark-` twin. Its third column is usage prose, which
      // `single` never reads as a reference.
      const expected = singleReferenceRoles(tableRows)
      expect(
        [...expected.keys()].filter((key) => key.startsWith("dark-")),
        "gmarket: dark twins in a light-only system"
      ).toEqual([])
      expectRowsToMatch("gmarket", expected, refs, literals)
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
  socar: {
    title: "light-only roles, one palette step each",
    check: () => {
      const { literals, refs, tableRows } = load("socar")
      // SOCAR Frame is light-only, so the table has no dark column: its third
      // column is where the role is used, which singleReferenceRoles would read
      // as a dark cell. Only the role and its palette cell are compared.
      const expected = new Map<string, string>()
      for (const [roleCell, paletteCell = ""] of tableRows) {
        const [name] = spans(roleCell)
        const target = single(paletteCell)
        if (name && target) expected.set(name, target)
      }
      expectRowsToMatch("socar", expected, refs, literals)
      // The `## Colors` audit note and the table's lead sentence state these
      // counts in prose, so they are pinned here: a row added or dropped must
      // update the prose with the count. The 20 palette steps added on
      // 2026-11-01 are a dated record in the audit note, not a count of the
      // document, and stay unpinned.
      const proseCounts = {
        referenceRows: [...refs.keys()].filter((key) => key !== "primary")
          .length,
        tableRows: tableRows.length,
        tableOnlyRows: tableRows.filter(
          ([, paletteCell = ""]) => single(paletteCell) === undefined
        ).length,
      }
      expect(proseCounts, "socar: counts the prose states").toEqual({
        referenceRows: 40,
        tableRows: 43,
        tableOnlyRows: 3,
      })
      // The preview declares roles as `--sf-text-primary: var(--sf-gray-800)`.
      // The drift gate reads only `oklch(…)` declarations, so nothing else
      // checks that a role property points at the step its md row names — a
      // role repointed at another step passed every gate. Read from the md
      // rows: each role's preview property must point at the same step, a
      // role the preview never declares is listed, and so is one it declares
      // as a literal instead of a palette reference.
      const preview = readFileSync(
        join(SERVICES, "..", "public", "preview", "socar", "preview.html"),
        "utf-8"
      ).replace(/\r\n/g, "\n")
      const block = (opener: string): Map<string, string> => {
        const start = preview.indexOf(opener)
        expect(start, `socar preview: ${opener} block`).toBeGreaterThan(-1)
        const body = preview.slice(start, preview.indexOf("}", start))
        return new Map(
          [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [
            m[1],
            m[2].trim(),
          ])
        )
      }
      // md name → preview property name, by the drift gate's own socar rule.
      const previewName = (md: string): string =>
        [...alignToPreviewNames(new Map([[md, ""]]), "socar").keys()].find(
          (key) => key !== md
        ) ?? md
      const light = block(":root {")
      const missing: Array<string> = []
      const literal: Array<string> = []
      const pointed = new Map<string, string>()
      for (const [role, step] of refs) {
        if (role === "primary") continue
        const declared = light.get(previewName(role))
        if (declared === undefined) {
          missing.push(role)
          continue
        }
        const target = /^var\(--([\w-]+)\)$/.exec(declared)?.[1]
        if (target === undefined) literal.push(role)
        else pointed.set(previewName(role), target)
        if (target !== undefined)
          expect(target, `socar preview: ${role}`).toBe(previewName(step))
      }
      expect(pointed.size, "socar preview: roles compared").toBe(24)
      expect(literal, "socar preview: roles declared as literals").toEqual([])
      // The preview demonstrates only some roles. Listed so a role that
      // starts or stops being declared is a visible change to this list.
      expect(missing.sort(), "socar preview: roles not declared").toEqual([
        "accent-cyan",
        "accent-green",
        "accent-indigo",
        "accent-lightblue",
        "accent-lime",
        "accent-magenta",
        "accent-orange",
        "accent-red",
        "accent-redorange",
        "border-weak",
        "divider-weak",
        "service-socar",
        "status-caution-strong",
        "status-information-strong",
        "status-negative-strong",
        "status-positive-strong",
      ])
      // SOCAR Frame is light-only: the dark half keeps SOCAR's light values on
      // its cards and darkens only the page shell, so its `--sf-*` block
      // restates the light one. Measured equal, and held equal — a dark-only
      // repointing would otherwise slip past the light comparison above.
      const dark = block('[data-theme="dark"] {')
      for (const [name, target] of pointed) {
        expect(dark.get(name), `socar preview dark: ${name}`).toBe(
          `var(--${target})`
        )
      }
    },
  },
  teamsparta: {
    title: "stack-tokens roles, light and `dark-` twin on one palette",
    check: () => {
      const { literals, refs, tableRows } = load("teamsparta")
      // `@teamsparta/stack-tokens` primitives do not change with the theme, so
      // a `dark-` twin points at an unprefixed step. Cells through an alpha ramp
      // (`neutralBlueAlpha[15]`) or a literal (`brand-faint`) are not single
      // references and fall out.
      const expected = singleReferenceRoles(tableRows)
      expectRowsToMatch("teamsparta", expected, refs, literals)
    },
  },
  toss: {
    title: "published adaptive roles, single-reference cells only",
    check: () => {
      const { literals, refs, tableRows } = load("toss")
      // `@toss/tds-colors` defines its adaptive roles as hex or rgba literals;
      // only the light `greyBackground` is named against a palette step (the
      // TDS Mobile Colors page's `lightThemeGrey100`). Literal-value and
      // opacity cells fall out.
      const expected = singleReferenceRoles(tableRows)
      expectRowsToMatch("toss", expected, refs, literals)
    },
  },
  "vapor-ui": {
    title: "every published alias, light and `dark-` twin",
    check: () => {
      const { literals, refs, tableRows } = load("vapor-ui")
      // `color-foreground-inverse` points at `color-white` in both cells: the
      // dark block redefines white to the same value, so the twin aliases the
      // unprefixed key.
      const expected = singleReferenceRoles(tableRows)
      expectRowsToMatch("vapor-ui", expected, refs, literals)
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

  it("passes a role pointing at another role, refuses an undeclared target", () => {
    // .claude/rules/catalog.md (#661): a role the upstream points at another
    // role keeps that hop — bezier alpha's `--alpha-color-primary-bg-normal:
    // var(--alpha-color-bg-blue-normal)`. No entry carries one yet, so the
    // fixture holds the acceptance.
    // A pointed role with no `dark-` twin does not change with the theme, so
    // both twins point at its one key (`bg-absolute-white`).
    const literals = new Set(["blue-300", "blue-400", "white"])
    const expected = new Map([
      ["bg-blue-normal", "blue-400"],
      ["dark-bg-blue-normal", "blue-300"],
      ["primary-bg-normal", "bg-blue-normal"],
      ["dark-primary-bg-normal", "dark-bg-blue-normal"],
      ["bg-absolute-white", "white"],
      ["bg-on-primary", "bg-absolute-white"],
      ["dark-bg-on-primary", "bg-absolute-white"],
    ])
    expectRowsToMatch("fixture", expected, new Map(expected), literals)
    const undeclared = new Map([...expected, ["primary-bg-normal", "bg-nope"]])
    expect(() =>
      expectRowsToMatch("fixture", undeclared, new Map(undeclared), literals)
    ).toThrow(/bg-nope/)
  })

  it("refuses a role → role twin that crosses theme", () => {
    // Upstream writes the hop once per theme block and lets the block pick the
    // pointed role's colour; the catalogue's keys carry the theme instead. So
    // a `dark-` twin pointing at a role with a `dark-` twin must point at that
    // twin — `bg-blue-normal` would hand the dark theme the light colour — and
    // a light row never points at a `dark-` role.
    const literals = new Set(["blue-300", "blue-400"])
    const roles: Array<[string, string]> = [
      ["bg-blue-normal", "blue-400"],
      ["dark-bg-blue-normal", "blue-300"],
    ]
    for (const [key, to] of [
      ["dark-primary-bg-normal", "bg-blue-normal"],
      ["primary-bg-normal", "dark-bg-blue-normal"],
    ]) {
      const crossed = new Map([...roles, [key, to]])
      expect(() =>
        expectRowsToMatch("fixture", crossed, new Map(crossed), literals)
      ).toThrow(new RegExp(`${key} points at ${to}`))
    }
  })

  it("has a case for every entry whose reference rows alias its role table", () => {
    // Detected by shape, not by listing: a reference row whose key — less a
    // `dark-` prefix, and with codeit's `text-` / `background-` read as `txt-` /
    // `bg-` — is a backticked name in the first column of the entry's own `## Colors`
    // tables. A reference row whose key names no table role is not caught. A role table written
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
