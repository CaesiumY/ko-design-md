// The judging half of the screen comparison tool (`pnpm preview:dom-diff`,
// `scripts/preview-dom-diff.ts`): two captures of a rendered preview in, the
// differences between them out. Kept apart from the capturing half so it can
// be tested without a browser.
//
// TRANSITIONAL. The tool exists for the preview-standard migration (spec #724):
// walking the dark copies out of the previews, then moving them onto the shared
// frame, are both edits that must not change what a visitor sees. It goes when
// the frame migration ends.

import { splitSelectorList } from "./selector-text"

/** One element as one pass saw it. */
export interface DomRow {
  /** Tag, id and classes — `button#go.btn.primary`. */
  who: string
  /** The element's own text, not its descendants'. */
  text: string
  /** Page x, y, width, height, rounded to half a pixel. */
  rect: Array<number>
  /** Computed style, by property; pseudo-elements as `::before content`. */
  style: Record<string, string>
}

/**
 * Every pass of one document, by label (`dark @976 :hover (4 forced)`), each a
 * list of its elements in document order.
 */
export type DomPasses = Map<string, Array<DomRow>>

export interface DomDiff {
  pass: string
  /** Position of the element in its pass, or -1 for a finding about the pass. */
  index: number
  who: string
  what: string
  a: string
  b: string
}

/** How far a box may move before it is a difference, in CSS pixels. */
const BOX_TOLERANCE = 0.5
const BOX_SIDES = ["x", "y", "width", "height"]

/**
 * Every difference between two captures.
 *
 * Elements are paired by position within a pass, so the comparison is between
 * two versions of one document, not two arbitrary pages. Where the structure
 * itself differs, the pass reports that and stops: every pair after the first
 * mismatch would be two unrelated elements.
 */
export function compareDomPasses(a: DomPasses, b: DomPasses): Array<DomDiff> {
  const diffs: Array<DomDiff> = []
  for (const [pass, rowsA] of a) {
    const rowsB = b.get(pass)
    if (rowsB === undefined) {
      diffs.push({
        pass,
        index: -1,
        who: "(pass)",
        what: "pass missing on side b",
        a: `${rowsA.length} element(s)`,
        b: "(none)",
      })
      continue
    }
    if (rowsA.length !== rowsB.length) {
      diffs.push({
        pass,
        index: -1,
        who: "(document)",
        what: "element count",
        a: String(rowsA.length),
        b: String(rowsB.length),
      })
    }
    const n = Math.min(rowsA.length, rowsB.length)
    for (let i = 0; i < n; i++) {
      const ra = rowsA[i]
      const rb = rowsB[i]
      if (ra.who !== rb.who) {
        diffs.push({
          pass,
          index: i,
          who: ra.who,
          what: "element",
          a: ra.who,
          b: rb.who,
        })
        break
      }
      if (ra.text !== rb.text) {
        diffs.push({
          pass,
          index: i,
          who: ra.who,
          what: "text",
          a: ra.text,
          b: rb.text,
        })
      }
      for (let k = 0; k < BOX_SIDES.length; k++) {
        if (Math.abs(ra.rect[k] - rb.rect[k]) > BOX_TOLERANCE) {
          diffs.push({
            pass,
            index: i,
            who: ra.who,
            what: `box ${BOX_SIDES[k]}`,
            a: String(ra.rect[k]),
            b: String(rb.rect[k]),
          })
        }
      }
      const keys = new Set([...Object.keys(ra.style), ...Object.keys(rb.style)])
      for (const key of keys) {
        const va = ra.style[key] ?? "(absent)"
        const vb = rb.style[key] ?? "(absent)"
        if (va !== vb) {
          diffs.push({ pass, index: i, who: ra.who, what: key, a: va, b: vb })
        }
      }
    }
  }
  for (const [pass, rowsB] of b) {
    if (a.has(pass)) continue
    diffs.push({
      pass,
      index: -1,
      who: "(pass)",
      what: "pass missing on side a",
      a: "(none)",
      b: `${rowsB.length} element(s)`,
    })
  }
  return diffs
}

const STATE_PSEUDO = "(?:hover|active|focus-visible|focus-within|focus)"
const HAS_STATE = new RegExp(`:${STATE_PSEUDO}(?![\\w-])`)
const EVERY_STATE = new RegExp(HAS_STATE.source, "g")
const PSEUDO_ELEMENT = /::[\w-]+(?:\([^)]*\))?/g

