import { describe, expect, it } from "vitest"
import {
  buildHomeSeo,
  buildNotFoundSeo,
  buildServiceSeo,
  serviceCanonicalPath,
} from "./seo"
import type { SeoHead } from "./seo"
import type { ServiceDoc } from "./content-types"

const tossDoc = {
  frontmatter: {
    name: "Toss",
    slug: "toss",
    category: "finance",
    last_updated: "2026-08-10",
    created_at: "2026-05-10",
    sources: [],
    related_services: [],
    lang: "ko",
  },
  raw: "# Toss",
  body: "Toss design system",
  tagline: "금융 서비스 디자인 시스템과 토큰을 정리한 문서입니다.",
  filePath: "/services/toss.md",
  estimatedTokens: 10,
} satisfies ServiceDoc

const englishDoc = {
  ...tossDoc,
  frontmatter: {
    ...tossDoc.frontmatter,
    lang: "en",
  },
} satisfies ServiceDoc

describe("page SEO", () => {
  it("builds a unique canonical homepage with a WebSite collection graph", () => {
    const head = buildHomeSeo()

    expect(head.meta).toContainEqual({
      title: "한국 서비스 디자인 시스템 카탈로그 | ko/design.md",
    })
    expect(head.links).toContainEqual({ rel: "canonical", href: "/" })
    expect(jsonLdMeta(head)).toMatchObject({
      "script:ld+json": {
        "@context": "https://schema.org",
        "@graph": [
          expect.objectContaining({ "@type": "WebSite" }),
          expect.objectContaining({ "@type": "CollectionPage" }),
        ],
      },
    })
  })

  it("uses the clean service URL as canonical for every tab view", () => {
    expect(serviceCanonicalPath(tossDoc.frontmatter.slug)).toBe(
      "/services/toss"
    )
    expect(buildServiceSeo(tossDoc, { isTabView: false }).links).toContainEqual(
      {
        rel: "canonical",
        href: "/services/toss",
      }
    )
    expect(buildServiceSeo(tossDoc, { isTabView: true }).links).toContainEqual({
      rel: "canonical",
      href: "/services/toss",
    })
  })

  it("noindexes a service tab while preserving its Article metadata", () => {
    const head = buildServiceSeo(tossDoc, { isTabView: true })

    expect(head.meta).toContainEqual({
      title: "Toss 디자인 시스템·토큰 | ko/design.md",
    })
    expect(head.meta).toContainEqual({
      name: "robots",
      content: "noindex,follow",
    })
    expect(head.meta).toContainEqual({
      property: "og:site_name",
      content: "ko/design.md",
    })
    expect(head.meta).toContainEqual({
      property: "og:locale",
      content: "ko_KR",
    })
    expect(jsonLdMeta(head)).toMatchObject({
      "script:ld+json": {
        "@type": "Article",
        headline: "Toss 디자인 시스템·토큰 | ko/design.md",
        dateModified: "2026-08-10",
        datePublished: "2026-05-10",
        mainEntityOfPage: "/services/toss",
      },
    })
  })

  it("omits an Open Graph locale when an English document has no regional policy", () => {
    const head = buildServiceSeo(englishDoc, { isTabView: false })

    expect(head.meta).not.toContainEqual({
      property: "og:locale",
      content: "ko_KR",
    })
    expect(jsonLdMeta(head)).toMatchObject({
      "script:ld+json": {
        inLanguage: "en",
      },
    })
  })
  it("makes 404 pages noindex without a canonical or social preview", () => {
    const head = buildNotFoundSeo()

    expect(head.meta).toContainEqual({
      title: "페이지를 찾을 수 없습니다 | ko/design.md",
    })
    expect(head.meta).toContainEqual({
      name: "robots",
      content: "noindex,follow",
    })
    expect(head.links).toHaveLength(0)
    expect(head.meta).not.toContainEqual(
      expect.objectContaining({ property: "og:title" })
    )
  })
})

function jsonLdMeta(head: SeoHead) {
  return head.meta.find((entry) => "script:ld+json" in entry)
}
