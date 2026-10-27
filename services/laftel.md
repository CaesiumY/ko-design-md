---
name: 라프텔
slug: laftel
category: content
last_updated: 2026-10-27
created_at: 2026-10-27
lang: ko
logo: https://getdesign.kr/logos/laftel.png
colors:
  ## Brand
  primary: oklch(0.626 0.211 285.3)               # #816BFF 포인트 보라. 활성 칩·진행바·N 배지·활성 네비 링크, 두 테마 공통
  primary-slight-1: oklch(0.954 0.024 293.6)      # #F0EDFF --button-slight-1·--background-highlight 라이트
  primary-slight-2: oklch(0.886 0.06 291.4)       # #D9D3FF --button-slight-2 라이트
  ## Background (라이트)
  bg-1: oklch(1 0 0)                              # #FFFFFF --background-1
  bg-2: oklch(0.976 0 0)                          # #F7F7F7 --background-2
  bg-3: oklch(0.949 0 0)                          # #EEEEEE --background-3
  bg-4: oklch(0.913 0 0)                          # #E2E2E2 --background-4
  bg-toast: oklch(0 0 0)                          # #000000 --background-toast
  ## Background (다크)
  dark-bg-1: oklch(0.182 0 0)                     # #121212 --background-1
  dark-bg-2: oklch(0 0 0)                         # #000000 --background-2
  dark-bg-3: oklch(0.317 0 0)                     # #323232 --background-3
  dark-bg-4: oklch(0.431 0 0)                     # #505050 --background-4
  dark-bg-toast: oklch(0.272 0.033 281.5)         # #242537 --background-toast
  ## Foreground (라이트)
  fg-1: oklch(0.182 0 0)                          # #121212 --foreground-1
  fg-2: oklch(0.431 0 0)                          # #505050 --foreground-2
  fg-3: oklch(0.633 0 0)                          # #8A8A8A --foreground-3
  fg-4: oklch(0.858 0 0)                          # #D0D0D0 --foreground-4·--foreground-disable
  ## Foreground (다크)
  dark-fg-1: oklch(0.976 0 0)                     # #F7F7F7 --foreground-1
  dark-fg-2: oklch(0.913 0 0)                     # #E2E2E2 --foreground-2
  dark-fg-3: oklch(0.741 0 0)                     # #ABABAB --foreground-3
  dark-fg-4: oklch(0.5 0 0)                       # #636363 --foreground-4·--foreground-disable
  ## Border
  border-1: oklch(0.949 0 0)                      # #EEEEEE --border-1 라이트
  border-2: oklch(0.913 0 0)                      # #E2E2E2 --border-2 라이트
  dark-border-1: oklch(0.317 0 0)                 # #323232 --border-1 다크
  dark-border-2: oklch(0.431 0 0)                 # #505050 --border-2 다크
  ## Button / State
  button-disable: oklch(0.949 0 0)                # #EEEEEE --button-disable 라이트
  dark-button-slight: oklch(0.317 0 0)            # #323232 --button-slight-1·--button-disable 다크
  button-purple-gray: oklch(0.228 0.029 277.9)    # #191B2A --button-purple-gray 라이트
  dark-button-purple-gray: oklch(0.272 0.033 281.5) # #242537 --button-purple-gray 다크
  badge-red: oklch(0.631 0.254 28.8)              # #FF1010 UP 뱃지 배경·텍스트형 글자
  badge-red-weak: oklch(0.952 0.024 8.2)          # #FFE9EC 텍스트형 UP 칩 배경
  white: oklch(1 0 0)                             # #FFFFFF 보라 면 위 고정 흰 글자
