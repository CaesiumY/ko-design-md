---
name: 원티드
slug: wanted
category: career
last_updated: "2026-08-23"
created_at: "2026-05-12"
sources:
  - https://montage.wanted.co.kr/docs/getting-started
  - https://montage.wanted.co.kr/docs/getting-started/terms-of-use
  - https://montage.wanted.co.kr/docs/foundations/base-material/colors/atomic
  - https://montage.wanted.co.kr/docs/foundations/base-material/colors/semantic
  - https://montage.wanted.co.kr/docs/foundations/base-material/typography
  - https://montage.wanted.co.kr/docs/foundations/base-material/grid
  - https://montage.wanted.co.kr/docs/foundations/base-material/elevation/normal
  - https://montage.wanted.co.kr/docs/foundations/base-material/elevation/spread
  - https://montage.wanted.co.kr/docs/foundations/base-material/icons
  - https://montage.wanted.co.kr/docs/components/actions/button/design
  - https://montage.wanted.co.kr/docs/components/selection-and-input/text-field/design
  - https://montage.wanted.co.kr/docs/components/feedback/snackbar/design
  - https://montage.wanted.co.kr/docs/release-note
  - https://github.com/wanteddev/montage-web
  - https://github.com/wanteddev/wanted-sans
  - https://github.com/orioncactus/pretendard
  - https://www.wanted.co.kr
lang: ko
logo: https://getdesign.kr/logos/wanted.png
colors:
  ## Brand
  blue-800: oklch(0.563 0.241 261)   # core Wanted Blue (#0066FF), 단일 primary
  blue-700: oklch(0.607 0.225 257)   # hover step
  blue-850: oklch(0.529 0.220 258)
  blue-900: oklch(0.484 0.205 258)
  blue-100: oklch(0.954 0.022 250)   # --bg-brand-subtle
  blue-50: oklch(0.985 0.012 247)
  blue-975: oklch(0.149 0.069 257)   # dark theme --bg-brand-subtle
  ## Brand gradient
  gradient-stop-1: oklch(0.563 0.241 261)   # blue-800 (#0066FF)
  gradient-stop-2: oklch(0.709 0.232 346)   # magenta (#FF53C0) — 핸드오프 README가 명시하는 mid-stop
  gradient-stop-3: oklch(0.686 0.210 41)   # coral-600 (#FF5E00)
  ## Gray
  gray-50: oklch(0.971 0 0)
  gray-100: oklch(0.881 0 0)
  gray-150: oklch(0.808 0 0)
  gray-200: oklch(0.747 0 0)
  gray-300: oklch(0.681 0 0)
  gray-400: oklch(0.629 0 0)
  gray-500: oklch(0.555 0 0)
  gray-600: oklch(0.471 0 0)
  gray-700: oklch(0.382 0 0)
  gray-800: oklch(0.286 0 0)
  gray-850: oklch(0.258 0 0)
  gray-900: oklch(0.184 0 0)
  gray-950: oklch(0.155 0 0)
  gray-1000: oklch(0.110 0 0)
  ## Neutral
  neutral-50: oklch(0.972 0.002 286)
  neutral-75: oklch(0.961 0.002 286)
  neutral-100: oklch(0.929 0.003 286)
  neutral-150: oklch(0.896 0.005 270)
  neutral-200: oklch(0.876 0.006 269)
  neutral-300: oklch(0.792 0.009 272)
  neutral-400: oklch(0.728 0.013 273)
  neutral-500: oklch(0.659 0.015 273)
  neutral-600: oklch(0.601 0.015 273)
  neutral-700: oklch(0.521 0.018 273)   # text-secondary 앵커
  neutral-750: oklch(0.438 0.018 273)
  neutral-800: oklch(0.357 0.013 274)
  neutral-825: oklch(0.298 0.010 273)   # alpha-text 베이스 (light)
  neutral-850: oklch(0.281 0.011 273)
  neutral-875: oklch(0.259 0.010 273)   # body text 앵커
  neutral-900: oklch(0.237 0.008 273)
  neutral-925: oklch(0.196 0.008 273)
  neutral-950: oklch(0.166 0.005 271)
  neutral-960: oklch(0.148 0.004 277)   # 다크 캔버스
  neutral-970: oklch(0.135 0.002 286)
  neutral-980: oklch(0.108 0.002 286)
  ## Semantic signal
  red-700: oklch(0.546 0.220 27)   # --fg-danger
  red-600: oklch(0.643 0.231 27)
  red-100: oklch(0.951 0.018 18)   # --bg-danger-subtle (#FEECEC)
  red-200: oklch(0.901 0.044 22)
  green-600: oklch(0.673 0.211 144)   # --fg-success
  green-100: oklch(0.968 0.052 154)   # --bg-success-subtle (#D9FFE6)
  orange-700: oklch(0.625 0.148 56)   # --fg-warning
  orange-600: oklch(0.733 0.179 56)
  orange-100: oklch(0.967 0.030 81)   # --bg-warning-subtle (#FEF4E6)
  coral-600: oklch(0.686 0.210 41)   # brand gradient end-stop
  ## Extended atomic ramps
  lime-600: oklch(0.756 0.232 138)   # ≈ #58CF04
  cyan-600: oklch(0.736 0.131 216)   # ≈ #00BDDE
  sky-600: oklch(0.716 0.165 240)   # ≈ #00AEFF
  violet-600: oklch(0.532 0.246 284)   # ≈ #6541F2
  purple-600: oklch(0.677 0.245 313)   # ≈ #CB59FF
  pink-600: oklch(0.673 0.279 339)   # ≈ #F553DA (atomic; gradient mid는 #FF53C0)
  ## Semantic alias — Light
  # Background
  bg-canvas: oklch(1 0 0)
  bg-surface: oklch(1 0 0)
  bg-subtle: oklch(0.972 0.002 286)   # neutral-50, page bg
  bg-muted: oklch(0.961 0.002 286)   # neutral-75, hover fill
  bg-elevated: oklch(1 0 0)   # dialog/popover
  bg-inverse: oklch(0.148 0.004 277)   # neutral-960
  bg-brand: oklch(0.563 0.241 261)   # blue-800
  bg-brand-subtle: oklch(0.954 0.022 250)   # blue-100
  bg-danger-subtle: oklch(0.951 0.018 18)
  bg-success-subtle: oklch(0.968 0.052 154)
  bg-warning-subtle: oklch(0.967 0.030 81)
  # Foreground (alpha multiplier on neutral-825 / neutral-875)
  fg-strong: oklch(0.148 0.004 277)   # @ alpha 1 (= neutral-960)
  fg-default: oklch(0.259 0.010 273 / 0.88)   # body
  fg-secondary: oklch(0.298 0.010 273 / 0.61)   # labels, captions
  fg-tertiary: oklch(0.298 0.010 273 / 0.43)   # placeholder
  fg-disabled: oklch(0.298 0.010 273 / 0.28)
  fg-on-brand: oklch(1 0 0)
  fg-brand: oklch(0.563 0.241 261)
  fg-link: oklch(0.563 0.241 261)
  fg-danger: oklch(0.546 0.220 27)
  fg-success: oklch(0.673 0.211 144)
  fg-warning: oklch(0.625 0.148 56)
  # Borders
  border-subtle: oklch(0.521 0.018 273 / 0.08)
  border-default: oklch(0.521 0.018 273 / 0.22)
  border-strong: oklch(0.521 0.018 273 / 0.35)
  border-inverse: oklch(1 0 0 / 0.16)
  border-brand: oklch(0.563 0.241 261)
  ## Semantic alias — Dark
  # Background
  dark-bg-canvas: oklch(0.148 0.004 277)   # neutral-960
  dark-bg-surface: oklch(0.166 0.005 271)   # neutral-950
  dark-bg-subtle: oklch(0.135 0.002 286)   # neutral-970
  dark-bg-muted: oklch(0.196 0.008 273)   # neutral-925
  dark-bg-elevated: oklch(0.237 0.008 273)   # neutral-900
  dark-bg-inverse: oklch(1 0 0)
  dark-bg-brand-subtle: oklch(0.149 0.069 257)   # blue-975
  dark-bg-danger-subtle: oklch(0.298 0.10 22 / 0.32)   # synthesized for dark contrast
  dark-bg-success-subtle: oklch(0.298 0.10 144 / 0.28)   # synthesized
  dark-bg-warning-subtle: oklch(0.298 0.10 56 / 0.32)   # synthesized
  # Foreground (alpha on white in dark theme)
  dark-fg-strong: oklch(1 0 0)
  dark-fg-default: oklch(1 0 0 / 0.88)
  dark-fg-secondary: oklch(1 0 0 / 0.61)
  dark-fg-tertiary: oklch(1 0 0 / 0.43)
  dark-fg-disabled: oklch(1 0 0 / 0.28)
  dark-fg-on-brand: oklch(1 0 0)
  dark-fg-brand: oklch(0.715 0.155 255)   # blue-400 (brightened from blue-800; synthesized)
  dark-fg-danger: oklch(0.715 0.220 27)   # synthesized (red @ ↑ lightness)
  dark-fg-success: oklch(0.760 0.180 144)   # synthesized (green @ ↑ lightness)
  dark-fg-warning: oklch(0.778 0.158 64)   # synthesized (orange @ ↑ lightness)
  # Borders
  dark-border-subtle: oklch(1 0 0 / 0.08)
  dark-border-default: oklch(1 0 0 / 0.22)
  dark-border-strong: oklch(1 0 0 / 0.35)
typography:
  # Display (3)
  display1:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.286
    letterSpacing: -0.0319em
  display2:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.300
    letterSpacing: -0.0282em
  display3:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.334
    letterSpacing: -0.0270em
  # Title (3)
  title1:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.375
    letterSpacing: -0.0253em
  title2:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.358
    letterSpacing: -0.0236em
  title3:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.334
    letterSpacing: -0.0230em
  # Heading (2)
  heading1:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.364
    letterSpacing: -0.0194em
  heading2:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.400
    letterSpacing: -0.0120em
  # Headline (2)
  headline1:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.445
    letterSpacing: -0.0020em
  headline2:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.412
    letterSpacing: 0em
  # Body (2 × default/read)
  body1:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.500
    letterSpacing: 0.0057em
  body1-read:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.625
    letterSpacing: 0.0057em
  body2:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.467
    letterSpacing: 0.0096em
  body2-read:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.600
    letterSpacing: 0.0096em
  # Label (2)
  label1:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.429
    letterSpacing: 0.0145em
  label1-read:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.571
    letterSpacing: 0.0145em
  label2:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.385
    letterSpacing: 0.0194em
  # Caption (2)
  caption1:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.334
    letterSpacing: 0.0252em
  caption2:
    fontFamily: "\"Pretendard JP\", \"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.273
    letterSpacing: 0.0311em
spacing:
  space-0: 0px
  space-2: 2px
  space-4: 4px
  space-8: 8px
  space-12: 12px
  space-16: 16px
  space-20: 20px
  space-24: 24px
  space-32: 32px
  space-40: 40px
  space-48: 48px
  space-64: 64px
  space-96: 96px
  space-128: 128px
rounded:
  radius-2: 2px   # 미세 토큰
  radius-4: 4px   # checkbox
  radius-8: 8px   # 컴포넌트 디폴트 (버튼 md/lg, 카드, 입력)
  radius-12: 12px   # 카드, 디테일 로고 타일, 버튼 xl
  radius-16: 16px   # hero banner
  radius-20: 20px
  radius-24: 24px
  radius-32: 32px
  radius-full: 9999px   # pills (chip, filter-pill, toggle, avatar, icon button, search)
opacity:
  alpha-5: 0.05
  alpha-8: 0.08
  alpha-12: 0.12
  alpha-16: 0.16
  alpha-22: 0.22
  alpha-28: 0.28
  alpha-35: 0.35
  alpha-43: 0.43
  alpha-52: 0.52
  alpha-61: 0.61
  alpha-74: 0.74
  alpha-88: 0.88
  alpha-97: 0.97
fonts:
  font-display: "\"Wanted Sans Variable\", \"Wanted Sans\", \"Pretendard JP\", \"Pretendard Variable\", system-ui, sans-serif"
  font-mono: "\"SF Mono\", ui-monospace, \"JetBrains Mono\", Menlo, Consolas, \"Courier New\", monospace"
