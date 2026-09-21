import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { readPreviewSlugs } from "../../scripts/audit-contrast-slugs"
import { BASELINE_TABLE, CONTRAST_BASELINE } from "./contrast-baseline"
import { renderTotalsTable } from "./contrast-report"

// The recorded contrast baseline against the repository it describes.
//
// WHY THIS FILE EXISTS. `contrast-baseline.ts` holds the table the gate
// compares against, and `docs/preview-contrast-baseline.md` holds the table a
// reader is told is the record. Two copies of the same 84 rows go stale
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
    // published table and passed. The document holds four other tables, so the
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
