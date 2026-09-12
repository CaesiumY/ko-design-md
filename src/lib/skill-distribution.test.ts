import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import matter from "gray-matter"
import {
  INTERNAL_SKILLS,
  PUBLIC_SKILLS,
  SKILLS_DIR,
  readRepoFile,
} from "./skill-asset-paths"

// Three independent mechanisms decide whether a project skill leaves this repo,
// and until this test nothing checked that they agree:
//
//   1. `metadata.internal: true` in SKILL.md — hides it from skills.sh discovery
//   2. `.claude-plugin/marketplace.json` `skills` — the plugin channel whitelist
//   3. `PUBLIC_SKILLS` / `INTERNAL_SKILLS` — the declaration in this repo
//
// They had already drifted once: CHANGELOG listed two internal skills after
// `preview-prose-audit` became the third. The boundary is enforced here rather
// than by splitting public and internal skills into separate directories because
// skills.sh walks `.claude/skills/` for both local and remote installs — moving
// the public skill out would buy no discovery change and would cost its in-repo
// use plus every external link to its current path.

interface MarketplaceManifest {
  plugins: Array<{ name: string; skills?: Array<string> }>
}

const ROOT = process.cwd()

function skillDirsOnDisk(): Array<string> {
  // Scoped to THIS repo's project skills on purpose. User-level or plugin-cache
  // skills differ per contributor machine and would make the result local.
  return readdirSync(join(ROOT, SKILLS_DIR), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

function isMarkedInternal(slug: string): boolean {
  const { data } = matter(readRepoFile(`${SKILLS_DIR}/${slug}/SKILL.md`))
  return data.metadata?.internal === true
}

describe("project skill distribution boundary", () => {
  it("declares every skill directory as exactly one of public or internal", () => {
    const declared = [...PUBLIC_SKILLS, ...INTERNAL_SKILLS]
    const overlap = PUBLIC_SKILLS.filter((slug) =>
      (INTERNAL_SKILLS as ReadonlyArray<string>).includes(slug)
    )
    expect(overlap, "a skill cannot be both public and internal").toEqual([])
    expect(
      skillDirsOnDisk(),
      "a skill directory exists that is not declared in skill-asset-paths.ts — add it to PUBLIC_SKILLS or INTERNAL_SKILLS"
    ).toEqual([...declared].sort())
  })

  it.each(INTERNAL_SKILLS)(
    "%s carries metadata.internal: true in its frontmatter",
    (slug) => {
      expect(isMarkedInternal(slug)).toBe(true)
    }
  )

  it.each(PUBLIC_SKILLS)(
    "%s does not carry metadata.internal (it would vanish from skills.sh)",
    (slug) => {
      expect(isMarkedInternal(slug)).toBe(false)
    }
  )

  it("ships exactly the public skills through the plugin marketplace", () => {
    const manifest = JSON.parse(
      readRepoFile(".claude-plugin/marketplace.json")
    ) as MarketplaceManifest
    const shipped = manifest.plugins.flatMap((plugin) => plugin.skills ?? [])
    // Equality, not inclusion: an internal skill leaking in and a public skill
    // falling out are both failures.
    expect([...shipped].sort()).toEqual(
      PUBLIC_SKILLS.map((slug) => `./${SKILLS_DIR}/${slug}`).sort()
    )
  })

  it("keeps .agents/skills/ absent — skills.sh scans it, which would bypass this manifest", () => {
    expect(existsSync(join(ROOT, ".agents", "skills"))).toBe(false)
  })
})
