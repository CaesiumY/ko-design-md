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

const hasRule = (
  issues: Array<{ severity: string; rule: string }>,
  severity: string,
  rule: string
) => issues.some((i) => i.severity === severity && i.rule === rule)

describe("auditSourceCitations", () => {
  it("blocks a label-only reference that is not an externally-accessible URL", () => {
    const body = makeBody("[src:2][src:3]", [
      "1. Claude Design 핸드오프 번들 (ephemeral; 공개 URL 없음)",
      "2. https://a.example — A 설명",
      "3. https://b.example — B 설명",
    ])
    const issues = auditSourceCitations("demo", body)
    expect(hasRule(issues, "block", "non-public-reference")).toBe(true)
  })

  it("passes when every reference is an external public URL", () => {
    const body = makeBody("[src:1][src:2]", [
      "1. https://a.example — A 설명",
      "2. https://b.example — B 설명",
    ])
    expect(blocks(auditSourceCitations("demo", body))).toEqual([])
  })

  // docs/adr/0004-public-sources-listed-once.md. Frontmatter `sources` used to
  // be the list that could not be empty; References is now the only list, and
  // without this an entry with no sources passes every numbering check.
  it("blocks a body whose References lists no public URL", () => {
    expect(
      hasRule(
        auditSourceCitations("demo", "# Demo\n\n본문.\n"),
        "block",
        "empty-references"
      )
    ).toBe(true)
    const labelOnly = makeBody("", ["1. 핸드오프 번들 (공개 URL 없음)"])
    expect(
      hasRule(
        auditSourceCitations("demo", labelOnly),
        "block",
        "empty-references"
      )
    ).toBe(true)
  })

  it("blocks a dangling citation whose index exceeds the reference count", () => {
    const body = makeBody("[src:1][src:2]", ["1. https://a.example"])
    const issues = auditSourceCitations("demo", body)
    expect(hasRule(issues, "block", "citation-range")).toBe(true)
  })

  it("blocks references that are not numbered contiguously from 1", () => {
    const body = makeBody("[src:1]", [
      "1. https://a.example",
      "3. https://b.example",
    ])
    const issues = auditSourceCitations("demo", body)
    expect(hasRule(issues, "block", "references-numbering")).toBe(true)
  })

  // The handoff link is an https:// URL, so `non-public-reference` passes it.
  // Before References became the only list this was caught in frontmatter
  // `sources`; it has to be caught here now or nothing catches it.
  it("blocks ephemeral handoff / cache / relative / file URLs placed in References", () => {
    for (const bad of [
      "https://api.anthropic.com/v1/design/h/abc123",
      ".claude/cache/design-md/x.md",
      "/logos/x.png",
      "file:///tmp/x",
    ]) {
      const body = makeBody("[src:1][src:2]", [
        "1. https://a.example — A 설명",
        `2. ${bad} — 설명`,
      ])
      const issues = auditSourceCitations("demo", body)
      expect(hasRule(issues, "block", "forbidden-url"), bad).toBe(true)
    }
  })

  // Codex review on #364: parseReferences skips a line without `N.`, so the
  // source disappeared from every check. The old frontmatter comparison caught
  // the count difference; nothing else did once References became the only list.
  it("blocks a URL line in References that lost its number", () => {
    const body = makeBody("[src:1]", [
      "1. https://a.example — A 설명",
      "https://b.example — 번호가 빠진 줄",
    ])
    const issues = auditSourceCitations("demo", body)
    expect(hasRule(issues, "block", "unnumbered-reference")).toBe(true)
  })

  // Codex review round 2 on #364: the scan knew only http(s), so a numberless
  // file:// / cache / site-relative line skipped both checks.
  it("blocks numberless forbidden paths, not only http(s) lines", () => {
    for (const bad of [
      "file:///tmp/x",
      ".claude/cache/design-md/x.md — 캐시",
      "/logos/x.png",
      "- file:///tmp/y",
      "+ file:///tmp/z",
      "> .claude/cache/q.md",
      // Codex review round 4: link syntax put punctuation in front of the path.
      "[logo](/logos/x.png)",
      "<file:///tmp/x>",
      "(/logos/x.png)",
      '"file:///tmp/w"',
    ]) {
      const body = makeBody("[src:1]", ["1. https://a.example — A 설명", bad])
      expect(
        hasRule(
          auditSourceCitations("demo", body),
          "block",
          "unnumbered-reference"
        ),
        bad
      ).toBe(true)
    }
  })

  it("does not flag non-URL text inside References", () => {
    const body = makeBody("[src:1]", [
      "1. https://a.example — A 설명",
      "</content>",
    ])
    const issues = auditSourceCitations("demo", body)
    expect(hasRule(issues, "block", "unnumbered-reference")).toBe(false)
  })

  it("warns about a source that is never cited in the body", () => {
    const body = makeBody("[src:1]", [
      "1. https://a.example",
      "2. https://b.example",
    ])
    const issues = auditSourceCitations("demo", body)
    expect(hasRule(issues, "warn", "unused-source")).toBe(true)
    expect(blocks(issues)).toEqual([])
  })

  it("warns about a duplicate URL within References", () => {
    const body = makeBody("[src:1][src:2]", [
      "1. https://a.example — 첫 설명",
      "2. https://a.example — 둘째 설명",
    ])
    const issues = auditSourceCitations("demo", body)
    expect(hasRule(issues, "warn", "duplicate-source-url")).toBe(true)
  })

  it("ignores screenshot citations like [src:screenshot:home.png] when checking range", () => {
    const body = makeBody("[src:1][src:screenshot:home.png]", [
      "1. https://a.example",
    ])
    const issues = auditSourceCitations("demo", body)
    expect(blocks(issues)).toEqual([])
  })
})
