// What the catalogue still owes ADR 0015's dark rule — "the dark sheet says
// only what dark changes" — and how much it is allowed to say outside tokens.
//
// Two records, both per slug so previews walked in parallel PRs do not collide.
// `preview-dark-copy-corpus.test.ts` holds each of them to the shipped previews.

/**
 * Slugs whose dark sheet still restates light rules (issue #734). It only ever
 * shrinks: a preview that is walked leaves it, and nothing is added.
 *
 * `validate:previews` reads it to pick a severity. On the list, a copy is a
 * warning; off it, a block — so a copy in a new preview, or in one already
 * walked, is blocked for as long as its slug stays off the list. A listed slug
 * with nothing left to walk is a failure too, so the list cannot go stale and
 * keep exempting a slug that no longer needs it.
 *
 * Nothing here can stop a line being added to this set; what holds "nothing
 * is added" is a pin, a second copy of the list in
 * `preview-dark-copy-corpus.test.ts`. A slug put on the list fails `pnpm test`
 * until the pin is edited too, and that failure says to walk the copies
 * instead (`backlogDrift`). It is a lock of two edits, not an impossibility.
 * Once the list is empty, it, the pin and their handling go (#738).
 */
export const DARK_COPY_BACKLOG: ReadonlySet<string> = new Set([
  "11st",
  "baemin",
  "class101",
  "codeit",
  "gmarket",
  "greeting",
  "kyobobook",
  "line-design-system",
  "samsung-one-ui",
  "seed-design",
  "teamsparta",
  "wanted",
  "yeogi",
])

export type DarkCopyVerdict = "clean" | "warn" | "block" | "stale"

/**
 * The three cases of the list, plus the quiet one.
 *
 * - on the list, copies present: `warn` — not walked yet
 * - off the list, copies present: `block`
 * - on the list, no copies: `stale` — take the slug off the list
 */
export function darkCopyVerdict(
  listed: boolean,
  copies: number
): DarkCopyVerdict {
  if (copies > 0) return listed ? "warn" : "block"
  return listed ? "stale" : "clean"
}

/**
 * Where the list and its pin disagree. `added` is on the list and not in the
 * pin: a slug someone put on the list. `walked` is in the pin and not on the
 * list: a slug that was walked and whose pin line was left behind. The pin
 * follows the list down, so a walked slug put back on the list is `added`
 * like any new one.
 */
export function backlogDrift(
  listed: Iterable<string>,
  pinned: Iterable<string>
): { added: Array<string>; walked: Array<string> } {
  const list = new Set(listed)
  const pin = new Set(pinned)
  return {
    added: [...list].filter((slug) => !pin.has(slug)),
    walked: [...pin].filter((slug) => !list.has(slug)),
  }
}

/**
 * How much each preview's dark says outside tokens that light does not — a
 * colour written straight onto a component, almost always. A slug that is not
 * here has none. What exactly is counted is defined in one place, the comment
 * on `darkSheetReport` (`preview-validator.ts`); in short, dark rules that set
 * a property other than a custom property to a value light does not give it,
 * wherever they are written, and dark-only `@keyframes` / `@font-face` blocks.
 * A rule that only restates light is not in the number: that is a copy, and
 * `dark-sheet-copy` reports it.
 *
 * Token redefinition is the default way to write dark, but it is not the only
 * one allowed: some changes a token cannot carry (a logo inverted with
 * `filter`, a surface that swaps to an image). So these rules are not blocked;
 * their number is pinned instead, exactly. More than recorded fails — move the
 * colour into a token, or raise the number in the PR that needs the rule and
 * say why. Fewer fails too, so the record follows a preview down as it is
 * walked and cannot be left as headroom.
 */
export const DARK_OVERRIDE_RULES: Readonly<Record<string, number>> = {
  "11st": 51,
  baemin: 37,
  bezier: 2,
  chzzk: 3,
  class101: 1,
  codeit: 3,
  gmarket: 22,
  greeting: 1,
  krds: 12,
  kyobobook: 59,
  likelion: 1,
  "line-design-system": 106,
  nol: 5,
  remember: 3,
  "samsung-one-ui": 8,
  "seed-design": 28,
  socar: 5,
  teamsparta: 1,
  toss: 2,
  "vapor-ui": 1,
  wanted: 28,
  yeogi: 1,
  zigbang: 2,
}
