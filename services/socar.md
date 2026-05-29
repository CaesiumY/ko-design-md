---
name: 쏘카
design_system_name: SOCAR Frame 2.0
slug: socar
category: mobility
last_updated: "2026-05-22"
created_at: 2026-05-22
sources:
  - https://socarframe.socar.kr/
  - https://socarframe.socar.kr/development/components
  - https://socarframe.socar.kr/development/foundation
  - https://socarframe.socar.kr/development/components/Buttons/ActionButton
  - https://socarframe.socar.kr/development/foundation/Spacing
  - https://socarframe.socar.kr/development/foundation/Colors
  - https://socarframe.socar.kr/development/principle
  - https://socarframe.socar.kr/development/foundation/Typography
  - https://socarframe.socar.kr/ux-principles
  - https://www.socar.kr/
  - https://socarframe.socar.kr/development/components/Badge
related_services: []
lang: ko
logo: https://getdesign.kr/logos/socar.png
---

# SOCAR Frame 2.0 — design.md

## Brand & Style

SOCAR Frame 2.0(쏘카프레임 2.0)는 쏘카의 디자인 시스템이며, 브랜드명(쏘카 / SOCAR)과 디자인 시스템명은 별개의 이름이다 [src:7][src:2]. 쏘카는 10분 단위로 과금하는 카셰어링을 중심으로 장기 렌트, 쏘카구독, 블랙라벨, 쏘카일레클을 운영하는 한국형 모빌리티 플랫폼이며, 전국 5,000여 개의 쏘카존을 기반으로 한다 [src:10].

시스템의 핵심 가치는 "가장 쏘카다운, 가장 효율적인"이며, UX 원칙은 "복잡함을 덜어내고 본질에 집중합니다"로 요약된다 [src:7][src:9]. 디자인 원칙 문서는 "혁신은 낯선 경험이 아닙니다 — 검증된 유산 위에서 점진적으로 개선합니다"라는 입장을 명시해, 시각 언어를 절제된 방향으로 고정한다 [src:7]. 시각 톤은 차갑고 차분하며 신뢰 지향적이다 — 채도 높은 파랑(`{colors.primary-regular}`)과 푸른 기가 도는 회색 램프가 밝은 표면 위에 놓이는 구조이며, 장식보다 정보 위계가 앞선다 [src:1][src:7].

주 사용자는 스마트폰 앱으로 차를 빌리고 잠금을 해제하는 한국 이용자이며, 쏘카존이라는 공용 주차장에서 야외·한 손 조작 환경에 노출된다 [src:9]. 릴리스 체크리스트가 "한 손 조작이 가능합니까?", "야외 환경에서도 핵심 정보가 식별됩니까?"를 게이트로 둘 만큼, 이 시스템은 화면 UI가 아니라 이동 경험 전체를 설계 대상으로 본다 [src:9].

**SOCAR Frame 2.0은 라이트 모드 전용이다.** 공개된 다크 팔레트가 없으며, 모든 표면 토큰은 밝은 배경(`background-regular`, 본문 흰색)을 전제로 한다 [src:1][src:6]. 다운스트림에서 다크 테마가 필요하다면 별도 제품 근거 위에서 정의해야 하며, 이 문서는 다크 토큰을 추정하지 않는다.

## Colors

SOCAR Frame 2.0은 공식 Colors 페이지에 전체 토큰 세트를 게시하며, 색상 클래스는 `tw-{bg|text|border|fill}-{name}-{step}` 패턴을 따른다 [src:6][src:1]. 아래 값은 공개된 hex 토큰을 ko-design-md 표준에 맞게 OKLCH로 변환한 것이며, **라이트 모드 전용으로 다크 변형은 존재하지 않는다** [src:6][src:1].

