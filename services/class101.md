---
name: 클래스101
design_system_name: Vibrant
slug: class101
category: education
last_updated: "2026-07-04"
sources:
  - https://vibrant-design.com/
  - https://vibrant-design.com/docs/theme/colors/color-token/
  - https://www.npmjs.com/package/@vibrant-ui/theme
  - https://github.com/pedaling/opensource
  - https://class101.net/ko
  - https://class101.net/
  - https://class101.ghost.io/ceo-mission-culture/
  - https://medium.com/class101/%EA%B5%AC%EB%8F%85%EA%B3%BC-%ED%95%A8%EA%BB%98-%EC%99%84%EC%A0%84%ED%9E%88-%EC%83%88%EB%A1%9C%EC%9B%8C%EC%A7%84-%ED%81%B4%EB%9E%98%EC%8A%A4101-b1beb363aa91
  - https://vibrant-storybook.class101.dev/
  - https://vibrant-design.com/docs/getting-started/installation/
  - https://vibrant-design.com/docs/getting-started/internationalization/
  - https://vibrant-design.com/docs/contribution/code-base/
  - https://vibrant-design.com/docs/contribution/develope-principle/
  - https://vibrant-design.com/docs/migration/migration-from-ui-system/
  - https://vibrant-design.com/docs/system-props/introduce/
  - https://vibrant-design.com/docs/system-props/spacing/
  - https://vibrant-design.com/docs/system-props/border/
  - https://vibrant-design.com/docs/system-props/typography/
  - https://vibrant-design.com/docs/components/vibrant-component/contained-button/
  - https://vibrant-design.com/docs/components/vibrant-component/filter-chip/
  - https://vibrant-design.com/docs/components/vibrant-component/text-field/
  - https://vibrant-design.com/docs/components/vibrant-component/toast/
  - https://vibrant-design.com/docs/components/vibrant-component/tooltip/
  - https://vibrant-design.com/docs/components/vibrant-component/callout/
  - https://vibrant-design.com/docs/components/vibrant-component/modal-bottom-sheet/
  - https://vibrant-design.com/docs/components/vibrant-component/dropdown/
  - https://vibrant-design.com/docs/components/vibrant-component/top-bar/
  - https://vibrant-design.com/docs/components/vibrant-component/grid-list/
  - https://vibrant-design.com/docs/components/vibrant-component/body/
  - https://vibrant-design.com/docs/components/vibrant-icons/icons/
  - https://vibrant-design.com/docs/components/vibrant-motion/motion/
  - https://vibrant-design.com/docs/components/vibrant-component/breadcrumbs/
  - https://vibrant-design.com/docs/components/vibrant-component/table/
  - https://vibrant-design.com/docs/components/vibrant-component/table-header/
  - https://vibrant-design.com/docs/components/vibrant-component/image-thumbnail/
  - https://vibrant-design.com/docs/components/vibrant-component/skeleton/
  - https://vibrant-design.com/docs/components/vibrant-component/avatar/
  - https://vibrant-design.com/docs/components/vibrant-component/divider/
  - https://vibrant-design.com/docs/components/vibrant-component/spinner/
  - https://github.com/pedaling/class101-ui
  - https://vibrant-design.com/docs/components/vibrant-component/paper/
  - https://vibrant-design.com/docs/components/vibrant-component/outlined-button/
  - https://vibrant-design.com/docs/components/vibrant-component/ghost-button/
  - https://vibrant-design.com/docs/components/vibrant-component/icon-button/
  - https://vibrant-design.com/docs/components/vibrant-component/slider/
  - https://vibrant-design.com/docs/components/vibrant-component/scroll-tabs-layout/
  - https://vibrant-design.com/docs/components/vibrant-component/view-pager-tab-group/
related_services: []
lang: ko
logo: https://getdesign.kr/logos/class101.png
---

# 클래스101 — design.md

> 클래스101(CLASS101)은 크리에이터가 온라인 클래스를 열고 수익을 얻는 클래스 플랫폼이며 [src:7], 그 공개 디자인 시스템이 **Vibrant Design System(VDS)** 이다 [src:1]. React DOM과 React Native를 단일 `<VibrantProvider>`로 감싸는 크로스플랫폼 오픈소스 모노레포로 개발된다 [src:12][src:10][src:4].

## Brand & Style

클래스101은 취미부터 커리어까지 25개 카테고리의 온라인 클래스를 다루는 플랫폼으로, 2022년 8월 말 "클래스101+"라는 이름의 월 구독 모델(25개 카테고리 무제한 수강)로 전환했다 [src:8]. 영문 사이트가 CLASS101+ 브랜드로 운영되는 글로벌 서비스이고 [src:6], 컴포넌트 내장 텍스트의 기본 언어는 한국어이며 `ConfigProvider`가 한국어·영어·일본어 번역 사전을 제공한다 — 한국어 우선에 글로벌 확장을 얹은 구조가 시스템 레벨에 새겨져 있다 [src:11]. 브랜드의 축은 크리에이터 이코노미 서사다: 크리에이터의 콘텐츠가 정당한 가치를 받는 생태계 지속가능성을 2018년부터 명문화해 왔다 [src:7].

