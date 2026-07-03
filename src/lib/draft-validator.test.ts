import { describe, expect, it } from "vitest"
import { REQUIRED_SECTIONS, validateDraft } from "./draft-validator"
import type { DraftValidationOptions } from "./draft-validator"

// ── fixture ──────────────────────────────────────────────────────────────────
// A minimal draft that satisfies every block rule: full frontmatter, all 10
// Stitch sections in order, sources ↔ References aligned, citations in range,
// OKLCH-only yaml token values.

const SOURCES = [
  "https://example.com/design-system",
  "https://example.com/blog/colors",
]

interface FixtureOverrides {
  frontmatter?: string
  colorsYaml?: string
  body?: (sections: string) => string
  dropSection?: string
  duplicateSection?: string
  swapSections?: [string, string]
}

function makeDraft(overrides: FixtureOverrides = {}): string {
  const frontmatter =
    overrides.frontmatter ??
    [
      "---",
      "name: 데모",
      "slug: demo",
      "category: finance",
      'last_updated: "2026-07-03"',
      "sources:",
      ...SOURCES.map((u) => `  - ${u}`),
      "related_services: []",
      "lang: ko",
      "logo: https://getdesign.kr/logos/demo.png",
      "---",
    ].join("\n")

  const colorsYaml =
    overrides.colorsYaml ??
    [
      "```yaml",
      "primary: oklch(0.62 0.18 250)   # #3182F6 — 원본 대조값",
      "surface: oklch(0.98 0.005 250)",
      "```",
    ].join("\n")

  const sectionBody: Record<string, string> = {
    "Brand & Style": "브랜드는 절제된 톤을 쓴다 [src:1]. 두 번째 문장이다.",
    Colors: `팔레트는 OKLCH로 관리한다 [src:2]. 두 번째 문장이다.\n\n${colorsYaml}`,
    Typography: "본문은 Pretendard Variable을 쓴다 [src:1]. 두 번째 문장이다.",
    Spacing: "4px 그리드를 따른다 [src:1]. 두 번째 문장이다.",
    Rounded: "카드 radius는 16px다 [src:1]. 두 번째 문장이다.",
    "Elevation & Depth": "그림자는 1단계만 쓴다 [src:1]. 두 번째 문장이다.",
    Shapes: "기하학적 형태를 유지한다 [src:1]. 두 번째 문장이다.",
    Components: "주요 컴포넌트는 버튼이다 [src:2]. 두 번째 문장이다.",
    "Do's and Don'ts": "- Do: 절제된 색 사용 [src:1]\n- Don't: 임의 색 추가",
    References: SOURCES.map((u, i) => `${i + 1}. ${u} — 설명`).join("\n"),
  }

  let names: Array<string> = [...REQUIRED_SECTIONS]
  if (overrides.dropSection) {
    names = names.filter((n) => n !== overrides.dropSection)
  }
  if (overrides.swapSections) {
    const [a, b] = overrides.swapSections
    const ia = names.indexOf(a)
    const ib = names.indexOf(b)
    ;[names[ia], names[ib]] = [names[ib], names[ia]]
  }
  if (overrides.duplicateSection) {
    names.push(overrides.duplicateSection)
  }

  const sections = names
    .map((n) => `## ${n}\n\n${sectionBody[n] ?? "채움 문장이다."}`)
    .join("\n\n")

  const body = overrides.body ? overrides.body(sections) : sections
  return `${frontmatter}\n\n# 데모 — design.md\n\n> 데모 태그라인이다.\n\n${body}\n`
}

const OPTS: DraftValidationOptions = {
  filePath: "/services/demo.md",
  expectedSlug: "demo",
  expectedLogoUrl: "https://getdesign.kr/logos/demo.png",
  expectedLang: "ko",
}

function rulesOf(
  raw: string,
  opts: DraftValidationOptions = OPTS,
  severity?: "block" | "warn"
): Array<string> {
  return validateDraft(raw, opts)
    .issues.filter((i) => !severity || i.severity === severity)
    .map((i) => i.rule)
}

// ── happy path ───────────────────────────────────────────────────────────────

