import { truncateForMeta } from "./content-parser"
import { GITHUB_REPO_URL, SITE_NAME, absoluteUrl } from "./site-config"
import type { Lang, ServiceDoc } from "./content-types"

// A catalog string cannot break out of the JSON-LD script element. Measured
// rather than argued (issue #270): an entry whose `name` and tagline carried
// `</script><script>alert(1)</script>`, `<img src=x onerror=…>` and `<!--` was
// rendered through the real SSR path (@tanstack/router-core 1.171.24), and
// every angle bracket and ampersand came out as a unicode escape — a
// backslash-u sequence for code point 3C in place of each `<`, one for 26 in
// place of each `&`. Counted over the emitted block: 7 of the former, 2 of the
// latter, ZERO bare `<` or `&` anywhere in it. `JSON.parse` still returns the
// original characters, so a crawler reads the value undamaged.
//
// So there is no defensive encoder in this file, and adding one would corrupt
// the value it claims to protect.
//
// The same run measured the near miss, because it is the one worth naming.
// Handing the router `JSON.stringify(article)` instead of the object is still
// SAFE — identical escaping, still zero bare `<` — but it emits a JSON *string*
// containing JSON rather than an object, so a crawler gets nothing usable. What
// the shape buys is validity, not safety, and `seo.test.ts` pins it on those
// terms.
type JsonLdPrimitive = string | number | boolean | null
type JsonLdValue = JsonLdPrimitive | JsonLdObject | ReadonlyArray<JsonLdValue>
export type JsonLdObject = { [key: string]: JsonLdValue }
/**
 * One entry in a head's `meta` array. Four shapes are used and the first three
 * are spelled out, so a typo (`propety`) or a half-written tag (`name` with no
 * `content`) is a compile error rather than an empty tag in the HTML.
 *
 * The `undefined` markers on the fourth member are load-bearing twice over, and
 * both reasons live outside this file (issue #271).
 *
 * FIRST, they get the member accepted at all. `head`'s `meta` is declared
 * `Array<React.JSX.IntrinsicElements['meta'] | undefined>`, whose properties are
 * all optional — a WEAK TYPE, which TypeScript accepts an object for only if the
 * two share at least one property. `title`, `name` and `content` are shared;
 * `script:ld+json` is a router convention that React's `<meta>` props do not
 * declare. Written as `{ "script:ld+json": JsonLdObject }` alone the member has
 * nothing in common, and `tsc` rejects the whole head:
 *
 *   Type '{ "script:ld+json": JsonLdObject; }' has no properties in common
 *   with type 'DetailedHTMLProps<MetaHTMLAttributes<HTMLMetaElement>, …>'
 *
 * The check asks only whether a property is shared, not what it holds, so
 * declaring one as `undefined` satisfies it while forbidding the value.
 *
 * SECOND — and this is why `title` is here and not just `content` — the router
 * renders one tag per entry, by a chain that tries `title` first:
 *
 *   if (m.title) { …title tag… }
 *   else if ("script:ld+json" in m) { …ld+json script… }
 *   else { …name/property meta… }
 *   (@tanstack/react-router, dist/esm/headContentUtils.js)
 *
 * So an entry carrying BOTH `title` and `script:ld+json` renders the title and
 * the JSON-LD is never emitted — the whole block, silently. `content` alongside
 * `script:ld+json` is the harmless one: it falls to the same branch and the
 * JSON-LD renders fine. The first draft of this type forbade only `content`,
 * which blocked the harmless pairing and let the destructive one compile.
 * Both are pinned in `seo.test.ts`.
 *
 * The alternative is an index signature, which is exempt from the check because
 * it reads as carrying every property. That is why the wide
 * `Record<string, string | JsonLdObject>` this replaced ever compiled, and it is
 * exactly what the marker avoids: an index signature buys the exemption by
 * giving up the key, so `scirpt:ld+json` would compile. Both are pinned in
 * `seo.test.ts`.
 */
export type SeoMeta =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
  | {
      "script:ld+json": JsonLdObject
      content?: undefined
      title?: undefined
    }

export interface SeoHead {
  meta: Array<SeoMeta>
  links: Array<{ rel: "canonical"; href: string }>
}

