import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { readPreviewSlugs } from "../../scripts/audit-contrast-slugs"
import {
  DARK_COPY_BACKLOG,
  DARK_OVERRIDE_RULES,
  backlogDrift,
  darkCopyVerdict,
} from "./dark-sheet-backlog"
import { readPreviewHalves } from "./preview-halves"
import { darkSheetReport } from "./preview-validator"
import type { DarkSheetReport } from "./preview-validator"

// The two records in `dark-sheet-backlog.ts`, held to the shipped previews.
//
// `validate:previews` already judges each preview against the not-yet-walked
// list. What it cannot see is the list itself going wrong — a slug on it with
// no preview behind it, or a slug put on it to turn a block into a warning —
// or the second record at all: the number of dark rules written outside tokens
// is not a property of one document being right or wrong, it is a number that
// must not move unannounced.

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

describe("backlogDrift — the list held against its pin", () => {
  it("names a new slug put on the list", () => {
    expect(backlogDrift(["toss", "newcomer"], ["toss"])).toEqual({
      added: ["newcomer"],
      walked: [],
    })
  })
  // A set frozen at the first day's members would wave this one through: the
  // walked slug would still be in it. The pin lost the slug when it was walked.
  it("names a walked slug put back on the list", () => {
    expect(backlogDrift(["toss", "krds"], ["toss"])).toEqual({
      added: ["krds"],
      walked: [],
    })
  })
  it("names a slug taken off the list and left in the pin", () => {
    expect(backlogDrift(["toss"], ["toss", "krds"])).toEqual({
      added: [],
      walked: ["krds"],
    })
  })
  it("is quiet when the two agree, in any order", () => {
    expect(backlogDrift(["toss", "krds"], ["krds", "toss"])).toEqual({
      added: [],
      walked: [],
    })
  })
})

// The list's lock. A test reads the tree and not its history, so "nothing is
// added" can only be held by a second copy: putting a slug on the list takes
// an edit here as well, and this is the edit the failure below refuses. It is
// a duplicate on purpose, one slug a line so previews walked in parallel PRs
// do not collide, and it leaves with the list (#738).
const PINNED_BACKLOG = [
  "11st",
  "baemin",
  "class101",
  "codeit",
  "gmarket",
  "greeting",
  "kyobobook",
  "line-design-system",
  "samsung-one-ui",
  "seed-design",
  "teamsparta",
  "wanted",
  "yeogi",
]

describe("the not-yet-walked list against its pin", () => {
  const { added, walked } = backlogDrift(DARK_COPY_BACKLOG, PINNED_BACKLOG)

  it("has had no slug added to it", () => {
    expect(
      added,
      `put on DARK_COPY_BACKLOG (src/lib/dark-sheet-backlog.ts): ${added.join(", ")}. The list only shrinks. Do not add a slug to it, and do not add it to PINNED_BACKLOG here to get past this: walk the copies out of the preview instead. \`pnpm validate:previews --slug <slug> --verbose\` names them and says how.`
    ).toEqual([])
  })

  it("has no walked slug left in the pin", () => {
    expect(
      walked,
      `off DARK_COPY_BACKLOG and still in PINNED_BACKLOG: ${walked.join(", ")}. A walked slug leaves both. Take the line(s) out of PINNED_BACKLOG in this file.`
    ).toEqual([])
  })
})

describe("the dark sheets of the shipped catalogue", () => {
  // Merged previews only: a split pair has no dark sheet to read against light
  // (see `checkDarkSheetCopy`). So that a preview cannot leave these checks by
  // shipping as two files, none may: "ships no preview as two files" below. A
  // directory with no usable preview at all is `missing-preview-file` in
  // `validate:previews`.
  const { slugs, split } = readPreviewSlugs(PREVIEW)

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

  it("ships no preview as two files", () => {
    expect(
      split,
      `shipped as light.html + dark.html: ${split.join(", ")}. Ship one preview.html carrying both themes instead: the light rules written bare, and a last <style> that says only what dark changes, under [data-theme="dark"] (.claude/rules/preview.md). The dark-sheet checks (dark-sheet-copy, dark-scope-unread, the rule count recorded in DARK_OVERRIDE_RULES) read one document and judge nothing in a pair, where dark.html is the whole page written again. The site's preview frame asks for preview.html as well, so a pair is a preview no visitor is shown.`
    ).toEqual([])
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
          ? `${slug} is not on the not-yet-walked list, but its [data-theme="dark"] sheet restates ${copies.length} light rule(s). \`pnpm validate:previews --slug ${slug} --verbose\` names them and says how to fix them; do not add the slug to DARK_COPY_BACKLOG, which only shrinks (the pin in this file fails an addition).`
          : `${slug} is on the not-yet-walked list, but its dark sheet no longer restates any light rule. Take it out of DARK_COPY_BACKLOG in src/lib/dark-sheet-backlog.ts, and out of PINNED_BACKLOG in this file.`
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
          ? `${slug}: ${overrideRules} [data-theme="dark"] rule(s) set something other than a custom property to a value light does not give it, and ${recorded} are recorded. Write the colour as a token redefined under [data-theme="dark"] instead. Where a token cannot carry the change, ${line} DARK_OVERRIDE_RULES (src/lib/dark-sheet-backlog.ts) and say in the PR what the rule is for. Before recording it, check that the rules are not light rules written again: a dark rule that finds no light rule to be read against is counted here whatever it says, so a copy behind a selector the copy check cannot pair (a scope that does not name the dark theme, a renamed class, a light rule written under [data-theme="light"], one selector out of a light rule's list) arrives as this number and not as dark-sheet-copy. Such a rule is a copy all the same and is not recorded. Where the light rule sits under a scope of its own, write it bare so that dark has it too, and the dark rule is left with what it changes; where the dark rule repeats one selector of a light list, move what differs into a token redefined under [data-theme="dark"] and let the rest go. Either way compare the rendering before and after with \`pnpm preview:dom-diff\`. What is counted is defined at darkSheetReport (src/lib/preview-validator.ts).`
          : `${slug}: ${overrideRules} [data-theme="dark"] rule(s) set something other than a custom property to a value light does not give it, fewer than the ${recorded} recorded. The record follows the preview down: ${line} DARK_OVERRIDE_RULES (src/lib/dark-sheet-backlog.ts).`
      ).toBe(recorded)
    })
  }
})
