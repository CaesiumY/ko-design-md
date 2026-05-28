import { describe, expect, it } from "vitest"
import { extractLinks, filterUrls, parseSitemapXml } from "./discover"

describe("parseSitemapXml", () => {
  it("parses a urlset into page locs", () => {
    const xml = `<?xml version="1.0"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>https://x.com/a</loc></url>
        <url><loc>https://x.com/b</loc></url>
      </urlset>`
    const result = parseSitemapXml(xml)
    expect(result.kind).toBe("urlset")
    expect(result.locs).toEqual(["https://x.com/a", "https://x.com/b"])
  })

  it("handles a urlset with a single entry", () => {
    const xml = `<urlset><url><loc>https://x.com/only</loc></url></urlset>`
    expect(parseSitemapXml(xml).locs).toEqual(["https://x.com/only"])
  })

  it("parses a sitemap index into child sitemap locs", () => {
    const xml = `<sitemapindex>
        <sitemap><loc>https://x.com/sitemap-1.xml</loc></sitemap>
        <sitemap><loc>https://x.com/sitemap-2.xml</loc></sitemap>
      </sitemapindex>`
    const result = parseSitemapXml(xml)
    expect(result.kind).toBe("index")
    expect(result.locs).toHaveLength(2)
  })

  it("returns an empty urlset for malformed or empty input", () => {
    expect(parseSitemapXml("not xml at all <<<").locs).toEqual([])
    expect(parseSitemapXml("").locs).toEqual([])
  })
})

describe("filterUrls", () => {
  const origin = "https://x.com"

  it("keeps only same-origin URLs", () => {
    const result = filterUrls(
      ["https://x.com/a", "https://other.com/b", "https://x.com/c"],
      origin,
      100,
    )
    expect(result).toEqual(["https://x.com/a/", "https://x.com/c/"])
  })

  it("deduplicates and strips fragments", () => {
    const result = filterUrls(
      ["https://x.com/a", "https://x.com/a#top", "https://x.com/a"],
      origin,
      100,
    )
    expect(result).toEqual(["https://x.com/a/"])
  })

  it("collapses trailing-slash variants into one entry", () => {
    const result = filterUrls(
      ["https://x.com/dialog", "https://x.com/dialog/"],
      origin,
      100,
    )
    expect(result).toEqual(["https://x.com/dialog/"])
  })

  it("leaves the root and file-extension paths untouched", () => {
    const result = filterUrls(
      ["https://x.com/", "https://x.com/index.html"],
      origin,
      100,
    )
    expect(result).toEqual(["https://x.com/", "https://x.com/index.html"])
  })

  it("drops non-HTML asset URLs", () => {
    const result = filterUrls(
      [
        "https://x.com/page",
        "https://x.com/style.css",
        "https://x.com/app.js",
      ],
      origin,
      100,
    )
    expect(result).toEqual(["https://x.com/page/"])
  })

  it("enforces the page cap", () => {
    const urls = ["a", "b", "c", "d", "e"].map((p) => `https://x.com/${p}`)
    expect(filterUrls(urls, origin, 3)).toHaveLength(3)
  })
})

describe("extractLinks", () => {
  it("resolves relative hrefs against the page URL", () => {
    const html = `<a href="/foo">F</a><a href="bar">B</a>`
    const links = extractLinks(html, "https://x.com/docs/")
    expect(links).toContain("https://x.com/foo")
    expect(links).toContain("https://x.com/docs/bar")
  })

  it("skips pure-fragment links", () => {
    const html = `<a href="#section">Jump</a><a href="/real">Real</a>`
    const links = extractLinks(html, "https://x.com/")
    expect(links).toEqual(["https://x.com/real"])
  })

  it("handles unquoted href attributes", () => {
    const links = extractLinks(`<a href=/docs/intro>Intro</a>`, "https://x.com/")
    expect(links).toContain("https://x.com/docs/intro")
  })
})