Vibrant Design System은 "Class101의 사용자들이 보다 일관적인 서비스를 경험하기 위하여 효율적이고 우수한 성능의 프로덕트를 제작할 수 있도록 고안된 시스템"으로 [src:1], Performant·Productive·Consistent 세 가치를 내건다 [src:1]. GitHub org Pedaling(101 Inc.)의 공개 모노레포(MIT, TypeScript, Nx)에서 개발되며 [src:4], 스타일 없는 코어(`@vibrant-ui/core`: Box·ScrollBox·Text) 위에 `@vibrant-ui/components`·`@vibrant-ui/icons`·`@vibrant-ui/theme`을 얹는 계층 구조다 [src:12][src:3]. 웹과 네이티브 앱이 같은 `<VibrantProvider>` 아래에서 같은 토큰을 공유한다 [src:12][src:10]. 전신은 `@class101/ui-system`(공식 마이그레이션 가이드 제공)이고 [src:14], 그보다 앞 세대의 공개 React UI 라이브러리 `class101-ui`도 존재한다 [src:40].

시각 언어는 단일 히어로 컬러의 절제로 요약된다. 채도 높은 오렌지 하나를 무채색 그레이스케일 위에 얹고, 버튼·배지·강조를 전부 같은 오렌지로 수렴시킨다 [src:2][src:9]. 표면은 백색 기본에 5%/10% 반투명 검정 헤어라인으로 구획을 조용히 처리하는 플랫 필 중심이며, 그라데이션·텍스처는 시스템 장치로 쓰이지 않는다 [src:2]. 다크 모드는 1급 시민이다 — 92개 시맨틱 토큰 전부가 다크 오버라이드를 내장하고 [src:3], 구독 리뉴얼과 함께 제품에 도입됐다 [src:8]. 무드는 교육 플랫폼이되 취미·라이프스타일의 경쾌함을 지향하며, 제품 원칙은 "복잡하지 않고 직관적으로 이해할 수 있도록 최소한의 기능을 유지", "콘텐츠로 가치를 느낄 수 있게"를 명문화한다 [src:8]. 이모지는 마케팅 순간(공식 사이트 코어 밸류 카드의 로켓·번개·성)에만 등장하고 [src:1], 제품 UI의 상태 표현은 아이콘과 컬러가 담당한다 [src:9].

보이스는 층위가 명확하다. 브랜드 카피는 "원하는 모든 것, 나답게 배우다"처럼 배움을 자기다움으로 잇는 선언형이고 [src:5], 제품 UI 카피는 "커스텀 문구가 적용되었습니다" 같은 존댓말 안내형이다 [src:22]. 어드민 액션 라벨은 "새로고침"·"추가" 같은 2–4자 동사형으로 짧다 [src:34]. 넛지는 "지금 이 페이지를 나가시면 혜택을 받을 수 없어요!" 같은 손실 회피형 한 줄까지 허용되지만 [src:23], "고객을 속이지 않고 가치 그대로를 보여줍니다"라는 원칙이 과장을 걸러낸다 [src:8].

## Colors

VDS 색 체계는 92개 시맨틱 토큰이 라이트/다크 값 쌍으로 정의된 단일 사전이다 [src:3]. "Vibrant color token 은 다크/라이트 모드에 맞추어 제작되었습니다"가 공식 전제이고 [src:2], 라이트 값은 공식 Color Token 문서와 npm `@vibrant-ui/theme@0.94.37` 실측이 전 항목 일치한다 [src:2][src:3]. 아래 OKLCH 값은 그 공식 hex를 변환한 것이며 원본 hex를 트레일링 주석으로 병기한다.

구조 원칙은 세 가지다. (1) 강조는 primary 오렌지 하나로 수렴하고, 라이트/다크 어디서든 같은 값을 유지한다 — 다크 캔버스에서도 버튼이 같은 오렌지로 렌더된다 [src:2][src:3][src:9]. (2) 상태는 informative/error/success/warning 4색이 담당하며, 각자 옅은 container 틴트를 동반한다 [src:2]. (3) 텍스트 위계는 `onView1→onView2→onView3` 3단으로 토큰화되어 "항상 onView1" 식으로 컴포넌트 규칙에 직접 인용된다 [src:2][src:32].

```yaml
# Basic — 브랜드·상태 (라이트 모드 값 [src:2][src:3])
primary: oklch(0.685 0.211 41) # #ff5d00 — 유일한 히어로 컬러, 다크에서도 동일값
onPrimary: oklch(1 0 0) # #ffffff
primaryContainer: oklch(0.974 0.009 52) # #fcf5f1
onPrimaryContainer: oklch(0.685 0.211 41) # #ff5d00
informative: oklch(0.583 0.219 265) # #376dfa
informativeContainer: oklch(0.967 0.012 286) # #f3f3fc
error: oklch(0.581 0.230 23) # #e30f32
errorContainer: oklch(0.967 0.012 24) # #fcf1f0
success: oklch(0.543 0.144 151) # #078641
successContainer: oklch(0.960 0.050 151) # #dbfce1
warning: oklch(0.789 0.168 71) # #fca50e
onWarning: oklch(0.131 0.014 82) # #0a0703
warningContainer: oklch(0.966 0.018 70) # #fcf2e7
```

```yaml
# Surface / Outline / Text (라이트 모드 값 [src:2][src:3])
background: oklch(1 0 0) # #ffffff
surface1: oklch(0 0 0 / 3%) # #00000008 — 3% 검정 워시
surface2: oklch(1 0 0) # #ffffff
surface3: oklch(1 0 0) # #ffffff
surface4: oklch(0.830 0 0) # #c7c7c7
inverseSurface: oklch(0.244 0 0) # #202020 — 잉크 반전 표면
onInverseSurface: oklch(0.964 0 0) # #f3f3f3
disable: oklch(0 0 0 / 10%) # #0000001a
outline1: oklch(0 0 0 / 5%) # #0000000d — 기본 헤어라인
outline2: oklch(0 0 0 / 10%) # #0000001a — 강조 헤어라인
outlineNeutral: oklch(0.154 0 0) # #0c0c0c
onView1: oklch(0.154 0 0) # #0c0c0c — 1차 텍스트
onView2: oklch(0.337 0 0 / 80%) # #373737cc — 2차 텍스트
onView3: oklch(0.667 0 0) # #949494 — 3차 텍스트
onViewPrimary: oklch(0.685 0.211 41) # #ff5d00 — 텍스트용 오렌지
dim: oklch(0 0 0 / 70%) # #000000b2 — 오버레이 스크림
```

