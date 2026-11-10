/**
 * Whether a painted `::before` or `::after` can be in the way of a sample
 * point, read from computed style rather than from pixels (#402).
 *
 * A pseudo-element is not a hit-test target, so `elementsFromPoint` never
 * returns it and the collector cannot see whether it covers the point. What it
 * can see is the pseudo-element's computed geometry and its containing block's
 * box. From those, a box is worked out here, on the side that can be tested,
 * and a pseudo-element whose box misses the point is not a reason to hold the
 * reading: a 1px rule under a heading, a speech-bubble tail beside a badge,
 * a connector between two steps.
 *
 * Only a box that can be worked out with certainty releases a reading. Every
 * other shape keeps the hold it always had: a pseudo-element in normal flow
 * (static or relative), one with a transform, one whose geometry is not in
 * pixels, and one whose containing block is itself transformed or is not a
 * block box. Each of those answers "in the way", which errs toward a person
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
  /** The sample point, in viewport pixels — the same frame as the box. */
  point: { x: number; y: number }
}

/** Whether any painted pseudo-element in a stack may cover its sample point. */
export function pseudoInTheWay(
  stack: ReadonlyArray<{ pseudos?: Array<RawPseudo> }>
): boolean {
  return stack.some((layer) => (layer.pseudos ?? []).some(mayCover))
}

// A length exactly as computed style writes a resolved one. Anything else —
// `auto`, a percentage, an empty string — is not read at all: `parseFloat`
// would turn it into NaN, every comparison against NaN is false, and the point
// would come out "outside" a box nobody worked out. That is the one way this
// could release a reading it should hold.
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

function mayCover(p: RawPseudo): boolean {
  if (p.position !== "absolute" && p.position !== "fixed") return true
  if ([p.transform, p.translate, p.rotate, p.scale].some((v) => v !== "none")) {
    return true
  }
  const cb = p.containingBlock
  if (NOT_ONE_BOX.has(cb.display)) return true
  if (cb.transforms.some((t) => !TRANSLATION.test(t))) return true

  const values = [
    p.top,
    p.left,
    p.width,
    p.height,
    p.marginTop,
    p.marginLeft,
    p.paddingTop,
    p.paddingRight,
    p.paddingBottom,
    p.paddingLeft,
    p.borderTopWidth,
    p.borderRightWidth,
    p.borderBottomWidth,
    p.borderLeftWidth,
  ].map(px)
  if (values.some((v) => v === null)) return true
  const [top, left, width, height, mt, ml, pt, pr, pb, pl, bt, br, bb, bl] =
    values as Array<number>

  // `left` and never `right`: when `left`, `right` and `width` are all set,
  // `right` is the one that gives way, yet computed style still reports it as
  // written — a box built from it lands somewhere the pseudo-element is not.
  const x0 = cb.left + left + ml
  const y0 = cb.top + top + mt
  const contentBox = p.boxSizing !== "border-box"
  const w = width + (contentBox ? pl + pr + bl + br : 0)
  const h = height + (contentBox ? pt + pb + bt + bb : 0)
  const { x, y } = p.point
  // The edges count as inside: a point on the border is a point it paints.
  return x >= x0 && x <= x0 + w && y >= y0 && y <= y0 + h
}
