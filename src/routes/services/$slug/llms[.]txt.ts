import { createFileRoute } from "@tanstack/react-router"
import { getServiceBySlug } from "@/lib/content-collection"
import { AGENT_TEXT_HEADERS } from "@/lib/agent-representation"

// Caching and CORS come from the shared constant - every endpoint an agent
// fetches directly answers on the same terms, and there is one place to change
// them. The content type stays local because it is a per-endpoint decision:
// text/plain renders inline in a browser instead of downloading, the same call
// the sibling DESIGN.md handler makes.
const TEXT_HEADERS = {
  "content-type": "text/plain; charset=utf-8",
  ...AGENT_TEXT_HEADERS,
}

// `throw notFound()` is for React-rendered routes — it bubbles to the
// router's notFoundComponent. For a raw text endpoint that agents fetch
// directly, return a real HTTP 404 with a plain-text body instead.
export const Route = createFileRoute("/services/$slug/llms.txt")({
  server: {
    handlers: {
      GET: ({ params }) => {
        const doc = getServiceBySlug(params.slug)
        if (!doc) {
          return new Response(`Not found: ${params.slug}\n`, {
            status: 404,
            headers: TEXT_HEADERS,
          })
        }
        return new Response(doc.raw, { headers: TEXT_HEADERS })
      },
    },
  },
})
