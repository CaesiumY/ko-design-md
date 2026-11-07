import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { entriesOf, findKey, readFrontmatter, tokenText } from "./frontmatter"
import type { ServiceTokens } from "./content-types"

// Every colour reference row in an entry's frontmatter reaches its committed
// sidecar as a `ref` token (#626). The sidecar is read as committed, not
// re-extracted: `tokens:check` already proves the two agree, and this test is
// the one that notices when what they agree on has lost a role — the extractor
// once skipped every reference row, and both gates stayed green.

const SERVICES_DIR = path.resolve(process.cwd(), "services")
const COLOR_REF = /^\{colors\.([^{}]+)\}$/

function slugs(): Array<string> {
  return fs
    .readdirSync(SERVICES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -".md".length))
    .sort()
}

/** `name → pointed-at key` for each reference row of the entry's `colors:`. */
function referenceRows(slug: string): Map<string, string> {
  const raw = fs.readFileSync(path.join(SERVICES_DIR, `${slug}.md`), "utf8")
  const read = readFrontmatter(raw)
  const out = new Map<string, string>()
  if (!read.ok) return out
  for (const row of entriesOf(findKey(read.keys, "colors"))) {
    const ref = tokenText(row)?.match(COLOR_REF)?.[1]
    if (ref !== undefined) out.set(row.key, ref)
  }
  return out
}

function sidecarRefs(slug: string): Map<string, string> {
  const tokens = JSON.parse(
    fs.readFileSync(path.join(SERVICES_DIR, `${slug}.tokens.json`), "utf8")
  ) as ServiceTokens
  return new Map(
    tokens.colors.flatMap((c) =>
      c.ref === undefined ? [] : [[c.name, c.ref] as const]
    )
  )
}

describe("colour reference rows reach the sidecar", () => {
  it("finds reference rows to check — a reader that matches none passes vacuously", () => {
    const total = slugs().reduce((n, s) => n + referenceRows(s).size, 0)
    expect(total).toBeGreaterThan(0)
  })

  it.each(slugs())("%s", (slug) => {
    expect(sidecarRefs(slug)).toEqual(referenceRows(slug))
  })
})
