import { describe, expect, it } from "vitest"
import {
  BASELINE_WIDTHS,
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

// The non-text half is a floor, not a ratchet. Measured on 99aae06, repeated
// sweeps of the same tree move `toss` non-text by up to two rows in each theme
// — the cause is one element, `div.loader-3 > span.dot`, whose `tds-pulse`
// keyframes animate `opacity` and so hand the collector a different reading
// depending on which phase the sample lands in.
const nonText = (over: Partial<SlugTotals> = {}): SlugTotals =>
  row({ kind: "non-text", measured: 27, elements: 36, fail: 13, ...over })

describe("compareToBaseline, non-text", () => {
  it("warns rather than blocks when a fail count moved", () => {
    const got = compareToBaseline([nonText({ fail: 19 })], [nonText()])
    expect(got.blocking).toEqual([])
    expect(got.warnings.map((d) => d.field)).toEqual(["fail"])
  })

  it("allows a row that measured one short of what was recorded", () => {
    const got = compareToBaseline([nonText({ measured: 26 })], [nonText()])
    expect(got.blocking).toEqual([])
    expect(got.warnings.map((d) => d.field)).toEqual(["measured"])
  })

  it("allows a row that measured two short, the whole observed spread", () => {
    // CI measured `toss` dark non-text at 28 and then at 26 on the same tree.
    const got = compareToBaseline([nonText({ measured: 25 })], [nonText()])
    expect(got.blocking).toEqual([])
    expect(got.warnings.map((d) => d.field)).toEqual(["measured"])
  })

  it("blocks a row that measured below the floor", () => {
    const got = compareToBaseline([nonText({ measured: 24 })], [nonText()])
    expect(got.blocking).toEqual([
      {
        slug: "toss",
        theme: "light",
        kind: "non-text",
        field: "measured",
        recorded: 27,
        measured: 24,
      },
    ])
  })

  it("does not also warn about the count it blocked", () => {
    const got = compareToBaseline([nonText({ measured: 24 })], [nonText()])
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
