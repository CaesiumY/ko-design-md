---
name: 토스
slug: toss
category: finance
last_updated: "2026-05-29"
created_at: "2026-05-11"
sources:
  - https://toss.tech
  - https://toss.tech/article/toss-design-system
  - https://toss.tech/article/tds-color-system-update
  - https://toss.tech/article/tds-component-making
  - https://tossmini-docs.toss.im/tds-mobile/
  - https://developers-apps-in-toss.toss.im/design/miniapp-branding-guide.html
  - https://github.com/toss/tossface
  - https://toss.im/tossfeed/article/beginning-of-tps
  - https://developers-apps-in-toss.toss.im/design/components.html
  - https://toss.tech/article/introducing-toss-error-message-system
  - https://toss.im
related_services: []
lang: ko
logo: https://getdesign.kr/logos/toss.png
---

# 토스 (Toss) — design.md

> 비바리퍼블리카가 운영하는 한국 최대 핀테크 슈퍼앱. 송금·결제·은행·증권·보험·세금·부동산·자동차 관리 등 금융 전반을 단일 모바일 셸로 묶고, "Apps in Toss" 미니앱 플랫폼까지 같은 디자인 시스템 위에 얹는다 [src:2]. 본 문서는 Toss Design System 핸드오프 번들(`TDS_Mobile_for_Apps_in_Toss_(2602-3-2).fig` export → `toss-design-system/{README, chats/chat1, project/{README, SKILL, colors_and_type.css, preview/ 41 cards, ui_kits/mobile/{Components.jsx, Screens.jsx, Send-Money Flow.html, ios-frame.jsx}, assets/toss-logo.png}}`)을 1차 출처로 합성한 결과이며, 공개된 toss.tech 보고서와 toss.im 미니앱 가이드, TDS Mobile docs를 보조 출처로 사용했다.

## Brand & Style

토스는 자신을 **"은행에 다니는 유능한 친구"** 로 포지셔닝한다 — 조용히 일을 처리하고, 사용자의 시간을 낭비시키지 않는다는 어조다. 슬로건과 카피 곳곳에 "투자, 모두가 할 수 있도록", "수수료 걱정 없이"와 같이 진입 장벽을 제거하는 메시지가 반복되며, "토스가 알아서"라는 위임형 표현이 사용자 부담을 줄이는 톤으로 일관된다 [src:11]. 이는 단순한 마케팅 카피가 아니라 인터페이스 전반의 의사결정 기준이다 — 정보 밀도보다 가독성과 행동 유도를 우선하고, "한번에 볼 수 있어요" 같은 통합 뷰 패턴이 반복되는 이유다 [src:11].

대상 사용자는 일반 소비자 전 연령대이지만, 디자인 시스템(TDS) 자체는 약 **2,000명 규모의 메이커**가 단일 시스템 위에서 일한다는 전제로 설계되었다 [src:2]. 일관성과 확장성은 디자인 가이드라인 차원이 아니라 인프라 차원에서 다뤄지며, 컴포넌트는 "**레고 블록**"으로 비유된다 [src:2]. 새 컴포넌트 결정은 디자이너 직관이 아니라 A/B 테스트 결과로 검증된다 — 예를 들어 Menu 컴포넌트는 10일간의 A/B 테스트에서 Android item-click rate가 10% 더 높게 나온 뒤에야 정식 채택되었다 [src:4]. Apps-in-Toss 미니앱 플랫폼은 제3자가 TDS를 따르도록 강제해 "네이티브처럼 보이게" 하지만, 동시에 토스 자체의 하단 네비게이션을 복제하는 것은 금지한다 — "사용자가 당신의 브랜드를 토스와 혼동해서는 안 된다" [src:6].

전체 무드는 **차갑고 절제된, 거의 무채색에 가까운 화이트 캔버스 + 선명한 토스 블루 단일 강조색**으로 요약된다. 깊은 한기 어린 cool-blue 중성색(`grey-900`부터 `grey-100`까지)이 표면 전체를 차지하고, 채도가 높은 브랜드 블루(`blue-500`)는 화면당 하나의 가장 중요한 액션에만 예약된다. 모서리는 **공격적으로 둥글지만 결코 귀엽지 않다** — 버튼·카드·hero 블록에 16~32px 라운드, chips·primary CTA에 999px full pill을 쓰며, iOS류 squircle/blob 라운드는 `Templates/Squircle` 전용 페이지를 제외하면 명시적으로 회피된다. 배경은 평면이 기본이며, 그라디언트는 (1) bottom CTA 위쪽 `white → transparent` 보호 그라디언트, (2) 로딩 버튼 내부의 미세한 pressed-blue radial glow, (3) yellow→orange 일러스트 그라디언트 — 세 가지 문서화된 예외만 허용된다. 텍스처·노이즈·전면 사진은 chrome에 사용되지 않는다.

Voice는 **해요체(대화형 존댓말) + 위임형 + 일상어**로 요약된다 [src:10]. 종결어미 `-요`로 통일되며 격식체(~니다/~합니다)도, 방송 헤드라인의 단정형 `-다`도 사용하지 않는다 — 한 문장은 목적을 말하고, 다음 한 문장은 *언제 쓰는지*를 말하는 패턴이 표준이다. 토스가 잘못해 발생한 에러 화면에서조차 격식체가 아닌 해요체를 유지하며, 반복되는 시스템 상황은 Figma preset과 개발자 에러 메시지 라이브러리로 템플릿화되어 좋은 카피가 기본 선택지가 되도록 운영된다 [src:10]. 본 카탈로그 메타 문서는 토스 자체 카피와 달리 `~다` 평서체로 기술하며, 토스의 해요체 정책은 product surface 카피에 한해 적용되는 규칙임을 분리해 둔다.

## Colors

TDS 컬러 시스템은 **4계층 구조**로 운영된다 [src:3]:

1. **Target** — 토큰이 칠해지는 표면. `fill`, `text`, `border`.
2. **Role** — 의미 역할. `brand`, `neutral`, `primary`, `secondary`, `weak`, `alt`.
3. **Variant** — 강도 변형. `weak`, `alt`.
4. **Level** — 토큰의 추상화 단계. `base`(원시 팔레트) → `semantic`(역할 alias) → `component`(컴포넌트 전용 alias).

토스는 2025년 production 토큰을 HSL에서 OKLCH로 마이그레이션한다고 공식 발표했으며, 같은 numeric scale(50, 100, …, 900)이 모든 hue에서 동등한 perceived brightness를 갖도록 OKLCH 균질화를 도입한다 [src:3]. 핸드오프 번들 자체는 light 모드 카노니컬 hex 값으로 ship되며, 원본 hex는 `colors_and_type.css`에 정의되어 있다 — 본 문서는 catalog 규약에 따라 OKLCH로 변환해 표기한다.

### Brand

원본 hex는 `colors_and_type.css`에 정의되어 있으며, 본 문서는 OKLCH로 변환해 표기한다. 카노니컬 앵커 `oklch(0.624 0.176 254)`는 미니앱 브랜딩 가이드 `brand.primaryColor` 예시(공식 hex로 노출되는 값)와 일치한다 [src:6].

