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
9. **Do's and Don'ts** — guardrails for downstream LLMs. Always include at least one brand-specific *domain-boundary* Don't: consumers should borrow the visual treatment, not the source brand's product concepts, flows, or copy. (The catalog-wide statement of this principle lives in the README; per entry, write only the brand-specific line.) When the entry is a design system, add a second Don't enforcing **vendor neutrality**: the system's own name, its package names, and its class prefixes must not be surfaced in the consumer's generated UI copy, headers, titles, labels, or class names — borrow the visual language, not the system's name. The primary trigger is an explicit `design_system_name` (or a `name`/`slug` that is itself a design system, e.g. KRDS); a slug ending in `-design`, `-design-system`, `-ds` is a *secondary hint only*, so confirm the entry is genuinely a reusable design system before applying. Substitute *this* entry's own actual identifiers — do not copy the example verbatim (the Vapor UI entry uses `Vapor UI` / `@vapor-ui/*` / `vp-*`; use whatever name, package names, and class prefixes this brand actually ships). Like the domain-boundary Don't, this guardrail is catalog policy rather than a brand claim, so it needs no `[src:N]` citation.
10. **References** — citations to research sources; one numbered entry per `sources` URL, in order. **Every entry must be an externally-accessible public URL** that both readers and `pnpm validate:sources` can open. Ephemeral or private sources (a user-supplied Claude Design handoff bundle at `api.anthropic.com/v1/design/h/...`, a local `.claude/cache/...` path) are NOT valid sources — do not list them in frontmatter `sources` or in `## References`, and do not keep label-only placeholder entries. If a claim's only basis is such a source, either cite the public page that backs it or leave the claim uncited.

If a brand genuinely lacks information for a section (e.g. no published shadow system), keep the section heading and write one short line explaining the gap (`(no published elevation system; observed shadows are minimal)`). Do not delete sections — downstream agents rely on a stable structure.

A fill-in skeleton for all of the above lives at [`design-md-template.md`](./design-md-template.md). This file is the normative reference; the template is the shape.

### Relationship to Google's published DESIGN.md spec

Google Labs published the DESIGN.md format spec (`github.com/google-labs-code/design.md`, version `alpha`, Apache-2.0) after this catalog adopted the Stitch section structure. The two agree, and the ordering above already satisfies the spec — verified by running the official linter (`@google/design.md`) over every entry via `pnpm validate:spec`.

Three facts about the spec matter when editing this list:

- **All eight of its canonical sections are optional.** There is no missing-section rule. Its `missing-sections` diagnostic inspects the frontmatter `spacing`/`rounded` token maps, not body headings, and is info-level.
- **Its order check ignores headings it does not know.** Catalog-only sections (`Spacing`, `Rounded`, `References`, `Responsive Behavior`, `Known Gaps`) pass through silently, so adding one never breaks conformance.
- **`Brand & Style` is the spec's own alias for `Overview`.** Do not rename it.

The one place the two structures diverge on purpose: the spec has a single `Layout` section (alias `Layout & Spacing`) where this catalog keeps **`Spacing` and `Rounded` separate**. Keep them separate — `token-extractor.ts` slices those two headings by name to build the sidecar, so merging them silently empties two token groups.

The catalog is also, in two places, *more* expressive than the `alpha` schema. Conforming would mean deleting real published values, so these are recorded rather than fixed, and `src/lib/google-designmd-corpus.test.ts` pins their exact counts:

- `%` units in radius tokens (`50%` for a circle) — valid CSS, but the spec's `Dimension` accepts only `px`/`em`/`rem`.
- Multi-stop gradients held as colour tokens — the spec's `Color` is a single colour.

Catalog entries ARE spec documents. Tokens live in frontmatter in the shape
Google's DESIGN.md defines, so a consumer reading the raw md off GitHub gets a
document the official linter resolves. `/services/{slug}/DESIGN.md` still
renders a cleaned view for standard tooling — it strips body fences and renames
`radius` to the spec's `rounded` — but the file no longer depends on that route
to be readable.

## Token expression

**Declare tokens in frontmatter**, under `colors:`, `typography:`, `spacing:` and
`rounded:`. This is a reversal: entries used to carry tokens in body ```yaml
fences, and every entry was migrated in one pass. If you are looking at an older
draft or an outside example that fences its tokens, that form is legacy — the
extractor still reads it as a fallback, but nothing should be authored that way.

```yaml
colors:
  ## Brand
  primary: oklch(0.64 0.19 40)              # #E5581C 공식 발행값
  primary-foreground: oklch(0.99 0.005 40)
  ## Surface
  surface: oklch(0.99 0.01 80)
  text: oklch(0.18 0.02 60)
typography:
  display-1: { size: 56px, weight: 700, line-height: 1.30, tracking: -0.005em }
spacing:
  space-1: 4px
rounded:
  radius-s: 8px
