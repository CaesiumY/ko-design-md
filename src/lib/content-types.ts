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
