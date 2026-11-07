import { entriesOf, findKey, readFrontmatter, tokenText } from "./frontmatter"
import type { FrontmatterKey } from "./frontmatter"
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
//
// The frontmatter is read by the shared reader (`readFrontmatter`, ADR 0011),
// never by line patterns here: a row YAML reads is a row the sidecar gets,
// whatever its indent or key quoting. A value is read as `tokenText` gives it:
// YAML's string for text (quotes undone, a block scalar folded), trimmed, and
// the spelling as written for a number, because YAML turns `lineHeight: 1.50` into the
// number 1.5 while the sidecar carries `"1.50"` as written.

interface RawLine {
  key: string
  value: string
  /** A flow-list value (`[2, 4, 8]`), item by item. */
  items?: Array<string>
  note?: string
  group?: string
}

// ── Colors ────────────────────────────────────────────────────────────────

const COLOR_VALUE =
  /^(?:oklch|oklab|rgba?|hsla?|hwb|lab|lch|color)\(|^#[0-9a-fA-F]{3,8}$/

/** A reference row's value once YAML has undone its quotes: `{colors.x}`. */
const COLOR_REF = /^\{colors\.([^{}]+)\}$/

/** One `colors:` reference row that does not end at a colour. `kind` lets a
 *  caller leave a cause another check already names to that check: the draft
 *  gate blocks a missing key (`unresolved-token-ref`) and a non-colour row
 *  (`non-oklch-token-value`) on their own, but nothing else sees a loop. */
export interface ColorRefProblem {
  kind: "missing" | "loop" | "not-colour"
  message: string
}

/** Every reference row of one `colors:` map that does not end at a colour,
 *  gathered so one run names them all — a missing key early in the map must
 *  not hide a loop further down. */
export class ColorRefError extends Error {
  constructor(readonly problems: ReadonlyArray<ColorRefProblem>) {
    super(problems.map((p) => p.message).join("; "))
    this.name = "ColorRefError"
  }
}

/** The value the reference row `name` ends at, following references to
 *  references — or what stops it. A loop also carries its members, sorted, so
 *  the rows of one loop report it once between them; rows that run into the
 *  same missing key report the same message, which is kept once too. */
function resolveRef(
  valueOf: Map<string, string>,
  name: string,
  ref: string
): string | (ColorRefProblem & { loop?: string }) {
  const chain = [name]
  let from = name
  let key = ref
  for (;;) {
    const at = chain.indexOf(key)
    if (at !== -1) {
      return {
        kind: "loop",
        loop: chain.slice(at).sort().join(" "),
        message: `colors.${name} never reaches a colour: ${[...chain, key].join(" → ")} — point one row of the loop at a palette key that holds a colour`,
      }
    }
    chain.push(key)
    const value = valueOf.get(key)
    if (value === undefined) {
      return {
        kind: "missing",
        message: `colors.${from} points at colors.${key}, which colors: does not have — fix the name to the palette key it means`,
      }
    }
    const next = value.match(COLOR_REF)?.[1]
    if (next === undefined) {
      if (COLOR_VALUE.test(value)) return value
      return {
        kind: "not-colour",
        message: `colors.${name} ends at colors.${key}, whose value ${value} is not a colour — point it at a palette key that holds oklch(…)`,
      }
    }
    from = key
    key = next
  }
}

function parseColors(rows: Array<RawLine>): Array<ColorToken> {
  const valueOf = new Map(rows.map((r) => [r.key, r.value]))
  const out: Array<ColorToken> = []
  // Thrown, not skipped, once the map is read: a role left out of the sidecar
  // would pass `tokens:check`, which compares the sidecar with this output.
  const problems: Array<ColorRefProblem> = []
  const reported = new Set<string>()
  for (const r of rows) {
    // dark-* primitives ARE extracted so the sidecar holds the full palette and a
    // token copy can reproduce dark mode. The card VIEW filters them to light at
    // render time (token-curation.lightTokensOnly) — the light/full split lives
    // at the component boundary, not in the data.
    //
    // A reference row (`"{colors.x}"`) is a role naming a palette key. It is
    // carried with the colour it resolves to, so the role layer reaches the
    // sidecar and the Tokens tab instead of living only in the md.
    const ref = r.value.match(COLOR_REF)?.[1]
    const raw = ref === undefined ? r.value : resolveRef(valueOf, r.key, ref)
    if (typeof raw !== "string") {
      const once = raw.loop ?? raw.message
      if (!reported.has(once)) {
        reported.add(once)
        problems.push({ kind: raw.kind, message: raw.message })
      }
      continue
    }
    // Anything else this drops — a bare token name, a number, a named colour,
    // an upper-case function — the draft validator blocks in `colors:`
    // (`non-oklch-token-value`, #597), so it never ships.
    if (!COLOR_VALUE.test(raw)) continue
    // Collapse the author's column-alignment spaces (`0.000 0.000 0   / 0.08`)
    // so the machine-readable value is canonical. CSS color functions are
    // whitespace-insensitive, so this never changes the rendered color.
    const value = raw.replace(/\s+/g, " ")
    // `ref` goes last: JSON.stringify keeps insertion order, and a literal
    // token's bytes in the committed sidecars must not move.
    out.push(clean({ name: r.key, value, note: r.note, group: r.group, ref }))
  }
  if (problems.length > 0) throw new ColorRefError(problems)
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
    if (r.items) {
      for (const item of r.items) {
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
 *  Group and comment are told apart by the reader: a `## Brand` line restores
 *  the sidecar's `group`, a single `# …` is commentary the fences used to
 *  carry. They would otherwise be indistinguishable — krds has four such
 *  comments and no groups at all. */
function frontmatterRows(
  keys: Array<FrontmatterKey>,
  mapKey: string
): Array<RawLine> {
  const out: Array<RawLine> = []
  for (const row of entriesOf(findKey(keys, mapKey))) {
    const note = row.comment || undefined
    if (Array.isArray(row.value)) {
      out.push({
        key: row.key,
        value: "",
        items: row.value.map((item) => String(item)),
        note,
        group: row.group,
      })
      continue
    }
    // A nested map, a list or an empty row (`key:`) carries no value. The
    // trailing comment is already apart (`comment`), so a property copied from
    // the skeleton — which annotates these lines — never lands in the sidecar
    // as `56px   # 속성명은 …`.
    const value = tokenText(row)
    if (value === undefined) continue
    out.push({ key: row.key, value, note, group: row.group })
  }
  return out
}

/** Each typography style property the sidecar reads, and where its value
 *  lands in the token. `fontFamily` is not one: the sidecar has never carried
 *  it. */
const STYLE_PROPERTY_FIELDS: Record<
  string,
  (token: TypeToken, raw: string) => void
> = {
  fontSize: (token, raw) => {
    token.size = raw
  },
  fontWeight: (token, raw) => {
    token.weight = parseWeight(raw)
  },
  lineHeight: (token, raw) => {
    token.lineHeight = raw
  },
  letterSpacing: (token, raw) => {
    token.tracking = raw
  },
}

/** The style properties the sidecar reads — a style that sets none of them is
 *  not a type token. The draft validator's `typography-style-shape` judges a
 *  style by the same list. */
export const TYPE_STYLE_PROPERTIES: ReadonlyArray<string> = Object.keys(
  STYLE_PROPERTY_FIELDS
)

/** The text a style property row carries into the sidecar: undefined when the
 *  row is not one of `TYPE_STYLE_PROPERTIES` or sets no value. An empty row
 *  counts as unset, or `Number("")` would become a `fontWeight: 0` the spec
 *  linter then waves through. */
export function stylePropertyValue(row: FrontmatterKey): string | undefined {
  if (!Object.hasOwn(STYLE_PROPERTY_FIELDS, row.key)) return undefined
  const raw = tokenText(row)
  return raw === undefined || raw === "" ? undefined : raw
}

/** Typography is nested, so it is assembled here rather than from
 *  `frontmatterRows` — one style spans several lines. */
function frontmatterTypography(keys: Array<FrontmatterKey>): Array<TypeToken> {
  const out: Array<TypeToken> = []
  for (const head of entriesOf(findKey(keys, "typography"))) {
    const properties = entriesOf(head)
    // A style is a nested map, written as a block or inline
    // (`display-1: { fontSize: … }`) — YAML reads both alike.
    if (properties.length === 0) continue
    const current: TypeToken = { name: head.key }
    let read = false
    for (const row of properties) {
      // fontFamily is repeated on every entry because the spec has no
      // cross-group reference; the sidecar has never carried it, so it is read
      // and discarded rather than added to the shape the site consumes.
      const raw = stylePropertyValue(row)
      if (raw === undefined) continue
      STYLE_PROPERTY_FIELDS[row.key](current, raw)
      read = true
    }
    // Only a style with a readable property becomes a token. Counting the head
    // made an unreadable shape — a nested group, a style with only
    // `fontFamily`, a misspelt property — count as a token, so the skill's
    // zero-count guard saw a healthy number while `emitTypography` filtered
    // every one of them out.
    if (!read) continue
    // `note` goes on last because JSON.stringify serialises in insertion order
    // and the committed sidecars carry it last: `{name, size, weight, …,
    // note}`. `tokens:check` compares whole strings.
    if (head.comment) current.note = head.comment
    out.push(current)
  }
  return out
}

/**
 * Tokens for one catalog entry, read from its frontmatter token maps.
 *
 * Accepts a whole document; a document without a frontmatter block (no
 * opening or no closing `---`) yields empty arrays — the draft validator
 * reports that as `frontmatter-yaml-invalid`. The body is not read — see the
 * note at the top of this file.
 *
 * Throws when the frontmatter is not valid YAML, naming the line: a partial
 * read would be a sidecar `tokens:check` then confirms. The draft validator
 * reports the same input as `frontmatter-yaml-invalid`.
 *
 * Throws, too, when a `colors:` reference row does not end at a colour — a
 * missing key, a loop, a non-colour value — naming the row.
 */
export function extractTokensFromMarkdown(text: string): ServiceTokens {
  const read = readFrontmatter(text)
  if (!read.ok && read.reason === "missing") {
    return { colors: [], typography: [], spacing: [], radius: [] }
  }
  if (!read.ok) {
    const [first] = read.errors
    // YAML's own position counts from the block, not the file; `line` is the
    // file's, so the block-relative one is dropped rather than shown beside it.
    const message = first.message.replace(/ at line \d+, column \d+:?$/, "")
    throw new Error(
      `frontmatter is not readable YAML: ${message} (line ${first.line})`
    )
  }
  const { keys } = read

  // Elevation is not one of the four spec token maps (#421), so its sidecar key
  // is omitted rather than left empty when the entry publishes no shadow.
  const elevation = parseElevation(frontmatterRows(keys, "elevation"))
  return {
    colors: parseColors(frontmatterRows(keys, "colors")),
    typography: frontmatterTypography(keys),
    spacing: parseScale(frontmatterRows(keys, "spacing")),
    radius: parseScale(frontmatterRows(keys, "rounded")),
    ...(elevation.length > 0 ? { elevation } : {}),
  }
}
