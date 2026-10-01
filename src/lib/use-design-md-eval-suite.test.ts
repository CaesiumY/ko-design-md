import { existsSync, readdirSync } from "node:fs"
import { join, relative, resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { parse } from "yaml"
import {
  PUBLIC_SKILLS,
  SKILLS_DIR,
  USE_DESIGN_MD_EVALS,
  USE_DESIGN_MD_SKILL_DIR,
  readRepoFile,
} from "./skill-asset-paths"

// The trigger suite is run by hand (`claude plugin eval`, see the README next to
// it) because every case is a paid model call. What CI can still hold without a
// model is the suite's wiring: a case that points at a moved skill, or a case
// whose tag says one direction while its grader scores the other, would load
// and score without complaint — the split "should fire / should not fire" score
// would just be wrong.

const ROOT = process.cwd()
const SHOULD = "should-trigger"
const SHOULD_NOT = "should-not-trigger"

interface Grader {
  type?: string
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
  execution?: { prompt?: string }
  graders?: Array<Grader>
}

function filesUnder(dir: string): Array<string> {
  return readdirSync(join(ROOT, dir), {
    recursive: true,
    withFileTypes: true,
  })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      relative(ROOT, join(entry.parentPath, entry.name)).replaceAll("\\", "/")
    )
}

// `results/` is where `plugin eval` writes runs (gitignored). It holds no cases.
function caseFiles(): Array<string> {
  return filesUnder(USE_DESIGN_MD_EVALS)
    .filter((path) => !path.includes("/results/"))
    .filter((path) => path.endsWith("/case.yaml"))
    .sort()
}

function readCase(path: string): CaseFile {
  return parse(readRepoFile(path)) as CaseFile
}

function skillGraders(data: CaseFile): Array<Grader> {
  return (data.graders ?? []).filter(
    (grader) =>
      grader.type === "tool_used" &&
      grader.tool === "Skill" &&
      (grader.input_match ?? "").includes("use-design-md")
  )
}

describe("public skills ship no eval assets", () => {
  it.each(PUBLIC_SKILLS)(
    "%s has nothing eval-shaped in its directory",
    (slug) => {
      const evalShaped = filesUnder(`${SKILLS_DIR}/${slug}`).filter((path) =>
        /eval/i.test(path)
      )
      expect(
        evalShaped,
        "skills.sh copies the whole skill directory to consumers — keep eval assets under evals/"
      ).toEqual([])
    }
  )
})

describe("use-design-md trigger suite wiring", () => {
  const cases = caseFiles()

  it("has cases on both sides of the trigger boundary", () => {
    const tags = cases.flatMap((path) => readCase(path).tags ?? [])
    expect(tags.filter((tag) => tag === SHOULD).length).toBeGreaterThan(0)
    expect(tags.filter((tag) => tag === SHOULD_NOT).length).toBeGreaterThan(0)
  })

  it("keeps every case a case.yaml — a bare prompt.md would escape these checks", () => {
    const promptOnly = filesUnder(USE_DESIGN_MD_EVALS)
      .filter((path) => !path.includes("/results/"))
      .filter((path) => path.endsWith("/prompt.md"))
    expect(promptOnly).toEqual([])
  })

  it.each(cases)("%s points its plugins path at the skill", (path) => {
    const data = readCase(path)
    const caseDir = path.slice(0, -"/case.yaml".length)
    // Both are required by the case.yaml schema. A case that fails to load is
    // reported on stderr, but the run still exits 0 under `--threshold 0` —
    // all 20 cases once dropped out that way with nothing scored.
    expect(data.schema_version, "plugin eval refuses to load it").toBeTruthy()
    expect(data.name, "plugin eval refuses to load it").toBe(
      caseDir.split("/").at(-1)
    )
    expect(data.execution?.prompt?.trim()).toBeTruthy()
    const targets = (data.plugins ?? []).map((plugin) =>
      relative(ROOT, resolve(ROOT, caseDir, plugin)).replaceAll("\\", "/")
    )
    expect(targets).toEqual([USE_DESIGN_MD_SKILL_DIR])
    expect(existsSync(join(ROOT, USE_DESIGN_MD_SKILL_DIR, "SKILL.md"))).toBe(
      true
    )
  })

  it.each(cases)("%s scores the direction its tag claims", (path) => {
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
})
