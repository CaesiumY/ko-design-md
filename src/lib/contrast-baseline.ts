// The recorded contrast baseline, and what counts as the sweep having moved
// away from it.
//
// Pure, and separate from `scripts/audit-contrast.ts` for the reason
// `contrast.ts` and `contrast-report.ts` are: the sweep needs a browser, so
// nothing it owns can be covered by `pnpm test`. The comparison IS the gate, so
// it lives where the gate's own tests can reach it.

import { parseTotalsTable, renderTotalsTable } from "./contrast-report"
import type { SlugTotals, Theme } from "./contrast-report"

/** A count this comparison can speak about. */
export type BaselineField =
  "measured" | "elements" | "fail" | "borderline" | "indeterminate"

export interface BaselineDiff {
  slug: string
  theme: Theme
  kind: "text" | "non-text"
  field: BaselineField
  recorded: number
  measured: number
}

export interface BaselineComparison {
  /** Differences that fail CI. */
  blocking: Array<BaselineDiff>
  /** Differences that are printed and allowed. */
  warnings: Array<BaselineDiff>
  /** Slugs the sweep measured that the baseline has no row for. */
  unrecorded: Array<SlugTotals>
  /** Baseline rows the sweep produced nothing for. */
  missing: Array<Pick<SlugTotals, "slug" | "theme" | "kind">>
}

const keyOf = (t: Pick<SlugTotals, "slug" | "theme" | "kind">): string =>
  `${t.slug}|${t.theme}|${t.kind}`

/**
 * The counts a text row must reproduce exactly, in both directions.
 *
 * Exact rather than a ceiling because a count that FALLS is as much a claim as
 * one that rises: it means either a preview got better — and the recorded table
 * should say so — or the collector stopped reaching something. A ceiling passes
 * both. Measured three times on 99aae06, the text half of the sweep was
 * identical every time (5371 rows, 1126 fail), so exactness costs nothing in
 * flakiness here. It is NOT applied to non-text; see NON_TEXT_SLACK.
 *
 * `elements` is deliberately absent. A showcase grid repeating one component
 * behind one CSS rule folds into one row, so adding a fifth copy of a card
 * raises `elements` without making the preview worse — the row is the unit a
 * fix touches, which is why it is the unit that is ratcheted.
 */
const EXACT_FIELDS: Array<BaselineField> = [
  "measured",
  "fail",
  "borderline",
  "indeterminate",
]

/**
 * How far a non-text row may measure below what was recorded before it blocks.
 *
 * One row, because one row is the whole of the movement anyone has observed.
 * Three sweeps of 99aae06 agreed on every text count and disagreed only about
 * `toss` non-text, by a row in each theme (dark measured 26 or 27, light 25 or
 * 26). The cause is a single element — `div.loader-3 > span.dot`, whose
 * `tds-pulse` keyframes animate `opacity` from 0.28, so the collector reads
 * whatever phase the sample lands in and the ratio, and therefore the row key,
 * moves with it. Playwright's `reducedMotion: "reduce"` does not pin it: only
 * three of the twenty-one previews carry a `prefers-reduced-motion` branch for
 * their animations to respond to.
 *
 * The animations are NOT paused for the sweep. Pausing would make every run
 * agree, but it would agree on one frame forever, and a frame that happens to
 * pass would hide a defect for good — the trade the collector already refuses
 * when it says a false positive costs a reader one line and a false negative
 * costs the survey its point.
 *
 * A slack of one does not weaken what the floor is for. A collector that stops
 * reaching a class of surface loses rows by the dozen, not by one.
 */
export const NON_TEXT_SLACK = 1

