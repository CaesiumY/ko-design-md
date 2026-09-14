import { createHash } from "node:crypto"
import { describe, expect, it, vi } from "vitest"
import {
  SKILL_MARKDOWN,
  agentSkillsIndexResponse,
  buildAgentSkillsIndex,
  isBlockScalarIndicator,
} from "./agent-skill-index"
import { AGENT_SKILL_MD_PATH } from "./site-config"
import { USE_DESIGN_MD_SKILL, readRepoFile } from "./skill-asset-paths"

const ORIGIN = "https://ko-design.example"

// The fields these tests read. `JSON.parse` is untyped, so the shape is named
// here rather than letting the rest of the file read through `any`.
interface AgentSkillsIndexDoc {
  $schema: string
  skills: Array<{
    name: string
    type: string
    description: string
    url: string
    digest: string
  }>
}

async function index(): Promise<AgentSkillsIndexDoc> {
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

describe("SKILL_MARKDOWN", () => {
  it("is the file skill-asset-paths.ts declares for use-design-md", () => {
    // The import in agent-skill-index.ts has to spell the path out, because
    // `?raw` takes only a literal. This is what keeps that literal and the
    // declared one from drifting apart - a moved skill fails here, not as a
    // published SKILL.md that no longer matches the distributed one.
    expect(SKILL_MARKDOWN).toBe(readRepoFile(USE_DESIGN_MD_SKILL))
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
        isBlockScalarIndicator(value),
        `${key} must not be a YAML block scalar`
      ).toBe(false)
    }
  })
})

describe("isBlockScalarIndicator", () => {
  // Each of these is a valid YAML block scalar header. The guard used to catch
  // only the two bare characters, so the rest reached the index as the literal
  // description text instead of throwing.
  it.each([
    ">",
    "|",
    ">-",
    ">+",
    "|-",
    "|+",
    ">2",
    "|9",
    ">2-",
    "|-2",
    "> # folded",
    "|+ # kept",
  ])("treats %j as a block scalar header", (value) => {
    expect(isBlockScalarIndicator(value)).toBe(true)
  })

  // Ordinary single-line values, including ones that merely start with the
  // indicator characters. None of these may throw.
  it.each([
    "use-design-md",
    "Pull a Korean brand's design.md and apply it",
    "> quoted text on the same line",
    ">>",
    "|pipe-prefixed",
    ">0",
    ">-+",
    "",
  ])("leaves %j alone", (value) => {
    expect(isBlockScalarIndicator(value)).toBe(false)
  })
})

describe("agentSkillsIndexResponse", () => {
  it("serves the index as json on the agent cache terms", async () => {
    const response = await agentSkillsIndexResponse(ORIGIN)
    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toBe(
      "application/json; charset=utf-8"
    )
    expect(response.headers.get("cache-control")).toContain("s-maxage")
    expect(response.headers.get("access-control-allow-origin")).toBe("*")
    const doc: AgentSkillsIndexDoc = JSON.parse(await response.text())
    expect(doc.skills[0].name).toBe("use-design-md")
  })

  it("turns a failed build into a 500 no shared cache keeps", async () => {
    // Still loud - a 500 on this one endpoint, reported - but on the error cache
    // terms, so the broken answer does not outlive the fix at the edge.
    const report = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      const response = await agentSkillsIndexResponse(ORIGIN, () =>
        Promise.reject(new Error("description is a YAML block scalar"))
      )
      expect(response.status).toBe(500)
      const cacheControl = response.headers.get("cache-control") ?? ""
      expect(cacheControl).not.toContain("s-maxage")
      expect(cacheControl).toContain("must-revalidate")
      expect(response.headers.get("access-control-allow-origin")).toBe("*")
      expect(report).toHaveBeenCalledTimes(1)
    } finally {
      report.mockRestore()
    }
  })
})
