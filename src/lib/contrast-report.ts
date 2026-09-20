// Turning per-width contrast readings into the report a reader and the next
// session both use.
//
// Pure, and separate from `scripts/audit-contrast.ts` for the same reason
// `contrast.ts` is: the script needs a browser, so anything it owns cannot be
// covered by `pnpm test`.

import type { Blocker, Verdict } from "./contrast"

export type Theme = "light" | "dark"
export type State = "default" | "hover"
export type Judgement = Verdict | "indeterminate"

/** One element measured at one width, in one theme and state. */
export interface Finding {
  slug: string
  theme: Theme
  state: State
  width: number
  kind: "text" | "non-text"
  /** Where the element sits, as a chain of tag and class names. */
  path: string
  /** The first of the text, or null for a non-text surface. */
  sample: string | null
  ratio: number
  threshold: number
  verdict: Judgement
  blockers: Array<Blocker>
  opacityApprox: boolean
  /** Which boundary carries a non-text ratio. */
  basis?: "fill" | "border"
}

/** The same element folded across the widths it was seen at. */
export interface DedupedFinding extends Omit<Finding, "width"> {
  widths: Array<number>
}

export interface SlugTotals {
  slug: string
  theme: Theme
  /**
   * Text and non-text are counted apart because they answer different success
   * criteria — 1.4.3 and 1.4.11 — and a non-text reading still needs a human to
   * say whether the surface is a component at all. One combined number could
   * not be ratcheted for one without ratcheting it for the other.
   */
  kind: "text" | "non-text"
  measured: number
  fail: number
  borderline: number
  indeterminate: number
}

// Contrast barely moves with viewport width, so most rows repeat four times
// across the sweep. What is NOT in the key is as deliberate as what is:
//
// - the ratio is, so a media query that changes a colour at one width shows up
//   as its own row rather than being folded into the others. It also stands in
//   for the foreground and background colours; two different colour pairs
//   reaching the same ratio on the same element is the same reading.
// - the threshold is, because `clamp()` and `vw` type can cross 18pt between
//   widths. Without it, one of the two thresholds would be reported for both.
// - everything the row DISPLAYS is in the key, so two widths only fold when
//   the folded row would say the same thing about both. The verdict and its
//   qualifiers were once left out, and a width where a gradient appeared
//   behind the same element without moving the ratio was folded into the
//   judged width: the table then claimed a reading for a width that could not
//   be judged at all.
const keyOf = (f: Finding | DedupedFinding): string =>
  [
    f.slug,
    f.theme,
    f.state,
    f.kind,
    f.path,
    f.threshold,
    f.ratio.toFixed(3),
    f.verdict,
    [...f.blockers].sort().join("+"),
    f.opacityApprox ? "approx" : "",
    f.basis ?? "",
  ].join("|")

// Worst first. A reader opening the report wants the failures, and the next
// session wants to see how far short they fall.
const SEVERITY: Record<Judgement, number> = {
  fail: 0,
  borderline: 1,
  indeterminate: 2,
  pass: 3,
}

export function dedupeFindings(
  findings: Array<Finding>
): Array<DedupedFinding> {
  const byKey = new Map<string, DedupedFinding>()
  for (const f of findings) {
    const key = keyOf(f)
    const seen = byKey.get(key)
    if (seen === undefined) {
      const { width, ...rest } = f
      byKey.set(key, { ...rest, widths: [width] })
    } else if (!seen.widths.includes(f.width)) {
      seen.widths.push(f.width)
    }
  }
  const out = [...byKey.values()]
  for (const f of out) f.widths.sort((a, b) => a - b)
  return out.sort(
    (a, b) =>
      SEVERITY[a.verdict] - SEVERITY[b.verdict] ||
      a.ratio - b.ratio ||
      a.slug.localeCompare(b.slug) ||
      a.path.localeCompare(b.path)
  )
}

/**
 * The per-slug, per-theme counts the next session reads as a ratchet baseline.
 *
 * Counted from deduped rows: a per-width count would rise and fall with how
 * many widths the sweep happened to visit, which is not a property of the
 * preview.
 */
