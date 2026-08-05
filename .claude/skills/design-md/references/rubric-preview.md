# RUBRIC — preview HTML review (10 points; pass ≥ 8)

The preview-html-reviewer subagent scores `light.html` and `dark.html` against the approved `draft.md` (now `services/{slug}.md`). Reviewer reads only — no edits.

## Item 1 — File structure (2 pts, hard requirement)

Both HTML files exist and conform:

- `<html lang="{ko|en}" data-theme="{light|dark}">` — `data-theme` matches the filename (`light.html` → `data-theme="light"`, etc.).
- `<link rel="stylesheet" href="/preview/_runtime/tokens.css">` — absolute path, not relative or under `{slug}/_runtime/`.
- `<script src="/preview/_runtime/iframe.js" defer></script>` — required for the parent route to grow the iframe to fit content.
- All page CSS is in a single inline `<style>` block (no external stylesheets beyond tokens.css).
- No external JS frameworks (no React, no jQuery — these are static HTML pages).
- Transfer size within budget. The gate measures **brotli** bytes, not raw — Vercel serves these files with `content-encoding: br`, so raw size was never the transfer cost. Repetitive markup compresses to nearly nothing; inline binary payloads (base64 `data:` images, embedded fonts) do not compress and cost their full size. The hard caps are **40 KiB brotli** and, as a safety net against generated markup that has run away, **256 KiB raw**. A separate **24 KiB brotli budget is advisory** — the gate emits a `warn` for it, and a warn never costs this item's 2 points; only a block does. Without a machine report you cannot compute brotli, so judge the payload instead: measured across the catalog when the gate switched to brotli (PR #221), previews ran 5–18 KiB brotli from 22–107 KiB of source (15–23%). A file that inlines no `data:` asset and stays under roughly 150 KiB of source is inside both hard caps.
- If the orchestrator passes `expected_logo_src_path` (or design.md frontmatter includes `logo`), both HTML files must contain a `<img src="{expected_logo_src_path}">` rendered in a visible brand/hero position. The required form is **site-relative** (e.g. `/logos/toss.png`) — NOT the absolute URL (`https://getdesign.kr/logos/toss.png`) that design.md frontmatter stores. Preview HTML lives inside the catalog site's iframe, so site-relative is correct; the absolute URL exists only in frontmatter so that copied design.md files stay meaningful outside the site.
- Both files carry the catalog disclosure strip — `<div class="catalog-disclaimer" role="note">` as the **first child of `<body>`**, verbatim, carrying both `제휴·후원 관계가 없습니다` and `더미 데이터`. It cannot be injected at runtime (`iframe.js` returns early when `window.parent === window`), so a standalone open or a redistributed copy sees only what is in the file. Position counts: the strip has to land in the first screen and in the hero crop a screenshot takes.

**Pass**: 2 pts if all checks pass. 0 pts if any structural element missing or wrong path. No partial credit.

**Failure modes**: writing `tokens.css` as a relative path; creating a per-slug `_runtime/` folder (the runtime is shared); adding `<script src="https://cdn.../react.js">`; inlining the hero image as a base64 `data:` URI, or embedding a webfont as `@font-face { src: url(data:font/woff2;base64,…) }` instead of `<link>`-ing it — base64 is the one payload in these files that brotli cannot recover, and it is what the size cap exists to catch; frontmatter says `logo: https://getdesign.kr/logos/toss.png` but light.html or dark.html omits the `<img src="/logos/toss.png">` site-relative form (or worse, embeds the absolute URL itself in `<img src>`); the disclosure strip is absent, reworded, moved below the hero, or reduced to one of its two sentences.

## Item 2 — Color fidelity (2 pts)

The preview is a **component demo**, not a swatch catalog — the standalone color-swatch grid moved to the token cards (`{slug}.tokens.json`, rendered on the detail page). Color fidelity is therefore checked in **application**: the documented `## Colors` are declared as CSS custom properties (inline `:root` or inherited from tokens.css) and the brand/semantic roles (primary, accent, surface, text, state colors) are visibly applied to components with their exact OKLCH expression — character-for-character, no rounding, no hex/rgb conversion.

**Pass criteria**:
- 2 pts: the documented palette is declared as tokens and the key roles (primary, accent, surface, text) are applied to real components with exact OKLCH values.
- 1 pt: colors applied but one or two roles hardcoded as hex/rgb, or a documented role unused anywhere.
- 0 pts: ≥ 3 roles missing/unused, or values converted to hex/rgba in component styles.

**Failure modes**: rebuilding a color-swatch showcase grid (that catalog belongs in the token cards, not the preview); hardcoding `#E69245` in a button instead of the documented `oklch(0.7 0.18 50)` token.

