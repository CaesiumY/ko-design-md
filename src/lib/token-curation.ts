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
  const lab = value.match(
    /^oklab\(\s*[\d.]+%?\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)/i
  )
  if (lab) return Math.hypot(Number(lab[1]), Number(lab[2]))
  return 1
}

/**
 * Semi-transparent (`oklch(... / a)`) — an overlay/scrim, not a signature hue.
 *
 * Both CSS alpha spellings count. `%` is not a stylistic variant the catalog
 * could normalise away: `yeogi` writes 27 of its overlays that way and
 * `class101` 6, and while the number-only form was the one this matched, every
 * one of those read as an opaque signature colour and took a slot in the
 * visible palette that a brand hue should have had.
 */
export function isAlphaColor(value: string): boolean {
  return /\/\s*[\d.]+%?\s*\)/.test(value)
}

/**
 * A numbered scale step (`gray-100`, `blue-500`, `gray-1000`, `mint8`) →
 * {family, step}.
 *
 * The unhyphenated form is a word of letters followed by the number: baemin
 * keeps www.baemin.com's deployed `--ref-color-*` names (`mint8`, `gray12`)
 * and greeting writes `blue100` and `murkyBlue200`. Without it each step read
 * as its own signature colour and filled the headline. The family must be
 * letters only so a name that merely ends in a digit after other parts stays
 * out of it. The name alone does not make it a ramp — `rampMembers` also asks
 * the values (see there).
 */
export function rampStep(
  name: string
): { family: string; step: number } | null {
  const m = name.match(HYPHENATED_STEP) ?? name.match(BARE_STEP)
  return m ? { family: m[1], step: Number(m[2]) } : null
}

// \d{1,4} so 4-digit steps (gray-1000, carrot-1000) collapse with their ramp
// instead of reading as a standalone named token.
const HYPHENATED_STEP = /^(.*)-(\d{1,4})$/
const BARE_STEP = /^([a-z][a-zA-Z]*)(\d{1,4})$/
// A pair always moves one way, so the lightness test below says nothing about
// it: zigbang's `red1`/`red2` are an accent and its tint, not a ramp.
const MIN_BARE_RAMP = 3

