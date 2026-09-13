import { createFileRoute } from "@tanstack/react-router"
import { SKILL_MARKDOWN } from "@/lib/agent-skill-index"
import { AGENT_TEXT_HEADERS } from "@/lib/agent-representation"

// The skill file itself, at the URL the discovery index names. Served as
// `text/markdown` because that is what the index declares the resource to be -
// `text/plain` would render the same in a browser but misdescribe it to the
// host that fetched the index to verify the digest.
export const Route = createFileRoute(
  "/.well-known/agent-skills/use-design-md/SKILL.md"
)({
  server: {
    handlers: {
      GET: () =>
        new Response(SKILL_MARKDOWN, {
          headers: {
            "content-type": "text/markdown; charset=utf-8",
            ...AGENT_TEXT_HEADERS,
          },
        }),
    },
  },
})
