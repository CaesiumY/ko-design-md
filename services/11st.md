---
name: 11번가
design_system_name: 11STREET Design System
slug: 11st
category: commerce
last_updated: "2026-05-29"
created_at: 2026-05-27
sources:
  - https://design.11stcorp.com/brand/principle/
  - https://design.11stcorp.com/brand/logos/
  - https://design.11stcorp.com/foundation/color/
  - https://design.11stcorp.com/brand/font/
  - https://design.11stcorp.com/foundation/spacing/
  - https://design.11stcorp.com/foundation/iconography/
  - https://design.11stcorp.com/foundation/typography/
  - https://design.11stcorp.com/components/toast-notification/
  - https://designcompass.org/en/2024/05/21/11st-design-system/
  - https://design.11stcorp.com/foundation/accessibility/
  - https://design.11stcorp.com/foundation/grid/
  - https://design.11stcorp.com/components/badge/
  - https://design.11stcorp.com/components/buttons/
  - https://design.11stcorp.com/components/accordion/
  - https://design.11stcorp.com/components/checkbox/
  - https://design.11stcorp.com/components/chip/
  - https://design.11stcorp.com/components/dialog/
  - https://design.11stcorp.com/components/radio-button/
  - https://design.11stcorp.com/components/text-field/
  - https://design.11stcorp.com/components/navigation/
  - https://design.11stcorp.com/components/overflow-menu/
  - https://design.11stcorp.com/components/pagination/
  - https://design.11stcorp.com/components/stepper/
  - https://design.11stcorp.com/components/tab/
  - https://design.11stcorp.com/components/title/
  - https://design.11stcorp.com/components/toggle-switch/
  - https://design.11stcorp.com/components/tooltip/
related_services:
  - gmarket
lang: ko
logo: https://getdesign.kr/logos/11st.png
---

## Brand & Style

11번가(11STREET)는 SK Group 계열사가 운영하는 모바일 우선의 종합 이커머스 마켓플레이스이며, 디자인 시스템의 목적은 "고객에게 효율적인 커뮤니케이션과 일관되고 통일된 디자인으로 서비스 경험을 제공"하는 데 있다 [src:1][src:9]. 브랜드 가치는 Technology, Trust, Hope 세 단어로 정의되며, Street Sign(이정표)을 형상화한 로고는 다양한 상품과 차별적인 서비스로 새로운 라이프스타일을 안내한다는 메시지를 미니멀하게 표현한다 [src:2].

다섯 가지 디자인 원칙 — Universal, Intuitive, Customer, Data, Interaction — 이 시스템 전체를 관통하며, 트렌드가 아닌 사용자 패턴의 정량적 분석을 토대로 결정을 내린다 [src:1]. 시각적 시그니처는 오렌지에서 레드, 마젠타로 이어지는 3-stop 대각 그라디언트이며, 강렬한 적색이 브랜드 모먼트를 지배한다 [src:3]. 카드는 그림자나 큰 라운드 대신 1px divider로 구분되고, 위계는 깊이가 아니라 간격과 타입 굵기로 표현된다.

브랜드 만트라는 **"더 11번가답게"** 이다 — "쇼핑의 즐거움을 생동감 있게 더 11번가답게 기본과 원칙의 개념을 제공하고 기준을 제시합니다" 라는 가치 선언이 디자인 시스템 전 섹션에 반복되는 북극성 문구로 자리한다 [src:1]. 콘텐츠 톤 레지스터는 정중한 격식체(-습니다)와 부드러운 격식체(-요)로 양분되며, 반말은 절대 사용하지 않는다.

워드마크는 국문에서 **11번가**(11과 번가 사이 띄어쓰기 없음, 숫자만 사용), 영문에서 **11STREET**(한 단어, 전체 대문자)로 표기하며, 본문에서 11ST 또는 11st 같은 약어로 줄여 쓰지 않는다 [src:2].

## Colors

11번가의 색 체계는 브랜드 그라디언트(시그니처), Primary(인터랙티브 워크호스), 14단계 Grayscale, Secondary(정보 유형 강조), Service Color(서브 서비스 식별)의 다섯 묶음으로 구성된다 [src:3]. 토큰 값은 Claude Design 합성의 `colors_and_type.css`를 정답으로 삼아 OKLCH로 표기한다.