typography:
  heading-32:
    fontSize: 32px
    fontWeight: 700
    lineHeight: 48px
    letterSpacing: 0em
  heading-24:
    fontSize: 24px
    fontWeight: 700
    lineHeight: 36px
    letterSpacing: 0em
  title-16:
    fontSize: 16px
    fontWeight: 700
    lineHeight: 24px
    letterSpacing: 0em
  body-18:
    fontSize: 18px
    fontWeight: 500
    lineHeight: 27px
    letterSpacing: 0em
  body-16:
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0em
  label-14:
    fontSize: 14px
    fontWeight: 700
    lineHeight: 21px
    letterSpacing: 0em
  input-14:
    fontSize: 14px
    fontWeight: 600
    lineHeight: 21px
    letterSpacing: 0em
  caption-12:
    fontSize: 12px
    fontWeight: 700
    lineHeight: 18px
    letterSpacing: 0em
  caption-10:
    fontSize: 10px
    fontWeight: 700
    lineHeight: 15px
    letterSpacing: 0em
spacing:
  space-8: 8px
  space-12: 12px
  space-16: 16px
  space-24: 24px
  space-40: 40px
rounded:
  radius-xs: 3px
  radius-sm: 4px
  radius-md: 8px
  radius-lg: 16px
  radius-pill: 9999px
components:
  header:
    backgroundColor: "{colors.dark-bg-1}"
    textColor: "{colors.dark-fg-1}"
    height: 64px
  nav-link:
    textColor: "{colors.dark-fg-1}"
    typography: "{typography.label-14}"
  search-field:
    backgroundColor: "{colors.dark-bg-1}"
    textColor: "{colors.dark-fg-1}"
    typography: "{typography.input-14}"
    rounded: "{rounded.radius-sm}"
    height: 40px
    width: 288px
  button-cta:
    backgroundColor: "{colors.white}"
    textColor: "{colors.fg-1}"
    rounded: "{rounded.radius-xs}"
    height: 44.6px
    width: 114px
  button-secondary:
    backgroundColor: "{colors.dark-bg-1}"
    textColor: "{colors.dark-fg-1}"
    rounded: "{rounded.radius-xs}"
    height: 29.8px
  chip-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.radius-pill}"
    height: 35.7px
  chip-inactive:
    backgroundColor: "{colors.dark-bg-1}"
    textColor: "{colors.dark-fg-2}"
    rounded: "{rounded.radius-pill}"
    height: 35.7px
  badge-up:
    backgroundColor: "{colors.badge-red}"
    textColor: "{colors.dark-fg-1}"
    rounded: "{rounded.radius-xs}"
    height: 17px
  badge-new:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.caption-10}"
    height: 17px
  membership-card:
    backgroundColor: "{colors.dark-bg-1}"
    textColor: "{colors.dark-fg-1}"
    rounded: "{rounded.radius-sm}"
    width: 580px
  poster-card:
    textColor: "{colors.dark-fg-1}"
    rounded: "{rounded.radius-sm}"
    width: 222px
---

# 라프텔 — design.md

라프텔은 애니메이션을 좋아하는 "덕후"를 위한 OTT로, 먹빛에 가까운 다크 캔버스 위에 보라 `oklch(0.626 0.211 285.3)` 한 가지 포인트를 얹고 푸밍 캐릭터의 위트로 친근함을 더하는 스트리밍 서비스다.

## Brand & Style

라프텔 프로덕트 디자인팀은 디자인 원칙을 네 줄로 요약해 공개한다 — "덕후를 행복하게", "논리적이고 분명하게", "위트가 있는 디테일", "친숙하게, 필요한 곳에는 혁신적으로" [src:2][src:3]. 서비스의 시각 인상은 이 네 문장이 그대로 뒷받침한다. 덕후라면 누구든 "찐이야"라고 느낄 수 있는 곳을 만든다는 첫 원칙이 타깃을, 일관성이 목적이 되지 않도록 균형을 잡는다는 마지막 원칙이 보편성과 융통성의 태도를 정한다 [src:3].

위트는 푸밍이라는 자체 캐릭터와 유머러스한 카피로 구현된다 [src:3]. 카피 작성 방식은 UX 라이팅 가이드 글로 따로 공개돼 있다 [src:5]. 보라색 반원 몸통에 감은 눈과 미소를 가진 푸밍은 로고 자산으로도 쓰인다 [src:6]. 디자인 시스템은 타이포그래피·아이콘·UI 컴포넌트를 "만들어나가는 중"이라고 밝히며, 색은 모드와 무관한 Basic Color와 모드에 따라 전환되는 Theme Color로 나뉜다 [src:2][src:4]. 공개된 디자인 시스템 사이트나 브랜드 가이드는 없고, 이 문서의 값은 서비스가 내려보내는 CSS 변수와 렌더된 화면의 계산 스타일에서 읽었다 [src:1].

