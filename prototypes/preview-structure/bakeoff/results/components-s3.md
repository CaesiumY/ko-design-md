# components, 문제 3 결과

- 가지: `eval/components-s3` (`68b82f54` 에서 침)
- 풀이 커밋: `6ea05ed6`

## 고친 곳

- 구역 목록: `components/kit/zones.ts` 의 `ZONES` 한 곳. `selection` 을 `inputs` 앞으로 옮기고 `{ id: "tables", title: "표" }` 를 `content` 와 `feedback` 사이에 넣었다.
- 치지직: `entries/chzzk/preview.ts` 에서 `content` 구역의 칸 `badge` 덩어리를 잘라 새 `zone("tables", [ … ])` 에 넣었다(모듈 안에서는 `content` 와 `feedback` 사이에 둠. 안내 7절대로 모듈 안 순서는 상관없다).
- 토스: 모듈을 고치지 않았다. `selection` 과 `inputs` 를 모두 가진 항목이라 빌드만으로 새 순서가 됐다. 치지직은 `selection` 구역이 없어 순서 바꿈은 산출물에 나타나지 않는다.
- 구역 목록이 따로 적힌 `base-notes/check-base.ts` 의 `ZONES` 와 `STANDARD.md` 1절 표는 지시 파일이 고치지 말라는 파일이라 그대로 두었다(안내 7절이 이 두 곳을 짚는다). `check-base.ts` 는 돌리지 않았다.
- 테스트 견본(`components.test.ts` 의 `sample`)은 screens, buttons, inputs 만 써서 기대를 고칠 필요가 없었다(12 passed).

구역 목록을 고친 곳의 수: 1 (`kit/zones.ts`). 이 구조의 빌드와 약속 검사가 읽지 않는 사본 2곳은 고치지 않음.

## 파일 수와 줄 수 (`git diff --numstat 68b82f54 6ea05ed6`)

| 나눔 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 손으로 고친 원본 | 2 (`kit/zones.ts` +2 −1, `entries/chzzk/preview.ts` +24 −22) | 26 | 23 |
| 명령이 만든 산출물 | 2 (`public/preview/chzzk/preview.html` +26 −20, `public/preview/toss/preview.html` +93 −93) | 119 | 113 |
| 안내 문서와 테스트 | 0 | 0 | 0 |

항목마다 고친 줄 수(원본): 치지직 +24 −22(칸 하나를 옮김. 실제로 더한 것은 `zone("tables", [` 와 `]),` 두 줄), 토스 0.

## 서빙 파일의 구역 순서 (Grep `data-pv-zone="`)

- 치지직: hero, screens, buttons, inputs, navigation, content, tables, feedback
- 토스: hero, screens, buttons, selection, inputs, navigation, content, feedback

## 일부러 넣은 잘못

- 풀이 커밋 뒤, 서빙 파일 `public/preview/toss/preview.html` 에서 `selection` 과 `inputs` section 덩어리를 맞바꿨다(옛 순서로 되돌린 꼴). 스크립트 `<임시 폴더>/swap-zones.mjs` 를 써서 `node … public/preview/toss/preview.html selection inputs` 로 돌렸다.
  항목 모듈에서 `zone(...)` 순서를 바꾸는 것으로는 잘못을 만들 수 없다(빌드가 `ZONES` 순서로 늘어놓는다, 안내 2절). 그래서 서빙 파일을 고친 경우로 만들었다.
- `pnpm pv:check toss` 출력(exit 1):

```
public/preview/toss/preview.html:1930 [selection] 구역 순서가 틀렸다: "selection" 가 "inputs" 뒤에 있다. 순서는 screens, buttons, selection, inputs, navigation, content, tables, feedback, brand 다(kit/zones.ts)
public/preview/toss/preview.html:1828 이 prototypes/preview-structure/components/entries/toss 를 빌드한 결과와 다르다(원본과 산출물의 어긋남). 서빙 파일이 아니라 항목 모듈을 고치고 pnpm pv:build toss 로 다시 만든다. 원본 줄은 pnpm pv:where toss 1828
```

