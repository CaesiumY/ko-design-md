# html-frame 문제 3 결과

- 가지: `eval/html-frame-s3` (`0ef2f879` 에서 침)
- 풀이 커밋: `0e27240f`

## 한 일

1. 구역 목록: `prototypes/preview-structure/html-frame/check-frame.ts` 의 `ZONES` 한 곳을 고쳤다. `["selection", "선택"]` 줄을 `["inputs", "입력"]` 위로 옮기고, `["content", "콘텐츠"]` 다음에 `["tables", "표"]` 한 줄을 끼웠다. 새 순서는 screens, buttons, selection, inputs, navigation, content, tables, feedback, brand.
2. 토스(`public/preview/toss/preview.html`): 선택 구역 `<section>` 통째(1844~1935줄, 뒤의 빈 줄 포함 93줄)를 입력 구역(1742줄) 앞으로 옮겼다. 줄 범위를 옮기는 작은 스크립트(임시 폴더의 `move-lines.mjs`, 저장소 밖)로 했다. 토스에는 표 구역에 넣을 칸이 없어 표 구역을 두지 않았다(필수가 아니다).
3. 치지직(`public/preview/chzzk/preview.html`): 선택 구역이 없어 순서는 그대로다. 콘텐츠 구역의 마지막 칸 `channel-head`(744줄)를 새 표 구역으로 옮겼다. 칸 바로 앞에서 콘텐츠 구역을 닫고 `<section class="pv-zone" data-pv-zone="tables" aria-labelledby="pv-tables">`, `<h2 class="pv-zone-title" id="pv-tables">표</h2>`, `<div class="pv-cells">` 를 여는 Edit 한 번으로 했다. 칸 뒤의 닫는 태그는 원래 콘텐츠 구역의 것이 그대로 표 구역을 닫는다. 표 구역은 콘텐츠와 피드백 사이에 놓인다.
4. 안내 `README.md`: 3절의 구역 표(`ZONES` 의 사본)를 새 순서로 고치고, 5절의 예시 메시지가 옛 순서("inputs 가 selection 뒤")를 말하던 것을 새 순서로 고쳤다.
5. `check-frame.test.ts`: 「모르는 구역」 테스트가 `tables` 를 모르는 구역의 예로 쓰고 있어 `charts` 로 바꿨다. 새 순서(선택이 입력 앞, 표가 콘텐츠와 피드백 사이)를 통과시키고 어긴 순서를 잡는 테스트 하나를 더했다. 14개에서 15개가 됐다.

## 구역 목록을 고친 곳의 수

- 이 구조의 구역 목록: 1곳(`check-frame.ts` 의 `ZONES`). 틀 스타일 `frame.css` 는 구역 식별자를 몰라 고치지 않았다.
- 사본: `README.md` 3절의 표 1곳과 5절의 예시 메시지 1곳(안내가 "표는 ZONES 의 사본"이라 말해서 고쳤다).
- 저장소 전체를 Grep 으로 찾으면 구역 목록이 `prototypes/preview-structure/base-notes/check-base.ts` 와 `base-notes/toss-rezone.mjs` 에도 있다. 고치지 않는 파일이고, 안내 8절이 이 구조에서 돌리지 않는다고 말한다.

## 항목마다 고친 줄 수 (`git diff --numstat 0ef2f879 0e27240f`)

| 나눔 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 원본(프리뷰) | `public/preview/toss/preview.html`(스크립트로 93줄 옮김) | 93 | 93 |
| 원본(프리뷰) | `public/preview/chzzk/preview.html`(손, Edit 1번) | 5 | 0 |
| 명령이 만든 산출물 | 0 | 0 | 0 |
| 약속 검사 | `check-frame.ts`(손) | 2 | 1 |
| 안내 문서와 테스트 | `README.md` 7/6, `check-frame.test.ts` 18/2(손) | 25 | 8 |

합계 5파일, 125줄 더함, 102줄 뺌.

## 일부러 넣은 잘못과 약속 검사

풀이 커밋 뒤, 토스의 선택 구역(1742~1834줄)을 내비게이션 구역 앞, 곧 입력 구역 뒤로 옮겨(옛 순서) `check-frame.ts toss` 를 돌렸다. 출력(exit 1):

```
FAIL  public/preview/toss/preview.html — 1 problem(s)
public/preview/toss/preview.html:1844  [zone-order] 구역 "selection" 가 구역 "inputs" 뒤에 있다
    고치는 법: "selection" 구역(<section> 통째)을 "inputs" 구역 앞으로 옮긴다. 순서는 screens, buttons, selection, inputs, navigation, content, tables, feedback, brand
```

- 틀린 순서를 잡았다: 예. 1844줄은 뒤로 밀린 선택 구역의 `<section>` 줄이다.
- 그 뒤 `git restore public/preview/toss/preview.html` 로 되돌렸다. 잘못은 커밋하지 않았다.

## "풀었다" 조건

