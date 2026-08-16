/*
 * light.html + dark.html → preview.html  (issue #235)
 *
 * One-shot migration, kept in the tree so the transformation itself is
 * reviewable: 17 slugs × ~300 edit sites is not something to hand-check as a
 * diff. Re-runnable — reads the two halves, writes the merged file, and never
 * edits in place.
 *
 * What it does
 * ------------
 * 1. Markup: walks both documents in lockstep. Where a node's outerHTML
 *    differs, it emits the light node followed by
 *    `<template data-theme-variant="dark">` holding the dark node. It descends
 *    first and only pairs the DEEPEST differing nodes — pairing high in the
 *    tree would keep both copies of everything below and defeat the merge.
 *
 *    `<template>` rather than a hidden element: template content is inert. It
 *    does not render, does not enter the accessibility tree, is not found by
 *    the browser's find-in-page and is not copied with a selection. The merged
 *    file therefore never carries text that is present but invisible.
 *
 *    The template is inert as content but is still an ELEMENT, so it would sit
 *    in the sibling chain and shift `:nth-child`. `_runtime/iframe.js` therefore
 *    replaces each one with a comment node the moment it runs; the note there
 *    explains why the file format keeps the template anyway.
 *
 * 2. CSS: the dark half's sheet is appended with every selector rewritten under
 *    `[data-theme="dark"]`. That rewrite is not cosmetic — `audit:oklch`
 *    compares preview literals against the md's light definitions and skips
 *    anything scoped under `[data-theme="dark"]`. Leaving the dark tokens at
 *    `:root` reports 138 false drift findings across the catalogue (measured).
 *
 *    The light sheet is kept verbatim EXCEPT for declarations the dark half
 *    never restates, which move into a `[data-theme="light"]` guard — see
 *    `scopeLightOnly`.
 *
 * 3. `<title>` loses its "· light" suffix; `<html data-theme>` stays "light",
 *    which is what the file shows with no runtime at all.
 *
 * Usage: node scripts/merge-preview-themes.mjs [slug…]   (default: every slug)
 */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { JSDOM } = require("jsdom")

const PREVIEW = "public/preview"
const STYLE_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi

/**
 * The shared runtime sheet every preview links. It is NOT part of either half,
 * so scoping the dark half changes how the page's rules rank against it — see
 * `selectorsOutrankedByTokens`. Read once; it is the same file for all slugs.
 */
const TOKENS_CSS = fs.readFileSync(
  path.join(PREVIEW, "_runtime/tokens.css"),
  "utf8"
)

// Parsed on first use, not here: the parse reads `UNSCOPABLE`, which is a `const`
// declared further down and therefore still in its temporal dead zone while this
// module's top level runs.
let tokensRulesMemo = null
function tokensRules() {
  if (tokensRulesMemo === null) tokensRulesMemo = tokensSheetRules(TOKENS_CSS)
  return tokensRulesMemo
}

/**
 * Put the whole dark sheet behind `[data-theme="dark"]`.
 *
 * `flatten` names the selectors that must NOT gain the scope's weight — see
 * `selectorsOutrankedByTokens`.
 */
function scopeDark(css, flatten) {
  return scopeBlock(css, blankInert(css), flatten)
}

// A single `[data-theme="dark"]` prefix. Three alternatives were measured and
// withdrawn — the notes below are the record, since each looks obviously right
// until it is run.
//
// Rejected: `:where()` so the scope adds NO specificity. The dark sheet is a copy of the
// light one, so its rules need only to be *later*, not stronger — and making
// them stronger was itself a bug: a bare `[data-theme="dark"] .sd-tag` (0,2,0)
// overtook `tokens.css`'s `.catalog-disclaimer b` (0,1,1), which legitimately
// won in the original dark document. Zero-specificity scoping reproduces the
// original relationship exactly: same weight as the light twin, later in order.
//
// Two other approaches were measured and withdrawn. Repeating the attribute to
// force dark above light is not a uniform boost — `:root` gains 2 and `.x`
// gains 3 — and 11st went from 10 mismatches to 373. Cascade layers express
// the intent directly but cannot be used: the shared `tokens.css` is unlayered,
// and unlayered declarations outrank layered ones, so layering the page sheets
// demoted them beneath it (light went from exact to 348 mismatches).
const DARK = '[data-theme="dark"]'

/**
 * At-rules that cannot be nested under a selector. They stay global.
 *
 * Duplicating a `@font-face` or `@keyframes` the light sheet already declares is
 * harmless — the later identical declaration renders the same. Dropping one
 * would not be: a dark-only face or animation would silently stop loading.
 */
const UNSCOPABLE =
  /^@(font-face|import|charset|namespace|keyframes|-\w+-keyframes|property|page|counter-style|font-feature-values)\b/i

/** At-rules whose body holds ordinary rules that DO need scoping. */
const NESTED = /^@(media|supports|container|layer|scope)\b/i

/**
 * Where the statement at-rules that precede a selector end.
 *
 * Both walkers below take "everything since the last `}`" as the prelude, which
 * is right for `.a, .b {` and wrong the moment a `;`-terminated at-rule sits in
 * front of it. `@import url(x);\n:root {` arrives as ONE prelude beginning with
 * `@import`, so `UNSCOPABLE` matches and the whole thing — the `:root` rule
 * included — is emitted verbatim. The dark half's token block then lands at
 * `:root` and repaints the light theme. gmarket is the shipped case; its first
 * dark rule happens to be `[data-theme="dark"] {` already, which is the only
 * reason nothing broke (toss, krds, socar and wanted all open with `:root {`).
 *
 * The cut is the last `;` at depth 0. Always handed a slice of the blanked scan,
 * so a `;` inside a quoted value is already erased; parens are still tracked here
 * for the unquoted `url(…)` form, which `blankInert` leaves alone.
 */
function statementCut(prelude) {
  let paren = 0
  let cut = -1
  for (let i = 0; i < prelude.length; i++) {
    const c = prelude[i]
    if (c === "(") paren++
    else if (c === ")" && paren > 0) paren--
    else if (paren === 0 && c === ";") cut = i
  }
  return cut
}

