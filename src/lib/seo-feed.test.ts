// @vitest-environment jsdom

import { describe, expect, it } from "vitest"
import {
  buildRobotsTxt,
  buildRssXml,
  buildSitemapXml,
} from "./seo-feed"
import { getAllServices } from "./content-collection"
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

  it("accepts full ISO timestamps for RSS dates", () => {
    const xml = buildRssXml({
      siteUrl: SITE_URL,
      services: [
        serviceDoc({
          name: "Timestamped",
          slug: "timestamped",
          lastUpdated: "2026-05-10T12:34:56.000Z",
          body: "본문입니다.",
        }),
      ],
    })

    expect(xml).toContain("<pubDate>Sun, 10 May 2026 12:34:56 GMT</pubDate>")
  })

  it("throws before emitting an invalid RSS date", () => {
    expect(() =>
      buildRssXml({
        siteUrl: SITE_URL,
        services: [
          serviceDoc({
            name: "Bad Date",
            slug: "bad-date",
            lastUpdated: "not-a-date",
            body: "본문입니다.",
          }),
        ],
      }),
    ).toThrow(/Invalid date format/)
  })

  it("uses tagline (not full body) for item description and escapes XML-sensitive text", () => {
    const xml = buildRssXml({ siteUrl: SITE_URL, services: docs })

    expect(xml).toContain("<title>A&amp;B &lt;Design&gt;</title>")
    expect(xml).toContain(
      "<description>요약에도 &amp; 문자가 들어갑니다.</description>",
    )
    // Raw markdown body must NOT leak into <description>
    expect(xml).not.toContain("본문에 &lt;tag&gt; &amp; 특수문자가 들어갑니다.")
  })

  it("truncates long taglines with an ellipsis under 500 characters", () => {
    const longTagline = "가".repeat(600)
    const xml = buildRssXml({
      siteUrl: SITE_URL,
      services: [
        serviceDoc({
          name: "Long",
          slug: "long",
          lastUpdated: "2026-05-10",
          body: "body",
          tagline: longTagline,
        }),
      ],
    })

    const match = xml.match(/<description>([\s\S]*?)<\/description>/g)
    // first <description> is channel-level, second is the item
    expect(match).not.toBeNull()
    const itemDescription = match![1]
    const inner = itemDescription
      .replace(/^<description>/, "")
      .replace(/<\/description>$/, "")
    expect(inner.endsWith("…")).toBe(true)
    // truncateForMeta cuts to max=500 and appends an ellipsis → up to 501 chars
    expect(inner.length).toBeLessThanOrEqual(501)
  })

  it("falls back to frontmatter name when tagline is empty", () => {
    const xml = buildRssXml({
      siteUrl: SITE_URL,
      services: [
        serviceDoc({
          name: "Heading Only",
          slug: "heading-only",
          lastUpdated: "2026-05-10",
          body: "# 헤딩만 있음\n\n> 인용만 있음",
          tagline: "",
        }),
      ],
    })

    expect(xml).toContain("<description>Heading Only</description>")
  })

  it("never emits an empty <description> tag", () => {
    const xml = buildRssXml({
      siteUrl: SITE_URL,
      services: [
        serviceDoc({
          name: "Empty Body",
          slug: "empty-body",
          lastUpdated: "2026-05-10",
          body: "",
          tagline: "",
        }),
      ],
    })

    expect(xml).not.toMatch(/<description>\s*<\/description>/)
  })
})

describe("buildRssXml with real /services/*.md content", () => {
  const xml = buildRssXml({ siteUrl: SITE_URL, services: getAllServices() })

  function itemDescriptions(): Array<string> {
    const matches = Array.from(
      xml.matchAll(/<description>([\s\S]*?)<\/description>/g),
    )
    // first <description> is channel-level (SITE_DESCRIPTION); rest are items.
    return matches.slice(1).map((m) => m[1])
  }

  it("produces well-formed XML (no parsererror node)", () => {
    const doc = new DOMParser().parseFromString(xml, "application/xml")
    const errors = doc.getElementsByTagName("parsererror")
    expect(errors.length).toBe(0)
    expect(doc.documentElement.nodeName).toBe("rss")
  })

  it("does not leak raw markdown markup into any <description>", () => {
    const descriptions = itemDescriptions()
    expect(descriptions.length).toBeGreaterThan(0)
    for (const desc of descriptions) {
      expect(desc).not.toMatch(/(^|\n)#+\s/) // ATX headings
      expect(desc).not.toContain("```") // code fences
      expect(desc).not.toContain("[src:") // Stitch citation refs
      expect(desc).not.toContain("**") // bold markers
    }
  })

  it("emits a non-empty <description> for every item", () => {
    for (const desc of itemDescriptions()) {
      expect(desc.trim().length).toBeGreaterThan(0)
    }
  })

  it("caps every <description> at 500 chars + ellipsis (regression guard against full-body descriptions)", () => {
    for (const desc of itemDescriptions()) {
      // 500 cap + "…" + worst-case escape overhead (e.g. " → &quot;) ≈ 600.
      expect(desc.length).toBeLessThanOrEqual(600)
    }
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