/**
 * Where each compound of one selector starts and ends — `.tbl`, `tr:hover` and
 * `td` in `.tbl tr:hover td`. A combinator ends a compound only outside
 * brackets, parentheses and quotes, so `[title="x > y"]` and
 * `:nth-child(2n + 1)` stay whole.
 */
function compoundSpans(selector: string): Array<[number, number]> {
  const spans: Array<[number, number]> = []
  let start = -1
  let depth = 0
  let quote: string | null = null
  for (let i = 0; i <= selector.length; i++) {
    if (i < selector.length) {
      const ch = selector[i]
      if (quote !== null) {
        if (ch === "\\") i++
        else if (ch === quote) quote = null
        continue
      }
      if (ch === '"' || ch === "'") quote = ch
      else if (ch === "(" || ch === "[") depth++
      else if ((ch === ")" || ch === "]") && depth > 0) depth--
      if (depth > 0 || quote !== null || !/[\s>+~]/.test(ch)) {
        if (start === -1) start = i
        continue
      }
    }
    if (start !== -1) spans.push([start, i])
    start = -1
  }
  return spans
}

/**
 * The elements a rule needs put into a state before it can apply, as selectors
 * to look them up by: `.tbl tr` for `.tbl tr:hover td`.
 *
 * A forced state lands on the one node it is set on. A real pointer over a
 * cell hovers the row and everything above it too; a forced `:hover` on the
 * cell does not, so `tr:hover td` never matches unless the row itself is
 * forced. The element to force is therefore the one the pseudo-class is
 * written on, found by everything in the selector up to and including that
 * compound — not the element the rule ends up styling.
 *
 * Names nothing where the pseudo-class sits on no named element (`:hover`
 * alone, `.menu :hover`): forcing every element is not what such a rule
 * describes in use. A state written inside `:has()` or `:not()` names the
 * compound around it, which is not the element that would be in the state.
 */
export function stateTargetSelectors(selectorText: string): Array<string> {
  const strip = (text: string) =>
    text.replace(EVERY_STATE, "").replace(PSEUDO_ELEMENT, "")
  const targets = new Set<string>()
  for (const selector of splitSelectorList(selectorText)) {
    for (const [start, end] of compoundSpans(selector)) {
      const compound = selector.slice(start, end)
      if (!HAS_STATE.test(compound) || strip(compound) === "") continue
      targets.add(strip(selector.slice(0, end)).replace(/\s+/g, " ").trim())
    }
  }
  return [...targets]
}

/** One difference the self-check plants. `pass` is a prefix of the label. */
export interface PlantedDifference {
  pass: string
  who: string
  what: string
}

/**
 * Judge the tool's self-check: what is wrong with these two results, in words.
 *
 * `same` is a document compared against a second capture of itself; `changed`
 * is that document against a copy with the planted rules altered. A tool that
 * works finds nothing in the first and exactly the planted differences in the
 * second. Finding nothing in the second is the failure this exists for — a
 * tool gone blind answers "no difference" to every question it is asked. Each
 * planted difference is judged by name, because each is a shape the tool can
 * lose sight of on its own.
 */
export function selfCheckProblems(
  same: Array<DomDiff>,
  changed: Array<DomDiff>,
  planted: ReadonlyArray<PlantedDifference>
): Array<string> {
  const problems: Array<string> = []
  const show = (d: DomDiff) => `[${d.pass}] ${d.who} ${d.what}: ${d.a} → ${d.b}`
  if (same.length > 0) {
    problems.push(
      `a document compared with itself shows ${same.length} difference(s), first: ${show(same[0])}`
    )
  }
  const is = (p: PlantedDifference) => (d: DomDiff) =>
    d.pass.startsWith(p.pass) && d.who === p.who && d.what === p.what
  for (const p of planted) {
    if (!changed.some(is(p))) {
      problems.push(
        `a planted difference was not found: ${p.what} of ${p.who} in the "${p.pass}" pass`
      )
    }
  }
  const stray = changed.filter((d) => !planted.some((p) => is(p)(d)))
  if (stray.length > 0) {
    problems.push(
      `${planted.length} rule(s) were changed, but ${stray.length} difference(s) showed up outside them, first: ${show(stray[0])}`
    )
  }
  return problems
}
