import { describe, expect, it } from "vitest"
import { parse } from "yaml"
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
  it("re-tags an unpublished YAML fence as text so its rows cannot trip token-like-ignored", () => {
    // The linter reads body YAML fences as top-level schema keys, and
    // object-valued rows warn no matter what the frontmatter says. A `text`
    // fence is invisible to it and still reaches the reader.
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
    const out = toGoogleDesignMd(makeDoc({ body }))
    expect(out).not.toMatch(/```ya?ml/)
    expect(out).toContain(
      "```text\ndisplay-1: { size: 56px, weight: 700 }\n```"
    )
    expect(out).toContain("설명 문장.")
  })

  it("drops a YAML fence whose every key the frontmatter already publishes", () => {
    // Shadows reach the frontmatter as `elevation:`; keeping their fence too
    // would print each value twice.
    const body = [
      "## Elevation & Depth",
      "",
      "```yaml",
      "shadow-1: 0 1px 2px oklch(0 0 0 / 0.04)   # menu",
      "```",
      "",
      "산문.",
    ].join("\n")
    const out = toGoogleDesignMd(
      makeDoc({
        body,
        tokens: tokens({
          elevation: [
            { name: "shadow-1", value: "0 1px 2px oklch(0 0 0 / 0.04)" },
          ],
        }),
      })
    )
    expect(out).not.toContain("```")
    expect(out.match(/shadow-1:/g)).toHaveLength(1)
  })

  it("keeps the whole fence when any one of its keys is unpublished", () => {
    // Decided per key, not per heading: toss keeps its motion tokens in a
    // fence under `## Elevation & Depth`.
    const body = [
      "## Elevation & Depth",
      "",
      "```yaml",
      "shadow-1: 0 1px 2px oklch(0 0 0 / 0.04)",
      "ease: cubic-bezier(0.22, 0.61, 0.36, 1)",
      "```",
    ].join("\n")
    const out = toGoogleDesignMd(
      makeDoc({
        body,
        tokens: tokens({
          elevation: [
            { name: "shadow-1", value: "0 1px 2px oklch(0 0 0 / 0.04)" },
          ],
        }),
      })
    )
    expect(out).toContain("```text")
    expect(out).toContain("ease: cubic-bezier(0.22, 0.61, 0.36, 1)")
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

  it("keeps the tail when the unclosed fence is one it does not strip", () => {
    // The dropping is a side effect of being inside a fence this function
    // removes, not of the fence being unterminated — so it does not generalise.
    const body = [
      "## Components",
      "",
      "```tsx",
      "const a = 1",
      "",
      "살아남아야 하는 문장.",
    ].join("\n")
    expect(toGoogleDesignMd(makeDoc({ body }))).toContain(
      "살아남아야 하는 문장."
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

describe("toGoogleDesignMd — what the sidecar cannot carry", () => {
  it("keeps an alias that carries a trailing comment", () => {
    // Requiring end-of-line after the closing quote skipped every annotated
    // alias. All eight of baemin's carry one, so that whole semantic palette
    // went missing — and no token-count test noticed, because the sidecar
    // excludes aliases by design.
    const doc = makeDoc({
      raw: [
        "---",
        "colors:",
        "  blue-500: oklch(0.62 0.17 254)",
        '  fill-brand: "{colors.blue-500}"   # 주요 CTA',
        "---",
        "## Brand & Style",
        "산문.",
      ].join("\n"),
      tokens: tokens({
        colors: [{ name: "blue-500", value: "oklch(0.62 0.17 254)" }],
      }),
    })
    expect(toGoogleDesignMd(doc)).toContain('fill-brand: "{colors.blue-500}"')
  })

  it("carries reference-valued spacing and rounded rows too", () => {
    // seed-design names six spacing steps this way; only colours were handled.
    const doc = makeDoc({
      raw: [
        "---",
        "spacing:",
        "  x4: 16px",
        '  global-gutter: "{spacing.x4}"',
        "rounded:",
        '  card: "{rounded.md}"',
        "---",
        "## Brand & Style",
        "산문.",
      ].join("\n"),
      tokens: tokens({ spacing: [{ name: "x4", value: "16px", px: 16 }] }),
    })
    const out = toGoogleDesignMd(doc)
    expect(out).toContain('global-gutter: "{spacing.x4}"')
    expect(out).toContain('card: "{rounded.md}"')
  })

  it("publishes elevation, which the spec model has no slot for", () => {
    // Shadows stay in body fences because the frontmatter schema has no
    // elevation category — and this adapter strips body fences. For several
    // entries that fence was the tokens' ONLY definition, so the endpoint kept
    // prose naming shadows it never showed.
    const doc = makeDoc({
      tokens: {
        ...EMPTY_TOKENS,
        elevation: [
          { name: "shadow-1", value: "0 1px 2px oklch(0 0 0 / 0.04)" },
        ],
      },
    })
    const out = toGoogleDesignMd(doc)
    expect(out).toContain("elevation:")
    expect(out).toContain('shadow-1: "0 1px 2px oklch(0 0 0 / 0.04)"')
    expect(rulesOf(doc, "error")).toEqual([])
  })

  it("reads fontFamily under a head row that carries a comment", () => {
    // The catalog annotates 51 of its 182 style heads this way, and the earlier
    // fixture used the ONE shape that worked — so the test passed while baemin,
    // gmarket and kyobobook published zero font stacks between them.
    const doc = makeDoc({
      raw: [
        "---",
        "typography:",
        "  display-1:   # h1.hero · 도현체",
        "    fontFamily: Pretendard Variable, sans-serif",
        "    fontSize: 56px",
        "---",
        "## Brand & Style",
        "산문.",
      ].join("\n"),
      tokens: tokens({ typography: [{ name: "display-1", size: "56px" }] }),
    })
    expect(toGoogleDesignMd(doc)).toContain(
      "fontFamily: Pretendard Variable, sans-serif"
    )
  })

  it("carries an escaped-quote font stack through without mangling it", () => {
    // Asserted on the PARSED value, not the emitted text: the bug was a round
    // trip — unwrap one quote pair, leave the inner escapes literal, re-quote,
    // escape the backslashes again. 82 of the 131 stacks that reached the
    // endpoint arrived with backslashes welded into the font names.
    const stack = String.raw`"\"Pretendard Variable\", Pretendard, sans-serif"`
    const doc = makeDoc({
      raw: [
        "---",
        "typography:",
        "  body:",
        `    fontFamily: ${stack}`,
        "    fontSize: 16px",
        "---",
        "## Brand & Style",
        "산문.",
      ].join("\n"),
      tokens: tokens({ typography: [{ name: "body", size: "16px" }] }),
    })
    const out = toGoogleDesignMd(doc)
    const fm = parse(out.slice(4, out.indexOf("\n---", 4))) as {
      typography: Record<string, { fontFamily: string }>
    }
    expect(fm.typography.body.fontFamily).toBe(
      '"Pretendard Variable", Pretendard, sans-serif'
    )
  })
})

describe("toGoogleDesignMd — catalog-only maps", () => {
  it("copies fonts/gradients/opacity/grid through as authored", () => {
    // The spec has no field for these, so the sidecar never carried them and an
    // adapter that rebuilds frontmatter from the sidecar dropped them. Eight
    // entries define them and their prose cites them, so the endpoint published
    // references to definitions it had just discarded.
    const doc = makeDoc({
      raw: [
        "---",
        "fonts:",
        String.raw`  font-display: "\"BM DOHYEON\", sans-serif"`,
        "gradients:",
        "  brand: linear-gradient(135deg, oklch(0.68 0.21 35) 0%, oklch(0.6 0.2 20) 100%)",
        "opacity:",
        "  disabled: 0.30",
        "---",
        "## Brand & Style",
        "산문.",
      ].join("\n"),
    })
    const out = toGoogleDesignMd(doc)
    expect(out).toContain(
      String.raw`font-display: "\"BM DOHYEON\", sans-serif"`
    )
    expect(out).toContain("brand: linear-gradient(135deg,")
    expect(out).toContain("disabled: 0.30")
    expect(rulesOf(doc, "error")).toEqual([])
  })
})

describe("toGoogleDesignMd — token comments", () => {
  const annotatedColors = [
    "---",
    "colors:",
    "  blue-500: oklch(0.62 0.17 254)   # #3182F6",
    '  fill-brand: "{colors.blue-500}"   # 주요 CTA',
    "---",
    "## Brand & Style",
    "산문.",
  ].join("\n")
  const blue = tokens({
    colors: [{ name: "blue-500", value: "oklch(0.62 0.17 254)" }],
  })

  it("carries each row's trailing comment, aliases included", () => {
    // Aliases matter most: the sidecar never holds them, so a note read from
    // the sidecar alone would still lose `fill-brand`'s.
    const out = toGoogleDesignMd(
      makeDoc({ raw: annotatedColors, tokens: blue })
    )
    expect(out).toContain('  blue-500: "oklch(0.62 0.17 254)"   # #3182F6')
    expect(out).toContain('  fill-brand: "{colors.blue-500}"   # 주요 CTA')
  })

  it("annotates a typography head, not its properties", () => {
    const doc = makeDoc({
      raw: [
        "---",
        "typography:",
        "  display-1:   # 히어로 전용",
        "    fontSize: 56px",
        "---",
        "## Brand & Style",
        "산문.",
      ].join("\n"),
      tokens: tokens({ typography: [{ name: "display-1", size: "56px" }] }),
    })
    const out = toGoogleDesignMd(doc)
    expect(out).toContain("  display-1:   # 히어로 전용\n")
    expect(out).toContain('    fontSize: "56px"\n')
  })

  it("falls back to the sidecar note where no source row exists", () => {
    // Shadows come from body fences, so their comment lives only in the sidecar.
    const doc = makeDoc({
      tokens: tokens({
        elevation: [
          {
            name: "shadow-1",
            value: "0 1px 2px oklch(0 0 0 / 0.04)",
            note: "menu",
          },
        ],
      }),
    })
    expect(toGoogleDesignMd(doc)).toContain(
      'shadow-1: "0 1px 2px oklch(0 0 0 / 0.04)"   # menu'
    )
  })

  it("keeps a quoted alias name intact and finds its comment", () => {
    // 11st and baemin quote digit-led names (`"2xl": 24px`). The source row
    // keeps those quotes while lookups use the bare name, and an alias has no
    // sidecar note to fall back on — so a mismatch loses the comment silently,
    // and re-quoting the authored name publishes a broken key.
    const doc = makeDoc({
      raw: [
        "---",
        "rounded:",
        '  "2xl": 24px',
        '  "3xl": "{rounded.2xl}"   # 풀-스크린 시트',
        "---",
        "## Brand & Style",
        "산문.",
      ].join("\n"),
      tokens: tokens({ radius: [{ name: "2xl", value: "24px", px: 24 }] }),
    })
    const out = toGoogleDesignMd(doc)
    expect(out).toContain('  "3xl": "{rounded.2xl}"   # 풀-스크린 시트')
    expect(out).not.toContain('\\"3xl\\"')
  })

  it("does not read a # inside a quoted value as a comment", () => {
    const doc = makeDoc({
      raw: [
        "---",
        "fonts:",
        '  font-emoji: "Tossface #1"',
        "---",
        "## Brand & Style",
        "산문.",
      ].join("\n"),
    })
    expect(toGoogleDesignMd(doc)).toContain('  font-emoji: "Tossface #1"\n')
  })

  it("still emits frontmatter a YAML parser reads, values unchanged", () => {
    const doc = makeDoc({ raw: annotatedColors, tokens: blue })
    const out = toGoogleDesignMd(doc)
    const fm = parse(out.slice(4, out.indexOf("\n---\n", 4))) as {
      colors: Record<string, string>
    }
    expect(fm.colors["blue-500"]).toBe("oklch(0.62 0.17 254)")
    expect(fm.colors["fill-brand"]).toBe("{colors.blue-500}")
    expect(rulesOf(doc, "error")).toEqual([])
  })
})
