import { Link } from "@tanstack/react-router"
import { ServiceLogo } from "./service-logo"
import type { ServiceDoc } from "@/lib/content-types"
import { cn } from "@/lib/utils"

interface Props {
  doc: ServiceDoc
  index: number
  totalCount: number
  /**
   * Wall-clock millis used for the NEW-badge cutoff. Pass `null` (or omit)
   * during SSR / first hydration render so the badge stays off — the parent
   * fills this in via `useEffect` after mount, avoiding hydration mismatch.
   */
  nowMs: number | null
}

const NEW_WINDOW_DAYS = 7

function formatTokensCompact(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

function formatShortDate(iso: string): string {
  if (!iso) return ""
  const parts = iso.split("-")
  if (parts.length !== 3) return iso
  return `${parts[1]}/${parts[2]}`
}

/**
 * Returns true when the catalog entry was touched within the recency window.
 * "Touched" covers both first-time publication and a later content sync — by
 * design we don't try to distinguish the two: a sync IS an update, and a new
 * entry IS the first update. One signal, one badge.
 */
export function isRecentServiceUpdate(
  iso: string,
  nowMs: number | null,
  windowDays = NEW_WINDOW_DAYS
): boolean {
  if (!iso || nowMs === null) return false
  const updated = new Date(iso)
  if (Number.isNaN(updated.getTime())) return false
  const ageMs = nowMs - updated.getTime()
  return ageMs >= 0 && ageMs <= windowDays * 24 * 60 * 60 * 1000
}

export function formatServiceListNumber(
  index: number,
  totalCount: number
): string {
  const targetLength = Math.max(2, String(totalCount).length)
  return String(totalCount - index + 1).padStart(targetLength, "0")
}

function UpdatedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center bg-brand px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-[0.12em] text-primary-foreground uppercase",
        className
      )}
    >
      Updated
    </span>
  )
}

export function ServiceListRow({ doc, index, totalCount, nowMs }: Props) {
  const { name, slug, logo, last_updated } = doc.frontmatter
  const tokens = formatTokensCompact(doc.estimatedTokens)
  const date = formatShortDate(last_updated)
  const isUpdated = isRecentServiceUpdate(last_updated, nowMs)
  const pageNo = formatServiceListNumber(index, totalCount)

  return (
    <Link
      to="/services/$slug"
      params={{ slug }}
      search={{ tab: "preview" }}
      className="group block border-b transition-colors hover:bg-secondary/60"
      style={{ borderColor: "var(--rule-strong)" }}
    >
      {/* Desktop: single-row 6-col grid */}
      <div
        className={cn(
          "hidden items-center gap-4 px-6 py-3 lg:grid",
          "lg:grid-cols-[40px_minmax(180px,220px)_1fr_56px_72px_72px]"
        )}
      >
        <span className="text-xs text-muted-foreground tabular-nums">
          {pageNo}
        </span>
        <span className="flex min-w-0 items-center gap-2.5">
          <ServiceLogo name={name} logo={logo} size={24} />
          <span className="truncate text-sm font-semibold tracking-tight">
            {name}
          </span>
        </span>
        <span className="min-w-0 truncate text-sm text-muted-foreground">
          {doc.tagline}
        </span>
        <span className="flex items-center">
          {isUpdated && <UpdatedBadge />}
        </span>
        <span className="text-right text-sm tabular-nums">{tokens}</span>
        <span className="text-right text-xs text-muted-foreground tabular-nums">
          {date}
        </span>
      </div>

      {/* Mobile: 2-line stacked layout */}
      <div className="px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <ServiceLogo name={name} logo={logo} size={24} />
          <span className="truncate text-sm font-semibold tracking-tight">
            {name}
          </span>
          {isUpdated && <UpdatedBadge />}
          <span className="ml-auto flex shrink-0 items-baseline gap-1.5 text-xs text-muted-foreground tabular-nums">
            <span>{tokens}</span>
            {date && (
              <>
                <span aria-hidden>·</span>
                <span>{date}</span>
              </>
            )}
          </span>
        </div>
        {doc.tagline && (
          <p className="mt-1 truncate pl-[34px] text-xs text-muted-foreground">
            {doc.tagline}
          </p>
        )}
      </div>
    </Link>
  )
}
