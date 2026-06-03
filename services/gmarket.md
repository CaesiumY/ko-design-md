---
name: 지마켓
design_system_name: Gmarket Design System
slug: gmarket
category: commerce
last_updated: "2026-06-03"
created_at: "2026-05-23"
sources:
  - https://gds.gmarket.co.kr/
  - https://gds.gmarket.co.kr/brand/colors
  - https://gds.gmarket.co.kr/brand/logos
  - https://gds.gmarket.co.kr/brand/notation
  - https://gds.gmarket.co.kr/brand/typeface
  - https://gds.gmarket.co.kr/brand/values
  - https://gds.gmarket.co.kr/components
  - https://gds.gmarket.co.kr/components/accordions
  - https://gds.gmarket.co.kr/components/badges
  - https://gds.gmarket.co.kr/components/banners
  - https://gds.gmarket.co.kr/components/buttons
  - https://gds.gmarket.co.kr/components/chips
  - https://gds.gmarket.co.kr/components/dialogs
  - https://gds.gmarket.co.kr/components/dropdowns
  - https://gds.gmarket.co.kr/components/heading
  - https://gds.gmarket.co.kr/components/info-boxes
  - https://gds.gmarket.co.kr/components/item-cards
  - https://gds.gmarket.co.kr/components/labels
  - https://gds.gmarket.co.kr/components/lists
  - https://gds.gmarket.co.kr/components/navigation
  - https://gds.gmarket.co.kr/components/popovers
  - https://gds.gmarket.co.kr/components/selection-controls
  - https://gds.gmarket.co.kr/components/sheets
  - https://gds.gmarket.co.kr/components/slides
  - https://gds.gmarket.co.kr/components/tabs
  - https://gds.gmarket.co.kr/components/text-fields
  - https://gds.gmarket.co.kr/components/thumbnails
  - https://gds.gmarket.co.kr/foundation
  - https://gds.gmarket.co.kr/foundation/color
  - https://gds.gmarket.co.kr/foundation/iconography
  - https://gds.gmarket.co.kr/foundation/spacing
  - https://gds.gmarket.co.kr/foundation/typography
  - https://gds.gmarket.co.kr/overview/introduction
  - https://gds.gmarket.co.kr/foundation
  - https://gds.gmarket.co.kr/
related_services: []
lang: ko
logo: https://getdesign.kr/logos/gmarket.png
---

# Gmarket Design System — design.md

## Brand & Style

Gmarket Design System(GDS)은 지마켓(G마켓)의 디자인 시스템이며, 브랜드명(지마켓 / Gmarket)과 디자인 시스템명은 별개의 이름이다 [src:6][src:33]. 지마켓은 한국의 오픈마켓형 이커머스 서비스로, 고객과 상품·고객과 고객을 연결하는 쇼핑 경험의 "연결 주체(connection)"를 핵심 키워드로 삼는다 [src:6]. 브랜드 본질 가치는 'Connection(연결)'을 중심으로 Center(시장과 고객 일상의 중심), Forward(이커머스 흐름 선도), Variety(고객 각각의 삶에 맞는 다채로운 제안) 세 하위 가치로 구성된다 [src:6].

GDS는 모바일 앱(iOS·Android, 1차 표면)·모바일 웹·PC 웹 전반의 디자인 일관성 표준화를 목표로 하며, 모바일 우선(mobile-first)으로 설계됐다 [src:1][src:33]. 운영 원칙은 일관성(브랜드 정체성·사용성), 확장성(공동 라이브러리 자산), 효율성(재사용성·생산성) 세 가지다 [src:33]. 시각 톤은 밝고 깨끗하며 정렬된 인상이다 — 기본 캔버스가 흰색(`{colors.bg-white}`)이고 그림자를 매우 절제하며, 채도 높은 그린을 포인트로 쓰는 점이 이커머스 시스템치고 라우드한 편이다 [src:29][src:35]. 브랜드 서체 Gmarket Sans는 직관적인 쇼핑 경험을 단순하고 직선적인 형태로 표현하며, 네모 틀에 꽉 채운 기하학적 글자꼴로 정렬된 인상과 친근한 인상을 동시에 준다 [src:5].

주 사용자는 한국 이커머스 오픈마켓 이용자이며, 시안 작업의 기본 타입페이스가 안드로이드 기준(국문 Noto Sans KR, 영문·숫자 Roboto)으로 잡혀 있어 한국 모바일 시장의 안드로이드 우세를 반영한다 [src:32]. 스마일페이·스마일카드·스마일스탬프·스마일클럽·캐치 등 스마일 시리즈가 G마켓 브랜드와 동일 위계의 서브브랜드 색상 체계를 갖는 점, 검색 광고에 'AD' 대신 한글 '광고' 라벨을 쓰는 점이 한국 시장 맥락에 맞춘 설계 결정이다 [src:29][src:15].

**GDS는 라이트 모드 전용 시스템이다.** v1.3.0 공식 사이트와 토큰 CSS 어디에도 다크 팔레트가 발행되어 있지 않으며, 모든 표면 토큰은 흰색 캔버스(`{colors.bg-white}`)를 전제로 한다 [src:29][src:34]. 이 문서는 다크 토큰을 추정하지 않으며, 다크 테마가 필요하다면 다운스트림에서 별도 근거 위에 정의해야 한다.

## Colors

GDS 컬러는 "Hex Code보다 컬러명 사용"을 권장하며, WCAG 2.0 기반으로 컬러별 10단계(50–900)를 지원하고 각 컬러의 주요 색상은 500이다 [src:29]. 아래 값은 공개된 hex 토큰을 ko-design-md 표준에 맞게 OKLCH로 변환한 것이며, **라이트 모드 전용으로 다크 변형은 존재하지 않는다** [src:29][src:34].

브랜드 핵심 색상은 의도적으로 구별되는 그린 1색·블루 3색 구조다 — 세 블루(`cta`, `blue-500`, `blue-800`)는 각각 전환 동선·신뢰 정보·브랜드 라벨이라는 다른 역할을 가지므로 하나로 병합하지 않는다 [src:2][src:29][src:35].

