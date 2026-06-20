import { createFileRoute } from "@tanstack/react-router"
import { getAllServices } from "@/lib/content-collection"
import { SITE_URL } from "@/lib/site-config"
import { buildRssXml, siteUrlFromRequest } from "@/lib/seo-feed"

const RSS_HEADERS = {
  "content-type": "application/rss+xml; charset=utf-8",
  "cache-control": "public, max-age=0, s-maxage=3600",
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
