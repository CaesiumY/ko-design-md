import { describe, expect, it } from "vitest"
import { DESIGN_MD_STITCH_FORMAT, readRepoFile } from "./skill-asset-paths"
import { OG_LEDE_MAX_CHARS } from "./og-lede"

// The format guide's tagline line rule caps the sentence at the length the
// share card shows whole. That number lives in `og-lede.ts`; the prompt only
// restates it, so this holds the copy to its source.
describe("design-md tagline line rule", () => {
  it("states the share card's sentence limit from og-lede", () => {
    const guide = readRepoFile(DESIGN_MD_STITCH_FORMAT)
    const rule = guide.slice(guide.indexOf("**tagline line**"))
    const stated = rule.match(/(\d+) characters or fewer/)
    expect(
      stated,
      "tagline line rule no longer states a character limit"
    ).not.toBeNull()
    expect(Number(stated![1])).toBe(OG_LEDE_MAX_CHARS)
  })
})
