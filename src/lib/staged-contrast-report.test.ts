import { describe, expect, it } from "vitest"
import {
  MAX_RENDER_ISSUES,
  STAGED_CONTRAST_RULE,
  mergeIntoMachineReport,
  observedRender,
  skippedRender,
} from "./staged-contrast-report"
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

describe("observedRender", () => {
  it("reports only failures, worst ratio first, as warn items", () => {
    const { issues } = observedRender(
      [
        row("fail", 3.9),
        row("borderline", 4.45),
        row("fail", 2.1),
        row("indeterminate", 1.5, { blockers: ["gradient"] }),
        row("pass", 7),
      ],
      SWEPT
    )
    expect(issues.map((i) => i.severity)).toEqual(["warn", "warn"])
    expect(issues.map((i) => i.rule)).toEqual([
      STAGED_CONTRAST_RULE,
      STAGED_CONTRAST_RULE,
    ])
    expect(issues[0].fix).toContain("2.10:1")
    expect(issues[1].fix).toContain("3.90:1")
  })

  it("names the element, the sample, the measured and required ratio and the colour pair", () => {
    const [issue] = observedRender(
      [row("fail", 2.1, { theme: "dark", state: "hover", widths: [976] })],
      SWEPT
    ).issues
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
    const { issues } = observedRender([...edges, row("fail", 4.1)], SWEPT)
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
    const { issues } = observedRender([...light, dark], SWEPT)
    expect(issues).toHaveLength(MAX_RENDER_ISSUES)
    expect(issues[0].section).toContain("dark")
    expect(issues[0].fix).toContain("4.20:1")
  })

  it("caps the items it hands on and counts the rest as omitted", () => {
    const many = Array.from({ length: MAX_RENDER_ISSUES + 7 }, (_, i) =>
      row("fail", 1 + i / 100)
    )
    const { render, issues } = observedRender(many, SWEPT)
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
    })
  })
})

describe("skipped and observed reports", () => {
  it("differ in shape, not just in a value — a skip can never read as a clean run", () => {
    const clean = observedRender([], SWEPT)
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
      observedRender([row("fail", 2.1)], SWEPT),
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
      observedRender([row("fail", 2.1), row("fail", 3)], SWEPT),
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
      observedRender([row("fail", 2.1), row("fail", 3)], SWEPT),
      { iteration: 2 }
    )
    const twice = mergeIntoMachineReport(
      once,
      observedRender([row("fail", 2.5)], SWEPT),
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
      observedRender([row("fail", 2.1)], SWEPT),
      { iteration: 1 }
    )
    expect(report.machine).toBe(true)
    expect(report.tool).toBe("observe-staged-contrast")
    expect(report.iteration).toBe(1)
    expect(report.verdict).toMatch(/^0 block \/ 1 warn — /)
    expect(report.issues).toHaveLength(1)
  })
})
