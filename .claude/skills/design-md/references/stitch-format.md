# Stitch v0.1 design.md format reference

A catalog entry is a YAML-frontmatter + Markdown document that encodes a brand's design language in a single text file consumable by both humans and AI coding agents. **Stitch v0.1** is this catalog's name for the **section structure** it adopted from Google Stitch's design.md; the file format itself is specified by Google Labs as DESIGN.md (see *Relationship to Google's published DESIGN.md spec* below). Entries carry that spec's token maps in frontmatter, next to catalog-specific keys (`slug`, `category`, `created_at`, …).

## Standard section order (use as ## headings, in this order)

1. **Brand & Style** — design philosophy, target audience, emotional tone. Prose, body lang.
2. **Colors** — palette with semantic roles. Values are declared as OKLCH in the frontmatter `colors:` map (see the token rules below); the section carries the prose, plus a table only where it adds what the map cannot (usage matrix, light/dark pairing).
3. **Typography** — font families (Pretendard Variable for Korean coverage), scale, weights, line heights.
4. **Spacing** — base unit + scale.
5. **Rounded** — radius tokens.
6. **Elevation & Depth** — shadow system, depth language.
7. **Shapes** — visual language (curves vs. sharp, geometric vs. organic).
8. **Components** — signature components with variants and states. Code identifiers stay English. Include short ```tsx examples where a snippet clarifies the API.
9. **Do's and Don'ts** — guardrails for downstream LLMs. Always include at least one brand-specific *domain-boundary* Don't: consumers should borrow the visual treatment, not the source brand's product concepts, flows, or copy. (The catalog-wide statement of this principle lives in the README; per entry, write only the brand-specific line.) When the entry is a design system, add a second Don't enforcing **vendor neutrality**: the system's own name, its package names, and its class prefixes must not be surfaced in the consumer's generated UI copy, headers, titles, labels, or class names — borrow the visual language, not the system's name. The primary trigger is an explicit `design_system_name` (or a `name`/`slug` that is itself a design system, e.g. KRDS); a slug ending in `-design`, `-design-system`, `-ds` is a *secondary hint only*, so confirm the entry is genuinely a reusable design system before applying. Substitute *this* entry's own actual identifiers — do not copy the example verbatim (the Vapor UI entry uses `Vapor UI` / `@vapor-ui/*` / `vp-*`; use whatever name, package names, and class prefixes this brand actually ships). Like the domain-boundary Don't, this guardrail is catalog policy rather than a brand claim, so it needs no `[src:N]` citation.
10. **References** — the entry's only list of sources, numbered 1..N; `[src:N]` points at entry N. There is no frontmatter copy of this list. **Every entry must be an externally-accessible public URL** that both readers and `pnpm validate:sources` can open. Ephemeral or private sources (a user-supplied Claude Design handoff bundle at `api.anthropic.com/v1/design/h/...`, a local `.claude/cache/...` path) are NOT valid sources — do not list them in `## References`, and do not keep label-only placeholder entries. If a claim's only basis is such a source, either cite the public page that backs it or leave the claim uncited.

If a brand genuinely lacks information for a section (e.g. no published shadow system), keep the section heading and write one short line explaining the gap (`(no published elevation system; observed shadows are minimal)`). Do not delete sections — downstream agents rely on a stable structure.

A fill-in skeleton for all of the above lives at [`design-md-template.md`](./design-md-template.md). This file is the normative reference; the template is the shape.

### Relationship to Google's published DESIGN.md spec

Google Labs published the DESIGN.md format spec (`github.com/google-labs-code/design.md`, version `alpha`, Apache-2.0) after this catalog adopted the Stitch section structure. The two agree, and the ordering above already satisfies the spec — verified by running the official linter (`@google/design.md`) over every entry: `src/lib/google-designmd-corpus.test.ts` runs it inside `pnpm test` (the CI gate), and `pnpm validate:spec` prints the same findings for local diagnosis (warnings of some rules — `orphaned-tokens` — only as a count unless `--verbose`).

Three facts about the spec matter when editing this list:

- **All eight of its canonical sections are optional.** There is no missing-section rule. Its `missing-sections` diagnostic inspects the frontmatter `spacing`/`rounded` token maps, not body headings, and is info-level.
- **Its order check ignores headings it does not know.** Catalog-only sections (`Spacing`, `Rounded`, `References`, `Responsive Behavior`, `Known Gaps`) pass through silently, so adding one never breaks conformance.
- **`Brand & Style` is the spec's own alias for `Overview`.** Do not rename it.

The one place the two structures diverge on purpose: the spec has a single `Layout` section (alias `Layout & Spacing`) where this catalog keeps **`Spacing` and `Rounded` separate**. Keep them separate — tokens are now keyed by the frontmatter `spacing:` / `rounded:` maps, so a merge no longer empties the sidecar (the extractor does not read body headings at all), but the draft gate requires both headings and blocks a merged `Layout`.

The catalog is also, in two places, *more* expressive than the `alpha` schema. Conforming would mean deleting real published values, so the values stay:

- `%` units in radius tokens (`50%` for a circle) — valid CSS, but the spec's `Dimension` accepts only `px`/`em`/`rem`. Keep them in `rounded:` and record the count in `KNOWN_SPEC_LIMITATIONS` (`src/lib/spec-limitations.ts`); the corpus test pins it.
- Multi-stop gradients — the spec's `Color` is a single colour. Put them in the catalog-only `gradients:` map, never `colors:`: there they raise no error, and in `colors:` each one fails to resolve and renders as an empty swatch on the site.

Catalog entries ARE spec documents, and they are published as-is: there is no
adapter. Tokens live in frontmatter in the shape Google's DESIGN.md defines, and
`/services/{slug}/DESIGN.md` serves the committed file byte-for-byte — the same
bytes as `/services/{slug}/llms.txt`, under the spec's filename. That only holds
while **the body carries no ```yaml fence**: the official linter merges every body
yaml fence into the frontmatter's schema namespace, reading each row as a
top-level key. So the draft gate blocks one in any section (`token-fence` in the
four token sections, `body-yaml-fence` everywhere else).

## Token expression

**Declare tokens in frontmatter**, under `colors:`, `typography:`, `spacing:` and
`rounded:`, and shadows under `elevation:`. This is a reversal: entries used to
carry tokens in body ```yaml fences, and every entry was migrated. If you are
looking at an older draft or an outside example that fences its tokens, that form
is legacy and the draft gate blocks it. Values the frontmatter has no slot for —
motion easing and durations — go in a body ```` ```text ```` fence, which readers
see and the linter does not. Component specs go in both places: the properties
the spec has a slot for in `components:` (see **Component tokens in the
frontmatter `components:` map** below), and the full spec in the body fence.

```yaml
colors:
  ## Brand
  primary: oklch(0.64 0.19 40)              # #E5581C 공식 발행값
  primary-foreground: oklch(0.99 0.005 40)
  ## Surface
  surface: oklch(0.99 0.01 80)
  text: oklch(0.18 0.02 60)
typography:
  display-1:
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.30
    letterSpacing: -0.005em
spacing:
  space-1: 4px
rounded:
  radius-s: 8px
elevation:
  shadow-1: 0 1px 2px oklch(0.2 0 0 / 0.06), 0 1px 1px oklch(0.2 0 0 / 0.04)   # card
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.radius-s}"
    height: 48px
  button-primary-hover:
    backgroundColor: "{colors.text}"
```

The details in that block are load-bearing, because they are what the sidecar
extractor reads:

- **`typography:` is the one map the sidecar reads that nests, and its property names are the
  spec's** — `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, one per line
  under a bare style name, as above. A style that sets none of the four
  (`display-1: { size: 56px }`, or only a `fontFamily`) yields **no** type token
  while the official linter still counts it, so the draft gate blocks it — and
  a style written as one value or as a whole-style alias (`hero: "{typography.x}"`)
  the same way. A family with no published size goes in the catalog-only
  `fonts:` map instead; do not invent a size to get past the gate.
- **Names stay flat.** Do not nest a group as a sub-map — the validator blocks a
  map under a row of `colors:`, `spacing:`, `rounded:` or `elevation:`, and a
  map under a typography style (one level of nesting is the style itself).
  `brand.primary` would rename the token and break every `{colors.X}` prose
  reference and the preview's CSS-variable mapping along with them.
- **A `## Heading` comment row opens a group.** It becomes the sidecar's `group`
  field, which the site's Tokens tab renders as a section label.
- **`elevation:` holds one shadow per row.** A multi-layer shadow joins its
  layers with commas in that one value. Rows whose value is not a shadow (an
  easing curve, a z-index) are filtered out of the sidecar and blocked — put
  those in a `text` fence instead.
- **A trailing `# comment` becomes the token's `note`.** That is the only channel
  that reaches machine consumers — the sidecar carries it, and both the Tokens tab
  and the `use-design-md` skill read it. Put per-token caveats here, not only in
  the section's prose.
- **`components:` nests too, but the sidecar does not read it.** It reaches
  standard tools through the published DESIGN.md only; its rules are below.

### Every reader reads the frontmatter as YAML does

One module reads the frontmatter for the site, the validator, the token
extractor and the colour checks (docs/adr/0011), so a value means what YAML
reads it as — quoted or bare, indented two spaces or four. Write values bare by
habit (`primary: oklch(0.64 0.19 40)`); a quoted one is judged the same, so a
quoted `"#FF0038"` is still rejected as non-OKLCH. Bare `primary: #FF0038` is
not a value at all — the `#` opens a comment — and is blocked as a colour cut
off by it.

Two value shapes DO need quoting, because unquoted they are not the scalar you
meant:

- A reference: `fill-brand: "{colors.primary}"`. Bare, YAML reads `{...}` as a
  flow mapping and the value resolves to null.
- A font stack that starts with a quote:
  `fontFamily: '"Noto Sans KR", Roboto, sans-serif'`. Bare, the leading quote
  makes YAML fail to parse the whole frontmatter, and the validator then reports
  that one cause and nothing else — the site's build fails on it too. Seven
  entries once dropped to zero tokens on exactly this shape with every gate
  still green.

### Prose still uses inline backticks

Referring to a value inside a sentence is unchanged, and does not duplicate a
token — the frontmatter declaration is the definition, prose is commentary:

```markdown
- **primary**: 따뜻한 오렌지 `oklch(0.7 0.18 50)` — 핵심 CTA, ETA 강조
```

Every form must use OKLCH. Hex and rgba are rejected — `non-oklch-token-value` is
a **block**, checked against the frontmatter maps — because downstream LLMs cannot
reason about them the way they can about explicit lightness, chroma and hue. In
`colors:` the rule rejects anything but one lower-case `oklch(…)` or a quoted
reference into `colors:` (`"{colors.x}"`), so a named colour, another token's bare
name, `"{brand}"` with no map name or `"{fonts.x}"` too. Keep
the brand's published hex as the trailing comment; that is what it is for.

### Per-theme palettes need distinct names

When a brand publishes both a light and a dark value for the same semantic role, **do not declare the role twice under one name**. Nothing downstream can tell which declaration is authoritative: `readDefinitions` (`src/lib/oklch-drift.ts`) drops a name that disagrees with itself rather than guessing, so the preview-drift comparison switches off for that token entirely — and the official linter, which reads the file as published, keeps only one, because frontmatter keys must be unique.

Prefix the dark scale instead. This is the established catalog convention, not a new rule: `codeit` names 78 tokens that way and `seed-design` 109, and both carry zero name collisions. The light side keeps its bare name, and neither side takes a theme suffix (`bg-canvas-dark`, `bg-canvas-light`) — the card view recognises a dark token by its `dark-` prefix (or a group heading that opens with "Dark"), so a suffixed one under any other heading lands among the light cards. A lightness step that is not a theme twin (`primary-dark` as a darker shade on the same canvas) is not a theme suffix.

```yaml
bg-canvas:      oklch(1 0 0)
dark-bg-canvas: oklch(0.148 0.004 277)
```

Measured cost of getting this wrong: `wanted` shipped 21 colliding names, which silenced 22 of its preview comparisons until they were renamed. `validate:catalog` warns on every collision and names the comparison it costs, so you do not have to spot them by eye.

### Role → palette reference rows

When the brand publishes a role layer on top of its palette (`bg-brand-solid` → `carrot-600`), carry it **twice, always**: as a role table in the body's `## Colors` and as frontmatter reference rows (ADR 0012). How the research describes the layer does not matter — a layer written up only in prose or in token-line comments, or a role the upstream points at a palette step but that arrived as that step's literal value, still owes both. A system with no palette under its roles, where each role holds its value directly, has no role layer and owes neither. Live example, `services/seed-design.md`:

```yaml
bg-brand-solid: "{colors.carrot-600}"
dark-bg-brand-solid: "{colors.dark-carrot-700}"
dark-bg-overlay: "{colors.static-black-alpha-700}"
```

The obligation and its limits:

- **"Published" means a brand publication (public docs, a package) or deployed code defines the role under that name.** Not published, so not owed: a name the catalogue author coined for values they observed (in a handoff bundle or in deployed code alike), a name the body itself says is not the official one, and a synthesized name.
- **The body table is required, with each role name as a backticked span in the first cell.** That is the only place the `CASES` guard below looks.
- **A reference row only for a role the upstream points at a single palette token.** A role that goes through an opacity ramp stays out even when the value matches — codeit's `txt-primary` points at `gray-100-opacity-100`, not `gray-100`. Such roles, and pairs where the upstream disagrees with the table, stay in the body table only. When the upstream lacks what a row would need — the palette token to point at, or the mapped value — do not invent it; record it in Known Gaps.
- **Not under a spec `color_roles` name** (`primary` · `secondary` · `tertiary` · `neutral`). Tools read those as brand roles, so a table role named `secondary` (greeting's text colour) must not be published under it. `primary` is allowed only as the brand-colour alias (`primary: "{colors.x}"`, pointing at the colour the brand publishes as its own). A colour the brand itself publishes under one of these names (remember's `secondary`) is not a table role and is unaffected.
- **The dark pair is named with the `dark-` prefix only and points into the dark palette** (`dark-bg-brand-solid` → `dark-carrot-700`) — never a suffix such as `…-dark`. A palette that does not change with the theme (seed-design's `static-*`) has no `dark-` twin, so the dark pair points at the same unprefixed key.
- **The body table and the reference rows are two copies of one mapping — edit both.** The sidecar carries the reference rows but not the body table, so `tokens:check` cannot see the two drift apart.

**This shape owes a hand-written comparison in `CASES`** (`src/lib/role-reference-rows.test.ts`). The guard in that file finds entries by shape: a reference row whose key — less a `dark-` prefix, and with codeit's `text-` / `background-` read as `txt-` / `bg-` — appears as a backticked name in the first cell of a row in the entry's own `## Colors` section. Only rows whose first non-space character is `|` and whose first cell *starts* with a backtick are read (indented tables count), so a role cell like ``배경 `bg-x` `` or a table written without the leading pipe is not seen. Such an entry fails CI until `CASES` holds a function comparing its rows against its table. It is not a one-line row: entries lay out their role tables differently, so each comparison is written for its slug. The `primary` alias above does not count. The test file is outside this skill's write scope; the operator adds the function.

### Component tokens in the frontmatter `components:` map

Every new entry carries its components in the spec's `components:` map as well as in the body (#389). The body's `## Components` section keeps the full spec — the `text` fence readers follow, borders, focus rings and all — and the map carries the part standard tools can read. They are two copies of one spec: edit both.

- **Only the spec's eight properties:** `backgroundColor` · `textColor` · `typography` · `rounded` · `padding` · `size` · `height` · `width`. The pinned linter reads no others — one more is reported as "not a recognized component sub-token", and the draft gate blocks it (`unknown-component-property`). A component's row carries only the values **the map admits** — a value among the eight that is a quoted reference to a token declared in `colors:`/`typography:`/`rounded:`/`spacing:` or one `px`/`em`/`rem` dimension (the last rule below). A component with no such value stays in the body only; do not write an empty head row (`button-ghost:` with nothing under it), which YAML reads as null — the linter then builds no design system at all — and which the draft gate blocks (`empty-component`).
- **Variants are flat names**, the same names as the body's `###` entries: `button-primary`, `button-primary-hover`, `button-primary-disabled`. A nested `hover:` under `button-primary` is read as one opaque value and its children are lost. The draft gate judges the map as YAML reads it, so indentation, a quoted key or a one-line `{ … }` component change nothing; it blocks a component that is not a map of properties, and a property that holds a map or a list instead of one value, or no value at all (`noncanonical-component-shape`).
- **Everything outside the eight stays in the body** — border, gap, overflow, hover transforms, shadow references. Moving a component to the map never drops a value.
- **No prose in a value.** `28 또는 32` or `top-left (10, 10)` is a note, not a token; write it in the body.
- **Colours and type are references to declared tokens**, quoted: `"{colors.primary}"`, `"{typography.display-1}"`. **Dimensions are a reference when a token exists** (`"{rounded.radius-s}"`, `"{spacing.space-1}"`) **and a `px`/`em`/`rem` value when none does** (`48px`, `0px` — see the next section; the spec's Dimension takes no other unit, so a `%`, `vw` or `dp` value stays in the body only). If no declared colour or type token holds a `backgroundColor`/`textColor`/`typography` value, do not invent one to point at: leave that property out of the map and keep it in the body. A dimension needs no token — without one it is written as its value. So every value is exactly one of two forms: **a quoted reference to a declared token, or one `px`/`em`/`rem` dimension.** The draft gate blocks every other value (`component-value-form`, #525) and names the likely cause, because the linter accepts each of them without a word: an **unquoted** reference (`backgroundColor: {colors.primary}`) is read by YAML as a map and reaches standard tools as no colour at all, a **multi-value shorthand** (`padding: 12px 16px`) and **prose** (`28 또는 32`) are kept as raw text, a **missing unit** (`height: 48`) as a bare number, and a quoted dimension, a literal colour (`oklch(…)` included) or a row with no space after the colon (`height:48px`, which YAML reads as one string) is not one of the two forms either. A reference to an undeclared key is blocked too (`unresolved-token-ref`). A reference resolves only into `colors:`, `typography:`, `rounded:` or `spacing:` — one into a catalog-only map (`"{fonts.x}"`) resolves nowhere, which the pinned linter reports as a broken reference: a warning in the draft gate (`spec-unrecorded-limitation`), a failure in CI. A shorthand or a note stays in the body only. What the gate does not see is whether a reference fits its property (`height: "{colors.primary}"`) and whether the row matches its body spec — the reviewer checks those.

The map's component count owes a `COMPONENT_COUNTS` row (Stage 10's registry list; the test file is outside this skill's write scope, so the operator adds it). Once an entry carries a component, the linter wakes two advisory rules: `orphaned-tokens` warns on every colour no component references — expected, since the catalog records the whole palette, and `pnpm validate:spec` prints it as a count — and `contrast-ratio` warns on a component's background/text pair below 4.5:1, which follows the brand's published values and is not a reason to change them.

These rules come from the first entry to carry the map (#384, `services/teamsparta.md`): ten components fit without loss using `backgroundColor`, `textColor`, `rounded` and `height`, with flat variant names, references and a unit-bearing `56px`. Its base button states, which also carry `border` or `focus`, stayed in the body only. Warnings went from 1 to 28 — 27 of them `orphaned-tokens`. #389 widened that pilot's zero-loss scope: a component with any value the map admits now gets a row carrying those, and the rest stays in the body. teamsparta is not rewritten to match.

### Dimension values carry a unit — including zero

Write `0em`, not `0`. A bare zero is valid CSS but not a valid `Dimension` under Google's spec, which accepts only `px`, `em` and `rem`; `pnpm validate:spec` reports it as an error. This applies to `tracking`/`letterSpacing` most often, since zero tracking is common.

The frontmatter token maps feed the **token-card sidecar**
(`services/{slug}.tokens.json`, generated at Stage 8 by `pnpm tokens:build` and
loaded as `doc.tokens` for the detail page's card view). The extractor reads
these maps as YAML does — how a flat map is indented or broken across lines
changes nothing, but a token indented under another token is a nested map,
which the draft gate blocks — one `name: value` entry per token: `name: oklch(...)` (colors; a named colour such
as `white` or an upper-case `OKLCH(…)` the linter reads but the sidecar drops,
so the draft gate blocks it row by row — `non-oklch-token-value`),
`name: 16px` (spacing/rounded), `name: 0 1px 2px oklch(...)` (elevation). **Typography is the exception — it nests**, as
shown above: a bare style name, then `fontSize` / `fontWeight` /
`lineHeight` / `letterSpacing` under it. Forms that set none of those four —
`name: { size, weight, … }`, `name: 16 / 24 / 700`, a whole-style alias — yield
**zero** type tokens and are blocked by the draft gate, and the extractor reads nothing in the body. A reference row whose value points at another colour
(`fill-brand: "{colors.red}"`) is carried as the colour it resolves to, with
`ref` naming the key it points at, and the Tokens tab shows it as a role card —
except the `primary` brand-colour alias, which sits with the palette (still with
its "→ key" line).
A reference that names a missing key, loops, or ends at a value that is not a
colour fails `pnpm tokens:build` — the draft gate blocks each one first. `pnpm tokens:check` compares the regenerated sidecar byte-for-byte, so
a formatting slip here fails CI rather than silently changing a card.

### Webfont source URLs (`font-*-src`)

When `## Typography` names a face that the preview runtime's bundled Pretendard does NOT cover — almost always a `font-display` set to the brand's own display typeface (e.g. Wanted Sans, Toss Product Sans) — record that webfont's loadable CSS entry-point URL on a **top-level frontmatter key** `font-display-src` (or `font-sans-src`). The stack itself goes in the `fonts:` map; the `-src` key sits beside it at column 0, which is where `findFontDisplaySrc` looks:

```yaml
fonts:
  font-display: "\"Wanted Sans Variable\", \"Wanted Sans\", \"Pretendard Variable\", system-ui, sans-serif"
font-display-src: https://cdn.jsdelivr.net/npm/wanted-sans@1.0.3/fonts/webfonts/variable/split/WantedSansVariable.css
```

The stack is quoted because it begins with a quote character — see "Every
reader reads the frontmatter as YAML does" above.

This URL is the single source of truth the **preview-html-author** loads into the preview `<head>`. Without it a brand-specific display face has no webfont to load and silently falls back to Pretendard in the preview (the gap that shipped on the wanted entry). Rules:

- Point at a **loadable CSS entry point** (`@import`/`<link>`-able), not a demo or marketing page. Prefer a foundry's **dynamic-subset / split** build where one exists (lighter for Korean pages) and a **pinned version** over `@latest` — refresh the pin alongside the catalog entry when the typeface library publishes an update.
- **Pretendard needs no `-src`** — the preview runtime already imports it. Only faces outside that baseline need a source.
- `font-*-src` is a **top-level key, outside every token map**, and the token-card extractor reads only the token maps — that is why it never appears as a bogus type card. Keep it top-level: written inside `typography:` it is not the key the preview validator's `font-display-src` check reads, so the source goes missing and the webfont `<link>` check never runs.

## Body language

Body prose is Korean (`lang: ko` — the only value): editorial register (ends with ~다, no honorifics overuse, no marketing fluff).

Section **headings stay in English** even though the body is Korean, so the structure is parseable by downstream agents that key off heading text.

## Token reference syntax (recommended)

Within prose sections (`## Components`, `## Do's and Don'ts`, `## Responsive Behavior`, etc.), reference tokens using `{group.name}` syntax:

- `{colors.primary}`, `{colors.fg-1}`
- `{typography.body-m}`, `{typography.display-l}`
- `{rounded.pill}`, `{rounded.medium}`
- `{spacing.section}`, `{spacing.lg}`
- `{component.button-primary}`, `{component.card-elevated}`

Shadows are `{elevation.shadow-1}`. Token definitions (the frontmatter `colors:` / `typography:` / `spacing:` / `rounded:` / `elevation:` maps) keep their bare key names. The `{group.name}` form is for prose references only.

**A reference must name a key that map declares.** `{rounded.pill}` is valid only when `rounded:` has a `pill:` row — when the row is `radius-pill`, write `{rounded.radius-pill}`. Fonts live in `fonts:` (`{fonts.font-heading}`), not `typography:`. No entry has a `motion:` map, so a duration or easing named in a ```` ```text ```` fence is written as a plain code span (`dur-base`). The same goes for a name the brand publishes that the entry does not tokenize, such as a role listed only in a prose table: code span, no braces. Never add a token just to make a reference resolve unless a `[src:N]` supports its value. `validate:draft` blocks an unresolved reference (`unresolved-token-ref`). What it reads:

- **Shapes.** A single key must be declared. A pattern (`{colors.gray-*}`, `{colors.color-border-{intent}}`) needs at least one declared key to match. Shorthand like `{motion.dur-fast/base/slow}` is not one reference — write each name. It blocks under a map or phantom name — so does a file list starting with a map name (`{colors.ts,fonts.ts}`); write paths separately. Under any other namespace, typo (`{colours.a/b}`) or not, it is indistinguishable from a file list or a function call and is left.
- **Namespaces.** A map name, or a typo or case slip of one (`{colours.x}`, `{Colors.x}`), is judged. `{component.*}` (a `###` heading) and `{group.*}` (the `{group.name}` placeholder that describes this syntax) are not. Neither is a capitalised name far from any map (`{Palette.x}`) nor a brace-expanded list (`{app.jsx, screens.jsx}`).
- **Fences.** Prose fences (no language, `text`, `txt`, `plain`, `plaintext`, `md`, `markdown`) and stylesheet fences (`css`, `scss`, `sass`, `less`) are read in full. Data fences (`json`, `jsonc`, `json5`) quote a publication and are not read at all — a Tokens Studio alias such as `"{spacing.4}"` belongs to that system even when the name matches. Any other language is source code: only `//`, `/* */` and `<!-- -->` comments and string literals are read. A comment is judged like prose (`// border-radius: {rounded.x}`). Inside a string literal only this catalog's map names are judged, so another system's alias quoted in code (`"{color.carrot.600}"`, `"{radius.sm}"`) is left. Bare braces there are the language's own — put JSX examples in a `tsx` fence, since a dotted reference in prose is judged even when glued (`bg={colors.x}`).
- **A lost dot.** A standalone `{typography}` naming a map this entry declares blocks. Any other bare map or phantom name, a declared key (`{primary}`) or a text-fence name used in prose (`{ease-out}`) warns (`dotless-token-ref`). A Korean particle may follow it (`{typography}로` is judged).
- **Left alone:** a dotless `{word}` glued on either side to an ASCII identifier character or to `=`/`$`/`@`/`/` (`color-{role}`, `spacing={4}`, LESS `@{name}`, `/{section}/`) or inside a source-code string (`t("{title}")`); doubled braces (`{{user.name}}`); escaped braces (`\{colors.x\}`); template interpolation (`${styles.root}`, SCSS `#{color.adjust(…)}` in a stylesheet fence); whitespace inside braces; a reference split across lines. A reference on one line inside a multi-line block comment or template literal is still read.

This syntax makes downstream LLM consumption unambiguous — "use `{colors.primary-50}` background" is mechanically resolvable to the OKLCH value, whereas "use the primary blue background" requires inference.

## Component variant decomposition (recommended)

Within `## Components`, decompose functionally distinct variants and meaningful states into separate `###` entries rather than nesting them inside one parent section.

When to decompose:
- Multiple button "kinds" (primary, secondary, danger, ghost) → each its own `###`.
- Card states with distinct visual treatment (default, elevated, selected) → each its own `###`.
- Singular components (SearchBar, Pagination, Breadcrumb) with no variant branching → keep as one `###`.

State variants (`-active`, `-focus`, `-disabled`) also live as their own entries when they have distinct token references (e.g. `button-primary-active` shifts to `{colors.primary-60}` fill).

Use the same names in the frontmatter `components:` map, so a `###` entry and its map row are found by one name.

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
