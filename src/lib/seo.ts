import { truncateForMeta } from "./content-parser"
import { absoluteUrl } from "./site-config"
import type { ServiceDoc } from "./content-types"

type SeoMeta = Record<string, unknown>

export interface SeoHead {
  meta: Array<SeoMeta>
  links: Array<{ rel: "canonical"; href: string }>
}

const SITE_NAME = "ko/design.md"
const HOME_TITLE = "한국 서비스 디자인 시스템 카탈로그 | ko/design.md"
const HOME_DESCRIPTION =
  "한국 서비스의 규칙과 디자인 토큰을 design.md 형식으로 정리한 카탈로그입니다. AI 도구에 바로 붙여 넣어 활용하세요."

export function serviceCanonicalPath(slug: string): string {
  return `/services/${slug}`
}

export function buildHomeSeo(): SeoHead {
  const canonical = absoluteUrl("/")
  const image = absoluteUrl("/og/default.png")

  return {
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "ko_KR" },
      { property: "og:url", content: canonical },
      { property: "og:title", content: HOME_TITLE },
      { property: "og:description", content: HOME_DESCRIPTION },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: HOME_TITLE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: HOME_TITLE },
      { name: "twitter:description", content: HOME_DESCRIPTION },
      { name: "twitter:image", content: image },
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              name: SITE_NAME,
              url: canonical,
              inLanguage: "ko-KR",
            },
            {
              "@type": "CollectionPage",
              name: HOME_TITLE,
              description: HOME_DESCRIPTION,
              url: canonical,
              inLanguage: "ko-KR",
              isPartOf: { "@type": "WebSite", name: SITE_NAME, url: canonical },
            },
          ],
        },
      },
    ],
    links: [{ rel: "canonical", href: canonical }],
  }
}

export function buildServiceSeo(
  doc: ServiceDoc,
  options: { isTabView: boolean }
): SeoHead {
  const canonical = absoluteUrl(serviceCanonicalPath(doc.frontmatter.slug))
  const title = `${doc.frontmatter.name} 디자인 시스템·토큰 | ko/design.md`
  const description =
    truncateForMeta(doc.tagline) ||
    `${doc.frontmatter.name} 디자인 시스템과 토큰 문서`
  const image = absoluteUrl(`/og/${doc.frontmatter.slug}.png`)
  const article: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image,
    dateModified: doc.frontmatter.last_updated,
    inLanguage: doc.frontmatter.lang === "ko" ? "ko-KR" : doc.frontmatter.lang,
    mainEntityOfPage: canonical,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  }

  if (doc.frontmatter.created_at) {
    article.datePublished = doc.frontmatter.created_at
  }

  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(options.isTabView
        ? [{ name: "robots", content: "noindex,follow" }]
        : []),
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonical },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: image },
      {
        property: "og:image:alt",
        content: `${doc.frontmatter.name} design.md`,
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { "script:ld+json": article },
    ],
    links: [{ rel: "canonical", href: canonical }],
  }
}

export function buildNotFoundSeo(): SeoHead {
  return {
    meta: [
      { title: "페이지를 찾을 수 없습니다 | ko/design.md" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [],
  }
}