**Brand gradient (시그니처)** — 메인 서비스 플랫폼, 모바일 앱 아이콘, 광고에 사용 [src:3].

```yaml
brand-gradient-orange:  oklch(0.66 0.21 32)    # #FF5A2E
brand-gradient-red:     oklch(0.60 0.26 18)    # #FF0038
brand-gradient-magenta: oklch(0.65 0.36 332)   # #FF00EF
brand-gradient:         "linear-gradient(135deg, oklch(0.66 0.21 32) 0%, oklch(0.60 0.26 18) 50%, oklch(0.65 0.36 332) 100%)"
```

**Primary (11STREET_Red)** — 주요 버튼, 라디오/체크박스 선택 상태, 탭 인디케이터, 뱃지 fill, 에러 텍스트, 로딩 스피너 [src:3].

```yaml
primary:         oklch(0.60 0.26 18)    # #FF0038 11STREET_Red
primary-pressed: oklch(0.49 0.22 19)    # #CC002D — primary를 어둡게
primary-soft:    oklch(0.95 0.02 18)    # #FFEBEF — selected chip fill / hover tint
```

**Grayscale (14단계)** — 정확히 14단계로 정의된다 [src:3].

```yaml
gray-01: oklch(0 0 0)        # #000000
gray-02: oklch(0.16 0 0)     # #111111
gray-03: oklch(0.30 0 0)     # #333333 — fg-primary (기본 본문)
gray-04: oklch(0.49 0 0)     # #666666 — fg-secondary
gray-05: oklch(0.55 0 0)     # #777777 — fg-tertiary (힌트/비활성)
gray-06: oklch(0.65 0 0)     # #949494
gray-07: oklch(0.67 0 0)     # #999999 — fg-disabled
gray-08: oklch(0.79 0 0)     # #BBBBBB
gray-09: oklch(0.84 0 0)     # #CCCCCC — strong border / disabled bg
gray-10: oklch(0.88 0 0)     # #DDDDDD
gray-11: oklch(0.93 0 0)     # #EEEEEE — divider/border (기본)
gray-12: oklch(0.96 0 0)     # #F4F4F4 — bg-surface
gray-13: oklch(0.98 0 0)     # #FAFAFA — subtle bg
gray-14: oklch(1 0 0)        # #FFFFFF — page/elevated bg
```

**Secondary palette** — 정보 유형 강조용 [src:3].

```yaml
secondary-blue:     oklch(0.61 0.18 245)  # #0B83E6 — 배송예정일/배송정보
secondary-yellow:   oklch(0.79 0.16 70)   # #FFA700 — Review 별점
secondary-green:    oklch(0.56 0.14 150)  # #249356 — 성공/신선
secondary-bluegray: oklch(0.64 0.07 246)  # #6D96C0
secondary-brown:    oklch(0.56 0.04 25)   # #937676
```

**Service colors** — 서브 서비스 식별용 [src:3].

```yaml
service-amazon:     oklch(0.66 0.10 224)  # #49A3C7 Amazon_Bluegreen
service-tuniverse:  oklch(0.36 0.27 276)  # #3617CE T_Blue
service-ooah:       oklch(0.38 0.30 269)  # #0F0FD9 OOAH_Blue
service-freshtable: oklch(0.67 0.13 187)  # #00B4A5 Freshtable_mint
service-money:      oklch(0.51 0.28 282)  # #5C38F5 Money_purple
service-seller:     oklch(0.62 0.20 264)  # #5483FD Seller_blue
```

**Semantic overlay** — Claude Design 합성에서 명시 [src:8].

```yaml
bg-overlay: oklch(0 0 0 / 0.5)   # rgba(0,0,0,.5) — dialog scrim
bg-toast:   oklch(0 0 0 / 0.8)   # rgba(0,0,0,.8) — toast 배경
```

## Typography

**Families** — OS별로 폰트가 분기된다 [src:7].

- Android: 국문 `Noto Sans CJK KR`, 영문/숫자 `Roboto` [src:7]
- iOS: 국문 `Apple SD Gothic Neo`, 영문/숫자 `SF Pro Text` [src:7]
- 브랜드 전용 웹폰트: **11STREET Gothic** — 이정표 로고를 글자 형태에 반영한 자체 서체. Light/Regular/Bold 3종, 이탤릭 없음 [src:4][src:7]. 사용 범위는 OS 공통으로 **'가격' 및 일부 컴포넌트(Home tab menu, Button, Caption Carrier, Promotion Banner 등)에 한정**해 적용된다 [src:7].

