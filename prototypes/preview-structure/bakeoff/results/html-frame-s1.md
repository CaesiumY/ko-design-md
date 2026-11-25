# html-frame 문제 1 결과

- 가지: `eval/html-frame-s1` (`0ef2f879` 에서 침)
- 풀이 커밋: `ef33a50e`

## 고친 곳

`public/preview/_runtime/frame.css` 의 `.pv-zone-title` 두 줄.

- `font-size: 22px;` → `font-size: 26px;`
- `font-weight: var(--pv-title-weight, 700);` → `font-weight: var(--pv-title-weight, 800);`

굵기는 변수의 기본값이다. 토스와 치지직의 프리뷰가 `--pv-title-weight` 를 주는지 Grep 으로 봤고, 둘 다 주지 않았다(`public/preview` 안에서 이 이름은 `frame.css` 24줄에만 있다). 그래서 기본값을 바꾸면 둘 다 800 이 된다. 768px 아래 `@media` 블록은 제목 크기를 다시 정하지 않는다.

항목 파일(`public/preview/toss/preview.html`, `public/preview/chzzk/preview.html`)은 고치지 않았다.

## "풀었다" 조건

1. 서빙되는 두 프리뷰가 바뀐 요구를 반영한다: 예. 두 파일이 싣는 `/preview/_runtime/frame.css` 가 바뀌었다. 렌더해서 잰 값(아래 명령 9): 토스 구역 제목 7개, 치지직 6개 모두 라이트와 다크에서 `26px/800`.
2. 약속 검사 `check-frame.ts toss chzzk` 둘 다 `ok`, `pnpm validate:previews` 는 토스 `PASSED`(경고 2개는 고치기 전과 같음), 치지직 `PASSED`. 약속 검사 테스트 14개 통과.
3. 원본과 산출물이 따로 없는 구조라 어긋남 검사가 없다(해당 없음).

## 파일 수와 줄 수 (`ef33a50e` 의 `--shortstat`, 부모가 `0ef2f879`)

| 나눔 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 손으로 고친 원본 | 1 (`public/preview/_runtime/frame.css`) | 2 | 2 |
| 명령이 만든 산출물 | 0 | 0 | 0 |
| 안내 문서와 테스트 | 0 | 0 | 0 |

## 명령 기록

| # | 명령 | 결과 |
| --- | --- | --- |
| 1 | `git switch -c eval/html-frame-s1 0ef2f879` | 성공 |
| 2 | Grep `pv-zone-title|22px|--pv-title-weight` (frame.css) | 성공 |
| 3 | Grep `--pv-title-weight|pv-zone-title` (public/preview, glob `*/preview.html`) | 실패: `No matches found`. 내 실수(glob 을 잘못 줌. 파일에는 `pv-zone-title` 이 있다) |
| 4 | Grep `--pv-title-weight` (public/preview, glob 없이) | 성공(frame.css 24줄 하나) |
| 5 | Read frame.css 전체 | 성공 |
| 6 | Edit frame.css 두 줄 | 성공 |
| 7 | Grep `22px|title-weight, 700` (html-frame 폴더, 테스트가 옛 값을 보는지) | 성공(없음) |
| 8 | Write 렌더 측정 스크립트(임시 폴더) | 성공 |
| 9 | `node <임시 폴더>/s1-title-style.mjs` | 성공(toss 7개, chzzk 6개, 두 테마 모두 26px/800) |
| 10 | `check-frame.ts toss chzzk` | 성공 |
| 11 | `pnpm validate:previews --slug toss` | 성공(PASSED, 경고 2) |
| 12 | `pnpm validate:previews --slug chzzk` | 성공(PASSED) |
| 13 | `pnpm exec vitest run prototypes/preview-structure/html-frame` | 성공(14 passed, `Duration 1.75s`). 뒤에 `ReferenceError: module is not defined` 와 `close timed out after 10000ms` 가 찍혔으나 테스트 결과는 통과 |
| 14 | Write 커밋 메시지 파일 | 성공 |
| 15 | `git add public/preview/_runtime/frame.css` | 성공 |
| 16 | `git commit -s -q -F .claude/cache/eval-msg-s1-fix.txt` | 성공 |
| 17 | `git log -1 --format=%h --shortstat` | 성공 |

- 명령 수 17, 실패 1(내 실수).
- 고치고 나서 확인이 끝날 때까지 돌린 명령: 7, 9~13. 걸린 시간: vitest 가 찍은 `Duration 1.75s` 말고는 재지 않음.

## 막히거나 헷갈린 곳

- 굵기 700 이 `frame.css` 에 글자로 있지 않고 `var(--pv-title-weight, 700)` 의 기본값이라, 항목이 이 변수를 주면 기본값을 바꿔도 그 항목은 바뀌지 않는다. 두 항목이 변수를 주는지 Grep 으로 확인했다(명령 3, 4). 안내 3절이 이 변수를 "선택"이라 말해서 찾을 곳을 알았다. 연 파일: frame.css 1개.
- 렌더해서 확인하는 방법을 안내가 말하는 `dom-diff.ts` 는 두 HTML 을 비교하는 도구라, 바꾸기 전 `public/` 을 따로 준비해야 했다. 대신 Playwright 로 계산된 스타일만 재는 스크립트를 임시 폴더에 써서 돌렸다.
- `STANDARD.md` 3절 표의 `--pv-title-weight` 설명은 "안 주면 700" 이다. 고치지 않는 파일이라 그대로 두었다. 이 구조의 안내(README)에는 22px, 700 이라는 값이 적혀 있지 않다.
