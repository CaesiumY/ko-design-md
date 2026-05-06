# 한국형 design.md 카탈로그 — V0 Minimal Core 스캐폴딩

## Context

`docs/PRD.md`에 정의된 방향성 PRD가 확정된 상태(2026-05-06)에서, V0 launch를 향한 첫 실행 단계인 **스캐폴딩**을 구축한다. 이 스캐폴딩의 목표는 두 가지다.

1. **PRD Core Principle 2 (Easy-Add 아키텍처)** 구현 — `services/`에 새 `.md` 파일을 떨어뜨리는 것만으로 라우팅·홈 카드가 자동 반영되는 골격을 만든다. 이후 maintainer가 콘텐츠 작성에만 집중할 수 있도록.
2. **PRD 핵심 UX (1클릭 Copy → LLM 컨텍스트 주입)** 검증 — 가상 데모 md로 디자인·렌더링·복사 파이프라인이 end-to-end 동작함을 검증.

실제 서비스(토스·네이버 등)별 design.md 콘텐츠 작성은 **본 작업 범위 밖**이며 별도 단계에서 진행된다. 이번 작업이 끝나면 maintainer가 services/에 첫 실제 콘텐츠를 추가하기만 하면 되는 상태가 된다.

## Brainstorming Decisions (확정)

| 항목 | 결정 |
|---|---|
| Scope | **Minimal core** — 한·영 라우팅·카테고리 필터·sitemap·hreflang은 후속 분리 |
| MD pipeline | **raw import + react-markdown** (Vite `import.meta.glob` 빌드 타임 자동 수집) |
| UI 라이브러리 | **shadcn(base-luma) 일관 통일** — Button(있음) + Card/Badge/Sonner/Tooltip 추가 |
| 폰트 | **Pretendard로 통일** (Inter 제거) |
| 폴더 구조 | **루트 `services/`** (콘텐츠) + `src/{routes,features,lib,components}/` (코드) |
| 데모 콘텐츠 | **가상 서비스 2개**, PRD 스키마 + placeholder 텍스트 채움 (~3-5k tokens 분량) |
| 카드 디자인 | **카테고리 그라디언트 cover + 텍스트** (luma 톤) |
| 다크모드 | **시스템 자동만** (`:root`/`.dark` 변수는 이미 세팅됨, 토글은 후속) |
| 전역 상태 | **jotai** (Provider만 root에 install, V0에서 atom 사용 없음) |

## 외부 라이브러리

### 신규 추가 (npm)
- `jotai` — 전역 상태 관리 (Provider만 root에 등록)
- `@fontsource-variable/pretendard` — Pretendard Variable 폰트 (현재 Inter import와 동일 패턴)
- `gray-matter` — frontmatter 파싱
- `react-markdown` — 본문 렌더링
- `remark-gfm` — GFM (테이블/체크박스/취소선)
- `rehype-slug` — 헤딩 id 자동 부여
- `rehype-autolink-headings` — 헤딩 옆 anchor 링크 (PRD 7.2 섹션 anchor 요구)
- `shiki` — 빌드 타임 코드 신택스 하이라이팅 (Tailwind/TS 스니펫용)
- `gpt-tokenizer` — frontmatter `estimated_tokens` 자동 계산

### 신규 추가 (shadcn registry)
- `card`, `badge`, `sonner`, `tooltip`
- (sonner는 `sonner` npm 패키지를 shadcn이 wrap한 형태)

### 제거
- `@fontsource-variable/inter` (Pretendard로 교체)

## 폴더 구조

```
/                                # 프로젝트 루트
├── services/                    # 콘텐츠 디렉터리 (Easy-Add 대상)
│   ├── _demo-pay.md             # 가상 서비스 1 (finance, tier 1)
│   └── _demo-courier.md         # 가상 서비스 2 (delivery, tier 2)
├── src/
│   ├── routes/                  # TanStack Router file-based routing
│   │   ├── __root.tsx           # 루트 레이아웃 + 헤더/푸터/Toaster/JotaiProvider
│   │   ├── index.tsx            # /
│   │   └── services/
│   │       └── $slug.tsx        # /services/[slug]
│   ├── features/                # 도메인별 응집
│   │   ├── home/
│   │   │   └── components/
│   │   │       ├── hero.tsx
│   │   │       └── service-card-grid.tsx
│   │   └── service-detail/
│   │       └── components/
│   │           ├── copy-button.tsx
│   │           ├── markdown-body.tsx
│   │           ├── service-meta.tsx
│   │           └── token-badge.tsx
│   ├── lib/
│   │   ├── content-collection.ts   # import.meta.glob 모듈, getAllServices/getServiceBySlug
│   │   ├── content-types.ts        # ServiceFrontmatter, ServiceDoc 등
│   │   ├── markdown-pipeline.ts    # react-markdown plugin 조합
│   │   ├── category-style.ts       # 카테고리 → gradient/색상 lookup
│   │   └── utils.ts                # cn() (이미 있음)
│   ├── components/
│   │   ├── site/                # 사이트 셸 (헤더/푸터)
│   │   │   ├── header.tsx
│   │   │   └── footer.tsx
│   │   └── ui/                  # shadcn (button + 신규 4개)
│   ├── styles.css
│   └── router.tsx
├── public/
│   ├── favicon.ico              # (있음)
│   ├── manifest.json            # (있음)
│   ├── robots.txt               # (있음)
│   └── og-default.svg           # 신규 — V0 placeholder OG 이미지
├── docs/PRD.md
└── vite.config.ts
```

