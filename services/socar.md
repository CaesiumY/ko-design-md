---
name: 쏘카
design_system_name: SOCAR Frame 2.0
slug: socar
category: mobility
last_updated: "2026-06-02"
created_at: "2026-05-22"
sources:
  - https://socarframe.socar.kr/
  - https://socar.kr/
  - https://socarframe.socar.kr/development/components/Alert
  - https://socarframe.socar.kr/development/foundation/Colors
  - https://socarframe.socar.kr/development/components
  - https://socarframe.socar.kr/development/foundation/Spacing
  - https://socarframe.socar.kr/development/foundation/Icons
  - https://socarframe.socar.kr/development/foundation/Typography
  - https://socarframe.socar.kr/development/principle
  - https://socarframe.socar.kr/ux-principles/overview
  - https://socarframe.socar.kr/ux-principles
  - https://socarframe.socar.kr/ux-principles/wow-moment
  - https://socarframe.socar.kr/development/foundation
  - https://socarframe.socar.kr/development/components/Buttons/ActionButton
  - https://socarframe.socar.kr/development/components/Buttons/IconButton
  - https://socarframe.socar.kr/development/components/Buttons/TextButton
  - https://socarframe.socar.kr/development/components/Accordion
  - https://socarframe.socar.kr/development/components/SegmentedControl
  - https://socarframe.socar.kr/development/components/Chip
  - https://socarframe.socar.kr/development/components/Checkbox
  - https://socarframe.socar.kr/development/components/Radio
  - https://socarframe.socar.kr/development/components/SelectionBox
  - https://socarframe.socar.kr/development/components/Skeleton
  - https://socarframe.socar.kr/development/components/Input
  - https://socarframe.socar.kr/development/components/TextArea
  - https://socarframe.socar.kr/development/components/Tab
  - https://socarframe.socar.kr/development/components/TopAppBar
  - https://socarframe.socar.kr/development/components/DatePicker
  - https://socarframe.socar.kr/development/components/TimePicker
  - https://socarframe.socar.kr/development/components/BottomSheet
  - https://socarframe.socar.kr/development/components/Snackbar
  - https://socarframe.socar.kr/development/components/Pattern/Carousel
  - https://socarframe.socar.kr/development/components/Tips/AccentTip
  - https://socarframe.socar.kr/development/components/Tips/InfoTip
  - https://socarframe.socar.kr/development/components/Haptic
  - https://socarframe.socar.kr/ux-principles/release-checklist
  - https://socarframe.socar.kr/ux-principles/trade-off-rules
related_services: []
lang: ko
logo: https://getdesign.kr/logos/socar.png
---

# SOCAR Frame 2.0 — design.md

## Brand & Style

SOCAR Frame 2.0(쏘카프레임 2.0)는 쏘카의 디자인 시스템이며, 브랜드명(쏘카 / SOCAR)과 디자인 시스템명은 별개의 이름이다 [src:9][src:5]. 쏘카는 한국 최대 카셰어링 서비스이며, 전국의 쏘카존(공용 차량 거점)을 기반으로 단기·왕복 차량 대여를 제공하는 한국형 모빌리티 플랫폼이다 [src:1][src:2]. 소비자용 카셰어링 제품과 SOCAR Business 라인을 함께 운영하며, 두 서비스는 토큰 세트에 `{colors.service-socar}`와 `{colors.service-business}` 색으로 각각 기록되어 있다 [src:4].

시스템의 핵심 가치는 "가장 쏘카다운, 가장 효율적인"이며, UX 원칙은 "복잡함을 덜어내고 본질에 집중합니다 — 더 뺄 것이 없을 때까지 덜어냅니다"로 요약된다 [src:9][src:11]. 디자인 원칙 문서는 점진적 개선을 표방해(Legacy & Consistency) 시각 언어를 절제된 방향으로 고정한다 [src:9]. 시각 톤은 차갑고 차분하며 신뢰 지향적이다 — 채도 높은 파랑(`{colors.primary-regular}`)과 푸른 기가 도는 회색 램프가 밝은 표면 위에 놓이는 구조이며, 장식보다 정보 위계가 앞선다 [src:1][src:4].

브랜드 단서는 두 픽셀로 압축된다 — 흰 배경 위의 단일 브랜드 블루(`{colors.primary-regular}`)와 옅게 푸른 회색 워시다 [src:4]. 그라데이션·텍스처·손그림·반복 패턴은 어디에도 없고, 표면은 전부 플랫 필이다 [src:5][src:9]. 위계는 색이 아니라 크기와 굵기로 만든다 — Heading 700 / Title 600 / Body 400이며, 숫자는 bold로, 그 단위 라벨은 regular로 렌더한다(예: **11,900** 원 /시간), 이 규칙이 화면을 한눈에 읽히게 하는 핵심이다 [src:8][src:5]. 아이콘은 이모지가 아니라 커스텀 `icon-*-fill` / `icon-*-line` 폰트(약 150 글리프, 2 weight)에서 가져오며, 코드화된 "이모지 금지" 규칙이 문서·예시 전반에 일관되게 적용된다 [src:7].

주 사용자는 스마트폰 앱으로 가까운 쏘카존에서 차를 빌리는 한국 이용자이며, 야외·한 손 조작 환경에 노출된다 [src:10][src:11]. 릴리스 체크리스트가 "한 손 조작이 가능합니까?", "야외 환경에서도 핵심 정보가 식별됩니까?"를 게이트로 둘 만큼, 이 시스템은 화면 UI가 아니라 이동 경험 전체를 설계 대상으로 본다("Move Better, Design Better") [src:10][src:11]. 원칙 간 트레이드오프 우선순위도 명시되어 있다 — Safety > Essentials > Confidence > Quality > Consistency > Innovation이며, "Wow Moment"는 깜짝 연출이 아니라 차분한 확신과 무마찰로 정의된다 [src:11][src:12].

**SOCAR Frame 2.0은 라이트 모드 전용이다.** 공개된 다크 팔레트가 없으며, 모든 표면 토큰은 밝은 배경(`background-regular`, 본문 흰색)을 전제로 한다 [src:1][src:4]. 다운스트림에서 다크 테마가 필요하다면 별도 제품 근거 위에서 정의해야 하며, 이 문서는 다크 토큰을 추정하지 않는다.

## Colors

SOCAR Frame 2.0은 공식 Colors 페이지에 전체 토큰 세트를 게시하며, 색상 클래스는 `tw-{bg|text|border|fill}-{name}-{step}` 패턴을 따른다 [src:4][src:1]. 아래 값은 공개된 hex 토큰을 ko-design-md 표준에 맞게 OKLCH로 변환한 것이며, **라이트 모드 전용으로 다크 변형은 존재하지 않는다** [src:4][src:1].