```yaml
blue-500: oklch(0.624 0.176 254)   # 카노니컬 Toss Blue, 화면당 하나의 primary CTA
blue-600: oklch(0.522 0.176 257)   # pressed-blue 단계
blue-700: oklch(0.476 0.174 259)   # pressed gradient stop
blue-50:  oklch(0.965 0.020 250)   # brand-weak background
```

### Greyscale (cool-blue tinted neutrals)

원본 hex는 `colors_and_type.css`에 정의되어 있으며, 본 문서는 OKLCH로 변환해 표기한다. `grey-900`은 순수 검정이 아니라 미세하게 차가운 navy 톤이며, `grey-100`은 거의 인지되지 않는 cool 그레이로 화면 보조 표면으로 사용된다.

```yaml
grey-900: oklch(0.234 0.030 254)   # primary text, never pure black
grey-800: oklch(0.342 0.030 253)
grey-700: oklch(0.452 0.028 253)   # secondary text
grey-600: oklch(0.555 0.022 253)
grey-500: oklch(0.652 0.020 252)
grey-400: oklch(0.752 0.016 251)   # disabled text, strong line
grey-300: oklch(0.840 0.012 248)
grey-200: oklch(0.913 0.008 247)   # default divider/border
grey-150: oklch(0.918 0.007 247)
grey-100: oklch(0.957 0.005 247)   # secondary surface
grey-50:  oklch(0.978 0.003 247)
white:    oklch(1.000 0.000 0)
```

### Toss yellow & orange (illustration warms)

원본 hex는 `colors_and_type.css`에 정의되어 있으며, 본 문서는 OKLCH로 변환해 표기한다. Toss yellow는 표면 색이 아니라 일러스트/이모지 자산의 face 색이며, orange는 시맨틱 warning에 한정된다.

```yaml
yellow-500: oklch(0.853 0.156 86)   # illustration / emoji body
yellow-400: oklch(0.893 0.123 85)
yellow-300: oklch(0.901 0.124 84)
yellow-600: oklch(0.840 0.171 87)
yellow-700: oklch(0.872 0.169 87)
orange-500: oklch(0.748 0.183 56)   # semantic warning
orange-400: oklch(0.828 0.108 52)
orange-300: oklch(0.870 0.078 51)
```

### Semantic palette

원본 hex는 `colors_and_type.css`에 정의되어 있으며, 본 문서는 OKLCH로 변환해 표기한다.

```yaml
red-500:   oklch(0.628 0.218 22)   # error / danger
red-600:   oklch(0.626 0.216 22)
green-500: oklch(0.493 0.143 154)  # success
navy-900:  oklch(0.155 0.060 261)  # text-shadow base, source of overlay rgba
```

### Illustration warms (brown facial features)

원본 hex는 `colors_and_type.css`에 정의되어 있으며, 본 문서는 OKLCH로 변환해 표기한다. brown 패밀리는 yellow-faced 일러스트 자산의 facial feature 색이며 UI 표면에는 사용되지 않는다.

```yaml
brown-900: oklch(0.359 0.083 39)
brown-700: oklch(0.444 0.062 30)
brown-500: oklch(0.535 0.073 39)
brown-400: oklch(0.659 0.097 41)
```

### Semantic alpha tokens

원본 정의는 `colors_and_type.css`의 RGBA 토큰이며, 본 문서는 OKLCH alpha 표기로 변환한다. navy-900을 베이스로 한 투명도 계열은 본문 보조 텍스트·헤어라인·스크림에 사용된다.

```yaml
fg-tertiary:        oklch(0.155 0.060 261 / 0.58)   # 흐린 본문 텍스트
fg-quaternary:      oklch(0.155 0.060 261 / 0.28)   # placeholder
line-subtle:        oklch(0.000 0.000 0   / 0.08)   # 그레이 배경 위 카드 보더
bg-overlay:         oklch(0.000 0.000 0   / 0.56)   # bottom-sheet scrim
press-overlay:      oklch(0.000 0.000 0   / 0.26)   # 보편 pressed-state tint
disabled-opacity:   0.30                            # 컴포넌트 전체 노드에 적용
```

### Semantic alias

product-facing 색은 시맨틱·컴포넌트 토큰으로 호출하고 base 팔레트는 새 role을 만들 때만 직접 참조한다 [src:3].

```yaml
# Fill (배경·표면)
fill-brand:        blue-500
fill-primary:      grey-900
fill-secondary:    grey-100
fill-weak:         grey-50
fill-danger:       red-500
fill-success:      green-500
fill-warning:      orange-500

# Text
text-primary:      grey-900
text-secondary:    grey-700
text-tertiary:     fg-tertiary
text-placeholder:  fg-quaternary
text-alt:          white
text-brand:        blue-500
text-danger:       red-500

# Border
border-primary:    blue-500           # focused input
border-secondary:  grey-200           # default divider
border-strong:     grey-400
border-subtle:     line-subtle

# Overlay & state
overlay-scrim:     bg-overlay
overlay-press:     press-overlay
```

새 번들(`HI3LORQulbJJqdr-BrZGMQ`)의 `colors_and_type.css`는 같은 카노니컬 값에 매핑되는 **4-카테고리 정식 변수명**(`--tds-fg-*` / `--tds-bg-*` / `--tds-line-*` / `--tds-press-overlay` / `--tds-disabled-opacity`)을 함께 export한다 — 위 단축 alias가 catalog 문서 관행이라면, 아래 매핑은 prototype에 그대로 inline할 수 있는 CSS custom property 이름이다.

```yaml
# Foreground (text · icon)
tds-fg-primary:    text-primary       # grey-900
tds-fg-secondary:  text-secondary     # grey-700
tds-fg-tertiary:   fg-tertiary        # navy-900 @ 58%
tds-fg-quaternary: fg-quaternary      # navy-900 @ 28%
tds-fg-disabled:   grey-400
tds-fg-inverse:    text-alt           # white
tds-fg-brand:      text-brand
tds-fg-danger:     text-danger
tds-fg-success:    green-500

# Background (surface · scrim)
tds-bg-primary:    white
tds-bg-secondary:  fill-secondary     # grey-100
tds-bg-tertiary:   grey-200
tds-bg-elevated:   white
tds-bg-overlay:    overlay-scrim
tds-bg-brand:      fill-brand
tds-bg-brand-weak: blue-50
tds-bg-danger:     fill-danger

# Line (border · divider)
tds-line-default:  border-secondary   # grey-200
tds-line-subtle:   border-subtle
tds-line-strong:   border-strong      # grey-400

# Accent / state
tds-press-overlay:    overlay-press    # 검정 26%
tds-disabled-opacity: 0.30
```

명도 대비 자동 보정 — 미니앱이 자체 brand 컬러를 등록할 때, 등록된 색이 명도 대비 기준을 통과하지 못하면 의도를 유지한 채 자동 보정된다 [src:6]. 토큰 빌드는 Token Studio(Figma 플러그인) → GitHub PR → 플랫폼별 코드 자동 생성 파이프라인을 거친다 [src:3].

## Typography

