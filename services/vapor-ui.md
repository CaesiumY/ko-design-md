---
name: 구름
design_system_name: Vapor UI
slug: vapor-ui
category: developer
last_updated: "2026-06-01"
created_at: "2026-05-10"
sources:
  - https://vapor-ui.goorm.io/
  - https://blog.goorm.io/vapor-figma-seoul/
  - https://www.figma.com/community/file/1508829832204351721/vapor-design-system
  - https://www.npmjs.com/package/@vapor-ui/core
  - https://github.com/goorm-dev/vapor-ui
related_services: []
lang: ko
logo: https://getdesign.kr/logos/goorm.png
---

# Vapor UI — design.md

> 한국의 클라우드 IDE/개발자 교육 회사 goorm(구름)이 운영하는 디자인 시스템. goormIDE·goormEDU·goormLEVEL·goorm Cloud·goorm.co 마케팅 사이트가 단일 시각 언어를 공유하도록 설계되었다 [src:1]. 본 문서는 사용자가 제공한 Claude Design 핸드오프 번들(업데이트본)을 1차 출처로 추출·압축 해제하여 합성한 결과다.

## Brand & Style

Vapor는 시스템 자체의 정체성을 **opinionated, light-first, very token-driven, proudly Korean-bilingual** 로 정의한다 [src:5]. opinionated는 디자인 결정이 토큰 레벨에서 강하게 박혀 있다는 뜻이고, light-first는 다크 모드가 동등하게 지원되되 1차 환경은 화이트 캔버스라는 의미다. very token-driven은 product-facing 색상이 모두 시맨틱 alias로만 노출되어 raw 팔레트는 새 role을 만들 때만 직접 참조된다는 정책을 가리킨다 [src:5].

대상 사용자는 세 층위다. 디자이너에게는 Figma 라이브러리(`figma.com/community/file/1508829832204351721`)를, 개발자에게는 `@vapor-ui/core` 1.3.0을 중심으로 한 6패키지 모노레포(`goorm-dev/vapor-ui`)를, 그리고 product surface를 운영하는 host 팀에게는 `@vapor-ui/css-generator`를 통해 기본 키 팔레트를 자체 브랜드 색으로 교체할 수 있는 토큰 빌드 파이프라인을 제공한다 [src:4][src:5]. 2025년 4월 전담 조직 Vapor Squad가 신설되어 Squad Lead 최준영, CDO 이태성 체제로 운영된다 [src:2].

전체 무드는 **bright, soft white** 로 요약된다 [src:5]. 정보 밀도가 높은 표면(테이블·코드 패널·폼)은 흰 카드 위에 옅은 페이지 배경, 그리고 1px 헤어라인으로 분리되는 패턴이며, 색은 절제되어 있고 시맨틱 팔레트는 상태(primary CTA, success/warning/danger badge, link blue)에만 사용된다 [src:5]. 시스템 표면 자체에는 **그라디언트, 글래스/블러 효과, 텍스처, 장식 일러스트가 없다** [src:5]. 그라디언트가 등장하는 단 두 곳은 Vapor 워드마크 로고와 Getting Started 페이지의 컨셉 히어로다 [src:5]. 트랜스페어런시·블러는 토스트와 다이얼로그 스크림에만 쓰이고 frosted glass나 `backdrop-filter`는 시스템에서 제외된다 [src:5].

Voice는 "factual, didactic, slightly warm"으로 정의된다 [src:5]. 한국어가 1차 언어이고 헤딩과 본문은 존댓말(~니다/~습니다), 버튼은 짧은 명령형 동사("저장", "삭제", "닫기")로 작성한다 [src:5]. 영문 큰 타이틀과 한 줄 한국어 서브타이틀을 페어링하는 bilingual 패턴이 표준이며(예: `Overview` / `Vapor와 우리의 핵심철학을 소개합니다`), 영문 헤딩은 Title Case, 토큰 namespace는 모두 kebab-case 소문자로 통일된다 [src:5]. 본 카탈로그 메타 문서는 Vapor 자체 카피와 달리 `~다` 평서체로 기술하며, Vapor의 존댓말 정책은 product surface 카피에 한해 적용되는 규칙임을 분리해 둔다.

## Colors

Vapor는 두 테마(`light`, `dark`) 위에 11-family 베이스 팔레트를 둔다 — Red, Pink, Grape, Violet, Blue, Cyan, Green, Lime, Yellow, Orange, Gray. 각 패밀리는 `050, 100, 200, 300, 400, 500, 600, 700, 800, 900` 10단계 + `color-white`/`color-black` 상수로 구성된다 [src:5]. 브랜드 primary는 **Blue 500**이며, 카노니컬한 violet은 Vapor 워드마크에만 등장한다 [src:5].

product-facing 색은 모두 **시맨틱 alias**로 호출하고 raw 팔레트는 새 role을 만들 때만 직접 노출된다 — 명명 규칙은 `color-{role}-{intent}-{level}`이며 roles는 `background`/`foreground`/`border`, intents는 `primary, secondary, success, warning, danger, hint, contrast, normal`, level은 `100`(soft) / `200`(strong)이다 [src:5].

### Base palette (11 family × 10 step)