```yaml
# Brand / primary (action)
primary-regular: oklch(0.620 0.219 257)   # service-socar / blue-500
primary-strong: oklch(0.586 0.236 261)    # pressed / blue-600
primary-heavy: oklch(0.526 0.224 263)     # heaviest / blue-700
service-business: oklch(0.395 0.197 266)  # SOCAR Business / blue-900

# Blue ramp (brand axis; named steps used by components)
blue-50: oklch(0.962 0.022 248)
blue-100: oklch(0.917 0.040 240)
blue-200: oklch(0.789 0.111 234)   # input focus border
blue-500: oklch(0.620 0.219 257)   # = primary-regular

# Neutral grays (faintly blue-tinted ramp)
gray-50: oklch(0.984 0.002 286)
gray-100: oklch(0.967 0.004 271)
gray-200: oklch(0.927 0.009 264)
gray-300: oklch(0.851 0.018 264)
gray-400: oklch(0.781 0.027 267)
gray-500: oklch(0.687 0.035 265)
gray-600: oklch(0.519 0.039 263)
gray-700: oklch(0.405 0.036 264)
gray-800: oklch(0.331 0.034 264)
gray-900: oklch(0.268 0.030 263)
gray-1000: oklch(0.211 0.026 261)

# Semantic — text
text-strong: oklch(0.211 0.026 261)    # gray-1000
text-primary: oklch(0.331 0.034 264)   # gray-800, default body text
text-secondary: oklch(0.519 0.039 263) # gray-600
text-tertiary: oklch(0.687 0.035 265)  # gray-500
text-disabled: oklch(0.781 0.027 267)  # gray-400

# Semantic — surface / structure
background-regular: oklch(0.967 0.004 271)  # app-surface wash
border-regular: oklch(0.927 0.009 264)
border-weak: oklch(0.967 0.004 271)
divider-regular: oklch(0.927 0.009 264)
divider-weak: oklch(0.967 0.004 271)
white: oklch(1.000 0.000 0)                 # body background
black: oklch(0.000 0.000 0)

# Semantic — overlay (translucent)
dimmed-regular: oklch(0.211 0.026 261 / 0.44)      # modal/sheet dim
pressed-regular: oklch(0.211 0.026 261 / 0.06)     # press-ripple
pressed-dark-regular: oklch(0.000 0.000 0 / 0.08)  # press-ripple on dark fill

# Semantic — status (weak / regular / strong)
information-weak: oklch(0.962 0.022 248)
information-regular: oklch(0.620 0.219 257)
information-strong: oklch(0.586 0.236 261)
positive-weak: oklch(0.974 0.043 158)
positive-regular: oklch(0.745 0.176 162)
positive-strong: oklch(0.706 0.165 163)
caution-weak: oklch(0.978 0.030 92)
caution-regular: oklch(0.741 0.166 56)
caution-strong: oklch(0.712 0.166 53)
negative-weak: oklch(0.957 0.025 14)
negative-regular: oklch(0.649 0.219 19)
negative-strong: oklch(0.594 0.249 21)
notification-red: oklch(0.649 0.219 19)  # badge / notification dot

# Semantic — accent (one representative step per hue)
accent-red: oklch(0.649 0.219 19)
accent-orange: oklch(0.741 0.166 56)
accent-green: oklch(0.745 0.176 162)
accent-lightblue: oklch(0.681 0.156 232)
accent-purple: oklch(0.617 0.214 295)
accent-redorange: oklch(0.683 0.205 41)
accent-indigo: oklch(0.572 0.234 268)
accent-magenta: oklch(0.640 0.245 7)
accent-lime: oklch(0.794 0.214 130)
accent-cyan: oklch(0.733 0.137 207)

# Semantic — domain-specific (mobility)
location-rental: oklch(0.620 0.219 257)  # pickup marker
location-return: oklch(0.487 0.260 268)  # return marker / indigo-700
```

색상 축은 채도 높은 파랑(`{colors.primary-regular}`)이며, 동일 hue를 strong/heavy로 단계화해 눌림 상태를 표현한다 [src:4]. `{colors.primary-regular}`(blue-500)는 유일한 브랜드 색이고, strong/heavy는 press·강한 CTA 용도일 뿐 장식에 쓰지 않는다 [src:4][src:9]. 회색 램프는 순수 회색이 아니라 푸른 기가 옅게 도는 톤이라 전체 온도가 차갑게 읽힌다 [src:1][src:4]. 상태색은 information / positive / caution / negative를 각각 weak·regular·strong 3단계로 분리하며 — weak는 틴트 표면, regular는 아이콘/텍스트 — 배지·알림 점에는 `{colors.notification-red}`를 사용한다 [src:4][src:1]. accent는 10개의 범주형 램프로 차종·위치·상태를 태깅하는 용도이며, 한 화면에 두 개의 accent가 동시에 나오는 일은 드물다 [src:4]. 모빌리티 도메인 토큰으로 픽업 마커 `{colors.location-rental}`와 반납 마커 `{colors.location-return}`가 별도로 정의되어, 쏘카존 기반 지도 UI를 색으로 구분한다 [src:4][src:2].

## Typography

SOCAR Frame 2.0은 **Pretendard Variable** 단일 패밀리로 일원화한다 — 다른 서체와의 페어링 없이 하드 룰로 고정되어 있고, 토큰 CSS는 jsDelivr 웹폰트(`pretendard@v1.3.9`)로 weight 400/500/600/700을 로드하며 한글 글리프 보강을 위해 `Apple SD Gothic Neo`, `Noto Sans KR`를 폴백 스택에 둔다 [src:8][src:4].

```yaml
font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif

weight-regular: 400
weight-medium: 500
weight-semibold: 600
weight-bold: 700

# token: size px / line-height px / weight
display1: 40 / 50 / 700   # letter-spacing 0
display2: 36 / 44 / 700   # letter-spacing -0.6px (only token with negative tracking)
heading1: 26 / 36 / 700
heading2: 24 / 34 / 700
heading3: 22 / 30 / 700
heading4: 20 / 28 / 700
title1: 18 / 26 / 600
title2: 16 / 24 / 600
title3: 14 / 22 / 600
title4: 13 / 20 / 600
body1: 18 / 26 / 400
body2: 16 / 24 / 400   # default body
body3: 14 / 22 / 400
body4: 13 / 20 / 400
caption1: 12 / 18 / 600
caption2: 12 / 18 / 500
caption3: 10 / 16 / 600
caption4: 10 / 16 / 400
```

