import type { Category } from "@/lib/content-types"
import { getCategoryStyle } from "@/lib/category-style"
import { cn } from "@/lib/utils"
import type { CategoryCount } from "../hooks/use-filtered-services"

interface Props {
  totalCount: number
  counts: Array<CategoryCount>
  activeCategory: Category | undefined
  onSelect: (next: Category | undefined) => void
}

interface ItemProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function SidebarItem({ label, count, active, onClick }: ItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group relative flex w-full items-baseline gap-3 px-3 py-2 text-left text-sm transition-colors",
        active
          ? "bg-secondary text-foreground font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
      )}
    >
      {active && (
        <span
          aria-hidden
          className="bg-brand absolute top-1.5 bottom-1.5 left-0 w-[3px]"
        />
      )}
      <span className="truncate">{label}</span>
      <span className="text-muted-foreground ml-auto text-xs tabular-nums">
        {count}
      </span>
    </button>
  )
}

interface ChipProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function CategoryChip({ label, count, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-baseline gap-1.5 border px-3 py-1.5 text-xs whitespace-nowrap transition-colors",
        active
          ? "border-foreground bg-foreground text-background font-semibold"
          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      <span>{label}</span>
      <span className="tabular-nums opacity-60">{count}</span>
    </button>
  )
}

export function CategorySidebar({
  totalCount,
  counts,
  activeCategory,
  onSelect,
}: Props) {
  const items = counts.map(({ category, count }) => ({
    category,
    count,
    label: getCategoryStyle(category).label,
  }))

  return (
    <>
      {/* Desktop: vertical sidebar */}
      <nav
        aria-label="Categories"
        className="hidden md:block"
      >
        <h2 className="text-meta-caps mb-3 px-3">Find Designs</h2>
        <ul>
          <li>
            <SidebarItem
              label="All"
              count={totalCount}
              active={activeCategory === undefined}
              onClick={() => onSelect(undefined)}
            />
          </li>
          {items.map(({ category, count, label }) => (
            <li key={category}>
              <SidebarItem
                label={label}
                count={count}
                active={activeCategory === category}
                onClick={() => onSelect(category)}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile: horizontal scrollable chip row */}
      <nav
        aria-label="Categories"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:hidden"
      >
        <CategoryChip
          label="All"
          count={totalCount}
          active={activeCategory === undefined}
          onClick={() => onSelect(undefined)}
        />
        {items.map(({ category, count, label }) => (
          <CategoryChip
            key={category}
            label={label}
            count={count}
            active={activeCategory === category}
            onClick={() => onSelect(category)}
          />
        ))}
      </nav>
    </>
  )
}
