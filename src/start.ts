import { createMiddleware, createStart } from "@tanstack/react-start"
import { agentResponse, applyAcceptVary } from "@/lib/agent-representation"

/**
 * Content negotiation for agents, plus the `Vary` header that makes it cacheable.
 *
 * TanStack Start's server handler has its own content-negotiation guard. Since
 * `@tanstack/start-server-core` 1.169.37 it returns 406 when a request accepts
 * neither HTML nor the full wildcard, but that framework response cannot serve
 * this app's Markdown representation or its route-specific 404/406 recovery
 * bodies. Older releases returned 500 for the same case; production measured
 * that response on 2026-09-12 for `/` and `/services/{slug}`.
 *
 * A global request middleware runs before the terminal router handler, so this
 * middleware can answer those requests with a bare `Response`. The response
 * mutation below deliberately keeps the original object: `createStartHandler`
 * uses its `serverSsrCleanup` marker to finish streamed SSR responses.
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
