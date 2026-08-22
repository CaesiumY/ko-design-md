import { describe, expect, it } from "vitest"
import { lint } from "@google/design.md/linter"
import { toGoogleDesignMd } from "./google-designmd-adapter"
import type { ServiceDoc, ServiceTokens } from "./content-types"

const EMPTY_TOKENS: ServiceTokens = {
  colors: [],
  typography: [],
  spacing: [],
  radius: [],
}

function makeDoc(overrides: Partial<ServiceDoc> = {}): ServiceDoc {
  const body = overrides.body ?? "## Brand & Style\n\n무난한 산문 한 줄.\n"
  return {
    frontmatter: {
      name: "테스트",
      slug: "test",
      category: "finance",
      last_updated: "2026-08-17",
      created_at: "2026-08-17",
      sources: ["https://example.com"],
      lang: "ko",
      ...overrides.frontmatter,
    },
    raw: `---\n---\n${body}`,
    body,
    tagline: "테스트 태그라인",
    filePath: "/services/test.md",
    estimatedTokens: 100,
    ...overrides,
  }
}

function tokens(overrides: Partial<ServiceTokens>): ServiceTokens {
  return { ...EMPTY_TOKENS, ...overrides }
}

/** Rule ids the official linter reports at the given severity. */
function rulesOf(doc: ServiceDoc, severity: string): Array<string> {
  return lint(toGoogleDesignMd(doc))
    .findings.filter((f) => String(f.severity) === severity)
    .map((f) => String(f.rule ?? "model"))
}

describe("toGoogleDesignMd — frontmatter tokens", () => {
  it("emits colors as a flat name→value map the linter resolves", () => {
    const doc = makeDoc({
      tokens: tokens({
        colors: [
          { name: "primary", value: "oklch(0.62 0.17 254)" },
          { name: "grey-900", value: "oklch(0.23 0.03 254)" },
        ],
      }),
    })
    expect(lint(toGoogleDesignMd(doc)).designSystem.colors.size).toBe(2)
  })

  it("maps sidecar typography keys onto the spec's property names", () => {
    const doc = makeDoc({
      tokens: tokens({
        typography: [
          {
            name: "display-1",
            size: "56px",
            weight: 700,
            lineHeight: "1.30",
            tracking: "-0.005em",
          },
        ],
      }),
    })
    const out = toGoogleDesignMd(doc)
    expect(out).toContain('fontSize: "56px"')
    expect(out).toContain("fontWeight: 700")
    expect(out).toContain('letterSpacing: "-0.005em"')
    expect(lint(out).designSystem.typography.size).toBe(1)
  })

  it("emits a unitless lineHeight as a number, not a quoted string", () => {
    // A quoted "1.30" reads as a dimension with no unit and fails model
    // resolution; the spec wants a bare number for the ratio form.
    const ratio = makeDoc({
      tokens: tokens({
        typography: [{ name: "body", size: "16px", lineHeight: "1.30" }],
      }),
    })
    expect(toGoogleDesignMd(ratio)).toContain("lineHeight: 1.3")
    expect(rulesOf(ratio, "error")).toEqual([])

    const absolute = makeDoc({
      tokens: tokens({
        typography: [{ name: "body", size: "16px", lineHeight: "50px" }],
      }),
    })
    expect(toGoogleDesignMd(absolute)).toContain('lineHeight: "50px"')
    expect(rulesOf(absolute, "error")).toEqual([])
  })

  it("renames the sidecar's `radius` to the spec's `rounded`", () => {
    const doc = makeDoc({
      tokens: tokens({ radius: [{ name: "radius-s", value: "8px", px: 8 }] }),
    })
    const report = lint(toGoogleDesignMd(doc))
    expect(report.designSystem.rounded.size).toBe(1)
  })

  it("keeps the first of a repeated token name so the yaml key stays unique", () => {
    // wanted declares light and dark palettes under one set of names. Emitting
    // both would produce a duplicate yaml key whose later value silently wins.
    const doc = makeDoc({
      tokens: tokens({
        colors: [
          { name: "bg-canvas", value: "oklch(1 0 0)" },
          { name: "bg-canvas", value: "oklch(0.148 0.004 277)" },
        ],
      }),
    })
    const out = toGoogleDesignMd(doc)
    expect(out).toContain("oklch(1 0 0)")
    expect(out).not.toContain("oklch(0.148 0.004 277)")
    expect(lint(out).designSystem.colors.size).toBe(1)
  })

  it("emits a usable document when the entry has no sidecar", () => {
    const doc = makeDoc({ tokens: undefined })
    const out = toGoogleDesignMd(doc)
    expect(out).toContain('name: "테스트"')
    expect(rulesOf(doc, "error")).toEqual([])
  })
})

