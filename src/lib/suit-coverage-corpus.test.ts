import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { coveredCodePoints } from "./font-cmap"

// The site draws its text in the SUIT file `src/styles.css` declares. That
// package ships more than one build of the face: the variable `.woff2` it uses
// is a subset, while `fonts/variable/ttf/SUIT-Variable.ttf` covers every Hangul
// syllable. A glyph the declared file lacks is drawn by a system font in the
// middle of a SUIT line, and nothing else would notice.
//
// So this asks the one question that can go quietly wrong: does any Hangul
// syllable the site can show fall outside the declared file? Symbols outside it
// (— ≤ ≥ and the like) are known and accepted, so they are not asserted here.
// The input is the catalogue and the screen sources as they stand, which is also
// what moves when a package upgrade swaps the subset.

const ROOT = fileURLToPath(new URL("../..", import.meta.url))
const FONT = join(
  ROOT,
  "node_modules/@sun-typeface/suit/fonts/variable/woff2/SUIT-Variable.woff2"
)

const HANGUL_SYLLABLE = /[가-힣]/gu

function filesUnder(
  dir: string,
  suffixes: ReadonlyArray<string>
): Array<string> {
  return readdirSync(join(ROOT, dir), { recursive: true, encoding: "utf8" })
    .filter(
      (rel) =>
        suffixes.some((suffix) => rel.endsWith(suffix)) &&
        !/\.test\.[a-z]+$/.test(rel)
    )
    .map((rel) => join(dir, rel))
}

const SHOWN_TEXT = [
  ...filesUnder("services", [".md", ".tokens.json"]),
  ...filesUnder("src/routes", [".tsx"]),
  ...filesUnder("src/components", [".tsx"]),
]

describe("SUIT glyph coverage", () => {
  const covered = coveredCodePoints(readFileSync(FONT))

  it("reads the font's own character table (parser sanity)", () => {
    // 가 is in every build; U+0378 is an unassigned code point no font maps.
    expect(covered.has("가".codePointAt(0)!)).toBe(true)
    expect(covered.has(0x0378)).toBe(false)
  })

  it("scans the catalogue and the screen sources (input is not empty)", () => {
    expect(SHOWN_TEXT.some((file) => file.startsWith("services"))).toBe(true)
    expect(SHOWN_TEXT.some((file) => file.startsWith("src"))).toBe(true)
  })

  it("covers every Hangul syllable the site can show", () => {
    const missing = new Map<string, Set<string>>()
    for (const file of SHOWN_TEXT) {
      for (const syllable of readFileSync(join(ROOT, file), "utf8").matchAll(
        HANGUL_SYLLABLE
      )) {
        if (covered.has(syllable[0].codePointAt(0)!)) continue
        const files = missing.get(syllable[0]) ?? new Set<string>()
        files.add(file)
        missing.set(syllable[0], files)
      }
    }
    const report = [...missing]
      .map(([syllable, files]) => `${syllable} (${[...files].join(", ")})`)
      .join("; ")
    expect(
      report,
      `these syllables are not in the SUIT file styles.css declares, so a system font would draw them mid-word: ${report}. Reword them, or switch the @font-face to a build that has them (the package's fonts/variable/ttf covers every syllable) and update the comment above it.`
    ).toBe("")
  })
})