다크 모드는 별도 팔레트가 아니라 같은 토큰명의 값 오버라이드다. `primary`·`onPrimary`·`informative`·`error`·`success`·`warning`·`onWarning`은 두 모드에서 동일값을 유지하고, 나머지는 아래처럼 반전된다 [src:3].

| token                | 다크 값 (OKLCH)          | 원본 hex    |
| -------------------- | ------------------------ | ----------- |
| primaryContainer     | `oklch(0.187 0.025 55)`  | `#1c1008`   |
| onPrimaryContainer   | `oklch(0.716 0.186 43)`  | `#ff7430`   |
| informativeContainer | `oklch(0.199 0.045 270)` | `#0e142a`   |
| errorContainer       | `oklch(0.187 0.034 36)`  | `#200d08`   |
| successContainer     | `oklch(0.171 0.027 149)` | `#071309`   |
| warningContainer     | `oklch(0.192 0.023 78)`  | `#1a1308`   |
| background           | `oklch(0.154 0 0)`       | `#0c0c0c`   |
| surface1             | `oklch(1 0 0 / 5%)`      | `#ffffff0d` |
| surface2             | `oklch(0.205 0 0)`       | `#171717`   |
| surface3             | `oklch(0 0 0)`           | `#000000`   |
| surface4             | `oklch(0.471 0 0)`       | `#5b5b5b`   |
| inverseSurface       | `oklch(0.964 0 0)`       | `#f3f3f3`   |
| onInverseSurface     | `oklch(0.154 0 0)`       | `#0c0c0c`   |
| disable              | `oklch(1 0 0 / 15%)`     | `#ffffff26` |
| outline1             | `oklch(1 0 0 / 8%)`      | `#ffffff14` |
| outline2             | `oklch(1 0 0 / 15%)`     | `#ffffff26` |
| outlineNeutral       | `oklch(0.964 0 0)`       | `#f3f3f3`   |
| onView1              | `oklch(0.964 0 0)`       | `#f3f3f3`   |
| onView2              | `oklch(0.964 0 0 / 65%)` | `#f3f3f3a6` |
| onView3              | `oklch(0.559 0 0)`       | `#747474`   |
| onViewPrimary        | `oklch(0.716 0.186 43)`  | `#ff7430`   |
| dim                  | `oklch(0 0 0 / 80%)`     | `#000000cc` |

시맨틱 사전과 별개로, blue/green/magenta/orange/red/violet/yellow 7계열이 `~Vibrant / ~Contrast / ~Soft / ~Muted / ~Inverse` 변형으로 패키지에 정의된 유채색 확장 팔레트가 있다 — 배지·일러스트용 보조 악센트다 [src:3].

```yaml
# 확장 팔레트 — ~Vibrant 변형 예시 [src:3]
orangeVibrant: oklch(0.685 0.211 41) # #ff5d00 — primary와 동일값
blueVibrant: oklch(0.583 0.219 265) # #376dfa — informative와 동일값
magentaVibrant: oklch(0.632 0.252 2) # #f7097d
violetVibrant: oklch(0.603 0.269 305) # #a839fd
orangeMuted: oklch(0.930 0.031 45) # #fbe2d7 (라이트) — 다크에서는 oklch(0.255 0.055 51) #371a07로 반전
```

`~Muted`/`~Inverse` 계열은 라이트↔다크에서 값이 서로 뒤집히는 대칭 설계다 [src:3].

## Typography

공식 서체 토큰은 존재하지 않는다 — `@vibrant-ui/theme`에 fontFamily 토큰이 없고 [src:3], 시스템 프롭 `fontFamily`는 자유 문자열 타입으로만 열려 있다 [src:18]. 자체 디스플레이/브랜드 전용 서체의 증거도 없어 별도 웹폰트 소스가 필요 없다. 아래 스택은 한글 커버리지를 위한 카탈로그 폴백이다:

- **font-sans** ≈ `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif` (공식 서체 미공개 — 카탈로그 폴백 가정)

타이포 스케일은 npm 패키지에 display·title·body·paragraph 4계열 21종으로 정의된다. 원문은 rem이며(1rem = 16px 환산), 아래는 px 표기다 [src:3].

```yaml
# size / line-height (px) — npm 원문은 rem [src:3]
display1: 96 / 108 # 6rem / 6.75rem
display2: 72 / 86 # 4.5rem / 5.375rem
display3: 48 / 60 # 3rem / 3.75rem
display4: 40 / 50 # 2.5rem / 3.125rem
title1: 32 / 40 # 2rem / 2.5rem
title2: 28 / 36 # 1.75rem / 2.25rem
title3: 24 / 32 # 1.5rem / 2rem
title4: 20 / 26 # 1.25rem / 1.625rem
title5: 18 / 22 # 1.125rem / 1.375rem
title6: 16 / 20 # 1rem / 1.25rem
title7: 14 / 18 # 0.875rem / 1.125rem
body1: 16 / 20 # 1rem / 1.25rem
body2: 14 / 18 # 0.875rem / 1.125rem
body3: 13 / 18 # 0.8125rem / 1.125rem
body4: 12 / 16 # 0.75rem / 1rem
body5: 11 / 14 # 0.6875rem / 0.875rem
body6: 10 / 12 # 0.625rem / 0.75rem
paragraph1: 20 / 28 # 1.25rem / 1.75rem
paragraph2: 18 / 26 # 1.125rem / 1.625rem
paragraph3: 15 / 21 # 0.9375rem / 1.3125rem
paragraph4: 14 / 20 # 0.875rem / 1.25rem
```

