import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
  ALL_SKILL_ASSET_PATHS,
  INTERNAL_SKILLS,
  PUBLIC_SKILLS,
  SKILLS_DIR,
} from "./skill-asset-paths"

// Without this, a renamed skill file surfaces as an ENOENT thrown from whichever
// contract test happened to read it first — a stack trace about `readFileSync`
// rather than "this asset moved". Checking the registry directly names the
// missing path.
describe("skill asset path registry", () => {
  it.each(ALL_SKILL_ASSET_PATHS)("%s exists on disk", (path) => {
    expect(existsSync(join(process.cwd(), path))).toBe(true)
  })

  it("points every declared skill at a real directory", () => {
    for (const slug of [...PUBLIC_SKILLS, ...INTERNAL_SKILLS]) {
      expect(
        existsSync(join(process.cwd(), SKILLS_DIR, slug, "SKILL.md")),
        `${slug} has no SKILL.md`
      ).toBe(true)
    }
  })
})