export function compareToBaseline(
  measured: Array<SlugTotals>,
  baseline: Array<SlugTotals>
): BaselineComparison {
  const recorded = new Map(baseline.map((b) => [keyOf(b), b]))
  const seen = new Set<string>()
  const blocking: Array<BaselineDiff> = []
  const warnings: Array<BaselineDiff> = []
  const unrecorded: Array<SlugTotals> = []

  for (const m of measured) {
    const key = keyOf(m)
    seen.add(key)
    const b = recorded.get(key)
    if (b === undefined) {
      unrecorded.push(m)
      continue
    }
    const diff = (field: BaselineField): BaselineDiff => ({
      slug: m.slug,
      theme: m.theme,
      kind: m.kind,
      field,
      recorded: b[field],
      measured: m[field],
    })
    if (m.kind === "text") {
      for (const field of EXACT_FIELDS) {
        if (m[field] !== b[field]) blocking.push(diff(field))
      }
    } else {
      // Non-text asks a weaker question, and on purpose: whether the sweep
      // still REACHES these surfaces. Whether a painted surface is a component
      // at all under SC 1.4.11 is a judgement left to a reader, so the counts
      // of failures among them are reported and not ratcheted.
      const belowFloor = m.measured < b.measured - NON_TEXT_SLACK
      if (belowFloor) blocking.push(diff("measured"))
      for (const field of EXACT_FIELDS) {
        // A count that already blocks is not also warned about. The same
        // number appearing under both headings reads as two findings and
        // invites a fix for the one that does not need it.
        if (belowFloor && field === "measured") continue
        if (m[field] !== b[field]) warnings.push(diff(field))
      }
    }
    if (m.elements !== b.elements) warnings.push(diff("elements"))
  }

  const missing = baseline
    .filter((b) => !seen.has(keyOf(b)))
    .map((b) => ({ slug: b.slug, theme: b.theme, kind: b.kind }))

  return { blocking, warnings, unrecorded, missing }
}

/**
 * Does the sweep still stand behind the recorded table?
 *
 * Warnings do not enter into it — they exist to be read, not to stop a branch.
 * The three that do are gathered here rather than at the call site so a caller
 * cannot check `blocking` alone and let a new slug through unrecorded.
 */
export function baselineHolds(c: BaselineComparison): boolean {
  return (
    c.blocking.length === 0 &&
    c.unrecorded.length === 0 &&
    c.missing.length === 0
  )
}

// The row as the recorded table spells it. Taken from the writer rather than
// spelled again here: the whole point of printing it is that it can be pasted
// into `BASELINE_TABLE` and into `docs/preview-contrast-baseline.md`, and a
// second spelling would be free to drift from the one the parser accepts.
const lineFor = (t: SlugTotals): string => renderTotalsTable([t]).split("\n")[2]

const groupBy = <T>(
  items: Array<T>,
  key: (t: T) => string
): Array<[string, Array<T>]> => {
  const out = new Map<string, Array<T>>()
  for (const item of items) {
    const k = key(item)
    const got = out.get(k)
    if (got === undefined) out.set(k, [item])
    else got.push(item)
  }
  return [...out.entries()]
}

/**
 * The report a failing gate prints.
 *
 * Every blocking row carries both of its lines, because the numbers alone do
 * not say what to do with them: `was:` is what the table holds today and `now:`
 * is the line that replaces it once the change has been understood. That is the
 * shape `token-coverage.test.ts` settled on for the same reason — nothing else
 * in the repo reports these counts, so a message that only named them would
 * send the reader to re-derive a table by hand, and a number that lands because
 * it makes the gate pass is how a drop elsewhere hides.
 *
 * Warnings print their `now:` line too. They never block, so without it the
 * counts they cover could only be refreshed by someone who already knew how to
 * regenerate the table — and a column nobody can refresh is a column that goes
 * quietly stale while the document still calls itself the record.
 */
