---
name: 당근
design_system_name: SEED Design
slug: seed-design
category: community
last_updated: "2026-08-05"
created_at: 2026-05-14
sources:
  - https://seed-design.io/llms.txt
  - https://seed-design.io/get-started/llms.txt
  - https://seed-design.io/llms/foundations/color.txt
  - https://seed-design.io/llms/foundations/color/color-role.txt
  - https://seed-design.io/llms/foundations/color/palette.txt
  - https://seed-design.io/llms/foundations/design-token.txt
  - https://seed-design.io/llms/foundations/design-token/reference.txt
  - https://seed-design.io/llms/foundations/typography.txt
  - https://seed-design.io/llms/foundations/spacing.txt
  - https://seed-design.io/llms/foundations/radius.txt
  - https://seed-design.io/llms/foundations/elevation.txt
  - https://seed-design.io/llms/foundations/layout.txt
  - https://seed-design.io/llms/foundations/motion.txt
  - https://seed-design.io/llms/foundations/gradient.txt
  - https://seed-design.io/llms/foundations/iconography.txt
  - https://seed-design.io/llms/foundations/iconography/usage.txt
  - https://seed-design.io/llms/foundations/state.txt
  - https://seed-design.io/llms/foundations/inclusive-design.txt
  - https://seed-design.io/llms/foundations/international-design.txt
  - https://seed-design.io/llms/foundations/writing.txt
  - https://seed-design.io/llms/foundations/voice-and-tone.txt
  - https://seed-design.io/components/llms.txt
  - https://seed-design.io/llms/patterns/loading.txt
  - https://seed-design.io/react/llms.txt
  - https://seed-design.io/llms/react/components/action-button.txt
  - https://seed-design.io/updates/why-design-system-needs-branding
  - https://github.com/daangn/seed-design
  - https://www.daangn.com/kr/
  - https://seed-design.io/llms/components/accordion.txt
  - https://seed-design.io/llms/components/action-button.txt
  - https://seed-design.io/llms/components/alert-dialog.txt
  - https://seed-design.io/llms/components/attachment-input.txt
  - https://seed-design.io/llms/components/avatar.txt
  - https://seed-design.io/llms/components/badge.txt
  - https://seed-design.io/llms/components/bottom-navigation.txt
  - https://seed-design.io/llms/components/bottom-sheet.txt
  - https://seed-design.io/llms/components/callout.txt
  - https://seed-design.io/llms/components/checkbox.txt
  - https://seed-design.io/llms/components/chip.txt
  - https://seed-design.io/llms/components/content-placeholder.txt
  - https://seed-design.io/llms/components/contextual-floating-button.txt
  - https://seed-design.io/llms/components/dialog.txt
  - https://seed-design.io/llms/components/divider.txt
  - https://seed-design.io/llms/components/field.txt
  - https://seed-design.io/llms/components/floating-action-button.txt
  - https://seed-design.io/llms/components/footer.txt
  - https://seed-design.io/llms/components/help-bubble.txt
  - https://seed-design.io/llms/components/identity-placeholder.txt
  - https://seed-design.io/llms/components/image-frame.txt
  - https://seed-design.io/llms/components/input-button.txt
  - https://seed-design.io/llms/components/list.txt
  - https://seed-design.io/llms/components/manner-temp.txt
  - https://seed-design.io/llms/components/menu.txt
  - https://seed-design.io/llms/components/menu-sheet.txt
  - https://seed-design.io/llms/components/notification-badge.txt
  - https://seed-design.io/llms/components/page-banner.txt
  - https://seed-design.io/llms/components/progress-circle.txt
  - https://seed-design.io/llms/components/quantity-picker.txt
  - https://seed-design.io/llms/components/radio.txt
  - https://seed-design.io/llms/components/reaction-button.txt
  - https://seed-design.io/llms/components/result-section.txt
  - https://seed-design.io/llms/components/scroll-fog.txt
  - https://seed-design.io/llms/components/segmented-control.txt
  - https://seed-design.io/llms/components/select.txt
  - https://seed-design.io/llms/components/select-box.txt
  - https://seed-design.io/llms/components/side-navigation.txt
  - https://seed-design.io/llms/components/side-panel.txt
  - https://seed-design.io/llms/components/skeleton.txt
  - https://seed-design.io/llms/components/slider.txt
  - https://seed-design.io/llms/components/snackbar.txt
  - https://seed-design.io/llms/components/switch.txt
  - https://seed-design.io/llms/components/tabs.txt
  - https://seed-design.io/llms/components/tag-group.txt
  - https://seed-design.io/llms/components/text-input.txt
  - https://seed-design.io/llms/components/top-navigation.txt
related_services: []
lang: ko
logo: https://getdesign.kr/logos/seed-design-symbol.png
---

# SEED Design — design.md

## Brand & Style

당근은 주황 하나를 브랜드 축으로 붙들고, 사용자 신뢰를 10단계 온도 램프로 색칠해 UI 안에 박아 넣은 디자인 언어를 쓴다. SEED는 그 언어를 "당근 제품을 위한 통합 디자인 언어"로 정의하며, 디자인과 코드가 하나의 소스를 바라보게 만들어 누가 만들어도 같은 품질의 경험이 나오도록 하는 것을 목표로 삼는다 [src:2].

문서 체계는 Get Started · Foundations · Components · Patterns · Design Guidelines · React Library · Breeze Utilities · Lynx · AI Integration · Updates · Changelog로 나뉘며, 각 섹션은 `/{section}/llms.txt` 색인과 `/llms/{section}/{path}.txt` 본문이라는 두 단계 규약으로 노출된다 [src:1]. 공개 저장소는 `@seed-design/css`, `@seed-design/react`, `@seed-design/stackflow`, `@seed-design/figma`, `@seed-design/mcp` 등의 패키지로 구성된다 [src:27].

시스템의 중심 철학은 색을 역할로 다루는 것이다. 역할이 부여된 색상은 주요 액션·오류·정보 같은 기능적 역할을 색에 할당해 인터페이스 전반의 일관성·명확성·접근성을 보장한다 [src:4]. 브랜딩 기록은 **주황을 당근을 상징하는 색으로 그대로 지키고, 코드 에디터 하이라이트에서 따온 라임을 SEED 자체의 포인트 컬러로 더했다**고 밝힌다 — 주황이 '당근다움'을, 라임이 '디자인 시스템다운 전문성'을 맡는 분담이다 [src:26].

브랜드 일관성은 색에서 멈추지 않는다. 아이콘도 **당근 로고의 형태적 특징을 바탕으로** 친근하고 부드러운 인상을 전달하도록 만들어졌고, 명확한 메타포와 간결한 형태, 굵은 선을 써서 글로벌 사용자가 공감할 수 있는 디자인을 목표로 한다 [src:15]. 프리뷰의 심볼과 시그니처 로고는 공식 당근 웹사이트의 favicon 및 인라인 SVG 로고를 기준으로 둔다 [src:28].

## Colors

> **전량 대조(2026-08-05).** 종전 판본은 "`<TokenReference>` 플레이스홀더 탓에 텍스트 출처만으로 값 대조가 불가능하다"고 적었으나, 공식이 `/foundations/design-token/reference`에 11개 축 319행을 light/dark 병기 마크다운 표로 발행한다 [src:7]. 아래 색 토큰은 그 표의 hex에서 OKLCH를 역산한 값이다. 종전 판본이 "공개 출처 어디에서도 확인되지 않는다"며 철회했던 static alpha 계열도 `static-black-alpha-*`·`static-white-alpha-*`로 실재가 확인돼 되살렸다.

SEED의 색상 체계는 라이트와 다크 모드에 적응하도록 설계되며, 역할 기반 색상은 여러 테마에서도 대비와 시각적 계층을 유지하도록 정의된다 [src:3]. 팔레트는 Gray 한 계열과 Chromatic 6계열(Carrot · Blue · Green · Yellow · Red · Purple), 그리고 테마를 타지 않는 static 계열로 구성된다 [src:5][src:7].

테마 전환의 기전을 오해하지 않는 것이 중요하다. **역할 토큰이 값을 바꾸는 게 아니라 팔레트가 뒤집힌다.** `fg-neutral`은 두 테마 모두 `gray-1000`을 가리키고, 뒤집히는 쪽은 `gray-1000` 자신이다 — 라이트에서 램프의 가장 어두운 끝이던 값이 다크에서는 가장 밝은 끝이 된다 [src:7]. 그래서 `static-*` 계열이 따로 존재한다 — 스크림이나 오버레이처럼 배경이 뒤집혀도 같이 뒤집히면 안 되는 자리에 쓰라고, 두 테마에서 값이 동일하게 고정돼 있다 [src:7].

라이트 모드 팔레트 · 배너 · 매너온도 램프:

```yaml
# ── palette (94) ──
gray-00: oklch(1.000 0.000 0) # #ffffff
gray-100: oklch(0.979 0.002 248) # #f7f8f9
gray-200: oklch(0.967 0.002 248) # #f3f4f5
gray-300: oklch(0.952 0.003 265) # #eeeff1
gray-400: oklch(0.901 0.007 269) # #dcdee3
gray-500: oklch(0.867 0.007 269) # #d1d3d8
gray-600: oklch(0.766 0.010 267) # #b0b3ba
gray-700: oklch(0.636 0.015 262) # #868b94
gray-800: oklch(0.477 0.028 264) # #555d6d
gray-900: oklch(0.307 0.017 256) # #2a3038
gray-1000: oklch(0.226 0.008 264) # #1a1c20
carrot-100: oklch(0.970 0.016 47) # #fff2ec
carrot-200: oklch(0.946 0.031 52) # #ffe8db
carrot-300: oklch(0.903 0.055 48) # #ffd5c0
carrot-400: oklch(0.843 0.092 46) # #ffb999
carrot-500: oklch(0.769 0.144 44) # #ff9364
carrot-600: oklch(0.696 0.204 43) # #ff6600
carrot-700: oklch(0.618 0.195 40) # #e14d00
carrot-800: oklch(0.529 0.173 38) # #b93901
carrot-900: oklch(0.422 0.133 40) # #862b00
carrot-1000: oklch(0.276 0.081 42) # #471601
blue-100: oklch(0.970 0.014 255) # #eff6ff
blue-200: oklch(0.942 0.023 256) # #e2edfc
blue-300: oklch(0.897 0.043 256) # #cbdffa
blue-400: oklch(0.842 0.077 255) # #aacefd
blue-500: oklch(0.774 0.113 256) # #85b8fd
blue-600: oklch(0.688 0.163 261) # #5e98fe
blue-700: oklch(0.606 0.205 258) # #217cf9
blue-800: oklch(0.510 0.185 259) # #135fcd
blue-900: oklch(0.408 0.145 259) # #0b4596
blue-1000: oklch(0.268 0.091 258) # #032451
red-100: oklch(0.965 0.014 17) # #fdf0f0
red-200: oklch(0.946 0.024 18) # #fde7e7
red-300: oklch(0.905 0.047 21) # #fed4d2
red-400: oklch(0.844 0.083 23) # #feb7b3
red-500: oklch(0.773 0.131 23) # #fe928d
red-600: oklch(0.705 0.180 24) # #fc6a66
red-700: oklch(0.640 0.233 28) # #fa342c
red-800: oklch(0.537 0.206 29) # #ca1d13
red-900: oklch(0.426 0.159 31) # #921708
red-1000: oklch(0.277 0.087 32) # #4a1209
green-100: oklch(0.974 0.015 176) # #edfaf6
green-200: oklch(0.949 0.035 167) # #d9f6e9
green-300: oklch(0.894 0.059 164) # #b9e9d2
green-400: oklch(0.824 0.109 164) # #7ddcb3
green-500: oklch(0.739 0.136 164) # #42c593
green-600: oklch(0.658 0.135 165) # #10ab7d
green-700: oklch(0.585 0.115 170) # #079171
green-800: oklch(0.499 0.095 174) # #00745f
green-900: oklch(0.399 0.073 175) # #075445
green-1000: oklch(0.263 0.040 176) # #0a2b24
yellow-100: oklch(0.976 0.034 92) # #fff7de
yellow-200: oklch(0.950 0.071 95) # #fdefb9
yellow-300: oklch(0.898 0.141 95) # #fbdc65
yellow-400: oklch(0.835 0.146 93) # #e9c647
yellow-500: oklch(0.758 0.144 90) # #d4ab28
yellow-600: oklch(0.700 0.133 85) # #c49725
yellow-700: oklch(0.592 0.109 85) # #9b7821
yellow-800: oklch(0.486 0.081 84) # #755b22
yellow-900: oklch(0.375 0.052 81) # #4f3e1f
yellow-1000: oklch(0.267 0.033 90) # #2c2512
purple-100: oklch(0.969 0.015 294) # #f5f3fe
purple-200: oklch(0.947 0.027 297) # #efeafe
purple-300: oklch(0.902 0.054 296) # #e1d8ff
purple-400: oklch(0.842 0.088 296) # #d0c0ff
purple-500: oklch(0.765 0.134 294) # #b8a1ff
purple-600: oklch(0.690 0.170 292) # #9f84fb
purple-700: oklch(0.615 0.187 291) # #8969ea
purple-800: oklch(0.528 0.182 290) # #6d50cb
purple-900: oklch(0.424 0.155 290) # #50379b
purple-1000: oklch(0.278 0.117 288) # #29175d
static-black: oklch(0.000 0.000 0) # #000000
static-black-alpha-100: oklch(0.000 0.000 0 / 0.027) # #00000007
static-black-alpha-200: oklch(0.000 0.000 0 / 0.047) # #0000000c
static-black-alpha-300: oklch(0.000 0.000 0 / 0.063) # #00000010
static-black-alpha-400: oklch(0.000 0.000 0 / 0.129) # #00000021
static-black-alpha-500: oklch(0.000 0.000 0 / 0.173) # #0000002c
static-black-alpha-600: oklch(0.000 0.000 0 / 0.298) # #0000004c
static-black-alpha-700: oklch(0.000 0.000 0 / 0.455) # #00000074
static-black-alpha-800: oklch(0.000 0.000 0 / 0.635) # #000000a2
static-black-alpha-900: oklch(0.000 0.000 0 / 0.816) # #000000d0
static-black-alpha-1000: oklch(0.000 0.000 0 / 0.89) # #000000e3
static-white: oklch(1.000 0.000 0) # #ffffff
static-white-alpha-50: oklch(1.000 0.000 0 / 0.051) # #ffffff0d
static-white-alpha-100: oklch(1.000 0.000 0 / 0.09) # #ffffff17
static-white-alpha-200: oklch(1.000 0.000 0 / 0.125) # #ffffff20
static-white-alpha-300: oklch(1.000 0.000 0 / 0.18) # #ffffff2e
static-white-alpha-400: oklch(1.000 0.000 0 / 0.239) # #ffffff3d
static-white-alpha-500: oklch(1.000 0.000 0 / 0.376) # #ffffff60
static-white-alpha-600: oklch(1.000 0.000 0 / 0.545) # #ffffff8b
static-white-alpha-700: oklch(1.000 0.000 0 / 0.702) # #ffffffb3
static-white-alpha-800: oklch(1.000 0.000 0 / 0.871) # #ffffffde
static-white-alpha-900: oklch(1.000 0.000 0 / 0.918) # #ffffffea
static-white-alpha-1000: oklch(1.000 0.000 0 / 0.957) # #fffffff4

# ── bg (2) ──
bg-magic-weak: oklch(0.965 0.009 52) # #f9f2ee
bg-transparent: oklch(0.000 0.000 0 / 0) # #00000000

# ── banner (10) ──
banner-blue: oklch(0.962 0.025 222) # #e1f7ff
banner-cool-gray: oklch(0.955 0.008 237) # #ebf1f5
banner-green: oklch(0.974 0.031 129) # #f0fbe5
banner-orange: oklch(0.967 0.026 75) # #fff2e1
banner-pink: oklch(0.958 0.023 357) # #ffebf1
banner-purple: oklch(0.956 0.027 307) # #f5ecff
banner-red: oklch(0.959 0.021 10) # #ffecee
banner-teal: oklch(0.969 0.022 183) # #e6faf6
banner-warm-gray: oklch(0.956 0.003 68) # #f2f0ee
banner-yellow: oklch(0.982 0.033 98) # #fffae1

# ── manner-temp (20) ──
manner-temp-l1-bg: oklch(0.961 0.002 248) # #f1f2f3
manner-temp-l1-text: oklch(0.581 0.017 261) # #757b85
manner-temp-l10-bg: oklch(0.957 0.022 7) # #ffebee
manner-temp-l10-text: oklch(0.531 0.215 24) # #cb0123
manner-temp-l2-bg: oklch(0.968 0.011 85) # #f8f4ec
manner-temp-l2-text: oklch(0.641 0.100 82) # #ab863f
manner-temp-l3-bg: oklch(0.974 0.024 80) # #fff5e5
manner-temp-l3-text: oklch(0.707 0.156 67) # #e08a00
manner-temp-l4-bg: oklch(0.970 0.023 72) # #fff3e5
manner-temp-l4-text: oklch(0.715 0.178 54) # #f57e00
manner-temp-l5-bg: oklch(0.966 0.022 63) # #fff1e5
manner-temp-l5-text: oklch(0.713 0.195 48) # #ff7300
manner-temp-l6-bg: oklch(0.964 0.022 59) # #fff0e5
manner-temp-l6-text: oklch(0.696 0.204 43) # #ff6600
manner-temp-l7-bg: oklch(0.962 0.022 54) # #ffefe5
manner-temp-l7-text: oklch(0.672 0.221 38) # #ff5100
manner-temp-l8-bg: oklch(0.960 0.022 50) # #ffeee5
manner-temp-l8-text: oklch(0.646 0.241 33) # #ff3300
manner-temp-l9-bg: oklch(0.959 0.017 17) # #fdeded
manner-temp-l9-text: oklch(0.606 0.220 21) # #e82c45
```

다크 모드에서 값이 달라지는 토큰(`static-*`은 동일하므로 제외):