```

Three details in that block are load-bearing, because they are what the sidecar
extractor reads:

- **Names stay flat.** Do not nest a group as a sub-map. `brand.primary` would
  rename the token and break the 1,398 `{colors.X}` prose references and the
  preview's CSS-variable mapping along with them.
- **A `## Heading` comment row opens a group.** It becomes the sidecar's `group`
  field, which the site's Tokens tab renders as a section label.
- **A trailing `# comment` becomes the token's `note`.** That is the only channel
  that reaches machine consumers — the sidecar carries it, and both the Tokens tab
  and the `use-design-md` skill read it. Put per-token caveats here, not only in
  the section's prose.

### Values may be quoted only when YAML would misread them

Write `primary: oklch(0.55 0.22 30)` bare. Quoting a colour value hides it from
`audit:oklch` and the drift check — both regex over the raw text, and both report
success while matching nothing, so the failure looks exactly like a pass.

Two value shapes DO need quoting, because unquoted they are not the scalar you
meant:

- A reference: `fill-brand: "{colors.primary}"`. Bare, YAML reads `{...}` as a
  flow mapping and the value resolves to null.
- A font stack that starts with a quote:
  `fontFamily: '"Noto Sans KR", Roboto, sans-serif'`. Bare, the leading quote
  makes YAML fail to parse the whole frontmatter.

### Prose still uses inline backticks

Referring to a value inside a sentence is unchanged, and does not duplicate a
token — the frontmatter declaration is the definition, prose is commentary:

```markdown
- **primary**: 따뜻한 오렌지 `oklch(0.7 0.18 50)` — 핵심 CTA, ETA 강조
```

Every form must use OKLCH. Hex and rgba are rejected — `non-oklch-token-value` is
a **block**, checked against the frontmatter maps — because downstream LLMs cannot
reason about them the way they can about explicit lightness, chroma and hue. Keep
the brand's published hex as the trailing comment; that is what it is for.

### Per-theme palettes need distinct names

When a brand publishes both a light and a dark value for the same semantic role, **do not declare the role twice under one name**. Nothing downstream can tell which declaration is authoritative: `readDefinitions` (`src/lib/oklch-drift.ts`) drops a name that disagrees with itself rather than guessing, so the preview-drift comparison switches off for that token entirely — and the DESIGN.md adapter keeps only the first, because frontmatter keys must be unique.

Prefix the dark scale instead. This is the established catalog convention, not a new rule: `codeit` names 78 tokens that way and `seed-design` 109, and both carry zero name collisions.

```yaml
bg-canvas:      oklch(1 0 0)
dark-bg-canvas: oklch(0.148 0.004 277)
```

Measured cost of getting this wrong: `wanted` shipped 21 colliding names, which silenced 22 of its preview comparisons until they were renamed. `validate:catalog` warns on every collision and names the comparison it costs, so you do not have to spot them by eye.

### Dimension values carry a unit — including zero

Write `0em`, not `0`. A bare zero is valid CSS but not a valid `Dimension` under Google's spec, which accepts only `px`, `em` and `rem`; `pnpm validate:spec` reports it as an error. This applies to `tracking`/`letterSpacing` most often, since zero tracking is common.

The frontmatter token maps feed the **token-card sidecar**
(`services/{slug}.tokens.json`, generated at Stage 8 by `pnpm tokens:build` and
loaded as `doc.tokens` for the detail page's card view). Keep one token per line
so the extractor can read each — `name: oklch(...)` (colors),
`name: { size, weight, line-height }` or `name: 16 / 24 / 700` (type),
`name: 16px` (spacing/rounded). Alias rows whose value points at another token
(`fill-brand: "{colors.red}"`) are skipped by the extractor and surface only in
the prose — intended, since the cards show visually-renderable tokens, not
pointers. `pnpm tokens:check` compares the regenerated sidecar byte-for-byte, so
a formatting slip here fails CI rather than silently changing a card.

### Webfont source URLs (`font-*-src`)

When `## Typography` names a face that the preview runtime's bundled Pretendard does NOT cover — almost always a `font-display` set to the brand's own display typeface (e.g. Wanted Sans, Toss Product Sans) — record that webfont's loadable CSS entry-point URL on a **top-level frontmatter key** `font-display-src` (or `font-sans-src`). The stack itself goes in the `fonts:` map; the `-src` key sits beside it at column 0, which is where `findFontDisplaySrc` looks:

```yaml
fonts:
  font-display: "\"Wanted Sans Variable\", \"Wanted Sans\", \"Pretendard Variable\", system-ui, sans-serif"
font-display-src: https://cdn.jsdelivr.net/npm/wanted-sans@1.0.3/fonts/webfonts/variable/split/WantedSansVariable.css
```

The stack is quoted because it begins with a quote character — see "Values may be
quoted only when YAML would misread them" above.

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