```yaml
# Brand / primary (action)
primary-regular: oklch(0.620 0.219 257)   # service-socar / blue-500
primary-strong: oklch(0.586 0.236 261)    # pressed / blue-600
primary-heavy: oklch(0.526 0.224 263)     # heaviest / blue-700
service-business: oklch(0.395 0.197 266)  # SOCAR Business / blue-900

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

색상 축은 채도 높은 파랑(`{colors.primary-regular}`)이며, 동일 hue를 strong/heavy로 단계화해 눌림 상태를 표현한다 [src:6]. 회색 램프는 순수 회색이 아니라 푸른 기가 옅게 도는 톤이라 전체 온도가 차갑게 읽힌다 [src:1][src:6]. 상태색은 information / positive / caution / negative를 각각 weak·regular·strong 3단계로 분리하며, 배지·알림 점에는 `{colors.notification-red}`를 사용한다 [src:6][src:1]. 모빌리티 도메인 토큰으로 픽업 마커 `{colors.location-rental}`와 반납 마커 `{colors.location-return}`가 별도로 정의되어, 쏘카존 기반 지도 UI를 색으로 구분한다 [src:6][src:10].

## Typography

SOCAR Frame 2.0은 **Pretendard Variable** 단일 패밀리로 일원화한다 — 2.0 README는 "2.0에서는 Pretendard 하나로 일원화됩니다"라고 명시하고, 레거시 user-agent별 폰트 분기 코드를 제거하도록 안내한다 [src:7][src:1]. 토큰 CSS는 jsDelivr 웹폰트로 weight 400/500/600/700을 로드하며, 한글 글리프 보강을 위해 `Apple SD Gothic Neo`, `Noto Sans KR`를 폴백 스택에 둔다 [src:1].

```yaml
font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif

weight-regular: 400
weight-medium: 500
weight-semibold: 600
weight-bold: 700

# token: size px / line-height px / weight
display1: 40 / 50 / 700   # letter-spacing 0
display2: 36 / 44 / 700   # letter-spacing -0.6px
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

위계 패턴은 명확하다 — Display·Heading은 bold(700), Title은 semibold(600), Body는 regular(400), Caption은 600/500/400을 섞는다 [src:8][src:1]. 본문 기본 텍스트 색은 `{colors.text-primary}`이며, 산문성 제목 맥락에서는 `{colors.text-strong}`을 쓴다 [src:1]. 줄 높이는 1.4–1.6배로 넉넉하게 잡혀 한글 렌더링을 수용한다 [src:8][src:7].

## Spacing

간격 체계는 4px 기본 단위에 기반한다 — Spacing 페이지는 "1 unit = 4px"를 명시하고, 스케일은 `spacing-{n}` 토큰 램프로 `n ÷ 25 = px` 규칙을 따른다 [src:5][src:1]. Tailwind 유틸리티(`tw-p-spacing-{n}`, `tw-gap-spacing-{n}`)로 적용된다 [src:1].

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

스케일은 작은 크기 구간(1/2/4/5/6px)에서 촘촘해 타이트한 컴포넌트 패딩을 다루고, 그 위로는 4px 케이던스로 정착한다 [src:5][src:1]. 컴포넌트 내부 여백은 작은 단계를, 화면 단위 간격은 `{spacing.spacing-400}` 이상을 기준으로 삼는 구성이 시스템 의도에 맞는다 [src:5].

## Rounded

코너 반경은 넉넉하게 둥근 토큰 램프이며, spacing과 동일한 `n ÷ 25 = px` 규칙을 따른다 — `radius-{n}` 토큰이 `tw-rounded-radius-{n}`로 적용된다 [src:1].

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

관찰된 사용처는 명확하다 — 버튼은 크기에 따라 8–14px(xSmall 8px → large 14px), 카드와 스켈레톤 카드는 16px(`{rounded.radius-400}`), 바텀시트 상단 코너는 24px(`{rounded.radius-600}`)를 쓴다 [src:1]. 칩·배지는 완전한 pill(`{rounded.radius-circle}` 또는 고정 50px/17px), 입력 필드는 14px(`{rounded.radius-350}`), 탭 인디케이터 바는 8px(`{rounded.radius-200}`)다 [src:1]. 전반적으로 기하적이되 모서리는 일관되게 부드럽다 [src:1][src:5].

## Elevation & Depth

