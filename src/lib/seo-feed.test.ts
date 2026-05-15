import { describe, expect, it } from "vitest"
import {
  buildRobotsTxt,
  buildRssXml,
  buildSitemapXml,
} from "./seo-feed"
import type { ServiceDoc } from "./content-types"

const SITE_URL = "https://ko-design.example/"

function serviceDoc(overrides: {
  name: string
  slug: string
  lastUpdated: string
  body: string
  tagline?: string
}): ServiceDoc {
  return {
    frontmatter: {
      name: overrides.name,
      slug: overrides.slug,
      category: "etc",
      last_updated: overrides.lastUpdated,
      sources: [],
      related_services: [],
      lang: "ko",
    },
    raw: overrides.body,
    body: overrides.body,
    tagline: overrides.tagline ?? overrides.body,
    filePath: `/services/${overrides.slug}.md`,
    estimatedTokens: 1200,
  }
}

const docs = [
  serviceDoc({
    name: "토스",
    slug: "toss",
    lastUpdated: "2026-05-10",
    body: "토스 디자인 원칙 전체 본문입니다.",
  }),
  serviceDoc({
    name: "A&B <Design>",
    slug: "a-b",
    lastUpdated: "2026-05-08",
    body: "본문에 <tag> & 특수문자가 들어갑니다.",
    tagline: "요약에도 & 문자가 들어갑니다.",
  }),
]

describe("buildSitemapXml", () => {
  it("includes the homepage and service detail pages as absolute canonical URLs", () => {
    const xml = buildSitemapXml({ siteUrl: SITE_URL, services: docs })

    expect(xml).toContain("<loc>https://ko-design.example/</loc>")
    expect(xml).toContain("<loc>https://ko-design.example/services/toss</loc>")
    expect(xml).toContain("<loc>https://ko-design.example/services/a-b</loc>")
    expect(xml).not.toContain("?tab=")
  })

  it("uses each service last_updated value as lastmod", () => {
    const xml = buildSitemapXml({ siteUrl: SITE_URL, services: docs })

    expect(xml).toContain("<lastmod>2026-05-10</lastmod>")
    expect(xml).toContain("<lastmod>2026-05-08</lastmod>")
  })
})

describe("buildRssXml", () => {
  it("builds an RSS feed with self link, item links, stable guids, and pub dates", () => {
    const xml = buildRssXml({ siteUrl: SITE_URL, services: docs })

    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain(
      '<atom:link href="https://ko-design.example/rss.xml" rel="self" type="application/rss+xml" />',
    )
    expect(xml).toContain("<link>https://ko-design.example/services/toss</link>")
    expect(xml).toContain(
      '<guid isPermaLink="true">https://ko-design.example/services/toss</guid>',
    )
    expect(xml).toContain("<pubDate>Sun, 10 May 2026 00:00:00 GMT</pubDate>")
  })

  it("escapes XML-sensitive text and exposes the full document body", () => {
    const xml = buildRssXml({ siteUrl: SITE_URL, services: docs })

    expect(xml).toContain("<title>A&amp;B &lt;Design&gt;</title>")
    expect(xml).toContain(
      "<description>본문에 &lt;tag&gt; &amp; 특수문자가 들어갑니다.</description>",
    )
  })
})

describe("buildRobotsTxt", () => {
  it("points crawlers to the absolute sitemap URL", () => {
    expect(buildRobotsTxt(SITE_URL)).toBe(
      [
        "# https://www.robotstxt.org/robotstxt.html",
        "User-agent: *",
        "Disallow:",
        "Sitemap: https://ko-design.example/sitemap.xml",
        "",
      ].join("\n"),
    )
  })
})
