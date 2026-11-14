/**
 * Where a painted `::before` or `::after` is against a reading, read from
 * computed style rather than from pixels (#691 and #692, part of #402).
 *
 * A hit test reports a pseudo-element as its owner, so `elementsFromPoint`
 * cannot say whether one covers what is read, or on which side of it it
 * paints. What the collector can see is the pseudo-element's computed
 * geometry, its containing block's box, its paint, and the values that place
 * it in the paint order. From those, two things are worked out here, on the
 * side that can be tested:
 *
 * - `reach`: whether its paint misses the whole area read — a text line's
 *   box, a surface's box — and so is no reason to hold the reading (a rule
 *   under a heading, a speech-bubble tail beside a badge), or covers that
 *   area whole. The area, not the one point a backdrop is sampled at: a
 *   highlighter under the lower part of a line misses the line's centre
 *   while the glyphs still sit on it.
 * - `paintOrder`: whether it paints over what is read, under it, or under
 *   its own owner's background.
 *
 * Only what can be worked out with certainty releases a reading. Every other
 * shape keeps the hold: a pseudo-element in normal flow (static or
 * relative), one transformed other than by a translation, one whose geometry
 * is not in pixels, one whose containing block, or anything above it, is
 * transformed other than by a translation, one whose containing block is
 * not one box (`inline`, `contents`), one with anything listed in `unsure` —
 * a rarer way to capture or move the box, or paint of its own that reaches
 * past it — and one that reaches the area only in part, or whose side of it
 * is not known. Each of those answers "in the way", which errs toward a
 * person looking at it, never toward a pass.
 */

import type { RawLayer } from "./contrast"

/** Four per-corner values, top-left first and clockwise. */
export type Corners = [string, string, string, string]

/** A box in viewport pixels. */
export interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * One painted pseudo-element as the collector reads it — computed values only,
 * no judgement.
 */
export interface RawPseudo {
  position: string
  transform: string
  translate: string
  rotate: string
  scale: string
  boxSizing: string
  top: string
  left: string
  width: string
  height: string
  marginTop: string
  marginLeft: string
  paddingTop: string
  paddingRight: string
  paddingBottom: string
  paddingLeft: string
  borderTopWidth: string
  borderRightWidth: string
  borderBottomWidth: string
  borderLeftWidth: string
  containingBlock: {
    /** The padding box's top-left corner, in viewport pixels. */
    left: number
    top: number
    /** Its computed `display`. */
    display: string
    /**
     * Every `transform`, `rotate` and `scale` other than `none` on the
     * containing block and on each of its ancestors, as computed style writes
     * them. Its rect is read after them and the pseudo-element's own values
     * before, so anything but a translation puts the two in different units.
     */
    transforms: Array<string>
  }
  /**
   * Every property that leaves the box, or where it paints, a guess, as
   * `name: value`. On the pseudo-element, its owner or any ancestor: one that
   * can capture or move a positioned box under a rule the collector does not
   * walk — `will-change`, containment, a size container, `backdrop-filter`,
   * perspective, a 3D context, a motion path — or `zoom`, which can put the
   * box and its containing block in different units, or a writing direction
   * other than left-to-right horizontal, in which `left` can be the side
   * that gives way. On the pseudo-element
   * alone: a `filter`, `box-shadow`, `border-image` or reflection
   * (`-webkit-box-reflect`), which paint past the box — an outline is read
   * from `outline` instead — a grid placement, which makes one grid area its
   * containing block, and self-alignment (`justify-self`, `align-self`) or
   * anchor positioning (`position-area`), which move it while `left` and
   * `top` still read as written. None is modelled: any one of them holds the
   * reading.
   */
  unsure: Array<string>
  /**
   * The box of what is read — a text line, a form control, a non-text
   * surface — in viewport pixels, the same frame as the pseudo-element's box.
   */
  area: Rect
  /** Which of its owner's two pseudo-elements this is. */
  which: "before" | "after"
  /** Its computed `z-index`: `auto` or an integer. */
  zIndex: string
  /**
   * What it paints: its `background-color` and `background-image`, and the
   * product of its own `opacity` and its owner's chain of them.
   */
  paint: RawLayer
  /**
   * The four corner radii as computed style writes them, top-left first and
   * clockwise: one or two lengths each, in pixels or percentages of the box.
   */
  radii: Corners
  /**
   * Its four `corner-*-shape` values, empty where the browser does not know
   * the property. Anything but `round` (`superellipse(1)` in Chromium) cuts
   * a corner to a shape the radii alone do not describe.
   */
  cornerShapes: Corners
  backgroundClip: string
  clipPath: string
  maskImage: string
  mixBlendMode: string
  /**
   * Its outline as computed style writes it. A ring that reaches past the
   * box leaves where it paints a guess; one drawn inside the box (`width`
   * plus `offset` at most 0) paints only within the box's outer edge.
   */
  outline: { style: string; width: string; offset: string }
  /**
   * The owner's own border box, in viewport pixels. Where it does not hold
   * the area read, the owner's background is not under all of it.
   */
  ownerBox: Rect
  /** The owner's four corner radii, written as `radii` is. */
  ownerRadii: Corners
  /** The owner's four `corner-*-shape` values, written as `cornerShapes` is. */
  ownerCornerShapes: Corners
  /** The element whose pseudo-element this is. */
  owner: OrderBox
  /**
   * The element read and each of its ancestors up to, not including, the
   * owner — the text's parent, the form control or the surface first. Empty
   * when the owner is the element read. `null` when the owner is not one of
   * its ancestors, which leaves where the two paint against each other
   * unknown.
   */
  chain: Array<OrderBox> | null
}

