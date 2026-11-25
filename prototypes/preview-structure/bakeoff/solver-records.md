기록 파일 열여덟 개에서 그대로 옮겼다. 파일에 없는 것은 "기록 없음"이다. 줄 수는 "+더함 −뺌" 꼴이다. "종류 표기 없음"은 푼 쪽이 종류를 붙이지 않았다는 뜻이다. 숫자가 어긋난 곳은 한 군데로, components 문제 5 의 명령 수다(표 1 아래에 적었다).

## 표 1. 문제 5, 1, 2, 3

| 구조 | 문제 | 실행한 명령 수 | 실패한 명령 수 | 실패마다 | 손으로 고친 원본 | 명령이 만든 산출물 | 안내와 테스트 | 명령이 찍은 시간 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| html-frame | 5 | 20 | 0 | 없음 | 1파일 +2 −2 | 0 | 0 | pnpm install 1m 14.8s, 그 밖은 재지 않음 |
| html-frame | 1 | 17 | 1 | 내 실수: Grep 의 glob 을 잘못 줘서 "No matches found" | 1파일 +2 −2 | 0 | 0 | vitest Duration 1.75s, 그 밖은 재지 않음 |
| html-frame | 2 | 37 | 0 (34번은 일부러 낸 실패, 기대한 실패) | 없음 | 2파일 +114 −114 (스크립트로 고침, 토스 82/82, 치지직 32/32) | 0 | 4파일 +123 −19 (README 7/5, check-frame.test.ts 73/7, check-frame.ts 36/0, skeleton.html 7/7). 이 중 손으로 고친 곳은 README, 테스트, check-frame.ts 의 +116 −12 | vitest Duration 3.03s, 그 밖은 재지 않음 |
| html-frame | 3 | 32 | 0 (30번은 일부러 낸 실패) | 없음 | 2파일 +98 −93 (토스 93/93 스크립트로 옮김, 치지직 5/0 손) | 0 | 3파일 +27 −9 (check-frame.ts 2/1, README 7/6, check-frame.test.ts 18/2) | vitest Duration 1.63s, 그 밖은 재지 않음 |
| fragments | 5 | 14 (시작 점검 7개는 따로, 커밋 뺌) | 0 | 없음 | 2파일 +2 −2 | 1파일 +2 −2 | 0 | pnpm install 1m 18.7s, 그 밖은 재지 않음 |
| fragments | 1 | 12 (커밋 뺌) | 1 | 종류 없음: 조립 전 `previews:check` 의 어긋남 지적. 의도한 확인이라 적음 | 1파일 +2 −2 | 2파일 +4 −4 | 0 | vitest Duration 478ms, 그 밖은 재지 않음 |
| fragments | 2 | 26 (Read 4, Edit 7, Bash 9, Grep 6, 커밋 뺌) | 2 (기대한 실패 1은 별도) | 내 실수: Grep glob 이 경로와 안 맞아 "No matches found". 내 실수: Grep "backreferences are not supported" | 2파일 +34 −4 | 2파일 +114 −114 | 2파일 +52 −9 | vitest Duration 274ms, 그 밖은 재지 않음 |
| fragments | 3 | 22 (Read 3, Glob 1, Edit 4, Write 1, Grep 3, Bash 10, 커밋 뺌) | 0 (일부러 넣은 잘못의 `previews:check toss` 가 기대한 실패 1) | 없음 | 3파일 +20 −20 | 2파일 +119 −114 | 1파일 +7 −7 | vitest Duration 287ms, 그 밖은 재지 않음 |
| components | 5 | 적힌 값은 "26개 안팎". 번호 붙은 목록은 25개. 어긋남 (결과 커밋 전) | 0 | 없음 | 1파일 +2 −2 | 1파일 +2 −2 | 0 | pnpm install 1m 19.6s, 그 밖은 재지 않음 |
| components | 1 | 14 | 0 | 없음 | 1파일 +2 −2 | 2파일 +4 −4 | 0 | vitest Duration 356ms, 그 밖은 재지 않음 |
| components | 2 | 40 (번호 25~28 은 Grep 4개를 묶은 번호) | 뜻하지 않은 2, 기대한 2 (36, 37) | 내 실수: `prettier --check` "Code style issues found in 2 files" (긴 줄을 손으로 썼음). 내 실수: Grep glob 이 맞지 않아 0건. 기대한 실패: `pv:check toss` exit 1, vitest 1 failed | 2파일 +37 −4 | 2파일 +114 −114 | 2파일 +54 −10 | vitest 316ms, 706ms, 그 밖은 재지 않음 |
| components | 3 | 26 | 뜻하지 않은 0, 기대한 2 (23, 24) | 기대한 실패: `pv:check toss` exit 1, vitest 1 failed | 2파일 +26 −23 | 2파일 +119 −113 | 0 | vitest 305ms, 318ms, 그 밖은 재지 않음 |

