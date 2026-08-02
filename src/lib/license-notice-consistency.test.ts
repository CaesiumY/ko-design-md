import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = process.cwd()

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
    }
  })

  it("keeps the NOTICE asset inventory in sync with public/logos", () => {
    const notice = readRepoFile("NOTICE")
    const files = readdirSync(join(ROOT, "public/logos")).sort()
    expect(files.length).toBeGreaterThan(0)

    const missing = files.filter((file) => !notice.includes(file))
    expect(
      missing,
      "every file in public/logos must be listed in NOTICE's asset inventory"
    ).toEqual([])

    const listed = [...notice.matchAll(/^ {2}(\S+\.(?:png|svg|webp|avif))\s/gm)]
      .map((m) => m[1])
      .sort()
    const stale = listed.filter((name) => !files.includes(name))
    expect(
      stale,
      "NOTICE's asset inventory must not list files that no longer exist"
    ).toEqual([])
  })
})
