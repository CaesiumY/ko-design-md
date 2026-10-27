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
`pnpm validate:previews --slug <slug> --verbose`. **검증기 메시지가 막는 이유와 고치는 법을 말한다** — 막히면
메시지를 따르고, 통과하려고 값을 지어내지 말 것. 프리뷰 대비 기준선 게이트 `pnpm gate:contrast` 는 위 묶음에
없다(`.claude/rules/preview.md`).

## 규칙이 사는 곳

카탈로그·프리뷰·스킬 규칙은 `.claude/rules/` 에 있다. Claude Code 는 그 `paths:` 에 맞는 파일을 다룰 때 읽고,
그 밖의 에이전트는 작업 파일에 맞는 파일을 직접 읽는다. 아래 「주로 읽히는 때」는 안내이고, 정확한 목록은 각
파일의 `paths:` 다.

| 파일 | 내용 | 주로 읽히는 때 |
| --- | --- | --- |
| `catalog.md` | 카탈로그 정책 · Google DESIGN.md 표준 · 등록처 표 | 항목(`services/`) · 검사기 · 토큰 추출기 · 로고·`NOTICE` · design-md 스킬과 스테이징 |
| `audit-notes.md` | 감사 메모 형식 · 날짜와 `Skip-Last-Updated` | 항목 · 날짜 검사 · OKLCH 감사 · 프리뷰 산문 감사 스킬 |
| `preview.md` | 프리뷰 HTML 가드 · 산문 감사 · 대비 게이트와 분류표 | `public/preview/` · 프리뷰 검사기 · 대비 측정 · design-md 스킬과 스테이징 |
| `e2e.md` | E2E 스모크 | `e2e/` · `playwright.config.ts` |
| `skill-wiring.md` | 스킬↔계약 테스트 배선 · use-design-md 가 빌드 소스인 것 | `.claude/skills/` · `.claude/agents/` · 스킬 테스트 |

## 기여 관례

- 커밋은 DCO 서명: `git commit -s`. PR 템플릿 참고.
- **PR·이슈 본문의 첫 1~3줄은 쉬운 말 요약이다** — 무엇이 바뀌는지 · 왜 · 독자에게 무엇이 달라지는지를
  함수명·규칙 ID·단계 번호 없이 쓰고, 저장소 은어(`block`·게이트·사이드카·상류 등)는 괄호로 한 줄 풀이한다.
  `gh issue create` 로 쓰는 이슈는 맨 위 `Part of #N`·`Blocked by:` 줄 다음에 둔다(`docs/agents/issue-tracker.md`).
- **여러 줄 문서·커밋 메시지는 인용 구분자 heredoc으로 넘긴다** — `cat > f <<'EOF'`.
  `node -e "…"`나 `printf`에 큰따옴표로 넘기면 **백틱 안 내용을 셸이 명령 치환해 통째로 날린다.**
  PowerShell here-string `@'…'@`을 Bash에 쓰면 리터럴 `@`가 박히는 것도 같은 계열이다.
- 무관 파일 대량 재포맷은 별도 `style:` PR로 분리.
- **머지 직전 `origin/main`을 가져와 합본 상태에서 게이트를 다시 돌린다** —
  `git fetch origin && git merge origin/main --no-commit --no-ff` → 게이트 → `git merge --abort`.
  PR 단위 CI 는 각 브랜치를 자기 base 에서 돌리므로, 둘 다 green 인데 합치면 깨지는 경우(예: 슬러그별 표가
  새로 생긴 경우)를 못 잡는다. **나중에 머지하는 브랜치가 수정을 싣는다.**

## Windows 로컬 주의

- `pnpm format:check`·`pnpm tokens:check` 가 로컬에서만 실패하면 CRLF 체크아웃 오탐일 수 있다 — **CI 결과가
  진실**이며, 해당 파일을 재포맷해 커밋하지 말 것. 판별은 `git ls-files --eol` 의 `i/` 열이 아니라 **`w/` 열**로
  한다(`i/lf` 는 작업 트리를 보증하지 않는다). `w/crlf` 로 나온 파일은 지우고 `git checkout -- <파일>` 로
  되살리면 된다 — 인덱스가 LF 라 내용 손실이 없다. `tokens:check` 는 사이드카(`services/*.tokens.json`)를 바이트로
  비교하므로 md 쪽 CRLF 는 영향이 없다. `w/crlf` 가 0개인데도 실패하면 진짜 위반이다 — 포맷은 고치고, 토큰은
  `pnpm tokens:build <slug>…` 결과를 커밋한다.

## Agent skills

### Issue tracker

이슈는 GitHub Issues(`CaesiumY/ko-design-md`)에 있고 `gh` CLI 로 다룬다. 자세한 것은 `docs/agents/issue-tracker.md`.

### Triage labels

기본 5종(`needs-triage` · `needs-info` · `ready-for-agent` · `ready-for-human` · `wontfix`)을 그대로 쓴다. 자세한 것은 `docs/agents/triage-labels.md`.

### Domain docs

single-context — 루트 `GLOSSARY.md`(용어집) + `docs/adr/`(결정 기록). 둘 다 `/domain-modeling` 이 갱신한다. 자세한 것은 `docs/agents/domain.md`.
