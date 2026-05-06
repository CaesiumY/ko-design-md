# 한국형 design.md 카탈로그 — 방향성 PRD

> 본 문서는 **프로젝트 진행 전에 정리하는 방향성 PRD**입니다.
> 다음은 **이 문서 범위 안**:
> - 진행 방향과 핵심 의사 결정 (target user · positioning · 차별화 · 운영 모드)
> - design.md **schema** (front matter 필드, 본문 섹션 구성)
> - design.md **예시 템플릿** (placeholder 형태의 skeleton)
> - 사이트 IA 방향과 핵심 UX
> - Open Questions (V0 launch 전에 결정 필요)
>
> 다음은 **이 문서 범위 밖**(별도 단계에서 진행):
> - **실제 서비스별 design.md 콘텐츠 작성** (토스·네이버 등 실제 자료 조사·작성)
> - 코드 스캐폴딩 / 프레임워크 선택
> - 도메인·라이선스 세부 등 일부 운영 의사결정 (Open Questions에 명시)

---

## 1. Context

### 무엇이 부족한가
한국 시장용 제품을 만드는 AI 빌더(Claude·Cursor·v0 등)와 디자이너·프론트엔드 개발자는,
한국 풍 화면을 만들거나 패턴을 학습할 때 활용 가능한 **잘 큐레이팅된 LLM 친화적 design.md**가 부족하다.

영문권에는 `getdesign.md`가 있지만 ① 글로벌 서비스 위주, ② 영어 단일,
③ 비공개 큐레이션 → 한국 시그니처 패턴(슈퍼앱·간편결제·B급/캐릭터 감성·풀스크린 모바일·PASS·본인인증·카드형 카루셀 홈 등)이 first-class로 존재하지 않는다.

### 왜 지금 가능한가
- LLM context window가 5~10k tokens 컨텍스트 주입을 일반화한 시점.
- "design.md 1장 → 화면 즉시 생성" 워크플로가 vibe-coding 도구 표준이 되어가는 중.
- MCP가 등장하며 "structured markdown resource"가 호환 표준화 가능.

### 무엇을 노리는가
**한국 서비스의 시그니처 디자인을 LLM 컨텍스트와 사람이 읽기 즐거운 분석으로 동시에 제공하는 오픈소스 design.md 카탈로그.**

형식적 영감은 `getdesign.md`이지만, 차별화는 ① 한국 서비스 only, ② 한·영 이중 언어 (한 default, 영 의역), ③ 한국 특이성을 first-class로, ④ OSS.

---

## 2. Core Principles

이 PRD의 모든 의사결정에 우선 적용되는 다섯 원칙.

1. **AI · 사람 양립 (Positioning)** — 같은 콘텐츠가 LLM에 즉시 주입 가능 + 사람이 읽기에 즐겁다. 두 사용자 중 하나만 만족시키는 결정은 잘못된 결정.
2. **★ Easy-Add Architecture** — design.md 파일을 추후 **드롭인 방식**으로 쉽게 추가할 수 있어야 한다. 새 `.md` 파일을 정해진 위치에 두면 빌드 시 자동으로 라우팅·홈 카드·sitemap·hreflang에 반영. 이 원칙이 사이트 스캐폴딩의 라이브러리·프레임워크 선택을 가이드한다.
3. **한국 특이성을 first-class로** — 슈퍼앱·간편결제·B급/캐릭터·풀스크린·PASS 등 한국 패턴을 비중 있는 영역으로 다룸. 영문판도 단순 번역이 아니라 **의역으로 맥락 보존**.
4. **MCP 호환 가능성을 처음부터 염두** — V0는 MCP 서버를 만들지 않지만, schema·URI·메타 분리 등을 V1.x MCP 노출 시 마찰이 적도록 설계.
5. **Maintainer-only V0 + 미래 OSS 동력 준비** — V0 콘텐츠는 메인테이너 직접 작성. 외부 PR은 V1.x. 단, 가이드·예시 PR은 V0부터 공개해 전환 마찰 ↓.

---

## 3. Goals (V0)