export function renderBaselineFailure(
  c: BaselineComparison,
  measured: Array<SlugTotals>,
  baseline: Array<SlugTotals>
): Array<string> {
  const measuredBy = new Map(measured.map((m) => [keyOf(m), m]))
  const recordedBy = new Map(baseline.map((b) => [keyOf(b), b]))
  const out: Array<string> = []

  const movement = (d: BaselineDiff): string =>
    `    ${d.field} ${d.recorded} → ${d.measured}`

  if (c.blocking.length > 0) {
    out.push(
      `FAIL contrast baseline — ${c.blocking.length} count(s) moved away from the recorded table.`,
      ""
    )
    for (const [key, diffs] of groupBy(c.blocking, keyOf)) {
      out.push(`  ${key.split("|").join(" | ")}`)
      for (const d of diffs) out.push(movement(d))
      const was = recordedBy.get(key)
      const now = measuredBy.get(key)
      if (was !== undefined) out.push(`    was: ${lineFor(was)}`)
      if (now !== undefined) out.push(`    now: ${lineFor(now)}`)
      out.push("")
    }
  }

  if (c.unrecorded.length > 0) {
    out.push(
      `FAIL contrast baseline — ${c.unrecorded.length} row(s) the table does not record.`,
      "  A preview the sweep can read needs its rows in the table. These are them:",
      ""
    )
    for (const m of c.unrecorded) out.push(`    ${lineFor(m)}`)
    out.push("")
  }

  if (c.missing.length > 0) {
    out.push(
      `FAIL contrast baseline — ${c.missing.length} recorded row(s) the sweep produced nothing for.`,
      "  Delete these lines in the same change that removed the preview:",
      ""
    )
    for (const m of c.missing) {
      out.push(`    ${m.slug} | ${m.theme} | ${m.kind}`)
    }
    out.push("")
  }

  if (c.warnings.length > 0) {
    out.push("warn — reported, not blocking:")
    for (const [key, diffs] of groupBy(c.warnings, keyOf)) {
      out.push(
        `  ${key.split("|").join(" | ")} — ${diffs.map((d) => `${d.field} ${d.recorded} → ${d.measured}`).join(", ")}`
      )
      const now = measuredBy.get(key)
      if (now !== undefined) out.push(`    now: ${lineFor(now)}`)
    }
    out.push("")
  }

  if (out.length > 0) {
    out.push(
      "Before editing a number to match, find out what moved it. A fail count that",
      "rose is a shortfall this branch introduced; a measured count that fell is a",
      "surface the collector stopped reaching. The same line belongs in",
      "src/lib/contrast-baseline.ts and in docs/preview-contrast-baseline.md."
    )
  }
  return out
}

/**
 * The widths the recorded table was measured at.
 *
 * The CLI takes its default from here rather than holding its own copy. Two
 * literals would be free to diverge, and the failure that produces is not a
 * loud one: the sweep would measure a set of widths the table does not describe
 * and report every difference as drift.
 */
export const BASELINE_WIDTHS = [375, 768, 976, 1440]

/**
 * What the sweep was asked to do, in the terms the gate cares about.
 *
 * The fields with a `?` are the ones a baseline run may also carry — writing
 * the report or the JSON out, and saying more while it works, change nothing
 * about what is measured.
 */
export interface BaselineRunArgs {
  slug?: string
  widths: Array<number>
  theme: "light" | "dark" | "both"
  online: boolean
  selfCheck: boolean
  jsonOut?: string
  reportOut?: string
  verbose?: boolean
}

/**
 * Why this run cannot be compared against the recorded table.
 *
 * The table describes ONE sweep: every slug, both themes, the four widths,
 * fonts blocked. Compared against a narrower run it does not report a narrower
 * result — it reports every row the run did not reach as a recorded row the
 * sweep produced nothing for, which is an argument mistake wearing the costume
 * of a catalogue-wide regression.
 *
 * Every conflict is returned, not the first. A run invoked with two wrong flags
 * would otherwise be corrected twice.
 */
export function baselineArgConflicts(args: BaselineRunArgs): Array<string> {
  const out: Array<string> = []
  if (args.selfCheck) {
    out.push(
      "--check-baseline and --self-check ask different questions: one is whether the measurement still works, the other whether its answers moved. Run them separately."
    )
  }
  if (args.slug !== undefined) {
    out.push(
      `--check-baseline compares the whole catalogue; --slug ${args.slug} measures one. Drop --slug, or use a plain sweep to look at one preview.`
    )
  }
  const widths = [...args.widths].sort((a, b) => a - b).join(",")
  if (widths !== [...BASELINE_WIDTHS].sort((a, b) => a - b).join(",")) {
    out.push(
      `--check-baseline needs the widths the table was recorded at (${BASELINE_WIDTHS.join(",")}); this run asked for ${widths}.`
    )
  }
  if (args.theme !== "both") {
    out.push(
      `--check-baseline needs both themes; this run asked for ${args.theme} only.`
    )
  }
  if (args.online) {
    // Not a matter of taste: the verdict rests on the weakest LINE of a wrapped
    // run, so a different font wraps the run differently and can put a
    // different line in front of the judgement.
    out.push(
      "--check-baseline cannot use --online: the table was recorded with the font CDN blocked, and a different font breaks lines differently, which changes which line a verdict rests on."
    )
  }
  return out
}

