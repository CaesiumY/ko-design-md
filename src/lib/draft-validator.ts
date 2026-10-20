import { lint } from "@google/design.md/linter"
import { buildSiteDoc } from "./content-parser"
import {
  CONSUMED_KEYS,
  KNOWN_FRONTMATTER_KEYS,
  entriesOf,
  findKey,
  readFrontmatter,
  tokenText,
} from "./frontmatter"
import { splitFrontmatter } from "./frontmatter-fence"
import { siteFrontmatterFrom, siteValue } from "./site-frontmatter"
import { REFERENCE_MAP_KEYS, ROW_SCAN_MAP_KEYS } from "./frontmatter-map-table"
import { CATEGORIES } from "./content-types"
import { auditSourceCitations } from "./source-citations"
import { ALPHA_TOLERANCE, DELTA_E_TOLERANCE } from "./oklch-tolerance"
import { deltaE, hexToOklab, lchToOklab, oklabToLch } from "./oklch-convert"
import { definitionRow, matchDefinition } from "./oklch-sync"
import { conflictingDefinitions } from "./oklch-drift"
import { KNOWN_SPEC_LIMITATIONS } from "./spec-limitations"
import { LOGO_TAKEDOWNS } from "./logo-takedowns"
import {
  TYPE_STYLE_PROPERTIES,
  extractTokensFromMarkdown,
  isShadowValue,
  stylePropertyValue,
} from "./token-extractor"
import type {
  FrontmatterEntryRow,
  FrontmatterKey,
  FrontmatterRead,
  FrontmatterReadFailure,
  FrontmatterValue,
} from "./frontmatter"
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

/**
 * The one read gate: the frontmatter as `readFrontmatter` reads it, or the one
 * block that says why it cannot be read (docs/adr/0011).
 *
 * Every frontmatter rule below judges this reading, the one the site, the
 * token extractor and the colour checks also use — so no rule has to ask
 * whether some other reader sees the file differently. When the block cannot
 * be read there is nothing to judge, and this block is the only frontmatter
 * finding: a guess at a broken block would only add messages built on a
 * misreading.
 */
function frontmatterReadIssue(
  failure: FrontmatterReadFailure
): ValidationIssue {
  const [first, ...rest] = failure.errors
  const more = rest.length > 0 ? ` (and ${rest.length} more after it)` : ""
  return block(
    "frontmatter-yaml-invalid",
    "frontmatter",
    failure.reason === "missing"
      ? `line ${first.line}: ${first.message}. Nothing in the frontmatter can be checked until it is there.`
      : `frontmatter is not valid YAML at line ${first.line}${more}: ${first.message}. A standard YAML reader — which is what a consumer of the Google DESIGN.md format uses — cannot read this file's tokens at all, and neither can the site's build.`
  )
}

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

// The frontmatter maps a `{map.name}` reference can point into — the
// `reference` trait in the map table, so a new map cannot drop out of this check.
const REFERENCE_MAPS: ReadonlySet<string> = new Set(REFERENCE_MAP_KEYS)
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

function isYamlMap(
  node: FrontmatterValue | undefined
): node is { [key: string]: FrontmatterValue } {
  return typeof node === "object" && node !== null && !Array.isArray(node)
}

/**
 * The frontmatter as written. YAML's value normalises numeric keys (`1.0`
 * becomes `1`, `010` becomes `10`), so a declared `{spacing.1.0}` would miss
 * and an undeclared `{spacing.1}` would hit. A map's keys keep their source
 * spelling here, as the reader gives them.
 */
