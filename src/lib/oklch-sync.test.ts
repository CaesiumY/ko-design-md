import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
  applyDefinition,
  countDefinitions,
  indexCorrections,
  matchDefinition,
  rebuildDefinition,
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
  const hexOf = (line: string) => matchDefinition(line)?.hex

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

  // Was an index-position pin (audit-oklch.ts read this match by number). The
  // contract still matters, but it is now expressed by name — see the
  // `matchDefinition` suite below, which asserts the same five fields plus the
  // whitespace parts that nothing used to pin.
  it("exposes the judged parts by name", () => {
    const d = matchDefinition(
      "fg-muted:  oklch(0.521 0.018 273 / 0.08)   # ≈ #70737C14"
    )
    expect(d?.token).toBe("fg-muted")
    expect([d?.L, d?.C, d?.H]).toEqual(["0.521", "0.018", "273"])
    expect(d?.tail).toBe(" / 0.08")
    expect(d?.hex).toBe("#70737C14")
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
    expect(matchDefinition(indented)?.hex).toBe("#0066FF")
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

// `audit:oklch` cannot distinguish "clean catalog" from "regex matched nothing"
// — both print `0 token(s) mismatched` and exit 0. That is exactly how 102
// annotated pairs went unjudged while the gate stayed green. Coverage has to be
// reported and floored, not inferred from the absence of findings.
describe("countDefinitions", () => {
  it("separates annotated definitions from judgeable ones", () => {
    const text = [
      "blue-800: oklch(0.563 0.241 261)   # ≈ #0066FF",
      "pink-600: oklch(0.673 0.279 339)   # ≈ #F553DA (mid는 #FF53C0)",
      "neutral:  oklch(0.5 0 0)           # 주석에 hex 없음",
      "  --derived: oklch(0.5 0 0);",
    ].join("\n")

    expect(countDefinitions(text)).toEqual({ annotated: 2, judged: 1 })
  })

  it("counts nothing in text with no definitions", () => {
    expect(countDefinitions("# 제목\n산문 한 줄.")).toEqual({
      annotated: 0,
      judged: 0,
    })
  })
})

// Canary over the real catalog: if a regex edit silently stops matching, this
// fails loudly instead of letting `audit:oklch` report a clean sweep. Floors are
// deliberately below the 2026-07-26 measurement (474 annotated / 465 judged) so
// ordinary catalog edits do not trip them — only a collapse does.
describe("catalog OKLCH coverage", () => {
  it("keeps judging the overwhelming majority of annotated definitions", () => {
    const dir = join(process.cwd(), "services")
    let annotated = 0
    let judged = 0
    for (const name of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const c = countDefinitions(readFileSync(join(dir, name), "utf8"))
      annotated += c.annotated
      judged += c.judged
    }

    expect(annotated).toBeGreaterThan(400)
    expect(judged).toBeGreaterThan(400)
    expect(judged / annotated).toBeGreaterThan(0.95)
  })
})

// `--fix` rebuilds a definition line from its capture groups so only the numbers
// move in the diff. That reconstruction lives in `scripts/`, which has no tests
// at all — a refactor that renumbers or drops the whitespace-preserving groups
// silently reformats every corrected line and the whole suite stays green.
// Round-trip is the invariant: rebuilding with the SAME values must be a no-op.
describe("rebuildDefinition", () => {
  // The invariant as the caller actually uses it: the match ends at the hex, so
  // splice the rebuild back over that span and the whole line must be unchanged.
  const rebuild = (line: string) => {
    const d = matchDefinition(line)
    if (!d) throw new Error(`not a definition: ${line}`)
    return applyDefinition(line, d, [d.L, d.C, d.H], d.tail)
  }

  it("is byte-identical when the value does not change", () => {
    const line =
      "blue-800:  oklch(0.563 0.241 261)   # core Wanted Blue (#0066FF)"
    expect(rebuild(line)).toBe(line)
  })

  it("preserves an alpha tail", () => {
    const line = "border-subtle: oklch(0.556 0.014 271 / 0.08)  # #70737C14"
    expect(rebuild(line)).toBe(line)
  })

  it("preserves leading indentation", () => {
    const line = "  nested-token:  oklch(0.5 0.1 200)   # ≈ #00A0B0"
    expect(rebuild(line)).toBe(line)
  })

  it("moves only the numbers when the value changes", () => {
    const line = "lime-600:   oklch(0.758 0.213 131)   # ≈ #58CF04"
    const d = matchDefinition(line)!
    expect(applyDefinition(line, d, ["0.756", "0.232", "138"], d.tail)).toBe(
      "lime-600:   oklch(0.756 0.232 138)   # ≈ #58CF04"
    )
  })
})

// Positional capture indices were a contract three files read by number, pinned
// only by one test asserting five of the eleven. The four whitespace groups the
// `--fix` reconstruction replays were pinned by nothing at all. `matchDefinition`
// replaces that contract with a typed object so a regex edit is a compile error,
// not a silent misread.
describe("matchDefinition", () => {
  it("names every part of a definition line", () => {
    const d = matchDefinition(
      "  fg-muted:  oklch(0.521 0.018 273 / 0.08)   # ≈ #70737C14"
    )
    expect(d).not.toBeNull()
    expect(d!.indent).toBe("  ")
    expect(d!.token).toBe("fg-muted")
    expect(d!.L).toBe("0.521")
    expect(d!.C).toBe("0.018")
    expect(d!.H).toBe("273")
    expect(d!.tail).toBe(" / 0.08")
    expect(d!.hex).toBe("#70737C14")
    expect(d!.matched).toBe(
      "  fg-muted:  oklch(0.521 0.018 273 / 0.08)   # ≈ #70737C14"
    )
  })

  it("returns null for a line the audit must not judge", () => {
    expect(
      matchDefinition(
        "pink-600: oklch(0.673 0.279 339)  # ≈ #F553DA (mid는 #FF53C0)"
      )
    ).toBeNull()
    expect(matchDefinition("  --derived: oklch(0.5 0 0);")).toBeNull()
  })

  it("round-trips through applyDefinition", () => {
    const line = "lime-600:   oklch(0.758 0.213 131)   # ≈ #58CF04"
    const d = matchDefinition(line)!
    expect(applyDefinition(line, d, [d.L, d.C, d.H], d.tail)).toBe(line)
  })
})

// `String.replace` with a STRING replacement interprets `$&`, `$$`, `$1` and
// `$<name>` as substitution patterns. The rebuilt line carries the author's
// free-form comment verbatim, so a literal `$` in it would corrupt the rewrite.
// No catalog comment contains one today; the guard costs nothing and this is
// exactly the line that just shipped an indentation bug.
describe("rebuildDefinition — replacement safety", () => {
  it("survives a dollar sign in the comment", () => {
    const line = "sale-badge: oklch(0.5 0.1 200)   # 세일 $10 배지 (#0066FF)"
    const d = matchDefinition(line)!
    expect(applyDefinition(line, d, [d.L, d.C, d.H], d.tail)).toBe(line)
  })

  // Demonstrates why `applyDefinition` exists rather than leaving the splice to
  // the caller: the naive string form mangles the very same input.
  it("would corrupt the line if the splice used a string replacement", () => {
    const line = "sale-badge: oklch(0.5 0.1 200)   # 세일 $& 배지 (#0066FF)"
    const d = matchDefinition(line)!
    const rebuilt = rebuildDefinition(d, [d.L, d.C, d.H], d.tail)

    expect(line.replace(d.matched, rebuilt)).not.toBe(line)
    expect(applyDefinition(line, d, [d.L, d.C, d.H], d.tail)).toBe(line)
  })
})
