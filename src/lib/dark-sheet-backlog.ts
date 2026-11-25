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
 * warning; off it, a block — so a new preview, or one already walked, cannot
 * take a copy back in. A listed slug with nothing left to walk is a failure
 * too, so the list cannot go stale and keep exempting a slug that no longer
 * needs it. Once it is empty the list and its handling go (#738).
 */
export const DARK_COPY_BACKLOG: ReadonlySet<string> = new Set([
  "11st",
  "baemin",
  "bezier",
  "class101",
  "codeit",
  "gmarket",
  "greeting",
  "krds",
  "kyobobook",
  "line-design-system",
  "samsung-one-ui",
  "seed-design",
  "socar",
  "teamsparta",
  "toss",
  "vapor-ui",
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
 * How many rules of each dark sheet set something other than a custom property
 * and differ from light in doing so — a colour written straight onto a
 * component, almost always. A slug that is not here has none.
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
  bezier: 62,
  chzzk: 3,
  class101: 1,
  codeit: 3,
  gmarket: 22,
  greeting: 1,
  krds: 67,
  kyobobook: 59,
  likelion: 1,
  "line-design-system": 106,
  nol: 5,
  remember: 3,
  "samsung-one-ui": 8,
  "seed-design": 26,
  socar: 6,
  teamsparta: 1,
  toss: 63,
  "vapor-ui": 32,
  wanted: 28,
  yeogi: 1,
  zigbang: 2,
}
