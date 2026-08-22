---
name: 구름
design_system_name: Vapor UI
slug: vapor-ui
category: developer
last_updated: "2026-08-17"
created_at: "2026-05-10"
sources:
  - https://vapor-ui.goorm.io/
  - https://blog.goorm.io/vapor-figma-seoul/
  - https://www.figma.com/community/file/1508829832204351721/vapor-design-system
  - https://www.npmjs.com/package/@vapor-ui/core
  - https://github.com/goorm-dev/vapor-ui
lang: ko
logo: https://getdesign.kr/logos/goorm.png
colors:
  color-background-canvas: "{colors.color-white}"
  color-background-canvas-dark: "{colors.gray-900}"
  color-background-canvas-200: "{colors.gray-050}"
  color-background-canvas-200-dark: "{colors.gray-800}"
  color-background-overlay-100: "{colors.color-white}"
  color-background-overlay-100-dark: "{colors.gray-800}"
  color-background-primary-100: "{colors.blue-050}"
  color-background-primary-200: "{colors.blue-500}"
  color-background-primary-200-dark: "{colors.blue-500}"
  color-background-secondary-100: "{colors.gray-100}"
  color-background-secondary-100-dark: "{colors.gray-800}"
  color-background-secondary-200: "{colors.gray-200}"
  color-background-secondary-200-dark: "{colors.gray-700}"
  color-background-success-100: "{colors.green-100}"
  color-background-success-200: "{colors.green-500}"
  color-background-success-200-dark: "{colors.green-500}"
  color-background-warning-100: "{colors.orange-100}"
  color-background-warning-200: "{colors.orange-500}"
  color-background-warning-200-dark: "{colors.orange-500}"
  color-background-danger-100: "{colors.red-100}"
  color-background-danger-200: "{colors.red-500}"
  color-background-danger-200-dark: "{colors.red-500}"
  color-background-hint-100: "{colors.gray-100}"
  color-background-hint-100-dark: "{colors.gray-800}"
  color-background-hint-200: "{colors.gray-600}"
  color-background-hint-200-dark: "{colors.gray-600}"
  color-background-contrast-100: "{colors.gray-300}"
  color-background-contrast-100-dark: "{colors.gray-700}"
  color-background-contrast-200: "{colors.gray-800}"
  color-background-contrast-200-dark: "{colors.gray-100}"
  color-foreground-primary-100: "{colors.blue-500}"
  color-foreground-primary-100-dark: "{colors.blue-300}"
  color-foreground-primary-200: "{colors.blue-700}"
  color-foreground-primary-200-dark: "{colors.blue-400}"
  color-foreground-secondary-100: "{colors.gray-800}"
  color-foreground-secondary-100-dark: "{colors.gray-200}"
  color-foreground-secondary-200: "{colors.gray-900}"
  color-foreground-secondary-200-dark: "{colors.gray-100}"
  color-foreground-success-100: "{colors.green-600}"
  color-foreground-success-100-dark: "{colors.green-300}"
  color-foreground-success-200: "{colors.green-700}"
  color-foreground-success-200-dark: "{colors.green-200}"
  color-foreground-warning-100: "{colors.orange-600}"
  color-foreground-warning-100-dark: "{colors.orange-300}"
  color-foreground-warning-200: "{colors.orange-700}"
  color-foreground-warning-200-dark: "{colors.orange-200}"
  color-foreground-danger-100: "{colors.red-600}"
  color-foreground-danger-100-dark: "{colors.red-300}"
  color-foreground-danger-200: "{colors.red-700}"
  color-foreground-danger-200-dark: "{colors.red-200}"
  color-foreground-hint-100: "{colors.gray-600}"
  color-foreground-hint-100-dark: "{colors.gray-400}"
  color-foreground-hint-200: "{colors.gray-700}"
  color-foreground-hint-200-dark: "{colors.gray-300}"
  color-foreground-contrast-100: "{colors.gray-800}"
  color-foreground-contrast-100-dark: "{colors.gray-200}"
  color-foreground-contrast-200: "{colors.gray-900}"
  color-foreground-contrast-200-dark: "{colors.gray-050}"
  color-foreground-normal-100: "{colors.gray-700}"
  color-foreground-normal-100-dark: "{colors.gray-300}"
  color-foreground-normal-200: "{colors.gray-900}"
  color-foreground-normal-200-dark: "{colors.gray-100}"
  color-border-primary: "{colors.blue-500}"
  color-border-primary-dark: "{colors.blue-400}"
  color-border-secondary: "{colors.gray-200}"
  color-border-secondary-dark: "{colors.gray-700}"
  color-border-success: "{colors.green-500}"
  color-border-success-dark: "{colors.green-400}"
  color-border-warning: "{colors.orange-500}"
  color-border-warning-dark: "{colors.orange-400}"
  color-border-danger: "{colors.red-500}"
  color-border-danger-dark: "{colors.red-400}"
  color-border-hint: "{colors.gray-600}"
  color-border-hint-dark: "{colors.gray-500}"
  color-border-contrast: "{colors.gray-800}"
  color-border-contrast-dark: "{colors.gray-200}"
  ## Base palette
  # Gray — 표면·텍스트·디바이더의 기반
  gray-050: oklch(0.976 0.000 0)   # #F7F7F7
  gray-100: oklch(0.910 0.000 0)   # #E1E1E1
  gray-200: oklch(0.827 0.000 0)   # #C6C6C6
  gray-300: oklch(0.715 0.000 0)   # #A3A3A3
  gray-400: oklch(0.670 0.000 0)   # #959595
  gray-500: oklch(0.566 0.000 0)   # #767676
  gray-600: oklch(0.478 0.000 0)   # #5D5D5D
  gray-700: oklch(0.417 0.000 0)   # #4C4C4C
  gray-800: oklch(0.345 0.000 0)   # #393939
  gray-900: oklch(0.269 0.000 0)   # #262626
  # Blue — 브랜드 primary, link, focus ring 앵커
  blue-050: oklch(0.974 0.013 241)   # #EFF8FF
  blue-100: oklch(0.910 0.048 242)   # #C6E6FF
  blue-200: oklch(0.824 0.096 243)   # #8DCDFF
  blue-300: oklch(0.715 0.142 248)   # #51A9F7
  blue-400: oklch(0.669 0.158 252)   # #4198F2
  blue-500: oklch(0.573 0.189 260)   # #2A72E5 · 브랜드 primary
  blue-600: oklch(0.488 0.189 260)   # #0957C8
  blue-700: oklch(0.428 0.187 261)   # #0043B3
  blue-800: oklch(0.358 0.185 263)   # #002B9B
  blue-900: oklch(0.289 0.184 264)   # #000E84
  # Cyan
  cyan-050: oklch(0.974 0.012 210)   # #EEF9FB
  cyan-100: oklch(0.906 0.041 212)   # #C2E8F0
  cyan-200: oklch(0.819 0.080 212)   # #84D2E2
  cyan-300: oklch(0.706 0.119 213)   # #1BB3CC
  cyan-400: oklch(0.659 0.113 214)   # #14A3BC
  cyan-500: oklch(0.558 0.100 220)   # #04819C
  cyan-600: oklch(0.474 0.088 223)   # #006680
  cyan-700: oklch(0.412 0.079 227)   # #00536C
  cyan-800: oklch(0.342 0.071 233)   # #003E57
  cyan-900: oklch(0.268 0.062 241)   # #002941
  # Green — success
  green-050: oklch(0.974 0.016 167)   # #EDFAF4
  green-100: oklch(0.903 0.058 167)   # #BBECD7
  green-200: oklch(0.814 0.109 167)   # #75D9B4
  green-300: oklch(0.704 0.120 167)   # #43B790
  green-400: oklch(0.655 0.117 167)   # #33A782
  green-500: oklch(0.554 0.112 167)   # #058765
  green-600: oklch(0.470 0.101 164)   # #006C4B
  green-700: oklch(0.407 0.090 162)   # #00583A
  green-800: oklch(0.334 0.078 158)   # #004226
  green-900: oklch(0.264 0.069 152)   # #002E13
  # Lime
  lime-050: oklch(0.974 0.026 129)   # #F1FAE8
  lime-100: oklch(0.901 0.097 130)   # #C9ECA8
  lime-200: oklch(0.813 0.182 130)   # #9AD84A
  lime-300: oklch(0.703 0.188 132)   # #71B61A
  lime-400: oklch(0.654 0.179 133)   # #61A613
  lime-500: oklch(0.553 0.163 135)   # #428600
  lime-600: oklch(0.468 0.146 138)   # #276C00
  lime-700: oklch(0.408 0.134 141)   # #115A00
  lime-800: oklch(0.335 0.114 142)   # #004400
  lime-900: oklch(0.261 0.089 142)   # #002E00
  # Yellow / Amber
  yellow-050: oklch(0.978 0.023 85)   # #FFF7E7
  yellow-100: oklch(0.910 0.098 85)   # #FFDD95
  yellow-200: oklch(0.832 0.170 85)   # #FBBD05
  yellow-300: oklch(0.723 0.151 78)   # #D99700
  yellow-400: oklch(0.675 0.143 74)   # #CA8700
  yellow-500: oklch(0.575 0.126 68)   # #A96800
  yellow-600: oklch(0.491 0.113 62)   # #8D4F00
  yellow-700: oklch(0.428 0.106 55)   # #7A3C00
  yellow-800: oklch(0.354 0.098 47)   # #632700
  yellow-900: oklch(0.281 0.094 37)   # #4D1100
  # Orange — warning
  orange-050: oklch(0.979 0.012 51)   # #FFF6F1
  orange-100: oklch(0.913 0.048 46)   # #FFD9C8
  orange-200: oklch(0.836 0.092 46)   # #FCB797
  orange-300: oklch(0.731 0.151 46)   # #F4864F
  orange-400: oklch(0.685 0.177 46)   # #EF6F25
  orange-500: oklch(0.588 0.187 39)   # #D34701
  orange-600: oklch(0.503 0.188 33)   # #B72100
  orange-700: oklch(0.439 0.180 29)   # #9E0000
  orange-800: oklch(0.362 0.148 29)   # #790000
  orange-900: oklch(0.285 0.117 29)   # #560000
  # Red — danger
  red-050: oklch(0.978 0.011 24)   # #FFF5F4
  red-100: oklch(0.915 0.044 20)   # #FFD8D7
  red-200: oklch(0.838 0.089 20)   # #FFB3B2
  red-300: oklch(0.736 0.155 21)   # #FC7D7F
  red-400: oklch(0.691 0.183 20)   # #F8636A
  red-500: oklch(0.591 0.197 22)   # #DA3944
  red-600: oklch(0.505 0.196 24)   # #BB1225
  red-700: oklch(0.439 0.180 28)   # #9E0006
  red-800: oklch(0.362 0.148 29)   # #790000
  red-900: oklch(0.287 0.118 29)   # #570000
  # Pink
  pink-050: oklch(0.978 0.011 3)   # #FFF5F7
  pink-100: oklch(0.918 0.045 1)   # #FFD8E2
  pink-200: oklch(0.840 0.094 2)   # #FFB1C6
  pink-300: oklch(0.737 0.155 2)   # #F77CA3
  pink-400: oklch(0.692 0.181 2)   # #F26394
  pink-500: oklch(0.592 0.188 2)   # #D13E76
  pink-600: oklch(0.506 0.195 2)   # #B5135D
  pink-700: oklch(0.442 0.178 4)   # #9A0047
  pink-800: oklch(0.364 0.146 9)   # #77002D
  pink-900: oklch(0.286 0.114 16)   # #550016
  # Grape
  grape-050: oklch(0.978 0.014 319)   # #FCF5FE
  grape-100: oklch(0.916 0.056 319)   # #F4D8FB
  grape-200: oklch(0.840 0.107 319)   # #E9B4F7
  grape-300: oklch(0.739 0.173 319)   # #D883EF
  grape-400: oklch(0.693 0.202 319)   # #D06BEA
  grape-500: oklch(0.597 0.224 319)   # #B542D1
  grape-600: oklch(0.511 0.229 319)   # #9A1CB7
  grape-700: oklch(0.448 0.217 318)   # #83009F
  grape-800: oklch(0.370 0.182 316)   # #62007E
  grape-900: oklch(0.292 0.146 312)   # #43005E
  # Violet — 워드마크 전용 카노니컬 violet (violet-300)
  violet-050: oklch(0.976 0.014 304)   # #F9F5FF
  violet-100: oklch(0.915 0.051 305)   # #EBDBFF
  violet-200: oklch(0.837 0.102 305)   # #D9B9FF
  violet-300: oklch(0.733 0.152 299)   # #B691FA
  violet-400: oklch(0.686 0.172 295)   # #A480F7
  violet-500: oklch(0.588 0.207 290)   # #805CEC
  violet-600: oklch(0.503 0.208 290)   # #693FCF
  violet-700: oklch(0.442 0.208 290)   # #5929BA
  violet-800: oklch(0.373 0.207 290)   # #4805A3
  violet-900: oklch(0.293 0.170 286)   # #2E007A
  color-white: oklch(1.000 0.000 0)   # #FFFFFF
  color-black: oklch(0.000 0.000 0)   # #000000
