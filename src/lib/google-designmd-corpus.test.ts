import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { lint } from "@google/design.md/linter"
import { buildDoc } from "./content-parser"
import { toGoogleDesignMd } from "./google-designmd-adapter"
import type { ServiceDoc, ServiceTokens } from "./content-types"

// Corpus gate: every committed catalog entry, rendered through the adapter and
// linted by the OFFICIAL spec linter. This is what `/services/{slug}/DESIGN.md`
// serves, so a regression here is a regression in what standard tooling reads.
//
// Kept separate from google-designmd-adapter.test.ts on purpose: that file pins
// the adapter's behaviour with synthetic fixtures, this one asks whether the
// real catalog still satisfies the published spec.

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
  yeogi: 1,
  // Multi-stop gradient values held in the colour ramp. The spec's Color type
  // is a single colour, so each gradient token fails to resolve.
  "seed-design": 12,
}

function loadDocs(): Array<ServiceDoc> {
  return fs
    .readdirSync(SERVICES_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort()
    .map((fileName) => {
      const raw = fs.readFileSync(path.join(SERVICES_DIR, fileName), "utf-8")
      const doc = buildDoc(`/services/${fileName}`, raw)
      const sidecar = path.join(
        SERVICES_DIR,
        `${doc.frontmatter.slug}.tokens.json`
      )
      if (!fs.existsSync(sidecar)) return doc
      const tokens = JSON.parse(
        fs.readFileSync(sidecar, "utf-8")
      ) as ServiceTokens
      return { ...doc, tokens }
    })
}

const docs = loadDocs()

describe("catalog → Google DESIGN.md", () => {
  it("has entries to check", () => {
    expect(docs.length).toBeGreaterThan(0)
  })

  it.each(docs.map((d) => [d.frontmatter.slug, d] as const))(
    "%s resolves its tokens into the spec model",
    (slug, doc) => {
      const report = lint(toGoogleDesignMd(doc))
      const ds = report.designSystem
      // A count of zero means the adapter emitted a document the spec reads as
      // an empty design system — the exact failure this whole route exists to
      // avoid. Typography is asserted separately because a palette with no type
      // scale still trips the spec's own `missing-typography`.
      expect(ds.colors.size, `${slug} colors`).toBeGreaterThan(0)
      expect(ds.typography.size, `${slug} typography`).toBeGreaterThan(0)
    }
  )

  it.each(docs.map((d) => [d.frontmatter.slug, d] as const))(
    "%s raises only the spec limitations we have recorded",
    (slug, doc) => {
      const report = lint(toGoogleDesignMd(doc))
      expect(report.summary.errors, `${slug} errors`).toBe(
        KNOWN_SPEC_LIMITATIONS[slug] ?? 0
      )
    }
  )

  it("leaves no YAML fence, and keeps every other fence", () => {
    // YAML fences are the ones that break the lint — the linter reads their rows
    // as top-level schema keys, which is how `wanted`'s component specs failed a
    // whole document. Nothing else does, measured across the corpus, so the
    // `tsx` and `css` snippets stay: stripping them too cost this endpoint
    // 17-25% of every document, including the code its `## Components` prose
    // refers to.
    for (const doc of docs) {
      const out = toGoogleDesignMd(doc)
      expect(out, `${doc.frontmatter.slug} yaml fence`).not.toMatch(/```ya?ml/i)
    }
    const withCode = docs.filter((d) =>
      /```(?:tsx|ts|css|html|json)/.test(toGoogleDesignMd(d))
    )
    // Pinned so a future "strip everything" regression shows up as a count drop
    // rather than as a quietly thinner endpoint.
    expect(withCode.length).toBeGreaterThan(10)
  })

  it("keeps every entry's heading order acceptable to the spec", () => {
    for (const doc of docs) {
      const rules = lint(toGoogleDesignMd(doc)).findings.map((f) =>
        String(f.rule ?? "model")
      )
      expect(rules, doc.frontmatter.slug).not.toContain("section-order")
    }
  })

  it("records which entries still lack a token literally named `primary`", () => {
    // Not a defect: the catalog names tokens as the brand publishes them
    // (`blue-500`, `grey-900`). The spec warns because an agent then has to
    // infer the key colour. Pinning the set makes any change deliberate —
    // adding `primary` to an entry is a semantic claim about that brand and
    // should be made on evidence, not by a passing edit.
    const missing = docs
      .filter((doc) =>
        lint(toGoogleDesignMd(doc)).findings.some(
          (f) => String(f.rule) === "missing-primary"
        )
      )
      .map((d) => d.frontmatter.slug)
    expect(missing).toEqual([
      "bezier",
      "codeit",
      "gmarket",
      "greeting",
      "krds",
      "kyobobook",
      "line-design-system",
      "seed-design",
      "socar",
      "teamsparta",
      "toss",
      "vapor-ui",
      "wanted",
      "yeogi",
    ])
  })
})

describe("raw catalog md, linted directly", () => {
  // The branch's headline claim is that an entry IS a spec document — a consumer
  // reading the raw md off GitHub gets tokens without going through our route.
  // Every other `lint()` call in this repo feeds `toGoogleDesignMd(doc)`, which
  // is rebuilt from the sidecar, so none of them can tell whether that claim
  // holds. This one lints the committed bytes.
  //
  // Asserted on token COUNTS, not on `summary.errors`. `wanted` proves why: the
  // linter reports zero errors for it while resolving zero tokens, so an
  // error-count assertion would sit green over exactly the failure that matters.

  const RAW_TOKENLESS: Record<string, string> = {
    // Its `## Components` fences each carry a column-0 `height:` row, which the
    // linter reads as a duplicate top-level schema section and fails the whole
    // document on. The fences hold component specs that neither the sidecar nor
    // the spec's token maps have a slot for, so they stay — and the adapter,
    // which strips body fences, is what makes this entry servable.
    wanted: "component-spec fences shadow the top-level schema",
  }

  it.each(docs.map((d) => [d.frontmatter.slug, d] as const))(
    "%s resolves its tokens straight from the file",
    (slug, doc) => {
      const ds = lint(doc.raw).designSystem
      if (slug in RAW_TOKENLESS) {
        // Pinned in BOTH directions: if this entry starts resolving, the reason
        // above is stale and the exception should be deleted, not widened.
        expect(ds.colors.size, `${slug} — ${RAW_TOKENLESS[slug]}`).toBe(0)
        return
      }
      expect(ds.colors.size, `${slug} colors`).toBeGreaterThan(0)
      expect(ds.typography.size, `${slug} typography`).toBeGreaterThan(0)
    }
  )

  it("keeps the raw-lintable share at 16 of 17", () => {
    const lintable = docs.filter(
      (d) => lint(d.raw).designSystem.colors.size > 0
    )
    expect(lintable.length).toBe(
      docs.length - Object.keys(RAW_TOKENLESS).length
    )
  })
})
