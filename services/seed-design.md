---
name: 당근
design_system_name: SEED Design
slug: seed-design
category: community
last_updated: "2026-07-26"
created_at: 2026-05-14
sources:
  - https://seed-design.io/llms.txt
  - https://seed-design.io/components
  - https://seed-design.io/react/llms.txt
  - https://seed-design.io/llms/foundations/color.txt
  - https://seed-design.io/llms/foundations/color/color-role.txt
  - https://seed-design.io/llms/foundations/color/palette.txt
  - https://seed-design.io/llms/foundations/typography.txt
  - https://seed-design.io/llms/foundations/spacing.txt
  - https://seed-design.io/llms/foundations/radius.txt
  - https://seed-design.io/updates/why-design-system-needs-branding
  - https://seed-design.io/llms/react/components/action-button.txt
  - https://github.com/daangn/seed-design
  - https://www.daangn.com/kr/
  - https://seed-design.io/llms/foundations/elevation.txt
  - https://seed-design.io/llms/foundations/layout.txt
related_services: []
lang: ko
logo: https://getdesign.kr/logos/seed-design-symbol.png
---

# SEED Design — design.md

## Brand & Style

SEED Design은 당근마켓의 디자인 시스템이며, 공식 문서 체계는 Design Guidelines, React Library, Breeze Utilities, Lynx, AI Integration, Changelog로 나뉜다 [src:1]. 공개 저장소는 SEED를 "The Seed Design System"으로 소개하고, 패키지 영역은 `@seed-design/css`, `@seed-design/react`, `@seed-design/stackflow`, `@seed-design/figma`, `@seed-design/mcp` 등으로 구성된다 [src:12].

시스템의 중심 철학은 디자이너와 개발자가 색상을 역할 기반으로 구현하게 하여, 인터페이스 요소와 기능 사이의 관계를 명확히 하는 데 있다 [src:4]. 주요 사용자는 제품 UI 구현자, 디자인 시스템 운영자, 디자이너이며, React 문서는 설치, 스타일링, 컴포넌트 API, Stackflow 연동, 개발 도구, 마이그레이션, 업데이트를 함께 다룬다 [src:3].

시각적 톤은 접근성, 명확성, 가시성을 중심에 두고, 따뜻한 당근 브랜드 색과 중립 회색, 기능색을 역할별로 배치하는 구조다 [src:4][src:6]. 브랜딩 기록은 **주황을 당근을 상징하는 색으로 그대로 지키고, 코드 에디터 하이라이트에서 따온 라임을 SEED 자체의 포인트 컬러로 더했다**고 밝힌다 — 주황이 '당근다움'을, 라임이 '디자인 시스템다운 전문성'을 맡는 분담이다 [src:10]. 프리뷰의 심볼과 시그니처 로고는 공식 당근 웹사이트의 favicon 및 인라인 SVG 로고를 기준으로 둔다 [src:13].

## Colors

SEED의 색상 체계는 라이트 모드와 다크 모드에 적응하도록 설계되어 있으며, 역할 기반 색상은 여러 테마에서도 대비와 시각적 계층을 유지하도록 정의된다 [src:4]. 아래 값은 공식 팔레트와 역할 색상 근거를 ko-design-md 표준에 맞게 OKLCH로 변환한 토큰이며, 공식 팔레트는 Gray 한 계열과 Chromatic 6계열(Carrot, Blue, Green, Yellow, Red, Purple)로 구성된다 [src:6]. (종전 판본이 함께 적었던 "static alpha 계열"은 공개 출처 어디에서도 확인되지 않아 철회한다.)

