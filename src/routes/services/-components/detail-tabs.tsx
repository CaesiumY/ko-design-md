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
        // Wraps onto multiple rows on narrow widths (flex-wrap) instead of
        // overflowing. No outer border — each tab carries its own (see
        // DetailTabsTab), so the group hugs its content instead of stretching
        // full-width, and the tabs' uniform -ml-px/-mt-px collapse adjacent
        // borders into shared 1px seams (one connected block, even wrapped).
        // pt-px/pl-px offset those negative margins so the group's outer edge
        // stays aligned to the column grid (body text).
        "flex flex-wrap items-stretch pt-px pl-px",
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
        // Full border per tab; uniform -ml-px/-mt-px collapses adjacent borders
        // into 1px seams (see DetailTabsList for the wrap / alignment model).
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
