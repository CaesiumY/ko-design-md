import { buildLlmsTxt, siteUrlFromRequest } from "./seo-feed"
import { SITE_URL } from "./site-config"
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

function acceptTokens(accept: string | null): Array<string> {
  // Absent Accept means "anything" per RFC 9110, which is the browser case.
  return (accept ?? "*/*").split(",").map((part) => part.trim().toLowerCase())
}

/** True when the client will take HTML — i.e. leave SSR alone. */
export function acceptsHtml(accept: string | null): boolean {
  return acceptTokens(accept).some(
    (token) => token.startsWith("*/*") || token.startsWith("text/html")
  )
}

/** True when the client asked for markdown (or plain text) and NOT for HTML. */
export function prefersMarkdown(accept: string | null): boolean {
  if (acceptsHtml(accept)) return false
  return acceptTokens(accept).some((token) =>
    MARKDOWN_TYPES.some((type) => token.startsWith(type))
  )
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
  ].join("\n")
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
  const match = /^\/services\/([^/]+)\/?$/.exec(pathname)
  if (!match) return undefined
  return getServiceBySlug(decodeURIComponent(match[1]))?.raw
}

/**
 * Paths the router (or the static handler) answers on its own.
 *
 * Every machine endpoint in this repo is a file route with an extension —
 * `/llms.txt`, `/sitemap.xml`, `/rss.xml`, `/services/{slug}/DESIGN.md` — and so
 * is every asset under `/assets`, `/logos`, `/og` and `/preview`. Page routes
 * are extensionless. So "last segment contains a dot" separates the two without
 * a hand-maintained list that would go stale the next time someone adds an
 * endpoint. `agent-representation.test.ts` pins this against the actual route
 * files.
 */
function hasFileExtension(pathname: string): boolean {
  const lastSegment = pathname.replace(/\/+$/, "").split("/").pop() ?? ""
  return lastSegment.includes(".")
}

/**
 * Answer a non-HTML request, or `undefined` to let the router handle it.
 *
 * Returning `undefined` matters as much as returning a Response: paths that
 * already have their own `server.handlers` are resolved before SSR runs and
 * already answer markdown requests correctly (verified on production:
 * `Accept: text/markdown` against `/llms.txt` returns 200). Intercepting those
 * would replace a working endpoint with a guess.
 *
 * What is left — the extensionless paths — is exactly the set the SSR handler
 * would otherwise reject with a hardcoded HTTP 500, so every one of them gets
 * an answer here: the page's markdown representation, or a 404 that says where
 * to look instead.
 */
export function agentResponse(request: Request): Response | undefined {
  if (request.method !== "GET" && request.method !== "HEAD") return undefined
  if (!prefersMarkdown(request.headers.get("Accept"))) return undefined

  const pathname = new URL(request.url).pathname
  if (hasFileExtension(pathname)) return undefined

  const origin = siteUrlFromRequest(SITE_URL, request)
  const body = markdownRepresentation(pathname, origin)
  if (body !== undefined) {
    return new Response(body, { headers: MARKDOWN_HEADERS })
  }
  return new Response(notFoundMarkdown(origin, pathname), {
    status: 404,
    headers: MARKDOWN_HEADERS,
  })
}
