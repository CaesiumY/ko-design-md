import { describe, expect, it } from "vitest"
import { paintOrder, reach } from "./contrast-pseudo"
import type { OrderBox, RawPseudo } from "./contrast-pseudo"

// An element in the paint order: `position: relative`, no `z-index`, nothing
// else that makes a stacking context.
const box = (over: Partial<OrderBox> = {}): OrderBox => ({
  position: "relative",
  zIndex: "auto",
  parentDisplay: "block",
  contextProps: [],
  pointerEvents: "auto",
  visibility: "visible",
  paintsBackgroundOrPseudo: false,
  ...over,
})

// A `::before` filling its 300x120 containing block at (100, 200), so its box
// is x 100..400, y 200..320, over a line box at x 200..300, y 248..272. Its
// owner is `box()`, and the text read is the owner's own (an empty chain).
const pseudo = (over: Partial<RawPseudo> = {}): RawPseudo => ({
  position: "absolute",
  transform: "none",
  translate: "none",
  rotate: "none",
  scale: "none",
  boxSizing: "content-box",
  top: "0px",
  left: "0px",
  width: "300px",
  height: "120px",
  marginTop: "0px",
  marginLeft: "0px",
  paddingTop: "0px",
  paddingRight: "0px",
  paddingBottom: "0px",
  paddingLeft: "0px",
  borderTopWidth: "0px",
  borderRightWidth: "0px",
  borderBottomWidth: "0px",
  borderLeftWidth: "0px",
  containingBlock: { left: 100, top: 200, display: "block", transforms: [] },
  unsure: [],
  area: { left: 200, top: 248, right: 300, bottom: 272 },
  ownerBox: { left: 100, top: 200, right: 400, bottom: 320 },
  ownerRadii: ["0px", "0px", "0px", "0px"],
  ownerCornerShapes: ["round", "round", "round", "round"],
  cornerShapes: ["round", "round", "round", "round"],
  which: "before",
  zIndex: "auto",
  paint: {
    onWhite: { r: 0, g: 0, b: 0 },
    onBlack: { r: 0, g: 0, b: 0 },
    opacity: 1,
  },
  radii: ["0px", "0px", "0px", "0px"],
  backgroundClip: "border-box",
  clipPath: "none",
  maskImage: "none",
  mixBlendMode: "normal",
  outline: { style: "none", width: "0px", offset: "0px" },
  owner: box(),
  chain: [],
  ...over,
})

