---
name: 채널톡
design_system_name: Bezier Design System
slug: bezier
category: developer
last_updated: "2026-06-03"
created_at: "2026-06-03"
sources:
  - https://github.com/channel-io/bezier-react
  - https://main--62bead1508281287d3c94d25.chromatic.com/
  - https://www.npmjs.com/package/@channel.io/bezier-tokens
  - https://www.npmjs.com/package/@channel.io/bezier-icons
related_services: []
lang: ko
logo: https://getdesign.kr/logos/bezier.png
---

# Bezier Design System — design.md

> 채널톡을 만드는 (주)채널코퍼레이션의 오픈소스 React 디자인 시스템. 컴포넌트 라이브러리 + 디자인 토큰 + 아이콘 세트를 한 모노레포로 배포하며, 핵심 패키지는 `@channel.io/bezier-react`·`@channel.io/bezier-tokens`(0.6.0)·`@channel.io/bezier-icons`(0.59.0)이다 [src:1][src:3][src:4]. 본 문서는 사용자가 제공한 Claude Design 핸드오프 번들을 1차 출처로 추출·정리해 합성한 결과다.

## Brand & Style

Bezier는 채널톡의 사내 제품 UI를 외부에 그대로 공개한 드문 한국발 풀 디자인 시스템이다 — 라이선스는 Apache-2.0(© Channel Corp.)이며, 컴포넌트 59 + foundation 3 + utility 2 = 64 docs, 아이콘 598 SVG, 토큰 JSON 39종, 빌드 CSS 변수 450개 규모다 [src:1][src:2]. 토큰을 별도 패키지로 떼어내 라이트·다크 멀티 테마를 1급으로 다루는 성숙한 시스템이다 [src:1].

전반 인상은 밝고 깨끗한 SaaS 톤에 강채도 액센트가 얹히는 구조다 [src:3]. 중립 표면은 거의 순수한 그레이/화이트(`{colors.grey-50}` ~ `{colors.grey-100}`)이고, 그 위에 채도 높은 단일 액센트(블루/그린/레드 등)가 포인트로 올라간다 [src:3]. 형태 언어는 둥글고 부드럽다 — 버튼·인풋·배너·토스트 모서리가 `{rounded.radius-8}`~`{rounded.radius-12}`로 크게 말려 있고, 단순 `border-radius`를 넘어 iOS식 연속 곡률(squircle)을 위한 전용 컴포넌트 `{component.smooth-corners-box}`까지 두는, 부드러운 코너에 공들이는 브랜드다 [src:2][src:3].

라이트·다크 양 테마를 동등하게 그린다 — 모든 컴포넌트 autodocs가 같은 variant를 흰 배경(라이트)과 짙은 `{colors.grey-900}` 패널(다크)에 나란히 보여주며, 다크는 후처리가 아니라 시맨틱 토큰으로 1급 지원된다 [src:2]. 밀도는 중간(comfortable)이다 — 폼 필드 기본 사이즈가 `m`이고 `xl/l/m/xs` 4단계로 조절되며, 인터랙션은 빠른 150ms 트랜지션(`cubic-bezier(0.3,0,0,1)`)으로 가볍게 처리된다 [src:3].

대상 사용자는 둘로 갈린다. 채널톡 내부 개발팀에게는 한국어 설명이 섞인 컴포넌트 docs를, 오픈소스로 공개된 외부 사용자에게는 영어 API 레퍼런스를 제공해 이중 언어로 운영된다 [src:1]. 본 카탈로그 메타 문서는 평서체(~다)로 기술하며, Bezier가 채널톡 제품 UI에서 쓰는 카피 톤과는 분리한다.

카테고리는 `developer`(디자인 시스템/개발자 도구)로 분류하되, 시각 언어만 참조하고 채널톡의 B2B 메시징 도메인 개념·플로우는 자기 제품에 맞게 번안하는 것이 번들의 명시적 사용 지침이다 [src:1].

## Colors

Bezier는 글로벌 원시값 → 시맨틱(라이트/다크) → 컴포넌트 3계층 토큰 구조다 [src:3][src:2]. 글로벌은 원시 색값이고, 시맨틱(`--bg-*`, `--txt-*`, `--color-*`)은 테마별로 다른 글로벌을 참조한다 [src:2]. 특징은 navy·purple·pink·red·orange·yellow·olive·green·teal·cobalt·blue 11개 hue를 각각 300/400/500 명도 + 알파 변형으로 갖춘 무지개 액센트 팔레트다 [src:3][src:4].

아래 값은 핸드오프 번들 `colors_and_type.css`가 정답으로 삼은 Bezier **beta 토큰 팔레트**를 ko-design-md 표준 OKLCH로 변환한 것이다 — 1차 액션은 indigo-violet 계열 `blue-400`이고, 원본이 hex로 발행돼 OKLCH 변환에 미세한 오차가 있을 수 있다 [src:3].

### Accent global hues (300/400/500 core)

