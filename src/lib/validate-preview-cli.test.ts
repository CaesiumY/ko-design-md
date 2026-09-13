import { spawnSync } from "node:child_process"
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, it } from "vitest"

// scripts/validate-preview.ts is the gate CI and the /design-md pipeline run,
// and nothing else exercises how it treats a file the halves reader refuses.
// That handling is the difference between one block for one file and a run that
// dies with a stack trace naming no slug, so it is pinned from the outside,
// through the real CLI.

const ROOT = process.cwd()
const CLI_TIMEOUT = 90_000

function run(args: Array<string>): { status: number | null; out: string } {
  const r = spawnSync(
    process.execPath,
    ["--import", "tsx", "scripts/validate-preview.ts", ...args],
    { cwd: ROOT, encoding: "utf8", timeout: CLI_TIMEOUT }
  )
  return { status: r.status, out: `${r.stdout}${r.stderr}` }
}

const page = (body: string): string =>
  '<!doctype html><html lang="ko" data-theme="light"><head><meta charset="utf-8">' +
  '<style>:root{}</style><style>[data-theme="dark"]{}</style></head>' +
  `<body>${body}</body></html>`

describe("validate-preview CLI — staging mode", () => {
  const dir = mkdtempSync(join(tmpdir(), "validate-preview-"))
  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  const staged = (name: string, body: string): string => {
    const path = join(dir, `${name}.html`)
    writeFileSync(path, page(body))
    return path
  }
  const reportFlags = (json: string): Array<string> => [
    "--design-md",
    "services/gs-shop.md",
    "--json-out",
    json,
  ]

  it(
    "reports a file the reader refuses as one block, and still writes the report",
    { timeout: CLI_TIMEOUT },
    () => {
      const json = join(dir, "unreadable.json")
      const { status, out } = run([
        "--preview",
        staged(
          "unreadable",
          '<template data-theme-variant="dark"><p>x</p></template><p>본문</p>'
        ),
        ...reportFlags(json),
      ])
      expect(status).toBe(1)
      expect(out).toContain("BLOCK [unreadable-merged-preview]")
      const report = JSON.parse(readFileSync(json, "utf8")) as {
        issues: Array<{ rule: string }>
      }
      expect(report.issues.map((i) => i.rule)).toEqual([
        "unreadable-merged-preview",
      ])
    }
  )

  it("judges the swap pairing it reads", { timeout: CLI_TIMEOUT }, () => {
    const { status, out } = run([
      "--preview",
      staged(
        "mismatch",
        '<p class="a">L</p><template data-theme-variant="dark"><div class="z">D</div></template>'
      ),
      ...reportFlags(join(dir, "mismatch.json")),
    ])
    expect(status).toBe(1)
    expect(out).toContain("BLOCK [dark-swap-anchor]")
  })

  it(
    "stops on a path that does not exist instead of blaming the file",
    { timeout: CLI_TIMEOUT },
    () => {
      const json = join(dir, "missing.json")
      const { status, out } = run([
        "--preview",
        join(dir, "nope.html"),
        ...reportFlags(json),
      ])
      expect(status).not.toBe(0)
      expect(out).not.toContain("unreadable-merged-preview")
      expect(existsSync(json)).toBe(false)
    }
  )
})
