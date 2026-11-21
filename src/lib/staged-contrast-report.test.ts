import { describe, expect, it } from "vitest"
import { MIN_TEXT_ELEMENTS, THIN_PREVIEW_ADVICE } from "./contrast-baseline"
import {
  MAX_RENDER_ISSUES,
  STAGED_CONTRAST_RULE,
  STAGED_THIN_RULE,
  mergeIntoMachineReport,
  observedRender,
  skippedRender,
} from "./staged-contrast-report"
import { totalsBySlug } from "./contrast-report"
import type { DedupedFinding, Judgement } from "./contrast-report"
import type { MachineReport } from "./staged-contrast-report"

const SWEPT = {
  widths: [375, 768, 976, 1440],
  themes: ["light", "dark"] as Array<"light" | "dark">,
  states: ["default", "hover"] as Array<"default" | "hover">,
}

function row(
  verdict: Judgement,
  ratio: number,
  extra: Partial<DedupedFinding> = {}
): DedupedFinding {
  return {
    slug: "staged",
    theme: "light",
    state: "default",
    kind: "text",
    path: `div.card > p.meta-${ratio}`,
    sample: "가입하기",
    ratio,
    threshold: 4.5,
    verdict,
    blockers: [],
    opacityApprox: false,
    fg: "#8a8a8a",
    bg: "#ffffff",
    widths: [375, 976],
    occurrences: 1,
    ...extra,
  }
}

// What `scripts/validate-preview.ts` writes at 9a2, trimmed to the keys 9a3
// must leave alone.
function stage9a2Report(): MachineReport {
  return {
    machine: true,
    tool: "validate-preview",
    schema: 1,
    iteration: 2,
    passed: true,
    metrics: {
      light: { matched: 3, total: 4 },
      dark: { matched: 2, total: 4 },
    },
    issues: [
      {
        severity: "warn",
        rule: "iframe-js-defer",
        section: "preview.html",
        fix: "add defer",
      },
    ],
    verdict: "0 block / 1 warn — deterministic preview checks passed",
  }
}

// Text rows standing for `elements` elements in one theme, split so a count of
// rows and a count of elements disagree.
function textIn(
  theme: "light" | "dark",
  elements: number
): Array<DedupedFinding> {
  const half = Math.floor(elements / 2)
  return [
    row("pass", 8, { theme, path: `p.a-${theme}`, occurrences: half }),
    row("pass", 9, {
      theme,
      path: `p.b-${theme}`,
      occurrences: elements - half,
    }),
  ]
}

// Passing text at exactly the floor in both themes, which clears it, for the
// tests about contrast items: without it every one of their small inputs is
// also a thin preview, and the thin item would sit in the lists they compare.
const AT_FLOOR = [
  ...textIn("light", MIN_TEXT_ELEMENTS),
  ...textIn("dark", MIN_TEXT_ELEMENTS),
]

const observeAtFloor = (
  rows: Array<DedupedFinding>
): ReturnType<typeof observedRender> =>
  observedRender([...rows, ...AT_FLOOR], SWEPT)