1. 한국 시그니처 서비스를 다루는 design.md 카탈로그 사이트 공개. **라인업 수와 launch criteria**는 maintainer capacity와 quality 양립 기준으로 별도 결정 (OQ-1).
2. 정적 사이트에서 **1클릭 Copy → LLM 붙여넣기**가 가장 자연스러운 핵심 UX.
3. **Easy-Add 아키텍처** — design.md 파일 드롭인이 빌드 자동 반영.
4. design.md schema가 **MCP resource model과 호환** 가능하도록 처음부터 설계 (본 PRD에서 schema 정의).
5. `CONTRIBUTING.md` + 작성 가이드 + 예시 1건을 V0부터 공개해 V1.x community PR 전환 마찰 ↓.

## 4. Non-Goals (V0)

- ❌ MCP 서버 / API endpoint (→ V1.x)
- ❌ 사이트 내 AI chat / 의미 검색
- ❌ Pattern-level / Component-level 파일 (→ V1.x 검토)
- ❌ 외부 PR 수용 (V0에서는 issue·feedback만)
- ❌ 모바일 native 앱
- ❌ 회원·로그인·즐겨찾기·반응 기능
- ❌ **실제 서비스별 design.md 콘텐츠 (토스·네이버 등)** — 본 PRD 범위 밖, 별도 단계에서 작성

---

## 5. Target Users

### Primary — AI 빌더 / 바이브 코더
- 누구: Claude·Cursor·v0·Bolt·Lovable 등으로 한국 시장용 제품을 만드는 사람
- Job-to-be-done: 한국 풍 화면을 LLM으로 생성할 때 컨텍스트로 주입할 단일 출처 markdown이 필요
- 핵심 행동: 사이트 → 적합한 서비스 카드 → Copy → IDE/채팅 붙여넣기

### Secondary (자연 흡수) — 한국 디자이너 / 프론트엔드 개발자
- 누구: 국내 시그니처 서비스의 디자인 철학·패턴을 빠르게 학습/참조하고 싶은 사람
- Job-to-be-done: 카탈로그성 레퍼런스 + 깊이 있는 분석을 한 곳에서 보기
- 핵심 행동: 카드 미리보기 → 디테일 페이지 정독 → 레퍼런스 링크로 이동

> Positioning(한 줄): **"한국 서비스의 시그니처 디자인을 LLM 컨텍스트로, 그리고 사람이 읽기 즐거운 분석으로."**

---

## 6. Core User Stories

1. **AI 빌더의 vibe-coding flow** — "토스 풍 송금 화면이 필요해" → 사이트 카드에서 토스 클릭 → 우상단 **Copy** 버튼 → IDE/채팅 붙여넣기 → "이 컨텍스트를 따라 송금 confirm 화면 만들어줘" → 결과 검수.
2. **디자이너의 학습 flow** — "배민의 디자인이 왜 그렇게 작동하지?" → 카테고리 필터 → 카드 → 디테일 페이지 정독(특히 한국적 맥락 / WHY) → References 링크.
3. **외국인 빌더의 한국 시장 진입 flow** — 우상단 언어 토글 → `/en/services/{slug}` → Copy → 글로벌 LLM 도구 활용. (영문판은 의역 — 한국 특이성을 풀어쓰기로 보존.)

---

## 7. Functional Direction

### 7.1 콘텐츠 (design.md) — Schema 정의

#### Unit
- **Service-level**: 한 서비스 = 한 design.md (e.g., `services/toss.md`).
- 패턴-level / 컴포넌트-level / hierarchical은 V0에서 제외.

#### Format
- Markdown + YAML front matter.
- 인코딩 UTF-8, line ending LF.
- 파일 길이 타깃: **~5k tokens** (Balanced quality bar).

#### Bilingual
- `services/{slug}.md` — 한글, default.
- `services/{slug}.en.md` — 영문, **의역(literal translation 금지)**.
- 각 파일은 LLM 컨텍스트로 독립 사용 가능 (한 파일에 두 언어 섞지 않음).

#### Front matter (필수 필드)

