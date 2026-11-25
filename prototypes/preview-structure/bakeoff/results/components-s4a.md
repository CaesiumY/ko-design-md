# components, 문제 4 (풀이 a)

가지 `eval/components-s4a`, 끝 `68b82f54`.

- 준비 커밋 `474e16ae`: `public/preview/laftel/preview.html` 삭제만(열어 보지 않음)
- 풀이 커밋 `586b80ef`
- 결과 커밋: 이 파일

## "풀었다" 조건

1. 서빙 파일 `public/preview/laftel/preview.html` 이 새로 생겼고 면책 띠, 히어로, 화면 하나(`screen-home-desktop`), 버튼 구역(칸 셋), 입력 구역(칸 하나)을 담는다. 라이트와 다크(`dark.css` 의 토큰 재정의, 다크 이름표 `labelDark`, 스펙 줄의 다크 `<template>`)를 갖는다. 손끝 반응은 md 가 규정한 `button-cta` 의 hover(흰색 70%) 하나만 넣었다. 브라우저로 화면을 열어 눈으로 본 것은 아니다.
2. `pnpm pv:check laftel` ok, `pnpm validate:previews --slug laftel --verbose` 막힘 0, 경고 0.
3. 어긋남 검사(`pnpm pv:check laftel` 의 3층) ok. prettier 로 모듈을 포맷한 뒤에도 ok.

## 명령 기록

| # | 명령 | 결과 | 실패면 출력 한 줄, 종류 |
| --- | --- | --- | --- |
| 1 | `git status` | 성공 | |
| 2 | `git rev-parse HEAD` | 성공 | |
| 3 | `git switch -c eval/components-s4a 68b82f54` | 성공 | |
| 4 | `pnpm install` | 성공(pnpm 이 찍은 값 1m 14.7s) | |
| 5 | `pnpm pv:check` | 성공(chzzk, toss ok) | |
| 6 | `pnpm validate:previews --slug toss` | 성공(경고 2, 막힘 0) | |
| 7 | `pnpm validate:previews --slug chzzk` | 성공 | |
| 8 | `git rm -q public/preview/laftel/preview.html` | 성공 | |
| 9 | `git commit -s -q -F .claude/cache/eval-components-s4a-prep.txt` | 성공(준비 커밋 `474e16ae`) | |
| 10 | `git rev-parse --short HEAD` | 성공 | |
| 11 | `pnpm typecheck` | 성공 | |
| 12 | `pnpm pv:build laftel` | 성공 | |
| 13 | `pnpm validate:previews --slug laftel --verbose` | 성공(`ok laftel (oklch 29/32L 0/32D)`, 막힘 0, 경고 0) | |
| 14 | `pnpm pv:check laftel` | 성공 | |
| 15 | `pnpm exec prettier --write prototypes/preview-structure/components/entries/laftel/preview.ts` | 성공(348ms, 파일을 고쳐 씀) | |
| 16 | `pnpm pv:check laftel` | 성공(포맷 뒤 어긋남 없음) | |
| 17 | `git status --short` | 성공 | |
| 18 | `git add prototypes/preview-structure/components/entries/laftel public/preview/laftel` | 성공 | |
| 19 | `git commit -s -q -F .claude/cache/eval-components-s4a-solve.txt` | 성공(풀이 커밋 `586b80ef`) | |
| 20 | `git diff --stat 474e16ae HEAD` | 성공 | |
| 21 | `git rev-parse --short HEAD` | 성공 | |

셸 명령 21개, 실패 0. 셸 밖 도구 호출로 Grep 2번(`src/lib/preview-validator*.ts` 에서 규칙 이름을 찾으려 했으나 둘 다 결과 없음), Glob 1번(`public/logos/laftel.png` 있는지)이 있었다.

## 확인 회차

| 회차 | 약속 검사(`pnpm pv:check laftel`, 빌드 안의 검사 포함) | `validate:previews --slug laftel --verbose` | 막힘의 종류 |
| --- | --- | --- | --- |
| 1 (명령 11~14) | 막힘 없음 | 막힘 없음, 경고 없음 | 없음 |
| 2 (명령 16, prettier 뒤) | 막힘 없음 | 다시 돌리지 않음(서빙 파일이 바뀌지 않았으므로) | 없음 |

처음으로 두 검사가 모두 통과한 회차: 1회차. 첫 파일을 쓰기 시작해 통과까지 거친 단계는 안내 6절의 순서 그대로다: 파일 셋 쓰기 → `pnpm typecheck` → `pnpm pv:build laftel` → `validate:previews` → `pv:check` → prettier → `pv:check` 재확인.

## 파일과 줄 수 (`git diff --stat 474e16ae 586b80ef`)

| 나눔 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 손으로 쓴 원본 | `prototypes/preview-structure/components/entries/laftel/preview.ts` | 136 | 0 |
| 손으로 쓴 원본 | `prototypes/preview-structure/components/entries/laftel/light.css` | 135 | 0 |
| 손으로 쓴 원본 | `prototypes/preview-structure/components/entries/laftel/dark.css` | 10 | 0 |
| 명령이 만든 산출물 | `public/preview/laftel/preview.html`(`pnpm pv:build laftel`) | 376 | 0 |
| 안내 문서와 테스트 | 없음 | 0 | 0 |

합계 4파일, 657줄 더함, 0줄 뺌. 원본 3파일 281줄, 산출물 1파일 376줄. `preview.ts` 의 136줄은 prettier 가 포맷한 뒤의 값이다.