typography:
  # size → fontSize / lineHeight
  size-025:
    fontSize: 10px
    lineHeight: 14px
  size-050:
    fontSize: 12px
    lineHeight: 18px
  size-075:
    fontSize: 14px
    lineHeight: 22px
  size-100:
    fontSize: 16px
    lineHeight: 24px
  size-200:
    fontSize: 18px
    lineHeight: 26px
  size-300:
    fontSize: 20px
    lineHeight: 30px
  size-400:
    fontSize: 24px
    lineHeight: 36px
  size-500:
    fontSize: 32px
    lineHeight: 48px
  size-600:
    fontSize: 38px
    lineHeight: 56px
  size-700:
    fontSize: 48px
    lineHeight: 62px
  size-800:
    fontSize: 64px
    lineHeight: 84px
  size-900:
    fontSize: 80px
    lineHeight: 104px
  size-1000:
    fontSize: 120px
    lineHeight: 156px
spacing:
  # 여백 — padding / gap / margin
  size-space-000: 0px
  size-space-025: 2px
  size-space-050: 4px
  size-space-075: 6px
  size-space-100: 8px
  size-space-150: 12px
  size-space-175: 14px
  size-space-200: 16px
  size-space-225: 18px
  size-space-250: 20px
  size-space-300: 24px
  size-space-400: 32px
  size-space-500: 40px
  size-space-600: 48px
  size-space-700: 56px
  size-space-800: 64px
  size-space-900: 72px
  # 크기 — 컨트롤 높이·아이콘 한 변
  size-dimension-025: 2px
  size-dimension-050: 4px
  size-dimension-075: 6px
  size-dimension-100: 8px
  size-dimension-150: 12px
  size-dimension-175: 14px
  size-dimension-200: 16px
  size-dimension-225: 18px
  size-dimension-250: 20px
  size-dimension-300: 24px   # 컨트롤 sm
  size-dimension-400: 32px   # 컨트롤 md
  size-dimension-500: 40px   # 컨트롤 lg
  size-dimension-600: 48px   # 컨트롤 xl
  size-dimension-700: 56px
  size-dimension-800: 64px
rounded:
  size-borderRadius-000: 0px
  size-borderRadius-050: 2px
  size-borderRadius-100: 4px   # 체크박스 md
  size-borderRadius-200: 6px   # 체크박스 lg / 아바타 sm
  size-borderRadius-300: 8px   # 시스템 기본값
  size-borderRadius-400: 12px   # 아바타 lg·xl
  size-borderRadius-500: 16px
  size-borderRadius-600: 20px
  size-borderRadius-700: 24px
  size-borderRadius-800: 32px
  size-borderRadius-900: 40px
---

# Vapor UI — design.md

> 한국의 클라우드 IDE/개발자 교육 회사 goorm(구름)이 운영하는 디자인 시스템. goormIDE·goormEDU·goormLEVEL·goorm Cloud·goorm.co 마케팅 사이트가 단일 시각 언어를 공유하도록 설계되었다 [src:1]. 본 문서의 토큰·컴포넌트 값은 공개 배포물이 1차 출처다 — `@vapor-ui/core` 1.3.0 배포본과 goorm 공식 문서 사이트가 서빙하는 CSS 가 서로를 확인해 준다 [src:4][src:1]. 초판은 Claude Design 핸드오프 번들에서 합성했으나 그 값이 발행값과 어긋나 `## Colors`(2026-07-29)에 이어 나머지 토큰 절과 `## Components`(2026-08-17)를 전량 교체했다.

## Brand & Style

Vapor는 시스템 자체의 정체성을 **opinionated, light-first, very token-driven, proudly Korean-bilingual** 로 정의한다 [src:5]. opinionated는 디자인 결정이 토큰 레벨에서 강하게 박혀 있다는 뜻이고, light-first는 다크 모드가 동등하게 지원되되 1차 환경은 화이트 캔버스라는 의미다. very token-driven은 product-facing 색상이 모두 시맨틱 alias로만 노출되어 raw 팔레트는 새 role을 만들 때만 직접 참조된다는 정책을 가리킨다 [src:5].

대상 사용자는 세 층위다. 디자이너에게는 Figma 라이브러리(`figma.com/community/file/1508829832204351721`)를 [src:3], 개발자에게는 `@vapor-ui/core` 1.3.0을 중심으로 한 6패키지 모노레포(`goorm-dev/vapor-ui`)를, 그리고 product surface를 운영하는 host 팀에게는 `@vapor-ui/css-generator`를 통해 기본 키 팔레트를 자체 브랜드 색으로 교체할 수 있는 토큰 빌드 파이프라인을 제공한다 [src:4][src:5]. 2025년 4월 전담 조직 Vapor Squad가 신설되어 Squad Lead 최준영, CDO 이태성 체제로 운영된다 [src:2].

전체 무드는 **bright, soft white** 로 요약된다 [src:5]. 정보 밀도가 높은 표면(테이블·코드 패널·폼)은 흰 카드 위에 옅은 페이지 배경, 그리고 1px 헤어라인으로 분리되는 패턴이며, 색은 절제되어 있고 시맨틱 팔레트는 상태(primary CTA, success/warning/danger badge, link blue)에만 사용된다 [src:5]. 시스템 표면 자체에는 **그라디언트, 글래스/블러 효과, 텍스처, 장식 일러스트가 없다** [src:5]. 그라디언트가 등장하는 단 두 곳은 Vapor 워드마크 로고와 Getting Started 페이지의 컨셉 히어로다 [src:5]. 트랜스페어런시·블러는 토스트와 다이얼로그 스크림에만 쓰이고 frosted glass나 `backdrop-filter`는 시스템에서 제외된다 [src:5].