## 데이터 모델

`src/lib/content-types.ts` — PRD 7.1 스키마를 TS 타입으로:

```ts
export type Category =
  | 'finance' | 'messenger' | 'commerce' | 'delivery'
  | 'mobility' | 'content' | 'community' | 'travel' | 'etc'
export type Tier = 1 | 2 | 3
export type Lang = 'ko' | 'en'

export interface ServiceFrontmatter {
  name: string
  slug: string
  category: Category
  tier: Tier
  last_updated: string             // YYYY-MM-DD
  sources: string[]
  related_services: string[]
  lang: Lang
  estimated_tokens?: number        // 빌드 시 자동 계산되면 덮어씀
}

export interface ServiceDoc {
  frontmatter: ServiceFrontmatter
  raw: string                      // frontmatter 포함 전체 (Copy 시 사용)
  body: string                     // frontmatter 제거 본문 (렌더링 시 사용)
  tagline: string                  // 본문 첫 단락 발췌 (카드 미리보기용)
  filePath: string
  estimatedTokens: number          // 빌드 타임 계산값
}
```

## Easy-Add 메커니즘

`src/lib/content-collection.ts` 가 다음을 빌드 타임에 처리:

1. `import.meta.glob('/services/*.md', { query: '?raw', eager: true })` — 모든 raw md 정적 수집
2. 파일 경로에서 slug 추출 (`/services/_demo-pay.md` → `demo-pay`, 언더스코어는 stripped)
3. `gray-matter`로 frontmatter / body 분리
4. `gpt-tokenizer`로 raw 텍스트 토큰 수 계산 (frontmatter에 명시값 있으면 그것 우선)
5. body 첫 단락에서 tagline 발췌
6. slug 기반 Map 인덱스 → `getAllServices(): ServiceDoc[]`, `getServiceBySlug(slug): ServiceDoc | undefined`

새 `services/foo.md` 드롭 시 vite dev가 hot reload, prod 빌드는 정적 import라 자동 반영.

## 카드 디자인

`features/home/components/service-card-grid.tsx`:
- 그리드: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto`
- 각 카드 (shadcn `<Card>`):
  - 상단 cover: `aspect-[16/9]`, 카테고리별 gradient (`category-style.ts` lookup, 예: finance `from-blue-500 to-cyan-400`)
  - 하단:
    - 서비스명 (h3, `font-semibold`)
    - `<Badge>` 카테고리 + tier 1이면 `★` 인라인 표시
    - tagline (한 줄, `line-clamp-2`, `text-muted-foreground`)
    - 토큰 수 (`text-xs text-muted-foreground`)
  - hover: `hover:border-foreground/20`, 살짝 translate

## 디테일 페이지

`src/routes/services/$slug.tsx`:
- `loader({ params })`에서 `getServiceBySlug(params.slug)` → 없으면 `notFound()`
- `head({ loaderData })`에서 frontmatter.name, tagline으로 title/description/og 메타
- 레이아웃 (데스크톱):
  - 좌측 본문: `<ServiceMeta />` + `<MarkdownBody />` (max-w-prose)
  - 우측 sticky aside (`top-20`): `<CopyButton />` + `<TokenBadge />` + 모델 적합성 인라인 텍스트
- 모바일: aside가 상단 sticky bar로 변형 (`md:` 분기)
- 헤딩 옆 anchor (#) 링크: `rehype-autolink-headings`로 자동

`<CopyButton />`:
- `navigator.clipboard.writeText(serviceDoc.raw)` 호출
- `sonner` 토스트 — "Copied to clipboard" + 토큰 수 부제

`<MarkdownBody />`:
- `react-markdown` + plugins: `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `shiki` transformer
- prose 스타일은 `styles.css`에 직접 작성 (`@layer components { .markdown-body h2 { ... } }`) — Tailwind typography plugin 미사용 (의존성 절감, luma 톤 직접 제어)

## 헤더 / 푸터

`src/components/site/header.tsx`:
- fixed top, `h-14`, `border-b`, `backdrop-blur`
- 좌측: 사이트명 placeholder `"ko/design.md"` (PRD OQ-2 확정 후 교체) + 작은 로고 자리(임시 텍스트)
- 우측: GitHub 링크 (lucide `Github` 아이콘)

`src/components/site/footer.tsx`:
- 라이선스 disclaimer (코드 MIT 잠정 / 콘텐츠 CC-BY 4.0 잠정 — PRD 8 OQ-4)
- 상표 fair-use disclaimer 한 줄
- 깃허브 링크 / 프로젝트 description

## 폰트 / 다크모드

