import { stripQuotes } from "./content-parser"
import { isHeadRow, mapRows } from "./frontmatter-map"
import type {
  ColorToken,
  ElevationToken,
  ServiceTokens,
  SpacingToken,
  TypeToken,
} from "./content-types"

// Token extractor — CODEGEN ONLY, never imported by the runtime.
//
// It reads one input: the frontmatter token maps (`colors:` / `typography:` /
// `spacing:` / `rounded:` / `elevation:`). The body is never read (#429) —
// a token yaml fence in the body is blocked upstream (`token-fence`), and a
// type scale written only as a body table is blocked by `spec-no-typography`
// (a table beside a frontmatter `typography:` map is fine — it is prose). A
// second input would only be a second place to look when an entry reads zero
// tokens.
// `scripts/build-tokens.ts` runs this once per entry to write
// `{slug}.tokens.json`, and the runtime only reads that JSON (see
// content-collection.ts).

interface RawLine {
  key: string
  value: string
  note?: string
  group?: string
}

// Split a trailing ` # comment` (whitespace + hash), preserving a `#` that is
// part of the value (hex) and the `/ a` alpha slash. Mirrors content-parser's
// stripInlineComment rule, where only a space-prefixed `#` opens a comment.
function splitInlineComment(rest: string): { value: string; note?: string } {
  const m = rest.match(/\s+#\s?(.*)$/)
  if (!m) return { value: unquote(rest.trim()) }
  return {
    value: unquote(rest.slice(0, m.index).trim()),
    note: m[1].trim() || undefined,
  }
}

// Strip the YAML string quotes an author may wrap a value in (a shadow quoted
// so its commas don't read as flow syntax). Left in, a consumer pasting the
// value into CSS gets a broken declaration. Exactly ONE matching outer pair is
// removed: a doubly quoted value (`"'0 1px …'"`) keeps its inner pair. Any
// quoted value is blocked upstream by `quoted-token-value`, so this is a
// backstop for a single slip, not a normaliser for every quoting style.
//
// SHARED, not elevation-only: it is the only quote-stripping on the path every
// token row value takes (`splitInlineComment`; `frontmatterRows` strips only
// the key). It was added for shadows but applies catalogue-wide —
// measured when it landed, no existing category moved. Re-measure with
// `pnpm tokens:build --all` + `git diff` before widening it.
// `[^"]*` rather than `.*`: a greedy match on a value carrying two quoted
// items (`"Foo", "Bar"` — the shape a quoted font stack would take) strips the
// OUTER pair and leaves `Foo", "Bar`, silently corrupting it. Requiring no
// interior quote means only a genuinely wrapped value is unwrapped; anything
// else is left exactly as authored.
function unquote(value: string): string {
  const double = value.match(/^"([^"]*)"$/)
  if (double) return double[1]
  const single = value.match(/^'([^']*)'$/)
  if (single) return single[1]
  return value
}

// ── Colors ────────────────────────────────────────────────────────────────

