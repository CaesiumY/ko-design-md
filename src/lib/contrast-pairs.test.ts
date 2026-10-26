import { describe, expect, it } from "vitest"
import {
  PUBLISHED_PAIR_TOLERANCE,
  pairClass,
  paletteOf,
  parsePairTable,
  readingClass,
  renderPairTable,
  splitColourPairs,
  tallyPairs,
  toleranceBand,
} from "./contrast-pairs"
import { hexToOklab, parseOklch } from "./oklch-convert"
import type { PairTally, Palette, TokenTheme } from "./contrast-pairs"
import type { DedupedFinding, Finding } from "./contrast-report"

// #808080 is oklch(0.6 0 0) to well inside the tolerance (achromatic, so the
// lightness is the cube root of the luminance): the pair every case below
// builds on.
const GREY = "#808080"
const greyLab = hexToOklab(GREY)!.lab

const entry = (
  name: string,
  L: number,
  observed = false,
  theme: TokenTheme = "both"
): Palette["entries"][number] => ({
  name,
  lab: { L, a: 0, b: 0 },
  observed,
  theme,
})

const palette = (...entries: Palette["entries"]): Palette => ({
  entries,
  translucent: [],
  unreadable: [],
})

// Black at 128/255 — what the browser paints for `oklch(0 0 0 / 50%)` — over
// white is 255 × (1 − 128/255) = 127 per channel: `#7f7f7f`. Over `#eeeeee`
// it is 238 × 127/255 = 118.5…, which rounds to `#777777`.
const VEIL: Palette["translucent"][number] = {
  name: "veil",
  paint: { r: 0, g: 0, b: 0, a: 128 / 255 },
  observed: false,
  theme: "both",
}

describe("parseOklch", () => {
  it("reads lightness, chroma and hue into Oklab", () => {
    const got = parseOklch("oklch(0.6 0 0)")
    expect(got?.alpha).toBeNull()
    expect(got?.lab.L).toBeCloseTo(0.6, 10)
    expect(got?.lab.a).toBeCloseTo(0, 10)
  })

  it("agrees with the hex the catalogue annotates", () => {
    const got = parseOklch("oklch(0.6 0 0)")!.lab
    expect(Math.abs(got.L - greyLab.L)).toBeLessThan(0.001)
  })

  it("reports a written alpha, as a fraction or a percentage", () => {
    expect(parseOklch("oklch(0 0 0 / 5%)")?.alpha).toBeCloseTo(0.05, 10)
    expect(parseOklch("oklch(0 0 0 / 0.3)")?.alpha).toBeCloseTo(0.3, 10)
  })

  it("refuses what it cannot read rather than guessing", () => {
    expect(parseOklch("oklch(none 0 0)")).toBeNull()
    expect(parseOklch("#808080")).toBeNull()
  })
})

