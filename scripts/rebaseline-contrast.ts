// Rewrite the recorded contrast baseline from one CI run's artifact (#656).
//
//   pnpm audit:contrast:rebaseline <run id>               asks, then downloads
//   pnpm audit:contrast:rebaseline <run id> --from <dir>  reads a folder
//                                                          already downloaded
//
// Without `--from` it asks before running `gh run download <run id> -n
// contrast-report` into a new temporary folder, and refuses outside a terminal
// rather than download unasked. `--from` reads `contrast-findings.json` from a
// folder that command already filled. The artifact carries no run id, so
// whether that folder really is `<run id>`'s is not checked: the id given is
// what the record will name, and passing another run's folder writes that
// run's numbers under it.
//
// One run's findings rewrite every place the record holds them: the totals
// table in `src/lib/contrast-baseline.ts` and its copy in
// `docs/preview-contrast-baseline.md`, the two published-pair tables and the
// totals their prose states, the hold-reason table, the classified-run record
// (`src/lib/contrast-classified-run.json`), and the borderline section's
// "입력은 run" id; the totals sentence that pairs a run with its date is left
// for a person. The rewrite itself is `rebaseline` in
// `src/lib/contrast-rebaseline.ts`; this file only reads, downloads and
// writes. It then prints the ratchet rows that moved and the judgement prose
// it left for a person — dated observations are not something to generate.
//
// Exit 2 for a bad invocation, unreadable input, or an artifact this checkout
// cannot take (the reasons are printed and nothing is written); exit 1 when
// the download is declined (at the prompt, or for want of a terminal to ask
// in) or fails.

import { spawnSync } from "node:child_process"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createInterface } from "node:readline/promises"
import { rebaseline } from "../src/lib/contrast-rebaseline"
import { isRunId, measuredSlugs } from "../src/lib/contrast-report"
import { readPreviewSlugs } from "./audit-contrast-slugs"
import { ROOT, fail, readEntries, readFindings } from "./contrast-artifact-io"
import type { RecordFiles } from "../src/lib/contrast-rebaseline"

const PATHS: Record<keyof RecordFiles, string> = {
  doc: "docs/preview-contrast-baseline.md",
  baseline: "src/lib/contrast-baseline.ts",
  classifiedRun: "src/lib/contrast-classified-run.json",
}

function parseArgs(argv: Array<string>): { run: string; from?: string } {
  let run: string | undefined
  let from: string | undefined
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--from") {
      const val = argv.at(++i)
      if (val === undefined || val.startsWith("--")) {
        fail("Error: --from requires a folder")
      }
      from = val
    } else if (a.startsWith("--")) fail(`Unknown argument: ${a}`)
    else if (run === undefined) run = a
    else fail(`Error: one run id, got ${run} and ${a}`)
  }
  if (run === undefined || !isRunId(run)) {
    fail(
      "Error: usage: pnpm audit:contrast:rebaseline <run id> [--from <folder>] — the CI run whose contrast job uploaded the contrast-report artifact (a --from folder must hold that same run's artifact; it is not checked)"
    )
  }
  return { run, from }
}

/** Ask, then download the run's artifact into a new folder. */
async function download(run: string): Promise<string> {
  const command = (dir: string): Array<string> => [
    "gh",
    "run",
    "download",
    run,
    "-n",
    "contrast-report",
    "-D",
    dir,
  ]
  if (!process.stdin.isTTY) {
    // No terminal to say yes in is a declined download, not a bad invocation.
    fail(
      `Error: downloading needs a yes from a terminal. Run it there, or download it yourself (${command("<folder>").join(" ")}) and pass --from <folder>.`,
      1
    )
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(
    `Download the contrast-report artifact of CI run ${run} into a new temporary folder?\n  ${command("<folder>").join(" ")}\n[y/N] `
  )
  rl.close()
  if (answer.trim().toLowerCase() !== "y") {
    fail("Not downloaded; nothing written.", 1)
  }
  const dir = mkdtempSync(join(tmpdir(), `contrast-report-${run}-`))
  const got = spawnSync(command(dir)[0], command(dir).slice(1), {
    stdio: "inherit",
  })
  if (got.status !== 0) fail(`Error: ${command(dir).join(" ")} failed`, 1)
  return dir
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const dir = args.from ?? (await download(args.run))
  const findings = readFindings(join(dir, "contrast-findings.json"))

  const previewSlugs = readPreviewSlugs(join(ROOT, "public", "preview")).slugs
  const entries = readEntries([...previewSlugs, ...measuredSlugs(findings)])

  // Edited as LF and written back in the file's own line endings, so a
  // `w/crlf` checkout (CLAUDE.md, Windows) is not rewritten line by line.
  const crlf = new Set<keyof RecordFiles>()
  const read = (k: keyof RecordFiles): string => {
    const text = readFileSync(join(ROOT, PATHS[k]), "utf8")
    if (text.includes("\r\n")) crlf.add(k)
    return text.replace(/\r\n/g, "\n")
  }
  const files: RecordFiles = {
    doc: read("doc"),
    baseline: read("baseline"),
    classifiedRun: read("classifiedRun"),
  }

  const got = rebaseline({
    run: args.run,
    findings,
    previewSlugs,
    entries,
    files,
  })
  if (!got.ok) {
    console.error(
      `Nothing written — run ${args.run} does not fit this checkout:`
    )
    for (const reason of got.reasons) console.error(`  ${reason}`)
    process.exit(2)
  }
  // The classification command's notes, from the same reading of the palettes.
  for (const note of got.notes) console.error(note)

  const changed = (Object.keys(PATHS) as Array<keyof RecordFiles>).filter(
    (k) => got.files[k] !== files[k]
  )
  for (const k of changed) {
    const text = got.files[k]
    writeFileSync(
      join(ROOT, PATHS[k]),
      crlf.has(k) ? text.replace(/\n/g, "\r\n") : text,
      "utf8"
    )
  }
  console.log(
    changed.length === 0
      ? `Nothing changed: the record already holds run ${args.run}.`
      : `Wrote run ${args.run} into ${changed.map((k) => PATHS[k]).join(", ")}.`
  )
  console.log("")
  for (const line of got.moved) console.log(line)
  if (got.remaining.length > 0) {
    console.log("")
    console.log("Left for a person (judgement prose this does not write):")
    for (const item of got.remaining) console.log(`  - ${item}`)
  }
}

await main()