describe("observedRender", () => {
  it("reports only failures, worst ratio first, as warn items", () => {
    const { issues } = observeAtFloor([
      row("fail", 3.9),
      row("borderline", 4.45),
      row("fail", 2.1),
      row("indeterminate", 1.5, { blockers: ["gradient"] }),
      row("pass", 7),
    ])
    expect(issues.map((i) => i.severity)).toEqual(["warn", "warn"])
    expect(issues.map((i) => i.rule)).toEqual([
      STAGED_CONTRAST_RULE,
      STAGED_CONTRAST_RULE,
    ])
    expect(issues[0].fix).toContain("2.10:1")
    expect(issues[1].fix).toContain("3.90:1")
  })

  it("names the element, the sample, the measured and required ratio and the colour pair", () => {
    const [issue] = observeAtFloor([
      row("fail", 2.1, { theme: "dark", state: "hover", widths: [976] }),
    ]).issues
    expect(issue.section).toContain("dark")
    expect(issue.section).toContain("hover")
    expect(issue.section).toContain("976")
    for (const part of [
      "div.card > p.meta-2.1",
      "가입하기",
      "2.10:1",
      "4.5:1",
      "#8a8a8a",
      "#ffffff",
    ]) {
      expect(issue.fix).toContain(part)
    }
  })

  it("hands on text shortfalls before non-text ones, however low the non-text ratio", () => {
    // Measured on the samsung fixture: ranking by ratio alone filled all twenty
    // slots with 1.2:1 decorative edges and dropped every text shortfall —
    // the criterion the reviewer can judge with least doubt (ADR 0007's
    // false-positive list is mostly non-text parts).
    const edges = Array.from({ length: MAX_RENDER_ISSUES }, (_, i) =>
      row("fail", 1.1 + i / 100, {
        kind: "non-text",
        sample: null,
        threshold: 3,
        basis: "border",
      })
    )
    const { issues } = observeAtFloor([...edges, row("fail", 4.1)])
    expect(issues).toHaveLength(MAX_RENDER_ISSUES)
    expect(issues[0].fix).toContain("4.10:1")
    expect(issues[0].fix).toContain('text "가입하기"')
  })

  it("hands on dark-theme text shortfalls first, even when light ones fill the cap", () => {
    // Dark text is the only shortfall the rubric's Item 5 scores, and the
    // reviewer sees only the items handed on. Ranking light before dark by
    // ratio would leave the scored rows in `omitted` exactly when the cap fills.
    const light = Array.from({ length: MAX_RENDER_ISSUES }, (_, i) =>
      row("fail", 1.5 + i / 100)
    )
    const dark = row("fail", 4.2, { theme: "dark" })
    const { issues } = observeAtFloor([...light, dark])
    expect(issues).toHaveLength(MAX_RENDER_ISSUES)
    expect(issues[0].section).toContain("dark")
    expect(issues[0].fix).toContain("4.20:1")
  })

  it("caps the items it hands on and counts the rest as omitted", () => {
    const many = Array.from({ length: MAX_RENDER_ISSUES + 7 }, (_, i) =>
      row("fail", 1 + i / 100)
    )
    const { render, issues } = observeAtFloor(many)
    expect(issues).toHaveLength(MAX_RENDER_ISSUES)
    expect(issues[0].fix).toContain("1.00:1")
    expect(render.observed.fail).toBe(MAX_RENDER_ISSUES + 7)
    expect(render.observed.reported).toBe(MAX_RENDER_ISSUES)
    expect(render.observed.omitted).toBe(7)
  })

  it("counts what it measured, including the verdicts it does not report", () => {
    const { render } = observedRender(
      [
        row("fail", 2),
        row("borderline", 4.45),
        row("indeterminate", 1, { blockers: ["overlay"] }),
        row("pass", 9),
      ],
      SWEPT
    )
    expect(render.observed).toEqual({
      ...SWEPT,
      measured: 4,
      fail: 1,
      borderline: 1,
      held: 1,
      reported: 1,
      omitted: 0,
      omittedDarkText: 0,
      // Four light text rows of one element each; nothing in dark.
      textElements: { light: 4, dark: 0 },
    })
  })

  it("counts the dark-theme text rows pushed past the cap on their own", () => {
    // Dark text is what the rubric scores, and the reviewer cannot tell from
    // a bare `omitted` whether any of it is missing from the list.
    const dark = Array.from({ length: MAX_RENDER_ISSUES + 3 }, (_, i) =>
      row("fail", 1 + i / 100, { theme: "dark" })
    )
    const light = [row("fail", 2), row("fail", 2.5)]
    const { render } = observeAtFloor([...dark, ...light])
    expect(render.observed.omitted).toBe(5)
    expect(render.observed.omittedDarkText).toBe(3)
  })
})

