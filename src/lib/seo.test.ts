import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  buildHomeSeo,
  buildNotFoundSeo,
  buildServiceSeo,
  serviceCanonicalPath,
} from "./seo"
import type { JsonLdObject, SeoHead, SeoMeta } from "./seo"
import type { ServiceDoc } from "./content-types"

const tossDoc = {
  frontmatter: {
    name: "Toss",
    slug: "toss",
    category: "finance",
    last_updated: "2026-08-10",
    created_at: "2026-05-10",
    sources: [],
    lang: "ko",
  },
  raw: "# Toss",
  body: "Toss design system",
  tagline: "금융 서비스 디자인 시스템과 토큰을 정리한 문서입니다.",
  filePath: "/services/toss.md",
  estimatedTokens: 10,
} satisfies ServiceDoc

// A second entry, so the ItemList assertions below can tell "in order" from
// "happens to contain". Ordered after `tossDoc` the way `getAllServices()`
// returns them - the home list's own order, which the schema has to match.
const gmarketDoc = {
  ...tossDoc,
  frontmatter: {
    ...tossDoc.frontmatter,
    name: "Gmarket",
    slug: "gmarket",
    category: "commerce",
  },
  filePath: "/services/gmarket.md",
} satisfies ServiceDoc

const catalogDocs = [tossDoc, gmarketDoc] satisfies Array<ServiceDoc>

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
    const head = buildHomeSeo({ isFiltered: false, services: catalogDocs })

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

  it("noindexes a filtered home view but keeps / as its canonical", () => {
    // A filter narrows the same list; it adds no indexable content of its own.
    // Canonical must NOT follow the filter — it names the page to prefer.
    const filtered = buildHomeSeo({ isFiltered: true, services: catalogDocs })

    expect(filtered.meta).toContainEqual({
      name: "robots",
      content: "noindex,follow",
    })
    expect(filtered.links).toContainEqual({ rel: "canonical", href: "/" })
    // The unfiltered list is the indexable one, so it carries no robots meta.
    expect(
      buildHomeSeo({ isFiltered: false, services: catalogDocs }).meta
    ).not.toContainEqual(expect.objectContaining({ name: "robots" }))
  })

  it("lists the whole catalog in render order as the collection's entity", () => {
    const graph = homeGraph(
      buildHomeSeo({ isFiltered: false, services: catalogDocs })
    )
    const collection = graph.find((node) => node["@type"] === "CollectionPage")

    expect(collection?.mainEntity).toMatchObject({
      "@type": "ItemList",
      numberOfItems: 2,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Toss",
          url: "/services/toss",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Gmarket",
          url: "/services/gmarket",
        },
      ],
    })
  })

  // The mistake this guards is subtle and one-directional: a filtered view
  // canonicals to `/`, so if its ItemList narrowed with the filter, the page
  // would be describing `/`'s URL with a list `/` does not have.
  it("advertises the full catalog even from a filtered view", () => {
    const filtered = homeGraph(
      buildHomeSeo({ isFiltered: true, services: catalogDocs })
    )
    const collection = filtered.find(
      (node) => node["@type"] === "CollectionPage"
    )

    expect(collection?.mainEntity).toMatchObject({ numberOfItems: 2 })
  })

  it("declares a search action against the param the home route validates", () => {
    const graph = homeGraph(
      buildHomeSeo({ isFiltered: false, services: catalogDocs })
    )
    const site = graph.find((node) => node["@type"] === "WebSite")

    // `?q=` and not some other spelling: `index.tsx` validates exactly this
    // param, and a template naming a param the route drops would resolve to the
    // unfiltered list while claiming to be a search.
    expect(site?.potentialAction).toMatchObject({
      "@type": "SearchAction",
      target: { urlTemplate: "/?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    })
    expect(site?.publisher).toMatchObject({
      "@type": "Organization",
      logo: "/apple-touch-icon.png",
      sameAs: ["https://github.com/CaesiumY/ko-design-md"],
    })
  })

  it("attributes an entry to the project rather than leaving Article authorless", () => {
    const head = buildServiceSeo(tossDoc, {
      isTabView: false,
    })

    expect(jsonLdMeta(head)).toMatchObject({
      "script:ld+json": {
        author: { "@type": "Organization", name: "ko/design.md" },
        publisher: { "@type": "Organization", name: "ko/design.md" },
        about: { "@type": "Brand", name: "Toss" },
      },
    })
  })

  it("emits a breadcrumb as a second block, leaving Article first", () => {
    const blocks = jsonLdBlocks(buildServiceSeo(tossDoc, { isTabView: false }))

    // Order is the assertion, not an incidental detail: consumers that read one
    // block read the first one, and that has to be the page's entity.
    expect(blocks[0]).toMatchObject({ "@type": "Article" })
    // Each script element is parsed on its own, so the second block needs its
    // own vocabulary declaration - it does not inherit the first block's.
    expect(blocks[1]).toMatchObject({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { position: 1, name: "카탈로그", item: "/" },
        { position: 2, name: "Toss", item: "/services/toss" },
      ],
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
    const head = buildServiceSeo(tossDoc, {
      isTabView: true,
    })

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
    const head = buildServiceSeo(englishDoc, {
      isTabView: false,
    })

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
    const head = buildServiceSeo(docWithoutCreatedAt, {
      isTabView: false,
    })

    expect(jsonLdMeta(head)).not.toMatchObject({
      "script:ld+json": {
        datePublished: expect.any(String),
      },
    })
  })

  // Not a safety test — the router escapes a hostile catalog string either way,
  // measured both ways through the real SSR path (see the note at the top of
  // `seo.ts`, issue #270). This is a VALIDITY test: hand the router
  // `JSON.stringify(article)` and the block comes out as a JSON string that
  // contains JSON, double-encoded, and a crawler reads nothing structured from
  // it. Nothing else in the pipeline notices, which is why it is pinned here.
  it("hands JSON-LD to the router as data, not as a serialized string", () => {
    for (const head of [
      // `isFiltered` is required (issue #269) — the shape being pinned here is
      // the JSON-LD value, and either filter state carries the same one.
      buildHomeSeo({ isFiltered: false, services: catalogDocs }),
      buildServiceSeo(tossDoc, { isTabView: false }),
    ]) {
      const entry = jsonLdMeta(head)
      expect(entry).toBeDefined()
      const value = entry?.["script:ld+json"]
      expect(typeof value).toBe("object")
      expect(value).not.toBeNull()
    }
  })

  // The escaping note at the top of `seo.ts` is a MEASUREMENT, and measurements
  // expire. It was taken against @tanstack/router-core 1.171.24 — which this
  // project does not depend on directly: it arrives under
  // `@tanstack/react-router@^1.170.22`, a caret range, so a lockfile
  // regeneration can move it with nothing in CI saying so. The shape test above
  // would stay green through an escaping-strategy change, because it never looks
  // at the escaping.
  //
  // Pinned at the MAJOR only, deliberately. An exact pin would go red on every
  // dependabot bump, and this repo batches lockfile PRs — friction that lands on
  // unrelated work gets routed around rather than read. How a library serializes
  // its output is part of its contract, so a change to it belongs in a major;
  // that is the version this guard is worth spending a red build on.
  it("keeps the JSON-LD escaping note tied to the router major it was measured on", () => {
    const MEASURED_MAJOR = 1
    // The lockfile rather than `node_modules/@tanstack/router-core/package.json`
    // because that path is not resolvable: router-core is a transitive dep, so
    // pnpm's strict layout does not link it at the root, and the package does
    // not export its own package.json either — `require.resolve` on it answers
    // MODULE_NOT_FOUND. The lockfile is committed, so it also reads the same in
    // CI as it does here.
    // Resolved from this file, not `process.cwd()`: a test should read the same
    // lockfile whatever directory the runner was started in.
    // `preview-merge-anchors.test.ts` resolves its repo root the same way.
    const root = fileURLToPath(new URL("../..", import.meta.url))
    const lock = readFileSync(join(root, "pnpm-lock.yaml"), "utf8")

    // Every occurrence, not the first: the name appears under `packages:` and
    // again under `snapshots:`. Today both say the same thing, but a split peer
    // resolution could put two majors in the file, and picking one silently is
    // the failure this guard exists to prevent. Two distinct majors fails here.
    const majors = [
      ...new Set(
        [
          ...lock.matchAll(
            // `[^']*` after the patch so a prerelease (`1.171.24-rc.1`) still
            // reports its major instead of falling through to the "lockfile
            // format changed" branch, which would name the wrong cause.
            /^\s*'@tanstack\/router-core@(\d+)\.\d+\.\d+[^']*':/gm
          ),
        ].map((m) => m[1])
      ),
    ]

    // Nothing found is a lockfile-format change, not a passing version.
    expect(
      majors,
      "could not read @tanstack/router-core out of pnpm-lock.yaml — the lockfile format changed, so this guard is no longer reading anything"
    ).not.toEqual([])

    expect(
      majors,
      `@tanstack/router-core is no longer on exactly major ${MEASURED_MAJOR}. Re-measure the JSON-LD escaping (render a catalog entry whose name carries </script> through the SSR path, count bare < and & in the ld+json block), update the note at the top of seo.ts, then bump MEASURED_MAJOR here.`
    ).toEqual([String(MEASURED_MAJOR)])
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

// Every JSON-LD block on the page, in emission order. `jsonLdMeta` answers "the
// page's entity"; this answers "everything the page declares", which is what the
// breadcrumb - deliberately not the first block - needs.
function jsonLdBlocks(head: SeoHead): Array<JsonLdObject> {
  return head.meta
    .filter((entry) => "script:ld+json" in entry)
    .map(
      (entry) => (entry as { "script:ld+json": JsonLdObject })["script:ld+json"]
    )
}

// The home head's single block is an `@graph`, so its nodes are reached by type
// rather than by index - an assertion pinned to position 0 would go red the day
// a node is added ahead of it, which says nothing about correctness.
function homeGraph(head: SeoHead): Array<JsonLdObject> {
  return jsonLdBlocks(head)[0]["@graph"] as Array<JsonLdObject>
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
