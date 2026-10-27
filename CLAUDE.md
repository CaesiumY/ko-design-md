# ko-design-md

한국 브랜드의 디자인 언어를 DESIGN.md 문서(`services/{slug}.md`)로 정리한 오픈 카탈로그.
TanStack Start 사이트(getdesign.kr)가 이를 서빙하고, `/design-md` 스킬(.claude/skills/design-md)이
새 항목 온보딩 파이프라인을 자동화한다. 패키지 매니저는 **pnpm** (npm 금지).

## 검증 커맨드 (CI 게이트와 동일)

```bash
pnpm typecheck && pnpm lint && pnpm format:check
pnpm test               # vitest — .claude/{worktrees,cache}/ 와 e2e/ 는 제외됨
pnpm validate:catalog   # services/*.md 전수: frontmatter·섹션 순서·OKLCH·인용 무결성
pnpm validate:previews  # public/preview/*/ 전수: 구조 block + 반응형·움직임 줄이기 휴리스틱 warn
pnpm tokens:check       # services/*.tokens.json 이 소스 md 와 일치하는지 (drift 게이트)
pnpm audit:oklch        # OKLCH↔병기 hex 일치 + 프리뷰가 md 정의와 어긋나지 않는지
pnpm check:last-updated # 이 브랜치가 바꾼 services/*.md 의 last_updated 가 최신인지
pnpm validate:spec      # 로컬 진단용 출력. 실제 게이트는 pnpm test 안의
                        # google-designmd-corpus.test.ts (같은 공식 린터를 vitest 로)
pnpm build              # build:og + vite build
pnpm test:http          # pnpm build 뒤 빌드된 Nitro 서버 HTTP 회귀 검사
pnpm test:e2e           # E2E 스모크 — 빌드된 서버 + Chromium, CI 는 별도 e2e 잡
```

단일 파일 검사: `pnpm validate:draft <file.md> [--slug X --expected-logo <url> --lang ko]`,
`pnpm validate:previews --slug <slug> --verbose`. 스킬 파이프라인은 이 검증기를
author→reviewer 사이 기계 게이트(Stage 6a2/9a2)로 실행하고, 프리뷰 루프는 9a2 뒤에 렌더
대비 관측(9a3)을 한 번 더 거친다. **검증기 메시지가 막는 이유와 고치는 법을 말한다** — 막히면
메시지를 따르고, 통과하려고 값을 지어내지 말 것. `pnpm gate:contrast`(프리뷰 대비 기준선 게이트)는 위 묶음에
없고 CI 의 별도 `contrast` 잡에서 돈다 — 수치는 CI 가 정본이다.

## 카탈로그 핵심 규칙 (위반은 CI가 block)

자세한 규칙과 이유는 아래 「규칙이 사는 곳」의 파일에 있다. 여기는 무엇이 막히는지 보는 색인이다.

- 토큰은 frontmatter 맵에 산다. 본문에는 yaml 펜스가 하나도 없다.
- 색 토큰 값은 OKLCH 만. 브랜드 hex 는 주석이나 병기로만.
- `logo` 는 필수다. 출처는 `## References` 한 곳이고, 인용은 존재가 아니라 내용 일치다.
- `primary` 라는 이름의 토큰을 지어내지 말 것. 통과하려고 값을 지어내지 말 것.
- 새 항목은 슬러그별 등록처마다 자기 줄을 적는다(표는 `catalog.md`).
- 감사 메모는 섹션 첫머리 블록쿼트 하나. 날짜는 조회해서 쓰고 `last_updated` 를 올린다.
- 프리뷰는 375 / 768 / 976 / 1440 폭에서 검증하고, 설명 캡션을 쓰지 않는다.

## 규칙이 사는 곳

`.claude/rules/` 의 파일은 Claude Code 가 그 `paths:` 에 맞는 파일을 다룰 때 읽는다. 그 밖의 에이전트는
작업 파일에 맞는 파일을 직접 읽는다.

| 파일 | 내용 | 읽히는 때 |
| --- | --- | --- |
| `catalog.md` | 카탈로그 정책 · Google DESIGN.md 표준 · 등록처 표 | 항목(`services/`) · 검사기 · 토큰 추출기 · 로고 · design-md 스킬 |
| `audit-notes.md` | 감사 메모 형식 · 날짜와 `Skip-Last-Updated` | 항목 · 날짜 검사 · 프리뷰 산문 감사 스킬 |
| `preview.md` | 프리뷰 HTML 가드 · 대비 게이트와 분류표 | `public/preview/` · 프리뷰 검사기 · 대비 측정 · design-md 스킬 |
| `e2e.md` | E2E 스모크 | `e2e/` · `playwright.config.ts` |
| `skill-wiring.md` | 스킬↔계약 테스트 배선 · use-design-md 가 빌드 소스인 것 | `.claude/skills/` · `.claude/agents/` · 스킬 테스트 |

## 프리뷰 산문 감사 — 판정 근거의 등급

프리뷰 산문이 `services/*.md`가 뒷받침하지 않는 주장을 하는지 대조할 때, **그
판정에는 근거 등급이 있고 낮은 등급을 근거로 쓰면 프리뷰를 망가뜨린다.**

- ❌ **"md에 없음"은 결함의 근거가 아니다.** 번들을 거친 항목의 md는 프리뷰와 같은 번들에서 갈라진
  **손실 전사**라, md의 침묵은 "프리뷰가 지어냈다"가 아닌 경우가 많다.
