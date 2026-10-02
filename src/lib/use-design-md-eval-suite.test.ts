import { readdirSync } from "node:fs"
import { join, relative, resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { parse } from "yaml"
import {
  USE_DESIGN_MD_EVALS,
  USE_DESIGN_MD_SKILL_DIR,
  readRepoFile,
} from "./skill-asset-paths"

// The eval suite is run by hand (`claude plugin eval`, see the README next to
// it) because every case is a paid model call. What CI can still hold without a
// model is the suite's wiring: a case that points at a moved skill, a trigger
// case whose tag says one direction while its grader scores the other, or a
// fetch case that would score an empty answer as a pass — all of these load and
// score without complaint, and the numbers would just be wrong.

const ROOT = process.cwd()
const SHOULD = "should-trigger"
const SHOULD_NOT = "should-not-trigger"
// Two kinds of case share the suite. Trigger cases score whether the skill
// fires; fetch cases score what the answer says after the skill fetched an
// entry (they need a shell, so they cannot run on Windows native).
const TRIGGER = "trigger"
const FETCH = "fetch"

interface Grader {
  type?: string
  match?: string
  pattern?: string
  tool?: string
  input_match?: string
  min?: number
  max?: number
}

interface CaseFile {
  schema_version?: string
  name?: string
  tags?: Array<string>
  plugins?: Array<string>
  execution?: { prompt?: string; allowed_tools?: Array<string> }
  graders?: Array<Grader>
}

// `results/` is where `plugin eval` writes runs (gitignored). It holds no cases.
function suiteFiles(): Array<string> {
  return readdirSync(join(ROOT, USE_DESIGN_MD_EVALS), {
    recursive: true,
    withFileTypes: true,
  })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      relative(ROOT, join(entry.parentPath, entry.name)).replaceAll("\\", "/")
    )
    .filter((path) => !path.includes("/results/"))
}

function caseFiles(): Array<string> {
  return suiteFiles()
    .filter((path) => path.endsWith("/case.yaml"))
    .sort()
}

function readCase(path: string): CaseFile {
  return parse(readRepoFile(path)) as CaseFile
}

function casesOfKind(cases: Array<string>, kind: string): Array<string> {
  return cases.filter((path) => (readCase(path).tags ?? []).includes(kind))
}

// Whether a grader fails on a run that produced nothing — no turns, no tool
// calls, an empty answer. An allowlist: any shape not named here is treated as
// one that could pass on nothing.
function failsOnEmptyRun(grader: Grader): boolean {
  if (grader.type === "llm") return true
  if (grader.type === "tool_used") return (grader.min ?? 1) >= 1
  if (grader.type === "regex") {
    // `.*`, `^` and friends match the empty string too.
    if (new RegExp(grader.pattern ?? "").test("")) return false
    const match = grader.match ?? "contains"
    if (match === "contains") return true
    const count = /^count:([0-9]+)$/.exec(match)
    return count !== null && Number(count[1]) >= 1
  }
  return false
}

function skillGraders(data: CaseFile): Array<Grader> {
  return (data.graders ?? []).filter(
    (grader) =>
      grader.type === "tool_used" &&
      grader.tool === "Skill" &&
      (grader.input_match ?? "").includes("use-design-md")
  )
}

describe("use-design-md eval suite wiring", () => {
  const cases = caseFiles()
  const triggerCases = casesOfKind(cases, TRIGGER)
  const fetchCases = casesOfKind(cases, FETCH)

  it.each(cases)("%s is exactly one kind of case", (path) => {
    const tags = readCase(path).tags ?? []
    expect([TRIGGER, FETCH].filter((kind) => tags.includes(kind))).toHaveLength(
      1
    )
  })

  // Exact, not "at least one": the baseline score on #462 was measured on this
  // composition, and the README states it. Adding or removing a trigger case is fine,
  // but it changes what the baseline means — re-measure and update both.
  it("keeps the case composition the baseline score was measured on", () => {
    const tags = triggerCases.flatMap((path) => readCase(path).tags ?? [])
    expect(tags.filter((tag) => tag === SHOULD)).toHaveLength(9)
    expect(tags.filter((tag) => tag === SHOULD_NOT)).toHaveLength(10)
  })

  it("keeps every case a case.yaml — a bare prompt.md would escape these checks", () => {
    const promptOnly = suiteFiles().filter((path) =>
      path.endsWith("/prompt.md")
    )
    expect(promptOnly).toEqual([])
  })

  it.each(cases)("%s points its plugins path at the skill", (path) => {
    const data = readCase(path)
    const caseDir = path.slice(0, -"/case.yaml".length)
    // Both are required by the case.yaml schema. A case that fails to load is
    // only reported on stderr: when the suite was first ported, every one of
    // the original 20 queries failed to load (no `name`) and the run — started
    // with `--threshold 0` — still exited 0 with nothing scored.
    expect(data.schema_version, "plugin eval refuses to load it").toBeTruthy()
    expect(data.name, "plugin eval refuses to load it").toBe(
      caseDir.split("/").at(-1)
    )
    expect(data.execution?.prompt?.trim()).toBeTruthy()
    const targets = (data.plugins ?? []).map((plugin) =>
      relative(ROOT, resolve(ROOT, caseDir, plugin)).replaceAll("\\", "/")
    )
    expect(targets).toEqual([USE_DESIGN_MD_SKILL_DIR])
  })

  it.each(triggerCases)("%s scores the direction its tag claims", (path) => {
    const data = readCase(path)
    const tags = data.tags ?? []
    const direction = [SHOULD, SHOULD_NOT].filter((tag) => tags.includes(tag))
    expect(
      direction,
      `tag exactly one of ${SHOULD} / ${SHOULD_NOT}`
    ).toHaveLength(1)
    const graders = skillGraders(data)
    expect(graders).toHaveLength(1)
    const [grader] = graders
    // A regex that matches nothing makes every should-not case pass silently.
    // Check it against the call shape the child session actually produces: the
    // skill loads as an inline plugin, so its name arrives namespaced.
    const pattern = new RegExp(grader.input_match ?? "")
    expect(
      pattern.test(JSON.stringify({ skill: "use-design-md:use-design-md" }))
    ).toBe(true)
    expect(pattern.test(JSON.stringify({ skill: "use-design-md" }))).toBe(true)
    expect(pattern.test(JSON.stringify({ skill: "design-md" }))).toBe(false)
    if (direction[0] === SHOULD) {
      expect(
        grader.max,
        "a should-trigger grader must allow the call"
      ).not.toBe(0)
      expect(grader.min ?? 1).toBeGreaterThanOrEqual(1)
    } else {
      expect(grader.min).toBe(0)
      expect(grader.max).toBe(0)
    }
  })

  it("has fetch cases", () => {
    expect(fetchCases.length).toBeGreaterThan(0)
  })

  it.each(fetchCases)("%s grades the answer, not the skill call", (path) => {
    const data = readCase(path)
    expect(skillGraders(data), "fetch cases score content").toEqual([])
    expect(data.execution?.allowed_tools ?? []).toContain("Bash")
    // Every grader must fail on an empty run. On Windows native the shell
    // grant is refused before any turn, and the run is still scored — with
    // nothing in it. A case holding an `llm` grader plus a `not_contains`
    // regex scored 0.5 that way: the judge failed, the regex passed on nothing.
    expect(data.graders?.length ?? 0).toBeGreaterThan(0)
    expect(
      (data.graders ?? []).filter((grader) => !failsOnEmptyRun(grader)),
      "a grader that passes an empty run"
    ).toEqual([])
  })
})
