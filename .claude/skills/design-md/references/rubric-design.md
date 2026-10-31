# RUBRIC — design.md review (10 points; pass ≥ 8)

The design-md-reviewer subagent uses this rubric to score `draft.md` against `research.md`. Output is a `review-{N}.json` with per-item scores and issues. The reviewer never edits the draft — only scores and explains.

## Item 1 — Schema validity (3 pts, hard requirement)

Frontmatter must read as YAML and give the site's build values it accepts (`src/lib/site-frontmatter.ts` — the build fails on a key the site reads written with no value). Concretely:

- All required keys present: `name, slug, category, last_updated, created_at, lang`. There is no `sources` key — `## References` is the only source list.
- `name` is the Korean company/brand display name. If the design system has a distinct public name, `design_system_name` may be present as an optional string and is not a hard-fail requirement.
- `category` ∈ `CATEGORIES` const from `src/lib/content-types.ts` (one of: finance, messenger, commerce, delivery, mobility, content, community, travel, gov, developer, education, career, etc).
- `last_updated` matches `^\d{4}-\d{2}-\d{2}$` and is a real calendar day. The site's build refuses any other value.
- `created_at` is present and matches `^\d{4}-\d{2}-\d{2}$` — for a new entry it equals `last_updated`. This is the catalog's ordering key (the list, llms.txt, sitemap and OG build all sort by it), so omitting it is a block, not a nit: the entry would sink to the bottom of the list regardless of when it was added.
- `## References` lists at least one public URL, **with no ephemeral/private handoff-bundle links** — no `api.anthropic.com/v1/design/h/...` URL, no local `.claude/cache/...` path. **Every entry must be an externally-accessible public URL** — label-only / ephemeral placeholder entries are NOT allowed (a source readers cannot open is not a valid source). If a claim's only basis is an ephemeral/private source, drop the citation rather than keeping a label-only entry. Enforced by `src/lib/source-citations.ts` (`pnpm validate:sources`).
- `slug` matches `^[a-z0-9-]+$` and equals the staging filename stem (e.g. draft.md for slug X has frontmatter `slug: X`).
- `lang` is exactly `ko` — an entry is one Korean design.md.
- `logo` is required — every catalog entry carries a logo (a square symbol preferred; an app-store app icon or a user-confirmed wordmark are the allowed fallbacks per SKILL.md **Logo candidates**, not defects), and `validate:draft` blocks a draft without it (`missing-logo`). When the orchestrator passes an **Expected logo** (`expected_logo_url`), frontmatter `logo` must equal that exact URL string. If `logo` is present without an Expected logo, it must be a fully-qualified URL starting with `https://getdesign.kr/logos/` and ending in `.svg`, `.png`, `.webp`, or `.avif`. Bare `/logos/...` site-relative paths are rejected — frontmatter values must stay meaningful when the design.md is copied outside the ko-design-md site.

**Failure modes**: typo'd key (`last-updated` instead of `last_updated`), Date object instead of string (not reachable through the frontmatter reader this item scores — the `yaml` 1.2 parser it uses keeps an unquoted ISO date as a string; the risk is a copy re-parsed outside the ko-design-md site by a YAML 1.1 parser such as js-yaml, which reads an unquoted ISO date as a Date. The template quotes both dates), off-enum category (`fintech`, `media`), an empty `## References`, an `api.anthropic.com/v1/design/h/...` handoff link (or `.claude/cache/...` path) left in `## References`, a leftover frontmatter `sources` list, slug with capitals or underscores, expected logo `https://getdesign.kr/logos/toss.png` omitted from frontmatter or downgraded to a site-relative `/logos/toss.png`.

This item is **hard-fail**: if any sub-check fails, deduct the full 3 pts and mark `severity: block` in the issue list. The skill body refuses to advance to the user checkpoint without a valid frontmatter.

## Item 2 — Stitch section coverage (2 pts)

All 10 standard sections present in order: `## Brand & Style`, `## Colors`, `## Typography`, `## Spacing`, `## Rounded`, `## Elevation & Depth`, `## Shapes`, `## Components`, `## Do's and Don'ts`, `## References`. Each section must contain ≥ 2 sentences of substantive content (or, for genuinely unknown information, one short explanatory line per stitch-format.md).

`## Do's and Don'ts` must carry at least one brand-specific **domain-boundary Don't**. When frontmatter has a `design_system_name` (or `name`/`slug` is itself a design system — e.g. KRDS), it must *also* carry a **vendor-neutrality Don't** forbidding the system's own name / package names / class prefixes in the consumer's generated UI (per stitch-format.md §9). A slug ending in `-design`, `-design-system`, `-ds` is a *secondary hint only* — do not raise this warn for a coincidental slug (`kids-design-studio`) that isn't genuinely a reusable design system. A missing vendor-neutrality Don't on a genuine design-system entry is a `warn` issue.