const COLOR_VALUE =
  /^(?:oklch|oklab|rgba?|hsla?|hwb|lab|lch|color)\(|^#[0-9a-fA-F]{3,8}$/

function parseColors(rows: Array<RawLine>): Array<ColorToken> {
  const out: Array<ColorToken> = []
  for (const r of rows) {
    // dark-* primitives ARE extracted so the sidecar holds the full palette and a
    // token copy can reproduce dark mode. The card VIEW filters them to light at
    // render time (token-curation.lightColorsOnly) — the light/full split lives at
    // the component boundary, not in the data.
    //
    // Aliases (`{colors.x}` or a bare token name) and numeric scalars (opacity)
    // carry no swatch, so they are still excluded here and remain in the md prose.
    if (!COLOR_VALUE.test(r.value)) continue
    // Collapse the author's column-alignment spaces (`0.000 0.000 0   / 0.08`)
    // so the machine-readable value is canonical. CSS color functions are
    // whitespace-insensitive, so this never changes the rendered color.
    const value = r.value.replace(/\s+/g, " ")
    out.push(clean({ name: r.key, value, note: r.note, group: r.group }))
  }
  return out
}

// ── Spacing & Radius (identical shape) ──────────────────────────────────────

function dimension(value: string): { value: string; px: number | null } | null {
  let m = value.match(/^(\d+(?:\.\d+)?)px$/)
  if (m) return { value, px: Number(m[1]) }
  m = value.match(/^(\d+(?:\.\d+)?)$/)
  if (m) return { value: `${m[1]}px`, px: Number(m[1]) }
  m = value.match(/^(\d+(?:\.\d+)?)rem$/)
  if (m) return { value, px: Math.round(Number(m[1]) * 16 * 100) / 100 }
  m = value.match(/^(\d+(?:\.\d+)?)%$/)
  if (m) return { value, px: null }
  return null // non-dimensional (alias/keyword) → skip
}

function parseScale(rows: Array<RawLine>): Array<SpacingToken> {
  const out: Array<SpacingToken> = []
  for (const r of rows) {
    // YAML scale array (`spacing-scale: [2, 4, 8, ...]`) — expand each step into
    // its own token. The array carries no per-step names, so name by px value.
    const arr = r.value.match(/^\[(.+)\]$/)
    if (arr) {
      for (const item of arr[1].split(",")) {
        const d = dimension(item.trim())
        if (d) {
          out.push({
            name: d.px != null ? String(d.px) : item.trim(),
            value: d.value,
            px: d.px,
          })
        }
      }
      continue
    }
    // Keep the inline comment: a scale value can be inferred rather than
    // published (e.g. derived from a `*-radius-NN` naming convention), and the
    // card must not present that as a measured token. Array rows above carry no
    // per-step comment, so only the keyed form propagates a note.
    const d = dimension(r.value)
    if (d) out.push({ name: r.key, value: d.value, px: d.px, note: r.note })
  }
  return out
}

// ── Typography ──────────────────────────────────────────────────────────────

const NAMED_WEIGHTS: Record<string, number> = {
  thin: 100,
  extralight: 200,
  ultralight: 200,
  light: 300,
  regular: 400,
  normal: 400,
  book: 400,
  medium: 500,
  semibold: 600,
  demibold: 600,
  bold: 700,
  extrabold: 800,
  heavy: 800,
  black: 900,
}

function parseWeight(v: string): number | undefined {
  const n = Number(v)
  if (Number.isFinite(n)) return n
  return NAMED_WEIGHTS[v.toLowerCase().replace(/[\s_-]/g, "")]
}

// ── Elevation ─────────────────────────────────────────────────────────────
//
// Shadows come from the frontmatter `elevation:` map. When they lived in body
// fences, `## Elevation & Depth` also carried motion tokens and non-shadow maps
// (bezier's usage labels, class101's z-indices); those stayed in the body as
// `text` fences, but nothing stops an author from writing one into the map.
//
// So the filter is on the VALUE's shape, not the key name or the group: a row
// is a shadow when some comma-separated layer carries at least two lengths and
// a color. That keeps `0 -4px 8px oklch(...)` and multi-layer stacks while
// dropping `cubic-bezier(...)`, `120ms`, `1`, and prose.

const SHADOW_LENGTH = /(?:^|[\s(,])-?(?:\d*\.)?\d+(?:px|rem|em)?(?=[\s,)]|$)/g
const SHADOW_COLOR =
  /oklch\(|oklab\(|rgba?\(|hsla?\(|color-mix\(|#[0-9a-fA-F]{3,8}\b|var\(--/

// Split on commas that are not inside parentheses — `oklch(0 0 0 / .2), 0 1px…`
// must break into layers without cutting the color function apart.
function shadowLayers(value: string): Array<string> {
  const out: Array<string> = []
  let depth = 0
  let start = 0
  for (let i = 0; i < value.length; i++) {
    const c = value[i]
    if (c === "(") depth++
    else if (c === ")") depth--
    else if (c === "," && depth === 0) {
      out.push(value.slice(start, i))
      start = i + 1
    }
  }
  out.push(value.slice(start))
  return out
}

// Blank out `fn(...)` spans (one level of nesting is enough for
// `color-mix(in srgb, …)`) so the offsets are counted OUTSIDE the color.
// Without this a bare color — `scrim: oklch(0 0 0 / .32)` — reads as four
// lengths plus a color and passes as a shadow, landing an offset-less value in
// `style={{ boxShadow }}` that the browser silently ignores. Catalog token
// names like `press-overlay` and `scrim` are exactly the values that would sit
// in this section without being shadows.
const FUNCTION_CALL = /[a-zA-Z-]+\([^()]*(?:\([^()]*\)[^()]*)*\)/g

export function isShadowValue(value: string): boolean {
  const v = value.trim()
  if (v === "") return false
  // `none` counts only as the WHOLE value. A mixed `none, 0 1px 2px …` is
  // invalid CSS to begin with, so it is left to pass as a shadow with the
  // literal intact rather than given a branch that implies it is supported.
  if (v.toLowerCase() === "none") return true
  // Threshold is two offsets, which every real shadow carries (x + y). A
  // one-offset shorthand (`inset 2px oklch(…)`) would be missed — no entry
  // writes that, but if a new one lands with an unexpected `Ne` of 0, this
  // number is the first thing to check. The other way to land at 0 is a colour
  // SHADOW_COLOR does not name: CSS keywords (`transparent`, `currentColor`)
  // and named colours are absent because the catalogue is OKLCH-only, so a
  // `0 0 0 2px transparent` ring would drop out. Both are omissions, not
  // misreads — the token is skipped rather than emitted wrong.
  return shadowLayers(v).some((layer) => {
    if (!SHADOW_COLOR.test(layer)) return false
    const offsets = layer.replace(FUNCTION_CALL, " ")
    return (offsets.match(SHADOW_LENGTH) ?? []).length >= 2
  })
}

function parseElevation(rows: Array<RawLine>): Array<ElevationToken> {
  const out: Array<ElevationToken> = []
  for (const r of rows) {
    if (!isShadowValue(r.value)) continue
    // Collapse the author's column-alignment spaces the same way parseColors
    // does; CSS shadow syntax is whitespace-insensitive.
    out.push(
      clean({
        name: r.key,
        value: r.value.replace(/\s+/g, " "),
        note: r.note,
      })
    )
  }
  return out
}

// Drop undefined-valued keys so the emitted JSON stays compact.
function clean<T extends Record<string, string | number | undefined>>(
  obj: T
): T {
  for (const k of Object.keys(obj)) {
    if (obj[k] === undefined) delete obj[k]
  }
  return obj
}

/** One frontmatter token map, read as RawLines so the existing parsers derive
 *  everything (the `px` field, `%` handling, alias skipping).
 *
 *  Group and comment are told apart by the hash count: `## Brand` restores the
 *  sidecar's `group`, a single `# …` is commentary the fences used to carry.
 *  They would otherwise be indistinguishable — krds has four such comments and
 *  no groups at all. */
function frontmatterRows(fm: Array<string>, mapKey: string): Array<RawLine> {
  const out: Array<RawLine> = []
  for (const row of mapRows(fm, mapKey)) {
    // Two spaces only: that is the canonical token row, and anything deeper is a
    // shape `noncanonical-token-indent` blocks upstream rather than something to
    // guess at here.
    if (row.indent !== 2 || row.rest.trim() === "") continue
    const { value, note } = splitInlineComment(row.rest)
    out.push({
      key: stripQuotes(row.key),
      value,
      note,
      group: row.group,
    })
  }
  return out
}

/** Typography is nested, so it is assembled here rather than from
 *  `frontmatterRows` — one style spans several lines. */
function frontmatterTypography(fm: Array<string>): Array<TypeToken> {
  const out: Array<TypeToken> = []
  let current: TypeToken | null = null
  // `note` is applied only once an entry's properties are in, because
  // JSON.stringify serialises in insertion order and the committed sidecars
  // carry it last: `{name, size, weight, …, note}`. Setting it at the head line
  // — where the comment is actually read — produces the same values in a
  // different order, and `tokens:check` compares whole strings.
  let pendingNote: string | undefined
  let pushed = false

  const finish = () => {
    if (current && pendingNote !== undefined) current.note = pendingNote
    pendingNote = undefined
  }

  for (const row of mapRows(fm, "typography")) {
    // A head row opens a nested map: its value must be empty or a comment. The
    // inline flow form (`display-1: { size: … }`) is deliberately NOT accepted —
    // treating it as a head would mint a property-less token, and a non-zero
    // count is worse than a zero one here because the skill's own check looks
    // for zero.
    if (row.indent === 2) {
      if (!isHeadRow(row)) continue
      finish()
      current = { name: stripQuotes(row.key) }
      pushed = false
      const comment = row.rest.match(/^#\s?(.*)$/)
      pendingNote = comment?.[1].trim() || undefined
      continue
    }
    if (row.indent !== 4 || !current) continue
    // An empty property row carries no value. The previous reader's regex
    // required one; `mapRows` matches `rest === ""`, and without this guard
    // `Number("")` becomes a `fontWeight: 0` the spec linter then waves through.
    // The sibling reader `frontmatterRows` has had this guard all along.
    if (row.rest.trim() === "") continue
    // Strip the trailing comment, exactly as the colour rows do. Without this a
    // property copied from the skeleton — which annotates these lines — lands in
    // the sidecar as `56px   # 속성명은 …`: not a CSS value, but non-empty, so
    // the skill's zero-count guard and `tokens:check` both wave it through.
    const { value: raw } = splitInlineComment(row.rest)
    if (row.key === "fontSize") current.size = raw
    else if (row.key === "fontWeight") current.weight = parseWeight(raw)
    else if (row.key === "lineHeight") current.lineHeight = raw
    else if (row.key === "letterSpacing") current.tracking = raw
    else continue
    // Only now does the style become a token. Appending it at the head row made
    // an unreadable shape — a nested group, a style with only `fontFamily`, a
    // misspelt property — count as a token, so the skill's zero-count guard saw
    // a healthy number while `emitTypography` filtered every one of them out.
    if (!pushed) {
      out.push(current)
      pushed = true
    }
    // fontFamily is repeated on every entry because the spec has no
    // cross-group reference; the sidecar has never carried it, so it is read
    // and discarded rather than added to the shape the site consumes.
  }
  finish()
  return out
}

/**
 * Tokens for one catalog entry, read from its frontmatter token maps.
 *
 * Accepts a whole document; a document without frontmatter yields empty
 * arrays. The body is not read — see the note at the top of this file.
 */
export function extractTokensFromMarkdown(text: string): ServiceTokens {
  const lines = text.split(/\r?\n/)
  const fmEnd = lines[0]?.trim() === "---" ? lines.indexOf("---", 1) : -1
  const fm = fmEnd === -1 ? [] : lines.slice(1, fmEnd)

  // Elevation is not one of the four spec token maps (#421), so its sidecar key
  // is omitted rather than left empty when the entry publishes no shadow.
  const elevation = parseElevation(frontmatterRows(fm, "elevation"))
  return {
    colors: parseColors(frontmatterRows(fm, "colors")),
    typography: frontmatterTypography(fm),
    spacing: parseScale(frontmatterRows(fm, "spacing")),
    radius: parseScale(frontmatterRows(fm, "rounded")),
    ...(elevation.length > 0 ? { elevation } : {}),
  }
}