Voice는 "factual, didactic, slightly warm"으로 정의된다 [src:5]. 한국어가 1차 언어이고 헤딩과 본문은 존댓말(~니다/~습니다), 버튼은 짧은 명령형 동사("저장", "삭제", "닫기")로 작성한다 [src:5]. 영문 큰 타이틀과 한 줄 한국어 서브타이틀을 페어링하는 bilingual 패턴이 표준이며(예: `Overview` / `Vapor와 우리의 핵심철학을 소개합니다`), 영문 헤딩은 Title Case, 토큰 namespace는 모두 kebab-case 소문자로 통일된다 [src:5]. 본 카탈로그 메타 문서는 Vapor 자체 카피와 달리 `~다` 평서체로 기술하며, Vapor의 존댓말 정책은 product surface 카피에 한해 적용되는 규칙임을 분리해 둔다.

## Colors

> **팔레트 정정(2026-07-29).** 이 절의 값은 원래 핸드오프 번들에서 추출한 것이었고, 공개 발행값과 어긋나 있었다 — 110개 중 ΔE ≤ 0.02로 맞는 건 15개뿐이었고 **46개가 ΔE > 0.05**였다. 어긋남은 계열에 몰려 있었다(violet 8/10, grape 8/10, gray 7/10, pink 7/10인 반면 **cyan은 10/10 일치**). 최대 편차였던 `violet-400`은 번들값이 `oklch(0.494 0.275 295)`, 발행값이 `#A480F7`로 hue만 같고 명도·채도가 크게 달랐다.
>
> **아래 표는 이제 goorm 발행값이다.** `@vapor-ui/core` 1.3.0의 `dist/styles/themes.css.ts.vanilla.css`(라이트 테마)를 기준으로 110개를 전량 교체하고, 각 줄에 출처 hex를 병기했다 [src:4]. docs 사이트가 서빙하는 팔레트 CSS 청크도 같은 값이라 두 공식 채널이 서로를 확인해 준다 [src:1]. 버전 요인도 없다 — 1.3.0과 1.4.0의 팔레트 CSS는 바이트 단위로 동일하다.
>
> 값을 그대로 두는 대신 교체한 이유는 이 문서만 읽히는 게 아니기 때문이다. 사이드카 `vapor-ui.tokens.json`은 사이트 Tokens 탭과 `use-design-md` 스킬이 그대로 소비하는데, 그 경로에는 이런 단서를 실을 자리가 없다 — 산문에 주석을 달아 두어도 Tailwind 테마를 생성하는 쪽에는 어긋난 값만 전달된다. 전량을 공식값으로 맞추면 "제3의 팔레트"가 아니라 공식 팔레트가 된다.
>
> 버전 드리프트도 아니다. 본문은 1.3.0 기준으로 쓰였지만 팔레트를 담은 `dist/styles/themes.css.ts.vanilla.css`는 1.3.0과 1.4.0에서 **바이트 단위로 동일**하다 [src:4] — 어느 쪽을 받아 대조해도 같은 결론이 나온다.
>
> 병기한 hex는 부수 효과가 아니다. 이 토큰들은 원래 hex 주석이 없어 `audit:oklch`가 **하나도 판정하지 못했다**. 이제 110개가 게이트 대상이라 다음 드리프트는 CI가 잡는다.

Vapor는 두 테마(`light`, `dark`) 위에 11-family 베이스 팔레트를 둔다 — Red, Pink, Grape, Violet, Blue, Cyan, Green, Lime, Yellow, Orange, Gray. 각 패밀리는 `050, 100, 200, 300, 400, 500, 600, 700, 800, 900` 10단계 + `color-white`/`color-black` 상수로 구성된다 [src:5]. 브랜드 primary는 **Blue 500**이며, 카노니컬한 violet은 Vapor 워드마크에만 등장한다 [src:5].

product-facing 색은 모두 **시맨틱 alias**로 호출하고 raw 팔레트는 새 role을 만들 때만 직접 노출된다 — 명명 규칙은 `color-{role}-{intent}-{level}`이며 roles는 `background`/`foreground`/`border`, intents는 `primary, secondary, success, warning, danger, hint, contrast, normal`, level은 `100`(soft) / `200`(strong)이다 [src:5].

### Base palette (11 family × 10 step)

위 OKLCH는 `@vapor-ui/core`가 배포하는 hex를 변환한 결과이고, 각 출처 hex는 같은 줄 트레일링 주석에 남겼다 [src:4]. (2026-07-29 이전 리비전은 핸드오프 번들 `colors_and_type.css`의 hex를 옮긴 것이었다 — 위 정정 참조.)

### Semantic alias (light → dark)

aliases는 raw 토큰 이름만 참조한다 — 값은 base palette에서 유래하므로 별도 색 표기를 두지 않는다.

다크 모드는 `data-vapor-theme="dark"` 속성으로 활성화된다 — 라이트는 `:root` 와 `[data-vapor-theme='light']` 가 함께 받는 기본값이다 [src:4]. host 앱은 `@vapor-ui/css-generator`로 빌드 단계에서 기본 키 팔레트(예: blue 패밀리)를 자체 브랜드 색으로 교체할 수 있어 — Vapor의 시맨틱 alias는 그대로 둔 채 시각적 1차 색만 swap된다 [src:5].

## Typography

> **스케일 정정(2026-08-17).** 이 절의 lineHeight 사다리와 스타일 표를 발행값으로 교체했다. 종전 판본은 **fontSize 13단은 전부 맞았으나 lineHeight 는 13단 중 4단만 맞았다** — `size-075` 를 `14px / 20px` 로 적었으나 실제는 `14px / 22px` 이고, 어긋남이 큰 쪽으로 갈수록 벌어져 `size-1000` 은 130px 대 **156px** 이었다. 스타일 표는 존재하지 않는 `vp-*` 클래스 이름에 또 다른 값을 얹고 있었고, 산문이 든 무게 `600` 은 토큰에 없다.
>
> 기준은 `@vapor-ui/core` 1.3.0 배포본의 `dist/styles/themes.css.ts.vanilla.css` 와 `dist/styles/mixins/typography.css.ts.vanilla.css` 이며 [src:4], 문서 사이트가 서빙하는 CSS 청크가 같은 값을 내놓아 두 공식 채널이 서로를 확인해 준다 [src:1]. `## Colors` 를 2026-07-29 에 교체할 때 쓴 것과 같은 기준이다.

폰트 패밀리는 세 갈래로 분리된다 [src:5]. **Sans (web)**는 Pretendard로 한글과 라틴이 단일 metric을 공유한다. **Mono / numerics**는 Inter로 spec 내부의 tabular figure(특히 토큰 표의 OKLCH/HEX 정렬)에 사용된다. **Code blocks**는 Fira Code다. CDN 임포트는 jsdelivr의 Pretendard v1.3.9 + Google Fonts의 Inter, Fira Code 조합이다 [src:5].

무게 토큰은 4단이다 — `fontWeight-400` · `fontWeight-500` · `fontWeight-700` · `fontWeight-800`. **`600` 단은 존재하지 않는다** [src:4][src:1].

토큰화된 사이즈/라인 하이트는 13단계 사다리다 [src:4][src:1]:

시맨틱 스타일은 18종이며 `{component.text}` 의 `typography` prop 으로 호출한다 — 빌드가 클래스 이름을 해시로 발행하므로 host 앱이 문자열로 적어 쓸 수 있는 클래스 API 는 없다 [src:4]:

| 스타일 | size / line | weight | letter-spacing |
|---|---|---|---|
| `display1` | 120 / 156 | 800 | -0.4px |
| `display2` | 80 / 104 | 800 | -0.4px |
| `display3` | 64 / 84 | 800 | -0.4px |
| `display4` | 48 / 62 | 800 | -0.4px |
| `heading1` | 38 / 56 | 700 | -0.4px |
| `heading2` | 32 / 48 | 700 | -0.4px |
| `heading3` | 24 / 36 | 700 | -0.3px |
| `heading4` | 20 / 30 | 700 | -0.2px |
| `heading5` | 18 / 26 | 700 | -0.1px |
| `heading6` | 16 / 24 | 500 | -0.1px |
| `subtitle1` | 14 / 22 | 500 | -0.1px |
| `subtitle2` | 12 / 18 | 500 | 0 |
| `body1` | 16 / 24 | 400 | -0.1px |
| `body2` | 14 / 22 | 400 | -0.1px |
| `body3` | 12 / 18 | 400 | -0.1px |
| `body4` | 10 / 14 | 400 | 0 |
| `code1` | 14 / 22 | 400 | 0 |
| `code2` | 12 / 18 | 400 | 0 |

**18종 전부가 위 사다리의 한 단에 그대로 얹힌다** — 크기와 줄높이를 서로 다른 단에서 가져오는 cross-token 조합은 하나도 없다(종전 판본은 `display4` 와 `h1` 두 건을 "의도적 cross-token" 으로 적었으나 그 짝은 상류에 없다) [src:4]. 같은 단을 쓰는 스타일끼리는 무게로 갈린다 — `heading6`·`body1` 이 `size-100`(16 / 24)을 500·400으로, `subtitle1`·`body2`·`code1` 이 `size-075`(14 / 22)를 500·400·400으로 나눠 쓴다. 스타일에 대응하는 색 규약은 없다 — 색은 `{component.text}` 의 `foreground` 축이 따로 맡는다 [src:4].

