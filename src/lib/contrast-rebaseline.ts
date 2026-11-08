// Rewrite the recorded contrast baseline from one CI run (#656).
//
// The inner half of `pnpm audit:contrast:rebaseline`: pure, so `pnpm test`
// covers it. It takes the record's current text, the run's findings and the
// run id, and returns the record's new text. The outer half
// (`scripts/rebaseline-contrast.ts`) downloads the artifact and reads and
// writes the files.

import {
  noEntryReason,
  paletteLookup,
  readArtifactPalettes,
  renderPairTable,
  sumPairTally,
  tallyPairs,
} from "./contrast-pairs"
import {
  RUN_ID,
  dedupeFindings,
  heldReasons,
  isRunId,
  measuredSlugs,
  parseTotalsTable,
  renderHeldReasons,
  renderTotalsTable,
  totalsBySlug,
} from "./contrast-report"
import type { ClassifiedVerdict, Palette } from "./contrast-pairs"
import type { Finding, SlugTotals } from "./contrast-report"

/** The files the record lives in, as text. */
export interface RecordFiles {
  /** `docs/preview-contrast-baseline.md` */
  doc: string
  /** `src/lib/contrast-baseline.ts` */
  baseline: string
  /** `src/lib/contrast-classified-run.json` */
  classifiedRun: string
}

export interface RebaselineInput {
  /** The CI run the findings came from. */
  run: string
  /** That run's `contrast-findings.json`. */
  findings: Array<Finding>
  /** The slugs the sweep can read in this checkout (`readPreviewSlugs`). */
  previewSlugs: Array<string>
  /** `services/{slug}.md` by slug, for every entry this checkout has. */
  entries: Readonly<Record<string, string>>
  files: RecordFiles
}

export type RebaselineResult =
  | {
      ok: true
      files: RecordFiles
      /** The ratchet rows that moved, as lines to print. */
      moved: Array<string>
      /** The judgement prose left for a person; empty when nothing changed. */
      remaining: Array<string>
      /**
       * Tokens a palette left out because their form cannot be read, as the
       * lines the classification command prints for them.
       */
      notes: Array<string>
    }
  | { ok: false; reasons: Array<string> }

const BASELINE_OPENING = "export const BASELINE_TABLE = `\\\n"

// The sections of the document this writes into, by the start of their
// heading: the published-pair headings carry their recount dates, which are
// judgement and stay as they are.
const TOTALS_SECTION = "## 슬러그별 총계"
const BORDERLINE_SECTION = "## 발행색끼리의 경계선"
const FAIL_SECTION = "## 미달의 발행색 분류"

const HELD_SECTION = "## 유보 사유"

const PAIR_TABLE_START = "| slug | kind |"
const HELD_TABLE_START = "| 사유 | 건수 |"
const HELD_ROWS_LINE_START = "보류 행 수: "

/**
 * `src/lib/contrast-classified-run.json`: the run the pair tables were
 * classified from and every slug its artifact measured, read by
 * `contrast-baseline-corpus.test.ts`. Written as `JSON.stringify` writes it,
 * so the same record is the same bytes.
 */
export function renderClassifiedRun(r: {
  run: string
  slugs: Array<string>
}): string {
  return `${JSON.stringify({ run: r.run, slugs: r.slugs }, null, 2)}\n`
}

/**
 * The document as lines, edited one anchored place at a time. Each anchor must
 * be found exactly once; one that is missing or doubled is recorded as a
 * reason and the edit is skipped, so the caller can refuse the whole rewrite
 * rather than write half of it.
 */
class DocEditor {
  lines: Array<string>
  reasons: Array<string> = []

  constructor(text: string) {
    this.lines = text.split("\n")
  }

  /** The line range of the section whose heading starts with `heading`. */
  section(heading: string): [number, number] | null {
    const at = this.lines.flatMap((l, i) => (l.startsWith(heading) ? [i] : []))
    if (at.length !== 1) {
      this.reasons.push(
        `the document has ${at.length} sections headed "${heading}", expected one`
      )
      return null
    }
    let end = at[0] + 1
    while (end < this.lines.length && !this.lines[end].startsWith("## ")) {
      end += 1
    }
    return [at[0], end]
  }

