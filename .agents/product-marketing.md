# Product Marketing Context

**Document version:** v2
**Last updated:** 2026-08-25

> 이 문서는 marketing 스킬들이 작업 전 먼저 읽는 공유 컨텍스트다. 정본은
> `docs/PRD.md`이고, 이 문서는 그 PRD를 **마케팅 관점으로 번역**한 것이다.
> 둘이 어긋나면 PRD가 이긴다. 카탈로그 항목 수·목록은 의도적으로 쓰지 않는다
> (계속 늘어나 문서가 조용히 낡는다) — 라이브 카탈로그 getdesign.kr 에 위임한다.

## Product Overview

**One-liner:** 한국 서비스의 시그니처 디자인을 LLM 컨텍스트로.

**What it does:** 한국에서 운영되는 브랜드/서비스의 디자인 시스템(컬러·타이포그래피·
간격·컴포넌트·인터랙션 원칙)을 Stitch v0.1 구조화 마크다운 한 장으로 정리해 공개한다.
사용자는 상세 페이지에서 design.md 전체를 한 번의 클릭으로 복사해 LLM에 붙여넣거나,
`use-design-md` 스킬로 코딩 에이전트가 카탈로그를 직접 받아 지금 작업 중인 프로젝트에
그 디자인 언어를 입히게 한다. 항목마다 프리뷰 HTML과 OG 이미지가 함께 보관된다.

**Product category:** 디자인 시스템 레퍼런스 카탈로그 / AI 코딩 에이전트용 컨텍스트 소스.
사람들이 검색하는 말로는 "한국 디자인 시스템 모음", "{브랜드} 디자인 시스템",
"design.md", "AI 코딩 디자인 컨텍스트".

**Product type:** 오픈소스 프로젝트 + 무료 공개 정적 사이트(getdesign.kr) + 배포 가능한
에이전트 스킬(skills.sh · Claude Code 플러그인 마켓플레이스).

**Business model:** 없음. 수익화하지 않는다. "전환"은 결제가 아니라 **사용**이다.

## Target Audience

**Target companies:** 해당 없음(B2C/개발자 개인). 한국 시장용 제품을 만드는 개인 빌더,
소규모 스타트업 팀, 국내 서비스 디자인을 참조하는 디자이너·프론트엔드 개발자.

**Decision-makers:** 구매 결정 없음. 채택 결정은 개인이 즉석에서 내린다 —
링크를 열고 5초 안에 "쓸 만한가"가 판정된다.

**Primary use case:** 한국 풍 화면을 LLM으로 생성할 때 주입할 **단일 출처 마크다운**이
필요한 순간.

**Jobs to be done:**
- "토스 풍 송금 화면"처럼 머릿속 레퍼런스를 LLM이 알아듣는 형식으로 넘기고 싶다
- 국내 서비스가 왜 그렇게 생겼는지 근거(출처 인용)와 함께 빠르게 학습하고 싶다
- 브랜드 디자인 값(색·타이포·간격)을 손으로 눈대중 추출하는 일을 그만하고 싶다

**Use cases:**
- 바이브 코딩: 사이트 → 브랜드 카드 → Copy → IDE/채팅 붙여넣기 → 화면 생성
- 에이전트 자동 적용: `/use-design-md` → 브랜드명만 말하면 현재 repo UI에 적용
- 학습·참조: 상세 페이지 정독 → References 원본 링크로 이동
- 기계 소비: `llms.txt` · `/services/{slug}/DESIGN.md` · `{slug}.tokens.json`

## Personas

| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| AI 빌더 / 바이브 코더 (primary) | 지금 당장 붙여넣을 수 있는 한 덩어리 | LLM이 "한국 앱처럼"을 못 알아들음 | 클릭 한 번으로 복사되는 구조화 컨텍스트 |
| 디자이너 / FE 개발자 (secondary) | 값의 정확성과 출처 | 디자인 시스템 자료가 흩어지고 사라짐 | 인용 붙은 단일 형식 + 프리뷰 |
| 기여자 (OSS) | 기여 마찰이 낮은가 | 새 항목 작성 비용이 큼 | `/design-md` 스킬이 13단계를 자동화 |
| 브랜드 권리자 | 자산이 어떻게 쓰이는가 | 무단 재배포 우려 | 3-tier 라이선스 + 공개 takedown 경로 |

## Problems & Pain Points

**Core problem:** 한국 서비스의 디자인 언어를 LLM에 넘길 형식으로 가진 사람이 없다.
브랜드 디자인 시스템 문서는 ① 있으면 흩어져 있고 ② 형식이 제각각이라 비교가 안 되며
③ 리뉴얼되면 사라진다.

**Why alternatives fall short:**
- getdesign.md — 글로벌 서비스 위주, 영어 단일, 비공개 큐레이션. 한국 시그니처 패턴
  (슈퍼앱·간편결제·본인인증·풀스크린 모바일·카드형 캐러셀 홈)이 first-class가 아니다
