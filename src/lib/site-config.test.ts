import { describe, expect, it } from "vitest"
import {
  SITE_URL,
  absoluteUrl,
  localLogoPath,
  siteRelativeIfSelf,
} from "./site-config"

// In test mode (vitest sets NODE_ENV=test, import.meta.env.PROD = false),
// vite.config.ts pins VITE_SITE_URL to "", so SITE_URL is the empty string and
// absoluteUrl returns the path unchanged. The build failing on a missing value
// is covered by require-site-url-plugin.test.ts.

describe("site-config (test env, VITE_SITE_URL pinned empty)", () => {
  it("runs with VITE_SITE_URL pinned empty by vite.config.ts", () => {
    // Fails with `undefined` if the `test.env` pin is dropped, even on a
    // machine (CI included) that has no value to leak.
    expect(import.meta.env.VITE_SITE_URL).toBe("")
  })

  it("SITE_URL is empty when no env is configured", () => {
    expect(SITE_URL).toBe("")
  })

  it("absoluteUrl preserves an already-absolute http URL", () => {
    expect(absoluteUrl("http://example.com/og.png")).toBe(
      "http://example.com/og.png"
    )
  })

  it("absoluteUrl preserves an already-absolute https URL", () => {
    expect(absoluteUrl("https://example.com/og.png")).toBe(
      "https://example.com/og.png"
    )
  })

  it("absoluteUrl returns the leading-slash path unchanged when SITE_URL is empty", () => {
    expect(absoluteUrl("/og/default.png")).toBe("/og/default.png")
  })

  it("absoluteUrl normalizes a path that lacks a leading slash", () => {
    expect(absoluteUrl("og/default.png")).toBe("/og/default.png")
  })

  // siteRelativeIfSelf in test env (SITE_URL empty) — the origin-match path
  // can't be exercised here; covered by manual dev verification with
  // VITE_SITE_URL set. These cases lock in the safe fallback behavior so
  // unset-env environments never accidentally mangle a URL.
  it("siteRelativeIfSelf returns undefined for undefined input", () => {
    expect(siteRelativeIfSelf(undefined)).toBeUndefined()
  })

  it("siteRelativeIfSelf returns absolute URL unchanged when SITE_URL is empty", () => {
    expect(siteRelativeIfSelf("https://getdesign.kr/logos/toss.png")).toBe(
      "https://getdesign.kr/logos/toss.png"
    )
  })

  it("siteRelativeIfSelf returns a site-relative path unchanged", () => {
    expect(siteRelativeIfSelf("/logos/toss.png")).toBe("/logos/toss.png")
  })

  it("siteRelativeIfSelf returns a foreign-origin URL unchanged", () => {
    expect(siteRelativeIfSelf("https://other-site.example/foo.png")).toBe(
      "https://other-site.example/foo.png"
    )
  })

  // localLogoPath strips the origin off any absolute URL so the in-site
  // <img> always points to the local `public/logos/...` asset, regardless
  // of whether VITE_SITE_URL is set. Frontmatter keeps its absolute form.
  it("localLogoPath returns undefined for undefined input", () => {
    expect(localLogoPath(undefined)).toBeUndefined()
  })

  it("localLogoPath strips the origin from a frontmatter absolute URL", () => {
    expect(localLogoPath("https://getdesign.kr/logos/toss.png")).toBe(
      "/logos/toss.png"
    )
  })

  it("localLogoPath is origin-agnostic", () => {
    expect(localLogoPath("https://other-origin.example/logos/x.png")).toBe(
      "/logos/x.png"
    )
  })

  it("localLogoPath returns an already-relative path unchanged", () => {
    expect(localLogoPath("/logos/toss.png")).toBe("/logos/toss.png")
  })

  it("localLogoPath returns an unparseable input unchanged", () => {
    expect(localLogoPath("not a url")).toBe("not a url")
  })

  it("localLogoPath preserves query strings and hashes", () => {
    expect(localLogoPath("https://getdesign.kr/logos/toss.png?v=1#top")).toBe(
      "/logos/toss.png?v=1#top"
    )
  })

  it("localLogoPath preserves data URIs", () => {
    const dataUri =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    expect(localLogoPath(dataUri)).toBe(dataUri)
  })
})
