# 이슈 트래커: GitHub

이 저장소의 이슈와 스펙은 GitHub 이슈(`CaesiumY/ko-design-md`)로 관리한다. 모든 조작은 `gh` CLI 로 한다.

## 컨벤션

- **이슈 생성**: `gh issue create --title "..." --body "..."`. 여러 줄 본문은 heredoc 으로 넘긴다 — `CLAUDE.md` 「기여 관례」의 인용 구분자 규칙을 따른다. 본문은 쉬운 말 요약 1~3줄로 시작한다(같은 「기여 관례」). 아래의 `Part of #<parent>`·`Blocked by:` 줄을 쓰면 그런 줄이 모두 맨 위에 오고, 요약은 그 줄들이 끝난 다음이다.
- **이슈 읽기**: `gh issue view <number> --json number,title,body,labels,comments`.
- **이슈 목록**: `gh issue list --state open --limit 1000 --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` 에 `--label`·`--state` 필터를 맞춰 붙인다. `--limit` 을 빼면 기본값 30건에서 **아무 표시 없이** 잘린다.
- **이슈를 부모의 서브이슈로 붙이기**: `gh issue create --parent <parent> ...`, 또는 만든 뒤 `gh issue edit <parent> --add-sub-issue <child>`(`gh` 2.94+). 그보다 낡은 `gh` 는 `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>`(아래 **블로킹**과 같은 database id). 서브이슈를 못 쓰면 자식 본문 맨 위에 `Part of #<parent>` 를 적는다.
- **코멘트**: `gh issue comment <number> --body "..."`
- **라벨 붙이기 / 떼기**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **닫기**: `gh issue close <number> --comment "..."`

저장소는 `git remote -v` 로 추론한다 — 클론 안에서 실행하면 `gh` 가 알아서 한다.

## PR 을 트리아지 대상으로 삼는가

**PRs as a request surface: no.** _(외부 PR 을 기능 요청으로 다룬다면 `yes` 로 바꾼다. `/triage` 가 이 플래그를 읽으므로 이 영어 문구는 그대로 둔다.)_

`yes` 일 때는 PR 도 이슈와 같은 라벨·상태로 돌리며 `gh pr` 대응 명령을 쓴다.

- **PR 읽기**: `gh pr view <number> --comments`, diff 는 `gh pr diff <number>`.
- **트리아지할 외부 PR 목록**: `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open&per_page=100' --jq '.[] | select(.user.type != "Bot") | select(.author_association | IN("CONTRIBUTOR", "FIRST_TIME_CONTRIBUTOR", "FIRST_TIMER", "NONE")) | {number, title, labels: [.labels[].name], author: .user.login, author_association}'` — `OWNER`/`MEMBER`/`COLLABORATOR` 는 뺀다. dependabot 같은 봇도 `CONTRIBUTOR` 로 잡히므로 `user.type` 으로 먼저 뺀다. `FIRST_TIMER`(GitHub 첫 기여)와 `FIRST_TIME_CONTRIBUTOR`(이 저장소 첫 기여)는 다른 값이라 둘 다 넣는다. `gh pr list --json` 에는 author association 필드가 **없어서** REST 의 `author_association` 을 쓴다. 본문·코멘트는 걸러낸 번호로 `gh pr view` 에서 읽는다.
- **코멘트 / 라벨 / 닫기**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub 은 이슈와 PR 이 번호 공간을 공유하므로 `#42` 만으로는 어느 쪽인지 모른다 — `gh pr view 42` 로 먼저 보고 안 되면 `gh issue view 42`.

## 포크에서 온 PR 의 CI 와 미리보기 배포

외부 기여자의 포크 PR 은 두 가지 승인 대기에 걸린다. 둘은 성격이 달라 다르게 다룬다.

