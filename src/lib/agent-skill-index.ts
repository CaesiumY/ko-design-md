import skillMarkdown from "/.claude/skills/use-design-md/SKILL.md?raw"
import { splitFrontmatter } from "./content-parser"
import { AGENT_SKILL_MD_PATH } from "./site-config"

/**
 * The `use-design-md` skill, served so an agent holding only the domain can
 * find it.
 *
 * The bytes are imported from the same file skills.sh clones and the plugin
 * marketplace points at (`.claude-plugin/marketplace.json`), so the three
 * distribution channels cannot drift from each other - there is no copy of the
 * skill under `public/` to forget to update.
 */
export const SKILL_MARKDOWN = skillMarkdown

interface SkillMeta {
  name: string
  description: string
}

// The skill is a build-time constant, so both the parse and the digest below
// are computed once and reused. Lazily rather than at module scope: `skillMeta`
// throws on malformed frontmatter, and at module scope that throw would happen
// while the server bundle initialises instead of on the one endpoint that needs
// it. A failed attempt leaves the slot empty, so it is retried rather than
// cached as a poisoned value.
let cachedMeta: SkillMeta | undefined
let cachedDigest: string | undefined

function skillMeta(): SkillMeta {
  cachedMeta ??= parseSkillMeta()
  return cachedMeta
}

/**
 * Skill name and description, read out of the skill's own frontmatter.
 *
 * Restating the description here would put the catalog's most load-bearing
 * "when to use me" sentence in two places, and the copy that agents actually
 * install is the one in the file. `splitFrontmatter` is the same parser the
 * catalog entries go through.
 */
function parseSkillMeta(): SkillMeta {
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
    const value = line === undefined ? "" : line.slice(prefix.length).trim()
    // Throw rather than publish a blank. This reader handles the single-line
    // scalars the skill uses today; rewritten as a YAML block scalar,
    // `description: >` yields the fold indicator instead of the text, and that
    // one character would go out as the skill's entire published description -
    // wrong in a way nobody reading the index could detect.
    //
    // What the throw actually costs, measured 2026-09-12 by breaking the file
    // and deploying it: `pnpm build` still passes (this runs per request, not
    // at build), `/.well-known/agent-skills/index.json` answers 500 on every
    // request, the server process stays up, and every other route - including
    // the SKILL.md file route next door, which does not parse frontmatter -
    // keeps answering 200. So the blast radius is one endpoint, loudly, and
    // `pnpm test` is what stops it reaching production. Catching this to serve
    // a degraded index would trade a loud failure on one URL for a quiet wrong
    // answer on the one field agents read to decide whether to install.
    if (value === "" || value === ">" || value === "|") {
      throw new Error(
        `[agent-skill-index] use-design-md SKILL.md: "${key}" is empty or uses a YAML ` +
          `block scalar, which this reader does not parse. Keep it on one line.`
      )
    }
    return value
  }
  return { name: read("name"), description: read("description") }
}

/**
 * SHA-256 of the bytes this site actually serves.
 *
 * Precomputing it at BUILD time would let the digest and the file disagree
 * whenever line endings differ between the machine that built the index and
 * the machine that serves the file - a real hazard here, since Windows
 * checkouts have produced CRLF under `.claude/` before. Hashing the served
 * string keeps the two in agreement by construction, and caching that result
 * on the serving process does not weaken it: the input is the same frozen
 * import every time.
 *
 * Web Crypto rather than `node:crypto` so the route works on any runtime Nitro
 * targets.
 */
async function skillDigest(): Promise<string> {
  // Two concurrent first requests may both compute it. That is idempotent and
  // costs one extra hash of 6 KB, which is cheaper than caching a promise that
  // would also cache a rejection.
  cachedDigest ??= await sha256Hex(SKILL_MARKDOWN)
  return cachedDigest
}

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
 * The skill discovery index served at `/.well-known/agent-skills/index.json`.
 *
 * Its shape copies one published implementation - the index is-agentic.com
 * serves at the same path - not a specification. An earlier version of this
 * comment said it followed "the published 0.2.0 discovery schema"; that was
 * never checked, and on 2026-09-13 it did not hold up:
 *
 * - The declared `$schema` host, schemas.agentskills.io, returns NXDOMAIN from
 *   two DNS-over-HTTPS resolvers, with agentskills.io's own SOA as authority.
 * - agentskills.io's specification, clients and client-implementation pages
 *   define the SKILL.md format but no HTTP discovery index, no digest field and
 *   no JSON schema.
 *
 * The `$schema` value is kept verbatim so the document stays identical in shape
 * to the implementation it was written against. Treat the field names as a
 * convention to re-check when a real specification appears, not a standard
 * this code can be held to.
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
          digest: `sha256:${await skillDigest()}`,
        },
      ],
    },
    null,
    2
  )}\n`
}
