import { splitFrontmatter } from "./frontmatter-fence"
import type {
  Category,
  Lang,
  ServiceDoc,
  ServiceFrontmatter,
  SiteFrontmatter,
} from "./content-types"

// An entry's body, as the site shows it: the tagline, the meta description and
// the catalog's orderings. In the browser bundle, so it reads no frontmatter —
// the build reads that once, with the one reader (docs/adr/0011), and hands the
// site the values (`virtual:site-frontmatter`; `buildDoc` in
// `site-frontmatter.ts` for the Node tools).

export function deriveSlug(
  filePath: string,
  frontmatterSlug: string | undefined
): string {
  if (frontmatterSlug && frontmatterSlug.length > 0) return frontmatterSlug
  const fileName = filePath.split("/").pop() ?? ""
  return fileName.replace(/\.md$/, "")
}

// Bibliographic markup that should never reach a human — only authoring tools.
//   `**` — bold wrappers (already stripped historically)
//   `[src:N]` — Stitch v0.1 citation markers (`삼는다 [src:1][src:6].` →
//   `삼는다.`). Eats leading whitespace so prose around citations stays
//   clean; without it, the period would dangle after a stray space.
//   backticks — inline-code fences. The tagline is consumed where markdown does
//   NOT render (the OG image via satori, the meta description), so a leftover
//   backtick shows up as a literal character on the social card.
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
      .replace(/`/g, "")
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

/**
 * The site's doc for an entry whose frontmatter the build already read and
 * checked (`virtual:site-frontmatter`, #585): dates are real ISO dates and the
 * token count a number by the time they get here. Only the body is split in
 * this path and nothing re-validates, so neither a parser nor the field checks
 * reach the browser bundle. A missing key derives a default: the slug from the
 * file name, the name from the slug, the token count from the text.
 */
export function buildSiteDoc(
  filePath: string,
  raw: string,
  fm: SiteFrontmatter
): ServiceDoc {
  const body = splitFrontmatter(raw)?.body ?? raw
  const slug = deriveSlug(filePath, fm.slug)
  const frontmatter: ServiceFrontmatter = {
    name: fm.name ?? slug,
    design_system_name: fm.design_system_name,
    slug,
    category: (fm.category ?? "etc") as Category,
    last_updated: fm.last_updated ?? "",
    created_at: fm.created_at ?? "",
    lang: (fm.lang ?? "ko") as Lang,
    estimated_tokens: fm.estimated_tokens,
    logo: fm.logo,
  }
  return {
    frontmatter,
    raw,
    body,
    tagline: deriveTagline(body),
    filePath,
    estimatedTokens: frontmatter.estimated_tokens ?? estimateTokens(raw),
  }
}

// ISO 8601 dates (YYYY-MM-DD) sort lexicographically the same as chronologically,
// so a direct string compare is enough — no need for collation-aware localeCompare.
// localeCompare is reserved for `name`, where Korean character ordering matters.
//
// Always returns a fresh array: `getAllServices()` hands out the shared
// module-level catalog, so an in-place sort here would reorder the site globally.
function sortDocsByDate(
  docs: Array<ServiceDoc>,
  key: "created_at" | "last_updated"
): Array<ServiceDoc> {
  return [...docs].sort((a, b) => {
    const aDate = a.frontmatter[key]
    const bDate = b.frontmatter[key]
    if (aDate !== bDate) return aDate < bDate ? 1 : -1
    return a.frontmatter.name.localeCompare(b.frontmatter.name)
  })
}

/**
 * Catalog order: most recently *added* first. This is the site's canonical
 * ordering — the home list, llms.txt, sitemap and OG build all use it, so a
 * later content sync never reshuffles the list. Recency of edits is surfaced
 * separately by the "Updated" badge, which reads `last_updated`.
 */
export function sortDocsByAdded(docs: Array<ServiceDoc>): Array<ServiceDoc> {
  return sortDocsByDate(docs, "created_at")
}

/**
 * Feed order: most recently *changed* first. RSS exists to answer "what
 * changed", and each `<item>`'s pubDate is `last_updated` — ordering by
 * anything else would contradict the timestamps the feed publishes.
 */
export function sortDocsByUpdated(docs: Array<ServiceDoc>): Array<ServiceDoc> {
  return sortDocsByDate(docs, "last_updated")
}
