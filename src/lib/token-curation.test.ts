import { describe, expect, it } from "vitest"
import {
  colorChroma,
  curateColors,
  isAlphaColor,
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

  it("treats non-oklch values as chromatic", () => {
    expect(colorChroma("#ff0000")).toBe(1)
  })

  it("detects an alpha channel", () => {
    expect(isAlphaColor("oklch(0.26 0.01 273 / 0.88)")).toBe(true)
    expect(isAlphaColor("oklch(0.62 0.18 254)")).toBe(false)
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

  it("falls back to the first few swatches for a fully neutral (monochrome) palette", () => {
    // 20 grayscale steps, every one below NEUTRAL_CHROMA → zero chromatic
    // signature. The card must still open with something, not an empty headline.
    const colors = Array.from({ length: 20 }, (_, i) =>
      c(`gray-${(i + 1) * 50}`, `oklch(${0.05 + i * 0.045} 0 0)`),
    )
    const { visible, hidden } = curateColors(colors)
    expect(visible.length).toBe(8) // COLORS_FALLBACK
    expect(visible[0]?.name).toBe("gray-50") // document order preserved
    expect(hidden.length).toBe(12)
  })

  it("caps the signature set and collapses the overflow", () => {
    // 30 distinct named (no hyphen-number suffix) chromatic hues
    const colors = Array.from({ length: 30 }, (_, i) =>
      c(`tone${i}`, `oklch(0.6 0.2 ${i * 12})`),
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