/**
 * Put every rule in the dark sheet behind `[data-theme="dark"]`.
 *
 * Rewriting only `:root` was a bug that shipped: the dark half is a full copy of
 * the page's CSS, not a token patch, so its ordinary rules — `.gov-strip`,
 * `.hero`, `.badge.positive` — came along unscoped and, being declared later,
 * won in BOTH themes. 619 such rules across the catalogue. Light previews
 * rendered with dark surfaces and the wrong faces.
 *
 * `html` and `:root` cannot take a descendant prefix, since the attribute lives
 * on that same element; they are compounded instead.
 *
 * `scan` is `css` with comments and strings blanked, same length; it decides
 * where every boundary is, `css` supplies the bytes that get emitted. Two things
 * follow from that split, and neither was true of the earlier walk:
 *
 *  - A brace, semicolon or comma inside a `content: "{"` no longer moves a
 *    boundary. The old walk counted braces in the raw text, so one such
 *    character shifted every following rule's body by one rule.
 *  - Comments SURVIVE. The dark sheet used to be handed to `stripComments`
 *    first, which erased 696 comments / 36,417 B across the catalogue —
 *    including seven `/* #171719 *\/`-style records of a dark-only token's
 *    original hex that the light half has no counterpart for, and which this
 *    PR deletes `dark.html` out from under. It also silently narrowed the
 *    gate: `hex-colors-present` fired twice on codeit's split halves and once
 *    on the merged file, and the same one-warning drop hit
 *    line-design-system, wanted and yeogi. Comments in a prelude (422 of the
 *    696) are emitted ahead of the rule they introduce; comments inside a body
 *    (274) ride along with the body, which is copied verbatim.
 */
function scopeBlock(css, scan, flatten) {
  const out = []
  let i = 0
  while (i < css.length) {
    const open = scan.indexOf("{", i)
    if (open === -1) {
      // Trailing comments after the last rule.
      const tail = css.slice(i).trim()
      if (tail !== "") out.push(tail)
      break
    }
    let depth = 1
    let j = open + 1
    while (j < css.length && depth > 0) {
      if (scan[j] === "{") depth++
      else if (scan[j] === "}") depth--
      j++
    }
    const cut = statementCut(scan.slice(i, open))
    const statements = cut === -1 ? "" : css.slice(i, i + cut + 1)
    const selFrom = cut === -1 ? i : i + cut + 1
    const selReal = css.slice(selFrom, open)
    const selScan = scan.slice(selFrom, open)
    const body = css.slice(open + 1, j - 1)
    const bodyScan = scan.slice(open + 1, j - 1)

    // Everything before the first non-blank character of the SCAN is comment and
    // whitespace, so it is not part of the selector — measuring it on the raw
    // text would feed `/* note */ :root` to `scopeSelector`, which reads the
    // comment as the start of the selector and emits a descendant `:root` that
    // matches nothing.
    const lead = selScan.length - selScan.trimStart().length
    const trail = selScan.length - selScan.trimEnd().length
    const before = selReal.slice(0, lead).trim()
    const prelude = selReal.slice(lead, selReal.length - trail)
    const preludeScan = selScan.slice(lead, selScan.length - trail)

    // Statement at-rules keep their place in the sheet: `@import` is only valid
    // ahead of the other rules of its own stylesheet, and the dark sheet is its
    // own <style>.
    if (statements.replace(/;/g, "").trim() !== "") {
      out.push(statements.trim())
    }
    if (before !== "") out.push(before)

    if (UNSCOPABLE.test(preludeScan)) {
      out.push(`${prelude} {${body}}`)
    } else if (NESTED.test(preludeScan)) {
      out.push(`${prelude} {${scopeBlock(body, bodyScan, flatten)}}`)
    } else if (prelude !== "") {
      out.push(`${scopeSelectorList(prelude, preludeScan, flatten)} {${body}}`)
    }
    i = j
  }
  return out.join("\n")
}

/**
 * Cut a selector list at the commas that actually separate selectors.
 *
 * `scan` decides where the cuts are, `real` supplies the bytes; the two are the
 * same length. Comments and strings are already blanked in `scan`, so a comma
 * inside `/* a, b *\/` or `content: "a,b"` cannot separate anything.
 *
 * Parens are counted here for the same reason `statementCut` counts them: a
 * comma inside `:is(…)`, `:not(…)`, `:has(…)` or `url(…)` is part of ONE
 * construct, not a boundary between two selectors. Cutting there fed the second
 * arm to `scopeSelector` on its own, which scoped the arm instead of the
 * selector:
 *
 *   :is(.a, .b) .x   ->  [data-theme="dark"] :is(.a, [data-theme="dark"] .b) .x
 *
 * and the same shape came out of the light guard in `scopeLightOnly`. Neither is
 * cosmetic. `:is()`/`:not()` take the HIGHEST specificity among their arguments,
 * so an injected attribute lifts `:is(.a, .b) .x` from (0,1,1) to (0,2,1) and can
 * flip the cascade — the exact class of accident `selectorsOutrankedByTokens`
 * exists to undo. `:has()` is worse than a weight change: `:has(> .item, > .row)`
 * becomes `:has(> .item, [data-theme="dark"] > .row)`, whose second arm now asks
 * for a child of a DESCENDANT carrying the attribute. The attribute lives on
 * `<html>`, which is nobody's descendant, so that arm can never match again.
 *
 * No catalogue preview puts a comma inside a functional pseudo-class today, and
 * regenerating all 17 is byte-identical either way. It is fixed for the reason
 * the comment case and the string case were, both also unreachable when fixed:
 * preview.html is a hand-authoring convention
 * (`.claude/agents/preview-html-author.md`), and `:not(` already appears 10 times
 * across the previews and `:where(` 13 — one comma is the whole distance.
 */
function splitTopLevel(real, scan) {
  const out = []
  let start = 0
  let paren = 0
  for (let i = 0; i <= scan.length; i++) {
    if (i !== scan.length) {
      const c = scan[i]
      if (c === "(") {
        paren++
        continue
      }
      if (c === ")") {
        if (paren > 0) paren--
        continue
      }
      if (c !== "," || paren > 0) continue
    }
    out.push({ piece: real.slice(start, i), scan: scan.slice(start, i) })
    start = i + 1
  }
  return out
}

