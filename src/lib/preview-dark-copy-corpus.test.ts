import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { readPreviewSlugs } from "../../scripts/audit-contrast-slugs"
import {
  DARK_COPY_BACKLOG,
  DARK_OVERRIDE_RULES,
  darkCopyVerdict,
} from "./dark-sheet-backlog"
import { readPreviewHalves } from "./preview-halves"
import { darkSheetReport } from "./preview-validator"
import type { DarkSheetReport } from "./preview-validator"

// The two records in `dark-sheet-backlog.ts`, held to the shipped previews.
//
// `validate:previews` already judges each preview against the not-yet-walked
// list. What it cannot see is the list itself going wrong — a slug on it with
// no preview behind it — or the second record at all: the number of dark rules
// written outside tokens is not a property of one document being right or
// wrong, it is a number that must not move unannounced.

const ROOT = fileURLToPath(new URL("../..", import.meta.url))
const PREVIEW = join(ROOT, "public", "preview")

describe("darkCopyVerdict — the three cases of the list, and the quiet one", () => {
  it("warns on a listed slug that still has copies", () => {
    expect(darkCopyVerdict(true, 12)).toBe("warn")
  })
  it("blocks an unlisted slug that has copies", () => {
    expect(darkCopyVerdict(false, 1)).toBe("block")
  })
  it("calls a listed slug with no copies stale", () => {
    expect(darkCopyVerdict(true, 0)).toBe("stale")
  })
  it("is clean for an unlisted slug with no copies", () => {
    expect(darkCopyVerdict(false, 0)).toBe("clean")
  })
})

describe("the dark sheets of the shipped catalogue", () => {
  // Merged previews only: a split pair has no dark sheet to read against light
  // (see `checkDarkSheetCopy`).
  const { slugs } = readPreviewSlugs(PREVIEW)

  const reports = new Map<string, DarkSheetReport>()
  function reportOf(slug: string): DarkSheetReport {
    const cached = reports.get(slug)
    if (cached !== undefined) return cached
    const halves = readPreviewHalves(join(PREVIEW, slug))
    if (halves === null) throw new Error(`${slug}: no usable preview layout`)
    const report = darkSheetReport(halves.light, halves.dark)
    reports.set(slug, report)
    return report
  }

  it("finds previews to check", () => {
    // A silent zero here would make every assertion below vacuous.
    expect(slugs.length).toBeGreaterThan(0)
  })

  it("lists only slugs that ship a merged preview", () => {
    const orphans = [...DARK_COPY_BACKLOG].filter((s) => !slugs.includes(s))
    expect(
      orphans,
      `on the not-yet-walked list with no merged preview to walk: ${orphans.join(", ")}. Take them out of DARK_COPY_BACKLOG in src/lib/dark-sheet-backlog.ts.`
    ).toEqual([])
  })

  it("records a rule count only for slugs that ship a merged preview", () => {
    const orphans = Object.keys(DARK_OVERRIDE_RULES).filter(
      (s) => !slugs.includes(s)
    )
    expect(
      orphans,
      `counted in DARK_OVERRIDE_RULES with no merged preview behind the number: ${orphans.join(", ")}. Take the lines out of src/lib/dark-sheet-backlog.ts.`
    ).toEqual([])
  })

  for (const slug of slugs) {
    it(`${slug}: copies in the dark sheet agree with the not-yet-walked list`, () => {
      const listed = DARK_COPY_BACKLOG.has(slug)
      const { copies } = reportOf(slug)
      const verdict = darkCopyVerdict(listed, copies.length)
      expect(
        verdict,
        verdict === "block"
          ? `${slug} is not on the not-yet-walked list, but its [data-theme="dark"] sheet restates ${copies.length} light rule(s). \`pnpm validate:previews --slug ${slug} --verbose\` names them and says how to fix them; do not add the slug to DARK_COPY_BACKLOG, which only shrinks.`
          : `${slug} is on the not-yet-walked list, but its dark sheet no longer restates any light rule. Take it out of DARK_COPY_BACKLOG in src/lib/dark-sheet-backlog.ts.`
      ).toBe(listed ? "warn" : "clean")
    })

    it(`${slug}: the number of dark rules written outside tokens is the recorded one`, () => {
      const recorded = DARK_OVERRIDE_RULES[slug] ?? 0
      const { overrideRules } = reportOf(slug)
      const line =
        overrideRules === 0
          ? `remove the "${slug}" line from`
          : `set "${slug}": ${overrideRules} in`
      expect(
        overrideRules,
        overrideRules > recorded
          ? `${slug}: ${overrideRules} [data-theme="dark"] rule(s) set something other than a custom property to a value light does not give it, and ${recorded} are recorded. Write the colour as a token redefined under [data-theme="dark"] instead. Where a token cannot carry the change, ${line} DARK_OVERRIDE_RULES (src/lib/dark-sheet-backlog.ts) and say in the PR what the rule is for. Before recording it, check that the rules are not light rules written again: a dark rule that finds no light rule to be read against is counted here whatever it says, so a copy behind a selector the copy check cannot pair (a scope that is not a leading [data-theme="dark"], a renamed class) arrives as this number and not as dark-sheet-copy. What is counted is defined at darkSheetReport (src/lib/preview-validator.ts).`
          : `${slug}: ${overrideRules} [data-theme="dark"] rule(s) set something other than a custom property to a value light does not give it, fewer than the ${recorded} recorded. The record follows the preview down: ${line} DARK_OVERRIDE_RULES (src/lib/dark-sheet-backlog.ts).`
      ).toBe(recorded)
    })
  }
})