```yaml
# Blue — 제품 1차 액션 (indigo-violet, primary)
blue-300: oklch(0.665 0.181 280)
blue-400: oklch(0.554 0.214 280)   # primary
blue-500: oklch(0.483 0.229 280)

# Green — 성공 / 폼 선택 상태 (체크박스·라디오·스위치·슬라이더)
green-300: oklch(0.732 0.157 150)
green-400: oklch(0.652 0.168 150)
green-500: oklch(0.562 0.100 160)

# Red — 에러 / 위험
red-300: oklch(0.690 0.172 23)
red-400: oklch(0.634 0.177 20)
red-500: oklch(0.541 0.166 21)

# Orange — 경고 (인풋 invalid box-shadow)
orange-300: oklch(0.764 0.148 58)
orange-400: oklch(0.698 0.156 55)
orange-500: oklch(0.600 0.146 54)

# Cobalt — 정보 강조 (highlight)
cobalt-300: oklch(0.724 0.125 245)
cobalt-400: oklch(0.643 0.150 248)
cobalt-500: oklch(0.570 0.156 257)

# 단일 코어 액센트 (주로 400; tag·상태 칩용 300 일부)
purple-400: oklch(0.591 0.208 297)
pink-400:   oklch(0.637 0.208 339)
navy-400:   oklch(0.469 0.147 273)
yellow-300: oklch(0.824 0.160 88)
yellow-400: oklch(0.789 0.161 82)
olive-300:  oklch(0.784 0.167 115)
olive-400:  oklch(0.730 0.160 113)
teal-400:   oklch(0.690 0.118 191)
```

액센트는 한 hue가 **연·진 한 쌍**으로 작동한다 — **20% 틴트를 배경 fill**(`fill-accent-blue` = `blue-400`의 20% 알파)로, **솔리드 hue를 텍스트·아이콘**(`text/icon-accent-*`)으로 쓴다. 그래서 배너·태그·상태 칩이 "연한 틴트 위 진한 동색 글자/아이콘"으로 읽힌다.

### Neutral global

```yaml
grey-25:  oklch(0.995 0.003 286)
grey-50:  oklch(0.988 0 286)
grey-100: oklch(0.976 0.001 286)
grey-200: oklch(0.952 0.001 286)
grey-300: oklch(0.913 0.003 286)
grey-400: oklch(0.855 0.003 286)
grey-500: oklch(0.729 0.004 286)
grey-600: oklch(0.578 0.008 286)
grey-700: oklch(0.354 0.007 286)
grey-800: oklch(0.283 0.007 286)
grey-850: oklch(0.261 0.004 286)
grey-900: oklch(0.232 0.006 286)   # 가장 짙은 다크 표면

# 텍스트·보더·딤은 고정 grey가 아니라 alpha-black 위계로 쌓는다 (Bezier 시그니처)
black-100: oklch(0 0 0)
black-85:  oklch(0 0 0 / 0.85)   # text-neutral (본문 기본)
black-60:  oklch(0 0 0 / 0.60)   # text-neutral-light
black-40:  oklch(0 0 0 / 0.40)   # text-neutral-lighter / icon-neutral
black-8:   oklch(0 0 0 / 0.08)   # border-neutral
white-100: oklch(1 0 0)
white-90:  oklch(1 0 0 / 0.90)
white-12:  oklch(1 0 0 / 0.12)   # 다크 표면 위 보더
```

### Semantic (라이트/다크 분리)

시맨틱 토큰은 같은 이름이 테마별로 다른 글로벌을 참조한다 [src:3][src:2]:

- **표면**: `bg-white-normal`은 라이트에서 `{colors.white-100}` ↔ 다크에서 `{colors.grey-900}`. 라운지/헤더/네비 전용 표면(`bg-lounge`, `bg-header`, `bg-gnb`)도 테마별로 분기한다 [src:3].
- **텍스트**: `txt-black-darkest`은 라이트에서 `{colors.black-85}` ↔ 다크에서 `white-80`. `txt-black-darker`, `txt-black-dark` 식으로 같은 시맨틱 이름이 테마별 다른 원시값을 참조한다 [src:3].
- **컴포넌트 토큰**: `--color-fill-*`, `--color-text-*`, `--color-icon-*`, `--color-border-*`, `--color-surface-*`, `--color-state-action-light`, `--color-dim-absolute-black` 네임스페이스로 노출된다 [src:2].
- foundation `color.mdx`는 토큰을 Global → Light → Dark 3섹션 스와치로 문서화하며, 라이트는 흰 패널·다크는 짙은 `--color-surface` 패널에 렌더해 양 테마 동시 검수를 전제한다 [src:2].

별도 `@channel.io/bezier-tokens/alpha` 엔트리가 `--alpha-color-fg-*`·`--alpha-color-bg-*`·`--alpha-color-surface-*` 네임스페이스를 제공해, 오버레이·딤·반투명 표면 전용 알파 채널 토큰 세트를 분리해 둔다.

## Typography

폰트 패밀리는 한국어 우선 스택이다 — `--font-family-sans-kr`이 `'Inter', 'NotoSansKR', 'Noto Sans KR', 'NotoSansJP', 'Noto Sans JP', -apple-system, …` 순으로, 라틴은 **Inter**·국문은 **Noto Sans KR**가 본문 서체다 [src:3]. 일본어용 `--font-family-sans-jp`(Noto Sans JP 우선)와 모노 `--font-family-mono`(ui-monospace, Cascadia Code, Source Code Pro, Menlo, Consolas …)도 토큰화돼, 채널톡이 한·일 시장을 함께 겨냥하는 제품임이 토큰에 반영돼 있다 [src:3].

굵기는 단 2단계다 — `--font-weight-400`(regular)와 `--font-weight-700`(bold). 중간 굵기 없이 regular/bold 이원화이며, `--typography-text-weight-bold`를 토글버튼 등이 사용한다 [src:3][src:2].

