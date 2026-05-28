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
   * Date the entry first landed in this catalog (ISO YYYY-MM-DD). Optional for
   * backward compatibility, but every entry should set it once and never edit
   * after — that's what lets us tell apart "newly added" from "existing entry
   * just got a content sync". When omitted, the entry is treated as if it has
   * always been there (no UPDATED badge, only NEW based on `last_updated`).
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
