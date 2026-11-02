import { describe, expect, it } from "vitest"
import { toFindings } from "../../scripts/audit-contrast-sweep"
import type { Collected } from "../../scripts/audit-contrast-collector"

// `toFindings` is where a collected reading becomes a judged one. The emoji
// test lives here rather than in the collector because the collector cannot
// import — and that is exactly why the first version of the test, written
// inside it, was wrong in a way no test could reach.

const white = {
  onWhite: { r: 255, g: 255, b: 255 },
  onBlack: { r: 255, g: 255, b: 255 },
  opacity: 1,
}
const black = {
  onWhite: { r: 0, g: 0, b: 0 },
  onBlack: { r: 0, g: 0, b: 0 },
  opacity: 1,
}

const collected = (text: string): Collected => ({
  text: [
    {
      path: "div > p",
      text,
      fontSizePx: 16,
      fontWeight: 400,
      fg: black,
      lines: [{ stack: [white], blockers: [] }],
      blockers: [],
    },
  ],
  nonText: [],
  overlayCandidates: 0,
})

const run = (text: string) =>
  toFindings(collected(text), {
    slug: "toss",
    theme: "light",
    width: 976,
    state: "default",
  })

describe("toFindings — emoji runs", () => {
  it("drops a run that is only emoji", () => {
    expect(run("🎂")).toHaveLength(0)
  })

  it("measures a run that mixes emoji with words", () => {
    expect(run("🎂 케이크")).toHaveLength(1)
  })

  it("measures a long emoji prefix followed by real text", () => {
    // The judgement has to see the WHOLE run, not the truncated sample. A
    // prefix of more than 60 UTF-16 units of emoji would make a sample-first
    // test read the run as emoji-only and drop it — the same shape of defect
    // as counting digits as emoji: a real failure reported as nothing at all.
    const prefix = "🎂".repeat(40)
    expect(prefix.length).toBeGreaterThan(60)
    const got = run(`${prefix} 실제 문구`)
    expect(got).toHaveLength(1)
    expect(got[0].ratio).toBeCloseTo(21, 5)
  })

  it("still truncates what it reports", () => {
    const got = run(`${"가".repeat(200)}`)
    expect(got).toHaveLength(1)
    expect((got[0].sample ?? "").length).toBeLessThanOrEqual(60)
  })
})

describe("toFindings — the measured colour pair", () => {
  it("carries the pair the judgement rests on onto the finding", () => {
    // Black text on white. A finding that reached the report without these
    // would make the published-colour question unanswerable for every row.
    const [f] = run("결제 수단")
    expect(f.fg).toBe("#000000")
    expect(f.bg).toBe("#ffffff")
  })
})

describe("toFindings — the text a form control shows", () => {
  const grey = {
    onWhite: { r: 128, g: 128, b: 128 },
    onBlack: { r: 128, g: 128, b: 128 },
    opacity: 1,
  }
  const field = (over: object): Collected => ({
    text: [],
    nonText: [],
    overlayCandidates: 0,
    controls: [
      {
        path: "div.field > input",
        tag: "input",
        type: "text",
        value: "",
        placeholder: "이메일",
        placeholderShown: true,
        selectedText: "",
        listbox: false,
        own: { fg: black, fontSizePx: 16, fontWeight: 400, textFill: false },
        placeholderStyle: {
          fg: grey,
          fontSizePx: 16,
          fontWeight: 400,
          textFill: false,
        },
        lines: [{ stack: [white], blockers: [] }],
        blockers: [],
        ...over,
      },
    ],
  })
  const runControls = (c: Collected) =>
    toFindings(c, {
      slug: "toss",
      theme: "light",
      width: 976,
      state: "default",
    })

  it("reports a shown placeholder as a text row that names its source", () => {
    const [f, ...rest] = runControls(field({}))
    expect(rest).toHaveLength(0)
    expect(f.kind).toBe("text")
    expect(f.source).toBe("placeholder")
    expect(f.sample).toBe("이메일")
    // #808080 on white: the placeholder colour, not the field's black.
    expect(f.fg).toBe("#808080")
    expect(f.verdict).toBe("fail")
  })

  it("reports nothing for an empty field", () => {
    expect(
      runControls(field({ placeholder: "", placeholderShown: false }))
    ).toHaveLength(0)
  })

  it("leaves a collection without controls as it was", () => {
    // `controls` is optional — the collections other callers build without it
    // still turn into the same findings.
    expect(run("결제 수단")[0].source).toBeUndefined()
  })
})

describe("toFindings — a background image travels with its layer (#402)", () => {
  // The collector hands each layer's computed `background-*` longhands across
  // as text; the judgement is made on this side. Without this path the image
  // never reaches it and the text reads as the white under it.
  const onImage = (value: string): Collected => ({
    text: [
      {
        path: "div > p",
        text: "Sample text",
        fontSizePx: 16,
        fontWeight: 400,
        fg: black,
        lines: [
          {
            stack: [
              {
                onWhite: { r: 255, g: 255, b: 255 },
                onBlack: { r: 0, g: 0, b: 0 },
                opacity: 1,
                image: {
                  value,
                  repeat: "repeat",
                  clip: "border-box",
                  blend: "normal",
                },
              },
              white,
            ],
            blockers: [],
          },
        ],
        blockers: [],
      },
    ],
    nonText: [],
    overlayCandidates: 0,
  })
  const judged = (value: string) =>
    toFindings(onImage(value), {
      slug: "toss",
      theme: "light",
      width: 976,
      state: "default",
    })

  it("judges text on a gradient every colour of which fails", () => {
    const [finding] = judged(
      "linear-gradient(rgb(60, 60, 60), rgb(30, 30, 30))"
    )
    expect(finding.verdict).toBe("fail")
    expect(finding.blockers).toEqual([])
  })

  it("holds text on an image as `image`", () => {
    const [finding] = judged('url("a.png")')
    expect(finding.verdict).toBe("indeterminate")
    expect(finding.blockers).toEqual(["image"])
  })
})
