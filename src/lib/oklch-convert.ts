// sRGB hex → Oklab/Oklch, and the ΔE between two Oklab colours.
//
// Shared by the draft validator (gates new entries) and `scripts/audit-oklch.ts`
// (gates the committed catalogue) for the same reason `./oklch-tolerance` is:
// they answer one question — "does this OKLCH decode to its annotated hex?" — so
// a second copy of the maths is a second answer waiting to drift. Keeping the
// bound shared while duplicating the transform it is applied to would only move
// the divergence one step down.

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

  const r = srgbToLinear(parseInt(h.slice(0, 2), 16) / 255)
  const g = srgbToLinear(parseInt(h.slice(2, 4), 16) / 255)
  const b = srgbToLinear(parseInt(h.slice(4, 6), 16) / 255)
  // Linear sRGB → LMS → cube root → Oklab (Björn Ottosson's D65 matrices).
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return {
    lab: {
      L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    },
    alpha,
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
 * ΔE — plain Euclidean distance, which is what Oklab was built to make
 * meaningful. Per-component L/C/H bounds mis-scale with chroma; see
 * `./oklch-tolerance` for the calibrated threshold.
 */
export const deltaE = (p: Oklab, q: Oklab): number =>
  Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b)
