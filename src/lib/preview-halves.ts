import { existsSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { JSDOM } from "jsdom"
import {
  DARK_PREVIEW_FILE,
  LIGHT_PREVIEW_FILE,
  MERGED_PREVIEW_FILE,
  resolvePreviewLayout,
} from "./preview-layout"
import type { ServedDocument } from "./preview-validator"

// Give a caller two theme documents whichever layout is on disk.
//
// The split layout hands over its two files. The merged one (issue #235) is
// rendered twice — once with the dark variants left inert in their templates,
// once with them applied — and its two stylesheets are dealt out, the `:root`
// one to light and the `[data-theme="dark"]` one to dark.
//
// Reconstructing here rather than teaching each rule about templates keeps
// every existing pair rule meaningful. `identical-style-blocks` above all: it
// asks whether dark is a considered adaptation or a copy of light, and that
// question is about the two scopes, which is what the deal-out compares. A
// rule fed the same merged document twice would answer "copy" for every slug.
//
// Dealing the sheets out is not enough on its own, though: the merge prefixes
// every dark selector, so the two texts differ no matter what the author wrote
// and the copy question flips from "always yes" to "always no" — equally
// useless. `unscopeDarkSheet` takes the prefix back off before handing over.
//
// That alone still does not answer the question: the merge does not only insert
// a prefix, it RESERIALISES the dark sheet, so the author's own spacing is gone
// before this module ever sees the file. The other half of the fix therefore
// lives in `preview-validator.ts`, whose `normalizeStyle` compares on a
// canonical form. See the comment there; the two are a pair.
//
// This module is for build-time callers — the validator script and its tests.
// It uses jsdom, which `preview-validator.ts` deliberately does not; that file
// stays dependency-free so the gate cannot fail on a devDependency.

export interface PreviewHalves {
  light: string
  dark: string
  /**
   * On-disk size of the file each half came out of — under the merged layout
   * the same number twice, because there is one file.
   *
   * NOT the size gate's input any more; `served` below is. These stay because
   * `PreviewValidationInput` still takes them, and they still say something
   * true and per-half under the split layout.
   */
  lightBytes: number
  darkBytes: number
  /**
   * The download units, which under the merged layout are NOT the halves.
   *
   * `light`/`dark` above are reconstructions — one is the document minus the
   * dark sheet, the other minus the light sheets — and nobody ever receives
   * either. Under the merged layout a viewer of EITHER theme downloads the one
   * `preview.html` carrying both sheets, so that is the single entry here.
   * Under the split layout each half really is a file and there are two.
   *
   * Every size check reads this and only this. Measuring a reconstruction was
   * the defect: `lightBytes`/`darkBytes` were already the merged file's size,
   * so the raw cap was honest while the brotli caps — which recompress the
   * text they are handed — silently fell to whichever half was larger,
   * 9–26% under the served figure on today's 17 slugs, and let a fixture with
   * 38 KiB of incompressible filler per sheet (78 KiB served, 1.9x the 40 KiB
   * hard cap) through as two warns.
   */
  served: Array<ServedDocument>
}

export function readPreviewHalves(dir: string): PreviewHalves | null {
  const layout = resolvePreviewLayout((file) => existsSync(join(dir, file)))
  if (layout === null) return null

  if (layout === "split") {
    const lightPath = join(dir, LIGHT_PREVIEW_FILE)
    const darkPath = join(dir, DARK_PREVIEW_FILE)
    return splitLayoutHalves(
      readFileSync(lightPath, "utf8"),
      readFileSync(darkPath, "utf8"),
      statSync(lightPath).size,
      statSync(darkPath).size
    )
  }

  // The deal-out below assumes the converter's shape: exactly two <style>
  // elements, the first carrying the page's structural CSS and the light
  // tokens, the second carrying only `[data-theme="dark"]` overrides. A third
  // block, or structural rules mixed into the dark one, would quietly split
  // the wrong way — the counts still line up, so nothing would fail loudly.
  const mergedPath = join(dir, MERGED_PREVIEW_FILE)
  return splitMergedPreview(
    readFileSync(mergedPath, "utf8"),
    statSync(mergedPath).size
  )
}

/**
 * The split layout's two files, which are also its two download units.
 *
 * Exported for the staging path's `--light`/`--dark` arm, which reads a pair
 * the pipeline has not yet placed in a slug directory. It built this object
 * inline before `served` existed; assembling it here is what keeps the two
 * arms of that CLI from disagreeing about what a download unit is.
 */
export function splitLayoutHalves(
  light: string,
  dark: string,
  lightBytes: number,
  darkBytes: number
): PreviewHalves {
  return {
    light,
    dark,
    lightBytes,
    darkBytes,
    served: [
      { name: LIGHT_PREVIEW_FILE, html: light, bytes: lightBytes },
      { name: DARK_PREVIEW_FILE, html: dark, bytes: darkBytes },
    ],
  }
}

/**
 * The merged-file half of `readPreviewHalves`, exposed for the staging path:
 * the skill pipeline validates a file the author just wrote, before it has a
 * slug directory to live in.
 */
export function splitMergedPreview(raw: string, bytes: number): PreviewHalves {
  const lightDom = new JSDOM(raw)
  const lightDoc = lightDom.window.document
  const lightStyles = [...lightDoc.querySelectorAll("style")]
  // The converter appends exactly one dark sheet, so the invariant is "the last
  // block is dark, everything before it is light" — not "there are two".
  // baemin's light half ships two blocks of its own, which a stricter count
  // would reject. Fewer than two means no dark sheet at all, and dealing the
  // blocks out from that would silently hand back two light documents.
  if (lightStyles.length < 2) {
    throw new Error(
      `${MERGED_PREVIEW_FILE} carries ${lightStyles.length} <style> block(s); ` +
        `the merged layout needs the page's own CSS plus a trailing ` +
        `[data-theme="dark"] sheet.`
    )
  }
  assertReadableVariants(lightDoc)
  lightStyles[lightStyles.length - 1].remove()
  removeDarkVariants(lightDoc)

  // The dark sheet is unscoped in the source text rather than by assigning to
  // the parsed element's textContent: that assignment re-parses the sheet, and
  // seed-design carries a rule jsdom cannot parse, so it would add a second
  // "Could not parse CSS stylesheet" line to the gate's output for no change in
  // what the gate decides.
  const darkDom = new JSDOM(unscopeLastStyleBlock(raw))
  const darkDoc = darkDom.window.document
  applyDarkVariants(darkDoc)
  const darkStyles = [...darkDoc.querySelectorAll("style")]
  for (const el of darkStyles.slice(0, -1)) el.remove()
  // Setting this makes the validator's `data-theme-mismatch` check vacuous for
  // the dark half of a merged file — it asserts what this line just wrote. That
  // is not a check going quietly dead the way `identical-style-blocks` did:
  // there is exactly one `<html>` here and the thing worth asserting about it,
  // that the file's own resting state is light, is what the LIGHT half checks.
  // The dark half has no element of its own to be wrong about.
  darkDoc.documentElement.setAttribute("data-theme", "dark")

  return {
    light: lightDom.serialize(),
    dark: darkDom.serialize(),
    lightBytes: bytes,
    darkBytes: bytes,
    // `raw`, not a serialized half: this is the one document both themes
    // download, and it is the only string here that anybody receives.
    served: [{ name: MERGED_PREVIEW_FILE, html: raw, bytes }],
  }
}

/* ------------------------------------------------------------------------ *
 * Undoing the dark scope
 *
 * The merge puts `[data-theme="dark"]` in front of every dark selector so the
 * two sheets can share one document. Handing that text over as "the dark half"
 * makes one pair rule unanswerable: `identical-style-blocks` asks whether dark
 * is a considered adaptation of light or a copy of it, and it asks by comparing
 * the two style texts. Every prefixed selector differs from its light twin by
 * construction, so on the merged layout the rule could never fire again — not
 * for a slug that had drifted into a copy, not for any slug. Measured on a
 * fixture whose halves carry byte-identical CSS: split fires, merged does not.
 *
 * Stripping the prefix back off restores the original question. It also hands
 * the other selector-reading rules the selectors their authors wrote.
 *
 * It restores the SELECTORS, not the bytes — see `unscopeDarkSheet`. The bytes
 * are the validator's problem and it solves them by normalising both sides.
 * ------------------------------------------------------------------------ */

const DARK_SCOPE = '[data-theme="dark"]'
const NESTED_AT_RULE = /^@(media|supports|container|layer|scope)\b/i

/**
 * Blank comments AND string literals out IN PLACE, so every byte offset in the
 * copy still names the same byte in the original.
 *
 * The walk below finds rule boundaries with `indexOf("{")` and a brace counter,
 * `statementCut` looks for `;`, and `splitTopLevel` looks for `,`. Every one of
 * them will happily read such a character out of a comment or out of a quoted
 * value, and ONE stray character desynchronises the walk for the whole rest of
 * the sheet: each following rule silently keeps its `[data-theme="dark"]`
 * prefix, which is exactly the state that makes `identical-style-blocks` — and
 * every other selector-reading rule — unanswerable on the merged layout again.
 *
 * Comments and strings are blanked together because they are one failure, not
 * two. The comment half was fixed first and the string half left behind, even
 * though `statementCut` directly below already tracked quotes; the asymmetry sat
 * in this file in plain sight. Measured before this fix, on a sheet whose first
 * rule was `.x::after { content: "{" }`: the two rules after it came back still
 * scoped. `content: "}"` desynchronises one rule later, `content: "x"` is clean.
 *
 * Neither shape occurs in the catalogue's 17 previews today — and neither did the
 * comment shape, which was fixed anyway for the reason that applies here too:
 * preview.html is a hand-authoring convention
 * (`.claude/agents/preview-html-author.md`), and `content: "{"` is ordinary in a
 * preview that puts code or CSS syntax on screen.
 *
 * Blanking rather than deleting is what lets the emitted text keep the author's
 * bytes: the scan and the original stay index-for-index aligned, so every slice
 * can be taken from the original. Newlines are left alone so line offsets hold
 * too.
 *
 * `merge-preview-themes.mjs` blanks for the same reason and carries its own
 * copy of this — a second implementation, not a shared one. It is a plain Node
 * script with no build step, so it cannot import a TypeScript module, and the
 * two signatures have already drifted apart (it takes a flag for whether to
 * blank strings). The consequence is the part worth knowing: every scanner
 * defect found so far had to be fixed TWICE, once on each side, and a fix
 * applied here alone leaves the converter reading the same bytes wrongly.
 */
function blankInert(css: string): string {
  const out = css.split("")
  const blank = (from: number, to: number) => {
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
    if (c === '"' || c === "'") {
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
      blank(i, k < css.length && css[k] === c ? k + 1 : k)
      i = k < css.length && css[k] === c ? k + 1 : k
      continue
    }
    i++
  }
  return out.join("")
}

/**
 * The last `;` outside parens — where a prelude's at-rules end.
 *
 * Always handed a slice of the blanked scan, so a `;` inside a quoted value has
 * already been erased. Parens are still tracked here for the unquoted `url(…)`
 * form, which `blankInert` leaves alone.
 */
function statementCut(prelude: string): number {
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
 * The inverse of the merge script's `scopeSelector`.
 *
 * A bare `[data-theme="dark"]` maps back to `:root` because that is what the
 * merge rewrote — and where the dark half wrote it itself, mapping it to the
 * light half's spelling of the same element is exactly what the copy question
 * wants.
 *
 * A compound (`[data-theme="dark"].panel`) is inverted the same way, to
 * `:root.panel`, because the merge produces exactly that from `:root.panel`
 * (`scopeSelector` REPLACES a leading `:root` with the attribute rather than
 * descending from it). Reading the two apart is impossible after the fact: the
 * merge collapses `:root.panel` and an author's own `[data-theme="dark"].panel`
 * onto the same text. Inverting is the same bet the bare form already makes, and
 * it loses nothing measurable — no `:root` compound exists anywhere in the
 * catalogue's halves, so this arm is unreachable today and only stops a future
 * one from arriving unnoticed.
 *
 * The `html` arm is NOT that bet, and the difference matters because this one is
 * reachable: seed-design writes `html[data-theme="dark"] .snackbar` by hand.
 * That arm is exact only because `scopeSelector` refuses to treat such a
 * selector as already-scoped and lets it come out with the attribute twice —
 * stripping one prefix lands on the author's own text. Take the doubling away
 * (it reads like a defect; it has been "fixed" once) and this arm starts
 * inventing `html .snackbar`, a selector neither half ever held. If you change
 * either side, change both: they are one function and its inverse.
 */
function unscopeSelector(sel: string): string {
  const s = sel.trim()
  if (s.startsWith(`html${DARK_SCOPE}`))
    return `html${s.slice(`html${DARK_SCOPE}`.length)}`
  if (s.startsWith(`:where(${DARK_SCOPE})`))
    return s.slice(`:where(${DARK_SCOPE})`.length).trim()
  if (s === DARK_SCOPE) return ":root"
  if (s.startsWith(DARK_SCOPE)) {
    const rest = s.slice(DARK_SCOPE.length)
    if (/^\s/.test(rest)) return rest.trim()
    return `:root${rest}`
  }
  return s
}

const STYLE_BLOCK = /<style[^>]*>([\s\S]*?)<\/style>/gi

/** Rewrite the trailing (dark) `<style>` block of a merged file, in the text. */
function unscopeLastStyleBlock(raw: string): string {
  const blocks = [...raw.matchAll(STYLE_BLOCK)]
  const last = blocks.at(-1)
  if (last === undefined) return raw
  // A function replacement, so `$&`-style sequences in the CSS stay literal.
  const rewritten = last[0].replace(last[1], () => unscopeDarkSheet(last[1]))
  return (
    raw.slice(0, last.index) +
    rewritten +
    raw.slice(last.index + last[0].length)
  )
}

/**
 * Rewrite only the scope prefixes, leaving every other byte where it was.
 *
 * Keeping the bytes is deliberate but it is NOT what makes the copy question
 * answerable, and believing otherwise was the earlier bug here. The premise used
 * to be "the merge only ever inserted the prefix, so removing exactly the prefix
 * restores exactly the author's text". It does not: `scopeBlock` in
 * `scripts/merge-preview-themes.mjs` reserialises the whole dark sheet — always
 * `prelude + " {"`, selector lists rejoined with `", "`, rules rejoined with a
 * newline. Measured on a slug whose dark half was copied byte for byte from its
 * light half, the unscoped dark sheet still came out 329 normalised chars longer
 * than light, diverging first at `.ic{` against `.ic {`. 100% of the residue was
 * that spacing, and `identical-style-blocks` stayed silent on the one input it
 * exists to catch.
 *
 * Those bytes are unrecoverable here — they were gone before this module was
 * handed the file — so the equality test meets the converter halfway instead,
 * in `preview-validator.ts`'s `normalizeStyle`. What is kept here is kept for
 * the OTHER readers: the selectors and declarations the dark half's author
 * actually wrote, with no reformatting noise laid over them.
 */
export function unscopeDarkSheet(css: string): string {
  return unscopeScan(css, blankInert(css))
}

/**
 * `scan` is `css` with comments blanked; it decides where things start and end,
 * `css` supplies the bytes that get emitted. The two are the same length.
 */
function unscopeScan(css: string, scan: string): string {
  const out: Array<string> = []
  let i = 0
  while (i < css.length) {
    const open = scan.indexOf("{", i)
    if (open === -1) {
      out.push(css.slice(i))
      break
    }
    let depth = 1
    let j = open + 1
    while (j < css.length && depth > 0) {
      if (scan[j] === "{") depth++
      else if (scan[j] === "}") depth--
      j++
    }
    const prelude = css.slice(i, open)
    const body = css.slice(open + 1, j - 1)
    // Statement at-rules can precede the selector in one prelude
    // (`@import url(x); .hero {`); only the part after the last `;` is one.
    const cut = statementCut(scan.slice(i, open))
    const head = cut === -1 ? "" : prelude.slice(0, cut + 1)
    const selector = cut === -1 ? prelude : prelude.slice(cut + 1)
    const selectorScan =
      cut === -1 ? scan.slice(i, open) : scan.slice(i + cut + 1, open)
    const trimmed = selectorScan.trim()

    if (trimmed.startsWith("@")) {
      const inner = NESTED_AT_RULE.test(trimmed)
        ? unscopeScan(body, scan.slice(open + 1, j - 1))
        : body
      out.push(`${head}${selector}{${inner}}`)
    } else {
      const rewritten = splitTopLevel(selector, selectorScan)
        .map(({ piece, scan: pieceScan }) => {
          // Measured on the blanked copy, so a comment ahead of the selector
          // counts as leading padding and is handed back untouched instead of
          // being fed to `unscopeSelector`, which would not see past it.
          const lead = (/^\s*/.exec(pieceScan)?.[0] ?? "").length
          const trail = (/\s*$/.exec(pieceScan)?.[0] ?? "").length
          const core = piece.slice(lead, piece.length - trail)
          return `${piece.slice(0, lead)}${unscopeSelector(core)}${piece.slice(piece.length - trail)}`
        })
        .join(",")
      out.push(`${head}${rewritten}{${body}}`)
    }
    i = j
  }
  return out.join("")
}

/**
 * `real.split(",")`, cut at the commas `scan` sees rather than the ones `real`
 * has, and only where a comma actually separates two selectors.
 *
 * The scan already has comments and strings blanked, so those were covered. What
 * was not: a comma inside a functional pseudo-class. Parens are counted here for
 * the same reason `statementCut` counts them — `:is(.a, .b) .x` is one selector,
 * and cutting it in two handed `.b) .x` to `unscopeSelector` as if it were a
 * selector of its own. This is the reader's half of the defect the merge script
 * had in `scopeSelectorList`.
 *
 * The two halves are NOT equally bad, and it is worth writing down which is
 * which, because the reader looks harmless under most inputs. `unscopeSelector`
 * only strips a prefix, so it is a no-op on an arm that has none, and the pieces
 * are rejoined with the commas they were cut at — measured with the split still
 * in place, `:is(.a, .b) .x`, `.card:not(.muted, .ghost)`,
 * `.grid:has(> .item, > .row)` and a genuine two-selector list all came back
 * byte-identical. The one shape that did not is an arm that is itself a scope
 * compound: `:is(.x, [data-theme="dark"].y)` was cut, the second arm went through
 * `unscopeSelector`'s compound branch, and the rule reached every pair rule as
 * `:is(.x, :root.y)` — a selector no author wrote. On the WRITING side the same
 * split changed output for every one of those shapes.
 *
 * Unreachable in today's 17 previews, which have no comma inside a functional
 * pseudo-class; fixed anyway, on the same ground as the comment and string cases
 * above, because the merged file is also a hand-authoring convention.
 */
function splitTopLevel(
  real: string,
  scan: string
): Array<{ piece: string; scan: string }> {
  const out: Array<{ piece: string; scan: string }> = []
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

/**
 * Refuse a variant layout no reader can resolve.
 *
 * A `swap` is defined by the node in FRONT of it, so the two shapes below carry
 * no answer rather than a wrong one, and both fail silently at every other
 * layer: the runtime and `applyDarkVariants` each pick something plausible and
 * the dark rendering comes out with the light prose still in it. The converter
 * cannot produce either shape, but the format is also a hand-authoring
 * convention (`.claude/agents/preview-html-author.md`), and until this check
 * existed the validator had no rule about templates at all.
 *
 * Throwing rather than reporting an issue matches the `<style>`-count check
 * above: neither is a judgement about the preview's design, it is the file not
 * being in the shape this layout can be dealt out of.
 */
function assertReadableVariants(doc: Document): void {
  for (const tpl of variantTemplates(doc)) {
    if (tpl.getAttribute("data-theme-op") === "insert") continue
    const light = previousContentSibling(tpl)
    if (light === null) {
      throw new Error(
        `${MERGED_PREVIEW_FILE}: a template[data-theme-variant="dark"] with no ` +
          `preceding node has nothing to swap. Content dark adds and light has ` +
          `no counterpart for takes data-theme-op="insert".`
      )
    }
    if (
      light.nodeType === 1 &&
      (light as Element).hasAttribute("data-theme-variant")
    ) {
      throw new Error(
        `${MERGED_PREVIEW_FILE}: a swap template follows another variant ` +
          `template, so the node it was written for is no longer in front of ` +
          `it. Put the swap first and the insert after it.`
      )
    }
  }
}

function variantTemplates(doc: Document): Array<HTMLTemplateElement> {
  return [
    ...doc.querySelectorAll<HTMLTemplateElement>(
      'template[data-theme-variant="dark"]'
    ),
  ]
}

/** The light rendering: every dark variant stays unused and the anchor goes. */
export function removeDarkVariants(doc: Document): void {
  for (const tpl of variantTemplates(doc)) tpl.remove()
}

/**
 * Whitespace-only text and comments are formatting, not the node a `swap`
 * swaps. A hand-written file indents its markup, so `previousSibling` on an
 * indented template is the newline in front of it — removing that leaves the
 * light prose on screen and the dark prose unused. `_runtime/iframe.js` skips
 * the same two node types for the same reason.
 */
function previousContentSibling(node: Node): Node | null {
  let prev = node.previousSibling
  while (
    prev !== null &&
    (prev.nodeType === 8 ||
      (prev.nodeType === 3 && (prev.textContent ?? "").trim() === ""))
  ) {
    prev = prev.previousSibling
  }
  return prev
}

/**
 * The dark rendering. `data-theme-op` names which of the two moves applies:
 * `insert` for content light has no counterpart for, `swap` otherwise — and a
 * swap with empty content means the light node is simply absent in dark.
 *
 * The template's whole child list moves, not `content.firstChild`: indentation
 * puts a text node first, and a template holding two nodes would otherwise give
 * up the second.
 */
export function applyDarkVariants(doc: Document): void {
  for (const tpl of variantTemplates(doc)) {
    const content = [...tpl.content.childNodes]
    if (tpl.getAttribute("data-theme-op") !== "insert") {
      const light = previousContentSibling(tpl)
      if (light !== null) light.parentNode?.removeChild(light)
    }
    for (const node of content) tpl.parentNode?.insertBefore(node, tpl)
    tpl.remove()
  }
}
