import { describe, expect, it } from "vitest"
import {
  compositeOver,
  contrastRatio,
  controlTextSample,
  evaluateNonText,
  evaluateText,
  flattenStack,
  isEmojiOnly,
  judge,
  recoverAlpha,
  textThreshold,
} from "./contrast"
import type { RawColor, RawControl } from "./contrast"

const WHITE = { r: 255, g: 255, b: 255 }
const BLACK = { r: 0, g: 0, b: 0 }

describe("contrastRatio", () => {
  // Fixtures whose expected values come from outside this file: the WCAG 2.x
  // definition fixes the extremes at 21:1 and 1:1, and the two greys are the
  // ones WebAIM's contrast checker publishes as the thresholds for 4.5:1 and
  // 7:1 on white. Nothing here recomputes the ratio the way the code does.
  it("reaches 21:1 for black on white, the maximum sRGB can express", () => {
    expect(contrastRatio(BLACK, WHITE)).toBeCloseTo(21, 5)
  })

  it("is 1:1 for a colour against itself", () => {
    expect(contrastRatio(WHITE, WHITE)).toBeCloseTo(1, 5)
    expect(
      contrastRatio({ r: 118, g: 118, b: 118 }, { r: 118, g: 118, b: 118 })
    ).toBeCloseTo(1, 5)
  })

  it("puts #767676 on white at the published 4.54:1", () => {
    expect(contrastRatio({ r: 118, g: 118, b: 118 }, WHITE)).toBeCloseTo(
      4.54,
      2
    )
  })

  it("puts #595959 on white at the published 7.00:1", () => {
    expect(contrastRatio({ r: 89, g: 89, b: 89 }, WHITE)).toBeCloseTo(7.0, 2)
  })

  it("does not care which colour is named first", () => {
    const fg = { r: 30, g: 90, b: 200 }
    const bg = { r: 240, g: 240, b: 230 }
    expect(contrastRatio(fg, bg)).toBeCloseTo(contrastRatio(bg, fg), 10)
  })
})

describe("recoverAlpha", () => {
  // The collector cannot read a colour's alpha directly: reading a translucent
  // canvas back through getImageData round-trips premultiplied bytes and loses
  // a few units per channel, which is enough to move a 4.52:1 judgement across
  // its threshold. So it paints the same colour twice, once over white and once
  // over black, and this undoes the two composites.
  //
  // Expected values below are the CSS simple-alpha-compositing formula
  // (result = C*a + B*(1-a)) applied BY HAND in the forward direction, so the
  // assertion does not recompute what the implementation computes.
  it("reports alpha 1 and the colour itself when both paints agree", () => {
    const got = recoverAlpha({ r: 18, g: 52, b: 86 }, { r: 18, g: 52, b: 86 })
    expect(got.a).toBeCloseTo(1, 3)
    expect([got.r, got.g, got.b]).toEqual([18, 52, 86])
  })

  it("reports alpha 0 when white stayed white and black stayed black", () => {
    expect(recoverAlpha(WHITE, BLACK).a).toBeCloseTo(0, 3)
  })

  it("recovers 50% black: over white it reads 128, over black it reads 0", () => {
    const got = recoverAlpha({ r: 128, g: 128, b: 128 }, BLACK)
    expect(got.a).toBeCloseTo(0.5, 2)
    expect([got.r, got.g, got.b]).toEqual([0, 0, 0])
  })

  it("recovers 50% red across channels that rounded differently", () => {
    // #ff0000 at 50%: over white (255, 127.5, 127.5), over black (127.5, 0, 0).
    // The canvas rounds each to 255/128/128 and 128/0/0, so the per-channel
    // differences are 127, 128, 128 — not one number. Averaging them is what
    // keeps the recovered alpha off the rounding of any single channel.
    const got = recoverAlpha({ r: 255, g: 128, b: 128 }, { r: 128, g: 0, b: 0 })
    expect(got.a).toBeCloseTo(0.5, 2)
    expect(got.r).toBeCloseTo(255, 0)
    expect(got.g).toBeCloseTo(0, 0)
    expect(got.b).toBeCloseTo(0, 0)
  })

  it("clamps a recovered channel that rounding pushed past 255", () => {
    const got = recoverAlpha({ r: 255, g: 128, b: 128 }, { r: 128, g: 0, b: 0 })
    expect(got.r).toBeLessThanOrEqual(255)
  })
})

describe("compositeOver", () => {
  // Expected values are the CSS simple-alpha-compositing formula worked by
  // hand: C*a + B*(1-a) per channel.
  it("leaves an opaque foreground alone", () => {
    expect(compositeOver({ r: 10, g: 20, b: 30, a: 1 }, WHITE)).toEqual({
      r: 10,
      g: 20,
      b: 30,
    })
  })

  it("leaves the background alone under a fully transparent foreground", () => {
    expect(compositeOver({ r: 10, g: 20, b: 30, a: 0 }, WHITE)).toEqual(WHITE)
  })

  it("puts 50% black on white halfway between them", () => {
    const got = compositeOver({ r: 0, g: 0, b: 0, a: 0.5 }, WHITE)
    expect(got.r).toBeCloseTo(127.5, 6)
  })

  it("mixes each channel independently", () => {
    // 50% #ff0000 over #0000ff: red keeps half of 255, blue keeps half of 255.
    const got = compositeOver(
      { r: 255, g: 0, b: 0, a: 0.5 },
      { r: 0, g: 0, b: 255 }
    )
    expect(got.r).toBeCloseTo(127.5, 6)
    expect(got.g).toBeCloseTo(0, 6)
    expect(got.b).toBeCloseTo(127.5, 6)
  })
})

