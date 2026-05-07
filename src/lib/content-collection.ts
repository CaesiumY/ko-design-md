import { buildDoc, sortDocs } from "./content-parser"
import type { ServiceDoc } from "./content-types"

const RAW_MODULES: Record<string, string> = import.meta.glob("/services/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
})

const DOCS: Array<ServiceDoc> = sortDocs(
  Object.entries(RAW_MODULES).map(([filePath, raw]) => buildDoc(filePath, raw)),
)

const BY_SLUG = new Map(DOCS.map((d) => [d.frontmatter.slug, d]))

export function getAllServices(): Array<ServiceDoc> {
  return DOCS
}

export function getServiceBySlug(slug: string): ServiceDoc | undefined {
  return BY_SLUG.get(slug)
}

// Re-export so existing imports (tests, route head() callbacks) keep working
// without caring whether the helper lives in content-collection or content-parser.
export { truncateForMeta } from "./content-parser"
