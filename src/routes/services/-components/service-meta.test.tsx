// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { ServiceMeta } from "./service-meta"
import type { ServiceFrontmatter } from "@/lib/content-types"

const baseFm: ServiceFrontmatter = {
  name: "Toss",
  slug: "toss",
  category: "finance",
  last_updated: "2026-05-28",
  sources: [],
  related_services: [],
  lang: "ko",
}

afterEach(cleanup)

describe("ServiceMeta", () => {
  it("renders both ADDED and UPDATED when created_at and last_updated differ", () => {
    render(
      <ServiceMeta
        frontmatter={{ ...baseFm, created_at: "2026-05-11" }}
        tagline="…"
      />
    )
    expect(screen.getByText(/ADDED · 2026-05-11/)).toBeTruthy()
    expect(screen.getByText(/UPDATED · 2026-05-28/)).toBeTruthy()
  })

  it("renders both ADDED and UPDATED even when the dates are the same — info parity for the lifecycle line", () => {
    render(
      <ServiceMeta
        frontmatter={{
          ...baseFm,
          last_updated: "2026-05-15",
          created_at: "2026-05-15",
        }}
        tagline="…"
      />
    )
    expect(screen.getByText(/ADDED · 2026-05-15/)).toBeTruthy()
    expect(screen.getByText(/UPDATED · 2026-05-15/)).toBeTruthy()
  })

  it("omits ADDED entirely when created_at is missing (legacy entries)", () => {
    render(<ServiceMeta frontmatter={baseFm} tagline="…" />)
    expect(screen.queryByText(/ADDED/)).toBeNull()
    expect(screen.getByText(/UPDATED · 2026-05-28/)).toBeTruthy()
  })
})
