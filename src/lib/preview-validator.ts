import { buildDoc } from "./content-parser"
import { extractTokensFromMarkdown } from "./token-extractor"
import type { ValidationIssue } from "./draft-validator"

// Deterministic validator for preview HTML pairs — CODEGEN/CI ONLY. Encodes
// the mechanically checkable half of
// `.claude/skills/design-md/references/rubric-preview.md` (Item 1 structure
// checks and the static slices of Items 2-5). Rendering-dependent checks
// (actual overflow, visual dark adaptation) stay with the /design-md skill's
// Stage 12 dev-server sweep and the preview-html-reviewer subagent.

export interface PreviewValidationInput {
  slug: string
  lightRaw: string
  darkRaw: string
  // Byte sizes come from the caller (fs.stat) so the core stays fs-free.
  lightBytes: number
  darkBytes: number
  designMdRaw: string
  // Skill mode: the orchestrator's resolved site-relative logo paths. When
  // either is present the hero-logo check is a block, mirroring the Stage 10
  // deterministic grep. When both are absent (CI bulk mode) only the softer
  // logo-img-missing warn applies.
  expectedLogoSrc?: string
  expectedWordmarkSrc?: string
}

export interface CoverageMetric {
  matched: number
  total: number
}

export interface PreviewValidationResult {
  issues: Array<ValidationIssue>
  passed: boolean
  metrics: { light: CoverageMetric; dark: CoverageMetric }
}

const IFRAME_JS_SRC = "/preview/_runtime/iframe.js"
const TOKENS_CSS_HREF = "/preview/_runtime/tokens.css"
const BLOCK_BYTES = 128 * 1024
const WARN_BYTES = 100 * 1024

function block(rule: string, section: string, fix: string): ValidationIssue {
  return { severity: "block", rule, section, fix }
}

function warn(rule: string, section: string, fix: string): ValidationIssue {
  return { severity: "warn", rule, section, fix }
}

// ── CSS segmentation (comment-stripped, depth-tracked) ───────────────────────

interface CssRule {
  selector: string
  declarations: string
  inMedia: boolean
}

function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, " ")
}

// Minimal rule splitter: enough to attribute `grid-template-columns`
// declarations to selectors inside vs outside @media blocks. Conditional
// group rules (@media/@supports/@container) recurse; other at-rules
// (@font-face, @keyframes) are skipped wholesale.
function parseCssRules(css: string, inMedia = false): Array<CssRule> {
  const out: Array<CssRule> = []
  let i = 0
  while (i < css.length) {
    const open = css.indexOf("{", i)
    if (open === -1) break
    const selector = css.slice(i, open).trim()
    let depth = 1
    let j = open + 1
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth++
      else if (css[j] === "}") depth--
      j++
    }
    const inner = css.slice(open + 1, j - 1)
    if (/^@(media|supports|container)\b/.test(selector)) {
      out.push(...parseCssRules(inner, true))
    } else if (!selector.startsWith("@")) {
      out.push({ selector, declarations: inner, inMedia })
    }
    i = j
  }
  return out
}

function styleContent(html: string): string {
  return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join("\n")
}

// Track counting for `grid-template-columns` values. `repeat(auto-fill|fit,…)`
// self-collapses, so it never counts as a fixed multi-column layout.
function countTracks(value: string): number {
  const v = value.trim()
  if (/repeat\(\s*(auto-fill|auto-fit)/.test(v)) return 1
  const rep = v.match(/repeat\(\s*(\d+)\s*,/)
  if (rep) return Number(rep[1])
  const flattened = v
    .replace(/minmax\([^)]*\)/g, "T")
    .replace(/repeat\([^)]*\)/g, "T")
  return flattened.split(/\s+/).filter(Boolean).length
}

interface FileScan {
  bareOneFr: number
  uncollapsedSelectors: Array<string>
}

function scanCss(css: string): FileScan {
  const rules = parseCssRules(stripCssComments(css))
  let bareOneFr = 0
  const multiColRoot = new Map<string, string>()
  const mediaRedeclared = new Set<string>()

  for (const rule of rules) {
    // A rule's selector may be a grouped list (`.two-up, .comp-grid`) — the
    // collapse bookkeeping must work per individual selector.
    const selectors = rule.selector.split(/\s*,\s*/).filter(Boolean)
    for (const decl of rule.declarations.matchAll(
      /grid-template-columns\s*:\s*([^;]+)/g
    )) {
      const value = decl[1]
      const bare = value.replace(/minmax\([^)]*\)/g, "")
      if (/\b1fr\b/.test(bare)) bareOneFr++
      if (rule.inMedia) {
        for (const sel of selectors) mediaRedeclared.add(sel)
      } else if (countTracks(value) >= 2) {
        for (const sel of selectors) multiColRoot.set(sel, value.trim())
      }
    }
  }

  const uncollapsedSelectors = [...multiColRoot.keys()].filter(
    (sel) => !mediaRedeclared.has(sel)
  )
  return { bareOneFr, uncollapsedSelectors }
}

