import { createFileRoute } from "@tanstack/react-router"
import { agentSkillsIndexResponse } from "@/lib/agent-skill-index"
import { SITE_URL } from "@/lib/site-config"
import { siteUrlFromRequest } from "@/lib/seo-feed"

// Well-known discovery for the `use-design-md` skill, which is otherwise
// reachable only if you already know about skills.sh or the plugin
// marketplace. An agent holding just the domain finds it here. The document
// follows a published implementation, not a standard - see
// `buildAgentSkillsIndex`. Headers, including the ones for a failed build, live
// in `agentSkillsIndexResponse` so that path can be tested.
export const Route = createFileRoute("/.well-known/agent-skills/index.json")({
  server: {
    handlers: {
      GET: ({ request }) =>
        agentSkillsIndexResponse(siteUrlFromRequest(SITE_URL, request)),
    },
  },
})