describe("flattenStack", () => {
  // Layers arrive topmost first, the order `document.elementsFromPoint` uses.
  it("stops at the first opaque layer", () => {
    const got = flattenStack([
      { r: 12, g: 34, b: 56, a: 1 },
      { r: 255, g: 255, b: 255, a: 1 },
    ])
    expect(got.color).toEqual({ r: 12, g: 34, b: 56 })
    expect(got.rootTransparent).toBe(false)
  })

  it("composites one translucent layer onto the opaque one behind it", () => {
    const got = flattenStack([
      { r: 0, g: 0, b: 0, a: 0.5 },
      { r: 255, g: 255, b: 255, a: 1 },
    ])
    expect(got.color.r).toBeCloseTo(127.5, 6)
    expect(got.rootTransparent).toBe(false)
  })

  it("composites translucent layers in order, back to front", () => {
    // Two 50% blacks over white: white → 127.5 → 63.75. Stacking them in the
    // other order would give the same number here, so the third layer is a
    // different colour to make the order observable.
    const got = flattenStack([
      { r: 0, g: 0, b: 0, a: 0.5 },
      { r: 255, g: 0, b: 0, a: 0.5 },
      { r: 255, g: 255, b: 255, a: 1 },
    ])
    // Back to front: white, then 50% red → (255, 127.5, 127.5), then 50% black
    // → (127.5, 63.75, 63.75).
    expect(got.color.r).toBeCloseTo(127.5, 4)
    expect(got.color.g).toBeCloseTo(63.75, 4)
    expect(got.color.b).toBeCloseTo(63.75, 4)
  })

  it("flags a stack that never reaches an opaque layer", () => {
    const got = flattenStack([{ r: 0, g: 0, b: 0, a: 0.5 }])
    expect(got.rootTransparent).toBe(true)
  })

  it("flags an empty stack rather than inventing a background", () => {
    expect(flattenStack([]).rootTransparent).toBe(true)
  })

  it("falls back to white behind a transparent root, as the light site chrome is", () => {
    // The preview is embedded in an iframe on a page whose chrome is pinned to
    // light, so what shows through is white. The flag is what tells a reader
    // the number rests on that assumption.
    expect(flattenStack([]).color).toEqual(WHITE)
  })
})

describe("textThreshold", () => {
  // WCAG 2.x SC 1.4.3: large text is 18pt, or 14pt when bold. The catalogue's
  // previews are authored in CSS px, and 1pt is 4/3px.
  it("asks 4.5:1 of body text", () => {
    expect(textThreshold(16, 400)).toBe(4.5)
  })

  it("asks 3:1 of text at 18pt and above", () => {
    expect(textThreshold(24, 400)).toBe(3)
  })

  it("still asks 4.5:1 just under 18pt", () => {
    expect(textThreshold(23.9, 400)).toBe(4.5)
  })

  it("asks 3:1 of bold text at 14pt and above", () => {
    expect(textThreshold((14 * 4) / 3, 700)).toBe(3)
  })

  it("does not round 14pt up — 18.66px bold is still small text", () => {
    // 14pt is 18.6666…px. Writing the constant as 18.67 would drop 18.666 into
    // the large-text bucket and quietly relax the threshold on real previews.
    expect(textThreshold(18.66, 700)).toBe(4.5)
  })

  it("treats semibold as small text, because WCAG says bold", () => {
    expect(textThreshold(19, 600)).toBe(4.5)
    expect(textThreshold(19, 700)).toBe(3)
  })
})

describe("judge", () => {
  // Reading a colour back as 8-bit channels quantises the ratio by roughly
  // ±0.02, so a value sitting on its threshold cannot honestly be called pass
  // or fail. The band is wider than that error on purpose.
  it("passes a ratio clear of its threshold", () => {
    expect(judge(4.7, 4.5)).toBe("pass")
  })

  it("fails a ratio clear of its threshold", () => {
    // The samsung dark accent button before 2ead71d.
    expect(judge(3.01, 4.5)).toBe("fail")
  })

  it("calls the samsung light accent button borderline, not a pass", () => {
    // 4.52:1 — white on the published primary-dark. The pair cannot be moved
    // without changing a published colour, which is why the file carries a
    // guard comment instead of a fix.
    expect(judge(4.52, 4.5)).toBe("borderline")
  })

  it("takes the lower edge into the band and gives the upper edge to pass", () => {
    expect(judge(4.4, 4.5)).toBe("borderline")
    expect(judge(4.6, 4.5)).toBe("pass")
    expect(judge(4.39, 4.5)).toBe("fail")
    expect(judge(4.59, 4.5)).toBe("borderline")
  })

  it("applies the same band to the 3:1 threshold", () => {
    expect(judge(2.9, 3)).toBe("borderline")
    expect(judge(1.64, 3)).toBe("fail")
  })
})

