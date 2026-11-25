# html-frame 문제 2 결과

- 가지: `eval/html-frame-s2` (`0ef2f879` 에서 침)
- 풀이 커밋: `e9fac160`

## 한 일

1. 모든 칸 `<div class="pv-cell" …>` 에 `role="group"` 과 `aria-labelledby="pv-label-{칸 이름}"` 을 달고, 칸의 이름표 `<p class="pv-label">` 에 `id="pv-label-{칸 이름}"` 을 달았다.
   이름표 바로 뒤에 다크 template 이 있는 칸은 template 안의 이름표에도 같은 `id` 를 달았다. 공용 `iframe.js` 가 다크에서 이름표 노드를 template 의 내용으로 통째로 바꿔 끼기 때문이다(`iframe.js` 107~114줄을 읽고 정함).
2. 바꾼 칸: 토스 41칸(이름표 41), 치지직 14칸(이름표 18, 다크 template 안의 이름표 4 포함), 뼈대 `skeleton.html` 3칸(이름표 4). 뼈대는 약속 검사 테스트가 통과를 요구해서 함께 바꿨다.
3. 약속 검사 `check-frame.ts` 의 `checkCell` 에 새 코드 `cell-group` 을 더했다. 칸의 `role="group"`, 칸의 `aria-labelledby` 값, 이름표의 `id`, 다크 이름표의 `id` 를 본다. 칸에 관한 지적은 칸의 줄, 이름표의 `id` 지적은 이름표의 줄, 다크 이름표의 지적은 template 의 줄을 가리킨다. 머리 주석에 약속 한 줄을 더했다.
4. `check-frame.test.ts`: 도움 함수 `cell()` 과 고정 칸들에 새 속성을 넣고, 테스트 4개를 더했다(aria-labelledby 없음, role 없음과 틀린 aria-labelledby, 이름표 id 없음, 다크 이름표 id 없음). 14개에서 18개가 됐다.
5. 안내 `README.md` 3절의 칸 조각 둘, 칸 규칙 한 줄, 5절의 코드 표 한 줄을 고쳤다.

## 손으로 고친 곳과 스크립트로 고친 곳

- 스크립트: 세 HTML 파일(토스, 치지직, 뼈대)의 모든 칸과 이름표. 스크립트는 임시 폴더의 `s2-add-group.mjs`(저장소 밖, 커밋하지 않음). jsdom 의 노드 위치로 각 시작 태그의 `>` 자리를 찾아 속성을 끼운다. 칸의 첫 자식이 `p.pv-label` 이 아니거나 이미 `role` 이 있으면 멈추게 했다. 한 번 돌려 바로 됐다.
- 손: `check-frame.ts`, `check-frame.test.ts`, `README.md`.

## 일부러 넣은 잘못과 약속 검사

토스의 `button-size` 칸(1681줄)에서 `aria-labelledby="pv-label-button-size"` 를 지운 뒤 `check-frame.ts toss` 를 돌렸다. 출력(exit 1):

```
FAIL  public/preview/toss/preview.html — 1 problem(s)
public/preview/toss/preview.html:1681  [cell-group] 칸 "button-size" 에 aria-labelledby 가 없다
    고치는 법: 이 줄의 <div class="pv-cell" …> 에 aria-labelledby="pv-label-button-size" 를 단다
```

- 빠뜨린 칸을 잡았다: 예.
- 메시지가 고칠 곳을 가리킨다: 예. 1681줄은 지운 그 칸의 시작 태그 줄이고, 고치는 법에 달 속성의 글자가 그대로 있다.
- 그 뒤 `git restore public/preview/toss/preview.html` 로 되돌렸다. 잘못은 커밋하지 않았다.

## "풀었다" 조건

1. 서빙되는 두 프리뷰의 모든 칸이 바뀌었다: 예(토스 41칸, 치지직 14칸). 고친 뒤 새 약속을 요구하는 약속 검사가 둘 다 `ok` 로 통과해 빠진 칸이 없음을 확인했다.
2. 약속 검사 `check-frame.ts toss chzzk prototypes/preview-structure/html-frame/skeleton.html` 셋 다 `ok`. `pnpm validate:previews` 토스 `PASSED`(경고 2개는 고치기 전과 같음), 치지직 `PASSED`. 약속 검사 테스트 18개 통과.
3. 원본과 산출물이 따로 없는 구조라 어긋남 검사가 없다(해당 없음).

## 파일 수와 줄 수 (`git diff --numstat 0ef2f879 e9fac160`)

| 나눔 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 원본(프리뷰, 스크립트로 고침) | 2: `public/preview/toss/preview.html` 82/82, `public/preview/chzzk/preview.html` 32/32 | 114 | 114 |
| 명령이 만든 산출물 | 0 | 0 | 0 |
| 안내 문서와 테스트, 약속 검사 | 4: `README.md` 7/5, `check-frame.test.ts` 73/7, `check-frame.ts` 36/0(손), `skeleton.html` 7/7(스크립트) | 123 | 19 |

합계 6파일, 237줄 더함, 133줄 뺌. 손으로 고친 줄은 `README.md`, `check-frame.test.ts`, `check-frame.ts` 의 116줄 더함, 12줄 뺌이다.