```yaml
# ── palette (94) ──
dark-gray-00: oklch(0.000 0.000 0) # #000000
dark-gray-100: oklch(0.205 0.008 275) # #16171b
dark-gray-200: oklch(0.243 0.011 261) # #1d2025
dark-gray-300: oklch(0.301 0.013 267) # #2b2e35
dark-gray-400: oklch(0.360 0.016 266) # #393d46
dark-gray-500: oklch(0.488 0.017 264) # #5b606a
dark-gray-600: oklch(0.636 0.015 262) # #868b94
dark-gray-700: oklch(0.766 0.010 267) # #b0b3ba
dark-gray-800: oklch(0.901 0.007 269) # #dcdee3
dark-gray-900: oklch(0.937 0.003 265) # #e9eaec
dark-gray-1000: oklch(0.967 0.002 248) # #f3f4f5
dark-carrot-100: oklch(0.274 0.022 42) # #31241f
dark-carrot-200: oklch(0.322 0.056 41) # #4b291c
dark-carrot-300: oklch(0.387 0.089 40) # #6b311c
dark-carrot-400: oklch(0.458 0.136 43) # #923600
dark-carrot-500: oklch(0.546 0.169 40) # #bd4201
dark-carrot-600: oklch(0.632 0.196 41) # #e65200
dark-carrot-700: oklch(0.696 0.204 43) # #ff6600
dark-carrot-800: oklch(0.787 0.137 50) # #ff9e65
dark-carrot-900: oklch(0.874 0.044 51) # #eecebc
dark-carrot-1000: oklch(0.953 0.008 56) # #f4eeea
dark-blue-100: oklch(0.280 0.051 272) # #202742
dark-blue-200: oklch(0.320 0.062 258) # #1e3352
dark-blue-300: oklch(0.379 0.098 256) # #1a4275
dark-blue-400: oklch(0.451 0.135 254) # #0f559e
dark-blue-500: oklch(0.530 0.192 260) # #1964d8
dark-blue-600: oklch(0.609 0.181 254) # #1e82eb
dark-blue-700: oklch(0.695 0.157 249) # #41a2f9
dark-blue-800: oklch(0.779 0.106 251) # #83bcf9
dark-blue-900: oklch(0.869 0.060 253) # #b9d7fb
dark-blue-1000: oklch(0.951 0.022 254) # #e5f0fe
dark-red-100: oklch(0.274 0.023 19) # #322323
dark-red-200: oklch(0.324 0.062 24) # #4f2624
dark-red-300: oklch(0.390 0.108 25) # #742826
dark-red-400: oklch(0.468 0.160 28) # #a12621
dark-red-500: oklch(0.541 0.202 29) # #ca2319
dark-red-600: oklch(0.635 0.230 30) # #f73526
dark-red-700: oklch(0.714 0.180 28) # #ff6e60
dark-red-800: oklch(0.803 0.112 26) # #ffa299
dark-red-900: oklch(0.868 0.059 21) # #f8c5c3
dark-red-1000: oklch(0.970 0.012 17) # #fdf2f2
dark-green-100: oklch(0.271 0.014 173) # #202926
dark-green-200: oklch(0.312 0.032 169) # #20362e
dark-green-300: oklch(0.371 0.053 169) # #20493b
dark-green-400: oklch(0.440 0.077 170) # #19604c
dark-green-500: oklch(0.512 0.105 164) # #117956
dark-green-600: oklch(0.594 0.118 165) # #1b946d
dark-green-700: oklch(0.679 0.139 163) # #22b27f
dark-green-800: oklch(0.761 0.146 165) # #35ce9a
dark-green-900: oklch(0.859 0.096 164) # #93e5c0
dark-green-1000: oklch(0.947 0.036 182) # #d4f6ef
dark-yellow-100: oklch(0.281 0.028 83) # #302819
dark-yellow-200: oklch(0.327 0.046 80) # #413218
dark-yellow-300: oklch(0.379 0.064 80) # #543e15
dark-yellow-400: oklch(0.452 0.085 75) # #714e15
dark-yellow-500: oklch(0.530 0.103 70) # #91601b
dark-yellow-600: oklch(0.611 0.131 68) # #b6720d
dark-yellow-700: oklch(0.693 0.137 78) # #ca901c
dark-yellow-800: oklch(0.779 0.119 85) # #dab156
dark-yellow-900: oklch(0.870 0.076 93) # #e5d49b
dark-yellow-1000: oklch(0.952 0.046 98) # #f7f0cd
dark-purple-100: oklch(0.269 0.048 295) # #28213b
dark-purple-200: oklch(0.345 0.123 290) # #3b2873
dark-purple-300: oklch(0.379 0.130 290) # #443081
dark-purple-400: oklch(0.458 0.177 290) # #5a3bb1
dark-purple-500: oklch(0.545 0.201 291) # #764fd9
dark-purple-600: oklch(0.626 0.189 292) # #8e6bee
dark-purple-700: oklch(0.707 0.143 295) # #a78df0
dark-purple-800: oklch(0.787 0.098 295) # #beadf2
dark-purple-900: oklch(0.874 0.061 297) # #d9cefa
dark-purple-1000: oklch(0.953 0.020 295) # #f0edfc

# ── bg (2) ──
dark-bg-magic-weak: oklch(0.240 0.002 17) # #201f1f
dark-bg-transparent: oklch(1.000 0.000 0 / 0) # #ffffff00

# ── banner (10) ──
dark-banner-blue: oklch(0.271 0.045 236) # #0d2a3a
dark-banner-cool-gray: oklch(0.288 0.017 245) # #242c33
dark-banner-green: oklch(0.305 0.054 142) # #1e361c
dark-banner-orange: oklch(0.292 0.060 56) # #42230a
dark-banner-pink: oklch(0.267 0.064 346) # #3b172c
dark-banner-purple: oklch(0.276 0.071 301) # #2e1e45
dark-banner-red: oklch(0.243 0.068 16) # #3a0f15
dark-banner-teal: oklch(0.307 0.040 188) # #143633
dark-banner-warm-gray: oklch(0.292 0.009 67) # #2f2b27
dark-banner-yellow: oklch(0.304 0.062 82) # #3e2b00

# ── manner-temp (20) ──
dark-manner-temp-l1-bg: oklch(0.281 0.000 0) # #292929
dark-manner-temp-l1-text: oklch(0.783 0.001 286) # #b8b8b9
dark-manner-temp-l10-bg: oklch(0.213 0.076 19) # #34040a
dark-manner-temp-l10-text: oklch(0.716 0.171 14) # #fb6f82
dark-manner-temp-l2-bg: oklch(0.277 0.051 87) # #332605
dark-manner-temp-l2-text: oklch(0.898 0.091 89) # #f5db97
dark-manner-temp-l3-bg: oklch(0.294 0.059 92) # #372b01
dark-manner-temp-l3-text: oklch(0.896 0.140 93) # #fdda65
dark-manner-temp-l4-bg: oklch(0.274 0.056 76) # #372301
dark-manner-temp-l4-text: oklch(0.838 0.139 78) # #fbbe55
dark-manner-temp-l5-bg: oklch(0.265 0.057 68) # #371f01
dark-manner-temp-l5-text: oklch(0.803 0.143 69) # #faac4b
dark-manner-temp-l6-bg: oklch(0.253 0.055 60) # #351b03
dark-manner-temp-l6-text: oklch(0.771 0.145 53) # #fc9855
dark-manner-temp-l7-bg: oklch(0.248 0.061 53) # #371701
dark-manner-temp-l7-text: oklch(0.716 0.179 49) # #f97a25
dark-manner-temp-l8-bg: oklch(0.235 0.071 42) # #380f00
dark-manner-temp-l8-text: oklch(0.702 0.193 39) # #fe6a34
dark-manner-temp-l9-bg: oklch(0.221 0.081 33) # #380500
dark-manner-temp-l9-text: oklch(0.706 0.183 28) # #fe6a5d
```

대비 기준은 WCAG 비율이 아니라 **APCA(Advanced Perceptual Contrast Algorithm)**다. 가독성 텍스트는 **최소 Lc 75**를 넘겨야 하고 **Lc 90 이상을 권장**한다 [src:18]. 그리고 색상만으로 정보를 전달하지 않고 텍스트나 아이콘 같은 다른 시각 요소를 함께 제공한다 [src:18].

토큰 체계 자체는 raw value 위에 이름을 얹는 층위로 설계된다 — 색상 리터럴이나 `1px` 같은 실제 값에 고유한 이름을 부여해 일관성과 재사용성을 얻되, 그만큼 유연성이 제한된다는 교환을 공식이 명시한다 [src:6]. 제품 UI에서는 raw 팔레트보다 역할 토큰을 우선 호출한다 [src:4]. 아래 표의 역할 토큰은 팔레트 단계를 가리키는 별칭이라 그 자체로 렌더되는 색이 아니며, 두 테마가 같은 램프 단계를 가리키는 경우가 다수다:

| 역할 토큰 | light | dark |
| --- | --- | --- |
| `bg-brand-solid` | `carrot-600` | `carrot-700` |
| `bg-brand-solid-pressed` | `carrot-700` | `carrot-800` |
| `bg-brand-weak` | `carrot-100` | `carrot-100` |
| `bg-brand-weak-pressed` | `carrot-200` | `carrot-200` |
| `bg-critical-solid` | `red-700` | `red-600` |
| `bg-critical-solid-pressed` | `red-800` | `red-700` |
| `bg-critical-weak` | `red-100` | `red-100` |
| `bg-critical-weak-pressed` | `red-200` | `red-200` |
| `bg-disabled` | `gray-200` | `gray-300` |
| `bg-informative-solid` | `blue-700` | `blue-600` |
| `bg-informative-solid-pressed` | `blue-800` | `blue-700` |
| `bg-informative-weak` | `blue-100` | `blue-100` |
| `bg-informative-weak-pressed` | `blue-200` | `blue-200` |
| `bg-layer-basement` | `gray-200` | `gray-00` |
| `bg-layer-default` | `gray-00` | `gray-100` |
| `bg-layer-default-pressed` | `gray-100` | `gray-300` |
| `bg-layer-fill` | `gray-100` | `gray-200` |
| `bg-layer-floating` | `gray-00` | `gray-200` |
| `bg-layer-floating-pressed` | `gray-100` | `gray-300` |
| `bg-neutral-inverted` | `gray-900` | `gray-1000` |
| `bg-neutral-inverted-pressed` | `gray-800` | `gray-800` |
| `bg-neutral-solid` | `gray-1000` | `gray-300` |
| `bg-neutral-weak` | `gray-200` | `gray-300` |
| `bg-neutral-weak-alpha` | `static-black-alpha-200` | `static-white-alpha-200` |
| `bg-neutral-weak-alpha-pressed` | `static-black-alpha-300` | `static-white-alpha-300` |
| `bg-neutral-weak-pressed` | `gray-300` | `gray-400` |
| `bg-overlay` | `static-black-alpha-700` | `static-black-alpha-700` |
| `bg-overlay-muted` | `static-black-alpha-500` | `static-black-alpha-500` |
| `bg-positive-solid` | `green-700` | `green-500` |
| `bg-positive-solid-pressed` | `green-800` | `green-600` |
| `bg-positive-weak` | `green-100` | `green-100` |
| `bg-positive-weak-pressed` | `green-200` | `green-200` |
| `bg-transparent-pressed` | `static-black-alpha-100` | `static-white-alpha-50` |
| `bg-transparent-selected` | `static-black-alpha-200` | `static-white-alpha-100` |
| `bg-transparent-selected-pressed` | `static-black-alpha-300` | `static-white-alpha-200` |
| `bg-warning-solid` | `yellow-300` | `yellow-800` |
| `bg-warning-solid-pressed` | `yellow-400` | `yellow-900` |
| `bg-warning-weak` | `yellow-100` | `yellow-100` |
| `bg-warning-weak-pressed` | `yellow-200` | `yellow-200` |
| `fg-brand` | `carrot-600` | `carrot-700` |
| `fg-brand-contrast` | `carrot-700` | `carrot-700` |
| `fg-critical` | `red-700` | `red-700` |
| `fg-critical-contrast` | `red-900` | `red-900` |
| `fg-disabled` | `gray-500` | `gray-500` |
| `fg-informative` | `blue-700` | `blue-700` |
| `fg-informative-contrast` | `blue-900` | `blue-900` |
| `fg-neutral` | `gray-1000` | `gray-1000` |
| `fg-neutral-inverted` | `gray-00` | `gray-100` |
| `fg-neutral-muted` | `gray-800` | `gray-800` |
| `fg-neutral-subtle` | `gray-700` | `gray-700` |
| `fg-placeholder` | `gray-600` | `gray-600` |
| `fg-positive` | `green-700` | `green-700` |
| `fg-positive-contrast` | `green-900` | `green-900` |
| `fg-warning` | `yellow-700` | `yellow-700` |
| `fg-warning-contrast` | `yellow-900` | `yellow-900` |
| `stroke-brand-solid` | `carrot-700` | `carrot-700` |
| `stroke-brand-weak` | `carrot-300` | `carrot-300` |
| `stroke-critical-solid` | `red-700` | `red-700` |
| `stroke-critical-weak` | `red-300` | `red-300` |
| `stroke-focus-ring` | `blue-600` | `blue-600` |
| `stroke-informative-solid` | `blue-700` | `blue-700` |
| `stroke-informative-weak` | `blue-300` | `blue-300` |
| `stroke-neutral-contrast` | `gray-1000` | `gray-1000` |
| `stroke-neutral-muted` | `static-black-alpha-300` | `static-white-alpha-100` |
| `stroke-neutral-solid` | `gray-800` | `gray-800` |
| `stroke-neutral-subtle` | `static-black-alpha-200` | `static-white-alpha-50` |
| `stroke-neutral-weak` | `gray-400` | `gray-400` |
| `stroke-positive-solid` | `green-700` | `green-700` |
| `stroke-positive-weak` | `green-300` | `green-300` |
| `stroke-warning-solid` | `yellow-700` | `yellow-700` |
| `stroke-warning-weak` | `yellow-300` | `yellow-300` |

