import matter from "gray-matter"
import { encode } from "gpt-tokenizer"
import type { ServiceDoc, ServiceFrontmatter } from "./content-types"

const RAW_MODULES: Record<string, string> = import.meta.glob("/services/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
})

function deriveSlug(filePath: string, frontmatterSlug: string | undefined): string {
  if (frontmatterSlug && frontmatterSlug.length > 0) return frontmatterSlug
  const fileName = filePath.split("/").pop() ?? ""
  return fileName.replace(/^_+/, "").replace(/\.md$/, "")
}

// YAML's CORE_SCHEMA auto-parses ISO date strings (`2026-05-07`) into JS Date
// objects. Without normalization, rendering `{frontmatter.last_updated}` in JSX
// throws "Objects are not valid as a React child (found: [object Date])".
function normalizeDateField(value: unknown): string {
  if (typeof value === "string") return value
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return ""
}

function deriveTagline(body: string): string {
  const lines = body.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue
    if (trimmed.startsWith("#")) continue
    if (trimmed.startsWith(">")) continue
    return trimmed.replace(/\*\*/g, "").slice(0, 200)
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

function buildDoc(filePath: string, raw: string): ServiceDoc {
  const parsed = matter(raw)
  const fm = parsed.data as Partial<ServiceFrontmatter>
  const slug = deriveSlug(filePath, fm.slug)
  const frontmatter: ServiceFrontmatter = {
    name: fm.name ?? slug,
    slug,
    category: fm.category ?? "etc",
    tier: fm.tier ?? 3,
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

const DOCS: Array<ServiceDoc> = Object.entries(RAW_MODULES)
  .map(([filePath, raw]) => buildDoc(filePath, raw))
  .sort((a, b) => a.frontmatter.tier - b.frontmatter.tier || a.frontmatter.name.localeCompare(b.frontmatter.name))

const BY_SLUG = new Map(DOCS.map((d) => [d.frontmatter.slug, d]))

export function getAllServices(): Array<ServiceDoc> {
  return DOCS
}

export function getServiceBySlug(slug: string): ServiceDoc | undefined {
  return BY_SLUG.get(slug)
}
