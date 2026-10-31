/**
 * Every colour a computed `background-image` can paint, without knowing where.
 *
 * The contrast sweep reads colour from computed style, never from pixels, and
 * that is what makes its recorded counts repeat to the row: it does not stop
 * animations (the gate's own decision, #390), so a skeleton shimmer read off
 * the screen would land on a different frame every run. A gradient is
 * therefore read the same way — as the set of colours it is able to put
 * behind the text, from its stops and the path between them. Where the text
 * sits along it is left unknown on purpose: `contrast.ts` judges a reading
 * only when every colour in the set agrees, and holds it otherwise (#402).
 *
 * Positions, angles and colour hints are skipped for the same reason. They
 * decide where a colour lands, not which colours there are.
 *
 * Anything this cannot enumerate is answered with the reason it stays held,
 * never with a partial set — a stop dropped from the set is a colour the
 * verdict never saw, which is a false pass waiting to happen.
 */
import { oklabToRgb, parseOklch, rgbToOklab } from "./oklch-convert"
import type { Oklab } from "./oklch-convert"
import type { Rgba } from "./contrast"

/**
 * One element's `background-*` longhands as computed style writes them. Every
 * field but `value` is a list the browser repeats to the number of images.
 */
export interface BackgroundImage {
  value: string
  repeat: string
  /** `background-clip`: how much of the box an image reaches. */
  clip: string
  /** `background-blend-mode`: how an image mixes with what is under it. */
  blend: string
}

export interface ImageLayer {
  /** Deduplicated; channels on [0, 255], alpha on [0, 1]. */
  colours: Array<Rgba>
  /**
   * Whether the tile is guaranteed to cover the whole box. When it is not,
   * the box also shows its background colour with no image on it, and the
   * caller has to count that as one more colour the text can sit on.
   */
  covers: boolean
  /**
   * Whether `background-clip` stops short of the border box. The box's own
   * colour is clipped by the same longhand, so in the band left over the
   * element may paint nothing at all and show what is beneath it.
   */
  clipped: boolean
}

export type PaintedImage =
  | { kind: "none" }
  /** Topmost first, the order `background-image` lists its layers. */
  | { kind: "colours"; layers: Array<ImageLayer> }
  | { kind: "blocked"; blocker: "image" | "gradient" }

/**
 * Points sampled on each run between two stops, per space. Contrast moves
 * smoothly along the path, so what sampling can miss is a sliver at an
 * extremum between two samples — far smaller than the ±0.1 band `judge`
 * leaves around every threshold. Recorded as a Known gap all the same.
 */
const SAMPLES = 16

type Space = "srgb" | "oklab"

interface Stop {
  /** sRGB on [0, 255], already clipped the way the sweep's Chromium paints. */
  rgb: { r: number; g: number; b: number }
  lab: Oklab
  alpha: number
}

const BLOCKED_GRADIENT = { kind: "blocked", blocker: "gradient" } as const

/** The key two colours share when they paint the same 8-bit pixel. */
export const rgbaKey = (c: Rgba): string =>
  [c.r, c.g, c.b, c.a * 255].map((v) => Math.round(v)).join()