/**
 * One element as the paint order needs it: where it sits in the stacking
 * order is decided by these values alone.
 */
export interface OrderBox {
  position: string
  zIndex: string
  /**
   * Its parent's computed `display`: a `z-index` on a flex or grid item
   * makes a stacking context without `position`.
   */
  parentDisplay: string
  /**
   * Every property it sets that makes, or may make, a stacking context, as
   * `name: value` — `opacity` under 1, a transform, a filter, `isolation`,
   * `will-change` and the rest. The collector lists what is not at its
   * initial value; what each one means is decided here.
   */
  contextProps: Array<string>
  /** Its computed `pointer-events`. */
  pointerEvents: string
  /**
   * Its computed `visibility`. A hidden owner paints no background, though
   * its pseudo-elements may be `visible` and still put it in the hit list.
   */
  visibility: string
  /**
   * Whether it, or its own `::before` or `::after`, paints a background on
   * screen — a colour that is not transparent, or an image, and not hidden.
   * Borders and shadows are not counted. With `pointer-events: none` such an
   * element and its pseudo-elements are in no hit list, so no stack shows
   * where that paint is.
   */
  paintsBackgroundOrPseudo: boolean
}

// `corner-*-shape` values that are the plain round corner: Chromium writes
// `round` as `superellipse(1)`, and a browser without the property reads it
// as empty.
const ROUND_CORNER = new Set(["", "round", "superellipse(1)"])

/**
 * Whether a pseudo-element placed under the text, or under its owner's
 * background, can be laid against that background with certainty: the
 * owner's own box holds the whole area, so its background is under all of
 * it, and nothing from the element read up to the owner paints out of the
 * hit test's sight. Taken from the area as given; a surface's grown area is
 * the caller's to pass. That the owner is visible at all is `pseudoEffect`'s
 * to check first, for every side.
 */
export function ownerBackgroundUnder(p: RawPseudo, area: Rect): boolean {
  // Its background fills its border box cut by its rounded corners.
  const holds = roundedHolds(
    p.ownerBox,
    p.ownerRadii,
    p.ownerCornerShapes,
    area
  )
  const hidden = (p.chain ?? []).some(
    (b) => b.pointerEvents === "none" && b.paintsBackgroundOrPseudo
  )
  return holds && !hidden
}

