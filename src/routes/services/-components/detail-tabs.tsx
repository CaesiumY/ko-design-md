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
        "inline-flex items-stretch border border-rule-strong",
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
        "text-muted-foreground transition-colors",
        "border-l border-rule-strong first:border-l-0",
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
