# components, 문제 1 결과

- 가지: `eval/components-s1` (`68b82f54` 에서 침)
- 풀이 커밋: `318f6a7f`

## 고친 곳

- `prototypes/preview-structure/frame.css` 의 `.pv-zone-title`: `font-size: 22px` → `26px`, `font-weight: var(--pv-title-weight, 700)` → `var(--pv-title-weight, 800)`.
- 치지직과 토스 모두 `--pv-title-weight` 를 주지 않는다(Grep 으로 확인, `base-notes/chzzk.md:105`, `base-notes/toss.md:148` 도 같은 말). 그래서 기본값만 바꾸면 둘 다 800 이 된다.
- `pnpm pv:build` 한 번으로 두 산출물에 틀 블록이 다시 실렸다.

## 파일 수와 줄 수 (`git diff --stat 68b82f54 318f6a7f`)

| 나눔 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 손으로 고친 원본 | 1 (`frame.css`) | 2 | 2 |
| 명령이 만든 산출물 | 2 (`public/preview/chzzk/preview.html`, `public/preview/toss/preview.html`) | 4 | 4 |
| 안내 문서와 테스트 | 0 | 0 | 0 |

## "풀었다" 조건

1. 서빙 파일 반영: 두 산출물의 틀 블록이 26px, 800 으로 바뀌었다(`git diff --stat` 에서 파일마다 2줄씩) — 채움.
2. `pnpm pv:check` ok, `pnpm validate:previews --slug toss` 0 blocking(시작 때와 같은 2 warn), `--slug chzzk` 0 blocking — 채움.
3. 어긋남 검사(`pnpm pv:check` 안, `vitest run prototypes/preview-structure/components` 12 passed) — 채움.

## 명령 기록

(시작 절차의 명령은 `components-s5.md` 에 적었다. 이 가지는 같은 작업 폴더에서 쳤고 `pnpm install` 을 다시 돌리지 않았다.)

1. `git switch -c eval/components-s1 68b82f54` — 성공
2. Grep `pv-zone-title|title-weight` in `frame.css` — 성공
3. Grep `--pv-title-weight|font-size: 22px` in `prototypes/preview-structure` — 성공 (두 항목 모두 변수를 주지 않음)
4. Read `frame.css` 1~30 — 성공
5. Edit `frame.css` — 성공
6. `pnpm pv:build` — 성공 (chzzk, toss)
7. `pnpm pv:check` — 성공
8. `pnpm validate:previews --slug toss` — 성공 (0 blocking, 2 warn)
9. `pnpm validate:previews --slug chzzk` — 성공
10. `git diff --stat` — 성공
11. `pnpm exec vitest run prototypes/preview-structure/components` — 성공 (12 passed). 끝에 `ReferenceError: module is not defined` 와 `close timed out after 10000ms` 가 찍혔으나 테스트는 통과로 끝났다(환경의 잡음, 실패로 세지 않음)
12. `git add` 세 파일 — 성공
13. `git commit -s -q -F .claude/cache/msg-s1-solve.txt` — 성공
14. `git log -1` — 성공

실패 0.

## 걸린 시간

vitest 가 찍은 `Duration 356ms` 뿐이다. 나머지는 재지 않음.

## 막히거나 헷갈린 곳

- 굵기가 틀 기본값(`700`)인지 항목이 준 값인지를 먼저 확인했다. 안내 2절의 `light.css` 설명과 7절 표("틀의 모양 → frame.css")를 보고, Grep 으로 두 항목이 `--pv-title-weight` 를 주지 않는 것을 확인했다. 열어 본 파일 1개(`frame.css`), 나머지는 Grep.
