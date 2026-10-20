import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { readPreviewSlugs } from "../../scripts/audit-contrast-slugs"
import { BASELINE_TABLE, CONTRAST_BASELINE } from "./contrast-baseline"
import { OBSERVED_COLOURS, paletteOf, parsePairTable } from "./contrast-pairs"
import { renderTotalsTable } from "./contrast-report"
import type { PairTally } from "./contrast-pairs"

// The recorded contrast baseline against the repository it describes.
//
// WHY THIS FILE EXISTS. `contrast-baseline.ts` holds the table the gate
// compares against, and `docs/preview-contrast-baseline.md` holds the table a
// reader is told is the record. Two copies of the same rows go stale
// separately unless something reads both, and a document that calls itself the
// record while disagreeing with the gate is worse than no document: the gate
// says nothing about the doc, so nothing would ever surface the disagreement.
//
// The slug assertions are the other half. The gate only speaks about slugs its
// table has rows for, so a new catalogue entry with no rows would be swept,
// measured, and then silently not judged.

const ROOT = process.cwd()
const DOC = path.join(ROOT, "docs", "preview-contrast-baseline.md")
const PREVIEW_DIR = path.join(ROOT, "public", "preview")

// A `w/crlf` checkout hands back \r\n and the table would not be found in a
// document that holds it verbatim. The same Windows-only false failure
// CLAUDE.md records for `format:check` and `tokens:check`.
const read = (file: string): string =>
  fs.readFileSync(file, "utf-8").replace(/\r\n/g, "\n")

/**
 * The totals table as the document publishes it: from the header this table
 * alone carries, through the last unbroken `|` line under it.
 */
const tableInDoc = (): string => {
  const lines = read(DOC).split("\n")
  const start = lines.indexOf(BASELINE_TABLE.split("\n")[0])
  if (start === -1) return "(no totals table found in the document)"
  let end = start
  while (end + 1 < lines.length && lines[end + 1].startsWith("|")) end += 1
  return lines.slice(start, end + 1).join("\n")
}

describe("the recorded table", () => {
  it("round-trips through the writer that produces it", () => {
    // Before anything else: if the parser and the writer disagree, every other
    // assertion here is comparing two things neither of them can produce.
    expect(renderTotalsTable(CONTRAST_BASELINE)).toBe(BASELINE_TABLE)
  })

  it("is published verbatim in docs/preview-contrast-baseline.md", () => {
    // Cut out of the document and compared whole, rather than looked for
    // inside it. `toContain` is satisfied by a PREFIX: measured here by
    // deleting the last row from the constant, which left it a prefix of the
    // published table and passed. The document holds other tables too, so the
    // block is found by this one's header, which no other shares.
    expect(tableInDoc()).toBe(BASELINE_TABLE)
  })

  it("is published there exactly once", () => {
    // A second copy left behind by an edit makes it unanswerable which one a
    // reader is meant to believe.
    const header = BASELINE_TABLE.split("\n")[0]
    expect(read(DOC).split(`${header}\n`)).toHaveLength(2)
  })
})

