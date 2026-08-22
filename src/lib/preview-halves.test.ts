import { describe, expect, it } from "vitest"
import { splitMergedPreview, unscopeDarkSheet } from "./preview-halves"

// A merged file, small enough to read. Both `<style>` blocks are required —
// `splitMergedPreview` refuses a file with fewer than two.
const merged = (body: string, darkCss = '[data-theme="dark"]{--bg:#000}') =>
  `<!doctype html>
<html lang="ko" data-theme="light"><head><meta charset="utf-8">
<style>:root{--bg:#fff}</style>
<style>${darkCss}</style>
</head><body>${body}</body></html>`

const text = (html: string) =>
  html
    .replace(/[\s\S]*<body>/, "")
    .replace(/<\/body>[\s\S]*/, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const styleText = (html: string) =>
  [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join("\n")
    .replace(/\s+/g, " ")
    .trim()

describe("splitMergedPreview markup", () => {
  // The converter can park a `swap` template and an `insert` template on the
  // same anchor. Reading `previousSibling` blindly then makes the swap target
  // the insert template, so the light node is never taken away and BOTH themes'
  // prose ends up in the dark half.
  it("keeps a swap paired with its own node when an insert follows it", () => {
    const halves = splitMergedPreview(
      merged(
        `<p>라이트</p>` +
          `<template data-theme-variant="dark" data-theme-op="swap"><p>다크</p></template>` +
          `<template data-theme-variant="dark" data-theme-op="insert"><section>다크 전용</section></template>` +
          `<div>공유</div>`
      ),
      0
    )
    expect(text(halves.light)).toBe("라이트 공유")
    expect(text(halves.dark)).toBe("다크 다크 전용 공유")
  })

  // Hand-written previews are indented, so a template's immediate previous
  // sibling is a newline and its first child is whitespace. Both used to be
  // taken literally, and the dark prose disappeared without a sound.
  it("survives indentation around and inside a template", () => {
    const halves = splitMergedPreview(
      merged(`
  <p>라이트</p>
  <template data-theme-variant="dark" data-theme-op="swap">
    <p>다크</p>
  </template>
  <div>공유</div>
`),
      0
    )
    expect(text(halves.light)).toBe("라이트 공유")
    expect(text(halves.dark)).toBe("다크 공유")
  })

  it("moves every node a template holds, not just the first", () => {
    const halves = splitMergedPreview(
      merged(
        `<div>공유</div>` +
          `<template data-theme-variant="dark" data-theme-op="insert"><p>하나</p><p>둘</p></template>`
      ),
      0
    )
    expect(text(halves.light)).toBe("공유")
    expect(text(halves.dark)).toBe("공유 하나 둘")
  })

  // The shapes a reader cannot resolve fail loudly instead of rendering both
  // themes' prose at once. Neither can come out of the converter; the format is
  // also hand-authored.
  it("refuses a swap that follows another variant template", () => {
    expect(() =>
      splitMergedPreview(
        merged(
          `<p>라이트</p>` +
            `<template data-theme-variant="dark" data-theme-op="insert"><section>다크 전용</section></template>` +
            `<template data-theme-variant="dark" data-theme-op="swap"><p>다크</p></template>`
        ),
        0
      )
    ).toThrow(/swap template follows another variant template/)
  })

  it("refuses a swap with nothing in front of it", () => {
    expect(() =>
      splitMergedPreview(
        merged(
          `<template data-theme-variant="dark" data-theme-op="swap"><p>다크</p></template><p>본문</p>`
        ),
        0
      )
    ).toThrow(/nothing to swap/)
  })

  // A swap with empty content still means "this node is absent in dark".
  it("drops the light node when the template is empty", () => {
    const halves = splitMergedPreview(
      merged(
        `<p>라이트 전용</p>` +
          `<template data-theme-variant="dark" data-theme-op="swap"></template>` +
          `<div>공유</div>`
      ),
      0
    )
    expect(text(halves.light)).toBe("라이트 전용 공유")
    expect(text(halves.dark)).toBe("공유")
  })
})

describe("unscopeDarkSheet", () => {
  it("undoes each shape the converter's scoping produces", () => {
    const scoped = [
      '[data-theme="dark"]{--bg:#000}',
      '[data-theme="dark"] .hero{color:red}',
      'html[data-theme="dark"] body{margin:0}',
      ':where([data-theme="dark"]) .sd-tag{font-weight:500}',
      '@media (max-width: 640px){[data-theme="dark"] .hero{padding:8px}}',
    ].join("\n")
    const out = unscopeDarkSheet(scoped).replace(/\s+/g, " ").trim()
    expect(out).toBe(
      ":root{--bg:#000} .hero{color:red} html body{margin:0} " +
        ".sd-tag{font-weight:500} @media (max-width: 640px){.hero{padding:8px}}"
    )
  })

  // The comparison this feeds is textual, so anything the rewrite touches
  // beyond the prefix itself would make an unadapted sheet read as adapted.
  it("leaves every other byte of the sheet alone", () => {
    const untouched = `:root{--bg:#000}\n\n.hero  ,  .card {\n  color : red ;\n}\n`
    expect(unscopeDarkSheet(untouched)).toBe(untouched)
  })

  // A compound used to be left alone, on the reading that the attribute names
  // an element rather than scoping to the root. Both readings are true and the
  // merged file cannot say which applies: `scopeSelector` REPLACES a leading
  // `:root`, so `:root.panel` and an author's own `[data-theme="dark"].panel`
  // arrive as the same text. Inverting is the bet the bare form already makes.
  it("inverts a compound the way the converter would have made it", () => {
    expect(unscopeDarkSheet('[data-theme="dark"].panel{color:red}')).toBe(
      ":root.panel{color:red}"
    )
  })

  // Every boundary this walk finds — `{`, `}`, and the `;` that ends a
  // statement at-rule — can also occur inside a comment, and one of them read
  // out of a comment slides the walk for the whole rest of the sheet: the rules
  // behind it silently keep their scope. The converter cannot hand us a
  // commented dark sheet (`scopeDark` strips comments first), but preview.html
  // is a hand-authoring convention too.
  it("does not let a brace inside a comment slide the walk", () => {
    const out = unscopeDarkSheet(
      '/* .a { b } ; */\n[data-theme="dark"] .hero{color:red}'
    )
    expect(out).toBe("/* .a { b } ; */\n.hero{color:red}")
  })

  it("keeps statement at-rules ahead of the rule that follows them", () => {
    const out = unscopeDarkSheet(
      '@import url("x.css");\n[data-theme="dark"] .hero{color:red}'
    )
    expect(out).toBe('@import url("x.css");\n.hero{color:red}')
  })

  // The same failure one view over. `content: "{"` is ordinary in a preview that
  // puts code or CSS syntax on screen; before strings were blanked as well, the
  // two rules behind this one came back still scoped. `content: "}"` broke one
  // rule later and `content: "x"` was clean, which is what named the cause.
  it.each(["{", "}", ";", ","])(
    "does not let a %s inside a string slide the walk",
    (ch) => {
      const out = unscopeDarkSheet(
        `[data-theme="dark"] .x::after{content:"${ch}"}\n` +
          `[data-theme="dark"] .y{color:red}\n` +
          `[data-theme="dark"] .z{color:blue}`
      )
      expect(out).toBe(
        `.x::after{content:"${ch}"}\n.y{color:red}\n.z{color:blue}`
      )
    }
  )

  // A comma inside an attribute value is not a selector separator either.
  it("does not split a selector list on a comma inside an attribute", () => {
    expect(
      unscopeDarkSheet('[data-theme="dark"] [title="a,b"]{color:red}')
    ).toBe('[title="a,b"]{color:red}')
  })

  // Nor is a comma inside a functional pseudo-class, and this walk used to cut
  // there — the same gap the merge script's `scopeSelectorList` had.
  //
  // The damage is NARROWER on this side than on the writing side, and the tests
  // below say only what was measured. `unscopeSelector` strips a prefix and is a
  // no-op on an arm that has none, and the pieces are rejoined with the commas
  // they were cut at, so `:is(.a, .b) .x`, `:not(.muted, .ghost)`,
  // `:has(> .item, > .row)` and a genuine list all came back unchanged with the
  // split in place. What did not: an arm that is ITSELF a scope compound.
  // `:is(.x, [data-theme="dark"].y)` was cut, the second arm was read as a
  // top-level selector, and `unscopeSelector`'s compound branch inverted it to
  // `:root.y` — a selector the author never wrote, handed to every pair rule as
  // if they had.
  it("does not invert a compound arm inside a pseudo-class", () => {
    expect(
      unscopeDarkSheet(
        '[data-theme="dark"] :is(.x, [data-theme="dark"].y){color:red}'
      )
    ).toBe(':is(.x, [data-theme="dark"].y){color:red}')
  })

  // The counterpart: a comma that really does separate two selectors still cuts,
  // and each side is unscoped on its own.
  it("still splits a genuine selector list", () => {
    expect(
      unscopeDarkSheet(
        '[data-theme="dark"] :is(.a, .b),[data-theme="dark"] .c{color:red}'
      )
    ).toBe(":is(.a, .b),.c{color:red}")
  })
})

// `identical-style-blocks` asks whether the dark sheet is a considered
// adaptation or a copy. On the merged layout every dark selector carries the
// scope prefix, so without unscoping the two texts can never be equal and the
// rule can never fire — for any slug, however plainly copied.
//
// These two cover the deal-out only. They CANNOT cover the rule, because the
// merged file here is built by hand and its spacing happens to match what the
// converter emits — the coincidence that let the rule stay dead through a whole
// round of review. The rule itself is exercised through the real converter in
// `preview-merge-anchors.test.ts`.
describe("the copy question the pair validator asks", () => {
  it("sees two identical sheets as identical", () => {
    const halves = splitMergedPreview(
      merged("<p>본문</p>", '[data-theme="dark"]{--bg:#fff}'),
      0
    )
    expect(styleText(halves.dark)).toBe(styleText(halves.light))
  })

  it("still sees an adapted sheet as different", () => {
    const halves = splitMergedPreview(
      merged("<p>본문</p>", '[data-theme="dark"]{--bg:#111}'),
      0
    )
    expect(styleText(halves.dark)).not.toBe(styleText(halves.light))
  })
})