/** Split on the commas `scan` sees, not the ones `list` has. */
function scopeSelectorList(list, scan, flatten) {
  const out = []
  for (const { piece, scan: pieceScan } of splitTopLevel(list, scan)) {
    const lead = pieceScan.length - pieceScan.trimStart().length
    const trail = pieceScan.length - pieceScan.trimEnd().length
    const core = piece.slice(lead, piece.length - trail)
    if (core === "") continue
    const before = piece.slice(0, lead).trim()
    const scoped = scopeSelector(core, flatten)
    out.push(before === "" ? scoped : `${before} ${scoped}`)
  }
  return out.join(", ")
}

function scopeSelector(sel, flatten) {
  if (sel === "") return ""
  if (sel.startsWith(DARK)) return sel
  // `:root` and a leading `html` name the element that carries the attribute,
  // so they compound with it rather than sitting inside it.
  if (/^:root\b/.test(sel)) return sel.replace(/^:root/, DARK)
  if (/^html\b/.test(sel)) return sel.replace(/^html/, `html${DARK}`)
  const scope =
    flatten !== undefined && flatten.has(normaliseSelector(sel))
      ? `:where(${DARK})`
      : DARK
  return `${scope} ${sel}`
}

/* ------------------------------------------------------------------------ *
 * Light-only declarations
 *
 * Scoping the dark sheet stops dark rules from painting the light theme. The
 * mirror leak has no such fix: where the light sheet declares something the
 * dark half never restates, dark inherits the light value and draws it wrong.
 * `vapor-ui`'s `.wordmark { color }` is the case that named this — the dark
 * document simply has no `color` for that selector, so there is nothing to
 * scope and NO specificity beats it. CSS has no "un-declare" value either:
 * `revert`/`unset`/`initial` are themselves declarations and would flatten
 * rules that legitimately still apply.
 *
 * So the light-only declaration moves behind a light guard instead. Measured
 * effect: dark mismatches 13 -> 4 rows (vapor-ui 7 -> 0, krds 2 -> 0) with
 * light staying exact on all 17 slugs.
 *
 * Three properties of the transform matter, each learned the hard way:
 *
 *  - The unit that moves is the DECLARATION, not the rule. `.wordmark` keeps
 *    its font-size and text-fill-color, which both halves share; only `color`
 *    leaves.
 *  - The guard is `:where(...)`, or compounded onto `:root`/`html`, so
 *    specificity is unchanged. A bare prefix would raise it and reproduce the
 *    seed-design bug (a scope outranking the shared `tokens.css`) in light.
 *  - The guard must read `[data-theme="light"]`. `findPreviewDrift`
 *    (`src/lib/oklch-drift.ts`) treats any selector containing
 *    `[data-theme="dark"` as a dark block and skips it, so writing the guard as
 *    `:not([data-theme="dark"])` would delete the light token audit without
 *    failing anything: 11st 33 findings -> 0, vapor-ui 43 -> 0, still exit 0.
 *
 * The moved rule is emitted immediately after the rule it came from, never
 * appended at the end of the sheet. Same specificity plus a later position
 * would let it overtake a rule that used to win in light.
 * ------------------------------------------------------------------------ */

/** The light counterpart of `DARK`, at zero specificity. */
const LIGHT = ':where(html[data-theme="light"])'

/**
 * Blank comments — and, when `strings` is set, string literals too — IN PLACE, so
 * byte offsets survive.
 *
 * The light sheet is edited by offset rather than reserialised, which is what
 * keeps the merge a review-able diff (and the `audit:oklch` / `validate:previews`
 * output byte-identical). Deleting comments instead of blanking them would slide
 * every later offset; replacing them with spaces also keeps a comment from
 * splicing two halves of an identifier together, the way `--gray/**\/-06` would.
 *
 * Strings need blanking for the same reason comments do: every walk in this file
 * finds its boundaries with a bare `indexOf("{")`, a brace counter, or a split on
 * `,`, and a `content: "{"` moves those boundaries exactly as a `/* { *\/` does.
 * Comments were handled first and strings were left behind — the same asymmetry
 * that `src/lib/preview-halves.ts` carried, and it is fixed the same way there.
 * The two implementations are deliberate twins rather than one shared module:
 * this file is a plain `.mjs` migration script and that one is typed source the
 * gate imports; neither may take a build dependency on the other.
 *
 * Blanking strings is right for BOUNDARIES and wrong for TEXT that is read back
 * as CSS, which is why the flag exists. `[data-theme="dark"]` blanks to
 * `[data-theme=        ]`, and `ROOT_COMPOUND` stops recognising it — so the dark
 * half's token block no longer keys to `:root`, every light token reads as
 * light-only, and 11st moved its whole palette behind a light guard (0 -> 58
 * declarations, vapor-ui 3 -> 95). Selectors therefore come from the
 * comment-only view and boundaries from the full one; `eachRule` takes both.
 */
function blankInert(css, strings = true) {
  const out = css.split("")
  const blank = (from, to) => {
    for (let k = from; k < to; k++) if (out[k] !== "\n") out[k] = " "
  }
  let i = 0
  while (i < css.length) {
    const c = css[i]
    if (c === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2)
      const stop = end === -1 ? css.length : end + 2
      blank(i, stop)
      i = stop
      continue
    }
    if (strings && (c === '"' || c === "'")) {
      // An unterminated string ends at the newline, the way a CSS parser
      // recovers from one; that newline is not part of the string.
      let k = i + 1
      while (k < css.length) {
        if (css[k] === "\\") {
          k += 2
          continue
        }
        if (css[k] === c || css[k] === "\n") break
        k++
      }
      const stop = k < css.length && css[k] === c ? k + 1 : k
      blank(i, stop)
      i = stop
      continue
    }
    i++
  }
  return out.join("")
}

/**
 * Longhands a shorthand also sets, where the name alone does not say so.
 *
 * Presence is judged per FAMILY, not per property name. Light `border-top` whose
 * only dark counterpart is `border-top-color` is not absent — treating it as
 * absent moves the whole shorthand out and dark loses the width and style too.
 * Prefix containment covers most of it (`border-top` ⊃ `border-top-color`,
 * `background` ⊃ `background-color`); these are the pairs it cannot see.
 */