Claude Design 합성에서는 11STREET Gothic 라이선스 파일 부재로 **국문은 Pretendard, Latin은 Inter**가 폴백으로 적용되며, 실제 woff2 파일이 제공되면 `--font-brand`가 우선 적용된다.

**Type Scale (Android baseline; iOS는 모든 단계에 +1pt)** [src:7]

```yaml
headline-0: { weight: Regular, android: 28, ios: 29 }
headline-1: { weight: Bold,    android: 24, ios: 25 }
headline-2: { weight: Bold,    android: 22, ios: 23 }
headline-3: { weight: Bold,    android: 20, ios: 21 }
title-bold:    { weight: Bold,    android: 18, ios: 19 }
title-regular: { weight: Regular, android: 18, ios: 19 }
subtitle-1: { weight: Regular, android: 16, ios: 17 }
subtitle-2: { weight: Regular, android: 15, ios: 16 }
body-1:     { weight: Regular, android: 14, ios: 15 }
body-2:     { weight: Regular, android: 13, ios: 14 }
caption-1:  { weight: Regular, android: 12, ios: 13 }
caption-2:  { weight: Regular, android: 11, ios: 12 }
```

- Line-height: 모든 단계 "Auto"(플랫폼 기본). Claude Design 합성은 한국어 가독성을 고려해 **1.4**를 사용한다 [src:7].
- letter-spacing: Headline 계열에 `-0.01em` 적용.
- 권장 범위: 본문 14, 최대 28, 최소 11(11pt는 한정적으로만 사용) [src:7][src:12].

가격, 할인율, 카운트다운, 랭킹 뱃지(`1위`, `베스트`)가 시스템에서 가장 표현력 있는 타입이며, **11STREET Gothic이 존재하는 이유는 이 숫자들을 브랜드처럼 보이게 하기 위함**이다.

## Spacing

**8-Point Grid** — 8로 나누어떨어지는 주요 디바이스 스크린에서 1.5배수 시 렌더링 이슈가 최소화된다는 이유로 채택되었다 [src:5]. Guideline은 8/10dp grid, 컴포넌트 내부는 4dp grid를 따른다 [src:5].

```yaml
spacing-scale: [2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 72]
spacing-base: 8
```

**Grid (좌우 마진)** — 화면 컨텍스트에 따라 두 모드를 운영한다 [src:11].

```yaml
grid-standard: { margin: 16, columns: 4, gutters: 12 }   # 일반 화면
grid-narrow:   { margin: 10, columns: 4, gutters: 12 }   # SRP, Cart, Order, MY
```

표준 화면은 `16pt` 마진을 적용하지만, 정보 밀도가 높은 SRP(검색 결과), 장바구니, 주문서, 나의11번가는 마진을 `10pt`로 좁혀 더 많은 상품/리스트를 한 화면에 노출한다 [src:11].

**Component-specific spacing** — 자주 인용되는 고정 값들 [src:13][src:14][src:15][src:16][src:17][src:22][src:27].

- 좌측 마진 `16` 고정(Accordion, Checkbox, Radio, Badge, Title, Chip 공통) [src:13][src:14][src:15][src:16]
- 컨트롤 아이콘과 레이블 사이 패딩 `8` [src:13][src:15]
- Chip 간 간격 `6` [src:16]
- Dialog Contents 상하 `24`, Title-Body `16`, 버튼 높이 `48` 고정 [src:17]
- Tooltip 좌우 `12`, 상하 `7` [src:27]
- Pagination Dot 사이즈 `16`, 간격 `12` [src:22]

**Touch target** — 아이콘이 24×24로 표기될 때 패딩을 포함한 터치 영역은 **최소 48×48dp**(약 9mm)이며, 한국 사용자의 노안/저시력을 명시적으로 고려한 정량 가이드다 [src:10].

## Rounded

라운드는 강하지 않다. 카드와 디바이더 중심의 무드 위에서 버튼과 뱃지는 4px, 시트와 다이얼로그는 8~16px 범위에 머무른다. 값은 Claude Design 합성을 정답으로 삼는다.

