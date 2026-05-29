---
name: 라인
design_system_name: LINE Design System (LDSG)
slug: line-design-system
category: messenger
last_updated: "2026-05-29"
created_at: 2026-05-25
sources:
  - https://designsystem.line.me/LDSG/foundation/color-en
  - https://designsystem.line.me/LDSG/foundation/typography-en
  - https://designsystem.line.me/LDSG/foundation/object-styles-en
  - https://designsystem.line.me/LDSG/components/buttons/action-button-en/
  - https://designsystem.line.me/LDSG/components/buttons/icon-button-en/
  - https://creative.line.me/ko/guide/brand-guideline
  - https://designsystem.line.me/LDSG/components/overlays/popup-en/
  - https://en.wikipedia.org/wiki/Line_(software)
  - https://github.com/line/seed
  - https://creative.line.me/guide/brand-guideline/line-seed-font
  - https://designsystem.line.me/LDSG/components/inputs/switch-en/
  - https://designsystem.line.me/LDSG/components/inputs/stepper-en
  - https://designsystem.line.me/LDSG/components/buttons/floating-action-button-en/
  - https://designsystem.line.me/LDSG/components/inputs/chip-en/
  - https://designsystem.line.me/LDSG/components/inputs/radio-button-en/
  - https://designsystem.line.me/LDSG/components/indicators/badge-en/
  - https://designsystem.line.me/LDSM/foundation/color/line-semantic-colors-ex-en/
related_services:
  - seed-design
  - toss
  - socar
lang: ko
logo: https://getdesign.kr/logos/line-design-system.png
---

## Brand & Style

라인의 디자인 시스템은 두 갈래로 나뉜다. **LDSM(LINE Design System for Messenger)**은 라인 메신저 본체의 시스템이고, **LDSG(LINE Design System for Global Family Service)**는 LY Corporation 산하 글로벌 패밀리 서비스(한국·일본·대만 등)가 동일한 UX 표준을 공유하도록 설계된 공용 시스템이다 [src:1]. 본 카탈로그 항목은 LDSG에 한정한다 — LDSM의 "LINE Semantic Colors" 명명 체계나 다크모드 자동 매핑은 이 문서의 토큰 정의에 포함하지 않는다 [src:17].

LDSG는 메신저 자체의 정체성을 강요하기보다 "어디서든 라인다운 화면"이라는 인상을 유지하기 위해 LINE Messenger의 기본 컬러 테마를 따르며, LINE Green을 패밀리 서비스 공통의 Primary로 약속한다 [src:1]. 타깃 사용자는 일본·대만·태국을 중심으로 한 동아시아·동남아 메신저 사용자다. 라인은 일본에서 MAU 1억 이상의 압도적 1위, 대만 보급률 약 94%로 국민 메신저 포지션을 갖고 있고 [src:8], LDSG는 이들 시장의 라인 패밀리 서비스 UI 일관성을 책임진다 [src:1]. 한국 사용자에게 직접 노출되는 시스템은 아니지만, 라인 본사·NHN Japan의 모태가 한국 NHN(Naver) 자회사이며 한국 디자인 팀이 LDSG에 직접 기여하는 구조다 [src:8].

감성 톤은 절제된 친근함이다. 카카오톡 같은 강한 채도의 노랑이 아닌 차분한 LINE Green(`oklch(0.7 0.18 152)`)을 핵심으로 두고, 컴포넌트 그림자는 알파 0.07 이하의 매우 옅은 깊이감으로 통일되어 있어 "정돈된 친근함" 쪽으로 균형이 잡혀 있다 [src:1][src:3]. 호버/프레스를 색상 변화가 아닌 단순 opacity 조정(Hover 70%, Pressed 50%)으로 일관 처리해, 컬러 체계가 작아도 시각 피드백이 명료하게 작동하도록 설계되어 있다 [src:1]. 모회사 LY Corporation 차원의 "LY Corporation DESIGN HUB"는 그리드·도형·아웃라인·앵커 포인트 같은 최소한의 시각 요소로 디자인의 기반을 시각화한다는 미니멀 미학을 명시하고 있다 [src:6].

## Colors

