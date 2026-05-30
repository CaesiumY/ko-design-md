import { ViewCountBadge } from "./view-count-badge"
import type { ServiceFrontmatter } from "@/lib/content-types"
import { getCategoryStyle } from "@/lib/category-style"

// The detail header's breadcrumb / meta row. Extracted from ServiceMeta so the
// right-aligned meta group (view-count badge + last-updated) can be tested in
// isolation without rendering the logo + title block.
export function ServiceMetaBar({
  frontmatter,
}: {
  frontmatter: ServiceFrontmatter
}) {
  const meta = getCategoryStyle(frontmatter.category)
  return (
    <div className="text-meta-caps flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
      <span>CATALOG</span>
      <span aria-hidden>/</span>
      <span className="text-brand font-bold">{meta.koIndex}.</span>
      <span>{meta.label.toUpperCase()}</span>
      <span className="ml-auto flex items-center gap-x-3">
        <ViewCountBadge slug={frontmatter.slug} />
        {frontmatter.last_updated && (
          <span className="tabular-nums">
            UPDATED · {frontmatter.last_updated}
          </span>
        )}
      </span>
    </div>
  )
}