components 문제 1, 2, 3 은 같은 작업 폴더에서 쳤고 pnpm install 을 다시 돌리지 않았다(시작 절차는 components 문제 5 파일에 있다). html-frame 문제 5 의 명령 20개는 시작 단계를 포함한 값이고, html-frame 문제 1, 2, 3 의 명령 기록은 시작 단계 없이 `git switch` 부터다.

## 표 2. 문제 4

| 구조 | 풀이 | 실행한 명령 수 | 실패한 명령 수 | 실패마다 | 처음으로 두 검사가 모두 통과한 회차 | 확인 회차 수 | 손으로 쓴 파일 | 명령이 만든 파일 | 안내에서 답을 못 찾아 치지직이나 토스를 보고 따라 한 곳 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| html-frame | a | 23 | 1 | 안내: `cp` 가 "No such file or directory". 안내 6절 1번이 폴더를 만들라고 하지 않음. `git rm` 이 빈 폴더를 지웠음 | 1회차(최소 채우기 상태) | 2 | 1파일 270줄 (손으로 더한 221, 뼈대에서 남은 49) | 0 (뼈대 90줄을 `cp` 로 복사해 출발) | 3항목, 모두 치지직: (1) 시연 자리 안 상태 이름표와 스펙 줄의 class 꼴, 다크용 template 자리 (2) 화면을 `role="img"` 와 `aria-label` 한 장으로 두는 꼴(screen-live-watch) (3) "직접 입력" 줄을 `<label>` 안 `<input>` 과 `.hint` 로 두는 꼴(search-field). 토스는 기록 없음 |
| html-frame | b | 20 | 1 | 내 실수: `cp` 가 "No such file or directory". 준비 단계 `git rm` 이 빈 폴더까지 지운 것을 놓침 | 1회차 | 1 | 1파일 243줄 (+243 −0). cp 로 복사한 뼈대 90줄을 Write 로 통째로 다시 씀 | 0 | 4항목, 모두 치지직: (1) 상태 이름표 꼴과 `.state.full`, `.in-stack` (2) "직접 입력" 줄 (3) 돋보기 SVG 경로, `box-sizing`, `svg display`, 히어로 padding 꼴, `@media` 900px 와 720px 경계 (4) 화면 칸 이름표의 `(… 가정)` 표지와 `catalog-dummy` 문장 꼴. 토스는 "보지 않았다" |
| fragments | a | 18 | 1 | 구조: `previews:check laftel` 1회차가 "서빙 파일이 없다". 안내 「새 항목을 쓰는 순서」 4번이 예고한 것 | 2회차(조립 뒤) | 2 | 6파일 235줄 (brand.css 131, dark.css 10, hero 10, screens 31, buttons 38, inputs 15) | 1파일 372줄 (`pnpm previews:build laftel`) | 5항목, 모두 치지직: (1) brand.css 의 두 칸 들여쓰기와 `:root`, 전역, 컴포넌트 순서 (2) 히어로 감싸개 꼴(`.hero-wrap` 의 padding 과 2열 grid) (3) 상태 이름표와 스펙 줄의 class 꼴, "직접 입력" 줄 (4) 검색 아이콘 SVG 경로와 서체 스택 (5) 다크에서 달라지는 스펙 줄 뒤에 `<template data-theme-variant="dark">` 를 두는 꼴. 토스 원본은 열지 않음 |
| fragments | b | 19 | 1 | 구조: `previews:check laftel` 가 "서빙 파일이 없다". 안내가 예고한 지적 | 2회차(조립 뒤 첫 확인) | 2 | 6파일 240줄 (brand.css 138, dark.css 10, hero 13, screens 33, buttons 32, inputs 14) | 1파일 377줄 | 7항목, 모두 치지직: (1) CSS 두 칸 들여쓰기 (2) `:root` 의 `--background`, `--foreground`, `--primary`, `--primary-foreground` 와 Pretendard 서체 스택 (3) `prefers-reduced-motion` 블록 (4) 히어로 감싸개 `hero-wrap`, 두 열 배치, 좁은 폭 접기 `@media` (5) 상태 이름표와 스펙 줄의 class 꼴, 다크 스펙 줄 `<template>` (6) 화면 목업 꼴(헤더 띠, 썸네일 자리 글, `role="img"` 와 `aria-label`) (7) 검색 입력 "직접 입력" 줄의 꼴과 조작 안내 문구. 토스는 "보지 않았다" |
| components | a | 셸 명령 21 (그 밖에 Grep 2, Glob 1) | 0 | 없음 | 1회차 | 2 (2회차는 prettier 뒤 `pv:check` 만) | 3파일 281줄 (preview.ts 136, light.css 135, dark.css 10) | 1파일 376줄 (`pnpm pv:build laftel`) | 5항목, 모두 치지직. 파일은 "안내 6절 1번이 치지직을 복사해 시작하라고 해서 치지직을 본 것은 안내대로"라 했고 그중 안내가 말하지 않은 곳만 적었다: (1) `:root` 의 `--background`, `--foreground`, `--primary`, `--primary-foreground` 별칭 (2) 상태 이름표와 스펙 줄 꼴, 스펙 한 줄만 다크에서 다를 때 바로 뒤에 `<template data-theme-variant="dark">` (3) 입력 칸의 모양 견본 옆 실제 `<input>` "직접 입력" 줄과 조작 안내 (4) 히어로 감싸개 좌우 여백 `var(--pv-gutter)` (STANDARD 2절에도 있다고 함) (5) 화면을 `role="img"` 로 그리고 안에 실제 컨트롤을 두지 않는 것 (STANDARD 5절에도 있다고 함) |
| components | b | 22 | 0 | 없음 | 1회차 | 1 | 3파일 249줄 (preview.ts 121, light.css 118, dark.css 10) | 1파일 345줄 | 5항목, 모두 치지직: (1) `:root` 의 `--background`, `--foreground`, `--primary`, `--primary-foreground` 와 body 기본 줄 (2) 히어로 감싸개 `padding … var(--pv-gutter) …` 꼴 (3) `dark.css` 를 `[data-theme="dark"] { … }` 한 덩어리에 OKLCH 글자로 쓰는 꼴 (4) 상태 이름표와 스펙 줄 class 꼴과 조작 안내 문구 꼴 (5) 로고 경로 `/logos/{slug}.png` 와 화면 목업 안 로고 `alt=""` |

