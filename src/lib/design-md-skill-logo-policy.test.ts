import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = process.cwd()

// Renderable logo image formats. Excludes metadata files such as the
// planned public/logos/SOURCES.json provenance manifest, which is never
// referenced as an <img src> and must not trip the orphan/inventory guards.
const LOGO_IMAGE_EXTENSIONS = /\.(?:png|svg|webp|avif)$/

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

  // rubric-preview.md Item 1: the frontmatter logo must appear in both previews.
  // Known gaps — these use a different *official* asset, not a rights issue.
  // Tracked separately (see docs/superpowers/specs/2026-08-02-brand-license-notice-greeting-logo-design.md,
  // "범위 밖"); do not add entries without a linked follow-up.
  const KNOWN_LOGO_GAPS = new Set(["gmarket", "socar"])

  it("keeps every service logo asset present and visible in both previews", () => {
    const servicePaths = readdirSync(join(ROOT, "services"))
      .filter((file) => file.endsWith(".md"))
      .map((file) => `services/${file}`)

    expect(servicePaths.length).toBeGreaterThan(0)

    for (const servicePath of servicePaths) {
      const frontmatter = readFrontmatter(servicePath)
      // The /design-md pipeline's `lang: both` mode writes a bilingual
      // companion file services/{slug}.en.md alongside services/{slug}.md
      // (.claude/skills/design-md/SKILL.md). Strip a trailing `.en` so the
      // companion resolves to the same base slug — and therefore the same
      // shared preview directory — instead of a nonexistent
      // public/preview/{slug}.en/ path. Every other check below (absolute
      // logo URL, asset existence) still runs against the companion's own
      // frontmatter.
      const slug = servicePath
        .match(/services\/(.+)\.md$/)?.[1]
        ?.replace(/\.en$/, "")
      const logo = frontmatter.match(/^logo:\s*(\S+)\s*$/m)?.[1]

      expect(slug, `${servicePath} slug`).toBeTruthy()

      // logo is optional: design-md-author.md:80 has the author omit the
      // `logo` key entirely when logo_url is "none" (SKILL.md:60 lets the
      // user skip it with "없음"). All 17 current entries happen to have a
      // logo, but a logo-less entry is a valid pipeline outcome — do not
      // restore an unconditional `toBeTruthy()` here.
      if (!logo) continue

      expect(logo, `${servicePath} logo must be absolute URL`).toMatch(
        /^https:\/\/getdesign\.kr\/logos\//
      )
      const logoSrcPath = logo.replace(/^https:\/\/getdesign\.kr/, "")
      expect(
        existsSync(join(ROOT, "public", logoSrcPath.replace(/^\//, ""))),
        `${servicePath} logo asset must exist at public${logoSrcPath}`
      ).toBe(true)

      // KNOWN_LOGO_GAPS exempts ONLY the preview-embedding check below.
      // The absolute-URL form and asset existence above apply to every slug.
      if (KNOWN_LOGO_GAPS.has(slug!)) continue

      for (const theme of ["light", "dark"]) {
        const previewPath = `public/preview/${slug}/${theme}.html`
        expect(
          readRepoFile(previewPath),
          `${previewPath} must embed site-relative <img src> (not the absolute URL form)`
        ).toContain(`src="${logoSrcPath}"`)
      }
    }
  })

  it("keeps no unreferenced files in public/logos", () => {
    const logoFiles = readdirSync(join(ROOT, "public/logos")).filter((file) =>
      LOGO_IMAGE_EXTENSIONS.test(file)
    )
    expect(logoFiles.length).toBeGreaterThan(0)

    const haystackPaths = [
      ...readdirSync(join(ROOT, "services"))
        .filter((file) => file.endsWith(".md"))
        .map((file) => `services/${file}`),
      ...readdirSync(join(ROOT, "public/preview"), { recursive: true })
        .map((entry) => `public/preview/${String(entry).replace(/\\/g, "/")}`)
        .filter((path) => path.endsWith(".html")),
      ...readdirSync(join(ROOT, "src"), { recursive: true })
        .map((entry) => `src/${String(entry).replace(/\\/g, "/")}`)
        .filter((path) => path.endsWith(".ts") || path.endsWith(".tsx")),
    ]

    const haystack = haystackPaths.map(readRepoFile).join("\n")

    // Match the reference form (/logos/<file>), not a bare filename — prose
    // that merely names an upstream asset is not a reference.
    const orphans = logoFiles.filter(
      (file) => !haystack.includes(`/logos/${file}`)
    )

    expect(
      orphans,
      "unreferenced logo files must be deleted; NOTICE's identification-and-reference justification does not apply to assets nothing renders"
    ).toEqual([])
  })
})
