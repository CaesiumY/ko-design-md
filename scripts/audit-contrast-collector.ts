// The function that runs INSIDE the page.
//
// It is serialised into the browser by `page.evaluate`, so it can import
// nothing: every helper it needs is defined in its own body. That constraint
// shapes what it returns. It does NOT recover alpha or compute a ratio — it
// paints each computed colour over white and over black and hands both
// readings back, leaving `src/lib/contrast.ts` the only place that arithmetic
// lives. A second copy in here could not be reached by `pnpm test`.

import type { Blocker, RawColor } from "../src/lib/contrast"

export interface CollectedText {
  path: string
  sample: string
  fontSizePx: number
  fontWeight: number
  fg: RawColor
  /** One backdrop per line box; `evaluateText` judges the weakest. */
  stacks: Array<Array<RawColor>>
  blockers: Array<Blocker>
}

export interface CollectedNonText {
  path: string
  fill: RawColor | null
  border: RawColor | null
  outer: Array<RawColor>
  blockers: Array<Blocker>
}

export interface Collected {
  text: Array<CollectedText>
  nonText: Array<CollectedNonText>
  /** How many candidate overlays the page carries, for the run's own report. */
  overlayCandidates: number
}

/**
 * The selectors a `:hover` rule targets, with the `:hover` taken off.
 *
 * Hover is where one of the samsung defects lived — the accent button's hover
 * background sat at 3.60:1 in both themes — and a static render cannot see it.
 * The caller forces the state through CDP, which needs to be told WHICH
 * elements, so the sheets are read for the answer.
 *
 * Only a `:hover` that ends a compound is returned. `.card:hover .label` names
 * an element that is not the one hovered, and forcing the state on the wrong
 * node would change nothing while looking like it had worked; that shape is a
 * known gap rather than a guess.
 */
export function collectHoverSelectors(): Array<string> {
  const found = new Set<string>()
  const walk = (rules: CSSRuleList): void => {
    for (const rule of rules) {
      // A rule is read for its own selector AND walked for nested rules, not
      // one or the other. Since CSS Nesting shipped, an ordinary
      // `CSSStyleRule` also exposes `cssRules` — an empty list — so treating
      // "has cssRules" as "is a group rule" sorted EVERY rule into the group
      // branch and never looked at a selector. Measured: zero hover selectors
      // found on a file with eight of them.
      const selector = (rule as CSSStyleRule).selectorText
      if (typeof selector === "string" && selector.includes(":hover")) {
        for (const part of selector.split(",")) {
          const trimmed = part.trim()
          if (!trimmed.endsWith(":hover")) continue
          const base = trimmed.slice(0, -":hover".length).trim()
          if (base !== "") found.add(base)
        }
      }
      // `@media`, `@supports` and `@layer` hold their own rules, and so does a
      // nesting parent.
      const nested = (rule as CSSGroupingRule).cssRules as
        CSSRuleList | undefined
      if (nested !== undefined && nested.length > 0) walk(nested)
    }
  }
  for (const sheet of document.styleSheets) {
    try {
      walk(sheet.cssRules)
    } catch {
      // A cross-origin sheet — the jsDelivr font CSS under `--online` — refuses
      // `cssRules`. Font sheets carry no hover rules, so skipping is exact.
    }
  }
  return [...found]
}

/**
 * Written as one self-contained function because that is the only shape
 * `page.evaluate` accepts. Read it as the browser half of the audit.
 */