문제 4 의 풀이마다 준비 커밋(라프텔 서빙 파일 삭제만)이 따로 있다. 명령 수에 준비 단계가 들어 있는지는 구조마다 다르게 적혀 있다.

## 목록 3. 막히거나 헷갈린 곳

html-frame 문제 5
- 이름표 끝 `(가정)` 을 어떤 꼴로 붙일지 → 같은 파일 다른 이름표가 `, 치수 (가정)` 꼴이었으나 지적이 `(가정)` 만 말해 ` (가정)` 만 더함 → 지적 문장. 종류 표기 없음.
- 첫 `<button>` 의 다크 template 사본 여부 → 1464~1533줄을 읽어 확인, 사본 없음 → 종류 표기 없음.

html-frame 문제 1
- 굵기 700 이 변수 기본값이라 항목이 변수를 주면 안 바뀐다 → Grep 으로 두 항목 모두 변수를 안 줌을 확인 → 안내 3절이 이 변수를 "선택"이라 말해 찾을 곳을 앎. 연 파일 1개. 종류 표기 없음.
- 렌더 확인법: `dom-diff.ts` 는 두 HTML 비교 도구라 바꾸기 전 `public/` 을 따로 준비해야 해서 Playwright 로 계산 스타일만 재는 스크립트를 임시 폴더에 씀 → 종류 표기 없음.
- `STANDARD.md` 3절 표가 "안 주면 700" 이라 적혀 있음 → 고치지 않는 파일이라 그대로 둠. 이 구조 안내(README)에는 22px, 700 이 적혀 있지 않음 → 종류 표기 없음.

html-frame 문제 2
- 다크 template 안 이름표에도 id 를 달지 → 안내 3절 설명과 `iframe.js` 의 `importNode` 확인 → 종류 표기 없음.
- 이름표 한 조각만 다크에서 다른 칸은 바깥 `<p>` 에만 id → 안내 3절 → 종류 표기 없음.
- 고칠 곳 → 안내 6절 「틀의 태그를 바꾼다」가 바로 알려 줌. 스크립트는 안내가 주지 않아 직접 씀 → 종류 표기 없음.
- `skeleton.html` 도 고쳐야 하는지 → 테스트 「passes the skeleton a new entry starts from」을 읽고 앎. 안내 6절은 뼈대를 함께 고치라고 하지 않음 → 종류 표기 없음.

html-frame 문제 3
- 치지직의 어느 칸을 표 구역으로 옮길지 → 문제가 "칸 하나를 골라"라고만 해서 마지막 칸 `channel-head` 를 고름 → 종류 표기 없음.
- 고칠 곳 → 안내 6절 「구역을 더하거나 순서를 바꾼다」를 따름. 안내가 말하지 않은 둘(README 5절 예시 메시지, 테스트의 "모르는 구역" 예 `tables`)은 Grep(명령 14)으로 찾음 → 종류 표기 없음.
- 문제 2 에서 더한 칸 약속(`cell-group`)은 이 가지에 없음(0ef2f879 에서 새로 쳤기 때문) → 종류 표기 없음.