describe("paletteOf", () => {
  const md = [
    "---",
    "name: 예시",
    "spacing:",
    "  ## 관측(미발행)",
    "  gap: 8px",
    "colors:",
    "  ## 발행 팔레트",
    "  ink: oklch(0.6 0 0)   # #808080",
    "  ## 관측(미발행)",
    "  muted: oklch(0.4 0 0)   # #555555",
    "  veil: oklch(0 0 0 / 5%)   # #0000000D",
    "typography:",
    "  ## 관측(미발행)",
    "---",
    "본문",
  ].join("\n")

  it("marks the tokens under a listed group as observed and the rest as published", () => {
    const got = paletteOf(md, { groups: ["관측(미발행)"] })
    expect(got.entries.map((e) => [e.name, e.observed])).toEqual([
      ["ink", false],
      ["muted", true],
    ])
  })

  it("keeps a translucent token as paint, not as a colour to match directly", () => {
    // A reading is already composited onto what is behind it, so matching it
    // to `oklch(0 0 0 / 5%)` itself would call a shadow tint "black". The
    // token is carried the way the browser paints it — 8-bit channels and an
    // alpha of 5% × 255 = 12.75, rounded to 13/255.
    const got = paletteOf(md, { groups: ["관측(미발행)"] })
    expect(got.entries.map((e) => e.name)).not.toContain("veil")
    expect(got.translucent).toEqual([
      {
        name: "veil",
        paint: { r: 0, g: 0, b: 0, a: 13 / 255 },
        observed: true,
        theme: "both",
      },
    ])
  })

  it("pairs a token only with a dark- twin in the colors map", () => {
    // A `dark-` key in another map is not a colour; it does not make `ink`
    // the light side of anything.
    const md = [
      "---",
      "colors:",
      "  ink: oklch(0.6 0 0)",
      "rounded:",
      "  dark-ink: 4px",
      "---",
    ].join("\n")
    expect(paletteOf(md, {}).entries.map((e) => e.theme)).toEqual(["both"])
  })

  it("reads a token's theme off the catalogue's dark- prefix", () => {
    // `dark-` opens a dark-theme token; an unprefixed token whose `dark-` twin
    // is declared is that twin's light side; any other token serves both.
    const themed = [
      "---",
      "colors:",
      "  ink: oklch(0.6 0 0)",
      "  dark-ink: oklch(0.8 0 0)",
      "  rule: oklch(0.4 0 0)",
      "  veil: oklch(0 0 0 / 5%)",
      "  dark-veil: oklch(1 0 0 / 5%)",
      "  dark-glow: oklch(1 0 0 / 10%)",
      "---",
    ].join("\n")
    const got = paletteOf(themed, {})
    expect(got.entries.map((e) => [e.name, e.theme])).toEqual([
      ["ink", "light"],
      ["dark-ink", "dark"],
      ["rule", "both"],
    ])
    expect(got.translucent.map((t) => [t.name, t.theme])).toEqual([
      ["veil", "light"],
      ["dark-veil", "dark"],
      ["dark-glow", "dark"],
    ])
  })

  it("does not carry a group from another map into colors", () => {
    // `spacing:` opens with the same group title; `ink` sits under its own.
    const got = paletteOf(md, { groups: ["관측(미발행)"] })
    expect(got.entries.find((e) => e.name === "ink")?.observed).toBe(false)
  })

  it("throws when a listed group is not in the colors map", () => {
    // A renamed heading would otherwise reclassify every token under it in
    // silence — the observed column would just shrink.
    expect(() => paletteOf(md, { groups: ["없는 그룹"] })).toThrow(/없는 그룹/)
  })

  it("marks a listed token as observed wherever its group says otherwise", () => {
    // gs-shop marks single tokens — "라이브 실측 · 공식 문서와 불일치" —
    // inside groups that are otherwise published.
    const got = paletteOf(md, { tokens: ["ink"] })
    expect(got.entries.map((e) => [e.name, e.observed])).toEqual([
      ["ink", true],
      ["muted", false],
    ])
  })

  it("throws when a listed token is not in the colors map", () => {
    expect(() => paletteOf(md, { tokens: ["gap"] })).toThrow(/gap/)
  })

  it("names a definition it could not read instead of dropping it", () => {
    const odd = md.replace("oklch(0.4 0 0)", "oklch(none 0 0)")
    expect(paletteOf(odd, {}).unreadable).toEqual(["muted"])
  })

  it("reads only the colors map, not a gradient's first stop elsewhere", () => {
    // `readDefinitions` matches any `name: oklch(` line in the frontmatter, and
    // a `gradients:` row starts with one — nol's are observed CSS values the
    // colors map never declared.
    const withGradient = md.replace(
      "typography:",
      "gradients:\n  sheen: oklch(0.3 0 0) 0%, oklch(0.9 0 0) 100%\ntypography:"
    )
    expect(paletteOf(withGradient, {}).entries.map((e) => e.name)).toEqual([
      "ink",
      "muted",
    ])
  })

  it("places a colour whose value opens with blanks, as the sidecar publishes it", () => {
    // `"  oklch(…)"` is the colour `oklch(…)` to the sidecar, the drift check
    // and `audit:oklch`; the palette places it the same, under its group.
    const padded = md.replace("ink: oklch(0.6 0 0)", 'ink: "  oklch(0.6 0 0)"')
    const groups = { groups: ["관측(미발행)"] }
    expect(paletteOf(padded, groups).entries).toEqual(
      paletteOf(md, groups).entries
    )
    expect(
      paletteOf(padded, { tokens: ["ink"] }).entries.map((e) => [
        e.name,
        e.observed,
      ])
    ).toEqual([
      ["ink", true],
      ["muted", false],
    ])
  })

  it("reads a CRLF checkout the same as an LF one", () => {
    // CLAUDE.md records `w/crlf` working trees on Windows; a heading regex
    // anchored at `$` would keep the `\r` and miss every listed group.
    const crlf = md.replace(/\n/g, "\r\n")
    expect(paletteOf(crlf, { groups: ["관측(미발행)"] })).toEqual(
      paletteOf(md, { groups: ["관측(미발행)"] })
    )
  })
})

