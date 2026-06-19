# Apply guide — translating a design.md into the current project

The fetched design.md is a *brief*, not code. The job is to express its intent in the
target project's own styling system without flattening the brand's character or fighting
the codebase you're in.

## 1. Detect the target styling system first

Before editing, figure out how this project styles UI, and work with its grain:

- **Tailwind** — look for `tailwind.config.{js,ts}` or an `@theme` block in CSS, plus
  utility classes in JSX. Map tokens into the theme (colors, fontFamily, spacing,
  borderRadius), then use utilities. Don't scatter arbitrary `[#hex]` values.
- **CSS custom properties** — a `:root { --… }` block or a design-token file. Add/override
  variables there; don't sprinkle literals through components.
- **CSS-in-JS** (styled-components, emotion, vanilla-extract) — find the theme object and
  extend it.
- **Plain CSS / inline** — introduce a small variable block at the top scope and reference
  it.

A brand restyle that fights the project's system creates debt; one that flows through its
tokens stays maintainable.

## 2. Map the design.md sections

| design.md section   | Where it lands in the target |
|---------------------|------------------------------|
| Colors (OKLCH)      | color tokens / theme palette; keep semantic roles (primary, surface, ink) |
| Typography          | font-family + size/weight/line-height scale; load webfonts if the md gives a `font-*-src` URL |
| Spacing             | spacing scale — gap & padding steps |
| Rounded (radius)    | border-radius scale |
| Elevation & Depth   | shadow tokens |
| Components          | reference patterns for buttons, cards, inputs — match structure & states, don't clone pixel-for-pixel |
| Do's & Don'ts       | hard constraints to honor (e.g. "pure black 금지", "CTA fill은 1차 액션에만") |

## 3. OKLCH values

The catalog expresses color in OKLCH. Modern CSS supports `oklch()` directly — prefer
keeping it (wider gamut, perceptually uniform, and it's what the brand actually specified).
Only convert to hex/rgb when the target toolchain genuinely can't consume `oklch()`, and
when you do, note that the converted value is an approximation, not the brand's exact spec.

## 4. Fidelity & attribution

- Pull the real numbers from the md; don't approximate when the value is given.
- When you must go beyond what the brand documents, mark it as *your* inference, not the
  brand's spec — the user should know which parts are faithful and which are filled in.
- A design.md cites its sources with `[src:N]`; you don't need to carry those into the
  target project, but do preserve the brand's stated intent when it's explicit.

## 5. Scope & verification

- Large or structural work → run `superpowers:brainstorming` before coding.
- Restyle of an existing screen → proceed, but change tokens at the source so the whole
  surface moves together rather than patching one component at a time.
- Verify visually (preview/screenshot) or via the project's tests before saying it's done
  (`superpowers:verification-before-completion`). A brand restyle is a visual claim —
  back it with a visual check.