html-frame 문제 4a
- 뼈대를 새 항목 자리로 복사하는 법 → 안내 6절 1번에 폴더를 만들라는 말이 없음, 출력을 보고 `mkdir -p` → 종류: 안내.
- 틀 변수에 어느 토큰을 줄지 → 안내 3절, STANDARD 3절 표, md 의 `membership-card` 와 Do 문장 → 종류: md 해석.
- 라이트 색(md 는 다크에서 잰 값) → 같은 이름의 라이트 토큰으로 옮기고 이름표에 `(라이트 … 가정)` → 종류: md 해석.
- 보라 1차 버튼을 그릴지 → STANDARD 1절 문장을 따라 그림, hover 의 `PURPLE700` 은 값이 없어 넣지 않음 → 종류: md 해석.
- 글자 크기가 md 에 없는 곳 → 타입 스케일 가까운 값을 쓰고 `(… 가정)` → 종류: md 해석.
- button-cta 를 어디에 그릴지(흰 면) → `dark-bg-3` 면 위에 그림 → 종류: md 해석.
- 진행바 바탕 막대 색이 md 에 없음 → 채움만 그림 → 종류: md 해석.
- 상태 견본과 "직접 해 볼 줄" → `STANDARD.md` 7절(안내에는 없음). 연 파일 1 → 종류 표기 없음.

html-frame 문제 4b
- 뼈대를 복사할 자리가 없었음 → `cp` 출력, `mkdir` 로 풂, 연 파일 0 → 종류: 내 실수.
- md 가 다크 값만 준 컴포넌트의 라이트 값 → md Colors 절의 시맨틱 변수 서술. 연 파일 1 → 종류: md 해석.
- 흰 CTA 의 글자색 → 다크에서 안 바뀌는 `--lf-cta-ink` 를 따로 두고 뒤에 `--lf-scrim` 면을 깖 → 종류: md 해석.
- `--pv-*` 에 어느 토큰을 줄지 → README 3절과 STANDARD 3절 표(변수의 뜻은 안내에서 얻음) → 어느 토큰이 맞는지는 md 해석.
- 글자 크기를 md 가 주지 않은 버튼 → 16px, 12px 와 `(가정)` → 종류: md 해석.
- 버튼을 실제 `<button>` 으로 쓸지 → 안내에 말이 없었고 치지직은 `<span>` 이었음. `<button type="button">` 으로 씀 → 종류 표기 없음.

fragments 문제 5
- 없음. (히어로 버튼 1535~1537줄을 빼고 1550줄 뒤를 고른 일은 적었으나 막힘으로 세지 않음.)

fragments 문제 1
- 굵기 700 을 어디서 바꿀지 → `preview-src/` 를 Grep 해 두 항목 모두 변수를 안 줌을 확인. STANDARD 3절 표의 "안 주면 700" 은 고치지 않는 파일이라 그대로 → 종류 표기 없음.

fragments 문제 2
- 다크 이름표에도 id 를 달지 → README 61줄 문장. 다만 parse5 의 template 자식이 `content` 에 있다는 것은 코드 지식으로 처리했고 안내에는 없음 → 종류 표기 없음.
- 이름표 없는 칸 테스트가 지적 둘을 내지 않게 → 이름표가 없으면 이름표 id 검사를 하지 않게 둠 → 종류 표기 없음.
- 잘못을 넣을 곳(원본에 칸 감싸개가 없음) → 안내 85줄과 같은 사정으로 읽음. 서빙 파일에서만 지울 수 있었음 → 종류 표기 없음.

fragments 문제 3
- 기존 테스트가 `tables` 를 "목록에 없는 구역" 예로 씀 → 안내에 없음. 문제 2 에서 읽은 기억으로 테스트를 미리 읽어 찾음, 예를 `charts` 로 바꿈 → 종류 표기 없음.
- 치지직에서 옮길 칸 → 문제가 "칸 하나"라고만 해서 `badge` 를 고름. 순서는 안내 110줄 → 종류 표기 없음.
- 토스는 `tables` 에 들 칸이 없어 파일을 안 만듦 → 안내 24줄 → 종류 표기 없음.

fragments 문제 4a
- 원본 CSS 의 들여쓰기 → 안내는 CSS 들여쓰기를 말하지 않음, 치지직 brand.css 에서 얻음 → "안내 탓(말하지 않음)". 검사가 막지 않아 중요한지는 모른다고 함.
- 다크 시트에 값을 글자로 쓸지 참조로 쓸지 → 안내와 STANDARD 모두 말하지 않음, `var(--lf-dark-…)` 참조로 씀(`oklch 0/32D`) → "스스로 정했다".
- 조각 파일의 첫 줄 들여쓰기 → 안내의 칸 표("줄 머리")와 치지직 hero.html 로 확인 → 종류 표기 없음.

fragments 문제 4b
- brand.css 의 들여쓰기 → 안내가 말하지 않음, 치지직 brand.css 를 열어 두 칸을 따름. 연 파일 1 → 종류 표기 없음.
- `--background`, `--foreground`, `--primary`, `--primary-foreground` 를 둘지 → 안내와 STANDARD 3절은 `--pv-*` 만 말함, 치지직에 있어 따라 넣음. 검증기가 요구하는지는 확인 안 함 → 종류 표기 없음.
- 히어로의 꼴 → 안내 「원본이 놓이는 곳과 꼴」과 치지직 hero.html → 종류 표기 없음.
- 시연 자리 안 상태 이름표와 스펙 줄 → STANDARD 2절, 7절 + 치지직 buttons, inputs → 종류 표기 없음.
- `prefers-reduced-motion` 블록 → STANDARD 5절이 "기존 방식 그대로"라고만 함, 치지직 brand.css 에서 옮김 → 종류 표기 없음.
- 막혀서 멈춘 곳은 없다고 적음.

