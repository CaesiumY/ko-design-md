import { Link } from "@tanstack/react-router"
import type { ServiceDoc } from "@/lib/content-types"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
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
      <p className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        아직 추가된 design.md가 없습니다. <code>services/</code>에 .md 파일을 추가해 보세요.
      </p>
    )
  }
  return (
    <section className="mx-auto max-w-6xl px-4 pb-32">
      <div className="mb-8 flex items-baseline justify-between border-b border-border/60 pb-4">
        <p className="text-meta-caps">
          CATALOG · {services.length} {services.length === 1 ? "ENTRY" : "ENTRIES"}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">tier · last updated</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((doc, i) => {
          const style = getCategoryStyle(doc.frontmatter.category)
          return (
            <Link
              key={doc.frontmatter.slug}
              to="/services/$slug"
              params={{ slug: doc.frontmatter.slug }}
              className="group block animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Card className="overflow-hidden p-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-foreground/40 group-hover:shadow-[0_8px_24px_-12px_oklch(0_0_0/0.25)]">
                <div
                  className={cn(
                    "bg-grain relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br",
                    style.coverGradient,
                  )}
                  aria-hidden
                >
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/30 to-transparent" />
                </div>
                <div className="flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className="text-meta-caps !tracking-[0.16em]"
                    >
                      {style.label}
                    </Badge>
                    {doc.frontmatter.tier === 1 && (
                      <span
                        className="text-meta-caps text-foreground"
                        aria-label="Tier 1 — Signature"
                      >
                        ★ TIER 1
                      </span>
                    )}
                  </div>
                  <h3 className="text-display text-xl font-bold tracking-tight">
                    {doc.frontmatter.name}
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {doc.tagline}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
                    <span
                      className="inline-block size-1.5 rounded-full bg-foreground/40"
                      aria-hidden
                    />
                    <span>{formatTokens(doc.estimatedTokens)} tokens</span>
                    {doc.frontmatter.last_updated && (
                      <>
                        <span aria-hidden>·</span>
                        <span>{doc.frontmatter.last_updated}</span>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
