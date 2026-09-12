import { createMiddleware, createStart } from "@tanstack/react-start"
import { agentResponse, applyAcceptVary } from "@/lib/agent-representation"

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

    // Announce that this URL varies by Accept where it does, so a shared cache
    // cannot hand the stored HTML to an agent that asked for markdown (or the
    // reverse). The rules - which paths, no duplicates, surviving immutable
    // headers - live in `applyAcceptVary`, where they are tested.
    //
    // Headers are mutated in place rather than rebuilding the Response:
    // `createStartHandler` reads `response.serverSsrCleanup === "stream"` off
    // the object it gets back to decide when to tear down the SSR render, so a
    // replacement Response would drop that flag and cut streaming short.
    applyAcceptVary(result.response.headers, new URL(request.url).pathname)
    return result
  }
)

export const startInstance = createStart(() => ({
  requestMiddleware: [agentContentNegotiation],
}))
