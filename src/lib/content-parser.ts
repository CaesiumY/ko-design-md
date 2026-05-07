import matter from "gray-matter"
import { encode } from "gpt-tokenizer"
import type { ServiceDoc, ServiceFrontmatter } from "./content-types"

export function deriveSlug(filePath: string, frontmatterSlug: string | undefined): string {
  if (frontmatterSlug && frontmatterSlug.length > 0) return frontmatterSlug
  const fileName = filePath.split("/").pop() ?? ""
  return fileName.replace(/^_+/, "").replace(/\.md$/, "")
}

// YAML's CORE_SCHEMA auto-parses ISO date strings (`2026-05-07`) into JS Date
// objects. Without normalization, rendering `{frontmatter.last_updated}` in JSX
// throws "Objects are not valid as a React child (found: [object Date])".
export function normalizeDateField(value: unknown): string {
  if (typeof value === "string") return value
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return ""
}

export function deriveTagline(body: string): string {
  const lines = body.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue
    if (trimmed.startsWith("#")) continue
    if (trimmed.startsWith(">")) continue
    return trimmed.replace(/\*\*/g, "")
  }
  return ""
}

// Sentence terminator beats whitespace: a period closes a thought, a space may
// cut between subject and verb. Only fall back to space (and then to a hard cut)
// when no terminator lands in the upper 40% of the slice.
export function truncateForMeta(text: string, max = 155): string {
  if (text.length <= max) return text
  const slice = text.slice(0, max)
  const minBreak = max * 0.6
  const terminators = [".", "!", "?", "。", "！", "？"]
  const lastTerminator = Math.max(...terminators.map((c) => slice.lastIndexOf(c)))
  if (lastTerminator > minBreak) {
    return slice.slice(0, lastTerminator + 1).trimEnd() + "…"
  }
  const lastSpace = slice.lastIndexOf(" ")
  if (lastSpace > minBreak) {
    return slice.slice(0, lastSpace).trimEnd() + "…"
  }
  return slice.trimEnd() + "…"
}

export function buildDoc(filePath: string, raw: string): ServiceDoc {
  const parsed = matter(raw)
  const fm = parsed.data as Partial<ServiceFrontmatter>
  const slug = deriveSlug(filePath, fm.slug)
  const frontmatter: ServiceFrontmatter = {
    name: fm.name ?? slug,
    slug,
    category: fm.category ?? "etc",
    last_updated: normalizeDateField(fm.last_updated),
    sources: fm.sources ?? [],
    related_services: fm.related_services ?? [],
    lang: fm.lang ?? "ko",
    estimated_tokens: fm.estimated_tokens,
  }
  const estimatedTokens = frontmatter.estimated_tokens ?? encode(raw).length
  return {
    frontmatter,
    raw,
    body: parsed.content,
    tagline: deriveTagline(parsed.content),
    filePath,
    estimatedTokens,
  }
}

// ISO 8601 dates (YYYY-MM-DD) sort lexicographically the same as chronologically,
// so a direct string compare is enough — no need for collation-aware localeCompare.
// localeCompare is reserved for `name`, where Korean character ordering matters.
export function sortDocs(docs: Array<ServiceDoc>): Array<ServiceDoc> {
  return [...docs].sort((a, b) => {
    const aDate = a.frontmatter.last_updated
    const bDate = b.frontmatter.last_updated
    if (aDate !== bDate) return aDate < bDate ? 1 : -1
    return a.frontmatter.name.localeCompare(b.frontmatter.name)
  })
}