const HOME_TITLE = `한국 서비스 디자인 시스템 카탈로그 | ${SITE_NAME}`
// Brand names first because they ARE the query - people search "토스 디자인
// 시스템", not "디자인 시스템 카탈로그" - and the line closes on the outcome rather
// than on an instruction ("활용하세요" asked for effort without saying what it buys).
// Named brands rather than a count: a number goes stale on the next entry, and
// these three are the ones a reader recognizes without explanation.
const HOME_DESCRIPTION =
  "토스·배민·당근 등 한국 서비스의 색·타이포·컴포넌트를 design.md 한 장으로. 복사해 AI에 붙여넣으면 그 브랜드 톤으로 화면이 나옵니다."
const SITE_OG_META = [
  { property: "og:site_name", content: SITE_NAME },
] satisfies Array<SeoMeta>

// The catalog publishes under one identity on every page, so the Organization
// is written once and pointed at by `@id` from the nodes that need it. Repeating
// the literal object would leave an entity resolver deciding whether several
// same-named publishers are one publisher; an `@id` says so outright.
//
// The value is a fragment on the site root rather than a bare word because
// `@id` is a URI - two sites that both claimed "#organization" would collide.
const ORGANIZATION_ID = `${absoluteUrl("/")}#organization`

// The site itself, for the same reason. Two nodes typed `WebSite` in one graph
// with different property sets leave a consumer to decide whether they are one
// entity; an `@id` answers it. Entry pages carry no WebSite node of their own,
// so the literal there keeps its properties AND this id - a partial definition
// a consumer can unify with the home page's rather than a second site.
const WEBSITE_ID = `${absoluteUrl("/")}#website`

/**
 * The publisher node, embedded rather than referenced on the pages that need it.
 *
 * Embedding costs a few hundred bytes per page and buys self-containment: a
 * consumer that reads one page's block in isolation - which is how AI crawlers
 * and social unfurlers read them - resolves `author` and `publisher` without
 * having to fetch `/` first. A bare `{ "@id": ... }` reference would resolve to
 * nothing for that reader.
 */
function organizationNode(): JsonLdObject {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    // 180x180 raster. Google's Organization logo guidance takes raster only, so
    // `/favicon.svg` - the same mark - is not usable here.
    logo: absoluteUrl("/apple-touch-icon.png"),
    // `sameAs` ties this site to the entity a crawler already knows. The URL
    // comes from `site-config`, which declares itself the single source of
    // truth for it - a second literal here drifted from that one on the first
    // try (it differed in case).
    sameAs: [GITHUB_REPO_URL],
  }
}

/**
 * The catalog list as structured data, in the order the home page renders it.
 *
 * Order is `getAllServices()`'s, which is recently-added-first, so the schema
 * matches what a reader sees - the one rule structured data cannot bend. No
 * `itemListOrder`: the enumeration only offers ascending/descending against an
 * unnamed property, and "recently added" is not a property this list declares.
 *
 * Emitted only for the unfiltered list - see the call site for why a filtered
 * view carries no list rather than a narrowed or a complete one.
 */
function catalogItemList(services: ReadonlyArray<ServiceDoc>): JsonLdObject {
  return {
    "@type": "ItemList",
    numberOfItems: services.length,
    itemListElement: services.map((doc, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: doc.frontmatter.name,
      url: absoluteUrl(serviceCanonicalPath(doc.frontmatter.slug)),
    })),
  }
}

/**
 * Two levels, because the site has two: the catalog and an entry in it.
 *
 * Category is deliberately not a middle rung. Categories exist only as `?cat=`
 * on the home page, which is a filtered view - `noindex`, canonicalling to `/`.
 * A breadcrumb whose middle item pointed there would hand a crawler a trail
 * through a URL the same head tells it not to index.
 */
function breadcrumbList(doc: ServiceDoc, canonical: string): JsonLdObject {
  return {
    // Its own `@context`, because this is its own script element. A block that
    // inherited the vocabulary from the Article's block would parse as JSON and
    // mean nothing as JSON-LD - the failure a renderer does not report.
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "카탈로그",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: doc.frontmatter.name,
        item: canonical,
      },
    ],
  }
}

function ogLocaleMeta(lang: Lang): Array<SeoMeta> {
  // Open Graph locale requires a language and territory. Do not invent one for
  // English entries; omit it until a regional policy exists.
  return lang === "ko" ? [{ property: "og:locale", content: "ko_KR" }] : []
}

