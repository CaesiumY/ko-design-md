// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { SwatchCard } from "./swatch-card"

const TOKEN = {
  name: "blue-500",
  value: "oklch(0.624 0.176 254)",
  group: "Brand",
}

// jsdom ships no clipboard implementation, so every test installs its own and
// asserts on what the component asked it to write.
function stubClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  })
}

// The click handler awaits the clipboard before setting state, so the click has
// to be flushed inside act() for React to have committed by the assertions.
async function clickCard() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button"))
    // Settle the clipboard promise inside the same act() scope so the state
    // update it schedules is flushed before the assertions run.
    await Promise.resolve()
  })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe("SwatchCard", () => {
  it("writes the token's displayed value to the clipboard when clicked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubClipboard(writeText)

    render(<SwatchCard token={TOKEN} />)
    await clickCard()

    expect(writeText).toHaveBeenCalledWith("oklch(0.624 0.176 254)")
  })

  it("confirms the copy in Korean, then returns to showing the value", async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))

    render(<SwatchCard token={TOKEN} />)
    await clickCard()

    expect(screen.getByText("복사됨")).toBeTruthy()
    expect(screen.queryByText(TOKEN.value)).toBeNull()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1800)
    })

    expect(screen.queryByText("복사됨")).toBeNull()
    expect(screen.getByText(TOKEN.value)).toBeTruthy()
  })

  it("stays in its idle state when the clipboard rejects", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")))

    render(<SwatchCard token={TOKEN} />)
    await clickCard()

    expect(screen.queryByText("복사됨")).toBeNull()
    expect(screen.getByText(TOKEN.value)).toBeTruthy()
  })

  it("names the token and its value for screen readers", () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))

    render(<SwatchCard token={TOKEN} />)

    expect(screen.getByRole("button").getAttribute("aria-label")).toBe(
      "blue-500 복사 — oklch(0.624 0.176 254)"
    )
  })
})
