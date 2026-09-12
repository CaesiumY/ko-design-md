import { createFileRoute } from "@tanstack/react-router"
import { AGENT_CACHE_CONTROL } from "@/lib/agent-representation"
import { SITE_URL } from "@/lib/site-config"
import { buildRobotsTxt, siteUrlFromRequest } from "@/lib/seo-feed"

// Cache policy from the shared constant; no CORS header, because this one is
// read by server-side crawlers and readers, not by a browser page.
const TEXT_HEADERS = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": AGENT_CACHE_CONTROL,
}

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        return new Response(
          buildRobotsTxt(siteUrlFromRequest(SITE_URL, request)),
          { headers: TEXT_HEADERS }
        )
      },
    },
  },
})