- **GitHub Actions 는 실행 승인으로 돌린다.** 포크 PR 의 워크플로 실행은 메인테이너가 승인하기 전까지 `action_required` 로 멈춘다. 승인에는 비용이 들지 않고 기여자를 팀원으로 받을 필요도 없다. 포크의 head 브랜치 이름은 `gh pr view <PR 번호> --json headRefName` 으로 먼저 확인한다(`main` 같은 흔한 이름이면 다른 실행이 섞이므로 결과의 커밋을 PR 의 head 와 대조한다). 대기 중인 실행은 `gh run list --branch <그 이름> --status action_required --json databaseId,workflowName,headSha` 으로 찾고, `gh api -X POST repos/CaesiumY/ko-design-md/actions/runs/<databaseId>/approve` 로 하나씩 승인한다. 승인은 사용자가 그 PR 에 허락했을 때만 하고, 커밋이 새로 푸시되면 새 실행이 다시 대기에 걸리므로 그때마다 다시 승인한다.
- **Vercel 의 "Authorize Fork Deployment" 는 누르지 않는다.** 포크 코드를 팀 권한으로 빌드하는 승인이라 외부 PR 에는 주지 않는다. 미리보기 배포가 없으면 Vercel 체크가 실패로 남는다. main 에는 필수 검사 설정이 없어 머지는 막히지 않으니, 머지 판단은 Actions 의 `build`, `contrast`, `e2e`, `dco` 결과로 한다. 화면 확인은 PR 브랜치를 받아 로컬 개발 서버로 한다.

## 스킬이 "이슈 트래커에 발행하라" 고 할 때

GitHub 이슈를 만든다.

## 스킬이 "관련 티켓을 가져오라" 고 할 때

위 **이슈 읽기**대로 읽는다.

## 웨이파인딩 조작

`/wayfinder` 가 쓴다. **맵**은 이슈 하나이고 **자식** 이슈가 티켓이다.

`wayfinder:*` 라벨은 아직 이 저장소에 없다. 처음 쓸 때 `gh label create` 로 만들고 `.github/labels.json` 에도 반영한다(`CONTRIBUTING.md` §6).

- **맵**: `wayfinder:map` 라벨이 붙은 이슈 하나. 본문은 쉬운 말 요약 1~3줄로 시작하고, 그 아래에 Notes / Decisions-so-far / Fog 를 담는다. `gh issue create --label wayfinder:map`.
- **자식 티켓**: GitHub 서브이슈로 맵에 연결한 이슈(위 **이슈를 부모의 서브이슈로 붙이기** 참고). 서브이슈를 못 쓰면 맵 본문의 태스크 리스트에 넣고 자식 본문 맨 위에 `Part of #<map>` 을 적는다. 라벨은 `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). 집으면 그 티켓을 작업자에게 할당한다.
- **블로킹**: GitHub **네이티브 이슈 의존성** — UI 에 보이는 정본 표현이다. `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>` 로 간선을 추가한다. `<blocker-db-id>` 는 블로커의 숫자 **database id** 다(`gh api repos/<owner>/<repo>/issues/<n> --jq .id` — `#number` 도 `node_id` 도 _아니다_). GitHub 이 `issue_dependencies_summary.blocked_by`(열린 블로커만 — 실시간 게이트)를 보고한다. 의존성을 못 쓰면 자식 본문 맨 위의 `Blocked by: #<n>, #<n>` 줄로 대신한다. 블로커가 전부 닫히면 풀린다.
- **프런티어 조회**: 맵의 열린 자식을 나열하고(`gh issue list --state open`, 맵의 서브이슈 / 태스크 리스트로 한정) 열린 블로커가 있거나(`issue_dependencies_summary.blocked_by > 0`, 또는 `Blocked by` 줄의 열린 이슈) 담당자가 있는 것을 뺀다. 맵 순서상 첫 번째가 이긴다.
- **집기**: `gh issue edit <n> --add-assignee @me` — 세션의 첫 쓰기.
- **해소**: `gh issue comment <n> --body "<answer>"`, 이어서 `gh issue close <n>`, 그리고 맵의 Decisions-so-far 에 컨텍스트 포인터(요지 + 링크)를 덧붙인다.