```yaml
font-family-sans-kr: "'Inter', 'NotoSansKR', 'Noto Sans KR', 'NotoSansJP', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Roboto', system-ui, sans-serif"

weight-400: 400   # regular
weight-700: 700   # bold

# size — 토큰명 숫자 = px (핸드오프 colors_and_type.css는 `--font-size-11:11px`로 표기).
# 아래 rem은 1rem=10px 루트 가정의 동치값(예: font-size-11 = 11px = 1.1rem@10px-root).
font-size-11: 1.1rem
font-size-12: 1.2rem
font-size-13: 1.3rem
font-size-14: 1.4rem
font-size-15: 1.5rem
font-size-16: 1.6rem
font-size-17: 1.7rem
font-size-18: 1.8rem
font-size-22: 2.2rem
font-size-24: 2.4rem
font-size-30: 3.0rem
font-size-36: 3.6rem

# line-height (rem) — 사이즈에 짝지어 정의 (16 ~ 44)
line-height-16: 1.6rem
line-height-44: 4.4rem

# letter-spacing — 큰 텍스트일수록 음수 자간
letter-spacing-1: -0.01rem  # 15~17px
letter-spacing-2: -0.04rem  # 22px↑ 타이트
```

타이포그래피 묶음 토큰은 `--typography-size-NN-{font-size,line-height,letter-spacing}` 형태로 사이즈별 3속성을 한 묶음으로 노출한다 — 예컨대 `typography-size-24`는 `font-size-24` + `line-height-32` + `letter-spacing-2`를 묶고, `{component.text}` 컴포넌트가 이 토큰 + `--b-text-*` 로컬 변수로 조립된다 [src:3][src:2]. 음수 자간(`-0.01rem`/`-0.04rem`)은 한글·라틴 혼용 가독성을 노린 세팅이다 [src:3].

## Spacing

레이아웃은 `{component.stack}`(`--b-stack-spacing`)·HStack/VStack·`{component.center}`·`{component.box}` 프리미티브로 짠다 [src:2]. Storybook 문서 예시들이 `spacing={4/6/10/16/32}`(4px 그리드 계열) 값을 직접 사용한다 [src:2].

```yaml
# 관찰된 4px 그리드 케이던스 (Storybook 예시 직접 사용값)
spacing-4:  4px
spacing-6:  6px
spacing-10: 10px
spacing-16: 16px
spacing-32: 32px
```

비활성 상태 공통 토큰으로 `--opacity-disabled: 0.4`가 있어, 다수 컴포넌트(버튼·인풋·아바타·스위치 등)가 disabled 표현에 이 값을 쓴다 [src:3][src:2]. 모션은 `--transition-duration-s 150ms` / `-m 300ms` / `-l 450ms`에 타이밍 `cubic-bezier(0.3,0,0,1)`이며, 컴포넌트는 `--motion-transition-fast`/`-default`로 참조한다 [src:3][src:2].

z-index 레이어는 명시적으로 단계화돼 있다 [src:3][src:2]:

```yaml
z-index-base: 0
z-index-floating: 1
z-index-overlay: 1000
z-index-modal: 1100
z-index-toast: 1200
z-index-tooltip: 1300
z-index-important: 2000
```

> Bezier는 앱 셸/뷰포트 브레이크포인트를 토큰으로 발행하지 않는다 — 간격 리듬은 4px 그리드 위에서 컴포넌트별 로컬 변수로 처리된다(상세는 Responsive Behavior 참조) [src:3].

## Rounded

코너 반경은 2px부터 44px까지의 토큰 램프에 비율형 한 종을 더한 구조다 — `--radius-42-p 42%`는 원형/스쿼클용이다 [src:3].

```yaml
radius-2:  2px
radius-3:  3px    # 프로그레스바 / 슬라이더 트랙
radius-4:  4px
radius-6:  6px
radius-8:  8px    # 인풋 / 버튼 (주력)
radius-12: 12px   # 배너 / 토스트 / 리스트아이템 (주력)
radius-16: 16px
radius-20: 20px   # 모달
radius-32: 32px
radius-44: 44px
radius-42-p: 42%  # 원형 / 스쿼클
```

관찰된 사용처는 명확하다 — 버튼은 `{rounded.radius-6}`~`{rounded.radius-16}`, 모달은 `{rounded.radius-20}`, 배너/토스트/리스트아이템은 `{rounded.radius-12}`, 프로그레스바·슬라이더 트랙은 `{rounded.radius-3}`를 쓴다 [src:3][src:2]. **8~12px가 주력**이고, 큰 컨테이너일수록 16~20px로 커진다 [src:2].

별도로 `{component.smooth-corners-box}`가 `--b-smooth-corners-box-border-radius`·`-shadow-*` 로컬 변수로 iOS식 연속 곡률(squircle)을 그리고, 아바타가 `--b-smooth-corners-box-shadow-spread-radius`를 재사용한다 — 단순 라운드를 넘어선 부드러운 코너가 브랜드 시그니처다 [src:2].

## Elevation & Depth

엘리베이션은 `--ev-1`~`--ev-6` 6단계이며, 각 단계가 inner-shadow + base-shadow + 점증하는 blur를 합성한다 — `--ev-3`은 `…, 0 4px 12px 0 var(--shdw-medium)`, `--ev-6`은 `…, 0 12px 60px 0 var(--shdw-xlarge)` 식으로 단계가 올라갈수록 퍼짐이 커진다 [src:3]. 컴포넌트는 `--elevation-1`~`--elevation-4`로 사용하며, 모달이 `--elevation-4`, 토스트·셀렉트가 `--elevation-3`, 배너가 `--elevation-2`다 [src:2].

깊이 언어도 라이트·다크 양 테마를 동등하게 다룬다 — 라이트와 다크가 `--shdw-*`를 black-알파 ↔ white/black-알파로 다르게 매핑해 테마별 그림자 강도를 보정한다 [src:3]. 다크는 별도 후처리가 아니라 그림자 토큰 레벨에서부터 분기되는 1급 테마다 [src:3][src:2].

