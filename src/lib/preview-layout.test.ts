import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  DARK_PREVIEW_FILE,
  LIGHT_PREVIEW_FILE,
  MERGED_PREVIEW_FILE,
  lightScopeFile,
  resolvePreviewLayout,
} from "./preview-layout"

const has =
  (...present: Array<string>) =>
  (file: string) =>
    present.includes(file)

describe("resolvePreviewLayout", () => {
  it("reports the split layout when both theme files are present", () => {
    const layout = resolvePreviewLayout(
      has(LIGHT_PREVIEW_FILE, DARK_PREVIEW_FILE)
    )
    expect(layout).toEqual({
      kind: "split",
      files: [LIGHT_PREVIEW_FILE, DARK_PREVIEW_FILE],
    })
  })

  it("reports the merged layout when the single file is present", () => {
    const layout = resolvePreviewLayout(has(MERGED_PREVIEW_FILE))
    expect(layout).toEqual({ kind: "merged", files: [MERGED_PREVIEW_FILE] })
  })

  // During the migration a slug can briefly carry both. Split wins, because
  // split is what ships today — the iframe requests `{theme}.html` and the Vite
  // plugin only discovers slugs that have a `light.html`. Judging a
  // `preview.html` nobody serves would let the shipped halves drift unwatched.
  it("prefers split when both layouts are present", () => {
    const layout = resolvePreviewLayout(
      has(MERGED_PREVIEW_FILE, LIGHT_PREVIEW_FILE, DARK_PREVIEW_FILE)
    )
    expect(layout?.kind).toBe("split")
  })

  // ...but a merged file plus a stray half is not a servable split, so the
  // merged file is the only thing left to judge.
  it("falls back to merged when the split layout is incomplete", () => {
    expect(
      resolvePreviewLayout(has(MERGED_PREVIEW_FILE, LIGHT_PREVIEW_FILE))?.kind
    ).toBe("merged")
  })

  // A half-generated slug must not read as usable. This is the case that turns
  // a loud failure into a silent skip if it returns a layout anyway.
  it("returns null when only one half of the split layout exists", () => {
    expect(resolvePreviewLayout(has(LIGHT_PREVIEW_FILE))).toBeNull()
    expect(resolvePreviewLayout(has(DARK_PREVIEW_FILE))).toBeNull()
  })

  it("returns null when the directory holds neither layout", () => {
    expect(resolvePreviewLayout(has())).toBeNull()
    expect(resolvePreviewLayout(has("index.html", "assets"))).toBeNull()
  })
})

describe("lightScopeFile", () => {
  it("reads light.html for the split layout", () => {
    expect(
      lightScopeFile({
        kind: "split",
        files: [LIGHT_PREVIEW_FILE, DARK_PREVIEW_FILE],
      })
    ).toBe(LIGHT_PREVIEW_FILE)
  })

  it("reads the single file for the merged layout", () => {
    expect(
      lightScopeFile({ kind: "merged", files: [MERGED_PREVIEW_FILE] })
    ).toBe(MERGED_PREVIEW_FILE)
  })
})

// The unit cases above are hypothetical directories. This one asserts the
// resolver against the tree that actually ships, so a slug that loses a half
// fails here rather than in a gate that quietly checks nothing.
describe("the shipped catalogue", () => {
  const PREVIEW_DIR = fileURLToPath(
    new URL("../../public/preview", import.meta.url)
  )

  it("resolves a layout for every preview slug", () => {
    const slugs = readdirSync(PREVIEW_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
      .map((e) => e.name)

    expect(slugs.length).toBeGreaterThan(0)
    const unresolved = slugs.filter(
      (slug) =>
        resolvePreviewLayout((file) =>
          existsSync(join(PREVIEW_DIR, slug, file))
        ) === null
    )
    expect(unresolved).toEqual([])
  })
})