describe("paintOrder — which side of what is read a pseudo-element paints on (#692)", () => {
  it("paints over the owner's own text in normal flow, either pseudo-element", () => {
    // Positioned paints after the normal flow of its stacking context.
    expect(paintOrder(pseudo())).toBe("above")
    expect(paintOrder(pseudo({ which: "after" }))).toBe("above")
    // A `z-index: 0` paints where `auto` does.
    expect(paintOrder(pseudo({ zIndex: "0" }))).toBe("above")
  })

  it("goes by document order against text in a positioned descendant", () => {
    // Both are positioned with `z-index` auto: `::before` comes before the
    // descendant in document order and paints first, `::after` after it.
    const chain = [box({ position: "static" }), box()]
    expect(paintOrder(pseudo({ chain }))).toBe("below")
    expect(paintOrder(pseudo({ chain, which: "after" }))).toBe("above")
  })

  it("paints under text in a descendant with a positive `z-index`", () => {
    // Socar's calendar: the end date's circle is `z-index: 0` and the date's
    // span is `position: relative; z-index: 1`.
    const chain = [box({ zIndex: "1" })]
    expect(paintOrder(pseudo({ zIndex: "0", chain }))).toBe("below")
    expect(paintOrder(pseudo({ which: "after", chain }))).toBe("below")
    expect(paintOrder(pseudo({ zIndex: "2", chain }))).toBe("above")
    // Equal `z-index`: document order again.
    expect(paintOrder(pseudo({ zIndex: "1", chain }))).toBe("below")
    expect(paintOrder(pseudo({ zIndex: "1", which: "after", chain }))).toBe(
      "above"
    )
  })

  it("places text by the outermost stacking context around it", () => {
    // `z-index: 5` inside `z-index: -1`: the outer one paints all of it, in
    // the negative layer of the owner's context — under a pseudo-element
    // with `z-index` auto.
    const chain = [box({ zIndex: "5" }), box({ zIndex: "-1" })]
    const owner = box({ zIndex: "0" })
    expect(paintOrder(pseudo({ owner, chain }))).toBe("above")
  })

  it("counts a stacking context made without `position`", () => {
    // A faded wrapper paints as if positioned with `z-index: 0`.
    const faded = [box({ position: "static", contextProps: ["opacity: 0.5"] })]
    expect(paintOrder(pseudo({ chain: faded }))).toBe("below")
    expect(paintOrder(pseudo({ chain: faded, which: "after" }))).toBe("above")
    // A flex item's `z-index` counts without `position`.
    const item = [
      box({ position: "static", zIndex: "1", parentDisplay: "inline-flex" }),
    ]
    expect(paintOrder(pseudo({ chain: item, which: "after" }))).toBe("below")
    // A faded block's `z-index` is ignored too: it paints where `z-index: 0`
    // would, before an `::after` with none.
    const fadedBlock = [
      box({
        position: "static",
        zIndex: "2",
        contextProps: ["opacity: 0.9"],
      }),
    ]
    expect(paintOrder(pseudo({ chain: fadedBlock, which: "after" }))).toBe(
      "above"
    )
    // A 3D context and a motion path make one too.
    for (const made of [
      "transform-style: preserve-3d",
      'offset-path: path("M0 0")',
    ]) {
      const chain = [box({ position: "static", contextProps: [made] })]
      expect(paintOrder(pseudo({ chain }))).toBe("below")
    }
    // A block's does not: it stays in the normal flow, under the wash.
    const block = [box({ position: "static", zIndex: "1" })]
    expect(paintOrder(pseudo({ chain: block }))).toBe("above")
  })

  it("puts a negative `z-index` over the owner's background when the owner is a stacking context", () => {
    expect(
      paintOrder(pseudo({ zIndex: "-1", owner: box({ zIndex: "0" }) }))
    ).toBe("below")
    expect(
      paintOrder(
        pseudo({
          zIndex: "-1",
          owner: box({ contextProps: ["isolation: isolate"] }),
        })
      )
    ).toBe("below")
  })

  it("puts a negative `z-index` under the owner's background when it is not one", () => {
    // #692's correction: the negative layer is then the next context out's,
    // painted before the owner.
    expect(paintOrder(pseudo({ zIndex: "-1" }))).toBe("under-owner")
    expect(
      paintOrder(pseudo({ zIndex: "-1", owner: box({ position: "static" }) }))
    ).toBe("under-owner")
  })

  it("is unsure of what it does not model", () => {
    // The owner is not an ancestor of what is read.
    expect(paintOrder(pseudo({ chain: null }))).toBe("unsure")
    // Text in a negative layer outside the owner.
    expect(paintOrder(pseudo({ chain: [box({ zIndex: "-1" })] }))).toBe(
      "unsure"
    )
    // A property whose effect depends on what it names.
    expect(
      paintOrder(
        pseudo({ chain: [box({ contextProps: ["will-change: transform"] })] })
      )
    ).toBe("unsure")
    expect(
      paintOrder(pseudo({ owner: box({ contextProps: ["contain: paint"] }) }))
    ).toBe("unsure")
    // A flex item's question passed through `display: contents`.
    expect(
      paintOrder(
        pseudo({
          chain: [
            box({ position: "static", zIndex: "1", parentDisplay: "contents" }),
          ],
        })
      )
    ).toBe("unsure")
    // A pseudo-element in normal flow.
    expect(paintOrder(pseudo({ position: "relative" }))).toBe("unsure")
  })
})

