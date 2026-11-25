# html-frame 문제 5 결과

- 가지: `eval/html-frame-s5` (`0ef2f879` 에서 침)
- 풀이 커밋: `d7877d0f`

## 구한 줄 번호와 고친 곳

| 지적 | 서빙 파일의 줄 | 고친 원본의 위치 |
| --- | --- | --- |
| 1. 버튼 구역 첫 칸 이름표 끝에 `(가정)` | `public/preview/toss/preview.html:1682` (`<p class="pv-label">SIZE · XL 56 / L 48 / M 40 / S 32</p>`) | 같은 파일 같은 줄. 글 끝에 ` (가정)` 을 더함 |
| 2. 화면 구역 첫 `.pv-screen` 안의 첫 `<button>` | `public/preview/toss/preview.html:1484` (`<button class="qb">채우기</button>`, `type` 없음) | 같은 파일 같은 줄. `type="button"` 을 더함 |

- 줄 번호에서 원본 위치를 찾기까지 든 명령: 0개. 안내 5절이 "줄 번호는 서빙되는 파일의 줄 번호이고, 그 파일이 원본이다"라고 말해서 줄 번호를 구한 그 파일을 바로 고쳤다.
- 줄 번호를 구하는 데 든 명령: 3개(Grep 1회로 `data-pv-zone="screens"`, `"buttons"`, `class="pv-screen"` 의 줄을 찾고, Read 2회로 두 구역의 첫 부분을 읽음).
- 헛짚은 횟수: 0.
- 고친 뒤 서빙되는 HTML 에 반영됐는지 확인하는 데 든 명령: 1개(Grep 으로 1484, 1682 줄을 다시 봄). 빌드가 없어 고친 파일이 곧 서빙 파일이다.

## "풀었다" 조건

1. 서빙되는 `public/preview/toss/preview.html` 이 두 지적을 반영한다: 예(1484, 1682 줄).
2. 약속 검사 `check-frame.ts toss chzzk` 는 둘 다 `ok`, `pnpm validate:previews --slug toss` 는 `PASSED`(0 blocking, 경고 2개는 고치기 전과 같은 `bare-1fr`, `no-mobile-collapse`).
3. 원본과 산출물이 따로 없는 구조라 어긋남 검사가 없다(해당 없음).

## 파일 수와 줄 수 (`git diff --stat 0ef2f879 d7877d0f`)

| 나눔 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 손으로 고친 원본 | 1 (`public/preview/toss/preview.html`) | 2 | 2 |
| 명령이 만든 산출물 | 0 | 0 | 0 |
| 안내 문서와 테스트 | 0 | 0 | 0 |

## 명령 기록

시작 단계(1절)를 포함한다. 시작 단계는 이 가지에서 했다.

| # | 명령 | 결과 |
| --- | --- | --- |
| 1 | `git status` | 성공 |
| 2 | `git rev-parse HEAD` | 성공 |
| 3 | `git switch -c eval/html-frame-s5 0ef2f879` | 성공 |
| 4 | `pnpm install` | 성공(pnpm 이 `Done in 1m 14.8s` 라고 찍음) |
| 5 | `pnpm exec tsx prototypes/preview-structure/html-frame/check-frame.ts toss chzzk` | 성공(둘 다 ok) |
| 6 | `pnpm validate:previews --slug toss` | 성공(PASSED, 경고 2) |
| 7 | `pnpm validate:previews --slug chzzk` | 성공(PASSED) |
| 8 | Grep `data-pv-zone="(buttons|screens)"|class="pv-screen"` (toss) | 성공 |
| 9 | Read toss 1457~1546 줄 | 성공 |
| 10 | Read toss 1678~1689 줄 | 성공 |
| 11 | Edit 1682 줄(이름표 끝에 `(가정)`) | 성공 |
| 12 | Edit 1484 줄(`type="button"`) | 성공 |
| 13 | Grep 고친 두 줄 확인 | 성공 |
| 14 | `check-frame.ts toss chzzk` | 성공(둘 다 ok) |
| 15 | `pnpm validate:previews --slug toss` | 성공(PASSED, 경고 2) |
| 16 | Write 커밋 메시지 파일 | 성공 |
| 17 | `git add public/preview/toss/preview.html` | 성공 |
| 18 | `git commit -s -q -F .claude/cache/eval-msg-s5-fix.txt` | 성공 |
| 19 | `git diff --stat 0ef2f879 HEAD` | 성공 |
| 20 | `git rev-parse --short HEAD` | 성공 |

- 명령 수 20, 실패 0.
- 고치고 나서 확인이 끝날 때까지 돌린 명령: 13~15(Grep, 약속 검사, 프리뷰 검증기). 걸린 시간: 재지 않음(명령이 시간을 찍지 않았다).

## 막히거나 헷갈린 곳

- 지적 1의 "이름표 끝에 `(가정)` 표지"를 어떤 꼴로 붙일지. 같은 파일의 다른 이름표들은 `, 치수 (가정)` 꼴이다(1768, 1784 줄 등). 지적이 `(가정)` 표지만 말해서 ` (가정)` 만 더했다. 본 파일: toss preview.html 하나. 답을 얻은 곳: 지적 문장.
- 지적 2의 첫 `<button>` 이 다크 template 안에 사본이 있는지 확인했다. 1464~1533 줄의 첫 화면에는 `qb` 버튼의 template 사본이 없었다(template 은 1471 줄의 종 아이콘 하나뿐).