```yaml
# Gray — 표면·텍스트·디바이더의 기반
gray-050: oklch(0.984 0.000 0)
gray-100: oklch(0.972 0.000 0)
gray-200: oklch(0.892 0.000 0)
gray-300: oklch(0.804 0.000 0)
gray-400: oklch(0.712 0.000 0)
gray-500: oklch(0.658 0.000 0)
gray-600: oklch(0.453 0.000 0)
gray-700: oklch(0.314 0.000 0)
gray-800: oklch(0.234 0.000 0)
gray-900: oklch(0.169 0.000 0)

# Blue — 브랜드 primary, link, focus ring 앵커
blue-050: oklch(0.974 0.018 254)
blue-100: oklch(0.901 0.052 254)
blue-200: oklch(0.781 0.110 264)
blue-300: oklch(0.690 0.146 261)
blue-400: oklch(0.638 0.166 258)
blue-500: oklch(0.581 0.181 254)   # 브랜드 primary
blue-600: oklch(0.560 0.196 257)
blue-700: oklch(0.451 0.166 259)
blue-800: oklch(0.348 0.142 263)
blue-900: oklch(0.232 0.156 270)

# Cyan
cyan-050: oklch(0.978 0.013 215)
cyan-100: oklch(0.911 0.039 220)
cyan-200: oklch(0.812 0.078 224)
cyan-300: oklch(0.703 0.105 226)
cyan-400: oklch(0.633 0.110 230)
cyan-500: oklch(0.567 0.107 230)
cyan-600: oklch(0.475 0.099 232)
cyan-700: oklch(0.388 0.080 233)
cyan-800: oklch(0.309 0.061 233)
cyan-900: oklch(0.255 0.057 232)

# Green — success
green-050: oklch(0.978 0.022 156)
green-100: oklch(0.913 0.075 154)
green-200: oklch(0.831 0.117 153)
green-300: oklch(0.726 0.158 151)
green-400: oklch(0.652 0.157 154)
green-500: oklch(0.566 0.114 167)
green-600: oklch(0.467 0.094 169)
green-700: oklch(0.376 0.075 169)
green-800: oklch(0.294 0.067 170)
green-900: oklch(0.246 0.057 168)

# Lime
lime-050: oklch(0.978 0.044 122)
lime-100: oklch(0.926 0.116 124)
lime-200: oklch(0.857 0.158 127)
lime-300: oklch(0.787 0.184 130)
lime-400: oklch(0.689 0.187 131)
lime-500: oklch(0.566 0.158 132)
lime-600: oklch(0.464 0.130 132)
lime-700: oklch(0.371 0.106 133)
lime-800: oklch(0.292 0.085 133)
lime-900: oklch(0.225 0.078 134)

# Yellow / Amber
yellow-050: oklch(0.971 0.044 79)
yellow-100: oklch(0.906 0.111 84)
yellow-200: oklch(0.847 0.158 79)
yellow-300: oklch(0.768 0.166 65)
yellow-400: oklch(0.660 0.158 60)
yellow-500: oklch(0.560 0.142 56)
yellow-600: oklch(0.456 0.121 55)
yellow-700: oklch(0.371 0.099 56)
yellow-800: oklch(0.318 0.081 53)
yellow-900: oklch(0.275 0.083 53)

# Orange — warning
orange-050: oklch(0.957 0.025 30)
orange-100: oklch(0.872 0.072 32)
orange-200: oklch(0.778 0.131 34)
orange-300: oklch(0.703 0.166 36)
orange-400: oklch(0.628 0.190 38)
orange-500: oklch(0.557 0.179 38)
orange-600: oklch(0.464 0.169 39)
orange-700: oklch(0.385 0.150 41)
orange-800: oklch(0.346 0.135 41)
orange-900: oklch(0.300 0.119 41)

# Red — danger
red-050: oklch(0.957 0.020 17)
red-100: oklch(0.881 0.057 18)
red-200: oklch(0.795 0.115 18)
red-300: oklch(0.687 0.180 19)
red-400: oklch(0.638 0.213 19)
red-500: oklch(0.577 0.198 21)
red-600: oklch(0.488 0.181 22)
red-700: oklch(0.405 0.181 25)
red-800: oklch(0.330 0.169 28)
red-900: oklch(0.255 0.144 28)

# Pink
pink-050: oklch(0.957 0.018 13)
pink-100: oklch(0.870 0.054 5)
pink-200: oklch(0.770 0.117 6)
pink-300: oklch(0.652 0.176 7)
pink-400: oklch(0.567 0.179 8)
pink-500: oklch(0.510 0.180 8)
pink-600: oklch(0.418 0.168 8)
pink-700: oklch(0.339 0.158 8)
pink-800: oklch(0.296 0.146 9)
pink-900: oklch(0.279 0.137 8)

# Grape
grape-050: oklch(0.954 0.024 308)
grape-100: oklch(0.866 0.087 312)
grape-200: oklch(0.755 0.166 314)
grape-300: oklch(0.633 0.225 316)
grape-400: oklch(0.546 0.230 316)
grape-500: oklch(0.475 0.215 314)
grape-600: oklch(0.391 0.193 313)
grape-700: oklch(0.317 0.169 312)
grape-800: oklch(0.279 0.158 311)
grape-900: oklch(0.260 0.157 313)

# Violet — 워드마크 전용 카노니컬 violet (violet-300)
violet-050: oklch(0.946 0.040 296)
violet-100: oklch(0.853 0.121 297)
violet-200: oklch(0.713 0.205 296)
violet-300: oklch(0.560 0.270 295)
violet-400: oklch(0.494 0.275 295)
violet-500: oklch(0.439 0.245 290)
violet-600: oklch(0.366 0.220 287)
violet-700: oklch(0.300 0.197 283)
violet-800: oklch(0.292 0.193 283)
violet-900: oklch(0.279 0.187 282)

color-white: oklch(1.000 0.000 0)
color-black: oklch(0.000 0.000 0)
```

위 OKLCH는 `colors_and_type.css`의 정확한 hex 값을 변환한 결과이며, 원본 hex는 research.md에 기록되어 있다 [src:5].

### Semantic alias (light → dark)

aliases는 raw 토큰 이름만 참조한다 — 값은 base palette에서 유래하므로 별도 색 표기를 두지 않는다.

