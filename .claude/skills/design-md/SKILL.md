---
name: design-md
description: Add a new design.md catalog entry to ko-design-md. Use this skill IMMEDIATELY when the user wants to onboard a new brand into THIS project's catalog — produce services/{slug}.md (Stitch v0.1 format) plus public/preview/{slug}/{light,dark}.html plus the OG image. Trigger phrases include "add to design.md catalog", "new design.md entry for X", "onboard X to ko-design-md", "X를 ko-design-md에 추가", "X의 design.md 만들어줘", "/design-md", "X 카탈로그 항목 만들기", or any variant where the user is asking to populate this catalog with a new brand entry. Do NOT use for editing prose in an existing entry, fixing one frontmatter field, generating non-catalog design docs, or working in any other repository. The skill operates only inside the ko-design-md repo and verifies this via `package.json` name.
---

# /design-md skill — orchestration body

This skill builds a complete catalog entry through a 5-subagent pipeline with one user checkpoint. The pipeline is heavy (research, drafting, two review loops) so resumability matters: each stage's artifact lives on disk in `.claude/cache/design-md/{slug}/` and the next stage reads from there. State is encoded by file presence — no separate state.json needed for v1.

## Pipeline shape

```
[INTAKE] → research-collector → design-md-author ⇄ design-md-reviewer (loop ≤3)
                                                          ↓ score≥8 or N=3
                                                    [USER CHECKPOINT]
                                                          ↓ approve
                                                    [WRITE_MD]
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

1. `Read` `package.json` from cwd. If `"name"` is not exactly `"start-app"` (the ko-design-md repo's package name), abort with: "이 스킬은 ko-design-md 레포 안에서만 동작합니다. 현재 디렉터리: {cwd}". Do not proceed.
2. Verify `src/lib/content-types.ts` is readable. If not, abort.
3. `Read` `src/lib/content-types.ts` and extract the live `CATEGORIES` const. Use this as the source of truth for the intake category picker (do NOT hardcode the enum from memory — it can drift).

## Stage 2 — Conversational intake

Use a single `AskUserQuestion` form with these 4 questions (multi-select where indicated):

1. **브랜드명** (text via "Other" → custom input): e.g. "토스", "Toss", "Stripe". The display name as it should appear in the `name` frontmatter.
2. **참고 URL** (text via "Other"): comma-separated URLs. At least one. Brand homepage, design system page, blog post about their UI, etc.
3. **카테고리** (single-select): all values from `CATEGORIES` const, in order. Last option is `etc`.
4. **언어** (single-select): `ko (한국어 본문)`, `en (English body)`, `both (두 파일 생성)`. Default `ko` recommended.

Then a follow-up text input (separate AskUserQuestion if needed): **스크린샷 경로** (optional) — comma-separated absolute paths to screenshot files. The user can type "없음" to skip.

Capture the answers as: `brand_name`, `source_urls` (parsed array), `category`, `lang`, `screenshot_paths` (parsed array, may be empty).

## Stage 3 — Slug derivation + conflict resolution

Derive `slug` from `brand_name`:
1. NFD-normalize and strip diacritics/non-ASCII.
2. Lowercase, replace `[^a-z0-9]+` with `-`, trim leading/trailing `-`.
3. If the result is empty (Korean-only brand with no Latin form), prompt the user via `AskUserQuestion` for an explicit slug. Validate the user's input matches `^[a-z0-9-]+$`.

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

## Stage 5 — Research (research-collector)

Dispatch via `Agent` tool with `subagent_type: "research-collector"`. Pass this prompt:

```
Research the brand "{brand_name}" (slug: {slug}) for ko-design-md catalog onboarding.

source_urls: {comma-separated URLs}
screenshot_paths: {comma-separated paths or "none"}
category: {category}
lang: {lang}
cache_dir: {absolute path to .claude/cache/design-md/{slug}/}

Follow your agent definition. Write exactly one file at {cache_dir}/research.md with the cited-claims structure. Halt with INSUFFICIENT_SOURCES if fewer than 2 URLs return 2xx.
```

After the agent returns, `Read` `{cache_dir}/research.md`.
- If the first line of `## Sources` is `INSUFFICIENT_SOURCES`, surface this to the user via `AskUserQuestion` with options: "URL 추가 입력" / "스크린샷 경로 추가" / "취소". On URL/screenshot addition, re-dispatch research-collector with the augmented inputs.
- Otherwise, proceed.

## Stage 6 — Draft + design.md review loop

Iteration counter `N = 1`. Loop:

### 6a. Dispatch design-md-author

Via `Agent` with `subagent_type: "design-md-author"`. Pass:

```
Author a Stitch v0.1-format design.md draft for "{brand_name}".

cache_dir: {abs path}/.claude/cache/design-md/{slug}/
slug: {slug}
name: {brand_name}
category: {category}
lang: {lang}
today: {today as YYYY-MM-DD}
research_path: {cache_dir}/research.md
prior_review_path: {cache_dir}/review-{N-1}.json or "none" on first pass
format_reference_path: {abs path}/.claude/skills/design-md/references/stitch-format.md
demo_paths: {abs path}/services/_demo-courier.md, {abs path}/services/_demo-pay.md

Follow your agent definition. Write {cache_dir}/draft.md (and draft.en.md if lang=="both").
```