**매너온도 램프**는 당근 고유의 자산이다. 매너온도는 구간에 따라 10단계 레벨로 표시되며, 각 레벨마다 텍스트 색상과 그래픽이 달라진다. `temperature`는 실제 숫자 값을 받고 레벨과 시각 스타일은 그 값에서 자동 계산된다 [src:52]. 램프는 낮은 단계의 중립 회색(`manner-temp-l1-text`)에서 시작해 브랜드 주황을 지나 높은 단계의 적색(`manner-temp-l10-text`)으로 이동한다 [src:7].

그라디언트는 입체감과 AI(magic) 기능 표현에 쓰는 별도 축이다 [src:14]:

```yaml
glow-magic: oklch(0.980 0.009 9) 0%, oklch(0.964 0.019 55) 80%, oklch(0.977 0.003 68) 100% # #fef6f7 #fef0e7 #f9f7f5
dark-glow-magic: oklch(0.277 0.018 326) 0%, oklch(0.321 0.017 56) 80%, oklch(0.318 0.001 17) 100% # #2d252d #3a312b #333232
glow-magic-pressed: oklch(0.964 0.012 5) 0%, oklch(0.946 0.031 52) 80%, oklch(0.963 0.005 68) 100% # #fbf0f2 #ffe8db #f5f2ef
dark-glow-magic-pressed: oklch(0.337 0.024 326) 0%, oklch(0.400 0.020 52) 80%, oklch(0.380 0.001 17) 100% # #3e333e #51453e #434242
highlight-magic: oklch(0.696 0.204 43) 20%, oklch(0.658 0.200 330) 100% # #ff6600 #d25aca
dark-highlight-magic: oklch(0.696 0.204 43) 20%, oklch(0.658 0.200 330) 100% # #ff6600 #d25aca
highlight-magic-pressed: oklch(0.621 0.194 40) 20%, oklch(0.603 0.173 321) 100% # #e14f00 #ae58bf
dark-highlight-magic-pressed: oklch(0.787 0.137 50) 20%, oklch(0.793 0.141 324) 100% # #ff9e65 #e89bee
shimmer-magic: oklch(0.986 0.008 56 / 0) 0%, oklch(0.986 0.008 56 / 0.8) 46%, oklch(0.986 0.008 56 / 0.8) 54%, oklch(0.986 0.008 56 / 0) 100% # #fff9f500 #fff9f5cc #fff9f5cc #fff9f500
dark-shimmer-magic: oklch(0.986 0.008 56 / 0) 0%, oklch(0.986 0.008 56 / 0.102) 46%, oklch(0.986 0.008 56 / 0.102) 54%, oklch(0.986 0.008 56 / 0) 100% # #fff9f500 #fff9f51a #fff9f51a #fff9f500
shimmer-neutral: oklch(1.000 0.000 90 / 0) 0%, oklch(1.000 0.000 90 / 0.671) 46%, oklch(1.000 0.000 90 / 0.671) 54%, oklch(1.000 0.000 90 / 0) 100% # #ffffff00 #ffffffab #ffffffab #ffffff00
dark-shimmer-neutral: oklch(1.000 0.000 90 / 0) 0%, oklch(1.000 0.000 90 / 0.102) 46%, oklch(1.000 0.000 90 / 0.102) 54%, oklch(1.000 0.000 90 / 0) 100% # #ffffff00 #ffffff1a #ffffff1a #ffffff00
```

## Typography

SEED는 자체 서체를 배포하지 않는다. **사용자의 디바이스 환경을 고려해 시스템 폰트를 쓰며**, 이는 다양한 국가와 문화권의 여러 기기·운영체제에서 일관된 경험과 가독성을 보장하기 위한 선택이다 [src:8]. 이 결정은 다국가 대응 설계 원칙과 같은 방향이다 [src:19].

타이포그래피 시스템은 폰트 크기·줄 높이·폰트 두께를 각각 토큰으로 정의하고, 이를 두 갈래로 조합한다 — `t5Regular`·`t1Bold` 같은 **스케일 텍스트 스타일**과 `screenTitle`·`articleBody` 같은 **시맨틱 텍스트 스타일**이다 [src:8]. 아래는 크기·줄 높이 사다리 14단계와 두께 3종이다. 공식은 각 단계를 rem(스케일 대응)과 `-static` px(고정) 두 벌로 발행하며, 아래 값은 px 기준이다 [src:7].

```yaml
font-sans: >
  -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Segoe UI", Roboto,
  "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
  "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"

t1: 11px / 15px
t2: 12px / 16px
t3: 13px / 18px
t4: 14px / 19px
t5: 16px / 22px
t6: 18px / 24px
t7: 20px / 27px
t8: 22px / 30px
t9: 24px / 32px
t10: 26px / 35px
t11: 28px / 38px
t12: 32px / 42px
t13: 40px / 52px
t14: 48px / 60px

weight-regular: 400
weight-medium: 500
weight-bold: 700
```

## Spacing

Spacing은 컴포넌트와 콘텐츠 사이의 간격을 표현하며, 2px을 최소 단위로 하는 `x` 사다리로 토큰화된다 [src:9][src:7]. 이름의 숫자는 4px 배수를 뜻해 `x1`이 4px, `x2`가 8px이고, 반 단계는 `x0_5`처럼 언더스코어로 적는다.

```yaml
x0_5: 2px
x1: 4px
x1_5: 6px
x2: 8px
x2_5: 10px
x3: 12px
x3_5: 14px
x4: 16px
x4_5: 18px
x5: 20px
x6: 24px
x7: 28px
x8: 32px
x9: 36px
x10: 40px
x12: 48px
x13: 52px
x14: 56px
x16: 64px
spacing-x-between-chips: $dimension.x2
spacing-x-global-gutter: $dimension.x4
spacing-y-component-default: $dimension.x3
spacing-y-nav-to-title: $dimension.x5
spacing-y-screen-bottom: $dimension.x14
spacing-y-between-text: $dimension.x1_5
```

사다리 아래쪽 6줄은 raw 단계를 가리키는 시맨틱 별칭이다 — 화면 좌우 여백(`spacing-x-global-gutter`), 컴포넌트 기본 세로 간격(`spacing-y-component-default`), 내비게이션과 타이틀 사이(`spacing-y-nav-to-title`), 화면 하단 여백(`spacing-y-screen-bottom`), 칩 사이(`spacing-x-between-chips`), 텍스트 줄 사이(`spacing-y-between-text`)라는 사용 맥락을 제공한다 [src:7]. 별칭이므로 토큰 카드에는 실리지 않고 이 산문에만 남는다.

레이아웃 층위의 여백은 이 사다리와 별개로 중단점마다 정의된다 — 아래 `## Responsive Behavior`의 gutter·margin 표를 함께 볼 것 [src:12].

## Rounded

Radius는 컴포넌트나 콘텐츠 모서리의 둥글기를 표현하며, 2px에서 24px까지 11단계와 완전 원형용 `full`로 구성된다 [src:10][src:7]. 이름 규칙은 spacing과 같아 `r1`이 4px, `r2`가 8px이다.

```yaml
r0_5: 2px
r1: 4px
r1_5: 6px
r2: 8px
r2_5: 10px
r3: 12px
r3_5: 14px
r4: 16px
r5: 20px
r6: 24px
full: 9999px
```

중첩된 표면에서는 바깥과 안쪽 radius를 따로 잡아 동심(concentric) 관계를 유지한다 — List Item이 이 규칙을 명시적으로 다룬다 [src:51].

## Elevation & Depth

> **수치 확보(2026-08-05).** 종전 판본은 "shadow의 구체적 수치는 `<TokenReference groups="shadow">`가 렌더 단계에서 주입하므로 텍스트 출처에 없다"고 적었다. 지금은 `$shadow.s1~s3`이 오프셋·블러·스프레드·색까지 평문 표로 발행되므로 그 서술을 철회하고 실제 값을 싣는다 [src:7].