SOCAR Frame 2.0의 깊이 언어는 절제되어 있다 — 토큰 CSS는 "쏘카는 그림자를 매우 절제해서 쓰며, 표면은 대부분 1px 디바이더 + background-regular 워시로 정의된다"라고 명시한다 [src:1]. 표면 분리는 드롭섀도가 아니라 1px 디바이더와 `{colors.background-regular}` 배경 워시가 담당하며, 흰 카드가 밝은 회색 필드 위에 간격과 헤어라인으로 구분된다 [src:1][src:screenshot:home.jpg].

```yaml
shadow-sm: 0 1px 2px oklch(0.211 0.026 261 / 0.04)
shadow-card: 0 2px 4px oklch(0.211 0.026 261 / 0.06)
shadow-tip: 0 2px 4px oklch(0.000 0.000 0 / 0.12)
shadow-sheet: 0 0 20px oklch(0.000 0.000 0 / 0.25)
```

그림자 토큰은 존재하지만 모두 미세하다 [src:1]. `shadow-sm`·`shadow-card`는 카드 수준의 약한 부양에, `shadow-tip`은 툴팁 버블에, `shadow-sheet`는 바텀시트에 쓰는 강도다 [src:1]. **모든 그림자 토큰은 라이트 모드 값이다** — 다크 모드 대응 elevation은 공개되지 않았으므로, 다크 표면이 필요하면 별도 근거 위에서 정의해야 한다 [src:1][src:6].

## Shapes

형태 언어는 정돈된 기하 구조 위에 넉넉한 반경을 얹는 방식이다 [src:1][src:5]. 칩·배지는 완전한 pill, 카드와 시트는 12–24px 반경을 일관되게 써서 접근하기 쉽되 질서 있는 인상을 만든다 — 유기적이라기보다 기하적이다 [src:1][src:5].

시각적 절제는 표면 처리에서도 드러난다 — 곡선은 모서리 반경으로만 표현되고, 표면 구분은 곡면이나 그림자가 아니라 1px 헤어라인과 배경 워시로 처리된다 [src:1]. 시그니처 인터랙션은 press feedback이다 — 인터랙티브 표면이 `:active`에서 92%로 축소되고 `::after` 리플 오버레이가 함께 뜬다(`sf-pressable` / `active:tw-scale-[92%]`) [src:1]. 모션은 짧고 표준적이다 — `duration-100`(100ms), `duration-150`(150ms), `ease-standard`(`cubic-bezier(0.42, 0, 0.58, 1)`) [src:1].

## Components

SOCAR Frame 2.0은 React 18 + Tailwind v3(커스텀 `tw-` 프리픽스) + framer-motion 라이브러리이며, `@socar-inc/socar-frame-components`로 배포되고 `@socar-inc/socar-frame-foundation`을 peer dependency로 둔다 [src:2][src:3]. 코퍼스는 19개 컴포넌트를 완전 스펙으로, 5개를 부분 스펙으로 문서화한다 [src:1]. 아래는 시스템의 시그니처 패턴이다.

### action-button-fill-primary

ActionButton의 1차 fill/primary variant다 — 페이지의 주 행동을 담당하며 배경은 `{colors.primary-regular}`, 텍스트는 흰색이다 [src:1][src:4]. 4개 크기(large 56px → xSmall 32px height)를 지원하고, radius는 크기에 따라 10–14px로 스케일한다 [src:1][src:4]. `hapticConfig` prop으로 웹뷰 햅틱을 연결할 수 있다 [src:1].

```tsx
<ActionButton styleType="fill" variant="primary" size="large">
  대여하기
</ActionButton>
```

### action-button-fill-secondary

fill/secondary variant는 1차 행동보다 낮은 우선순위의 확정 행동에 쓴다 [src:1][src:4]. 배경은 공개 블루 스케일의 `blue-100` 단계에 해당하는 연한 파랑 `oklch(0.917 0.040 240)`, 텍스트는 `{colors.primary-strong}`로, `{component.action-button-fill-primary}`와 구조를 공유하되 색 위계를 낮춘다 [src:1][src:4].

```tsx
<ActionButton styleType="fill" variant="secondary" size="large">
  나중에 하기
</ActionButton>
```