// A colour as the collector reports it: the same paint read over white and
// over black, plus the opacity its ancestors impose. Nothing in the browser
// recovers the alpha — that arithmetic lives in `recoverAlpha` alone.
const opaque = (r: number, g: number, b: number, opacity = 1) => ({
  onWhite: { r, g, b },
  onBlack: { r, g, b },
  opacity,
})

describe("evaluateText", () => {
  it("measures black body text on white at the 4.5:1 threshold", () => {
    const got = evaluateText({
      fontSizePx: 16,
      fontWeight: 400,
      fg: opaque(0, 0, 0),
      lines: [{ stack: [opaque(255, 255, 255)], blockers: [] }],
      blockers: [],
    })
    expect(got.ratio).toBeCloseTo(21, 5)
    expect(got.threshold).toBe(4.5)
    expect(got.verdict).toBe("pass")
  })

  it("applies the large-text threshold from the sample's own size", () => {
    const got = evaluateText({
      fontSizePx: 28,
      fontWeight: 400,
      fg: opaque(0, 0, 0),
      lines: [{ stack: [opaque(255, 255, 255)], blockers: [] }],
      blockers: [],
    })
    expect(got.threshold).toBe(3)
  })

  it("composites a translucent backdrop before measuring", () => {
    // 50% black over white is #808080-ish; black text on that is much weaker
    // than 21:1. Reading the top layer alone would report 21 and pass.
    const got = evaluateText({
      fontSizePx: 16,
      fontWeight: 400,
      fg: opaque(0, 0, 0),
      lines: [
        {
          stack: [
            {
              onWhite: { r: 128, g: 128, b: 128 },
              onBlack: { r: 0, g: 0, b: 0 },
              opacity: 1,
            },
            opaque(255, 255, 255),
          ],
          blockers: [],
        },
      ],
      blockers: [],
    })
    expect(got.ratio).toBeLessThan(6)
    expect(got.ratio).toBeGreaterThan(5)
  })

  it("fades the foreground by the opacity its ancestors impose", () => {
    // A disabled-state demo: black text at 40% over white reads as a mid grey,
    // so its contrast is nowhere near 21:1.
    const got = evaluateText({
      fontSizePx: 16,
      fontWeight: 400,
      fg: opaque(0, 0, 0, 0.4),
      lines: [{ stack: [opaque(255, 255, 255)], blockers: [] }],
      blockers: [],
    })
    expect(got.ratio).toBeLessThan(21)
    expect(got.opacityApprox).toBe(true)
  })

  it("withholds a verdict when something blocks the reading", () => {
    // A filter on the text means the colours read are the ones before it, so a
    // single ratio cannot speak for the run. The number is still reported — a
    // reader wants to see it — but the verdict is not pass or fail.
    const got = evaluateText({
      fontSizePx: 16,
      fontWeight: 400,
      fg: opaque(0, 0, 0),
      lines: [{ stack: [opaque(255, 255, 255)], blockers: [] }],
      blockers: ["filter"],
    })
    expect(got.verdict).toBe("indeterminate")
    expect(got.ratio).toBeCloseTo(21, 5)
  })

  it("reports a stack that never reached an opaque layer as a blocker", () => {
    const got = evaluateText({
      fontSizePx: 16,
      fontWeight: 400,
      fg: opaque(0, 0, 0),
      lines: [
        {
          stack: [
            {
              onWhite: { r: 128, g: 128, b: 128 },
              onBlack: { r: 0, g: 0, b: 0 },
              opacity: 1,
            },
          ],
          blockers: [],
        },
      ],
      blockers: [],
    })
    expect(got.blockers).toContain("root-transparent")
    expect(got.verdict).toBe("indeterminate")
  })
})

