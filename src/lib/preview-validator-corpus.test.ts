import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { JSDOM } from "jsdom"
import { describe, expect, it } from "vitest"
import { swatchFillCount, validatePreviewPair } from "./preview-validator"

// `swatchFillCount` walks document structure, keeping a stack of open elements.
// This test holds that walk to what a browser actually renders, measured with
// jsdom over every shipped preview. jsdom is a devDependency, so it can be the
// ground truth here while the validator itself stays dependency-free apart from
// `node:zlib` — that division of labour is the reason this file exists.
//
// Before issue #222 the validator scanned line by line, the two counts
// legitimately disagreed (bezier 7 vs 12), and this file could only compare
// verdicts. Now it asserts the **counts** match: both sides compute the same
// meaning by different means — under `<body>`, inline `style` carrying
// `background`, no text including descendants, attributed to the nearest
// `data-theme-only` ancestor — so any divergence means the walk misread the
// structure. Count equality is far tighter than verdict equality: it catches
// drift that stays quiet below the limit, which is exactly where bezier's
// 7-vs-12 hid.
//
// The verdict comparison stays too. Equal counts do not prove the threshold
// comparison and the `shared + max` aggregation are wired into `checkFile`
// correctly, and that is a separate failure.

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
    it(`${slug}: fill count and gate verdict match a DOM walk`, () => {
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

      const lightTruth = domFillCount(lightRaw)
      const darkTruth = domFillCount(darkRaw)

      // 1) Count equality — did the walk read the structure correctly?
      expect(
        swatchFillCount(lightRaw),
        `${slug}/light.html: the walk and a DOM walk disagree on the fill count`
      ).toBe(lightTruth)
      expect(
        swatchFillCount(darkRaw),
        `${slug}/dark.html: the walk and a DOM walk disagree on the fill count`
      ).toBe(darkTruth)

      // 2) Verdict equality — is that count wired into the gate correctly? The
      // rule is per file but the result is per pair, so compare against
      // whichever theme a DOM walk finds heavier.
      const truth = Math.max(lightTruth, darkTruth)
      const shouldFire = truth >= SWATCH_FILL_LIMIT

      expect(
        fired,
        shouldFire
          ? `${slug}: a DOM walk sees ${truth} fills (light ${lightTruth} / dark ${darkTruth}, limit ${SWATCH_FILL_LIMIT}) but swatch-catalog did not fire — the rule has been voided, see issue #222`
          : `${slug}: swatch-catalog fired although a DOM walk sees only ${truth} fills (light ${lightTruth} / dark ${darkTruth}, limit ${SWATCH_FILL_LIMIT}) — the walk counts more than renders`
      ).toBe(shouldFire)
    })
  }
})

// The corpus is 34 files in one generator's house style, so it never exercises
// single-quoted attributes, unquoted values, stray close tags, `<template>`, or
// comment-only children — all of which a hand-authored entry may carry
// (CONTRIBUTING allows hand-authoring, and `hasAttrValue`'s note says so). The
// walk could diverge on any of these and the corpus sweep above would stay
// green.
//
// Expectations are never written by hand here. Naming a number would make this
// a copy of the walk and verify nothing; the assertion is equality with jsdom.
const STRUCTURE_FIXTURES: Array<[string, string]> = [
  [
    "multi-line start tag",
    `<div\n  class="c"\n  style="background:red"\n></div>`,
  ],
  ["void fill", `<hr style="background:red">`],
  ["comment-only child", `<div style="background:red"><!-- c --></div>`],
  ["nbsp-only child", `<div style="background:red">&nbsp;</div>`],
  [
    "same-tag nesting",
    `<span style="background:red"><span style="background:blue"></span></span>`,
  ],
  [
    "self-closing tags inside svg",
    `<svg viewBox="0 0 2 2"><path d="M0 0"/></svg><div style="background:red"></div>`,
  ],
  ["single-quoted attribute", `<div style='background:red'></div>`],
  ["unquoted attribute value", `<div style=background:red></div>`],
  [
    "attribute value containing >",
    `<div title="a > b" style="background:red"></div>`,
  ],
  ["stray close tag", `<div style="background:red"></span></div>`],
  ["data-style must not count", `<div data-style="background:red"></div>`],
  [
    "theme wrapper across lines",
    `<div\n  data-theme-only="dark"\n>\n<div style="background:red"></div>\n</div><div style="background:blue"></div>`,
  ],
  [
    "fill after a closed wrapper",
    `<div data-theme-only="light"><div style="background:red"></div></div><div style="background:blue"></div>`,
  ],
  [
    "inline script containing markup",
    `<script>var a = "<div style=x></div>"</script><div style="background:red"></div>`,
  ],
  [
    "template content does not render",
    `<template><div style="background:red"></div></template><div style="background:blue"></div>`,
  ],
]

describe("swatch-catalog — structural fixtures cross-checked against a DOM walk", () => {
  for (const [label, body] of STRUCTURE_FIXTURES) {
    it(`${label}: fill count matches a DOM walk`, () => {
      const html = `<!doctype html><html lang="ko" data-theme="light"><head></head><body><main>${body}</main></body></html>`
      expect(swatchFillCount(html)).toBe(domFillCount(html))
    })
  }
})
