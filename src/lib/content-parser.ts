import type { ServiceDoc, ServiceFrontmatter } from "./content-types"

// Minimal frontmatter parser for our schema (string scalars, inline arrays,
// block arrays). gray-matter pulls in Node's Buffer global which is undefined
// in the browser bundle and blocks hydration when the route module is imported
// on the client.
//
// Guard layer: see buildDoc + matter. The parser silently degrades on malformed
// input by design (skip unrecognized lines), so we layer fence/BOM checks and
// a typed validation pass on top to fail loudly when a contributor's frontmatter
// would otherwise parse to defaults.
interface MatterResult {
  data: Record<string, unknown>
  content: string
}

const KNOWN_FRONTMATTER_KEYS: ReadonlyArray<keyof ServiceFrontmatter> = [
  "name",
  "design_system_name",
  "slug",
  "category",
  "last_updated",
  "created_at",
  "sources",
  "related_services",
  "lang",
  "estimated_tokens",
  "logo",
]

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

// Strip a trailing YAML-style `# comment` from an unquoted scalar. The `#` only
// counts as a comment when preceded by whitespace, so URL fragments
// (`https://x.com/page#frag`) are preserved.
function stripInlineComment(value: string): string {
  if (value.startsWith('"') || value.startsWith("'")) return value
  return value.replace(/\s+#.*$/, "")
}

// Comma-split that respects single/double quotes so values like
// `["a,b", "c"]` stay as 2 items rather than splitting at every comma.
function splitOutsideQuotes(text: string): Array<string> {
  const out: Array<string> = []
  let buf = ""
  let quote: '"' | "'" | null = null
  for (const ch of text) {
    if (quote) {
      buf += ch
      if (ch === quote) quote = null
    } else if (ch === '"' || ch === "'") {
      quote = ch
      buf += ch
    } else if (ch === ",") {
      const trimmed = buf.trim()
      if (trimmed.length > 0) out.push(trimmed)
      buf = ""
    } else {
      buf += ch
    }
  }
  const tail = buf.trim()
  if (tail.length > 0) out.push(tail)
  return out
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
        const nextTrimmed = next.trim()
        if (nextTrimmed === "" || nextTrimmed.startsWith("#")) {
          j++
          continue
        }
        // Allow zero-indent items too (`- foo` at column 0). YAML is permissive
        // here; the human-friendly form is indented but un-indented is legal.
        const itemMatch = next.match(/^\s*-\s+(.*)$/)
        if (!itemMatch) break
        items.push(stripQuotes(stripInlineComment(itemMatch[1].trim())))
        j++
      }
      out[key] = items
      i = j
    } else if (rest.startsWith("[") && rest.endsWith("]")) {
      const inner = rest.slice(1, -1).trim()
      out[key] =
        inner === "" ? [] : splitOutsideQuotes(inner).map((s) => stripQuotes(s))
      i++
    } else {
      out[key] = stripQuotes(stripInlineComment(rest))
      i++
    }
  }
  return out
}

function matter(raw: string): MatterResult {
  // Strip UTF-8 BOM. Editors like Windows Notepad emit it, and an unstripped BOM
  // makes the `^---` anchor miss → entire frontmatter silently lost.
  let source = raw
  if (source.charCodeAt(0) === 0xfeff) source = source.slice(1)

  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (match) return { data: parseYamlSubset(match[1]), content: match[2] }

  // If the file starts with `---` but the closing fence is missing or
  // malformed, fail loudly rather than render with all defaults.
  if (source.trimStart().startsWith("---")) {
    throw new Error(
      "Frontmatter block is malformed: expected a closing '---' line. Got: " +
        JSON.stringify(source.slice(0, 80))
    )
  }
  return { data: {}, content: source }
}

export function deriveSlug(
  filePath: string,
  frontmatterSlug: string | undefined
): string {
  if (frontmatterSlug && frontmatterSlug.length > 0) return frontmatterSlug
  const fileName = filePath.split("/").pop() ?? ""
  return fileName.replace(/^_+/, "").replace(/\.md$/, "")
}

// YAML's CORE_SCHEMA auto-parses ISO date strings (`2026-05-07`) into JS Date
// objects. Without normalization, rendering `{frontmatter.last_updated}` in JSX
// throws "Objects are not valid as a React child (found: [object Date])".
// We also reject non-ISO strings so a typo like `2026/05/07` doesn't quietly
// produce broken NEW-badge / sort behavior.
export function normalizeDateField(value: unknown, context = ""): string {
  if (value === undefined || value === null) return ""
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === "string") {
    if (value === "") return ""
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error(
        `last_updated must be ISO YYYY-MM-DD${context ? ` (${context})` : ""}, got "${value}"`
      )
    }
    return value
  }
  return ""
}

