import fs from "node:fs"
import path from "node:path"
import { lint } from "@google/design.md/linter"
import { buildDoc } from "../src/lib/content-parser"
import { toGoogleDesignMd } from "../src/lib/google-designmd-adapter"
import type { ServiceDoc, ServiceTokens } from "../src/lib/content-types"

// Conformance gate against the PUBLISHED Google DESIGN.md spec, using the
// official linter (`@google/design.md`, pinned) rather than a re-implementation
// of its rules — the catalog already pays for restating one spec in four places
// (see CLAUDE.md on the 10-section list), and this avoids adding a fifth.
//
// Each entry is rendered through src/lib/google-designmd-adapter.ts into the
// shape the spec describes, then linted. services/*.md is never touched.
//
//   pnpm validate:spec                 # every entry
//   pnpm validate:spec toss wanted     # named entries
//   pnpm validate:spec --json-out r.json
//   pnpm validate:spec --verbose       # print info-level findings too
//
// Exit code follows the official CLI: non-zero only when the spec reports an
// ERROR. Warnings and infos are reported but do not fail — the spec is at
// `alpha` and most of its rules are advisory by design.

const cwd = process.cwd()
const SERVICES_DIR = path.resolve(cwd, "services")

interface EntryReport {
  slug: string
  errors: number
  warnings: number
  infos: number
  tokens: {
    colors: number
    typography: number
    spacing: number
    rounded: number
  }
  findings: Array<{
    severity: string
    rule: string
    path?: string
    message: string
  }>
}

function readSidecar(slug: string): ServiceTokens | undefined {
  const file = path.join(SERVICES_DIR, `${slug}.tokens.json`)
  if (!fs.existsSync(file)) return undefined
  return JSON.parse(fs.readFileSync(file, "utf-8")) as ServiceTokens
}

function collectDocs(): Array<ServiceDoc> {
  return fs
    .readdirSync(SERVICES_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort()
    .map((fileName) => {
      const raw = fs.readFileSync(path.join(SERVICES_DIR, fileName), "utf-8")
      // Mirror Vite's import.meta.glob path style so deriveSlug() stays consistent.
      const doc = buildDoc(`/services/${fileName}`, raw)
      const tokens = readSidecar(doc.frontmatter.slug)
      return tokens ? { ...doc, tokens } : doc
    })
}

function inspect(doc: ServiceDoc): EntryReport {
  const report = lint(toGoogleDesignMd(doc))
  const ds = report.designSystem
  return {
    slug: doc.frontmatter.slug,
    errors: report.summary.errors,
    warnings: report.summary.warnings,
    infos: report.summary.infos,
    tokens: {
      colors: ds.colors.size,
      typography: ds.typography.size,
      spacing: ds.spacing.size,
      rounded: ds.rounded.size,
    },
    findings: report.findings.map((f) => ({
      severity: String(f.severity),
      // Findings raised while resolving the token model (bad unit, unparseable
      // color) carry no rule name — they precede the rule pass. Label them so
      // the report never prints a bare "?".
      rule: String(f.rule ?? "model"),
      path: f.path ? String(f.path) : undefined,
      message: String(f.message),
    })),
  }
}

function main() {
  const args = process.argv.slice(2)
  const verbose = args.includes("--verbose")
  const jsonIdx = args.indexOf("--json-out")
  const jsonOut = jsonIdx === -1 ? undefined : args[jsonIdx + 1]
  // Guard the -1 case: `jsonIdx + 1` is 0 when --json-out is absent, which
  // would silently drop the FIRST slug argument.
  const jsonValueIdx = jsonIdx === -1 ? -1 : jsonIdx + 1
  const slugArgs = args.filter(
    (a, i) => !a.startsWith("--") && i !== jsonValueIdx
  )

  let docs = collectDocs()
  if (slugArgs.length > 0) {
    const known = new Set(docs.map((d) => d.frontmatter.slug))
    const unknown = slugArgs.filter((s) => !known.has(s))
    if (unknown.length > 0) {
      console.error(
        `[spec] No catalog entry with slug ${unknown.map((s) => `"${s}"`).join(", ")}`
      )
      process.exit(1)
    }
    docs = docs.filter((d) => slugArgs.includes(d.frontmatter.slug))
  }

  const reports = docs.map(inspect)
  let totalErrors = 0
  let totalWarnings = 0

  for (const r of reports) {
    totalErrors += r.errors
    totalWarnings += r.warnings
    const t = r.tokens
    const counts = `${t.colors}c/${t.typography}t/${t.spacing}s/${t.rounded}r`
    const label = `${r.slug.padEnd(20)} ${counts.padEnd(18)}`
    if (r.errors)
      console.log(`FAIL ${label} (${r.errors} error, ${r.warnings} warn)`)
    else if (r.warnings) console.log(`warn ${label} (${r.warnings} warn)`)
    else console.log(`ok   ${label}`)

    for (const f of r.findings) {
      if (f.severity === "info" && !verbose) continue
      const where = f.path ? ` (${f.path})` : ""
      console.log(
        `       ${f.severity.padEnd(7)} [${f.rule}]${where} ${f.message}`
      )
    }
  }

  console.log(
    `\n[spec] ${reports.length} entr${reports.length === 1 ? "y" : "ies"} — ` +
      `${totalErrors} error, ${totalWarnings} warning finding(s).`
  )

  if (jsonOut) {
    fs.writeFileSync(
      path.resolve(cwd, jsonOut),
      JSON.stringify(reports, null, 2) + "\n"
    )
    console.log(`[spec] wrote ${jsonOut}`)
  }

  // Exit 1 whenever the linter raised an error. Some of those errors are
  // recorded as deliberate (`%` radius, multi-stop gradients) and some are not —
  // this script cannot tell which, and deliberately does not try. Re-deriving
  // KNOWN_SPEC_LIMITATIONS here would be a second copy of the list to drift.
  //
  // So the message points at the judge rather than claiming a verdict. Saying
  // "some of these are expected" would be actively misleading in the case this
  // command exists to diagnose: a slug that just acquired a NEW error.
  //
  // `process.exitCode` rather than `process.exit()`: stdout is a pipe under CI
  // and captured runs, where writes are async — exiting immediately can discard
  // the line just queued, losing the explanation exactly when it is being read.
  if (totalErrors > 0) {
    console.log(
      "[spec] exit 1 because errors were reported. Whether these are the ones " +
        "recorded in KNOWN_SPEC_LIMITATIONS (src/lib/google-designmd-corpus.test.ts) " +
        "or a new regression is decided by `pnpm test`, not here."
    )
    process.exitCode = 1
  }
}

main()
