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

1. `Bash`: `pwd` to capture the absolute repo root. Hold this value as `${repo_root}` in your reasoning and substitute it literally into every later Bash command and dispatch prompt that touches a repo path. The shell preserves cwd across calls, but pinning the absolute path makes Stage 8/10/11 robust to any inadvertent `cd`.
2. `Bash`: `date +%Y-%m-%d` to capture today's date. Hold this value as `${today}` in your reasoning. Stage 6a passes this to the author for the `last_updated` frontmatter field; the project's date validator at `src/lib/content-parser.ts:158-171` rejects any other format.
3. `Read` `${repo_root}/package.json`. If `"name"` is not exactly `"ko-design-md"`, abort with: "이 스킬은 ko-design-md 레포 안에서만 동작합니다. 현재 디렉터리: ${repo_root}". Do not proceed.
4. Verify `${repo_root}/src/lib/content-types.ts` is readable. If not, abort.
5. `Read` `${repo_root}/src/lib/content-types.ts` and extract the live `CATEGORIES` const. Use this as the source of truth for the intake category picker (do NOT hardcode the enum from memory — it can drift).

## Stage 2 — Conversational intake

Use a single `AskUserQuestion` form with these 4 questions (multi-select where indicated):

1. **브랜드명** (text via "Other" → custom input): e.g. "토스", "Toss", "Stripe". The display name as it should appear in the `name` frontmatter.
2. **참고 URL** (text via "Other"): comma-separated URLs. **2개 이상 권장** — 1개만 입력 시 research-collector가 INSUFFICIENT_SOURCES로 중단할 수 있고, 그 경우 스크린샷 보강 필요. Brand homepage, design system page, blog post about their UI, etc.
3. **카테고리** (single-select): all values from `CATEGORIES` const, in order. Last option is `etc`.
4. **언어** (single-select): `ko (한국어 본문)`, `en (English body)`, `both (두 파일 생성)`. Default `ko` recommended.

Then ask two follow-up text inputs:
- **스크린샷 경로** (optional) — comma-separated absolute paths to screenshot files. The user can type "없음" to skip.
- **로고 자산 경로** (optional) — an existing local file path for a brand logo. Accept only `.svg`, `.png`, `.webp`, or `.avif`. The user can type "없음" to skip.

Capture the answers as: `brand_name`, `source_urls` (parsed array), `category`, `lang`, `screenshot_paths` (parsed array, may be empty), `logo_asset_path` (string or empty).

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

Resolve one `logo_public_path` value before dispatching author agents. It is either an empty string or a browser-loadable path under `/logos/`.

1. If `logo_asset_path` was provided:
   - Verify it exists and has a supported extension (`svg`, `png`, `webp`, `avif`).
   - If it already lives under `${repo_root}/public/logos/`, set `logo_public_path` to `/logos/{basename}`.
   - Otherwise copy it to `${repo_root}/public/logos/{slug}.{ext}` and set `logo_public_path` to `/logos/{slug}.{ext}`. This is allowed only for user-supplied local logo assets.
2. If no logo path was provided, auto-detect the first existing file in `public/logos/{slug}.{svg,png,webp,avif}` (in that order) and set `logo_public_path` to the matching `/logos/{slug}.{ext}`.
3. If nothing is found, set `logo_public_path` to an empty string and continue. The entry may ship without a logo, but Stage 13 must report the missing logo TODO.

The auto-detect pattern is exactly `public/logos/{slug}.{svg,png,webp,avif}`. When `logo_public_path` is non-empty, every later stage must preserve the exact same value.

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
logo_public_path: {logo_public_path or "none"}
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

### 6b. Dispatch design-md-reviewer

Via `Agent` with `subagent_type: "design-md-reviewer"`. Pass:

```
Score the draft.md at {cache_dir}/draft.md against the rubric.

cache_dir: {abs path}/.claude/cache/design-md/{slug}/
draft_path: {cache_dir}/draft.md
research_path: {cache_dir}/research.md
content_types_path: {abs path}/src/lib/content-types.ts
rubric_path: {abs path}/.claude/skills/design-md/references/rubric-design.md
expected_logo_public_path: {logo_public_path or "none"}
iteration_n: {N}
output_path: {cache_dir}/review-{N}.json

Follow your agent definition. Write exactly one file at output_path.
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
expected_logo_public_path: {logo_public_path or "none"}
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
logo_public_path: {logo_public_path or "none"}
demo_html_paths: (none — leave empty by default; pass an existing {abs path}/public/preview/*/light.html only if a visual peer genuinely fits. The early demo-courier/demo-pay previews have been removed.)
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
expected_logo_public_path: {logo_public_path or "none"}
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
mkdir -p ${repo_root}/public/preview/{slug}
cp ${repo_root}/.claude/cache/design-md/{slug}/light.html ${repo_root}/public/preview/{slug}/light.html
cp ${repo_root}/.claude/cache/design-md/{slug}/dark.html ${repo_root}/public/preview/{slug}/dark.html
```

### Logo deterministic check

If `logo_public_path` is non-empty, verify the placed main markdown and both preview HTML files all contain the same logo path:

```bash
rg -q -F "logo: {logo_public_path}" "${repo_root}/services/{slug}.md" || echo "LOGO_MISSING_MD"
rg -q -F "{logo_public_path}" "${repo_root}/public/preview/{slug}/light.html" || echo "LOGO_MISSING_LIGHT"
rg -q -F "{logo_public_path}" "${repo_root}/public/preview/{slug}/dark.html" || echo "LOGO_MISSING_DARK"
```

If any sentinel prints, do not proceed to Stage 11. If the markdown is missing the logo, re-run Stage 6a with a blocking prior-review issue that says `logo_public_path` must appear as frontmatter `logo`. If either preview is missing the logo, re-run Stage 9a with a blocking prior-preview issue that says the exact `logo_public_path` must render in both files.

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
5. `mcp__Claude_Preview__preview_eval`: `document.title` — should contain `{brand_name}` and `ko/design.md`.
6. `preview_eval` against the iframe: confirm `document.querySelector('iframe')?.src` contains `/preview/{slug}/dark.html` (dark is the route default per `src/routes/services/$slug.tsx:97`).
7. `preview_screenshot` once on the default tab.
8. `preview_eval`: navigate to `?tab=md` and confirm DESIGN.md tab renders the syntax-highlighted markdown.
9. `preview_screenshot` once on the `?tab=md` view.
10. **Stop the dev server**: `Bash`: `kill $(lsof -t -i:3000) 2>/dev/null || true`. Killing by port is portable across macOS/Linux and avoids accidentally killing other `pnpm` processes the user might be running. The `|| true` keeps the skill from aborting if the process already exited.

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
  - If `logo_public_path` is empty: "Logo asset: `public/logos/{slug}.svg|png|webp|avif` 가 아직 없습니다. 직접 추가한 뒤 frontmatter `logo: /logos/{slug}.{ext}` 를 채우고 preview HTML에도 같은 경로를 렌더링하세요."
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

- Edit any file outside of `services/`, `public/preview/`, `public/logos/{slug}.{svg,png,webp,avif}` for user-supplied logo assets, and `.claude/cache/design-md/{slug}/`.
- Skip the user checkpoint. Even if the design review passes 10/10 on iteration 1, show the draft to the user before writing to `services/`.
- Run subagents in parallel within a stage. The design-md author and reviewer are explicitly sequential because the reviewer needs the author's output. Same for preview HTML.
- Use `npm` instead of `pnpm` for any script invocation. The project uses `pnpm` (memorized preference).
- Write outside `cache_dir` from any subagent. Subagents have constrained tool access for this reason; respect that.

## Why this design

- **Five specialized subagents (vs. one general agent looping)**: author and reviewer are intentionally separated to avoid self-grading bias. Same model in both roles with different prompts produces noticeably stricter reviews.
- **Single user checkpoint at design.md**: the design.md is the source of truth — preview HTML is derivable from it. Locking the design.md after one approval gate gives the user maximum control with minimum interruption.
- **Stitch v0.1 standard sections**: every catalog entry follows the Stitch v0.1 structure (English headings, OKLCH tokens, citation hygiene). The early `_demo-*.md` fixtures that used Korean editorial headings have been removed; if older entries surface in git history they are superseded.
- **OKLCH everywhere, never hex**: downstream LLMs (which are the primary audience for design.md) reason about lightness/chroma/hue components more reliably than hex codes.
- **File-presence state encoding**: simpler than a state.json for v1; resumable because the cache dir's contents fully describe pipeline progress.