LDSG의 공식 컬러 체계는 "Rainbow Color"로 부르며 Messenger Primary Palette와 Theme Color(Brand·Role) 두 축으로 구성된다. 공개된 정확값은 LINE Green, LINE Black, Disabled gray 3개뿐이고, 나머지 파생 팔레트(`lime-600`, `red-600`, `blue-600`, `lightgreen-700` 등)는 토큰명만 공개되어 있다 [src:1]. 본 문서는 OKLCH를 유일 정전(canonical)으로 두고, 미공개 정확값은 토큰명에서 추정한 600단 채도/명도로 ≈ 표기한다.

```yaml
# Messenger Primary Palette
ldsg-color-linegreen:      oklch(0.7 0.18 152)        # LDSG 기본 Primary
ldsg-color-black:          oklch(0 0 0)                # 본문 텍스트
ldsg-color-disabled-gray:  oklch(0.92 0 0)             # 비활성 컨텐츠/라벨

# Brand Color (테마 토큰)
ldsg-color-brand-onsurface:        oklch(1 0 0)                 # = white (default)
ldsg-color-brand-onsurface-alt:    oklch(0 0 0)                 # = black (default)
ldsg-color-brand-primary:          oklch(0.7 0.18 152)          # = linegreen (default)
ldsg-color-brand-primary-alt:    ≈ oklch(0.5 0.18 152)          # = lightgreen-700 (정확값 비공개, 추정)
ldsg-color-brand-secondary:      ≈ oklch(0.25 0.08 260)         # = linenavy (정확값 비공개, 추정)
# ldsg-color-brand-secondary-alt:  TBD                           # 공식 미정의 — 다운스트림이 추정 토큰을 발명하지 않도록 정의에서 제외

# Role Color (의미 토큰)
ldsg-color-role-positive:      ≈ oklch(0.7 0.2 145)         # = lime-600 (정확값 비공개)
ldsg-color-role-negative:      ≈ oklch(0.6 0.22 27)         # = red-600 (정확값 비공개)
ldsg-color-role-link:          ≈ oklch(0.6 0.18 250)        # = blue-600 (정확값 비공개)
ldsg-color-role-primarytext:   oklch(0 0 0)                 # = black
ldsg-color-role-disabled:      oklch(0.92 0 0)              # = disabled-gray
```

- **{colors.ldsg-color-linegreen}**: LDSG의 모든 패밀리 서비스가 공유하는 기본 Primary. 메신저 본체 컬러 테마를 그대로 잇는다 [src:1].
- **{colors.ldsg-color-role-positive}** / **{colors.ldsg-color-role-negative}** / **{colors.ldsg-color-role-link}**: 의미 단위로 분리된 Role 토큰. 정확값이 공개되지 않아 OKLCH는 토큰명(`lime-600`, `red-600`, `blue-600`)에서 일반적인 600단 채도/명도로 추정한 값이다 [src:1].
- **On Surface 텍스트/아이콘**: Primary·Secondary 컬러 위에서 명도 대비 3:1 이상을 요구한다 [src:1].
- **State 처리**: Normal 100% / Hover 70% / Pressed 50% / Disabled = `{colors.ldsg-color-role-disabled}`. 컬러 토큰을 늘리지 않고 opacity로 상태를 표현하는 것이 LDSG의 일관 원칙이다 [src:1].

## Typography

LDSG는 자체 폰트가 아닌 **Typography 토큰 + 언어별 Language Pack**으로 타이포를 운영한다. 동일 토큰을 쓰면 언어를 바꿔도 시각 인상이 유지되도록, EN/JP/TC/TH 4개 언어별 최적화된 폰트 세트가 묶여 있다 [src:2]. 한국어(KR)는 LDSG Language Pack 1차 지원에는 들어 있지 않지만, 모회사가 별도로 배포하는 **LINE Seed** 폰트는 KR을 포함해 EN/JP/KR/TH/TW 5개 언어를 지원한다 [src:9].

