import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = process.cwd()

// Renderable logo image formats. Excludes metadata files such as the
// planned public/logos/SOURCES.json provenance manifest, which is never an
// <img src> and does not belong in a brand-asset inventory.
const LOGO_IMAGE_EXTENSIONS = /\.(?:png|svg|webp|avif)$/

function readRepoFile(path: string): string {
  return readFileSync(join(ROOT, path), "utf8")
}

describe("license and notice consistency", () => {
  it("states what CC BY covers before what it excludes", () => {
    const content = readRepoFile("LICENSE-CONTENT")
    expect(content).toContain("Scope (CC BY 4.0)")
    expect(content).toContain("Prose written for this catalog")
    expect(content).toContain("Preview layout, CSS, and component structure")
    expect(content).toContain(
      "OG card layout, typography, and breadcrumbs in public/og/**"
    )
  })

  it("excludes third-party assets reproduced inside previews and OG images", () => {
    const content = readRepoFile("LICENSE-CONTENT")
    expect(content).toContain("public/preview/** and public/og/**")
    expect(content).toContain("Third-party fonts and photographs")
    expect(content).toContain("National emblems")
  })

  it("describes krds.svg as a national emblem without asserting one license", () => {
    const notice = readRepoFile("NOTICE")
    expect(notice).toContain("government symbol")
    expect(notice).toContain("정부기에 관한 공고")
    expect(notice).toContain("KOGL Type 1")
    expect(notice).toContain("NOT verified")
  })

  it("lists which brand each logo file belongs to", () => {
    const notice = readRepoFile("NOTICE")
    expect(notice).toContain("Asset inventory")
    expect(notice).toContain("greeting.svg")
    expect(notice).toContain("toss.png")
  })

  it("keeps the footer free of provisional and US-law wording", () => {
    const footer = readRepoFile("src/components/site/footer.tsx").replace(
      /\s+/g,
      " "
    )
    expect(footer).not.toContain("잠정")
    expect(footer).not.toContain("fair use")
  })

  it("states non-affiliation in the footer", () => {
    const footer = readRepoFile("src/components/site/footer.tsx").replace(
      /\s+/g,
      " "
    )
    expect(footer).toContain("제휴·후원 관계가 없습니다")
  })

  it("never re-declares whole preview or og directories as CC BY", () => {
    const surfaces = ["LICENSE-CONTENT", "README.md", "CONTRIBUTING.md"]
    for (const surface of surfaces) {
      const text = readRepoFile(surface)
      expect(
        text,
        `${surface} must not grant public/preview/** wholesale — only the repo-authored parts are CC BY`
      ).not.toMatch(/`?public\/preview\/\*\*`?[^\n]*CC BY/)
      expect(
        text,
        `${surface} must not grant public/og/** wholesale — only the repo-authored parts are CC BY`
      ).not.toMatch(/`?public\/og\/\*\*`?[^\n]*CC BY/)
    }
  })

  // public/logos was never the only place brand artwork lives: preview mockups
  // may embed a brand's own imagery beside them. The scope sentence and the two
  // Korean-language surfaces below said "public/logos/*" alone, so four 당근
  // service icons under public/preview/seed-design/assets/ sat outside every
  // declaration. The same two surfaces were also the ones an earlier pass
  // missed, which is why this is a test rather than a note.
  //
  // Those four icons have since been replaced with inline SVG and no preview
  // embeds brand artwork today. The declarations still have to hold: they are
  // what makes the next embedded asset a declared one rather than a silent one.
  it("scopes brand assets to previews as well as logos", () => {
    const notice = readRepoFile("NOTICE")
    expect(notice).toContain("public/preview/*/assets/")
    expect(notice).toContain("Preview asset inventory")

    for (const surface of ["README.md", "CONTRIBUTING.md"]) {
      const text = readRepoFile(surface)
      const line = text
        .split("\n")
        .find((l) => l.includes("브랜드 자산") && l.includes("public/logos"))
      expect(line, `${surface} must scope brand assets somewhere`).toBeDefined()
      expect(
        line,
        `${surface} scopes brand assets to public/logos only — preview-embedded brand imagery is left undeclared`
      ).toContain("public/preview/*/assets/*")
    }
  })

  it("keeps the NOTICE preview-asset inventory in sync with public/preview", () => {
    const notice = readRepoFile("NOTICE")
    const start = notice.indexOf("Preview asset inventory")
    expect(
      start,
      "NOTICE must contain a preview-asset inventory"
    ).toBeGreaterThan(-1)
    // Bounded at the logo inventory so the two lists never read each other's rows.
    const section = notice.slice(start, notice.indexOf("Asset inventory —"))

    const listed = [...section.matchAll(/^ {4}(\S+)\s/gm)]
      .map((m) => m[1])
      .sort()

    const previewRoot = join(ROOT, "public/preview")
    const embedded: Array<string> = []
    for (const entry of readdirSync(previewRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      let assets: Array<string>
      try {
        assets = readdirSync(join(previewRoot, entry.name, "assets"))
      } catch {
        continue
      }
      for (const file of assets) {
        if (/\.(?:png|svg|webp|avif|jpe?g)$/.test(file)) {
          embedded.push(`public/preview/${entry.name}/assets/${file}`)
        }
      }
    }
    embedded.sort()

    expect(
      embedded.filter((f) => !listed.includes(f)),
      "every brand image embedded in a preview must be listed in NOTICE"
    ).toEqual([])
    expect(
      listed.filter((f) => !embedded.includes(f)),
      "NOTICE must not list preview assets that no longer exist"
    ).toEqual([])
  })

  it("keeps the NOTICE asset inventory in sync with public/logos", () => {
    const notice = readRepoFile("NOTICE")
    const files = readdirSync(join(ROOT, "public/logos"))
      .filter((file) => LOGO_IMAGE_EXTENSIONS.test(file))
      .sort()
    expect(files.length).toBeGreaterThan(0)

    // Parse only the rows inside the "Asset inventory" section, not the
    // whole document — krds.svg is also named earlier in the national-emblem
    // prose block (NOTICE:13,15), so searching notice.includes(file) can't
    // detect a deleted inventory row: it stays "found" via the prose
    // mention, and the reverse stale-check only walks rows that still
    // exist, so a silently-vanished row is flagged by neither direction.
    const inventorySection = notice.slice(notice.indexOf("Asset inventory"))
    expect(
      inventorySection.length,
      "NOTICE must contain an 'Asset inventory' section"
    ).toBeGreaterThan(0)

    const listed = [...inventorySection.matchAll(/^ {2}(\S+)\s/gm)]
      .map((match) => match[1])
      .filter((name) => LOGO_IMAGE_EXTENSIONS.test(name))
      .sort()

    const missing = files.filter((file) => !listed.includes(file))
    expect(
      missing,
      "every file in public/logos must be listed in NOTICE's asset inventory"
    ).toEqual([])

    const stale = listed.filter((name) => !files.includes(name))
    expect(
      stale,
      "NOTICE's asset inventory must not list files that no longer exist"
    ).toEqual([])
  })
})
