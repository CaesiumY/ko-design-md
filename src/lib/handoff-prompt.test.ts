import { describe, expect, it } from "vitest"
import { buildHandoffPrompt } from "./handoff-prompt"

describe("buildHandoffPrompt", () => {
  it("puts the absolute DESIGN.md address first, then the instruction", () => {
    expect(buildHandoffPrompt("토스", "toss", "https://www.getdesign.kr")).toBe(
      "https://www.getdesign.kr/services/toss/DESIGN.md\n" +
        "위 DESIGN.md 를 요약하지 말고 원문 그대로 받아(셸이 있으면 curl 로 파일에 저장해) 끝까지 읽고, 그 토스 디자인으로 지금 프로젝트 UI 를 구현해 줘."
    )
  })

  // An agent left to its default web reader may get a model's summary back
  // (Claude Code's WebFetch) and lose the exact token values, so the
  // instruction has to say how to read the address.
  it("tells the agent to read the document verbatim, with curl where it can", () => {
    const instruction = buildHandoffPrompt(
      "토스",
      "toss",
      "https://x.test"
    ).split("\n")[1]
    expect(instruction).toContain("원문 그대로")
    expect(instruction).toContain("curl")
  })

  // An origin configured with a trailing slash must not produce `//services`,
  // which some agents' fetchers treat as a different path.
  it("drops a trailing slash on the origin", () => {
    expect(
      buildHandoffPrompt("토스", "toss", "https://www.getdesign.kr/").split(
        "\n"
      )[0]
    ).toBe("https://www.getdesign.kr/services/toss/DESIGN.md")
  })

  // Dev runs without VITE_SITE_URL; the address degrades to site-relative
  // rather than inventing a host.
  it("falls back to a site-relative address without an origin", () => {
    expect(buildHandoffPrompt("토스", "toss", "").split("\n")[0]).toBe(
      "/services/toss/DESIGN.md"
    )
  })

  it("stays two lines", () => {
    expect(
      buildHandoffPrompt("채널톡", "bezier", "https://x.test").split("\n")
    ).toHaveLength(2)
  })
})
