import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { isNode, isScalar, parseDocument } from "yaml"
import { splitFrontmatter } from "./content-parser"
import { readFrontmatter } from "./frontmatter"
import type { Node } from "yaml"
import type { FrontmatterEntryRow, FrontmatterKey } from "./frontmatter"
import type { ServiceTokens } from "./content-types"

// `frontmatter.test.ts` pins `readFrontmatter` on small documents. This file
// asks whether it agrees, entry by entry, with the two readers it is meant to
// replace — on the catalogue as it stands, which is the only input that can
// show a disagreement nobody thought to write a fixture for:
//
// - the YAML reading the draft validator does today (`parseDocument`, one key
//   converted at a time), for every top-level value;
// - the committed token sidecars (`services/*.tokens.json`), which the
//   line-based extractor wrote, for every token's name, value, note and group.
//
// The sidecar is a filtered projection (aliases, non-colours, non-dimensions
// and non-shadows are dropped; whitespace is collapsed), so the check runs one
// way: every sidecar token must be found, in order, among the module's rows.

const ROOT = fileURLToPath(new URL("../..", import.meta.url))
const SERVICES = join(ROOT, "services")

const SLUGS = readdirSync(SERVICES)
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.slice(0, -3))
  .sort()

function read(slug: string): Array<FrontmatterKey> {
  const result = readFrontmatter(
    readFileSync(join(SERVICES, `${slug}.md`), "utf8")
  )
  if (!result.ok) {
    throw new Error(`${slug}: ${JSON.stringify(result.errors)}`)
  }
  return result.keys
}

function sidecar(slug: string): ServiceTokens {
  return JSON.parse(
    readFileSync(join(SERVICES, `${slug}.tokens.json`), "utf8")
  ) as ServiceTokens
}

function entryRows(
  keys: Array<FrontmatterKey>,
  map: string
): Array<FrontmatterEntryRow> {
  const rows = keys.find((k) => k.key === map)?.rows ?? []
  return rows.filter((r): r is FrontmatterEntryRow => r.kind === "entry")
}

/** Each named token's row, matched in order — a token found out of order, or
 *  not at all, fails. */
function inOrder<T extends { name: string }>(
  tokens: ReadonlyArray<T>,
  rows: Array<FrontmatterEntryRow>
): Array<[T, FrontmatterEntryRow | undefined]> {
  let at = 0
  return tokens.map((token) => {
    while (at < rows.length && rows[at].key !== token.name) at++
    const row = rows[at]
    at++
    return [token, row]
  })
}

/** A comment as the sidecar's `note`: absent when there is no text. */
function note(row: FrontmatterEntryRow | undefined): string | undefined {
  return row?.comment === "" ? undefined : row?.comment
}

function collapsed(row: FrontmatterEntryRow | undefined): string | undefined {
  return typeof row?.value === "string"
    ? row.value.replace(/\s+/g, " ")
    : undefined
}

function prop(row: FrontmatterEntryRow | undefined, name: string) {
  return row?.rows?.find(
    (r): r is FrontmatterEntryRow => r.kind === "entry" && r.key === name
  )
}

/** Every non-test source file under `src/`. */
function sourceFiles(dir: string): Array<string> {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
      ? [path]
      : []
  })
}

describe("the frontmatter module's place", () => {
  // The site reads frontmatter in the browser too, and `yaml` costs ~29KB
  // gzip there (2026-10-03). The module runs at build time and in the tools;
  // the site gets its results, never the parser.
  it("is not imported by site code", () => {
    const importers = sourceFiles(join(ROOT, "src"))
      .filter((path) =>
        /from\s+["'](?:\.{1,2}\/(?:[\w.-]+\/)*|@\/lib\/)frontmatter["']/.test(
          readFileSync(path, "utf8")
        )
      )
      .map((path) => path.slice(ROOT.length))

    expect(importers).toEqual([])
  })
})

describe("readFrontmatter on the catalogue", () => {
  it("reads every entry", () => {
    expect(SLUGS.length).toBeGreaterThan(0)
    for (const slug of SLUGS) expect(() => read(slug)).not.toThrow()
  })

  it.each(SLUGS)(
    "%s: top-level keys and values match the validator's YAML reading",
    (slug) => {
      const raw = readFileSync(join(SERVICES, `${slug}.md`), "utf8")
      const yamlDoc = parseDocument(splitFrontmatter(raw)?.frontmatter ?? "")
      const items = (yamlDoc.contents as { items: Array<{ key: Node }> }).items
      const expected = items.map(({ key }) => {
        const name = isScalar(key) ? String(key.value) : String(key)
        // As the validator's `yamlValue` reads one key: the node, converted.
        const node = yamlDoc.get(name, true)
        return [name, isNode(node) ? node.toJS(yamlDoc) : null]
      })

      expect(read(slug).map((k) => [k.key, k.value])).toEqual(expected)
    }
  )

  it.each(SLUGS)(
    "%s: colour rows carry the sidecar's name, value, note and group",
    (slug) => {
      const rows = entryRows(read(slug), "colors")
      for (const [token, row] of inOrder(sidecar(slug).colors, rows)) {
        expect(token).toEqual({
          name: row?.key,
          value: collapsed(row),
          ...(note(row) === undefined ? {} : { note: note(row) }),
          ...(row?.group === undefined ? {} : { group: row.group }),
        })
      }
    }
  )

  // The sidecar's shadows carry no group (the extractor drops it), so only
  // name, value and note are compared.
  it.each(SLUGS)(
    "%s: shadow rows carry the sidecar's name, value and note",
    (slug) => {
      const rows = entryRows(read(slug), "elevation")
      for (const [token, row] of inOrder(sidecar(slug).elevation ?? [], rows)) {
        expect(token).toEqual({
          name: row?.key,
          value: collapsed(row),
          ...(note(row) === undefined ? {} : { note: note(row) }),
        })
      }
    }
  )

  it.each(SLUGS)(
    "%s: spacing and radius rows carry the sidecar's name, value and note",
    (slug) => {
      const keys = read(slug)
      const tokens = sidecar(slug)
      for (const [map, list] of [
        ["spacing", tokens.spacing],
        ["rounded", tokens.radius],
      ] as const) {
        for (const [token, row] of inOrder(list, entryRows(keys, map))) {
          expect(row?.key, `${map}.${token.name}`).toBe(token.name)
          // The sidecar writes a unitless number as px.
          expect([row?.source, `${row?.source}px`]).toContain(token.value)
          expect(note(row)).toBe(token.note)
        }
      }
    }
  )

  it.each(SLUGS)(
    "%s: typography styles carry the sidecar's name, note and properties",
    (slug) => {
      const keys = read(slug)
      for (const [token, row] of inOrder(
        sidecar(slug).typography,
        entryRows(keys, "typography")
      )) {
        expect(row?.key, token.name).toBe(token.name)
        expect(note(row)).toBe(token.note)
        expect(prop(row, "fontSize")?.source).toBe(token.size)
        expect(prop(row, "lineHeight")?.source).toBe(token.lineHeight)
        expect(prop(row, "letterSpacing")?.source).toBe(token.tracking)
        const weight = prop(row, "fontWeight")?.value
        if (typeof weight === "number") expect(weight).toBe(token.weight)
      }
    }
  )
})