describe("evaluateNonText", () => {
  const onWhite = [opaque(255, 255, 255)]

  it("asks 3:1 of a component surface, never 4.5:1", () => {
    const got = evaluateNonText({
      fill: opaque(0, 0, 0),
      border: null,
      outer: onWhite,
      blockers: [],
    })
    expect(got?.threshold).toBe(3)
  })

  it("passes a track that stands clear of the surface behind it", () => {
    // #595959 on white is 7:1 — far above the 3:1 SC 1.4.11 asks.
    const got = evaluateNonText({
      fill: opaque(89, 89, 89),
      border: null,
      outer: onWhite,
      blockers: [],
    })
    expect(got?.verdict).toBe("pass")
    expect(got?.basis).toBe("fill")
  })

  it("fails an off-state track that barely separates from its card", () => {
    // The shape of the samsung defect: a light grey track on a white card.
    const got = evaluateNonText({
      fill: opaque(213, 213, 213),
      border: null,
      outer: onWhite,
      blockers: [],
    })
    expect(got?.verdict).toBe("fail")
  })

  it("judges a bordered control by its border when it has no fill", () => {
    // The radio's shape: transparent inside, a 2px ring doing the work.
    const got = evaluateNonText({
      fill: null,
      border: opaque(89, 89, 89),
      outer: onWhite,
      blockers: [],
    })
    expect(got?.verdict).toBe("pass")
    expect(got?.basis).toBe("border")
  })

  it("lets a strong border rescue a weak fill", () => {
    // Identification needs one visible boundary, not two. A fill that matches
    // its surround is fine when the ring around it is legible.
    const got = evaluateNonText({
      fill: opaque(250, 250, 250),
      border: opaque(0, 0, 0),
      outer: onWhite,
      blockers: [],
    })
    expect(got?.verdict).toBe("pass")
    expect(got?.basis).toBe("border")
  })

  it("fails a control whose fill and border are both faint", () => {
    const got = evaluateNonText({
      fill: opaque(246, 246, 246),
      border: opaque(238, 238, 238),
      outer: onWhite,
      blockers: [],
    })
    expect(got?.verdict).toBe("fail")
  })

  it("sees a border against the fill inside it, not only the surround", () => {
    // A dark chip on a dark page with a light ring: the ring is invisible
    // against what is behind the chip but separates it from its own fill.
    const got = evaluateNonText({
      fill: opaque(0, 0, 0),
      border: opaque(255, 255, 255),
      outer: [opaque(250, 250, 250)],
      blockers: [],
    })
    expect(got?.verdict).toBe("pass")
  })

  it("has nothing to measure when the element has neither fill nor border", () => {
    expect(
      evaluateNonText({
        fill: null,
        border: null,
        outer: onWhite,
        blockers: [],
      })
    ).toBeNull()
  })

  it("withholds a verdict when something blocks the reading", () => {
    const got = evaluateNonText({
      fill: opaque(213, 213, 213),
      border: null,
      outer: onWhite,
      blockers: ["overlay"],
    })
    expect(got?.verdict).toBe("indeterminate")
  })
})

describe("evaluateText — one stack per line box", () => {
  const run = (stacks: Array<Array<ReturnType<typeof opaque>>>) =>
    evaluateText({
      fontSizePx: 16,
      fontWeight: 400,
      fg: opaque(0, 0, 0),
      lines: stacks.map((stack) => ({ stack, blockers: [] })),
      blockers: [],
    })

  it("reports the weakest line box, not whichever came first", () => {
    // A run that wraps across a red band and a blue one. Black on #ff0000 is
    // 5.25:1 and black on #0000ff is 2.44:1 — but the two backdrops have the
    // SAME raw channel sum, so any comparison by summed channels calls them
    // equal and keeps the first. The expected values come from the WCAG
    // formula, not from this implementation.
    expect(run([[opaque(255, 0, 0)], [opaque(0, 0, 255)]]).ratio).toBeCloseTo(
      2.44,
      1
    )
  })

  it("does not care which line box came first", () => {
    const a = run([[opaque(255, 0, 0)], [opaque(0, 0, 255)]])
    const b = run([[opaque(0, 0, 255)], [opaque(255, 0, 0)]])
    expect(a.ratio).toBeCloseTo(b.ratio, 10)
  })

  it("keeps a single line box's reading unchanged", () => {
    expect(run([[opaque(255, 255, 255)]]).ratio).toBeCloseTo(21, 5)
  })

  it("holds a run whose weakest line never reached an opaque layer", () => {
    // The blocker has to describe the line the verdict rests on. A run with
    // one solid line and one transparent-rooted line is judged on whichever
    // measured worse.
    // Light grey text: strong on the black line, weak on the line that fell
    // through to the white fallback. The weak one is the transparent-rooted
    // one, so its blocker is the one that has to survive.
    const got = evaluateText({
      fontSizePx: 16,
      fontWeight: 400,
      fg: opaque(240, 240, 240),
      lines: [
        { stack: [opaque(0, 0, 0)], blockers: [] },
        {
          stack: [
            {
              onWhite: { r: 255, g: 255, b: 255 },
              onBlack: { r: 0, g: 0, b: 0 },
              opacity: 1,
            },
          ],
          blockers: [],
        },
      ],
      blockers: [],
    })
    expect(got.blockers).toContain("root-transparent")
    expect(got.verdict).toBe("indeterminate")
  })

  it("keeps a solid line's verdict when the weak line is the solid one", () => {
    // The mirror of the case above: here the black-backed line is the weaker
    // reading, so the other line's transparent root must NOT hold the verdict.
    const got = evaluateText({
      fontSizePx: 16,
      fontWeight: 400,
      fg: opaque(40, 40, 40),
      lines: [
        { stack: [opaque(0, 0, 0)], blockers: [] },
        {
          stack: [
            {
              onWhite: { r: 255, g: 255, b: 255 },
              onBlack: { r: 0, g: 0, b: 0 },
              opacity: 1,
            },
          ],
          blockers: [],
        },
      ],
      blockers: [],
    })
    expect(got.blockers).not.toContain("root-transparent")
    expect(got.verdict).toBe("fail")
  })
})