```yaml
radius-none:      0
radius-xs:        2px
radius-sm:        4px      # buttons, badges
radius-md:        8px      # dialogs, cards
radius-lg:        12px
radius-sheet-top: 16px     # bottom-sheet 상단 코너
radius-pill:      9999px   # chips
radius-full:      50%      # avatar
```

Chip은 항상 `{rounded.pill}`을 사용하고, Button과 Badge는 `{rounded.sm}` 또는 `{rounded.md}` 범위에 둔다. Bottom Sheet의 상단 모서리만 `{rounded.sheet-top}`(16px)을 적용해 시트가 화면에서 떠오르는 감각을 만든다.

## Elevation & Depth

전체적으로 그림자는 거의 사용되지 않는다. 카드는 그림자 대신 1px Gray_11 divider로 구분되며, 위계는 깊이가 아니라 간격과 타입 굵기로 표현된다. 그림자는 사실상 **하단 Tabbar**(상단 엣지가 살짝 떠 보이도록), **Dropdown 레이어**, **Toast** 세 곳에만 한정해 사용한다 [src:20].

```yaml
shadow-tabbar:   "0 -1px 4px oklch(0 0 0 / 0.06)"
shadow-dropdown: "0 4px 12px oklch(0 0 0 / 0.08)"
shadow-toast:    "0 4px 16px oklch(0 0 0 / 0.16)"
```

**Motion**

```yaml
ease-standard:    cubic-bezier(.2, .0, .2, 1)
ease-emphasized:  cubic-bezier(.2, .0, 0, 1)
duration-fast:    120ms
duration-base:    200ms
duration-slow:    320ms
```

## Shapes

11번가의 셰이프 언어는 **명료한 직사각형 + 작은 라운드**가 기본이다. 이정표(Street Sign)를 형상화한 로고가 시각 정체성의 출발점이며, 아이콘은 24×24 그리드 위에서 1.5pt 스트로크, 모서리 라운드를 가진 outline 스타일로 통일된다 [src:6]. 키라인 셰이프는 Circle, Square, Horizontal Rectangle, Vertical Rectangle 네 종류이며, 모든 아이콘이 이 키라인 안에서 그려진다 [src:6].

Filled variant는 **active 탭과 홈 탭의 home 아이콘**에만 한정 적용되며, 브랜드 그라디언트로 렌더된다 [src:6]. 사내 outline 폰트가 없는 외부 구현에서는 **Lucide 아이콘**으로 대체하는 것이 Claude Design 합성의 권고다.

전체 셰이프 무드는 "쇼핑이 빽빽한 화면"과 "정돈된 화면"의 두 모드를 컨텍스트별로 전환하는 방식이다 — 검색 결과/장바구니/주문서는 마진과 라운드를 줄여 정보를 밀도 있게, 홈/마이는 마진과 여백을 확보해 정돈된 감각을 만든다 [src:11].

## Components

### button-speciality

가장 강한 강조의 버튼이며, **브랜드 그라디언트를 fill로 받는 단 하나의 컴포넌트**다 [src:13]. UI 최하단에 고정되고 full-width 배치가 기본이다. 결제, 구매 확정처럼 화면에서 가장 무거운 단일 액션에만 사용한다.

```tsx
<SpecialityButton fullWidth>
  구매하기
</SpecialityButton>
// background: {colors.brand-gradient}
// border-radius: {rounded.sm}
// padding: {spacing.16}
// typography: {typography.title-bold}
// position: fixed bottom (UI 최하단)
```

### button-primary

`{colors.primary}`(11STREET_Red) 솔리드 fill. 화면의 주요 클릭 유도(장바구니 담기, 다음 단계 진행 등)에 사용한다 [src:13]. 패딩 `{spacing.16}` 고정, States는 Normal/Pressed/Disabled [src:13].

```tsx
<PrimaryButton onClick={handleAddToCart}>
  장바구니
</PrimaryButton>
// background: {colors.primary}
// color: {colors.gray-14}
// border-radius: {rounded.sm}
// padding-x: {spacing.16}
```

### button-primary-pressed

Pressed 상태는 fill을 `{colors.primary-pressed}`로 어둡게 처리한다. 트랜지션은 `{motion.duration-fast}` + `{motion.ease-standard}`.

### button-primary-disabled

Disabled 상태는 fill을 `{colors.gray-09}`, 텍스트를 `{colors.gray-07}`로 처리한다. 클릭 인터랙션은 차단되며 cursor는 not-allowed.

