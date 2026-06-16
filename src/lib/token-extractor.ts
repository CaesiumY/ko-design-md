import type {
  ColorToken,
  ServiceTokens,
  SpacingToken,
  TypeToken,
} from "./content-types"

// Heuristic token extractor — CODEGEN ONLY, never imported by the runtime.
//
// The catalog's `## Colors / ## Typography / ## Spacing / ## Rounded` sections
// are human-authored prose YAML, and every entry formats them a little
// differently (toss inline objects, socar slash ramps with absolute-px line
// heights, baemin compound slashes mixing px + ratio + font aliases, mixed
// bare/px/rem/% units). Rather than parse that variation at runtime forever,
// `scripts/build-tokens.ts` runs this once per entry to DRAFT a clean
// `{slug}.tokens.json`, which a human reviews before commit. The runtime then
// only reads that JSON (see content-collection.ts). So "best effort" here is
// fine: the human review is the final gate.

interface RawLine {
  key: string
  value: string
  note?: string
  group?: string
}

// Slice the lines belonging to a `## <heading>` block (until the next `## `).
function sliceSection(lines: Array<string>, heading: string): Array<string> {
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`)
  if (start === -1) return []
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      end = i
      break
    }
  }
  return lines.slice(start + 1, end)
}

// Split a trailing ` # comment` (whitespace + hash), preserving a `#` that is
// part of the value (hex) and the `/ a` alpha slash. Mirrors content-parser's
// stripInlineComment rule, where only a space-prefixed `#` opens a comment.
function splitInlineComment(rest: string): { value: string; note?: string } {
  const m = rest.match(/\s+#\s?(.*)$/)
  if (!m) return { value: rest.trim() }
  return {
    value: rest.slice(0, m.index).trim(),
    note: m[1].trim() || undefined,
  }
}

function cleanGroup(raw: string): string {
  return raw.replace(/\s*\(.*\)\s*$/, "").trim()
}

// Walk a section's lines and collect `key: value` rows found INSIDE ```yaml
// fences only, carrying the nearest preceding `### group` heading. Prose,
// comment-only lines, and non-yaml fences (```ts examples) are ignored.
function rawLines(sectionLines: Array<string>): Array<RawLine> {
  const out: Array<RawLine> = []
  let fence: "yaml" | "other" | null = null
  let group: string | undefined
  for (const line of sectionLines) {
    if (fence === "yaml") {
      if (/^```/.test(line)) {
        fence = null
        continue
      }
      const trimmed = line.trim()
      if (trimmed === "" || trimmed.startsWith("#")) continue
      const m = line.match(/^\s*([^:]+?):\s+(.*\S)\s*$/)
      if (!m) continue
      const { value, note } = splitInlineComment(m[2])
      out.push({ key: m[1].trim(), value, note, group })
      continue
    }
    if (fence === "other") {
      if (/^```/.test(line)) fence = null
      continue
    }
    const heading = line.match(/^###\s+(.+)$/)
    if (heading) {
      group = cleanGroup(heading[1])
      continue
    }
    if (/^```ya?ml\s*$/.test(line)) fence = "yaml"
    else if (/^```/.test(line)) fence = "other"
  }
  return out
}

// ── Colors ────────────────────────────────────────────────────────────────

const COLOR_VALUE = /^(?:oklch|oklab|rgba?|hsla?|hwb|lab|lch|color)\(|^#[0-9a-fA-F]{3,8}$/

function parseColors(rows: Array<RawLine>): Array<ColorToken> {
  const out: Array<ColorToken> = []
  for (const r of rows) {
    if (r.key.startsWith("dark-")) continue // dark-theme tokens — light palette only
    // Cards show visually-renderable colors only. Aliases (`{colors.x}` or a
    // bare token name) and numeric scalars (opacity) carry no swatch, so they
    // are excluded here and remain in the design.md prose.
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
    const d = dimension(r.value)
    if (d) out.push({ name: r.key, value: d.value, px: d.px })
  }
  return out
}

// ── Typography ──────────────────────────────────────────────────────────────

function normalizeSize(raw: string): string {
  const t = raw.trim()
  return /^\d+(?:\.\d+)?$/.test(t) ? `${t}px` : t
}

// Bare number < 4 reads as a unitless ratio (1.30); >= 4 reads as absolute px
// (socar authors line-height as "50" meaning 50px).
function normalizeLineHeight(raw: string): string {
  const m = raw.match(/^(\d+(?:\.\d+)?)(px)?$/)
  if (!m) return raw
  if (m[2]) return raw
  return Number(m[1]) < 4 ? m[1] : `${m[1]}px`
}

function isWeight(n: number): boolean {
  return n >= 100 && n <= 900 && n % 100 === 0
}

const NAMED_WEIGHTS: Record<string, number> = {
  thin: 100, extralight: 200, ultralight: 200, light: 300, regular: 400,
  normal: 400, book: 400, medium: 500, semibold: 600, demibold: 600,
  bold: 700, extrabold: 800, heavy: 800, black: 900,
}

function parseWeight(v: string): number | undefined {
  const n = Number(v)
  if (Number.isFinite(n)) return n
  return NAMED_WEIGHTS[v.toLowerCase().replace(/[\s_-]/g, "")]
}

// Some systems author size under a platform key instead of `size`
// (11st: `{ weight, android, ios }`). Probe these in priority order.
const PLATFORM_SIZE_KEYS = ["android", "pc", "web", "desktop", "default", "ios", "mobile"]

function parseTypeObject(value: string): Partial<TypeToken> {
  const out: Partial<TypeToken> = {}
  const platform: Record<string, string> = {}
  for (const part of value.slice(1, -1).split(",")) {
    const m = part.match(/^\s*([\w-]+)\s*:\s*(.+?)\s*$/)
    if (!m) continue
    const k = m[1].toLowerCase()
    const v = m[2].trim()
    if (k === "size" || k === "font-size") out.size = normalizeSize(v)
    else if (k === "line-height" || k === "lineheight") out.lineHeight = v
    else if (k === "tracking" || k === "letter-spacing") out.tracking = v
    else if (k === "weight" || k === "font-weight") out.weight = parseWeight(v)
    else platform[k] = v
  }
  if (out.size === undefined) {
    const key = PLATFORM_SIZE_KEYS.find((k) => platform[k] && /^\d/.test(platform[k]))
    if (key) out.size = normalizeSize(platform[key])
  }
  return out
}

function parseTypeSlash(value: string): Partial<TypeToken> {
  const out: Partial<TypeToken> = {}
  const notes: Array<string> = []
  for (const part of value.split("/").map((p) => p.trim()).filter(Boolean)) {
    const lh = part.match(/^line-height\s+(\S+)$/i)
    if (lh) {
      out.lineHeight = normalizeLineHeight(lh[1])
      continue
    }
    const tr = part.match(/^-?\d*\.?\d+em$/)
    if (tr && out.tracking === undefined) {
      out.tracking = part
      continue
    }
    const num = part.match(/^(\d+(?:\.\d+)?)(px|rem)?$/)
    if (num) {
      const n = Number(num[1])
      if (out.size === undefined) out.size = num[2] ? part : `${n}px`
      else if (isWeight(n) && out.weight === undefined) out.weight = n
      else if (out.lineHeight === undefined) out.lineHeight = normalizeLineHeight(part)
      else notes.push(part)
      continue
    }
    notes.push(part) // font family / role / color alias
  }
  if (notes.length) out.note = notes.join(" · ")
  return out
}

function parseType(row: RawLine): TypeToken | null {
  // Webfont source URLs (`font-display-src: https://…` or protocol-relative
  // `//cdn…`) live in the Typography yaml as the preview author's load target,
  // not as type-ramp tokens. Their `/`-laden URL would otherwise mis-parse
  // through parseTypeSlash (a numeric path segment like `/400/` could
  // masquerade as a size). Skip `*-src` keys and URL values. (parseColors and
  // parseScale need no such guard — COLOR_VALUE / dimension() already reject
  // non-color / non-dimension values.)
  if (/-src$/.test(row.key) || /^(?:https?:)?\/\//i.test(row.value)) return null
  const name = row.key.replace(/\s*\(.*\)\s*$/, "").trim()
  const parenNote = row.key.match(/\(([^)]*)\)/)?.[1]
  const value = row.value
  let parsed: Partial<TypeToken> | null = null
  if (value.startsWith("{") && value.endsWith("}")) parsed = parseTypeObject(value)
  else if (value.includes("/")) parsed = parseTypeSlash(value)
  if (!parsed || !parsed.size) return null // a ramp token must carry a size

  const note = [parenNote, parsed.note, row.note].filter(Boolean).join(" · ")
  return clean({
    name,
    size: parsed.size,
    weight: parsed.weight,
    lineHeight: parsed.lineHeight,
    tracking: parsed.tracking,
    note: note || undefined,
  })
}

function stripName(raw: string): string {
  return raw.replace(/\*\*/g, "").replace(/`/g, "").trim()
}

// Markdown table rows within a section (krds authors its type scale as a table
// instead of a yaml fence). Header and `---` separator rows fall out downstream
// because they carry no size-bearing cell.
function tableRows(
  sectionLines: Array<string>,
): Array<{ name: string; cells: Array<string> }> {
  const out: Array<{ name: string; cells: Array<string> }> = []
  for (const line of sectionLines) {
    const m = line.match(/^\s*\|(.+)\|\s*$/)
    if (!m) continue
    const cells = m[1].split("|").map((c) => c.trim())
    if (cells.every((c) => c === "" || /^:?-+:?$/.test(c))) continue // separator
    if (cells.length < 2) continue
    out.push({ name: stripName(cells[0]), cells: cells.slice(1) })
  }
  return out
}

// A standalone size token (bezier `font-size-11: 1.1rem`, seed `t10-size`).
function parseSizeOnly(row: RawLine): TypeToken | null {
  if (!/size/i.test(row.key)) return null
  if (!/^\d*\.?\d+(?:px|rem)$/.test(row.value)) return null
  return clean({
    name: row.key,
    size: normalizeSize(row.value),
    note: row.note || undefined,
  })
}

function parseTypography(
  rows: Array<RawLine>,
  tables: Array<{ name: string; cells: Array<string> }>,
): Array<TypeToken> {
  // Primary: object/slash ramps — the authored type styles.
  const primary: Array<TypeToken> = []
  for (const r of rows) {
    const t = parseType(r)
    if (t) primary.push(t)
  }
  if (primary.length > 0) return primary

  // Fallback (only when no ramp exists): entries that express type as a separate
  // size family or a markdown table. Gating on an empty ramp prevents a raw
  // `font-size-*` scale from doubling an already-present semantic ramp.
  const out: Array<TypeToken> = []
  const seen = new Set<string>()
  for (const r of rows) {
    const t = parseSizeOnly(r)
    if (t) {
      out.push(t)
      seen.add(t.name)
    }
  }
  for (const row of tables) {
    if (seen.has(row.name)) continue
    // The first cell carrying a size/slash is the type metric; commas inside it
    // (`64px / 1.3, -0.02em`) act like extra slash segments.
    const cell = row.cells.find((c) => /\d\s*px|\d\s*rem|\d\s*\/\s*\d/.test(c))
    if (!cell) continue
    // Strip markdown emphasis (`**bold**`, `` `code` ``), then treat commas like
    // extra slash segments (`64px / 1.3, -0.02em` → size / line-height / tracking).
    const parsed = parseTypeSlash(cell.replace(/[`*]/g, "").replace(/,/g, " / "))
    if (!parsed.size) continue
    out.push(
      clean({
        name: row.name,
        size: parsed.size,
        weight: parsed.weight,
        lineHeight: parsed.lineHeight,
        tracking: parsed.tracking,
        note: parsed.note || undefined,
      }),
    )
    seen.add(row.name)
  }
  return out
}

// Drop undefined-valued keys so the emitted JSON stays compact.
function clean<T extends Record<string, unknown>>(obj: T): T {
  for (const k of Object.keys(obj)) {
    if (obj[k] === undefined) delete obj[k]
  }
  return obj
}

export function extractTokensFromMarkdown(body: string): ServiceTokens {
  const lines = body.split(/\r?\n/)
  const typoLines = sliceSection(lines, "Typography")
  return {
    colors: parseColors(rawLines(sliceSection(lines, "Colors"))),
    typography: parseTypography(rawLines(typoLines), tableRows(typoLines)),
    spacing: parseScale(rawLines(sliceSection(lines, "Spacing"))),
    radius: parseScale(rawLines(sliceSection(lines, "Rounded"))),
  }
}
