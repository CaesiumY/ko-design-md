# Apply guide — translating a DESIGN.md into the current project

The fetched DESIGN.md is a *brief*, not code. The job is to express its intent in the
target project's own styling system without flattening the brand's character or fighting
the codebase you're in.

## 1. Change tokens at their source

Before editing, find where this project defines its tokens — a Tailwind theme, a `:root`
custom-property block, a CSS-in-JS theme object — and change them there, so the whole
surface moves together. Don't scatter literal values (`[#hex]`, inline colors) through
components; with no token layer at all, add a small variable block at the top scope.

## 2. Map the DESIGN.md sections

**Read `## Known Gaps` before applying any other section.** Most of its bullets are one of
four kinds, and each is handled differently (a bullet recording a retracted claim only
corrects an earlier version of the entry — nothing to apply):

- **Constraints you must follow.** Example: toss's brand typeface (Toss Product Sans) may
  not be redistributed, so the host app substitutes Pretendard. Apply the substitute the
  entry names, even where the prose describes the original face.
- **Caveats on published values.** A low-contrast pair, or a token with no published dark
  pair. Carry the value as published — the entry keeps it on purpose. If your UI needs
  something the brand didn't publish, fill it as *your* inference (SKILL.md "Scope
  guardrails").
- **Entry values that differ from the brand's.** A bullet may say some of the entry's own
  values were synthesized or observed and name the brand's published value beside them.
  If the bullet says how to switch (replace the whole ramp, only when building on the
  brand's own package, …), do exactly that — don't swap just the values it names, or the
  rest of the ramp falls out of step. With no such instruction, use the published value;
  if you keep the entry's, mark it as your inference.
- **Scope disclosures.** Values the catalog recommends rather than the brand publishing them
  (e.g. breakpoints), or areas the sources didn't cover. Use them, but don't present them
  as the brand's spec.

| DESIGN.md section   | Where it lands in the target |
|---------------------|------------------------------|
| Brand & Style       | the judgement call wherever tokens are silent — tone, density, what to emphasize |
| Colors (OKLCH)      | color tokens / theme palette; keep semantic roles (primary, surface, ink). Dark themes: see "Dark palette" below |
| Typography          | font-family + size/weight/line-height scale. Families and webfont URLs: see "Fonts" below |
| Spacing             | spacing scale — gap & padding steps |
| Rounded (radius)    | border-radius scale |
| Elevation & Depth   | shadow tokens |
| Shapes              | form language — corner style, border weights, iconography rules (stroke, fill variants) |
| Components          | reference patterns for buttons, cards, inputs — match structure & states, don't clone pixel-for-pixel |
| Responsive Behavior | breakpoints, touch-target minimums, how layouts collapse; check whether a breakpoint is the brand's token or the catalog's recommendation |
| Do's and Don'ts     | hard constraints to honor (e.g. "카드와 패널에 그림자를 추가하지 않는다", "한 화면에 강조색을 둘 이상 사용하지 않는다") |
| Known Gaps          | read first — see above |
| References          | where a value or claim comes from; use it to check one, don't carry it into the target |

### Fonts

- `typography:` in the frontmatter is the type scale. `fonts:` is different: font-family
  stacks published without sizes (a display face, a code face, an emoji face). Use them as
  family tokens, not as scale steps. They live only in the DESIGN.md frontmatter, not in the
  JSON token sidecar.
- `font-X-src` (a top-level key beside `fonts:`) is where the family `font-X` loads from.
  A `.css` URL is a stylesheet to link; a font file (`.woff`, `.woff2`, …) needs your own
  `@font-face` rule named after the first family in the `font-X` stack.
- Before you load or ship a face, check it may be redistributed. The limit can sit in
  Known Gaps, the Typography prose, Do's and Don'ts, or the comment on its `fonts:` line.
  Use the substitute the entry names; with none named, render the stack's fallbacks and
  don't host the font file.

### Dark palette

- A `dark-` prefix marks a dark-theme value. Its light pair is usually the same key
  without the prefix, or with `light-` in its place: `dark-grey-900` ↔ `grey-900`,
  `dark-gray-00` ↔ `light-gray-00`.
- A `-dark` *suffix* means different things in different entries — a darker shade used in
  the light theme (`positive-dark`, `primary-dark`) or a dark-theme value (`black-dark`,
  `bg-canvas-dark` ↔ `bg-canvas-light`). Don't decide from the name alone. Look at its
  neighbours: a `-dark` / `-middle` / `-light` ladder under one group label (`  ## …` row)
  is a shade scale, while `-light` / `-dark` twins of the same role are a theme pair. The
  token's trailing comment, the Colors prose and Known Gaps confirm it.
- A quoted `"{colors.x}"` value is a reference row: it resolves to key `x` in the same
  map, and `x` may itself be a reference — follow the chain to a literal value. Role rows
  point at palette steps this way, light and dark alike.
- Wire both values to one token name in the target's dark-mode mechanism (a custom-property
  theme block, `prefers-color-scheme`, Tailwind's `dark:` variant, …), so components switch
  without code changes.
- A dark pair can carry yet another marker (`primary-dark` ↔ `primary-dark-on-dark`).
  Before deciding a token has none, check same-stem neighbours and their comments.
- No dark pair means one of two things. Some tokens are theme-invariant by design (e.g. a
  `static-*` family). Others simply weren't published — Known Gaps may say so, but not
  every entry does. A dark value you fill in for those is your inference (SKILL.md "Scope
  guardrails").

## 3. OKLCH values

The catalog expresses color in OKLCH. Modern CSS supports `oklch()` directly — prefer
keeping it (wider gamut, perceptually uniform, and it's what the brand actually specified).
Only convert to hex/rgb when the target toolchain genuinely can't consume `oklch()`, and
when you do, note that the converted value is an approximation, not the brand's exact spec.

## 4. Fidelity & attribution

- Pull the real numbers from the md; don't approximate when the value is given.
- When you go beyond what the brand documents, mark it as *your* inference (SKILL.md
  "Scope guardrails") — the user should know which parts are faithful and which are
  filled in.
- A DESIGN.md cites its sources with `[src:N]`; you don't need to carry those into the
  target project, but do preserve the brand's stated intent when it's explicit.

## 5. Verification

Verify visually (preview/screenshot) or via the project's tests before saying it's done.
A brand restyle is a visual claim — back it with a visual check.

## 6. Brand name vs. visual language — stay vendor-neutral

A DESIGN.md names its source throughout — the brand, and for a design system also its
own name (the title heading, `design_system_name`), package names like `@vapor-ui/*` and
token or class prefixes like `vapor-*`. Those names are part of the *source's* identity,
not visual tokens — do not let them leak into the UI you generate. This applies to every
entry, service brand or named design system.

- **Borrow**: the color palette, type scale, spacing, radius, shadow system, and component
  structure & states — the values, under the target's own token names. A prefixed name
  from the entry or its sidecar (`yds-radius-08`, `ldsg-color-black`) lands on the
  project's existing scale if it has one, and otherwise on an unprefixed name of your
  own (`radius-08`, `color-black`).
- **Don't surface the source's name**: never put the brand's name (토스, 배민, …), a design
  system's name (`Vapor UI`, `SEED Design`, `KRDS`, …), its package names, or its token or
  class prefixes into your generated UI's headers, page titles, button/label copy, class
  names, or token / custom-property names. Use the user's *own* product name and
  nomenclature.
- **Why**: the source's name is its product/brand identity, not a token. A header that
  reads "Vapor UI" when the user asked for "their dashboard styled like Vapor" is a leak,
  not a feature.
- **Attribution exception**: if the user genuinely wants to credit the source, a footer
  line ("Vapor UI 기반" / "Built with SEED Design") is fine — but the name still
  must not appear in primary UI copy.

Many entries also carry a brand-specific Don't for this (every entry with a
`design_system_name` does) — honor it where present.
