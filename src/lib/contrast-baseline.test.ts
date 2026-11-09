import { describe, expect, it } from "vitest"
import {
  BASELINE_WIDTHS,
  MIN_TEXT_ELEMENTS,
  baselineArgConflicts,
  baselineHolds,
  compareToBaseline,
  renderBaselineFailure,
} from "./contrast-baseline"
import { renderTotalsTable } from "./contrast-report"
import type { SlugTotals } from "./contrast-report"

const row = (over: Partial<SlugTotals> = {}): SlugTotals => ({
  slug: "toss",
  theme: "light",
  kind: "text",
  measured: 196,
  elements: 400,
  fail: 52,
  borderline: 1,
  indeterminate: 16,
  ...over,
})

describe("compareToBaseline", () => {
  it("reports nothing when the sweep matches what was recorded", () => {
    const got = compareToBaseline([row()], [row()])
    expect(got).toEqual({
      blocking: [],
      warnings: [],
      unrecorded: [],
      missing: [],
      thin: [],
    })
  })

  it("blocks a text row whose fail count rose", () => {
    const got = compareToBaseline([row({ fail: 53 })], [row()])
    expect(got.blocking).toEqual([
      {
        slug: "toss",
        theme: "light",
        kind: "text",
        field: "fail",
        recorded: 52,
        measured: 53,
      },
    ])
  })

  it("blocks a text row whose fail count fell", () => {
    const got = compareToBaseline([row({ fail: 51 })], [row()])
    expect(got.blocking.map((d) => d.field)).toEqual(["fail"])
  })

  it("blocks a text row whose measured count moved", () => {
    const got = compareToBaseline([row({ measured: 195 })], [row()])
    expect(got.blocking.map((d) => d.field)).toEqual(["measured"])
  })

  it("warns rather than blocks when only elements moved", () => {
    const got = compareToBaseline([row({ elements: 404 })], [row()])
    expect(got.blocking).toEqual([])
    expect(got.warnings).toEqual([
      {
        slug: "toss",
        theme: "light",
        kind: "text",
        field: "elements",
        recorded: 400,
        measured: 404,
      },
    ])
  })
})

