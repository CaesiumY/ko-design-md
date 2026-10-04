// The one reduced-motion block the catalog uses (#394), and the means to find
// it — in the skill's prose, where it is defined, and in a preview, where it is
// applied. The skill's machine-gate test holds the author prompt, the rubric
// and the reviewer to the same fence; the preview corpus test holds every
// shipped preview to that fence. Both take the fence from `reducedMotionBlock`,
// so neither can define the form for itself. The prose surfaces are compared
// with whitespace collapsed (their fences are written alike, and the gate test
// parses that shape); a preview's copy is formatted freely, so it and the
// fence are both put through `normalizeCss` before comparing.

/**
 * The reduced-motion block a skill surface prescribes, whitespace-collapsed.
 * Taken from the `## Reduced motion` section's own css fence rather than the
 * first css fence in the file: the author prompt's Typography section carries
 * an earlier one (the `:root` font-stack variables), and a file-wide match
 * would compare that instead.
 */
export function reducedMotionBlock(text: string, name: string): string {
  const start = text.search(/^## Reduced motion\b/m)
  if (start === -1)
    throw new Error(`${name} must have a "## Reduced motion" section`)
  const next = text.indexOf("\n## ", start + 1)
  const section = text.slice(start, next === -1 ? undefined : next)
  const fence = /```css\r?\n([\s\S]*?)\r?\n\s*```/.exec(section)?.[1]
  if (fence === undefined)
    throw new Error(`${name}'s Reduced motion section must carry a css fence`)
  return fence.replace(/\s+/g, " ").trim()
}

export interface ReducedMotionMediaBlock {
  /** The block as written, from `@media` to its closing brace. */
  text: string
  /**
   * Whether it sits at the top level of the sheet. Nested in another at-rule —
   * `@media (max-width: 720px)`, `@media print`, `@supports` — it applies only
   * under that rule's condition, so it stops motion at some widths or in some
   * contexts and not others.
   */
  topLevel: boolean
}

// Comments, and strings (`content: "}"`), are text the cascade never reads as
// structure. Each is overwritten with spaces of the same length, so positions
// in the result are positions in the original. One alternation, scanned left
// to right, decides which comes first: a quote inside a comment is comment, a
// `/*` inside a string is string. A comment left open runs to the end of the
// sheet, as CSS reads it.
const COMMENT_OR_STRING =
  /\/\*[\s\S]*?(?:\*\/|$)|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g

function blankCommentsAndStrings(css: string): string {
  return css.replace(COMMENT_OR_STRING, (m) => m.replace(/[^\n]/g, " "))
}

/**
 * Every `@media` block whose condition mentions `prefers-reduced-motion` —
 * however it is spelled (`(prefers-reduced-motion)`, `screen and (…: reduce)`,
 * `not (…: no-preference)`, `(…: reduce) and (min-width: 0)`) — matched to its
 * closing brace, with whether it sits at the top level of the sheet. A caller
 * asserting "exactly the prescribed block, applied, nothing else" needs every
 * spelling found and every nesting reported: one it misses is a block it never
 * checks. Braces are counted as CSS reads them — a brace inside a comment or a
 * string does not count, and a block inside a comment is not found, since the
 * browser never applies it.
 */
export function reducedMotionMediaBlocks(
  css: string
): Array<ReducedMotionMediaBlock> {
  const clean = blankCommentsAndStrings(css)
  const out: Array<ReducedMotionMediaBlock> = []
  const open = /@media\b[^{;]*prefers-reduced-motion[^{;]*\{/gi
  // The sheet's depth at `at`, carried forward from one match to the next.
  let depth = 0
  let at = 0
  let m: RegExpExecArray | null
  while ((m = open.exec(clean)) !== null) {
    for (; at < m.index; at++) {
      if (clean[at] === "{") depth++
      else if (clean[at] === "}") depth--
    }
    let inner = 1
    let i = m.index + m[0].length
    while (inner > 0 && i < clean.length) {
      if (clean[i] === "{") inner++
      else if (clean[i] === "}") inner--
      i++
    }
    out.push({ text: css.slice(m.index, i), topLevel: depth === 0 })
    // A closed block leaves the depth where it found it.
    at = i
    open.lastIndex = i
  }
  return out
}

/**
 * Collapses whitespace — indentation, line breaks, runs of spaces, and any
 * spacing around braces, semicolons and commas — so a preview's copy and the
 * prose's copy compare equal however each is laid out. Nothing else is
 * normalised: spacing around `:` and `!important`, or a dropped final `;`,
 * still compares unequal. That errs strict — a copy written another way fails
 * rather than passes — and it has to: around `:` whitespace is not free
 * (`* ::before` and `*::before` select different elements).
 */
export function normalizeCss(css: string): string {
  return css
    .replace(/\s+/g, " ")
    .replace(/\s*([{};,])\s*/g, "$1")
    .trim()
}

export interface PreviewSheet {
  /** The `<style>` tag's attributes, as written. */
  attrs: string
  css: string
}

/**
 * Every `<style>` element in a preview file, in document order, whatever the
 * tag's case or whether it sits in the head. The first is the page sheet — the
 * one the reduced-motion block belongs in.
 */
export function previewSheets(html: string): Array<PreviewSheet> {
  return [...html.matchAll(/<style\b([^>]*)>([\s\S]*?)<\/style\s*>/gi)].map(
    (m) => ({ attrs: m[1], css: m[2] })
  )
}

/**
 * What keeps a preview from carrying `form` — the prescribed block,
 * `normalizeCss`'d — as the one place it handles reduced motion; empty when
 * nothing does. Three conditions:
 *
 * - The page sheet carries no `media` attribute. With one, the whole sheet —
 *   the block with it — applies only where the attribute matches.
 * - The page sheet holds exactly the prescribed block, at its top level (see
 *   `reducedMotionMediaBlocks`: not commented out, not inside another rule).
 * - `prefers-reduced-motion` appears once in the file, case aside: in that
 *   block. This is what closes the other places a reduced-motion branch can be
 *   written — another sheet, a `<style media=…>`, a sheet in the body, a
 *   commented copy — without listing them: each mentions the condition again.
 *   The author prompt allows no other reduced-motion handling (motion is CSS
 *   only, so there is no script to consult `matchMedia`), so a second mention
 *   is never legitimate.
 */
export function reducedMotionViolations(
  html: string,
  form: string
): Array<string> {
  const out: Array<string> = []
  const sheets = previewSheets(html)
  if (sheets.length === 0) return ["the file has no <style> element"]
  const page = sheets[0]
  if (/\bmedia\s*=/i.test(page.attrs))
    out.push(
      `the page sheet carries a media attribute (<style${page.attrs}>), so the block applies only where it matches`
    )
  const blocks = reducedMotionMediaBlocks(page.css)
  const found = blocks.map((b) => normalizeCss(b.text))
  if (found.length !== 1 || found[0] !== form)
    out.push(
      `the page sheet holds ${JSON.stringify(found)} where exactly the prescribed block belongs`
    )
  if (blocks.some((b) => !b.topLevel))
    out.push(
      "the page sheet's block sits inside another at-rule, so it applies only under that rule's condition"
    )
  const mentions = html.match(/prefers-reduced-motion/gi)?.length ?? 0
  if (mentions !== 1)
    out.push(
      `prefers-reduced-motion appears ${mentions} times in the file; the prescribed block is its one place`
    )
  return out
}