describe("the recorded table against public/preview/", () => {
  const found = readPreviewSlugs(PREVIEW_DIR)
  const recorded = [...new Set(CONTRAST_BASELINE.map((r) => r.slug))].sort()

  it("reads a preview directory that is not empty", () => {
    // Every assertion below is vacuous against an empty directory, and an
    // empty one would make them all pass.
    expect(found.slugs.length).toBeGreaterThan(10)
  })

  it("finds every preview readable by the sweep", () => {
    // A slug the sweep cannot open is not a slug with nothing wrong: it is one
    // the baseline cannot speak for, and the table would still call itself the
    // record of the catalogue.
    expect({ split: found.split, unusable: found.unusable }).toEqual({
      split: [],
      unusable: [],
    })
  })

  it("records exactly the slugs the sweep can read", () => {
    expect(
      recorded,
      "A slug measured but not recorded, or recorded but not measured. `pnpm gate:contrast` prints the four lines for the first case; for the second, delete the four lines in the change that removed the preview. Numbers come from CI — see docs/preview-contrast-baseline.md."
    ).toEqual(found.slugs)
  })

  it("records four rows for every slug", () => {
    // light and dark, text and non-text. A slug with fewer has a half of the
    // sweep nothing is watching.
    const short = recorded.filter(
      (slug) => CONTRAST_BASELINE.filter((r) => r.slug === slug).length !== 4
    )
    expect(short).toEqual([])
  })

  it("records each slug, theme and kind exactly once", () => {
    // The comparison indexes the table by this triple, so a duplicated row
    // silently wins over the one it duplicates. Four-rows-per-slug does not
    // catch it on its own: two `light | text` rows and no `light | non-text`
    // still counts four.
    const keys = CONTRAST_BASELINE.map(
      (r) => `${r.slug} | ${r.theme} | ${r.kind}`
    )
    expect(keys).toEqual([...new Set(keys)])
  })

  it("records no text row that measured nothing", () => {
    // `measured: 0` for text is not a preview with no text. It is the
    // collector having failed to reach it, and recording the zero would take
    // that slug out of the gate without anyone deciding to.
    const empty = CONTRAST_BASELINE.filter(
      (r) => r.kind === "text" && r.measured === 0
    ).map((r) => `${r.slug} ${r.theme}`)
    expect(empty).toEqual([])
  })
})

