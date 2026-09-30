import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { parse } from "yaml"
import {
  DESIGN_MD_AUTHOR_AGENT,
  DESIGN_MD_REVIEWER_AGENT,
  DESIGN_MD_RUBRIC_DESIGN,
  DESIGN_MD_RUBRIC_PREVIEW,
  DESIGN_MD_SKILL,
  PREVIEW_HTML_AUTHOR_AGENT,
  PREVIEW_HTML_REVIEWER_AGENT,
  readRepoFile,
} from "./skill-asset-paths"
import { LOGO_TAKEDOWNS } from "./logo-takedowns"

const ROOT = process.cwd()

// Renderable logo image formats. Excludes metadata files such as the
// planned public/logos/SOURCES.json provenance manifest, which is never
// referenced as an <img src> and must not trip the orphan/inventory guards.
const LOGO_IMAGE_EXTENSIONS = /\.(?:png|svg|webp|avif)$/

// The frontmatter's `logo` as a YAML reader sees it, so a trailing comment
// (`logo: https://… # note`) is stripped the way `buildDoc` strips it rather
// than making the value unreadable and the logo look missing.
function logoOf(frontmatter: string): string | undefined {
  // Catalog frontmatter is a YAML map (`frontmatter-yaml-invalid` blocks
  // anything else), so the only shape question left is the value's type.
  const data = parse(frontmatter) as { logo?: string | number | null } | null
  return typeof data?.logo === "string" ? data.logo : undefined
}

function readFrontmatter(path: string): string {
  const raw = readRepoFile(path)
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return match?.[1] ?? ""
}

describe("/design-md logo policy", () => {
  it("documents the required logo path through the skill pipeline", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)
    const author = readRepoFile(DESIGN_MD_AUTHOR_AGENT)
    const previewAuthor = readRepoFile(PREVIEW_HTML_AUTHOR_AGENT)
    const designRubric = readRepoFile(DESIGN_MD_RUBRIC_DESIGN)
    const previewRubric = readRepoFile(DESIGN_MD_RUBRIC_PREVIEW)

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
    // The phrase used to say "both light.html and dark.html". One file carries
    // both themes now, so what has to survive is that the site-relative form is
    // the one embedded — not a count of files.
    expect(previewAuthor).toContain("the site-relative form")
    expect(designRubric).toContain("Expected logo")
    expect(previewRubric).toContain("site-relative")

    // A logo is required (#456 decision): intake has no "없음" answer, Stage 4a
    // does not continue without one, and the draft gate blocks the omission.
    // The old optional path must not creep back into any layer: the skill,
    // both authors, both reviewers, both rubrics, or the draft gate.
    expect(skill).not.toContain("may ship without a logo")
    expect(skill).not.toContain('{logo_url or "none"}')
    expect(skill).not.toContain('{logo_src_path or "none"}')
    expect(skill).toContain("Logo candidates")
    // Only official assets: the fallback must not ask for a derived image.
    expect(skill).not.toContain("crop it to the symbol")
    expect(skill).toContain("Never crop, recolor")
    // A takedown slug must never have its logo re-fetched by the pipeline.
    expect(skill).toContain("LOGO_TAKEDOWNS")
    expect(skill).not.toContain("`logo_asset_path` (string or empty)")
    expect(skill).not.toContain("If no logo path was provided")
    expect(skill).not.toContain("until a file resolves")
    expect(skill).toContain("missing-logo")
    expect(author).not.toContain("either `none` or")
    expect(author).not.toContain("omit the `logo` key")
    expect(previewAuthor).not.toContain("either `none` or")
    expect(previewAuthor).not.toContain("`logo_src_path` is `none`")
    const designReviewer = readRepoFile(DESIGN_MD_REVIEWER_AGENT)
    const previewReviewer = readRepoFile(PREVIEW_HTML_REVIEWER_AGENT)
    expect(designReviewer).not.toContain("either `none` or")
    expect(previewReviewer).not.toContain("either `none` or")
    expect(previewReviewer).not.toContain("is not `none`")
    expect(previewRubric).not.toContain(
      "If the orchestrator passes `expected_logo_src_path`"
    )
    expect(readRepoFile("scripts/validate-draft.ts")).not.toContain(
      "<url|none>"
    )
    expect(designRubric).not.toContain("`logo` remains optional")
    expect(readRepoFile("src/lib/draft-validator.ts")).toContain(
      '"missing-logo"'
    )
  })

  // rubric-preview.md Item 1: the frontmatter logo must appear in both previews.
  // Known gaps — these use a different *official* asset, not a rights issue:
  // gmarket's frontmatter names gmarket.png while its preview embeds
  // gmarket-logotype.png, and socar's names socar.png against a socar.svg embed
  // (same mark, different format). Both are notation mismatches between assets we
  // are already entitled to use, so neither blocks on brand rights the way a
  // self-made derivative would. Do not add entries without a linked follow-up.
  const KNOWN_LOGO_GAPS = new Set(["gmarket", "socar"])

  it("lists only takedown slugs that still exist as entries", () => {
    // The list must not outlive the entry either: a slug left behind after a
    // full removal would silently exempt a later entry of the same slug.
    for (const [slug, issue] of LOGO_TAKEDOWNS) {
      expect(
        Number.isInteger(issue) && issue > 0,
        `LOGO_TAKEDOWNS ${slug} must name its takedown request issue number`
      ).toBe(true)
      expect(
        existsSync(join(ROOT, "services", `${slug}.md`)),
        `LOGO_TAKEDOWNS lists ${slug}, but services/${slug}.md is gone — remove it from the list`
      ).toBe(true)
    }
  })

  it("reads a logo that carries a trailing comment", () => {
    expect(
      logoOf(
        ["slug: demo", "logo: https://getdesign.kr/logos/demo.png # note"].join(
          "\n"
        )
      )
    ).toBe("https://getdesign.kr/logos/demo.png")
    expect(logoOf("slug: demo")).toBeUndefined()
  })

  it("keeps every service logo asset present and visible in both previews", () => {
    const servicePaths = readdirSync(join(ROOT, "services"))
      .filter((file) => file.endsWith(".md"))
      .map((file) => `services/${file}`)

    expect(servicePaths.length).toBeGreaterThan(0)

    for (const servicePath of servicePaths) {
      const frontmatter = readFrontmatter(servicePath)
      const slug = servicePath.match(/services\/(.+)\.md$/)?.[1]
      const logo = logoOf(frontmatter)

      expect(slug, `${servicePath} slug`).toBeTruthy()

      // A takedown (docs/TAKEDOWN.md) is the one recorded way to ship
      // without a logo, and the list must not outlive the removal.
      if (LOGO_TAKEDOWNS.has(slug!)) {
        expect(
          logo,
          `${servicePath} is in LOGO_TAKEDOWNS but still declares a logo — remove it from the list`
        ).toBeUndefined()
        continue
      }

      // Every entry carries a logo — the skill no longer lets intake skip it
      // and `validate:draft` blocks a draft without one (`missing-logo`).
      expect(
        logo,
        `${servicePath} must declare a frontmatter logo`
      ).toBeTruthy()
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

      const previewPath = `public/preview/${slug}/preview.html`
      expect(
        readRepoFile(previewPath),
        `${previewPath} must embed site-relative <img src> (not the absolute URL form)`
      ).toContain(`src="${logoSrcPath}"`)
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