## 명령 기록

| # | 명령 | 결과 |
| --- | --- | --- |
| 1 | `git switch -c eval/html-frame-s2 0ef2f879` | 성공 |
| 2 | Read `check-frame.ts` | 성공 |
| 3 | Read `check-frame.test.ts` | 성공 |
| 4 | Grep `class="pv-cell[^"]*"` 수 세기 | 성공(`pv-cells` 도 함께 셌다: chzzk 20, toss 48) |
| 5 | Grep `class="pv-label"` 수 세기 | 성공(chzzk 18, toss 41) |
| 6 | Grep 칸 시작 태그의 꼴 수 세기 | 성공(chzzk 14, toss 41) |
| 7 | Grep `iframe.js` 의 template 바꿔 끼기 | 성공 |
| 8 | Write 변환 스크립트(임시 폴더) | 성공 |
| 9 | `node <임시 폴더>/s2-add-group.mjs <toss> <chzzk> <skeleton>` | 성공(toss 41/41, chzzk 14/18, skeleton 3/4) |
| 10 | `git diff --stat` | 성공 |
| 11 | Grep chzzk 의 `pv-label-` 몇 줄 | 성공 |
| 12 | Edit `check-frame.ts` 에 `cell-group` | 성공 |
| 13 | Edit `check-frame.ts` 머리 주석 | 성공 |
| 14~17 | Edit `check-frame.test.ts` 기존 칸 넷 | 성공 |
| 18 | Edit `check-frame.test.ts` 새 테스트 넷 | 성공 |
| 19 | `pnpm exec vitest run prototypes/preview-structure/html-frame` | 성공(18 passed, `Duration 3.03s`. 뒤의 `ReferenceError: module is not defined`, `close timed out after 10000ms` 는 결과에 영향 없음) |
| 20 | `check-frame.ts toss chzzk prototypes/preview-structure/html-frame/skeleton.html` | 성공(셋 다 ok) |
| 21 | `pnpm validate:previews --slug toss` | 성공(PASSED, 경고 2) |
| 22 | `pnpm validate:previews --slug chzzk` | 성공(PASSED) |
| 23~25 | Edit `README.md` 세 곳 | 성공 |
| 26 | `pnpm exec prettier --check check-frame.ts check-frame.test.ts` | 성공 |
| 27 | Write 커밋 메시지 파일 | 성공 |
| 28 | `git add -A public/preview prototypes/preview-structure/html-frame` | 성공 |
| 29 | `git commit -s -q -F .claude/cache/eval-msg-s2-fix.txt` | 성공 |
| 30 | `git diff --stat 0ef2f879 HEAD` | 성공 |
| 31 | `git rev-parse --short HEAD` | 성공 |
| 32 | Grep `data-pv-cell="button-size"` (toss) | 성공(1681줄) |
| 33 | Edit 토스 1681줄의 `aria-labelledby` 지움(일부러 넣는 잘못) | 성공 |
| 34 | `check-frame.ts toss` | 기대한 실패(exit 1, `[cell-group] 칸 "button-size" 에 aria-labelledby 가 없다`) |
| 35 | `git restore public/preview/toss/preview.html` | 성공 |
| 36 | `git status --short` | 성공(깨끗함) |
| 37 | `git diff --numstat 0ef2f879 e9fac160` | 성공 |

- 명령 수 37, 뜻하지 않은 실패 0(34번은 일부러 낸 실패).
- 고치고 나서 확인이 끝날 때까지 돌린 명령: 19~22, 26. 걸린 시간: vitest 가 찍은 `Duration 3.03s` 말고는 재지 않음.

## 막히거나 헷갈린 곳

- 다크 template 안의 이름표에도 `id` 를 달지. 문제 문장은 "이름표에는 그 id 를 단다"만 말한다. 안내 3절은 template 이 "바로 앞 형제 노드를 다크에서 template 의 내용으로 바꿔 낀다"고 말해서, 바꿔 낀 이름표에 `id` 가 없으면 다크에서 `aria-labelledby` 가 가리킬 것이 없어진다고 보고 달았다. `iframe.js` 를 열어 `importNode` 로 노드를 통째로 바꾸는 것을 확인했다. 연 파일: `iframe.js` 1개(Grep).
- 이름표의 한 조각만 다크에서 다른 칸(토스 1768줄 등)은 template 이 이름표 안에 있어서 이름표 노드는 그대로다. 그래서 `id` 는 바깥 `<p>` 하나에만 달면 된다. 안내 3절의 설명으로 알았다.
- 안내 6절 「틀의 태그를 바꾼다」가 "항목 파일마다 고친다, 칸이 많으면 스크립트로", "새 약속은 `checkCell` 에, 테스트는 `check-frame.test.ts` 에"라고 말해서 고칠 곳을 바로 찾았다. 스크립트는 안내가 주지 않아 직접 썼다.
- 뼈대 `skeleton.html` 도 고쳐야 하는 것은 테스트 「passes the skeleton a new entry starts from」을 읽고 알았다. 안내 6절은 뼈대를 함께 고치라고 말하지 않는다.
