// Measure WCAG 2.x contrast across every published preview, in both themes, at
// the widths the catalogue validates at.
//
// Why a browser (issue #359): a preview's colours are OKLCH, `color-mix()` and
// `var()` chains, and Chromium reports a resolved `color-mix(in oklab, ...)` as
// an `oklab()` string. The catalogue has no OKLCH-to-sRGB transform to parse
// that with — `src/lib/oklch-convert.ts` only goes hex to Oklab — and jsdom
// resolves neither the cascade nor `var()`. So the page is really rendered and
// each computed colour is painted onto a canvas and read back as sRGB bytes.
//
// A preview below threshold still does not fail the run, and that has not
// changed: the catalogue carries over a thousand such readings and they are
// reported, not blocked. What `--check-baseline` adds is a different question —
// whether the COUNTS have moved away from the table `contrast-baseline.ts` and
// `docs/preview-contrast-baseline.md` both publish. A new shortfall moves them,
// and so does a quiet fix, and both should be said out loud.
//
// Exit 1 belongs to the self-check alone, which asks whether the measurement
// itself still works. That is why baseline drift exits 3 and not 1: a broken
// measurement and a moved number are different findings, and a CI log that
// spelled them the same way would send a reader to the wrong file.
//
// It also cannot live inside `src/lib/preview-validator.ts`, which is
// deliberately dependency-free so the gate cannot fail on a devDependency.

import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  BASELINE_WIDTHS,
  CONTRAST_BASELINE,
  baselineArgConflicts,
  baselineHolds,
  compareToBaseline,
  renderBaselineFailure,
} from "../src/lib/contrast-baseline"
import { readPreviewSlugs, skippedNotices } from "./audit-contrast-slugs"
import type { SweepArgs } from "./audit-contrast-sweep"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const PREVIEW_DIR = join(ROOT, "public", "preview")

// The widths CLAUDE.md fixes for preview validation. 976 is the detail page's
// embed width, historically the blind spot — overflow and media-query colour
// changes hide at the middle multi-column widths, so 375 alone is not a sweep.
//
// Taken from the baseline rather than spelled again here. A second literal
// would be free to diverge, and the failure would not be a loud one: the sweep
// would measure widths the table does not describe and report every row as
// drift.
//
// Copied rather than aliased: `SweepArgs.widths` is handed around as a mutable
// array, and an in-place sort anywhere downstream would otherwise edit the
// recorded constant that `baselineArgConflicts` compares against.
const DEFAULT_WIDTHS = [...BASELINE_WIDTHS]

type ThemeArg = "light" | "dark" | "both"

function fail(message: string): never {
  console.error(message)
  process.exit(2)
}

function parseArgs(argv: Array<string>): SweepArgs {
  const args: SweepArgs = {
    widths: DEFAULT_WIDTHS,
    theme: "both",
    online: false,
    selfCheck: false,
    checkBaseline: false,
    verbose: false,
  }
  // A flag followed by another flag (or nothing) has to fail loudly rather than
  // swallow the next flag as its value: `--slug --verbose` would otherwise
  // sweep the whole catalogue while looking like it was told to sweep one.
  const getValue = (flag: string, index: number): string => {
    const val = argv.at(index)
    if (val === undefined || val.startsWith("--")) {
      fail(`Error: ${flag} requires a value`)
    }
    return val
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--slug") args.slug = getValue(a, ++i)
    else if (a === "--widths") args.widths = parseWidths(getValue(a, ++i))
    else if (a === "--theme") args.theme = parseTheme(getValue(a, ++i))
    else if (a === "--json-out") args.jsonOut = getValue(a, ++i)
    else if (a === "--report-out") args.reportOut = getValue(a, ++i)
    else if (a === "--online") args.online = true
    else if (a === "--self-check") args.selfCheck = true
    else if (a === "--check-baseline") args.checkBaseline = true
    else if (a === "--verbose") args.verbose = true
    else fail(`Unknown argument: ${a}`)
  }
  return args
}

