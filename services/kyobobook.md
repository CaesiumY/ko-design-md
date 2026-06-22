---
name: 교보문고
design_system_name: Kyobo Design System (KDS)
slug: kyobobook
category: commerce
last_updated: 2026-05-30
sources:
  - https://design.kyobobook.co.kr/voice/
  - https://design.kyobobook.co.kr/brand/principle/
  - https://design.kyobobook.co.kr/foundation/color/
  - https://design.kyobobook.co.kr/component/avatar/
  - https://design.kyobobook.co.kr/component/button/
  - https://design.kyobobook.co.kr/component/chip/
  - https://design.kyobobook.co.kr/component/tab/
  - https://design.kyobobook.co.kr/component/bubble/
  - https://design.kyobobook.co.kr/component/pagination/
  - https://design.kyobobook.co.kr/component/stepper/
  - https://design.kyobobook.co.kr/component/checkbox/
  - https://design.kyobobook.co.kr/component/input/
  - https://design.kyobobook.co.kr/component/dropdown/
  - https://design.kyobobook.co.kr/brand/logo/
  - https://design.kyobobook.co.kr/foundation/layout/
  - https://design.kyobobook.co.kr/foundation/iconography/
  - https://design.kyobobook.co.kr/foundation/typography/
  - https://design.kyobobook.co.kr/foundation/object-style/
  - https://design.kyobobook.co.kr/component/badge/
  - https://design.kyobobook.co.kr/component/bottom-sheet/
  - https://design.kyobobook.co.kr/component/loading/
  - https://design.kyobobook.co.kr/component/navigation/
  - https://design.kyobobook.co.kr/component/radio-button/
  - https://design.kyobobook.co.kr/component/thumbnail/
  - https://design.kyobobook.co.kr/component/toast/
  - https://design.kyobobook.co.kr/component/tooltip/
related_services:
  - 11st
  - gmarket
lang: ko
logo: https://getdesign.kr/logos/kyobobook.png
---

# Kyobo Design System (KDS) — design.md

## Brand & Style

Kyobo Design System(KDS)은 교보문고의 디자인 시스템이며, 브랜드명(교보문고 / KYOBO Book Centre)과 디자인 시스템명은 별개의 이름이다 [src:2]. 교보문고는 1980년 설립된 한국 최대 서점 체인으로, 오프라인 서점·온라인 서점·전자책(sam / 교보 eBook)과 라이프스타일 리테일 서브브랜드 핫트랙스(Hottracks)를 아우르는 옴니채널 커머스 사업자다 [src:2].

시스템이 표방하는 북극성은 "Minimalist, readable design"이다 — 트렌디함을 덜어내고 가독성과 신뢰를 택하며, 데이터에 근거하고(Data-Driven) 학습이 거의 필요 없는 친숙한 UX를 지향한다 [src:2]. 시각 언어의 출발점은 "책을 읽는 것처럼 텍스트와 정보를 자연스러운 흐름으로 경험하게 한다"는 원칙이며, 콘텐츠가 페이지를 넘기듯 흐르는 reading-first 구조를 만든다 [src:2]. 불필요한 장식이 주의를 분산시키지 않도록 미니멀·고가독성을 우선하고, 고객 여정을 순환적(인입 → 탐색 → 주문 → 재방문)으로 전제해 플로우를 설계한다 [src:2].

표면 색은 화이트·아주 옅은 그레이 배경 위에 상품 이미지(책 표지)가 색을 공급하는 구조다 — 크롬(chrome)에는 그라데이션·텍스처·손그림 일러스트가 없고, 이미지는 표지 원본 그대로의 중립적·제품충실(true-to-product) 톤을 유지한다 [src:18]. 코어 액션 컬러가 periwinkle indigo 계열(`{colors.blue-700}`)이라 차갑지도 뜨겁지도 않은 중립적·지적인 인상을 준다 [src:3]. 아이콘은 깨끗하고 기하학적이지만 끝(endcap)과 꺾임(join)을 둥글게 처리해 친근함을 더한다 [src:16].

브랜드 보이스는 구어체(해요체)를 기본으로 고객을 두루 높이며, 부정문·정책 안내에서만 문어체(하십시오체)로 전환해 안정감과 신뢰를 준다 [src:1]. 이 한국어 존대 체계의 의도적 운용이 KDS의 톤을 규정하므로, 다운스트림 카피도 이 register를 전제로 작성하는 것이 시스템 의도에 맞는다 [src:1].

