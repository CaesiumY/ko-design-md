# AGENTS.md

이 저장소의 에이전트 지침 정본은 [`CLAUDE.md`](./CLAUDE.md) 다. 작업을 시작하기 전에 그 파일을 끝까지 읽는다 —
검증 커맨드·카탈로그 정책·기여 관례가 모두 거기 있다. 이 파일은 `CLAUDE.md` 를 읽지 않는 에이전트(Codex 등)를
위한 포인터일 뿐이므로 규칙을 여기에 옮겨 적지 말 것. 같은 규칙이 두 곳에 적히면 어긋난다.

- 이슈 트래커·트리아지 라벨·도메인 문서의 위치는 `CLAUDE.md` 의 `## Agent skills` 절과 [`docs/agents/`](./docs/agents/) 에 있다.
- 용어는 [`GLOSSARY.md`](./GLOSSARY.md), 결정은 [`docs/adr/`](./docs/adr/) 다.
- `CLAUDE.md` 가 부르는 저장소 스킬(`/design-md` 등)과 서브에이전트는 Claude Code 용이다(정의는 `.claude/skills/`·
  `.claude/agents/`). 검증 게이트는 하네스와 무관하게 `CLAUDE.md` 의 `pnpm` 커맨드 그대로 돈다.
