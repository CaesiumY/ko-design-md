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
// This is NOT a gate. It measures and reports; a preview below threshold does
// not fail the run. Whether any of this becomes a gate, and at what severity,
// is decided from these numbers. Exit 1 is reserved for the self-check, which
// asks whether the measurement itself still works.
//
// It also cannot live inside `src/lib/preview-validator.ts`, which is
// deliberately dependency-free so the gate cannot fail on a devDependency.

import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { resolvePreviewLayout } from "../src/lib/preview-layout"
import type { SweepArgs } from "./audit-contrast-sweep"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const PREVIEW_DIR = join(ROOT, "public", "preview")

// The widths CLAUDE.md fixes for preview validation. 976 is the detail page's
// embed width, historically the blind spot — overflow and media-query colour
// changes hide at the middle multi-column widths, so 375 alone is not a sweep.
const DEFAULT_WIDTHS = [375, 768, 976, 1440]

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
function catalogueSlugs(): Array<string> {
  return readdirSync(PREVIEW_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name)
    .filter(
      (slug) =>
        resolvePreviewLayout((file) =>
          existsSync(join(PREVIEW_DIR, slug, file))
        ) !== null
    )
    .sort()
}

function resolveSlugs(args: SweepArgs): Array<string> {
  const all = catalogueSlugs()
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
  const slugs = resolveSlugs(args)
  const themes: Array<"light" | "dark"> =
    args.theme === "both" ? ["light", "dark"] : [args.theme]

  // Deferred so the argument checks above run without a browser binary, which
  // is what lets `src/lib/audit-contrast-cli.test.ts` pin them in CI.
  if (args.selfCheck) {
    const { selfCheck } = await import("./audit-contrast-oracle")
    const result = await selfCheck(ROOT)
    for (const line of result.lines) console.log(line)
    // Exit 1 belongs to the self-check alone. A sweep that finds low contrast
    // still exits 0: this is a survey, and #359 decides from its numbers
    // whether any of it becomes a gate.
    if (!result.ok) process.exitCode = 1
    return
  }

  const { sweep } = await import("./audit-contrast-sweep")
  await sweep({
    slugs,
    themes,
    args,
    root: ROOT,
    writeOut,
  })
}

await main()
