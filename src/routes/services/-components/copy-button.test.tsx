// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { CopyButton } from "./copy-button"
import { COPY_DWELL_MS } from "@/hooks/use-copy-feedback"

afterEach(cleanup)

describe("CopyButton", () => {
  // Its idle label is already Korean ("design.md 전체 복사"); the confirmation
  // has to match rather than switching languages mid-interaction.
  it("confirms the copy in Korean", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    render(<CopyButton slug="toss" raw="# design.md" />)
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

    render(<CopyButton slug="toss" raw="# design.md" />)
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

  // A button makes every descendant presentational, so a nested live region
  // never announces. It has to sit beside the control.
  it("keeps the live region outside the button", () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    const { container } = render(<CopyButton slug="toss" raw="# design.md" />)

    expect(container.querySelector('[role="status"]')).toBeTruthy()
    expect(
      screen.getByRole("button").querySelector('[role="status"]')
    ).toBeNull()
  })

  // Matches the swatch cards and the inline button: a second click has to own a
  // full confirmation window rather than inheriting the first one's deadline.
  it("restarts the confirmation window when clicked again", async () => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    render(<CopyButton slug="toss" raw="# design.md" />)
    const click = async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole("button"))
        await Promise.resolve()
      })
    }

    await click()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(COPY_DWELL_MS - 800)
    })
    await click()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(COPY_DWELL_MS - 800)
    })

    expect(screen.getByRole("button").textContent).toContain("복사됨")
    vi.useRealTimers()
  })
})
