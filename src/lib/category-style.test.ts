import { describe, expect, it } from "vitest"
import { getCategoryStyle } from "./category-style"

describe("getCategoryStyle", () => {
  it("returns label, Korean label, and Hangul index for known category", () => {
    const s = getCategoryStyle("finance")
    expect(s.label).toBe("Finance")
    expect(s.koLabel).toBe("결제")
    expect(s.koIndex).toBe("ㄱ")
  })

  it("falls back to 'etc' style for unknown category", () => {
    const s = getCategoryStyle("not-a-category")
    expect(s.label).toBe("Etc")
    expect(s.koLabel).toBe("기타")
    expect(s.koIndex).toBe("ㅈ")
  })

  it("assigns distinct Hangul indices to each known category", () => {
    const cats = [
      "finance",
      "messenger",
      "commerce",
      "delivery",
      "mobility",
      "content",
      "community",
      "travel",
      "gov",
      "developer",
      "education",
      "career",
      "etc",
    ]
    const indices = cats.map((c) => getCategoryStyle(c).koIndex)
    expect(new Set(indices).size).toBe(cats.length)
  })
})
