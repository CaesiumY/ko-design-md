import { describe, expect, it } from "vitest"
import { syncOklchLiterals } from "./oklch-sync"
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
