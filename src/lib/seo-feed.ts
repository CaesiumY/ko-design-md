import { sortDocsByUpdated, truncateForMeta } from "./content-parser"
import { serviceCanonicalPath } from "./seo"
import {
  AGENT_SKILLS_INDEX_PATH,
  SITE_NAME,
  SKILL_INSTALL_CMD,
  STATIC_PAGE_PATHS,
} from "./site-config"
import type { ServiceDoc } from "./content-types"

const SITE_DESCRIPTION =
  "한국 서비스의 시그니처 디자인을 design.md 한 장으로 정리한 카탈로그입니다."

interface FeedInput {
  siteUrl: string
  services: Array<ServiceDoc>
}

function normalizeSiteUrl(siteUrl: string): string {
  const normalized = siteUrl.trim().replace(/\/+$/, "")
  if (!/^https?:\/\/[^/]+/.test(normalized)) {
    throw new Error(
      `siteUrl must be an absolute URL, got "${siteUrl || "(empty)"}"`
    )
  }
  return normalized
}

function canonicalUrl(origin: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${origin}${normalizedPath}`
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function toRssDate(isoDate: string): string {
  const source = isoDate.includes("T") ? isoDate : `${isoDate}T00:00:00.000Z`
  const utc = new Date(source).toUTCString()
  if (utc === "Invalid Date") {
    throw new Error(`Invalid date format: ${isoDate}`)
  }
  return utc
}

function latestUpdated(services: Array<ServiceDoc>): string {
  return services.reduce((latest, doc) => {
    const next = doc.frontmatter.last_updated
    return next > latest ? next : latest
  }, "")
}

export function buildSitemapXml({ siteUrl, services }: FeedInput): string {
  const origin = normalizeSiteUrl(siteUrl)
  const latest = latestUpdated(services)
  const urls = [
    [
      "  <url>",
      `    <loc>${escapeXml(canonicalUrl(origin, "/"))}</loc>`,
      latest ? `    <lastmod>${escapeXml(latest)}</lastmod>` : "",
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n"),
    // No `lastmod` for the static pages: these are hand-written and the
    // catalog has no edit date for them, and a fabricated one is worse than an
    // absent one - a crawler treats lastmod as a claim about freshness.
    ...STATIC_PAGE_PATHS.map((path) =>
      [
        "  <url>",
        `    <loc>${escapeXml(canonicalUrl(origin, path))}</loc>`,
        "  </url>",
      ].join("\n")
    ),
    ...services.map((doc) =>
      [
        "  <url>",
        `    <loc>${escapeXml(canonicalUrl(origin, serviceCanonicalPath(doc.frontmatter.slug)))}</loc>`,
        doc.frontmatter.last_updated
          ? `    <lastmod>${escapeXml(doc.frontmatter.last_updated)}</lastmod>`
          : "",
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n")
    ),
  ]

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n")
}

export function buildRssXml({ siteUrl, services }: FeedInput): string {
  const origin = normalizeSiteUrl(siteUrl)
  const latest = latestUpdated(services)
  // Callers hand over the catalog in "recently added" order (see sortDocsByAdded).
  // A feed must lead with what changed, and every item below publishes
  // last_updated as its pubDate — so re-sort here rather than relying on the
  // caller, and keep the invariant local to the builder that owns feed semantics.
  const items = sortDocsByUpdated(services).map((doc) => {
    const itemUrl = canonicalUrl(
      origin,
      serviceCanonicalPath(doc.frontmatter.slug)
    )
    const updated = doc.frontmatter.last_updated
    const description = truncateForMeta(
      doc.tagline || doc.frontmatter.name,
      500
    )

    return [
      "    <item>",
      `      <title>${escapeXml(doc.frontmatter.name)}</title>`,
      `      <link>${escapeXml(itemUrl)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(itemUrl)}</guid>`,
      updated ? `      <pubDate>${toRssDate(updated)}</pubDate>` : "",
      `      <description>${escapeXml(description)}</description>`,
      "    </item>",
    ]
      .filter(Boolean)
      .join("\n")
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(SITE_NAME)}</title>`,
    `    <link>${escapeXml(canonicalUrl(origin, "/"))}</link>`,
    `    <description>${escapeXml(SITE_DESCRIPTION)}</description>`,
    "    <language>ko</language>",
    latest ? `    <lastBuildDate>${toRssDate(latest)}</lastBuildDate>` : "",
    `    <atom:link href="${escapeXml(canonicalUrl(origin, "/rss.xml"))}" rel="self" type="application/rss+xml" />`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ]
    .filter(Boolean)
    .join("\n")
}