| 필드 | 타입 | 설명 |
|---|---|---|
| `name` | string | 한글 표기 (en 파일은 영문) |
| `slug` | string | URL 안전, 공통 (한·영 동일) |
| `category` | enum | `finance` / `messenger` / `commerce` / `delivery` / `mobility` / `content` / `community` / `travel` / `etc` 중 1 |
| `tier` | 1 \| 2 \| 3 | 1 시그니처 / 2 대표주자 / 3 보조 |
| `last_updated` | YYYY-MM-DD | 본문 마지막 갱신일 |
| `sources` | URL[] | 공식 발표·테크블로그·참고 자료 |
| `related_services` | slug[] | 관련 서비스 slug 목록 |
| `lang` | `ko` \| `en` | 파일 언어 |
| `estimated_tokens` | number | 빌드 타임 자동 계산 가능 |

#### 본문 섹션 (필수, 순서 고정)

1. **디자인 철학** — 한 단락. 이 서비스가 디자인을 보는 관점.
2. **비주얼 언어** — color tokens · typography · iconography · radius/elevation · motion 톤.
3. **핵심 UX 패턴 3~5개** — 서비스 시그니처 인터랙션.
4. **시그니처 컴포넌트** — 대표 UI 빌딩블록 묘사 + 의사코드 또는 Tailwind 스니펫.
5. **대표 화면** — 홈, 핵심 기능 화면 1~2개 묘사 (텍스트로; 스크린샷은 외부 참조).
6. **한국적 맥락 (WHY)** — 다른 시장과 다른 이유. **차별화 핵심**이라 모든 파일 필수.
7. **References** — 출처 링크.

#### 본문 섹션 (선택, 있으면 좋음)
- UX 라이팅 톤 / Voice
- 안티패턴 (이 서비스가 의도적으로 피한 것)
- Edge case / 한국 규제 (PASS, 본인인증, 금융 컴플라이언스 등)
- 변천사

#### 영문판 작성 원칙 (의역)
- 한국 도메인 용어("본인인증/PASS·간편결제·스마트스토어·카카오톡 채널")는 **의미를 풀어쓰는 영문 표현** 사용 (예: "PASS — Korea's mobile-carrier identity verification standard").
- 단순 영어 단어 치환 금지. "왜 이 디자인인가"가 영문에서도 살아 있어야 함.

> **실제 토스·네이버 등의 콘텐츠 작성**은 본 PRD 이후 별도 단계.
> Schema와 예시 템플릿(Appendix B)이 그 작업의 출발점이 된다.

### 7.2 사이트 — 정적 카탈로그

#### Architecture principle (Core Principle 2를 사이트에 적용)
- **File-based content**: `services/` 디렉터리에 새 `.md` 파일을 두면 빌드 시 자동으로:
  - 라우팅 (`/services/{slug}`, `/en/services/{slug}`) 생성
  - 홈 카드 그리드에 추가
  - sitemap.xml · hreflang 갱신
- 이 원칙이 사이트 빌드 도구 선택을 가이드 (예: Astro content collections, Next.js MDX, Nuxt content 류 — 자동 라우팅·콘텐츠 콜렉션 패턴 친화적인 도구가 자연스러운 선택).

#### IA
- `/` — 홈. 카테고리별 카드 그리드 + 한 줄 positioning hero.
- `/services/{slug}` — 한국어 디테일 (default).
- `/en/services/{slug}` — 영문 디테일.
- `/about` — 프로젝트 소개·사용법(LLM에 어떻게 주입)·라이선스·상표 disclaimer.
- `/contributing` — V0 운영 모드 안내 + 작성 가이드 + V1.x PR 전환 시점 표기.

#### 디자인 톤
- 레퍼런스: `luma.com/home`. 카드 그리드, 미니멀 타이포, 색감 풍부, 다크 모드 친화.
- 한·영 토글: 우상단 고정 (모든 페이지 동일 위치).
- 모바일 first.

#### 디테일 페이지의 핵심 UX (V0 핵심 기능)
- **우상단 고정 "Copy design.md" 버튼** — 1클릭 전체 복사 + 성공 토스트.
- 버튼 옆 **토큰 수 표시** ("~5.1k tokens").
- 모델별 권장 표시 ("Claude·GPT-4 적합" 등).
- 섹션 anchor 링크 (V0). **부분 복사**(섹션 단위)는 V1+.

#### 검색·필터
- V0: 카테고리 필터만 (라인업 ≤ ~12개에서는 텍스트 검색 과한 기능).
- V1+: 태그·패턴 검색.

