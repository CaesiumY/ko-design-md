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

function buildDoc(filePath: string, raw: string): ServiceDoc {
  const parsed = matter(raw)
  const fm = parsed.data as Partial<ServiceFrontmatter>
  const slug = deriveSlug(filePath, fm.slug)
  const frontmatter: ServiceFrontmatter = {
    name: fm.name ?? slug,
    slug,
    category: fm.category ?? "etc",
    tier: fm.tier ?? 3,
    last_updated: fm.last_updated ?? "",
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
