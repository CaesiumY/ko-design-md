// Slugs whose logo was removed at the rights holder's request
// (docs/TAKEDOWN.md 「로고만 제거」). Every other catalog entry must carry a
// logo — `validate:draft` blocks a missing one as `missing-logo` — so this
// list is the only way an entry ships without one, and it names each case.
//
// Checked both ways by `design-md-skill-logo-policy.test.ts`: a listed slug
// that still declares a logo fails, and so does one whose entry is gone —
// either way the slug leaves the list.
// Onboarding never adds to it: a brand with no usable mark is not onboarded.
//
// Each slug maps to the GitHub issue number of the rights holder's request, so
// an exemption cannot be added without naming the request it answers — the
// test checks the number is a positive integer. Adding a row without a real
// takedown issue is a review failure, not a shortcut past `missing-logo`.
export const LOGO_TAKEDOWNS: ReadonlyMap<string, number> = new Map<
  string,
  number
>([])
