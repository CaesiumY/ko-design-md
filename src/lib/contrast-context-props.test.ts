import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

// The collector reads which properties put an element in a stacking context of
// its own; the paint order a pseudo-element is judged by rests on that list
// (src/lib/contrast-pseudo.ts). A property left off it reads an owner as no
// stacking context, and a `z-index: -1` paint that shows over the owner's
// background is dropped as hidden under it: a false pass. PR #705 shipped
// without `-webkit-mask-box-image` and `-webkit-box-reflect` that way.
//
// The collector runs in the browser, inside one function, so its list is read
// from the source here. The names below are MDN's "Features creating stacking
// contexts" (Web/CSS/Guides/Positioned_layout/Stacking_context), plus what
// Chromium also counts. Position and `z-index` are read apart from this list,
// and the root is a context by `view-transition-name: root`.
const source = readFileSync("scripts/audit-contrast-collector.ts", "utf8")

const block = (start: string, end: string): string => {
  const from = source.indexOf(start)
  expect(from, `${start} not found in the collector`).toBeGreaterThan(-1)
  const to = source.indexOf(end, from)
  expect(to, `${end} not found after ${start}`).toBeGreaterThan(from)
  return source.slice(from, to)
}

// One name per property MDN lists. `mask` is a shorthand: its image and its
// border are the longhands read.
const MDN = [
  "opacity",
  "mix-blend-mode",
  "transform",
  "scale",
  "rotate",
  "translate",
  "filter",
  "backdrop-filter",
  "perspective",
  "clip-path",
  "mask-image",
  "mask-border-source",
  "isolation",
  "will-change",
  "contain",
  "container-type",
]

// Chromium makes a context of these too.
const CHROMIUM = [
  "-webkit-mask-box-image-source",
  "-webkit-box-reflect",
  "view-transition-name",
]

describe("the properties the collector reads as making a stacking context", () => {
  const list = block("const contextPropsOf", ".filter(")

  it.each([...MDN, ...CHROMIUM])("include %s", (name) => {
    expect(list).toContain(`"${name}"`)
  })

  it("include being in the top layer: a modal dialog, an open popover, a fullscreen element", () => {
    const topLayer = block("const TOP_LAYER", "\n")
    for (const selector of [":modal", ":popover-open", ":fullscreen"]) {
      expect(topLayer).toContain(`"${selector}"`)
    }
  })
})
