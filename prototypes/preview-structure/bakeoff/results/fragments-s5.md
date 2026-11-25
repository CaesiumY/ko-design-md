# fragments, 문제 5 결과

가지 `eval/fragments-s5`, 시작 `2a077dca`, 풀이 커밋 `784f9702`.

## 시작 점검 (1절)

| 명령 | 결과 |
| --- | --- |
| `git status` | 성공. 깨끗함 |
| `git rev-parse HEAD` | 성공 |
| `git switch -c eval/fragments-s5 2a077dca` | 성공 |
| `pnpm install` | 성공. 스스로 찍은 시간 1m 18.7s |
| `pnpm previews:check` | 성공. chzzk, toss 위반 없음, 어긋남 없음 |
| `pnpm validate:previews --slug toss` | 성공. 0 blocking, 2 warn(bare-1fr, no-mobile-collapse. 손대기 전부터 있던 것) |
| `pnpm validate:previews --slug chzzk` | 성공. 0 blocking, 0 warn |

## 줄 번호 구하기

| 도구/명령 | 결과 |
| --- | --- |
| Grep `data-pv-zone="(buttons\|screens)"` (서빙 파일) | 성공. screens 1544줄, buttons 1765줄 |
| Read 서빙 파일 1765~1772줄 | 성공. buttons 첫 칸 `button-size` 의 이름표가 **1769줄** |
| Grep `pv-screen"\|<button` (서빙 파일, 앞 15개) | 성공. screens 첫 `.pv-screen` 이 1550줄, 그 뒤 첫 `<button>` 이 **1571줄** `<button class="qb">채우기</button>` (1535~1537 줄 버튼은 히어로 안이라 대상 아님) |

## 원본 찾기

| 명령 | 결과 |
| --- | --- |
| `pnpm previews:where toss 1769` | 성공. `preview-src/toss/zones/buttons.html:2` |
| `pnpm previews:where toss 1571` | 성공. `preview-src/toss/zones/screens.html:24` |
| Read `buttons.html` 1~4줄 | 성공. 2줄이 `button-size` 칸의 `<pv-label>` 줄(끝이 `S 32</pv-label>`) |
| Read `screens.html` 22~25줄 | 성공. 24줄이 `<button class="qb">채우기</button>`, `type` 없음 |

- 줄 번호에서 원본 위치까지: 지적 하나에 `previews:where` 명령 하나. 확인용 Read 하나씩. 합 4.
- 헛짚은 횟수: 0.

## 고치기

- Edit `buttons.html:2` 이름표 끝에 ` (가정)` 을 더함.
- Edit `screens.html:24` 버튼에 `type="button"` 을 더함(없었으므로 `aria-label` 은 달지 않음).

## 반영 확인

| 명령 | 결과 |
| --- | --- |
| `pnpm previews:build toss` | 성공 |
| `pnpm previews:check toss` | 성공. 위반 없음, 서빙 파일이 원본과 같음 |
| `pnpm validate:previews --slug toss` | 성공. 0 blocking, 2 warn(시작 때와 같음) |
| `git diff --stat` | 성공. 3 파일, +4 −4 |
| Grep 서빙 파일 | 성공. 1571줄 `<button class="qb" type="button">채우기</button>`, 1769줄 `… S 32 (가정)</p>` |

- 고친 뒤 확인까지의 명령: 4(build, check, validate:previews, Grep). 줄 번호는 바뀌지 않았다.
- 걸린 시간: 재지 않음(명령이 찍지 않음).

## 명령 수와 실패

- 이 문제에서 돌린 명령과 도구 호출(시작 점검 빼고, 커밋 빼고): Grep 3, Read 3, `previews:where` 2, Edit 2, build 1, check 1, validate 1, git diff 1 = 14.
- 실패: 0.

## 파일 수와 줄 수 (`git diff --stat 2a077dca 784f9702`)

| 갈래 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 손으로 고친 원본 | 2 (`preview-src/toss/zones/buttons.html`, `screens.html`) | 2 | 2 |
| 명령이 만든 산출물 | 1 (`public/preview/toss/preview.html`) | 2 | 2 |
| 안내 문서와 테스트 | 0 | 0 | 0 |

## 막히거나 헷갈린 곳

- 없음. 서빙 줄 번호를 구할 때 "첫 `.pv-screen` 안의 첫 `<button>`" 을 고르느라 Grep 결과에서 히어로의 버튼(1535~1537)을 빼고 1550줄 뒤를 골랐다. 열어 본 파일: 서빙 파일, 원본 두 개(안내 README 와 SCENARIOS, STANDARD 는 시작 때 읽음).
