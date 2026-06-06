# 기여 가이드

`ko-design-md`에 관심을 가져주셔서 감사합니다. 이 문서는 카탈로그 OSS의 특수성에 맞춘 기여 절차를 정리합니다. 본 프로젝트의 [행동 강령](./CODE_OF_CONDUCT.md)을 먼저 읽어주세요.

---

## 기여 종류

기여는 크게 세 가지로 나뉩니다.

1. **새 카탈로그 항목 추가** — 한국 브랜드/서비스의 디자인 시스템을 Stitch v0.1 형식으로 카탈로그에 등록.
2. **기존 항목 수정/오타** — `services/*.md` 또는 `public/preview/**`의 정정·보강.
3. **사이트 코드/문서/스킬 자체 개선** — TanStack Start 기반 사이트, 본 문서·README, 또는 `.claude/skills/design-md/`의 스킬 자체.

---

## 1. 새 항목 추가 (권장: `/design-md` 스킬 사용)

본 카탈로그는 AI 코딩 에이전트에서 실행하는 `/design-md` 스킬이 13단계 파이프라인으로 새 항목 작성 전 과정을 자동화합니다. 직접 마크다운을 손으로 쓰는 것보다 일관성이 높고, 검토 점수 기반으로 품질을 보장합니다. 현재 저장소에는 Claude Code 호환 스킬 파일이 함께 제공됩니다.

### 1-1. 사전 준비

