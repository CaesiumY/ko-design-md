import { describe, expect, it } from "vitest"
import { auditSourceCitations } from "./source-citations"

// Assemble a minimal design.md body: a prose line carrying inline citations,
// then a `## References` block with the given numbered lines.
function makeBody(citations: string, refLines: Array<string>): string {
  return [
    "# Demo — design.md",
    "",
    `본문 한 줄 ${citations}.`,
    "",
    "## References",
    "",
    ...refLines,
    "",
  ].join("\n")
}

const blocks = (issues: Array<{ severity: string }>) =>
  issues.filter((i) => i.severity === "block")

describe("auditSourceCitations", () => {
  it("blocks a label-only reference that is not an externally-accessible URL", () => {
    const sources = ["https://a.example", "https://b.example"]
    const body = makeBody("[src:2][src:3]", [
      "1. Claude Design 핸드오프 번들 (ephemeral; 공개 URL 없음)",
      "2. https://a.example — A 설명",
      "3. https://b.example — B 설명",
    ])
    const issues = auditSourceCitations("demo", sources, body)
    expect(
      issues.some(
        (i) => i.severity === "block" && i.rule === "non-public-reference"
      )
    ).toBe(true)
  })

  it("passes when every reference is an external public URL", () => {
    const sources = ["https://a.example", "https://b.example"]
    const body = makeBody("[src:1][src:2]", [
      "1. https://a.example — A 설명",
      "2. https://b.example — B 설명",
    ])
    expect(blocks(auditSourceCitations("demo", sources, body))).toEqual([])
  })

  it("blocks a dangling citation whose index exceeds the reference count", () => {
    const sources = ["https://a.example"]
    const body = makeBody("[src:1][src:2]", ["1. https://a.example"])
    const issues = auditSourceCitations("demo", sources, body)
    expect(
      issues.some((i) => i.severity === "block" && i.rule === "citation-range")
    ).toBe(true)
  })

  it("blocks references that are not numbered contiguously from 1", () => {
    const sources = ["https://a.example", "https://b.example"]
    const body = makeBody("[src:1]", [
      "1. https://a.example",
      "3. https://b.example",
    ])
    const issues = auditSourceCitations("demo", sources, body)
    expect(
      issues.some(
        (i) => i.severity === "block" && i.rule === "references-numbering"
      )
    ).toBe(true)
  })

  it("blocks when sources order diverges from the public references order", () => {
    const sources = ["https://b.example", "https://a.example"]
    const body = makeBody("[src:1][src:2]", [
      "1. https://a.example",
      "2. https://b.example",
    ])
    const issues = auditSourceCitations("demo", sources, body)
    expect(
      issues.some(
        (i) =>
          i.severity === "block" && i.rule === "sources-references-mismatch"
      )
    ).toBe(true)
  })

  it("blocks when sources contain a URL absent from references (orphan)", () => {
    const sources = ["https://a.example", "https://orphan.example"]
    const body = makeBody("[src:1][src:2]", [
      "1. https://a.example",
      "2. https://b.example",
    ])
    const issues = auditSourceCitations("demo", sources, body)
    expect(
      issues.some(
        (i) =>
          i.severity === "block" && i.rule === "sources-references-mismatch"
      )
    ).toBe(true)
  })

  it("blocks ephemeral handoff / cache / relative / file URLs placed in sources", () => {
    for (const bad of [
      "https://api.anthropic.com/v1/design/h/abc123",
      ".claude/cache/design-md/x.md",
      "/logos/x.png",
      "file:///tmp/x",
    ]) {
      const sources = [bad]
      const body = makeBody("[src:1]", [`1. ${bad}`])
      const issues = auditSourceCitations("demo", sources, body)
      expect(
        issues.some((i) => i.severity === "block" && i.rule === "forbidden-url")
      ).toBe(true)
    }
  })

  it("warns about a source that is never cited in the body", () => {
    const sources = ["https://a.example", "https://b.example"]
    const body = makeBody("[src:1]", [
      "1. https://a.example",
      "2. https://b.example",
    ])
    const issues = auditSourceCitations("demo", sources, body)
    expect(
      issues.some((i) => i.severity === "warn" && i.rule === "unused-source")
    ).toBe(true)
    expect(blocks(issues)).toEqual([])
  })

  it("warns about a duplicate URL within sources", () => {
    const sources = ["https://a.example", "https://a.example"]
    const body = makeBody("[src:1][src:2]", [
      "1. https://a.example",
      "2. https://a.example",
    ])
    const issues = auditSourceCitations("demo", sources, body)
    expect(
      issues.some(
        (i) => i.severity === "warn" && i.rule === "duplicate-source-url"
      )
    ).toBe(true)
  })

  it("ignores screenshot citations like [src:screenshot:home.png] when checking range", () => {
    const sources = ["https://a.example"]
    const body = makeBody("[src:1][src:screenshot:home.png]", [
      "1. https://a.example",
    ])
    const issues = auditSourceCitations("demo", sources, body)
    expect(blocks(issues)).toEqual([])
  })
})
