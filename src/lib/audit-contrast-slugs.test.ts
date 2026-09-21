import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { readPreviewSlugs } from "../../scripts/audit-contrast-slugs"

// `resolvePreviewLayout` states its contract in `src/lib/preview-layout.ts`:
// "Callers must treat `null` as an error, never as 'nothing to check'". The
// other two callers do — `audit-oklch.ts` prints and sets an exit code,
// `validate-preview.ts` raises a `missing-preview-file` block. This reader has
// to as well, which means naming what it left out rather than filtering it away.

describe("readPreviewSlugs", () => {
  let dir: string

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), "audit-contrast-slugs-"))
    const put = (slug: string, files: Array<string>): void => {
      mkdirSync(join(dir, slug), { recursive: true })
      for (const f of files)
        writeFileSync(join(dir, slug, f), "<!doctype html>")
    }
    put("alpha", ["preview.html"])
    put("bravo", ["preview.html"])
    put("charlie", ["light.html", "dark.html"])
    put("delta", [])
    put("echo", ["light.html"])
    put("_runtime", ["iframe.js"])
  })
  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  it("sweeps only the merged layout", () => {
    expect(readPreviewSlugs(dir).slugs).toEqual(["alpha", "bravo"])
  })

  it("names the split slugs it cannot read", () => {
    // The sweep asks for `preview.html` and switches themes on the one
    // document, so a split slug would 404 and be reported with no findings —
    // a zero indistinguishable from a clean bill.
    expect(readPreviewSlugs(dir).split).toEqual(["charlie"])
  })

  it("names the slugs with no usable preview at all", () => {
    // An empty directory and a half-generated one. Filtering these away was
    // the defect: this reader was the only one of three that treated `null` as
    // "nothing to check", so a slug mid-onboarding would drop out of a sweep
    // that calls itself exhaustive, and the report would look untroubled.
    expect(readPreviewSlugs(dir).unusable).toEqual(["delta", "echo"])
  })

  it("does not count shared machinery as a slug", () => {
    const got = readPreviewSlugs(dir)
    for (const list of [got.slugs, got.split, got.unusable]) {
      expect(list).not.toContain("_runtime")
    }
  })

  it("sorts every list so a run is reproducible", () => {
    const got = readPreviewSlugs(dir)
    expect(got.slugs).toEqual([...got.slugs].sort())
    expect(got.unusable).toEqual([...got.unusable].sort())
  })
})
