import fs from "node:fs"
import path from "node:path"
import { extractTokensFromMarkdown } from "../src/lib/token-extractor"
import type { ServiceTokens } from "../src/lib/content-types"

// ONE-SHOT migration: move design tokens out of the body ```yaml fences and into
// YAML frontmatter, the location Google's published DESIGN.md spec expects.
//
// Values come from `extractTokensFromMarkdown` rather than a fresh parse of the
// fences. That function is 400 lines of heuristics for the per-entry format
// variation (toss inline objects, socar slash ramps, baemin compound slashes,
// mixed units) and is already the thing that produces the committed sidecars.
// Re-deriving that here would mean reimplementing it and getting the edge cases
// wrong; reusing it means the migration is correct exactly where the sidecars
// are, which `pnpm tokens:check` already proves.
//
// The sidecar is also how this script tells a token from an alias. Any fence row
// whose key is absent from the sidecar was deliberately skipped by the extractor
// — an alias (`fill-brand: blue-500`) or a webfont URL (`font-display-src:`).
// Those carry meaning and must not be dropped with the fence, so they are
// re-emitted: aliases as spec token references, webfont URLs as a catalog key.
//
//   pnpm tsx scripts/migrate-tokens-to-frontmatter.ts toss --dry
//   pnpm tsx scripts/migrate-tokens-to-frontmatter.ts --all

const SERVICES_DIR = path.resolve(process.cwd(), "services")
const TOKEN_SECTIONS = new Set(["Colors", "Typography", "Spacing", "Rounded"])

interface FenceRow {
  key: string
  value: string
  note?: string
}

/** Split `---\n…\n---\n` off the top. */
function splitFrontmatter(raw: string): { fm: Array<string>; body: string } {
  const lines = raw.split("\n")
  if (lines[0]?.trim() !== "---") throw new Error("no frontmatter")
  const end = lines.indexOf("---", 1)
  if (end === -1) throw new Error("unterminated frontmatter")
  return { fm: lines.slice(1, end), body: lines.slice(end + 1).join("\n") }
}

