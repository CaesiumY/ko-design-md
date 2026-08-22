import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { HomeHero } from "./-home/components/hero"
import { CategorySidebar } from "./-home/components/category-sidebar"
import { DesignSearch } from "./-home/components/design-search"
import { ServiceListRow } from "./-home/components/service-list-row"
import { useFilteredServices } from "./-home/hooks/use-filtered-services"
import type { Category } from "@/lib/content-types"
import { getAllServices } from "@/lib/content-collection"
import { CATEGORIES } from "@/lib/content-types"
import { buildHomeSeo } from "@/lib/seo"

interface HomeSearch {
  cat?: Category
  q?: string
}

// Which search params narrow the catalogue list, which is the question the home
// head's indexing policy turns on (issue #269).
//
// The annotation is the point of the map: `Record<keyof HomeSearch, boolean>`
// requires every key, so adding a param to `HomeSearch` is a compile error here
// until someone says whether it narrows. (An annotation rather than `satisfies`
// — the latter keeps the literal `true` types, which makes the `narrows` check
// below dead code.) Written as a bare `search.cat !== undefined || search.q !== undefined`
// the two would drift apart silently — the new param would just never be counted,
// and a filtered view would go on advertising itself as the canonical list.
// A param that changes the view without narrowing it gets `false` rather than an
// exemption from the map.
const NARROWS_MAP: Record<keyof HomeSearch, boolean> = {
  cat: true,
  q: true,
}

function isFiltered(search: HomeSearch): boolean {
  return Object.entries(NARROWS_MAP).some(
    ([key, narrows]) => narrows && search[key as keyof HomeSearch] !== undefined
  )
}

export const Route = createFileRoute("/")({
  // `validateSearch` below already normalizes an unknown `cat` and an empty `q`
  // to undefined, so those URLs are NOT filtered views and stay indexable —
  // they render the full list. Reading the validated search rather than the raw
  // query is what makes that true.
  head: ({ match }) => buildHomeSeo({ isFiltered: isFiltered(match.search) }),
  // eslint-disable-next-line no-restricted-syntax -- URL search params are untyped external input.
  validateSearch: (raw: Record<string, unknown>): HomeSearch => {
    const cat =
      typeof raw.cat === "string" &&
      (CATEGORIES as ReadonlyArray<string>).includes(raw.cat)
        ? (raw.cat as Category)
        : undefined
    const q = typeof raw.q === "string" && raw.q.length > 0 ? raw.q : undefined
    return { cat, q }
  },
  component: HomePage,
  loader: () => ({ services: getAllServices() }),
})

function HomePage() {
  const { services } = Route.useLoaderData()
  const filter = useFilteredServices(services)
  // Decide the Updated-badge reference time only after mount so SSR HTML and
  // the first hydration render agree (both render no badge). The badge fades
  // in on the next paint without a hydration warning.
  const [nowMs, setNowMs] = useState<number | null>(null)
  useEffect(() => {
    setNowMs(Date.now())
  }, [])

  return (
    <>
      <HomeHero />
      <section className="mx-auto max-w-[1400px] px-4 pb-32 sm:px-8">
        {services.length === 0 ? (
          <p className="py-16 text-sm text-muted-foreground">
            아직 추가된 design.md가 없습니다.{" "}
            <code className="bg-muted px-1.5 py-0.5 font-mono">services/</code>
            에 .md 파일을 추가해 보세요.
          </p>
        ) : (
          <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
            <aside className="mb-4 lg:sticky lg:top-14 lg:mb-0 lg:max-h-[calc(100svh-3.5rem)] lg:self-start lg:overflow-y-auto lg:pt-8">
              <CategorySidebar
                totalCount={filter.totalCount}
                counts={filter.counts}
                activeCategory={filter.activeCategory}
                onSelect={filter.setCategory}
              />
            </aside>

            <div className="lg:pt-8">
              <DesignSearch
                value={filter.query}
                onChange={filter.setQuery}
                className="mb-3"
              />

              <ColumnHeader />

              <div>
                {filter.filtered.length === 0 ? (
                  <p className="py-12 text-sm text-muted-foreground">
                    일치하는 design.md가 없습니다.
                  </p>
                ) : (
                  filter.filtered.map((doc, i) => (
                    <ServiceListRow
                      key={doc.frontmatter.slug}
                      doc={doc}
                      index={i + 1}
                      totalCount={filter.filtered.length}
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
      className="text-meta-caps hidden grid-cols-[40px_minmax(180px,220px)_1fr_56px_72px_72px] items-center gap-4 border-b px-6 py-2 lg:grid"
      style={{ borderColor: "var(--rule-strong)" }}
    >
      <span>#</span>
      <span>Design Systems</span>
      <span>Description</span>
      <span></span>
      <span className="text-right">Tokens</span>
      <span className="text-right">Added</span>
    </div>
  )
}
