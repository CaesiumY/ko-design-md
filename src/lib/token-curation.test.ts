import { describe, expect, it } from "vitest"
import {
  colorChroma,
  curateColors,
  isAlphaColor,
  lightTokensOnly,
  rampAnchors,
  rampStep,
} from "./token-curation"
import type { ColorToken } from "./content-types"

const c = (name: string, value: string, group?: string): ColorToken => ({
  name,
  value,
  ...(group ? { group } : {}),
})

describe("rampStep", () => {
  it("parses 1–4 digit scale steps", () => {
    expect(rampStep("gray-100")).toEqual({ family: "gray", step: 100 })
    expect(rampStep("blue-50")).toEqual({ family: "blue", step: 50 })
    // 4-digit steps must be recognized so they collapse with their ramp
    expect(rampStep("gray-1000")).toEqual({ family: "gray", step: 1000 })
    expect(rampStep("carrot-1000")).toEqual({ family: "carrot", step: 1000 })
    expect(rampStep("gradient-stop-2")).toEqual({
      family: "gradient-stop",
      step: 2,
    })
  })

  it("parses unhyphenated steps, as baemin's deployed palette names them", () => {
    // www.baemin.com ships `--ref-color-mint8`, `--ref-color-gray12`; the
    // catalogue keeps those upstream names, so the ramp has no hyphen.
    expect(rampStep("mint8")).toEqual({ family: "mint", step: 8 })
    expect(rampStep("gray12")).toEqual({ family: "gray", step: 12 })
  })

  it("returns null for named (non-numbered) tokens", () => {
    expect(rampStep("primary")).toBeNull()
    expect(rampStep("service-amazon")).toBeNull()
    expect(rampStep("brand-navy")).toBeNull()
  })
})

describe("colorChroma / isAlphaColor", () => {
  it("reads the OKLCH chroma component", () => {
    expect(colorChroma("oklch(0.62 0.18 254)")).toBeCloseTo(0.18)
    expect(colorChroma("oklch(0.971 0 0)")).toBe(0)
  })

  it("reads lch chroma (2nd component), incl. explicit + sign", () => {
    expect(colorChroma("lch(52% 40 30)")).toBeCloseTo(40)
    // CSS <number> permits an explicit leading "+"
    expect(colorChroma("lch(52% +40 30)")).toBeCloseTo(40)
  })

  it("computes oklab chroma as hypot(a, b), not the bare a component", () => {
    // a small, b large → a saturated hue. The 2nd component alone (0.02) would
    // wrongly read as neutral; real chroma = hypot(0.02, 0.20) ≈ 0.201.
    expect(colorChroma("oklab(0.6 0.02 0.20)")).toBeCloseTo(0.201, 2)
    // a-dominant with a negative b axis
    expect(colorChroma("oklab(0.7 0.15 -0.05)")).toBeCloseTo(0.158, 2)
    // CSS permits explicit "+" signs on the a/b axes
    expect(colorChroma("oklab(0.6 +0.02 +0.20)")).toBeCloseTo(0.201, 2)
  })

  it("treats non-oklch values as chromatic", () => {
    expect(colorChroma("#ff0000")).toBe(1)
  })

  it("detects an alpha channel", () => {
    expect(isAlphaColor("oklch(0.26 0.01 273 / 0.88)")).toBe(true)
    expect(isAlphaColor("oklch(0.62 0.18 254)")).toBe(false)
  })

  // Both CSS alpha spellings, because the catalogue uses both and only the
  // number form was once matched: `yeogi` writes 27 of its overlays as `%` and
  // `class101` 6, and every one of them read as an opaque signature colour and
  // took a slot in the visible palette a brand hue should have had.
  it("detects a percentage alpha channel", () => {
    expect(isAlphaColor("oklch(0.62 0.18 254 / 50%)")).toBe(true)
    expect(isAlphaColor("oklch(0.680 0.042 285 / 8%)")).toBe(true)
    // A bare percentage elsewhere in the value is not an alpha channel —
    // `lch()` states lightness that way, and those are opaque.
    expect(isAlphaColor("lch(52% 40 30)")).toBe(false)
  })
})

describe("rampAnchors", () => {
  it("keeps one median step per family", () => {
    const anchors = rampAnchors([
      c("blue-100", "x"),
      c("blue-300", "x"),
      c("blue-500", "x"),
      c("blue-700", "x"),
      c("blue-900", "x"),
    ])
    expect([...anchors]).toEqual(["blue-500"])
  })

  it("includes 4-digit steps in the family (so carrot-1000 collapses)", () => {
    // steps [500, 1000] → median index floor((2-1)/2) = 0 → 500
    const anchors = rampAnchors([c("carrot-500", "x"), c("carrot-1000", "x")])
    expect([...anchors]).toEqual(["carrot-500"])
  })
})

