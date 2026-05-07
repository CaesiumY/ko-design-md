import { describe, expect, it } from "vitest"
import { getAllServices, getServiceBySlug, truncateForMeta } from "./content-collection"

describe("content-collection", () => {
  it("loads at least one service from /services/*.md", () => {
    const all = getAllServices()
    expect(all.length).toBeGreaterThan(0)
  })

  it("strips leading underscore from filename to derive slug", () => {
    const all = getAllServices()
    const slugs = all.map((s) => s.frontmatter.slug)
    expect(slugs).toContain("demo-pay")
  })

  it("returns ServiceDoc by slug, undefined when missing", () => {
    expect(getServiceBySlug("demo-pay")?.frontmatter.name).toBe("Demo Pay")
    expect(getServiceBySlug("does-not-exist")).toBeUndefined()
  })

  it("populates body without frontmatter fences and computes a positive token count", () => {
    const doc = getServiceBySlug("demo-pay")
    expect(doc).toBeDefined()
    expect(doc!.body.startsWith("---")).toBe(false)
    expect(doc!.estimatedTokens).toBeGreaterThan(100)
  })

  it("derives a non-empty tagline", () => {
    const doc = getServiceBySlug("demo-pay")
    expect(doc!.tagline.length).toBeGreaterThan(10)
  })

  it("normalizes last_updated to YYYY-MM-DD string (YAML may parse it as Date)", () => {
    const doc = getServiceBySlug("demo-pay")
    expect(typeof doc!.frontmatter.last_updated).toBe("string")
    expect(doc!.frontmatter.last_updated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
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