/**
 * How far a painted pseudo-element reaches over the area read.
 *
 * - `none`: its box misses the area, so it is not in the way at all.
 * - `all`: what it paints covers the area whole, so every glyph of the line,
 *   or every pixel of the surface, sits under it or over it alike.
 * - `unsure`: anything else — its box cannot be worked out, or it covers
 *   the area only in part, or the shape it paints is not its box (a border,
 *   a clip, a mask). A pseudo-element that reaches the area this way holds
 *   the reading.
 */
export type Reach = "none" | "all" | "unsure"

export function reach(p: RawPseudo): Reach {
  const box = boxOf(p)
  if (box === null) return "unsure"
  // Overlap, not touch: a box that starts where the area ends shares no row
  // or column of pixels with it.
  const a = p.area
  const overlaps =
    box.x < a.right &&
    box.x + box.w > a.left &&
    box.y < a.bottom &&
    box.y + box.h > a.top
  if (!overlaps) return "none"
  return paintCoversArea(p, box) ? "all" : "unsure"
}

// A length exactly as computed style writes a resolved one. Anything else is
// not read at all. `parseFloat` would turn `auto` or an empty string into NaN,
// every comparison against NaN is false, and the line would come out
// "clear of" a box nobody worked out — the one way this could release a reading
// it should hold. A percentage it would read as that many pixels, which is no
// better.
const PX = /^(-?\d+(?:\.\d+)?(?:e-?\d+)?)px$/
const px = (value: string): number | null => {
  const m = PX.exec(value)
  return m === null ? null : Number(m[1])
}

// The computed form of a 2D translation and nothing else, its two offsets
// captured. Any other `transform`, and any `rotate` or `scale` that is not
// `none`, rescales the containing block's rect against the pseudo-element's
// own values, or turns the pseudo-element's own box.
const NUMBER = String.raw`-?\d+(?:\.\d+)?(?:e-?\d+)?`
const TRANSLATION = new RegExp(
  String.raw`^matrix\(1, 0, 0, 1, (${NUMBER}), (${NUMBER})\)$`
)

// Boxes that are not one rectangle: an inline box is as many fragments as it
// has lines, and `display: contents` makes no box at all.
const NOT_ONE_BOX = new Set(["inline", "contents"])

// Every length the box is worked out from, so that each is read by name.
const LENGTHS = [
  "top",
  "left",
  "width",
  "height",
  "marginTop",
  "marginLeft",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
] as const

type Lengths = Record<(typeof LENGTHS)[number], number>

/** Those lengths in pixels, or null when any one is not a pixel length. */
function lengthsOf(p: RawPseudo): Lengths | null {
  const out = {} as Lengths
  for (const name of LENGTHS) {
    const value = px(p[name])
    if (value === null) return null
    out[name] = value
  }
  return out
}

interface Box {
  /** The border box, in viewport pixels. */
  x: number
  y: number
  w: number
  h: number
  lengths: Lengths
  /** How far in from the edge an outline drawn inside the box reaches. */
  outlineInset: number
}

/** The pseudo-element's border box, or null when it cannot be worked out. */
function boxOf(p: RawPseudo): Box | null {
  if (p.position !== "absolute" && p.position !== "fixed") return null
  // A translation of its own only moves the box, by offsets computed style
  // has already resolved to pixels: `translate(-50%, -50%)` on a 30px box
  // comes back as `matrix(1, 0, 0, 1, -15, -15)`. The `translate` property
  // is not read the same way, since its computed value keeps a percentage
  // as written.
  if ([p.translate, p.rotate, p.scale].some((v) => v !== "none")) return null
  let dx = 0
  let dy = 0
  if (p.transform !== "none") {
    const m = TRANSLATION.exec(p.transform)
    if (m === null) return null
    dx = Number(m[1])
    dy = Number(m[2])
  }
  const cb = p.containingBlock
  if (NOT_ONE_BOX.has(cb.display)) return null
  if (cb.transforms.some((t) => !TRANSLATION.test(t))) return null
  if (p.unsure.length > 0) return null

  const v = lengthsOf(p)
  if (v === null) return null
  const outlineInset = outlineInsetOf(p.outline)
  if (outlineInset === null) return null

  // `left` and never `right`: when `left`, `right` and `width` are all set in
  // left-to-right horizontal text — the only writing direction that gets this
  // far, see `unsure` — `right` is the one that gives way, yet computed style
  // still reports it as written, so a box built from it lands somewhere the
  // pseudo-element is not.
  const contentBox = p.boxSizing !== "border-box"
  const w =
    v.width +
    (contentBox
      ? v.paddingLeft + v.paddingRight + v.borderLeftWidth + v.borderRightWidth
      : 0)
  const h =
    v.height +
    (contentBox
      ? v.paddingTop + v.paddingBottom + v.borderTopWidth + v.borderBottomWidth
      : 0)
  return {
    x: cb.left + v.left + v.marginLeft + dx,
    y: cb.top + v.top + v.marginTop + dy,
    w,
    h,
    lengths: v,
    outlineInset,
  }
}

