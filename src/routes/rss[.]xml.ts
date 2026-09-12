import { createFileRoute } from "@tanstack/react-router"
import { AGENT_CACHE_CONTROL } from "@/lib/agent-representation"
import { getAllServices } from "@/lib/content-collection"
import { SITE_URL } from "@/lib/site-config"
import { buildRssXml, siteUrlFromRequest } from "@/lib/seo-feed"

// Cache policy from the shared constant; no CORS header, because this one is
// read by server-side crawlers and readers, not by a browser page.
const RSS_HEADERS = {
  "content-type": "application/rss+xml; charset=utf-8",
  "cache-control": AGENT_CACHE_CONTROL,
}

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        return new Response(
          buildRssXml({
            siteUrl: siteUrlFromRequest(SITE_URL, request),
            services: getAllServices(),
          }),
          { headers: RSS_HEADERS }
        )
      },
    },
  },
})
