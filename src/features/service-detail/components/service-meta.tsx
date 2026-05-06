import { Badge } from "@/components/ui/badge"
import { getCategoryStyle } from "@/lib/category-style"
import type { ServiceFrontmatter } from "@/lib/content-types"

interface Props {
  frontmatter: ServiceFrontmatter
}

export function ServiceMeta({ frontmatter }: Props) {
  const style = getCategoryStyle(frontmatter.category)
  return (
    <header className="border-b border-border/60 pb-8">
      <div className="flex flex-wrap items-center gap-3 text-meta-caps">
        <Badge variant="secondary" className="text-meta-caps !tracking-[0.16em]">
          {style.label}
        </Badge>
        {frontmatter.tier === 1 && <span>★ TIER 1 — SIGNATURE</span>}
        {frontmatter.last_updated && (
          <span className="tabular-nums">UPDATED · {frontmatter.last_updated}</span>
        )}
      </div>
      <h1 className="text-display mt-5 text-4xl font-black leading-[1.05] tracking-tighter sm:text-5xl">
        {frontmatter.name}
      </h1>
    </header>
  )
}