**Weights.** `regular 400 / medium 500 / bold 700 / extraBold 800` 4단 — semiBold(600)는 존재하지 않는다 [src:3].

**이원 구조.** body 계열은 lineHeight 배율이 약 1.25–1.38로 타이트해 UI 레이블·밀도 높은 텍스트용이고, 읽기 문단은 배율 1.4의 paragraph 계열이 따로 담당한다 [src:3]. 텍스트 컴포넌트 `Body`는 `level 1|2|3|4|5` × `weight bold|extraBold|medium|regular` API로 노출된다(테마 body1–6 중 5단 사용) [src:29].

**오버라이드.** 시스템 프롭 `typography`(TypographyKindToken)·`fontWeight`(TypographyWeightToken)·`fontSize`·`lineHeight`(number)로 컴포넌트 단위 세부 조정이 가능하다 [src:18]. letter-spacing 토큰은 정의되지 않는다 [src:3].

## Spacing

명명 스페이싱 스케일이 없다 — 스페이싱은 시스템 프롭이 raw px number를 받는 체계다. 마진 `m/mt/mr/mb/ml/mx/my`와 패딩 `p/pt/pr/pb/pl/px/py`가 전부 number 타입이고 [src:16], Stack류의 `spacing`·`rowGap/columnGap`도 number를 받는다 [src:15].

공식 문서 예제에서 관찰되는 실사용 간격은 다음과 같다:

- Dropdown 기본 offset `spacing={8}` [src:26]
- 콘텐츠 패딩 `p={12}`, `px={20}` [src:47][src:26]
- 요소 간 `spacing={20}`~`spacing={24}` [src:26]

관찰값이 4의 배수로 수렴하기는 하지만, "4px 그리드"라는 규정은 공식 문서에 없다(≈ 재구성 관찰). 공개된 명명 스페이싱 토큰이 없으므로, 위 숫자가 문서화된 실사용 예의 전부다.

## Rounded

코너 라운드는 명명 스케일로 토큰화되어 있다. 프롭 enum은 `rounded: none|sm|md|lg|xl|xxl`이고 [src:17], px 값은 npm 실측 기준이다 [src:3].

```yaml
none: 0px
sm: 4px
md: 8px # 버튼 코너 관찰값과 일치
lg: 12px
xl: 16px
xxl: 20px
full: 10000px # pill·원형 전용 (npm 원문 10000)
```

`full`은 테마에 존재하며 `ImageThumbnail`의 `rounded` 기본값으로 문서화되어 있다 [src:3][src:35]. 스크린샷 관찰로는 md 버튼 코너가 ≈8px({rounded.md} 상당)이고, FilterChip과 Toast는 완전한 pill 실루엣이다 [src:9].

## Elevation & Depth

그림자 수치는 공개 문서에 없다 — 컴포넌트는 `elevationLevel` 프롭으로 테마 정의 그림자를 참조하는 구조이고 [src:41], npm 패키지에는 light/darkModeElevation 모듈의 존재만 확인된다 [src:3]. (공개된 그림자 값 없음 — 관찰상 깊이 연출보다 헤어라인·표면 위계가 우선하는 플랫 시스템이다 [src:2].)

깊이의 실제 언어는 세 가지다. 첫째, 구획은 {colors.outline1}(5%)·{colors.outline2}(10%) 반투명 헤어라인이 담당한다 [src:2]. 둘째, 오버레이는 {colors.dim} 스크림과 {colors.inverseSurface} 잉크 반전 표면으로 처리한다 [src:2][src:3]. 셋째, 레이어 순서는 zIndex 토큰으로 명명되어 있다 [src:3]:

```yaml
# zIndex 레이어 토큰 [src:3]
bottomBar: 1
floatingActionButton: 1
modalBottomSheet: 2
dropdown: 3
toast: 4
popover: 4
```

바텀바·플로팅 액션 버튼·바텀시트가 1급 레이어로 명명된 것 자체가 모바일 앱 우선 구조의 증거다 [src:3].

## Shapes

곡률 언어는 0→20px 계단과 pill의 조합이다. 버튼은 ≈8px 코너, FilterChip·Toast는 완전한 pill 실루엣으로 관찰되고 [src:9], 오버레이 썸네일 컴포넌트 `ImageThumbnail`은 기본값이 `full`(원형·pill)이다 [src:35]. 곡선은 부드럽되 유기적 blob이나 사선 분할 같은 표현은 시스템 어휘에 없다.

표면은 플랫 필 + 반투명 헤어라인이 기본이다 — 그라데이션·텍스처는 시스템 장치로 쓰이지 않으며 [src:2], 다만 `Paper` 컨테이너가 `gradient` 프롭을 노출해 예외적 표면을 허용한다 [src:41]. 아이콘은 `Icon.Add.Fill / .Regular / .Thin` 3웨이트 체계에 기본 24px 그리드다 [src:30]. 추출 집계상 SVG는 `fill="currentColor"`로 잉크를 상속하며, 공식 총수는 미공개다(≈270종).

