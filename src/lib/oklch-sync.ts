// Propagating a corrected OKLCH primitive into the places that copied it —
// semantic aliases, gradients, prose, preview CSS. Extracted from
// `scripts/audit-oklch.ts` so the substitution itself can be tested: applying
// corrections as sequential passes silently corrupted committed data, and only a
// test pins the fix down.

/**
 * `token: oklch(L C H[ / a])  # #hex` — the one shape where "these two describe
 * the same colour" is unambiguous, so it is the only shape the audit judges and
 * the one shape a sync must leave alone (it already carries the new value).
 */
export const OKLCH_DEFINITION =
  /^([a-z][\w-]*):(\s+)oklch\(\s*([\d.]+)(\s+)([\d.]+)(\s+)([\d.]+)([^)]*)\)(\s*#\s*)(#[0-9a-fA-F]{3,8})\b/

/** Any oklch literal, whatever follows the triple (`)`, ` / 30%)`). */
const OKLCH_LITERAL = /(oklch\(\s*)([\d.]+)(\s+)([\d.]+)(\s+)([\d.]+)(\s*[/)])/g

/** `"0.65 0 0"` → the replacement triple. */
export type OklchCorrections = Map<string, [string, string, string]>

/**
 * Rewrite every oklch literal whose triple appears in `corrections`, in ONE pass.
 *
 * The single pass is the whole point. Applying each correction as its own
 * sequential `replace` lets one correction's NEW value be re-matched by a later
 * correction's OLD pattern: `public/preview/11st/light.html` shipped `--gray-06`
 * holding gray-07's colour because gray-06 moved 0.65→0.67 while gray-07 moved
 * 0.67→0.68, so the second pass caught the line the first had just written.
 * Sorting corrections by length does not help — that only guards against a
 * shorter literal matching inside a longer one, which an exact whole-triple
 * lookup rules out anyway. `String.replace` scans the original left-to-right and
 * never re-examines what it has emitted, so chaining cannot occur.
 */
export function syncOklchLiterals(
  text: string,
  corrections: OklchCorrections,
  skipLine: (line: string) => boolean = (l) => OKLCH_DEFINITION.test(l)
): { text: string; count: number } {
  let count = 0
  const out = text
    .split(/\r?\n/)
    .map((line) => {
      // A definition line already carries its new value — and that value may
      // itself be some other token's old one, so it must not be rewritten.
      if (skipLine(line)) return line
      return line.replace(
        OKLCH_LITERAL,
        (whole, open, L, s1, C, s2, H, close: string) => {
          const neu = corrections.get(`${L} ${C} ${H}`)
          if (!neu) return whole
          count++
          return `${open}${neu[0]}${s1}${neu[1]}${s2}${neu[2]}${close}`
        }
      )
    })
    .join("\n")
  return { text: out, count }
}
