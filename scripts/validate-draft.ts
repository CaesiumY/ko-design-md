// Deterministic design.md draft gate — used two ways:
//
//   pnpm validate:draft <file.md> [--slug X] [--expected-logo <url|none>]
//                       [--lang ko|en] [--iteration N] [--json-out <path>]
//     Single-file mode. The /design-md skill runs this between the author and
//     reviewer dispatches (Stage 6a2); `--json-out` writes a review-shaped
//     report the author consumes as `prior_review_path` on retry.
//
//   pnpm validate:catalog   (= tsx scripts/validate-draft.ts --services)
//     Bulk CI mode over every services/*.md. A strict superset of the
//     citation-only `pnpm validate:sources` gate.
//
// Exits 1 when any blocking issue is found.

import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { basename, join } from "node:path"
import { fileURLToPath } from "node:url"
import { validateDraft } from "../src/lib/draft-validator"
import type {
  DraftValidationOptions,
  ValidationIssue,
} from "../src/lib/draft-validator"

const SERVICES_DIR = fileURLToPath(new URL("../services", import.meta.url))

interface CliArgs {
  file?: string
  services: boolean
  slug?: string
  expectedLogo?: string
  lang?: "ko" | "en"
  iteration: number
  jsonOut?: string
}

function parseArgs(argv: Array<string>): CliArgs {
  const args: CliArgs = { services: false, iteration: 1 }
  // A flag followed by another flag (or nothing) must fail loudly instead of
  // silently consuming the next flag as its value.
  const getValue = (flag: string, index: number): string => {
    // .at() (vs [index]) keeps the honest `string | undefined` type when the
    // flag sits at the end of argv.
    const val = argv.at(index)
    if (val === undefined || val.startsWith("--")) {
      console.error(`Error: ${flag} requires a value`)
      process.exit(2)
    }
    return val
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--services") args.services = true
    else if (a === "--slug") args.slug = getValue(a, ++i)
    else if (a === "--expected-logo") args.expectedLogo = getValue(a, ++i)
    else if (a === "--lang") args.lang = getValue(a, ++i) as "ko" | "en"
    else if (a === "--iteration") args.iteration = Number(getValue(a, ++i)) || 1
    else if (a === "--json-out") args.jsonOut = getValue(a, ++i)
    else if (!a.startsWith("--") && !args.file) args.file = a
    else {
      console.error(`Unknown argument: ${a}`)
      process.exit(2)
    }
  }
  return args
}

function printIssues(issues: Array<ValidationIssue>): void {
  for (const i of issues.filter((x) => x.severity === "block")) {
    console.log(`       BLOCK [${i.rule}] (${i.section}) ${i.fix}`)
  }
  for (const i of issues.filter((x) => x.severity === "warn")) {
    console.log(`       warn  [${i.rule}] (${i.section}) ${i.fix}`)
  }
}

function statusLine(
  label: string,
  issues: Array<ValidationIssue>
): { blocks: number; warns: number } {
  const blocks = issues.filter((i) => i.severity === "block").length
  const warns = issues.filter((i) => i.severity === "warn").length
  if (blocks) console.log(`FAIL ${label}  (${blocks} block, ${warns} warn)`)
  else if (warns) console.log(`warn ${label}  (${warns} warn)`)
  else console.log(`ok   ${label}`)
  return { blocks, warns }
}

function runSingle(args: CliArgs): void {
  const file = args.file
  if (!file) {
    console.error(
      "Usage: validate-draft <file.md> [--slug X] [--expected-logo <url|none>] [--lang ko|en] [--iteration N] [--json-out <path>]"
    )
    process.exit(2)
  }
  const raw = readFileSync(file, "utf8")
  const opts: DraftValidationOptions = {
    filePath: file.replace(/\\/g, "/"),
    expectedSlug: args.slug,
    expectedLogoUrl:
      args.expectedLogo && args.expectedLogo !== "none"
        ? args.expectedLogo
        : undefined,
    expectedLang: args.lang,
  }
  const result = validateDraft(raw, opts)
  const { blocks, warns } = statusLine(basename(file), result.issues)
  printIssues(result.issues)

  if (args.jsonOut) {
    const report = {
      machine: true,
      tool: "validate-draft",
      schema: 1,
      iteration: args.iteration,
      passed: result.passed,
      issues: result.issues,
      verdict: `${blocks} block / ${warns} warn — deterministic draft checks ${result.passed ? "passed" : "failed"}`,
    }
    writeFileSync(args.jsonOut, JSON.stringify(report, null, 2) + "\n")
    console.log(`\nmachine report → ${args.jsonOut}`)
  }

  if (!result.passed) {
    console.error(`\nFAILED: ${blocks} blocking issue(s) above must be fixed.`)
    process.exit(1)
  }
  console.log("\nPASSED: no blocking draft issues.")
}

function runBulk(): void {
  const files = readdirSync(SERVICES_DIR)
    // Skip `_`-prefixed demo files and token sidecars (see CONTRIBUTING.md).
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort()

  let blockCount = 0
  let warnCount = 0

  for (const file of files) {
    const raw = readFileSync(join(SERVICES_DIR, file), "utf8")
    const isEn = file.endsWith(".en.md")
    const stem = file.replace(/\.en\.md$|\.md$/, "")
    const result = validateDraft(raw, {
      filePath: `/services/${file}`,
      expectedSlug: stem,
      expectedLang: isEn ? "en" : undefined,
    })
    const { blocks, warns } = statusLine(file, result.issues)
    blockCount += blocks
    warnCount += warns
    if (blocks) printIssues(result.issues.filter((i) => i.severity === "block"))
  }

  console.log(
    `\n${files.length} files — ${blockCount} blocking, ${warnCount} warning issue(s).`
  )
  if (blockCount > 0) {
    console.error(
      `\nFAILED: ${blockCount} blocking catalog issue(s) above must be fixed.`
    )
    process.exit(1)
  }
  console.log("\nPASSED: no blocking catalog issues.")
}

const args = parseArgs(process.argv.slice(2))
if (args.services) runBulk()
else runSingle(args)