components 문제 5
- 없음. 안내 9절의 `pnpm pv:where toss 1768 1570` 예가 같은 꼴이라 그대로 씀.

components 문제 1
- 굵기가 틀 기본값인지 항목이 준 값인지 → 안내 2절 `light.css` 설명과 7절 표, Grep 으로 두 항목이 변수를 안 줌 확인. 연 파일 1 → 종류 표기 없음.

components 문제 2
- 다크 이름표에도 id 를 달지 → STANDARD 2절과 안내 2절. `iframe.js` 는 열지 않음 → 종류 표기 없음.
- `pv:where` 를 같이 고쳐야 하는지 → 안내 7절 표("속성을 더하는 것은 괜찮다")와 `where.ts` 확인 → 종류 표기 없음.
- 일부러 넣는 잘못을 어디에 넣을지(칸 속성이 모듈에 없음) → 안내에 이 경우가 적혀 있지 않아 서빙 파일을 고침 → 종류 표기 없음.

components 문제 3
- 치지직 콘텐츠 칸 넷 가운데 어느 것을 옮길지 → 문제가 정하지 않아 `badge` 를 고름(표 시연인 칸은 없음) → 종류 표기 없음.
- 일부러 뒤바꾸는 자리 → 안내 2절 문장("구역은 … `kit/zones.ts` 의 순서로 나온다")으로 서빙 파일에서 바꿈. 안내 「구역을 더하거나 순서를 바꾸는 법」 1~5 를 그대로 따랐고 다른 곳을 찾을 일은 없었다고 함 → 종류 표기 없음.

components 문제 4a
- `validate:previews` 가 무엇을 보는지 → 안내 README 가 말하지 않음, `src/lib/preview-validator*.ts` Grep 두 번이 둘 다 결과 없음(패턴이 안 맞음), `.claude/rules/preview.md` 로 레이아웃 가드와 `--primary-foreground` 규칙을 앎 → 종류 표기 없음("막혀서 실패한 명령은 없다"고 함).
- `:root` 에 `--pv-*` 말고 무엇을 둘지 → 안내 6절 2번은 `--pv-*` 와 브랜드 토큰만 말함, 치지직 light.css 를 보고 따라 함 → 종류 표기 없음.
- 다크 시트를 값으로 쓸지 참조로 쓸지 → 안내와 STANDARD 4절은 "토큰을 다시 정의"라고만 함, `var(--lf-dark-…)` 참조로 씀(`oklch 29/32L 0/32D`) → 종류 표기 없음.
- md 해석(구조와 무관): 라이트 값을 `bg-1`, `border-1`, `border-2` 로 옮기고 `(라이트 … 가정)`, 다크 이름표는 `labelDark`. 보라 버튼 hover 는 값이 없어 넣지 않음. 초점은 브라우저 기본 링을 둠. `1em` 버튼은 px 로 골라 `(글자 크기 가정)`. `button-cta` 는 `dark-bg-3` 면 위. Don't 에 맞춰 작품명과 칩은 자리 글. 알약 버튼은 그리지 않음 → 종류: md 해석(파일이 "md 해석(구조와 무관)"이라 적음).

components 문제 4b
- 프리뷰 검증기가 무엇을 막는지 → `src/lib/preview-validator.ts` Grep 이 목록을 못 줬고 안내에도 없음. 검증기를 돌려 보고 따르기로 함. 1회차에 막힘 없음 → 종류 표기 없음.
- 다크 시트에 `var()` 참조를 쓸지 OKLCH 글자를 쓸지 → 안내에 없음, 치지직 dark.css 를 보고 OKLCH 글자로 씀 → 종류 표기 없음.
- md 해석(구조와 무관): 다크 토큰 주석의 시맨틱 변수 라이트 값을 라이트에 씀. `button-cta` 는 리터럴이라 두 테마 고정, 이미지 자리 `dark-bg-3`, `(이미지 자리 색 가정)`. 보라 1차 버튼은 Colors 산문에서만 나오고 hover 는 값 없어 안 넣음. 눌림은 Known Gaps 에 미확인이라 안 넣음. `button-secondary` 는 12px `(글자 크기 가정)`. 검색창 돋보기는 md 에 없어 안 넣음 → 종류: md 해석.

## 목록 4. 문제 5 의 원본 찾기