본문/UI 서체는 **Toss Product Sans (TPS)**다 [src:8]. 토스가 산돌(2020)과 공동 제작한 자체 서체이며, iOS의 SF, Windows의 맑은 고딕, Android 기본 서체로 플랫폼별 파편화되어 있던 토스 화면을 단일 서체로 통합하기 위해 만들어졌다 [src:8]. 한글 자형은 산돌의 고딕 Neo1을 기반으로 미세 조정되었고, 라틴·문장부호·기타 글리프는 한글 디자인에 맞춰 새로 그려졌다 [src:8]. 디자인 3대 기준은 (1) **밸런스** — 라틴/숫자가 통상 본문 서체보다 크게 그려져 한글과 시각적으로 화합한다, (2) **금융 맥락** — 특수문자(%, comma, 화살표)는 텍스트가 아니라 UI 요소로 재설계되었다, (3) **중립 형태** — "글자 대신 글이, 형태 대신 내용이 보일 수 있도록" 콘텐츠를 가리지 않는 형태를 지향한다 [src:8].

TPS는 자체 라이선스가 적용되어 외부 재배포가 불가능하다. 핸드오프 번들과 토스의 외부 권장 사항은 **Pretendard**를 가장 가까운 무료 한+영 neogrotesque 대체 서체로 명시한다 — 메트릭·한글 자형·tabular figure가 TPS와 거의 1:1로 일치한다. 번들의 폰트 스택:

```yaml
font-family-sans: >
  "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
  "SF Pro Text", "SF Pro", "Apple SD Gothic Neo", "Noto Sans KR",
  Roboto, "Helvetica Neue", Arial, sans-serif
font-family-emoji: "Tossface"
```

### Type ramp (모든 값 `colors_and_type.css`에서 직접 추출)

```yaml
display-1:  { size: 56, line-height: 1.30, tracking: -0.005em, weight: 700 }
display-2:  { size: 40, line-height: 1.20, tracking: -0.020em, weight: 700 }
h1:         { size: 28, line-height: 1.30, tracking: -0.020em, weight: 700 }
h2:         { size: 24, line-height: 1.30, tracking: -0.020em, weight: 700 }
h3:         { size: 22, line-height: 1.30, tracking: -0.015em, weight: 700 }
h4:         { size: 20, line-height: 1.35, tracking: -0.015em, weight: 700 }
title-1:    { size: 18, line-height: 1.45, tracking: -0.010em, weight: 600 }
title-2:    { size: 17, line-height: 1.45, tracking: -0.010em, weight: 600 }
body-1:     { size: 17, line-height: 1.50, tracking: -0.005em, weight: 400 }
body-2:     { size: 15, line-height: 1.50, tracking: -0.005em, weight: 400 }
body-3:     { size: 13, line-height: 1.50, tracking: 0,         weight: 400 }
label-l:    { size: 17, line-height: 1.25, tracking: -0.005em, weight: 700 }
label-m:    { size: 15, line-height: 1.25, tracking: -0.005em, weight: 600 }
label-s:    { size: 13, line-height: 1.25, tracking: 0,         weight: 600 }
caption:    { size: 12, line-height: 1.40, tracking: 0,         weight: 500 }
caption-s:  { size: 11, line-height: 1.40, tracking: 0,         weight: 500 }
```

display 웨이트는 Bold 700에 tight -1.5%~-2% 트래킹으로 무게감을 잡고, 본문은 15px Regular + 1.5 line-height — 한글 가독성을 위해 1.5가 표준이다. 버튼은 XL/L에서 Bold 700 17px, M/S에서 Semibold 15~13px을 쓴다 — "토스 버튼은 장식이 아니라 문장처럼 읽힌다". 카드 타이틀은 `title-1`(18/600), 카드 본문은 `body-2`(15/400)다.

### 숫자/기호 처리

TPS는 variable·fixed-width 두 폭을 모두 제공하며, 실시간 금융 데이터(주가·환율·잔액)는 tabular figure로, 강조 시 proportional figure를 사용한다 [src:8]:

```yaml
font-feature-numeric-tabular:      "tabular-nums"
font-feature-numeric-proportional: "proportional-nums"
```

`{typography.tabular-nums}`는 실시간 금융 데이터에, `{typography.proportional-nums}`는 강조 시 — 한국 핀테크 앱에서 보기 드문 본격적 숫자 타이포 분리다 [src:8]. 글자 수는 초기 2,350자에서 한글 완성형 전체 11,172자로 확장되어 인앱 타이핑·메시징을 지원한다 [src:8].

### Tossface (이모지 서체)

`{typography.font-family-emoji}`는 Unicode v14.0 전체 셋을 커버하는 자체 이모지 폰트로, TTF/OTF/WOFF/WOFF2로 제공되며 "단순한 형태와 최소한의 묘사"를 지향한다 [src:7]. 작은 사이즈에서도 의미가 분명히 읽히도록 설계되었다.

## Spacing

베이스 단위는 4px이며, 토큰 사다리는 4~80px 12단계로 정의된다:

```yaml
space-1:   4
space-2:   8
space-3:  12
space-4:  16
space-5:  20
space-6:  24
space-7:  28
space-8:  32
space-10: 40
space-12: 48
space-16: 64
space-20: 80
```

작은 영역(4~32)에서는 모든 4의 배수 단계를 갖고 있으며, 큰 영역(40 이상)은 섹션 구분을 위한 generous한 간격으로 운영된다. 시스템 룰 오브 섬: **24px** 화면 outer padding, **16px** list-row 간 간격, **8px** 밀접 결합 요소(label + input) 사이.

## Rounded

라운드 토큰은 4~32px 8단계 + `full`(999px) 한 단계로 정의되며, 토스 시스템은 "**프로덕션에서 가장 둥근 모바일 시스템 중 하나**"로 분류된다:

```yaml
radius-xs:    4     # small badges
radius-s:     8     # inline tags
radius-m:    12     # text inputs
radius-l:    14     # L button (48px)
radius-xl:   16     # XL button (56px), cards
radius-2xl:  20     # sheets, dialogs
radius-3xl:  24     # big cards / sections
radius-4xl:  32     # hero blocks
radius-full: 999    # chips, pills, capsules
```

버튼 라운드는 사이즈에 따라 스케일된다 — XL 16 / L 14 / M 12 / S 10, `buttons.html` preview로 확인된다. iOS류 squircle/blob 라운드는 `Templates/Squircle` 전용 페이지를 제외하면 사용되지 않는다.

## Elevation & Depth

토스는 평면이 기본이며 그림자는 floating/modal 표면에서만 등장한다. shadow offset과 blur 값은 `colors_and_type.css`에서 직접 인용되며, 색은 모두 navy-900 베이스의 낮은 알파(0.04~0.16)로 통일된다.

```yaml
shadow-1:     >
  0 1px 2px oklch(0.155 0.060 261 / 0.04),
  0 1px 1px oklch(0.155 0.060 261 / 0.04)   # menu
shadow-2:     >
  0 4px 12px oklch(0.155 0.060 261 / 0.06),
  0 1px  2px oklch(0.155 0.060 261 / 0.04)   # tooltip
shadow-3:     >
  0 12px 32px oklch(0.155 0.060 261 / 0.10),
  0 2px  6px oklch(0.155 0.060 261 / 0.06)   # dialog
shadow-toast: >
  0 8px 24px oklch(0.155 0.060 261 / 0.16)   # toast
```

