import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { DESIGN_MD_TEMPLATE, readRepoFile } from "./skill-asset-paths"
import { extractTokensFromMarkdown } from "./token-extractor"

/** A real catalog entry, frontmatter included — exactly what the codegen
 *  script feeds the extractor. Handing it only `doc.body` would read zero
 *  tokens, and every assertion below would be testing nothing. */
function loadRaw(slug: string): string {
  return readFileSync(
    new URL(`../../services/${slug}.md`, import.meta.url),
    "utf8"
  )
}

function md(...lines: Array<string>): string {
  return lines.join("\n")
}

/** A document whose frontmatter is `lines`, written as-is — token rows carry
 *  their own two-space indent. The body is prose only: frontmatter is the one
 *  place the extractor reads (#429). */
function fm(...lines: Array<string>): string {
  return md("---", "name: 데모", ...lines, "---", "", "## Colors", "", "산문.")
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

  it("reads nothing from the body — a yaml fence or a type table yields no token", () => {
    // The body used to be a fallback input whenever frontmatter held no token
    // map. Both shapes it read are blocked upstream now (`token-fence`, and
    // `spec-no-typography` for a table-only scale), so the extractor has one
    // input, and a body-only document is simply empty.
    const body = md(
      "---",
      "name: 데모",
      "---",
      "",
      "## Colors",
      "```yaml",
      "ink: oklch(0.2 0 0)",
      "```",
      "",
      "## Typography",
      "| Token | Size / Line height |",
      "| --- | --- |",
      "| body-m | 17px / 1.55 |",
      "",
      "## Spacing",
      "```yaml",
      "sp-4: 4px",
      "```"
    )
    expect(extractTokensFromMarkdown(body)).toEqual({
      colors: [],
      typography: [],
      spacing: [],
      radius: [],
    })
  })

  it("tracks `  ## label` group lines across one colors map", () => {
    const doc = fm(
      "colors:",
      "  ## Brand",
      "  blue-500: oklch(0.6 0.1 250)",
      "  ## Greyscale",
      "  grey-900: oklch(0.2 0 0)"
    )
    const { colors } = extractTokensFromMarkdown(doc)
    expect(colors.map((c) => c.name)).toEqual(["blue-500", "grey-900"])
    expect(colors[0].group).toBe("Brand")
    expect(colors[1].group).toBe("Greyscale")
  })
})