```yaml
# 컴포넌트 노출 단계 (--elevation-1 ~ --elevation-4)
elevation-2: 배너                    # --ev 기반, 라이트/다크 shdw 분기
elevation-3: 토스트 / 셀렉트 / 툴팁
elevation-4: 모달
```

## Shapes

형태 언어는 부드러운 기하(soft, geometric-rounded)다 [src:2][src:3]. 버튼·인풋·배너·토스트가 8~12px 반경으로 일관되게 말려 있고, 큰 컨테이너는 16~20px로 더 둥글다 — 직각보다 라운드가 우세하며, 모서리는 시스템 전반에서 일관되게 부드럽다 [src:2].

곡선 처리에 특히 공을 들이는 점이 시그니처다 — 단순 `border-radius`로 멈추지 않고 `{component.smooth-corners-box}`가 iOS식 연속 곡률 squircle을 별도 컴포넌트로 제공하며, 아바타도 같은 squircle shadow-spread 변수를 재사용한다 [src:2]. 인터랙션은 짧고 가볍다 — 150ms `cubic-bezier(0.3,0,0,1)` 트랜지션으로 처리되고, 비활성은 `--opacity-disabled: 0.4`로 표현된다 [src:3][src:2].

일차 적응 축은 뷰포트가 아니라 **테마**다 — autodocs 한 장 안에 같은 variant의 라이트·다크가 병치되며, 색·표면·그림자가 테마별로 분기되는 것이 이 시스템의 핵심 시각 구조다 [src:2].

## Components

`@channel.io/bezier-react`는 정확히 59개 컴포넌트(PascalCase)를 노출한다 — 각 항목은 import 경로 `@channel.io/bezier-react`, 타입/스토리/사용 토큰 스펙, autodocs 스크린샷이 번들에 있다 [src:2]. `Alpha*` 접두 컴포넌트는 차세대(alpha) 라인, `Legacy*`는 구버전 라인으로, 같은 역할의 안정/실험/구버전 변종이 공존한다 [src:2]. 아래는 영역별 그룹 리드-인이며 59개 base가 모두 `###`로 등장한다.

**Actions / Buttons** — accent fill을 가장 폭넓게 쓰는 영역으로, 색 variant·스타일 variant·사이즈 enum과 alpha/legacy 라인이 겹쳐 있다.

### Button

핵심 액션 버튼. `ButtonColorVariant`·`ButtonStyleVariant`·`ButtonSize`·`SideContent` 타입을 받고 CTA/Floating/Async/Dropdown/Composite 등 16 스토리를 가진다 [src:2]. `{rounded.radius-6}`~`{rounded.radius-16}`, `{elevation.elevation-2}`/`{elevation.elevation-3}`와 다수 accent fill을 쓴다 [src:2].

```tsx
<Button colorVariant="blue" styleVariant="primary" size="m">Click me</Button>
```

- **button-primary** (`styleVariant="primary"`) — 채워진 1차 액션. 배경에 `{colors.blue-400}` 계열 accent fill, 텍스트는 흰색으로 페이지의 주 행동을 담당한다 [src:2][src:3].
- **button-secondary** (`styleVariant="secondary"`) — 채도를 낮춘 2차 액션. primary와 구조를 공유하되 fill 무게를 낮춰 보조 행동에 쓴다 [src:2].
- **button-floating** — CTA/Floating 스토리의 떠 있는 변종으로 `{elevation.elevation-2}`/`{elevation.elevation-3}`로 표면에서 부양시킨다 [src:2].

### ButtonGroup

`ButtonGroupProps`. 여러 버튼을 한 묶음으로 정렬하는 레이아웃 래퍼다 [src:2].

### AlphaButton

차세대(alpha) 버튼. `ButtonColor`·`ButtonVariant`·`ButtonSize`를 받고 11개 accent text 토큰 + `{rounded.radius-6}`~`{rounded.radius-12}` 계열을 쓴다 [src:2].

### AlphaIconButton

아이콘 전용 alpha 버튼. `IconButtonProps`를 받으며, accent fill/icon/text 토큰을 50종 이상으로 가장 폭넓게 사용한다 [src:2].

### AlphaFloatingButton

떠 있는 FAB류 alpha 버튼. `FloatingButtonColor/Variant/Size`를 받고 `--color-fill-grey`와 `{elevation.elevation-2}`/`{elevation.elevation-3}`를 쓴다 [src:2].

### AlphaFloatingIconButton

아이콘형 플로팅 alpha 버튼. `FloatingIconButtonProps`를 받으며 `{elevation.elevation-2}`/`{elevation.elevation-3}`로 부양한다 [src:2].

### AlphaToggleButton

토글 가능한 alpha 버튼. `ToggleButtonProps`를 받고 `--state-input-active/default`와 `--typography-text-weight-bold`로 선택 상태를 표시한다 [src:2].

### AlphaToggleButtonGroup

단일/다중 선택 토글 그룹(alpha). `ToggleButtonSingleGroupProps`·`ToggleButtonMultipleGroupProps`로 단일·다중 모드를 가른다 [src:2].

### AlphaToggleEmojiButtonGroup

이모지 토글 버튼 그룹(alpha). `ToggleEmojiButtonGroupProps`를 받고 `--b-toggle-emoji-button-size`와 accent blue 토큰을 쓴다 [src:2].

### SegmentedControl

