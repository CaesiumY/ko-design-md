// WCAG 2.x contrast, for the preview audit in `scripts/audit-contrast.ts`.
//
// Everything here is pure and works on sRGB 8-bit channels, because that is
// what the browser hands back: the collector paints each computed colour onto a
// canvas and reads the pixel, so no OKLCH, `color-mix()` or `var()` chain ever
// reaches this file. That split is deliberate — Chromium resolves
// `color-mix(in oklab, ...)` to an `oklab()` string in computed style, and the
// catalogue has no OKLCH-to-sRGB transform to parse it with
// (`./oklch-convert` only goes the other way).

import { srgbToLinear } from "./oklch-convert"

/** An opaque sRGB colour, channels on [0, 255]. */
export interface Rgb {
  r: number
  g: number
  b: number
}

// WCAG 2.x writes the transfer function with a 0.03928 knee where sRGB writes
// 0.04045. The two curves meet there to within 1e-9 — the piecewise branches
// are continuous across the whole interval between them — so reusing the
// catalogue's own `srgbToLinear` costs nothing measurable and keeps one
// implementation of the gamma decode in the repository, which is the same
// reason `oklch-convert.ts` is shared by two validators.
const relativeLuminance = (c: Rgb): number =>
  0.2126 * srgbToLinear(c.r / 255) +
  0.7152 * srgbToLinear(c.g / 255) +
  0.0722 * srgbToLinear(c.b / 255)

/**
 * The WCAG contrast ratio between two opaque colours, on [1, 21].
 *
 * Symmetric: the brighter of the two is always the numerator, so callers do not
 * have to know which colour is the text and which is behind it.
 */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

/** An sRGB colour with an alpha channel on [0, 1]. */
export interface Rgba extends Rgb {
  a: number
}

const clamp255 = (v: number): number => Math.min(255, Math.max(0, v))

/**
 * Undo two composites of one colour to get the colour and its alpha back.
 *
 * `onWhite` and `onBlack` are the same paint read over an opaque white and an
 * opaque black canvas. Simple alpha compositing gives
 * `onWhite = C*a + 255*(1-a)` and `onBlack = C*a`, so their difference is
 * `255*(1-a)` and depends only on the alpha.
 *
 * This is how the collector reads colour at all. Painting once onto a
 * transparent canvas and reading it back loses precision: the 2D context stores
 * premultiplied bytes, so `getImageData` returns channels that have been
 * divided by a rounded alpha, off by a few units each. The audit exists to
 * judge values like 4.52:1 against a 4.5 threshold, and that error is larger
 * than the margin.
 *
 * The difference is averaged over the three channels rather than read off one.
 * Each channel rounds its own composite independently — 50% #ff0000 comes back
 * as differences of 127, 128, 128 — so any single channel carries up to half a
 * unit of rounding straight into the alpha.
 */
export function recoverAlpha(onWhite: Rgb, onBlack: Rgb): Rgba {
  const spread =
    (onWhite.r -
      onBlack.r +
      (onWhite.g - onBlack.g) +
      (onWhite.b - onBlack.b)) /
    3
  const a = Math.min(1, Math.max(0, 1 - spread / 255))
  // Fully transparent paint leaves no colour to recover; `onBlack` is all
  // zeroes and dividing by the alpha would be 0/0. Callers read the alpha in
  // that case, never the channels.
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }
  return {
    r: clamp255(onBlack.r / a),
    g: clamp255(onBlack.g / a),
    b: clamp255(onBlack.b / a),
    a,
  }
}

/**
 * A composed colour written the way the catalogue writes one.
 *
 * `#rrggbb` because that is the spelling a reading has to be compared against:
 * the entries annotate every OKLCH token with a hex in a trailing comment, and
 * `audit:oklch` already holds the two to each other. Channels arrive here as
 * the reals compositing produces, so they are rounded — the browser handed
 * back 8-bit values in the first place and a reading is only ever as precise
 * as that.
 */
export function toHex(c: Rgb): string {
  const channel = (v: number): string =>
    Math.round(clamp255(v)).toString(16).padStart(2, "0")
  return `#${channel(c.r)}${channel(c.g)}${channel(c.b)}`
}

/** Simple alpha compositing of one translucent colour over an opaque one. */
export function compositeOver(fg: Rgba, bg: Rgb): Rgb {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
  }
}

/**
 * What a viewer actually sees behind a sample point.
 *
 * `layers` is topmost first, the order `document.elementsFromPoint` returns, so
 * the walk runs backwards. Anything below the first opaque layer contributes
 * nothing and the loop still visits it — cheap, and it keeps the function from
 * having to decide what "opaque enough" means.
 */