위계 패턴은 명확하다 — Display·Heading은 bold(700), Title은 semibold(600), Body는 regular(400), Caption은 600/500/400을 섞는다 [src:8][src:5]. 본문 기본 텍스트 색은 `{colors.text-primary}`이며, 산문성 제목 맥락에서는 `{colors.text-strong}`을 쓴다 [src:4]. letter-spacing은 display2(−0.6px)를 제외하면 전부 0이다 [src:4][src:8]. 줄 높이는 1.22–1.6배로 잡혀 작동하는 앱처럼 빽빽하되 한글 렌더링을 수용한다 [src:8][src:5]. 가격·시간·거리 등 숫자는 title1/title2(semibold)로, 그 단위 라벨은 body weight로 분리하는 컨벤션이 반복된다 [src:5][src:8].

## Spacing

간격 체계는 4px 기본 단위에 기반한다 — Spacing 페이지는 "1 unit = 4px"를 명시하고, 스케일은 `spacing-{n}` 토큰 램프로 `n ÷ 25 = px` 규칙을 따른다 [src:6][src:4]. Tailwind 유틸리티(`tw-p-spacing-{n}`, `tw-gap-spacing-{n}`)로 적용된다 [src:4].

```yaml
# spacing-{n} : px  (n / 25 = px)
spacing-0: 0
spacing-25: 1
spacing-50: 2
spacing-100: 4
spacing-125: 5
spacing-150: 6
spacing-200: 8
spacing-250: 10
spacing-300: 12
spacing-350: 14
spacing-400: 16
spacing-450: 18
spacing-500: 20
spacing-550: 22
spacing-600: 24
spacing-650: 26
spacing-700: 28
spacing-750: 30
spacing-800: 32
spacing-900: 36
spacing-1000: 40
```

스케일은 작은 크기 구간(1/2/4/5/6px)에서 촘촘해 타이트한 컴포넌트 패딩을 다루고, 그 위로는 4px 케이던스로 정착한다 [src:6][src:4]. 컨테이너 패딩은 대부분 12 / 16 / 18px, 스택 간격은 대부분 8 / 12px이며, 화면 단위 간격은 `{spacing.spacing-400}` 이상을 기준으로 삼는 구성이 시스템 의도에 맞는다 [src:6][src:5].

## Rounded

코너 반경은 넉넉하게 둥근 토큰 램프이며, spacing과 동일한 `n ÷ 25 = px` 규칙을 따른다 — `radius-{n}` 토큰이 `tw-rounded-radius-{n}`로 적용된다 [src:4]. 부분 적용(`tw-rounded-t-radius-{n}` 상단, `tw-rounded-s/e-radius-{n}` start/end)도 지원한다 [src:6].

```yaml
# radius-{n} : px
radius-100: 4
radius-150: 6
radius-200: 8
radius-250: 10
radius-300: 12
radius-350: 14
radius-400: 16
radius-500: 20
radius-600: 24
radius-circle: 9999   # full pill / circle
```

관찰된 사용처는 명확하며, 시스템은 작은 집합으로만 커밋한다 — 2px/3px 같은 미세 라운딩은 없다 [src:5]. 버튼은 크기에 따라 8–14px(xSmall 8px → large 14px), 카드와 스켈레톤 카드는 16px(`{rounded.radius-400}`), 바텀시트 상단 코너는 24px(`{rounded.radius-600}`)를 쓴다 [src:6][src:14]. 칩은 완전한 pill(고정 50px), 입력 필드·SelectionBox 카드는 14px(`{rounded.radius-350}`), 탭 인디케이터 바·TimePicker 세그먼트는 8–10px(`{rounded.radius-200}`/`{rounded.radius-250}`)다 [src:6][src:4]. 전반적으로 기하적이되 모서리는 일관되게 부드럽다 [src:4][src:6].

## Elevation & Depth

SOCAR Frame 2.0의 깊이 언어는 절제되어 있다 — 표면 분리는 드롭섀도가 아니라 1px 디바이더(`{colors.divider-regular}`)와 `{colors.background-regular}` 배경 워시가 담당하며, 흰 카드가 밝은 회색 필드 위에 간격과 헤어라인으로 구분된다 [src:1][src:4][src:screenshot:home.jpg]. 그림자는 사실상 두 레시피로 희소하다 — 카드는 그림자 대신 디바이더를 받는다 [src:1][src:5].

```yaml
shadow-sm: 0 1px 2px oklch(0.211 0.026 261 / 0.04)
shadow-tip: 0 2px 4px oklch(0.000 0.000 0 / 0.12)
shadow-sheet: 0 0 20px oklch(0.000 0.000 0 / 0.25)
```

그림자 토큰은 존재하지만 모두 미세하다 [src:1][src:4]. `shadow-sm`은 스켈레톤 카드 변형이라는 유일한 카드 예외에, `shadow-tip`은 툴팁 버블(AccentTip·InfoTip)에, `shadow-sheet`는 부양된 바텀시트에 쓰는 강도다 [src:1][src:5]. inner shadow도, elevation 토큰 시스템도 없다 [src:1]. **모든 그림자 토큰은 라이트 모드 값이다** — 다크 모드 대응 elevation은 공개되지 않았으므로, 다크 표면이 필요하면 별도 근거 위에서 정의해야 한다 [src:1][src:4].

## Shapes

형태 언어는 정돈된 기하 구조 위에 넉넉한 반경을 얹는 방식이다 [src:4][src:6]. 칩은 완전한 pill, 카드와 시트는 12–24px 반경을 일관되게 써서 접근하기 쉽되 질서 있는 인상을 만든다 — 유기적이라기보다 기하적이다 [src:4][src:6]. 그라데이션은 없고 모든 표면은 플랫 필이며, 차량·위치 썸네일 이미지는 항상 radius-300/400 카드 안에 마스킹되어 앱 크롬 안에서 full-bleed로 깔리지 않는다 [src:1][src:5].

시각적 절제는 표면 처리에서도 드러난다 — 곡선은 모서리 반경으로만 표현되고, 표면 구분은 곡면이나 그림자가 아니라 1px 헤어라인과 배경 워시로 처리된다 [src:1]. 시그니처 인터랙션은 press feedback이다 — 인터랙티브 표면이 `:active`에서 92%로 축소되고 `::after` 리플 오버레이가 함께 뜬다(`active:tw-scale-[92%]` + `active:after:tw-bg-pressed-dark-regular`, 리플 radius는 컴포넌트 radius에 클리핑) [src:1]. 텍스트 인접 행(chip / checkbox / radio)은 94–96%로 더 약하게 축소한다 [src:1]. 모션은 짧고 표준적이다 — `duration-100`(100ms), `duration-150`(150ms), `ease-standard`(`cubic-bezier(0.42, 0, 0.58, 1)`)이며, spring/bounce나 화면 전환 페이드는 없다 [src:1]. hover 상태는 사실상 존재하지 않고 press가 모든 피드백을 담당한다 [src:1].