bottom-sheet shadow는 README에 명시된 컨벤션이지만 토큰은 아니다 — `0 -2px 12px oklch(0.155 0.060 261 / 0.06)`. inner-shadow 시스템은 없으며, pressed state는 `{colors.press-overlay}`(검정 26% overlay)를 resting fill 위에 얹는 방식으로 구현된다 — 그림자가 아니라 overlay다.

### Motion

```yaml
ease:     cubic-bezier(0.22, 0.61, 0.36, 1)   # 기본 ease-out-expo
ease-out: cubic-bezier(0.16, 1,    0.3,  1)   # 더 snappy, sheet 진입
dur-fast: 120                                  # button press
dur-base: 200                                  # toggle, hover
dur-slow: 320                                  # sheet, dialog
```

"바운스 오버슈트 없음, 320ms 초과 fade 없음, parallax 없음, skeleton shimmer 없음 — 토스는 3-dot loader를 대신 쓴다". 모든 모션은 위 5개 토큰 안에서 운용된다.

## Shapes

기하학은 **공격적 라운드 + 평면 표면 + 헤어라인 보더**로 요약된다. 차분한 화이트 캔버스 위에 16~32px 라운드 카드/버튼을 얹고, chips와 primary CTA에는 999px full pill을 적용한다. 강조는 색(토스 블루)과 위계로 표현하며 장식은 절제된다.

기본 보더는 **1px `{colors.grey-200}` 헤어라인**이며, focused input은 1.5px `{colors.blue-500}` 보더로 한 단계 강해진다. 2px 장식용 보더는 사용되지 않고, 컬러 left-rail accent 카드도 사용되지 않는다. 배경은 평면이 기본이며 그라디언트는 세 가지 문서화된 예외(bottom CTA 위쪽 보호 그라디언트, 로딩 버튼 내부 radial glow, yellow→orange 일러스트 그라디언트)에만 허용된다.

**Iconography (TDS Icon system)** — 아웃라인(`*-mono`) + 필드(`*-fill`) 두 종 변형, kebab-case 명명(`icon-x-mono`, `icon-setting-mono`, `icon-user-circle-blue-fill`), 사이즈 16/20/24/32. 24px가 워크호스이며, stroke는 24px 그리드 기준 1.5~1.67px, corner는 부드럽게 라운드된다. 필드 변형은 active tab-bar 아이콘에만 사용되고, 모든 아이콘은 `currentColor`를 상속한다 — 외부 컬러 직접 주입은 금지다. 번들이 명시한 production runtime은 단일 SVG sprite로 서빙되며, Figma에서 가장 많이 인스턴스화된 아이콘은 `icon-x-mono`(96회), `icon-setting-mono`(48회), `icon-user-circle-blue-fill`(96회)이다. Apps-in-Toss 미니앱이 외부에서 prototype을 작성할 때는 TDS 아이콘 SVG를 직접 들고 올 수 없으므로 새 번들 ui_kits는 **Lucide**(24px 그리드, 1.5px stroke, rounded line caps)를 동일 격자의 임시 대체로 사용한다 — production 마이그레이션 시 실제 TDS sprite로 교체한다는 substitution 약속이 README에 명시되어 있다.

**Tossface illustration asset set** — `{colors.yellow-500}` body + `{colors.brown-900}`·`{colors.brown-700}` facial features의 yellow-faced 평면 이모지 글리프 [src:7]. 빈 상태·성공 화면·bottom sheet 헤더에 시각 자산 컴포넌트로 사용되며, 텍스트 inline punctuation으로는 사용되지 않는다.

## Components

본 섹션은 핸드오프 번들 Figma 라이브러리의 **41개 컴포넌트 페이지**를 functional kind 별로 분해한다. 정확한 token 값(`{spacing.*}`, `{rounded.*}`, `{colors.*}`)이 모두 surface되어 있으므로 prose 본문에서 `{group.name}` 토큰 참조로 호출한다.

### button

토스 Button은 **XL/L/M/S** 4단으로 운영되며, height·radius·label font가 각 사이즈에서 함께 변한다:

| 사이즈 | height | radius | label |
|---|---|---|---|
| XL | 56 | `{rounded.radius-xl}` (16) | `{typography.label-l}` (17px Bold) |
| L  | 48 | `{rounded.radius-l}` (14)  | `{typography.label-l}` (17px Bold) |
| M  | 40 | `{rounded.radius-m}` (12)  | `{typography.label-m}` (15px Semibold) |
| S  | 32 | 10                         | `{typography.label-s}` (13px Semibold) |

pressed state는 `{colors.overlay-press}` (검정 26%)를 fill 위에 얹는 방식이고, disabled state는 컴포넌트 전체 노드에 `{colors.disabled-opacity}` (0.30)를 적용한다 — 부분 회색 처리하지 않는다.

```tsx
<Button variant="primary" size="xl">송금하기</Button>
<Button variant="ghost" size="m">취소</Button>
```

### button-primary

`{colors.fill-brand}` (blue-500) 배경 + `{colors.text-alt}` (흰 텍스트). 화면당 단 하나의 가장 중요한 액션에만 사용된다.

### button-secondary

`{colors.fill-secondary}` (grey-100) 배경 + `{colors.text-primary}` (grey-900) 텍스트. 같은 화면의 보조 액션을 표현할 때 사용된다.

### button-danger

`{colors.fill-danger}` (red-500) 배경 + `{colors.text-alt}` 텍스트. 파괴적 액션 전용.

### button-ghost

투명 배경 + `{colors.text-brand}` (blue-500) 라벨, 보더 없음. 텍스트 링크에 가까운 약한 위계.

### bottom-cta

화면 최하단 고정 56pt 버튼. 좌우 16px padding, 24~32px의 `white → transparent` 보호 그라디언트가 위쪽에 적용되어 스크롤되는 콘텐츠와 시각적으로 충돌하지 않도록 한다. `env(safe-area-inset-*)`로 safe area를 자동 인식한다.

```tsx
<BottomCTA onClick={handleNext}>다음</BottomCTA>
```

### text-field

48px height, `{rounded.radius-m}` (12) radius, `{colors.fill-secondary}` (grey-100) resting 배경, 1px `{colors.border-secondary}` (grey-200) 보더. focus 상태에서 흰 배경 + 1.5px `{colors.border-primary}` (blue-500) 보더로 전환된다. error 상태는 1.5px `{colors.fill-danger}` (red-500) 보더와 그 아래 `{colors.text-danger}` 컬러의 헬퍼 텍스트로 표현된다.

### chip

34px 높이의 full pill (`{rounded.radius-full}`). resting은 1px `{colors.border-secondary}` 보더 + 흰 배경, active 변형은 `{colors.fill-primary}` (grey-900) 배경 + 흰 텍스트로 flip되며, brand 변형은 `{colors.blue-50}` 배경 + `{colors.text-brand}` (blue-500) 텍스트다.

### badge