const SHORTHAND_LONGHANDS = {
  "border-color": [
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
  ],
  "border-width": [
    "border-top-width",
    "border-right-width",
    "border-bottom-width",
    "border-left-width",
  ],
  "border-style": [
    "border-top-style",
    "border-right-style",
    "border-bottom-style",
    "border-left-style",
  ],
  "border-radius": [
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-right-radius",
    "border-bottom-left-radius",
  ],
  font: [
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "font-variant",
    "font-stretch",
    "line-height",
  ],
  inset: ["top", "right", "bottom", "left"],
  gap: ["row-gap", "column-gap"],
  "grid-gap": ["row-gap", "column-gap", "gap"],
  "grid-area": ["grid-row", "grid-column"],
  "place-items": ["align-items", "justify-items"],
  "place-content": ["align-content", "justify-content"],
  "place-self": ["align-self", "justify-self"],
  columns: ["column-width", "column-count"],
  flex: ["flex-grow", "flex-shrink", "flex-basis"],
  "flex-flow": ["flex-direction", "flex-wrap"],
}

function expand(prop) {
  const extra = SHORTHAND_LONGHANDS[prop]
  return extra === undefined ? [prop] : [prop, ...extra]
}

/**
 * Whether two property names can set the same thing.
 *
 * Custom properties compare by exact name only: `--fg` and `--fg-muted` are
 * unrelated values that hyphen containment would happily fuse.
 */
function related(a, b) {
  if (a.startsWith("--") || b.startsWith("--")) return a === b
  for (const x of expand(a)) {
    for (const y of expand(b)) {
      if (x === y || x.startsWith(`${y}-`) || y.startsWith(`${x}-`)) return true
    }
  }
  return false
}