describe("reach — how much of the area a pseudo-element paints (#692)", () => {
  it("covers an area inside its plain box", () => {
    expect(reach(pseudo())).toBe("all")
  })

  it("misses an area its box does not overlap", () => {
    expect(reach(pseudo({ top: "100px", height: "2px" }))).toBe("none")
  })

  it("covers an area only when every corner is inside the rounded shape", () => {
    // A 30px circle centred on (250, 260), as `translate(-50%, -50%)` from
    // the containing block's (150, 60) puts it: x 235..265, y 245..275.
    const circle = (area: RawPseudo["area"]) =>
      pseudo({
        left: "150px",
        top: "60px",
        width: "30px",
        height: "30px",
        transform: "matrix(1, 0, 0, 1, -15, -15)",
        radii: ["9999px", "9999px", "9999px", "9999px"],
        area,
      })
    // A 16x16 line box centred in it: its corners are 8√2 ≈ 11.3px from the
    // centre, inside the 15px radius.
    expect(
      reach(circle({ left: 242, top: 252, right: 258, bottom: 268 }))
    ).toBe("all")
    // A 26x26 one: corners 13√2 ≈ 18.4px out, past the curve though inside
    // the box.
    expect(
      reach(circle({ left: 237, top: 247, right: 263, bottom: 273 }))
    ).toBe("unsure")
    // `50%` is half of each side: the same circle.
    expect(
      reach({
        ...circle({ left: 242, top: 252, right: 258, bottom: 268 }),
        radii: ["50%", "50%", "50%", "50%"],
      })
    ).toBe("all")
  })

  it("is unsure of a corner cut to a shape other than round", () => {
    // `corner-shape: bevel` makes the 50% radius a diamond, which leaves
    // the corners of a line box the ellipse would hold.
    const shaped = (shape: string) =>
      reach(
        pseudo({
          radii: ["50%", "50%", "50%", "50%"],
          cornerShapes: [shape, shape, shape, shape],
        })
      )
    expect(shaped("superellipse(0)")).toBe("unsure")
    // Chromium writes `round` as `superellipse(1)`; an unknown property
    // reads as empty. Both are the ellipse, which holds the line here.
    for (const round of ["round", "superellipse(1)", ""]) {
      expect(shaped(round)).toBe("all")
    }
    // A box that misses the area still misses it, whatever its corners.
    expect(
      reach(
        pseudo({
          top: "100px",
          height: "2px",
          cornerShapes: ["bevel", "bevel", "bevel", "bevel"],
        })
      )
    ).toBe("none")
  })

  it("covers only part of an area that runs past its box", () => {
    expect(reach(pseudo({ top: "60px", height: "60px" }))).toBe("unsure")
  })

  it("is unsure where what it paints is not its background over its box", () => {
    expect(reach(pseudo({ borderTopWidth: "1px" }))).toBe("unsure")
    expect(reach(pseudo({ clipPath: "inset(10px)" }))).toBe("unsure")
    expect(
      reach(pseudo({ maskImage: "linear-gradient(black, transparent)" }))
    ).toBe("unsure")
    expect(reach(pseudo({ backgroundClip: "text" }))).toBe("unsure")
    expect(
      reach(pseudo({ backgroundClip: "content-box", paddingTop: "4px" }))
    ).toBe("unsure")
    // With no padding, the content box is the border box.
    expect(reach(pseudo({ backgroundClip: "content-box" }))).toBe("all")
  })

  describe("an outline", () => {
    // Ridi's book covers: `outline: 1px solid; outline-offset: -1px` draws
    // a ring in the outermost pixel of the box, inside it.
    const ring = (width: string, offset: string) => ({
      outline: { style: "solid", width, offset },
    })

    it("drawn inside the box leaves a line clear of the ring covered", () => {
      expect(reach(pseudo(ring("1px", "-1px")))).toBe("all")
      // A box that misses the line still misses it.
      expect(
        reach(pseudo({ ...ring("1px", "-1px"), top: "100px", height: "2px" }))
      ).toBe("none")
    })

    it("holds a line within the ring's reach of the edge", () => {
      // The ring is 4px in from the box at x 100: a line from x 102 is on it.
      expect(
        reach(
          pseudo({
            ...ring("2px", "-4px"),
            area: { left: 102, top: 248, right: 300, bottom: 272 },
          })
        )
      ).toBe("unsure")
    })

    it("holds one that paints past the box, as #691 did", () => {
      // 1px wide at offset 0 is a ring just outside the box, onto whatever
      // is beside it: the box no longer says where it paints.
      expect(
        reach(pseudo({ ...ring("1px", "0px"), top: "100px", height: "2px" }))
      ).toBe("unsure")
    })

    it("is nothing when it is not drawn", () => {
      expect(
        reach(
          pseudo({ outline: { style: "none", width: "3px", offset: "4px" } })
        )
      ).toBe("all")
      expect(reach(pseudo(ring("0px", "4px")))).toBe("all")
    })
  })
})