22px 높이, 6px radius — chip보다 작고 더 정보 밀도 높은 표면에 사용된다. 시맨틱 색에 매핑된 washed 배경과 페어링된다 (예: red badge는 옅은 분홍 배경 + `{colors.text-danger}` 텍스트; green badge는 옅은 민트 배경 + `{colors.green-500}` 텍스트). 핸드오프 번들의 `colors_and_type.css`는 시맨틱 base step(`red-500/600`, `green-500`)만 정의하고 badge 전용 washed 배경 step은 노출하지 않으므로, washed 톤은 base hue에서 lightness를 끌어올린 추정값으로 운용한다 — red badge ≈ `oklch(0.940 0.040 18)` (정식 토큰 없음, 추정).

### list-row

토스 홈·계좌 목록·거래 내역의 표준 단위. 좌우 padding 14×24, 14px gap으로 44px 아바타(radius 14) + 타이틀/서브 스택 + 우측 정렬 amount/timestamp/arrow 슬롯을 갖는다. amount는 Bold 700 15px이며, 양수는 `{colors.text-brand}` (예: `+50,000원`), 음수는 `{colors.text-primary}` (예: `−12,300원`)로 표시된다.

```tsx
<ListRow
  left={<Asset name="bank-account" />}
  title="토스뱅크"
  subtitle="잔액"
  right={<Amount value={1234567} positive />}
/>
```

### list-header

list-row 그룹의 헤더 — 섹션 타이틀과 우측 액션 슬롯(예: "전체보기")을 함께 노출한다.

### tab-bar

미니앱의 floating tab-bar 변형 — 420px max-width, `{rounded.radius-3xl}` (24) radius, 흰 배경 + 1px `{colors.border-secondary}` 보더, 2~5개 destination [src:9]. active 아이콘은 filled 변형 + `{colors.text-primary}`, inactive는 outline + `{colors.text-tertiary}`다.

### top-app-bar

56pt 높이, 좌측 정렬 타이틀, 우측 옵션 아이콘 버튼 슬롯.

### toast

`{colors.fill-primary}` (grey-900) 표면 + 흰 라벨, `{rounded.radius-l}` (14) radius, `{elevation.shadow-toast}`. 성공 아이콘은 20px `{colors.green-500}` 원 + 흰 체크다.

```tsx
<Toast>송금이 완료되었어요</Toast>
```

### dialog

흰 표면, `{rounded.radius-2xl}` (20) radius, 24px inner padding, `{elevation.shadow-3}`. 타이틀은 18/700, 본문은 15/400 `{colors.text-secondary}`, primary blue + secondary grey-100 CTA 두 개가 각 48px 높이로 stack된다.

```tsx
<Dialog
  title="송금을 취소할까요?"
  body="취소하면 작성하던 내용이 사라져요."
  primary="취소"
  secondary="계속하기"
/>
```

### bottom-sheet

토스 모바일에서 dialog의 1차 대체 — `{elevation.shadow-bottom-sheet}` (`0 -2px 12px oklch(0.155 0.060 261 / 0.06)`) shadow, `{colors.overlay-scrim}` scrim, 20~24px top corner radius. yellow-faced 일러스트 글리프가 sheet 상단에 anchored되는 패턴이 빈번하다.

### keypad

전용 Figma 페이지 — 금액 입력과 PIN 입력에 사용되는 숫자 키패드. backdrop-filter blur는 iOS 네이티브 시트가 카메라/키패드 위에 떴을 때만 적용된다.

### loading

라벨이 0으로 페이드되고 같은 색의 3개 dot이 펄스하면서, 미세한 radial highlight가 버튼을 가로지른다. skeleton shimmer는 의도적으로 사용되지 않는다.

### menu

trigger 위치에 즉시 펼쳐지는 셀렉터 컴포넌트 [src:4]. "버튼은 위에서 눌렀는데 응답이 하단 bottom sheet에서 오면 인지 부하가 커진다"는 문제 의식을 바탕으로 시각적 거리(physical distance)를 최적화한 컴포넌트다. 10일 A/B 테스트에서 Android item-click rate 10% 개선이 검증된 뒤 정식 채택되었다 [src:4].

```tsx
<Menu trigger={<Button variant="ghost">정렬</Button>}>
  <Menu.Item>최신순</Menu.Item>
  <Menu.Item>가나다순</Menu.Item>
</Menu>
```

### icon

TDS Icon system — outline (`*-mono`) + filled (`*-fill`) 두 종 변형, 16/20/24/32 사이즈, `currentColor` 상속. filled 변형은 active tab-bar 아이콘에만 사용된다.

### asset (Tossface illustration)

`{colors.yellow-500}` body + `{colors.brown-900}`·`{colors.brown-700}` facial features의 평면 일러스트 자산 [src:7]. 빈 상태·성공 화면·bottom-sheet 헤더에 시각 자산 컴포넌트로 사용되며, 텍스트 inline에 emoji 대용으로 절대 사용되지 않는다.

### error-message-library

가이드라인이 아닌 **시스템 형태**의 에러 카피 인프라 [src:10]. 개발자용 라이브러리(코드 컴포넌트 검색 기반)와 디자이너용 프리셋 템플릿(Framering) 두 채널을 갖는다. 핵심 원칙은 **"Navigating error"** — 에러 메시지의 역할은 사용자를 다음 화면으로 옮겨주는 것이며 멈춰 세우는 것이 아니다 [src:10]. 토스가 잘못해 발생한 에러조차 해요체를 유지하며, 반복 시스템 상황은 템플릿화되어 좋은 카피가 기본 선택지가 된다 [src:10].

### checkbox · switch

checkbox는 22px 정사각 + 6px radius, resting은 1.5px `{colors.border-strong}` (grey-300) 보더 + 흰 배경, checked는 `{colors.fill-brand}` (blue-500) 배경 + 흰 체크 글리프로 flip된다. switch는 44×26px 트랙 + 20px 흰 knob, off는 `{colors.grey-300}` 트랙, on은 `{colors.fill-brand}` 트랙으로 전환되며 knob은 `{motion.dur-base}` (200ms) `{motion.ease}`로 18px translate된다.

### segmented-control

여러 옵션 중 하나를 고르는 분절형 컨트롤 [src:9]. 트랙은 `{colors.fill-secondary}` (grey-100) 배경 + `{rounded.radius-m}`~`radius-l` 라운드, 선택된 분절은 흰 배경 + `{elevation.shadow-1}`로 떠오르고, 미선택 라벨은 `{colors.text-secondary}`다. chip이 다중 필터라면 segmented-control은 상호 배타적 단일 선택이다.

### search-field

`{component.text-field}`의 변형 — 좌측에 search 아이콘을 둔 48px 높이 입력, `{rounded.radius-m}` (12) radius, `{colors.fill-secondary}` (grey-100) resting 배경. focus 시 흰 배경 + 1.5px `{colors.border-primary}` (blue-500)로 전환되는 규칙은 text-field와 동일하다.

### slider

트랙 + thumb 단일 값 선택 컨트롤. 트랙은 `{colors.grey-200}` baseline 위에 `{colors.fill-brand}` (blue-500) active fill, thumb는 흰 원 + 미세한 그림자다. 값 변화는 `{motion.dur-base}` 안에서만 운용되고 바운스 오버슈트는 없다.