이모지는 마케팅 순간에만 등장하고 [src:1], 제품 UI의 상태 표현은 아이콘과 컬러가 담당한다 [src:9]. 모션은 `<Motion>`/`<Transition>` 컴포넌트가 duration(ms)과 `loop: true|reverse`를 받으며, 이징은 `linear / easeInQuad / easeOutQuad` 3종만 공식 지원한다 — 스프링·바운스류 곡선은 시스템 어휘 밖이다 [src:31].

## Components

모든 컴포넌트는 동일한 토큰 사전과 시스템 프롭(스페이싱 number, 타이포 kind, 프롭 단위 반응형 배열)을 공유한다 [src:15]. 레이아웃 프리미티브는 Box / Stack / HStack / VStack(flex 고정)이다 [src:15][src:12].

### contained-button-primary

{colors.primary} 필 + {colors.onPrimary} 라벨의 대표 CTA. kind→토큰 매핑이 공식 개발 원칙 문서에 명시된다(primary→`primary`/`onPrimary`) [src:13]. `size: xl|lg|md|sm`, 좌측 아이콘, `disclosure` 토글, `loading` 스피너, `href`(a 태그 렌더)를 지원한다 [src:19]. 다크 모드에서도 같은 오렌지 필 + 흰 라벨을 유지하며 [src:3][src:9], 코너는 ≈8px({rounded.md} 상당)로 관찰된다 [src:9].

```tsx
<ContainedButton kind="primary" size="lg" loading={isSubmitting}>
  저장하기
</ContainedButton>
```

### contained-button-secondary

{colors.inverseSurface} 필 + {colors.onInverseSurface} 라벨 — 잉크 반전으로 무게를 만드는 2차 버튼이다 [src:13]. 사이즈·아이콘·loading·href 체계는 {component.contained-button-primary}와 동일하다 [src:19].

### contained-button-tertiary

{colors.surface1} 반투명 워시 + {colors.onView1} 라벨의 저강조 버튼이다 [src:13]. 배경이 라이트 3% 검정 / 다크 5% 흰색 워시 쌍이라 두 모드에 자연히 적응한다 [src:3].

### outlined-button

Contained와 동일한 `xl|lg|md|sm` 사이즈·아이콘·loading·href 체계를 외곽선 실루엣으로 제공하는 중간 위계 버튼이다 [src:42]. 필 없는 실루엣이 헤어라인 구획 언어와 같은 결을 유지한다 [src:2].

### ghost-button

텍스트 버튼. `color`(OnColorToken)로 잉크를 지정하고, 우측 `arrow: top|right|bottom` 화살표와 disclosure 토글을 갖는다 [src:43].

### icon-button

`sm|md|lg` 3사이즈에 Fill/Regular/Thin 아이콘을 담는 아이콘 전용 버튼. 접근성 `ariaLabel`이 프롭으로 명세되어 있다 [src:44].

### filter-chip

{rounded.full} pill 실루엣의 필터 칩 [src:9]. `size: md|sm`, `selected`, `startIcon/endIcon`, `lineLimit` 말줄임, `href`를 지원한다 [src:20]. 칩을 가로로 나열하고 `lineLimit=1` 초과 텍스트를 말줄임하는 패턴이 확인된다 [src:9].

### text-field

라벨 내장형 입력 — 포커스 시 "label이 애니메이션으로 동작"하는 다이내믹 라벨이 시그니처다 [src:14]. `clearable`·`prefix/suffix`·`renderStart/renderEnd`·`state: error|default`·`size: lg|md|sm`을 갖는다 [src:21]. 헤어라인 보더와 하단 helper 텍스트("이메일을 입력해주세요"), 앞뒤 애드온 구성이 관찰된다 [src:9].

```tsx
<TextField size="md" label="이메일" state={invalid ? "error" : "default"} clearable />
```

### toast

`kind: default|success|error`, `title` 필수, `buttonText` 액션의 결과 알림. `showToast` 훅 + `<ToastRenderer />` 페어 구조다 [src:22]. 짙은 잉크 표면의 라운드 필 위에 성공 그린 체크와 흰 텍스트가 얹히는 모습으로 관찰된다 [src:9].

```tsx
showToast({
  kind: "success",
  title: "커스텀 문구가 적용되었습니다",
  buttonText: "미리보기",
  duration: 3000,
});
```

`duration: 3000`은 Storybook 데모에서 관찰된 예시값이다 [src:9].

### callout

`kind: default|informative|error|warning|success` 5종의 인라인 안내 박스로, 내장 버튼 옵션을 갖는다 [src:24]. kind 명칭이 상태 4색 + container 틴트 체계와 같은 의미론을 공유한다 [src:2].

### modal-bottom-sheet

모바일에서는 바텀 시트, 그 이상의 뷰포트에서는 모달로 등장하는 적응형 다이얼로그다(PC 모달 너비 `size: lg|md`) [src:25]. title/subtitle과 `primaryButtonOptions/secondaryButtonOptions/subButtonOptions` CTA 규약을 갖는다 — Primary 없이 Secondary/Sub를 쓸 수 없고, Secondary와 Sub를 동시에 쓸 수 없다 [src:25]. Android 시스템 뒤로가기로 닫히는 BackHandler 동작이 명세에 포함된다 [src:25].

### dropdown

`renderOpener/renderContents` 렌더 프롭 구조의 부착형 팝오버. 12방위 `position`과 기본 offset `spacing={8}`을 갖고, PC에서는 드롭다운·모바일에서는 바텀 시트로 등장한다 [src:26].

### top-bar

모바일 페이지 헤더(공식 문서 표기는 "TobBar"). `kind: default|emphasis` 2종이며 emphasis는 "내 클래스, 공개 예정 등 메인 페이지 상단"용으로 문서화된다. 좌우 액션 렌더 슬롯을 갖는다 [src:27].