### button-secondary

텍스트 버튼보다 강조가 필요할 때 사용한다 [src:13]. Secondary는 outline + 텍스트 컬러 `{colors.primary}` 조합으로 운영되며, 패딩 `{spacing.16}` 고정이다.

### button-tertiary

화면 하위 작업이나 덜 눈에 띄는 액션에 사용한다 [src:13]. Normal–X-small 단계까지는 패딩을 `{spacing.8}`로 줄여 인라인 텍스트 액션처럼 보이게 한다. 긍정 행동은 오른쪽, 부정 행동은 왼쪽 정렬을 따른다 [src:13].

### badge-basic

할인이나 혜택을 표시하는 기본 뱃지다 [src:12]. 높이 `18` 고정, 컨테이너-레이블 패딩 `8`, 1개 이상 배치 시 가로/세로 패딩 `4` [src:12]. Color spec는 Text 100%, Fill 4%, Border 40%, Background `{colors.gray-14}` 100% [src:12].

```tsx
<Badge type="basic">10% 할인</Badge>
// height: 18
// padding-x: {spacing.8}
// border-radius: {rounded.sm}
// typography: {typography.caption-1}
```

### badge-special

상품의 속성(예: 무료배송, 신선식품)을 강조하는 뱃지로, Basic과 동일한 18 높이 규칙을 따른다 [src:12].

### badge-ranking

순위 노출용 뱃지다. `1위`, `베스트` 같은 숫자/단어가 가장 표현력 있는 타입이라 **11STREET Gothic**으로 렌더링되는 대표 위치다 [src:12].

### chip-choice

다중 선택 가능한 기본 칩이다 [src:16]. 최대 글자 수 `10자(22byte, 공백 포함)`이며 초과 시 자른다. 칩 간 간격은 `{spacing.6}` [src:16]. Selected 상태는 핑크 fill(`{colors.primary-soft}`) + 레드 border(`{colors.primary}`) 조합으로 소프트하게 표현된다.

```tsx
<Chip type="choice" selected>여성</Chip>
// border-radius: {rounded.pill}
// gap-between: {spacing.6}
// selected: background {colors.primary-soft}, border {colors.primary}
```

### chip-input

사용자가 입력해 만들고 `×` 버튼으로 삭제 가능한 칩 [src:16].

### chip-filter

검색 결과 필터로 사용되는 칩으로, 활성/비활성 두 상태를 가진다 [src:16].

### tabbar

화면 하단 3~5개 아이콘 메뉴 [src:20]. 컨테이너 높이 `64`(그림자 포함), 아이콘 사이즈 `36` 고정. `{shadow.shadow-tabbar}`가 적용되어 상단 엣지가 살짝 떠 보인다 [src:20]. Selected 탭은 아이콘에 브랜드 그라디언트가 들어간 Filled 아이콘으로 전환된다 [src:6].

### tabbar-home-icon

Lottie 링크로 제공되는 시스템 유일의 히어로 인터랙션이며, 터치 영역은 `72×72` [src:20]. 11번가 로고가 집(home) 모양으로 모핑되는 시그니처 모션을 가진다 [src:20].

### gnb

앱 상단 고정 영역으로, Previous / Home / Search / Cart 아이콘 + Divider line + Badge area로 구성된다 [src:20]. 스크롤 시 유지되거나 압축된다 [src:20].

### title-cap-box

홈 전용 타이틀로 높이 `60` 고정 [src:25]. 4 variants(기본 / 서브타이틀 / 버튼 / 타임)를 가진다 [src:25].

### title-sub

좌측 또는 중앙 정렬의 일반 섹션 타이틀, 높이 `56` 고정 [src:25].

### dialog

Alert / Simple / Confirmation 3종 [src:17]. 중앙 정렬, 좌우 마진 `16`, Contents 상하 `24`, Title–Body 마진 `16`, 버튼 높이 `48` 고정 [src:17]. 버튼은 최대 2개이며, 우선순위가 높은 버튼의 텍스트 컬러는 `{colors.primary}`로 처리한다 [src:17].

```tsx
<Dialog type="confirmation">
  <DialogTitle>주문을 취소하시겠어요?</DialogTitle>
  <DialogBody>취소된 주문은 복구할 수 없어요.</DialogBody>
  <DialogActions>
    <Button variant="text">닫기</Button>
    <Button variant="text" color="primary">취소하기</Button>
  </DialogActions>
</Dialog>
// border-radius: {rounded.md}
// padding-y: {spacing.24}
// title-body-gap: {spacing.16}
// action-height: {spacing.48}
```