After return, verify `{cache_dir}/draft.md` exists and is non-empty. If missing, the author failed — log the issue, retry once with the same prompt; if still missing, abort with a diagnostic message.

### 6b. Dispatch design-md-reviewer

Via `Agent` with `subagent_type: "design-md-reviewer"`. Pass:

```
Score the draft.md at {cache_dir}/draft.md against the rubric.

cache_dir: {abs path}/.claude/cache/design-md/{slug}/
draft_path: {cache_dir}/draft.md
research_path: {cache_dir}/research.md
content_types_path: {abs path}/src/lib/content-types.ts
rubric_path: {abs path}/.claude/skills/design-md/references/rubric-design.md
iteration_n: {N}
output_path: {cache_dir}/review-{N}.json

Follow your agent definition. Write exactly one file at output_path.
```

After return, `Read` `{cache_dir}/review-{N}.json`.

### 6c. Loop decision

- If `review.passed && review.score >= 8` → exit loop, go to Stage 7.
- Else if `N < 3` → `N += 1`, go back to 6a (the author will read review-{N-1}.json and revise).
- Else (`N == 3` and not passed) → exit loop with a `warn` flag; go to Stage 7. The user will see the failed verdict at the checkpoint and decide.

### Bilingual note

If `lang == "both"`, the author also produced `draft.en.md`. The reviewer scores `draft.md` (Korean primary) authoritatively. The `.en.md` is reviewed only for schema validity (frontmatter parses, sections present) — the user can request improvements at the checkpoint if needed.

## Stage 7 — User checkpoint

This is the only mandatory user gate. Show the user:

1. The current `draft.md` content (read it and display the full file inline, formatted as markdown — paste in code fences).
2. The latest `review-{final}.json` verdict — extract `score`, `passed`, `verdict`, and bullet the issues array.
3. If iteration > 1, show a brief diff highlight: "Iter 1 score: X → Iter {final} score: Y" with the top 1-2 issues that were fixed.

Then `AskUserQuestion`:

| Option | Effect |
|---|---|
| "승인하고 계속" | Approve as-is. Proceed to Stage 8. |
| "수정 사항 알려주고 한 번 더" | User provides feedback in the "Other" custom input. Append the user's notes to the prior review-N.json's issues array (with `severity: block`) and re-dispatch the author for one more revision. After this extra revision, run the reviewer once more, then return to checkpoint with the new draft. |
| "취소" | Abort. Cache dir is left intact. Print: "취소되었습니다. 재개하려면 cache 디렉터리에서 작업을 이어가세요: `.claude/cache/design-md/{slug}/`" |

Also offer to suggest `related_services` based on existing `services/*.md` slugs — list 0–3 candidates the user can confirm or override before finalization. (If you skip this UX step in v1, leave `related_services: []` and note in the final report.)

## Stage 8 — Write design.md to services/

After approval:

1. `Bash`: `cp .claude/cache/design-md/{slug}/draft.md services/{slug}.md`
2. If `lang == "both"`: also `cp .../draft.en.md services/{slug}.en.md`
3. `Read` the placed file to confirm content arrived intact.

If the copy fails, surface the error and route back to the checkpoint.

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
demo_html_paths: {abs path}/public/preview/demo-courier/light.html, {abs path}/public/preview/demo-pay/light.html
prior_review_path: {cache_dir}/preview-review-{M-1}.json or "none"

Follow your agent definition. Write {cache_dir}/light.html and {cache_dir}/dark.html.
```

### 9b. Dispatch preview-html-reviewer

```
Score the preview HTML files at {cache_dir} against the rubric.

cache_dir: {abs path}/.claude/cache/design-md/{slug}/
light_path: {cache_dir}/light.html
dark_path: {cache_dir}/dark.html
design_md_path: {abs path}/services/{slug}.md
rubric_path: {abs path}/.claude/skills/design-md/references/rubric-preview.md
iteration_n: {M}
output_path: {cache_dir}/preview-review-{M}.json