function parseWidths(raw: string): Array<number> {
  const parts = raw.split(",").map((p) => p.trim())
  const widths = parts.map((p) => {
    const n = Number(p)
    // Number("") is 0 and Number("1e3") is 1000, so the guard is on the value
    // being a usable CSS pixel width, not on the string looking numeric.
    if (!Number.isFinite(n) || n <= 0 || p === "") {
      fail(`Error: --widths takes comma-separated pixel widths; got "${p}"`)
    }
    return Math.round(n)
  })
  if (widths.length === 0) fail("Error: --widths needs at least one width")
  return [...new Set(widths)].sort((x, y) => x - y)
}

function parseTheme(raw: string): ThemeArg {
  if (raw === "light" || raw === "dark" || raw === "both") return raw
  fail(`Error: --theme takes light, dark or both; got "${raw}"`)
}

/**
 * Every slug with a readable preview, the way the other readers find them.
 *
 * `_runtime` and anything else beginning with an underscore is shared
 * machinery, not an entry — the same filter `scripts/validate-preview.ts` uses.
 */
function resolveSlugs(args: SweepArgs): Array<string> {
  const found = readPreviewSlugs(PREVIEW_DIR)
  // Printed, never swallowed. `resolvePreviewLayout` asks callers to treat an
  // unreadable slug as an error rather than as nothing to check, and a sweep
  // that calls itself exhaustive has to say when it was not.
  for (const notice of skippedNotices(found)) console.error(`Note: ${notice}`)
  const all = found.slugs
  if (args.slug === undefined) return all
  // Named before a browser starts: a typo should cost a second, not a sweep
  // that renders nothing and reports zero findings as though that were news.
  if (!all.includes(args.slug)) {
    fail(
      `Error: no preview for slug "${args.slug}". Known slugs: ${all.join(", ")}`
    )
  }
  return [args.slug]
}

function writeOut(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, contents, "utf8")
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  // Before the slugs are resolved, so `--check-baseline --slug toss` is
  // corrected as the argument mistake it is rather than accepted as a valid
  // slug and then compared against a table that describes the whole catalogue.
  if (args.checkBaseline) {
    const conflicts = baselineArgConflicts(args)
    if (conflicts.length > 0) {
      // Every conflict, not the first: a run invoked with two wrong flags
      // would otherwise be corrected twice.
      for (const conflict of conflicts) console.error(`Error: ${conflict}`)
      process.exit(2)
    }
  }
  const slugs = resolveSlugs(args)
  const themes: Array<"light" | "dark"> =
    args.theme === "both" ? ["light", "dark"] : [args.theme]

  // Deferred so the argument checks above run without a browser binary, which
  // is what lets `src/lib/audit-contrast-cli.test.ts` pin them in CI.
  if (args.selfCheck) {
    const { selfCheck } = await import("./audit-contrast-oracle")
    const result = await selfCheck(ROOT)
    for (const line of result.lines) console.log(line)
    // Exit 1 belongs to the self-check alone, and baseline drift exits 3 so the
    // two never wear the same code. A sweep that merely finds low contrast
    // still exits 0: those readings are recorded, not blocked.
    if (!result.ok) process.exitCode = 1
    return
  }

  const { sweep } = await import("./audit-contrast-sweep")
  const { totals } = await sweep({
    slugs,
    themes,
    args,
    root: ROOT,
    writeOut,
  })

  if (args.checkBaseline) {
    // Compared against the totals the run already printed, not a second fold
    // of the same findings. Two folds could disagree, and then the table a
    // reader was shown would not be the table the gate judged.
    const comparison = compareToBaseline(totals, CONTRAST_BASELINE)
    for (const line of renderBaselineFailure(
      comparison,
      totals,
      CONTRAST_BASELINE
    )) {
      console.log(line)
    }
    if (!baselineHolds(comparison)) process.exitCode = 3
  }
}

await main()
