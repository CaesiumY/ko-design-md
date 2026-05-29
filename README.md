<div align="center">

# ko-design-md

**한국 브랜드 디자인 시스템을 Stitch v0.1 마크다운으로 정리한 오픈 카탈로그**

[![License: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](./LICENSE)
[![Content: CC BY 4.0](https://img.shields.io/badge/Content-CC%20BY%204.0-lightgrey.svg)](./LICENSE-CONTENT)
[![CI](https://github.com/CaesiumY/ko-design-md/actions/workflows/ci.yml/badge.svg)](https://github.com/CaesiumY/ko-design-md/actions/workflows/ci.yml)
[![GitHub stars](https://img.shields.io/github/stars/CaesiumY/ko-design-md?style=flat&logo=github)](https://github.com/CaesiumY/ko-design-md/stargazers)
[![GitHub last commit](https://img.shields.io/github/last-commit/CaesiumY/ko-design-md)](https://github.com/CaesiumY/ko-design-md/commits/main)
[![GitHub issues](https://img.shields.io/github/issues/CaesiumY/ko-design-md)](https://github.com/CaesiumY/ko-design-md/issues)
[![pnpm](https://img.shields.io/badge/pnpm-required-f69220?logo=pnpm)](https://pnpm.io/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-ff4154)](https://tanstack.com/start)
[![AI-assisted workflow](https://img.shields.io/badge/AI--assisted-workflow-4f46e5)](#새-항목-기여--design-md-스킬로-한-번에)

</div>

---

## ko-design-md란?

`ko-design-md`는 한국에서 운영되는 브랜드/서비스의 디자인 시스템(컬러, 타이포그래피, 컴포넌트, 인터랙션 원칙 등)을 **Stitch v0.1**이라는 구조화된 마크다운 형식으로 정리한 오픈 카탈로그입니다.

기존의 디자인 시스템 자료는 흩어져 있고, 다른 시스템과 비교하기 어렵고, 시간이 지나면 사라집니다. 이 카탈로그는 다음을 목표로 합니다.

- **단일 형식** — 모든 항목이 동일한 frontmatter + 섹션 구조를 따라 비교·검색·임베딩이 쉬움
- **자동화된 기여 흐름** — AI 코딩 에이전트용 [`/design-md` 스킬](#새-항목-기여--design-md-스킬로-한-번에)이 13단계 파이프라인으로 새 항목을 자동 생성
- **시각적 검증** — 항목마다 light/dark 프리뷰 HTML과 OG 이미지를 함께 보관해 텍스트뿐 아니라 시각적 일관성도 확인 가능

대상은 디자인 시스템을 **다루는** 디자이너·엔지니어, 그리고 한국 브랜드의 디자인 결정을 **연구하는** 사람입니다.

## design.md를 AI에게 먹일 때 — 겉모습을 빌리되, 비즈니스를 베끼지 마세요

각 항목은 브랜드의 **시각/디자인 언어**(색·타이포그래피·간격·컴포넌트의 *시각 패턴*)를 기술합니다. design.md를 AI 코딩 에이전트에 넣어 자기 제품을 만들 때는, 그 시각 패턴을 **자기 제품 도메인에 맞게 번안**하세요.

- ✅ 차용: 색 팔레트, 타이포 스케일, 간격 리듬, 컴포넌트의 시각 처리(둥글기·그림자·밀도)
- ❌ 이식 금지: 출처 브랜드의 제품 개념·플로우·카피 — 예) 토스의 송금 흐름, 배민의 ETA 의미를 성격이 다른 앱에 그대로 가져오기

`## Components`가 도메인 특화 이름(`button-cta`="구매하기", `EtaBanner`)을 쓰는 것은 출처를 정확히 기록하기 위함이지, 그 도메인을 함께 복사하라는 뜻이 아닙니다.

## 미리보기

> 라이브 사이트 URL은 곧 추가될 예정입니다. 현재는 로컬에서 `pnpm dev`로 실행해 확인할 수 있습니다.

각 항목은 다음 4종으로 구성됩니다.

| 산출물 | 위치 | 역할 |
|--------|------|------|
| 카탈로그 마크다운 | `services/{slug}.md` | Stitch v0.1 frontmatter + 본문 |
| 라이트 프리뷰 | `public/preview/{slug}/light.html` | 자급자족형 single-file 미리보기 |
| 다크 프리뷰 | `public/preview/{slug}/dark.html` | 다크 테마 미리보기 |
| OG 이미지 | `public/og/{slug}.png` | 소셜 카드용 1200×630 |

## 빠른 시작

```bash
# 1. 클론
git clone https://github.com/CaesiumY/ko-design-md.git
cd ko-design-md

# 2. 의존성 설치 (pnpm 필요)
pnpm install

# 3. 개발 서버
pnpm dev
# → http://localhost:3000

# 4. 빌드 (OG 이미지 생성 + 사이트 빌드)
pnpm build
```

요구사항: Node 20+, pnpm.

## 카탈로그 구조

```
ko-design-md/
├── services/                  # 카탈로그 항목 (Stitch v0.1)
│   └── {slug}.md
├── public/
│   ├── preview/{slug}/        # 항목별 라이트/다크 프리뷰 HTML
│   ├── og/                    # 항목별 OG 이미지 (build:og로 생성)
│   └── logos/                 # 브랜드 로고 SVG (NOTICE 정책 적용)
├── src/                       # TanStack Start 사이트 소스
│   ├── lib/content-parser.ts  # frontmatter 검증 (엄격)
│   └── lib/content-types.ts   # 카테고리 enum / 타입
├── scripts/
│   └── build-og.ts            # OG 이미지 빌더 (satori + sharp)
└── .claude/skills/design-md/  # 호환 스킬 위치 (/design-md 13단계 파이프라인)
```

### Stitch v0.1 frontmatter

각 `services/*.md`의 필수 필드입니다.

| 필드 | 타입 | 비고 |
|------|------|------|
| `name` | string | 한국어 기업/브랜드 표기명 |
| `design_system_name` | string? | 옵션, 기업명과 별도인 디자인 시스템명 |
| `slug` | string | 소문자 + 하이픈 + ASCII |
| `category` | enum | `finance`, `messenger`, `commerce`, `delivery`, `mobility`, `content`, `community`, `travel`, `etc` |
| `last_updated` | string | YYYY-MM-DD ISO 형식 (엄격 검증) |
| `sources` | string[] | 인용 출처 URL 배열 (본문 `[src:N]`이 인덱스 참조) |
| `related_services` | string[] | 관련 슬러그 배열 (없으면 `[]`) |
| `lang` | enum | `ko` 또는 `en` |
| `logo` | string? | 옵션, 절대 URL `https://getdesign.kr/logos/{slug}.{svg\|png\|webp\|avif}` (사이트 상대 경로 불가) |

자세한 작성 규격은 [`docs/PRD.md`](./docs/PRD.md)와 현재 제공되는 호환 스킬 규격인 [`.claude/skills/design-md/references/stitch-format.md`](./.claude/skills/design-md/references/stitch-format.md)를 참고하세요.

## 새 항목 기여 — `/design-md` 스킬로 한 번에

본 카탈로그는 호환되는 AI 코딩 에이전트에서 실행하는 `/design-md` 스킬로 13단계 파이프라인을 진행해 research → draft → review → preview HTML → OG 이미지를 자동 생성합니다. 현재 저장소에는 Claude Code 호환 스킬 파일도 함께 제공됩니다.

### 1. 사전 준비

- 지원되는 AI 코딩 도구 준비 (예: Claude Code처럼 로컬 스킬/에이전트 워크플로를 실행할 수 있는 도구)
- 본 리포 fork → clone → `pnpm install`
- 워크스페이스 루트에서 해당 도구 실행

### 2. 스킬 호출

한 줄로 브랜드명만 전달해도 시작할 수 있지만, 자료와 기대 범위를 함께 적으면 조사 품질과 중간 검토가 더 안정적입니다. 도구가 slash command를 지원하면 `/design-md`로 시작하고, 그렇지 않으면 아래처럼 새 항목 생성 의도를 자연어로 분명히 적어 주세요.

```text
/design-md
{브랜드/서비스명}을 ko-design-md에 새 카탈로그 항목으로 추가해 주세요.

- 공식 사이트: {URL}
- 디자인 시스템/브랜드 가이드: {URL 또는 "공개 문서 없음"}
- 희망 slug/category: {slug 후보}, {카테고리 후보}
- 특히 확인할 범위: 컬러, 타이포그래피, 컴포넌트, 인터랙션, 접근성 등
- 제외하거나 조심할 점: {선택}
- 검토 방식: research, draft, preview 단계마다 확인을 요청해 주세요.
```

최소 요청은 `{브랜드/서비스명}을 ko-design-md에 추가해 주세요`처럼 짧게 써도 됩니다. 다만 공식 문서나 브랜드 가이드 URL을 함께 주면 스킬이 출처를 더 빠르게 좁히고, 잘못된 추론을 줄일 수 있습니다.

스킬이 브랜드 공식 사이트와 디자인 시스템 문서를 자동으로 조사하고, 중간 단계마다 사용자 검토를 요청합니다.

### 3. 자동 생성물 확인

스킬 실행이 끝나면 다음 4종이 생성됩니다.

- `services/{slug}.md` (Stitch v0.1 형식)
- `public/preview/{slug}/light.html`
- `public/preview/{slug}/dark.html`
- `public/og/{slug}.png` (`pnpm build:og`로 갱신)

`pnpm dev` 후 `http://localhost:3000/{slug}`에서 미리보기 확인.

### 4. PR 생성

변경된 파일을 한 커밋(`git commit -s` — DCO 서명)으로 묶어 PR. PR 템플릿의 "카탈로그 PR 체크" 항목을 모두 체크하면 됩니다.

> 스킬 없이 손으로 기여하고 싶다면 [CONTRIBUTING.md의 수동 PR 절차](./CONTRIBUTING.md#2-기존-항목-수정-스킬-미사용)를 참고하세요. 큰 변경(섹션 신설, 새 항목 작성)은 스킬 권장.

## 라이선스

본 리포는 **3-tier** 라이선스 구조를 가집니다.

| 대상 | 라이선스 | 파일 |
|------|----------|------|
| 코드 (`src/`, `scripts/`, 설정 파일) | MIT | [LICENSE](./LICENSE) |
| 카탈로그 콘텐츠 (`services/*.md`, `public/preview/**`, `public/og/**`) | CC BY 4.0 | [LICENSE-CONTENT](./LICENSE-CONTENT) |
| 브랜드 자산 (`public/logos/*`) | 각 권리자 정책 | [NOTICE](./NOTICE) |

브랜드 로고는 식별·참조 목적으로 포함된 것이며, 카탈로그 라이선스로 재배포되지 않습니다. 권리자 삭제 요청은 [Security Advisories](https://github.com/CaesiumY/ko-design-md/security/advisories/new)로 받습니다.

## 링크

- [기여 가이드](./CONTRIBUTING.md)
- [행동 강령](./CODE_OF_CONDUCT.md)
- [보안 정책](./SECURITY.md)
- [변경 이력](./CHANGELOG.md)
- [GitHub Issues](https://github.com/CaesiumY/ko-design-md/issues)
- [PRD](./docs/PRD.md) — 프로젝트 방향성 문서

---

<div align="center">
<sub>AI-assisted workflow · Made for Korean designers and developers</sub>
</div>