- `src/styles.css`:
  - `@import "@fontsource-variable/inter"` 제거
  - `@import "@fontsource-variable/pretendard"` 추가
  - `--font-sans: 'Pretendard Variable', -apple-system, BlinkMacSystemFont, 'system-ui', sans-serif`
- 다크모드: `:root`/`.dark` 양쪽 CSS 변수는 이미 세팅. `__root.tsx`에서 `<html>` 클래스 토글 안 하고, `prefers-color-scheme` 미디어 쿼리로 자동 적용되도록 `.dark` 블록을 `@media (prefers-color-scheme: dark) { :root { ... } }`로 변경 (또는 동등 로직). 토글 UI 없음.

## SEO (V0 기본만)

- `__root.tsx`에서 default `<html lang="ko">`
- 각 라우트에서 `head()` 함수로 `title`, `meta name="description"`, `og:title`, `og:description`, `og:type=article`, `og:image=/og-default.svg`
- `og-default.svg`는 단순 색상 + 사이트명 plain svg
- sitemap.xml / hreflang / JSON-LD는 후속 작업 (한·영 라우팅과 함께 도입)

## 핵심 파일 변경 / 생성 목록

### 수정 (기존)
- [src/styles.css](src/styles.css) — Inter→Pretendard, 다크모드 미디어 쿼리
- [src/routes/__root.tsx](src/routes/__root.tsx) — head meta, JotaiProvider, `<Toaster />`, Header/Footer
- [src/routes/index.tsx](src/routes/index.tsx) — Hero + ServiceCardGrid 사용
- [package.json](package.json) — Inter 제거, 위 신규 패키지 추가

### 신규
- `services/_demo-pay.md`, `services/_demo-courier.md`
- `src/routes/services/$slug.tsx`
- `src/lib/content-collection.ts`, `content-types.ts`, `markdown-pipeline.ts`, `category-style.ts`
- `src/features/home/components/{hero,service-card-grid}.tsx`
- `src/features/service-detail/components/{copy-button,markdown-body,service-meta,token-badge}.tsx`
- `src/components/site/{header,footer}.tsx`
- `src/components/ui/{card,badge,sonner,tooltip}.tsx` — shadcn add로 자동 생성
- `public/og-default.svg`

### 자동 생성
- `src/routeTree.gen.ts` — TanStack Router plugin이 `$slug.tsx` 추가 인식 후 갱신

## Out of Scope (이번 작업이 다루지 않는 것)

- `/en/services/$slug` 영문 라우트
- 카테고리 필터 UI
- 텍스트 검색
- sitemap.xml, hreflang, schema.org JSON-LD
- 다크모드 토글 UI
- 페이지별 동적 og:image
- CONTRIBUTING.md / 작성 가이드
- 실제 서비스(토스·네이버 등) 콘텐츠 — PRD 범위 밖

## 미정 / 작업 중 결정 가능

- **사이트명 / 로고** — PRD OQ-2 미정. 임시 `"ko/design.md"`로 placeholder. OQ-2 확정 후 일괄 치환.
- **GitHub 레포 URL** — 헤더/푸터 링크 자리. 현재 `caesiumy/ko-design-md` 가정. 사용자가 실제 URL 알려주면 교체.
- **카테고리별 그라디언트 색상 매핑** — `category-style.ts`에 1차 결정으로 박아두고, 시각 검수 후 조정.

## Verification

설치 직후 다음을 모두 확인:

1. `pnpm dev` → http://localhost:3000
   - 메인: 히어로 섹션 + 데모 카드 2개 (각 카테고리별 그라디언트 cover) 노출
   - 카드 클릭 → `/services/demo-pay` 이동, 마크다운 본문 렌더링 + 헤딩 옆 anchor 작동
   - 디테일 우상단 Copy 버튼 클릭 → 클립보드에 raw md 복사 + sonner 토스트 표시
   - 토큰 수 (`~3.x k tokens`) 노출
2. Pretendard 폰트 시각 확인 (한글 렌더링 톤이 변경됐는지)
3. `services/_demo-extra.md` 임시 신규 추가 → dev hot reload로 홈 카드에 자동 추가 확인 → 파일 삭제
4. OS 다크모드 토글 → 사이트 색상이 자동 전환됨
5. `pnpm build` → 빌드 성공, dist 정적 결과물 확인
6. `pnpm preview` → prod 빌드 정상 동작
7. `pnpm typecheck` → 0 errors
8. `pnpm lint` → 0 errors

## 후속 작업 (별도 plan으로 분리 예정)

| 단계 | 내용 |
|---|---|
| Phase 2 | 한·영 dual 라우팅 (`/en/services/$slug`) + hreflang + 다국어 frontmatter |
| Phase 3 | 카테고리 필터 UI + 다크모드 토글(jotai atom) |
| Phase 4 | sitemap.xml + JSON-LD + 페이지별 동적 og:image |
| Phase 5 | CONTRIBUTING.md + 작성 가이드 + 예시 PR (V1.x community PR 전환 준비) |
| V1.x | 텍스트 검색, MCP 서버, 패턴/컴포넌트 단위 파일 (PRD Roadmap 참조) |
