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

  it("finds issue templates to check", () => {
    // Guards against the corpus silently going empty (e.g. the directory
    // moving) and this whole describe block passing on zero assertions.
    expect(templateFiles.length).toBeGreaterThan(0)
  })

  for (const file of templateFiles) {
    const raw = readFileSync(join(TEMPLATE_DIR, file), "utf8")
    // A bare presence check, independent of format — config.yml (the
    // template chooser) genuinely has no `labels:` line and is the only file
    // meant to skip the assertion below.
    if (!/^labels:/m.test(raw)) continue

    // Issue forms declare labels as a top-level `labels: [...]` line — a
    // JSON-ish array of double-quoted strings. A full YAML parse buys
    // nothing for a field this constrained, and the repo has no other
    // reason to depend on a YAML parser. But a checker that silently skips
    // whatever it can't parse reproduces the exact failure mode it exists to
    // catch — a label going unverified with no signal — so an unrecognized
    // `labels:` shape (multi-line array, single quotes, …) is a hard failure
    // here rather than a skip.
    it(`${file}'s declared labels all exist on the repo`, () => {
      const match = raw.match(/^labels:\s*(\[.*\])\s*$/m)
      expect(
        match,
        `${file} has a labels: field this checker doesn't understand ` +
          `(expected a single-line, double-quoted JSON array) — rewrite it ` +
          `in that form, or extend the regex in this test to parse it`
      ).not.toBeNull()

      let declared: Array<string>
      try {
        declared = JSON.parse(match![1]) as Array<string>
      } catch (err) {
        // A regex match doesn't guarantee valid JSON inside the brackets
        // (trailing comma, single-quoted strings, …). Without this, that
        // case fails with a raw JSON.parse stack trace instead of the
        // explanatory message the rest of this test is built around.
        throw new Error(
          `${file}'s labels: array matched the expected shape but isn't ` +
            `valid JSON: ${(err as Error).message}`
        )
      }

      const missing = declared.filter((label) => !knownLabels.has(label))
      expect(
        missing,
        `${file} names a label GitHub doesn't have — issues filed from it ` +
          `will silently get created without it`
      ).toEqual([])
    })
  }
})
