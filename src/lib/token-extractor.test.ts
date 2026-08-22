import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { extractTokensFromMarkdown } from "./token-extractor"

// Load the post-frontmatter body of a real catalog entry, exactly as the
// codegen script will feed it to the extractor.
/** The whole entry, frontmatter included.
 *
 *  Tokens live in frontmatter now, so handing the extractor only `doc.body`
 *  would exercise the legacy fence path against files that no longer have
 *  fences — every assertion below would read zero and the suite would be
 *  testing nothing. */
function loadRaw(slug: string): string {
  return readFileSync(
    new URL(`../../services/${slug}.md`, import.meta.url),
    "utf8"
  )
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
    const { colors } = extractTokensFromMarkdown(loadRaw("toss"))
    const blue = colors.find((c) => c.name === "blue-500")
    expect(blue?.value).toBe("oklch(0.624 0.176 254)")
    expect(blue?.note).toContain("카노니컬")
    // ~37 real swatches once the ~40 semantic aliases are excluded.
    expect(colors.length).toBeGreaterThan(30)
    expect(colors.length).toBeLessThan(45)
  })

  it("preserves the alpha slash inside oklch values (toss fg-tertiary)", () => {
    const { colors } = extractTokensFromMarkdown(loadRaw("toss"))
    expect(colors.find((c) => c.name === "fg-tertiary")?.value).toBe(
      "oklch(0.155 0.060 261 / 0.58)"
    )
  })

  it("excludes bare-reference aliases from the color sidecar (toss fill-brand)", () => {
    const { colors } = extractTokensFromMarkdown(loadRaw("toss"))
    expect(colors.find((c) => c.name === "fill-brand")).toBeUndefined()
  })

  it("excludes non-color numeric scalars from toss (disabled-opacity)", () => {
    const { colors } = extractTokensFromMarkdown(loadRaw("toss"))
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
      extractTokensFromMarkdown(loadRaw("toss")).spacing.find(
        (s) => s.name === "space-1"
      )
    ).toMatchObject({ value: "4px", px: 4 })
    expect(
      extractTokensFromMarkdown(loadRaw("baemin")).spacing.find(
        (s) => s.name === "space-4"
      )
    ).toMatchObject({ value: "16px", px: 16 })
  })

  it("reads radius variants: toss full-pill and baemin circle:50%", () => {
    expect(
      extractTokensFromMarkdown(loadRaw("toss")).radius.find(
        (r) => r.name === "radius-full"
      )?.px
    ).toBe(999)
    expect(
      extractTokensFromMarkdown(loadRaw("baemin")).radius.find(
        (r) => r.name === "circle"
      )
    ).toMatchObject({ value: "50%", px: null })
  })
})

