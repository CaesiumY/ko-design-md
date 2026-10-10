// What the onboarding loop's render observation (Stage 9a3) hands on: the
// contrast judge's findings for one staged preview, folded into the machine
// report the reviewer already reads.
//
// The report is the 9a2 one, extended in place, so the reviewer and the
// retrying author keep their single `machine_report_path` / `prior_review_path`
// and no prompt grows a second channel (ADR 0009). Everything here is pure; the
// browser lives in `scripts/observe-staged-contrast.ts`.
//
// Every item is a `warn`. A staged preview has no baseline row, so the gate's
// "drift" (ADR 0007) cannot apply, and what is left — an individual shortfall —
// may be two published values that simply do not reach the threshold. Blocking
// on that would push the author to throw a brand value away to get through.

import type { DedupedFinding, State, Theme } from "./contrast-report"
import type { ValidationIssue } from "./draft-validator"

export const STAGED_CONTRAST_RULE = "render-contrast-shortfall"

/** The envelope's `tool` when there is no 9a2 report to join. */
export const STAGED_CONTRAST_TOOL = "observe-staged-contrast"

/**
 * How many shortfalls go to the reviewer as items. The rest are counted, not
 * listed: a shipped preview has carried up to 84 failing text rows in one theme
 * after folding, and a list that long buries the few the reviewer should act on.
 */
export const MAX_RENDER_ISSUES = 20

/** The item shape 9a2's issues already have — this stage adds more of them. */
export type MachineIssue = ValidationIssue

export interface SweepShape {
  widths: Array<number>
  themes: Array<Theme>
  states: Array<State>
}

// The two outcomes are told apart by which key is present, not by a value
// inside one shape. A clean run and a skipped one both add zero items, so a
// reader counting items — or checking a status string it forgot to read —
// would see the same thing. A missing `observed` key cannot be read as a pass.
export interface ObservedRender {
  observed: SweepShape & {
    /** Rows after folding, every verdict. */
    measured: number
    fail: number
    borderline: number
    /** Rows the judge could not decide (a gradient, an overlay, …). */
    held: number
    /** Failures handed on as items. */
    reported: number
    /** Failures past the cap — counted, not listed. */
    omitted: number
  }
}

export interface SkippedRender {
  skipped: { reason: string }
}

export type RenderBlock = ObservedRender | SkippedRender

export interface RenderResult<TRender extends RenderBlock = RenderBlock> {
  render: TRender
  issues: Array<MachineIssue>
}

/**
 * The machine report this stage joins — the one `scripts/validate-preview.ts`
 * writes at 9a2 — or the envelope it starts when there is none. `passed` and
 * `metrics` belong to 9a2 and are carried through as they were.
 */
export interface MachineReport {
  machine: boolean
  tool: string
  schema: number
  iteration: number
  passed?: boolean
  metrics?: Record<string, { matched: number; total: number }>
  issues: Array<MachineIssue>
  verdict: string
  render?: RenderBlock
}

const ratio = (value: number): string => `${value.toFixed(2)}:1`

const KIND_ORDER: Record<DedupedFinding["kind"], number> = {
  text: 0,
  "non-text": 1,
}

// Said once per item rather than once per report, because the reviewer mirrors
// items one at a time into the review the author reads next.
//
// It names the shapes the measurement is known to misread (ADR 0007) so that a
// warn never talks the author into erasing a disabled demo or darkening a
// decorative edge to get through — the edit ADR 0009 kept 9a3 at warn to avoid.
const VALUE_GUIDANCE =
  'Keep colours that come straight from design.md tokens. If this element demonstrates a disabled state, declare it with `:disabled` or `aria-disabled="true"` instead of raising its contrast; leave decoration, opacity-faded state-demo labels and single separator glyphs as they are. Otherwise adjust only a derived colour (a mix, an opacity, a hardcoded value).'

function toIssue(f: DedupedFinding): MachineIssue {
  const what =
    f.kind === "text"
      ? `text "${f.sample ?? ""}" (${f.fg} on ${f.bg})`
      : `${f.basis ?? "non-text"} edge ${f.fg} against ${f.bg}`
  return {
    severity: "warn",
    rule: STAGED_CONTRAST_RULE,
    section: `contrast — ${f.theme} ${f.state} @${f.widths.join("/")}px`,
    fix: `\`${f.path}\` ${what} renders at ${ratio(f.ratio)}, below the ${f.threshold}:1 it needs. ${VALUE_GUIDANCE}`,
  }
}

export function observedRender(
  deduped: Array<DedupedFinding>,
  swept: SweepShape,
  max: number = MAX_RENDER_ISSUES
): RenderResult<ObservedRender> {
  const count = (verdict: DedupedFinding["verdict"]): number =>
    deduped.filter((f) => f.verdict === verdict).length
  // Text before non-text, then worst first. Ratio alone is the wrong key across
  // the two: a decorative 1.2:1 edge always sorts below a 4.1:1 caption, and on
  // the samsung fixture it filled every slot. Text is the criterion with the
  // clearer verdict — the report tables put it first for the same reason.
  const failures = deduped
    .filter((f) => f.verdict === "fail")
    .sort(
      (a, b) =>
        KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
        a.ratio - b.ratio ||
        a.path.localeCompare(b.path)
    )
  const issues = failures.slice(0, max).map(toIssue)
  return {
    render: {
      observed: {
        widths: [...swept.widths],
        themes: [...swept.themes],
        states: [...swept.states],
        measured: deduped.length,
        fail: failures.length,
        borderline: count("borderline"),
        held: count("indeterminate"),
        reported: issues.length,
        omitted: failures.length - issues.length,
      },
    },
    issues,
  }
}

export function skippedRender(reason: string): RenderResult<SkippedRender> {
  return { render: { skipped: { reason } }, issues: [] }
}

// The verdict line 9a2 writes is "N block / M warn — <tool's words>". 9a3 keeps
// the tool's words, recounts the two numbers over the merged items, and puts
// its own clause after a separator it can find again on the next run.
const COUNTS = /^\d+ block \/ \d+ warn — /
const RENDER_CLAUSE = /; render contrast: .*$/

function renderClause(render: RenderBlock): string {
  if ("skipped" in render) {
    return `; render contrast: skipped (${render.skipped.reason})`
  }
  const o = render.observed
  const omitted = o.omitted > 0 ? `, ${o.omitted} more not listed` : ""
  return `; render contrast: ${o.fail} shortfall(s) across ${o.measured} measured row(s)${omitted}`
}

export function mergeIntoMachineReport(
  existing: MachineReport | null,
  result: RenderResult,
  opts: { iteration: number }
): MachineReport {
  const base: MachineReport = existing ?? {
    machine: true,
    tool: STAGED_CONTRAST_TOOL,
    schema: 1,
    iteration: opts.iteration,
    issues: [],
    verdict: "0 block / 0 warn — render observation only",
  }
  const kept = base.issues.filter((i) => i.rule !== STAGED_CONTRAST_RULE)
  const issues = [...kept, ...result.issues]
  const blocks = issues.filter((i) => i.severity === "block").length
  const warns = issues.filter((i) => i.severity === "warn").length

  const words = base.verdict.replace(RENDER_CLAUSE, "").replace(COUNTS, "")
  return {
    ...base,
    issues,
    render: result.render,
    verdict: `${blocks} block / ${warns} warn — ${words}${renderClause(result.render)}`,
  }
}
