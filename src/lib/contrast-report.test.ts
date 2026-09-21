import { describe, expect, it } from "vitest"
import {
  blockerTally,
  dedupeFindings,
  parseTotalsTable,
  renderFindingsTable,
  renderTotalsTable,
  totalsBySlug,
} from "./contrast-report"
import type { Finding } from "./contrast-report"

const base: Omit<Finding, "width"> = {
  slug: "toss",
  theme: "light",
  state: "default",
  kind: "text",
  path: "body > main .card .label",
  sample: "결제 수단",
  ratio: 3.42,
  threshold: 4.5,
  verdict: "fail",
  blockers: [],
  opacityApprox: false,
  fg: "#7a7a7a",
  bg: "#ffffff",
}

const at = (width: number, over: Partial<Finding> = {}): Finding => ({
  ...base,
  width,
  ...over,
})

describe("dedupeFindings", () => {
  it("folds one finding seen at every width into a single row", () => {
    const got = dedupeFindings([at(375), at(768), at(976), at(1440)])
    expect(got).toHaveLength(1)
    expect(got[0].widths).toEqual([375, 768, 976, 1440])
  })

  it("keeps the widths sorted however they arrived", () => {
    expect(dedupeFindings([at(1440), at(375), at(976)])[0].widths).toEqual([
      375, 976, 1440,
    ])
  })

  it("separates two elements that happen to measure the same", () => {
    const got = dedupeFindings([at(375), at(375, { path: "body > footer p" })])
    expect(got).toHaveLength(2)
  })

  it("separates the same element when a media query changed its colour", () => {
    const got = dedupeFindings([
      at(375, { ratio: 3.42 }),
      at(1440, { ratio: 7.1 }),
    ])
    expect(got).toHaveLength(2)
  })

  it("separates the same element across the two themes", () => {
    const got = dedupeFindings([at(375), at(375, { theme: "dark" })])
    expect(got).toHaveLength(2)
  })

  it("separates default from hover on one element", () => {
    const got = dedupeFindings([at(375), at(375, { state: "hover" })])
    expect(got).toHaveLength(2)
  })

  it("separates a fluid heading that changed threshold band across widths", () => {
    // clamp()/vw type crosses 18pt between widths, so the same element is held
    // to 4.5:1 on a phone and 3:1 on a desktop. Folding those together would
    // report one of the two thresholds for both.
    const got = dedupeFindings([
      at(375, { ratio: 3.42, threshold: 4.5 }),
      at(1440, { ratio: 3.42, threshold: 3 }),
    ])
    expect(got).toHaveLength(2)
  })

  it("puts failures first, then borderline, then held readings, then passes", () => {
    const got = dedupeFindings([
      at(375, { path: "a", verdict: "pass", ratio: 9 }),
      at(375, {
        path: "b",
        verdict: "indeterminate",
        ratio: 5,
        blockers: ["gradient"],
      }),
      at(375, { path: "c", verdict: "borderline", ratio: 4.46 }),
      at(375, { path: "d", verdict: "fail", ratio: 2.1 }),
    ])
    expect(got.map((f) => f.verdict)).toEqual([
      "fail",
      "borderline",
      "indeterminate",
      "pass",
    ])
  })

  it("orders equally severe rows by how far short they fall", () => {
    const got = dedupeFindings([
      at(375, { path: "a", verdict: "fail", ratio: 3.9 }),
      at(375, { path: "b", verdict: "fail", ratio: 1.2 }),
    ])
    expect(got.map((f) => f.ratio)).toEqual([1.2, 3.9])
  })
})