```yaml
# Brand — Gmarket Green (UI 토큰 기준값)
green-500: oklch(0.747 0.252 142)   # Gmarket Green, foundation --green-500 (#00C400)
# 주: 브랜드 페이지 인쇄/온라인 규정 표는 Gmarket Green을 #00C01E (≈ oklch(0.730 0.241 145),
# PMS 802C/802U, CMYK 78/0/100/0)로 표기 — 두 1차 소스 간 값이 불일치한다.
# 디자인 시스템 토큰의 #00C400을 UI 기준값으로 채택하고 #00C01E는 브랜드 인쇄 규정값으로 별도 기록.

# Brand — 의도적으로 공존하는 세 블루 (병합 금지)
cta: oklch(0.395 0.205 266)        # Gmarket Blue, --cta, e커머스 전환 동선 한정 (#0028AC)
blue-500: oklch(0.598 0.213 257)   # Informative Blue, --blue-500, 별점·공식 태그 신뢰색 (#067DFD)
blue-800: oklch(0.378 0.181 264)   # Blue-800, 공식 브랜드 라벨 색상 (#0231A6)

# Brand — 캔버스
bg-white: oklch(1.000 0.000 0)     # Gmarket White, 전체 앱 기본 배경 (#FFFFFF)

# Green 10단계
green-50: oklch(0.984 0.022 150)    # (#E5FCE3)
green-100: oklch(0.913 0.103 150)   # (#A5F4A0)
green-200: oklch(0.857 0.179 148)   # (#6CEF64)
green-300: oklch(0.815 0.234 146)   # (#39E532)
green-400: oklch(0.779 0.250 144)   # (#11D70D)
# green-500 위에 정의 (#00C400)
green-600: oklch(0.682 0.224 145)   # (#01A900)
green-700: oklch(0.563 0.179 146)   # (#018600)
green-800: oklch(0.444 0.130 148)   # (#015F00)
green-900: oklch(0.318 0.085 150)   # (#013600)

# Blue 10단계
blue-50: oklch(0.973 0.014 248)     # (#EEF7FF)
blue-100: oklch(0.916 0.045 250)    # (#CBE8FF)
blue-200: oklch(0.858 0.073 253)    # (#A7D9FF)
blue-300: oklch(0.760 0.122 256)    # (#68BBFF)
blue-400: oklch(0.671 0.171 257)    # (#329CFF)
# blue-500 위에 정의 (#067DFD)
blue-600: oklch(0.522 0.224 261)    # (#0062E5)
blue-700: oklch(0.448 0.214 263)    # (#0048C8)
# blue-800 위에 정의 (#0231A6)
blue-900: oklch(0.297 0.171 266)    # (#072182)

# Red 10단계 — Warning
red-50: oklch(0.974 0.012 17)       # (#FFF5F5)
red-100: oklch(0.911 0.046 18)      # (#FFDADB)
red-200: oklch(0.853 0.077 22)      # (#FFBFBF)
red-300: oklch(0.733 0.151 23)      # (#FF8585)
red-400: oklch(0.654 0.207 25)      # (#FF5454)
red-500: oklch(0.586 0.224 27)      # Warning, --red-500 (#EF2B2A)
red-600: oklch(0.524 0.221 28)      # (#DA120D)
red-700: oklch(0.470 0.197 29)      # (#BF0A03)
red-800: oklch(0.405 0.169 29)      # (#9F0A01)
red-900: oklch(0.337 0.137 30)      # (#7D0800)

# Orange 10단계 — Delay (배송 지연)
orange-50: oklch(0.977 0.011 49)    # (#FFF6F2)
orange-100: oklch(0.916 0.042 47)   # (#FFE1D3)
orange-200: oklch(0.856 0.073 44)   # (#FFCCB2)
orange-300: oklch(0.749 0.150 42)   # (#FF9E70)
orange-400: oklch(0.687 0.193 39)   # (#FF7638)
orange-500: oklch(0.633 0.211 41)   # Delay, --orange-500 (#F9560E)
orange-600: oklch(0.561 0.187 42)   # (#DA4000)
orange-700: oklch(0.485 0.155 43)   # (#B43200)
orange-800: oklch(0.403 0.122 44)   # (#882400)
orange-900: oklch(0.337 0.084 53)   # (#5E2700)

# Grayscale 10단계 — 배경·텍스트·보더
gray-50: oklch(0.985 0.000 0)       # (#FAFAFA)
gray-100: oklch(0.970 0.000 0)      # (#F5F5F5)
gray-200: oklch(0.944 0.000 0)      # (#EEEEEE)
gray-300: oklch(0.899 0.000 0)      # (#E0E0E0)
gray-400: oklch(0.792 0.000 0)      # (#BDBDBD)
gray-500: oklch(0.685 0.000 0)      # (#9E9E9E)
gray-600: oklch(0.541 0.000 0)      # (#757575)
gray-700: oklch(0.471 0.000 0)      # (#616161)
gray-800: oklch(0.359 0.000 0)      # (#424242)
gray-900: oklch(0.244 0.000 0)      # (#222222)
black: oklch(0.000 0.000 0)         # (#000000)

# Semantic — text
text-cto: oklch(0.000 0.000 0)        # Black, 상품명·가격 숫자 한정 ('원'은 별도) (#000000)
text-primary: oklch(0.244 0.000 0)    # gray-900, 제목·본문 (#222222)
text-secondary: oklch(0.471 0.000 0)  # gray-700, 서브 본문 (#616161)
text-tertiary: oklch(0.685 0.000 0)   # gray-500, 설명·비활성 (할인 전 가격·품절) (#9E9E9E)
text-caption: oklch(0.792 0.000 0)    # gray-400, 법적 규제 텍스트 (#BDBDBD)
text-link: oklch(0.522 0.224 261)     # blue-600, 링크·텍스트 버튼 색상 (#0062E5)
text-on-color: oklch(1.000 0.000 0)   # white, 컬러 표면 위 텍스트 (#FFFFFF)

# Semantic — background / border
bg-off-white: oklch(0.970 0.000 0)    # gray-100, 페이지·모달 2차 배경 (#F5F5F5)
bg-card-ui: oklch(0.985 0.000 0)      # gray-50, 카드 UI 내 배경·푸터 (#FAFAFA)
bg-divider: oklch(0.944 0.000 0)      # gray-200, 디바이더 라인 (#EEEEEE)
border-active: oklch(0.244 0.000 0)   # gray-900, 폼 필드 포커스 보더 (#222222)
border-secondary: oklch(0.792 0.000 0) # gray-400, secondary 버튼 보더 (#BDBDBD)
border-tertiary: oklch(0.899 0.000 0)  # gray-300, 콘텐츠 배경 보더 (#E0E0E0)
border-white: oklch(1.000 0.000 0)    # White, 썸네일 위 보더 (#FFFFFF)

# Semantic — status (각 10단계 중 500이 기준)
positive: oklch(0.747 0.252 142)   # green-500, 쿠폰·사은품 혜택·활성화 텍스트
informative: oklch(0.598 0.213 257) # blue-500, 별점·공식 태그 신뢰
warning: oklch(0.586 0.224 27)     # red-500, 취소·탈퇴 등 주의·에러
delay: oklch(0.633 0.211 41)       # orange-500, 배송 지연
# 각 상태색과 짝지는 표면 배경 틴트 (해당 컬러 10단계의 50)
positive-bg: oklch(0.984 0.022 150)    # green-50, positive 표면 배경 (#E5FCE3)
informative-bg: oklch(0.973 0.014 248) # blue-50, informative 표면 배경 (#EEF7FF)
warning-bg: oklch(0.974 0.012 17)      # red-50, warning 표면 배경 (#FFF5F5)
delay-bg: oklch(0.977 0.011 49)        # orange-50, delay 표면 배경 (#FFF6F2)

# Service Brand — Smile 시리즈 (G마켓과 동일 위계의 브랜드 색상)
smile: oklch(0.291 0.105 286)         # 스마일배송·페이·카드 (#282864)
smilepay-sub: oklch(0.323 0.146 285)  # 스마일페이 브랜드 배경 (#313191)
smilestamp: oklch(0.435 0.220 290)    # 스마일스탬프 (#5939DA)
smileclub-biz: oklch(0.273 0.135 285) # 스마일클럽 비즈 (#102775)
catch: oklch(0.290 0.184 291)         # 캐치 (#280082)
smile-yellow: oklch(0.872 0.176 95)   # 스마일 브랜드 기본(노란) 색상 (#FFD200)
smileclub-300: oklch(0.689 0.058 73)  # 스마일클럽 골드 밝은 (#BC9A6E)
smileclub-400: oklch(0.620 0.064 70)  # 스마일클럽 골드 중간 (#A78353)
smileclub-500: oklch(0.560 0.067 67)  # 스마일클럽 골드 어두운, 텍스트 색상 (#966E46)

# Sub Color — 카테고리 섹션 강조 색상 (1차 브랜드 표현 아님), 각 10단계 중 500
sub-yellow-500: oklch(0.776 0.151 84)  # (#EAAD06)
sub-teal-500: oklch(0.732 0.106 211)   # (#43BED0)
sub-indigo-500: oklch(0.610 0.211 277) # (#706FF7)
sub-purple-500: oklch(0.585 0.226 305) # (#9D50E5)
sub-pink-500: oklch(0.621 0.282 348)   # (#E413C3)
```

