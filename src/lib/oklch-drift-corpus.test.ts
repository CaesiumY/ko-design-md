import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { definitionsForSlug, findPreviewDrift } from "./oklch-drift"

// `oklch-drift.test.ts` proves the algorithm on synthetic strings. Nothing
// proved it still reaches the catalogue — and for a while it barely did: the
// gate compared 22 declarations out of the 706 it looks at, and 14 of 17 slugs
// contributed nothing, because previews namespace their custom properties
// (`--tds-blue-500`) while the md keys are bare (`blue-500`). The per-slug
// alias map (#240) took that to 430. A regression in `readDefinitions` or in
// the map could take it back toward 0 and every other test would stay green.
//
// `scripts/audit-oklch.ts` already worries about this in prose: its drift loop
// stops the run when a preview file is missing, because otherwise the loop
// "exits 0 with no output — the gate is green but nothing was checked". That
// guard only covers a missing FILE. This file covers the other way to check
// nothing: the file is there and no declaration reaches the comparison.
//
// So the assertions here are about COVERAGE, not correctness. Correctness is
// the unit file's job; drift being zero is the catalogue's job (and CI runs
// `pnpm audit:oklch` for that). What is pinned here is that the gate still has
// something to say.

const ROOT = fileURLToPath(new URL("../..", import.meta.url))
const PREVIEW = join(ROOT, "public", "preview")
const SERVICES = join(ROOT, "services")

// Any value that cannot be a normalised `oklch(...)` string, so every name that
// reaches the comparison is reported as a finding. That turns `findPreviewDrift`
// into a counter without reimplementing its scope rules — the count then comes
// from the real code path, which is the only kind of count worth asserting.
const SENTINEL = "SENTINEL_NEVER_EQUAL"