describe("totalsBySlug", () => {
  it("counts every measured row and each verdict separately per theme", () => {
    const got = totalsBySlug(
      dedupeFindings([
        at(375, { verdict: "fail" }),
        at(768, { verdict: "fail" }),
        at(375, { path: "x", verdict: "pass", ratio: 9 }),
        at(375, {
          path: "y",
          theme: "dark",
          verdict: "borderline",
          ratio: 4.46,
        }),
      ])
    )
    const light = got.find((t) => t.slug === "toss" && t.theme === "light")
    expect(light).toMatchObject({
      measured: 2,
      fail: 1,
      borderline: 0,
      indeterminate: 0,
    })
    const dark = got.find((t) => t.slug === "toss" && t.theme === "dark")
    expect(dark).toMatchObject({ measured: 1, fail: 0, borderline: 1 })
  })

  it("counts deduped rows, not one per width", () => {
    // The totals table seeds the next session's ratchet. Counting per width
    // would make the number depend on how many widths were swept.
    const got = totalsBySlug(
      dedupeFindings([at(375), at(768), at(976), at(1440)])
    )
    expect(got[0].measured).toBe(1)
    expect(got[0].fail).toBe(1)
  })

  it("sorts by slug so the committed report does not churn", () => {
    const got = totalsBySlug(
      dedupeFindings([
        at(375, { slug: "yeogi" }),
        at(375, { slug: "baemin" }),
        at(375, { slug: "krds" }),
      ])
    )
    expect(got.map((t) => t.slug)).toEqual(["baemin", "krds", "yeogi"])
  })
})

describe("renderTotalsTable", () => {
  it("emits a header the next session can read a ratchet row from", () => {
    const out = renderTotalsTable(totalsBySlug(dedupeFindings([at(375)])))
    expect(out.split("\n")[0]).toBe(
      "| slug | theme | kind | measured | elements | fail | borderline | indeterminate |"
    )
  })

  it("puts one row per slug and theme", () => {
    const out = renderTotalsTable(
      totalsBySlug(
        dedupeFindings([at(375), at(375, { path: "z", theme: "dark" })])
      )
    )
    expect(out).toContain("| toss | light | text | 1 | 1 | 1 | 0 | 0 |")
    expect(out).toContain("| toss | dark | text | 1 | 1 | 1 | 0 | 0 |")
  })

  it("still renders a header when nothing was measured", () => {
    expect(renderTotalsTable([])).toContain("| slug | theme |")
  })
})

describe("renderFindingsTable", () => {
  it("reports the ratio to two decimals, where the threshold lives", () => {
    const out = renderFindingsTable(
      dedupeFindings([at(375, { ratio: 3.4235 })])
    )
    expect(out).toContain("3.42")
  })

  it("lists the widths a row was seen at", () => {
    const out = renderFindingsTable(
      dedupeFindings([at(375), at(768), at(976), at(1440)])
    )
    expect(out).toContain("375·768·976·1440")
  })

  it("says all when a row held at every swept width", () => {
    const out = renderFindingsTable(
      dedupeFindings([at(375), at(768), at(976), at(1440)]),
      [375, 768, 976, 1440]
    )
    expect(out).toContain("all")
    expect(out).not.toContain("375·768·976·1440")
  })

  it("names the blockers on a held reading instead of a verdict alone", () => {
    const out = renderFindingsTable(
      dedupeFindings([
        at(375, {
          verdict: "indeterminate",
          blockers: ["gradient", "overlay"],
        }),
      ])
    )
    expect(out).toContain("gradient")
    expect(out).toContain("overlay")
  })

  it("marks a row whose foreground was faded by an ancestor", () => {
    const out = renderFindingsTable(
      dedupeFindings([at(375, { opacityApprox: true })])
    )
    expect(out).toContain("opacity-approx")
  })

  it("escapes a pipe in an element's own text so the table survives it", () => {
    const out = renderFindingsTable(
      dedupeFindings([at(375, { sample: "a | b" })])
    )
    // Counted against the header rather than a literal, which is the claim
    // being made — the row has the columns the table declares — and does not
    // need rewriting every time the table gains one.
    const lines = out.split("\n")
    const row = lines.find((l) => l.includes("a "))
    expect(row?.split("|")).toHaveLength(lines[0].split("|").length)
  })
})

describe("blockerTally", () => {
  it("counts each reason a reading was held", () => {
    const got = blockerTally(
      dedupeFindings([
        at(375, {
          path: "a",
          verdict: "indeterminate",
          blockers: ["gradient"],
        }),
        at(375, {
          path: "b",
          verdict: "indeterminate",
          blockers: ["gradient", "overlay"],
        }),
      ])
    )
    expect(got).toEqual([
      { blocker: "gradient", count: 2 },
      { blocker: "overlay", count: 1 },
    ])
  })

  it("ignores blockers on rows that still got a verdict", () => {
    // `root-transparent` alone holds a reading, so a judged row carrying a
    // blocker would mean the two disagree. Counting it would inflate the tally.
    expect(
      blockerTally(dedupeFindings([at(375, { verdict: "fail" })]))
    ).toEqual([])
  })
})

