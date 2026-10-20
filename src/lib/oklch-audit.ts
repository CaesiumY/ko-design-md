import { readFrontmatter } from "./frontmatter"
import {
  LEADING_OKLCH,
  OKLCH_ANNOTATED_DEFINITION,
  definitionRow,
  matchDefinition,
  oklchEntries,
} from "./oklch-sync"
import { ALPHA_TOLERANCE, DELTA_E_TOLERANCE } from "./oklch-tolerance"
import { deltaE, hexToOklab, lchToOklab, oklabToLch } from "./oklch-convert"
import type { FrontmatterKey } from "./frontmatter"
import type { DefinitionMatch } from "./oklch-sync"
import type { Oklab } from "./oklch-convert"

// `audit:oklch` for one design.md: judge every `token: oklch(…)  # …#hex` row
// against its hex, and with `fix` write the hex-derived value back.
//
// Moved out of `scripts/audit-oklch.ts` so `--fix` can be tested — `scripts/`
// has no tests, and a rewrite that touches more than the one value it means to
// fix is exactly the kind of damage nobody sees in a diff of hundreds of rows.
//
// The rows come from `readFrontmatter` (docs/adr/0011): which rows are colour
// definitions, their values, their line-end comments and their lines. Judging a
// row still goes through `OKLCH_DEFINITION` — the one rule, shared with the
// draft validator's `oklch-hex-mismatch` — applied to the row as YAML read it.
// That keeps every judging rule as it was: the first hex in the comment is the
// colour, and a comment naming a second hex is counted but never judged.

/** An 8-digit hex pins opacity as well as colour, and ΔE alone cannot see it:
 *  `oklch(0 0 0 / 30%)  # #00000008` scores a perfect 0 while rendering at ten
 *  times the annotated 3%. See src/lib/oklch-tolerance.ts for the calibration. */
const DELTA_E = DELTA_E_TOLERANCE

export interface OklchFinding {
  /** 1-based line of the whole file. */
  line: number
  token: string
  from: [string, string, string]
  to: [string, string, string]
  deltaE: number
  /** False when only the opacity was wrong and `to` restates the authored triple. */
  colourOff: boolean
  /** `[authored, corrected]` when the opacity disagrees with an 8-digit hex. */
  alpha: [string, string] | null
}

export interface OklchAudit {
  /** Rows whose comment carries a hex — judgeable or not. */
  annotated: number
  /** The subset with exactly one hex, which the audit compares. */
  judged: number
  findings: Array<OklchFinding>
  /** Findings `fix` left as written, because the value's literal is not whole
   *  on one line where it can be found without a guess (a value split across
   *  lines). The subset of `findings` the caller must fix by hand; empty when
   *  not fixing. */
  unfixed: Array<OklchFinding>
  /** The document after `fix`: only the corrected values differ, every other
   *  byte — line endings included — is the input's. The input itself when not
   *  fixing. */
  text: string
}

/** Alpha declared inside an oklch literal (`/ 30%`, `/ 0.3`), or null. */
function oklchAlpha(value: string): number | null {
  const m = value.match(/\/\s*([\d.]+)\s*(%?)/)
  if (!m) return null
  return m[2] === "%" ? Number(m[1]) / 100 : Number(m[1])
}

/** Oklch with the hue already rounded to the integer degrees tokens are written in. */
function labToLch(lab: Oklab): { L: number; C: number; H: number } {
  const { L, C, H } = oklabToLch(lab)
  return { L, C, H: Math.round(H) % 360 }
}

/** Keep the author's decimal precision so a fix produces a minimal diff. */
function like(sample: string, value: number): string {
  const decimals = (sample.split(".")[1] ?? "").length
  return value.toFixed(decimals)
}

/**
 * The literal rebuilt with a new triple. Every separator the author wrote
 * between L, C and H is replayed from the match, so a correction moves the
 * numbers and nothing else.
 */
function rebuildLiteral(
  d: DefinitionMatch,
  triple: [string, string, string],
  alphaTail: string
): string {
  return `oklch(${triple[0]}${d.sepLC}${triple[1]}${d.sepCH}${triple[2]}${alphaTail})`
}

/**
 * Where `--fix` rewrites a row's literal: the index into the line/ending
 * `parts` of the one file line that holds it whole, and its column there. Null
 * when the value is not written so the literal can be found without a guess.
 *
 * The literal starts the value, so it is found where the value starts, not on
 * the key's line: a block scalar's text starts on the line after its `>`/`|`
 * header, as the first thing on its first line with text; any other value
 * starts with it, after an opening quote and blanks, on the value's first line
 * — where its first occurrence is the
 * value, since a key cannot contain `oklch(` and a comment follows the value. A
 * value whose literal runs onto the next line, or is written with escapes, does
 * not start with the literal and is left alone.
 */
