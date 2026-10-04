import { describe, expect, it } from "vitest"
import { reducedMotionMediaBlocks } from "./reduced-motion-block"

// The corpus test finds a preview's reduced-motion blocks with this function
// and then asserts there is exactly the prescribed one in the page sheet and
// none elsewhere. A spelling it does not recognise is a block it does not see,
// so the forms #443 removed could come back under another spelling and pass.
// Every way of writing the same condition has to be found.
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
  ])("finds %s", (_, open) => {
    const css = `.a { color: red; }\n${open} .spin { animation: none; } }\n.b { color: blue; }`
    const blocks = reducedMotionMediaBlocks(css)
    expect(blocks).toHaveLength(1)
    expect(blocks[0].startsWith(open)).toBe(true)
    expect(blocks[0].endsWith("} }")).toBe(true)
  })

  it("matches each block to its own closing brace", () => {
    const css =
      "@media (prefers-reduced-motion: reduce) { .a { x: 1; } .b { y: 2; } }\n" +
      ".c { z: 3; }\n" +
      "@media (prefers-reduced-motion) { .d { w: 4; } }"
    expect(reducedMotionMediaBlocks(css)).toEqual([
      "@media (prefers-reduced-motion: reduce) { .a { x: 1; } .b { y: 2; } }",
      "@media (prefers-reduced-motion) { .d { w: 4; } }",
    ])
  })

  it("leaves other media queries alone", () => {
    expect(
      reducedMotionMediaBlocks(
        "@media (max-width: 720px) { .a { animation: none; } }"
      )
    ).toEqual([])
  })
})
