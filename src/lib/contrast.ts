// WCAG 2.x contrast, for the preview audit in `scripts/audit-contrast.ts`.
//
// Everything here is pure and works on sRGB 8-bit channels, because that is
// what the browser hands back: the collector paints each computed colour onto a
// canvas and reads the pixel, so no OKLCH, `color-mix()` or `var()` chain ever
// reaches this file. That split is deliberate — Chromium resolves
// `color-mix(in oklab, ...)` to an `oklab()` string in computed style, and the
// catalogue does not resolve that itself. `./oklch-convert`'s `oklabToRgb`
// paints a single token (the pair classifier paints tokens with it, then
// composites them with `compositeOver` here); it does not parse a computed
// `oklab()` string, a `color-mix()` or a `var()` chain.
//
// The one string that does arrive is a layer's computed `background-image`,
// which no canvas read can flatten into one colour. `./contrast-gradient` turns
// it into the set of colours it can paint; everything after that is here.

import { paintableColours, rgbaKey } from "./contrast-gradient"
import { srgbToLinear } from "./oklch-convert"
import { ownerBackgroundUnder, paintOrder, reach } from "./contrast-pseudo"
import type { BackgroundImage } from "./contrast-gradient"
import type { RawPseudo } from "./contrast-pseudo"

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
// reason the OKLCH conversions live only in `oklch-convert.ts`.
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

