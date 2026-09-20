import { buildLlmsTxt, siteUrlFromRequest } from "./seo-feed"
import {
  AGENT_SKILLS_INDEX_PATH,
  AGENT_SKILL_MD_PATH,
  SITE_URL,
  STATIC_PAGE_PATHS,
} from "./site-config"
import { getAllServices, getServiceBySlug } from "./content-collection"

/**
 * How long a shared cache may hold a generated endpoint. Every machine endpoint
 * on the site answers on these terms, so the value lives here rather than being
 * retyped per route.
 */
export const AGENT_CACHE_CONTROL = "public, max-age=0, s-maxage=3600"

/**
 * Headers shared by every plain-text endpoint an agent fetches DIRECTLY.
 *
 * CORS is open because the bytes are the same public catalog content already
 * served as HTML — opening it lets browser-side agents (extensions, custom
 * GPTs, web IDEs) fetch without a proxy.
 *
 * Deliberately not applied to `/sitemap.xml`, `/rss.xml` and `/robots.txt`.
 * Those three carry the cache policy above but no CORS header, and that split
 * is meaningful rather than an oversight: CORS only matters to a fetch made
 * from a browser page, and those three are read by server-side crawlers and
 * feed readers. Spreading the constant over them to make the code look uniform
 * would widen CORS on three endpoints as a side effect of a refactor.
 */
export const AGENT_TEXT_HEADERS = {
  "cache-control": AGENT_CACHE_CONTROL,
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

/**
 * Cache terms for a negative answer - a 404 or 406. Why a shared cache must not
 * hold one is spelled out on `ERROR_MARKDOWN_HEADERS` below; every error body
 * an agent can fetch uses this value, so the reason and the value stay together.
 */
export const AGENT_ERROR_CACHE_CONTROL = "public, max-age=0, must-revalidate"

/**
 * Same representation, but nothing a shared cache should hold on to.
 *
 * A 404 or 406 answered with `s-maxage=3600` is a negative answer a CDN may
 * keep for an hour, and the answer can go stale while it sits there: the
 * catalog gains entries, and a path that is missing now is a real page later.
 * There is no upside to trade against it - these bodies are a few hundred bytes
 * and the traffic is small - so the conservative header is simply free. It
 * matches what the site already sends for HTML.
 */
export const ERROR_MARKDOWN_HEADERS = {
  ...MARKDOWN_HEADERS,
  "cache-control": AGENT_ERROR_CACHE_CONTROL,
} as const

/**
 * The 404 for a per-entry text endpoint - `/services/{slug}/llms.txt` and
 * `/services/{slug}/DESIGN.md`. A plain body an agent can read, on the error
 * cache terms above.
 *
 * Those two routes used to answer their 404 with the success headers, so a
 * slug requested just before its entry shipped could stay a 404 at the edge
 * for up to an hour after the entry existed - the same stale negative answer
 * `ERROR_MARKDOWN_HEADERS` was introduced to avoid on the negotiated paths.
 */
export function textNotFoundResponse(slug: string): Response {
  return new Response(`Not found: ${slug}\n`, {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": AGENT_ERROR_CACHE_CONTROL,
      "access-control-allow-origin": "*",
    },
  })
}

// Media types that mean "give me the source text, not a rendered page".
// `text/plain` is included because several crawlers ask for it when they want
// something parseable and have no markdown token.
const MARKDOWN_TYPES = ["text/markdown", "text/x-markdown", "text/plain"]
// The type the server-rendered page is actually sent as - and only that one.
// This used to list `application/xhtml+xml` too, which the site never serves.
// Once media ranges are resolved by specificity, that extra entry undid the
// refusal it was meant to respect: `text/html;q=0` plus the full wildcard left
// xhtml acceptable through the wildcard, so the request still counted as
// taking HTML and was handed the page it had just ruled out.
const HTML_TYPES = ["text/html"]

// The one charset every body on this site is sent in.
const SERVED_CHARSET = "utf-8"