/**
 * How far in from the box's edge its outline paints: 0 for none, or null
 * when it reaches past the box, onto what is beside it, and the box no
 * longer bounds the paint.
 */
function outlineInsetOf(o: RawPseudo["outline"]): number | null {
  if (o.style === "none") return 0
  const width = px(o.width)
  const offset = px(o.offset)
  if (width === null || offset === null) return null
  if (width === 0) return 0
  // The ring runs from `offset` out to `offset + width` past the edge.
  if (offset + width > 0) return null
  return -offset
}

// One corner radius: a horizontal and a vertical length, each in pixels or
// as a percentage of the box's width and height. Computed style writes one
// value when the two are the same.
const RADIUS_PART = String.raw`(${NUMBER})(px|%)`
const RADIUS = new RegExp(String.raw`^${RADIUS_PART}(?: ${RADIUS_PART})?$`)

function radiusOf(
  value: string,
  w: number,
  h: number
): { rx: number; ry: number } | null {
  const m = RADIUS.exec(value)
  if (m === null) return null
  // The second length is an optional group, absent when the two are equal.
  const groups: Array<string | undefined> = [...m]
  const [, n1 = "", u1 = "", n2, u2 = ""] = groups
  const length = (n: string, unit: string, of: number): number =>
    unit === "%" ? (Number(n) / 100) * of : Number(n)
  const rx = length(n1, u1, w)
  const ry = n2 === undefined ? length(n1, u1, h) : length(n2, u2, h)
  return { rx: Math.max(0, rx), ry: Math.max(0, ry) }
}

/**
 * Whether what the pseudo-element paints covers the area whole.
 *
 * Its paint is its background over its border box, cut by its rounded
 * corners. A border paints a colour of its own over that edge, which is not
 * read; a clip or a mask cuts the background to a shape not read either; a
 * background clipped to the content box stops short of the padding. Each of
 * those answers no.
 */
function paintCoversArea(p: RawPseudo, box: Box): boolean {
  const v = box.lengths
  const bordered =
    v.borderTopWidth !== 0 ||
    v.borderRightWidth !== 0 ||
    v.borderBottomWidth !== 0 ||
    v.borderLeftWidth !== 0
  if (bordered) return false
  if (p.clipPath !== "none" || p.maskImage !== "none") return false
  // One value per background layer; the colour is clipped as the last one
  // is. With no border, the padding box is the border box.
  const clip = p.backgroundClip.split(",").at(-1)?.trim()
  const padded =
    v.paddingTop !== 0 ||
    v.paddingRight !== 0 ||
    v.paddingBottom !== 0 ||
    v.paddingLeft !== 0
  const clipsShort =
    clip !== "border-box" &&
    clip !== "padding-box" &&
    !(clip === "content-box" && !padded)
  if (clipsShort) return false

  // An outline inside the box paints a colour of its own over that edge, so the
  // area has to keep clear of it: grown by the ring's reach, it must still
  // fit, which puts every point of it at least that far in.
  return roundedHolds(
    { left: box.x, top: box.y, right: box.x + box.w, bottom: box.y + box.h },
    p.radii,
    p.cornerShapes,
    {
      left: p.area.left - box.outlineInset,
      top: p.area.top - box.outlineInset,
      right: p.area.right + box.outlineInset,
      bottom: p.area.bottom + box.outlineInset,
    }
  )
}