// Agent-facing catalog index following the llms.txt convention
// (https://llmstxt.org). Complements the per-entry `/services/{slug}/llms.txt`
// raw-markdown endpoints: this root index is what an agent reads first to learn
// which entries exist and resolve a brand name to a slug. Built from the same
// `getAllServices()` source as the sitemap, so new entries appear automatically
// — no hand-maintained list to drift.
export function buildLlmsTxt({ siteUrl, services }: FeedInput): string {
  const origin = normalizeSiteUrl(siteUrl)
  const entries = services.map((doc) => {
    const { name, slug, category } = doc.frontmatter
    const url = canonicalUrl(origin, `/services/${slug}/llms.txt`)
    // Escape markdown link-text brackets in the name: a `]` in a brand name would
    // otherwise close the link text early and corrupt the entry. No current entry
    // hits this, but the index must stay valid markdown as the catalog grows.
    const safeName = name.replace(/[[\]]/g, "\\$&")
    // Collapse whitespace before truncating: taglines are derived from prose and
    // may contain newlines, which would break the one-line-per-entry list. Clean
    // first, THEN fall back to the brand name — a whitespace-only tagline is
    // truthy, so `doc.tagline || name` alone would let it through and trim to an
    // empty string, leaving a dangling "— " at the end of the entry.
    const cleaned = (doc.tagline || "").replace(/\s+/g, " ").trim()
    const tagline = truncateForMeta(cleaned || name, 160)
    return `- [${safeName}](${url}): ${category} — ${tagline}`
  })

  return [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "> 각 항목의 원본 design.md는 링크(.../llms.txt)에서 평문 마크다운으로 받을 수 있습니다.",
    // The same entry is also served in Google's published DESIGN.md format
    // (tokens in YAML frontmatter). Announced here because an endpoint nobody
    // can discover is an endpoint nobody uses — llms.txt is the one document
    // every agent fetches first.
    "> 같은 항목을 Google DESIGN.md 형식으로 받으려면 `.../llms.txt`를 `.../DESIGN.md`로 바꾸세요 — 토큰이 YAML frontmatter에 담깁니다.",
    "",
    // An agent that has fetched this file still has to decide whether this
    // catalog is the right tool for the job it was given. The Catalog list
    // answers "which brands", not "when to reach for this at all" - so say it
    // outright, including the cases where the honest answer is to decline.
    `## When to use ${SITE_NAME}`,
    "",
    "한국 서비스의 UI를 그 브랜드답게 만들어야 할 때 씁니다 — 색·타이포그래피·간격·라운드·그림자·컴포넌트 규칙이 추정값이 아니라 공개 출처에서 확인된 실제 값으로 들어 있습니다. 브랜드 톤으로 화면을 새로 짜거나 기존 화면을 다시 입힐 때, 특정 한국 서비스의 디자인 시스템이 무엇을 규정하는지 확인해야 할 때가 제 자리입니다.",
    "",
    `호출 규약은 \`use-design-md\` 스킬입니다 (\`${SKILL_INSTALL_CMD}\`). 스킬 없이 쓰려면 아래 Catalog 에서 슬러그를 찾아 \`/services/{slug}/llms.txt\` 를 평문으로 받으면 됩니다 — 로컬 사본 없이 네트워크로 바로 읽힙니다.`,
    "",
    "다음에는 쓰지 마세요. 카탈로그에 없는 브랜드의 디자인을 추정하는 데 쓰지 마세요 — 없으면 없다고 답하는 편이 그럴듯한 팔레트를 지어내는 것보다 낫습니다. 로고·서체 같은 브랜드 자산의 배포처가 아니며, 각 자산의 권리는 해당 브랜드에 있습니다. 각 항목은 공개 출처를 [src:N] 으로 인용하고 그 출처가 정본이므로, 이 카탈로그가 공식 문서를 대체하지 않습니다.",
    "",
    "## Catalog",
    "",
    ...entries,
    "",
    // Every surface the site publishes that is not a catalog entry. Grouped
    // here rather than scattered through the prose above, so one fetch of
    // this file is enough to reach all of them.
    "## Main pages",
    "",
    `- [카탈로그 홈](${canonicalUrl(origin, "/")}) — 브라우저용 목록·검색·필터`,
    `- [소개](${canonicalUrl(origin, "/about")}) — 카탈로그의 목적, 두 포맷을 함께 발행하는 이유, 인용·프로비넌스 정책`,
    `- [문의·정정](${canonicalUrl(origin, "/contact")}) — 값이 틀렸을 때 근거와 함께 신고하는 방법`,
    `- [개인정보 처리방침](${canonicalUrl(origin, "/privacy")}) — 무엇을 수집하지 않는지`,
    `- [Sitemap](${canonicalUrl(origin, "/sitemap.xml")}) — 색인 가능한 전체 URL`,
    `- [RSS](${canonicalUrl(origin, "/rss.xml")}) — 갱신순 피드`,
    `- [에이전트 스킬 발견 인덱스](${canonicalUrl(origin, AGENT_SKILLS_INDEX_PATH)}) — use-design-md 스킬 파일과 그 SHA-256 다이제스트`,
    "",
  ].join("\n")
}

export function buildRobotsTxt(siteUrl: string): string {
  const origin = normalizeSiteUrl(siteUrl)
  return [
    "# https://www.robotstxt.org/robotstxt.html",
    "User-agent: *",
    "Disallow:",
    `Sitemap: ${canonicalUrl(origin, "/sitemap.xml")}`,
    "",
  ].join("\n")
}

export function siteUrlFromRequest(siteUrl: string, request: Request): string {
  return siteUrl || new URL(request.url).origin
}
