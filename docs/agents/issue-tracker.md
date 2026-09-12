# 이슈 트래커: GitHub

이 저장소의 이슈와 스펙은 GitHub 이슈(`CaesiumY/ko-design-md`)로 관리한다. 모든 조작은 `gh` CLI 로 한다.

## 컨벤션

- **이슈 생성**: `gh issue create --title "..." --body "..."`. 여러 줄 본문은 heredoc 으로 넘긴다 — `CLAUDE.md` 「기여 관례」의 인용 구분자 규칙을 따른다.
- **이슈 읽기**: `gh issue view <number> --comments` — 코멘트는 `jq` 로 거르고 라벨도 함께 가져온다.
- **이슈 목록**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` 에 `--label`·`--state` 필터를 맞춰 붙인다.
- **코멘트**: `gh issue comment <number> --body "..."`
- **라벨 붙이기 / 떼기**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **닫기**: `gh issue close <number> --comment "..."`

저장소는 `git remote -v` 로 추론한다 — 클론 안에서 실행하면 `gh` 가 알아서 한다.

## PR 을 트리아지 대상으로 삼는가

**PRs as a request surface: no.** _(외부 PR 을 기능 요청으로 다룬다면 `yes` 로 바꾼다. `/triage` 가 이 플래그를 읽으므로 이 영어 문구는 그대로 둔다.)_

`yes` 일 때는 PR 도 이슈와 같은 라벨·상태로 돌리며 `gh pr` 대응 명령을 쓴다.

- **PR 읽기**: `gh pr view <number> --comments`, diff 는 `gh pr diff <number>`.
- **트리아지할 외부 PR 목록**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments` 후 `authorAssociation` 이 `CONTRIBUTOR`·`FIRST_TIME_CONTRIBUTOR`·`NONE` 인 것만 남긴다(`OWNER`/`MEMBER`/`COLLABORATOR` 는 뺀다).
- **코멘트 / 라벨 / 닫기**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub 은 이슈와 PR 이 번호 공간을 공유하므로 `#42` 만으로는 어느 쪽인지 모른다 — `gh pr view 42` 로 먼저 보고 안 되면 `gh issue view 42`.

## 스킬이 "이슈 트래커에 발행하라" 고 할 때

GitHub 이슈를 만든다.

## 스킬이 "관련 티켓을 가져오라" 고 할 때

`gh issue view <number> --comments` 를 실행한다.

## 웨이파인딩 조작

`/wayfinder` 가 쓴다. **맵**은 이슈 하나이고 **자식** 이슈가 티켓이다.

`wayfinder:*` 라벨은 아직 이 저장소에 없다. 처음 쓸 때 `gh label create` 로 만들고 `.github/labels.json` 에도 반영한다(`CONTRIBUTING.md` §6).

- **맵**: `wayfinder:map` 라벨이 붙은 이슈 하나. 본문에 Notes / Decisions-so-far / Fog 를 담는다. `gh issue create --label wayfinder:map`.
- **자식 티켓**: GitHub 서브이슈로 맵에 연결한 이슈(서브이슈 엔드포인트에 `gh api`). 서브이슈를 못 쓰면 맵 본문의 태스크 리스트에 넣고 자식 본문 맨 위에 `Part of #<map>` 을 적는다. 라벨은 `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). 집으면 그 티켓을 작업자에게 할당한다.
- **블로킹**: GitHub **네이티브 이슈 의존성** — UI 에 보이는 정본 표현이다. `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>` 로 간선을 추가한다. `<blocker-db-id>` 는 블로커의 숫자 **database id** 다(`gh api repos/<owner>/<repo>/issues/<n> --jq .id` — `#number` 도 `node_id` 도 _아니다_). GitHub 이 `issue_dependencies_summary.blocked_by`(열린 블로커만 — 실시간 게이트)를 보고한다. 의존성을 못 쓰면 자식 본문 맨 위의 `Blocked by: #<n>, #<n>` 줄로 대신한다. 블로커가 전부 닫히면 풀린다.
- **프런티어 조회**: 맵의 열린 자식을 나열하고(`gh issue list --state open`, 맵의 서브이슈 / 태스크 리스트로 한정) 열린 블로커가 있거나(`issue_dependencies_summary.blocked_by > 0`, 또는 `Blocked by` 줄의 열린 이슈) 담당자가 있는 것을 뺀다. 맵 순서상 첫 번째가 이긴다.
- **집기**: `gh issue edit <n> --add-assignee @me` — 세션의 첫 쓰기.
- **해소**: `gh issue comment <n> --body "<answer>"`, 이어서 `gh issue close <n>`, 그리고 맵의 Decisions-so-far 에 컨텍스트 포인터(요지 + 링크)를 덧붙인다.
