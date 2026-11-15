import { describe, expect, it } from "vitest"
import {
  DESIGN_MD_AUTHOR_AGENT,
  DESIGN_MD_REVIEWER_AGENT,
  DESIGN_MD_RUBRIC_DESIGN,
  DESIGN_MD_RUBRIC_PREVIEW,
  DESIGN_MD_SKILL,
  DESIGN_MD_STITCH_FORMAT,
  DESIGN_MD_TEMPLATE,
  PREVIEW_HTML_AUTHOR_AGENT,
  PREVIEW_HTML_REVIEWER_AGENT,
  PREVIEW_PROSE_AUDIT_SKILL,
  PREVIEW_RULES,
  readRepoFile,
} from "./skill-asset-paths"
import { OG_LEDE_MAX_CHARS } from "./og-lede"
import { TAGLINE_EXCLUSIVE_FORMS, TAGLINE_REPORT_LABEL } from "./tagline-lint"

// Wiring between the tagline line rule's prose copies and the code that holds
// it (#701). The rule's text lives once, in stitch-format.md 「Standard section
// order」; the prompts point there, and these tests hold what they name — the
// section, the gate's rule ids, the report line, the word list — to the source.

const CANON_SECTION = "Standard section order"

// Rule ids the draft gate can emit for the tagline line, read from the module
// that emits them.
const GATE_RULES = new Set(
  [
    ...readRepoFile("src/lib/tagline-lint.ts").matchAll(/"(tagline-[a-z-]+)"/g),
  ].map((m) => m[1])
)

const namedRules = (text: string) =>
  new Set([...text.matchAll(/`(tagline-[a-z-]+)`/g)].map((m) => m[1]))

function slice(text: string, from: string, to: string): string {
  const start = text.indexOf(from)
  expect(start, `"${from}" not found`).toBeGreaterThanOrEqual(0)
  const end = text.indexOf(to, start + from.length)
  return text.slice(start, end === -1 ? undefined : end)
}

const stage7 = () =>
  slice(readRepoFile(DESIGN_MD_SKILL), "## Stage 7 —", "## Stage 8 —")
const rubricTagline = () =>
  slice(
    readRepoFile(DESIGN_MD_RUBRIC_DESIGN),
    "**Tagline line**",
    "## Output JSON shape"
  )

describe("design-md tagline line rule", () => {
  // The format guide's rule caps the sentence at the length the share card
  // shows whole. That number lives in `og-lede.ts`; the prompt only restates it.
  it("states the share card's sentence limit from og-lede", () => {
    const guide = readRepoFile(DESIGN_MD_STITCH_FORMAT)
    const rule = guide.slice(guide.indexOf("**tagline line**"))
    const stated = rule.match(/(\d+) characters or fewer/)
    expect(
      stated,
      "tagline line rule no longer states a character limit"
    ).not.toBeNull()
    expect(Number(stated![1])).toBe(OG_LEDE_MAX_CHARS)
  })

  it("keeps the canon section the prompts point at", () => {
    // The rule opens the section, before its first numbered item.
    const opening = slice(
      readRepoFile(DESIGN_MD_STITCH_FORMAT),
      `## ${CANON_SECTION}`,
      "1. **Brand & Style**"
    )
    expect(
      opening,
      "the tagline line rule no longer opens the canon section"
    ).toContain("**tagline line**")
  })

  it.each([
    ["the author agent", () => readRepoFile(DESIGN_MD_AUTHOR_AGENT)],
    ["the reviewer agent", () => readRepoFile(DESIGN_MD_REVIEWER_AGENT)],
    ["rubric Item 5", rubricTagline],
    ["SKILL Stage 7", stage7],
    ["the template", () => readRepoFile(DESIGN_MD_TEMPLATE)],
  ])("%s points at the canon section", (_, read) => {
    const text = read()
    expect(text).toContain("stitch-format.md")
    expect(text).toContain(CANON_SECTION)
  })

  it("rubric Item 5 names every tagline rule the gate emits, and no other", () => {
    expect([...namedRules(rubricTagline())].sort()).toEqual(
      [...GATE_RULES].sort()
    )
  })

  it.each([
    ["the author agent", DESIGN_MD_AUTHOR_AGENT],
    ["the reviewer agent", DESIGN_MD_REVIEWER_AGENT],
    ["the skill", DESIGN_MD_SKILL],
  ])("%s names only tagline rules the gate emits", (_, path) => {
    for (const rule of namedRules(readRepoFile(path))) {
      expect(GATE_RULES, `${path} names ${rule}`).toContain(rule)
    }
  })

  // Stage 7 shows the count `validate:draft` prints instead of counting by eye.
  it("Stage 7 reads the tagline line validate:draft prints", () => {
    const text = stage7()
    expect(text).toContain("pnpm validate:draft")
    expect(text).toContain(`\`${TAGLINE_REPORT_LABEL}\``)
  })

  // The preview hero's line is the brand's slogan, not the entry's tagline
  // (ADR 0014). These files once called it a tagline.
  it.each([
    PREVIEW_HTML_AUTHOR_AGENT,
    PREVIEW_HTML_REVIEWER_AGENT,
    DESIGN_MD_RUBRIC_PREVIEW,
    PREVIEW_PROSE_AUDIT_SKILL,
    PREVIEW_RULES,
  ])("%s calls the hero's line a slogan", (path) => {
    expect(readRepoFile(path)).not.toMatch(/tagline|태그라인/i)
  })

  it("CODING_STANDARDS names the exclusive forms the gate searches", () => {
    const standards = readRepoFile("CODING_STANDARDS.md")
    const listed = standards.match(/draft 검사기 경고\(([^)]*)\)/)
    expect(
      listed,
      "the 출처 대조 line no longer lists the gate's forms"
    ).not.toBeNull()
    expect([...listed![1].matchAll(/`([^`]+)`/g)].map((m) => m[1])).toEqual([
      ...TAGLINE_EXCLUSIVE_FORMS,
    ])
  })
})
