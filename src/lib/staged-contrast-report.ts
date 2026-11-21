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
//
// It also counts the text elements per theme against the CI gate's floor
// (ADR 0013) — a number CI does block on, even for an entry with no baseline
// row — so the author hears about a thin preview inside the loop, not from the
// first CI run. Still a `warn` here, for the reason above.

import { MIN_TEXT_ELEMENTS, THIN_PREVIEW_ADVICE } from "./contrast-baseline"
import { totalsBySlug } from "./contrast-report"
import type { DedupedFinding, State, Theme } from "./contrast-report"
import type { ValidationIssue } from "./draft-validator"

export const STAGED_CONTRAST_RULE = "render-contrast-shortfall"

/**
 * The item for a preview under the CI gate's text-element floor (ADR 0013).
 *
 * A rule of its own, not another contrast shortfall: it says the preview shows
 * too little, not that something in it is hard to read, and a reader of the
 * report — the reviewer's rubric, a test — has to be able to tell the two
 * apart. Still a `warn`, like everything this stage adds (ADR 0009).
 */
export const STAGED_THIN_RULE = "render-thin-preview"

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
    /**
     * Of `omitted`, the dark-theme text rows — the only kind the rubric
     * scores. Above 0, scored rows may sit past the cap where the reviewer
     * cannot see them, so the rubric sends it to the CSS before full marks.
     */
    omittedDarkText: number
    /**
     * Text elements per swept theme, counted the way the CI gate counts them
     * against `MIN_TEXT_ELEMENTS`: the `elements` of that theme's text rows
     * in the baseline totals, over the same folded rows. CI sweeps hover at
     * the same width this stage does, so the hover rows are in both counts.
     */
    textElements: Partial<Record<Theme, number>>
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

// Which shortfalls go into the capped list first. Dark-theme text leads
// because it is the only kind the rubric's Item 5 scores (its "Render
// observation (9a3)" paragraph), and the reviewer sees nothing past the cap.
// Light text follows — legible text is still the clearer verdict — and
// non-text comes last.
function rank(f: DedupedFinding): number {
  if (f.kind === "non-text") return 2
  return f.theme === "dark" ? 0 : 1
}

// Said once per item rather than once per report, because the reviewer mirrors
// items one at a time into the review the author reads next.
//
// It names the shapes the measurement is known to misread (ADR 0007) so that a
// warn never talks the author into erasing a disabled demo or darkening a
// decorative edge to get through — the edit ADR 0009 kept 9a3 at warn to avoid.
const VALUE_GUIDANCE =
  'Keep colours the design.md publishes — a frontmatter token, or a step its body table names (an opacity-ramp step, a translucent tier); a translucent one only when laid as published over an underlying colour that is itself published (every layer, if several stack), with every layer and the colour beneath usable in that theme (a `dark-` token is dark-only; `x` or `light-x` is light-only when a `dark-x` token exists, unless that `dark-x` only points back to the same token, directly or through references; the rest serve both; a body-table step belongs to the theme its table gives it for, or to both when the table does not split by theme). If this element demonstrates a disabled state, declare it with `aria-disabled="true"` (the `disabled` attribute only works on a form control) instead of raising its contrast; leave decoration, opacity-faded state-demo labels and single separator glyphs as they are. Otherwise adjust only a derived colour — one the preview made: a mix, an opacity or alpha the preview added (not one kept above), or a hardcoded value.'

// A form control's text is named by where it came from (#400): the colour to
// change for a placeholder is `::placeholder`'s, not the field's `color`, and
// an issue that called it plain text would send the author looking for a text
// node that is not there.
const SOURCE_WORDING = {
  placeholder: { name: "placeholder", note: "painted by `::placeholder`; " },
  value: { name: "input value", note: "" },
  option: { name: "selected option", note: "" },
} as const

function toIssue(f: DedupedFinding): MachineIssue {
  const source = f.source === undefined ? undefined : SOURCE_WORDING[f.source]
  const what =
    f.kind === "text"
      ? `${source?.name ?? "text"} "${f.sample ?? ""}" (${source?.note ?? ""}${f.fg} on ${f.bg})`
      : `${f.basis ?? "non-text"} edge ${f.fg} against ${f.bg}`
  return {
    severity: "warn",
    rule: STAGED_CONTRAST_RULE,
    section: `contrast — ${f.theme} ${f.state} @${f.widths.join("/")}px`,
    fix: `\`${f.path}\` ${what} renders at ${ratio(f.ratio)}, below the ${f.threshold}:1 it needs. ${VALUE_GUIDANCE}`,
  }
}

// One item for every theme under the floor, so an author reading it once
// learns which side to add to and how much.
function thinIssue(
  textElements: Partial<Record<Theme, number>>
): MachineIssue | null {
  const thin = Object.entries(textElements).filter(
    ([, n]) => n < MIN_TEXT_ELEMENTS
  )
  if (thin.length === 0) return null
  const shown = thin
    .map(([theme, n]) => `${theme} shows ${n} (${MIN_TEXT_ELEMENTS - n} short)`)
    .join(", ")
  return {
    severity: "warn",
    rule: STAGED_THIN_RULE,
    section: `text elements — ${thin.map(([theme]) => theme).join(", ")} under ${MIN_TEXT_ELEMENTS}`,
    fix: `Each theme needs at least ${MIN_TEXT_ELEMENTS} text elements the contrast collector reads, and the CI contrast job blocks a preview with fewer; ${shown}. ${THIN_PREVIEW_ADVICE.join(" ")}`,
  }
}

export function observedRender(
  deduped: Array<DedupedFinding>,
  swept: SweepShape,
  max: number = MAX_RENDER_ISSUES
): RenderResult<ObservedRender> {
  const count = (verdict: DedupedFinding["verdict"]): number =>
    deduped.filter((f) => f.verdict === verdict).length
  // By rank, then worst first. Ratio alone is the wrong key across ranks: a
  // decorative 1.2:1 edge always sorts below a 4.1:1 caption, and on the
  // samsung fixture it filled every slot.
  const failures = deduped
    .filter((f) => f.verdict === "fail")
    .sort(
      (a, b) =>
        rank(a) - rank(b) || a.ratio - b.ratio || a.path.localeCompare(b.path)
    )
  const contrast = failures.slice(0, max).map(toIssue)
  // From the gate's own totals, so the number here is the number CI will
  // hold the preview to. Seeded from the swept themes rather than read off the
  // totals' rows: a theme with no text reading has no row there, and it is the
  // thinnest case of all.
  const totals = totalsBySlug(deduped)
  const textElements: Partial<Record<Theme, number>> = {}
  for (const theme of swept.themes) {
    textElements[theme] = totals
      .filter((t) => t.kind === "text" && t.theme === theme)
      .reduce((sum, t) => sum + t.elements, 0)
  }
  // Ahead of the contrast items and outside their cap: the cap exists so a
  // long list of shortfalls does not bury the few worth acting on, and this
  // one is about the whole preview.
  const thin = thinIssue(textElements)
  const issues = thin === null ? contrast : [thin, ...contrast]
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
        reported: contrast.length,
        omitted: failures.length - contrast.length,
        omittedDarkText: failures.slice(max).filter((f) => rank(f) === 0)
          .length,
        textElements,
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
  // Both of this stage's rules, so a rerun replaces its earlier result — a
  // preview padded past the floor must lose the old thin item with it.
  const kept = base.issues.filter(
    (i) => i.rule !== STAGED_CONTRAST_RULE && i.rule !== STAGED_THIN_RULE
  )
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
