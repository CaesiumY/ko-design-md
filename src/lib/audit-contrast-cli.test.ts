import { spawnSync } from "node:child_process"
import { describe, expect, it } from "vitest"

// scripts/audit-contrast.ts needs a browser to measure anything, so the sweep
// itself cannot run under `pnpm test` — CI has no browser job. What CAN be
// pinned here is everything the script decides BEFORE it launches one: a
// mistyped flag, a width that is not a number, a slug that does not exist.
//
// That ordering is the point of the test as much as the exit codes are. The
// script defers `import("playwright")` until it actually sweeps, so these runs
// finish without a browser binary present at all.

const ROOT = process.cwd()
const CLI_TIMEOUT = 60_000

function run(args: Array<string>): { status: number | null; out: string } {
  const r = spawnSync(
    process.execPath,
    ["--import", "tsx", "scripts/audit-contrast.ts", ...args],
    { cwd: ROOT, encoding: "utf8", timeout: CLI_TIMEOUT }
  )
  return { status: r.status, out: `${r.stdout}${r.stderr}` }
}

describe("audit-contrast CLI — arguments", () => {
  it("refuses an unknown argument", { timeout: CLI_TIMEOUT }, () => {
    const r = run(["--slugs", "toss"])
    expect(r.status).toBe(2)
    expect(r.out).toContain("Unknown argument")
  })

  it("refuses a flag with no value", { timeout: CLI_TIMEOUT }, () => {
    const r = run(["--slug"])
    expect(r.status).toBe(2)
    expect(r.out).toContain("requires a value")
  })

  it(
    "refuses a flag whose value is the next flag",
    { timeout: CLI_TIMEOUT },
    () => {
      // Without this, `--slug --verbose` would sweep every slug and look like
      // it had been told to sweep one.
      const r = run(["--slug", "--verbose"])
      expect(r.status).toBe(2)
      expect(r.out).toContain("requires a value")
    }
  )

  it("refuses a width that is not a number", { timeout: CLI_TIMEOUT }, () => {
    const r = run(["--widths", "375,phone"])
    expect(r.status).toBe(2)
    expect(r.out).toContain("width")
  })

  it("refuses a theme it cannot render", { timeout: CLI_TIMEOUT }, () => {
    const r = run(["--theme", "sepia"])
    expect(r.status).toBe(2)
    expect(r.out).toContain("theme")
  })

  it("refuses a slug with no preview", { timeout: CLI_TIMEOUT }, () => {
    // Named before a browser starts, so a typo costs a second rather than a
    // full sweep that measures nothing.
    const r = run(["--slug", "not-a-brand"])
    expect(r.status).toBe(2)
    expect(r.out).toContain("not-a-brand")
  })

  it(
    "accepts the widths the repository validates at",
    { timeout: CLI_TIMEOUT },
    () => {
      // 375 / 768 / 976 / 1440 — the preview widths CLAUDE.md fixes, 976 being
      // the detail page's embed width. Parsing them must not be an error.
      const r = run(["--widths", "375,768,976,1440", "--slug", "not-a-brand"])
      expect(r.out).not.toContain("width")
      expect(r.out).toContain("not-a-brand")
    }
  )
})
