# RUBRIC — preview HTML review (10 points; pass ≥ 8)

The preview-html-reviewer subagent scores `light.html` and `dark.html` against the approved `draft.md` (now `services/{slug}.md`). Reviewer reads only — no edits.

## Item 1 — File structure (2 pts, hard requirement)

Both HTML files exist and conform:

- `<html lang="{ko|en}" data-theme="{light|dark}">` — `data-theme` matches the filename (`light.html` → `data-theme="light"`, etc.).
- `<link rel="stylesheet" href="/preview/_runtime/tokens.css">` — absolute path, not relative or under `{slug}/_runtime/`.
- `<script src="/preview/_runtime/iframe.js" defer></script>` — required for the parent route to grow the iframe to fit content.
- All page CSS is in a single inline `<style>` block (no external stylesheets beyond tokens.css).
- No external JS frameworks (no React, no jQuery — these are static HTML pages).
- File size < 100KB each.
- If the orchestrator passes `expected_logo_src_path` (or design.md frontmatter includes `logo`), both HTML files must contain a `<img src="{expected_logo_src_path}">` rendered in a visible brand/hero position. The required form is **site-relative** (e.g. `/logos/toss.png`) — NOT the absolute URL (`https://getdesign.kr/logos/toss.png`) that design.md frontmatter stores. Preview HTML lives inside the catalog site's iframe, so site-relative is correct; the absolute URL exists only in frontmatter so that copied design.md files stay meaningful outside the site.

**Pass**: 2 pts if all checks pass. 0 pts if any structural element missing or wrong path. No partial credit.

**Failure modes**: writing `tokens.css` as a relative path; creating a per-slug `_runtime/` folder (the runtime is shared); adding `<script src="https://cdn.../react.js">`; frontmatter says `logo: https://getdesign.kr/logos/toss.png` but light.html or dark.html omits the `<img src="/logos/toss.png">` site-relative form (or worse, embeds the absolute URL itself in `<img src>`).

## Item 2 — Color fidelity (2 pts)

Every color value listed in `## Colors` of the design.md is rendered as a swatch somewhere in the preview. The swatch's actual CSS color value matches the design.md token's OKLCH expression character-for-character (no rounding, no rgb conversion).

**Pass criteria**:
- 2 pts: every documented color has a swatch with exact OKLCH match; semantic roles (primary, accent, surface, text) are visually demonstrated.
- 1 pt: most colors present but one or two missing or with drifted values.
- 0 pts: ≥ 3 colors missing, or values converted to hex/rgba.

**Failure modes**: dropping the `accent` swatch because "it didn't fit the layout"; converting `oklch(0.7 0.18 50)` to `#E69245` in inline style.

## Item 3 — Typography hierarchy (2 pts)

A typography section exists demonstrating the documented scale (display, body, caption, micro at minimum). Pretendard Variable is applied (inherited from tokens.css `body` rule). Tabular-nums (`font-feature-settings: "tnum"`) used wherever the design.md specifies.

**Pass criteria**:
- 2 pts: full scale shown with documented sizes/weights; Pretendard Variable rendering; sample uses real Korean text for `lang: ko` previews to verify Korean fallback chain.
- 1 pt: scale shown but missing one tier or wrong weight.
- 0 pts: single text block; system font; English-only sample for a Korean-lang doc.

**Failure modes**: showing only one heading and one paragraph; using `font-family: -apple-system` somewhere that overrides Pretendard.

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
- All swatches in the typography/color sections are updated to dark-mode values.
- Text remains comfortably legible (WCAG AA contrast at minimum).

**Pass criteria**:
- 2 pts: dark.html shows considered dark adaptation; primary still recognizable but contrast-adjusted; no text below WCAG AA.
- 1 pt: dark.html exists and is distinct, but one or two swatches forgotten in light values, or contrast borderline.
- 0 pts: dark.html is identical to light.html, or just has `body { background: black; color: white }` without per-token thinking.

**Failure modes**: copy-pasting light.html and only flipping `background` and `color`; leaving the primary swatch at its light-mode OKLCH; illegible accent text on dark.

## Mobile overflow (advisory static check — emits `warn` issues, does NOT change the 10-point score)

The reviewer reads CSS only and cannot render at 375px, so this is a STATIC scan of the inline `<style>` block, not a measured check. It adds **no points** — the score stays out of 10 across Items 1–5. Instead, append one `warn` issue per distinct violation so the author fixes it on the next pass. Every horizontal-overflow bug shipped so far reduced to a CSS Grid `1fr` track flooring at `min-content`; scan for these four patterns:

- **Multi-column grid with no mobile collapse.** A `grid-template-columns` declaring 2+ tracks with no `@media (max-width: …)` override reducing the column count. Footer, swatch grid, and hero split are the usual offenders.
- **Bare `1fr` on a content-bearing grid.** `1fr` / `repeat(n, 1fr)` (instead of `minmax(0, 1fr)`) on a track holding wide content (token strings, device mocks). Skip if the same selector also has a mobile rule collapsing it to one column.
- **Flex/grid item with a fixed-width child but no `min-width: 0`.** A container that is itself a grid/flex item and wraps a device/phone mock, an `<img>`, or a `white-space: nowrap` label.
- **Generic class-name collision.** The same single-word class (`.brand`, `.card`, `.item`) used both as a standalone selector and in a compound selector (e.g. `.brand` AND `.swatch.brand`) — the standalone rule's `display`/`white-space`/`gap` leak onto the compound element.

Emit each as e.g. `{"severity":"warn","section":"footer grid","fix":"`.brand-footer` declares 4 columns with no mobile collapse; add a `@media (max-width:720px)` override to 1–2 columns + `min-width:0` on items."}`. These are **non-blocking** (the whole preview review is non-blocking), but compounding — a preview that overflows at 375px reads as broken on the device most catalog users browse from, so surface them even when the 10-point score passes.

## Output JSON shape

```json
{
  "score": 9,
  "passed": true,
  "iteration": 1,
  "rubric": [
    {"item": "File structure", "earned": 2, "max": 2, "notes": "All structural checks pass."},
    {"item": "Color fidelity", "earned": 2, "max": 2, "notes": "All 6 colors rendered; OKLCH values match exactly."},
    {"item": "Typography hierarchy", "earned": 2, "max": 2, "notes": "Display/body/caption/micro shown with Korean sample text."},
    {"item": "Component coverage", "earned": 2, "max": 2, "notes": "EtaBanner, RiderMapPin both rendered with hover state."},
    {"item": "Light↔dark distinction", "earned": 1, "max": 2, "notes": "Dark adaptation considered, but accent swatch retained light-mode OKLCH."}
  ],
  "issues": [
    {"severity": "warn", "section": "dark.html — color swatches", "fix": "Adjust accent swatch to its dark-mode OKLCH (currently still 0.92 lightness; should be ~0.75 for dark contrast)."}
  ],
  "verdict": "Pass. One swatch missed the dark-mode adjustment; non-blocking."
}
```

`passed = score >= 8`. The skill treats the preview review loop as **non-blocking** — if score < 8 at iteration 3, the skill proceeds to BUILD_OG with a warning rather than asking the user, since visual previews iterate naturally during real use.
