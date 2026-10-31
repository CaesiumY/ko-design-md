import { describe, expect, it } from "vitest"
import { paintableColours } from "./contrast-gradient"
import type { BackgroundImage } from "./contrast-gradient"
import type { Rgba } from "./contrast"

// Inputs are written the way Chromium serialises a COMPUTED `background-image`,
// measured on the sweep's own browser: `var()`, `currentcolor`, `color-mix()`
// and `hsl()` arrive already resolved, `transparent` arrives as
// `rgba(0, 0, 0, 0)`, an `oklch()` stop keeps its own spelling, and a colour
// hint stays a bare length between two stops.

// What computed style reports for a box with nothing but its image set.
const bg = (
  value: string,
  repeat = "repeat",
  clip = "border-box",
  blend = "normal"
): BackgroundImage => ({ value, repeat, clip, blend })

const coloursOf = (image: string, repeat = "repeat"): Array<Rgba> => {
  const got = paintableColours(bg(image, repeat))
  if (got.kind !== "colours") throw new Error(`not enumerable: ${got.kind}`)
  return got.layers.flatMap((layer) => layer.colours)
}

const near = (c: Rgba, r: number, g: number, b: number, a = 1): boolean =>
  Math.abs(c.r - r) < 0.6 &&
  Math.abs(c.g - g) < 0.6 &&
  Math.abs(c.b - b) < 0.6 &&
  Math.abs(c.a - a) < 0.01

const HELD = { kind: "blocked", blocker: "gradient" }