describe("curateColors", () => {
  it("keeps chromatic named tokens + ramp anchors, collapses neutrals/alpha/non-anchors", () => {
    const colors = [
      c("primary", "oklch(0.62 0.18 254)"), // chromatic named → signature
      c("accent", "oklch(0.70 0.15 30)"), // chromatic named → signature
      c("blue-100", "oklch(0.92 0.06 254)"), // chromatic ramp, non-anchor → hidden
      c("blue-300", "oklch(0.78 0.12 254)"), // non-anchor → hidden
      c("blue-500", "oklch(0.62 0.18 254)"), // median anchor → signature
      c("blue-700", "oklch(0.50 0.16 254)"), // non-anchor → hidden
      c("blue-900", "oklch(0.40 0.12 254)"), // non-anchor → hidden
      c("gray-100", "oklch(0.88 0 0)"), // neutral → hidden
      c("gray-500", "oklch(0.55 0 0)"), // neutral → hidden
      c("gray-900", "oklch(0.18 0 0)"), // neutral → hidden
      c("overlay", "oklch(0 0 0 / 0.5)"), // alpha → hidden
    ]
    const { visible, hidden } = curateColors(colors)
    const vis = visible.map((v) => v.name)
    expect(vis).toEqual(["primary", "accent", "blue-500"])
    expect(hidden).toHaveLength(8)
    expect(vis).not.toContain("blue-100")
    expect(vis).not.toContain("gray-100")
    expect(vis).not.toContain("overlay")
    // no token is dropped or duplicated
    expect(visible.length + hidden.length).toBe(colors.length)
  })

  it("collapses an unhyphenated ramp to its anchor like a hyphenated one", () => {
    const steps = [1, 2, 3, 4, 5, 6, 7, 8].map((n) =>
      c(`red${n}`, `oklch(${(0.95 - n * 0.08).toFixed(2)} 0.2 25)`)
    )
    const named = [
      c("navy", "oklch(0.30 0.13 286)"),
      c("pink", "oklch(0.66 0.24 4)"),
    ]
    const { visible, hidden } = curateColors([...steps, ...named])
    expect(visible.map((x) => x.name)).toEqual(["red4", "navy", "pink"])
    expect(hidden.map((x) => x.name)).toEqual([
      "red1",
      "red2",
      "red3",
      "red5",
      "red6",
      "red7",
      "red8",
    ])
  })

  it("keeps unhyphenated numbered names that are not a lightness ramp as named colours", () => {
    // zigbang numbers its colours per hue without ordering them by lightness:
    // `orange1` is the accent and `orange2` its near-white tint. Folding them
    // to a median anchor would hide the accent behind the tint.
    const colors = [
      c("orange1", "oklch(0.700 0.202 44)"),
      c("orange2", "oklch(0.980 0.013 64)"),
      c("orange3", "oklch(0.946 0.032 55)"),
      c("navy1", "oklch(0.298 0.090 257)"),
      c("navy2", "oklch(0.937 0.012 248)"),
      // neutral filler so the tail is long enough to stay collapsed
      ...[10, 30, 50, 70, 90, 95, 99].map((n) =>
        c(`gray${n}`, `oklch(${n / 100} 0 0)`)
      ),
    ]
    const { visible, hidden } = curateColors(colors)
    expect(visible.map((x) => x.name)).toEqual(["orange1", "navy1"])
    expect(hidden.map((x) => x.name)).toContain("orange2")
  })

  it("does not read a two-colour unhyphenated pair as a ramp", () => {
    // Two values always move one way, so the lightness test says nothing
    // about a pair. zigbang's `red1`/`red2` are an accent and its tint; had
    // the tint taken number 1, the median anchor would have hidden the accent.
    const colors = [
      c("teal1", "oklch(0.97 0.02 190)"),
      c("teal2", "oklch(0.60 0.15 190)"),
      ...[10, 30, 50, 70, 90, 95, 99].map((n) =>
        c(`gray${n}`, `oklch(${n / 100} 0 0)`)
      ),
    ]
    const { visible } = curateColors(colors)
    expect(visible.map((x) => x.name)).toEqual(["teal2"])
  })

  it("folds a camelCase unhyphenated ramp (greeting's murkyBlue200…)", () => {
    const steps = [100, 200, 300, 400, 500, 600, 700, 800].map((n) =>
      c(`murkyBlue${n}`, `oklch(${(0.95 - n / 1000).toFixed(2)} 0.08 250)`)
    )
    const { visible } = curateColors(steps)
    expect(visible.map((x) => x.name)).toEqual(["murkyBlue400"])
  })

  it("falls back to the first few swatches for a fully neutral (monochrome) palette", () => {
    // 20 grayscale steps, every one below NEUTRAL_CHROMA → zero chromatic
    // signature. The card must still open with something, not an empty headline.
    const colors = Array.from({ length: 20 }, (_, i) =>
      c(`gray-${(i + 1) * 50}`, `oklch(${0.05 + i * 0.045} 0 0)`)
    )
    const { visible, hidden } = curateColors(colors)
    expect(visible.length).toBe(8) // COLORS_FALLBACK
    expect(visible[0]?.name).toBe("gray-50") // document order preserved
    expect(hidden.length).toBe(12)
  })

  it("caps the signature set and collapses the overflow", () => {
    // 30 distinct named (no hyphen-number suffix) chromatic hues
    const colors = Array.from({ length: 30 }, (_, i) =>
      c(`tone${i}`, `oklch(0.6 0.2 ${i * 12})`)
    )
    const { visible, hidden } = curateColors(colors)
    expect(visible.length).toBe(16) // COLORS_CAP
    expect(hidden.length).toBe(14)
  })

  it("inlines a tail of MIN_COLLAPSE or fewer (no near-empty disclosure)", () => {
    const colors = [
      c("primary", "oklch(0.62 0.18 254)"),
      c("accent", "oklch(0.70 0.15 30)"),
      c("gray-500", "oklch(0.55 0 0)"), // lone neutral → tail of 1 ≤ MIN_COLLAPSE
    ]
    const { visible, hidden } = curateColors(colors)
    expect(hidden).toHaveLength(0)
    expect(visible).toHaveLength(3)
  })
})

