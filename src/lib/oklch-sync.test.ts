import { describe, expect, it } from "vitest"
import {
  OKLCH_DEFINITION,
  indexCorrections,
  syncOklchLiterals,
} from "./oklch-sync"
import type { OklchCorrections } from "./oklch-sync"

const corrections = (
  pairs: Array<[string, [string, string, string]]>
): OklchCorrections => new Map(pairs)

describe("syncOklchLiterals", () => {
  // The defect this module exists for. 11st's gray ramp was corrected such that
  // gray-07's OLD value equalled gray-06's NEW value; sequential passes flipped
  // gray-06 back to gray-07's colour and that shipped to main.
  it("does not let one correction's result be re-matched by another", () => {
    const css = [
      "      --gray-06: oklch(0.65 0 0);",
      "      --gray-07: oklch(0.67 0 0);",
    ].join("\n")

    const { text, count } = syncOklchLiterals(
      css,
      corrections([
        ["0.65 0 0", ["0.67", "0", "0"]], // gray-06
        ["0.67 0 0", ["0.68", "0", "0"]], // gray-07 — old == gray-06's new
      ])
    )

    expect(text).toContain("--gray-06: oklch(0.67 0 0)")
    expect(text).toContain("--gray-07: oklch(0.68 0 0)")
    expect(count).toBe(2)
  })

  it("is order-independent for a chaining pair", () => {
    const css = "a: oklch(0.65 0 0); b: oklch(0.67 0 0);"
    const forward = syncOklchLiterals(
      css,
      corrections([
        ["0.65 0 0", ["0.67", "0", "0"]],
        ["0.67 0 0", ["0.68", "0", "0"]],
      ])
    )
    const reversed = syncOklchLiterals(
      css,
      corrections([
        ["0.67 0 0", ["0.68", "0", "0"]],
        ["0.65 0 0", ["0.67", "0", "0"]],
      ])
    )
    expect(forward.text).toBe(reversed.text)
  })

  it("leaves the definition line alone even when its value is another's old", () => {
    // `gray-06`'s corrected value is gray-07's old one — rewriting the definition
    // would undo the fix that `--fix` had just written.
    const md = "gray-06: oklch(0.67 0 0)     # #949494"
    const { text, count } = syncOklchLiterals(
      md,
      corrections([["0.67 0 0", ["0.68", "0", "0"]]])
    )
    expect(text).toBe(md)
    expect(count).toBe(0)
  })

  it("rewrites alpha-bearing literals that a `)`-anchored pattern would skip", () => {
    const { text, count } = syncOklchLiterals(
      "--scrim: oklch(0.65 0 0 / 30%);",
      corrections([["0.65 0 0", ["0.67", "0", "0"]]])
    )
    expect(text).toBe("--scrim: oklch(0.67 0 0 / 30%);")
    expect(count).toBe(1)
  })

  it("preserves the author's inter-number spacing", () => {
    const { text } = syncOklchLiterals(
      "--x: oklch(0.65   0   0);",
      corrections([["0.65 0 0", ["0.67", "0", "0"]]])
    )
    expect(text).toBe("--x: oklch(0.67   0   0);")
  })

  it("reports nothing when tokens share an old value and agree on the new one", () => {
    // The catalogue's normal case: krds annotates primary-80 and secondary-70
    // with the same #052B57, so both correct to the same triple.
    const { byOld, conflicts } = indexCorrections([
      { old: ["0.275", "0.092", "258"], neu: ["0.292", "0.090", "255"] },
      { old: ["0.275", "0.092", "258"], neu: ["0.292", "0.090", "255"] },
    ])
    expect(conflicts).toEqual([])
    expect(byOld.get("0.275 0.092 258")).toEqual(["0.292", "0.090", "255"])
  })

  it("flags tokens that share an old value but want different new ones", () => {
    // Same wrong OKLCH, different annotated hex — a plain Map would keep the
    // last and sync every shared literal to it without a word.
    const { conflicts } = indexCorrections([
      { old: ["0.5", "0.1", "200"], neu: ["0.52", "0.1", "200"] },
      { old: ["0.5", "0.1", "200"], neu: ["0.48", "0.1", "200"] },
    ])
    expect(conflicts).toEqual([
      { old: "0.5 0.1 200", candidates: ["0.52 0.1 200", "0.48 0.1 200"] },
    ])
  })

  it("leaves untouched values and unrelated literals alone", () => {
    const css = "--a: oklch(0.5 0.1 200); --b: oklch(0.65 0 0);"
    const { text, count } = syncOklchLiterals(
      css,
      corrections([["0.65 0 0", ["0.67", "0", "0"]]])
    )
    expect(text).toBe("--a: oklch(0.5 0.1 200); --b: oklch(0.67 0 0);")
    expect(count).toBe(1)
  })
})