describe("validateDraft — valid draft", () => {
  it("passes a fully valid draft with zero block issues", () => {
    const result = validateDraft(makeDraft(), OPTS)
    expect(result.issues.filter((i) => i.severity === "block")).toEqual([])
    expect(result.passed).toBe(true)
  })

  it("allows non-standard extra sections between standard ones (ordered subsequence)", () => {
    const raw = makeDraft({
      body: (sections) =>
        sections.replace(
          "## Components",
          "## Patterns — 페이지 UI 킷\n\n비표준 섹션이다 [src:1].\n\n## Components"
        ),
    })
    expect(rulesOf(raw, OPTS, "block")).toEqual([])
  })

  it("exempts trailing `# hex` comments after an OKLCH token value", () => {
    // krds convention: `gray-5: oklch(0.985 0 0)  # #FAFAFA`
    const raw = makeDraft({
      colorsYaml: [
        "```yaml",
        "gray-5: oklch(0.985 0 0)          # #FAFAFA",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "block")).toEqual([])
  })

  it("does not warn for prose hex when the same line carries an oklch conversion", () => {
    const raw = makeDraft({
      body: (sections) =>
        `${sections}\n\n공식 그린 #00C01E (≈ oklch(0.7 0.2 150))를 대조값으로 둔다 [src:1].`,
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("hex-in-prose")
  })
})

// ── frontmatter block rules ──────────────────────────────────────────────────

describe("validateDraft — frontmatter", () => {
  it("blocks a malformed frontmatter fence", () => {
    const raw = makeDraft().replace(/\n---\n/, "\n") // drop closing fence
    expect(rulesOf(raw, OPTS, "block")).toContain("frontmatter-parse")
  })

  it("blocks an off-enum category", () => {
    const raw = makeDraft().replace("category: finance", "category: fintech")
    expect(rulesOf(raw, OPTS, "block")).toContain("bad-category")
  })

  it("blocks an empty sources array", () => {
    const raw = makeDraft({
      frontmatter: [
        "---",
        "name: 데모",
        "slug: demo",
        "category: finance",
        'last_updated: "2026-07-03"',
        "sources: []",
        "related_services: []",
        "lang: ko",
        "---",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "block")).toContain("empty-sources")
  })

  it("blocks a missing last_updated", () => {
    const raw = makeDraft().replace('last_updated: "2026-07-03"\n', "")
    expect(rulesOf(raw, OPTS, "block")).toContain("missing-last-updated")
  })

  it("blocks a slug that differs from the expected slug", () => {
    const raw = makeDraft().replace("slug: demo", "slug: other")
    expect(rulesOf(raw, OPTS, "block")).toContain("slug-arg-mismatch")
  })

  it("blocks a lang that differs from the expected lang", () => {
    const raw = makeDraft().replace("lang: ko", "lang: en")
    expect(rulesOf(raw, OPTS, "block")).toContain("lang-arg-mismatch")
  })

  it("blocks when the expected logo URL is missing or downgraded", () => {
    const raw = makeDraft().replace(
      "logo: https://getdesign.kr/logos/demo.png",
      "logo: /logos/demo.png"
    )
    expect(rulesOf(raw, OPTS, "block")).toContain("expected-logo-mismatch")
  })

  it("blocks a malformed logo URL even without an expected logo", () => {
    const raw = makeDraft().replace(
      "logo: https://getdesign.kr/logos/demo.png",
      "logo: https://example.com/logo.jpg"
    )
    const opts = { ...OPTS, expectedLogoUrl: undefined }
    expect(rulesOf(raw, opts, "block")).toContain("logo-url-form")
  })

  it("warns on unknown frontmatter keys", () => {
    const raw = makeDraft().replace("lang: ko", "lang: ko\nlast-updated: typo")
    expect(rulesOf(raw, OPTS, "warn")).toContain("unknown-frontmatter-key")
  })
})

// ── section structure rules ──────────────────────────────────────────────────

describe("validateDraft — sections", () => {
  it("blocks a missing standard section", () => {
    const raw = makeDraft({ dropSection: "Shapes" })
    expect(rulesOf(raw, OPTS, "block")).toContain("missing-section")
  })

  it("blocks standard sections out of order", () => {
    const raw = makeDraft({ swapSections: ["Colors", "Typography"] })
    expect(rulesOf(raw, OPTS, "block")).toContain("section-order")
  })

  it("blocks a duplicated standard section", () => {
    const raw = makeDraft({ duplicateSection: "Colors" })
    expect(rulesOf(raw, OPTS, "block")).toContain("duplicate-section")
  })
})

// ── token value rules ────────────────────────────────────────────────────────

describe("validateDraft — token values", () => {
  it("blocks a hex token value inside a yaml fence", () => {
    const raw = makeDraft({
      colorsYaml: ["```yaml", "primary: #3182F6", "```"].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "block")).toContain("non-oklch-token-value")
  })

  it("blocks an rgba token value inside a yaml fence", () => {
    const raw = makeDraft({
      colorsYaml: ["```yaml", "overlay: rgba(0, 0, 0, 0.4)", "```"].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "block")).toContain("non-oklch-token-value")
  })

  it("warns on a prose hex with no oklch on the same line", () => {
    const raw = makeDraft({
      body: (sections) => `${sections}\n\n버튼 색은 #FF8800로 보인다 [src:1].`,
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("hex-in-prose")
  })
})

// ── citation integrity (delegated to auditSourceCitations) ───────────────────

describe("validateDraft — citations", () => {
  it("blocks a citation outside the References range", () => {
    const raw = makeDraft({
      body: (sections) => `${sections}\n\n근거 없는 주장 [src:9].`,
    })
    expect(rulesOf(raw, OPTS, "block")).toContain("citation-range")
  })

  it("blocks when frontmatter sources and References diverge", () => {
    const raw = makeDraft().replace(
      `  - ${SOURCES[1]}\n`,
      "" // drop one source from frontmatter only
    )
    expect(rulesOf(raw, OPTS, "block")).toContain("sources-references-mismatch")
  })
})