| 구조 | 지적받은 서빙 파일의 줄 | 원본을 찾는 데 쓴 명령(이름과 횟수) | 연 파일 수 | 헛짚은 횟수 | 찾은 원본 위치 |
| --- | --- | --- | --- | --- | --- |
| html-frame | `public/preview/toss/preview.html` 1682줄(이름표), 1484줄(`<button class="qb">채우기</button>`) | 0개. 안내 5절이 "줄 번호는 서빙되는 파일의 줄 번호이고, 그 파일이 원본이다"라고 해서 바로 고침. 줄 번호를 구하는 데는 3개(Grep 1, Read 2) | 기록 없음(Read 둘 다 toss preview.html) | 0 | 같은 파일 같은 줄 |
| fragments | 같은 파일 1769줄(이름표), 1571줄(`<button class="qb">채우기</button>`) | `pnpm previews:where` 2회(지적마다 1회). 확인용 Read 1회씩, 합 4 | 서빙 파일 1과 원본 2. 안내 README, SCENARIOS, STANDARD 는 시작 때 읽음 | 0 | `preview-src/toss/zones/buttons.html:2`, `preview-src/toss/zones/screens.html:24` |
| components | 같은 파일 1768줄(이름표), 1570줄(`<button class="qb">채우기</button>`) | `pnpm pv:where toss 1768 1570` 1회가 두 줄 모두 짚음. 그 밖에 구역 시작 줄 Grep 1, 서빙 파일 Read 2(줄 번호 구하기), 원본 확인 Read 2. 파일이 적은 합계는 4 | 서빙 HTML 1, 원본 모듈 1(두 곳) | 0 | `prototypes/preview-structure/components/entries/toss/preview.ts:258`, `:68` |

(참고: 줄 번호가 구조마다 다른 것은 파일이 적은 대로다. 가지의 시작 커밋이 구조마다 다르다.)

## 목록 5. 문제 2 와 3 의 일부러 넣은 잘못

### html-frame 문제 2
- 넣은 곳과 방식: 토스 `button-size` 칸(1681줄)에서 `aria-labelledby="pv-label-button-size"` 를 지움.
- 원본에 넣을 수 있었나: 이 구조는 원본과 산출물이 따로 없고(서빙 파일이 곧 원본) 파일에 이 질문의 별도 서술은 없음.
- 메시지 원문: `public/preview/toss/preview.html:1681  [cell-group] 칸 "button-size" 에 aria-labelledby 가 없다` / `고치는 법: 이 줄의 <div class="pv-cell" …> 에 aria-labelledby="pv-label-button-size" 를 단다`
- 짚은 것: 서빙 파일 1681줄, 원본 줄은 해당 없음, 칸 이름 `button-size`, 고칠 곳은 그 줄의 칸 시작 태그에 속성을 다는 것.
- 되돌림: `git restore`, 커밋 안 함.

### html-frame 문제 3
- 넣은 곳과 방식: 토스의 선택 구역(1742~1834줄)을 내비게이션 구역 앞, 곧 입력 구역 뒤로 옮김(`move-lines.mjs`).
- 원본에 넣을 수 있었나: 해당 없음(원본과 산출물이 따로 없는 구조).
- 메시지 원문: `public/preview/toss/preview.html:1844  [zone-order] 구역 "selection" 가 구역 "inputs" 뒤에 있다` / `고치는 법: "selection" 구역(<section> 통째)을 "inputs" 구역 앞으로 옮긴다. 순서는 screens, buttons, selection, inputs, navigation, content, tables, feedback, brand`
- 짚은 것: 서빙 파일 1844줄(뒤로 밀린 선택 구역의 `<section>` 줄), 원본 줄은 해당 없음, 구역 이름 `selection` 과 `inputs`, 고칠 곳은 선택 구역을 입력 구역 앞으로 옮기는 것.

### fragments 문제 2
- 넣은 곳과 방식: 토스 `button-size` 칸(서빙 1768줄)에서 `aria-labelledby="pv-label-button-size"` 를 지움(서빙 파일을 Edit).
- 원본에 넣을 수 있었나: 없음. "이 구조에서는 칸 감싸개를 조각이 쓰지 않으므로(조각에 쓰면 원본 꼴 검사가 막는다) 잘못을 넣을 수 있는 곳이 서빙 파일뿐".
- 메시지 원문: `✗ public/preview/toss/preview.html:1768 — 원본에서 조립한 결과와 1768줄부터 다르다. 원본을 고친 뒤 조립하지 않았거나 서빙 파일을 손으로 고쳤다. `pnpm previews:build toss` 를 돌리고 그 결과를 함께 커밋한다(서빙 파일은 손으로 고치지 않는다)` 와 `✗ public/preview/toss/preview.html:1768 — 칸 `button-size` 의 aria-labelledby 가 "pv-label-button-size" 가 아니다(지금: 없음). …`
- 짚은 것: 서빙 1768줄, 원본 줄은 옮겨 적지 않음(서빙을 손으로 고친 경우라 원본에 해당 줄이 없음), 칸 이름 `button-size`, 고칠 곳은 `pnpm previews:build toss`.

