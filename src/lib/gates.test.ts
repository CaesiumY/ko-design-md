import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
  GATE_STEPS,
  ciPreBuildScripts,
  runGates,
  stepListMismatch,
} from "./gates"
import type { GateStep } from "./gates"

const STEPS: ReadonlyArray<GateStep> = [
  { script: "typecheck" },
  { script: "lint" },
  { script: "check:last-updated", args: ["--base", "origin/main"] },
]

function harness(codes: Record<string, number>) {
  const ran: Array<string> = []
  const out: Array<string> = []
  const code = runGates(
    STEPS,
    (step) => {
      ran.push(step.script)
      return codes[step.script] ?? 0
    },
    (line) => out.push(line)
  )
  return { code, ran, out }
}

describe("runGates", () => {
  it("runs every step in order and prints one success line when all pass", () => {
    const { code, ran, out } = harness({})
    expect(code).toBe(0)
    expect(ran).toEqual(["typecheck", "lint", "check:last-updated"])
    expect(out.filter((l) => /passed/.test(l))).toHaveLength(1)
    expect(out.some((l) => /FAILED/.test(l))).toBe(false)
  })

  it("stops at the first failing step, names it, and returns its nonzero code", () => {
    const { code, ran, out } = harness({ lint: 2 })
    expect(code).toBe(2)
    expect(ran).toEqual(["typecheck", "lint"])
    const failed = out.filter((l) => /FAILED/.test(l))
    expect(failed).toHaveLength(1)
    expect(failed[0]).toContain("lint")
    expect(out.some((l) => /passed/.test(l))).toBe(false)
  })

  it("treats a step with no exit code (killed by a signal) as a failure", () => {
    const ran: Array<string> = []
    const out: Array<string> = []
    const code = runGates(
      STEPS,
      (step) => {
        ran.push(step.script)
        return step.script === "typecheck" ? null : 0
      },
      (line) => out.push(line)
    )
    expect(code).not.toBe(0)
    expect(ran).toEqual(["typecheck"])
    expect(out.find((l) => /FAILED/.test(l))).toContain("typecheck")
  })

  it("names the step with its arguments, so the log shows which base ref was used", () => {
    const { out } = harness({ "check:last-updated": 1 })
    expect(out.find((l) => /FAILED/.test(l))).toContain(
      "check:last-updated --base origin/main"
    )
  })
})

const WORKFLOW = `
jobs:
  build:
    steps:
      - uses: actions/checkout@v7
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Type check
        run: pnpm typecheck
      - name: Check last_updated freshness
        env:
          BASE_REF: origin/main
        run: pnpm check:last-updated --base "$BASE_REF"
      - name: Build
        run: pnpm build
      - name: HTTP smoke
        run: pnpm test:http
  e2e:
    steps:
      - run: pnpm lint
`

describe("ciPreBuildScripts", () => {
  it("lists the build job's pnpm scripts before `pnpm build`, skipping install", () => {
    expect(ciPreBuildScripts(WORKFLOW)).toEqual([
      "typecheck",
      "check:last-updated",
    ])
  })

  it("throws when the build job has no `pnpm build` step to stop at", () => {
    const noBuild = WORKFLOW.replace("run: pnpm build", "run: pnpm vite")
    expect(() => ciPreBuildScripts(noBuild)).toThrow(/pnpm build/)
  })

  it("throws on a pnpm line it cannot read as one script, instead of skipping it", () => {
    const chained = WORKFLOW.replace(
      "run: pnpm typecheck",
      "run: pnpm typecheck && pnpm lint"
    )
    expect(() => ciPreBuildScripts(chained)).toThrow(/typecheck && pnpm lint/)
  })
})

describe("stepListMismatch", () => {
  it("is null when both lists match in order", () => {
    expect(stepListMismatch(["a", "b"], ["a", "b"])).toBeNull()
  })

  it("names a step CI runs that gates lacks", () => {
    expect(stepListMismatch(["a", "x", "b"], ["a", "b"])).toMatch(
      /`x`.*only in CI/
    )
  })

  it("names a step gates runs that CI lacks", () => {
    expect(stepListMismatch(["a", "b"], ["a", "y", "b"])).toMatch(
      /`y`.*only in gates/
    )
  })

  it("names the first position where the order differs", () => {
    expect(stepListMismatch(["a", "b", "c"], ["a", "c", "b"])).toMatch(
      /position 2.*`b`.*`c`/
    )
  })
})

describe("pnpm gates ↔ CI build job (contract)", () => {
  const root = process.cwd()
  const ci = ciPreBuildScripts(
    readFileSync(join(root, ".github/workflows/ci.yml"), "utf8")
  )
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts: Record<string, string>
  }

  it("reads a non-empty pre-build list from CI", () => {
    // Guards the comparison below against passing on two empty lists.
    expect(ci.length).toBeGreaterThan(0)
  })

  it("runs the same steps as CI's build job, in the same order", () => {
    const mismatch = stepListMismatch(
      ci,
      GATE_STEPS.map((s) => s.script)
    )
    expect(
      mismatch,
      `${mismatch} — keep GATE_STEPS in src/lib/gates.ts in step with the build job in .github/workflows/ci.yml`
    ).toBeNull()
  })

  it("names only scripts that package.json defines", () => {
    const missing = GATE_STEPS.filter((s) => !(s.script in pkg.scripts))
    expect(missing.map((s) => s.script)).toEqual([])
  })

  it("is wired to `pnpm gates`", () => {
    expect(pkg.scripts.gates).toBe("tsx scripts/gates.ts")
  })
})