describe("colors", () => {
  it("keeps only real color values; bare names and numeric scalars stay in the md only", () => {
    const body = fm(
      "colors:",
      "  primary: oklch(0.5 0.1 30)   # 핵심 CTA",
      "  fill: primary",
      "  op: 0.30",
      "  dark-bg: oklch(0.1 0 0)"
    )
    const { colors } = extractTokensFromMarkdown(body)
    expect(colors.find((c) => c.name === "primary")).toMatchObject({
      value: "oklch(0.5 0.1 30)",
      note: "핵심 CTA",
    })
    // A bare token name or a number stays in the md only — shapes the draft
    // validator blocks in `colors:` (#597), kept here to pin what the extractor
    // itself drops. A quoted reference row is read; see the next block.
    // dark-* tokens ARE extracted, though — the sidecar carries the full
    // palette so a token copy can reproduce dark mode; the card VIEW filters them
    // to light at render time (see token-curation.lightTokensOnly), not here.
    expect(colors.map((c) => c.name)).toEqual(["primary", "dark-bg"])
  })

  it("extracts dark-* tokens with their group preserved (full-palette sidecar)", () => {
    const body = fm(
      "colors:",
      "  bg: oklch(0.99 0 0)",
      "  ## 다크 테마",
      "  dark-bg: oklch(0.15 0.02 265)"
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
    expect(blue?.value).toBe("oklch(0.620 0.191 258)")
    expect(blue?.note).toContain("카노니컬")
    // ~37 light swatches plus 15 `dark-*` TDS values; the semantic aliases
    // ride beside them as reference tokens and are counted apart.
    const literals = colors.filter((c) => c.ref === undefined)
    expect(literals.length).toBeGreaterThan(45)
    expect(literals.length).toBeLessThan(60)
  })

  it("preserves the alpha slash inside oklch values (toss fg-tertiary)", () => {
    const { colors } = extractTokensFromMarkdown(loadRaw("toss"))
    expect(colors.find((c) => c.name === "fg-tertiary")?.value).toBe(
      "oklch(0.155 0.060 261 / 0.58)"
    )
  })

  it("carries a semantic alias as a reference token (toss fill-brand)", () => {
    const { colors } = extractTokensFromMarkdown(loadRaw("toss"))
    expect(colors.find((c) => c.name === "fill-brand")).toEqual({
      name: "fill-brand",
      value: "oklch(0.620 0.191 258)",
      ref: "blue-500",
    })
  })

  it("excludes non-color numeric scalars from toss (disabled-opacity)", () => {
    const { colors } = extractTokensFromMarkdown(loadRaw("toss"))
    expect(colors.find((c) => c.name === "disabled-opacity")).toBeUndefined()
  })
})

describe("colors — reference rows", () => {
  it("resolves a reference row to the colour it points at and names that key", () => {
    const { colors } = extractTokensFromMarkdown(
      fm(
        "colors:",
        "  gray-050: oklch(0.98 0 0)",
        '  bg-canvas: "{colors.gray-050}"'
      )
    )
    expect(colors[1]).toEqual({
      name: "bg-canvas",
      value: "oklch(0.98 0 0)",
      ref: "gray-050",
    })
  })

  it("follows a reference to a reference to the end, keeping the first hop as ref", () => {
    const { colors } = extractTokensFromMarkdown(
      fm(
        "colors:",
        "  blue-500: oklch(0.6 0.19 258)",
        '  primary: "{colors.blue-500}"',
        '  fill-brand: "{colors.primary}"',
        '  button-bg: "{colors.fill-brand}"'
      )
    )
    expect(colors.find((c) => c.name === "button-bg")).toEqual({
      name: "button-bg",
      value: "oklch(0.6 0.19 258)",
      ref: "fill-brand",
    })
  })

  // A role that silently fell out of the sidecar would pass `tokens:check`,
  // which only compares the sidecar with what this function returns.
  it("refuses a reference to a key that colors: does not have, naming both", () => {
    expect(() =>
      extractTokensFromMarkdown(
        fm(
          "colors:",
          "  gray-050: oklch(0.98 0 0)",
          '  bg-canvas: "{colors.gray-05}"'
        )
      )
    ).toThrow(
      "colors.bg-canvas points at colors.gray-05, which colors: does not have"
    )
  })

  it("refuses references that loop, spelling out the loop", () => {
    expect(() =>
      extractTokensFromMarkdown(
        fm(
          "colors:",
          '  fg-default: "{colors.fg-strong}"',
          '  fg-strong: "{colors.fg-default}"'
        )
      )
    ).toThrow(
      "colors.fg-default never reaches a colour: fg-default → fg-strong → fg-default"
    )
  })

  it("refuses a reference that ends at a value that is not a colour", () => {
    expect(() =>
      extractTokensFromMarkdown(
        fm(
          "colors:",
          "  disabled-opacity: 0.30",
          '  fg-disabled: "{colors.disabled-opacity}"'
        )
      )
    ).toThrow(
      "colors.fg-disabled ends at colors.disabled-opacity, whose value 0.30 is not a colour"
    )
  })

  it("keeps a reference row's group heading and trailing comment", () => {
    const { colors } = extractTokensFromMarkdown(
      fm(
        "colors:",
        "  gray-900: oklch(0.2 0 0)",
        "  ## Semantic",
        '  fg-primary: "{colors.gray-900}"   # 본문 텍스트'
      )
    )
    expect(colors[1]).toEqual({
      name: "fg-primary",
      value: "oklch(0.2 0 0)",
      note: "본문 텍스트",
      group: "Semantic",
      ref: "gray-900",
    })
  })

  it("leaves the literal tokens exactly as they were read without the references", () => {
    const literals = [
      "colors:",
      "  ## Brand",
      "  blue-500: oklch(0.6  0.19 258)   # 대표 파랑",
      "  gray-050: oklch(0.98 0 0)",
    ]
    const alone = extractTokensFromMarkdown(fm(...literals)).colors
    const withRefs = extractTokensFromMarkdown(
      fm(...literals, "  ## Semantic", '  bg-canvas: "{colors.gray-050}"')
    ).colors
    expect(withRefs.filter((c) => c.ref === undefined)).toEqual(alone)
    // Same keys in the same order, so the committed sidecar bytes do not move.
    expect(JSON.stringify(withRefs.slice(0, 2))).toBe(JSON.stringify(alone))
  })
})

describe("spacing & radius", () => {
  it("normalizes bare numbers, px, rem, and percent values", () => {
    const body = fm(
      "spacing:",
      "  a: 4",
      "  b: 16px",
      "  c: 1.5rem",
      "rounded:",
      "  full: 9999",
      "  circle: 50%"
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

// Real entries, read through their frontmatter `typography:` maps. The names
// below once each needed their own body parser (toss inline objects, socar and
// baemin slash ramps); they are nested frontmatter styles now, and these pin
// that the values survived the move.
describe("typography — real entries", () => {
  it("reads toss display-1", () => {
    const { typography } = extractTokensFromMarkdown(loadRaw("toss"))
    expect(typography.find((t) => t.name === "display-1")).toMatchObject({
      size: "56px",
      weight: 700,
      lineHeight: "1.30",
      tracking: "-0.005em",
    })
  })

  it("keeps an absolute px line-height (socar display1)", () => {
    const { typography } = extractTokensFromMarkdown(loadRaw("socar"))
    expect(typography.find((t) => t.name === "display1")).toMatchObject({
      size: "40px",
      lineHeight: "50px",
      weight: 700,
    })
  })

  it("carries the head row's comment as a note (baemin display-1)", () => {
    const { typography } = extractTokensFromMarkdown(loadRaw("baemin"))
    const d1 = typography.find((t) => t.name === "display-1")
    expect(d1).toMatchObject({ size: "96px", lineHeight: "1.02", weight: 400 })
    expect(d1?.note).toContain("도현체")
  })

  it("excludes non-ramp rule lines that have no size (baemin price)", () => {
    const { typography } = extractTokensFromMarkdown(loadRaw("baemin"))
    expect(typography.find((t) => t.name === "price")).toBeUndefined()
  })

  it("reads a full scale from krds, bezier, and 11st", () => {
    // Each of these once reached the sidecar only through a body-only parser
    // (a markdown table, a `font-size-*` family, a platform object).
    for (const slug of ["krds", "bezier", "11st"]) {
      expect(
        extractTokensFromMarkdown(loadRaw(slug)).typography.length,
        slug
      ).toBeGreaterThan(8)
    }
  })
})

describe("spacing — scale shapes", () => {
  it("expands a scale array", () => {
    const pxs = extractTokensFromMarkdown(
      fm("spacing:", "  spacing-scale: [2, 4, 8, 16]", "  spacing-base: 8")
    ).spacing.map((s) => s.px)
    expect(pxs).toEqual(expect.arrayContaining([2, 4, 8, 16]))
  })

  // A scale value can be inferred rather than published (yeogi derives its
  // spacing px from the `*-radius-NN` naming convention). The caveat rides in
  // the inline comment, so the card must receive it — otherwise a guess renders
  // as an authoritative measurement.
  it("propagates the inline comment as a note on keyed spacing/radius rows", () => {
    const body = fm(
      "spacing:",
      "  sp-08: 8px # Core size · ≈ 추정 — 미공개, 네이밍 규칙에서 역산",
      "  sp-16: 16px",
      "rounded:",
      "  radius-12: 12px # Core size"
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
    const { spacing } = extractTokensFromMarkdown(
      fm("spacing:", "  spacing-scale: [2, 4, 8] # 8pt grid")
    )
    expect(spacing).toHaveLength(3)
    expect(spacing.every((s) => s.note === undefined)).toBe(true)
  })
})

/** A frontmatter-shaped entry whose `elevation:` map holds `rows`, written
 *  without their two-space indent. Shadows live only there (#421). */
function withElevation(...rows: Array<string>): string {
  return md(
    "---",
    "name: 데모",
    "colors:",
    "  ink: oklch(0.2 0 0)",
    "elevation:",
    ...rows.map((r) => `  ${r}`),
    "---",
    "",
    "## Elevation & Depth",
    "",
    "산문."
  )
}

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

  it("keeps shadows and drops rows that are not shadows", () => {
    const body = withElevation(
      "shadow-1: 0 1px 2px oklch(0 0 0 / 0.06)   # 카드",
      "ease-standard: cubic-bezier(.2, .0, .2, 1)",
      "duration-fast: 120ms",
      "level: 2"
    )
    expect(extractTokensFromMarkdown(body).elevation).toEqual([
      {
        name: "shadow-1",
        value: "0 1px 2px oklch(0 0 0 / 0.06)",
        note: "카드",
      },
    ])
  })

  it("keeps motion out even where it shares the section (11st, greeting)", () => {
    // These two keep easing/duration under `## Elevation & Depth` with no ###
    // heading. Only the frontmatter map is read, so the body motion fence —
    // a `text` fence now — cannot reach the sidecar.
    for (const slug of ["11st", "greeting"]) {
      const elevation = extractTokensFromMarkdown(loadRaw(slug)).elevation ?? []
      expect(elevation.length).toBeGreaterThan(0)
      for (const t of elevation) {
        expect(t.value).not.toMatch(/cubic-bezier|ms$|^\d+(\.\d+)?s$/)
      }
    }
  })

  it("reads a multi-layer shadow and its note from one row (toss)", () => {
    const shadow2 = extractTokensFromMarkdown(loadRaw("toss")).elevation?.find(
      (t) => t.name === "shadow-2"
    )
    expect(shadow2?.value).toBe(
      "0 4px 12px oklch(0.155 0.060 261 / 0.06), 0 1px 2px oklch(0.155 0.060 261 / 0.04)"
    )
    expect(shadow2?.note).toBe("tooltip")
  })

  it("strips YAML quotes an author wraps a value in", () => {
    // Quoting a token value is allowed (#589); the sidecar carries the value
    // YAML reads, never the quotes.
    const t = extractTokensFromMarkdown(
      withElevation('shadow-toast: "0 4px 16px oklch(0 0 0 / 0.16)"')
    ).elevation
    expect(t?.[0].value).toBe("0 4px 16px oklch(0 0 0 / 0.16)")
  })

  it("ignores a legacy body fence — frontmatter is the only source", () => {
    const body = md(
      "## Elevation & Depth",
      "",
      "```yaml",
      "shadow-1: 0 1px 2px oklch(0 0 0 / 0.06)",
      "```"
    )
    expect(extractTokensFromMarkdown(body).elevation).toBeUndefined()
  })

  it("keeps negative offsets and `none`", () => {
    const body = withElevation(
      "dock: 0 -4px 8px oklch(0 0 0 / 6%)",
      "flat: none"
    )
    expect(
      extractTokensFromMarkdown(body).elevation?.map((t) => t.name)
    ).toEqual(["dock", "flat"])
  })
})

describe("elevation — frontmatter `elevation:` map", () => {
  const doc = (...rows: Array<string>) =>
    md(
      "---",
      "name: 데모",
      "colors:",
      "  ink: oklch(0.2 0 0)",
      "elevation:",
      ...rows,
      "rounded:",
      "  sm: 4px",
      "---",
      "",
      "## Elevation & Depth",
      "",
      "산문."
    )

  it("reads shadows from frontmatter with their trailing-comment notes", () => {
    const t = extractTokensFromMarkdown(
      doc(
        "  ## 표면",
        "  shadow-1: 0 1px 2px oklch(0 0 0 / 0.06)   # 카드",
        "  shadow-2: 0 4px 12px oklch(0 0 0 / 0.1), 0 1px  2px oklch(0 0 0 / 0.04)"
      )
    )
    // No `group`, whitespace collapsed.
    expect(t.elevation).toEqual([
      {
        name: "shadow-1",
        value: "0 1px 2px oklch(0 0 0 / 0.06)",
        note: "카드",
      },
      {
        name: "shadow-2",
        value: "0 4px 12px oklch(0 0 0 / 0.1), 0 1px 2px oklch(0 0 0 / 0.04)",
      },
    ])
  })

  it("drops rows that are not shadows", () => {
    const t = extractTokensFromMarkdown(
      doc("  scrim: oklch(0 0 0 / .32)", "  level: 2")
    )
    expect(t.elevation).toBeUndefined()
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
  const section = (line: string) => withElevation(line)

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
      withElevation("## Surface", "s1: 0 1px 2px oklch(0 0 0 / 0.06)")
    )
    expect(t.elevation?.[0]).toEqual({
      name: "s1",
      value: "0 1px 2px oklch(0 0 0 / 0.06)",
    })
  })
})

describe("quoted token values", () => {
  // A greedy `^"(.*)"$` once stripped the OUTER pair of a two-item quoted
  // value and left the inner quotes stranded (`"Foo", "Bar"` → `Foo", "Bar`).
  // The value is YAML's now, so quoting is undone exactly as YAML undoes it.
  it("unwraps a value that is a single quoted string", () => {
    // Quoting a token value is allowed (#589); the sidecar carries the value
    // YAML reads, never the quotes.
    const body = fm("colors:", '  brand: "oklch(0.62 0.19 258)"')
    expect(extractTokensFromMarkdown(body).colors[0]?.value).toBe(
      "oklch(0.62 0.19 258)"
    )
  })

  it("removes one pair only — a doubly quoted value keeps its inner pair", () => {
    // Pinned so the limit is visible: YAML undoes one layer of quoting, and
    // the inner pair is part of the value.
    const t = extractTokensFromMarkdown(
      fm("elevation:", `  e1: "'0 1px 2px oklch(0 0 0 / 0.1)'"`)
    ).elevation
    expect(t?.[0].value).toBe("'0 1px 2px oklch(0 0 0 / 0.1)'")
  })

  it("refuses a value carrying more than one quoted item", () => {
    // `"Foo", "Bar"` is not one YAML scalar but invalid YAML, so no row reaches
    // `unquote` — the read fails, naming the row's file line (1 is `---`).
    const body = fm("colors:", '  stack: "Foo", "Bar"')
    expect(() => extractTokensFromMarkdown(body)).toThrow(/\(line 4\)/)
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
    // Rows indented under `lang: ko` are not typography — and not valid YAML
    // under a scalar, so the read fails rather than guessing where they belong.
    expect(() => extractTokensFromMarkdown(bounded)).toThrow(/line \d+/)
    const closed = doc("  a:\n    fontSize: 16px\nlang: ko")
    expect(extractTokensFromMarkdown(closed).typography).toHaveLength(1)
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
    const template = readRepoFile(DESIGN_MD_TEMPLATE)
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

describe("the skill template prescribes an elevation shape the extractor reads", () => {
  it("round-trips the template's own shadow example", () => {
    // Same contract as the typography round-trip above: shadows moved into
    // frontmatter in #421, and an example the extractor cannot read would ship
    // every future entry with an empty Shadows card.
    const template = readRepoFile(DESIGN_MD_TEMPLATE)
    const block = template.match(/^elevation:\n(?:[ ]{2,}.*\n)+/m)
    expect(block, "template has no elevation example").not.toBeNull()
    const filled = (block as RegExpMatchArray)[0]
      .replace(/\{\{shadow-name\}\}/g, "shadow-1")
      .replace(/\{\{L C H\}\}/g, "0.2 0 0")
      .replace(/\{\{([\d.-]+)\}\}/g, "$1")
    const doc = ["---", "name: 데모", filled.trimEnd(), "---", ""].join("\n")
    expect(extractTokensFromMarkdown(doc).elevation).toEqual([
      expect.objectContaining({
        name: "shadow-1",
        value: "0 1px 2px oklch(0.2 0 0 / 0.06)",
      }),
    ])
  })
})

describe("empty typography property rows", () => {
  it("produces no token at all rather than a zero weight", () => {
    // Two guards meet here. The empty-value guard stops `Number("")` becoming
    // `weight: 0` — a value the sidecar would carry to the Tokens tab while the
    // spec linter rejects the document it came from. And because no recognized
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

describe("a webfont source written inside typography:", () => {
  it("yields no type token, at either indent", () => {
    // The old body parser filtered `*-src` keys and URL values so a `/400/`
    // path segment could not pass as a size. The frontmatter reader needs no
    // such filter: a two-space `font-display-src:` row is not a style head,
    // and a four-space one is not one of the four type properties.
    const doc = fm(
      "typography:",
      "  font-display-src: https://fonts.example.com/v2/400/Display.css",
      "  body:",
      "    font-sans-src: //cdn.example.com/v9/800/body.css"
    )
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
    // `bold` is a valid weight keyword, and CSS maps it to 700.
    // `Number("bold")` is NaN, which serialises as `null` in the sidecar and
    // reaches DESIGN.md as `fontWeight: null`.
    expect(
      extractTokensFromMarkdown(
        doc("  a:\n    fontSize: 16px\n    fontWeight: bold")
      ).typography[0]
    ).toEqual({ name: "a", size: "16px", weight: 700 })
  })
})

describe("reads the token maps as YAML reads them (ADR 0011)", () => {
  // The extractor reads the frontmatter through the one shared reader, so a
  // row YAML reads is a row the sidecar gets, whatever its spelling.
  it("reads token rows indented by four spaces", () => {
    const body = fm("colors:", "    brand: oklch(0.62 0.19 258) # #3182F6")
    expect(extractTokensFromMarkdown(body).colors).toEqual([
      { name: "brand", value: "oklch(0.62 0.19 258)", note: "#3182F6" },
    ])
  })

  it("keeps the note on a value written below its key", () => {
    const body = fm(
      "colors:",
      "  brand:",
      "    oklch(0.62 0.19 258) # #3182F6",
      '  split: "oklch(0.62',
      '    0.19 258)" # #3182F6'
    )
    expect(extractTokensFromMarkdown(body).colors).toEqual([
      { name: "brand", value: "oklch(0.62 0.19 258)", note: "#3182F6" },
      { name: "split", value: "oklch(0.62 0.19 258)", note: "#3182F6" },
    ])
  })

  it("gives a one-line map's comment to the map, not to each token in it", () => {
    const body = fm(
      "colors: { a: oklch(0.62 0.19 258), b: oklch(0.5 0 0) } # #3182F6",
      "typography:",
      "  title: { fontSize: 24px } # hero"
    )
    const tokens = extractTokensFromMarkdown(body)
    expect(tokens.colors).toEqual([
      { name: "a", value: "oklch(0.62 0.19 258)" },
      { name: "b", value: "oklch(0.5 0 0)" },
    ])
    expect(tokens.typography[0]).toMatchObject({ name: "title", note: "hero" })
  })

  it("reads a quoted key as its name", () => {
    const body = fm("colors:", '  "brand": oklch(0.62 0.19 258)')
    expect(extractTokensFromMarkdown(body).colors[0]?.name).toBe("brand")
  })

  it("keeps a number's written spelling — `1.50` stays `1.50`", () => {
    // YAML resolves `1.50` to the number 1.5; the committed sidecars carry the
    // text as written, so the extractor must not round-trip through the number.
    const body = fm(
      "typography:",
      "  body:",
      "    fontSize: 16px",
      "    lineHeight: 1.50"
    )
    expect(extractTokensFromMarkdown(body).typography[0]?.lineHeight).toBe(
      "1.50"
    )
  })

  it("reads a style written as an inline map", () => {
    // YAML reads `{ fontSize: … }` as the same style the nested block is, so
    // the sidecar gets it too (#589 retired the rule that asked for a block).
    const body = fm(
      "typography:",
      "  body: { fontSize: 16px, fontWeight: 400 }"
    )
    expect(extractTokensFromMarkdown(body).typography).toEqual([
      { name: "body", size: "16px", weight: 400 },
    ])
  })

  it("reads a value written as a block scalar, as YAML reads it", () => {
    // The scalar's text starts with `>`; YAML's value is the colour. Reading
    // the text dropped the token from the sidecar without a word.
    const body = fm("colors:", "  brand: >", "    oklch(0.62 0.19 258)")
    expect(extractTokensFromMarkdown(body).colors).toEqual([
      { name: "brand", value: "oklch(0.62 0.19 258)" },
    ])
  })

  it("reads a quoted value as YAML unescapes it", () => {
    const body = fm("elevation:", `  e1: '0 1px 2px oklch(0 0 0 / 0.1)'`)
    expect(extractTokensFromMarkdown(body).elevation?.[0].value).toBe(
      "0 1px 2px oklch(0 0 0 / 0.1)"
    )
  })

  it("reads no tokens from a block that never closes", () => {
    // No block is not a broken block: the validator reports the missing fence
    // as `frontmatter-parse`, and the extractor has no maps to read.
    const unclosed = md("---", "name: 데모", "colors:", "  a: oklch(0.5 0 0)")
    expect(extractTokensFromMarkdown(unclosed).colors).toEqual([])
  })

  it("throws, naming the line, when the frontmatter is not valid YAML", () => {
    // A reader that guessed at broken YAML could publish a partial sidecar
    // that `tokens:check` then confirms. Failing loudly sends the author to
    // `frontmatter-yaml-invalid` instead.
    const body = fm("colors:", "  a: oklch(0.5 0 0)", "  b: : :")
    expect(() => extractTokensFromMarkdown(body)).toThrow(/line \d+/)
  })
})
