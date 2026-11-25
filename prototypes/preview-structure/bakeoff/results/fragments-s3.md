# fragments, 문제 3 결과

가지 `eval/fragments-s3`, 시작 `2a077dca`, 풀이 커밋 `b839cb27`.

## 명령 기록

| 명령/도구 | 결과 |
| --- | --- |
| `git switch -c eval/fragments-s3 2a077dca` | 성공 |
| Read `fragments/zones.ts` | 성공. `ZONES` 배열 한 곳 |
| Glob `preview-src/*/zones/*.html` | 성공. chzzk 는 selection 파일이 없고, toss 는 inputs 와 selection 둘 다 있음 |
| Edit `zones.ts`: `selection` 을 `inputs` 앞으로, `{ id: "tables", title: "표" }` 를 `content` 와 `feedback` 사이에 | 성공 |
| Read `preview-src/chzzk/zones/content.html` | 성공. 칸 넷(live-card, badge, side-card-category-card, channel-head) |
| Write `preview-src/chzzk/zones/tables.html` (badge 칸 18줄을 그대로) | 성공 |
| Edit `content.html`: badge 칸 블록과 뒤 빈 줄을 지움 | 성공 |
| Read `fragments.test.ts` 174~189줄 | 성공. `tables` 를 "모르는 구역" 의 예로 쓰는 테스트 |
| Edit `fragments.test.ts` 두 곳: 모르는 구역의 예를 `tables` 에서 `charts` 로(원본 꼴 테스트와 서빙 파일 테스트) | 성공 |
| Grep 구역 식별자 문자열(`prototypes/preview-structure`) | 성공. 구조 안에서 구역 목록을 가진 곳은 `zones.ts` 뿐. `base-notes/` 의 두 파일에도 목록이 있으나 고치지 않는 파일이고 이 구조의 코드가 읽지 않음 |
| `pnpm previews:build` | 성공. chzzk, toss |
| `pnpm previews:check` | 성공. 위반 없음, 어긋남 없음 |
| `pnpm exec vitest run prototypes/preview-structure/fragments` | 성공. 21 passed. Duration 287ms. 끝의 `ReferenceError`, `close timed out` 은 잡음(환경) |
| `pnpm validate:previews --slug toss` | 성공. 0 blocking, 2 warn(시작 때부터 있던 것) |
| `pnpm validate:previews --slug chzzk` | 성공. 0 blocking, 0 warn |
| Grep 구역 줄(chzzk 서빙 파일) | 성공. screens, buttons, inputs, navigation, content, **tables**, feedback |
| Grep 구역 줄(toss 서빙 파일) | 성공. screens, buttons, **selection, inputs**, navigation, content, feedback |
| `git ls-files --eol` content.html | 성공. `w/lf` |
| `git diff --stat` | 성공 |
| `git ls-files --eol` tables.html | 성공. `w/lf` |
| `git diff --numstat 2a077dca HEAD` | 성공 |

- 명령 수(커밋 빼고): Read 3, Glob 1, Edit 4, Write 1, Grep 3, Bash 10 = 22. 실패 0.
- 고친 뒤 확인까지: build, check, vitest, validate 둘, 구역 순서 Grep 둘 = 7. 걸린 시간: vitest 287ms 말고는 재지 않음.

## 구역 목록을 고친 곳

- 1곳: `prototypes/preview-structure/fragments/zones.ts` 의 `ZONES`(+2 −1). 조립기, 약속 검사, 메시지의 순서 문장이 모두 이 목록을 읽었다(검사 메시지에 새 순서 `screens → buttons → selection → inputs → … → tables → …` 가 그대로 나옴).
- 사람이 읽는 기준 `STANDARD.md` 1절 표는 고치지 않는 파일이라 옛 순서 그대로다.

## 항목마다 고친 줄

| 항목 | 원본 | 서빙 파일(조립 결과) |
| --- | --- | --- |
| chzzk | `content.html` −19, `tables.html` +18 (칸 하나를 옮김) | +26 −21 |
| toss | 0 (순서만 바뀌어 원본은 그대로) | +93 −93 |

## 파일 수와 줄 수 (`git diff --numstat 2a077dca b839cb27`)

| 갈래 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 손으로 고친 원본 | 3 (`zones.ts` +2 −1, `chzzk/zones/content.html` +0 −19, `chzzk/zones/tables.html` +18 −0) | 20 | 20 |
| 명령이 만든 산출물 | 2 (`public/preview/chzzk/preview.html` +26 −21, `public/preview/toss/preview.html` +93 −93) | 119 | 114 |
| 안내 문서와 테스트 | 1 (`fragments.test.ts` +7 −7) | 7 | 7 |

## 일부러 넣은 잘못

토스에서 `selection` 과 `inputs` 구역의 순서를 뒤바꿨다. 이 구조의 원본에는 구역 순서가 없으므로(안내 85줄) 서빙 파일에서 두 `<section>` 을 맞바꾸는 스크립트(임시 폴더 `swap-zones.mjs`, `node` 로 실행)를 썼다.

| 명령 | 결과 |
| --- | --- |
| Write 스크립트 | 성공 |
| `node …/swap-zones.mjs public/preview/toss/preview.html` | 성공. `swapped selection and inputs` |
| `pnpm previews:check toss` | 실패(종료 1, 기대한 대로) |
| `git restore public/preview/toss/preview.html` | 성공 |
| `git status --short` | 깨끗함 |

약속 검사 출력(그대로):

```
  ✗ public/preview/toss/preview.html:1829 — 원본에서 조립한 결과와 1829줄부터 다르다. 원본을 고친 뒤 조립하지 않았거나 서빙 파일을 손으로 고쳤다. `pnpm previews:build toss` 를 돌리고 그 결과를 함께 커밋한다(서빙 파일은 손으로 고치지 않는다)
  ✗ public/preview/toss/preview.html:1931 — 구역 순서가 틀렸다: `selection` 가 `inputs` 뒤에 있다. 순서는 항목이 아니라 prototypes/preview-structure/fragments/zones.ts 의 목록이 정한다(screens → buttons → selection → inputs → navigation → content → tables → feedback → brand). 서빙 파일을 손으로 고쳤다면 원본(preview-src/toss/)을 고치고 `pnpm previews:build toss` 로 다시 만든다.

[previews:check] 2건
```

- 틀린 순서를 잡았다: 예. 어긋남 검사(1829줄부터 다름)와 순서 검사(1931줄, 뒤로 밀린 `selection` 구역의 줄) 둘 다.

## 막히거나 헷갈린 곳

- 기존 테스트가 `tables` 를 "목록에 없는 구역" 의 예로 쓰고 있었다. 안내에는 이 사실이 없고, `zones.ts` 를 고친 뒤 테스트를 돌리기 전에 테스트 파일을 미리 읽어서(문제 2 에서 읽은 기억) 찾았다. 예를 `charts` 로 바꿨다.
- 치지직에서 옮길 칸: 문제가 "콘텐츠 구역 칸 하나" 라고만 해서 `badge` 를 골랐다. 안내 110줄의 순서(칸 블록을 잘라 `zones/{새 식별자}.html` 에 붙이고, 칸 이름과 내용은 그대로)를 따랐다.
- 토스는 `tables` 에 드는 칸이 없어 파일을 만들지 않았다(안내 24줄 "규정되지 않은 구역은 파일을 만들지 않는다").
- 열어 본 파일: `zones.ts`, `chzzk/zones/content.html`, `fragments.test.ts`, 서빙 파일 두 장(Grep).
