// CI's pre-build checks as one local command:
//
//   pnpm gates
//
// Runs each step in src/lib/gates.ts as `pnpm run <script>`, stops at the first
// failure, and prints that step's name. The step list and the run loop live in
// that module, where they are unit-tested and held to .github/workflows/ci.yml;
// this file only spawns the processes.
import { spawnSync } from "node:child_process"
import { GATE_STEPS, runGates } from "../src/lib/gates"

const code = runGates(
  GATE_STEPS,
  (step) => {
    // A fixed command string through a shell, as in scripts/e2e-server.ts:
    // `pnpm` is `pnpm.cmd` on Windows, which only resolves through one, and an
    // args array alongside `shell: true` is deprecated (DEP0190). Every piece
    // of the string is a constant from GATE_STEPS.
    const command = ["pnpm", "run", step.script, ...(step.args ?? [])].join(" ")
    return spawnSync(command, { stdio: "inherit", shell: true }).status
  },
  (line) => console.log(line)
)
process.exit(code)