// Anything that draws a picture rather than a gradient — `url()` directly or
// inside `image-set()` / `cross-fade()`, or an element or worklet painted in.
const IMAGE =
  /\burl\(|^(?:-webkit-)?(?:image-set|cross-fade)\(|^element\(|^paint\(/

export function paintableColours(image: BackgroundImage): PaintedImage {
  if (image.value.trim() === "none") return { kind: "none" }
  const values = splitTopLevel(image.value)
  const repeats = splitTopLevel(image.repeat)
  const clips = splitTopLevel(image.clip)
  const blends = splitTopLevel(image.blend)
  if (values === null || repeats === null || clips === null || blends === null)
    return BLOCKED_GRADIENT
  // An image is checked across every layer first: it is the stronger reason,
  // and a gradient beside it being readable does not make the box readable.
  if (values.some((v) => IMAGE.test(v))) {
    return { kind: "blocked", blocker: "image" }
  }
  // Each longhand repeats its list to the number of images.
  const at = (list: Array<string>, i: number): string => list[i % list.length]
  const layers: Array<ImageLayer> = []
  for (const [i, value] of values.entries()) {
    // Anything but `normal` mixes the image with what is under it, which the
    // source-over the caller composites with does not reproduce: `multiply`
    // would read darker than the screen. And an image clipped to `text` paints
    // inside glyphs, so it is not a backdrop at all — counting its colours as
    // one would leave the real backdrop out of the set.
    if (at(blends, i) !== "normal" || at(clips, i) === "text") {
      return BLOCKED_GRADIENT
    }
    const colours = gradientColours(value)
    if (colours === null) return BLOCKED_GRADIENT
    // Clipped short of the border box, the image leaves a band of the box it
    // does not reach — one more place the text could sit on the bare colour.
    const clipped = at(clips, i) !== "border-box"
    layers.push({ colours, covers: tiles(at(repeats, i)) && !clipped, clipped })
  }
  return { kind: "colours", layers }
}

/** Repeating on both axes, with or without `round` rescaling, fills the box. */
function tiles(repeat: string): boolean {
  const axes = repeat.trim().split(/\s+/)
  return axes.every((axis) => axis === "repeat" || axis === "round")
}

const GRADIENT =
  /^(?:repeating-)?(?:linear|radial|conic)-gradient\(([\s\S]*)\)$/

function gradientColours(value: string): Array<Rgba> | null {
  const m = GRADIENT.exec(value)
  if (m === null) return null
  const args = splitTopLevel(m[1])
  if (args === null || args.length === 0) return null

  let spaces: Array<Space> = ["srgb", "oklab"]
  const stops: Array<Stop> = []
  for (const [i, arg] of args.entries()) {
    if (COLOUR_FUNCTION.test(arg)) {
      const stop = readStop(arg)
      if (stop === null) return null
      stops.push(stop)
      continue
    }
    if (HINT.test(arg)) continue
    // Only the first argument may set the gradient up, and only in words the
    // grammar has. A keyword colour there — which computed style never writes,
    // but a hand-built input could — would otherwise be skipped as setup.
    if (i !== 0 || !isSetup(arg)) return null
    const named = /\bin\s+([a-z-]+)/.exec(arg)
    if (named !== null) {
      if (named[1] !== "srgb" && named[1] !== "oklab") return null
      spaces = [named[1]]
    }
  }
  if (stops.length === 0) return null

  // Which space Chromium interpolates in when the gradient names none is not
  // knowable from here (the spec's default turns on whether every stop is a
  // legacy colour), so both paths are walked and the union is the answer. It
  // widens the set a little, which can only hold a reading, never pass one.
  const out: Array<Rgba> = []
  const seen = new Set<string>()
  const add = (c: Rgba): void => {
    const key = rgbaKey(c)
    if (seen.has(key)) return
    seen.add(key)
    out.push(c)
  }
  add(toRgba(stops[0]))
  for (let s = 1; s < stops.length; s++) {
    for (const space of spaces) {
      for (let k = 1; k <= SAMPLES; k++) {
        add(mix(stops[s - 1], stops[s], k / SAMPLES, space))
      }
    }
  }
  return out
}

const toRgba = (s: Stop): Rgba => ({ ...s.rgb, a: s.alpha })

/**
 * One point on the path between two stops. Alpha is interpolated
 * premultiplied, as every browser does: a fade to `rgba(0, 0, 0, 0)` keeps
 * the other stop's hue rather than passing through grey.
 */
function mix(p: Stop, q: Stop, t: number, space: Space): Rgba {
  const a = p.alpha + (q.alpha - p.alpha) * t
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }
  const lerp = (x: number, y: number): number =>
    (x * p.alpha * (1 - t) + y * q.alpha * t) / a
  if (space === "srgb") {
    return {
      r: lerp(p.rgb.r, q.rgb.r),
      g: lerp(p.rgb.g, q.rgb.g),
      b: lerp(p.rgb.b, q.rgb.b),
      a,
    }
  }
  const rgb = oklabToRgb({
    L: lerp(p.lab.L, q.lab.L),
    a: lerp(p.lab.a, q.lab.a),
    b: lerp(p.lab.b, q.lab.b),
  })
  return { ...rgb, a }
}

const COLOUR_FUNCTION = /^[a-z-]+\(/
// A stop position or a colour hint on its own: a number with an optional unit.
const HINT = /^-?[\d.]+(?:%|[a-z]+)?$/
const SETUP_WORDS = new Set([
  "to",
  "top",
  "bottom",
  "left",
  "right",
  "center",
  "at",
  "from",
  "in",
  "circle",
  "ellipse",
  "closest-side",
  "closest-corner",
  "farthest-side",
  "farthest-corner",
  // Interpolation spaces and hue methods: read above, and any space other
  // than the two this walks is refused there.
  "srgb",
  "srgb-linear",
  "display-p3",
  "a98-rgb",
  "prophoto-rgb",
  "rec2020",
  "lab",
  "oklab",
  "xyz",
  "xyz-d50",
  "xyz-d65",
  "hsl",
  "hwb",
  "lch",
  "oklch",
  "shorter",
  "longer",
  "increasing",
  "decreasing",
  "hue",
])

function isSetup(arg: string): boolean {
  return arg
    .split(/\s+/)
    .every((word) => SETUP_WORDS.has(word) || HINT.test(word))
}

/** A colour stop — one colour and up to two positions after it. */
function readStop(arg: string): Stop | null {
  const close = arg.indexOf(")")
  if (close === -1) return null
  const rest = arg.slice(close + 1).trim()
  if (rest !== "" && !rest.split(/\s+/).every((w) => HINT.test(w))) {
    return null
  }
  return readColour(arg.slice(0, close + 1))
}

/**
 * The spellings Chromium writes in a computed gradient, measured on the
 * sweep's browser. Anything else — `lab()`, `color(display-p3 …)` — is refused
 * and the reading stays held, so a spelling the catalogue starts using shows
 * up as a hold in the counts rather than as a colour read wrong.
 */
function readColour(text: string): Stop | null {
  const legacy =
    /^rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\s*\)$/.exec(
      text
    )
  if (legacy !== null) {
    const rgb = { r: +legacy[1], g: +legacy[2], b: +legacy[3] }
    return { rgb, lab: rgbToOklab(rgb), alpha: alphaOf(legacy[4]) }
  }
  const oklch = parseOklch(text)
  if (oklch !== null) {
    return {
      rgb: oklabToRgb(oklch.lab),
      lab: oklch.lab,
      alpha: oklch.alpha ?? 1,
    }
  }
  const oklab =
    /^oklab\(\s*([\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)$/.exec(
      text
    )
  if (oklab !== null) {
    const lab = { L: +oklab[1], a: +oklab[2], b: +oklab[3] }
    return { rgb: oklabToRgb(lab), lab, alpha: alphaOf(oklab[4]) }
  }
  const srgb =
    /^color\(srgb\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)$/.exec(
      text
    )
  if (srgb !== null) {
    const channel = (v: string): number => Math.min(255, Math.max(0, +v * 255))
    const rgb = {
      r: channel(srgb[1]),
      g: channel(srgb[2]),
      b: channel(srgb[3]),
    }
    return { rgb, lab: rgbToOklab(rgb), alpha: alphaOf(srgb[4]) }
  }
  return null
}

const alphaOf = (text: string | undefined): number =>
  text === undefined ? 1 : Math.min(1, Math.max(0, Number(text)))

/**
 * Split on the commas that separate list items, not the ones inside a colour
 * function or a quoted `url("data:…,…")`. `null` when the brackets or quotes
 * do not balance, which is a value this should not try to read.
 */
function splitTopLevel(text: string): Array<string> | null {
  const parts: Array<string> = []
  let depth = 0
  let quote: string | null = null
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quote !== null) {
      if (ch === "\\") i++
      else if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") quote = ch
    else if (ch === "(") depth++
    else if (ch === ")") {
      depth--
      if (depth < 0) return null
    } else if (ch === "," && depth === 0) {
      parts.push(text.slice(start, i).trim())
      start = i + 1
    }
  }
  if (depth !== 0 || quote !== null) return null
  parts.push(text.slice(start).trim())
  return parts
}
