import { readFileSync, readdirSync } from "node:fs"
import { join, sep } from "node:path"
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
// syllable or compatibility jamo (ㄱ…ㅎ, the category index letters) in the
// catalogue and source files fall outside the declared file? Symbols outside it
// (— ≤ ≥ and the like) are known and accepted, so they are not asserted here.
// Text a visitor types (the home search box, `?q=`) is not in those files and
// is not covered; see the comment above the @font-face.
//
// The file is read from the `@font-face` in `src/styles.css`, not from a path
// written here, so changing that declaration changes what is checked.
//
// Screen text comes from the catalogue, the routes and components, and data
// modules under `src/lib` (category names, for one). Telling those apart by path
// would let a new one slip through, so every non-test `.ts`/`.tsx` under `src`
// is read, which also takes in developer-facing messages: a rare syllable there
// fails this too. `src/og` is left out: social cards draw with their own
// Pretendard files, not this font.

const ROOT = fileURLToPath(new URL("../..", import.meta.url))

// Hangul syllables, then compatibility jamo (U+3131–U+318E).
const HANGUL = /[가-힣ㄱ-ㆎ]/gu

function declaredFontPath(): string | null {
  const css = readFileSync(join(ROOT, "src/styles.css"), "utf8")
  const face = css
    .match(/@font-face\s*\{[^}]*\}/g)
    ?.find((block) => /font-family:\s*['"]SUIT Variable['"]/.test(block))
  const url = face?.match(
    /url\(\s*['"]?([^'")\s]+\.(?:woff2|ttf|otf))['"]?\s*\)/
  )
  if (!url?.[1]) return null
  // A bare specifier is a package under node_modules; a relative one is
  // relative to the stylesheet, as the bundler reads it.
  return url[1].startsWith(".")
    ? join(ROOT, "src", url[1])
    : join(ROOT, "node_modules", url[1])
}

function filesUnder(
  dir: string,
  suffixes: ReadonlyArray<string>,
  skipUnder: ReadonlyArray<string> = []
): Array<string> {
  return readdirSync(join(ROOT, dir), { recursive: true, encoding: "utf8" })
    .map((rel) => join(dir, rel))
    .filter(
      (file) =>
        suffixes.some((suffix) => file.endsWith(suffix)) &&
        !/\.test\.[a-z]+$/.test(file) &&
        !skipUnder.some((skip) => file.startsWith(skip + sep))
    )
}

const SHOWN_TEXT = [
  ...filesUnder("services", [".md", ".tokens.json"]),
  ...filesUnder("src", [".ts", ".tsx"], [join("src", "og")]),
]

describe("SUIT glyph coverage", () => {
  const fontPath = declaredFontPath()

  it("finds the SUIT @font-face in styles.css and its file", () => {
    expect(
      fontPath,
      "src/styles.css has no @font-face for 'SUIT Variable' with a .woff2/.ttf/.otf url(); this test reads the font from there, so update the pattern in declaredFontPath() if the declaration changed shape."
    ).not.toBeNull()
  })

  const covered = fontPath
    ? coveredCodePoints(readFileSync(fontPath))
    : new Set<number>()

  it("reads the font's own character table (parser sanity)", () => {
    // 가 is in every build; U+0378 is an unassigned code point no font maps.
    expect(covered.has("가".codePointAt(0)!)).toBe(true)
    expect(covered.has(0x0378)).toBe(false)
    // Over-counting guard: the package's woff2 is a subset of its ttf, so it
    // must cover strictly fewer syllables than the full build. A parser that
    // ignores idDelta or glyph 0 would count them the same. Both paths are
    // fixed here, not read from the @font-face, so pointing that declaration
    // at the ttf (what the coverage test's message advises) leaves this valid.
    const syllables = (set: Set<number>) =>
      [...set].filter((cp) => cp >= 0xac00 && cp <= 0xd7a3).length
    const suit = join(ROOT, "node_modules/@sun-typeface/suit/fonts/variable")
    const subset = coveredCodePoints(
      readFileSync(join(suit, "woff2/SUIT-Variable.woff2"))
    )
    const full = coveredCodePoints(
      readFileSync(join(suit, "ttf/SUIT-Variable.ttf"))
    )
    expect(syllables(full)).toBe(11172)
    expect(syllables(subset)).toBeLessThan(11172)
  })

  it("scans the catalogue and the screen sources (input is not empty)", () => {
    expect(SHOWN_TEXT.some((file) => file.startsWith("services"))).toBe(true)
    expect(SHOWN_TEXT.some((file) => file.startsWith("src"))).toBe(true)
    // Data modules under src/lib carry screen text too (category names).
    expect(SHOWN_TEXT).toContain(join("src", "lib", "category-style.ts"))
  })

  it("covers every Hangul syllable and jamo in the catalogue and sources", () => {
    const missing = new Map<string, Set<string>>()
    for (const file of SHOWN_TEXT) {
      for (const match of readFileSync(join(ROOT, file), "utf8").matchAll(
        HANGUL
      )) {
        if (covered.has(match[0].codePointAt(0)!)) continue
        const files = missing.get(match[0]) ?? new Set<string>()
        files.add(file)
        missing.set(match[0], files)
      }
    }
    const report = [...missing]
      .map(([glyph, files]) => `${glyph} (${[...files].join(", ")})`)
      .join("; ")
    expect(
      report,
      `these are not in the font file the SUIT @font-face in src/styles.css declares, so a system font would draw them mid-word: ${report}. Reword them, or point that @font-face src at a build that has them (the package's fonts/variable/ttf covers every syllable) and update the comment above it. This test follows that declaration, so it needs no other edit.`
    ).toBe("")
  })
})
