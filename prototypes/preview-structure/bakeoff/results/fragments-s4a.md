# fragments, 문제 4 (a): 라프텔 프리뷰를 처음부터 쓴다

- 가지: `eval/fragments-s4a` (`2a077dca` 에서 침)
- 준비 커밋: `2d20f273` (`public/preview/laftel/preview.html` 삭제만)
- 풀이 커밋: `c9371fb9`
- 범위: 면책 띠(조립기가 씀), 히어로, 화면 하나(`screens`), 버튼(`buttons`), 입력(`inputs`). 라이트와 다크.

## "풀었다" 조건

1. 서빙 파일 `public/preview/laftel/preview.html` 이 생겼고 위 범위를 담는다: 채움.
2. `pnpm previews:check laftel` 통과, `pnpm validate:previews --slug laftel --verbose` 통과(0 blocking, 0 warning): 채움.
3. 어긋남 검사(`previews:check` 의 "서빙 파일이 원본과 같음"): 채움.

화면을 브라우저로 열어 눈으로 보는 확인은 하지 않았다(지시가 정한 확인은 슬러그 단위 검사 둘이다).

## 줄 수 (`git diff --stat 2d20f273 c9371fb9`, 7 파일, +607 -0)

| 나눔 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 손으로 쓴 원본 | 6 | 235 | 0 |
| 명령이 만든 산출물 | 1 | 372 | 0 |
| 안내 문서와 테스트 | 0 | 0 | 0 |

새로 만든 파일:

| 파일 | 줄 | 누가 |
| --- | --- | --- |
| `preview-src/laftel/brand.css` | 131 | 손 |
| `preview-src/laftel/dark.css` | 10 | 손 |
| `preview-src/laftel/zones/hero.html` | 10 | 손 |
| `preview-src/laftel/zones/screens.html` | 31 | 손 |
| `preview-src/laftel/zones/buttons.html` | 38 | 손 |
| `preview-src/laftel/zones/inputs.html` | 15 | 손 |
| `public/preview/laftel/preview.html` | 372 | `pnpm previews:build laftel` |

구조가 대신 써 준 줄: 서빙 파일 372줄에서 원본 235줄을 뺀 137줄(뺄셈으로 구한 값. 줄마다 세지 않았다. 칸 감싸개처럼 원본 한 줄이 서빙 두 줄이 되는 곳이 섞여 있다).

## 명령 기록

| # | 명령 | 결과 | 실패면 출력 한 줄, 종류 |
| --- | --- | --- | --- |
| 1 | `git status` | 성공 | |
| 2 | `git rev-parse HEAD` | 성공 | |
| 3 | `git switch -c eval/fragments-s4a 2a077dca` | 성공 | |
| 4 | `pnpm install` | 성공 (명령이 찍은 시간 1m 15.2s) | |
| 5 | `pnpm previews:check` (고치기 전, 전체) | 성공 | |
| 6 | `pnpm validate:previews --slug toss` | 성공 (0 blocking, 2 warning) | |
| 7 | `pnpm validate:previews --slug chzzk` | 성공 | |
| 8 | `git rm -q public/preview/laftel/preview.html` | 성공 | |
| 9 | `git commit -s -q -F .claude/cache/eval-s4a-prep.txt` (준비 커밋) | 성공 | |
| 10 | `git rev-parse --short HEAD` | 성공 | |
| 11 | `pnpm previews:check laftel` (확인 1회차) | 실패 | "서빙 파일이 없다 … `pnpm previews:build laftel` 를 돌리고 …". 구조(서빙 파일을 조립 전에는 없다. 안내 「새 항목을 쓰는 순서」 4번이 예고한 그대로) |
| 12 | `pnpm previews:build laftel` | 성공 | |
| 13 | `pnpm previews:check laftel` (확인 2회차) | 성공 | |
| 14 | `pnpm validate:previews --slug laftel --verbose` (확인 2회차) | 성공 (0 blocking, 0 warning, oklch 28/32L 0/32D) | |
| 15 | `git add preview-src/laftel public/preview/laftel/preview.html` | 성공 | |
| 16 | `git commit -s -q -F .claude/cache/eval-s4a-solve.txt` (풀이 커밋) | 성공 | |
| 17 | `git diff --stat 2d20f273 HEAD` | 성공 | |
| 18 | `git rev-parse --short HEAD` | 성공 | |