describe("skipped and observed reports", () => {
  it("differ in shape, not just in a value — a skip can never read as a clean run", () => {
    const clean = observeAtFloor([])
    const skipped = skippedRender(
      "browserType.launch: Executable doesn't exist"
    )

    expect("observed" in clean.render).toBe(true)
    expect("skipped" in clean.render).toBe(false)
    expect("skipped" in skipped.render).toBe(true)
    expect("observed" in skipped.render).toBe(false)
    expect(Object.keys(clean.render)).not.toEqual(Object.keys(skipped.render))

    // Both hand on zero items, which is exactly why the count cannot be what
    // tells them apart.
    expect(clean.issues).toEqual([])
    expect(skipped.issues).toEqual([])
  })

  it("keeps the reason a run was skipped", () => {
    const { render } = skippedRender("no browser")
    expect(render).toEqual({ skipped: { reason: "no browser" } })
  })
})

describe("mergeIntoMachineReport", () => {
  it("adds the render block and items to the 9a2 report and leaves its own keys alone", () => {
    const before = stage9a2Report()
    const merged = mergeIntoMachineReport(
      before,
      observeAtFloor([row("fail", 2.1)]),
      { iteration: 2 }
    )
    const own = ["machine", "tool", "schema", "passed", "metrics"] as const
    for (const key of own) {
      expect(merged[key], key).toEqual(before[key])
    }
    expect(merged.issues.map((i) => i.rule)).toEqual([
      "iframe-js-defer",
      STAGED_CONTRAST_RULE,
    ])
    expect(merged.render).toHaveProperty("observed")
  })

  it("recounts the verdict from the merged items", () => {
    const merged = mergeIntoMachineReport(
      stage9a2Report(),
      observeAtFloor([row("fail", 2.1), row("fail", 3)]),
      { iteration: 2 }
    )
    expect(merged.verdict).toMatch(/^0 block \/ 3 warn — /)
    expect(merged.verdict).toContain("deterministic preview checks passed")
  })

  it("says in the verdict when the render was not observed", () => {
    const merged = mergeIntoMachineReport(
      stage9a2Report(),
      skippedRender("no browser"),
      { iteration: 2 }
    )
    expect(merged.verdict).toMatch(/^0 block \/ 1 warn — /)
    expect(merged.verdict).toContain("skipped")
    expect(merged.verdict).toContain("no browser")
    expect(merged.issues).toEqual(stage9a2Report().issues)
  })

  it("replaces an earlier 9a3 result instead of stacking a second one", () => {
    const once = mergeIntoMachineReport(
      stage9a2Report(),
      observeAtFloor([row("fail", 2.1), row("fail", 3)]),
      { iteration: 2 }
    )
    const twice = mergeIntoMachineReport(
      once,
      observeAtFloor([row("fail", 2.5)]),
      { iteration: 2 }
    )
    const rules = twice.issues.map((i) => i.rule)
    expect(rules).toEqual(["iframe-js-defer", STAGED_CONTRAST_RULE])
    expect(twice.verdict).toMatch(/^0 block \/ 2 warn — /)
    expect(twice.verdict.match(/render contrast/g)).toHaveLength(1)

    const skippedAfter = mergeIntoMachineReport(once, skippedRender("x"), {
      iteration: 2,
    })
    expect(skippedAfter.render).toEqual({ skipped: { reason: "x" } })
    expect(skippedAfter.issues).toEqual(stage9a2Report().issues)
  })

  it("starts its own report when there is no 9a2 report to join", () => {
    const report = mergeIntoMachineReport(
      null,
      observeAtFloor([row("fail", 2.1)]),
      { iteration: 1 }
    )
    expect(report.machine).toBe(true)
    expect(report.tool).toBe("observe-staged-contrast")
    expect(report.iteration).toBe(1)
    expect(report.verdict).toMatch(/^0 block \/ 1 warn — /)
    expect(report.issues).toHaveLength(1)
  })
})

