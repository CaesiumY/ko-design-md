// How close an authored OKLCH has to be to its annotated hex to count as
// agreeing. Shared by the draft validator (`src/lib/draft-validator.ts`, which
// gates new entries) and the past-data auditor (`scripts/audit-oklch.ts`, the CI
// gate over the whole catalogue) — they judge the same question, so a comment
// saying "same value as the other one" is not enough: whichever got edited
// second would silently start accepting what the other rejects.

// Judging L, C and H against separate bounds mis-scales with chroma: at C=0.02 a
// 4° hue swing moves the rendered pixel by ~6/255, while at C=0.21 the same 4°
// moves it by ~37/255. A single Oklab distance scales automatically, so one
// number covers both ends of a ramp.
//
// 0.010 is calibrated against the catalog (365 hex-annotated tokens), not picked
// from theory: every token whose rendered pixel lands within 2/255 of its hex
// scores ΔE ≤ 0.0092, so this bound accepts honest 2–3 decimal rounding with zero
// false positives, while flagging 28 tokens that are genuinely off.
export const DELTA_E_TOLERANCE = 0.01

// 1/255 ≈ 0.004 per hex step, so this is ~5 steps of slack. Authors write round
// percentages (3%, 10%) against a byte-quantized hex alpha, and the two only
// land on each other exactly at a few values — a tighter bound would flag
// correct pairs like `/ 3%` ↔ `08` (3.1%).
export const ALPHA_TOLERANCE = 0.02