한국어 환경에서 LDSG의 시각 인상을 따르려면 LINE Seed KR을 우선 후보로 두고, 폴백으로 Pretendard Variable을 두는 구성이 자연스럽다. LINE Seed는 기하학 기반 산세리프로 "convenience and friendliness"를 디자인 키워드 삼아, 로고의 직선적 형태를 유지하면서도 명확한 곡선으로 친근함을 살린다 [src:9][src:10]. Dalton Maag·Fontworks·Sandoll·Fontrix·Cadson Demak·DynaComware 같은 다국가 폰트 파운드리와 LINE Creative팀의 공동 개발이라 다국어 시각 일관성이 강점이다 [src:9].

### 토큰 네이밍 구조

토큰명은 5요소 조합: `Language - Type - Size - FontSize - Weight`. 예: `ldsg-typography-title-m-200` [src:2].

- **Language**: EN / JP / TC / TH
- **Type**: Title(헤딩·리스트 타이틀·서브타이틀, 작은 line-height) / Text(본문·버튼 라벨, 가독성 위한 넉넉한 line-height) [src:2]
- **Size**: XS · S · M · L · XL · XXL
- **Weight**: 100 / 200 / 300 (다국어/폰트별 weight 체계가 달라 숫자 토큰으로 추상화) [src:2]

### 사이즈 토큰 (용도)

```yaml
# Title 계열 (작은 line-height)
ldsg-typography-title-xxl:  Headings                                           # 픽셀 비공개
ldsg-typography-title-xl:   Headings                                           # 픽셀 비공개
ldsg-typography-title-l:    Headings, List Item Title, Sub Title               # 픽셀 비공개
ldsg-typography-title-m:    Headings, List Item Title, Sub Title               # 픽셀 비공개
ldsg-typography-title-s:    Headings, List Item Title, Sub Title               # 픽셀 비공개
ldsg-typography-title-xs:   Headings, List Item Title, Sub Title               # 픽셀 비공개

# Text 계열 (넉넉한 line-height)
ldsg-typography-text-m:     Body, Button Label, Sub Text, Caption, Overline, Badge
ldsg-typography-text-s:     Body, Button Label, Sub Text, Caption, Overline, Badge
ldsg-typography-text-xs:    Body, Button Label, Sub Text, Caption, Overline, Badge
```

(LDSG 공식 페이지는 토큰별 픽셀 값을 이미지로만 표기해 텍스트 추출이 불가능하다 — 토큰명·용도 매핑까지만 확정값이고, 픽셀 매핑은 비공개 [src:2])

### 컴포넌트별 기본 토큰 적용 예 [src:7][src:12][src:13]

- Popup Title (Medium 기본): `{typography.ldsg-typography-title-m-200}`
- Popup Title (Large): `{typography.ldsg-typography-title-l-200}`
- Popup Description (Medium 기본): `{typography.ldsg-typography-text-s-100}`
- Stepper Text Field 기본: `{typography.ldsg-typography-title-s-100}`
- Floating Pill Button 라벨 기본: `{typography.ldsg-typography-text-s-100}`

## Spacing

LDSG는 별도의 공식 spacing 스케일 페이지를 공개하지 않는다. 패딩·간격은 컴포넌트별 design spec 표에 케이스로 정의되어 있을 뿐, 토큰화된 스케일 자료는 존재하지 않는다 [src:3]. 다운스트림 구현 시에는 LDSG 컴포넌트 spec에서 값을 직접 끌어오거나, 4·8 기반의 일반적인 모바일 스케일(`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48`)을 폴백으로 두는 편이 안전하다.

(공식 spacing 토큰 부재 — Known Gaps 참고)

## Rounded

라운드는 5단으로 정리되어 있다. 가장 빈번한 값은 5px(버튼류)로, 카카오톡 같은 강한 큐트한 라운드보다 절제된 모서리 처리가 LDSG의 특징이다 [src:3].

```yaml
ldsg-radius-100:    3px      # 배지 같은 가장 작은 컴포넌트
ldsg-radius-200:    5px      # 가장 빈번. 버튼류 등 중간 사이즈
ldsg-radius-300:    7px      # 화면 50% 정도 사이즈 (예: 카드)
ldsg-radius-400:    12px     # 화면 50%를 넘는 컴포넌트 (Modal Sheet, Popup)
ldsg-radius-circle: 50%      # 원형
```