## Components

SOCAR Frame 2.0은 React 18 + Tailwind v3(커스텀 `tw-` 프리픽스) + framer-motion 라이브러리이며, `@socar-inc/socar-frame-components`로 배포되고 `@socar-inc/socar-frame-foundation`을 peer dependency로 둔다 [src:5]. 코퍼스는 24개 컴포넌트(비시각 Haptic 포함 25번째)를 문서화하며, 각 컴포넌트는 base 클래스 + size 축 + variant 축 + state로 분해된다 [src:5]. 아래는 시스템의 시그니처 패턴이다.

### action-button-fill-primary

ActionButton의 1차 fill/primary variant다 — 페이지의 주 행동을 담당하며 배경은 `{colors.primary-regular}`, 텍스트는 흰색이다 [src:1][src:14]. 4개 크기(large 56px → xSmall 32px height)를 지원하고, radius는 크기에 따라 8–14px(xSmall 8 → small 10 → medium 12 → large 14)로 스케일하며 타이포는 caption2→title2로 함께 오른다 [src:1][src:14]. `hapticConfig` prop으로 웹뷰 햅틱을 연결할 수 있다 [src:1][src:14].

```tsx
<ActionButton styleType="fill" variant="primary" size="large">
  예약하기
</ActionButton>
```

### action-button-fill-secondary

fill/secondary variant는 1차 행동보다 낮은 우선순위의 확정 행동에 쓴다 [src:1][src:14]. 배경은 `{colors.blue-100}`(연한 파랑), 텍스트는 `{colors.primary-strong}`로, `{component.action-button-fill-primary}`와 구조를 공유하되 색 위계를 낮춘다 [src:1][src:14].

```tsx
<ActionButton styleType="fill" variant="secondary" size="large">
  다음에
</ActionButton>
```

### action-button-fill-tertiary

fill/tertiary variant는 가장 낮은 위계의 보조 행동용이다 [src:1][src:14]. 배경은 `{colors.gray-100}`(= `{colors.background-regular}` 톤), 텍스트는 `{colors.text-primary}`를 써서 중립 표면처럼 읽히게 한다 [src:1][src:14].

```tsx
<ActionButton styleType="fill" variant="tertiary" size="medium">
  취소
</ActionButton>
```

### action-button-outlined

styleType outlined는 흰 배경 + 1px `{colors.divider-regular}` 보더로 구성되며 높이가 fill보다 2px 크다 [src:14]. variant는 primary(`{colors.primary-regular}` 텍스트)·secondary(`{colors.text-primary}` 텍스트)만 지원하고, tertiary 요청 시 primary로 폴백한다 [src:14].

```tsx
<ActionButton styleType="outlined" variant="primary" size="medium">
  자세히 보기
</ActionButton>
```

### action-button-pressed

ActionButton의 눌림 상태는 별도 시각 상태로 다룬다 — 시그니처 press feedback에 따라 표면이 `:active`에서 92%로 축소되고, 진한 fill 위에서는 `{colors.pressed-dark-regular}` 리플 오버레이가 크기별 radius에 클리핑되어 함께 뜬다 [src:1][src:14]. loading은 `{colors.gray-100}` 필 + Lottie 로더로 전환하며 클릭을 막고, disabled는 불투명도 변화 없이 `{colors.gray-100}` 배경 / `{colors.text-disabled}` 텍스트로 재색칠한다 [src:14].

```tsx
<ActionButton styleType="fill" variant="primary" loading />
```

### icon-button

완전 원형(`{rounded.radius-circle}`) 정사각 비율의 아이콘 전용 버튼이며, xSmall→xLarge 5개 크기를 지원한다(측정 표본 large 약 46px, xSmall 약 28px) [src:1][src:15]. 배경·보더 색은 자유 커스텀이고, 모빌리티 아이콘 세트(`icon-car`, `icon-charging`, `icon-bolt` 등)를 `-fill`/`-line` 스타일로 담으며, press 리플은 원형으로 클리핑된다 [src:7][src:15].

```tsx
<IconButton size="medium" icon={<IconCarLine />} aria-label="차량" />
```

### text-button

배경 없는 텍스트 버튼으로 반경은 4px(`{rounded.radius-100}`) 고정, padding 4/2px 고정이며, 색은 variant로 정해진다 — primary `{colors.primary-regular}`, secondary `{colors.text-primary}`, tertiary `{colors.text-secondary}` [src:1][src:16]. 4개 크기는 타이포·높이만 바꾸고(22→28px), 옵션으로 underline을 가진다 [src:16].

```tsx
<TextButton variant="primary" size="large">전체 보기</TextButton>
```

### accordion

펼침/접힘 패널 컨테이너다 — `useAccordion` 훅으로 `single`/`multiple`/`manual` 모드를 제어하며(`openValues`/`onOpenChange`), 컨테이너는 `{rounded.radius-150}`(6px)에 1px `{colors.gray-100}` 보더와 `gap-2`를 두고, 각 항목은 질문 + 셰브론의 trigger 행과 답변 panel로 구성된다 [src:17][src:screenshot:accordion.png].

```tsx
<Accordion type="single" defaultValue="q1">
  <Accordion.Item value="q1" trigger="결제는 언제 되나요?">
    예약 확정 시점에 결제됩니다.
  </Accordion.Item>
</Accordion>
```

### badge

`content`(숫자/텍스트 pill)와 `dot` 두 variant를 가지며, 기본 배경은 `{colors.notification-red}`, 옵션으로 1px 흰 보더(`hasBorder`)를 둔다 [src:1][src:4]. content는 높이 20px·min-width 20px·radius 17px pill에 `{typography.caption1}` 흰 텍스트, dot은 6×6px이며, 대상 위 우상단에 absolute로 오프셋된다 [src:4]. 색은 `backgroundColor`/`textColor`/`borderColor` prop으로 커스텀한다 [src:4].

```tsx
<Badge variant="content" size="medium">9+</Badge>
<Badge variant="dot" />
```

### chip

