import { describe, expect, it } from "vitest"
import { sortDocsByAdded, sortDocsByUpdated } from "./content-parser"
import type { ServiceDoc } from "./content-types"

function makeDoc(
  name: string,
  created_at: string,
  last_updated: string
): ServiceDoc {
  const slug = name.toLowerCase().replace(/\s+/g, "-")
  return {
    frontmatter: {
      name,
      slug,
      category: "etc",
      last_updated,
      created_at,
      lang: "ko",
    },
    raw: "",
    body: "",
    tagline: "",
    filePath: `/services/${slug}.md`,
    estimatedTokens: 0,
  }
}

const names = (docs: Array<ServiceDoc>): Array<string> =>
  docs.map((d) => d.frontmatter.name)

// The catalog's two orderings are deliberately different signals: the list,
// llms.txt, sitemap and OG build read "recently added", while RSS reads
// "recently changed". Keeping them as two named comparators makes the split
// explicit instead of leaving it to whoever calls sort last.
describe("sortDocsByAdded", () => {
  it("orders by created_at descending — newest addition first", () => {
    const sorted = sortDocsByAdded([
      makeDoc("Old", "2026-05-09", "2026-05-09"),
      makeDoc("New", "2026-07-18", "2026-07-18"),
      makeDoc("Mid", "2026-06-03", "2026-06-03"),
    ])
    expect(names(sorted)).toEqual(["New", "Mid", "Old"])
  })

  it("ignores last_updated — an old entry synced today stays at the bottom", () => {
    const sorted = sortDocsByAdded([
      makeDoc("Added recently", "2026-07-18", "2026-07-18"),
      makeDoc("Added long ago, synced today", "2026-05-09", "2026-07-26"),
    ])
    expect(names(sorted)[0]).toBe("Added recently")
  })

  it("breaks created_at ties on name using Korean collation", () => {
    const sorted = sortDocsByAdded([
      makeDoc("나중", "2026-05-14", "2026-05-14"),
      makeDoc("가나", "2026-05-14", "2026-05-14"),
    ])
    expect(names(sorted)).toEqual(["가나", "나중"])
  })

  it("returns a new array so the shared module-level catalog is never reordered in place", () => {
    const input = [
      makeDoc("A", "2026-05-09", "2026-05-09"),
      makeDoc("B", "2026-07-18", "2026-07-18"),
    ]
    const sorted = sortDocsByAdded(input)
    expect(sorted).not.toBe(input)
    expect(names(input)).toEqual(["A", "B"])
  })
})

describe("sortDocsByUpdated", () => {
  it("orders by last_updated descending — the RSS feed's own order", () => {
    const sorted = sortDocsByUpdated([
      makeDoc("Stale", "2026-05-09", "2026-05-09"),
      makeDoc("Synced today", "2026-05-10", "2026-07-26"),
    ])
    expect(names(sorted)).toEqual(["Synced today", "Stale"])
  })

  it("ignores created_at — a newly added entry does not jump the feed", () => {
    const sorted = sortDocsByUpdated([
      makeDoc("Added today, never synced", "2026-07-18", "2026-07-18"),
      makeDoc("Added in May, synced last week", "2026-05-09", "2026-07-26"),
    ])
    expect(names(sorted)[0]).toBe("Added in May, synced last week")
  })

  it("returns a new array so the shared module-level catalog is never reordered in place", () => {
    const input = [
      makeDoc("A", "2026-05-09", "2026-05-09"),
      makeDoc("B", "2026-05-10", "2026-07-26"),
    ]
    const sorted = sortDocsByUpdated(input)
    expect(sorted).not.toBe(input)
    expect(names(input)).toEqual(["A", "B"])
  })
})