```yaml
# Background
color-background-canvas:           color-white       → gray-900
color-background-canvas-200:       gray-050          → gray-800
color-background-overlay-100:      color-white       → gray-800
color-background-primary-100:      blue-050          → custom dark
color-background-primary-200:      blue-500          → blue-500
color-background-secondary-100:    gray-100          → gray-800
color-background-secondary-200:    gray-200          → gray-700
color-background-success-100:      green-100         → custom dark
color-background-success-200:      green-500         → green-500
color-background-warning-100:      orange-100        → custom dark
color-background-warning-200:      orange-500        → orange-500
color-background-danger-100:       red-100           → custom dark
color-background-danger-200:       red-500           → red-500
color-background-hint-100:         gray-100          → gray-800
color-background-hint-200:         gray-600          → gray-600
color-background-contrast-100:     gray-300          → gray-700
color-background-contrast-200:     gray-800          → gray-100

# Foreground
color-foreground-primary-100:      blue-500          → blue-300
color-foreground-primary-200:      blue-700          → blue-400
color-foreground-secondary-100:    gray-800          → gray-200
color-foreground-secondary-200:    gray-900          → gray-100
color-foreground-success-100:      green-600         → green-300
color-foreground-success-200:      green-700         → green-200
color-foreground-warning-100:      orange-600        → orange-300
color-foreground-warning-200:      orange-700        → orange-200
color-foreground-danger-100:       red-600           → red-300
color-foreground-danger-200:       red-700           → red-200
color-foreground-hint-100:         gray-600          → gray-400
color-foreground-hint-200:         gray-700          → gray-300
color-foreground-contrast-100:     gray-800          → gray-200
color-foreground-contrast-200:     gray-900          → gray-050
color-foreground-normal-100:       gray-700          → gray-300
color-foreground-normal-200:       gray-900          → gray-100

# Border
color-border-primary:              blue-500          → blue-400
color-border-secondary:            gray-200          → gray-700
color-border-success:              green-500         → green-400
color-border-warning:              orange-500        → orange-400
color-border-danger:               red-500           → red-400
color-border-hint:                 gray-600          → gray-500
color-border-contrast:             gray-800          → gray-200
```

다크 모드는 `<html data-theme="dark">` 또는 `.vp-dark` 래퍼로 활성화된다 [src:5]. host 앱은 `@vapor-ui/css-generator`로 빌드 단계에서 기본 키 팔레트(예: blue 패밀리)를 자체 브랜드 색으로 교체할 수 있어 — Vapor의 시맨틱 alias는 그대로 둔 채 시각적 1차 색만 swap된다 [src:5].

## Typography

폰트 패밀리는 세 갈래로 분리된다 [src:5]. **Sans (web)**는 Pretendard로 한글과 라틴이 단일 metric을 공유하며 가중치 400/500/600/700/800을 사용한다. **Mono / numerics**는 Inter로 spec 내부의 tabular figure(특히 토큰 표의 OKLCH/HEX 정렬)에 사용된다. **Code blocks**는 Fira Code다. CDN 임포트는 jsdelivr의 Pretendard v1.3.9 + Google Fonts의 Inter, Fira Code 조합이다 [src:5].

토큰화된 사이즈/라인 하이트는 4px 그리드 기반의 13단계 사다리다 [src:5]:

```yaml
# size → fontSize / lineHeight
size-025:  10px / 14px
size-050:  12px / 18px
size-075:  14px / 20px
size-100:  16px / 24px
size-200:  18px / 26px
size-300:  20px / 28px
size-400:  24px / 32px
size-500:  32px / 40px
size-600:  38px / 48px
size-700:  48px / 56px
size-800:  64px / 72px
size-900:  80px / 88px
size-1000: 120px / 130px
```

시맨틱 typography 클래스는 `vapor.css`로 컴파일되어 host 앱에서 직접 클래스 이름으로 호출 가능하다 [src:5]:

| 클래스 | size / line | weight | 비고 |
|---|---|---|---|
| `vp-display1` | 80 / 88 | 800 | letter-spacing -0.4px |
| `vp-display2` | 64 / 72 | 800 | letter-spacing -0.4px |
| `vp-display3` | 48 / 56 | 700 | letter-spacing -0.4px |
| `vp-display4` | 38 / 56 | 700 | letter-spacing -0.4px (의도적 cross-token: fontSize-600 × lineHeight-700) |
| `vp-h1` | 32 / 48 | 700 | 의도적 cross-token: fontSize-500 × lineHeight-600 |
| `vp-h2` | 24 / 32 | 700 | |
| `vp-h3` | 20 / 28 | 700 | |
| `vp-h4` | 18 / 26 | 700 | |
| `vp-h5` | 16 / 24 | 700 | |
| `vp-h6` | 14 / 20 | 700 | |
| `vp-subtitle1` | 14 / 20 | 500 | foreground-hint-100 |
| `vp-subtitle2` | 12 / 18 | 500 | foreground-hint-100 |
| `vp-body1` | 16 / 24 | 400 | |
| `vp-body2` | 14 / 20 | 400 | 본문 기본 |
| `vp-body3` | 12 / 18 | 400 | |
| `vp-body4` | 10 / 14 | 400 | |
| `vp-mono` | — | — | font-mono |
| `vp-num` | — | — | tabular-nums |

Letter-spacing 정책은 기본 `-0.1px`이며 display 1–4는 `-0.4px`로 더 타이트하게 설정된다 — Pretendard에서 한글이 들떠 보이지 않도록 잡는 한글 컨벤션이다 [src:5].

## Spacing

베이스 단위는 4px이다 [src:5]. 토큰 사다리는 0px부터 100px까지 15단계로 정의되며, 컴포넌트 사이징과 border width는 별도 토큰 그룹으로 분리된다 [src:5].

```yaml
size-space-000:   0px
size-space-025:   2px
size-space-050:   4px
size-space-075:   6px
size-space-100:   8px
size-space-150:  12px
size-space-200:  16px
size-space-250:  20px
size-space-300:  24px
size-space-400:  32px
size-space-500:  40px
size-space-600:  48px
size-space-700:  64px
size-space-800:  72px
size-space-900: 100px

# 컴포넌트 높이
size-component-sm: 28px
size-component-md: 32px
size-component-lg: 40px
size-component-xl: 48px

# Border width
size-borderWidth-100: 1px   # 보편적 헤어라인
size-borderWidth-200: 2px   # focus ring, state border
```

Figma layout 페이지는 outer gutter 100px, 도큐멘테이션 카드의 inner padding 64px를 기본값으로 둔다 [src:5]. Border 정책은 보편적 1px 헤어라인 `color-border-secondary`(light에서 gray-200, dark에서 gray-700)이며, 상태 보더는 매칭되는 colored-500으로 한 단계 강해진다 [src:5].