```yaml
gray-00: oklch(1.000 0.000 0)
gray-100: oklch(0.979 0.002 248)
gray-200: oklch(0.967 0.002 248)
gray-300: oklch(0.952 0.003 265)
gray-400: oklch(0.901 0.007 269)
gray-500: oklch(0.867 0.007 269)
gray-600: oklch(0.766 0.010 267)
gray-700: oklch(0.636 0.015 262)
gray-800: oklch(0.477 0.028 264)
gray-900: oklch(0.307 0.017 256)
gray-1000: oklch(0.226 0.008 264)

carrot-100: oklch(0.970 0.016 47)
carrot-200: oklch(0.946 0.031 52)
carrot-300: oklch(0.903 0.055 48)
carrot-400: oklch(0.843 0.092 46)
carrot-500: oklch(0.769 0.144 44)
carrot-600: oklch(0.696 0.204 43)
carrot-700: oklch(0.618 0.195 40)
carrot-800: oklch(0.529 0.173 38)
carrot-900: oklch(0.422 0.133 40)
carrot-1000: oklch(0.276 0.081 42)

blue-700: oklch(0.606 0.205 258)
green-700: oklch(0.585 0.115 170)
red-700: oklch(0.640 0.233 28)
yellow-700: oklch(0.592 0.109 85)
yellow-300: oklch(0.898 0.141 95)

bg-default: oklch(1.000 0.000 0)
bg-layer: oklch(0.979 0.002 248)
bg-brand-weak: oklch(0.970 0.016 47)
bg-brand-solid: oklch(0.696 0.204 43)
bg-brand-pressed: oklch(0.618 0.195 40)
fg-neutral: oklch(0.226 0.008 264)
fg-muted: oklch(0.636 0.015 262)
fg-brand: oklch(0.618 0.195 40)
stroke-muted: oklch(0.901 0.007 269)
stroke-brand-solid: oklch(0.696 0.204 43)
informative: oklch(0.606 0.205 258)
positive: oklch(0.585 0.115 170)
critical: oklch(0.640 0.233 28)
warning: oklch(0.592 0.109 85)

dark-bg-default: oklch(0.205 0.008 275)
dark-bg-floating: oklch(0.243 0.011 261)
dark-fg-neutral: oklch(0.967 0.002 248)
dark-stroke-muted: oklch(1.000 0.000 0 / 0.09)
dark-bg-brand-solid: oklch(0.696 0.204 43)
dark-bg-brand-pressed: oklch(0.787 0.137 50)
dark-bg-brand-weak: oklch(0.274 0.022 42)
```

제품 UI에서는 raw 팔레트보다 역할 토큰을 우선 호출해야 한다. 예를 들어 브랜드 CTA는 `{colors.bg-brand-solid}`와 `{colors.fg-neutral}`의 관계로 읽히며, 상태 피드백은 `{colors.positive}`, `{colors.warning}`, `{colors.critical}`, `{colors.informative}`처럼 기능색 역할로 분리한다 [src:5][src:6].

## Typography

공식 SEED 웹 타이포그래피는 시스템 폰트 스택을 사용하며, `-apple-system`, `BlinkMacSystemFont`, `"Apple SD Gothic Neo"`, `"Segoe UI"`, `Roboto`, `"Helvetica Neue"`, `Arial`, `"Noto Sans"`, generic sans-serif, emoji fallback fonts를 포함한다 [src:7]. ko-design-md 렌더링에서는 한국어 커버리지의 안정성을 위해 `Pretendard Variable`을 앞단에 둘 수 있고, 그 뒤에 SEED의 공식 sans 계열 스택을 유지하는 구성이 적합하다 [src:7].

공식 크기 토큰은 `$font-size.t1`부터 시작해 **`t14`까지** 이어지며, rem 기반 값과 정적 pixel 대응값을 함께 제공한다 [src:7]. 공식 지침은 **t1–t5를 본문·장식 텍스트, t6–t10을 제목·주요 텍스트, t11–t14를 큰 화면용 대형 제목**으로 나누고, t11 이상은 `sm` breakpoint 이상에서 쓰기를 권장한다 [src:7][src:15]. 아래 블록은 그중 t1–t10만 옮긴 것이다. 줄 높이는 `$line-height.t1`부터 `$line-height.t10`까지 제공되고, 두께는 `$font-weight.regular` `400`, `$font-weight.medium` `500`, `$font-weight.bold` `700`으로 정리된다 [src:7].