### fragments 문제 3
- 넣은 곳과 방식: 토스에서 `selection` 과 `inputs` 구역을 서빙 파일에서 맞바꿈(`swap-zones.mjs`).
- 원본에 넣을 수 있었나: 없음. "이 구조의 원본에는 구역 순서가 없으므로(안내 85줄)".
- 메시지 원문: `✗ public/preview/toss/preview.html:1829 — 원본에서 조립한 결과와 1829줄부터 다르다. …` 와 `✗ public/preview/toss/preview.html:1931 — 구역 순서가 틀렸다: `selection` 가 `inputs` 뒤에 있다. 순서는 항목이 아니라 prototypes/preview-structure/fragments/zones.ts 의 목록이 정한다(screens → buttons → selection → inputs → navigation → content → tables → feedback → brand). …`
- 짚은 것: 서빙 1829줄부터 다름, 1931줄(뒤로 밀린 `selection` 구역), 원본 줄은 적지 않음, 구역 이름 `selection`, `inputs`, 고칠 곳은 `zones.ts` 가 순서를 정한다는 안내와 `pnpm previews:build toss`.

### components 문제 2
- 넣은 곳과 방식: 서빙 파일 `toss/preview.html:1767`(칸 `button-size`)의 여는 줄에서 `aria-labelledby="pv-label-button-size"` 를 지움.
- 원본에 넣을 수 있었나: 없음. "칸 속성을 항목 모듈이 쓰지 않으므로(부품이 씀) 모듈에서 칸 하나만 빼는 길이 없다".
- 메시지 원문: `public/preview/toss/preview.html:1767 [buttons/button-size] 칸 buttons/button-size 의 aria-labelledby 가 "(없음)" 다. 그 칸의 이름표 id "pv-label-button-size" 를 가리켜야 한다. 이 속성은 틀(kit/parts.ts 의 renderCell)이 쓴다. 서빙 파일을 손으로 고치지 말고 pnpm pv:build 로 다시 만든다` 와 `public/preview/toss/preview.html:1767 이 prototypes/preview-structure/components/entries/toss 를 빌드한 결과와 다르다(원본과 산출물의 어긋남). … 원본 줄은 pnpm pv:where toss 1767`. vitest 는 `served previews > toss equals what its item module builds` 1 failed.
- 짚은 것: 서빙 1767줄, 원본 줄은 `pnpm pv:where toss 1767` 로 찾도록 안내, 칸 `buttons/button-size`, 고칠 곳은 `kit/parts.ts` 의 `renderCell` 과 `pnpm pv:build`. 파일은 어긋남 줄의 "항목 모듈을 고치고"가 이 경우에는 모듈에 고칠 것이 없어 맞지 않는다고 적음.

### components 문제 3
- 넣은 곳과 방식: 서빙 파일에서 `selection` 과 `inputs` section 덩어리를 맞바꿈(`swap-zones.mjs`).
- 원본에 넣을 수 있었나: 없음. "항목 모듈에서 `zone(...)` 순서를 바꾸는 것으로는 잘못을 만들 수 없다(빌드가 `ZONES` 순서로 늘어놓는다, 안내 2절)".
- 메시지 원문: `public/preview/toss/preview.html:1930 [selection] 구역 순서가 틀렸다: "selection" 가 "inputs" 뒤에 있다. 순서는 screens, buttons, selection, inputs, navigation, content, tables, feedback, brand 다(kit/zones.ts)` 와 `public/preview/toss/preview.html:1828 이 prototypes/preview-structure/components/entries/toss 를 빌드한 결과와 다르다(원본과 산출물의 어긋남). … 원본 줄은 pnpm pv:where toss 1828`. vitest 는 같은 `served previews > toss …` 1 failed.
- 짚은 것: 서빙 1930줄(순서 규칙), 1828줄(어긋남), 원본 줄은 `pv:where toss 1828` 로 안내, 구역 이름 `selection`, `inputs`, 고칠 곳은 순서가 `kit/zones.ts` 에서 온다는 안내와 `pnpm pv:build toss`.

## 목록 6. 파일이 스스로 밝힌 한계