## Rounded

스케일은 0px부터 40px까지 11단계 + `circle`(9999px) 토큰이다 [src:5]:

```yaml
size-borderRadius-000:    0px
size-borderRadius-050:    2px
size-borderRadius-100:    4px
size-borderRadius-200:    6px
size-borderRadius-300:    8px      # 버튼 기본
size-borderRadius-400:   12px      # 카드 기본 / 버튼 xl
size-borderRadius-500:   16px
size-borderRadius-600:   20px
size-borderRadius-700:   24px
size-borderRadius-800:   32px
size-borderRadius-900:   40px
size-borderRadius-circle: 9999px   # pill / chip / badge / avatar
```

기본 사용 가이드 [src:5]: 카드는 `300` 또는 `400`(8/12px), 버튼은 `300`(8px)이며 size xl만 `400`(12px)으로 한 단계 더 둥글다. pill/badge/avatar는 항상 `circle`(9999px)이다.

## Elevation & Depth

단일 elevation 시스템 4단계이며, 모두 직하 방향 20% 검정으로 통일된다 [src:5]:

```yaml
box-shadow-sm: 0 1px  3px  oklch(0 0 0 / .20)
box-shadow-md: 0 2px 10px  oklch(0 0 0 / .20)
box-shadow-lg: 0 4px 16px  oklch(0 0 0 / .20)
box-shadow-xl: 0 16px 32px oklch(0 0 0 / .20)
```

Inner shadow는 정의되지 않는다 [src:5]. 카드는 그림자 대신 1px 헤어라인 보더에 의존하고, 그림자는 lifted 표면(popover, menu, dialog, toast) 한정으로 사용된다 [src:5]. 다이얼로그와 토스트의 스크림은 `oklch(0 0 0 / .4)`로 고정되며 frosted glass·`backdrop-filter`는 시스템에서 제외된다 [src:5].

모션 토큰은 빠르고 드라마 없는 범위로 설정된다 [src:5]:

```yaml
motion-duration-fast:   120ms
motion-duration-normal: 180ms
motion-duration-slow:   240ms
motion-ease-standard:   cubic-bezier(.4, 0, .2, 1)
motion-ease-emphasized: cubic-bezier(.2, 0, 0,  1)
```

상태 변화 정책 [src:5]:
- **Hover** — fill을 한 단계 darker step으로 swap(예: `primary-200 → primary-300`), transform 없음. outline/ghost 스타일은 +8% black overlay.
- **Press / active** — 그 다음 step으로 swap, no scale.
- **Disabled** — opacity 50% 또는 `gray-200`/`gray-500`로 swap, cursor `not-allowed`.
- **Focus-visible** — 2px ring `color-border-primary`, offset 2px.

## Shapes

기하학은 직각형 우위에 보수적인 라운드(2–12px가 일상 사용 범위, `circle`은 pill/badge/avatar 한정)를 둔다. 카드는 흰 표면 위 1px `border-secondary` + 라운드 `400`(12px)이 표준 어휘이며, no-shadow at rest 정책이 카드 표현의 기본값이다 [src:5].

장식의 부재는 의도적이다. 그라디언트·글래스/블러·텍스처·장식 일러스트가 시스템 표면에 일절 등장하지 않으며, 그라디언트는 워드마크와 Getting Started 페이지 컨셉 히어로 두 곳에만 예외적으로 허용된다 [src:5]. 사진 정책은 마케팅 측 goorm 사진의 **clean, daylight, slightly cool, no grain** 톤을 따르되, Vapor 시스템 자체가 강제하는 imagery treatment는 두지 않는다 [src:5].

**Iconography** [src:5] — flat 24×24 monochrome line, 1.5px stroke, React 컴포넌트로 ship된다(`<HeartIcon />`, `<HeartFillIcon />`, `<ChevronDownIcon />` 등). Figma 사용 빈도 1·2위는 `HeartFillIcon`(3120 instances)과 `ChevronDownIcon`(2560 + 2140)이며, fill variant가 outlined 대응으로 존재한다(`Heart` ↔ `HeartFill`). 핸드오프 번들 caveat: Figma 바이너리에서 아이콘이 깨끗이 추출되지 않아 **Lucide via CDN**(24×24 / 1.5px stroke)으로 substitute하며, pixel parity가 필요하면 production SVG를 `assets/icons/`에 드랍한다 [src:5]. 이모지는 제품 UI에서 사용하지 않고 유니코드 글리프를 아이콘 대용으로 쓰지 않는다 — chevron, check, arrow는 모두 SVG다 [src:5].

## Components

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

스타일링 레이어는 Base UI(`@base-ui/react`) 프리미티브 위에 Vanilla Extract(`@vanilla-extract/css`, recipes, sprinkles + rainbow-sprinkles)를 얹은 구조이며, React 17/18/19 peer를 모두 지원한다 [src:5]. 모노레포는 6개 패키지로 분할된다 [src:5]:

| 패키지 | 역할 |
|---|---|
| `@vapor-ui/core` | 컴포넌트 라이브러리 본체 |
| `@vapor-ui/hooks` | React 훅 모음 |
| `@vapor-ui/icons` | SVG 아이콘 세트 |
| `@vapor-ui/codemod` | 자동 마이그레이션 도구 |
| `@vapor-ui/color-generator` | WCAG 팔레트 생성기 (Adobe Leonardo 기반) |
| `@vapor-ui/css-generator` | CSS 변수 생성 도구 (host 앱 키 팔레트 swap) |

### button

Vapor Button은 7 variants × 4 sizes를 노출한다 [src:5]. Variants는 functional kind에 해당하므로 각각 `button-*` 엔트리로 분해한다. 사이즈와 상태는 모든 variant에 공통이다.

