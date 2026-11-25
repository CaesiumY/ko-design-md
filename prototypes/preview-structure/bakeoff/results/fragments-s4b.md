# fragments, 문제 4 (두 번째 풀이, s4b)

- 가지: `eval/fragments-s4b` (`2a077dca` 에서 침)
- 준비 커밋: `9f756419` (라프텔 서빙 파일 삭제만)
- 풀이 커밋: `1ec29edb`
- 줄 수 기준: `git diff --stat 9f756419 1ec29edb`

## "풀었다" 조건

1. 서빙 파일 `public/preview/laftel/preview.html` 이 다시 생겼고, 면책 띠, 히어로, 화면(하나), 버튼, 입력 구역을 담는다. 라이트와 다크 시트가 둘 다 있다. 채웠다.
2. `pnpm previews:check laftel` 통과, `pnpm validate:previews --slug laftel --verbose` 통과(0 blocking, 0 warning). 채웠다.
3. 어긋남 검사: `pnpm previews:check laftel` 가 "서빙 파일이 원본과 같음" 을 냈다. 채웠다.

화면을 브라우저로 열어 눈으로 보지는 않았다.

## 새로 만든 파일과 줄 수

손으로 쓴 원본 (6개, 240줄)

| 파일 | 줄 |
| --- | --- |
| `preview-src/laftel/brand.css` | 138 |
| `preview-src/laftel/dark.css` | 10 |
| `preview-src/laftel/zones/hero.html` | 13 |
| `preview-src/laftel/zones/screens.html` | 33 |
| `preview-src/laftel/zones/buttons.html` | 32 |
| `preview-src/laftel/zones/inputs.html` | 14 |

명령이 만든 산출물 (1개, 377줄)

| 파일 | 줄 |
| --- | --- |
| `public/preview/laftel/preview.html` | 377 (`pnpm previews:build laftel`) |

구조가 대신 써 준 줄: 서빙 파일 377줄 중 원본 240줄을 뺀 137줄(`<head>`, 틀 블록, 면책 띠, `<main>`, 구역 래퍼와 제목, 칸 감싸개와 이름표 꼴 바꿈). 셈으로 구한 값이고 줄마다 세지는 않았다.

안내 문서와 테스트: 고치지 않음(0개, 0줄).

합계: 7 files changed, 617 insertions(+), 0 deletions.

## 거친 단계

1. 안내, 시험 문제, 기준, `services/laftel.md`, `zones.ts`, `frame.css`, 치지직 원본 여섯 장, `.claude/rules/preview.md` 를 읽음.
2. 원본 여섯 장을 Write 로 씀(brand.css, dark.css, hero, screens, buttons, inputs).
3. 약속 검사 1회차: 서빙 파일이 없다는 지적 1건(안내 4단계가 미리 말한 것).
4. 조립.
5. 약속 검사 2회차와 기존 검증기: 둘 다 통과.
6. 커밋.

## 확인 회차

| 회차 | 약속 검사 (`previews:check laftel`) | `validate:previews --slug laftel --verbose` | 막힘의 종류 |
| --- | --- | --- | --- |
| 1 | 막음: "서빙 파일이 없다 … `pnpm previews:build laftel` 를 돌리고" | 돌리지 않음 | 구조 (안내 4단계가 미리 말한 지적) |
| 2 | 통과: "약속 위반 없음, 서빙 파일이 원본과 같음" | 통과: `ok laftel (oklch 29/32L 0/32D)`, 0 blocking, 0 warning | 없음 |

처음으로 두 검사가 모두 통과한 회차: 2회차(조립 뒤 첫 확인).

## 명령 기록

| # | 명령 | 결과 | 실패면 출력 한 줄과 종류 |
| --- | --- | --- | --- |
| 1 | `git status` | 성공 | |
| 2 | `git rev-parse HEAD` | 성공 | |
| 3 | `git switch -c eval/fragments-s4b 2a077dca` | 성공 | |
| 4 | `pnpm install` | 성공 (스스로 찍은 시간 `Done in 20.4s`) | |
| 5 | `pnpm previews:check` | 성공 (chzzk, toss 위반 없음) | |
| 6 | `pnpm validate:previews --slug toss` | 성공 (0 blocking, 2 warn: bare-1fr, no-mobile-collapse) | |
| 7 | `pnpm validate:previews --slug chzzk` | 성공 (0 blocking, 0 warn) | |
| 8 | `git rm -q public/preview/laftel/preview.html` | 성공 | |
| 9 | `git commit -s -q -F .claude/cache/eval-s4b-prep.txt` | 성공 (준비 커밋) | |
| 10 | `git rev-parse --short HEAD` | 성공 | |
| 11 | `git status --short` | 성공 (깨끗함) | |
| 12 | `pnpm previews:check laftel` | 실패 (exit 1) | "public/preview/laftel/preview.html — 서빙 파일이 없다." 구조 (안내가 예고한 지적) |
| 13 | `pnpm previews:build laftel` | 성공 | |
| 14 | `pnpm previews:check laftel` | 성공 | |
| 15 | `pnpm validate:previews --slug laftel --verbose` | 성공 | |
| 16 | `git add preview-src/laftel public/preview/laftel/preview.html` | 성공 | |
| 17 | `git commit -s -q -F .claude/cache/eval-s4b-solve.txt` | 성공 (풀이 커밋) | |
| 18 | `git diff --stat 9f756419 HEAD` | 성공 | |
| 19 | `git rev-parse --short HEAD` | 성공 | |

