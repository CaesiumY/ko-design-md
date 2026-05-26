import { createFileRoute } from "@tanstack/react-router"
import { getServiceBySlug } from "@/lib/content-collection"

const TEXT_HEADERS = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "public, max-age=0, s-maxage=3600",
  // Public catalog content already accessible as HTML. Open CORS so
  // client-side agents (browser extensions, custom GPTs, web-based IDEs)
  // can fetch this URL without proxying.
  "access-control-allow-origin": "*",
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