### rating

별점 표시·입력 컴포넌트. 채워진 별은 `{colors.yellow-500}`(일러스트 warm), 빈 별은 `{colors.grey-200}`이며, 반 칸(half) 상태를 지원한다. 숫자 평점은 `{typography.label-m}` Bold로 별 옆에 붙는다.

### progress-bar · progress-stepper

progress-bar는 `{colors.grey-200}` 트랙 + `{colors.fill-brand}` (blue-500) fill의 선형 진행 표시이며, 우측에 `{typography.label-s}` tabular 퍼센트를 둔다. progress-stepper는 26px 원형 node를 segment로 연결한 다단계 표시로, 완료 node는 `{colors.fill-brand}` + 흰 체크, 현재 node는 `{colors.fill-brand}` + `{colors.blue-50}` 4px 글로우 링, 미도달 node는 `{colors.grey-200}` + `{colors.text-tertiary}`다.

### numeric-spinner · stepper

numeric-spinner는 `−  값  +` 가로 캡슐(`{rounded.radius-full}` 보더 + 흰 배경)로 금액·수량 미세 조정에 쓰이며, 값은 tabular figure, ± 버튼은 `{colors.text-brand}` (blue-500)다. stepper는 같은 역할의 세로 변형(`▲ 값 ▼`)으로 `{rounded.radius-m}` 보더 컨테이너 안에서 값 행을 1px 헤어라인으로 분리한다. 비활성 버튼은 `{colors.text-placeholder}`로 흐려진다.

### tooltip · bubble

tooltip은 `{colors.fill-primary}` (grey-900) 표면 + 흰 라벨 + caret을 가진 짧은 보조 설명으로 `{elevation.shadow-2}`를 쓴다. bubble은 채팅 말풍선으로, 상대 발화는 `{colors.grey-200}` 배경 + 좌하단 4px 꼬리(`radius 14/14/14/4`), 본인 발화는 `{colors.fill-brand}` (blue-500) 배경 + 흰 텍스트 + 우하단 4px 꼬리(`radius 14/14/4/14`)다.

### post · board-row · table-row · grid-list

피드·랭킹·표·격자 등 콘텐츠 표시 단위. post는 28px 아바타 + 작성자/시간 헤더 + `{typography.body-3}` 본문 + 반응 strip(♥·💬, active는 `{colors.text-brand}`)으로 구성된다. board-row는 순위 숫자(`{colors.text-brand}`, 1위는 `{colors.text-primary}`) + 36px 원형 아바타 + 우측 tabular 점수의 리더보드 행이다. table-row는 라벨/값/증감 3열을 1px `{colors.border-secondary}` 헤어라인으로 구분하며 수치는 tabular, 등락은 시맨틱 색을 쓴다. grid-list는 2열 격자에 흰 카드(`{rounded.radius-m}` + `{colors.blue-50}` 아이콘 칩)를 배치한다.

### bar-chart

막대형 데이터 시각화. 막대는 `{colors.grey-200}` 기본 + 강조 막대만 `{colors.fill-brand}` (blue-500)이며, 상단만 6px 라운드된다. **axis line·divider를 두지 않는다** — 막대가 차분한 표면 위에 그대로 떠 있는 것이 토스 차트의 규칙이다.

### bottom-info · list-footer

bottom-info는 `{component.bottom-cta}` 위에 얹히는 보조 안내 — `{colors.blue-50}` 배경 + `{colors.text-brand}`의 full pill 칩으로 "수수료 없이 보내요" 같은 한 줄 컨텍스트를 전한다. list-footer는 목록 하단의 "더보기" 액션 행으로 44px 높이 + 1px `{colors.border-secondary}` 보더 + 우측 chevron(grey-400)을 둔다.

### result · text-button · icon-button · tab · navigation

result는 성공/실패 종료 화면 — 중앙 정렬된 시맨틱 원형 아이콘(성공은 `{colors.green-500}`) + 타이틀 + 보조 카피 + yellow-faced 일러스트 anchor로 구성된다. text-button은 `{component.button-ghost}`에 가까운 보더 없는 텍스트 액션이며, icon-button은 40px 정사각 hit-area 안에 24px 아이콘만 둔 컨트롤이다. tab은 하단 2.5px `{colors.fill-brand}` 언더라인으로 활성 상태를 표시하는 인라인 탭(floating `{component.tab-bar}`와 구분된다). navigation(앱인토스)은 미니앱이 토스 셸 안에서 실행 중임을 알리는 상단 inset 바로, 호스트 표기에 토스 심볼을 작게 동반한다 [src:6].

### Full component coverage (41 Figma pages)

새 번들 `project/preview/` 디렉터리는 Figma 46개 페이지 중 컴포넌트 페이지 41개를 1:1로 카드화한다. 위 prose 정의 12개는 가장 자주 인용되는 핵심 set이고, 아래 매트릭스는 전체 surface를 한 줄씩 노출한다 — 각 row의 `preview/*.html`은 production 토큰을 inline한 self-contained 데모이며, `Components.jsx` 컬럼은 새 번들의 `ui_kits/mobile/Components.jsx`에 live React 컴포넌트로 추출된 것을 표시한다.

| Figma page | preview card | Components.jsx |
|---|---|---|
| Asset | `asset.html` | — |
| Badge | `badge.html` | — |
| Bar-Chart | `bar-chart.html` | — |
| Board-Row | `board-row.html` | — |
| Border | `border.html` | — |
| Bottom-CTA | `bottom-cta.html` | ✅ `BottomCTA` |
| Bottom-Info | `bottom-info.html` | — |
| Bottom-Sheet | `bottom-sheet.html` | — |
| Bubble | `bubble.html` | — |
| Button | `buttons.html` | ✅ `TButton` |
| Checkbox | `checkbox.html` | — |
| Chip | `chip.html` | — |
| Dialog | `dialog.html` | — |
| Grid-List | `grid-list.html` | — |
| Icon-Button | `icon-button.html` | — |
| Keypad | `keypad.html` | (inline in AmountScreen) |
| List-Footer | `list-header-footer.html` | — |
| List-Header-V3 | `list-header-footer.html` | — |
| List-Row | `list-rows.html` | ✅ `ListRow` |
| Loader | `loader.html` | — |
| Menu | `menu.html` | — |
| Navigation---AppsinToss | `navigation-apps-in-toss.html` | — |
| Numeric-Spinner | `numeric-spinner.html` | — |
| Post | `post.html` | — |
| Progress-Bar | `progress-bar.html` | — |
| Progress-Stepper | `progress-stepper.html` | — |
| Rating | `rating.html` | — |
| Result | `result.html` | (inline in DoneScreen) |
| Search-Field | `search-field.html` | — |
| Segmented-Control | `segmented-control.html` | — |
| Slider | `slider.html` | — |
| Stepper | `stepper-spinner.html` | — |
| Switch | `switch.html` | — |
| Tab | `tab.html` | — |
| Tab-Bar | `tab-bar.html` | ✅ `TabBar` |
| Table-Row | `table-row.html` | — |
| Text-Button | `text-button.html` | — |
| Text-Field | `inputs.html` | ✅ `TextField` |
| Toast | `toasts-dialogs.html` | ✅ `Toast` |
| Tooltip | `tooltip.html` | — |
| Top | `top.html` | ✅ `TopBar` |

