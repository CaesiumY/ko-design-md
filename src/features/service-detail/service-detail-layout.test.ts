import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

const source = readFileSync(
  new URL("../../routes/services/$slug.tsx", import.meta.url),
  "utf8",
)

function indexOfOrThrow(needle: string): number {
  const index = source.indexOf(needle)
  if (index === -1) throw new Error(`Could not find ${needle}`)
  return index
}

describe("service detail mobile layout", () => {
  it("renders the primary action before the tabs so mobile users can copy before previewing", () => {
    const serviceMetaIndex = indexOfOrThrow("<ServiceMeta")
    const primaryActionIndex = indexOfOrThrow("<aside")
    const detailTabsIndex = indexOfOrThrow("<DetailTabs")

    expect(serviceMetaIndex).toBeLessThan(primaryActionIndex)
    expect(primaryActionIndex).toBeLessThan(detailTabsIndex)
  })
})