세그먼트형 선택 컨트롤. `SegmentedControlSize/Type` 등을 받고 `--b-segmented-control-*` 로컬 변수 + `{elevation.elevation-1}`을 쓴다 [src:2].

**Forms / Inputs** — 입력 컨트롤은 `--state-input-*`(active/default/error) 토큰과 `--b-form-field-size`로 상태·밀도를 일원화한다.

### TextField

단행 입력. `TextFieldVariant`(primary/secondary)·`TextFieldType`(number/text/email/password/tel/search/hidden)·사이즈 `xl/l/m/xs`·`allowClear`·`hasError` props를 받는다 [src:2]. `--state-input-active/default/error`와 `{rounded.radius-8}`/`{rounded.radius-12}`를 쓰며, invalid 상태의 box-shadow는 orange 계열이다 [src:2].

```tsx
<TextField size="m" variant="primary" allowClear placeholder="this is placeholder" />
```

### TextArea

다행 입력. `TextAreaHeight`·`TextAreaProps`를 받고 `--state-input-*`와 `{rounded.radius-8}`를 쓴다 [src:2].

### Select

드롭다운 선택. `SelectProps`·`SelectRef`를 받으며 팝업에 `{elevation.elevation-3}`, 트리거에 `--state-input-*`와 `{rounded.radius-8}`를 쓴다 [src:2].

### Checkbox

체크박스. `CheckboxSize`·`CheckedState`를 받고(controlled/uncontrolled 스토리) 선택 상태에 `--color-fill-accent-green-heavier`, `--state-input-active/error`를 쓴다 [src:2].

### RadioGroup

라디오 묶음. `RadioGroupProps`·`RadioProps`를 받고 green accent + `--state-input-active`로 선택을 표시한다 [src:2].

### Switch

온/오프 스위치. `SwitchSize`를 받고 `--b-switch-*`와 green-heavier fill, `{elevation.elevation-2}`를 쓴다 [src:2].

### Slider

범위 슬라이더. `SliderProps`를 받고(controlled/uncontrolled) `--b-slider-*`와 `{rounded.radius-3}`(트랙)/`{rounded.radius-12}`를 쓴다 [src:2].

### FormControl

폼 필드 컨텍스트/접근성 프롭 게터 묶음. `LabelPropsGetter`·`HelperTextPropsGetter` 등을 노출하고 `--b-form-field-size`로 컨트롤 높이를 일원화한다 [src:2].

### FormGroup

폼 그룹 컨테이너. `FormGroupProps`로 라벨·필드·헬퍼를 한 그룹으로 묶는다 [src:2].

### FormLabel

폼 라벨. `FormLabelProps`를 받아 필드 제목을 렌더한다 [src:2].

### FormHelperText

도움말/에러 메시지. `BaseHelperTextProps`·`FormErrorMessageProps`를 받으며 ErrorMessage 스토리로 에러 표시를 다룬다 [src:2].

**Overlays / Modals / Tooltips** — 띄우는 표면은 `--layer-z-index-*`(overlay 1000 / modal 1100 / toast 1200 / tooltip 1300)로 층을 가르고 `--color-dim-absolute-black`으로 딤을 깐다.

### Modal

합성형 모달(`ModalHeader/Body/Footer/Title/Trigger/Close`). `ModalTitleSize`를 받고 `--b-modal-width/height/collision-padding`, `--color-dim-absolute-black`, `{elevation.elevation-4}`, `{rounded.radius-20}`을 쓴다 [src:2].

```tsx
<Modal>
  <Modal.Header><Modal.Title>제목</Modal.Title></Modal.Header>
  <Modal.Body>{/* content */}</Modal.Body>
</Modal>
```

### ConfirmModal

확인 다이얼로그 합성형(`ConfirmModalHeader/Body/Footer/Trigger/Close`). Composition 스토리로 확인/취소 액션을 묶은 모달이다 [src:2].

### AlphaDialogPrimitive

헤드리스 다이얼로그 프리미티브(alpha). `DialogPrimitiveTrigger/Portal/Overlay/Content/Title/Description/Close` 파트를 노출해 스타일 없는 다이얼로그 골격을 제공한다 [src:2].

### Overlay

위치 지정 오버레이. `OverlayPosition`·`TargetRectAttr`·`ContainerRectAttr`를 받고 `--layer-z-index-overlay`(1000) 층에 띄운다 [src:2].

### Tooltip

툴팁. `TooltipPosition`을 받고 `--color-surface-high`, `{elevation.elevation-3}`, `--layer-z-index-tooltip`(1300), `{rounded.radius-8}`을 쓴다 [src:2].

### LegacyTooltip

구버전 툴팁. `LegacyTooltipPosition`·`GetTooltipStyle`을 받고 `{elevation.elevation-2}`를 쓴다 — 신규 코드는 `{component.tooltip}` 또는 `{component.alpha-tooltip-primitive}`를 우선한다 [src:2].

### AlphaTooltipPrimitive

헤드리스 툴팁 프리미티브(alpha). `TooltipPrimitiveProvider/Trigger/Portal/Content/Arrow` 파트를 노출해 스타일 없는 툴팁 골격을 제공한다 [src:2].

**Navigation** — 사이드 내비·탭·리스트 행이 활성 상태에 accent blue(`--color-fill-accent-blue`)와 `{rounded.radius-6}`를 공유한다.

### Tabs

탭 내비게이션. `TabList/TabItem/TabContent/TabActions` 파트와 `TabSize`를 받으며(Composition·UnControlled 스토리) accent blue + `{rounded.radius-6}`~`{rounded.radius-12}`를 쓴다 [src:2].

