import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// Contract tests pinning the /design-md machine-gate wiring. The skill prose
// IS the pipeline — any editor (human or model) who drops these load-bearing
// strings silently disconnects the deterministic validators, and nothing else
// would catch it until the next onboarding run. Pattern follows
// design-md-skill-logo-policy.test.ts.

const ROOT = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(ROOT, path), "utf8")
}

function readFrontmatter(path: string): string {
  const raw = readRepoFile(path)
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return match?.[1] ?? ""
}

const AGENT_PATHS = [
  ".claude/agents/research-collector.md",
  ".claude/agents/design-md-author.md",
  ".claude/agents/design-md-reviewer.md",
  ".claude/agents/preview-html-author.md",
  ".claude/agents/preview-html-reviewer.md",
]

describe("/design-md machine gates", () => {
  it("wires the draft gate (6a2) and preview gate (9a2) into the skill body", () => {
    const skill = readRepoFile(".claude/skills/design-md/SKILL.md")

    // Draft gate: command, report path, and the retry contract.
    expect(skill).toContain("pnpm validate:draft")
    expect(skill).toContain("review-machine-{N}.json")
    expect(skill).toContain(
      "machine_report_path: {cache_dir}/review-machine-{N}.json"
    )

    // Preview gate: command, report path, and the reviewer handoff.
    expect(skill).toContain("pnpm validate:previews")
    expect(skill).toContain("preview-review-machine-{M}.json")
    expect(skill).toContain(
      "machine_report_path: {cache_dir}/preview-review-machine-{M}.json"
    )

    // Machine retries must not consume the semantic-review budget.
    expect(skill).toContain("do not increment N")
    expect(skill).toContain("do not increment M")
  })

  it("keeps the CLI entrypoints the skill invokes available in package.json", () => {
    const pkg = JSON.parse(readRepoFile("package.json")) as {
      scripts: Record<string, string>
    }
    expect(pkg.scripts["validate:draft"]).toContain("validate-draft")
    expect(pkg.scripts["validate:catalog"]).toContain("--services")
    expect(pkg.scripts["validate:previews"]).toContain("validate-preview")
  })

  it("hands the machine report to both reviewers and retires mental grepping", () => {
    const designReviewer = readRepoFile(".claude/agents/design-md-reviewer.md")
    const previewReviewer = readRepoFile(
      ".claude/agents/preview-html-reviewer.md"
    )

    expect(designReviewer).toContain("machine_report_path")
    expect(previewReviewer).toContain("machine_report_path")
    // The deterministic validator owns hex/rgba detection now.
    expect(designReviewer).not.toContain("grep mentally")
    // PR #105 lesson: citation existence is not citation correctness.
    expect(designReviewer).toContain("Semantic spot-check")
  })

  it("pins model: inherit on every pipeline agent", () => {
    for (const path of AGENT_PATHS) {
      expect(readFrontmatter(path), `${path} frontmatter`).toMatch(
        /^model: inherit$/m
      )
    }
  })

  it("sweeps the 976px embed width in Stage 12", () => {
    const skill = readRepoFile(".claude/skills/design-md/SKILL.md")
    expect(skill).toContain("976 (detail-page embed width")
    expect(skill).toContain("375/768/976/1440")
  })
})
