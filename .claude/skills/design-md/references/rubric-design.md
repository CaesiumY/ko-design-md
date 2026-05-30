# RUBRIC — design.md review (10 points; pass ≥ 8)

The design-md-reviewer subagent uses this rubric to score `draft.md` against `research.md`. Output is a `review-{N}.json` with per-item scores and issues. The reviewer never edits the draft — only scores and explains.

## Item 1 — Schema validity (3 pts, hard requirement)

Frontmatter must round-trip through `buildDoc()` in `src/lib/content-parser.ts` without throwing. Concretely:

- All required keys present: `name, slug, category, last_updated, sources, related_services, lang`.
- `name` is the Korean company/brand display name. If the design system has a distinct public name, `design_system_name` may be present as an optional string and is not a hard-fail requirement.
- `category` ∈ `CATEGORIES` const from `src/lib/content-types.ts` (one of: finance, messenger, commerce, delivery, mobility, content, community, travel, gov, developer, education, career, etc).
- `last_updated` matches `^\d{4}-\d{2}-\d{2}$`. The validator at content-parser.ts:158-171 throws on any other format.
- `sources` is a non-empty array of `https?://` URLs.
- `slug` matches `^[a-z0-9-]+$` and equals the staging filename stem (e.g. draft.md for slug X has frontmatter `slug: X`).
- `lang` is exactly `ko` or `en`.
- `logo` remains optional overall, but if the orchestrator passes an **Expected logo** (`expected_logo_url`) other than `none`, frontmatter must include `logo` and it must equal that exact URL string. If `logo` is present without an Expected logo, it must be a fully-qualified URL starting with `https://getdesign.kr/logos/` and ending in `.svg`, `.png`, `.webp`, or `.avif`. Bare `/logos/...` site-relative paths are rejected — frontmatter values must stay meaningful when the design.md is copied outside the ko-design-md site.

**Failure modes**: typo'd key (`last-updated` instead of `last_updated`), Date object instead of string (gray-matter parses unquoted dates as Date), off-enum category (`fintech`, `media`), empty `sources: []`, slug with capitals or underscores, expected logo `https://getdesign.kr/logos/toss.png` omitted from frontmatter or downgraded to a site-relative `/logos/toss.png`.

This item is **hard-fail**: if any sub-check fails, deduct the full 3 pts and mark `severity: block` in the issue list. The skill body refuses to advance to the user checkpoint without a valid frontmatter.

## Item 2 — Stitch section coverage (2 pts)

All 10 standard sections present in order: `## Brand & Style`, `## Colors`, `## Typography`, `## Spacing`, `## Rounded`, `## Elevation & Depth`, `## Shapes`, `## Components`, `## Do's and Don'ts`, `## References`. Each section must contain ≥ 2 sentences of substantive content (or, for genuinely unknown information, one short explanatory line per stitch-format.md).

**Pass criteria**:
- 2 pts: all 10 sections present in order, each ≥ 2 sentences (or a documented gap line).
- 1 pt: 9 of 10 sections, or one section is a 1-sentence stub.
- 0 pts: ≥ 2 sections missing or full of `TODO`/placeholder text.

**Failure modes**: dropping `## Shapes` because "the brand doesn't really have a shape language" (write the gap line instead); writing `TODO: figure this out` in a section; reordering sections.

## Item 3 — Token consistency (2 pts)

Color values are expressed in OKLCH only (inside backticks or fenced ```yaml blocks). Typography references match across all mentions of the same role. Radius and spacing values are concrete numbers, not vague descriptors.

**Pass criteria**:
- 2 pts: all colors OKLCH; typography names consistent (e.g. "Pretendard Variable" not also "Pretendard"); spacing/radius numerical (`16px`, not "약간 둥근").
- 1 pt: one or two minor inconsistencies (e.g. one color in hex, mixed font name spelling).
- 0 pts: hex/rgba colors anywhere; contradicting numbers between sections.

**Failure modes**: `## Colors` says primary is `oklch(0.7 0.18 50)` but `## Components` references `#FF8800`; `## Typography` calls it "Pretendard" in one place and "Pretendard Variable" in another.

## Item 4 — Brand fidelity (2 pts)

Every concrete claim in the draft (specific colors, named components, screen descriptions) traces back to a `[src:N]` citation in `research.md`. No invented component names. No facts that contradict research.md.

Inferred-from-screenshots values (when no public design system exists) are acceptable but must be marked with `≈` and a short note:

```markdown
- **primary** ≈ `oklch(0.62 0.18 250)` (값은 공개된 토큰이 없어 캡처에서 추정)
```

**Pass criteria**:
- 2 pts: every claim either cited or marked `≈`; no contradictions with research.md.
- 1 pt: one or two uncited specifics, or one minor contradiction.
- 0 pts: invented components, fabricated brand history, or systematic divergence from research.md.

**Failure modes**: claiming the brand has a "Hero" component that research.md never mentions; inventing OKLCH values to make prose flow without marking them `≈`; citing research.md for one section then ignoring it for another.

## Item 5 — Voice/tone (1 pt)

Body prose matches `lang`:
- `ko`: editorial register ending with ~다, no honorifics, no marketing fluff ("혁신적인", "차세대"), no chatbot tone ("~해보세요!").
- `en`: plain editorial, no second-person sales tone, no marketing buzzwords.

**Pass**: voice is consistent throughout, matches the relevant register.
**Fail**: any section reads like marketing copy or chatbot output.

## Output JSON shape

```json
{
  "score": 8,
  "passed": true,
  "iteration": 1,
  "rubric": [
    {"item": "Schema validity", "earned": 3, "max": 3, "notes": "All keys present and valid."},
    {"item": "Stitch section coverage", "earned": 2, "max": 2, "notes": "All 10 sections present with substantive content."},
    {"item": "Token consistency", "earned": 1, "max": 2, "notes": "## Components mentions 'rounded' without a px value."},
    {"item": "Brand fidelity", "earned": 2, "max": 2, "notes": "All claims cited."},
    {"item": "Voice/tone", "earned": 1, "max": 1, "notes": "Korean editorial register held throughout."}
  ],
  "issues": [
    {"severity": "warn", "section": "Components", "fix": "Replace 'rounded' with a concrete radius value (e.g. `12px`) consistent with `## Rounded`."}
  ],
  "verdict": "Pass with one minor warning. Components section should align radius vocabulary with the Rounded section."
}
```

`passed = score >= 8`. Reviewer must include all 5 rubric items even if 0 pts. `issues[].severity` is `block` (must fix to pass) or `warn` (should fix but not blocking).
