import { createFileRoute } from "@tanstack/react-router"
import { getServiceBySlug } from "@/lib/content-collection"
import { toGoogleDesignMd } from "@/lib/google-designmd-adapter"

// The catalog entry rendered in Google's published DESIGN.md format
// (github.com/google-labs-code/design.md, spec `alpha`, Apache-2.0): design
// tokens in YAML frontmatter, rationale in prose. Spec tooling — Stitch, the
// official `design.md` CLI, agents that expect the standard shape — can consume
// this directly.
//
// Computed per request from `services/{slug}.md`, exactly like the sibling
// llms.txt handler. Nothing is written to disk, so this view cannot go stale
// against its source: edit the md and the next request already reflects it.
//
// This does NOT replace llms.txt. That endpoint serves the entry verbatim,
// including the `[src:N]` citations, provenance notes and audit blockquotes that
// carry the catalog's evidence — none of which the standard schema has a slot
// for. Two views of one source, for two different consumers.

const MARKDOWN_HEADERS = {
  // Served as text/plain (not text/markdown) so a browser renders it inline
  // instead of downloading it — the same choice GitHub raw makes for .md.
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "public, max-age=0, s-maxage=3600",
  // Matches llms.txt: client-side agents fetch this cross-origin.
  "access-control-allow-origin": "*",
}

export const Route = createFileRoute("/services/$slug/DESIGN.md")({
  server: {
    handlers: {
      GET: ({ params }) => {
        const doc = getServiceBySlug(params.slug)
        if (!doc) {
          // A real 404 body, not the router's notFoundComponent — agents fetch
          // this endpoint directly and never render React.
          return new Response(`Not found: ${params.slug}\n`, {
            status: 404,
            headers: MARKDOWN_HEADERS,
          })
        }
        return new Response(toGoogleDesignMd(doc), {
          headers: MARKDOWN_HEADERS,
        })
      },
    },
  },
})