interface AcceptEntry {
  type: string
  // The `charset` parameter, if the range names one. It is the only media-range
  // parameter kept: every representation here goes out as UTF-8, so it is the
  // only one this module can actually evaluate. Anything else (`variant=GFM`
  // on text/markdown, say) says nothing this site can honour or refuse, and
  // treating it as a mismatch would turn ordinary markdown requests into 406s.
  charset: string | undefined
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
  // A present-but-empty Accept is read as absent, i.e. "anything". RFC 9110
  // only defines the absent case (§12.5.1); an empty list could be argued to
  // mean "nothing acceptable". It is treated like absence to match what
  // TanStack does on the path this middleware falls through to -
  // `headers.get("Accept") || "*/*"` takes "" as the wildcard - so an empty
  // header gets HTML either way instead of a 406 here and HTML one hop later.
  if (!raw) return [{ type: "*/*", charset: undefined, q: 1 }]
  return raw.split(",").map((part) => {
    const [mediaRange, ...params] = part.trim().split(";")
    const lowered = params.map((param) => param.trim().toLowerCase())
    const qParam = lowered.find((param) => param.startsWith("q="))
    const charsetParam = lowered.find((param) => param.startsWith("charset="))
    // An unparseable q counts as 1, not 0: a malformed parameter should not
    // silently turn acceptance into refusal. The empty case needs its own
    // branch because `Number("")` is 0 - finite, so an isFinite guard alone
    // lets `q=` through as a refusal and answers 406 to a client that only
    // sent a malformed parameter.
    const rawQ = qParam === undefined ? "" : qParam.slice(2).trim()
    const parsed = rawQ === "" ? 1 : Number(rawQ)
    return {
      type: mediaRange.trim().toLowerCase(),
      charset:
        charsetParam === undefined
          ? undefined
          : charsetParam.slice("charset=".length).trim().replace(/^"|"$/g, ""),
      q: Number.isFinite(parsed) ? parsed : 1,
    }
  })
}

function rangeMatches(entry: AcceptEntry, candidate: string): boolean {
  // A range that names a charset covers the representation only if it is the
  // one this site sends. `text/plain;charset=iso-8859-1` does not accept a
  // UTF-8 plain-text body - reading it as if it did labelled that body
  // `text/plain` for a client that ranked a representation it could take lower.
  if (entry.charset !== undefined && entry.charset !== SERVED_CHARSET) {
    return false
  }
  const range = entry.type
  if (range === "*/*") return true
  if (range === candidate) return true
  // `text/*` covers both text/html and text/markdown.
  if (range.endsWith("/*")) return candidate.startsWith(range.slice(0, -1))
  return false
}

// How specific a media range is. An exact type outranks a `type/` wildcard,
// which outranks the full wildcard, and a range with a charset outranks the
// same range without one (RFC 9110 12.5.1 ranks `text/plain;format=flowed`
// above `text/plain` the same way).
function specificity(entry: AcceptEntry): number {
  const base = entry.type === "*/*" ? 0 : entry.type.endsWith("/*") ? 1 : 2
  return base * 2 + (entry.charset === undefined ? 0 : 1)
}

// The quality a client assigns to one concrete type: the q of the MOST
// SPECIFIC range that matches it, per RFC 9110 12.5.1, or 0 when none does.
//
// Reading every matching range on its own lets a broad acceptance override a
// narrow refusal - `text/html;q=0` next to the full wildcard would still count
// as accepting HTML, and a client that had just ruled HTML out would be sent
// it. Equally specific ranges (a type repeated in one header) resolve to the
// highest of their values.
function qualityFor(entries: Array<AcceptEntry>, candidate: string): number {
  let rank = -1
  let quality = 0
  for (const entry of entries) {
    if (!rangeMatches(entry, candidate)) continue
    const entryRank = specificity(entry)
    if (entryRank > rank) {
      rank = entryRank
      quality = entry.q
    } else if (entryRank === rank) {
      quality = Math.max(quality, entry.q)
    }
  }
  return quality
}

function accepts(accept: string | null, candidates: Array<string>): boolean {
  const entries = parseAccept(accept)
  return candidates.some((candidate) => qualityFor(entries, candidate) > 0)
}

/** True when the client will take HTML — i.e. leave SSR alone. */
export function acceptsHtml(accept: string | null): boolean {
  return accepts(accept, HTML_TYPES)
}

// True when the client NAMED html: a `text/html` or `text/*` range, as opposed
// to the full wildcard range. (Spelling that range inside a block comment would
// close the comment, which is why this one is a line comment — see the note
// above `agentResponse` for the same hazard.)
//
// A browser always names it; the header a person's page request carries lists
// `text/html` first. `curl`, a crawler and an agent with no Accept header send
// the full wildcard or nothing at all, which `parseAccept` normalises to the
// same thing: "anything you have". That is not a request for a page, and on a
// path with no page to render it is the difference between a rendered 404 shell
// and the recovery body an agent can act on (#349).
//
// A refusal still wins, as everywhere else here: a header that names
// `text/html;q=0` beside the wildcard makes this false, and the markdown
// branches take over.
function namesHtml(accept: string | null): boolean {
  const named = parseAccept(accept).filter((entry) => entry.type !== "*/*")
  return HTML_TYPES.some((candidate) => qualityFor(named, candidate) > 0)
}

