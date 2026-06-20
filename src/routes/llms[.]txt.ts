import { createFileRoute } from "@tanstack/react-router"
import { getAllServices } from "@/lib/content-collection"
import { SITE_URL } from "@/lib/site-config"
import { buildLlmsTxt, siteUrlFromRequest } from "@/lib/seo-feed"

const TEXT_HEADERS = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "public, max-age=0, s-maxage=3600",
  // Open CORS so client-side agents (browser extensions, custom GPTs, web IDEs)
  // can fetch the catalog index directly — matches the per-entry llms.txt route.
  "access-control-allow-origin": "*",
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