font-display-src: https://cdn.jsdelivr.net/npm/wanted-sans@1.0.3/fonts/webfonts/variable/split/WantedSansVariable.css
---

# 원티드 (Wanted) — design.md

> 원티드랩이 운영하는 한국 1위 채용·커리어 플랫폼. `wanted.co.kr` 잡 마켓플레이스, 채용담당자용 Wanted Talent 대시보드, 프리미엄 커리어 코칭 구독 Wanted Plus, 후보자/리크루터용 iOS/Android 앱을 단일 디자인 시스템 위에 얹는다 [src:17]. 원티드의 디자인 시스템은 **몽타주(Montage)**라는 이름으로 `montage.wanted.co.kr`에 공개 문서화되어 있으며 [src:1], 웹 구현체는 `wanteddev/montage-web` 레포에 **MIT 라이선스**로 공개된다 [src:14] — 상업적 이용·수정·재배포가 허용되고 저작권 표시와 라이선스 전문 포함이 의무다 [src:2]. 본 문서의 서술 골격은 2025년 Wanted Design System 핸드오프 번들(`wanted-design-system/` 익스포트 — `README.md`, `colors_and_type.css`, `components.css`(23개 컴포넌트 그룹), `components.html` 라이브 갤러리, `ui_kits/wanted-web/` 마켓플레이스 재구성)에서 합성됐고, 이번 갱신에서 그 정량값을 몽타주 공개 문서 및 공개 토큰 소스와 대조했다. 결과는 세 갈래다 — **교차검증됨**: 타입 스케일 19개 스타일(57개 값 중 56개) [src:5], 알파 사다리 13단 [src:14], 본문이 병기한 hex 12개 중 11개 [src:3]. **단, 이 hex 대조는 병기된 hex에 대한 것이지 실제 토큰 값인 OKLCH의 정확성을 보증하지 않는다** — 아래 Known Gaps 참조. **공개 출처와 어긋남**: 스페이싱 사다리, 브레이크포인트, 엘리베이션 값, 시맨틱 alias 명명 [src:4][src:6][src:7][src:14]. **공개 토큰 자체가 없음**: 라운드 — 공식 테마는 radius 스케일을 노출하지 않아 본 문서의 사다리는 번들 관찰값으로 남는다 [src:14]. 어긋나는 값은 덮어쓰지 않고 각 절에서 차이를 명시했다.

## Brand & Style

원티드는 한국 디자인-엔지니어링 씬에서 **정밀 스케일 토큰 시스템 + 자체 브랜드 서체 + 시그너처 그라디언트 로고**의 조합으로 알려진다. 공식 문서는 이 시스템을 몽타주(Montage)로 명명하고 **Extensibility·Consistency·Efficiency** 3원칙 위에서 운영한다고 밝힌다 [src:1]. 공개 atomic 팔레트는 채도 0의 `neutral` 14단계 + cool blue-tinted `coolNeutral` 21단계 dual-neutral 구조에 hue ramp 11종(blue·red·green·orange·redOrange·lime·cyan·lightBlue·violet·purple·pink)을 얹으며 — blue만 14단계이고 나머지는 11~12단계다 [src:3], 원티드랩이 자체 제작한 오픈소스 OFL 서체 `Wanted Sans`를 함께 운용한다 [src:15]. 시스템의 가장 인지 가능한 마크는 **blue → magenta → orange** 3-stop 그라디언트로 그려진 심볼이며, 이 그라디언트는 심볼·아바타·잡카드 썸네일 placeholder에만 적용되고 CTA·헤더·풀-블리드 표면에는 적용되지 않는다. 2025년 핸드오프 번들은 이 토큰 시스템 위에 `components.css` production 스타일시트로 23개 컴포넌트 그룹(버튼·폼·선택·칩/배지·아바타·툴팁·로딩·세그먼트/탭·페이지네이션·리스트셀·카드·디바이더·알림/토스트·모달/시트/메뉴·아코디언·테이블·브레드크럼·빈 상태)을 함께 ship하며, `components.html` 갤러리에서 light/dark 토글로 라이브 확인된다.

전체 무드는 **clean, generous, neutral-anchored** — Toss·Naver와 결이 가깝고 splashy한 서양 채용 브랜드와는 거리가 있다. 색은 절제되어 사용되고 타이포가 위계의 대부분을 짊어진다. 표면은 흰 캔버스(light) 또는 `oklch(0.148 0.004 277)` 다크 캔버스(dark)로 평면화되며, 텍스처·노이즈·전면 사진은 chrome에 사용되지 않는다. 카드는 기본적으로 그림자 없이 1px `border-subtle` 헤어라인이 구조를 짊어지고, 그림자는 popover·dropdown·modal 같은 elevated surface에서만 등장한다.

대상 사용자는 후보자(구직자)와 리크루터 양쪽이며, 시스템은 마케팅 사이트·잡 마켓플레이스·리크루터 대시보드·네이티브 앱을 동일한 디자인 시스템으로 횡단한다. 본 문서는 잡 마켓플레이스(`wanted.co.kr` candidate-side) surface를 1차 관찰 대상으로 한다 — SSOT 번들의 `ui_kits/wanted-web/`이 이 surface를 1:1 재구성하기 때문이다.

Voice는 **친근한 2인칭 + 부드러운 존댓말**로 요약된다. 사무어조와 격식 호칭은 회피되고, 종결어미는 격식 `-습니다`보다 따뜻한 `-요`/`-어요`/`-아요`를 표준으로 한다 — "이력서를 등록해 보세요", "받은 제안이 없어요", "지원이 완료되었어요" 같은 톤이 시스템 카피의 시그너처다. 버튼은 동사 — "지원하기", "저장하기", "시작하기", "둘러보기" — 가 라벨 형태이며 명사·디렉티브("여기를 눌러주세요")는 표준이 아니다. 본 catalog 메타 문서는 한국어 평서체(`-다`)로 기술하며, 원티드의 존댓말 정책은 product surface 카피에 한해 적용되는 규칙임을 분리해 둔다.

## Colors

원본 hex는 SSOT 번들 `colors_and_type.css`에 정의되어 있으며, 본 문서는 OKLCH로 변환해 표기한다. 시스템의 구조적 특징은 두 가지이며 **둘 다 몽타주 공개 토큰으로 확인된다** — (1) **dual neutral ramp** (채도 0의 흑백 톤과 cool blue-tinted 톤이 별도 램프로 운영됨), (2) **alpha multiplier로 텍스트 위계를 합성** (별도 gray hex를 정의하는 대신 한 베이스 색 위에 알파 사다리를 곱해 라이트/다크 양쪽에서 일관된 "soft black/white" 톤을 만든다).

공개 토큰과의 대조 결과는 다음과 같다 [src:3][src:4].

- **병기 hex 12개 중 11개가 공개 atomic 토큰과 자릿수까지 일치한다** — 예컨대 브랜드 primary `#0066FF`(≈ `oklch(0.563 0.241 261)`)는 공개 `primary-normal`/`blue-50`과 같은 값이다. 나머지 대응은 `#FEECEC`→`red-95`, `#D9FFE6`→`green-95`, `#FEF4E6`→`orange-95`, `#FF5E00`→`redOrange-50`, `#58CF04`→`lime-50`, `#00BDDE`→`cyan-50`, `#00AEFF`→`lightBlue-50`, `#6541F2`→`violet-50`, `#CB59FF`→`purple-50`, `#F553DA`→`pink-50`. 일치하지 않는 하나는 그라디언트 mid-stop `#FF53C0`로, 공개 토큰 집합에 존재하지 않는다.
- **램프 이름이 서로 뒤집혀 있으니 주의한다** — 본 문서의 `gray-*`(채도 0, 14단계)가 공개 이름으로는 `neutral`이고, 본 문서의 `neutral-*`(cool tinted, 21단계)가 공개 이름으로는 `coolNeutral`이다. 다운스트림이 공식 패키지를 직접 쓸 때 이름만 보고 매핑하면 두 램프가 정확히 맞바뀐다.
- **단계 번호 체계가 다르다** — 공개 램프는 0~99 스케일(`blue-50`이 코어 앵커)을 쓰고 본 문서는 번들의 50~1000 스케일(`blue-800`이 코어 앵커)을 쓴다. 값은 대응하지만 토큰 이름은 1:1로 옮겨지지 않는다.
- **시맨틱 alias 명명은 공개 체계와 다르다** — 공식은 `Primary`(Normal/Strong/Heavy), `Label`(Normal/Strong/Neutral/Alternative/Assistive/Disable), `Fill`, `Line`(Normal/Solid), `Background`(Normal/Elevated/Transparent), `Static`, `Inverse`, `Interaction`, `Status`(Positive/Cautionary/Negative), `Accent`, `Material` 그룹으로 운영된다. 아래 `bg-*`/`fg-*`/`border-*` alias는 번들 명명이며 공식 이름이 아니다 — 이식할 때는 공식 그룹명으로 옮기는 편이 안전하다.

### Brand

브랜드 primary는 `{colors.blue-800}` 단일 — 버튼, 링크, 포커스 링, 핵심 데이터에 사용된다. CTA 표면 외에는 배경으로 사용하지 않는다 — 채도 강조가 아니라 단일 strong stop 정책이다.

### Brand gradient (심볼 전용)

심볼 마크 자체 + 일부 아바타 circle + 일부 잡카드 썸네일 placeholder에만 적용된다. 마케팅 hero용 변형은 `0E1F3F → blue-800 → magenta`로 깊은 navy를 추가해 `linear-gradient(120deg, ...)`로 그려지지만, 카탈로그 토큰으로 노출된 것은 아니다.

### Gray (14-step, single tint — 채도 0)

`gray-*` 패밀리는 채도 0의 단순 흑백 톤이며, 시스템 토큰의 baseline이 아니라 utility용이다. UI 표면 색은 거의 항상 `neutral-*` 패밀리에서 호출된다. 공개 팔레트에서 이 램프의 이름은 `neutral`이고 단계 수는 14로 일치한다 [src:3].

### Neutral (21-step, cool blue-tinted — 워크호스 패밀리)

`neutral-700` (`oklch(0.521 0.018 273)`)이 `border-subtle`/`border-default`/`border-strong`의 알파 베이스이며, `neutral-825` (`oklch(0.298 0.010 273)`)가 `fg-secondary`/`fg-tertiary`/`fg-disabled`의 알파 베이스, `neutral-875` (`oklch(0.259 0.010 273)`)가 `fg-default`(body)의 알파 베이스다. text와 border가 서로 다른 neutral 단계에서 알파를 곱하는 구조이므로, 토큰 정의 시 두 베이스를 혼동하지 않도록 분리해야 한다.

**이 3-베이스 구조는 공개 시맨틱 토큰에서 그대로 확인된다** [src:4] — 공식 `Line - Normal` 토큰군은 단일 베이스 `#70737C`(`coolNeutral-50`)에 알파를 얹고 (별도 그룹인 `Line - Solid`는 보더 중첩을 막으려고 알파 없는 불투명 색을 쓰고, `line-primary`/`line-status`는 각 hue 베이스를 쓴다), `Label` 토큰군은 `label-neutral`만 `#2E2F33`(`coolNeutral-22`)를, `label-alternative`/`assistive`/`disable`은 `#37383C`(`coolNeutral-25`)를 베이스로 쓴다. 즉 "border는 한 베이스, body text는 또 다른 베이스, 그 아래 위계는 세 번째 베이스"라는 분리가 공식 체계와 일치한다. 다만 **본 문서의 OKLCH 값은 공개 hex와 정확히 대응하지 않는다** — 번들이 이 세 앵커를 공개 램프보다 어두운 단계로 정의하고 있어(예: `neutral-875` = `oklch(0.259 …)` vs 공개 `coolNeutral-22` = `#2E2F33` ≈ `oklch(0.306 …)`), 값 자체는 번들 관찰값으로 남긴다.

### Extended atomic ramps (lime / cyan / sky / violet / purple / pink — accent 전용)

원자 팔레트는 코어 신호색 외에도 6개 hue를 ramp로 ship한다 (공개 팔레트 기준 hue당 11~12단계) — 각 hue의 600 앵커만 옮기면:

이들은 제품 작업색이 아니라 hover·select 강조, 일러스트·차트 accent용이다 — product surface는 여전히 시맨틱 alias만 호출하고, atomic ramp 직접 참조는 새 alias를 정의할 때로 제한한다. 공식 시맨틱 체계도 같은 정책을 `Accent - Foreground` / `Accent - Background` 그룹으로 표현하며, accent hue 집합은 Red · Red Orange · Orange · Lime · Green · Cyan · Light Blue · Blue · Violet · Purple · Pink다 [src:4].

**위 6개 앵커의 병기 hex는 모두 공개 atomic 토큰과 일치한다** [src:3] — 다만 공개 이름은 단계 번호가 `-50`이고(`lime-50`·`cyan-50`·`violet-50`·`purple-50`·`pink-50`), 본 문서의 `sky-600`은 공개 이름으로 **`lightBlue-50`**이다. 각 ramp의 전체 단계와 코어 외 색은 공개 atomic 문서 [src:3] 또는 SSOT `colors_and_type.css`를 참조한다. (OKLCH는 sRGB → OKLab 변환 근사값이며 병기 hex 대비 미세 오차가 있다.)

### Alpha 스케일 — 텍스트 oncoloring

13단계 알파 ladder. Light 테마는 `oklch(0.259 0.010 273)` (= neutral-875) 위에, dark 테마는 `oklch(1 0 0)` 위에 동일한 스케일을 곱한다 — 한 베이스에서 13단계 강도를 만들어내는 구조다.

**이 사다리는 공개 토큰과 단계 단위로 일치한다** — 몽타주 공식 테마의 `opacity` 토큰은 `0 · 5 · 8 · 12 · 16 · 22 · 28 · 35 · 43 · 52 · 61 · 74 · 88 · 97 · 100`으로, 위 13단계를 그대로 포함하고 양 끝점 0·100만 더 갖는다 [src:14]. 공개 시맨틱 토큰의 알파 hex도 같은 사다리에서 나온다 — line 계열은 베이스 `#70737C`(≈ `oklch(0.556 0.014 271)`) 위에 `14` = 8%, `29` = 16%, `38` = 22%를 얹고, label 계열은 `#37383C9C` = 61%, `#2E2F33E0` = 88%로 쌓는다 [src:4]. 본 문서의 정량값 중 공개 출처와 가장 강하게 교차검증되는 항목이다.

### Semantic alias — Dark

다크 모드는 light 모드의 alpha multiplier 구조를 그대로 유지한다 — text 알파 베이스가 `neutral-825`/`neutral-875` → `oklch(1 0 0)`(흰색)로 뒤집힐 뿐이다. 시맨틱 alias의 의미(fg-default = 본문, fg-secondary = label/caption, fg-tertiary = placeholder, fg-disabled = disabled)는 양 테마에서 동일하다.

**위 다크 값 중 `dark-bg-danger/success/warning-subtle`과 `dark-fg-brand/danger/success/warning`은 본 카탈로그가 preview 대비를 맞추려고 합성(synthesized)한 값이며, 공개 출처의 값과 다르다.** 종전 판본은 이를 "SSOT가 surface하지 않은 빈자리"로 설명했으나, 몽타주 공개 문서는 해당 다크 토큰을 모두 공개하고 있으므로 그 설명은 사실이 아니다 — 합성값은 공개 출처 부재 때문이 아니라 번들 기준 팔레트와의 정합을 위해 남겨 둔 것이다. 공식 다크 값은 다음과 같다 [src:4].

- `status-positive` `#1ED45A`(≈ `oklch(0.761 0.214 148)`), `status-cautionary` `#FFA938`, `status-negative` `#FF6363` — 각 hue 램프의 `-60` 단계로, 라이트의 `-50` 단계보다 한 칸 밝다.
- `background-status-*`는 같은 hue를 **알파 8%**로 깔아 만든다 (`#FF636314` ≈ `oklch(0.700 0.191 23 / 0.08)`) — 본 문서가 쓴 0.28~0.32 알파보다 훨씬 옅다.
- `primary-normal`(다크)은 `#3385FF`(`blue-60`, ≈ `oklch(0.633 0.198 259)`)로, 본 문서의 `dark-fg-brand` 값 `oklch(0.715 0.155 255)`보다 어둡고 채도가 높다.
- 다크 텍스트 베이스도 순백이 아니다 — 공식은 `label-normal` `#F7F7F8`(≈ `oklch(0.976 0.001 286)`), `label-neutral` `#C2C4C8` @88%, `label-alternative` `#AEB0B6` @61%처럼 밝은 회색 베이스에 알파를 얹으며, 순백은 `label-strong`에만 쓴다.

다운스트림이 공식 패키지 위에서 구현한다면 위 공개 값을 우선하고, 본 문서의 합성값은 번들 팔레트를 재현할 때만 사용한다.

## Typography

본문/UI 디폴트 서체는 **Pretendard JP** — 한국어 우선 variable 서체로 CJK + Latin 메트릭이 모두 우수하다 [src:16]. 이는 공식 문서가 명시하는 기본 글꼴이며, 원티드랩이 일본어 서비스까지 함께 대응하기 때문에 한국어·영어·일본어를 지원하는 Pretendard JP를 택했다고 밝힌다 [src:5]. Display 표면(대형 헤드라인, 마케팅 커버)에는 **Wanted Sans** (원티드랩 자체 제작 오픈소스 OFL 서체)가 사용된다 [src:15] — 다만 공식 타이포그래피 문서는 기본 글꼴로 Pretendard JP만 명시하고 서체 레포는 Wanted Sans를 "제목과 본문에서 두루" 쓸 수 있다고 적으므로, display 전용이라는 역할 구분은 번들 기준 서술이다.

공식 문서는 줄바꿈 정책도 함께 규정한다 — 개발 시 텍스트가 **음절 단위로 줄바꿈**되므로 디자인 단계에서 별도 개행을 넣지 않는다 [src:5].

`body` font-feature-settings는 `"ss20"`, `"calt"`, `"kern"`이 기본 활성화되며, `-webkit-font-smoothing: antialiased`도 함께 적용된다.

### Type ramp (7 hierarchy × 19 named styles — 공식 타입 스케일과 일치)

총 19 styles. **이 표는 몽타주 공식 타입 스케일 19행과 대응하며, 57개 값 중 56개가 일치한다** — 본 문서에서 공개 출처와 가장 강하게 대조되는 정량 블록이다 [src:5]. 어긋나는 하나는 Headline 1의 행간으로, 공식이 `26px (1.444)`인데 위 표는 `1.445`다. (공식 표는 행간을 px로 고지하고 괄호에 비율을 병기한다 — 예: Display 1 `56px / 72px (1.286)`. 위 값의 `line-height`는 그 비율이다. Headline 1은 `26 ÷ 18 = 1.4444…`라 공식 표기가 `1.444`인데 위 표는 `1.445`이므로, 반올림 차이가 아니라 **번들이 다르게 적은 값**이다. 실제 렌더 차이는 18px 기준 0.02px 미만이라 값을 덮어쓰지 않고 차이만 남긴다.)

시스템의 두 가지 시그너처 — **(1) 18px 이상 모든 스타일에 네거티브 트래킹** (Display 1이 -3.19%로 가장 타이트, Headline 1이 -0.20%로 가장 느슨), **(2) Body 이하는 0~positive 트래킹** (Body 1이 +0.57%, Caption 2가 +3.11%) — 캡션 크기에서 가독성을 보존하려는 의도다. Headline 2(17px)가 트래킹 정확히 `0`으로 두 구간의 경계에 놓인다 [src:5].

### Two reading densities

`body1`/`body2`/`label1`은 각각 **default**(1.5/1.467/1.429)와 **read**(1.625/1.600/1.571) 두 line-height를 갖는다. 산문 단락(잡 디테일 본문, 마케팅 long-form)은 `{typography.body1-read}`를 사용하고, UI 표면(카드 본문, 라벨)은 기본 `body1`을 사용한다.

### HTML 디폴트 매핑

unstyled HTML이 그대로 reasonable한 디폴트를 갖도록 매핑되어 있다.

### Wanted Sans

Wanted Sans는 오픈소스 (OFL 1.1) 서체로, **7가지 기본 굵기**를 지원하며 가변 글꼴로도 제공된다 [src:15]. 디자인·제작 크레딧은 **원티드랩(길형진·강한빈)**이며, **산돌커뮤니케이션은 한글 바탕이 된 본고딕(Source Han Sans)의 크레딧**이다 — 종전 판본의 "Wanted + 산돌 공동 제작"은 이 둘을 혼동한 서술이라 정정한다 [src:15]. Pretendard와 동일한 글꼴 높이를 가져 메트릭 호환성이 유지된다 [src:15] (두 서체의 제작자가 같다).

용도에 대해서도 정정이 필요하다 — README는 Wanted Sans가 **"제목과 본문에서 두루 쓸 수 있으며"**라고 명시하고 본문용 최적화 항목까지 둔다 [src:15]. 따라서 "display 표면 전용"은 서체 자체의 제약이 아니라 번들이 택한 배치일 뿐이다. 공식 타이포그래피 문서는 기본 글꼴로 Pretendard JP만 명시하므로 [src:5], 두 서체의 표면 분담 규칙은 어느 공개 출처에도 없다. 번들의 `colors_and_type.css`는 두 서체를 모두 CDN으로 import한다 — Pretendard JP는 jsDelivr에서 dynamic-subset 변형, Wanted Sans는 webfontkit variable 변형.

몽타주 공식 문서 사이트 자체도 Pretendard JP·Pretendard·Wanted Sans 세 서체를 모두 `static.wanted.co.kr`에서 로드한다 — 두 서체가 한 시스템 안에서 공존한다는 점은 공개 표면에서 확인되지만, 어느 표면에 어느 서체를 쓰는지의 분담 규칙은 공식 문서가 명시하지 않는다 [src:5].

## Spacing

베이스 단위는 **4px**이며 — 공식 그리드 문서도 "4배수 간격으로 구성하는 것을 권장한다"고 명시한다 [src:6] — 번들 사다리는 0~128px 14단계로 정의된다:

**이 사다리는 공식 spacing 토큰과 어긋난다 — 값을 그대로 두되 차이를 밝혀 둔다.** 몽타주 공식 테마의 `spacing` 토큰은 `0 · 0.5 · 1 · 2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64 · 72 · 80`의 20단계이며 [src:14], 위 사다리와 다음 두 방향으로 다르다.

- **공식에는 있고 여기엔 없는 값** — `0.5`·`1`·`6`·`10`·`14`·`56`·`72`·`80`. 특히 6·10·14는 공식 사다리의 정규 단계다.
- **여기엔 있고 공식에는 없는 값** — `96`·`128`. 큰 섹션 간격은 번들 관찰값이다.

따라서 종전 판본의 "비-4의 배수(6, 10, 14)는 토큰에 존재하지 않는다"는 서술은 공식 출처와 배치되어 철회한다. 공식 정책은 오히려 **4배수를 권장하되 시각 보정이 필요하면 2px 단위로, 불가피하면 1px씩 조정할 수 있다**는 쪽이며 [src:6], `0.5`·`1`·`2` 토큰이 그 보정을 위해 존재한다 [src:14]. 이 때문에 `{component.job-card}` body padding `14 16 16`이나 `{component.input}` 좌우 padding `14` 같은 값도 "ladder 밖 로컬 예외"가 아니라 공식 사다리의 정규 단계에 해당한다.

### Grid

| Surface | Columns | Gutter | Max content width |
| --- | --- | --- | --- |
| Mobile | 4 | 16 | — |
| Tablet | 8 | 24 | — |
| Desktop (marketing) | 12 | 24 | ~1080 |
| Desktop (dashboards) | 12 | 24 | ~1280 |

마케팅 표면은 보다 좁은 max-width(~1080)를 가지며, 대시보드는 ~1280으로 확장된다. `ui_kits/wanted-web/`는 1200을 잡고 desktop marketplace의 표준값으로 운영한다.

