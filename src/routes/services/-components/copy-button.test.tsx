// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { CopyButton } from "./copy-button"

afterEach(cleanup)

describe("CopyButton", () => {
  // Its idle label is already Korean ("design.md 전체 복사"); the confirmation
  // has to match rather than switching languages mid-interaction.
  it("confirms the copy in Korean", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    render(<CopyButton raw="# design.md" />)
    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
      await Promise.resolve()
    })

    expect(screen.getByRole("button").textContent).toContain("복사됨")
  })

  // This button used to rely on its own label flipping to "복사됨" to convey the
  // copy, since its accessible name comes from its content. Whether a screen
  // reader re-announces a focused control whose name changed varies by AT, so
  // the name is now pinned and the confirmation rides a live region — the same
  // mechanism the swatch cards and the inline button already use.
  it("announces the copy without letting its accessible name change", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    render(<CopyButton raw="# design.md" />)
    const nameBefore = screen.getByRole("button").getAttribute("aria-label")
    expect(screen.getByRole("status").textContent).toBe("")

    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
      await Promise.resolve()
    })

    expect(screen.getByRole("status").textContent).toBe("design.md 복사됨")
    expect(screen.getByRole("button").getAttribute("aria-label")).toBe(
      nameBefore
    )
  })

  // Matches the swatch cards and the inline button: a second click has to own a
  // full confirmation window rather than inheriting the first one's deadline.
  it("restarts the confirmation window when clicked again", async () => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    render(<CopyButton raw="# design.md" />)
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
})