/**
 * True when the client asked for markdown (or plain text) and NOT for HTML.
 *
 * Deliberately not a full RFC 9110 weighting: any HTML the client will take at
 * all wins, even when markdown is ranked higher (`text/markdown;q=1,
 * text/html;q=0.2` still gets HTML). The two error directions are not
 * symmetric. Serving markdown to a browser that would have rendered the page is
 * a visible break for a person; serving HTML to an agent that ranked markdown
 * first costs it one retry with a narrower Accept - and `q=0`, the only way to
 * say "I cannot use HTML", is honoured exactly. Ranking is a preference;
 * `q=0` is a capability, and only the second one is load-bearing here.
 */
export function prefersMarkdown(accept: string | null): boolean {
  if (acceptsHtml(accept)) return false
  return accepts(accept, MARKDOWN_TYPES)
}

/**
 * The type to label a markdown body with: whichever of `MARKDOWN_TYPES` the
 * client ranks highest, ties going to that list's order.
 *
 * `prefersMarkdown` only decides "send the source text", and it is true for
 * `text/markdown;q=0, text/plain` because `text/plain` is acceptable. Labelling
 * that body `text/markdown` handed the client the one type it had just refused.
 * When none of the three is acceptable - a 406 for `application/json` - the body
 * is still markdown, so that is what it is called.
 */
export function markdownMediaType(accept: string | null): string {
  const entries = parseAccept(accept)
  let best = "text/markdown"
  let bestQuality = 0
  for (const candidate of MARKDOWN_TYPES) {
    const quality = qualityFor(entries, candidate)
    if (quality > bestQuality) {
      best = candidate
      bestQuality = quality
    }
  }
  return best
}

/** An exact path as a pattern, with every regex metacharacter neutralised. */
function exactPath(path: string): RegExp {
  return new RegExp(`^${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`)
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
 *
 * The two `/.well-known/agent-skills/` routes are new with this module, so no
 * earlier measurement covered them. Measured 2026-09-13 on the production
 * node-server output: `index.json` and `SKILL.md` both answer 200 with their
 * own content type for `application/json`, `text/markdown`, `text/html`, a
 * browser Accept and no Accept at all - the route handler answers before the
 * SSR rejection is reached, the same as for the older four.
 */
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

// Build output and catalog assets. `/_` is deliberately broad: it covers the
// runtime paths neither this repo nor the build names explicitly (`/_vercel/`
// for analytics, whatever the adapter mounts), and no page can collide with it
// - TanStack reads a leading `_` in a route file as a PATHLESS layout, so the
// convention cannot produce a top-level `/_…` URL in the first place.
//
// It also covers TanStack Start's server-function RPC, mounted at `/_serverFn/`
// (the framework default - checked in @tanstack/start-* on 2026-09-13; this
// repo sets no router basepath or custom base). Those calls send non-HTML
// Accept values, so without this prefix the module would answer them with a
// 404 or 406. The app defines no server functions yet; setting a router
// basepath would move that mount and needs this list revisited.
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

/**
 * Drop trailing slashes, so `/about/` and `/about` decide the same way.
 *
 * Without this the three path families answered a trailing-slash URL three
 * different ways: `/services/toss/` returned 200 (the slug pattern absorbed the
 * slash), `/about/` returned a markdown 404 claiming the page does not exist,
 * and the HTML router redirected both to the canonical form. The 404 was the
 * damaging one - `notAcceptableMarkdown` exists precisely because telling an
 * agent that a real page is missing stops it asking again.
 *
 * All of them, not one: the router answers `/about//` with the same redirect it
 * gives `/about/`, so stripping a single slash left the identical mismatch one
 * level deeper. The root keeps its slash.
 *
 * And anywhere in the path, not only at the end. Measured on the production
 * build: the HTML router redirects `/services//toss` to `/services/toss`
 * (307), while this module answered it with a markdown 404 claiming no such
 * page exists - the same false "not found", in a third shape. A leading `//`
 * never gets here: the server layer redirects it (308) for every Accept.
 */
export function normalizePathname(pathname: string): string {
  const collapsed = pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "")
  return collapsed === "" ? "/" : collapsed
}