/** `.a>.b` and `.a > .b` name the same elements. */
function normaliseSelector(sel) {
  return sel
    .replace(/\s*([>+~])\s*/g, " $1 ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * A compound that can only ever match the root element of a single-theme
 * document: `:root`, `html`, `[data-theme="dark"]`, or any pile of those.
 */
const ROOT_COMPOUND =
  /^(?::root|html|\[data-theme=["']?(?:light|dark)["']?\])+(?=$|\s)/

/**
 * The key the two halves are matched on.
 *
 * Each half is a whole document with its theme fixed on `<html>`, so the halves
 * name the same element differently and nothing in the text says they agree:
 * light writes `:root { --brand-orange }` and dark writes
 * `[data-theme="dark"] { --brand-orange }`. Compared literally, every token in
 * every such sheet reads as light-only — 11st alone moved 58 declarations that
 * dark does restate (measured; parity held either way, since dark's own block
 * won anyway, but the churn is noise in a diff that has to be reviewable).
 *
 * The same reasoning strips a leading root compound in front of a descendant:
 * inside the dark document `[data-theme="dark"] .hero` matches exactly what
 * `.hero` matches.
 */
function presenceKey(sel) {
  const s = normaliseSelector(sel).replace(ROOT_COMPOUND, "").trim()
  return s === "" ? ":root" : s
}

/**
 * Split on the commas `scan` sees, keeping each piece's own text.
 *
 * Paren-aware via `splitTopLevel`: this list feeds `presenceKey` and
 * `lightScope`, so cutting `:is(.a, .b) .x` in two would both index a light-only
 * declaration under two selectors that do not exist and emit the guard with the
 * scope buried in the pseudo-class.
 */
function splitSelectors(prelude, scan) {
  const out = []
  for (const { piece } of splitTopLevel(prelude, scan)) {
    const trimmed = piece.trim()
    if (trimmed !== "") out.push(trimmed)
  }
  return out
}

/**
 * Visit every ordinary style rule, carrying byte offsets into the original text.
 *
 * Two views of the same sheet, equal in length so one set of offsets serves both.
 * `scan` has comments AND strings blanked and decides every boundary; `text` has
 * only comments blanked and is where selectors are read from. Selectors cannot
 * come from `scan` because a selector's strings are its data — `[data-theme=
 * "dark"]` blanked is a different selector — and they cannot come from the raw
 * sheet either, because a comment in front of one would be read as part of it.
 *
 * `@keyframes` and `@font-face` bodies are skipped rather than descended into:
 * a keyframe's `0%` is not a selector and a face's declarations belong to no
 * element, so neither can be theme-guarded — and both are already emitted
 * unscoped on the dark side for the same reason.
 */
function eachRule(scan, text, base, visit) {
  let i = 0
  while (i < scan.length) {
    const open = scan.indexOf("{", i)
    if (open === -1) break
    const prelude = scan.slice(i, open)
    let depth = 1
    let j = open + 1
    while (j < scan.length && depth > 0) {
      if (scan[j] === "{") depth++
      else if (scan[j] === "}") depth--
      j++
    }
    // Same cut as `scopeBlock`: without it a rule sitting behind an `@import`
    // reads as an unscopable at-rule and its declarations never reach the
    // light-only presence index, so light-only scoping misjudges every property
    // that rule sets.
    const cut = statementCut(prelude)
    const selFrom = cut === -1 ? i : i + cut + 1
    const trimmed = scan.slice(selFrom, open).trim()
    const body = scan.slice(open + 1, j - 1)
    if (UNSCOPABLE.test(trimmed)) {
      // skipped on purpose — see the note above
    } else if (NESTED.test(trimmed)) {
      eachRule(body, text.slice(open + 1, j - 1), base + open + 1, visit)
    } else if (trimmed !== "") {
      visit({
        selectors: splitSelectors(
          text.slice(selFrom, open),
          scan.slice(selFrom, open)
        ),
        body,
        bodyStart: base + open + 1,
        // Just past the closing brace: where a companion rule is inserted so it
        // sits in the same at-rule context and in the same cascade position.
        ruleEnd: base + j,
      })
    }
    i = j
  }
}

/**
 * Visit `prop: value` pairs in a rule body, with offsets into the original text.
 *
 * Each declaration's range starts right after the previous semicolon, so
 * deleting it takes the leading newline and indent with it and leaves no blank
 * line behind. Quotes and parentheses are tracked because a `;` inside
 * `url(data:…;base64,…)` or a quoted `content` is not a separator.
 */
function eachDeclaration(body, base, visit) {
  let start = 0
  let depth = 0
  let paren = 0
  let quote = null
  const emit = (from, to) => {
    const chunk = body.slice(from, to)
    if (chunk.includes("{")) return
    const colon = chunk.indexOf(":")
    if (colon === -1) return
    const prop = chunk.slice(0, colon).trim()
    if (!/^-{0,2}[a-zA-Z][\w-]*$/.test(prop)) return
    const valueFrom = from + colon + 1
    let valueTo = to
    while (valueTo > valueFrom && /[\s;]/.test(body[valueTo - 1])) valueTo--
    if (valueTo <= valueFrom) return
    visit({
      prop,
      from: base + from,
      to: base + to,
      valueFrom: base + valueFrom,
      valueTo: base + valueTo,
    })
  }
  for (let i = 0; i < body.length; i++) {
    const c = body[i]
    if (quote !== null) {
      if (c === "\\") i++
      else if (c === quote) quote = null
      continue
    }
    if (c === '"' || c === "'") quote = c
    else if (c === "(") paren++
    else if (c === ")" && paren > 0) paren--
    else if (paren > 0) continue
    else if (c === "{") depth++
    else if (c === "}") depth--
    else if (c === ";" && depth === 0) {
      emit(start, i + 1)
      start = i + 1
    }
  }
  // A last declaration may omit its semicolon.
  emit(start, body.length)
}

/** selector -> the property names the dark sheet declares for it. */
function darkPropertyIndex(cssBlocks) {
  const index = new Map()
  for (const css of cssBlocks) {
    eachRule(blankInert(css), blankInert(css, false), 0, (rule) => {
      for (const sel of rule.selectors) {
        const key = presenceKey(sel)
        let props = index.get(key)
        if (props === undefined) index.set(key, (props = new Set()))
        eachDeclaration(rule.body, 0, (d) => props.add(d.prop))
      }
    })
  }
  return index
}

/**
 * Deliberately blind to at-rule context: a property the dark sheet sets for this
 * selector anywhere counts as present. The conservative direction — a light
 * declaration that is only shadowed inside a `@media` stays shared, which is the
 * behaviour that already shipped, rather than being moved out and vanishing from
 * dark at every other width.
 */
function darkDeclares(index, selector, prop) {
  const props = index.get(presenceKey(selector))
  if (props === undefined) return false
  for (const p of props) if (related(p, prop)) return true
  return false
}

/** `:root` and `html` carry the attribute themselves, so they compound. */
function lightScope(sel) {
  if (/^:root\b/.test(sel))
    return sel.replace(/^:root/, ':root:where([data-theme="light"])')
  if (/^html\b/.test(sel))
    return sel.replace(/^html/, 'html:where([data-theme="light"])')
  return `${LIGHT} ${sel}`
}

/** Move declarations the dark sheet never restates behind a light guard. */
function scopeLightOnly(css, darkIndex, stats) {
  const scan = blankInert(css)
  const edits = []
  eachRule(scan, blankInert(css, false), 0, (rule) => {
    // A property written twice in one rule is left alone entirely. Moving only
    // the second copy would be correct, moving only the first silently flips
    // which one wins in light — and telling those apart is not worth it for a
    // shape no catalogue preview uses.
    const seen = new Map()
    eachDeclaration(rule.body, rule.bodyStart, (d) =>
      seen.set(d.prop, (seen.get(d.prop) ?? 0) + 1)
    )
    const moved = []
    eachDeclaration(rule.body, rule.bodyStart, (d) => {
      if (seen.get(d.prop) > 1) return
      // Absent means absent for EVERY selector in the list. If dark restates the
      // property for even one of them, splitting the list would be needed to say
      // anything sharper, and the unsplit rule stays shared instead.
      if (rule.selectors.some((s) => darkDeclares(darkIndex, s, d.prop))) return
      moved.push(d)
    })
    if (moved.length === 0) return
    for (const d of moved) edits.push({ at: d.from, end: d.to, text: "" })
    const decls = moved
      .map((d) => `${d.prop}: ${css.slice(d.valueFrom, d.valueTo)};`)
      .join(" ")
    edits.push({
      at: rule.ruleEnd,
      end: rule.ruleEnd,
      text: `\n${rule.selectors.map(lightScope).join(", ")} { ${decls} }`,
    })
    stats.lightScoped += moved.length
  })
  edits.sort((a, b) => b.at - a.at || b.end - a.end)
  let out = css
  for (const e of edits) out = out.slice(0, e.at) + e.text + out.slice(e.end)
  return out
}

/* ------------------------------------------------------------------------ *
 * Scoped rules that would overtake the shared tokens.css
 *
 * Prefixing the dark sheet adds (0,1,0) to every one of its selectors. Inside
 * the page that is harmless — the light twin of each rule sits at the same
 * weight and the dark copy only has to be later — but `tokens.css` is a THIRD
 * stylesheet that is not part of either half and gets no such boost. Where a
 * tokens.css rule legitimately outranked a page rule in the original dark
 * document, the prefix flips it.
 *
 * seed-design is the observed case: `<b class="sd-tag">` inside the catalog
 * disclosure strip. `.sd-tag { font-weight: 500 }` (0,1,0) loses to
 * `tokens.css`'s `.catalog-disclaimer b { font-weight: 600 }` (0,1,1), so the
 * original dark document renders 600. Scoped to `[data-theme="dark"] .sd-tag`
 * (0,2,0) it renders 500.
 *
 * The whole-sheet cures were measured and withdrawn (see `DARK` above): a global
 * `:where()` reverses ties elsewhere, repeating the attribute boosts unevenly,
 * and cascade layers demote the page beneath the unlayered tokens.css. So the
 * treatment is local — flatten the scope on exactly the selectors where the
 * boost would cross a tokens.css rule, and leave the rest at full weight.
 *
 * "Would cross" is decided against the real document rather than by pattern:
 * `.sd-tag` and `.catalog-disclaimer b` share no text, they merely match the
 * same <b>. jsdom already holds the dark half, so the elements each selector
 * matches are simply looked up and intersected.
 * ------------------------------------------------------------------------ */

/**
 * (id, class/attr/pseudo-class, type/pseudo-element), enough for the selectors
 * these previews and tokens.css use.
 *
 * `:where()` contributes 0 and is dropped whole; `:not()`/`:is()` would take
 * their argument's weight, but neither appears in a competing rule here, so they
 * count as a plain pseudo-class rather than carrying a parser for their
 * arguments.
 */
function specificity(sel) {
  const s = sel.replace(/:where\([^)]*\)/g, "")
  const ids = (s.match(/#[\w-]+/g) ?? []).length
  const classes =
    (s.match(/\.[\w-]+/g) ?? []).length +
    (s.match(/\[[^\]]*\]/g) ?? []).length +
    (s.match(/(?<!:):[\w-]+(?:\([^)]*\))?/g) ?? []).length
  const types =
    (s.match(/(^|[\s>+~])([a-zA-Z][\w-]*)/g) ?? []).length +
    (s.match(/::[\w-]+/g) ?? []).length
  return [ids, classes, types]
}

function higher(a, b) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i]
  return false
}

/** Rules of the shared runtime sheet, as {selector, props, spec}. */
function tokensSheetRules(css) {
  const rules = []
  eachRule(blankInert(css), blankInert(css, false), 0, (rule) => {
    const props = new Set()
    eachDeclaration(rule.body, 0, (d) => props.add(d.prop))
    if (props.size === 0) return
    for (const sel of rule.selectors) {
      rules.push({ sel, props, spec: specificity(sel) })
    }
  })
  return rules
}

/**
 * The dark selectors whose scope must add no weight.
 *
 * A selector qualifies when some tokens.css rule matches one of the same
 * elements, declares a property in the same family, and sits strictly between
 * the selector's own weight and the weight it would have once prefixed. Strictly
 * between is the whole condition: an equal-weight tokens.css rule already loses
 * on order (it is linked before the page's <style>) and stays losing, and a rule
 * heavier than the prefixed form wins either way.
 */
function selectorsOutrankedByTokens(darkDoc, darkCss, tokensRules) {
  const matches = (sel) => {
    try {
      // State pseudo-classes match nothing in a static document; the base
      // elements are what has to be compared.
      return [
        ...darkDoc.querySelectorAll(
          sel.replace(
            /:(hover|focus|focus-visible|active|checked|target)\b/g,
            ""
          )
        ),
      ]
    } catch {
      return null
    }
  }
  const tokenTargets = tokensRules.map((r) => ({ ...r, els: matches(r.sel) }))

  const flatten = new Set()
  for (const css of darkCss) {
    eachRule(blankInert(css), blankInert(css, false), 0, (rule) => {
      const props = new Set()
      eachDeclaration(rule.body, 0, (d) => props.add(d.prop))
      if (props.size === 0) return
      for (const sel of rule.selectors) {
        if (/^(?::root|html)\b/.test(sel) || sel.startsWith(DARK)) continue
        const own = specificity(sel)
        const scoped = [own[0], own[1] + 1, own[2]]
        const els = matches(sel)
        if (els === null || els.length === 0) continue
        for (const t of tokenTargets) {
          if (t.els === null || t.els.length === 0) continue
          if (!higher(t.spec, own) || !higher(scoped, t.spec)) continue
          let overlaps = false
          for (const a of props) {
            for (const b of t.props) if (related(a, b)) overlaps = true
          }
          if (!overlaps) continue
          if (!els.some((e) => t.els.includes(e))) continue
          flatten.add(normaliseSelector(sel))
        }
      }
    })
  }
  return flatten
}

/**
 * Pair up two node lists, emitting variants for the deepest differences.
 * Mutates `lightParent` in place.
 */
const XHTML = "http://www.w3.org/1999/xhtml"

function alignChildren(lightParent, darkParent, doc, stats) {
  // `<template>` only exists in the HTML namespace. Inserted inside `<svg>` it
  // parses back as a foreign element with no `.content`, so the runtime would
  // find nothing to swap. Refusing to descend makes the caller pair the whole
  // `<svg>` instead, which is small enough not to matter.
  if (lightParent.namespaceURI !== XHTML) return false

  // Align on significant nodes only. Whitespace-only text and comments differ
  // freely between the halves (they were formatted independently) and counting
  // them made whole documents look unalignable — krds has identical element
  // structure and still failed on node-list length.
  const l = [...lightParent.childNodes].filter(significant)
  const d = [...darkParent.childNodes].filter(significant)

  const ops = align(l, d)
  if (ops === null) return false

  for (const op of ops) {
    if (op.kind === "dark-only") {
      // A node the dark half has and the light half does not — baemin carries
      // a whole extra <section>. It cannot be a swap: there is nothing to
      // swap out. The runtime inserts it at this position in dark and takes
      // it away again in light.
      insertOnlyVariant(op.after, op.dark.cloneNode(true), doc, lightParent, stats)
      continue
    }
    if (op.kind === "light-only") {
      // The mirror case: swapping the light node for empty content removes it.
      insertVariant(op.light, null, doc, stats)
      continue
    }
    const ln = op.light
    const dn = op.dark
    if (ln.nodeType !== dn.nodeType) return false

    if (ln.nodeType === 3) {
      if (ln.textContent !== dn.textContent) {
        // A bare text difference has no element to pair. Wrap it so the
        // runtime has something to swap.
        const span = doc.createElement("span")
        span.setAttribute("data-theme-text", "")
        span.textContent = ln.textContent
        const darkSpan = span.cloneNode(false)
        darkSpan.textContent = dn.textContent
        ln.parentNode.replaceChild(span, ln)
        // The ops list was computed before any mutation, so a later
        // "dark-only" op may still point at this now-detached text node as its
        // anchor. Record where it went.
        replacedBy.set(ln, span)
        insertVariant(span, darkSpan, doc, stats)
      }
      continue
    }
    if (ln.nodeType !== 1) continue

    if (ln.outerHTML === dn.outerHTML) continue

    // Same tag and attributes? Then the difference is below; recurse.
    const sameShell =
      ln.tagName === dn.tagName &&
      ln.getAttributeNames().join(",") === dn.getAttributeNames().join(",") &&
      ln.getAttributeNames().every((a) => ln.getAttribute(a) === dn.getAttribute(a))

    // Only descend into nodes whose children are all elements. A paragraph of
    // mixed text and inline markup cannot be aligned piecewise: matching its
    // text nodes positionally spliced half of one theme's sentence onto half
    // of the other's ("…축이다.인데, gr…"). Such a node is paired whole, which
    // costs one duplicated paragraph and keeps both sentences intact.
    const mixed =
      [...ln.childNodes].filter(significant).some((c) => c.nodeType !== 1) &&
      ln.childElementCount > 0

    if (sameShell && !mixed && alignChildren(ln, dn, doc, stats)) continue

    insertVariant(ln, dn.cloneNode(true), doc, stats)
  }
  return true
}

/** Whitespace-only text and comments are formatting, not content. */
function significant(n) {
  if (n.nodeType === 8) return false
  if (n.nodeType === 3) return n.textContent.trim() !== ""
  return true
}

/**
 * The identity two nodes must share to be matchable at all.
 *
 * Kept coarse on purpose — the halves differ in exactly the places a merge has
 * to pair up, so anything that reads their prose or their inline styles refuses
 * the pairs that matter most.
 *
 * This docstring used to claim `childElementCount` was part of the key and that
 * it was what separated baemin's identically-classed sections. Neither was true:
 * the key was tag and class then as it is now, and baemin's two candidates both
 * have exactly one child, so adding the count changes nothing (measured — the
 * output is byte for byte the same). What actually separates them is `deepSig`
 * below, used as a tie-break rather than as part of this key.
 */
function sig(n) {
  if (n.nodeType !== 1) return "#text"
  return `${n.tagName}|${n.getAttribute("class") ?? ""}`
}

/**
 * A finer identity, consulted ONLY to choose between alignments of equal length.
 *
 * baemin is why it exists. Its dark half has one extra `<section class="section">`
 * — the "dark tokens are estimates" disclaimer — and the shared Components
 * section carries the same class, so `sig` matches both and LCS has two optimal
 * answers: pair the light Components section with the dark disclaimer (and treat
 * the real Components section as a dark-only insert), or skip the disclaimer and
 * pair Components with Components. Both keep 4 nodes. The first is what shipped
 * without a tie-break: one whole `<section>` duplicated into a swap template,
 * 3,472 lines against 3,036.
 *
 * The two are told apart by what is UNDER them — `DIV|container(DIV|gap-card)`
 * against `DIV|container(DIV|section-head,DIV|showcase)` — so the tie-break is
 * two levels of child tags and classes. Two levels and not more: it has to
 * survive prose being rewritten between the halves, which is the whole point of
 * the merge.
 *
 * Crucially this can only choose among alignments that already tie on `sig`
 * matches; it can never block a match. Tie-breaking on content SIMILARITY was
 * tried and withdrawn precisely because it did block matches — it fixed baemin
 * and broke kyobobook and line-design-system, whose true pairs are rewritten
 * prose sharing few words, at every threshold from 0.05 to 0.25.
 *
 * What this replaces is worse than a bad heuristic: `baemin/dark.html` was edited
 * by hand before the shipped file was generated, giving that one section a
 * `section-dark-gap` class that exists in no commit. The class is inert (no rule
 * anywhere matches it) so the rendering was right, but the converter in the tree
 * could not reproduce its own output — 16 of 17 slugs compared equal and baemin
 * did not — and the edit was written down only as a step for the measurement
 * harness, never as an input the generator needed.
 */
function deepSig(n) {
  if (n.nodeType !== 1) return "#text"
  const kids = [...n.children]
    .map((c) => `${sig(c)}(${[...c.children].map(sig).join(",")})`)
    .join(",")
  return `${sig(n)}(${kids})`
}

/**
 * Longest-common-subsequence alignment over `sig`, so a node present in only
 * one half shows up as an insertion rather than shifting everything after it
 * out of correspondence. Index-based pairing reported baemin — which has one
 * extra dark section — as completely unalignable.
 *
 * Returns null when the lists are too large to align cheaply; the caller then
 * pairs the parent whole.
 */
/**
 * Each `sig` match is worth this much, so no amount of `deepSig` agreement can
 * buy one. Both list lengths are bounded by the 250,000-cell cap above, so
 * whichever is shorter — and therefore the match count and the tie-break count —
 * is at most 500.
 */
const MATCH_WEIGHT = 4096

function align(l, d) {
  if (l.length * d.length > 250000) return null
  const n = l.length
  const m = d.length
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
  const M = Array.from({ length: n }, () => new Uint8Array(m))
  // The tie-break, scored separately so it can only order equal-length answers.
  const R = Array.from({ length: n }, () => new Uint8Array(m))
  const lSig = l.map(sig)
  const dSig = d.map(sig)
  const lDeep = l.map(deepSig)
  const dDeep = d.map(deepSig)
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++) {
      M[i][j] = lSig[i] === dSig[j] ? 1 : 0
      R[i][j] = M[i][j] && lDeep[i] === dDeep[j] ? 1 : 0
    }
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      const take = M[i][j] ? dp[i + 1][j + 1] + MATCH_WEIGHT + R[i][j] : 0
      const skip = Math.max(dp[i + 1][j], dp[i][j + 1])
      dp[i][j] = take > skip ? take : skip
    }
  }
  const ops = []
  let i = 0
  let j = 0
  let lastLight = null
  while (i < n && j < m) {
    // Taking the match when it ties keeps the old behaviour for every list where
    // the tie-break says nothing.
    if (M[i][j] && dp[i + 1][j + 1] + MATCH_WEIGHT + R[i][j] === dp[i][j]) {
      ops.push({ kind: "pair", light: l[i], dark: d[j] })
      lastLight = l[i]
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ kind: "light-only", light: l[i] })
      lastLight = l[i]
      i++
    } else {
      ops.push({ kind: "dark-only", dark: d[j], after: lastLight })
      j++
    }
  }
  while (i < n) {
    ops.push({ kind: "light-only", light: l[i] })
    lastLight = l[i]
    i++
  }
  while (j < m) ops.push({ kind: "dark-only", dark: d[j++], after: lastLight })
  return ops
}

