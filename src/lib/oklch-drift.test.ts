import { describe, expect, it } from "vitest"
import {
  alignToPreviewNames,
  conflictingDefinitions,
  findPreviewDrift,
  findRoleChainDrift,
  readDefinitions,
  readReferenceRows,
  roleChainCoverage,
  roleChainsForSlug,
} from "./oklch-drift"

const md = `
gray-06: oklch(0.67 0 0)     # #949494
gray-07: oklch(0.68 0 0)     # #999999
brand:   oklch(0.62 0.24 27) # #FF0038
`

describe("readDefinitions", () => {
  // A design.md may restate the same semantic alias per theme — `wanted` once
  // did, under `### Semantic alias — Light` and `— Dark` (it now prefixes the
  // dark side, `dark-bg-canvas`; this fixture keeps the shape). With no theme context to
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

describe("conflictingDefinitions", () => {
  it("reports the name and both values when they disagree", () => {
    const doc = `
bg-canvas: oklch(1 0 0)
bg-canvas: oklch(0.148 0.004 277)
`
    expect([...conflictingDefinitions(doc)]).toEqual([
      ["bg-canvas", ["oklch(1 0 0)", "oklch(0.148 0.004 277)"]],
    ])
  })

  it("counts distinct values, not declarations", () => {
    // Three declarations, two answers. A caller that reads this length as
    // "declared N times" reports 2 for a name written 3 times — the message in
    // draft-validator did exactly that until this fixture pinned the meaning.
    const doc = `
x: oklch(1 0 0)
x: oklch(0.5 0 0)
x: oklch(1 0 0)
`
    expect(conflictingDefinitions(doc).get("x")).toEqual([
      "oklch(1 0 0)",
      "oklch(0.5 0 0)",
    ])
  })

  it("says nothing about a name restated with the same value", () => {
    // Normalised before comparing, so trailing zeros are not a disagreement.
    const doc = `
fg-on-brand: oklch(1 0 0)
fg-on-brand: oklch(1.000 0 0)
`
    expect(conflictingDefinitions(doc).size).toBe(0)
  })

  it("reports exactly what readDefinitions drops", () => {
    // The two must not drift apart: the warn built on this function would
    // otherwise describe a different set than the gate actually skips.
    const doc = `
bg-canvas: oklch(1 0 0)
bg-canvas: oklch(0.148 0.004 277)
brand: oklch(0.62 0.24 27)
`
    const kept = readDefinitions(doc)
    for (const name of conflictingDefinitions(doc).keys()) {
      expect(kept.has(name)).toBe(false)
    }
    expect(kept.has("brand")).toBe(true)
  })
})

// The frontmatter is read by `readFrontmatter` (docs/adr/0011), as YAML reads
// it — not by a line regex of this file's own. What YAML calls a token value is
// what the gate compares, whatever its quoting or indentation, and text that
// YAML does not read as a `key: value` row is not a definition.
describe("readDefinitions — frontmatter as YAML reads it", () => {
  it("reads a token however deep it is indented", () => {
    const doc = `---
colors:
    brand: oklch(0.62 0.24 27) # #FF0038
---
# 본문
`
    expect(readDefinitions(doc).get("brand")).toBe("oklch(0.62 0.24 27)")
  })

  it("reads a quoted token value as the value YAML reads", () => {
    const doc = `---
colors:
  brand: "oklch(0.62 0.24 27)"
---
`
    expect(readDefinitions(doc).get("brand")).toBe("oklch(0.62 0.24 27)")
  })

  it("reads a colour whose value opens with blanks, as the sidecar publishes it", () => {
    const doc = `---
colors:
  quoted: "  oklch(0.62 0.24 27)"
  block: |

    oklch(0.5 0 0)
---
`
    const defs = readDefinitions(doc)
    expect(defs.get("quoted")).toBe("oklch(0.62 0.24 27)")
    expect(defs.get("block")).toBe("oklch(0.5 0 0)")
  })

  it("does not read a definition-shaped line inside a block scalar", () => {
    // The text inside `|` is one string value of `note`, not a row.
    const doc = `---
note: |
  fake: oklch(0.1 0 0)
colors:
  brand: oklch(0.62 0.24 27)
---
`
    const defs = readDefinitions(doc)
    expect(defs.has("fake")).toBe(false)
    expect(defs.get("brand")).toBe("oklch(0.62 0.24 27)")
  })

  it("drops a name that two maps define with different values", () => {
    const doc = `---
colors:
  bg-canvas: oklch(1 0 0)
dark:
  bg-canvas: oklch(0.148 0.004 277)
---
`
    expect(readDefinitions(doc).has("bg-canvas")).toBe(false)
    expect([...conflictingDefinitions(doc)]).toEqual([
      ["bg-canvas", ["oklch(1 0 0)", "oklch(0.148 0.004 277)"]],
    ])
  })

  it("reads nothing from a frontmatter YAML cannot read", () => {
    // The validator's `frontmatter-yaml-invalid` names the one cause; a regex
    // guess at a broken block would only add findings built on a misreading.
    const doc = `---
colors:
  brand: oklch(0.62 0.24 27)
  brand: oklch(0.5 0 0)
---
`
    expect(readDefinitions(doc).size).toBe(0)
    expect(conflictingDefinitions(doc).size).toBe(0)
  })

  it("does not read the body of a document that has a frontmatter", () => {
    const doc = `---
colors:
  brand: oklch(0.62 0.24 27)
---
\`\`\`text
fg: oklch(0.2 0 0)
\`\`\`
`
    expect([...readDefinitions(doc).keys()]).toEqual(["brand"])
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
    // yeogi's rules are `yeogi-` -> `yg-` then a `yg-` catch-all, so
    // `yeogi-red` and a bare `red` both produce `yg-red`. Whichever came first
    // in the md would win on declaration order alone and the gate would compare
    // against a value chosen by nothing. The catalogue has no such collision
    // today, which is why this is a fixture.
    const out = alignToPreviewNames(
      defs({ "yeogi-red": "oklch(0.61 0.21 19)", red: "oklch(0.5 0.2 19)" }),
      "yeogi"
    )
    expect(out.has("yg-red")).toBe(false)
  })

  it("keeps the alias when both md names carry the same value", () => {
    const out = alignToPreviewNames(
      defs({ "yeogi-red": "oklch(0.61 0.21 19)", red: "oklch(0.61 0.21 19)" }),
      "yeogi"
    )
    expect(out.get("yg-red")).toBe("oklch(0.61 0.21 19)")
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

  // The two inputs a late review of PR #670 found the regex scanner read
  // differently from the HTML tokenizer (#624).
  // `<title-card>` is a custom element, not `<title>`: its content is markup,
  // and the stylesheet after it applies. `<style-guide>` is not a stylesheet
  // either.
  it.each([
    "<title-card>Toss</title-card>",
    "<script-runner></script-runner>",
    "<textarea-field></textarea-field>",
    "<style-guide>:root { --gray-07: oklch(0.99 0 0); }</style-guide>",
  ])(
    "reads a <style> after a custom element named like a raw-text one: %s",
    (element) => {
      const sheet = "<style>:root { --gray-06: oklch(0.68 0 0); }</style>"
      expect(
        findPreviewDrift(element + sheet, readDefinitions(md)).map(
          (f) => f.name
        )
      ).toEqual(["gray-06"])
    }
  )

  it("reads past a <template> inside <svg> or <math>", () => {
    // Inside foreign content a `<template>` tag is an SVG or MathML element
    // with no content fragment; its children are ordinary children, and the
    // stylesheet beside it still applies.
    const sheet = "<style>:root { --gray-06: oklch(0.68 0 0); }</style>"
    for (const foreign of [
      "<svg><template></template></svg>",
      "<svg><template><g></g></template></svg>",
      "<math><template></template></math>",
    ]) {
      expect(
        findPreviewDrift(foreign + sheet, readDefinitions(md)).map(
          (f) => f.name
        ),
        foreign
      ).toEqual(["gray-06"])
    }
  })

  it.each([
    [
      "directly",
      "<math><style>:root { --gray-07: oklch(0.99 0 0); }</style></math>",
    ],
    [
      "inside a <template>",
      "<math><template><style>:root { --gray-07: oklch(0.99 0 0); }</style></template></math>",
    ],
  ])("reads no stylesheet out of a MathML <style> %s", (_label, math) => {
    // A browser applies an HTML or SVG `<style>`, not one parsed as MathML.
    const sheet = "<style>:root { --gray-06: oklch(0.68 0 0); }</style>"
    expect(
      findPreviewDrift(sheet + math, readDefinitions(md)).map((f) => f.name)
    ).toEqual(["gray-06"])
  })

  it.each([
    [
      "a MathML <style>",
      "<math><style><mi><style>:root { --gray-07: oklch(0.99 0 0); }</style></mi></style></math>",
    ],
    [
      "an SVG <style>",
      "<svg><style><svg><style>:root { --gray-07: oklch(0.99 0 0); }</style></svg></style></svg>",
    ],
  ])(
    "reads a stylesheet nested inside %s, as the browser does",
    (_label, nested) => {
      // A foreign `<style>` holds markup; an element inside it that returns to
      // HTML or SVG may hold a `<style>` the browser applies.
      const sheet = "<style>:root { --gray-06: oklch(0.68 0 0); }</style>"
      expect(
        findPreviewDrift(sheet + nested, readDefinitions(md)).map((f) => f.name)
      ).toEqual(["gray-06", "gray-07"])
    }
  )

  // A `<style>` written inside an attribute value is not a stylesheet, and a
  // `<script>` there does not swallow the stylesheet after it.
  it.each([
    `<div data-x="<style>:root { --gray-07: oklch(0.99 0 0); }</style>"></div>`,
    `<div data-x='<script>'></div>`,
    `<div title="<!--"></div>`,
  ])("reads a quoted attribute value as text, not as markup: %s", (element) => {
    const sheet = "<style>:root { --gray-06: oklch(0.68 0 0); }</style>"
    expect(
      findPreviewDrift(element + sheet, readDefinitions(md)).map((f) => f.name)
    ).toEqual(["gray-06"])
  })

  // A browser applies an SVG <style> to the document. Inside <svg> the HTML
  // parser reads markup, not raw text: a `<!--` opens a real comment, whose
  // CSS does not apply, and a CDATA section is text.
  it.each([
    [
      "applies an <svg> stylesheet",
      "<svg><style>:root { --gray-06: oklch(0.68 0 0); }</style></svg>",
      ["gray-06"],
    ],
    [
      "drops an HTML comment inside an <svg> stylesheet",
      "<svg><style><!-- :root { --gray-06: oklch(0.68 0 0); } --></style></svg>",
      [],
    ],
    [
      "reads a CDATA section inside an <svg> stylesheet",
      "<svg><style><![CDATA[:root { --gray-06: oklch(0.68 0 0); }]]></style></svg>",
      ["gray-06"],
    ],
  ])("%s", (_, html, names) => {
    expect(
      findPreviewDrift(html, readDefinitions(md)).map((f) => f.name)
    ).toEqual(names)
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

describe("findRoleChainDrift", () => {
  // A role published as a reference row (`text-primary: "{colors.gray-800}"`)
  // carries no `oklch` of its own, so findPreviewDrift never sees it, and the
  // preview wires it as `--sf-text-primary: var(--sf-gray-800)`. Repointing that
  // `var()` at another step used to pass every gate.
  const roles = `---
colors:
  gray-800: oklch(0.3 0 0)
  gray-600: oklch(0.5 0 0)
  gray-100: oklch(0.95 0 0)
  text-primary: "{colors.gray-800}"
  bg-base: "{colors.gray-100}"
  dark-bg-base: "{colors.gray-800}"
---
`

  it("catches a light role wired to another palette step", () => {
    const found = findRoleChainDrift(
      `:root { --sf-text-primary: var(--sf-gray-600); --sf-bg-base: var(--sf-gray-100); }
       [data-theme="dark"] { --sf-bg-base: var(--sf-gray-800); }`,
      roleChainsForSlug(roles, "socar")
    )
    expect(found).toEqual([
      {
        name: "sf-text-primary",
        scope: "light",
        preview: "var(--sf-gray-600)",
        expected: "var(--sf-gray-800)",
      },
    ])
  })

  it("holds a dark-scope role to its `dark-` row", () => {
    const found = findRoleChainDrift(
      `:root { --sf-bg-base: var(--sf-gray-100); }
       [data-theme="dark"] { --sf-bg-base: var(--sf-gray-600); }`,
      roleChainsForSlug(roles, "socar")
    )
    expect(found).toEqual([
      {
        name: "sf-bg-base",
        scope: "dark",
        preview: "var(--sf-gray-600)",
        expected: "var(--sf-gray-800)",
      },
    ])
  })

  it("holds a role with no `dark-` row to its light step in the dark scope too", () => {
    // socar is light-only and its preview restates the light wiring under the
    // dark selector: a repointing there alone must not pass.
    const found = findRoleChainDrift(
      `:root { --sf-text-primary: var(--sf-gray-800); }
       [data-theme="dark"] { --sf-text-primary: var(--sf-gray-100); }`,
      roleChainsForSlug(roles, "socar")
    )
    expect(found.map((f) => `${f.scope} ${f.name}`)).toEqual([
      "dark sf-text-primary",
    ])
  })

  it("accepts a preview wired where the rows point, and leaves literals out", () => {
    const found = findRoleChainDrift(
      `:root { --sf-text-primary: var( --sf-gray-800 ); --sf-bg-base: #fff; }
       [data-theme="dark"] {
         --sf-text-primary: oklch(0.9 0 0);
         --sf-bg-base: var(--sf-gray-800);
       }`,
      roleChainsForSlug(roles, "socar")
    )
    expect(found).toEqual([])
  })

  it("compares the declaration each scope ends with, as the cascade does", () => {
    // codeit's shape: the dark half first restates the light wiring under the
    // dark selector, then overrides it. Only the override paints.
    const chains = roleChainsForSlug(roles, "socar")
    const overridden = `[data-theme="dark"] { --sf-bg-base: var(--sf-gray-100); }
       [data-theme="dark"] { --sf-bg-base: var(--sf-gray-800); }`
    expect(findRoleChainDrift(overridden, chains)).toEqual([])
    const reversed = `[data-theme="dark"] { --sf-bg-base: var(--sf-gray-800); }
       [data-theme="dark"] { --sf-bg-base: var(--sf-gray-100); }`
    expect(findRoleChainDrift(reversed, chains).map((f) => f.name)).toEqual([
      "sf-bg-base",
    ])
  })

  it("does not let a later local selector hide a wrong root value", () => {
    // The page renders the `:root` value everywhere `.chip` is not.
    const chains = roleChainsForSlug(roles, "socar")
    const html = `:root { --sf-text-primary: var(--sf-gray-600); }
       .chip { --sf-text-primary: var(--sf-gray-800); }`
    expect(findRoleChainDrift(html, chains).map((f) => f.name)).toEqual([
      "sf-text-primary",
    ])
    expect(roleChainCoverage(html, chains)).toEqual({
      chained: 1,
      literal: 0,
      scoped: 1,
    })
  })

  it("does not read a local override as the theme's value", () => {
    // An inverse band inside a light page is a legitimate re-wiring.
    const chains = roleChainsForSlug(roles, "socar")
    const html = `:root { --sf-text-primary: var(--sf-gray-800); }
       .inverse { --sf-text-primary: var(--sf-gray-100); }
       [data-theme="dark"] .card { --sf-bg-base: var(--sf-gray-100); }`
    expect(findRoleChainDrift(html, chains)).toEqual([])
    expect(roleChainCoverage(html, chains).scoped).toBe(2)
  })

  it("does not let a conditional root block hide a wrong base value", () => {
    // Codex's socar reproduction: the base is wrong below 1000px.
    const chains = roleChainsForSlug(roles, "socar")
    const html = `:root { --sf-text-primary: var(--sf-gray-100); }
       @media (min-width: 1000px) { :root { --sf-text-primary: var(--sf-gray-800); } }`
    expect(findRoleChainDrift(html, chains)).toEqual([
      {
        name: "sf-text-primary",
        scope: "light",
        preview: "var(--sf-gray-100)",
        expected: "var(--sf-gray-800)",
      },
    ])
  })

  it("does not let a conditional <style> element hide a wrong base value", () => {
    // The @media bypass again, written as HTML: a `media` attribute, or a
    // stylesheet that only applies once a <template> is stamped out.
    const chains = roleChainsForSlug(roles, "socar")
    const base = `<style>:root { --sf-text-primary: var(--sf-gray-100); }</style>`
    for (const conditional of [
      `<style media="(min-width: 1000px)">:root { --sf-text-primary: var(--sf-gray-800); }</style>`,
      `<template><style>:root { --sf-text-primary: var(--sf-gray-800); }</style></template>`,
    ]) {
      const html = base + conditional
      expect(findRoleChainDrift(html, chains), conditional).toEqual([
        {
          name: "sf-text-primary",
          scope: "light",
          preview: "var(--sf-gray-100)",
          expected: "var(--sf-gray-800)",
        },
      ])
      expect(roleChainCoverage(html, chains).scoped, conditional).toBe(1)
    }
  })

  describe("reads no stylesheet out of comments, raw text or a non-CSS <style>", () => {
    // None of these is applied by a browser, so none may hide the wrong base.
    // <noscript> is raw text too: a browser parses with scripting on, as the
    // Chromium that measures contrast does.
    const chains = roleChainsForSlug(roles, "socar")
    const base = `<style>:root { --sf-text-primary: var(--sf-gray-100); }</style>`
    const fix = `<style>:root { --sf-text-primary: var(--sf-gray-800); }</style>`
    it.each([
      ["a comment", `${base}<!-- ${fix} -->`],
      [
        "a <script>",
        `${base}<script>const css = "${fix.replace(/"/g, "'")}"</script>`,
      ],
      ["a <textarea>", `${base}<textarea>${fix}</textarea>`],
      ["a <title>", `${base}<title>${fix}</title>`],
      [
        "a non-CSS type",
        base + fix.replace("<style>", '<style type="text/plain">'),
      ],
      ["a <noscript>", `${base}<noscript>${fix}</noscript>`],
      [
        "a <noscript> holding markup",
        `${base}<noscript><p>JS 필요</p>${fix}</noscript>`,
      ],
      [
        "a <noscript> in <head> holding body markup",
        `<head>${base}<noscript><link rel="x"><div></div>${fix}</noscript></head>`,
      ],
    ])("inside %s", (_, html) => {
      expect(findRoleChainDrift(html, chains).map((f) => f.preview)).toEqual([
        "var(--sf-gray-100)",
      ])
      expect(roleChainCoverage(html, chains)).toEqual({
        chained: 1,
        literal: 0,
        scoped: 0,
      })
    })

    it("but reads one with type `text/css`, the stylesheet type", () => {
      expect(
        findRoleChainDrift(
          base + fix.replace("<style>", '<style type="text/css">'),
          chains
        )
      ).toEqual([])
    })
  })

  it("ends a <noscript> at its first end tag, as the browser does", () => {
    // The `<!--` is raw text inside <noscript>, not a comment, so the
    // stylesheet after `</noscript>` applies and its wrong value is read.
    const chains = roleChainsForSlug(roles, "socar")
    const html = `<style>:root { --sf-text-primary: var(--sf-gray-800); }</style>
      <noscript><!--</noscript><style>:root { --sf-text-primary: var(--sf-gray-600); }</style>--></noscript>`
    expect(findRoleChainDrift(html, chains).map((f) => f.preview)).toEqual([
      "var(--sf-gray-600)",
    ])
  })

  it.each([
    ["applies", `<style data-x="a>b">`, ["var(--sf-gray-600)"]],
    [
      "keeps its media",
      `<style data-x="a>b" media="(min-width: 1px)">`,
      ["var(--sf-gray-100)"],
    ],
  ])(
    "reads a <style> with `>` in a quoted attribute value: it %s",
    (_, start, previews) => {
      const chains = roleChainsForSlug(roles, "socar")
      const html = `<style>:root { --sf-text-primary: var(--sf-gray-100); }</style>
        ${start}:root { --sf-text-primary: var(--sf-gray-600); }</style>`
      expect(findRoleChainDrift(html, chains).map((f) => f.preview)).toEqual(
        previews
      )
    }
  )

  it("reads a <style> body's `<!--` as CSS, not as an HTML comment", () => {
    // <style> is a raw-text element: `<!--` and `-->` inside it are CSS's
    // CDO and CDC tokens, which the browser drops, applying the rule between.
    const chains = roleChainsForSlug(roles, "socar")
    const html = `<style>:root { --sf-text-primary: var(--sf-gray-800); }</style>
      <style><!-- :root { --sf-text-primary: var(--sf-gray-600); } --></style>`
    expect(findRoleChainDrift(html, chains).map((f) => f.preview)).toEqual([
      "var(--sf-gray-600)",
    ])
    // The value comparison sees it too, and an unclosed `<!--` in a style
    // body does not swallow the rest of the document.
    const values = `<style>:root { content: "<!--"; }</style>
      <style>:root { --gray-06: oklch(0.68 0 0); }</style>`
    expect(findPreviewDrift(values, readDefinitions(md))).toEqual([
      {
        name: "gray-06",
        preview: "oklch(0.68 0 0)",
        expected: "oklch(0.67 0 0)",
      },
    ])
  })

  it("applies a <style> as the browser does by its type and media", () => {
    // Applied: type absent, empty or `text/css` in any case; media absent,
    // empty or `all`. `data-type` and `data-media` are other attributes.
    const chains = roleChainsForSlug(roles, "socar")
    const base = `<style>:root { --sf-text-primary: var(--sf-gray-800); }</style>`
    const wrong = ":root { --sf-text-primary: var(--sf-gray-600); }"
    for (const attrs of [
      'type=""',
      'type="TEXT/CSS"',
      'data-type="text/plain"',
      'media=""',
      'media="all"',
      'data-media="(min-width: 1px)"',
    ]) {
      expect(
        findRoleChainDrift(
          `${base}<style ${attrs}>${wrong}</style>`,
          chains
        ).map((f) => f.preview),
        attrs
      ).toEqual(["var(--sf-gray-600)"])
    }
    // And the value comparison reads such a block too.
    expect(
      findPreviewDrift(
        '<style data-type="x">:root { --gray-06: oklch(0.68 0 0); }</style>',
        readDefinitions(md)
      ).map((f) => f.name)
    ).toEqual(["gray-06"])
  })

  it("reads a declaration with space before its colon", () => {
    const chains = roleChainsForSlug(roles, "socar")
    expect(
      findRoleChainDrift(
        ":root { --sf-text-primary : var(--sf-gray-600); }",
        chains
      ).map((f) => f.name)
    ).toEqual(["sf-text-primary"])
  })

  it("ends comments and raw-text elements where the HTML tokenizer does", () => {
    const chains = roleChainsForSlug(roles, "socar")
    const wrong = `<style>:root { --sf-text-primary: var(--sf-gray-600); }</style>`
    const right = `<style>:root { --sf-text-primary: var(--sf-gray-800); }</style>`
    // `<!-->` and `<!--->` are empty comments that end in place, and `--!>`
    // closes a comment: the stylesheet after each one applies.
    for (const comment of ["<!-->", "<!--->", "<!-- x --!>"]) {
      expect(
        findRoleChainDrift(`${wrong}${comment}${right}<!-- y -->`, chains),
        comment
      ).toEqual([])
    }
    // `</style x>` and `</style/>` close the element, so the conditional
    // block after it stays conditional and does not hide the wrong base.
    for (const end of ["</style x>", "</style/>"]) {
      const html = `<style>:root { --sf-text-primary: var(--sf-gray-600); }${end}
        <style media="(min-width: 1px)">:root { --sf-text-primary: var(--sf-gray-800); }</style>`
      expect(
        findRoleChainDrift(html, chains).map((f) => f.preview),
        end
      ).toEqual(["var(--sf-gray-600)"])
    }
  })

  it("matches tags in any letter case", () => {
    const chains = roleChainsForSlug(roles, "socar")
    const base = `<STYLE>:root { --sf-text-primary: var(--sf-gray-600); }</STYLE>`
    const fix = ":root { --sf-text-primary: var(--sf-gray-800); }"
    for (const dead of [
      `<SCRIPT>"<style>${fix}</style>"</SCRIPT>`,
      `<Style Media="(min-width: 1px)">${fix}</Style>`,
      `<NOSCRIPT><style>${fix}</style></NOSCRIPT>`,
      `<!-- <style>${fix}</style> -->`,
    ]) {
      expect(
        findRoleChainDrift(base + dead, chains).map((f) => f.preview),
        dead
      ).toEqual(["var(--sf-gray-600)"])
    }
  })

  it("reads only the listed selectors as theme roots", () => {
    const chains = roleChainsForSlug(roles, "socar")
    const wrong = (selector: string): string =>
      `${selector} { --sf-text-primary: var(--sf-gray-600); --sf-bg-base: var(--sf-gray-600); }`
    for (const [selector, scope] of [
      ["html", "light"],
      [":root, [data-theme='light']", "light"],
      ['[data-theme="dark"]', "dark"],
      ["[data-theme=dark]", "dark"],
      [':root[data-theme="dark"]', "dark"],
      ['html[data-theme="dark"]', "dark"],
    ]) {
      expect(
        findRoleChainDrift(wrong(selector), chains).map((f) => f.scope),
        selector
      ).toContain(scope)
    }
    // The reviewer's: neither names the theme root, so both are scoped.
    for (const selector of [":root:where(.never)", '[data-theme="sepia"]']) {
      const html = `:root { --sf-text-primary: var(--sf-gray-800); }
        ${wrong(selector)}`
      expect(findRoleChainDrift(html, chains), selector).toEqual([])
      expect(roleChainCoverage(html, chains).scoped, selector).toBe(2)
    }
  })

  it("refuses to pick between two root forms of one role in one scope", () => {
    // `:root` outweighs a later `html`, so document order would pick wrongly.
    const chains = roleChainsForSlug(roles, "socar")
    const found = findRoleChainDrift(
      `:root { --sf-text-primary: var(--sf-gray-600); }
       html { --sf-text-primary: var(--sf-gray-800); }`,
      chains
    )
    expect(found).toEqual([
      {
        name: "sf-text-primary",
        scope: "light",
        preview:
          ":root { --sf-text-primary: var(--sf-gray-600) } and html { --sf-text-primary: var(--sf-gray-800) }",
        expected: "one theme-root declaration",
        ambiguous: true,
      },
    ])
  })

  it("refuses a light-root declaration after the dark root's", () => {
    // A later `:root` also wins in the dark theme: same weight, later.
    const chains = roleChainsForSlug(roles, "socar")
    const found = findRoleChainDrift(
      `[data-theme="dark"] { --sf-bg-base: var(--sf-gray-800); }
       :root { --sf-bg-base: var(--sf-gray-100); }`,
      chains
    )
    expect(found.map((f) => [f.scope, f.name, f.ambiguous])).toEqual([
      ["light", "sf-bg-base", true],
    ])
  })

  it("does not read a local block as a theme root", () => {
    // Each is a later, partial redeclaration with the right step; none may
    // hide the wrong `:root` value before it, and each is counted as scoped.
    const chains = roleChainsForSlug(roles, "socar")
    for (const selector of [
      ":where(.chip)",
      'html [data-theme="light"]',
      ':root [data-theme="light"]',
      "[data-theme] .card",
      "html.x",
      "@supports (color: red) { :root",
      "@layer base { :root",
    ]) {
      const close = selector.includes("{") ? "}}" : "}"
      const html = `:root { --sf-text-primary: var(--sf-gray-600); }
        ${selector} { --sf-text-primary: var(--sf-gray-800); ${close}`
      expect(
        findRoleChainDrift(html, chains).map((f) => f.name),
        selector
      ).toEqual(["sf-text-primary"])
      expect(roleChainCoverage(html, chains).scoped, selector).toBe(1)
    }
  })

  it("renames palette steps by the slug's own alias rules", () => {
    // bezier's preview keeps role names bare and prefixes its palette `c-`.
    const bezier = `---
colors:
  grey-50: oklch(0.98 0 0)
  fill-grey: "{colors.grey-50}"
---
`
    const chains = roleChainsForSlug(bezier, "bezier")
    expect(chains.light.get("fill-grey")).toEqual(["c-grey-50"])
  })

  it("accepts a dark step under the name of the palette the dark block redefines", () => {
    // vapor-ui: `dark-color-background-primary-100: "{colors.dark-blue-050}"`,
    // and the preview's dark block redefines `--vp-blue-050` rather than
    // declaring a `--vp-dark-blue-050`.
    const vapor = `---
colors:
  blue-050: oklch(0.97 0.02 260)
  blue-100: oklch(0.93 0.04 260)
  dark-blue-050: oklch(0.3 0.05 260)
  color-background-primary-100: "{colors.blue-100}"
  dark-color-background-primary-100: "{colors.dark-blue-050}"
---
`
    const chains = roleChainsForSlug(vapor, "vapor-ui")
    const css = (step: string): string =>
      `:root { --vp-bg-primary-100: var(--vp-blue-100); }
       [data-theme="dark"] {
         --vp-blue-050: oklch(0.3 0.05 260);
         --vp-bg-primary-100: var(--vp-${step});
       }`
    expect(findRoleChainDrift(css("blue-050"), chains)).toEqual([])
    expect(findRoleChainDrift(css("dark-blue-050"), chains)).toEqual([])
    expect(findRoleChainDrift(css("blue-100"), chains)).toEqual([
      {
        name: "vp-bg-primary-100",
        scope: "dark",
        preview: "var(--vp-blue-100)",
        expected: "var(--vp-blue-050)",
      },
    ])
  })

  it("accepts the unprefixed dark step only where the dark root redeclares it", () => {
    // Without `--vp-blue-050` in the dark block, `var(--vp-blue-050)` there
    // paints the LIGHT blue-050.
    const vapor = `---
colors:
  blue-050: oklch(0.97 0.02 260)
  blue-100: oklch(0.93 0.04 260)
  dark-blue-050: oklch(0.3 0.05 260)
  color-background-primary-100: "{colors.blue-100}"
  dark-color-background-primary-100: "{colors.dark-blue-050}"
---
`
    const chains = roleChainsForSlug(vapor, "vapor-ui")
    const html = (darkPalette: string): string =>
      `:root { --vp-blue-050: oklch(0.97 0.02 260); --vp-bg-primary-100: var(--vp-blue-100); }
       [data-theme="dark"] { ${darkPalette} --vp-bg-primary-100: var(--vp-blue-050); }`
    expect(
      findRoleChainDrift(html("--vp-blue-050: oklch(0.3 0.05 260);"), chains)
    ).toEqual([])
    expect(findRoleChainDrift(html(""), chains)).toEqual([
      {
        name: "vp-bg-primary-100",
        scope: "dark",
        preview: "var(--vp-blue-050)",
        expected: "var(--vp-dark-blue-050)",
      },
    ])
  })

  it("holds a role the dark root never redeclares to its `dark-` row", () => {
    // The dark theme inherits the light `var()`, which is not the dark step.
    const chains = roleChainsForSlug(roles, "socar")
    const found = findRoleChainDrift(
      ":root { --sf-bg-base: var(--sf-gray-100); }",
      chains
    )
    expect(found).toEqual([
      {
        name: "sf-bg-base",
        scope: "dark",
        preview: "var(--sf-gray-100)",
        expected: "var(--sf-gray-800)",
      },
    ])
    expect(
      roleChainCoverage(":root { --sf-bg-base: var(--sf-gray-100); }", chains)
    ).toEqual({ chained: 2, literal: 0, scoped: 0 })
  })

  it("counts compared chains and literal role declarations, once per scope", () => {
    const chains = roleChainsForSlug(roles, "socar")
    expect(
      roleChainCoverage(
        `:root { --sf-text-primary: var(--sf-gray-800); --sf-bg-base: #fff; }
         :root { --sf-text-primary: var(--sf-gray-800); --sf-other: #000; }
         [data-theme="dark"] { --sf-bg-base: var(--sf-gray-800); }`,
        chains
      )
    ).toEqual({ chained: 2, literal: 1, scoped: 0 })
  })
})

describe("readReferenceRows", () => {
  it("reads `{colors.x}` rows and nothing else", () => {
    const doc = `---
colors:
  blue-500: oklch(0.6 0.2 260)
  primary: "{colors.blue-500}"
  on-primary: "{colors.blue-500} "
  mix: "color-mix(in oklab, {colors.blue-500} 50%, white)"
---
`
    expect([...readReferenceRows(doc)]).toEqual([["primary", "blue-500"]])
  })

  it("reads nothing from a frontmatter YAML cannot read", () => {
    expect(readReferenceRows("---\ncolors: [\n---\n").size).toBe(0)
  })
})