`{colors.green-500}`(Gmarket Green)이 색상 축이며, positive/active-state(쿠폰·할인 혜택·체크박스 checked·토글 on·바텀 내비 활성 아이콘·탭 숫자)에 쓴다 [src:29][src:34]. 단, **primary 액션·선택(selected) 상태의 중립색은 `{colors.text-primary}`(gray-900)** — primary 버튼·기본 필터칩 active·탭 Selection Indicator·라디오 단일선택은 green이 아니라 gray-900이다 [src:11][src:22]. 즉 색은 gray-900(선택/primary)·green(positive)·`{colors.cta}`(전환) 셋이 역할을 나눠 가진다. 세 블루는 역할이 분리되어 있다 — `{colors.cta}`는 깊은 네이비-블루로 buy/pay 버튼·장바구니 뱃지 등 전환 동선 한정, `{colors.blue-500}`은 별점·공식 태그 등 신뢰(informative) 색상, `{colors.blue-800}`은 아이템 카드의 공식 브랜드 라벨 색상이다 [src:2][src:29][src:17]. 상태색은 Positive·Informative·Warning·Delay 4종을 각 컬러 10단계의 500으로 지정한다 [src:29]. 회색 램프는 채도 0의 순수 그레이이며, 텍스트는 `{colors.text-cto}`(상품명·가격 숫자)→`{colors.text-primary}`→`{colors.text-secondary}`→`{colors.text-tertiary}`→`{colors.text-caption}` 5단계로 위계를 잡는다 [src:29]. 브랜드 키워드 '연결'을 표현하는 `{colors.green-500}` → `oklch(0.729 0.139 174)` → `{colors.blue-500}` linear 그라디언트는 UI 크롬이 아닌 히어로·브랜드 표면(홈 배너 등)에만 쓴다 [src:2][src:35].

## Typography

GDS는 OS별 시스템 폰트와 공통 웹 폰트로 구성된 3패밀리 구조다. 시안 작업의 기본 타입페이스는 안드로이드 기준(국문 Noto Sans KR, 영문·숫자 Roboto)이며, 웹 폰트 Gmarket Sans는 OS 공통으로 브랜드 가치 전달이 필요한 헤딩·가격·할인율·일부 컴포넌트에 **한정** 사용된다 — 본문에는 쓰지 않는다 [src:32][src:5].

```yaml
# Families
font-heading: "Gmarket Sans"          # 헤딩·가격·할인율 한정, Bold/Medium/Light 3굵기 제작
font-body: "Noto Sans KR"             # 한국어 본문, 안드로이드 베이스라인
font-latin: "Roboto"                  # 안드로이드 라틴·숫자
# iOS 카운터파트: SF Pro Display + Apple SD Gothic Neo (시스템 폰트, OS별 최적화)

# Weights
weight-regular: 400
weight-medium: 500
weight-bold: 700

# Line-height — canonical 번들이 정의 (기존 Known Gap 해소)
line-tight: 1.25     # 헤딩
line-normal: 1.45    # 본문
line-relaxed: 1.6

# Size scale — 8단계 (최대 24, 최소 12; 11(xxs)은 법적 텍스트 예외 한정)
size-xxxl: 24   # px
size-xxl: 22
size-xl: 20
size-l: 18
size-m: 16
size-s: 14
size-xs: 12
size-xxs: 11

# Type 컴포넌트 — token: size px / family / weight / 용도
heading-1: 24 / Gmarket Sans / 500 / 페이지 단위 타이틀 (홈 상단 메시지)
heading-2: 22 / Gmarket Sans / 500 / 페이지 단위 타이틀 (MyG 상단 메시지)
heading-3: 20 / Gmarket Sans / 500 / 템플릿 단위 타이틀 (홈 템플릿 타이틀)
heading-4: 18 / Gmarket Sans / 500 / 템플릿 단위 타이틀 (헤더 타이틀)
body-1: 16 / Noto Sans KR / 400 / 주요 본문 (리스트·서브 타이틀)
body-2: 14 / Noto Sans KR / 400 / 보조 본문 (상품명·리스트)
detail: 12 / Noto Sans KR / 400 / 본문 보조·하위 위계 (인포박스 타이틀·본문)
```

대표적으로 제목은 20px, 본문은 14px이다 [src:32]. 헤딩 4종은 `{typography.font-heading}`(Gmarket Sans), 본문 3종(`body-1`·`body-2`·`detail`)은 `{typography.font-body}`(Noto Sans KR)를 쓰며, 본문은 Regular 또는 Bold를 취한다 [src:32]. 줄 높이는 canonical 번들이 정의한다 — 헤딩 `line-tight`(1.25), 본문 `line-normal`(1.45), 여유 `line-relaxed`(1.6)다 [src:32]. letter-spacing 토큰은 여전히 공개되지 않았다.

**헤딩 weight — canonical은 Medium(500).** 공식 타이포그래피 표(1차)는 Heading 1~4를 모두 Regular(400)로 기재하나, canonical 번들의 재현 CSS 토큰(`colors_and_type.css`)이 헤딩에 Medium(500)을 적용한다 [src:32][src:34]. 위 토큰 블록은 번들을 따라 `500`으로 기록하되, 원 공식 표기는 400임을 함께 남긴다.