### Live JSX kit & Send-Money click-through

`ui_kits/mobile/Components.jsx`는 위 매트릭스 중 production 흐름에서 가장 자주 쓰이는 **7개**를 plain React 컴포넌트로 추출한다: `TopBar`(56pt 상단바), `BottomCTA`(56pt 하단 고정 액션 + 위쪽 보호 그라디언트), `TButton`(XL/L/M/S × primary/neutral/danger/ghost), `TextField`(48pt resting → focus 1.5px blue), `ListRow`(44pt 아바타 + amount 슬롯), `TabBar`(4-tab floating), `Toast`(grey-900 surface + green-500 check 아이콘). 모두 build 의존성 없이 `<script type="text/babel">`로 inline 컴파일되며, 토큰은 `colors_and_type.css`의 CSS custom property를 직접 참조한다.

`ui_kits/mobile/Send-Money Flow.html`은 위 7개 컴포넌트와 `ios-frame.jsx`(390×780pt iOS bezel)를 조합해 **5-screen 송금 click-through**를 제공한다. 순서와 각 화면의 1차 액션:

| 단계 | 화면 (`Screens.jsx`) | 1차 액션 (`BottomCTA` 라벨) |
|---|---|---|
| 01 · 홈 | `HomeScreen` | "송금하기" → `select` |
| 02 · 받는 사람 | `SelectScreen` | (목록에서 행 선택 → `amount`) |
| 03 · 금액 입력 | `AmountScreen` | "{금액}원 보내기" (amount 없으면 "보내기" + disabled) → `confirm` |
| 04 · 확인 | `ConfirmScreen` | "{금액}원 보내기" → `done` |
| 05 · 완료 | `DoneScreen` | "확인" → `home`(stack reset) |

