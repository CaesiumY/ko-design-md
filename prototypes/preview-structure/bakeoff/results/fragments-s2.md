# fragments, 문제 2 결과

가지 `eval/fragments-s2`, 시작 `2a077dca`, 풀이 커밋 `09013c9d`.

## 명령 기록

| 명령/도구 | 결과 |
| --- | --- |
| `git switch -c eval/fragments-s2 2a077dca` | 성공 |
| Read `fragments/assemble.ts` | 성공. 칸 마크업은 `assemble()` 끝 칸 반복문(397~414줄) 한 곳 |
| Read `fragments/contract.ts` | 성공. 칸 검사는 `checkServed()` 의 칸 반복문 |
| Read `fragments/cli.ts` | 성공. `check` 는 새 조립을 검사하고, 어긋나면 커밋된 서빙 파일도 `checkServed` 로 본다(96~107줄) |
| Read `fragments/fragments.test.ts` | 성공. 칸 마크업을 글자 그대로 비교하는 테스트 둘(84~107줄), 이름표 없는 칸 테스트(276줄) |
| Edit `assemble.ts`: 칸 줄에 `role="group" aria-labelledby="pv-label-{name}"`, 이름표 줄과 다크 이름표 줄에 `id="pv-label-{name}"` | 성공 |
| Edit `contract.ts`: 칸의 `role`, `aria-labelledby`, 이름표 `id` 검사 | 성공 |
| Edit `contract.ts`: 다크 `<template>` 안 이름표의 `id` 검사(parse5 의 template `content` 를 읽음) | 성공 |
| Edit `fragments.test.ts` 세 곳: 글자 비교 두 곳을 새 마크업으로, 새 테스트 하나(aria-labelledby 없음, role 없음, 이름표 id 없음, 다크 이름표 id 없음), 이름표 없는 칸 테스트의 지울 줄을 새 마크업으로 | 성공 |
| `pnpm previews:build` | 성공. chzzk, toss |
| `pnpm previews:check` | 성공. 위반 없음, 어긋남 없음 |
| `pnpm exec vitest run prototypes/preview-structure/fragments` | 성공. 22 passed. Duration 274ms. 끝의 `ReferenceError: module is not defined`, `close timed out after 10000ms` 는 테스트 결과와 무관한 잡음(환경) |
| `pnpm validate:previews --slug toss` | 성공. 0 blocking, 2 warn(시작 때부터 있던 것) |
| `pnpm validate:previews --slug chzzk` | 성공. 0 blocking, 0 warn |
| `git diff --stat` | 성공 |
| Grep 수 세기(두 파일 glob 한 번에) | 실패. `No matches found`. 종류: 내 실수(glob `{toss,chzzk}/preview.html` 이 경로와 맞지 않음) |
| Grep 역참조 정규식 | 실패. `backreferences are not supported`. 종류: 내 실수(ripgrep 은 기본으로 역참조를 못 씀) |
| Grep 수 세기, 파일마다 따로 4번 | 성공. toss 칸 41개 중 41개, chzzk 칸 14개 중 14개가 `role="group" aria-labelledby="pv-label-…"` 를 가짐 |
| Edit `README.md` 칸 문법 표 두 줄(칸 줄과 이름표 두 줄) | 성공 |
| `git diff --stat` | 성공 |
| `pnpm exec prettier --check` (바꾼 ts 셋) | 성공 |

- 명령 수(커밋 빼고): Read 4, Edit 7, Bash 9, Grep 6 = 26. 실패 2(둘 다 내 실수, 확인용 Grep).
- 고친 뒤 확인까지: build, check, vitest, validate 둘, Grep 수 세기 = 확인 명령 6(실패 2 빼고). 걸린 시간: vitest 274ms 말고는 재지 않음.

## 일부러 넣은 잘못

토스의 `button-size` 칸(서빙 1768줄)에서 `aria-labelledby="pv-label-button-size"` 를 지웠다. 이 구조에서는 칸 감싸개를 조각이 쓰지 않으므로(조각에 쓰면 원본 꼴 검사가 막는다) 잘못을 넣을 수 있는 곳이 서빙 파일뿐이라 서빙 파일을 Edit 로 고쳤다.

