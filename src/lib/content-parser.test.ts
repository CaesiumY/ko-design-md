import { describe, expect, it, vi } from "vitest"
import { buildDoc, normalizeDateField } from "./content-parser"

const FILE = "/services/_demo.md"

function frontmatter(body: string): string {
  return [
    "---",
    "name: Demo",
    "slug: demo",
    "category: etc",
    "last_updated: 2026-05-07",
    "lang: ko",
    body,
    "---",
    "",
    "Demo body for the test fixture.",
    "",
  ].join("\n")
}

describe("matter / frontmatter parsing", () => {
  it("parses a canonical frontmatter block", () => {
    const doc = buildDoc(FILE, frontmatter("sources:\n  - https://example.com/a"))
    expect(doc.frontmatter.name).toBe("Demo")
    expect(doc.frontmatter.sources).toEqual(["https://example.com/a"])
    expect(doc.frontmatter.last_updated).toBe("2026-05-07")
  })

  it("strips a UTF-8 BOM so frontmatter is still recognized", () => {
    const raw = "﻿" + frontmatter("sources: []")
    const doc = buildDoc(FILE, raw)
    expect(doc.frontmatter.name).toBe("Demo")
  })

  it("throws if the opening fence has no closing fence", () => {
    const raw = "---\nname: Demo\nlang: ko\n\nbody but no closing fence"
    expect(() => buildDoc(FILE, raw)).toThrow(/malformed/i)
  })

  it("falls back to defaults silently when there is no frontmatter at all", () => {
    const raw = "Just a body with no frontmatter at all.\n"
    const doc = buildDoc(FILE, raw)
    expect(doc.frontmatter.name).toBe("demo") // slug from filename
    expect(doc.frontmatter.last_updated).toBe("")
  })

  it("strips a leading underscore from the filename when deriving the slug fallback", () => {
    // Files prefixed with `_` are convention-marked as fixtures/drafts but
    // should still produce a clean slug — `_demo-pay.md` → `demo-pay`, not
    // `_demo-pay`. This used to be checked indirectly through the catalog,
    // but the catalog no longer ships any underscore-prefixed entries, so
    // the rule needs an explicit unit test here.
    const raw = "No frontmatter, slug must come from filename.\n"
    const doc = buildDoc("/services/_demo-pay.md", raw)
    expect(doc.frontmatter.name).toBe("demo-pay")
  })
})

describe("inline arrays", () => {
  it("splits on commas only outside quotes", () => {
    const doc = buildDoc(
      FILE,
      frontmatter('sources: ["https://a.com/?q=1,2", "https://b.com"]'),
    )
    expect(doc.frontmatter.sources).toEqual([
      "https://a.com/?q=1,2",
      "https://b.com",
    ])
  })

  it("returns an empty array for `sources: []`", () => {
    const doc = buildDoc(FILE, frontmatter("sources: []"))
    expect(doc.frontmatter.sources).toEqual([])
  })
})

describe("block arrays", () => {
  it("accepts indented items", () => {
    const doc = buildDoc(
      FILE,
      frontmatter("sources:\n  - https://a.com\n  - https://b.com"),
    )
    expect(doc.frontmatter.sources).toEqual([
      "https://a.com",
      "https://b.com",
    ])
  })

  it("also accepts zero-indent items (`- foo` at column 0)", () => {
    const doc = buildDoc(
      FILE,
      frontmatter("sources:\n- https://a.com\n- https://b.com"),
    )
    expect(doc.frontmatter.sources).toEqual([
      "https://a.com",
      "https://b.com",
    ])
  })

  it("ignores inline `# comment` lines mid-list", () => {
    const doc = buildDoc(
      FILE,
      frontmatter(
        "sources:\n  - https://a.com\n  # legacy mirror, keeping for reference\n  - https://b.com",
      ),
    )
    expect(doc.frontmatter.sources).toEqual([
      "https://a.com",
      "https://b.com",
    ])
  })
})

describe("scalar comment stripping", () => {
  it("strips trailing `# comment` from an unquoted scalar", () => {
    const doc = buildDoc(FILE, frontmatter("sources: []") + "\n# trailing")
    expect(doc.frontmatter.sources).toEqual([])
  })

  it("preserves URL fragments (no leading whitespace before #)", () => {
    const doc = buildDoc(
      FILE,
      frontmatter("sources:\n  - https://example.com/page#section"),
    )
    expect(doc.frontmatter.sources).toEqual([
      "https://example.com/page#section",
    ])
  })

  it("preserves `#` inside quoted scalars", () => {
    const raw = [
      "---",
      'name: "Acme # Important"',
      "slug: demo",
      "category: etc",
      "last_updated: 2026-05-07",
      "lang: ko",
      "---",
      "",
      "Body.",
    ].join("\n")
    const doc = buildDoc(FILE, raw)
    expect(doc.frontmatter.name).toBe("Acme # Important")
  })
})

describe("type validation", () => {
  it("coerces estimated_tokens from string to number", () => {
    const doc = buildDoc(FILE, frontmatter("estimated_tokens: 1234"))
    expect(typeof doc.frontmatter.estimated_tokens).toBe("number")
    expect(doc.frontmatter.estimated_tokens).toBe(1234)
    expect(doc.estimatedTokens).toBe(1234)
  })

  it("parses design_system_name without warning as an optional display companion", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const doc = buildDoc(FILE, frontmatter("design_system_name: Demo UI"))

    expect(doc.frontmatter.name).toBe("Demo")
    expect(doc.frontmatter.design_system_name).toBe("Demo UI")
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it("throws if estimated_tokens is not numeric", () => {
    expect(() =>
      buildDoc(FILE, frontmatter("estimated_tokens: not-a-number")),
    ).toThrow(/estimated_tokens/i)
  })

  it("warns on unknown frontmatter keys", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {})
    buildDoc(FILE, frontmatter("last-updated: 2026-05-07")) // typo: hyphen
    expect(spy).toHaveBeenCalled()
    const calls = spy.mock.calls.map((c) => String(c[0]))
    expect(calls.some((s) => s.includes("Unknown frontmatter key"))).toBe(true)
    spy.mockRestore()
  })
})

describe("normalizeDateField", () => {
  it("accepts a YYYY-MM-DD string", () => {
    expect(normalizeDateField("2026-05-07")).toBe("2026-05-07")
  })

  it("converts Date instances to YYYY-MM-DD", () => {
    const d = new Date("2026-05-07T00:00:00Z")
    expect(normalizeDateField(d)).toBe("2026-05-07")
  })

  it("returns empty string for missing values", () => {
    expect(normalizeDateField(undefined)).toBe("")
    expect(normalizeDateField(null)).toBe("")
    expect(normalizeDateField("")).toBe("")
  })

  it("throws on non-ISO strings like 2026/05/07", () => {
    expect(() => normalizeDateField("2026/05/07")).toThrow(/ISO/i)
  })

  it("throws on partial ISO strings like 2026-5-7", () => {
    expect(() => normalizeDateField("2026-5-7")).toThrow(/ISO/i)
  })
})
