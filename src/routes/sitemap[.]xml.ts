import { createFileRoute } from "@tanstack/react-router"
import { AGENT_CACHE_CONTROL } from "@/lib/agent-representation"
import { getAllServices } from "@/lib/content-collection"
import { SITE_URL } from "@/lib/site-config"
import { buildSitemapXml, siteUrlFromRequest } from "@/lib/seo-feed"

// Cache policy from the shared constant; no CORS header, because this one is
// read by server-side crawlers and readers, not by a browser page.
const XML_HEADERS = {
  "content-type": "application/xml; charset=utf-8",
  "cache-control": AGENT_CACHE_CONTROL,
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        return new Response(
          buildSitemapXml({
            siteUrl: siteUrlFromRequest(SITE_URL, request),
            services: getAllServices(),
          }),
          { headers: XML_HEADERS }
        )
      },
    },
  },
})
