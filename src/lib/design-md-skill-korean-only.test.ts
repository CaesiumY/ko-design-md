import { describe, expect, it } from "vitest"
import {
  DESIGN_MD_AGENT_PATHS,
  DESIGN_MD_AUTHOR_AGENT,
  DESIGN_MD_RUBRIC_DESIGN,
  DESIGN_MD_RUBRIC_PREVIEW,
  DESIGN_MD_SKILL,
  DESIGN_MD_STITCH_FORMAT,
  DESIGN_MD_TEMPLATE,
  readRepoFile,
} from "./skill-asset-paths"

// docs/adr/0001-korean-design-md-only.md: an entry is one Korean design.md.
// The /design-md pipeline used to offer a `both` mode that wrote a
// `services/{slug}.en.md` companion, and its prompts carried that mode long
// after the decision — no `.en.md` file was ever produced, so nothing failed.
// `bad-lang` in draft-validator now blocks a non-Korean entry; this keeps the
// prompts from asking for one again.
const SURFACES = [
  DESIGN_MD_SKILL,
  DESIGN_MD_TEMPLATE,
  DESIGN_MD_RUBRIC_DESIGN,
  DESIGN_MD_RUBRIC_PREVIEW,
  DESIGN_MD_STITCH_FORMAT,
  ...DESIGN_MD_AGENT_PATHS,
  "CONTRIBUTING.md",
] as const

// Phrases that offer a second language. Specific on purpose: "both" alone is
// how these files talk about the two themes of one preview.
const BILINGUAL_PHRASES = [
  ".en.md",
  "primary_lang",
  "secondary_lang",
  "ko|en",
  "bilingual",
  "lang: en",
  "both (",
] as const

describe("/design-md produces Korean entries only", () => {
  it("never offers a second-language entry", () => {
    for (const path of SURFACES) {
      const text = readRepoFile(path).toLowerCase()
      for (const phrase of BILINGUAL_PHRASES) {
        expect(
          text.includes(phrase.toLowerCase()),
          `${path} still carries the bilingual phrase "${phrase}" — entries are Korean-only (docs/adr/0001-korean-design-md-only.md).`
        ).toBe(false)
      }
    }
  })

  // Without this the check above passes for a prompt that dropped `lang`
  // altogether, and the author would stop writing the field.
  it("still tells the author to write lang: ko", () => {
    for (const path of [DESIGN_MD_SKILL, DESIGN_MD_AUTHOR_AGENT]) {
      expect(readRepoFile(path), path).toContain("lang: ko")
    }
  })
})
