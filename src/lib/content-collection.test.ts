import { describe, expect, it } from "vitest"
import { getAllServices, getServiceBySlug } from "./content-collection"

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
})
