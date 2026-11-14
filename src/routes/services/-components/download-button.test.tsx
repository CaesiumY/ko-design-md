// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { DownloadButton } from "./download-button"

// jsdom implements neither object URLs nor navigation on anchor click, so both
// are stubbed and the assertions read what the button handed them.
let createObjectURL: ReturnType<typeof vi.fn>
let revokeObjectURL: ReturnType<typeof vi.fn>
let clicked: Array<HTMLAnchorElement>
let attachedAtClick: Array<boolean>

beforeEach(() => {
  createObjectURL = vi.fn(() => "blob:toss")
  revokeObjectURL = vi.fn()
  Object.assign(URL, { createObjectURL, revokeObjectURL })
  clicked = []
  attachedAtClick = []
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement
  ) {
    clicked.push(this)
    attachedAtClick.push(document.body.contains(this))
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("DownloadButton", () => {
  it("saves the raw design.md as {slug}.md", async () => {
    render(<DownloadButton slug="toss" raw="# Toss design.md" />)
    fireEvent.click(screen.getByRole("button", { name: /DESIGN\.md 다운로드/ }))

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    const blob = createObjectURL.mock.calls[0][0] as Blob
    expect(await blob.text()).toBe("# Toss design.md")

    expect(clicked).toHaveLength(1)
    expect(clicked[0].download).toBe("toss.md")
    expect(clicked[0].getAttribute("href")).toBe("blob:toss")
  })

  // Older WebKit drops a click on a detached anchor, and revoking in the same
  // tick can cancel a download that has not started reading the blob.
  it("clicks an attached anchor and revokes the URL only later", () => {
    vi.useFakeTimers()
    try {
      render(<DownloadButton slug="toss" raw="# Toss" />)
      fireEvent.click(screen.getByRole("button"))

      expect(attachedAtClick).toEqual([true])
      expect(document.body.contains(clicked[0])).toBe(false)
      expect(revokeObjectURL).not.toHaveBeenCalled()

      vi.runAllTimers()
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:toss")
    } finally {
      vi.useRealTimers()
    }
  })
})
