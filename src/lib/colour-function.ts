// The CSS colour functions the draft gate reads as a literal colour value, as a
// regex source matching the function name and its opening parenthesis. Shared
// by draft-validator's `LITERAL_COLOUR` (component values) and tagline-lint's
// colour check, which cannot import from draft-validator without a cycle.
export const CSS_COLOUR_FUNCTION =
  "(?:rgba?|hsla?|hwb|oklch|oklab|lch|lab|color-mix)\\s*\\("
