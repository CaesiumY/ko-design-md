import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { buildDoc } from "./content-parser"
import { extractTokensFromMarkdown } from "./token-extractor"

// Load the post-frontmatter body of a real catalog entry, exactly as the
// codegen script will feed it to the extractor.
function loadBody(slug: string): string {
  const raw = readFileSync(
    new URL(`../../services/${slug}.md`, import.meta.url),
    "utf8"
  )
  return buildDoc(`/services/${slug}.md`, raw).body
}

function md(...lines: Array<string>): string {
  return lines.join("\n")
}

describe("extractTokensFromMarkdown — structure", () => {
  it("returns empty arrays when no token sections are present", () => {
    expect(extractTokensFromMarkdown("# Title\n\nNothing here.")).toEqual({
      colors: [],
      typography: [],
      spacing: [],
      radius: [],
    })
  })

  it("merges multiple yaml fences inside one ## Colors section and tracks ### groups", () => {
    const body = md(
      "## Colors",
      "### Brand",
      "```yaml",
      "blue-500: oklch(0.6 0.1 250)",
      "```",
      "### Greyscale (cool neutrals)",
      "```yaml",
      "grey-900: oklch(0.2 0 0)",
      "```",
      "## Spacing"
    )
    const { colors } = extractTokensFromMarkdown(body)
    expect(colors.map((c) => c.name)).toEqual(["blue-500", "grey-900"])
    expect(colors[0].group).toBe("Brand")
    expect(colors[1].group).toBe("Greyscale")
  })

  it("ignores prose and non-yaml fences within a section", () => {
    const body = md(
      "## Colors",
      "설명 문장이다.",
      "```ts",
      "const skipMe: number = 1",
      "```",
      "```yaml",
      "primary: oklch(0.5 0.1 30)",
      "```"
    )
    expect(extractTokensFromMarkdown(body).colors).toHaveLength(1)
  })
})

describe("colors", () => {
  it("keeps only real color values; aliases and numeric scalars stay in the md only", () => {
    const body = md(
      "## Colors",
      "```yaml",
      "primary: oklch(0.5 0.1 30)   # 핵심 CTA",
      "accent: {colors.primary}",
      "fill: primary",
      "op: 0.30",
      "dark-bg: oklch(0.1 0 0)",
      "```"
    )
    const { colors } = extractTokensFromMarkdown(body)
    expect(colors.find((c) => c.name === "primary")).toMatchObject({
      value: "oklch(0.5 0.1 30)",
      note: "핵심 CTA",
    })
    // aliases ({ref} + bare token names) and numeric opacity scalars stay in the
    // md only. dark-* tokens ARE extracted, though — the sidecar carries the full
    // palette so a token copy can reproduce dark mode; the card VIEW filters them
    // to light at render time (see token-curation.lightColorsOnly), not here.
    expect(colors.map((c) => c.name)).toEqual(["primary", "dark-bg"])
  })

  it("extracts dark-* tokens with their group preserved (full-palette sidecar)", () => {
    const body = md(
      "## Colors",
      "```yaml",
      "bg: oklch(0.99 0 0)",
      "```",
      "",
      "### 다크 테마",
      "",
      "```yaml",
      "dark-bg: oklch(0.15 0.02 265)",
      "```"
    )
    const { colors } = extractTokensFromMarkdown(body)
    expect(colors.find((c) => c.name === "dark-bg")).toMatchObject({
      value: "oklch(0.15 0.02 265)",
      group: "다크 테마",
    })
  })

  it("extracts a rich oklch palette from toss with notes preserved", () => {
    const { colors } = extractTokensFromMarkdown(loadBody("toss"))
    const blue = colors.find((c) => c.name === "blue-500")
    expect(blue?.value).toBe("oklch(0.624 0.176 254)")
    expect(blue?.note).toContain("카노니컬")
    // ~37 real swatches once the ~40 semantic aliases are excluded.
    expect(colors.length).toBeGreaterThan(30)
    expect(colors.length).toBeLessThan(45)
  })

  it("preserves the alpha slash inside oklch values (toss fg-tertiary)", () => {
    const { colors } = extractTokensFromMarkdown(loadBody("toss"))
    expect(colors.find((c) => c.name === "fg-tertiary")?.value).toBe(
      "oklch(0.155 0.060 261 / 0.58)"
    )
  })

  it("excludes bare-reference aliases from the color sidecar (toss fill-brand)", () => {
    const { colors } = extractTokensFromMarkdown(loadBody("toss"))
    expect(colors.find((c) => c.name === "fill-brand")).toBeUndefined()
  })

  it("excludes non-color numeric scalars from toss (disabled-opacity)", () => {
    const { colors } = extractTokensFromMarkdown(loadBody("toss"))
    expect(colors.find((c) => c.name === "disabled-opacity")).toBeUndefined()
  })
})