describe("readingClass", () => {
  it("is published when a published token is within the tolerance", () => {
    expect(readingClass(GREY, palette(entry("ink", greyLab.L)))).toBe(
      "published"
    )
  })

  it("holds the line at the tolerance", () => {
    const inside = palette(entry("ink", greyLab.L + 0.0019))
    const outside = palette(entry("ink", greyLab.L + 0.0021))
    expect(PUBLISHED_PAIR_TOLERANCE).toBe(0.002)
    expect(readingClass(GREY, inside)).toBe("published")
    expect(readingClass(GREY, outside)).toBeNull()
  })

  it("is observed when only an observed token matches", () => {
    expect(readingClass(GREY, palette(entry("muted", greyLab.L, true)))).toBe(
      "observed"
    )
  })

  it("prefers published when the same value is both", () => {
    // NOL's observed `membership-dia-main` is the published `nol-blue`.
    const both = palette(
      entry("dia", greyLab.L, true),
      entry("blue", greyLab.L, false)
    )
    expect(readingClass(GREY, both)).toBe("published")
  })

  it("is null for a colour no token matches", () => {
    expect(readingClass(GREY, palette(entry("ink", 0.2)))).toBeNull()
  })

  it("is null for a hex it cannot read", () => {
    expect(readingClass("transparent", palette(entry("ink", 0.2)))).toBeNull()
  })
})

describe("pairClass", () => {
  const p = palette(
    entry("white", 1),
    entry("grey", greyLab.L),
    entry("seen", hexToOklab("#555555")!.lab.L, true)
  )

  it("is both-published when both sides are published tokens", () => {
    expect(pairClass(GREY, "#ffffff", p)).toBe("both-published")
  })

  it("is observed-pair when both are tokens and one is observed", () => {
    expect(pairClass("#555555", "#ffffff", p)).toBe("observed-pair")
  })

  it("is one-token when only one side is a token of either kind", () => {
    expect(pairClass("#555555", "#123456", p)).toBe("one-token")
    expect(pairClass(GREY, "#123456", p)).toBe("one-token")
  })

  it("is no-token when neither side is a token", () => {
    expect(pairClass("#123456", "#654321", p)).toBe("no-token")
  })
})

