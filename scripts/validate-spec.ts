import fs from "node:fs"
import path from "node:path"
import { lint } from "@google/design.md/linter"
import { buildDoc } from "../src/lib/content-parser"
import { formatSpecReport } from "./spec-report"
import type { ServiceDoc } from "../src/lib/content-types"
import type { EntryReport } from "./spec-report"

// Conformance gate against the PUBLISHED Google DESIGN.md spec, using the
// official linter (`@google/design.md`, pinned) rather than a re-implementation
// of its rules — the catalog already pays for restating one spec in four places
// (see CLAUDE.md on the 10-section list), and this avoids adding a fifth.
//
// Each entry is linted exactly as committed — the file IS what
// `/services/{slug}/DESIGN.md` serves (#421). services/*.md is never touched.
//
//   pnpm validate:spec                 # every entry
//   pnpm validate:spec toss wanted     # named entries
//   pnpm validate:spec --json-out r.json
//   pnpm validate:spec --verbose       # also list info-level findings and the
//                                      # rules printed only as a count (#388)
//
// Exit code follows the official CLI: non-zero only when the spec reports an
// ERROR. Warnings and infos are reported but do not fail — the spec is at
// `alpha` and most of its rules are advisory by design.

const cwd = process.cwd()
const SERVICES_DIR = path.resolve(cwd, "services")

function collectDocs(): Array<ServiceDoc> {
  return fs
    .readdirSync(SERVICES_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((fileName) => {
      const raw = fs.readFileSync(path.join(SERVICES_DIR, fileName), "utf-8")
      // Mirror Vite's import.meta.glob path style so deriveSlug() stays consistent.
      return buildDoc(`/services/${fileName}`, raw)
    })
}

function inspect(doc: ServiceDoc): EntryReport {
  const report = lint(doc.raw)
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
      // `process.exitCode` + `return` for the same reason as the final exit
      // below: stderr is an async pipe under CI and captured runs, so exiting
      // immediately can discard the line naming which slug was wrong.
      console.error(
        `[spec] No catalog entry with slug ${unknown.map((s) => `"${s}"`).join(", ")}`
      )
      process.exitCode = 1
      return
    }
    docs = docs.filter((d) => slugArgs.includes(d.frontmatter.slug))
  }

  const reports = docs.map(inspect)
  const totalErrors = reports.reduce((n, r) => n + r.errors, 0)
  for (const line of formatSpecReport(reports, { verbose })) console.log(line)

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
        "recorded in KNOWN_SPEC_LIMITATIONS (src/lib/spec-limitations.ts) " +
        "or a new regression is decided by `pnpm test`, not here."
    )
    process.exitCode = 1
  }
}

main()
