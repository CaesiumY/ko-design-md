---
name: design-md
metadata:
  internal: true
description: Add a new design.md catalog entry to ko-design-md. Use this skill IMMEDIATELY when the user wants to onboard a new brand into THIS project's catalog — produce services/{slug}.md (Stitch v0.1 format) plus services/{slug}.tokens.json (token-card sidecar) plus public/preview/{slug}/{light,dark}.html plus the OG image. Trigger phrases include "add to design.md catalog", "new design.md entry for X", "onboard X to ko-design-md", "X를 ko-design-md에 추가", "X의 design.md 만들어줘", "/design-md", "X 카탈로그 항목 만들기", or any variant where the user is asking to populate this catalog with a new brand entry. Do NOT use for editing prose in an existing entry, fixing one frontmatter field, generating non-catalog design docs, or working in any other repository. The skill operates only inside the ko-design-md repo and verifies this via `package.json` name.
---

# /design-md skill — orchestration body

This skill builds a complete catalog entry through a 5-subagent pipeline with one user checkpoint. The pipeline is heavy (research, drafting, two review loops) so resumability matters: each stage's artifact lives on disk in `.claude/cache/design-md/{slug}/` and the next stage reads from there. State is encoded by file presence — no separate state.json needed for v1.

## Pipeline shape

```
[INTAKE] → research-collector → design-md-author ⇄ design-md-reviewer (loop ≤3)
                                                          ↓ score≥8 or N=3
                                                    [USER CHECKPOINT]
                                                          ↓ approve
                                                [WRITE_MD] → [TOKENS]
                                                          ↓
                                  preview-html-author ⇄ preview-html-reviewer (loop ≤3, non-blocking)
                                                          ↓
                                                   [WRITE_PREVIEW]
                                                          ↓
                                                       [BUILD_OG]
                                                          ↓
                                                       [VERIFY]
                                                          ↓
                                                         END
```

**Loop termination**: design loop is blocking — score must reach 8/10 within 3 iterations or the user decides at the checkpoint. Preview loop is non-blocking — proceed with warning if score < 8 at iteration 3.

**Key reference files** (read these before dispatching subagents that need them):
- `.claude/skills/design-md/references/stitch-format.md`
- `.claude/skills/design-md/references/rubric-design.md`
- `.claude/skills/design-md/references/rubric-preview.md`

## Stage 1 — Preflight

Verify the working environment before doing anything user-visible.

1. `Bash`: `pwd` to capture the absolute repo root. Hold this value as `${repo_root}` in your reasoning and substitute it literally into every later Bash command and dispatch prompt that touches a repo path. The shell preserves cwd across calls, but pinning the absolute path makes Stage 8/10/11 robust to any inadvertent `cd`.
2. `Bash`: `date +%Y-%m-%d` to capture today's date. Hold this value as `${today}` in your reasoning. Stage 6a passes this to the author for the `last_updated` frontmatter field; the project's date validator at `src/lib/content-parser.ts:158-171` rejects any other format.
3. `Read` `${repo_root}/package.json`. If `"name"` is not exactly `"ko-design-md"`, abort with: "이 스킬은 ko-design-md 레포 안에서만 동작합니다. 현재 디렉터리: ${repo_root}". Do not proceed.
4. Verify `${repo_root}/src/lib/content-types.ts` is readable. If not, abort.
5. `Read` `${repo_root}/src/lib/content-types.ts` and extract the live `CATEGORIES` const. Use this as the source of truth for the intake category picker (do NOT hardcode the enum from memory — it can drift).

## Stage 2 — Conversational intake

Use a single `AskUserQuestion` form with these 4 questions (multi-select where indicated):

1. **브랜드명** (text via "Other" → custom input): e.g. "토스", "당근", "구름". Use the Korean company/brand display name as it should appear in the `name` frontmatter, not the design system product name. If research later surfaces a distinct design system name (e.g. "SEED Design", "Vapor UI"), the author stores that in optional `design_system_name`.
2. **참고 URL** (text via "Other"): comma-separated URLs. **2개 이상 권장** — 1개만 입력 시 research-collector가 INSUFFICIENT_SOURCES로 중단할 수 있고, 그 경우 스크린샷 보강 필요. Brand homepage, design system page, blog post about their UI, etc.
3. **카테고리** (single-select): all values from `CATEGORIES` const, in order. Last option is `etc`.
4. **언어** (single-select): `ko (한국어 본문)`, `en (English body)`, `both (두 파일 생성)`. Default `ko` recommended.

