import { readFileSync } from "node:fs"
import { join } from "node:path"
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
// Chromium and the other CSS specs also count. Position and `z-index` are read
// apart from this list, by `makesContext` in src/lib/contrast-pseudo.ts; the
// root is a context there through the `view-transition-name: root` Chromium
// gives it.
//
// Only names are checked: a name read from the wrong computed field passes
// here, and is the measurement's to catch.
const ROOT = process.cwd()
const read = (file: string): string => readFileSync(join(ROOT, file), "utf8")
const collector = read("scripts/audit-contrast-collector.ts")
const judge = read("src/lib/contrast-pseudo.ts")

const block = (source: string, start: string, end: string): string => {
  const from = source.indexOf(start)
  expect(from, `${start} not found`).toBeGreaterThan(-1)
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

// Chromium makes a context of these too, and so do other specs: a 3D context
// (`transform-style`), a motion path, which transforms the box
// (`offset-path`), and `content-visibility: auto`, which turns on paint
// containment.
const ALSO = [
  "-webkit-mask-box-image-source",
  "-webkit-box-reflect",
  "view-transition-name",
  "transform-style",
  "offset-path",
  "content-visibility",
]

// Whether these make a context depends on what they name or hold
// (`will-change: opacity` does, `will-change: scroll-position` does not), which
// is not read further: the judge has to treat them as unsure rather than read
// any value as yes or no.
const UNSURE = [
  "will-change",
  "contain",
  "container-type",
  "content-visibility",
]

describe("the properties the collector reads as making a stacking context", () => {
  const list = block(collector, "const contextPropsOf", ".filter(")

  it.each([...MDN, ...ALSO])("include %s", (name) => {
    expect(list).toContain(`"${name}"`)
  })

  it.each(UNSURE)("hand %s to the judge as unsure", (name) => {
    expect(block(judge, "const MAYBE_CONTEXT", "]")).toContain(`"${name}"`)
  })

  it("include being in the top layer: a modal dialog, an open popover, a fullscreen element", () => {
    const topLayer = block(collector, "const TOP_LAYER", "]")
    for (const selector of [":modal", ":popover-open", ":fullscreen"]) {
      expect(topLayer).toContain(`"${selector}"`)
    }
  })
})