**KDS는 라이트 모드 우선이다.** 공개된 다크 팔레트가 없으며, 모든 표면 토큰은 흰색·옅은 그레이 배경을 전제로 한다 [src:3]. 다운스트림에서 다크 테마가 필요하다면 별도 제품 근거 위에서 정의해야 하며, 이 문서는 다크 토큰을 추정하지 않는다.

## Colors

KDS는 공식 Color 문서에서 100→900 톤 램프로 색을 게시하며, 코어 액션 색은 `blue-700`이다 [src:3]. 아래 값은 공개된 hex 토큰을 ko-design-md 표준에 맞게 OKLCH로 변환한 것이다 — 각 hue의 코어(700)와 brand·gray 값은 공식 문서·번들에서 명시적으로 확인되며, 100→900 사이 중간 단계는 번들이 코어 토큰으로부터 보간(interpolated)한 값임을 주석으로 표기한다 [src:3].

```yaml
# Brand identity — LOGO ONLY (화면 작업/액션 색으로 사용 금지)
brand-navy:  oklch(0.340 0.126 258)   # #003477 — KYOBO 워드마크
brand-green: oklch(0.670 0.188 141)   # #45B035 — 교보 새 마크

# Primary · Blue (core = blue-700, Informative/Accent)
blue-100: oklch(0.949 0.015 282)   # interpolated
blue-200: oklch(0.876 0.036 282)   # interpolated
blue-300: oklch(0.774 0.066 282)   # interpolated
blue-400: oklch(0.669 0.096 281)   # interpolated
blue-500: oklch(0.586 0.117 280)   # interpolated
blue-600: oklch(0.531 0.134 278)   # interpolated
blue-700: oklch(0.494 0.144 277)   # #5055B1 CORE — UI 기본 액션 / Informative / Accent
blue-800: oklch(0.423 0.126 277)   # #3F4391
blue-900: oklch(0.339 0.096 278)   # #2D3068

# Primary · Green (core = green-700, Positive/Success)
green-100: oklch(0.959 0.027 135)  # interpolated
green-200: oklch(0.904 0.066 136)  # interpolated
green-300: oklch(0.829 0.117 137)  # interpolated
green-400: oklch(0.756 0.161 138)  # interpolated
green-500: oklch(0.703 0.183 139)  # interpolated
green-600: oklch(0.662 0.188 139)  # #4DAC27 CORE (green-600 = green-700 동일 정의)
green-700: oklch(0.662 0.188 139)  # #4DAC27 CORE — Positive / Success / Accent
green-800: oklch(0.562 0.162 139)  # #3A8A1C
green-900: oklch(0.453 0.129 139)  # #2A6614

# Semantic · Red — Negative vs Hottracks (혼동 금지)
red-100: oklch(0.949 0.021 14)     # interpolated
red-200: oklch(0.857 0.062 15)     # interpolated
red-300: oklch(0.742 0.123 17)     # interpolated
red-400: oklch(0.643 0.185 22)     # interpolated
red-500: oklch(0.603 0.232 26)     # #EC1F2D — Negative (절제 사용)
red-600: oklch(0.571 0.216 26)     # #DA2128 — Hottracks primary (red-700)
red-700: oklch(0.571 0.216 26)     # #DA2128 — Hottracks primary
red-800: oklch(0.483 0.188 27)     # #B01219
red-900: oklch(0.384 0.147 26)     # #800D12

# Grayscale (50 → 900)
gray-50:  oklch(0.988 0.000 0)   # #FAFBFC
gray-100: oklch(0.970 0.003 265)   # #F4F5F7 — bg-subtle
gray-200: oklch(0.940 0.004 271)   # #EAEBEE
gray-300: oklch(0.912 0.006 265)   # #E0E2E6 — 1px divider / list line
gray-400: oklch(0.845 0.009 265)   # #C9CCD2
gray-500: oklch(0.737 0.012 264)   # #A6AAB2 — fg-tertiary
gray-600: oklch(0.615 0.015 262)   # #80858E
gray-700: oklch(0.434 0.014 264)   # #4D5159 — fg-secondary / 현재 페이지
gray-800: oklch(0.313 0.013 267)   # #2E3138
gray-900: oklch(0.231 0.010 268)   # #1B1D22 — fg / 기본 텍스트 / 선택된 chip
white: oklch(1.000 0.000 0)        # #FFFFFF
black: oklch(0.000 0.000 0)        # #000000

# Semantic roles (번들 매핑)
fg:           oklch(0.231 0.010 268)   # gray-900
fg-secondary: oklch(0.434 0.014 264)   # gray-700
fg-tertiary:  oklch(0.737 0.012 264)   # gray-500
fg-disabled:  oklch(0.845 0.009 265)   # gray-400
fg-on-accent: oklch(1.000 0.000 0)     # white
bg:           oklch(1.000 0.000 0)     # white
bg-subtle:    oklch(0.970 0.003 265)   # gray-100
bg-muted:     oklch(0.940 0.004 271)   # gray-200
border:       oklch(0.912 0.006 265)   # gray-300
border-strong: oklch(0.845 0.009 265)  # gray-400
accent:       oklch(0.494 0.144 277)   # blue-700 — primary action / informative
accent-press: oklch(0.423 0.126 277)   # blue-800 — pressed
positive:     oklch(0.662 0.188 139)   # green-600
negative:     oklch(0.603 0.232 26)    # red-500
hottracks:    oklch(0.571 0.216 26)    # red-600
```