export function flattenStack(layers: Array<Rgba>): {
  color: Rgb
  rootTransparent: boolean
} {
  let acc: Rgba = { r: 0, g: 0, b: 0, a: 0 }
  for (let i = layers.length - 1; i >= 0; i--) {
    const src = layers[i]
    const outA = src.a + acc.a * (1 - src.a)
    if (outA === 0) continue
    acc = {
      r: (src.r * src.a + acc.r * acc.a * (1 - src.a)) / outA,
      g: (src.g * src.a + acc.g * acc.a * (1 - src.a)) / outA,
      b: (src.b * src.a + acc.b * acc.a * (1 - src.a)) / outA,
      a: outA,
    }
  }
  // Nothing in the document painted an opaque backdrop under this point. The
  // preview is served in an iframe on a page whose chrome is pinned to light
  // (`__root.tsx` hardcodes data-theme="light"), so white is what shows
  // through — but a dark-theme preview resting on it is a finding of its own,
  // which is why the caller gets the flag rather than just the colour.
  const rootTransparent = acc.a < 1
  return {
    color: compositeOver(acc, { r: 255, g: 255, b: 255 }),
    rootTransparent,
  }
}

/** WCAG 2.x thresholds. Non-text (SC 1.4.11) asks the same 3:1 large text does. */
export const LARGE_TEXT_RATIO = 3
export const SMALL_TEXT_RATIO = 4.5
export const NON_TEXT_RATIO = 3

// 18pt and 14pt in CSS px. Written as arithmetic rather than 24 and 18.67
// because the second one is 18.6666… — rounding it up moves 18.666px bold into
// the large-text bucket and relaxes the threshold on text that is not large.
const LARGE_PX = (18 * 4) / 3
const LARGE_BOLD_PX = (14 * 4) / 3
// CSS `bold`. WCAG says bold and leaves the mapping to the platform; every
// browser resolves `font-weight: bold` to 700.
const BOLD = 700

/** Which ratio WCAG asks of a run of text at this size and weight. */
export function textThreshold(fontSizePx: number, fontWeight: number): number {
  if (fontSizePx >= LARGE_PX) return LARGE_TEXT_RATIO
  if (fontSizePx >= LARGE_BOLD_PX && fontWeight >= BOLD) return LARGE_TEXT_RATIO
  return SMALL_TEXT_RATIO
}

/**
 * How far a measurement sits from its threshold, in three values rather than
 * two.
 *
 * Colours come back from the canvas as 8-bit channels, which quantises the
 * ratio by roughly ±0.02. A pass/fail split would therefore report a verdict it
 * cannot support for anything sitting on the line — and the case that prompted
 * this audit, samsung's white-on-primary-dark at 4.52:1, sits there. The band
 * is an order of magnitude wider than the quantisation so a `borderline` says
 * "this is on the line", not "the reader is unsure of the arithmetic".
 */
export const JUDGE_BAND = 0.1

export type Verdict = "pass" | "borderline" | "fail"

export function judge(ratio: number, threshold: number): Verdict {
  if (ratio >= threshold + JUDGE_BAND) return "pass"
  if (ratio >= threshold - JUDGE_BAND) return "borderline"
  return "fail"
}

/**
 * A colour exactly as the collector reports it.
 *
 * The browser does not recover the alpha. It paints the computed colour over
 * white and over black and hands both readings across, so `recoverAlpha` above
 * is the only place the composite is undone — a second copy inside the
 * `page.evaluate` string could not be tested and would be free to drift.
 *
 * `opacity` is the product of the `opacity` of the element this colour belongs
 * to and all of its ancestors. CSS `opacity` groups a whole subtree, so folding
 * it into one factor per layer is an approximation, not the real layer model;
 * callers surface `opacityApprox` rather than hide that.
 */
export interface RawColor {
  onWhite: Rgb
  onBlack: Rgb
  opacity: number
}

/**
 * Why a sample carries no verdict.
 *
 * Each of these makes a single ratio unable to speak for what is on screen. The
 * audit reports the number anyway and withholds the judgement, which is the
 * same stance the catalogue takes on a value it cannot check upstream: an
 * unverified reading is held, not decided.
 */
export type Blocker =
  | "gradient"
  | "overlay"
  | "pseudo-background"
  | "text-fill"
  | "root-transparent"
  /**
   * A CSS `filter` on the text or on something behind it. The collector reads
   * `color` and `background-color`, which are the values BEFORE the filter, so
   * the pixels on screen are not the ones measured.
   */
  | "filter"
  /**
   * An inset `box-shadow`, which paints over the background colour inside the
   * element's own box — `inset 0 0 0 999px <overlay>` replaces the visible
   * surface entirely while `background-color` still reports the original.
   */
  | "inset-shadow"

