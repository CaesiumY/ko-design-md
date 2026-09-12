import { buildLlmsTxt, siteUrlFromRequest } from "./seo-feed"
import {
  AGENT_SKILLS_INDEX_PATH,
  AGENT_SKILL_MD_PATH,
  SITE_URL,
  STATIC_PAGE_PATHS,
} from "./site-config"
import { getAllServices, getServiceBySlug } from "./content-collection"

/**
 * Headers shared by every plain-text endpoint an agent fetches directly.
 *
 * CORS is open because the bytes are the same public catalog content already
 * served as HTML — opening it lets browser-side agents (extensions, custom
 * GPTs, web IDEs) fetch without a proxy.
 */
export const AGENT_TEXT_HEADERS = {
  "cache-control": "public, max-age=0, s-maxage=3600",
  "access-control-allow-origin": "*",
} as const

/**
 * `Vary: Accept` is not decoration here. Once a URL answers with HTML for a
 * browser and markdown for an agent, a shared cache that keyed only on the URL
 * would hand whichever variant it stored first to everyone. acceptmarkdown.com
 * (and the Is Agentic check that follows it) treats a missing `Accept` in
 * `Vary` as non-compliant for exactly this reason.
 */
export const MARKDOWN_HEADERS = {
  "content-type": "text/markdown; charset=utf-8",
  vary: "Accept",
  ...AGENT_TEXT_HEADERS,
} as const

// Media types that mean "give me the source text, not a rendered page".
// `text/plain` is included because several crawlers ask for it when they want
// something parseable and have no markdown token.
const MARKDOWN_TYPES = ["text/markdown", "text/x-markdown", "text/plain"]
const HTML_TYPES = ["text/html", "application/xhtml+xml"]

interface AcceptEntry {
  type: string
  q: number
}

/**
 * Parse an Accept header into media ranges with their quality values.
 *
 * The q value is the half a prefix scan misses: `text/html;q=0` is an explicit
 * REFUSAL of HTML, not a request for it (RFC 9110 §12.4.2 — "a value of 0 means
 * not acceptable"). Reading it as acceptance handed HTML to a client that had
 * just said it could not use it.
 */
function parseAccept(accept: string | null): Array<AcceptEntry> {
  const raw = (accept ?? "").trim()
  if (!raw) return [{ type: "*/*", q: 1 }]
  return raw.split(",").map((part) => {
    const [mediaRange, ...params] = part.trim().split(";")
    const qParam = params
      .map((param) => param.trim().toLowerCase())
      .find((param) => param.startsWith("q="))
    const parsed = qParam === undefined ? 1 : Number(qParam.slice(2))
    return {
      type: mediaRange.trim().toLowerCase(),
      // An unparseable q counts as 1, not 0: a malformed parameter should not
      // silently turn acceptance into refusal.
      q: Number.isFinite(parsed) ? parsed : 1,
    }
  })
}

function rangeMatches(range: string, candidate: string): boolean {
  if (range === "*/*") return true
  if (range === candidate) return true
  // `text/*` covers both text/html and text/markdown.
  if (range.endsWith("/*")) return candidate.startsWith(range.slice(0, -1))
  return false
}

function accepts(accept: string | null, candidates: Array<string>): boolean {
  return parseAccept(accept).some(
    (entry) =>
      entry.q > 0 &&
      candidates.some((candidate) => rangeMatches(entry.type, candidate))
  )
}

/** True when the client will take HTML — i.e. leave SSR alone. */
export function acceptsHtml(accept: string | null): boolean {
  return accepts(accept, HTML_TYPES)
}

/** True when the client asked for markdown (or plain text) and NOT for HTML. */
export function prefersMarkdown(accept: string | null): boolean {
  if (acceptsHtml(accept)) return false
  return accepts(accept, MARKDOWN_TYPES)
}

/**
 * Paths resolved before SSR ever runs — route handlers and static files — which
 * already answer any Accept header correctly. Answering them here would replace
 * a working endpoint with a guess.
 *
 * Spelled out rather than inferred from "the last segment has a dot". That
 * shortcut also swallowed paths that do NOT exist (`/missing.html`, or a typo
 * like `/services/toss/llms.tx`), handing them back to the SSR handler that
 * rejects non-HTML Accept with a hardcoded 500 — recreating the failure this
 * module exists to remove. `agent-representation.test.ts` walks the route files
 * and `public/` so neither list can drift.
 */
/** An exact path as a pattern, with every regex metacharacter neutralised. */
function exactPath(path: string): RegExp {
  return new RegExp(`^${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`)
}

const MACHINE_ENDPOINTS: ReadonlyArray<RegExp> = [
  /^\/llms\.txt$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/rss\.xml$/,
  /^\/services\/[^/]+\/llms\.txt$/,
  /^\/services\/[^/]+\/DESIGN\.md$/,
  // Built from the constants the routes and llms.txt already use, so the path
  // is spelled once. The catalog endpoints above stay literal: they carry a
  // `$slug` segment that no constant expresses.
  exactPath(AGENT_SKILLS_INDEX_PATH),
  exactPath(AGENT_SKILL_MD_PATH),
]

// Build output and catalog assets.
const ASSET_PREFIXES = ["/assets/", "/logos/", "/og/", "/preview/", "/_"]

// Files that sit at the root of `public/`.
const PUBLIC_ROOT_FILES: ReadonlySet<string> = new Set([
  "/favicon.ico",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/google7cb8fd67c3ed0481.html",
  "/naverc86157379084630db5f81249341e753f.html",
])