/** Declarations that survived the scope rules, whatever their name. */
function consideredCount(html: string): number {
  const names = new Map<string, string>()
  for (const m of html.matchAll(/--([\w-]+):\s*(?=oklch\()/g)) {
    names.set(m[1], SENTINEL)
  }
  return findPreviewDrift(html, names).length
}

/** Declarations that survived the scope rules AND matched an md token name. */
function matchedCount(html: string, defs: Map<string, string>): number {
  const names = new Map<string, string>()
  for (const key of defs.keys()) names.set(key, SENTINEL)
  return findPreviewDrift(html, names).length
}

// Calls the same function `scripts/audit-oklch.ts` calls, rather than
// assembling the pipeline again here. Rebuilding it would let the script change
// underneath these assertions while they kept passing — which is the failure
// this file was written to make impossible, reproduced inside the file itself.
function definitionsFor(slug: string): Map<string, string> {
  return definitionsForSlug(
    readFileSync(join(SERVICES, `${slug}.md`), "utf8"),
    slug
  )
}

function slugs(): Array<string> {
  if (!existsSync(PREVIEW)) return []
  return readdirSync(PREVIEW, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name)
    .filter(
      (s) =>
        existsSync(join(PREVIEW, s, "light.html")) &&
        existsSync(join(SERVICES, `${s}.md`))
    )
    .sort()
}

// Floors, not exact numbers — previews change for legitimate reasons and the
// counts move with them. Measured 2026-08-06, totalling 430 of the 706
// declarations the gate considers (it was 22 before the alias map, #240).
//
// Per-slug rather than one total, because a total hides the case this table
// exists for: a new catalogue entry whose preview namespaces its custom
// properties and has no rule in `PREVIEW_TOKEN_ALIASES`. It would contribute
// few matches or none, and the total would still clear a global floor on the
// strength of the other sixteen. Requiring every slug to appear here means the
// number has to be looked at once, deliberately, per entry.
//
// A slug's count going UP is fine and does not fail — raise its floor when
// convenient. Going down means something stopped matching.
const MATCH_FLOOR: Partial<Record<string, number>> = {
  "11st": 19,
  baemin: 37,
  // Not a naming problem and not fixable by one: bezier's preview declares no
  // `oklch` at all — it is hex — so there is nothing for a name rule to reach.
  bezier: 0,
  class101: 14,
  codeit: 8,
  gmarket: 27,
  greeting: 13,
  krds: 33,
  kyobobook: 41,
  "line-design-system": 24,
  "seed-design": 27,
  socar: 40,
  teamsparta: 18,
  toss: 27,
  "vapor-ui": 36,
  wanted: 37,
  yeogi: 29,
}

describe("oklch-drift — catalogue coverage", () => {
  const all = slugs()

  it("finds previews to check", () => {
    expect(all.length).toBeGreaterThan(0)
  })

  it("accounts for every slug in the catalogue", () => {
    // A new entry has to be added here on purpose. That is the point: an entry
    // whose preview namespaces its custom properties needs a rule in
    // `PREVIEW_TOKEN_ALIASES`, and this is where not having one becomes visible
    // instead of being absorbed by the other sixteen slugs' totals.
    const unaccounted = all.filter((s) => !(s in MATCH_FLOOR))
    expect(
      unaccounted,
      `these slugs have no entry in MATCH_FLOOR: ${unaccounted.join(", ")}. Measure what the drift gate matches for each (the count is 0 unless PREVIEW_TOKEN_ALIASES in oklch-drift.ts has a rule for its preview's naming) and record it.`
    ).toEqual([])
  })

  it("still compares at least as many declarations per slug as when measured", () => {
    const regressed: Array<string> = []
    for (const slug of all) {
      const floor = MATCH_FLOOR[slug]
      if (floor === undefined) continue
      const html = readFileSync(join(PREVIEW, slug, "light.html"), "utf8")
      const n = matchedCount(html, definitionsFor(slug))
      if (n < floor) regressed.push(`${slug}: ${n} < ${floor}`)
    }
    expect(
      regressed,
      `the drift gate now compares fewer declarations than when measured — ${regressed.join(", ")}. Something stopped matching; check readDefinitions, PREVIEW_TOKEN_ALIASES, and the scope rules in findPreviewDrift before lowering a floor.`
    ).toEqual([])
  })

  it("reads a nonzero number of declarations out of every preview that has them", () => {
    // Distinct from the check above: a slug can legitimately match no md name,
    // but a preview full of oklch declarations that the scanner sees NONE of is
    // always a scanner bug. codeit was exactly that — a `[data-theme="dark"]`
    // string inside a banner comment closed the light scope over all 91.
    for (const slug of all) {
      const html = readFileSync(join(PREVIEW, slug, "light.html"), "utf8")
      const declared = [...html.matchAll(/--[\w-]+:\s*oklch\(/g)].length
      if (declared === 0) continue
      expect(
        consideredCount(html),
        `${slug}/light.html declares ${declared} oklch custom properties and the scanner considered none of them — the whole file is silently unchecked`
      ).toBeGreaterThan(0)
    }
  })

  // Raising coverage is only worth anything if the comparisons it adds are
  // sound. `pnpm audit:oklch` is the shipping gate for this, but it is a
  // separate CI step, and a finding there reads as "a preview drifted" — which
  // is the wrong diagnosis when the fault is on the md side. Asserting it here
  // too means a bad comparison fails next to the coverage numbers that caused
  // it. This is what catches `wanted`: its md restates the same alias names
  // under a Dark heading, so a light preview value gets compared against a dark
  // md value and reports ten disagreements that do not exist.
  it("finds no drift anywhere in the catalogue", () => {
    const found: Array<string> = []
    for (const slug of all) {
      const html = readFileSync(join(PREVIEW, slug, "light.html"), "utf8")
      const defs = definitionsFor(slug)
      for (const d of findPreviewDrift(html, defs)) {
        found.push(
          `${slug} --${d.name}: preview ${d.preview}, md ${d.expected}`
        )
      }
    }
    expect(
      found,
      `the drift gate reports ${found.length} disagreement(s). Before editing a preview, check whether the md side is at fault — a token restated under a dark-scoped heading is read as the light definition unless readDefinitions skips it:\n${found.join("\n")}`
    ).toEqual([])
  })

  it("checks something in every slug the gate can reach", () => {
    // A floor of 0 says "this slug is not checked at all", which is a claim
    // worth making explicit rather than letting it sit in a table of numbers.
    // Only `bezier` is entitled to it — its preview has no `oklch` for any name
    // rule to reach. Any other slug at 0 means the gate went quiet on it.
    const unchecked = all.filter(
      (s) => s !== "bezier" && (MATCH_FLOOR[s] ?? 0) === 0
    )
    expect(
      unchecked,
      `these slugs are recorded as matching nothing: ${unchecked.join(", ")}. Only bezier is expected to, because its preview is hex rather than oklch. For anything else, add a rule to PREVIEW_TOKEN_ALIASES instead of recording a zero.`
    ).toEqual([])
  })
})