/** One line box of a run: what is behind it, and what stops it being read. */
export interface RawTextLine {
  /** Topmost first, as `document.elementsFromPoint` returns it. */
  stack: Array<RawColor>
  /**
   * Why THIS line cannot be read — a gradient behind it, something over it.
   * Held per line because a wrapped run can cross a band that one line sits on
   * and another does not.
   */
  blockers: Array<Blocker>
}

export interface RawTextSample {
  fontSizePx: number
  fontWeight: number
  fg: RawColor
  /**
   * Why the whole RUN cannot be read, whichever line is judged — gradient text,
   * a filter on the text element itself. Not the union of the lines' blockers:
   * see `evaluateText`.
   */
  blockers: Array<Blocker>
  /**
   * One entry per line box.
   *
   * A wrapped run can cross bands of different colour, and the weakest line is
   * what a reader struggles with — so every line is carried here and compared
   * by its composed contrast. Picking a line in the browser instead, by any
   * cheap proxy over the raw channels, cannot do it: black on #ff0000 (5.25:1)
   * and black on #0000ff (2.44:1) have the same channel sum, so the failing
   * line would be dropped whenever the passing one came first.
   */
  lines: Array<RawTextLine>
}

export interface Measurement {
  ratio: number
  threshold: number
  verdict: Verdict | "indeterminate"
  blockers: Array<Blocker>
  opacityApprox: boolean
  /**
   * The two colours THIS ratio was taken between, composed and written as hex.
   *
   * Reported so a reading can be held against what the entry publishes — a
   * `borderline` between two published token values is a different thing from
   * one between colours nobody chose, and only the pair can tell them apart.
   *
   * Carried for display only. It is deliberately absent from the dedupe key in
   * `contrast-report.ts`, where the ratio already stands in for the pair: two
   * colour pairs reaching the same ratio on the same element are the same
   * reading, and splitting on the pair would move the recorded baseline for
   * reasons that are not about contrast at all.
   */
  fg: string
  bg: string
}

/** A reported colour resolved to one RGBA, ancestor opacity folded in. */
function resolve(raw: RawColor): Rgba {
  const recovered = recoverAlpha(raw.onWhite, raw.onBlack)
  return { ...recovered, a: recovered.a * raw.opacity }
}

export function evaluateText(sample: RawTextSample): Measurement {
  const fg = resolve(sample.fg)
  const threshold = textThreshold(sample.fontSizePx, sample.fontWeight)
  // A sample with no line boxes at all is one empty backdrop, which reads as a
  // transparent root and is held. The collector does not produce that shape —
  // it drops such a node — but the function should not depend on that.
  const lines: Array<RawTextLine> =
    sample.lines.length > 0 ? sample.lines : [{ stack: [], blockers: [] }]

  let worst: {
    ratio: number
    rootTransparent: boolean
    blockers: Array<Blocker>
    fg: Rgb
    bg: Rgb
  } | null = null
  for (const line of lines) {
    const backdrop = flattenStack(line.stack.map(resolve))
    // Composed here rather than at the end: the pair belongs to the line that
    // wins, and recomposing afterwards would take whichever backdrop the loop
    // happened to leave behind.
    const composed = compositeOver(fg, backdrop.color)
    const ratio = contrastRatio(composed, backdrop.color)
    if (worst === null || ratio < worst.ratio) {
      worst = {
        ratio,
        rootTransparent: backdrop.rootTransparent,
        blockers: line.blockers,
        fg: composed,
        bg: backdrop.color,
      }
    }
  }
  // Non-null: `lines` always has at least one entry. Typed from `worst` rather
  // than by restating its shape, which had already fallen a field behind.
  const chosen = worst as NonNullable<typeof worst>

  // The blockers describe the line the verdict rests on, plus whatever holds
  // for the whole run. NOT the union of every line's: that would let one
  // unreadable line withhold a verdict the rest of the run can support, which
  // hides failures rather than reporting them. The collector used to hand over
  // that union and this is the half that makes the intent real.
  const blockers = [
    ...new Set([
      ...sample.blockers,
      ...chosen.blockers,
      ...(chosen.rootTransparent ? (["root-transparent"] as const) : []),
    ]),
  ]
  return {
    ratio: chosen.ratio,
    threshold,
    verdict:
      blockers.length > 0 ? "indeterminate" : judge(chosen.ratio, threshold),
    blockers,
    opacityApprox:
      sample.fg.opacity < 1 ||
      sample.lines.some((line) => line.stack.some((l) => l.opacity < 1)),
    fg: toHex(chosen.fg),
    bg: toHex(chosen.bg),
  }
}

export interface RawNonTextSample {
  /** The element's own background, or null when it paints none. */
  fill: RawColor | null
  /**
   * The element's border colour, or null when it has no border at least 1px
   * wide on any side. The width test is the collector's, because a border of
   * zero width still has a resolved colour in computed style.
   */
  border: RawColor | null
  /** What is behind the element. Topmost first. */
  outer: Array<RawColor>
  blockers: Array<Blocker>
}

