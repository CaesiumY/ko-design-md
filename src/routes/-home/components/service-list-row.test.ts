import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  deriveListRowMeta,
  formatServiceListNumber,
  formatShortDate,
  isRecentServiceUpdate,
} from "./service-list-row"
import type { ServiceFrontmatter } from "@/lib/content-types"

function fm(dates: {
  created_at: string
  last_updated: string
}): ServiceFrontmatter {
  return {
    name: "데모",
    slug: "demo",
    category: "etc",
    sources: [],
    lang: "ko",
    ...dates,
  }
}

describe("formatServiceListNumber", () => {
  it("counts backward from the current list length", () => {
    expect(formatServiceListNumber(1, 6)).toBe("06")
    expect(formatServiceListNumber(6, 6)).toBe("01")
  })

  it("keeps two-digit padding for single-digit list lengths", () => {
    expect(formatServiceListNumber(1, 3)).toBe("03")
  })

  it("pads to the total count digit length for larger lists", () => {
    expect(formatServiceListNumber(100, 100)).toBe("001")
  })
})

describe("isRecentServiceUpdate", () => {
  const nowMs = Date.UTC(2026, 4, 15)

  it("treats updates from the past week as recently touched", () => {
    expect(isRecentServiceUpdate("2026-05-08", nowMs)).toBe(true)
  })

  it("does not treat updates older than one week as recently touched", () => {
    expect(isRecentServiceUpdate("2026-05-07", nowMs)).toBe(false)
  })
})

describe("formatShortDate", () => {
  // The column shows created_at, which spans the catalog's whole history — so
  // unlike the old last_updated column (always a recent date) it has to carry a
  // year, or entries added in different years become indistinguishable.
  it("includes a two-digit year", () => {
    expect(formatShortDate("2026-05-09")).toBe("26/05/09")
  })

  it("returns an empty string for a missing date", () => {
    expect(formatShortDate("")).toBe("")
  })

  it("passes through anything that is not a three-part ISO date", () => {
    expect(formatShortDate("2026-05")).toBe("2026-05")
  })
})

// The list row reads two different date fields for two independent signals.
// Keeping the derivation in one named function is what stops them being
// re-crossed later: the column is "when was this added", the badge is "was
// this touched recently".
describe("deriveListRowMeta", () => {
  const nowMs = Date.UTC(2026, 6, 27) // 2026-07-27

  it("shows the added date in the column, not the updated date", () => {
    const meta = deriveListRowMeta(
      fm({ created_at: "2026-05-09", last_updated: "2026-07-26" }),
      nowMs
    )
    expect(meta.date).toBe("26/05/09")
  })

  it("still badges an entry added long ago but synced this week", () => {
    const meta = deriveListRowMeta(
      fm({ created_at: "2026-05-09", last_updated: "2026-07-26" }),
      nowMs
    )
    expect(meta.isUpdated).toBe(true)
  })

  it("leaves the badge off a recently added entry that has not been touched since", () => {
    const meta = deriveListRowMeta(
      fm({ created_at: "2026-07-18", last_updated: "2026-07-18" }),
      nowMs
    )
    expect(meta.isUpdated).toBe(false)
  })

  it("renders no badge before hydration supplies a reference time", () => {
    const meta = deriveListRowMeta(
      fm({ created_at: "2026-07-26", last_updated: "2026-07-26" }),
      null
    )
    expect(meta.isUpdated).toBe(false)
  })
})

// The catalog's internal links are the only ones pointing at entry pages, and
// what they point AT is invisible from the rendered row — both spellings look
// identical to a reader and land on the same tab. The difference is that any
// `tab` param makes the detail head `noindex,follow` (see `buildServiceSeo`),
// so a row that pinned `tab: "preview"` sent every internal link in the
// catalog to a URL the site asks search engines not to index, leaving the
// canonical entry pages with no internal link from the home page at all.
//
// Read from source rather than from a render: the assertion is about the link
// this component ASKS for, and a render test would need the whole router to say
// the same thing while going green if the row stopped linking anywhere.
describe("catalog row link target", () => {
  it("links to the canonical entry URL, with no tab param", () => {
    const source = readFileSync(
      fileURLToPath(new URL("./service-list-row.tsx", import.meta.url)),
      "utf8"
    )

    // The control: if the Link ever moves or is renamed, this test should fail
    // loudly rather than pass by finding nothing to object to.
    expect(source).toContain('to="/services/$slug"')

    // No `search` prop at all, rather than "no `tab` inside one". Matching the
    // literal spelling would go quiet the moment the param arrived by another
    // route - a variable, a spread, a helper - and the regression it guards
    // against is invisible on screen, so a quiet guard is worse than none. The
    // row has no legitimate use for the prop, so the broad form costs nothing.
    expect(source).not.toMatch(/search=\{/)
  })
})
