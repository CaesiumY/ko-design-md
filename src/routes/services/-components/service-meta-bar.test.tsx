// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { ServiceMetaBar } from "./service-meta-bar"
import type { ServiceFrontmatter } from "@/lib/content-types"

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

function frontmatter(
  overrides: Partial<ServiceFrontmatter> = {},
): ServiceFrontmatter {
  return {
    name: "지마켓",
    slug: "gmarket",
    category: "etc",
    last_updated: "2026-05-14",
    sources: [],
    related_services: [],
    lang: "ko",
    ...overrides,
  }
}

describe("ServiceMetaBar", () => {
  it("renders the catalog breadcrumb and last-updated meta in isolation", () => {
    vi.stubEnv("VITE_SITE_URL", "") // badge off (no deploy URL) — meta row only
    render(<ServiceMetaBar frontmatter={frontmatter()} />)

    expect(screen.getByText("CATALOG")).toBeTruthy()
    expect(screen.getByText("ETC")).toBeTruthy()
    expect(screen.getByText(/UPDATED · 2026-05-14/)).toBeTruthy()
    expect(screen.queryByRole("img")).toBeNull()
  })

  it("shows the view-count badge alongside UPDATED when VITE_SITE_URL is set", () => {
    vi.stubEnv("VITE_SITE_URL", "https://getdesign.kr")
    render(<ServiceMetaBar frontmatter={frontmatter()} />)

    expect(screen.getByRole("img").getAttribute("src")).toContain(
      "hits.sh/getdesign.kr/gmarket.svg",
    )
    expect(screen.getByText(/UPDATED · 2026-05-14/)).toBeTruthy()
  })
})
