import { splitFrontmatter } from "./content-parser"
import { authoredScalar, isHeadRow, mapRows } from "./frontmatter-map"
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
/** Reference-valued rows (`fill-brand: "{colors.blue-500}"`) read from the
 *  document's own frontmatter.
 *
 *  The sidecar cannot supply these: its parsers keep only literal values,
 *  because an alias has no swatch for the site's token cards. But the spec DOES
 *  resolve references, and the entries' prose cites them heavily — baemin names
 *  eight semantic colours this way and seed-design six spacing steps. Left out,
 *  this endpoint publishes prose whose references point at nothing. */
function referenceRows(raw: string, mapKey: string): Array<[string, string]> {
  const split = splitFrontmatter(raw)
  if (!split) return []
  const out: Array<[string, string]> = []
  const lines = split.frontmatter.split(/\r?\n/)
  for (const row of mapRows(lines, mapKey)) {
    // Drop the trailing comment first. Requiring end-of-line after the closing
    // quote silently skipped every annotated alias — all eight of baemin's
    // carry one, so that entire palette went missing from this endpoint.
    const value = row.rest.replace(/\s+#\s?.*$/, "").trim()
    const m = value.match(/^["']?(\{[^}]+\})["']?$/)
    if (m) out.push([row.key, m[1]])
  }
  return out
}

function emitColors(tokens: ServiceTokens, raw: string): Array<string> {
  const aliases = referenceRows(raw, "colors")
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

/** `fontFamily` per style, read from the source typography map.
 *
 *  The sidecar has never carried it — `ServiceTokens` has no field — but the
 *  migration put a structured `fontFamily` on 182 properties across 12 entries,
 *  so the value IS available now. It matters most for `wanted`, whose raw
 *  document the official linter reads as tokenless: this endpoint is the only
 *  place its 19 styles publish a font stack at all. */
function sourceFontFamilies(raw: string): Map<string, string> {
  const split = splitFrontmatter(raw)
  const out = new Map<string, string>()
  if (!split) return out
  const lines = split.frontmatter.split(/\r?\n/)
  let style: string | null = null
  for (const row of mapRows(lines, "typography")) {
    if (row.indent === 2) {
      style = isHeadRow(row) ? row.key : null
      continue
    }
    if (row.indent !== 4 || !style || row.key !== "fontFamily") continue
    out.set(style, authoredScalar(row.rest))
  }
  return out
}

/** Catalog-only frontmatter maps, copied through verbatim.
 *
 *  `fonts`, `gradients`, `opacity` and `grid` hold values the spec schema has
 *  no field for, so the sidecar never carried them and this adapter — which
 *  rebuilds frontmatter from the sidecar — dropped them. Eight entries use
 *  them and the surviving prose cites them, so the endpoint was publishing
 *  references to definitions it had just discarded. Rows go out as authored:
 *  re-encoding a scalar is what corrupted the font stacks once already. */
function emitAuxiliaryMaps(raw: string): Array<string> {
  const split = splitFrontmatter(raw)
  if (!split) return []
  const lines = split.frontmatter.split(/\r?\n/)
  const out: Array<string> = []
  for (const mapKey of ["fonts", "gradients", "opacity", "grid"]) {
    const rows = mapRows(lines, mapKey).filter((r) => r.rest.trim() !== "")
    if (rows.length === 0) continue
    out.push(`${mapKey}:`)
    for (const row of rows) {
      out.push(`  ${yamlKey(row.key)}: ${authoredScalar(row.rest)}`)
    }
  }
  return out
}

/** Shadow tokens. The spec model has no elevation category, so these resolve
 *  into nothing — but they lint clean, and publishing them is the difference
 *  between an endpoint whose Elevation prose names values and one whose prose
 *  points at tokens it never shows. 57 of them across 14 entries, and for
 *  several (vapor-ui among them) the stripped body fence was their ONLY
 *  definition. */
function emitElevation(tokens: ServiceTokens): Array<string> {
  const entries = tokens.elevation ?? []
  if (entries.length === 0) return []
  const seen = new Set<string>()
  const lines = ["elevation:"]
  for (const token of entries) {
    if (seen.has(token.name)) continue
    seen.add(token.name)
    lines.push(`  ${yamlKey(token.name)}: ${yamlString(token.value)}`)
  }
  return lines
}

function emitTypography(tokens: ServiceTokens, raw: string): Array<string> {
  const families = sourceFontFamilies(raw)
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
    const family = families.get(token.name)
    // Emitted VERBATIM: `family` is already the authored YAML scalar, quotes and
    // escapes intact. Re-encoding it is what corrupted 82 of these.
    if (family) lines.push(`    fontFamily: ${family}`)
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
  entries: ReadonlyArray<{ name: string; value: string }>,
  raw: string
): Array<string> {
  const aliases = referenceRows(raw, key)
  if (entries.length === 0 && aliases.length === 0) return []
  const seen = new Set<string>()
  const lines = [`${key}:`]
  for (const entry of entries) {
    if (seen.has(entry.name)) continue
    seen.add(entry.name)
    lines.push(`  ${yamlKey(entry.name)}: ${yamlString(entry.value)}`)
  }
  for (const [name, ref] of aliases) {
    if (seen.has(name)) continue
    seen.add(name)
    lines.push(`  ${yamlKey(name)}: ${yamlString(ref)}`)
  }
  return lines
}

/** Drop fenced code blocks. Their structured content is now in frontmatter, and
 *  leaving them in is exactly what makes a catalog entry un-lintable. Unclosed
 *  fences (a malformed entry) drop to end-of-document rather than leaking the
 *  rest of the body as prose. */
/**
 * Drops YAML fences only — every other fence stays.
 *
 * YAML fences are the ones that break the lint: the linter reads their rows as
 * top-level schema keys, which is how `wanted`'s component specs (each with a
 * column-0 `height:`) failed a whole document. Nothing else does that, and it is
 * measured rather than assumed — restoring the `tsx`, `css` and unlabelled
 * fences across all 17 entries left every error and warning count unchanged.
 *
 * Stripping them all cost the served endpoint 17-25% of each document: the
 * component snippets and specs that the `## Components` prose refers to. A
 * machine consumer reading this route got the prose and none of the code.
 */
function stripFencedBlocks(body: string): string {
  const out: Array<string> = []
  let fence: string | null = null
  const isYaml = (tag: string): boolean => /^ya?ml$/i.test(tag)
  for (const line of body.split(/\r?\n/)) {
    const marker = line.match(/^\s*```(\w*)/)
    if (marker) {
      // `marker[1]` is "" for an unlabelled fence, which `||` turns into the
      // placeholder; `??` would keep the empty string and read it as a tag.
      const tag: string = (fence ?? marker[1]) || "none"
      fence = fence === null ? tag : null
      if (!isYaml(tag)) out.push(line)
      continue
    }
    if (fence === null || !isYaml(fence)) out.push(line)
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
      ...emitTypography(tokens, doc.raw),
      ...emitScale("spacing", tokens.spacing, doc.raw),
      ...emitScale("rounded", tokens.radius, doc.raw),
      ...emitElevation(tokens)
    )
  }
  // Outside the sidecar branch on purpose: these maps are read from the source
  // frontmatter, so an entry that has no sidecar yet still publishes them.
  frontmatter.push(...emitAuxiliaryMaps(doc.raw))
  frontmatter.push("---")

  return `${frontmatter.join("\n")}\n\n${stripFencedBlocks(doc.body)}\n`
}