Letter-spacing 은 크기가 클수록 타이트해진다 — display 전체와 heading1·2 가 `-0.4px`, heading3 `-0.3px`, heading4 `-0.2px`, 그 아래 본문 계열이 `-0.1px` 이고, 가장 작은 단(`subtitle2` · `body4`)과 code 계열은 `0` 이다 [src:4]. Pretendard에서 한글이 들떠 보이지 않도록 잡는 한글 컨벤션이다 [src:5].

## Spacing

> **스케일 정정(2026-08-17).** 이 절을 발행값으로 교체했다. 종전 판본은 `space` 사다리를 15단으로 적었으나 실제는 **17단**이고(`175` 14px 과 `225` 18px 이 빠져 있었다), 위쪽 세 단이 어긋나 있었다(`700` 64→**56** · `800` 72→**64** · `900` 100→**72**). 발행되지 않는 토큰군 둘도 함께 걷었다 — `size-component-*` 와 `size-borderWidth-*` 는 두 채널 어디에도 없다. 컨트롤 높이의 실제 출처는 아래 `dimension` 군이며, 그 첫 단이 `24px` 이라 종전의 `size-component-sm: 28px` 은 값도 어긋나 있었다.
>
> 기준은 `@vapor-ui/core` 1.3.0 의 `dist/styles/themes.css.ts.vanilla.css` [src:4] 이고 문서 사이트가 서빙하는 CSS 청크가 같은 값을 확인해 준다 [src:1].

베이스 단위는 2px 다. `300`(24px)까지는 2px 간격이 기본이고 `100`→`150`(8→12px)과 `250`→`300`(20→24px) 두 곳에서만 4px 을 건너뛰며, 그 위로는 8px 간격으로 벌어진다 [src:4]. **사다리가 균일하다고 읽지 말 것** — `175`(14px)와 `225`(18px)가 그 2px 간격 안에 실재한다. 치수 축은 여백(`space`)과 크기(`dimension`) 둘로 분리되어 있고, `dimension` 이 컨트롤의 높이·너비를 맡는다 [src:4].

**border width 토큰은 없다** — 1px 헤어라인은 `1px` · `0.0625rem` 리터럴로 직접 적히고, 포커스 링의 2px 도 마찬가지다 [src:4]. Border 정책은 보편적 1px 헤어라인이며 상태 보더는 매칭되는 `color-border-{intent}` 로 강해진다 [src:5]. Figma layout 페이지는 outer gutter 100px, 도큐멘테이션 카드의 inner padding 64px를 기본값으로 둔다 [src:5].

## Rounded

> **토큰 철회(2026-08-17).** 아래 11단은 발행값과 일치하나 종전 판본이 12번째로 싣던 `size-borderRadius-circle: 9999px` 은 **토큰이 아니다** — 두 채널 어디에도 그 이름이 없고, pill 모양이 필요한 컴포넌트는 `9999px` 를 리터럴로 적는다 [src:4][src:1]. 사용 가이드 산문의 귀속도 함께 고쳤다(아래).

스케일은 0px부터 40px까지 11단계다 [src:4]:

기본 사용 가이드 [src:4]: **`300`(8px)이 사실상 시스템 기본값이다** — 버튼(사이즈 무관), 카드, 다이얼로그, 팝오버, 메뉴, 토스트, 툴팁, 콜아웃, 페이지네이션, 탭, 배지 `square` 가 모두 이 한 단을 쓴다. 크기를 따라 커지는 것은 아바타 `square` 뿐이고(`sm` 6 · `md` 8 · `lg`·`xl` 12px), 시트는 `000`(0px)이다. pill 형태(배지 `pill` · 라디오 · 스위치 트랙 · 아이콘 버튼 `circle`)는 토큰이 아니라 `9999px` 리터럴이며, 아바타 `circle` 은 `50%` 다 [src:4].

## Elevation & Depth

> **값 정정(2026-08-17).** `box-shadow-md` 의 y 오프셋이 2px 로 적혀 있었으나 발행값은 **4px** 이고, 스크림 불투명도는 `.4` 가 아니라 **`.32`** 다. 발행되지 않는 토큰군도 걷었다 — **모션 토큰(`motion-duration-*` · `motion-ease-*`)은 두 채널 어디에도 없다.** 상태 변화 정책도 상류와 달랐다(아래). 기준은 1.3.0 배포본 [src:4] 이고 문서 사이트 CSS 청크가 같은 그림자 4단을 확인해 준다 [src:1].

단일 elevation 시스템 4단계이며, 모두 직하 방향 20% 검정으로 통일된다 [src:4]:

```yaml
box-shadow-sm: 0 1px   3px oklch(0 0 0 / .20)
box-shadow-md: 0 4px  10px oklch(0 0 0 / .20)
box-shadow-lg: 0 4px  16px oklch(0 0 0 / .20)
box-shadow-xl: 0 16px 32px oklch(0 0 0 / .20)
```

Inner shadow는 정의되지 않는다 [src:4]. 카드는 그림자 대신 1px 헤어라인 보더에 의존하고, 그림자는 lifted 표면(popover, menu, select·multi-select 팝업, navigation-menu 팝업, toast) 한정으로 사용된다 [src:4]. **다이얼로그와 시트의 패널 그림자는 토큰 변수를 참조하지 않는 리터럴이다** — 값은 `box-shadow-xl` 과 같은 `0 16px 32px oklch(0 0 0 / .20)` 이고, 두 스크림은 검정을 `opacity: .32` 로 깐다 [src:4]. frosted glass·`backdrop-filter`는 시스템에서 제외된다 [src:5].

**모션은 토큰화되어 있지 않다** — 배포본의 전환은 선언 자리에 리터럴로 적힌다. 실제로 쓰이는 시간은 상호작용 오버레이와 입력 ring 이 `150ms`, 팝업 열고 닫기가 `150ms`~`200ms`, 토스트 스택 이동이 `400ms` 이고, 이징은 `ease` · `cubic-bezier(.4, 0, .2, 1)` · `cubic-bezier(.45, 1.005, 0, 1.005)` 세 가지다 [src:4].

상태 변화 정책 [src:4]:

- **Hover** — fill 을 다른 색으로 갈아끼우지 않는다. `{colors.gray-900}` 오버레이를 `::before` 로 얹고 불투명도를 **8%** 로 올린다(밀도가 높은 표면은 4%). transform 없음.
- **Press / active** — 같은 오버레이를 **16%** 로 올린다(밀도가 높은 표면은 8%). scale 없음.
- **Disabled** — `opacity: 0.32` 이고 오버레이가 함께 꺼진다. 읽기 전용은 `{colors.gray-200}` 배경으로 갈린다.
- **Focus-visible** — 2px outline `{colors.foreground-normal-200}` + offset 2px. 입력 계열만 outline 대신 1px inset ring `{colors.border-primary}` 을 쓴다.

## Shapes

기하학은 직각형 우위에 보수적인 라운드를 둔다 — **`{rounded.size-borderRadius-300}`(8px)이 시스템 전반의 기본값이고**, 6px 과 12px 는 체크박스·아바타처럼 크기를 따라 움직이는 자리에만 쓰인다. pill 형태는 토큰이 아니라 `9999px` 리터럴이며 아바타 원형은 `50%` 다 [src:4]. 카드는 흰 표면 위 1px 헤어라인 + 라운드 `300`(8px)이 표준 어휘이고, no-shadow at rest 정책이 카드 표현의 기본값이다 [src:4].

장식의 부재는 의도적이다. 그라디언트·글래스/블러·텍스처·장식 일러스트가 시스템 표면에 일절 등장하지 않으며, 그라디언트는 워드마크와 Getting Started 페이지 컨셉 히어로 두 곳에만 예외적으로 허용된다 [src:5]. 사진 정책은 마케팅 측 goorm 사진의 **clean, daylight, slightly cool, no grain** 톤을 따르되, Vapor 시스템 자체가 강제하는 imagery treatment는 두지 않는다 [src:5].

**Iconography** [src:5] — flat 24×24 monochrome line, 1.5px stroke, React 컴포넌트로 ship된다(`<HeartIcon />`, `<HeartFillIcon />`, `<ChevronDownIcon />` 등). Figma 사용 빈도 1·2위는 `HeartFillIcon`(3120 instances)과 `ChevronDownIcon`(2560 + 2140)이며, fill variant가 outlined 대응으로 존재한다(`Heart` ↔ `HeartFill`). 컴포넌트 안에서 아이콘 크기는 고정값이 아니라 `max(16px, 50%)` 로 컨트롤 크기를 따라간다(`{component.icon-button}` · `{component.pagination}`) [src:4]. 이모지는 제품 UI에서 사용하지 않고 유니코드 글리프를 아이콘 대용으로 쓰지 않는다 — chevron, check, arrow는 모두 SVG다 [src:5].

## Components

> **재저작(2026-08-17).** 이 절은 `@vapor-ui/core` 1.3.0 배포본에서 다시 썼다 — `dist/components/*/*.css.ts.vanilla.css` 35개와 `dist/styles/mixins/` 의 타이포·상호작용 믹스인을 읽고, `dist/styles/themes.css.ts.vanilla.css` 의 CSS 변수 241개를 재귀 해석해 값을 확정했다 [src:4]. 종전 판본은 치수·무게·radius 가 계통적으로 어긋나 있었다(`13px` 8곳과 무게 `600` 9곳은 배포본에 아예 없었고, 단일 사이즈로 적힌 것들이 실제로는 3~4단이었다). 클래스 이름 체계 `vp-*` 도 배포본 553파일에 0건이라 함께 걷어냈다.

