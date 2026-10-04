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

/**
 * Every `@media` block whose condition mentions `prefers-reduced-motion` —
 * however it is spelled (`(prefers-reduced-motion)`, `screen and (…: reduce)`,
 * `not (…: no-preference)`, `(…: reduce) and (min-width: 0)`) — matched to its
 * closing brace. A caller asserting "exactly the prescribed block, nothing
 * else" needs every spelling found: one it misses is a block it never checks. The block nests a rule, so the first `}` is not
 * its end. It counts braces and does not track strings or comments, so a brace
 * inside one would end the block in the wrong place — the corpus test then
 * fails on a block that does not match, rather than passing silently.
 */
export function reducedMotionMediaBlocks(css: string): Array<string> {
  const out: Array<string> = []
  const open = /@media\b[^{;]*prefers-reduced-motion[^{;]*\{/g
  let m: RegExpExecArray | null
  while ((m = open.exec(css)) !== null) {
    let depth = 1
    let i = m.index + m[0].length
    while (depth > 0 && i < css.length) {
      if (css[i] === "{") depth++
      else if (css[i] === "}") depth--
      i++
    }
    out.push(css.slice(m.index, i))
    open.lastIndex = i
  }
  return out
}

/**
 * Collapses the whitespace a block's formatting is free to vary — indentation,
 * line breaks, spacing around braces and separators — so a preview's copy and
 * the prose's copy compare equal when they are the same CSS.
 */
export function normalizeCss(css: string): string {
  return css
    .replace(/\s+/g, " ")
    .replace(/\s*([{};,])\s*/g, "$1")
    .trim()
}