### action-button-fill-tertiary

fill/tertiary variant는 가장 낮은 위계의 보조 행동용이다 [src:1][src:4]. 배경은 `{colors.background-regular}`, 텍스트는 `{colors.text-primary}`를 써서 중립 표면처럼 읽히게 한다 [src:1][src:4].

```tsx
<ActionButton styleType="fill" variant="tertiary" size="medium">
  취소
</ActionButton>
```

### action-button-pressed

ActionButton의 눌림 상태는 별도 시각 상태로 다룬다 — 시그니처 press feedback에 따라 표면이 `:active`에서 92%로 축소되고, `{colors.pressed-regular}` 또는 진한 fill 위에서는 `{colors.pressed-dark-regular}` 리플 오버레이가 함께 뜬다 [src:1].

```tsx
<ActionButton styleType="fill" variant="primary" className="sf-pressable" />
```

### icon-button

완전 원형(`{rounded.radius-circle}`) 정사각 비율의 아이콘 전용 버튼이며, xSmall→xLarge 5개 크기를 지원한다 [src:1]. 모빌리티 아이콘 세트(`icon-car`, `icon-charging`, `icon-bolt` 등)를 `-fill`/`-line` 스타일로 담는다 [src:6][src:1].

```tsx
<IconButton size="medium" icon="icon-car-line" aria-label="차량" />
```

### text-button

배경 없는 텍스트 버튼으로 반경은 4px 고정이며, 색은 variant로 정해진다 — primary `{colors.primary-regular}`, secondary `{colors.text-primary}`, tertiary `{colors.text-secondary}` [src:1].

```tsx
<TextButton variant="primary">전체 보기</TextButton>
```

### chip

선택 가능한 pill이며 반경은 50px 고정이다 [src:1]. 선택 상태는 `information-weak` 톤 배경 `oklch(0.962 0.022 248)` + 1px `{colors.primary-regular}` 보더 + `{colors.primary-regular}` 텍스트로 표시한다 [src:1]. 홈 화면의 필터 행("전체 · 경/소형 · 중형 · SUV · 전기 · 수입")이 이 컴포넌트다 [src:screenshot:home.jpg].

```tsx
<Chip selected onClick={onFilter}>SUV</Chip>
```

### badge

`content`(숫자/텍스트 pill)와 `dot` 두 variant를 가지며, 기본 배경은 `{colors.notification-red}`, 옵션으로 1px 흰 보더를 둔다 [src:1][src:11].

```tsx
<Badge variant="dot" />
<Badge variant="content">9+</Badge>
```

### tag

비인터랙티브 라벨이며 반경 6px(`{rounded.radius-150}`), 배경·텍스트 색은 커스텀이다 [src:1].

```tsx
<Tag>전기차</Tag>
```

### top-app-bar

상단 앱 바이며 최소 높이 52px, 흰 배경이다 [src:1]. 컴파운드 파트는 `BasicBackButton`, `Title`(general/scroll 타입), `TrailingButtonSlot`(액션 최대 3개), 그리고 `fetch` URL의 진행도를 추적하는 헤드리스 `LoadingBar`로 구성된다 [src:1]. 홈 화면 상단의 뒤로가기 화살표·"SOCAR" 타이틀·오버플로 메뉴가 이 패턴이다 [src:screenshot:home.jpg]. `BasicBackButton`은 네이티브 `window.onClickNavigation` 브리지를 호출한다 [src:1].

```tsx
<TopAppBar>
  <TopAppBar.BasicBackButton />
  <TopAppBar.Title type="general">SOCAR</TopAppBar.Title>
  <TopAppBar.TrailingButtonSlot>{/* max 3 */}</TopAppBar.TrailingButtonSlot>
</TopAppBar>
```

### bottom-sheet

바텀시트는 4개 detent(hidden / tip / half / max)를 가지며, 드래그로 열고 닫는다 [src:1]. 패널 상단 코너는 `{rounded.radius-600}`(24px), 딤 오버레이는 `{colors.dimmed-regular}`다 [src:1].