/** Trailing ` # comment`, keeping a `#` that belongs to the value (hex). */
function splitNote(rest: string): { value: string; note?: string } {
  const m = rest.match(/\s+#\s?(.*)$/)
  if (!m) return { value: rest.trim() }
  return {
    value: rest.slice(0, m.index).trim(),
    note: m[1].trim() || undefined,
  }
}

/** Every `key: value` row inside a ```yaml fence in the four token sections. */
function tokenFenceRows(body: string): Array<FenceRow> {
  const rows: Array<FenceRow> = []
  let section: string | null = null
  let fenceLang: string | null = null
  for (const line of body.split("\n")) {
    const heading = line.match(/^##\s+(.*)$/)
    if (heading) {
      section = heading[1].trim()
      continue
    }
    const fence = line.match(/^```(\w*)/)
    if (fence) {
      fenceLang = fenceLang === null ? fence[1] || "none" : null
      continue
    }
    if (
      fenceLang !== "yaml" ||
      section === null ||
      !TOKEN_SECTIONS.has(section)
    )
      continue
    const m = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.+)$/)
    if (!m) continue
    rows.push({ key: m[1], ...splitNote(m[2]) })
  }
  return rows
}

/** Drop only the ```yaml fences inside the four token sections. A ```tsx or
 *  ```css block is an illustrative snippet and stays; so does every table and
 *  paragraph, which hold observed values the extractor deliberately never read. */
function stripTokenFences(body: string): string {
  const out: Array<string> = []
  let section: string | null = null
  let dropping = false
  for (const line of body.split("\n")) {
    const heading = line.match(/^##\s+(.*)$/)
    if (heading) section = heading[1].trim()
    const fence = line.match(/^```(\w*)/)
    if (fence && !dropping) {
      const isTokenFence =
        fence[1] === "yaml" && section !== null && TOKEN_SECTIONS.has(section)
      if (isTokenFence) {
        dropping = true
        continue
      }
    } else if (fence && dropping) {
      dropping = false
      continue
    }
    if (!dropping) out.push(line)
  }
  return out.join("\n")
}

/** Emit a token VALUE exactly as authored — never quoted.
 *
 *  Every gate that reads a token line requires the bare form: `OKLCH_DEFINITION`
 *  (oklch-sync.ts:41) and `allDefinitions` (oklch-drift.ts:95) both match
 *  `:\s+oklch\(`. Wrapping the value in quotes drops `audit:oklch` from 918
 *  judged comparisons to 0 and the drift gate from 1265 definitions to 0 — and
 *  BOTH still exit 0. Measured across the whole catalog.
 *
 *  Quoting is also unnecessary: of 2,157 scalar token values in the committed
 *  sidecars, zero need YAML quoting. Only 21 KEYS do (11st's numeric spacing
 *  names, baemin's `2xl`/`3xl`), which `key()` handles. */
function value(v: string): string {
  return v
}

function key(name: string): string {
  return /^[A-Za-z_][\w-]*$/.test(name) ? name : JSON.stringify(name)
}

/** Pass the authored text through untouched.
 *
 *  `String(Number("1.30"))` yields `"1.3"`, which rewrites 30 of the catalog's
 *  219 lineHeight values and breaks the byte-identity that `pnpm tokens:check`
 *  compares. `1.30` is already a valid YAML float, so normalising buys nothing
 *  and costs the one check that proves this migration lost nothing. */
function lineHeight(raw: string): string {
  return raw.trim()
}

/** `name: value  # note`, with a `# Group` divider whenever the group changes. */
function scaleBlock(
  label: string,
  entries: ReadonlyArray<{
    name: string
    value: string
    note?: string
    group?: string
  }>,
  aliases: Array<FenceRow>
): Array<string> {
  if (entries.length === 0 && aliases.length === 0) return []
  const out = [`${label}:`]
  let group: string | undefined
  const seen = new Set<string>()
  for (const e of entries) {
    if (seen.has(e.name)) continue
    seen.add(e.name)
    if (e.group && e.group !== group) {
      group = e.group
      out.push(`  # ${group}`)
    }
    out.push(
      `  ${key(e.name)}: ${value(e.value)}${e.note ? `   # ${e.note}` : ""}`
    )
  }
  for (const a of aliases) {
    if (seen.has(a.key)) continue
    seen.add(a.key)
    out.push(
      `  ${key(a.key)}: ${value(`{${label}.${a.value}}`)}${a.note ? `   # ${a.note}` : ""}`
    )
  }
  return out
}

function typographyBlock(tokens: ServiceTokens): Array<string> {
  const usable = tokens.typography.filter(
    (t) => t.size || t.weight !== undefined || t.lineHeight || t.tracking
  )
  if (usable.length === 0) return []
  const out = ["typography:"]
  const seen = new Set<string>()
  for (const t of usable) {
    if (seen.has(t.name)) continue
    seen.add(t.name)
    out.push(`  ${key(t.name)}:${t.note ? `   # ${t.note}` : ""}`)
    if (t.size) out.push(`    fontSize: ${value(t.size)}`)
    if (t.weight !== undefined) out.push(`    fontWeight: ${t.weight}`)
    if (t.lineHeight) out.push(`    lineHeight: ${lineHeight(t.lineHeight)}`)
    if (t.tracking) out.push(`    letterSpacing: ${value(t.tracking)}`)
  }
  return out
}

function migrate(slug: string, dry: boolean): void {
  const file = path.join(SERVICES_DIR, `${slug}.md`)
  const raw = fs.readFileSync(file, "utf-8")
  const { fm, body } = splitFrontmatter(raw)

  const tokens = extractTokensFromMarkdown(body)
  const known = new Set([
    ...tokens.colors.map((t) => t.name),
    ...tokens.typography.map((t) => t.name),
    ...tokens.spacing.map((t) => t.name),
    ...tokens.radius.map((t) => t.name),
  ])
  const leftover = tokenFenceRows(body).filter((r) => !known.has(r.key))

  // A leftover row pointing at a bare token name is an alias; one holding a URL
  // is a webfont source, which the spec has no field for and which the preview
  // validator reads, so it becomes a catalog-only key.
  const webfonts = leftover.filter((r) => /^https?:\/\//.test(r.value))
  const aliases = leftover.filter((r) => !/^https?:\/\//.test(r.value))
  const aliasFor = (names: Set<string>) =>
    aliases.filter((a) =>
      names.has(a.value.replace(/[{}]/g, "").split(".").pop() ?? "")
    )

  const colorNames = new Set(tokens.colors.map((t) => t.name))
  const spacingNames = new Set(tokens.spacing.map((t) => t.name))
  const radiusNames = new Set(tokens.radius.map((t) => t.name))

  const blocks = [
    ...scaleBlock("colors", tokens.colors, aliasFor(colorNames)),
    ...typographyBlock(tokens),
    ...scaleBlock("spacing", tokens.spacing, aliasFor(spacingNames)),
    ...scaleBlock("rounded", tokens.radius, aliasFor(radiusNames)),
    ...webfonts.map((w) => `${w.key}: ${value(w.value)}`),
  ]

  const unplaced = aliases.filter(
    (a) =>
      !aliasFor(colorNames).includes(a) &&
      !aliasFor(spacingNames).includes(a) &&
      !aliasFor(radiusNames).includes(a)
  )

  const next = ["---", ...fm, ...blocks, "---", stripTokenFences(body)].join(
    "\n"
  )

  console.log(
    `${slug.padEnd(20)} colors=${tokens.colors.length} type=${tokens.typography.length} ` +
      `spacing=${tokens.spacing.length} rounded=${tokens.radius.length} ` +
      `alias=${aliases.length} webfont=${webfonts.length}` +
      (unplaced.length
        ? `  ⚠ 미배치 별칭 ${unplaced.length}: ${unplaced.map((u) => u.key).join(",")}`
        : "")
  )

  // An unplaced row is a row that would be DELETED with its fence. Refusing to
  // write is the whole safety property here: the sidecar comparison that proves
  // this migration lossless (`pnpm tokens:check`) is blind to these rows by
  // definition — they are exactly the ones the extractor never put in a sidecar.
  // So nothing downstream would notice their loss.
  if (unplaced.length > 0) {
    throw new Error(
      `${slug}: ${unplaced.length} row(s) have no destination — ` +
        `${unplaced.map((u) => u.key).join(", ")}. ` +
        `Classify them in the decision table before migrating this entry.`
    )
  }

  if (!dry) fs.writeFileSync(file, next)
}

function main() {
  const args = process.argv.slice(2)
  const dry = args.includes("--dry")
  const all = args.includes("--all")
  const slugs = all
    ? fs
        .readdirSync(SERVICES_DIR)
        .filter((f) => f.endsWith(".md"))
        .map((f) => f.replace(/\.md$/, ""))
        .sort()
    : args.filter((a) => !a.startsWith("--"))
  if (slugs.length === 0) {
    console.error(
      "usage: migrate-tokens-to-frontmatter.ts <slug…>|--all [--dry]"
    )
    process.exit(1)
  }
  for (const slug of slugs) migrate(slug, dry)
}

main()
