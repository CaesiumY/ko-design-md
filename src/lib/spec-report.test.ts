import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { lint } from "@google/design.md/linter"
import { SUMMARIZED_RULES, formatSpecReport } from "../../scripts/spec-report"
import type { EntryReport } from "../../scripts/spec-report"

function entry(slug: string, findings: EntryReport["findings"]): EntryReport {
  const count = (s: string) => findings.filter((f) => f.severity === s).length
  return {
    slug,
    errors: count("error"),
    warnings: count("warning"),
    infos: count("info"),
    tokens: { colors: 10, typography: 2, spacing: 1, rounded: 1 },
    findings,
  }
}

const orphan = (name: string) => ({
  severity: "warning",
  rule: "orphaned-tokens",
  path: `colors.${name}`,
  message: `'${name}' is defined but never referenced by any component.`,
})

const pilot = entry("pilot", [
  {
    severity: "warning",
    rule: "contrast-ratio",
    path: "components.pill",
    message: "low contrast",
  },
  orphan("a"),
  orphan("b"),
  orphan("c"),
  { severity: "info", rule: "token-summary", message: "10 colors" },
])

describe("formatSpecReport", () => {
  it("summarizes orphaned-tokens by count instead of listing it", () => {
    const out = formatSpecReport([pilot], { verbose: false })
    expect(out.filter((l) => l.includes("[orphaned-tokens] (colors."))).toEqual(
      []
    )
    expect(out.some((l) => l.includes("[contrast-ratio]"))).toBe(true)
    expect(
      out.filter((l) => /\[orphaned-tokens\] ×3 — not listed/.test(l))
    ).toHaveLength(1)
    // The counts stay whole: the status line and the total still include the
    // three warnings that are no longer listed.
    expect(out.some((l) => /^warn pilot .*\(4 warn\)$/.test(l))).toBe(true)
    expect(out.at(-1)).toMatch(
      /0 error, 4 warning finding\(s\) \(3 orphaned-tokens not listed\)\.$/
    )
  })

  it("lists every orphaned-tokens finding under --verbose", () => {
    const out = formatSpecReport([pilot], { verbose: true })
    expect(
      out.filter((l) => l.includes("[orphaned-tokens] (colors."))
    ).toHaveLength(3)
    expect(out.some((l) => l.includes("not listed"))).toBe(false)
    expect(out.some((l) => l.includes("[token-summary]"))).toBe(true)
  })

  it("adds no summary line to an entry with nothing held back", () => {
    const plain = entry("plain", [
      {
        severity: "warning",
        rule: "missing-primary",
        message: "no primary",
      },
    ])
    const out = formatSpecReport([plain], { verbose: false })
    expect(out.some((l) => l.includes("not listed"))).toBe(false)
    expect(out.at(-1)).toMatch(/0 error, 1 warning finding\(s\)\.$/)
  })

  // The filter keys on the linter's rule names. If the pinned linter renames
  // one, the filter would switch itself off silently; this fails instead. The
  // entry is the components pilot (#384), the one that wakes the rule.
  it("summarizes only rules the pinned linter actually raises", () => {
    const raw = readFileSync(
      join(process.cwd(), "services/teamsparta.md"),
      "utf8"
    )
    const rules = lint(raw).findings.map((f) => f.rule)
    for (const rule of SUMMARIZED_RULES.keys()) expect(rules).toContain(rule)
  })
})