1. 서빙되는 두 프리뷰가 새 순서를 따른다: 예. 토스는 screens, buttons, selection, inputs, navigation, content, feedback. 치지직은 screens, buttons, inputs, navigation, content, tables, feedback 이고 `channel-head` 칸이 표 구역에 있다.
2. 약속 검사 `check-frame.ts toss chzzk prototypes/preview-structure/html-frame/skeleton.html` 셋 다 `ok`. `pnpm validate:previews` 토스 `PASSED`(경고 2개는 고치기 전과 같음), 치지직 `PASSED`. 약속 검사 테스트 15개 통과.
3. 원본과 산출물이 따로 없는 구조라 어긋남 검사가 없다(해당 없음).

## 명령 기록

| # | 명령 | 결과 |
| --- | --- | --- |
| 1 | `git switch -c eval/html-frame-s3 0ef2f879` | 성공 |
| 2 | Grep chzzk 의 구역과 칸 줄 | 성공 |
| 3 | Grep toss 의 구역과 `</section>` 줄 | 성공 |
| 4~7 | Read toss 1739~1745, 1840~1846, 1932~1938 줄, chzzk 740~789 줄 | 성공 |
| 8 | Edit chzzk(콘텐츠 구역을 닫고 표 구역을 연다) | 성공 |
| 9 | Write 줄 옮기기 스크립트(임시 폴더) | 성공 |
| 10 | `node <임시 폴더>/move-lines.mjs <toss> 1844 1936 1742` | 성공(93줄) |
| 11 | Grep toss 의 구역 줄(옮긴 결과 확인) | 성공 |
| 12 | Edit `check-frame.ts` 의 `ZONES` | 성공 |
| 13 | Edit `README.md` 구역 표 | 성공 |
| 14 | Grep html-frame 폴더의 `screens, buttons|tables|selection` | 성공(예시 메시지와 테스트의 `tables` 를 찾음) |
| 15 | Read `README.md` 192~197 줄 | 성공 |
| 16 | Edit `README.md` 예시 메시지 | 성공 |
| 17 | Edit `check-frame.test.ts`(모르는 구역 예를 `charts` 로, 새 순서 테스트 하나) | 성공 |
| 18 | `pnpm exec vitest run prototypes/preview-structure/html-frame` | 성공(15 passed, `Duration 1.63s`. 뒤의 `ReferenceError: module is not defined`, `close timed out after 10000ms` 는 결과에 영향 없음) |
| 19 | `check-frame.ts toss chzzk prototypes/preview-structure/html-frame/skeleton.html` | 성공(셋 다 ok) |
| 20 | `pnpm validate:previews --slug toss` | 성공(PASSED, 경고 2) |
| 21 | `pnpm validate:previews --slug chzzk` | 성공(PASSED) |
| 22 | `pnpm exec prettier --check check-frame.ts check-frame.test.ts` | 성공 |
| 23 | Grep 저장소 전체에서 구역 목록이 있는 파일 | 성공(3파일) |
| 24 | Write 커밋 메시지 파일 | 성공 |
| 25 | `git add -A public/preview prototypes/preview-structure/html-frame` | 성공 |
| 26 | `git commit -s -q -F .claude/cache/eval-msg-s3-fix.txt` | 성공 |
| 27 | `git diff --numstat 0ef2f879 HEAD` | 성공 |
| 28 | `git rev-parse --short HEAD` | 성공 |
| 29 | `node <임시 폴더>/move-lines.mjs <toss> 1742 1834 1937`(일부러 넣는 잘못) | 성공 |
| 30 | `check-frame.ts toss` | 기대한 실패(exit 1, `[zone-order] 구역 "selection" 가 구역 "inputs" 뒤에 있다`) |
| 31 | `git restore public/preview/toss/preview.html` | 성공 |
| 32 | `git status --short` | 성공(깨끗함) |

- 명령 수 32, 뜻하지 않은 실패 0(30번은 일부러 낸 실패).
- 고치고 나서 확인이 끝날 때까지 돌린 명령: 18~23. 걸린 시간: vitest 가 찍은 `Duration 1.63s` 말고는 재지 않음.

## 막히거나 헷갈린 곳

- 치지직의 어느 칸을 표 구역으로 옮길지. 문제가 "칸 하나를 골라"라고만 해서, 콘텐츠 구역의 마지막 칸 `channel-head` 를 골랐다. 마지막 칸이라 칸 앞에서 구역을 나누면 칸을 옮기지 않고 끝났다. 이 칸이 쓰임으로 표인지는 판단하지 않았다(문제가 옮기라고 했다).
- 안내 6절 「구역을 더하거나 순서를 바꾼다」가 고칠 곳(`ZONES`, 항목 파일의 `<section>`, README 3절 표)과 확인 방법을 말해서 그대로 따랐다. 안내가 말하지 않은 것 둘을 더 고쳤다: 5절의 예시 메시지(옛 순서를 말했다)와 테스트의 「모르는 구역」 예(`tables` 를 썼다). 둘 다 Grep(명령 14)으로 찾았다. 테스트는 고치지 않았으면 `tables` 가 아는 구역이 되어 실패했을 것이다(돌려 보지는 않았다).
- 문제 2에서 더한 칸 약속(`cell-group`)은 이 가지에 없다. 이 가지는 `0ef2f879` 에서 새로 쳤다.
