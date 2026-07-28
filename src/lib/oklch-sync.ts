// Propagating a corrected OKLCH primitive into the places that copied it —
// semantic aliases, gradients, prose, preview CSS. Extracted from
// `scripts/audit-oklch.ts` so the substitution itself can be tested: applying
// corrections as sequential passes silently corrupted committed data, and only a
// test pins the fix down.

/**
 * `token: oklch(L C H[ / a])  # …#hex` — a definition whose trailing comment
 * annotates the source colour unambiguously. This is the only shape the audit
 * JUDGES. It is deliberately not the predicate the sync pass skips on; see
 * `OKLCH_ANNOTATED_DEFINITION` below for why those must differ.
 *
 * The comment prose between the `#` marker and the hex is free-form: the
 * catalog writes `# #FAFAFA`, `# ≈ #58CF04`, and `# core Wanted Blue (#0066FF)`
 * interchangeably. Requiring the hex to sit immediately after the marker — as
 * this pattern originally did — quietly excluded the latter two, so 102
 * annotated pairs across `services/` were never judged and `audit:oklch`
 * reported a clean catalog while 66 of them disagreed with their own hex.
 *
 * Unambiguity is still the premise, and it is enforced two ways: `[^#\n]*`
 * cannot step over an earlier `#`, so the captured hex is always the FIRST one
 * in the comment, and the trailing lookahead rejects the line outright when a
 * SECOND hex follows. A comment like `# ≈ #F553DA (gradient mid는 #FF53C0)`
 * names two colours and cannot be judged, so it is skipped rather than paired
 * with whichever one the pattern happened to reach.
 *
 * The guard is length-based, so an issue-number-shaped comment (`# ≈ #58CF04
 * (see #123)`) would read as two hexes and skip too. That is accepted rather
 * than worked around: `#123` IS a valid CSS shorthand hex, so no pattern can
 * tell the two apart, and the failure direction is the safe one — an unjudged
 * line keeps its value instead of taking someone else's. Measured against the
 * catalog on 2026-07-26: 474 annotated definitions, 465 judged, 9 skipped, and
 * all 9 genuinely name two colours (light/dark pairs in codeit and class101,
 * atomic-vs-gradient in wanted). No false skip today.
 *
 * Read it through `matchDefinition` rather than by capture index. Three files
 * used to count positions, and only five of the eleven groups were pinned by a
 * test — the whitespace groups `--fix` replays were pinned by nothing, so
 * renumbering them silently reformatted every corrected line.
 */
export const OKLCH_DEFINITION =
  /^(?<indent>\s*)(?<token>[a-z][\w-]*):(?<afterColon>\s+)oklch\(\s*(?<L>[\d.]+)(?<sepLC>\s+)(?<C>[\d.]+)(?<sepCH>\s+)(?<H>[\d.]+)(?<tail>[^)]*)\)(?<comment>\s*#[^#\n]*)(?<hex>#[0-9a-fA-F]{3,8})\b(?![^\n]*#[0-9a-fA-F]{3,8}\b)/

/**
 * A judged definition line, with every part named.
 *
 * The whole point is that nothing downstream counts capture positions. Three
 * files used to read this match by index — and only five of the eleven groups
 * were pinned by a test, while the four whitespace groups that `--fix` replays
 * were pinned by nothing. Renumbering them was a silent misread waiting to
 * happen; now it is a compile error.
 */
export interface DefinitionMatch {
  /** The matched span. Ends at the hex, so prose after it is left alone. */
  matched: string
  indent: string
  token: string
  /** Whitespace between `token:` and `oklch(`. */
  afterColon: string
  L: string
  sepLC: string
  C: string
  sepCH: string
  H: string
  /** Remainder inside the parens — carries ` / alpha` when present. */
  tail: string
  /** From the `#` comment marker up to (not including) the hex. */
  comment: string
  hex: string
}

/** Parse one line as a judgeable definition, or `null` when it is not one. */
export function matchDefinition(line: string): DefinitionMatch | null {
  const m = line.match(OKLCH_DEFINITION)
  const g = m?.groups
  if (!m || !g) return null
  return {
    matched: m[0],
    indent: g.indent,
    token: g.token,
    afterColon: g.afterColon,
    L: g.L,
    sepLC: g.sepLC,
    C: g.C,
    sepCH: g.sepCH,
    H: g.H,
    tail: g.tail,
    comment: g.comment,
    hex: g.hex,
  }
}

/**
 * Any `token: oklch(…)` line whose trailing comment carries a hex — judgeable
 * or not. This is deliberately WIDER than `OKLCH_DEFINITION`.
 *
 * The two must not be the same predicate. `OKLCH_DEFINITION` answers "can the
 * audit decide what colour this line should be?", and it says no to an
 * ambiguous two-hex comment. The sync skip answers a different question: "is
 * this line a definition that owns its own value?" — and an ambiguous
 * definition still owns its value. Using the strict pattern for both means a
 * line the audit deliberately declined to judge stops looking like a definition
 * and gets rewritten by some OTHER token's correction, changing a value nobody
 * ever evaluated.
 */
export const OKLCH_ANNOTATED_DEFINITION =
  /^\s*[a-z][\w-]*:\s+oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+[^)]*\)\s*#[^\n]*#[0-9a-fA-F]{3,8}\b/

