import { describe, expect, it } from "vitest"
import { hoverDelta } from "../../scripts/audit-contrast-sweep"
import type { Finding } from "./contrast-report"

// `hoverDelta` keeps only what forcing `:hover` actually changed. What counts
// as "changed" is the whole question: the hover pass re-measures every element
// on the page, so a key that is too narrow throws away the findings the pass
// exists to produce.

const base: Finding = {
  slug: "toss",
  theme: "light",
  state: "default",
  width: 976,
  kind: "text",
  path: "div.card > button.btn",
  sample: "확인",
  ratio: 4.8,
  threshold: 4.5,
  verdict: "pass",
  blockers: [],
  opacityApprox: false,
}

const hovered = (over: Partial<Finding> = {}): Finding => ({
  ...base,
  state: "hover",
  ...over,
})

describe("hoverDelta", () => {
  it("drops a row hover did not move", () => {
    expect(hoverDelta([base], [hovered()])).toHaveLength(0)
  })

  it("keeps a row whose ratio hover changed", () => {
    expect(hoverDelta([base], [hovered({ ratio: 3.6 })])).toHaveLength(1)
  })

  it("keeps a row hover made unreadable at the same ratio", () => {
    // toss hovers every button with `filter: brightness(0.96)`. The filter
    // transforms the painted pixels but not `color` or `background-color`, so
    // the collector reads the SAME ratio and flags the reading instead. A key
    // of path + ratio alone throws that away, and the hover pass reports
    // nothing for the one preview that filters its hovers.
    const got = hoverDelta(
      [base],
      [hovered({ verdict: "indeterminate", blockers: ["filter"] })]
    )
    expect(got).toHaveLength(1)
    expect(got[0].blockers).toEqual(["filter"])
  })

  it("keeps a row whose verdict hover changed without the ratio moving much", () => {
    const got = hoverDelta(
      [{ ...base, ratio: 4.55, verdict: "borderline" }],
      [hovered({ ratio: 4.55, verdict: "pass" })]
    )
    expect(got).toHaveLength(1)
  })

  it("tells two elements apart by path", () => {
    const got = hoverDelta([base], [hovered({ path: "div.card > a.link" })])
    expect(got).toHaveLength(1)
  })

  it("keeps a row whose threshold hover changed, at the same verdict", () => {
    // A `:hover` rule that enlarges text past 18pt moves the threshold from
    // 4.5:1 to 3:1. When the ratio happens to land the same to three decimals
    // AND both sides still fail, every other field agrees — so a key without
    // the threshold calls the two readings identical and drops the hover one,
    // although what the audit asks of that text has changed.
    //
    // No preview changes font-size on hover today, so this is latent rather
    // than live; `contrast-report.ts`'s `keyOf` keeps the threshold for the
    // same reason, and its sister here should not disagree with it.
    const got = hoverDelta(
      [{ ...base, ratio: 2.0, threshold: 4.5, verdict: "fail" }],
      [hovered({ ratio: 2.0, threshold: 3, verdict: "fail" })]
    )
    expect(got).toHaveLength(1)
  })
})