타입 사용 규칙은 커머스 맥락에 강하게 묶여 있다 — 숫자 중 **가격과 할인율은 Gmarket Sans로 고정** 사용하고, 그 외 숫자는 OS별 시스템 폰트를 쓴다 [src:32]. Gmarket Sans Bold는 프로모션 메시지 강조용이며, Bold는 Medium 대비 직관성이 낮아 명확한 정보 전달 UI에서는 사용을 지양한다 [src:32]. 언더라인은 링크·텍스트 버튼에, 취소선(Strikethrough)은 할인 전 가격에 쓰되 도형 선이 아닌 텍스트 스타일 취소선을 사용하며, 이탤릭은 시스템 어디에도 없다 [src:32][src:35].

## Spacing

GDS는 8-Point Grid를 사용한다 — 주요 디바이스 스크린 사이즈가 8로 나누어떨어지고 1.5배수 시 렌더링 이슈가 최소화되기 때문이다 [src:31]. 기본 단위는 4와 8의 배수 기반 8가지로 규정하며, 8보다 작은 2·4 배수도 사용 가능하다 [src:31].

```yaml
# spacing-{name} : px
spacing-xxxs: 2
spacing-xxs: 4
spacing-xs: 8
spacing-s: 12
spacing-m: 16    # base
spacing-l: 20
spacing-xl: 24   # base
spacing-xxl: 32
spacing-xxxl: 40
```

`{spacing.spacing-m}`(16px)과 `{spacing.spacing-xl}`(24px)이 두 기준 단위다 [src:31][src:34]. 적용 규칙은 다음과 같다 — 페이지 양옆 마진은 16px 기본, 베이직 템플릿 하나는 상하 마진 24px 포함이 기본이며 템플릿 간 간격은 0px가 기본이다 [src:31]. 카드 템플릿은 템플릿 간 간격 12px를 쓰고, 템플릿 내 서로 다른 컴포넌트 간 간격과 Heading–Component Group 간 간격은 상하 16px가 기본이다 [src:31]. 버튼 2개 이상을 수직 정렬하면 패딩 8px, 수평 정렬하면 패딩 12px로 고정한다 [src:11]. 푸터 전체형(홈·마이페이지)은 G마켓 로고–바텀 내비 간 간격 64px, 푸터 축약형(상세·결제·장바구니)은 텍스트 끝–풀위드 버튼 간 16px가 기본이다 [src:31].

## Rounded

코너 반경은 중간 정도로 둥근(moderately rounded) 토큰 램프다 [src:34][src:35].

```yaml
# radius-{name} : px
radius-none: 0
radius-xs: 2
radius-s: 4
radius-m: 8     # 버튼
radius-l: 12    # 카드
radius-xl: 16   # 시트
radius-full: 9999  # pill / circle
```

관찰된 사용처는 명확하다 — 버튼은 `{rounded.radius-m}`(8px), 아이템 카드는 `{rounded.radius-l}`(12px), 바텀시트는 `{rounded.radius-xl}`(16px)을 쓴다 [src:34][src:35]. 사각 썸네일 Radius는 8px 고정이되 일부 영역에서 밸런스에 따라 4px로 조정 가능하고, 원형 썸네일은 높이와 동일한 값(`{rounded.radius-full}`)을 쓴다 [src:27]. 아이콘 코너 기본값은 3px이다 [src:30]. 모서리·선 끝(endcap)·꺾임(join)을 둥글게 처리해 부드러운 인상을 의도한다 [src:30].

## Elevation & Depth

GDS의 깊이 언어는 매우 절제되어 있다 — 그림자는 모두 옅고, 글래스·블러·뉴모피즘 효과는 쓰지 않는다 [src:35]. 표면 분리는 강한 드롭섀도가 아니라 옅은 그림자와 1px 디바이더(`{colors.bg-divider}`)·배경 워시가 담당한다 [src:35][src:31].

```yaml
# 재현 CSS 토큰 기준 — 4단계
elev-card: 0 1px 4px oklch(0.000 0.000 0 / 0.06)        # 아이템 카드
elev-popover: 0 4px 12px oklch(0.000 0.000 0 / 0.08)    # 팝오버
elev-sheet: 0 -4px 16px oklch(0.000 0.000 0 / 0.08)     # 시트 (하단에서 상승)
elev-docked-btn: 0 -2px 20px oklch(0.000 0.000 0 / 0.02) # 풀위드 도크 버튼 배경
```

`elev-card`는 아이템 카드 수준의 약한 부양에, `elev-popover`는 팝오버에, `elev-sheet`는 하단에서 올라오는 시트에 쓴다 [src:34]. `elev-docked-btn`은 풀위드 도크 버튼 뒤에 깔리는 배경 그림자이며, 공식 버튼 가이드도 이 배경 그림자를 "black 2%, 20px 기준"으로 명시한다 [src:34][src:11]. 디밍 오버레이는 black, opacity 50%(`oklch(0.000 0.000 0 / 0.5)`)가 표준이다 [src:13]. **모든 그림자 토큰은 라이트 모드 값이다** — 다크 모드 대응 elevation은 공개되지 않았다 [src:34][src:29].

## Shapes

형태 언어는 정돈된 기하 구조 위에 중간 반경을 얹는 방식이다 [src:5][src:34]. 브랜드 서체 Gmarket Sans가 네모 틀에 꽉 채운 기하학적 글자꼴인 점이 시스템 전반의 형태 인상을 정의한다 — 깔끔하고 정렬된 인상과, 손으로 쓰는 자연스러운 필순에서 오는 친근한 인상이 함께 있다 [src:5]. 곡선은 모서리 반경으로만 표현되며(버튼 8px·카드 12px·시트 16px), 유기적 곡면이나 비대칭 형태는 쓰지 않는다 [src:34][src:30].

아이콘은 48×48 캔버스에 상하좌우 4px 여백, Keyline Shapes 기준으로 제작한다 [src:30]. 48px 사이즈 선 아이콘은 stroke 굵기 3, stroke alignment Center, endcap·join Round, 코너 반경 기본 3px이며, 스타일은 Line(기본)·Fill(작은 크기·행동 피드백) 2종이다 [src:30]. 이미지는 자연광 기반의 상품 중심 사진으로 따뜻한 중립 화이트밸런스를 쓰며, 무드 필터·모노크롬·그레인은 쓰지 않는다 [src:35]. 애니메이션은 짧고 절제적이다 — 표준 전환은 ~150ms 페이드이고 바운스·스프링은 없다 [src:13][src:35].

## Components

GDS는 재사용 가능한 구성요소를 스타일·쓰임새별로 명명·분류한다 [src:7]. 아래는 시스템의 시그니처 패턴이며, 커머스 특성상 전환 동선(주문·결제 버튼)·아이템 카드·가격 표기가 핵심 표면이다 [src:11][src:17].

