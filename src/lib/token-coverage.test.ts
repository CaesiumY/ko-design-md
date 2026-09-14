import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { countDefinitions } from "./oklch-sync"
import { readDefinitions } from "./oklch-drift"
import { findFontDisplaySrc } from "./preview-validator"

// Coverage ratchets for the token gates.
//
// WHY THIS FILE EXISTS. Every gate that reads design tokens does so with a
// regex, and every one of them fails the same way: it matches nothing and
// reports success. `audit:oklch` prints "0 token(s) mismatched" whether it
// compared 918 definitions or zero. The drift gate is the same. So is the spec
// linter, which swallows an unresolvable token reference without a finding.
// Four gates, four green exits, nothing checked.
//
// That is not hypothetical. Moving tokens into YAML frontmatter — the migration
// this file was written to protect — breaks both regexes at once if the emitter
// quotes values or the reader keeps its column-0 anchor. Measured on a synthetic
// migrated line: quoting drops `countDefinitions` from 1 to 0 and
// `readDefinitions` from 1 to 0; indenting alone still drops `readDefinitions`.
// Both gates then pass.
//
// `oklch-drift-corpus.test.ts` already carries this idea for one gate (its
// MATCH_FLOOR exists because "a regex that silently stops matching" must fail
// loudly). These assertions extend it to the rest.
//
// WHEN A NUMBER MOVES, DO NOT EDIT IT TO MATCH. Find out what stopped being
// seen first. A number that legitimately changes — a new catalog entry, a token
// added — moves UP; a number that drops is the failure this file exists to
// catch.
//
// PER ENTRY, NOT A CATALOG TOTAL (issue #324). Two exact totals used to live
// here, and every catalog PR had to rewrite the same two lines for its own
// base — so of two PRs open at once, whichever merged second failed, and its
// author then re-counted the whole catalog to get green. That re-count is
// where a drop elsewhere hides: the number that lands is "what makes the test
// pass", not "what this entry contributed". A row per entry means a PR touches
// only its own row, and the diff of that row IS the claim.
//
// EXACT IN BOTH DIRECTIONS, unlike `MATCH_FLOOR` next door. A floor is right
// there because more coverage is strictly better; here a number that RISES can
// mean the reader widened. Measured with the real reader, not a regex of this
// file's own: dropping the frontmatter scope in `allDefinitions` moves the
// catalog from 1472 to 1474 — teamsparta 28 → 29 (`input-focus-ring`) and
// wanted 111 → 112 (`fg`), the two body-fence rows the scope exists to
// exclude. A floor passes that. This table does not.

const SERVICES_DIR = path.resolve(process.cwd(), "services")

