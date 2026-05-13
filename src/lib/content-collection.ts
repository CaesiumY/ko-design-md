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
// expands this glob at build time, so the check is a synchronous Set lookup
// (no fs at runtime, no fetch round-trip). Authors flip a service into
// "preview-enabled" simply by adding the file. Keep the glob relative instead
// of `/public/...` so Vite does not warn about public assets being served from
// the root URL path.
const PREVIEW_LIGHT_FILES: Record<string, string> = import.meta.glob(
  "../../public/preview/*/light.html",
  { eager: true, query: "?raw", import: "default" },
)
const SLUGS_WITH_PREVIEW = new Set(
  Object.keys(PREVIEW_LIGHT_FILES)
    .map((path) => path.match(/\/preview\/([^/]+)\/light\.html$/)?.[1])
    .filter((slug): slug is string => Boolean(slug)),
)

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
