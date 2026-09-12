import { readFileSync } from "node:fs"
import { join } from "node:path"

// Every repo-relative path under `.claude/` that a test asserts against, in one
// place. Deliberately NOT a path builder — the visible literal list is itself the
// contract, the same way `design-md-skill-single-preview-file.test.ts` keeps its
// surface list visible. Assembling paths from segments would let a renamed
// directory slip through as a plausible-looking string; a literal here fails
// `skill-asset-paths.test.ts` on the next run instead.
//
// Before this module the same three-line `readRepoFile` helper was copied
// verbatim into four test files and one test reached for the assets through
// `new URL(…, import.meta.url)` instead, so a moved test file broke differently
// from a moved asset.

export const DESIGN_MD_SKILL = ".claude/skills/design-md/SKILL.md"
export const DESIGN_MD_TEMPLATE =
  ".claude/skills/design-md/references/design-md-template.md"
export const DESIGN_MD_RUBRIC_DESIGN =
  ".claude/skills/design-md/references/rubric-design.md"
export const DESIGN_MD_RUBRIC_PREVIEW =
  ".claude/skills/design-md/references/rubric-preview.md"
export const DESIGN_MD_STITCH_FORMAT =
  ".claude/skills/design-md/references/stitch-format.md"

export const DOCS_CRAWLER_SKILL = ".claude/skills/docs-crawler/SKILL.md"
export const PREVIEW_PROSE_AUDIT_SKILL =
  ".claude/skills/preview-prose-audit/SKILL.md"
export const USE_DESIGN_MD_SKILL = ".claude/skills/use-design-md/SKILL.md"

export const RESEARCH_COLLECTOR_AGENT = ".claude/agents/research-collector.md"
export const DESIGN_MD_AUTHOR_AGENT = ".claude/agents/design-md-author.md"
export const DESIGN_MD_REVIEWER_AGENT = ".claude/agents/design-md-reviewer.md"
export const PREVIEW_HTML_AUTHOR_AGENT = ".claude/agents/preview-html-author.md"
export const PREVIEW_HTML_REVIEWER_AGENT =
  ".claude/agents/preview-html-reviewer.md"

// The five agents the /design-md pipeline drives. Order matches the pipeline's
// own stage order, which is how the machine-gate test reads it.
export const DESIGN_MD_AGENT_PATHS = [
  RESEARCH_COLLECTOR_AGENT,
  DESIGN_MD_AUTHOR_AGENT,
  DESIGN_MD_REVIEWER_AGENT,
  PREVIEW_HTML_AUTHOR_AGENT,
  PREVIEW_HTML_REVIEWER_AGENT,
] as const

export const SKILLS_DIR = ".claude/skills"

// Which project skills leave this repo and which never do. `skill-distribution.
// test.ts` cross-checks these two lists against the directories on disk, each
// SKILL.md's `metadata.internal` flag, and the marketplace manifest — so adding
// a skill without declaring it here fails rather than shipping by accident.
export const PUBLIC_SKILLS = ["use-design-md"] as const
export const INTERNAL_SKILLS = [
  "design-md",
  "docs-crawler",
  "preview-prose-audit",
] as const

export const ALL_SKILL_ASSET_PATHS = [
  DESIGN_MD_SKILL,
  DESIGN_MD_TEMPLATE,
  DESIGN_MD_RUBRIC_DESIGN,
  DESIGN_MD_RUBRIC_PREVIEW,
  DESIGN_MD_STITCH_FORMAT,
  DOCS_CRAWLER_SKILL,
  PREVIEW_PROSE_AUDIT_SKILL,
  USE_DESIGN_MD_SKILL,
  ...DESIGN_MD_AGENT_PATHS,
] as const

export function readRepoFile(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8")
}