function catalogFiles(): Array<string> {
  return fs
    .readdirSync(SERVICES_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort()
}

function readAll(): Array<{ slug: string; raw: string }> {
  return catalogFiles().map((f) => ({
    slug: f.replace(/\.md$/, ""),
    raw: fs.readFileSync(path.join(SERVICES_DIR, f), "utf-8"),
  }))
}

interface Coverage {
  /** `name: oklch(…)  # #hex` pairs `countDefinitions` sees — what feeds `audit:oklch`. */
  annotated: number
  /** The subset it can actually judge: one hex on the line. */
  judged: number
  /** Names `readDefinitions` resolves for the drift gate, self-conflicts dropped. */
  drift: number
  /** The entry names a display face through a `font-display-src` webfont. */
  webfont?: true
}

// One row per entry. Update only the row for the entry your change touches;
// the failure messages below print the measured numbers, and nothing else in
// the repo does.
//
// `annotated: 0` is a fact about the entry, not a broken regex: baemin,
// bezier, teamsparta and toss comment their colours in prose with no hex, so
// `audit:oklch` has nothing to judge there. `drift: 0` is a different claim
// and is refused below.
const TOKEN_COVERAGE: Partial<Record<string, Coverage>> = {
  "11st": { annotated: 31, judged: 31, drift: 33 },
  baemin: { annotated: 0, judged: 0, drift: 37 },
  bezier: { annotated: 0, judged: 0, drift: 43 },
  class101: { annotated: 34, judged: 33, drift: 34 },
  codeit: { annotated: 166, judged: 159, drift: 166, webfont: true },
  gmarket: { annotated: 85, judged: 85, drift: 89 },
  greeting: { annotated: 56, judged: 56, drift: 65 },
  "gs-retail": { annotated: 23, judged: 23, drift: 23 },
  "gs-shop": { annotated: 52, judged: 52, drift: 52 },
  krds: { annotated: 44, judged: 44, drift: 55 },
  kyobobook: { annotated: 26, judged: 26, drift: 56 },
  likelion: { annotated: 23, judged: 23, drift: 23 },
  "line-design-system": { annotated: 24, judged: 24, drift: 24 },
  "seed-design": { annotated: 229, judged: 229, drift: 241 },
  socar: { annotated: 56, judged: 56, drift: 59 },
  teamsparta: { annotated: 0, judged: 0, drift: 28 },
  toss: { annotated: 0, judged: 0, drift: 37 },
  "vapor-ui": { annotated: 223, judged: 223, drift: 223 },
  wanted: { annotated: 13, judged: 12, drift: 111, webfont: true },
  yeogi: { annotated: 51, judged: 51, drift: 73, webfont: true },
}
// Column sums when the table was written (2026-09-12): annotated 1136, judged
// 1127, drift 1472. Deliberately not asserted — a total is the shared line
// this table exists to remove.

describe("token gate coverage", () => {
  const docs = readAll()

  // Measured once, through the real readers. Never re-derive these with a
  // regex of this file's own: a hand-written proxy over-counted the scope-drop
  // figure above by one, because it kept a name `readDefinitions` drops as a
  // self-conflict.
  const measured = new Map<string, Coverage>(
    docs.map(({ slug, raw }) => {
      const c = countDefinitions(raw)
      const row: Coverage = {
        annotated: c.annotated,
        judged: c.judged,
        drift: readDefinitions(raw).size,
      }
      if (findFontDisplaySrc(raw) !== null) row.webfont = true
      return [slug, row]
    })
  )

  function moved(field: "annotated" | "judged" | "drift"): Array<string> {
    const out: Array<string> = []
    for (const [slug, m] of measured) {
      const row = TOKEN_COVERAGE[slug]
      if (row === undefined) continue // the accounting test reports it
      if (m[field] !== row[field])
        out.push(`${slug} ${field} ${row[field]} → ${m[field]}`)
    }
    return out
  }

  it("reads the whole catalog", () => {
    // A glob that silently matched nothing would make every assertion below
    // vacuous — the exact failure mode this file guards against, one level up.
    expect(docs.length).toBeGreaterThan(10)
  })

  it("accounts for every entry in the catalog", () => {
    // Both directions. A new entry has to be recorded on purpose; a row that
    // outlives its entry means the table has stopped describing the catalog.
    const unrecorded = [...measured].filter(
      ([slug]) => !(slug in TOKEN_COVERAGE)
    )
    // Print the row itself, not just the name: nothing else in the repo
    // reports these numbers, so a message that only says "record them" leaves
    // no way to obtain them.
    const rows = unrecorded
      .map(
        ([slug, m]) =>
          `  "${slug}": { annotated: ${m.annotated}, judged: ${m.judged}, drift: ${m.drift}${m.webfont ? ", webfont: true" : ""} },`
      )
      .join("\n")
    expect(
      unrecorded.map(([slug]) => slug),
      `these entries have no row in TOKEN_COVERAGE — paste, then read (a drift of 0 is refused; an annotated of 0 can be right):\n${rows}`
    ).toEqual([])

    const stale = Object.keys(TOKEN_COVERAGE).filter((s) => !measured.has(s))
    expect(
      stale,
      `TOKEN_COVERAGE records entries services/ no longer has: ${stale.join(", ")}. Delete the row in the same change that removes the entry, so the table cannot keep vouching for a file nobody reads.`
    ).toEqual([])
  })

  it("keeps audit:oklch comparing the annotated definitions it can see", () => {
    // `countDefinitions` feeds `pnpm audit:oklch`. `annotated` is every
    // `name: oklch(…)  # #hex` pair; `judged` is the subset it can actually
    // compare (the rest name more than one hex on the line and are skipped).
    const diffs = [...moved("annotated"), ...moved("judged")]
    expect(
      diffs,
      `recorded → measured: ${diffs.join(", ")}. DOWN means OKLCH_ANNOTATED_DEFINITION or OKLCH_DEFINITION stopped seeing lines it used to judge — read oklch-sync.ts before touching this table. UP is legitimate only if THIS change added those definitions; a rise on an entry you did not edit is the pattern widening. Edit only the row for the entry you touched.`
    ).toEqual([])
  })

  it("keeps the drift gate resolving the definitions it compares", () => {
    // `readDefinitions` is what `findPreviewDrift` compares a preview against.
    // It drops names that disagree with themselves, so a row that drops is also
    // how a reintroduced duplicate-value collision shows up.
    const diffs = moved("drift")
    expect(
      diffs,
      `recorded → measured: ${diffs.join(", ")}. DOWN with no token deleted usually means a name now disagrees with itself and readDefinitions dropped it — \`pnpm validate:catalog\` names each one. UP with no token added means the reader is matching outside the frontmatter token maps (measured once at +2: teamsparta 29, wanted 112).`
    ).toEqual([])
  })

  it("keeps every entry contributing definitions to the drift gate", () => {
    // Equivalent to measuring live, because the assertion above pins measured
    // to recorded — and stated here it is refused while the author is typing
    // the row. That equivalence holds only while `drift` stays exact; loosen it
    // to a floor and this has to go back to reading the files.
    const zero = Object.entries(TOKEN_COVERAGE)
      .filter(([, c]) => c?.drift === 0)
      .map(([slug]) => slug)
    expect(
      zero,
      `these entries are recorded as contributing nothing to the drift gate: ${zero.join(", ")}. A 0 here means findPreviewDrift has no md-side name to compare for the whole entry — fix the frontmatter token map instead of recording the zero. (\`annotated: 0\` is a different claim and is allowed.)`
    ).toEqual([])
  })

  it("keeps every webfont source reachable to the preview validator", () => {
    // `findFontDisplaySrc` is how a brand's own display face reaches the
    // preview `<head>`. When it stops matching, the preview silently falls back
    // to Pretendard and nothing fails — the gap that shipped on `wanted`.
    //
    // This calls the real function rather than re-testing its regex against the
    // raw file. An earlier version of this assertion did the latter, and would
    // have stayed green through exactly the breakage it was written to catch:
    // moving the webfont line into frontmatter makes the function return null
    // for every entry while a raw-text regex still finds the same matches.
    //
    // Compared as a set derived from the table, not as a literal list. The
    // list was the last line every webfont-bearing entry had to edit — the
    // same shared line the totals were.
    const recorded = Object.entries(TOKEN_COVERAGE)
      .filter(([, c]) => c?.webfont === true)
      .map(([slug]) => slug)
      .sort()
    const resolved = [...measured]
      .filter(([, m]) => m.webfont === true)
      .map(([slug]) => slug)
      .sort()
    expect(
      resolved,
      `entries whose font-display-src the validator resolves differ from the rows marked \`webfont: true\` — if the function stopped matching, the preview silently falls back to Pretendard; if an entry gained a display face, mark its row.`
    ).toEqual(recorded)
  })
})
