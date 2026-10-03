import { isAlias, isMap, isNode, isScalar, isSeq, parseDocument } from "yaml"
import { lint } from "@google/design.md/linter"
import {
  CONSUMED_KEYS,
  FRONTMATTER_KEY_NAME,
  FRONTMATTER_MAP_KEYS,
  KNOWN_FRONTMATTER_KEYS,
  buildDoc,
  matter,
  splitFrontmatter,
  stripQuotes,
} from "./content-parser"
import { isHeadRow, mapRows } from "./frontmatter-map"
import { CATEGORIES } from "./content-types"
import { auditSourceCitations } from "./source-citations"
import { ALPHA_TOLERANCE, DELTA_E_TOLERANCE } from "./oklch-tolerance"
import { deltaE, hexToOklab, lchToOklab, oklabToLch } from "./oklch-convert"
import { matchDefinition } from "./oklch-sync"
import { conflictingDefinitions, frontmatterBlock } from "./oklch-drift"
import { KNOWN_SPEC_LIMITATIONS } from "./spec-limitations"
import { LOGO_TAKEDOWNS } from "./logo-takedowns"
import { extractTokensFromMarkdown, isShadowValue } from "./token-extractor"
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
  // Exact frontmatter `logo` the orchestrator resolved. undefined → no exact
  // match is asked for, but `missing-logo` still blocks an absent logo and the
  // URL-form rule judges a present one — leaving this out never makes the
  // logo optional.
  expectedLogoUrl?: string
  // Slugs exempt from `missing-logo` because a takedown removed their logo.
  // Defaults to the recorded list; tests pass their own.
  logoTakedowns?: ReadonlyMap<string, string> | ReadonlySet<string>
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
// The four H2s whose tokens live in frontmatter maps. A yaml fence under one of
// them is the retired token fence; under any other heading it is a spec fence
// (shadows, motion, component specs) and stays, scanned by the token rules.
const TOKEN_SECTIONS: ReadonlySet<string> = new Set([
  "Colors",
  "Typography",
  "Spacing",
  "Rounded",
])

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
  fenceIssues: Array<ValidationIssue>
  /** A fence ran to the end of the body, so `headings` stops where it opened. */
  unclosedFence: boolean
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

/** The frontmatter as YAML reads it, or null when the file has none. */
type FrontmatterDoc = ReturnType<typeof parseDocument> | null

/**
 * Parsed once and handed to every check that needs the YAML view, so they all
 * judge the same reading of the block.
 *
 * BOM handling lives in `splitFrontmatter`. It used to live in the YAML check,
 * and not in the other four copies of this regex — which is how a BOM-prefixed
 * file switched that check off without a word.
 */
