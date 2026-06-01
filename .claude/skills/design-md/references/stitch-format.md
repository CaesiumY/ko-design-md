# Stitch v0.1 design.md format reference

Google Stitch's design.md is a YAML-frontmatter + Markdown format for encoding a brand's design system in a single text file consumable by both humans and AI coding agents. ko-design-md catalog entries adopt the **section structure** of Stitch v0.1 but keep their own catalog-specific frontmatter (Stitch token YAML lives inside body sections, not in frontmatter).

## Standard section order (use as ## headings, in this order)

1. **Brand & Style** — design philosophy, target audience, emotional tone. Prose, body lang.
2. **Colors** — palette with semantic roles. OKLCH values inside fenced ```yaml or as a markdown table.
3. **Typography** — font families (Pretendard Variable for Korean coverage), scale, weights, line heights.
4. **Spacing** — base unit + scale.
5. **Rounded** — radius tokens.
6. **Elevation & Depth** — shadow system, depth language.
7. **Shapes** — visual language (curves vs. sharp, geometric vs. organic).
8. **Components** — signature components with variants and states. Code identifiers stay English. Include short ```tsx examples where a snippet clarifies the API.
9. **Do's and Don'ts** — guardrails for downstream LLMs. Always include at least one brand-specific *domain-boundary* Don't: consumers should borrow the visual treatment, not the source brand's product concepts, flows, or copy. (The catalog-wide statement of this principle lives in the README; per entry, write only the brand-specific line.)
10. **References** — citations to research sources (covers each `sources` entry, plus any label-only bundle entry described below). Use each source's public URL. For an **ephemeral or private primary source** catalog readers cannot reach — a user-supplied Claude Design handoff bundle at `api.anthropic.com/v1/design/h/...`, or a local `.claude/cache/...` path — keep it as a numbered entry by **label only, no URL**, so the `[src:N]` citation is preserved while no link that 404s for readers ships. These links must NOT appear in frontmatter `sources` either.

If a brand genuinely lacks information for a section (e.g. no published shadow system), keep the section heading and write one short line explaining the gap (`(no published elevation system; observed shadows are minimal)`). Do not delete sections — downstream agents rely on a stable structure.

## Token expression

Stitch v0.1 permits a YAML frontmatter token block, but ko-design-md frontmatter is reserved for catalog metadata. **Express tokens inside the relevant body section**, in one of two equivalent forms:

### Fenced YAML (preferred for structured token blocks)

````markdown
## Colors

```yaml
primary: oklch(0.55 0.22 30)
primary-foreground: oklch(0.99 0.005 30)
surface: oklch(0.99 0.01 80)
text: oklch(0.18 0.02 60)
accent: oklch(0.85 0.15 100)
```
````

### Inline backtick (preferred for prose)

```markdown
- **primary**: 따뜻한 오렌지 `oklch(0.7 0.18 50)` — 핵심 CTA, ETA 강조
- **accent**: 부드러운 옐로우 `oklch(0.92 0.14 95)` — 마이크로카피 포인트
```

Both forms must use OKLCH. Hex and rgba are rejected by the design.md reviewer because they cannot be reasoned about by downstream LLMs in the same way as OKLCH (lightness, chroma, hue components are explicit).

## Body language

Body prose follows the `lang` frontmatter field:
- `lang: ko` → Korean editorial register (ends with ~다, no honorifics overuse, no marketing fluff).
- `lang: en` → plain editorial English (no marketing copy, no second-person sales tone).

Section **headings stay in English** regardless of `lang` so the structure is parseable by downstream agents that key off heading text.

## Token reference syntax (recommended)

Within prose sections (`## Components`, `## Do's and Don'ts`, `## Responsive Behavior`, etc.), reference tokens using `{group.name}` syntax:

- `{colors.primary}`, `{colors.fg-1}`
- `{typography.body-m}`, `{typography.display-l}`
- `{rounded.pill}`, `{rounded.medium}`
- `{spacing.section}`, `{spacing.lg}`
- `{component.button-primary}`, `{component.card-elevated}`

Token definition blocks (the fenced ```yaml in `## Colors`, etc.) keep their bare key names. The `{group.name}` form is for prose references only.

This syntax makes downstream LLM consumption unambiguous — "use `{colors.primary-50}` background" is mechanically resolvable to the OKLCH value, whereas "use the primary blue background" requires inference.

## Component variant decomposition (recommended)

Within `## Components`, decompose functionally distinct variants and meaningful states into separate `###` entries rather than nesting them inside one parent section.

When to decompose:
- Multiple button "kinds" (primary, secondary, danger, ghost) → each its own `###`.
- Card states with distinct visual treatment (default, elevated, selected) → each its own `###`.
- Singular components (SearchBar, Pagination, Breadcrumb) with no variant branching → keep as one `###`.

State variants (`-active`, `-focus`, `-disabled`) also live as their own entries when they have distinct token references (e.g. `button-primary-active` shifts to `{colors.primary-60}` fill).

## Optional sections (recommended)

These sections extend the 10 standard sections. They are recommended for new entries but **not required** by the rubric. If included, place them between `## Do's and Don'ts` and `## References`.

- **`## Responsive Behavior`** — breakpoint table with a "Key Changes" column, touch target rules, per-component collapsing strategy, image/aspect-ratio behavior at small widths. Its input source is research.md's `## Responsive & breakpoints (observed)` section; include whenever that section surfaces any breakpoint or mobile-specific information.
- **`## Known Gaps`** — honest 2~5 bullet list of what wasn't surfaced from research. Signals to downstream consumers what they need to fill in themselves.

## What's NOT in design.md

- Implementation code beyond short illustrative snippets — design.md describes intent and tokens, not full components.
- Marketing copy, taglines, or hero messaging — those belong in product surfaces.
- Brand mission statements — keep `## Brand & Style` focused on visual/UX intent, not corporate positioning.

## Sources

- Google Labs announcement: https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/
- Spec repo: https://github.com/google-labs-code/design.md
- Curated examples: https://getdesign.md, https://github.com/VoltAgent/awesome-design-md