export function collectContrast(): Collected {
  // Two pixels, one backed by white and one by black. Reading a colour twice is
  // what makes its alpha recoverable: a single read of a translucent paint
  // comes back premultiplied and rounded, off by units the audit cannot afford
  // when it is judging 4.52 against 4.5.
  const canvas = document.createElement("canvas")
  canvas.width = 2
  canvas.height = 1
  const maybeCtx = canvas.getContext("2d", { willReadFrequently: true })
  if (maybeCtx === null) throw new Error("no 2d context")
  // Bound again so the narrowing survives into the closures below; TypeScript
  // does not carry a null check into a function declared after it.
  const ctx = maybeCtx

  const colourCache = new Map<string, RawColor>()

  function readColour(css: string): RawColor {
    const hit = colourCache.get(css)
    if (hit !== undefined) return hit
    ctx.clearRect(0, 0, 2, 1)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, 1, 1)
    ctx.fillStyle = "#000000"
    ctx.fillRect(1, 0, 1, 1)
    // Every string reaching here comes from `getComputedStyle`, so it is one
    // the engine itself produced and assigning it cannot silently fail.
    ctx.fillStyle = css
    ctx.fillRect(0, 0, 2, 1)
    const d = ctx.getImageData(0, 0, 2, 1).data
    const value: RawColor = {
      onWhite: { r: d[0], g: d[1], b: d[2] },
      onBlack: { r: d[4], g: d[5], b: d[6] },
      opacity: 1,
    }
    colourCache.set(css, value)
    return value
  }

  const isTransparent = (css: string): boolean => {
    const c = readColour(css)
    return (
      c.onWhite.r === 255 &&
      c.onWhite.g === 255 &&
      c.onWhite.b === 255 &&
      c.onBlack.r === 0 &&
      c.onBlack.g === 0 &&
      c.onBlack.b === 0
    )
  }

  const isOpaque = (c: RawColor): boolean =>
    c.onWhite.r === c.onBlack.r &&
    c.onWhite.g === c.onBlack.g &&
    c.onWhite.b === c.onBlack.b

  // CSS `opacity` applies to a whole subtree, so what fades an element is the
  // product down its ancestor chain. Cached because that chain is walked once
  // per sample and the same ancestors recur constantly.
  const opacityCache = new WeakMap<Element, number>()
  function opacityOf(el: Element): number {
    const hit = opacityCache.get(el)
    if (hit !== undefined) return hit
    const raw = Number.parseFloat(getComputedStyle(el).opacity)
    // `parseFloat("0") || 1` would turn a fully faded element into an opaque
    // one, so the fallback tests for a number rather than for truthiness.
    const own = Number.isFinite(raw) ? raw : 1
    const parent = el.parentElement
    const value = parent === null ? own : own * opacityOf(parent)
    opacityCache.set(el, value)
    return value
  }

  function pathOf(node: Element): string {
    const parts: Array<string> = []
    let cur: Element | null = node
    while (cur !== null && cur !== document.body && parts.length < 4) {
      const classes = [...cur.classList].slice(0, 3)
      parts.unshift(
        classes.length > 0
          ? `${cur.localName}.${classes.join(".")}`
          : cur.localName
      )
      cur = cur.parentElement
    }
    return parts.join(" > ")
  }

  // `document.elementsFromPoint` never returns a `pointer-events: none`
  // element, and a decorative scrim is exactly that. Collecting the candidates
  // once and testing each sample against their live rects is what keeps a scrim
  // from being invisible to the audit. Their rects are read at sample time
  // rather than cached, because the page scrolls between samples and a
  // `position: fixed` candidate does not move with it.
  const overlayCandidates = [...document.querySelectorAll("*")].filter((el) => {
    const cs = getComputedStyle(el)
    if (cs.pointerEvents !== "none") return false
    if (cs.visibility === "hidden" || cs.display === "none") return false
    return cs.backgroundImage !== "none" || !isTransparent(cs.backgroundColor)
  })

  // `from` is the element being measured. Its own ancestors are excluded: an
  // ancestor that paints is the BACKDROP, not something covering the text, and
  // `pointer-events: none` is inherited, so a decorative wrapper around live
  // content would otherwise put an `overlay` hold on every reading inside it —
  // withholding real failures instead of reporting them.
  const coveredByOverlay = (x: number, y: number, from: Element): boolean =>
    overlayCandidates.some((el) => {
      if (el.contains(from)) return false
      const r = el.getBoundingClientRect()
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
    })

  // A pseudo-element paints behind its originating element's text but is not a
  // hit-test target, so it is invisible to `elementsFromPoint` too. Only its
  // presence is detected; where it sits in the stack is what the audit declines
  // to guess.
  function hasPaintedPseudo(el: Element): boolean {
    for (const pseudo of ["::before", "::after"]) {
      const cs = getComputedStyle(el, pseudo)
      if (cs.content === "none" || cs.content === "") continue
      // A declared pseudo-element that paints nothing is not in the way.
      // vapor-ui's buttons carry `::before { background: …; opacity: 0 }` for
      // a hover wash, and Chromium serialises their empty content as `""`
      // rather than `none` — so without these three tests every vapor-ui
      // button reading was held for a layer that is not on screen.
      if (cs.display === "none" || cs.visibility === "hidden") continue
      const alpha = Number.parseFloat(cs.opacity)
      if (Number.isFinite(alpha) && alpha === 0) continue
      if (cs.backgroundImage !== "none") return true
      if (!isTransparent(cs.backgroundColor)) return true
    }
    return false
  }

  /**
   * Blockers that come from the element's own painting, not from what is
   * behind it.
   *
   * Both make `backgroundColor` and `color` describe something other than the
   * pixels: a `filter` transforms them on the way to the screen (toss hovers
   * every button with `brightness(0.96)`, which a computed-style read cannot
   * see at all), and an inset `box-shadow` paints over the background inside
   * the box (`inset 0 0 0 999px <overlay>` replaces the surface outright).
   */
  function paintBlockers(
    cs: CSSStyleDeclaration,
    rect: DOMRect | null
  ): Array<Blocker> {
    const out: Array<Blocker> = []
    if (cs.filter !== "none") out.push("filter")
    if (insetShadowCoversBox(cs, rect)) out.push("inset-shadow")
    return out
  }

  /**
   * An inset shadow WIDE enough to stand in for the background colour.
   *
   * `inset 0 0 0 999px <overlay>` fills the whole box, which is how toss
   * paints a pressed button — `background-color` then describes a surface
   * nobody sees. But `inset 0 0 0 1px` is the ordinary way to draw a hairline
   * border and covers nothing, and treating the two alike held 352 readings
   * on the catalogue. So the spread is read and compared against the box: a
   * shadow reaching half the shorter side has covered the sample point at the
   * centre.
   */
  function insetShadowCoversBox(
    cs: CSSStyleDeclaration,
    rect: DOMRect | null
  ): boolean {
    const shadow = cs.boxShadow
    if (shadow === "none" || !shadow.includes("inset")) return false
    if (rect === null) return true
    const reach = Math.min(rect.width, rect.height) / 2
    // Computed form is `<color> <x> <y> <blur> <spread> inset`, comma
    // separated. Only the spread decides how far in it paints.
    for (const part of shadow.split(/,(?![^(]*\))/)) {
      if (!part.includes("inset")) continue
      const lengths = [...part.matchAll(/(-?[\d.]+)px/g)].map((m) =>
        Number.parseFloat(m[1])
      )
      const spread = lengths.at(3)
      if (spread === undefined || spread >= reach) return true
    }
    return false
  }

  /**
   * The painted layers BEHIND a point, topmost first, and what blocks reading
   * them.
   *
   * `from` is the element the colour belongs to, and the walk starts there
   * rather than at the top of the hit list. Anything in front of it is covering
   * it, not backing it: socar's demo snackbar sits over a price label, and
   * taking the hit list from the top made the snackbar's fill — the same dark
   * navy as the label's text — its background, reporting 1.00:1 for a label
   * that is simply hidden. A covered reading is held, not scored, because the
   * text is not on screen to be read at all.
   */
  function backdropAt(
    x: number,
    y: number,
    from: Element
  ): {
    stack: Array<RawColor>
    blockers: Set<Blocker>
    /** Nothing to read here: the point does not reach `from` at all. */
    occluded: boolean
  } {
    const blockers = new Set<Blocker>()
    const stack: Array<RawColor> = []
    if (coveredByOverlay(x, y, from)) blockers.add("overlay")
    const hit = document.elementsFromPoint(x, y)
    const index = hit.indexOf(from)
    // Not in its own hit list: covered by something opaque, or inside a
    // `pointer-events: none` subtree. Such a point is dropped rather than held
    // — a hold says "measured, verdict withheld", and this was never on screen
    // to measure. Counting it would also double-count, since an empty stack
    // reads as `root-transparent` too.
    if (index === -1) return { stack, blockers, occluded: true }
    // Something IS in front, but `from` is still reachable, so the cover is
    // translucent or only partial. That is a held reading, not a dropped one.
    // A descendant of `from` in front of it is part of it, not a cover.
    if (hit.slice(0, index).some((front) => !from.contains(front))) {
      blockers.add("overlay")
    }
    for (const el of hit.slice(index)) {
      const cs = getComputedStyle(el)
      if (cs.backgroundImage !== "none") blockers.add("gradient")
      if (hasPaintedPseudo(el)) blockers.add("pseudo-background")
      for (const b of paintBlockers(cs, el.getBoundingClientRect())) {
        blockers.add(b)
      }
      const colour = readColour(cs.backgroundColor)
      const layer: RawColor = { ...colour, opacity: opacityOf(el) }
      stack.push(layer)
      // Nothing below an opaque layer contributes. The opacity test matters as
      // much as the colour's: an opaque paint inside a faded subtree still lets
      // what is behind it through.
      if (isOpaque(colour) && layer.opacity >= 1) break
    }
    return { stack, blockers, occluded: false }
  }

  // `elementsFromPoint` needs the point to be in the viewport, and a preview is
  // several screens tall. Scrolling only when the element is actually outside
  // keeps the common case — a run of siblings already on screen — from paying
  // for a scroll and a forced layout each.
  const bringIntoView = (el: Element): void => {
    const r = el.getBoundingClientRect()
    // The test is "fully inside", not "not fully outside". An element STRADDLING
    // the bottom edge passes the looser test, and then its centre — the point
    // every sample is taken at — is off-screen, `elementsFromPoint` returns an
    // empty list and the reading comes back as a `root-transparent` hold.
    // Measured: two of samsung's list rows held for exactly that reason.
    if (r.top < 0 || r.bottom > window.innerHeight) {
      el.scrollIntoView({ block: "center" })
    }
  }

  // Even after scrolling, a run taller than the viewport keeps line boxes
  // outside it. Sampling those would read an empty stack rather than a colour.
  const inViewport = (x: number, y: number): boolean =>
    x >= 0 && y >= 0 && x <= window.innerWidth && y <= window.innerHeight

  const text: Array<CollectedText> = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  while (walker.nextNode() !== null) {
    const node = walker.currentNode
    const raw = node.nodeValue ?? ""
    if (raw.trim() === "") continue
    // A colour emoji is painted from its own glyph table (COLR/CBDT), so
    // `color` does not reach it: the property the collector reads is inherited
    // and has nothing to do with what is on screen. toss reports 1.37:1 for a
    // cake and a lion that are fully legible. Runs that MIX emoji with words
    // are kept — the words are still coloured text.
    if (
      !/[^\p{Extended_Pictographic}\p{Emoji_Component}\p{Default_Ignorable_Code_Point}\s]/u.test(
        raw
      )
    ) {
      continue
    }
    const parent = node.parentElement
    if (parent === null) continue
    const cs = getComputedStyle(parent)
    if (cs.visibility === "hidden" || cs.display === "none") continue
    if (opacityOf(parent) === 0) continue
    // WCAG 2.x SC 1.4.3 exempts text that is part of an inactive user
    // interface component, and a preview demonstrates disabled states on
    // purpose. Without this, samsung's faded `disabled` button reports 1.26:1
    // and reads as the worst defect in the catalogue.
    if (parent.closest(":disabled, [aria-disabled='true']") !== null) continue

    const range = document.createRange()
    range.selectNodeContents(node)
    // Scrolled into view BEFORE the rects are read: outside the viewport
    // `elementsFromPoint` returns an empty list, and a preview is several
    // screens tall, so skipping this would leave most of the document with no
    // backdrop at all. The viewport is not grown to the document's height
    // instead, because that changes what `vh` and `@media (min-height)` resolve
    // to and would measure a rendering the catalogue never serves.
    bringIntoView(parent)
    // A rect of a pixel or less is the `.sr-only` clip pattern, which is text
    // for a screen reader rather than something a sighted reader contrasts.
    const rects = [...range.getClientRects()].filter(
      (r) => r.width > 1 && r.height > 1
    )
    range.detach()
    if (rects.length === 0) continue

    const blockers = new Set<Blocker>()
    // Gradient text: the glyphs are painted from a background image, so their
    // colour is not `color` and varies along the run.
    if (cs.backgroundClip === "text" || cs.webkitTextFillColor !== cs.color) {
      blockers.add("text-fill")
    }
    for (const b of paintBlockers(cs, parent.getBoundingClientRect())) {
      blockers.add(b)
    }

    // Each line box can sit on a different backdrop. The one closest in
    // lightness to the text is kept, so a run that crosses a light band and a
    // dark one is reported at its weakest line rather than averaged.
    // Every line box is carried across and `evaluateText` picks the weakest
    // by composed contrast. Choosing here is not possible: the only thing a
    // cheap in-page comparison has is the raw channels, and black on #ff0000
    // (5.25:1) and black on #0000ff (2.44:1) have the same channel sum — the
    // failing line would be discarded whenever the passing one came first.
    const stacks: Array<Array<RawColor>> = []
    for (const r of rects) {
      const px = r.left + r.width / 2
      const py = r.top + r.height / 2
      if (!inViewport(px, py)) continue
      const read = backdropAt(px, py, parent)
      if (read.occluded) continue
      for (const b of read.blockers) blockers.add(b)
      stacks.push(read.stack)
    }
    if (stacks.length === 0) continue

    text.push({
      path: pathOf(parent),
      sample: raw.trim().slice(0, 60),
      fontSizePx: Number.parseFloat(cs.fontSize),
      fontWeight: Number.parseFloat(cs.fontWeight) || 400,
      fg: { ...readColour(cs.color), opacity: opacityOf(parent) },
      stacks,
      blockers: [...blockers],
    })
  }

  // ---- Non-text surfaces (WCAG 2.x SC 1.4.11) --------------------------------
  //
  // The obvious selector — interactive elements and their descendants — is the
  // wrong one HERE. This catalogue's previews are deliberately non-semantic
  // mockups: samsung's toggle is `<span class="switch" aria-hidden="true">`
  // with no role at all (the `role="switch"` it used to carry was removed so a
  // `role="img"` mockup would not hold phantom focus targets), and #370 turned
  // yeogi's map buttons into spans for the same reason. An interactive selector
  // would find the toggle in the pre-fix oracle and nothing in the shipped
  // catalogue — passing its own test while measuring none of the real files.
  //
  // So every painted surface is measured and the noise is absorbed by the
  // three-value verdict. This is a survey, not a gate: a false positive costs a
  // reader one line, a false negative costs the survey its point.
  const nonText: Array<CollectedNonText> = []
  const viewportArea = window.innerWidth * window.innerHeight
  const SIDES = ["Top", "Right", "Bottom", "Left"] as const
  const TABLE_BOXES = [
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "td",
    "th",
    "caption",
    "colgroup",
    "col",
  ]
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el)
    if (cs.visibility === "hidden" || cs.display === "none") continue
    if (opacityOf(el) === 0) continue
    // SC 1.4.11 exempts inactive components, as 1.4.3 does for their text.
    if (el.closest(":disabled, [aria-disabled='true']") !== null) continue
    // A table's own boxes are a data structure, not components or graphics:
    // a cell's surface differing from the page is how a table is read, and
    // empty cells slip past the "owns text" test above. Only those boxes are
    // excluded — `closest("table")` also removed the real controls inside one,
    // and class101's admin table holds four live checkbox inputs that have no
    // text node for the text pass to reach them through.
    if (TABLE_BOXES.includes(el.localName)) continue
    // Text inside it already answers for it under SC 1.4.3, and a control
    // identified by its own label needs no separate boundary.
    const ownsText = [...el.childNodes].some(
      (n) => n.nodeType === 3 && (n.nodeValue ?? "").trim() !== ""
    )
    if (ownsText) continue

    const rect = el.getBoundingClientRect()
    if (rect.width < 2 || rect.height < 2) continue
    // A card, a list row, a table cell and a bottom bar are layout, not
    // components or graphics, and their surfaces differ from what is behind
    // them by design. Measured against the samsung fixture with only an area
    // cut at 5%, they were most of what came back and every one of them was a
    // false positive.
    //
    // Two conditions, because these previews give their surfaces no reliable
    // markup to ask instead: a control is SMALL and holds almost nothing. At 1%
    // of the viewport a 38x22 toggle and a 20x20 radio are far under and a list
    // row is over; the child count then drops the containers that are small
    // anyway. Both are survey settings to be re-read against the results, not
    // thresholds anyone has calibrated — the point is a signal a reader can
    // still see.
    if (rect.width * rect.height > viewportArea * 0.01) continue
    if (el.children.length > 2) continue

    const fill = isTransparent(cs.backgroundColor)
      ? null
      : { ...readColour(cs.backgroundColor), opacity: opacityOf(el) }
    // A border only draws a boundary where it has width. Computed style still
    // reports a colour for a zero-width border, so the width decides.
    let border: RawColor | null = null
    for (const side of SIDES) {
      const width = Number.parseFloat(cs[`border${side}Width`])
      const colour = cs[`border${side}Color`]
      if (width >= 1 && !isTransparent(colour)) {
        border = { ...readColour(colour), opacity: opacityOf(el) }
        break
      }
    }
    if (fill === null && border === null) continue
    // A background image is a colour this cannot read, the same as behind text.
    const blockers = new Set<Blocker>()
    if (cs.backgroundImage !== "none") blockers.add("gradient")
    for (const b of paintBlockers(cs, rect)) blockers.add(b)

    bringIntoView(el)
    const live = el.getBoundingClientRect()
    const cx = live.left + live.width / 2
    const cy = live.top + live.height / 2
    if (!inViewport(cx, cy)) continue
    const hit = document.elementsFromPoint(cx, cy)
    const index = hit.indexOf(el)
    // Not in its own hit list: something opaque covers it, or it takes no
    // pointer events. Either way what is behind it cannot be read from here.
    if (index === -1) continue
    // Reachable but not on top: a scrim, a sheet backdrop or an overlapping
    // sibling is over it, so its own fill and the layers behind it are not the
    // pixels a viewer sees. Its OWN descendants do not count — a radio's inner
    // dot sits over its centre and is part of the control, not something
    // covering it; counting those held 628 readings on the catalogue.
    if (hit.slice(0, index).some((front) => !el.contains(front))) {
      blockers.add("overlay")
    }
    const outer: Array<RawColor> = []
    if (coveredByOverlay(cx, cy, el)) blockers.add("overlay")
    for (const behind of hit.slice(index + 1)) {
      const bcs = getComputedStyle(behind)
      if (bcs.backgroundImage !== "none") blockers.add("gradient")
      if (hasPaintedPseudo(behind)) blockers.add("pseudo-background")
      const colour = readColour(bcs.backgroundColor)
      const layer: RawColor = { ...colour, opacity: opacityOf(behind) }
      outer.push(layer)
      if (isOpaque(colour) && layer.opacity >= 1) break
    }

    nonText.push({
      path: pathOf(el),
      fill,
      border,
      outer,
      blockers: [...blockers],
    })
  }

  return { text, nonText, overlayCandidates: overlayCandidates.length }
}
