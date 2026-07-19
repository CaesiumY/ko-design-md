import { describe, expect, it } from "vitest"
import { findPreviewDrift, readDefinitions } from "./oklch-drift"

const md = `
gray-06: oklch(0.67 0 0)     # #949494
gray-07: oklch(0.68 0 0)     # #999999
brand:   oklch(0.62 0.24 27) # #FF0038
`

describe("findPreviewDrift", () => {
  it("catches a preview value that drifted from its md definition", () => {
    // The shipped 11st defect: gray-06 holding gray-07's colour.
    const found = findPreviewDrift(
      ":root { --gray-06: oklch(0.68 0 0); --gray-07: oklch(0.68 0 0); }",
      readDefinitions(md)
    )
    expect(found).toEqual([
      {
        name: "gray-06",
        preview: "oklch(0.68 0 0)",
        expected: "oklch(0.67 0 0)",
      },
    ])
  })

  it("accepts values that agree", () => {
    const found = findPreviewDrift(
      ":root { --gray-06: oklch(0.67 0 0); --gray-07: oklch(0.68 0 0); }",
      readDefinitions(md)
    )
    expect(found).toEqual([])
  })

  it("treats trailing-zero and spacing differences as equal", () => {
    const found = findPreviewDrift(
      ":root { --gray-06: oklch( 0.670  0   0 ); }",
      readDefinitions(md)
    )
    expect(found).toEqual([])
  })

  it("ignores declarations inside a dark-theme block", () => {
    // A dark preview restates tokens with dark-mode values by design — comparing
    // those against the light-frozen md would flag every one of them.
    const found = findPreviewDrift(
      `:root { --gray-06: oklch(0.67 0 0); }
       [data-theme="dark"] { --gray-06: oklch(0.30 0 0); }`,
      readDefinitions(md)
    )
    expect(found).toEqual([])
  })

  it("resumes checking after the dark block closes", () => {
    const found = findPreviewDrift(
      `[data-theme="dark"] { --gray-06: oklch(0.30 0 0); }
       :root { --gray-07: oklch(0.99 0 0); }`,
      readDefinitions(md)
    )
    expect(found.map((f) => f.name)).toEqual(["gray-07"])
  })

  it("ignores custom properties with no matching token name", () => {
    // Exact names only — `--on-brand` must not be paired with `brand`.
    const found = findPreviewDrift(
      ":root { --on-brand: oklch(1 0 0); --shadow-tint: oklch(0 0 0); }",
      readDefinitions(md)
    )
    expect(found).toEqual([])
  })
})