describe("totalsBySlug — text and non-text are counted apart", () => {
  it("gives a slug one row per kind", () => {
    // The two kinds answer different success criteria (1.4.3 and 1.4.11) and a
    // non-text reading needs a human to say whether the surface is a component
    // at all. A ratchet that added them together could not be moved for one
    // without moving it for the other.
    const got = totalsBySlug(
      dedupeFindings([
        at(375),
        at(375, {
          path: "sw",
          kind: "non-text",
          sample: null,
          ratio: 1.6,
          threshold: 3,
          basis: "fill",
        }),
      ])
    )
    expect(got.map((t) => t.kind)).toEqual(["text", "non-text"])
    expect(got.every((t) => t.measured === 1)).toBe(true)
  })

  it("orders text before non-text within a slug and theme", () => {
    const got = totalsBySlug(
      dedupeFindings([
        at(375, {
          path: "sw",
          kind: "non-text",
          sample: null,
          ratio: 1.6,
          threshold: 3,
        }),
        at(375),
      ])
    )
    expect(got.map((t) => t.kind)).toEqual(["text", "non-text"])
  })

  it("carries the kind into the rendered header and rows", () => {
    const out = renderTotalsTable(totalsBySlug(dedupeFindings([at(375)])))
    expect(out.split("\n")[0]).toBe(
      "| slug | theme | kind | measured | elements | fail | borderline | indeterminate |"
    )
    expect(out).toContain("| toss | light | text | 1 | 1 | 1 | 0 | 0 |")
  })
})

describe("dedupeFindings — a verdict is not folded into another verdict", () => {
  it("keeps a held width apart from a judged one at the same ratio", () => {
    // A responsive width that introduces a gradient behind the same element
    // without moving the sampled ratio. Folding the two together reports the
    // judged one for both, so the totals say that width was measured when it
    // could not be judged.
    const got = dedupeFindings([
      at(375),
      at(1440, {
        verdict: "indeterminate",
        blockers: ["gradient"],
      }),
    ])
    expect(got).toHaveLength(2)
    expect(got.map((f) => f.verdict).sort()).toEqual(["fail", "indeterminate"])
  })

  it("keeps two holds apart when they were held for different reasons", () => {
    const got = dedupeFindings([
      at(375, { verdict: "indeterminate", blockers: ["gradient"] }),
      at(1440, { verdict: "indeterminate", blockers: ["overlay"] }),
    ])
    expect(got).toHaveLength(2)
  })

  it("keeps a faded reading apart from a solid one", () => {
    const got = dedupeFindings([at(375), at(1440, { opacityApprox: true })])
    expect(got).toHaveLength(2)
  })

  it("keeps a fill-based non-text reading apart from a border-based one", () => {
    const got = dedupeFindings([
      at(375, { kind: "non-text", sample: null, basis: "fill" }),
      at(1440, { kind: "non-text", sample: null, basis: "border" }),
    ])
    expect(got).toHaveLength(2)
  })

  it("still folds two widths that agree in every respect", () => {
    expect(dedupeFindings([at(375), at(1440)])).toHaveLength(1)
  })
})

describe("dedupeFindings — how many elements a row stands for", () => {
  it("counts repeated elements that fold into one row", () => {
    // A showcase grid repeats one component with one CSS rule behind it, so
    // every copy reads the same and folds together. The row is the right unit
    // for a ratchet — adding a fifth copy of a card does not make the preview
    // worse — but the count of copies is what says how much of the screen the
    // finding covers, and a row alone hides it.
    const got = dedupeFindings([at(375), at(375), at(375)])
    expect(got).toHaveLength(1)
    expect(got[0].occurrences).toBe(3)
  })

  it("counts per width, not across them", () => {
    // The same three elements seen at four widths is still three elements.
    const widths = [375, 768, 976, 1440]
    const got = dedupeFindings(widths.flatMap((w) => [at(w), at(w), at(w)]))
    expect(got).toHaveLength(1)
    expect(got[0].occurrences).toBe(3)
    expect(got[0].widths).toEqual(widths)
  })

  it("reports one occurrence for an element seen once", () => {
    expect(dedupeFindings([at(375)])[0].occurrences).toBe(1)
  })

  it("takes the widest count when a width sees more copies", () => {
    // A responsive grid can render more cards at a wider viewport.
    const got = dedupeFindings([at(375), at(1440), at(1440), at(1440)])
    expect(got[0].occurrences).toBe(3)
  })
})

