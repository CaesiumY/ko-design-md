import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { HomeHero } from "@/features/home/components/hero"
import { CategorySidebar } from "@/features/home/components/category-sidebar"
import { DesignSearch } from "@/features/home/components/design-search"
import { ServiceListRow } from "@/features/home/components/service-list-row"
import { useFilteredServices } from "@/features/home/hooks/use-filtered-services"
import { getAllServices } from "@/lib/content-collection"
import { CATEGORIES, type Category } from "@/lib/content-types"

interface HomeSearch {
  cat?: Category
  q?: string
}

export const Route = createFileRoute("/")({
  validateSearch: (raw: Record<string, unknown>): HomeSearch => {
    const cat =
      typeof raw.cat === "string" &&
      (CATEGORIES as ReadonlyArray<string>).includes(raw.cat)
        ? (raw.cat as Category)
        : undefined
    const q =
      typeof raw.q === "string" && raw.q.length > 0 ? raw.q : undefined
    return { cat, q }
  },
  component: HomePage,
  loader: () => ({ services: getAllServices() }),
})

function HomePage() {
  const { services } = Route.useLoaderData()
  const filter = useFilteredServices(services)
  // Decide the NEW-badge reference time only after mount so SSR HTML and the
  // first hydration render agree (both render no NEW). The badge fades in on
  // the next paint without a hydration warning.
  const [nowMs, setNowMs] = useState<number | null>(null)
  useEffect(() => {
    setNowMs(Date.now())
  }, [])

  return (
    <>
      <HomeHero />
      <section className="mx-auto max-w-[1400px] px-4 pb-32 sm:px-8">
        {services.length === 0 ? (
          <p className="text-muted-foreground py-16 text-sm">
            아직 추가된 design.md가 없습니다.{" "}
            <code className="bg-muted px-1.5 py-0.5 font-mono">
              services/
            </code>
            에 .md 파일을 추가해 보세요.
          </p>
        ) : (
          <div className="md:grid md:grid-cols-[220px_1fr] md:gap-10">
            <aside className="mb-4 md:mb-0 md:pt-8">
              <CategorySidebar
                totalCount={filter.totalCount}
                counts={filter.counts}
                activeCategory={filter.activeCategory}
                onSelect={filter.setCategory}
              />
            </aside>

            <div className="md:pt-8">
              <DesignSearch
                value={filter.query}
                onChange={filter.setQuery}
                className="mb-3"
              />

              <ColumnHeader />

              <div>
                {filter.filtered.length === 0 ? (
                  <p className="text-muted-foreground py-12 text-sm">
                    일치하는 design.md가 없습니다.
                  </p>
                ) : (
                  filter.filtered.map((doc, i) => (
                    <ServiceListRow
                      key={doc.frontmatter.slug}
                      doc={doc}
                      index={i + 1}
                      nowMs={nowMs}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  )
}

function ColumnHeader() {
  return (
    <div
      className="text-meta-caps hidden grid-cols-[40px_minmax(180px,220px)_1fr_56px_72px_72px] items-center gap-4 border-b px-6 py-2 md:grid"
      style={{ borderColor: "var(--rule-strong)" }}
    >
      <span>#</span>
      <span>Design Systems</span>
      <span>Description</span>
      <span></span>
      <span className="text-right">Tokens</span>
      <span className="text-right">Updated</span>
    </div>
  )
}
