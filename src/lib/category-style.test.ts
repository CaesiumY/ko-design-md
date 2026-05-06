import { describe, it, expect } from "vitest"
import { getCategoryStyle } from "./category-style"

describe("getCategoryStyle", () => {
  it("returns gradient + label for known category", () => {
    const s = getCategoryStyle("finance")
    expect(s.label).toBe("Finance")
    expect(s.coverGradient).toMatch(/from-/)
  })

  it("falls back to 'etc' style for unknown category", () => {
    const s = getCategoryStyle("not-a-category" as never)
    expect(s.label).toBe("Etc")
  })
})
