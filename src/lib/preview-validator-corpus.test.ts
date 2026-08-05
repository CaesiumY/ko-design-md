import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { JSDOM } from "jsdom"
import { describe, expect, it } from "vitest"
import { validatePreviewPair } from "./preview-validator"

// `swatchFillCount` scans line by line with a regex, which is fast and
// dependency-free but rests on an invariant nothing enforces: that a preview's
// elements each sit on one line. `format:check` does not cover preview HTML
// (CLAUDE.md), so a change in how `preview-html-author` wraps markup would
// silently blind the gate — it would pass while a swatch catalogue renders.
//
// This test is the guard for that. It measures each shipped preview with a real
// DOM walk (the ground truth a reader sees) and asserts the gate's verdict
// agrees. It deliberately does NOT assert the two counts are equal: they are
// not, and for a documented reason (see the notes above `swatchFillCount`).
// What must hold is the safety direction and the verdict.
//
// The check is two-directional, because the scan can be wrong both ways:
//   - DOM over limit but gate silent → the rule has been voided. That is the
//     failure mode issue #222 tracks, and what would catch it landing.
//   - DOM under limit but gate fires → the scan counts MORE than renders, so a
//     compliant preview gets blocked. Every "fails safe / undercounts only"
//     note above `swatchFillCount` would be wrong.
// Asserting at the verdict rather than the raw count keeps `swatchFillCount`
// unexported — this checks shipped behaviour from the outside.

const ROOT = fileURLToPath(new URL("../..", import.meta.url))
const PREVIEW = join(ROOT, "public", "preview")
const SERVICES = join(ROOT, "services")

// Keep in step with SWATCH_FILL_LIMIT in preview-validator.ts. Duplicated
// rather than exported because the point of this test is to check the shipped
// behaviour from the outside.
const SWATCH_FILL_LIMIT = 24

/** Ground truth: what a browser would actually render as a bare colour fill. */
function domFillCount(html: string): number {
  const doc = new JSDOM(html).window.document
  let shared = 0
  let light = 0
  let dark = 0
  for (const el of doc.querySelectorAll("body [style]")) {
    // getAttribute is `string | null` even behind a `[style]` selector, so the
    // fallback stays. textContent is non-null on an Element, so a `??` there
    // would be flagged as an unnecessary condition.
    if (!/background/.test(el.getAttribute("style") ?? "")) continue
    if (el.textContent.trim() !== "") continue
    const theme =
      el
        .closest("[data-theme-only]")
        ?.getAttribute("data-theme-only")
        ?.toLowerCase() ?? null
    if (theme === "light") light++
    else if (theme === "dark") dark++
    else shared++
  }
  return shared + Math.max(light, dark)
}

function slugs(): Array<string> {
  if (!existsSync(PREVIEW)) return []
  return readdirSync(PREVIEW, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name)
    .filter(
      (s) =>
        existsSync(join(PREVIEW, s, "light.html")) &&
        existsSync(join(SERVICES, `${s}.md`))
    )
    .sort()
}

describe("swatch-catalog — corpus cross-check against a DOM walk", () => {
  const all = slugs()

  it("finds previews to check", () => {
    // A silent zero here would make every assertion below vacuous.
    expect(all.length).toBeGreaterThan(0)
  })

  for (const slug of all) {
    it(`${slug}: gate verdict matches a DOM walk`, () => {
      const lightPath = join(PREVIEW, slug, "light.html")
      const darkPath = join(PREVIEW, slug, "dark.html")
      const lightRaw = readFileSync(lightPath, "utf8")
      const darkRaw = readFileSync(darkPath, "utf8")

      const result = validatePreviewPair({
        slug,
        lightRaw,
        darkRaw,
        lightBytes: statSync(lightPath).size,
        darkBytes: statSync(darkPath).size,
        designMdRaw: readFileSync(join(SERVICES, `${slug}.md`), "utf8"),
      })
      const fired = result.issues.some((i) => i.rule === "swatch-catalog")

      // The rule is per file but the result is per pair, so compare the gate's
      // verdict against whichever theme a DOM walk finds heavier.
      const lightTruth = domFillCount(lightRaw)
      const darkTruth = domFillCount(darkRaw)
      const truth = Math.max(lightTruth, darkTruth)
      const shouldFire = truth >= SWATCH_FILL_LIMIT

      expect(
        fired,
        shouldFire
          ? `${slug}: a DOM walk sees ${truth} fills (light ${lightTruth} / dark ${darkTruth}, limit ${SWATCH_FILL_LIMIT}) but swatch-catalog did not fire — the line-based scan has been blinded, see issue #222`
          : `${slug}: swatch-catalog fired although a DOM walk sees only ${truth} fills (light ${lightTruth} / dark ${darkTruth}, limit ${SWATCH_FILL_LIMIT}) — the scan now counts more than renders, so it no longer fails safe`
      ).toBe(shouldFire)
    })
  }
})
