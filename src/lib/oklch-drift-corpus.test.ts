import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  definitionsForSlug,
  findPreviewDrift,
  findRoleChainDrift,
  roleChainCoverage,
  roleChainsForSlug,
} from "./oklch-drift"
import { lightScopeFile, resolvePreviewLayout } from "./preview-layout"
import type { RoleChains } from "./oklch-drift"

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

/**
 * Declarations the gate compares: oklch literals that matched an md token
 * name, plus role properties wired by `var()` that an md reference row names.
 */
function matchedCount(html: string, slug: string): number {
  const names = new Map<string, string>()
  for (const key of definitionsFor(slug).keys()) names.set(key, SENTINEL)
  return findPreviewDrift(html, names).length + chainedCount(html, slug)
}

/** Role properties whose `var()` the role-chain check compares. */
function chainedCount(html: string, slug: string): number {
  return roleChainCoverage(html, chainsFor(slug)).chained
}

// Calls the same functions `scripts/audit-oklch.ts` calls, rather than
// assembling the pipeline again here. Rebuilding it would let the script change
// underneath these assertions while they kept passing — which is the failure
// this file was written to make impossible, reproduced inside the file itself.
function definitionsFor(slug: string): Map<string, string> {
  return definitionsForSlug(
    readFileSync(join(SERVICES, `${slug}.md`), "utf8"),
    slug
  )
}

function chainsFor(slug: string): RoleChains {
  return roleChainsForSlug(
    readFileSync(join(SERVICES, `${slug}.md`), "utf8"),
    slug
  )
}

// Ask which file holds the light scope rather than joining "light.html".
//
// The hardcoded name was itself a way to check nothing: a slug converted to a
// single `preview.html` would drop out of `slugs()` entirely, taking its
// MATCH_FLOOR entry, its scanner-coverage assertion and its no-drift assertion
// with it — and the suite would stay green on the slugs that had not been
// converted yet. That is the same silent-zero this file exists to prevent,
// arriving through the door the file did not watch.
function lightScope(slug: string): { file: string; html: string } {
  const layout = resolvePreviewLayout((file) =>
    existsSync(join(PREVIEW, slug, file))
  )
  // Unreachable for slugs from `slugs()`, which filters on the same predicate.
  if (layout === null) throw new Error(`${slug}: no usable preview layout`)
  const file = lightScopeFile(layout)
  return { file, html: readFileSync(join(PREVIEW, slug, file), "utf8") }
}

