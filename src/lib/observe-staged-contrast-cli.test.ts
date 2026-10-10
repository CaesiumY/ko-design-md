import { spawnSync } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, it } from "vitest"
import { STAGED_CONTRAST_RULE } from "./staged-contrast-report"
import type { MachineReport } from "./staged-contrast-report"

// scripts/observe-staged-contrast.ts is the onboarding loop's Stage 9a3. What
// it measures needs a browser, which `pnpm test` does not have — but the two
// things the loop most depends on do not:
//
// - a bad invocation stops with exit 2 before any browser is looked for, and
// - a missing browser is NOT a failure. The loop must go on to the reviewer
//   with a report that says the render was not observed.
//
// The second is tested for real rather than with a stub: pointing
// PLAYWRIGHT_BROWSERS_PATH at an empty directory makes `chromium.launch()`
// reject exactly as it does on a machine that never installed one, so the
// path under test is the one a contributor without Chromium actually takes.

const ROOT = process.cwd()
const CLI_TIMEOUT = 60_000
const STAGED = "scripts/fixtures/samsung-one-ui-2ead71d-parent.html"
const scratch = mkdtempSync(join(tmpdir(), "observe-staged-"))
const noBrowsers = mkdtempSync(join(tmpdir(), "observe-staged-no-browser-"))

afterAll(() => {
  rmSync(scratch, { recursive: true, force: true })
  rmSync(noBrowsers, { recursive: true, force: true })
})

function run(
  args: Array<string>,
  env: Record<string, string> = {}
): { status: number | null; out: string } {
  const r = spawnSync(
    process.execPath,
    ["--import", "tsx", "scripts/observe-staged-contrast.ts", ...args],
    {
      cwd: ROOT,
      encoding: "utf8",
      timeout: CLI_TIMEOUT,
      env: { ...process.env, ...env },
    }
  )
  return { status: r.status, out: `${r.stdout}${r.stderr}` }
}

const readJson = (path: string): MachineReport =>
  JSON.parse(readFileSync(path, "utf8")) as MachineReport

describe("observe-staged-contrast CLI — arguments", () => {
  it("refuses an unknown argument", { timeout: CLI_TIMEOUT }, () => {
    const r = run(["--stage", STAGED])
    expect(r.status).toBe(2)
    expect(r.out).toContain("Unknown argument")
  })

  it(
    "refuses a flag whose value is the next flag",
    { timeout: CLI_TIMEOUT },
    () => {
      const r = run(["--staged", "--json-out", join(scratch, "a.json")])
      expect(r.status).toBe(2)
      expect(r.out).toContain("requires a value")
    }
  )

  it(
    "needs both the staged preview and the report path",
    { timeout: CLI_TIMEOUT },
    () => {
      expect(run(["--staged", STAGED]).status).toBe(2)
      expect(run(["--json-out", join(scratch, "b.json")]).status).toBe(2)
    }
  )

  it(
    "refuses a staged preview that does not exist",
    { timeout: CLI_TIMEOUT },
    () => {
      const r = run([
        "--staged",
        join(scratch, "missing.html"),
        "--json-out",
        join(scratch, "c.json"),
      ])
      expect(r.status).toBe(2)
      expect(r.out).toContain("missing.html")
    }
  )

  it(
    "refuses an iteration that is not a positive integer",
    { timeout: CLI_TIMEOUT },
    () => {
      const r = run([
        "--staged",
        STAGED,
        "--json-out",
        join(scratch, "d.json"),
        "--iteration",
        "two",
      ])
      expect(r.status).toBe(2)
      expect(r.out).toContain("--iteration")
    }
  )

  it(
    "refuses a staged path that is a directory",
    { timeout: CLI_TIMEOUT },
    () => {
      // A cache directory passed instead of its preview.html used to reach
      // `readFileSync` and die with EISDIR — exit 1 and a stack trace, which
      // the skill gives no meaning to.
      const r = run([
        "--staged",
        scratch,
        "--json-out",
        join(scratch, "e.json"),
      ])
      expect(r.status).toBe(2)
      expect(r.out).toContain("not a file")
    }
  )

  it(
    "will not overwrite a reviewer report named by mistake",
    { timeout: CLI_TIMEOUT },
    () => {
      // preview-review-{M}.json has `issues` and `verdict` too. Only the
      // machine envelope may be joined; anything else is a wrong path.
      const path = join(scratch, "preview-review-1.json")
      const review = JSON.stringify({
        score: 8,
        passed: true,
        iteration: 1,
        rubric: [],
        issues: [],
        verdict: "ok",
      })
      writeFileSync(path, review)
      const r = run(["--staged", STAGED, "--json-out", path])
      expect(r.status).toBe(2)
      expect(r.out).toContain("not a machine report")
      expect(readFileSync(path, "utf8")).toBe(review)
    }
  )

  it(
    "will not overwrite a report it cannot read",
    { timeout: CLI_TIMEOUT },
    () => {
      // A half-written or hand-edited file is somebody's 9a2 result. Replacing
      // it with a fresh envelope would throw the gate's findings away quietly.
      const path = join(scratch, "garbled.json")
      writeFileSync(path, "{ not json")
      const r = run(["--staged", STAGED, "--json-out", path])
      expect(r.status).toBe(2)
      expect(readFileSync(path, "utf8")).toBe("{ not json")
    }
  )
})

describe("observe-staged-contrast CLI — without a browser", () => {
  const env = { PLAYWRIGHT_BROWSERS_PATH: noBrowsers }

  it(
    "finishes with exit 0 and a skipped report of its own",
    { timeout: CLI_TIMEOUT },
    () => {
      const out = join(scratch, "standalone.json")
      const r = run(["--staged", STAGED, "--json-out", out], env)
      expect(r.status, r.out).toBe(0)
      const report = readJson(out)
      const render = report.render
      expect(render && Object.keys(render)).toEqual(["skipped"])
      const reason = render && "skipped" in render ? render.skipped.reason : ""
      expect(reason).toMatch(/\S/)
      expect(report.issues).toEqual([])
      expect(report.verdict).toContain("skipped")
    }
  )

  it(
    "joins the 9a2 report without disturbing it",
    { timeout: CLI_TIMEOUT },
    () => {
      const out = join(scratch, "preview-review-machine-1.json")
      const gate: MachineReport = {
        machine: true,
        tool: "validate-preview",
        schema: 1,
        iteration: 1,
        passed: true,
        metrics: {
          light: { matched: 1, total: 2 },
          dark: { matched: 1, total: 2 },
        },
        issues: [
          { severity: "warn", rule: "iframe-js-defer", section: "x", fix: "y" },
        ],
        verdict: "0 block / 1 warn — deterministic preview checks passed",
      }
      writeFileSync(out, JSON.stringify(gate, null, 2))
      const r = run(
        ["--staged", STAGED, "--json-out", out, "--iteration", "1"],
        env
      )
      expect(r.status, r.out).toBe(0)
      const report = readJson(out)
      const own = [
        "machine",
        "tool",
        "schema",
        "passed",
        "metrics",
        "issues",
      ] as const
      for (const key of own) {
        expect(report[key], key).toEqual(gate[key])
      }
      expect(report.render).toHaveProperty("skipped")
      expect(report.issues.some((i) => i.rule === STAGED_CONTRAST_RULE)).toBe(
        false
      )
      expect(report.verdict).toMatch(/^0 block \/ 1 warn — /)
    }
  )
})
