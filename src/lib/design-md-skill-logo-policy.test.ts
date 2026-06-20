import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(ROOT, path), "utf8")
}

function readFrontmatter(path: string): string {
  const raw = readRepoFile(path)
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return match?.[1] ?? ""
}

describe("/design-md logo policy", () => {
  it("documents the conditional logo path through the skill pipeline", () => {
    const skill = readRepoFile(".claude/skills/design-md/SKILL.md")
    const author = readRepoFile(".claude/agents/design-md-author.md")
    const previewAuthor = readRepoFile(".claude/agents/preview-html-author.md")
    const designRubric = readRepoFile(
      ".claude/skills/design-md/references/rubric-design.md"
    )
    const previewRubric = readRepoFile(
      ".claude/skills/design-md/references/rubric-preview.md"
    )

    expect(skill).toContain("public/logos/{slug}.{svg,png,webp,avif}")
    expect(skill).toContain("logo_url")
    expect(skill).toContain("logo_src_path")
    expect(skill).toContain("Logo deterministic check")
    expect(skill).toContain('[ -f "$logo_asset_path" ]')
    expect(skill).toContain("logo: {logo_url}")
    expect(skill).not.toContain("${logo_url}")
    expect(skill).not.toContain("${logo_src_path}")
    expect(author).toContain("logo_url")
    expect(author).toContain("logo: {logo_url}")
    expect(previewAuthor).toContain("logo_src_path")
    expect(previewAuthor).toContain("both light.html and dark.html")
    expect(designRubric).toContain("Expected logo")
    expect(previewRubric).toContain("site-relative")
  })

  it("keeps existing service logo assets present and visible in both previews", () => {
    const servicePaths = [
      "services/krds.md",
      "services/toss.md",
      "services/vapor-ui.md",
      "services/wanted.md",
    ]

    for (const servicePath of servicePaths) {
      const frontmatter = readFrontmatter(servicePath)
      const slug = servicePath.match(/services\/(.+)\.md$/)?.[1]
      const logo = frontmatter.match(/^logo:\s*(\S+)\s*$/m)?.[1]

      expect(slug, `${servicePath} slug`).toBeTruthy()
      expect(logo, `${servicePath} logo frontmatter`).toBeTruthy()
      expect(logo, `${servicePath} logo must be absolute URL`).toMatch(
        /^https:\/\/getdesign\.kr\/logos\//
      )
      const logoSrcPath = logo!.replace(/^https:\/\/getdesign\.kr/, "")
      expect(
        existsSync(join(ROOT, "public", logoSrcPath.replace(/^\//, ""))),
        `${servicePath} logo asset must exist at public${logoSrcPath}`
      ).toBe(true)

      for (const theme of ["light", "dark"]) {
        const previewPath = `public/preview/${slug}/${theme}.html`
        expect(
          readRepoFile(previewPath),
          `${previewPath} must embed site-relative <img src> (not the absolute URL form)`
        ).toContain(`src="${logoSrcPath}"`)
      }
    }
  })
})
