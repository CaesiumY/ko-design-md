import { isMap, isScalar, parseDocument } from "yaml"
import { lint } from "@google/design.md/linter"
import {
  KNOWN_FRONTMATTER_KEYS,
  buildDoc,
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
import { isShadowValue } from "./token-extractor"
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

// The frontmatter maps a `{map.name}` reference can point into.
const REFERENCE_MAPS: ReadonlySet<string> = new Set([
  "colors",
  "typography",
  "spacing",
  "rounded",
  "components",
  "elevation",
  "gradients",
  "opacity",
  "grid",
  "fonts",
])
// Namespaces authors reach for that no entry declares as a map. Each was found
// in the catalog pointing at nothing; the advice says where the value lives.
const PHANTOM_MAPS: ReadonlyMap<string, string> = new Map([
  [
    "motion",
    "There is no `motion:` map — durations and easings live in a ```text fence under the Motion or Elevation heading. Write the name as a plain code span (`dur-base`) without braces.",
  ],
  [
    "shadow",
    "Shadows live in the `elevation:` map — write `{elevation.name}`.",
  ],
  ["radius", "Radii live in the `rounded:` map — write `{rounded.name}`."],
  [
    "layout",
    "There is no `layout:` map. Write the name as a plain code span without braces, or reference the `spacing:`/`grid:` token that holds the value.",
  ],
])
const TOKEN_REF = /\{([a-z]+)\.([\w.-]+)\}/g

// What `toJS()` builds from a frontmatter block.
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
 * Scans the whole file — token-line comments included, since those become the
 * sidecar's `note`. Namespaces outside REFERENCE_MAPS and PHANTOM_MAPS are left
 * alone: `{component.x}` points at a `###` heading, not a frontmatter map, and
 * `{item.image}` in a tsx fence is JSX.
 */
function checkTokenReferences(raw: string): Array<ValidationIssue> {
  const split = splitFrontmatter(raw)
  if (!split) return []
  const parsed = parseDocument(split.frontmatter)
  // An unparseable block already blocks as `frontmatter-yaml-invalid`; judging
  // references against a half-read map would only add noise to that finding.
  if (parsed.errors.length > 0) return []
  const root: YamlNode = parsed.toJS()
  const maps = isYamlMap(root) ? root : {}
  const resolves = (map: YamlNode | undefined, name: string): boolean => {
    if (!isYamlMap(map)) return false
    if (Object.hasOwn(map, name)) return true
    // A property path into a composite token: `{typography.body-m.fontSize}`.
    let cur: YamlNode | undefined = map
    for (const part of name.split(".")) {
      if (!isYamlMap(cur) || !Object.hasOwn(cur, part)) return false
      cur = cur[part]
    }
    return true
  }
  const issues: Array<ValidationIssue> = []
  const reported = new Set<string>()
  for (const [ref, ns, name] of raw.matchAll(TOKEN_REF)) {
    if (reported.has(ref)) continue
    const phantom = PHANTOM_MAPS.get(ns)
    if (phantom === undefined && !REFERENCE_MAPS.has(ns)) continue
    if (phantom === undefined && resolves(maps[ns], name)) continue
    reported.add(ref)
    const elsewhere = [...REFERENCE_MAPS].filter(
      (other) => other !== ns && resolves(maps[other], name)
    )
    const advice =
      phantom ??
      (elsewhere.length > 0
        ? `\`${name}\` is declared in \`${elsewhere.join("`, `")}:\` — reference it there (\`{${elsewhere[0]}.${name}}\`).`
        : `Fix the name if the value is declared under another key. If it is a name the brand publishes but this entry does not tokenize, write it as a plain code span without braces, and never add a token whose value no [src:N] supports.`)
    const what =
      phantom === undefined
        ? `names no key in this entry's \`${ns}:\` map`
        : `points into \`${ns}:\`, a map no catalog entry has`
    issues.push(
      block(
        "unresolved-token-ref",
        "tokens",
        `\`${ref}\` ${what}. ${advice} This file is published as the standard DESIGN.md, where the reference promises a lookup a consumer cannot complete.`
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
      if (mapKey === "elevation" && !isShadowValue(value)) {
        const comment = row.rest.match(/\s+#\s?(.*)$/)?.[1] ?? ""
        issues.push(
          block(
            "elevation-not-shadow",
            "tokens",
            /^#?[0-9a-fA-F]{3,8}\b/.test(comment)
              ? `shadow \`${row.key}\` ends where its colour should be — \`${value}\` — because a space followed by \`#\` opens a YAML comment, so the hex after it is not part of the value. Write the colour as \`oklch(L C H / alpha)\` (the catalog's colour form) and keep the hex in the trailing comment.`
              : `\`${row.key}: ${value}\` in \`elevation:\` is not a box-shadow (it needs two offsets and a colour, or \`none\`), so the sidecar drops it. Move motion tokens, z-indices and usage labels to a \`\`\`text fence under \`## Elevation & Depth\`.`
          )
        )
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
      const close = line.match(/^\s*(`{3,}|~{3,})\s*$/)
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
    // A backtick run followed by another backtick on the line is inline code
    // at the start of prose (```yaml``` 는 …), not a fence — CommonMark forbids
    // backticks in a backtick fence's info string. Reading it as a fence would
    // leave it open to the end of the document.
    const fenceOpen = line.match(/^\s*(`{3,}(?=[^`]*$)|~{3,})(\w*)/)
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

function checkFrontmatterKeys(raw: string): Array<ValidationIssue> {
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
  const keys = new Set<string>()
  const split = splitFrontmatter(raw)
  if (split) {
    const contents = parseDocument(split.frontmatter).contents
    if (isMap(contents)) {
      for (const item of contents.items) {
        if (isScalar(item.key)) keys.add(String(item.key.value))
      }
    }
  }
  for (const m of fmBlock[1].matchAll(/^([A-Za-z_][\w-]*):/gm)) keys.add(m[1])
  for (const key of keys) {
    const retired = RETIRED_FRONTMATTER_KEYS.get(key)
    if (retired) {
      issues.push(block("retired-frontmatter-key", "frontmatter", retired))
    }
  }
  for (const m of fmBlock[1].matchAll(/^([A-Za-z_][\w-]*):/gm)) {
    if (RETIRED_FRONTMATTER_KEYS.has(m[1])) continue
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
  if (ds.typography.size === 0) {
    issues.push(
      warn(
        "spec-no-typography",
        "spec",
        "The official DESIGN.md linter resolves no type scale. Declare it in the frontmatter `typography:` map — CI blocks an entry without one unless it is recorded in NO_TYPE_SCALE (google-designmd-corpus.test.ts) with the reason the publisher ships none."
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
  const yamlIssues = checkFrontmatterYaml(raw)
  issues.push(...yamlIssues)
  issues.push(...checkFrontmatterKeys(raw))
  // One cause, one message: when the frontmatter does not parse, the linter's
  // model is empty and would add three wrong instructions to the real one.
  // The slug falls back to what the caller expects, then the file name, so a
  // document `buildDoc` rejects is still judged against its recorded count.
  if (!yamlIssues.some((i) => i.severity === "block")) {
    const slug =
      doc?.frontmatter.slug ??
      opts.expectedSlug ??
      (opts.filePath.split("/").pop() ?? "").replace(/\.md$/, "")
    issues.push(...checkSpecLint(raw, slug))
  }
  issues.push(...checkTokenReferences(raw))

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
    // ServiceFrontmatter types lang as "ko", but buildDoc never validates it —
    // a draft can carry any string at runtime. Widen before comparing so the
    // check survives the type-level narrowing. This rule is what enforces
    // docs/adr/0001-korean-design-md-only.md: an entry is one Korean file.
    // It replaced `lang-arg-mismatch`, which compared against an expected lang
    // the caller passed — with one allowed value there is nothing to pass.
    const lang: string = fm.lang
    if (lang !== "ko") {
      issues.push(
        block(
          "bad-lang",
          "frontmatter",
          `lang \`${lang}\` must be exactly \`ko\` — an entry is one Korean design.md, with no second-language companion.`
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

    for (const c of auditSourceCitations(fm.slug, doc.body)) {
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