describe("totalsBySlug — elements alongside rows", () => {
  it("counts elements as well as rows", () => {
    const got = totalsBySlug(dedupeFindings([at(375), at(375), at(375)]))
    expect(got[0].measured).toBe(1)
    expect(got[0].elements).toBe(3)
  })

  it("renders both", () => {
    const out = renderTotalsTable(
      totalsBySlug(dedupeFindings([at(375), at(375)]))
    )
    expect(out.split("\n")[0]).toBe(
      "| slug | theme | kind | measured | elements | fail | borderline | indeterminate |"
    )
    expect(out).toContain("| toss | light | text | 1 | 2 | 1 | 0 | 0 |")
  })
})

describe("parseTotalsTable", () => {
  it("reads the counts a recorded table states", () => {
    const table = [
      "| slug | theme | kind | measured | elements | fail | borderline | indeterminate |",
      "| --- | --- | --- | --- | --- | --- | --- | --- |",
      "| 11st | dark | text | 95 | 183 | 12 | 0 | 12 |",
      "| yeogi | light | non-text | 13 | 13 | 6 | 0 | 2 |",
    ].join("\n")
    expect(parseTotalsTable(table)).toEqual([
      {
        slug: "11st",
        theme: "dark",
        kind: "text",
        measured: 95,
        elements: 183,
        fail: 12,
        borderline: 0,
        indeterminate: 12,
      },
      {
        slug: "yeogi",
        theme: "light",
        kind: "non-text",
        measured: 13,
        elements: 13,
        fail: 6,
        borderline: 0,
        indeterminate: 2,
      },
    ])
  })

  it("refuses a header that is not the one renderTotalsTable writes", () => {
    const table = `| slug | theme | kind | rows | elements | fail | borderline | indeterminate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 11st | dark | text | 95 | 183 | 12 | 0 | 12 |`
    expect(() => parseTotalsTable(table)).toThrow(/header/i)
  })

  it("refuses a count that is not a whole number", () => {
    const table = `| slug | theme | kind | measured | elements | fail | borderline | indeterminate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 11st | dark | text | ninety | 183 | 12 | 0 | 12 |`
    expect(() => parseTotalsTable(table)).toThrow(/11st/)
  })

  it("round-trips a table renderTotalsTable wrote", () => {
    const written = renderTotalsTable(
      totalsBySlug(
        dedupeFindings([
          at(375),
          at(375, { path: "z", theme: "dark", verdict: "borderline" }),
          at(768, { path: "q", kind: "non-text", sample: null }),
        ])
      )
    )
    expect(renderTotalsTable(parseTotalsTable(written))).toBe(written)
  })
})

describe("the reported colour pair", () => {
  it("does not split a row when only the pair differs", () => {
    // The pair is displayed but deliberately out of the dedupe key: the ratio
    // already stands in for it. Splitting here would move the counts the
    // recorded baseline pins, for a reason that is not about contrast.
    const got = dedupeFindings([
      at(375, { fg: "#7a7a7a", bg: "#ffffff" }),
      at(1440, { fg: "#7b7b7b", bg: "#fefefe" }),
    ])
    expect(got).toHaveLength(1)
    expect(got[0].widths).toEqual([375, 1440])
  })

  it("keeps the totals unchanged when only the pair differs", () => {
    const got = totalsBySlug(
      dedupeFindings([at(375, { fg: "#7a7a7a" }), at(1440, { fg: "#7b7b7b" })])
    )
    expect(got[0].measured).toBe(1)
  })

  it("renders the pair in the findings table", () => {
    const out = renderFindingsTable(
      dedupeFindings([at(375, { fg: "#7a7a7a", bg: "#ffffff" })])
    )
    expect(out).toContain("#7a7a7a → #ffffff")
  })
})
