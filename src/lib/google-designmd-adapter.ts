import { splitFrontmatter } from "./content-parser"
import { mapRows } from "./frontmatter-map"
import type { ServiceDoc, ServiceTokens } from "./content-types"

// Adapter: catalog entry -> Google DESIGN.md (format spec `alpha`,
// github.com/google-labs-code/design.md, Apache-2.0).
//
// WHY THIS EXISTS RATHER THAN LINTING services/*.md DIRECTLY.
// The official linter parses yaml fences in the BODY as top-level schema keys.
// Our token fences therefore surface as unknown keys, and every fence row whose
// value is a map (the typography scales, easing tables) trips
// `token-like-ignored` — measured at 13 findings on toss.md alone. Declaring the
// same tokens in frontmatter ADDS them to the model but does not silence the
// fences: they are still unknown top-level keys. So a catalog entry can never
// lint clean while it keeps the human-authored fences that are its source of
// record. This adapter resolves that by emitting the shape the spec actually
// describes — tokens in frontmatter, rationale in prose — leaving services/*.md
// untouched as the full-fidelity original.
//
// Pure string in / string out: no file IO, so it is unit-testable and can back
// both `pnpm validate:spec` and a future published /{slug}/DESIGN.md route.

/** Sections the spec names, in canonical order, with the aliases it accepts.
 *  Mirrors `packages/cli/src/linter/spec-config.yaml` of the spec repo. Kept
 *  here only to document the mapping — the linter owns enforcement, so this is
 *  never used to re-implement a rule. */
export const CANONICAL_SECTION_ALIASES: Readonly<Record<string, string>> = {
  "Brand & Style": "Overview",
  "Layout & Spacing": "Layout",
  Elevation: "Elevation & Depth",
}

/** A yaml fence line, opening or closing. */
const FENCE = /^\s*```/

/** Quote a scalar for a yaml value position. Token values carry parentheses,
 *  slashes and spaces (`oklch(0.298 0.1 22 / 0.32)`); quoting sidesteps every
 *  plain-scalar edge case at once. */
function yamlString(value: string): string {
  return JSON.stringify(value)
}

/** Emit a yaml key. Token names are `[a-z0-9-]` in practice, but a name that
 *  starts with a digit or holds a colon must be quoted to round-trip. */
function yamlKey(name: string): string {
  return /^[A-Za-z_][\w-]*$/.test(name) ? name : JSON.stringify(name)
}

/** `lineHeight` is authored either as a ratio ("1.30") or an absolute ("50px").
 *  The spec accepts `Dimension | number`, and a unitless ratio must be emitted
 *  as a NUMBER — quoted, it reads as a string with no unit and fails the model. */
function lineHeightLiteral(raw: string): string {
  const trimmed = raw.trim()
  return /^\d*\.?\d+$/.test(trimmed)
    ? String(Number(trimmed))
    : yamlString(trimmed)
}

/** Reference-valued colour rows (`fill-brand: "{colors.blue-500}"`) read from
 *  the document's own frontmatter.
 *
 *  The sidecar cannot supply these: `parseColors` keeps only literal colours,
 *  because an alias has no swatch for the site's token cards. But the spec DOES
 *  resolve references, and the entry's prose cites them heavily — toss alone
 *  refers to `{colors.fill-brand}` and friends throughout `## Components`. Left
 *  out, this endpoint publishes prose whose references point at nothing. */