describe("lightTokensOnly", () => {
  it("drops dark-* prefixed tokens so the card view stays light-only", () => {
    // The sidecar carries the full palette (light + dark) so a token copy can
    // reproduce dark mode, but the card view shows light only — otherwise every
    // near-identical dark swatch doubles the palette. This is the render-layer
    // filter that keeps that split at the component boundary.
    const colors = [
      c("gray-00", "oklch(1 0 0)"),
      c("gray-100", "oklch(0.32 0.007 297)"),
      c("dark-gray-00", "oklch(0.22 0.026 274)", "다크 테마"),
      c("dark-gray-100", "oklch(0.97 0.001 286)", "다크 테마"),
    ]
    expect(lightTokensOnly(colors).map((x) => x.name)).toEqual([
      "gray-00",
      "gray-100",
    ])
  })

  it("drops an unprefixed token under a heading that opens with Dark or 다크", () => {
    // A fixture, not a live entry: every token under such a heading in the
    // catalogue carries `dark-` (toss's "Dark palette", greeting's "dark gray —
    // …", class101's "다크 모드 값 — …"). The heading stands in for an entry that
    // writes its dark palette without the prefix — a name cannot repeat inside
    // one `colors:` map, so the heading is all that marks it.
    const colors = [
      c("canvas", "oklch(1 0 0)", "Palette"),
      c("night-canvas", "oklch(0.15 0 0)", "Dark palette"),
      c(
        "night-ink",
        "oklch(0.95 0 0)",
        "다크 모드 값 — 같은 토큰명의 오버라이드"
      ),
    ]
    expect(lightTokensOnly(colors).map((x) => x.name)).toEqual(["canvas"])
  })

  it("keeps a light token whose group heading only mentions the dark theme", () => {
    // ridi's light role groups read "… — dark- 행은 발행된 다크 짝이나 …" and
    // banksalad's "… 테마 고정 · dark- 짝 없음": prose about the dark twins,
    // over light tokens. Reading the heading anywhere dropped those light role
    // cards once the sidecar carried reference rows. Only a heading that opens
    // with the theme names it.
    const colors = [
      c(
        "background-primary",
        "oklch(1 0 0)",
        "시맨틱 background (층 A) — dark- 행은 발행된 다크 짝이나 미확인"
      ),
      c(
        "dark-background-primary",
        "oklch(0.2 0 0)",
        "시맨틱 background (층 A) — dark- 행은 발행된 다크 짝이나 미확인"
      ),
      c(
        "status-red",
        "oklch(0.6 0.2 25)",
        "status (테마 고정 · dark- 짝 없음)"
      ),
    ]
    expect(lightTokensOnly(colors).map((x) => x.name)).toEqual([
      "background-primary",
      "status-red",
    ])
  })

  it("keeps tokens that merely contain 'dark' but do not start with 'dark-'", () => {
    // socar ships `pressed-dark-regular` as a LIGHT press-ripple token — it must
    // survive the filter. Only the `dark-` *prefix* marks a dark-theme primitive.
    const colors = [
      c("pressed-dark-regular", "oklch(0.2 0.02 265 / 0.09)"),
      c("dark-bg-default", "oklch(0.15 0.02 265)", "Dark"),
    ]
    expect(lightTokensOnly(colors).map((x) => x.name)).toEqual([
      "pressed-dark-regular",
    ])
  })

  it("filters a category that carries no group field at all", () => {
    // ElevationToken has no `group` — the extractor drops an `elevation:` map's
    // `  ## label` lines. The filter must still
    // work on that shape: seed-design publishes s1..s3 alongside dark-s1..s3,
    // the dark trio authored at 50–80% black for a dark canvas. Rendering those
    // on the light-fixed card tiles showed six chips for three tokens.
    const shadows = [
      { name: "s1", value: "0px 1px 4px 0px oklch(0 0 0 / 0.078)" },
      { name: "dark-s1", value: "0px 1px 4px 0px oklch(0 0 0 / 0.502)" },
      { name: "s2", value: "0px 2px 10px 0px oklch(0 0 0 / 0.102)" },
      { name: "dark-s2", value: "0px 2px 10px 0px oklch(0 0 0 / 0.678)" },
    ]
    expect(lightTokensOnly(shadows).map((x) => x.name)).toEqual(["s1", "s2"])
  })
})