색상 축은 periwinkle indigo `{colors.blue-700}`이며, 동일 hue를 800/900으로 단계화해 눌림·강조를 표현한다 [src:3]. 회색 램프는 아주 옅은 푸른 기가 도는 톤이라 흰 표면 위에서 차분하게 읽힌다 [src:3]. 의미색은 정보/강조 `{colors.blue-700}`, 성공 `{colors.green-700}`, 부정 `{colors.negative}`로 분리하며, 부정 빨강은 심각한 오류나 주의를 끌 때만 절제해서 쓴다 [src:3].

브랜드 식별 색 navy `oklch(0.340 0.126 258)`와 green `oklch(0.670 0.188 141)`는 **로고 전용**이다 — `KYOBO` 워드마크와 교보 새 마크에만 쓰고, 화면 기본 작업·액션 색으로 쓰지 않는다 [src:14]. 핫트랙스 빨강 `{colors.hottracks}`(red-600/700 동일 정의)는 서브브랜드 대표색이며, 의미상 부정(Negative) `{colors.negative}`(red-500)와 색·역할이 다르므로 혼동하지 않는다 [src:3].

보조 색상은 아이콘·태그·상태 배지·일러스트 등 보조 UI에만 쓰며, 쓸 때는 항상 코어 색 하나를 포함해 균형을 잡는다 [src:3]. Opacity 토큰(90~10)은 장식용 UI 전용이며 기능적 UI나 텍스트(비활성 제외)에는 쓰지 않고, 팔레트 색상 자체의 투명도는 조정할 수 없다 [src:3]. 접근성은 WCAG AA를 따라 24px 미만 일반 텍스트 4.5:1, 19px 미만 bold 4.5:1, 24px 초과 텍스트 3:1을 기준으로 하며, 의미 전달을 색에만 의존하지 않고 텍스트·아이콘을 병기한다 [src:3].

## Typography

KDS의 브랜드 타이포는 **국문 Noto Sans KR · 영문/숫자 Roboto** 조합이며, 한글 본문 가독성을 1차로 두는 한국형 구성이다 [src:17]. 전 스케일에 letter-spacing `-0.01em`를 적용하고, 가중치는 regular 400 / medium 500 / bold 700 3종을 쓴다 [src:17]. 타입스케일은 '권장'이라 디자이너가 가중치를 자유롭게 조합할 수 있으나, 12px 이하 폰트 크기는 사용을 권장하지 않는다(앱 환경은 10pt floor) [src:17].

```yaml
font-family: "Noto Sans KR", Roboto, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif
# 번들 폰트 스택은 영문/숫자 우선을 위해 Roboto를 앞에 둔다:
#   'Roboto', 'Noto Sans KR', -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif

letter-spacing: -0.01em

weight-regular: 400
weight-medium: 500
weight-bold: 700

# token (계열 / role) : size px / line-height px / weight
title-xl: 32 / 44 / 700   # h1
title-l:  28 / 38 / 700   # h2
title-m:  24 / 34 / 700   # h3
title-s:  20 / 30 / 700   # h4
title-xs: 18 / 28 / 700   # h5
text-xl:  16 / 24 / 400   # b1
text-l:   14 / 22 / 400   # b2
text-m:   12 / 18 / 400   # b3 (최소)
```

위계 패턴은 단순하다 — title 계열(h1~h5)은 bold(700), text 계열(b1~b3)은 regular(400)를 기본으로 하고, medium(500)은 강조가 필요한 본문·레이블에 끼워 쓴다 [src:17]. 본문 기본은 `{typography.text-xl}`(16/24), 보조·캡션은 `{typography.text-m}`(12/18)를 floor로 잡는다 [src:17]. 앱 환경에서는 iOS가 영문 SF Pro + 한글 Apple SD Gothic Neo(동적 타입 지원), Android가 영문 Roboto + 한글 Noto Sans로 분기하며, 공통 권장은 본문 16~18pt·캡션 10~12pt·타이틀 18~32pt다 [src:17].