- Action Button의 라운드 커스터마이징은 `{rounded.ldsg-radius-100}` / `{rounded.ldsg-radius-200}` / `{rounded.ldsg-radius-300}` 3개 중 선택을 권장한다 [src:4].
- Chip의 기본 라운드는 "Pill"(완전 둥근 모서리)이다 [src:14].

### Border Width

라운드와 같은 페이지에 정의된 보조 토큰 [src:3]:

```yaml
ldsg-border-50:   0.5px      # 일부 디바이스에서 미표시 위험, 작은 객체 한정
ldsg-border-100:  1px        # 기본값 (가장 널리 사용)
ldsg-border-200:  2px        # 요소 강조가 필요할 때
```

## Elevation & Depth

그림자는 **배경별로 분리된 6종**으로 운영된다. On White 배경 3단, On Light Gray 배경 3단을 각각 정의해, 어두운 그림자가 회색 배경에서 뭉개져 보이는 정합성 문제를 막는다 [src:3]. 알파는 모두 0.04~0.12 사이의 매우 옅은 값으로 통일되어 있어, "정돈된 친근함" 쪽으로 톤이 기운다.

```yaml
# On White 배경
ldsg-shadow-on-white-100: 0px 0px 2px oklch(0 0 0 / 0.07), 0px 1px 2px oklch(0 0 0 / 0.07)  # 소형 버튼, Chip, Badge
ldsg-shadow-on-white-200: 0px 1px 6px oklch(0 0 0 / 0.12)                                     # 중/대 버튼
ldsg-shadow-on-white-300: 0px 1px 20px oklch(0 0 0 / 0.07)                                    # Large Card, Bottom Sheet

# On Light Gray 배경
ldsg-shadow-on-gray-100:  0px 0px 1px oklch(0 0 0 / 0.05), 0px 1px 1px oklch(0 0 0 / 0.05)
ldsg-shadow-on-gray-200:  0px 1px 4px oklch(0 0 0 / 0.06)
ldsg-shadow-on-gray-300:  0px 1px 15px oklch(0 0 0 / 0.04)
```

운용 원칙은 단순하다 — 컴포넌트가 놓이는 배경색을 먼저 확정한 뒤 그에 맞는 그림자 그룹을 고르고, 컴포넌트 크기(소·중·대)에 따라 100/200/300 단계를 결정한다 [src:3].

## Shapes

기하학 기반의 절제된 도형 언어가 LDSG의 시각 정체성이다. LINE Seed 자체가 "geometry-based, convenience and friendliness"를 디자인 키워드로 삼은 기하학적 산세리프이며, 로고의 직선적 형태를 유지하면서 명확한 곡선을 강조해 가독성과 친근함을 동시에 추구한다 [src:9][src:10].

모회사 LY Corporation DESIGN HUB의 비주얼 콘셉트도 같은 기조로 명시되어 있다 — "그리드, 도형, 아웃라인, 앵커 포인트 등 최소한의 시각 요소를 활용해 디자인의 기반과 과정을 시각화" [src:6]. 카카오톡의 큐트한 라운드보다 절제된 5px(`{rounded.ldsg-radius-200}`) 라운드를 기본으로 두고, 가장 큰 화면 단위인 Modal/Popup에서도 12px(`{rounded.ldsg-radius-400}`)를 넘기지 않는 점이 이 도형 언어의 실제 적용이다 [src:3].

원형은 별도로 `{rounded.ldsg-radius-circle}`(50%)로 명시되어 있어 아바타·FAB·Circle Badge 같은 완전 원형 요소에만 한정해서 쓴다 [src:3].

## Components

LDSG의 컴포넌트는 모두 LINE 자체 아이콘 라이브러리 **LAICON**을 사용하도록 명시되어 있다 [src:4][src:5]. 상태 처리는 색상 변경이 아닌 opacity 변화(Hover 70%, Pressed 50%, Disabled = `{colors.ldsg-color-role-disabled}`)로 일관 적용된다 [src:1].

### action-button

기본 액션 버튼. Contained / Outlined / Ghost 3타입, XL·L·M·S·XS 5사이즈, Icon+Text / Text Only / Icon Only 3패턴으로 분기된다. Flexible(좌우 패딩 고정, 텍스트에 따라 너비 자동) vs Fixed(너비 자유 조정)로 폭 동작을 선택할 수 있다 [src:4].