/** Any oklch literal, whatever follows the triple (`)`, ` / 30%)`). */
const OKLCH_LITERAL = /(oklch\(\s*)([\d.]+)(\s+)([\d.]+)(\s+)([\d.]+)(\s*[/)])/g

/**
 * How many annotated definitions exist, and how many of them the audit can
 * actually judge.
 *
 * `audit:oklch` reports findings, and "no findings" is indistinguishable from
 * "matched nothing" — same output, same exit code. That ambiguity is not
 * hypothetical: `OKLCH_DEFINITION` once skipped 102 annotated pairs across
 * `services/` (66 of them genuinely wrong) while the gate reported a clean
 * catalog. Coverage has to be counted and asserted, never inferred from silence.
 */
export function countDefinitions(text: string): {
  annotated: number
  judged: number
} {
  let annotated = 0
  let judged = 0
  for (const line of text.split(/\r?\n/)) {
    if (!OKLCH_ANNOTATED_DEFINITION.test(line)) continue
    annotated++
    if (OKLCH_DEFINITION.test(line)) judged++
  }
  return { annotated, judged }
}

/**
 * Rebuild a definition line from its own match, swapping in a new triple.
 *
 * Every separator the author wrote — indentation, the gap after the colon, the
 * spaces between L/C/H, the run before the comment — is replayed from the
 * capture groups so a correction moves the numbers and nothing else. The
 * invariant is round-trip: rebuilding with the values already on the line must
 * return that line byte-for-byte.
 *
 * This lives here rather than in `scripts/audit-oklch.ts` because `scripts/`
 * has no test coverage, and an unverified reconstruction quietly reformats
 * every line it touches.
 */
export function rebuildDefinition(
  d: DefinitionMatch,
  triple: [string, string, string],
  alphaTail: string
): string {
  return (
    `${d.indent}${d.token}:${d.afterColon}oklch(` +
    `${triple[0]}${d.sepLC}${triple[1]}${d.sepCH}${triple[2]}${alphaTail})` +
    `${d.comment}${d.hex}`
  )
}

/**
 * Splice a rebuilt definition back over the span it came from.
 *
 * The splice is here, not at the call site, because `String.replace` with a
 * STRING replacement treats `$&`, `$$`, `$1` and `$<name>` as substitution
 * patterns — and the rebuilt line carries the author's free-form comment
 * verbatim. A single literal `$` in a comment would silently corrupt the
 * rewrite. Passing a callback opts out of that parsing entirely, so the only
 * way to get it wrong is to not use this function.
 */
export function applyDefinition(
  line: string,
  d: DefinitionMatch,
  triple: [string, string, string],
  alphaTail: string
): string {
  const rebuilt = rebuildDefinition(d, triple, alphaTail)
  return line.replace(d.matched, () => rebuilt)
}

/** `"0.65 0 0"` → the replacement triple. */
export type OklchCorrections = Map<string, [string, string, string]>

export interface Correction {
  old: [string, string, string]
  neu: [string, string, string]
}

/** Two tokens that shared an old value but want different new ones. */
export interface CorrectionConflict {
  old: string
  candidates: Array<string>
}

/**
 * Index corrections by their old triple, reporting any that disagree.
 *
 * Distinct tokens sharing one value is normal here, not exotic: krds annotates
 * `primary-80` and `secondary-70` with the same `#052B57`, and codeit's whole
 * light-/dark-purple ramp is paired. When such tokens correct to the SAME value
 * the shared key is harmless. When they correct to different ones — two tokens
 * written with the same wrong OKLCH but annotated with different hexes — a plain
 * `new Map()` keeps whichever came last and silently propagates it to every
 * alias and preview literal that referenced the shared old value. Definition
 * lines are fixed per line so they stay right; only the derived copies rot,
 * which is precisely the failure this tool exists to prevent.
 */
export function indexCorrections(corrections: Array<Correction>): {
  byOld: OklchCorrections
  conflicts: Array<CorrectionConflict>
} {
  const byOld: OklchCorrections = new Map()
  const seen = new Map<string, Set<string>>()

  for (const { old, neu } of corrections) {
    const key = old.join(" ")
    const value = neu.join(" ")
    const values = seen.get(key) ?? new Set<string>()
    values.add(value)
    seen.set(key, values)
    byOld.set(key, neu)
  }

  const conflicts: Array<CorrectionConflict> = []
  for (const [old, values] of seen) {
    if (values.size > 1) conflicts.push({ old, candidates: [...values] })
  }
  return { byOld, conflicts }
}

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
  skipLine: (line: string) => boolean = (l) =>
    OKLCH_ANNOTATED_DEFINITION.test(l)
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
