import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { countDefinitions } from "./oklch-sync"
import { readDefinitions } from "./oklch-drift"
import { findFontDisplaySrc } from "./preview-validator"

// Coverage ratchets for the token gates.
//
// WHY THIS FILE EXISTS. Every gate that reads design tokens does so with a
// regex, and every one of them fails the same way: it matches nothing and
// reports success. `audit:oklch` prints "0 token(s) mismatched" whether it
// compared 918 definitions or zero. The drift gate is the same. So is the spec
// linter, which swallows an unresolvable token reference without a finding.
// Four gates, four green exits, nothing checked.
//
// That is not hypothetical. Moving tokens into YAML frontmatter — the migration
// this file was written to protect — breaks both regexes at once if the emitter
// quotes values or the reader keeps its column-0 anchor. Measured on a synthetic
// migrated line: quoting drops `countDefinitions` from 1 to 0 and
// `readDefinitions` from 1 to 0; indenting alone still drops `readDefinitions`.
// Both gates then pass.
//
// `oklch-drift-corpus.test.ts` already carries this idea for one gate (its
// MATCH_FLOOR exists because "a regex that silently stops matching" must fail
// loudly). These assertions extend it to the rest.
//
// WHEN A NUMBER MOVES, DO NOT EDIT IT TO MATCH. Find out what stopped being
// seen first. A number that legitimately changes — a new catalog entry, a token
// added — moves UP; a number that drops is the failure this file exists to
// catch.

const SERVICES_DIR = path.resolve(process.cwd(), "services")

function catalogFiles(): Array<string> {
  return fs
    .readdirSync(SERVICES_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort()
}

function readAll(): Array<{ slug: string; raw: string }> {
  return catalogFiles().map((f) => ({
    slug: f.replace(/\.md$/, ""),
    raw: fs.readFileSync(path.join(SERVICES_DIR, f), "utf-8"),
  }))
}

describe("token gate coverage", () => {
  const docs = readAll()

  it("reads the whole catalog", () => {
    // A glob that silently matched nothing would make every assertion below
    // vacuous — the exact failure mode this file guards against, one level up.
    expect(docs.length).toBeGreaterThan(10)
  })

  it("keeps audit:oklch comparing the annotated definitions it can see", () => {
    // `countDefinitions` feeds `pnpm audit:oklch`. `annotated` is every
    // `name: oklch(…)  # #hex` pair; `judged` is the subset it can actually
    // compare (the rest name more than one hex on the line and are skipped).
    let annotated = 0
    let judged = 0
    for (const { raw } of docs) {
      const c = countDefinitions(raw)
      annotated += c.annotated
      judged += c.judged
    }
    expect({ annotated, judged }).toEqual({ annotated: 950, judged: 941 })
  })

  it("keeps the drift gate resolving the definitions it compares", () => {
    // `readDefinitions` is what `findPreviewDrift` compares a preview against.
    // It drops names that disagree with themselves, so this total is also a
    // check that no entry has reintroduced a duplicate-value collision.
    const total = docs.reduce((n, { raw }) => n + readDefinitions(raw).size, 0)
    // 1265 before tokens moved into frontmatter, 1263 after. The two that left
    // were never token definitions: `teamsparta`'s `input-focus-ring` and
    // `wanted`'s `fg`, both written at column 0 inside a `## Components` fence.
    // Scoping the reader to the frontmatter block is what stops those — and
    // stops `wanted`'s Components `bg:`/`fg:` rows from manufacturing
    // duplicate-name conflicts the catalog does not have.
    // 1286 after likelion's 23 colors joined the catalog.
    expect(total).toBe(1286)
  })

  it("keeps every entry contributing definitions to the drift gate", () => {
    // A per-slug floor catches the case the total hides: one entry going to
    // zero while another grows.
    const empty = docs
      .filter(({ raw }) => readDefinitions(raw).size === 0)
      .map((d) => d.slug)
    expect(empty).toEqual([])
  })

  it("keeps the three webfont sources reachable to the preview validator", () => {
    // `findFontDisplaySrc` is how a brand's own display face reaches the
    // preview `<head>`. When it stops matching, the preview silently falls back
    // to Pretendard and nothing fails — the gap that shipped on `wanted`.
    //
    // This calls the real function rather than re-testing its regex against the
    // raw file. An earlier version of this assertion did the latter, and would
    // have stayed green through exactly the breakage it was written to catch:
    // moving the webfont line into frontmatter makes the function return null
    // for all three entries while a raw-text regex still finds three matches.
    const resolved = docs
      .filter(({ raw }) => findFontDisplaySrc(raw) !== null)
      .map((d) => d.slug)
    expect(resolved).toEqual(["codeit", "wanted", "yeogi"])
  })
})
