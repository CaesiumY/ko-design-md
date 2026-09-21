---
name: 리멤버
slug: remember
category: career
last_updated: "2026-09-21"
created_at: "2026-09-21"
lang: ko
logo: https://getdesign.kr/logos/remember.svg
colors:
  ## 카탈로그 배정 역할 토큰
  primary: oklch(0 0 0) # #000000 — contents000 과 동일값 · 관측된 공개 표면의 주 액션 채움
  dark-primary: oklch(1 0 0) # #FFFFFF — dark-contents000 과 동일값 · 다크에서 뒤집힌 주 액션 채움
  secondary: oklch(0.70 0.200 44) # #FF6A0D — secondary100 · 강조·상태 액센트 · 테마 불변
  ## Brand — primary/secondary
  primary100: oklch(0.00 0.000 0) # #000000
  primary200: oklch(1.00 0.000 0) # #FFFFFF
  secondary100: oklch(0.70 0.200 44) # #FF6A0D
  ## Contents — 전경
  contents000: oklch(0.00 0.000 0) # #000000
  contents100: oklch(0.38 0.000 0) # #424242
  contents150: oklch(0.60 0.000 0) # #808080
  contents200: oklch(0.80 0.000 0) # #BDBDBD
  contents300: oklch(0.87 0.000 0) # #D4D4D4
  contents999: oklch(1.00 0.000 0) # #FFFFFF
  ## Background
  bg-highlight: oklch(0.97 0.034 94) # #FCF5DC
  bg-modal100: oklch(1.00 0.000 0) # #FFFFFF
  bg-modal200: oklch(0.99 0.000 0) # #FAFAFA
  bg-secondary100: oklch(0.97 0.015 55) # #FFF4ED
  bg-tiny-highlight: oklch(0.95 0.056 93) # #FAEDC3
  bg100: oklch(1.00 0.000 0) # #FFFFFF
  bg200: oklch(0.99 0.000 0) # #FAFAFA
  bg300: oklch(0.96 0.000 0) # #F2F2F2
  ## Background — role 표면
  bg-role-ai: oklch(0.98 0.014 304) # #F9F5FF
  bg-role-blue: oklch(0.97 0.017 259) # #EDF4FF
  bg-role-green: oklch(0.96 0.039 176) # #D9FCF2
  bg-role-red: oklch(0.98 0.011 17) # #FFF5F5
  bg-role-yellow: oklch(0.98 0.025 87) # #FFF7E5
  ## Role — 시맨틱 상태
  role-ai: oklch(0.56 0.271 292) # #8133FF
  role-blue: oklch(0.55 0.212 259) # #0B69EB
  role-green: oklch(0.63 0.117 169) # #239E7B
  role-red: oklch(0.64 0.196 24) # #ED4E4E
  role-yellow: oklch(0.81 0.169 78) # #FDB100
  ## Disabled
  disabled: oklch(0.87 0.000 0) # #D4D4D4
  disabled-role-ai: oklch(0.80 0.118 301) # #CCADFF
  disabled-role-blue: oklch(0.82 0.066 248) # #a3c9ee
  disabled-role-green: oklch(0.81 0.056 163) # #a1cdb7
  disabled-role-red: oklch(0.81 0.090 19) # #F7ABAB
  disabled-role-yellow: oklch(0.90 0.115 87) # #fed880
  disabled-secondary: oklch(0.93 0.039 55) # #FFE3D1
  ## Divider
  divider: oklch(0.87 0.000 0) # #D4D4D4
  divider-lite: oklch(0.94 0.000 0) # #EBEBEB
  ## Fixed — 테마 불변
  fixed-bg-white: oklch(1.00 0.000 0) # #FFFFFF
  fixed-black: oklch(0.00 0.000 0) # #000000
  fixed-white: oklch(1.00 0.000 0) # #FFFFFF
  ## Dark theme — 반전 토큰
  dark-bg-highlight: oklch(0.31 0.044 93) # #383015
  dark-bg-modal100: oklch(0.30 0.000 0) # #2E2E2E
  dark-bg-modal200: oklch(0.38 0.000 0) # #424242
  dark-bg-role-ai: oklch(0.26 0.056 299) # #291E3C
  dark-bg-role-blue: oklch(0.29 0.110 258) # #002861
  dark-bg-role-green: oklch(0.38 0.060 171) # #1A4D3E
  dark-bg-role-red: oklch(0.31 0.080 23) # #521D1D
  dark-bg-role-yellow: oklch(0.31 0.044 93) # #383015
  dark-bg-secondary100: oklch(0.26 0.042 52) # #331D0F
  dark-bg-tiny-highlight: oklch(0.39 0.060 91) # #52451D
  dark-bg100: oklch(0.22 0.000 0) # #1A1A1A
  dark-bg200: oklch(0.00 0.000 0) # #000000
  dark-bg300: oklch(0.00 0.000 0) # #000000
  dark-contents000: oklch(1.00 0.000 0) # #FFFFFF
  dark-contents100: oklch(0.94 0.000 0) # #EBEBEB
  dark-contents150: oklch(0.87 0.000 0) # #D4D4D4
  dark-contents300: oklch(0.60 0.000 0) # #808080
  dark-contents999: oklch(0.00 0.000 0) # #000000
  dark-disabled: oklch(0.60 0.000 0) # #808080
  dark-disabled-role-ai: oklch(0.42 0.182 295) # #5829A3
  dark-disabled-role-blue: oklch(0.36 0.077 250) # #1a4065
  dark-disabled-role-green: oklch(0.35 0.063 159) # #17442e
  dark-disabled-role-red: oklch(0.37 0.102 24) # #6B2424
  dark-disabled-role-yellow: oklch(0.41 0.075 84) # #5e4712
  dark-disabled-secondary: oklch(0.33 0.062 51) # #4D2A14
  dark-divider: oklch(0.38 0.000 0) # #424242
  dark-divider-lite: oklch(0.30 0.000 0) # #2E2E2E
  dark-primary100: oklch(1.00 0.000 0) # #FFFFFF
  dark-primary200: oklch(0.00 0.000 0) # #000000
  dark-role-ai: oklch(0.67 0.205 298) # #A770FF
  dark-role-blue: oklch(0.64 0.170 257) # #418AF0
  dark-role-green: oklch(0.74 0.145 167) # #21C798
  dark-role-red: oklch(0.62 0.215 26) # #EB3838
  dark-role-yellow: oklch(0.76 0.138 91) # #D1AD36
