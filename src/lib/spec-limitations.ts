/**
 * Errors the official DESIGN.md linter raises that are NOT catalog defects —
 * the catalog expresses something the `alpha` schema has no slot for.
 * Conforming would mean deleting real published values, so these are recorded
 * rather than fixed (ADR 0003).
 *
 * Keep this map exact. `google-designmd-corpus.test.ts` holds it as a ratchet:
 * a slug whose count moves in either direction fails, so neither a new error
 * nor a silently-fixed one slips by. `validateDraft` reads the same map so a
 * draft learns about an unrecorded count before CI does, while re-validating
 * the catalog stays silent on counts already recorded here.
 */
export const KNOWN_SPEC_LIMITATIONS: Readonly<Record<string, number>> = {
  // `border-radius: 50%` / `42%` — valid CSS, but the spec's Dimension type
  // accepts only px, em and rem.
  "11st": 1,
  baemin: 1,
  bezier: 1,
  "line-design-system": 1,
  remember: 1,
  yeogi: 1,
  // Multi-stop gradients are no longer here: they live in the catalog-only
  // `gradients:` map, which the linter does not read as colours. seed-design
  // held twelve in `colors:` until #421.
}