```yaml
font-family-ui: "Pretendard Variable", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif

t1-size: 0.6875rem
t2-size: 0.75rem
t3-size: 0.8125rem
t4-size: 0.875rem
t5-size: 1rem
t6-size: 1.125rem
t7-size: 1.25rem
t8-size: 1.375rem
t9-size: 1.5rem
t10-size: 1.625rem

t1-line: 0.9375rem
t2-line: 1rem
t3-line: 1.125rem
t4-line: 1.25rem
t5-line: 1.375rem
t6-line: 1.5rem
t7-line: 1.625rem
t8-line: 1.875rem
t9-line: 2rem
t10-line: 2.1875rem

weight-regular: 400
weight-medium: 500
weight-bold: 700

screen-title: t10-size / t10-line / weight-bold
article-body: t5-size / t6-line / weight-regular
t5-regular: t5-size / t5-line / weight-regular
```

화면 제목은 `{typography.screen-title}`을 기준으로 하고, 긴 본문은 `{typography.article-body}`를 기준으로 한다. 일반 컴포넌트 라벨은 크기, 줄 높이, 두께를 조합한 scale style을 유지해 텍스트 계층을 분명하게 만든다 [src:7].

## Spacing

SEED의 spacing은 컴포넌트와 콘텐츠 간격을 일관되게 유지하고, 모듈성, 가독성, 사용자 경험을 높이기 위한 tokenized system으로 정의된다 [src:8]. 기본 dimension은 `2px` 단위의 작은 토큰에서 시작해 화면 단위 여백까지 확장되며, semantic spacing은 global gutter, component default, navigation-to-title, screen bottom 같은 사용 맥락을 제공한다 [src:8].

```yaml
x0_5: 2px
x1: 4px
x2: 8px
x3: 12px
x4: 16px
x5: 20px
x6: 24px
x8: 32px
x10: 40px
x12: 48px
x14: 56px
x16: 64px

global-gutter: 16px
component-default-y: 12px
nav-to-title-y: 20px
screen-bottom-y: 56px
```

컴포넌트 내부 간격은 `{spacing.component-default-y}`를 우선 기준으로 삼고, 화면 좌우 기본 여백은 `{spacing.global-gutter}`로 맞춘다. 화면 하단 고정 CTA나 내비게이션 주변에서는 `{spacing.screen-bottom-y}`를 보존해 bottom interaction과 콘텐츠가 충돌하지 않게 한다 [src:8].

## Rounded

SEED의 radius system은 작은 컨트롤부터 완전한 pill 형태까지 포괄하며, `2px`, `4px`, `8px`, `12px`, `16px`, `24px`, `9999px` 단계를 제공한다 [src:9]. Action Button은 XSmall compact pill 형태와 Large CTA 사용을 함께 지원하므로, 작은 표면과 큰 행동 표면 모두에서 radius 단계가 분명해야 한다 [src:11].

```yaml
r0_5: 2px
r1: 4px
r2: 8px
r3: 12px
r4: 16px
r6: 24px
full: 9999px
```

입력 필드와 일반 리스트 표면에는 `{rounded.r2}` 또는 `{rounded.r3}`를 사용하고, Badge, Chip, Action Button의 pill 형태에는 `{rounded.full}`을 사용한다. 큰 sheet나 floating surface는 `{rounded.r4}`에서 `{rounded.r6}` 범위로 제한해 부드럽지만 과장되지 않은 형태를 유지한다 [src:9][src:11].

## Elevation & Depth

SEED는 **공식 Elevation Foundation 문서를 공개한다** [src:14]. 종전 판본은 "완전한 shadow/elevation token page가 surfaced되지 않았다"고 적었으나 이는 사실이 아니므로 철회한다.

공식 체계의 핵심은 **레벨을 Global과 Local 두 축으로 나누는 것**이다 [src:14].