- 지원되는 AI 코딩 도구 준비 (예: [Claude Code](https://docs.claude.com/en/docs/claude-code)처럼 로컬 스킬/에이전트 워크플로를 실행할 수 있는 도구)
- 본 리포 fork → 로컬 clone
- 워크스페이스 루트에서 `pnpm install`
- 같은 위치에서 해당 도구 실행 (예: Claude Code의 경우 `claude` 입력)

### 1-2. 항목 후보 점검 (스킬 호출 전)

- `services/` 디렉터리에 이미 같은 brand가 있는지 확인. 있다면 [기존 항목 수정](#2-기존-항목-수정-스킬-미사용) 흐름으로.
- 브랜드의 디자인 시스템 자료가 공개되어 있는지 확인 — 공식 사이트, 디자인 가이드 PDF, 스타일 가이드 페이지, 깃허브 등. 출처가 부족하면 수집 가능한 URL을 미리 정리.
- 브랜드 자산 정책(상표/로고 사용 가이드)을 가볍게 확인. 우려가 있으면 이슈에서 먼저 토의 후 진행.

### 1-3. 스킬 실행

다음 중 한 문구로 시작합니다.

- `add 토스 to design.md catalog`
- `new design.md entry for 카카오뱅크`
- `onboard 당근 to ko-design-md`
- `토스를 ko-design-md에 추가`

더 정확한 결과를 원하면 아래 템플릿처럼 자료·확인 범위를 함께 전달하세요(선택 — 생략하면 스킬이 Stage 2에서 직접 물어봅니다).

```text
/design-md
{브랜드/서비스명}을 ko-design-md에 새 카탈로그 항목으로 추가해 주세요.

- 공식 사이트: {URL}
- 디자인 시스템/브랜드 가이드: {URL 또는 "공개 문서 없음"}
- 희망 slug/category: {slug 후보}, {카테고리 후보 (하단 3절 참고)}
- 특히 확인할 범위: 컬러, 타이포그래피, 컴포넌트, 인터랙션, 접근성 등
- 제외하거나 조심할 점: {선택}
- 검토 방식: research, draft, preview 단계마다 확인을 요청해 주세요.
```

스킬이 13단계 파이프라인을 실행합니다.

1. **Stage 1: Preflight** — 레포 위치/날짜/패키지명/카테고리 enum 검증
2. **Stage 2: Conversational intake** — 브랜드명, slug, 카테고리, 자료 URL 등 4개 질문
3. **Stage 3: Research** — `research-collector`가 공개 자료를 수집해 `research.md` 작성
4. **Stage 4–5: Author ⇄ Reviewer 루프 (≤3회)** — `design-md-author`가 `draft.md`를 Stitch v0.1 형식으로 작성하고, `design-md-reviewer`가 점수화. score ≥ 8/10 또는 3회 도달 시 종료.
5. **Stage 6: 사용자 체크포인트** — 직접 검토·수정 후 승인
6. **Stage 7: Write MD** — `services/{slug}.md` 저장
7. **Stage 8–9: Preview HTML 루프 (≤3회, non-blocking)** — light/dark HTML 자동 생성
8. **Stage 10: Write Preview** — `public/preview/{slug}/{light,dark}.html` 저장
9. **Stage 11: Build OG** — `pnpm build:og` 실행으로 `public/og/{slug}.png` 생성
10. **Stage 12: Verify** — 사이트 라우팅 검증
11. **Stage 13: 종료** — 후속 PR 안내

각 단계 산출물은 `.claude/cache/design-md/{slug}/`에 저장되어 중간 재개가 가능합니다.

### 1-4. 산출물 검증

스킬이 완료된 후 다음을 직접 확인하세요.

- `services/{slug}.md` frontmatter 필수 필드:
  - `name` (브랜드 표기명)
  - `slug` (소문자 + 하이픈 + ASCII)
  - `category` ([content-types.ts](./src/lib/content-types.ts)의 `CATEGORIES` enum 중 하나)
  - `last_updated` (YYYY-MM-DD ISO 형식 — [content-parser.ts:158-171](./src/lib/content-parser.ts)에서 엄격히 검증)
  - `sources` (URL 배열)
  - `related_services` (관련 슬러그 배열, 없으면 `[]`)
  - `lang` (`ko` 또는 `en`)
  - `logo` (옵션: 절대 URL `https://getdesign.kr/logos/{slug}.{svg|png|webp|avif}`, 사이트 상대 경로 불가)
- 본문의 `[src:N]` 인용이 frontmatter `sources` 인덱스와 일치
- `pnpm dev` → `http://localhost:3000/{slug}` 미리보기 정상
- `public/preview/{slug}/light.html` 과 `dark.html` 둘 다 자급자족형(self-contained) HTML로 단독 열기 가능
- `public/og/{slug}.png` 생성 확인

### 1-5. PR 작성

- 모든 변경 파일을 한 커밋으로 묶기 (`git commit -s` — DCO 서명)
- PR 템플릿의 "카탈로그 PR 체크" 항목을 모두 체크
- CI(typecheck/lint/build) 통과 확인

---

## 2. 기존 항목 수정 (스킬 미사용)

오타 수정, 링크 갱신, `last_updated` 보정, sources 추가 같은 소규모 변경은 손으로 PR을 올려도 됩니다.

규칙:

- **큰 변경(섹션 신설, frontmatter 구조 변경, 새 항목 작성)은 스킬 권장**. 일관성 유지를 위해.
- 수정 시에도 `pnpm build`로 파서 검증을 통과해야 합니다 (`src/lib/content-parser.ts`가 frontmatter를 엄격히 검증).
- `_` 접두 데모 항목(`services/_demo-*.md`)은 **PR 금지**. 스킬 검증용 자산이므로 외부 변경은 받지 않습니다.

---

## 3. slug · 카테고리 · 언어 태그 규칙

| 필드 | 규칙 |
|------|------|
| `slug` | 소문자 + 하이픈 + ASCII. 한글/공백 불가. 브랜드 영문 표기 우선 (`toss`, `kakao-bank`, `daangn`) |
| `category` | [content-types.ts](./src/lib/content-types.ts)의 `CATEGORIES` enum (`finance`, `messenger`, `commerce`, `delivery`, `mobility`, `content`, `community`, `travel`, `gov`, `developer`, `education`, `career`, `etc`). 모르겠다면 `etc`로 두고 PR에서 토의 |
| `lang` | 자료가 한국어 위주면 `ko`, 영어 위주면 `en` |
| `last_updated` | YYYY-MM-DD ISO 형식 (`2026-05-10`) |

---

## 4. PR 체크리스트

PR 생성 시 자동으로 표시되는 체크리스트와 동일합니다.

- [ ] frontmatter 필수 필드 검증 완료
- [ ] preview HTML 두 본 (light/dark) 검증
- [ ] `[src:N]` 인용 정합성
- [ ] 브랜드 자산 라이선스/상표 우려 검토
- [ ] `pnpm typecheck && pnpm lint && pnpm build` 통과
- [ ] DCO 서명 (`git commit -s`)

---

## 5. DCO 서명

본 프로젝트는 [Developer Certificate of Origin](https://developercertificate.org/)을 사용합니다. CLA는 도입하지 않습니다 (단일 메인테이너 + CC BY 4.0 콘텐츠 정책상 불필요).

```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
git commit -s -m "feat(catalog): add 토스"
# 커밋 메시지에 자동으로 다음 줄이 추가됨
# Signed-off-by: Your Name <you@example.com>
```

---

## 6. 사이트 코드/스킬 자체 기여

- **사이트 코드**: TypeScript + TanStack Start. PR 전 `pnpm typecheck && pnpm lint && pnpm build` 통과 필수.
- **스킬 (`.claude/skills/design-md/`)**: 영향이 크므로 변경 의도를 이슈에서 먼저 합의해주세요. 특히 `SKILL.md`의 13단계 파이프라인이나 reference 문서 (`stitch-format.md`, `rubric-design.md`, `rubric-preview.md`)를 바꾸는 PR은 사전 협의 필수.

---

## 7. 라이선스 동의

본 리포에 기여하면 다음 3-tier 라이선스에 동의하는 것으로 간주됩니다.

- **코드** (`src/`, `scripts/`, 설정 파일): [MIT](./LICENSE)
- **카탈로그 콘텐츠** (`services/*.md`, `public/preview/**`, `public/og/**`): [CC BY 4.0](./LICENSE-CONTENT)
- **브랜드 자산** (`public/logos/*`): 각 권리자 정책 — [NOTICE](./NOTICE) 참조

---

## 8. 연락처

- **보안 이슈**: [Security Advisories](../../security/advisories/new)를 통해 비공개로 보고 ([SECURITY.md](./SECURITY.md))
- **저작권·상표 삭제 요청(Takedown)**: `⚖️ 삭제(Takedown) 요청` 이슈 또는 비공개 [Security Advisories](../../security/advisories/new) — [SECURITY.md Takedown 안내](./SECURITY.md#브랜드-자산콘텐츠-삭제-요청-takedown)
- **행동 강령 위반**: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- **그 외**: [GitHub Issues](../../issues)
