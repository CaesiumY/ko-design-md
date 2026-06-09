import type { ColorToken } from "./content-types"

// Colors lead with a SIGNATURE palette (getdesign.md level) instead of an
// exhaustive dump: brand + accent hues stay visible while grayscale ramps, alpha
// overlays, and every non-anchor scale step collapse behind a disclosure. The
// full palette stays intact in the sidecar / DESIGN.md.
const COLORS_CAP = 16
const COLORS_FALLBACK = 8
const NEUTRAL_CHROMA = 0.04

// An overflow of MIN_COLLAPSE or fewer isn't worth a disclosure — shown inline.
// Shared by color curation here and the flat type/spacing/radius collapse.
export const MIN_COLLAPSE = 6

/**
 * Chroma of a color value. oklch / lch carry chroma directly as the 2nd
 * component; oklab carries Cartesian a/b axes, so its chroma is hypot(a, b) —
 * the bare 2nd component (a) would misread a b-dominant hue as neutral. Non-LCh
 * values (hex, rgb, named) read as chromatic.
 */
export function colorChroma(value: string): number {
  const lch = value.match(/^(?:oklch|lch)\(\s*[\d.]+%?\s+([+-]?[\d.]+)/i)
  if (lch) return Number(lch[1])
  const lab = value.match(/^oklab\(\s*[\d.]+%?\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)/i)
  if (lab) return Math.hypot(Number(lab[1]), Number(lab[2]))
  return 1
}

/** Semi-transparent (`oklch(... / a)`) — an overlay/scrim, not a signature hue. */
export function isAlphaColor(value: string): boolean {
  return /\/\s*[\d.]+\s*\)/.test(value)
}

/** A numbered scale step (`gray-100`, `blue-500`, `gray-1000`) → {family, step}. */
export function rampStep(
  name: string,
): { family: string; step: number } | null {
  // \d{1,4} so 4-digit steps (gray-1000, carrot-1000) collapse with their ramp
  // instead of reading as a standalone named token.
  const m = name.match(/^(.*)-(\d{1,4})$/)
  return m ? { family: m[1], step: Number(m[2]) } : null
}

/**
 * One representative step per numbered ramp family — the step nearest the
 * family's median (≈the 400–500 "base" of a 50→900 scale). The anchor stands in
 * for the whole hue in the signature palette; the rest of the ladder collapses.
 */
export function rampAnchors(colors: Array<ColorToken>): Set<string> {
  const fams = new Map<string, Array<{ name: string; step: number }>>()
  for (const c of colors) {
    const r = rampStep(c.name)
    if (!r) continue
    const arr = fams.get(r.family) ?? []
    arr.push({ name: c.name, step: r.step })
    fams.set(r.family, arr)
  }
  const anchors = new Set<string>()
  for (const arr of fams.values()) {
    const steps = arr.map((x) => x.step).sort((a, b) => a - b)
    const mid = steps[Math.floor((steps.length - 1) / 2)]
    let best = arr[0]
    let bestDist = Infinity
    for (const x of arr) {
      const d = Math.abs(x.step - mid)
      if (d < bestDist) {
        bestDist = d
        best = x
      }
    }
    anchors.add(best.name)
  }
  return anchors
}

/**
 * Split a palette into the SIGNATURE set (shown) and the long tail (collapsed),
 * so the card leads with a getdesign.md-level headline instead of an exhaustive
 * dump. A color is signature when it's an opaque, chromatic hue that is either a
 * named token (brand/accent/semantic) or the single anchor step of its ramp.
 * Grayscale ramps, alpha overlays, and every non-anchor scale step fall to the
 * tail. The set is capped so even hue-rich systems (vapor-ui's 11 ramps → ~10
 * swatches) stay scannable; a fully neutral palette with no chromatic hue falls
 * back to its first few swatches so the card never opens empty. Document order
 * is preserved — curators list the hero token first. The full palette stays
 * intact in the sidecar / DESIGN.md, one disclosure click away.
 */
export function curateColors(colors: Array<ColorToken>): {
  visible: Array<ColorToken>
  hidden: Array<ColorToken>
} {
  const anchors = rampAnchors(colors)
  const visible: Array<ColorToken> = []
  const hidden: Array<ColorToken> = []
  for (const c of colors) {
    const ramp = rampStep(c.name)
    const signature =
      !isAlphaColor(c.value) &&
      colorChroma(c.value) >= NEUTRAL_CHROMA &&
      !(ramp && !anchors.has(c.name))
    if (signature && visible.length < COLORS_CAP) visible.push(c)
    else hidden.push(c)
  }
  // A monochrome palette yields no chromatic signature — surface the first few
  // rather than an empty headline.
  if (visible.length === 0) {
    visible.push(...hidden.splice(0, Math.min(COLORS_FALLBACK, hidden.length)))
  }
  // A tail of MIN_COLLAPSE or fewer isn't worth a disclosure — inline it.
  if (hidden.length <= MIN_COLLAPSE) visible.push(...hidden.splice(0))
  return { visible, hidden }
}