**위 표는 마켓플레이스 표면 관찰값이며, 공식 그리드 규격과 다르다** [src:6]. 컬럼 그리드를 새로 잡는다면 아래 공식 값을 따른다.

| Surface | Columns | Gutter | Artboard | Max content width |
| --- | --- | --- | --- | --- |
| Web mobile | 2 | 20 | 375 × 635 | — |
| Tablet | 3 | 20 | — | — |
| Web desktop | 12 | 20 | 1440 × 960 | 1100 |
| iOS | — | — | 375 × 812pt | — |
| Android | — | — | 360 × 800dp | — |

차이는 세 군데다 — **거터가 16/24가 아니라 전 구간 20px 단일값**이고, **모바일이 4단이 아니라 2단·태블릿이 8단이 아니라 3단**이며, **데스크톱 최대 콘텐츠 폭이 1080/1280이 아니라 1100**(대형 데스크톱은 1440, 둘 다 padding 포함)이다. 디자이너는 해상도별 전 화면을 그리지 않고 위 대표 규격만 설계하는 것이 공식 지침이다 [src:6].

### Vertical rhythm

마케팅 섹션 사이 **64–96px** 수직 간격이 표준 — 카드와 섹션은 generous한 vertical rhythm을 갖는다. `{component.job-card}` 그리드는 24px × 16px (row × col) gap으로 운영된다.

## Rounded

라운드 토큰은 2~32px 8단계 + `full` 한 단계로 정의된다:

**대부분의 컴포넌트는 `{rounded.radius-8}` 또는 `{rounded.radius-12}`를 사용한다**. Pills은 `{rounded.radius-full}`.

**이 사다리는 공개 출처가 없다.** 몽타주 공식 테마가 노출하는 토큰 카테고리는 `atomic`·`semantic`·`opacity`·`breakpoint`·`spacing`·`zIndex`뿐이며 **radius 스케일 자체가 존재하지 않는다** [src:14]. 위 값은 전부 번들 `components.css` 관찰값이므로, 공식 패키지 위에서 구현하는 다운스트림은 이 사다리를 시스템 토큰이 아니라 컴포넌트별 로컬 값으로 다뤄야 한다. 종전 판본의 "시스템은 6px도 10px도 갖지 않는다"는 서술도 철회한다 — 대조할 공식 사다리가 없을 뿐 아니라, 본 문서 안에서도 `{component.checkbox}`·`{component.badge}`가 6px를, 버튼 md가 10px를 쓰고 있어 성립하지 않는다.

버튼 라운드는 사이즈와 페어로 운영된다 — xs·sm `{rounded.radius-8}`, md 10, lg `{rounded.radius-12}`, xl 14. (md의 10·xl의 14는 토큰 ladder 밖 컴포넌트 로컬값이며, 신 번들이 종전 sm6/md8/lg10/xl12를 이 값으로 교체했다 — `components.css` 관찰값.)

## Elevation & Depth

원티드는 평면이 기본이며 그림자는 elevated surface(popover, dropdown, modal, toast)에서만 등장한다. 카드 자체는 1px `{colors.border-subtle}` 헤어라인이 구조를 짊어진다 — 그림자가 카드 위계를 만들지 않는다.

```yaml
shadow-1: >
  0 1px 2px oklch(0.155 0 0 / 0.06),
  0 1px 3px oklch(0 0 0 / 0.05)
  # 잡카드 로고 타일, 토글 노브
shadow-2: >
  0 2px 6px oklch(0.155 0 0 / 0.07),
  0 1px 2px oklch(0 0 0 / 0.06)
  # 디테일 로고 타일
shadow-3: >
  0 6px 16px oklch(0 0 0 / 0.08),
  0 2px 4px oklch(0.155 0 0 / 0.06)
  # 일반 elevated surface
shadow-4: >
  0 12px 32px oklch(0 0 0 / 0.12),
  0 4px 8px oklch(0.155 0 0 / 0.07)
  # 큰 elevated, 모달
shadow-pop: >
  0 8px 24px oklch(0 0 0 / 0.12)
  # popover, dropdown, modal
```

그림자 색은 `oklch(0.155 0 0)` 또는 순수 검정(`oklch(0 0 0)`) 베이스의 ~5–12% 알파로 통일된다. 두 톤이 함께 쌓이는 패턴(soft-tint + true-black)이 표준이며, navy-tinted 그림자(Toss 류)는 사용되지 않는다 — 단순 검정 + 흰 캔버스의 대비가 시그너처다.

**2겹 합성 원칙은 공식과 일치하지만, 레벨 구성과 값은 다르다.** 공식 문서는 "물체 주변으로 은은하게 퍼지는 주변광 그림자(Ambient shadow)와 특정 방향의 조명에 의해 생기는 직사광 그림자(Key shadow)를 레이어링"한다고 명시해 [src:7], 위 soft-tint + true-black 2겹 패턴과 같은 구조를 서술한다. 반면 다음 세 가지는 어긋난다.

- **레벨 체계** — 공식은 그림자를 두 계열로 나눈다. `Shadow Normal`은 XSmall·Small·Medium·Large·XLarge 5레벨(+ None)로 "평면에 가까운 미세 구분 → 페이지 위 부유 → 상호작용 강조 → 일시적 주요 정보 → 시선을 완전히 집중시키는 오버레이" 순으로 올라가고 [src:7], `Shadow Spread`는 Dialog처럼 사방으로 고르게 퍼져야 할 때 쓰는 Small·Medium 2레벨이다 [src:8]. 위 `shadow-1`~`shadow-4` + `shadow-pop` 명명은 번들 것이며 공식 이름이 아니다.
- **그림자 베이스 색** — 공식은 전 레벨이 `#171717`(atomic `neutral-10`) 단일 베이스에 알파만 달리한다. 위 표가 쓰는 `oklch(0.155 0 0)`·순수 검정 2종 조합과 다르다.
- **기하** — 공식 Normal 레벨은 음수 spread를 적극적으로 쓴다 (예: Small `0 2px 4px -2px` + `0 4px 6px -1px`, XLarge `0 10px 15px -5px` + `0 24px 38px -10px`), Spread 계열은 offset 없이 큰 blur만 쓴다 (Small `0 0 60px`, Medium `0 15px 75px`). 위 값들에는 음수 spread가 없다.

즉 **"카드는 평면 + 헤어라인, 그림자는 elevated 표면 전용"이라는 정책과 2겹 합성 원칙은 공개 출처로 뒷받침되고, 구체적 그림자 값은 번들 관찰값**이다.

### Motion

```yaml
hover-transition: 100~150ms ease     # 빠르고 절제
press-overshoot: 없음
focus-ring:      2px blue-800 + 2px transparent offset
page-transition: ~200ms fade-in only
```

spring·bounce·parallax는 시스템 전반에서 사용되지 않는다. Hover는 darken(버튼) 또는 lighten(링크)이며, lift·scale은 잡 카드(translateY(-2px), 0.12s ease) 외에는 거의 등장하지 않는다.

## Shapes

기하학은 **discrete radii + 평면 표면 + 헤어라인 보더**로 요약된다. 평면 흰 캔버스(또는 다크 캔버스) 위에 8~16px 라운드 카드/버튼을 얹고, chip·avatar·icon button·search·toggle에는 `{rounded.radius-full}`를 적용한다. **장식은 절제되고 색·타이포 위계가 카드 구조를 짊어진다**.

기본 보더는 **1px `{colors.border-subtle}` 헤어라인**이며 (rgba ~8%), 폼 입력·secondary 버튼은 1px `{colors.border-default}` (rgba ~22%)로 한 단계 강해진다. 포커스 상태는 1px `{colors.blue-800}` 보더 + 3px rgba blue glow(`oklch(0.563 0.241 261 / 0.16)` 부근)로 표현된다. 2px 장식용 보더, 컬러 left-rail accent 카드, color-shifted variant rim은 시스템 전반에서 사용되지 않는다.

배경은 평면 색이 기본이며, 그라디언트는 (1) **심볼 마크 자체** (3-stop blue → magenta → coral), (2) **아바타 circle** 의 같은 3-stop, (3) **잡카드 썸네일 placeholder** (같은 3-stop 또는 다크 변형 `oklch(0.166 0.005 271) → oklch(0.357 0.013 274)`), (4) **마케팅 hero banner** (`120deg`, navy `oklch(0.183 0.044 256)` → `{colors.blue-800}` → magenta `oklch(0.709 0.232 346)`) — 이렇게 네 가지 문서화된 자리에만 등장한다. CTA·헤더·풀-블리드 본문 표면에는 그라디언트를 적용하지 않는다.

**Iconography** — 원티드는 자체 아이콘 셋을 운영하며, 공식 갤러리가 `montage.wanted.co.kr`에 공개되어 있다 [src:9]. 공개 갤러리에서 직접 확인되는 사실은 다음과 같다.

- **24×24 그리드가 기본** — 갤러리가 인라인으로 ship하는 아이콘 중 대다수가 `viewBox="0 0 24 24"`이며, `IconChevronLeftTight` 계열 9개만 `0 0 12 24`의 좁은 박스를 쓴다 [src:9]. (페이지 전체의 24×24 `<svg>` 수 343개에는 사이드바·네비 chrome 아이콘이 섞여 있으므로 아이콘 인벤토리 수치로 쓰지 말 것. 갤러리는 세그먼티드 컨트롤의 기본 탭만 SSR되므로 공개 페이지 하나로 전체 개수를 셀 수 없다.)
- **`currentColor` 상속** — 아이콘 path가 색을 하드코딩하지 않고 `currentColor`로 상속한다 [src:9]. 따라서 "아이콘에 외부 컬러를 직접 주입하지 않는다"는 규칙은 공개 구현으로 뒷받침된다.
- **분류는 Solid · Color · Nav 세 갈래** — 즉 **컬러 아이콘 계열이 별도로 존재**한다 [src:9]. 종전 판본의 "모든 아이콘은 monochrome"이라는 서술은 이 분류와 배치되므로 철회하고, monochrome + `currentColor`는 Solid/Nav 계열에 적용되는 규칙으로 좁힌다.
- **공개 SVG는 stroke가 아니라 fill로 그려진다** — 갤러리 SVG에 `stroke-width`·`stroke-linecap` 속성이 하나도 없다 [src:9]. 아래 "2px stroke, rounded caps + joins"는 Figma 작도 그리드 기준의 번들 서술이며, 배포되는 SVG에서 그대로 관찰되는 값은 아니다.

번들 기준 서술(공개 출처로 확인되지 않음): 2px stroke, rounded line caps + joins, 16/20/24/32 사이즈, outline-first이며 filled 변형은 selected/active 탭 상태와 16px 미니 사이즈에 한정. 기하는 원·둥근 사각형·single-curve arc로 구성되고 tapered stroke는 쓰지 않는다. SSOT 번들은 production 아이콘 패키지의 stand-in으로 Lucide CDN을 link한다 — 공식 웹 구현에서 이 자리를 차지하는 패키지는 `montage-web`의 `packages/wds-icon`이다 [src:14].

**No emoji policy** — 원티드는 코어 제품 UI에서 이모지를 사용하지 않는다. 빈 상태·성과·상태 pill에서도 monochrome SVG 또는 평면 일러스트 자산으로 대체한다. CTA의 "→" 같은 화살표도 unicode가 아니라 SVG로 그려진다.

## Components

원티드 컴포넌트는 두 레이어로 나뉜다 — **(1) 마켓플레이스 컴포지트**(`ui_kits/wanted-web/`의 `Header.jsx`·`Filters.jsx`·`JobCard.jsx`·`JobDetail.jsx`·`JobGrid.jsx`·`Footer.jsx`에서 관찰한 `wanted.co.kr` 고유 조립물 — header·nav·search·job-card·job-detail-hero·hero-banner·filter-bar)와 **(2) `components.css` 컴포넌트 라이브러리**(Figma `/2-Element`·`/3-Component` 페이지를 production CSS로 옮긴 23개 그룹 — button·icon-button·field/select·checkbox/radio/switch·chip·badge/tag·avatar·tooltip·spinner/skeleton/progress·segmented/tabs·pagination·list-cell·card·divider·alert/toast·modal/sheet/menu·accordion·table·stepper·breadcrumb·empty)다. 아래 명세는 두 레이어를 합친 것이며, 토큰값(`{spacing.*}`, `{rounded.*}`, `{colors.*}`, `{typography.*}`)이 모두 surface되어 있으므로 prose에서 `{group.name}` 형태로 호출한다.