### NavGroup

사이드 내비 그룹. `NavGroupProps`로 내비 항목들을 한 섹션으로 묶는다 [src:2].

### NavItem

내비 항목. `NavItemProps`를 받고 활성 상태에 `--color-fill-accent-blue`와 `{rounded.radius-6}`를 쓴다 [src:2].

### OutlineItem

들여쓰기형 아웃라인/트리 항목. `OutlineItemProps`·`OutlineItemContextProps`를 받고 `--b-outline-item-indent`로 깊이를, accent blue로 활성을 표시한다 [src:2].

### ListItem

리스트 행. `ListItemSize`·`ListItemVariant`를 받으며(WithRightContent·ActiveWithOnClick 등 6 스토리) accent blue/cobalt/green/red text와 `{rounded.radius-6}`~`{rounded.radius-12}`를 쓴다 [src:2].

### SectionLabel

섹션 헤더 라벨. `SectionLabelLeftContent/RightContent`·`IconWithAction`을 받아 리스트 구역의 제목 행을 만든다 [src:2].

### KeyValueItem

키-값 행(메타데이터 표시). `KeyValueItemAction`·`ItemActionWithIcon`을 받으며(MultiLine 스토리) `{rounded.radius-6}`를 쓴다 [src:2].

**Data display / Avatars** — 아바타 계열은 squircle shadow-spread 변수를 공유하고, 배지·상태·태그가 상태 색을 표현한다.

### Avatar

사용자 아바타. `AvatarSize`를 받으며(WithCustomStatus 스토리) `--b-avatar-status-gap`과 squircle용 `--b-smooth-corners-box-shadow-spread-radius`를 쓴다 [src:2].

### AvatarGroup

아바타 겹침 그룹. `AvatarGroupEllipsisType`을 받고 `--b-avatar-group-spacing/size`와 `--layer-z-index-floating`(1)로 겹침 순서를 다룬다 [src:2].

### CheckableAvatar

선택 가능한 아바타. `CheckableAvatarProps`를 받고 `--layer-z-index-base/floating`으로 체크 표식 층을 올린다 [src:2].

### AlphaAvatar

차세대 아바타(alpha). `AvatarSize`를 받으며(WithCustomStatus) `--b-avatar-computed-status-gap`으로 상태 점 간격을 계산한다 [src:2].

### AlphaAvatarGroup

차세대 아바타 그룹(alpha). `AvatarGroupProps`를 받고 `--b-avatar-group-ellipsis-ml`로 말줄임 마진을 다룬다 [src:2].

### Badge

숫자/상태 배지. `BadgeSize`·`BadgeVariant`를 받는다(Primary·Secondary 스토리) [src:2].

### AlphaStatusBadge

상태 배지(alpha). `StatusBadgeSize`를 받고 `--b-status-*`와 `--color-surface-high/highest`를 쓴다 [src:2].

### Status

상태 점/인디케이터. `StatusType`·`StatusSize`를 받고 `--b-status-bg-color/size`와 `--color-surface-high/highest`를 쓴다 [src:2].

### Tag

태그 칩. `TagSize`·`TagVariant`를 받고 `--color-state-action-light`를 쓴다 [src:2].

### Icon

아이콘 렌더러(598 SVG 세트 연동). `IconSize`를 받으며(AllIcons·UsageColor·UsageSize 스토리) `--b-icon-color`와 150ms `--motion-transition-fast`를 쓴다 [src:2].

```tsx
<Icon source={ChannelIcon} size="m" color="txt-black-darkest" />
```

### Emoji

이모지 렌더러. `EmojiSize`를 받고 `--b-emoji-background-image/size`로 스프라이트를 렌더한다 [src:2].

### Text

타이포 프리미티브. `TextProps`를 받고 `--b-text-color/font-size/line-height/letter-spacing/line-clamp` 로컬 변수로 `{typography.typography-size-24}` 같은 묶음 토큰을 조립한다 [src:2].

**Feedback / Status** — 알림 표면은 blue/cobalt/green/orange/red accent를 상태별로 갈라 쓰고 `{rounded.radius-12}`를 공유한다.

### Banner

페이지 상단/인라인 알림 배너. **accent 20% 틴트 배경 + 선행 filled 아이콘(`info-filled`/`check-circle-filled` 등) + 텍스트(bold 리드) + 우측 닫기(`cancel-small`)** 한 줄 구성이다. 색은 blue(info)/cobalt(highlight)/green(success)/orange(warning)/red(critical)이고 글자·아이콘은 같은 hue의 솔리드값을 쓴다. `BannerVariant`·`RenderLinkFunc`(FullWidth/MaxWidth/MinWidth/Link/NoIcon 등 9 스토리)를 받고 `{rounded.radius-12}`·`{elevation.elevation-2}`다 [src:2].

### Toast

토스트 알림 — **떠 있는 다크 바**다. `fill-neutral-heaviest`(흑 85% 알파) 배경에 흰 텍스트, 선행 상태 아이콘(예 `check-circle-filled`, `{colors.green-300}`) + 우측 액션 링크(`{colors.blue-300}`, 예 "실행 취소")로 구성되며 폭 약 300px, `{elevation.elevation-3}`·`{rounded.radius-12}`다. `ToastAppearance`·`ToastPlacement`·`ToastPreset`·`ToastType`·`autoDismissTimeout`(기본 3000ms)·`zIndex` props를 받는다 [src:2].

### ProgressBar

진행률 바. `ProgressBarSize`·`ProgressBarVariant`를 받고 `--b-progress-bar-value/width`, `--color-gradient-green(-heavy)`, `{rounded.radius-3}`을 쓴다 [src:2].