Elevation은 물리 세계의 높낮이 개념을 빌려 UI 요소 간 상대적 깊이와 계층을 표현하는 원칙이다 [src:11]. 관리의 핵심은 레벨을 **Global**과 **Local** 두 스태킹 컨텍스트로 나누는 것이다 — Global은 뷰포트 전체나 컨테이너 역할의 층위이고, Local은 특정 맥락 안의 시각적 깊이로 항상 Global 위에 놓인다 [src:11].

깊이를 표현하는 수단은 Surface color · Shadow · Stroke 세 가지이며, 그중 색 층위가 1차 수단이다. 표면은 `bg-layer-basement` → `bg-layer-default` → `bg-layer-fill` → `bg-layer-floating` 순으로 쌓이고, 이 별칭들이 두 테마에서 서로 다른 gray 단계를 가리켜 깊이감을 만든다 [src:11][src:7].

```yaml
s1: 0px 1px 4px 0px oklch(0 0 0 / 0.078) # #00000014
dark-s1: 0px 1px 4px 0px oklch(0 0 0 / 0.502) # #00000080
s2: 0px 2px 10px 0px oklch(0 0 0 / 0.102) # #0000001a
dark-s2: 0px 2px 10px 0px oklch(0 0 0 / 0.678) # #000000ad
s3: 0px 4px 16px 0px oklch(0 0 0 / 0.122) # #0000001f
dark-s3: 0px 4px 16px 0px oklch(0 0 0 / 0.8) # #000000cc
```

다크 모드에서 shadow의 알파가 크게 올라가는 것(`s1` 8% → 50%)에 주목할 것 — 어두운 배경에서 같은 농도로는 층이 보이지 않기 때문이다 [src:7]. 그럼에도 shadow는 주목도가 가장 높은 소수 요소에만 쓰고, 대부분의 층 분리는 surface color와 stroke로 해결한다 [src:11].

## Shapes

형태 언어는 둥글고 부드러운 쪽이다. 아이콘이 당근 로고의 형태적 특징에서 출발해 친근하고 부드러운 인상을 목표로 하고, 굵은 선과 간결한 형태로 정리된다는 서술이 그 기조를 드러낸다 [src:15]. 아이콘은 Monochrome과 Multicolor 두 범주로 나뉘고, 이름은 확장성을 위해 의미가 아니라 형상만으로 명명한다 [src:15].

표면은 직각을 거의 쓰지 않는다. radius 사다리가 2px부터 촘촘히 시작해 `full`까지 이어지고 [src:10], Action Button처럼 브랜드를 실어 나르는 컨트롤은 `{rounded.full}` 쪽으로 간다. 이미지 표면은 Corner Radius를 별도 속성으로 다루며 중첩 시 동심 관계를 유지한다 [src:49].

## Components

공식 컴포넌트 카탈로그는 47개의 활성 컴포넌트와 9개의 Deprecated 항목으로 구성되며, 각 문서는 Anatomy · Properties · Guidelines · Specification 구조를 따른다 [src:22]. 대부분의 컴포넌트가 Figma · React · iOS · Android 네 플랫폼에 걸쳐 제공된다 [src:22].

상태 표현은 전 컴포넌트 공통 규약을 따른다. UI 상태는 **상호작용 상태**(사용자 조작에 따라 변함)와 **옵션 상태**(적용된 옵션에 따름) 두 유형이며, 정의된 상태는 Enabled · Pressed · Selected · Disabled다 [src:17]. 두 유형은 한쪽이 다른 쪽을 덮어쓸 수도, 함께 적용될 수도 있다 [src:17].

### accordion

세부 정보를 점진적으로 공개하는 수직 목록이다 [src:29]. Trigger(Prefix · Title · Description · Chevron Icon)와 확장 시 나타나는 Custom Content로 구성되며, Trigger 전체가 열고 닫는 터치 영역이다 [src:29]. Content Panel 안에 별도 스크롤을 두는 것은 지양하고, 확장 시 자동 스크롤과 포커스 이동을 함께 설계한다 [src:29].

### action-button

명확한 액션을 쉽게 수행하도록 돕는 기본 인터랙션 컴포넌트다 [src:30]. Label을 감싸는 Container로 구성되며 Prefix Icon과 Suffix Icon을 가질 수 있다 [src:30]. Size · Layout · Variant · State · Width · Hierarchy 속성을 가지고, **Brand 컬러는 꼭 필요한 곳에만 사용**하라는 지침이 명시돼 있다 [src:30]. CTA에서는 `{colors.bg-brand-solid}`와 `{colors.fg-neutral-inverted}`를 짝지어 쓰고 `{rounded.full}`을 적용한다. 가로로 꽉 채울 때는 `fill` 같은 속성이 아니라 **`flexGrow`** 를 쓴다 — 공식 React API에 `fill` 속성은 없다 [src:25].

### alert-dialog

사용자의 확인이 반드시 필요할 때 쓰는 강한 경고 수단이다 [src:31]. Backdrop(Overlay)과 Dialog Content가 결합된 하나의 컴포넌트로 제공된다 [src:31]. 임의로 다양한 콘텐츠를 조합하지 말고, 알림·확인·경고라는 좁은 용도에 묶어 둔다 [src:31].

### attachment-input

사진·영상·파일 첨부를 다루는 입력으로 선택·업로드·진행률·실패·삭제 상태를 관리한다 [src:32]. Trigger와 Preview로 구성되며 Preview에는 항목별 액션(삭제·재시도)과 업로드 진행 상태를 표시한다 [src:32]. Dropzone과 Reorder를 속성으로 제공한다 [src:32].

### avatar

사용자 프로필 이미지를 표시한다 [src:33]. Image Area와 Border로 구성되고 필요에 따라 Badge를 얹을 수 있으며, 여러 명을 겹쳐 보이는 Avatar Stack을 별도로 제공한다 [src:33].

### badge

객체의 속성이나 상태를 표현하는 작은 텍스트 라벨이다 [src:34]. Size · Tone · Variant를 가지며, 여기서도 **Brand 컬러는 꼭 필요한 곳에만** 쓴다 [src:34]. 너무 많은 Badge를 나열하지 않고, 긴 라벨을 넣지 않으며, **버튼처럼 클릭 가능한 요소로 쓰지 않는다** [src:34].

### bottom-navigation

앱 루트 페이지 하단에 고정되어 다섯 개 상위 탭 간 이동을 제공한다 [src:35]. 아이콘과 라벨로 된 탭 아이템과 이를 감싸는 Container로 구성되고, 각 탭에 Notification Badge를 표시할 수 있다 [src:35]. **북미와 일본의 글로벌 앱에서는 중앙에 브랜드 컬러의 글쓰기 버튼이 놓이며, 이 버튼은 탭 이동이 아니라 글쓰기 화면으로 바로 진입한다** [src:35]. 상단 Divider는 iOS에서 1px로 구현되고 Figma에서는 @3x 기준 0.33px로 그려져 있다 [src:35].

### bottom-sheet

화면 하단에서 올라오는 모달로, 현재 맥락을 유지한 채 추가 정보나 액션 목록을 제공한다 [src:36]. Backdrop · Container · Header · Close button · Footer의 조합이며 Handle 노출 여부를 속성으로 고른다 [src:36]. 최대 너비·최대 높이·Snap Point·키보드 등장 시 동작이 각각 규정돼 있다 [src:36].

### callout

중요한 정보나 팁을 강조해 전달하는 인라인 메시지다 [src:37]. Container에 Prefix Icon · Title · Link Text · Suffix Icon을 선택적으로 얹으며, 상황에 맞는 Tone을 고른다 [src:37]. **Link Text를 Nudge 용도로 쓰지 않는다** [src:37]. 페이지 전체 상태를 알릴 때는 Callout이 아니라 Page Banner를 쓴다 [src:56].

### checkbox

하나 이상의 옵션을 선택하게 하는 컨트롤로, 목록 다중 선택이나 약관 동의에 쓴다 [src:38]. Checkmark와 Label로 구성되며 Checkmark는 개별 컴포넌트로도 제공돼 자유롭게 조합할 수 있다 [src:38]. 터치 타깃을 별도로 규정하고, 즉시 적용되는 설정에는 Checkbox 대신 Switch를 쓴다 [src:38][src:71].

### chip

사용자가 선택하거나 입력하는 값을 표시한다 [src:39]. Container와 Label에 Prefix/Suffix Item을 붙이는 구조이며, Selection · Suggestion · Input 세 용법과 Filter Bar 배치를 문서가 나눠 다룬다 [src:39].

### content-placeholder

이미지나 콘텐츠가 로드되지 않았을 때 그 영역의 성격을 전달하는 대체 시각 요소다 [src:40]. Root 컨테이너와 Asset으로 구성되고, **Asset의 최소 너비 16px · 최대 너비 160px에 정방형 비율을 고정**한다 [src:40].

### contextual-floating-button

화면 위에 떠 있으면서 특정 상황에서만 나타나는 보조 동작 버튼이다 [src:41]. Icon과 Label을 Container가 감싸며 Tone · Layout · State를 가진다 [src:41]. 상시 노출되는 주요 액션은 Floating Action Button 쪽이다 [src:45].

### dialog

흐름을 일시 중지시키고 중요한 정보를 전달하거나 작업 완료를 강제하는 모달이다 [src:42]. Backdrop 위에 Header · Content · Footer 세 영역으로 구성되며 Backdrop이 뒤 화면을 어둡게 처리해 시선을 모은다 [src:42]. Size · Height · Elevation · Scroll Behavior와 함께 Responsive Behavior를 속성으로 다룬다 [src:42].

### divider

콘텐츠 구획을 나누는 시각적 구분자다 [src:43]. `{colors.stroke-neutral-muted}` 또는 `{colors.stroke-neutral-subtle}`로 채워진 **1px 레이어**로 구성되며 필요 시 inset 레이아웃을 쓴다 [src:43]. 불필요한 Divider를 넣지 않고 **마지막 항목 뒤에는 표시하지 않는다** [src:43].

### field