describe("isEmojiOnly", () => {
  // A colour emoji is painted from its own glyph table (COLR/CBDT), so `color`
  // never reaches it and measuring the inherited value says nothing about what
  // is on screen. Everything else is text and must be measured.
  it("holds plain text", () => {
    for (const t of ["확인", "OK", "74,200", "a 1"]) {
      expect(isEmojiOnly(t), t).toBe(false)
    }
  })

  it("holds text made only of digits", () => {
    // The case that prompted this function. `\p{Emoji_Component}` covers the
    // parts a KEYCAP sequence is built from — ASCII 0-9, `#` and `*` — so a
    // class built on it swallowed every digit-only run: toss's calendar cells
    // and gmarket's count badges were dropped from the sweep entirely, and a
    // survey that exists to report how many readings fail reported fewer.
    for (const t of ["3", "12", "00", "128", "#", "*", "1 2"]) {
      expect(isEmojiOnly(t), t).toBe(false)
    }
  })

  it("skips a run that is only emoji", () => {
    for (const t of ["🎂", "😊😊", "🦁"]) {
      expect(isEmojiOnly(t), t).toBe(true)
    }
  })

  it("skips emoji built from more than one code point", () => {
    // A flag is two regional indicators, a keycap is digit + VS16 + U+20E3,
    // and a skin tone is a modifier — none of them is Extended_Pictographic on
    // its own, so a check for that property alone would measure all three.
    expect(isEmojiOnly("🇰🇷")).toBe(true)
    expect(isEmojiOnly("1️⃣")).toBe(true)
    expect(isEmojiOnly("👍🏽")).toBe(true)
  })

  it("keeps a run that mixes emoji with words", () => {
    // The words are still coloured text, whatever sits beside them.
    expect(isEmojiOnly("🎂 케이크")).toBe(false)
    expect(isEmojiOnly("🦁 사자")).toBe(false)
  })
})

describe("evaluateText — a blocker belongs to the line it came from", () => {
  const twoLines = (
    lines: Array<{
      stack: Array<ReturnType<typeof opaque>>
      blockers: Array<"pseudo-background" | "overlay">
    }>
  ) =>
    evaluateText({
      fontSizePx: 16,
      fontWeight: 400,
      fg: opaque(0, 0, 0),
      lines,
      blockers: [],
    })

  it("does not let a stronger line's blocker withhold the verdict", () => {
    // The run wraps. The first line is the weak one and sits on a plain
    // surface; the second is stronger and happens to sit over a painted
    // `::before`. Taking the union would hold the whole run for a
    // pseudo-element that has nothing to do with the line the verdict rests on
    // — reporting nothing where there is a real failure to report.
    const got = twoLines([
      { stack: [opaque(80, 80, 80)], blockers: [] },
      { stack: [opaque(255, 255, 255)], blockers: ["pseudo-background"] },
    ])
    expect(got.verdict).toBe("fail")
    expect(got.blockers).toEqual([])
  })

  it("does hold when the blocker is on the line the verdict rests on", () => {
    const got = twoLines([
      { stack: [opaque(80, 80, 80)], blockers: ["pseudo-background"] },
      { stack: [opaque(255, 255, 255)], blockers: [] },
    ])
    expect(got.verdict).toBe("indeterminate")
    expect(got.blockers).toContain("pseudo-background")
  })

  it("keeps a blocker that belongs to the whole node, whichever line wins", () => {
    // `text-fill` and a filter on the text element itself are properties of
    // the run, not of one line box.
    const got = evaluateText({
      fontSizePx: 16,
      fontWeight: 400,
      fg: opaque(0, 0, 0),
      blockers: ["text-fill"],
      lines: [
        { stack: [opaque(80, 80, 80)], blockers: [] },
        { stack: [opaque(255, 255, 255)], blockers: [] },
      ],
    })
    expect(got.verdict).toBe("indeterminate")
    expect(got.blockers).toContain("text-fill")
  })

  it("does not report the same blocker twice", () => {
    const got = evaluateText({
      fontSizePx: 16,
      fontWeight: 400,
      fg: opaque(0, 0, 0),
      blockers: ["pseudo-background"],
      lines: [{ stack: [opaque(80, 80, 80)], blockers: ["pseudo-background"] }],
    })
    expect(got.blockers).toEqual(["pseudo-background"])
  })
})

// The pair a verdict rests on, reported so a reading can be checked against
// the colours the entry publishes. Only ever read: the dedupe key does not see
// it, because the ratio already stands in for the pair.
describe("the colour pair a measurement reports", () => {
  it("is the one the weakest line sits on, not the last one read", () => {
    const got = evaluateText({
      fontSizePx: 16,
      fontWeight: 400,
      fg: opaque(0, 0, 0),
      lines: [
        { stack: [opaque(255, 255, 255)], blockers: [] },
        { stack: [opaque(64, 64, 64)], blockers: [] },
      ],
      blockers: [],
    })
    expect(got.bg).toBe("#404040")
    expect(got.fg).toBe("#000000")
  })

  it("is the text composited over its backdrop, not the paint as declared", () => {
    // Half-transparent black on white reads as mid grey. Reporting #000000
    // would name a colour nobody sees and would not match any published token.
    const got = evaluateText({
      fontSizePx: 16,
      fontWeight: 400,
      fg: {
        onWhite: { r: 128, g: 128, b: 128 },
        onBlack: { r: 0, g: 0, b: 0 },
        opacity: 1,
      },
      lines: [{ stack: [opaque(255, 255, 255)], blockers: [] }],
      blockers: [],
    })
    expect(got.fg).toBe("#808080")
    expect(got.bg).toBe("#ffffff")
  })
})

