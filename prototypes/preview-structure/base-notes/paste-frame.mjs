// PROTOTYPE — throwaway code. Keeps the frame block inside a preview file
// letter-for-letter equal to prototypes/preview-structure/frame.css.
//
//   node paste-frame.mjs <preview.html> [more.html …]          rewrite the block
//   node paste-frame.mjs --check <preview.html> [more.html …]  only compare
//
// The block is everything from "/* pv-frame:start" to "/* pv-frame:end */".
// --check also fails when the page's own styles name a .pv-* selector outside
// the block, which is the other half of the promise (STANDARD §3).
//
// Exit code: 0 same (or rewritten), 1 a file differs or redefines the frame.

import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const START = "/* pv-frame:start"
const END = "/* pv-frame:end */"

function block(text, where) {
  const from = text.indexOf(START)
  const to = text.indexOf(END)
  if (from === -1 || to === -1 || text.indexOf(START, from + 1) !== -1) {
    throw new Error(`${where}: expected exactly one pv-frame block`)
  }
  return { from, to: to + END.length }
}

const args = process.argv.slice(2)
const check = args[0] === "--check"
const files = check ? args.slice(1) : args
if (files.length === 0) {
  console.error("usage: paste-frame.mjs [--check] <preview.html> [more.html …]")
  process.exit(2)
}

const frameFile = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "frame.css"),
  "utf8"
)
const f = block(frameFile, "frame.css")
const frame = frameFile.slice(f.from, f.to)

let failed = false
for (const file of files) {
  const text = readFileSync(file, "utf8")
  const b = block(text, file)
  const same = text.slice(b.from, b.to) === frame
  // Selectors only: a rule's prelude is what precedes "{". var(--pv-…) inside
  // a declaration is the page reading the frame's variables, which is allowed.
  const outside = text.slice(0, b.from) + text.slice(b.to)
  const styles = [...outside.matchAll(/<style>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1])
    .join("\n")
  const redefined = [
    ...styles.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]*)\{/g),
  ]
    .map((m) => m[1].trim())
    .filter((prelude) => /\.pv-/.test(prelude))
  if (check) {
    console.log(
      `${same && redefined.length === 0 ? "ok  " : "FAIL"} ${file}${same ? "" : " — frame block differs from frame.css"}`
    )
    for (const prelude of redefined)
      console.log(`       page style names a frame selector: ${prelude}`)
    if (!same || redefined.length !== 0) failed = true
  } else if (same) {
    console.log(`same      ${file}`)
  } else {
    writeFileSync(file, text.slice(0, b.from) + frame + text.slice(b.to))
    console.log(`rewritten ${file}`)
  }
}
process.exit(failed ? 1 : 0)
