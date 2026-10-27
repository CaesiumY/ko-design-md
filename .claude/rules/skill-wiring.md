---
paths:
  - ".claude/skills/**"
  - ".claude/agents/**"
  - ".claude-plugin/**"
  - "src/lib/design-md-skill-*"
  - "src/lib/skill-*"
  - "src/lib/agent-skill-index*"
---

# 스킬 파일과 계약 테스트

## 스킬 파일을 고칠 때

- `.claude/skills/design-md/` 변경은 영향이 크므로 이슈에서 사전 합의. 스킬↔검증기
  배선은 `src/lib/design-md-skill-*.test.ts` 계약 테스트가 고정한다 — 프롬프트가 말하는
  임계값·규칙 id·명령·파일 경로·코드 이름을 검증기 소스나 저장소 실물과 대조하는 **배선만**
  고정하고, 문장이 그대로 있는지만 보는 단언은 두지 않는다(#424). 예외는 둘이다 — 프롬프트가
  스스로 "계약 테스트가 고정한다"며 규칙을 맡긴 자리와, author 프롬프트의 면책 띠 문자열
  (`design-md-preview-disclaimer.test.ts`)이다. 배선 대조도 프롬프트에서 값을 뽑을 **기준 문구**
  (`same widths (…)`·`Capture the answers as:`·`## Stage N —` 헤딩·Stage 12 의
  `**Design-board cross-check` 단계 제목 같은 문장 꼴)를 쓰므로, 그 꼴을 바꾸면 테스트도
  함께 고친다. 그 밖의 문구 다듬기는 이 테스트를 고칠 필요가 없다.
- **이 glob 밖에도 프롬프트를 읽는 테스트가 여럿 있다.** 프롬프트를 읽는 테스트는 모두
  `src/lib/skill-asset-paths.ts` 를 import 하므로, 프롬프트를 고치기 전에 **그 모듈을 import 하는 테스트
  파일**을 보는 것이 정본이다. 상수 이름으로 찾으면 빠진다 — 묶음 배열(`DESIGN_MD_AGENT_PATHS`)이나
  `SKILLS_DIR` 조립으로도 읽는다. 테스트가 읽는 `.claude/` 경로는 전부 그 파일 한 곳에 **리터럴 그대로**
  모여 있다(조립기로 바꾸지 말 것 — 목록이 보이는 것 자체가 계약이다). 스킬을 추가하면 같은 파일의
  `PUBLIC_SKILLS`·`INTERNAL_SKILLS` 중 하나에 선언한다. **공개/내부를 디렉터리로 가르지 않는 이유**:
  skills.sh 가 로컬·원격 모두 `.claude/skills/`를 스캔하므로 옮겨도 디스커버리는 그대로이고, 잃는 것(이 저장소
  안에서의 사용성·외부 링크)만 있다.
- **`.claude/skills/use-design-md/SKILL.md` 는 사이트 빌드의 소스이기도 하다.**
  `src/lib/agent-skill-index.ts` 가 이 파일을 `?raw` 로 import 해
  `/.well-known/agent-skills/use-design-md/SKILL.md` 로 그대로 서빙하고, 같은 바이트의 SHA-256 을
  `/.well-known/agent-skills/index.json` 이 발행한다(skills.sh·플러그인 마켓플레이스와 같은 파일이다).
  그래서 **본문 한 글자만 바뀌어도 발행 digest 가 바뀌는 것이 정상**이다 — 드리프트가
  아니다. 다만 frontmatter 는 `name:`·`description:` 을 **한 줄 스칼라로 유지**할 것.
  `description: >` 같은 YAML block scalar 로 바꾸면 추출기가 접기 지시자 한 글자를
  값으로 읽는다. **이걸 막는 건 `pnpm build` 가 아니라 `pnpm test` 다** — 빌드는 통과하고 배포되면 그
  엔드포인트가 500 을 낸다.