export function serviceCanonicalPath(slug: string): string {
  return `/services/${slug}`
}

/**
 * The home head. `isFiltered` says whether the URL narrows the catalogue list
 * with `?cat=` or `?q=`.
 *
 * A filtered view is `noindex,follow` and still canonicals to `/`. It renders
 * the same cards as the full list, only fewer, and carries no title or
 * description of its own — there is nothing in it for a crawler to index that
 * `/` does not already have. `?q=` is user-typed on top of that, so its URL
 * space is unbounded. `follow` rather than `none` because the links out of a
 * filtered list are the same catalogue links worth crawling.
 *
 * Canonical stays `/` in both cases rather than naming the filtered URL:
 * canonical points at the page a crawler should prefer, and that is the whole
 * list.
 *
 * The answer comes from the URL, never from what the filter happens to return.
 * A category holding every entry would still be `noindex` — today none holds
 * more than 3 of 17, so the case is hypothetical, but the rule is not about
 * this catalogue's shape. An indexing directive that varied with the data would
 * flip a URL between indexable and not as entries land, and a crawler that
 * cached the indexable answer would be acting on a page that has since retracted
 * it. A stable directive is worth more than a marginally more precise one.
 *
 * `buildServiceSeo` answers the same question for tab states — a URL that
 * varies the view without varying the content — and this mirrors it, down to
 * the options-object shape and where the robots meta sits.
 *
 * The parameter is required rather than defaulted: this policy went unwritten
 * because nothing in the signature asked (issue #269).
 */
export function buildHomeSeo(options: {
  isFiltered: boolean
  services: ReadonlyArray<ServiceDoc>
}): SeoHead {
  const canonical = absoluteUrl("/")
  const image = absoluteUrl("/og/default.png")

  return {
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESCRIPTION },
      ...(options.isFiltered
        ? [{ name: "robots", content: "noindex,follow" }]
        : []),
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
              "@id": WEBSITE_ID,
              name: SITE_NAME,
              url: canonical,
              inLanguage: "ko-KR",
              publisher: organizationNode(),
              // The catalog's search is a URL, not a JS-only widget: `?q=` is a
              // validated search param on `/`, so a consumer that follows this
              // template lands on a real filtered list. Those filtered views are
              // `noindex` - which is about what a crawler should index, not
              // about whether the action resolves, and it resolves.
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${canonical}?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "CollectionPage",
              name: HOME_TITLE,
              description: HOME_DESCRIPTION,
              url: canonical,
              inLanguage: "ko-KR",
              isPartOf: { "@id": WEBSITE_ID },
              // Only on the unfiltered list. A filtered view renders a subset,
              // so claiming the whole catalog describes a page the reader is
              // not looking at - and narrowing it instead would describe a list
              // that `/`, the URL this page canonicals to, does not have.
              // Neither reading is worth defending on a `noindex` page, so it
              // carries no list at all and `/` keeps the complete one.
              ...(options.isFiltered
                ? {}
                : { mainEntity: catalogItemList(options.services) }),
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
      "@id": WEBSITE_ID,
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    // Article's required-property set includes an author, and this one had none.
    // The entries are authored collectively under the project rather than by a
    // named person, which is what an Organization author is for - inventing a
    // byline to satisfy the validator would be the schema lying.
    // The catalog authors and publishes the entry, so both name the same
    // entity. `publisher` carries the node and `author` refers to it by `@id` -
    // the reference resolves inside this same block, and emitting the object
    // twice would put a second identical copy on every entry page for nothing.
    author: { "@id": ORGANIZATION_ID },
    publisher: organizationNode(),
    // What the page is ABOUT is the brand's design system, not the brand's
    // company. `Brand` says that without asserting anything - headquarters,
    // founding date, sameAs - that this catalog has not verified.
    about: {
      "@type": "Brand",
      name: doc.frontmatter.name,
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
      // A second block rather than a member of an `@graph`, so the Article stays
      // the first thing any consumer reads - including the ones that take only
      // the first `application/ld+json` script on the page. Multiple blocks are
      // supported everywhere that reads JSON-LD at all, and the breadcrumb is
      // supplementary to the entity, not a peer of it.
      { "script:ld+json": breadcrumbList(doc, canonical) },
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