> 참고: 이 카탈로그의 프리뷰 런타임은 한글 커버리지를 위해 Pretendard로 치환해 렌더링할 수 있으나, 브랜드 스펙의 정본은 Noto Sans KR + Roboto다 [src:17].

## Spacing

간격 체계는 **4의 배수**를 기본 단위로 한다 — `spacing-50`만 예외적으로 2px이며, 그 위로는 4px 케이던스를 따른다 [src:15]. 컴포넌트 간 간격에는 스페이싱 규칙 사용이 필수이고, 컴포넌트 내부 스페이싱은 권장 사항이다 [src:15].

```yaml
# spacing-{n} : px
spacing-50:   2    # 유일한 예외
spacing-100:  4
spacing-200:  8
spacing-300:  12
spacing-400:  16
spacing-500:  20
spacing-600:  24
spacing-700:  28
spacing-800:  32
spacing-900:  36
spacing-1000: 40
spacing-1100: 44
spacing-1200: 48
spacing-1300: 52
spacing-1400: 60   # 8px 점프 (4 배수 유지, 등차 아님)
spacing-1500: 72   # 12px 점프
```

작은 구간(2/4/8/12px)은 아이콘-레이블 간격이나 타이트한 컴포넌트 패딩을 다루고, 그 위로는 화면 단위 간격에 쓴다 [src:15]. `{spacing.spacing-1300}`(52px) 위로는 4 배수를 유지하되 등차가 아니라 8px·12px로 점프하므로, 큰 여백을 잡을 때 이 비등차 구간을 인지하고 토큰을 고른다 [src:15]. 체크박스·라디오의 아이콘-레이블은 `{spacing.spacing-100}`(4px), 컴포넌트 간은 `{spacing.spacing-300}`(12px), 썸네일 배치는 `{spacing.spacing-200}`(8px)를 기준으로 삼는다 [src:11][src:23].

## Rounded

코너 반경은 **4의 배수**만 지정하며, `round`는 구성요소 높이/너비의 50% 직경 원형에 쓴다 [src:18]. radius는 사이트 전반에 일관되게 적용된다 [src:18].

```yaml
# radius : px
radius-4:     4
radius-8:     8
radius-12:    12
radius-16:    16
radius-20:    20
radius-24:    24
radius-round: 9999   # 50% 원형 (번들 구현값)
```

카드·컨테이너는 차분하게 읽히도록 옅은 보더 + 부드러운 그림자로 처리하고, 무겁거나 컬러풀한 보더는 쓰지 않는다 [src:18]. 칩·Capsule 버튼처럼 완전히 둥근 형태에는 `{rounded.radius-round}`를 쓰고, 카드·시트류는 `{rounded.radius-12}`~`{rounded.radius-24}` 구간을 일관되게 적용한다 [src:18][src:5]. 전반적으로 기하적이되 모서리는 일관되게 부드럽다 [src:18].

## Elevation & Depth

KDS의 그림자는 3토큰으로 한정되며, 전부 부드럽고 아래 방향이다 [src:18]. 공개 소스는 그림자를 rgba alpha로 표기하므로, 아래에서는 ko-design-md 표준에 맞게 `oklch(L C H / alpha)` 형태로 alpha를 보존해 변환한다 [src:18].

```yaml
# offset-x offset-y blur spread  color(alpha 보존)
shadow-green-100: 0px 4px 8px 0px oklch(0.662 0.188 139 / 0.40)   # 모바일 하단 nav MY 아이콘
shadow-gray-100:  0px 5px 10px 0px oklch(0.000 0.000 0 / 0.10)    # MO/PC 탑버튼 · 상품상세 탭
shadow-gray-200:  0px 20px 40px 0px oklch(0.000 0.000 0 / 0.10)   # 도서상세 상품 썸네일
```

깊이 언어는 절제가 기본값이다 — 표면 분리는 대부분 1px `{colors.border}`(gray-300) 헤어라인과 옅은 그레이 배경 워시가 담당하고, 그림자는 특정 부양 요소에만 제한적으로 쓴다 [src:18]. `{component.navigation-bottom-my}`의 초록 MY 버튼에 적용되는 `shadow-green-100`은 브랜드 색을 그림자로 끌어와 시그니처를 만드는 유일한 컬러 섀도이며, 나머지 두 토큰은 검정 10% alpha의 중립 섀도다 [src:18][src:22]. 모션은 `cubic-bezier(0.4, 0.0, 0.2, 1)` ease에 duration-fast 150ms / duration-base 240ms를 쓰고, 토스트 dwell은 4000ms다 [src:1].

