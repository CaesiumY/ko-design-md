import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  normalizeCss,
  reduceMediaBlocks,
  reducedMotionBlock,
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

// The page sheet is the first `<style>` in the head and the dark sheet the last
// — the positions the author prompt names, and the ones preview-halves.ts
// deals the sheets out by. A preview may hold more than two (baemin's first
// carries only `@font-face`); the block belongs in the first, unprefixed one.
function sheets(html: string): Array<string> {
  const head = html.slice(0, html.indexOf("</head>"))
  return [...head.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1])
}

// CSS motion, as the prompt defines the trigger: `@keyframes`, or an
// `animation` or `transition` declaration — shorthand or longhand — that sets
// motion. `none` and zero durations set none. Read from the sheets outside any
// reduced-motion block (whose own declarations stop motion) and from `style`
// attributes.
function hasCssMotion(html: string): boolean {
  const css = sheets(html)
    .map((s) => reduceMediaBlocks(s).reduce((t, b) => t.replace(b, ""), s))
    .join("\n")
  const attrs = [...html.matchAll(/\sstyle="([^"]*)"/g)].map((m) => m[1])
  const text = [css, ...attrs].join("\n")
  if (/@keyframes\b/.test(text)) return true
  for (const m of text.matchAll(
    // Not preceded by a name character or `-`, so a custom property such as
    // `--btn-transition:` is not read as the `transition` it only stores.
    /(?<![\w-])((?:animation|transition)(?:-[a-z-]+)?)\s*:\s*([^;}"]+)/g
  )) {
    const [, property, raw] = m
    // The shorthand, or the longhands that alone decide whether anything
    // moves; `-delay`, `-easing` and the rest only shape motion set elsewhere.
    if (!/^(animation|transition)(-name|-property|-duration)?$/.test(property))
      continue
    const value = raw.replace(/!important/, "").trim()
    if (value === "none" || /^0m?s$/.test(value)) continue
    return true
  }
  return false
}

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
      const all = sheets(
        readFileSync(join(PREVIEW, slug, "preview.html"), "utf8")
      )
      const page = reduceMediaBlocks(all[0] ?? "").map(normalizeCss)
      expect(page, "the page sheet holds exactly the prescribed block").toEqual(
        [form]
      )
      // Every other sheet — the dark one above all — holds none: under the
      // `[data-theme="dark"]` prefix a copy stops nothing in light, and beside
      // the page-sheet one it is the duplication the global reset removes.
      for (const [i, sheet] of all.slice(1).entries()) {
        expect(
          reduceMediaBlocks(sheet),
          `sheet ${i + 2} carries a reduced-motion block`
        ).toEqual([])
      }
    }
  )
})
