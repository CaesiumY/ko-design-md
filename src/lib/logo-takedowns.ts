// Slugs whose logo was removed at the rights holder's request
// (docs/TAKEDOWN.md 「로고만 제거」). Every other catalog entry must carry a
// logo — `validate:draft` blocks a missing one as `missing-logo` — so this
// list is the only way an entry ships without one, and it names each case.
//
// Two-way: `design-md-skill-logo-policy.test.ts` fails when a listed slug
// still declares a logo, so an entry that gets its logo back leaves the list.
// Onboarding never adds to it: a brand with no usable mark is not onboarded.
export const LOGO_TAKEDOWNS: ReadonlySet<string> = new Set<string>([])
