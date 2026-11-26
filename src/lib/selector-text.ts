// Selector text, read as text: the few questions several preview tools ask of a
// selector without a CSS parser behind them. No dependencies, so the validator
// (which stays dependency-free) and the build-time readers can share it.

/** The scope the merged layout writes in front of every dark selector. */
export const DARK_SCOPE = '[data-theme="dark"]'

// The attribute selector in the spellings CSS takes for it: quoted or bare,
// with an `i` or `s` flag, behind a namespace bar, in either case. A value in
// capitals without the `i` flag matches nothing in a browser and is read as
// dark all the same — that rule is dead, not light.
const ANY_DARK_SCOPE = String.raw`\[\s*(?:\*?\|)?data-theme\s*[~|^$*]?=\s*(?:["']dark["']\s*[is]?|dark(?:\s+[is])?)\s*\]`
const MENTIONS_DARK_SCOPE = new RegExp(ANY_DARK_SCOPE, "i")
// `:root` and nothing longer: `:root-ish` is another name.
const ROOT_PSEUDO = String.raw`:root(?![\w-])`
const DARK_SCOPE_ONCE = String.raw`(?:${ANY_DARK_SCOPE}|:where\(\s*${ANY_DARK_SCOPE}\s*\))`
// The scope where it scopes: at the front of the selector, on the root element
// however that is named, bare or inside `:where()`, once or (as the merge
// leaves a hand-written `html[data-theme="dark"]`) more than once. `html` and
// `:root` in that compound, before the scope or after it, name the element the
// scope is already on and are taken with it. Anything else there (`.panel`,
// `:not(.x)`, `:is(html)`) is a condition on the root and is left standing.
const LEADING_DARK_SCOPE = new RegExp(
  String.raw`^(?:html)?(?:${ROOT_PSEUDO})*(?:${DARK_SCOPE_ONCE}(?:${ROOT_PSEUDO})*)+`,
  "i"
)
// The root named twice over with no scope left beside it: what
// `unscopeSelector` makes of `[data-theme="dark"]:root` (`:root:root`) and of
// `html[data-theme="dark"]:root` (`html:root`).
const LEADING_ROOT_AGAIN = new RegExp(
  String.raw`^(?:html(?:${ROOT_PSEUDO})+|(?:${ROOT_PSEUDO}){2,})`,
  "i"
)
const LEADING_ROOT = /^(?:html|:root)\s+(?![>+~])/i

/**
 * Does this text — a selector, an at-rule prelude — speak of the dark theme at
 * all?
 *
 * Wider than `DARK_SCOPE` on purpose — any quoting, spacing, flag — and wider
 * than what `unscopeSelector` can take back off, which is one spelling only. A
 * spelling this missed would pass unread; one it recognises is read as a dark
 * rule, and `lightSpellingOf` is how it is then paired. One that still speaks
 * of the dark theme after `lightSpellingOf` names it where it cannot be read,
 * and the validator refuses that rule (`unreadDarkScopes`).
 */
export function mentionsDarkScope(selector: string): boolean {
  return MENTIONS_DARK_SCOPE.test(selector)
}

/**
 * A dark selector as a light sheet would have written it, whichever way its
 * scope is spelled: `html[data-theme="dark"] .btn`, `:root[data-theme='dark']
 * .btn`, `[data-theme=dark] .btn` and the `html .btn` that `unscopeSelector`
 * leaves of the first all come out `.btn`. Each selector of a list on its own.
 *
 * For pairing a dark rule with the light rule it may restate, and only as the
 * second thing tried: it is a guess at the author's intent, where
 * `unscopeSelector` is an exact inverse, and a rule that pairs under its own
 * text must keep doing so. Such a rule is still read against the light rules
 * of this spelling, beside its pairing and without being paired with one
 * (`darkSheetReport`).
 *
 * The scope is read only where it scopes, on the root element at the front of
 * the selector. `body[data-theme="dark"] .x` and `.x [data-theme="dark"]` come
 * back as they are: they name other elements, and stripping the attribute would
 * invent a selector.
 *
 * The root named again in the scope's own compound is the root once:
 * `[data-theme="dark"]:root .btn`, `html:root[data-theme="dark"] .btn` and the
 * `:root:root .btn` that `unscopeSelector` leaves of the first come out `.btn`
 * as well. Only `html` and `:root` are read so. Any other compound there is
 * kept as written, also one that happens to name the root
 * (`[data-theme="dark"]:is(html) .btn` comes out `:root:is(html) .btn`), and
 * pairs with a light rule spelled the same or with none.
 */
export function lightSpellingOf(selector: string): string {
  return splitSelectorList(selector)
    .map((arm) => {
      const scope = LEADING_DARK_SCOPE.exec(arm) ?? LEADING_ROOT_AGAIN.exec(arm)
      if (scope === null) return arm.replace(LEADING_ROOT, "")
      const rest = arm.slice(scope[0].length)
      const below = rest.trim()
      if (below === "") return ":root"
      // A descendant of the root is written without it; a compound on the
      // root (`.panel`) or a child of it (`> body`) is not.
      if (!/^\s/.test(rest)) return `:root${rest}`
      return /^[>+~]/.test(below) ? `:root ${below}` : below
    })
    .join(", ")
}

/**
 * CSS text with what only spells a character blanked out: the inside of each
 * quoted string, and any character behind a backslash. What is left can be
 * searched for a brace, a comma or a parenthesis that means one.
 */
export function withoutStrings(text: string): string {
  let out = ""
  let quote: string | null = null
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === "\\") {
      out += "  "
      i++
    } else if (quote === null) {
      if (ch === '"' || ch === "'") quote = ch
      out += ch
    } else if (ch === quote) {
      quote = null
      out += ch
    } else {
      out += " "
    }
  }
  return out
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
