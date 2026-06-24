import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

export const DetailTabs = TabsPrimitive.Root

// Segmented control container. Borrows the same outlined-box visual language
// as PreviewThemeToggle so the two controls read as a related family — but
// the tabs are larger (px-5 py-2.5 vs size-8) to mark them as the primary
// switch and the toggle as a secondary modifier.
export function DetailTabsList({
  className,
  ...props
}: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="detail-tabs-list"
      className={cn(
        // flex-wrap so tabs flow to the next line on narrow widths instead of
        // overflowing. The outer border is intentionally absent — each tab
        // carries its own border (see DetailTabsTab) so the group hugs its
        // content (no full-width stretching box) when wrapped. The tabs'
        // -ml-px / -mt-px margins collapse adjacent borders in both axes, so a
        // wrapped group still reads as one connected block with no row gap.
        "flex flex-wrap items-stretch",
        className
      )}
      {...props}
    />
  )
}

export function DetailTabsTab({
  className,
  ...props
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="detail-tabs-tab"
      className={cn(
        "cursor-pointer px-5 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase",
        // Taller tap targets in the narrow / stacked (column) mode — i.e.
        // mobile — to meet the ~44px touch-target guideline. Desktop keeps the
        // compact py-2.5.
        "@max-sm:py-3.5",
        "text-muted-foreground transition-colors",
        // Each tab carries a full border; -ml-px and -mt-px overlap adjacent
        // borders (horizontally within a row, vertically across wrapped rows)
        // into single 1px seams so the group reads as one connected control.
        // Margins are uniform (no first:ml-0) so every wrapped row's leading
        // tab lands at the same x — aligned with each other and with the body
        // text — instead of the first row jutting 1px inward.
        "-mt-px -ml-px border border-rule-strong",
        "hover:text-foreground",
        // base-ui Tabs marks the active tab with aria-selected="true" and a
        // data-active attribute. We match aria-selected since it's the W3C
        // standard and Tailwind has a first-class `aria-selected:` variant.
        "aria-selected:bg-foreground aria-selected:text-background",
        "focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className
      )}
      {...props}
    />
  )
}

export function DetailTabsPanel({
  className,
  keepMounted = true,
  ...props
}: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="detail-tabs-panel"
      keepMounted={keepMounted}
      className={cn(
        "mt-8 focus-visible:outline-none data-[hidden]:hidden",
        className
      )}
      {...props}
    />
  )
}