function serviceSlug(pathname: string): string | undefined {
  const match = /^\/services\/([^/]+)$/.exec(pathname)
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
    "Entry paths are `/services/{slug}`. An entry's DESIGN.md is served verbatim at",
    "`/services/{slug}/llms.txt`, and its standard DESIGN.md (reshaped for tools that",
    "only know the DESIGN.md spec) is at `/services/{slug}/DESIGN.md`.",
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
  // HEAD answers with the same status and headers as GET, and the body built
  // below is discarded by the runtime. Measured 2026-09-13 over raw sockets:
  // on the node-server preview every HEAD (200, 404, 406) delivered 0 body
  // bytes while the matching GET delivered 10,057; on production (Vercel), HEAD
  // to /, /llms.txt, /services/toss/llms.txt and /sitemap.xml delivered 0 bytes
  // against 8,013 and 2,191,182 for GET. The production check exercised the
  // runtime's stripping on routes already deployed, not this function, which
  // was not live yet. Branching on the method here would add a code path with
  // no difference on the wire.
  if (request.method !== "GET" && request.method !== "HEAD") return undefined

  const accept = request.headers.get("Accept")
  if (namesHtml(accept)) return undefined

  const pathname = normalizePathname(new URL(request.url).pathname)
  if (isHandledElsewhere(pathname)) return undefined

  // A wildcard client takes html without having asked for it. Where a page
  // exists, rendering it is still the better answer — the html IS what `*/*`
  // accepts, and an agent that wanted the source can ask again by name. Only a
  // path with no page falls through, to the 404 below.
  if (acceptsHtml(accept) && pageExists(pathname)) return undefined

  const origin = siteUrlFromRequest(SITE_URL, request)
  const contentType = `${markdownMediaType(accept)}; charset=utf-8`

  if (prefersMarkdown(accept)) {
    const body = markdownRepresentation(pathname, origin)
    if (body !== undefined) {
      return new Response(body, {
        headers: { ...MARKDOWN_HEADERS, "content-type": contentType },
      })
    }
  }

  // Either the client wants a type this site does not publish at all
  // (`application/json`), or it wants markdown for a page that exists only as
  // HTML (`/about`). Both are 406 when the page is real, 404 when it is not.
  return pageExists(pathname)
    ? new Response(notAcceptableMarkdown(origin, pathname), {
        status: 406,
        headers: { ...ERROR_MARKDOWN_HEADERS, "content-type": contentType },
      })
    : new Response(notFoundMarkdown(origin, pathname), {
        status: 404,
        headers: { ...ERROR_MARKDOWN_HEADERS, "content-type": contentType },
      })
}

// Set once the immutable-Headers branch below has been reported, so a runtime
// that always hands back immutable headers logs the problem one time rather
// than on every request.
let reportedImmutableVary = false

/**
 * Mark a response as varying by Accept, on exactly the paths where the
 * negotiation in this module could have produced a different body.
 *
 * Extracted from the request middleware so the rules are testable without the
 * framework: `src/start.ts` only hands over the response headers. The shape it
 * reads them from (`next()` -> `.response.headers`) is typed by TanStack's
 * `RequestServerResult`, so a framework change to that shape is a type error,
 * not a silent skip.
 */
export function applyAcceptVary(headers: Headers, pathname: string): void {
  // Paths answered elsewhere return the same bytes to every Accept, and they
  // ship `s-maxage=3600`. Tagging them would make a CDN key each one on the
  // full Accept string - one resource, many cache entries, on exactly the
  // endpoints agents hit most.
  if (isHandledElsewhere(normalizePathname(pathname))) return
  try {
    // Append only what is missing: a framework that starts setting Vary itself
    // would otherwise turn this into `Vary: Accept, Accept`. A bare `*` already
    // covers every header.
    const covered = (headers.get("Vary") ?? "")
      .split(",")
      .map((token) => token.trim().toLowerCase())
      .some((token) => token === "accept" || token === "*")
    if (!covered) headers.append("Vary", "Accept")
  } catch (error) {
    // Immutable Headers (a runtime that freezes the response, or a redirect
    // Response). Losing a cache hint is not worth losing the response, so this
    // does not rethrow - but nothing else sets the header, so it would simply be
    // missing. Report it once per server instance: the flag is module state, so
    // a long-lived server logs a single time and a serverless runtime logs again
    // on each cold start. Either way it stays bounded, and it is reported in
    // production too - the case worth catching is the one that happens there.
    if (!reportedImmutableVary) {
      reportedImmutableVary = true
      console.warn(
        "[agent-representation] could not set Vary: Accept - response headers are immutable on this runtime; shared caches may serve the wrong representation.",
        error
      )
    }
  }
}
