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
}

/**
 * The pre-build steps of CI's build job, in CI's order. Build, the HTTP smoke,
 * and the contrast and E2E jobs are left out on purpose: they cost far more,
 * and the contrast numbers are only canonical when CI records them (ADR 0007).
 */
export const GATE_STEPS: ReadonlyArray<GateStep> = [
  { script: "typecheck" },
  { script: "lint" },
  { script: "format:check" },
  { script: "test" },
  { script: "validate:catalog" },
  { script: "validate:previews" },
  // CI passes the PR's merge base (or the commit a push replaced). Locally
  // `origin/main` is that base; when it is missing the script fails loudly and
  // says to `git fetch origin main`, so the gate cannot pass on zero files.
  { script: "check:last-updated", args: ["--base", "origin/main"] },
  { script: "tokens:check" },
  { script: "audit:oklch" },
]

/** `pnpm <script> [args]` on one line, with no chaining or redirection. */
const ONE_PNPM_SCRIPT = /^pnpm\s+([\w:.-]+)(?:\s+[^&|;<>\n]*)?$/

/**
 * The package.json scripts CI's build job runs before `pnpm build`, in order.
 *
 * `pnpm install` is setup, not a check, and is skipped. Anything that mentions
 * pnpm but is not a single `pnpm <script>` line throws rather than being
 * skipped — a step this reader silently ignored would be a step `pnpm gates`
 * silently lacks. So does a build job with no `pnpm build`, which would
 * otherwise read every later step as a pre-build one.
 */
export function ciPreBuildScripts(workflowYaml: string): Array<string> {
  const doc = parse(workflowYaml) as {
    jobs?: { build?: { steps?: Array<{ run?: string }> } }
  }
  const steps = doc.jobs?.build?.steps
  if (!Array.isArray(steps)) {
    throw new Error("CI workflow has no `jobs.build.steps` list to read")
  }
  const scripts: Array<string> = []
  for (const step of steps) {
    if (typeof step.run !== "string" || !/\bpnpm\b/.test(step.run)) continue
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
      out(`[gates] FAILED at step: ${describeStep(step)} (${shown})`)
      return code === null ? 1 : code
    }
  }
  out(`[gates] all ${steps.length} steps passed`)
  return 0
}