## Item 3 — Typography hierarchy (2 pts)

No standalone type-scale showcase — the documented scale lives in the token cards. Typography is checked in **application**: the component demo renders text across the documented hierarchy (display/heading, body, caption at minimum) at the documented sizes/weights. Pretendard Variable is applied to body text (inherited from tokens.css `body` rule). Tabular-nums (`font-feature-settings: "tnum"`) used wherever the design.md specifies.

**Display face check**: if the design.md `## Typography` defines a `font-display` distinct from the body face (first family is not Pretendard) together with a `font-display-src`, the preview must (a) load that webfont via a `<link>` in the `<head>` of BOTH files and (b) apply it to the hero headline (`.hero h1`, via `var(--*-font-display)` or the stack). A documented brand display face that renders in Pretendard because the webfont link or stack was omitted is a fidelity miss. When the design.md has only one sans face, this check is N/A (Pretendard from tokens.css is correct).

**Pass criteria**:
- 2 pts: hierarchy visible across components at documented sizes/weights; body in Pretendard Variable and any documented `font-display-src` brand face loaded + applied to the hero headline; sample uses real Korean text for `lang: ko` previews to verify Korean fallback chain.
- 1 pt: hierarchy present but one tier unused or wrong weight.
- 0 pts: single flat text size; system font; English-only sample for a Korean-lang doc.

**Failure modes**: rebuilding a typography-scale showcase section (that belongs in the token cards); using `font-family: -apple-system` somewhere that overrides Pretendard; a design.md `font-display` brand face (e.g. Wanted Sans) that never loads — no `<head>` webfont `<link>`, hero headline left rendering in Pretendard; loading the display webfont via `@import` instead of `<link>` (functional, but `<link>` is required for parallel load — emit a `warn`).

## Item 4 — Component coverage (2 pts)

Each component named in `## Components` of the design.md is visibly rendered in the preview, with documented variants and states (hover, active, disabled where applicable).

**Pass criteria**:
- 2 pts: every named component rendered; primary variant + at least one state variation per interactive component.
- 1 pt: most components present but one missing or showing only a default state.
- 0 pts: ≥ 2 named components absent.

**Failure modes**: naming `EtaBanner` and `RiderMapPin` in design.md but only rendering generic buttons; showing buttons but no hover/disabled states.

## Item 5 — Light↔dark distinction (2 pts)

`dark.html` uses brand-appropriate dark variants — not a literal inversion of `light.html`. Specifically:

- Surface colors shift to dark variants chosen to match the brand mood (e.g. a warm brand uses a warm dark, not gray).
- Primary color lightness is adjusted +5–10 (or whatever is needed) for sufficient contrast against the dark surface.
- All component surfaces, text, and accents are updated to dark-mode token values.
- Text remains comfortably legible (WCAG AA contrast at minimum).

**Pass criteria**:
- 2 pts: dark.html shows considered dark adaptation; primary still recognizable but contrast-adjusted; no text below WCAG AA.
- 1 pt: dark.html exists and is distinct, but one or two tokens forgotten in light values, or contrast borderline.
- 0 pts: dark.html is identical to light.html, or just has `body { background: black; color: white }` without per-token thinking.

**Failure modes**: copy-pasting light.html and only flipping `background` and `color`; leaving the primary at its light-mode OKLCH; illegible accent text on dark.

## Mobile overflow (advisory static check — emits `warn` issues, does NOT change the 10-point score)

The reviewer reads CSS only and cannot render, so this is a STATIC scan of the inline `<style>` block, not a measured check. It adds **no points** — the score stays out of 10 across Items 1–5. Instead, append one `warn` issue per distinct violation so the author fixes it on the next pass. Overflow does NOT live only at 375px — it hides in the intermediate multi-column widths and at the ~976px detail-page embed width (a 3-tab segmented control fit a 1-column phone cell yet overflowed every 4-column desktop cell), so flag a risk even when a phone collapse rule exists. The recurring causes are a CSS Grid `1fr` track flooring at `min-content` and an atomic `inline-flex` control group whose `nowrap` children can't shrink; scan for these five patterns:

- **Multi-column grid with no mobile collapse.** A `grid-template-columns` declaring 2+ tracks with no `@media (max-width: …)` override reducing the column count. Footer, swatch grid, and hero split are the usual offenders.
- **Bare `1fr` on a content-bearing grid.** `1fr` / `repeat(n, 1fr)` (instead of `minmax(0, 1fr)`) on a track holding wide content (token strings, device mocks). Skip if the same selector also has a mobile rule collapsing it to one column.
- **Flex/grid item with a fixed-width child but no `min-width: 0`.** A container that is itself a grid/flex item and wraps a device/phone mock, an `<img>`, or a `white-space: nowrap` label.
- **Atomic `inline-flex`/`flex` control group with `nowrap` children and no shrink guard.** A segmented control, toggle group, or button/pill row (`.seg`, `.tg-group`, `.btn-group`, `.tabs`) whose buttons are `white-space: nowrap` while the group itself lacks `max-width: 100%` + `min-width: 0` (and its children lack `min-width: 0`). The group is one un-wrappable flex item, so a parent's `flex-wrap`/`min-width:0` cannot contain it — it overflows the cell at multi-column widths even when 375px is clean. Also flag a `flex: 1` + `white-space: nowrap` + `text-overflow: ellipsis` child missing `min-width: 0` (the ellipsis never fires and the track overflows).
- **Generic class-name collision.** The same single-word class (`.brand`, `.card`, `.item`) used both as a standalone selector and in a compound selector (e.g. `.brand` AND `.swatch.brand`) — the standalone rule's `display`/`white-space`/`gap` leak onto the compound element.

Emit each as e.g. `{"severity":"warn","section":"footer grid","fix":"`.brand-footer` declares 4 columns with no mobile collapse; add a `@media (max-width:720px)` override to 1–2 columns + `min-width:0` on items."}`. These are **non-blocking** (the whole preview review is non-blocking), but compounding — a preview that overflows at 375px reads as broken on the device most catalog users browse from, so surface them even when the 10-point score passes.

## Dummy-data labelling (advisory content check — emits `warn` issues, does NOT change the 10-point score)

The disclosure strip itself is Item 1 (structural, machine-checked). This block is
the part a machine cannot check: **whether each caption actually enumerates what
its block fabricates.** `validate:previews` verifies the label literals exist; only
a reader can tell whether the label is complete. Adds **no points** — append one
`warn` per gap.

For every block that shows invented values attached to a real, named third party
(a brand, a company, a product, a person, a public body), check:

- **Is there a label at all?** A `catalog-dummy` `<p>` immediately before the block
  in the same container, or a `<caption>` as the table's first child. A table inside
  an `overflow-x` wrapper must use the `<p>` form — a caption box takes the table's
  width, not the scroller's, so the sentence runs off screen at phone widths.
- **Is the label outside the mocked UI?** It must not sit inside a phone mockup's
  `.screen`. It is the catalog's voice, not the mocked app's.
- **Does the enumeration cover the claims, not just the numbers?** This is the one
  that gets missed. Prices, ratings, and counts are the easy half; badges,
  certifications, rankings, and identifiers are fabricated claims too — `공식`
  (seller verification), `베스트` (bestseller rank), `국비지원` (government-funded
  course), an invoice number attached to a real courier, a merchant name on a
  transaction row. Read the block's rendered text and compare item by item.
- **Does the label read as an observation, not a norm?** "…는 레이아웃 시연용 더미
  데이터입니다" describes the screen. A caption that instead asserts what the brand
  *does* is an unsourced claim about a real company and belongs in design.md with a
  `[src:N]`, not here.

Emit each as e.g. `{"severity":"warn","section":"kyobobook — device mock","fix":"The caption lists prices and delivery badges but the screen also shows a `베스트` rank badge and a 9.6 rating with 2,481 reviews; add those to the enumeration."}`.

## Output JSON shape

```json
{
  "score": 9,
  "passed": true,
  "iteration": 1,
  "rubric": [
    {"item": "File structure", "earned": 2, "max": 2, "notes": "All structural checks pass."},
    {"item": "Color fidelity", "earned": 2, "max": 2, "notes": "All 6 documented colors applied across components; OKLCH values match exactly."},
    {"item": "Typography hierarchy", "earned": 2, "max": 2, "notes": "Display/body/caption hierarchy applied across components with Korean sample text."},
    {"item": "Component coverage", "earned": 2, "max": 2, "notes": "EtaBanner, RiderMapPin both rendered with hover state."},
    {"item": "Light↔dark distinction", "earned": 1, "max": 2, "notes": "Dark adaptation considered, but accent retained light-mode OKLCH."}
  ],
  "issues": [
    {"severity": "warn", "section": "dark.html — accent color", "fix": "Adjust the accent token to its dark-mode OKLCH (currently still 0.92 lightness; should be ~0.75 for dark contrast)."}
  ],
  "verdict": "Pass. One swatch missed the dark-mode adjustment; non-blocking."
}
```

`passed = score >= 8`. The skill treats the preview review loop as **non-blocking** — if score < 8 at iteration 3, the skill proceeds to BUILD_OG with a warning rather than asking the user, since visual previews iterate naturally during real use.
