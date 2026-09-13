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
    // Unquote the name: `yamlKey` re-quotes one that needs it, and passing the
    // authored quotes through would publish `"\"3xl\""`.
    if (m) out.push([row.key.replace(/^(["'])(.*)\1$/, "$2"), m[1]])
  }
  return out
}

/** The trailing `# comment` of a frontmatter row, or undefined.
 *
 *  Read AFTER the authored scalar, so a `#` inside a quoted value (a font stack,
 *  a hex in a label) is never taken for one. A typography head row carries no
 *  scalar at all — its whole `rest` is the comment. */
function trailingComment(authored: string): string | undefined {
  // Trimmed here rather than trusted: `mapRows` happens to drop the space after
  // the colon, and `authoredScalar` only sees a quote in the first position.
  const rest = authored.trimStart()
  const tail = rest.startsWith("#")
    ? rest
    : rest.slice(authoredScalar(rest).length)
  const text = tail.match(/^\s*#\s?(.*)$/)?.[1].trim()
  return text ? text : undefined
}

/** Trailing comments of one frontmatter map's token rows, by token name.
 *
 *  CLAUDE.md makes this comment load-bearing: it is where an entry records what
 *  a token is for and where its value departs from the published one, and it is
 *  what the sidecar lifts into `note`. Rebuilding frontmatter from the sidecar
 *  dropped all of them — 1,479 across the catalog. Read from the source rows
 *  rather than the sidecar so aliases, which the sidecar never carries, keep
 *  theirs too. Emitting them changes nothing the linter reports: YAML comments
 *  never reach its model (measured 2026-09-13 on all 20 entries, #335). */
function sourceComments(raw: string, mapKey: string): Map<string, string> {
  const out = new Map<string, string>()
  const split = splitFrontmatter(raw)
  if (!split) return out
  for (const row of mapRows(split.frontmatter.split(/\r?\n/), mapKey)) {
    // A name that YAML needs quoted (`"2": 2px` in 11st's spacing) arrives with
    // its quotes, while callers look it up by the bare name `yamlKey` quotes.
    const key = row.key.replace(/^(["'])(.*)\1$/, "$2")
    if (row.indent !== 2 || out.has(key)) continue
    const comment = trailingComment(row.rest)
    if (comment) out.set(key, comment)
  }
  return out
}

function annotate(line: string, comment: string | undefined): string {
  return comment ? `${line}   # ${comment}` : line
}

function emitColors(tokens: ServiceTokens, raw: string): Array<string> {
  const aliases = referenceRows(raw, "colors")
  if (tokens.colors.length === 0 && aliases.length === 0) return []
  const comments = sourceComments(raw, "colors")
  const seen = new Set<string>()
  const lines = ["colors:"]
  for (const token of tokens.colors) {
    // A name declared twice (wanted's light/dark palettes share names) would
    // emit a duplicate yaml key and the later value would silently win. Keep
    // the first and drop the rest — the catalog's own `duplicate-token-value`
    // warn is where that ambiguity gets reported.
    if (seen.has(token.name)) continue
    seen.add(token.name)
    lines.push(
      annotate(
        `  ${yamlKey(token.name)}: ${yamlString(token.value)}`,
        comments.get(token.name) ?? token.note
      )
    )
  }
  for (const [name, ref] of aliases) {
    if (seen.has(name)) continue
    seen.add(name)
    lines.push(
      annotate(`  ${yamlKey(name)}: ${yamlString(ref)}`, comments.get(name))
    )
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
      out.push(
        annotate(
          `  ${yamlKey(row.key)}: ${authoredScalar(row.rest)}`,
          trailingComment(row.rest)
        )
      )
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
    // No source row to read: shadows come from body fences, so the sidecar's
    // note is the only place their comment survives.
    lines.push(
      annotate(
        `  ${yamlKey(token.name)}: ${yamlString(token.value)}`,
        token.note
      )
    )
  }
  return lines
}

function emitTypography(tokens: ServiceTokens, raw: string): Array<string> {
  const families = sourceFontFamilies(raw)
  const usable = tokens.typography.filter(
    (t) => t.size || t.weight !== undefined || t.lineHeight || t.tracking
  )
  if (usable.length === 0) return []
  const comments = sourceComments(raw, "typography")
  const seen = new Set<string>()
  const lines = ["typography:"]
  for (const token of usable) {
    if (seen.has(token.name)) continue
    seen.add(token.name)
    lines.push(
      annotate(
        `  ${yamlKey(token.name)}:`,
        comments.get(token.name) ?? token.note
      )
    )
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
  entries: ReadonlyArray<{ name: string; value: string; note?: string }>,
  raw: string
): Array<string> {
  const aliases = referenceRows(raw, key)
  if (entries.length === 0 && aliases.length === 0) return []
  const comments = sourceComments(raw, key)
  const seen = new Set<string>()
  const lines = [`${key}:`]
  for (const entry of entries) {
    if (seen.has(entry.name)) continue
    seen.add(entry.name)
    lines.push(
      annotate(
        `  ${yamlKey(entry.name)}: ${yamlString(entry.value)}`,
        comments.get(entry.name) ?? entry.note
      )
    )
  }
  for (const [name, ref] of aliases) {
    if (seen.has(name)) continue
    seen.add(name)
    lines.push(
      annotate(`  ${yamlKey(name)}: ${yamlString(ref)}`, comments.get(name))
    )
  }
  return lines
}

const YAML_TAG = /^ya?ml$/i
/** Any key row in a fence — nested properties and list items (`- name: x`)
 *  included. Deliberately wide: every key found can only make a fence look LESS
 *  published, so over-matching risks a duplicated block, never a dropped one.
 *  Under-matching is the dangerous direction, which is why `isPublished` keeps a
 *  fence it cannot read a single key from rather than calling it published. */
const FENCE_KEY = /^\s*(?:-\s+)?([A-Za-z_][\w-]*):(?:\s|$)/

/** Does the frontmatter's `elevation:` map already hold everything this fence
 *  defines?
 *
 *  Only when the fence names at least one key and every key it names is
 *  published. A fence of bare list values (`- 0 1px 2px`) names none, and
 *  "nothing to check" must not read as "nothing missing" — that would drop the
 *  whole fence, the loss #335 exists to stop. */
function isPublished(
  rows: ReadonlyArray<string>,
  published: ReadonlySet<string>
): boolean {
  const keys = rows.flatMap((row) => {
    const key = row.match(FENCE_KEY)?.[1]
    return key === undefined ? [] : [key]
  })
  return keys.length > 0 && keys.every((key) => published.has(key))
}

/**
 * YAML fences: drop the ones the frontmatter already publishes, keep the rest as
 * `text`. Every other fence passes through.
 *
 * YAML fences are the ones that break the lint: the linter merges frontmatter and
 * every body fence into ONE schema namespace, so a fence row is read as a
 * top-level key. `wanted` showed how badly — seven key names shared across its
 * twelve fences read as duplicate sections and zeroed the whole document. Non-YAML
 * fences do not do that, and it is measured rather than assumed — restoring the
 * `tsx`, `css` and unlabelled fences across all 17 entries left every error and
 * warning count unchanged.
 *
 * Stripping every YAML fence cost more than the collision it avoided. Shadows
 * come back as `elevation:`, but nothing carries motion tokens or component
 * specs, so 196 rows across ten entries vanished from this endpoint — `wanted`
 * alone lost 116. Re-tagged as `text` they reach the reader and stay invisible to
 * the linter: measured 2026-09-13 on all 20 entries, errors, warnings and
 * resolved tokens are identical to stripping (#335). A fence is still dropped
 * when it names at least one key and `elevation:` holds every one of them, so a
 * shadow does not appear twice. Shadows are the only body values the frontmatter
 * re-publishes, so the check reads that map alone: a flat set of every published
 * name let a component spec that reused an opacity name (`disabled`) pass as
 * published and vanish. The test is per key rather than per heading because toss keeps its
 * motion fence under `## Elevation & Depth`.
 *
 * An unclosed YAML fence withholds the rest of the document: nothing marks where
 * its rows end, so keeping it would pour prose into a fence. Other unclosed
 * fences pass their tail through — measured, not assumed: tsx/css/unlabelled all
 * do, yaml alone withholds it.
 */
function reconcileFences(body: string, published: ReadonlySet<string>): string {
  const out: Array<string> = []
  let fence: string | null = null
  let held: Array<string> = []
  for (const line of body.split(/\r?\n/)) {
    const marker = line.match(/^\s*```(\w*)/)
    if (marker) {
      // `marker[1]` is "" for an unlabelled fence, which `||` turns into the
      // placeholder; `??` would keep the empty string and read it as a tag.
      const tag: string = (fence ?? marker[1]) || "none"
      const opening: boolean = fence === null
      fence = opening ? tag : null
      if (!YAML_TAG.test(tag)) {
        out.push(line)
      } else if (opening) {
        held = [line]
      } else {
        const rows = held.slice(1)
        if (!isPublished(rows, published)) {
          out.push(held[0].replace(/```ya?ml/i, "```text"), ...rows, line)
        }
        held = []
      }
      continue
    }
    if (fence !== null && YAML_TAG.test(fence)) held.push(line)
    else out.push(line)
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

  const shadows = new Set((doc.tokens?.elevation ?? []).map((t) => t.name))
  const body = reconcileFences(doc.body, shadows)
  return `${frontmatter.join("\n")}\n\n${body}\n`
}
