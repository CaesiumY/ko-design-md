import { describe, expect, it } from "vitest"
import { mapRows } from "./frontmatter-map"

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