### html-frame
- 문제 5: 걸린 시간 재지 않음(명령이 시간을 찍지 않았다고 함). 원본과 산출물이 따로 없는 구조라 어긋남 검사 없음(해당 없음).
- 문제 1: 시간은 vitest 가 찍은 Duration 1.75s 말고는 재지 않음. 항목 파일(toss, chzzk preview.html)은 고치지 않음. `STANDARD.md` 3절 표의 "안 주면 700" 은 고치지 않는 파일이라 그대로 둠.
- 문제 2: 시간은 vitest Duration 3.03s 말고는 재지 않음.
- 문제 3: 시간은 vitest Duration 1.63s 말고는 재지 않음. 토스에는 표 구역에 넣을 칸이 없어 표 구역을 두지 않음. `base-notes/check-base.ts` 와 `base-notes/toss-rezone.mjs` 는 고치지 않음(안내 8절이 이 구조에서 돌리지 않는다고 함). 이 칸이 쓰임으로 표인지는 판단하지 않음. 테스트의 `tables` 예를 안 고쳤으면 실패했을 것이라 했으나 "돌려 보지는 않았다".
- 문제 4a: 렌더링해서 넘침이나 대비를 보는 확인은 하지 않음(지시 3절이 슬러그 단위 두 검사만 돌리라고 했다고 함). 걸린 시간은 재지 않음. hover 의 진한 보라(`PURPLE700`)는 값이 없어 넣지 않음. 초점 스타일은 넣지 않음. 멤버십 알약 버튼은 그리지 않음. 진행바 바탕 막대는 색이 없어 그리지 않음.
- 문제 4b: 시간은 pnpm install 의 17.4s 만 찍힘. 토스 원본, `services/laftel.tokens.json`, `.claude/rules/` 는 열지 않음. 보라 1차 버튼 hover 는 값이 없어 넣지 않음. 초점 링은 지우지 않고 기본을 둠.

### fragments
- 문제 5: 걸린 시간 재지 않음(명령이 찍지 않음).
- 문제 1: 시간은 vitest 478ms 말고는 재지 않음. STANDARD 3절 표의 "안 주면 700" 은 고치지 않는 파일이라 그대로 둠.
- 문제 2: 시간은 vitest 274ms 말고는 재지 않음. 항목의 조각(`preview-src/`)은 하나도 고치지 않음.
- 문제 3: 시간은 vitest 287ms 말고는 재지 않음. `STANDARD.md` 1절 표는 고치지 않는 파일이라 옛 순서 그대로. `base-notes/` 의 두 파일도 고치지 않음. 토스에는 `tables` 에 들 칸이 없어 파일을 만들지 않음.
- 문제 4a: 화면을 브라우저로 열어 눈으로 보는 확인은 하지 않음(지시가 정한 확인은 슬러그 단위 검사 둘). 걸린 시간은 재지 않음. 구조가 대신 써 준 줄 137은 뺄셈으로 구한 값이고 줄마다 세지 않음. 들여쓰기가 중요한지는 모른다고 함. 이름표 글자색 `fg-2` 선택은 "재지는 않았다". `services/laftel.tokens.json` 과 토스 원본은 열지 않음. hover 는 보라 알약과 `button-primary` 모두 값이 없어 넣지 않음. `outline` 은 건드리지 않음.
- 문제 4b: 화면을 브라우저로 열어 눈으로 보지 않음. 걸린 시간은 pnpm install 20.4s 말고는 재지 않음. 구조가 대신 써 준 줄 137은 셈으로 구했고 줄마다 세지 않음. `--background` 등을 검증기가 요구하는지는 확인하지 않음. 토스 원본과 `services/laftel.tokens.json` 은 열지 않음. 보라 1차 버튼 hover 는 값이 없어 넣지 않음. 초점 스타일은 더하지도 `outline: none` 을 두지도 않음. 검색창은 열리게 만들지 않음.

### components
- 문제 5: 걸린 시간은 pnpm install 1m 19.6s 말고는 재지 않음.
- 문제 1: 시간은 vitest Duration 356ms 말고는 재지 않음.
- 문제 2: 시간은 vitest 316ms, 706ms 말고는 재지 않음. 항목 모듈(`entries/*/preview.ts`)은 하나도 고치지 않음. `pv:where` 정규식은 고치지 않음. `iframe.js` 는 열어 보지 않음.
- 문제 3: 시간은 vitest 305ms, 318ms 말고는 재지 않음. `base-notes/check-base.ts` 의 `ZONES` 와 `STANDARD.md` 1절 표는 지시 파일이 고치지 말라는 파일이라 그대로 두었고 `check-base.ts` 는 돌리지 않음. 토스 모듈은 고치지 않음.
- 문제 4a: 브라우저로 화면을 열어 눈으로 본 것은 아니다. 걸린 시간은 pnpm install 1m 14.7s 와 prettier 348ms 말고는 재지 않음. 구조가 대신 써 준 줄 147은 손으로 센 값. 보라 1차 버튼 hover 는 값이 없어 넣지 않음. 초점 스타일은 지어내지 않음. 랜딩 전용 "멤버십 시작하기" 알약은 그리지 않음. 토스 원본과 `services/laftel.tokens.json` 은 열지 않음. 2회차에는 `validate:previews` 를 다시 돌리지 않음.
- 문제 4b: 걸린 시간은 pnpm install 17.2초와 prettier 147ms 말고는 재지 않음. 선택, 내비게이션, 콘텐츠 구역은 쓰지 않음. 초점 스타일은 만들지 않음. 보라 1차 버튼 hover 와 눌림은 넣지 않음. 검색창 돋보기는 넣지 않음. 실제 작품명과 푸밍 그림은 쓰지 않음. 구조가 대신 써 준 줄 153은 리터럴의 줄을 손으로 센 것.

기록 파일 열여덟 개는 이 폴더의 `results/` 에 있다.