값을 입력받는 컨테이너로, 일관된 레이블·도움말·오류 표기와 상태 피드백을 제공한다 [src:44]. Header(Label · Requirement Mark · Sub Action) · Input · Footer(Helper Text · Error Message · Character Count) 세 영역이며, Input 슬롯에 Text Input · Textarea · Input Button이 들어온다 [src:44]. 제출과 검증, 이탈 시 안내, 필수 입력 표시가 각각 규정돼 있다 [src:44]. 오류 상태는 `{colors.fg-critical}` 역할로만 표시한다 [src:4].

### floating-action-button

화면 위에 떠서 주요 액션을 실행하는 버튼이다 [src:45]. Icon과 Label을 Container가 감싸고 Extended 속성으로 라벨을 펼친다 [src:45]. 위치 규칙과 함께 **Snackbar와의 위치 관계**를 명시적으로 다룬다 [src:45].

### footer

사이트 하단에서 법적 정보·정책 링크·서비스 탐색·연락처를 모으는 영역이다 [src:46]. **필수 블록이 없는 building block의 수직 조합**이라는 점이 특징으로, 제품에 필요한 블록만 골라 쌓는다 [src:46]. 탐색 영역(브랜드 로고 · 국가 선택 · 사이트맵 컬럼)과 안내 영역(정책 링크 · 사업자 정보 · 연락처 · 저작권 · 소셜 링크)으로 나뉘며 둘을 함께 쓸 때는 구분선으로 나눈다 [src:46].

### help-bubble

컴포넌트의 상태나 기능에 대한 추가 정보를 띄우는 말풍선이다 [src:47]. Title · Description · Close Button을 제공하고 Placement 속성으로 위치를 잡는다 [src:47]. Arrow 위치 조정, 넓이, Trigger와의 간격, 화면 밖으로 넘칠 때의 처리가 규정돼 있다 [src:47].

### identity-placeholder

인물을 표현하는 이미지가 로드되지 않았을 때의 대체 시각 요소다 [src:48]. 라이트/다크 모드 대응이 어려운 경우를 위한 대안을 별도로 제공한다 [src:48].

### image-frame

사용자가 업로드한 이미지를 표시한다 [src:49]. Image Area · Corner Radius · Border로 구성되며 Ratio · Size · Fallback Image · Overlay 표시를 속성으로 가진다 [src:49]. 중첩 시 Corner Radius 적용 규칙과 Rounded 속성의 사용을 따로 다루고, Floater · Indicator · Reaction Button을 하위 요소로 얹을 수 있다 [src:49].

### input-button

선택창이나 피커를 여는 입력 필드 형태의 버튼으로, 선택이 끝나면 라벨에 선택값이 표시된다 [src:50]. Value와 Container, 선택적 Clear Button, Prefix/Suffix Slot으로 구성된다 [src:50].

### list

가로 행으로 구성된 콘텐츠를 표현한다 [src:51]. List Item은 Prefix · Title · Detail · Suffix로 구성되며 **컴포넌트 자체에는 배경색이 지정돼 있지 않다** — 문서의 배경색은 가이드용 표기다 [src:51]. List Header로 묶는 방법, 내부 간격 조정, Switch/Checkmark/Radiomark를 얹을 때의 처리, 그리고 중첩 표면의 **Concentric Radius**를 다룬다 [src:51].

### manner-temp

사용자의 매너온도를 시각화해 신뢰도를 직관적으로 보여준다 [src:52]. Manner Temp는 프로필이나 게시글 상세처럼 매너온도가 중요한 자리에서 강조용으로 쓰고, Manner Temp Badge는 공간이 제한적이거나 다른 요약 정보와 함께 놓일 때 쓴다 [src:52]. 온도는 구간에 따라 10단계 레벨로 표시되고 레벨마다 텍스트 색과 그래픽이 달라지며, `temperature`가 받은 숫자에서 레벨과 시각 스타일이 자동 계산된다 [src:52]. 색은 `{colors.manner-temp-l1-bg}`~`{colors.manner-temp-l10-text}` 20개 토큰이 담당한다 [src:7].

### menu

사용자가 취할 수 있는 선택지나 액션 목록을 제공한다 [src:53]. Container · Menu Group · Menu Group Label · Menu Item · Divider로 구성되며, **Divider는 Menu Group 사이에만 표시하고 Menu Item 사이에는 쓰지 않는다** [src:53]. Placement와 Smart Positioning, Elevation을 속성으로 다룬다 [src:53].

### menu-sheet

작업과 관련된 선택지를 시트 형태로 제공한다 [src:54]. Backdrop · Header · Menu Group · Close Button의 조합이며 Menu Item에 Tone을 부여할 수 있다 [src:54]. Critical Tone의 사용과 Header·Item Description의 사용 조건이 규정돼 있다 [src:54].

### notification-badge

새로운 알림이나 읽지 않은 메시지 수를 나타낸다 [src:55]. Large Size와 Small Size 두 가지로 구성되며, Large Size는 숫자를 표기하는 Label과 이를 감싸는 Container로 이뤄진다 [src:55]. 위치·동작·라벨 표시 규칙과 함께 **남용하지 말 것**이 명시돼 있다 [src:55]. Bottom Navigation의 탭, Segmented Control의 세그먼트, Tabs의 탭 아이템에 얹어 쓴다 [src:35][src:63][src:72].

### page-banner

페이지 상단에서 전체 상태나 중요 메시지를 전달하는 상위 레벨 메시지 컴포넌트다 [src:56]. 메시지 텍스트 컨테이너에 Prefix Icon · Title · Link Text · Chevron · Dismiss 버튼을 선택적으로 얹는다 [src:56]. 문서는 Page Banner와 Callout을 명시적으로 비교하며 층위를 나눈다 [src:56].

### progress-circle

작업 진행 중임을 알리거나 작업 시간을 시각적으로 나타낸다 [src:57]. Circle track과 Progress Indicator로 구성되고 Behavior · Size · Tone · Overlay 표시를 속성으로 가진다 [src:57]. 이후 나타날 요소의 윤곽을 미리 보여줘야 하는 상황이라면 Skeleton 쪽이다 [src:68].

### quantity-picker

버튼으로 수치를 한 단계씩 늘리거나 줄이는 입력이다 [src:58]. Increment Button · Decrement Button · Value Display로 구성된다 [src:58]. Removable 옵션을 켜면 **입력값이 최소값에 도달했을 때 Decrement 버튼이 Remove 버튼으로 교체된다** [src:58]. 터치 영역을 별도로 규정한다 [src:58].

### radio

여러 옵션 중 하나만 고르게 할 때 쓴다 [src:59]. Radiomark와 Label로 구성되고 Radiomark는 개별 컴포넌트로도 제공된다 [src:59]. **가로로 나열하지 않고** 기본 선택을 제공하며, 옵션 개수에 따라 다른 컴포넌트를 고려한다 [src:59].

### reaction-button

콘텐츠에 대한 반응을 표현하게 해주는 버튼으로, 좋아요·관심있어요 같은 감정적 피드백을 간편하게 제공한다 [src:60].

### result-section

로딩 결과나 액션 완료 여부처럼 결과를 알리는 템플릿이다 [src:61]. Asset과 Title을 중심으로 Description과 Button을 선택적으로 조합하며, 모든 구성 요소가 선택적이다 [src:61]. Success/Complete · Error/Failure · Empty/First-time use 세 상황을 나눠 다루고, 실패 시에는 화면 맥락에 맞는 액션을 제공한다 [src:61].

### scroll-fog

스크롤 가능한 영역에서 추가 콘텐츠가 있음을 알리는 시각 힌트다 [src:62]. Placement와 Layer를 속성으로 가지며, 적절한 크기 산정과 Padding과의 관계를 문서가 다룬다 [src:62].

### segmented-control

여러 옵션 중 하나를 골라 관련 콘텐츠를 즉시 필터링하거나 전환한다 [src:63]. Container 안에 Segment들이 놓이고 각 Segment는 Label을 포함하며, 새 내용이 있을 때 Notification Badge를 얹을 수 있다 [src:63]. **4개 이하로 쓰고 한 화면에 하나 이상 두지 않는다** [src:63].

### select

옵션 목록에서 값을 골라 Form에 제출할 때 쓴다 [src:64]. Trigger와 Content로 나뉘고 Content 안에 Item이, 관련 Item은 Group으로 묶이며 Group 사이에만 Divider가 표시된다 [src:64]. **Content 너비는 Trigger에 맞춰진다** [src:64]. 단일 선택에서 "없음"을 답으로 받는 방법, 다중 선택 시 선택값 표시, 옵션 순서 정하기가 규정돼 있다 [src:64].

### select-box

명확한 테두리를 가진 컨테이너로 정의된 목록 중 하나 이상을 선택하는 요소다 [src:65]. Container · Prefix · Title · Description · Control · Custom Content로 구성된다 [src:65]. Multiple Columns 높이 규칙, 최대 선택 개수 안내와 도달 시 피드백 원칙을 다루며, Chip과의 차이를 명시적으로 비교한다 [src:65].

### side-navigation

서비스 최상위 메뉴 간 이동을 돕고 앱 전체 구조를 탐색하게 한다 [src:66]. Header · Trigger · Content · Footer로 구성되고 Content 안에 Group · Menu Item · Menu Sub Item 2단계가 놓인다 [src:66]. Collapsed State와 Responsive Design을 다루며, 사이드바는 md(768px) 이상에서 기본 노출되고 그 미만에서는 Header 메뉴로 통합된다 [src:12].

### side-panel

측면에서 슬라이드되어 나타나 맥락을 유지한 채 상세 정보를 확인하거나 부수 작업을 수행하는 레이아웃 컴포넌트다 [src:67]. Header · Body · Footer와 Backdrop으로 구성되며 **Type에 따라 배경 상호작용을 차단하거나 허용한다** [src:67]. 모바일에서의 사용과 Responsive Side Panel을 따로 규정한다 [src:67].

### skeleton

콘텐츠 로딩 동안 이후 나타날 요소의 윤곽을 미리 보여줘 대기 시간을 짧게 느끼게 한다 [src:68]. background와 Corner radius로 구성되며 로딩 시작 시 shimmer 애니메이션이 나타난다 [src:68]. Progress Circle과의 선택 기준을 문서가 비교한다 [src:68]. 로딩 상황 전반의 조합 규칙은 별도 패턴 문서가 다룬다 [src:23].