/**
 * Whether a box cut by its rounded corners holds the whole of `area`.
 * `radii` and `shapes` are as computed style writes them; a radius that
 * cannot be read, or a corner shape other than round — a curve this does not
 * work out — answers no.
 */
function roundedHolds(
  shape: Rect,
  radii: Corners,
  shapes: Corners,
  area: Rect
): boolean {
  if (!shapes.every((c) => ROUND_CORNER.has(c))) return false
  const w = shape.right - shape.left
  const h = shape.bottom - shape.top
  const read = radii.map((r) => radiusOf(r, w, h))
  if (read.some((r) => r === null)) return false
  const [tl, tr, br, bl] = read as Array<{ rx: number; ry: number }>
  // Radii that add up past a side are scaled down together, by the smallest
  // factor any side needs (CSS Backgrounds 3, "Overlapping Curves").
  const fit = (side: number, sum: number) => (sum > side ? side / sum : 1)
  const f = Math.min(
    fit(w, tl.rx + tr.rx),
    fit(w, bl.rx + br.rx),
    fit(h, tl.ry + bl.ry),
    fit(h, tr.ry + br.ry)
  )
  const { left, top, right, bottom } = shape
  // Each corner as the centre of its ellipse, its two radii, and which way
  // from that centre a point has to lie to be in the corner at all.
  const corners = [
    { r: tl, cx: left + tl.rx * f, cy: top + tl.ry * f, sx: -1, sy: -1 },
    { r: tr, cx: right - tr.rx * f, cy: top + tr.ry * f, sx: 1, sy: -1 },
    { r: br, cx: right - br.rx * f, cy: bottom - br.ry * f, sx: 1, sy: 1 },
    { r: bl, cx: left + bl.rx * f, cy: bottom - bl.ry * f, sx: -1, sy: 1 },
  ]
  const inside = (x: number, y: number): boolean => {
    if (x < left || x > right || y < top || y > bottom) return false
    for (const c of corners) {
      const rx = c.r.rx * f
      const ry = c.r.ry * f
      if (rx === 0 || ry === 0) continue
      const ox = (x - c.cx) * c.sx
      const oy = (y - c.cy) * c.sy
      if (ox <= 0 || oy <= 0) continue
      if ((ox / rx) ** 2 + (oy / ry) ** 2 > 1) return false
    }
    return true
  }
  // The shape is convex, so it holds the area once it holds its corners.
  return (
    inside(area.left, area.top) &&
    inside(area.right, area.top) &&
    inside(area.right, area.bottom) &&
    inside(area.left, area.bottom)
  )
}

/**
 * Which side of what is read a pseudo-element paints on, from computed style
 * alone, by the painting order of CSS 2 Appendix E (#692).
 *
 * - `above`: over the text, or over the surface.
 * - `below`: under it, and over its owner's own background.
 * - `under-owner`: under its owner's background as well. A negative
 *   `z-index` sends a pseudo-element to the negative layer of the nearest
 *   stacking context, and when its owner is not one, that layer lies
 *   outside the owner and is painted before it.
 * - `unsure`: anything not modelled here.
 *
 * Each side is placed by a key: its layer in the stacking context the
 * pseudo-element belongs to — negative `z-index`, then the normal flow, then
 * positioned with `z-index` auto or 0, then positive `z-index` — and the
 * `z-index` itself within the first and the last. Equal keys go by document
 * order, in which `::before` precedes everything inside its owner and
 * `::after` follows it.
 */
export type PaintOrder = "above" | "below" | "under-owner" | "unsure"