사이즈는 4단(높이 × 좌우 padding × font-size): `sm` 28×10×13, `md` 32×12×14, `lg` 40×16×15, `xl` 48×20×16. xl만 radius `{rounded.size-borderRadius-400}` (12px)이고 나머지는 `{rounded.size-borderRadius-300}` (8px)이다 [src:5]. disabled는 opacity 0.5 + cursor `not-allowed`, focus-visible은 2px outline `{colors.border-primary}` + offset 2px다 [src:5].

```tsx
import { Button } from "@vapor-ui/core";

// 카노니컬 API — @vapor-ui/core 컴포넌트
<Button variant="primary" size="md">저장</Button>
<Button variant="danger-outline" size="sm">삭제</Button>

// host 앱이 vapor.css 클래스를 직접 쓸 때
<button className="vp-btn-primary vp-btn-md">저장</button>
```

### button-primary

`vp-btn-primary` / `<Button variant="primary">`. `{colors.blue-500}` bg, 흰 텍스트. Hover에서 `{colors.blue-600}`로 fill swap (transform 없음). Active `{colors.blue-700}` [src:5].

### button-primary-outline

`vp-btn-primary-outline`. 투명 bg + `{colors.foreground-primary-200}` 텍스트 + `{colors.border-primary}` 보더. Hover에서 `{colors.background-primary-100}` bg가 추가된다 [src:5].

### button-primary-ghost

`vp-btn-primary-ghost`. 투명 bg + `{colors.foreground-primary-200}` 텍스트, 보더 없음. Hover에서 `{colors.background-primary-100}` bg가 추가된다 [src:5].

### button-secondary

`vp-btn-secondary`. `{colors.gray-100}` bg, 1px `{colors.gray-200}` 보더. Hover에서 `{colors.gray-200}` bg로 swap [src:5].

### button-danger

`vp-btn-danger`. `{colors.red-500}` bg, 흰 텍스트. Hover `{colors.red-600}` [src:5].

### button-danger-outline

`vp-btn-danger-outline`. 투명 bg + `{colors.foreground-danger-200}` 텍스트 + `{colors.border-danger}` 보더. Hover에서 `{colors.background-danger-100}` bg [src:5].

### button-contrast

`vp-btn-contrast`. `{colors.gray-800}` bg, 흰 텍스트. Hover `{colors.gray-900}` [src:5].

### badge

Badge는 높이 22px, padding 0 8px, radius `{rounded.size-borderRadius-circle}` (9999), font 600 / 12px / -0.1px 흰 텍스트의 단일 사이즈로 운영되며 intent별로 색만 갈라진다 [src:5]. 시각 무게 차이는 아래 세 변형으로 분해된다.

```tsx
import { Badge } from "@vapor-ui/core";

<Badge variant="solid" intent="success">완료</Badge>
<Badge variant="soft" intent="danger">에러</Badge>

// vapor.css 직접 호출
<span className="vp-badge-soft-success">완료</span>
```

### badge-solid

`vp-badge-{intent}` — `{colors.blue-500}` (primary) / `{colors.green-500}` (success) / `{colors.orange-500}` (warning) / `{colors.red-500}` (danger) / `{colors.gray-600}` (hint) / `{colors.gray-800}` (contrast). 흰 텍스트 [src:5].

### badge-soft

`vp-badge-soft-{intent}`. bg는 `{colors.background-{intent}-100}`, fg는 `{colors.foreground-{intent}-200}`. solid 대비 시각 무게가 가벼워 비-치명적 인디케이션에 사용된다 [src:5].

### badge-dot

6×6 50% radius. success / warning / danger 컬러 한정의 상태 점 인디케이터 [src:5].

### text-input

높이 36px, padding 0 12px, font 400 / 14px, border 1px `{colors.gray-200}`, radius `{rounded.size-borderRadius-300}` (8px) [src:5]. hover에서 보더가 `{colors.gray-300}`으로 한 단계 강해지고, focus에서 2px `{colors.blue-500}` ring(투명도 18%)이 추가된다. error 상태는 `{colors.red-500}` 보더와 매칭 ring (`{colors.red-500}` 18% 투명도)이다 [src:5].

### textarea

`{component.text-input}`의 여러 줄 변형이다 — 높이 auto, padding 8 12px, line-height 1.5, `resize: vertical`이며 보더·hover·focus·error 규약은 단일 줄 입력과 동일하다 [src:5].

### select

트리거는 높이 36px, padding 0 10px 0 12px, font 400 / 14px `{colors.foreground-secondary-200}`, `{colors.background-canvas}` bg, 1px `{colors.border-secondary}` 보더, radius `{rounded.size-borderRadius-300}` (8px)이다. hover에서 보더가 `{colors.gray-300}`, open 상태에서 `{colors.border-primary}` 보더 + 2px `{colors.blue-500}` ring(투명도 18%)으로 강해지고 chevron이 180° 회전한다. placeholder는 `{colors.foreground-hint-100}`, disabled는 `{colors.gray-100}` bg / `{colors.gray-500}` 텍스트다. 팝업은 트리거 아래 4px에 `{colors.background-canvas}` + 1px `{colors.border-secondary}` + radius `{rounded.size-borderRadius-300}` + `{elevation.box-shadow-md}` + padding 6px + max-height 260px로 뜨고, 옵션은 높이 34px / radius `{rounded.size-borderRadius-200}` (6px), hover `{colors.background-secondary-100}`, 선택 시 `{colors.foreground-primary-200}` + 600 + `{colors.blue-500}` 체크다 [src:5].

### multi-select

`{component.select}` 트리거를 다중 선택용으로 확장한 형태다 — min-height 36px에서 내용이 줄바꿈되며, 선택 값은 태그 칩(높이 24px, padding 0 4px 0 8px, radius `{rounded.size-borderRadius-200}`, `{colors.background-primary-100}` bg, `{colors.foreground-primary-200}` 텍스트, font 600 / 12px)으로 쌓인다. 각 칩의 제거 버튼은 16×16이며 hover에서 진해지고, placeholder는 `{colors.foreground-hint-100}`다 [src:5].

### input-group

