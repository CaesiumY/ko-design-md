# components, 문제 2 결과

- 가지: `eval/components-s2` (`68b82f54` 에서 침)
- 풀이 커밋: `186d5ced`

## 고친 곳

- `components/kit/parts.ts` 의 `renderCell`: 칸 여는 줄에 `role="group" aria-labelledby="pv-label-{칸 이름}"`, 이름표 `<p class="pv-label">` 와 다크 이름표 template 안의 `<p class="pv-label">` 에 `id="pv-label-{칸 이름}"`. 다크 이름표는 공용 `iframe.js` 가 바꿔 끼므로 같은 id 를 실었다(template 안은 문서에 들지 않아 id 가 겹치지 않는다).
- `components/kit/check.ts`: `labelIdOf()` 를 내보내고(부품도 이것을 씀) `checkCells` 에 네 규칙을 더했다. 칸에 `role="group"` 없음, 칸의 `aria-labelledby` 가 `pv-label-{칸 이름}` 이 아님, 이름표 `id` 가 다름, 다크 이름표 `id` 가 다름. 메시지마다 "틀(kit/parts.ts 의 renderCell)이 쓴다, pnpm pv:build 로 다시 만든다" 를 붙였다.
- `components/components.test.ts`: 기존 테스트가 `<p class="pv-label">button-primary</p>` 글자로 이름표를 찾던 네 곳을 새 꼴(`LABEL` 상수)로 바꿨고, 새 테스트 다섯(aria-labelledby 없음, role 없음, 이름표 id 없음, 다크 이름표 id 없음, 부품이 새 꼴로 쓰는지).
- `components/README.md` 4절 잡는 것 목록에 한 줄.
- `pnpm pv:where` 의 정규식은 속성이 뒤에 붙는 것을 받으므로 고치지 않았다(안내 7절이 "속성을 더하는 것은 괜찮다" 고 함). `pnpm pv:where toss 1768 1767 1547` 로 칸 겉 줄과 이름표 줄이 그대로 원본을 짚는 것을 확인했다.
- 항목 모듈(`entries/*/preview.ts`)은 하나도 고치지 않았다. 칸 41개(토스)와 14개(치지직) 모두 빌드가 바꿨다(Grep 개수: `data-pv-cell=` 와 `role="group" aria-labelledby="pv-label-` 가 토스 41/41, 치지직 14/14).

## 파일 수와 줄 수 (`git diff --numstat 68b82f54 186d5ced`)

| 나눔 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 손으로 고친 원본 | 2 (`kit/parts.ts` +9 −4, `kit/check.ts` +28 −0) | 37 | 4 |
| 명령이 만든 산출물 | 2 (`public/preview/chzzk/preview.html` +32 −32, `public/preview/toss/preview.html` +82 −82) | 114 | 114 |
| 안내 문서와 테스트 | 2 (`components.test.ts` +53 −10, `README.md` +1 −0) | 54 | 10 |

손으로 고친 곳: `parts.ts`, `check.ts`, 테스트, README. 스크립트로 고친 곳: 두 서빙 HTML(`pnpm pv:build`). `check.ts` 와 테스트의 줄 바꿈 일부는 `prettier --write` 가 했다.

## 일부러 넣은 잘못

- 풀이 커밋 뒤, 서빙 파일 `public/preview/toss/preview.html:1767`(칸 `button-size`)의 여는 줄에서 `aria-labelledby="pv-label-button-size"` 를 지웠다. 이 구조에서는 칸 속성을 항목 모듈이 쓰지 않으므로(부품이 씀) 모듈에서 칸 하나만 빼는 길이 없다. 그래서 서빙 파일을 손으로 고친 경우로 만들었다.
- `pnpm pv:check toss` 출력(exit 1):

```
public/preview/toss/preview.html:1767 [buttons/button-size] 칸 buttons/button-size 의 aria-labelledby 가 "(없음)" 다. 그 칸의 이름표 id "pv-label-button-size" 를 가리켜야 한다. 이 속성은 틀(kit/parts.ts 의 renderCell)이 쓴다. 서빙 파일을 손으로 고치지 말고 pnpm pv:build 로 다시 만든다
public/preview/toss/preview.html:1767 이 prototypes/preview-structure/components/entries/toss 를 빌드한 결과와 다르다(원본과 산출물의 어긋남). 서빙 파일이 아니라 항목 모듈을 고치고 pnpm pv:build toss 로 다시 만든다. 원본 줄은 pnpm pv:where toss 1767
```

- `pnpm exec vitest run prototypes/preview-structure/components` 출력: `served previews > toss equals what its item module builds` 1 failed, 메시지 `public/preview/toss/preview.html 이 원본과 다르다. pnpm pv:build toss 로 다시 만든다.`
- 잡았는가: 잡았다. 줄(1767)과 칸(`buttons/button-size`)을 짚었고, 고칠 곳으로 `kit/parts.ts` 의 `renderCell` 과 다시 만드는 명령을 말한다. 어긋남 줄의 메시지는 "항목 모듈을 고치고" 라고 하는데 이 경우에는 모듈에 고칠 것이 없고 `pnpm pv:build toss` 만 돌리면 된다.
- `git restore public/preview/toss/preview.html` 로 되돌렸다. 잘못은 커밋하지 않았다.

