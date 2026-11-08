import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
  GATE_STEPS,
  argsMismatch,
  ciPreBuildSteps,
  parseGatesArgs,
  runGates,
  stepListMismatch,
  withBase,
} from "./gates"
import type { GateStep } from "./gates"

const STEPS: ReadonlyArray<GateStep> = [
  { script: "typecheck", guards: "types" },
  { script: "lint", guards: "lint rules" },
  {
    script: "check:last-updated",
    args: ["--base", "origin/main"],
    guards: "dates",
  },
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

  it("says what the failing step guards, so the reader knows what broke", () => {
    const { out } = harness({ lint: 1 })
    expect(out.find((l) => /FAILED/.test(l))).toContain("lint rules")
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

const ciPreBuildScripts = (yaml: string): Array<string> =>
  ciPreBuildSteps(yaml).map((s) => s.script)

describe("ciPreBuildSteps", () => {
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

  it("throws on a pre-build step that runs something other than a pnpm script", () => {
    const node = WORKFLOW.replace(
      "run: pnpm typecheck",
      "run: node scripts/some-check.mjs"
    )
    expect(() => ciPreBuildScripts(node)).toThrow(/some-check\.mjs/)
  })

  it("throws on a pre-build action that is not one of the known setup actions", () => {
    const action = WORKFLOW.replace(
      "      - name: Type check\n",
      "      - uses: some/lint-action@v1\n      - name: Type check\n"
    )
    expect(() => ciPreBuildScripts(action)).toThrow(/some\/lint-action/)
  })

  it("throws on a pre-build step with neither `run` nor `uses`", () => {
    const bare = WORKFLOW.replace(
      "      - name: Type check\n",
      "      - name: Only env\n        env:\n          X: y\n      - name: Type check\n"
    )
    expect(() => ciPreBuildScripts(bare)).toThrow(/neither `run` nor `uses`/)
  })

  it("stops reading at `pnpm build`, so steps after it are not its concern", () => {
    const after = WORKFLOW.replace(
      "        run: pnpm test:http\n",
      "        run: pnpm test:http\n      - uses: some/deploy-action@v1\n      - run: node scripts/report.mjs\n"
    )
    expect(ciPreBuildScripts(after)).toEqual([
      "typecheck",
      "check:last-updated",
    ])
  })

  it("lets the setup actions through", () => {
    const setup = WORKFLOW.replace(
      "      - uses: actions/checkout@v7\n",
      "      - uses: actions/checkout@v7\n      - uses: pnpm/action-setup@v6\n      - uses: actions/setup-node@v7\n"
    )
    expect(ciPreBuildScripts(setup)).toEqual([
      "typecheck",
      "check:last-updated",
    ])
  })

  it("throws on a pre-build step setting what its run line does not show", () => {
    for (const [key, value] of [
      ["if", "github.event_name == 'push'"],
      ["continue-on-error", "true"],
      ["working-directory", "sub"],
    ]) {
      const keyed = WORKFLOW.replace(
        "        run: pnpm typecheck\n",
        `        run: pnpm typecheck\n        ${key}: ${value}\n`
      )
      expect(() => ciPreBuildSteps(keyed), key).toThrow(new RegExp(key))
    }
  })

  it("throws on an env variable its run line does not pass as an argument", () => {
    const env = WORKFLOW.replace(
      "        run: pnpm typecheck\n",
      "        env:\n          STRICT: '1'\n        run: pnpm typecheck\n"
    )
    expect(() => ciPreBuildSteps(env)).toThrow(/STRICT/)
  })

  it("reads each step's arguments as written in CI", () => {
    expect(ciPreBuildSteps(WORKFLOW)).toEqual([
      { script: "typecheck", args: [] },
      { script: "check:last-updated", args: ["--base", '"$BASE_REF"'] },
    ])
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

  it("names a step either side runs once more than the other", () => {
    expect(stepListMismatch(["a", "b"], ["a", "b", "b"])).toMatch(
      /position 3.*`b`/
    )
    expect(stepListMismatch(["a", "b", "b"], ["a", "b"])).toMatch(
      /position 3.*`b`/
    )
  })
})

describe("ciPreBuildSteps outside the steps", () => {
  it("throws on workflow or build-job settings that change how every step runs", () => {
    const cases: Array<[string, string]> = [
      ["env", "env:\n  STRICT: '1'\njobs:"],
      ["defaults", "defaults:\n  run:\n    working-directory: sub\njobs:"],
    ]
    for (const [key, replacement] of cases) {
      const top = WORKFLOW.replace("jobs:", replacement)
      expect(() => ciPreBuildSteps(top), key).toThrow(new RegExp(key))
    }
    for (const key of [
      "env",
      "defaults",
      "if",
      "continue-on-error",
      "container",
      "strategy",
    ]) {
      const value =
        key === "if" || key === "continue-on-error" ? "true" : "\n      X: y"
      const job = WORKFLOW.replace(
        "  build:\n",
        `  build:\n    ${key}: ${value}\n`
      )
      expect(() => ciPreBuildSteps(job), key).toThrow(new RegExp(key))
    }
  })

  it("lets workflow and job keys through that do not change what a check does", () => {
    const harmless = WORKFLOW.replace(
      "jobs:\n  build:\n",
      "name: CI\nrun-name: ci\npermissions:\n  contents: read\njobs:\n  build:\n    name: build\n    timeout-minutes: 30\n    permissions:\n      contents: read\n"
    )
    expect(ciPreBuildScripts(harmless)).toEqual([
      "typecheck",
      "check:last-updated",
    ])
  })

  it("lets step keys through that do not change what the check does", () => {
    const harmless = WORKFLOW.replace(
      "        run: pnpm typecheck\n",
      "        run: pnpm typecheck\n        id: types\n        timeout-minutes: 10\n"
    )
    expect(ciPreBuildScripts(harmless)).toEqual([
      "typecheck",
      "check:last-updated",
    ])
  })
})

describe("parseGatesArgs", () => {
  it("runs GATE_STEPS as they are with no arguments", () => {
    expect(parseGatesArgs([])).toBe(GATE_STEPS)
  })

  it("points the date check at a ref given with --base, CI's HEAD~1 fallback among them", () => {
    for (const ref of ["origin/claude/x", "HEAD~1"]) {
      const got = parseGatesArgs(["--base", ref])
      expect(got).not.toBeNull()
      expect(got?.find((s) => s.script === "check:last-updated")?.args).toEqual(
        ["--base", ref]
      )
    }
  })

  it("refuses anything else, a ref the shell or the date check could misread among them", () => {
    for (const argv of [
      ["--base"],
      ["--base", "x;echo"],
      ["--base", "a b"],
      ["--base", "--help"],
      ["--base", "~/x"],
      ["--base", "HEAD^"],
      ["--nope"],
      ["--base", "origin/main", "--extra"],
    ]) {
      expect(parseGatesArgs(argv), argv.join(" ")).toBeNull()
    }
  })
})

describe("withBase", () => {
  it("points every `--base` at the given ref and leaves other steps alone", () => {
    const got = withBase(STEPS, "origin/feature")
    expect(got.map((s) => s.args ?? [])).toEqual([
      [],
      [],
      ["--base", "origin/feature"],
    ])
    expect(got[2].ciArgs).toEqual(STEPS[2].ciArgs)
  })
})

describe("argsMismatch", () => {
  const gate = (script: string, extra: Partial<GateStep> = {}): GateStep => ({
    script,
    guards: "x",
    ...extra,
  })

  it("is null when every CI step runs with the arguments gates gives it", () => {
    expect(
      argsMismatch(
        [{ script: "a", args: ["--x"] }],
        [gate("a", { args: ["--x"] })]
      )
    ).toBeNull()
  })

  it("names a step whose CI arguments gates does not pass", () => {
    expect(
      argsMismatch([{ script: "a", args: ["--strict"] }], [gate("a")])
    ).toMatch(/`a`.*--strict/)
  })

  it("compares against `ciArgs` where CI spells an argument its own way", () => {
    const step = gate("a", {
      args: ["--base", "origin/main"],
      ciArgs: ["--base", '"$BASE_REF"'],
    })
    expect(
      argsMismatch([{ script: "a", args: ["--base", '"$BASE_REF"'] }], [step])
    ).toBeNull()
    expect(
      argsMismatch([{ script: "a", args: ["--base", '"$OTHER"'] }], [step])
    ).toMatch(/`a`/)
  })
})

describe("pnpm gates ↔ CI build job (contract)", () => {
  const root = process.cwd()
  const ciSteps = ciPreBuildSteps(
    readFileSync(join(root, ".github/workflows/ci.yml"), "utf8")
  )
  const ci = ciSteps.map((s) => s.script)
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

  it("passes each step the arguments CI passes it", () => {
    const mismatch = argsMismatch(ciSteps, GATE_STEPS)
    expect(
      mismatch,
      `${mismatch} — keep GATE_STEPS' args (or ciArgs) in step with .github/workflows/ci.yml`
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
