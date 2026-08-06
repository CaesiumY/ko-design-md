// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { SwatchCard } from "./swatch-card"

const TOKEN = {
  name: "blue-500",
  value: "oklch(0.624 0.176 254)",
  group: "Brand",
}

const NOTED = {
  ...TOKEN,
  note: "카노니컬 Toss Blue, 화면당 하나의 primary CTA",
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

  // The button's accessible name is deliberately static, so a screen reader
  // hears nothing when the visible line flips to 복사됨. A separate live region
  // carries the confirmation — and names the token, since 88 cards share the
  // page and a bare "복사됨" would not say which one landed.
  it("announces which token was copied without renaming the button", async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))

    render(<SwatchCard token={TOKEN} />)
    expect(screen.getByRole("status").textContent).toBe("")

    await clickCard()

    expect(screen.getByRole("status").textContent).toBe("blue-500 복사됨")
    expect(screen.getByRole("button").getAttribute("aria-label")).toBe(
      "blue-500 복사 — oklch(0.624 0.176 254)"
    )
  })

  // Browsers apply role="presentation" to every descendant of a button, so a
  // live region nested inside one is stripped of its semantics and never
  // announces. The region has to be a sibling of the control, not a child.
  it("keeps the live region outside the button so it is not made presentational", () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))

    const { container } = render(<SwatchCard token={TOKEN} />)

    expect(container.querySelector('[role="status"]')).toBeTruthy()
    expect(
      screen.getByRole("button").querySelector('[role="status"]')
    ).toBeNull()
  })

  it("clears the announcement when the confirmation window closes", async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))

    render(<SwatchCard token={TOKEN} />)
    await clickCard()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1800)
    })

    expect(screen.getByRole("status").textContent).toBe("")
  })

  // The revert timer is now cleared on unmount — the ref that the re-click fix
  // needed made that free. This guards the result rather than the mechanism: a
  // card left mid-confirmation must neither warn nor throw, whether the timer
  // was cancelled or simply fired into a dead component.
  it("leaves quietly when unmounted inside the confirmation window", async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    const view = render(<SwatchCard token={TOKEN} />)
    await clickCard()
    view.unmount()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1800)
    })

    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  // As a <div> the note was plain text and got read in browse mode. Promoting
  // the card to a <button> with an aria-label replaced the accessible name
  // outright, and a button is announced atomically — so the usage note went
  // silent. It rides aria-describedby rather than the label because the label
  // doubles as the voice-control target (WCAG 2.5.3) and must stay short.
  it("keeps the usage note reachable after the card became a button", () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))

    render(<SwatchCard token={NOTED} />)
    const describedBy = screen
      .getByRole("button")
      .getAttribute("aria-describedby")

    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy!)?.textContent).toBe(NOTED.note)
  })

  it("adds no description when the token carries no note", () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))

    render(<SwatchCard token={TOKEN} />)

    expect(
      screen.getByRole("button").getAttribute("aria-describedby")
    ).toBeNull()
  })

  // Each click has to own a full confirmation window. Without cancelling the
  // pending timer, the first click's timer fires on schedule and cuts the
  // second click's "복사됨" short.
  it("restarts the confirmation window when the card is clicked again", async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))

    render(<SwatchCard token={TOKEN} />)
    await clickCard()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    await clickCard()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(screen.getByText("복사됨")).toBeTruthy()
  })

  it("names the token and its value for screen readers", () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))

    render(<SwatchCard token={TOKEN} />)

    expect(screen.getByRole("button").getAttribute("aria-label")).toBe(
      "blue-500 복사 — oklch(0.624 0.176 254)"
    )
  })
})
