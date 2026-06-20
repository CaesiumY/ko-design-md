import { describe, expect, it } from "vitest"
import { ogLede } from "./og-lede"

describe("ogLede", () => {
  it("returns the input unchanged when ≤ 90 chars and has no clear terminator", () => {
    const text = "한 줄 요약 텍스트"
    expect(ogLede(text)).toBe(text)
  })

  it("captures the first 다-ending Korean sentence followed by space", () => {
    const text =
      "Demo Pay는 결제는 무조건 짧고 단호하게라는 원칙을 본다. 한 손으로 잡은 화면 안에서, 사용자의 시선은"
    expect(ogLede(text)).toBe(
      "Demo Pay는 결제는 무조건 짧고 단호하게라는 원칙을 본다."
    )
  })

  it("captures a 함 (nominalized) ending the regex previously missed", () => {
    const text =
      "사용자 경험을 위함. 한 손 사용을 우선으로 하는 디자인 원칙이 모든 화면에 일관되게 깔린다."
    expect(ogLede(text)).toBe("사용자 경험을 위함.")
  })

  it("captures a question terminator ending the regex previously missed", () => {
    const text =
      "왜 이 결제 흐름이 빠를까? 사용자의 시선이 두 번만 오가기 때문이다. 다른 정보는 모두 그 바깥으로."
    expect(ogLede(text)).toBe("왜 이 결제 흐름이 빠를까?")
  })

  it("captures a sentence ending exactly at the string boundary (no trailing space)", () => {
    const text = "한 손 사용에 단호하게 응답한다."
    expect(ogLede(text)).toBe(text)
  })

  it("hard-truncates with ellipsis when the tagline has no terminator under 90 chars", () => {
    const text = "ㄱ".repeat(120)
    const result = ogLede(text)
    expect(result.endsWith("…")).toBe(true)
    expect(result.length).toBeLessThanOrEqual(91)
  })

  it("does not match a Korean-ending shorter than 8 chars (avoids capturing a one-word fragment)", () => {
    const text =
      "본다. 그리고 그 안에서 사용자의 시선은 금액과 다음 행동 사이를 두 번 오간다."
    // "본다." is only 4 chars, regex requires ≥8 — should fall through to next match.
    expect(ogLede(text)).toBe(
      "본다. 그리고 그 안에서 사용자의 시선은 금액과 다음 행동 사이를 두 번 오간다."
    )
  })
})