function writtenTree(keys: ReadonlyArray<FrontmatterKey>): {
  [key: string]: FrontmatterValue
} {
  const out: { [key: string]: FrontmatterValue } = {}
  for (const entry of keys) {
    out[entry.key] = entry.rows ? writtenTree(entriesOf(entry)) : entry.value
  }
  return out
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
  read: FrontmatterRead
): Array<ValidationIssue> {
  const maps = writtenTree(read.keys)
  // A key with no value (`brand:` and nothing after it) resolves to nothing.
  const resolves = (
    map: FrontmatterValue | undefined,
    name: string
  ): boolean => {
    if (!isYamlMap(map)) return false
    if (Object.hasOwn(map, name)) return map[name] !== null
    let cur: FrontmatterValue | undefined = map
    for (const part of name.split(".")) {
      if (!isYamlMap(cur) || !Object.hasOwn(cur, part)) return false
      cur = cur[part]
    }
    return cur !== null
  }
  const matchesPattern = (
    map: FrontmatterValue | undefined,
    pattern: string
  ) => {
    if (!isYamlMap(map)) return false
    const re = segmentPattern(pattern)
    if (Object.keys(map).some((key) => re.test(key) && map[key] !== null))
      return true
    // A pattern over a property path (`{typography.*.fontSize}`) walks it one
    // segment at a time, the way `resolves` walks a single one.
    const walk = (
      node: FrontmatterValue | undefined,
      segs: Array<string>
    ): boolean => {
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

/** A comment that is one hex colour, alone or before another comment:
 *  `#FFF` and `# #0000001A` as the reader gives them (`FFF`, `#0000001A`).
 *  A word or number that merely looks like hex (`fade-in`, `200 level`) is
 *  a note, not a colour cut off by the comment. */
const COMMENT_HEX = /^#?([0-9a-fA-F]{3,8})(?=\s*$|\s+#)/

/** The hex a row's line-end comment holds, when that is all it holds. */
function commentHex(row: FrontmatterKey): string | undefined {
  return row.comment === undefined
    ? undefined
    : COMMENT_HEX.exec(row.comment)?.[1]
}

/**
 * Token rules over the frontmatter maps, which is where tokens live — every
 * map with the `rowScan` trait (see `frontmatter-map-table`), read as
 * `readFrontmatter` reads them. A value is judged as `tokenText` gives it,
 * the text the sidecar publishes, so quoting, indentation and block scalars
 * neither hide a token from these rules nor block one by themselves.
 *
 * Without this the catalog's central policy checks nothing: a `#3182F6` or an
 * `rgba(…)` written into `colors:` passes `validate:catalog` outright — verified
 * by injecting both into an entry and watching it report PASSED.
 *
 * Colour VALUES only. `typography:` holds font stacks and sizes that the OKLCH
 * rule has no business judging, and a reference (`{colors.x}`) is not a literal.
 */
function scanFrontmatterTokens(read: FrontmatterRead): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = []
  for (const mapKey of ROW_SCAN_MAP_KEYS) {
    const map = findKey(read.keys, mapKey)
    if (!map) continue
    for (const row of entriesOf(map)) {
      // These maps are flat: a token is one `name: value` row. A map under a
      // row renames every token in it (`{colors.brand.primary}`, not
      // `{colors.primary}`), which neither the sidecar nor a reference to the
      // flat name follows. An unquoted reference is one too: YAML reads
      // `{colors.x}` as a map.
      if (row.rows) {
        issues.push(
          block(
            "noncanonical-token-indent",
            "tokens",
            `token \`${row.key}\` in \`${mapKey}:\` holds a nested map — the map is flat, one \`name: value\` row per token. Nesting renames the tokens under it (\`{${mapKey}.${row.key}.…}\`), which the sidecar and every \`{${mapKey}.name}\` reference miss: write each as its own row. A reference must be quoted (\`"{${mapKey}.name}"\`) — unquoted, YAML reads \`{…}\` as a map.`
          )
        )
        continue
      }
      const hex = commentHex(row)
      if (row.value === null && hex !== undefined) {
        // `primary: #3182F6` — a space then `#` opens a YAML comment, so the
        // token has no value at all, and no other rule would say so.
        issues.push(
          block(
            mapKey === "elevation"
              ? "elevation-not-shadow"
              : "non-oklch-token-value",
            "tokens",
            `token \`${row.key}\` has no value: \`#${hex}\` after a space is a YAML comment, not part of it. Express the colour as \`oklch(L C H)\` and keep the hex in the trailing comment.`
          )
        )
        continue
      }
      const value = tokenText(row)
      if (value === undefined) continue
      // A reference resolves elsewhere, so it is not judged as a literal.
      if (value.startsWith("{")) continue
      // The row as YAML read it, in the one shape the shared OKLCH↔hex rule
      // judges — the same string `audit:oklch` builds.
      const line = definitionRow(row.key, value, row.comment)
      issues.push(...tokenLineIssues(row.key, value, line))
      // The extractor keeps only rows shaped like a shadow, so anything else in
      // `elevation:` vanishes from the sidecar while the file still publishes
      // it. The common way in is a bare hex colour: ` #0000001A` opens a YAML
      // comment, and what remains is a colourless `0 1px 2px`.
      if (mapKey === "elevation" && !isShadowValue(value)) {
        // Blame the comment only when the hex is what the shadow is missing.
        const cutColour = hex !== undefined && isShadowValue(`${value} #${hex}`)
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
  return issues
}

/** A value YAML reads as a map through an alias (`rounded: *scale`): the
 *  reader gives it no rows — a map written out has rows, `{}` an empty list of
 *  them. */
function isAliasedMap(entry: FrontmatterKey): boolean {
  const { value } = entry
  return (
    entry.rows === undefined &&
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  )
}

/**
 * A map written as a YAML alias, at any depth (`rounded: *scale`, a style
 * `title: *body`, a component). The linter expands it, but it has no rows of
 * its own in the file — no lines, `## group` headings or comments — so every
 * reader of rows (the sidecar, the token rules, the drift check, `audit:oklch`)
 * would have to borrow the anchor's, and `--fix` would rewrite one line on
 * behalf of two maps. The sidecar carried none of its tokens. Writing the map
 * out costs nothing; an `&anchor` on the map it copies is harmless.
 */
function checkAliasedMaps(read: FrontmatterRead): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = []
  const walk = (entries: ReadonlyArray<FrontmatterKey>, path: string): void => {
    for (const entry of entries) {
      const name = path === "" ? entry.key : `${path}.${entry.key}`
      if (isAliasedMap(entry)) {
        issues.push(
          block(
            "aliased-map-value",
            "frontmatter",
            `\`${name}\` is written as a YAML alias (\`*name\`) of another map. The official linter expands it, but the sidecar and every token check read a map's rows where they are written, and an alias has none — its tokens never reach the Tokens tab or \`use-design-md\`. Write the map out in full under \`${entry.key}:\`.`
          )
        )
        continue
      }
      if (entry.rows) walk(entriesOf(entry), name)
    }
  }
  walk(read.keys, "")
  return issues
}

/** `TYPE_STYLE_PROPERTIES` as the rule's messages name them. */
const STYLE_PROPERTY_NAMES = TYPE_STYLE_PROPERTIES.map((p) => `\`${p}\``).join(
  " / "
)

/**
 * The `typography:` map's one allowed shape: every row is a style, a map that
 * sets at least one of `TYPE_STYLE_PROPERTIES`. The official linter counts a
 * style the sidecar drops — one with only a `fontFamily`, or properties under
 * other names — so without this the Tokens tab and `use-design-md` lose it
 * while every gate passes.
 */
function checkTypographyStyles(read: FrontmatterRead): Array<ValidationIssue> {
  const map = findKey(read.keys, "typography")
  if (!map) return []
  const issues: Array<ValidationIssue> = []
  for (const style of entriesOf(map)) {
    // `aliased-map-value` names this one: "sets none of …" would be wrong.
    if (isAliasedMap(style)) continue
    // One level only: a map under a style is a group the sidecar does not
    // read as a style (`{typography.title.mobile}` names nothing it carries).
    const nested = entriesOf(style).find((p) => p.rows)
    if (nested) {
      issues.push(
        block(
          "typography-style-shape",
          "tokens",
          `style \`${style.key}\` in \`typography:\` holds a nested map (\`${nested.key}:\`) — a style is one name with ${STYLE_PROPERTY_NAMES} one level below it, and the sidecar reads nothing deeper. To group styles, put a \`  ## ${style.key}\` comment row above them and write each one flat (\`${nested.key}:\`); a variant of a style is its own flat style (\`${style.key}-${nested.key}:\`).`
        )
      )
      continue
    }
    const sized = entriesOf(style).some(
      (p) => stylePropertyValue(p) !== undefined
    )
    if (sized) continue
    issues.push(
      block(
        "typography-style-shape",
        "tokens",
        `style \`${style.key}\` in \`typography:\` sets none of ${STYLE_PROPERTY_NAMES}, so the sidecar carries no type token for it while the linter still counts it. A style is one name with those properties one level below it (four-space indent, as in the template). A font family published with no size belongs in the catalog-only \`fonts:\` map — do not invent a size to make it pass.`
      )
    )
  }
  return issues
}

/** The spec's component properties — `component_sub_tokens` in the pinned
 *  linter's `spec-config.yaml`, which the package does not export. A contract
 *  test compares the two, so a linter upgrade that changes the list fails until
 *  this follows. */
export const COMPONENT_PROPERTIES: ReadonlyArray<string> = [
  "backgroundColor",
  "textColor",
  "typography",
  "rounded",
  "padding",
  "size",
  "height",
  "width",
]

/** The spec's Dimension units — `units:` in the same file, pinned the same way. */
export const COMPONENT_DIMENSION_UNITS: ReadonlyArray<string> = [
  "px",
  "em",
  "rem",
]

/** A whole value that is one quoted reference, with the characters the
 *  linter's `isTokenReference` allows between the braces — `"{ colors.x }"` or
 *  `"{colors/x}"` it keeps as raw text. Whether it RESOLVES (a declared key,
 *  in a map the linter reads — not `{fonts.x}`) is not form: the linter
 *  reports that as a broken reference, which CI's error ratchet blocks. */
const QUOTED_REFERENCE = /^(["'])\{[a-zA-Z0-9._-]+\}\1$/
/** A number exactly as the linter's `parseDimensionParts` reads one —
 *  `-1`, `.5`, `1.25`; not `+4` or `48.`, which it keeps as raw text. */
const SPEC_NUMBER = String.raw`-?\d*\.?\d+`
/** One dimension a standard tool reads. */
const COMPONENT_DIMENSION = new RegExp(
  `^${SPEC_NUMBER}(?:${COMPONENT_DIMENSION_UNITS.join("|")})$`
)
/** The linter's `MAX_DIMENSION_LENGTH`: a longer value stays raw text. */
const MAX_DIMENSION_LENGTH = 64

function isComponentDimension(value: string): boolean {
  return value.length <= MAX_DIMENSION_LENGTH && COMPONENT_DIMENSION.test(value)
}

/** A literal CSS colour — hex or a colour function, OKLCH included. */
const LITERAL_COLOUR =
  /^(?:#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?|hwb|oklch|oklab|lch|lab|color-mix)\s*\()/i
/**
 * Strip a MATCHING surrounding quote pair, either style; leave anything else
 * alone so a value that merely contains a quote is not mangled. Only for the
 * advice below, which reads a component value's text as written.
 */
function stripQuotes(value: string): string {
  if (value.length >= 2) {
    const first = value[0]
    const last = value[value.length - 1]
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1)
    }
  }
  return value
}

/** Said wherever a fix moves a property out of the map: removing a
 *  component's only property leaves an empty head row, itself a block. A
 *  clause, so it ends whichever sentence carries it. */
const ONLY_PROPERTY =
  "if it was the component's only property, delete the component's head row too"

/** What to do about a component value that is neither admissible form — the
 *  likeliest cause first, since each needs a different fix. */
function componentValueFix(value: string): string {
  if (/^\{.*\}$/.test(value)) {
    return `quote it (\`"${value}"\`) — unquoted, YAML reads \`{…}\` as a map and standard tools get no value at all`
  }
  const trimmed = value.trim()
  if (
    trimmed !== value &&
    (QUOTED_REFERENCE.test(trimmed) || isComponentDimension(trimmed))
  ) {
    return `delete the invisible space around \`${trimmed}\` — YAML trims only spaces and tabs, so a no-break or full-width space stays part of the value and standard tools read it as text`
  }
  const bare = stripQuotes(value)
  if (bare !== value && /^\{.*\}$/.test(bare)) {
    return 'a reference names one token with only letters, digits, `.`, `_` and `-` between the braces (`"{colors.name}"`) — anything else standard tools keep as text'
  }
  if (bare !== value && isComponentDimension(bare)) {
    return `drop the quotes (\`${bare}\`)`
  }
  if (isComponentDimension(bare.toLowerCase())) {
    return `write the unit in lower case (\`${bare.toLowerCase()}\`) — standard tools read \`px\`, not \`PX\``
  }
  if (LITERAL_COLOUR.test(bare)) {
    return `the map takes no literal colour: point at a declared colour token as a quoted reference (\`"{colors.name}"\`), or leave the property out and keep the colour in the body spec; ${ONLY_PROPERTY}`
  }
  const parts = bare.split(/\s+/)
  if (parts.length > 1 && parts.every(isComponentDimension)) {
    return `write one value — a shorthand such as \`12px 16px\` is not a Dimension, so it stays in the body spec only; ${ONLY_PROPERTY}`
  }
  if (COMPONENT_DIMENSION.test(bare)) {
    return `shorten it — standard tools read a dimension of at most ${MAX_DIMENSION_LENGTH} characters`
  }
  const units = COMPONENT_DIMENSION_UNITS.join("|")
  if (new RegExp(`^[+-]?[\\d.]+(?:${units})?$`).test(bare)) {
    // Edit the text rather than reparse the number, so the value is kept to
    // the digit: drop a leading `+` and a `.` with no digits after it.
    const plain = bare.replace(/^\+/, "").replace(/\.(?=[a-z]*$)/, "")
    const withUnit = /[a-z]$/.test(plain) ? plain : `${plain}px`
    if (isComponentDimension(withUnit)) {
      return /[a-z]$/.test(bare)
        ? `write the number plainly (\`${withUnit}\`) — standard tools read no leading \`+\` or trailing \`.\``
        : `add a unit (\`${withUnit}\`; zero is \`0px\`) — a bare number is not a Dimension`
    }
  }
  if (new RegExp(`^[+-]?[\\d.]+(?!(?:${units})$)[a-zA-Z%]+$`).test(bare)) {
    return `the spec's Dimension takes ${COMPONENT_DIMENSION_UNITS.map((u) => `\`${u}\``).join("/")} only — a \`%\`, \`vw\` or other unit stays in the body spec; ${ONLY_PROPERTY}`
  }
  return `the map reads nothing else — keep keywords, notes and alternatives in the body spec; ${ONLY_PROPERTY}`
}

/** A fix that rewrites a row's key side must also carry its value's fix, or
 *  the rewritten row meets `component-value-form` on the next run. */
function rewrittenRow(prop: string, value: string): string {
  return QUOTED_REFERENCE.test(value) || isComponentDimension(value)
    ? `Write \`${prop}: ${value}\`.`
    : `Write \`${prop}: …\` — and its value \`${value}\` is not one the map reads either: ${componentValueFix(value)}.`
}

/** The linter's `isTokenReference`, as it tests the string YAML hands it. */
const BARE_REFERENCE = /^\{[a-zA-Z0-9._-]+\}$/

/**
 * A component property's value, and whether a standard tool reads it.
 *
 * A one-line scalar is judged as written, so the quotes the reference form
 * turns on are still there. A block scalar or a value YAML joined from several
 * lines has no such text: it is judged as the exact string YAML yields, which
 * is what the linter tests — so the quotes inside `|-` + `"{colors.x}"` are
 * part of the value (raw text to the linter), and so is the newline a `|` or
 * `>` header keeps at the end.
 */
function componentValue(prop: FrontmatterEntryRow): {
  text: string
  admitted: boolean
  /** Not on the key's line as one scalar — a block scalar or a joined value. */
  spread: boolean
} {
  const { source, value } = prop
  if (source !== undefined && !/^[|>]/.test(source) && !source.includes("\n"))
    return {
      text: source,
      admitted: QUOTED_REFERENCE.test(source) || isComponentDimension(source),
      spread: false,
    }
  const text = typeof value === "string" ? value : String(value)
  return {
    text,
    admitted:
      typeof value === "string" &&
      (BARE_REFERENCE.test(value) || isComponentDimension(value)),
    spread: true,
  }
}

/** The fix for a spread value whose one-line spelling would be admitted:
 *  `|-` + `"{colors.x}"` keeps its quotes as text, `|` + `48px` its newline. */
function spreadValueFix(prop: string, value: string): string | undefined {
  const bare = stripQuotes(value.trim())
  const oneLine = BARE_REFERENCE.test(bare)
    ? `"${bare}"`
    : isComponentDimension(bare)
      ? bare
      : undefined
  if (oneLine === undefined) return undefined
  return `write it on the key's line as \`${prop}: ${oneLine}\` — in a block scalar (\`|\`/\`>\`) every character is the value, so quotes stay in it as text and a \`|\` or \`>\` header without \`-\` keeps a trailing newline, and standard tools read either as text, not a reference or a dimension`
}

/** `height:48px` — a property written with no space after its colon. */
const GLUED_PROPERTY = /^([A-Za-z]+):(\S.*)$/

/**
 * The spec's `components:` map (#384), as `readFrontmatter` reads it.
 *
 * Its shape is two levels — a component, then its properties — and each
 * property is one of the spec's eight, its value one of the two forms a
 * standard tool reads (#525): a quoted reference, or one `px`/`em`/`rem`
 * dimension. The linter accepts everything else without a finding — an
 * unquoted reference reaches it as a YAML map, a shorthand or a note as raw
 * text, `48` as a bare number — so this is the only check on the form. Whether
 * a reference resolves is `checkTokenReferences`'s and the linter's; whether a
 * row matches its body spec is the reviewer's.
 *
 * A component that is YAML `null` (a head row with nothing under it) leaves
 * the linter no model: it then resolves no colours and no type scale, and the
 * only blocks left would name maps that are fine. So it is named here, and
 * `validateDraft` then skips the linter.
 */
function checkComponents(read: FrontmatterRead): Array<ValidationIssue> {
  const map = findKey(read.keys, "components")
  if (!map) return []
  const issues: Array<ValidationIssue> = []
  const shape = (fix: string) =>
    issues.push(block("noncanonical-component-shape", "tokens", fix))
  const form = (fix: string) =>
    issues.push(block("component-value-form", "tokens", fix))
  for (const component of entriesOf(map)) {
    const name = component.key
    if (component.value === null) {
      issues.push(
        block(
          "empty-component",
          "tokens",
          `component \`${name}\` has no property under it — YAML reads it as null and the official linter then builds no design system at all (it reports no colours and no type scale). Give it at least one of the spec's properties, or delete the row and keep the component in the body spec only.`
        )
      )
      continue
    }
    // `aliased-map-value` names this one.
    if (isAliasedMap(component)) continue
    if (!component.rows) {
      // `height:48px` — YAML starts a value only after a space or tab, so the
      // row is one string and the component's value is that string, with no
      // property at all.
      const glued =
        typeof component.value === "string"
          ? GLUED_PROPERTY.exec(component.value)
          : null
      if (glued && COMPONENT_PROPERTIES.includes(glued[1])) {
        form(
          `component property \`${component.value as string}\` has no space after the colon — YAML reads the whole row as one string, so the component gets no property at all. ${rewrittenRow(glued[1], glued[2])}`
        )
      } else {
        shape(
          `component \`${name}\` is not a map of properties — write it as a head row \`  ${name}:\` with one \`property: value\` row under it per property.`
        )
      }
      continue
    }
    for (const prop of entriesOf(component)) {
      // An unquoted reference: YAML reads `{colors.x}` as a map of one key.
      const inner = prop.rows ? entriesOf(prop) : []
      const unquotedReference = inner.length === 1 && inner[0].value === null
      if ((prop.rows && !unquotedReference) || Array.isArray(prop.value)) {
        shape(
          `component property \`${name}.${prop.key}\` holds a ${prop.rows ? "map" : "list"}, not one value — \`components:\` is two levels, a component and its properties. Keep a state or an alternative in the body spec; ${ONLY_PROPERTY}.`
        )
        continue
      }
      if (!COMPONENT_PROPERTIES.includes(prop.key)) {
        issues.push(
          block(
            "unknown-component-property",
            "tokens",
            `component property \`${prop.key}\` is not one of the spec's eight (${COMPONENT_PROPERTIES.map((p) => `\`${p}\``).join(", ")}). Standard tools ignore it — keep it in the body spec only; ${ONLY_PROPERTY}.`
          )
        )
        continue
      }
      const hex = commentHex(prop)
      if (prop.value === null) {
        if (hex !== undefined) {
          form(
            `component property \`${prop.key}: #${hex}\` has no value — a space then \`#\` opens a YAML comment, so \`#${hex}\` is not part of it. Fix: ${componentValueFix(`#${hex}`)}.`
          )
        } else {
          shape(
            `component property \`${name}.${prop.key}\` has no value. Write one, or remove the row; ${ONLY_PROPERTY}.`
          )
        }
        continue
      }
      if (unquotedReference) {
        form(
          `component property \`${prop.key}\` — ${componentValueFix(`{${inner[0].key}}`)}.`
        )
        continue
      }
      const { text, admitted, spread } = componentValue(prop)
      if (admitted) continue
      const shown = spread ? text.trim() : text
      const fix =
        (spread ? spreadValueFix(prop.key, text) : undefined) ??
        componentValueFix(shown)
      form(
        `component property \`${prop.key}: ${shown}\` is neither a quoted reference (\`"{colors.name}"\`) nor one ${COMPONENT_DIMENSION_UNITS.map((u) => `\`${u}\``).join("/")} dimension (\`48px\`), the two forms the spec's \`components:\` map reads — ${fix}.`
      )
    }
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
      // Blocked, not tolerated: the extractor never reads the body (#429), so
      // a token written back here reaches no sidecar and no drift check while
      // every other gate stays green.
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

/** A frontmatter value as YAML reads it — author input, typed by nothing. */
type ReadValue = FrontmatterValue | undefined

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

/** Consumed keys an entry may leave out: the site shows nothing
 *  (`design_system_name`) or estimates the value (`estimated_tokens`). Every
 *  other consumed key needs one — the design-md rubric requires `name`, `slug`,
 *  `category`, `last_updated`, `created_at` and `lang`, and a dropped `slug`
 *  reads as the file name (`draft` in the pipeline, a `slug-arg-mismatch`);
 *  `logo` is required outside a takedown (`missing-logo`). */
const OMITTABLE_KEYS: ReadonlySet<string> = new Set([
  "design_system_name",
  "estimated_tokens",
])

/**
 * What to tell an author whose taken-down entry writes a `logo` line, in any
 * form — every rule that judges the line gives this. Only the drop, since
 * restoring a logo is the maintainers' call (docs/TAKEDOWN.md) — unless the
 * caller names the expected logo: it wants that line (`expected-logo-mismatch`
 * would block the drop), so it gets the value plus the other half of a
 * restore. The slug comes off `LOGO_TAKEDOWNS`, or `takedown-logo-declared`
 * blocks the next run. With no `logo` key written there is nothing to
 * replace, so the restore adds the line.
 */
function takedownLogoFix(
  expectedLogoUrl: string | undefined,
  keyWritten = true
): string {
  if (!expectedLogoUrl) {
    return "This entry's logo was taken down, and a takedown removes the `logo` key (docs/TAKEDOWN.md) — remove it and every line of its value."
  }
  const write = keyWritten
    ? `replace the \`logo\` key and every line of its value with \`logo: ${expectedLogoUrl}\``
    : `add \`logo: ${expectedLogoUrl}\``
  return `This entry's logo was taken down; to restore it as expected, ${write}, and take this slug off \`LOGO_TAKEDOWNS\` (src/lib/logo-takedowns.ts, docs/TAKEDOWN.md).`
}

/**
 * What to tell an author who wrote `key: []`, which means "no value". Each
 * hint names the one fix the next run accepts: dropping the line where the
 * key may be left out, the value everywhere else (a taken-down logo has its
 * own, `takedownLogoFix`).
 */
function emptyListFix(
  key: string,
  expectedLogoUrl: string | undefined
): string {
  if (OMITTABLE_KEYS.has(key)) {
    return `YAML reads \`${key}: []\` as an empty list, not as no value. If \`${key}\` has no value, remove the line; otherwise write the one value as \`${key}: …\`.`
  }
  const value = key === "logo" && expectedLogoUrl ? expectedLogoUrl : "…"
  return `YAML reads \`${key}: []\` as an empty list, not as a value, and every entry gives \`${key}\` one. Write it on one line as \`${key}: ${value}\`.`
}

/** A character a card or title shows: a letter, digit, punctuation or symbol
 *  (`\p{L}`·`\p{N}`·`\p{P}`·`\p{S}`), less the characters in those categories
 *  known to render blank — the four Hangul fillers (letters), the blank
 *  braille pattern and the musical null notehead (symbols). Judged by the
 *  categories that show, so whitespace, zero-width, format, combining and
 *  private-use characters need no list. The exclusions are a known list, not
 *  a proof: a font can draw any glyph blank, so add one here when it turns up. */
const VISIBLE_CHAR =
  /(?![\u115F\u1160\u3164\uFFA0\u2800\u{1D159}])[\p{L}\p{N}\p{P}\p{S}]/u

/** Not a name a card or title can show: not text, or text with no visible
 *  character (`"   "`, a zero-width space, a Hangul filler — all of which
 *  both parsers read alike). */
function isBlankName(value: ReadValue): boolean {
  return typeof value !== "string" || !VISIBLE_CHAR.test(value)
}

/** A blank name as a message shows it: each character that does not show is
 *  written as its code point (`U+200B`), so a value that looks empty in the
 *  message is not mistaken for an empty string. */
function shownBlankName(value: ReadValue): string {
  if (typeof value !== "string") return shownValue(value)
  const shown = Array.from(value, (ch) =>
    ch === " " || VISIBLE_CHAR.test(ch)
      ? ch
      : `<U+${(ch.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, "0")}>`
  ).join("")
  return `"${shown}"`
}

/**
 * A `design_system_name:` line that YAML reads back as exactly `value`, or
 * null when no plain form does. Tried bare first, then double-quoted, then
 * single-quoted: YAML reads escapes inside double quotes and doubled `''`
 * inside single ones, so each form is checked by reading it with the one
 * reader, not by reasoning about its characters.
 */
function lineReadAs(value: string): string | null {
  const key = "design_system_name"
  for (const form of [value, `"${value}"`, `'${value}'`]) {
    const line = `${key}: ${form}`
    const read = readFrontmatter(`---\n${line}\n---\n`)
    if (!read.ok) continue
    const [only] = read.keys
    if (read.keys.length === 1 && only.key === key && only.value === value)
      return line
  }
  return null
}

/** Whether an em dash stands as a word of its own once whitespace is folded
 *  — where the catalog index would cut a design-system name. */
function hasStandaloneDash(name: string): boolean {
  return name.replace(/\s+/g, " ").trim().split(" ").includes("—")
}

/** The name with every standalone em dash dealt with: one at either end is
 *  dropped rather than swapped, so the name gains no stray `-`; one inside
 *  becomes `-`. The result never has a standalone dash, so it is safe to run
 *  again after anything else edits the name. */
function withoutStandaloneDashes(name: string): string {
  const words = name.replace(/\s+/g, " ").trim().split(" ")
  while (words[0] === "—") words.shift()
  while (words.at(-1) === "—") words.pop()
  return words.map((w) => (w === "—" ? "-" : w)).join(" ")
}

/**
 * The fix `design-system-name-separator` offers: one the next run accepts.
 *
 * A candidate name is offered only when this rule and `bad-design-system-name`
 * would both pass it — checked, not assumed — and only as a line YAML reads
 * back as exactly that name (`lineReadAs`). The value here has had its
 * quotes stripped, and written bare it can break (`Foo: - Bar`), turn into a
 * list (`- Foo`) or lose a tail to a comment (`Foo - #1`) (#508 review).
 *
 * A name that needs quoting yet holds both kinds of quote mark (`[a] "b" 'c'`)
 * fits no one line — a quote mark inside quotes of its kind would need an
 * escape, which changes the name — so the marks and backslashes go, and the dashes are dealt
 * with again: removing quotes can free one (`"—"` becomes `—`). If nothing is
 * left to offer, the key may be left out, which is always accepted.
 */
function separatorFix(name: string): string {
  const offered = (candidate: string): string | null =>
    candidate === "" || isBlankName(candidate) || hasStandaloneDash(candidate)
      ? null
      : lineReadAs(candidate)
  const first = withoutStandaloneDashes(name)
  const line = offered(first)
  if (line !== null) return `write it with another separator, as \`${line}\``
  const plain = offered(withoutStandaloneDashes(first.replace(/["'\\]/g, "")))
  if (plain !== null) {
    return `write it with another separator and without its quote marks and backslashes, which no one line can hold here, as \`${plain}\``
  }
  return "remove the line"
}

function checkFrontmatterKeys(read: FrontmatterRead): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = []
  // Judged on the keys as YAML reads them, so a quoted or escaped spelling
  // (`"sources"`, `"sour\u0063es"`) is the key it reads as.
  for (const { key } of read.keys) {
    const retired = RETIRED_FRONTMATTER_KEYS.get(key)
    if (retired) {
      issues.push(block("retired-frontmatter-key", "frontmatter", retired))
      continue
    }
    if (KNOWN_FRONTMATTER_KEYS.includes(key)) continue
    // A known key followed at once by a colon (`name:: 토스`,
    // `design_system_name:x: y`) is an extra colon: YAML reads the key up to
    // the colon-space, so the value meant for the known key is lost.
    const meant = KNOWN_FRONTMATTER_KEYS.find((k) => key.startsWith(`${k}:`))
    if (meant !== undefined) {
      issues.push(
        block(
          "colon-cut-frontmatter-key",
          "frontmatter",
          `YAML reads the key \`${key}\` (the key \`${meant}\` with an extra colon after it), so the value meant for \`${meant}\` is lost: the site and every other reader see the entry without it. Write it as \`${meant}: value\`: one colon, then a space (quote a value that holds \`: \`).`
        )
      )
    } else {
      issues.push(
        warn(
          "unknown-frontmatter-key",
          "frontmatter",
          `Unknown frontmatter key \`${key}\` (ignored by the site) — likely a typo for one of: ${KNOWN_FRONTMATTER_KEYS.join(", ")}.`
        )
      )
    }
  }
  return issues
}

/**
 * The keys the site reads, judged as `readFrontmatter` reads them — the reading
 * the site's build, the token extractor and every DESIGN.md consumer share.
 *
 * Each key holds one value, so a list in any of them is one block
 * (`list-frontmatter-value`) and no field rule judges it as well. A taken-down
 * entry's `logo` is the takedown's one block, whatever the line holds.
 */
function checkFields(
  read: FrontmatterRead,
  opts: DraftValidationOptions,
  entrySlug: string,
  fileSlug: string
): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = []
  const written = new Map(read.keys.map((k) => [k.key, k]))
  const takedowns = opts.logoTakedowns ?? LOGO_TAKEDOWNS
  // Which entry is taken down is the caller's expected slug when it gives one:
  // the written slug answers to it (`slug-arg-mismatch`), so a wrong slug line
  // neither hides the takedown nor takes another entry's logo away.
  const takenDown = takedowns.has(opts.expectedSlug ?? entrySlug)

  // A taken-down entry has no `logo` key (docs/TAKEDOWN.md). Whatever the line
  // holds — a URL, nothing, a list — the fix is the same, and each form's own
  // fix ("write a value", "one line") would bring the logo back.
  if (takenDown) {
    const logoWritten = written.has("logo")
    if (logoWritten || opts.expectedLogoUrl) {
      issues.push(
        block(
          logoWritten ? "takedown-logo-declared" : "expected-logo-mismatch",
          "frontmatter",
          takedownLogoFix(opts.expectedLogoUrl, logoWritten)
        )
      )
    }
  }

  /** The key's value when it holds one value; undefined when absent. */
  const single = new Map<string, FrontmatterKey>()
  for (const key of CONSUMED_KEYS) {
    const entry = written.get(key)
    if (!entry) continue
    if (!Array.isArray(entry.value)) {
      single.set(key, entry)
      continue
    }
    if (key === "logo" && takenDown) continue
    issues.push(
      block(
        "list-frontmatter-value",
        "frontmatter",
        entry.value.length > 0
          ? `YAML reads \`${key}\` as the list ${shownValue(entry.value)}, but it holds one value. Write it on one line, \`${key}: …\`, with no brackets or \`- \` items.`
          : emptyListFix(key, opts.expectedLogoUrl)
      )
    )
  }
  const value = (key: string): ReadValue => single.get(key)?.value

  // The values no field rule below judges — a date's form, the token count —
  // are judged by the site's own check, so a value this passes is one the
  // site's build takes.
  for (const key of ["last_updated", "created_at", "estimated_tokens"]) {
    const entry = single.get(key)
    if (!entry || entry.value === null) continue
    try {
      siteValue(entry, `line ${entry.line}`)
    } catch (e) {
      issues.push(
        block(
          "frontmatter-parse",
          "frontmatter",
          `The site's build refuses this value — ${e instanceof Error ? e.message : String(e)}`
        )
      )
    }
  }

  const category = value("category")
  if (
    single.has("category") &&
    (typeof category !== "string" ||
      !(CATEGORIES as ReadonlyArray<string>).includes(category))
  ) {
    issues.push(
      block(
        "bad-category",
        "frontmatter",
        `category ${shownValue(category)} is not in the CATEGORIES enum (${CATEGORIES.join(", ")}).`
      )
    )
  }
  // The catalog sorts, titles and feeds by the name as text. Blank includes
  // whitespace alone, which the card shows as nothing; a bare `name:` (YAML's
  // null) or a value YAML reads as a number is no name either. Without a
  // `name` key the site names the entry by its slug.
  const name = value("name")
  if (single.has("name") && isBlankName(name)) {
    issues.push(
      block(
        "bad-name",
        "frontmatter",
        `name must be one line of text with at least one visible character, as \`name: 토스\` (got ${shownBlankName(name)}).`
      )
    )
  }
  const systemName = value("design_system_name")
  if (single.has("design_system_name") && isBlankName(systemName)) {
    issues.push(
      block(
        "bad-design-system-name",
        "frontmatter",
        `design_system_name must be one line of text with at least one visible character, as \`design_system_name: TDS\`, or no line at all (got ${shownBlankName(systemName)}).`
      )
    )
  }
  // The catalog index writes the name as `: category · {name} — tagline`,
  // whitespace folded, and readers end it at the first ` — ` (#466,
  // `buildLlmsTxt` and the consumer skill's endpoints reference). The name
  // sits between ` · ` and ` — `, so in its folded form no em dash may
  // stand as a word of its own — `Foo —` and `— Foo` are cut as surely as
  // `Foo — Bar`. A dash without spaces on both sides is not a split point
  // and stays.
  if (
    typeof systemName === "string" &&
    !isBlankName(systemName) &&
    hasStandaloneDash(systemName)
  ) {
    issues.push(
      block(
        "design-system-name-separator",
        "frontmatter",
        `design_system_name \`${systemName}\` has an em dash standing as a word of its own; the catalog index writes the name between " · " and " — " and ends it at the first " — ", so such a dash, even at either end, cuts it; ${separatorFix(systemName)}.`
      )
    )
  }
  // A slug written empty falls back to the file name, as an absent one does —
  // so in the pipeline, which validates `draft.md`, it reads as `draft`.
  const slugValue = value("slug")
  const slug =
    slugValue === undefined || slugValue === null ? fileSlug : slugValue
  if (!single.has("slug") && written.has("slug")) {
    // A list — `list-frontmatter-value` already said so.
  } else if (typeof slug !== "string" || !SLUG_FORM.test(slug)) {
    issues.push(
      block(
        "bad-slug",
        "frontmatter",
        `slug ${shownValue(slug)} must be one line of text matching ^[a-z0-9-]+$.`
      )
    )
  } else if (opts.expectedSlug && slug !== opts.expectedSlug) {
    issues.push(
      block(
        "slug-arg-mismatch",
        "frontmatter",
        `frontmatter slug \`${slug}\` differs from the expected slug \`${opts.expectedSlug}\`.`
      )
    )
  }
  const lastUpdated = value("last_updated")
  const createdAt = value("created_at")
  if (!written.has("last_updated") || lastUpdated === null) {
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
  if (!written.has("created_at") || createdAt === null) {
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
    typeof createdAt === "string" &&
    typeof lastUpdated === "string" &&
    createdAt > lastUpdated
  ) {
    issues.push(
      warn(
        "created-at-after-last-updated",
        "frontmatter",
        `created_at (${createdAt}) is later than last_updated (${lastUpdated}) — an entry cannot be added after it was last synced. Check which of the two dates is wrong.`
      )
    )
  }
  // This rule is what enforces docs/adr/0001-korean-design-md-only.md: an
  // entry is one Korean file. Without a `lang` key the site reads `ko`.
  const lang = value("lang")
  if (single.has("lang") && lang !== "ko") {
    issues.push(
      block(
        "bad-lang",
        "frontmatter",
        `lang ${shownValue(lang)} must be exactly \`ko\` — an entry is one Korean design.md, with no second-language companion.`
      )
    )
  }
  // Every entry carries a logo: without one the catalog grid card falls back
  // to a first-letter badge and the OG image to text only, and the /design-md
  // skill no longer lets intake skip it. The one exemption is a recorded
  // takedown (docs/TAKEDOWN.md, ./logo-takedowns), judged above.
  const logo = value("logo")
  if (takenDown || (written.has("logo") && !single.has("logo"))) {
    // The takedown's block, or the list's.
  } else if (typeof logo !== "string" || logo === "") {
    issues.push(
      block(
        "missing-logo",
        "frontmatter",
        `frontmatter \`logo\` is missing — every entry needs a logo (symbol preferred; app icon or confirmed wordmark as the /design-md fallbacks) as ${opts.expectedLogoUrl ? `\`logo: ${opts.expectedLogoUrl}\`` : "`logo: https://getdesign.kr/logos/{slug}.{svg,png,webp,avif}`"}.`
      )
    )
  } else if (opts.expectedLogoUrl) {
    if (logo !== opts.expectedLogoUrl) {
      issues.push(
        block(
          "expected-logo-mismatch",
          "frontmatter",
          `frontmatter \`logo\` must be exactly \`${opts.expectedLogoUrl}\` (got \`${logo}\`) — the absolute URL form, never a site-relative shortcut.`
        )
      )
    }
  } else if (!LOGO_URL_FORM.test(logo)) {
    issues.push(
      block(
        "logo-url-form",
        "frontmatter",
        `frontmatter \`logo\` \`${logo}\` must be a fully-qualified https://getdesign.kr/logos/*.{svg,png,webp,avif} URL.`
      )
    )
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
 * The colours the linter resolves, against the ones the sidecar would carry.
 *
 * `colors:` is a required map, and the extractor behind the Tokens tab and
 * `use-design-md` keeps only a hex or a lower-case colour function. The
 * linter also reads a named colour (`white`, `transparent`) and an upper-case
 * function (`OKLCH(…)`, `RGB(…)`), which no other rule blocks — so a palette
 * written only that way would ship an empty colour sidecar with every other
 * gate green. Only the empty case: alias rows the linter resolves are left
 * out of the sidecar by design, so the two counts differ in a sound entry.
 *
 * A map whose shape already blocks — a row holding a map
 * (`noncanonical-token-indent`), or the map or a row written as an alias
 * (`aliased-map-value`) — is that rule's to name: one cause, one message.
 */
function checkSidecarColours(
  raw: string,
  /** The names of the colours the linter resolved. */
  names: ReadonlyArray<string>,
  colours: FrontmatterKey | undefined
): Array<ValidationIssue> {
  if (
    !colours ||
    isAliasedMap(colours) ||
    entriesOf(colours).some(
      (row) => row.rows !== undefined || isAliasedMap(row)
    )
  )
    return []
  let carried: number
  try {
    carried = extractTokensFromMarkdown(raw).colors.length
  } catch {
    // A frontmatter the shared reader refuses is the read gate's to name.
    return []
  }
  if (carried > 0) return []
  const listed = `${names
    .slice(0, 8)
    .map((n) => `\`${n}\``)
    .join(", ")}${names.length > 8 ? ", …" : ""}`
  return [
    block(
      "unreadable-colors",
      "tokens",
      `The official linter resolves ${names.length} colour(s) in \`colors:\` (${listed}), but the token extractor keeps none of them — the sidecar behind the Tokens tab and \`use-design-md\` would ship with no colour. It keeps a lower-case colour function or a hex, not a named colour (\`white\`, \`transparent\`) or an upper-case function name (\`OKLCH(…)\`): write each colour as \`name: oklch(L C H)\`.`
    ),
  ]
}

