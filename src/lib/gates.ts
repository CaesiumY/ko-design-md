// `pnpm gates` — the checks CI's build job runs before `pnpm build`, as one
// local command. CLI wrapper: scripts/gates.ts. The step list here is held to
// .github/workflows/ci.yml by gates.test.ts, so the two cannot drift apart
// quietly.
//
// Why it exists: before a merge the pre-build checks were re-run on the merged
// tree by hand-chaining them, and in #642 one such chain had a wrong log path,
// ran nothing, and still ended on `exit=0`. A single command that names the
// step it stopped at cannot fail that way.
//
// What the contract guards against is drift: an honest edit to the workflow
// that `pnpm gates` does not follow. It is not a sandbox against someone who
// can edit the workflow and wants a check to hide (a lifecycle script run by
// `pnpm install`, a shell expansion inside an env value); that edit is
// reviewed like any other, and no reader of YAML could stop it.

import { parse } from "yaml"

export interface GateStep {
  /** A package.json script name, run as `pnpm run <script>`. */
  script: string
  args?: ReadonlyArray<string>
  /**
   * The arguments as CI's build job writes them, where that differs from
   * `args` only in spelling (an environment variable CI sets). Absent, CI must
   * pass exactly `args`.
   */
  ciArgs?: ReadonlyArray<string>
  /** What the step keeps out, printed when it fails. */
  guards: string
}

/**
 * The pre-build steps of CI's build job, in CI's order. Build, the HTTP smoke,
 * and the contrast and E2E jobs are left out on purpose: they cost far more,
 * and the contrast numbers are only canonical when CI records them (ADR 0007).
 */
export const GATE_STEPS: ReadonlyArray<GateStep> = [
  { script: "typecheck", guards: "TypeScript 타입 오류" },
  { script: "lint", guards: "ESLint 규칙 위반" },
  {
    script: "format:check",
    guards:
      "Prettier 포맷 어긋남(Windows 에서만 실패하면 CLAUDE.md 의 CRLF 판별부터)",
  },
  {
    script: "test",
    guards:
      "vitest 전체(제외 경로는 vite.config.ts). 계약 테스트와 기준선 대조 포함",
  },
  {
    script: "validate:catalog",
    guards: "services/*.md 전수의 frontmatter, 섹션 순서, OKLCH, 인용 무결성",
  },
  {
    script: "validate:previews",
    guards:
      "public/preview/*/ 전수의 구조(block), 반응형과 움직임 줄이기 휴리스틱(warn)",
  },
  // CI passes the PR's merge base (or the commit a push replaced) through
  // `$BASE_REF`. Locally `origin/main` is that base for a PR on main; a branch
  // stacked on another passes that one with `pnpm gates --base <ref>`
  // (`withBase`). When the ref is missing the script fails loudly and says to
  // fetch it, so the gate cannot pass on zero files.
  {
    script: "check:last-updated",
    args: ["--base", "origin/main"],
    ciArgs: ["--base", '"$BASE_REF"'],
    guards: "이 브랜치가 바꾼 services/*.md 의 last_updated 가 최신인지",
  },
  {
    script: "tokens:check",
    guards: "services/*.tokens.json 이 소스 md 와 같은지",
  },
  {
    script: "audit:oklch",
    guards: "OKLCH 와 병기 hex 의 일치, 프리뷰가 md 정의와 어긋나지 않는지",
  },
]

// Steps that only prepare the runner. Anything else before `pnpm build` must be
// a check `pnpm gates` can run, so it is read or refused, never skipped. What
// these actions are given (`with:`, such as the Node version or checkout
// depth) sets up CI's environment, which `pnpm gates` cannot copy because it
// runs in yours; that is outside what this contract holds.
const SETUP_ACTIONS = [
  "actions/checkout",
  "pnpm/action-setup",
  "actions/setup-node",
]

/** `pnpm <script> [args]` on one line, with no chaining or redirection. */
const ONE_PNPM_SCRIPT = /^pnpm\s+([\w:.-]+)(?:\s+[^&|;<>\n]*)?$/