### 7.3 운영 — 큐레이션

- **V0**: maintainer-only 작성. 외부 PR 수용 안 함 (issue·feedback만 환영).
- **라인업 selection criteria** (maintainer 자율 큐레이션 시 충족 기준):
  1. 카테고리 균형 (금융·메신저·커머스·배달·모빌리티·콘텐츠·여행·중고 중 ≥ 5).
  2. 시그니처 패턴 커버리지 (슈퍼앱·미니멀·B급/캐릭터·풀스크린·간편결제·카드 카루셀 홈·콘텐츠+커머스 결합 — 최소 5개).
  3. 자료 접근성 (공식 디자인 시스템·테크블로그 공개 비중 ≥ 50%, reverse-engineering 비중 통제).
- `CONTRIBUTING.md` / 작성 가이드 / 예시 PR 1건을 V0부터 공개. V1.x 전환 시 마찰 ↓.

---

## 8. Non-Functional Requirements

| 항목 | 기준 / 방향 |
|---|---|
| **★ Easy-Add** (1순위) | 새 `.md` 드롭인 → 빌드가 라우팅·홈 카드·sitemap·hreflang 자동 반영 |
| **License (코드)** | MIT 잠정 (OQ-4) |
| **License (콘텐츠)** | CC-BY 4.0 권장 잠정 (OQ-4) |
| **상표·브랜드** | 분석 목적 fair use 한정. README + `/about`에 disclaimer. 로고 직접 호스팅 금지(외부 참조). |
| **성능** | LCP < 1.5s. 정적 빌드. 이미지 lazy + WebP/AVIF. |
| **SEO** | 한·영 hreflang, schema.org JSON-LD, sitemap.xml. |
| **접근성** | WCAG 2.1 AA. 키보드 탐색·focus ring. |
| **반응형** | 모바일 first. |
| **분석** | privacy-friendly self-hosted (Plausible / Umami / PostHog). Copy 클릭 이벤트 별도 측정. (OQ-5) |
| **i18n URL** | `/...` 한 default, `/en/...` 영. |
| **schema 검증** | GitHub Action으로 front matter 필수 필드 + 본문 섹션 헤더 정합성 lint |

---

## 9. Differentiation

| 차원 | getdesign.md (가정) | 한국형 design.md |
|---|---|---|
| 콘텐츠 범위 | 글로벌 서비스 중심 | 한국 서비스 only, 깊이 우선 |
| 큐레이션 | 비공개·proprietary | OSS, 공개 가이드 + 미래 community PR 경로 |
| 언어 | 영어 단일 | 한·영 dual (한 default, 영 의역) |
| 한국 특이성 | 부재 또는 표면적 | 한국 시그니처 패턴이 first-class |
| 라이선스 | TBD | MIT (코드) + CC-BY 4.0 (콘텐츠, 잠정) |
| MCP 호환 | TBD | schema가 처음부터 호환 가능하게 설계 |
| 추가 용이성 | TBD | Easy-Add 아키텍처 (file-based) |

---

## 10. Success Metrics (V0 launch + 3개월)

- **Weekly unique visitors**: 500+
- **Copy events**: 1,000+ / month — *primary metric (사용 의도 직접 신호)*
- **GitHub stars**: 100+
- **한국 dev Twitter / 블로그 / 뉴스레터 자발 언급**: 2~3건
- **품질 신호 (정성)**: 사용자가 design.md를 LLM에 붙여넣어 한국 풍 화면을 생성한 사례 수집 (대시보드까진 아니고 README "Showcase" 정도)

> 라인업 발행 N개는 V0 launch criteria로 별도 결정 (OQ-1).

---

## 11. Roadmap

| 단계 | 핵심 |
|---|---|
| **방향성 PRD (현재)** | 본 문서 확정 |
| **스캐폴딩** | Core Principle 2(Easy-Add) + 7.2의 IA·디자인 톤·Copy UX를 기준 |
| **첫 design.md 1건 작성** | Schema(7.1) + 예시 템플릿(Appendix B) 따라 실제 1개 작성하며 schema fine-tune |
| **V0 launch** | maintainer capacity와 quality 양립하는 라인업 (N은 OQ-1)으로 공개 |
| **V1.0** | community PR 오픈, 라인업 확장, 텍스트 검색 |
| **V1.x** | MCP 서버 (resource spec 호환), 패턴/컴포넌트 단위 파일 검토, 빌더 IDE 직결 |
| **V2** | TBD. 글로벌 fork 가이드 (일본형·동남아형 등) 또는 자체 design.md 빌더 도구 |

