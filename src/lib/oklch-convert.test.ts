import { describe, expect, it } from "vitest"
import { deltaE, hexToOklab, lchToOklab, oklabToLch } from "./oklch-convert"
import { DELTA_E_TOLERANCE } from "./oklch-tolerance"

/** Round-trip a hex to the `oklch(L C H)` form tokens are written in. */
const toOklch = (hex: string) => {
  const parsed = hexToOklab(hex)
  if (!parsed) throw new Error(`unparseable: ${hex}`)
  const { L, C, H } = oklabToLch(parsed.lab)
  return { L: +L.toFixed(3), C: +C.toFixed(3), H: Math.round(H) % 360 }
}

describe("hexToOklab", () => {
  it("maps the achromatic endpoints", () => {
    expect(toOklch("#000000")).toMatchObject({ L: 0, C: 0 })
    expect(toOklch("#FFFFFF")).toMatchObject({ L: 1, C: 0 })
  })

  it("reproduces the catalogue's annotated values within the gate's tolerance", () => {
    // Tokens are written at the author's precision (2–3 decimals), so the useful
    // claim is the one the gate makes: the hex decodes to within ΔE of what the
    // md says. A typo'd matrix constant would break this.
    const cases: Array<[string, [number, number, number]]> = [
      ["#06C755", [0.72, 0.205, 149]], // line-design-system linegreen
      ["#949494", [0.67, 0, 0]], // 11st gray-06
      ["#999999", [0.68, 0, 0]], // 11st gray-07
    ]
    for (const [hex, [L, C, H]] of cases) {
      const parsed = hexToOklab(hex)
      expect(parsed).not.toBeNull()
      expect(deltaE(parsed!.lab, lchToOklab(L, C, H))).toBeLessThan(
        DELTA_E_TOLERANCE
      )
    }
  })

  it("reports an arbitrary hue for pure greys", () => {
    // #949494 lands on a≈1e-11, so atan2 returns ~90° rather than 0. Callers must
    // keep the authored hue once chroma rounds to zero instead of "correcting" it
    // to this meaningless number — see the hueIsMeaningless branch in audit-oklch.
    expect(toOklch("#949494").C).toBe(0)
    expect(toOklch("#949494").H).not.toBe(0)
  })

  it("reads alpha only from an 8-digit hex", () => {
    expect(hexToOklab("#000000")?.alpha).toBeNull()
    expect(hexToOklab("#00000008")?.alpha).toBeCloseTo(0.031, 3)
    expect(hexToOklab("#000000b2")?.alpha).toBeCloseTo(0.698, 3)
  })

  it("expands shorthand by doubling each digit", () => {
    expect(toOklch("#FFF")).toEqual(toOklch("#FFFFFF"))
    expect(hexToOklab("#0008")?.alpha).toBe(hexToOklab("#00000088")?.alpha)
  })

  it("rejects malformed input", () => {
    expect(hexToOklab("#12345")).toBeNull()
    expect(hexToOklab("#GGGGGG")).toBeNull()
  })
})

describe("deltaE", () => {
  it("is zero for a value round-tripped through Oklch", () => {
    const parsed = hexToOklab("#06C755")!
    const { L, C, H } = oklabToLch(parsed.lab)
    expect(deltaE(parsed.lab, lchToOklab(L, C, H))).toBeLessThan(1e-12)
  })

  it("barely moves when a near-neutral's hue is wrong", () => {
    // Why the old NEUTRAL_CHROMA special case was unnecessary: as chroma → 0 the
    // a/b coordinates collapse, so hue stops mattering on its own.
    expect(
      deltaE(lchToOklab(0.5, 0.001, 0), lchToOklab(0.5, 0.001, 180))
    ).toBeLessThan(0.01)
  })

  it("moves a lot when a saturated colour's hue is wrong", () => {
    // The same 180° at high chroma is a completely different colour — this is the
    // asymmetry that per-component hue bounds could not express.
    expect(
      deltaE(lchToOklab(0.5, 0.21, 0), lchToOklab(0.5, 0.21, 180))
    ).toBeGreaterThan(0.4)
  })
})