  /**
   * Replace the `|` block whose first line starts with `start`, inside
   * `range`, with `block`.
   */
  table(range: [number, number] | null, start: string, block: string): void {
    if (range === null) return
    const at: Array<number> = []
    for (let i = range[0]; i < range[1]; i++) {
      if (this.lines[i].startsWith(start)) at.push(i)
    }
    if (at.length !== 1) {
      this.reasons.push(
        `found ${at.length} tables starting "${start}" under "${this.lines[range[0]]}", expected one`
      )
      return
    }
    let end = at[0]
    while (end + 1 < this.lines.length && this.lines[end + 1].startsWith("|")) {
      end += 1
    }
    this.lines.splice(at[0], end - at[0] + 1, ...block.split("\n"))
  }

  /**
   * Replace the lines from the one starting with `start` through the first
   * one after it starting with `last`, inside `range`, with `block`.
   */
  block(
    range: [number, number] | null,
    start: string,
    last: string,
    block: string
  ): void {
    if (range === null) return
    const inRange = (prefix: string, from: number): Array<number> => {
      const at: Array<number> = []
      for (let i = from; i < range[1]; i++) {
        if (this.lines[i].startsWith(prefix)) at.push(i)
      }
      return at
    }
    const first = inRange(start, range[0])
    const end = first.length === 1 ? inRange(last, first[0]) : []
    if (first.length !== 1 || end.length !== 1) {
      this.reasons.push(
        `found ${first.length} blocks from "${start}" with ${end.length} "${last}" lines under "${this.lines[range[0]]}", expected one of each`
      )
      return
    }
    this.lines.splice(first[0], end[0] - first[0] + 1, ...block.split("\n"))
  }

  /**
   * Replace the one match of `pattern` inside `range` with `replacement`.
   * `pattern` must be global, so that a second match is seen and refused.
   */
  phrase(
    range: [number, number] | null,
    pattern: RegExp,
    replacement: string
  ): void {
    if (range === null) return
    const text = this.lines.slice(range[0], range[1]).join("\n")
    const found = text.match(pattern)?.length ?? 0
    if (found !== 1) {
      this.reasons.push(
        `found ${found} matches of ${pattern} under "${this.lines[range[0]]}", expected one`
      )
      return
    }
    this.lines.splice(
      range[0],
      range[1] - range[0],
      ...text.replace(pattern, replacement).split("\n")
    )
  }

  text(): string {
    return this.lines.join("\n")
  }
}

/**
 * The constant's file with the body of its template literal replaced, and
 * every byte before the opening and from the closing backtick on kept — the
 * closing backtick is what a hand rewrite once dropped (#642). Null when the
 * literal is not there, or does not hold a totals table.
 */
function replaceBaselineTable(source: string, table: string): string | null {
  const at = baselineBody(source)
  return at === null
    ? null
    : source.slice(0, at.body) + table + source.slice(at.closing)
}

/** Where the constant's table starts, and its closing backtick. */
function baselineBody(
  source: string
): { body: number; closing: number } | null {
  const opening = source.indexOf(BASELINE_OPENING)
  if (opening === -1 || source.indexOf(BASELINE_OPENING, opening + 1) !== -1) {
    return null
  }
  const body = opening + BASELINE_OPENING.length
  const closing = source.indexOf("`", body)
  if (closing === -1 || !source.startsWith(`${TOTALS_HEADER}\n`, body)) {
    return null
  }
  return { body, closing }
}

const TOTALS_HEADER = renderTotalsTable([]).split("\n")[0]

const FIELDS = [
  "measured",
  "elements",
  "fail",
  "borderline",
  "indeterminate",
] as const

const lineOf = (t: SlugTotals): string => renderTotalsTable([t]).split("\n")[2]

/**
 * The ratchet rows the rewrite moved, with both lines of each as the gate's
 * failure prints them, and the slugs they belong to — what a PR body explains.
 */