### button-cta

전환 동선 전용 버튼이다 — e커머스 특성상 계층 구조가 가장 높은 주문·결제·수령 버튼에 **한정** 사용하며, 배경은 `{colors.cta}`(Gmarket Blue)다 [src:11][src:29]. 사용처는 상품 상세의 `구매하기`, 주문서의 `결제하기`로 고정되며(주문과 결제는 다른 의미이므로 `주문하기`로 대체 금지), 풀위드 형태는 좌우 마진 16px 고정이되 키패드 결합 시 마진 0px다 [src:11]. 사이즈는 Xlarge·Large·Medium·Small·Tiny이며, 최소 높이 28px 미만 Tiny는 터치 영역 이슈로 사용을 지양한다 [src:11].

```tsx
<Button type="cta" size="xlarge" fullWidth>
  구매하기
</Button>
```

### button-primary

페이지당 1회만 쓰는 키 액션 버튼이다 [src:11]. 배경은 `{colors.text-primary}`(gray-900)·텍스트는 `{colors.text-on-color}`(white)로, 전환 동선의 `{colors.cta}`(파랑)·positive의 `{colors.green-500}`(초록)과 색으로 구분된다 [src:11][src:29]. CTA보다 낮은 위계의 주요 행동에 쓰며, 한 화면의 primary slot은 하나만 둔다 [src:11]. Button 타입(CTA·Primary·Secondary) 중 Primary에 해당한다 [src:11].

```tsx
<Button type="primary" size="large">장바구니 담기</Button>
```

### button-secondary

CTA·Primary보다 낮은 위계의 보조 행동용이다 [src:11]. 보더는 `{colors.border-secondary}`(gray-400)를 쓴다 [src:29].

```tsx
<Button type="secondary" size="medium">취소</Button>
```

### button-action

펼치기·전체보기·더보기 레이블과 결합하는 버튼이다 [src:11]. 좌측 Refresh 아이콘은 더보기, 우측 Chevron 아이콘은 내비게이션 이동을 의미한다 [src:11].

```tsx
<ActionButton icon="chevron-right">전체보기</ActionButton>
```

### button-disabled

버튼의 비활성 상태는 별도 시각 상태로 다룬다 — opacity 40%로 표현한다 [src:34][src:35]. 아이콘 버튼 상태는 Default(opacity 100%) → Pressed(opacity 50%) → Disabled(opacity 40%) 순으로 처리한다 [src:30].

```tsx
<Button type="cta" disabled>품절</Button>
```

### button-icon

아이콘 단독 버튼이다 — 48×48 터치 영역에 24px 아이콘을 담고, 기본 색은 `{colors.text-primary}`(gray-900)다 [src:11][src:30]. 상태는 Default(opacity 100%) → Pressed(opacity 50%) → Disabled(opacity 40%)로 처리하며, 토글형(좋아요 등) 활성 시 `{colors.cta}`로 채운다 [src:30][src:11].

```tsx
<IconButton aria-label="장바구니" icon="cart" />
<IconButton aria-label="찜" icon="heart" pressed />
```

### button-text

배경 없이 텍스트만으로 동작을 노출하는 버튼이다 — 색은 `{colors.text-primary}`(gray-900), 링크 성격일 때는 `{colors.text-link}`(blue-600)와 언더라인을 쓴다 [src:11][src:29]. Small 변형은 12px다 [src:11].

```tsx
<TextButton underline>전체 약관 보기</TextButton>
```

### item-card-gallery

상품 정보를 집약하는 컴포넌트이며 이미지에 집중하는 variant다 [src:17]. 썸네일 사이즈는 Large 180×180 / Medium 128×128 / Small 104×104이고, 코너 반경은 `{rounded.radius-l}`(12px)다 [src:17][src:34]. 상품명은 최대 2줄 후 줄임표로 자르고, 가격 숫자는 `{typography.font-heading}`(Gmarket Sans), 색은 `{colors.text-cto}`로 렌더한다 [src:17][src:32]. 공식 브랜드 정보는 `{colors.blue-800}` 색상으로 노출한다 [src:17].

```tsx
<ItemCard variant="gallery" thumbnailSize="medium">
  <ItemCard.Brand official>지마켓</ItemCard.Brand>
  <ItemCard.Name>스테인리스 텀블러 500ml 보온보냉</ItemCard.Name>
  <ItemCard.Price>12,900</ItemCard.Price>
</ItemCard>
```

### item-card-list

정보에 집중하는 아이템 카드 variant다 [src:17]. Gallery와 동일한 가격·브랜드 규칙을 공유하되 이미지보다 텍스트 정보 밀도를 높게 잡는다 [src:17].

```tsx
<ItemCard variant="list" thumbnailSize="small">
  {/* 정보 집중 레이아웃 */}
</ItemCard>
```

### item-card-price-sale

할인 전 가격을 표시하는 아이템 카드의 가격 상태다 — 할인 전 원가는 텍스트 스타일 취소선(Strikethrough)으로 처리하고, 색은 비활성 위계인 `{colors.text-tertiary}`(gray-500)를 쓴다 [src:17][src:32][src:29]. 도형 선이 아닌 텍스트 취소선을 사용한다 [src:32].

```tsx
<ItemCard.Price strikethrough>18,000</ItemCard.Price>
<ItemCard.Price>12,900</ItemCard.Price>
```

### item-card-soldout

일시품절 상태의 아이템 카드다 — 가격 위치를 'SOLD OUT'(대문자, `{typography.font-heading}` Gmarket Sans Bold, `{colors.gray-500}`)으로 대체한다 [src:17].

```tsx
<ItemCard.Price soldOut>SOLD OUT</ItemCard.Price>
```

### thumbnail

상품 대표 이미지 컴포넌트다 — Square(1:1, `{rounded.radius-m}` 8px)와 Circle(딜 상품용, Radius=높이) 2종이다 [src:27]. 사이즈는 Xlarge(360px, 전체뷰 한정)부터 Xxxsmall(56px)까지이며, 탐색용은 Xsmall 이상·확인용은 Xxsmall 이하를 쓴다 [src:27]. 좌측 상단 Label·우측 상단 Badge 엘리먼트를 포함한다 [src:27].

```tsx
<Thumbnail shape="square" size="large" label="쿠폰" badge={2} />
```

### badge-basic

장바구니·알림 개수를 표시하는 카운터 뱃지다 [src:9]. 색상은 `{colors.cta}`(장바구니·알림 동선) 또는 `{colors.text-primary}`(gray-900, Primary)를 쓰며, 마이페이지 한정 스마일클럽 쿠폰 개수에는 `{colors.smile}` 컬러를 쓴다 [src:9]. 숫자 없이 점만 찍는 dot 뱃지 변형도 있다 [src:9]. 장바구니 담기 인터랙션은 Lottie로 화면 중앙에서 0.2초 후 헤더 뱃지 위치로 이동하며 숫자를 카운팅한다 [src:9].