### Spinner

회전 로딩. `SpinnerSize`를 받고 `--b-spinner-color`로 색을 정한다 [src:2].

### AlphaLoader

차세대 로더(alpha). `LoaderProps`를 받고 `--b-loader-*`(track/indicator color, stroke, view-box) 변수로 그린다 [src:2].

### Help

도움말 트리거(물음표). `HelpProps`를 받고 `--color-text-neutral`을 쓴다 [src:2].

**Layout / Primitives** — 레이아웃 골격은 Box/Center/Stack 프리미티브와 Divider, squircle용 SmoothCornersBox로 구성된다.

### Box

기본 박스 프리미티브. `BoxProps`로 패딩·마진·배경 등 레이아웃 속성을 받는다 [src:2].

### Center

중앙 정렬 컨테이너. `CenterProps`로 자식을 수평·수직 가운데에 둔다 [src:2].

### Stack

flex 스택. `HStackProps`·`VStackProps`·`StackProps`를 받고 `--b-stack-spacing`으로 간격을 준다 [src:2].

### LegacyStack

구버전 스택. Direction/Alignment/Spacing/Weight 스토리(Expanded·WeightSpacer 등)를 가지며, 신규 코드는 `{component.stack}`을 우선한다 [src:2].

### Divider

구분선. `DividerProps`를 받으며(Composition 스토리) `--b-divider-thickness/indent-size`와 `--color-border-neutral`을 쓴다 [src:2].

### SmoothCornersBox

연속 곡률(squircle) 박스. `SmoothCornersBoxProps`를 받고 `--b-smooth-corners-box-{border-radius,shadow-*,padding,margin,background-*}` 로컬 변수로 iOS식 부드러운 코너를 그린다 — Bezier 시그니처 형태를 담당하는 전용 프리미티브다 [src:2].

```tsx
<SmoothCornersBox borderRadius={16}>{/* content */}</SmoothCornersBox>
```

## Do's and Don'ts

**Do**

- product-facing 색은 시맨틱/컴포넌트 토큰(`--color-fill-*`·`--color-text-*`·`--color-border-*`·`bg-*`·`txt-*`)으로 호출하고, 글로벌 원시값은 새 role을 만들 때만 직접 참조한다 [src:3][src:2].
- 라이트·다크 양 테마를 동시에 검수한다 — 시맨틱 토큰이 테마별로 분기되므로, 한 variant를 흰 패널과 `{colors.grey-900}` 패널에 나란히 두고 확인한다 [src:2].
- 부드러운 코너가 필요한 표면은 `{component.smooth-corners-box}`(및 그 shadow-spread 변수를 재사용하는 `{component.avatar}`)로 iOS식 연속 곡률을 적용한다 — 시각 시그니처다 [src:2].
- 폼 입력 상태는 `--state-input-active/default/error` 토큰으로 표현하고, 선택 컨트롤(체크박스·라디오·스위치)은 `--color-fill-accent-green-heavier`를 공유한다 [src:2].
- 띄우는 표면은 `--layer-z-index-*` 순서(overlay 1000 → modal 1100 → toast 1200 → tooltip 1300)를 지켜 쌓는다 [src:3][src:2].
- 같은 역할에 alpha/legacy 변종이 있으면 신규 코드는 안정 또는 alpha 라인을 쓰고, `{component.legacy-tooltip}`·`{component.legacy-stack}` 같은 구버전은 마이그레이션 대상으로 둔다 [src:2].
- 모션은 150ms `cubic-bezier(0.3,0,0,1)` 범위에서 가볍게 운용하고, 비활성은 `--opacity-disabled: 0.4`로 표현한다 [src:3][src:2].

**Don't**

- 색을 hex/rgba로 하드코딩하지 않는다 — 본 문서의 OKLCH는 Bezier가 hex로 게시한 토큰의 변환값이며, 소비처는 시맨틱 토큰 이름으로 참조한다 [src:3].
- 라이트 단일 테마만 보고 색·그림자를 고정하지 않는다 — Bezier는 다크를 1급으로 지원하므로 다크 분기를 누락하면 안 된다 [src:2].
- 부드러운 코너를 단순 `border-radius`로 흉내 내 `{component.smooth-corners-box}`를 대체하지 않는다 — squircle 곡률은 전용 컴포넌트로 그린다 [src:2].
- 11개 무지개 hue를 의미 없이 흩뿌리지 않는다 — accent는 상태·카테고리 인코딩에 쓰고, 1차 액션은 blue 계열로 통일한다 [src:3].
- 공개된 59개 목록에 없는 컴포넌트 이름을 Bezier 컴포넌트처럼 만들지 않는다 [src:2].
- 유니코드·이모지를 UI 아이콘으로 쓰지 않는다 — Bezier는 자체 598 아이콘 세트(`@channel.io/bezier-icons`, 24×24 `currentColor`, outline/`-filled` 쌍)를 단일 출처로 두며, 이모지는 콘텐츠(채팅 리액션·👋)에서만 쓴다.
- 챗봇 톤("~해보세요!")이나 마케팅 과장("혁신적", "차세대")으로 카피를 채우지 않는다 — Bezier 문서는 동작을 평이하게 서술하는 개발자 문서 톤을 유지한다 [src:1].
- 채널톡의 B2B 고객 메시징 도메인 개념·플로우(상담 인박스, 팀 인박스, 마케팅·CRM 채널 등)를 성격이 다른 제품에 그대로 이식하지 않는다 — Bezier에서 차용할 것은 시각 언어(squircle 라운딩·8~12px 반경·Inter/Noto Sans KR 2-weight 타입·11-hue 무지개 액센트·라이트+다크 시맨틱 토큰 쌍·150ms 마이크로 모션)이지 채널톡의 메시징 서비스 도메인이 아니다 [src:1].
- 디자인시스템 이름 자체(`Bezier` 워드마크·`@channel.io/bezier-*` 패키지명)를 생성하는 제품 UI의 헤더·타이틀·버튼·라벨에 넣지 않는다 — 차용할 것은 시각 언어이지 시스템 이름이 아니다. UI 텍스트·네이밍은 자기 제품 브랜드로 재정의하고, 출처 표기가 필요하면 footer attribution(예: "Bezier 기반")에만 둔다.