**값의 자리 표기.** 이 절의 치수·무게·radius 는 배포본에서 나왔으므로 `[src:4]` 를 단다. 아키텍처·정책 서술(합성 관계, 그림자 배제 원칙 등)은 공개 저장소 `[src:5]` 로 남는다. `--vapor-*-factor` 두 배율은 `@property … initial-value: 1` 이라 아래 픽셀값은 배율 1 기준이다 [src:4]. 이 문단은 감사 메모가 아니라 절의 상시 규약이므로 재감사 때 덮어쓰지 말 것.

`@vapor-ui/core` 1.3.0은 8개 카테고리로 컴포넌트를 노출한다 [src:4][src:5]:

| 카테고리 | 컴포넌트 |
|---|---|
| Layout | Box, Flex, Grid, HStack, VStack |
| Input | Checkbox, Field, InputGroup, MultiSelect, Radio, RadioCard, RadioGroup, Select, SegmentedControl, Switch, TextInput, Textarea |
| Navigation | Breadcrumb, Menu, NavigationMenu, Pagination, Tabs |
| Data Display | Avatar, Badge, Card, Collapsible, Skeleton, Table, Text, Tooltip |
| Feedback | Callout, Dialog, Spinner, Toast |
| Overlay | FloatingBar, Popover, Sheet |
| Button | Button, IconButton |
| Patterns | Form, Form Patterns, Table Patterns, UI Navbar Pattern |

스타일링 레이어는 Base UI(`@base-ui/react`) 프리미티브 위에 Vanilla Extract(`@vanilla-extract/css`, recipes, sprinkles + rainbow-sprinkles)를 얹은 구조이며, React 17/18/19 peer를 모두 지원한다 [src:5]. **클래스 이름은 빌드 시 해시로 발행된다** — 배포본이 내보내는 것은 `.button-rdwa1t7` 같은 생성 클래스와 그것을 variant 이름에 매핑하는 런타임 매니페스트(`*.css.vanilla.js`)이고, host 앱이 문자열로 적어 쓸 수 있는 안정적 클래스 API 는 없다 [src:4]. 컴포넌트는 React 컴포넌트로만 호출한다. 모노레포는 6개 패키지로 분할된다 [src:5]:

| 패키지 | 역할 |
|---|---|
| `@vapor-ui/core` | 컴포넌트 라이브러리 본체 |
| `@vapor-ui/hooks` | React 훅 모음 |
| `@vapor-ui/icons` | SVG 아이콘 세트 |
| `@vapor-ui/codemod` | 자동 마이그레이션 도구 |
| `@vapor-ui/color-generator` | WCAG 팔레트 생성기 (Adobe Leonardo 기반) |
| `@vapor-ui/css-generator` | CSS 변수 생성 도구 (host 앱 키 팔레트 swap) |

### 절 공통 규약

**사이즈 사다리.** 컨트롤 높이는 `sm` 24 · `md` 32 · `lg` 40 · `xl` 48px 한 벌을 공유하고, 좌우 padding 이 8 · 12 · 16 · 24px 로 따라간다 — `{component.button}` · `{component.text-input}` · `{component.select}` · `{component.multi-select}` · `{component.navigation-menu}` · `{component.pagination}` · `{component.tabs}` · `{component.avatar}` 가 이 사다리를 쓴다 [src:4]. 본문 크기는 `sm` 12 / `md`·`lg` 14 / `xl` 16px 이 기본이며 항목별 예외는 해당 항목에 적는다. 아래 3사이즈·2사이즈로 도는 컴포넌트(`{component.badge}` · `{component.switch}` · `{component.checkbox}` · `{component.radio}`)는 이 사다리를 따르지 않는다.

**상호작용.** hover·press 는 fill 을 다른 색으로 갈아끼우지 않는다 — 요소 위에 `{colors.gray-900}` 오버레이를 `::before` 로 깔고 **hover 8% · press 16%** 로 불투명도만 올린다(밀도가 높은 표면은 4% · 8% 로 낮춘 비율을 쓴다). transform·scale 은 쓰지 않고 전환은 `opacity 150ms ease` 다 [src:4].

**포커스.** 일반 컨트롤은 `outline: 2px solid {colors.foreground-normal-200}` + `outline-offset: 2px` 이고, 입력 계열은 outline 대신 **1px inset ring** 을 쓴다 — focus 에서 `{colors.border-primary}`, hover(비포커스)에서 `{colors.gray-900}` 32% 혼합이며 전환은 `box-shadow 150ms` 다 [src:4].

**비활성.** `[data-disabled]` 는 전 컴포넌트 공통 `opacity: 0.32` 이고 hover 오버레이가 함께 꺼진다. 읽기 전용(`[data-readonly]`)은 `{colors.gray-200}` 배경으로 갈린다 [src:4].

**헤어라인.** 카드·팝업·표의 1px 경계는 배포본이 `color-border-normal` 을 참조하며 이는 라이트에서 `{colors.gray-100}`, 다크에서 `{colors.gray-300}` 이다 [src:4]. 이 alias 이름은 `## Colors` 가 아직 발행하지 않는다(`## Known Gaps` 참조).

### button

Button 은 세 축을 곱해 노출한다 — `colorPalette` 6종(primary · secondary · success · warning · danger · contrast) × `variant` 3종(fill · outline · ghost) × `size` 4단이며 기본값은 `primary` / `fill` / `md` 다 [src:4]. 아래 `button-*` 항목들은 이 곱 중 대표 조합을 하나씩 떼어 적은 것이고, `success` · `warning` 팔레트도 같은 방식으로 조합된다.

사이즈는 높이 × 좌우 padding × gap 으로 `sm` 24×8×4 · `md` 32×12×6 · `lg` 40×16×8 · `xl` 48×24×8 이다 [src:4]. **radius 는 사이즈와 무관하게 `{rounded.size-borderRadius-300}` (8px) 하나뿐이다** — 배포본의 button CSS 전체에 radius 선언이 이 한 줄이다. 글자는 `sm`·`md`·`lg` 가 14px / 500 / line-height 22px 로 같고 `xl` 만 16px / 500 / line-height 24px 다. 비활성은 `opacity 0.32`, 포커스는 절 공통 규약을 따른다 [src:4].

```tsx
import { Button } from "@vapor-ui/core";

<Button colorPalette="primary" size="md">저장</Button>
<Button colorPalette="danger" variant="outline" size="sm">삭제</Button>
```

### button-primary

`<Button colorPalette="primary">` (variant 기본값 `fill`). `{colors.background-primary-200}` bg + `{colors.white}` 텍스트다. hover·press 는 색을 바꾸지 않고 절 공통의 검정 오버레이만 얹는다 [src:4].

### button-primary-outline

`<Button colorPalette="primary" variant="outline">`. `{colors.background-canvas}` bg + 1px inset ring 으로 그린 `{colors.border-primary}` 테두리 + `{colors.foreground-primary-200}` 텍스트다. 테두리는 `border` 가 아니라 `box-shadow: inset` 이라 레이아웃 폭을 먹지 않는다 [src:4].

### button-primary-ghost

`<Button colorPalette="primary" variant="ghost">`. bg `transparent` + `{colors.foreground-primary-100}` 텍스트, 테두리 없음 — **ghost 는 outline 보다 한 단 옅은 전경색을 쓴다**(outline 이 `-200`, ghost 가 `-100`). hover 는 오버레이로만 표현된다 [src:4].

### button-secondary

`<Button colorPalette="secondary">`. `{colors.background-secondary-200}` bg + `{colors.foreground-secondary-200}` 텍스트다 [src:4].

### button-danger

`<Button colorPalette="danger">`. `{colors.background-danger-200}` bg + `{colors.white}` 텍스트다 [src:4].

### button-danger-outline

`<Button colorPalette="danger" variant="outline">`. `{colors.background-canvas}` bg + `{colors.border-danger}` inset ring + `{colors.foreground-danger-200}` 텍스트다 [src:4].

### button-contrast

`<Button colorPalette="contrast">`. `{colors.background-contrast-200}` bg + `{colors.white}` 텍스트로, 컬러 표면 위에 얹거나 최대 대비가 필요할 때 쓴다 [src:4]. `outline`·`ghost` 로 쓸 때만 전경이 `{colors.foreground-contrast-200}`·`{colors.foreground-contrast-100}` 로 갈린다 [src:4].

### badge

Badge 의 축은 `colorPalette` 6종(primary · hint · danger · success · warning · contrast) × `size` 3단 × `shape` 2종이며 기본값은 `primary` / `md` / `square` 다 [src:4]. **시각 처리는 한 가지뿐이다** — intent 별로 `{colors.background-{intent}-100}` bg 와 `{colors.foreground-{intent}-200}` 텍스트를 쓰는 옅은 톤이고, 흰 글자를 얹는 진한 변형이나 점(dot) 인디케이터는 배포본에 없다.

사이즈는 높이 × 좌우 padding × gap 으로 `sm` 20×6×2 · `md` 24×8×4 · `lg` 32×12×6 이고, 글자는 `sm`·`md` 가 12px / 500 / line-height 18px, `lg` 가 14px / 500 / line-height 22px 다 [src:4]. `shape` 는 `square` 가 `{rounded.size-borderRadius-300}` (8px), `pill` 이 `9999px` 리터럴다 [src:4].