describe("spacing & radius", () => {
  it("normalizes bare numbers, px, rem, and percent values", () => {
    const body = md(
      "## Spacing",
      "```yaml",
      "a: 4",
      "b: 16px",
      "c: 1.5rem",
      "```",
      "## Rounded",
      "```yaml",
      "full: 9999",
      "circle: 50%",
      "```"
    )
    const { spacing, radius } = extractTokensFromMarkdown(body)
    expect(spacing.find((s) => s.name === "a")).toMatchObject({
      value: "4px",
      px: 4,
    })
    expect(spacing.find((s) => s.name === "b")).toMatchObject({
      value: "16px",
      px: 16,
    })
    expect(spacing.find((s) => s.name === "c")).toMatchObject({
      value: "1.5rem",
      px: 24,
    })
    expect(radius.find((r) => r.name === "full")).toMatchObject({
      value: "9999px",
      px: 9999,
    })
    expect(radius.find((r) => r.name === "circle")).toMatchObject({
      value: "50%",
      px: null,
    })
  })

  it("reads toss spacing (bare) and baemin spacing (px-suffixed)", () => {
    expect(
      extractTokensFromMarkdown(loadBody("toss")).spacing.find(
        (s) => s.name === "space-1"
      )
    ).toMatchObject({ value: "4px", px: 4 })
    expect(
      extractTokensFromMarkdown(loadBody("baemin")).spacing.find(
        (s) => s.name === "space-4"
      )
    ).toMatchObject({ value: "16px", px: 16 })
  })

  it("reads radius variants: toss full-pill and baemin circle:50%", () => {
    expect(
      extractTokensFromMarkdown(loadBody("toss")).radius.find(
        (r) => r.name === "radius-full"
      )?.px
    ).toBe(999)
    expect(
      extractTokensFromMarkdown(loadBody("baemin")).radius.find(
        (r) => r.name === "circle"
      )
    ).toMatchObject({ value: "50%", px: null })
  })
})

describe("typography", () => {
  it("parses the inline-object ramp (toss display-1)", () => {
    const { typography } = extractTokensFromMarkdown(loadBody("toss"))
    expect(typography.find((t) => t.name === "display-1")).toMatchObject({
      size: "56px",
      weight: 700,
      lineHeight: "1.30",
      tracking: "-0.005em",
    })
  })

  it("parses the slash ramp with an absolute px line-height (socar display1)", () => {
    const { typography } = extractTokensFromMarkdown(loadBody("socar"))
    expect(typography.find((t) => t.name === "display1")).toMatchObject({
      size: "40px",
      lineHeight: "50px",
      weight: 700,
    })
  })

  it("parses the mixed slash ramp and keeps font info as a note (baemin display-1)", () => {
    const { typography } = extractTokensFromMarkdown(loadBody("baemin"))
    const d1 = typography.find((t) => t.name === "display-1")
    expect(d1).toMatchObject({ size: "96px", lineHeight: "1.02", weight: 400 })
    expect(d1?.note).toContain("도현체")
  })

  it("excludes non-ramp rule lines that have no size (baemin price)", () => {
    const { typography } = extractTokensFromMarkdown(loadBody("baemin"))
    expect(typography.find((t) => t.name === "price")).toBeUndefined()
  })
})