- **Global (컨테이너·레이어 층위)** — Level 0 `layer-basement`(스크롤 콘텐츠 뒤에 깔리는 최하단 배경) · Level 1 `layer-default`(페이지 기본 레이아웃, Card·List·TextField·Top Navigation이 놓이는 층) · Level 2 (Bottom Sheet, Menu Sheet) · Level 3 (Alert Dialog).
- **Local (콘텐츠 컴포넌트 층위)** — Level 1 Main Contents · Level 2 Floating Actions · Level 3 Transient Feedback. Local은 항상 Global 레벨 위에 놓인다.

깊이를 표현하는 수단은 **Surface color · Shadow · Stroke 세 가지**이며, shadow도 `shadow` 토큰 그룹으로 존재한다 [src:14]. 다만 공식 문서 자체가 **"Shadow는 다크 모드에서 잘 보이지 않는다는 한계가 있으므로, 화면 전체에서 주목도가 높은 몇 안 되는 요소에서만 사용한다"**고 못 박는다 [src:14] — 따라서 아래의 "색 역할 우선, 그림자는 예외적으로"라는 이 문서의 방침 자체는 공식 지침과 어긋나지 않는다. 다만 그 근거는 "공개 토큰이 없어서"가 아니라 **공식이 그렇게 권고해서**다.

구체적 shadow 값은 `<TokenReference groups="shadow">` 플레이스홀더로 렌더되어 텍스트 출처에는 담기지 않으므로, 이 문서는 여전히 수치를 만들지 않고 color role과 layer role(`bg-default`, `bg-layer`, `dark-bg-floating`, `stroke-muted`)로 서술한다 [src:4][src:5][src:14].

다크 모드에서는 표면을 더 어두운 기본 배경과 floating layer로 나누고, muted stroke를 얇게 사용해 분리감을 만든다 [src:4][src:5]. Floating surface가 필요할 때는 `{colors.dark-bg-floating}`과 `{colors.dark-stroke-muted}`를 함께 쓰고, shadow blur나 elevation level은 별도 제품 근거가 있을 때만 추가한다 [src:4][src:5].

## Shapes

SEED의 형태 언어는 정돈된 기하 구조 위에 부드러운 radius를 얹는 방식이다. radius token은 `2px`부터 `9999px`까지 제공되며, Action Button의 XSmall pill과 Large CTA가 같은 체계 안에서 동작한다 [src:9][src:11].

브랜드 형태에서 참고할 점은 **SEED가 당근 로고를 그대로 쓰지 않고 자체 마크를 갖는다**는 것이다 — 여러 갈래가 한 점에서 만나는 교차로이자 씨앗에서 뻗은 뿌리 형태이며, 쉐입을 라운드 코너로 둥글려 UI와 닮은 인상을 냈다 [src:10]. 즉 시스템의 형태 언어(라운드 코너·기하 구조)가 브랜드 마크에까지 일관되게 적용된다.

> 종전 판본은 여기서 Signature Logo / Symbol Logo / App Icon 3분류와 clear space 규칙을 서술했으나, 근거였던 `/docs/foundation/logo` 문서가 공개 사이트에서 제거되어 확인할 수 없으므로 철회했다. 로고 자산 운용 규칙이 필요하면 당근 브랜드 담당에 직접 확인할 것.

## Components

SEED의 공식 component catalog는 Action Button, Alert Dialog, Avatar, Badge, Bottom Navigation, Bottom Sheet, Callout, Checkbox, Chip, Field, Floating Action Button, Help Bubble, Image Frame, List, Menu Sheet, Page Banner, Reaction Button, Result Section, Segmented Control, Snackbar, Switch, Tabs, Text Input & Textarea, Top Navigation을 포함한다 [src:2]. React Library는 이 목록과 함께 Box, Flex, Grid, HStack, VStack, Text 같은 layout primitive를 제공한다 [src:3].

### action-button-brand-solid

