// The judging half of the screen comparison tool (`pnpm preview:dom-diff`,
// `scripts/preview-dom-diff.ts`): two captures of a rendered preview in, the
// differences between them out. Kept apart from the capturing half so it can
// be tested without a browser.
//
// TRANSITIONAL. The tool exists for the preview-standard migration (spec #724):
// walking the dark copies out of the previews, then moving them onto the shared
// frame, are both edits that must not change what a visitor sees. It goes when
// the frame migration ends.

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

/** The one difference the self-check plants. `pass` is a prefix of the label. */
export interface PlantedDifference {
  pass: string
  who: string
  what: string
}

/**
 * Judge the tool's self-check: what is wrong with these two results, in words.
 *
 * `same` is a document compared against a second capture of itself; `changed`
 * is that document against a copy with one dark `:hover` rule altered. A tool
 * that works finds nothing in the first and exactly the planted difference in
 * the second. Finding nothing in the second is the failure this exists for — a
 * tool gone blind answers "no difference" to every question it is asked.
 */
export function selfCheckProblems(
  same: Array<DomDiff>,
  changed: Array<DomDiff>,
  planted: PlantedDifference
): Array<string> {
  const problems: Array<string> = []
  const show = (d: DomDiff) => `[${d.pass}] ${d.who} ${d.what}: ${d.a} → ${d.b}`
  if (same.length > 0) {
    problems.push(
      `a document compared with itself shows ${same.length} difference(s), first: ${show(same[0])}`
    )
  }
  const isPlanted = (d: DomDiff) =>
    d.pass.startsWith(planted.pass) &&
    d.who === planted.who &&
    d.what === planted.what
  if (!changed.some(isPlanted)) {
    problems.push(
      `the planted difference was not found: ${planted.what} of ${planted.who} in the "${planted.pass}" pass`
    )
  }
  const stray = changed.filter((d) => !isPlanted(d))
  if (stray.length > 0) {
    problems.push(
      `one rule was changed, but ${stray.length} difference(s) showed up outside it, first: ${show(stray[0])}`
    )
  }
  return problems
}