```tsx
<Badge variant="basic" tone="cta">3</Badge>
```

### nudging-label

판매자·내부 혜택을 표시하는 넛징 라벨이며 Coupon·Card·Gift 3타입이다 [src:18]. Coupon Label은 판매자·내부 쿠폰 혜택, Card Label은 카드사 혜택, Gift Label은 판매자 사은품 혜택 시 노출한다 [src:18]. 검색 결과 페이지에서는 소비자 오인 가능성 때문에 'AD'가 아닌 한글 '광고' 라벨로 노출한다 [src:18][src:15].

```tsx
<Label variant="nudging" type="coupon">10% 쿠폰</Label>
```

### bottom-navigation

화면 최하단 고정 내비게이션이며 컨테이너 높이는 48px다 [src:20]. 앱은 아이콘 5개 고정, 모바일 웹은 4개(Smilehome 미노출)다 [src:20]. 활성 아이콘 색상은 `{colors.green-500}`, 비활성은 `{colors.gray-900}`다 [src:20]. 앱 진입 시 'HOME'이 활성이며, Home·Mypage·History는 활성 상태에서 한 번 더 탭하면 최상단 스크롤·새로고침한다 [src:20]. Smilehome 아이콘은 Lottie로 프로모션 기간 동안 앱 진입 시 최초 1회 재생한다(터치 영역 106×88px) [src:20].

```tsx
<BottomNavigation activeKey="home">{/* 앱 5개 / 모바일 웹 4개 */}</BottomNavigation>
```

### gnb-header

상단 GNB 헤더이며 컨테이너 높이 48px, 아이콘 24px 사이즈에 터치 영역 48px다 [src:20]. Basic은 스크롤/역스크롤 시 최상단 고정, Tab이 있는 화면은 역스크롤 시 헤더와 Tab을 함께 고정한다 [src:20].

```tsx
<GnbHeader sticky>{/* 아이콘 24px, 터치 48px */}</GnbHeader>
```

### dialog

긴급 정보 알림용 다이얼로그다 — 가로폭 280px 고정, 높이는 최대 360px 가변이며 Contents 영역은 상하 32px·좌우 16px다 [src:13]. 버튼은 최소 1개·최대 3개이고, 우선순위가 높은 버튼은 Text 컬러로 `{colors.blue-500}`을 쓴다 [src:13]. 이전으로 돌아갈 텍스트 버튼은 필수 포함하며, 닫기 아이콘 버튼은 중복 기능이라 쓰지 않는다 [src:13]. 오버레이는 black 50%다 [src:13].

```tsx
<Dialog title="주문을 취소할까요?">
  <Dialog.Action>이전</Dialog.Action>
  <Dialog.Action priority>확인</Dialog.Action>
</Dialog>
```

### bottom-sheet

페이지 이탈 없이 집중 정보를 표시하는 시트다 — Basic Modal Bottom Sheet(Fixed/Draggable)와 Nudging Modal Bottom Sheet가 있다 [src:23]. Header 높이는 48px 고정, Draggable은 Half가 기본이며 핸들로 Full까지 확장한다 [src:23]. 시트 레이어 위에는 버튼 요소만 위치할 수 있다 [src:23]. 코너 반경은 `{rounded.radius-xl}`(16px)이다 [src:34].

```tsx
<BottomSheet type="draggable" detent="half">{/* content */}</BottomSheet>
```

### chip

상품 리스트 필터링 전용 컴포넌트다 — Basic Filter Chips / Curation Filter Chips / Basic Option Chips 3종이다 [src:12]. 칩 하나당 최대 10자(22byte)이고, 폭을 초과하면 가로 스크롤한다 [src:12]. Active 처리는 종류별로 다르다 — **Basic Filter Chip은 `{colors.text-primary}`(gray-900) 채움**, Curation Filter Chip은 해당 화면의 카테고리 색상(`{colors.green-500}` 또는 `{colors.sub-teal-500}` 등 Sub Color)으로 표시한다 [src:12].

```tsx
<Chip type="filter" active>무료배송</Chip>
```

### tab

페이지 내 동일 위계 콘텐츠를 그룹화한다 — Tabs(섹션 2~3개, 높이 48px)와 Tabs Group(섹션 4개 이상·레이블 유동, 높이 50px)이 있다 [src:25]. 선택 시 Selection Indicator(하단 라인, `{colors.text-primary}` gray-900)가 새 탭으로 이동하며, 레이블과 숫자를 결합하면 숫자는 `{colors.green-500}`로 표시한다 [src:25].

```tsx
<Tab activeKey="all">{/* 2~3개 Tabs / 4개+ Tabs Group */}</Tab>
```

### text-field

입력 컴포넌트다 — Text Field(한 줄, Large 56px / Small 48px 높이)와 Text Area(여러 줄)가 있다 [src:26]. 레이블 우측에 '선택' 표시가 필수이며, 포커스 시 보더는 `{colors.border-active}`(gray-900)를 쓴다 [src:26][src:29]. 에러 메시지는 '-하세요'에 마침표를 붙인다 [src:26].

```tsx
<TextField label="배송 메모" optional placeholder="예: 부재 시 경비실" />
```

### accordion

펼침/접힘 패널 컨테이너다 — 헤더 높이는 Basic 48px / Large 56px이고, 하단 1px 디바이더(`{colors.bg-divider}`)로 행을 구분한다 [src:8]. 헤더는 타이틀과 우측 chevron으로 구성되며 펼침 시 chevron이 180° 회전한다 [src:8]. 헤더 우측 보조 알림 텍스트는 `{colors.positive}`(green-500)로 표시한다 [src:8].

```tsx
<Accordion size="basic" defaultOpen>
  <Accordion.Header alert="3건">배송 정보</Accordion.Header>
  <Accordion.Body>오늘(수) 도착 예정</Accordion.Body>
</Accordion>
```

### dropdown

선택값을 노출·변경하는 드롭다운이다 — 컨트롤 높이는 Large 56px / Small 48px이며 상단 floating label, 하단 선택값을 쌓는다 [src:14]. 펼침(expanded) 시 보더가 `{colors.border-active}`(gray-900)로 바뀌고 chevron이 회전한다 [src:14]. placeholder 상태 값은 `{colors.text-tertiary}`로 흐리게 둔다 [src:14].

```tsx
<Dropdown size="large" label="배송지">
  <Dropdown.Value>서울특별시 강남구</Dropdown.Value>
</Dropdown>
```

### selection-controls