Brand Solid Action Button은 "브랜드의 핵심 가치를 전달하며 사용자 간 연결이 일어나는 서비스의 주요 기능"에 쓰는 variant로, **한 화면에 하나만** 두기를 권장한다 [src:11]. 라벨과 함께 `PrefixIcon`·`SuffixIcon`을 조합할 수 있다 [src:11]. CTA에서는 `{colors.bg-brand-solid}`, `{colors.fg-neutral}`, `{rounded.full}`, `{spacing.component-default-y}`를 함께 사용하고, 크기는 `size="large"`(공식 설명상 "주로 CTA 역할")를 쓴다 [src:11]. 가로로 꽉 채우려면 별도 `fill` 속성이 아니라 **`flexGrow`** 를 쓴다 — 공식 API에 `fill`이라는 속성은 없다 [src:11].

```tsx
<ActionButton variant="brandSolid" size="large">
  Continue
</ActionButton>
```

### action-button-neutral-solid

Neutral Solid Action Button은 브랜드 CTA보다 낮은 우선순위의 확정 행동에 적합한 variant다 [src:11]. 배경은 `{colors.bg-layer}`, 텍스트는 `{colors.fg-neutral}`, radius는 `{rounded.full}`을 사용해 브랜드 버튼과 구조를 공유하되 색상 위계를 낮춘다 [src:5][src:11].

```tsx
<ActionButton variant="neutralSolid" size="medium">
  Save
</ActionButton>
```

### action-button-critical-solid

Critical Solid Action Button은 파괴적이거나 되돌리기 어려운 행동을 분리하기 위한 variant다 [src:11]. `{colors.critical}`을 행동의 핵심 색으로 사용하고, 동일 화면에서 `{component.action-button-brand-solid}`과 경쟁하지 않도록 primary slot을 하나만 둔다 [src:5][src:11].

```tsx
<ActionButton variant="criticalSolid" size="medium">
  Delete
</ActionButton>
```

### action-button-ghost

Ghost Action Button은 보조 행동이나 밀도가 높은 surface에서 사용하는 variant다 [src:11]. 배경 대비를 과하게 만들지 않고 `{colors.fg-muted}`와 `{spacing.x2}` 수준의 compact rhythm으로 label 중심의 동작을 유지한다 [src:5][src:8][src:11].

```tsx
<ActionButton variant="ghost" size="small">
  Dismiss
</ActionButton>
```

### action-button-loading

Action Button은 상태를 `state` 같은 단일 속성이 아니라 **`loading`·`disabled` 두 개의 boolean**으로 표현한다 [src:11]. `loading`은 "버튼에 등록된 비동기 작업이 진행 중임을 사용자에게 알린다"는 용도로 정의된다 [src:11]. (종전 판본의 "state는 Enabled, Pressed, Loading, Disabled를 포함" 서술은 공식 API와 맞지 않아 철회한다 — 인터랙션 상태 자체는 별도 `/foundations/state` 문서가 다루며 그 목록에는 Loading이 없다.) Loading 상태에서는 label width가 흔들리지 않게 container를 유지하고, `{colors.bg-brand-solid}` 또는 현재 variant 색을 그대로 보존한다 [src:5][src:11].

```tsx
<ActionButton variant="brandSolid" loading>
  Continue
</ActionButton>
```

### action-button-disabled

Disabled state는 Action Button의 공식 상태 중 하나이며, 사용자 입력을 받을 수 없는 행동을 명확히 표시한다 [src:11]. `{colors.bg-layer}`, `{colors.fg-muted}`, `{colors.stroke-muted}`를 사용해 hierarchy를 낮추되, 라벨은 읽을 수 있는 대비를 유지한다 [src:5][src:11].

```tsx
<ActionButton variant="neutralWeak" disabled>
  Submit
</ActionButton>
```

### badge-manner-temp

Manner Temp와 Manner Temp Badge는 공식 component catalog와 React Library에 모두 등장하는 catalog-specific named pattern이다 [src:2][src:3]. 이 패턴은 임의의 generic reputation badge로 바꾸지 말고, `{colors.positive}`, `{colors.warning}`, `{colors.critical}` 같은 상태 역할과 `{rounded.full}`을 조합해 커뮤니티 신뢰 신호로 유지한다 [src:2][src:3][src:5].

```tsx
<MannerTempBadge data-tone="positive" data-value="36.5" />
```

### bottom-navigation

