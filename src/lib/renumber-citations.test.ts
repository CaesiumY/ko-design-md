import { describe, expect, it } from "vitest"
import { renumberReferences } from "./renumber-citations"

function makeBody(citations: string, refLines: Array<string>): string {
  return [
    "# Demo — design.md",
    "",
    `본문 ${citations}.`,
    "",
    "## References",
    "",
    ...refLines,
    "",
  ].join("\n")
}

describe("renumberReferences", () => {
  it("shifts all numbers down when the first reference is removed", () => {
    const body = makeBody("앞 [src:2] 뒤 [src:3]", [
      "1. label-only 번들",
      "2. https://a.example",
      "3. https://b.example",
    ])
    const r = renumberReferences(body, [1])
    expect(r.unresolvedRemovedCitations).toEqual([])
    expect(r.body).toContain("앞 [src:1] 뒤 [src:2]")
    expect(r.body).toContain("1. https://a.example")
    expect(r.body).toContain("2. https://b.example")
    expect(r.body).not.toContain("label-only 번들")
    expect(r.body).not.toMatch(/^3\. /m)
  })

  it("renumbers around a removed middle reference", () => {
    const body = makeBody("[src:1] 과 [src:3]", [
      "1. https://a.example",
      "2. label-only 번들",
      "3. https://b.example",
    ])
    const r = renumberReferences(body, [2])
    expect(r.body).toContain("[src:1] 과 [src:2]")
    expect(r.body).toContain("1. https://a.example")
    expect(r.body).toContain("2. https://b.example")
    expect(r.body).not.toContain("label-only 번들")
  })

  it("reports removed refs that are still cited (caller must clear them first)", () => {
    const body = makeBody("[src:1][src:2]", [
      "1. label-only 번들",
      "2. https://a.example",
    ])
    const r = renumberReferences(body, [1])
    expect(r.unresolvedRemovedCitations).toContain(1)
  })

  it("exposes the old->new mapping for kept references", () => {
    const body = makeBody("[src:2][src:3]", [
      "1. label-only 번들",
      "2. https://a.example",
      "3. https://b.example",
    ])
    const r = renumberReferences(body, [1])
    expect(r.mapping).toEqual([
      { from: 2, to: 1 },
      { from: 3, to: 2 },
    ])
  })

  it("removes multiple label refs and renumbers the survivors in order", () => {
    const body = makeBody("[src:3][src:5]", [
      "1. label A",
      "2. https://a.example",
      "3. https://b.example",
      "4. label B",
      "5. https://c.example",
    ])
    const r = renumberReferences(body, [1, 4])
    // survivors: old 2,3,5 -> new 1,2,3
    expect(r.body).toContain("[src:2][src:3]")
    expect(r.body).toContain("1. https://a.example")
    expect(r.body).toContain("2. https://b.example")
    expect(r.body).toContain("3. https://c.example")
    expect(r.body).not.toContain("label A")
    expect(r.body).not.toContain("label B")
  })
})
