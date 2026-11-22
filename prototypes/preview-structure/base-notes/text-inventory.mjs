// PROTOTYPE — throwaway code. Compares the visible text of two preview files
// as multisets, so a re-zoning can show that no demo text was dropped or
// duplicated. dom-diff.ts cannot answer this: after cells move, every element
// path differs.
//
//   node text-inventory.mjs <before.html> <after.html>
//
// Text is taken per text node (trimmed, whitespace collapsed) from <body>,
// including the content of <template data-theme-variant> so the dark-only
// labels are counted too. <style> and <script> are skipped. Placeholder, alt,
// aria-label and title attributes are counted as their own entries.
//
// Exit code 0 always: the listing is the result. Lines starting with "-" exist
// only in <before>, lines starting with "+" only in <after>.

import { readFileSync } from "node:fs"
import { JSDOM } from "jsdom"

const ATTRS = ["placeholder", "alt", "aria-label", "title"]

function inventory(file) {
  const doc = new JSDOM(readFileSync(file, "utf8")).window.document
  const counts = new Map()
  const add = (text) => {
    const t = text.replace(/\s+/g, " ").trim()
    if (t !== "") counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  const walk = (node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) add(child.nodeValue)
      else if (child.nodeType === 1) {
        const tag = child.tagName.toLowerCase()
        if (tag === "style" || tag === "script") continue
        for (const a of ATTRS)
          if (child.hasAttribute(a)) add(`[${a}] ${child.getAttribute(a)}`)
        walk(tag === "template" ? child.content : child)
      }
    }
  }
  walk(doc.body)
  return counts
}

const [before, after] = process.argv.slice(2)
if (before === undefined || after === undefined) {
  console.error("usage: text-inventory.mjs <before.html> <after.html>")
  process.exit(2)
}
const a = inventory(before)
const b = inventory(after)
const total = (m) => [...m.values()].reduce((s, n) => s + n, 0)
let gone = 0
let come = 0
for (const key of [...new Set([...a.keys(), ...b.keys()])].sort()) {
  const d = (b.get(key) ?? 0) - (a.get(key) ?? 0)
  if (d < 0) {
    gone -= d
    console.log(`- x${-d}  ${key}`)
  } else if (d > 0) {
    come += d
    console.log(`+ x${d}  ${key}`)
  }
}
console.log(
  `\nbefore ${total(a)} entries, after ${total(b)} entries, only-before ${gone}, only-after ${come}`
)
