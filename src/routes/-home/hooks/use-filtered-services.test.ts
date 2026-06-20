import { describe, expect, it } from "vitest"
import { buildServiceSearchText } from "./use-filtered-services"
import type { ServiceDoc } from "@/lib/content-types"

function serviceDoc(
  name: string,
  designSystemName: string | undefined
): ServiceDoc {
  return {
    frontmatter: {
      name,
      slug: "sample",
      category: "etc",
      last_updated: "2026-05-14",
      sources: [],
      related_services: [],
      lang: "ko",
      design_system_name: designSystemName,
    },
    raw: "",
    body: "",
    tagline: "브랜드 설명",
    filePath: "/services/sample.md",
    estimatedTokens: 1,
  }
}

describe("buildServiceSearchText", () => {
  it("includes the optional design system name so system-name queries still match", () => {
    const haystack = buildServiceSearchText(
      serviceDoc("당근", "SEED Design")
    ).toLowerCase()

    expect(haystack).toContain("당근")
    expect(haystack).toContain("seed design")
  })
})
