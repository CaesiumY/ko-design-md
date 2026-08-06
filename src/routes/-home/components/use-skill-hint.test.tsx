// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { UseSkillHint } from "./use-skill-hint"
import { COPY_DWELL_MS } from "@/hooks/use-copy-feedback"
import { SKILL_INSTALL_CMD } from "@/lib/site-config"

function stubClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  })
}

async function clickCopy() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /복사/ }))
    await Promise.resolve()
  })
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe("UseSkillHint", () => {
  it("copies the install command", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubClipboard(writeText)

    render(<UseSkillHint />)
    await clickCopy()

    expect(writeText).toHaveBeenCalledWith(SKILL_INSTALL_CMD)
  })

  // This button is icon-only with a fixed aria-label, so nothing about the copy
  // reaches a screen reader on its own — no visible text swaps and the name
  // never changes. It needs the same live region the other three copy
  // affordances carry, sitting outside the button so it is not made
  // presentational.
  it("announces the copy through a live region outside the button", async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))

    const { container } = render(<UseSkillHint />)
    expect(screen.getByRole("status").textContent).toBe("")
    expect(container.querySelector('button [role="status"]')).toBeNull()

    await clickCopy()

    expect(screen.getByRole("status").textContent).toContain("복사됨")
  })

  // Was missing here: this component never cancelled its pending revert, so a
  // second click inside the window inherited the first one's deadline.
  it("gives a second click a full confirmation window", async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))

    render(<UseSkillHint />)
    await clickCopy()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(COPY_DWELL_MS - 800)
    })
    await clickCopy()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(COPY_DWELL_MS - 800)
    })

    expect(screen.getByRole("status").textContent).toContain("복사됨")
  })
})
