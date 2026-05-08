import { useMemo } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import type { Category, ServiceDoc } from "@/lib/content-types"

export interface CategoryCount {
  category: Category
  count: number
}

interface UseFilteredServicesResult {
  filtered: Array<ServiceDoc>
  counts: Array<CategoryCount>
  totalCount: number
  activeCategory: Category | undefined
  setCategory: (next: Category | undefined) => void
  query: string
  setQuery: (next: string) => void
}

export function useFilteredServices(
  allServices: Array<ServiceDoc>,
): UseFilteredServicesResult {
  const search = useSearch({ from: "/" })
  const navigate = useNavigate()

  const activeCategory = search.cat
  const query = search.q ?? ""

  const setCategory = (next: Category | undefined) => {
    navigate({
      to: "/",
      search: { cat: next, q: query.length > 0 ? query : undefined },
      replace: true,
    })
  }

  const setQuery = (next: string) => {
    navigate({
      to: "/",
      search: {
        cat: activeCategory,
        q: next.length > 0 ? next : undefined,
      },
      replace: true,
    })
  }

  const counts = useMemo(() => {
    const map = new Map<Category, number>()
    for (const doc of allServices) {
      const c = doc.frontmatter.category
      map.set(c, (map.get(c) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([category, count]): CategoryCount => ({ category, count }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count
        return a.category.localeCompare(b.category)
      })
  }, [allServices])

  const filtered = useMemo(() => {
    const lowerQ = query.trim().toLowerCase()
    return allServices.filter((doc) => {
      if (activeCategory && doc.frontmatter.category !== activeCategory) {
        return false
      }
      if (lowerQ.length > 0) {
        const haystack = [
          doc.frontmatter.name,
          doc.frontmatter.slug,
          doc.tagline,
        ]
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(lowerQ)) return false
      }
      return true
    })
  }, [allServices, activeCategory, query])

  return {
    filtered,
    counts,
    totalCount: allServices.length,
    activeCategory,
    setCategory,
    query,
    setQuery,
  }
}