**Pass criteria**:
- 2 pts: all 10 sections present in order, each ≥ 2 sentences (or a documented gap line).
- 1 pt: 9 of 10 sections, or one section is a 1-sentence stub.
- 0 pts: ≥ 2 sections missing or full of `TODO`/placeholder text.

**Failure modes**: dropping `## Shapes` because "the brand doesn't really have a shape language" (write the gap line instead); writing `TODO: figure this out` in a section; reordering sections.

## Item 3 — Token consistency (2 pts)

Color values are expressed in OKLCH only — declared in the frontmatter `colors:` map, referenced inside backticks in prose. The brand's published hex may appear only as a trailing `#` comment on the token's own line. Typography references match across all mentions of the same role. Radius and spacing values are concrete numbers, not vague descriptors. The frontmatter `components:` map and the body's `## Components` spec are two copies of one spec (stitch-format.md, "Component tokens in the frontmatter `components:` map"): every map row must agree with the `###` entry of the same name, and a body component with any value the map admits should have its row, carrying those of its values the map's rules admit (a colour or type value with no declared token to point at stays in the body; a dimension without one is written as its `px`/`em`/`rem` value) — a mismatch is a contradicting number between sections.

**Pass criteria**:
- 2 pts: all colors OKLCH; typography names consistent (e.g. "Pretendard Variable" not also "Pretendard"); spacing/radius numerical (`16px`, not "약간 둥근"); every body component with a value the map admits (stitch-format.md: a value among the eight that is a quoted reference to a token declared in `colors:`/`typography:`/`rounded:`/`spacing:` or one `px`/`em`/`rem` dimension) has a `components:` row that agrees with it.
- 1 pt: one or two minor inconsistencies (e.g. one color in hex, mixed font name spelling); or such components left out of the `components:` map — no machine check catches a missing map yet, so raise it as a `warn` issue naming the components.
- A `components:` row whose value is not exactly a quoted reference (`"{colors.x}"`) or one `px`/`em`/`rem` dimension (`48px`) is a `block` issue whatever the score — an unquoted reference (`{colors.x}`), a multi-value shorthand (`12px 16px`), a missing unit (`48`), prose (`28 또는 32`) or anything else. The draft gate blocks every such row (`component-value-form`, #525), as it does a property outside the eight (`unknown-component-property`) and a head row with no property (`empty-component`); mirror its finding as a `block` issue.
- When `research.md` shows the brand publishes a role layer on top of its palette, the draft must carry it as stitch-format.md, "Role → palette reference rows", requires — a `## Colors` role table **and** a reference row for each role that section says gets one. Judge "published" and "gets a row" by that section, not by this summary. A layer written only in prose or token-line comments, a role the upstream points at a palette step carried only as that step's literal value, a missing table, or a missing row for a role that gets one is a `block` issue whatever the score. A table whose roles all stay out of the rows for the reasons that section gives (an opacity ramp, nothing upstream to point at) is not a defect. Nothing machine-checks a layer the draft leaves out, so this is yours.
- Theme pairs — palette, roles, shadows alike — name the dark side with the `dark-` prefix and leave the light side's name bare: no `…-dark` / `…-light` suffix on either. No machine check holds this (a guard was tried in #636 and dropped for false positives), so a suffixed pair is a `block` issue whatever the score.
- 0 pts: hex/rgba colors anywhere; contradicting numbers between sections.

**Failure modes**: `## Colors` says primary is `oklch(0.7 0.18 50)` but `## Components` references `#FF8800`; `## Typography` calls it "Pretendard" in one place and "Pretendard Variable" in another.

## Item 4 — Brand fidelity (2 pts)

Every concrete claim in the draft (specific colors, named components, screen descriptions) traces back to a `[src:N]` citation in `research.md`. No invented component names. No facts that contradict research.md.

Inferred-from-screenshots values (when no public design system exists) are acceptable but must be marked with `≈` and a short note:

```markdown
- **primary** ≈ `oklch(0.62 0.18 250)` (값은 공개된 토큰이 없어 캡처에서 추정)
```

The same applies to a value research cites as `[src:board:…]` — taken from the design board the user approved, with no public URL behind it. There `≈` marks "no public source" rather than an estimate, and the note says which (`≈ 보드 판독 · 공개 출처 없음`). Either way the claim is acceptable without a `[src:N]`, and it must not be given one.

**Pass criteria**:
- 2 pts: every claim either cited or marked `≈`; no contradictions with research.md.
- 1 pt: one or two uncited specifics, or one minor contradiction.
- 0 pts: invented components, fabricated brand history, or systematic divergence from research.md.

**Failure modes**: claiming the brand has a "Hero" component that research.md never mentions; inventing OKLCH values to make prose flow without marking them `≈`; citing research.md for one section then ignoring it for another.

## Item 5 — Voice/tone (1 pt)

Body prose is Korean editorial register: ending with ~다, no honorifics, no marketing fluff ("혁신적인", "차세대"), no chatbot tone ("~해보세요!").

**Pass**: voice is consistent throughout, matches that register.
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
