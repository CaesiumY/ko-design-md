// The CSS colour functions the draft gate reads as a literal colour value.
// Shared by draft-validator's `LITERAL_COLOUR` (component values) and
// tagline-lint's colour check, which cannot import from draft-validator
// without a cycle.

// The function names, as a regex source.
export const CSS_COLOUR_FUNCTION_NAME =
  "(?:rgba?|hsla?|hwb|oklch|oklab|lch|lab|color-mix)"

// A name and its opening parenthesis, as a component value is read: the whole
// value is the colour, so a space before the parenthesis is tolerated.
export const CSS_COLOUR_FUNCTION = `${CSS_COLOUR_FUNCTION_NAME}\\s*\\(`
