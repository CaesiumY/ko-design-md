export const CATEGORIES = [
  "finance",
  "messenger",
  "commerce",
  "delivery",
  "mobility",
  "content",
  "community",
  "travel",
  "gov",
  "developer",
  "etc",
] as const

export type Category = (typeof CATEGORIES)[number]

export type Lang = "ko" | "en"

export interface ServiceFrontmatter {
  name: string
  design_system_name?: string
  slug: string
  category: Category
  last_updated: string
  /**
   * Date the entry first landed in the catalog (ISO YYYY-MM-DD). Optional.
   * Used by the detail page to show the full lifecycle of an entry
   * (added + last updated). The list view intentionally ignores it — there
   * we render only one signal ("recently touched") because a first publish
   * and a later sync are the same thing from a list-scanning perspective.
   */
  created_at?: string
  sources: Array<string>
  related_services: Array<string>
  lang: Lang
  estimated_tokens?: number
  logo?: string
}

export interface ServiceDoc {
  frontmatter: ServiceFrontmatter
  raw: string
  body: string
  tagline: string
  filePath: string
  estimatedTokens: number
}
