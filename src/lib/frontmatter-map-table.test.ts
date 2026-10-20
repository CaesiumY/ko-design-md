import { describe, expect, it } from "vitest"
import {
  FRONTMATTER_MAPS,
  FRONTMATTER_MAP_KEYS,
  REFERENCE_MAP_KEYS,
  ROW_SCAN_MAP_KEYS,
} from "./frontmatter-map-table"

// The lists every reader used to keep by hand, pinned as literals. Deriving the
// expectation from the table again would agree with any table at all; these
// are the values the readers held before the table existed (#432), so a trait
// flipped by accident shows up here as a diff.
describe("lists derived from the frontmatter map table", () => {
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

  it("marks the maps the spec schema knows — the rest are catalog-only", () => {
    // No reader filters on this trait yet, so nothing else would notice it
    // drifting; the pin is the only guard.
    expect(
      FRONTMATTER_MAP_KEYS.filter((name) => FRONTMATTER_MAPS[name].spec)
    ).toEqual(["colors", "typography", "spacing", "rounded", "components"])
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