function movedRows(before: Array<SlugTotals>, after: Array<SlugTotals>) {
  const key = (t: SlugTotals) => `${t.slug} | ${t.theme} | ${t.kind}`
  const was = new Map(before.map((t) => [key(t), t]))
  const now = new Map(after.map((t) => [key(t), t]))
  const out: Array<string> = []
  const slugs = new Set<string>()
  let count = 0
  const gone = [...was.keys()].filter((k) => !now.has(k))
  for (const k of [...now.keys(), ...gone]) {
    const a = was.get(k)
    const b = now.get(k)
    const moved = FIELDS.filter((f) => a?.[f] !== b?.[f]).map(
      (f) => `${f} ${a?.[f] ?? "-"} → ${b?.[f] ?? "-"}`
    )
    if (moved.length === 0) continue
    count += 1
    slugs.add((a ?? b)?.slug ?? k)
    out.push(`  ${k} — ${moved.join(", ")}`)
    if (a !== undefined) out.push(`    was: ${lineOf(a)}`)
    if (b !== undefined) out.push(`    now: ${lineOf(b)}`)
  }
  return count === 0
    ? ["ratchet rows moved: none"]
    : [`ratchet rows moved: ${count}, in ${[...slugs].join(", ")}`, ...out]
}

/**
 * What the rewrite does not write: the prose a person writes against the new
 * numbers. Each names where it is.
 */
const remainingWork = (run: string): Array<string> => [
  `「슬러그별 총계」: the date in "마지막으로 전수 갱신한 것은 … 이다(run \`${run}\`)" — the day that run measured`,
  "「발행색끼리의 경계선」 and 「미달의 발행색 분류」 headings: the recount date",
  `「발행색끼리의 경계선」: what follows "입력은 run \`${run}\`" — the head commit the run measured and what it changed`,
  'the dated recount lists ("세 재집계(run … · date, …)") in both published-pair sections: whether the tolerance bands they describe held in this run (the `readings …` lines of `pnpm audit:contrast:pairs`), and the run with its date if so',
  "「유보 사유」: the paragraph above the table that compares earlier hold reasons",
  "「어느 슬러그부터」: the order, read against the new fail table",
  "the PR body: why the ratchet rows above moved",
]

/**
 * Why this artifact cannot be written into this checkout's record, or, when
 * it can, the palettes its classified rows are read against and the notes on
 * tokens those palettes left out. The palette reading and its refusals are the
 * classification command's own (`readArtifactPalettes`); a whole-table
 * rewrite adds a measured slug this checkout cannot sweep, and a preview the
 * run did not measure, whose recorded rows the rewrite would drop.
 */
function validateArtifactAndReadPalettes(input: RebaselineInput): {
  reasons: Array<string>
  palettes: Map<string, Palette>
  notes: Array<string>
} {
  const reasons: Array<string> = []
  if (!isRunId(input.run)) {
    reasons.push(`run id "${input.run}" is not a CI run number`)
  }
  if (input.findings.length === 0) {
    reasons.push("the artifact has no findings")
    return { reasons, palettes: new Map(), notes: [] }
  }

  const measured = measuredSlugs(input.findings)
  const previews = new Set(input.previewSlugs)
  for (const slug of measured) {
    if (!previews.has(slug)) {
      reasons.push(
        `the artifact measured ${slug}, which has no preview in this checkout`
      )
    }
    // Every measured slug, not only the classified ones `readArtifactPalettes`
    // refuses, and in its words; the repeat it gives is dropped below.
    if (!(slug in input.entries)) reasons.push(noEntryReason(slug))
  }
  for (const slug of input.previewSlugs) {
    if (!measured.includes(slug)) {
      reasons.push(
        `this checkout has a preview for ${slug}, which the artifact did not measure — the run predates it; use a run of this checkout`
      )
    }
  }

  const read = readArtifactPalettes(input.findings, input.entries)
  if (read.split.length > 0) {
    reasons.push(
      `${read.split.length} classified row(s) read different colour pairs at different widths, so there is no one pair to classify: ${read.split.join(", ")}`
    )
  }
  reasons.push(...read.problems.filter((p) => !reasons.includes(p)))
  return { reasons, palettes: read.palettes, notes: read.notes }
}

/** One published-pair table and the two totals its prose states. */
export interface PairTableValues {
  table: string
  /** The rows the table classifies. */
  total: number
  /** Of those, the rows whose two colours are both published tokens. */
  both: number
}

/** What one run writes into the record's anchored places. */
export interface RecordValues {
  run: string
  /** The totals table, as `renderTotalsTable` writes it. */
  totals: string
  borderline: PairTableValues
  fail: PairTableValues
  /** The hold-reason block, as `renderHeldReasons` writes it. */
  held: string
}

/**
 * The document and the constant's file with `values` written into every
 * anchored place, and the anchors that were missing or doubled; any reason
 * means neither text is to be written. Exported so a test can hold the
 * anchors to the real record, not only to the stand-in the tests write.
 */