### breadcrumbs

현재 페이지를 항상 {colors.onView1}로 고정하는 규칙이 문서화되어 있다 [src:32]. 부족한 폭에서는 Separator 단위로 래핑하고 ellipsis 처리한다 [src:32].

### grid-list

브레이크포인트별 열 수와 간격을 선언하는 카드 그리드다 [src:28].

```tsx
<GridList breakpoints={[480, 720, 960]} columns={[2, 3, 4]}>
  {items}
</GridList>
```

위 `breakpoints/columns`는 테마 기본 브레이크포인트([640, 1024, 1312] [src:3]) 대신 커스텀 지정하는 공식 문서 예시다 [src:28].

### slider

`loop`·`snap`·`panelsPerView|panelWidth`로 제어하는 가로 캐러셀 — 카드 레일 패턴의 기반이다 [src:45].

### scroll-tabs-layout

스크롤 위치와 연동되는 고정 탭 레이아웃이다 [src:46]. 탭 바가 콘텐츠 스크롤을 따라가며 현재 섹션을 가리키는 구조만 문서화되어 있고, 시각 스타일은 공통 토큰을 따른다.

### view-pager-tab-group

탭 선택으로 페이지 뷰를 전환하는 스와이프 탭이다 [src:47]. 공식 예제가 콘텐츠 패딩 `p={12}`·`px={20}`을 쓰는 출처이기도 하다 [src:47].

### table

Table + VirtualizedTable + TableFilterGroup/TableHeader/TableFooter로 구성된 어드민급 데이터 테이블 스위트다. 행 선택·확장·정렬을 갖추고 [src:33], 문자열/날짜/다중선택 필터칩과 페이지네이션을 지원한다 [src:34]. 액션 라벨은 "새로고침"·"추가"처럼 짧은 동사형이다 [src:34].

### image-thumbnail

`rounded` 기본값이 `full`로 문서화된 오버레이(dim) 썸네일 컴포넌트다 [src:35]. {colors.dim} 스크림 언어와 짝을 이룬다 [src:3].

### skeleton

`.Image/.Button/.Field/.Avatar/.Text/.Chip` 패밀리가 실제 컴포넌트와 동일 사이즈를 갖는 로딩 플레이스홀더다 [src:36]. 동일 사이즈 원칙 덕에 로딩 전후 레이아웃이 흔들리지 않는다.

이 밖에 Avatar(`xs|sm|md|lg` + 로드 실패 플레이스홀더) [src:37], Divider(`default|dashed|thick` × margin `none|md|lg`) [src:38], Spinner(배경색에 따라 `onColor` 자동 결정) [src:39], Paper(rounded·elevationLevel·gradient 표면 컨테이너) [src:41], Body(level×weight 텍스트) [src:29], Icon(3웨이트) [src:30], Motion/Transition [src:31]이 같은 토큰 위에서 동작한다.

## Do's and Don'ts

**Do**

- 강조는 {colors.primary} 하나로 수렴시킨다 — 버튼·배지·선택 상태가 전부 같은 오렌지를 공유하는 것이 이 시스템의 정체성이다 [src:2][src:9].
- 텍스트 위계는 {colors.onView1}→{colors.onView2}→{colors.onView3} 3단 토큰으로만 조정한다 [src:2]. 브레드크럼 현재 페이지처럼 "항상 onView1" 식의 규칙 인용이 관례다 [src:32].
- 다크 모드는 토큰 쌍으로 처리한다 — 92개 토큰 전부에 다크 값이 내장되어 있고, {colors.primary}는 두 모드에서 동일하며 텍스트용 오렌지만 {colors.onViewPrimary}의 다크 값으로 한 단계 밝아진다 [src:3].
- 구획은 그림자보다 {colors.outline1}·{colors.outline2} 반투명 헤어라인으로 처리한다 [src:2].
- 읽기 문단에는 paragraph 계열(배율 1.4)을, UI 레이블·밀도 높은 텍스트에는 body 계열(배율 1.25–1.38)을 쓴다 [src:3].
- 반응형은 컴포넌트 분기 복제가 아니라 프롭 단위 배열로 처리한다 — `direction={['vertical', 'horizontal']}` [src:15][src:14].
- UI 카피는 존댓말 안내형("~되었습니다")으로, 어드민 액션 라벨은 2–4자 동사형으로 쓴다 [src:22][src:34].

**Don't**

- semiBold(600)를 쓰지 않는다 — 공식 웨이트는 400/500/700/800 4단뿐이다 [src:3].
- {colors.primary} 오렌지를 상태(성공·에러·경고) 의미로 유용하지 않는다 — 상태는 informative/error/success/warning 4색과 container 틴트가 담당한다 [src:2].
- 다크 캔버스에 라이트 모드의 옅은 container 틴트를 그대로 쓰지 않는다 — 각 틴트는 딥 톤 다크 쌍을 따로 갖는다 [src:3].
- 확장 유채색 팔레트(magenta·violet 등)를 CTA나 상태 색으로 승격하지 않는다 — 배지·일러스트용 보조 악센트다 [src:3].
- 제품 UI에서 이모지로 상태를 표현하지 않는다 — 이모지는 마케팅 문맥에 한정되고, 상태는 아이콘+컬러가 담당한다 [src:1][src:9].
- 과장·기만형 카피를 쓰지 않는다 — 넛지는 손실 회피형 한 줄까지가 관찰 상한이고 [src:23], "고객을 속이지 않고 가치 그대로를 보여줍니다"가 명문화된 원칙이다 [src:8].
- **(도메인 경계)** 클래스101의 도메인 개념 — 클래스 구독(클래스101+)·크리에이터 수익 구조·수강 신청 흐름·"월 19,000원" 류 구독 가격 카피·클래스 카드 레일의 상품 구성 — 을 그대로 가져오지 않는다. 차용할 것은 단일 오렌지 악센트, onView 텍스트 위계, 바텀시트 우선 반응형이라는 시각 언어이지 클래스 플랫폼의 제품 개념이 아니다.
- **(벤더 중립)** "Vibrant"/"Vibrant Design System" 워드마크, `@vibrant-ui/*` 패키지명, `<VibrantProvider>` 같은 시스템 식별자를 생성하는 제품 UI의 카피·헤더·타이틀·라벨·클래스명에 넣지 않는다 — 차용할 것은 시각 언어이지 시스템 이름이 아니다.