결과 파일 커밋의 명령(`git add`, `git commit`, `git status`)은 이 표 뒤에 돌렸다.

- 명령 수(풀이까지): 18, 실패 1(구조, 안내가 예고한 것).
- 고치고 나서 확인이 끝날 때까지 돌린 명령: 11~14 의 넷. 걸린 시간은 재지 않음(이 명령들은 시간을 찍지 않았다).

## 확인 회차

| 회차 | 약속 검사 | `validate:previews` | 막힘의 종류 |
| --- | --- | --- | --- |
| 1 | 막음: 서빙 파일이 없다 | 돌리지 않음 | 구조(조립 전에는 서빙 파일이 없다. 안내가 예고함) |
| 2 (조립 뒤) | 통과 | 통과 | 없음 |

처음으로 두 검사가 모두 통과한 회차: 2회차(조립 한 번 뒤). 원본을 고친 회차는 없다.

## 거친 단계

1. 안내, 시험 문제, 기준, `zones.ts`, `services/laftel.md` 를 읽었다.
2. 치지직의 원본(`brand.css`, `dark.css`, `zones/hero.html`, `buttons.html`, `inputs.html`, `screens.html` 앞 60줄)을 본보기로 읽었다.
3. 원본 여섯 파일을 썼다(첫 파일 `brand.css` 부터 `inputs.html` 까지 고치지 않고 한 번에).
4. 약속 검사 → 서빙 파일 없음 → 조립 → 약속 검사와 검증기 통과.

열어 본 파일: `prototypes/preview-structure/fragments/README.md`, `SCENARIOS.md`, `STANDARD.md`, `fragments/zones.ts`, `services/laftel.md`, `.claude/rules/preview.md`, 치지직 원본 6개. 모두 12개. 그 밖에 Glob 두 번(`preview-src/**/*`, `public/logos/laftel*`). `services/laftel.tokens.json` 과 토스 원본은 열지 않았다.

## md 를 화면으로 옮기며 정한 것 (md 해석)

검사가 막은 것은 아니고, 쓰면서 스스로 정한 곳이다.

