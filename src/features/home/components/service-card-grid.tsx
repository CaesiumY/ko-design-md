import { Link } from "@tanstack/react-router"
import type { ServiceDoc } from "@/lib/content-types"
import { getCategoryStyle } from "@/lib/category-style"

interface Props {
  services: Array<ServiceDoc>
}

function formatTokens(n: number): string {
  if (n >= 1000) return `~${(n / 1000).toFixed(1)}k`
  return `~${n}`
}

export function ServiceCardGrid({ services }: Props) {
  if (services.length === 0) {
    return (
      <p className="mx-auto max-w-[1400px] px-8 py-16 text-sm text-muted-foreground">
        아직 추가된 design.md가 없습니다.{" "}
        <code className="bg-muted px-1.5 py-0.5 font-mono">services/</code>에 .md 파일을 추가해 보세요.
      </p>
    )
  }

  return (
    <section className="mx-auto max-w-[1400px] px-8 pb-32">
      {/* TOC strip */}
      <div
        className="flex flex-wrap items-baseline gap-x-7 gap-y-3 border-b pt-8 pb-7"
        style={{ borderColor: "var(--rule-strong)" }}
      >
        <span className="text-meta-caps">Contents</span>
        <span className="ml-auto text-meta-caps tabular-nums">
          {services.length} {services.length === 1 ? "ENTRY" : "ENTRIES"}
        </span>
      </div>

      {/* List rows */}
      <div>
        {services.map((doc, i) => {
          const meta = getCategoryStyle(doc.frontmatter.category)
          const pageNo = String(i + 1).padStart(2, "0")
          return (
            <Link
              key={doc.frontmatter.slug}
              to="/services/$slug"
              params={{ slug: doc.frontmatter.slug }}
              className="group animate-fade-in-up block border-b transition-colors hover:bg-secondary/60"
              style={{
                animationDelay: `${i * 60}ms`,
                borderColor: "var(--rule-strong)",
              }}
            >
              <div className="grid grid-cols-1 items-start gap-6 py-12 sm:py-14 md:grid-cols-[200px_1fr_60px] md:gap-12">
                {/* Page number */}
                <div
                  className="text-display-massive text-ghost group-hover:text-brand select-none transition-colors duration-300"
                  style={{
                    fontSize: "clamp(4rem, 8.5vw, 7rem)",
                    lineHeight: 0.9,
                  }}
                  aria-hidden
                >
                  {pageNo}
                </div>

                {/* Body */}
                <div className="min-w-0">
                  <div className="mb-4 inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-medium tracking-wide">
                    <span className="hangul-idx text-base">{meta.koIndex}.</span>
                    <span>{meta.label.toUpperCase()}</span>
                  </div>
                  <h3 className="text-display mb-3.5 text-3xl font-black leading-[1.05] sm:text-4xl lg:text-5xl">
                    {doc.frontmatter.name}
                  </h3>
                  <p className="mb-4 max-w-[540px] text-base leading-relaxed">
                    {doc.tagline}
                  </p>
                  <div className="flex gap-4 text-xs tracking-wide tabular-nums text-muted-foreground">
                    <span>{formatTokens(doc.estimatedTokens)} tokens</span>
                    {doc.frontmatter.last_updated && (
                      <span>{doc.frontmatter.last_updated}</span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <span
                  className="group-hover:text-brand hidden self-center text-3xl font-light transition-all duration-300 group-hover:translate-x-2 md:block"
                  aria-hidden
                >
                  →
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