선택 가능한 pill이며 반경은 50px 고정, padding 8/12px·gap 6px다 [src:1][src:19]. 크기는 medium/small/xSmall(높이 36–40px, 타이포 body2/3/4)이며, 선택 상태는 `{colors.blue-50}` 배경 + 1px `{colors.primary-regular}` 보더 + `{colors.primary-regular}` 텍스트, 비선택은 흰 배경 + 1px `{colors.border-regular}` + `{colors.text-secondary}` 텍스트로 표시한다 [src:19]. press 시 `scale(0.95)` + `{colors.pressed-regular}` 리플, focus-visible 시 2px `{colors.primary-regular}` 링이 뜬다 [src:19]. 홈 화면의 필터 행("전체 · 경/소형 · 중형 · SUV · 전기 · 수입")이 이 컴포넌트다 [src:screenshot:home.jpg].

```tsx
<Chip selected onClick={onFilter}>SUV</Chip>
```

### checkbox

복수 선택 행 + 그룹이다 — 행 `<label>`은 48px 높이(padding 12/16, gap 8)에 **20×20 원형** 컨트롤(2px `{colors.gray-500}` 보더)을 두고, 그룹 `<fieldset>`은 `{rounded.radius-150}`·`{colors.gray-100}` 배경·max-width 520px다 [src:20][src:screenshot:checkbox.png]. press 시 `scale(0.96)` + `{rounded.radius-150}` + `{colors.pressed-regular}` 배경이 적용되고, 라벨 텍스트는 `{typography.body2}`/`{colors.text-primary}`다 [src:20].

```tsx
<Checkbox.Group legend="옵션 선택">
  <Checkbox value="hipass">하이패스</Checkbox>
</Checkbox.Group>
```

### checkbox-checked

체크 상태의 20×20 컨트롤은 배경·보더가 `{colors.primary-strong}`로 채워지고 안에 흰 체크 path가 그려진다 [src:20]. disabled+checked 조합에서는 컨트롤이 `{colors.gray-300}`으로 강등된다 — 불투명도가 아니라 색 토큰 교체로 비활성을 표현한다 [src:20].

```tsx
<Checkbox value="hipass" checked />
```

### radio

단일 선택 행 + 그룹이며 구조는 `{component.checkbox}`와 동형이다 — 같은 48px 행(padding 12/16, gap 8), 같은 20×20 원형 2px 컨트롤, 같은 `{colors.gray-100}` 그룹을 쓴다 [src:21][src:screenshot:radio.png]. 차이는 체크 표시 방식뿐이다 — 선택 시 흰 체크 대신 안쪽 dot(`{colors.primary-strong}`)을 표시하며, 그룹 단위로 버튼·텍스트 색을 커스텀할 수 있다 [src:21].

```tsx
<Radio.Group legend="차종" defaultValue="suv">
  <Radio value="suv">SUV</Radio>
  <Radio value="compact">경/소형</Radio>
</Radio.Group>
```

### selection-box

큰 선택 카드 + 그룹(단일 선택)이다 — 카드 `<label>`은 `{rounded.radius-350}`(14px), 가로 full, 약 82px 높이(타이틀 + 서브텍스트, 선택적 좌측 컨트롤/아이콘)이며 press 시 `scale(0.96)` + `{colors.pressed-regular}` 배경이 적용된다 [src:22][src:screenshot:selectionbox.png]. 선택 상태는 강조 보더·배경을 입히며(선택색은 `{colors.primary-regular}` 계열), 그룹은 `<fieldset>` + `<legend>`(`{typography.body2}`)로 묶는다 [src:22]. 부분 스펙 컴포넌트라 정확한 선택 보더 토큰은 doc 페이지·스크린샷과 함께 확인해야 한다 [src:22].

```tsx
<SelectionBox.Group legend="보험 선택" defaultValue="basic">
  <SelectionBox value="basic" title="기본 자기부담금" subText="면책 30만원" />
</SelectionBox.Group>
```

### tag

비인터랙티브 라벨이며 `<div>` `cursor-default`, 반경 6px(`{rounded.radius-150}`), padding 4/8px·gap 4px다 [src:1][src:5]. 크기는 타이포만 바꾸고(title4 / caption1 / caption3, 약 28–30px 높이), 배경·텍스트 색은 커스텀이다(예: `{colors.gray-100}` 또는 `{colors.blue-50}` 표면에 `{colors.primary-regular}` 텍스트) [src:5].

```tsx
<Tag>전기차</Tag>
```

### skeleton

로딩 플레이스홀더로 `{colors.gray-100}` 베이스에 웨이브 시머 애니메이션을 얹는다 [src:23][src:screenshot:skeleton.png]. 모양은 세 가지다 — 사각(기본 `{rounded.radius-300}` 12px), 원형(`{rounded.radius-circle}`), 카드(`{rounded.radius-400}` 16px + 1px `{colors.border-regular}` 보더 + `shadow-sm`) [src:23]. 카드 변형은 시스템에서 유일하게 그림자를 갖는 카드 케이스이며, width/height/radius를 prop으로 받는다 [src:23][src:1].

```tsx
<Skeleton shape="card" width={320} height={120} />
```

### input

단일 행 텍스트 입력이다 — `<label>`(`{typography.body2}`/`{colors.text-secondary}`) + 필드 래퍼(gap 10px, py 7px, 약 48px 높이) + 도움말 `<p>`(`{typography.body3}`/`{colors.text-tertiary}`)로 구성된다 [src:24][src:screenshot:input.png]. 전화·금액·날짜·시퀀스 빌트인 포매터와 React-Hook-Form을 지원한다 [src:24]. 세 variant 모두 focus 시 보더가 `{colors.blue-200}`로 바뀐다 [src:24].

```tsx
<Input variant="filled" label="휴대폰 번호" formatter="phone"
  helperText="숫자만 입력하면 자동으로 하이픈이 추가됩니다." />
```

### input-filled

filled variant는 `{rounded.radius-350}`(14px) + `{colors.gray-100}` 배경 + 1px 투명 보더이며, focus-within 시 보더가 `{colors.blue-200}`로 나타난다 [src:24].

```tsx
<Input variant="filled" label="이름" />
```

### input-outlined

outlined variant는 흰 배경 + 1px `{colors.divider-regular}` 보더이며, focus-within 시 `{colors.blue-200}`로 강조된다 — filled와 radius·padding(L12/R8)을 공유하되 표면만 다르다 [src:24].

```tsx
<Input variant="outlined" label="이메일" />
```

### input-underline

underline variant는 하단 보더만 두고 평소 opacity 0, focus-within 시 opacity 100 + `{colors.blue-200}`로 드러난다 [src:24]. 좌우 padding과 라운딩이 없어 가장 가벼운 표면이다 [src:24].