```tsx
import { Badge } from "@vapor-ui/core";

<Badge colorPalette="success">완료</Badge>
<Badge colorPalette="danger" shape="pill" size="lg">에러</Badge>
```

### text-input

높이·좌우 padding 은 절 공통 사다리를 따르고 글자는 `sm` 12 / `md`·`lg` 14 / `xl` 16px 이다. radius `{rounded.size-borderRadius-300}` (8px), 상하 padding 0, bg `{colors.background-canvas}`, 텍스트 `{colors.foreground-normal-200}`, placeholder `{colors.foreground-hint-100}` 다 [src:4]. **테두리는 `border` 가 아니라 1px inset ring** 이며 focus 에서 `{colors.border-primary}`, hover(비포커스)에서 `{colors.gray-900}` 32% 혼합으로 갈린다. `invalid` 는 별도 recipe 축으로 존재하고, 읽기 전용은 `{colors.gray-200}` bg, 비활성은 `opacity 0.32` 다 [src:4].

### textarea

`{component.text-input}` 의 여러 줄 변형이다 — 같은 radius·ring·상태 규약을 쓰고 `width: 100%`, bg 는 `{colors.background-overlay-100}` 이다. 사이즈별로 상하 padding 이 `sm` 4 · `md` 6 · `lg` 8 · `xl` 14px 로 갈리고 좌우는 공통 사다리(8/12/16/24)를 따르며, 글자는 `sm` 12 / `md`·`lg` 14 / `xl` 16px · 무게 400 이다. `autoResize` 가 별도 축으로 있다 [src:4].

### select

트리거는 공통 사다리(높이 24/32/40/48, 좌우 padding 8/12/16/24)에 gap `sm`~`lg` 8 · `xl` 12px, radius `{rounded.size-borderRadius-300}` (8px), bg `{colors.background-overlay-100}`, 1px inset ring 이다. 값 텍스트는 `sm` 12 / `md`·`lg` 14 / `xl` 16px · 무게 400 이고 placeholder 는 `{colors.foreground-hint-100}`, chevron 은 `sm`·`md` 16 · `lg` 20 · `xl` 24px 다 [src:4].

팝업은 1px `{colors.gray-100}` 헤어라인 + radius 8px + `{elevation.box-shadow-md}` + `{colors.background-overlay-100}` bg + padding 4px 이며 최소 폭은 `max(트리거 폭, 200px)` 다. 옵션은 높이 32px / radius 8px / padding 4px 상하 · 8px 좌우 / 14px · 무게 400 이고 선택 표시는 별도 인디케이터 요소이며 **무게를 올려 강조하지 않는다**. 그룹 라벨은 12px / 500 `{colors.foreground-hint-100}`, 구분선은 1px `{colors.gray-100}` 이다 [src:4].

### multi-select

`{component.select}` 를 다중 선택용으로 확장한 형태다 — 값 영역이 사이즈별 `min-height` 24 · 32 · 40 · 48px 를 잡고 내용이 늘면 아래로 자란다. 값 영역의 상하 padding 은 `sm` 2 · `md` 4 · `lg`·`xl` 8px, 칩 사이 gap 은 4px 다. 옵션 행은 `{component.select}` 와 같은 32px / radius 8px 이고 선택 표시는 16×16 인디케이터다 [src:4]. 팝업·그룹 라벨·구분선 규약도 `{component.select}` 와 같다.

### input-group

입력과 부착 요소를 한 줄로 묶는 `width: 100%` 컨테이너다. 배포본이 자체적으로 스타일을 두는 부분은 글자 수 카운터 하나로, 12px · 무게 400 · line-height 18px 이다 [src:4]. 코너 radius 병합이나 보더 겹침 같은 처리는 배포본 CSS 에 없다 — 결합된 모양은 자식 컨트롤 각자의 규약으로 만들어진다.

### checkbox

2사이즈다 — `md` 16×16 / radius `{rounded.size-borderRadius-100}` (4px), `lg` 24×24 / radius `{rounded.size-borderRadius-200}` (6px)이며 라벨과의 gap 은 8px 다. 기본은 `{colors.background-canvas}` bg + 1px inset ring 이고, checked·indeterminate 에서 ring 을 끄고 `{colors.background-primary-200}` 로 채운다. 체크 글리프는 `{colors.white}` 이며 `md` 8×8 · `lg` 12×12 다. `invalid` + checked 는 `{colors.background-danger-200}` 로 갈린다 [src:4].

### radio

2사이즈 `md` 16×16 · `lg` 24×24, radius `9999px` 리터럴, 라벨 gap 8px 다. 기본은 `{colors.background-canvas}` bg + 1px inset ring, checked 에서 `{colors.background-primary-200}` 로 채우고 안쪽 인디케이터를 `{colors.white}` 원으로 얹는다. `invalid` + checked 는 `{colors.background-danger-200}` 다 [src:4].

### switch

3사이즈다 — 트랙이 `sm` 32×18 · `md` 40×24 · `lg` 56×32, 안쪽 padding 이 `sm` 2 · `md`·`lg` 4px, knob 이 `sm` 14 · `md` 16 · `lg` 24px 다. 트랙은 `9999px` 리터럴 에 idle `{colors.gray-400}` → checked `{colors.background-primary-200}` 이고, knob 은 흰 원 + `0 4px 10px oklch(0 0 0 / .20)` 그림자(값은 `{elevation.box-shadow-md}` 와 같은 리터럴)로 checked 에서 `translateX(100%)` 만큼 이동한다 [src:4].

### radio-card

선택 가능한 카드형 컨트롤이다 — radius `{rounded.size-borderRadius-300}` (8px), 상하 padding 5px · 좌우 12px, 1px inset ring, 텍스트 `{colors.foreground-normal-200}` 이며 hover·press 는 절 공통 오버레이를 따른다. 읽기 전용은 `{colors.gray-200}` bg, 비활성은 `opacity 0.32` 다 [src:4]. 사이즈 축은 없다.

### card

radius `{rounded.size-borderRadius-300}` (8px) + 1px `{colors.gray-100}` 헤어라인 + `{colors.background-overlay-100}` bg 이며 at-rest 그림자는 없다 [src:4]. **padding 은 시스템이 정한다** — header 와 footer 가 `16px 24px`, body 가 `24px` 다 [src:4].

### icon-button

`{component.button}` 을 합성해 만든 정사각 버튼이다 — Button 레시피를 그대로 쓰고 `aspect-ratio: 1 / 1` 과 `padding: 0` 만 덧붙이므로 높이 사다리(24/32/40/48)와 radius 8px 를 Button 에서 물려받는다 [src:4]. 자체 축은 `shape` 하나로, 기본 `square` 는 물려받은 8px 를 유지하고 `circle` 만 `9999px` 리터럴로 덮는다. 안쪽 SVG 는 `max(16px, 50%)` 로 버튼 크기를 따라간다 [src:4].

### tabs

탭 버튼은 높이 사다리(24/32/40/48)를 쓰고 글자는 `sm` 12 · `md`·`lg` 14 · `xl` 16px · 무게 500, gap 6px, 목록 gap 8px 다. 좌우 padding 은 사이즈가 아니라 방향으로 갈려 `horizontal` 4px · `vertical` 16px 이다 [src:4]. 색은 기본 `{colors.foreground-normal-100}`, 활성 `{colors.foreground-primary-100}` 이며 **활성 상태에서 무게를 올리지 않는다**. 활성 표시는 별도 indicator 요소가 맡고 `variant` 가 `line`(기본)이면 얇은 막대, `fill` 이면 radius 8px 의 채운 면이다 [src:4].

### breadcrumb

링크 글자는 `sm` 10 · `md` 12 · `lg` 14 · `xl` 16px · 무게 400 이고, 구분자 아이콘은 `sm` 14 · `md`·`lg` 16 · `xl` 20px 다 [src:4]. 색은 지나온 경로가 `{colors.foreground-hint-100}`, 현재 위치가 `{colors.foreground-primary-100}` 이며, 링크의 focus-visible 은 절 공통 outline 이 아니라 흰 2px + `{colors.foreground-normal-200}` 2px 의 이중 ring 이다 [src:4].

### menu

팝업은 1px `{colors.gray-100}` 헤어라인 + radius `{rounded.size-borderRadius-300}` (8px) + `{elevation.box-shadow-md}` + `{colors.background-overlay-100}` bg + padding 4px 이고 최소 폭은 `max(트리거 폭, 200px)` 다 [src:4]. 항목은 높이 32px / radius 8px / 상하 padding 4px 이며 **좌우 padding 이 비대칭이다** — 왼쪽 20px(선택 표시 자리) · 오른쪽 12px. 글자는 14px · 무게 400 `{colors.foreground-normal-200}`, 그룹 라벨은 12px · 무게 500 `{colors.foreground-hint-200}`, 구분선은 1px `{colors.gray-100}` 다. 하이라이트는 오버레이 8%, 그 위 press 가 16% 다 [src:4]. 서브메뉴 트리거와 서브팝업은 같은 규약을 그대로 쓴다.

### navigation-menu

링크는 높이 사다리(24/32/40/48)에 좌우 padding 8/12/16/24, gap 6px, radius 8px, 글자 `sm` 12 · `md`·`lg` 14 · `xl` 16px · 무게 500 이다 [src:4]. 기본 색은 `{colors.foreground-normal-100}`, 활성은 `{colors.foreground-primary-200}` 이고 bg 는 `transparent` 를 유지한다 — **활성 상태에서 배경을 깔거나 무게를 올리지 않는다**. 목록 gap 은 8px 이며, 펼침 팝업은 radius 8px + `{elevation.box-shadow-md}` + `{colors.background-overlay-100}` bg 에 내용 padding 12px 상하 · 16px 좌우다 [src:4].

