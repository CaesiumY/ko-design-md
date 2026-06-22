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
9. **Do's and Don'ts** — guardrails for downstream LLMs. Always include at least one brand-specific *domain-boundary* Don't: consumers should borrow the visual treatment, not the source brand's product concepts, flows, or copy. (The catalog-wide statement of this principle lives in the README; per entry, write only the brand-specific line.) When the entry has a `design_system_name` (or its `name`/`slug` *is* a design system — e.g. KRDS, or a slug ending in `-design`, `-design-system`, `-ds`), add a second Don't enforcing **vendor neutrality**: the system's own name, its package names, and its class prefixes must not be surfaced in the consumer's generated UI copy, headers, titles, labels, or class names — borrow the visual language, not the system's name. Substitute *this* entry's own actual identifiers — do not copy the example verbatim (the Vapor UI entry uses `Vapor UI` / `@vapor-ui/*` / `vp-*`; use whatever name, package names, and class prefixes this brand actually ships).
10. **References** — citations to research sources; one numbered entry per `sources` URL, in order. **Every entry must be an externally-accessible public URL** that both readers and `pnpm validate:sources` can open. Ephemeral or private sources (a user-supplied Claude Design handoff bundle at `api.anthropic.com/v1/design/h/...`, a local `.claude/cache/...` path) are NOT valid sources — do not list them in frontmatter `sources` or in `## References`, and do not keep label-only placeholder entries. If a claim's only basis is such a source, either cite the public page that backs it or leave the claim uncited.

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

The fenced ```yaml definition blocks in `## Colors / Typography / Spacing / Rounded` also feed the **token-card sidecar** (`services/{slug}.tokens.json`, generated at Stage 8 by `pnpm tokens:build` and loaded as `doc.tokens` for the detail page's card view). Keep them one-token-per-line so the extractor can read each — `name: oklch(...)` (colors), `name: { size, weight, line-height }` or `name: 16 / 24 / 700` (type), `name: 16px` (spacing/radius). Alias rows whose value points at another token (`fill-brand: blue-500`, `{colors.red}`) are skipped by the extractor and surface only in the prose — intended, since the cards show visually-renderable tokens, not pointers.

### Webfont source URLs (`font-*-src`)

When `## Typography` names a face that the preview runtime's bundled Pretendard does NOT cover — almost always a `font-display` set to the brand's own display typeface (e.g. Wanted Sans, Toss Product Sans) — record that webfont's loadable CSS entry-point URL on a sibling `font-display-src` (or `font-sans-src`) line **inside the same** ```yaml **block**:

```yaml
font-display: >
  "Wanted Sans Variable", "Wanted Sans", "Pretendard JP", "Pretendard Variable", system-ui, sans-serif
font-display-src: https://cdn.jsdelivr.net/npm/wanted-sans@1.0.3/fonts/webfonts/variable/split/WantedSansVariable.css
```

This URL is the single source of truth the **preview-html-author** loads into the preview `<head>`. Without it a brand-specific display face has no webfont to load and silently falls back to Pretendard in the preview (the gap that shipped on the wanted entry). Rules:

- Point at a **loadable CSS entry point** (`@import`/`<link>`-able), not a demo or marketing page. Prefer a foundry's **dynamic-subset / split** build where one exists (lighter for Korean pages) and a **pinned version** over `@latest` — refresh the pin alongside the catalog entry when the typeface library publishes an update.
- **Pretendard needs no `-src`** — the preview runtime already imports it. Only faces outside that baseline need a source.
- The token-card extractor **ignores `*-src` lines and any `http…` value**, so these never appear as bogus type cards.

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