**공식 컴포넌트 문서와의 관계** — 몽타주는 컴포넌트를 Actions · Selection and input · Contents · Feedback · Loading · Navigations · Presentation 7개 카테고리로 나눈다 — 이 분류는 컴포넌트 문서의 사이드바 내비게이션에 노출되며 [src:10] 페이지에서 7개 이름이 모두 확인된다. 각 컴포넌트는 각 컴포넌트마다 Design / Web / iOS / Android 페이지를 따로 둔다 [src:10]. 공식 문서는 해부도(anatomy)·변형(variants)·상태·사용 지침을 서술하고 치수는 선별적으로만 공개한다 — 예컨대 Snackbar는 "기본 높이 54px, 내부 콘텐츠에 따라 높이 결정, 최대 너비 420px"를 명시하는 반면 [src:12], Button은 "너비는 자유롭게 커스터마이징하되 높이는 고정한다"고만 적고 사이즈별 픽셀값은 공개하지 않는다 [src:10]. **따라서 아래 컴포넌트 명세의 픽셀값은 대부분 번들 관찰값이다.** 이름 대응도 1:1이 아니다 — 아래 `{component.input}`은 공식 `Text field` [src:11], `{component.toast}`는 공식 `Snackbar`/`Toast` [src:12], `{component.modal}`은 공식 `Popup`, `{component.filter-pill}`은 공식 `Filter button`, `{component.badge}`는 공식 `Content badge`/`Push badge`/`Play badge`에 대응한다 [src:10]. 공식 Button은 변형이 **Solid·Outlined 2종 × 색상 Primary·Assistive 2종**이고 위계를 Level 1~4로 규정하며 [src:10], 아래의 6변형(text·ghost·danger 포함)은 번들 명명이다 — 특히 **danger 색상은 공식 Button 변형에 없다**.

### button

원티드 Button은 **xs/sm/md/lg/xl** 5단으로 운영되며 height·radius·font·padding이 사이즈와 함께 변한다. weight는 전 사이즈 700, letter-spacing 0.006em, 포커스는 `0 0 0 3px oklch(0.563 0.241 261 / 0.28)` 링이다:

| 사이즈 | height | radius | font | padding |
|---|---|---|---|---|
| xs | 28 | `{rounded.radius-8}` | 13 | 0 10 |
| sm | 32 | `{rounded.radius-8}` | 14 | 0 14 |
| md | 40 | 10 (컴포넌트 로컬) | 15 | 0 20 |
| lg | 48 | `{rounded.radius-12}` | 16 | 0 28 |
| xl | 56 | 14 (컴포넌트 로컬) | 17 | 0 32 |

신 번들이 종전 sm6/md8/lg10/xl12 라운드를 위 값으로 교체했다 — md의 10·xl의 14는 토큰 ladder(`{rounded.*}`) 밖 컴포넌트 로컬값이다. 변형 명칭은 번들에서 **solid·outlined·text·assistive·assistive-text·danger**이며, 본 문서의 기존 명칭과 다음처럼 대응한다 — solid=button-primary, outlined=button-secondary, text=button-ghost, assistive=button-tertiary, danger 동일, 그리고 신규 button-assistive-text.

```tsx
<button class="wb wb--solid wb--lg">지원하기</button>
<button class="wb wb--text wb--md">더보기</button>
```

### button-primary

solid 변형 — `{colors.bg-brand}` (`oklch(0.563 0.241 261)`) 배경 + `{colors.fg-on-brand}` (흰 텍스트). 화면당 가장 중요한 단일 액션에 사용. Hover 시 `{colors.blue-900}` (`oklch(0.484 0.205 258)`), active 시 blue-925 (`oklch(0.392 0.156 264)`)로 단계적으로 darken한다.

### button-secondary

outlined 변형 — `{colors.bg-surface}` 배경 + 1px 헤어라인 보더(`{colors.border-subtle}`~`{colors.border-default}` 사이, 관찰 alpha 0.16) + `{colors.fg-brand}` 텍스트. 같은 화면의 보조 액션. Hover 시 `{colors.blue-50}` (`oklch(0.985 0.012 247)`) 배경 채움.

### button-tertiary

assistive 변형 — `{colors.neutral-700}` 10% 배경(`oklch(0.521 0.018 273 / 0.10)`) + `{colors.fg-default}` 텍스트, 보더 없음. 중성 fill로 secondary보다 약한 위계의 보조 액션에 사용된다. Hover 시 동일 베이스 alpha 0.16으로 강해진다.

### button-ghost

text 변형 — 투명 배경 + `{colors.fg-brand}` 텍스트, 보더 없음. Hover 시 `{colors.blue-50}` (`oklch(0.985 0.012 247)`) 배경 채움. 텍스트 링크에 가까운 약한 위계.

### button-assistive-text

신규 중성 텍스트 버튼 — 투명 배경 + `{colors.fg-secondary}` 텍스트, 보더 없음. Hover 시 `{colors.bg-muted}` (`oklch(0.961 0.002 286)`) 배경 채움. 강조가 필요 없는 inline 액션("취소", "닫기")에 사용된다.

### button-danger

`{colors.red-700}` (`oklch(0.546 0.220 27)`) 배경 + 흰 텍스트. 파괴적 액션 전용. Hover 시 red-800 (`oklch(0.452 0.188 28)`)로 darken.

### button-disabled

`{colors.neutral-700}` 10% 배경(`oklch(0.521 0.018 273 / 0.10)`) + `{colors.fg-disabled}` (alpha 0.28 텍스트). 부분 회색 처리 없이 컴포넌트 전체에 적용되며 cursor는 not-allowed다. (outlined/text 변형의 disabled는 보더만 유지하고 배경은 `{colors.bg-surface}`로 둔다.)

### input / form field

```yaml
input:
  height: 48
  border: 1px {colors.border-default}
  radius: {rounded.radius-12}
  padding: 0 16
  font: 16/500 {colors.fg-strong}
  bg: {colors.bg-surface}
  placeholder-color: {colors.fg-tertiary}
  sm-variant: { height: 40, radius: 10, font: 15 }
  textarea:   { min-height: 96, padding: 12 16, line-height: 1.6, resize: vertical }
```

Hover 시 보더가 `{colors.border-strong}`로 강해지고, Focus 상태는 1px `{colors.blue-800}` 보더 + `0 0 0 3px oklch(0.563 0.241 261 / 0.16)` glow다. Error(`is-error`) 상태는 1px `{colors.red-700}` 보더(포커스 시 `oklch(0.546 0.220 27 / 0.16)` glow) + 아래쪽 `{colors.fg-danger}` 색 13px helper text. Disabled는 `{colors.neutral-75}` 배경 + `{colors.fg-disabled}` 텍스트다. 필드 그룹은 **label(14/500) → affix 아이콘(좌/우 18px, 본문 padding 44로 회피) → helper(13, `{colors.fg-secondary}`) + char-count(우측 정렬, `{typography}` mono 13)** 슬롯을 공유하며, select는 동일 박스에 우측 chevron(2px 보더 회전)을 얹는다.

```tsx
<label class="wfield">
  <span class="wfield-label">이메일</span>
  <input class="winput" placeholder="email@wanted.co.kr" />
  <span class="wfield-help">회사 이메일 권장</span>
</label>
```

### checkbox

20×20 정사각, 1.5px `{colors.border-strong}` 보더, 6px 라운드(컴포넌트 로컬, `{rounded.radius-4}`보다 한 단계 큼). Checked 상태는 `{colors.bg-brand}` 채움 + 흰 체크 SVG(stroke 2.6), border도 brand 색으로 전환되며, focus-visible 시 `oklch(0.563 0.241 261 / 0.2)` 링이 둘러진다. disabled는 `{colors.neutral-75}` 배경이고, negative(에러) 상태는 보더를 `{colors.red-700}`로 둔다.

### toggle

번들에서 **switch**로 명명 — 44×26 pill (`{rounded.radius-full}`). Off는 `{colors.neutral-200}` (`oklch(0.876 0.006 269)`), On은 `{colors.bg-brand}`. 내부 노브는 20×20 흰 원, `{elevation.shadow-1}` 미세 그림자, left 3 → left 21 전환이 0.15s ease다. sm 변형은 36×22(노브 16)다.

### chip (category selector)

```yaml
chip:
  height: 34   # 8 padding-y + 13/500 font
  radius: {rounded.radius-full}
  padding: 8 14
  font: 13/500
```

| 상태 | bg | fg | border |
| --- | --- | --- | --- |
| resting | `{colors.bg-surface}` | `{colors.fg-default}` | 1px `{colors.border-default}` |
| hover | `{colors.bg-muted}` | `{colors.fg-default}` | 1px `{colors.border-default}` |
| active (selected) | `{colors.fg-strong}` | white | `{colors.fg-strong}`, font-weight: 600 |
| brand | `{colors.bg-brand-subtle}` | `{colors.fg-brand}` | transparent, font-weight: 600 |

칩 active는 **invert-fill 패턴** — 채도 강조가 아니라 검정 배경 + 흰 텍스트로 명도 강조한다.

### filter-pill

filter bar 안쪽 작은 칩 변형. resting은 chip과 동일하지만 padding이 `6 12`로 줄고, brand variant가 더 빈번하게 사용된다 (선택된 필터 노출용).

### badge

6px 라운드(컴포넌트 로컬, `{rounded.radius-4}`보다 한 단계 큼), padding `5 8`, font 12/600 — chip보다 작고 정보 밀도 높은 표면에 쓴다. 변형은 시맨틱 색에 매핑된 washed 배경으로 운영된다 — **brand**(`{colors.bg-brand-subtle}` + `{colors.fg-brand}`), **solid**(`{colors.bg-brand}` + 흰 텍스트), **danger/success/warning**(`{colors.bg-danger-subtle}`/`{colors.bg-success-subtle}`/`{colors.bg-warning-subtle}` + 각 시맨틱 fg의 짙은 단계), **neutral**(`{colors.neutral-100}` + `{colors.fg-default}`). `dot` 변형은 앞에 6px currentColor 원을 붙이고, `count` 변형은 18×18 pill(`{rounded.radius-full}`)에 `{colors.red-700}` 배경 + 흰 11px 숫자를 얹는 알림 카운트다.

### header

```yaml
header:
  height: 60
  bg: {colors.bg-surface}
  border-bottom: 1px {colors.border-subtle}
  position: sticky
  z-index: 50
  inner:
    max-width: 1200
    padding: 0 24
    gap: 28
```

좌측: `{component.logo}` + nav links + Pro 분리 표시 (`margin-left: 8, padding-left: 16, border-left: 1px border-subtle`). 우측: `{component.search}` + icon buttons + avatar.

### nav-link

`14/600` (`-0.01em` letter-spacing), `{colors.fg-default}`. **Active 상태는 `{colors.fg-strong}` 색 + 하단 2px solid `{colors.fg-strong}` underline** (bottom: -22px 위치로 헤더 baseline에서 떨어진다). hover state는 별도 fill 없이 색만 약간 강해진다.

### search (header)

```yaml
search:
  height: 38
  width: 240
  bg: {colors.bg-subtle}      # neutral-50
  radius: {rounded.radius-full}
  padding: 0 14
  gap: 6
  font: 14/500
  icon-color: {colors.fg-tertiary}
```

inline pill 형태 — bordered text field가 아니라 채워진 pill이다.

### icon-button (header right)

```yaml
icon-button:
  size: 36
  radius: {rounded.radius-full}
  bg: transparent
  fg: {colors.fg-default}
  hover-bg: {colors.bg-muted}
  notification-dot:
    size: 6
    bg: {colors.red-700}
    position: { top: 8, right: 9 }
```

알림 도트는 상단 우측에 6px 빨간 원으로 표시된다. 범용 `.wib` 아이콘 버튼은 sm 32 / md 40 / lg 48(원형, hover `{colors.bg-muted}`, active alpha 0.16) 3사이즈와 `--filled`(`{colors.bg-brand}` + 흰 아이콘) 변형으로 ship되며, 헤더의 36px는 그 중간 인스턴스다.