const OKLCH_LIGHTNESS = /^oklch\(\s*([\d.]+)(%?)/i

function lightness(value: string): number | null {
  const m = value.match(OKLCH_LIGHTNESS)
  if (!m) return null
  return m[2] === "%" ? Number(m[1]) / 100 : Number(m[1])
}

/**
 * Which colours are steps of a numbered ramp, by name → {family, step}.
 *
 * A hyphenated step (`gray-100`) is a ramp step by its name, as it always was.
 * An unhyphenated one (`mint8`) is only when its family has at least
 * MIN_BARE_RAMP steps and their lightness moves one way, strictly, along the
 * step numbers. The catalogue writes both shapes of unhyphenated name:
 * baemin's `mint1`…`mint8` and greeting's `blue100`…`blue900` are lightness
 * ramps, but zigbang numbers each hue's colours without ordering them
 * (`orange1` is its accent, `orange2` the near-white tint), and folding those
 * to a median step hid the accent behind its tint. A family with a value whose
 * lightness cannot be read is not treated as a ramp.
 */
export function rampMembers(
  colors: Array<ColorToken>
): Map<string, { family: string; step: number }> {
  const out = new Map<string, { family: string; step: number }>()
  const bare = new Map<
    string,
    Array<{ name: string; step: number; l: number | null }>
  >()
  for (const c of colors) {
    const hyphenated = c.name.match(HYPHENATED_STEP)
    if (hyphenated) {
      out.set(c.name, { family: hyphenated[1], step: Number(hyphenated[2]) })
      continue
    }
    const m = c.name.match(BARE_STEP)
    if (!m) continue
    const arr = bare.get(m[1]) ?? []
    arr.push({ name: c.name, step: Number(m[2]), l: lightness(c.value) })
    bare.set(m[1], arr)
  }
  for (const [family, arr] of bare) {
    const ls = [...arr].sort((a, b) => a.step - b.step).map((x) => x.l)
    if (ls.length < MIN_BARE_RAMP || ls.some((l) => l === null)) continue
    const diffs = ls.slice(1).map((l, i) => (l as number) - (ls[i] as number))
    if (!diffs.every((d) => d > 0) && !diffs.every((d) => d < 0)) continue
    for (const x of arr) out.set(x.name, { family, step: x.step })
  }
  return out
}

/**
 * One representative step per numbered ramp family — the step nearest the
 * family's median (≈the 400–500 "base" of a 50→900 scale). The anchor stands in
 * for the whole hue in the signature palette; the rest of the ladder collapses.
 */
export function rampAnchors(colors: Array<ColorToken>): Set<string> {
  return anchorsOf(rampMembers(colors))
}

function anchorsOf(
  members: Map<string, { family: string; step: number }>
): Set<string> {
  const fams = new Map<string, Array<{ name: string; step: number }>>()
  for (const [name, r] of members) {
    const arr = fams.get(r.family) ?? []
    arr.push({ name, step: r.step })
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
  const members = rampMembers(colors)
  const anchors = anchorsOf(members)
  const visible: Array<ColorToken> = []
  const hidden: Array<ColorToken> = []
  for (const c of colors) {
    const ramp = members.get(c.name)
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

// The card filter recognises a dark-theme token two ways:
//   1. name prefix   — seed-design writes `dark-gray-00` against a bare
//      `gray-00`, shadows included (`s1`/`dark-s1`…), the pair this filter
//      most recently missed. codeit prefixes BOTH palettes instead
//      (`light-gray-00` / `dark-gray-00`), which is the reason the test names
//      `dark-` alone: `light-` tokens are light and have to survive it.
//   2. group heading — a defence for an entry that writes its dark palette
//      without the prefix under a heading like `## Dark palette`. No entry does
//      today: the catalogue writes every dark twin with the prefix (#625). Only
//      a heading that OPENS with the theme counts (`Dark palette`, `dark gray —
//      …`, `다크 모드 값 — …`). Matched anywhere, it dropped ridi's and
//      banksalad's light role cards, whose headings merely talk about the
//      dark twins — "… — dark- 행은 …", "… · dark- 짝 없음". A heading that
//      names the theme last (`Semantic alias — Dark`) is not read; the
//      prefix is what covers it.
const DARK_NAME_PREFIX = /^dark-/
const DARK_GROUP = /^\s*(?:dark|다크)(?![a-z])/i

/**
 * The card view is light-only: the sidecar carries both themes (so a token copy
 * reproduces dark mode), but rendering every near-identical dark entry would
 * double the list. This is the render-layer filter that keeps that split at the
 * component boundary — the extractor stays faithful to the source md.
 *
 * The name test is a *prefix*, not a substring, so a light token that merely
 * contains "dark" (socar's `pressed-dark-regular` press-ripple) is kept.
 *
 * Generic over the token shape rather than typed to ColorToken, because the rule
 * belongs to the light-fixed card view, not to colors: every category rendered
 * there has to come through here. Shadows first shipped without it and
 * seed-design drew `dark-s1..s3` — 50–80% black, authored for a dark canvas —
 * on light tiles beside their 8–12% light counterparts. A per-category copy of
 * the filter would have drifted the same way the next time.
 *
 * `group` is optional in the constraint because only ColorToken carries one;
 * for the others the name prefix is the whole test.
 */
export function lightTokensOnly<T extends { name: string; group?: string }>(
  tokens: Array<T>
): Array<T> {
  return tokens.filter(
    (t) => !DARK_NAME_PREFIX.test(t.name) && !DARK_GROUP.test(t.group ?? "")
  )
}