- 브랜드 공식 디자인 사이트 — 형식이 브랜드마다 다르고 LLM에 그대로 못 넣는다.
  Storybook·Zeroheight는 크롤조차 잘 안 된다
- 스크린샷을 LLM에 던지기 — 값이 아니라 인상만 전달돼 결과가 매번 다르다
- Figma Community 파일 — 값은 있으나 텍스트 컨텍스트가 아니라 에이전트가 못 읽는다

**What it costs them:** 브랜드 하나의 팔레트·타이포를 손으로 뽑는 데 수십 분에서 몇 시간.
그렇게 뽑아도 출처가 없어 팀 설득에 못 쓴다.

**Emotional tension:** "레퍼런스는 머릿속에 있는데 프롬프트로 옮기면 그 느낌이 안 난다."
결과물이 어딘가 외국 서비스 같아 보이는데 왜인지 짚지 못하는 답답함.

## Competitive Landscape

**Direct:** getdesign.md — 형식적 원본이자 직접 비교 대상. 한국 서비스가 거의 없고,
큐레이션이 비공개라 값의 근거를 따라갈 수 없다.

**Secondary:** 브랜드 자체 디자인 시스템 사이트(토스 product-sans, 라인 디자인 시스템,
KRDS 등) — 원본이라 권위는 최고지만 형식이 통일돼 있지 않고 LLM 주입용이 아니다.
**이들은 경쟁자이자 상류 출처다** — 대체하는 게 아니라 인용한다.

**Indirect:** shadcn/ui · Tailwind 기본 테마 등 범용 디자인 시스템 — "그냥 무난하게"
가는 선택. 한국 시장 제품에서 현지 감각이 빠지는 대가를 치른다.

## Differentiation

**Key differentiators:**
- 한국 서비스 only, 깊이 우선
- 모든 항목이 동일 frontmatter + 섹션 구조 → 비교·검색·임베딩이 가능
- **모든 주장에 `[src:N]` 출처 인용** — 값이 어디서 왔는지 따라갈 수 있다
- OSS(MIT 코드 / CC BY 4.0 콘텐츠) + 공개 기여 파이프라인
- 사람용·기계용 표면을 동시에 발행: 사이트 · `llms.txt` · Google DESIGN.md 표준 라우트
  · 토큰 사이드카 JSON
- CI가 정책을 강제한다 — OKLCH 전용 색 표기, 인용 무결성, 토큰 드리프트, 프리뷰
  반응형까지 기계 게이트

**How we do it differently:** 사람이 눈으로 베끼는 대신, 공개 원본에서 값을 추출하고
인용을 붙여 기계가 검증 가능한 형식으로 고정한다.

**Why that's better:** 값이 틀리면 CI가 잡고, 출처가 없으면 머지가 안 된다.
"AI가 지어낸 디자인 시스템"과 구분되는 지점이 이것이다.

**Why customers choose us:** 무료이고, 링크 하나로 끝나고, 붙여넣으면 실제로 한국 앱처럼
나오기 때문. 그리고 값의 출처를 되짚을 수 있어 팀에 근거로 제시할 수 있다.

## Objections

| Objection | Response |
|-----------|----------|
| "브랜드 디자인을 베끼는 것 아닌가?" | 시각 언어(색·타이포·간격·둥글기)만 차용 대상이고, 제품 개념·플로우·카피는 이식 금지라고 README와 각 항목에 명시. 3-tier 라이선스와 공개 takedown 경로 운영 |
| "값이 정확한가? AI가 지어낸 것 아닌가?" | 모든 주장이 `[src:N]`로 공개 원본을 가리키고, OKLCH 대조·토큰 드리프트·인용 무결성이 CI block |
| "곧 낡지 않나?" | `last_updated` 게이트가 변경된 항목의 날짜 갱신을 강제하고, 재감사 결과를 값 옆 블록쿼트로 남긴다 |
| "내 브랜드는 없는데" | `/design-md` 스킬로 기여 가능. 없는 브랜드를 지어내지는 않는다 |

**Anti-persona:** 한국 시장과 무관한 제품을 만드는 사람. 그리고 "디자인 시스템 하나를
통째로 복제해 서비스를 클론하려는" 사용자 — 라이선스·문서 양쪽에서 명시적으로 거절한다.

## Switching Dynamics

**Push:** 스크린샷 던지기와 눈대중 색 추출이 매번 다른 결과를 내는 데서 오는 피로.
**Pull:** 링크 하나 · 클릭 한 번 · 붙여넣기 한 번. 설치도 가입도 없다.
**Habit:** 이미 쓰던 shadcn 기본값이나 손에 익은 팔레트로 그냥 가는 관성.
**Anxiety:** "이 값이 진짜 그 브랜드 값 맞나?" — 인용과 프리뷰가 이걸 겨냥한다.

## Customer Language