Bottom Navigation은 공식 component catalog에 포함된 navigation component이며, React Library의 Stackflow 연동 문맥과 함께 mobile-oriented product surface에서 중요한 구조로 읽힌다 [src:2][src:3]. 하단 내비게이션은 `{spacing.screen-bottom-y}`를 침범하지 않고, active item에는 `{colors.fg-brand}`를 사용해 현재 위치를 분명히 한다 [src:5][src:8].

```tsx
<BottomNavigation activeKey="home">
  <BottomNavigation.Item key="home" label="Home" />
  <BottomNavigation.Item key="chat" label="Chat" />
</BottomNavigation>
```

### text-input-field

Field와 Text Input & Textarea는 공식 component catalog에 포함되어 있으며, React Library도 컴포넌트 API 문맥에서 UI 구현자를 대상으로 한다 [src:2][src:3]. 입력 표면은 `{colors.bg-default}`, `{colors.stroke-muted}`, `{rounded.r2}`, `{typography.t5-regular}`를 조합하고, error 상태는 `{colors.critical}` 역할로만 표시한다 [src:5][src:7][src:9].

```tsx
<TextInput data-field="nickname" data-tone="neutral" />
```

## Do's and Don'ts

**Do** raw palette를 제품 표면에 직접 흩뿌리지 말고, `{colors.bg-brand-solid}`, `{colors.fg-brand}`, `{colors.stroke-muted}`, `{colors.positive}`, `{colors.critical}` 같은 role token으로 의도를 먼저 표현한다 [src:5][src:6].

**Do** 라이트와 다크 모드 모두에서 대비와 시각적 계층이 유지되도록 `{colors.bg-default}`, `{colors.dark-bg-default}`, `{colors.dark-bg-floating}`의 layer 관계를 함께 점검한다 [src:4][src:5].

**Do** Action Button은 공식 속성 이름 그대로 `variant`·`size`·`layout`을 명시하고, 상태는 `loading`·`disabled` boolean으로 다룬다. `xsmall`은 compact pill, `large`는 CTA 중심으로 쓴다 [src:11].

**Do** 브랜드 색은 주황을 기준으로 두고, 라임 계열은 SEED 자체(디자인 시스템) 표면을 가리킬 때의 포인트로만 쓴다 [src:10].

**Don't** 공식 component catalog에 없는 HeroCard, PromoPanel, ReputationMeter 같은 이름을 SEED component처럼 만들지 않는다 [src:2][src:3].

**Don't** 임의의 elevation blur 값을 지어내지 않는다. 공식 체계는 깊이를 Surface color · Shadow · Stroke 세 수단으로 표현하고 레벨을 Global/Local로 나누므로 [src:14], 먼저 `{colors.bg-layer}`, `{colors.dark-bg-floating}`, `{colors.stroke-muted}` 같은 color role로 해결하고 shadow는 주목도가 가장 높은 소수 요소에만 쓴다 — 공식 문서가 다크 모드 가시성 한계를 이유로 그렇게 권고한다 [src:14]. 실제 shadow 수치가 필요하면 `TokenReference`가 렌더하는 공식 토큰을 확인한다.

**Don't** Purple 계열이 팔레트에 있다는 이유만으로 브랜드 CTA를 보라색으로 바꾸지 않는다. SEED의 브랜드 중심은 팔레트의 Carrot 계열과 브랜딩이 지키기로 한 주황에 있다 [src:6][src:10].

**Don't** SEED를 당근이 아닌 제품에 채용할 때 당근의 브랜드 정체성(Carrot 계열 주황·당근 및 SEED 로고 자산)과 당근 고유의 제품 맥락을 그대로 이식하지 않는다. SEED는 재사용 가능한 시스템이므로 차용할 것은 구조·시각 언어(role token 색 체계·라이트/다크 layer 전략·9999px full pill·Action Button 패턴)이고, 브랜드 색·로고·도메인 개념은 자기 제품에 맞게 재정의한다 [src:6][src:10].