gradients:
  bg-role-ai-gradation: "linear-gradient(225deg, oklch(0.54 0.255 314) 0%, oklch(0.69 0.123 220) 100%)"
fonts:
  font-sans: Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif
typography:
  textExtraSmall:
    fontSize: 12px
  textSmall:
    fontSize: 14px
  textMedium:
    fontSize: 16px
  textLarge:
    fontSize: 18px
  textExtraLarge:
    fontSize: 20px
  textDoubleExtraLarge:
    fontSize: 22px
  textTripleExtraLarge:
    fontSize: 30px
  mobileSubCaption:
    fontSize: 11px
    lineHeight: 1.36
  mobileBody12:
    fontSize: 12px
    lineHeight: 1.33
  mobileSubTitle12:
    fontSize: 12px
    lineHeight: 1.25
  mobileBody13:
    fontSize: 13px
    lineHeight: 1.38
  mobileSubTitle13:
    fontSize: 13px
    lineHeight: 1.38
  mobileSubTitle14:
    fontSize: 14px
    lineHeight: 1.36
  mobileBody15:
    fontSize: 15px
    lineHeight: 1.40
  mobileSubTitle16:
    fontSize: 16px
    lineHeight: 1.38
  mobileTitle:
    fontSize: 18px
    lineHeight: 1.28
spacing:
  ## 관측된 간격 리듬 — 발행 토큰 없음
  space-1: 4px # 제품 CSS 관측 — gap 최빈 24회
  space-2: 8px # 제품 CSS 관측 — gap 14회
  space-3: 12px # 제품 CSS 관측 — gap 14회 · padding 빈도 상위
  space-4: 16px # 제품 CSS 관측 — gap 7회
  space-5: 20px # 제품 CSS 관측 — padding 빈도 상위
  space-6: 24px # 제품 CSS 관측 — gap 2회 · padding
  space-8: 32px # 제품 CSS 관측 — padding
  space-10: 40px # 제품 CSS 관측 — gap
  space-12: 48px # 제품 CSS 관측 — gap 2회
rounded:
  ## 관측된 모서리 — 발행 토큰 없음
  radius-xs: 2px # 제품 CSS 관측 — 최소 모서리, 소수 사용
  radius-sm: 4px # 제품 CSS 관측 최빈 14회 — 기본 모서리
  radius-md: 6px # 제품 CSS 관측 8회 — 기본 버튼·칩·토스트
  radius-lg: 8px # 제품 CSS 관측 — 소수 사용
  radius-xl: 10px # 제품 CSS 관측 — 소수 사용
  radius-pill: 30px # 제품 CSS 관측 — 알약형 곡률, 소수 사용
  radius-full: 50% # 제품 CSS 관측 6회 — 전부 아바타
---

## Brand & Style

리멤버는 명함관리 앱에서 출발해 경력채용과 커뮤니티까지 끌어안은 직장인 플랫폼이며, 검정으로 덮은 무채색 화면 위에 오렌지 한 점만 남기는 절제가 그 시각적 서명이다 [src:13][src:1].

운영사는 **(주)리멤버앤컴퍼니**로, 2024-10-16 (주)드라마앤컴퍼니에서 사명을 바꾼 동일 법인이다 [src:17][src:15]. GitHub 조직 슬러그(`dramancompany`)·npm 계정·BI 가이드의 저작권 표기는 여전히 구 사명을 쓴다 [src:10][src:5]. 앱스토어 부제가 제품의 3단 구조를 그대로 노출한다 — "No.1 경력채용, 명함관리, 커뮤니티 앱" [src:13].