| 명령 | 결과 |
| --- | --- |
| Grep, Read 로 1768줄 확인 후 Edit | 성공 |
| `pnpm previews:check toss` | 실패(종료 1, 기대한 대로) |
| `git restore public/preview/toss/preview.html` | 성공 |
| `git status --short` | 깨끗함 |

약속 검사 출력(그대로):

```
  ✗ public/preview/toss/preview.html:1768 — 원본에서 조립한 결과와 1768줄부터 다르다. 원본을 고친 뒤 조립하지 않았거나 서빙 파일을 손으로 고쳤다. `pnpm previews:build toss` 를 돌리고 그 결과를 함께 커밋한다(서빙 파일은 손으로 고치지 않는다)
  ✗ public/preview/toss/preview.html:1768 — 칸 `button-size` 의 aria-labelledby 가 "pv-label-button-size" 가 아니다(지금: 없음). 칸과 이름표의 마크업은 조립기(prototypes/preview-structure/fragments/assemble.ts 의 칸 반복문)가 쓴다. 서빙 파일을 손으로 고쳤다면 원본(preview-src/toss/)을 고치고 `pnpm previews:build toss` 로 다시 만든다.

[previews:check] 2건
```

- 빠뜨린 칸을 잡았다: 예. 어긋남 검사와 새 약속 검사 둘 다 같은 줄을 가리켰다.
- 고칠 곳을 가리키는지: 서빙 파일의 줄(1768)과 칸 이름을 말하고, 고치는 법으로 `pnpm previews:build toss` 를 말한다. 원본 줄로 옮겨 적지는 않는다(서빙 파일을 손으로 고친 경우라 원본에 해당 줄이 없다. 어긋났을 때 `cli.ts` 가 커밋된 서빙 파일을 `origins` 없이 `checkServed` 로 보기 때문).

## 파일 수와 줄 수 (`git diff --numstat 2a077dca 09013c9d`)

| 갈래 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 손으로 고친 원본(조립기와 약속 검사) | 2 (`assemble.ts` +8 −3, `contract.ts` +26 −1) | 34 | 4 |
| 명령이 만든 산출물 | 2 (`public/preview/chzzk/preview.html` +32 −32, `public/preview/toss/preview.html` +82 −82) | 114 | 114 |
| 안내 문서와 테스트 | 2 (`README.md` +3 −3, `fragments.test.ts` +49 −6) | 52 | 9 |

- 항목의 조각(`preview-src/`)은 하나도 고치지 않았다. 55칸 모두 조립기 한 곳의 수정과 `pnpm previews:build` 한 번으로 바뀌었다.
- 손으로 고친 곳: 조립기 반복문 한 곳, 약속 검사 두 곳, 테스트 세 곳, README 표 두 곳. 스크립트(조립)로 고친 곳: 서빙 파일 두 장의 196줄.

## 막히거나 헷갈린 곳

- 다크 이름표의 `id`: 다크 `<template>` 안의 이름표에도 같은 `id` 를 다는지. README 61줄("이름표에 `id` 같은 속성을 달면 두 줄 모두에 같은 값을 단다")에서 답을 얻었다. 그 다크 이름표를 검사하려면 parse5 의 `<template>` 은 자식이 `childNodes` 가 아니라 `content` 에 있다는 것을 알아야 했다(코드 지식으로 처리, 안내에는 없음).
- 이름표 없는 칸 테스트가 새 검사 때문에 지적을 둘 내지 않을지: 이름표가 없을 때는 이름표 `id` 검사를 하지 않게 두어 그 테스트의 "지적 하나" 를 지켰다.
- 잘못을 넣을 곳: 문제는 "토스의 칸 하나에서 지운 상태" 라고 했는데, 이 구조의 원본에는 칸 감싸개가 없어 서빙 파일에서만 지울 수 있었다. 안내 85줄("틀린 순서는 서빙 파일을 손으로 고쳤을 때만 생기고")과 같은 사정으로 읽었다.
- 열어 본 파일: `assemble.ts`, `contract.ts`, `cli.ts`, `fragments.test.ts`, `README.md`, 서빙 파일 한 장.
