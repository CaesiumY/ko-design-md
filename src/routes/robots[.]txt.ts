import { createFileRoute } from "@tanstack/react-router"
import { SITE_URL } from "@/lib/site-config"
import { buildRobotsTxt, siteUrlFromRequest } from "@/lib/seo-feed"

const TEXT_HEADERS = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "public, max-age=0, s-maxage=3600",
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
