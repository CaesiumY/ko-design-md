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
  return scopeBlock(stripComments(css), flatten)
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

/** Comments can hide braces and selectors, so they go before anything is split. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "")
}

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
 */
function scopeBlock(css, flatten) {
  const out = []
  let i = 0
  while (i < css.length) {
    const open = css.indexOf("{", i)
    if (open === -1) {
      out.push(css.slice(i))
      break
    }
    const prelude = css.slice(i, open).trim()
    let depth = 1
    let j = open + 1
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth++
      else if (css[j] === "}") depth--
      j++
    }
    const body = css.slice(open + 1, j - 1)

    if (UNSCOPABLE.test(prelude)) {
      out.push(`${prelude} {${body}}`)
    } else if (NESTED.test(prelude)) {
      out.push(`${prelude} {${scopeBlock(body, flatten)}}`)
    } else if (prelude !== "") {
      out.push(`${scopeSelectorList(prelude, flatten)} {${body}}`)
    }
    i = j
  }
  return out.join("\n")
}

function scopeSelectorList(list, flatten) {
  return list
    .split(",")
    .map((s) => scopeSelector(s.trim(), flatten))
    .filter((s) => s !== "")
    .join(", ")
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
 * Blank comments out IN PLACE so byte offsets survive.
 *
 * The light sheet is edited by offset rather than reserialised, which is what
 * keeps the merge a review-able diff (and the `audit:oklch` / `validate:previews`
 * output byte-identical). Deleting comments instead of blanking them would slide
 * every later offset; replacing them with spaces also keeps a comment from
 * splicing two halves of an identifier together, the way `--gray/**\/-06` would.
 */
function blankComments(css) {
  return css.replace(/\/\*[\s\S]*?(?:\*\/|$)/g, (m) => m.replace(/[^\n]/g, " "))
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

function splitSelectors(prelude) {
  return prelude
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")
}

/**
 * Visit every ordinary style rule, carrying byte offsets into the original text.
 *
 * `@keyframes` and `@font-face` bodies are skipped rather than descended into:
 * a keyframe's `0%` is not a selector and a face's declarations belong to no
 * element, so neither can be theme-guarded — and both are already emitted
 * unscoped on the dark side for the same reason.
 */
function eachRule(css, base, visit) {
  let i = 0
  while (i < css.length) {
    const open = css.indexOf("{", i)
    if (open === -1) break
    const prelude = css.slice(i, open)
    let depth = 1
    let j = open + 1
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth++
      else if (css[j] === "}") depth--
      j++
    }
    const trimmed = prelude.trim()
    const body = css.slice(open + 1, j - 1)
    if (UNSCOPABLE.test(trimmed)) {
      // skipped on purpose — see the note above
    } else if (NESTED.test(trimmed)) {
      eachRule(body, base + open + 1, visit)
    } else if (trimmed !== "") {
      visit({
        selectors: splitSelectors(trimmed),
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
    eachRule(blankComments(css), 0, (rule) => {
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
  const scan = blankComments(css)
  const edits = []
  eachRule(scan, 0, (rule) => {
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
  eachRule(blankComments(css), 0, (rule) => {
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
    eachRule(blankComments(css), 0, (rule) => {
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
 * A coarse identity used to match nodes across the two halves.
 *
 * Tag and class alone are not enough: baemin's sections all carry the same
 * class, so the extra dark-only section matched the LAST light section and its
 * disclaimer landed at the end of the document instead of after the hero.
 * Child-element count separates siblings that merely look alike without
 * depending on their prose, which differs by theme on purpose.
 */
function sig(n) {
  if (n.nodeType !== 1) return "#text"
  return `${n.tagName}|${n.getAttribute("class") ?? ""}`
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
function align(l, d) {
  if (l.length * d.length > 250000) return null
  const n = l.length
  const m = d.length
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
  const M = Array.from({ length: n }, () => new Uint8Array(m))
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++) {
      const s = sig(l[i])
      // Tie-breaking on content similarity was tried and withdrawn. It fixes
      // baemin's duplicated section class and breaks kyobobook and
      // line-design-system, whose true pairs are rewritten prose sharing few
      // words; every threshold from 0.05 to 0.25 traded one set of slugs for
      // another. `ambiguous`/`similar` are kept because the verifier proves
      // exactly which slugs need them — see the note in mergeSlug.
      M[i][j] = s === sig(d[j]) ? 1 : 0
    }
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = M[i][j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const ops = []
  let i = 0
  let j = 0
  let lastLight = null
  while (i < n && j < m) {
    if (M[i][j]) {
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
  if (anchor === null) parent.insertBefore(tpl, parent.firstChild)
  else anchor.parentNode.insertBefore(tpl, anchor.nextSibling)
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