Then ask three follow-up text inputs:
- **스크린샷 경로** (optional) — comma-separated absolute paths to screenshot files. The user can type "없음" to skip.
- **로고 자산 경로** (optional) — an existing local file path for a brand logo. Accept only `.svg`, `.png`, `.webp`, or `.avif`. The user can type "없음" to skip.

  **CRITICAL — pick a small square symbol mark, NOT a wordmark.** Two square slots in the site consume this asset: the catalog grid card (~48–96 px on screen) AND the OG image's top-left brand mark (32×32 px in the 1200×630 social card, see `src/og/template.tsx`). The OG renderer (Satori) has limited `object-fit` support, so a non-square asset is stretched into the 32×32 box rather than letterboxed — the catalog card has the same constraint at its own scale. Choose accordingly:
  - ✅ Pick the brand's standalone **symbol / mark / favicon shape** with a transparent background — e.g. SOCAR's angular blue mark, Toss's curved oval lens, Gmarket's circular G, Baemin's symbol. Match the style of existing `public/logos/{toss,socar,baemin,…}.png` (square, no text, no baked-in frame).
  - ❌ Avoid the **horizontal wordmark / lockup** (the brand name written out, e.g. "Gmarket", "toss", "쏘카") — wordmarks render too small in the grid card or break its aspect.
  - ❌ Avoid **iOS-squircle / framed app icons** with a rounded gradient background baked in — that frame conflicts with the catalog card's own background. Prefer the unframed symbol form.
  - When a bundle provides multiple variants (e.g. `logo-brand.png` wordmark vs `logo-circular-g.png` symbol vs `logo-app-icon.png` framed), the **unframed symbol** is correct for the catalog grid. Filename hints for the GRID-WRONG forms: `*wordmark*`, `*logotype*`, `*-brand*`, `*-horizontal*`, `*-app-icon*` (framed). Filename hints for the GRID-RIGHT form: `*-symbol*`, `*-mark*`, `*-circular*`, `*-icon*` (when unframed), or a generic `{slug}.png` that is already a symbol.

  **Optional second asset — wordmark/logotype for the preview hero.** The catalog grid uses the symbol, but the preview HTML hero (`public/preview/{slug}/*.html`) has room for a richer brand lockup with the brand name visible. If the source provides BOTH a symbol AND a horizontal wordmark/logotype, capture both paths. Stage 4a will place the wordmark at `public/logos/{slug}-logotype.{ext}` (matching the existing `wanted-logotype.svg` convention), and the preview-html-author renders the wordmark in the hero where there is space. The grid card always uses the symbol; the **wordmark has no frontmatter field** — it stays a site-internal preview-only asset (the design.md's `logo` frontmatter URL still points to the symbol so the file remains portable outside ko-design-md).
- **디자인 시스템 문서 사이트 URL** (optional) — if the brand publishes its design system as a documentation website (not only Figma), the root URL of that site (e.g. `https://socarframe.socar.kr/`). Stage 4b crawls it into a research corpus. The user can type "없음" to skip.

Capture the answers as: `brand_name`, `source_urls` (parsed array), `category`, `lang`, `screenshot_paths` (parsed array, may be empty), `logo_asset_path` (string or empty), `docs_site_url` (string or empty).

**Screenshot path preflight**: for each path in `screenshot_paths`, run `Bash`: `[ -f "$path" ]`. If any path is missing, surface the missing list to the user and re-prompt the screenshot question. This avoids research-collector failing silently mid-read.

**Logo path preflight**: if `logo_asset_path` is not empty/`없음`, run `Bash`: `[ -f "$logo_asset_path" ]` and verify the extension matches `svg|png|webp|avif`. If missing or unsupported, surface the problem and re-prompt the logo question. Do not download logos from the web.

## Stage 3 — Slug derivation + conflict resolution

Derive `slug` from `brand_name`:
1. NFD-normalize and strip diacritics/non-ASCII.
2. Lowercase, replace `[^a-z0-9]+` with `-`, trim leading/trailing `-`.
3. If the result is empty (Korean-only brand with no Latin form), prompt the user via `AskUserQuestion` for an explicit slug. Question wording: **"slug은 영문 소문자/숫자/하이픈만 가능합니다 (예: `toss`, `karrot-market`)."** Validate the user's input matches `^[a-z0-9-]+$`; on mismatch, re-prompt.

Check for conflicts via `Bash` (`ls services/{slug}.md 2>/dev/null` and `ls services/{slug}.en.md 2>/dev/null`):

- No conflict → proceed.
- Conflict → `AskUserQuestion`:
  - "다른 slug 사용" → user provides a new slug, recheck.
  - "기존 항목 업데이트" → set `mode = update`. The pipeline still runs but final write overwrites.
  - "취소" → abort.

## Stage 4 — Cache setup

Create the staging directory:

```bash
mkdir -p .claude/cache/design-md/{slug}
```

This directory holds all intermediate artifacts. It's gitignored (`.claude/cache/` was added to `.gitignore` when the skill was installed) so partial work won't leak into PRs.

### Stage 4a — Logo asset resolution

**Before resolving paths — verify the logo asset is the right FORM.** The catalog grid card uses a small square logo slot, so the chosen asset MUST be a **symbol / mark / favicon shape** (transparent background, no text), NOT a horizontal wordmark and NOT an iOS-squircle app icon with a baked-in background. When auto-picking from a bundle/zip that contains multiple variants, prefer filenames matching `*-symbol*`, `*-mark*`, `*-circular*`, or unframed `*-icon*`; reject filenames matching `*wordmark*`, `*logotype*`, `*-horizontal*`, `*-brand*` (often the wordmark), or `*-app-icon*` (often the iOS-squircle framed form). If only a wordmark variant is available, prompt the user to confirm before placing it — wordmarks are a known catalog-grid mismatch (see Stage 2's logo intake rule and the existing `public/logos/{toss,socar,baemin,...}.png` reference). This check applies inside step 1 below.

Resolve **two** logo values before dispatching author agents — different downstream concerns need different forms:

- **`logo_url`** — fully-qualified URL like `https://getdesign.kr/logos/toss.png`. Goes into design.md **frontmatter**, where it must stay meaningful when the file is copied outside the ko-design-md site (PRD User Story 1 — vibe-coding flow).
- **`logo_src_path`** — site-relative path like `/logos/toss.png`. Goes into preview HTML `<img src>`, which is only ever loaded inside the catalog site's iframe. Keeping it relative avoids making dev/staging depend on the production-domain asset.

Both either co-exist (logo found) or are simultaneously empty (no logo).

The canonical site origin is **`https://getdesign.kr`**. Change this constant in one place only — this paragraph — if the origin ever moves.

1. If `logo_asset_path` was provided:
   - Verify it exists and has a supported extension (`svg`, `png`, `webp`, `avif`).
   - If it already lives under `${repo_root}/public/logos/`, set `logo_src_path = /logos/{basename}` and `logo_url = https://getdesign.kr/logos/{basename}`.
   - Otherwise copy it to `${repo_root}/public/logos/{slug}.{ext}` and set `logo_src_path = /logos/{slug}.{ext}` and `logo_url = https://getdesign.kr/logos/{slug}.{ext}`. This is allowed only for user-supplied local logo assets.
2. If no logo path was provided, auto-detect the first existing file in `public/logos/{slug}.{svg,png,webp,avif}` (in that order) and set `logo_src_path = /logos/{slug}.{ext}` and `logo_url = https://getdesign.kr/logos/{slug}.{ext}`.
3. If nothing is found, set both to an empty string and continue. The entry may ship without a logo, but Stage 13 must report the missing logo TODO.
4. **Optional wordmark / logotype for the preview hero.** If a wordmark variant was captured at Stage 2 (a horizontal lockup that contains the brand name as text — e.g. `logo-brand.png`, `*-logotype.svg`), copy it to `${repo_root}/public/logos/{slug}-logotype.{ext}` and set `logo_wordmark_src_path = /logos/{slug}-logotype.{ext}`. If no wordmark was captured at intake but a file already exists at `public/logos/{slug}-logotype.{svg,png,webp,avif}`, auto-detect it (same precedence order as the symbol). Otherwise set `logo_wordmark_src_path = ""`. There is NO frontmatter URL for the wordmark — it is a site-internal preview-only asset; the design.md `logo` field always references the symbol so the file remains portable outside ko-design-md.

The auto-detect pattern for the catalog grid logo is exactly `public/logos/{slug}.{svg,png,webp,avif}`; for the optional wordmark it is `public/logos/{slug}-logotype.{svg,png,webp,avif}`. When the symbol values are non-empty, every later stage must preserve them exactly — design-md-author writes `logo_url` verbatim into frontmatter, preview-html-author embeds `logo_src_path` as `<img src>` (or `logo_wordmark_src_path` in the hero when that is non-empty), and the Stage 10 grep checks match each file against the appropriate form.

### Stage 4b — Docs-site crawl (conditional)

If `docs_site_url` is empty or "없음", skip this stage and set `crawl_corpus_path = "none"`.

Otherwise, crawl the brand's documentation site into the cache directory so research-collector can use it as a primary source. This runs the `docs-crawler` skill's engine — a sitemap-driven crawl with a JS-render fallback that also localizes images (external and inline base64) into `crawl/images/`, so the cached corpus is self-contained:

```bash
cd "${repo_root}" && pnpm crawl:docs "${docs_site_url}" --out "${repo_root}/.claude/cache/design-md/{slug}"
```

The crawl writes `crawl-corpus.md` (the merged corpus) plus `crawl/pages/*.md`, the downloaded `crawl/images/`, and `crawl/manifest.json` into the (gitignored) cache directory. The first crawl of a JavaScript-rendered site auto-installs a headless browser (~150MB, one-time).

After it returns, verify the corpus landed:

```bash
[ -s "${repo_root}/.claude/cache/design-md/{slug}/crawl-corpus.md" ] && echo CORPUS_OK || echo CORPUS_MISSING
```

- `CORPUS_OK` → set `crawl_corpus_path = ${repo_root}/.claude/cache/design-md/{slug}/crawl-corpus.md`.
- `CORPUS_MISSING`, or the crawl exited non-zero → the crawl failed. It is best-effort: research can still proceed from `source_urls`. `AskUserQuestion`: "문서 사이트 크롤 실패 — (a) 다시 시도 / (b) 크롤 없이 진행 / (c) 취소". On "다시 시도" re-run the crawl; on "크롤 없이 진행" set `crawl_corpus_path = "none"`; on "취소" abort with the resume path.

## Stage 5 — Research (research-collector)

Dispatch via `Agent` tool with `subagent_type: "research-collector"`. Pass this prompt:

```
Research the brand "{brand_name}" (slug: {slug}) for ko-design-md catalog onboarding.

source_urls: {comma-separated URLs}
screenshot_paths: {comma-separated paths or "none"}
crawl_corpus_path: {crawl_corpus_path from Stage 4b — absolute path to crawl-corpus.md, or "none"}
category: {category}
lang: {lang}
cache_dir: {absolute path to .claude/cache/design-md/{slug}/}

Follow your agent definition. If crawl_corpus_path is not "none", read that corpus first as your primary source. Write exactly one file at {cache_dir}/research.md with the cited-claims structure. Halt with INSUFFICIENT_SOURCES only if crawl_corpus_path is "none" AND fewer than 2 URLs return 2xx.
```

After the agent returns, `Read` `{cache_dir}/research.md`.
- If the first line of `## Sources` is `INSUFFICIENT_SOURCES`, surface this to the user via `AskUserQuestion` with options: "URL 추가 입력" / "스크린샷 경로 추가" / "취소". On URL/screenshot addition, re-dispatch research-collector with the augmented inputs.
- **Section sanity check**: `Bash`: `grep -c '^## ' {cache_dir}/research.md`. Expected output is `9` (one per documented H2 section). If less than 9, the agent silently produced a malformed file — re-dispatch with an instruction prefixed: "Your previous research.md was malformed (only N sections found). Produce ALL 9 H2 sections in the documented order, even if some are `(no public evidence found)`."
- Otherwise, proceed.

## Stage 6 — Draft + design.md review loop

Iteration counter `N = 1`. Loop:

### 6a. Dispatch design-md-author

Via `Agent` with `subagent_type: "design-md-author"`. Pass:

```
Author a Stitch v0.1-format design.md draft for "{brand_name}".

cache_dir: ${repo_root}/.claude/cache/design-md/{slug}/
slug: {slug}
name: {brand_name}
category: {category}
lang: {lang}
today: {today as YYYY-MM-DD}
logo_url: {logo_url or "none"}
research_path: ${repo_root}/.claude/cache/design-md/{slug}/research.md
prior_review_path: ${repo_root}/.claude/cache/design-md/{slug}/review-{N-1}.json or "none" on first pass
format_reference_path: ${repo_root}/.claude/skills/design-md/references/stitch-format.md
demo_paths: (none — leave empty by default; pass an existing ${repo_root}/services/*.md only if a stylistic peer genuinely fits the new brand. The early _demo-*.md fixtures have been removed.)

Follow your agent definition. Write {cache_dir}/draft.md.
```

**Bilingual variant**: when the user chose `both` from intake, replace the `lang: {lang}` line with two lines:
```
primary_lang: ko
secondary_lang: en
```
The author then writes both `draft.md` (lang=ko) and `draft.en.md` (lang=en) in one pass, per its agent definition. Adjust the trailing `Write {cache_dir}/draft.md` line to `Write {cache_dir}/draft.md AND {cache_dir}/draft.en.md`.

After return, verify `{cache_dir}/draft.md` exists and is non-empty. If missing, the author failed — log the issue, retry once with the same prompt; if still missing, abort with a diagnostic message.

### 6a2. Deterministic draft gate (machine validation)

Before spending a reviewer dispatch, run the draft validator — it covers every mechanically checkable rubric item (frontmatter round-trip, section presence/order, OKLCH-only token values, `[src:N]`/References integrity, expected logo) so the reviewer model never has to "grep mentally":

```bash
cd "${repo_root}" && pnpm validate:draft .claude/cache/design-md/{slug}/draft.md \
  --slug {slug} --expected-logo {logo_url or none} --lang {lang} \
  --iteration {N} --json-out "${repo_root}/.claude/cache/design-md/{slug}/review-machine-{N}.json"
```

- **Exit 0** → proceed to 6b, passing the machine report path (see the 6b prompt).
- **Exit 1** (block issues) → do NOT dispatch the reviewer. Re-dispatch 6a with `prior_review_path` = the `review-machine-{N}.json` above (its `issues[]` uses the same `severity`/`section`/`fix` shape the author already consumes). Machine retries use a sub-counter **K (max 2) and do not increment N** — machine fixes are cheap and must not consume the semantic-review budget.
- **K exhausted with blocks remaining** → dispatch 6b anyway; the reviewer receives the failing machine report and the normal loop/checkpoint rules take over (no new termination path).

Bilingual runs: after the primary draft passes, gate `draft.en.md` the same way with `--lang en` (write to `review-machine-en.json`) before the 6d companion review.

### 6b. Dispatch design-md-reviewer

Via `Agent` with `subagent_type: "design-md-reviewer"`. Pass:

```
Score the draft.md at {cache_dir}/draft.md against the rubric.

cache_dir: {abs path}/.claude/cache/design-md/{slug}/
draft_path: {cache_dir}/draft.md
research_path: {cache_dir}/research.md
content_types_path: {abs path}/src/lib/content-types.ts
rubric_path: {abs path}/.claude/skills/design-md/references/rubric-design.md
expected_logo_url: {logo_url or "none"}
machine_report_path: {cache_dir}/review-machine-{N}.json
iteration_n: {N}
output_path: {cache_dir}/review-{N}.json

Follow your agent definition. Write exactly one file at output_path.

The machine report has already verified the deterministically checkable items
(frontmatter round-trip, section presence/order, hex/rgba token scan,
[src:N]/References integrity, expected logo). Do not re-verify those — spend
your review on judgment items: Brand fidelity semantics against research.md,
Voice/tone, and cross-section token contradictions.
```

After return, `Read` `{cache_dir}/review-{N}.json`.

### 6c. Loop decision

- If `review.passed && review.score >= 8` → exit loop, go to step 6d.
- Else if `N < 3` → `N += 1`, go back to 6a (the author will read review-{N-1}.json and revise).
- Else (`N == 3` and not passed) → exit loop with a `warn` flag; go to step 6d. The user will see the failed verdict at the checkpoint and decide.

### 6d. Bilingual companion review (only when lang == "both")

If the user chose `both`, after the primary loop exits, run a single-pass review on `draft.en.md`. Dispatch design-md-reviewer once more:

```
Score the draft.en.md at ${repo_root}/.claude/cache/design-md/{slug}/draft.en.md against the rubric.

cache_dir: ${repo_root}/.claude/cache/design-md/{slug}/
draft_path: ${repo_root}/.claude/cache/design-md/{slug}/draft.en.md
research_path: ${repo_root}/.claude/cache/design-md/{slug}/research.md
content_types_path: ${repo_root}/src/lib/content-types.ts
rubric_path: ${repo_root}/.claude/skills/design-md/references/rubric-design.md
expected_logo_url: {logo_url or "none"}
iteration_n: 1
output_path: ${repo_root}/.claude/cache/design-md/{slug}/review-en.json

Follow your agent definition (Bilingual companion mode at bottom of definition).
```

`Read` the resulting `review-en.json`. Apply a **relaxed pass criterion**: ship the .en.md only if `rubric[0].earned == 3` (Schema validity full) AND `rubric[1].earned == 2` (Section coverage full). Other items contribute to the user-facing score but do not block. The user sees both reviews at Stage 7.

## Stage 7 — User checkpoint

This is the only mandatory user gate. Show the user:

1. The current `draft.md` content (read it and display the full file inline, formatted as markdown — paste in code fences).
2. The latest `review-{final}.json` verdict — extract `score`, `passed`, `verdict`, and bullet the issues array.
3. If iteration > 1, show a brief diff highlight: `"Iter 1 score: X → Iter {final} score: Y"` plus the top 1–2 issues that improved between iterations (compare `review-1.json.issues` and `review-{final}.json.issues`).
4. If `lang == "both"`: also display `draft.en.md` content + `review-en.json` verdict. Highlight whether Items 1 and 2 reached full points (the gate for shipping the .en.md). If not, surface the specific issues so the user can request a revision pass.

Then `AskUserQuestion`:

| Option | Effect |
|---|---|
| "승인하고 계속" | Approve as-is. Proceed to Stage 8. |
| "수정 사항 알려주고 한 번 더" | User provides feedback in the "Other" custom input. Append the user's notes to the prior review-N.json's issues array (with `severity: block`) and re-dispatch the author for one more revision. After this extra revision, run the reviewer once more, then return to checkpoint with the new draft. |
| "취소" | Abort. Cache dir is left intact. Print: "취소되었습니다. 재개하려면 cache 디렉터리에서 작업을 이어가세요: `.claude/cache/design-md/{slug}/`" |

Also offer to suggest `related_services` based on existing `services/*.md` slugs — list 0–3 candidates the user can confirm or override before finalization. (If you skip this UX step in v1, leave `related_services: []` and note in the final report.)

## Stage 8 — Write design.md to services/

After approval:

1. `Bash`: `cp ${repo_root}/.claude/cache/design-md/{slug}/draft.md ${repo_root}/services/{slug}.md`
2. If `lang == "both"`: verify `review-en.json` schema gate (`rubric[0].earned == 3` AND `rubric[1].earned == 2`). If gate passes, `cp ${repo_root}/.claude/cache/design-md/{slug}/draft.en.md ${repo_root}/services/{slug}.en.md`. If gate fails, do NOT copy .en.md — route back to Stage 7 with the schema/section issues highlighted; the user can request a revision pass on .en.md (which dispatches author with prior_review_path pointing to review-en.json) before re-attempting Stage 8.
3. `Read` the placed file(s) to confirm content arrived intact.
4. **Generate the token sidecar** — `Bash`: `pnpm tokens:build {slug}` extracts `services/{slug}.tokens.json` from the design.md you just placed. This is the visual design-token data (colors / typography / spacing / radius) that drives the detail page's always-visible token-card section; `src/lib/content-collection.ts` loads it as `doc.tokens` (runtime is a plain `JSON.parse`, no markdown parsing). Inspect the printed `Nc Nt Ns Nr` line. The extractor reads fenced ```yaml token lines and markdown tables, one token per line — `name: oklch(...)` (colors), `name: { size, weight, line-height }` or `name: 16 / 24 / 700` (type), `name: 16px` (spacing/radius). **Semantic aliases** (`{colors.x}`, bare references like `fill-brand: blue-500`) are intentionally excluded — they stay in the prose only. If **any** of the four counts is unexpectedly `0`, that `## Colors / Typography / Spacing / Rounded` section isn't in a codegen-readable form. The deterministic path is to **route back to a Stage 6 draft revision** with a blocking prior-review issue naming the unreadable section (a human operator running the skill by hand may instead fix the section directly), then re-run `pnpm tokens:build {slug}` so the entry ships with full token cards.

If the `cp` itself fails (filesystem error), surface the error and route back to the checkpoint.

## Stage 9 — Preview HTML author + review loop

Iteration counter `M = 1`. Same shape as Stage 6, dispatching `preview-html-author` and `preview-html-reviewer`.

### 9a. Dispatch preview-html-author

```
Build preview light.html and dark.html for "{brand_name}".

cache_dir: {abs path}/.claude/cache/design-md/{slug}/
slug: {slug}
name: {brand_name}
lang: {lang}
design_md_path: {abs path}/services/{slug}.md
runtime_tokens_path: {abs path}/public/preview/_runtime/tokens.css
runtime_iframe_path: {abs path}/public/preview/_runtime/iframe.js
logo_src_path: {logo_src_path or "none"}
logo_wordmark_src_path: {logo_wordmark_src_path or "none"}
demo_html_paths: (none — leave empty by default; pass an existing {abs path}/public/preview/*/light.html only if a visual peer genuinely fits. The early demo-courier/demo-pay previews have been removed.)
prior_review_path: {cache_dir}/preview-review-{M-1}.json or "none"

Follow your agent definition. Write {cache_dir}/light.html and {cache_dir}/dark.html. If `logo_wordmark_src_path` is not "none", render that wordmark `<img>` in the hero brand lockup (the hero has room for the brand name) and reserve `logo_src_path` (the small symbol) for compact references inside the component showcase, favicons, or chip-sized contexts. If `logo_wordmark_src_path` is "none", use `logo_src_path` in the hero too. Size hero `<img>` by `height` + `width: auto` so either aspect ratio (square symbol or horizontal wordmark) renders correctly.
```

### 9a2. Deterministic preview gate (machine validation)

Same shape as 6a2 — run the preview validator before spending a reviewer dispatch:

```bash
cd "${repo_root}" && pnpm validate:previews \
  --light .claude/cache/design-md/{slug}/light.html \
  --dark .claude/cache/design-md/{slug}/dark.html \
  --design-md "${repo_root}/services/{slug}.md" \
  --expected-logo-src {logo_src_path or none} \
  --expected-wordmark-src {logo_wordmark_src_path or none} \
  --iteration {M} --json-out "${repo_root}/.claude/cache/design-md/{slug}/preview-review-machine-{M}.json"
```

It hard-checks the structural rubric items (data-theme/lang, absolute runtime paths, foreign scripts, file size, hero logo src) and emits warn-level responsive heuristics plus an `oklch coverage` metric (`matched/total` per theme) in `metrics`.

- **Exit 0** → proceed to 9b, passing the machine report path.
- **Exit 1** → do NOT dispatch the reviewer. Re-dispatch 9a with `prior_review_path` = the `preview-review-machine-{M}.json`. Machine retries use a sub-counter **K (max 2) and do not increment M**.
- **K exhausted with blocks remaining** → dispatch 9b anyway; the normal non-blocking loop rules take over.

### 9b. Dispatch preview-html-reviewer

```
Score the preview HTML files at {cache_dir} against the rubric.

cache_dir: {abs path}/.claude/cache/design-md/{slug}/
light_path: {cache_dir}/light.html
dark_path: {cache_dir}/dark.html
design_md_path: {abs path}/services/{slug}.md
rubric_path: {abs path}/.claude/skills/design-md/references/rubric-preview.md
expected_logo_src_path: {logo_src_path or "none"}
machine_report_path: {cache_dir}/preview-review-machine-{M}.json
iteration_n: {M}
output_path: {cache_dir}/preview-review-{M}.json

Follow your agent definition. Write exactly one file at output_path.

The machine report has already verified the structural Item 1 checks
(data-theme, absolute runtime paths, foreign scripts, file size, hero logo
src). Do not re-verify those — adopt the report's result for Item 1 and spend
your review on judgment items: Color fidelity semantics (use the report's
oklch coverage metric as the Item 2 input), Component coverage, Typography
hierarchy, and dark-mode appropriateness.
```

### 9c. Loop decision (non-blocking)

- If `passed && score >= 8` → exit loop, go to Stage 10.
- Else if `M < 3` → `M += 1`, go back to 9a.
- Else (`M == 3` and not passed) → log the warning, exit loop, go to Stage 10 anyway. Preview review is non-blocking because visual previews iterate naturally during real use; the user already approved the design.md (the source of truth).

## Stage 10 — Write previews to public/

```bash
mkdir -p ${repo_root}/public/preview/{slug}
cp ${repo_root}/.claude/cache/design-md/{slug}/light.html ${repo_root}/public/preview/{slug}/light.html
cp ${repo_root}/.claude/cache/design-md/{slug}/dark.html ${repo_root}/public/preview/{slug}/dark.html
```

### Logo deterministic check

If the resolved logo values are non-empty, verify the placed main markdown contains the absolute URL form and both preview HTML files contain the site-relative form:

```bash
# Markdown: frontmatter `logo` is the symbol's absolute URL (portable across copies of the file).
rg -q -F "logo: {logo_url}" "${repo_root}/services/{slug}.md" || echo "LOGO_MISSING_MD"

# Preview HTML hero src: when the wordmark exists, the hero uses the wordmark; otherwise the symbol.
# `{logo_wordmark_src_path}` is the literal string "none" when no wordmark was captured —
# `${var:-fallback}` would treat "none" as a non-empty value and skip the fallback, so use an
# explicit conditional that handles both "none" and the empty case.
HERO_SRC="{logo_wordmark_src_path}"
if [ "$HERO_SRC" = "none" ] || [ -z "$HERO_SRC" ]; then
  HERO_SRC="{logo_src_path}"
fi
rg -q -F "src=\"${HERO_SRC}\"" "${repo_root}/public/preview/{slug}/light.html" || echo "LOGO_MISSING_LIGHT"
rg -q -F "src=\"${HERO_SRC}\"" "${repo_root}/public/preview/{slug}/dark.html" || echo "LOGO_MISSING_DARK"
```

If any sentinel prints, do not proceed to Stage 11. If the markdown is missing the logo, re-run Stage 6a with a blocking prior-review issue that says `logo_url` must appear as frontmatter `logo` (the exact fully-qualified URL — not a site-relative shortcut). If either preview is missing the hero logo, re-run Stage 9a with a blocking prior-preview issue that says the exact `HERO_SRC` (site-relative form — wordmark when defined, else symbol) must render as an `<img src>` in both files.

## Stage 11 — Build OG image

```bash
cd "${repo_root}" && pnpm build:og
```

After the command:

**If exit non-zero**: capture stderr. Likely cause is invalid frontmatter that slipped past the reviewer (e.g. `gray-matter` parsing `last_updated` as a Date object, off-enum category, etc.). Surface stderr via text. Offer via `AskUserQuestion`: "frontmatter 직접 수정 후 재시도" (open `${repo_root}/services/{slug}.md` for editing; on user confirmation that they've edited, re-run `pnpm build:og` and re-validate — loop up to 3 retries), "취소 (파일 유지)" (partial state is acceptable since the index works without an OG image — the route falls back per `build-og.ts`). Do NOT auto-rollback the placed .md. After 3 failed retries, fall through to "취소" with a diagnostic message.

**If exit zero**: validate the OG output (catches the corrupt-PNG silent failure mode that happens on satori panic):

```bash
[ -s "${repo_root}/public/og/{slug}.png" ] || echo "OG_EMPTY"
file "${repo_root}/public/og/{slug}.png" | grep -q PNG || echo "OG_NOT_PNG"
```

If either check prints its sentinel, treat as the same error path as a non-zero exit (surface, ask the user, do not auto-rollback).

## Stage 12 — Verification (preview MCP)

Start the dev server and confirm the new entry renders correctly. This is the strongest end-to-end check.

1. **Port preflight**: `Bash`: `lsof -i :3000 -t 2>/dev/null`. If the output is non-empty, port 3000 is already in use (the user has a dev server running). `AskUserQuestion`: "포트 3000이 사용 중입니다 — (a) 기존 서버 종료 후 재시작 / (b) 검증 단계 건너뛰기 / (c) 취소". On "건너뛰기", skip to Stage 13 with a `verification_skipped: port_collision` flag in the report.
2. `Bash` (run_in_background): `cd "${repo_root}" && pnpm dev` — runs on port 3000.
3. **Server readiness poll**: `Bash`: `for i in $(seq 1 30); do curl -sf http://localhost:3000 -o /dev/null && echo READY && break; sleep 0.5; done`. The dev server takes a few seconds to bind; without this poll, `preview_start` may hit a connection refused before Vite is up. If the loop completes without printing `READY`, fall through to the `curl` fallback at the end of this stage.
4. `mcp__Claude_Preview__preview_start` with URL `http://localhost:3000/services/{slug}`.
5. `mcp__Claude_Preview__preview_eval`: `document.title` — should contain `{brand_name}` and `ko/design.md`. Then confirm the **token-card section** loaded from the Stage 8 sidecar: `preview_eval`: `document.querySelector('[aria-label="Design tokens"]')?.querySelector('p')?.textContent ?? 'MISSING'` — should return the count badge (`{N} Colors · {N} Type · …`). `MISSING` means `services/{slug}.tokens.json` is absent or failed `coerceServiceTokens`; verify it exists and is valid JSON before continuing.
6. `preview_eval` against the iframe: confirm `document.querySelector('iframe')?.src` contains `/preview/{slug}/dark.html` (dark is the route default per `src/routes/services/$slug.tsx:97`).
7. `preview_screenshot` once on the default tab.
8. `preview_eval`: navigate to `?tab=md` and confirm DESIGN.md tab renders the syntax-highlighted markdown.
9. `preview_screenshot` once on the `?tab=md` view.
10. **Agent endpoint check**: `Bash`: `curl -sf -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:3000/services/{slug}/llms.txt` — expect `200 text/plain; charset=utf-8`. This raw-markdown sibling route reads from `services/{slug}.md` directly, so a failure here means either the file wasn't placed correctly or the project's `/services/$slug/llms.txt` route regressed. Surface non-200 output to the user before stopping the server.
11. **Responsive sweep (mobile / tablet / desktop)** — confirm the preview demo doesn't break at narrow widths (the regression class hotfixed in PR #77). Load each demo **top-level**, not through the width-constrained detail-page iframe. Sweep **both** theme files — `dark.html` (route default) and `light.html`: they share layout, but PR #77's lesson is that a fix can land in one file and not the other, so check both. For each `{file}`: `preview_eval`: `window.location.href = "http://localhost:3000/preview/{slug}/{file}"`, then at **375 (mobile) / 768 (tablet) / 976 (detail-page embed width — the historical blind spot where multi-column cells are tightest, see PR #150) / 1440 (desktop)** × 900 run `mcp__Claude_Preview__preview_resize` to `{width} × 900` followed by `preview_eval` of the overflow probe:

    ```js
    (() => {
      const d = document.documentElement;
      const vw = d.clientWidth;
      const overflowPx = d.scrollWidth - vw;
      const broken = overflowPx > 1;
      // Collect culprits only when the document actually overflows, AND skip any element
      // inside an overflow-x: hidden/auto/scroll ancestor: an intentional horizontally-
      // scrollable row (chip row, carousel) reports right > vw without extending the
      // document, so it is not the break even when another element broke the page.
      const culprits = !broken ? [] : Array.from(document.querySelectorAll('body *'))
        .filter(el => {
          const r = el.getBoundingClientRect();
          if (r.right <= vw + 1 && r.left >= -1) return false;
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const ox = getComputedStyle(p).overflowX;
            if (ox === 'hidden' || ox === 'auto' || ox === 'scroll') return false;
          }
          return true;
        })
        .slice(0, 6)
        .map(el => {
          // getAttribute('class') works for SVG too (el.className is an SVGAnimatedString there).
          const cls = (el.getAttribute('class') || '').trim();
          return el.tagName.toLowerCase() + (cls ? '.' + cls.split(/\s+/).slice(0, 2).join('.') : '');
        });
      return { viewport: vw, scrollWidth: d.scrollWidth, overflowPx, broken, culprits };
    })()
    ```

    `broken = overflowPx > 1` (1px tolerance) means a horizontal scrollbar — a broken responsive layout. The check keys on the **document** `scrollWidth`, so an element inside an intentional horizontally-scrollable row (a chip row, a carousel) does not trip it. `culprits` (collected only when `broken`, and excluding any element nested in an `overflow-x` scroll/clip ancestor) lists the genuinely page-extending elements (e.g. `.comp-card`, `.ftile`) so the fix can be targeted. Collect every `broken` result as `breaks[] = {file, width, overflowPx, culprits}`.

    **Auto-fix loop** (≤ 2 attempts) when `breaks` is non-empty — reuses the Stage 9a dispatch and the Stage 10 copy, so there is no new mechanism:
    1. Write a synthetic review at `{cache_dir}/preview-review-resp-{attempt}.json` whose `issues[]` carries one `severity: "block"` entry per break: `{"severity":"block","section":"responsive — {file} @{width}px","fix":"Horizontal overflow {overflowPx}px at {width}px. Offending: {culprits}. Repair per the author's Responsive & mobile-overflow guard — the usual root cause is a bare 1fr grid track flooring at its content min-content, so switch content tracks to minmax(0, 1fr), add a mobile grid-collapse @media rule, and put min-width: 0 on items wrapping fixed-width children. Apply the identical fix to BOTH light.html and dark.html."}`.
    2. Dispatch `preview-html-author` exactly as in **Stage 9a**, with `prior_review_path` = that JSON. The author rewrites `{cache_dir}/light.html` and `dark.html`.
    3. Re-copy staging → public with the **Stage 10** `cp` commands (the Stage 10 logo deterministic check still applies).
    4. `preview_eval`: `window.location.reload()` (the `/preview/*` `no-cache` header serves the fresh file), then re-run the sweep.
    Stop when `breaks` is empty or after 2 attempts.

    **Result**: if `breaks` is empty → `responsive_result = ok` (record the attempt count). If still non-empty after 2 attempts → `preview_screenshot` at the narrowest failing width for evidence and set `responsive_result = warn` with the residual `breaks`. Non-blocking either way (consistent with the non-blocking preview loop). The OG image is derived from design.md, so re-fixed previews do **not** trigger an OG rebuild. (The port-collision path never reaches this step — it returns to Stage 13 at step 1 — so handling for that case lives in the Stage 13 report, not here.)
12. **Stop the dev server**: `Bash`: `kill $(lsof -t -i:3000) 2>/dev/null || true`. Killing by port is portable across macOS/Linux and avoids accidentally killing other `pnpm` processes the user might be running. The `|| true` keeps the skill from aborting if the process already exited.

If preview MCP tools are unavailable, fall back to `Bash`: `curl -sf http://localhost:3000/services/{slug} | grep -q '<iframe'` — non-zero exit means the page failed to render. The responsive sweep (step 11) requires the preview MCP tools; without them, note `responsive_result = skipped (no preview MCP)` in the report.

## Stage 13 — Final report and cleanup

Print a summary message containing:

- Files written (with absolute paths):
  - `services/{slug}.md` (and `.en.md` if bilingual)
  - `services/{slug}.tokens.json` (visual design-token sidecar → detail-page card view)
  - `public/preview/{slug}/light.html`
  - `public/preview/{slug}/dark.html`
  - `public/og/{slug}.png` (from `pnpm build:og`)
- Surfaced URLs (paths only — host depends on env):
  - `/services/{slug}` — HTML detail page (Live Preview + DESIGN.md tabs).
  - `/services/{slug}/llms.txt` — raw `text/plain` design.md (frontmatter + body) for LLMs / agents to fetch directly. Discoverable via `<link rel="alternate" type="text/plain">` on the HTML page.
- Final review scores: design `{score}/10`, preview `{score}/10`.
- Screenshots taken during verification (paths or inline).
- Responsive verification (Stage 12 sweep) — pick the line by state:
  - `responsive_result = ok` → `반응형: ✅ 375/768/976/1440 가로 오버플로 없음 (자동수정 {attempts}회)`
  - `responsive_result = warn` → `반응형: ⚠️ 잔여 오버플로 — {file} @{width}px {overflowPx}px, 요소 {culprits} (스크린샷 {path}, 자동수정 2회 후 잔존)`
  - skipped — set when `verification_skipped: port_collision` (step 1 returned early, so `responsive_result` was never assigned) **or** `responsive_result = skipped` (preview MCP unavailable) → `반응형: ⏭ 검증 건너뜀 (포트 충돌 / preview MCP 없음)`
- Leftover TODOs:
  - If the logo values are empty: "Logo asset: `public/logos/{slug}.svg|png|webp|avif` 가 아직 없습니다. 직접 추가한 뒤 frontmatter `logo: https://getdesign.kr/logos/{slug}.{ext}` (절대 URL, 외부 복사 대비) 를 채우고 preview HTML에는 `<img src=\"/logos/{slug}.{ext}\">` (site-relative, iframe 전용) 형식으로 렌더링하세요."
  - "related_services: 빈 배열입니다. 검토 후 frontmatter 를 갱신하세요."
  - Any preview review warnings if iteration 3 didn't reach 8.

`AskUserQuestion`: "캐시 정리할까요?"
- "지금 삭제" → `rm -rf .claude/cache/design-md/{slug}/`
- "보관 (디버깅용)" → leave intact.

## Edge cases

- **WebFetch blocked / paywalled** — research-collector halts with INSUFFICIENT_SOURCES, skill body re-prompts user (Stage 5).
- **Docs-site crawl yields 0 pages / fails** — Stage 4b surfaces the failure via `AskUserQuestion`; research proceeds from `source_urls` alone with `crawl_corpus_path = "none"`.
- **Reviewer never reaches 8 in 3 iterations** — checkpoint shows the failing draft and verdict; user decides via AskUserQuestion.
- **Responsive overflow persists after 2 auto-fix attempts (Stage 12 step 11)** — surface it as a ⚠️ in the Stage 13 report (residual `breaks` + screenshot) and finish anyway. Non-blocking, consistent with the preview loop; the placed design.md and OG image are unaffected.
- **User aborts at checkpoint** — leave cache intact, print resume path. Do not delete partial work.
- **`pnpm build:og` fails** — Stage 11's error path. Do not auto-rollback the placed .md.
- **Slug already exists with both .md and .en.md** — ask the user which to update before any subagent dispatch.
- **Subagent missing expected output file** — retry once. Second failure aborts with diagnostic.
- **Pretendard CDN dependency** — tokens.css imports Pretendard from jsDelivr. Online-only assumption; flag in the final report.
- **Preview HTML / logo cache policy** — `/preview/*` and `/logos/*` are served with `Cache-Control: no-cache` by `previewCacheHeadersPlugin` in `vite.config.ts` (both `vite dev` and `vite preview`). This prevents browsers heuristic-caching iframe HTML and logo files after entry edits — the cache trap that previously required users to hard-refresh after every preview/logo change. Per-entry HTML does NOT need its own `<meta http-equiv="Cache-Control">` (unreliable across browsers anyway); the server-level header is the source of truth. Production cache headers are handled by the host (Vercel defaults).

## What this skill must NOT do

- Edit any file outside of `services/`, `public/preview/`, `public/logos/{slug}.{svg,png,webp,avif}` for user-supplied logo assets, and `.claude/cache/design-md/{slug}/`.
- Skip the user checkpoint. Even if the design review passes 10/10 on iteration 1, show the draft to the user before writing to `services/`.
- Run subagents in parallel within a stage. The design-md author and reviewer are explicitly sequential because the reviewer needs the author's output. Same for preview HTML.
- Use `npm` instead of `pnpm` for any script invocation. The project uses `pnpm` (memorized preference).
- Write outside `cache_dir` from any subagent. Subagents have constrained tool access for this reason; respect that.

## Why this design

- **Five specialized subagents (vs. one general agent looping)**: author and reviewer are intentionally separated to avoid self-grading bias. Same model in both roles with different prompts produces noticeably stricter reviews. All five agent definitions pin `model: inherit` (the documented default, stated explicitly) so the whole pipeline follows the session model — no stage silently runs on a different tier when the operator switches models.
- **Machine gates before reviewer dispatches (6a2/9a2)**: every mechanically checkable rule lives in `pnpm validate:draft` / `pnpm validate:previews`, so reviewer quality degrades gracefully with model capability — a weaker reviewer model still receives deterministic findings instead of being trusted to "grep mentally".
- **Single user checkpoint at design.md**: the design.md is the source of truth — preview HTML is derivable from it. Locking the design.md after one approval gate gives the user maximum control with minimum interruption.
- **Stitch v0.1 standard sections**: every catalog entry follows the Stitch v0.1 structure (English headings, OKLCH tokens, citation hygiene). The early `_demo-*.md` fixtures that used Korean editorial headings have been removed; if older entries surface in git history they are superseded.
- **OKLCH everywhere, never hex**: downstream LLMs (which are the primary audience for design.md) reason about lightness/chroma/hue components more reliably than hex codes.
- **File-presence state encoding**: simpler than a state.json for v1; resumable because the cache dir's contents fully describe pipeline progress.