## "풀었다" 조건

1. 서빙 파일 반영: 두 항목의 모든 칸에 `role="group"`, `aria-labelledby`, 이름표 `id` — 채움.
2. `pnpm pv:check` ok, `validate:previews --slug toss` 0 blocking(2 warn, 시작 때와 같음), `--slug chzzk` 0 blocking, `pnpm exec tsc --noEmit` 출력 없음 — 채움.
3. 어긋남 검사(`pv:check`, vitest 17 passed) — 채움.

## 명령 기록

(시작 절차는 `components-s5.md`. 같은 작업 폴더라 `pnpm install` 을 다시 돌리지 않았다.)

1. `git switch -c eval/components-s2 68b82f54` — 성공
2. Read `kit/parts.ts` — 성공
3. Read `kit/check.ts` — 성공
4. Read `where.ts` — 성공
5. Read `components.test.ts` — 성공
6. Edit `parts.ts` renderCell — 성공
7. Edit `parts.ts` import — 성공
8. Edit `check.ts` labelIdOf, FIX_FRAME — 성공
9. Edit `check.ts` checkCells 규칙 — 성공
10. Edit `check.ts` 군더더기 식 지우기 — 성공 (9에서 쓸모없는 `${zoneId === "?" ? "" : ""}` 를 넣었다. 종류: 내 실수, 명령 실패는 아님)
11. Edit 테스트 상수 — 성공
12. Edit 테스트 이름표 없음 — 성공
13. Edit 테스트 빈 이름표와 새 테스트 다섯 — 성공
14. Edit 테스트 줄 짚기 — 성공
15. `pnpm pv:build` — 성공
16. `pnpm exec vitest run prototypes/preview-structure/components` — 성공 (17 passed, 끝의 `ReferenceError: module is not defined` 와 close timeout 은 통과 뒤 잡음)
17. `pnpm pv:check` — 성공
18. `pnpm validate:previews --slug toss` — 성공
19. `pnpm validate:previews --slug chzzk` — 성공
20. `pnpm exec tsc --noEmit` — 성공
21. `pnpm exec prettier --check` 세 ts — 실패: `Code style issues found in 2 files`(check.ts, components.test.ts). 종류: 내 실수(긴 줄을 손으로 썼음)
22. `pnpm exec prettier --write` 두 파일 — 성공
23. `pnpm pv:where toss 1768 1767 1547` — 성공 (새 속성이 붙은 줄도 원본을 짚음)
24. Grep `data-pv-cell=` 개수, 두 public 폴더 glob — 0 건(Grep 도구의 glob `{toss,chzzk}/preview.html` 이 맞지 않음). 종류: 내 실수
25~28. Grep 파일마다 두 패턴 개수 — 성공 (토스 41/41, 치지직 14/14)
29. Edit README 4절 — 성공
30. `pnpm exec vitest run prototypes/preview-structure/components` — 성공 (17 passed)
31. `git diff --stat` — 성공
32. `git add` 여섯 파일 — 성공
33. `git commit -s -q -F .claude/cache/msg-s2-solve.txt` — 성공
34. `git log -1` — 성공
35. Edit 서빙 파일에서 aria-labelledby 지우기(일부러 넣는 잘못) — 성공
36. `pnpm pv:check toss` — 실패(기대한 실패, 위 출력)
37. `pnpm exec vitest run prototypes/preview-structure/components` — 실패(기대한 실패, 1 failed)
38. `git restore public/preview/toss/preview.html` — 성공
39. `git status --short` — 성공 (깨끗)
40. `git diff --numstat 68b82f54 186d5ced` — 성공

뜻하지 않은 실패 2(21 prettier, 24 Grep glob), 둘 다 내 실수. 기대한 실패 2(36, 37).

## 걸린 시간

vitest 가 찍은 값: 316ms(16), 706ms(30). 나머지는 재지 않음.

## 막히거나 헷갈린 곳

- 다크 이름표에도 id 를 달지 정해야 했다. 문제는 "이름표에 id" 만 말한다. `iframe.js` 가 template 안의 이름표로 바꿔 낀다는 것은 STANDARD 2절과 안내 2절에서 읽었고, 바꿔 낀 뒤 `aria-labelledby` 가 끊기지 않게 같은 id 를 달았다. `iframe.js` 는 열어 보지 않았다.
- `pv:where` 를 같이 고쳐야 하는지: 안내 7절 표와 그 아래 첫 항목이 "속성을 더하는 것은 괜찮다" 고 말해 `where.ts` 를 읽어 정규식이 뒤에 붙는 속성을 받는 것을 확인하고 고치지 않았다.
- 일부러 넣는 잘못을 어디에 넣을지: 칸 속성은 모듈에 없어서 서빙 파일을 고쳤다. 안내에는 이 경우가 따로 적혀 있지 않다.
- 열어 본 파일: `parts.ts`, `check.ts`, `where.ts`, `components.test.ts`, README(편집).
