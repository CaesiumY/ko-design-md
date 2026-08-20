import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { extractTokensFromMarkdown } from "./token-extractor"
import { classify, resolvableNames } from "./token-migration-rules"
import type { FenceRow } from "./token-migration-rules"

const SERVICES = path.resolve(process.cwd(), "services")
const TOKEN_SECTIONS = new Set(["Colors", "Typography", "Spacing", "Rounded"])

/**
 * Fence rows from the four token sections, block scalars included.
 *
 * `font-sans: >` carries its value on the following indented lines. Reading
 * only the marker line loses the font stack entirely — which is exactly the
 * kind of silent deletion the classification exists to prevent.
 */
function fenceRows(body: string): Array<FenceRow> {
  const out: Array<FenceRow> = []
  const lines = body.split("\n")
  let section: string | null = null
  let fence: string | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const heading = line.match(/^##\s+(.*)$/)
    if (heading) {
      section = heading[1].trim()
      continue
    }
    const marker = line.match(/^```(\w*)/)
    if (marker) {
      fence = fence === null ? marker[1] || "none" : null
      continue
    }
    if (fence !== "yaml" || !section || !TOKEN_SECTIONS.has(section)) continue

    const m = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/)
    if (!m) continue

    let value = m[2].trim()
    let note: string | undefined
    if (value === ">" || value === "|") {
      const parts: Array<string> = []
      let j = i + 1
      while (
        j < lines.length &&
        /^\s+\S/.test(lines[j]) &&
        !/^```/.test(lines[j])
      ) {
        parts.push(lines[j].trim())
        j++
      }
      value = parts.join(" ")
      i = j - 1
    } else {
      const comment = value.match(/\s+#\s?(.*)$/)
      if (comment) {
        note = comment[1].trim()
        value = value.slice(0, comment.index).trim()
      }
    }
    out.push({ key: m[1], value, note, section })
  }
  return out
}

interface Classified {
  slug: string
  kinds: Record<string, number | undefined>
  unplaced: Array<string>
  darkGaps: Array<string>
}

function classifyCatalog(): Array<Classified> {
  return fs
    .readdirSync(SERVICES)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort()
    .map((f) => {
      const slug = f.replace(/\.md$/, "")
      const raw = fs.readFileSync(path.join(SERVICES, f), "utf-8")
      const lines = raw.split("\n")
      const body = lines.slice(lines.indexOf("---", 1) + 1).join("\n")
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
      const resolvable = resolvableNames(tokens, leftover)

      const kinds: Record<string, number | undefined> = {}
      const unplaced: Array<string> = []
      const darkGaps: Array<string> = []
      for (const row of leftover) {
        const dest = classify(slug, row, resolvable)
        if (!dest) {
          unplaced.push(`${row.key}: ${row.value.slice(0, 60)}`)
          continue
        }
        kinds[dest.kind] = (kinds[dest.kind] ?? 0) + 1
        if (dest.kind === "theme-pair" && !dest.darkResolves)
          darkGaps.push(row.key)
      }
      return { slug, kinds, unplaced, darkGaps }
    })
}

const catalog = classifyCatalog()

describe("token migration classification", () => {
  it("leaves no fence row without a destination", () => {
    // A row with no destination would be deleted along with its fence, and
    // nothing would notice: `tokens:check` compares sidecars, and these rows
    // are by definition the ones absent from them.
    const stranded = catalog
      .filter((c) => c.unplaced.length > 0)
      .map((c) => `${c.slug}: ${c.unplaced.join(" | ")}`)
    expect(stranded).toEqual([])
  })

  it("classifies the whole leftover set", () => {
    const totals: Record<string, number> = {}
    for (const c of catalog)
      for (const [k, v] of Object.entries(c.kinds))
        totals[k] = (totals[k] ?? 0) + (v ?? 0)
    const sum = Object.values(totals).reduce((a, b) => a + b, 0)
    expect(sum).toBe(204)
    expect(totals).toEqual({
      reference: 66,
      "theme-pair": 40,
      "catalog-map": 38,
      prose: 37,
      "typography-property": 12,
      drop: 8,
      "catalog-key": 3,
    })
  })

  it("drops only rows whose value provably survives elsewhere", () => {
    // Every other destination preserves the row. `drop` is the one that does
    // not, so the set is pinned by name: eight rows, each with a verified
    // duplicate (gmarket's named sizes match a ramp entry byte for byte;
    // 11st's spacing array is already expanded into its 19 members).
    const dropped = catalog.filter((c) => (c.kinds.drop ?? 0) > 0)
    expect(dropped.map((c) => `${c.slug}=${c.kinds.drop}`)).toEqual([
      "11st=1",
      "gmarket=7",
    ])
  })

  it("leaves vapor-ui's four unpublished dark values as a gap, not an invention", () => {
    // Their dark half is prose ("custom dark"), and that entry's `## Known
    // Gaps` states the value is unpublished. Filling it from the preview would
    // retract an absence claim on the strength of a value this catalog
    // synthesised itself.
    const gaps = catalog.flatMap((c) => c.darkGaps)
    expect(gaps).toEqual([
      "color-background-primary-100",
      "color-background-success-100",
      "color-background-warning-100",
      "color-background-danger-100",
    ])
  })
})