흐름 전체가 단일 React `useState` 스택으로 관리되어 back-navigation이 평탄하게 동작하며, `AmountScreen`은 입력값 0일 때 CTA를 disabled로 잠가 토스의 **"버튼은 일어날 일을 직접 말한다"** 원칙( Don'ts 절)을 잡음 없이 구현한다.

## Do's and Don'ts

**Do**

- product-facing 색은 시맨틱·컴포넌트 alias(`{colors.fill-brand}`, `{colors.text-primary}`, `{colors.border-primary}`, `{colors.fill-secondary}`)로만 호출하고, base 팔레트(`{colors.blue-500}`, `{colors.grey-900}` 등)는 새 role을 만들 때만 직접 참조한다 [src:3].
- 화면당 단일 강조색 정책을 유지한다 — primary CTA는 `{colors.fill-brand}` 하나로 통일하고, 보조 액션은 `{colors.fill-secondary}` 또는 ghost 변형으로 분리한다 [src:3].
- 화면 최하단 강제 액션은 `{component.bottom-cta}`로, 화면 내부 액션은 `{component.button-primary}`로 분리한다 — 두 컴포넌트의 역할이 다르다.
- 버튼 라운드는 사이즈와 페어로 운영한다 — XL→`{rounded.radius-xl}` (16), L→`{rounded.radius-l}` (14), M→`{rounded.radius-m}` (12), S→10.
- 실시간 금융 데이터(잔액·환율·차트)는 `{typography.tabular-nums}`로, 강조 숫자는 `{typography.proportional-nums}`로 분리한다 [src:8].
- 본문은 `{typography.body-2}` (15px / 1.5 line-height)로 기본화한다 — 한글 가독성을 위한 표준값이다.
- product 카피는 **해요체**로 작성한다 — 토스가 잘못해 발생한 에러에도 격식체가 아닌 해요체를 유지한다 [src:10].
- 에러 메시지는 "Navigating error" 원칙을 따른다 — 사용자를 멈춰 세우지 않고 다음 화면으로 안내한다 [src:10].
- 금액은 한국식 표기를 따른다 — `1,000원` 처럼 세 자리 구분 + `원` 직접 붙임(공백 없음); 퍼센트도 `12%`로 붙여쓴다.
- 미니앱 브랜드명은 한국어 표기를 우선한다 — `Toss`보다 `토스`를 권장한다 [src:6].
- 미니앱이 자체 brand 컬러를 등록할 때는 명도 대비 자동 보정 정책을 신뢰한다 — 의도된 색은 유지된다 [src:6].
- 아이콘은 `currentColor`를 상속하게 둔다 — 외부 컬러 직접 주입은 금지다.
- pressed state는 `{colors.overlay-press}` (검정 26%) overlay로, disabled state는 컴포넌트 전체 노드에 `{colors.disabled-opacity}` (0.30)를 적용한다 — 부분 회색 처리하지 않는다.

**Don't**

- 챗봇 톤("~해보세요!", "~할까요?")이나 마케팅 과장("혁신적", "최고의", "차세대")을 product 카피에 사용하지 않는다 [src:10].
- 격식체(~십시오/~합니다)를 product 카피에 사용하지 않는다 — 토스가 잘못한 에러 화면에서도 해요체를 유지한다 [src:10].
- 단정형 `-다`나 방송 헤드라인 톤을 사용하지 않는다 — 해요체가 표준이다.
- 한 화면에 강조색을 둘 이상 사용하지 않는다 — `{colors.fill-brand}`는 단일 primary CTA에 예약된다.
- 그라디언트를 chrome에 사용하지 않는다 — 세 가지 문서화된 예외(bottom CTA 보호 그라디언트, 로딩 버튼 radial glow, yellow→orange 일러스트)만 허용된다.
- iOS류 squircle/blob 라운드를 사용하지 않는다 — `Templates/Squircle` 전용 페이지를 제외하고는 표준 9단 `{rounded.*}` ladder만 사용한다.
- 2px 장식용 보더, 컬러 left-rail accent 카드를 사용하지 않는다 — 기본 보더는 1px `{colors.border-secondary}` 헤어라인이다.
- skeleton shimmer를 사용하지 않는다 — 로딩 상태는 3-dot loader와 미세 radial highlight로 처리한다.
- 320ms 초과 fade·바운스 오버슈트·parallax를 사용하지 않는다 — 모션은 `{motion.dur-fast/base/slow}` (120/200/320ms) 안에서만 운용한다.
- inner shadow를 사용하지 않는다 — pressed state는 `{colors.overlay-press}` overlay이지 shadow가 아니다.
- 이모지를 product 카피에 inline으로 사용하지 않는다 — "emoji" 컨텐츠는 큐레이트된 `{component.asset}` 일러스트 세트로 다뤄지고, 텍스트 punctuation으로 쓰이지 않는다.
- `{component.button-primary}`와 `{component.bottom-cta}`를 같은 화면에 동시에 두지 않는다 — 액션 위계가 무너지고 강조점이 분산된다.
- 영문 UI 라벨에 ALL CAPS, 헤딩에 `!`, 한국어 문장 중간에 em-dash를 사용하지 않는다; "여기를 눌러주세요" 같은 디렉티브 라벨은 금지된다 — 버튼은 일어날 일을 직접 말한다(`송금하기`, `다음`, `시작하기`).
- 토스의 금융 제품 도메인(송금·결제·계좌·증권 흐름, 슈퍼앱 셸 구조, `Send-Money Flow` 같은 화면 시퀀스)을 성격이 다른 제품에 그대로 이식하지 않는다 — TDS에서 차용할 것은 시각 언어(단일 강조색 규율·공격적 라운드 ladder·해요체 카피 운용·tabular 숫자 분리)이지 토스의 금융 서비스 개념이 아니다; 미니앱조차 토스 하단 네비게이션 복제와 브랜드 혼동이 금지된다 [src:6].

## Responsive Behavior

토스는 **mobile-first** 슈퍼앱이며, TDS Mobile / 앱인토스 TDS가 정식 문서화의 1차 표면이다 [src:9]. 데스크톱 surface는 부수적이며 모바일 인터랙션 패턴을 그대로 옮기지 않는다. README에 명시된 정책 — "토스는 모바일에서 다중 컬럼 레이아웃을 거의 사용하지 않는다".

### Breakpoints

공식 breakpoint 토큰 표는 핸드오프 번들에서 별도로 surface되지 않았다 — 아래는 mobile-first 정책 기반의 권장 분기점이며 토스 공식 토큰은 아니다.

| Name | Width | Key Changes |
|---|---|---|
| Mobile | ≤ 640px | 기본 환경 — `{component.bottom-cta}`로 화면 최하단 액션, `{component.bottom-sheet}`를 dialog 기본 대체로 사용 [src:9] |
| Tablet | 641–1023px | 단일 컬럼 유지 권장 — 토스는 모바일에서 multi-column을 거의 사용하지 않는 정책을 가짐 |
| Desktop | ≥ 1024px | 부수적 surface — 별도 위계 재설계 권장 |

### Touch Targets

모든 인터랙티브 표면은 **최소 44×44px** hit area를 보장한다. `{component.list-row}`는 한 줄 전체가 hit area이며, `{component.button}` 사이즈는 S(32)도 손가락 터치를 전제로 충분한 padding을 갖는다. `{component.bottom-cta}`는 56pt 높이로 한 손 엄지 도달성을 최적화한다.

### Collapsing Strategy

- **Dialog → BottomSheet**: 모바일에서는 `{component.dialog}` 대신 `{component.bottom-sheet}`를 1차로 사용한다 [src:9].
- **Menu over BottomSheet**: 선택지가 짧으면 `{component.menu}`를 trigger 근처에 펼친다 — 하단 sheet로 떨어뜨리지 않는다 (시각 거리 최적화 정책) [src:4].
- **BottomCTA**: 화면 최하단에 safe-area inset을 고려한 고정 액션 영역으로 운용한다.
- **Single column**: 모바일·태블릿 모두 단일 컬럼 유지를 권장한다.

### Image Behavior

토스 시스템은 `{component.asset}`을 통해 일러스트·아이콘을 일관된 컨테이너 안에서 노출한다. chrome에는 full-bleed 사진이 사용되지 않으며, 일러스트 자산은 `{colors.yellow-500}` body의 평면 톤을 유지한다.

## Known Gaps

- **다크 모드 alias 테이블** — 핸드오프 번들은 light 모드 카노니컬 hex만 제공한다. 다크 모드 전환 시 각 semantic alias의 base 참조 변화(light → dark 매핑)는 공개되지 않았으며, 2025년 OKLCH 마이그레이션 발표 시점에도 다크 alias 전체 테이블은 surface되지 않았다 [src:3].
- **전체 컬러 step ladder** — `colors_and_type.css`에 노출된 step은 brand(blue 50/500/600/700), grey(50~900 + 150), yellow(300~700), orange(300~500), red(500/600), green(500), navy-900, brown(400~900)이다. 그 외 hue별 step(예: blue-100~400, green-50~400, red-50~400 등)의 OKLCH 값은 surface되지 않았다.
- **Toss Product Sans 라이선스** — TPS는 자체 라이선스로 외부 재배포가 금지된다 [src:8]. 본 카탈로그를 적용하는 host 앱은 Pretendard로 substitute해야 하며, 메트릭은 거의 일치하지만 글리프 디테일(특수문자 디자인, fixed-width 숫자)에서는 차이가 발생할 수 있다.
- **Token Studio 빌드 산출물 포맷** — 토큰은 Token Studio → GitHub PR → 플랫폼별 코드 자동 생성을 거치며 출력은 RGB/RGBA 포맷이다 [src:3]. 본 카탈로그는 OKLCH로 변환해 표기하나, 자동 생성 산출물의 정확한 포맷·툴체인 디테일은 공개되지 않았다.
- **공식 breakpoint 토큰** — TDS Mobile은 mobile-first 정책상 breakpoint 토큰 자체가 공식 surface되지 않았다 [src:9]. 본 문서의 Responsive Behavior 분기점은 권장값이며 토스 공식 토큰이 아니다.

## References

1. https://toss.tech — Toss Tech 블로그 인덱스.
2. https://toss.tech/article/toss-design-system — TDS 디자인 시스템 개요. LEGO-block 비유, 2,000명 메이커 전제, 3-pillar 개선 모델.
3. https://toss.tech/article/tds-color-system-update — TDS 컬러 시스템 OKLCH 마이그레이션, 4계층 토큰 구조(Target/Role/Variant/Level), base/semantic/component 명명.
4. https://toss.tech/article/tds-component-making — 컴포넌트 설계 방법론. Menu 컴포넌트 10일 A/B 테스트, "Will people use this well? Will metrics improve?" 검증 원칙.
5. https://tossmini-docs.toss.im/tds-mobile/ — TDS Mobile foundation, TextField/Modal/Toast/Dialog 및 `useDialog`/`useToast`/`useBottomSheet` 훅.
6. https://developers-apps-in-toss.toss.im/design/miniapp-branding-guide.html — 앱인토스 미니앱 브랜딩 가이드, `brand.primaryColor: #3182F6` 예시, 명도 대비 자동 보정 정책, 한국어 표기 권장.
7. https://github.com/toss/tossface — Tossface 이모지 폰트 공식 레포. Unicode 14.0 전체 셋, TTF/OTF/WOFF/WOFF2.
8. https://toss.im/tossfeed/article/beginning-of-tps — Toss Product Sans 개발기. 산돌 공동 제작, 7 weight, 한글 11,172자 완성형, tabular/proportional 숫자 분리, 디자인 3대 기준.
9. https://developers-apps-in-toss.toss.im/design/components.html — 앱인토스 TDS 컴포넌트 목록 (Badge, Border, BottomCTA, Button, Asset, ListRow, ListHeader, Navigation, Paragraph, Tab, Top).
10. https://toss.tech/article/introducing-toss-error-message-system — Toss 에러 메시지 시스템. Navigating error 원칙, 해요체 채택 의사결정, 개발자 라이브러리 + 디자이너 Framering.
11. https://toss.im — 토스 공식 홈페이지. 슬로건·카피·비주얼 톤 보조 출처.