describe("observedRender — a form control's text says where it came from", () => {
  it("names a placeholder as one, so the author edits ::placeholder", () => {
    // The colour an author must change for a placeholder is `::placeholder`'s,
    // not the field's `color`; an issue that called it plain text sends them
    // looking for a text node "이메일" that does not exist.
    const { issues } = observeAtFloor([
      row("fail", 1.91, { sample: "이메일", source: "placeholder" }),
    ])
    expect(issues[0].fix).toContain('placeholder "이메일"')
    expect(issues[0].fix).toContain("::placeholder")
  })

  it("leaves an ordinary text node's wording as it was", () => {
    const { issues } = observeAtFloor([row("fail", 4.1)])
    expect(issues[0].fix).toContain('text "가입하기"')
  })
})

describe("observedRender — a preview under the text-element floor", () => {
  it("warns once, ahead of the contrast items, naming the thin theme and how far short it is", () => {
    const { issues } = observedRender(
      [
        ...textIn("light", MIN_TEXT_ELEMENTS - 10),
        ...textIn("dark", MIN_TEXT_ELEMENTS + 5),
        row("fail", 2.1, { theme: "dark", path: "p.low" }),
      ],
      SWEPT
    )
    expect(issues.map((i) => i.rule)).toEqual([
      STAGED_THIN_RULE,
      STAGED_CONTRAST_RULE,
    ])
    const [thin] = issues
    expect(thin.severity).toBe("warn")
    expect(thin.fix).toContain(`light shows ${MIN_TEXT_ELEMENTS - 10}`)
    expect(thin.fix).toContain("10 short")
    expect(thin.fix).not.toContain("dark shows")
    // The advice is the CI gate's own lines, not a second wording of them.
    for (const line of THIN_PREVIEW_ADVICE) expect(thin.fix).toContain(line)
  })

  it("puts every theme under the floor into the one item", () => {
    const { issues } = observedRender(
      [...textIn("light", 79), ...textIn("dark", 51)],
      SWEPT
    )
    const thin = issues.filter((i) => i.rule === STAGED_THIN_RULE)
    expect(thin).toHaveLength(1)
    expect(thin[0].fix).toContain("light shows 79 (1 short)")
    expect(thin[0].fix).toContain("dark shows 51 (29 short)")
  })

  it("says nothing at exactly the floor", () => {
    const { issues } = observedRender(
      [
        ...textIn("light", MIN_TEXT_ELEMENTS),
        ...textIn("dark", MIN_TEXT_ELEMENTS),
      ],
      SWEPT
    )
    expect(issues).toEqual([])
  })

  it("counts text only — non-text surfaces neither raise nor lower it", () => {
    const edges = (theme: "light" | "dark", occurrences: number) =>
      row("fail", 1.2, {
        theme,
        kind: "non-text",
        sample: null,
        threshold: 3,
        basis: "border",
        path: `div.edge-${theme}`,
        occurrences,
      })
    // At the floor with a non-text surface in each theme: non-text rows are
    // not text elements, so they leave the count where it is.
    const atFloor = observedRender(
      [
        ...textIn("light", MIN_TEXT_ELEMENTS),
        ...textIn("dark", MIN_TEXT_ELEMENTS),
        edges("light", 1),
        edges("dark", 1),
      ],
      SWEPT
    )
    expect(atFloor.render.observed.textElements).toEqual({
      light: MIN_TEXT_ELEMENTS,
      dark: MIN_TEXT_ELEMENTS,
    })
    expect(atFloor.issues.some((i) => i.rule === STAGED_THIN_RULE)).toBe(false)
    const thinButBusy = observedRender(
      [...textIn("light", 40), ...textIn("dark", 40), edges("light", 500)],
      SWEPT
    )
    expect(thinButBusy.render.observed.textElements).toEqual({
      light: 40,
      dark: 40,
    })
    expect(thinButBusy.issues[0].rule).toBe(STAGED_THIN_RULE)
  })

  it("warns when no text was measured at all", () => {
    // A collector that reached nothing is the thinnest preview there is, and
    // a report with no item would read as a clean one.
    const { render, issues } = observedRender([], SWEPT)
    expect(render.observed.textElements).toEqual({ light: 0, dark: 0 })
    expect(issues.map((i) => i.rule)).toEqual([STAGED_THIN_RULE])
    expect(issues[0].fix).toContain("light shows 0")
    expect(issues[0].fix).toContain("dark shows 0")
  })

  it("counts the elements CI counts: every copy, hover rows included, per theme", () => {
    // By hand: light text rows stand for 30 + 25 (default) + 12 (hover) = 67
    // elements in 3 rows; dark has 81 in 2; the non-text row is not text.
    const deduped = [
      row("pass", 8, { path: "p.a", occurrences: 30 }),
      row("fail", 3, { path: "p.b", occurrences: 25 }),
      row("pass", 7, { path: "a.link", state: "hover", occurrences: 12 }),
      row("pass", 8, { theme: "dark", path: "p.a", occurrences: 60 }),
      row("pass", 6, { theme: "dark", path: "p.c", occurrences: 21 }),
      row("fail", 1.5, {
        kind: "non-text",
        sample: null,
        threshold: 3,
        basis: "border",
        occurrences: 40,
      }),
    ]
    const { render, issues } = observedRender(deduped, SWEPT)
    expect(render.observed.textElements).toEqual({ light: 67, dark: 81 })
    // The same rows through the CI gate's totals give the same numbers.
    const ci = totalsBySlug(deduped)
    for (const theme of ["light", "dark"] as const) {
      const elements = ci.find(
        (t) => t.theme === theme && t.kind === "text"
      )?.elements
      expect(elements, theme).toBe(render.observed.textElements[theme])
    }
    expect(issues[0].rule).toBe(STAGED_THIN_RULE)
    expect(issues[0].fix).toContain("light shows 67 (13 short)")
    expect(issues[0].fix).not.toContain("dark shows")
  })

  it("stays first and outside the cap when the shortfalls overflow it", () => {
    const many = Array.from({ length: MAX_RENDER_ISSUES + 5 }, (_, i) =>
      row("fail", 1 + i / 100, { path: `p.m-${i}` })
    )
    const { render, issues } = observedRender(many, SWEPT)
    expect(issues[0].rule).toBe(STAGED_THIN_RULE)
    expect(issues.filter((i) => i.rule === STAGED_CONTRAST_RULE)).toHaveLength(
      MAX_RENDER_ISSUES
    )
    expect(render.observed.reported).toBe(MAX_RENDER_ISSUES)
    expect(render.observed.omitted).toBe(5)
  })

  it("is not read as a contrast shortfall", () => {
    // Before the rubric learns this item, it reads `contrast —` sections under
    // `render.observed` as its legibility input.
    const [thin] = observedRender([], SWEPT).issues
    expect(thin.section.startsWith("contrast")).toBe(false)
  })
})

