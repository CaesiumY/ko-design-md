import type { ServiceFrontmatter } from "@/lib/content-types"
import { getCategoryStyle } from "@/lib/category-style"

interface Props {
  frontmatter: ServiceFrontmatter
  tagline?: string
}

export function ServiceMeta({ frontmatter, tagline }: Props) {
  const meta = getCategoryStyle(frontmatter.category)
  return (
    <header
      className="border-b pb-8"
      style={{ borderColor: "var(--rule-strong)" }}
    >
      {/* Breadcrumb */}
      <div className="text-meta-caps flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
        <span>CATALOG</span>
        <span aria-hidden>/</span>
        <span className="text-brand font-bold">{meta.koIndex}.</span>
        <span>{meta.label.toUpperCase()}</span>
        {frontmatter.last_updated && (
          <span className="ml-auto tabular-nums">
            UPDATED · {frontmatter.last_updated}
          </span>
        )}
      </div>

      {/* Massive title */}
      <h1
        className="text-display mt-6 text-5xl font-black leading-[1.0] tracking-tighter sm:text-6xl lg:text-7xl"
        style={{ letterSpacing: "-0.06em" }}
      >
        {frontmatter.name}
      </h1>

      {frontmatter.design_system_name && (
        <p className="text-meta-caps text-muted-foreground mt-4">
          Design system ·{" "}
          <span className="text-foreground font-bold">
            {frontmatter.design_system_name}
          </span>
        </p>
      )}

      {tagline && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground sm:text-xl">
          {tagline}
        </p>
      )}
    </header>
  )
}
