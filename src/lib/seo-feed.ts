import { truncateForMeta } from "./content-parser"
import type { ServiceDoc } from "./content-types"

const SITE_TITLE = "ko/design.md"
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
      `siteUrl must be an absolute URL, got "${siteUrl || "(empty)"}"`,
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
    ...services.map((doc) =>
      [
        "  <url>",
        `    <loc>${escapeXml(canonicalUrl(origin, `/services/${doc.frontmatter.slug}`))}</loc>`,
        doc.frontmatter.last_updated
          ? `    <lastmod>${escapeXml(doc.frontmatter.last_updated)}</lastmod>`
          : "",
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n"),
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
  const items = services.map((doc) => {
    const itemUrl = canonicalUrl(origin, `/services/${doc.frontmatter.slug}`)
    const updated = doc.frontmatter.last_updated
    const description = truncateForMeta(
      doc.tagline || doc.frontmatter.name,
      500,
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
    `    <title>${escapeXml(SITE_TITLE)}</title>`,
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
