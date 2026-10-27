// sRGB ↔ Oklab and Oklab ↔ Oklch, each in both directions, and the ΔE between
// two Oklab colours.
//
// The forward transform (hex → Oklab → Oklch) is shared by the draft validator
// (gates new entries) and `./oklch-audit` (behind `scripts/audit-oklch.ts`,
// gates the committed catalogue) for the same reason `./oklch-tolerance` is:
// they answer one question — "does this OKLCH decode to its annotated hex?" — so
// a second copy of the maths is a second answer waiting to drift. Keeping the
// bound shared while duplicating the transform it is applied to would only move
// the divergence one step down.
//
// The contrast pair classifier (`./contrast-pairs`) uses both directions: it
// composites a translucent token over a background the way the contrast
// collector composites a reading — through the inverse `oklabToRgb` (Oklab →
// sRGB, clipped to the cube) — and compares the result in Oklab through the
// forward transform. A wrong constant in the inverse would fail no validator;
// it would silently change which rows the classification tables in
// `docs/preview-contrast-baseline.md` count as published colours, and moving a
// row between classes leaves every sum those tables are checked against as it
// was. The round trip in `oklch-convert.test.ts` (hex → Oklab → the same 8-bit
// channels) holds the inverse to the forward transform.

export interface Oklab {
  L: number
  a: number
  b: number
}

/** sRGB transfer function, undoing the gamma encoding before the matrices. */
export const srgbToLinear = (c: number): number =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

/**
 * Hex → Oklab, plus the alpha channel when the hex carries one.
 * Accepts #RGB, #RGBA, #RRGGBB, #RRGGBBAA. `null` when unparseable.
 */
export function hexToOklab(
  hex: string
): { lab: Oklab; alpha: number | null } | null {
  let h = hex.replace("#", "")
  // Shorthand expands by doubling each digit: #RGB(A) → #RRGGBB(AA).
  if (h.length === 3 || h.length === 4) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("")
  }
  const alpha = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : null
  if (h.length === 8) h = h.slice(0, 6)
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return null

  return { lab: rgbToOklab(channelsOf(h)), alpha }
}

const channelsOf = (h: string): { r: number; g: number; b: number } => ({
  r: parseInt(h.slice(0, 2), 16),
  g: parseInt(h.slice(2, 4), 16),
  b: parseInt(h.slice(4, 6), 16),
})

/**
 * `#rrggbb` → its three 8-bit channels; `null` for any other spelling. The
 * contrast collector writes every reading this way (`toHex`).
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const h = /^#([0-9a-f]{6})$/i.exec(hex)?.[1]
  return h === undefined ? null : channelsOf(h)
}

/**
 * sRGB channels on [0, 255] → Oklab. Channels need not be whole numbers: a
 * composite computed in the reals can be compared before it is rounded.
 */
export function rgbToOklab(c: { r: number; g: number; b: number }): Oklab {
  const r = srgbToLinear(c.r / 255)
  const g = srgbToLinear(c.g / 255)
  const b = srgbToLinear(c.b / 255)
  // Linear sRGB → LMS → cube root → Oklab (Björn Ottosson's D65 matrices).
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  }
}

/** The sRGB gamma encoding, `srgbToLinear` run backwards. */
const linearToSrgb = (c: number): number =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055

/**
 * Oklab → sRGB channels on [0, 255], unrounded — the inverse of `hexToOklab`'s
 * transform. A colour outside sRGB is clipped to the cube, the way the browser
 * paints it, rather than gamut-mapped. Used to composite a translucent token
 * the same way the contrast collector composites a reading
 * (`contrast-pairs.ts`).
 */
export function oklabToRgb(lab: Oklab): { r: number; g: number; b: number } {
  const l = (lab.L + 0.3963377774 * lab.a + 0.2158037573 * lab.b) ** 3
  const m = (lab.L - 0.1055613458 * lab.a - 0.0638541728 * lab.b) ** 3
  const s = (lab.L - 0.0894841775 * lab.a - 1.291485548 * lab.b) ** 3
  const channel = (v: number): number =>
    255 * linearToSrgb(Math.min(1, Math.max(0, v)))
  return {
    r: channel(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: channel(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: channel(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  }
}

/** Oklab → Oklch. Hue is reported in degrees on [0, 360). */
export function oklabToLch(lab: Oklab): { L: number; C: number; H: number } {
  const C = Math.hypot(lab.a, lab.b)
  let H = (Math.atan2(lab.b, lab.a) * 180) / Math.PI
  if (H < 0) H += 360
  return { L: lab.L, C, H }
}

/** Oklch → Oklab, for comparing an authored value against a hex-derived one. */
export const lchToOklab = (L: number, C: number, H: number): Oklab => ({
  L,
  a: C * Math.cos((H * Math.PI) / 180),
  b: C * Math.sin((H * Math.PI) / 180),
})

/**
 * An authored `oklch(L C H)` value → Oklab, plus the alpha written after a `/`
 * (`5%` or `0.05`) when there is one. `null` for anything else — `none`, a
 * percentage lightness (the catalogue writes none), or not OKLCH at all —
 * so a caller can name what it could not read instead of guessing.
 */
export function parseOklch(
  value: string
): { lab: Oklab; alpha: number | null } | null {
  const m =
    /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?)\s*)?\)$/.exec(
      value.trim()
    )
  if (!m) return null
  const [L, C, H] = [m[1], m[2], m[3]].map(Number)
  if (![L, C, H].every(Number.isFinite)) return null
  // An optional group the input skipped is `undefined` at run time, whatever
  // `RegExpExecArray`'s element type says.
  const alphaText = m[4] as string | undefined
  const alpha =
    alphaText === undefined
      ? null
      : Number(alphaText) / (m[5] === "%" ? 100 : 1)
  return { lab: lchToOklab(L, C, H), alpha }
}

/**
 * ΔE — plain Euclidean distance, which is what Oklab was built to make
 * meaningful. Per-component L/C/H bounds mis-scale with chroma; see
 * `./oklch-tolerance` for the calibrated threshold.
 */
export const deltaE = (p: Oklab, q: Oklab): number =>
  Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b)
