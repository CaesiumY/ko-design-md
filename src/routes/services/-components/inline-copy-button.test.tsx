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

  // Same defect as the swatch cards: without cancelling the pending revert, a
  // second click inherits the first one's deadline and its confirmation is cut
  // short. All three copy affordances share this page, so they share the fix.
  it("restarts the confirmation window when clicked again", async () => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    render(<InlineCopyButton raw="{}" filename="toss.tokens.json" />)
    const click = async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole("button"))
        await Promise.resolve()
      })
    }

    await click()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    await click()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(screen.getByRole("button").textContent).toContain("복사됨")
    vi.useRealTimers()
  })

  // The confirmation text is hardcoded Korean, so the idle default has to be
  // Korean too — an English default would put a caller that omits `label` right
  // back into the mid-interaction language switch this component just fixed.
  it("falls back to a Korean idle label so the pair never mixes languages", () => {
    render(<InlineCopyButton raw="{}" filename="toss.tokens.json" />)

    expect(screen.getByRole("button").textContent).toContain("복사")
    expect(screen.getByRole("button").textContent).not.toMatch(/Copy/i)
  })

  // A button makes every descendant presentational, so a nested live region
  // never announces. It has to sit beside the control.
  it("keeps the live region outside the button", () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    const { container } = render(
      <InlineCopyButton raw="{}" filename="toss.tokens.json" />
    )

    expect(container.querySelector('[role="status"]')).toBeTruthy()
    expect(
      screen.getByRole("button").querySelector('[role="status"]')
    ).toBeNull()
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