선택 상태를 다루는 폼 컨트롤 3종이다 [src:22]. **Checkbox**는 22px 사각(반경 `{rounded.radius-s}` 4px), 체크 시 `{colors.green-500}`로 채운다 [src:22]. **Radio**는 20px 원형, 선택 시 `{colors.text-primary}`(gray-900) 보더·점으로 표시한다 — 다중선택(green)과 단일선택(gray-900)을 색으로 구분하는 게 의도다 [src:22]. **Toggle**은 44×24 트랙, on 시 `{colors.green-500}`로 트랙을 채운다 [src:22]. 비활성은 opacity 40%다 [src:22].

```tsx
<Checkbox checked>전체 동의</Checkbox>
<Radio name="pay" checked>스마일페이</Radio>
<Toggle checked aria-label="알림 받기" />
```

### info-box

부가 정보·주의를 담는 인포박스다 — Default(`{colors.bg-divider}` 보더), Highlight(`{colors.informative-bg}` 배경·`{colors.blue-800}` 텍스트), Warning(`{colors.warning-bg}` 배경·`{colors.warning}` 아이콘) 3종이다 [src:16]. 좌측 아이콘 + 타이틀(bold) + 본문(detail 12px) 구조이며 코너 반경은 `{rounded.radius-m}`(8px)다 [src:16].

```tsx
<InfoBox variant="highlight" title="쿠폰 적용됨">
  최대 10%까지 중복 할인됩니다.
</InfoBox>
```

### popover

대상 옆에 떠서 보조 설명을 주는 팝오버다 — `{colors.text-primary}`(gray-900) 1px 보더와 동일 색 caret(꼬리)을 가지며 코너 반경은 `{rounded.radius-m}`(8px)다 [src:21]. 타이틀(bold) + 불릿 목록 + 우상단 닫기 버튼 구조이고 최대 폭 280px다 [src:21].

```tsx
<Popover title="스마일클럽 혜택">
  <Popover.Item>무료 배송 쿠폰</Popover.Item>
  <Popover.Item>적립 2배</Popover.Item>
</Popover>
```

### list-row

설정·메뉴 등 동일 위계 항목을 쌓는 리스트 행이다 — 행 최소 높이 48px, 하단 1px 디바이더(`{colors.bg-divider}`)로 구분한다 [src:19]. 좌측 아이콘(optional) + 타이틀 + 우측 보조 텍스트·chevron 구조이며, 보조 텍스트의 숫자는 `{colors.informative}`(blue-500)로 강조한다 [src:19].

```tsx
<List>
  <List.Row icon="bell" alert={<b>2</b>}>알림 설정</List.Row>
  <List.Row chevron>주문 내역</List.Row>
</List>
```

### banner

홈·카테고리 상단의 프로모션 배너다 — 기본 배경은 `{colors.positive-bg}`(green-50), 좌측 텍스트(타이틀 `{typography.font-heading}` + 서브타이틀 detail) + 우측 56px 썸네일 구조다 [src:10]. 코너 반경은 `{rounded.radius-l}`(12px)다 [src:10].

```tsx
<Banner thumbnail="/promo.png">
  <Banner.Title>스마일클럽 7일 무료</Banner.Title>
  <Banner.Subtitle>지금 가입하고 혜택 받기</Banner.Subtitle>
</Banner>
```

### slide-indicator

슬라이드/캐러셀의 현재 위치 표시 2종이다 [src:24]. **Dots**는 6px 원형이며 활성 dot만 `{colors.green-500}`로 칠한다 [src:24]. **Number Indicator**는 black 40% 배경의 pill에 `현재/전체`를 모노스페이스로 표기한다(예: `3/12`) [src:24].

```tsx
<SlideDots total={5} active={2} />
<SlideCounter current={3} total={12} />
```

### section-heading

템플릿 섹션 상단의 헤딩 컴포넌트다 — 타이틀(`{typography.font-heading}`, 20px 또는 18px)과 우측 보조 액션(`{component.button-action}` 전체보기 등)을 한 행에 배치한다 [src:15]. 타이틀은 명사형으로 짧게(1~2줄) 쓰고 서술형 문장은 쓰지 않는다 [src:15].

```tsx
<SectionHeading action={<ActionButton icon="chevron-right">전체보기</ActionButton>}>
  오늘의 추천
</SectionHeading>
```

## Do's and Don'ts

**Do** raw 색상 10단계를 표면에 직접 흩뿌리지 말고, `{colors.green-500}`, `{colors.text-cto}`, `{colors.bg-white}`, `{colors.warning}` 같은 시맨틱 토큰으로 의도를 먼저 표현한다 — GDS는 "Hex Code보다 컬러명 사용"을 명시한다 [src:29].

**Do** 전환 동선 버튼은 `{component.button-cta}`로 구현하고 레이블을 동선에 맞게 고정한다 — 상품 상세는 `구매하기`, 주문서는 `결제하기`이며, 주문과 결제는 다른 의미이므로 `주문하기`로 합치지 않는다 [src:11].

**Do** 가격과 할인율 숫자는 `{typography.font-heading}`(Gmarket Sans)로 고정 렌더한다 — 그 외 숫자는 OS별 시스템 폰트를 쓴다 [src:32].

**Do** 할인 전 원가는 텍스트 스타일 취소선과 `{colors.text-tertiary}`로, 일시품절은 가격 위치를 'SOLD OUT'(대문자, Gmarket Sans Bold, `{colors.gray-500}`)으로 대체한다 [src:17][src:32].

**Do** 세 블루를 역할에 맞게 구분해서 쓴다 — 전환 동선은 `{colors.cta}`, 별점·신뢰 정보는 `{colors.blue-500}`, 아이템 카드의 공식 브랜드 라벨은 `{colors.blue-800}`이며, 세 토큰을 하나로 병합하지 않는다 [src:2][src:29][src:17].

**Do** primary 액션·선택(selected) 상태의 중립색으로 `{colors.text-primary}`(gray-900)를 쓴다 — primary 버튼·기본 필터칩 active·탭 Selection Indicator·라디오 단일선택이 gray-900이고, `{colors.green-500}`은 positive/active-state(쿠폰·체크박스 checked·토글 on·바텀 내비 활성·curation 칩)에 예약한다. gray-900(선택/primary)·green(positive)·`{colors.cta}`(전환) 셋을 섞지 않는다 [src:11][src:22].

**Do** 검색 결과 페이지의 광고 표기는 'AD'가 아닌 한글 '광고' 라벨로 노출한다 — 소비자 오인 가능성이 높은 검색 맥락의 한국 시장 규칙이다 [src:15][src:18].

**Don't** 공개된 컴포넌트 목록에 없는 HeroCard, PromoBanner 같은 이름을 GDS 컴포넌트처럼 만들지 않는다 [src:7].

**Don't** 다크 모드 토큰을 추정해서 만들지 않는다 — GDS v1.3.0은 라이트 모드 전용이며 공개된 다크 팔레트가 없다 [src:29][src:34].

