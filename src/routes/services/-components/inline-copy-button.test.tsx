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
})
