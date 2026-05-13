import { previewSlugs } from "virtual:preview-manifest"
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

// A service has a preview when public/preview/{slug}/light.html exists. Vite
// disallows importing public assets, so vite.config.ts scans the public folder
// and exposes only the slug manifest through a virtual module.
const SLUGS_WITH_PREVIEW = new Set(previewSlugs)

export function getAllServices(): Array<ServiceDoc> {
  return DOCS
}

export function getServiceBySlug(slug: string): ServiceDoc | undefined {
  return BY_SLUG.get(slug)
}

export function hasPreview(slug: string): boolean {
  return SLUGS_WITH_PREVIEW.has(slug)
}

// Re-export so existing imports (tests, route head() callbacks) keep working
// without caring whether the helper lives in content-collection or content-parser.
export { truncateForMeta } from "./content-parser"
