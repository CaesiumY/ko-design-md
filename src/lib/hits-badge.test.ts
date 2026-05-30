import { describe, expect, it } from "vitest"
import { hitsBadgeUrl, hitsNamespaceFromSiteUrl } from "./hits-badge"

describe("hitsNamespaceFromSiteUrl", () => {
  it("extracts the host from VITE_SITE_URL (hits.sh wants a domain)", () => {
    expect(hitsNamespaceFromSiteUrl("https://ko-design-md.dev")).toBe(
      "ko-design-md.dev",
    )
  })

  it("returns host only, ignoring trailing path/slash", () => {
    expect(hitsNamespaceFromSiteUrl("https://ko-design-md.dev/")).toBe(
      "ko-design-md.dev",
    )
  })

  it("returns null when unset (pre-deploy) so the badge hides", () => {
    expect(hitsNamespaceFromSiteUrl("")).toBeNull()
    expect(hitsNamespaceFromSiteUrl(undefined)).toBeNull()
  })

  it("returns null for an unparseable value instead of throwing", () => {
    expect(hitsNamespaceFromSiteUrl("not a url")).toBeNull()
  })
})

describe("hitsBadgeUrl", () => {
  it("builds a hits.sh .svg URL with our flat-square muted styling params", () => {
    expect(hitsBadgeUrl("ko-design-md.dev", "gmarket")).toBe(
      "https://hits.sh/ko-design-md.dev/gmarket.svg?style=flat-square&label=VIEWS&color=595959&labelColor=eeeeee",
    )
  })

  it("keeps the namespace verbatim — hits.sh needs a valid URI (domain or owner/repo path), so slashes must survive", () => {
    expect(hitsBadgeUrl("github.com/CaesiumY/ko-design-md", "toss")).toBe(
      "https://hits.sh/github.com/CaesiumY/ko-design-md/toss.svg?style=flat-square&label=VIEWS&color=595959&labelColor=eeeeee",
    )
  })

  it("URL-encodes the slug so odd characters cannot break the path", () => {
    expect(hitsBadgeUrl("example.com", "a b")).toContain(
      "/example.com/a%20b.svg?",
    )
  })
})