### bottom-sheet-modal

Overflow Menu의 Modal 타입으로, scrim(`{colors.bg-overlay}`)이 뒤 콘텐츠를 비활성화한다 [src:21]. 좌우 상단 패딩 `16`, 상단 코너 `{rounded.sheet-top}` [src:21].

### bottom-sheet-drag

Handlebar로 시트 영역을 확장/축소할 수 있다. Full 높이일 때 최소 높이 `40`을 유지해 사용자가 시트를 닫을 수 있는 영역을 남긴다 [src:21].

### toast-info

텍스트만 노출하는 기본 토스트 [src:8]. 한 줄 높이 `48` 고정, 두 줄까지, 배경은 `{colors.bg-toast}`(검정 80% 반투명) [src:8]. CTA나 내비게이션 앞에 배치하지 않는다 [src:8].

```tsx
<Toast type="info">장바구니에 담겼습니다</Toast>
// height: 48
// background: {colors.bg-toast}
// box-shadow: {shadow.shadow-toast}
// border-radius: {rounded.md}
```

### toast-success

아이콘 + 텍스트 조합 [src:8].

### toast-error

닫기 버튼을 포함하며 사용자가 닫을 때까지 지속된다 [src:8].

### tooltip

Standard / Small 2종 [src:27]. Caret tip(▲)이 트리거 요소에 밀접 연결되며, 컨테이너 패딩은 좌우 `12`, 상하 `7` [src:27].

### loading

`{colors.primary}` 색상의 원형 인디케이터, `60×60` 중앙 정렬 [src:8]. 1초 이상(2~5초) 대기 시에만 노출하며, 첫 화면 로드/새로고침이 아닌 한 화면당 1개만 운영한다 [src:8].

### pagination-dot

Active = `{colors.gray-01}`, Inactive = `{colors.gray-01}` 30% opacity, Dot 사이즈 `16`, 간격 `12` [src:22].

### pagination-number

Active = `{colors.primary}`, Inactive = `{colors.gray-14}`. 컨테이너 높이 `44`, 숫자 너비 `40`, 이전/다음 버튼 너비 `60` [src:22].

### stepper

Plus Minus / Number Input 2종 [src:23]. 컨트롤 아이콘 `32` 고정, 숫자 입력 영역은 가변(센터 정렬). 기본값을 반드시 가진다(보통 1) [src:23].

### tab

Fixed(2~3 섹션) / Scrollable(홈처럼 섹션이 많을 때) 2종 [src:24]. Selected indicator와 Label은 `{colors.primary}`로 표시된다 [src:24].

### text-field

InActive / Active / Disabled / Focused / Error 5상태 [src:19]. Input area는 좌측 정렬, 좌측 패딩 `12`, 임의의 컬러 적용을 금지한다 [src:19].

### checkbox

Selected 상태에 `{colors.primary}`를 사용해 시각적 명확성을 확보한다 [src:15].

### radio-button

Selected 상태에 `{colors.primary}`를 사용한다 [src:18].

### toggle-switch

Android(MW 포함) / iOS 2종. 우측 정렬, 우측 패딩 `16` [src:26]. MW에서는 안드로이드 형태를 따른다(MW의 안드로이드 사용자 비중이 높다는 점이 명시적으로 반영됨) [src:26].

### accordion

Closed(기본) / Open 2상태. Chevron 아이콘은 시작 또는 끝에 일관 배치하며, 좌우 마진 `16`, 컨트롤–레이블 패딩 `8` [src:14].

## Do's and Don'ts

**Do**

