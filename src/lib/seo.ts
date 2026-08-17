import { truncateForMeta } from "./content-parser"
import { SITE_NAME, absoluteUrl } from "./site-config"
import type { Lang, ServiceDoc } from "./content-types"

type JsonLdPrimitive = string | number | boolean | null
type JsonLdValue = JsonLdPrimitive | JsonLdObject | ReadonlyArray<JsonLdValue>
type JsonLdObject = { [key: string]: JsonLdValue }
/**
 * One entry in a head's `meta` array. Four shapes are used and the first three
 * are spelled out, so a typo (`propety`) or a half-written tag (`name` with no
 * `content`) is a compile error rather than an empty tag in the HTML.
 *
 * The fourth member is deliberately NOT `{ "script:ld+json": JsonLdObject }`,
 * and the reason is in the router's own types (issue #271). `head`'s `meta` is
 * declared `Array<React.JSX.IntrinsicElements['meta']>`, whose properties are
 * all optional — a WEAK TYPE, which TypeScript accepts an object for only if
 * the two share at least one property. `title`, `name` and `content` are
 * shared; `script:ld+json` is a router convention that React's `<meta>` props
 * do not declare, so a member naming only that key has nothing in common and
 * `tsc` rejects the whole head:
 *
 *   Type '{ "script:ld+json": JsonLdObject; }' has no properties in common
 *   with type 'DetailedHTMLProps<MetaHTMLAttributes<HTMLMetaElement>, …>'
 *
 * An index signature is exempt from that check — it is treated as carrying
 * every property — which is why the wide `Record<string, string | JsonLdObject>`
 * this replaced ever compiled. Keeping an index signature for the JSON-LD
 * member alone preserves the exemption while the three tag shapes get real
 * checking. It is still narrower than what it replaced: values must be objects,
 * so a serialized string is rejected here too.
 */
export type SeoMeta =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
  | Record<string, JsonLdObject>

export interface SeoHead {
  meta: Array<SeoMeta>
  links: Array<{ rel: "canonical"; href: string }>
}

const HOME_TITLE = `한국 서비스 디자인 시스템 카탈로그 | ${SITE_NAME}`
const HOME_DESCRIPTION =
  "한국 서비스의 규칙과 디자인 토큰을 design.md 형식으로 정리한 카탈로그입니다. AI 도구에 바로 붙여 넣어 활용하세요."
const SITE_OG_META = [
  { property: "og:site_name", content: SITE_NAME },
] satisfies Array<SeoMeta>

function ogLocaleMeta(lang: Lang): Array<SeoMeta> {
  // Open Graph locale requires a language and territory. Do not invent one for
  // English entries; omit it until a regional policy exists.
  return lang === "ko" ? [{ property: "og:locale", content: "ko_KR" }] : []
}

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
      ...SITE_OG_META,
      ...ogLocaleMeta("ko"),
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
  const articleHeadline = `${doc.frontmatter.name} 디자인 시스템·토큰`
  const title = `${articleHeadline} | ${SITE_NAME}`
  const description =
    truncateForMeta(doc.tagline) ||
    `${doc.frontmatter.name} 디자인 시스템과 토큰 문서`
  const image = absoluteUrl(`/og/${doc.frontmatter.slug}.png`)
  const article: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: articleHeadline,
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
    ...(doc.frontmatter.created_at
      ? { datePublished: doc.frontmatter.created_at }
      : {}),
  }

  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(options.isTabView
        ? [{ name: "robots", content: "noindex,follow" }]
        : []),
      { property: "og:type", content: "article" },
      ...SITE_OG_META,
      ...ogLocaleMeta(doc.frontmatter.lang),
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
      { title: `페이지를 찾을 수 없습니다 | ${SITE_NAME}` },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [],
  }
}