> ⚠️ **이 절은 아직 추정이다.** 사용자 인터뷰·설문을 한 적이 없고, 아래는 PRD의
> user story와 README 문구에서 끌어온 것이다. verbatim이 아니다.
> `customer-research` 스킬로 실제 발화를 수집해 교체할 것.

**How they describe the problem (추정):**
- "토스 풍으로 만들어줘 했는데 토스처럼 안 나와요"
- "한국 앱 느낌이 안 나요"

**How they describe us (추정):**
- "한국 디자인 시스템 모아둔 데"

**Words to use:** 시그니처, 디자인 언어, 컨텍스트, 붙여넣기, 출처, 카탈로그, 차용
**Words to avoid:** 베끼기·클론·복제(라이선스 포지션과 충돌), 혁신적·게임체인저 류
과장, "완벽한 재현"(인용 기반이라 재현이 아니라 기술이다)

**Glossary:**
| Term | Meaning |
|------|---------|
| design.md | 브랜드 하나를 기술한 Stitch v0.1 구조화 마크다운 |
| Stitch v0.1 | 이 카탈로그의 frontmatter + 섹션 규격 |
| DESIGN.md | Google Labs가 발행한 상위 표준. `/services/{slug}/DESIGN.md`로 서빙 |
| `use-design-md` | 카탈로그를 *읽어* 현재 프로젝트에 적용하는 소비자 스킬 |
| `/design-md` | 새 항목을 *만드는* 생산자 스킬. 이 repo 안에서만 동작 |
| 토큰 사이드카 | `services/{slug}.tokens.json` — 기계 소비용 토큰 추출본 |

## Brand Voice

**Tone:** 절제된 · 단정적 · 근거 우선. 과장하지 않고, 모르면 모른다고 쓴다.
**Style:** 직설적이고 기술적. 편집 디자인의 활자 감각(대문자 메타 라벨, 큰 타이틀)을
쓰되 문장은 산문체로 짧게.
**Personality:** 정확한 · 검증 가능한 · 개방적인 · 한국적인 · 도구적인.

## Proof Points

**Metrics:** 계측은 붙어 있으나 **인용할 수 있는 값은 아직 없다** — 이제 막
수집을 시작했기 때문이다(`@vercel/analytics`, 2026-08-25 배선).

- `design_md_copy` — PRD의 primary metric. 두 표면(`design-md-hero`·
  `design-md-tab`)만 이 이름으로 발행되므로 이벤트 총계가 곧 그 지표다.
- `asset_copy` — 토큰 JSON·색상 스와치·스킬 설치 명령. 보조 신호라 KPI와
  이름을 갈랐다. 한 이름으로 묶으면 스와치를 여덟 번 복사한 세션이 전환 8건으로
  읽힌다.
- 페이지뷰 — 이전부터 수집 중.

**값은 아직 비어 있다.** 누적되기 전에 이 문서에 숫자를 옮겨 적지 말 것.

**Customers:** 공개 사용 사례 미수집. README의 Showcase 섹션도 아직 없다.

**Testimonials:** 없음.

**Value themes:**
| Theme | Proof |
|-------|-------|
| 값이 검증된다 | OKLCH 대조·토큰 드리프트·인용 무결성이 CI block |
| 기계가 바로 읽는다 | `llms.txt` · DESIGN.md 라우트 · 토큰 사이드카 JSON |
| 출처를 되짚을 수 있다 | 모든 주장에 `[src:N]`, frontmatter `sources` == References |
| 기여가 자동화돼 있다 | `/design-md` 13단계 파이프라인 + 기계 게이트 |
| 브랜드에 안전하다 | 3-tier 라이선스 · NOTICE · 공개 takedown 경로 |

## Goals

**Business goal:** 한국 시장용 제품을 만들 때 **먼저 열어보는 곳**이 되는 것.
수익 목표 없음.

**Conversion action:** 우선순위 순으로
1. design.md Copy (PRD의 primary metric)
2. `use-design-md` 스킬 설치 (skills.sh / 플러그인 마켓플레이스)
3. GitHub star
4. 새 항목 기여 PR

**Current metrics:** PRD의 V0 목표는 주간 순방문 500+, Copy 1,000+/월, star 100+,
자발 언급 2~3건. 넷 중 셋(트래픽·Copy·스킬 설치)은 **계측 배선이 끝났고 값이 쌓이는
중**이며, star 와 자발 언급은 수동 확인이다. **실측치를 인용하기 전에 대시보드를
먼저 볼 것 — 이 문서에는 아직 값이 없다.**

## Changelog
*Newest first. One line per revision: what changed and why.*
- v2 (2026-08-25) — Proof Points·Goals 갱신: Copy 계측이 실제로 붙어(`design_md_copy`
  ·`asset_copy`) "미계측" 서술이 거짓이 됐다. 값은 아직 비어 있음을 명시.
- v1 (2026-08-24) — Initial context. `docs/PRD.md`·README·소스 실측에서 자동 초안 작성.
  Customer Language는 인터뷰 부재로 추정 표시, Proof Points는 Copy 이벤트 미계측 사실을 명시.
