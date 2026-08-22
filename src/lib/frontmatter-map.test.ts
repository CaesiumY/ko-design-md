import { describe, expect, it } from "vitest"
import { authoredScalar, isHeadRow, mapRows } from "./frontmatter-map"

// These rules used to live in four readers at once, and they disagreed. Pinning
// them here is what makes the single definition worth having: a change lands in
// one place and every reader inherits it.

const fm = (body: string): Array<string> => body.split("\n")

describe("mapRows", () => {
  it("reads a flat map and stops at the next top-level key", () => {
    const rows = mapRows(
      fm(
        [
          "colors:",
          "  a: oklch(1 0 0)",
          "  b: oklch(0 0 0)",
          "lang: ko",
          "  c: oklch(0.5 0 0)",
        ].join("\n")
      ),
      "colors"
    )
    expect(rows.map((r) => r.key)).toEqual(["a", "b"])
  })

  it("keeps the map open across a comment at ANY indentation", () => {
    // The rule that was got wrong twice. YAML does not end a mapping at a
    // comment, flush-left or otherwise; reading one as the end silently dropped
    // everything after it — 22 of one entry's 33 colours, in the measured case.
    const rows = mapRows(
      fm(
        [
          "colors:",
          "  a: oklch(1 0 0)",
          "# flush left",
          "    # indented",
          "  b: oklch(0 0 0)",
        ].join("\n")
      ),
      "colors"
    )
    expect(rows.map((r) => r.key)).toEqual(["a", "b"])
  })

  it("attaches a `## Label` heading to the rows that follow it", () => {
    const rows = mapRows(
      fm(
        [
          "colors:",
          "  ## Brand",
          "  a: oklch(1 0 0)",
          "  ## Surface",
          "  b: oklch(0 0 0)",
        ].join("\n")
      ),
      "colors"
    )
    expect(rows.map((r) => r.group)).toEqual(["Brand", "Surface"])
  })

  it("tells a group heading apart from ordinary commentary by hash count", () => {
    // An entry may carry both: krds has six plain comments and no groups.
    const rows = mapRows(
      fm(["colors:", "  # just a note", "  a: oklch(1 0 0)"].join("\n")),
      "colors"
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].group).toBeUndefined()
  })

  it("reports indentation so callers can enforce the canonical shape", () => {
    const rows = mapRows(
      fm(["colors:", "  brand:", "    primary: oklch(1 0 0)"].join("\n")),
      "colors"
    )
    expect(rows.map((r) => [r.key, r.indent, r.rest])).toEqual([
      ["brand", 2, ""],
      ["primary", 4, "oklch(1 0 0)"],
    ])
  })

  it("hands back the untouched source line", () => {
    // Callers that must see quoting or a trailing comment — `audit:oklch`, the
    // drift check — read this rather than a parsed value, which is why this
    // module does not parse values at all.
    const line = '  a: "oklch(1 0 0)"   # #FFFFFF'
    const rows = mapRows(fm(["colors:", line].join("\n")), "colors")
    expect(rows[0].line).toBe(line)
  })

  it("returns nothing when the map is absent", () => {
    expect(mapRows(fm("lang: ko"), "colors")).toEqual([])
  })
})

describe("isHeadRow", () => {
  const row = (rest: string) => ({ line: "", indent: 2, key: "k", rest })

  it("accepts an empty value and a comment-only one alike", () => {
    // Both open a nested style. Treating the annotated form as "not a head" cost
    // three catalog entries every one of their font stacks.
    expect(isHeadRow(row(""))).toBe(true)
    expect(isHeadRow(row("# h1.hero · 도현체"))).toBe(true)
  })

  it("rejects a row that actually carries a value", () => {
    // The inline flow form must NOT read as a head: minting a property-less
    // token defeats the zero-count check that would otherwise catch it.
    expect(isHeadRow(row("{ size: 56px }"))).toBe(false)
  })
})

describe("authoredScalar", () => {
  it("passes a quoted scalar through with its escapes intact", () => {
    const stack = String.raw`"\"Pretendard Variable\", Pretendard"`
    expect(authoredScalar(stack)).toBe(stack)
  })

  it("does not mistake a `#` inside a quoted scalar for a comment", () => {
    expect(authoredScalar('"a # b"   # 진짜 주석')).toBe('"a # b"')
  })

  it("strips the comment from an unquoted scalar", () => {
    expect(authoredScalar("Pretendard, sans-serif   # 본문")).toBe(
      "Pretendard, sans-serif"
    )
  })

  it("handles single quotes, which take no backslash escapes", () => {
    expect(authoredScalar("'a, b'   # note")).toBe("'a, b'")
  })
})
