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
import type { PairTally, Palette } from "./contrast-pairs"
import type { DedupedFinding, Finding } from "./contrast-report"

// #808080 is oklch(0.6 0 0) to well inside the tolerance (achromatic, so the
// lightness is the cube root of the luminance): the pair every case below
// builds on.
const GREY = "#808080"
const greyLab = hexToOklab(GREY)!.lab

const entry = (
  name: string,
  L: number,
  observed = false
): Palette["entries"][number] => ({
  name,
  lab: { L, a: 0, b: 0 },
  observed,
})

const palette = (...entries: Palette["entries"]): Palette => ({
  entries,
  unreadable: [],
})

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

  it("leaves out a translucent token, which no composited reading can equal", () => {
    expect(paletteOf(md, {}).entries.map((e) => e.name)).not.toContain("veil")
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
    expect(got).toEqual({ readings: 2, inBand: 1 })
  })

  it("leaves out a reading that matches a token, and one with no token near", () => {
    expect(toleranceBand([row({})], () => p, "fail", [0.002, 0.005])).toEqual({
      readings: 2,
      inBand: 0,
    })
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