describe("pairClass with a translucent token", () => {
  const withVeil = (veil = VEIL, ...entries: Palette["entries"]): Palette => ({
    ...palette(entry("white", 1), ...entries),
    translucent: [veil],
  })

  it("counts text painted in a published translucent token over a published background as published", () => {
    // The shape of toss's input placeholder — a published translucent text
    // colour (there `fg-quaternary`, navy-900 at 28%) laid over a published
    // fill and read as one opaque colour — with a plain 50% black here.
    expect(pairClass("#7f7f7f", "#ffffff", withVeil())).toBe("both-published")
  })

  it("counts a translucent token the entry observed as observed", () => {
    expect(
      pairClass("#7f7f7f", "#ffffff", withVeil({ ...VEIL, observed: true }))
    ).toBe("observed-pair")
  })

  it("counts an observed background under a published token as observed", () => {
    const p: Palette = {
      ...palette(entry("seen", 1, true)),
      translucent: [VEIL],
    }
    expect(pairClass("#7f7f7f", "#ffffff", p)).toBe("observed-pair")
  })

  it("leaves a mix the palette cannot explain derived", () => {
    // Black at some other alpha — a preview's own `opacity` or `color-mix`.
    expect(pairClass("#999999", "#ffffff", withVeil())).toBe("one-token")
  })

  it("does not lift text over a background that is not a token", () => {
    // The translucent token over `#eeeeee` is exactly `#777777`, but `#eeeeee`
    // is the preview's own colour: the reading is not the brand's.
    expect(pairClass("#777777", "#eeeeee", withVeil())).toBe("no-token")
  })

  it("composites a background over an opaque token of the palette", () => {
    // A translucent fill has no reading behind it in the pair, so what it
    // was laid over can only be one of the entry's opaque tokens.
    expect(pairClass("#ffffff", "#7f7f7f", withVeil())).toBe("both-published")
  })

  it("does not composite text over a palette token other than its own background", () => {
    // The collector composites text over the backdrop it read, nothing else.
    // `#777777` is the veil over `#eeeeee`, a published token here, but the
    // text sits on the published white, where the veil reads `#7f7f7f`.
    const p = withVeil(VEIL, entry("mist", hexToOklab("#eeeeee")!.lab.L))
    expect(pairClass("#777777", "#ffffff", p)).toBe("one-token")
  })

  it("holds the composite to the same tolerance as a direct match", () => {
    // `#808080` sits one unit off the composite `#7f7f7f`: 0.003381… in Oklab
    // (lightness only, both grey). Outside the default 0.002, and the line
    // falls between 0.00338 and 0.00339.
    expect(pairClass("#808080", "#ffffff", withVeil())).toBe("one-token")
    expect(pairClass("#808080", "#ffffff", withVeil(), 0.00338)).toBe(
      "one-token"
    )
    expect(pairClass("#808080", "#ffffff", withVeil(), 0.00339)).toBe(
      "both-published"
    )
  })

  it("prefers published when a reading is an observed token and a published composite", () => {
    const p = withVeil(VEIL, entry("seen", hexToOklab("#7f7f7f")!.lab.L, true))
    expect(pairClass("#7f7f7f", "#ffffff", p)).toBe("both-published")
  })
})

describe("pairClass in a theme", () => {
  // The veil over white reads `#7f7f7f` (see above). Where the veil is one
  // theme's token, a row of the other theme cannot have been painted with it,
  // so the composite is not looked for there — wanted's dark footer once
  // matched a light-only overlay laid over a dark grey this way.
  const veiled = (veil: TokenTheme, white: TokenTheme = "both"): Palette => ({
    ...palette(entry("white", 1, false, white)),
    translucent: [{ ...VEIL, theme: veil }],
  })

  it("composites a token of the row's own theme, or of both", () => {
    expect(
      pairClass("#ffffff", "#7f7f7f", veiled("dark"), undefined, "dark")
    ).toBe("both-published")
    expect(
      pairClass("#ffffff", "#7f7f7f", veiled("light"), undefined, "light")
    ).toBe("both-published")
    expect(
      pairClass("#ffffff", "#7f7f7f", veiled("both"), undefined, "dark")
    ).toBe("both-published")
  })

  it("does not composite a translucent token of the other theme", () => {
    expect(
      pairClass("#ffffff", "#7f7f7f", veiled("light"), undefined, "dark")
    ).toBe("one-token")
    expect(
      pairClass("#7f7f7f", "#ffffff", veiled("dark"), undefined, "light")
    ).toBe("one-token")
  })

  it("does not lay a background over an opaque base of the other theme", () => {
    // White here is a light-only token: a dark row's fill cannot sit on it.
    expect(
      pairClass(
        "#000000",
        "#7f7f7f",
        veiled("both", "light"),
        undefined,
        "dark"
      )
    ).toBe("no-token")
    expect(
      pairClass(
        "#000000",
        "#7f7f7f",
        veiled("both", "light"),
        undefined,
        "light"
      )
    ).toBe("one-token")
  })

  it("still matches a reading to a token of the other theme directly", () => {
    // Only composites are narrowed: a dark row that paints a light-only
    // token's exact value is a choice the preview made, not a coincidence of
    // alpha and base.
    const p = palette(
      entry("white", 1, false, "light"),
      entry("grey", greyLab.L, false, "light")
    )
    expect(pairClass(GREY, "#ffffff", p, undefined, "dark")).toBe(
      "both-published"
    )
  })

  it("narrows an observed token the same way", () => {
    const p: Palette = {
      ...palette(entry("white", 1)),
      translucent: [{ ...VEIL, observed: true, theme: "light" }],
    }
    expect(pairClass("#ffffff", "#7f7f7f", p, undefined, "light")).toBe(
      "observed-pair"
    )
    expect(pairClass("#ffffff", "#7f7f7f", p, undefined, "dark")).toBe(
      "one-token"
    )
  })

  it("looks at every token when no theme is given", () => {
    expect(pairClass("#ffffff", "#7f7f7f", veiled("light"))).toBe(
      "both-published"
    )
  })
})