## Responsive Behavior

### Breakpoints

테마 기본 브레이크포인트는 `[640, 1024, 1312]`px이다 [src:3]. "모든 System Prop은 기본적으로 반응형을 지원합니다" — 웹은 css media query로, 네이티브는 현재 화면 너비로 분기하며 [src:15], 값은 `<Stack direction={['vertical', 'horizontal']} />`처럼 브레이크포인트별 배열로 전달한다 [src:14].

| 구간 | 폭       | Key Changes                                                                                                                   |
| ---- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| base | < 640px  | 반응형 배열의 첫 값 적용 [src:15]; ModalBottomSheet·Dropdown이 바텀 시트로 등장 [src:25][src:26]; TopBar 모바일 헤더 [src:27] |
| bp1  | ≥ 640px  | 배열 2번째 값 적용; Stack 축 전환(vertical→horizontal) 예시 구간 [src:14]                                                     |
| bp2  | ≥ 1024px | 배열 3번째 값 적용; 다열 카드 그리드 확장(GridList 열 선언) [src:28]                                                          |
| bp3  | ≥ 1312px | 배열 4번째 값 적용 — 최대 폭 구간 [src:3]                                                                                     |

단, 시트↔모달 전환이 일어나는 "모바일/PC"의 정확한 임계 폭은 문서에 공개되어 있지 않다 [src:25][src:26].

### Collapsing Strategy

- Dropdown: PC 드롭다운 → 모바일 바텀 시트 [src:26].
- ModalBottomSheet: PC 센터 모달(`size: lg|md`) → 모바일 바텀 시트, Android 시스템 뒤로가기로 닫힘 [src:25].
- GridList: 브레이크포인트별 `columns` 배열로 열 수를 줄인다 [src:28].
- TopBar: 모바일 전용 페이지 헤더 — emphasis kind가 메인 페이지 상단을 담당한다 [src:27].
- BreadCrumbs: 부족한 폭에서 Separator 단위 래핑 + ellipsis [src:32].

### Touch Targets

공개된 터치 타깃 수치는 없다(문서·패키지 모두 미공개). 다만 바텀바·FAB·바텀시트가 zIndex 1급 토큰으로 존재하고 [src:3] Android BackHandler가 명세에 포함되는 [src:25] 모바일 앱 우선 시스템이므로, 다운스트림에서는 플랫폼 관례(44×44px 상당)를 적용하는 것이 안전하다.

### Image Behavior

- ImageThumbnail: 기본 `rounded: full` + dim 오버레이 — 폭과 무관하게 실루엣이 유지된다 [src:35].
- Slider: `panelsPerView|panelWidth`로 폭별 노출 카드 수를 제어하는 가로 캐러셀 [src:45].
- 제공 스크린샷이 데스크톱 폭 라이트/다크 쌍뿐이라, 모바일 리플로우의 시각 대조는 위 문서·토큰 근거에 의존한다 [src:9].

## Known Gaps

- 서체 패밀리가 공식 미공개다 — fontFamily 토큰이 없고 [src:3], 본 문서의 Pretendard Variable 스택은 카탈로그 폴백 가정(≈)이다.
- 그림자(elevation) 구체값이 미공개다 — `elevationLevel` 프롭 구조 [src:41]와 npm 모듈 존재 [src:3]만 확인된다.
- 명명 스페이싱 스케일이 없다 — 시스템 프롭이 raw px number를 받으며 [src:16], 문서 예제 관찰값(8/12/20/24)이 근거의 전부다.
- letter-spacing 토큰과 모션 duration 프리셋이 정의되지 않는다 — 이징도 3종만 공식 지원이다 [src:3][src:31].
- 아이콘 총수가 공식 미공개다 — 리서치 추출 집계 ≈270종(818개 SVG)은 검증된 공식 수치가 아니다.

## References