## Shapes

형태 언어는 정돈된 기하 구조 위에 4 배수 반경을 일관되게 얹는 방식이다 [src:18]. 칩과 Capsule 버튼은 완전한 원형(`{rounded.radius-round}`), 카드·시트는 12~24px 반경을 써서 접근하기 쉽되 질서 있는 인상을 만든다 — 유기적이라기보다 기하적이다 [src:18][src:5].

시각적 절제는 표면 처리에서 두드러진다 — 크롬에는 그라데이션·텍스처·손그림 일러스트가 없고, 색은 책 표지 이미지가 공급하며 배경은 흰색·옅은 그레이로 비운다 [src:18]. 곡선은 모서리 반경과 라인 아이콘의 둥근 endcap/join으로만 표현되고, 표면 구분은 곡면이나 강한 그림자가 아니라 1px 헤어라인과 배경 워시로 처리된다 [src:16][src:18]. 아이콘은 24×24px 키라인 그리드에 4px 패딩(아트워크는 안쪽 16px), 단일 균일 stroke·Center 정렬·둥근 caps/joins를 지키며, 하단 네비게이션에서만 특수 26px 사이즈를 쓴다 [src:16].

## Components

공식 문서에 18개 컴포넌트가 문서화되어 있다 [src:2]. 아래는 시스템의 시그니처 패턴을 변형·상태 단위로 분해한 것이며, 코드 식별자는 영어로 유지한다. 모든 색·간격·반경 참조는 `{group.name}` 토큰으로 가리킨다.

### button-primary

Button의 1차 위계로 페이지의 주 행동을 담당하며, fill 배경은 `{colors.accent}`(blue-700), 텍스트는 `{colors.fg-on-accent}`다 [src:5]. 한 영역에서는 하나의 행동만 유도하는 것이 원칙이다 [src:5]. 와이드 대응 시 Box 버튼의 width는 가변되지만(아이콘 버튼 제외), 양쪽 마진·버튼 간 간격값은 유지한다 [src:5].

```tsx
<Button hierarchy="primary" element="box" size="m">구매하기</Button>
```

### button-secondary

2차 위계로 1차보다 낮은 우선순위의 확정 행동에 쓴다 — 구조는 `{component.button-primary}`와 공유하되 색 위계를 낮춰 옅은 보더 + 중립 표면으로 읽히게 한다 [src:5]. 색만으로 위계를 전달하지 않으므로 레이블 동사를 명확히 둔다 [src:5].

```tsx
<Button hierarchy="secondary" element="box" size="m">장바구니 담기</Button>
```

### button-tertiary

가장 낮은 위계의 보조 행동용으로, 배경 없는 텍스트/아이콘 형태에 가깝게 처리한다 [src:5]. 누름 상태에서는 fill·tint를 어둡게 하며 bounce·scale 연출은 쓰지 않는다 [src:18].

```tsx
<Button hierarchy="tertiary" element="text" size="s">미리보기/듣기</Button>
```

### button-capsule

4가지 element pattern 중 하나인 Capsule은 아이콘을 필수로 동반하고, 반경은 최대값(`{rounded.radius-round}`)을 적용하며, filled container는 금지된다 [src:5]. CTA 카피는 두 가지 이상 선택을 슬래시(`/`)로 구분하고 공백 포함 12자를 넘기지 않는다 [src:1].

```tsx
<Button element="capsule" icon={<Icon name="heart" />}>찜하기</Button>
```

### chip-basic

필터용 칩으로, 선택 시 `{colors.gray-900}` 톤으로 강조한다 — 레이블은 최대 20자 + 말줄임이며 두 줄로 감싸지 않는다 [src:6][src:3]. 의미를 색에만 의존하지 않으므로 선택 상태는 텍스트 대비로도 구분된다 [src:3].

```tsx
<Chip type="basic" selected>국내도서</Chip>
```

### chip-input

태그화·삭제가 가능한 입력형 칩으로, 삭제 아이콘을 동반한다 [src:6]. 한 줄 레이블 원칙과 20자 상한은 basic과 동일하다 [src:6].

```tsx
<Chip type="input" onRemove={onRemove}>에세이</Chip>
```

### chip-anchor

구역 이동(스크롤 점프)을 담당하는 앵커형 칩이다 — 즉시 동작을 실행하지 않고 페이지 내 위치로 이동시킨다 [src:6].

