# AGENTS.md

이 저장소의 에이전트 지침 정본은 [`CLAUDE.md`](./CLAUDE.md) 와 [`.claude/rules/`](./.claude/rules/) 의 경로별 규칙 파일이다.
작업을 시작하기 전에 `CLAUDE.md` 를 끝까지 읽고, 그 「규칙이 사는 곳」 표에서 작업 파일에 맞는 규칙 파일도 읽는다 —
Claude Code 는 각 파일의 `paths:` 에 맞는 파일을 다룰 때 그것을 자동으로 읽지만, 다른 에이전트(Codex 등)는 그렇지
않다. 이 파일은 그런 에이전트를 위한 포인터일 뿐이므로 규칙을 여기에 옮겨 적지 말 것. 같은 규칙이 두 곳에 적히면 어긋난다.

- 이슈 트래커·트리아지 라벨·도메인 문서의 위치는 `CLAUDE.md` 의 `## Agent skills` 절과 [`docs/agents/`](./docs/agents/) 에 있다.
- 용어는 [`GLOSSARY.md`](./GLOSSARY.md), 결정은 [`docs/adr/`](./docs/adr/) 다.
- `CLAUDE.md` 가 부르는 저장소 스킬(`/design-md` 등)과 서브에이전트는 Claude Code 용이다(정의는 `.claude/skills/`·
  `.claude/agents/`). 검증 게이트는 하네스와 무관하게 `CLAUDE.md` 의 `pnpm` 커맨드 그대로 돈다.
