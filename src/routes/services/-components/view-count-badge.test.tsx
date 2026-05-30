// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { ViewCountBadge } from "./view-count-badge"

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

describe("ViewCountBadge", () => {
  it("renders nothing when VITE_SITE_URL is unset (e.g. before deploy)", () => {
    vi.stubEnv("VITE_SITE_URL", "")
    const { container } = render(<ViewCountBadge slug="gmarket" />)
    expect(container.innerHTML).toBe("")
  })

  it("renders the hits.sh badge using the site host when VITE_SITE_URL is set", () => {
    vi.stubEnv("VITE_SITE_URL", "https://getdesign.kr")
    render(<ViewCountBadge slug="gmarket" />)
    const img = screen.getByRole("img")
    expect(img.getAttribute("src")).toContain(
      "https://hits.sh/getdesign.kr/gmarket.svg",
    )
  })

  it("hides the badge gracefully after the image fails to load", () => {
    vi.stubEnv("VITE_SITE_URL", "https://getdesign.kr")
    const { container } = render(<ViewCountBadge slug="gmarket" />)
    fireEvent.error(screen.getByRole("img"))
    expect(container.innerHTML).toBe("")
  })
})