export function paintOrder(p: RawPseudo): PaintOrder {
  if (p.chain === null) return "unsure"
  if (p.position !== "absolute" && p.position !== "fixed") return "unsure"
  const own = zOf(p.zIndex)
  if (own === null) return "unsure"
  const mine = keyOfZ(own)
  const ownerMakes = makesContext(p.owner)
  if (ownerMakes === null) return "unsure"
  const theirs = subjectKey(p.chain)
  if (theirs === null) return "unsure"
  if (!ownerMakes) {
    // The negative layer is then outside the owner, under its background.
    // What is read cannot be lined up against the owner's background from
    // here, so it holds.
    if (theirs.layer === NEGATIVE) return "unsure"
    if (mine.layer === NEGATIVE) return "under-owner"
  }
  const order = compare(mine, theirs)
  if (order !== 0) return order > 0 ? "above" : "below"
  return p.which === "after" ? "above" : "below"
}

const NEGATIVE = 0
const FLOW = 1
const ZERO = 2
const POSITIVE = 3

interface Key {
  layer: number
  z: number
}

const compare = (a: Key, b: Key): number => a.layer - b.layer || a.z - b.z

/** A `z-index`: `auto`, an integer, or null for anything else. */
function zOf(value: string): "auto" | number | null {
  if (value === "auto") return "auto"
  return /^-?\d+$/.test(value) ? Number(value) : null
}

const keyOfZ = (z: "auto" | number): Key =>
  z === "auto" || z === 0
    ? { layer: ZERO, z: 0 }
    : { layer: z < 0 ? NEGATIVE : POSITIVE, z }

// Properties that make a stacking context or not depending on what they
// name — `will-change: opacity` does, `will-change: scroll-position` does
// not — and which are not read further here.
const MAYBE_CONTEXT = [
  "will-change",
  "contain",
  "container-type",
  "content-visibility",
]

const isPositioned = (b: OrderBox): boolean => b.position !== "static"

/**
 * Whether an element makes a stacking context, or null when that is not
 * known from what was read.
 */
function makesContext(b: OrderBox): boolean | null {
  const maybe = b.contextProps.some((s) =>
    MAYBE_CONTEXT.some((name) => s.startsWith(`${name}:`))
  )
  if (maybe) return null
  if (b.position === "fixed" || b.position === "sticky") return true
  const z = zOf(b.zIndex)
  if (z === null) return null
  if (z !== "auto") {
    const applies = zApplies(b)
    if (applies === null) return null
    if (applies) return true
  }
  return b.contextProps.length > 0
}

/**
 * Whether an element's `z-index` counts at all: on a positioned box, or on a
 * flex or grid item without `position`. Anywhere else it is ignored, and a
 * stacking context made there by something else paints as `z-index: 0`.
 * Under a `display: contents` parent the question passes to an element that
 * was not read, so it is null.
 */
function zApplies(b: OrderBox): boolean | null {
  if (isPositioned(b)) return true
  if (b.parentDisplay === "contents") return null
  return /\b(flex|grid)\b/.test(b.parentDisplay)
}

/**
 * The key what is read is painted at, in the stacking context the owner's
 * pseudo-element belongs to: that of the outermost stacking context in its
 * chain, which paints all of it in one place; with none, the positioned
 * layer if anything in the chain is positioned; otherwise the normal flow.
 */
function subjectKey(chain: Array<OrderBox>): Key | null {
  let key: Key | null = null
  let positioned = false
  for (const b of chain) {
    const makes = makesContext(b)
    if (makes === null) return null
    if (isPositioned(b)) positioned = true
    if (makes) {
      const z = zOf(b.zIndex)
      if (z === null) return null
      // Where its `z-index` does not count, the context paints as
      // `z-index: 0`. An outer one replaces it, so the walk goes on outward.
      key = keyOfZ(zApplies(b) === true ? z : "auto")
    }
  }
  if (key !== null) return key
  // A positioned element with no stacking context around it paints what is
  // inside it at its own place among the positioned layer.
  return positioned ? { layer: ZERO, z: 0 } : { layer: FLOW, z: 0 }
}
