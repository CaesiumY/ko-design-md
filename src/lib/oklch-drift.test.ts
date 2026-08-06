import { describe, expect, it } from "vitest"
import {
  alignToPreviewNames,
  findPreviewDrift,
  readDefinitions,
} from "./oklch-drift"

const md = `
gray-06: oklch(0.67 0 0)     # #949494
gray-07: oklch(0.68 0 0)     # #999999
brand:   oklch(0.62 0.24 27) # #FF0038
`

describe("readDefinitions", () => {
  // A design.md may restate the same semantic alias per theme — `wanted` does,
  // under `### Semantic alias — Light` and `— Dark`. With no theme context to
  // choose with, the old last-wins behaviour handed the gate the DARK value
  // while it compares a LIGHT preview, and every such token reported a
  // disagreement that did not exist.
  const themed = `
### Semantic alias — Light

bg-canvas: oklch(1 0 0)

### Semantic alias — Dark

bg-canvas: oklch(0.148 0.004 277)
`

  it("drops a name stated twice with different values", () => {
    expect(readDefinitions(themed).has("bg-canvas")).toBe(false)
  })

  it("keeps the other definitions in a file that has a conflict", () => {
    const doc = `${themed}
brand: oklch(0.62 0.24 27)
`
    expect(readDefinitions(doc).get("brand")).toBe("oklch(0.62 0.24 27)")
  })

  it("keeps a name restated with the SAME value", () => {
    // Repetition is not ambiguity. `wanted` restates `fg-on-brand` as
    // `oklch(1 0 0)` in both theme blocks, and that value is still checkable.
    const doc = `
fg-on-brand: oklch(1 0 0)
fg-on-brand: oklch(1.000 0 0)
`
    expect(readDefinitions(doc).get("fg-on-brand")).toBe("oklch(1 0 0)")
  })

  it("does not care what a token name contains", () => {
    // The rule is about conflicting definitions, not about the word "dark"
    // appearing anywhere — `codeit` has 78 uniquely-named `dark-gray-*` tokens
    // that must stay checkable.
    const doc = `
dark-gray-00: oklch(0.2 0 0)
`
    expect(readDefinitions(doc).get("dark-gray-00")).toBe("oklch(0.2 0 0)")
  })
})

describe("alignToPreviewNames", () => {
  const defs = (entries: Record<string, string>): Map<string, string> =>
    new Map(Object.entries(entries))

  it("adds the definition under the name the preview uses", () => {
    const out = alignToPreviewNames(
      defs({ "blue-500": "oklch(0.62 0.19 258)" }),
      "toss"
    )
    expect(out.get("tds-blue-500")).toBe("oklch(0.62 0.19 258)")
  })

  it("keeps the original name too, so an unprefixed preview still matches", () => {
    const out = alignToPreviewNames(
      defs({ "blue-500": "oklch(0.62 0.19 258)" }),
      "toss"
    )
    expect(out.get("blue-500")).toBe("oklch(0.62 0.19 258)")
  })

  it("never overwrites a name the md already defines", () => {
    // class101's preview declares BOTH `--primary` and `--c101-primary`, so the
    // alias for `primary` collides with a real md token. The md definition is
    // the authority; letting the alias win would report the wrong expected
    // value for whichever token loses. They agree in the catalogue today, which
    // is exactly why this needs a fixture rather than a corpus assertion.
    const out = alignToPreviewNames(
      defs({
        primary: "oklch(0.68 0.21 41)",
        "c101-primary": "oklch(0.5 0 0)",
      }),
      "class101"
    )
    expect(out.get("c101-primary")).toBe("oklch(0.5 0 0)")
  })

  it("applies the first matching rule and stops", () => {
    // line-design-system needs two: the `ldsg-color-` family loses that infix,
    // everything else just gains the namespace.
    const out = alignToPreviewNames(
      defs({
        "ldsg-color-linegreen": "oklch(0.72 0.205 149)",
        radius: "oklch(0 0 0)",
      }),
      "line-design-system"
    )
    expect(out.get("ldsg-linegreen")).toBe("oklch(0.72 0.205 149)")
    expect(out.get("ldsg-radius")).toBe("oklch(0 0 0)")
    expect(out.has("ldsg-ldsg-color-linegreen")).toBe(false)
  })

  it("drops an alias that two md names would fold onto with different values", () => {
    // teamsparta's rules are `brand-` -> `sp-` then a `sp-` catch-all, so
    // `brand-red` and a bare `red` both produce `sp-red`. Whichever came first
    // in the md would win on declaration order alone and the gate would compare
    // against a value chosen by nothing. The catalogue has no such collision
    // today (measured: 0 across all 17 slugs), which is why this is a fixture.
    const out = alignToPreviewNames(
      defs({ "brand-red": "oklch(0.61 0.21 19)", red: "oklch(0.5 0.2 19)" }),
      "teamsparta"
    )
    expect(out.has("sp-red")).toBe(false)
  })

  it("keeps the alias when both md names carry the same value", () => {
    const out = alignToPreviewNames(
      defs({ "brand-red": "oklch(0.61 0.21 19)", red: "oklch(0.61 0.21 19)" }),
      "teamsparta"
    )
    expect(out.get("sp-red")).toBe("oklch(0.61 0.21 19)")
  })

  it("does not double a namespace the md name already carries", () => {
    // class101's only rule is a catch-all prepend, so an md name that already
    // reads `c101-…` would gain `c101-c101-…` — a name no preview declares.
    const out = alignToPreviewNames(
      defs({ "c101-primary": "oklch(0.68 0.21 41)" }),
      "class101"
    )
    expect(out.has("c101-c101-primary")).toBe(false)
  })

  it("still rewrites a name that starts with a replacement rule's target", () => {
    // The guard above must not catch this: `ldsg-color-` -> `ldsg-` legitimately
    // rewrites a name that already starts with `ldsg-`. Applying the guard to
    // replacement rules as well would silently drop this slug's whole palette.
    const out = alignToPreviewNames(
      defs({ "ldsg-color-linegreen": "oklch(0.72 0.205 149)" }),
      "line-design-system"
    )
    expect(out.get("ldsg-linegreen")).toBe("oklch(0.72 0.205 149)")
  })

  it("adds nothing for a slug with no rules", () => {
    const input = defs({ "gray-06": "oklch(0.67 0 0)" })
    expect([...alignToPreviewNames(input, "11st")]).toEqual([...input])
  })

  it("never hands back the caller's own map", () => {
    // The contract has to be the same for every slug. Returning the input for
    // the no-rules case and a copy otherwise means a caller that mutates the
    // result corrupts `readDefinitions` output for half the catalogue and not
    // the other half — a bug that would reproduce per slug.
    const input = defs({ "gray-06": "oklch(0.67 0 0)" })
    expect(alignToPreviewNames(input, "11st")).not.toBe(input)
    expect(alignToPreviewNames(input, "toss")).not.toBe(input)
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