describe("the published-pair tables against the recorded totals", () => {
  // Three times in one branch, a number written into prose went stale when the
  // table beside it changed — the CI run count, the catalogue size, and these
  // two. The document already tells its authors not to copy counts into prose;
  // this is the machine that holds them to it, because a reviewer catching it
  // a fourth time is not a process.
  //
  // Each table is tied to the recorded totals row by row (#397). For TEXT rows
  // that is a tie to the gate — their counts are exact in the recorded table —
  // so a PR that moves a text `borderline` or `fail` count of a classified
  // entry cannot land with a classification of the rows that were there before
  // it. Non-text `fail`/`borderline` are reference columns the gate only warns
  // about (`compareToBaseline`), so a non-text row here matches the recorded
  // column and goes stale with it.
  const doc = read(DOC)

  /** The pair table inside the section that opens with `heading`. */
  const section = (heading: string): string => {
    const start = doc.indexOf(`\n${heading}`)
    if (start === -1) return `(no section "${heading}" in the document)`
    const rest = doc.slice(start + 1)
    const next = rest.indexOf("\n## ", 1)
    return next === -1 ? rest : rest.slice(0, next)
  }
  const tableIn = (heading: string): Array<PairTally> => {
    const lines = section(heading).split("\n")
    const start = lines.findIndex((l) => l.startsWith("| slug | kind |"))
    // Said by name: handing an empty string on would surface as a "header"
    // error that points at the parser rather than at the missing section.
    if (start === -1) {
      throw new Error(`no pair table under "${heading}" in ${DOC}`)
    }
    let end = start
    while (end + 1 < lines.length && lines[end + 1].startsWith("|")) end += 1
    return parsePairTable(lines.slice(start, end + 1).join("\n"))
  }

  const HOW =
    "rerun `pnpm audit:contrast:pairs --findings <contrast-findings.json>` on the contrast-report artifact of the CI run the totals came from, and in docs/preview-contrast-baseline.md's published-pair sections paste both tables and replace CLASSIFIED_RUN in this test with the 'classified run' line the command prints (then `pnpm format`), write the run id in both CLASSIFIED_RUN.run and the borderline section's '입력은 run' line, and update what the tests here do not hold: the commit, and the dated observations and 'which slug first' paragraph beside the tables"

  const cases = [
    {
      verdict: "borderline",
      heading: "## 발행색끼리의 경계선",
    },
    { verdict: "fail", heading: "## 미달의 발행색 분류" },
  ] as const

  // The run the tables were last classified from, and every slug its artifact
  // measured. Those slugs are held exactly whether or not they still have rows
  // — so deleting an entry's rows from both tables, or a rerun in which its
  // counts reach zero, cannot exempt it — together with any slug on a table.
  //
  // A slug in neither set is an entry added after that run, and is left out
  // rather than failed: a new entry adds its baseline rows from CI's gate
  // output, and making it also rerun this classification would add one more
  // per-slug registry the onboarding skill does not know about. Whoever reruns
  // REPLACES this whole object with the `classified run` line the command
  // prints — it is a record of one artifact, not a list to edit — and the test
  // below holds its run id to the one the document names, and every slug on a
  // table to this list. A rerun that keeps the old slugs is still caught when
  // a newly measured entry has rows; one whose new entries all have no rows
  // yet is not — the rerun step above is what keeps the list whole.
  const CLASSIFIED_RUN = {
    run: "39456462373",
    slugs: [
      "11st",
      "baemin",
      "bezier",
      "class101",
      "codeit",
      "gmarket",
      "greeting",
      "gs-retail",
      "gs-shop",
      "krds",
      "kyobobook",
      "lg-electronics",
      "likelion",
      "line-design-system",
      "nol",
      "remember",
      "ridi",
      "samsung-one-ui",
      "seed-design",
      "socar",
      "teamsparta",
      "toss",
      "vapor-ui",
      "wanted",
      "yeogi",
      "zigbang",
    ],
  }
  const classified = (): Set<string> =>
    new Set([
      ...CLASSIFIED_RUN.slugs,
      ...[...tableIn(cases[0].heading), ...tableIn(cases[1].heading)].map(
        (t) => t.slug
      ),
    ])

  it("names the run its pinned slug list came from", () => {
    expect(
      section(cases[0].heading),
      `the pinned slug list records run ${CLASSIFIED_RUN.run} but the document names another — ${HOW}`
    ).toContain(`입력은 run \`${CLASSIFIED_RUN.run}\``)
  })

  it("pins every slug either table classifies", () => {
    // Both come from one artifact, so a slug on a table and missing here is a
    // list left over from an earlier run.
    const pinned = new Set(CLASSIFIED_RUN.slugs)
    const unpinned = [
      ...tableIn(cases[0].heading),
      ...tableIn(cases[1].heading),
    ]
      .map((t) => t.slug)
      .filter((slug) => !pinned.has(slug))
    expect(
      [...new Set(unpinned)],
      `slugs on a pair table but not in CLASSIFIED_RUN — ${HOW}`
    ).toEqual([])
  })

  for (const { verdict, heading } of cases) {
    describe(verdict, () => {
      it("adds up, slug by slug and kind by kind, to the recorded totals", () => {
        const slugs = classified()
        const recorded = new Map<string, number>()
        for (const r of CONTRAST_BASELINE) {
          if (r[verdict] === 0 || !slugs.has(r.slug)) continue
          const key = `${r.slug} ${r.kind}`
          recorded.set(key, (recorded.get(key) ?? 0) + r[verdict])
        }
        const published = new Map(
          tableIn(heading).map((t) => [`${t.slug} ${t.kind}`, t.total])
        )
        expect(
          Object.fromEntries(published),
          `the ${verdict} classification no longer matches the recorded totals — ${HOW}`
        ).toEqual(Object.fromEntries(recorded))
      })

      it("states in prose the totals its own table adds up to", () => {
        const table = tableIn(heading)
        const total = table.reduce((n, t) => n + t.total, 0)
        const both = table.reduce((n, t) => n + t.bothPublished, 0)
        expect(section(heading)).toContain(
          `\`${verdict}\` ${total}행 중 ${both}행이 두 색 모두 발행 토큰`
        )
      })
    })
  }

  it("names in the borderline section the row count its table adds up to", () => {
    const total = tableIn(cases[0].heading).reduce((n, t) => n + t.total, 0)
    expect(section(cases[0].heading)).toContain(
      `분류한 \`borderline\` ${total}행을`
    )
  })
})

describe("the observed colours", () => {
  // `paletteOf` throws on a heading or token it cannot find, but only when the
  // script runs — which is when someone already has an artifact in hand. Read
  // here, a renamed heading or token fails the PR that renamed it.
  for (const [slug, observed] of Object.entries(OBSERVED_COLOURS)) {
    it(`are headings or tokens in ${slug}'s colors map`, () => {
      const md = read(path.join(ROOT, "services", `${slug}.md`))
      expect(() => paletteOf(md, observed)).not.toThrow()
    })
  }
})
