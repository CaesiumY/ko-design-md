import { KNOWN_FRONTMATTER_KEYS, buildDoc } from "./content-parser"
import { CATEGORIES } from "./content-types"
import { auditSourceCitations } from "./source-citations"
import { ALPHA_TOLERANCE, DELTA_E_TOLERANCE } from "./oklch-tolerance"
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

// Captures: L, C, H, the remainder inside the parens (carries `/ alpha`), hex.
const OKLCH_WITH_HEX =
  /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)([^)]*)\)\s*#\s*(#[0-9a-fA-F]{3,8})\b/

const srgbToLinear = (c: number): number =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

/**
 * sRGB hex → Oklch, plus the alpha channel when the hex carries one.
 * Accepts #RGB, #RGBA, #RRGGBB, #RRGGBBAA. `null` when unparseable.
 */
function hexToOklch(
  hex: string
): { L: number; C: number; H: number; alpha: number | null } | null {
  let h = hex.replace("#", "")
  // Shorthand expands by doubling each digit: #RGB(A) → #RRGGBB(AA).
  if (h.length === 3 || h.length === 4)
    h = h
      .split("")
      .map((c) => c + c)
      .join("")
  const alpha = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : null
  if (h.length === 8) h = h.slice(0, 6)
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return null
  const r = srgbToLinear(parseInt(h.slice(0, 2), 16) / 255)
  const g = srgbToLinear(parseInt(h.slice(2, 4), 16) / 255)
  const b = srgbToLinear(parseInt(h.slice(4, 6), 16) / 255)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.sqrt(A * A + B * B)
  let H = (Math.atan2(B, A) * 180) / Math.PI
  if (H < 0) H += 360
  return { L, C, H, alpha }
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
  const toLab = (c: { L: number; C: number; H: number }) => {
    const rad = (c.H * Math.PI) / 180
    return { L: c.L, a: c.C * Math.cos(rad), b: c.C * Math.sin(rad) }
  }
  const got = toLab(wrote)
  const want = toLab(expected)
  const deltaE = Math.hypot(got.L - want.L, got.a - want.a, got.b - want.b)

  // Transparency is part of the colour: `oklch(0 0 0 / 3%)  # #00000008` must
  // agree on alpha too, or the token renders at the wrong opacity. Only compared
  // when BOTH sides declare it — a 6-digit hex simply carries no alpha to check.
  const wroteA = oklchAlpha(`${alphaPart})`)
  const alphaOff =
    wroteA != null &&
    expected.alpha != null &&
    Math.abs(wroteA - expected.alpha) > ALPHA_TOLERANCE

  if (deltaE <= DELTA_E_TOLERANCE && !alphaOff) return null
  const alphaSuffix =
    expected.alpha != null ? ` / ${Math.round(expected.alpha * 100)}%` : ""
  // Hue is a circle: rounding 359.6 up must wrap to 0, not suggest an
  // out-of-range 360.
  const hue = Math.round(expected.H) % 360
  return `oklch(${expected.L.toFixed(3)} ${expected.C.toFixed(3)} ${hue}${alphaSuffix})`
}

function oklchHexMismatch(line: string): string | null {
  const m = line.match(OKLCH_WITH_HEX)
  if (!m) return null
  return compareOklchToHex(
    { L: Number(m[1]), C: Number(m[2]), H: Number(m[3]) },
    m[4],
    m[5]
  )
}

interface BodyScan {
  headings: Array<string>
  yamlTokenIssues: Array<ValidationIssue>
  proseHexIssues: Array<ValidationIssue>
}

function scanBody(body: string): BodyScan {
  const headings: Array<string> = []
  const yamlTokenIssues: Array<ValidationIssue> = []
  const proseHexLines: Array<string> = []
  let fence: "yaml" | "other" | null = null

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
        if (NON_OKLCH_VALUE.test(value)) {
          yamlTokenIssues.push(
            block(
              "non-oklch-token-value",
              "tokens",
              `yaml token \`${m[1].trim()}: ${value}\` is not OKLCH — express color token values as \`oklch(L C H)\` (keep the original as a trailing \`# ${value}\` comment if useful).`
            )
          )
        }
        // Warn (not block): the hex comment is a reference value, and a brand
        // may legitimately annotate an approximation. But a real mismatch means
        // a consumer copying the token renders the wrong colour.
        const corrected = oklchHexMismatch(line)
        if (corrected) {
          yamlTokenIssues.push(
            warn(
              "oklch-hex-mismatch",
              "tokens",
              `yaml token \`${m[1].trim()}\` declares an OKLCH that does not decode to its annotated hex — expected ${corrected}. Recompute from the hex (or drop the hex comment if the OKLCH is intentionally different).`
            )
          )
        }
      }
      continue
    }
    const fenceOpen = line.match(/^\s*```(\w*)/)
    if (fenceOpen) {
      fence = /^ya?ml$/i.test(fenceOpen[1]) ? "yaml" : "other"
      continue
    }
    const heading = line.match(/^##\s+(.+?)\s*$/)
    if (heading) {
      headings.push(heading[1])
      continue
    }
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
  return { headings, yamlTokenIssues, proseHexIssues }
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
    if (!(KNOWN_FRONTMATTER_KEYS as ReadonlyArray<string>).includes(m[1])) {
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
  issues.push(...scan.yamlTokenIssues)
  issues.push(...scan.proseHexIssues)

  return {
    issues,
    passed: !issues.some((i) => i.severity === "block"),
    doc,
  }
}