// The audit only judges lines this regex matches, so anything it misses is a
// token whose OKLCH nobody checks. It originally required the hex to sit
// immediately after the `#` comment marker (`# #FAFAFA`), which silently
// excluded the two annotation styles the catalog actually uses — `# ≈ #HEX` and
// `# prose (#HEX)`. 102 annotated pairs were being skipped, 66 of them wrong.
describe("OKLCH_DEFINITION", () => {
  const hexOf = (line: string) => line.match(OKLCH_DEFINITION)?.[10]

  it("matches the bare `# #hex` form", () => {
    expect(hexOf("gray-5:    oklch(0.985 0 0)          # #FAFAFA")).toBe(
      "#FAFAFA"
    )
  })

  it("matches an approximation marker before the hex", () => {
    expect(hexOf("lime-600:   oklch(0.758 0.213 131)   # ≈ #58CF04")).toBe(
      "#58CF04"
    )
  })

  it("matches a hex parenthesised inside prose", () => {
    expect(
      hexOf(
        "blue-800:  oklch(0.563 0.232 257)   # core Wanted Blue (#0066FF), 단일 primary"
      )
    ).toBe("#0066FF")
  })

  it("matches a hex after a token-name comment", () => {
    expect(
      hexOf(
        "red-100:    oklch(0.951 0.018 27)    # --bg-danger-subtle (#FEECEC)"
      )
    ).toBe("#FEECEC")
  })

  // Two hexes on one line means the pairing is no longer unambiguous, which is
  // the whole premise of judging this shape. Better skipped than mis-paired.
  it("refuses a comment carrying more than one hex", () => {
    expect(
      hexOf(
        "pink-600:   oklch(0.673 0.279 339)   # ≈ #F553DA (atomic; gradient mid는 #FF53C0)"
      )
    ).toBeUndefined()
  })

  it("ignores a comment with no hex at all", () => {
    expect(
      hexOf("blue-700:  oklch(0.607 0.225 257)   # hover step")
    ).toBeUndefined()
  })

  // audit-oklch.ts reads these positions by index; renumbering them silently
  // mis-reads every finding.
  it("keeps the capture positions audit-oklch indexes", () => {
    const m = "fg-muted:  oklch(0.521 0.018 273 / 0.08)   # ≈ #70737C14".match(
      OKLCH_DEFINITION
    )
    expect(m?.[1]).toBe("fg-muted")
    expect([m?.[3], m?.[5], m?.[7]]).toEqual(["0.521", "0.018", "273"])
    expect(m?.[8]).toBe(" / 0.08")
    expect(m?.[10]).toBe("#70737C14")
  })
})

// The audit refuses to judge a two-hex definition because the pairing is
// ambiguous. The sync pass must refuse it too: if the strict audit predicate
// doubles as the skip test, an ambiguous definition stops looking like a
// definition and gets rewritten from some OTHER token's correction — silently
// changing a value nobody ever judged.
describe("syncOklchLiterals — ambiguous definitions", () => {
  it("leaves a two-hex definition line alone even when its triple is corrected", () => {
    const line =
      "pink-600:   oklch(0.673 0.279 339)   # ≈ #F553DA (atomic; gradient mid는 #FF53C0)"

    const { text, count } = syncOklchLiterals(
      line,
      corrections([["0.673 0.279 339", ["0.706", "0.242", "335"]]])
    )

    expect(text).toBe(line)
    expect(count).toBe(0)
  })

  it("still rewrites a derived literal that carries no hex annotation", () => {
    const { text, count } = syncOklchLiterals(
      "  --brand: oklch(0.673 0.279 339);",
      corrections([["0.673 0.279 339", ["0.706", "0.242", "335"]]])
    )

    expect(text).toContain("oklch(0.706 0.242 335)")
    expect(count).toBe(1)
  })
})

// `src/lib/token-extractor.ts` accepts leading whitespace on a token line, so
// an indented definition is a real, parseable shape. Anchoring these predicates
// at column zero made the audit decline to judge it AND the sync stop treating
// it as a definition — the worst combination, since another token's correction
// can then rewrite a value nobody evaluated.
describe("indented definitions", () => {
  const indented = "  blue-800:  oklch(0.563 0.232 257)   # ≈ #0066FF"

  it("is judged by the audit predicate", () => {
    expect(indented.match(OKLCH_DEFINITION)?.[10]).toBe("#0066FF")
  })

  it("is skipped by the sync pass", () => {
    const { text, count } = syncOklchLiterals(
      indented,
      corrections([["0.563 0.232 257", ["0.9", "0.9", "9"]]])
    )
    expect(text).toBe(indented)
    expect(count).toBe(0)
  })
})