describe("paintableColours", () => {
  it("reports no image as nothing to enumerate", () => {
    expect(paintableColours(bg("none"))).toEqual({ kind: "none" })
  })

  it("contains both end stops and stays between them", () => {
    const colours = coloursOf(
      "linear-gradient(90deg, rgb(0, 0, 0), rgb(255, 255, 255))"
    )
    expect(colours.some((c) => near(c, 0, 0, 0))).toBe(true)
    expect(colours.some((c) => near(c, 255, 255, 255))).toBe(true)
    // A grey ramp is grey in either space: nothing off the neutral axis.
    for (const c of colours) {
      expect(Math.abs(c.r - c.g)).toBeLessThan(0.6)
      expect(Math.abs(c.g - c.b)).toBeLessThan(0.6)
    }
  })

  it("samples BOTH interpolation spaces when the gradient names neither", () => {
    // Red to blue meets in the middle at (127.5, 0, 127.5) in sRGB but well
    // off it in Oklab. Which one Chromium uses by default is not something
    // this side can know, so both paths are in the set.
    const colours = coloursOf("linear-gradient(rgb(255, 0, 0), rgb(0, 0, 255))")
    expect(colours.some((c) => near(c, 127.5, 0, 127.5))).toBe(true)
    expect(colours.some((c) => c.g > 1 || c.r > 140)).toBe(true)
  })

  it("samples only the space a gradient names", () => {
    const colours = coloursOf(
      "linear-gradient(in oklab, rgb(255, 0, 0), rgb(0, 0, 255))"
    )
    expect(colours.some((c) => near(c, 127.5, 0, 127.5))).toBe(false)
  })

  it("holds a hue space, whose path around the wheel is not a straight line", () => {
    expect(
      paintableColours(
        bg("linear-gradient(in hsl, rgb(255, 0, 0), rgb(0, 0, 255))")
      )
    ).toEqual(HELD)
  })

  it("interpolates alpha premultiplied, so a fade to transparent keeps its hue", () => {
    // Straight interpolation would drag the colour towards black on its way
    // to `rgba(0, 0, 0, 0)`; every browser premultiplies instead.
    const colours = coloursOf(
      "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, oklch(1 0 0 / 0.6) 50%, rgba(0, 0, 0, 0) 100%)"
    )
    for (const c of colours.filter((x) => x.a > 0.01)) {
      expect(c.r).toBeGreaterThan(254)
    }
    expect(colours.some((c) => near(c, 255, 255, 255, 0.6))).toBe(true)
    expect(colours.some((c) => c.a === 0)).toBe(true)
  })

  it("reads the colour spellings a computed gradient carries", () => {
    const colours = coloursOf(
      "linear-gradient(135deg, oklch(0.6 0.2 250) 0%, rgb(18, 52, 86) 50%, rgba(1, 2, 3, 0.5) 100%), linear-gradient(color(srgb 0.5 0 0.5), rgb(255, 255, 255))"
    )
    expect(colours.some((c) => near(c, 18, 52, 86))).toBe(true)
    expect(colours.some((c) => near(c, 1, 2, 3, 0.5))).toBe(true)
    expect(colours.some((c) => near(c, 127.5, 0, 127.5))).toBe(true)
  })

  it("ignores a colour hint, which moves where a colour lands but not which", () => {
    const hinted = coloursOf(
      "linear-gradient(rgb(255, 0, 0), 30%, rgb(0, 0, 255))"
    )
    const plain = coloursOf("linear-gradient(rgb(255, 0, 0), rgb(0, 0, 255))")
    expect(hinted).toEqual(plain)
  })

  it("reads stop positions and gradient setup without mistaking them for colours", () => {
    const repeating = coloursOf(
      "repeating-linear-gradient(45deg, rgb(238, 238, 238) 0px, rgb(238, 238, 238) 4px, rgb(255, 255, 255) 4px, rgb(255, 255, 255) 8px)"
    )
    expect(repeating.some((c) => near(c, 238, 238, 238))).toBe(true)
    expect(repeating.some((c) => near(c, 255, 255, 255))).toBe(true)
    expect(
      coloursOf(
        "radial-gradient(circle at 30% 20%, rgba(255, 0, 0, 0.5), rgba(0, 0, 0, 0))"
      ).some((c) => near(c, 255, 0, 0, 0.5))
    ).toBe(true)
    expect(
      coloursOf("conic-gradient(from 90deg, rgb(255, 0, 0), rgb(0, 0, 255))")
        .length
    ).toBeGreaterThan(2)
  })

  it("keeps the layers apart, topmost first, with whether each covers its box", () => {
    const got = paintableColours(
      bg(
        "linear-gradient(to right, oklch(0.9 0 0) 1px, rgba(0, 0, 0, 0) 1px), linear-gradient(rgb(255, 0, 0), rgb(255, 0, 0))",
        "repeat, no-repeat"
      )
    )
    expect(got.kind).toBe("colours")
    if (got.kind !== "colours") return
    expect(got.layers).toHaveLength(2)
    expect(got.layers.map((l) => l.covers)).toEqual([true, false])
    expect(got.layers[1].colours.every((c) => near(c, 255, 0, 0))).toBe(true)
  })

  it("treats a tile as covering its box only when it repeats on both axes", () => {
    const covers = (repeat: string): boolean => {
      const got = paintableColours(
        bg("linear-gradient(rgb(0, 0, 0), rgb(255, 255, 255))", repeat)
      )
      return got.kind === "colours" && got.layers[0].covers
    }
    expect(covers("repeat")).toBe(true)
    expect(covers("round")).toBe(true)
    expect(covers("repeat round")).toBe(true)
    expect(covers("repeat-x")).toBe(false)
    expect(covers("space")).toBe(false)
    expect(covers("repeat no-repeat")).toBe(false)
  })

  it("treats an image clipped short of the border box as not covering it", () => {
    const got = paintableColours(
      bg(
        "linear-gradient(rgb(0, 0, 0), rgb(255, 255, 255))",
        "repeat",
        "content-box"
      )
    )
    expect(got.kind === "colours" && got.layers[0].covers).toBe(false)
  })

  it("holds a layer that blends with what is under it, or paints inside glyphs", () => {
    // `multiply` reads darker on screen than the source-over the caller
    // composites with, so enumerating it could pass what the screen fails.
    // A `text` clip paints the image inside letters, not behind them.
    const ramp = "linear-gradient(rgb(0, 0, 0), rgb(255, 255, 255))"
    expect(
      paintableColours(bg(ramp, "repeat", "border-box", "multiply"))
    ).toEqual(HELD)
    expect(paintableColours(bg(ramp, "repeat", "text"))).toEqual(HELD)
  })

  it("holds an image as `image`, even beside a gradient it could read", () => {
    for (const value of [
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E\"), linear-gradient(rgb(255, 0, 0), rgb(0, 0, 255))",
      // Inside another image function too: what it draws is still a picture.
      'cross-fade(url("a.png"), rgb(0, 0, 0))',
      'image-set(url("a.png") 1x)',
    ]) {
      expect(paintableColours(bg(value, "repeat"))).toEqual({
        kind: "blocked",
        blocker: "image",
      })
    }
  })

  it("holds what it cannot read as `gradient` rather than guessing", () => {
    for (const image of [
      "linear-gradient(color(display-p3 1 0 0), rgb(255, 255, 255))",
      "linear-gradient(rgb(64, 149, 191), lab(50 20 30))",
      // A keyword where a colour function belongs. Computed style never
      // writes one, which is exactly why it is not read as setup either: a
      // first stop mistaken for a direction would drop a colour from the set.
      "linear-gradient(red, rgb(0, 0, 255))",
      "linear-gradient(rgb(0, 0, 0)",
    ]) {
      expect(paintableColours(bg(image))).toEqual(HELD)
    }
  })
})
