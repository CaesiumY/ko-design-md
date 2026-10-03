// The one reduced-motion block the catalog uses (#394), and the means to find
// it — in the skill's prose, where it is defined, and in a preview, where it is
// applied. Two contract tests read it: the skill's machine-gate test holds the
// author prompt, the rubric and the reviewer to the same form, and the preview
// corpus test holds every shipped preview to that form. Keeping the reading in
// one place is what makes "the same form" mean the same thing on both sides.

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
 * Every `@media (prefers-reduced-motion: reduce) { … }` block in a stylesheet,
 * matched to its closing brace. The block nests a rule, so the first `}` is not
 * its end; counting braces is enough because these sheets carry no braces
 * inside strings or comments around the block.
 */
export function reduceMediaBlocks(css: string): Array<string> {
  const out: Array<string> = []
  const open = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{/g
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
