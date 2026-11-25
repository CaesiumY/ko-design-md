# 구조 겨루기의 근거 묶음

> PROTOTYPE. 성적표(`../SCORECARD.md`)가 기대는 기록을 한곳에 모은 폴더다. 본 브랜치에는 들이지 않는다.

성적표의 수와 문장이 어디서 왔는지 따라가 볼 수 있게, 푼 쪽과 평가하는 쪽이 받은 지시, 다시 잰 값, 푼 쪽의 기록, 두 평가의 원문, 재는 데 쓴 스크립트를 그대로 둔다.

## 무엇이 들어 있나

| 경로 | 내용 |
| --- | --- |
| `MEASURED.md` | 문제를 푼 가지에서 git 과 명령으로 다시 잰 값. 성적표의 표는 여기서 옮겼다 |
| `solver-records.md` | 푼 쪽의 기록 열여덟 개를 표로 옮긴 것(실패 수와 종류, 푼 쪽이 센 명령 수) |
| `results/` | 푼 쪽의 기록 열여덟 개. 가지마다 `prototypes/preview-structure/results/` 에 커밋된 파일의 사본이다 |
| `evaluations/` | 독립 평가 둘의 원문(`maintainer.md` 는 유지보수하는 사람의 눈, `author.md` 는 새 항목을 쓰는 에이전트의 눈) |
| `briefs/` | 푼 쪽 아홉이 받은 지시(`solver-common.md`, 문제 4 는 `solver-s4.md` 도)와 평가 둘이 받은 지시(`evaluator-common.md`) |
| `tools/` | 재는 데 쓴 스크립트 |

## 평가가 가리키는 파일을 찾는 법

두 평가는 평가 묶음 안의 경로와 줄 번호로 근거를 적었다. 묶음은 이 폴더의 파일과 구조별 브랜치의 파일로 이루어져 있다.

| 평가가 적은 이름 | 있는 곳 |
| --- | --- |
| `MEASURED 40` 처럼 줄 번호가 붙은 것 | 이 폴더의 `MEASURED.md` 의 그 줄 |
| `html-frame-s2.md 17` 같은 것 | 이 폴더의 `results/` 의 그 파일, 그 줄 |
| `html-frame/README.md`, `html-frame/STATS.md` | 브랜치 `proto/preview-structure-html-frame`(`0ef2f879`)의 `prototypes/preview-structure/html-frame/` |
| `fragments/README.md`, `fragments/STATS.md` | 브랜치 `proto/preview-structure-fragments`(`2a077dca`)의 `prototypes/preview-structure/fragments/` |
| `components/README.md`, `components/STATS.md` | 브랜치 `proto/preview-structure-components`(`68b82f54`)의 `prototypes/preview-structure/components/` |
| `custom-tags/README.md`, `custom-tags/STATS.md` | 브랜치 `proto/preview-structure-custom-tags`(`46ccd564`)의 `prototypes/preview-structure/custom-tags/` |

## 묶음과 이 폴더가 다른 곳

평가가 읽은 묶음과 글자가 다른 곳은 넷이다. 줄 수는 바뀌지 않아서 평가가 적은 줄 번호는 그대로 맞는다.

- `MEASURED.md` 4줄 끝에 "이 문서의 수는 … 에서 잰 기록이다" 한 문장을 더했다.
- `MEASURED.md` 의 경로 두 곳(54줄, 155줄)을 이 폴더에서 맞는 경로로 고쳤다.
- `results/components-s3.md` 33줄의 스크립트 경로를 `<임시 폴더>/swap-zones.mjs` 로 가렸다. 가지 `eval/components-s3` 에 커밋된 원본에는 푼 쪽 PC 의 절대 경로가 그대로 있다.
- 묶음에는 풀이의 diff(`patches/`)와 구조별 안내의 사본이 더 있었다. 가지와 브랜치에서 다시 만들 수 있어 여기에는 넣지 않았다(`tools/packet.cjs`).

## 스크립트

모두 저장소 루트에서 `node prototypes/preview-structure/bakeoff/tools/<파일>` 로 돌린다. 인자는 파일 머리의 주석에 있다.

| 파일 | 하는 일 |
| --- | --- |
| `diffstat.cjs` | 가지의 `git diff --numstat` 을 파일의 역할(원본, 공용, 산출물, 안내, 테스트)로 나눠 센다 |
| `static-check.cjs` | 가지의 서빙 파일을 `git show` 로 읽어 요구가 들어갔는지 센다(칸 수, 속성, 구역 순서) |
| `verify-branch.cjs` | 가지를 체크아웃한 작업 폴더에서 약속 검사, 기존 검증기, 테스트를 돌리고 시간을 잰다. 일부러 넣는 잘못 둘도 여기 있다 |
| `summarize-verify.cjs` | `verify-branch.cjs` 가 낸 JSON 을 표로 모은다 |
| `packet.cjs` | 평가 묶음(안내의 사본, 풀이의 diff)을 가지에서 뽑아 만든다 |

`verify-branch.cjs` 가 낸 JSON 원본은 PC 의 절대 경로가 들어 있어 넣지 않았다. 값은 `MEASURED.md` 3절과 4절에 옮겨 있다.