### pagination

버튼은 정사각으로 높이 사다리를 그대로 쓴다 — 24 · 32 · 40 · 48px, radius `{rounded.size-borderRadius-300}` (8px), 글자 `sm` 12 · `md`·`lg` 14 · `xl` 16px · 무게 500, 목록 gap 2px 다 [src:4]. 기본 색은 `{colors.foreground-normal-100}` 이고 **현재 페이지는 채워진 원색이 아니라 옅은 톤이다** — `{colors.background-primary-100}` bg + `{colors.foreground-primary-200}` 텍스트. 화살표 SVG 는 `max(16px, 50%)`, 비활성은 `opacity 0.32` 이며 생략 부호도 같은 사이즈 사다리를 따른다 [src:4].

### avatar

높이 사다리를 정사각으로 쓴다 — 24 · 32 · 40 · 48px 에 1px `{colors.gray-100}` 헤어라인, padding 0 이다. `shape` 는 `square`(기본)와 `circle`(50%) 두 가지이고, **`square` 의 radius 는 사이즈를 따라 커진다** — `sm` `{rounded.size-borderRadius-200}` (6px) · `md` `{rounded.size-borderRadius-300}` (8px) · `lg`·`xl` `{rounded.size-borderRadius-400}` (12px) [src:4]. 이미지가 없을 때의 이니셜은 `{colors.white}` 텍스트이며 사이즈별로 12 / 14 / 18 / 20px 이고 **무게가 두 단으로 갈린다** — `sm`·`md` 500, `lg`·`xl` 700 [src:4].

### table

셀과 헤더 셀이 같은 padding 을 쓴다 — 상하 8px · 좌우 24px [src:4]. 글자는 둘 다 14px / line-height 22px 이고 무게와 색만 갈린다 — 본문 셀이 400 `{colors.foreground-normal-200}`, 헤더 셀이 500 `{colors.foreground-normal-100}`. **헤더 배경색과 행 hover 규칙은 배포본에 없다** [src:4].

### callout

radius `{rounded.size-borderRadius-300}` (8px), padding 12px 상하 · 16px 좌우, gap 6px, `width: 100%` 이고 글자는 14px · 무게 500 · line-height 22px 다 [src:4]. intent 6종(primary · success · warning · danger · hint · contrast)마다 1px `{colors.border-{intent}}` 테두리 + `{colors.background-{intent}-100}` bg + `{colors.foreground-{intent}-200}` 텍스트를 함께 갈아끼운다. 아이콘 자리는 높이 22px 로 본문 줄높이에 맞춰져 있다 [src:4].

### popover

1px `{colors.gray-100}` 헤어라인 + radius `{rounded.size-borderRadius-300}` (8px) + `{elevation.box-shadow-md}` + `{colors.background-overlay-100}` bg + padding 12px 상하 · 16px 좌우 + 최소 폭 200px 의 떠오르는 패널이다 [src:4]. 화살표는 8×16px 로 붙는 방향에 따라 회전한다. 타이틀·본문의 별도 타이포 규약은 배포본에 없다 — `{component.text}` 의 typography 축으로 host 가 정한다 [src:4].

### sheet

화면 가장자리에서 슬라이드되는 패널이다 — **radius 는 0** 이고 `{colors.background-overlay-100}` bg 에 `0 16px 32px oklch(0 0 0 / .20)` 그림자(값은 `{elevation.box-shadow-xl}` 과 같은 리터럴)를 쓴다. 좌·우 부착은 폭 300px · 높이 100%, 상·하 부착은 폭 100% · 높이 80svh 다 [src:4]. 헤더는 상 20px · 하 8px · 좌우 12px, 본문과 푸터는 상하 8px · 좌우 12px 이며 스크림은 검정 32% 다 [src:4].

### dialog

스크림은 `{colors.black}` 을 `opacity: 0.32` 로 깐다. 패널은 radius `{rounded.size-borderRadius-300}` (8px) + `0 16px 32px oklch(0 0 0 / .20)` 그림자(값은 `{elevation.box-shadow-xl}` 과 같은 리터럴) + `{colors.background-overlay-100}` bg 이며 최대 높이 80vh, 최대 폭은 뷰포트에서 좌우 2rem 씩 뺀 값이다 [src:4]. **폭은 3단으로 갈린다** — `md` 500 · `lg` 800 · `xl` 1140px. 헤더는 높이 56px · 좌우 padding 24px · gap 12px, 본문은 좌우 24px, 푸터는 상하 16px · 좌우 24px 다. 타이틀 18px / 700, 설명 14px / 400 이며 `backdrop-filter`·frosted glass 는 시스템에서 제외된다 [src:4][src:5].

### toast

lifted 표면이라 그림자가 적용되는 몇 안 되는 컴포넌트다 — radius `{rounded.size-borderRadius-300}` (8px) + `{elevation.box-shadow-md}` + padding 16px 이고, 뷰포트가 폭 400px 를 잡아 여러 개가 쌓인다 [src:4]. **배경이 intent 로 갈린다** — 기본 `info` 는 `{colors.background-contrast-200}`, `success` 는 `{colors.background-success-200}`, `danger` 는 `{colors.background-danger-200}` 다. 타이틀·설명은 둘 다 14px / line-height 22px `{colors.white}` 이고 무게만 500 · 400 으로 갈린다. 진입·퇴장은 `translateY(-150%)` + opacity 이며 스와이프 해제를 지원한다 [src:4].

### tooltip

`{colors.background-contrast-200}` 배경 + 흰 텍스트, radius `{rounded.size-borderRadius-300}` (8px), padding 6px 상하 · 8px 좌우, 글자 12px · **무게 400** · line-height 18px 의 단일 변형이다 [src:4]. 화살표도 같은 배경색을 따라간다. frosted/blur 스타일 변형은 의도적으로 제공되지 않는다 [src:5].

```tsx
import { Tooltip, Card, Text } from "@vapor-ui/core";

<Tooltip content="삭제하면 복구할 수 없습니다">
  <Button colorPalette="danger" variant="outline">삭제</Button>
</Tooltip>

<Card>
  <Text typography="heading3">제목</Text>
  <Text typography="body2">본문 텍스트는 body2가 기본값입니다.</Text>
</Card>
```

## Do's and Don'ts

**Do**

- product-facing 색은 시맨틱 alias(`{colors.background-{intent}-{level}}` / `{colors.foreground-{intent}-{level}}` / `{colors.border-{intent}}`)로만 호출한다 — raw 팔레트 직접 참조는 새 role을 만들 때만 허용한다 [src:5].
- `{component.card}`는 그림자 대신 1px 헤어라인 보더(라이트에서 `{colors.gray-100}`)로 분리한다 [src:4].
- 그림자는 lifted 표면(`{component.popover}` · `{component.menu}` · `{component.select}` · `{component.navigation-menu}` 팝업 · `{component.toast}`)에만 적용한다 — `{component.card}` · `{component.text-input}` · `{component.button}`에는 at-rest 그림자를 두지 않는다 [src:4].
- 한국어가 1차 언어인 product 카피는 존댓말(~니다/~습니다)로 작성하고, 버튼은 짧은 명령형 동사("저장", "삭제", "닫기")로 통일한다 [src:5].
- bilingual 헤드라인 페어링을 사용한다 — 영문 한 줄 + 한국어 한 줄, 영문은 Title Case [src:5].
- host 앱의 1차 색을 바꿔야 한다면 `@vapor-ui/css-generator`로 빌드 단계에서 키 팔레트(blue 패밀리 등)만 swap한다 — 시맨틱 alias 이름은 유지한다 [src:5].
- focus-visible은 2px `{colors.foreground-normal-200}` outline + 2px offset을 항상 보이게 둔다 [src:4]. 입력 계열만 예외로 1px inset ring `{colors.border-primary}` 을 쓴다.
- 버튼 radius 는 사이즈와 무관하게 `{rounded.size-borderRadius-300}` (8px) 하나로 유지한다 — 크기에 따라 더 둥글게 만들지 않는다 [src:4].

**Don't**