### slider

지정된 범위에서 하나 또는 두 개의 값을 골라 입력한다 [src:69]. Track(Active · Inactive) · Handle · Steps · Marker로 구성된다 [src:69]. Drag와 Tap jump 두 조작을 지원하고, 현재 값을 명확히 표시하되 Value Indicator가 넘치지 않게 한다 [src:69].

### snackbar

화면 하단에 일시적으로 나타나 상태나 결과를 안내한다 [src:70]. 텍스트와 컨테이너로 구성되며 Prefix Icon과 Action을 선택적으로 표시한다 [src:70]. 위치·레이아웃과 동작이 규정돼 있고 Floating Action Button과의 위치 관계를 함께 본다 [src:70][src:45].

### switch

설정이나 상태를 즉시 켜고 끈다 [src:71]. Switch Mark와 Label로 구성되고 Switch Mark는 Thumb과 Track으로 이뤄진다 [src:71]. **독립적인 기능에서만 쓰고** 상태가 즉시 활성화될 때 쓰며, Checkbox와의 차이를 문서가 비교한다 [src:71].

### tabs

한 화면 안에서 콘텐츠를 탭 단위로 구분해 전환한다 [src:72]. Label을 가진 Tab Item의 모음이며 필요 시 Notification Badge를 얹는다 [src:72]. Line 스타일에서 Fill과 Hug 레이아웃을 나눠 쓰고 2 Depth 구조까지 다룬다 [src:72].

### tag-group

아이콘과 텍스트 태그를 수평으로 나열해 여러 속성·상태·메타데이터를 한눈에 보여주는 정보 요약 컴포넌트다 [src:73]. Tag와 이를 구분하는 Separator로 구성된다 [src:73]. 우선순위 설정과 줄바꿈 처리를 규정한다 [src:73].

### text-input

사용자로부터 텍스트를 입력받는다 [src:74]. Textarea를 같은 문서에서 함께 다루며 Custom Input과 2열 구성을 별도로 규정한다 [src:74]. 레이블·도움말·오류 표기는 Field가 감싸서 제공한다 [src:44].

### top-navigation

화면 상단에서 탐색 인터페이스를 제공한다 [src:75]. **Root 타입과 Standard 타입 두 가지로 나뉘고 각각 별도의 구현체와 Figma 컴포넌트로 제공된다** [src:75]. Title Type · Left Slot · Right Slot · Notification Badge를 속성으로 가지며, 뒤로가기를 **History Back과 Hierarchy Back 두 동작으로 구분**해 다룬다 [src:75].

## Do's and Don'ts

**Do** 색은 팔레트가 아니라 역할로 호출한다. 브랜드 CTA는 `{colors.bg-brand-solid}`와 `{colors.fg-neutral-inverted}`의 관계로 읽고, 상태 피드백은 `{colors.fg-positive}`·`{colors.fg-critical}`·`{colors.fg-informative}`처럼 기능색 역할로 분리한다 [src:4].

**Do** 테마 전환은 역할 토큰이 아니라 팔레트를 뒤집어 구현한다. 역할 별칭은 대체로 두 테마에서 같은 램프 단계를 가리키므로, 다크 모드 대응은 별칭을 바꾸는 게 아니라 팔레트 값을 교체하는 일이다 [src:7].

**Do** 뒤집히면 안 되는 표면에는 `static-*` 계열을 쓴다. 스크림·오버레이처럼 배경과 함께 반전되면 의미가 깨지는 자리를 위해 두 테마 동일 값으로 고정된 계열이다 [src:7].

**Do** 깊이는 색으로 먼저 해결한다. `bg-layer-basement` → `bg-layer-default` → `bg-layer-fill` → `bg-layer-floating` 순의 표면 층위를 쓰고, shadow는 주목도가 가장 높은 소수 요소에만 얹는다 [src:11].

**Do** 서체는 시스템 폰트 스택을 그대로 쓴다. 특정 서체를 지정하는 것이 아니라 디바이스 기본값에 기대는 것이 이 시스템의 선택이다 [src:8].

**Do** 대비는 APCA로 잰다. 가독성 텍스트는 Lc 75를 하한으로 두고 Lc 90 이상을 겨냥하며, 상태를 색 하나로만 알리지 않고 텍스트나 아이콘을 함께 붙인다 [src:18].

**Do** 문구는 익숙한 단어로 쓰고 한자어와 기술 용어를 피한다. 오류 메시지는 무엇이 잘못됐는지만 알리지 말고 사용자가 직접 취할 수 있는 해결 방법을 함께 준다 [src:20]. 이 톤은 "사용자의 행동을 이끌어 목적 달성을 돕고, 언어·문화와 무관하게 누구나 쉽게 쓸 수 있게 한다"는 보이스 원칙에서 나온다 [src:21].

**Don't** 브랜드 색을 넓게 칠하지 않는다. Action Button과 Badge 문서가 모두 "Brand 컬러는 꼭 필요한 곳에만 사용하기"를 별도 지침으로 두고 있다 [src:30][src:34].

**Don't** 임의의 elevation 수치를 지어내지 않는다. `{shadow.s1}`~`{shadow.s3}` 세 단계가 오프셋·블러·색까지 정의돼 있고, 다크 모드 알파가 라이트와 크게 다르므로 한 벌만 쓰면 어두운 배경에서 층이 사라진다 [src:7].

**Don't** Badge를 클릭 가능한 요소로 쓰지 않고, Divider를 마지막 항목 뒤에 넣지 않으며, Menu Item 사이에 Divider를 두지 않는다 — 셋 다 공식 문서가 명시한 금지다 [src:34][src:43][src:53].

**Don't** (도메인 경계) 당근의 **제품 개념**을 가져다 쓰지 않는다. 매너온도, 동네 기반 중고거래, 동네생활, 비즈프로필, 당근알바 같은 것은 당근이라는 서비스의 기능이지 시각 언어가 아니다. 신뢰 지표가 필요하면 그 서비스 자신의 지표를 정의하고, 매너온도의 **색 램프 구조**(낮음→중립, 높음→따뜻함)만 시각적 참고로 빌린다. 온도라는 은유와 "매너온도"라는 이름까지 옮기면 당근 서비스를 흉내 내는 것이 된다.

**Don't** (벤더 중립성) 이 시스템의 이름과 식별자를 소비자 UI에 노출하지 않는다. `SEED`·`SEED Design`이라는 이름, `@seed-design/css`·`@seed-design/react`·`@seed-design/stackflow` 같은 패키지명, `seed-` 클래스 접두사가 생성물의 화면 문구·제목·라벨·클래스명에 나타나서는 안 된다. 빌리는 것은 시각 언어이지 시스템의 이름이 아니다.

## Responsive Behavior

레이아웃은 목적에 따라 두 유형으로 갈린다 — 판매자 센터·광고주 센터처럼 복잡한 데이터를 다루는 **Dashboard Layout**과, 정보 전달이 목적인 서비스 페이지용 **Contents Layout**이다 [src:12]. Dashboard Layout은 화면 복잡도에 따라 Low · Middle(base) · High 세 밀도로 나뉜다 [src:12].

Contents Layout의 max-width는 몰입감을 위해 기본 **1040px**을 권장하고, 커머스 검색 결과처럼 넓은 탐색이 필요하면 **1280px**까지 확장한다 [src:12].

### Breakpoints (공식)

| Breakpoint | Viewport | Gutters | Margins |
| --- | --- | --- | --- |
| `base` | 0 – 479px | 16px | 12px |
| `sm` | 480 – 767px | 16px | 12px |
| `md` | 768 – 1279px | 32px | 24px |
| `lg` | 1280 – 1439px | 32px | 24px |
| `xl` | 1440px + | 32px | 24px |

사이드바는 `md`(768px) 이상에서 기본 노출되고, 768px 미만에서는 Header 안의 메뉴로 통합된다 [src:12]. Dashboard 레이아웃의 컬럼 간격은 24px, 콘텐츠와 화면 끝 사이 여백은 32px을 기본으로 유지한다 [src:12].

## Motion

모션은 규모로 나뉜다. 페이지 전환·모달 팝업·슬라이드 메뉴 같은 **매크로 모션**은 0.2초를 초과하고, 버튼 클릭·입력창 포커스·스크롤 같은 **마이크로 모션**은 0.2초 이하다 [src:13]. duration 사다리와 timing function은 이 구분에 맞춰 쓴다 — `easing`은 기능적인 마이크로 모션에, `enter`는 등장에 쓴다 [src:13].

```yaml
duration-d1: 50ms
duration-d2: 100ms
duration-d3: 150ms
duration-d4: 200ms
duration-d5: 250ms
duration-d6: 300ms
duration-color-transition: $duration.d3
duration-pressed-scale: $duration.d3

easing-linear: cubic-bezier(0, 0, 1, 1)
easing-easing: cubic-bezier(0.35, 0, 0.35, 1)
easing-enter: cubic-bezier(0, 0, 0.15, 1)
easing-exit: cubic-bezier(0.35, 0, 1, 1)
easing-enter-expressive: cubic-bezier(0.03, 0.4, 0.1, 1)
easing-exit-expressive: cubic-bezier(0.35, 0, 0.95, 0.55)
easing-pressed-scale: cubic-bezier(0, 0, 0.15, 1)

s95: 0.95
s97: 0.97
s98: 0.98
```

`scale` 축은 `s95`·`s97`·`s98` 세 값을 가지며, **라이트에서 각각 0.95·0.97·0.98이고 다크에서는 셋 다 1이다** [src:7]. 즉 이 배율은 라이트 모드에서만 걸린다. 어떤 상호작용에 쓰라는 용도 서술은 공식이 텍스트로 발행하지 않아 이 문서도 값만 싣는다.

## Known Gaps