/**
 * @param darkNode the dark replacement, or null to mean "remove in dark".
 */
function insertVariant(lightNode, darkNode, doc, stats) {
  const tpl = doc.createElement("template")
  tpl.setAttribute("data-theme-variant", "dark")
  tpl.setAttribute("data-theme-op", "swap")
  if (darkNode !== null) tpl.content.appendChild(darkNode)
  lightNode.parentNode.insertBefore(tpl, lightNode.nextSibling)
  stats.variants++
}

/** Where a node moved to when the walk replaced it. */
const replacedBy = new WeakMap()

/**
 * The first node at or after `node` that is not a variant template already
 * parked on the same anchor.
 *
 * Two ops can name the same anchor — `align()` emits `pair(l1,d1)` followed by
 * `dark-only(dX, after: l1)` whenever the dark half adds a node right behind a
 * node the halves both have. Inserting blindly at `l1.nextSibling` puts the
 * later template FIRST, which breaks the pair in two ways: the swap template no
 * longer sits behind its light node (the runtime and `preview-halves` both find
 * the insert anchor there instead, so the light prose is never taken away and
 * both themes' text renders at once), and two dark-only nodes on one anchor come
 * out in reverse order. Appending after the templates already there keeps
 * document order and keeps every swap adjacent to the node it swaps.
 *
 * The 17 shipped slugs only escape this because their three `insert` ops all sit
 * on anchors no `swap` claimed.
 */
