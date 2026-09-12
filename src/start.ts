import { createMiddleware, createStart } from "@tanstack/react-start"
import {
  agentResponse,
  isHandledElsewhere,
  normalizePathname,
} from "@/lib/agent-representation"

/**
 * Content negotiation for agents, plus the `Vary` header that makes it cacheable.
 *
 * WHY THIS FILE EXISTS. `@tanstack/start-server-core`'s `executeRouter` opens with
 * a hardcoded rejection (createStartHandler.js, v1.170.x):
 *
 *   const acceptParts = (request.headers.get("Accept") || "*\/*").split(",")
 *   if (!["*\/*","text/html"].some(m => acceptParts.some(p => p.trim().startsWith(m))))
 *     return normalizeSsrResponse(Response.json(
 *       { error: "Only HTML requests are supported here" }, { status: 500 }))
 *
 * So before this middleware, EVERY server-rendered URL answered `Accept:
 * text/markdown` with an HTTP 500 — measured on production 2026-09-12 for `/`
 * and `/services/{slug}` alike. A 500 is the worst available answer: it tells a
 * crawler the site is broken rather than that it should ask differently.
 *
 * Route code cannot reach that branch. A global request middleware can: the same
 * file composes `[...flattenedRequestMiddlewares, requestHandlerMiddleware]`, so
 * anything registered here runs BEFORE the router, and `RequestMiddlewareServerFnResult`
 * admits a bare `Response`, which short-circuits the chain.
 *
 * Discovery is by convention — `start-plugin-core` resolves the start entry from
 * `defaultEntry: "start"` under `srcDirectory`, the same way `src/router.tsx` is
 * found. There is no registration line to add elsewhere.
 */
const agentContentNegotiation = createMiddleware({ type: "request" }).server(
  async ({ request, next }) => {
    const direct = agentResponse(request)
    if (direct) return direct

    const result = await next()

    // Announce that this URL varies by Accept, but ONLY where it does. Without
    // it a shared cache can hand the stored HTML to an agent that asked for
    // markdown (or the reverse), depending on which variant landed first.
    //
    // The guard is the other half of that. Appended unconditionally, the header
    // also landed on `/llms.txt`, `/sitemap.xml`, `/rss.xml`,
    // `/services/{slug}/llms.txt`, `/services/{slug}/DESIGN.md` and the
    // well-known index - endpoints that answer the same bytes to every Accept,
    // and that ship `s-maxage=3600`. A CDN then keys each of them on the full
    // Accept string, and agents send many distinct ones, so one resource became
    // many cache entries on exactly the endpoints agents hit most.
    // `isHandledElsewhere` is the same predicate that decides whether the
    // negotiation above could have varied the response at all.
    //
    // Headers are mutated in place rather than rebuilding the Response:
    // `createStartHandler` reads `response.serverSsrCleanup === "stream"` off
    // the object it gets back to decide when to tear down the SSR render, so a
    // replacement Response would drop that flag and cut streaming short.
    if (isHandledElsewhere(normalizePathname(new URL(request.url).pathname))) {
      return result
    }
    try {
      // Append only what is missing. Nothing downstream sets `Vary` today, but
      // a framework that starts doing so would otherwise turn this into
      // `Vary: Accept, Accept` - valid HTTP that some caches key on literally,
      // and a confusing thing to find while debugging a cache miss. `Vary: *`
      // already covers every header, so leave that one alone too.
      const existing = result.response.headers.get("Vary") ?? ""
      const covered = existing
        .split(",")
        .map((token) => token.trim().toLowerCase())
        .some((token) => token === "accept" || token === "*")
      if (!covered) result.response.headers.append("Vary", "Accept")
    } catch {
      // Some runtimes hand back an immutable Headers object. Losing a cache
      // hint is not worth losing the response, so this is swallowed - but
      // NOTHING else sets the header, so on such a runtime it is simply
      // missing. There is no `vercel.json` header rule behind this (an earlier
      // draft of this comment claimed one; the file has never existed). If this
      // branch is ever observed, the fix is to add that rule, not to trust this
      // comment. The node-server preset this deploys on allows the append.
    }
    return result
  }
)

export const startInstance = createStart(() => ({
  requestMiddleware: [agentContentNegotiation],
}))