describe("the colour pair a non-text measurement reports", () => {
  it("is the fill against what is behind it when the fill decides", () => {
    const got = evaluateNonText({
      fill: opaque(0, 0, 0),
      border: null,
      outer: [opaque(255, 255, 255)],
      blockers: [],
    })
    expect(got?.basis).toBe("fill")
    expect(got?.fg).toBe("#000000")
    expect(got?.bg).toBe("#ffffff")
  })

  it("is the border against the side it actually won on", () => {
    // A white ring around a black chip on a mid-grey page. The ring separates
    // from the chip far better than from the page, so the ratio comes from
    // ring-against-fill — and naming ring-against-page beside it would point a
    // fix at the colour that did not decide anything.
    const got = evaluateNonText({
      fill: opaque(0, 0, 0),
      border: opaque(255, 255, 255),
      outer: [opaque(60, 60, 60)],
      blockers: [],
    })
    expect(got?.basis).toBe("border")
    expect(got?.fg).toBe("#ffffff")
    expect(got?.bg).toBe("#000000")
  })
})

describe("controlTextSample — the text a form control shows", () => {
  // The text pass does not measure a form control's text: a placeholder and a
  // value are attributes and form state, and a select's option text node has
  // no client rects. The collector reads all of it raw and this decides which, if any,
  // is on screen and in which colour — the same split as `isEmojiOnly`.
  const grey: RawColor = {
    onWhite: { r: 128, g: 128, b: 128 },
    onBlack: { r: 128, g: 128, b: 128 },
    opacity: 1,
  }
  const ink: RawColor = {
    onWhite: { r: 20, g: 20, b: 20 },
    onBlack: { r: 20, g: 20, b: 20 },
    opacity: 1,
  }
  const paper: RawColor = {
    onWhite: { r: 255, g: 255, b: 255 },
    onBlack: { r: 255, g: 255, b: 255 },
    opacity: 1,
  }
  const control = (over: Partial<RawControl>): RawControl => ({
    path: "div.field > input",
    tag: "input",
    type: "text",
    value: "",
    placeholder: "",
    placeholderShown: false,
    selectedText: "",
    listbox: false,
    own: { fg: ink, fontSizePx: 16, fontWeight: 400, textFill: false },
    placeholderStyle: {
      fg: grey,
      fontSizePx: 16,
      fontWeight: 400,
      textFill: false,
    },
    lines: [{ stack: [paper], blockers: [] }],
    blockers: [],
    ...over,
  })

  it("reads a shown placeholder in the ::placeholder colour, not the field's", () => {
    const got = controlTextSample(
      control({ placeholder: "이메일", placeholderShown: true })
    )
    expect(got?.source).toBe("placeholder")
    expect(got?.text).toBe("이메일")
    expect(got?.sample.fg).toBe(grey)
  })

  it("reads the value once there is one, whatever the placeholder says", () => {
    const got = controlTextSample(
      control({ value: "홍길동", placeholder: "이름", placeholderShown: false })
    )
    expect(got?.source).toBe("value")
    expect(got?.text).toBe("홍길동")
    expect(got?.sample.fg).toBe(ink)
  })

  it("has nothing to read in an empty field without a placeholder", () => {
    expect(controlTextSample(control({}))).toBeNull()
  })

  it("does not read a placeholder the browser is not showing", () => {
    // `placeholderShown` is the browser's own answer; a placeholder attribute
    // on a field it hides (a textarea with content) is not on screen.
    expect(
      controlTextSample(
        control({ placeholder: "메모", placeholderShown: false })
      )
    ).toBeNull()
  })

  it("has no text to read in a checkbox, a radio or a range", () => {
    for (const type of ["checkbox", "radio", "range", "button", "submit"]) {
      expect(
        controlTextSample(
          control({
            type,
            value: "on",
            placeholder: "x",
            placeholderShown: true,
          })
        ),
        type
      ).toBeNull()
    }
  })

  it("reads a password as the dots it shows, never the value", () => {
    const got = controlTextSample(
      control({ type: "password", value: "hunter2" })
    )
    expect(got?.source).toBe("value")
    expect(got?.text).toBe("•••••••")
    expect(got?.text).not.toContain("hunter2")
  })

  it("reads a closed select's chosen option in the select's own colour", () => {
    const got = controlTextSample(
      control({ tag: "select", type: "", selectedText: "서울특별시" })
    )
    expect(got?.source).toBe("option")
    expect(got?.text).toBe("서울특별시")
    expect(got?.sample.fg).toBe(ink)
  })

  it("reads a textarea by the same rule as an input", () => {
    expect(
      controlTextSample(
        control({
          tag: "textarea",
          type: "",
          placeholder: "내용",
          placeholderShown: true,
        })
      )?.source
    ).toBe("placeholder")
  })

  it("judges a large placeholder against the large-text bar", () => {
    // 24px is large text at any weight, so the bar is 3:1 — and it is the
    // PLACEHOLDER's size that counts, which can differ from the field's.
    const small = controlTextSample(
      control({ placeholder: "검색", placeholderShown: true })
    )
    const large = controlTextSample(
      control({
        placeholder: "검색",
        placeholderShown: true,
        own: { fg: ink, fontSizePx: 16, fontWeight: 400, textFill: false },
        placeholderStyle: {
          fg: grey,
          fontSizePx: 24,
          fontWeight: 400,
          textFill: false,
        },
      })
    )
    expect(small && evaluateText(small.sample).threshold).toBe(4.5)
    expect(large && evaluateText(large.sample).threshold).toBe(3)
  })

  it("does not read a select that shows a list rather than one closed choice", () => {
    // A `multiple` or `size > 1` select shows every option at once, the chosen
    // one on a highlight; one reading in the select's colours would not
    // describe it. Not measured, and recorded as a Known gap.
    expect(
      controlTextSample(
        control({
          tag: "select",
          type: "",
          selectedText: "서울",
          listbox: true,
        })
      )
    ).toBeNull()
  })

  it("does not read a control whose text is emoji only", () => {
    // Colour emoji are not painted with `color`, so the text pass skips an
    // emoji-only run (`isEmojiOnly`); a control's text gets the same test.
    expect(
      controlTextSample(control({ placeholder: "🔍", placeholderShown: true }))
    ).toBeNull()
    expect(
      controlTextSample(
        control({ tag: "select", type: "", selectedText: "🇰🇷" })
      )
    ).toBeNull()
    expect(
      controlTextSample(
        control({ placeholder: "🔍 검색", placeholderShown: true })
      )?.source
    ).toBe("placeholder")
  })

  it("has nothing to read in a value of spaces only", () => {
    // The text pass skips a whitespace-only node; a field showing only
    // spaces shows no glyph either.
    expect(controlTextSample(control({ value: "   " }))).toBeNull()
  })

  it("does not read a placeholder faded out entirely", () => {
    // `::placeholder { opacity: 0 }` is the floating-label idiom: the hint is
    // there in the DOM and nowhere on screen.
    const hidden = { ...grey, opacity: 0 }
    expect(
      controlTextSample(
        control({
          placeholder: "x",
          placeholderShown: true,
          placeholderStyle: {
            fg: hidden,
            fontSizePx: 16,
            fontWeight: 400,
            textFill: false,
          },
        })
      )
    ).toBeNull()
  })

  it("holds the reading when the text it reads is painted by fill colour", () => {
    const got = controlTextSample(
      control({
        placeholder: "x",
        placeholderShown: true,
        placeholderStyle: {
          fg: grey,
          fontSizePx: 16,
          fontWeight: 400,
          textFill: true,
        },
      })
    )
    expect(got?.sample.blockers).toContain("text-fill")
    // The field's own fill does not reach the placeholder it is not drawing.
    const value = controlTextSample(
      control({
        value: "a",
        placeholderStyle: {
          fg: grey,
          fontSizePx: 16,
          fontWeight: 400,
          textFill: true,
        },
      })
    )
    expect(value?.sample.blockers).not.toContain("text-fill")
  })
})

