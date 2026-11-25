# fragments, 문제 1 결과

가지 `eval/fragments-s1`, 시작 `2a077dca`, 풀이 커밋 `5895bcba`.

## 명령 기록

| 명령/도구 | 결과 |
| --- | --- |
| `git switch -c eval/fragments-s1 2a077dca` | 성공 |
| Grep `pv-zone-title\|pv-title-weight` in `frame.css` | 성공. 20~28줄, `font-size: 22px`, `font-weight: var(--pv-title-weight, 700)` |
| Grep `pv-title-weight\|pv-zone-title` in `preview-src/` | 성공. 일치 없음(두 항목 모두 `--pv-title-weight` 를 주지 않음) |
| Grep `22px\|font-size` in `frame.css` | 성공. 제목 크기는 23줄 한 곳(@media 로 덮는 곳 없음) |
| Edit `frame.css` 23~24줄: `26px`, 기본값 `800` | 성공 |
| `pnpm previews:check` | 실패(예상한 것). `public/preview/chzzk/preview.html:34 — 원본에서 조립한 결과와 34줄부터 다르다 …`, toss 도 같음. 종류: 없음(조립 전이라 어긋남을 내는 것이 정상. 안내 104절 5단계대로 다음에 build) |
| `pnpm previews:build` | 성공. chzzk, toss 조립 |
| `pnpm previews:check` | 성공. 위반 없음, 어긋남 없음 |
| `pnpm validate:previews --slug toss` | 성공. 0 blocking, 2 warn(시작 때부터 있던 bare-1fr, no-mobile-collapse) |
| `pnpm validate:previews --slug chzzk` | 성공. 0 blocking, 0 warn |
| `git diff --stat` | 성공. 3 파일, +6 −6 |
| `pnpm exec vitest run prototypes/preview-structure/fragments` | 성공. 21 passed. 스스로 찍은 시간 Duration 478ms. 끝에 `ReferenceError: module is not defined` 와 `close timed out after 10000ms` 가 찍혔으나 테스트는 통과(환경 잡음) |

- 명령 수(커밋 빼고): 12. 실패 1(조립 전 check 의 어긋남 지적. 의도한 확인이었음).
- 고친 뒤 확인까지: build, check, validate 둘, vitest = 5. 걸린 시간: vitest 478ms 말고는 재지 않음.

## 파일 수와 줄 수 (`git diff --stat 2a077dca 5895bcba`)

| 갈래 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 손으로 고친 원본 | 1 (`prototypes/preview-structure/frame.css`) | 2 | 2 |
| 명령이 만든 산출물 | 2 (`public/preview/chzzk/preview.html`, `public/preview/toss/preview.html`) | 4 | 4 |
| 안내 문서와 테스트 | 0 | 0 | 0 |

## 막히거나 헷갈린 곳

- "굵기 700 에서 800" 을 어디서 바꿀지: 굵기는 `var(--pv-title-weight, 700)` 의 기본값이다. 항목이 이 변수를 주는지 `preview-src/` 를 Grep 해서 두 항목 모두 주지 않음을 보고 기본값만 800 으로 바꿨다. STANDARD 3절 표의 "안 주면 700" 문구는 고치지 않는 파일이라 그대로 두었다. 열어 본 파일: `frame.css` 하나(Grep 으로).