### avatar

```yaml
avatar:
  size: 32
  radius: {rounded.radius-full}
  bg: 'linear-gradient(135deg, oklch(0.563 0.241 261) 0%, oklch(0.709 0.232 346) 50%, oklch(0.686 0.210 41) 100%)'
  fg: oklch(1 0 0)
  font: 12/700
```

브랜드 그라디언트가 적용되는 컴포넌트 — 심볼·잡카드 placeholder 외에 그라디언트가 정식 등장하는 컴포넌트는 avatar 하나다.

### job-card

원티드의 **시그너처 컴포넌트**. 잡 마켓플레이스 그리드의 단위.

```yaml
job-card:
  card:
    bg: {colors.bg-surface}
    radius: {rounded.radius-8}
    overflow: hidden
    hover: 'translateY(-2px), 0.12s ease'

  thumb:
    aspect-ratio: 16/12  # grid; preview 카드는 16/9
    radius: {rounded.radius-8}
    default-bg: brand gradient (blue-800 → magenta → coral-600)
    variant-dark:  'linear-gradient(135deg, neutral-950, neutral-800)'
    variant-light: {colors.bg-brand-subtle}

  overlays:
    deadline-pill:
      position: top-left (10, 10)
      bg: oklch(0 0 0 / 0.55)
      fg: oklch(1 0 0)
      font: 11/600
      padding: 5 8
      radius: 6
      examples: ['D-3', '마감임박', 'NEW']
    save-button:
      position: top-right (8, 8)
      size: 28 or 32
      radius: {rounded.radius-full}
      bg: oklch(1 0 0 / 0.92)
      fg: {colors.fg-default}
      icon: bookmark (14px stroke)
    company-logo-tile:
      position: bottom-left (10, 10)
      size: 36
      radius: {rounded.radius-8}
      bg: oklch(1 0 0)
      shadow: {elevation.shadow-1}
      font: 14/700

  body:
    padding-grid: '12 4 0'
    padding-preview: '14 16 16'
    gap: 4-6
    company:   { font: '12-13/500', color: fg-secondary, pattern: '{company} · {region}' }
    title:     { font: '15/600',   tracking: -0.01em, color: fg-strong }
    meta:      { font: '12/500',   color: fg-tertiary, pattern: '{경력} · {계약형태}' }
    payout:    { font: '13/600',   color: fg-brand,   pattern: '채용보상금 {₩,###}원' }
```

**채용보상금** 표시가 카드 우측 하단 `{colors.fg-brand}` 색으로 항상 노출되는 것이 Wanted 잡카드의 정체성이다 — 다른 채용 사이트와 구분되는 시그너처다.

```tsx
<JobCard
  thumb="brand-gradient"
  deadline="D-3"
  company="원티드랩 · 서울 강남"
  title="시니어 프론트엔드 개발자"
  meta="경력 5-10년 · 정규직"
  payout={1500000}
/>
```

### job-detail-hero

잡 디테일 화면의 hero — aspect 16/8, `{rounded.radius-12}`, 좌측 하단에 56×56 회사 로고 타일(`{rounded.radius-12}`, `{elevation.shadow-2}`)이 anchored된다. 본문 영역은 max-width 920px, `0 24 120` padding으로 운영된다.

### hero-banner (마케팅)

```yaml
hero-banner:
  max-width: 1200
  margin: 32 auto 24
  height: 280
  radius: {rounded.radius-16}
  background: 'linear-gradient(120deg, oklch(0.183 0.044 256) 0%, oklch(0.563 0.241 261) 60%, oklch(0.709 0.232 346) 100%)'
  padding: 36 40
  fg: oklch(1 0 0)
  content-align: flex-end (bottom-left)
```

- eyebrow: 13/600, tracking 0.04em, opacity 0.85
- title: 36/700/1.25, tracking -0.025em, max-width 580
- sub: 16/500/1.5, opacity 0.85, max-width 520
- cta: 흰 pill, fg-strong 텍스트, padding `12 22`, font 14/600

마케팅 hero는 **풀-블리드 그라디언트 + bottom-left 카피 + 흰색 pill CTA**의 패턴이 표준이다. 그라디언트 stop은 심볼 마크와 다르다 — navy를 prepend해 깊이를 만든다.

### filter-bar

```yaml
filter-bar:
  container:
    max-width: 1200
    padding: 0 24
    top-border: 1px {colors.border-subtle}
    vertical-padding: '12 0 16'
  filter-pill (default):
    border: 1px {colors.border-default}
    bg: {colors.bg-surface}
    radius: {rounded.radius-full}
    padding: '6 12'
    font: 13/500
  filter-pill (brand-active):
    bg: {colors.bg-brand-subtle}
    border: transparent
    fg: {colors.fg-brand}
    font-weight: 600
  sort:
    position: 'right-aligned (margin-left: auto)'
    item-font: 13/500
    resting-fg: {colors.fg-secondary}
    active-fg: {colors.fg-strong}
    active-font-weight: 600
    divider: 1×10 {colors.border-default}
```

active filter는 brand-subtle 배경 + brand 텍스트로 표시되며, sort는 오른쪽 정렬 + bold-fg 강조로 위계를 만든다.

### toast

`{colors.bg-inverse}` 계열의 다크 surface(`{colors.neutral-925}` `oklch(0.196 0.008 273)`) + 흰 라벨, padding `12 18`, `{rounded.radius-8}`~`{rounded.radius-12}`(관찰 10), `{elevation.shadow-3}`. 선두 아이콘은 성공 시 밝은 green(다크 surface 대비용 상향 명도), danger 시 밝은 red이며, 우측 action 텍스트는 blue-400(`oklch(0.715 0.155 255)`) weight 700이다. 자동 dismiss 시간은 보통 4–5초.

```tsx
<div class="wtoast"><svg class="wtoast-ic">…</svg> 지원이 완료되었어요</div>
```

### alert (inline)

padding `14 16`, `{rounded.radius-12}`, 좌측 18px 아이콘 + title(14/600) + msg(13/500) 슬롯. 인라인 알림이며 toast와 달리 dismiss 없이 페이지 흐름에 남는다. 변형은 **info**(`{colors.bg-brand-subtle}` 배경), **danger**(`{colors.bg-danger-subtle}`), **success**(`{colors.bg-success-subtle}`), **warning**(`{colors.bg-warning-subtle}`)이며, 텍스트는 각 시맨틱 hue의 짙은 단계를 써 subtle 배경 위 대비를 확보한다.

### empty-state

```yaml
empty-state:
  padding: 56 24
  align: center
  icon-wrap: 56px 원형, bg {colors.bg-subtle}, color {colors.fg-tertiary}
  icon: 26px monochrome SVG (no emoji)
  title: 700 18/1.4 {colors.fg-strong}
  msg:   500 14/1.5 {colors.fg-secondary}
  cta: {component.button}
  cta-margin-top: 18
```

아이콘은 56px 원형 surface 안에 monochrome SVG로 놓이고, 그 아래 title·msg·선택적 CTA 버튼이 중앙 정렬된다. 빈 상태 카피 패턴: "아직 받은 제안이 없어요" (alpha 88% body 톤, 제품 보이스 `-어요` 종결).

### icon

24×24 그리드 위에서 `currentColor`를 상속하는 아이콘 셋 — 두 항목 모두 공식 갤러리에서 확인된다 [src:9]. 2px stroke·rounded line caps + joins·outline-first·16/20/24/32 사이즈는 번들 기준 서술이며, 배포 SVG는 stroke 없이 fill로 그려진다. 공식 갤러리는 Solid·Color·Nav 분류를 두므로 컬러 아이콘 계열이 별도로 존재한다 [src:9].

### logo

브랜드 마크는 두 형태 — **symbol** (3-stop 그라디언트가 적용된 둥근 사각형/마름모 형태)과 **logotype** (`Wanted` 워드마크). SSOT 번들 `assets/logos/`에 `wanted-symbol-fill.png`, `wanted-symbol-mask.svg`, `wanted-logotype.svg`로 ship되며, mask SVG는 `currentColor` 적용이 가능해 단색 표면 위에서 톤을 맞추는 용도다.

---

위 마켓플레이스 컴포지트에 더해, 번들 `components.css`는 다음 표준 컴포넌트 그룹을 개별 스펙으로 노출한다 — 모두 동일 토큰(`{colors.*}`·`{rounded.*}`·`{typography.*}`) 위에서 light/dark 양 테마에 적응한다.

### radio

`{component.checkbox}`와 같은 20px 컨트롤이지만 원형이다 — 1.5px `{colors.border-strong}` 보더, checked 시 보더가 2px `{colors.blue-800}`로 바뀌고 안쪽 10px `{colors.bg-brand}` 점이 scale-in된다. focus-visible 링·disabled 처리는 checkbox와 동일하다.

### tag

해시 토픽 표기용 pill — height 30, padding `0 12`, `{rounded.radius-full}`, `{colors.bg-subtle}` 배경 + `{colors.fg-default}` 13/500. `#성장가능성`·`#스타트업`처럼 `#` 접두 단어로 쓰며, 상태 강조가 있는 인터랙티브 `{component.chip}`과 달리 정적 라벨이다.

### avatar-group

`{component.avatar}`를 겹쳐 쌓는 컨테이너 — 각 아바타에 2px `{colors.bg-surface}` 링을 두르고 -8px margin으로 겹친다. 지원자·참여자 집합을 압축 표시할 때 쓴다.

### tooltip

다크 말풍선 — `{colors.neutral-925}` 배경 + 흰 13/1.4 텍스트, `{rounded.radius-8}`, padding `8 12`, `{elevation.shadow-3}`, 하단 중앙 5px 화살표. hover 시 opacity로 등장하며 기본 위치는 트리거 위쪽이다.

### spinner

24px 원형 로더 — 3px `{colors.neutral-700}` 20% 트랙 + `{colors.blue-800}` top border가 0.7s linear로 회전한다. sm 16(2px)·lg 32(4px) 사이즈가 있고, 컬러 surface 위에서는 흰색 변형을 쓴다.

### skeleton

로딩 placeholder — `{colors.neutral-100}`↔`{colors.neutral-75}` 사이를 오가는 shimmer 그라디언트가 1.4s ease로 흐른다. 기본 `{rounded.radius-8}`, `--text`(height 14, r7)·`--circle`(원형) 변형으로 블록·텍스트 줄·아바타 자리를 채운다.

### progress

6px 트랙(`{colors.neutral-100}`, `{rounded.radius-full}`) + `{colors.bg-brand}` 바. width 트랜지션으로 진행률을 표시하며, `--indeterminate` 변형은 40% 바가 1.2s로 흐르는 무한 로딩이다.

### segmented

inset 트랙형 토글 그룹 — `{colors.neutral-75}` 트랙(10 라운드, padding 3) 안에서 active 아이템만 `{colors.bg-surface}` + `{elevation.shadow-1}`로 떠오른다. 라벨은 `{colors.fg-secondary}`→active 시 `{colors.fg-strong}` 14/600. 소수(2~4) 상호배타 뷰 전환에 쓴다.

### tabs

하단 보더(`{colors.border-subtle}`) 위 underline 탭 — 각 탭 padding `12 16`, `{colors.fg-secondary}` 15/500, hover 시 `{colors.fg-default}`. active는 `{colors.fg-strong}` 600 + 하단 2px `{colors.fg-strong}` underline로, `{component.nav-link}`의 강조 패턴을 컨텐츠 탭에 재사용한다.

### pagination

36px 단위 페이지 아이템(min-width 36, `{rounded.radius-8}`) — resting `{colors.fg-secondary}`, hover `{colors.bg-muted}`, active는 `{colors.fg-strong}` 채움 + 흰 텍스트(`{component.chip}`과 공유하는 invert-fill 강조)다. 양끝 chevron 버튼은 disabled 시 `{colors.fg-disabled}`.

### list-cell

리소스 행 — leading(아이콘/아바타) · body(title 15/600 `{colors.fg-strong}` + sub 13 `{colors.fg-secondary}`) · trailing(value/chevron, `{colors.fg-tertiary}`) 3슬롯, padding `14 16`. `--card`는 14 라운드 + 1px `{colors.border-subtle}`, `--button`은 hover 시 `{colors.bg-subtle}`로 눌리는 인터랙티브 행이다.