입력과 부착 요소(addon·버튼)를 한 줄로 stretch 결합한다 — 첫 자식만 좌측, 마지막 자식만 우측 코너에 radius `{rounded.size-borderRadius-300}`를 두고 내부 코너는 0, 자식 간 `margin-left: -1px`로 보더를 겹쳐 단일 컨트롤처럼 보이게 한다. 입력은 `flex: 1` / `min-width: 0`, focus 시 `z-index`를 올려 ring이 가려지지 않게 한다. addon은 `{colors.background-secondary-100}` bg + 1px `{colors.border-secondary}` 보더 + `{colors.foreground-hint-200}` 텍스트(font 500 / 13px), 높이 36px다 [src:5].

### checkbox

18×18, radius `{rounded.size-borderRadius-100}` (4px). check mark는 흰색 on `{colors.blue-500}` [src:5].

### radio

18×18 50%. checked 상태에서 `{colors.blue-500}` 5px-border [src:5].

### switch

36×20 9999. idle `{colors.gray-300}` → on `{colors.blue-500}`. knob은 16×16 흰색 + `{elevation.box-shadow-sm}` [src:5].

### radio-card

`{component.radio}`의 카드형 변형이다. flex gap 12px, padding 14 16px, 1px `{colors.border-secondary}` 보더 + radius `{rounded.size-borderRadius-400}` (12px) + `{colors.background-canvas}` bg를 기본으로, hover에서 보더가 `{colors.gray-300}`으로 강해진다. checked 상태는 `{colors.border-primary}` 보더 + `{colors.background-primary-100}` bg + 내부 radio 5px `{colors.blue-500}`로 전환된다. 타이틀은 600 / 14px `{colors.foreground-secondary-200}`, 설명은 400 / 12px(line-height 1.5) `{colors.foreground-hint-200}`다 [src:5].

### card

`{colors.background-canvas}` (white) + 1px `{colors.border-secondary}` + radius `{rounded.size-borderRadius-400}` (12px), at-rest 상태에서 그림자 없음. padding은 콘텐츠 주도 — 시스템 기본값이 별도로 강제되지 않는다 [src:5].

### icon-button

32×32, radius `{rounded.size-borderRadius-300}`, transparent → hover에서 `{colors.background-secondary-100}`. SVG는 18×18을 호스트한다 [src:5].

### tabs

flex gap 4px에 하단 1px `{colors.border-secondary}` 보더를 깔고, 각 탭은 padding 10 14px / font 500 / 14px `{colors.foreground-hint-100}` / 하단 2px 투명 보더(margin-bottom -1px로 컨테이너 보더와 겹침)다. hover에서 `{colors.foreground-secondary-200}`, active에서 `{colors.foreground-primary-200}` 텍스트 + `{colors.border-primary}` 하단 보더 + 600으로 강조된다 [src:5].

### breadcrumb

flex gap 6px, font 500 / 13px `{colors.foreground-hint-100}`다. 링크는 색을 상속하고 hover에서 `{colors.foreground-secondary-200}`, 구분자(`/`)는 opacity 0.5, 현재 위치는 `{colors.foreground-secondary-200}`로 표기한다 [src:5].

### menu

`{colors.background-overlay-100}` bg + 1px `{colors.border-secondary}` 보더 + radius `{rounded.size-borderRadius-300}` (8px) + `{elevation.box-shadow-md}` + padding 6px + min-width 200px의 떠오르는 패널이다. 항목은 높이 32px / padding 0 10px / radius `{rounded.size-borderRadius-200}` / font 500 / 13px `{colors.foreground-secondary-200}`이고 hover·active에서 `{colors.background-secondary-100}` bg가 깔린다. 구분선은 1px `{colors.border-secondary}`다 [src:5].

### navigation-menu

사이드바형 내비게이션이다 — grid gap 2px, 항목은 높이 34px / padding 0 10px / radius `{rounded.size-borderRadius-200}` / font 500 / 13px `{colors.foreground-hint-200}`다. hover에서 `{colors.background-secondary-100}` bg + `{colors.foreground-secondary-200}` 텍스트, active에서 `{colors.background-primary-100}` bg + `{colors.foreground-primary-200}` 텍스트 + 600으로 전환된다. 섹션 라벨은 font 500 / 11px, uppercase, letter-spacing 0.08em, `{colors.foreground-hint-100}`다 [src:5].

### pagination

flex gap 4px. 버튼은 min-width 32px / 높이 32px / radius `{rounded.size-borderRadius-200}` (6px) / 1px `{colors.border-secondary}` 보더 / `{colors.background-canvas}` bg / font 500 / 13px `{colors.foreground-secondary-200}`이며, hover(비활성 페이지)에서 `{colors.background-secondary-100}` bg, 현재 페이지는 `{colors.blue-500}` bg + 흰 텍스트로 채워진다. disabled는 opacity 0.4, 생략 부호(…)는 `{colors.foreground-hint-100}`다 [src:5].

### avatar

inline-flex 32×32(기본) + 50% radius + `{colors.background-secondary-200}` bg + `{colors.foreground-secondary-200}` 텍스트(font 600 / 12px)다. 이미지가 있으면 `object-fit: cover`로 채우고, 없으면 이름 이니셜을 표시한다 [src:5].

### table

width 100% / border-collapse. th·td는 padding 12 16px + 하단 1px `{colors.border-secondary}` 보더 + font 14px `{colors.foreground-secondary-200}`이고, th는 600 / 13px `{colors.foreground-hint-100}` + `{colors.background-canvas-200}` bg다. row hover 시 `{colors.background-canvas-200}` bg가 깔린다 [src:5].

### callout

flex gap 12px, padding 12 14px, radius `{rounded.size-borderRadius-300}` (8px), 1px 보더 + `{colors.background-canvas}` bg를 기본으로 intent별로 bg `{colors.background-{intent}-100}` + 보더 `{colors.{intent}-200}`(blue-200 / green-200 / orange-200 / red-200)로 톤을 입힌다. 아이콘은 22×22 원형 + 흰 글리프(primary `i` / success `✓` / warning·danger `!`) + `{colors.{intent}-500}` bg, 타이틀 600 / 13px `{colors.foreground-secondary-200}`, 본문 400 / 12px(line-height 1.5) `{colors.foreground-hint-200}`다 [src:5].