- 브랜드 그라디언트(`{colors.brand-gradient}`)는 **Speciality Button과 active 탭/홈 아이콘 Filled variant**에만 한정해 사용한다 [src:13].
- 솔리드 적색이 필요한 모든 인터랙션은 `{colors.primary}`(11STREET_Red)를 일관되게 사용한다 — 주요 버튼, 라디오/체크박스 selected, 탭 인디케이터, 뱃지 fill, 에러 텍스트, 로딩 스피너 [src:3].
- 카드와 리스트의 경계는 **그림자가 아닌 1px `{colors.gray-11}` divider**로 표현한다.
- 가격, 할인율, 카운트다운, 랭킹 뱃지(`1위`, `베스트`)는 가능하면 11STREET Gothic(폴백: Pretendard)으로 렌더해 숫자를 브랜드처럼 보이게 한다.
- SRP, 장바구니, 주문서, 마이페이지는 좌우 마진을 `10pt`(narrow grid)로, 일반 화면은 `16pt`(standard grid)로 적용한다 [src:11].
- 모든 버튼 레이블은 **2~4 음절 액션 동사**로 작성한다(`구매하기`, `장바구니`, `확인`, `취소`).
- 모든 숫자는 아라비아 숫자로 표기한다(spell-out 금지).
- 톤은 가이드라인 문서에서 **-습니다**(정중한 격식체), 토스트/다이얼로그/상품 카피에서 **-요**(부드러운 격식체)로 운영한다.
- 브랜드 워드마크는 **국문 "11번가", 영문 "11STREET"** 로만 표기한다 [src:2].
- 터치 영역은 아이콘 크기와 무관하게 `48×48dp` 이상을 확보한다 [src:10].

**Don't**

- 본문 카피에 1인칭/2인칭 대명사를 쓰지 않는다(예: ✗ "Add it to your cart" / ✓ "Add to cart").
- 본문에서 워드마크를 `11ST`, `11st`로 약어화하지 않는다(slug `11st`는 URL/식별자에만 사용) [src:2].
- 반말(`해`, `했어`)이나 챗봇 톤(`~해보세요!`)을 사용하지 않는다.
- chrome(시스템 UI) 영역에 이모지, 유니코드 불릿, ASCII 아트를 넣지 않는다(셀러 머천다이징 배너만 예외).
- 브랜드 그라디언트를 본문 텍스트, 배경, 칩, 일반 버튼 fill로 확장하지 않는다 — 그라디언트는 시그니처 모먼트 전용이다 [src:13].
- 카드와 패널에 그림자를 추가하지 않는다 — 그림자는 Tabbar, Dropdown, Toast 세 곳에만 한정한다.
- `{colors.primary}` 외의 적색을 마음대로 추가하지 않는다(주황은 그라디언트 stop으로만 등장).
- 컴포넌트 컬러에 임의 컬러를 적용하지 않는다(특히 Text Field) [src:19].
- 11pt 미만 폰트 사이즈를 사용하지 않는다 [src:7][src:10].
- 화면당 로딩 인디케이터를 2개 이상 노출하지 않는다 [src:8].
- 11번가의 e커머스 도메인(쇼핑·구매/결제 전환 흐름, SRP·장바구니·주문 같은 거래 화면 패턴)과 브랜드 고유 자산(가격·랭킹 전용 11STREET Gothic, "더 11번가답게" 카피 정체성)을 성격이 다른 제품에 그대로 이식하지 않는다 — 차용할 것은 시각 언어(3-스톱 브랜드 그라디언트를 Speciality 버튼·active 탭에만 한정·gray-11 1px 디바이더 위주의 그림자 회피·48×48dp 터치 타깃·정보 밀도용 듀얼 그리드 마진)이지 11번가의 커머스 도메인이 아니다 [src:1].
- 디자인시스템 이름 자체(`11STREET Design System` 워드마크·약어)를 생성하는 제품 UI의 헤더·타이틀·버튼·라벨에 넣지 않는다 — 차용할 것은 시각 언어이지 시스템 이름이 아니다. UI 텍스트·네이밍은 자기 제품 브랜드로 재정의하고, 출처 표기가 필요하면 footer attribution에만 둔다.

## Responsive Behavior

11번가는 **모바일 우선(iOS/Android 네이티브 앱)** 설계가 기본이며, MW(모바일웹)는 안드로이드 사용자 비중이 높다는 전제로 운영된다 [src:7][src:26]. 데스크탑 웹의 명시적 브레이크포인트는 공개된 디자인 시스템에서 surfacing되지 않았다 — 아래 표는 디자인 시스템이 명시한 컨텍스트별 마진 전환에 한정한다.

