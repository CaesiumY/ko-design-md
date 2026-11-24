// PROTOTYPE (ticket 731) — throwaway. Rewrites a common-base preview into the
// "custom-tags" structure: the frame's <main>/<header>/<section>/cell markup
// becomes <pv-page>/<pv-hero>/<pv-zone>/<pv-cell>/<pv-screen>, and the zone
// titles, cell labels, dark label templates and stage wrappers it drops are
// redrawn by public/preview/_runtime/iframe.js in the browser.
//
//   node prototypes/preview-structure/custom-tags/to-tags.mjs <in.html> <out.html>

import { readFileSync, writeFileSync } from "node:fs"

const [input, output] = process.argv.slice(2)
if (!input || !output) {
  console.error("usage: to-tags.mjs <in.html> <out.html>")
  process.exit(2)
}
let html = readFileSync(input, "utf8")

/** [start, end) of the close tag matching the open tag at `openStart`. */
function closeOf(src, openStart, tag) {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "g")
  re.lastIndex = openStart
  let depth = 0
  for (let m = re.exec(src); m !== null; m = re.exec(src)) {
    depth += m[1] === "/" ? -1 : 1
    if (depth === 0) return [m.index, m.index + m[0].length]
  }
  throw new Error(`unclosed <${tag}> at ${openStart}`)
}

/** [start, end) of the whole line holding `pos`, newline included. */
function lineOf(src, pos) {
  const start = src.lastIndexOf("\n", pos - 1) + 1
  const nl = src.indexOf("\n", pos)
  return [start, nl === -1 ? src.length : nl + 1]
}

/** Apply edits (non-overlapping [start, end, text]) back to front. */
function edit(src, edits) {
  for (const [s, e, t] of edits.sort((a, b) => b[0] - a[0]))
    src = src.slice(0, s) + t + src.slice(e)
  return src
}

function rewriteAll(re, fn) {
  for (;;) {
    re.lastIndex = 0
    const m = re.exec(html)
    if (m === null) return
    html = fn(m)
  }
}

// <div class="pv-screen"> → <pv-screen>
rewriteAll(/<div class="pv-screen">/g, (m) => {
  const [cs, ce] = closeOf(html, m.index, "div")
  return edit(html, [
    [m.index, m.index + m[0].length, "<pv-screen>"],
    [cs, ce, "</pv-screen>"],
  ])
})

// cells
rewriteAll(
  /<div class="pv-cell( pv-cell--wide)?" data-pv-cell="([^"]+)">/g,
  (m) => {
    const open = m.index
    const [cs, ce] = closeOf(html, open, "div")
    let pos = open + m[0].length
    const rest = html.slice(pos)
    const lab = /^\s*<p class="pv-label">([^<]*)<\/p>/.exec(rest)
    if (lab === null) throw new Error(`cell ${m[2]}: no label`)
    const labLine = lineOf(html, pos + lab[0].length - 1)
    pos += lab[0].length
    const dark =
      /^\s*<template data-theme-variant="dark"><p class="pv-label">([^<]*)<\/p><\/template>/.exec(
        html.slice(pos)
      )
    const edits = [[...labLine, ""]]
    if (dark !== null) {
      edits.push([...lineOf(html, pos + dark[0].length - 1), ""])
      pos += dark[0].length
    }
    const stageRe = /<div class="pv-stage( pv-stage--stack)?">/g
    stageRe.lastIndex = pos
    const st = stageRe.exec(html)
    if (st === null || st.index > cs) throw new Error(`cell ${m[2]}: no stage`)
    const [ss] = closeOf(html, st.index, "div")
    edits.push([...lineOf(html, st.index), ""])
    edits.push([...lineOf(html, ss), ""])
    let tag = `<pv-cell name="${m[2]}" label="${lab[1]}"`
    if (dark !== null) tag += ` label-dark="${dark[1]}"`
    if (m[1]) tag += " wide"
    if (st[1]) tag += " stack"
    tag += ">"
    edits.push([open, open + m[0].length, tag], [cs, ce, "</pv-cell>"])
    return edit(html, edits)
  }
)

// zones
rewriteAll(
  /<section class="pv-zone" data-pv-zone="([a-z]+)" aria-labelledby="pv-\1">/g,
  (m) => {
    const open = m.index
    const [cs, ce] = closeOf(html, open, "section")
    const h2 = html.indexOf('<h2 class="pv-zone-title"', open)
    const cells = html.indexOf('<div class="pv-cells">', open)
    const [cellsClose] = closeOf(html, cells, "div")
    return edit(html, [
      [open, open + m[0].length, `<pv-zone name="${m[1]}">`],
      [...lineOf(html, h2), ""],
      [...lineOf(html, cells), ""],
      [...lineOf(html, cellsClose), ""],
      [cs, ce, "</pv-zone>"],
    ])
  }
)

// hero and page
rewriteAll(/<header class="pv-hero" data-pv-zone="hero">/g, (m) => {
  const [cs, ce] = closeOf(html, m.index, "header")
  return edit(html, [
    [m.index, m.index + m[0].length, "<pv-hero>"],
    [cs, ce, "</pv-hero>"],
  ])
})
rewriteAll(/<main class="pv-page">/g, (m) => {
  const [cs, ce] = closeOf(html, m.index, "main")
  return edit(html, [
    [m.index, m.index + m[0].length, "<pv-page>"],
    [cs, ce, "</pv-page>"],
  ])
})

// Indentation: the dropped <div class="pv-cells"> and stage wrappers each
// took one level. Stage children (deeper than the cell's dummy note) lose
// one level, then everything inside a zone loses one more.
{
  let inZone = false
  let inCell = false
  html = html
    .split("\n")
    .map((line) => {
      if (/^\s*<\/pv-zone>/.test(line)) inZone = false
      if (/^\s*<\/pv-cell>/.test(line)) inCell = false
      let out = line
      if (inCell && /^ {10}/.test(out)) out = out.slice(2)
      if (inZone && /^ {2}/.test(out)) out = out.slice(2)
      if (/^\s*<pv-zone\b/.test(line)) inZone = true
      if (/^\s*<pv-cell\b/.test(line)) inCell = true
      return out
    })
    .join("\n")
}

writeFileSync(output, html)
