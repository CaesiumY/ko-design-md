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
[![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-ee5a36)](https://docs.claude.com/en/docs/claude-code)

</div>

---

## ko-design-md란?

`ko-design-md`는 한국에서 운영되는 브랜드/서비스의 디자인 시스템(컬러, 타이포그래피, 컴포넌트, 인터랙션 원칙 등)을 **Stitch v0.1**이라는 구조화된 마크다운 형식으로 정리한 오픈 카탈로그입니다.

기존의 디자인 시스템 자료는 흩어져 있고, 다른 시스템과 비교하기 어렵고, 시간이 지나면 사라집니다. 이 카탈로그는 다음을 목표로 합니다.

- **단일 형식** — 모든 항목이 동일한 frontmatter + 섹션 구조를 따라 비교·검색·임베딩이 쉬움
- **자동화된 기여 흐름** — Claude Code의 [`/design-md` 스킬](#새-항목-기여--design-md-스킬로-한-번에)이 13단계 파이프라인으로 새 항목을 자동 생성
- **시각적 검증** — 항목마다 light/dark 프리뷰 HTML과 OG 이미지를 함께 보관해 텍스트뿐 아니라 시각적 일관성도 확인 가능

대상은 디자인 시스템을 **다루는** 디자이너·엔지니어, 그리고 한국 브랜드의 디자인 결정을 **연구하는** 사람입니다.

## 미리보기

> 라이브 사이트 URL은 곧 추가될 예정입니다. 현재는 로컬에서 `pnpm dev`로 실행해 확인할 수 있습니다.

각 항목은 다음 4종으로 구성됩니다.

| 산출물 | 위치 | 역할 |
|--------|------|------|
| 카탈로그 마크다운 | `services/{slug}.md` | Stitch v0.1 frontmatter + 본문 |
| 라이트 프리뷰 | `public/preview/{slug}/light.html` | 자급자족형 single-file 미리보기 |
| 다크 프리뷰 | `public/preview/{slug}/dark.html` | 다크 테마 미리보기 |
| OG 이미지 | `public/og/{slug}.png` | 소셜 카드용 1200×630 |

현재 카탈로그에는 [KRDS (Korea Reusable Design System)](./services/krds.md)가 등재되어 있습니다.

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
│   └── krds.md
├── public/
│   ├── preview/{slug}/        # 항목별 라이트/다크 프리뷰 HTML
│   ├── og/                    # 항목별 OG 이미지 (build:og로 생성)
│   └── logos/                 # 브랜드 로고 SVG (NOTICE 정책 적용)
├── src/                       # TanStack Start 사이트 소스
│   ├── lib/content-parser.ts  # frontmatter 검증 (엄격)
│   └── lib/content-types.ts   # 카테고리 enum / 타입
├── scripts/
│   └── build-og.ts            # OG 이미지 빌더 (satori + sharp)
└── .claude/skills/design-md/  # /design-md 스킬 (13단계 파이프라인)
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
| `logo` | string? | 옵션, `/logos/{slug}.svg` |

자세한 작성 규격은 [`docs/PRD.md`](./docs/PRD.md)와 [`.claude/skills/design-md/references/stitch-format.md`](./.claude/skills/design-md/references/stitch-format.md)를 참고하세요.

## 새 항목 기여 — `/design-md` 스킬로 한 번에

본 카탈로그는 [Claude Code](https://docs.claude.com/en/docs/claude-code)의 `/design-md` 스킬이 13단계 파이프라인으로 research → draft → review → preview HTML → OG 이미지를 자동 생성합니다. 직접 마크다운을 손으로 쓸 필요가 없습니다.

### 1. 사전 준비

- [Claude Code](https://docs.claude.com/en/docs/claude-code) 설치
- 본 리포 fork → clone → `pnpm install`
- 워크스페이스 루트에서 `claude` 실행

### 2. 스킬 호출

다음 중 한 문구로 시작합니다.

- `add 토스 to design.md catalog`
- `new design.md entry for 카카오뱅크`
- `onboard 당근 to ko-design-md`
- `토스를 ko-design-md에 추가`

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
<sub>Built with <a href="https://docs.claude.com/en/docs/claude-code">Claude Code</a> · Made for Korean designers and developers</sub>
</div>
