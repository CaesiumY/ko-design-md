// `pnpm gates` — the checks CI's build job runs before `pnpm build`, as one
// local command. CLI wrapper: scripts/gates.ts. The step list here is held to
// .github/workflows/ci.yml by gates.test.ts, so the two cannot drift apart
// quietly.
//
// Why it exists: before a merge the pre-build checks were re-run on the merged
// tree by hand-chaining them, and in #642 one such chain had a wrong log path,
// ran nothing, and still ended on `exit=0`. A single command that names the
// step it stopped at cannot fail that way.

import { parse } from "yaml"

export interface GateStep {
  /** A package.json script name, run as `pnpm run <script>`. */
  script: string
  args?: ReadonlyArray<string>
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
      "vitest 전체(.claude/worktrees, .claude/cache, e2e 는 제외). 계약 테스트와 기준선 대조 포함",
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
  // CI passes the PR's merge base (or the commit a push replaced). Locally
  // `origin/main` is that base; when it is missing the script fails loudly and
  // says to `git fetch origin main`, so the gate cannot pass on zero files.
  {
    script: "check:last-updated",
    args: ["--base", "origin/main"],
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
// a check `pnpm gates` can run, so it is read or refused, never skipped.
const SETUP_ACTIONS = [
  "actions/checkout",
  "pnpm/action-setup",
  "actions/setup-node",
]

/** `pnpm <script> [args]` on one line, with no chaining or redirection. */
const ONE_PNPM_SCRIPT = /^pnpm\s+([\w:.-]+)(?:\s+[^&|;<>\n]*)?$/

/**
 * The package.json scripts CI's build job runs before `pnpm build`, in order.
 *
 * The setup actions in `SETUP_ACTIONS` and `pnpm install` prepare the runner
 * and are skipped. Every other step before `pnpm build` must be a single
 * `pnpm <script>` line; anything else (another action, a `node` or shell
 * command, a chained line) throws rather than being skipped, because a step
 * this reader silently ignored would be a step `pnpm gates` silently lacks.
 * So does a build job with no `pnpm build`, which would otherwise read every
 * later step as a pre-build one.
 */
export function ciPreBuildScripts(workflowYaml: string): Array<string> {
  const doc = parse(workflowYaml) as {
    jobs?: { build?: { steps?: Array<{ run?: string; uses?: string }> } }
  }
  const steps = doc.jobs?.build?.steps
  if (!Array.isArray(steps)) {
    throw new Error("CI workflow has no `jobs.build.steps` list to read")
  }
  const scripts: Array<string> = []
  for (const step of steps) {
    if (typeof step.uses === "string") {
      if (SETUP_ACTIONS.includes(step.uses.split("@")[0])) continue
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
    const match = ONE_PNPM_SCRIPT.exec(line)
    if (!match) {
      throw new Error(
        `CI build step \`${line}\` is not a single \`pnpm <script>\` line; ` +
          "split it into one step per script so `pnpm gates` can mirror it"
      )
    }
    const script = match[1]
    if (script === "build") return scripts
    if (script !== "install") scripts.push(script)
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

  const at = ci.findIndex((s, i) => s !== gates[i])
  if (at === -1) return null
  return `order differs at position ${at + 1}: CI runs \`${ci[at]}\`, gates runs \`${gates[at]}\``
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