describe("compareToBaseline, thin previews", () => {
  // The floor is read from what the sweep MEASURED. A check on the recorded
  // table alone trusts whoever pasted the numbers, and `elements` is the one
  // count the exact comparison leaves out, so a hand-raised value would pass.
  const thin = row({ elements: MIN_TEXT_ELEMENTS - 1 })

  it("blocks a measured text row under the floor even when the table records the same number", () => {
    const got = compareToBaseline([thin], [thin])
    expect(got.thin).toEqual([thin])
    expect(baselineHolds(got)).toBe(false)
  })

  it("blocks it when the table claims a thicker preview than the sweep found", () => {
    const got = compareToBaseline([thin], [row()])
    expect(got.thin).toEqual([thin])
    expect(baselineHolds(got)).toBe(false)
  })

  it("blocks a new slug's thin row as well as reporting it unrecorded", () => {
    const fresh = row({ slug: "laftel", elements: 51 })
    const got = compareToBaseline([row(), fresh], [row()])
    expect(got.thin).toEqual([fresh])
    expect(got.unrecorded).toEqual([fresh])
  })

  it("leaves a row exactly at the floor alone", () => {
    const edge = row({ elements: MIN_TEXT_ELEMENTS })
    expect(compareToBaseline([edge], [edge]).thin).toEqual([])
  })

  it("does not apply the floor to non-text", () => {
    // Non-text counts painted surfaces, a handful per preview; four is normal.
    const few = row({ kind: "non-text", measured: 4, elements: 4 })
    expect(compareToBaseline([few], [few]).thin).toEqual([])
  })

  it("prints the thin rows and what to do about them", () => {
    const lines = renderBaselineFailure(
      compareToBaseline([thin], [thin]),
      [thin],
      [thin]
    ).join("\n")
    expect(lines).toContain(`FAIL contrast baseline — 1 text row(s)`)
    expect(lines).toContain(`toss | light | text — elements ${thin.elements}`)
    expect(lines).toContain("rubric-preview.md")
    // The count is the text the contrast collector reads, which skips disabled
    // text. Pointing at "states" without saying so sends a reader to add
    // disabled states, which cannot raise it.
    expect(lines).toContain("non-disabled")
    expect(lines).toContain("Disabled, hidden")
  })

  it("does not send a thin-only failure to the table", () => {
    // The closing paragraph is about pasting CI's numbers into the table, and
    // no rewrite of the table clears a floor read from the measured count.
    const lines = renderBaselineFailure(
      compareToBaseline([thin], [thin]),
      [thin],
      [thin]
    ).join("\n")
    expect(lines).not.toContain("rebaseline")
    expect(lines).not.toContain("Take the replacement lines from CI")
    expect(lines).toContain("Rewriting the table does not clear it")
  })

  it("keeps a thin new slug out of the rows to paste", () => {
    // A new entry under the floor is both unrecorded and thin. Listing its
    // rows to paste, with the closing paragraph that says to paste them, sends
    // its author to a table the corpus test then refuses. The whole slug is
    // held back — its non-text rows too, or the four-rows-per-slug check
    // refuses the half that was pasted.
    const freshText = row({ slug: "laftel", elements: 51 })
    const freshNonText = row({
      slug: "laftel",
      kind: "non-text",
      measured: 5,
      elements: 17,
    })
    const measured = [row(), freshText, freshNonText]
    const lines = renderBaselineFailure(
      compareToBaseline(measured, [row()]),
      measured,
      [row()]
    ).join("\n")
    expect(lines).not.toContain("the table does not record")
    expect(lines).not.toContain(
      renderTotalsTable([freshNonText]).split("\n")[2]
    )
    expect(lines).not.toContain("Take the replacement lines from CI")
    expect(lines).toContain("only after the preview clears the floor")
  })

  it("still lists a new slug that is not thin beside one that is", () => {
    const thinFresh = row({ slug: "laftel", elements: 51 })
    const fresh = row({ slug: "chzzk" })
    const measured = [row(), thinFresh, fresh]
    const lines = renderBaselineFailure(
      compareToBaseline(measured, [row()]),
      measured,
      [row()]
    ).join("\n")
    expect(lines).toContain("1 row(s) the table does not record")
    expect(lines).toContain(renderTotalsTable([fresh]).split("\n")[2])
    expect(lines).not.toContain(renderTotalsTable([thinFresh]).split("\n")[2])
    // The closing paragraph is printed for the healthy slug, and the
    // rebaseline command it names writes every measured slug — the thin one
    // too — so it has to say which entries to keep out.
    expect(lines).toContain("Take the replacement lines from CI")
    expect(lines).toContain("laftel is under the floor")
    expect(lines).toContain("Clear the floor first")
    expect(lines).not.toContain("by hand")
  })

  it("does not suggest a partial hand paste when a recorded count also moved", () => {
    // A moved count of a classified slug is tied to the pair and hold-reason
    // tables, which only a whole-run rebaseline rewrites. Pasting that one
    // line by hand while a thin slug blocks the rebaseline fails the corpus
    // test instead, so the advice is to clear the floor first and then
    // rebaseline the run that passes it.
    const thinFresh = row({ slug: "laftel", elements: 51 })
    const measured = [row({ fail: 53 }), thinFresh]
    const lines = renderBaselineFailure(
      compareToBaseline(measured, [row()]),
      measured,
      [row()]
    ).join("\n")
    expect(lines).toContain("fail 52 → 53")
    expect(lines).toContain("Clear the floor first")
    expect(lines).not.toContain("by hand")
  })

  it("still prints the closing paragraph when a count also moved", () => {
    const moved = { ...thin, fail: thin.fail + 1 }
    const lines = renderBaselineFailure(
      compareToBaseline([moved], [thin]),
      [moved],
      [thin]
    ).join("\n")
    expect(lines).toContain("Take the replacement lines from CI")
  })
})

describe("compareToBaseline, rows that do not pair", () => {
  it("reports a slug the baseline has no row for", () => {
    const fresh = row({ slug: "remember" })
    const got = compareToBaseline([row(), fresh], [row()])
    expect(got.unrecorded).toEqual([fresh])
    expect(got.missing).toEqual([])
  })

  it("reports a baseline row the sweep produced nothing for", () => {
    const got = compareToBaseline([row()], [row(), row({ slug: "retired" })])
    expect(got.missing).toEqual([
      { slug: "retired", theme: "light", kind: "text" },
    ])
    expect(got.unrecorded).toEqual([])
  })

  it("does not read an unrecorded slug as a count that moved", () => {
    const got = compareToBaseline([row({ slug: "remember" })], [row()])
    expect(got.blocking).toEqual([])
    expect(got.warnings).toEqual([])
  })
})

// The non-text half is a floor, not a ratchet: whether a painted surface is a
// component at all under SC 1.4.11 is a judgement left to a reader, so these
// counts are reported rather than pinned. One row of give goes with that — the
// question is whether the sweep still reaches these surfaces, and a collector
// that stops reaching a class of them loses rows by the dozen.
const nonText = (over: Partial<SlugTotals> = {}): SlugTotals =>
  row({ kind: "non-text", measured: 27, elements: 36, fail: 13, ...over })