---

## 12. Open Questions (이 PRD 이후 결정)

| ID | 질문 | 권장 / 검토 방향 |
|---|---|---|
| OQ-1 | V0 launch criteria — 콘텐츠 N개 발행 후 공개? | maintainer capacity·quality 양립 기준. 후보: "최소 5개"(카테고리 5 충족) / "최소 10개"(시그니처 패턴 풀 커버) |
| OQ-2 | 사이트 도메인 / 프로젝트 이름 | 후보: `ko-design-md`, `kdesign.md`, `한.design`, `getdesign.kr`, `design.kr.dev` 등. 도메인 가용성 + 발음·SEO |
| OQ-3 | 영문판 번역 워크플로 | 사람이 직접 의역 (권장) vs. AI 초안 + 사람 검수 |
| OQ-4 | 라이선스 (코드 / 콘텐츠) | 코드 MIT 잠정. 콘텐츠 CC-BY 4.0 vs CC0 (Showcase 신호 vs 제로 마찰) |
| OQ-5 | 분석 도구 | Plausible / Umami / PostHog. self-hosted + privacy-friendly 우선 |
| OQ-6 | 콘텐츠와 사이트 저장소 분리 여부 | 모노레포 권장 (V0 단순). V1.x community PR 시 분리 검토 |
| OQ-7 | 첫 서비스(파일럿) 선택 | 자료 접근성·시그니처 패턴 모두 풍부한 1개를 골라 schema validation 사이클로 활용. 후보: 토스(공식 자료 풍부, 미니멀 패턴 대표) / 배민(B급 감성 대표) |

---

## 13. Verification (방향성 PRD가 ready인지 체크)

본 PRD가 다음 조건을 만족하면 **다음 단계(스캐폴딩 + 첫 design.md 작성)로 진행 가능**:

- [x] 1차/2차 사용자, positioning, 차별화가 한 문장으로 설명 가능.
- [x] 5개의 Core Principle이 명시되어 있고, 사이트 스캐폴딩 시 의사결정 가이드로 작용 가능.
- [x] design.md schema(front matter 필드, 필수 섹션)가 정의되어 있다.
- [x] 사이트의 Easy-Add 원칙과 IA가 명확.
- [x] V0 운영 모드(maintainer-only)와 V1.x 전환 경로가 정의.
- [x] 예시 템플릿(Appendix B)이 첫 design.md 작성의 출발점으로 충분.
- [x] Open Questions가 항목별로 명시.

(실제 서비스별 콘텐츠·라인업 N·라이선스 세부 등은 후속 단계에서 결정)

---

## Appendix A — Decisions Log

| ID | 질문 | 결정 |
|---|---|---|
| Q1 | 1차 타겟 사용자 | AI 빌더 (1차) + 디자이너·프론트엔드 (2차 흡수) — getdesign.md 본가와 동일 포지션 |
| Q2 | Primary action | Copy & paste from 정적 사이트, MCP는 V1.x로 미룸, schema는 미리 호환 가능하게 |
| Q3 | 콘텐츠 단위 | Service per file |
| Q4 | MVP 라인업 규모 (방향) | 10~12개 수준 (Tier 1 expanded) — V0 launch 최소 N은 OQ-1 |
| Q5 | Quality bar | Balanced (~5k tokens, 철학·시각언어·UX패턴·시그니처 컴포넌트·대표 화면·WHY·References) |
| Q6 | 이중 언어 전략 | 서비스당 두 파일 (`{slug}.md` 한 default + `{slug}.en.md` 영) |
| Q7 | 큐레이션 모델 | Maintainer-only V0 (PR은 V1.x) |
| Q8 | Positioning | "AI·사람 양립" — LLM 컨텍스트 + 사람이 읽기 즐거운 분석 |
| Q9 | 성공 지표 | 사용 신호 우선 (visitors 500+/wk, copy 1k/mo, stars 100+, 자발 언급 2~3건) |
| —  | 사이트 아키텍처 1순위 | **Easy-Add** (드롭인 .md → 빌드 자동 반영) |