구조가 대신 써 준 줄(산출물 376줄 중 원본에서 오지 않은 줄, 손으로 센 값): 원본에서 온 줄은 CSS 145줄, 마크업 조각 75줄(히어로 13, 화면 27, 버튼 칸 9 + 8 + 7, 입력 칸 11), 이름표와 더미 표기 줄 9줄로 229줄이다. 나머지 147줄을 부품이 썼다. 그중 85줄은 `frame.css` 의 틀 블록이고, 나머지는 `<head>`, 면책 띠, `main`, 구역과 칸의 겉 태그다.

## 걸린 시간

명령이 스스로 찍은 값은 `pnpm install` 1m 14.7s, prettier 348ms 뿐이다. 나머지는 재지 않음.

## 막히거나 헷갈린 곳

막혀서 실패한 명령은 없다. 헷갈린 곳과 답을 얻은 곳:

1. **`validate:previews` 가 무엇을 보는지.** 안내 README 는 이 검증기를 돌리라고만 하고 무엇을 막는지는 말하지 않는다. `src/lib/preview-validator*.ts` 에서 규칙 이름을 Grep 으로 두 번 찾았으나 내 패턴이 맞지 않아 결과가 없었다. `.claude/rules/preview.md` 를 읽어 레이아웃 가드(`minmax(0, 1fr)`, @media 접기, `min-width: 0`)와 컬러 면 위 글자 토큰(`--primary-foreground`)을 알았다. 그 뒤에는 검증기 메시지를 따르기로 하고 썼고, 막히지 않았다.
2. **`:root` 에 `--pv-*` 말고 무엇을 둬야 하는지.** 안내 6절 2번은 `--pv-*` 와 브랜드 토큰만 말한다. 치지직 `light.css` 가 `--background`, `--foreground`, `--primary`, `--primary-foreground` 를 함께 두는 것을 보고 따라 했다.
3. **다크 시트를 값으로 쓸지 참조로 쓸지.** 안내와 STANDARD 4절은 "토큰을 다시 정의"라고만 한다. 치지직 `dark.css` 는 OKLCH 값을 글자로 적었다. 나는 `var(--lf-dark-…)` 참조로 썼다. 검증기는 막지 않았고 `oklch 29/32L 0/32D` 로 다크 쪽 OKLCH 수를 0 으로 셌다(경고는 아님).
4. **md 해석(구조와 무관).**
   - md 의 컴포넌트 값은 대부분 다크(1440px) 계산 스타일이다. 헤더, `button-secondary` 의 면과 테두리, `search-field` 의 면과 테두리의 라이트 값은 md 가 말하는 시맨틱 변수의 라이트 쪽(`bg-1`, `border-1`, `border-2`)으로 옮기고 칸 이름표에 `(라이트 … 가정)` 을 달았다. 다크 이름표는 `labelDark` 로 그 표지를 뺐다.
   - 보라 1차 버튼의 hover 는 md 에 "더 진한 보라(`PURPLE700`)"라는 말만 있고 값이 없다. 값을 지어내지 않으려고 hover 를 넣지 않았다.
   - 초점 반응: md 는 `:focus-visible` 규칙이 없다고 적고 "포커스 링을 지우지 않는다"를 Don't 로 둔다. 초점 스타일을 지어내지 않고 실제 입력창의 브라우저 기본 초점 링을 그대로 두었다(`outline: none` 을 쓰지 않음).
   - 글자 크기가 `1em`(뷰포트 비례)으로만 적힌 버튼은 px 로 골라 쓰고 이름표에 `(글자 크기 가정)` 을 달았다.
   - `button-cta` 는 히어로 이미지 위 흰 버튼이라 라이트의 흰 바탕에서는 보이지 않는다. 두 테마 모두 `dark-bg-3` 면을 이미지 자리로 깔고 그 위에 그렸다.
   - Don't("멤버십 구독 플로우, 작품명, 요일별 신작 구성, 푸밍을 재현하지 않는다")에 맞춰 작품 제목과 칩은 자리 표시 글과 더미 표기로 두었다. 랜딩 전용 "멤버십 시작하기" 알약은 그리지 않았다.

연 파일 수: 지시 파일 2개 말고 10개(`SCENARIOS.md`, `STANDARD.md`, `components/README.md`, `services/laftel.md`, 치지직 `preview.ts`, `light.css`, `dark.css`, `kit/parts.ts`, `frame.css`, `.claude/rules/preview.md`). 내가 쓴 파일은 세지 않았다. 토스의 원본은 열지 않았다. `services/laftel.tokens.json` 도 열지 않았다.

## 안내에서 답을 찾지 못해 치지직을 보고 따라 한 곳

안내 6절 1번이 "치지직을 복사해 시작하라"고 해서 치지직을 본 것은 안내대로다. 그중 안내가 따로 말하지 않아 치지직의 꼴을 그대로 따른 곳:

- `:root` 의 `--background`, `--foreground`, `--primary`, `--primary-foreground` 별칭(위 2번).
- 칸 안의 상태 이름표와 스펙 줄 꼴(`.states`, `.state`, `.state-l`, `.specs`, `.spec`, `.hint`)과, 스펙 한 줄만 다크에서 다를 때 그 줄 바로 뒤에 `<template data-theme-variant="dark">` 를 두는 꼴.
- 입력 칸에 모양 견본과 나란히 실제 `<input>` 줄("직접 입력")과 조작 안내를 두는 꼴.
- 히어로 감싸개의 좌우 여백을 `var(--pv-gutter)` 로 두는 것(STANDARD 2절에도 있다).
- 화면을 `role="img"` 로 그리고 그 안에는 실제 컨트롤을 두지 않는 것(STANDARD 5절에도 있다).
