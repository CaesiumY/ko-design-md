// PROTOTYPE — throwaway code. Moves one preview from the common base (the frame
// block pasted at the top of its first <style>) to the html-frame structure (the
// frame comes from one shared file, public/preview/_runtime/frame.css, through a
// <link> placed right after the tokens.css <link>).
//
//   node prototypes/preview-structure/html-frame/to-html-frame.mjs <preview.html> [more.html …]
//
// Plain string surgery, no HTML parse and re-serialise: every byte outside the
// cut block and the inserted line stays as it was, so line endings, attribute
// quoting and whitespace in the rest of the file do not move.
//
// It stops (exit 1, file untouched) when:
//   - the pasted block is not letter-for-letter the block in the shared frame.css
//     (then the page carries a frame that differs from what the link would load);
//   - the block does not open the first <style>;
//   - the tokens.css <link> is missing, so the new link has no fixed place.
// Running it on a file that already has the frame link and no block is a no-op.

import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const START = "/* pv-frame:start"
const END = "/* pv-frame:end */"
const TOKENS_LINK =
  '<link rel="stylesheet" href="/preview/_runtime/tokens.css">'
const FRAME_LINK = '<link rel="stylesheet" href="/preview/_runtime/frame.css">'

const files = process.argv.slice(2)
if (files.length === 0) {
  console.error("usage: to-html-frame.mjs <preview.html> [more.html …]")
  process.exit(2)
}

const frameFile = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../../../public/preview/_runtime/frame.css"
  ),
  "utf8"
)
const frame = frameFile.slice(
  frameFile.indexOf(START),
  frameFile.indexOf(END) + END.length
)

let failed = false
for (const file of files) {
  const text = readFileSync(file, "utf8")
  const from = text.indexOf(START)
  if (from === -1) {
    if (text.includes(FRAME_LINK)) {
      console.log(`same      ${file}`)
      continue
    }
    console.log(`FAIL      ${file}: no pv-frame block and no frame link`)
    failed = true
    continue
  }
  const to = text.indexOf(END, from) + END.length
  if (text.slice(from, to) !== frame) {
    console.log(
      `FAIL      ${file}: the pasted block differs from public/preview/_runtime/frame.css — fold the difference into one side by hand first`
    )
    failed = true
    continue
  }
  const style = /<style\b[^>]*>/.exec(text)
  if (
    style === null ||
    text.slice(style.index + style[0].length, from).trim() !== ""
  ) {
    console.log(`FAIL      ${file}: the block does not open the first <style>`)
    failed = true
    continue
  }
  const tokens = text.indexOf(TOKENS_LINK)
  if (tokens === -1 || tokens > style.index) {
    console.log(
      `FAIL      ${file}: no ${TOKENS_LINK} before the first <style> to put the frame link after`
    )
    failed = true
    continue
  }
  // The block's own line goes with it: "<style>\n/* … */\n.rule" -> "<style>\n.rule".
  const eol = text.startsWith("\r\n", to)
    ? 2
    : text.startsWith("\n", to)
      ? 1
      : 0
  const cut = text.slice(0, from) + text.slice(to + eol)
  const at = tokens + TOKENS_LINK.length
  const nl = text.includes("\r\n") ? "\r\n" : "\n"
  writeFileSync(file, cut.slice(0, at) + nl + FRAME_LINK + cut.slice(at))
  console.log(`rewritten ${file}`)
}
process.exit(failed ? 1 : 0)
