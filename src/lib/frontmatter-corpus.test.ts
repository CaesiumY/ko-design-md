import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { isNode, isScalar, parseDocument } from "yaml"
import { entriesOf, findKey, readFrontmatter } from "./frontmatter"
import { splitFrontmatter } from "./frontmatter-fence"
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
  return entriesOf(findKey(keys, map))
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

/** Every non-test source file under `dir`. */
function sourceFiles(dir: string): Array<string> {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
      ? [path]
      : []
  })
}

/** The `src/` file an import specifier names, or null for a package. */
function resolveImport(from: string, specifier: string): string | null {
  const bare = specifier.replace(/\?.*$/, "")
  let base: string
  if (bare.startsWith("@/")) base = join(ROOT, "src", bare.slice(2))
  else if (bare.startsWith(".")) base = join(dirname(from), bare)
  else return null
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }
  return null
}

/** Every `src/` file the site's entry points reach through their imports. */
function siteReachable(): Set<string> {
  const SRC = join(ROOT, "src")
  const seen = new Set<string>()
  const queue = [
    join(SRC, "router.tsx"),
    join(SRC, "start.ts"),
    ...sourceFiles(join(SRC, "routes")),
  ]
  while (queue.length > 0) {
    const file = queue.pop() as string
    if (seen.has(file)) continue
    seen.add(file)
    const text = readFileSync(file, "utf8")
    for (const m of text.matchAll(
      /(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)["']([^"']+)["']/g
    )) {
      const target = resolveImport(file, m[1])
      if (target && !seen.has(target)) queue.push(target)
    }
  }
  return seen
}

describe("the frontmatter module's place", () => {
  // The site reads frontmatter in the browser too, and `yaml` costs ~29KB
  // gzip there (2026-10-03). The module runs at build time and in the tools;
  // the site gets its results, never the parser.
  //
  // "Site code" is what the site's entry points reach, not everything under
  // `src/`: the CI-only checks that move onto this module (the date check,
  // #588) live in `src/lib` too, and only `scripts/` imports them.
  it("is not reached from the site's entry points", () => {
    const reached = [...siteReachable()].map((path) =>
      path.slice(ROOT.length).replace(/\\/g, "/")
    )
    expect(reached).toContain("src/lib/content-parser.ts")
    expect(reached).not.toContain("src/lib/frontmatter.ts")
  })
})

describe("readFrontmatter on the catalogue", () => {
  it("reads every entry", () => {
    expect(SLUGS.length).toBeGreaterThan(0)
    for (const slug of SLUGS) expect(() => read(slug)).not.toThrow()
  })

  it.each(SLUGS)(
    "%s: top-level keys and values match an independent YAML reading",
    (slug) => {
      const raw = readFileSync(join(SERVICES, `${slug}.md`), "utf8")
      const yamlDoc = parseDocument(splitFrontmatter(raw)?.frontmatter ?? "")
      const items = (yamlDoc.contents as { items: Array<{ key: Node }> }).items
      const expected = items.map(({ key }) => {
        const name = isScalar(key) ? String(key.value) : String(key)
        // One key as YAML reads it on its own: the node, converted.
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
      const colors = sidecar(slug).colors
      for (const [token, row] of inOrder(colors, rows)) {
        // A reference row (`"{colors.x}"`) carries the key it names as `ref`
        // and, as its value, whatever the token it names carries (#626). The
        // pattern is written out rather than imported from the extractor, so a
        // misread there is not inherited here.
        const ref = collapsed(row)?.match(/^\{colors\.([^{}]+)\}$/)?.[1]
        expect(token).toEqual({
          name: row?.key,
          value:
            ref === undefined
              ? collapsed(row)
              : colors.find((c) => c.name === ref)?.value,
          ...(note(row) === undefined ? {} : { note: note(row) }),
          ...(row?.group === undefined ? {} : { group: row.group }),
          ...(ref === undefined ? {} : { ref }),
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
