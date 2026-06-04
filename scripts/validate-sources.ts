// CI guard: audits source-citation integrity across every services/*.md.
//
// Reuses buildDoc() (frontmatter + body parsing) and auditSourceCitations()
// (the rule engine) so the check matches exactly what the unit tests cover.
// Run with `pnpm validate:sources`. Exits 1 if any blocking issue is found.
//
// Deliberately a plain Node script (tsx) rather than a vitest test: vitest 4 +
// vite 8 hangs ~10s on cleanup in this repo, and CI does not run `pnpm test`.

import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { buildDoc } from "../src/lib/content-parser"
import { auditSourceCitations } from "../src/lib/source-citations"

const SERVICES_DIR = fileURLToPath(new URL("../services", import.meta.url))

function main(): void {
  const files = readdirSync(SERVICES_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()

  let blockCount = 0
  let warnCount = 0

  for (const file of files) {
    const raw = readFileSync(join(SERVICES_DIR, file), "utf8")

    let doc
    try {
      doc = buildDoc(`/services/${file}`, raw)
    } catch (e) {
      console.log(`FAIL ${file}  (frontmatter parse error)`)
      console.error(`       ${(e as Error).message}`)
      blockCount++
      continue
    }

    const issues = auditSourceCitations(
      doc.frontmatter.slug,
      doc.frontmatter.sources,
      doc.body,
    )
    const blocks = issues.filter((i) => i.severity === "block")
    const warns = issues.filter((i) => i.severity === "warn")
    blockCount += blocks.length
    warnCount += warns.length

    if (blocks.length) {
      console.log(`FAIL ${file}  (${blocks.length} block, ${warns.length} warn)`)
    } else if (warns.length) {
      console.log(`warn ${file}  (${warns.length} warn)`)
    } else {
      console.log(`ok   ${file}`)
    }
    for (const i of blocks) console.log(`       BLOCK [${i.rule}] ${i.message}`)
    for (const i of warns) console.log(`       warn  [${i.rule}] ${i.message}`)
  }

  console.log(
    `\n${files.length} files — ${blockCount} blocking, ${warnCount} warning issue(s).`,
  )

  if (blockCount > 0) {
    console.error(
      `\nFAILED: ${blockCount} blocking source-citation issue(s) above must be fixed.`,
    )
    process.exit(1)
  }
  console.log("\nPASSED: no blocking source-citation issues.")
}

main()