이 파일을 쓴 뒤의 결과 커밋 명령(`git add`, `git commit`, `git rev-parse`, `git status`)은 이 표에 없다.

명령 19개, 실패 1개(안내가 예고한 것). 첫 원본 파일을 쓴 뒤 검사 통과까지의 명령: 12~15번, 4개.

## 걸린 시간

명령이 스스로 찍은 값은 `pnpm install` 의 20.4s 뿐이다. 그 밖은 재지 않음.

## 막히거나 헷갈린 곳

막혀서 멈춘 곳은 없다. 헷갈린 곳은 아래와 같다.

- **`brand.css` 의 들여쓰기.** 안내는 히어로 조각이 네 칸 덜 들여 쓴다고만 하고 CSS 의 들여쓰기는 말하지 않는다. 치지직 `brand.css` 를 열어 두 칸 들여 쓴 것을 보고 따랐다. 열어 본 파일 1개.
- **`--background`, `--foreground`, `--primary`, `--primary-foreground` 를 둘지.** 안내와 STANDARD 3절은 `--pv-*` 변수만 말한다. 치지직 `brand.css` 에 있어서 따라 넣었다. 검증기가 요구하는지는 확인하지 않았다.
- **히어로의 꼴.** 안내 「원본이 놓이는 곳과 꼴」이 감싸개에 `var(--pv-gutter)` 를 쓰라고 해서 그대로 했고, 감싸개 class 이름(`hero-wrap`)과 안쪽 배치는 치지직 `zones/hero.html` 을 보고 따랐다.
- **시연 자리 안의 상태 이름표와 스펙 줄.** STANDARD 2절과 7절이 "시연 자리 안, 시연 뒤" 라고 한다. class 이름(`states`, `state`, `state-l`, `specs`, `spec`, `hint`)과 다크에서 다른 스펙 줄을 `<template data-theme-variant="dark">` 로 싣는 꼴은 치지직 `zones/buttons.html`, `zones/inputs.html` 을 보고 따랐다.
- **`prefers-reduced-motion` 블록.** STANDARD 5절이 "기존 방식 그대로" 라고만 한다. 치지직 `brand.css` 의 블록을 그대로 옮겼다.

열어 본 파일: 지시 파일 2, 안내 1, SCENARIOS 1, STANDARD 1, `services/laftel.md` 1, `zones.ts` 1, `frame.css` 1, `.claude/rules/preview.md` 1, 치지직 원본 6(brand.css, dark.css, hero, screens, buttons, inputs). 토스 원본과 `services/laftel.tokens.json` 은 열지 않았다.

## 치지직이나 토스의 원본을 보고 따라 한 곳

모두 치지직이다. 토스는 보지 않았다.

- CSS 파일의 두 칸 들여쓰기.
- `:root` 에 `--background`, `--foreground`, `--primary`, `--primary-foreground` 와 Pretendard 서체 스택을 두는 것.
- `prefers-reduced-motion` 블록의 글.
- 히어로 감싸개 class `hero-wrap` 과 두 열 배치, 좁은 폭에서 한 열로 접는 @media.
- 시연 자리 안 상태 이름표와 스펙 줄의 class 이름과 꼴, 다크 스펙 줄의 `<template>`.
- 화면 목업의 꼴(헤더 띠, 썸네일 자리 글, 목업에 `role="img"` 와 `aria-label`).
- 검색 입력의 "직접 입력" 줄을 `<label>` 안의 실제 `<input>` 으로 두는 꼴과 조작 안내 문구.

## md 해석 (구조와 무관하게 DESIGN.md 를 화면으로 옮기며 정한 것)

검증기가 이 가운데 무엇도 막지 않았으므로 막힘의 종류로 센 것은 없다. 정한 것만 적는다.

- 컴포넌트 값이 다크로만 적혀 있어서, 라이트는 같은 이름의 라이트 토큰(`dark-bg-1` → `bg-1` 등)으로 옮겼다. md 의 Colors 절이 같은 이름에 두 값이 주입된다고 해서다. `button-secondary` 만 md 가 라이트 글자색 `fg-2` 를 직접 적었다.
- `button-cta` 는 흰 면이라 라이트 바탕에서 보이지 않으므로, 히어로와 버튼 칸 모두 두 테마에서 어두운(`dark-bg-2`) 자리 위에 두었다.
- 버튼 글자 크기는 md 에 없어서 `(글자 크기 가정)` 을 칸 이름표에 달았다.
- 손끝 반응은 `button-cta` 의 hover(흰색 70%) 하나만 넣었다. 보라 1차 버튼의 hover 는 md 가 팔레트 이름(`PURPLE700`)만 말하고 값이 없어서 넣지 않았다. 헤더 `.4s` 전환은 화면 목업의 헤더에만 넣었다.
- 초점: md 가 `:focus-visible` 값을 규정하지 않았고 Don't 가 포커스 링을 지우지 말라고 해서, 스타일을 더하지도 `outline: none` 을 두지도 않고 브라우저 기본을 남겼다.
- 검색창의 펼침은 직접 그린 것이라 열리게 만들지 않고 접힘과 펼침을 나란히 그렸다.
- 화면은 홈 콜렉션 하나다. Don't(작품명, 요일별 신작 구성을 재현하지 않는다)를 따라 작품 이름은 자리 글로 두었다.
- 진행바 채움 폭은 조각 안 인라인 `style="width: …"` 로 적었다.
- 이름표 글자색(`--pv-ink-muted`)은 `fg-3` 대신 `fg-2` 를 골랐다(칸 바탕 위에서 읽혀야 한다는 STANDARD 3절).