```tsx
<Chip type="anchor" href="#reviews">리뷰</Chip>
```

### chip-action

즉시 동작을 실행하는 액션형 칩으로, anchor와 달리 클릭 시 기능을 바로 수행한다 [src:6].

```tsx
<Chip type="action" onClick={onApply}>필터 적용</Chip>
```

### bottom-sheet-standard

기본 콘텐츠를 보완하는 시트로, 상호작용 중에도 계속 표시된다 — 시트를 띄운 채 기본 콘텐츠와 함께 다룰 수 있다 [src:20]. 주로 모바일에서 쓰며 상단 코너에 `{rounded.radius-16}`~`{rounded.radius-24}` 구간 반경을 적용한다 [src:20][src:18].

```tsx
<BottomSheet variant="standard">{/* 보조 콘텐츠 */}</BottomSheet>
```

### bottom-sheet-modal

해제해야 기본 콘텐츠와 상호작용할 수 있는 모달형 시트다 — 딤 위에 떠 사용자의 처리를 강제한다 [src:20]. standard와 구조를 공유하되 모달 동작이 추가된다 [src:20].

```tsx
<BottomSheet variant="modal" onDismiss={close}>{/* 필수 처리 */}</BottomSheet>
```

### navigation-bottom-my

모바일 하단 네비게이션은 아이콘 + MY 버튼으로 구성되며, 일반 아이콘은 특수 26px 사이즈를 쓴다 [src:22]. 시그니처 요소는 그림자가 적용된 초록 **MY(User menu)** 버튼이다 — Avatar XLarge에 해당하는 55×55px 아바타에 `shadow-green-100`을 얹어 브랜드 색을 그림자로 강조하며, 이 크기는 모든 기기에 동일하게 적용된다 [src:22][src:4].

```tsx
<BottomNav>
  <BottomNav.Item icon="home" />
  <BottomNav.MyButton avatarSize={55} shadow="green-100" />
</BottomNav>
```

### navigation-top

상단 네비게이션은 중앙 타이틀과 좌우 각 최대 2개 아이콘으로 구성된다 [src:22]. 좁은 화면에서 상단 액션이 넘치지 않도록 좌우 아이콘 수가 제한된다 [src:22].

```tsx
<TopNav left={[<BackIcon />]} title="도서 상세" right={[<CartIcon />, <SearchIcon />]} />
```

### loading

교보문고 4가지 아이덴티티 컬러로 구성된 원형 모션 + **반시계 방향** 스피너이며, 90도 기준으로 회전한다 [src:21]. 예상 대기가 1초 이상(2~5초)일 때만 노출하고, 콘텐츠 중앙에 1개만 둔다 [src:21].

```tsx
<Loading visible={pending} /> {/* 4-color ring, counter-clockwise, center only */}
```

### badge-basic

상태·정보 표기용 기본 배지로, 높이 22px 고정·좌우 여백 4px·가로값은 짝수로 둔다 [src:19]. 색은 보조 팔레트를 쓰되 코어 색 하나와 균형을 맞춘다 [src:19][src:3].

```tsx
<Badge type="basic">예약판매</Badge>
```

### badge-intermediate

basic보다 한 단계 강조된 배지로, 좌우 여백을 6px로 둔다 [src:19]. 높이 22px·짝수 가로값 원칙은 동일하다 [src:19].

```tsx
<Badge type="intermediate">NEW</Badge>
```

### badge-special

베스트셀러·순위·광고 등 특수 맥락에 쓰는 배지다 — 순위·프로모션처럼 강한 강조가 필요한 라벨에 배정한다 [src:19].

```tsx
<Badge type="special" rank={1}>베스트셀러</Badge>
```

### thumbnail

도서 커머스 고유 케이스를 담는 썸네일로 Book / eBook / Hottracks 변형이 있다 [src:24]. 이미지 없음, 19세 이상(이미지 미노출·"19" 표기), 세트도서 케이스가 명시적으로 정의되어 있으며, 도서상세의 상품 썸네일에는 `shadow-gray-200`을 적용한다 [src:24][src:18].

```tsx
<Thumbnail kind="book" cover={url} adult19={false} />
```

### input

Text field / Text area 두 형태이며 상태 7종(Default / Focused / Filled / Disabled / Error / Success / Autocomplete)을 가진다 [src:12]. 높이는 고정·폭 가변이며 L(H50, MO 전용) / M(H44, PC 전용) / S(H38)로 기기를 구분한다 [src:12]. Error 상태는 `{colors.negative}`로 표기하되 색만으로 의미를 전하지 않고 보조 텍스트를 병기한다 [src:12][src:3].