function slugs(): Array<string> {
  if (!existsSync(PREVIEW)) return []
  return readdirSync(PREVIEW, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name)
    .filter(
      (s) =>
        resolvePreviewLayout((file) => existsSync(join(PREVIEW, s, file))) !==
          null && existsSync(join(SERVICES, `${s}.md`))
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
//
// Since #660 a count also holds the role properties the role-chain check
// compares (`findRoleChainDrift`): a `--role: var(--step)` declaration whose
// role an md reference row names, in either theme scope. So a role whose
// `var()` is turned into a literal, or stops being declared, drops the count
// too. Raised then to what was measured; the per-slug split is light + dark.
const MATCH_FLOOR: Partial<Record<string, number>> = {
  "11st": 19,
  baemin: 38,
  // 181 oklch + 108 light and 95 dark role chains (#660).
  banksalad: 384,
  // bezier's preview declares no `oklch` at all — it is hex — so only its role
  // chains are compared: 4 light and 5 dark, read through the per-family
  // `c-` rules (#660). Its alpha roles are `rgba(…)` literals and stay out.
  bezier: 9,
  class101: 14,
  // 8 → 60 (#660): its docs role names (`txt-`, `bg-`) and its `light-`
  // palette steps got rules, so the light palette is compared as values (47)
  // and 13 role chains are compared.
  codeit: 60,
  // 27 → 25 (#629): the twelve role properties now take `var()` of the palette
  // steps the md reference rows name, and the gate compares those ten steps
  // instead — two role pairs share gray-900 and gray-400. 25 → 37 (#660): the
  // twelve role chains are compared again, as chains.
  gmarket: 37,
  greeting: 13,
  // POP's two tokens are deliberately absent from the preview CSS — the entry
  // records that GS Retail licenses that mark from Samsung Securities and asks
  // that its resources not be redistributed, so 21 of 23 is the whole palette
  // this preview is allowed to declare.
  "gs-retail": 21,
  "gs-shop": 52,
  krds: 33,
  kyobobook: 41,
  "lg-electronics": 67,
  // 23 oklch + 11 light role chains (#660); the dark half writes literals.
  likelion: 34,
  "line-design-system": 24,
  nol: 37,
  remember: 39,
  // 142 oklch + 31 light and 30 dark role chains (#660).
  ridi: 203,
  // samsung-one-ui's preview declares the md tokens under their exact md names
  // (--primary, --dark-black, …), so no PREVIEW_TOKEN_ALIASES rule is needed.
  "samsung-one-ui": 7,
  "seed-design": 27,
  // 40 → 31 (#630): socar's roles became reference rows, which carry no
  // `oklch` for the gate to read, so the preview's 24 role properties now read
  // `var(--sf-<palette step>)` and are no longer compared as values; the 12
  // palette steps they point at, and the three overlays (dim and two press),
  // were added to the preview and are. 40 − 24 + 12 + 3. 31 → 79 (#660): the
  // 24 role chains are compared in the light scope and again in the dark one,
  // which restates them (SOCAR Frame is light-only).
  socar: 79,
  teamsparta: 18,
  toss: 27,
  // 36 → 106 (#660): 69 role chains, once the role layer's short preview
  // names (`color-background-` as `vp-bg-`, and the rest) got rules.
  "vapor-ui": 106,
  wanted: 53,
  yeogi: 29,
  zigbang: 43,
}

// Role properties the role-chain check reads, per slug, EXACT (#660): `chained`
// are wired by one `var()` and compared, `literal` are written as values and
// left out, both counted once per scope at its last theme-root declaration;
// `scoped` are role declarations outside a theme-root block (`.inverse { … }`,
// `:root` inside `@media`), each counted, which the check neither compares nor
// lets hide the root value. None of the catalogue's previews writes one today.
// Slugs absent here compare none: teamsparta, greeting and seed-design carry
// reference rows, but their previews wire roles under names of their own
// (`--text`, `--success`) that no leading-substring rule reaches, and toss's
// two rows (`primary`, `greyBackground`) are not declared in its preview.
const ROLE_CHAINS: Record<
  string,
  { chained: number; literal: number; scoped: number }
> = {
  banksalad: { chained: 203, literal: 0, scoped: 0 },
  // The 43 literals are its opacity roles, written `rgba(…)`.
  bezier: { chained: 9, literal: 43, scoped: 0 },
  codeit: { chained: 13, literal: 3, scoped: 0 },
  // GDS and likelion publish no dark palette; the previews' dark halves give
  // those roles literal dark values of their own.
  gmarket: { chained: 12, literal: 12, scoped: 0 },
  likelion: { chained: 11, literal: 10, scoped: 0 },
  ridi: { chained: 61, literal: 1, scoped: 0 },
  socar: { chained: 48, literal: 0, scoped: 0 },
  "vapor-ui": { chained: 69, literal: 1, scoped: 0 },
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
    // Report the measured count, not just the name. Nothing else in the repo
    // prints it, so a message that only says "record a number" leaves the
    // reader with no way to obtain one — and recording a 0 is refused below.
    const measured = unaccounted.map((slug) => {
      const { html } = lightScope(slug)
      return `${slug} (matches ${matchedCount(html, slug)} today)`
    })
    expect(
      unaccounted,
      `these slugs have no entry in MATCH_FLOOR: ${measured.join(", ")}. Record that count. A count of 0 means PREVIEW_TOKEN_ALIASES in oklch-drift.ts has no rule for this preview's naming — add the rule first, then re-read the number.`
    ).toEqual([])
  })

  it("still compares at least as many declarations per slug as when measured", () => {
    const regressed: Array<string> = []
    for (const slug of all) {
      const floor = MATCH_FLOOR[slug]
      if (floor === undefined) continue
      const { html } = lightScope(slug)
      const n = matchedCount(html, slug)
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
      const { file, html } = lightScope(slug)
      const declared = [...html.matchAll(/--[\w-]+:\s*oklch\(/g)].length
      if (declared === 0) continue
      expect(
        consideredCount(html),
        `${slug}/${file} declares ${declared} oklch custom properties and the scanner considered none of them — the whole file is silently unchecked`
      ).toBeGreaterThan(0)
    }
  })

  it("checks something in every slug the gate can reach", () => {
    // A floor of 0 says "this slug is not checked at all", which is a claim
    // worth making explicit rather than letting it sit in a table of numbers.
    // bezier used to be entitled to it — its preview has no `oklch` — until
    // its role chains were compared (#660). Any slug at 0 means the gate went
    // quiet on it.
    const unchecked = all.filter((s) => (MATCH_FLOOR[s] ?? 0) === 0)
    expect(
      unchecked,
      `these slugs are recorded as matching nothing: ${unchecked.join(", ")}. Add a rule to PREVIEW_TOKEN_ALIASES instead of recording a zero.`
    ).toEqual([])
  })

  it("finds every preview's roles wired where the md reference rows point", () => {
    // `pnpm audit:oklch` gates this; it is asserted here too so the mutation
    // below starts from a clean preview, and so `pnpm test` names the role.
    const drifted = all.flatMap((slug) =>
      findRoleChainDrift(lightScope(slug).html, chainsFor(slug)).map(
        (f) => `${slug} ${f.scope} --${f.name}: ${f.preview}, md ${f.expected}`
      )
    )
    expect(drifted).toEqual([])
  })

  it("compares exactly the role chains recorded per slug", () => {
    // Exact, unlike MATCH_FLOOR: a rise can be a role newly wired, and a rise in
    // `literal` is a role newly declared as a value where its md row points at
    // a palette step, which the chain comparison does not read. #648 pinned
    // both for socar alone (24 roles compared, none as literals); this keeps
    // that for every slug.
    const measured = Object.fromEntries(
      all
        .map(
          (slug) =>
            [
              slug,
              roleChainCoverage(lightScope(slug).html, chainsFor(slug)),
            ] as const
        )
        .filter(([, c]) => c.chained + c.literal + c.scoped > 0)
    )
    expect(measured).toEqual(ROLE_CHAINS)
  })

  it("fails a role wired to another palette step in every slug that has a chain", () => {
    // The mutation #660 is about, run on the real previews through the real
    // check: repoint one role's `var()` at another step the same slug's rows
    // name. Each slug whose role chains are compared must report exactly that
    // role, so no slug's chain comparison can be silently inert.
    const reached: Array<string> = []
    for (const slug of all) {
      const { html } = lightScope(slug)
      const chains = chainsFor(slug)
      if (chainedCount(html, slug) === 0) continue
      const steps = new Set([...chains.light.values()].map(([step]) => step))
      // The first light role the preview really wires by `var()`.
      const wired = [...chains.light].find(([role, [step]]) =>
        new RegExp(`--${role}:\\s*var\\(--${step}\\)`).test(html)
      )
      expect(wired, `${slug}: no light role wired by var()`).toBeDefined()
      if (wired === undefined) continue
      const [role, [step]] = wired
      const other = [...steps].find((s) => s !== step)
      expect(other, `${slug}: a second palette step`).toBeDefined()
      const declared = new RegExp(`(--${role}:\\s*)var\\(--${step}\\)`)
      const repoint = `$1var(--${other})`
      // A correct wiring restated where it holds only for part of the page,
      // which must not hide the wrong base value.
      const localFix = `<style>.chip { --${role}: var(--${step}); }
        @media (min-width: 1000px) { :root { --${role}: var(--${step}); } }</style>`
      const mutations = {
        // Every declaration of it, in both scopes.
        all: html.replace(new RegExp(declared.source, "g"), repoint),
        // Only the earlier one, the light theme root.
        earlier: html.replace(declared, repoint),
        // The earlier one, with a scoped and a conditional fix after it.
        "earlier + local fix": html.replace(declared, repoint) + localFix,
      }
      for (const [kind, mutated] of Object.entries(mutations)) {
        const found = findRoleChainDrift(mutated, chains)
        expect(
          found.length,
          `${slug} (${kind}): --${role} repointed`
        ).toBeGreaterThan(0)
        expect(
          found.every((f) => f.name === role),
          `${slug} (${kind}): only --${role} reported`
        ).toBe(true)
      }
      reached.push(slug)
    }
    expect(reached).toEqual(
      Object.entries(ROLE_CHAINS)
        .filter(([, c]) => c.chained > 0)
        .map(([slug]) => slug)
    )
  })
})
