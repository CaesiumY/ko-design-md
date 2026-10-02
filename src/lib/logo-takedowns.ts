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
// Each slug maps to the rights holder's request it answers, so an exemption
// cannot be added without naming one: a public issue (`#123`) or a private
// Security Advisory (`GHSA-xxxx-xxxx-xxxx`), per docs/TAKEDOWN.md's two
// intake channels. The test checks the shape. Adding a row without a real
// request is a review failure, not a shortcut past `missing-logo`.
export const TAKEDOWN_REF =
  /^(?:#[1-9]\d*|GHSA(?:-[23456789cfghjmpqrvwx]{4}){3})$/
export const LOGO_TAKEDOWNS: ReadonlyMap<string, string> = new Map<
  string,
  string
>([])
