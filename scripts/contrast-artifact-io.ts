// Reading CI's `contrast-report` artifact and the entries it names, for the
// two commands that take it: `pnpm audit:contrast:pairs`
// (`classify-contrast-pairs.ts`) and `pnpm audit:contrast:rebaseline`
// (`rebaseline-contrast.ts`). Shared so the two read a findings file and the
// entries the same way, and refuse a findings file they cannot read in the
// same words. What they refuse in the findings themselves comes from
// `readArtifactPalettes` (src/lib/contrast-pairs.ts).

import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { findingsProblem } from "../src/lib/contrast-report"
import type { Finding } from "../src/lib/contrast-report"

export const ROOT = fileURLToPath(new URL("..", import.meta.url))

/** Print `message` and exit; 2 is a bad invocation or input. */
export function fail(message: string, code = 2): never {
  console.error(message)
  process.exit(code)
}

/**
 * The findings in a `contrast-findings.json`, or exit 2 saying why not.
 *
 * Checked here rather than left to fail inside the maths: an artifact from
 * before the colour pair was reported has no `fg`/`bg`, and that should read
 * as the wrong input (exit 2), not as a crash.
 */
export function readFindings(path: string): Array<Finding> {
  let parsed: ReturnType<typeof JSON.parse>
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"))
  } catch (e) {
    fail(`Error: could not read ${path}: ${(e as Error).message}`)
  }
  const problem = findingsProblem(parsed)
  if (problem !== null) fail(`Error: ${path} ${problem}`)
  return parsed as Array<Finding>
}

/** `services/{slug}.md` by slug, for each of `slugs` this checkout has. */
export function readEntries(slugs: Iterable<string>): Record<string, string> {
  const entries: Record<string, string> = {}
  for (const slug of new Set(slugs)) {
    const file = join(ROOT, "services", `${slug}.md`)
    if (existsSync(file)) entries[slug] = readFileSync(file, "utf8")
  }
  return entries
}