export function totalsBySlug(findings: Array<Finding>): Array<SlugTotals> {
  const byKey = new Map<string, SlugTotals>()
  for (const f of dedupeFindings(findings)) {
    const key = `${f.slug}|${f.theme}|${f.kind}`
    const row = byKey.get(key) ?? {
      slug: f.slug,
      theme: f.theme,
      kind: f.kind,
      measured: 0,
      fail: 0,
      borderline: 0,
      indeterminate: 0,
    }
    row.measured += 1
    if (f.verdict !== "pass") row[f.verdict] += 1
    byKey.set(key, row)
  }
  // Text first within a slug and theme: it is the criterion with the clearer
  // verdict, so it is what a reader should meet first.
  const kindOrder = { text: 0, "non-text": 1 }
  return [...byKey.values()].sort(
    (a, b) =>
      a.slug.localeCompare(b.slug) ||
      a.theme.localeCompare(b.theme) ||
      kindOrder[a.kind] - kindOrder[b.kind]
  )
}

const row = (cells: Array<string>): string => `| ${cells.join(" | ")} |`
const rule = (n: number): string => row(Array<string>(n).fill("---"))

// A pipe inside a cell ends the cell. Escaping it as a backslash pair works in
// most renderers but changes how many pipes the line has, which quietly breaks
// anything counting columns; the entity keeps the column count exact and still
// displays as a pipe.
const cell = (text: string): string => text.replace(/\|/g, "&#124;")

const TOTALS_COLUMNS = [
  "slug",
  "theme",
  "kind",
  "measured",
  "fail",
  "borderline",
  "indeterminate",
]

/**
 * The per-slug counts, in the shape the next session lifts a ratchet row from.
 *
 * Rendered even when empty: a header with no rows says the sweep ran and found
 * nothing, where an absent table says nothing at all.
 */
export function renderTotalsTable(totals: Array<SlugTotals>): string {
  return [
    row(TOTALS_COLUMNS),
    rule(TOTALS_COLUMNS.length),
    ...totals.map((t) =>
      row([
        t.slug,
        t.theme,
        t.kind,
        String(t.measured),
        String(t.fail),
        String(t.borderline),
        String(t.indeterminate),
      ])
    ),
  ].join("\n")
}

const FINDING_COLUMNS = [
  "slug",
  "theme",
  "state",
  "kind",
  "요소",
  "텍스트",
  "측정 / 임계",
  "판정",
  "폭",
]

const SAMPLE_LIMIT = 40

const widthsCell = (
  widths: Array<number>,
  swept: Array<number> | undefined
): string =>
  swept !== undefined && swept.every((w) => widths.includes(w))
    ? "all"
    : widths.join("·")

// The verdict column carries what qualifies it, because a reader scanning for
// failures needs to know in the same glance whether a number rests on an
// approximation or why a reading was held.
const verdictCell = (f: DedupedFinding): string => {
  const notes: Array<string> = [...f.blockers]
  if (f.opacityApprox) notes.push("opacity-approx")
  const suffix = notes.length > 0 ? ` (${notes.join(", ")})` : ""
  return `${f.verdict}${suffix}`
}

export function renderFindingsTable(
  findings: Array<DedupedFinding>,
  sweptWidths?: Array<number>
): string {
  return [
    row(FINDING_COLUMNS),
    rule(FINDING_COLUMNS.length),
    ...findings.map((f) =>
      row([
        f.slug,
        f.theme,
        f.state,
        f.basis === undefined ? f.kind : `${f.kind}:${f.basis}`,
        cell(f.path),
        f.sample === null ? "—" : cell(f.sample.slice(0, SAMPLE_LIMIT)),
        `${f.ratio.toFixed(2)} / ${f.threshold}`,
        verdictCell(f),
        widthsCell(f.widths, sweptWidths),
      ])
    ),
  ].join("\n")
}

/**
 * How often each reason held a reading.
 *
 * Only rows that actually went unjudged are counted. A blocker recorded on a
 * row that still got a verdict would mean the two disagree, and counting it
 * would overstate how much of the sweep went unread.
 */
export function blockerTally(
  findings: Array<DedupedFinding>
): Array<{ blocker: Blocker; count: number }> {
  const counts = new Map<Blocker, number>()
  for (const f of findings) {
    if (f.verdict !== "indeterminate") continue
    for (const b of f.blockers) counts.set(b, (counts.get(b) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([blocker, count]) => ({ blocker, count }))
    .sort((a, b) => b.count - a.count || a.blocker.localeCompare(b.blocker))
}
