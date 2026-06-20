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

function main() {
  const args = process.argv.slice(2)
  const force = args.includes("--all") || args.includes("--force")
  const slugArg = args.find((a) => !a.startsWith("--"))

  let docs = collectDocs()
  if (slugArg) {
    docs = docs.filter((d) => d.frontmatter.slug === slugArg)
    if (docs.length === 0) {
      console.error(`[tokens] No catalog entry with slug "${slugArg}"`)
      process.exit(1)
    }
  }

  console.log(`[tokens] Drafting sidecars → services/`)
  let written = 0
  let skipped = 0
  for (const doc of docs) {
    const slug = doc.frontmatter.slug
    const outPath = path.join(SERVICES_DIR, `${slug}.tokens.json`)
    // A bulk no-arg run only fills in MISSING sidecars — it never clobbers a
    // reviewed/committed one. Pass a slug or --all to deliberately regenerate.
    if (!force && !slugArg && fs.existsSync(outPath)) {
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
