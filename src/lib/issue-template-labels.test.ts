import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = process.cwd()
const TEMPLATE_DIR = join(ROOT, ".github/ISSUE_TEMPLATE")

function readRepoFile(path: string): string {
  return readFileSync(join(ROOT, path), "utf8")
}

// GitHub issue forms silently drop any `labels:` entry that doesn't match an
// existing repo label — no lint error at template-authoring time, no partial
// apply, the issue is just created with one less label than the template
// author intended. That is how #268 went unnoticed: new-catalog-entry.yml
// named catalog/new-entry, the label had never been created, and the issue
// opened with zero labels. .github/labels.json is a checked-in snapshot of
// `gh label list`; this test is its only reader, so it must be refreshed
// whenever a label is created, renamed, or deleted on GitHub (see
// CONTRIBUTING.md §6) or this test starts passing against a stale roster
// instead of the real one.
describe("issue template labels", () => {
  const knownLabels = new Set<string>(
    (
      JSON.parse(readRepoFile(".github/labels.json")) as Array<{
        name: string
      }>
    ).map((l) => l.name)
  )

  const templateFiles = readdirSync(TEMPLATE_DIR).filter((f) =>
    f.endsWith(".yml")
  )

  it("has at least one template with a labels: field to check", () => {
    // Guards against the corpus silently going empty (e.g. every template
    // renamed away from .yml) and this whole describe block passing on zero
    // assertions.
    const withLabels = templateFiles.filter((file) =>
      /^labels:\s*\[.*\]\s*$/m.test(
        readFileSync(join(TEMPLATE_DIR, file), "utf8")
      )
    )
    expect(withLabels.length).toBeGreaterThan(0)
  })

  for (const file of templateFiles) {
    // Issue forms declare labels as a top-level `labels: [...]` line — a
    // JSON-ish array of quoted strings. A full YAML parse buys nothing for a
    // field this constrained, and the repo has no other reason to depend on
    // a YAML parser. config.yml (the template chooser) has no `labels:` line
    // and is skipped by the match failing, not by special-casing the name.
    const raw = readFileSync(join(TEMPLATE_DIR, file), "utf8")
    const match = raw.match(/^labels:\s*(\[.*\])\s*$/m)
    if (!match) continue

    it(`${file}'s declared labels all exist on the repo`, () => {
      const declared = JSON.parse(match[1]) as Array<string>
      const missing = declared.filter((label) => !knownLabels.has(label))
      expect(
        missing,
        `${file} names a label GitHub doesn't have — issues filed from it ` +
          `will silently get created without it`
      ).toEqual([])
    })
  }
})
