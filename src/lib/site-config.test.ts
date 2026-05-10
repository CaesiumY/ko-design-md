import { describe, expect, it } from "vitest"
import { SITE_URL, absoluteUrl } from "./site-config"

// In test mode (vitest sets NODE_ENV=test, import.meta.env.PROD = false),
// VITE_SITE_URL is unset, so SITE_URL is the empty string and absoluteUrl
// returns the path unchanged. Production assertion path is exercised by
// the build pipeline itself failing if the env is missing.

describe("site-config (test env, VITE_SITE_URL unset)", () => {
  it("SITE_URL is empty when no env is configured", () => {
    expect(SITE_URL).toBe("")
  })

  it("absoluteUrl preserves an already-absolute http URL", () => {
    expect(absoluteUrl("http://example.com/og.png")).toBe(
      "http://example.com/og.png",
    )
  })

  it("absoluteUrl preserves an already-absolute https URL", () => {
    expect(absoluteUrl("https://example.com/og.png")).toBe(
      "https://example.com/og.png",
    )
  })

  it("absoluteUrl returns the leading-slash path unchanged when SITE_URL is empty", () => {
    expect(absoluteUrl("/og/default.png")).toBe("/og/default.png")
  })

  it("absoluteUrl normalizes a path that lacks a leading slash", () => {
    expect(absoluteUrl("og/default.png")).toBe("/og/default.png")
  })
})