export interface NonTextMeasurement extends Measurement {
  /** Which boundary carries the ratio — what a fix would have to move. */
  basis: "fill" | "border"
}

/**
 * WCAG 2.x SC 1.4.11 for one component surface.
 *
 * Identification needs ONE visible boundary, so a fill and a border are
 * alternatives rather than both required: the better of the two decides. A
 * border is measured against the surround and against the fill inside it,
 * because either separation is enough to make the control's shape readable —
 * a dark chip with a light ring on a dark page is identified by the ring even
 * though the ring does not contrast with the page.
 *
 * Returns null for an element with neither, which is not a failure but nothing
 * to measure: a text-only link or button is judged by SC 1.4.3 on its text.
 */
export function evaluateNonText(
  sample: RawNonTextSample
): NonTextMeasurement | null {
  if (sample.fill === null && sample.border === null) return null
  const outer = flattenStack(sample.outer.map(resolve))
  const inner =
    sample.fill === null
      ? outer.color
      : compositeOver(resolve(sample.fill), outer.color)

  // Each candidate carries the pair it was taken between, not just its number.
  // A border used to be scored with `Math.max` over its two comparisons, which
  // answered how well it separates but forgot WHICH separation answered — so a
  // reported pair would have been free to name the side that lost.
  const candidates: Array<{
    ratio: number
    basis: "fill" | "border"
    fg: Rgb
    bg: Rgb
  }> = []
  if (sample.fill !== null) {
    candidates.push({
      ratio: contrastRatio(inner, outer.color),
      basis: "fill",
      fg: inner,
      bg: outer.color,
    })
  }
  if (sample.border !== null) {
    const border = resolve(sample.border)
    const against = (bg: Rgb): { ratio: number; fg: Rgb; bg: Rgb } => {
      const fg = compositeOver(border, bg)
      return { ratio: contrastRatio(fg, bg), fg, bg }
    }
    const outward = against(outer.color)
    const inward = against(inner)
    candidates.push({
      ...(inward.ratio > outward.ratio ? inward : outward),
      basis: "border",
    })
  }
  const best = candidates.reduce((a, b) => (b.ratio > a.ratio ? b : a))

  const blockers = outer.rootTransparent
    ? [...sample.blockers, "root-transparent" as const]
    : sample.blockers
  const opacityApprox =
    (sample.fill?.opacity ?? 1) < 1 ||
    (sample.border?.opacity ?? 1) < 1 ||
    sample.outer.some((l) => l.opacity < 1)

  return {
    ratio: best.ratio,
    basis: best.basis,
    threshold: NON_TEXT_RATIO,
    verdict:
      blockers.length > 0 ? "indeterminate" : judge(best.ratio, NON_TEXT_RATIO),
    blockers,
    opacityApprox,
    fg: toHex(best.fg),
    bg: toHex(best.bg),
  }
}

// A keycap emoji is a digit (or `#`/`*`), an optional variation selector and
// U+20E3. It is matched and removed first, because its leading character is an
// ordinary digit that the class below deliberately does not cover.
const KEYCAP_SEQUENCE = /[\u0023\u002A0-9]\uFE0F?\u20E3/gu
// What can appear inside an emoji without being text.
//
// NOT `\p{Emoji_Component}`, which is what this started as: that property is
// the set of characters a keycap sequence is BUILT from and therefore includes
// ASCII 0-9, `#` and `*`. With it in the class, every digit-only run counted as
// emoji — toss's calendar cells and gmarket's count badges vanished from the
// sweep, and a survey whose point is to report how many readings fail reported
// fewer. Regional indicators (flags) and modifiers (skin tones) are named
// explicitly instead, since neither is `Extended_Pictographic` on its own.
const EMOJI_PARTS =
  /[\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Modifier}\p{Default_Ignorable_Code_Point}\s]/gu

/**
 * Is this run of text nothing but emoji?
 *
 * Such a run is not measured. A colour emoji is painted from its own glyph
 * table (COLR/CBDT), so `color` does not reach it and the inherited value the
 * collector reads says nothing about the pixels — toss's cake and lion came
 * back at 1.37:1 while being perfectly legible.
 *
 * A run that MIXES emoji with words is measured: the words are still coloured
 * text whatever sits beside them.
 *
 * This lives here rather than in the collector so it can be tested. The
 * collector reports every text node and the judgement is made on this side,
 * which is the same split the colour arithmetic follows.
 */
export function isEmojiOnly(text: string): boolean {
  return text.replace(KEYCAP_SEQUENCE, "").replace(EMOJI_PARTS, "") === ""
}
