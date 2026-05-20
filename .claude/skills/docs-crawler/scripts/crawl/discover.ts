// URL discovery: sitemap.xml first, same-origin link BFS as fallback.

import { XMLParser } from "fast-xml-parser"
import type { CrawlOptions } from "./types"

export interface SitemapParseResult {
  kind: "index" | "urlset"
  locs: Array<string>
}

// Asset extensions a docs crawl should never treat as content pages.
const NON_HTML =
  /\.(png|jpe?g|gif|svg|webp|avif|ico|pdf|zip|gz|tar|css|js|mjs|cjs|json|xml|txt|csv|woff2?|ttf|otf|eot|mp4|webm|mov|mp3|wav)$/i

function toArray(value: unknown): Array<unknown> {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

function extractLocs(node: unknown, childKey: string): Array<string> {
  if (typeof node !== "object" || node === null) return []
  const children = toArray((node as Record<string, unknown>)[childKey])
  const locs: Array<string> = []
  for (const child of children) {
    if (typeof child === "object" && child !== null) {
      const loc = (child as Record<string, unknown>).loc
      if (typeof loc === "string" && loc.trim()) locs.push(loc.trim())
    } else if (typeof child === "string" && child.trim()) {
      locs.push(child.trim())
    }
  }
  return locs
}

/**
 * Parse a sitemap document. Handles both `<urlset>` (a page list) and
 * `<sitemapindex>` (a list of nested sitemaps the caller should recurse into).
 */
export function parseSitemapXml(xml: string): SitemapParseResult {
  const parser = new XMLParser({
    ignoreAttributes: true,
    trimValues: true,
    removeNSPrefix: true,
  })
  let doc: unknown
  try {
    doc = parser.parse(xml)
  } catch {
    return { kind: "urlset", locs: [] }
  }
  if (typeof doc !== "object" || doc === null) {
    return { kind: "urlset", locs: [] }
  }
  const root = doc as Record<string, unknown>
  if (root.sitemapindex) {
    return { kind: "index", locs: extractLocs(root.sitemapindex, "sitemap") }
  }
  return { kind: "urlset", locs: extractLocs(root.urlset, "url") }
}

/**
 * Extract resolvable `href` targets from raw HTML. Handles both quoted
 * (`href="..."`) and unquoted (`href=/path`) attribute values; pure-fragment
 * links (`href="#..."`) are skipped and everything else is resolved against
 * `baseUrl`.
 */
export function extractLinks(html: string, baseUrl: string): Array<string> {
  const links: Array<string> = []
  const pattern = /href\s*=\s*(?:["']([^"'#][^"']*)["']|([^"'#\s>]+))/gi
  for (const match of html.matchAll(pattern)) {
    const href = match[1] ?? match[2]
    if (!href) continue
    try {
      const resolved = new URL(href, baseUrl)
      resolved.hash = ""
      links.push(resolved.toString())
    } catch {
      // Unresolvable href — skip.
    }
  }
  return links
}

/**
 * Keep only crawlable same-origin HTML URLs: drops cross-origin links,
 * asset files, and duplicates, and enforces the page cap.
 */
export function filterUrls(
  urls: Array<string>,
  origin: string,
  maxPages: number,
): Array<string> {
  const seen = new Set<string>()
  const result: Array<string> = []
  for (const raw of urls) {
    let parsed: URL
    try {
      parsed = new URL(raw)
    } catch {
      continue
    }
    if (parsed.origin !== origin) continue
    if (NON_HTML.test(parsed.pathname)) continue
    parsed.hash = ""
    const normalized = parsed.toString()
    if (seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalized)
    if (result.length >= maxPages) break
  }
  return result
}

async function fetchText(url: string, userAgent: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": userAgent },
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

async function collectSitemapUrls(
  origin: string,
  userAgent: string,
): Promise<Array<string>> {
  const rootXml = await fetchText(`${origin}/sitemap.xml`, userAgent)
  if (!rootXml) return []
  const parsed = parseSitemapXml(rootXml)
  if (parsed.kind === "urlset") return parsed.locs
  // Sitemap index — fetch nested sitemaps (bounded to keep discovery cheap).
  const collected: Array<string> = []
  for (const childUrl of parsed.locs.slice(0, 20)) {
    const childXml = await fetchText(childUrl, userAgent)
    if (childXml) collected.push(...parseSitemapXml(childXml).locs)
  }
  return collected
}

async function bfsDiscover(
  rootUrl: string,
  origin: string,
  opts: CrawlOptions,
): Promise<Array<string>> {
  const visited = new Set<string>()
  const queued = new Set<string>([rootUrl])
  const queue: Array<string> = [rootUrl]
  const found: Array<string> = []
  while (queue.length > 0 && found.length < opts.maxPages) {
    const current = queue.shift()
    if (current === undefined || visited.has(current)) continue
    visited.add(current)
    // Skip non-HTML assets (images, PDFs, ...) that links pulled into the queue.
    try {
      if (NON_HTML.test(new URL(current).pathname)) continue
    } catch {
      continue
    }
    found.push(current)
    const html = await fetchText(current, opts.userAgent)
    if (!html) continue
    for (const link of extractLinks(html, current)) {
      try {
        if (
          new URL(link).origin === origin &&
          !visited.has(link) &&
          !queued.has(link)
        ) {
          queued.add(link)
          queue.push(link)
        }
      } catch {
        // skip
      }
    }
  }
  return found
}

/**
 * Discover crawlable pages for a docs site. Prefers `sitemap.xml`; falls back
 * to a same-origin link BFS when no usable sitemap exists.
 */
export async function discoverUrls(
  rootUrl: string,
  opts: CrawlOptions,
): Promise<Array<string>> {
  const origin = new URL(rootUrl).origin
  const fromSitemap = await collectSitemapUrls(origin, opts.userAgent)
  if (fromSitemap.length > 0) {
    return filterUrls(fromSitemap, origin, opts.maxPages)
  }
  const fromLinks = await bfsDiscover(rootUrl, origin, opts)
  return filterUrls(fromLinks, origin, opts.maxPages)
}