/** Source-over of one translucent colour onto another, both left straight. */
function paintOver(src: Rgba, dst: Rgba): Rgba {
  const a = src.a + dst.a * (1 - src.a)
  if (a === 0) return dst
  return {
    r: (src.r * src.a + dst.r * dst.a * (1 - src.a)) / a,
    g: (src.g * src.a + dst.g * dst.a * (1 - src.a)) / a,
    b: (src.b * src.a + dst.b * dst.a * (1 - src.a)) / a,
    a,
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
  for (let i = layers.length - 1; i >= 0; i--) acc = paintOver(layers[i], acc)
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
  /**
   * A `background-image` gradient that could not be judged (#402). One whose
   * colours all agree on a verdict is judged, not held; this is every other
   * case:
   * - its colours disagree — some pass, some do not — and where the text sits
   *   along it is not known;
   * - `./contrast-gradient` cannot read it (a colour spelling or interpolation
   *   space it does not walk, a blend mode, a `text` clip);
   * - the stack would list more than `MAX_BACKDROPS` backdrops.
   */
  | "gradient"
  /**
   * A `background-image` that is an image (`url()`, or `image-set()`,
   * `cross-fade()`, `element()`, `paint()`), whose colours cannot be listed
   * from computed style at all.
   */
  | "image"
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

// Every `Blocker`, as a value. A record keyed by the type, so a reason added
// to the type and not here, or written here and not there, fails to compile.
const BLOCKER_KEYS: Record<Blocker, true> = {
  gradient: true,
  image: true,
  overlay: true,
  "pseudo-background": true,
  "text-fill": true,
  "root-transparent": true,
  filter: true,
  "inset-shadow": true,
}

/** Every reason a reading can be held for. */
export const BLOCKERS = Object.keys(BLOCKER_KEYS) as Array<Blocker>

/** Whether `name` is a reason the measurer holds a reading for. */
export const isBlocker = (name: string): name is Blocker =>
  Object.hasOwn(BLOCKER_KEYS, name)

/**
 * One element's paint in a backdrop: its `background-color` as a `RawColor`
 * reads it and, when it has one, its computed `background-image` handed over
 * as written. The image is not a colour the canvas can read, so it travels as
 * text and is enumerated on this side, where it can be tested.
 */
export interface RawLayer extends RawColor {
  image?: BackgroundImage
  /**
   * The element's painted `::before` and `::after`, as computed values. A
   * hit test reports a pseudo-element as its owner, so the collector cannot
   * tell whether one reaches the line read, or on which side of it it
   * paints; `pseudoEffect` works that out here.
   */
  pseudos?: Array<RawPseudo>
  /**
   * The same element is hit again further down. A hit on a pseudo-element is
   * reported as its owner, so the owner comes up twice when something paints
   * between its pseudo-element and its own background: this place is then the
   * pseudo-element's, and the background it carries is not what is here.
   */
  again?: true
  /**
   * The element draws by a `::before` or `::after` that is not among
   * `pseudos`, since it paints no background: glyphs of its `content`, a
   * border, a shadow, an outline or a backdrop filter. That one may be over
   * the same line — out of the hit test's sight with `pointer-events: none`
   * — or be why the element is in front of the text, so `pseudoEffect`
   * composes none of the element's pseudo-elements, on any side.
   */
  unreadPseudo?: true
}

/** One line box of a run: what is behind it, and what stops it being read. */
export interface RawTextLine {
  /** Topmost first, as `document.elementsFromPoint` returns it. */
  stack: Array<RawLayer>
  /**
   * Why THIS line cannot be read, as the collector saw it — something over
   * it, a filter behind it. A pseudo-element is not among them: it travels
   * on its layer, and `readLine` adds its reason when it may reach the line.
   * Held per line because a wrapped run can cross a band that one line sits on
   * and another does not.
   */
  blockers: Array<Blocker>
  /**
   * Ancestors of the element read that the hit test put in FRONT of it, each
   * as the index of the same element further down `stack`, or -1 where it is
   * not there. An ancestor is in front by a pseudo-element of its own drawn
   * over the line, or by its own background over a descendant with a negative
   * `z-index`. The collector does not call one an `overlay`; `pseudoEffect`
   * does, unless a pseudo-element of that ancestor paints over the line and
   * nothing else of it draws unread (`unreadPseudo`, #692).
   */
  ahead?: Array<number>
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

/** How one of a control's two text styles paints: its own, or its placeholder's. */
export interface RawControlStyle {
  fg: RawColor
  fontSizePx: number
  fontWeight: number
  /** `-webkit-text-fill-color` or `background-clip: text` paints the glyphs. */
  textFill: boolean
}

/**
 * An `<input>`, `<textarea>` or `<select>` as the collector reads it — raw.
 *
 * None of its text is measured by the text pass. A placeholder and a value are
 * an attribute and form state, not text nodes at all; a select's options ARE
 * text nodes, but in Chromium they have no client rects, so the pass reaches
 * them and drops them. The collector hands every candidate back
 * with all of it, and `controlTextSample` decides what is on screen — the
 * collector cannot import, so a decision made there could not be tested.
 */
export interface RawControl {
  path: string
  /** Lower-case tag name. */
  tag: string
  /** Lower-case `type` of an input; empty for a textarea or a select. */
  type: string
  value: string
  placeholder: string
  /** The browser's own `:placeholder-shown`. */
  placeholderShown: boolean
  /** A select's chosen option as it reads; empty for anything else. */
  selectedText: string
  /**
   * A select that lays its options out as a list (`multiple`, or `size` over
   * 1) rather than showing one closed choice. No path measures it. Its options'
   * text nodes have no client rects in Chromium, just as a closed select's
   * have none, so the text pass skips them too. Recorded as a Known gap in
   * `docs/preview-contrast-baseline.md`; the catalogue has none today.
   */
  listbox: boolean
  own: RawControlStyle
  /** The `::placeholder` pseudo-element's computed style. */
  placeholderStyle: RawControlStyle
  /** Read at the control's centre, starting from the control's own surface. */
  lines: Array<RawTextLine>
  /** Reasons that hold whichever text is shown — a filter on the control. */
  blockers: Array<Blocker>
}

/** Which of a control's texts a reading measured. */
export type ControlTextSource = "placeholder" | "value" | "option"

export interface ControlText {
  source: ControlTextSource
  /** What a reader sees: a password's value comes back as its dots. */
  text: string
  sample: RawTextSample
}

/**
 * The input types this path measures: the ones whose text is a field a user
 * types into. A checkbox's or a radio's `value` is form data, not something on
 * screen. A button-shaped input (`submit`, `button`, `reset`) does show its
 * `value` as a label, but is not measured here — a Known gap in
 * `docs/preview-contrast-baseline.md`, with none in the catalogue today. The
 * date, time, week, month, datetime-local, colour and file widgets are left
 * out because what they show is drawn by the browser, not from `value` as
 * written.
 */
const TEXT_INPUT_TYPES = new Set([
  "",
  "text",
  "search",
  "email",
  "password",
  "tel",
  "url",
  "number",
])

/**
 * The text a form control shows, and the style it is painted in — or null
 * when it shows none.
 *
 * A value wins over a placeholder, because the browser shows one or the other
 * and the value is what it shows once there is one. The placeholder is read in
 * ITS colour and size, which a preview sets apart on purpose: it is the one
 * text designers make faint, which is why it is worth measuring at all.
 */
export function controlTextSample(raw: RawControl): ControlText | null {
  const sampleFor = (style: RawControlStyle): RawTextSample => ({
    fontSizePx: style.fontSizePx,
    fontWeight: style.fontWeight,
    fg: style.fg,
    lines: raw.lines,
    blockers: style.textFill
      ? [...raw.blockers, "text-fill" as const]
      : raw.blockers,
  })

  // A style at opacity 0 paints nothing — `::placeholder { opacity: 0 }` is the
  // floating-label idiom — so there is no text there to judge. A transparent
  // COLOUR is not caught here; it reads 1:1, as it does on the text path.
  // Emoji-only text is dropped for the text path's reason: colour emoji are
  // not painted with `color`, so a reading of it would measure nothing real.
  const shown = (
    source: ControlTextSource,
    text: string,
    style: RawControlStyle
  ): ControlText | null =>
    style.fg.opacity === 0 || isEmojiOnly(text)
      ? null
      : { source, text, sample: sampleFor(style) }

  if (raw.tag === "select") {
    // A listbox shows every option at once, the chosen one on a highlight, so
    // one reading of the chosen option in the select's colours would stand
    // for a list it does not describe. Left unmeasured and recorded as a gap.
    if (raw.listbox || raw.selectedText.trim() === "") return null
    return shown("option", raw.selectedText.trim(), raw.own)
  }
  if (raw.tag !== "textarea") {
    if (raw.tag !== "input" || !TEXT_INPUT_TYPES.has(raw.type)) return null
  }
  // Trimmed for the same reason the text pass skips a whitespace-only node:
  // spaces are not a glyph anyone reads.
  if (raw.value.trim() !== "") {
    return shown(
      "value",
      // Never the value itself: it would put a password into the report.
      raw.type === "password" ? "•".repeat(raw.value.length) : raw.value,
      raw.own
    )
  }
  if (raw.placeholderShown && raw.placeholder.trim() !== "") {
    return shown("placeholder", raw.placeholder.trim(), raw.placeholderStyle)
  }
  return null
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
   * Carried for display, and read by `contrast-pairs.ts` to classify a row
   * against the entry's tokens (#397) — never to judge it. It is deliberately
   * absent from the dedupe key in `contrast-report.ts`, where the ratio
   * already stands in for the pair: two colour pairs reaching the same ratio
   * on the same element are the same reading, and splitting on the pair would
   * move the recorded baseline for reasons that are not about contrast at all.
   * The classifier refuses to run on a folded row whose widths disagree about
   * the pair, so the fold cannot hand it a pair at random.
   */
  fg: string
  bg: string
}

/** A reported colour resolved to one RGBA, ancestor opacity folded in. */
function resolve(raw: RawColor): Rgba {
  const recovered = recoverAlpha(raw.onWhite, raw.onBlack)
  return { ...recovered, a: recovered.a * raw.opacity }
}

/**
 * How many backdrops one reading may enumerate before it is held instead.
 * Two image layers on one element (a grid drawn as two gradients) already
 * multiply; a few more in the stack would make the walk the slowest part of
 * the sweep for a reading that is almost certainly mixed anyway.
 */
const MAX_BACKDROPS = 4096

/**
 * Every colour one layer can paint: its `background-color` with each
 * combination of its image layers' colours drawn over it, then faded by the
 * layer's opacity. A layer with no image paints one colour, as before.
 */
function layerPaints(layer: RawLayer): Array<Rgba> | Blocker {
  const image =
    layer.image === undefined
      ? ({ kind: "none" } as const)
      : paintableColours(layer.image)
  if (image.kind === "blocked") return image.blocker
  let paints = [recoverAlpha(layer.onWhite, layer.onBlack)]
  if (image.kind === "colours") {
    // `background-image` lists its topmost layer first; paint from the bottom.
    for (const tile of [...image.layers].reverse()) {
      const next = new Map<string, Rgba>()
      for (const under of paints) {
        // Outside a tile that does not fill the box, the box shows what was
        // under the tile — one more colour the text can sit on.
        if (!tile.covers) next.set(rgbaKey(under), under)
        for (const colour of tile.colours) {
          const out = paintOver(colour, under)
          next.set(rgbaKey(out), out)
        }
        if (next.size > MAX_BACKDROPS) return "gradient"
      }
      paints = [...next.values()]
    }
  }
  // Where an image is clipped short of the border box, the colour is clipped
  // with it and the layer may paint nothing there.
  if (image.kind === "colours" && image.layers.some((l) => l.clipped)) {
    paints.push({ r: 0, g: 0, b: 0, a: 0 })
  }
  return paints.map((c) => ({ ...c, a: c.a * layer.opacity }))
}

/**
 * The reason to name when several layers cannot be listed. An image cannot be
 * enumerated at all, so it outranks a gradient that merely could not be read.
 */
const strongerOf = (reasons: Array<Blocker>): Blocker =>
  reasons.includes("image") ? "image" : reasons[0]

interface Backdrop {
  color: Rgb
  rootTransparent: boolean
}

/**
 * Every backdrop a stack can put behind a point, or the reason it cannot be
 * listed. A blocked stack still carries ONE backdrop — the stack read with its
 * images left out — because a held reading reports its number all the same.
 */
function backdropsOf(stack: Array<RawLayer>): {
  backdrops: Array<Backdrop>
  blocker: Blocker | null
} {
  const plain = (blocker: Blocker) => ({
    backdrops: [flattenStack(stack.map(resolve))],
    blocker,
  })
  const perLayer: Array<Array<Rgba>> = []
  const blocked: Array<Blocker> = []
  for (const layer of stack) {
    const paints = layerPaints(layer)
    if (typeof paints === "string") blocked.push(paints)
    else perLayer.push(paints)
  }
  // Every layer is read before giving up, so an image anywhere in the stack is
  // named — it is the stronger reason, as it is within one element.
  if (blocked.length > 0) return plain(strongerOf(blocked))
  // The product over the layers, not their positions: which colour of one
  // gradient sits over which colour of another is geometry this does not know,
  // so every pairing is a backdrop the text might be on.
  const count = perLayer.reduce((n, paints) => n * paints.length, 1)
  if (count > MAX_BACKDROPS) return plain("gradient")
  let partial: Array<Array<Rgba>> = [[]]
  for (const paints of perLayer) {
    partial = partial.flatMap((above) => paints.map((p) => [...above, p]))
  }
  const seen = new Map<string, Backdrop>()
  for (const layers of partial) {
    const backdrop = flattenStack(layers)
    seen.set(`${toHex(backdrop.color)}|${backdrop.rootTransparent}`, backdrop)
  }
  return { backdrops: [...seen.values()], blocker: null }
}

/** A stack once its pseudo-elements have been put where they paint. */
interface PseudoEffect {
  /**
   * The stack with a pseudo-element painted under what is read put in as a
   * layer of its own, just above its owner. Unchanged when held.
   */
  stack: Array<RawLayer>
  /**
   * A translucent wash painted over what is read: composed onto the text, or
   * the surface, and onto its backdrop both.
   */
  veil: Rgba | null
  blockers: Array<Blocker>
  /** Whether a paint put in or over is faded by an `opacity`. */
  faded: boolean
}

/** A pseudo-element and the index of its owner's layer in the stack. */
interface Placed {
  index: number
  p: RawPseudo
}

/**
 * How far past a surface's box a pseudo-element has to paint for the colour
 * beside its edge to be under it too: the pixels a boundary is seen against,
 * with one to spare for anti-aliasing.
 */
const SURFACE_EDGE = 2

const paintsNothing = (layer: RawLayer): boolean =>
  layer.image === undefined &&
  recoverAlpha(layer.onWhite, layer.onBlack).a === 0

// `content: ""` as Chromium serialises it, quotes included: a box and no
// more. The collector tests the same literal for the same reason.
const EMPTY_CONTENT = '""'

/**
 * Where each painted pseudo-element in a stack goes (#692), or why that is
 * not known.
 *
 * `read` says what the stack is behind. Text: the stack starts with the
 * element read itself, whose own background is under its glyphs, so the
 * layers between it and an owner start one further down; and the glyphs are
 * read against the backdrop inside the line box, which is the area a paint
 * has to cover. A surface: its `outer` starts behind it, and it is read
 * against the colour just outside its edge, so a paint has to cover that
 * too — the surface's box grown by `SURFACE_EDGE`.
 *
 * Only what is certain is composed. A pseudo-element that reaches the area
 * read but does not cover it whole, or whose side is not known, holds the
 * reading as `pseudo-background`, and so do the shapes this does not compose:
 * - two or more covering the same area, whichever sides they paint on, since
 *   their order against each other is not read;
 * - over the text: an opaque one, which hides it; a gradient or an image,
 *   whose colour over each glyph is not known; and one blended other than by
 *   source-over;
 * - under it: one whose owner is further down than a layer between it and
 *   what is read that paints anything, since which of the two is on top is
 *   not read either; and one whose owner is hit again further down, where
 *   something paints between the pseudo-element and the owner's background;
 * - on any side: one whose owner is hidden, whose computed background is in
 *   the stack though nothing of it is painted, one whose `content` draws
 *   more than its box, and one whose owner draws by another pseudo-element
 *   that is not read (`unreadPseudo`);
 * - under its owner's background: one whose owner's colour is not opaque;
 * - under the text or under its owner's background, either way: one whose
 *   owner's own box does not hold the whole area, so its background is not
 *   under all of it, and one with an element from the one read up to the
 *   owner that paints a background, itself or by its own pseudo-elements, and
 *   takes no pointer events, which no stack shows.
 *
 * One under the text is composed by source-over whatever its
 * `mix-blend-mode`, as every layer of a stack is.
 */
function pseudoEffect(
  stack: Array<RawLayer>,
  ahead: Array<number>,
  read: "text" | "surface"
): PseudoEffect {
  const between = read === "text" ? 1 : 0
  const edge = read === "text" ? 0 : SURFACE_EDGE
  const over: Array<Placed> = []
  const under: Array<Placed> = []
  let unsure = false
  for (const [index, layer] of stack.entries()) {
    for (const p of layer.pseudos ?? []) {
      const area = {
        left: p.area.left - edge,
        top: p.area.top - edge,
        right: p.area.right + edge,
        bottom: p.area.bottom + edge,
      }
      const reached = reach({ ...p, area })
      if (reached === "none") continue
      if (reached === "unsure") {
        unsure = true
        continue
      }
      // A hidden owner is in the stack only because the hit test meets its
      // visible pseudo-element: its computed background there is not
      // painted, so nothing can be laid against it, on either side.
      if (p.owner.visibility !== "visible") {
        unsure = true
        continue
      }
      // Its `content` draws inside the box too, in a colour and place not
      // read: glyphs over or under the text are not a flat paint.
      if (p.content !== EMPTY_CONTENT) {
        unsure = true
        continue
      }
      // Something else of its owner draws and is not read — glyphs, a
      // border, a backdrop filter — and may be over the same line, out of
      // the hit test's sight with `pointer-events: none`, or be why the owner
      // is in front of the text. The wash alone is not what is there.
      if (layer.unreadPseudo === true) {
        unsure = true
        continue
      }
      const side = paintOrder(p)
      if (side === "above") {
        over.push({ index, p })
        continue
      }
      // Both other sides are laid against the owner's background, which has
      // to be under the whole area, in sight of the hit test.
      if (side === "unsure" || !ownerBackgroundUnder(p, area)) {
        unsure = true
      } else if (side === "below") {
        under.push({ index, p })
      } else if (recoverAlpha(layer.onWhite, layer.onBlack).a < 1) {
        // Under an opaque background of its owner's, it is not on screen.
        unsure = true
      }
    }
  }
  // An ancestor in front is explained by a pseudo-element of its own that
  // paints over the area — one composed, so nothing else of it draws unread.
  // Anything else in front is a cover, as it always was.
  const overlay = ahead.some(
    (i) => i === -1 || !over.some((o) => o.index === i)
  )
  const blockers: Array<Blocker> = overlay ? ["overlay"] : []
  const held = (): PseudoEffect => ({
    stack,
    veil: null,
    blockers: [...blockers, "pseudo-background"],
    faded: false,
  })
  if (unsure || over.length + under.length > 1) return held()

  let veil: Rgba | null = null
  let faded = false
  if (over.length === 1) {
    const paint = over[0].p.paint
    if (paint.image !== undefined) return held()
    if (over[0].p.mixBlendMode !== "normal") return held()
    const colour = recoverAlpha(paint.onWhite, paint.onBlack)
    veil = { ...colour, a: colour.a * paint.opacity }
    if (veil.a >= 1) return held()
    faded = paint.opacity < 1
  }

  let out = stack
  if (under.length === 1) {
    const { index, p } = under[0]
    // Its owner hit again further down: something paints between the two,
    // and this layer is the pseudo-element's place, not the owner's
    // background, which may lie past where the stack stopped.
    if (stack[index].again === true) return held()
    if (stack.slice(between, index).some((l) => !paintsNothing(l))) {
      return held()
    }
    const { pseudos: _, ...paint } = p.paint
    out = [...stack.slice(0, index), paint, ...stack.slice(index)]
    faded = faded || paint.opacity < 1
  }
  return { stack: out, veil, blockers, faded }
}

export function evaluateText(sample: RawTextSample): Measurement {
  const fg = resolve(sample.fg)
  const threshold = textThreshold(sample.fontSizePx, sample.fontWeight)
  // A sample with no line boxes at all is one empty backdrop, which reads as a
  // transparent root and is held. The collector does not produce that shape —
  // it drops such a node — but the function should not depend on that.
  const lines: Array<RawTextLine> =
    sample.lines.length > 0 ? sample.lines : [{ stack: [], blockers: [] }]

  // A line is an interval, not a point: the weakest and the strongest backdrop
  // it can have, a plain line's two ends being the same. The run reads as its
  // weakest LINE, so its contrast lies between the lowest floor and the lowest
  // ceiling of its lines. Ranking a line by its `background-color` alone let a
  // gradient line read as the colour under its gradient and lose to a plain
  // line, so the run was judged on the plain one while the gradient line sat
  // on something darker.
  const readings = lines.map((line) => readLine(line, fg))
  const floor = readings.reduce((a, b) =>
    b.weakest.ratio < a.weakest.ratio ? b : a
  )
  const ceiling = readings.reduce((a, b) => (b.strongest < a.strongest ? b : a))
  // Where along a gradient the text sits is not known, so the run is judged
  // only when both ends of its interval agree — a plain line failing at 4.00
  // fails the run however a split gradient line beside it falls. When the ends
  // disagree the run is held. Which pair it then reports is settled below.
  const settled =
    judge(floor.weakest.ratio, threshold) ===
    judge(ceiling.strongest, threshold)
  // The lines the verdict could rest on: the one that caps the run, and every
  // line that could be weaker than that cap. A plain run has exactly one, its
  // weakest line, as before — the comparison is strict so a tie keeps the
  // first, also as before. A cap that already fails is the exception: the run
  // reads as its weakest line, so a line that might be weaker can only pull it
  // lower, and whatever holds that line cannot lift the run to a pass.
  const capFails = judge(ceiling.strongest, threshold) === "fail"
  const contenders = readings.filter(
    (r) => r === ceiling || (!capFails && r.weakest.ratio < ceiling.strongest)
  )

  // The blockers describe the lines the verdict rests on, plus whatever holds
  // for the whole run. NOT the union of every line's: that would let one
  // unreadable line withhold a verdict the rest of the run can support, which
  // hides failures rather than reporting them. The collector used to hand over
  // that union and this is the half that makes the intent real.
  const blockers = [
    ...new Set([
      ...sample.blockers,
      ...contenders.flatMap((r) => r.blockers),
      ...(settled ? [] : (["gradient"] as const)),
      ...(contenders.some((r) => r.rootTransparent)
        ? (["root-transparent"] as const)
        : []),
    ]),
  ]
  // Which pair stands for the run. A failing run reports its cap: the run is
  // certainly no stronger than that line, so the pair is one a fix has to
  // move. Every other run — a pass, a borderline, a held one — reports the
  // weakest it could be, the number its verdict still has to survive.
  const chosen = blockers.length === 0 && capFails ? ceiling : floor
  const ratio = chosen.weakest.ratio
  return {
    ratio,
    threshold,
    verdict: blockers.length > 0 ? "indeterminate" : judge(ratio, threshold),
    blockers,
    opacityApprox:
      sample.fg.opacity < 1 ||
      sample.lines.some((line) => line.stack.some((l) => l.opacity < 1)) ||
      readings.some((r) => r.faded),
    fg: toHex(chosen.weakest.fg),
    bg: toHex(chosen.weakest.bg),
  }
}

/** One line box read over every backdrop its stack can put behind it. */
function readLine(
  line: RawTextLine,
  fg: Rgba
): {
  weakest: { ratio: number; fg: Rgb; bg: Rgb }
  strongest: number
  rootTransparent: boolean
  blockers: Array<Blocker>
  faded: boolean
} {
  const effect = pseudoEffect(line.stack, line.ahead ?? [], "text")
  const { backdrops, blocker } = backdropsOf(effect.stack)
  const veiled = (c: Rgb): Rgb =>
    effect.veil === null ? c : compositeOver(effect.veil, c)
  let weakest: { ratio: number; fg: Rgb; bg: Rgb } | null = null
  let strongest = 0
  for (const backdrop of backdrops) {
    // Composed here rather than at the end: the pair belongs to the backdrop
    // that wins, and recomposing afterwards would take whichever one the loop
    // happened to leave behind. A wash over the text is composed last, onto
    // the glyphs and the backdrop alike.
    const bg = veiled(backdrop.color)
    const composed = veiled(compositeOver(fg, backdrop.color))
    const ratio = contrastRatio(composed, bg)
    if (weakest === null || ratio < weakest.ratio) {
      weakest = { ratio, fg: composed, bg }
    }
    strongest = Math.max(strongest, ratio)
  }
  return {
    // Non-null: `backdropsOf` always returns at least one backdrop.
    weakest: weakest as NonNullable<typeof weakest>,
    strongest,
    rootTransparent: backdrops.some((b) => b.rootTransparent),
    // A stack that cannot be listed is read as one backdrop, its images left
    // out, and ranked by it — the same as any other held line.
    blockers: [
      ...line.blockers,
      ...(blocker === null ? [] : [blocker]),
      ...effect.blockers,
    ],
    faded: effect.faded,
  }
}

export interface RawNonTextSample {
  /** The element's own background, or null when it paints none. */
  fill: RawLayer | null
  /**
   * The element's border colour, or null when it has no border at least 1px
   * wide on any side. The width test is the collector's, because a border of
   * zero width still has a resolved colour in computed style.
   */
  border: RawColor | null
  /** What is behind the element. Topmost first. */
  outer: Array<RawLayer>
  blockers: Array<Blocker>
  /** As `RawTextLine.ahead`, its indices into `outer`. */
  ahead?: Array<number>
}

export interface NonTextMeasurement extends Measurement {
  /** Which boundary carries the ratio — what a fix would have to move. */
  basis: "fill" | "border"
}

/** The better of a surface's two boundaries over one backdrop. */
function bestSeparation(
  behind: Rgb,
  fill: Rgba | null,
  border: Rgba | null,
  veil: Rgba | null
): { ratio: number; basis: "fill" | "border"; fg: Rgb; bg: Rgb } {
  // A wash over the surface is composed onto every colour last, as on text.
  const veiled = (c: Rgb): Rgb => (veil === null ? c : compositeOver(veil, c))
  const outer = veiled(behind)
  const inner = veiled(fill === null ? behind : compositeOver(fill, behind))
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
  if (fill !== null) {
    candidates.push({
      ratio: contrastRatio(inner, outer),
      basis: "fill",
      fg: inner,
      bg: outer,
    })
  }
  if (border !== null) {
    // The border is painted over what is under it, then washed with the rest.
    const against = (under: Rgb): { ratio: number; fg: Rgb; bg: Rgb } => {
      const fg = veiled(compositeOver(border, under))
      const bg = veiled(under)
      return { ratio: contrastRatio(fg, bg), fg, bg }
    }
    const outward = against(behind)
    const inward = against(fill === null ? behind : compositeOver(fill, behind))
    candidates.push({
      ...(inward.ratio > outward.ratio ? inward : outward),
      basis: "border",
    })
  }
  return candidates.reduce((a, b) => (b.ratio > a.ratio ? b : a))
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
  const effect = pseudoEffect(sample.outer, sample.ahead ?? [], "surface")
  const outer = backdropsOf(effect.stack)
  // The surface's own image is enumerated like a layer behind it. Blocked, it
  // is read as its `background-color` alone and held for the same reason.
  const ownPaints = sample.fill === null ? null : layerPaints(sample.fill)
  const fills =
    ownPaints === null
      ? [null]
      : typeof ownPaints === "string"
        ? [resolve(sample.fill as RawLayer)]
        : ownPaints
  const border = sample.border === null ? null : resolve(sample.border)

  // Scored once per backdrop and surface colour, then the weakest of those
  // stands for the element — where the surface sits along the gradient is no
  // more known than where text does.
  let worst: ReturnType<typeof bestSeparation> | null = null
  const verdicts = new Set<Verdict>()
  for (const backdrop of outer.backdrops) {
    for (const fill of fills) {
      const best = bestSeparation(backdrop.color, fill, border, effect.veil)
      verdicts.add(judge(best.ratio, NON_TEXT_RATIO))
      if (worst === null || best.ratio < worst.ratio) worst = best
    }
  }
  const best = worst as NonNullable<typeof worst>
  const unreadable = [
    ...(outer.blocker === null ? [] : [outer.blocker]),
    ...(typeof ownPaints === "string" ? [ownPaints] : []),
  ]
  const unread =
    unreadable.length > 0
      ? strongerOf(unreadable)
      : verdicts.size > 1
        ? "gradient"
        : null

  const blockers = [
    ...new Set([
      ...sample.blockers,
      ...(unread === null ? [] : [unread]),
      ...effect.blockers,
      ...(outer.backdrops.some((b) => b.rootTransparent)
        ? (["root-transparent"] as const)
        : []),
    ]),
  ]
  const opacityApprox =
    (sample.fill?.opacity ?? 1) < 1 ||
    (sample.border?.opacity ?? 1) < 1 ||
    sample.outer.some((l) => l.opacity < 1) ||
    effect.faded

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