가로 배치 시 우선순위 높은 버튼을 우측에 배치하며, 동일 행에 3개 이상을 두는 것은 주의가 권장된다 [src:4].

```tsx
<ActionButton
  type="contained"            // 'contained' | 'outlined' | 'ghost'
  size="m"                    // 'xl' | 'l' | 'm' | 's' | 'xs'
  pattern="iconText"          // 'iconText' | 'textOnly' | 'iconOnly'
  width="flexible"            // 'flexible' | 'fixed'
  radius="ldsg-radius-200"    // 'ldsg-radius-100' | 'ldsg-radius-200' | 'ldsg-radius-300'
>
  확인
</ActionButton>
```

### action-button-full-bleed

iPhone X+ 디바이스 전용 변형. 라운드 0, 전체 너비, 화면 하단 고정, Home indicator 영역도 같은 색으로 칠한다. 화면 최하단 1차 액션 한정으로 사용한다 [src:4].

```tsx
<ActionButton
  type="contained"
  variant="fullBleed"         // 라운드 0, 전체 너비, 하단 고정
  size="l"
>
  결제하기
</ActionButton>
```

### icon-button

아이콘 단독 버튼. Contained / Outlined / Slot 3타입, S(32px) / L(52px) 2사이즈. 라이브러리에서는 Enabled/Disabled만 지원하며, Hover/Pressed는 개발 단계에서 적용한다 [src:5].

```tsx
<IconButton
  type="contained"
  size="l"                    // 's' (32px) | 'l' (52px)
  icon="search"               // LAICON 아이콘 키
  badge="dot"                 // 'none' | 'dot' | 'number'
  badgeCount={5}              // number 모드 전용, 1~999 (초과 시 "999+")
/>
```

### icon-button-group

아이콘 버튼 묶음. 권장 개수는 3~5개이며, 6개 이상은 expanded 옵션으로 처리한다. 그룹 내에서는 단일 컬러·스타일을 유지하는 것이 권장된다 [src:5].

### floating-action-button-circle

원형 FAB. 단일 액션용과 Expandable(자식 버튼 expand) 2종이 있다. Expand 상태에서는 메인 버튼 아이콘이 close 아이콘으로 자동 전환된다 [src:13]. 기본 채움은 `{colors.ldsg-color-brand-primary}`, 그림자는 `{elevation.ldsg-shadow-on-white-200}` [src:13].

```tsx
<FabCircle
  variant="expandable"        // 'single' | 'expandable'
  icon="plus"
>
  <FabChild icon="camera" label="카메라" />
  <FabChild icon="image" label="갤러리" />
</FabCircle>
```

### floating-action-button-pill

알약 형태 FAB. Refresh 같은 보조 액션 유도용으로, 화면 상/중/하단 어디에도 배치할 수 있다. 라벨 타이포는 `{typography.ldsg-typography-text-s-100}` 기본 [src:13].

### switch

On/Off 토글. Text Label + Description(옵션) + Container + Thumb 구조. 토글이 즉시 영향을 미치는 컨텍스트에만 사용한다(저장 버튼이 따로 있는 폼에는 부적합). Hover/Pressed는 라이브러리 미제공이며 개발 단계에서 자동 적용한다 [src:11].

```tsx
<Switch
  label="알림 받기"
  description="중요 메시지만"   // 옵션
  checked={true}
  onChange={handleChange}
/>
```

### chip

선택 가능한 작은 라벨. Text Only / Side Icons / Left Icon / Right Icon 4패턴, Contained·Outlined 2타입, Small·Medium·Large 3사이즈, Selected·Unselected·Disabled 3상태. 기본 라운드는 Pill(완전 둥근 모서리)이다 [src:14].

**단일 선택만 가능한 경우 사용 금지** — 2개 이상의 선택지가 있을 때만 쓴다 [src:14].

```tsx
<Chip
  type="contained"            // 'contained' | 'outlined'
  size="m"                    // 's' | 'm' | 'l'
  pattern="leftIcon"          // 'textOnly' | 'sideIcons' | 'leftIcon' | 'rightIcon'
  selected={false}
  icon="filter"
>
  카페
</Chip>
```

