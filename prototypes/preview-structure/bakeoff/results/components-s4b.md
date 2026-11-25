# 구조 "components" 문제 4 (두 번째 풀이, s4b)

가지 `eval/components-s4b`, 시작점 `68b82f54`. 준비 커밋 `1efe625e`(라프텔 서빙 파일 삭제만), 풀이 커밋 `df11de58`.

## 명령 기록

준비 단계(1~11)는 실행한 뒤 이 파일을 만들며 옮겨 적었다. 12부터는 실행할 때마다 적었다.

| # | 명령 | 결과 | 실패면 출력 한 줄과 종류 |
| --- | --- | --- | --- |
| 1 | `git status` | 성공 | |
| 2 | `git rev-parse HEAD` | 성공 | |
| 3 | `git switch -c eval/components-s4b 68b82f54` | 성공 | |
| 4 | `pnpm install` | 성공 (`Done in 17.2s`) | |
| 5 | `pnpm validate:previews --slug toss` | 성공 (막힘 0, 경고 2) | |
| 6 | `pnpm validate:previews --slug chzzk` | 성공 (막힘 0) | |
| 7 | `pnpm pv:check` | 성공 (chzzk, toss ok) | |
| 8 | `git rm -q public/preview/laftel/preview.html` | 성공 | |
| 9 | `git commit -s -q -F .claude/cache/msg-prep.txt` (준비 커밋) | 성공 | |
| 10 | `git rev-parse HEAD` | 성공 | |
| 11 | `git status --short` | 성공 | |
| — | 첫 파일 쓰기 시작(`entries/laftel/light.css`, `dark.css`, `preview.ts` 를 Write 로) | | |
| 12 | `pnpm typecheck` | 성공 | |
| 13 | `pnpm pv:build laftel` | 성공 (`built … -> public/preview/laftel/preview.html`) | |
| 14 | `pnpm validate:previews --slug laftel --verbose` | 성공 (`ok laftel (oklch 22/32L 16/32D)`, 막힘 0, 경고 0) | |
| 15 | `pnpm pv:check laftel` | 성공 (`ok public/preview/laftel/preview.html`) | |
| 16 | `pnpm exec prettier --write …/entries/laftel/preview.ts` | 성공 (`unchanged`) | |
| 17 | `pnpm pv:check laftel` (포맷 뒤 다시) | 성공 | |
| 18 | `git status --short` | 성공 | |
| 19 | `git add …/entries/laftel public/preview/laftel/preview.html` | 성공 | |
| 20 | `git commit -s -q -F .claude/cache/msg-solve.txt` (풀이 커밋) | 성공 | |
| 21 | `git diff --stat 1efe625e HEAD` | 성공 | |
| 22 | `git rev-parse HEAD` | 성공 | |

이 뒤에 결과 커밋을 위한 `git add`, `git commit`, `git status` 를 돌렸다(이 표에는 넣지 않았다).

명령 22개, 실패 0개. 첫 파일을 쓰기 시작한 뒤로는 명령 11개(12~22), 그중 확인 명령은 12~17 의 6개.

## 걸린 시간

명령이 스스로 찍은 값은 `pnpm install` 의 17.2초, prettier 의 147ms 뿐이다. 나머지는 재지 않음.

## 확인 회차

| 회차 | 타입 검사 | 빌드(약속 검사 포함) | `validate:previews --slug laftel --verbose` | `pv:check laftel` | 막힘의 종류 |
| --- | --- | --- | --- | --- | --- |
| 1 | 통과 | 통과 | 통과 (막힘 0, 경고 0) | 통과 | 없음 |

처음으로 두 검사(약속 검사, 프리뷰 검증기)가 모두 통과한 회차: 1회차. 빌드는 지워진 `public/preview/laftel/` 폴더를 스스로 다시 만들었고, 새 항목 폴더를 따로 등록하지 않아도 슬러그로 찾았다.

## 파일 수와 줄 수 (`git diff --stat 1efe625e df11de58`)

| 나눔 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 손으로 고친 원본 | `entries/laftel/preview.ts` 121, `light.css` 118, `dark.css` 10 (3개) | 249 | 0 |
| 명령이 만든 산출물 | `public/preview/laftel/preview.html` (1개) | 345 | 0 |
| 안내 문서와 테스트 | 0개 | 0 | 0 |

새로 만든 파일은 위 넷이 전부다(손으로 쓴 셋, 빌드가 쓴 하나).

