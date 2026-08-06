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
      'created_at: "2026-07-03"',
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
      // #3182F6 decodes to oklch(0.620 0.191 258); this must stay inside the
      // rule's ΔE bound or the shared fixture itself trips oklch-hex-mismatch.
      "primary: oklch(0.62 0.19 258)   # #3182F6 — 원본 대조값",
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

  it("blocks a missing created_at — it is the catalog's sort key, not decoration", () => {
    const raw = makeDraft().replace('created_at: "2026-07-03"\n', "")
    expect(rulesOf(raw, OPTS, "block")).toContain("missing-created-at")
  })

  it("warns when created_at is after last_updated — an entry cannot be added after it was last synced", () => {
    const raw = makeDraft().replace(
      'created_at: "2026-07-03"',
      'created_at: "2026-07-04"'
    )
    expect(rulesOf(raw, OPTS, "warn")).toContain(
      "created-at-after-last-updated"
    )
  })

  it("accepts created_at equal to last_updated — the normal shape for a brand-new entry", () => {
    expect(rulesOf(makeDraft(), OPTS, "warn")).not.toContain(
      "created-at-after-last-updated"
    )
  })

  it("does not warn on the ordering when either date is absent", () => {
    const raw = makeDraft().replace('created_at: "2026-07-03"\n', "")
    expect(rulesOf(raw, OPTS, "warn")).not.toContain(
      "created-at-after-last-updated"
    )
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

  it("warns when a token name is declared twice with different values", () => {
    // The shape `services/wanted.md` uses for its per-theme aliases. Nothing
    // downstream can resolve it, so `audit:oklch` stops comparing the token.
    const raw = makeDraft({
      colorsYaml: [
        "```yaml",
        "bg-canvas: oklch(1 0 0)",
        "bg-canvas: oklch(0.148 0.004 277)",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("duplicate-token-value")
  })

  it("stays silent when the same name restates the SAME value", () => {
    // Repetition is not ambiguity — the value is still checkable, and warning
    // here would put a permanent warn on a file that has nothing to fix.
    // Compared after normalisation, so trailing zeros are not a disagreement.
    const raw = makeDraft({
      colorsYaml: [
        "```yaml",
        "bg-canvas: oklch(1 0 0)",
        "bg-canvas: oklch(1.000 0 0)",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("duplicate-token-value")
  })

  it("does not pair two different token names", () => {
    const raw = makeDraft({
      colorsYaml: [
        "```yaml",
        "bg-canvas: oklch(1 0 0)",
        "bg-surface: oklch(0.148 0.004 277)",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("duplicate-token-value")
  })

  it("warns when a token's OKLCH does not match the hex annotated beside it", () => {
    // The hex comment is the provenance record; if the OKLCH beside it decodes to
    // a different colour, a downstream consumer copying the token renders the
    // WRONG brand colour. Format-only checks can't catch this — every entry's
    // OKLCH was hand-computed, and an audit found a systematic lightness bias.
    // #3182F6 is oklch(0.624 0.176 254); 0.42 lightness is far off.
    const raw = makeDraft({
      colorsYaml: [
        "```yaml",
        "primary: oklch(0.42 0.18 254)   # #3182F6",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("oklch-hex-mismatch")
  })

  it("accepts an OKLCH that matches its hex within authoring rounding slack", () => {
    // Authors round to 2–3 decimals, so the check must tolerate that much drift
    // without flagging correct conversions. #3182F6 is oklch(0.620 0.191 258);
    // the 2-decimal form stays inside the ΔE bound.
    const raw = makeDraft({
      colorsYaml: [
        "```yaml",
        "primary: oklch(0.620 0.191 258)   # #3182F6",
        "rounded: oklch(0.62 0.19 258)     # #3182F6 — 2-decimal rounding",
        "white: oklch(1 0 0)               # #FFFFFF",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("oklch-hex-mismatch")
  })

  it("leaves markdown-table palettes alone — column roles are not positional", () => {
    // Table layouts differ per entry (class101: name|oklch|hex; codeit:
    // light-hex|light-oklch|dark-hex|dark-oklch), so positional matching would
    // pair an OKLCH with the wrong theme's hex. Until the header row is parsed to
    // resolve column roles, tables stay out of scope rather than noisily wrong.
    const codeitStyle = makeDraft({
      body: (sections) =>
        `${sections}\n\n| Token | Light | Light OKLCH | Dark | Dark OKLCH |\n| --- | --- | --- | --- | --- |\n| \`diff-remove-bg\` | \`#FFC9C7\` | \`oklch(0.883 0.062 21)\` | \`#650205\` | \`oklch(0.320 0.129 28)\` |\n`,
    })
    expect(rulesOf(codeitStyle, OPTS, "warn")).not.toContain(
      "oklch-hex-mismatch"
    )
  })

  it("compares alpha when both the OKLCH and an 8-digit hex declare it", () => {
    // class101 writes `oklch(0 0 0 / 3%)  # #00000008`. A token that agrees on
    // hue but not opacity still renders wrong, so alpha is part of the match.
    const wrongAlpha = makeDraft({
      colorsYaml: [
        "```yaml",
        "surface1: oklch(0 0 0 / 30%)   # #00000008",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(wrongAlpha, OPTS, "warn")).toContain("oklch-hex-mismatch")

    const rightAlpha = makeDraft({
      colorsYaml: [
        "```yaml",
        "surface1: oklch(0 0 0 / 3%)    # #00000008",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(rightAlpha, OPTS, "warn")).not.toContain(
      "oklch-hex-mismatch"
    )
  })

  it("scales with chroma: catches a small hue error on a saturated colour", () => {
    // The reason this rule measures ΔE instead of per-component bounds. Both
    // rows below sit inside the OLD tolerance (ΔH ≤ 5°), but on a saturated
    // colour a 4° error moves the rendered pixel ~37/255 — visibly wrong —
    // while the same tolerance was far too loose to notice.
    // #256EF4 is oklch(0.575 0.214 261); 257 is only 4° off yet must be caught.
    const saturated = makeDraft({
      colorsYaml: [
        "```yaml",
        "primary-50: oklch(0.575 0.205 257)   # #256EF4",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(saturated, OPTS, "warn")).toContain("oklch-hex-mismatch")
  })

  it("scales with chroma: tolerates a large hue error on a near-grey", () => {
    // Mirror image of the case above. #FAFAFA carries almost no chroma, so its
    // hue angle is numerical noise and a 200° "error" barely moves the pixel —
    // ΔE stays tiny on its own, with no special-case branch needed.
    const grey = makeDraft({
      colorsYaml: [
        "```yaml",
        "gray-5: oklch(0.985 0.000 200)   # #FAFAFA",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(grey, OPTS, "warn")).not.toContain("oklch-hex-mismatch")
  })

  it("wraps a hue that rounds to 360 back to 0 in the suggestion", () => {
    // #DC6991 decodes to H≈359.98. Rounding alone would suggest an out-of-range
    // `oklch(… 360)`; hue is a circle, so the correction must read 0.
    const raw = makeDraft({
      colorsYaml: [
        "```yaml",
        "rose: oklch(0.20 0.15 340)   # #DC6991",
        "```",
      ].join("\n"),
    })
    const fix = validateDraft(raw, OPTS).issues.find(
      (i) => i.rule === "oklch-hex-mismatch"
    )?.fix
    expect(fix).toContain(" 0)")
    expect(fix).not.toContain("360")
  })

  it("expands 4-digit #RGBA shorthand instead of silently skipping it", () => {
    // A hex the parser can't read means the token is never checked — a silent
    // hole. #F00 8 → #FF000088; the mismatched lightness must still surface.
    const raw = makeDraft({
      colorsYaml: [
        "```yaml",
        "accent: oklch(0.20 0.20 29 / 53%)   # #F008",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("oklch-hex-mismatch")
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

describe("oklch-hex-mismatch — annotation forms", () => {
  // The authoring gate advertises an OKLCH↔hex check, but its own pattern used
  // to require the hex immediately after the `#` marker. Catalog files mostly
  // write `# ≈ #HEX` or `# prose (#HEX)`, so a wrong conversion in those shapes
  // sailed through `validate:draft` and was only caught by `audit:oklch`.
  const wrong = "oklch(0.5 0.2 30)" // #58CF04 is nowhere near this

  it("flags a mismatch written as `# ≈ #hex`", () => {
    const raw = makeDraft({
      colorsYaml: ["```yaml", `lime-600: ${wrong}   # ≈ #58CF04`, "```"].join(
        "\n"
      ),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("oklch-hex-mismatch")
  })

  it("flags a mismatch written as `# prose (#hex)`", () => {
    const raw = makeDraft({
      colorsYaml: [
        "```yaml",
        `blue-800: ${wrong}   # core Wanted Blue (#0066FF), 단일 primary`,
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("oklch-hex-mismatch")
  })

  it("stays silent when the comment names two hexes (pairing is ambiguous)", () => {
    const raw = makeDraft({
      colorsYaml: [
        "```yaml",
        `pink-600: ${wrong}   # ≈ #F553DA (gradient mid는 #FF53C0)`,
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("oklch-hex-mismatch")
  })
})

// `## References` entries are citations, not prose. Their human description
// routinely quotes a brand constant as provenance ("…brand.primaryColor:
// #3182F6 예시…"), and URL masking strips the link but leaves that text, so the
// prose rule fired on a line where an inline OKLCH would be pure clutter.
describe("hex-in-prose — References is not prose", () => {
  it("ignores a hex inside a References entry description", () => {
    const raw = makeDraft({
      body: (sections) =>
        `${sections}\n6. https://example.com/guide — \`brand.primaryColor: #3182F6\` 예시를 든다.`,
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("hex-in-prose")
  })

  it("still flags a hex in ordinary prose above References", () => {
    const raw = makeDraft({
      body: (sections) =>
        `${sections}`.replace(
          "브랜드는 절제된 톤을 쓴다 [src:1].",
          "브랜드 그린은 #00C400이다 [src:1]."
        ),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("hex-in-prose")
  })

  // The exemption is scoped to the References section, not to "the rest of the
  // file". Every catalog entry ends with References today, but nothing enforces
  // that — non-standard sections are allowed anywhere — so a latched flag would
  // silently disarm the rule for whatever followed.
  it("resumes flagging in a section that follows References", () => {
    const raw = makeDraft({
      body: (sections) =>
        `${sections}\n\n## Changelog\n\n1. https://example.com/note — 그린을 #00C400으로 바꿨다.`,
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("hex-in-prose")
  })

  // `parseReferences` (source-citations.ts) ends the block at `#{2,}` — any
  // heading, not just H2. Reading the boundary two different ways inside one
  // validator is how a rule goes quiet on a shape nobody tested.
  it("resumes flagging after a nested heading, not just an H2", () => {
    const raw = makeDraft({
      body: (sections) =>
        `${sections}\n\n### Notes\n\n1. https://example.com/note — 그린을 #00C400으로 바꿨다.`,
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("hex-in-prose")
  })
})

// ── audit-note format ────────────────────────────────────────────────────────
// CLAUDE.md fixes the shape of a re-audit note: a `> **<label>(YYYY-MM-DD).**`
// blockquote, at the head of its section, one per section. The rule existed for
// one batch before it was broken nine times in a row — every violation was
// caught by a human reviewer, which is why it is mechanical now.

describe("audit-note format", () => {
  const NOTE = "> **대조 결과(2026-08-02).** 값 43개를 발행 팔레트와 맞춰 봤다."

  it("accepts a note at the head of its section", () => {
    const raw = makeDraft({
      body: (s) => s.replace("## Colors\n", `## Colors\n\n${NOTE}\n`),
    })
    expect(rulesOf(raw, OPTS)).not.toContain("audit-note-placement")
  })

  it("flags a note that is not the first paragraph of its section", () => {
    // The failure this rule exists for: bezier and vapor-ui both buried the
    // note under two paragraphs, so a reader met the values before the caveat.
    const raw = makeDraft({
      body: (s) =>
        s.replace(
          "팔레트는 OKLCH로 관리한다 [src:2]. 두 번째 문장이다.",
          `팔레트는 OKLCH로 관리한다 [src:2]. 두 번째 문장이다.\n\n${NOTE}`
        ),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("audit-note-placement")
  })

  it("flags a second note in the same section", () => {
    // Appending instead of overwriting recreates the audit-log accumulation the
    // rule was written to prevent.
    const older = "> **팔레트 정정(2026-07-29).** 이전 라운드 결과다."
    const raw = makeDraft({
      body: (s) =>
        s.replace("## Colors\n", `## Colors\n\n${NOTE}\n\n${older}\n`),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("audit-note-duplicate")
  })

  it("flags a dated check stamp inside a References entry", () => {
    // References carries the source's static character; "checked on DATE" is
    // audit history and belongs in the commit or the section note.
    const raw = makeDraft({
      body: (s) =>
        s.replace(
          "1. https://example.com/design-system — 설명",
          "1. https://example.com/design-system — 설명 (2026-08-02 확인)"
        ),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("reference-audit-stamp")
  })

  it("leaves an undated References description alone", () => {
    const raw = makeDraft({
      body: (s) =>
        s.replace(
          "1. https://example.com/design-system — 설명",
          "1. https://example.com/design-system — JS 셸이라 브라우저로 열어야 읽힌다."
        ),
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("reference-audit-stamp")
  })

  it("does not mistake a Known Gaps bullet for an audit note", () => {
    // Known Gaps keeps a standing list; its dated bullets are a different form
    // and CLAUDE.md says so explicitly.
    const raw = makeDraft({
      body: (s) =>
        `${s}\n\n## Known Gaps\n\n- **철회된 부재 주장 2건 (2026-08-02)** — 종전 판본은 …`,
    })
    const rules = rulesOf(raw, OPTS)
    expect(rules).not.toContain("audit-note-placement")
    expect(rules).not.toContain("audit-note-duplicate")
  })

  it("leaves a release date that merely shares a parenthetical with 확인", () => {
    // `(v1.2, 2025-03-19 배포 확인)` dates the source's release, not an audit.
    // Matching the two tokens anywhere in one parenthetical flags it; the
    // prohibited form is specifically a date the verb directly qualifies.
    const raw = makeDraft({
      body: (s) =>
        s.replace(
          "1. https://example.com/design-system — 설명",
          "1. https://example.com/design-system — 토큰 표 (v1.2, 2025-03-19 배포 확인)"
        ),
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("reference-audit-stamp")
  })

  it("flags a check stamp written with a synonym for 확인", () => {
    // Same stamp, different verb. Pinning one word would let the next author
    // reintroduce the history the rule removes, and wonder why it passed.
    const raw = makeDraft({
      body: (s) =>
        s.replace(
          "1. https://example.com/design-system — 설명",
          "1. https://example.com/design-system — 설명 (2026-08-02 조회)"
        ),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("reference-audit-stamp")
  })

  it("counts a second note under an H3 inside the same H2 section", () => {
    // The scope of "one note per section" is the standard H2. Resetting on any
    // `#{2,}` — the boundary `inReferences` needs to match `parseReferences` —
    // would let a note tucked under a `### 서브섹션` restart the count, and 9 of
    // 17 catalog entries have exactly that shape inside `## Colors`.
    const older = "> **팔레트 정정(2026-07-29).** 이전 라운드 결과다."
    const raw = makeDraft({
      body: (s) =>
        s.replace(
          "## Colors\n",
          `## Colors\n\n${NOTE}\n\n### 다크 테마 램프\n\n${older}\n`
        ),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("audit-note-duplicate")
  })
})