### stepper

수량 증감 입력. Left Button + Text Field + Right Button 구조. S(32px) / M(46px) 2사이즈. 최솟값 도달 시 Minus 버튼이 자동 Disabled로 전환되고, Text Field는 직접 입력도 지원한다. Text Field 타이포는 `{typography.ldsg-typography-title-s-100}` 기본 [src:12].

소수점·넓은 범위에는 부적합하며, 그 경우 슬라이더 사용이 권장된다 [src:12].

```tsx
<Stepper
  size="m"                    // 's' (32px) | 'm' (46px)
  value={1}
  min={1}
  max={99}
  onChange={handleChange}
/>
```

### radio-button

상호 배타 선택. Container + Text Label + Description(옵션) 구조. 한 번 선택된 후에는 미선택 상태로 되돌릴 수 없는 점이 핵심 — 라디오 그룹의 mutual exclusion을 보장하는 설계다 [src:15].

### badge

상태/카운트 표시. Dot / Number / Icon 3종, S·M·L·XL·XXL 5사이즈. 2-digit+ 옵션으로 두 자리 이상 표시가 가능하다. 색상은 변경 가능하나 기본 권장은 서비스 Primary 또는 빨강 계열이다 [src:16].

```tsx
<Badge
  type="number"               // 'dot' | 'number' | 'icon'
  size="m"                    // 's' | 'm' | 'l' | 'xl' | 'xxl'
  count={12}
  twoDigit={true}             // 두 자리 이상 표시
/>
```

### popup

오버레이 다이얼로그. 4가지 패턴 — Text Popup(기본 alert) / Avatar Popup(OA 계정 추가용) / Image Popup(4:3·16:9) / Promotion Popup(4:3·16:9·1:1·세로 4:3, 광고용) [src:7].

- **너비 고정 288px**, 자동 높이(최대 504px) [src:7]
- LIFF 환경에서 높이 472px+면 iPhone SE의 LIFF 닫기 버튼과 겹칠 수 있어 주의 [src:7]
- Button Area는 세로 배치(가시성 높음, 컨텐츠 많을 때)와 가로 배치(간단한 confirm)를 선택 [src:7]
- 세로 버튼 패턴: Primary Only / Primary+Outlined / Primary+Ghost / 3 버튼(비권장) [src:7]
- 가로 버튼 패턴: Primary Only / Ghost Primary+Secondary / Contained Primary+Secondary [src:7]
- 더 큰 높이가 필요한 경우 Bottom Sheet 사용이 권장된다 [src:7]
- Title 기본 타이포: `{typography.ldsg-typography-title-m-200}` (Medium) / `{typography.ldsg-typography-title-l-200}` (Large)
- Description 기본 타이포: `{typography.ldsg-typography-text-s-100}` (Medium 기본)

```tsx
<Popup
  pattern="text"              // 'text' | 'avatar' | 'image' | 'promotion'
  size="medium"               // Title 토큰을 'ldsg-typography-title-m-200' 사용
  title="삭제하시겠어요?"
  description="이 작업은 되돌릴 수 없어요."
  buttonLayout="vertical"     // 'vertical' | 'horizontal'
  buttons={[
    { type: 'contained', label: '삭제', role: 'primary' },
    { type: 'ghost', label: '취소' },
  ]}
/>
```

## Do's and Don'ts

### Do

- Primary가 필요한 모든 자리에는 `{colors.ldsg-color-brand-primary}` = LINE Green을 기본으로 둔다 — 다른 색을 임의로 Primary로 승격시키지 않는다 [src:1].
- 상태 변화(Hover/Pressed)는 컬러 토큰을 새로 만들지 말고 opacity(70%/50%) 조정으로 표현한다 [src:1].
- 그림자는 컴포넌트가 놓이는 배경색(흰색 vs 라이트 그레이)에 맞춰 `{elevation.ldsg-shadow-on-white-*}` 또는 `{elevation.ldsg-shadow-on-gray-*}` 중 옳은 그룹을 골라 쓴다 [src:3].
- 가로 배치된 버튼은 우선순위 높은 쪽을 **오른쪽**에 둔다 [src:4].
- 라운드는 컴포넌트 크기에 따라 `{rounded.ldsg-radius-100}` / `{rounded.ldsg-radius-200}`(기본) / `{rounded.ldsg-radius-300}` / `{rounded.ldsg-radius-400}` 중에서 고르며, 기본값 5px 외 값은 정당화가 필요하다 [src:3].
- 한국어 환경에서 LDSG 시각 인상을 따르려면 본문 폰트를 LINE Seed KR로, 폴백을 Pretendard Variable로 둔다 [src:9][src:10].