describe("typography", () => {
  it("parses the inline-object ramp (toss display-1)", () => {
    const { typography } = extractTokensFromMarkdown(loadRaw("toss"))
    expect(typography.find((t) => t.name === "display-1")).toMatchObject({
      size: "56px",
      weight: 700,
      lineHeight: "1.30",
      tracking: "-0.005em",
    })
  })

  it("parses the slash ramp with an absolute px line-height (socar display1)", () => {
    const { typography } = extractTokensFromMarkdown(loadRaw("socar"))
    expect(typography.find((t) => t.name === "display1")).toMatchObject({
      size: "40px",
      lineHeight: "50px",
      weight: 700,
    })
  })

  it("parses the mixed slash ramp and keeps font info as a note (baemin display-1)", () => {
    const { typography } = extractTokensFromMarkdown(loadRaw("baemin"))
    const d1 = typography.find((t) => t.name === "display-1")
    expect(d1).toMatchObject({ size: "96px", lineHeight: "1.02", weight: 400 })
    expect(d1?.note).toContain("도현체")
  })

  it("excludes non-ramp rule lines that have no size (baemin price)", () => {
    const { typography } = extractTokensFromMarkdown(loadRaw("baemin"))
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

  // A scale value can be inferred rather than published (yeogi derives its
  // spacing px from the `*-radius-NN` naming convention). The caveat rides in
  // the inline comment, so the card must receive it — otherwise a guess renders
  // as an authoritative measurement.
  it("propagates the inline comment as a note on keyed spacing/radius rows", () => {
    const body = md(
      "## Spacing",
      "```yaml",
      "sp-08: 8px # Core size · ≈ 추정 — 미공개, 네이밍 규칙에서 역산",
      "sp-16: 16px",
      "```",
      "",
      "## Rounded",
      "```yaml",
      "radius-12: 12px # Core size",
      "```"
    )
    const { spacing, radius } = extractTokensFromMarkdown(body)
    expect(spacing.find((s) => s.name === "sp-08")).toMatchObject({
      px: 8,
      note: "Core size · ≈ 추정 — 미공개, 네이밍 규칙에서 역산",
    })
    // No comment → no note key at all (not an empty string).
    expect(spacing.find((s) => s.name === "sp-16")?.note).toBeUndefined()
    expect(radius.find((r) => r.name === "radius-12")?.note).toBe("Core size")
  })

  // The array shorthand carries no per-step comment — a note on the row would
  // apply to every expanded step, which would be wrong.
  it("leaves array-shorthand steps without a note", () => {
    const body = md(
      "## Spacing",
      "```yaml",
      "spacing-scale: [2, 4, 8] # 8pt grid",
      "```"
    )
    const { spacing } = extractTokensFromMarkdown(body)
    expect(spacing).toHaveLength(3)
    expect(spacing.every((s) => s.note === undefined)).toBe(true)
  })
})

describe("real entries recover a ramp after variant support", () => {
  it("krds (table), bezier (font-size-*), and 11st (platform obj) all extract typography", () => {
    expect(
      extractTokensFromMarkdown(loadRaw("krds")).typography.length
    ).toBeGreaterThan(8)
    expect(
      extractTokensFromMarkdown(loadRaw("bezier")).typography.length
    ).toBeGreaterThan(8)
    expect(
      extractTokensFromMarkdown(loadRaw("11st")).typography.length
    ).toBeGreaterThan(8)
  })
})

describe("elevation", () => {
  it("omits the key entirely when the section publishes no shadow value", () => {
    // bezier maps levels to usage labels ("elevation-2: 배너"), class101 to
    // z-indices ("bottomBar: 1") — neither is a value a consumer can apply.
    expect(
      extractTokensFromMarkdown(loadRaw("bezier")).elevation
    ).toBeUndefined()
    expect(
      extractTokensFromMarkdown(loadRaw("class101")).elevation
    ).toBeUndefined()
    expect(extractTokensFromMarkdown("# Title").elevation).toBeUndefined()
  })

  it("keeps shadows and drops motion tokens sharing the section", () => {
    const body = md(
      "## Elevation & Depth",
      "",
      "```yaml",
      "shadow-1: 0 1px 2px oklch(0 0 0 / 0.06)   # 카드",
      "ease-standard: cubic-bezier(.2, .0, .2, 1)",
      "duration-fast: 120ms",
      "level: 2",
      "```"
    )
    expect(extractTokensFromMarkdown(body).elevation).toEqual([
      {
        name: "shadow-1",
        value: "0 1px 2px oklch(0 0 0 / 0.06)",
        note: "카드",
      },
    ])
  })

  it("drops motion authored in a second unlabelled fence (11st, greeting)", () => {
    // These two put easing/duration in their own fence with no ### heading, so
    // the group field cannot separate them — only the value shape can.
    for (const slug of ["11st", "greeting"]) {
      const elevation = extractTokensFromMarkdown(loadRaw(slug)).elevation ?? []
      expect(elevation.length).toBeGreaterThan(0)
      for (const t of elevation) {
        expect(t.value).not.toMatch(/cubic-bezier|ms$|^\d+(\.\d+)?s$/)
      }
    }
  })

  it("folds YAML block scalars into one multi-layer value (toss)", () => {
    const shadow2 = extractTokensFromMarkdown(loadRaw("toss")).elevation?.find(
      (t) => t.name === "shadow-2"
    )
    expect(shadow2?.value).toBe(
      "0 4px 12px oklch(0.155 0.060 261 / 0.06), 0 1px 2px oklch(0.155 0.060 261 / 0.04)"
    )
    // The inline comment rides the last continuation line and still splits off.
    expect(shadow2?.note).toBe("tooltip")
  })

  it("strips the YAML quotes an author wraps a value in (11st)", () => {
    const t = extractTokensFromMarkdown(loadRaw("11st")).elevation?.find(
      (e) => e.name === "shadow-toast"
    )
    expect(t?.value).toBe("0 4px 16px oklch(0 0 0 / 0.16)")
  })

  it("keeps negative offsets and `none`", () => {
    const body = md(
      "## Elevation & Depth",
      "",
      "```yaml",
      "dock: 0 -4px 8px oklch(0 0 0 / 6%)",
      "flat: none",
      "```"
    )
    expect(
      extractTokensFromMarkdown(body).elevation?.map((t) => t.name)
    ).toEqual(["dock", "flat"])
  })
})

describe("elevation — shadow-vs-color discrimination", () => {
  // The offsets must be counted OUTSIDE the color function. A bare color has
  // digits inside `oklch(...)`/`rgba(...)` that otherwise read as offsets, and
  // the result would be an offset-less `box-shadow` the browser silently drops
  // — the same silent-failure mode this category exists to avoid. `scrim` and
  // `press-overlay` are real catalog token names, so this is not hypothetical.
  const notShadows = [
    "scrim: oklch(0 0 0 / .32)",
    "press-overlay: oklch(0 0 0 / 0.26)",
    "overlay: rgba(0, 0, 0, 0.4)",
    "tint: oklch(0.5 0.1 260)",
    "blend: color-mix(in srgb, #000000 20%, transparent)",
  ]
  const shadows = [
    "shadow-1: 0 1px 2px oklch(0 0 0 / 0.06)",
    "dock: 0 -4px 8px oklch(0 0 0 / 6%)",
    "sm: 0px 1px 4px 0px oklch(0 0 0 / 0.078)",
    "md: 0 4px 10px color-mix(in srgb, #000000 20%, transparent)",
    "multi: 0 1px 2px oklch(0 0 0 / .04), 0 2px 6px oklch(0 0 0 / .16)",
    "ring: inset 0 0 0 1px oklch(0.573 0.189 260)",
    "flat: none",
  ]
  const section = (line: string) =>
    md("## Elevation & Depth", "", "```yaml", line, "```")

  it.each(notShadows)("excludes a bare color value: %s", (line) => {
    expect(extractTokensFromMarkdown(section(line)).elevation).toBeUndefined()
  })

  it.each(shadows)("keeps a real shadow: %s", (line) => {
    expect(extractTokensFromMarkdown(section(line)).elevation).toHaveLength(1)
  })

  // Colors are authored as OKLCH with the source hex in a trailing comment
  // (seed-design does exactly this), so a bare hex AS the shadow colour is not
  // a supported form — `splitInlineComment` would read ` #0000001a` as a note.
  // Pinned so the constraint is visible rather than discovered.
  it("treats a space-prefixed bare hex as a comment, not a shadow colour", () => {
    const t = extractTokensFromMarkdown(section("hex: 0 2px 4px #0000001a"))
    expect(t.elevation).toBeUndefined()
  })

  it("does not carry a group field (only colours render grouped)", () => {
    const t = extractTokensFromMarkdown(
      md(
        "## Elevation & Depth",
        "",
        "### Surface",
        "",
        "```yaml",
        "s1: 0 1px 2px oklch(0 0 0 / 0.06)",
        "```"
      )
    )
    expect(t.elevation?.[0]).toEqual({
      name: "s1",
      value: "0 1px 2px oklch(0 0 0 / 0.06)",
    })
  })
})

describe("unquote", () => {
  // A greedy `^"(.*)"$` strips the OUTER pair of a two-item quoted value and
  // leaves the inner quotes stranded (`"Foo", "Bar"` → `Foo", "Bar`). Nothing
  // in the catalogue takes that shape today, but this helper sits on the path
  // EVERY section takes, so a quoted font stack landing in ## Typography later
  // would be corrupted silently.
  it("unwraps a value that is a single quoted string (11st shadows)", () => {
    const body = md(
      "## Elevation & Depth",
      "",
      "```yaml",
      'shadow-toast:    "0 4px 16px oklch(0 0 0 / 0.16)"',
      "```"
    )
    expect(extractTokensFromMarkdown(body).elevation?.[0].value).toBe(
      "0 4px 16px oklch(0 0 0 / 0.16)"
    )
  })

  it("leaves a value carrying more than one quoted item untouched", () => {
    const body = md("## Colors", "", "```yaml", 'stack: "Foo", "Bar"', "```")
    // Not a colour, so it never reaches the sidecar — the point is that the
    // value is not mangled on the way through the shared helper.
    expect(extractTokensFromMarkdown(body).colors).toEqual([])
  })
})

describe("frontmatter shapes the docs prescribe", () => {
  const doc = (typography: string) =>
    [
      "---",
      "name: 데모",
      "slug: demo",
      "typography:",
      typography,
      "---",
      "",
      "## Colors",
      "산문.",
    ].join("\n")

  it("reads the nested shape, and only that shape", () => {
    // The inline flow form yields NOTHING, which is why the skill docs must not
    // show it: the head-line regex wants an empty value, so `{ size: … }` never
    // matches and the entry ships with an empty typography sidecar that
    // `tokens:check` then happily confirms.
    const nested = doc("  display-1:\n    fontSize: 56px\n    fontWeight: 700")
    const inline = doc("  display-1: { size: 56px, weight: 700 }")
    expect(extractTokensFromMarkdown(nested).typography).toHaveLength(1)
    expect(extractTokensFromMarkdown(inline).typography).toHaveLength(0)
  })

  it("keeps reading type tokens past a flush-left comment", () => {
    // YAML keeps the mapping open across a comment at any indentation. Stopping
    // there dropped every later style in silence — and unlike a zero count, a
    // truncated scale looks healthy.
    const truncated = doc(
      "  a:\n    fontSize: 16px\n# a comment written flush left\n  b:\n    fontSize: 20px"
    )
    expect(extractTokensFromMarkdown(truncated).typography).toHaveLength(2)
  })

  it("still ends the map at the next top-level key", () => {
    const bounded = doc(
      "  a:\n    fontSize: 16px\nlang: ko\n  b:\n    fontSize: 20px"
    )
    expect(extractTokensFromMarkdown(bounded).typography).toHaveLength(1)
  })
})

describe("the skill template prescribes a shape the extractor reads", () => {
  it("round-trips the template's own typography example", () => {
    // A doc-contract test rather than a text match: the template's example is
    // de-placeholdered and fed through the real extractor VERBATIM — comments
    // included. An earlier version of this test stripped them first, which hid
    // the fact that the extractor was folding a property's trailing comment into
    // its value; the skeleton annotates those very lines, so the test has to
    // exercise what an author would actually copy. If someone edits the
    // skeleton into a shape the extractor cannot read — which is exactly what
    // happened with the inline `{ size: … }` form — this fails instead of every
    // future entry silently shipping an empty type scale.
    const template = readFileSync(
      new URL(
        "../../.claude/skills/design-md/references/design-md-template.md",
        import.meta.url
      ),
      "utf8"
    )
    const block = template.match(/^typography:\n(?:[ ]{2,}.*\n)+/m)
    expect(block, "template has no typography example").not.toBeNull()
    const filled = (block as RegExpMatchArray)[0]
      .replace(/\{\{style-name\}\}/g, "display-1")
      .replace(/\{\{([\d.-]+)\}\}/g, "$1")
    const doc = [
      "---",
      "name: 데모",
      "slug: demo",
      filled.trimEnd(),
      "---",
      "",
      "## Colors",
      "산문.",
    ].join("\n")
    expect(extractTokensFromMarkdown(doc).typography).toHaveLength(1)
    expect(extractTokensFromMarkdown(doc).typography[0].size).toBe("56px")
  })
})

describe("empty typography property rows", () => {
  it("produces no token at all rather than a zero weight", () => {
    // Two guards meet here. The empty-value guard stops `Number("")` becoming
    // `weight: 0` — a value the adapter would emit and the spec linter accept,
    // laundering an error the raw document fails on. And because no recognized
    // property is ever parsed, the style never becomes a token at all: a head
    // row alone used to count toward the skill's zero-count check while
    // `emitTypography` filtered it straight back out.
    const doc = [
      "---",
      "typography:",
      "  a:",
      "    fontSize:",
      "    fontWeight:",
      "---",
      "",
      "## Colors",
      "산문.",
    ].join("\n")
    expect(extractTokensFromMarkdown(doc).typography).toEqual([])
  })
})

describe("typography shapes that look healthy but are not", () => {
  const doc = (typography: string) =>
    [
      "---",
      "name: 데모",
      "slug: demo",
      "typography:",
      typography,
      "---",
      "",
      "## Colors",
      "산문.",
    ].join("\n")

  it("does not count a style whose properties are all unrecognized", () => {
    // A misspelt property, a style carrying only `fontFamily`, a nested group —
    // each used to append a bare `{name}` token. The count then looked healthy
    // while `emitTypography` dropped every one, so DESIGN.md published no
    // typography and the skill's zero-count guard never fired.
    expect(
      extractTokensFromMarkdown(doc("  a:\n    fontSizee: 16px")).typography
    ).toEqual([])
    expect(
      extractTokensFromMarkdown(
        doc("  group:\n    body:\n      fontSize: 16px")
      ).typography
    ).toEqual([])
  })

  it("normalizes a named font weight instead of storing null", () => {
    // `bold` is valid and the legacy fence parser has always mapped it to 700.
    // `Number("bold")` is NaN, which serialises as `null` in the sidecar and
    // reaches DESIGN.md as `fontWeight: null`.
    expect(
      extractTokensFromMarkdown(
        doc("  a:\n    fontSize: 16px\n    fontWeight: bold")
      ).typography[0]
    ).toEqual({ name: "a", size: "16px", weight: 700 })
  })
})