```tsx
<Input field="text" state="error" size="l" helperText="필수 입력 항목입니다" />
```

## Do's and Don'ts

**Do** raw 색상 램프를 표면에 직접 흩뿌리지 말고, `{colors.accent}`·`{colors.fg}`·`{colors.bg}`·`{colors.border}` 같은 시맨틱 토큰으로 의도를 먼저 표현한다 [src:3].

**Do** 표면 분리는 강한 그림자보다 1px `{colors.border}`(gray-300) 헤어라인과 옅은 그레이 배경 워시로 먼저 해결한다 — KDS의 깊이 언어는 절제가 기본값이다 [src:18].

**Do** 한 영역에는 하나의 1차 행동만 두고, Button은 `hierarchy`·`element`·`size`를 명시해 구현한다 [src:5].

**Do** 의미를 색에만 의존하지 않고 텍스트·아이콘을 병기하며, WCAG AA 대비(본문 4.5:1)를 핸드체크한다 [src:3].

**Do** CTA 카피는 동작 동사(`-하기`/`-보기`)로 명확히 제시하고 두 가지 이상 선택은 슬래시(`/`)로 구분하며, 공백 포함 12자를 넘기지 않는다 [src:1].

**Don't** 브랜드 식별 색 navy `{colors.brand-navy}`·green `{colors.brand-green}`를 화면 기본 작업·액션 색으로 쓰지 않는다 — 이 둘은 로고 전용이며, 액션 색은 `{colors.accent}`(blue-700)다 [src:14].

**Don't** 핫트랙스 빨강 `{colors.hottracks}`(red-600/700)와 부정 빨강 `{colors.negative}`(red-500)를 혼동하지 않는다 — 서브브랜드 대표색과 오류 의미색은 역할이 다르다 [src:3].

**Don't** 공개된 18개 컴포넌트 목록에 없는 이름을 KDS 컴포넌트처럼 만들지 않는다 [src:2].

**Don't** 크롬에 그라데이션·텍스처·손그림 일러스트를 넣거나 무겁고 컬러풀한 보더를 쓰지 않는다 — 색은 책 표지 이미지가 공급하고 배경은 비워 둔다 [src:18].

**Don't** 이모지를 UI 의미 전달 수단으로 쓰지 않는다 — KDS는 이모지를 시스템 구성요소로 두지 않으며, 의미는 텍스트 + 아이콘으로 전한다 [src:1].

**Don't** 교보문고의 서점·커머스 도메인 개념(도서상세 플로우, 핫트랙스 멀티브랜드 빨강 시스템, 썸네일의 19세 이상·세트도서 규칙, sam/eBook 리더 표면)을 성격이 다른 제품에 그대로 이식하지 않는다 — 차용할 것은 시각 언어(차분한 미니멀 reading-first 표면, `{colors.accent}` blue-700 액션 색, Noto Sans KR + Roboto 위계, 부드러운 그림자 + 1px `{colors.border}` 헤어라인, 둥근 라인 아이콘, 4px 간격·반경 리듬)이지 교보문고의 서점 제품 개념이 아니다 [src:24][src:3].

**Don't** 디자인시스템 이름 자체(`Kyobo Design System`·`KDS` 워드마크)를 생성하는 제품 UI의 헤더·타이틀·버튼·라벨에 넣지 않는다 — 차용할 것은 시각 언어이지 시스템 이름이 아니다. UI 텍스트·네이밍은 자기 제품 브랜드로 재정의하고, 출처 표기가 필요하면 footer attribution에만 둔다.

## Responsive Behavior

KDS는 모든 화면 크기에서 일정한 6/12열 그리드를 유지하되, **뷰포트 폭에 따라 유체적으로 흐르는 반응형이 아니라 User-Agent 기반 적응형(adaptive)**으로 PC 뷰/모바일 뷰를 분기한다 [src:15]. 폭이 아니라 기기 종류로 레이아웃이 갈리는 점이 distinctive하다.