// ── color hygiene ────────────────────────────────────────────────────────────

const ACHROMATIC_HEX = new Set(["#fff", "#ffffff", "#000", "#000000"])

function chromaticHexValues(html: string): Array<string> {
  const found = new Set<string>()
  for (const m of html.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    const v = m[0].toLowerCase()
    if (!ACHROMATIC_HEX.has(v)) found.add(v)
  }
  return [...found]
}

function chromaticRgbaValues(html: string): Array<string> {
  const found = new Set<string>()
  for (const m of html.matchAll(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)[^)]*\)/g
  )) {
    const [r, g, b] = [m[1], m[2], m[3]].map(Number)
    const achromatic =
      (r === 0 && g === 0 && b === 0) || (r === 255 && g === 255 && b === 255)
    if (!achromatic) found.add(m[0].replace(/\s+/g, ""))
  }
  return [...found]
}

// ── design.md helpers ────────────────────────────────────────────────────────

function findFontDisplaySrc(body: string): string | null {
  let inTypography = false
  let inYaml = false
  for (const line of body.split(/\r?\n/)) {
    const h2 = line.match(/^##\s+(.+?)\s*$/)
    if (h2) {
      inTypography = h2[1] === "Typography"
      inYaml = false
      continue
    }
    if (!inTypography) continue
    if (/^\s*```/.test(line)) {
      inYaml = !inYaml
      continue
    }
    const m = line.match(/^\s*font-display-src:\s+(\S+)/)
    if (m) return m[1]
  }
  return null
}

function coverage(html: string, values: Array<string>): CoverageMetric {
  const haystack = html.replace(/\s+/g, " ")
  const matched = values.filter((v) => haystack.includes(v)).length
  return { matched, total: values.length }
}

// ── per-file checks ──────────────────────────────────────────────────────────

function checkFile(
  name: "light.html" | "dark.html",
  html: string,
  bytes: number,
  expectedTheme: "light" | "dark",
  expectedLang: string,
  heroSrc: string | undefined,
  issues: Array<ValidationIssue>
): void {
  const theme = html.match(/<html\b[^>]*\bdata-theme="([^"]*)"/)?.[1]
  if (theme !== expectedTheme) {
    issues.push(
      block(
        "data-theme-mismatch",
        name,
        `<html data-theme="${theme ?? "(none)"}"> must be "${expectedTheme}" in ${name}.`
      )
    )
  }
  const lang = html.match(/<html\b[^>]*\blang="([^"]*)"/)?.[1]
  if (lang !== expectedLang) {
    issues.push(
      block(
        "lang-mismatch",
        name,
        `<html lang="${lang ?? "(none)"}"> must match the design.md lang "${expectedLang}".`
      )
    )
  }
  if (!html.includes(`href="${TOKENS_CSS_HREF}"`)) {
    issues.push(
      block(
        "missing-tokens-css",
        name,
        `${name} must load the shared runtime via <link rel="stylesheet" href="${TOKENS_CSS_HREF}"> (absolute path).`
      )
    )
  }
  const scriptSrcs = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]*)"[^>]*>/gi)]
  const iframeTag = scriptSrcs.find((m) => m[1] === IFRAME_JS_SRC)
  if (!iframeTag) {
    issues.push(
      block(
        "missing-iframe-js",
        name,
        `${name} must load <script src="${IFRAME_JS_SRC}" defer></script> for the height-messaging contract.`
      )
    )
  } else if (!/\bdefer\b/.test(iframeTag[0])) {
    issues.push(
      warn(
        "iframe-js-defer",
        name,
        `${name} loads iframe.js without \`defer\` — add it so the script never blocks parsing.`
      )
    )
  }
  for (const m of scriptSrcs) {
    if (m[1] !== IFRAME_JS_SRC) {
      issues.push(
        block(
          "foreign-script",
          name,
          `${name} loads a script other than the shared runtime: \`${m[1]}\`. Previews must stay self-contained (no frameworks, no per-slug runtime copies).`
        )
      )
    }
  }
  if (bytes > BLOCK_BYTES) {
    issues.push(
      block(
        "file-too-large",
        name,
        `${name} is ${Math.round(bytes / 1024)}KB (> ${BLOCK_BYTES / 1024}KB hard cap) — inline assets or duplicated markup have run away.`
      )
    )
  } else if (bytes > WARN_BYTES) {
    issues.push(
      warn(
        "file-size-budget",
        name,
        `${name} is ${Math.round(bytes / 1024)}KB (> ${WARN_BYTES / 1024}KB budget) — consider trimming showcase markup.`
      )
    )
  }
  const hex = chromaticHexValues(html)
  if (hex.length > 0) {
    issues.push(
      warn(
        "hex-colors-present",
        name,
        `${name} carries ${hex.length} chromatic hex value(s) (${hex.slice(0, 5).join(", ")}${hex.length > 5 ? ", …" : ""}) — brand colors must be the design.md OKLCH values.`
      )
    )
  }
  const rgba = chromaticRgbaValues(html)
  if (rgba.length > 0) {
    issues.push(
      warn(
        "rgba-colors-present",
        name,
        `${name} carries ${rgba.length} chromatic rgb/rgba value(s) (${rgba.slice(0, 5).join(", ")}${rgba.length > 5 ? ", …" : ""}) — express chromatic colors in OKLCH (achromatic shadow alphas are fine).`
      )
    )
  }
  if (heroSrc && !html.includes(`src="${heroSrc}"`)) {
    issues.push(
      block(
        "hero-logo-missing",
        name,
        `${name} must render the hero logo <img src="${heroSrc}"> (site-relative form, both themes).`
      )
    )
  }

  const scan = scanCss(styleContent(html))
  if (scan.bareOneFr > 0) {
    issues.push(
      warn(
        "bare-1fr",
        name,
        `${name} has ${scan.bareOneFr} bare \`1fr\` grid track(s) — prefer \`minmax(0, 1fr)\` so a wide child can't floor the track at min-content and overflow.`
      )
    )
  }
  if (scan.uncollapsedSelectors.length > 0) {
    const list = scan.uncollapsedSelectors.slice(0, 5).join(", ")
    issues.push(
      warn(
        "no-mobile-collapse",
        name,
        `${name} has multi-column grid(s) with no @media grid-template-columns redeclaration: ${list} — add a mobile collapse rule.`
      )
    )
  }
}

