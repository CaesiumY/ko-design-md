import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { findPreviewDrift, readDefinitions } from "./oklch-drift"

// `oklch-drift.test.ts` proves the algorithm on synthetic strings. Nothing
// proved it still reaches the catalogue — and it barely does. Measured over the
// shipped previews, the gate compares 22 declarations out of the 650 it looks
// at, and 14 of 17 slugs contribute nothing, because previews prefix their
// custom properties (`--tds-blue-500`) while the md keys are bare (`blue-500`).
// A regression in `readDefinitions` could take that 22 to 0 and every existing
// test would stay green.
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

// The floor, not the exact number. Previews change for legitimate reasons and
// the count moves with them; what must never happen is the total collapsing.
// Measured 22 on 2026-08-06 (11st 19, class101 2, seed-design 1).
const MATCH_FLOOR = 22

// Slugs whose preview names cannot reach their md names today, with the reason.
// Being listed here is not approval — it is the coverage gap written down where
// the next person will see it. A slug LEAVING this list is an improvement and
// does not fail; a slug JOINING it is a regression the total-floor check above
// catches.
const NO_MATCH_TODAY: Record<string, string> = {
  baemin: "preview `--bm-*`, md bare",
  bezier: "preview declares no oklch at all — it is hex",
  codeit: "preview `--ci-*`, md `codeit-*`",
  gmarket: "preview semantic + `--gds-*`, md palette names",
  greeting: "preview `--g-gray-0`, md `gray0` — prefix and hyphen both differ",
  krds: "preview `--krds-*`, md bare",
  kyobobook: "preview `--kds-*`, md bare",
  "line-design-system": "preview `--ldsg-linegreen`, md `ldsg-color-linegreen`",
  socar: "preview `--sf-*`, md bare",
  teamsparta: "preview `--sp-red`, md `brand-red`",
  toss: "preview `--tds-*`, md bare",
  "vapor-ui": "preview `--vp-*`, md bare",
  wanted: "preview `--w-*`, md bare",
  yeogi: "preview `--yg-*`, md `yeogi-*`",
}

describe("oklch-drift — catalogue coverage", () => {
  const all = slugs()

  it("finds previews to check", () => {
    expect(all.length).toBeGreaterThan(0)
  })

  it("still compares at least as many declarations as it did when measured", () => {
    let total = 0
    const perSlug: Array<string> = []
    for (const slug of all) {
      const html = readFileSync(join(PREVIEW, slug, "light.html"), "utf8")
      const defs = readDefinitions(
        readFileSync(join(SERVICES, `${slug}.md`), "utf8")
      )
      const n = matchedCount(html, defs)
      total += n
      if (n > 0) perSlug.push(`${slug} ${n}`)
    }
    expect(
      total,
      `the drift gate now compares ${total} declarations, below the ${MATCH_FLOOR} measured on 2026-08-06 (${perSlug.join(", ")}). Something stopped matching — check readDefinitions' regex and the scope rules in findPreviewDrift before lowering this floor.`
    ).toBeGreaterThanOrEqual(MATCH_FLOOR)
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

  it("documents which slugs match no md token name, and why", () => {
    const measured: Array<string> = []
    for (const slug of all) {
      const html = readFileSync(join(PREVIEW, slug, "light.html"), "utf8")
      const defs = readDefinitions(
        readFileSync(join(SERVICES, `${slug}.md`), "utf8")
      )
      if (matchedCount(html, defs) === 0) measured.push(slug)
    }
    // Only one direction is a failure. A slug that starts matching has been
    // fixed, so drop it from the map; a slug that stops matching is caught by
    // the floor assertion, not here.
    const unexplained = measured.filter((s) => !(s in NO_MATCH_TODAY))
    expect(
      unexplained,
      `these slugs now match no md token name and are not in NO_MATCH_TODAY — the drift gate is not checking them at all: ${unexplained.join(", ")}`
    ).toEqual([])
  })
})