## Colors

색은 `--background-*`, `--foreground-*`, `--border-*`, `--button-*` 네 계열의 시맨틱 변수로 발행되고, 같은 이름에 라이트·다크 두 값이 `prefers-color-scheme`으로 주입된다 [src:1]. 이 카탈로그는 라이트를 기본 이름으로, 다크를 `dark-` 접두로 나눠 적는다. 앱 안의 수동 테마 토글은 확인하지 못했다 [src:1].

브랜드 포인트는 `{colors.primary}`(보라) 하나다. 변수명이 아니라 리터럴로 쓰이며, 다크에서도 같은 값이다 — 활성 요일 탭, 활성 칩, "N" 뱃지, 진행바 채움, 활성 네비 링크, 멤버십 "현재 이용 중" 라벨이 이 색을 쓴다 [src:1]. 라이트의 `{colors.primary-slight-1}`·`{colors.primary-slight-2}`는 보라 틴트로 하이라이트와 보조 버튼에 들어간다 [src:1]. 다크에서는 같은 자리가 불투명한 틴트가 아니라 중립 회색 `{colors.dark-button-slight}`로 바뀐다 [src:1].

중립은 순수 무채색이다. 다크 캔버스는 `{colors.dark-bg-1}`(홈 히어로 위 투명 헤더 제외)이고 그 아래 순검정 `{colors.dark-bg-2}`가 깔린다 — 라이트와 달리 다크에서는 "2번 배경"이 1번보다 더 어둡다 [src:1]. 토스트와 보라 회색 버튼은 남보라를 띤 `{colors.dark-bg-toast}` 계열이다 [src:1]. UP 뱃지 `{colors.badge-red}`는 빨강 포인트의 유일한 쓰임이다 [src:1]. 성공·경고 시맨틱 변수는 공개되지 않았다 [src:1].

## Typography

단일 서체 Pretendard를 서비스 전체에 쓴다. 전역 리셋 `*:not(svg) { font: inherit }`과 `@import`된 Pretendard 정적 CSS가 한글·영문을 같은 스택으로 묶는다 [src:7][src:1]. 기본은 16px/24px 400이고 관찰된 굵기는 400·500·600·700 넷이다 [src:1].

일반 페이지는 px 고정 스케일이다 — 페이지 H1 32px/48px 700, 카드 타이틀 24px/36px 700, 섹션 제목 16px/24px 700, 네비 링크 14px/21px 700, 검색 입력 14px/21px 600, 뱃지 12px·10px 700 [src:1]. 홈의 콜렉션 영역만 다르다 — `DefaultCollectionMediaQueryBlock`이 기준 글자 크기를 뷰포트 폭에 비례(`0.82646vw`, 1416px 이하 `0.97871vw` …)로 바꾸고 안쪽은 em 단위다. 1440px 기준 1em은 약 11.9px이고, 콜렉션 제목 1.75em, 카드 제목 1.125em이다 [src:1]. frontmatter의 스케일은 px 고정 페이지 스케일만 옮겼다.

## Spacing

별도 spacing 토큰 변수가 없다 — 값은 컴포넌트에 분산돼 있다 [src:1]. 관찰된 값은 헤더 높이 64px, 헤더 아이콘 버튼 40×40px, 검색창 높이 40px, 멤버십 카드 안쪽 여백 24px, 칩 좌우 패딩 약 12px(1em)이다 [src:1]. frontmatter `spacing:`은 이 관찰값을 정리한 것이지 브랜드가 발행한 스케일이 아니다.

## Rounded