```tsx
<Input variant="underline" label="쿠폰 코드" />
```

### text-area

멀티라인 입력이다 — 필드 `<div>`가 `flex-col`로 textarea + 글자수 카운터를 수직 배치하며, 최소 높이 64px(내용 따라 auto-grow), `{rounded.radius-350}`, `{colors.gray-100}` 배경, 1px `{colors.divider-regular}` 보더, 내부 gap 12px다 [src:25][src:screenshot:textarea.png]. 카운터 `<p>`는 `{typography.body3}`/`{colors.text-tertiary}`로 "0/200" 형식이며, 커스텀 포매터를 지원한다 [src:25].

```tsx
<TextArea label="요청 사항" maxLength={200} />
```

### top-app-bar

상단 앱 바이며 최소 높이 52px, 흰 배경이다 [src:1][src:27]. 컴파운드 파트는 `BasicBackButton`, `Title`(general/scroll 타입), `TrailingButtonSlot`(액션 최대 3개), 그리고 `fetch` URL의 진행도를 추적하는 헤드리스 `LoadingBar`로 구성된다 [src:1]. 홈 화면 상단의 뒤로가기 화살표·타이틀·오버플로 메뉴가 이 패턴이며, `BasicBackButton`은 네이티브 `window.onClickNavigation` 브리지를 호출한다 [src:1][src:screenshot:home.jpg].

```tsx
<TopAppBar>
  <TopAppBar.BasicBackButton />
  <TopAppBar.Title type="general">SOCAR</TopAppBar.Title>
  <TopAppBar.TrailingButtonSlot>{/* max 3 */}</TopAppBar.TrailingButtonSlot>
</TopAppBar>
```

### bottom-sheet

바텀시트는 4개 detent(tip / half / full / max)를 가지며 — freeform 높이는 허용하지 않는다 — 드래그로 열고 닫는다 [src:1][src:30]. 패널 상단 코너는 `{rounded.radius-600}`(24px), 딤 오버레이는 `{colors.dimmed-regular}`, 부양 변형은 `shadow-sheet`를 더한다 [src:30]. 푸터의 ActionButton은 `flex-1 min-w-[120px]`로 가로 분할된다 [src:30].

```tsx
<BottomSheet detent="half">{/* content */}</BottomSheet>
```

### date-time-picker

캘린더 기반 날짜·기간 피커(DatePicker)와 드래그 휠 시간 피커(TimePicker, 46px 세그먼트)다 [src:1][src:28][src:29]. DatePicker는 흰 컨테이너에 `{typography.heading2}` 월 헤더 + 요일 행 + 32px 일자 셀(focus-visible 2px `{colors.gray-800}` 링)을 두고, 기간 하이라이트는 `{colors.gray-200}` 밴드로 시작은 좌측 24px·끝은 우측 24px 라운딩(`{rounded.radius-600}`)된다 [src:28]. TimePicker 세그먼트는 `{colors.gray-100}` 배경에 좌/우 `{rounded.radius-250}`(10px) 라운딩이다 [src:29]. 홈 화면의 대여/반납 날짜 카드("대여 / 반납", "최대 범위 10일")가 이 패턴을 입력으로 받는다 [src:screenshot:home.jpg].

```tsx
<DatePicker mode="range" maxRange={10} />
<TimePicker step={10} />
```

### alert

명령형으로 여는 모달 다이얼로그다 — `Alert.open()`이 Promise를 반환하며, variant는 Default / Dialog / Basic / Sequence / Portal이다 [src:1][src:3]. 딤 오버레이는 `{colors.dimmed-regular}`, 중앙 패널은 둥근 흰 표면에 drop shadow + 타이틀(최대 2줄) + ActionButton으로 구성된다 [src:3]. 부분 스펙 컴포넌트라 variant별 정확한 동작은 doc 페이지와 함께 확인해야 한다 [src:3].

```tsx
const ok = await Alert.open({ variant: "dialog", title: "예약을 취소할까요?" });
```

### snackbar

화면 하단에 뜨는 일시적 토스트이며 어두운 둥근 컨테이너에 텍스트 + 선택적 액션/아이콘을 담고 일정 시간 후 자동으로 사라진다 [src:1][src:31]. 성공 상태는 느낌표가 아니라 체크 아이콘으로 표시한다 — 차분한 확신을 유지하는 규칙이다 [src:31][src:1].

```tsx
<Snackbar>예약이 취소되었습니다</Snackbar>
```

### segmented-control

탭형 토글이며 컨테이너는 `{rounded.radius-150}`~`{rounded.radius-200}`(6–8px) 계열, 세그먼트가 배지/카운트(`9+`)를 가질 수 있고 5개까지 관찰된다 [src:18]. 부분 스펙 컴포넌트라 세그먼트 단위 정밀 값은 doc 페이지·스크린샷과 함께 확인해야 한다 [src:18].

```tsx
<SegmentedControl value={tab} onChange={setTab} />
```

### tab

상단 고정 탭 내비게이션이며 sticky 바는 1px 하단 보더(`{colors.border-regular}`) + `{colors.gray-100}` 배경 + padding-x 16px다 [src:26]. 탭 항목 `<a>`는 30px 높이·`{typography.title2}`이며 active 텍스트 `{colors.text-primary}` / inactive `{colors.text-secondary}`, press 시 `scale(0.94)`다 [src:26]. 2px 슬라이딩 인디케이터 바는 `{rounded.radius-200}`에 `{colors.gray-800}` 색으로 선택 탭을 따라 슬라이드한다 [src:26].

```tsx
<Tab activeKey="share">{/* tab items */}</Tab>
```

### carousel

슬라이드 캐러셀이며 트랙 + 원형 nav 버튼(32px, IconButton 동형, press 리플 포함) + 페이지 인디케이터로 구성된다 [src:32]. 인디케이터 도트는 5×12px pill이며 활성은 `{colors.primary-regular}`(blue-500), 비활성은 `{colors.border-regular}`(gray-200)다 — 또는 "n / m" `{typography.body2}` 카운터로 대체할 수 있다 [src:32]. `loop`·자동재생·`onIndexChange` 옵션을 가진다 [src:32].

```tsx
<Carousel loop>{/* slides */}</Carousel>
```

### accent-tip

강조 툴팁(컨텍스트 안내 말풍선)이다 — portal로 렌더되는 버블이 `{rounded.radius-250}`(10px), padding 6/12px, 흰 `{typography.body3}` 텍스트(짧으면 `{typography.body4}`), `shadow-tip`(`0 2px 4px`)을 가진다 [src:33][src:screenshot:tips-accenttip.png]. 배경색은 커스텀 가능하며(기본 `{colors.black}`, 옵션으로 purple/cyan 틴트), top/bottom/left/right 방향 배치와 `Always`/자동 소멸 모드, TextButton형 트리거를 지원한다 [src:33].