### card

범용 카드 — `{colors.bg-surface}` + 1px `{colors.border-subtle}`, `{rounded.radius-16}`. 기본은 그림자 없이 헤어라인이 구조를 잡고(시스템 정책), `--shadow` 변형만 보더를 빼고 `{elevation.shadow-2}`를 얹는다. 내부 padding 20, title 18/700 `{colors.fg-strong}` + sub 14/500 `{colors.fg-secondary}`. 잡 마켓플레이스 전용 조립물 `{component.job-card}`와 달리 범용 컨테이너다.

### divider

구분선 — 기본 1px `{colors.border-subtle}` 수평선. `--strong`은 `{colors.border-default}`, `--thick`은 8px `{colors.bg-subtle}` 블록 구분(섹션 분리), `-v`는 1px 수직 구분선이다.

### modal

중앙 모달 — `oklch(0 0 0 / 0.5)` scrim 위에 `{colors.bg-elevated}` 카드(`{rounded.radius-20}`, max-width 400, `{elevation.shadow-4}`). title 20/700 + msg 15/1.6 중앙 정렬, 하단 액션 행은 `{component.button}`을 flex로 균등 분할한다. 열림 시 translateY+scale 트랜지션(0.18s)이다.

### bottom-sheet

모바일 바텀 시트 — 모달과 같은 scrim에 하단 정렬, 상단만 `{rounded.radius-24}` 둥근 surface(max-width 480). 상단 중앙 40×4 grip 핸들, 열림 시 아래에서 slide-up하는 모달 변형이다.

### dropdown-menu

드롭다운 메뉴 — `{colors.bg-elevated}` + `{rounded.radius-12}` + `{elevation.shadow-pop}` + 1px `{colors.border-subtle}`, padding 6, min-width 180. 항목은 padding `10 12` `{rounded.radius-8}` `{colors.fg-default}`, hover 시 `{colors.bg-muted}`, 파괴적 항목은 `{colors.red-700}`. 1px `{colors.border-subtle}` separator로 그룹을 나눈다.

### accordion

아코디언 — 각 항목은 하단 `{colors.border-subtle}` 보더, head는 padding `18 4` 16/600 `{colors.fg-strong}` + 우측 chevron(열림 시 180° 회전). body는 max-height 트랜지션(0.25s)으로 펼쳐지며 내부 텍스트는 15/1.7이다.

### table

데이터 테이블 — th는 좌측 정렬 13/600 `{colors.fg-secondary}` + 하단 1px `{colors.border-default}`, td는 14/500 `{colors.fg-default}` + 1px `{colors.border-subtle}` 행 구분. row hover 시 `{colors.bg-subtle}`, 숫자 열은 우측 정렬 + tabular-nums다.

### stepper

수량 입력 stepper — 1px `{colors.border-default}` 10 라운드 테두리 안에 ± 40px 버튼 + 중앙 값(너비 44, 15/600 `{colors.fg-strong}`). 버튼 hover `{colors.bg-muted}`, 한계 도달 시 `{colors.fg-disabled}`.

### breadcrumb

경로 표시 — 링크는 `{colors.fg-secondary}`(hover `{colors.fg-default}`), 구분자는 14px chevron `{colors.fg-tertiary}`, 현재 위치는 `{colors.fg-strong}` 600. 전체 14/500이다.

## Do's and Don'ts

**Do**

- product-facing 색은 시맨틱 alias(`{colors.bg-brand}`, `{colors.fg-strong}`, `{colors.fg-default}`, `{colors.fg-secondary}`, `{colors.border-subtle}`)로 호출하고, atomic ramp(`{colors.blue-800}`, `{colors.neutral-700}`)는 새 alias를 만들 때만 직접 참조한다.
- 화면당 단일 강조색 정책을 유지한다 — primary CTA는 `{colors.bg-brand}` 하나로 통일하고, 보조 액션은 button-secondary/tertiary/ghost로 분리한다.
- 텍스트 위계는 **alpha multiplier 시스템**으로 표현한다 — primary `alpha-88`, secondary `alpha-61`, tertiary `alpha-43`, disabled `alpha-28`. 별도 gray hex로 만들지 않는다.
- 카드는 1px `{colors.border-subtle}` 헤어라인으로 구조를 만든다 — 그림자를 카드에 적용하지 않는다. 그림자는 popover/dropdown/modal/toast에만 사용한다.
- 라운드는 **`{rounded.radius-8}` 또는 `{rounded.radius-12}`를 디폴트**로, pills는 `{rounded.radius-full}`로 사용한다. 단 공식 테마에 radius 토큰이 없으므로 [src:14], 이 사다리는 시스템 토큰이 아니라 컴포넌트 로컬 규약으로 취급한다.
- 버튼 라운드는 사이즈와 페어로 운영한다 — xs·sm `{rounded.radius-8}`, md 10, lg `{rounded.radius-12}`, xl 14.
- 본문은 `{typography.body1}` (16/500/1.5 line-height)을 기본으로, 산문 단락은 `{typography.body1-read}` (1.625 line-height)을 사용한다.
- 17px 이상 모든 헤딩에 네거티브 트래킹을 유지한다 (`-0.0319em` ~ `-0.0120em`) — display 1이 가장 타이트하다.
- product 카피는 **친근한 존댓말**(`-요`/`-어요`/`-아요`)로 작성한다 — "지원이 완료되었어요", "받은 제안이 없어요", "잠시 후 다시 시도해 주세요" 같은 톤 시그너처를 따른다.
- 버튼 라벨은 **동사 형태**로 작성한다 — "지원하기", "저장하기", "시작하기", "둘러보기"가 표준이다.
- 잡카드 우측 하단에는 **채용보상금**을 `{colors.fg-brand}` 색으로 항상 노출한다 — Wanted를 다른 잡 사이트와 구분짓는 시그너처다.
- 태그 칩은 `#` + 단어 형태로 표기한다 — `#성장가능성`, `#스타트업`.
- 아이콘은 `currentColor`를 상속하게 둔다 — 외부 컬러 직접 주입 금지 [src:9].
- 포커스 링은 항상 visible 상태로 유지한다 — 2px `{colors.blue-800}` ring + 2px transparent offset이 표준이다.

**Don't**

- **이모지를 product UI에 inline으로 사용하지 않는다** — 빈 상태·성공·상태 pill에서도 monochrome SVG 또는 평면 일러스트 자산으로 대체한다. CTA의 "→" 같은 화살표도 unicode가 아니라 SVG로 그린다.
- **그라디언트를 chrome에 사용하지 않는다** — 그라디언트는 (1) 심볼 마크, (2) 아바타 circle, (3) 잡카드 썸네일 placeholder, (4) 마케팅 hero banner — 네 가지 문서화된 자리에만 사용한다. CTA·헤더·풀-블리드 본문 표면에는 적용하지 않는다.
- 격식체(`-습니다`/`-십시오`)나 단정형 `-다`를 product 카피에 사용하지 않는다 — `-요`/`-어요`가 표준이다.
- ALL-CAPS, Title Case In Buttons를 사용하지 않는다 — 영어는 항상 sentence case다.
- UI 라벨이나 리스트 아이템 끝에 마침표를 찍지 않는다.
- 마케팅 과장 ("혁신적", "차세대", "최고의") 이나 챗봇 톤 ("~해보세요!", "여기를 눌러주세요")을 product 카피에 사용하지 않는다.
- 카드에 그림자를 적용하지 않는다 — 1px `{colors.border-subtle}` 헤어라인이 표준이다.
- 임의 간격을 즉흥적으로 만들지 않는다 — 기본은 4배수이며, 시각 보정이 필요할 때만 2px 단위(불가피하면 1px)로 조정한다 [src:6]. 종전 판본의 "6·10·14px를 도입하지 않는다"는 규칙은 공식 `spacing` 토큰이 6·10·14를 정규 단계로 포함하므로 철회한다 [src:14].
- 텍스처·노이즈·grain을 표면에 사용하지 않는다 — 모든 표면은 평면 색이다.
- glassy 효과(blur backdrop, translucent toolbar)를 사용하지 않는다 — Wanted 시스템은 평면 색 + 헤어라인 보더로 깊이를 만든다.
- 2px 장식용 보더, 컬러 left-rail accent 카드, color-shifted variant rim을 사용하지 않는다 — 기본은 1px `{colors.border-subtle}` / `{colors.border-default}` 헤어라인이다.
- spring·bounce·parallax·page slide 모션을 사용하지 않는다 — hover transition은 100–150ms ease, page transition은 ~200ms fade-in only가 표준이다.
- Solid·Nav 계열 아이콘 내부에 그라디언트·임의 컬러를 적용하지 않는다 — `currentColor` 상속이 표준이다 [src:9]. (컬러 아이콘이 필요하면 공식 갤러리의 Color 계열을 쓴다 — 단색 아이콘을 직접 채색하지 않는다.)
- gray-* 패밀리를 UI 표면 색으로 직접 사용하지 않는다 — UI 표면은 neutral-* 패밀리(cool blue-tinted)를 사용하고, gray-*는 utility용이다.
- 원티드의 채용 도메인(잡카드 우측 하단 채용보상금 표시·지원/이력서 흐름, 리크루터↔후보자 매칭, `#성장가능성` 같은 해시태그 태그칩 패턴)을 성격이 다른 제품에 그대로 이식하지 않는다 — 차용할 것은 시각 언어(gray/neutral 이중 중성 체계·1px border-subtle 위주의 그림자 회피·17px+ 헤드라인 음수 트래킹·넉넉한 수직 리듬)이지 원티드의 채용 서비스 개념이 아니다 [src:17].
- 원티드 브랜드를 사칭하거나 오인하게 하는 방식으로 사용하지 않는다 — 컴포넌트는 자유롭게 쓸 수 있으나 로고·워드마크 등 브랜드 자산은 별도 브랜드 가이드라인의 적용을 받는다 [src:2].

## Responsive Behavior

원티드 시스템은 mobile-first 표준 패턴을 유지한다 — 모바일·태블릿·데스크톱 표면을 같은 시스템 위에서 운영하지만, 마케팅 표면은 max-width ~1080px, 대시보드는 ~1280px로 운영한다.

### Breakpoints

| Name | Width | Columns | Gutter | Key Changes |
|---|---|---|---|---|
| Mobile | ≤ 640 | 4 | 16 | `{component.job-card}` 그리드를 1–2 컬럼으로 collapse, header 검색은 inline icon button으로 축약 |
| Tablet | 641–1023 | 8 | 24 | 잡 그리드 2–3 컬럼, hero banner full-bleed 유지 |
| Desktop (marketing) | 1024–1279 | 12 | 24 | max-content-width ~1080; hero `{component.hero-banner}` 가 standard |
| Desktop (dashboard) | ≥ 1280 | 12 | 24 | max-content-width ~1280; 잡 그리드는 `{component.job-card}` 4 컬럼 |

**위 표는 마켓플레이스 관찰값이며 공식 브레이크포인트와 다르다.** 공식 문서와 공개 `breakpoint` 토큰은 5단으로, 경계값이 640/1023/1279가 아니라 **768 / 992 / 1200 / 1600**이다 [src:6][src:14].

| Name | Width | 대응 환경 | Max content width |
|---|---|---|---|
| xs | < 768 | 모바일 | — |
| sm | ≥ 768 | 태블릿 세로 | — |
| md | ≥ 992 | 태블릿 가로 | — |
| lg | ≥ 1200 | 데스크탑 | 1100 (padding 포함) |
| xl | ≥ 1600 | 데스크탑 대형 | 1440 (padding 포함) |

공식 `breakpoint` 토큰은 `xs: 0px · sm: 768px · md: 992px · lg: 1200px · xl: 1600px`의 **min-width 값**이다 [src:14]. 공식 문서 표는 이를 `0-768`, `768-992`처럼 경계를 양쪽에 걸쳐 적지만, 구현에서는 위와 같이 min-width 기준으로 읽어야 경계 픽셀이 두 구간에 중복되지 않는다.

