// @vitest-environment jsdom

import { describe, expect, it } from "vitest"
import {
  buildLlmsTxt,
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
      '<atom:link href="https://ko-design.example/rss.xml" rel="self" type="application/rss+xml" />'
    )
    expect(xml).toContain(
      "<link>https://ko-design.example/services/toss</link>"
    )
    expect(xml).toContain(
      '<guid isPermaLink="true">https://ko-design.example/services/toss</guid>'
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
      })
    ).toThrow(/Invalid date format/)
  })

  it("uses tagline (not full body) for item description and escapes XML-sensitive text", () => {
    const xml = buildRssXml({ siteUrl: SITE_URL, services: docs })

    expect(xml).toContain("<title>A&amp;B &lt;Design&gt;</title>")
    expect(xml).toContain(
      "<description>요약에도 &amp; 문자가 들어갑니다.</description>"
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
    // Use DOM navigation rather than regex so we target <description> children of
    // <item> specifically — robust against future channel-level <description>
    // siblings (e.g. <image><description>...</description></image>).
    const doc = new DOMParser().parseFromString(xml, "application/xml")
    return Array.from(doc.getElementsByTagName("item")).map(
      (item) => item.getElementsByTagName("description")[0].textContent
    )
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
      // textContent decodes entities, so the bound matches truncateForMeta
      // exactly: max=500 + "…" = 501.
      expect(desc.length).toBeLessThanOrEqual(501)
    }
  })
})

describe("buildLlmsTxt", () => {
  it("lists each service as a markdown link to its raw llms.txt endpoint with category and tagline", () => {
    const txt = buildLlmsTxt({ siteUrl: SITE_URL, services: docs })

    expect(txt).toContain(
      "- [토스](https://ko-design.example/services/toss/llms.txt): etc — 토스 디자인 원칙 전체 본문입니다."
    )
    expect(txt).toContain(
      "- [A&B <Design>](https://ko-design.example/services/a-b/llms.txt): etc — 요약에도 & 문자가 들어갑니다."
    )
    // links point at the raw endpoint, not the human detail page
    expect(txt).not.toContain("/services/toss):")
  })

  it("emits the llmstxt.org header (title + summary + Catalog section)", () => {
    const txt = buildLlmsTxt({ siteUrl: SITE_URL, services: docs })

    expect(txt).toContain("# ko/design.md")
    expect(txt).toContain("## Catalog")
  })

  it("falls back to the service name when the tagline is empty", () => {
    const txt = buildLlmsTxt({
      siteUrl: SITE_URL,
      services: [
        serviceDoc({
          name: "Heading Only",
          slug: "heading-only",
          lastUpdated: "2026-05-10",
          body: "# 헤딩만 있음",
          tagline: "",
        }),
      ],
    })

    expect(txt).toContain(
      "- [Heading Only](https://ko-design.example/services/heading-only/llms.txt): etc — Heading Only"
    )
  })

  it("falls back to the service name when the tagline is whitespace-only", () => {
    const txt = buildLlmsTxt({
      siteUrl: SITE_URL,
      services: [
        serviceDoc({
          name: "Whitespace Tagline",
          slug: "whitespace-tagline",
          lastUpdated: "2026-05-10",
          body: "body",
          tagline: "   \n\t ",
        }),
      ],
    })

    expect(txt).toContain(
      "- [Whitespace Tagline](https://ko-design.example/services/whitespace-tagline/llms.txt): etc — Whitespace Tagline"
    )
    // a whitespace-only tagline must not leave a dangling "— " at the line end
    expect(txt).not.toMatch(/— *$/m)
  })

  it("escapes markdown link-text brackets in the service name", () => {
    const txt = buildLlmsTxt({
      siteUrl: SITE_URL,
      services: [
        serviceDoc({
          name: "서비스]X",
          slug: "bracket-name",
          lastUpdated: "2026-05-10",
          body: "본문",
          tagline: "괄호 포함 이름",
        }),
      ],
    })

    // the `]` is escaped so the link text doesn't terminate early
    expect(txt).toContain(
      "- [서비스\\]X](https://ko-design.example/services/bracket-name/llms.txt): etc — 괄호 포함 이름"
    )
  })

  it("collapses whitespace so every entry stays on a single line", () => {
    const txt = buildLlmsTxt({
      siteUrl: SITE_URL,
      services: [
        serviceDoc({
          name: "Multiline",
          slug: "multiline",
          lastUpdated: "2026-05-10",
          body: "body",
          tagline: "첫 줄\n둘째 줄",
        }),
      ],
    })

    expect(txt).toContain("— 첫 줄 둘째 줄") // newline collapsed to a space
    // the catalog list must have exactly one line beginning with "- ["
    const entryLines = txt.split("\n").filter((line) => line.startsWith("- ["))
    expect(entryLines).toHaveLength(1)
  })

  it("does not throw and still emits the header for an empty catalog", () => {
    const txt = buildLlmsTxt({ siteUrl: SITE_URL, services: [] })

    expect(txt).toContain("# ko/design.md")
    expect(txt).toContain("## Catalog")
    expect(
      txt.split("\n").filter((line) => line.startsWith("- ["))
    ).toHaveLength(0)
  })
})

describe("buildLlmsTxt with real /services/*.md content", () => {
  const txt = buildLlmsTxt({ siteUrl: SITE_URL, services: getAllServices() })

  it("emits exactly one catalog entry per service", () => {
    const entryLines = txt.split("\n").filter((line) => line.startsWith("- ["))
    expect(entryLines).toHaveLength(getAllServices().length)
    expect(entryLines.length).toBeGreaterThan(0)
  })

  it("links every entry to a /services/{slug}/llms.txt endpoint", () => {
    const entryLines = txt.split("\n").filter((line) => line.startsWith("- ["))
    for (const line of entryLines) {
      expect(line).toMatch(
        /\]\(https:\/\/ko-design\.example\/services\/[^/]+\/llms\.txt\): /
      )
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
      ].join("\n")
    )
  })
})
