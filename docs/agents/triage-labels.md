# 트리아지 라벨

스킬들은 다섯 가지 정규 트리아지 역할로 말한다. 이 파일은 그 역할을 이 저장소 이슈 트래커의 실제 라벨 문자열에 대응시킨다.

| mattpocock/skills 의 라벨 | 이 저장소의 라벨 | 의미 |
| --- | --- | --- |
| `needs-triage` | `needs-triage` | 메인테이너가 평가해야 함 |
| `needs-info` | `needs-info` | 제보자의 추가 정보를 기다리는 중 |
| `ready-for-agent` | `ready-for-agent` | 명세가 끝나 AFK 에이전트가 바로 집을 수 있음 |
| `ready-for-human` | `ready-for-human` | 사람이 구현해야 함 |
| `wontfix` | `wontfix` | 조치하지 않음 |

스킬이 역할을 언급하면(예: "AFK 준비 트리아지 라벨을 붙여라") 이 표의 해당 라벨 문자열을 쓴다.

실제로 쓰는 어휘가 다르면 오른쪽 열을 고친다.

## 이 저장소의 사정

다섯 개 모두 GitHub 에 있고, `.github/labels.json` 이 그 스냅샷이다. `wontfix` 는 원래 있었고 나머지 넷은 이 설정을 들이며 만들었다. 라벨을 추가·개명·삭제하면 GitHub 과 `labels.json` 을 함께 고친다 — `CONTRIBUTING.md` §6 과 `src/lib/issue-template-labels.test.ts` 가 그 규칙이다.
