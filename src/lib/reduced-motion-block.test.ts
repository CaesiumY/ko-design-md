import { describe, expect, it } from "vitest"
import {
  normalizeCss,
  reducedMotionMediaBlocks,
  reducedMotionViolations,
} from "./reduced-motion-block"

const texts = (css: string) => reducedMotionMediaBlocks(css).map((b) => b.text)

// The corpus test finds a preview's reduced-motion blocks with this function
// and then asserts there is exactly the prescribed one, at the top level of the
// page sheet, and none elsewhere. A spelling it does not recognise is a block
// it does not see, so the forms #443 removed could come back under another
// spelling and pass. Every way of writing the same condition has to be found.
describe("reducedMotionMediaBlocks", () => {
  it.each([
    ["the canonical spelling", "@media (prefers-reduced-motion: reduce) {"],
    ["the boolean context", "@media (prefers-reduced-motion) {"],
    [
      "a media type in front",
      "@media screen and (prefers-reduced-motion: reduce) {",
    ],
    [
      "another feature after",
      "@media (prefers-reduced-motion: reduce) and (min-width: 0) {",
    ],
    [
      "the negated opposite",
      "@media not (prefers-reduced-motion: no-preference) {",
    ],
    ["an upper-case at-rule", "@MEDIA (prefers-reduced-motion: reduce) {"],
  ])("finds %s", (_, open) => {
    const css = `.a { color: red; }\n${open} .spin { animation: none; } }\n.b { color: blue; }`
    const blocks = reducedMotionMediaBlocks(css)
    expect(blocks).toHaveLength(1)
    expect(blocks[0].text.startsWith(open)).toBe(true)
    expect(blocks[0].text.endsWith("} }")).toBe(true)
    expect(blocks[0].topLevel).toBe(true)
  })

  it("matches each block to its own closing brace", () => {
    const css =
      "@media (prefers-reduced-motion: reduce) { .a { x: 1; } .b { y: 2; } }\n" +
      ".c { z: 3; }\n" +
      "@media (prefers-reduced-motion) { .d { w: 4; } }"
    expect(texts(css)).toEqual([
      "@media (prefers-reduced-motion: reduce) { .a { x: 1; } .b { y: 2; } }",
      "@media (prefers-reduced-motion) { .d { w: 4; } }",
    ])
  })

  it("leaves other media queries alone", () => {
    expect(
      texts("@media (max-width: 720px) { .a { animation: none; } }")
    ).toEqual([])
  })

  // A commented-out block is text the browser never applies. Found, it would
  // match the prescribed form exactly and pass while the spinner keeps turning.
  it("does not find a block inside a comment", () => {
    expect(
      texts(
        "/* @media (prefers-reduced-motion: reduce) { * { animation: none !important; } } */"
      )
    ).toEqual([])
    // Nor one left open to the end of the sheet, which CSS also reads as comment.
    expect(
      texts("/* @media (prefers-reduced-motion: reduce) { * { x: 1; } }")
    ).toEqual([])
  })

  // A block inside another at-rule applies only under that rule's condition —
  // inside `@media (max-width: 720px)` it stops motion below 720px and nowhere
  // else. It is found, so a caller can fail on it, and marked as not top-level.
  it.each([
    ["a responsive media query", "@media (max-width: 720px) {"],
    ["a print media query", "@media print {"],
    ["a supports rule", "@supports (display: grid) {"],
  ])("marks a block nested in %s as not top-level", (_, parent) => {
    const css = `${parent} .grid { gap: 0; } @media (prefers-reduced-motion: reduce) { * { animation: none !important; } } }`
    const blocks = reducedMotionMediaBlocks(css)
    expect(blocks).toHaveLength(1)
    expect(blocks[0].topLevel).toBe(false)
  })

  // Comments and strings are read as CSS reads them: a brace inside one does
  // not move the depth, so it neither ends a block early nor hides a nesting.
  it("ignores braces inside comments and strings", () => {
    const css =
      '.a::after { content: "}"; } /* } */\n' +
      "@media (prefers-reduced-motion: reduce) { .b::after { content: '{'; } }"
    const blocks = reducedMotionMediaBlocks(css)
    expect(blocks.map((b) => b.topLevel)).toEqual([true])
    expect(blocks[0].text).toBe(
      "@media (prefers-reduced-motion: reduce) { .b::after { content: '{'; } }"
    )
  })
})

// The whole-file judgement the corpus test applies to every preview that
// moves. Its cases are the ways a copy of the block, or a condition on the
// page sheet, can sit outside the one place the block is looked for — in a
// `media` attribute, in another `<style>` whatever its case or position, in a
// comment. They are not a list to keep up: the judgement does not look for
// each, it holds that `prefers-reduced-motion` appears once in the file.
describe("reducedMotionViolations", () => {
  const BLOCK =
    "@media (prefers-reduced-motion: reduce) {\n" +
    "  *, *::before, *::after { animation: none !important; transition: none !important; }\n" +
    "}"
  const FORM = normalizeCss(BLOCK)
  const DARK = '<style>[data-theme="dark"] .spin { color: red; }</style>'
  const file = (head: string, body = "") =>
    `<!doctype html><html><head>${head}</head><body>${body}</body></html>`
  const page = (extra = "", tag = "<style>") =>
    `${tag}.spin { animation: spin 1s infinite; }\n${BLOCK}${extra}</style>`

  it("passes the prescribed block at the top of the page sheet", () => {
    expect(reducedMotionViolations(file(page() + DARK), FORM)).toEqual([])
  })

  it("reads the page sheet whatever the tag's case", () => {
    expect(
      reducedMotionViolations(
        file(page("", "<STYLE>").replace("</style>", "</STYLE>") + DARK),
        FORM
      )
    ).toEqual([])
  })

  it.each([
    ["no block", file("<style>.spin { animation: spin 1s; }</style>" + DARK)],
    [
      "the block commented out",
      file(
        `<style>.spin { animation: spin 1s; }\n/* ${BLOCK} */</style>${DARK}`
      ),
    ],
    [
      "the block nested in a responsive query",
      file(`<style>@media (max-width: 720px) { ${BLOCK} }</style>${DARK}`),
    ],
    [
      "a media attribute on the page sheet",
      file(page("", '<style media="(max-width: 720px)">') + DARK),
    ],
    [
      "a sheet whose media attribute is the condition",
      file(
        page() +
          DARK +
          '<style media="(prefers-reduced-motion: reduce)">.spin { animation-duration: 3s; }</style>'
      ),
    ],
    [
      "a copy in the dark sheet",
      file(
        page() +
          `<style>@media (prefers-reduced-motion: reduce) { [data-theme="dark"] .spin { animation: none; } }</style>`
      ),
    ],
    [
      "a copy in an upper-case sheet",
      file(page() + DARK + `<STYLE>${BLOCK}</STYLE>`),
    ],
    [
      "a copy in a sheet in the body",
      file(page() + DARK, `<style>${BLOCK}</style>`),
    ],
    [
      "a commented-out copy in the dark sheet",
      file(page() + `<style>/* ${BLOCK} */</style>`),
    ],
  ])("fails %s", (_, html) => {
    expect(reducedMotionViolations(html, FORM)).not.toEqual([])
  })
})