function parseFrontmatter(raw: string): FrontmatterDoc {
  const split = splitFrontmatter(raw)
  return split ? parseDocument(split.frontmatter) : null
}

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
function checkFrontmatterYaml(fmDoc: FrontmatterDoc): Array<ValidationIssue> {
  if (!fmDoc) return []
  return fmDoc.errors.map((e) =>
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
/**
 * Working notes must not ship.
 *
 * The migration script left `<!-- 이전 시 보존된 값. 산문으로 다듬을 것. -->` above
 * the rows it could not place, and eight entries were published with it — an
 * internal TODO addressed to the author, sitting in a document that agents and
 * readers consume. No gate looked for it: an HTML comment is not a token, not
 * prose the citation rules judge, and not a section heading.
 */
function checkWorkingMarkers(body: string): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = []
  for (const line of body.split(/\r?\n/)) {
    if (!/^<!--.*(?:다듬을 것|TODO|FIXME|XXX)/.test(line.trim())) continue
    issues.push(
      block(
        "working-marker-in-prose",
        "prose",
        `\`${line.trim().slice(0, 60)}\` is a note to the author, not catalog content — finish the passage or delete the marker. This document is published as-is to readers and to the DESIGN.md endpoint.`
      )
    )
  }
  return issues
}

// Fence markers, shared by every reader of the body so they agree on where a
// fence starts and ends. A backtick run followed by another backtick on the
// line is inline code at the start of prose (```yaml``` 는 …), not a fence —
// CommonMark forbids backticks in a backtick fence's info string. Reading it
// as a fence would leave it open to the end of the document. The info string
// may follow a space (``` tsx), as CommonMark allows. Any indent opens one:
// a fence inside a list item sits four or more spaces in, and the yaml-fence
// block must see it. The cost is that backticks inside a four-space indented
// code block also read as a fence — a gap the reference check accepts.
const FENCE_OPEN = /^\s*(`{3,}(?=[^`]*$)|~{3,})\s*(\w*)/
// A fence closes only on a bare run of the same character at least as long as
// the one that opened it, so a ````md example showing a ```yaml block does not
// close early.
const FENCE_CLOSE = /^\s*(`{3,}|~{3,})\s*$/

// The frontmatter maps a `{map.name}` reference can point into — the same list
// the unknown-key rule allows, so a new map cannot drop out of this check.
const REFERENCE_MAPS: ReadonlySet<string> = new Set(FRONTMATTER_MAP_KEYS)
// Namespaces authors reach for that no entry declares as a map. Each was found
// in the catalog pointing at nothing; the advice says where the value lives.
const PHANTOM_MAPS: ReadonlyMap<string, (name: string) => string> = new Map([
  [
    "motion",
    (name: string) =>
      `There is no \`motion:\` map — durations and easings live in a \`\`\`text fence. Write \`${name}\` as a plain code span without braces.`,
  ],
  ["shadow", () => "Shadows live in the `elevation:` map."],
  ["radius", () => "Radii live in the `rounded:` map."],
  [
    "layout",
    (name: string) =>
      `There is no \`layout:\` map. Write \`${name}\` as a plain code span without braces, or reference the \`spacing:\`/\`grid:\` token that holds the value.`,
  ],
])
// Where a reference may start. What follows the dot is read up to the matching
// brace by `readReference`, not by this pattern: a character class for the name
// would decide what counts as a reference, and whatever it left out would pass
// unjudged (`{motion.dur-fast/base/slow}` did).
// Letters of either case: map names are lowercase, so a capitalised namespace
// (`{Colors.primary}`) is a typo to judge, not something to skip.
// Not after another `{` or a `\`: a doubled brace (`{{user.name}}`) is
// handlebars and an escaped one (`\{colors.x\}`) is literal text, both outside
// the scope below.
// Nor after a `$`: `${styles.root}` in a template literal is interpolation.
// SCSS's `#{…}` is too, but only inside a stylesheet fence — a token-line
// comment written `#{colors.x}` is still the sidecar's `note` (see
// `stylesheetFenceTest`).
// A namespace may carry `-`, digits or `_` (`{z-index.modal}`, `{colors2.x}`):
// a namespace pattern narrower than that let those skip the check entirely.
const REFERENCE_START = /(?<![{\\$])\{([A-Za-z][\w-]*)\./g
// Namespaces that are not frontmatter maps and are left alone on purpose:
// `{component.x}` points at a `###` heading, and `{group.name}` is how prose
// spells the syntax itself. Every other namespace is judged, so a misspelled
// map (`{colours.primary}`) blocks instead of passing unread.
const NON_MAP_NAMESPACES: ReadonlySet<string> = new Set(["component", "group"])
// One key, or a property path into a composite token (`body-m.fontSize`).
// Key characters are Unicode-aware: the map reader takes any non-space,
// non-colon key, so a Korean key (`빨강:`) is as valid as an ASCII one.
const SINGLE_KEY = /^[\p{L}\p{N}_.-]+$/u
// A family of keys: `*` for any run, `{intent}` for one placeholder segment.
const KEY_PATTERN = /^(?:[\p{L}\p{N}_.-]|\*|\{[\p{L}\p{N}_-]+\})+$/u
// Fences whose contents are DESIGN.md prose. Any other language is source
// code: there a bare brace is the language's own (`bg={colors.brand}` is a JSX
// expression), and a token reference lives only in a comment
// (`// border-radius: {rounded.radius-sm}`) or a string literal
// (``bg={`{colors.primary}`}``) — so only those parts are read.
// Plain-text and Markdown spellings count as prose too: a reference in a
// ```txt or ```md fence is read like one in a ```text fence.
const PROSE_FENCE_LANGUAGES: ReadonlySet<string> = new Set([
  "",
  "text",
  "txt",
  "plain",
  "plaintext",
  "md",
  "markdown",
])
// Stylesheets are read in full too. A CSS brace opens a rule block
// (`.a { color: red; }`), so `{map.name}` in a declaration value
// (`border-radius: {rounded.pill};`) can mean nothing but a reference. They are
// not prose, though: their property names are not names the fence defines.
const STYLESHEET_FENCE_LANGUAGES: ReadonlySet<string> = new Set([
  "css",
  "scss",
  "sass",
  "less",
])
// Data fences quote a publication — a brand's Tokens Studio / DTCG / Style
// Dictionary JSON — whose aliases (`"{spacing.4}"`) belong to that system even
// when they share this catalog's map names, and the author cannot rewrite
// them. Nothing inside is read.
const DATA_FENCE_LANGUAGES: ReadonlySet<string> = new Set([
  "json",
  "jsonc",
  "json5",
])
const WHOLE_FENCE_LANGUAGES: ReadonlySet<string> = new Set([
  ...PROSE_FENCE_LANGUAGES,
  ...STYLESHEET_FENCE_LANGUAGES,
])

// A frontmatter node as the reference check reads it.
type YamlNode =
  | string
  | number
  | boolean
  | null
  | Array<YamlNode>
  | { [key: string]: YamlNode }

function isYamlMap(
  node: YamlNode | undefined
): node is { [key: string]: YamlNode } {
  return typeof node === "object" && node !== null && !Array.isArray(node)
}

/**
 * The frontmatter as written. `toJS()` normalises numeric keys (`1.0` becomes
 * `1`, `010` becomes `10`), so a declared `{spacing.1.0}` would miss and an
 * undeclared `{spacing.1}` would hit. Keys keep their source spelling here.
 * An alias or any other node reads as null.
 */
// eslint-disable-next-line no-restricted-syntax -- YAML AST nodes are untyped at the parse boundary.
function rawNode(node: unknown): YamlNode {
  if (isMap(node)) {
    const out: { [key: string]: YamlNode } = {}
    for (const item of node.items) {
      const key = isScalar(item.key)
        ? String(item.key.source ?? item.key.value)
        : String(item.key)
      out[key] = rawNode(item.value)
    }
    return out
  }
  if (isSeq(node)) return node.items.map((item) => rawNode(item))
  if (isScalar(node)) {
    const v = node.value
    return typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
      ? v
      : null
  }
  return null
}

// A standalone `{word}`: not glued, on either side, to an ASCII identifier
// character, a `=`
// (JSX `spacing={4}`), a `$` or `@` (SCSS `#{$x}`, LESS `@{name}`) or a `/`
// (a path segment such as `/{section}/llms.txt`), which is how template
// segments, props, interpolation and routes are written. Korean text may touch it — `{typography}로` is prose with a particle,
// not a template.
// A doubled brace (`{{primary}}`) is handlebars-style template syntax and is
// left out too.
const DOTLESS_REFERENCE =
  /(?<![A-Za-z0-9_=$@{/\\-])\{([\p{L}\p{N}_-]+)\}(?![A-Za-z0-9_}=$@/-])/gu

/** Whether an offset of `raw` lies inside a stylesheet fence (`css`, `scss`…). */
function stylesheetFenceTest(raw: string): (offset: number) => boolean {
  const spans: Array<[number, number]> = []
  let open: { char: string; length: number; from: number } | null = null
  let offset = 0
  for (const line of raw.split("\n")) {
    const next = offset + line.length + 1
    if (open === null) {
      const fence = line.match(FENCE_OPEN)
      if (fence && STYLESHEET_FENCE_LANGUAGES.has(fence[2].toLowerCase()))
        open = { char: fence[1][0], length: fence[1].length, from: next }
      else if (fence)
        open = { char: fence[1][0], length: fence[1].length, from: -1 }
    } else {
      const close = line.match(FENCE_CLOSE)
      if (
        close &&
        close[1][0] === open.char &&
        close[1].length >= open.length
      ) {
        if (open.from >= 0) spans.push([open.from, offset])
        open = null
      }
    }
    offset = next
  }
  if (open !== null && open.from >= 0) spans.push([open.from, raw.length])
  return (at) => spans.some(([from, to]) => at >= from && at < to)
}

/** Row names defined inside prose fences (`dur-base: 200ms` in a text fence). */
function proseFenceKeys(raw: string): Set<string> {
  const keys = new Set<string>()
  let open: { char: string; length: number; prose: boolean } | null = null
  for (const line of raw.split("\n")) {
    if (open === null) {
      const fence = line.match(FENCE_OPEN)
      if (fence) {
        open = {
          char: fence[1][0],
          length: fence[1].length,
          prose: PROSE_FENCE_LANGUAGES.has(fence[2].toLowerCase()),
        }
      }
      continue
    }
    const close = line.match(FENCE_CLOSE)
    if (close && close[1][0] === open.char && close[1].length >= open.length) {
      open = null
      continue
    }
    const row = open.prose ? line.match(/^\s*([\p{L}\p{N}_.-]+):/u) : null
    if (row) keys.add(row[1])
  }
  return keys
}

/** What is still open at the end of a source-code line. */
interface SourceScan {
  blockComment: boolean
  htmlComment: boolean
  template: boolean
}

/**
 * One source-code line with everything but its comments and string literals
 * blanked to spaces. A block comment (slash-star, JSDoc, or `<!-- -->`) and a
 * template literal
 * carry over to the next line through `state`, which lives for one fence;
 * a `'` or `"` string ends with its line. An apostrophe inside a word is not
 * a quote, so JSX text (`Don't`) does not unmask what follows it.
 */
function keepCommentsAndLiterals(
  line: string,
  state: SourceScan,
  keepStrings = true
): string {
  let out = ""
  let quote: string | null = state.template ? "`" : null
  // Where in `line` the open quote started, when it started on this line.
  let quoteAt = -1
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (state.htmlComment) {
      out += c
      if (line.startsWith("-->", i)) {
        out += "->"
        i += 2
        state.htmlComment = false
      }
    } else if (state.blockComment) {
      out += c
      if (c === "*" && line[i + 1] === "/") {
        out += "/"
        i++
        state.blockComment = false
      }
    } else if (quote !== null) {
      // With `keepStrings` off the string is scanned for its end but blanked.
      out += keepStrings ? c : " "
      if (c === "\\") {
        // Emit exactly what was consumed: a backslash that ends the line (a
        // JS line continuation) has no next character, and an extra space
        // here would shift every later offset against the other masks.
        const next = line[i + 1] ?? ""
        out += keepStrings ? next : " ".repeat(next.length)
        i++
      } else if (c === quote) {
        // A template carried in from an earlier line closes here, and the
        // state has to say so now: the unclosed-quote recovery below re-reads
        // the rest of the line with this same state.
        if (quote === "`") state.template = false
        quote = null
      }
    } else if (line.startsWith("<!--", i)) {
      out += "<!--"
      i += 3
      state.htmlComment = true
    } else if (c === "/" && line[i + 1] === "/") {
      // The rest of the line is a comment; no string is open here, so a
      // template literal closed earlier on this line stays closed.
      state.template = false
      return out + line.slice(i)
    } else if (c === "/" && line[i + 1] === "*") {
      out += "/*"
      i++
      state.blockComment = true
    } else if (
      c === '"' ||
      c === "`" ||
      // An apostrophe inside a word (`Don't` in JSX text) opens no string.
      (c === "'" && !/[\p{L}\p{N}]/u.test(line[i - 1] ?? ""))
    ) {
      out += keepStrings ? c : " "
      quote = c
      quoteAt = i
    } else {
      out += " "
    }
  }
  // A `'` or `"` string cannot run past its line in JS/TS. One still open here
  // was never a string — an inch mark (`6.1"`) or `'90s` in JSX text — so the
  // quote is text, and the rest of the line is read again as code.
  if ((quote === "'" || quote === '"') && quoteAt >= 0) {
    return (
      out.slice(0, quoteAt) +
      " " +
      keepCommentsAndLiterals(line.slice(quoteAt + 1), state, keepStrings)
    )
  }
  state.template = quote === "`"
  return out
}

/**
 * The file with fence contents blanked to spaces, so line numbers and offsets
 * still line up with `raw`. A fence whose language is in `keep` stays whole.
 * Every other (source-code) fence keeps what `source` names: nothing, its
 * comments, or its comments and string literals.
 */
function maskFences(
  raw: string,
  keep: ReadonlySet<string>,
  source: "nothing" | "comments" | "comments+strings" = "nothing"
): string {
  let open: { char: string; length: number } | null = null
  let masking = false
  let dataFence = false
  let scan: SourceScan = {
    blockComment: false,
    htmlComment: false,
    template: false,
  }
  return raw
    .split("\n")
    .map((line) => {
      if (open === null) {
        const fence = line.match(FENCE_OPEN)
        if (!fence) return line
        open = { char: fence[1][0], length: fence[1].length }
        masking = !keep.has(fence[2].toLowerCase())
        dataFence = DATA_FENCE_LANGUAGES.has(fence[2].toLowerCase())
        scan = { blockComment: false, htmlComment: false, template: false }
        return line
      }
      const close = line.match(FENCE_CLOSE)
      if (
        close &&
        close[1][0] === open.char &&
        close[1].length >= open.length
      ) {
        open = null
        return line
      }
      if (!masking) return line
      return source === "nothing" || dataFence
        ? " ".repeat(line.length)
        : keepCommentsAndLiterals(line, scan, source === "comments+strings")
    })
    .join("\n")
}

/** The text between `{ns.` and its matching `}`, or null if the line ends first. */
function readReference(text: string, from: number): string | null {
  let depth = 1
  for (let i = from; i < text.length; i++) {
    const c = text[i]
    if (c === "\n") return null
    if (c === "{") depth++
    else if (c === "}" && --depth === 0) return text.slice(from, i)
  }
  return null
}

/**
 * The closest known name within two edits of `ns`, if one is. The non-map
 * namespaces are candidates too: `{componet.x}` means `{component.x}` (one edit),
 * and suggesting `{components.x}` (two) would send the author into another block.
 */
function closestNamespace(ns: string): string | undefined {
  const distance = (a: string, b: string): number => {
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
    for (let i = 1; i <= a.length; i++) {
      const row = [i]
      for (let j = 1; j <= b.length; j++) {
        row[j] = Math.min(
          prev[j] + 1,
          row[j - 1] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        )
      }
      prev = row
    }
    return prev[b.length]
  }
  return [...NON_MAP_NAMESPACES, ...REFERENCE_MAPS, ...PHANTOM_MAPS.keys()]
    .map((m) => ({ m, d: distance(ns, m) }))
    .filter(({ d }) => d <= 2)
    .sort((x, y) => x.d - y.d)[0]?.m
}

/** A key pattern as a regex: `*` is any run, `{name}` one placeholder segment. */
function segmentPattern(pattern: string): RegExp {
  const body = pattern
    .split(/(\*|\{[\p{L}\p{N}_-]+\})/u)
    .map((part) =>
      part === "*"
        ? "[\\p{L}\\p{N}_.-]*"
        : part.startsWith("{")
          ? "[\\p{L}\\p{N}_-]+"
          : part.replace(/[.]/g, "\\.")
    )
    .join("")
  return new RegExp(`^${body}$`, "u")
}

/**
 * Every `{map.name}` reference has to name a key that map declares.
 *
 * The entry is published verbatim as the standard DESIGN.md, and the reference
 * syntax exists so a consumer can resolve "use `{colors.primary-50}`" to a value
 * without guessing (stitch-format.md). A reference to a key that is not there
 * promises a lookup that fails. A 2026-09 sweep found 221 such references in 11
 * entries, and none of the gates saw them: a `radius-` prefix dropped
 * (`{rounded.pill}`), a font from `fonts:` filed under `typography`, a
 * `motion:` map no entry has, and brand role names (`bg-brand-solid`) the entry
 * lists only in a prose table. Four of them sat in token-line comments, so they
 * reached the sidecar's `note` and `use-design-md` with it.
 *
 * Three shapes, judged differently:
 *   • one key (`{colors.primary}`, `{typography.body-m.fontSize}`) must exist
 *     with a value;
 *   • a pattern (`{colors.gray-*}`, `{colors.border-{intent}}`) names a family,
 *     so at least one declared key must match it;
 *   • anything else (`{motion.dur-fast/base/slow}`) is not one reference.
 *
 * Scope — what is judged, and what is deliberately not. The same list is in
 * CLAUDE.md; keep the two in step.
 *   • `{ns.…}` with a lowercase namespace: the reference syntax itself. A known
 *     map or phantom is judged in every shape (`{motion.a/b/c}` blocks, and so
 *     does a file list starting with a map name, `{colors.ts,fonts.ts}`). Any
 *     other namespace but NON_MAP_NAMESPACES is judged only when what follows
 *     looks like a reference — a single key or a pattern — so `{palette.x}`
 *     blocks and a brace-expanded file list (`{app.jsx, screens.jsx}`) or a
 *     packed typo (`{colours.a/b}`) is left.
 *   • A capitalised namespace, only when it is a case slip or near miss of a
 *     known name (`{Colors.primary}` blocks, `{React.Fragment}` is left).
 *   • A standalone `{word}` naming a map this entry declares (blocks), or
 *     another map, a phantom, a declared key or a text-fence row used in prose
 *     (warns — see the dotless pass below).
 *   • Prose and stylesheet fences are read in full; data fences (json) are
 *     not read at all (see DATA_FENCE_LANGUAGES). In a source-code fence,
 *     only `//`,
 *     `/* … *\/` and `<!-- -->` comments and string literals are read — the
 *     rest is the language's own syntax (see PROSE_FENCE_LANGUAGES). There,
 *     only this catalog's map names are judged inside a string literal: an
 *     unknown or phantom namespace there may be another token system's alias
 *     (DTCG `"{color.carrot.600}"`, `"{radius.sm}"`). A comment is judged
 *     like prose.
 *   • Out of scope by design: bare braces in source code, `#` comments and
 *     HTML text nodes inside a source fence (the frontmatter's `#` comments
 *     are read), template interpolation (`${x.y}`, and SCSS `#{x.y}` in a stylesheet fence), a dotless `{word}`
 *     glued to an ASCII identifier character or to `=`/`$`/`@`/`/` (`color-{role}`, `spacing={4}`, `@{name}`,
 *     `/{section}/` — a dotted reference is judged glued or not, so a JSX
 *     example belongs in a `tsx` fence),
 *     doubled braces (`{{user.name}}`), escaped braces (`\{colors.x\}`),
 *     whitespace inside the braces (`{ colors.x }`), a reference split across
 *     lines, and backticks inside a
 *     four-space indented code block, which read as a fence like one nested in
 *     a list item. None is the reference syntax, and chasing each one adds a
 *     heuristic with its own false positives.
 *   • `//` in a source fence is a line comment whatever the language, so the
 *     rest of the line is read after an unquoted URL or Python's `//`. A data
 *     fence is known by the first word of its info string only (`{.json}` and
 *     `jsonl` are not data fences).
 *   • A fence inside a blockquote (`> ```tsx`) is not recognised as a fence,
 *     so its lines are read as prose — a JSX example belongs in a `tsx` fence
 *     outside the quote.
 *
 * Scans the frontmatter (its token-line comments become the sidecar's `note`)
 * and the body.
 */
function checkTokenReferences(
  raw: string,
  fmDoc: FrontmatterDoc
): Array<ValidationIssue> {
  // An unparseable block already blocks as `frontmatter-yaml-invalid`; judging
  // references against a half-read map would only add noise to that finding.
  if (!fmDoc || fmDoc.errors.length > 0) return []
  const root = rawNode(fmDoc.contents)
  const maps = isYamlMap(root) ? root : {}
  // A key with no value (`brand:` and nothing after it) resolves to nothing.
  const resolves = (map: YamlNode | undefined, name: string): boolean => {
    if (!isYamlMap(map)) return false
    if (Object.hasOwn(map, name)) return map[name] !== null
    let cur: YamlNode | undefined = map
    for (const part of name.split(".")) {
      if (!isYamlMap(cur) || !Object.hasOwn(cur, part)) return false
      cur = cur[part]
    }
    return cur !== null
  }
  const matchesPattern = (map: YamlNode | undefined, pattern: string) => {
    if (!isYamlMap(map)) return false
    const re = segmentPattern(pattern)
    if (Object.keys(map).some((key) => re.test(key) && map[key] !== null))
      return true
    // A pattern over a property path (`{typography.*.fontSize}`) walks it one
    // segment at a time, the way `resolves` walks a single one.
    const walk = (node: YamlNode | undefined, segs: Array<string>): boolean => {
      if (segs.length === 0) return node !== null && node !== undefined
      if (!isYamlMap(node)) return false
      const seg = segmentPattern(segs[0])
      return Object.keys(node).some(
        (key) => seg.test(key) && walk(node[key], segs.slice(1))
      )
    }
    return pattern.includes(".") && walk(map, pattern.split("."))
  }
  const text = maskFences(raw, WHOLE_FENCE_LANGUAGES, "comments+strings")
  // Prose alone, with every fence blanked — for names a text fence defines.
  const prose = maskFences(raw, new Set())
  // Everything but source-code string literals — a reference missing here sits
  // inside one.
  const withoutSourceStrings = maskFences(
    raw,
    WHOLE_FENCE_LANGUAGES,
    "comments"
  )
  const issues: Array<ValidationIssue> = []
  const reported = new Set<string>()
  const inStylesheet = stylesheetFenceTest(raw)
  for (const start of text.matchAll(REFERENCE_START)) {
    // SCSS interpolation (`#{color.adjust($c, …)}`, `#{colors.x}`).
    if (text[start.index - 1] === "#" && inStylesheet(start.index)) continue
    const ns = start[1]
    const phantom = PHANTOM_MAPS.get(ns)
    if (NON_MAP_NAMESPACES.has(ns)) continue
    const known = phantom !== undefined || REFERENCE_MAPS.has(ns)
    // Inside a source-code string literal, braces can belong to another token
    // system with the same shape — a DTCG / Style Dictionary alias in a brand's
    // published JSON (`"$value": "{color.carrot.600}"`, `"{radius.sm}"`).
    // Only this catalog's own map names are judged there; a phantom (`radius`,
    // `shadow`, `motion`, `layout`) is a common group name in those systems,
    // so it is left too. A comment is the catalog's own note
    // (`// transition: {motion.ease-standard}`) and is judged like prose.
    if (
      !REFERENCE_MAPS.has(ns) &&
      !withoutSourceStrings.startsWith(start[0], start.index)
    )
      continue
    const name = readReference(text, start.index + start[0].length)
    if (name === null) continue
    const ref = `{${ns}.${name}}`
    if (reported.has(ref)) continue
    const single = SINGLE_KEY.test(name)
    const pattern = !single && KEY_PATTERN.test(name)
    // A namespace this check does not know is judged only when what follows
    // looks like a reference. `{Components.jsx, Screens.jsx}` (toss) and
    // `{app.jsx, screens.jsx}` are brace-expanded file lists, not references.
    // A known map keeps judging every shape, so `{motion.a/b/c}` still blocks.
    // A near miss does not: `{color.adjust($c, …)}` (sass:color) and
    // `src/{color.ts, font.ts}` are shaped exactly like a misspelled packing.
    if (!known && !single && !pattern) continue
    // …and only when, lowercased, it is a name this check knows or a near miss
    // of one. `{React.Fragment}` is a code identifier, not a misspelled map.
    const lowerNs = ns.toLowerCase()
    const casedNear =
      ns === lowerNs
        ? undefined
        : NON_MAP_NAMESPACES.has(lowerNs) || REFERENCE_MAPS.has(lowerNs)
          ? lowerNs
          : closestNamespace(lowerNs)
    if (ns !== lowerNs && casedNear === undefined) continue
    if (known && phantom === undefined) {
      // A declared key resolves whatever its shape: `w-1/2` or `1.0` is
      // one key as written, not shorthand or a path.
      if (resolves(maps[ns], name)) continue
      if (pattern && matchesPattern(maps[ns], name)) continue
    }
    reported.add(ref)
    const elsewhere = single
      ? [...REFERENCE_MAPS].filter(
          (other) => other !== ns && resolves(maps[other], name)
        )
      : []
    const redirect =
      elsewhere.length > 0
        ? `\`${name}\` is declared in \`${elsewhere.join("`, `")}:\` — reference it there (\`{${elsewhere[0]}.${name}}\`).`
        : ""
    let what: string
    let advice: string
    if (!known && ns !== ns.toLowerCase()) {
      what = `writes its namespace as \`${ns}\``
      const nearPhantom =
        casedNear === undefined ? undefined : PHANTOM_MAPS.get(casedNear)
      // A phantom is no map either, so pointing at it would only move the
      // block; its own advice says where the value lives.
      advice =
        "Namespaces are the lowercase map names. " +
        (nearPhantom !== undefined
          ? nearPhantom(name)
          : `Did you mean \`{${casedNear}.${name}}\`?`)
    } else if (!known) {
      const near = closestNamespace(ns)
      what = `points into \`${ns}:\`, which is not a frontmatter map`
      const nearPhantom =
        near === undefined ? undefined : PHANTOM_MAPS.get(near)
      advice =
        (nearPhantom !== undefined
          ? `${nearPhantom(name)} `
          : near
            ? `Did you mean \`{${near}.${name}}\`? `
            : "") +
        `The maps a reference can name are ${[...REFERENCE_MAPS].map((m) => `\`${m}\``).join(", ")}.`
    } else if (phantom !== undefined) {
      what = `points into \`${ns}:\`, a map no catalog entry has`
      advice =
        redirect ||
        (single || pattern
          ? phantom(name)
          : `${phantom(name.split(/[^\p{L}\p{N}_.-]/u)[0])} \`${name}\` packs several names into one — write each on its own.`)
    } else if (single) {
      what = `names no key in this entry's \`${ns}:\` map`
      // `{components.x}` is most often the heading reference `{component.x}`
      // with one letter too many; the generic advice would have the author
      // strip the braces and lose the link to the \`###\` entry.
      const heading =
        ns === "components"
          ? `If you meant the \`### ${name}\` entry, the heading reference is \`{component.${name}}\` (singular). `
          : ""
      advice =
        redirect ||
        heading +
          "Fix the name if the value is declared under another key. If it is a name the brand publishes but this entry does not tokenize, write it as a plain code span without braces, and never add a token whose value no [src:N] supports."
    } else if (pattern) {
      what = `is a pattern that no key in this entry's \`${ns}:\` map matches`
      advice =
        "A pattern stands for a family of declared keys, so it has to match at least one — check the prefix against the keys as written."
    } else {
      what = "is not one reference"
      advice = `A \`{${ns}.name}\` names a single key. Write each key as its own reference, or write the shorthand as a plain code span without braces.`
    }
    issues.push(
      block(
        "unresolved-token-ref",
        "tokens",
        `\`${ref}\` ${what}. ${advice} This file is published as the standard DESIGN.md, where the reference promises a lookup a consumer cannot complete.`
      )
    )
  }
  // A reference that lost its dot. `{word}` is also ordinary template syntax
  // (`color-{role}-{intent}`, `spacing={4}`, `'{company} · {region}'`), so only
  // a standalone one is read, and only when the word is a name this entry
  // defines: a map, a declared key, or a row of a text fence. baemin's
  // `{ease-out}` and wanted's `{typography}` were both this shape.
  const fenceNames = proseFenceKeys(raw)
  for (const hit of text.matchAll(DOTLESS_REFERENCE)) {
    const [ref, word] = hit
    // Inside a source-code string it is someone else's placeholder — an i18n
    // key (`t("{title}")`) or another token system — as for dotted references.
    if (!withoutSourceStrings.startsWith(ref, hit.index)) continue
    if (reported.has(ref)) continue
    const lower = word.toLowerCase()
    const holders = [...REFERENCE_MAPS].filter((m) => resolves(maps[m], word))
    let advice: string
    // The name of a map this entry declares is exact — no placeholder means
    // "the whole colours map" — so it blocks. Everything else only warns: a
    // map the entry lacks, a phantom (`{layout}`), a declared key or a fence
    // row can each share its name with an ordinary placeholder (`title` and
    // `body` are keys in samsung-one-ui and baemin), and the warning lets a
    // reviewer tell which.
    let severity: "block" | "warn" = "warn"
    // Each branch's advice has to be one the author can follow: pointing a
    // phantom or an undeclared map at `{map.<key>}` would turn this warning
    // into a block from the dotted pass.
    const phantom = PHANTOM_MAPS.get(lower)
    if (REFERENCE_MAPS.has(lower) && isYamlMap(maps[lower])) {
      severity = "block"
      advice = `\`${word}\` is a map, and a reference names one key in it — write \`{${lower}.<key>}\`.`
    } else if (phantom !== undefined) {
      advice = phantom(word)
    } else if (REFERENCE_MAPS.has(lower)) {
      advice = `This entry declares no \`${lower}:\` map, so there is no key to point at — write the name as a plain code span without braces.`
    } else if (holders.length > 0) {
      advice = `\`${word}\` is declared in \`${holders.join("`, `")}:\` — write \`{${holders[0]}.${word}}\`.`
    } else if (
      fenceNames.has(word) &&
      // Inside a fence, braces are that spec's own template syntax
      // (`pattern: '{company} · {region}'`); only prose is a stray reference.
      prose.startsWith(ref, hit.index)
    ) {
      advice = `\`${word}\` is a name from a \`\`\`text fence, not a token — write it as a plain code span without braces.`
    } else {
      continue
    }
    reported.add(ref)
    const fix = `\`${ref}\` has no \`map.\` namespace. ${advice} This file is published as the standard DESIGN.md, where the reference promises a lookup a consumer cannot complete.`
    issues.push(
      severity === "block"
        ? block("unresolved-token-ref", "tokens", fix)
        : warn(
            "dotless-token-ref",
            "tokens",
            `${fix} If the braces are a template placeholder that happens to share this name, leave them.`
          )
    )
  }
  return issues
}

