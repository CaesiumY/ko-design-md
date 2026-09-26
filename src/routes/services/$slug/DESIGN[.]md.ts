import { createFileRoute } from "@tanstack/react-router"
import { getServiceBySlug } from "@/lib/content-collection"
import {
  AGENT_TEXT_HEADERS,
  textNotFoundResponse,
} from "@/lib/agent-representation"

// The catalog entry under the filename Google's DESIGN.md spec uses
// (github.com/google-labs-code/design.md, spec `alpha`, Apache-2.0). Spec
// tooling — Stitch, the official `design.md` CLI, agents that expect the
// standard name — can fetch it directly.
//
// Served VERBATIM, the same bytes as the sibling llms.txt handler (#421). The
// entry file is itself a spec document: tokens in YAML frontmatter, rationale
// in prose, no yaml fence in the body (`body-yaml-fence` blocks one). An adapter
// used to rebuild the frontmatter from the sidecar; once the raw file linted
// the same as its output, it was a second representation with nothing to add.
// `scripts/test-http.ts` pins the two routes to identical bodies.

const MARKDOWN_HEADERS = {
  // Served as text/plain (not text/markdown) so a browser renders it inline
  // instead of downloading it — the same choice GitHub raw makes for .md.
  // The skill file under /.well-known deliberately goes the other way: its
  // reader is a host verifying a digest, not a person following a link.
  "content-type": "text/plain; charset=utf-8",
  ...AGENT_TEXT_HEADERS,
}

export const Route = createFileRoute("/services/$slug/DESIGN.md")({
  server: {
    handlers: {
      GET: ({ params }) => {
        const doc = getServiceBySlug(params.slug)
        if (!doc) {
          // A real 404 body, not the router's notFoundComponent — agents fetch
          // this endpoint directly and never render React. Its cache terms are
          // not the success ones - see `textNotFoundResponse`.
          return textNotFoundResponse(params.slug)
        }
        return new Response(doc.raw, { headers: MARKDOWN_HEADERS })
      },
    },
  },
})
