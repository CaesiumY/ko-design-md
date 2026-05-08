import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

export const DetailTabs = TabsPrimitive.Root

export function DetailTabsList({
  className,
  ...props
}: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="detail-tabs-list"
      className={cn(
        "border-b flex items-center gap-6 text-meta-caps",
        className,
      )}
      style={{ borderColor: "var(--rule-strong)" }}
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
        "relative -mb-px cursor-pointer border-b-2 border-transparent py-3",
        "text-muted-foreground transition-colors",
        "hover:text-foreground",
        "data-[selected]:border-foreground data-[selected]:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
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
        className,
      )}
      {...props}
    />
  )
}