### popover

`{colors.background-canvas}` bg + 1px `{colors.border-secondary}` 보더 + radius `{rounded.size-borderRadius-400}` (12px) + `{elevation.box-shadow-lg}` + padding 16px + min-width 240px의 떠오르는 패널이다. 타이틀은 700 / 14px `{colors.foreground-secondary-200}`, 본문은 400 / 13px(line-height 1.55) `{colors.foreground-hint-200}`, 푸터는 우측 정렬 gap 8px다 [src:5].

### sheet

화면 가장자리에서 슬라이드되는 패널이다 — 기본은 우측 고정 width 400px(max 92vw), `{colors.background-canvas}` bg + `{elevation.box-shadow-xl}` + 좌측 1px `{colors.border-secondary}` 보더 / flex column이다. left 변형은 좌측 고정, bottom 변형은 width 100% / max-height 80vh / 상단 코너 radius `{rounded.size-borderRadius-500}` (16px)다. 헤더는 padding 18 20px + 하단 보더(타이틀 700 / 16px), 본문은 padding 20px / 400 / 14px(line-height 1.6) `{colors.foreground-hint-200}`, 푸터는 padding 16 20px + 상단 보더 + 우측 정렬 gap 8px다 [src:5].

### dialog

다이얼로그는 스크림 `oklch(0 0 0 / .4)` 위에 패널이 떠오른다 — radius `{rounded.size-borderRadius-500}` (16px) · `{elevation.box-shadow-xl}` · padding 24px · max-width 480px이며, 타이틀 700 / 18px `{colors.foreground-secondary-200}`, 본문 400 / 14px(line-height 1.5) `{colors.foreground-hint-200}`, 액션은 우측 정렬 gap 8px다. `backdrop-filter`/frosted glass는 시스템에서 제외된다 [src:5].

### toast

lifted 표면이므로 그림자가 적용되는 몇 안 되는 컴포넌트 중 하나다. `{colors.gray-900}` 배경 + 흰 텍스트, radius `{rounded.size-borderRadius-300}` (8px), `{elevation.box-shadow-lg}`, min-width 280px이며 상태 점과 닫기(×) 아이콘을 동반한다. 다이얼로그와 동일한 스크림 규약을 따른다 [src:5].

### tooltip

solid `{colors.gray-900}` 배경 + 흰 텍스트, radius `{rounded.size-borderRadius-200}` (6px), font 500 / 12px, padding 6 8px의 단일 변형이다. frosted/blur 스타일 변형은 **의도적으로 제공되지 않는다** [src:5].

```tsx
import { Tooltip, Card, Text } from "@vapor-ui/core";

<Tooltip content="삭제하면 복구할 수 없습니다">
  <Button variant="danger-outline">삭제</Button>
</Tooltip>

<Card>
  <Text className="vp-h3">제목</Text>
  <Text className="vp-body2">본문 텍스트는 vp-body2가 기본값입니다.</Text>
</Card>
```

## Do's and Don'ts

**Do**

- product-facing 색은 시맨틱 alias(`{colors.background-{intent}-{level}}` / `{colors.foreground-{intent}-{level}}` / `{colors.border-{intent}}`)로만 호출한다 — raw 팔레트 직접 참조는 새 role을 만들 때만 허용한다 [src:5].
- `{component.card}`는 그림자 대신 1px 헤어라인 보더(`{colors.border-secondary}`)로 분리한다 [src:5].
- 그림자는 lifted 표면(`{component.popover}` · `{component.menu}` · `{component.dialog}` · `{component.toast}`)에만 적용한다 — `{component.card}` · `{component.text-input}` · `{component.button}`에는 at-rest 그림자를 두지 않는다 [src:5].
- 한국어가 1차 언어인 product 카피는 존댓말(~니다/~습니다)로 작성하고, 버튼은 짧은 명령형 동사("저장", "삭제", "닫기")로 통일한다 [src:5].
- bilingual 헤드라인 페어링을 사용한다 — 영문 한 줄 + 한국어 한 줄, 영문은 Title Case [src:5].
- host 앱의 1차 색을 바꿔야 한다면 `@vapor-ui/css-generator`로 빌드 단계에서 키 팔레트(blue 패밀리 등)만 swap한다 — 시맨틱 alias 이름은 유지한다 [src:5].
- focus-visible은 2px `{colors.border-primary}` ring + 2px offset을 항상 보이게 둔다 [src:5].
- 버튼 size xl만 radius `{rounded.size-borderRadius-400}` (12px)을 적용하고 나머지는 `{rounded.size-borderRadius-300}` (8px)을 유지한다 [src:5].

**Don't**