export function rewriteRecord(
  files: Pick<RecordFiles, "doc" | "baseline">,
  values: RecordValues
): { doc: string; baseline: string; reasons: Array<string> } {
  const reasons: Array<string> = []
  const baseline = replaceBaselineTable(files.baseline, values.totals)
  if (baseline === null) {
    reasons.push(
      `src/lib/contrast-baseline.ts has no \`${BASELINE_OPENING.trimEnd()}\` followed by a totals table`
    )
  }

  const doc = new DocEditor(files.doc)
  doc.table(doc.section(TOTALS_SECTION), TOTALS_HEADER, values.totals)
  doc.phrase(
    doc.section(BORDERLINE_SECTION),
    /분류한 `borderline` \d+행을/g,
    `분류한 \`borderline\` ${values.borderline.total}행을`
  )
  for (const [verdict, heading] of [
    ["borderline", BORDERLINE_SECTION],
    ["fail", FAIL_SECTION],
  ] as const) {
    const counts = values[verdict]
    doc.table(doc.section(heading), PAIR_TABLE_START, counts.table)
    doc.phrase(
      doc.section(heading),
      new RegExp(`\`${verdict}\` \\d+행 중 \\d+행이 두 색 모두 발행 토큰`, "g"),
      `\`${verdict}\` ${counts.total}행 중 ${counts.both}행이 두 색 모두 발행 토큰`
    )
  }

  // The held-row line is the end of the block, so the reason table and the
  // line under it are written as the one block `renderHeldReasons` makes.
  doc.block(
    doc.section(HELD_SECTION),
    HELD_TABLE_START,
    HELD_ROWS_LINE_START,
    values.held
  )
  // Only the places that name the run the record is OF. The dated lists of
  // earlier recounts name runs too, and stay as the history they are.
  doc.phrase(
    doc.section(TOTALS_SECTION),
    new RegExp(String.raw`이다\(run \`${RUN_ID}\`\)`, "g"),
    `이다(run \`${values.run}\`)`
  )
  doc.phrase(
    doc.section(BORDERLINE_SECTION),
    new RegExp(`입력은 run \`${RUN_ID}\``, "g"),
    `입력은 run \`${values.run}\``
  )

  reasons.push(...doc.reasons)
  return { doc: doc.text(), baseline: baseline ?? files.baseline, reasons }
}

export function rebaseline(input: RebaselineInput): RebaselineResult {
  const { reasons, palettes, notes } = validateArtifactAndReadPalettes(input)
  if (reasons.length > 0) return { ok: false, reasons }

  // The same fold and the same seeding as the sweep, so the table written here
  // is the table the gate prints and compares (`audit-contrast-sweep.ts`).
  const rows = dedupeFindings(input.findings)
  const totals = renderTotalsTable(
    totalsBySlug(rows, {
      slugs: input.previewSlugs,
      themes: ["light", "dark"],
    })
  )

  const paletteFor = paletteLookup(palettes)
  const pairs = (verdict: ClassifiedVerdict): PairTableValues => {
    const tally = tallyPairs(rows, paletteFor, verdict)
    const sum = sumPairTally(tally)
    return {
      table: renderPairTable(tally),
      total: sum.total,
      both: sum.bothPublished,
    }
  }
  const written = rewriteRecord(input.files, {
    run: input.run,
    totals,
    borderline: pairs("borderline"),
    fail: pairs("fail"),
    held: renderHeldReasons({ ...heldReasons(rows), run: input.run }),
  })
  if (written.reasons.length > 0) {
    return { ok: false, reasons: written.reasons }
  }

  const at = baselineBody(input.files.baseline)
  const recorded =
    at === null ? "" : input.files.baseline.slice(at.body, at.closing)
  const files: RecordFiles = {
    baseline: written.baseline,
    doc: written.doc,
    classifiedRun: renderClassifiedRun({
      run: input.run,
      slugs: measuredSlugs(input.findings),
    }),
  }
  const unchanged = (Object.keys(files) as Array<keyof RecordFiles>).every(
    (k) => files[k] === input.files[k]
  )
  return {
    ok: true,
    files,
    moved: movedRows(parseTotalsTable(recorded), parseTotalsTable(totals)),
    remaining: unchanged ? [] : remainingWork(input.run),
    notes,
  }
}
