import { createHash } from "node:crypto"
import { describe, expect, it } from "vitest"
import { SKILL_MARKDOWN, buildAgentSkillsIndex } from "./agent-skill-index"
import { AGENT_SKILL_MD_PATH } from "./site-config"

const ORIGIN = "https://ko-design.example"

async function index(): Promise<Record<string, any>> {
  return JSON.parse(await buildAgentSkillsIndex(ORIGIN))
}

describe("buildAgentSkillsIndex", () => {
  // Pins the shape is-agentic.com publishes at the same path. Not a schema
  // check: the declared `$schema` host does not resolve (see the comment on
  // `buildAgentSkillsIndex`).
  it("keeps the discovery shape is-agentic.com publishes", async () => {
    const doc = await index()
    expect(doc.$schema).toBe(
      "https://schemas.agentskills.io/discovery/0.2.0/schema.json"
    )
    expect(doc.skills).toHaveLength(1)
    expect(doc.skills[0].type).toBe("skill-md")
  })

  it("points at the url this site actually serves the skill from", async () => {
    const doc = await index()
    expect(doc.skills[0].url).toBe(`${ORIGIN}${AGENT_SKILL_MD_PATH}`)
  })

  it("digests the exact bytes it serves", async () => {
    // The reason the digest is computed at request time rather than baked in.
    // A precomputed value can disagree with the file whenever line endings
    // differ between the machine that built the index and the one serving it -
    // a live hazard here, where Windows checkouts have produced CRLF under
    // .claude/ before. Hashing the served string makes them agree by
    // construction, and this test is what says so.
    const expected = createHash("sha256").update(SKILL_MARKDOWN).digest("hex")
    const doc = await index()
    expect(doc.skills[0].digest).toBe(`sha256:${expected}`)
  })

  it("takes name and description from the skill's own frontmatter", async () => {
    // Not restated here. The copy an agent installs is the one in SKILL.md, so
    // a second copy in the index is a second thing to forget to update.
    const doc = await index()
    expect(doc.skills[0].name).toBe("use-design-md")
    expect(SKILL_MARKDOWN).toContain(`name: ${doc.skills[0].name}`)
    expect(SKILL_MARKDOWN).toContain(doc.skills[0].description)
    expect(doc.skills[0].description.length).toBeGreaterThan(50)
  })
})

describe("skillMeta guards", () => {
  it("keeps the frontmatter values on one line", () => {
    // The reader handles single-line scalars only, and `buildAgentSkillsIndex`
    // throws rather than publish what a block scalar yields. This asserts the
    // shape that keeps it from throwing, so the failure arrives here - naming
    // the cause - rather than as an exception during a build.
    const frontmatter = SKILL_MARKDOWN.split("---")[1] ?? ""
    for (const key of ["name", "description"]) {
      const line = frontmatter
        .split("\n")
        .find((candidate) => candidate.startsWith(`${key}:`))
      expect(line, key).toBeDefined()
      const value = line!.slice(key.length + 1).trim()
      expect(value, key).not.toBe("")
      expect(
        [">", "|"],
        `${key} must not be a YAML block scalar`
      ).not.toContain(value)
    }
  })
})