radius도 토큰이 없고 스타일시트에 3·4·7·8·10·14·16·18·20px, `0.25rem`·`0.25em`·`1rem`, `50%`·`9999px`가 흩어져 있다 [src:1]. 대표값은 카드 썸네일·검색창·멤버십 카드·필터 버튼 4px, 칩 `9999px`, 진행바 16px, 컬렉션 안 버튼·뱃지 `0.25em`(약 3px)이다. 요일 탭·아이콘 버튼·점 인디케이터·"N" 뱃지는 `50%` 원형인데, 이 값은 `rounded:` 토큰으로 옮기지 않았다.

## Elevation & Depth

공개된 elevation 체계가 없다. 관찰된 `box-shadow`는 서브페이지 헤더의 `0 1px 0 0 var(--border-1)` 한 줄뿐이고, 홈 최상단에서는 투명 처리돼 사라진다 [src:1]. `--shadow-basic`·`--shadow-dropdown` 변수는 정의돼 있지만 이를 쓰는 규칙은 확인하지 못했다 [src:1]. 깊이는 그림자가 아니라 `{colors.dark-bg-1}` → `{colors.dark-bg-3}`의 면 명도 차와 1px 보더로 만든다.

## Shapes

둥근 사각은 4px로 조용히 닫고(썸네일·입력·카드), 칩은 완전한 알약, 요일 탭과 아이콘 버튼은 원이다. 푸밍은 둥근 반원 몸통 자체가 이 곡률 언어의 근원으로 읽힌다 [src:6]. 헤더가 홈 최상단에서는 히어로 이미지 위 투명으로, 서브페이지에서는 불투명 면에 하단 1px 선으로 바뀐다 [src:1].

## Components

다음은 렌더된 https://laftel.net 의 계산 스타일이다(다크, 1440px) [src:1].

### header

높이 64px, 서브페이지는 `{colors.dark-bg-1}` 배경에 하단 1px `--border-1`이고 홈 최상단은 투명이다. 배경·그림자 전환은 `.4s`다. 항목은 태그검색·요일별 신작·멤버십·스토어·이벤트와 루프(N 뱃지)이다 [src:1].

### nav-link

14px/21px 700, 흰 글자에 활성·hover는 `{colors.primary}`다. 투명 헤더에서는 hover가 흰색 80%로 흐려진다 [src:1].

### search-field

높이 40px, 폭 288px, radius 4px, 패딩 `0 12px 0 16px`, 보더 `{colors.dark-border-1}`. 안쪽 입력은 14px/21px 600이고 placeholder는 `{colors.dark-fg-3}`다 [src:1].

### button-cta

히어로 CTA("보러가기")는 흰 배경 `{colors.white}`에 어두운 글자, 높이 약 44.6px, radius `0.25em`이고 hover 배경은 흰색 70%다 [src:1].

```tsx
<Button variant="cta">보러가기</Button>
```

### button-secondary

배경 `{colors.dark-bg-1}`, 글자 `{colors.dark-fg-1}`, 1px `{colors.dark-border-2}` 보더, 높이 약 29.8px, 패딩 `0 1em`이다 [src:1].

### chip-active

보라 `{colors.primary}` 배경에 흰 글자, 알약 `9999px`, 높이 약 35.7px(3em), 보더 없음이다 [src:1].

### chip-inactive

`{colors.dark-bg-1}` 배경, 글자 `{colors.dark-fg-2}`, 1px `{colors.dark-border-1}` 보더다 [src:1].

### badge-up

카드형은 `{colors.badge-red}` 배경에 흰 글자 10.4px 700, radius `0.25em`, 높이 17px이다. 텍스트형은 `{colors.badge-red-weak}` 배경에 `{colors.badge-red}` 글자, 높이 20px, radius 4px이다 [src:1].

### badge-new

"N" 뱃지는 `{colors.primary}` 배경 원형, 높이 약 17px, 10px 700 흰 글자다 [src:1].

### membership-card

폭 580px, 배경 `{colors.dark-bg-1}`, 보더 `{colors.dark-border-1}`, radius 4px, 안쪽 패딩 24px이다. "현재 이용 중" 라벨은 보라 16px 700이다 [src:1].

### poster-card

폭 222px, 이미지 radius 4px, 제목은 1.125em 400, 회차는 700이다. 하단 4.46px 진행바는 보라 채움이다. hover 때 `cursor: pointer` 외 시각 변화는 확인되지 않았다 [src:1].

