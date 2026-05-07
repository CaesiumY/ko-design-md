// Trim a long body-derived tagline down to a single readable sentence for
// the OG image canvas. The 32px lede has roughly 90 characters of room
// before line three starts pushing on the bottom padding.
//
// Sibling helper to `truncateForMeta`, which targets the 155-char meta
// description budget and uses a different break-detection strategy. They
// don't share a regex because the jobs differ:
//   - meta description: pack as much as fits, terminator > 60% threshold.
//   - OG canvas lede: the FIRST clean sentence, regardless of whether
//     the rest of the tagline could have squeezed in too.
//
// Korean sentence endings covered: 다 / 요 / 죠 / 함 / 음 / 네 / 지 / 야
// (declarative, polite, nominalized, conversational marketing copy).
// Plain `.`, `!`, `?` and full-width `？` `！` cover English / mixed copy.
//
// Both terminator types live in a single alternation so the lazy matcher
// stops at the EARLIEST sentence boundary regardless of type. Splitting
// into two sequential regexes would let the Korean arm jump past an
// earlier `?` to grab a later `다.`.
const FIRST_SENTENCE = /^(.{8,90}?(?:[다요죠함음네지야]\.|[.!?？！]))(?:\s|$)/u

export function ogLede(tagline: string): string {
  const match = tagline.match(FIRST_SENTENCE)
  if (match) return match[1]
  if (tagline.length <= 90) return tagline
  return tagline.slice(0, 87).trimEnd() + "…"
}
