import { readFileSync } from "node:fs"
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
    const footer = readRepoFile("src/components/site/footer.tsx")
    expect(footer).not.toContain("잠정")
    expect(footer).not.toContain("fair use")
  })

  it("states non-affiliation in the footer", () => {
    const footer = readRepoFile("src/components/site/footer.tsx")
    expect(footer).toContain("제휴·후원 관계가 없습니다")
  })
})
