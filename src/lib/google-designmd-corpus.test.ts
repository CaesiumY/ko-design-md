import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { lint } from "@google/design.md/linter"

// Corpus gate: every committed catalog entry, linted AS COMMITTED by the
// OFFICIAL spec linter. The file is what `/services/{slug}/DESIGN.md` serves —
// no adapter reshapes it (#421) — so a regression here is a regression in what
// standard tooling reads, whether it fetches the route or the raw file.

const SERVICES_DIR = path.resolve(process.cwd(), "services")

/**
 * Errors the spec raises that are NOT catalog defects — the catalog expresses
 * something the `alpha` schema has no slot for. Conforming would mean deleting
 * real published values, so these are recorded rather than fixed.
 *
 * Keep this map exact. It is a ratchet: a slug whose count moves in either
 * direction fails, so neither a new error nor a silently-fixed one slips by.
 */
const KNOWN_SPEC_LIMITATIONS: Record<string, number> = {
  // `border-radius: 50%` / `42%` — valid CSS, but the spec's Dimension type
  // accepts only px, em and rem.
  "11st": 1,
  baemin: 1,
  bezier: 1,
  "line-design-system": 1,
  remember: 1,
  yeogi: 1,
  // Multi-stop gradient values held in the colour ramp. The spec's Color type
  // is a single colour, so each gradient token fails to resolve.
  "seed-design": 12,
}

// Empty now, and that is the point: every entry publishes a type scale.
// `samsung-one-ui` was the lone exception until its ladder was found — the 2019
// guidelines publish nine component sizes on p.65, but the table body is vector
// outline rather than a text layer (that page embeds no Roboto), so every text
// extraction of the PDF came back blank and the entry was onboarded asserting
// the ladder did not exist. Rendering the page reads it.
//
// Keep the map rather than deleting it. A publisher that genuinely ships no type
// scale should be recorded here with its reason — "our extraction found
// nothing" is not one.
const NO_TYPE_SCALE: Record<string, string> = {}

/**
 * Components each entry publishes in the spec's `components:` map. Every other
 * token count here is only asserted non-zero; this one is exact, because a
 * component map that failed to resolve reads as 0 and a new one appearing on an
 * entry nobody meant to touch should be a deliberate edit too.
 *
 * teamsparta is the pilot (#384): its ten components that fit the spec's eight
 * properties without dropping a row. The body spec fences stay as `text`.
 */
const COMPONENT_COUNTS: Record<string, number> = {
  teamsparta: 10,
}

const docs = fs
  .readdirSync(SERVICES_DIR)
  .filter((f) => f.endsWith(".md"))
  .sort()
  .map((fileName) => ({
    slug: fileName.replace(/\.md$/, ""),
    raw: fs.readFileSync(path.join(SERVICES_DIR, fileName), "utf-8"),
  }))

const reports = new Map(docs.map((d) => [d.slug, lint(d.raw)]))
function reportOf(slug: string): ReturnType<typeof lint> {
  const report = reports.get(slug)
  if (!report) throw new Error(`missing entry: ${slug}`)
  return report
}
function rulesOf(slug: string): Array<string> {
  return reportOf(slug).findings.map((f) => String(f.rule ?? "model"))
}

describe("catalog md, linted as the standard DESIGN.md", () => {
  it("has entries to check", () => {
    expect(docs.length).toBeGreaterThan(0)
  })

  // Asserted on token COUNTS, not on `summary.errors` — and do not "simplify" it
  // to the latter. The linter returns its parse and duplicate-section failures as
  // `recoverable`, so a document it resolved NOTHING from still reports
  // `errors: 0`. `wanted` was the standing proof until its `## Components`
  // fences were nested: the linter merges frontmatter and every body yaml fence
  // into ONE namespace, so seven key names shared across twelve fences read as
  // duplicate schema sections and zeroed the document at `errors: 0`.
  it.each(docs.map((d) => d.slug))(
    "%s resolves its tokens straight from the file",
    (slug) => {
      const ds = reportOf(slug).designSystem
      expect(ds.colors.size, `${slug} colors`).toBeGreaterThan(0)
      if (slug in NO_TYPE_SCALE) {
        // Pinned in BOTH directions: if this entry starts publishing a ladder,
        // the reason above is stale and the exception should be deleted.
        expect(ds.typography.size, `${slug} — ${NO_TYPE_SCALE[slug]}`).toBe(0)
      } else {
        expect(ds.typography.size, `${slug} typography`).toBeGreaterThan(0)
      }
      expect(ds.components.size, `${slug} components`).toBe(
        COMPONENT_COUNTS[slug] ?? 0
      )
    }
  )

  it.each(docs.map((d) => d.slug))(
    "%s raises only the spec limitations we have recorded",
    (slug) => {
      expect(reportOf(slug).summary.errors, `${slug} errors`).toBe(
        KNOWN_SPEC_LIMITATIONS[slug] ?? 0
      )
    }
  )

  it("reads no body fence as schema", () => {
    // The linter reads every body yaml fence as top-level schema keys. Before
    // #421 that surfaced as exactly these two rules — remember `motion`, toss
    // `ease`, wanted `job-card` — and was the only thing the removed adapter
    // still hid. `body-yaml-fence` blocks the shape upstream; this pins what
    // the linter itself sees.
    for (const { slug } of docs) {
      const rules = rulesOf(slug)
      expect(rules, slug).not.toContain("unknown-key")
      expect(rules, slug).not.toContain("token-like-ignored")
    }
  })

  it("keeps every entry's heading order acceptable to the spec", () => {
    for (const { slug } of docs) {
      expect(rulesOf(slug), slug).not.toContain("section-order")
    }
  })

  it("records which entries still lack a token literally named `primary`", () => {
    // Not a defect: the catalog names tokens as the brand publishes them
    // (`blue-500`, `grey-900`). The spec warns because an agent then has to
    // infer the key colour. Pinning the set makes any change deliberate —
    // adding `primary` to an entry is a semantic claim about that brand and
    // should be made on evidence, not by a passing edit.
    const missing = docs
      .filter(({ slug }) => rulesOf(slug).includes("missing-primary"))
      .map((d) => d.slug)
    expect(missing).toEqual([
      "bezier",
      "codeit",
      "gmarket",
      "greeting",
      "gs-retail",
      "gs-shop",
      "kyobobook",
      "likelion",
      "line-design-system",
      "seed-design",
      "vapor-ui",
      "wanted",
      "yeogi",
    ])
  })
})