**Don't** 디자인시스템 이름 자체(`SEED Design` 워드마크·`@seed-design/*` 패키지명·`seed-*` 클래스 prefix)를 생성하는 제품 UI의 헤더·타이틀·버튼·라벨·클래스 이름에 넣지 않는다 — 차용할 것은 시각 언어이지 시스템 이름이 아니다. UI 텍스트·네이밍은 자기 제품 브랜드로 재정의하고, 출처 표기가 필요하면 footer attribution(예: "SEED Design 기반")에만 둔다.

## Responsive Behavior

| Context | Key Changes |
| --- | --- |
| Published breakpoint system | SEED는 **Mobile First 원칙 위에 5단 breakpoint를 공식 공개한다** [src:15] — 종전 판본의 "surfaced되지 않았다"는 서술은 철회한다. 아래 표를 그대로 따른다. |
| Mobile navigation | Bottom Navigation, Bottom Sheet, Menu Sheet는 공식 component catalog에 포함되므로 좁은 화면에서는 상단 복합 메뉴보다 하단 또는 sheet 기반 navigation을 우선 고려한다 [src:2][src:3]. |
| Touch target | SEED-specific touch target token은 surfaced되지 않았으므로, 최소 터치 영역 수치는 제품 구현 쪽에서 별도 접근성 기준과 함께 정의해야 한다 [src:11]. |
| Layout primitives | React Library의 Box, Flex, Grid, HStack, VStack, Text를 사용해 wide view의 Grid를 narrow view의 VStack으로 접는 구조가 가장 자연스럽다 [src:3]. |

### Breakpoints (공식)

| Breakpoint | Viewport | Gutters | Margins |
| --- | --- | --- | --- |
| base | 0–479px | 16px | 12px |
| sm | 480–767px | 16px | 12px |
| md | 768–1279px | 32px | 24px |
| lg | 1280–1439px | 32px | 24px |
| xl | 1440px+ | 32px | 24px |

Mobile First — 작은 화면에서 시작해 화면이 커지며 레이아웃이 확장된다. 사이드바는 **md(768px) 이상에서 기본 노출**되고 768px 미만에서는 Header 내 메뉴로 통합된다 [src:15]. 레이아웃 유형은 **Dashboard**(판매자·광고주 센터처럼 복잡한 데이터·관리 기능)와 **Contents**(당근닷컴·어바웃 당근·채용처럼 정보 전달 목적) 둘로 나뉜다 [src:15].
| Logo and media | 로고 자산의 폭별 사용 규칙은 공개 문서에서 확인되지 않는다 — 좁은 화면용 축약 마크가 필요하면 당근 브랜드 가이드를 별도로 확인하고, 임의로 마크를 잘라 쓰지 않는다 [src:10]. |

## Known Gaps