/**
 * A line break, `$(…)`, a backtick, or a `${{ }}` expression (which GitHub
 * expands before the shell runs, so it can spell either): the line may run
 * another command too.
 */
const RUNS_MORE = /[\r\n`]|\$\(|\$\{\{/

// pnpm's own commands, which take the place a script name has in
// `pnpm <script>`; read as one, the step would show up as a script named
// `run` that gates lacks, which says nothing about the cause.
const PNPM_COMMANDS = new Set(["run", "exec", "dlx", "x", "i", "add"])

/** The one form of the install step: it prepares, so it is not mirrored. */
const INSTALL_ARGS = ["--frozen-lockfile"]

// The keys a pre-build step may carry: what the line shows, and labels or
// limits that do not change what the check does. Any other (`if`,
// `continue-on-error`, `working-directory`, …) changes whether or how the
// check runs in CI without showing in the line `pnpm gates` mirrors.
const STEP_KEYS = new Set([
  "name",
  "id",
  "timeout-minutes",
  "uses",
  "with",
  "run",
  "env",
])

// The keys the workflow and the build job may carry, by the same rule as
// `STEP_KEYS`: any other (`env`, `defaults`, `if`, `continue-on-error`,
// `container`, `strategy`, …) reaches every step the same hidden way.
const WORKFLOW_KEYS = new Set([
  "name",
  "run-name",
  "on",
  "concurrency",
  "permissions",
  "jobs",
])
const JOB_KEYS = new Set([
  "name",
  "runs-on",
  "steps",
  "timeout-minutes",
  "permissions",
])

// The fields read here; `Object.keys` still sees every key a step has.
type YamlScalar = string | number | boolean | null
interface WorkflowStep {
  run?: string
  uses?: string
  env?: Record<string, YamlScalar>
}

/**
 * Throws when a pre-build step sets something its line does not show: a key
 * outside `STEP_KEYS`, or an `env` variable the run line does not pass as an
 * argument (one it does pass, like `"$BASE_REF"`, is compared through the
 * step's `ciArgs`).
 */
function refuseHiddenSettings(step: WorkflowStep, label: string): void {
  for (const key of Object.keys(step)) {
    if (!STEP_KEYS.has(key)) {
      throw new Error(
        `CI build step \`${label}\` sets \`${key}\`, which \`pnpm gates\` cannot mirror; ` +
          "drop it from the step"
      )
    }
  }
  for (const name of Object.keys(step.env ?? {})) {
    const passed = new RegExp(String.raw`\$\{?${name}\b`)
    if (typeof step.run !== "string" || !passed.test(step.run)) {
      throw new Error(
        `CI build step \`${label}\` sets env \`${name}\` without passing it as an argument, ` +
          "so `pnpm gates` would run the check differently; pass it in the run line and list it in that step's ciArgs"
      )
    }
  }
}

/** One pre-build step as CI writes it: the script and its arguments. */
export interface CiStep {
  script: string
  args: Array<string>
}

/**
 * The package.json scripts CI's build job runs before `pnpm build`, in order,
 * each with the arguments its line passes (split on whitespace, as written).
 *
 * The setup actions in `SETUP_ACTIONS` and `pnpm install` prepare the runner
 * and are not mirrored; install is held to the one line `INSTALL_ARGS` spells,
 * so nothing else on that line rides past (what install itself runs, such as
 * `prepare`, runs on your install too). Every other step before `pnpm build` must be a single
 * `pnpm <script>` line; anything else (another action, a `node` or shell
 * command, a chained line) throws rather than being skipped, because a step
 * this reader silently ignored would be a step `pnpm gates` silently lacks.
 * So does a step that sets something its line does not show
 * (`refuseHiddenSettings`), and a build job with no `pnpm build`, which would
 * otherwise read every later step as a pre-build one.
 */
