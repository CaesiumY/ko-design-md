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

export function isRecentServiceUpdate(
  iso: string,
  nowMs: number | null,
  windowDays = NEW_WINDOW_DAYS,
): boolean {
  if (!iso || nowMs === null) return false
  const updated = new Date(iso)
  if (Number.isNaN(updated.getTime())) return false
  const ageMs = nowMs - updated.getTime()
  return ageMs >= 0 && ageMs <= windowDays * 24 * 60 * 60 * 1000
}

/**
 * NEW = the entry itself was added to the catalog recently.
 *
 * Uses `created_at` (the catalog-entry birthdate) when present. For older
 * entries without `created_at`, falls back to `last_updated` so legacy
 * behaviour is preserved — those will keep showing NEW for ~7 days after any
 * edit, same as before this field existed.
 */
export function isNewService(
  created_at: string | undefined,
  last_updated: string,
  nowMs: number | null,
): boolean {
  const effective = created_at && created_at.length > 0 ? created_at : last_updated
  return isRecentServiceUpdate(effective, nowMs)
}

/**
 * UPDATED = the entry already existed for a while, but its content was just
 * re-synced. Both dates must be present, must differ, the catalog-birth must
 * sit OUTSIDE the recency window, and the last sync must sit INSIDE it.
 *
 * Mutually exclusive with NEW — when both could fire, NEW wins (caller is
 * expected to check NEW first, but we also guard here defensively).
 */
export function isRecentlyUpdated(
  created_at: string | undefined,
  last_updated: string,
  nowMs: number | null,
): boolean {
  if (!created_at || !last_updated || created_at === last_updated) return false
  if (isRecentServiceUpdate(created_at, nowMs)) return false
  return isRecentServiceUpdate(last_updated, nowMs)
}

export function formatServiceListNumber(
  index: number,
  totalCount: number,
): string {
  const targetLength = Math.max(2, String(totalCount).length)
  return String(totalCount - index + 1).padStart(targetLength, "0")
}

function NewBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "bg-brand text-primary-foreground inline-flex items-center px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-[0.12em] uppercase",
        className,
      )}
    >
      NEW
    </span>
  )
}

function UpdatedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "bg-muted text-foreground inline-flex items-center px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-[0.12em] uppercase",
        className,
      )}
    >
      Updated
    </span>
  )
}

export function ServiceListRow({ doc, index, totalCount, nowMs }: Props) {
  const { name, slug, logo, last_updated, created_at } = doc.frontmatter
  const tokens = formatTokensCompact(doc.estimatedTokens)
  const date = formatShortDate(last_updated)
  const isNew = isNewService(created_at, last_updated, nowMs)
  const isUpdated = !isNew && isRecentlyUpdated(created_at, last_updated, nowMs)
  const pageNo = formatServiceListNumber(index, totalCount)

  return (
    <Link
      to="/services/$slug"
      params={{ slug }}
      search={{ tab: "preview" }}
      className="group hover:bg-secondary/60 block border-b transition-colors"
      style={{ borderColor: "var(--rule-strong)" }}
    >
      {/* Desktop: single-row 6-col grid */}
      <div
        className={cn(
          "hidden items-center gap-4 px-6 py-3 md:grid",
          "md:grid-cols-[40px_minmax(180px,220px)_1fr_56px_72px_72px]",
        )}
      >
        <span className="text-muted-foreground text-xs tabular-nums">
          {pageNo}
        </span>
        <span className="flex min-w-0 items-center gap-2.5">
          <ServiceLogo name={name} logo={logo} size={24} />
          <span className="truncate text-sm font-semibold tracking-tight">
            {name}
          </span>
        </span>
        <span className="text-muted-foreground truncate text-sm">
          {doc.tagline}
        </span>
        <span className="flex items-center">
          {isNew && <NewBadge />}
          {isUpdated && <UpdatedBadge />}
        </span>
        <span className="text-right text-sm tabular-nums">{tokens}</span>
        <span className="text-muted-foreground text-right text-xs tabular-nums">
          {date}
        </span>
      </div>

      {/* Mobile: 2-line stacked layout */}
      <div className="px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <ServiceLogo name={name} logo={logo} size={24} />
          <span className="truncate text-sm font-semibold tracking-tight">
            {name}
          </span>
          {isNew && <NewBadge />}
          {isUpdated && <UpdatedBadge />}
          <span className="text-muted-foreground ml-auto flex shrink-0 items-baseline gap-1.5 text-xs tabular-nums">
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
          <p className="text-muted-foreground mt-1 truncate pl-[34px] text-xs">
            {doc.tagline}
          </p>
        )}
      </div>
    </Link>
  )
}