export function isHandledElsewhere(pathname: string): boolean {
  if (PUBLIC_ROOT_FILES.has(pathname)) return true
  if (ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true
  return MACHINE_ENDPOINTS.some((pattern) => pattern.test(pathname))
}

function serviceSlug(pathname: string): string | undefined {
  const match = /^\/services\/([^/]+)\/?$/.exec(pathname)
  if (!match) return undefined
  try {
    return decodeURIComponent(match[1])
  } catch {
    // A malformed escape (`/services/%ZZ`) names a slug that cannot exist, so
    // it is a miss rather than a fault. Unguarded, decodeURIComponent throws
    // URIError out of this function.
    //
    // Measured 2026-09-12, because the guard alone reads like it fixes more
    // than it does: such a request never reaches application code anyway. h3
    // decodes the pathname while constructing its H3Event, so it throws first —
    // vite dev turns that into a 500, the nitro preview server answers nothing
    // at all, and Vercel's edge rejects the URL with 400 before either runs.
    // 400 is the right answer and we do not control it. This guard is here so
    // that the one path we DO own cannot throw, not because production depends
    // on it.
    return undefined
  }
}

/**
 * The markdown representation of a canonical content URL, or undefined when the
 * path has none.
 *
 * `/` answers with the same bytes as `/llms.txt` and `/services/{slug}` with the
 * same bytes as `/services/{slug}/llms.txt`. That duplication is the point:
 * content negotiation is about the CANONICAL url having a machine-readable
 * representation, not about agents having to learn a second URL shape.
 */
export function markdownRepresentation(
  pathname: string,
  origin: string
): string | undefined {
  if (pathname === "/") {
    return buildLlmsTxt({ siteUrl: origin, services: getAllServices() })
  }
  const slug = serviceSlug(pathname)
  return slug === undefined ? undefined : getServiceBySlug(slug)?.raw
}

/** Whether the site renders this path at all, in any representation. */
function pageExists(pathname: string): boolean {
  if (pathname === "/") return true
  if ((STATIC_PAGE_PATHS as ReadonlyArray<string>).includes(pathname)) {
    return true
  }
  const slug = serviceSlug(pathname)
  return slug !== undefined && getServiceBySlug(slug) !== undefined
}

function recoveryLines(origin: string): Array<string> {
  return [
    "## Where to look instead",
    "",
    `- [Catalog index for agents](${origin}/llms.txt) — every entry, with its slug and a one-line description`,
    `- [Sitemap](${origin}/sitemap.xml) — every indexable URL`,
    `- [Catalog home](${origin}/) — the browsable list`,
    "",
    "Entry paths are `/services/{slug}`. The raw design.md for an entry is at",
    "`/services/{slug}/llms.txt`, and the same entry in Google's DESIGN.md format",
    "is at `/services/{slug}/DESIGN.md`.",
    "",
  ]
}

/**
 * The body an agent gets when a path does not resolve.
 *
 * A bare 404 tells an agent it guessed wrong; it does not tell it where to look
 * instead. These three links are the whole recovery surface: the catalog index
 * an agent reads first, the URL list, and the human entry point.
 */
export function notFoundMarkdown(origin: string, pathname: string): string {
  return [
    "# 404 Not Found",
    "",
    `\`${pathname}\` is not a page on this site.`,
    "",
    ...recoveryLines(origin),
  ].join("\n")
}

/**
 * The body for a page that exists but not in a representation the client takes.
 *
 * 406, not 404: saying "not found" about `/about` — a page this site's own
 * llms.txt advertises as agent-discoverable — would be a lie, and an agent that
 * believed it would stop asking. The body names the request that does work.
 */
export function notAcceptableMarkdown(
  origin: string,
  pathname: string
): string {
  return [
    "# 406 Not Acceptable",
    "",
    `\`${pathname}\` exists, but not in a representation matching your Accept header.`,
    "",
    `Retry with \`Accept: text/html\` — the page is served at ${origin}${pathname}.`,
    "",
    "Markdown representations exist for the catalog index (`/`) and for every",
    "entry (`/services/{slug}`).",
    "",
    ...recoveryLines(origin),
  ].join("\n")
}

/**
 * Answer a request the SSR handler would reject, or `undefined` to let the
 * router handle it.
 *
 * The framework's `executeRouter` opens by returning a hardcoded HTTP 500 for
 * any Accept that takes neither `text/html` nor the wildcard range. Everything
 * below exists so that no request reaches that line: once we know the client
 * refuses HTML and the path is not resolved elsewhere, this function always
 * answers.
 *
 * (The wildcard range is spelled out in prose rather than written literally
 * because the closing half of it would end this block comment.)
 *
 * A 500 claims the server is broken. Every case here is a negotiation outcome —
 * the representation exists (200), the page exists in another form (406), or
 * the path does not exist (404) — and none of them is a server fault.
 */
export function agentResponse(request: Request): Response | undefined {
  if (request.method !== "GET" && request.method !== "HEAD") return undefined

  const accept = request.headers.get("Accept")
  if (acceptsHtml(accept)) return undefined

  const pathname = new URL(request.url).pathname
  if (isHandledElsewhere(pathname)) return undefined

  const origin = siteUrlFromRequest(SITE_URL, request)

  if (prefersMarkdown(accept)) {
    const body = markdownRepresentation(pathname, origin)
    if (body !== undefined) {
      return new Response(body, { headers: MARKDOWN_HEADERS })
    }
  }

  // Either the client wants a type this site does not publish at all
  // (`application/json`), or it wants markdown for a page that exists only as
  // HTML (`/about`). Both are 406 when the page is real, 404 when it is not.
  return pageExists(pathname)
    ? new Response(notAcceptableMarkdown(origin, pathname), {
        status: 406,
        headers: MARKDOWN_HEADERS,
      })
    : new Response(notFoundMarkdown(origin, pathname), {
        status: 404,
        headers: MARKDOWN_HEADERS,
      })
}