const row = (over: Partial<DedupedFinding>): DedupedFinding => ({
  slug: "toss",
  theme: "light",
  state: "default",
  kind: "text",
  path: "p",
  sample: "글",
  ratio: 3,
  threshold: 4.5,
  verdict: "fail",
  blockers: [],
  opacityApprox: false,
  fg: GREY,
  bg: "#ffffff",
  widths: [375],
  occurrences: 1,
  ...over,
})

describe("tallyPairs", () => {
  const p = palette(entry("white", 1), entry("grey", greyLab.L))

  it("counts the rows of one verdict by slug and kind, across themes", () => {
    const got = tallyPairs(
      [
        row({}),
        row({ theme: "dark" }),
        row({ fg: "#123456" }),
        row({ kind: "non-text" }),
        row({ verdict: "borderline" }),
        row({ slug: "baemin", fg: "#123456", bg: "#654321" }),
      ],
      () => p,
      "fail"
    )
    expect(got).toEqual<Array<PairTally>>([
      {
        slug: "baemin",
        kind: "text",
        bothPublished: 0,
        observedPair: 0,
        oneToken: 0,
        noToken: 1,
        total: 1,
      },
      {
        slug: "toss",
        kind: "text",
        bothPublished: 2,
        observedPair: 0,
        oneToken: 1,
        noToken: 0,
        total: 3,
      },
      {
        slug: "toss",
        kind: "non-text",
        bothPublished: 1,
        observedPair: 0,
        oneToken: 0,
        noToken: 0,
        total: 1,
      },
    ])
  })
})

describe("tallyPairs in a theme", () => {
  it("classifies each row in its own theme", () => {
    const veiled: Palette = {
      ...palette(entry("white", 1)),
      translucent: [{ ...VEIL, theme: "light" }],
    }
    const got = tallyPairs(
      [
        row({ fg: "#ffffff", bg: "#7f7f7f" }),
        row({ theme: "dark", fg: "#ffffff", bg: "#7f7f7f" }),
      ],
      () => veiled,
      "fail"
    )
    expect(got.map((t) => [t.bothPublished, t.oneToken])).toEqual([[1, 1]])
  })
})

