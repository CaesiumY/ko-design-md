export type Category =
  | "finance"
  | "messenger"
  | "commerce"
  | "delivery"
  | "mobility"
  | "content"
  | "community"
  | "travel"
  | "etc"

export type Tier = 1 | 2 | 3
export type Lang = "ko" | "en"

export interface ServiceFrontmatter {
  name: string
  slug: string
  category: Category
  tier: Tier
  last_updated: string
  sources: Array<string>
  related_services: Array<string>
  lang: Lang
  estimated_tokens?: number
}

export interface ServiceDoc {
  frontmatter: ServiceFrontmatter
  raw: string
  body: string
  tagline: string
  filePath: string
  estimatedTokens: number
}
