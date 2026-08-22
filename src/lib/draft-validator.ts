import { parseDocument } from "yaml"
import {
  KNOWN_FRONTMATTER_KEYS,
  buildDoc,
  splitFrontmatter,
  stripQuotes,
} from "./content-parser"
import { mapRows } from "./frontmatter-map"
import { CATEGORIES } from "./content-types"
import { auditSourceCitations } from "./source-citations"
import { ALPHA_TOLERANCE, DELTA_E_TOLERANCE } from "./oklch-tolerance"
import { deltaE, hexToOklab, lchToOklab, oklabToLch } from "./oklch-convert"
import { matchDefinition } from "./oklch-sync"
import { conflictingDefinitions, frontmatterBlock } from "./oklch-drift"
import type { ServiceDoc } from "./content-types"

// Deterministic validator for design.md drafts — CODEGEN/CI ONLY, never
// imported by the runtime. Encodes every mechanically checkable rule from
// `.claude/skills/design-md/references/rubric-design.md` so the /design-md
// pipeline (and CI) doesn't rely on a reviewer model "grepping mentally".
// Judgment items (brand fidelity semantics, voice/tone) stay with the
// design-md-reviewer subagent.

export interface ValidationIssue {
  severity: "block" | "warn"
  rule: string
  section: string
  fix: string
}

export interface DraftValidationOptions {
  filePath: string
  expectedSlug?: string
  // Exact frontmatter `logo` the orchestrator resolved. undefined → only the
  // URL-form rule applies when a logo happens to be present.
  expectedLogoUrl?: string
  expectedLang?: "ko" | "en"
}

export interface DraftValidationResult {
  issues: Array<ValidationIssue>
  passed: boolean
  doc: ServiceDoc | null
}

// The 10 standard Stitch v0.1 sections, in required order. Entries may add
// non-standard sections between them (baemin `Key Screens`, krds `Patterns`),
// so coverage is checked as an ordered subsequence, not an exact list.
export const REQUIRED_SECTIONS = [
  "Brand & Style",
  "Colors",
  "Typography",
  "Spacing",
  "Rounded",
  "Elevation & Depth",
  "Shapes",
  "Components",
  "Do's and Don'ts",
  "References",
] as const

const LOGO_URL_FORM =
  /^https:\/\/getdesign\.kr\/logos\/[a-z0-9.-]+\.(?:svg|png|webp|avif)$/