```tsx
<BottomSheet detent="half">{/* content */}</BottomSheet>
```

### date-time-picker

캘린더 기반 날짜·기간 피커(DatePicker)와 드래그 휠 시간 피커(TimePicker, 46px 세그먼트)다 [src:1]. 홈 화면의 대여/반납 날짜 카드("대여 5월 24일 (토) 10:00 / 반납 5월 25일 (일) 18:00")가 이 패턴을 입력으로 받는다 [src:screenshot:home.jpg].

```tsx
<DatePicker mode="range" />
<TimePicker step={10} />
```

### alert

명령형으로 여는 모달 다이얼로그다 — `Alert.open()`이 Promise를 반환하며, variant는 Default / Dialog / Window / Sequence / Portal이다 [src:1]. 딤 오버레이는 `{colors.dimmed-regular}`다 [src:1].

```tsx
const ok = await Alert.open({ variant: "dialog", title: "예약을 취소할까요?" });
```

### snackbar

화면 하단에 뜨는 일시적 토스트이며 자동으로 사라진다 [src:1].

```tsx
<Snackbar>예약이 취소되었습니다</Snackbar>
```

### segmented-control

탭형 토글이며 세그먼트가 배지/카운트(`9+`)를 가질 수 있다 [src:1].

```tsx
<SegmentedControl value={tab} onChange={setTab} />
```

### tab

상단 고정 탭 내비게이션이며 2px 슬라이딩 인디케이터 바를 가진다 — 인디케이터 색은 `{colors.gray-800}`다 [src:1].

```tsx
<Tab activeKey="share">{/* tab items */}</Tab>
```

### carousel

슬라이드 캐러셀이며 pill 형태 페이지 인디케이터 도트(5×12px)를 둔다 — 활성 도트는 `{colors.primary-regular}`, 비활성은 `{colors.border-regular}`다 [src:1].

```tsx
<Carousel>{/* slides */}</Carousel>
```

### haptic

비시각 유틸리티로, 웹뷰 햅틱 피드백을 구성한다 [src:1]. 버튼에는 `hapticConfig` prop으로 연결되며, 네이티브 iOS/Android 웹뷰 안에서 동작한다 [src:1].

```tsx
<ActionButton hapticConfig={{ type: "impact" }} />
```

## Do's and Don'ts

**Do** raw 색상 스케일을 표면에 직접 흩뿌리지 말고, `{colors.primary-regular}`, `{colors.text-primary}`, `{colors.background-regular}`, `{colors.notification-red}` 같은 시맨틱 토큰으로 의도를 먼저 표현한다 [src:6][src:1].

**Do** 표면 분리는 그림자보다 1px 디바이더와 `{colors.background-regular}` 워시로 먼저 해결한다 — SOCAR Frame의 깊이 언어는 절제가 기본값이다 [src:1].

**Do** ActionButton은 `styleType`·`variant`·`size`를 명시해 구현하고, 한 화면의 primary slot은 하나만 둔다 [src:1][src:4].

**Do** 한 손·야외 조작을 전제로, 핵심 정보의 대비를 높게 유지하고 탭 타깃을 넉넉히 잡는다 — 릴리스 체크리스트의 "한 손 조작이 가능합니까?", "야외 환경에서도 핵심 정보가 식별됩니까?"가 설계 게이트다 [src:9].

**Do** 지도 UI에서 픽업과 반납 위치는 `{colors.location-rental}`과 `{colors.location-return}`로 구분한다 — 쏘카존 모델을 색으로 인코딩한 도메인 토큰이다 [src:6][src:10].

**Don't** 공개된 컴포넌트 목록에 없는 HeroBanner, PromoCard 같은 이름을 SOCAR Frame 컴포넌트처럼 만들지 않는다 [src:1][src:2].

**Don't** 다크 모드 토큰을 추정해서 만들지 않는다 — SOCAR Frame 2.0은 라이트 모드 전용이며 공개된 다크 팔레트가 없다 [src:1][src:6].