## Responsive Behavior

Bezier는 앱 셸/뷰포트 브레이크포인트를 토큰으로 발행하지 않는다 — 토큰 CSS·foundation mdx 어디에도 `--breakpoint-*`나 미디어쿼리 발행값이 없다 `(no published breakpoint tokens; component-local sizing only)` [src:3][src:2]. 반응형 책임은 컴포넌트 내부의 콘텐츠-주도 폭과 앱 레이어 몫이며, 시스템은 뷰포트 비종속 빌딩블록을 제공하는 쪽이다 [src:3].

| Context | Key Changes |
| --- | --- |
| Published breakpoint system | 공개 조사 범위에서 명시적 breakpoint 토큰은 surfaced되지 않았다 `(no published breakpoint system surfaced)` — 데스크톱/모바일 레이아웃 분기는 앱 레이어에서 별도 정의해야 한다 [src:3][src:2]. |
| 일차 적응 축 | 뷰포트가 아니라 **테마**다 — autodocs 한 장 안에 같은 variant의 라이트·다크가 병치되며, 색·표면·그림자가 테마별로 분기된다 [src:2]. |
| 컴포넌트 폭 적응 | `{component.banner}`가 `UsageFullWidth`·`UsageMaxWidth`·`UsageMinWidth` 스토리로 폭 적응을, `{component.modal}`이 `--b-modal-collision-padding`으로 뷰포트 충돌 회피를 다룬다 — 반응형 책임이 컴포넌트 폭/충돌 패딩에 국한된다 [src:2]. |
| 터치 타깃 / 밀도 | 폼 공통 `--b-form-field-size`로 입력 컨트롤 높이를 일원화하고, `{component.text-field}`/`{component.button}`이 `xl/l/m/xs` 사이즈 enum으로 밀도를 바꾼다(기본 `m`) — 모바일·데스크톱 양쪽을 한 컴포넌트의 사이즈 prop으로 커버한다 [src:2]. 표준 터치 타깃(최소 44×44px)이 필요하면 더 큰 사이즈 enum을 선택해 확보한다. |
| 관찰 한계 | 제공 스크린샷은 모두 Storybook 데스크톱 autodocs 캔버스라 실제 모바일 웹/네이티브 리플로우는 직접 관찰되지 않았다 `(only desktop Storybook canvas observed; no mobile-web breakpoint surfaced)` [src:2]. |

## Known Gaps

- **Breakpoint 토큰 부재.** Bezier는 뷰포트 브레이크포인트를 토큰으로 발행하지 않으며, 반응형은 컴포넌트 로컬 폭과 앱 레이어 몫이다 — 데스크톱/모바일 레이아웃 분기는 다운스트림에서 정의해야 한다 [src:3][src:2].
- **alpha/legacy 컴포넌트 중복.** 같은 역할에 안정·alpha·legacy 변종이 공존한다(예: `{component.avatar}` ↔ `{component.alpha-avatar}`, `{component.tooltip}` ↔ `{component.legacy-tooltip}`, `{component.stack}` ↔ `{component.legacy-stack}`) — 어느 라인을 채택할지는 소비처가 결정해야 하며, 본 문서는 신규 코드에 안정/alpha 라인을 권장한다 [src:2].
- **hex→OKLCH 변환 오차.** 모든 색은 Bezier가 hex로 게시한 토큰을 OKLCH로 변환한 것이라 미세한 변환 드리프트가 있을 수 있다 — 정확한 원본 hex는 `@channel.io/bezier-tokens` 빌드 CSS를 직접 참조해야 한다 [src:3].
- **일부 값 공개 검증 한계.** beta 팔레트 값·컴포넌트 정본 스펙(Banner/Toast 처리 등) 상당수가 공개 URL로 직접 교차검증되지 않는다 — 정확값이 필요하면 `@channel.io/bezier-tokens`(beta 엔트리) 또는 Storybook autodocs와 대조해야 한다 [src:3][src:2].
- **시맨틱 다크 원시값 일부 미확인.** 시맨틱 토큰의 테마 분기 구조(`txt-black-darkest` 등)는 확인됐으나, 다크 측이 참조하는 일부 white-알파 원시값의 정확한 단계는 코퍼스에서 전부 발췌되지 않았다 [src:3][src:2].
- **모바일 리플로우 미관찰.** 제공 스크린샷이 데스크톱 Storybook 캔버스 한정이라, 실제 모바일 웹/네이티브에서의 컴포넌트 리플로우·접힘 거동은 직접 확인되지 않았다 [src:2].

## References

1. https://github.com/channel-io/bezier-react
2. https://main--62bead1508281287d3c94d25.chromatic.com/
3. https://www.npmjs.com/package/@channel.io/bezier-tokens
4. https://www.npmjs.com/package/@channel.io/bezier-icons