function locate(
  parts: ReadonlyArray<string>,
  entry: FrontmatterKey,
  literal: string
): { index: number; at: number } | null {
  const { source, sourceLines } = entry
  if (source === undefined || sourceLines === undefined) return null
  if (/^[|>]/.test(source)) {
    // The first line after the header with text on it.
    for (let line = sourceLines[0] + 1; line <= sourceLines[1]; line++) {
      const index = (line - 1) * 2
      const at = parts[index].search(/\S/)
      if (at < 0) continue
      return parts[index].startsWith(literal, at) ? { index, at } : null
    }
    return null
  }
  // An opening quote, and the blanks `tokenText` trims inside it.
  const lead = /^["']?[ \t]*/.exec(source)?.[0].length ?? 0
  if (!source.startsWith(literal, lead)) return null
  const index = (sourceLines[0] - 1) * 2
  const at = parts[index].indexOf(literal)
  return at < 0 ? null : { index, at }
}

interface Judgement {
  finding: OklchFinding
  alphaTo: string
}

function judge(d: DefinitionMatch, line: number): Judgement | null {
  const want = hexToOklab(d.hex)
  if (!want) return null
  const got = lchToOklab(Number(d.L), Number(d.C), Number(d.H))
  const dE = deltaE(got, want.lab)
  // Only compared when BOTH sides declare it — a 6-digit hex carries no alpha.
  const wroteA = oklchAlpha(d.tail)
  const wantA = want.alpha
  const alphaOff =
    wroteA != null &&
    wantA != null &&
    Math.abs(wroteA - wantA) > ALPHA_TOLERANCE
  if (dE <= DELTA_E && !alphaOff) return null

  const from: [string, string, string] = [d.L, d.C, d.H]
  const target = labToLch(want.lab)
  const chroma = like(d.C, target.C)
  // A pure grey carries float residue on a/b (#111111 lands at a≈1e-11), so
  // atan2 reports an arbitrary angle — 90° rather than the author's 0. Once
  // chroma rounds to zero the hue is unobservable, so keep what was written
  // instead of churning the diff with a meaningless number.
  const hueIsMeaningless = Number(chroma) === 0
  // An alpha-only mismatch leaves the colour itself inside tolerance, so keep
  // the authored L/C/H rather than restating them at full precision.
  const colourOff = dE > DELTA_E
  const to: [string, string, string] = colourOff
    ? [like(d.L, target.L), chroma, hueIsMeaningless ? d.H : String(target.H)]
    : from
  // `alphaOff` already narrows wantA to a number — it cannot be true otherwise.
  const alphaTo = alphaOff
    ? d.tail.replace(/\/\s*[\d.]+\s*%?/, (seg) =>
        seg.includes("%")
          ? `/ ${Number((wantA * 100).toFixed(1))}%`
          : `/ ${Number(wantA.toFixed(3))}`
      )
    : d.tail

  return {
    finding: {
      line,
      token: d.token,
      from,
      to,
      deltaE: dE,
      colourOff,
      alpha: alphaOff ? [d.tail.trim(), alphaTo.trim()] : null,
    },
    alphaTo,
  }
}

/**
 * Judge a design.md's annotated OKLCH rows, and with `fix` rewrite the ones
 * that disagree with their hex.
 *
 * A frontmatter YAML cannot read yields nothing to judge — the draft validator's
 * `frontmatter-yaml-invalid` names that cause. The body is never read: tokens
 * live in the frontmatter.
 */
export function auditOklch(
  markdown: string,
  options: { fix: boolean }
): OklchAudit {
  const read = readFrontmatter(markdown)
  const result: OklchAudit = {
    annotated: 0,
    judged: 0,
    findings: [],
    unfixed: [],
    text: markdown,
  }
  if (!read.ok) return result

  // Lines and their own endings, so a rewrite can leave every ending alone.
  const parts = markdown.split(/(\r?\n)/)
  let changed = false

  for (const entry of oklchEntries(read.keys)) {
    // The row as YAML read it, in the one shape the shared rule judges.
    const row = definitionRow(entry.key, entry.value, entry.comment)
    if (!OKLCH_ANNOTATED_DEFINITION.test(row)) continue
    result.annotated++
    const d = matchDefinition(row)
    if (!d) continue
    result.judged++

    const judged = judge(d, entry.line)
    if (!judged) continue
    result.findings.push(judged.finding)
    if (!options.fix) continue

    const literal = entry.value.match(LEADING_OKLCH)?.[0]
    const spot = literal === undefined ? null : locate(parts, entry, literal)
    if (literal === undefined || spot === null) {
      // Not thrown: the script walks the whole catalogue, and a throw here
      // left the slugs before this one rewritten and the ones after untouched.
      result.unfixed.push(judged.finding)
      continue
    }
    const fileLine = parts[spot.index]
    // Spliced by position, not `String.replace`: a replacement string would
    // read a `$&` or `$1` in the author's comment as a substitution pattern.
    parts[spot.index] =
      fileLine.slice(0, spot.at) +
      rebuildLiteral(d, judged.finding.to, judged.alphaTo) +
      fileLine.slice(spot.at + literal.length)
    changed = true
  }

  if (changed) result.text = parts.join("")
  return result
}
