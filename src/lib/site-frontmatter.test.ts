import { describe, expect, it, vi } from "vitest"
import { buildDoc } from "./site-frontmatter"

// `buildDoc` is the site's document for the Node tools — the OG build, the
// sidecar build, the E2E expectations. It reads the frontmatter with the one
// reader and refuses what the site build refuses (the build plugin's own
// tests drive the same checks through Vite's hooks).

const FILE = "/services/demo.md"

function frontmatter(...lines: Array<string>): string {
  return [
    "---",
    "name: Demo",
    "slug: demo",
    "category: etc",
    "last_updated: 2026-05-07",
    "lang: ko",
    ...lines,
    "---",
    "",
    "Demo body for the test fixture.",
    "",
  ].join("\n")
}

describe("buildDoc", () => {
  it("reads a canonical frontmatter block", () => {
    const doc = buildDoc(FILE, frontmatter('created_at: "2026-05-01"'))
    expect(doc.frontmatter.name).toBe("Demo")
    expect(doc.frontmatter.created_at).toBe("2026-05-01")
    expect(doc.frontmatter.last_updated).toBe("2026-05-07")
    expect(doc.body.startsWith("---")).toBe(false)
  })

  it("reads through a UTF-8 BOM", () => {
    const raw = String.fromCharCode(0xfeff) + frontmatter()
    expect(buildDoc(FILE, raw).frontmatter.name).toBe("Demo")
  })

  it("throws for a block that never closes, and for a file with none", () => {
    const unclosed = "---\nname: Demo\nlang: ko\n\nbody but no closing fence"
    expect(() => buildDoc(FILE, unclosed)).toThrow(/no frontmatter block/)
    expect(() => buildDoc(FILE, "Just a body.\n")).toThrow(
      /no frontmatter block/
    )
  })

  // `_` used to be stripped so demo fixtures got a clean slug. The fixtures
  // are gone and a `_` file is now blocked by `underscore-entry-file`; keeping
  // the prefix means the slug check fails too instead of a `_foo.md` quietly
  // publishing as `foo`.
  it("keeps a leading underscore in the file-name slug fallback", () => {
    const raw = frontmatter().replace("slug: demo\n", "")
    expect(buildDoc("/services/_demo-pay.md", raw).frontmatter.slug).toBe(
      "_demo-pay"
    )
  })

  it("takes a count YAML reads as a number", () => {
    const doc = buildDoc(FILE, frontmatter("estimated_tokens: 1234"))
    expect(doc.frontmatter.estimated_tokens).toBe(1234)
    expect(doc.estimatedTokens).toBe(1234)
  })

  it("falls back to the estimate for a count written with no value", () => {
    const doc = buildDoc(FILE, frontmatter("estimated_tokens:"))
    expect(doc.frontmatter.estimated_tokens).toBeUndefined()
    expect(doc.estimatedTokens).toBeGreaterThan(0)
  })

  // `"1200"` and `0b101` are text to YAML — and so to every other reader of
  // the file — even where `Number()` would turn them into a count.
  it.each(['"1200"', "0b101", "not-a-number", "true"])(
    "refuses a count YAML does not read as a number (%s)",
    (value) => {
      expect(() =>
        buildDoc(FILE, frontmatter(`estimated_tokens: ${value}`))
      ).toThrow(/estimated_tokens.*number/)
    }
  )

  it("reads design_system_name as the optional display companion", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const doc = buildDoc(FILE, frontmatter("design_system_name: Demo UI"))
    expect(doc.frontmatter.name).toBe("Demo")
    expect(doc.frontmatter.design_system_name).toBe("Demo UI")
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  // An empty value used to fall back to a default; an empty name became the
  // slug without anyone noticing (2026-10-03). Now it is refused.
  it("refuses a key the site reads written with no value", () => {
    expect(() => buildDoc(FILE, frontmatter("design_system_name:"))).toThrow(
      /`design_system_name` has no value/
    )
  })

  it("warns on an unknown frontmatter key", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {})
    buildDoc(FILE, frontmatter("last-updated: 2026-05-07"))
    const calls = spy.mock.calls.map((c) => String(c[0]))
    expect(calls.some((s) => s.includes("Unknown frontmatter key"))).toBe(true)
    spy.mockRestore()
  })
})

describe("buildDoc — dates", () => {
  const withDate = (date: string, key = "last_updated") =>
    frontmatter().replace(/last_updated: .*\n/, `${key}: ${date}\n`)

  it("accepts a YYYY-MM-DD date, a leap day and a month's boundary days", () => {
    for (const date of ["2026-05-07", "2028-02-29", "2026-01-01", "2026-12-31"])
      expect(buildDoc(FILE, withDate(date)).frontmatter.last_updated).toBe(date)
  })

  it.each(["2026/05/07", "2026-5-7"])(
    "refuses a date not in ISO form (%s)",
    (date) => {
      expect(() => buildDoc(FILE, withDate(date))).toThrow(/ISO/)
    }
  )

  // The digit pattern alone lets impossible dates through, and they are worse
  // than a parse error: string-comparing "2026-99-99" pins the entry to the top
  // of a catalog ordered by created_at.
  it.each(["2026-99-99", "2026-02-30", "2026-02-29"])(
    "refuses a day the calendar does not have (%s)",
    (date) => {
      expect(() => buildDoc(FILE, withDate(date))).toThrow(/calendar/)
    }
  )

  it("names the field, so a bad created_at is not reported as last_updated", () => {
    const raw = frontmatter("created_at: 2026/05/07")
    expect(() => buildDoc(FILE, raw)).toThrow(/`created_at`/)
  })
})
