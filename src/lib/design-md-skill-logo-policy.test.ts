import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { parse } from "yaml"
import {
  DESIGN_MD_AUTHOR_AGENT,
  DESIGN_MD_SKILL,
  readRepoFile,
} from "./skill-asset-paths"
import { LOGO_TAKEDOWNS, TAKEDOWN_REF } from "./logo-takedowns"

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

// Whether the frontmatter has a `logo` key at all, whatever its value. A
// takedown entry must have none: an empty `logo:` reads as `null` here but as
// `[]` in the site parser, which crashes the logo renderer.
function hasLogoKey(frontmatter: string): boolean {
  const data = parse(frontmatter) as Record<string, string | null> | null
  return data !== null && Object.hasOwn(data, "logo")
}

function readFrontmatter(path: string): string {
  const raw = readRepoFile(path)
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return match?.[1] ?? ""
}

describe("/design-md logo policy", () => {
  // What the skill and the author write about the logo, held to the code that
  // reads it: the path form the draft gate accepts, the frontmatter line the
  // author emits and the gate reads, the takedown list and the rule id by the
  // names they carry in code. Sentences that only have to be present are not
  // pinned (#424) — the draft gate blocks a missing logo either way.
  it("names the logo path, key and rule the draft gate actually uses", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)
    const author = readRepoFile(DESIGN_MD_AUTHOR_AGENT)

    // The extensions the draft gate's logo URL pattern accepts.
    expect(skill).toContain("public/logos/{slug}.{svg,png,webp,avif}")
    // The frontmatter line the author writes and the gate reads.
    expect(skill).toContain("logo: {logo_url}")
    expect(author).toContain("logo: {logo_url}")
    // A takedown slug must never have its logo re-fetched by the pipeline; the
    // list is checked by its code name. A fully removed entry leaves no row,
    // and the CHANGELOG Removed line is its record.
    expect(skill).toContain("LOGO_TAKEDOWNS")
    expect(skill).toContain("CHANGELOG.md")
    // The rule id the skill names is one the draft gate emits.
    expect(skill).toContain("missing-logo")
    expect(readRepoFile("src/lib/draft-validator.ts")).toContain(
      '"missing-logo"'
    )
    // The CLI takes no "none" logo (#456: a logo is required).
    expect(readRepoFile("scripts/validate-draft.ts")).not.toContain(
      "<url|none>"
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
    for (const [slug, ref] of LOGO_TAKEDOWNS) {
      expect(
        TAKEDOWN_REF.test(ref),
        `LOGO_TAKEDOWNS ${slug} must name its request as #<issue> or GHSA-… (got ${ref})`
      ).toBe(true)
      expect(
        existsSync(join(ROOT, "services", `${slug}.md`)),
        `LOGO_TAKEDOWNS lists ${slug}, but services/${slug}.md is gone — remove it from the list`
      ).toBe(true)
    }
  })

  it("accepts the two takedown request references and nothing else", () => {
    for (const ok of ["#1", "#456", "GHSA-2c3h-4f5g-6j7m"]) {
      expect(TAKEDOWN_REF.test(ok), ok).toBe(true)
    }
    for (const bad of ["123", "#0", "#", "GHSA-abcd", "private", ""]) {
      expect(TAKEDOWN_REF.test(bad), bad).toBe(false)
    }
  })

  it("sees an empty `logo:` line as a present key", () => {
    expect(hasLogoKey(["slug: demo", "logo:"].join("\n"))).toBe(true)
    expect(hasLogoKey("slug: demo")).toBe(false)
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
          `${servicePath} is in LOGO_TAKEDOWNS but still declares a logo — remove the \`logo\` key and every line of its value; only a restore the maintainers decided takes the slug off the list instead (docs/TAKEDOWN.md, as validate:draft's takedown-logo-declared says)`
        ).toBeUndefined()
        expect(
          hasLogoKey(frontmatter),
          `${servicePath} is in LOGO_TAKEDOWNS but keeps a \`logo:\` line — remove the \`logo\` key and every line of its value`
        ).toBe(false)
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
