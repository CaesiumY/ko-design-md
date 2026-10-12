// The catalog as the E2E suite expects to see it, read straight from
// services/*.md so no assertion hardcodes an entry count, an order or a
// category — a new entry must not break an unrelated smoke.
//
// The site's own module (src/lib/content-collection.ts) loads entries through
// Vite's import.meta.glob and cannot run in Playwright's plain Node, so this
// mirrors scripts/build-tokens.ts: fs + the shared parser.
//
// What is shared with the site and what is not: entries are read with the
// site's parser (`buildDoc`, which also derives each tagline) and category
// labels come from the site's `getCategoryStyle` — a regression in either moves
// these expectations with it, so this suite does not guard them (the parser has
// its own unit tests). The filtering is NOT shared: the rules below are written
// from what the home page promises (a category shows its entries; a search
// lists every entry whose name, design-system name, slug or tagline contains
// the query), never imported from the site's filter code — a test that reused
// it would pass along with any regression in it.
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { buildDoc } from "../../src/lib/content-parser"
import { getCategoryStyle } from "../../src/lib/category-style"
import type { ServiceDoc } from "../../src/lib/content-types"

const SERVICES_DIR = fileURLToPath(new URL("../../services", import.meta.url))

export const catalog: Array<ServiceDoc> = readdirSync(SERVICES_DIR)
  .filter((fileName) => fileName.endsWith(".md"))
  .map((fileName) =>
    // Same path shape as import.meta.glob so deriveSlug() agrees with the site.
    buildDoc(
      `/services/${fileName}`,
      readFileSync(join(SERVICES_DIR, fileName), "utf-8")
    )
  )

export function servicePath(doc: ServiceDoc): string {
  return `/services/${doc.frontmatter.slug}`
}

export function bySlug(slug: string): ServiceDoc {
  const doc = catalog.find((d) => d.frontmatter.slug === slug)
  if (!doc) throw new Error(`no catalog entry with slug "${slug}"`)
  return doc
}

export interface CategoryFacet {
  category: string
  /** The sidebar button's accessible name: Korean label + entry count. */
  buttonName: string
  docs: Array<ServiceDoc>
}

/** The category holding the most entries — the filter's least trivial case. */
export function largestCategory(): CategoryFacet {
  const groups = new Map<string, Array<ServiceDoc>>()
  for (const doc of catalog) {
    const category = doc.frontmatter.category
    groups.set(category, [...(groups.get(category) ?? []), doc])
  }
  const [category, docs] = [...groups.entries()].sort(
    ([a, aDocs], [b, bDocs]) =>
      bDocs.length - aDocs.length || a.localeCompare(b)
  )[0]
  return {
    category,
    buttonName: `${getCategoryStyle(category).koLabel} ${docs.length}`,
    docs,
  }
}

/**
 * Entries a search for `query` should list: those where at least one searched
 * field contains it, case-insensitively. Checked field by field, as the rule
 * reads — a query spanning two fields is not a promised match.
 */
export function searchMatches(query: string): Array<ServiceDoc> {
  const needle = query.trim().toLowerCase()
  return catalog.filter((doc) =>
    [
      doc.frontmatter.name,
      doc.frontmatter.design_system_name,
      doc.frontmatter.slug,
      doc.tagline,
    ].some((field) => field?.toLowerCase().includes(needle))
  )
}