describe("toGoogleDesignMd — body handling", () => {
  it("strips fenced blocks so their rows cannot trip token-like-ignored", () => {
    // This is the adapter's reason for existing: the linter reads body fences as
    // top-level schema keys, and object-valued rows warn no matter what the
    // frontmatter says.
    const body = [
      "## Typography",
      "",
      "```yaml",
      "display-1: { size: 56px, weight: 700 }",
      "```",
      "",
      "설명 문장.",
    ].join("\n")

    expect(rulesOf(makeDoc({ body }), "warning")).not.toContain(
      "token-like-ignored"
    )
    // …and the prose around the fence survives.
    expect(toGoogleDesignMd(makeDoc({ body }))).toContain("설명 문장.")
  })

  it("does not leak the tail of the body when a fence is left unclosed", () => {
    const body = [
      "## Colors",
      "",
      "```yaml",
      "blue: oklch(0.6 0.1 254)",
      "",
      "누출되면 안 되는 문장.",
    ].join("\n")
    expect(toGoogleDesignMd(makeDoc({ body }))).not.toContain(
      "누출되면 안 되는 문장."
    )
  })

  it("preserves section order the spec recognises, including the alias", () => {
    const body = [
      "## Brand & Style",
      "브랜드.",
      "## Colors",
      "색.",
      "## Typography",
      "서체.",
      "## Elevation & Depth",
      "깊이.",
      "## Shapes",
      "형태.",
      "## Components",
      "컴포넌트.",
      "## Do's and Don'ts",
      "규칙.",
    ].join("\n\n")
    // `Brand & Style` is the spec's own alias for `Overview`, so the catalog's
    // heading order already satisfies section-order.
    expect(rulesOf(makeDoc({ body }), "warning")).not.toContain("section-order")
  })

  it("leaves catalog-only sections in place without raising a finding", () => {
    const body = [
      "## Colors",
      "색.",
      "## Spacing",
      "간격.",
      "## Rounded",
      "곡률.",
      "## Known Gaps",
      "공백.",
      "## References",
      "1. https://example.com",
    ].join("\n\n")
    expect(rulesOf(makeDoc({ body }), "warning")).not.toContain("section-order")
    expect(toGoogleDesignMd(makeDoc({ body }))).toContain("## Known Gaps")
  })
})

describe("toGoogleDesignMd — semantic aliases", () => {
  it("carries reference-valued colours through from the frontmatter", () => {
    // The sidecar deliberately drops aliases — `parseColors` keeps only literal
    // colours, because an alias has no swatch for the site's token cards. But
    // the entries' prose cites them constantly, so building this endpoint from
    // the sidecar alone published references that resolve to nothing.
    const doc = makeDoc({
      raw: [
        "---",
        "colors:",
        "  blue-500: oklch(0.62 0.17 254)",
        '  fill-brand: "{colors.blue-500}"',
        "---",
        "## Brand & Style",
        "산문.",
      ].join("\n"),
      tokens: tokens({
        colors: [{ name: "blue-500", value: "oklch(0.62 0.17 254)" }],
      }),
    })
    const out = toGoogleDesignMd(doc)
    expect(out).toContain('fill-brand: "{colors.blue-500}"')
    expect(lint(out).designSystem.colors.size).toBe(2)
  })

  it("does not duplicate a name the sidecar already supplied", () => {
    const doc = makeDoc({
      raw: [
        "---",
        "colors:",
        '  brand: "{colors.other}"',
        "---",
        "## Brand & Style",
        "산문.",
      ].join("\n"),
      tokens: tokens({
        colors: [{ name: "brand", value: "oklch(0.5 0.1 30)" }],
      }),
    })
    const emitted = toGoogleDesignMd(doc)
      .split("\n")
      .filter((l) => l.trim().startsWith("brand:"))
    expect(emitted).toHaveLength(1)
    expect(emitted[0]).toContain("oklch(0.5 0.1 30)")
  })
})
