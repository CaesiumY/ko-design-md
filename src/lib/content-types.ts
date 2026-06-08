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
  "education",
  "career",
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

/**
 * A single design token row, normalized from a service's prose YAML into the
 * machine-readable sidecar (`services/{slug}.tokens.json`). The sidecar is a
 * derived artifact — the human-curated md prose stays the source of record.
 */
export interface ColorToken {
  name: string
  /** Renderable color string (OKLCH/hex/rgb). Aliases are intentionally excluded
   *  from the card sidecar — they stay in the design.md prose. */
  value: string
  /** Usage note lifted from the YAML inline comment, when present. */
  note?: string
  /** Subsection the token was grouped under (### heading), when present. */
  group?: string
}

export interface TypeToken {
  name: string
  /** Font size with unit (e.g. "56px", "1.625rem"). */
  size?: string
  weight?: number
  /** Line height as authored: a ratio ("1.30") or an absolute ("50px"). */
  lineHeight?: string
  /** Letter spacing as authored (e.g. "-0.005em"). */
  tracking?: string
  /** Font family / role info that doesn't fit the numeric columns. */
  note?: string
}

export interface SpacingToken {
  name: string
  value: string
  /** Numeric px for bar scaling; null when non-px (e.g. "50%"). */
  px: number | null
}

export interface RadiusToken {
  name: string
  value: string
  px: number | null
}

export interface ServiceTokens {
  colors: Array<ColorToken>
  typography: Array<TypeToken>
  spacing: Array<SpacingToken>
  radius: Array<RadiusToken>
}

export interface ServiceDoc {
  frontmatter: ServiceFrontmatter
  raw: string
  body: string
  tagline: string
  filePath: string
  estimatedTokens: number
  /**
   * Normalized design tokens from the `{slug}.tokens.json` sidecar. Optional:
   * undefined when no sidecar exists yet (entry not backfilled). The detail
   * page renders the token-card section only when this is present.
   */
  tokens?: ServiceTokens
}
