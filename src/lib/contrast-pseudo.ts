/**
 * Whether a painted `::before` or `::after` can be in the way of a reading,
 * read from computed style rather than from pixels (#691, part of #402).
 *
 * A pseudo-element is not a hit-test target, so `elementsFromPoint` never
 * returns it and the collector cannot see whether it covers what is read. What
 * it can see is the pseudo-element's computed geometry and its containing
 * block's box. From those, a box is worked out here, on the side that can be
 * tested, and a pseudo-element whose box misses the whole area read — a
 * text line's box, a surface's box — is not a reason to hold the reading: a
 * rule under a heading, a speech-bubble tail beside a badge, a connector
 * between two steps. The area, not the one point a backdrop is sampled at: a
 * highlighter under the lower part of a line misses the line's centre while
 * the glyphs still sit on it.
 *
 * Only a box that can be worked out with certainty releases a reading. Every
 * other shape keeps the hold it always had: a pseudo-element in normal flow
 * (static or relative), one with a transform, one whose geometry is not in
 * pixels, one whose containing block, or anything above it, is transformed
 * other than by a translation, one whose containing block is not one box
 * (`inline`, `contents`), and one with anything listed in `unsure` — a
 * rarer way to capture or move the box, or paint of its own that reaches
 * past it. Each of those answers "in the way", which errs toward a person
 * looking at it, never toward a pass.
 */

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
   * alone: a `filter`, `box-shadow`, `outline` or `border-image`, which paint
   * past the box, a grid placement, which makes one grid area its
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
  area: { left: number; top: number; right: number; bottom: number }
}

/** Whether any painted pseudo-element in a stack may reach the area read. */
export function pseudoInTheWay(
  stack: ReadonlyArray<{ pseudos?: Array<RawPseudo> }>
): boolean {
  return stack.some((layer) => (layer.pseudos ?? []).some(mayReach))
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

// The computed form of a 2D translation and nothing else. Any other
// `transform`, and any `rotate` or `scale` that is not `none`, rescales the
// containing block's rect against the pseudo-element's own values.
const TRANSLATION = /^matrix\(1, 0, 0, 1, -?[\d.e-]+, -?[\d.e-]+\)$/

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

/** Those lengths in pixels, or null when any one is not a pixel length. */
function lengthsOf(
  p: RawPseudo
): Record<(typeof LENGTHS)[number], number> | null {
  const out = {} as Record<(typeof LENGTHS)[number], number>
  for (const name of LENGTHS) {
    const value = px(p[name])
    if (value === null) return null
    out[name] = value
  }
  return out
}

function mayReach(p: RawPseudo): boolean {
  if (p.position !== "absolute" && p.position !== "fixed") return true
  if ([p.transform, p.translate, p.rotate, p.scale].some((v) => v !== "none")) {
    return true
  }
  const cb = p.containingBlock
  if (NOT_ONE_BOX.has(cb.display)) return true
  if (cb.transforms.some((t) => !TRANSLATION.test(t))) return true
  if (p.unsure.length > 0) return true

  const v = lengthsOf(p)
  if (v === null) return true

  // `left` and never `right`: when `left`, `right` and `width` are all set in
  // left-to-right horizontal text — the only writing direction that gets this
  // far, see `unsure` — `right` is the one that gives way, yet computed style
  // still reports it as written, so a box built from it lands somewhere the
  // pseudo-element is not.
  const x0 = cb.left + v.left + v.marginLeft
  const y0 = cb.top + v.top + v.marginTop
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
  // Overlap, not touch: a box that starts where the area ends shares no row
  // or column of pixels with it.
  const a = p.area
  return x0 < a.right && x0 + w > a.left && y0 < a.bottom && y0 + h > a.top
}
