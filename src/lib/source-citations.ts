// Audits source-citation integrity in a catalog design.md.
//
// The contract (see .claude/skills/design-md/references/{stitch-format,rubric-design}.md):
//   - `## References` is the entry's one list of sources. Frontmatter used to
//     carry the same URLs as `sources`, but the only reader of that copy was
//     the rule that checked the two lists were equal, so it was removed
//     (docs/adr/0004-public-sources-listed-once.md).
//   - Body `[src:N]` cites the Nth entry of `## References`. `[src:N]` is
//     stripped at render time, so there is no runtime mapping beyond this list.
//   - Every entry must be an externally-accessible public URL — label-only /
//     ephemeral placeholder entries are NOT allowed (`non-public-reference`),
//     and no URL may be an ephemeral handoff link or a cache/relative/file
//     path (`forbidden-url`).
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

// Links that must never appear in `## References`. Ephemeral handoff bundles
// and local cache paths 404 for readers; relative/file URLs stop being
// meaningful once the design.md is copied outside the site. A handoff link is
// an `https://` URL, so `non-public-reference` alone would let it through.
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

// Lines inside `## References` that carry a URL but no `N.` prefix. The parser
// above skips them, so a source whose number was dropped would vanish from
// every check below and still be published. Frontmatter `sources` used to
// expose that as a count mismatch; with References as the only list nothing
// else would.
function unnumberedUrlLines(body: string): Array<string> {
  const lines = body.split(/\r?\n/)
  const start = lines.findIndex((l) => /^##\s+References\s*$/.test(l.trim()))
  if (start === -1) return []
  const out: Array<string> = []
  for (let i = start + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (/^#{2,}\s+/.test(trimmed)) break
    if (/^\d+\.\s+/.test(trimmed)) continue
    if (/https?:\/\//.test(trimmed)) out.push(trimmed)
  }
  return out
}

function isPublicUrlRef(text: string): boolean {
  return /^https?:\/\//.test(text)
}

// The URL is the first whitespace-delimited token of a reference line
// (`https://x — 설명` → `https://x`).
function refUrl(text: string): string {
  return text.split(/\s+/)[0]
}

export function auditSourceCitations(
  slug: string,
  body: string
): Array<CitationIssue> {
  const issues: Array<CitationIssue> = []
  const refs = parseReferences(body)
  const R = refs.length

  // An entry must name at least one public source. This used to be the
  // frontmatter `empty-sources` rule; with References as the only list, an
  // entry with none would otherwise pass every numbering and range check.
  if (!refs.some((r) => isPublicUrlRef(r.text))) {
    issues.push({
      severity: "block",
      rule: "empty-references",
      message: `[${slug}] ## References lists no public URL — every entry must name the public sources its claims cite.`,
    })
  }

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

  for (const line of unnumberedUrlLines(body)) {
    const preview = line.length > 60 ? `${line.slice(0, 60)}…` : line
    issues.push({
      severity: "block",
      rule: "unnumbered-reference",
      message: `[${slug}] ## References has a URL line with no \`N.\` number ("${preview}") — it is invisible to [src:N] and to every other check. Number it or remove it.`,
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

  // No ephemeral/cache/relative/file links. Checked on every reference's first
  // token, public-looking or not, so an `https://` handoff link is caught too.
  for (const r of refs) {
    const url = refUrl(r.text)
    const hit = FORBIDDEN_PATTERNS.find((p) => p.test(url))
    if (hit) {
      issues.push({
        severity: "block",
        rule: "forbidden-url",
        message: `[${slug}] ## References #${r.num} is a ${hit.label}: "${url}". Remove it — only externally-accessible public URLs are allowed in ## References.`,
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

  // Warn: a URL listed more than once in References.
  const seen = new Set<string>()
  for (const r of refs) {
    if (!isPublicUrlRef(r.text)) continue
    const url = refUrl(r.text)
    if (seen.has(url)) {
      issues.push({
        severity: "warn",
        rule: "duplicate-source-url",
        message: `[${slug}] ## References lists "${url}" more than once.`,
      })
    }
    seen.add(url)
  }

  return issues
}
