import { describe, expect, it } from "vitest"
import { findPreviewDrift, readDefinitions } from "./oklch-drift"

const md = `
gray-06: oklch(0.67 0 0)     # #949494
gray-07: oklch(0.68 0 0)     # #999999
brand:   oklch(0.62 0.24 27) # #FF0038
`

describe("readDefinitions", () => {
  // A design.md may state the same semantic alias twice — once for light, once
  // for dark. `wanted` does exactly that (`### Semantic alias — Light` and
  // `— Dark` declaring the same keys). The gate compares the LIGHT preview, so
  // the light value is the one it needs; taking the dark one reports a
  // disagreement that does not exist.
  //
  // This mirrors what `findPreviewDrift` already does on the preview side,
  // where `[data-theme="dark"]` blocks are skipped. Until now only one half of
  // that symmetry existed.
  const themed = `
## Colors

### Semantic alias — Light

bg-canvas: oklch(1 0 0)

### Semantic alias — Dark

bg-canvas: oklch(0.148 0.004 277)
`

  it("keeps the light definition when a dark section restates it", () => {
    expect(readDefinitions(themed).get("bg-canvas")).toBe("oklch(1 0 0)")
  })

  it("resumes reading after the dark section ends", () => {
    const md = `${themed}
## Typography

brand: oklch(0.62 0.24 27)
`
    expect(readDefinitions(md).get("brand")).toBe("oklch(0.62 0.24 27)")
  })

  it("does not skip a section merely because a token name contains dark", () => {
    // The heading is what scopes a block, not the tokens inside it.
    const md = `
### Semantic alias

surface-darker: oklch(0.2 0 0)
`
    expect(readDefinitions(md).get("surface-darker")).toBe("oklch(0.2 0 0)")
  })
})

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

  it("counts braces inside <style> only, so script literals cannot skew depth", () => {
    // An unbalanced-looking object literal outside the stylesheet must not shift
    // the nesting depth the dark-scope test relies on.
    const html = `<script>const cfg = { theme: { mode: "dark" } }</script>
      <style>
        :root { --gray-06: oklch(0.68 0 0); }
        [data-theme="dark"] { --gray-07: oklch(0.30 0 0); }
      </style>`
    const found = findPreviewDrift(html, readDefinitions(md))
    expect(found.map((f) => f.name)).toEqual(["gray-06"])
  })

  it("ignores custom properties with no matching token name", () => {
    // Exact names only — `--on-brand` must not be paired with `brand`.
    const found = findPreviewDrift(
      ":root { --on-brand: oklch(1 0 0); --shadow-tint: oklch(0 0 0); }",
      readDefinitions(md)
    )
    expect(found).toEqual([])
  })

  // The scanner reads raw CSS, so anything a comment happens to contain is read
  // as if it were code. That is not hypothetical: codeit's preview documents its
  // own theme layering in a banner comment, and the sentence disabled the check
  // for that whole file. A comment describing the rule must not switch it off.
  it("does not let a dark selector inside a comment close the light scope", () => {
    const found = findPreviewDrift(
      `/* THEME-VARIANT (re-declared under [data-theme="dark"]): gray ramp */
       :root { --gray-06: oklch(0.68 0 0); }`,
      readDefinitions(md)
    )
    expect(found.map((f) => f.name)).toEqual(["gray-06"])
  })

  it("does not let braces inside a comment shift the nesting depth", () => {
    const found = findPreviewDrift(
      `:root { --gray-06: oklch(0.68 0 0); /* } [data-theme="dark"] { */ }
       :root { --gray-07: oklch(0.99 0 0); }`,
      readDefinitions(md)
    )
    expect(found.map((f) => f.name)).toEqual(["gray-06", "gray-07"])
  })

  it("treats a comment as a token separator, not as nothing", () => {
    // In CSS a comment separates tokens, so `--gray-0<comment>6` is not the
    // property `--gray-06`. Blanking the comment to spaces keeps the halves
    // apart; deleting it would splice them and invent a declaration that the
    // stylesheet does not contain — and then compare it against the md.
    const found = findPreviewDrift(
      ":root { --gray-0/**/6: oklch(0.68 0 0); }",
      readDefinitions(md)
    )
    expect(found).toEqual([])
  })

  it("still honours a real dark block that follows a comment mentioning one", () => {
    // Removing comment text must not make the scanner blind to the real thing.
    const found = findPreviewDrift(
      `/* tokens below are re-declared under [data-theme="dark"] */
       :root { --gray-06: oklch(0.67 0 0); }
       [data-theme="dark"] { --gray-07: oklch(0.30 0 0); }`,
      readDefinitions(md)
    )
    expect(found).toEqual([])
  })

  it("does not treat an unterminated comment as code", () => {
    // A truncated file must fail closed — reading the rest as CSS would let a
    // half-written comment invent declarations.
    const found = findPreviewDrift(
      `:root { --gray-06: oklch(0.68 0 0); }
       /* trailing comment that never closes --gray-07: oklch(0.99 0 0);`,
      readDefinitions(md)
    )
    expect(found.map((f) => f.name)).toEqual(["gray-06"])
  })
})