| Context | Key Changes |
| --- | --- |
| 분기 방식 | PC/MO 디바이스 기준 User-Agent로 분기한다 — fluid-responsive가 아니므로, **저해상도 PC(13인치 맥북 1440×900)에서도 PC 화면**이, **고해상도 태블릿(아이패드 프로 1024×1366)에서는 모바일 화면**이 표시된다 [src:15]. |
| 그리드 | 모든 화면에서 6/12열 그리드를 유지한다 [src:15]. |
| Tab | Primary tab(PC)은 한 줄당 3~6개, Primary tab(MO)은 3~4개 이하 원칙이며 tab width는 container 기준 1/n이다 [src:7]. |
| Pagination | 모바일에서는 Number pagination 대신 '더보기' 버튼 형태를 쓴다 [src:9]. |
| Input/Dropdown 높이 | L(H50, MO 전용) / M(H44, PC 전용) / S(H38)로 높이를 고정하고 MO·PC를 구분한다 [src:12][src:13]. |
| Toast 위치 | Bottom(MO) / Center(PC)로 분기한다 [src:25]. |
| Tooltip | 모바일에서는 디테일 툴팁 대신 항상 팝업으로 대체한다 [src:26]. |
| Dropdown Focused | Focused 상태는 PC 전용이며, 모바일은 시스템 UI를 쓴다 [src:13]. |
| 와이드 대응 | Box 버튼 width는 가변되지만(아이콘 버튼 제외) 양쪽 마진·버튼 간 간격값은 유지한다 [src:5]. |

터치 타깃 단서로, 입력류 모바일 높이는 50px(H50), 하단 네비게이션 아이콘은 특수 26px, MY(User menu) 아바타는 모바일 하단 네비에서 55×55px로 모든 기기에 동일 적용된다 [src:12][src:22][src:4]. 명시적 px 단위 breakpoint 토큰 시스템은 공개 조사 범위에서 surfaced되지 않았다 (no published breakpoint system surfaced) — 분기는 폭이 아닌 User-Agent로 처리된다 [src:15].

## Known Gaps

- **램프 중간 단계는 보간값.** 각 hue의 코어(700)와 brand·gray 값만 공식 토큰으로 확인되며, 100→900 사이 중간 단계는 번들이 코어로부터 보간한 값이다 — `interpolated` 주석이 붙은 단계는 정밀 매칭이 필요하면 원본 문서를 재확인해야 한다 [src:3].
- **아이콘은 raster 스펙만 공개.** 공개된 오픈 아이콘 폰트/SVG 스프라이트가 없어, 다운스트림은 Lucide 같은 라인 아이콘(24px 그리드·균일 stroke·둥근 caps/joins)을 stand-in으로 쓰고 공식 SVG 확보 시 교체해야 한다 [src:16].
- **그림자는 rgba → OKLCH 변환.** 공개 shadow 토큰은 rgba alpha로 표기되며, 이 문서는 alpha를 보존해 `oklch(L C H / alpha)`로 변환했다 — 미세한 변환 오차가 있을 수 있다 [src:18].
- **다크 팔레트 미공개.** 공개된 다크 토큰이 없어 라이트 모드 우선으로 다룬다 — 다크 테마가 필요하면 다운스트림에서 별도 근거 위에 정의해야 한다 [src:3].
- **OKLCH 변환값.** 모든 색상은 공개 hex 토큰을 OKLCH로 변환한 것이며, 원본 시스템은 hex로 게시한다 [src:3].

## References

1. https://design.kyobobook.co.kr/voice/
2. https://design.kyobobook.co.kr/brand/principle/
3. https://design.kyobobook.co.kr/foundation/color/
4. https://design.kyobobook.co.kr/component/avatar/
5. https://design.kyobobook.co.kr/component/button/
6. https://design.kyobobook.co.kr/component/chip/
7. https://design.kyobobook.co.kr/component/tab/
8. https://design.kyobobook.co.kr/component/bubble/
9. https://design.kyobobook.co.kr/component/pagination/
10. https://design.kyobobook.co.kr/component/stepper/
11. https://design.kyobobook.co.kr/component/checkbox/
12. https://design.kyobobook.co.kr/component/input/
13. https://design.kyobobook.co.kr/component/dropdown/
14. https://design.kyobobook.co.kr/brand/logo/
15. https://design.kyobobook.co.kr/foundation/layout/
16. https://design.kyobobook.co.kr/foundation/iconography/
17. https://design.kyobobook.co.kr/foundation/typography/
18. https://design.kyobobook.co.kr/foundation/object-style/
19. https://design.kyobobook.co.kr/component/badge/
20. https://design.kyobobook.co.kr/component/bottom-sheet/
21. https://design.kyobobook.co.kr/component/loading/
22. https://design.kyobobook.co.kr/component/navigation/
23. https://design.kyobobook.co.kr/component/radio-button/
24. https://design.kyobobook.co.kr/component/thumbnail/
25. https://design.kyobobook.co.kr/component/toast/
26. https://design.kyobobook.co.kr/component/tooltip/
