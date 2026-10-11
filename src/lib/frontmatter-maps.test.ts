import { describe, expect, it } from "vitest"
import {
  FRONTMATTER_MAP_KEYS,
  NO_BLOCK_SCALAR_MAP_KEYS,
  REFERENCE_MAP_KEYS,
  ROW_SCAN_MAP_KEYS,
  TOKEN_MAP_KEYS,
} from "./frontmatter-maps"

// The lists every reader used to keep by hand, pinned as literals. Deriving the
// expectation from the table again would agree with any table at all; these
// are the values the readers held before the table existed (#432), so a trait
// flipped by accident shows up here as a diff.
describe("lists derived from the frontmatter map table", () => {
  it("keeps the four spec token maps that send the extractor to frontmatter", () => {
    expect(TOKEN_MAP_KEYS).toEqual([
      "colors",
      "typography",
      "spacing",
      "rounded",
    ])
  })

  it("allows every map past the unknown-key rule, in the order its advice prints", () => {
    // The order is user-visible: the unknown-key fix lists these keys.
    expect(FRONTMATTER_MAP_KEYS).toEqual([
      "colors",
      "typography",
      "spacing",
      "rounded",
      "components",
      "elevation",
      "gradients",
      "opacity",
      "grid",
      "fonts",
    ])
  })

  it("lets a reference point into every map", () => {
    expect(REFERENCE_MAP_KEYS).toEqual(FRONTMATTER_MAP_KEYS)
  })

  it("blocks block scalars in the token maps, elevation and components", () => {
    // Before the table this list ran elevation → components. The table follows
    // the unknown-key order instead, which only reorders the two issues when a
    // draft has a block scalar in both maps.
    expect(NO_BLOCK_SCALAR_MAP_KEYS).toEqual([
      "colors",
      "typography",
      "spacing",
      "rounded",
      "components",
      "elevation",
    ])
  })

  it("row-scans the flat maps only — typography and components nest", () => {
    expect(ROW_SCAN_MAP_KEYS).toEqual([
      "colors",
      "spacing",
      "rounded",
      "elevation",
    ])
  })
})
