// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { track } from "@vercel/analytics"
import { HandoffPromptBox } from "./handoff-prompt-box"
import { buildHandoffPrompt } from "@/lib/handoff-prompt"

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }))

afterEach(() => {
  cleanup()
  vi.mocked(track).mockClear()
})

function stubClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  })
  return writeText
}

async function clickCopy() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button"))
    await Promise.resolve()
  })
}

describe("HandoffPromptBox", () => {
  // What is shown is what is copied — the reader should never paste something
  // they could not read first.
  it("shows the prompt it copies", async () => {
    const writeText = stubClipboard()
    const { container } = render(<HandoffPromptBox name="토스" slug="toss" />)

    expect(container.querySelector("code")?.textContent).toBe(
      buildHandoffPrompt("토스", "toss")
    )
    await clickCopy()
    expect(writeText).toHaveBeenCalledWith(buildHandoffPrompt("토스", "toss"))
  })

  // Counted with the whole-document copies: handing the entry to an agent by
  // address is the same conversion as pasting its body.
  it("counts as a design.md copy from the handoff-prompt surface", async () => {
    stubClipboard()
    render(<HandoffPromptBox name="토스" slug="toss" />)

    await clickCopy()

    expect(track).toHaveBeenCalledWith("design_md_copy", {
      surface: "handoff-prompt",
      slug: "toss",
    })
  })

  // The labelled button, not an icon: the visible word is part of its name so
  // voice control can say what it sees, and the name holds still while the
  // label flips to "복사됨" — the live region beside it carries the result.
  it("shows a 복사 label that confirms as 복사됨, announced beside the button", async () => {
    stubClipboard()
    render(<HandoffPromptBox name="토스" slug="toss" />)
    const button = screen.getByRole("button", {
      name: "복사 — 핸드오프 프롬프트",
    })
    expect(button.textContent).toBe("복사")
    expect(screen.getByRole("status").textContent).toBe("")

    await clickCopy()

    expect(button.textContent).toBe("복사됨")
    expect(button.getAttribute("aria-label")).toBe("복사 — 핸드오프 프롬프트")
    expect(screen.getByRole("status").textContent).toBe(
      "핸드오프 프롬프트 복사됨"
    )
    expect(button.querySelector('[role="status"]')).toBeNull()
  })
})
