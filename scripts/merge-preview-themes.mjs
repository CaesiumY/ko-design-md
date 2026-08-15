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
 * 2. CSS: the light half's stylesheet is kept as-is; the dark half's is
 *    appended with its `:root` selectors rewritten to `[data-theme="dark"]`.
 *    That rewrite is not cosmetic — `audit:oklch` compares preview literals
 *    against the md's light definitions and skips anything scoped under
 *    `[data-theme="dark"]`. Leaving the dark tokens at `:root` reports 138
 *    false drift findings across the catalogue (measured).
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

/** Rewrite `:root` selectors to the dark scope. Comments are left alone. */
function scopeDark(css) {
  return css.replace(/:root\b/g, '[data-theme="dark"]')
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
 * Do these two nodes describe the same thing?
 *
 * Tag and class are necessary but not sufficient. baemin's dark half carries an
 * extra `section.section` — a disclaimer — ahead of the one both halves share,
 * and matching on class alone paired the shared "Components" section with that
 * disclaimer, swapping one for the other. Requiring some word overlap keeps
 * siblings that merely share a class from being treated as the same node.
 *
 * The threshold is deliberately low. Theme-specific prose is a rewrite, not an
 * edit, so a real pair can share few words; when overlap falls below it the two
 * nodes become a removal plus an insertion, which renders identically and only
 * costs a little duplication.
 */
function similar(a, b) {
  if (a.nodeType !== 1) return true
  const words = (n) =>
    new Set(
      (n.textContent ?? "")
        .toLowerCase()
        .split(/[^0-9a-z가-힣]+/)
        .filter((w) => w.length > 1)
    )
  const wa = words(a)
  const wb = words(b)
  if (wa.size === 0 || wb.size === 0) return true
  let shared = 0
  for (const w of wa) if (wb.has(w)) shared++
  return shared / Math.min(wa.size, wb.size) >= 0.15
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
  // Content similarity only breaks ties. When a sig appears once on each side
  // there is nothing to disambiguate, and demanding word overlap there would
  // unpair legitimately rewritten prose — theme-specific text is a rewrite, so
  // a true pair can share almost no words.
  const tally = (list) => {
    const t = new Map()
    for (const x of list) t.set(sig(x), (t.get(sig(x)) ?? 0) + 1)
    return t
  }
  const tl = tally(l)
  const td = tally(d)
  const ambiguous = (s) => (tl.get(s) ?? 0) > 1 || (td.get(s) ?? 0) > 1

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
      void ambiguous
      void similar
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

  const stats = { variants: 0, aligned: true }
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

  // The dark stylesheet goes in <head>, after the light one — last wins on
  // equal specificity, the way the split file's own `:root` did. It must NOT
  // go in <body>: a <style> there lands in `body.textContent`, which is what
  // the prose gates and any text comparison read, so the CSS would register as
  // page text.
  const darkScoped = darkCss.map(scopeDark).join("\n")
  const darkStyle = doc.createElement("style")
  darkStyle.textContent = `\n${darkScoped}\n`
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
    `${r.slug.padEnd(20)} variants=${String(r.variants).padStart(3)}  aligned=${r.aligned}  css ${r.lightCssBlocks}+${r.darkCssBlocks}`
  )
}
