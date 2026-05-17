// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { ContributeDialog } from "./contribute-dialog"

afterEach(cleanup)

function openDialog() {
  fireEvent.click(screen.getByRole("button", { name: /새 항목 제안하기/ }))
}

describe("ContributeDialog", () => {
  it("opens the dialog with both choice cards when the trigger is clicked", () => {
    render(<ContributeDialog />)
    openDialog()

    expect(
      screen.getByRole("heading", { name: /새 항목 추가하기/ }),
    ).toBeDefined()
    expect(screen.getByRole("link", { name: /제안만 할게요/ })).toBeDefined()
    expect(screen.getByRole("link", { name: /직접 추가할래요/ })).toBeDefined()
  })

  it("links the propose card to the new-catalog-entry issue template in a new tab", () => {
    render(<ContributeDialog />)
    openDialog()

    const link = screen.getByRole("link", { name: /제안만 할게요/ })
    expect(link.getAttribute("href")).toContain(
      "/issues/new?template=new-catalog-entry.yml",
    )
    expect(link.getAttribute("target")).toBe("_blank")
    expect(link.getAttribute("rel")).toBe("noopener noreferrer")
  })

  it("links the contribute card to the CONTRIBUTING anchor in a new tab", () => {
    render(<ContributeDialog />)
    openDialog()

    const link = screen.getByRole("link", { name: /직접 추가할래요/ })
    expect(link.getAttribute("href")).toContain(
      "/blob/main/CONTRIBUTING.md#1-",
    )
    expect(link.getAttribute("target")).toBe("_blank")
    expect(link.getAttribute("rel")).toBe("noopener noreferrer")
  })

  it("closes the dialog when Escape is pressed", async () => {
    render(<ContributeDialog />)
    openDialog()

    const dialog = await screen.findByRole("dialog")
    fireEvent.keyDown(dialog, { key: "Escape" })

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull()
    })
  })
})
