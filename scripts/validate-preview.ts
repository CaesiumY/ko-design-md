// Deterministic preview HTML gate — used three ways:
//
//   pnpm validate:previews
//     Bulk CI mode: every public/preview/{slug}/ pair (skips _runtime) is
//     checked against its services/{slug}.md.
//
//   pnpm validate:previews --slug toss [--verbose]
//     Single published slug.
//
//   pnpm validate:previews --light <p> --dark <p> --design-md <p>
//                          [--expected-logo-src </logos/x.png|none>]
//                          [--expected-wordmark-src <...|none>]
//                          [--iteration M] [--json-out <path>]
//     Staging mode: the /design-md skill runs this between the preview author
//     and reviewer dispatches (Stage 9a2).
//
// Exits 1 when any blocking issue is found. Warn-level heuristics (bare 1fr,
// missing @media collapse, chromatic hex) never gate CI — legacy previews
// legitimately carry some of them.

import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { validatePreviewPair } from "../src/lib/preview-validator"
import type { PreviewValidationResult } from "../src/lib/preview-validator"
import type { ValidationIssue } from "../src/lib/draft-validator"

const PREVIEW_DIR = fileURLToPath(new URL("../public/preview", import.meta.url))
const SERVICES_DIR = fileURLToPath(new URL("../services", import.meta.url))

interface CliArgs {
  slug?: string
  light?: string
  dark?: string
  designMd?: string
  expectedLogoSrc?: string
  expectedWordmarkSrc?: string
  iteration: number
  jsonOut?: string
  verbose: boolean
}

function parseArgs(argv: Array<string>): CliArgs {
  const args: CliArgs = { iteration: 1, verbose: false }
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
    if (a === "--slug") args.slug = getValue(a, ++i)
    else if (a === "--light") args.light = getValue(a, ++i)
    else if (a === "--dark") args.dark = getValue(a, ++i)
    else if (a === "--design-md") args.designMd = getValue(a, ++i)
    else if (a === "--expected-logo-src")
      args.expectedLogoSrc = getValue(a, ++i)
    else if (a === "--expected-wordmark-src")
      args.expectedWordmarkSrc = getValue(a, ++i)
    else if (a === "--iteration") args.iteration = Number(getValue(a, ++i)) || 1
    else if (a === "--json-out") args.jsonOut = getValue(a, ++i)
    else if (a === "--verbose") args.verbose = true
    else {
      console.error(`Unknown argument: ${a}`)
      process.exit(2)
    }
  }
  return args
}

function noneToUndefined(v: string | undefined): string | undefined {
  return v && v !== "none" ? v : undefined
}

// Git Bash (MSYS) on Windows rewrites a bare leading-slash argument into the
// Git install path (`/logos/x.png` → `C:/Program Files/Git/logos/x.png`).
// Legal values here are always site-relative `/logos/...`, so recover the
// tail when the shell has prefixed it.
function normalizeLogoSrc(v: string | undefined): string | undefined {
  const value = noneToUndefined(v)
  if (!value) return undefined
  const idx = value.indexOf("/logos/")
  if (idx > 0) return value.slice(idx)
  return value
}

function validateSlugDir(
  slug: string,
  expectedLogoSrc?: string,
  expectedWordmarkSrc?: string
): PreviewValidationResult {
  const lightPath = join(PREVIEW_DIR, slug, "light.html")
  const darkPath = join(PREVIEW_DIR, slug, "dark.html")
  const mdPath = join(SERVICES_DIR, `${slug}.md`)

  const issues: Array<ValidationIssue> = []
  for (const [name, p] of [
    ["light.html", lightPath],
    ["dark.html", darkPath],
  ] as const) {
    if (!existsSync(p)) {
      issues.push({
        severity: "block",
        rule: "missing-preview-file",
        section: name,
        fix: `public/preview/${slug}/${name} is missing — every published slug needs both theme files.`,
      })
    }
  }
  if (!existsSync(mdPath)) {
    issues.push({
      severity: "block",
      rule: "missing-md-pair",
      section: "design.md",
      fix: `public/preview/${slug}/ exists but services/${slug}.md does not — previews must pair with a catalog entry.`,
    })
  }
  if (issues.length > 0) {
    return {
      issues,
      passed: false,
      metrics: {
        light: { matched: 0, total: 0 },
        dark: { matched: 0, total: 0 },
      },
    }
  }

  return validatePreviewPair({
    slug,
    lightRaw: readFileSync(lightPath, "utf8"),
    darkRaw: readFileSync(darkPath, "utf8"),
    lightBytes: statSync(lightPath).size,
    darkBytes: statSync(darkPath).size,
    designMdRaw: readFileSync(mdPath, "utf8"),
    expectedLogoSrc,
    expectedWordmarkSrc,
  })
}