```tsx
<AccentTip placement="top" content="여기를 눌러 위치를 바꿀 수 있어요">
  <TextButton variant="primary" size="small">위치 변경</TextButton>
</AccentTip>
```

### info-tip

정보 툴팁이며 구조는 `{component.accent-tip}`과 동형이다 — 같은 `{rounded.radius-250}`(10px), 같은 6/12px padding, 같은 흰 `{typography.body3}`/`{typography.body4}` 텍스트, 같은 `shadow-tip`을 쓴다 [src:34][src:screenshot:tips-infotip.png]. 차이는 트리거 카피 맥락으로, "무엇을 의미하나요?" 같은 24px 높이 TextButton 트리거가 정보 설명 버블을 연다 [src:34].

```tsx
<InfoTip content="면책금은 사고 시 본인 부담 한도입니다">
  <TextButton variant="secondary" size="small">무엇을 의미하나요?</TextButton>
</InfoTip>
```

### haptic

비시각 유틸리티로, 웹뷰 햅틱 피드백을 구성한다 [src:1][src:35]. `HapticConfig` 객체(`disable` bool, `eventType` pointerdown/pointerup, `type`)를 받으며, 버튼류의 `hapticConfig` prop으로 연결된다(기본값 ActionButton `REGULAR`, IconButton/TextButton `WEAK`, Alert `ALERT_WARNING`) [src:35]. 햅틱은 1급 시민으로, 네이티브 iOS/Android 웹뷰 안에서 동작한다 [src:35][src:1].

```tsx
<ActionButton hapticConfig={{ type: "REGULAR" }} />
```

## Do's and Don'ts

**Do** raw 색상 스케일을 표면에 직접 흩뿌리지 말고, `{colors.primary-regular}`, `{colors.text-primary}`, `{colors.background-regular}`, `{colors.notification-red}` 같은 시맨틱 토큰으로 의도를 먼저 표현한다 [src:4][src:1].

**Do** 표면 분리는 그림자보다 1px 디바이더(`{colors.divider-regular}`)와 `{colors.background-regular}` 워시로 먼저 해결한다 — SOCAR Frame의 깊이 언어는 절제가 기본값이다 [src:1][src:5].

**Do** 단일 채도 블루(`{colors.primary-regular}`)와 단일 Pretendard Variable 패밀리만 쓰고, 그라데이션과 이모지를 배제한다 — 아이콘은 SOCAR 커스텀 아이콘 폰트(`icon-*-fill`/`icon-*-line`)를 1차로 쓰고 미공개 환경에서만 Lucide로 대체하며, `►`·`→`·`★` 같은 유니코드 의사 아이콘으로 대체하지 않는다 [src:9][src:7].

**Do** 숫자는 bold로, 그 단위 라벨은 regular로 분리해 가격·시간·거리를 한눈에 읽히게 한다 — 시스템 전반의 반복 컨벤션이다 [src:8][src:5].

**Do** CTA 카피는 동사로 시작하고 마침표·느낌표 없이, 한국어 정중체(`-요`/`합니다`)로 주어를 생략해 쓴다(예: `예약하기`, `자세히 보기`, `다음에`, `취소`) [src:9][src:11].

**Do** 모든 인터랙티브 표면에 press feedback을 건다 — `scale(0.92)` + `{colors.pressed-dark-regular}` 리플이 표준이며, 텍스트 인접 행(chip/checkbox/radio)은 94–96%로 약하게 둔다 [src:1].

**Do** ActionButton은 `styleType`·`variant`·`size`를 명시해 구현하고, 한 화면의 primary slot은 하나만 둔다 [src:14][src:1].

**Do** 한 손·야외 조작을 전제로, 핵심 정보의 대비를 높게 유지하고 탭 타깃을 넉넉히 잡는다 — 릴리스 체크리스트의 "한 손 조작이 가능합니까?", "야외 환경에서도 핵심 정보가 식별됩니까?"가 설계 게이트다 [src:11][src:36].

**Do** 지도 UI에서 픽업과 반납 위치는 `{colors.location-rental}`과 `{colors.location-return}`로 구분한다 — 쏘카존 모델을 색으로 인코딩한 도메인 토큰이다 [src:4][src:2].

**Don't** 공개된 컴포넌트 목록에 없는 HeroBanner, PromoCard 같은 이름을 SOCAR Frame 컴포넌트처럼 만들지 않는다 [src:1][src:5].

**Don't** 다크 모드 토큰을 추정해서 만들지 않는다 — SOCAR Frame 2.0은 라이트 모드 전용이며 공개된 다크 팔레트가 없다 [src:1][src:4].

**Don't** "혁신적", "차세대" 같은 마케팅 수사로 UI 카피를 채우지 않는다 — UX 원칙이 "쉬운 언어로 작성되어 있습니까?"와 3초 테스트를 게이트로 두며, 안전·가독성이 시각적 완성도보다 앞선다(우선순위 Safety > Essentials > Confidence > Quality > Consistency > Innovation) [src:11][src:37].

**Don't** 강한 드롭섀도로 표면을 부양시키지 않는다 — 그림자 토큰은 모두 미세하며, 과한 elevation은 시스템 톤과 충돌한다 [src:1].

**Don't** 사용자에게 `당신`·`저희`·`우리`를 쓰지 않는다 — 사용자 소유물은 `내 …`(`내 쿠폰`, `내 위치`)로, 브랜드는 3인칭 `쏘카`로 칭하며, 성공 상태도 `걱정하지 마세요!` 대신 결과를 먼저 알리는 차분한 카피(`취소 수수료 3,000원이 발생합니다.`)를 쓴다 [src:1].

**Don't** 쏘카의 차량공유 도메인(대여·반납 예약 흐름, `{colors.location-rental}`/`{colors.location-return}`로 인코딩한 쏘카존 지도 모델, 대여/반납 날짜 범위 선택)을 성격이 다른 제품에 그대로 이식하지 않는다 — 차용할 것은 시각 언어(단일 채도 블루 primary·Pretendard Variable 위계·넉넉한 라운드와 pill 칩·미세 elevation + 1px 헤어라인·active 92% scale + ripple 피드백)이지 쏘카의 모빌리티 서비스 개념이 아니다 [src:4][src:2].