Follow your agent definition. Write exactly one file at output_path.
```

### 9c. Loop decision (non-blocking)

- If `passed && score >= 8` → exit loop, go to Stage 10.
- Else if `M < 3` → `M += 1`, go back to 9a.
- Else (`M == 3` and not passed) → log the warning, exit loop, go to Stage 10 anyway. Preview review is non-blocking because visual previews iterate naturally during real use; the user already approved the design.md (the source of truth).

## Stage 10 — Write previews to public/

```bash
mkdir -p public/preview/{slug}
cp .claude/cache/design-md/{slug}/light.html public/preview/{slug}/light.html
cp .claude/cache/design-md/{slug}/dark.html public/preview/{slug}/dark.html
```

## Stage 11 — Build OG image

```bash
pnpm build:og
```

If the command exits non-zero:
1. Capture stderr.
2. The likely cause is invalid frontmatter that slipped past the reviewer (e.g. `gray-matter` parsing the `last_updated` as a Date object).
3. Surface stderr to the user via text. Offer two options via `AskUserQuestion`: "frontmatter 직접 수정" (open `services/{slug}.md` for editing — note the path), "취소 (파일 유지)" (do not auto-delete the placed .md; partial state is acceptable since the index page works without OG).
4. Do NOT auto-rollback the file move.

## Stage 12 — Verification (preview MCP)

Start the dev server and confirm the new entry renders correctly. This is the strongest end-to-end check.

1. `Bash` (run_in_background): `pnpm dev` — runs on port 3000.
2. `mcp__Claude_Preview__preview_start` with URL `http://localhost:3000/services/{slug}`.
3. `mcp__Claude_Preview__preview_eval`: `document.title` — should contain `{brand_name}` and `ko/design.md`.
4. `preview_eval` against the iframe: confirm `document.querySelector('iframe')?.src` contains `/preview/{slug}/dark.html` (dark is the route default per `src/routes/services/$slug.tsx:97`).
5. `preview_screenshot` once on the default tab.
6. `preview_eval`: navigate to `?tab=md` and confirm DESIGN.md tab renders the syntax-highlighted markdown.
7. `preview_screenshot` once on the `?tab=md` view.
8. Stop the dev server (kill the background bash process).

If preview MCP tools are unavailable, fall back to `Bash`: `curl -sf http://localhost:3000/services/{slug} | grep -q '<iframe'` — non-zero exit means the page failed to render.

## Stage 13 — Final report and cleanup

Print a summary message containing:

- Files written (with absolute paths):
  - `services/{slug}.md` (and `.en.md` if bilingual)
  - `public/preview/{slug}/light.html`
  - `public/preview/{slug}/dark.html`
  - `public/og/{slug}.png` (from `pnpm build:og`)
- Final review scores: design `{score}/10`, preview `{score}/10`.
- Screenshots taken during verification (paths or inline).
- Leftover TODOs:
  - "Logo asset: `public/logos/{slug}.svg` 가 아직 없습니다. 직접 추가한 뒤 frontmatter `logo: /logos/{slug}.svg` 를 채우세요."
  - "related_services: 빈 배열입니다. 검토 후 frontmatter 를 갱신하세요."
  - Any preview review warnings if iteration 3 didn't reach 8.

`AskUserQuestion`: "캐시 정리할까요?"
- "지금 삭제" → `rm -rf .claude/cache/design-md/{slug}/`
- "보관 (디버깅용)" → leave intact.

## Edge cases

- **WebFetch blocked / paywalled** — research-collector halts with INSUFFICIENT_SOURCES, skill body re-prompts user (Stage 5).
- **Reviewer never reaches 8 in 3 iterations** — checkpoint shows the failing draft and verdict; user decides via AskUserQuestion.
- **User aborts at checkpoint** — leave cache intact, print resume path. Do not delete partial work.
- **`pnpm build:og` fails** — Stage 11's error path. Do not auto-rollback the placed .md.
- **Slug already exists with both .md and .en.md** — ask the user which to update before any subagent dispatch.
- **Subagent missing expected output file** — retry once. Second failure aborts with diagnostic.
- **Pretendard CDN dependency** — tokens.css imports Pretendard from jsDelivr. Online-only assumption; flag in the final report.

## What this skill must NOT do

- Edit any file outside of `services/`, `public/preview/`, and `.claude/cache/design-md/{slug}/`.
- Skip the user checkpoint. Even if the design review passes 10/10 on iteration 1, show the draft to the user before writing to `services/`.
- Run subagents in parallel within a stage. The design-md author and reviewer are explicitly sequential because the reviewer needs the author's output. Same for preview HTML.
- Use `npm` instead of `pnpm` for any script invocation. The project uses `pnpm` (memorized preference).
- Write outside `cache_dir` from any subagent. Subagents have constrained tool access for this reason; respect that.

## Why this design

- **Five specialized subagents (vs. one general agent looping)**: author and reviewer are intentionally separated to avoid self-grading bias. Same model in both roles with different prompts produces noticeably stricter reviews.
- **Single user checkpoint at design.md**: the design.md is the source of truth — preview HTML is derivable from it. Locking the design.md after one approval gate gives the user maximum control with minimum interruption.
- **Stitch v0.1 standard sections**: chosen by the user despite existing `_demo-*.md` files using Korean editorial sections. New entries follow Stitch; old demos may be migrated separately.
- **OKLCH everywhere, never hex**: downstream LLMs (which are the primary audience for design.md) reason about lightness/chroma/hue components more reliably than hex codes.
- **File-presence state encoding**: simpler than a state.json for v1; resumable because the cache dir's contents fully describe pipeline progress.
