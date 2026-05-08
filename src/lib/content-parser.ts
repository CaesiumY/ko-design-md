import { encode } from "gpt-tokenizer"
import type { ServiceDoc, ServiceFrontmatter } from "./content-types"

// Minimal frontmatter parser for our schema (string scalars, inline arrays,
// block arrays). gray-matter pulls in Node's Buffer global which is undefined
// in the browser bundle and blocks hydration when the route module is imported
// on the client.
interface MatterResult {
  data: Record<string, unknown>
  content: string
}

function stripQuotes(value: string): string {
  if (value.length >= 2) {
    const first = value[0]
    const last = value[value.length - 1]
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1)
    }
  }
  return value
}

function parseYamlSubset(text: string): Record<string, unknown> {
  const lines = text.split(/\r?\n/)
  const out: Record<string, unknown> = {}
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    if (trimmed === "" || trimmed.startsWith("#")) {
      i++
      continue
    }
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!m) {
      i++
      continue
    }
    const key = m[1]
    const rest = m[2].trim()
    if (rest === "") {
      const items: Array<string> = []
      let j = i + 1
      while (j < lines.length) {
        const next = lines[j]
        if (next.trim() === "") {
          j++
          continue
        }
        const itemMatch = next.match(/^\s+-\s+(.*)$/)
        if (!itemMatch) break
        items.push(stripQuotes(itemMatch[1].trim()))
        j++
      }
      out[key] = items
      i = j
    } else if (rest.startsWith("[") && rest.endsWith("]")) {
      const inner = rest.slice(1, -1).trim()
      out[key] =
        inner === ""
          ? []
          : inner.split(",").map((s) => stripQuotes(s.trim()))
      i++
    } else {
      out[key] = stripQuotes(rest)
      i++
    }
  }
  return out
}

function matter(raw: string): MatterResult {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }
  return { data: parseYamlSubset(match[1]), content: match[2] }
}

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
    logo: fm.logo,
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
