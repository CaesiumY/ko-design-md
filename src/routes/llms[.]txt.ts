import { createFileRoute } from "@tanstack/react-router"
import { AGENT_TEXT_HEADERS } from "@/lib/agent-representation"
import { getAllServices } from "@/lib/content-collection"
import { SITE_URL } from "@/lib/site-config"
import { buildLlmsTxt, siteUrlFromRequest } from "@/lib/seo-feed"

// Same terms as every other endpoint an agent fetches directly: the shared
// constant carries the cache policy and the open CORS this route already had.
const TEXT_HEADERS = {
  "content-type": "text/plain; charset=utf-8",
  ...AGENT_TEXT_HEADERS,
}

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        return new Response(
          buildLlmsTxt({
            siteUrl: siteUrlFromRequest(SITE_URL, request),
            services: getAllServices(),
          }),
          { headers: TEXT_HEADERS }
        )
      },
    },
  },
})