describe("typography — format variants (P2 backfill)", () => {
  it("emits size-only tokens from separate size families (bezier font-size-*)", () => {
    const body = md(
      "## Typography",
      "```yaml",
      "font-size-11: 1.1rem",
      "font-size-36: 3.6rem",
      "weight-700: 700",
      "line-height-16: 1.6rem",
      "letter-spacing-1: -0.01rem",
      "```"
    )
    const { typography } = extractTokensFromMarkdown(body)
    expect(typography.find((t) => t.name === "font-size-11")).toMatchObject({
      size: "1.1rem",
    })
    // weight / line-height / letter-spacing constants are not size tokens
    expect(typography.map((t) => t.name)).toEqual([
      "font-size-11",
      "font-size-36",
    ])
  })

  it("reads size from platform keys and named weights (11st android/ios object)", () => {
    const body = md(
      "## Typography",
      "```yaml",
      "headline-1: { weight: Bold, android: 24, ios: 25 }",
      "body-1: { weight: Regular, android: 14, ios: 15 }",
      "```"
    )
    const { typography } = extractTokensFromMarkdown(body)
    expect(typography.find((t) => t.name === "headline-1")).toMatchObject({
      size: "24px",
      weight: 700,
    })
    expect(typography.find((t) => t.name === "body-1")).toMatchObject({
      size: "14px",
      weight: 400,
    })
  })

  it("parses a markdown type-scale table (krds-style)", () => {
    const body = md(
      "## Typography",
      "| Token | Size / Line height | 용도 |",
      "| --- | --- | --- |",
      "| display-l | 64px / 1.3, -0.02em | 배너 |",
      "| **body-m** | 17px / 1.55 | 본문 |"
    )
    const { typography } = extractTokensFromMarkdown(body)
    expect(typography.find((t) => t.name === "display-l")).toMatchObject({
      size: "64px",
      lineHeight: "1.3",
      tracking: "-0.02em",
    })
    expect(typography.find((t) => t.name === "body-m")).toMatchObject({
      size: "17px",
      lineHeight: "1.55",
    })
  })

  it("skips font-*-src webfont URL lines (absolute and protocol-relative) so a numeric path segment can't masquerade as a size", () => {
    const body = md(
      "## Typography",
      "```yaml",
      "display-1: { size: 56, weight: 700, line-height: 1.3 }",
      "font-display-src: https://fonts.example.com/v2/400/WantedSansVariable.css",
      "font-sans-src: //cdn.example.com/v9/800/body.css",
      "```"
    )
    const { typography } = extractTokensFromMarkdown(body)
    // The `/400/` and `/800/` URL path segments would otherwise parse as size
    // tokens. The `*-src` / URL guard in parseType (covering protocol-relative
    // `//…` too) keeps webfont sources out of the cards.
    expect(typography.map((t) => t.name)).toEqual(["display-1"])
  })
})

describe("spacing — format variants (P2 backfill)", () => {
  it("expands a yaml scale array (11st spacing-scale)", () => {
    const body = md(
      "## Spacing",
      "```yaml",
      "spacing-scale: [2, 4, 8, 16]",
      "spacing-base: 8",
      "```"
    )
    const pxs = extractTokensFromMarkdown(body).spacing.map((s) => s.px)
    expect(pxs).toEqual(expect.arrayContaining([2, 4, 8, 16]))
  })
})

describe("real entries recover a ramp after variant support", () => {
  it("krds (table), bezier (font-size-*), and 11st (platform obj) all extract typography", () => {
    expect(
      extractTokensFromMarkdown(loadBody("krds")).typography.length
    ).toBeGreaterThan(8)
    expect(
      extractTokensFromMarkdown(loadBody("bezier")).typography.length
    ).toBeGreaterThan(8)
    expect(
      extractTokensFromMarkdown(loadBody("11st")).typography.length
    ).toBeGreaterThan(8)
  })
})
