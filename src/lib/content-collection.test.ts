import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { getAllServices, getServiceBySlug, truncateForMeta } from "./content-collection"
import { deriveTagline } from "./content-parser"

describe("content-collection", () => {
  it("loads at least one service from /services/*.md", () => {
    const all = getAllServices()
    expect(all.length).toBeGreaterThan(0)
  })

  it("returns ServiceDoc by slug, undefined when missing", () => {
    expect(getServiceBySlug("krds")?.frontmatter.name).toBe("KRDS")
    expect(getServiceBySlug("does-not-exist")).toBeUndefined()
  })

  it("uses Korean company names as primary display names while preserving system names", () => {
    expect(getServiceBySlug("seed-design")?.frontmatter).toMatchObject({
      name: "당근",
      design_system_name: "SEED Design",
    })
    expect(getServiceBySlug("vapor-ui")?.frontmatter).toMatchObject({
      name: "구름",
      design_system_name: "Vapor UI",
    })
  })

  it("populates body without frontmatter fences and computes a positive token count", () => {
    const doc = getServiceBySlug("krds")
    expect(doc).toBeDefined()
    expect(doc!.body.startsWith("---")).toBe(false)
    expect(doc!.estimatedTokens).toBeGreaterThan(100)
  })

  it("derives a non-empty tagline", () => {
    const doc = getServiceBySlug("krds")
    expect(doc!.tagline.length).toBeGreaterThan(10)
  })

  it("normalizes last_updated to YYYY-MM-DD string (YAML may parse it as Date)", () => {
    const doc = getServiceBySlug("krds")
    expect(typeof doc!.frontmatter.last_updated).toBe("string")
    expect(doc!.frontmatter.last_updated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("does not import preview HTML through public-directory URLs", () => {
    const source = readFileSync(
      new URL("./content-collection.ts", import.meta.url),
      "utf8",
    )
    expect(source).not.toContain("/public/preview")
  })
})

describe("deriveTagline", () => {
  it("strips bold markers and `[src:N]` citation markup so the tagline isn't bibliographic noise", () => {
    const body =
      "\n\n## Brand\n\n본문이다 [src:1][src:6]. 다음 문장도 **굵게** [src:2] 들어간다.\n"
    expect(deriveTagline(body)).toBe(
      "본문이다. 다음 문장도 굵게 들어간다.",
    )
  })

  it("keeps prose unaffected when no citation markers are present", () => {
    expect(deriveTagline("\n## H\n\n그냥 평범한 본문 한 줄.\n")).toBe(
      "그냥 평범한 본문 한 줄.",
    )
  })
})

describe("truncateForMeta", () => {
  it("returns input unchanged when length is within max", () => {
    const short = "짧은 문장입니다."
    expect(truncateForMeta(short, 155)).toBe(short)
  })

  it("breaks on a sentence terminator that lies in the upper 40 percent of the slice", () => {
    const text = "First sentence ends with a period right here. Then a much longer sentence follows."
    const result = truncateForMeta(text, 60)
    expect(result).toBe("First sentence ends with a period right here.…")
  })

  it("breaks on whitespace when no terminator falls in the upper 40 percent", () => {
    const text = "단어 ".repeat(40).trim()
    const result = truncateForMeta(text, 30)
    expect(result.endsWith("…")).toBe(true)
    expect(result.includes(" …")).toBe(false)
  })

  it("falls back to a hard cut when no break point exists in the upper 40 percent", () => {
    const text = "ㄱ".repeat(200)
    const result = truncateForMeta(text, 30)
    expect(result).toBe("ㄱ".repeat(30) + "…")
  })

  it("breaks on a Korean sentence terminator (.) at the end of a clause", () => {
    const text = "한국어 종결 마침표가 자연스럽게 끊깁니다. 그 다음 문장은 잘려나갑니다."
    const result = truncateForMeta(text, 30)
    expect(result).toBe("한국어 종결 마침표가 자연스럽게 끊깁니다.…")
  })
})