describe("compareToBaseline, non-text", () => {
  it("warns rather than blocks when a fail count moved", () => {
    const got = compareToBaseline([nonText({ fail: 19 })], [nonText()])
    expect(got.blocking).toEqual([])
    expect(got.warnings.map((d) => d.field)).toEqual(["fail"])
  })

  it("blocks a row that lost even one measurement", () => {
    // No give. There was some, to absorb one animated element; the element was
    // fixed at its source and the give went with it, because give here is
    // indistinguishable from a coverage loss nobody sees.
    const got = compareToBaseline([nonText({ measured: 26 })], [nonText()])
    expect(got.blocking).toEqual([
      {
        slug: "toss",
        theme: "light",
        kind: "non-text",
        field: "measured",
        recorded: 27,
        measured: 26,
      },
    ])
  })

  it("does not also warn about the count it blocked", () => {
    const got = compareToBaseline([nonText({ measured: 26 })], [nonText()])
    expect(got.warnings.map((d) => d.field)).toEqual([])
  })

  it("does not block a row that measured more than was recorded", () => {
    const got = compareToBaseline([nonText({ measured: 30 })], [nonText()])
    expect(got.blocking).toEqual([])
    expect(got.warnings.map((d) => d.field)).toEqual(["measured"])
  })
})

describe("renderBaselineFailure", () => {
  const measured = [row({ fail: 53 })]
  const baseline = [row()]
  const text = (): string =>
    renderBaselineFailure(
      compareToBaseline(measured, baseline),
      measured,
      baseline
    ).join("\n")

  it("names the count that moved and both of its values", () => {
    expect(text()).toContain("fail 52 → 53")
  })

  it("prints a line that pastes into the recorded table", () => {
    // Generated by the writer itself, not re-spelled here: a hand-built line
    // that drifted from `renderTotalsTable` would paste into a table the
    // parser then refuses.
    expect(text()).toContain(renderTotalsTable(measured).split("\n")[2])
    expect(text()).toContain(renderTotalsTable(baseline).split("\n")[2])
  })

  it("prints the line to delete for a row the sweep did not produce", () => {
    const retired = row({ slug: "retired" })
    const lines = renderBaselineFailure(
      compareToBaseline(measured, [...baseline, retired]),
      measured,
      [...baseline, retired]
    ).join("\n")
    expect(lines).toContain(renderTotalsTable([retired]).split("\n")[2])
  })

  it("says where the replacement numbers have to come from", () => {
    // A local run on another OS legitimately differs, so the most available
    // action after a red local gate is to paste the local numbers in — which
    // is the mistake the first CI run of this gate caught.
    expect(text()).toMatch(/CI/)
  })

  it("says nothing at all when the sweep matches", () => {
    expect(
      renderBaselineFailure(
        compareToBaseline(baseline, baseline),
        baseline,
        baseline
      )
    ).toEqual([])
  })
})

describe("baselineHolds", () => {
  it("holds when nothing blocks", () => {
    expect(baselineHolds(compareToBaseline([row()], [row()]))).toBe(true)
  })

  it("still holds when only a warning was reported", () => {
    expect(
      baselineHolds(compareToBaseline([row({ elements: 404 })], [row()]))
    ).toBe(true)
  })

  it("does not hold when a count blocked", () => {
    expect(baselineHolds(compareToBaseline([row({ fail: 53 })], [row()]))).toBe(
      false
    )
  })

  it("does not hold when a slug has no recorded row", () => {
    expect(
      baselineHolds(compareToBaseline([row({ slug: "remember" })], [row()]))
    ).toBe(false)
  })

  it("does not hold when a recorded row was not measured", () => {
    expect(
      baselineHolds(compareToBaseline([row()], [row(), row({ slug: "x" })]))
    ).toBe(false)
  })
})

describe("baselineArgConflicts", () => {
  const full = {
    widths: [...BASELINE_WIDTHS],
    theme: "both" as const,
    online: false,
    selfCheck: false,
  }

  it("allows the sweep the table was recorded from", () => {
    expect(baselineArgConflicts(full)).toEqual([])
  })

  it("does not let a caller rewrite the widths it compares against", () => {
    // The CLI takes its default from this array. Handed out by reference, one
    // in-place sort anywhere downstream would edit the constant itself — and
    // the widths check would then be comparing it to itself and passing.
    expect(() => {
      ;(BASELINE_WIDTHS as Array<number>).push(2560)
    }).toThrow()
  })

  it("still allows it when the run also writes its artifacts", () => {
    expect(
      baselineArgConflicts({
        ...full,
        jsonOut: "out.json",
        reportOut: "out.md",
        verbose: true,
      })
    ).toEqual([])
  })

  it("refuses a single slug", () => {
    expect(baselineArgConflicts({ ...full, slug: "toss" })).toHaveLength(1)
  })

  it("refuses widths the table was not recorded at", () => {
    expect(baselineArgConflicts({ ...full, widths: [375] })).toHaveLength(1)
  })

  it("refuses one theme", () => {
    expect(baselineArgConflicts({ ...full, theme: "light" })).toHaveLength(1)
  })

  it("refuses a run that lets the font CDN through", () => {
    expect(baselineArgConflicts({ ...full, online: true })).toHaveLength(1)
  })

  it("refuses being asked for the self-check at the same time", () => {
    expect(baselineArgConflicts({ ...full, selfCheck: true })).toHaveLength(1)
  })

  it("names every conflict rather than the first", () => {
    expect(
      baselineArgConflicts({ ...full, slug: "toss", online: true })
    ).toHaveLength(2)
  })
})