function printIssues(issues: Array<ValidationIssue>, warns: boolean): void {
  for (const i of issues.filter((x) => x.severity === "block")) {
    console.log(`       BLOCK [${i.rule}] (${i.section}) ${i.fix}`)
  }
  if (warns) {
    for (const i of issues.filter((x) => x.severity === "warn")) {
      console.log(`       warn  [${i.rule}] (${i.section}) ${i.fix}`)
    }
  }
}

function report(
  label: string,
  result: PreviewValidationResult,
  verbose: boolean
): { blocks: number; warns: number } {
  const blocks = result.issues.filter((i) => i.severity === "block").length
  const warns = result.issues.filter((i) => i.severity === "warn").length
  const cov = `oklch ${result.metrics.light.matched}/${result.metrics.light.total}L ${result.metrics.dark.matched}/${result.metrics.dark.total}D`
  if (blocks)
    console.log(`FAIL ${label}  (${blocks} block, ${warns} warn, ${cov})`)
  else if (warns) console.log(`warn ${label}  (${warns} warn, ${cov})`)
  else console.log(`ok   ${label}  (${cov})`)
  printIssues(result.issues, verbose)
  return { blocks, warns }
}

function finish(blockCount: number, scope: string): void {
  if (blockCount > 0) {
    console.error(
      `\nFAILED: ${blockCount} blocking preview issue(s) above must be fixed.`
    )
    process.exit(1)
  }
  console.log(`\nPASSED: no blocking preview issues (${scope}).`)
}

function runStaging(args: CliArgs): void {
  if (!args.light || !args.dark || !args.designMd) {
    console.error(
      "Staging mode needs --light, --dark and --design-md (plus optional --expected-logo-src/--expected-wordmark-src)."
    )
    process.exit(2)
  }
  const result = validatePreviewPair({
    slug: "staging",
    lightRaw: readFileSync(args.light, "utf8"),
    darkRaw: readFileSync(args.dark, "utf8"),
    lightBytes: statSync(args.light).size,
    darkBytes: statSync(args.dark).size,
    designMdRaw: readFileSync(args.designMd, "utf8"),
    expectedLogoSrc: normalizeLogoSrc(args.expectedLogoSrc),
    expectedWordmarkSrc: normalizeLogoSrc(args.expectedWordmarkSrc),
  })
  const { blocks, warns } = report("staging pair", result, true)

  if (args.jsonOut) {
    const machineReport = {
      machine: true,
      tool: "validate-preview",
      schema: 1,
      iteration: args.iteration,
      passed: result.passed,
      metrics: result.metrics,
      issues: result.issues,
      verdict: `${blocks} block / ${warns} warn — deterministic preview checks ${result.passed ? "passed" : "failed"}`,
    }
    writeFileSync(args.jsonOut, JSON.stringify(machineReport, null, 2) + "\n")
    console.log(`\nmachine report → ${args.jsonOut}`)
  }
  finish(blocks, "staging")
}

function runPublished(args: CliArgs): void {
  const slugs = args.slug
    ? [args.slug]
    : readdirSync(PREVIEW_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
        .map((d) => d.name)
        .sort()

  let blockCount = 0
  let warnCount = 0
  for (const slug of slugs) {
    const result = validateSlugDir(slug)
    const { blocks, warns } = report(
      slug,
      result,
      args.verbose || Boolean(args.slug)
    )
    blockCount += blocks
    warnCount += warns
  }
  console.log(
    `\n${slugs.length} slug(s) — ${blockCount} blocking, ${warnCount} warning issue(s).`
  )
  finish(blockCount, args.slug ?? "all previews")
}

const args = parseArgs(process.argv.slice(2))
if (args.light || args.dark || args.designMd) runStaging(args)
else runPublished(args)
