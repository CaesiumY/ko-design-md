import { describe, expect, it } from "vitest"
import { auditOklch } from "./oklch-audit"

// `audit:oklch` per document: which `token: oklch(…)  # #hex` rows it judges,
// which disagree with their hex, and what `--fix` writes back. The rows come
// from `readFrontmatter` (docs/adr/0011), so the line a finding names and the
// line `--fix` rewrites are the module's, not a regex's guess.

const doc = (rows: Array<string>, eol = "\n"): string =>
  [
    "---",
    "name: 데모",
    "colors:",
    ...rows.map((r) => `  ${r}`),
    "---",
    "# 본문",
    "",
  ].join(eol)

describe("auditOklch — judging", () => {
  it("reports a token whose OKLCH does not decode to its hex, at its file line", () => {
    const md = doc([
      "ok: oklch(0.6 0 0)   # 주석에 hex 없음",
      "brand: oklch(0.9 0.02 90)   # #3182F6",
    ])
    const { findings } = auditOklch(md, { fix: false })
    expect(findings.map((f) => [f.line, f.token])).toEqual([[5, "brand"]])
  })

  it("separates annotated definitions from judgeable ones", () => {
    // A comment naming two hexes is counted but not judged: pairing it with
    // either colour would be a guess.
    const md = doc([
      "blue-800: oklch(0.563 0.241 261)   # ≈ #0066FF",
      "pink-600: oklch(0.673 0.279 339)   # ≈ #F553DA (mid는 #FF53C0)",
      "neutral:  oklch(0.5 0 0)           # 주석에 hex 없음",
    ])
    const { annotated, judged } = auditOklch(md, { fix: false })
    expect({ annotated, judged }).toEqual({ annotated: 2, judged: 1 })
  })

  it("judges a token however deep it is indented, and a quoted value", () => {
    const md = [
      "---",
      "colors:",
      "    deep: oklch(0.9 0.02 90)   # #3182F6",
      '    quoted: "oklch(0.9 0.02 90)"   # #3182F6',
      "---",
      "",
    ].join("\n")
    const { findings } = auditOklch(md, { fix: false })
    expect(findings.map((f) => f.token)).toEqual(["deep", "quoted"])
  })

  it("judges a value written below its key by the hex on the value's line", () => {
    const md = doc([
      "next-line:",
      "    oklch(0.9 0.02 90)   # #3182F6",
      "matching:",
      "    oklch(0.620 0.191 258)   # #3182F6",
    ])
    const audit = auditOklch(md, { fix: false })
    expect({ annotated: audit.annotated, judged: audit.judged }).toEqual({
      annotated: 2,
      judged: 2,
    })
    expect(audit.findings.map((f) => [f.line, f.token])).toEqual([
      [4, "next-line"],
    ])
  })

  it("does not judge a definition-shaped line outside the frontmatter rows", () => {
    const md = [
      "---",
      "note: |",
      "  fake: oklch(0.9 0.02 90)   # #3182F6",
      "---",
      "```text",
      "body: oklch(0.9 0.02 90)   # #3182F6",
      "```",
      "",
    ].join("\n")
    expect(auditOklch(md, { fix: false })).toMatchObject({
      annotated: 0,
      judged: 0,
      findings: [],
    })
  })

  it("judges nothing in a frontmatter YAML cannot read", () => {
    const md = doc([
      "brand: oklch(0.9 0.02 90)   # #3182F6",
      "brand: oklch(0.9 0.02 90)   # #3182F6",
    ])
    expect(auditOklch(md, { fix: false })).toMatchObject({
      annotated: 0,
      findings: [],
    })
  })
})