| 컨텍스트 | 좌우 마진 | Key Changes | 출처 |
|---|---|---|---|
| 일반 화면(홈, 카테고리, 상품 상세) | 16pt | 표준 grid(`{spacing.16}`), 4 columns / 12 gutters | [src:11] |
| 트랜잭션·탐색 밀도 화면(SRP, Cart, Order, MY) | 10pt | narrow grid(`{spacing.10}`), 정보 밀도 우선, 4 columns / 12 gutters | [src:11] |
| MW 토글 스위치 | — | Android 형태 채택 | [src:26] |
| iOS 타입 스케일 | — | Android 대비 +1pt 모든 단계 | [src:7] |

**Touch target rule**: 아이콘이 24×24로 표기되더라도 패딩 포함 터치 영역은 **최소 48×48dp**(약 9mm)를 확보한다 [src:10]. Tabbar의 home 아이콘은 `72×72`로 가장 넓은 터치 영역을 갖는다 [src:20].

**Per-component collapsing**:

- Tabbar: 화면 하단 고정, 스크롤 시 유지. 컨테이너 높이 `64`(그림자 포함) [src:20].
- GNB: 스크롤 시 유지 또는 압축 [src:20].
- Tab: 섹션 수가 많으면 Fixed → Scrollable 전환 [src:24].
- Dialog: 화면 폭과 무관하게 좌우 마진 `16` 고정, 가운데 정렬 [src:17].
- Bottom Sheet: Drag 타입은 Handlebar로 사용자 의도에 따라 높이 가변 [src:21].

데스크탑 웹 브레이크포인트 시스템은 공개되지 않아 (no published desktop breakpoint system surfaced) 표시한다.

## Known Gaps

- **데스크탑 웹 브레이크포인트와 그리드**: 디자인 시스템 문서가 모바일 앱(iOS/Android)과 MW 중심으로 작성되어 있어 데스크탑 웹의 명시적 브레이크포인트(예: 768/1024/1280px), 컬럼 수, 사이드 네비 패턴은 공개되지 않았다.
- **Dark mode**: 14단계 grayscale은 단일 라이트 팔레트로만 정의되어 있으며, 다크 모드의 시맨틱 매핑(특히 fg/bg/surface 토큰)이 공개 자료에 없다.
- **Form validation states**: Text Field는 InActive/Active/Disabled/Focused/Error 5상태가 정의되어 있으나 [src:19], Error 메시지의 정확한 노출 패턴(인라인 vs 하단, 아이콘 동반 여부, 다중 필드 에러 처리)은 surfacing되지 않았다.
- **Lottie home icon 모션 곡선**: 11번가 로고가 집 모양으로 모핑되는 시그니처 인터랙션 [src:20]의 정확한 keyframe/easing 정의는 Lottie 링크 외부로는 공개되지 않았다.
- **11STREET Gothic의 외부 사용**: 라이선스 파일이 비공개이므로 외부 구현은 Pretendard로 폴백하지만, 가격 숫자의 글리프 특성(예: 균등 폭, 0의 사선 슬래시 유무)이 Pretendard로는 완전히 재현되지 않을 수 있다.

## References

1. https://design.11stcorp.com/brand/principle/
2. https://design.11stcorp.com/brand/logos/
3. https://design.11stcorp.com/foundation/color/
4. https://design.11stcorp.com/brand/font/
5. https://design.11stcorp.com/foundation/spacing/
6. https://design.11stcorp.com/foundation/iconography/
7. https://design.11stcorp.com/foundation/typography/
8. https://design.11stcorp.com/components/toast-notification/
9. https://designcompass.org/en/2024/05/21/11st-design-system/
10. https://design.11stcorp.com/foundation/accessibility/
11. https://design.11stcorp.com/foundation/grid/
12. https://design.11stcorp.com/components/badge/
13. https://design.11stcorp.com/components/buttons/
14. https://design.11stcorp.com/components/accordion/
15. https://design.11stcorp.com/components/checkbox/
16. https://design.11stcorp.com/components/chip/
17. https://design.11stcorp.com/components/dialog/
18. https://design.11stcorp.com/components/radio-button/
19. https://design.11stcorp.com/components/text-field/
20. https://design.11stcorp.com/components/navigation/
21. https://design.11stcorp.com/components/overflow-menu/
22. https://design.11stcorp.com/components/pagination/
23. https://design.11stcorp.com/components/stepper/
24. https://design.11stcorp.com/components/tab/
25. https://design.11stcorp.com/components/title/
26. https://design.11stcorp.com/components/toggle-switch/
27. https://design.11stcorp.com/components/tooltip/
