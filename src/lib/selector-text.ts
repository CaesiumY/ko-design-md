// Selector text, read as text: the few questions several preview tools ask of a
// selector without a CSS parser behind them. No dependencies, so the validator
// (which stays dependency-free) and the build-time readers can share it.

/** The scope the merged layout writes in front of every dark selector. */
export const DARK_SCOPE = '[data-theme="dark"]'

/**
 * Does this selector speak of the dark theme at all?
 *
 * Wider than `DARK_SCOPE` on purpose — any quoting, any spacing — and wider
 * than what `unscopeSelector` can take back off. A spelling this recognises and
 * that one cannot undo is still read as a dark rule, and shows up as one that
 * pairs with nothing; a spelling this missed would pass unread.
 */
export function mentionsDarkScope(selector: string): boolean {
  return /\[\s*data-theme\s*[~|^$*]?=\s*["']?dark["']?\s*\]/.test(selector)
}

/**
 * A selector list cut at the commas that separate its selectors — not the ones
 * inside `:is(.a, .b)`, `[title="a,b"]` or a quoted value. Each piece trimmed.
 */
export function splitSelectorList(list: string): Array<string> {
  const out: Array<string> = []
  let depth = 0
  let quote: string | null = null
  let start = 0
  for (let i = 0; i < list.length; i++) {
    const ch = list[i]
    if (quote !== null) {
      if (ch === "\\") i++
      else if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") quote = ch
    else if (ch === "(" || ch === "[") depth++
    else if ((ch === ")" || ch === "]") && depth > 0) depth--
    else if (ch === "," && depth === 0) {
      out.push(list.slice(start, i).trim())
      start = i + 1
    }
  }
  out.push(list.slice(start).trim())
  return out
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
export function unscopeSelector(sel: string): string {
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