- ✅ **"md 또는 상류가 반증함"만 결함이다.**
- **상류를 확인 못 하면 판정하지 말 것** — 유보로 남긴다(상류를 열어 보지 못했다고 적는다).

전체 절차(상류 확인법 · 슬러그별 상류 판정표 · 되돌리기가 남긴 판정 규칙 · 이 규칙을
낳은 사고 이력)는 `.claude/skills/preview-prose-audit/SKILL.md` 에 있다.
**프리뷰 산문을 고치기 전에 반드시 읽을 것.**

## 기여 관례

- 커밋은 DCO 서명: `git commit -s`. PR 템플릿 참고.
- **PR·이슈 본문의 첫 1~3줄은 쉬운 말 요약이다** — PR 은 템플릿 `## 변경 요약` 의 첫 문단. 이슈는
  `gh issue create` 로 손수 쓰는 본문만 해당하고(웹 폼 이슈는 폼 필드로 시작하므로 제외), 맨 위에
  `Part of #N`·`Blocked by:` 줄이 있으면 그런 줄이 모두 끝난 다음에 둔다(`docs/agents/issue-tracker.md`).
  무엇이 바뀌는지 · 왜 · 독자(사이트 방문자 · 스킬 사용자 · 기여자)에게 무엇이 달라지는지를
  함수명·규칙 ID·단계 번호 없이 쓴다. 이 저장소의 은어(`block`·게이트·사이드카·상류 등)를 써야 하면
  괄호로 한 줄 풀이한다. 그 아래 상세는 촘촘하게 써도 된다 — 리뷰어와 봇에게는 그 밀도가 쓸모 있다.
- **여러 줄 문서·커밋 메시지는 인용 구분자 heredoc으로 넘긴다** — `cat > f <<'EOF'`.
  `node -e "…"`나 `printf`에 큰따옴표로 넘기면 **백틱 안 내용을 셸이 명령 치환해
  통째로 날린다.** 인라인 코드 스팬이 빈 자리로 남아 문장이 깨지고, diff만 봐서는
  잘 안 보인다. PowerShell here-string `@'…'@`을 Bash에 쓰면 리터럴 `@`가 박히는 것도 같은 계열이다.
- 무관 파일 대량 재포맷은 별도 `style:` PR로 분리.
- **머지 직전 `origin/main`을 가져와 합본 상태에서 게이트를 다시 돌린다** —
  `git fetch origin && git merge origin/main --no-commit --no-ff` → 게이트 → `git merge --abort`.
  PR 단위 CI 는 각 브랜치를 **자기 base** 에서 돌리므로 둘 다 green 인데 합치면 깨지는 경우를
  원리적으로 못 잡는다. 슬러그별 표를 쓰는 것이 이 위험을 줄이지만 지우지는 않는다 —
  표가 **늘어나는** 경우가 남기 때문이다(#390 이 슬러그당 4행짜리 대비 기준선 표를 새로 세운 것이 예).
  "순서를 조율한다"는 해법이 아니고, **나중에 머지하는 브랜치가 수정을 싣는다.**

## Windows 로컬 주의

- `pnpm format:check`가 로컬에서만 실패하면 CRLF 체크아웃 오탐일 수 있다 — **CI 결과가
  진실**이며, 해당 파일을 재포맷해 커밋하지 말 것. **판별은 `git ls-files --eol`의 `i/`
  열이 아니라 `w/` 열로 한다.** `i/lf`는 인덱스가 LF라는 뜻일 뿐 작업 트리를 보증하지
  않는다 — 워크트리를 만든 도구에 따라 체크아웃 당시의 파일이 `w/crlf`로 남은 사례가 있다.
  `git ls-files --eol | grep w/crlf`에 나온 파일은 지우고 `git checkout -- <파일>`로 되살리면 된다 — 인덱스가
  LF라 내용 손실이 없다. `w/crlf`가 0개인데도 실패하면 오탐으로 넘기지 말고 진짜 포맷 위반으로 다룰 것.
- `pnpm tokens:check`는 사이드카를 **바이트 단위로** 비교하므로 같은 원인의 오탐이
  난다 — 사이드카 `services/*.tokens.json`이 `w/crlf`이면 내용이 같아도 "out of sync"를
  낸다(md 쪽 CRLF는 판정에 영향이 없다). 실패하면 **먼저 위 항의 `w/crlf` 판별과 복구를
  하고**, 그래도 실패하면 진짜 drift이니 안내대로 `pnpm tokens:build <slug>…`를 실행하고
  결과를 커밋할 것.

## Agent skills

### Issue tracker

이슈는 GitHub Issues(`CaesiumY/ko-design-md`)에 있고 `gh` CLI 로 다룬다. 자세한 것은 `docs/agents/issue-tracker.md`.

### Triage labels

기본 5종(`needs-triage` · `needs-info` · `ready-for-agent` · `ready-for-human` · `wontfix`)을 그대로 쓴다. 자세한 것은 `docs/agents/triage-labels.md`.

### Domain docs

single-context — 루트 `GLOSSARY.md`(용어집) + `docs/adr/`(결정 기록). 둘 다 `/domain-modeling` 이 갱신한다. 자세한 것은 `docs/agents/domain.md`.