export function ciPreBuildSteps(workflowYaml: string): Array<CiStep> {
  const doc = parse(workflowYaml) as {
    jobs?: { build?: { steps?: Array<WorkflowStep> } }
  }
  for (const [where, level, allowed] of [
    ["the workflow", doc, WORKFLOW_KEYS],
    ["the build job", doc.jobs?.build ?? {}, JOB_KEYS],
  ] as const) {
    const key = Object.keys(level).find((k) => !allowed.has(k))
    if (key) {
      throw new Error(
        `${where} sets \`${key}\`, which reaches every CI step without showing in the lines \`pnpm gates\` mirrors; ` +
          "drop it, or add it to WORKFLOW_KEYS or JOB_KEYS in src/lib/gates.ts if it does not change how the checks run"
      )
    }
  }
  const steps = doc.jobs?.build?.steps
  if (!Array.isArray(steps)) {
    throw new Error("CI workflow has no `jobs.build.steps` list to read")
  }
  const scripts: Array<CiStep> = []
  for (const step of steps) {
    if (typeof step.uses === "string") {
      if (SETUP_ACTIONS.includes(step.uses.split("@")[0])) {
        refuseHiddenSettings(step, step.uses)
        continue
      }
      throw new Error(
        `CI build step uses \`${step.uses}\`, which \`pnpm gates\` cannot run; ` +
          "make the check a pnpm script, or add the action to SETUP_ACTIONS if it only prepares the runner"
      )
    }
    if (typeof step.run !== "string") {
      throw new Error(
        "CI build step has neither `run` nor `uses`, so it cannot be mirrored"
      )
    }
    const line = step.run.trim()
    // A second line, or a command substitution, runs more than the script the
    // line names. A plain variable such as `"$BASE_REF"` is an argument.
    const match = RUNS_MORE.test(line) ? null : ONE_PNPM_SCRIPT.exec(line)
    if (!match) {
      throw new Error(
        `CI build step \`${line}\` is not a single \`pnpm <script>\` line; ` +
          "make each check its own `pnpm <script>` step so `pnpm gates` can mirror it, " +
          "or move a step that only prepares the runner after `pnpm build` or into a setup action. " +
          'A `${{ }}` value belongs in the step\'s `env`, passed to the script as `"$NAME"`'
      )
    }
    const script = match[1]
    if (PNPM_COMMANDS.has(script)) {
      throw new Error(
        `CI build step \`${line}\` uses pnpm's own \`${script}\` command; ` +
          "write the package.json script name directly (`pnpm <script>`) so `pnpm gates` can mirror it"
      )
    }
    if (script === "build") return scripts
    refuseHiddenSettings(step, line)
    const args = line.split(/\s+/).slice(2)
    if (script !== "install") {
      scripts.push({ script, args })
    } else if (args.join(" ") !== INSTALL_ARGS.join(" ")) {
      // `pnpm gates` does not run install, so its line is held to one form
      // rather than compared; anything else on it would go unmirrored.
      throw new Error(
        `CI build step \`${line}\` is not \`pnpm install ${INSTALL_ARGS.join(" ")}\`; ` +
          "keep install to that line, or update INSTALL_ARGS in src/lib/gates.ts if the change only prepares the runner"
      )
    }
  }
  throw new Error(
    "CI build job has no `pnpm build` step, so its pre-build checks cannot be told apart"
  )
}

/**
 * Null when `gates` runs exactly CI's steps in CI's order; otherwise a sentence
 * naming what differs — steps only one side has first, since those are the
 * usual edit, then the first position where the order parts.
 */
export function stepListMismatch(
  ci: ReadonlyArray<string>,
  gates: ReadonlyArray<string>
): string | null {
  const problems: Array<string> = []
  for (const s of ci.filter((c) => !gates.includes(c))) {
    problems.push(`\`${s}\` is only in CI`)
  }
  for (const s of gates.filter((g) => !ci.includes(g))) {
    problems.push(`\`${s}\` is only in gates`)
  }
  if (problems.length > 0) return problems.join("; ")

  // Up to the longer list, so a step one side runs once more shows too.
  const longer = Math.max(ci.length, gates.length)
  const at = Array.from({ length: longer }, (_, i) => i).find(
    (i) => ci[i] !== gates[i]
  )
  if (at === undefined) return null
  const name = (s: string | undefined): string =>
    s === undefined ? "nothing" : `\`${s}\``
  return `order differs at position ${at + 1}: CI runs ${name(ci[at])}, gates runs ${name(gates[at])}`
}