- **철회된 부재 주장 2건 (2026-07-26)** — 종전 판본은 "완전한 shadow/elevation token page가 없다"와 "완전한 breakpoint token system이 없다"를 Known Gap으로 올려 두었으나, **둘 다 공식 문서로 실재한다**: `/foundations/elevation` [src:14]과 `/foundations/layout` [src:15]. 두 서술을 철회하고 해당 절을 공식 내용으로 다시 썼다. 부재를 주장하기 전에 sitemap을 끝까지 확인할 것.
- shadow의 구체적 수치는 여전히 텍스트 출처에 없다 — `<TokenReference groups="shadow">`가 렌더 단계에서 주입하기 때문이다 [src:14].
- Field, Text Input & Textarea의 validation state matrix는 component index 수준으로만 surfaced되었고, 세부 error copy나 helper text 규칙은 확인되지 않았다 [src:2][src:3].
- Purple 계열은 공식 팔레트에 포함되지만, 이 초안에서는 구체적 사용처가 확인된 brand role로 채택하지 않았다 [src:6].
- **로고 사용 규칙 출처 소실 (2026-07-26)** — 종전 판본이 인용하던 `/llms/docs/foundation/logo.txt`가 사이트에서 제거됐고, 현행 sitemap에도 logo·brand 페이지가 없으며 Wayback 스냅샷도 남아 있지 않다. 이 출처에 기대던 Signature/Symbol/App Icon 3분류와 clear space 규칙은 재확인이 불가능해 철회했다. 대체로 브랜딩 아티클 [src:10]을 인용하되, 이 글은 **SEED 자체 로고**를 다루므로 당근 로고 자산의 운용 규칙까지 담지는 않는다.
- **출처 경로 대이동 (2026-07-26)** — 사이트가 `/docs/foundation/*` → `/foundations/*`로 재구조화되면서 종전 sources 13개 중 8개가 404가 됐다. 현행 접근 규약은 `/llms/{section}/{path}.txt`이며 섹션은 `foundations`·`react`·`breeze`·`lynx`·`ai-integration`이다 [src:1]. 또한 `/docs/llms.txt`는 살아 있으나 **내용이 migration 문서 전용으로 축소**돼 종전에 인용하던 component catalog가 더 이상 없어, 해당 인용을 공식 catalog 페이지 [src:2]로 옮겼다.
- 본 문서의 정량 토큰 값(radius·spacing·색상 단계)은 `/llms/foundations/*.txt`가 `<TokenReference>` 플레이스홀더만 담고 실제 값을 렌더링 단계에서 주입하기 때문에, 텍스트 출처만으로는 값 대조가 불가능하다. 값 검증이 필요하면 공식 저장소 [src:12]의 토큰 소스를 볼 것.

## References

1. https://seed-design.io/llms.txt — SEED 공식 문서 루트 인덱스. 섹션 구분(Design Guidelines·React Library·Breeze Utilities·Lynx·AI Integration·Changelog)과 `/llms/{section}/{path}.txt` 접근 규약.
2. https://seed-design.io/components — 공식 component catalog. 컴포넌트 이름 목록의 1차 출처.
3. https://seed-design.io/react/llms.txt — React Library 인덱스. 컴포넌트 API 목록과 getting-started·stackflow·developer-tools·migration·updates·blocks 카테고리, layout primitive(Box·Flex·Grid·HStack·VStack·Text).
4. https://seed-design.io/llms/foundations/color.txt — 색상 Foundation 개요. 역할 기반 색상과 라이트/다크 적응 원칙.
5. https://seed-design.io/llms/foundations/color/color-role.txt — 역할 색상(color role) 정의. 본 문서 색 서술의 주 근거.
6. https://seed-design.io/llms/foundations/color/palette.txt — 팔레트 계열. Gray + Chromatic(Carrot·Blue·Green·Yellow·Red·Purple).
7. https://seed-design.io/llms/foundations/typography.txt — 타이포그래피 Foundation.
8. https://seed-design.io/llms/foundations/spacing.txt — 스페이싱 Foundation.
9. https://seed-design.io/llms/foundations/radius.txt — Radius Foundation. 모서리 둥글기 원칙(구체 값은 `TokenReference`로 렌더).
10. https://seed-design.io/updates/why-design-system-needs-branding — SEED 브랜딩 아티클. 당근 상징색 주황 유지 + 라임 포인트 컬러 추가, SEED 자체 로고의 의미.
11. https://seed-design.io/llms/react/components/action-button.txt — Action Button 컴포넌트 문서. size·variant·state 명세.
12. https://github.com/daangn/seed-design — SEED 공식 오픈소스 저장소. `@seed-design/css`·`react`·`stackflow`·`figma`·`mcp` 패키지 영역.
13. https://www.daangn.com/kr/ — 당근 공식 웹사이트. 프리뷰의 심볼·시그니처 로고가 기준으로 두는 favicon·인라인 SVG 로고 출처.
14. https://seed-design.io/llms/foundations/elevation.txt — Elevation Foundation. Global/Local stacking context, 레벨 정의, Surface color·Shadow·Stroke 3가지 표현 수단.
15. https://seed-design.io/llms/foundations/layout.txt — Layout Foundation. Mobile First 원칙, base/sm/md/lg/xl 5단 breakpoint 표(뷰포트·거터·마진), Dashboard/Contents 레이아웃 유형.