const SLUG_FORM = /^[a-z0-9-]+$/
// Non-OKLCH color notations rejected in yaml token *values*. `oklab`/`lch` etc.
// are also off-catalog but have never appeared; hex/rgb/hsl are the real risks.
const NON_OKLCH_VALUE = /^(?:#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?)\s*\()/
// Prose hex: 3-8 hex digits after `#`, not preceded by URL/fragment/heading
// characters. URLs are masked before matching.
const PROSE_HEX = /(?<![\w&#/])#[0-9a-fA-F]{3,8}\b/

function block(rule: string, section: string, fix: string): ValidationIssue {
  return { severity: "block", rule, section, fix }
}

function warn(rule: string, section: string, fix: string): ValidationIssue {
  return { severity: "warn", rule, section, fix }
}

// Mirror of token-extractor's splitInlineComment: only a whitespace-prefixed
// `#` opens a comment, so `primary: #3182F6` keeps its (offending) hex value
// while `gray-5: oklch(…)  # #FAFAFA` sheds the reference comment.
function stripYamlComment(value: string): string {
  const m = value.match(/\s+#\s?.*$/)
  return m ? value.slice(0, m.index).trim() : value.trim()
}

// ── OKLCH ↔ hex correspondence ──────────────────────────────────────────────
// The catalog writes color tokens as `name: oklch(L C H)  # #RRGGBB`, where the
// hex comment is the provenance record (the brand's published value). Checking
// only the FORMAT lets a wrong conversion ship: a consumer copying the OKLCH
// then renders a different colour than the brand actually uses. That is not
// hypothetical — an audit of the catalog found a systematic lightness bias in
// hand-computed values (the authoring agent has no shell and runs the Oklab
// matrix by hand), so this rule closes the loop.
//
// Deliberate scope limits — each is a silent pass, so they are listed here
// rather than left for the next reader to rediscover:
//   • Only the `oklch(…)  # #hex` order is recognized. The catalog also permits
//     the reverse prose form (`#00C01E (≈ oklch(…))`), but that appears only in
//     prose, never inside a yaml token fence, where this scan runs.
//   • Alpha is compared only when BOTH sides carry it. A 6-digit hex has no
//     alpha to check, so `surface: oklch(1 0 0 / 50%)  # #FFFFFF` passes.
//   • A malformed hex (5 or 7 digits — a typo) fails to parse and is skipped
//     rather than reported; `non-oklch-token-value` and the prose-hex rule are
//     the checks that would notice a badly-shaped colour.

// The judgeable-definition shape is shared with `audit:oklch` rather than
// restated here. A private copy drifted once already: this file required the
// hex to sit immediately after the `#` marker, so the two annotation styles the
// catalog actually uses (`# ≈ #HEX`, `# prose (#HEX)`) were never checked by
// the authoring gate even though it advertises an OKLCH↔hex comparison.
// `matchDefinition` returns the parts by name, so this file never counts
// capture positions.

/**
 * sRGB hex → Oklch, plus the alpha channel when the hex carries one.
 * Accepts #RGB, #RGBA, #RRGGBB, #RRGGBBAA. `null` when unparseable.
 */
function hexToOklch(
  hex: string
): { L: number; C: number; H: number; alpha: number | null } | null {
  const parsed = hexToOklab(hex)
  if (!parsed) return null
  return { ...oklabToLch(parsed.lab), alpha: parsed.alpha }
}

// Colour distance is measured as ΔE in Oklab — the Euclidean distance the space
// was designed for — rather than as separate L/C/H bounds. The bounds and their
// calibration live in `./oklch-tolerance` because `scripts/audit-oklch.ts` judges
// the same question over already-committed data and the two must not drift.

/** Alpha written inside the OKLCH value (`/ 30%` or `/ 0.3`), else null. */
function oklchAlpha(value: string): number | null {
  const m = value.match(/\/\s*([\d.]+)\s*(%?)\s*\)/)
  if (!m) return null
  return m[2] === "%" ? Number(m[1]) / 100 : Number(m[1])
}

/**
 * Compare an authored OKLCH against the hex it is annotated with. Returns the
 * corrected `oklch(…)` string when they disagree, or `null` when they agree
 * (or the hex is unparseable). Shared by the yaml-token and table-row scans.
 */
function compareOklchToHex(
  wrote: { L: number; C: number; H: number },
  alphaPart: string,
  hex: string
): string | null {
  const expected = hexToOklch(hex)
  if (!expected) return null

  // Oklch → Oklab so the two colours can be compared as one distance. Hue needs
  // no special-casing for near-neutrals here: as chroma → 0 the a/b coordinates
  // collapse toward the origin, so a "wrong" hue on a grey contributes almost
  // nothing to ΔE — exactly the behaviour the old NEUTRAL_CHROMA branch faked.
  const got = lchToOklab(wrote.L, wrote.C, wrote.H)
  const want = lchToOklab(expected.L, expected.C, expected.H)
  const distance = deltaE(got, want)

  // Transparency is part of the colour: `oklch(0 0 0 / 3%)  # #00000008` must
  // agree on alpha too, or the token renders at the wrong opacity. Only compared
  // when BOTH sides declare it — a 6-digit hex simply carries no alpha to check.
  const wroteA = oklchAlpha(`${alphaPart})`)
  const alphaOff =
    wroteA != null &&
    expected.alpha != null &&
    Math.abs(wroteA - expected.alpha) > ALPHA_TOLERANCE

  if (distance <= DELTA_E_TOLERANCE && !alphaOff) return null
  const alphaSuffix =
    expected.alpha != null ? ` / ${Math.round(expected.alpha * 100)}%` : ""
  // Hue is a circle: rounding 359.6 up must wrap to 0, not suggest an
  // out-of-range 360.
  const hue = Math.round(expected.H) % 360
  return `oklch(${expected.L.toFixed(3)} ${expected.C.toFixed(3)} ${hue}${alphaSuffix})`
}

function oklchHexMismatch(line: string): string | null {
  const d = matchDefinition(line)
  if (!d) return null
  return compareOklchToHex(
    { L: Number(d.L), C: Number(d.C), H: Number(d.H) },
    d.tail,
    d.hex
  )
}

// A re-audit note, per CLAUDE.md: `> **<label>(YYYY-MM-DD).** …`. Only the
// blockquote, the parenthesised date, and the section-head position are fixed —
// the label is free text, because a label that says what happened ("팔레트 정정")
// carries more than one that says a note exists.
const AUDIT_NOTE = /^>\s*\*\*[^*]*\(\d{4}-\d{2}-\d{2}\)\s*\.?\s*\*\*/
// A dated check stamp inside a References entry. References describes what a
// source *is*; when it was last read is audit history and belongs in the commit.
//
// The verb must qualify the date directly. Finding the two tokens anywhere in
// one parenthetical also flags `(v1.2, 2025-03-19 배포 확인)`, where the date is
// the source's release — a static fact References is *supposed* to carry.
// Synonyms are listed because pinning one word lets the next author write 조회
// and wonder why the rule stayed quiet; the list is still a list, so a verb
// outside it passes silently. That limit is documented in CLAUDE.md.
//
// Two more blind spots, both shared rather than introduced here. Only the
// date→verb order is matched (`확인일: 2026-08-02` passes), which is the order
// CLAUDE.md specifies. And the rule rides on `inReferences`, which an `###`
// inside References switches off — `parseReferences` stops there too, so the
// two agree; a References subsection would go unchecked by both, not just this.
const REF_DATE_STAMP = /\d{4}-\d{2}-\d{2}(?:에)?\s*(?:확인|조회|검증|대조)/

interface BodyScan {
  headings: Array<string>
  yamlTokenIssues: Array<ValidationIssue>
  proseHexIssues: Array<ValidationIssue>
  auditNoteIssues: Array<ValidationIssue>
}

/** The OKLCH-only rule and its hex cross-check, for one `name: value` line.
 *
 *  Shared by the frontmatter scan and the legacy fence scan so the two cannot
 *  drift into disagreeing about what a valid token value is. */
function tokenLineIssues(
  name: string,
  value: string,
  line: string
): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = []
  if (NON_OKLCH_VALUE.test(value)) {
    issues.push(
      block(
        "non-oklch-token-value",
        "tokens",
        `token \`${name}: ${value}\` is not OKLCH — express color token values as \`oklch(L C H)\` (keep the original as a trailing \`# ${value}\` comment if useful).`
      )
    )
  }
  // Warn (not block): the hex comment is a reference value, and a brand may
  // legitimately annotate an approximation. But a real mismatch means a
  // consumer copying the token renders the wrong colour.
  const corrected = oklchHexMismatch(line)
  if (corrected) {
    issues.push(
      warn(
        "oklch-hex-mismatch",
        "tokens",
        `token \`${name}\` declares an OKLCH that does not decode to its annotated hex — expected ${corrected}. Recompute from the hex (or drop the hex comment if the OKLCH is intentionally different).`
      )
    )
  }
  return issues
}

/**
 * Token rules over the frontmatter maps, which is where tokens live.
 *
 * Without this the catalog's central policy checks nothing: a `#3182F6` or an
 * `rgba(…)` written into `colors:` passes `validate:catalog` outright — verified
 * by injecting both into an entry and watching it report PASSED.
 *
 * Colour VALUES only. `typography:` holds font stacks and sizes that the OKLCH
 * rule has no business judging, and a reference (`{colors.x}`) is not a literal.
 */
/**
 * Does the frontmatter actually parse as YAML?
 *
 * Nothing else in this repo asks. `buildDoc` uses a hand-rolled subset parser
 * that, by its own comment, "silently degrades on malformed input by design",
 * and every other gate regexes over the raw text. That was harmless while
 * tokens lived in body fences — nobody parsed those as YAML — but the migration
 * made this block real YAML, and one unquoted font stack can take a whole
 * document down to zero tokens with every gate still reporting success.
 *
 * Structural errors only. Whether a VALUE is sane is the token rules' job; this
 * asks the one question none of them can.
 */
function checkFrontmatterYaml(raw: string): Array<ValidationIssue> {
  // BOM handling lives in `splitFrontmatter`. It used to live here, and not in
  // the other four copies of this regex — which is how a BOM-prefixed file
  // switched this very check off without a word.
  const split = splitFrontmatter(raw)
  if (!split) return []
  return parseDocument(split.frontmatter).errors.map((e) =>
    block(
      "frontmatter-yaml-invalid",
      "frontmatter",
      `frontmatter is not valid YAML: ${e.message.split("\n")[0]}. A standard YAML reader — which is what a consumer of the Google DESIGN.md format uses — cannot read this file's tokens at all.`
    )
  )
}

/**
 * Token values have to be single-line scalars.
 *
 * A block scalar (`primary: >` with the value on following lines) is legal YAML
 * but every reader here is line-based, so the token either vanishes or arrives
 * as the literal `">"`. Measured: writing one into `colors:` drops that token
 * from the sidecar entirely while `validate:catalog` still reports PASSED — the
 * silent loss this whole file exists to stop.
 *
 * Scans all four token maps, not just `colors:`, because the loss does not care
 * which map it happens in.
 */
function checkBlockScalars(fm: Array<string>): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = []
  for (const mapKey of ["colors", "typography", "spacing", "rounded"]) {
    for (const row of mapRows(fm, mapKey)) {
      if (!/^[>|][+-]?[0-9]*$/.test(row.rest.trim())) continue
      issues.push(
        block(
          "block-scalar-token-value",
          "tokens",
          `token \`${row.key}\` in \`${mapKey}:\` opens a block scalar (${row.rest.trim()}) — write token values on one line. Every reader of these maps is line-based, so a block scalar makes the token disappear from the sidecar without any gate noticing.`
        )
      )
    }
  }
  return issues
}

function scanFrontmatterTokens(fm: Array<string>): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = []
  for (const row of mapRows(fm, "colors")) {
    // A head row that only opens a nested map carries no value to judge; the
    // rows beneath it are caught by the indentation rule below.
    if (row.rest.trim() === "") continue
    // Two spaces is the shape the extractor reads. Anything deeper is a token
    // it drops without a word, so the value being VALID does not save it.
    if (row.indent !== 2) {
      issues.push(
        block(
          "noncanonical-token-indent",
          "tokens",
          `token \`${row.key}\` is indented ${row.indent} spaces — the \`colors:\` map is flat and its rows carry exactly two. The extractor reads only the two-space shape, so this token would vanish from the sidecar (and from the site's Tokens tab) while every gate still reported success. Nesting also renames the token, which breaks its \`{colors.${row.key}}\` references.`
        )
      )
    }
    const authored = stripYamlComment(row.rest).trim()
    // A reference resolves elsewhere, so it is not judged as a literal — and it
    // MUST carry quotes, because bare `{...}` is a YAML flow mapping.
    if (/^["']?\{/.test(authored)) continue
    const value = stripQuotes(authored)
    if (value !== authored) {
      issues.push(
        block(
          "quoted-token-value",
          "tokens",
          `token \`${row.key}\` wraps its value in quotes (${authored}) — write colour values bare (\`${value}\`). A quoted value is invisible to \`audit:oklch\` and the drift check, which then pass without judging this token. Quote only a reference such as \`"{colors.name}"\`, which YAML would otherwise read as a flow mapping.`
        )
      )
    }
    issues.push(...tokenLineIssues(row.key, value, row.line))
  }
  return issues
}

function scanBody(body: string): BodyScan {
  const headings: Array<string> = []
  const yamlTokenIssues: Array<ValidationIssue> = []
  const proseHexLines: Array<string> = []
  const auditNoteIssues: Array<ValidationIssue> = []
  let fence: "yaml" | "other" | null = null
  let inReferences = false
  // Audit-note state, reset at every heading. `section` is only for the message.
  let section = "(문서 첫머리)"
  let sectionHasContent = false
  let sectionNoteCount = 0

  for (const line of body.split(/\r?\n/)) {
    if (fence) {
      if (/^\s*```/.test(line)) {
        fence = null
        continue
      }
      if (fence === "yaml") {
        const trimmed = line.trim()
        if (trimmed === "" || trimmed.startsWith("#")) continue
        const m = line.match(/^\s*([^:]+?):\s+(.*\S)\s*$/)
        if (!m) continue
        const value = stripYamlComment(m[2])
        yamlTokenIssues.push(...tokenLineIssues(m[1].trim(), value, line))
      }
      continue
    }
    const fenceOpen = line.match(/^\s*```(\w*)/)
    if (fenceOpen) {
      fence = /^ya?ml$/i.test(fenceOpen[1]) ? "yaml" : "other"
      sectionHasContent = true
      continue
    }
    const heading = line.match(/^##\s+(.+?)\s*$/)
    // Assigned, not latched. Every entry ends with References today, but nothing
    // enforces that — non-standard sections are allowed anywhere — so a flag
    // that only ever turns on would disarm the rule for whatever came after,
    // quietly and forever.
    //
    // The boundary is `#{2,}`, not `##`, matching `parseReferences` in
    // source-citations.ts. Two readings of "where References ends" inside one
    // validator is how a rule goes quiet on a shape nobody tested. `headings`
    // stays H2-only regardless: it feeds the Stitch section-order check, which
    // is about the ten standard H2s.
    if (/^#{2,}\s+/.test(line)) inReferences = heading?.[1] === "References"
    // Two boundaries, deliberately different. `inReferences` ends at any
    // `#{2,}` to match `parseReferences`. The audit-note scope is the H2:
    // CLAUDE.md's "one note per section" means one per `## Colors`, and 9 of 17
    // entries nest `###` inside it — sharing the wider boundary would let a note
    // under a subsection restart the count and pass the very duplicate this
    // rule exists to catch. An H3 is content, so it also ends "first paragraph".
    if (heading) {
      section = heading[1]
      sectionHasContent = false
      sectionNoteCount = 0
      headings.push(heading[1])
      continue
    }
    if (AUDIT_NOTE.test(line)) {
      sectionNoteCount += 1
      if (sectionNoteCount > 1) {
        auditNoteIssues.push(
          warn(
            "audit-note-duplicate",
            "prose",
            `\`## ${section}\` carries ${sectionNoteCount} audit notes. Keep one and overwrite it on re-audit — stacking them recreates at the section head the audit log the rule exists to prevent (git history keeps the earlier result).`
          )
        )
      } else if (sectionHasContent) {
        auditNoteIssues.push(
          warn(
            "audit-note-placement",
            "prose",
            `The audit note in \`## ${section}\` is not the section's first paragraph. Move it directly under the heading — a reader must meet the caveat before the values it qualifies.`
          )
        )
      }
    } else if (inReferences && REF_DATE_STAMP.test(line)) {
      auditNoteIssues.push(
        warn(
          "reference-audit-stamp",
          "prose",
          `A References entry carries a dated check stamp: "${line.trim().slice(0, 80)}". References describes what a source *is* (JS shell, values live at [src:N]); when it was last read belongs in the commit message or the section's audit note.`
        )
      )
    }
    if (line.trim() !== "") sectionHasContent = true
    // A numbered citation entry is not prose. Its human description routinely
    // quotes a brand constant as provenance (`… brand.primaryColor: #3182F6
    // 예시 …`), and URL masking removes the link but not that text — so the rule
    // fired on a line where an inline OKLCH would be pure clutter. Narrowed to
    // the entry shape rather than "everything after the heading" so ordinary
    // prose below References (some entries carry trailing notes) still counts.
    if (inReferences && /^\s*\d+\.\s+https?:\/\//.test(line)) continue
    // NOTE: markdown-table palettes (stitch-format.md allows them; class101 ships
    // 22 such rows) are deliberately NOT scanned. Unlike yaml — where `value #
    // comment` makes adjacency mean "these two describe the same colour" — table
    // column layouts differ per entry (class101 is name|oklch|hex, codeit pairs
    // light-hex|light-oklch|dark-hex|dark-oklch), so positional matching pairs an
    // OKLCH with the *wrong* theme's hex and reports phantom mismatches. Doing it
    // right needs header-row parsing to resolve column roles; until then a table
    // palette is simply out of this rule's scope rather than noisily wrong. An
    // audit of the 22 existing table rows found 0 actual mismatches.
    const masked = line.replace(/https?:\/\/\S+/g, "")
    if (PROSE_HEX.test(masked) && !/oklch\s*\(/i.test(masked)) {
      proseHexLines.push(line.trim().slice(0, 80))
    }
  }

  const proseHexIssues = proseHexLines.map((sample) =>
    warn(
      "hex-in-prose",
      "prose",
      `Prose line carries a hex color with no oklch conversion on the same line: "${sample}". Either convert to OKLCH or add the oklch value inline.`
    )
  )
  return { headings, yamlTokenIssues, proseHexIssues, auditNoteIssues }
}

function checkSections(headings: Array<string>): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = []
  const firstIndex = new Map<string, number>()
  for (const [i, h] of headings.entries()) {
    if ((REQUIRED_SECTIONS as ReadonlyArray<string>).includes(h)) {
      if (firstIndex.has(h)) {
        issues.push(
          block(
            "duplicate-section",
            h,
            `Standard section \`## ${h}\` appears more than once — merge the duplicates into one section.`
          )
        )
      } else {
        firstIndex.set(h, i)
      }
    }
  }

  const missing = REQUIRED_SECTIONS.filter((s) => !firstIndex.has(s))
  for (const s of missing) {
    issues.push(
      block(
        "missing-section",
        s,
        `Standard section \`## ${s}\` is missing. All 10 Stitch sections must be present (write a documented gap line if the brand genuinely lacks the information).`
      )
    )
  }

  // Ordered-subsequence check on first occurrences: the standard sections that
  // ARE present must appear in the standard relative order.
  const present = REQUIRED_SECTIONS.filter((s) => firstIndex.has(s))
  for (let i = 1; i < present.length; i++) {
    const prev = present[i - 1]
    const curr = present[i]
    if ((firstIndex.get(prev) ?? 0) > (firstIndex.get(curr) ?? 0)) {
      issues.push(
        block(
          "section-order",
          curr,
          `\`## ${curr}\` appears before \`## ${prev}\` — standard sections must keep the Stitch v0.1 order (non-standard sections may sit between them).`
        )
      )
    }
  }
  return issues
}

function checkFrontmatterKeys(raw: string): Array<ValidationIssue> {
  // Strip a UTF-8 BOM the same way content-parser's matter() does, so the
  // `^---` anchor still finds the frontmatter fence.
  const withoutBom = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
  const fmBlock = withoutBom.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!fmBlock) return []
  const issues: Array<ValidationIssue> = []
  for (const m of fmBlock[1].matchAll(/^([A-Za-z_][\w-]*):/gm)) {
    if (!KNOWN_FRONTMATTER_KEYS.includes(m[1])) {
      issues.push(
        warn(
          "unknown-frontmatter-key",
          "frontmatter",
          `Unknown frontmatter key \`${m[1]}\` (ignored by the site) — likely a typo for one of: ${KNOWN_FRONTMATTER_KEYS.join(", ")}.`
        )
      )
    }
  }
  return issues
}

// A token name stated twice with different values has no single answer, and
// every consumer resolves it differently and silently: `token-extractor` picks
// one for the sidecar, and the drift gate drops it rather than guess (#243).
// Until that drop landed, a real typo was caught only by the accident of a
// preview disagreeing with whichever value happened to come last.
//
// Not a block, because the shape is sometimes deliberate — `services/wanted.md`
// restates its semantic aliases under `— Light` and `— Dark` headings, and that
// is a legible way to write a themed palette even though nothing downstream can
// read it. What the author needs to know is the price, not that they are wrong.
//
// Reuses `conflictingDefinitions` rather than re-scanning: the set warned about
// and the set the gate skips are the same question, and two regexes kept in
// step by hand would eventually answer it differently.
// Scans BOTH regions. Tokens live in frontmatter now, and `conflictingDefinitions`
// slices that out itself — so passing only `doc.body` left this judging a
// token-free region and reporting nothing, forever. But the body still has to be
// checked too: a draft the skill pipeline hands over may not be migrated yet, and
// component sections legitimately keep fences. A name is reported once even when
// it collides in both.
function checkDuplicateTokens(
  raw: string,
  body: string
): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = []
  const found = new Map<string, Array<string>>()
  for (const [name, values] of [
    ...conflictingDefinitions(raw),
    ...conflictingDefinitions(body),
  ]) {
    if (!found.has(name)) found.set(name, values)
  }
  for (const [name, values] of found) {
    issues.push(
      warn(
        "duplicate-token-value",
        "tokens",
        // `values` holds DISTINCT values, not declarations — say so rather than
        // calling it a count of how many times the name appears, which it is not.
        `Token \`${name}\` is given ${values.length} different values (${values.join(" vs ")}) — nothing downstream can tell which one is authoritative, so \`audit:oklch\` stops comparing this token against the preview entirely. Give the declarations distinct names, or delete the one that is stale. (A per-theme palette that reuses one name for both themes is the common cause; the comparison it costs is the reason to name them apart.)`
      )
    )
  }
  return issues
}

export function validateDraft(
  raw: string,
  opts: DraftValidationOptions
): DraftValidationResult {
  const issues: Array<ValidationIssue> = []

  let doc: ServiceDoc | null = null
  try {
    doc = buildDoc(opts.filePath, raw)
  } catch (e) {
    issues.push(
      block(
        "frontmatter-parse",
        "frontmatter",
        `Frontmatter does not round-trip through buildDoc(): ${e instanceof Error ? e.message : String(e)}`
      )
    )
  }

  issues.push(...checkFrontmatterYaml(raw))
  issues.push(...checkFrontmatterKeys(raw))

  if (doc) {
    const fm = doc.frontmatter
    if (!(CATEGORIES as ReadonlyArray<string>).includes(fm.category)) {
      issues.push(
        block(
          "bad-category",
          "frontmatter",
          `category \`${fm.category}\` is not in the CATEGORIES enum (${CATEGORIES.join(", ")}).`
        )
      )
    }
    if (!SLUG_FORM.test(fm.slug)) {
      issues.push(
        block(
          "bad-slug",
          "frontmatter",
          `slug \`${fm.slug}\` must match ^[a-z0-9-]+$.`
        )
      )
    }
    if (opts.expectedSlug && fm.slug !== opts.expectedSlug) {
      issues.push(
        block(
          "slug-arg-mismatch",
          "frontmatter",
          `frontmatter slug \`${fm.slug}\` differs from the expected slug \`${opts.expectedSlug}\`.`
        )
      )
    }
    if (fm.last_updated === "") {
      issues.push(
        block(
          "missing-last-updated",
          "frontmatter",
          "last_updated is missing — set it to today's date as YYYY-MM-DD."
        )
      )
    }
    // The catalog list, llms.txt, sitemap and OG build are all ordered by
    // created_at, so an entry without one sinks to the bottom regardless of
    // when it was actually added. Blocking here is what stops the skill from
    // shipping another undated entry.
    if (fm.created_at === "") {
      issues.push(
        block(
          "missing-created-at",
          "frontmatter",
          "created_at is missing — set it to the date this entry first lands in the catalog as YYYY-MM-DD (today's date for a new entry)."
        )
      )
    }
    // An entry cannot be added after the last time it was synced. The #194
    // backfill relied on exactly this invariant to pick created_at for four
    // undated entries, so encode it rather than leave it in a commit message.
    // Warn, not block: it flags a likely typo in one of the two dates, and a
    // genuine historical oddity should not stop a contribution.
    if (
      fm.created_at !== "" &&
      fm.last_updated !== "" &&
      fm.created_at > fm.last_updated
    ) {
      issues.push(
        warn(
          "created-at-after-last-updated",
          "frontmatter",
          `created_at (${fm.created_at}) is later than last_updated (${fm.last_updated}) — an entry cannot be added after it was last synced. Check which of the two dates is wrong.`
        )
      )
    }
    if (fm.sources.length === 0) {
      issues.push(
        block(
          "empty-sources",
          "frontmatter",
          "sources is empty — list every public URL the draft cites, in References order."
        )
      )
    }
    // ServiceFrontmatter types lang as "ko" | "en", but buildDoc never
    // validates it — a draft can carry any string at runtime. Widen before
    // comparing so the check survives the type-level narrowing.
    const lang: string = fm.lang
    if (lang !== "ko" && lang !== "en") {
      issues.push(
        block(
          "bad-lang",
          "frontmatter",
          `lang \`${lang}\` must be exactly \`ko\` or \`en\`.`
        )
      )
    }
    if (opts.expectedLang && fm.lang !== opts.expectedLang) {
      issues.push(
        block(
          "lang-arg-mismatch",
          "frontmatter",
          `frontmatter lang \`${fm.lang}\` differs from the expected lang \`${opts.expectedLang}\`.`
        )
      )
    }
    if (opts.expectedLogoUrl) {
      if (fm.logo !== opts.expectedLogoUrl) {
        issues.push(
          block(
            "expected-logo-mismatch",
            "frontmatter",
            `frontmatter \`logo\` must be exactly \`${opts.expectedLogoUrl}\` (got \`${fm.logo ?? "nothing"}\`) — the absolute URL form, never a site-relative shortcut.`
          )
        )
      }
    } else if (fm.logo !== undefined && !LOGO_URL_FORM.test(fm.logo)) {
      issues.push(
        block(
          "logo-url-form",
          "frontmatter",
          `frontmatter \`logo\` \`${fm.logo}\` must be a fully-qualified https://getdesign.kr/logos/*.{svg,png,webp,avif} URL.`
        )
      )
    }

    for (const c of auditSourceCitations(fm.slug, fm.sources, doc.body)) {
      issues.push({
        severity: c.severity,
        rule: c.rule,
        section: "citations",
        fix: c.message,
      })
    }
  }

  const body = doc ? doc.body : raw
  const scan = scanBody(body)
  issues.push(...checkSections(scan.headings))
  issues.push(...checkDuplicateTokens(raw, body))
  const fmLines = frontmatterBlock(raw).split(/\r?\n/)
  issues.push(...scanFrontmatterTokens(fmLines))
  issues.push(...checkBlockScalars(fmLines))
  issues.push(...scan.yamlTokenIssues)
  issues.push(...scan.proseHexIssues)
  issues.push(...scan.auditNoteIssues)

  return {
    issues,
    passed: !issues.some((i) => i.severity === "block"),
    doc,
  }
}