// Bibliographic markup that should never reach a human — only authoring tools.
//   `**` — bold wrappers (already stripped historically)
//   `[src:N]` — Stitch v0.1 citation markers (`삼는다 [src:1][src:6].` →
//   `삼는다.`). Eats leading whitespace so prose around citations stays
//   clean; without it, the period would dangle after a stray space.
export function deriveTagline(body: string): string {
  const lines = body.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue
    if (trimmed.startsWith("#")) continue
    if (trimmed.startsWith(">")) continue
    return trimmed
      .replace(/\*\*/g, "")
      .replace(/\s*\[src:[^\]]*\]/g, "")
      .trim()
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
  const lastTerminator = Math.max(
    ...terminators.map((c) => slice.lastIndexOf(c))
  )
  if (lastTerminator > minBreak) {
    return slice.slice(0, lastTerminator + 1).trimEnd() + "…"
  }
  const lastSpace = slice.lastIndexOf(" ")
  if (lastSpace > minBreak) {
    return slice.slice(0, lastSpace).trimEnd() + "…"
  }
  return slice.trimEnd() + "…"
}

function estimateTokens(raw: string): number {
  const cjkChars =
    raw.match(
      /[\u1100-\u11ff\u3040-\u30ff\u3130-\u318f\u3400-\u9fff\uac00-\ud7af]/g
    )?.length ?? 0
  const latinWords =
    raw.match(/[A-Za-z0-9_]+(?:[./_-][A-Za-z0-9_]+)*/g)?.length ?? 0
  const symbols =
    raw.match(
      /[^\sA-Za-z0-9_\u1100-\u11ff\u3040-\u30ff\u3130-\u318f\u3400-\u9fff\uac00-\ud7af]/g
    )?.length ?? 0

  return Math.max(
    1,
    Math.ceil(cjkChars * 0.75 + latinWords * 1.25 + symbols * 0.25)
  )
}

function coerceNumberField(
  value: unknown,
  field: string,
  context: string
): number | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === "number")
    return Number.isFinite(value) ? value : undefined
  if (typeof value === "string") {
    if (value === "") return undefined
    const n = Number(value)
    if (!Number.isFinite(n)) {
      throw new Error(
        `${field} must be a number${context ? ` (${context})` : ""}, got "${value}"`
      )
    }
    return n
  }
  throw new Error(
    `${field} must be a number${context ? ` (${context})` : ""}, got ${typeof value}`
  )
}

function ensureStringArray(
  value: unknown,
  field: string,
  context: string
): Array<string> {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) {
    throw new Error(
      `${field} must be an array${context ? ` (${context})` : ""}, got ${typeof value}`
    )
  }
  return value.map((item) => {
    if (typeof item !== "string") {
      throw new Error(
        `${field} items must be strings${context ? ` (${context})` : ""}, got ${typeof item}`
      )
    }
    return item
  })
}

export function buildDoc(filePath: string, raw: string): ServiceDoc {
  const parsed = matter(raw)
  const data = parsed.data
  const context = filePath

  // Surface unknown frontmatter keys so a typo like `last-updated:` (instead of
  // `last_updated:`) doesn't silently fall back to the empty-string default.
  for (const key of Object.keys(data)) {
    if (!(KNOWN_FRONTMATTER_KEYS as ReadonlyArray<string>).includes(key)) {
      console.warn(
        `[content-parser] Unknown frontmatter key "${key}" in ${context} (ignored)`
      )
    }
  }

  const fm = data as Partial<ServiceFrontmatter>
  const slug = deriveSlug(filePath, fm.slug)
  const frontmatter: ServiceFrontmatter = {
    name: fm.name ?? slug,
    design_system_name:
      typeof fm.design_system_name === "string"
        ? fm.design_system_name
        : undefined,
    slug,
    category: fm.category ?? "etc",
    last_updated: normalizeDateField(fm.last_updated, context),
    created_at: fm.created_at
      ? normalizeDateField(fm.created_at, context)
      : undefined,
    sources: ensureStringArray(fm.sources, "sources", context),
    related_services: ensureStringArray(
      fm.related_services,
      "related_services",
      context
    ),
    lang: fm.lang ?? "ko",
    estimated_tokens: coerceNumberField(
      fm.estimated_tokens,
      "estimated_tokens",
      context
    ),
    logo: fm.logo,
  }
  const estimatedTokens = frontmatter.estimated_tokens ?? estimateTokens(raw)
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
