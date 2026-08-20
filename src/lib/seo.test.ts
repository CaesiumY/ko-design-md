import { readFileSync } from "node:fs"
import { join } from "node:path"
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

  // Not a safety test — the router escapes a hostile catalog string either way,
  // measured both ways through the real SSR path (see the note at the top of
  // `seo.ts`, issue #270). This is a VALIDITY test: hand the router
  // `JSON.stringify(article)` and the block comes out as a JSON string that
  // contains JSON, double-encoded, and a crawler reads nothing structured from
  // it. Nothing else in the pipeline notices, which is why it is pinned here.
  it("hands JSON-LD to the router as data, not as a serialized string", () => {
    for (const head of [
      buildHomeSeo(),
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
    const lock = readFileSync(join(process.cwd(), "pnpm-lock.yaml"), "utf8")

    // Every occurrence, not the first: the name appears under `packages:` and
    // again under `snapshots:`. Today both say the same thing, but a split peer
    // resolution could put two majors in the file, and picking one silently is
    // the failure this guard exists to prevent. Two distinct majors fails here.
    const majors = [
      ...new Set(
        [
          ...lock.matchAll(/^\s*'@tanstack\/router-core@(\d+)\.\d+\.\d+':/gm),
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