- 그라디언트를 시스템 표면에 사용하지 않는다 — 워드마크 로고와 Getting Started 페이지 컨셉 히어로 두 곳만 예외다 [src:5].
- 글래스/프로스티드/블러·`backdrop-filter`를 사용하지 않는다 — 트랜스페어런시는 `{component.dialog}`/`{component.sheet}` 스크림(검정 `opacity: .32`)과 상호작용 오버레이에만 허용된다 [src:4].
- 텍스처·반복 패턴·장식 일러스트를 시스템 표면에 사용하지 않는다 [src:5].
- 이모지를 제품 UI에 사용하지 않고, 유니코드 글리프로 아이콘을 대체하지 않는다 — chevron·check·arrow는 모두 SVG다 [src:5].
- `{component.tooltip}`을 frosted/blur 변형으로 만들지 않는다 — solid `{colors.background-contrast-200}` + 흰 텍스트 단일 변형을 유지한다 [src:4].
- Hover/press에서 transform·scale을 사용하지 않는다 — `{colors.gray-900}` 오버레이의 불투명도만 8% · 16%로 올리는 방식만 사용한다 [src:4].
- 외곽 elevation 을 inner shadow 로 대체하지 않는다 — 떠오르는 표면은 외곽 그림자 4단(`sm/md/lg/xl`)으로 표현한다 [src:4]. 단 입력 계열의 테두리·포커스 링은 `box-shadow: inset` 으로 그리므로 이 금지의 대상이 아니다 [src:4].
- 챗봇 톤("~해보세요!")이나 마케팅 과장("혁신적", "최고의")을 product 카피에 사용하지 않는다 — "factual, didactic, slightly warm" 톤을 유지한다 [src:5].
- 모션에 바운스·스프링을 사용하지 않는다 — 배포본이 실제로 쓰는 100~200ms 범위(팝업·오버레이·ring)를 벗어나지 않게 운용한다. 400ms 는 토스트 스택 재배치 한 자리뿐이다 [src:4].
- Vapor를 구름이 아닌 제품에 채용할 때 구름의 개발자 도구 도메인(클라우드 IDE·코딩 교육·개발자 커뮤니티 맥락, 영문 Title Case + 한국어 bilingual 헤드라인과 존댓말 product 카피)을 그대로 이식하지 않는다 — Vapor는 `@vapor-ui/css-generator`로 브랜드 색 교체를 전제한 재사용 시스템이므로 차용할 것은 시각 언어(흰 카드 + 1px 헤어라인의 그림자 배제·시맨틱 alias 전제·light-first 화이트 캔버스·비그라디언트/비글래스 원칙·flat 24×24 모노 라인 아이콘)이고, 브랜드 색·제품 도메인은 자기 제품에 맞게 재정의한다 [src:5].
- 디자인시스템 이름 자체(`Vapor UI` 워드마크·`@vapor-ui/*` 패키지명·`vapor-` 접두 토큰명)를 생성하는 제품 UI의 헤더·타이틀·버튼·라벨·클래스 이름에 넣지 않는다 — 차용할 것은 시각 언어이지 시스템 이름이 아니다. UI 텍스트·네이밍은 자기 제품 브랜드로 재정의하고, 출처 표기가 필요하면 footer attribution(예: "Vapor UI 기반")에만 둔다.

## Responsive Behavior

### Breakpoints

`@vapor-ui/core` 1.3.0 배포본에서 명시적 breakpoint 토큰이 surface되지 않았다 [src:4] (Known Gaps 참조). 아래는 host 앱에서 일반적으로 사용되는 분기점 권장값으로, Vapor 공식 토큰이 아니라 시스템 운용 가이드다.

| Name | Width | Key Changes |
|---|---|---|
| Mobile | ≤ 640px | `{component.dialog}` → `{component.sheet}` 전환 권장; Table → 카드 stack; HStack → VStack |
| Tablet | 641–1023px | 2-column 카드 그리드; `{component.navigation-menu}` 축소 |
| Desktop | ≥ 1024px | 기본 레이아웃; Figma layout 페이지 기준 outer gutter 100px [src:5] |

### Touch Targets

최소 44 × 44px. 사이즈 사다리의 `sm`(24px)·`md`(32px)는 desktop 한정이고, 모바일 surface에서는 `lg`(40px) 또는 `xl`(48px)를 쓴다 — `{component.button}` 과 `{component.icon-button}` 이 같은 사다리를 공유하므로 판단 기준도 같다 [src:4]. `xl` 만이 44px 기준을 단독으로 넘고 `lg` 는 4px 모자라므로, `lg` 를 쓸 때는 별도 wrapping 으로 hit area 를 넓힌다.

### Collapsing Strategy

- `{component.dialog}` → `{component.sheet}`: 모바일에서 풀스크린 슬라이드업으로 전환.
- `{component.navigation-menu}`: 모바일에서 햄버거 trigger + `{component.sheet}`로 펼침.
- Table: 모바일에서 각 row를 카드로 stack — Patterns 카테고리의 Table Patterns 가이드를 따른다 [src:5].

### Image Behavior

Vapor 시스템은 imagery treatment를 강제하지 않는다. goorm 마케팅 사진은 `clean, daylight, slightly cool, no grain` 톤을 사용한다 [src:5].

## Known Gaps

- **Responsive breakpoint 토큰** 자체는 1.3.0 배포본에서 surface되지 않았다 [src:4]. host 앱 측에서 정의하도록 위임된 것으로 추정 — 위 Responsive Behavior 섹션의 분기점은 합리적 권장값이며 Vapor 공식 토큰은 아니다.
- **다크 모드 alias 값이 `## Colors` 에 채워져 있지 않다.** 그 절은 일부 alias 의 다크 대응을 `custom dark` 로만 적는데, 실제 값은 `dist/styles/themes.css.ts.vanilla.css` 의 `[data-vapor-theme='dark']` 블록에 155개가 발행돼 있다 [src:4]. 즉 미공개라서 빈 것이 아니라 아직 옮기지 않은 것이다 — 채워 넣는 작업이 남아 있다.
- **`## Colors` 의 시맨틱 alias 이름 3건이 상류와 어긋난다** — 배포본은 `color-border-normal`(라이트 `gray-100` / 다크 `gray-300`)과 `color-foreground-inverse` 를 발행하는데 그 절에는 없고, canvas 는 배포본이 `color-background-canvas-100` 인데 그 절은 `color-background-canvas` 로 적는다 [src:4]. 값 자체는 2026-07-29 에 공개 발행값으로 대조됐으므로 이 공백은 이름에 한한다. 이 문서의 다른 절은 해당 자리에서 발행돼 있는 팔레트 토큰(`{colors.gray-100}` 등)을 대신 참조한다.
- **Form validation states** — `{component.text-input}` · `{component.checkbox}` · `{component.radio}` · `{component.select}` 가 `invalid` 축을 갖고 그 시각 처리는 확인됐으나, helper text · success state 의 토큰화된 정의는 배포본에 없다 [src:4].
- **철회된 부재 주장 2건 (2026-08-17)** — 종전 판본은 `## Spacing` 이 "컴포넌트 사이징과 border width는 별도 토큰 그룹으로 분리된다"며 `size-component-*` 4개와 `size-borderWidth-*` 2개를 실었고, `## Rounded` 가 `size-borderRadius-circle` 을 12번째 토큰으로 실었다. **셋 다 존재하지 않는다** — 배포본과 문서 사이트 어디에도 그 이름이 없다 [src:4][src:1]. 컨트롤 높이의 실제 출처는 `size-dimension-*` 이고, 1px·2px 과 `9999px` 는 리터럴로 적힌다.
- **철회된 부재 주장 1건 (2026-08-16)** — 종전 판본은 "카드 padding 기본값은 시스템이 별도 강제하지 않고 콘텐츠 주도로 결정된다"를 적고, 여기에 "host 팀이 자체 padding ladder를 별도 정의해야 한다"는 권고를 달았다. **지금은 거짓이다** — `@vapor-ui/core` 1.3.0의 `card.css`가 `padding: 16px 24px`(헤더·푸터)와 `padding: 24px`(본문)를 강제한다 [src:4]. 부재 주장이 낳은 권고는 그 주장이 철회되면 함께 무너진다.
- **아이콘 SVG** — Figma 바이너리에서 깨끗이 추출되지 않아 production 대체로 **Lucide via CDN**(24×24 / 1.5px stroke)을 권장한다 [src:5]. pixel parity가 필요하면 `assets/icons/`에 production SVG를 드랍한다.
- **컴포넌트 커버리지** — 1.3.0 배포본은 스타일을 갖는 컴포넌트 35개를 싣는다 [src:4]. 위 `## Components` 는 그중 시각 어휘를 결정하는 것들을 다루고, 레이아웃 프리미티브(Box · Flex · Grid · HStack · VStack)와 `Collapsible` · `Skeleton` · `Spinner` · `FloatingBar` · `SegmentedControl` · `Field` · `Form` 은 항목을 두지 않았다 — 채워 넣는 작업이 남아 있다.

## References

1. https://vapor-ui.goorm.io/ — 공식 docs/데모 사이트, goorm 네이밍·운영 컨텍스트.
2. https://blog.goorm.io/vapor-figma-seoul/ — goorm 공식 블로그 "Vapor at Figma Config Seoul 2025", Vapor Squad 조직(2025년 4월 신설, Squad Lead 최준영, CDO 이태성)·SSOT 자동화·MCP Server 컨텍스트.
3. https://www.figma.com/community/file/1508829832204351721/vapor-design-system — Vapor Design System Figma Community 파일. 평범한 GET에는 텍스트가 34자뿐인 JS 셸이라 브라우저로 열어야 파일 정보가 보인다.
4. https://www.npmjs.com/package/@vapor-ui/core — `@vapor-ui/core` npm 페이지(peer 의존, 카테고리, MIT © 2025 goorm Inc.). 값은 이 페이지가 아니라 배포본 안에 있다 — 팔레트는 `dist/styles/themes.css.ts.vanilla.css`, 컴포넌트 치수·무게·radius는 `dist/components/*/*.css.ts.vanilla.css`(35개)와 `dist/styles/mixins/typography.css.ts.vanilla.css`다.
5. https://github.com/goorm-dev/vapor-ui — GitHub 모노레포(6 패키지 구조: core / hooks / icons / codemod / color-generator / css-generator, README 카피). **루트 URL 하나가 본문 인용의 대부분을 떠받치고 있어**, 개별 주장을 이 링크만으로 확인하기 어렵다. 토큰 값은 [src:4]의 배포 CSS가, 정책·카피 서술은 이 저장소의 README와 docs 소스가 각각 1차 근거다.
