# RUBRIC — preview HTML review (12 points; pass ≥ 10)

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

## Item 6 — Responsive scaffolding (2 pts, hard requirement)

Both HTML files carry the scaffolding needed to survive narrow viewports. This is a static **presence** check — actual rendered overflow at mobile/tablet/desktop widths is caught at runtime by the skill body's Stage 12 sweep, not here.

- Both `light.html` and `dark.html` contain `<meta name="viewport" content="width=device-width, initial-scale=1">` in `<head>`.
- Each file's inline `<style>` block contains at least one `@media` query. A fixed-width demo with no breakpoints overflows on mobile — the regression class fixed in PR #77 (toss mobile component-grid overflow).

**Pass**: 2 pts if both files have the viewport meta AND at least one `@media` query each. 0 pts if either file is missing the viewport meta or has no `@media` query. No partial credit (mirrors Item 1).

**Failure modes**: viewport meta present but zero `@media` queries (fixed-width demo); light.html has breakpoints but dark.html was copy-pasted without them; assuming one desktop layout suffices because "it looked fine in the preview pane."

## Output JSON shape

```json
{
  "score": 11,
  "passed": true,
  "iteration": 1,
  "rubric": [
    {"item": "File structure", "earned": 2, "max": 2, "notes": "All structural checks pass."},
    {"item": "Color fidelity", "earned": 2, "max": 2, "notes": "All 6 colors rendered; OKLCH values match exactly."},
    {"item": "Typography hierarchy", "earned": 2, "max": 2, "notes": "Display/body/caption/micro shown with Korean sample text."},
    {"item": "Component coverage", "earned": 2, "max": 2, "notes": "EtaBanner, RiderMapPin both rendered with hover state."},
    {"item": "Light↔dark distinction", "earned": 1, "max": 2, "notes": "Dark adaptation considered, but accent swatch retained light-mode OKLCH."},
    {"item": "Responsive scaffolding", "earned": 2, "max": 2, "notes": "Both files carry the viewport meta and @media breakpoints."}
  ],
  "issues": [
    {"severity": "warn", "section": "dark.html — color swatches", "fix": "Adjust accent swatch to its dark-mode OKLCH (currently still 0.92 lightness; should be ~0.75 for dark contrast)."}
  ],
  "verdict": "Pass. One swatch missed the dark-mode adjustment; non-blocking."
}
```

`passed = score >= 10`. The skill treats the preview review loop as **non-blocking** — if score < 10 at iteration 3, the skill proceeds to BUILD_OG with a warning rather than asking the user, since visual previews iterate naturally during real use.
