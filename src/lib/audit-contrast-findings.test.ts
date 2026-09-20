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