1. https://vibrant-design.com/ — Vibrant Design System 소개(정의·핵심 가치 Performant/Productive/Consistent)
2. https://vibrant-design.com/docs/theme/colors/color-token/ — Color Token 문서(시맨틱 토큰 라이트 값·다크/라이트 모드 전제)
3. https://www.npmjs.com/package/@vibrant-ui/theme — npm 테마 패키지(라이트/다크 92토큰 쌍·타이포 21종·rounded·breakpoints·zIndex 실측)
4. https://github.com/pedaling/opensource — Pedaling(101 Inc.) 공개 모노레포(MIT·TypeScript·Nx)
5. https://class101.net/ko — 한국어 홈(브랜드 카피 톤 샘플)
6. https://class101.net/ — 글로벌 홈(CLASS101+ 브랜딩)
7. https://class101.ghost.io/ceo-mission-culture/ — CEO 미션·컬처 노트(크리에이터 생태계 서사)
8. https://medium.com/class101/%EA%B5%AC%EB%8F%85%EA%B3%BC-%ED%95%A8%EA%BB%98-%EC%99%84%EC%A0%84%ED%9E%88-%EC%83%88%EB%A1%9C%EC%9B%8C%EC%A7%84-%ED%81%B4%EB%9E%98%EC%8A%A4101-b1beb363aa91 — 구독 전환 리뉴얼 회고(클래스101+ 전환·다크모드 도입·제품 원칙)
9. https://vibrant-storybook.class101.dev/ — Vibrant Storybook(라이트/다크 컴포넌트 캡처의 원 출처)
10. https://vibrant-design.com/docs/getting-started/installation/ — 설치 문서(React DOM·React Native 크로스플랫폼)
11. https://vibrant-design.com/docs/getting-started/internationalization/ — 국제화 문서(ConfigProvider 한국어/영어/일본어)
12. https://vibrant-design.com/docs/contribution/code-base/ — 코드베이스 문서(core/components/icons/theme 계층·VibrantProvider)
13. https://vibrant-design.com/docs/contribution/develope-principle/ — 개발 원칙 문서(ContainedButton kind→토큰 매핑)
14. https://vibrant-design.com/docs/migration/migration-from-ui-system/ — 마이그레이션 가이드(@class101/ui-system 전신·반응형 배열 문법·TextField 다이내믹 라벨)
15. https://vibrant-design.com/docs/system-props/introduce/ — System Props 소개(프롭 단위 반응형·Stack spacing)
16. https://vibrant-design.com/docs/system-props/spacing/ — Spacing 프롭 문서(margin/padding raw number 체계)
17. https://vibrant-design.com/docs/system-props/border/ — Border 프롭 문서(rounded 명명 스케일 enum)
18. https://vibrant-design.com/docs/system-props/typography/ — Typography 프롭 문서(typography/fontWeight/fontSize/lineHeight·자유 fontFamily)
19. https://vibrant-design.com/docs/components/vibrant-component/contained-button/ — ContainedButton 문서(kind·size·loading·disclosure·href)
20. https://vibrant-design.com/docs/components/vibrant-component/filter-chip/ — FilterChip 문서
21. https://vibrant-design.com/docs/components/vibrant-component/text-field/ — TextField 문서
22. https://vibrant-design.com/docs/components/vibrant-component/toast/ — Toast 문서(showToast·ToastRenderer·카피 샘플)
23. https://vibrant-design.com/docs/components/vibrant-component/tooltip/ — Tooltip 문서(손실 회피 넛지 톤 샘플)
24. https://vibrant-design.com/docs/components/vibrant-component/callout/ — Callout 문서(kind 5종)
25. https://vibrant-design.com/docs/components/vibrant-component/modal-bottom-sheet/ — ModalBottomSheet 문서(뷰포트 적응·CTA 규약·BackHandler)
26. https://vibrant-design.com/docs/components/vibrant-component/dropdown/ — Dropdown 문서(뷰포트 적응·12방위 position·기본 offset 8)
27. https://vibrant-design.com/docs/components/vibrant-component/top-bar/ — TopBar 문서(모바일 헤더 kind)
28. https://vibrant-design.com/docs/components/vibrant-component/grid-list/ — GridList 문서(브레이크포인트별 열 선언)
29. https://vibrant-design.com/docs/components/vibrant-component/body/ — Body 문서(level×weight API)
30. https://vibrant-design.com/docs/components/vibrant-icons/icons/ — Icons 문서(Fill/Regular/Thin 3웨이트·24px 그리드)
31. https://vibrant-design.com/docs/components/vibrant-motion/motion/ — Motion 문서(duration·loop·이징 3종)
32. https://vibrant-design.com/docs/components/vibrant-component/breadcrumbs/ — BreadCrumbs 문서(현재 페이지 onView1 규칙·래핑)
33. https://vibrant-design.com/docs/components/vibrant-component/table/ — Table 문서(행 선택·확장·정렬)
34. https://vibrant-design.com/docs/components/vibrant-component/table-header/ — TableHeader 문서(필터칩·어드민 액션 라벨)
35. https://vibrant-design.com/docs/components/vibrant-component/image-thumbnail/ — ImageThumbnail 문서(rounded full 기본·dim 오버레이)
36. https://vibrant-design.com/docs/components/vibrant-component/skeleton/ — Skeleton 문서(동일 사이즈 패밀리)
37. https://vibrant-design.com/docs/components/vibrant-component/avatar/ — Avatar 문서
38. https://vibrant-design.com/docs/components/vibrant-component/divider/ — Divider 문서
39. https://vibrant-design.com/docs/components/vibrant-component/spinner/ — Spinner 문서(onColor 자동 결정)
40. https://github.com/pedaling/class101-ui — 전전신 공개 React UI 라이브러리
41. https://vibrant-design.com/docs/components/vibrant-component/paper/ — Paper 문서(rounded·elevationLevel·gradient 표면)
42. https://vibrant-design.com/docs/components/vibrant-component/outlined-button/ — OutlinedButton 문서
43. https://vibrant-design.com/docs/components/vibrant-component/ghost-button/ — GhostButton 문서
44. https://vibrant-design.com/docs/components/vibrant-component/icon-button/ — IconButton 문서(ariaLabel 명세)
45. https://vibrant-design.com/docs/components/vibrant-component/slider/ — Slider 문서(가로 캐러셀)
46. https://vibrant-design.com/docs/components/vibrant-component/scroll-tabs-layout/ — ScrollTabsLayout 문서
47. https://vibrant-design.com/docs/components/vibrant-component/view-pager-tab-group/ — ViewPagerTabGroup 문서(콘텐츠 패딩 예시)
