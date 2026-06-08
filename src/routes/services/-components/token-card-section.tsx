import type { ReactNode } from "react"
import type {
  ColorToken,
  RadiusToken,
  ServiceTokens,
  SpacingToken,
  TypeToken,
} from "@/lib/content-types"

// A pangram-ish sample that exercises Hangul, Latin, and numerals at every
// ramp step. It renders in the SITE font (Pretendard), not the brand typeface
// — brand @font-face only loads inside the preview iframe — so the sample
// communicates size/weight/tracking hierarchy, not the actual letterforms.
const TYPE_SAMPLE = "한글 Ag 다람쥐 0123"

// Stable bar length for the widest spacing step; every other bar scales against
// it. Kept small enough that the name + bar + value row never overflows mobile.
const MAX_BAR_PX = 140

// Long sections collapse their tail into a native <details> so huge palettes
// (vapor/wanted carry 100+ colors) stay scannable while the headline tokens
// remain visible. No client JS — <details> is native. An overflow of MIN_COLLAPSE
// or fewer isn't worth a disclosure, so it's shown inline.
const COLORS_LIMIT = 40
const FLAT_LIMIT = 24
const MIN_COLLAPSE = 6

export function TokenCardSection({ tokens }: { tokens?: ServiceTokens }) {
  // No sidecar yet (entry not backfilled) → render nothing.
  if (!tokens) return null
  const { colors, typography, spacing, radius } = tokens
  if (
    colors.length === 0 &&
    typography.length === 0 &&
    spacing.length === 0 &&
    radius.length === 0
  ) {
    return null
  }

  const counts: Array<[number, string]> = [
    [colors.length, "Colors"],
    [typography.length, "Type"],
    [spacing.length, "Spacing"],
    [radius.length, "Radii"],
  ]

  return (
    <section
      aria-label="Design tokens"
      className="mb-10 border-b pb-10"
      style={{ borderColor: "var(--rule-strong)" }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-meta-caps text-foreground font-bold">Design Tokens</h2>
        <p className="text-meta-caps text-muted-foreground">
          {counts
            .filter(([n]) => n > 0)
            .map(([n, label], i) => (
              <span key={label}>
                {i > 0 && <span className="opacity-40"> · </span>}
                <span className="text-foreground font-bold">{n}</span> {label}
              </span>
            ))}
        </p>
      </div>

      {colors.length > 0 && <ColorBlock colors={colors} />}
      {typography.length > 0 && <TypeBlock items={typography} />}
      {(spacing.length > 0 || radius.length > 0) && (
        <ScaleBlock spacing={spacing} radius={radius} />
      )}
    </section>
  )
}

function SubLabel({ children }: { children: string }) {
  return <p className="text-meta-caps text-muted-foreground">{children}</p>
}

// Native disclosure for the collapsed tail of a long section.
function MoreDetails({
  count,
  label,
  children,
}: {
  count: number
  label: string
  children: ReactNode
}) {
  return (
    <details className="mt-4">
      <summary className="text-meta-caps text-muted-foreground hover:text-foreground w-fit cursor-pointer">
        + {count} more {label}
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  )
}

// Render a fixed-size head of a flat list, collapsing the tail into <details>.
function FlatCollapse<T>({
  items,
  limit,
  label,
  wrapClass,
  render,
}: {
  items: Array<T>
  limit: number
  label: string
  wrapClass: string
  render: (item: T) => ReactNode
}) {
  const collapse = items.length - limit > MIN_COLLAPSE
  const visible = collapse ? items.slice(0, limit) : items
  const hidden = collapse ? items.slice(limit) : []
  return (
    <>
      <div className={wrapClass}>{visible.map(render)}</div>
      {hidden.length > 0 && (
        <MoreDetails count={hidden.length} label={label}>
          <div className={wrapClass}>{hidden.map(render)}</div>
        </MoreDetails>
      )}
    </>
  )
}

// ── Colors (grouped, group-aware collapse) ──────────────────────────────────

function ColorBlock({ colors }: { colors: Array<ColorToken> }) {
  const groups = groupByOrder(colors, (c) => c.group ?? "")

  // Keep whole groups visible until the cumulative swatch count passes the
  // limit, then collapse the remaining groups. The first group always shows.
  const visible: Array<[string, Array<ColorToken>]> = []
  const hidden: Array<[string, Array<ColorToken>]> = []
  let cum = 0
  for (const entry of groups) {
    if (hidden.length > 0) {
      hidden.push(entry)
    } else if (visible.length === 0 || cum + entry[1].length <= COLORS_LIMIT) {
      visible.push(entry)
      cum += entry[1].length
    } else {
      hidden.push(entry)
    }
  }
  let hiddenCount = hidden.reduce((n, [, items]) => n + items.length, 0)
  if (hiddenCount <= MIN_COLLAPSE) {
    visible.push(...hidden.splice(0))
    hiddenCount = 0
  }

  return (
    <div className="mt-8">
      <SubLabel>Colors</SubLabel>
      <div className="mt-4 space-y-6">{visible.map(renderColorGroup)}</div>
      {hidden.length > 0 && (
        <MoreDetails count={hiddenCount} label="colors">
          <div className="space-y-6">{hidden.map(renderColorGroup)}</div>
        </MoreDetails>
      )}
    </div>
  )
}

function renderColorGroup([group, items]: [string, Array<ColorToken>]): ReactNode {
  return (
    <div key={group || "_"}>
      {group && (
        <p className="text-muted-foreground mb-2 text-xs font-medium">{group}</p>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((c) => (
          <SwatchCard key={c.name} token={c} />
        ))}
      </div>
    </div>
  )
}

function SwatchCard({ token }: { token: ColorToken }) {
  return (
    <div className="border">
      <div
        className="h-16 w-full"
        style={{ background: token.value }}
        aria-hidden
      />
      <div className="px-2.5 py-2">
        <p className="text-foreground text-[13px] leading-tight font-bold">
          {token.name}
        </p>
        <p className="text-muted-foreground mt-1 font-mono text-[10px] break-all">
          {token.value}
        </p>
        {token.note && (
          <p className="text-muted-foreground mt-1.5 text-[11px] leading-snug">
            {token.note}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Typography ────────────────────────────────────────────────────────────────

function TypeBlock({ items }: { items: Array<TypeToken> }) {
  return (
    <div className="mt-10">
      <SubLabel>Typography</SubLabel>
      <div className="mt-2">
        <FlatCollapse
          items={items}
          limit={FLAT_LIMIT}
          label="styles"
          wrapClass=""
          render={(t) => <TypeRow key={t.name} token={t} />}
        />
      </div>
    </div>
  )
}

function TypeRow({ token }: { token: TypeToken }) {
  const meta = [
    token.size,
    token.weight ? `${token.weight}` : undefined,
    token.lineHeight,
    token.tracking,
  ]
    .filter(Boolean)
    .join(" · ")
  return (
    <div
      className="grid grid-cols-[minmax(0,9rem)_1fr] items-baseline gap-4 border-b py-3 last:border-b-0 sm:gap-8"
      style={{ borderColor: "var(--rule-strong)" }}
    >
      <div className="text-muted-foreground font-mono text-[11px] leading-tight">
        <span className="text-foreground block font-bold">{token.name}</span>
        {meta}
        {token.note && <span className="mt-0.5 block opacity-70">{token.note}</span>}
      </div>
      <p
        className="text-foreground m-0 truncate"
        style={{
          fontSize: token.size,
          fontWeight: token.weight,
          lineHeight: token.lineHeight,
          letterSpacing: token.tracking,
        }}
      >
        {TYPE_SAMPLE}
      </p>
    </div>
  )
}

// ── Spacing & Radius ──────────────────────────────────────────────────────────

function ScaleBlock({
  spacing,
  radius,
}: {
  spacing: Array<SpacingToken>
  radius: Array<RadiusToken>
}) {
  const maxPx = Math.max(1, ...spacing.map((s) => s.px ?? 0))

  return (
    <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
      {spacing.length > 0 && (
        <div>
          <SubLabel>Spacing</SubLabel>
          <FlatCollapse
            items={spacing}
            limit={FLAT_LIMIT}
            label="steps"
            wrapClass="mt-4 space-y-2"
            render={(s) => <SpacingRow key={s.name} token={s} max={maxPx} />}
          />
        </div>
      )}

      {radius.length > 0 && (
        <div>
          <SubLabel>Radius</SubLabel>
          <FlatCollapse
            items={radius}
            limit={FLAT_LIMIT}
            label="radii"
            wrapClass="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-3"
            render={(r) => <RadiusChip key={r.name} token={r} />}
          />
        </div>
      )}
    </div>
  )
}

function SpacingRow({ token, max }: { token: SpacingToken; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground w-16 shrink-0 font-mono text-[11px]">
        {token.name}
      </span>
      <span
        className="bg-foreground/80 h-2.5 shrink-0"
        style={{ width: barWidth(token.px, max) }}
        aria-hidden
      />
      <span className="text-muted-foreground font-mono text-[11px]">
        {token.value}
      </span>
    </div>
  )
}

function RadiusChip({ token }: { token: RadiusToken }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="bg-ghost h-14 w-14 border"
        style={{
          borderRadius: token.px != null ? `${token.px}px` : token.value,
          borderColor: "var(--rule-strong)",
        }}
        aria-hidden
      />
      <div className="text-center leading-tight">
        <p className="text-foreground font-mono text-[11px]">{token.name}</p>
        <p className="text-muted-foreground font-mono text-[10px]">{token.value}</p>
      </div>
    </div>
  )
}

// ── helpers ──────────────────────────────────────────────────────────────────

function barWidth(px: number | null, max: number): string {
  if (px == null || px <= 0) return "2px"
  return `${Math.max(4, Math.round((px / max) * MAX_BAR_PX))}px`
}

// Group preserving first-seen key order (Map iteration order), so the visual
// order matches the document order of the source YAML.
function groupByOrder<T>(
  items: Array<T>,
  key: (t: T) => string,
): Array<[string, Array<T>]> {
  const map = new Map<string, Array<T>>()
  for (const item of items) {
    const k = key(item)
    const bucket = map.get(k)
    if (bucket) bucket.push(item)
    else map.set(k, [item])
  }
  return [...map.entries()]
}