function checkBlockScalars(fm: Array<string>): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = []
  for (const mapKey of [
    "colors",
    "typography",
    "spacing",
    "rounded",
    "elevation",
    "components",
  ]) {
    for (const row of mapRows(fm, mapKey)) {
      // A block header is `>` or `|`, then an indentation digit and a chomping
      // indicator in EITHER order, then optionally a comment. Matching only the
      // tidy spellings left `> # note` and `|2-` sailing through the check.
      if (!/^[>|][0-9+-]*\s*(?:#.*)?$/.test(row.rest.trim())) continue
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
function scanFrontmatterTokens(fm: Array<string>): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = []
  // All four maps, not just colours. `frontmatterRows` reads spacing and rounded
  // through the same two-space shape, so a nested row there is dropped just as
  // silently — and `referenceRows` would flatten a nested reference into a
  // differently named top-level token.
  //
  // `elevation` joins them because it is read the same way (#421): its rows
  // used to sit in a body fence, where `scanBody` judged them line by line, and
  // moving them into frontmatter must not move them out of reach.
  for (const mapKey of ["colors", "spacing", "rounded", "elevation"]) {
    for (const row of mapRows(fm, mapKey)) {
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
            `token \`${row.key}\` is indented ${row.indent} spaces — the \`${mapKey}:\` map is flat and its rows carry exactly two. The extractor reads only the two-space shape, so this token would vanish from the sidecar (and from the site's Tokens tab) while every gate still reported success. Nesting also renames the token, which breaks its \`{${mapKey}.${row.key}}\` references.`
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
      // The extractor keeps only rows shaped like a shadow, so anything else in
      // `elevation:` vanishes from the sidecar while the file still publishes
      // it. The common way in is a bare hex colour: ` #0000001A` opens a YAML
      // comment, and what remains is a colourless `0 1px 2px`.
      if (mapKey === "elevation") {
        const quoted = /^["']/.test(authored)
        if (quoted && value === authored) {
          // A quote that never closed on this line: the line reader cut the
          // value at a ` #` INSIDE the quotes. YAML keeps it intact, so the
          // fault to report is the quoting, not a lost colour.
          issues.push(
            block(
              "quoted-token-value",
              "tokens",
              `shadow \`${row.key}\` is quoted (${row.rest.trim()}) — write it bare, with the colour as \`oklch(L C H / alpha)\` and any hex in the trailing comment. Quoted, the value is invisible to the line-based gates.`
            )
          )
        } else if (
          !quoted &&
          !/^[>|][0-9+-]*$/.test(value) &&
          !isShadowValue(value)
        ) {
          // `#HEX` right after the value, or a `# #HEX` note — not a word or number
          // that happens to be hex-shaped (`# fade-in`, `# 200 level`).
          const hex = row.rest.match(
            /\s+#(?:\s?#)?([0-9a-fA-F]{3,8})(?![\w-])/
          )?.[1]
          // Blame the comment only when the hex is what the shadow is missing.
          const cutColour =
            hex !== undefined && isShadowValue(`${value} #${hex}`)
          issues.push(
            block(
              "elevation-not-shadow",
              "tokens",
              cutColour
                ? `shadow \`${row.key}\` ends where its colour should be — \`${value}\` — because a space followed by \`#\` opens a YAML comment, so the hex after it is not part of the value. Write the colour as \`oklch(L C H / alpha)\` (the catalog's colour form) and keep the hex in the trailing comment.`
                : `\`${row.key}: ${value}\` in \`elevation:\` is not a box-shadow (it needs two offsets and a colour, or \`none\`), so the sidecar drops it. Move motion tokens, z-indices and usage labels to a \`\`\`text fence under \`## Elevation & Depth\`.`
            )
          )
        }
      }
    }
  }
  return issues
}

/**
 * The spec's `components:` map, held to the same rules as the token maps (#384).
 *
 * Its shape is exactly two levels — a component head row, then one property per
 * four-space row — because that is what every line-based gate here can read.
 * A one-line flow map is legal YAML the linter resolves, but its values would
 * reach the published document without
 * any gate seeing them; a deeper row is not a spec property at all.
 *
 * Property values are judged like colour tokens: a reference must be quoted,
 * anything else must not be, and a literal colour must be OKLCH. Without this a
 * quoted hex in a component passed `validate:catalog` and `audit:oklch` alike.
 */
function checkComponentRows(fm: Array<string>): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = []
  for (const row of mapRows(fm, "components")) {
    const canonical =
      (row.indent === 2 && isHeadRow(row)) ||
      (row.indent === 4 && !isHeadRow(row))
    if (!canonical) {
      issues.push(
        block(
          "noncanonical-component-shape",
          "tokens",
          `component row \`${row.key}\` (indent ${row.indent}) is not the two-level shape \`components:\` takes — a component head row at two spaces, then one property per row at four. A one-line \`{ ... }\` map or a deeper row is read by no gate here, so its values reach the published DESIGN.md unchecked.`
        )
      )
      continue
    }
    if (row.indent !== 4) continue
    const authored = stripYamlComment(row.rest).trim()
    if (/^["']?\{/.test(authored)) continue
    const value = stripQuotes(authored)
    if (value !== authored) {
      issues.push(
        block(
          "quoted-token-value",
          "tokens",
          `component property \`${row.key}\` wraps its value in quotes (${authored}) — write it bare (\`${value}\`). Quote only a reference such as \`"{colors.name}"\`.`
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
  const tokenFenceIssues: Array<ValidationIssue> = []
  const proseHexLines: Array<string> = []
  const auditNoteIssues: Array<ValidationIssue> = []
  let fence: "yaml" | "other" | null = null
  // The marker run that opened `fence` — backticks or tildes, and how many. A
  // fence closes only on a bare run of the same character at least that long,
  // as in CommonMark, so a ````md example that shows a ```yaml block does not
  // end at the inner marker and leave the rest of the section read with the
  // fence state inverted.
  let fenceRun = ""
  // Where the open fence started, for the unclosed-fence report.
  let fenceOpenedAt = ""
  let inReferences = false
  // Audit-note state, reset at every heading. `section` is only for the message.
  let section = "(문서 첫머리)"
  let sectionHasContent = false
  let sectionNoteCount = 0

  for (const line of body.split(/\r?\n/)) {
    if (fence) {
      const close = line.match(FENCE_CLOSE)
      if (
        close &&
        close[1][0] === fenceRun[0] &&
        close[1].length >= fenceRun.length
      ) {
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
    const fenceOpen = line.match(FENCE_OPEN)
    if (fenceOpen) {
      fenceRun = fenceOpen[1]
      fenceOpenedAt = `${section}: ${line.trim()}`
      fence = /^ya?ml$/i.test(fenceOpen[2]) ? "yaml" : "other"
      sectionHasContent = true
      // Blocked, not tolerated, and wrong both ways round. With frontmatter
      // token maps present the extractor ignores the body, so a token written
      // back here reaches no sidecar and no drift check while every other gate
      // stays green. With none present — an onboarding draft — the extractor's
      // fallback reads ONLY this, so the draft ships in the retired shape.
      if (fence === "yaml" && TOKEN_SECTIONS.has(section)) {
        tokenFenceIssues.push(
          block(
            "token-fence",
            section,
            `## ${section} opens a \`\`\`yaml fence in the body — the retired token-fence shape. Tokens live in the frontmatter \`${section.toLowerCase()}:\` map; move the rows there (grouped with \`  ## label\` comment lines) and delete the fence.`
          )
        )
      } else if (fence === "yaml") {
        // Blocked everywhere else too (#421). The entry file IS the published
        // standard DESIGN.md — no adapter reshapes it any more — and the
        // official linter merges every body yaml fence into the frontmatter's
        // schema namespace: each row becomes a top-level key, and two fences
        // sharing a key zeroed `wanted`'s whole document once. Shadows have a
        // frontmatter home; motion and component specs are for readers, and a
        // `text` fence carries them there without reaching the linter.
        tokenFenceIssues.push(
          block(
            "body-yaml-fence",
            section,
            `## ${section} opens a \`\`\`yaml fence in the body. The official DESIGN.md linter reads every body yaml fence as top-level schema keys, so this entry would lint differently from its own tokens. Shadows go in the frontmatter \`elevation:\` map (one line each, bare value, note in a trailing comment); anything else — motion, a component spec — stays in the body as a \`\`\`text fence.`
          )
        )
      }
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

  // A fence still open at the end swallowed everything after it, headings
  // included. validateDraft drops the missing-section reports for sections that
  // would have come after it, so this one issue is what points at the line that
  // needs fixing instead of a cascade of missing sections that are really there.
  const unclosedFenceIssues = fence
    ? [
        block(
          "unclosed-fence",
          "body",
          `The fence opened at "${fenceOpenedAt}" is never closed, so everything after it was read as code. Close it with a bare ${fenceRun} line (no language tag on the closing line).`
        ),
      ]
    : []

  const proseHexIssues = proseHexLines.map((sample) =>
    warn(
      "hex-in-prose",
      "prose",
      `Prose line carries a hex color with no oklch conversion on the same line: "${sample}". Either convert to OKLCH or add the oklch value inline.`
    )
  )
  return {
    headings,
    yamlTokenIssues,
    fenceIssues: [...tokenFenceIssues, ...unclosedFenceIssues],
    unclosedFence: fence !== null,
    proseHexIssues,
    auditNoteIssues,
  }
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

// Keys the catalog used to carry and removed on purpose. An unknown key is only
// a warning (usually a typo the site ignores), but one of these coming back —
// from an old fork, or an agent working from an old example — restores what
// the removal was for, so it blocks and says why.
const RETIRED_FRONTMATTER_KEYS: ReadonlyMap<string, string> = new Map([
  [
    "sources",
    "`sources` was removed — `## References` is the entry's only source list (docs/adr/0004-public-sources-listed-once.md). Delete the frontmatter list and keep the URLs in References.",
  ],
])

/** A top-level key as the site's own parser reads it — its one pattern,
 *  `FRONTMATTER_KEY_NAME`, at column 0 and straight into the colon. */
const SITE_KEY = new RegExp(`^(${FRONTMATTER_KEY_NAME.source}):`, "gm")
const SITE_KEY_NAME = new RegExp(`^${FRONTMATTER_KEY_NAME.source}$`)
/** A YAML key the site would cut at a colon inside it (`name:` from `name::`). */
const SITE_CUT_KEY = new RegExp(`^(${FRONTMATTER_KEY_NAME.source}):`)

/** Does this key read as the site's parser reads one — a bare name starting
 *  its line, straight into the colon? */
function isSiteKey(
  text: string,
  range: readonly [number, number, number] | null | undefined
): boolean {
  if (!range) return false
  const [start, end] = range
  return (
    (start === 0 || text[start - 1] === "\n") &&
    SITE_KEY_NAME.test(text.slice(start, end)) &&
    text[end] === ":"
  )
}

/**
 * Known keys this repo's readers drop (#449 review).
 *
 * `"lang": ko`, `'slug': x` and `lang : ko` are valid YAML, but the line-based
 * readers here find a key only as a bare `key:` — the site's parser for its
 * fields, the token extractor for the token maps, the validator's regex checks
 * for the rest — so the value silently goes missing to them (the YAML-based
 * readers, such as the spec linter, still see it), and for most keys no other gate
 * noticed. Only the key's spelling is judged; a value the site's parser reads
 * differently from YAML is another matter. Judged only on a block YAML parses cleanly:
 * on a broken one the parser's recovery invents keys, and
 * `frontmatter-yaml-invalid` is already the one message.
 */
function siteDroppedKnownKeys(
  raw: string,
  fmDoc: FrontmatterDoc
): ReadonlySet<string> {
  const dropped = new Set<string>()
  if (!fmDoc || fmDoc.errors.length > 0 || !isMap(fmDoc.contents)) {
    return dropped
  }
  const fmText = splitFrontmatter(raw)?.frontmatter ?? ""
  // Each item is judged by its own key's source — not by whether some line in
  // the block looks bare — and an alias key (`? *k`) by what it resolves to;
  // it is never bare, so a known key reached through one is dropped (#453).
  for (const item of fmDoc.contents.items) {
    const node = isAlias(item.key) ? item.key.resolve(fmDoc) : item.key
    if (!isScalar(node)) continue
    const key = String(node.value)
    if (!KNOWN_FRONTMATTER_KEYS.includes(key)) continue
    if (!isScalar(item.key) || !isSiteKey(fmText, item.key.range)) {
      dropped.add(key)
    }
  }
  return dropped
}

/** A frontmatter value as one of the two parsers read it — author input,
 *  typed by neither. */
// eslint-disable-next-line no-restricted-syntax -- Frontmatter values are author-provided YAML; this compares two untyped readings of them.
type ReadValue = unknown

/** No value: YAML's `null`, or the site parser's empty list for a key with no
 *  inline value. The one equivalence the two readings share across types —
 *  the site treats an empty list as no value (`slug` falls back to the file
 *  name, `estimated_tokens` to the estimate) or a field rule blocks it
 *  (`bad-name`, `bad-design-system-name`, `missing-logo`, `bad-lang`, …). */
function isNothing(value: ReadValue): boolean {
  return (
    value === null ||
    value === undefined ||
    (Array.isArray(value) && value.length === 0)
  )
}

/** Is this a value YAML reads as something other than text — a number,
 *  boolean or map? The site's parser reads only text and lists of text. */
function isNonText(value: ReadValue): boolean {
  return (
    typeof value === "number" ||
    typeof value === "boolean" ||
    (typeof value === "object" && value !== null && !Array.isArray(value))
  )
}

/** Do YAML and the site read the same text, or the same list of it? Compared
 *  by type, not by how the two print: `name: {}` is a map to YAML and the
 *  text `{}` to the site, and `name: [true]` a list of one boolean to YAML.
 *  The site's lists hold only text, so a cyclic YAML value (`&x [*x]`) stops
 *  one level down, where an item meets the site's text. */
function sameText(yaml: ReadValue, site: ReadValue): boolean {
  if (isNothing(yaml) || isNothing(site)) {
    return isNothing(yaml) && isNothing(site)
  }
  if (Array.isArray(yaml) || Array.isArray(site)) {
    return (
      Array.isArray(yaml) &&
      Array.isArray(site) &&
      yaml.length === site.length &&
      yaml.every((item, i) => sameText(item, site[i]))
    )
  }
  return typeof yaml === "string" && yaml === site
}

/** A read value as a message shows it — a number as written, not as JSON
 *  (which turns `Infinity` into `null`), and a cyclic YAML value
 *  (`&x [*x]`), which JSON cannot write, by what it is. */
function shownValue(value: ReadValue): string {
  if (value === undefined) return "nothing"
  if (typeof value === "number") return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return "a value that contains itself"
  }
}

/** The keys `buildDoc` turns into a number (content-parser's
 *  `coerceNumberField`); every other key the site reads stays text. */
const SITE_NUMBER_KEYS: ReadonlySet<string> = new Set(["estimated_tokens"])

/** Text the site turns into a number, as `coerceNumberField` does. */
function siteNumber(site: ReadValue): number | undefined {
  if (typeof site !== "string" || site === "") return undefined
  const n = Number(site)
  return Number.isFinite(n) ? n : undefined
}

/** Does YAML read a key the site keeps as text as a number, boolean or map?
 *  `name: 1.50` is the number 1.5 to YAML and the text `1.50` to the site;
 *  quoting makes both read the text. */
function readsAsNonText(key: string, yaml: ReadValue): boolean {
  return !SITE_NUMBER_KEYS.has(key) && isNonText(yaml)
}

/** A list with something in it — never a fix for a key that holds one value,
 *  so a misread that involves one is told what `list-frontmatter-value`
 *  would say, not how to quote the list. */
function isFilledList(value: ReadValue): boolean {
  return Array.isArray(value) && value.length > 0
}

/** Not a name a card or title can show: not text, or text that is empty or
 *  whitespace alone (`"   "`, which both parsers read alike). */
function isBlankText(value: ReadValue): boolean {
  return typeof value !== "string" || value.trim() === ""
}

/** Does YAML read text the site turns into a number? `estimated_tokens: "1200"`
 *  and `0b101` are text to YAML and the numbers 1200 and 5 to the site. */
function readsAsSiteOnlyNumber(
  key: string,
  yaml: ReadValue,
  site: ReadValue
): boolean {
  return (
    SITE_NUMBER_KEYS.has(key) &&
    typeof yaml !== "number" &&
    siteNumber(site) !== undefined
  )
}

/** Do YAML and the site's parser read one value alike? A key the site turns
 *  into a number is compared as a number (`1.0e3` is `1000`); every other key
 *  as text or a list of text, by type rather than by how the two print. */
function sameReading(key: string, yaml: ReadValue, site: ReadValue): boolean {
  if (SITE_NUMBER_KEYS.has(key)) {
    if (typeof yaml === "number") return siteNumber(site) === yaml
    if (readsAsSiteOnlyNumber(key, yaml, site)) return false
  }
  return sameText(yaml, site)
}

/** A consumed key as the two parsers read it. `cutAs` is set when the site
 *  read the value from a line it cut at a colon YAML keeps in the key — that
 *  line's YAML key as spelled (`name:x` from `name:x: y`). */
interface Misread {
  yaml: ReadValue
  site: ReadValue
  cutAs: string | undefined
}

/**
 * The YAML key of the line the site last read `key` from, when the site cut
 * that line at a colon inside YAML's key: `name:x: y` is the key `name:x` to
 * YAML and `name` to the site, `name:: 토스` the key `name:`. Undefined when
 * that line is an ordinary `key: …`. The site reads every `key:` line at
 * column 0 and keeps the last, so the last such line is the one it read.
 */
function siteCutLine(fmText: string, key: string): string | undefined {
  let last: string | undefined
  for (const line of fmText.split(/\r?\n/)) {
    const m = SITE_CUT_KEY.exec(line)
    if (m && m[1] === key) last = line
  }
  if (last === undefined) return undefined
  const after = last.slice(key.length + 1)
  if (after === "" || /^\s/.test(after)) return undefined
  // A plain YAML key runs to the first colon followed by a space or line end.
  // Spaces before that colon are not part of the key (`name:x  : y`).
  const sep = /:(?=\s|$)/.exec(after)
  return `${key}:${sep ? after.slice(0, sep.index) : after}`.trimEnd()
}

/** The frontmatter as the site's parser reads it, before `buildDoc` falls back
 *  or drops a field; empty where it cannot read the file at all. */
function siteFrontmatter(raw: string): Record<string, ReadValue> {
  try {
    return matter(raw).data
  } catch {
    return {}
  }
}

/** A value YAML cannot expand within its alias limit. */
const TOO_MANY_ALIASES: unique symbol = Symbol("too many aliases")

/**
 * One key's value as YAML reads it. Converted key by key, not as a whole
 * document: `toJS` throws past its alias limit (100), and one alias-heavy map
 * the site never reads (`grid:`) would otherwise switch off every comparison.
 * A consumed key that is itself past the limit reads as `TOO_MANY_ALIASES`,
 * which matches no reading the site has.
 */
function yamlValue(fmDoc: NonNullable<FrontmatterDoc>, key: string): ReadValue {
  const node = fmDoc.get(key, true)
  if (!isNode(node)) return node
  try {
    return node.toJS(fmDoc)
  } catch {
    return TOO_MANY_ALIASES
  }
}

/** What to tell the author about a misread value, by its cause. */
function misreadFix(key: string, { yaml, site, cutAs }: Misread): string {
  if (yaml === TOO_MANY_ALIASES) {
    return `YAML cannot expand \`${key}\` within its alias limit, while the site's frontmatter parser reads it as ${shownValue(site)}. Write the value itself, with no anchors or aliases.`
  }
  if (cutAs !== undefined) {
    return `The site's frontmatter parser reads \`${key}\` as ${shownValue(site)} from the line YAML reads as the key \`${cutAs}\`: the site cuts a key at its first colon, YAML only at a colon followed by a space. Write \`${key}: …\` — one colon, then a space — or remove that line.`
  }
  if (yaml === undefined) {
    return `The site's frontmatter parser reads \`${key}\` as ${shownValue(site)} from a \`${key}:\` line that YAML reads as part of another key's value — a quoted or multi-line value running on to it. Keep each value on its own key's line.`
  }
  // A count YAML does not read as a number — text the site turns into one
  // (`"1200"`, `0b101`), or a value neither can (`true`, `{}`, `[1200]`):
  // the fix is the same, and naming it saves a second run that would only
  // then report `buildDoc`'s "must be a number".
  if (SITE_NUMBER_KEYS.has(key) && typeof yaml !== "number") {
    const asNumber = siteNumber(site)
    return `YAML reads \`${key}\` as ${shownValue(yaml)}${asNumber === undefined ? "" : `, but the site's frontmatter parser turns it into the number ${shownValue(asNumber)}`}. It must be a plain decimal number, unquoted — \`${key}: 1200\`.`
  }
  if (isFilledList(yaml) || isFilledList(site)) {
    return `The site's frontmatter parser reads \`${key}\` as ${shownValue(site)} and YAML as ${shownValue(yaml)} — a list, where it holds one value. Write it on one line, \`${key}: …\`, with no brackets or \`- \` items.`
  }
  if (readsAsNonText(key, yaml)) {
    return `YAML reads \`${key}\` as ${shownValue(yaml)}, which is not text, but the site's frontmatter parser reads it as ${shownValue(site)}. Quote the value so both read the same text.`
  }
  return `The site's frontmatter parser reads \`${key}\` as ${shownValue(site)}, but YAML reads it as ${shownValue(yaml)}. The site takes a value only from the key's own line: write \`${key}: …\` on one line, quote it only if it holds \`: \` or \` #\`, use no escapes inside the quotes, put no comment after a quoted value, and write no YAML-only value (\`~\`, \`null\`, \`.inf\`) or syntax — tag (\`!!str\`), anchor (\`&a\`), alias (\`*a\`), block scalar (\`|\`, \`>\`) — the site reads those as text.`
}

/**
 * Keys the site reads, whose value its parser reads differently from YAML.
 *
 * `parseYamlSubset` takes a value only from the key's own line. A value on the
 * next line (`name:` then `  토스`) comes back as an empty list, one that runs
 * on to a second line keeps only the first, and a quoted value keeps its
 * escapes — all valid YAML, all read silently wrong; `name` passed every gate.
 * Only the keys the site reads (`CONSUMED_KEYS`) are compared, only on a block
 * YAML parses cleanly, and not a key `nonbare-frontmatter-key` already dropped.
 */
function siteMisreadValues(
  raw: string,
  fmDoc: FrontmatterDoc,
  dropped: ReadonlySet<string>
): ReadonlyMap<string, Misread> {
  const misread = new Map<string, Misread>()
  if (!fmDoc || fmDoc.errors.length > 0 || !isMap(fmDoc.contents)) {
    return misread
  }
  const siteData = siteFrontmatter(raw)
  const fmText = splitFrontmatter(raw)?.frontmatter ?? ""
  for (const key of CONSUMED_KEYS) {
    // A key YAML lacks is still compared when the site read it: the site cuts
    // a key at its first colon, YAML only at one followed by a space, so
    // `name:: 토스` is the key `name:` to YAML and `name` to the site.
    if (dropped.has(key) || (!fmDoc.has(key) && !(key in siteData))) continue
    const yaml = yamlValue(fmDoc, key)
    const site = siteData[key]
    if (!sameReading(key, yaml, site)) {
      misread.set(key, { yaml, site, cutAs: siteCutLine(fmText, key) })
    }
  }
  return misread
}

/** Is this YAML key, as spelled in the file, the line a misread came from?
 *  The site read it — it is not ignored — and the misread already names it,
 *  so an unknown-key warn would say the opposite. A cut line the site did not
 *  read its value from (a later `name:` line won) is a stray key only the warn
 *  names, so it keeps the warn. */
function isMisreadLine(
  spelled: string,
  misread: ReadonlyMap<string, Misread>
): boolean {
  return [...misread.values()].some((m) => m.cutAs === spelled)
}

function checkFrontmatterKeys(
  raw: string,
  fmDoc: FrontmatterDoc,
  misread: ReadonlyMap<string, Misread>
): Array<ValidationIssue> {
  // Strip a UTF-8 BOM the same way content-parser's matter() does, so the
  // `^---` anchor still finds the frontmatter fence.
  const withoutBom = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
  const fmBlock = withoutBom.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!fmBlock) return []
  const issues: Array<ValidationIssue> = []
  // Retired keys are judged on the keys YAML itself resolves, not on how they
  // are spelled: bare, quoted and escaped (`"sources"`) spellings all
  // resolve to `sources`, and review found them one at a time. The site's own
  // parser ignores every non-bare spelling, so none of them would otherwise
  // surface. The bare scan is kept for a block YAML cannot parse (that block
  // already fails `frontmatter-yaml-invalid`, but should still name the key).
  // Resolved key → the spelling in the file. Rules judge the resolved key;
  // messages name the spelling too, since `True:` resolves to `true` and
  // `0x1F:` to `31` — strings the author cannot find by searching the file.
  const keys = new Map<string, string>()
  if (fmDoc) {
    const contents = fmDoc.contents
    const text = splitFrontmatter(raw)?.frontmatter ?? ""
    if (isMap(contents)) {
      for (const item of contents.items) {
        if (!isScalar(item.key)) continue
        const key = String(item.key.value)
        const range = item.key.range
        if (!keys.has(key)) {
          keys.set(key, range ? text.slice(range[0], range[1]).trim() : key)
        }
      }
    }
  }
  // Only where YAML failed: on a clean block the bare scan adds nothing true,
  // and a key YAML resolves to another spelling (`True:` → `true`) would be
  // named twice.
  if (!fmDoc || fmDoc.errors.length > 0) {
    // Skip what YAML already found, by resolved key or by spelling — `True`
    // is already here as the spelling of `true`.
    const spelled = new Set(keys.values())
    for (const m of fmBlock[1].matchAll(SITE_KEY)) {
      if (!keys.has(m[1]) && !spelled.has(m[1])) keys.set(m[1], m[1])
    }
  }
  // Both rules judge the same resolved keys. The unknown-key warn used to run
  // its own bare scan, so a quoted `"notes":` — valid YAML the site parser
  // ignores — was never compared at all (the blind spot #447 closed in
  // `mapRows`).
  for (const [key, spelled] of keys) {
    const retired = RETIRED_FRONTMATTER_KEYS.get(key)
    if (retired) {
      issues.push(block("retired-frontmatter-key", "frontmatter", retired))
    } else if (
      !KNOWN_FRONTMATTER_KEYS.includes(key) &&
      !isMisreadLine(spelled, misread)
    ) {
      issues.push(
        warn(
          "unknown-frontmatter-key",
          "frontmatter",
          `Unknown frontmatter key \`${spelled}\` (${spelled === key ? "" : `YAML reads it as \`${key}\`; `}ignored by the site) — likely a typo for one of: ${KNOWN_FRONTMATTER_KEYS.join(", ")}.`
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

/** Findings the linter reports when it reads a key as schema that the spec
 *  does not know — a body yaml fence's row, or a frontmatter typo of a spec
 *  key (`ease` → "did you mean name"). */
const SCHEMA_KEY_RULES: ReadonlySet<string> = new Set([
  "unknown-key",
  "token-like-ignored",
])

/**
 * The official DESIGN.md linter's verdict, as draft issues (#421).
 *
 * The entry file is published verbatim as the standard DESIGN.md, and CI's
 * corpus test lints every committed entry with this same linter. Running it
 * here moves those verdicts into the skill's machine gate, so a draft does not
 * pass Stage 6a2 and then fail on its PR. Only what CI would block, or what a
 * reviewer must act on, becomes an issue — `missing-primary` is a semantic call
 * the corpus test pins by list, and the component-pilot warnings are advisory.
 */
function checkSpecLint(
  raw: string,
  slug: string | undefined
): {
  issues: Array<ValidationIssue>
  /** The token names the linter resolved per required map — null when it
   *  threw. */
  resolved: Record<RequiredTokenMap, ReadonlyArray<string>> | null
} {
  let report: ReturnType<typeof lint>
  try {
    report = lint(raw)
  } catch (e) {
    return {
      issues: [
        block(
          "spec-lint-crash",
          "spec",
          `The official DESIGN.md linter threw on this document: ${e instanceof Error ? e.message : String(e)}`
        ),
      ],
      resolved: null,
    }
  }
  const issues: Array<ValidationIssue> = []
  const ds = report.designSystem
  // Counts, not `summary.errors`: the linter reports a document it resolved
  // nothing from with `errors: 0`, which is exactly the failure to catch.
  if (ds.colors.size === 0) {
    issues.push(
      block(
        "spec-no-colors",
        "spec",
        "The official DESIGN.md linter resolves no colours from this document. Declare the palette in the frontmatter `colors:` map (one `name: oklch(...)` per line) — this file is published as the standard DESIGN.md, and a tool reading it would see an empty design system."
      )
    )
  }
  if (ds.typography.size === 0) {
    issues.push(
      block(
        "spec-no-typography",
        "spec",
        "The official DESIGN.md linter resolves no type scale. Declare it in the frontmatter `typography:` map (a style name, then four-space `fontSize` / `fontWeight` / `lineHeight` / `letterSpacing`) — `colors:` and `typography:` are the two maps every entry must publish."
      )
    )
  }
  for (const f of report.findings) {
    if (!SCHEMA_KEY_RULES.has(String(f.rule))) continue
    const key = String(f.path ?? "?")
    // A catalog-only map (`grid:`, `opacity:`, `elevation:`) is an allowed key,
    // so the cause is not a stray fence or a typo: one of its values looks
    // like a token (a CSS dimension such as `16px`/`40%`, or a hex), and the
    // linter reports the whole map as tokens it will ignore.
    if (KNOWN_FRONTMATTER_KEYS.includes(key)) {
      issues.push(
        block(
          "spec-token-like-map",
          "spec",
          `The catalog-only \`${key}:\` map holds a value the official linter reads as a design token (a CSS dimension like \`16px\`/\`40%\`, or a hex), so it reports the map as tokens it will ignore. Put spacing and radius values in \`spacing:\`/\`rounded:\`, write an opacity as a unitless number (\`40%\` → \`0.4\`), and a flat shadow as \`none\`.`
        )
      )
      continue
    }
    issues.push(
      block(
        "spec-schema-key",
        "spec",
        `The official linter reads \`${key}\` as a schema key it does not know (${String(f.rule)}): ${String(f.message)} A body yaml fence does this; so does a top-level frontmatter key spelled like a spec key.`
      )
    )
  }
  const recorded = slug === undefined ? 0 : (KNOWN_SPEC_LIMITATIONS[slug] ?? 0)
  if (report.summary.errors !== recorded) {
    const errors = report.findings
      .filter((f) => f.severity === "error")
      .map((f) => `${String(f.path ?? "?")}: ${String(f.message)}`)
    const found =
      errors.length > 0
        ? `The official linter reports ${report.summary.errors} error(s); ${recorded} recorded for this slug: ${errors.join(" · ").replace(/\.?$/, ".")}`
        : `The official linter reports no errors; ${recorded} recorded for this slug.`
    const advice =
      report.summary.errors < recorded
        ? `A recorded limitation went away — lower this slug's count in KNOWN_SPEC_LIMITATIONS (src/lib/spec-limitations.ts), or delete the row at 0; CI's corpus test pins the exact count.`
        : `A \`%\` radius is a brand value the spec cannot express: keep it and set the slug's count in KNOWN_SPEC_LIMITATIONS (src/lib/spec-limitations.ts) — CI's corpus test blocks until it matches. A multi-stop gradient in \`colors:\` belongs in the catalog-only \`gradients:\` map instead. Anything else is a real defect to fix.`
    issues.push(
      warn("spec-unrecorded-limitation", "spec", `${found} ${advice}`)
    )
  }
  return {
    issues,
    resolved: {
      colors: [...ds.colors.keys()],
      typography: [...ds.typography.keys()],
    },
  }
}

/** The two token maps every entry must publish (#428). `spacing:` and
 *  `rounded:` are not required: a brand may publish neither, and requiring them
 *  would press an author to invent values. */
type RequiredTokenMap = "colors" | "typography"

const REQUIRED_TOKEN_MAPS: ReadonlyArray<{
  map: RequiredTokenMap
  /** Whether the extractor must read every token the linter resolves, not
   *  just one. Colours may not: the linter resolves alias rows (`{colors.x}`,
   *  `primary:`) that the sidecar leaves out by design, so an entry with
   *  aliases reads fewer colours than it resolves. The catalog publishes no
   *  typography aliases, so a shortfall there is a style gone missing. */
  mustReadAll: boolean
  howTo: string
}> = [
  {
    map: "colors",
    mustReadAll: false,
    howTo:
      "Write each colour as `name: oklch(...)` on its own line; alias rows (`{colors.x}`) are not tokens to it.",
  },
  {
    map: "typography",
    mustReadAll: true,
    howTo:
      "The extractor reads a style only when at least one of four-space `fontSize` / `fontWeight` / `lineHeight` / `letterSpacing` is nested under its name on its own line — the inline `name: { size, … }` and `name: 16 / 24 / 700` forms and a whole-style alias (`{typography.x}`) read as zero. A font family the brand publishes with no size is not a type style: move it to the catalog-only `fonts:` map rather than inventing a size.",
  },
]

/**
 * The token extractor's verdict on the required maps (#428).
 *
 * The linter is one reader of the frontmatter; the extractor is the other — it
 * builds the sidecar behind the Tokens tab and `use-design-md`. A map the
 * linter resolves but the extractor reads nothing from would ship an empty
 * sidecar with every other gate green; a type scale it reads only part of
 * would ship with styles silently missing. A map the linter resolved nothing
 * from is left to `checkSpecLint`, which already gives that cause its one
 * message.
 */
function checkExtractedTokens(
  raw: string,
  resolved: Record<RequiredTokenMap, ReadonlyArray<string>>,
  /** Maps whose key the site's parser drops — already one block each. */
  dropped: ReadonlySet<string>
): Array<ValidationIssue> {
  const extracted = extractTokensFromMarkdown(raw)
  const issues: Array<ValidationIssue> = []
  for (const { map, mustReadAll, howTo } of REQUIRED_TOKEN_MAPS) {
    const want = resolved[map].length
    if (want === 0 || dropped.has(map)) continue
    const readNames = new Set(extracted[map].map((t) => sameKey(t.name)))
    const read = readNames.size
    // By name, not count, where every token must read: a row the extractor
    // picks up from outside the map would otherwise stand in for a style it
    // failed to read (#447 review). A colour shortfall is mostly alias rows,
    // which are meant to be missing, so colours only need one.
    const unread = mustReadAll
      ? resolved[map].filter((name) => !readNames.has(sameKey(name)))
      : []
    if (mustReadAll ? unread.length === 0 : read > 0) continue
    // Of the tokens the linter resolved, how many the sidecar will carry — one
    // number for both the count and the empty/partial wording.
    const carried = mustReadAll ? want - unread.length : read
    const which =
      unread.length > 0
        ? ` Unread: ${unread
            .slice(0, 8)
            .map((n) => `\`${n}\``)
            .join(", ")}${unread.length > 8 ? ", …" : ""}.`
        : ""
    issues.push(
      block(
        "unreadable-token-map",
        "tokens",
        `The official linter resolves ${want} token(s) in \`${map}:\`, but the token extractor reads ${carried} of ${want} — the sidecar behind the Tokens tab and \`use-design-md\` would ship ${carried === 0 ? "empty" : "without the rest"}.${which} ${howTo}`
      )
    )
  }
  return issues
}

/** A token name as both readers agree on it. The linter's names are YAML
 *  keys, which the parser normalises (`1.0:` → `1`); the extractor's are the
 *  source text. Numbers are the only such case a type scale meets. */
function sameKey(name: string): string {
  const n = Number(name)
  return name.trim() !== "" && Number.isFinite(n) ? String(n) : name
}

export function validateDraft(
  raw: string,
  opts: DraftValidationOptions
): DraftValidationResult {
  const issues: Array<ValidationIssue> = []

  let doc: ServiceDoc | null = null
  // Reported once the misread values are known: the site's reading of a
  // misread date or count is what makes `buildDoc` throw, and that value
  // already has its one block.
  let buildError: string | null = null
  try {
    doc = buildDoc(opts.filePath, raw)
  } catch (e) {
    buildError = e instanceof Error ? e.message : String(e)
  }

  // The site's content collection loads every services/*.md, `_`-prefixed or
  // not, but the catalog checks used to skip `_` files as demo fixtures — so
  // such a file was published without ever being validated. The fixtures are
  // gone; the prefix now blocks instead of exempting.
  const fileName = opts.filePath.split("/").pop() ?? ""
  if (fileName.startsWith("_")) {
    issues.push(
      block(
        "underscore-entry-file",
        "file",
        `${fileName} starts with \`_\` — an entry file name must not. The site publishes it like any other entry; rename it to its slug.`
      )
    )
  }
  const fmDoc = parseFrontmatter(raw)
  const yamlIssues = checkFrontmatterYaml(fmDoc)
  issues.push(...yamlIssues)
  // A dropped key is one cause, so its consequences — every field rule that
  // would judge the default or nothing the site sees in its place, and a
  // token map the extractor reads nothing from — are silenced below, so the
  // author is told to unquote, not to fix what is already there.
  const dropped = siteDroppedKnownKeys(raw, fmDoc)
  const misread = siteMisreadValues(raw, fmDoc, dropped)
  issues.push(...checkFrontmatterKeys(raw, fmDoc, misread))
  for (const key of dropped) {
    issues.push(
      block(
        "nonbare-frontmatter-key",
        "frontmatter",
        `This repo's line-based readers of the frontmatter — the site's parser, the token extractor and the validator's regex checks — find a key only as a plain \`${key}:\` starting its line, so this way of writing \`${key}\` is valid YAML they silently skip. Write it as \`${key}:\` at column 0 — no quotes, indentation, anchor or tag, \`?\` key, alias or flow map, and no space before the colon.`
      )
    )
  }
  for (const [key, read] of misread) {
    issues.push(
      block("misread-frontmatter-value", "frontmatter", misreadFix(key, read))
    )
  }
  // What the site's parser read, before `buildDoc` falls back or drops.
  const siteRead = siteFrontmatter(raw)
  // A consumed key holds one value. A list both parsers read alike is one
  // cause, and each field rule's message about it would contradict itself
  // (`lang \`ko\` must be exactly \`ko\``) or call it missing.
  const listed = CONSUMED_KEYS.filter((key) => {
    const value = siteRead[key]
    return (
      !dropped.has(key) &&
      !misread.has(key) &&
      Array.isArray(value) &&
      value.length > 0
    )
  })
  // Where YAML cannot read the block, only the site's reading is known — the
  // message must not claim YAML's.
  const yamlRead =
    fmDoc !== null && fmDoc.errors.length === 0 && isMap(fmDoc.contents)
  for (const key of listed) {
    issues.push(
      block(
        "list-frontmatter-value",
        "frontmatter",
        `${yamlRead ? "Both the site's frontmatter parser and YAML read" : "The site's frontmatter parser reads"} \`${key}\` as the list ${shownValue(siteRead[key])}, but it holds one value. Write it on one line, \`${key}: …\`, with no brackets or \`- \` items.`
      )
    )
  }
  // Keys whose field the site does not see as written — dropped, misread, or
  // a list where one value belongs.
  const unseen = new Set<string>([...dropped, ...misread.keys(), ...listed])
  // `buildDoc`'s field errors open with the field's name.
  const buildBlocked = buildError
  if (
    buildBlocked !== null &&
    ![...unseen].some((key) => buildBlocked.startsWith(`${key} `))
  ) {
    issues.push(
      block(
        "frontmatter-parse",
        "frontmatter",
        `Frontmatter does not round-trip through buildDoc(): ${buildBlocked}`
      )
    )
  }
  // The entry's slug for lookups keyed by it (recorded limitations, logo
  // takedowns). A dropped or misread slug reads as the file name (`draft` in
  // the pipeline) or a fragment, not the entry's — so it falls back to what
  // the caller expects, then the file name, as does a slug that is not text
  // or a document `buildDoc` rejects.
  const siteSlug: ReadValue = doc?.frontmatter.slug
  const entrySlug =
    (!unseen.has("slug") && typeof siteSlug === "string"
      ? siteSlug
      : undefined) ??
    opts.expectedSlug ??
    (opts.filePath.split("/").pop() ?? "").replace(/\.md$/, "")
  // One cause, one message: when the frontmatter does not parse, the linter's
  // model is empty and would add three wrong instructions to the real one.
  if (!yamlIssues.some((i) => i.severity === "block")) {
    const spec = checkSpecLint(raw, entrySlug)
    issues.push(...spec.issues)
    if (spec.resolved) {
      issues.push(...checkExtractedTokens(raw, spec.resolved, dropped))
    }
  }
  issues.push(...checkTokenReferences(raw, fmDoc))

  if (doc) {
    const fm = doc.frontmatter
    // A dropped key already has its one block; the site sees its default or
    // nothing, and judging that would tell the author to fix a value that is
    // already in the file.
    const sees = (key: string): boolean => !unseen.has(key)
    if (
      sees("category") &&
      !(CATEGORIES as ReadonlyArray<string>).includes(fm.category)
    ) {
      issues.push(
        block(
          "bad-category",
          "frontmatter",
          `category \`${fm.category}\` is not in the CATEGORIES enum (${CATEGORIES.join(", ")}).`
        )
      )
    }
    // ServiceFrontmatter types name as a string, but `buildDoc` keeps whatever
    // the site's parser read — a bare `name:` (`[]`) or blank text passes
    // `?? slug` — and the catalog sorts, titles and feeds by it as text. Blank
    // includes whitespace alone, which both parsers read alike and the card
    // shows as nothing. Judged only where the site read a `name:` line:
    // without one `buildDoc` names the entry by its slug, and a bad slug has
    // its own block.
    const name: ReadValue = fm.name
    if (sees("name") && "name" in siteRead && isBlankText(name)) {
      issues.push(
        block(
          "bad-name",
          "frontmatter",
          `name must be one line of non-empty text, as \`name: 토스\` (got ${shownValue(name)}).`
        )
      )
    }
    // `buildDoc` drops a design_system_name that is not text and keeps blank
    // text, so the site shows no name while YAML consumers get null or blank
    // text. Judged on the site parser's own reading, which keeps both.
    const systemName: ReadValue = siteRead.design_system_name
    if (
      sees("design_system_name") &&
      systemName !== undefined &&
      isBlankText(systemName)
    ) {
      issues.push(
        block(
          "bad-design-system-name",
          "frontmatter",
          `design_system_name must be one line of non-empty text, as \`design_system_name: TDS\`, or no line at all (got ${shownValue(systemName)}).`
        )
      )
    }
    // `deriveSlug` keeps a list (`slug: [toss]`) as the slug, and a RegExp
    // test coerces it to `toss`, so the form is judged on text only.
    const slugRead: ReadValue = fm.slug
    if (
      sees("slug") &&
      (typeof slugRead !== "string" || !SLUG_FORM.test(slugRead))
    ) {
      issues.push(
        block(
          "bad-slug",
          "frontmatter",
          `slug ${shownValue(slugRead)} must be one line of text matching ^[a-z0-9-]+$.`
        )
      )
    }
    if (
      sees("slug") &&
      typeof slugRead === "string" &&
      opts.expectedSlug &&
      slugRead !== opts.expectedSlug
    ) {
      issues.push(
        block(
          "slug-arg-mismatch",
          "frontmatter",
          `frontmatter slug \`${fm.slug}\` differs from the expected slug \`${opts.expectedSlug}\`.`
        )
      )
    }
    if (sees("last_updated") && fm.last_updated === "") {
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
    if (sees("created_at") && fm.created_at === "") {
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
    // A misread date already has its one block; the site's reading in its
    // place is not the date the author wrote.
    if (
      sees("created_at") &&
      sees("last_updated") &&
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
    // ServiceFrontmatter types lang as "ko", but buildDoc never validates it —
    // a draft can carry any string at runtime. Widen before comparing so the
    // check survives the type-level narrowing. This rule is what enforces
    // docs/adr/0001-korean-design-md-only.md: an entry is one Korean file.
    // It replaced `lang-arg-mismatch`, which compared against an expected lang
    // the caller passed — with one allowed value there is nothing to pass.
    const lang: string = fm.lang
    if (sees("lang") && lang !== "ko") {
      issues.push(
        block(
          "bad-lang",
          "frontmatter",
          `lang \`${lang}\` must be exactly \`ko\` — an entry is one Korean design.md, with no second-language companion.`
        )
      )
    }
    // Every entry carries a logo: without one the catalog grid card falls back
    // to a first-letter badge and the OG image to text only, and the /design-md skill no longer lets intake
    // skip it. A dropped or misread logo already has its one block, so `sees`
    // keeps all three logo rules from judging what the site read in its place.
    // The one exemption is a recorded takedown (docs/TAKEDOWN.md, ./logo-takedowns).
    const takedowns = opts.logoTakedowns ?? LOGO_TAKEDOWNS
    // `buildDoc` reads a bare `logo:` as an empty list, so "missing" is
    // anything that is not a non-empty string — not just `undefined`.
    const logoMissing = typeof fm.logo !== "string" || fm.logo === ""
    // A takedown exempts only an ABSENT key (docs/TAKEDOWN.md removes the
    // line). A present-but-empty `logo:` becomes `[]`, which the site's logo
    // renderer reads as truthy and crashes on — so it blocks even when exempt.
    const logoKeyPresent = fm.logo !== undefined
    const exempt = takedowns.has(entrySlug) && !logoKeyPresent
    if (sees("logo") && logoMissing && !exempt) {
      issues.push(
        block(
          "missing-logo",
          "frontmatter",
          takedowns.has(entrySlug)
            ? "frontmatter `logo:` is present but empty — a takedown removes the whole `logo:` line (docs/TAKEDOWN.md); an empty value breaks the site's logo renderer."
            : `frontmatter \`logo\` is missing — every entry needs a logo (symbol preferred; app icon or confirmed wordmark as the /design-md fallbacks) as ${opts.expectedLogoUrl ? `\`logo: ${opts.expectedLogoUrl}\`` : "`logo: https://getdesign.kr/logos/{slug}.{svg,png,webp,avif}`"}.`
        )
      )
    } else if (opts.expectedLogoUrl) {
      if (sees("logo") && fm.logo !== opts.expectedLogoUrl) {
        issues.push(
          block(
            "expected-logo-mismatch",
            "frontmatter",
            `frontmatter \`logo\` must be exactly \`${opts.expectedLogoUrl}\` (got \`${fm.logo ?? "nothing"}\`) — the absolute URL form, never a site-relative shortcut.`
          )
        )
      }
    } else if (
      sees("logo") &&
      // An exempt slug's empty `logo:` is not a malformed URL.
      typeof fm.logo === "string" &&
      fm.logo !== "" &&
      !LOGO_URL_FORM.test(fm.logo)
    ) {
      issues.push(
        block(
          "logo-url-form",
          "frontmatter",
          `frontmatter \`logo\` \`${fm.logo}\` must be a fully-qualified https://getdesign.kr/logos/*.{svg,png,webp,avif} URL.`
        )
      )
    }

    for (const c of auditSourceCitations(entrySlug, doc.body)) {
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
  // With a fence left open the heading list stops where the fence opened. What
  // was read before it is complete, so duplicate, order and missing-section
  // findings up to that point stand; only a section that would have come after
  // the last heading seen may have been swallowed rather than left out, and the
  // unclosed-fence block already names that cause.
  const sectionIssues = checkSections(scan.headings)
  const reach = Math.max(
    -1,
    ...scan.headings.map((h) =>
      (REQUIRED_SECTIONS as ReadonlyArray<string>).indexOf(h)
    )
  )
  issues.push(
    ...(scan.unclosedFence
      ? sectionIssues.filter(
          (i) =>
            i.rule !== "missing-section" ||
            (REQUIRED_SECTIONS as ReadonlyArray<string>).indexOf(i.section) <
              reach
        )
      : sectionIssues)
  )
  issues.push(...checkDuplicateTokens(raw, body))
  const fmLines = frontmatterBlock(raw).split(/\r?\n/)
  issues.push(...scanFrontmatterTokens(fmLines))
  issues.push(...checkBlockScalars(fmLines))
  issues.push(...checkComponentRows(fmLines))
  issues.push(...checkWorkingMarkers(body))
  issues.push(...scan.yamlTokenIssues)
  issues.push(...scan.fenceIssues)
  issues.push(...scan.proseHexIssues)
  issues.push(...scan.auditNoteIssues)

  return {
    issues,
    passed: !issues.some((i) => i.severity === "block"),
    doc,
  }
}