BI 가이드라인은 브랜드 성격을 여섯 낱말(POLISHED · INTELLECTUAL · PROFESSIONAL · CLEAR · BOLD · FRIENDLY)로, 페르소나를 다섯 낱말(CONFIDENT · POSITIVE · AGILE · POLISHED · FRIENDLY)로 못박고 코어 밸류를 "노련하고 친절한 커리어 전문가"로 적는다 [src:5]. 슬로건은 "기회가 열린다, 리멤버"이며, 심볼 서사도 같은 은유를 쓴다 — 명함을 상징하던 General Square가 "성공을 위한 기회가 열리는 모습"의 **Remember Square**로 진화하고, 그 스퀘어를 품은 R이 대표 마크가 된다 [src:5]. 아이콘 개선 글은 그 스퀘어를 "다양한 기회가 열리는 '문'"으로 풀어 쓴다 [src:7]. 로고 컬러는 블랙 `oklch(0.00 0.000 0)`(#000000)과 오프화이트 `oklch(0.97 0.011 107)`(#F7F7EF) 둘뿐이고, 가이드는 "리멤버 로고타입의 컬러는 블랙과 오프-화이트만 허용합니다"로 다른 색을 차단한다 [src:5][src:3].

**이 브랜드는 이름이 둘이고 가리키는 대상이 다르다.** 사내·iOS 쪽 이름은 **RDS**로, 띄어쓰기형 `Remember Design System`(프로덕트 디자인팀 2022 1Q 회고)과 붙여쓰기형 `RememberDesignSystem`(iOS SwiftUI 도입기)이 모두 1차 근거로 실재하며, 이름의 하한은 Pretendard 도입기가 "디자인 시스템(RDS)"이라 쓴 2022-01이다 [src:9][src:8][src:6]. 반면 **웹 구현체는 `remember-ui` 패키지와 `--rui-` 토큰 네임스페이스로 출고된다** [src:10][src:12]. 두 이름은 층이 다르므로 웹 토큰 레이어를 RDS라고 부르지 않는다. 현행 값을 담은 공개 디자인 시스템 문서 사이트는 확인되지 않았다.

**발행 아티팩트가 리브랜딩을 따라가지 못했다.** npm `remember-ui`는 2022-04-12에 멈췄고 공개 Storybook 빌드는 2022-10-31인데, 2022-07 리브랜딩 이후의 컬러 값은 두 곳 어디에도 없고 라이브 CSS에만 있다 [src:10][src:11][src:12]. 다만 이것은 두 개의 체계가 아니라 **하나의 체계에 생긴 공백**이다 — 시맨틱 이름(`contents*`), 타입 스텝, 브레이크포인트(768 / 1000px)는 그대로 이어지고 교체된 것은 컬러 값이다 [src:11][src:12][src:1][src:2].

표면마다 밀도가 갈린다. career 계열은 필터와 리스트 중심의 정보 밀도가 높은 화면이고, community 계열은 좌 250 / 중앙 550 / 우 300의 3열 피드다 [src:1][src:2]. 문구 톤은 존댓말에 짧은 명령형을 얹고 숫자와 등급으로 기회의 크기를 말한다 — "직무, 회사를 검색해 주세요" · "프리미엄 대표기업" · "억대 연봉 / 리더급 포지션" [src:1][src:13].

## Colors

리멤버의 팔레트는 **무채색 램프 + 단일 오렌지 액센트**다. 라이브 CSS가 선언하는 `--rui-*` 고유 토큰은 career 표면 기준 40개이고, community 표면의 33개는 그 부분집합이며 공통 33개의 값 불일치는 0건이다 [src:1][src:2]. 현행 값을 담은 발행 토큰 문서는 확인되지 않았으므로 **정본은 라이브 CSS 실측**이다.

**테마 반전이 이 팔레트의 성격 자체다.** 40개 중 34개가 라이트↔다크로 뒤집히고 6개가 불변인데, 불변 쪽에 브랜드 오렌지 `{colors.secondary100}`이 들어 있다 [src:1]. 흑백이 통째로 뒤집히는 동안 오렌지만 자리를 지킨다. 공식 파비콘도 같은 사고방식으로 `@media (prefers-color-scheme: dark)`에서 블랙과 오프화이트를 맞바꾼다 [src:4]. 다크 전용으로만 존재하는 토큰은 0개다 [src:1].

테마 불변 6종은 `{colors.secondary100}`(브랜드 오렌지) · `{colors.contents200}` · `{colors.fixed-black}` · `{colors.fixed-white}` · `{colors.fixed-bg-white}` · `gradients.bg-role-ai-gradation`이다 [src:1]. 나머지는 frontmatter에서 `dark-` 접두로 줄을 갈라 선언했다.

**역할 토큰 `primary`·`secondary`는 이 카탈로그가 관측에서 배정한 것이다.** 근거의 강도가 서로 다르므로 나눠 적는다.

- `{colors.secondary}` = 오렌지는 단단하다. 라이브 토큰 이름이 문자 그대로 `--rui-secondary100`이고 폐기 표시가 없다 [src:1].
- `{colors.primary}` = 블랙은 **관측 논거로 지탱된다**. 2022 Storybook의 `RDS/Color` 스토리가 `primary100`·`primary200`을 `deprecated: true`로 렌더하고 정본을 `contents000`으로 적으며, 현행 CSS의 검정 채움도 실제로 `{colors.contents000}`을 쓴다 [src:12][src:1]. 즉 브랜드가 `primary100`이라는 이름으로 역할을 배정한 것이 아니라, **관측된 공개 표면에서 주 액션 채움이 검정이었다**는 사실이 근거다.

**오렌지의 쓰임은 두 갈래로 갈리고, 둘은 값부터 다르다.** 브랜드 토큰 오렌지 `{colors.secondary100}`은 강조·상태·로딩에 쓰인다 — `:hover` 텍스트, 검색 결과 하이라이트(`mark`), 로딩 진행바의 글로우다 [src:1][src:2]. 오렌지가 버튼 배경인 사례는 관측된 공개 표면에서 **하단 가입 유도 바의 `가입하기` 하나**뿐이고, 그마저 브랜드 토큰이 아니라 하드코딩된 `#FF5414` (≈ `oklch(0.66 0.221 38)`)로 채워진다(`### button-cta-orange` 참고) [src:1]. 게다가 토큰 세트에 `{colors.disabled-secondary}`(오렌지 disabled 틴트)와 `{colors.bg-secondary100}`이 있는데 공개 표면 참조가 0이라, 로그인 뒤에 오렌지 채움 컨트롤이 더 있을 가능성이 남는다 [src:1].

역할별 쓰임 매트릭스(값은 frontmatter가 갖는다):

| 역할 | 라이트 토큰 | 다크 토큰 | 관측된 쓰임 |
| --- | --- | --- | --- |
| 주 액션 채움 | `{colors.contents000}` | `{colors.dark-contents000}` | 검색 버튼 116×52, 선택된 탭 필, 모바일 헤더 [src:1] |
| 액센트 | `{colors.secondary100}` | 동일(불변) | hover 텍스트, `mark` 하이라이트, 로딩바 글로우 [src:1][src:2] |
| 섹션 헤딩 전경 | `{colors.contents100}` | `{colors.dark-contents100}` | 섹션 헤딩 20px/600 [src:1] |
| 보조 전경 | `{colors.contents150}` | `{colors.dark-contents150}` | placeholder, 커뮤니티 메타 12px/500 [src:1][src:2] |
| 입력 표면 | `{colors.bg300}` | `{colors.dark-bg300}` | 검색 입력 배경 [src:1] |
| 구분선 | `{colors.divider}` · `{colors.divider-lite}` | `{colors.dark-divider}` · `{colors.dark-divider-lite}` | 리스트·카드 경계 [src:1] |
| 상태 | `{colors.role-red}` · `{colors.role-yellow}` · `{colors.role-blue}` · `{colors.role-green}` | `dark-` 짝 | 이름에서 읽히는 시맨틱 상태 계열. `bg-role-*`가 같은 이름의 연한 표면을 짝으로 갖는다 [src:1] |
| AI 표면 | `{colors.role-ai}` · `{colors.bg-role-ai}` | `dark-` 짝 | AI 기능 전용 계열 [src:1] |

AI 계열에는 색 토큰과 별도로 그라디언트 한 줄이 있다 — `gradients.bg-role-ai-gradation`은 225° 대각으로 보라에서 시안으로 넘어가며 라이트·다크가 같은 값이다 [src:1]. 단색이 아니라 frontmatter의 `colors:` 맵이 아닌 `gradients:` 키에 둔다.

같은 값을 여러 시맨틱 슬롯이 가리키는 구간이 여럿이다(검정은 `primary100`·`contents000`·`fixed-black`, 흰색은 여섯 슬롯). 이것은 결함이 아니라 라이브 CSS가 각 슬롯을 독립 선언한 결과이므로 그대로 옮겼다 [src:1].

## Typography

**Pretendard가 제품 UI 기본 서체다.** 브랜드 자신의 표현은 "리멤버의 시스템 폰트"이며, 도입 시점은 2022-01-10이다 [src:6][src:7]. 라이브 선언은 `font-sans` 스택 그대로 Pretendard를 첫 자리에 두고 플랫폼 시스템 서체를 뒤에 세운다 [src:1]. 2022 Storybook은 jsDelivr의 `pretendard-dynamic-subset.css`를 웹폰트 진입점으로 로드한다 [src:12].

도입 동기는 브랜딩이 아니라 **플랫폼 이원화 해소**였다. 이전에는 iOS `Apple SD Neo Gothic` / Android `Noto Sans KR`을 나눠 써서 디자이너가 화면을 플랫폼별로 두 벌 만들었고 RDS 컴포넌트도 폰트만 다르게 따로 제작해야 했다 [src:6]. 선정 기준은 ⓐ 상업용 무료 ⓑ iOS 시스템 폰트의 굵기를 모두 커버하는 weight 다양성 ⓒ 한글 정렬의 쏠림을 시각 보정할 수 있는가 세 가지였고, 최종 후보 `Spoqa Han Sans Neo`와 `Pretendard` 중 Pretendard가 양쪽에서 우세했다 [src:6].

**스케일은 2022 발행값이 뼈대이고 현행 관측이 그 부분집합이다.** 2022 패키지가 `textExtraSmall 12px`부터 `textTripleExtraLarge 30px`까지의 데스크톱 스텝과 `mobile*` 계열을 export 했고 [src:11], 현행 CSS에서 관측되는 고유 `font-size`는 **12 · 14 · 16 · 18 · 20px** 다섯 스텝인데 표본을 두 배로 넓혀도 늘지 않았으며 전부 그 발행 스케일 안에 들어간다 [src:1][src:2].

`mobile*` 계열만 크기와 행간을 짝으로 발행했다. frontmatter `typography:`의 `lineHeight`는 아래 발행 px 짝을 크기로 나눈 비율이다 [src:11].

| 스타일 | 발행 크기 / 행간 |
| --- | --- |
| `{typography.mobileSubCaption}` | 11 / 15px |
| `{typography.mobileBody12}` | 12 / 16px |
| `{typography.mobileSubTitle12}` | 12 / 15px |
| `{typography.mobileBody13}` | 13 / 18px |
| `{typography.mobileSubTitle13}` | 13 / 18px |
| `{typography.mobileSubTitle14}` | 14 / 19px |
| `{typography.mobileBody15}` | 15 / 21px |
| `{typography.mobileSubTitle16}` | 16 / 22px |
| `{typography.mobileTitle}` | 18 / 23px |

데스크톱 `text*` 스텝에는 스텝별 행간 대응표가 공개돼 있지 않아 크기만 싣는다. 2022는 절대 px 행간(16/18/21/23px)만 썼는데, 현행은 무단위 비율이 우세해졌다 — 최빈 `1.45`, 그 다음 `1.3`·`1.35`이고 절대 px이 섞인다 [src:11][src:1][src:2].

굵기도 이동했다. 2022는 키워드 `normal`/`bold`였고, 현행 관측은 `400`(최빈) · `600` · `500` · `700`(소수)으로 **bold(700)보다 semibold(600) 우세**다 [src:11][src:1][src:2]. 발행 스텝 이름에 굵기가 대응돼 있지 않아 `typography:` 맵에는 굵기를 싣지 않고, 실측된 컴포넌트 조합만 `## Components`에 적는다.

`letter-spacing` 선언은 관측 범위(SSR 인라인 CSS + 링크 CSS, 벤더 제외)에서 **0건**이다 — 값이 0이라고 발행된 것이 아니라 아예 선언되지 않았으므로 토큰으로 싣지 않는다 [src:1][src:2].

**이름이 붙은 타입 스타일이 실재한다.** 아이콘 글이 stroke 두께 기준으로 `Title2`를 인용하고, iOS 글이 `TypeStyle` enum과 `typeStyle` modifier를 서술한다 [src:7][src:8]. 다만 스텝별 이름↔값 대응표는 공개돼 있지 않다.

## Spacing

**리멤버는 간격을 토큰으로 발행한 적이 없다.** `--rui-*`는 컬러 전용이고 2022 번들도 간격 상수를 export 하지 않는다 [src:1][src:11]. frontmatter `spacing:`의 값은 career + community 표면의 `gap`·`padding` 선언 빈도에서 뽑은 **관측값**이며, `space-1` 같은 **이름은 이 카탈로그가 관측값에 붙인 것**이다.

분포는 축마다 다르다. `gap`은 `{spacing.space-1}`(4px)이 최빈이고 `{spacing.space-2}`·`{spacing.space-3}`이 그 뒤를 이으며, `padding`은 12 · 20 · 8 · 16 · 24 · 32px로 나타난다 [src:1][src:2]. 즉 요소 사이는 잘게, 표면 안쪽은 넓게 잡는 쪽으로 무게중심이 갈린다.

**4px 배수가 우세하지만 그리드는 아니다.** `9px`·`11.5px`·`3px` 같은 오프그리드가 섞여 있고 [src:1], `gap`에는 `6px`·`10px`도 소수로 나타난다 [src:1][src:2]. 뒤의 둘도 4px 배수가 아니라 스케일에 싣지 않았다(`## Known Gaps` 참고). 그래서 "4px 그리드"라고 단정하지 않고 "4px 배수가 우세하며 예외가 있다"로 적는다. 데스크톱 1280px에서 콘텐츠 좌우 여백은 72px로, 이 스케일 밖의 레이아웃 상수다 [src:1].

## Rounded

모서리도 발행 토큰이 아니라 관측값이고 이름은 카탈로그가 붙였다 [src:1][src:11].

곡률은 **작고 두 단계로 갈린다**. `{rounded.radius-sm}`(4px)이 최빈으로 검색 입력과 필터 버튼의 모서리를 맡고, `{rounded.radius-md}`(6px)이 기본 버튼·칩·토스트를 맡는다 [src:1][src:2]. `{rounded.radius-full}`(50%)은 관측된 공개 표면에서 6회 모두 아바타에서 나타나고, 알약형 곡률인 `{rounded.radius-pill}`(30px)은 소수로 나온다 [src:1]. 8·10px도 소수 사례라 체계라기보다 국소값이다.

**아이콘 모서리는 별개 규칙이다** — "아이콘 모서리는 radius를 적용하지 않습니다" [src:7]. UI 컴포넌트의 4·6px과 혼동하면 안 된다.

## Elevation & Depth

**발행된 elevation 체계는 없다.** 아래는 라이브 CSS에서 실측한 그림자 6종이며, 이름은 이 카탈로그가 선언 형태를 보고 붙였다 [src:1][src:2].

```yaml
elevation:
  ## 관측된 그림자 — 발행 elevation 체계 없음
  shadow-1: 0 1px 4px oklch(0 0 0 / 0.1) # rgba(0,0,0,.1)
  shadow-2: 0 4px 12px oklch(0 0 0 / 0.1) # rgba(0,0,0,.1)
  shadow-3: 0 0 16px oklch(0 0 0 / 0.2) # rgba(0,0,0,.2)
  hairline-top: 0 -0.5px 0 var(--rui-contents300) # 블러 0 — 색을 토큰으로 참조하는 경계선
  hairline-inset-bottom: inset 0 -1px 0 var(--rui-bg300) # 블러 0 — 인셋 경계선
  glow-progress: 0 0 10px var(--rui-secondary100), 0 0 5px var(--rui-secondary100) # 로딩 진행바의 오렌지 글로우
```

두 가지가 읽힌다. 첫째, 여섯 중 **둘은 블러가 0**이라 그림자가 아니라 경계선을 `box-shadow` 속성으로 그린다(상단 0.5px 선, 하단 1px 인셋 선) — 리멤버의 깊이 언어에서 divider가 차지하는 비중이 그만큼 크다 [src:1]. 둘째, 여섯 중 유일하게 유채색인 글로우가 `{colors.secondary100}`을 쓴다 — 관측된 공개 표면에서 토큰 오렌지는 깊이 언어에 면이 아니라 빛으로 등장한다 [src:1].

### Motion

```yaml
motion:
  duration-fast: 200ms # 0.2s 와 혼용 선언
  duration-slow: 450ms # 0.45s
  ease-standard: ease-in-out
  ease-decelerate: cubic-bezier(.165,.84,.44,1)
  ease-overshoot: cubic-bezier(.54,1.5,.38,1.11)
```

관측된 지속시간은 200ms와 450ms 두 단계이고, 이징은 표준 `ease-in-out` 외에 감속 곡선과 오버슈트 스프링이 하나씩 있다 [src:1][src:2]. 오버슈트는 제어점 y가 1을 넘어 되튐을 만든다.

## Shapes

리멤버의 형태감은 **각진 쪽**이다. 아이콘 가이드가 그 근거를 직접 말한다 — "리멤버 아이콘의 형태적 특징은 리멤버의 아이덴티티인 카드에서 볼 수 있는 각진 형태와 Pretendard 폰트에서 볼 수 있는 형태적 특징에서 가져왔습니다. 때문에 아이콘 모서리는 radius를 적용하지 않습니다" [src:7]. 명함이라는 원형(原形)이 사각형이고, 심볼도 Remember Square를 품은 R이다 [src:5].

아이콘 체계의 공개된 규칙은 다음과 같다 [src:7].

- **Base grid** 32×32px 픽셀 기반, 1px 격자를 기본 가이드로 사용
- **Padding** 그리드에 4px 포함
- **Key shapes** 세트 전체에 일관된 기본 모양·비율 제공
- **Stroke** 앱에서 아이콘과 가장 많이 쓰이는 `Title2`의 두께에 맞춤
- **Angles** 기본 45°, 필요 시 15°

이 각짐은 **불변의 특질이 아니라 조율된 선택**이다. 2022-07 리브랜딩과 함께 배포된 아이콘 ver1.5는 Filled type · 모서리 깎임 · **-3° 기울임**을 특징으로 했는데, 사용자가 "찌그러져 보인다"고 인지했고 제작 공정이 7단계로 늘어 폐기됐다 [src:7]. 개선 후 UI 아이콘 관련 VOC는 0건, 제작 체감 작업량은 3배 이상 줄었다 [src:7]. 참고 문서로는 IBM Design Language와 Material Design 3을 본문이 직접 인용한다 [src:7].

UI 표면의 곡률은 그 각짐과 일관된다 — 4~6px의 얕은 모서리가 기본이고, 원형은 관측 범위에서 아바타에만 쓰였다 [src:1][src:2]. 관측된 둥근 대형 형태는 선택된 탭의 검정 채움 필 하나다 [src:1].

## Components

공개된 컴포넌트 인벤토리는 두 층에 있다. 2022 Storybook은 고유 스토리 제목 **58개**를 Buttons · Common · Control · Icon · Input · Modal · Logo · RDS 여덟 그룹에 걸쳐 싣고, 그 그룹들에 등장하는 컴포넌트 이름은 Buttons 6 · Common 4 · Control 9 · Icon 1 · Input 5 · Modal 6 · Logo 1 · RDS 2로 합이 **34개**다 [src:12]. npm 패키지가 export 133개 중 내는 컴포넌트도 **34개**이고 hook이 1개(`useDetectScrollPositionTop`)다 [src:11]. 두 수는 세는 대상이 다르다 — 58은 스토리 제목, 34는 컴포넌트다. 현행 iOS RDS는 파운데이션 **Typography · Color · Icon**과 컴포넌트 **Button · Chip · Dialog · Toast · Tooltip · Avatar · Input**으로 구성되며, `DesignSystemGuide`라는 독립 앱 타겟이 카탈로그를 렌더하고 Figma와 코드의 프로퍼티 네이밍이 거의 동일해 검수가 자동화돼 있다 [src:8].

아래 치수는 현행 웹 공개 표면에서 실측한 값이다 [src:1][src:2]. 컴포넌트 이름은 2022 패키지의 것이고 치수는 현행 실측이므로 층이 다르다 — 아래 스니펫은 그 이름으로 재구성한 예시이며, 개별 prop 이름과 타입은 확인하지 못했다 [src:11][src:12].

### button-primary

주 액션. `116×52`, 채움 `{colors.contents000}`, border 없음 [src:1]. 다크에서는 채움이 `{colors.dark-contents000}`으로 뒤집힌다. 오렌지 채움이 아니라 검정 채움인 것이 이 브랜드의 기본값이다.

```tsx
// 2022 패키지의 컴포넌트 이름으로 재구성한 예시 — prop 시그니처는 미확인이다
<BaseButton>검색</BaseButton>
```

### button-base

기본 버튼 치수. `height: 32px; padding: 0 12px; border-radius: 6px` — `{spacing.space-3}` 좌우 패딩에 `{rounded.radius-md}` 모서리다 [src:1][src:2]. 헤더와 리스트의 보조 액션이 이 치수를 공유한다.

### button-secondary-outline

헤더의 `기업 서비스` — `110×32` 아웃라인, `{rounded.radius-md}`, 채움 없음 [src:1]. 검정 헤더 위에서 테두리만으로 존재를 알린다.

### button-header-signup

헤더의 `회원가입` — `72×32`, 흰 채움에 검정 글자, `{rounded.radius-md}` [src:1]. 검정 바 위의 반전 버튼이라 `{colors.contents999}` 채움 + `{colors.contents000}` 글자 조합이다.

### button-cta-orange

하단 가입 유도 바의 `가입하기` — `67×32`, `{rounded.radius-sm}`, **오렌지 채움**이다 [src:1]. 관측된 공개 표면에서 오렌지가 버튼 배경인 유일한 사례이고, 그 값이 브랜드 토큰 `{colors.secondary100}`이 아니라 하드코딩된 `#FF5414` (≈ `oklch(0.66 0.221 38)`)다 [src:1]. 차용할 때는 토큰 쪽을 쓴다.

### search-input

career 히어로의 검색 필드. `817×52`, 배경 `{colors.bg300}`, `{rounded.radius-sm}`, 좌측 아이콘 여백 56px, placeholder `{colors.contents150}` [src:1]. 문구는 "직무, 회사를 검색해 주세요"다 [src:1]. 모바일에서는 풀폭으로 늘어난다.

```tsx
// 2022 패키지의 컴포넌트 이름으로 재구성한 예시 — prop 시그니처는 미확인이다
<BaseInput placeholder="직무, 회사를 검색해 주세요" />
```

### filter-button

리스트 상단 필터. 높이 42px, `{rounded.radius-sm}`, 글자 16px [src:1]. 글자색은 `--rui-*` 토큰이 아니라 하드코딩된 `#222222` (≈ `oklch(0.25 0 90)`)다 [src:1]. career 표면의 정보 밀도를 만드는 주 컨트롤이다.

### chip

커뮤니티 표면의 태그·분류 칩. `{rounded.radius-md}`를 쓰며 `{component.button-base}`와 같은 곡률 계열이다 [src:1][src:2]. Storybook `Common/Chip`과 iOS RDS `Chip`이 같은 이름으로 대응한다 [src:12][src:8].

### toast

`.DcToast` — `padding: 15px 28px; border-radius: 6px; min-width: 324px; opacity: .9` [src:1]. 레거시 표면이라 색을 `--rui-*`가 아니라 2022 이전 팔레트로 하드코딩하고 있다(`## Known Gaps` 참고).

### avatar

`ProfileAvatar`. `{rounded.radius-full}`(50%) 원형으로, 관측 범위에서 완전한 원이 나타나는 유일한 자리다 [src:12][src:1].

### progress-bar

페이지 전환 로딩바(`#nprogress`). `{colors.secondary100}` 선에 같은 색 글로우 `{elevation.glow-progress}`를 얹는다 [src:1]. 토큰 오렌지가 면이 아니라 빛으로 쓰이는 대표 사례다.

### 실측된 타입 조합

같은 크기 스텝이라도 표면에 따라 굵기와 전경색이 갈린다 [src:1][src:2].

| 자리 | 크기 / 굵기 / 전경 |
| --- | --- |
| 섹션 헤딩 | 20px / 600 / `{colors.contents100}` — 검정이 아니다 |
| 카드 제목 | 16px / 400 / `{colors.contents000}` |
| 본문 | 14px / 400 |
| 커뮤니티 메타(최빈) | 12px / 500 / `{colors.contents150}` |

## Do's and Don'ts

**Do** — 표면을 무채색으로 덮고 오렌지를 점으로만 남긴다. 주 액션 채움은 `{colors.contents000}`(다크에서 `{colors.dark-contents000}`), 토큰 오렌지는 hover·하이라이트·진행 표시에 둔다 [src:1][src:2].

**Do** — 테마를 뒤집을 때 반전 34개는 전부 뒤집되 불변 6종(`{colors.secondary100}` · `{colors.contents200}` · `fixed-*` 셋 · AI 그라디언트)은 고정한다. 이 비대칭이 리멤버의 정체성이다 [src:1].

**Do** — 곡률을 얕게 유지한다. 기본은 `{rounded.radius-sm}`, 버튼·칩·토스트는 `{rounded.radius-md}`, 원형은 관측 범위에서 아바타에만 나타났다 [src:1][src:2].

**Do** — 깊이를 블러만으로 표현하지 않는다. `{elevation.hairline-top}`·`{elevation.hairline-inset-bottom}`처럼 블러 0의 경계선을 `box-shadow`로 그리는 쓰임이 실제로 있다 [src:1].

**Do** — 아이콘은 32×32 그리드에 4px 패딩, 모서리 radius 0, 45°(필요 시 15°) 각도로 그린다 [src:7].

**Don't** — 오렌지를 버튼의 기본 채움으로 쓰지 않는다. 브랜드 토큰 오렌지는 강조·상태·로딩 쪽이고, 관측된 공개 표면에서 오렌지 채움 버튼은 하단 가입 유도 바의 CTA 1건뿐이며 그마저 토큰이 아닌 하드코딩 값이다 [src:1].

**Don't** — 로고타입에 오렌지나 제3의 색을 입히지 않는다. 가이드가 블랙과 오프-화이트만 허용하고, 자산은 "변경이나 수정 없이 있는 그대로" 쓰는 것이 원칙이다 [src:5][src:14].

**Don't** — 간격을 "4px 그리드"로 단정하지 않는다. `9px`·`11.5px`·`3px` 오프그리드가 실제로 섞여 있어, 스케일은 우세한 리듬이지 강제 규칙이 아니다 [src:1].

**Don't** — 2022 아티팩트의 값을 현행으로 쓰지 않는다. npm 패키지와 Storybook은 리브랜딩 이후 값을 담고 있지 않고, 폐기된 아이콘 ver1.5의 -3° 기울임도 되살리지 않는다 [src:11][src:12][src:7].

**Don't** — Pretendard를 "리멤버 전용 서체"나 "브랜드 서체"로 서술하지 않는다. 도입 동기는 브랜딩이 아니라 iOS/Android 이원화 해소였고, 브랜드 자신의 표현은 "리멤버의 시스템 폰트"다 [src:6][src:7].

**Don't** — 웹 토큰 레이어를 **RDS라고 부르지 않는다**. RDS는 사내·iOS 쪽 이름이고 웹 구현체는 `remember-ui` 패키지와 `--rui-` 네임스페이스로 출고된다. 두 이름을 뭉뚱그리면 근거 없는 범위 확장이 된다 [src:9][src:8][src:10][src:12].

**Don't (도메인 경계)** — 차용할 것은 시각 처리이지 리멤버의 제품 개념이 아니다. 명함 스캔·스카우트 제안·경력 프로필·연봉 구간 필터("억대 연봉 / 5천 이상 연봉 / 리더급 포지션") 같은 채용·인사 도메인의 흐름과 카피를 관계없는 제품에 그대로 옮기지 않는다 [src:1][src:13]. 무채색 표면과 단일 액센트라는 시각 언어만 가져간다.

## Responsive Behavior

브레이크포인트는 이 항목에서 드문 **발행값 + 현행 확인**의 축이다. 2022 패키지가 `mobileSmallSizeBreak 320px` · `mobileSizeBreak 768px` · `landingMobileSizeBreak 1000px`을 export 했고 [src:11], 현행 CSS에 768px과 1000px이 그대로 살아 있다 [src:1][src:2].

| 폭 | 지위 | Key Changes |
| --- | --- | --- |
| 320px | 2022 발행 `mobileSmallSizeBreak` [src:11] | 최소 지원 폭. 현행 CSS에서 대응 쿼리는 관측되지 않음 |
| ≤767px | 발행 `mobileSizeBreak`의 하단 [src:11], 현행 `max-width:767px`×52 [src:1][src:2] | 통짜 블랙 헤더 + 햄버거, 검색 필드 풀폭, 기업 카드가 가로 캐러셀(카드 220px 고정, 화면 끝에서 잘림), 탭은 검정 채움 필 [src:1] |
| 768~1145px | 현행 신규 range 쿼리 `(max-width:1145px) and (min-width:768px)`×3 [src:1] | 데스크톱 레이아웃의 중간 폭 보정. 2022 발행 목록에 없던 축 |
| ≥1000px | 발행 `landingMobileSizeBreak` [src:11], 현행 ×5 [src:1][src:2] | 랜딩 계열이 데스크톱 구성으로 전환 |
| 1280px(실측) | [src:1][src:2] | 헤더 60px, 콘텐츠 좌우 여백 72px, 검색 입력 `817×52`, 필터 버튼 42px, 프리미엄 기업 4열, 커뮤니티 3열(250 / 550 / 300) |

`480px` 쿼리 6건은 react-toastify(벤더) 것이므로 리멤버의 중단점이 아니다 [src:1].

**터치 타깃 — 소비자가 보완해야 하는 지점이다.** 주 버튼 52px와 필터 42px는 모바일에서 무리가 없지만, `{component.button-base}`·`{component.button-header-signup}`·`{component.button-secondary-outline}`의 32px 높이는 44×44px 권장치에 못 미친다 [src:1]. 이 시각 치수를 그대로 쓰려면 히트 영역을 패딩이나 의사요소로 넓히는 편이 안전하다.

**컴포넌트 축소 전략** — 375~390px 실측에서 확인된 것만 적는다 [src:1].

- 헤더: 데스크톱의 워드마크 + 메뉴 + 버튼 구성이 모바일에서 워드마크 + 햄버거로 접힌다. 배경은 양쪽 모두 검정을 유지한다.
- 검색: 고정폭 `817px`에서 풀폭으로 늘어난다.
- 기업 카드: 데스크톱 4열 그리드가 가로 캐러셀로 바뀐다. 카드 폭을 220px로 고정하고 화면 끝에서 잘라 스크롤 가능함을 알린다.
- 탭: 선택 상태가 검정 채움 필로 표시된다.

## Known Gaps

- **현행 값을 담은 공개 토큰 문서가 없다.** 컬러 40개의 정본은 라이브 CSS 실측이 유일하고, 표본은 로그인 밖 공개 2개 페이지(career 공고 목록 · community 메인)다 [src:1][src:2]. `disabled-secondary`·`bg-secondary100`은 토큰 세트에 있으나 공개 표면 참조가 0이라 로그인 뒤 오렌지 컨트롤이 더 있을 수 있다. BI 가이드라인의 형제 PDF(컬러·타이포 챕터로 추정)는 S3 403이라 **부재가 아니라 미확인**이다 [src:5].
- **2022 폐기 팔레트가 아직 발행물에 남아 있다.** npm `remember-ui@2.1.1`(2022-04-12) dist에 브랜드 오렌지는 0회이고 `secondary100`이 골드 `#e0a526` (≈ `oklch(0.76 0.147 81)`), `primary100`이 준블랙이었다 [src:11]. 2022-10-31 빌드의 Storybook에도 오렌지 0회, 골드 3회다 [src:12]. 즉 **Storybook 빌드는 리브랜딩 이후인데도 이전 팔레트를 싣는다** — 리브랜딩 이전 아티팩트는 npm 최종 발행 하나뿐이다. 보도된 "블랙&화이트에 오렌지를 더했다"는 **BI 층위** 서술이고 [src:16], 그 리브랜딩이 제품 DS 팔레트를 교체했다고 인과로 말하는 1차 문서는 확인되지 않았다.
- **토큰화가 완결되지 않았다 — 실물 4건** [src:1][src:2]. 2022 이전 팔레트를 하드코딩한 `.DcToast`의 `#222` (≈ `oklch(0.25 0 90)`)과 `#EA5128` (≈ `oklch(0.64 0.196 35)`), 하단 가입 유도 바 CTA의 `#FF5414` (≈ `oklch(0.66 0.221 38)`), 커뮤니티 카드 표면의 `#F5F6F8` (≈ `oklch(0.97 0.003 248)`), 본문 글자의 `#222222` (≈ `oklch(0.25 0 90)`)다. 어느 것도 `--rui-*`를 쓰지 않는다.
- **오프그리드 값을 spacing 스케일에서 뺀 것은 이 카탈로그의 판단이다.** `9px`·`11.5px`·`3px`은 실측에 존재하지만 스케일이 아니라 일회성 보정으로 보고 `spacing:` 맵에 넣지 않았고, `gap`의 `6px`·`10px`도 4px 배수가 아니어서 같은 이유로 뺐다 [src:1][src:2]. 다르게 볼 여지가 있다.
- **타입 스케일의 이름↔값 대응표가 공개돼 있지 않다.** `Title2`와 `TypeStyle`의 존재만 확인되며, 발행된 `text*`/`mobile*` 이름이 현행 화면의 어느 스텝에 대응하는지는 추정할 수 없다 [src:7][src:8]. 굵기·letter-spacing도 스텝별 발행값이 없어 토큰에 싣지 않았다.
- **컴포넌트 API 시그니처를 확인하지 못했다.** 2022 타입 선언에 `BaseButtonProps`·`ChipProps`·`SelectProps` 같은 인터페이스가 있다는 것까지는 확인되지만, 개별 prop 이름과 타입은 이 리서치 범위에서 읽지 않았다 [src:11]. `## Components`의 tsx 스니펫이 이름만 재구성한 예시인 이유다.
- **라이선스 상태가 불명확하다.** npm `remember-ui`의 package.json은 `license: MIT`를 선언하지만 tarball에 LICENSE 원문이 없고 Wayback 2020-10-06 스냅샷에도 없어 한 번도 커밋된 적이 없으며, 소스 저장소 `github.com/dramancompany/remember-ui`는 404다 [src:10][src:11]. 브랜드 자산은 무변형 사용이 명시적 원칙이다 [src:5][src:14].

## References

1. https://career.rememberapp.co.kr/job/postings — career 표면 SSR HTML. `--rui-*` 토큰 40개와 컴포넌트 실측 치수의 1차 소스
2. https://community.rememberapp.co.kr/main — community 표면 SSR HTML. 토큰 33개는 [src:1]의 부분집합
3. https://cdn.rememberapp.co.kr/logos/remember/favicon-square.svg — 공식 스퀘어 심볼. 로고 블랙·오프화이트 값
4. https://cdn.rememberapp.co.kr/logos/remember/favicon.svg — 공식 파비콘. `prefers-color-scheme` 반전을 SVG 안에 담는다
5. https://static.rememberapp.co.kr/brand/brand_guideline_logo.pdf — BI 가이드라인(로고 챕터). 슬로건·키워드·심볼 서사·로고 컬러 제한
6. https://tech.remember.co.kr/pretendard-%EC%BB%A4%EC%8A%A4%ED%85%80-%ED%8F%B0%ED%8A%B8-%EB%8F%84%EC%9E%85%EA%B8%B0-beece1515ebc — Pretendard 도입기. 도입 시점과 선정 기준
7. https://tech.remember.co.kr/%EC%82%AC%EC%9A%A9%EC%9E%90-%EB%AA%A8%EB%A5%B4%EA%B2%8C-%EB%A6%AC%EB%A9%A4%EB%B2%84-ui-icon-%EA%B0%9C%EC%84%A0%ED%95%98%EA%B8%B0-12b2274761b8 — 아이콘 개선기. Icon Style 절이 그리드·stroke·각도 규칙 원문
8. https://tech.remember.co.kr/%EB%A6%AC%EB%A9%A4%EB%B2%84-ios%EC%9D%98-swiftui-%EB%8F%84%EC%9E%85%EA%B8%B0-%ED%97%88%EB%93%A4%EC%9D%84-%ED%95%98%EB%82%98%EC%94%A9-%EB%84%98%EA%B8%B0%EB%A9%B0-9784a915d91c — iOS SwiftUI 도입기. 현행 RDS 구성과 `TypeStyle`
9. https://tech.remember.co.kr/%ED%94%84%EB%A1%9C%EB%8D%95%ED%8A%B8-%EB%94%94%EC%9E%90%EC%9D%B8%ED%8C%80-2022-1q-%ED%9A%8C%EA%B3%A0-6abcf62927f6 — 프로덕트 디자인팀 2022 1Q 회고. 띄어쓰기형 `Remember Design System`
10. https://registry.npmjs.org/remember-ui — npm registry 메타. 최종 발행일과 선언된 license 필드
11. https://cdn.jsdelivr.net/npm/remember-ui@2.1.1/dist/index.js — 2022 배포 번들. 타입 스케일·브레이크포인트·구 팔레트의 발행값
12. https://dramancompany.github.io/remember-ui/ — 2022-10-31 빌드 Storybook. 스토리 제목 58개, `primary100` 폐기 표시, Pretendard 웹폰트 CSS 로드
13. https://apps.apple.com/kr/app/id840553277 — 앱스토어. 부제와 설명 문구
14. https://corp.remember.co.kr/contactus — 브랜드 자산 사용 규정
15. https://corp.remember.co.kr/ — 법인 소개. 현 사명 표기
16. https://www.cnet.co.kr/view/?no=20221012144911 — 2022 리브랜딩 보도. 여러 매체가 같은 문장을 신디케이션하므로 1건으로 센다. BI 층위 서술이며 hex 값은 담지 않는다
17. https://zdnet.co.kr/view/?no=20241016111539 — 2024-10-16 사명 변경 보도