function referenceColors(raw: string): Array<[string, string]> {
  const split = splitFrontmatter(raw)
  if (!split) return []
  const out: Array<[string, string]> = []
  const lines = split.frontmatter.split(/\r?\n/)
  for (const row of mapRows(lines, "colors")) {
    const m = row.rest.match(/^["']?(\{[^}]+\})["']?\s*$/)
    if (m) out.push([row.key, m[1]])
  }
  return out
}

function emitColors(tokens: ServiceTokens, raw: string): Array<string> {
  const aliases = referenceColors(raw)
  if (tokens.colors.length === 0 && aliases.length === 0) return []
  const seen = new Set<string>()
  const lines = ["colors:"]
  for (const token of tokens.colors) {
    // A name declared twice (wanted's light/dark palettes share names) would
    // emit a duplicate yaml key and the later value would silently win. Keep
    // the first and drop the rest — the catalog's own `duplicate-token-value`
    // warn is where that ambiguity gets reported.
    if (seen.has(token.name)) continue
    seen.add(token.name)
    lines.push(`  ${yamlKey(token.name)}: ${yamlString(token.value)}`)
  }
  for (const [name, ref] of aliases) {
    if (seen.has(name)) continue
    seen.add(name)
    lines.push(`  ${yamlKey(name)}: ${yamlString(ref)}`)
  }
  return lines
}

function emitTypography(tokens: ServiceTokens): Array<string> {
  const usable = tokens.typography.filter(
    (t) => t.size || t.weight !== undefined || t.lineHeight || t.tracking
  )
  if (usable.length === 0) return []
  const seen = new Set<string>()
  const lines = ["typography:"]
  for (const token of usable) {
    if (seen.has(token.name)) continue
    seen.add(token.name)
    lines.push(`  ${yamlKey(token.name)}:`)
    // `fontFamily` is deliberately absent: the extractor folds font family into
    // the free-text `note` rather than a structured field, so there is no
    // reliable value to emit. The spec does not require it.
    if (token.size) lines.push(`    fontSize: ${yamlString(token.size)}`)
    if (token.weight !== undefined)
      lines.push(`    fontWeight: ${token.weight}`)
    if (token.lineHeight)
      lines.push(`    lineHeight: ${lineHeightLiteral(token.lineHeight)}`)
    if (token.tracking)
      lines.push(`    letterSpacing: ${yamlString(token.tracking)}`)
  }
  return lines
}

function emitScale(
  key: "spacing" | "rounded",
  entries: ReadonlyArray<{ name: string; value: string }>
): Array<string> {
  if (entries.length === 0) return []
  const seen = new Set<string>()
  const lines = [`${key}:`]
  for (const entry of entries) {
    if (seen.has(entry.name)) continue
    seen.add(entry.name)
    lines.push(`  ${yamlKey(entry.name)}: ${yamlString(entry.value)}`)
  }
  return lines
}

/** Drop fenced code blocks. Their structured content is now in frontmatter, and
 *  leaving them in is exactly what makes a catalog entry un-lintable. Unclosed
 *  fences (a malformed entry) drop to end-of-document rather than leaking the
 *  rest of the body as prose. */
function stripFencedBlocks(body: string): string {
  const out: Array<string> = []
  let inFence = false
  for (const line of body.split(/\r?\n/)) {
    if (FENCE.test(line)) {
      inFence = !inFence
      continue
    }
    if (!inFence) out.push(line)
  }
  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/**
 * Render a catalog entry as a Google DESIGN.md document.
 *
 * Tokens come from the sidecar (`doc.tokens`), which `pnpm tokens:check` already
 * pins to the md body — so this adds no new drift axis. When an entry has no
 * sidecar the document is still emitted, just without token maps.
 */
export function toGoogleDesignMd(doc: ServiceDoc): string {
  const frontmatter: Array<string> = [
    "---",
    `name: ${yamlString(doc.frontmatter.name)}`,
  ]
  if (doc.tagline) frontmatter.push(`description: ${yamlString(doc.tagline)}`)

  const tokens = doc.tokens
  if (tokens) {
    frontmatter.push(
      ...emitColors(tokens, doc.raw),
      ...emitTypography(tokens),
      ...emitScale("spacing", tokens.spacing),
      ...emitScale("rounded", tokens.radius)
    )
  }
  frontmatter.push("---")

  return `${frontmatter.join("\n")}\n\n${stripFencedBlocks(doc.body)}\n`
}