/**
 * The recorded table, byte for byte as `docs/preview-contrast-baseline.md`
 * publishes it.
 *
 * Held as the markdown rather than as objects for three reasons that all come
 * down to one line being paste-able into two files. A `SlugTotals` literal has
 * eight fields, which prettier spreads over nine lines, so the failure message
 * could not hand anyone "the line to paste" — it would hand them a block.
 * Inside a template literal prettier changes nothing, so what the gate prints
 * goes into this constant AND into the document unchanged, and the two cannot
 * say different things without the parity test in
 * `contrast-baseline-corpus.test.ts` noticing.
 *
 * PER SLUG, NOT A CATALOGUE TOTAL (issue #324). Two catalogue PRs open at once
 * must not break each other, which a summed row would guarantee: whichever
 * merged second would fail and its author would re-derive the total, and a
 * number that lands because it makes the gate pass is where a drop elsewhere
 * hides.
 *
 * WHEN A NUMBER MOVES, DO NOT EDIT IT TO MATCH until you know what moved it.
 * The gate prints both lines for every row it blocks.
 */
export const BASELINE_TABLE = `\
| slug | theme | kind | measured | elements | fail | borderline | indeterminate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 11st | dark | text | 95 | 183 | 12 | 0 | 12 |
| 11st | dark | non-text | 17 | 22 | 8 | 0 | 2 |
| 11st | light | text | 95 | 183 | 26 | 20 | 12 |
| 11st | light | non-text | 17 | 22 | 9 | 0 | 2 |
| baemin | dark | text | 92 | 174 | 9 | 0 | 2 |
| baemin | dark | non-text | 4 | 15 | 2 | 0 | 0 |
| baemin | light | text | 90 | 172 | 17 | 5 | 2 |
| baemin | light | non-text | 4 | 15 | 2 | 0 | 0 |
| bezier | dark | text | 183 | 370 | 56 | 11 | 15 |
| bezier | dark | non-text | 41 | 44 | 10 | 4 | 1 |
| bezier | light | text | 183 | 370 | 58 | 9 | 15 |
| bezier | light | non-text | 41 | 44 | 18 | 9 | 1 |
| class101 | dark | text | 110 | 184 | 33 | 1 | 7 |
| class101 | dark | non-text | 16 | 18 | 7 | 1 | 4 |
| class101 | light | text | 110 | 184 | 44 | 2 | 7 |
| class101 | light | non-text | 15 | 18 | 7 | 3 | 3 |
| codeit | dark | text | 153 | 255 | 8 | 3 | 0 |
| codeit | dark | non-text | 31 | 42 | 18 | 2 | 0 |
| codeit | light | text | 153 | 255 | 33 | 2 | 0 |
| codeit | light | non-text | 31 | 42 | 19 | 1 | 0 |
| gmarket | dark | text | 137 | 230 | 21 | 0 | 9 |
| gmarket | dark | non-text | 11 | 15 | 4 | 0 | 3 |
| gmarket | light | text | 135 | 228 | 44 | 0 | 9 |
| gmarket | light | non-text | 11 | 15 | 6 | 0 | 3 |
| greeting | dark | text | 231 | 664 | 18 | 54 | 2 |
| greeting | dark | non-text | 99 | 156 | 59 | 0 | 0 |
| greeting | light | text | 231 | 660 | 82 | 9 | 2 |
| greeting | light | non-text | 99 | 156 | 77 | 4 | 0 |
| gs-retail | dark | text | 91 | 185 | 6 | 0 | 0 |
| gs-retail | dark | non-text | 16 | 32 | 9 | 0 | 0 |
| gs-retail | light | text | 92 | 187 | 18 | 0 | 0 |
| gs-retail | light | non-text | 16 | 32 | 14 | 0 | 0 |
| gs-shop | dark | text | 137 | 269 | 2 | 0 | 25 |
| gs-shop | dark | non-text | 30 | 44 | 3 | 0 | 8 |
| gs-shop | light | text | 136 | 264 | 30 | 2 | 24 |
| gs-shop | light | non-text | 30 | 44 | 7 | 0 | 8 |
| krds | dark | text | 138 | 290 | 1 | 0 | 5 |
| krds | dark | non-text | 18 | 25 | 7 | 0 | 1 |
| krds | light | text | 136 | 282 | 14 | 29 | 5 |
| krds | light | non-text | 17 | 21 | 5 | 0 | 1 |
| kyobobook | dark | text | 120 | 231 | 0 | 0 | 16 |
| kyobobook | dark | non-text | 13 | 13 | 5 | 0 | 1 |
| kyobobook | light | text | 120 | 231 | 30 | 0 | 16 |
| kyobobook | light | non-text | 13 | 13 | 5 | 3 | 1 |
| likelion | dark | text | 94 | 198 | 4 | 0 | 0 |
| likelion | dark | non-text | 22 | 22 | 15 | 0 | 0 |
| likelion | light | text | 94 | 198 | 39 | 0 | 0 |
| likelion | light | non-text | 22 | 22 | 15 | 7 | 0 |
| line-design-system | dark | text | 118 | 259 | 13 | 0 | 17 |
| line-design-system | dark | non-text | 41 | 55 | 16 | 0 | 3 |
| line-design-system | light | text | 116 | 257 | 50 | 17 | 17 |
| line-design-system | light | non-text | 42 | 56 | 34 | 0 | 3 |
| samsung-one-ui | dark | text | 62 | 127 | 0 | 0 | 1 |
| samsung-one-ui | dark | non-text | 25 | 29 | 9 | 6 | 3 |
| samsung-one-ui | light | text | 62 | 127 | 2 | 2 | 1 |
| samsung-one-ui | light | non-text | 25 | 29 | 18 | 1 | 3 |
| seed-design | dark | text | 144 | 287 | 3 | 1 | 3 |
| seed-design | dark | non-text | 33 | 59 | 15 | 1 | 2 |
| seed-design | light | text | 144 | 287 | 81 | 1 | 3 |
| seed-design | light | non-text | 31 | 59 | 16 | 8 | 2 |
| socar | dark | text | 161 | 360 | 67 | 0 | 9 |
| socar | dark | non-text | 20 | 28 | 7 | 0 | 2 |
| socar | light | text | 161 | 360 | 68 | 0 | 9 |
| socar | light | non-text | 18 | 26 | 7 | 0 | 2 |
| teamsparta | dark | text | 82 | 114 | 11 | 0 | 0 |
| teamsparta | dark | non-text | 12 | 14 | 3 | 0 | 3 |
| teamsparta | light | text | 82 | 114 | 21 | 14 | 0 |
| teamsparta | light | non-text | 12 | 14 | 3 | 0 | 3 |
| toss | dark | text | 196 | 400 | 13 | 0 | 16 |
| toss | dark | non-text | 27 | 36 | 13 | 0 | 0 |
| toss | light | text | 196 | 400 | 52 | 1 | 16 |
| toss | light | non-text | 26 | 35 | 17 | 1 | 0 |
| vapor-ui | dark | text | 130 | 268 | 16 | 0 | 3 |
| vapor-ui | dark | non-text | 22 | 31 | 17 | 0 | 0 |
| vapor-ui | light | text | 131 | 271 | 2 | 14 | 3 |
| vapor-ui | light | non-text | 22 | 31 | 11 | 1 | 0 |
| wanted | dark | text | 141 | 257 | 21 | 0 | 7 |
| wanted | dark | non-text | 18 | 18 | 5 | 0 | 2 |
| wanted | light | text | 141 | 257 | 52 | 3 | 7 |
| wanted | light | non-text | 18 | 18 | 8 | 0 | 2 |
| yeogi | dark | text | 74 | 101 | 11 | 4 | 3 |
| yeogi | dark | non-text | 14 | 14 | 7 | 0 | 2 |
| yeogi | light | text | 74 | 101 | 38 | 1 | 3 |
| yeogi | light | non-text | 13 | 13 | 6 | 0 | 2 |
`

/** The recorded table as rows, parsed once. */
export const CONTRAST_BASELINE: Array<SlugTotals> =
  parseTotalsTable(BASELINE_TABLE)