describe("auditOklch — --fix", () => {
  it("rewrites only the mismatched token's line and leaves every other byte alone", () => {
    // CRLF on purpose: rejoining lines with `\n` used to rewrite every line
    // ending in the file along with the one value it meant to fix.
    const md = doc(
      [
        "ok: oklch(0.6 0 0)   # 주석에 hex 없음",
        "brand: oklch(0.900 0.020 90)   # #3182F6 — 브랜드",
        "after: oklch(0.5 0 0)",
      ],
      "\r\n"
    )
    const { text, findings } = auditOklch(md, { fix: true })
    expect(findings).toHaveLength(1)

    const before = md.split("\r\n")
    const after = text.split("\r\n")
    expect(after).toHaveLength(before.length)
    const changed = before.flatMap((line, i) => (line === after[i] ? [] : [i]))
    expect(changed).toEqual([4])
    // Only the value moved: the key, the spacing and the comment are the author's.
    expect(after[4]).toMatch(
      /^ {2}brand: oklch\([\d.]+ [\d.]+ \d+\) {3}# #3182F6 — 브랜드$/
    )
    // And the value written is one the audit now accepts.
    expect(auditOklch(text, { fix: false }).findings).toEqual([])
  })

  it("corrects only the opacity when only the opacity is off", () => {
    // `#70737C14` is 0x14/255 ≈ 0.078 opaque; the colour itself matches.
    const md = doc(["border-subtle: oklch(0.556 0.014 271 / 0.5)  # #70737C14"])
    const { text, findings } = auditOklch(md, { fix: true })
    expect(findings.map((f) => [f.colourOff, f.alpha])).toEqual([
      [false, ["/ 0.5", "/ 0.078"]],
    ])
    expect(text.split("\n")[3]).toBe(
      "  border-subtle: oklch(0.556 0.014 271 / 0.078)  # #70737C14"
    )
  })

  it("rewrites a block scalar's value on its own line, not the header's", () => {
    const md = doc(
      [
        "before: oklch(0.5 0 0)",
        "brand: >-   # #3182F6",
        "    oklch(0.900 0.020 90)",
        "next-line:   # #3182F6",
        "    oklch(0.900 0.020 90)",
        "after: oklch(0.5 0 0)",
      ],
      "\r\n"
    )
    const { text, findings, unfixed } = auditOklch(md, { fix: true })
    expect(findings.map((f) => f.token)).toEqual(["brand", "next-line"])
    expect(unfixed).toEqual([])

    const before = md.split("\r\n")
    const after = text.split("\r\n")
    expect(after).toHaveLength(before.length)
    const changed = before.flatMap((line, i) => (line === after[i] ? [] : [i]))
    expect(changed).toEqual([5, 7])
    expect(after[5]).toMatch(/^ {6}oklch\([\d.]+ [\d.]+ \d+\)$/)
    expect(after[7]).toMatch(/^ {6}oklch\([\d.]+ [\d.]+ \d+\)$/)
    expect(auditOklch(text, { fix: false }).findings).toEqual([])
  })

  it("judges and fixes a colour whose value opens with blanks, as the sidecar publishes it", () => {
    const md = doc([
      'quoted: "  oklch(0.900 0.020 90)"   # #3182F6',
      "block: |   # #3182F6",
      "",
      "    oklch(0.900 0.020 90)",
    ])
    const { text, findings, unfixed, annotated } = auditOklch(md, {
      fix: true,
    })
    expect(annotated).toBe(2)
    expect(findings.map((f) => f.token)).toEqual(["quoted", "block"])
    expect(unfixed).toEqual([])
    const lines = text.split("\n")
    expect(lines[3]).toMatch(
      /^ {2}quoted: " {2}oklch\([\d.]+ [\d.]+ \d+\)" {3}# #3182F6$/
    )
    expect(lines[6]).toMatch(/^ {6}oklch\([\d.]+ [\d.]+ \d+\)$/)
    expect(auditOklch(text, { fix: false }).findings).toEqual([])
  })

  it("reports, and leaves as written, a value it cannot find whole on one line", () => {
    // The literal runs across two lines, so no one line holds it to rewrite.
    // A throw here once stopped the catalogue walk half-way through.
    const md = doc([
      'split: "oklch(0.900',
      '    0.020 90)"   # #3182F6',
      "brand: oklch(0.900 0.020 90)   # #3182F6",
    ])
    const { text, findings, unfixed } = auditOklch(md, { fix: true })
    expect(findings.map((f) => f.token)).toEqual(["split", "brand"])
    expect(unfixed.map((f) => [f.line, f.token])).toEqual([[4, "split"]])
    const lines = text.split("\n")
    expect(lines.slice(3, 5)).toEqual(md.split("\n").slice(3, 5))
    expect(lines[5]).not.toBe(md.split("\n")[5])
  })

  it("reports nothing unfixed when not fixing", () => {
    const md = doc(['split: "oklch(0.900', '    0.020 90)"   # #3182F6'])
    expect(auditOklch(md, { fix: false }).unfixed).toEqual([])
  })

  it("returns the input unchanged when not fixing", () => {
    const md = doc(["brand: oklch(0.9 0.02 90)   # #3182F6"])
    expect(auditOklch(md, { fix: false }).text).toBe(md)
  })

  it("survives a dollar sign in the comment", () => {
    // `String.replace` with a string replacement reads `$&` as a pattern.
    const md = doc(["brand: oklch(0.9 0.02 90)   # #3182F6 ($& 표기)"])
    const line = auditOklch(md, { fix: true }).text.split("\n")[3]
    expect(line.endsWith("# #3182F6 ($& 표기)")).toBe(true)
  })
})