**Don't** 디자인시스템 이름 자체(`SOCAR Frame` 워드마크·버전 표기)를 생성하는 제품 UI의 헤더·타이틀·버튼·라벨에 넣지 않는다 — 차용할 것은 시각 언어이지 시스템 이름이 아니다. UI 텍스트·네이밍은 자기 제품 브랜드로 재정의하고, 출처 표기가 필요하면 footer attribution에만 둔다.

## Responsive Behavior

| Context | Key Changes |
| --- | --- |
| Baseline viewport | 시스템은 375px 모바일 웹뷰를 기준 컨텍스트로 본다 — `webview-unselectable`/`webview-` 클래스가 반복되며, 컴포넌트 스펙의 computed px 값은 이 폭을 전제로 측정된다 [src:1][src:9]. |
| Published breakpoint system | 공개 조사 범위에서 명시적 breakpoint 토큰 시스템은 surfaced되지 않았다 (no published breakpoint system surfaced); 제품 토큰은 미디어 쿼리 breakpoint를 갖지 않으며, 데스크톱↔모바일 collapse는 제품 구현 쪽에서 별도 정의해야 한다 [src:1]. |
| Top navigation | `{component.top-app-bar}`는 최소 높이 52px로 고정되며 `TrailingButtonSlot`은 액션을 최대 3개로 제한한다 — 좁은 화면에서 상단 액션이 넘치지 않도록 슬롯 수가 강제된다 [src:1][src:27]. |
| Touch target | UX 원칙이 한 손·야외 조작을 게이트로 두므로 탭 타깃은 넉넉히 확보해야 한다 — ActionButton 높이는 32/40/46/56px, Chip 36–40px, Checkbox/Radio 행 48px, TimePicker 세그먼트 46px이며, 핵심 행동 버튼은 large(56px)를 우선한다 [src:5][src:11]. |
| Bottom-fixed action | 하단 고정 액션 영역이 표준 레이아웃이다 — 흰 가격 요약 plate 위에 단일 large ActionButton(fill/primary)을 두는 패턴이 반복된다 [src:1][src:5]. |
| Sheet 기반 내비게이션 | `{component.bottom-sheet}`는 4개 detent(tip/half/full/max)와 드래그 제스처로 좁은 화면의 단계적 노출을 담당한다 — 상단 복합 메뉴보다 하단 시트를 우선 고려한다 [src:1][src:30]. |
| Hover | hover 상태는 사실상 존재하지 않는다 — 모바일 우선 시스템이라 press가 모든 피드백을 담당한다 [src:1]. |
| Imagery | 차량·위치 썸네일은 항상 radius-300/400 카드 안에 마스킹되며, 좁은 폭에서도 full-bleed로 깔지 않는다 [src:1]. |
| Webview-hybrid 패턴 | 컴포넌트는 네이티브 iOS/Android 웹뷰에 임베드되며, `{component.haptic}`과 `BasicBackButton`의 `window.onClickNavigation` 브리지가 네이티브 동작을 연결한다 [src:1][src:35]. |

## Known Gaps

- **다크 모드 미공개.** SOCAR Frame 2.0은 라이트 모드 전용이며, 모든 표면·그림자 토큰의 다크 대응값이 공개되지 않았다 — 다크 테마가 필요하면 다운스트림에서 별도 정의해야 한다 [src:1][src:4].
- **명시적 breakpoint 시스템 부재.** 375px 모바일 폭을 기준 컨텍스트로 두지만, 제품 토큰에 데스크톱 레이아웃 분기를 위한 미디어 쿼리 breakpoint는 surfaced되지 않았다 — 문서 사이트의 데스크톱 레이아웃은 제품 토큰 세트가 아니다 [src:1].
- **부분 스펙 컴포넌트.** 코퍼스는 19개 컴포넌트를 완전 build-grade로, 5개(SelectionBox · SegmentedControl · TopAppBar · Alert · Snackbar)를 부분 스펙으로 문서화한다 — 데모 래퍼 중첩 또는 포털/트랜션트 렌더링 탓에 이들의 전체 variant·선택 보더·표시 시간 등 일부 computed 값은 doc 페이지·스크린샷과 함께 재구성해야 한다 [src:5][src:18][src:3].
- **OKLCH 변환값.** 모든 색상은 공개 hex 토큰을 OKLCH로 변환한 것이며, 원본 시스템은 hex로 게시한다 — 미세한 변환 오차가 있을 수 있다 [src:4].

## References

1. https://socarframe.socar.kr/
2. https://socar.kr/
3. https://socarframe.socar.kr/development/components/Alert
4. https://socarframe.socar.kr/development/foundation/Colors
5. https://socarframe.socar.kr/development/components
6. https://socarframe.socar.kr/development/foundation/Spacing
7. https://socarframe.socar.kr/development/foundation/Icons
8. https://socarframe.socar.kr/development/foundation/Typography
9. https://socarframe.socar.kr/development/principle
10. https://socarframe.socar.kr/ux-principles/overview
11. https://socarframe.socar.kr/ux-principles
12. https://socarframe.socar.kr/ux-principles/wow-moment
13. https://socarframe.socar.kr/development/foundation
14. https://socarframe.socar.kr/development/components/Buttons/ActionButton
15. https://socarframe.socar.kr/development/components/Buttons/IconButton
16. https://socarframe.socar.kr/development/components/Buttons/TextButton
17. https://socarframe.socar.kr/development/components/Accordion
18. https://socarframe.socar.kr/development/components/SegmentedControl
19. https://socarframe.socar.kr/development/components/Chip
20. https://socarframe.socar.kr/development/components/Checkbox
21. https://socarframe.socar.kr/development/components/Radio
22. https://socarframe.socar.kr/development/components/SelectionBox
23. https://socarframe.socar.kr/development/components/Skeleton
24. https://socarframe.socar.kr/development/components/Input
25. https://socarframe.socar.kr/development/components/TextArea
26. https://socarframe.socar.kr/development/components/Tab
27. https://socarframe.socar.kr/development/components/TopAppBar
28. https://socarframe.socar.kr/development/components/DatePicker
29. https://socarframe.socar.kr/development/components/TimePicker
30. https://socarframe.socar.kr/development/components/BottomSheet
31. https://socarframe.socar.kr/development/components/Snackbar
32. https://socarframe.socar.kr/development/components/Pattern/Carousel
33. https://socarframe.socar.kr/development/components/Tips/AccentTip
34. https://socarframe.socar.kr/development/components/Tips/InfoTip
35. https://socarframe.socar.kr/development/components/Haptic
36. https://socarframe.socar.kr/ux-principles/release-checklist
37. https://socarframe.socar.kr/ux-principles/trade-off-rules
