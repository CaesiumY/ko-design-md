import { Link } from "@tanstack/react-router"
import { ServiceLogo } from "./service-logo"
import type { ServiceDoc, ServiceFrontmatter } from "@/lib/content-types"
import { cn } from "@/lib/utils"

interface Props {
  doc: ServiceDoc
  index: number
  totalCount: number
  /**
   * Wall-clock millis used for the Updated-badge cutoff. Pass `null` (or omit)
   * during SSR / first hydration render so the badge stays off — the parent
   * fills this in via `useEffect` after mount, avoiding hydration mismatch.
   */
  nowMs: number | null
}

const UPDATED_WINDOW_DAYS = 7

function formatTokensCompact(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

/**
 * Compact `YY/MM/DD`. The column renders `created_at`, which spans the whole
 * history of the catalog, so the year has to be there — the old `MM/DD` form
 * was only unambiguous because `last_updated` is always a recent date.
 */
export function formatShortDate(iso: string): string {
  if (!iso) return ""
  const parts = iso.split("-")
  if (parts.length !== 3) return iso
  return `${parts[0].slice(2)}/${parts[1]}/${parts[2]}`
}

/**
 * Returns true when the entry's content was synced within the recency window.
 *
 * Deliberately keyed off `last_updated` while the list itself is ordered by
 * `created_at`. The badge is the only place edit-recency surfaces now, so it
 * has to stay independent of position: an entry added months ago and synced
 * this week sits low in the list and still earns the badge.
 */
export function isRecentServiceUpdate(
  iso: string,
  nowMs: number | null,
  windowDays = UPDATED_WINDOW_DAYS
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

export interface ListRowMeta {
  /** `YY/MM/DD` of `created_at` — the value the "Added" column renders. */
  date: string
  /** Whether `last_updated` falls inside the recency window. */
  isUpdated: boolean
}

/**
 * Derives the row's two date-driven signals from the two distinct frontmatter
 * fields. Kept as one named function so the pairing stays explicit: the column
 * answers "when was this added", the badge answers "was this touched recently",
 * and nothing should quietly re-cross them onto a single field again.
 */
export function deriveListRowMeta(
  frontmatter: ServiceFrontmatter,
  nowMs: number | null
): ListRowMeta {
  return {
    date: formatShortDate(frontmatter.created_at),
    isUpdated: isRecentServiceUpdate(frontmatter.last_updated, nowMs),
  }
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
  const { name, slug, logo } = doc.frontmatter
  const tokens = formatTokensCompact(doc.estimatedTokens)
  const { date, isUpdated } = deriveListRowMeta(doc.frontmatter, nowMs)
  const pageNo = formatServiceListNumber(index, totalCount)

  return (
    <Link
      to="/services/$slug"
      params={{ slug }}
      // No `tab` param. The detail route already defaults to the preview tab
      // (`parseTab(search.tab) ?? "preview"`), so `?tab=preview` changed nothing
      // a reader sees - and everything a crawler does: a URL carrying any `tab`
      // is `noindex,follow`, which made every one of the catalog's internal
      // links point at a page the site tells search engines not to index. The
      // canonical entry pages had no internal link from the home page at all.
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