새로 반응형을 설계한다면 이 5단을 따르고, 위 4단 표는 `wanted.co.kr` 마켓플레이스가 실제로 접히는 지점의 관찰 기록으로만 읽는다.

### Touch Targets

**44×44px를 실제로 충족하는 컨트롤은 일부다.** 본 문서가 기록한 고정 높이는 `{component.input}` 48 · `{component.button}` lg 48 / xl 56로 기준을 넘지만, `{component.button}` sm 32 · md 40, `{component.chip}` 34, `{component.icon-button}` 36은 세로축이 44에 못 미친다. 이 값들은 컴포넌트 padding을 이미 포함한 박스 크기이고, 번들은 별도의 hit-slop 래퍼나 확장 pseudo-element를 명시하지 않는다 — 즉 **그대로 쓰면 터치 타깃이 부족하다**. 모바일 표면에서는 lg 이상을 쓰거나, 작은 컨트롤을 감싸는 투명 히트 영역을 host 쪽에서 별도로 마련해야 한다. (종전 판본은 "모든 인터랙티브 표면이 최소 44×44px를 보장한다"고 적었으나 위 수치와 모순되어 철회한다.)

### Collapsing Strategy

- **Job grid**: desktop 4 cols → tablet 2–3 cols → mobile 1–2 cols. card aspect는 그대로 유지된다.
- **Header**: desktop의 nav links + search + icon buttons + avatar 풀 행 → tablet에서 일부 nav를 hamburger로 collapse → mobile은 hamburger + 로고 + 1–2 icon button.
- **Hero**: full-bleed gradient banner는 모든 breakpoint에서 유지되나, height가 모바일에서 축소된다 (관찰: desktop 280 → mobile ~200).
- **Filter bar**: filter pills는 wrap, sort는 mobile에서 우측 정렬 유지하되 라벨이 축약될 수 있다.

### Image Behavior

마케팅 사진은 full-bleed로 표면에 사용되며, 카드의 썸네일은 16/12 (그리드) 또는 16/9 (상세) aspect로 잘려 표시된다. 일러스트는 빈 상태·온보딩에서만 등장 — 평면, 기하학적, primary blue + neutral.

## Known Gaps

- **OKLCH 표기 정정 (2026-07-26)** — 원본 `colors_and_type.css`도, 공식 `wds-theme` 토큰도 hex로만 값을 ship하며 OKLCH 표기는 어느 쪽에도 없다 [src:14]. 본 문서의 OKLCH는 sRGB → OKLab 변환값인데, 병기 hex로 역산하니 12쌍 중 9쌍이 이 저장소의 허용치(ΔE 0.01)를 넘었다 (최대 `gradient-stop-2` 0.055). **hex 쪽이 공식과 일치하는 정답이므로 OKLCH를 hex 유도값으로 재계산해 반영했고**, 시맨틱 alias·그라디언트·산문·프리뷰의 파생 리터럴까지 함께 갱신했다. 지금은 `pnpm audit:oklch`가 이 파일을 판정 대상으로 삼고 통과한다.

  이 불일치는 오래 숨어 있었다 — 검증기의 `OKLCH_DEFINITION` 정규식이 `oklch(...)  # #RRGGBB` 형태만 매칭해서, 본 문서가 쓰는 `# ≈ #58CF04`·`# core Wanted Blue (#0066FF)` 같은 형태를 전부 건너뛰었기 때문이다. 카탈로그 전역으로 102쌍이 미판정 상태였고 그중 66개가 어긋나 있었다. 정규식을 고쳐 이 사각지대를 닫았다.
- **번들 앵커와 공개 램프의 단계 어긋남** — 병기 hex가 있는 토큰은 공개 값과 맞지만, hex를 병기하지 않은 중성/신호색 앵커는 공개 램프보다 어두운 단계를 가리킨다 (예: `neutral-875` `oklch(0.259 …)` vs 공개 `coolNeutral-22` `#2E2F33` ≈ `oklch(0.306 …)`, `red-700` `oklch(0.546 …)` vs 공개 `status-negative` `#FF4242` ≈ `oklch(0.662 …)`). 값을 덮어쓰지 않고 차이만 기록한다 — 번들 팔레트 내부의 상대 위계는 일관되므로, 공식 값으로 옮길 때는 개별 치환이 아니라 램프 단위로 교체해야 한다 [src:3][src:4].
- **그라디언트 mid-stop 미세 차이** — 브랜드 그라디언트의 mid-stop은 README와 atomic 팔레트에서 약간 다른 값으로 surface된다. README/avatar gradient는 `#FF53C0`(≈ `oklch(0.709 0.232 346)`, magenta-shifted), atomic pink-600은 `#F553DA` — UI kit `styles.css`에서 실제 사용되는 hex는 `#FF53C0`이며 본 문서는 이를 우선한다. **공개 대조 결과, `#F553DA`는 공식 `pink-50` 토큰과 정확히 일치하지만 `#FF53C0`은 공식 토큰 집합 어디에도 없다** [src:3] — 본 문서가 병기한 hex 12개 중 공개 출처로 확인되지 않는 유일한 값이다. 또한 공식 문서 사이트가 렌더링하는 원티드 로고는 13개 이상의 `linearGradient`에 57개 stop을 쓰는 다층 그라디언트로, 본 문서의 3-stop 서술은 그 단순화다. 로고·워드마크 등 브랜드 자산은 디자인 시스템 라이선스가 아니라 별도 브랜드 가이드라인의 적용을 받으므로 [src:2], 그라디언트 마크를 그대로 재현하는 용도로는 쓰지 않는다.
- **공식 motion 토큰** — duration·easing의 시스템 토큰은 명시되지 않았으며, hover transition은 100–150ms ease, page transition은 ~200ms fade-in이라는 정책만 README에 prose로 surface된다. 본 문서의 Motion 표는 SSOT의 정책 prose에서 추출한 권장값이며, 명시 토큰은 아니다.
- **다크 모드 alias의 합성값** — `### Semantic alias — Dark`의 `bg-danger/success/warning-subtle`과 `fg-brand/danger/success/warning`은 본 카탈로그가 preview 대비를 맞추려 **합성(synthesized)**한 값이다. 종전 판본은 이를 "SSOT가 surface하지 않은 빈자리"로 설명했으나 **몽타주 공개 문서는 해당 다크 토큰을 모두 공개하고 있어 그 설명은 성립하지 않는다** [src:4]. 값을 임의로 덮어쓰지 않기 위해 합성값은 그대로 두되, 공식 값(`status-*`는 각 hue의 `-60` 단계, `background-status-*`는 같은 hue 알파 8%, 다크 `primary-normal`은 `#3385FF` ≈ `oklch(0.633 0.198 259)`)을 같은 절에 병기했다. 공식 패키지 위에서 구현한다면 공개 값을 쓴다.
- **아이콘 인벤토리와 출처 교체** — 종전 판본이 아이코노그래피 근거로 인용하던 `github.com/wanteddev/wanted-icons`는 **현재 404이며 해당 레포는 존재하지 않는다.** 이 항목의 6개 인용을 공식 아이콘 갤러리 [src:9]와 `montage-web`의 `packages/wds-icon` [src:14]으로 교체했다. **공개 갤러리로는 전체 아이콘 수를 셀 수 없다** — 세그먼티드 컨트롤의 기본 탭만 SSR되고, 페이지의 24×24 `<svg>` 집계에는 사이드바·네비 chrome이 섞인다. 종전 판본의 "~340개" 추정도 이 방식으로는 확인할 수 없으므로 인벤토리 수치를 싣지 않는다. 개별 아이콘의 이름 매핑과 변형 ID도 본 문서 범위 외다.
- **`wanted-sans.github.io` 링크 소실** — 종전 판본의 Wanted Sans 근거 URL도 404가 되어, 살아 있는 공식 레포 `github.com/wanteddev/wanted-sans`로 교체했다 [src:15].
- **버전 스냅샷** — 몽타주는 Web·iOS·Android 3개 플랫폼이 6월·12월에 동일 Major로 정기 릴리즈되고 Minor·Patch는 플랫폼별로 독립 배포된다 [src:13]. 본 문서는 2026-07-25 시점의 공개 문서를 대조한 스냅샷이므로, 정기 릴리즈 이후에는 토큰이 갱신됐을 수 있다.
- **대조하지 못한 항목** — 공식 문서가 컴포넌트 치수를 선별적으로만 공개하기 때문에, 본 문서 `## Components`의 픽셀값(높이·padding·radius) 대부분과 `### Motion` 표는 공개 출처로 확인하지 못했다. 아래 `## Do's and Don'ts`의 보이스·카피 규칙도 `wanted.co.kr` 제품 표면 관찰 [src:17]에 기반하며 공식 UX 라이팅 가이드가 공개된 것은 아니다.

## References

1. https://montage.wanted.co.kr/docs/getting-started — 몽타주(Montage) 공식 문서 시작 페이지. 시스템 정의, 3대 설계 원칙(Extensibility·Consistency·Efficiency), 오픈소스 지향 선언.
2. https://montage.wanted.co.kr/docs/getting-started/terms-of-use — 이용 약관. MIT 라이선스 고지, 저작권 표시·라이선스 전문 포함 의무, 브랜드 사칭 금지, 사용 명시 권장. © 2026 Wanted Lab, Inc.
3. https://montage.wanted.co.kr/docs/foundations/base-material/colors/atomic — Atomic 컬러 램프(blue·coolNeutral·neutral·red·redOrange·orange·lime·green·cyan·lightBlue·violet·purple·pink·common) 원본 hex.
4. https://montage.wanted.co.kr/docs/foundations/base-material/colors/semantic — 시맨틱 컬러 토큰 그룹(Primary·Label·Fill·Line·Background·Static·Inverse·Interaction·Status·Accent·Material)과 라이트/다크 값.
5. https://montage.wanted.co.kr/docs/foundations/base-material/typography — 공식 타입 스케일 표(19개 명명 스타일의 크기·행간·자간)와 기본 글꼴 정책.
6. https://montage.wanted.co.kr/docs/foundations/base-material/grid — 아트보드 규격, 브레이크포인트 5단, 4배수 스페이싱 권장, 컬럼 그리드 정책.
7. https://montage.wanted.co.kr/docs/foundations/base-material/elevation/normal — Shadow Normal 5레벨과 Ambient+Key 2겹 합성 원칙.
8. https://montage.wanted.co.kr/docs/foundations/base-material/elevation/spread — Shadow Spread 2레벨(Dialog 등 사방 확산용).
9. https://montage.wanted.co.kr/docs/foundations/base-material/icons — 공식 아이콘 갤러리. 24×24 viewBox, `currentColor` 상속, Solid/Color/Nav 분류.
10. https://montage.wanted.co.kr/docs/components/actions/button/design — Button 해부도·변형(Solid/Outlined × Primary/Assistive)·위계 4단계·레이아웃 정책.
11. https://montage.wanted.co.kr/docs/components/selection-and-input/text-field/design — Text field 해부도(Heading·Placeholder·Description·Leading icon·Required badge·Trailing contents).
12. https://montage.wanted.co.kr/docs/components/feedback/snackbar/design — Snackbar 해부도와 공개 치수(기본 높이 54px, 최대 너비 420px).
13. https://montage.wanted.co.kr/docs/release-note — 시맨틱 버저닝 정책. Major는 3개 플랫폼 공통으로 6월·12월 정기 릴리즈.
14. https://github.com/wanteddev/montage-web — 몽타주 웹 공식 오픈소스 구현(MIT). `packages/wds-theme`가 atomic·semantic·opacity·breakpoint·spacing·zIndex 토큰의 소스오브트루스.
15. https://github.com/wanteddev/wanted-sans — Wanted Sans 오픈소스 typeface (OFL). 디자인·제작 원티드랩(길형진·강한빈), 한글 바탕은 본고딕. 7가지 기본 굵기 + 가변 글꼴.
16. https://github.com/orioncactus/pretendard — Pretendard JP variable typeface. 몽타주가 지정한 기본 글꼴.
17. https://www.wanted.co.kr — 원티드 공식 마케팅 + 잡 마켓플레이스. 제품 표면의 카피 보이스·잡카드 조립물 관찰 대상.