---

## Appendix B — design.md 예시 템플릿 (Skeleton)

> **placeholder 형태의 출발점**입니다. 실제 서비스 콘텐츠(토스·네이버 등)는 본 PRD 이후 별도 단계에서 작성.
> `<...>` 안의 텍스트는 그 자리에 들어갈 내용의 안내.

### `services/<slug>.md` (한글, default)

```markdown
---
name: <서비스명, 한글 표기>
slug: <kebab-case-slug>
category: <finance | messenger | commerce | delivery | mobility | content | community | travel | etc>
tier: <1 | 2 | 3>
last_updated: <YYYY-MM-DD>
sources:
  - <공식 발표·테크블로그·디자인 시스템 URL>
  - <...>
related_services: [<slug>, <slug>]
lang: ko
estimated_tokens: <빌드 시 자동 계산>
---

# <서비스명> — design.md

## 디자인 철학
<2~3 문단. 이 서비스가 디자인을 보는 단일 관점. "이 서비스는 ___을 가장 중요하게 본다." 형태로 시작하는 것을 권장.>

## 비주얼 언어
- **Color tokens**: <primary / secondary / surface / text 토큰>
- **Typography**: <font family / weights / scale>
- **Iconography**: <스타일·라이브러리 (예: stroke 1.5px, rounded)>
- **Radius / Elevation**: <token 시스템>
- **Motion**: <톤 (예: subtle ease-out, 200ms 표준)>

## 핵심 UX 패턴
1. **<패턴 이름>** — <한 문장 묘사 + 구체 예시>
2. **<패턴 이름>** — <…>
3. **<패턴 이름>** — <…>
<3~5개. 이 서비스의 시그니처 인터랙션.>

## 시그니처 컴포넌트

### <컴포넌트 이름>
<묘사 1~2 문단>

```tsx
<의사코드 또는 Tailwind 스니펫>
```

### <컴포넌트 이름>
<...>

## 대표 화면
- **<화면 이름 (예: 홈)>**: <묘사 — 레이아웃·계층·핵심 인터랙션>
- **<화면 이름 (예: 핵심 기능 화면)>**: <…>

## 한국적 맥락 (WHY)
<왜 이 디자인이 한국에서 작동하는가. 다른 시장(미국·유럽·일본 등)과 차별되는 이유.
사용자 환경(모바일 한 손 조작·통신·규제 PASS·결제 인프라 등)·문화적 맥락을 풀어쓴다.
모든 파일에서 필수 — 차별화 핵심.>

## References
- <공식 발표 / 테크블로그 / 디자인 시스템 / 컨퍼런스 영상 등 출처 링크>
- <…>
```

### `services/<slug>.en.md` (영문, 의역)

```markdown
---
name: <Service name in English>
slug: <same kebab-case-slug as Korean file>
category: <same enum>
tier: <same>
last_updated: <YYYY-MM-DD>
sources:
  - <same URL list>
related_services: [<same slugs>]
lang: en
estimated_tokens: <auto>
---

# <Service name> — design.md

## Design philosophy
<2-3 paragraphs. NOT a literal translation. The "single lens" the service designs through.>

## Visual language
- **Color tokens**: <…>
- **Typography**: <…>
- **Iconography**: <…>
- **Radius / Elevation**: <…>
- **Motion**: <…>

## Core UX patterns
1. **<Pattern name>** — <…>
2. **<Pattern name>** — <…>
…

## Signature components
### <Component name>
<…>

## Key screens
- **<Screen name>**: <…>

## Korean context (WHY)
<Required section. Explain why this design works in Korea — surface the cultural / regulatory / infrastructural context that a non-Korean reader needs.
Examples: PASS (Korea's mobile-carrier identity verification standard), Korean simple-pay UX, super-app conventions, single-handed mobile usage patterns.
This is where literal translation fails — paraphrase liberally to preserve meaning.>

## References
- <same URL list as Korean file>
```