구조가 대신 써 준 줄: 산출물 345줄에서, 글자 그대로 옮겨진 브랜드 CSS 128줄(118 + 10)과 모듈의 마크업 리터럴 64줄(히어로 10, 화면 25, 버튼 칸 8 + 6 + 6, 입력 칸 9)을 뺀 153줄이다. 이 153줄에는 `<head>`, 틀 CSS 블록, 면책 띠, 구역과 칸의 겉 태그, 이름표와 더미 데이터 표기 줄이 든다(이름표 글 자체는 모듈에 손으로 썼다). 센 방법은 리터럴의 줄을 손으로 센 것이다.

## 범위

면책 띠(부품이 씀), 히어로, 화면 칸 하나(`screen-home-desktop`), 버튼 구역(`button-cta`, `button-primary`, `button-secondary`), 입력 구역(`search-field`). 선택, 내비게이션, 콘텐츠 구역은 쓰지 않았다. 칩, 배지, 포스터 카드, 헤더, 네비 링크는 화면 재현(`role="img"`) 안에서만 모양으로 그렸다.

손끝 반응: `button-cta` 의 hover(배경 흰색 70%)만 실제 `:hover` 로 넣었다. 포스터 카드에 `cursor: pointer` 를 두었다. 초점 스타일은 만들지 않았고 `outline: none` 도 쓰지 않아 브라우저 기본 초점 링이 남는다.

## md 해석으로 정한 곳 (구조와 무관)

- md 의 Components 값은 다크 실측이고 이름이 `dark-bg-1` 같은 다크 토큰이다. 각 다크 토큰 주석에 적힌 시맨틱 변수 이름(`--background-1`, `--foreground-2`, `--border-1` 등)의 라이트 값을 라이트 테마에 썼다. 그래서 라이트 쪽에 `(가정)` 표지를 달지 않았고 `labelDark` 도 쓰지 않았다.
- `button-cta` 의 흰 배경과 어두운 글자는 리터럴이라 두 테마에서 고정했다. 흰 버튼이 놓일 자리로 이미지 자리 면을 그렸고 그 색(`dark-bg-3` 고정)은 이름표에 `(이미지 자리 색 가정)` 으로 밝혔다. 글자 크기와 굵기는 md 에 없어 `(글자 … 가정)` 으로 밝혔다.
- 보라 1차 버튼은 frontmatter `components:` 에는 없고 Colors 산문에 160×56, radius 4 로 나온다. hover 는 팔레트 이름 `PURPLE700` 만 있고 값이 없어 넣지 않았다. 눌림은 Known Gaps 에 미확인이라 넣지 않았다.
- `button-secondary` 의 글자 크기는 `1em` 이라 12px 로 그렸고 `(글자 크기 가정)` 으로 밝혔다.
- `search-field` 의 펼친 모습에 돋보기를 넣을지는 md 에 없어 넣지 않았다.
- 실제 작품명, 푸밍 그림을 쓰지 않았다(md 의 Don't). 칩은 "장르 1" 같은 자리 표시 글이다.

## 막히거나 헷갈린 곳

- 프리뷰 검증기가 무엇을 막는지 미리 알려고 `src/lib/preview-validator.ts` 에서 규칙 이름을 Grep 했으나 목록을 얻지 못했다. 안내에도 없었다. 결국 검증기를 돌려 보고 따르기로 했다(1회차에 막힘이 없어 따로 고친 것은 없다).
- 다크 시트에 `var()` 참조를 쓸지 OKLCH 글자를 쓸지 안내에 없었다. 치지직 `dark.css` 를 보고 OKLCH 글자로 썼다.
- 연 파일 수: 첫 파일을 쓰기 전 11개(지시 파일 2, 구조 안내, `SCENARIOS.md`, `STANDARD.md`, `services/laftel.md`, 치지직 원본 3, `.claude/rules/preview.md`, `components/kit/parts.ts`), Glob 2번(항목 폴더 목록, 로고 파일), Grep 1번. 쓰기 시작한 뒤로 연 파일은 없다.

## 안내에서 답을 찾지 못해 치지직을 보고 따라 한 곳

- `:root` 에 `--background`, `--foreground`, `--primary`, `--primary-foreground` 를 두는 것과 `body` 의 기본 줄(`margin: 0`, 배경, 글자색, 서체).
- 히어로 감싸개의 `padding: … var(--pv-gutter) …`(STANDARD 3절에 뜻은 있으나 꼴은 치지직에서 봤다).
- `dark.css` 를 `[data-theme="dark"] { … }` 한 덩어리에 OKLCH 글자로 쓰는 꼴.
- 칸 안의 상태 이름표와 스펙 줄의 class 꼴(`.states`, `.state`, `.state-l`, `.specs`, `.spec`, `.hint`)과 조작 안내 문구의 꼴.
- 로고 경로 `/logos/{slug}.png` 와 화면 목업 안 로고의 `alt=""`.
