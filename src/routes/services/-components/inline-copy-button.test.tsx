// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { InlineCopyButton } from "./inline-copy-button"

afterEach(cleanup)

describe("InlineCopyButton", () => {
  // The detail page mixes this button with the click-to-copy swatch cards, so
  // both have to confirm in the same language.
  it("confirms the copy in Korean", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    render(<InlineCopyButton raw="{}" filename="toss.tokens.json" />)
    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
      await Promise.resolve()
    })

    expect(screen.getByRole("button").textContent).toContain("복사됨")
  })

  // WCAG 2.5.3 (Label in Name): voice-control users say what they see, so the
  // visible label has to appear inside the accessible name. The filename is
  // extra context, not a replacement for it.
  it("keeps the visible label inside the accessible name", () => {
    render(
      <InlineCopyButton
        raw="{}"
        filename="toss.tokens.json"
        label="JSON 복사"
      />
    )

    expect(screen.getByRole("button").getAttribute("aria-label")).toBe(
      "JSON 복사 — toss.tokens.json"
    )
  })

  // The accessible name never changes, so the visible 복사됨 swap is invisible
  // to assistive tech without a live region of its own.
  it("announces the copy through a live region", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    render(<InlineCopyButton raw="{}" filename="toss.tokens.json" />)
    expect(screen.getByRole("status").textContent).toBe("")

    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
      await Promise.resolve()
    })

    expect(screen.getByRole("status").textContent).toBe(
      "toss.tokens.json 복사됨"
    )
  })
})