describe("mergeIntoMachineReport — the thin-preview item", () => {
  const thinRun = () =>
    observedRender(
      [...textIn("light", 50), ...textIn("dark", 50), row("fail", 2.1)],
      SWEPT
    )

  it("keeps 9a2's items first, then the thin item, then the contrast items, and counts it in the verdict", () => {
    const merged = mergeIntoMachineReport(stage9a2Report(), thinRun(), {
      iteration: 2,
    })
    expect(merged.issues.map((i) => i.rule)).toEqual([
      "iframe-js-defer",
      STAGED_THIN_RULE,
      STAGED_CONTRAST_RULE,
    ])
    expect(merged.verdict).toMatch(/^0 block \/ 3 warn — /)
  })

  it("drops an earlier thin item when the rerun clears the floor or is skipped", () => {
    const once = mergeIntoMachineReport(stage9a2Report(), thinRun(), {
      iteration: 2,
    })
    const padded = mergeIntoMachineReport(
      once,
      observedRender(AT_FLOOR, SWEPT),
      {
        iteration: 2,
      }
    )
    expect(padded.issues.map((i) => i.rule)).toEqual(["iframe-js-defer"])
    expect(padded.verdict).toMatch(/^0 block \/ 1 warn — /)

    const skipped = mergeIntoMachineReport(once, skippedRender("x"), {
      iteration: 2,
    })
    expect(skipped.issues).toEqual(stage9a2Report().issues)
    expect(skipped.render).toEqual({ skipped: { reason: "x" } })
  })
})