- 히어로 주요 버튼은 md 가 말한 멤버십 랜딩의 보라 알약("멤버십 시작하기", 251 × 56, radius 40)으로 했다. md 가 그 hover 전후 색이 같다고 해서 hover 를 넣지 않았다.
- 버튼 구역: `button-primary`(404 "홈으로 이동", 160 × 56, radius 4, 면 point). md 가 hover 를 "더 진한 보라(`PURPLE700`)"라고만 하고 값이 없어 hover 를 넣지 않았다. 글자 크기는 md 에 없어 이름표에 `(가정)`.
- `button-cta` 는 면이 흰색이라 흰 칸 바탕에서 보이지 않는다. 히어로 이미지 위라는 md 의 자리를 따라 어두운 이미지 자리 위에 두고, 그 색(`dark-bg-3`)은 이름표에 `(가정)` 으로 밝혔다. hover(흰색 70%)는 md 가 규정해 실제 반응으로 넣고, 기본과 hover 견본에 상태 이름표가 붙어 있어 STANDARD 7절대로 견본은 두고 "직접 해 보기" 줄을 더했다.
- `button-secondary` 의 글자 크기 1em 은 md 의 "1440px 기준 1em 은 약 11.9px" 를 따라 11.9px 로 그렸다. 라이트 면은 md 의 이름 규칙(라이트가 기본 이름, 다크가 `dark-` 접두)대로 `bg-1`, 테두리는 `border-2` 로 옮겼다.
- 입력 구역: `search-field` 의 접힘(40 × 40 원형)과 펼침을 상태 이름표와 함께 나란히 두고, 직접 입력 줄을 더했다. 열리게 만들지 않았다.
- 초점: md 에 초점 스타일 값이 없고 Don't 가 "포커스 링을 지우지 않는다" 라서 `outline` 을 건드리지 않았다(브라우저 기본 링).
- 화면: 홈 데스크톱 한 장(`role="img"`). md 의 Don't 를 따라 작품명, 요일별 구성을 재현하지 않고 자리 글로 채웠다. 헤더 항목과 N 배지는 md 의 header 절 그대로. 칩, UP 배지, 진행바는 화면 안 모양으로만 두고 구역에는 옮기지 않았다(선택, 콘텐츠 구역은 범위 밖).
- 칸 이름표 글자색(`--pv-ink-muted`)은 `fg-3`(#8A8A8A) 대신 `fg-2` 로 했다. 흰 바탕 위에서 `fg-3` 이 읽히기 어렵다고 보았기 때문이다(재지는 않았다).

## 막히거나 헷갈린 곳

- **원본 CSS 의 들여쓰기.** 안내는 히어로 조각을 "네 칸 덜 들여 쓴다" 고 했지만 `brand.css`, `dark.css` 의 들여쓰기는 말하지 않았다(「첫 `<style>` 안 … 그대로 붙는다」 뿐). 치지직 `brand.css` 가 두 칸으로 시작해 그대로 따랐다. 열어 본 곳: 안내, 치지직 `brand.css`. 답은 치지직 원본에서 얻었다. 안내 탓(말하지 않음). 검사가 막지 않아 들여쓰기가 중요한지는 모른다.
- **다크 시트에 값을 글자로 쓸지 참조로 쓸지.** 치지직 `dark.css` 는 OKLCH 값을 글자로 다시 적고, STANDARD 3절은 `--pv-*` 를 참조로 주라고 한다. 다크 토큰 자체를 어떻게 쓸지는 안내와 기준 모두 말하지 않았다. `:root` 에 `--lf-dark-*` 를 두고 다크 시트에서 `var(--lf-dark-…)` 로 참조했다. 검증기는 통과했고 `oklch 0/32D` 로 셌다(다크 시트의 글자 OKLCH 가 0개라는 뜻으로 읽었다. 막힘이나 경고는 없었다). 열어 본 곳: STANDARD 3, 4절, 치지직 `dark.css`. 스스로 정했다.
- **조각 파일의 첫 줄 들여쓰기.** 안내의 칸 표는 `<pv-cell>` 을 "줄 머리" 라고 해서 바로 알았다. 히어로는 치지직 `hero.html` 이 0칸으로 시작해 확인했다.

## 안내에서 답을 찾지 못해 치지직 원본을 보고 따라 한 곳

- `brand.css` 의 두 칸 들여쓰기와 `:root` → 전역(`*`, `body`, `button`) → 컴포넌트 순서.
- 히어로 감싸개의 꼴(`.hero-wrap { padding: … var(--pv-gutter) … }` 안에 2열 grid). 안내는 `var(--pv-gutter)` 를 쓰라고만 했다.
- 시연 자리 안의 상태 이름표와 스펙 줄의 class 꼴(`.states`, `.state`, `.state-l`, `.specs`, `.spec`, `.hint`)과, 견본 옆에 "직접 입력" 줄을 두는 꼴.
- 검색 아이콘 SVG 경로와 서체 스택.
- 다크에서 글이 달라지는 스펙 줄을 `<template data-theme-variant="dark">` 로 바로 뒤에 두는 꼴(안내는 이름표에 대해서만 말한다).

## 일부러 넣는 잘못

문제 4 에는 없다.
