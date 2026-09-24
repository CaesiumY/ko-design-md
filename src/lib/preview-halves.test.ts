import { describe, expect, it } from "vitest"
import {
  UnreadablePreviewError,
  splitLayoutHalves,
  splitMergedPreview,
  unscopeDarkSheet,
} from "./preview-halves"
import { validatePreviewPair } from "./preview-validator"
import type { AnchorSig } from "./preview-validator"

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

  // A `<style>` inside a template used to leave the dark half judging a sheet
  // nobody receives, with no error: the template's own sheet in place of the
  // dark one (swap, insert), or the dark sheet still scoped to
  // `[data-theme="dark"]` (plain, nested).
  it.each([
    [
      "a swap template",
      `<p class="a">L</p><template data-theme-variant="dark"><p class="a">D</p><style>.a{outline:1px solid}</style></template>`,
    ],
    [
      "an insert template",
      `<p class="a">L</p><template data-theme-variant="dark" data-theme-op="insert"><style>.a{outline:1px solid}</style></template>`,
    ],
    [
      "a plain template",
      `<p class="a">L</p><template><style>.a{outline:1px solid}</style></template>`,
    ],
    [
      "a template nested inside a variant",
      `<p class="a">L</p><template data-theme-variant="dark"><p class="a">D</p><template><style>.a{outline:1px solid}</style></template></template>`,
    ],
    // An icon's own `<svg><style>` is refused too, on purpose: swapped in, it
    // is still a `<style>` element to the dark half's last-sheet step, so it
    // displaces the dark sheet exactly as an HTML one does.
    [
      "an <svg> inside a variant template",
      `<p class="a">L</p><template data-theme-variant="dark"><p class="a">D</p><svg viewBox="0 0 10 10"><style>.icon{fill:red}</style><rect class="icon" width="1" height="1"></rect></svg></template>`,
    ],
  ])("refuses a <style> inside %s", (_label, body) => {
    expect(() => splitMergedPreview(merged(body), 0)).toThrow(
      /a <template> holds a <style> block/
    )
    // The CLI reports only this type as a finding and rethrows anything else,
    // so a plain Error here would stop the bulk run instead of naming the file.
    expect(() => splitMergedPreview(merged(body), 0)).toThrow(
      UnreadablePreviewError
    )
  })

  // Inside `<svg>` a `<template>` tag is a foreign element with no `content`.
  // The type selector still matches it, and reading `.content` on it crashed
  // the whole split on a file main reads fine — at the top level, and again
  // one level down when only the top-level collection was filtered.
  it.each([
    [
      "in the document",
      `<p>본문</p><svg viewBox="0 0 10 10"><template><rect width="1" height="1"></rect></template></svg>`,
    ],
    [
      "inside a variant template",
      `<p>본문</p><template data-theme-variant="dark"><p>다크</p><svg viewBox="0 0 10 10"><template><rect width="1" height="1"></rect></template></svg></template>`,
    ],
  ])("reads past a <template> inside <svg> %s", (_label, body) => {
    const halves = splitMergedPreview(merged(body), 0)
    // The dark sheet survives, unscoped — the split went through untouched.
    expect(styleText(halves.dark)).toContain("--bg:#000")
    expect(styleText(halves.dark)).not.toContain("data-theme")
  })

  // The same foreign element carrying `data-theme-variant="dark"` is a
  // different matter: the attribute selector finds it, it has no `content` for
  // the runtime to swap in, and reading its pairing crashed the split with a
  // TypeError the CLI rethrows. It is refused like the other unreadable shapes.
  it.each([
    [
      "a swap",
      `<svg viewBox="0 0 10 10"><rect class="a" width="1" height="1"></rect><template data-theme-variant="dark"><rect class="a" width="2" height="2"></rect></template></svg>`,
    ],
    [
      "an insert",
      `<svg viewBox="0 0 10 10"><rect width="1" height="1"></rect><template data-theme-variant="dark" data-theme-op="insert"><rect width="2" height="2"></rect></template></svg>`,
    ],
  ])("refuses %s variant template written inside <svg>", (_label, body) => {
    expect(() => splitMergedPreview(merged(body), 0)).toThrow(
      /variant template inside <svg>/
    )
    expect(() => splitMergedPreview(merged(body), 0)).toThrow(
      UnreadablePreviewError
    )
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

describe("splitMergedPreview — what each dark variant swaps", () => {
  // `variantAnchors` is the pairing the runtime acts on, read from the parsed
  // file; the validator only judges it. So what the parser pairs for each shape
  // a hand-written file can take is pinned here, as `op:front->first`, with
  // each class list written out in full rather than dot-joined.
  const anchorsOf = (html: string) => splitMergedPreview(html, 0).variantAnchors
  const lab = (s: AnchorSig | null): string =>
    s === null
      ? "null"
      : s.kind === "text"
        ? "#text"
        : `${s.tag}[${s.classes.join(" ")}]`
  const labels = (html: string): Array<string> =>
    anchorsOf(html).map((a) => `${a.op}:${lab(a.light)}->${lab(a.dark)}`)

  it("skips formatting on both sides of the pair", () => {
    expect(
      labels(
        merged(
          '<p class="a">L</p>\n  <!-- c -->&nbsp;\n  <template data-theme-variant="dark">\n    <!-- d -->\n    <p class="b a">D</p>\n  </template>'
        )
      )
    ).toEqual(["swap:p[a]->p[a b]"])
  })

  it("reads attributes and classes after the parser decodes them", () => {
    expect(
      labels(
        merged(
          '<p class="a&#32;b">L</p><template data-theme-variant="d&#97;rk" data-theme-op="ins&#101;rt"><p>I</p></template>'
        )
      )
    ).toEqual(["insert:p[a b]->p[]"])
  })

  it("compares data-theme-op exactly, as the runtime does", () => {
    const behindDemo = (op: string) =>
      merged(
        `<div class="demo">X</div><template data-theme-variant="dark" data-theme-op="${op}"><p class="cap">D</p></template>`
      )
    expect(labels(behindDemo("Insert"))).toEqual(["swap:div[demo]->p[cap]"])
    expect(labels(behindDemo(" insert "))).toEqual(["swap:div[demo]->p[cap]"])
  })

  it("keeps a non-breaking space inside a class value, as one class", () => {
    const [anchor] = anchorsOf(
      merged(
        '<div class="demo&nbsp;stack">X</div><template data-theme-variant="dark"><div class="stack">D</div></template>'
      )
    )
    expect(anchor.light).toEqual({
      kind: "element",
      tag: "div",
      classes: ["demo" + String.fromCharCode(0xa0) + "stack"],
    })
  })

  it("reads a text node in front as text", () => {
    expect(
      labels(
        merged(
          '<div class="card"><p class="cap">L</p>\nstray label\n<template data-theme-variant="dark"><p class="cap">D</p></template></div>'
        )
      )
    ).toEqual(["swap:#text->p[cap]"])
  })

  it("reads text the template opens with as its first node", () => {
    expect(
      labels(
        merged(
          '<p>Mode <span class="k">light</span><template data-theme-variant="dark">dark <span class="k">mode</span></template></p>'
        )
      )
    ).toEqual(["swap:span[k]->#text"])
  })

  it("reads a template holding only formatting as empty", () => {
    expect(
      labels(
        merged(
          '<div class="demo">X</div><template data-theme-variant="dark">\n  <!-- none in dark -->\n</template>'
        )
      )
    ).toEqual(["swap:div[demo]->null"])
  })

  it("passes over nodes that render nothing on the dark side", () => {
    expect(
      labels(
        merged(
          '<p class="a">L</p><template data-theme-variant="dark"><script>1</script><template>x</template><p class="a">D</p></template>'
        )
      )
    ).toEqual(["swap:p[a]->p[a]"])
    expect(
      labels(
        merged(
          '<div class="demo">X</div><template data-theme-variant="dark"><template><p>i</p></template></template>'
        )
      )
    ).toEqual(["swap:div[demo]->null"])
  })

  it("pairs the node a stray end tag creates, not the one written before it", () => {
    // A leftover `</p>` becomes an empty <p>, and that is what dark removes.
    expect(
      labels(
        merged(
          '<div class="demo">X</div></p><template data-theme-variant="dark"><p class="cap">D</p></template>'
        )
      )
    ).toEqual(["swap:p[]->p[cap]"])
  })

  it("reads past a comment inside the template that mentions </template>", () => {
    expect(
      labels(
        merged(
          '<p class="a">L</p><template data-theme-variant="dark"><!-- see </template> --><p class="b">D</p></template>'
        )
      )
    ).toEqual(["swap:p[a]->p[b]"])
  })

  it("reads a plain template in front as the node dark removes", () => {
    expect(
      labels(
        merged(
          '<p class="a">L</p><template><i>x</i></template><template data-theme-variant="dark"><p class="a">D</p></template>'
        )
      )
    ).toEqual(["swap:template[]->p[a]"])
  })

  it("reads a variant template in <head> as well", () => {
    const html = merged("<p>본문</p>").replace(
      '<meta charset="utf-8">',
      '<meta charset="utf-8"><template data-theme-variant="dark"><p>D</p></template>'
    )
    expect(labels(html)).toEqual(["swap:meta[]->p[]"])
  })

  // The rule treats text in front as a finding because of what the dark half
  // does with it: the text goes and the element before it stays.
  it("takes a text node in front out of the dark half, as the runtime does", () => {
    const halves = splitMergedPreview(
      merged(
        '<div><p>L</p>stray<template data-theme-variant="dark"><p>D</p></template></div>'
      ),
      0
    )
    expect(text(halves.light)).toBe("L stray")
    expect(text(halves.dark)).toBe("L D")
  })

  it("has nothing to pair under the split layout", () => {
    expect(
      splitLayoutHalves("<p>l</p>", "<p>d</p>", 0, 0).variantAnchors
    ).toEqual([])
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
// round of review. The rule is covered by the describe that follows it.
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

// The rule itself, on the bytes the converter actually wrote. The merge
// converter (`scripts/merge-preview-themes.mjs`, removed once #235 had merged
// every preview) reserialised the dark sheet — `prelude + " {"`, selector
// lists rejoined with `", "`, `@media` bodies flattened onto one line — so a
// dark half copied byte for byte from light still reached the validator
// looking different. The catalogue's merged files carry that spacing for good.
// The dark sheets below are that converter's output for the light sheet above
// them, captured before it was removed; do not tidy their spacing.
const AUTHORED_CSS = `:root{--bg:#fff}
.ic{display:inline-flex;gap:4px}
.a,.b{color:#111}
@media (max-width: 700px) {
  .hero{padding:8px}
}`
const CONVERTED_DARK = `
[data-theme="dark"] {--bg:#fff}
[data-theme="dark"] .ic {display:inline-flex;gap:4px}
[data-theme="dark"] .a, [data-theme="dark"] .b {color:#111}
@media (max-width: 700px) {[data-theme="dark"] .hero {padding:8px}}
`

function copyVerdict(lightCss: string, darkCss: string): Array<string> {
  const html = `<!doctype html>
<html lang="ko" data-theme="light"><head><meta charset="utf-8">
<title>zz preview</title>
<style>${lightCss}</style>
<style>${darkCss}</style></head><body><p>본문</p></body></html>`
  const halves = splitMergedPreview(html, html.length)
  return validatePreviewPair({
    slug: "zz",
    lightRaw: halves.light,
    darkRaw: halves.dark,
    lightBytes: halves.lightBytes,
    darkBytes: halves.darkBytes,
    served: halves.served,
    variantAnchors: halves.variantAnchors,
    designMdRaw: "",
  }).issues.map((i) => i.rule)
}

describe("identical-style-blocks on converter-spaced sheets", () => {
  it("still calls a copied dark sheet a copy", () => {
    expect(copyVerdict(AUTHORED_CSS, CONVERTED_DARK)).toContain(
      "identical-style-blocks"
    )
  })

  // The converter could not tell an author's own `[data-theme="dark"]` block
  // from one it made out of `:root`, so both came back the same. A half that
  // themes itself in one sheet — the shape codeit ships — is still a copy of
  // its twin.
  it("sees through a dual-theme sheet that spells the root both ways", () => {
    const dual = '[data-theme="dark"]{--bg:#000}'
    expect(
      copyVerdict(
        `${AUTHORED_CSS}\n${dual}`,
        `${CONVERTED_DARK}[data-theme="dark"] {--bg:#000}\n`
      )
    ).toContain("identical-style-blocks")
  })

  it("still lets an adapted dark sheet through", () => {
    expect(
      copyVerdict(AUTHORED_CSS, CONVERTED_DARK.replace("#fff", "#000"))
    ).not.toContain("identical-style-blocks")
  })
})

// Every step of the deal-out finds the dark sheet by position, so a live
// `<style>` after it — anywhere in the body — used to become the dark sheet
// with no error: the real one leaked into the light half and the dark half kept
// only the stray sheet. Each shape below did exactly that before it was refused.
describe("splitMergedPreview — every sheet sits in <head>", () => {
  it.each([
    ["directly in the body", `<style>.late{color:green}</style><p>본문</p>`],
    [
      "inside an <svg>",
      `<p>본문</p><svg viewBox="0 0 10 10"><style>.icon{fill:red}</style><rect class="icon" width="1" height="1"></rect></svg>`,
    ],
    [
      "inside an SVG-namespace <template>, which is a live element",
      `<p>본문</p><svg viewBox="0 0 10 10"><template><style>.icon{fill:red}</style></template></svg>`,
    ],
  ])("refuses a <style> %s", (_label, body) => {
    expect(() => splitMergedPreview(merged(body), 0)).toThrow(
      /<style> block sits outside <head>/
    )
    // The CLI reports only this type as a finding and rethrows anything else.
    expect(() => splitMergedPreview(merged(body), 0)).toThrow(
      UnreadablePreviewError
    )
  })

  // Staying in <head> is not enough: the parser moves a <style> written between
  // </head> and <body> into <head>, and reads one inside a <noscript> there as
  // a live sheet. Both land after the dark sheet and used to replace it.
  it.each([
    [
      "written between </head> and <body>",
      (html: string) =>
        html.replace(
          "</head><body>",
          "</head><style>.gap{margin:0}</style><body>"
        ),
    ],
    [
      "inside a <noscript> after the dark sheet",
      (html: string) =>
        html.replace(
          "</head>",
          "<noscript><style>.ns{display:none}</style></noscript></head>"
        ),
    ],
  ])("refuses a sheet %s", (_label, place) => {
    const html = place(merged("<p>본문</p>"))
    expect(() => splitMergedPreview(html, 0)).toThrow(
      /last <style> block does not carry the \[data-theme="dark"\] scope/
    )
    expect(() => splitMergedPreview(html, 0)).toThrow(UnreadablePreviewError)
  })

  // The dark sheet is unscoped in the source text, and a regex sees a <style>
  // string inside a <script> as a block. It used to pick that string as "the
  // last block", leaving the real dark sheet scoped in the dark half.
  it("unscopes the sheet the parser reads, not a <style> string in a <script>", () => {
    const halves = splitMergedPreview(
      merged(
        `<script>const css = "<style>.fake{}</style>"</script><p>본문</p>`
      ),
      0
    )
    const dark = [
      ...halves.dark.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi),
    ].map((m) => m[1])
    expect(dark).toContain(":root{--bg:#000}")
    expect(dark.join("\n")).not.toContain("data-theme")
  })

  // A regex cannot tell a `<script>` string from the sheet when the content is
  // the same, and either pick could leave the real sheet scoped.
  it("refuses a second copy of the dark sheet's text, even inside a <script>", () => {
    const html = merged(
      `<script>const css = '<style>[data-theme="dark"]{--bg:#000}</style>'</script><p>본문</p>`
    )
    expect(() => splitMergedPreview(html, 0)).toThrow(
      /dark"\] sheet appears 2 times in the source text/
    )
    expect(() => splitMergedPreview(html, 0)).toThrow(UnreadablePreviewError)
  })

  // `querySelectorAll("style")` does not reach into an HTML template's content,
  // so the <head> check above never sees a sheet written there — review caught
  // that it would slip past on this change alone. `assertReadableVariants`
  // refuses it, and this pins that the two checks together leave no gap.
  it.each([
    [
      "a dark variant template",
      `<p class="a">L</p><template data-theme-variant="dark"><p class="a">D</p><style>.a{outline:1px solid}</style></template>`,
    ],
    [
      "a plain template",
      `<p>본문</p><template><style>.late{color:green}</style></template>`,
    ],
  ])("refuses a <style> inside %s as well", (_label, body) => {
    expect(() => splitMergedPreview(merged(body), 0)).toThrow(
      UnreadablePreviewError
    )
  })

  // baemin's light half ships two sheets of its own: the rule is where the
  // sheets sit, not how many there are.
  it("accepts more than one light sheet as long as all of them are in <head>", () => {
    const html = merged("<p>본문</p>").replace(
      "<style>:root{--bg:#fff}</style>",
      "<style>:root{--bg:#fff}</style><style>.extra{margin:0}</style>"
    )
    const halves = splitMergedPreview(html, 0)
    expect(styleText(halves.light)).toContain(".extra{margin:0}")
    expect(styleText(halves.dark)).toContain("--bg:#000")
    expect(styleText(halves.dark)).not.toContain("data-theme")
  })
})