// A layer whose only paint is its `background-image`: a transparent
// `background-color` reads back as white over white and black over black.
const painted = (value: string, repeat = "repeat", opacity = 1) => ({
  onWhite: WHITE,
  onBlack: BLACK,
  opacity,
  image: { value, repeat, clip: "border-box", blend: "normal" },
})

const textOn = (
  ...lines: Array<Array<ReturnType<typeof opaque> | ReturnType<typeof painted>>>
) =>
  evaluateText({
    fontSizePx: 16,
    fontWeight: 400,
    fg: opaque(0, 0, 0),
    lines: lines.map((stack) => ({ stack, blockers: [] })),
    blockers: [],
  })

describe("a background image is judged by every colour it can paint (#402)", () => {
  it("passes when every colour of the gradient passes", () => {
    // Black on #ffffff…#c8c8c8: the weakest end is still 12.8:1.
    const got = textOn([
      painted("linear-gradient(rgb(255, 255, 255), rgb(200, 200, 200))"),
      opaque(255, 255, 255),
    ])
    expect(got.verdict).toBe("pass")
    expect(got.blockers).toEqual([])
    // The ratio and the pair are the WEAKEST colour's, not the first stop's.
    expect(got.bg).toBe("#c8c8c8")
    expect(got.ratio).toBeCloseTo(
      contrastRatio(BLACK, { r: 200, g: 200, b: 200 }),
      5
    )
  })

  it("fails when every colour of the gradient fails", () => {
    const got = textOn([
      painted("linear-gradient(rgb(60, 60, 60), rgb(30, 30, 30))"),
      opaque(255, 255, 255),
    ])
    expect(got.verdict).toBe("fail")
    expect(got.blockers).toEqual([])
  })

  it("holds when the colours disagree — where the text sits is not known", () => {
    const got = textOn([
      painted("linear-gradient(rgb(0, 0, 0), rgb(255, 255, 255))"),
      opaque(255, 255, 255),
    ])
    expect(got.verdict).toBe("indeterminate")
    expect(got.blockers).toEqual(["gradient"])
  })

  it("holds a mix of pass and borderline as well, rather than picking one", () => {
    // Black on white (21:1) through black on #737373 (4.43:1, inside the
    // ±0.1 band around 4.5).
    const got = textOn([
      painted("linear-gradient(rgb(255, 255, 255), rgb(115, 115, 115))"),
      opaque(255, 255, 255),
    ])
    expect(got.verdict).toBe("indeterminate")
    expect(got.blockers).toEqual(["gradient"])
  })

  it("ranks a gradient line by its weakest colour, so it cannot hide behind a plain one", () => {
    // Ranked by `background-color` alone, the gradient line read as the white
    // under it (21:1) and lost to nothing; the run was judged on the plain
    // line and passed while one of its lines sat on dark grey.
    const got = textOn(
      [opaque(255, 255, 255)],
      [
        painted("linear-gradient(rgb(60, 60, 60), rgb(40, 40, 40))"),
        opaque(255, 255, 255),
      ]
    )
    expect(got.verdict).toBe("fail")
    expect(got.bg).toBe("#282828")
  })

  it("does not let a split gradient line hold a run another line already fails", () => {
    // Black on #6c6c6c is 4.00:1 — a certain failure. The second line's
    // gradient runs from white (21:1) to #646464 (3.55:1), so that line alone
    // is split. However the split falls, the run's weakest line is at most
    // 4.00, which fails either way: the run fails, and on the plain line's
    // pair, since that is the one the verdict is certain of.
    const got = textOn(
      [opaque(108, 108, 108)],
      [
        painted("linear-gradient(rgb(255, 255, 255), rgb(100, 100, 100))"),
        opaque(255, 255, 255),
      ]
    )
    expect(got.verdict).toBe("fail")
    expect(got.blockers).toEqual([])
    expect(got.bg).toBe("#6c6c6c")
  })

  it("holds a run whose plain line passes when a split line might be weaker", () => {
    const got = textOn(
      [opaque(255, 255, 255)],
      [
        painted("linear-gradient(rgb(255, 255, 255), rgb(100, 100, 100))"),
        opaque(255, 255, 255),
      ]
    )
    expect(got.verdict).toBe("indeterminate")
    expect(got.blockers).toEqual(["gradient"])
    // The number a held reading carries is the weakest it could be.
    expect(got.bg).toBe("#646464")
  })

  it("holds an image as `image` and still reports the colour beneath it", () => {
    const got = textOn([painted('url("a.png")'), opaque(255, 255, 255)])
    expect(got.verdict).toBe("indeterminate")
    expect(got.blockers).toEqual(["image"])
    expect(got.ratio).toBeCloseTo(21, 5)
  })

  it("counts the bare box too when the tile does not repeat over it", () => {
    // Every colour of the tile passes under black text, but outside a
    // non-repeating tile the text sits on the black below.
    const got = textOn([
      painted(
        "linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255))",
        "no-repeat"
      ),
      opaque(0, 0, 0),
    ])
    expect(got.verdict).toBe("indeterminate")
    expect(got.blockers).toEqual(["gradient"])
  })

  it("holds rather than enumerate a stack of gradients past the cap", () => {
    const ramp = (r: number) =>
      painted(`linear-gradient(rgba(${r}, 0, 0, 0.5), rgba(0, ${r}, 255, 0.5))`)
    const got = textOn([ramp(250), ramp(200), ramp(150), opaque(255, 255, 255)])
    expect(got.verdict).toBe("indeterminate")
    expect(got.blockers).toEqual(["gradient"])
    // Held at the cap, not by a split: the reported number is the stack read
    // with its images left out, which an enumerated weakest colour is not.
    expect(got.ratio).toBeCloseTo(21, 5)
  })

  it("fades the image with the layer's opacity, as it fades the colour", () => {
    // Black at 50% opacity over white is a mid grey: black text on it fails
    // where the unfaded black would have been a different failure entirely.
    const got = textOn([
      painted("linear-gradient(rgb(0, 0, 0), rgb(0, 0, 0))", "repeat", 0.5),
      opaque(255, 255, 255),
    ])
    expect(got.bg).toBe("#808080")
    expect(got.opacityApprox).toBe(true)
  })

  it("judges a non-text surface over a gradient by every colour behind it", () => {
    const chip = (
      outer: Array<ReturnType<typeof painted> | ReturnType<typeof opaque>>
    ) =>
      evaluateNonText({
        fill: opaque(0, 0, 0),
        border: null,
        outer,
        blockers: [],
      })
    const light = chip([
      painted("linear-gradient(rgb(255, 255, 255), rgb(220, 220, 220))"),
      opaque(255, 255, 255),
    ])
    expect(light?.verdict).toBe("pass")
    expect(light?.bg).toBe("#dcdcdc")
    const mixed = chip([
      painted("linear-gradient(rgb(255, 255, 255), rgb(0, 0, 0))"),
      opaque(255, 255, 255),
    ])
    expect(mixed?.verdict).toBe("indeterminate")
    expect(mixed?.blockers).toEqual(["gradient"])
  })

  it("judges a non-text surface that IS the gradient by each of its colours", () => {
    const got = evaluateNonText({
      fill: painted("linear-gradient(rgb(0, 0, 255), rgb(0, 0, 140))"),
      border: null,
      outer: [opaque(255, 255, 255)],
      blockers: [],
    })
    expect(got?.verdict).toBe("pass")
    expect(got?.basis).toBe("fill")
    expect(got?.fg).toBe("#0000ff")
  })
})
