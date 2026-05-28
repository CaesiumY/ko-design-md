import fs from "node:fs"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { loadOgLogo } from "./load-logo"

describe("loadOgLogo", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it("returns a data URI for an existing in-catalog logo", () => {
    // krds.svg is guaranteed to exist by the design-md logo policy test.
    const dataUri = loadOgLogo("https://getdesign.kr/logos/krds.svg")
    expect(dataUri).toMatch(/^data:image\/svg\+xml;base64,/)
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it("returns undefined for empty / missing logo URL", () => {
    expect(loadOgLogo(undefined)).toBeUndefined()
    expect(loadOgLogo("")).toBeUndefined()
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it("rejects site-relative path traversal that escapes public/", () => {
    // Absolute URLs like "https://x/logos/../../etc/passwd" are normalized
    // away by the WHATWG URL parser (`new URL()` flattens `..`), so they
    // can't escape on their own. The real risk is a site-relative input
    // like "/../etc/passwd" — `frontmatterLogoToPath` short-circuits on
    // `startsWith("/")` and returns the string verbatim, bypassing URL
    // normalization. Without this guard, `path.join(PUBLIC_DIR, ...)`
    // would resolve outside `public/` and read repo secrets in CI.
    const result = loadOgLogo("/../etc/passwd")
    expect(result).toBeUndefined()
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("escapes public/"),
    )
  })

  it("normalizes absolute URL traversal harmlessly via URL parser", () => {
    // Documents the URL-parser behaviour the guard above relies on: even
    // a hostile-looking absolute URL is collapsed to a safe pathname
    // before the guard runs. Result is undefined because the normalized
    // path ("/etc/passwd") doesn't exist under `public/`, not because
    // the traversal guard fired.
    const result = loadOgLogo(
      "https://getdesign.kr/logos/../../etc/passwd",
    )
    expect(result).toBeUndefined()
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("logo missing"),
    )
  })

  it("returns undefined for a logo file that does not exist", () => {
    const result = loadOgLogo(
      "https://getdesign.kr/logos/__no_such_logo__.png",
    )
    expect(result).toBeUndefined()
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("logo missing"),
    )
  })

  it("returns undefined for an unsupported extension", () => {
    // Mock the file as present so we actually reach the extension check
    // instead of short-circuiting at the existence guard — otherwise the
    // test would silently pass for the wrong reason (a false sense of
    // security where the MIME_BY_EXT branch is never exercised).
    const existsSpy = vi.spyOn(fs, "existsSync").mockReturnValue(true)
    try {
      const result = loadOgLogo("https://getdesign.kr/logos/krds.gif")
      expect(result).toBeUndefined()
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("logo unsupported extension"),
      )
    } finally {
      existsSpy.mockRestore()
    }
  })

  it("ignores non-http(s) URLs", () => {
    expect(loadOgLogo("data:image/png;base64,abc")).toBeUndefined()
    expect(loadOgLogo("ftp://example.com/logo.png")).toBeUndefined()
  })

  it("rejects relative paths without a leading slash immediately", () => {
    // Negative invariant: inputs like `../etc/passwd` or
    // `logos/../../etc/passwd` are NOT absolute URLs (no `://`) and don't
    // start with `/`, so `frontmatterLogoToPath` returns them verbatim
    // and `loadOgLogo` rejects them at the `!relPath.startsWith("/")`
    // gate BEFORE any path.join happens — no warning, no fs touch.
    // Codifying this protects the traversal guard's "first line of
    // defense" from a refactor that drops the leading-slash check.
    expect(loadOgLogo("../etc/passwd")).toBeUndefined()
    expect(loadOgLogo("logos/../../etc/passwd")).toBeUndefined()
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
