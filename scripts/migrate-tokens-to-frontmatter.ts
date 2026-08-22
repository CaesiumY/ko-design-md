import fs from "node:fs"
import path from "node:path"
import { extractTokensFromMarkdown } from "../src/lib/token-extractor"
import { opensAnyTokenMap } from "../src/lib/frontmatter-map"
import {
  classify,
  fenceComments,
  fenceRows,
  resolvableNames,
} from "../src/lib/token-migration-rules"
import type { FenceRow } from "../src/lib/token-migration-rules"
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
// Everything the extractor does NOT put in a sidecar is at risk, because
// `tokens:check` compares sidecars and so cannot see it: 204 fence rows and 151
// comment-only lines. Those are classified in src/lib/token-migration-rules.ts
// and re-emitted here. A row with no destination stops the run.
//
//   pnpm tsx scripts/migrate-tokens-to-frontmatter.ts toss --dry
//   pnpm tsx scripts/migrate-tokens-to-frontmatter.ts --all

const SERVICES_DIR = path.resolve(process.cwd(), "services")
const TOKEN_SECTIONS = new Set(["Colors", "Typography", "Spacing", "Rounded"])

type Group = "colors" | "spacing" | "rounded"

function splitFrontmatter(raw: string): { fm: Array<string>; body: string } {
  const lines = raw.split("\n")
  if (lines[0]?.trim() !== "---") throw new Error("no frontmatter")
  const end = lines.indexOf("---", 1)
  if (end === -1) throw new Error("unterminated frontmatter")
  return { fm: lines.slice(1, end), body: lines.slice(end + 1).join("\n") }
}

/** Emit a token VALUE exactly as authored — never quoted.
 *
 *  Every gate that reads a token line requires the bare form: `OKLCH_DEFINITION`
 *  (oklch-sync.ts:41) and `allDefinitions` (oklch-drift.ts:95) both match
 *  `:\s+oklch\(`. Wrapping values in quotes drops `audit:oklch` from 918 judged
 *  comparisons to 0 and the drift gate from 1265 definitions to 0 — and BOTH
 *  still exit 0. Measured across the whole catalog. */
function value(v: string): string {
  // A value that is ALREADY a complete quoted scalar is passed through. It came
  // out of the body fence in that form, so it is emittable as-is — wrapping it
  // again left a literal quote at each end of the parsed string. That shipped:
  // 23 rows across four entries, invisible to every gate because the result is
  // still valid YAML and `fontFamily` is not a sidecar field.
  if (isCompleteQuotedScalar(v)) return v
  return needsQuoting(v) ? JSON.stringify(v) : v
}

/** `"…"` or `'…'` with the closing quote at the very end and none loose in the
 *  middle — i.e. the whole value is one already-encoded scalar. */
function isCompleteQuotedScalar(v: string): boolean {
  const q = v[0]
  if ((q !== '"' && q !== "'") || v.length < 2 || !v.endsWith(q)) return false
  for (let i = 1; i < v.length - 1; i++) {
    if (q === '"' && v[i] === "\\") {
      i++
      continue
    }
    if (q === "'" && v[i] === "'" && v[i + 1] === "'") {
      i++
      continue
    }
    if (v[i] === q) return false
  }
  return true
}

/**
 * Values YAML would misread as structure rather than text.
 *
 * The no-quoting rule above is about `oklch(…)` and dimensions, which the gates
 * match bare. It is NOT a rule about every value, and generalising it produced
 * two real parse failures that the byte-identity check could not see — that
 * check compares this emitter against this repo's own reader, so a shape both
 * agree on can still be invalid YAML. The official linter, a third parser,
 * is what surfaced them:
 *
 *   `fill-brand: {colors.red}`  → a flow MAPPING, so the value resolves to null
 *                                 and every reference errors (baemin 9,
 *                                 vapor-ui 76).
 *   `fontFamily: "Noto Sans KR", Roboto, …`
 *                               → a quoted scalar with trailing junk, which
 *                                 fails the whole frontmatter and takes every
 *                                 token with it (7 entries read as zero).
 *
 * Neither form is an `oklch(…)` value, so quoting them costs the gates nothing.
 */