// ── entry point ──────────────────────────────────────────────────────────────

export function validatePreviewPair(
  input: PreviewValidationInput
): PreviewValidationResult {
  const issues: Array<ValidationIssue> = []

  let expectedLang = "ko"
  let mdLogo: string | undefined
  let colorValues: Array<string> = []
  let fontDisplaySrc: string | null = null
  try {
    const doc = buildDoc(`/services/${input.slug}.md`, input.designMdRaw)
    expectedLang = doc.frontmatter.lang
    mdLogo = doc.frontmatter.logo
    colorValues = extractTokensFromMarkdown(doc.body).colors.map((c) => c.value)
    fontDisplaySrc = findFontDisplaySrc(doc.body)
  } catch (e) {
    issues.push(
      block(
        "design-md-unreadable",
        "design.md",
        `The paired design.md failed to parse: ${e instanceof Error ? e.message : String(e)}`
      )
    )
  }

  const heroSrc = input.expectedWordmarkSrc ?? input.expectedLogoSrc

  checkFile(
    "light.html",
    input.lightRaw,
    input.lightBytes,
    "light",
    expectedLang,
    heroSrc,
    issues
  )
  checkFile(
    "dark.html",
    input.darkRaw,
    input.darkBytes,
    "dark",
    expectedLang,
    heroSrc,
    issues
  )

  // CI bulk mode has no orchestrator-resolved logo paths; fall back to a soft
  // "renders any /logos/ image" check driven by the design.md frontmatter.
  if (!heroSrc && mdLogo) {
    for (const [name, html] of [
      ["light.html", input.lightRaw],
      ["dark.html", input.darkRaw],
    ] as const) {
      if (!/<img\b[^>]*\bsrc="\/logos\//.test(html)) {
        issues.push(
          warn(
            "logo-img-missing",
            name,
            `${name} renders no /logos/* image although the design.md frontmatter declares a logo — the hero should carry the brand mark.`
          )
        )
      }
    }
  }

  if (fontDisplaySrc) {
    for (const [name, html] of [
      ["light.html", input.lightRaw],
      ["dark.html", input.darkRaw],
    ] as const) {
      if (!html.includes(`href="${fontDisplaySrc}"`)) {
        issues.push(
          warn(
            "font-display-link-missing",
            name,
            `${name} does not <link> the design.md font-display-src (${fontDisplaySrc}) — the hero display face will silently fall back to Pretendard.`
          )
        )
      }
    }
  }

  const lightStyle = styleContent(input.lightRaw)
  const darkStyle = styleContent(input.darkRaw)
  if (lightStyle.trim() !== "" && lightStyle === darkStyle) {
    issues.push(
      warn(
        "identical-style-blocks",
        "pair",
        "light.html and dark.html carry byte-identical <style> blocks — dark must be a considered adaptation (surface hue, primary lightness shift), not a copy."
      )
    )
  }

  return {
    issues,
    passed: !issues.some((i) => i.severity === "block"),
    metrics: {
      light: coverage(input.lightRaw, colorValues),
      dark: coverage(input.darkRaw, colorValues),
    },
  }
}
