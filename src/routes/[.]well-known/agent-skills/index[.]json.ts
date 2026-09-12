import { createFileRoute } from "@tanstack/react-router"
import { buildAgentSkillsIndex } from "@/lib/agent-skill-index"
import { AGENT_TEXT_HEADERS } from "@/lib/agent-representation"
import { SITE_URL } from "@/lib/site-config"
import { siteUrlFromRequest } from "@/lib/seo-feed"

// Well-known discovery for the `use-design-md` skill, which is otherwise
// reachable only if you already know about skills.sh or the plugin
// marketplace. An agent holding just the domain finds it here. The document
// follows a published implementation, not a standard - see
// `buildAgentSkillsIndex`.
export const Route = createFileRoute("/.well-known/agent-skills/index.json")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = siteUrlFromRequest(SITE_URL, request)
        return new Response(await buildAgentSkillsIndex(origin), {
          headers: {
            "content-type": "application/json; charset=utf-8",
            ...AGENT_TEXT_HEADERS,
          },
        })
      },
    },
  },
})