## Do's and Don'ts

**Do** 보라 `{colors.primary}`는 활성 상태(칩·탭·네비·진행)에만 쓴다 — 포인트 색이 "지금 선택된 것"의 신호로 일관된다 [src:1].

**Do** 다크 캔버스는 순검정 대신 `{colors.dark-bg-1}`을 기본 면으로 하고, 순검정 `{colors.dark-bg-2}`는 한 단계 더 깊은 배경에만 쓴다 [src:1].

**Do** 카피에는 약간의 위트를 곁들인다 — 푸밍 같은 캐릭터 톤이 친근함의 원천이다 [src:3].

**Don't** 라프텔의 멤버십 구독 플로우, 애니 작품명·요일별 신작 구성, 푸밍 캐릭터 자체를 그대로 재현하지 않는다 — 다크 캔버스와 보라 한 점이라는 시각 처리만 차용한다 [src:1][src:3].

**Don't** 가시적 포커스 링을 지우지 않는다. 라프텔은 전역 `outline: none`에 `:focus-visible` 규칙이 0건이라 키보드 포커스가 보이지 않는다 — 이는 따라 하지 않을 사례다 [src:1].

## Responsive Behavior

공개된 브레이크포인트 표는 없다(no published breakpoint system surfaced). 홈 콜렉션 영역은 기준 글자 크기를 폭에 비례시켜 반응형을 구현하는데, 1417px 이상은 0.82646vw, 1416px 이하는 0.97871vw, 1040px 이하는 1.20052vw, 850px 이하는 1.55735vw, 496px 이하는 2.12247vw이다. 터치 기기이면서 480px 이하이면 16px 고정이다 [src:1]. 뷰포트 메타에 `maximum-scale=1`이 있어 핀치 줌이 막혀 있다 [src:1].

## Known Gaps

- 공식 브랜드 가이드·디자인 시스템 문서가 없다 — 값은 CSS 변수와 렌더된 계산 스타일에서 읽었다 [src:1].
- 라이트 모드는 CSS 소스에서만 읽었고 렌더 화면으로 확인하지 못했다 [src:1].
- 보라의 hover/pressed 전용 셰이드, 성공·경고 시맨틱 색, 비구독 상태의 구독 CTA, 플레이어 UI는 확인하지 못했다 [src:1].
- 그림자 실사용 값이 공개돼 있지 않고, `rounded`와 `spacing` 토큰은 관찰값을 정리한 것이다 [src:1].
- 푸밍 정사각 심볼의 독립 SVG와 투명 PNG 원본, 로고 사용 규정은 공개돼 있지 않다 — 로고는 홈이 선언한 apple-touch-icon(152px)이다 [src:6].
- 라이트에서 `--background-highlight`의 다크 값은 반투명 보라 `rgba(129,107,255,.1)`이어서 토큰으로 옮기지 않았다 [src:1].

## References

1. https://laftel.net — 서비스 홈. 인라인 스타일의 시맨틱 색 변수(라이트·다크), 렌더된 화면의 계산 스타일, 헤더·칩·카드 실측과 메타 확인.
2. https://blog.laftel.net/post/17 — 라프텔 팀 블로그 "라프텔의 디자인 원칙". 디자인 원칙 4가지와 디자인 시스템 서술.
3. https://brunch.co.kr/@laftelux/8 — 라프텔 프로덕트 디자인팀 Brunch 원문(2024-04-15). 같은 디자인 원칙.
4. https://blog.laftel.net/post/11 — 라프텔 팀 블로그 다크모드 제작기. Basic Color와 Theme Color 구분.
5. https://blog.laftel.net/post/10 — 라프텔 팀 블로그 UX Writing 가이드. 위트 있는 카피 톤.
6. https://static.laftel.net/favicon-152.png — 푸밍 캐릭터 마크(apple-touch-icon 152px).
7. https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.6/dist/web/static/pretendard.css — 서비스 CSS 청크가 `@import`하는 Pretendard 정적 CSS.