function needsQuoting(v: string): boolean {
  if (v === "") return true
  if (/^[{[]/.test(v)) return true // flow mapping / sequence
  if (/^["'>|*&!%@`]/.test(v)) return true // quoted scalar, block, tag, anchor…
  if (/:\s/.test(v)) return true // reads as a nested key
  if (/\s#/.test(v)) return true // would open a comment
  return false
}

function key(name: string): string {
  return /^[A-Za-z_][\w-]*$/.test(name) ? name : JSON.stringify(name)
}

/** Pass the authored text through untouched. `String(Number("1.30"))` yields
 *  `"1.3"`, rewriting 30 of 219 lineHeight values and breaking the byte-identity
 *  that `pnpm tokens:check` compares. */
function lineHeight(raw: string): string {
  return raw.trim()
}

/** Comments indexed by the token they annotate, so they land back in place. */
function commentIndex(body: string): Map<string, Array<string>> {
  const index = new Map<string, Array<string>>()
  for (const c of fenceComments(body)) {
    if (c.beforeKey === null) continue
    const at = `${c.section} ${c.beforeKey}`
    const existing = index.get(at)
    if (existing) existing.push(c.text)
    else index.set(at, [c.text])
  }
  return index
}

interface Emission {
  groups: Record<Group, Array<string>>
  typography: Array<string>
  maps: Map<string, Array<string>>
  topLevel: Array<string>
  prose: Array<{ section: string; key: string; value: string; note?: string }>
}

function emptyEmission(): Emission {
  return {
    groups: { colors: [], spacing: [], rounded: [] },
    typography: [],
    maps: new Map(),
    topLevel: [],
    prose: [],
  }
}

function pushMap(e: Emission, map: string, line: string): void {
  const existing = e.maps.get(map)
  if (existing) existing.push(line)
  else e.maps.set(map, [line])
}

const SECTION_OF: Record<Group, string> = {
  colors: "Colors",
  spacing: "Spacing",
  rounded: "Rounded",
}

/** The token maps, with group dividers and the reclaimed fence comments. */
function emitScales(
  tokens: ServiceTokens,
  comments: Map<string, Array<string>>,
  e: Emission
): void {
  const scales: Array<
    [
      Group,
      ReadonlyArray<{
        name: string
        value: string
        note?: string
        group?: string
      }>,
    ]
  > = [
    ["colors", tokens.colors],
    ["spacing", tokens.spacing],
    ["rounded", tokens.radius],
  ]
  for (const [group, entries] of scales) {
    let heading: string | undefined
    const seen = new Set<string>()
    for (const entry of entries) {
      if (seen.has(entry.name)) continue
      seen.add(entry.name)
      if (entry.group && entry.group !== heading) {
        heading = entry.group
        // `##` marks a GROUP divider; a single `#` is a reclaimed fence comment.
        // Both are YAML comments, but the sidecar's `group` field has to be
        // rebuildable on read-back and the two are otherwise indistinguishable —
        // krds, for instance, has no groups at all and four `#` lines that are
        // pure commentary. The doubled hash also echoes the `### heading` this
        // group came from before the fences went away.
        e.groups[group].push(`  ## ${heading}`)
      }
      for (const text of comments.get(`${SECTION_OF[group]} ${entry.name}`) ??
        [])
        e.groups[group].push(`  # ${text}`)
      e.groups[group].push(
        `  ${key(entry.name)}: ${value(entry.value)}${entry.note ? `   # ${entry.note}` : ""}`
      )
    }
  }
}

function emitTypography(
  tokens: ServiceTokens,
  comments: Map<string, Array<string>>,
  fontFamily: string | undefined,
  e: Emission
): void {
  const usable = tokens.typography.filter(
    (t) => t.size || t.weight !== undefined || t.lineHeight || t.tracking
  )
  const seen = new Set<string>()
  for (const t of usable) {
    if (seen.has(t.name)) continue
    seen.add(t.name)
    for (const text of comments.get(`Typography ${t.name}`) ?? [])
      e.typography.push(`  # ${text}`)
    e.typography.push(`  ${key(t.name)}:${t.note ? `   # ${t.note}` : ""}`)
    // The spec has no cross-group reference, so a shared font stack cannot be
    // pointed at — it is repeated per entry. Verified: a `{fonts.sans}` from
    // inside `typography` resolves to nothing and the token vanishes silently.
    if (fontFamily) e.typography.push(`    fontFamily: ${value(fontFamily)}`)
    if (t.size) e.typography.push(`    fontSize: ${value(t.size)}`)
    if (t.weight !== undefined) e.typography.push(`    fontWeight: ${t.weight}`)
    if (t.lineHeight)
      e.typography.push(`    lineHeight: ${lineHeight(t.lineHeight)}`)
    if (t.tracking) e.typography.push(`    letterSpacing: ${value(t.tracking)}`)
  }
}

function placeLeftovers(
  slug: string,
  tokens: ServiceTokens,
  leftover: Array<FenceRow>,
  e: Emission
): string | undefined {
  const resolvable = resolvableNames(tokens, leftover)
  let fontFamily: string | undefined
  const unplaced: Array<string> = []

  for (const row of leftover) {
    const dest = classify(slug, row, resolvable)
    if (!dest) {
      unplaced.push(`${row.key}: ${row.value.slice(0, 60)}`)
      continue
    }
    const trail = row.note ? `   # ${row.note}` : ""
    switch (dest.kind) {
      case "reference":
        e.groups[dest.group].push(
          `  ${key(row.key)}: ${value(`{${dest.group}.${row.value.replace(/[{}]/g, "").split(".").pop() ?? ""}}`)}${trail}`
        )
        break
      case "theme-pair": {
        const [light, dark] = row.value.split("→").map((s) => s.trim())
        e.groups.colors.push(
          `  ${key(row.key)}: ${value(`{colors.${light}}`)}${trail}`
        )
        // The dark half is prose ("custom dark") on four vapor-ui rows whose
        // `## Known Gaps` states the value is unpublished. Inventing a `-dark`
        // key there would retract an absence claim on a value this catalog
        // synthesised itself.
        if (dest.darkResolves)
          e.groups.colors.push(
            `  ${key(`${row.key}-dark`)}: ${value(`{colors.${dark}}`)}`
          )
        break
      }
      case "catalog-map":
        pushMap(e, dest.map, `  ${key(row.key)}: ${value(row.value)}${trail}`)
        break
      case "catalog-key":
        e.topLevel.push(`${key(row.key)}: ${value(row.value)}${trail}`)
        break
      case "typography-property":
        fontFamily = row.value
        break
      case "prose":
        e.prose.push({
          section: row.section,
          key: row.key,
          value: row.value,
          note: row.note,
        })
        break
      case "drop":
        break
    }
  }

  if (unplaced.length > 0) {
    throw new Error(
      `${slug}: ${unplaced.length} row(s) have no destination — ${unplaced.join(", ")}. ` +
        `Classify them in src/lib/token-migration-rules.ts before migrating this entry.`
    )
  }
  return fontFamily
}

/** Drop the ```yaml fences in the four token sections, and any markdown table
 *  the extractor actually READ. A ```tsx or ```css block is an illustrative
 *  snippet and stays; so does every table it never read, which holds observed
 *  values rather than tokens.
 *
 *  Only `krds` has a table the extractor reads (its whole 12-entry type ramp
 *  comes from one, its Typography fence count being zero). Measured per entry
 *  by re-extracting with the table removed, so the rule generalises rather than
 *  naming a slug. */
function stripMigratedSources(
  body: string,
  stripTypographyTable: boolean
): string {
  const out: Array<string> = []
  let section: string | null = null
  let dropping = false
  for (const line of body.split("\n")) {
    const heading = line.match(/^##\s+(.*)$/)
    if (heading) section = heading[1].trim()
    const fence = line.match(/^```(\w*)/)
    if (fence && !dropping) {
      if (fence[1] === "yaml" && section && TOKEN_SECTIONS.has(section)) {
        dropping = true
        continue
      }
    } else if (fence && dropping) {
      dropping = false
      continue
    }
    if (dropping) continue
    if (stripTypographyTable && section === "Typography" && /^\s*\|/.test(line))
      continue
    out.push(line)
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n")
}

/** Rows with no schema slot, preserved verbatim under their section so nothing
 *  is lost mechanically. Turning them into readable prose is a separate,
 *  reviewable edit — a script should not invent sentences. */
function appendProse(body: string, prose: Emission["prose"]): string {
  if (prose.length === 0) return body
  const bySection = new Map<string, Array<string>>()
  for (const p of prose) {
    const line = `- \`${p.key}\`: ${p.value}${p.note ? ` — ${p.note}` : ""}`
    const existing = bySection.get(p.section)
    if (existing) existing.push(line)
    else bySection.set(p.section, [line])
  }
  const out: Array<string> = []
  const lines = body.split("\n")
  let section: string | null = null
  for (const line of lines) {
    const heading = line.match(/^##\s+(.*)$/)
    if (heading && section && bySection.has(section)) {
      out.push(
        "",
        `<!-- 이전 시 보존된 값. 산문으로 다듬을 것 — 이 주석이 남아 있으면 validate:catalog 가 block 한다. -->`,
        ...(bySection.get(section) ?? []),
        ""
      )
      bySection.delete(section)
    }
    if (heading) section = heading[1].trim()
    out.push(line)
  }
  if (section && bySection.has(section))
    out.push(
      "",
      `<!-- 이전 시 보존된 값. 산문으로 다듬을 것 — 이 주석이 남아 있으면 validate:catalog 가 block 한다. -->`,
      ...(bySection.get(section) ?? "")
    )
  return out.join("\n")
}

function migrate(slug: string, dry: boolean): void {
  // The slug reaches `path.join` from argv. A one-shot local script shares the
  // operator's trust boundary, but `..` in a slug would write outside
  // `services/` — cheaper to refuse than to reason about.
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`${slug}: slug must match /^[a-z0-9-]+$/`)
  }
  const file = path.join(SERVICES_DIR, `${slug}.md`)
  const raw = fs.readFileSync(file, "utf-8")
  const { fm, body } = splitFrontmatter(raw)

  // Refuse a second pass. Re-running is not destructive — the body has no token
  // fences left, so it reads as `c0/t0/s0/r0` — but that log looks exactly like
  // "this entry has no tokens", which is the alarm the counts exist to raise.
  // Say which it is instead of leaving the operator to guess.
  if (fm.some(opensAnyTokenMap)) {
    console.log(
      `${slug}: already migrated (frontmatter carries token maps) — skipped`
    )
    return
  }

  const tokens = extractTokensFromMarkdown(body)
  const known = new Set(
    [
      ...tokens.colors,
      ...tokens.typography,
      ...tokens.spacing,
      ...tokens.radius,
    ].map((t) => t.name)
  )
  const leftover = fenceRows(body).filter((r) => !known.has(r.key))

  const e = emptyEmission()
  const fontFamily = placeLeftovers(slug, tokens, leftover, e)
  const comments = commentIndex(body)
  emitScales(tokens, comments, e)
  emitTypography(tokens, comments, fontFamily, e)

  // A quoted key would be invisible to the gates' `^[ \t]*([a-z][\w-]*):`
  // pattern — harmless today because all 21 quoted keys are spacing/rounded,
  // silent data loss the moment a colour needs one.
  const quotedColor = e.groups.colors.find((l) => /^\s*"/.test(l))
  if (quotedColor)
    throw new Error(
      `${slug}: colors 맵에 따옴표 키가 있다 — ${quotedColor.trim()}`
    )

  const blocks: Array<string> = []
  if (e.groups.colors.length) blocks.push("colors:", ...e.groups.colors)
  if (e.typography.length) blocks.push("typography:", ...e.typography)
  if (e.groups.spacing.length) blocks.push("spacing:", ...e.groups.spacing)
  if (e.groups.rounded.length) blocks.push("rounded:", ...e.groups.rounded)
  for (const [map, lines] of e.maps) blocks.push(`${map}:`, ...lines)
  blocks.push(...e.topLevel)

  // Does a markdown table feed this entry's type ramp? Re-extract without it.
  const withoutTable = extractTokensFromMarkdown(
    body
      .split("\n")
      .filter((l, i, all) => {
        let sec: string | null = null
        for (let k = 0; k <= i; k++) {
          const h = all[k].match(/^##\s+(.*)$/)
          if (h) sec = h[1].trim()
        }
        return !(sec === "Typography" && /^\s*\|/.test(l))
      })
      .join("\n")
  )
  const tableFeedsTokens =
    withoutTable.typography.length < tokens.typography.length

  const nextBody = appendProse(
    stripMigratedSources(body, tableFeedsTokens),
    e.prose
  )
  const next = ["---", ...fm, ...blocks, "---", nextBody].join("\n")

  console.log(
    `${slug.padEnd(20)} c${tokens.colors.length}/t${tokens.typography.length}/` +
      `s${tokens.spacing.length}/r${tokens.radius.length}  ` +
      `주석 ${comments.size}  잔여 ${leftover.length}  ` +
      `맵 ${[...e.maps.keys()].join(",") || "-"}  ` +
      `산문 ${e.prose.length}${tableFeedsTokens ? "  표이전" : ""}`
  )

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