- **철회된 부재 주장 3건 (2026-08-05)** — 종전 판본은 (a) "shadow의 구체적 수치는 텍스트 출처에 없다", (b) "정량 토큰 값은 텍스트 출처만으로 대조가 불가능하다", (c) "static alpha 계열은 공개 출처 어디에서도 확인되지 않는다"를 각각 적어 두었다. **셋 다 지금은 거짓이다** — `/foundations/design-token/reference`가 11개 축 319행을 light/dark 병기 표로 발행하고, 그 안에 `$shadow.s1~s3`과 `$color.palette.static-black-alpha-*`·`static-white-alpha-*`가 모두 들어 있다 [src:7]. 부재를 주장하기 전에 색인을 끝까지 확인할 것.
- **Deprecated 9건은 본문에서 제외했다** — **Action Chip** · **Action Sheet** · **Control Chip** · **Error State** · **Extended Action Sheet** · **Extended FAB** · **FAB** · **Inline Banner** · **Link Content**. 카탈로그 색인이 Deprecated로 표시하므로 `### ` 섹션으로 싣지 않았다 [src:22]. 이 이름들을 새 UI에 복사하지 말 것이며, 마이그레이션 대상을 찾는 경우에만 공식 문서를 참고한다.
- 시맨틱 텍스트 스타일(`screenTitle`·`articleBody` 등)의 개별 크기·두께 조합은 공식이 개념만 서술하고 전체 목록을 텍스트로 발행하지 않아, 이 문서는 스케일 사다리(`t1`~`t14`)와 두께 3종까지만 싣는다 [src:8].
- 아이콘 라이브러리의 개별 아이콘 목록과 그리드 규격은 이미지로만 제공돼 텍스트 대조가 불가능하다 [src:15][src:16].
- `scale` 축(`s95`·`s97`·`s98`)은 레퍼런스 표에만 존재하고 이를 설명하는 파운데이션 문서가 없다 [src:7]. 값의 모양(라이트 0.95~0.98, 다크 1)은 눌림 피드백을 시사하지만 공식 서술이 없어 용도를 단정하지 않았다.
- Purple 계열은 공식 팔레트에 포함되지만 구체적 사용처가 확인된 brand role로 채택된 자리가 없어, 이 문서도 램프만 싣고 역할을 부여하지 않았다 [src:7].
- **로고 사용 규칙 출처는 여전히 없다** — 종전 판본이 인용하던 `/llms/docs/foundation/logo.txt`가 제거된 뒤 현행 색인에도 logo·brand 페이지가 없다 [src:1]. Signature/Symbol/App Icon 3분류와 clear space 규칙은 재확인이 불가능해 철회 상태를 유지한다. 브랜딩 아티클 [src:26]은 **SEED 자체 로고**를 다루므로 당근 로고 자산의 운용 규칙까지 담지 않는다.
- Breeze Utilities · Lynx · AI Integration 섹션은 이 문서의 범위 밖이다 [src:1]. React 라이브러리도 API 레퍼런스 전체가 아니라 Action Button의 `flexGrow` 같은 구현 제약만 인용했다 [src:24][src:25].

## References

1. https://seed-design.io/llms.txt — SEED 문서 전체의 LLM 진입점. 섹션 구성과 `/llms/{section}/{path}.txt` 접근 규약을 정의한다.
2. https://seed-design.io/get-started/llms.txt — SEED의 정체성과 시스템 구성 개요.
3. https://seed-design.io/llms/foundations/color.txt — 색상 시스템 개요 — 접근성·계층·상태·브랜드 표현 원칙.
4. https://seed-design.io/llms/foundations/color/color-role.txt — 역할 기반 색상(bg·fg·stroke)의 정의와 사용 규칙.
5. https://seed-design.io/llms/foundations/color/palette.txt — 팔레트 램프 정의. 하단 `## Tokens` 표에 light/dark hex가 실려 있다.
6. https://seed-design.io/llms/foundations/design-token.txt — 디자인 토큰의 개념과 계층 구조.
7. https://seed-design.io/llms/foundations/design-token/reference.txt — 전체 토큰 목록. 11개 축의 값을 light/dark 병기 마크다운 표로 발행한다 — 이 문서의 정량값 출처.
8. https://seed-design.io/llms/foundations/typography.txt — 타이포그래피 원칙과 스케일 구성.
9. https://seed-design.io/llms/foundations/spacing.txt — 간격 토큰 체계.
10. https://seed-design.io/llms/foundations/radius.txt — 모서리 둥글기 토큰 체계.
11. https://seed-design.io/llms/foundations/elevation.txt — 깊이 표현 원칙 — Surface color·Shadow·Stroke 세 수단과 다크 모드 한계.
12. https://seed-design.io/llms/foundations/layout.txt — 그리드와 중단점(Breakpoint) 체계.
13. https://seed-design.io/llms/foundations/motion.txt — 모션 원칙과 duration·easing 사용 지침.
14. https://seed-design.io/llms/foundations/gradient.txt — 그라디언트 토큰 — 입체감과 AI 기능 표현.
15. https://seed-design.io/llms/foundations/iconography.txt — 아이콘 체계 개요.
16. https://seed-design.io/llms/foundations/iconography/usage.txt — 아이콘과 다른 요소 간 상호작용 및 사용 방법.
17. https://seed-design.io/llms/foundations/state.txt — 컴포넌트 상태 표현 규칙.
18. https://seed-design.io/llms/foundations/inclusive-design.txt — 접근성과 포용적 설계 지침.
19. https://seed-design.io/llms/foundations/international-design.txt — 다국가 대응 설계 지침.
20. https://seed-design.io/llms/foundations/writing.txt — 글쓰기 원칙.
21. https://seed-design.io/llms/foundations/voice-and-tone.txt — 보이스·톤 원칙.
22. https://seed-design.io/components/llms.txt — 컴포넌트 카탈로그 색인. 각 컴포넌트의 한 줄 설명과 Deprecated 표기를 담는다.
23. https://seed-design.io/llms/patterns/loading.txt — 로딩 패턴 가이드.
24. https://seed-design.io/react/llms.txt — React 라이브러리 문서 진입점 — 설치·스타일링·API·마이그레이션.
25. https://seed-design.io/llms/react/components/action-button.txt — Action Button의 React API 레퍼런스.
26. https://seed-design.io/updates/why-design-system-needs-branding — SEED 자체 브랜딩 기록 — 주황과 라임의 역할 분담을 설명한다.
27. https://github.com/daangn/seed-design — 공식 저장소. 패키지 구성과 토큰 소스.
28. https://www.daangn.com/kr/ — 당근 공식 웹사이트 — 로고 자산의 기준.
29. https://seed-design.io/llms/components/accordion.txt — Accordion 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
30. https://seed-design.io/llms/components/action-button.txt — Action Button 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
31. https://seed-design.io/llms/components/alert-dialog.txt — Alert Dialog 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
32. https://seed-design.io/llms/components/attachment-input.txt — Attachment Input 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
33. https://seed-design.io/llms/components/avatar.txt — Avatar 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
34. https://seed-design.io/llms/components/badge.txt — Badge 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
35. https://seed-design.io/llms/components/bottom-navigation.txt — Bottom Navigation 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
36. https://seed-design.io/llms/components/bottom-sheet.txt — Bottom Sheet 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
37. https://seed-design.io/llms/components/callout.txt — Callout 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
38. https://seed-design.io/llms/components/checkbox.txt — Checkbox 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
39. https://seed-design.io/llms/components/chip.txt — Chip 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
40. https://seed-design.io/llms/components/content-placeholder.txt — Content Placeholder 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
41. https://seed-design.io/llms/components/contextual-floating-button.txt — Contextual Floating Button 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
42. https://seed-design.io/llms/components/dialog.txt — Dialog 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
43. https://seed-design.io/llms/components/divider.txt — Divider 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
44. https://seed-design.io/llms/components/field.txt — Field 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
45. https://seed-design.io/llms/components/floating-action-button.txt — Floating Action Button 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
46. https://seed-design.io/llms/components/footer.txt — Footer 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
47. https://seed-design.io/llms/components/help-bubble.txt — Help Bubble 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
48. https://seed-design.io/llms/components/identity-placeholder.txt — Identity Placeholder 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
49. https://seed-design.io/llms/components/image-frame.txt — Image Frame 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
50. https://seed-design.io/llms/components/input-button.txt — Input Button 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
51. https://seed-design.io/llms/components/list.txt — List 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
52. https://seed-design.io/llms/components/manner-temp.txt — Manner Temp & Manner Temp Badge 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
53. https://seed-design.io/llms/components/menu.txt — Menu 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
54. https://seed-design.io/llms/components/menu-sheet.txt — Menu Sheet 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
55. https://seed-design.io/llms/components/notification-badge.txt — Notification Badge 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
56. https://seed-design.io/llms/components/page-banner.txt — Page Banner 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
57. https://seed-design.io/llms/components/progress-circle.txt — Progress Circle 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
58. https://seed-design.io/llms/components/quantity-picker.txt — Quantity Picker 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
59. https://seed-design.io/llms/components/radio.txt — Radio 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
60. https://seed-design.io/llms/components/reaction-button.txt — Reaction Button 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
61. https://seed-design.io/llms/components/result-section.txt — Result Section 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
62. https://seed-design.io/llms/components/scroll-fog.txt — Scroll Fog 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
63. https://seed-design.io/llms/components/segmented-control.txt — Segmented Control 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
64. https://seed-design.io/llms/components/select.txt — Select 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
65. https://seed-design.io/llms/components/select-box.txt — Select Box 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
66. https://seed-design.io/llms/components/side-navigation.txt — Side Navigation 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
67. https://seed-design.io/llms/components/side-panel.txt — Side Panel 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
68. https://seed-design.io/llms/components/skeleton.txt — Skeleton 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
69. https://seed-design.io/llms/components/slider.txt — Slider 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
70. https://seed-design.io/llms/components/snackbar.txt — Snackbar 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
71. https://seed-design.io/llms/components/switch.txt — Switch 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
72. https://seed-design.io/llms/components/tabs.txt — Tabs 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
73. https://seed-design.io/llms/components/tag-group.txt — Tag Group 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
74. https://seed-design.io/llms/components/text-input.txt — Text Input & Textarea 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
75. https://seed-design.io/llms/components/top-navigation.txt — Top Navigation 컴포넌트 스펙 — Anatomy·Properties·Guidelines.