describe("toleranceBand", () => {
  const p = palette(entry("grey", greyLab.L))

  it("counts the readings of one verdict and those whose nearest token sits in the band", () => {
    const near = palette(entry("grey", greyLab.L + 0.003))
    const got = toleranceBand(
      [row({}), row({ verdict: "borderline" })],
      () => near,
      "fail",
      [0.002, 0.005]
    )
    // One fail row, two readings: #808080 at 0.003 (in), #ffffff far (out).
    expect(got).toEqual({ readings: 2, inBand: 1, compositeInBand: 0 })
  })

  it("leaves out a reading that matches a token, and one with no token near", () => {
    expect(toleranceBand([row({})], () => p, "fail", [0.002, 0.005])).toEqual({
      readings: 2,
      inBand: 0,
      compositeInBand: 0,
    })
  })

  it("counts a reading whose nearest translucent composite sits in the band", () => {
    // The veil over white is `#7f7f7f`; `#808080` is 0.00338 from it (see the
    // composite tolerance test above) and matches no opaque token here. A
    // reading the composite does match (`#7f7f7f`) is not in the band.
    const veiled: Palette = {
      ...palette(entry("white", 1)),
      translucent: [VEIL],
    }
    const got = toleranceBand(
      [row({ fg: "#808080" }), row({ fg: "#7f7f7f" })],
      () => veiled,
      "fail",
      [0.002, 0.005]
    )
    expect(got).toEqual({ readings: 4, inBand: 0, compositeInBand: 1 })
  })

  it("counts a composite in the band only in the row's own theme", () => {
    // `#808080` sits 0.00338 from the light-only veil over white: in the band
    // for a light row, not looked for at all in a dark one.
    const veiled: Palette = {
      ...palette(entry("white", 1)),
      translucent: [{ ...VEIL, theme: "light" }],
    }
    const band = (theme: "light" | "dark") =>
      toleranceBand(
        [row({ theme, fg: "#808080" })],
        () => veiled,
        "fail",
        [0.002, 0.005]
      ).compositeInBand
    expect(band("light")).toBe(1)
    expect(band("dark")).toBe(0)
  })

  it("decides which readings no token matches with the band's own lower edge", () => {
    // `#808080` is 0.0015 from `grey` here and 0.00338 from the veil over
    // white. With the band at 0.002 the token matches it, so neither count
    // takes it; with the band at 0.001 it is in both.
    const nearGrey: Palette = {
      ...palette(entry("white", 1), entry("grey", greyLab.L + 0.0015)),
      translucent: [VEIL],
    }
    const band = (lo: number) =>
      toleranceBand([row({})], () => nearGrey, "fail", [lo, 0.005])
    expect(band(0.002)).toEqual({ readings: 2, inBand: 0, compositeInBand: 0 })
    expect(band(0.001)).toEqual({ readings: 2, inBand: 1, compositeInBand: 1 })
  })
})

describe("the pair table", () => {
  const tally: Array<PairTally> = [
    {
      slug: "toss",
      kind: "text",
      bothPublished: 2,
      observedPair: 1,
      oneToken: 1,
      noToken: 0,
      total: 4,
    },
  ]

  it("round-trips through its writer", () => {
    expect(parsePairTable(renderPairTable(tally))).toEqual(tally)
  })

  it("refuses a row whose columns do not add up to its total", () => {
    const bad = renderPairTable(tally).replace("| 4 |", "| 5 |")
    expect(() => parsePairTable(bad)).toThrow(/toss text/)
  })

  it("refuses a slug and kind written twice", () => {
    // A merge that keeps both the old and the new row: folded into a map, the
    // last one would win and the totals check would compare only it.
    const twice = `${renderPairTable(tally)}\n| toss | text | 1 | 0 | 0 | 0 | 1 |`
    expect(() => parsePairTable(twice)).toThrow(/toss text.*twice/)
  })

  it("refuses a kind that is not text or non-text", () => {
    const bad = renderPairTable(tally).replace(
      "| toss | text |",
      "| toss | txt |"
    )
    expect(() => parsePairTable(bad)).toThrow(/kind/)
  })

  it("refuses a blank count rather than reading it as zero", () => {
    const bad = renderPairTable(tally).replace(
      "| toss | text | 2 |",
      "| toss | text |  |"
    )
    expect(() => parsePairTable(bad)).toThrow(/whole number/)
  })

  it("refuses a row with the wrong number of cells", () => {
    const bad = renderPairTable(tally).replace("| 4 |", "| 4 | 9 |")
    expect(() => parsePairTable(bad)).toThrow(/cells/)
  })

  it("refuses a header it does not know", () => {
    const bad = renderPairTable(tally).replace("one-token", "one")
    expect(() => parsePairTable(bad)).toThrow(/header/)
  })
})

describe("splitColourPairs", () => {
  const raw = (width: number, over: Partial<Finding> = {}): Finding => {
    const { widths: _w, occurrences: _o, ...rest } = row({})
    return { ...rest, width, ...over }
  }

  it("is empty when every folded row kept one colour pair", () => {
    expect(splitColourPairs([raw(375), raw(768)])).toEqual([])
  })

  it("names a row whose widths read different pairs at the same ratio", () => {
    // `keyOf` leaves the pair out of the fold, so this would otherwise be
    // classified by whichever width came first.
    const got = splitColourPairs([raw(375), raw(768, { bg: "#fefefe" })])
    expect(got).toHaveLength(1)
    expect(got[0]).toContain("toss")
  })
})
