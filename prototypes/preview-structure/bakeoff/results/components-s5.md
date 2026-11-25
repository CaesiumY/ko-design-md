# components, 문제 5 결과

- 가지: `eval/components-s5` (`68b82f54` 에서 침)
- 풀이 커밋: `0393e6c0`

## 줄 번호

- 지적 1: `public/preview/toss/preview.html:1768` — buttons 구역 첫 칸 `button-size` 의 `<p class="pv-label">`.
- 지적 2: `public/preview/toss/preview.html:1570` — screens 구역 첫 `.pv-screen`(칸 `screen-send-home`) 안의 첫 `<button class="qb">채우기</button>`. `type` 이 없었으므로 `type="button"` 을 달았다.

## 고친 곳

- `prototypes/preview-structure/components/entries/toss/preview.ts:258` 칸 `button-size` 의 `label` 끝에 ` (가정)`.
- `prototypes/preview-structure/components/entries/toss/preview.ts:68` 칸 `screen-send-home` 의 `screen` 리터럴, `<button class="qb">` 에 `type="button"`.

## 파일 수와 줄 수 (`git diff --stat 68b82f54 0393e6c0`)

| 나눔 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 손으로 고친 원본 | 1 (`entries/toss/preview.ts`) | 2 | 2 |
| 명령이 만든 산출물 | 1 (`public/preview/toss/preview.html`) | 2 | 2 |
| 안내 문서와 테스트 | 0 | 0 | 0 |

## 재는 것

- 줄 번호에서 원본 위치를 찾기까지의 명령 수: 4 (Grep 으로 구역 시작 줄 찾기 1, 서빙 파일 Read 2, `pnpm pv:where toss 1768 1570` 1). `pv:where` 한 번이 두 줄 모두 원본 파일과 줄을 짚었다. 그 뒤 원본 확인 Read 2.
- 헛짚은 횟수: 0.
- 고친 뒤 서빙 HTML 에 반영됐는지 확인하는 데 든 명령 수: 4 (`pnpm pv:build toss`, Grep 으로 두 줄 확인, `pnpm pv:check toss`, `pnpm validate:previews --slug toss`). 포맷 확인 1 을 더 돌렸다.
- "풀었다" 조건: 1 서빙 파일 반영(1570, 1768 줄 확인) 채움, 2 `pnpm pv:check toss` ok, `validate:previews` 0 blocking 채움, 3 어긋남 검사(`pv:check` 안) ok 채움.

## 명령 기록

시작(1절)

1. `git status` — 성공
2. `git rev-parse HEAD` — 성공 (`8f1d0f7b`, 작업 폴더 처음 HEAD)
3. `git switch -c eval/components-s5 68b82f54` — 성공
4. `pnpm install` — 성공 (pnpm 이 찍은 시간 1m 19.6s)
5. `pnpm pv:check` — 성공 (chzzk, toss ok)
6. `pnpm validate:previews --slug toss` — 성공 (0 blocking, 2 warn: bare-1fr, no-mobile-collapse)
7. `pnpm validate:previews --slug chzzk` — 성공 (0 blocking)

문제 5

8. Grep `data-pv-zone="(buttons|screens)"` in 서빙 파일 — 성공 (1543, 1764)
9. Read 서빙 파일 1543부터 50줄 — 성공 (첫 버튼 1570)
10. Read 서빙 파일 1764부터 8줄 — 성공 (첫 칸 이름표 1768)
11. `pnpm pv:where toss 1768 1570` — 성공 (preview.ts:258, preview.ts:68)
12. Read `entries/toss/preview.ts` 60~74 — 성공
13. Read `entries/toss/preview.ts` 252~261 — 성공
14. Edit label — 성공
15. Edit button — 성공
16. `pnpm pv:build toss` — 성공
17. Grep 서빙 파일에서 두 줄 확인 — 성공 (1570, 1768 반영)
18. `pnpm pv:check toss` — 성공
19. `pnpm validate:previews --slug toss` — 성공 (0 blocking, 시작 때와 같은 2 warn)
20. `pnpm exec prettier --check …/entries/toss/preview.ts` — 성공
21. `git diff --stat` — 성공
22. `git add` 두 파일 — 성공
23. `git commit -s -q -F .claude/cache/msg-s5-solve.txt` — 성공
24. `git log -1` — 성공
25. `git status --short` — 성공 (깨끗)

실행한 명령 26개 안팎(결과 커밋 포함 전), 실패 0.

## 걸린 시간

명령이 스스로 찍은 값은 `pnpm install` 의 1m 19.6s 뿐이다. 나머지는 재지 않음.

## 막히거나 헷갈린 곳

- 없음. 안내 9절의 `pnpm pv:where toss 1768 1570` 예가 이번 두 줄과 같은 꼴이라 그대로 썼다. 열어 본 파일: 서빙 HTML 1, 원본 모듈 1(두 곳).