- `pnpm exec vitest run prototypes/preview-structure/components`: `served previews > toss equals what its item module builds` 1 failed.
- 잡았는가: 잡았다. 순서 규칙과 어긋남 검사 둘 다 걸렸다.
- `git restore public/preview/toss/preview.html` 로 되돌렸다. 잘못은 커밋하지 않았다.

## "풀었다" 조건

1. 서빙 파일 반영: 위 순서. 치지직 `badge` 칸이 `tables` 구역에 있다 — 채움.
2. `pnpm pv:check` ok, `validate:previews --slug toss` 0 blocking(2 warn, 시작 때와 같음), `--slug chzzk` 0 blocking, `pnpm exec tsc --noEmit` 출력 없음 — 채움.
3. 어긋남 검사(`pv:check`, vitest 12 passed) — 채움.

## 명령 기록

(시작 절차는 `components-s5.md`. 같은 작업 폴더라 `pnpm install` 을 다시 돌리지 않았다.)

1. `git switch -c eval/components-s3 68b82f54` — 성공
2. Read `kit/zones.ts` — 성공
3. Edit `kit/zones.ts` — 성공
4. Grep `zone\("|name: "` in `entries/chzzk/preview.ts` — 성공
5. Read `entries/chzzk/preview.ts` 305~400 — 성공
6. Edit 치지직 content 에서 `badge` 칸 지우기 — 성공
7. Edit 치지직 `zone("tables", …)` 더하기 — 성공
8. `pnpm exec tsc --noEmit` — 성공
9. `pnpm pv:build` — 성공
10. `pnpm pv:check` — 성공
11. `pnpm exec vitest run prototypes/preview-structure/components` — 성공 (12 passed, 끝의 `ReferenceError` 와 close timeout 은 통과 뒤 잡음)
12. `pnpm validate:previews --slug toss` — 성공
13. `pnpm validate:previews --slug chzzk` — 성공
14. Grep 치지직 구역 순서 — 성공
15. Grep 토스 구역 순서 — 성공
16. `pnpm exec prettier --check` 두 ts — 성공
17. `git diff --numstat` — 성공
18. `git add` 네 파일 — 성공
19. `git commit -s -q -F .claude/cache/msg-s3-solve.txt` — 성공
20. `git log -1` — 성공
21. Write 구역 맞바꿈 스크립트(임시 폴더) — 성공
22. `node …/swap-zones.mjs public/preview/toss/preview.html selection inputs` — 성공
23. `pnpm pv:check toss` — 실패(기대한 실패, 위 출력)
24. `pnpm exec vitest run prototypes/preview-structure/components` — 실패(기대한 실패, 1 failed)
25. `git restore public/preview/toss/preview.html` — 성공
26. `git status --short` — 성공 (깨끗)

뜻하지 않은 실패 0. 기대한 실패 2.

## 걸린 시간

vitest 가 찍은 값: 305ms(11), 318ms(24). 나머지는 재지 않음.

## 막히거나 헷갈린 곳

- 치지직 콘텐츠 칸 넷 가운데 어느 것을 옮길지는 문제가 정하지 않아 `badge` 를 골랐다(표 시연인 칸은 없다).
- 토스의 순서를 "일부러 뒤바꾸는" 자리: 모듈에서는 순서를 바꿀 수 없다는 것을 안내 2절("구역은 모듈에 적은 순서가 아니라 `kit/zones.ts` 의 순서로 나온다")에서 읽고, 서빙 파일에서 바꿨다. 안내 「구역을 더하거나 순서를 바꾸는 법」 1~5 를 그대로 따랐고 다른 곳을 찾을 일은 없었다.
- 열어 본 파일: `kit/zones.ts`, `entries/chzzk/preview.ts`(한 구간).
