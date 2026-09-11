import skillMarkdown from "/.claude/skills/use-design-md/SKILL.md?raw"
import { splitFrontmatter } from "./content-parser"
import { AGENT_SKILL_MD_PATH } from "./site-config"

/**
 * The `use-design-md` skill, served for standards-based discovery.
 *
 * The bytes are imported from the same file skills.sh clones and the plugin
 * marketplace points at (`.claude-plugin/marketplace.json`), so the three
 * distribution channels cannot drift from each other - there is no copy of the
 * skill under `public/` to forget to update.
 */
export const SKILL_MARKDOWN = skillMarkdown

/**
 * Skill name and description, read out of the skill's own frontmatter.
 *
 * Restating the description here would put the catalog's most load-bearing
 * "when to use me" sentence in two places, and the copy that agents actually
 * install is the one in the file. `splitFrontmatter` is the same parser the
 * catalog entries go through.
 */
function skillMeta(): { name: string; description: string } {
  const split = splitFrontmatter(skillMarkdown)
  if (!split) {
    // The skill is a build-time import, so a missing frontmatter block is a
    // broken checkout rather than a runtime condition to degrade through.
    // Publishing an index with an empty name would advertise a skill nobody
    // can identify.
    throw new Error(
      "[agent-skill-index] use-design-md SKILL.md has no frontmatter block"
    )
  }
  const { frontmatter } = split
  // A line scan rather than a RegExp: the keys are top-level frontmatter
  // fields, and building a pattern out of a template literal put an escape
  // layer between the source and the matcher that silently degraded to the
  // wrong pattern (`\s` reads as a literal `s` inside a template literal, so
  // `key:\s*` became `key:s*` and matched by luck).
  const read = (key: string): string => {
    const prefix = `${key}:`
    const line = frontmatter
      .split("\n")
      .find((candidate) => candidate.startsWith(prefix))
    return line ? line.slice(prefix.length).trim() : ""
  }
  return { name: read("name"), description: read("description") }
}

/**
 * SHA-256 of the bytes this site actually serves, computed per request.
 *
 * Precomputing it at build time would let the digest and the file disagree
 * whenever line endings differ between the machine that built the index and
 * the machine that serves the file - a real hazard here, since Windows
 * checkouts have produced CRLF under `.claude/` before. Hashing the served
 * string makes the two agree by construction.
 *
 * Web Crypto rather than `node:crypto` so the route works on any runtime Nitro
 * targets.
 */
async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  )
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * The agentskills.io discovery document. Shape is not invented here: it follows
 * the published 0.2.0 discovery schema, which is what an agent host looks for
 * at `/.well-known/agent-skills/index.json`.
 */
export async function buildAgentSkillsIndex(origin: string): Promise<string> {
  const { name, description } = skillMeta()
  return `${JSON.stringify(
    {
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: [
        {
          name,
          type: "skill-md",
          description,
          url: `${origin}${AGENT_SKILL_MD_PATH}`,
          digest: `sha256:${await sha256Hex(skillMarkdown)}`,
        },
      ],
    },
    null,
    2
  )}\n`
}