**Don't** "혁신적", "차세대" 같은 마케팅 수사로 UI 카피를 채우지 않는다 — UX 원칙이 "쉬운 언어로 작성되어 있습니까?"와 3초 테스트를 게이트로 두며, 안전·가독성이 시각적 완성도보다 앞선다 [src:9].

**Don't** 강한 드롭섀도로 표면을 부양시키지 않는다 — 그림자 토큰은 모두 미세하며, 과한 elevation은 시스템 톤과 충돌한다 [src:1].

## Responsive Behavior

| Context | Key Changes |
| --- | --- |
| Baseline viewport | 시스템은 모바일 웹뷰 우선이며 좁은 화면을 기준 컨텍스트로 본다 — 컴포넌트 스펙의 computed px 값은 모바일 폭을 전제로 측정된다 [src:1]. |
| Published breakpoint system | 공개 조사 범위에서 명시적 breakpoint 토큰 시스템은 surfaced되지 않았다 (no published breakpoint system surfaced); 데스크톱 레이아웃 분기는 제품 구현 쪽에서 별도 정의해야 한다 [src:1]. |
| Top navigation | `{component.top-app-bar}`는 최소 높이 52px로 고정되며 `TrailingButtonSlot`은 액션을 최대 3개로 제한한다 — 좁은 화면에서 상단 액션이 넘치지 않도록 슬롯 수가 강제된다 [src:1]. |
| Touch target | UX 원칙이 한 손·야외 조작을 게이트로 두므로 탭 타깃은 넉넉히 확보해야 한다 — ActionButton 최소 크기 xSmall은 32px height이며, 핵심 행동 버튼은 large(56px height) 쪽을 우선한다 [src:1][src:9]. |
| Sheet 기반 내비게이션 | `{component.bottom-sheet}`는 4개 detent(hidden/tip/half/max)와 드래그 제스처로 좁은 화면의 단계적 노출을 담당한다 — 상단 복합 메뉴보다 하단 시트를 우선 고려한다 [src:1]. |
| Webview-hybrid 패턴 | 컴포넌트는 네이티브 iOS/Android 웹뷰에 임베드되며, `{component.haptic}`과 `BasicBackButton`의 `window.onClickNavigation` 브리지가 네이티브 동작을 연결한다 [src:1]. |

## Known Gaps

- **다크 모드 미공개.** SOCAR Frame 2.0은 라이트 모드 전용이며, 모든 표면·그림자 토큰의 다크 대응값이 공개되지 않았다 — 다크 테마가 필요하면 다운스트림에서 별도 정의해야 한다 [src:1][src:6].
- **명시적 breakpoint 시스템 부재.** 모바일 폭을 기준 컨텍스트로 두지만 데스크톱 레이아웃 분기를 위한 breakpoint 토큰은 surfaced되지 않았다 [src:1].
- **Input/TextArea의 검증 상태 매트릭스.** filled/outlined/underline variant와 focus 보더(`oklch(0.789 0.111 234)` 계열)는 확인되었으나, error·helper text의 세부 색·카피 규칙은 surfaced되지 않았다 [src:1].
- **부분 스펙 컴포넌트.** 코퍼스는 19개 컴포넌트를 완전 스펙으로, 5개를 부분 스펙으로만 문서화한다 — 부분 스펙 컴포넌트의 전체 variant·state는 확인되지 않았다 [src:1].
- **OKLCH 변환값.** 모든 색상은 공개 hex 토큰을 OKLCH로 변환한 것이며, 원본 시스템은 hex로 게시한다 — 미세한 변환 오차가 있을 수 있다 [src:6].

## References

1. https://socarframe.socar.kr/
2. https://socarframe.socar.kr/development/components
3. https://socarframe.socar.kr/development/foundation
4. https://socarframe.socar.kr/development/components/Buttons/ActionButton
5. https://socarframe.socar.kr/development/foundation/Spacing
6. https://socarframe.socar.kr/development/foundation/Colors
7. https://socarframe.socar.kr/development/principle
8. https://socarframe.socar.kr/development/foundation/Typography
9. https://socarframe.socar.kr/ux-principles
10. https://www.socar.kr/
11. https://socarframe.socar.kr/development/components/Badge
