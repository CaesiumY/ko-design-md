import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  hasCssMotion,
  normalizeCss,
  reducedMotionBlock,
  reducedMotionViolations,
} from "./reduced-motion-block"
import { PREVIEW_HTML_AUTHOR_AGENT, readRepoFile } from "./skill-asset-paths"

// Issue #443. #394 taught new previews one reduced-motion form; this holds the
// previews already shipped to the same form. Before it the catalogue carried
// five — named `animation: none`, a spinner slowed to `animation-duration: 3s`
// (still turning for a reader who asked for no motion), a bare `*` reset that
// misses `::before`/`::after`, a `1ms` reset that rests on the last keyframe,
// and rest-frame rules that hold only while no dark-sheet rule on the same
// element sets the same property — most of them written twice, once per sheet.
//
// The form is not restated here. It is read from the author prompt's fence, so
// the skill and the catalogue cannot drift apart: change the prompt and every
// preview has to follow, change a preview and it has to match the prompt.

const ROOT = fileURLToPath(new URL("../..", import.meta.url))
const PREVIEW = join(ROOT, "public", "preview")

function slugs(): Array<string> {
  return readdirSync(PREVIEW, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name)
    .sort()
}

// What counts as motion is `hasCssMotion` — the same definition the preview
// validator's warn uses (#395), so the two cannot disagree about a file.

describe("preview reduced motion (#443)", () => {
  const form = normalizeCss(
    reducedMotionBlock(
      readRepoFile(PREVIEW_HTML_AUTHOR_AGENT),
      "preview-html-author.md"
    )
  )
  const moving = slugs().filter((slug) =>
    hasCssMotion(readFileSync(join(PREVIEW, slug, "preview.html"), "utf8"))
  )

  it("finds the previews that move", () => {
    // A trigger that matched nothing would pass every assertion below.
    expect(moving.length).toBeGreaterThan(15)
  })

  it.each(moving)(
    "%s carries the author prompt's block, once, in the page sheet",
    (slug) => {
      // The page sheet is the first `<style>` — the position the author
      // prompt names and preview-halves.ts deals the sheets out by. A preview
      // may hold more than two (baemin's first carries only `@font-face`).
      // Every other place a reduced-motion branch could be written — the dark
      // sheet above all, where under the `[data-theme="dark"]` prefix a copy
      // stops nothing in light — is closed by the condition appearing once.
      expect(
        reducedMotionViolations(
          readFileSync(join(PREVIEW, slug, "preview.html"), "utf8"),
          form
        )
      ).toEqual([])
    }
  )
})
