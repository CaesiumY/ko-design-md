// Stage 9a3 of the onboarding skill: measure contrast on a STAGED preview — one
// still in `.claude/cache/design-md/{slug}/`, not yet under `public/` — and add
// what the judge finds to that iteration's machine report (ADR 0009).
//
// It is the CI contrast gate's observation harness pointed at a document the
// gate never sees. The document is served at the self-check's virtual path,
// on top of the real `public/` tree, so its absolute `/preview/_runtime/*`
// links resolve exactly as they will once it ships. Widths, themes and the
// hover pass are the gate's own, so a reading here is the reading CI will take
// after the entry lands.
//
// Two outcomes, both exit 0, because the loop must go on to the reviewer
// either way:
//
// - observed → the shortfalls go into the report as `warn` items;
// - skipped  → no browser (or the measurement broke), and the report says so
//   in a shape that cannot be mistaken for a clean run.
//
// Exit 2 is a bad invocation, decided before Playwright is even imported — the
// same split `scripts/audit-contrast.ts` makes, for the same reason: the
// argument contract can then be tested where no browser is installed.

import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { BASELINE_WIDTHS } from "../src/lib/contrast-baseline"
import { dedupeFindings } from "../src/lib/contrast-report"
import {
  mergeIntoMachineReport,
  observedRender,
  skippedRender,
} from "../src/lib/staged-contrast-report"
// The sweep module imports Playwright for its types only; the browser driver
// itself is loaded inside `observe`, after the arguments have been accepted.
import {
  hoverWidthOf,
  measureOne,
  newMeasuringContext,
  serveStatic,
} from "./audit-contrast-sweep"
import type { StaticServer } from "./audit-contrast-sweep"
import type { Browser } from "playwright"
import type { Finding, State, Theme } from "../src/lib/contrast-report"
import type {
  MachineReport,
  RenderResult,
} from "../src/lib/staged-contrast-report"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const THEMES: Array<Theme> = ["light", "dark"]
// What the findings are labelled with. The staged file is not a catalogue
// entry yet, and its slug would only ever be echoed back.
const SLUG = "staged"

interface Args {
  staged?: string
  jsonOut?: string
  iteration: number
  online: boolean
  verbose: boolean
}

function fail(message: string): never {
  console.error(message)
  process.exit(2)
}

function parseArgs(argv: Array<string>): Required<Args> {
  const args: Args = { iteration: 1, online: false, verbose: false }
  const getValue = (flag: string, index: number): string => {
    const val = argv.at(index)
    if (val === undefined || val.startsWith("--")) {
      fail(`Error: ${flag} requires a value`)
    }
    return val
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--staged") args.staged = getValue(a, ++i)
    else if (a === "--json-out") args.jsonOut = getValue(a, ++i)
    else if (a === "--iteration") {
      const raw = getValue(a, ++i)
      const n = Number(raw)
      if (!Number.isInteger(n) || n < 1) {
        fail(`Error: --iteration takes a positive integer; got "${raw}"`)
      }
      args.iteration = n
    } else if (a === "--online") args.online = true
    else if (a === "--verbose") args.verbose = true
    else fail(`Unknown argument: ${a}`)
  }
  if (args.staged === undefined)
    fail("Error: --staged <preview.html> is required")
  if (args.jsonOut === undefined)
    fail("Error: --json-out <report.json> is required")
  if (!existsSync(args.staged))
    fail(`Error: no staged preview at ${args.staged}`)
  // A directory passes `existsSync` and would only fail at the read, outside
  // the observation's catch — exit 1 with a stack trace instead of exit 2.
  if (!statSync(args.staged).isFile())
    fail(`Error: --staged ${args.staged} is not a file`)
  return args as Required<Args>
}

/**
 * The report this run joins, or null when there is none yet.
 *
 * An existing file that is not a JSON object is refused rather than replaced:
 * it is most likely this iteration's 9a2 result, and overwriting it with a
 * fresh envelope would drop the gate's findings without a word.
 */
function readExisting(path: string): MachineReport | null {
  if (!existsSync(path)) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"))
  } catch (e) {
    fail(`Error: ${path} exists but is not JSON (${(e as Error).message})`)
  }
  // `machine: true` is the envelope's discriminator. A reviewer report
  // (preview-review-{M}.json) also has `issues` and `verdict`, and joining it
  // would overwrite the review with a half machine report.
  const report = parsed as Partial<MachineReport> | null
  if (
    report === null ||
    typeof report !== "object" ||
    report.machine !== true ||
    !Array.isArray(report.issues) ||
    typeof report.verdict !== "string"
  ) {
    fail(
      `Error: ${path} exists but is not a machine report (needs machine: true, an issues list and a verdict)`
    )
  }
  return report as MachineReport
}

// Playwright's launch error runs to a boxed install hint over many lines; the
// first line says what happened.
function reasonOf(e: unknown): string {
  const text = e instanceof Error ? e.message : String(e)
  const first = text.split("\n").find((line) => line.trim() !== "") ?? text
  return first.trim().slice(0, 300)
}

async function observe(args: Required<Args>): Promise<RenderResult> {
  const html = readFileSync(args.staged, "utf8")
  const widths = [...BASELINE_WIDTHS]
  const hoverWidth = hoverWidthOf(widths)
  const findings: Array<Finding> = []
  // Both handles are closed in one `finally`, each on its own, whichever of
  // them got opened. A browser left running keeps this process alive, and a
  // 9a3 that never exits stalls the loop it is meant never to stop.
  let server: StaticServer | undefined
  let browser: Browser | undefined
  try {
    const { chromium } = await import("playwright")
    server = await serveStatic(join(ROOT, "public"))
    server.setOracle(html)
    browser = await chromium.launch()
    const url = `http://127.0.0.1:${server.port}/__oracle/preview.html`
    for (const width of widths) {
      const context = await newMeasuringContext(browser, {
        width,
        online: args.online,
      })
      const page = await context.newPage()
      for (const theme of THEMES) {
        const measured = await measureOne(context, page, url, {
          slug: SLUG,
          theme,
          width,
          withHover: width === hoverWidth,
        })
        findings.push(...measured.findings)
        if (args.verbose) {
          console.log(
            `  ${theme} @${width} — ${measured.collected.text.length} text, ` +
              `${measured.collected.nonText.length} non-text`
          )
        }
      }
      await context.close()
    }
  } catch (e) {
    return skippedRender(reasonOf(e))
  } finally {
    await browser?.close().catch(() => undefined)
    await server?.close().catch(() => undefined)
  }
  // `hoverWidthOf` picks one of `widths`, and a run that stops part way is
  // reported as skipped above, so a returned observation always measured hover.
  const states: Array<State> = ["default", "hover"]
  return observedRender(dedupeFindings(findings), {
    widths,
    themes: THEMES,
    states,
  })
}

// Written beside the target and renamed over it, so a run that dies half way
// leaves the 9a2 report as it was rather than a truncated file.
function writeAtomically(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true })
  const tmp = `${path}.${process.pid}.tmp`
  writeFileSync(tmp, contents)
  renameSync(tmp, path)
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const target = resolve(args.jsonOut)
  const existing = readExisting(target)
  const result = await observe(args)
  const report = mergeIntoMachineReport(existing, result, {
    iteration: args.iteration,
  })
  writeAtomically(target, `${JSON.stringify(report, null, 2)}\n`)
  console.log(report.verdict)
  console.log(`machine report → ${args.jsonOut}`)
}

await main()
