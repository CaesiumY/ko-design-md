import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(ROOT, path), "utf8")
}

// Every surface that tells a READER — agent or human — what a preview IS.
// Issue #235 turned `light.html` + `dark.html` into one `preview.html`, and
// these are the files that had to learn it.
//
// The list started as the four prompt files and was wrong: a review round found
// stale two-file text in README, CONTRIBUTING, the PR template, TAKEDOWN, and
// SKILL.md's own frontmatter `description` — none of which anyone had swept,
// because each earlier sweep scoped itself to whatever the author had in mind
// (preview bodies, then catalog md, then prompts). Contributor docs and skill
// metadata are read BEFORE any of those. Add a surface here when it describes
// what the pipeline produces, not only when an agent reads it.
const SURFACES = [
  ".claude/agents/preview-html-author.md",
  ".claude/agents/preview-html-reviewer.md",
  ".claude/skills/design-md/SKILL.md",
  ".claude/skills/design-md/references/rubric-preview.md",
  "README.md",
  "CONTRIBUTING.md",
  ".github/PULL_REQUEST_TEMPLATE.md",
  "docs/TAKEDOWN.md",
  // Shipped, not documentation: its header told readers it was loaded by
  // `{light,dark}.html`, and it is the file every preview links to.
  "public/preview/_runtime/tokens.css",
] as const

// Phrases that assert a preview is two files. Deliberately specific: SKILL.md
// says "both (두 파일 생성)" about ko/en design.md output and "Both files are
// outside this skill's write scope" about two source files, and neither is
// about preview HTML.
const SPLIT_MODEL_PHRASES = [
  "light.html",
  "dark.html",
  // Brace expansion is how the docs named the pair, and it survived a
  // `light.html`/`dark.html` grep because neither literal appears in it.
  "{light,dark}",
  "both HTML files",
  "two HTML files",
  "both preview files",
  // Korean surfaces counted the same thing in words: "preview HTML 두 본".
  "두 본",
] as const

describe("/design-md preview is one file", () => {
  // The migration updated five of the six surfaces. `preview-html-reviewer.md`
  // kept `Read both HTML files` and `both HTML files must contain that exact
  // site-relative path`, and NO test caught it — the existing contract tests
  // pin the author prompt and SKILL.md, not this one. It survived several
  // review rounds because the stale text names no filename, so a grep for
  // `light.html` walks straight past it. That is the hole this closes.
  //
  // A phrase list is not a proof. These are prose prompts, so there is no
  // parse to assert against, and a future author who invents new wording for
  // "open the other file" will not be caught. It does catch this family
  // recurring, and it puts the invariant somewhere a reader can find it.
  it("never tells a reader there is a second preview file", () => {
    for (const path of SURFACES) {
      const text = readRepoFile(path)
      for (const phrase of SPLIT_MODEL_PHRASES) {
        expect(
          text.toLowerCase().includes(phrase.toLowerCase()),
          `${path} still carries the split-preview phrase "${phrase}" — a preview is one preview.html holding both themes (issue #235).`
        ).toBe(false)
      }
    }
  })

  // Without this the check above passes for a surface that has been emptied,
  // renamed, or reduced to something that no longer describes a preview at all.
  it("names the file each surface is actually about", () => {
    for (const path of SURFACES) {
      expect(readRepoFile(path), path).toContain("preview.html")
    }
  })
})
