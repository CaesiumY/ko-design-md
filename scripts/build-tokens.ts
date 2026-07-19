import fs from "node:fs"
import path from "node:path"
import { buildDoc } from "../src/lib/content-parser"
import { extractTokensFromMarkdown } from "../src/lib/token-extractor"
import type { ServiceDoc } from "../src/lib/content-types"

// Codegen: DRAFT machine-readable token sidecars (`services/{slug}.tokens.json`)
// from the human-authored prose YAML in each design.md. The heuristic parser
// (src/lib/token-extractor.ts) handles the per-entry format variation; its
// output is a DRAFT meant for human review before commit — the runtime never
// runs it (see src/lib/content-collection.ts, which only reads the JSON).
//
//   pnpm tokens:build           # draft only MISSING sidecars (won't clobber reviewed ones)
//   pnpm tokens:build toss      # (re)draft a single entry by slug
//   pnpm tokens:build --all     # regenerate every sidecar (overwrites)
//   pnpm tokens:check           # CI gate: fail if any sidecar drifted from its md

const cwd = process.cwd()
const SERVICES_DIR = path.resolve(cwd, "services")

function collectDocs(): Array<ServiceDoc> {
  return fs
    .readdirSync(SERVICES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((fileName) => {
      const raw = fs.readFileSync(path.join(SERVICES_DIR, fileName), "utf-8")
      // Mirror Vite's import.meta.glob path style so deriveSlug() stays consistent.
      return buildDoc(`/services/${fileName}`, raw)
    })
}

// --check: regenerate in memory and diff against what is committed, writing
// nothing. A sidecar is derived from its md, so the two drifting apart means the
// site serves stale tokens — which is exactly what happened to wanted (51 colors
// missing after an md edit skipped regeneration) and teamsparta (a group label
// that no longer existed in the source). Both went unnoticed because nothing in
// CI compared them.
function check(docs: Array<ServiceDoc>): never {
  const stale: Array<string> = []
  const missing: Array<string> = []

  for (const doc of docs) {
    const slug = doc.frontmatter.slug
    const outPath = path.join(SERVICES_DIR, `${slug}.tokens.json`)
    const expected =
      JSON.stringify(extractTokensFromMarkdown(doc.body), null, 2) + "\n"
    if (!fs.existsSync(outPath)) {
      missing.push(slug)
      continue
    }
    if (fs.readFileSync(outPath, "utf-8") !== expected) stale.push(slug)
  }

  if (missing.length === 0 && stale.length === 0) {
    console.log(`[tokens] ${docs.length} sidecar(s) in sync with services/*.md`)
    process.exit(0)
  }
  for (const slug of missing) {
    console.error(`  ✗ ${slug}.tokens.json is missing`)
  }
  for (const slug of stale) {
    console.error(
      `  ✗ ${slug}.tokens.json differs from what ${slug}.md produces`
    )
  }
  console.error(
    `\n[tokens] ${missing.length + stale.length} sidecar(s) out of sync — ` +
      `run \`pnpm tokens:build ${[...missing, ...stale].join(" ")}\` and commit the result.`
  )
  process.exit(1)
}

function main() {
  const args = process.argv.slice(2)
  const force = args.includes("--all") || args.includes("--force")
  const checkOnly = args.includes("--check")
  // ALL positional args, not just the first: `check()` below tells you to run
  // `pnpm tokens:build <slug> <slug> …` when several sidecars drift, and taking
  // only the first would regenerate one and leave the rest stale without a word
  // — the very silence this gate exists to break.
  const slugArgs = args.filter((a) => !a.startsWith("--"))

  let docs = collectDocs()
  if (slugArgs.length > 0) {
    const known = new Set(docs.map((d) => d.frontmatter.slug))
    const unknown = slugArgs.filter((s) => !known.has(s))
    if (unknown.length > 0) {
      console.error(
        `[tokens] No catalog entry with slug ${unknown.map((s) => `"${s}"`).join(", ")}`
      )
      process.exit(1)
    }
    docs = docs.filter((d) => slugArgs.includes(d.frontmatter.slug))
  }

  if (checkOnly) check(docs)

  console.log(`[tokens] Drafting sidecars → services/`)
  let written = 0
  let skipped = 0
  for (const doc of docs) {
    const slug = doc.frontmatter.slug
    const outPath = path.join(SERVICES_DIR, `${slug}.tokens.json`)
    // A bulk no-arg run only fills in MISSING sidecars — it never clobbers a
    // reviewed/committed one. Pass a slug or --all to deliberately regenerate.
    if (!force && slugArgs.length === 0 && fs.existsSync(outPath)) {
      skipped++
      continue
    }
    const tokens = extractTokensFromMarkdown(doc.body)
    fs.writeFileSync(outPath, JSON.stringify(tokens, null, 2) + "\n")
    written++
    console.log(
      `  ✓ ${`${slug}.tokens.json`.padEnd(26)} ` +
        `${tokens.colors.length}c ${tokens.typography.length}t ` +
        `${tokens.spacing.length}s ${tokens.radius.length}r`
    )
  }
  const tail =
    skipped > 0
      ? ` (${skipped} existing skipped — use --all to regenerate)`
      : ""
  console.log(
    `[tokens] Wrote ${written}${tail}. Review drafts before committing.`
  )
}

main()
