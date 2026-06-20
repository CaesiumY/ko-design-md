// Audits source-citation integrity in a catalog design.md.
//
// The contract (see .claude/skills/design-md/references/{stitch-format,rubric-design}.md):
//   - Body `[src:N]` cites the Nth entry of the `## References` list (NOT
//     frontmatter sources[N-1]). `[src:N]` is stripped at render time, so there
//     is no runtime mapping to the sources array.
//   - `## References` = the same public URLs as frontmatter `sources`, in the
//     same order. Every entry must be an externally-accessible public URL —
//     label-only / ephemeral placeholder entries are NOT allowed and are
//     flagged by the `non-public-reference` rule below.
//   - frontmatter `sources` must equal the public reference URLs, in the same
//     order, and must contain no ephemeral/cache/relative links.
//
// This module is a pure function so both the Node CI script
// (scripts/validate-sources.ts) and vitest can reuse it without depending on
// Vite's import.meta.glob.

export type CitationSeverity = "block" | "warn"

export type CitationIssue = {
  severity: CitationSeverity
  rule: string
  message: string
}

// Links that must never appear in frontmatter `sources`. Ephemeral handoff
// bundles and local cache paths 404 for readers; relative/file URLs stop being
// meaningful once the design.md is copied outside the site.
const FORBIDDEN_PATTERNS: ReadonlyArray<{
  test: (url: string) => boolean
  label: string
}> = [
  {
    test: (u) => /api\.anthropic\.com\/v1\/design\/h\//.test(u),
    label: "ephemeral Claude Design handoff link",
  },
  {
    test: (u) => u.includes(".claude/cache/"),
    label: "local .claude/cache path",
  },
  { test: (u) => u.startsWith("/"), label: "site-relative path" },
  { test: (u) => u.startsWith("file://"), label: "local file URL" },
]

// Inline citation `[src:N]` with an integer N. Screenshot refs like
// `[src:screenshot:home.png]` carry no integer and are intentionally excluded.
const CITATION_RE = /\[src:(\d+)\]/g

function extractCitations(body: string): Set<number> {
  const found = new Set<number>()
  for (const m of body.matchAll(CITATION_RE)) {
    found.add(Number(m[1]))
  }
  return found
}

type Reference = { num: number; text: string }

// Parse the `## References` block: numbered `N. ...` lines until the next `##`.
export function parseReferences(body: string): Array<Reference> {
  const lines = body.split(/\r?\n/)
  const start = lines.findIndex((l) => /^##\s+References\s*$/.test(l.trim()))
  if (start === -1) return []
  const refs: Array<Reference> = []
  for (let i = start + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (/^#{2,}\s+/.test(trimmed)) break // stop at the next section (## or deeper)
    const m = trimmed.match(/^(\d+)\.\s+(.*)$/)
    if (m) refs.push({ num: Number(m[1]), text: m[2].trim() })
  }
  return refs
}

function isPublicUrlRef(text: string): boolean {
  return /^https?:\/\//.test(text)
}

// The URL is the first whitespace-delimited token of a public reference line
// (`https://x — 설명` → `https://x`).
function refUrl(text: string): string {
  return text.split(/\s+/)[0]
}

export function auditSourceCitations(
  slug: string,
  sources: Array<string>,
  body: string
): Array<CitationIssue> {
  const issues: Array<CitationIssue> = []
  const refs = parseReferences(body)
  const R = refs.length

  // References numbered contiguously 1..R.
  if (!refs.every((r, idx) => r.num === idx + 1)) {
    issues.push({
      severity: "block",
      rule: "references-numbering",
      message: `[${slug}] ## References must be numbered 1..${R} with no gaps or duplicates; got [${refs
        .map((r) => r.num)
        .join(", ")}].`,
    })
  }

  // Every citation in range 1..R.
  const cites = extractCitations(body)
  for (const n of [...cites].sort((a, b) => a - b)) {
    if (n < 1 || n > R) {
      issues.push({
        severity: "block",
        rule: "citation-range",
        message: `[${slug}] body cites [src:${n}] but ## References has ${R} entries (valid range 1..${R}).`,
      })
    }
  }

  // Every reference must be an externally-accessible public URL — no label-only
  // ephemeral entries (Claude Design handoff bundles, .claude/cache paths, etc.)
  // that catalog readers cannot open.
  for (const r of refs) {
    if (!isPublicUrlRef(r.text)) {
      const preview = r.text.length > 40 ? `${r.text.slice(0, 40)}…` : r.text
      issues.push({
        severity: "block",
        rule: "non-public-reference",
        message: `[${slug}] ## References #${r.num} ("${preview}") is not a public URL; every source must be an externally-accessible link.`,
      })
    }
  }

  // frontmatter sources must equal the public reference URLs, in order.
  const publicRefUrls = refs
    .filter((r) => isPublicUrlRef(r.text))
    .map((r) => refUrl(r.text))
  if (sources.length !== publicRefUrls.length) {
    issues.push({
      severity: "block",
      rule: "sources-references-mismatch",
      message: `[${slug}] frontmatter sources has ${sources.length} URL(s) but ## References has ${publicRefUrls.length} public URL(s) (excluding label-only entries).`,
    })
  } else {
    for (let i = 0; i < sources.length; i++) {
      if (sources[i] !== publicRefUrls[i]) {
        issues.push({
          severity: "block",
          rule: "sources-references-mismatch",
          message: `[${slug}] sources[${i}] = "${sources[i]}" but public reference #${i + 1} = "${publicRefUrls[i]}" (order and content must match).`,
        })
      }
    }
  }

  // No ephemeral/cache/relative/file links in sources.
  for (const url of sources) {
    const hit = FORBIDDEN_PATTERNS.find((p) => p.test(url))
    if (hit) {
      issues.push({
        severity: "block",
        rule: "forbidden-url",
        message: `[${slug}] sources contains a ${hit.label}: "${url}". Remove it — only externally-accessible public URLs are allowed in sources and ## References.`,
      })
    }
  }

  // Warn: a reference index never cited in the body.
  for (let n = 1; n <= R; n++) {
    if (!cites.has(n)) {
      issues.push({
        severity: "warn",
        rule: "unused-source",
        message: `[${slug}] reference #${n} is never cited as [src:${n}] in the body.`,
      })
    }
  }

  // Warn: a URL listed more than once in sources.
  const seen = new Set<string>()
  for (const url of sources) {
    if (seen.has(url)) {
      issues.push({
        severity: "warn",
        rule: "duplicate-source-url",
        message: `[${slug}] sources lists "${url}" more than once.`,
      })
    }
    seen.add(url)
  }

  return issues
}