### Don't

- hex나 rgba로 새 컬러를 정의하지 않는다 — LDSG의 미공개 정확값(`lime-600` 등)도 토큰명으로만 참조하고, 다운스트림에서 임의 hex를 박지 않는다 [src:1].
- 단일 선택만 가능한 컨텍스트에 `{component.chip}`을 쓰지 않는다(2개 이상 선택지 전용) [src:14].
- 한 행에 `{component.action-button}` 3개 이상을 두는 구성은 피한다 [src:4].
- `{component.stepper}`를 소수점이나 넓은 범위 입력에 쓰지 않는다 — 그 경우 슬라이더로 교체한다 [src:12].
- `{component.popup}` 높이를 504px 초과로 설계하지 않는다 — 더 큰 컨텐츠는 Bottom Sheet로 옮긴다 [src:7].
- LIFF 환경에서 `{component.popup}` 높이를 472px 이상으로 두지 않는다(iPhone SE의 LIFF 닫기 버튼과 겹침) [src:7].
- 라이브러리 미제공 상태(Switch·Stepper·Icon Button의 Hover/Pressed)를 디자인 단계에서 임의 색상으로 지정하지 않는다 — 개발 단계 적용 약속을 따른다 [src:5][src:11][src:12].
- `{component.action-button-full-bleed}`를 화면 최하단 1차 액션 외 자리에 쓰지 않는다 [src:4].
- 버튼 라벨에 줄바꿈이 생기게 두거나 축약형을 쓰지 않는다 — 의미가 흐려진다 [src:5].
- `{component.icon-button}`을 라벨 없이 쓸 때는 아이콘 의미가 명확한지 먼저 확인한다 [src:5].
- LDSM의 "LINE Semantic Colors" 토큰명·다크모드 자동 매핑을 LDSG 토큰과 혼용하지 않는다 — 두 시스템은 별개의 명명 체계를 갖는다 [src:17].
- LDSG를 라인이 아닌 제품에 채용할 때 라인의 메신저 패밀리 서비스 도메인(메신저 본체 컬러 테마를 잇는 LINE Green 브랜드 상속, 메신저·결제·스티커 같은 라인 계열 제품 맥락)을 그대로 이식하지 않는다 — LDSG는 패밀리 서비스용 공용 시스템이므로 차용할 것은 시각 언어(절제된 LINE Green primary·opacity 기반 Hover/Pressed 상태·배경별 분리 그림자·보수적 5/12px 라운드·기하학 미니멀 도형)이고, 브랜드 색·제품 도메인은 자기 서비스에 맞게 재정의한다 [src:1].

## Responsive Behavior

LDSG는 공식 breakpoint 표를 공개하지 않는다 — LIFF(LINE 내장 웹뷰)와 패밀리 모바일 앱 웹뷰가 주된 실행 환경이라, 디자인 결정 자체가 **모바일 우선·웹뷰 가정**에 잠겨 있다 [src:7].

| Breakpoint    | 환경                       | Key Changes |
| ------------- | -------------------------- | ----------- |
| LIFF (모바일) | LINE 메신저 내장 웹뷰      | `{component.popup}` 높이 472px 미만, 폭 288px 고정 [src:7] |
| iPhone X+     | Home indicator 보유        | `{component.action-button-full-bleed}` 사용 가능 [src:4] |
| Standalone Web| LIFF 외 웹                 | (공개된 breakpoint 시스템 없음) |