/**
 * The official DESIGN.md linter's verdict, as draft issues (#421).
 *
 * The entry file is published verbatim as the standard DESIGN.md, and CI's
 * corpus test lints every committed entry with this same linter. Running it
 * here moves those verdicts into the skill's machine gate, so a draft does not
 * pass Stage 6a2 and then fail on its PR. Only what CI would block, or what a
 * reviewer must act on, becomes an issue — `missing-primary` is a semantic call
 * the corpus test pins by list, and the warnings a `components:` map wakes are
 * advisory.
 */
function checkSpecLint(
  raw: string,
  slug: string | undefined,
  keys: ReadonlyArray<FrontmatterKey>
): Array<ValidationIssue> {
  let report: ReturnType<typeof lint>
  try {
    report = lint(raw)
  } catch (e) {
    return [
      block(
        "spec-lint-crash",
        "spec",
        `The official DESIGN.md linter threw on this document: ${e instanceof Error ? e.message : String(e)}`
      ),
    ]
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
  if (ds.colors.size > 0)
    issues.push(
      ...checkSidecarColours(
        raw,
        [...ds.colors.keys()],
        findKey(keys, "colors")
      )
    )
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
  return issues
}

export function validateDraft(
  raw: string,
  opts: DraftValidationOptions
): DraftValidationResult {
  const issues: Array<ValidationIssue> = []

  // The site's content collection loads every services/*.md, `_`-prefixed or
  // not, but the catalog checks used to skip `_` files as demo fixtures — so
  // such a file was published without ever being validated. The fixtures are
  // gone; the prefix now blocks instead of exempting.
  const fileName = opts.filePath.split("/").pop() ?? ""
  const fileSlug = fileName.replace(/\.md$/, "")
  if (fileName.startsWith("_")) {
    issues.push(
      block(
        "underscore-entry-file",
        "file",
        `${fileName} starts with \`_\` — an entry file name must not. The site publishes it like any other entry; rename it to its slug.`
      )
    )
  }

  const body = splitFrontmatter(raw)?.body ?? raw
  const read = readFrontmatter(raw)
  // The entry's slug for lookups keyed by it (recorded limitations, logo
  // takedowns, citations): the written slug, else the caller's, else the
  // file name.
  const slugEntry = read.ok ? findKey(read.keys, "slug") : undefined
  const entrySlug =
    (typeof slugEntry?.value === "string" && slugEntry.value !== ""
      ? slugEntry.value
      : undefined) ??
    opts.expectedSlug ??
    fileSlug

  let doc: ServiceDoc | null = null
  if (!read.ok) {
    issues.push(frontmatterReadIssue(read))
  } else {
    issues.push(...checkFrontmatterKeys(read))
    issues.push(...checkAliasedMaps(read))
    issues.push(...checkFields(read, opts, entrySlug, fileSlug))
    const componentIssues = checkComponents(read)
    // One cause, one message: a component that is empty (YAML null, which the
    // linter cannot model) leaves the linter's model empty, and its verdict
    // would add wrong instructions to the real one.
    if (!componentIssues.some((i) => i.rule === "empty-component")) {
      issues.push(...checkSpecLint(raw, entrySlug, read.keys))
    }
    issues.push(...checkTokenReferences(raw, read))
    issues.push(...scanFrontmatterTokens(read))
    issues.push(...checkTypographyStyles(read))
    issues.push(...componentIssues)
    // The document the site builds, for callers that want it; null when the
    // site's build would refuse a value (a field rule above says which).
    try {
      doc = buildSiteDoc(
        opts.filePath,
        raw,
        siteFrontmatterFrom(opts.filePath, read, () => {})
      )
    } catch {
      doc = null
    }
  }

  for (const c of auditSourceCitations(entrySlug, body)) {
    issues.push({
      severity: c.severity,
      rule: c.rule,
      section: "citations",
      fix: c.message,
    })
  }

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
