import { createFileRoute } from "@tanstack/react-router"
import { getAllServices } from "@/lib/content-collection"
import { SITE_URL } from "@/lib/site-config"
import { buildSitemapXml, siteUrlFromRequest } from "@/lib/seo-feed"

const XML_HEADERS = {
  "content-type": "application/xml; charset=utf-8",
  "cache-control": "public, max-age=0, s-maxage=3600",
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