function afterParkedVariants(node) {
  while (
    node !== null &&
    node.nodeType === 1 &&
    node.tagName === "TEMPLATE" &&
    node.hasAttribute("data-theme-variant")
  ) {
    node = node.nextSibling
  }
  return node
}

/** Content the dark half has and the light half does not. */
function insertOnlyVariant(after, darkNode, doc, parent, stats) {
  const tpl = doc.createElement("template")
  tpl.setAttribute("data-theme-variant", "dark")
  tpl.setAttribute("data-theme-op", "insert")
  tpl.content.appendChild(darkNode)
  let anchor = after
  while (anchor !== null && anchor.parentNode === null) {
    anchor = replacedBy.get(anchor) ?? null
  }
  if (anchor === null)
    parent.insertBefore(tpl, afterParkedVariants(parent.firstChild))
  else
    anchor.parentNode.insertBefore(tpl, afterParkedVariants(anchor.nextSibling))
  stats.variants++
}

function mergeSlug(slug) {
  const dir = path.join(PREVIEW, slug)
  const lightRaw = fs.readFileSync(path.join(dir, "light.html"), "utf8")
  const darkRaw = fs.readFileSync(path.join(dir, "dark.html"), "utf8")

  const lightCss = [...lightRaw.matchAll(STYLE_RE)].map((m) => m[1])
  const darkCss = [...darkRaw.matchAll(STYLE_RE)].map((m) => m[1])

  const lightDom = new JSDOM(lightRaw)
  const darkDom = new JSDOM(darkRaw)
  const doc = lightDom.window.document
  const darkDoc = darkDom.window.document

  const stats = { variants: 0, aligned: true, lightScoped: 0, flattened: 0 }
  stats.aligned = alignChildren(doc.body, darkDoc.body, doc, stats)
  // A slug that could not be aligned would be written as the light half plus
  // dark CSS — the dark half's prose silently gone. Writing that file is worse
  // than writing nothing, so refuse.
  if (!stats.aligned) {
    throw new Error(
      `${slug}: could not align the two halves at <body>. The merged file would ` +
        `drop the dark half's markup, so nothing was written. Align the halves ` +
        `by hand, or teach align() the shape it is missing.`
    )
  }

  // Title and root theme
  const title = doc.querySelector("title")
  if (title) title.textContent = title.textContent.replace(/\s*·\s*light\s*$/i, "")
  doc.documentElement.setAttribute("data-theme", "light")

  // Both sheets go in <head>: light first, dark appended after it. A <style> in
  // <body> would land in `body.textContent`, which the prose gates and every
  // text comparison read, so the CSS would register as page text.
  //
  // Cascade layers were tried here and withdrawn. Wrapping the page sheets in
  // `@layer` demotes them below `/preview/_runtime/tokens.css`, which is shared
  // and unlayered — and an unlayered declaration outranks every layered one.
  // Light rendering went from exact to 348 mismatches on toss alone. Scoping,
  // not layering, is what keeps the two sheets apart.
  //
  // The light sheet is edited only where the dark half is silent (see
  // `scopeLightOnly`); everywhere else it keeps its original bytes. The <style>
  // elements are taken from the DOM in document order, which is the order the
  // regex over the raw file produced `lightCss` in.
  const darkIndex = darkPropertyIndex(darkCss)
  const lightStyles = [...doc.querySelectorAll("style")]
  for (let i = 0; i < lightStyles.length; i++) {
    lightStyles[i].textContent = scopeLightOnly(lightCss[i], darkIndex, stats)
  }

  const flatten = selectorsOutrankedByTokens(darkDoc, darkCss, tokensRules())
  stats.flattened = flatten.size

  const darkStyle = doc.createElement("style")
  darkStyle.textContent = `\n${darkCss.map((css) => scopeDark(css, flatten)).join("\n")}\n`
  doc.head.appendChild(darkStyle)

  const html = "<!doctype html>\n" + doc.documentElement.outerHTML

  fs.writeFileSync(path.join(dir, "preview.html"), html + "\n")
  return { slug, ...stats, lightCssBlocks: lightCss.length, darkCssBlocks: darkCss.length }
}

const slugs =
  process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : fs
        .readdirSync(PREVIEW)
        .filter((d) => fs.existsSync(path.join(PREVIEW, d, "light.html")))
        .sort()

for (const slug of slugs) {
  const r = mergeSlug(slug)
  console.log(
    `${r.slug.padEnd(20)} variants=${String(r.variants).padStart(3)}  light-scoped=${String(r.lightScoped).padStart(3)}  flattened=${String(r.flattened).padStart(2)}  aligned=${r.aligned}  css ${r.lightCssBlocks}+${r.darkCssBlocks}`
  )
}