**Don't** 색상 값을 hex로 다시 적지 않는다 — 이 카탈로그의 정규 표현은 OKLCH이며, Gmarket Green은 UI 토큰 기준 `{colors.green-500}`(#00C400 환산)이지 인쇄 규정값 #00C01E가 아니다 [src:2][src:29].

**Don't** 명확한 정보 전달 UI를 Gmarket Sans Bold로 채우지 않는다 — Bold는 Medium 대비 직관성이 낮아 프로모션 강조 한정이며, 본문에는 Gmarket Sans 자체를 쓰지 않는다 [src:32].

**Don't** "혁신적", "차세대" 같은 마케팅 수사로 UI 카피를 채우지 않는다 — 헤딩·다이얼로그 Title은 명사형으로 간단·명료하게 쓰고, 에러 메시지는 '-하세요'에 마침표를 붙인다(서술형·'-하기' 형 금지) [src:8][src:13][src:26].

**Don't** 강한 드롭섀도·글래스·블러로 표면을 부양시키지 않는다 — 그림자 토큰은 모두 미세하고, 표면 분리는 옅은 그림자와 1px 디바이더가 담당한다 [src:35].

**Don't** 지마켓의 e커머스 도메인(상품 탐색·`{component.item-card-gallery}`·장바구니·`{component.button-cta}`의 구매/결제 전환 동선)을 성격이 다른 제품에 그대로 이식하지 않는다 — 차용할 것은 시각 언어(의도적 3-블루 역할 분리·Gmarket Sans의 헤딩·가격 한정 사용·라운드 단계 ladder·1px 디바이더 위주의 절제된 표면 분리)이지 지마켓의 커머스 도메인이 아니다 [src:11][src:17].

## Responsive Behavior

| Context | Key Changes |
| --- | --- |
| Baseline viewport | GDS는 모바일 우선 시스템이며 좁은 화면을 기준 컨텍스트로 본다 — 모바일 테스트 기준 폭은 360px, 최대 375px(iPhone 11 Pro)다 [src:35]. |
| Published breakpoint system | 공개 조사 범위에서 명시적 breakpoint 토큰 시스템은 surfaced되지 않았다 (no published breakpoint system surfaced) — PC 웹 레이아웃 분기는 제품 구현 쪽에서 별도 정의해야 한다 [src:35][src:33]. |
| Bottom navigation | `{component.bottom-navigation}`는 표면별로 아이콘 수가 다르다 — 앱은 5개 고정, 모바일 웹은 Smilehome을 빼고 4개다 [src:20]. |
| Touch target | 아이콘 터치 영역은 최소 48×48px(약 9mm), 권장 7–10mm다 — 버튼 Tiny는 최소 높이 28px 미만이면 터치 이슈로 사용을 지양한다 [src:30][src:11]. |
| Item card scaling | `{component.item-card-gallery}`의 썸네일은 Large 180×180 / Medium 128×128 / Small 104×104로 단계화되어, 화면 폭과 그리드 밀도에 따라 사이즈를 내린다 [src:17]. |
| Docked CTA | 풀위드 `{component.button-cta}`는 좌우 마진 16px 고정이되 키패드 결합 시 마진 0px로 붙고, 뒤에 `elev-docked-btn` 배경 그림자가 깔린다 [src:11][src:34]. |
| Sheet 기반 노출 | `{component.bottom-sheet}` Draggable은 Half가 기본이고 핸들로 Full까지 확장해, 좁은 화면의 단계적 정보 노출을 담당한다 [src:23]. |

## Known Gaps

- **다크 모드 미공개.** GDS v1.3.0은 라이트 모드 전용이며, 모든 표면·그림자 토큰의 다크 대응값이 공개되지 않았다 — 다크 테마가 필요하면 다운스트림에서 별도 정의해야 한다 [src:29][src:34].
- **헤딩 weight — canonical은 Medium(500).** 공식 타이포그래피 표는 Heading 1~4를 Regular(400)로 기재하나, canonical 번들이 Medium(500)으로 확정했고 이 문서 토큰 블록도 500을 따른다 — 원 표기 400을 함께 기록한다 [src:32][src:34].
- **Gmarket Green hex 불일치.** 디자인 시스템 토큰(foundation)은 `#00C400`, 브랜드 인쇄/온라인 규정 표는 `#00C01E`로 표기한다 — 이 문서는 UI 토큰 기준값 `#00C400`을 채택했으나 두 1차 소스 간 불일치 자체는 미해소다 [src:2][src:29].
- **자간 토큰 부재.** 줄 높이는 canonical 번들이 정의했으나(tight 1.25 / normal 1.45 / relaxed 1.6), letter-spacing 토큰은 여전히 공개 자료에 surfaced되지 않았다 [src:32].
- **OKLCH 변환값.** 모든 색상은 공개 hex 토큰을 OKLCH로 변환한 것이며, 원본 시스템은 hex로 게시한다 — 미세한 변환 오차가 있을 수 있다 [src:29][src:34].

## References

1. https://gds.gmarket.co.kr/
2. https://gds.gmarket.co.kr/brand/colors
3. https://gds.gmarket.co.kr/brand/logos
4. https://gds.gmarket.co.kr/brand/notation
5. https://gds.gmarket.co.kr/brand/typeface
6. https://gds.gmarket.co.kr/brand/values
7. https://gds.gmarket.co.kr/components
8. https://gds.gmarket.co.kr/components/accordions
9. https://gds.gmarket.co.kr/components/badges
10. https://gds.gmarket.co.kr/components/banners
11. https://gds.gmarket.co.kr/components/buttons
12. https://gds.gmarket.co.kr/components/chips
13. https://gds.gmarket.co.kr/components/dialogs
14. https://gds.gmarket.co.kr/components/dropdowns
15. https://gds.gmarket.co.kr/components/heading
16. https://gds.gmarket.co.kr/components/info-boxes
17. https://gds.gmarket.co.kr/components/item-cards
18. https://gds.gmarket.co.kr/components/labels
19. https://gds.gmarket.co.kr/components/lists
20. https://gds.gmarket.co.kr/components/navigation
21. https://gds.gmarket.co.kr/components/popovers
22. https://gds.gmarket.co.kr/components/selection-controls
23. https://gds.gmarket.co.kr/components/sheets
24. https://gds.gmarket.co.kr/components/slides
25. https://gds.gmarket.co.kr/components/tabs
26. https://gds.gmarket.co.kr/components/text-fields
27. https://gds.gmarket.co.kr/components/thumbnails
28. https://gds.gmarket.co.kr/foundation
29. https://gds.gmarket.co.kr/foundation/color
30. https://gds.gmarket.co.kr/foundation/iconography
31. https://gds.gmarket.co.kr/foundation/spacing
32. https://gds.gmarket.co.kr/foundation/typography
33. https://gds.gmarket.co.kr/overview/introduction
34. https://gds.gmarket.co.kr/foundation
35. https://gds.gmarket.co.kr/