- **터치 타깃**: `{component.icon-button}` S 32px / L 52px, `{component.stepper}` S 32px / M 46px — S 사이즈는 일반 가이드(44×44px)에 못 미쳐 마진 확보가 필요하다 [src:5][src:12].
- **Popup 사이징**: 288px × 최대 504px, 그 이상은 Bottom Sheet로 옮긴다 [src:7].
- **이미지 비율**: Image Popup 4:3·16:9 / Promotion Popup 4:3·16:9·1:1·세로 4:3 [src:7].
- **컴포넌트 collapsing**: `{component.icon-button-group}`은 3~5개 권장, 6개 이상은 expanded 옵션으로 펼친다 [src:5].

## Known Gaps

LDSG 공식 문서가 공개하지 않거나 이미지로만 제공해 다운스트림이 직접 채워야 하는 항목이다.

- **Typography 픽셀 값**: 토큰명·용도 매핑은 명확하지만 픽셀·rem 값이 공식 페이지에 이미지로만 표기되어 텍스트 추출 불가 — LDSG Figma 직접 측정 필요 [src:2].
- **Spacing 토큰**: 글로벌 spacing 스케일 페이지 부재. 컴포넌트별 design spec 표에 케이스로만 정의 — 다운스트림이 스케일을 정의해야 한다 [src:3].
- **파생 컬러 정확값**: `lime-600`, `red-600`, `blue-600`, `lightgreen-700`, `linegray`, `linenavy` 등은 비공개. 본 문서의 ≈ 값은 토큰명에서 추정한 600단 채도/명도 기준이며, 정확값은 Figma 라이브러리에서 끌어와야 한다 [src:1].
- **본 카탈로그가 다루지 않은 LDSG 컴포넌트**: LDSG는 text-input·checkbox·slider·pulldown·toast(toast-overlay)·bottom-sheet·bottom-navigation·tab·page-indicator 등 추가 컴포넌트를 운영하나, 본 문서의 research 단계에서 anatomy·types·states·customization 정보가 충분히 확보되지 않아 토큰 매핑 정확도를 보장할 수 없다. 다운스트림 구현 시 LDSG 공식 문서를 직접 참조한다.
- **다크 모드**: LDSG 공식 페이지에 다크 모드 카운터파트 토큰이 명시되어 있지 않다. 다운스트림 구현 시 직접 설계 필요.
- **한국어(KR) Language Pack**: Typography Language Pack 1차 지원이 EN/JP/TC/TH로 한정 — 한국어 환경 적용 시 LINE Seed KR 또는 Pretendard Variable로 폴백 매핑을 다운스트림이 정의해야 한다 [src:2][src:9].
- **LDSM (LINE Messenger 본체) 시스템 미포함**: 본 카탈로그 항목은 LDSG(글로벌 패밀리)에 한정한다. LDSM은 "LINE Semantic Colors" 명명 체계 + 다크모드 자동 매핑(Light `#111111` ↔ Dark `#FFFFFF`) + case-studies/UX guidelines 운영 자료를 포함하는 독립 시스템이다. 본 문서의 모든 토큰·컴포넌트·인용은 LDSG 범위 내에서만 유효하며, LDSM은 향후 별도 카탈로그 항목으로 추가될 수 있다 [src:17].

## References

1. https://designsystem.line.me/LDSG/foundation/color-en
2. https://designsystem.line.me/LDSG/foundation/typography-en
3. https://designsystem.line.me/LDSG/foundation/object-styles-en
4. https://designsystem.line.me/LDSG/components/buttons/action-button-en/
5. https://designsystem.line.me/LDSG/components/buttons/icon-button-en/
6. https://creative.line.me/ko/guide/brand-guideline
7. https://designsystem.line.me/LDSG/components/overlays/popup-en/
8. https://en.wikipedia.org/wiki/Line_(software)
9. https://github.com/line/seed
10. https://creative.line.me/guide/brand-guideline/line-seed-font
11. https://designsystem.line.me/LDSG/components/inputs/switch-en/
12. https://designsystem.line.me/LDSG/components/inputs/stepper-en
13. https://designsystem.line.me/LDSG/components/buttons/floating-action-button-en/
14. https://designsystem.line.me/LDSG/components/inputs/chip-en/
15. https://designsystem.line.me/LDSG/components/inputs/radio-button-en/
16. https://designsystem.line.me/LDSG/components/indicators/badge-en/
17. https://designsystem.line.me/LDSM/foundation/color/line-semantic-colors-ex-en/
