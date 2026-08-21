import { describe, expect, it } from "vitest"
import {
  buildHomeSeo,
  buildNotFoundSeo,
  buildServiceSeo,
  serviceCanonicalPath,
} from "./seo"
import type { SeoHead, SeoMeta } from "./seo"
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
  const docWithoutCreatedAt = {
    ...tossDoc,
    frontmatter: {
      ...tossDoc.frontmatter,
      created_at: "",
    },
  } satisfies ServiceDoc

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
        headline: "Toss 디자인 시스템·토큰",
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

  it("omits datePublished when a malformed document has no creation date", () => {
    const head = buildServiceSeo(docWithoutCreatedAt, { isTabView: false })

    expect(jsonLdMeta(head)).not.toMatchObject({
      "script:ld+json": {
        datePublished: expect.any(String),
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

// Type-level, and `pnpm typecheck` is the gate: an `@ts-expect-error` that does
// NOT error fails the build with "Unused '@ts-expect-error' directive". So each
// one below is an assertion that the shape is genuinely rejected, not a comment
// hoping it is.
//
// These are the mistakes the wide `Record<string, string | JsonLdObject>` used
// to wave through, every one of which renders as a silently useless tag rather
// than as a crash (issue #271).
describe("SeoMeta shapes", () => {
  it("accepts the four shapes the head API is given", () => {
    const ok: Array<SeoMeta> = [
      { title: "제목" },
      { name: "description", content: "설명" },
      { property: "og:type", content: "website" },
      { "script:ld+json": { "@type": "Article" } },
    ]

    expect(ok).toHaveLength(4)
  })

  // Three axes, so a case added later has somewhere to belong and the name
  // above does not drift out of date the way an enumeration would: the KEY is
  // wrong, the PAIRING of keys is wrong, or the VALUE under a right key is.
  it("rejects a wrong key, a broken pairing, or a wrong value", () => {
    const rejected: Array<SeoMeta> = [
      // @ts-expect-error `property` misspelled — renders a meta tag with no key.
      { propety: "og:type", content: "website" },
      // @ts-expect-error a name with no content renders an empty tag.
      { name: "description" },
      // @ts-expect-error content with neither name nor property names nothing.
      { content: "고아" },
      // @ts-expect-error JSON-LD must stay structured data, not a string.
      { "script:ld+json": "{}" },
      // @ts-expect-error the JSON-LD key itself, misspelled.
      { "scirpt:ld+json": { "@type": "Article" } },
      // @ts-expect-error one entry renders one tag: JSON-LD or content, not both.
      { "script:ld+json": { "@type": "Article" }, content: "둘 다" },
      // @ts-expect-error and `title` wins that race outright — the router's tag
      // chain checks `m.title` before `"script:ld+json" in m`, so this entry
      // would render a title and drop the JSON-LD block entirely.
      { "script:ld+json": { "@type": "Article" }, title: "제목" },
    ]

    expect(rejected).toHaveLength(7)
  })
})