- 그라디언트를 시스템 표면에 사용하지 않는다 — 워드마크 로고와 Getting Started 페이지 컨셉 히어로 두 곳만 예외다 [src:5].
- 글래스/프로스티드/블러·`backdrop-filter`를 사용하지 않는다 — 트랜스페어런시는 `{component.dialog}`/`{component.toast}` 스크림 `oklch(0 0 0 / .4)`에만 허용된다 [src:5].
- 텍스처·반복 패턴·장식 일러스트를 시스템 표면에 사용하지 않는다 [src:5].
- 이모지를 제품 UI에 사용하지 않고, 유니코드 글리프로 아이콘을 대체하지 않는다 — chevron·check·arrow는 모두 SVG다 [src:5].
- `{component.tooltip}`을 frosted/blur 변형으로 만들지 않는다 — solid `{colors.gray-900}` + 흰 텍스트 단일 변형을 유지한다 [src:5].
- Hover/press에서 transform·scale을 사용하지 않는다 — 한 단계 darker step으로 fill을 swap하는 방식만 사용한다 [src:5].
- Inner shadow를 사용하지 않는다 — elevation은 외곽 그림자 4단(`sm/md/lg/xl`)으로만 표현한다 [src:5].
- 챗봇 톤("~해보세요!")이나 마케팅 과장("혁신적", "최고의")을 product 카피에 사용하지 않는다 — "factual, didactic, slightly warm" 톤을 유지한다 [src:5].
- 모션에 바운스·스프링을 사용하지 않는다 — duration은 120/180/240ms 토큰 안에서만 운용한다 [src:5].
- Vapor를 구름이 아닌 제품에 채용할 때 구름의 개발자 도구 도메인(클라우드 IDE·코딩 교육·개발자 커뮤니티 맥락, 영문 Title Case + 한국어 bilingual 헤드라인과 존댓말 product 카피)을 그대로 이식하지 않는다 — Vapor는 `@vapor-ui/css-generator`로 브랜드 색 교체를 전제한 재사용 시스템이므로 차용할 것은 시각 언어(흰 카드 + 1px 헤어라인의 그림자 배제·시맨틱 alias 전제·light-first 화이트 캔버스·비그라디언트/비글래스 원칙·flat 24×24 모노 라인 아이콘)이고, 브랜드 색·제품 도메인은 자기 제품에 맞게 재정의한다 [src:5].
- 디자인시스템 이름 자체(`Vapor UI` 워드마크·`@vapor-ui/*` 패키지명·`vp-*` 클래스 prefix)를 생성하는 제품 UI의 헤더·타이틀·버튼·라벨·클래스 이름에 넣지 않는다 — 차용할 것은 시각 언어이지 시스템 이름이 아니다. UI 텍스트·네이밍은 자기 제품 브랜드로 재정의하고, 출처 표기가 필요하면 footer attribution(예: "Vapor UI 기반")에만 둔다.

## Responsive Behavior

### Breakpoints

Vapor 출처(`@vapor-ui/core`, `vapor.css`)에서 명시적 breakpoint 토큰이 surface되지 않았다 (Known Gaps 참조). 아래는 host 앱에서 일반적으로 사용되는 분기점 권장값으로, Vapor 공식 토큰이 아니라 시스템 운용 가이드다.

| Name | Width | Key Changes |
|---|---|---|
| Mobile | ≤ 640px | `{component.dialog}` → `{component.sheet}` 전환 권장; Table → 카드 stack; HStack → VStack |
| Tablet | 641–1023px | 2-column 카드 그리드; `{component.navigation-menu}` 축소 |
| Desktop | ≥ 1024px | 기본 레이아웃; Figma layout 페이지 기준 outer gutter 100px [src:5] |

### Touch Targets

최소 44 × 44px. `{component.button}` size `md` (32px)는 desktop 한정 — 모바일 surface에서는 size `lg` (40px) 또는 `xl` (48px) 사용. `{component.icon-button}` 32×32는 desktop 한정 — 모바일에서는 별도 wrapping으로 hit area 확장 [src:5].

### Collapsing Strategy

- `{component.dialog}` → `{component.sheet}`: 모바일에서 풀스크린 슬라이드업으로 전환.
- `{component.navigation-menu}`: 모바일에서 햄버거 trigger + `{component.sheet}`로 펼침.
- Table: 모바일에서 각 row를 카드로 stack — Patterns 카테고리의 Table Patterns 가이드를 따른다 [src:5].

### Image Behavior

Vapor 시스템은 imagery treatment를 강제하지 않는다. goorm 마케팅 사진은 `clean, daylight, slightly cool, no grain` 톤을 사용한다 [src:5].

## Known Gaps

- **Responsive breakpoint 토큰** 자체는 Vapor 출처에서 surface되지 않았다 [src:5]. host 앱 측에서 정의하도록 위임된 것으로 추정 — 위 Responsive Behavior 섹션의 분기점은 합리적 권장값이며 Vapor 공식 토큰은 아니다.
- **다크 모드 alias** 일부는 출처에서 "custom dark"로만 표기되어 정확한 OKLCH 값이 공개되지 않았다 (`{colors.background-primary-100}` dark, `{colors.background-success-100}` dark 등) [src:5].
- **Form validation states** — `{component.text-input}` error는 surface되었으나 helper text · success state 등의 토큰화된 정의는 명시되지 않았다 [src:5].
- **카드 padding 기본값** — 시스템 기본값이 별도 강제되지 않고 콘텐츠 주도로 결정된다 [src:5]. 카탈로그 도입 시 host 팀이 자체 padding ladder를 별도 정의해야 한다.
- **아이콘 SVG** — Figma 바이너리에서 깨끗이 추출되지 않아 production 대체로 **Lucide via CDN**(24×24 / 1.5px stroke)을 권장한다 [src:5]. pixel parity가 필요하면 `assets/icons/`에 production SVG를 드랍한다.
- **컴포넌트 커버리지** — 번들 업데이트의 "완성도 패스"로 누락 7종(Select·MultiSelect·Textarea·InputGroup·Popover·Sheet·RadioCard)이 구현되고 Table·Pagination·NavigationMenu가 JSX로 승격되어, 원본 Figma Component 레이어 27개가 전부 컴포넌트로 커버되었다(위 Components에 상세 스펙 반영) [src:5].

## References

1. https://vapor-ui.goorm.io/ — 공식 docs/데모 사이트, goorm 네이밍·운영 컨텍스트.
2. https://blog.goorm.io/vapor-figma-seoul/ — goorm 공식 블로그 "Vapor at Figma Config Seoul 2025", Vapor Squad 조직(2025년 4월 신설, Squad Lead 최준영, CDO 이태성)·SSOT 자동화·MCP Server 컨텍스트.
3. https://www.figma.com/community/file/1508829832204351721/vapor-design-system — Vapor Design System Figma Community 파일.
4. https://www.npmjs.com/package/@vapor-ui/core — `@vapor-ui/core` 1.3.0 npm 페이지(peer 의존, 카테고리, MIT © 2025 goorm Inc.).
5. https://github.com/goorm-dev/vapor-ui — GitHub 모노레포(6 패키지 구조: core / hooks / icons / codemod / color-generator / css-generator, README 카피).