/**
 * Null when every CI step that `gates` also runs gets the arguments `gates`
 * declares for CI (`ciArgs`, else `args`); otherwise a sentence naming each
 * step whose arguments differ. Steps only one side has are
 * `stepListMismatch`'s to report.
 */
export function argsMismatch(
  ci: ReadonlyArray<CiStep>,
  gates: ReadonlyArray<GateStep>
): string | null {
  const problems: Array<string> = []
  for (const step of ci) {
    const gate = gates.find((g) => g.script === step.script)
    if (!gate) continue
    const want = (gate.ciArgs ?? gate.args ?? []).join(" ")
    const got = step.args.join(" ")
    if (want !== got) {
      problems.push(
        `\`${step.script}\` runs with \`${got}\` in CI but gates expects \`${want}\``
      )
    }
  }
  return problems.length > 0 ? problems.join("; ") : null
}

/**
 * `steps` with every `--base` pointed at `ref`: `pnpm gates --base <ref>` for a
 * branch stacked on another branch, whose CI compares against that branch
 * rather than `origin/main`. `ciArgs` is CI's spelling and stays as it is.
 */
export function withBase(
  steps: ReadonlyArray<GateStep>,
  ref: string
): Array<GateStep> {
  return steps.map((step) => {
    const at = step.args?.indexOf("--base") ?? -1
    if (!step.args || at === -1) return step
    const args = [...step.args]
    args[at + 1] = ref
    return { ...step, args }
  })
}

// A ref `pnpm gates --base` passes on. It is joined into a shell command, so
// only what git ref names are made of gets through, and it must not start with
// `-` (read as an option) or `~` (expanded by a POSIX shell). `^` is left out
// because Windows' cmd reads it as an escape.
const BASE_REF = /^[\w.][\w./~-]*$/

/**
 * The steps `pnpm gates <argv>` runs: `GATE_STEPS` with no arguments, or with
 * the date check's base pointed elsewhere by `--base <ref>`. Null for any
 * other argument list, which the CLI answers with its usage line.
 */
export function parseGatesArgs(
  argv: ReadonlyArray<string>
): ReadonlyArray<GateStep> | null {
  if (argv.length === 0) return GATE_STEPS
  if (argv.length === 2 && argv[0] === "--base" && BASE_REF.test(argv[1])) {
    return withBase(GATE_STEPS, argv[1])
  }
  return null
}

/** `check:last-updated --base origin/main` — how a step is named in output. */
export function describeStep(step: GateStep): string {
  return [step.script, ...(step.args ?? [])].join(" ")
}

/**
 * Runs `steps` in order through `exec` and stops at the first failure.
 *
 * `exec` returns the step's exit code, or null when there is none (killed by a
 * signal, or the process never started) — that counts as a failure too, so a
 * step that did not run can never read as one that passed.
 *
 * Returns the exit code for the whole run: 0, or the failing step's code
 * (1 when it had none).
 */
export function runGates(
  steps: ReadonlyArray<GateStep>,
  exec: (step: GateStep) => number | null,
  out: (line: string) => void
): number {
  for (const step of steps) {
    out(`[gates] ▶ ${describeStep(step)}`)
    const code = exec(step)
    if (code !== 0) {
      const shown = code === null ? "no exit code" : `exit ${code}`
      out(
        `[gates] FAILED at step: ${describeStep(step)} (${shown}) — ${step.guards}`
      )
      return code === null ? 1 : code
    }
  }
  out(`[gates] all ${steps.length} steps passed`)
  return 0
}
