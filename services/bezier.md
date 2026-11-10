---
name: 채널톡
design_system_name: Bezier Design System
slug: bezier
category: developer
last_updated: "2026-11-11"
created_at: "2026-06-03"
lang: ko
logo: https://getdesign.kr/logos/bezier.png
colors:
  ## Accent global hues
  # Blue — 제품 1차 액션 (indigo-violet, primary)
  blue-300: oklch(0.665 0.181 280)   # 상류 beta --color-blue-300
  blue-400: oklch(0.554 0.214 280)   # primary · 상류 beta --color-blue-400
  blue-500: oklch(0.483 0.229 280)   # 상류 beta --color-blue-500
  # Green — 성공 / 폼 선택 상태 (체크박스·라디오·스위치·슬라이더)
  green-300: oklch(0.732 0.157 150)   # 상류 beta --color-green-300
  green-400: oklch(0.652 0.168 150)   # 상류 beta --color-green-400
  green-500: oklch(0.562 0.100 160)   # 상류 beta --color-green-500
  # Red — 에러 / 위험
  red-300: oklch(0.690 0.172 23)   # 상류 beta --color-red-300
  red-400: oklch(0.634 0.177 20)   # 상류 beta --color-red-400
  red-500: oklch(0.541 0.166 21)   # 상류 beta --color-red-500
  # Orange — 경고 (인풋 invalid box-shadow)
  orange-300: oklch(0.764 0.148 58)   # 상류 beta --color-orange-300
  orange-400: oklch(0.698 0.156 55)   # 상류 beta --color-orange-400
  orange-500: oklch(0.600 0.146 54)   # 상류 beta --color-orange-500
  # Cobalt — 정보 강조 (highlight)
  cobalt-300: oklch(0.724 0.125 245)   # 상류 beta --color-cobalt-300
  cobalt-400: oklch(0.643 0.150 248)   # 상류 beta --color-cobalt-400
  cobalt-500: oklch(0.570 0.156 257)   # 상류 beta --color-cobalt-500
  # 단일 코어 액센트 (주로 400; tag·상태 칩용 300 일부)
  purple-300: oklch(0.670 0.205 299)   # #a970ff · 상류 beta --color-purple-300
  purple-400: oklch(0.591 0.208 297)   # 상류 beta --color-purple-400
  pink-300: oklch(0.722 0.192 336)   # #ec6fd3
  pink-400: oklch(0.637 0.208 339)   # 상류 beta --color-pink-400
  navy-300: oklch(0.649 0.102 276)   # #7e89cd · 상류 beta --color-navy-300
  navy-400: oklch(0.469 0.147 273)   # 상류 beta --color-navy-400
  yellow-300: oklch(0.824 0.160 88)   # 상류 beta --color-yellow-300
  yellow-400: oklch(0.789 0.161 82)   # 상류 beta --color-yellow-400
  olive-300: oklch(0.784 0.167 115)   # 상류 beta --color-olive-300
  olive-400: oklch(0.730 0.160 113)   # 상류 beta --color-olive-400
  teal-300: oklch(0.787 0.123 186)   # #40d3c5 · 상류 beta --color-teal-300
  teal-400: oklch(0.690 0.118 191)   # 상류 beta --color-teal-400
  ## Accent alpha tints
  # 상류 beta 원시값 이름 그대로 [src:3] — 두 테마가 함께 쓰는 원시값이라 dark- 접두가 없다.
  # fill-accent-{hue} = 라이트 {hue}-400-10 · 다크 {hue}-300-18, -heavy = 라이트 {hue}-400-20 · 다크 {hue}-300-30.
  # 300-18/30 의 기준 RGB 는 blue·green·red·navy 에서 상류 불투명 300 과 다르다(예: blue #6b6eff 대 #8082ff — 상류에도 그 RGB 의 불투명 판은 없다).
  # {hue}-400-0·{hue}-300-0 은 완전 투명 단계(fill-*-transparent), blue-400-30·blue-300-45·orange-400-30 은 state-action-light·state-warning-light 가 가리킨다.
  blue-400-10: oklch(0.554 0.214 280 / 0.10)   # #6157ea1a · 상류 beta --color-blue-400-10
  blue-400-20: oklch(0.554 0.214 280 / 0.20)   # #6157ea33 · 상류 beta --color-blue-400-20
  blue-300-18: oklch(0.615 0.211 277 / 0.18)   # #6b6eff2e
  blue-300-30: oklch(0.615 0.211 277 / 0.30)   # #6b6eff4d · 상류 beta --color-blue-300-30
  blue-400-30: oklch(0.554 0.214 280 / 0.30)   # #6157ea4d · 상류 beta --color-blue-400-30
  blue-300-45: oklch(0.615 0.211 277 / 0.45)   # #6b6eff73
  blue-400-0: oklch(0.554 0.214 280 / 0)   # #6157ea00
  blue-300-0: oklch(0.615 0.211 277 / 0)   # #6b6eff00
  cobalt-400-10: oklch(0.643 0.150 248 / 0.10)   # #3292e31a · 상류 beta --color-cobalt-400-10
  cobalt-400-20: oklch(0.643 0.150 248 / 0.20)   # #3292e333 · 상류 beta --color-cobalt-400-20
  cobalt-300-18: oklch(0.724 0.125 245 / 0.18)   # #5cadef2e
  cobalt-300-30: oklch(0.724 0.125 245 / 0.30)   # #5cadef4d · 상류 beta --color-cobalt-300-30
  cobalt-400-0: oklch(0.643 0.150 248 / 0)   # #3292e300
  cobalt-300-0: oklch(0.724 0.125 245 / 0)   # #5cadef00
  green-400-10: oklch(0.652 0.168 150 / 0.10)   # #20ab551a · 상류 beta --color-green-400-10
  green-400-20: oklch(0.652 0.168 150 / 0.20)   # #20ab5533 · 상류 beta --color-green-400-20
  green-300-18: oklch(0.724 0.162 150 / 0.18)   # #4bc16c2e
  green-300-30: oklch(0.724 0.162 150 / 0.30)   # #4bc16c4d · 상류 beta --color-green-300-30
  green-400-0: oklch(0.652 0.168 150 / 0)   # #20ab5500
  green-300-0: oklch(0.724 0.162 150 / 0)   # #4bc16c00
  red-400-10: oklch(0.634 0.177 20 / 0.10)   # #e1535d1a · 상류 beta --color-red-400-10
  red-400-20: oklch(0.634 0.177 20 / 0.20)   # #e1535d33 · 상류 beta --color-red-400-20
  red-300-18: oklch(0.677 0.180 23 / 0.18)   # #f260602e
  red-300-30: oklch(0.677 0.180 23 / 0.30)   # #f260604d · 상류 beta --color-red-300-30
  red-400-0: oklch(0.634 0.177 20 / 0)   # #e1535d00
  red-300-0: oklch(0.677 0.180 23 / 0)   # #f2606000
  orange-400-10: oklch(0.698 0.156 55 / 0.10)   # #e67f2b1a · 상류 beta --color-orange-400-10
  orange-400-20: oklch(0.698 0.156 55 / 0.20)   # #e67f2b33 · 상류 beta --color-orange-400-20
  orange-300-18: oklch(0.764 0.148 58 / 0.18)   # #f798472e
  orange-300-30: oklch(0.764 0.148 58 / 0.30)   # #f798474d · 상류 beta --color-orange-300-30
  orange-400-30: oklch(0.698 0.156 55 / 0.30)   # #e67f2b4d · 상류 beta --color-orange-400-30
  orange-400-0: oklch(0.698 0.156 55 / 0)   # #e67f2b00
  orange-300-0: oklch(0.764 0.148 58 / 0)   # #f7984700
  yellow-400-10: oklch(0.789 0.161 82 / 0.10)   # #edae0d1a · 상류 beta --color-yellow-400-10
  yellow-400-20: oklch(0.789 0.161 82 / 0.20)   # #edae0d33 · 상류 beta --color-yellow-400-20
  yellow-300-18: oklch(0.824 0.160 88 / 0.18)   # #f0be272e
  yellow-300-30: oklch(0.824 0.160 88 / 0.30)   # #f0be274d · 상류 beta --color-yellow-300-30
  yellow-400-0: oklch(0.789 0.161 82 / 0)   # #edae0d00
  yellow-300-0: oklch(0.824 0.160 88 / 0)   # #f0be2700
  olive-400-10: oklch(0.730 0.160 113 / 0.10)   # #a9b1101a · 상류 beta --color-olive-400-10
  olive-400-20: oklch(0.730 0.160 113 / 0.20)   # #a9b11033 · 상류 beta --color-olive-400-20
  olive-300-18: oklch(0.784 0.167 115 / 0.18)   # #b7c4272e
  olive-300-30: oklch(0.784 0.167 115 / 0.30)   # #b7c4274d · 상류 beta --color-olive-300-30
  olive-400-0: oklch(0.730 0.160 113 / 0)   # #a9b11000
  olive-300-0: oklch(0.784 0.167 115 / 0)   # #b7c42700
  teal-400-10: oklch(0.690 0.118 190 / 0.10)   # #09b2ac1a · 상류 beta --color-teal-400-10
  teal-400-20: oklch(0.690 0.118 190 / 0.20)   # #09b2ac33 · 상류 beta --color-teal-400-20
  teal-300-18: oklch(0.787 0.123 186 / 0.18)   # #40d3c52e
  teal-300-30: oklch(0.787 0.123 186 / 0.30)   # #40d3c54d · 상류 beta --color-teal-300-30
  teal-400-0: oklch(0.690 0.118 190 / 0)   # #09b2ac00
  teal-300-0: oklch(0.787 0.123 186 / 0)   # #40d3c500
  navy-400-10: oklch(0.469 0.147 273 / 0.10)   # #424fab1a · 상류 beta --color-navy-400-10
  navy-400-20: oklch(0.469 0.147 273 / 0.20)   # #424fab33 · 상류 beta --color-navy-400-20
  navy-300-18: oklch(0.607 0.118 276 / 0.18)   # #6f7bc82e
  navy-300-30: oklch(0.607 0.118 276 / 0.30)   # #6f7bc84d · 상류 beta --color-navy-300-30
  navy-400-0: oklch(0.469 0.147 273 / 0)   # #424fab00
  navy-300-0: oklch(0.607 0.118 276 / 0)   # #6f7bc800
  purple-400-10: oklch(0.591 0.208 297 / 0.10)   # #8e57e71a · 상류 beta --color-purple-400-10
  purple-400-20: oklch(0.591 0.208 297 / 0.20)   # #8e57e733 · 상류 beta --color-purple-400-20
  purple-300-18: oklch(0.670 0.205 299 / 0.18)   # #a970ff2e
  purple-300-30: oklch(0.670 0.205 299 / 0.30)   # #a970ff4d · 상류 beta --color-purple-300-30
  purple-400-0: oklch(0.591 0.208 297 / 0)   # #8e57e700
  purple-300-0: oklch(0.670 0.205 299 / 0)   # #a970ff00
  pink-400-10: oklch(0.637 0.208 338 / 0.10)   # #d64bb51a · 상류 beta --color-pink-400-10
  pink-400-20: oklch(0.637 0.208 338 / 0.20)   # #d64bb533 · 상류 beta --color-pink-400-20
  pink-300-18: oklch(0.722 0.192 336 / 0.18)   # #ec6fd32e
  pink-300-30: oklch(0.722 0.192 336 / 0.30)   # #ec6fd34d
  pink-400-0: oklch(0.637 0.208 338 / 0)   # #d64bb500
  pink-300-0: oklch(0.722 0.192 336 / 0)   # #ec6fd300
  ## Neutral global
  grey-25: oklch(0.995 0.003 286)
  grey-50: oklch(0.988 0 286)   # 상류 beta --color-grey-50
  grey-100: oklch(0.976 0.001 286)
  grey-200: oklch(0.952 0.001 286)
  grey-300: oklch(0.913 0.003 286)
  grey-400: oklch(0.855 0.003 286)
  grey-500: oklch(0.729 0.004 286)
  grey-600: oklch(0.578 0.008 286)
  grey-650: oklch(0.469 0.008 286)   # #5a5a5f
  grey-700: oklch(0.354 0.007 286)   # 상류 beta --color-grey-700
  grey-750: oklch(0.315 0.007 286)   # #313135
  grey-800: oklch(0.283 0.007 286)   # 상류 beta --color-grey-800
  grey-850: oklch(0.261 0.004 286)   # 상류 beta --color-grey-850
  grey-900: oklch(0.232 0.006 286)   # 다크 표면 기본 (더 짙은 grey-950 은 다크 surface-low·border-detach-low 가 가리킨다) · 상류 beta --color-grey-900
  grey-950: oklch(0.219 0.004 286)   # #1a1a1c
  # grey 알파 단계 — beta 원시값.
  grey-100-90: oklch(0.976 0.001 286 / 0.90)   # #f7f7f8e6 · 라이트 surface-glass-higher
  grey-200-90: oklch(0.952 0.001 286 / 0.90)   # #efeff0e6
  grey-750-90: oklch(0.315 0.007 286 / 0.90)   # #313135e6
  grey-800-90: oklch(0.283 0.007 286 / 0.90)   # #29292de6 · 상류 beta --color-grey-800-90
  grey-850-90: oklch(0.261 0.004 286 / 0.90)   # #242426e6
  # 텍스트·보더·딤은 고정 grey가 아니라 alpha-black 위계로 쌓는다 (Bezier 시그니처)
  black-100: oklch(0 0 0)
  black-85: oklch(0 0 0 / 0.85)   # text-neutral (본문 기본)
  black-60: oklch(0 0 0 / 0.60)   # text-neutral-light
  black-40: oklch(0 0 0 / 0.40)   # text-neutral-lighter / icon-neutral
  black-30: oklch(0 0 0 / 0.30)   # #0000004d
  black-22: oklch(0 0 0 / 0.22)   # #00000038
  black-20: oklch(0 0 0 / 0.20)   # #00000033 · fill-absolute-black-light
  black-15: oklch(0 0 0 / 0.15)   # #00000026 · 라이트 fill-neutral-heavy
  black-8: oklch(0 0 0 / 0.08)   # border-neutral
  black-5: oklch(0 0 0 / 0.05)   # #0000000d · 라이트 fill-neutral-light
  black-3: oklch(0 0 0 / 0.03)   # #00000008 · 라이트 fill-neutral-lighter
  black-1: oklch(0 0 0 / 0.01)   # #00000003
  black-0: oklch(0 0 0 / 0)   # #00000000
  white-100: oklch(1 0 0)
  white-90: oklch(1 0 0 / 0.90)   # 라이트 surface-glass
  white-80: oklch(1 0 0 / 0.80)   # #ffffffcc · 다크 text-neutral / icon-neutral-heavier
  white-60: oklch(1 0 0 / 0.60)   # #ffffff99 · 다크 text-neutral-light
  white-40: oklch(1 0 0 / 0.40)   # #ffffff66 · 다크 text-neutral-lighter / fill-neutral-heavier
  white-20: oklch(1 0 0 / 0.20)   # #ffffff33 · 다크 fill-neutral-heavy
  white-12: oklch(1 0 0 / 0.12)   # 다크 표면 위 보더
  white-8: oklch(1 0 0 / 0.08)   # #ffffff14 · 다크 fill-neutral-light
  white-5: oklch(1 0 0 / 0.05)   # #ffffff0d · 다크 fill-neutral-lighter
  white-3: oklch(1 0 0 / 0.03)   # #ffffff08
  white-0: oklch(1 0 0 / 0)   # #ffffff00
  ## Stable tier palette
  # 기본 tier(dist/css) 원시값 — 기본 tier 색 역할(bg-*·txt-*·bgtxt-*·bdr-*·shdw-*)이 가리키는 단계만. 테마마다 다시 정의되지 않아 dark- 판이 없다 [src:3].
  stable-black-100: oklch(0 0 0)   # #000000 · 상류 기본 tier --black-100
  stable-black-85: oklch(0 0 0 / 0.85)   # #000000d9 · 상류 기본 tier --black-85
  stable-black-60: oklch(0 0 0 / 0.60)   # #00000099 · 상류 기본 tier --black-60
  stable-black-40: oklch(0 0 0 / 0.40)   # #00000066 · 상류 기본 tier --black-40
  stable-black-30: oklch(0 0 0 / 0.30)   # #0000004d · 상류 기본 tier --black-30
  stable-black-22: oklch(0 0 0 / 0.22)   # #00000038 · 상류 기본 tier --black-22
  stable-black-20: oklch(0 0 0 / 0.20)   # #00000033 · 상류 기본 tier --black-20
  stable-black-15: oklch(0 0 0 / 0.15)   # #00000026 · 상류 기본 tier --black-15
  stable-black-8: oklch(0 0 0 / 0.08)   # #00000014 · 상류 기본 tier --black-8
  stable-black-5: oklch(0 0 0 / 0.05)   # #0000000d · 상류 기본 tier --black-5
  stable-black-3: oklch(0 0 0 / 0.03)   # #00000008 · 상류 기본 tier --black-3
  stable-white-100: oklch(1 0 0)   # #ffffff · 상류 기본 tier --white-100
  stable-white-90: oklch(1 0 0 / 0.90)   # #ffffffe6 · 상류 기본 tier --white-90
  stable-white-80: oklch(1 0 0 / 0.80)   # #ffffffcc · 상류 기본 tier --white-80
  stable-white-60: oklch(1 0 0 / 0.60)   # #ffffff99 · 상류 기본 tier --white-60
  stable-white-40: oklch(1 0 0 / 0.40)   # #ffffff66 · 상류 기본 tier --white-40
  stable-white-20: oklch(1 0 0 / 0.20)   # #ffffff33 · 상류 기본 tier --white-20
  stable-white-12: oklch(1 0 0 / 0.12)   # #ffffff1f · 상류 기본 tier --white-12
  stable-white-8: oklch(1 0 0 / 0.08)   # #ffffff14 · 상류 기본 tier --white-8
  stable-white-5: oklch(1 0 0 / 0.05)   # #ffffff0d · 상류 기본 tier --white-5
  stable-grey-850-80: oklch(0.289 0.004 265 / 0.80)   # #2a2b2dcc · 상류 기본 tier --grey-850-80
  stable-grey-800-80: oklch(0.317 0.004 265 / 0.80)   # #313234cc · 상류 기본 tier --grey-800-80
  stable-grey-800-90: oklch(0.317 0.004 265 / 0.90)   # #313234e6 · 상류 기본 tier --grey-800-90
  stable-grey-700-80: oklch(0.397 0.002 248 / 0.80)   # #464748cc · 상류 기본 tier --grey-700-80
  stable-grey-200-80: oklch(0.952 0.001 286 / 0.80)   # #efeff0cc · 상류 기본 tier --grey-200-80
  stable-grey-100-80: oklch(0.976 0.001 286 / 0.80)   # #f7f7f8cc · 상류 기본 tier --grey-100-80
  stable-grey-100-90: oklch(0.976 0.001 286 / 0.90)   # #f7f7f8e6 · 상류 기본 tier --grey-100-90
  stable-grey-50-80: oklch(0.991 0 0 / 0.80)   # #fcfcfccc · 상류 기본 tier --grey-50-80
  stable-grey-900: oklch(0.262 0.007 286)   # #242428 · 상류 기본 tier --grey-900
  stable-grey-850: oklch(0.289 0.004 265)   # #2a2b2d · 상류 기본 tier --grey-850
  stable-grey-800: oklch(0.317 0.004 265)   # #313234 · 상류 기본 tier --grey-800
  stable-grey-700: oklch(0.397 0.002 248)   # #464748 · 상류 기본 tier --grey-700
  stable-grey-500: oklch(0.729 0.004 286)   # #a7a7aa · 상류 기본 tier --grey-500
  stable-grey-200: oklch(0.952 0.001 286)   # #efeff0 · 상류 기본 tier --grey-200
  stable-grey-100: oklch(0.976 0.001 286)   # #f7f7f8 · 상류 기본 tier --grey-100
  stable-grey-50: oklch(0.991 0 0)   # #fcfcfc · 상류 기본 tier --grey-50
  stable-navy-400-10: oklch(0.442 0.105 268 / 0.10)   # #3a4f8d1a · 상류 기본 tier --navy-400-10
  stable-navy-400-20: oklch(0.442 0.105 268 / 0.20)   # #3a4f8d33 · 상류 기본 tier --navy-400-20
  stable-navy-400-30: oklch(0.442 0.105 268 / 0.30)   # #3a4f8d4d · 상류 기본 tier --navy-400-30
  stable-navy-300-20: oklch(0.602 0.121 269 / 0.20)   # #647cc933 · 상류 기본 tier --navy-300-20
  stable-navy-300-30: oklch(0.602 0.121 269 / 0.30)   # #647cc94d · 상류 기본 tier --navy-300-30
  stable-navy-300-40: oklch(0.602 0.121 269 / 0.40)   # #647cc966 · 상류 기본 tier --navy-300-40
  stable-navy-500: oklch(0.365 0.054 270)   # #333d5b · 상류 기본 tier --navy-500
  stable-navy-400: oklch(0.442 0.105 268)   # #3a4f8d · 상류 기본 tier --navy-400
  stable-navy-300: oklch(0.602 0.121 269)   # #647cc9 · 상류 기본 tier --navy-300
  stable-purple-400-10: oklch(0.596 0.194 299 / 0.10)   # #915ce01a · 상류 기본 tier --purple-400-10
  stable-purple-400-20: oklch(0.596 0.194 299 / 0.20)   # #915ce033 · 상류 기본 tier --purple-400-20
  stable-purple-400-30: oklch(0.596 0.194 299 / 0.30)   # #915ce04d · 상류 기본 tier --purple-400-30
  stable-purple-300-20: oklch(0.682 0.208 304 / 0.20)   # #b570ff33 · 상류 기본 tier --purple-300-20
  stable-purple-300-30: oklch(0.682 0.208 304 / 0.30)   # #b570ff4d · 상류 기본 tier --purple-300-30
  stable-purple-300-40: oklch(0.682 0.208 304 / 0.40)   # #b570ff66 · 상류 기본 tier --purple-300-40
  stable-purple-500: oklch(0.450 0.207 301)   # #6b23b3 · 상류 기본 tier --purple-500
  stable-purple-400: oklch(0.596 0.194 299)   # #915ce0 · 상류 기본 tier --purple-400
  stable-purple-300: oklch(0.682 0.208 304)   # #b570ff · 상류 기본 tier --purple-300
  stable-pink-400-10: oklch(0.614 0.199 338 / 0.10)   # #cb48ad1a · 상류 기본 tier --pink-400-10
  stable-pink-400-20: oklch(0.614 0.199 338 / 0.20)   # #cb48ad33 · 상류 기본 tier --pink-400-20
  stable-pink-400-30: oklch(0.614 0.199 338 / 0.30)   # #cb48ad4d · 상류 기본 tier --pink-400-30
  stable-pink-300-20: oklch(0.722 0.192 336 / 0.20)   # #ec6fd333 · 상류 기본 tier --pink-300-20
  stable-pink-300-30: oklch(0.722 0.192 336 / 0.30)   # #ec6fd34d · 상류 기본 tier --pink-300-30
  stable-pink-300-40: oklch(0.722 0.192 336 / 0.40)   # #ec6fd366 · 상류 기본 tier --pink-300-40
  stable-pink-500: oklch(0.515 0.187 334)   # #a32e92 · 상류 기본 tier --pink-500
  stable-pink-400: oklch(0.614 0.199 338)   # #cb48ad · 상류 기본 tier --pink-400
  stable-pink-300: oklch(0.722 0.192 336)   # #ec6fd3 · 상류 기본 tier --pink-300
  stable-red-400-10: oklch(0.640 0.191 21 / 0.10)   # #e94e581a · 상류 기본 tier --red-400-10
  stable-red-400-20: oklch(0.640 0.191 21 / 0.20)   # #e94e5833 · 상류 기본 tier --red-400-20
  stable-red-400-30: oklch(0.640 0.191 21 / 0.30)   # #e94e584d · 상류 기본 tier --red-400-30
  stable-red-300-20: oklch(0.691 0.199 24 / 0.20)   # #ff5c5c33 · 상류 기본 tier --red-300-20
  stable-red-300-30: oklch(0.691 0.199 24 / 0.30)   # #ff5c5c4d · 상류 기본 tier --red-300-30
  stable-red-300-40: oklch(0.691 0.199 24 / 0.40)   # #ff5c5c66 · 상류 기본 tier --red-300-40
  stable-red-500: oklch(0.520 0.144 19)   # #ac3e46 · 상류 기본 tier --red-500
  stable-red-400: oklch(0.640 0.191 21)   # #e94e58 · 상류 기본 tier --red-400
  stable-red-300: oklch(0.691 0.199 24)   # #ff5c5c · 상류 기본 tier --red-300
  stable-orange-400-10: oklch(0.717 0.175 55 / 0.10)   # #f4800b1a · 상류 기본 tier --orange-400-10
  stable-orange-400-20: oklch(0.717 0.175 55 / 0.20)   # #f4800b33 · 상류 기본 tier --orange-400-20
  stable-orange-400-30: oklch(0.717 0.175 55 / 0.30)   # #f4800b4d · 상류 기본 tier --orange-400-30
  stable-orange-300-20: oklch(0.809 0.137 62 / 0.20)   # #ffab5c33 · 상류 기본 tier --orange-300-20
  stable-orange-300-30: oklch(0.809 0.137 62 / 0.30)   # #ffab5c4d · 상류 기본 tier --orange-300-30
  stable-orange-300-40: oklch(0.809 0.137 62 / 0.40)   # #ffab5c66 · 상류 기본 tier --orange-300-40
  stable-orange-500: oklch(0.635 0.139 62)   # #c57417 · 상류 기본 tier --orange-500
  stable-orange-400: oklch(0.717 0.175 55)   # #f4800b · 상류 기본 tier --orange-400
  stable-orange-300: oklch(0.809 0.137 62)   # #ffab5c · 상류 기본 tier --orange-300
  stable-yellow-400-10: oklch(0.818 0.146 86 / 0.10)   # #edbc401a · 상류 기본 tier --yellow-400-10
  stable-yellow-400-20: oklch(0.818 0.146 86 / 0.20)   # #edbc4033 · 상류 기본 tier --yellow-400-20
  stable-yellow-400-30: oklch(0.818 0.146 86 / 0.30)   # #edbc404d · 상류 기본 tier --yellow-400-30
  stable-yellow-300-20: oklch(0.880 0.150 91 / 0.20)   # #fdd35333 · 상류 기본 tier --yellow-300-20
  stable-yellow-300-30: oklch(0.880 0.150 91 / 0.30)   # #fdd3534d · 상류 기본 tier --yellow-300-30
  stable-yellow-300-40: oklch(0.880 0.150 91 / 0.40)   # #fdd35366 · 상류 기본 tier --yellow-300-40
  stable-yellow-500: oklch(0.715 0.126 89)   # #c39e37 · 상류 기본 tier --yellow-500
  stable-yellow-400: oklch(0.818 0.146 86)   # #edbc40 · 상류 기본 tier --yellow-400
  stable-yellow-300: oklch(0.880 0.150 91)   # #fdd353 · 상류 기본 tier --yellow-300
  stable-olive-400-10: oklch(0.698 0.124 112 / 0.10)   # #a0a5401a · 상류 기본 tier --olive-400-10
  stable-olive-400-20: oklch(0.698 0.124 112 / 0.20)   # #a0a54033 · 상류 기본 tier --olive-400-20
  stable-olive-400-30: oklch(0.698 0.124 112 / 0.30)   # #a0a5404d · 상류 기본 tier --olive-400-30
  stable-olive-300-20: oklch(0.839 0.161 114 / 0.20)   # #cad54833 · 상류 기본 tier --olive-300-20
  stable-olive-300-30: oklch(0.839 0.161 114 / 0.30)   # #cad5484d · 상류 기본 tier --olive-300-30
  stable-olive-300-40: oklch(0.839 0.161 114 / 0.40)   # #cad54866 · 상류 기본 tier --olive-300-40
  stable-olive-500: oklch(0.598 0.115 112)   # #818628 · 상류 기본 tier --olive-500
  stable-olive-400: oklch(0.698 0.124 112)   # #a0a540 · 상류 기본 tier --olive-400
  stable-olive-300: oklch(0.839 0.161 114)   # #cad548 · 상류 기본 tier --olive-300
  stable-green-400-10: oklch(0.639 0.158 149 / 0.10)   # #31a5521a · 상류 기본 tier --green-400-10
  stable-green-400-20: oklch(0.639 0.158 149 / 0.20)   # #31a55233 · 상류 기본 tier --green-400-20
  stable-green-400-30: oklch(0.639 0.158 149 / 0.30)   # #31a5524d · 상류 기본 tier --green-400-30
  stable-green-300-20: oklch(0.753 0.202 147 / 0.20)   # #3acf5a33 · 상류 기본 tier --green-300-20
  stable-green-300-30: oklch(0.753 0.202 147 / 0.30)   # #3acf5a4d · 상류 기본 tier --green-300-30
  stable-green-300-40: oklch(0.753 0.202 147 / 0.40)   # #3acf5a66 · 상류 기본 tier --green-300-40
  stable-green-500: oklch(0.587 0.125 148)   # #41904f · 상류 기본 tier --green-500
  stable-green-400: oklch(0.639 0.158 149)   # #31a552 · 상류 기본 tier --green-400
  stable-green-300: oklch(0.753 0.202 147)   # #3acf5a · 상류 기본 tier --green-300
  stable-teal-400-10: oklch(0.690 0.121 184 / 0.10)   # #0fb3a31a · 상류 기본 tier --teal-400-10
  stable-teal-400-20: oklch(0.690 0.121 184 / 0.20)   # #0fb3a333 · 상류 기본 tier --teal-400-20
  stable-teal-400-30: oklch(0.690 0.121 184 / 0.30)   # #0fb3a34d · 상류 기본 tier --teal-400-30
  stable-teal-300-20: oklch(0.813 0.131 185 / 0.20)   # #3cddcd33 · 상류 기본 tier --teal-300-20
  stable-teal-300-30: oklch(0.813 0.131 185 / 0.30)   # #3cddcd4d · 상류 기본 tier --teal-300-30
  stable-teal-300-40: oklch(0.813 0.131 185 / 0.40)   # #3cddcd66 · 상류 기본 tier --teal-300-40
  stable-teal-500: oklch(0.634 0.089 178)   # #449c8a · 상류 기본 tier --teal-500
  stable-teal-400: oklch(0.690 0.121 184)   # #0fb3a3 · 상류 기본 tier --teal-400
  stable-teal-300: oklch(0.813 0.131 185)   # #3cddcd · 상류 기본 tier --teal-300
  stable-cobalt-400-10: oklch(0.666 0.146 245 / 0.10)   # #329be71a · 상류 기본 tier --cobalt-400-10
  stable-cobalt-400-20: oklch(0.666 0.146 245 / 0.20)   # #329be733 · 상류 기본 tier --cobalt-400-20
  stable-cobalt-400-30: oklch(0.666 0.146 245 / 0.30)   # #329be74d · 상류 기본 tier --cobalt-400-30
  stable-cobalt-300-20: oklch(0.785 0.135 231 / 0.20)   # #47c8ff33 · 상류 기본 tier --cobalt-300-20
  stable-cobalt-300-30: oklch(0.785 0.135 231 / 0.30)   # #47c8ff4d · 상류 기본 tier --cobalt-300-30
  stable-cobalt-300-40: oklch(0.785 0.135 231 / 0.40)   # #47c8ff66 · 상류 기본 tier --cobalt-300-40
  stable-cobalt-500: oklch(0.564 0.120 248)   # #327ab8 · 상류 기본 tier --cobalt-500
  stable-cobalt-400: oklch(0.666 0.146 245)   # #329be7 · 상류 기본 tier --cobalt-400
  stable-cobalt-300: oklch(0.785 0.135 231)   # #47c8ff · 상류 기본 tier --cobalt-300
  stable-blue-400-10: oklch(0.555 0.223 279 / 0.10)   # #5e56f01a · 상류 기본 tier --blue-400-10
  stable-blue-400-20: oklch(0.555 0.223 279 / 0.20)   # #5e56f033 · 상류 기본 tier --blue-400-20
  stable-blue-400-30: oklch(0.555 0.223 279 / 0.30)   # #5e56f04d · 상류 기본 tier --blue-400-30
  stable-blue-300-20: oklch(0.658 0.181 269 / 0.20)   # #6687ff33 · 상류 기본 tier --blue-300-20
  stable-blue-300-30: oklch(0.658 0.181 269 / 0.30)   # #6687ff4d · 상류 기본 tier --blue-300-30
  stable-blue-300-40: oklch(0.658 0.181 269 / 0.40)   # #6687ff66 · 상류 기본 tier --blue-300-40
  stable-blue-500: oklch(0.476 0.203 280)   # #4e40c9 · 상류 기본 tier --blue-500
  stable-blue-400: oklch(0.555 0.223 279)   # #5e56f0 · 상류 기본 tier --blue-400
  stable-blue-300: oklch(0.658 0.181 269)   # #6687ff · 상류 기본 tier --blue-300
  ## Alpha tier palette
  # alpha tier(dist/alpha) 원시값. alpha tier 역할이 가리키는 단계만 싣는다. 테마마다 다시 정의되지 않아 dark- 판이 없다 [src:3].
  alpha-blue-300: oklch(0.714 0.140 268)   # #7d9efa, 상류 alpha tier --alpha-color-blue-300
  alpha-blue-400: oklch(0.607 0.211 279)   # #6d6afc, 상류 alpha tier --alpha-color-blue-400
  alpha-blue-500: oklch(0.525 0.206 279)   # #5950dc, 상류 alpha tier --alpha-color-blue-500
  alpha-blue-400-30: oklch(0.607 0.211 279 / 0.30)   # #6d6afc4d, 상류 alpha tier --alpha-color-blue-400-30
  alpha-blue-400-20: oklch(0.607 0.211 279 / 0.20)   # #6d6afc33, 상류 alpha tier --alpha-color-blue-400-20
  alpha-blue-400-10: oklch(0.607 0.211 279 / 0.10)   # #6d6afc1a, 상류 alpha tier --alpha-color-blue-400-10
  alpha-blue-400-0: oklch(0.607 0.211 279 / 0.00)   # #6d6afc00, 상류 alpha tier --alpha-color-blue-400-0
  alpha-blue-300-45: oklch(0.714 0.140 268 / 0.45)   # #7d9efa73, 상류 alpha tier --alpha-color-blue-300-45
  alpha-blue-300-30: oklch(0.714 0.140 268 / 0.30)   # #7d9efa4d, 상류 alpha tier --alpha-color-blue-300-30
  alpha-blue-300-15: oklch(0.714 0.140 268 / 0.15)   # #7d9efa26, 상류 alpha tier --alpha-color-blue-300-15
  alpha-blue-300-0: oklch(0.714 0.140 268 / 0.00)   # #7d9efa00, 상류 alpha tier --alpha-color-blue-300-0
  alpha-cobalt-300: oklch(0.762 0.113 245)   # #71b9f5, 상류 alpha tier --alpha-color-cobalt-300
  alpha-cobalt-400: oklch(0.657 0.141 255)   # #5093e5, 상류 alpha tier --alpha-color-cobalt-400
  alpha-cobalt-500: oklch(0.559 0.161 261)   # #3870d1, 상류 alpha tier --alpha-color-cobalt-500
  alpha-cobalt-400-30: oklch(0.657 0.141 255 / 0.30)   # #5093e54d, 상류 alpha tier --alpha-color-cobalt-400-30
  alpha-cobalt-400-20: oklch(0.657 0.141 255 / 0.20)   # #5093e533, 상류 alpha tier --alpha-color-cobalt-400-20
  alpha-cobalt-400-10: oklch(0.657 0.141 255 / 0.10)   # #5093e51a, 상류 alpha tier --alpha-color-cobalt-400-10
  alpha-cobalt-400-0: oklch(0.657 0.141 255 / 0.00)   # #5093e500, 상류 alpha tier --alpha-color-cobalt-400-0
  alpha-cobalt-300-45: oklch(0.762 0.113 245 / 0.45)   # #71b9f573, 상류 alpha tier --alpha-color-cobalt-300-45
  alpha-cobalt-300-30: oklch(0.762 0.113 245 / 0.30)   # #71b9f54d, 상류 alpha tier --alpha-color-cobalt-300-30
  alpha-cobalt-300-15: oklch(0.762 0.113 245 / 0.15)   # #71b9f526, 상류 alpha tier --alpha-color-cobalt-300-15
  alpha-cobalt-300-0: oklch(0.762 0.113 245 / 0.00)   # #71b9f500, 상류 alpha tier --alpha-color-cobalt-300-0
  alpha-green-300: oklch(0.765 0.145 149)   # #68cc7f, 상류 alpha tier --alpha-color-green-300
  alpha-green-400: oklch(0.668 0.144 152)   # #40ad67, 상류 alpha tier --alpha-color-green-400
  alpha-green-500: oklch(0.562 0.100 160)   # #358761, 상류 alpha tier --alpha-color-green-500
  alpha-green-400-30: oklch(0.668 0.144 152 / 0.30)   # #40ad674d, 상류 alpha tier --alpha-color-green-400-30
  alpha-green-400-20: oklch(0.668 0.144 152 / 0.20)   # #40ad6733, 상류 alpha tier --alpha-color-green-400-20
  alpha-green-400-10: oklch(0.668 0.144 152 / 0.10)   # #40ad671a, 상류 alpha tier --alpha-color-green-400-10
  alpha-green-400-0: oklch(0.668 0.144 152 / 0.00)   # #40ad6700, 상류 alpha tier --alpha-color-green-400-0
  alpha-green-300-45: oklch(0.765 0.145 149 / 0.45)   # #68cc7f73, 상류 alpha tier --alpha-color-green-300-45
  alpha-green-300-30: oklch(0.765 0.145 149 / 0.30)   # #68cc7f4d, 상류 alpha tier --alpha-color-green-300-30
  alpha-green-300-15: oklch(0.765 0.145 149 / 0.15)   # #68cc7f26, 상류 alpha tier --alpha-color-green-300-15
  alpha-green-300-0: oklch(0.765 0.145 149 / 0.00)   # #68cc7f00, 상류 alpha tier --alpha-color-green-300-0
  alpha-red-300: oklch(0.765 0.140 21)   # #ff8c8c, 상류 alpha tier --alpha-color-red-300
  alpha-red-400: oklch(0.651 0.171 23)   # #e55c5c, 상류 alpha tier --alpha-color-red-400
  alpha-red-500: oklch(0.541 0.166 21)   # #bc3a42, 상류 alpha tier --alpha-color-red-500
  alpha-red-400-30: oklch(0.651 0.171 23 / 0.30)   # #e55c5c4d, 상류 alpha tier --alpha-color-red-400-30
  alpha-red-400-20: oklch(0.651 0.171 23 / 0.20)   # #e55c5c33, 상류 alpha tier --alpha-color-red-400-20
  alpha-red-400-10: oklch(0.651 0.171 23 / 0.10)   # #e55c5c1a, 상류 alpha tier --alpha-color-red-400-10
  alpha-red-400-0: oklch(0.651 0.171 23 / 0.00)   # #e55c5c00, 상류 alpha tier --alpha-color-red-400-0
  alpha-red-300-45: oklch(0.765 0.140 21 / 0.45)   # #ff8c8c73, 상류 alpha tier --alpha-color-red-300-45
  alpha-red-300-30: oklch(0.765 0.140 21 / 0.30)   # #ff8c8c4d, 상류 alpha tier --alpha-color-red-300-30
  alpha-red-300-15: oklch(0.765 0.140 21 / 0.15)   # #ff8c8c26, 상류 alpha tier --alpha-color-red-300-15
  alpha-red-300-0: oklch(0.765 0.140 21 / 0.00)   # #ff8c8c00, 상류 alpha tier --alpha-color-red-300-0
  alpha-black-0: oklch(0 0 0 / 0.00)   # #00000000, 상류 alpha tier --alpha-color-black-0
  alpha-black-3: oklch(0 0 0 / 0.03)   # #00000008, 상류 alpha tier --alpha-color-black-3
  alpha-black-5: oklch(0 0 0 / 0.05)   # #0000000d, 상류 alpha tier --alpha-color-black-5
  alpha-black-8: oklch(0 0 0 / 0.08)   # #00000014, 상류 alpha tier --alpha-color-black-8
  alpha-black-15: oklch(0 0 0 / 0.15)   # #00000026, 상류 alpha tier --alpha-color-black-15
  alpha-black-20: oklch(0 0 0 / 0.20)   # #00000033, 상류 alpha tier --alpha-color-black-20
  alpha-black-22: oklch(0 0 0 / 0.22)   # #00000038, 상류 alpha tier --alpha-color-black-22
  alpha-black-30: oklch(0 0 0 / 0.30)   # #0000004d, 상류 alpha tier --alpha-color-black-30
  alpha-black-40: oklch(0 0 0 / 0.40)   # #00000066, 상류 alpha tier --alpha-color-black-40
  alpha-black-60: oklch(0 0 0 / 0.60)   # #00000099, 상류 alpha tier --alpha-color-black-60
  alpha-black-85: oklch(0 0 0 / 0.85)   # #000000d9, 상류 alpha tier --alpha-color-black-85
  alpha-black-100: oklch(0 0 0)   # #000000, 상류 alpha tier --alpha-color-black-100
  alpha-white-0: oklch(1 0 0 / 0.00)   # #ffffff00, 상류 alpha tier --alpha-color-white-0
  alpha-white-5: oklch(1 0 0 / 0.05)   # #ffffff0d, 상류 alpha tier --alpha-color-white-5
  alpha-white-8: oklch(1 0 0 / 0.08)   # #ffffff14, 상류 alpha tier --alpha-color-white-8
  alpha-white-12: oklch(1 0 0 / 0.12)   # #ffffff1f, 상류 alpha tier --alpha-color-white-12
  alpha-white-20: oklch(1 0 0 / 0.20)   # #ffffff33, 상류 alpha tier --alpha-color-white-20
  alpha-white-40: oklch(1 0 0 / 0.40)   # #ffffff66, 상류 alpha tier --alpha-color-white-40
  alpha-white-60: oklch(1 0 0 / 0.60)   # #ffffff99, 상류 alpha tier --alpha-color-white-60
  alpha-white-80: oklch(1 0 0 / 0.80)   # #ffffffcc, 상류 alpha tier --alpha-color-white-80
  alpha-white-90: oklch(1 0 0 / 0.90)   # #ffffffe6, 상류 alpha tier --alpha-color-white-90
  alpha-white-100: oklch(1 0 0)   # #ffffff, 상류 alpha tier --alpha-color-white-100
  alpha-orange-300: oklch(0.791 0.139 55)   # #ffa15e, 상류 alpha tier --alpha-color-orange-300
  alpha-orange-400: oklch(0.698 0.156 55)   # #e67f2b, 상류 alpha tier --alpha-color-orange-400
  alpha-orange-500: oklch(0.600 0.146 54)   # #c1630d, 상류 alpha tier --alpha-color-orange-500
  alpha-orange-400-30: oklch(0.698 0.156 55 / 0.30)   # #e67f2b4d, 상류 alpha tier --alpha-color-orange-400-30
  alpha-orange-400-20: oklch(0.698 0.156 55 / 0.20)   # #e67f2b33, 상류 alpha tier --alpha-color-orange-400-20
  alpha-orange-400-10: oklch(0.698 0.156 55 / 0.10)   # #e67f2b1a, 상류 alpha tier --alpha-color-orange-400-10
  alpha-orange-400-0: oklch(0.698 0.156 55 / 0.00)   # #e67f2b00, 상류 alpha tier --alpha-color-orange-400-0
  alpha-orange-300-45: oklch(0.791 0.139 55 / 0.45)   # #ffa15e73, 상류 alpha tier --alpha-color-orange-300-45
  alpha-orange-300-30: oklch(0.791 0.139 55 / 0.30)   # #ffa15e4d, 상류 alpha tier --alpha-color-orange-300-30
  alpha-orange-300-15: oklch(0.791 0.139 55 / 0.15)   # #ffa15e26, 상류 alpha tier --alpha-color-orange-300-15
  alpha-orange-300-0: oklch(0.791 0.139 55 / 0.00)   # #ffa15e00, 상류 alpha tier --alpha-color-orange-300-0
  alpha-yellow-300: oklch(0.853 0.161 89)   # #f9c835, 상류 alpha tier --alpha-color-yellow-300
  alpha-yellow-400: oklch(0.789 0.161 82)   # #edae0d, 상류 alpha tier --alpha-color-yellow-400
  alpha-yellow-500: oklch(0.682 0.140 83)   # #c38f00, 상류 alpha tier --alpha-color-yellow-500
  alpha-yellow-400-30: oklch(0.789 0.161 82 / 0.30)   # #edae0d4d, 상류 alpha tier --alpha-color-yellow-400-30
  alpha-yellow-400-20: oklch(0.789 0.161 82 / 0.20)   # #edae0d33, 상류 alpha tier --alpha-color-yellow-400-20
  alpha-yellow-400-10: oklch(0.789 0.161 82 / 0.10)   # #edae0d1a, 상류 alpha tier --alpha-color-yellow-400-10
  alpha-yellow-400-0: oklch(0.789 0.161 82 / 0.00)   # #edae0d00, 상류 alpha tier --alpha-color-yellow-400-0
  alpha-yellow-300-45: oklch(0.853 0.161 89 / 0.45)   # #f9c83573, 상류 alpha tier --alpha-color-yellow-300-45
  alpha-yellow-300-30: oklch(0.853 0.161 89 / 0.30)   # #f9c8354d, 상류 alpha tier --alpha-color-yellow-300-30
  alpha-yellow-300-15: oklch(0.853 0.161 89 / 0.15)   # #f9c83526, 상류 alpha tier --alpha-color-yellow-300-15
  alpha-yellow-300-0: oklch(0.853 0.161 89 / 0.00)   # #f9c83500, 상류 alpha tier --alpha-color-yellow-300-0
  alpha-pink-300: oklch(0.722 0.192 336)   # #ec6fd3, 상류 alpha tier --alpha-color-pink-300
  alpha-pink-400: oklch(0.637 0.208 338)   # #d64bb5, 상류 alpha tier --alpha-color-pink-400
  alpha-pink-500: oklch(0.549 0.194 334)   # #b0369e, 상류 alpha tier --alpha-color-pink-500
  alpha-pink-400-30: oklch(0.637 0.208 338 / 0.30)   # #d64bb54d, 상류 alpha tier --alpha-color-pink-400-30
  alpha-pink-400-20: oklch(0.637 0.208 338 / 0.20)   # #d64bb533, 상류 alpha tier --alpha-color-pink-400-20
  alpha-pink-400-10: oklch(0.637 0.208 338 / 0.10)   # #d64bb51a, 상류 alpha tier --alpha-color-pink-400-10
  alpha-pink-400-0: oklch(0.637 0.208 338 / 0.00)   # #d64bb500, 상류 alpha tier --alpha-color-pink-400-0
  alpha-pink-300-45: oklch(0.722 0.192 336 / 0.45)   # #ec6fd373, 상류 alpha tier --alpha-color-pink-300-45
  alpha-pink-300-30: oklch(0.722 0.192 336 / 0.30)   # #ec6fd34d, 상류 alpha tier --alpha-color-pink-300-30
  alpha-pink-300-15: oklch(0.722 0.192 336 / 0.15)   # #ec6fd326, 상류 alpha tier --alpha-color-pink-300-15
  alpha-pink-300-0: oklch(0.722 0.192 336 / 0.00)   # #ec6fd300, 상류 alpha tier --alpha-color-pink-300-0
  alpha-purple-300: oklch(0.709 0.177 299)   # #b184ff, 상류 alpha tier --alpha-color-purple-300
  alpha-purple-400: oklch(0.591 0.208 297)   # #8e57e7, 상류 alpha tier --alpha-color-purple-400
  alpha-purple-500: oklch(0.467 0.191 296)   # #6735b6, 상류 alpha tier --alpha-color-purple-500
  alpha-purple-400-30: oklch(0.591 0.208 297 / 0.30)   # #8e57e74d, 상류 alpha tier --alpha-color-purple-400-30
  alpha-purple-400-20: oklch(0.591 0.208 297 / 0.20)   # #8e57e733, 상류 alpha tier --alpha-color-purple-400-20
  alpha-purple-400-10: oklch(0.591 0.208 297 / 0.10)   # #8e57e71a, 상류 alpha tier --alpha-color-purple-400-10
  alpha-purple-400-0: oklch(0.591 0.208 297 / 0.00)   # #8e57e700, 상류 alpha tier --alpha-color-purple-400-0
  alpha-purple-300-45: oklch(0.709 0.177 299 / 0.45)   # #b184ff73, 상류 alpha tier --alpha-color-purple-300-45
  alpha-purple-300-30: oklch(0.709 0.177 299 / 0.30)   # #b184ff4d, 상류 alpha tier --alpha-color-purple-300-30
  alpha-purple-300-15: oklch(0.709 0.177 299 / 0.15)   # #b184ff26, 상류 alpha tier --alpha-color-purple-300-15
  alpha-purple-300-0: oklch(0.709 0.177 299 / 0.00)   # #b184ff00, 상류 alpha tier --alpha-color-purple-300-0
  alpha-navy-300: oklch(0.634 0.121 275)   # #7683d3, 상류 alpha tier --alpha-color-navy-300
  alpha-navy-400: oklch(0.469 0.147 273)   # #424fab, 상류 alpha tier --alpha-color-navy-400
  alpha-navy-500: oklch(0.387 0.131 277)   # #353888, 상류 alpha tier --alpha-color-navy-500
  alpha-navy-400-30: oklch(0.469 0.147 273 / 0.30)   # #424fab4d, 상류 alpha tier --alpha-color-navy-400-30
  alpha-navy-400-20: oklch(0.469 0.147 273 / 0.20)   # #424fab33, 상류 alpha tier --alpha-color-navy-400-20
  alpha-navy-400-10: oklch(0.469 0.147 273 / 0.10)   # #424fab1a, 상류 alpha tier --alpha-color-navy-400-10
  alpha-navy-400-0: oklch(0.469 0.147 273 / 0.00)   # #424fab00, 상류 alpha tier --alpha-color-navy-400-0
  alpha-navy-300-45: oklch(0.634 0.121 275 / 0.45)   # #7683d373, 상류 alpha tier --alpha-color-navy-300-45
  alpha-navy-300-30: oklch(0.634 0.121 275 / 0.30)   # #7683d34d, 상류 alpha tier --alpha-color-navy-300-30
  alpha-navy-300-15: oklch(0.634 0.121 275 / 0.15)   # #7683d326, 상류 alpha tier --alpha-color-navy-300-15
  alpha-navy-300-0: oklch(0.634 0.121 275 / 0.00)   # #7683d300, 상류 alpha tier --alpha-color-navy-300-0
  alpha-teal-300: oklch(0.787 0.123 186)   # #40d3c5, 상류 alpha tier --alpha-color-teal-300
  alpha-teal-400: oklch(0.690 0.118 190)   # #09b2ac, 상류 alpha tier --alpha-color-teal-400
  alpha-teal-500: oklch(0.589 0.099 201)   # #068e95, 상류 alpha tier --alpha-color-teal-500
  alpha-teal-400-30: oklch(0.690 0.118 190 / 0.30)   # #09b2ac4d, 상류 alpha tier --alpha-color-teal-400-30
  alpha-teal-400-20: oklch(0.690 0.118 190 / 0.20)   # #09b2ac33, 상류 alpha tier --alpha-color-teal-400-20
  alpha-teal-400-10: oklch(0.690 0.118 190 / 0.10)   # #09b2ac1a, 상류 alpha tier --alpha-color-teal-400-10
  alpha-teal-400-0: oklch(0.690 0.118 190 / 0.00)   # #09b2ac00, 상류 alpha tier --alpha-color-teal-400-0
  alpha-teal-300-45: oklch(0.787 0.123 186 / 0.45)   # #40d3c573, 상류 alpha tier --alpha-color-teal-300-45
  alpha-teal-300-30: oklch(0.787 0.123 186 / 0.30)   # #40d3c54d, 상류 alpha tier --alpha-color-teal-300-30
  alpha-teal-300-15: oklch(0.787 0.123 186 / 0.15)   # #40d3c526, 상류 alpha tier --alpha-color-teal-300-15
  alpha-teal-300-0: oklch(0.787 0.123 186 / 0.00)   # #40d3c500, 상류 alpha tier --alpha-color-teal-300-0
  alpha-olive-300: oklch(0.838 0.176 115)   # #c8d630, 상류 alpha tier --alpha-color-olive-300
  alpha-olive-400: oklch(0.730 0.160 113)   # #a9b110, 상류 alpha tier --alpha-color-olive-400
  alpha-olive-500: oklch(0.577 0.118 112)   # #7b801c, 상류 alpha tier --alpha-color-olive-500
  alpha-olive-400-30: oklch(0.730 0.160 113 / 0.30)   # #a9b1104d, 상류 alpha tier --alpha-color-olive-400-30
  alpha-olive-400-20: oklch(0.730 0.160 113 / 0.20)   # #a9b11033, 상류 alpha tier --alpha-color-olive-400-20
  alpha-olive-400-10: oklch(0.730 0.160 113 / 0.10)   # #a9b1101a, 상류 alpha tier --alpha-color-olive-400-10
  alpha-olive-400-0: oklch(0.730 0.160 113 / 0.00)   # #a9b11000, 상류 alpha tier --alpha-color-olive-400-0
  alpha-olive-300-45: oklch(0.838 0.176 115 / 0.45)   # #c8d63073, 상류 alpha tier --alpha-color-olive-300-45
  alpha-olive-300-30: oklch(0.838 0.176 115 / 0.30)   # #c8d6304d, 상류 alpha tier --alpha-color-olive-300-30
  alpha-olive-300-15: oklch(0.838 0.176 115 / 0.15)   # #c8d63026, 상류 alpha tier --alpha-color-olive-300-15
  alpha-olive-300-0: oklch(0.838 0.176 115 / 0.00)   # #c8d63000, 상류 alpha tier --alpha-color-olive-300-0
  alpha-grey-50: oklch(0.991 0 0)   # #fcfcfc, 상류 alpha tier --alpha-color-grey-50
  alpha-grey-100: oklch(0.976 0.001 286)   # #f7f7f8, 상류 alpha tier --alpha-color-grey-100
  alpha-grey-200: oklch(0.952 0.001 286)   # #efeff0, 상류 alpha tier --alpha-color-grey-200
  alpha-grey-400: oklch(0.855 0.003 286)   # #cfcfd1, 상류 alpha tier --alpha-color-grey-400
  alpha-grey-500: oklch(0.729 0.004 286)   # #a7a7aa, 상류 alpha tier --alpha-color-grey-500
  alpha-grey-600: oklch(0.583 0 0)   # #7b7b7b, 상류 alpha tier --alpha-color-grey-600
  alpha-grey-700: oklch(0.397 0.002 248)   # #464748, 상류 alpha tier --alpha-color-grey-700
  alpha-grey-800: oklch(0.317 0.004 265)   # #313234, 상류 alpha tier --alpha-color-grey-800
  alpha-grey-850: oklch(0.289 0.004 265)   # #2a2b2d, 상류 alpha tier --alpha-color-grey-850
  alpha-grey-900: oklch(0.262 0.007 286)   # #242428, 상류 alpha tier --alpha-color-grey-900
  alpha-grey-950: oklch(0.219 0.004 286)   # #1a1a1c, 상류 alpha tier --alpha-color-grey-950
  alpha-grey-900-0: oklch(0.262 0.007 286 / 0.00)   # #24242800, 상류 alpha tier --alpha-color-grey-900-0
  alpha-grey-alpha-850-80: oklch(0.289 0.004 265 / 0.80)   # #2a2b2dcc, 상류 alpha tier --alpha-color-grey-alpha-850-80
  alpha-grey-alpha-800-80: oklch(0.317 0.004 265 / 0.80)   # #313234cc, 상류 alpha tier --alpha-color-grey-alpha-800-80
  alpha-grey-alpha-700-80: oklch(0.397 0.002 248 / 0.80)   # #464748cc, 상류 alpha tier --alpha-color-grey-alpha-700-80
  alpha-grey-alpha-200-80: oklch(0.952 0.001 286 / 0.80)   # #efeff0cc, 상류 alpha tier --alpha-color-grey-alpha-200-80
  alpha-grey-alpha-100-80: oklch(0.976 0.001 286 / 0.80)   # #f7f7f8cc, 상류 alpha tier --alpha-color-grey-alpha-100-80
  alpha-grey-alpha-50-80: oklch(0.991 0 0 / 0.80)   # #fcfcfccc, 상류 alpha tier --alpha-color-grey-alpha-50-80
  alpha-grey-alpha-100-90: oklch(0.976 0.001 286 / 0.90)   # #f7f7f8e6, 상류 alpha tier --alpha-color-grey-alpha-100-90
  alpha-grey-alpha-800-90: oklch(0.317 0.004 265 / 0.90)   # #313234e6, 상류 alpha tier --alpha-color-grey-alpha-800-90
  alpha-shade-blue-400: oklch(0.611 0.159 279)   # #7175e0, 상류 alpha tier --alpha-color-shade-blue-400
  alpha-shade-blue-600: oklch(0.459 0.089 278)   # #4c5289, 상류 alpha tier --alpha-color-shade-blue-600
  alpha-shade-blue-400-20: oklch(0.611 0.159 279 / 0.20)   # #7175e033, 상류 alpha tier --alpha-color-shade-blue-400-20
  alpha-shade-blue-600-40: oklch(0.459 0.089 278 / 0.40)   # #4c528966, 상류 alpha tier --alpha-color-shade-blue-600-40
  alpha-shade-cobalt-400: oklch(0.716 0.120 242)   # #57ace8, 상류 alpha tier --alpha-color-shade-cobalt-400
  alpha-shade-cobalt-600: oklch(0.489 0.065 259)   # #4a6185, 상류 alpha tier --alpha-color-shade-cobalt-600
  alpha-shade-cobalt-400-20: oklch(0.716 0.120 242 / 0.20)   # #57ace833, 상류 alpha tier --alpha-color-shade-cobalt-400-20
  alpha-shade-cobalt-600-40: oklch(0.489 0.065 259 / 0.40)   # #4a618566, 상류 alpha tier --alpha-color-shade-cobalt-600-40
  alpha-shade-teal-400: oklch(0.684 0.083 192)   # #55aaa7, 상류 alpha tier --alpha-color-shade-teal-400
  alpha-shade-teal-600: oklch(0.527 0.051 214)   # #47737d, 상류 alpha tier --alpha-color-shade-teal-600
  alpha-shade-teal-400-20: oklch(0.684 0.083 192 / 0.20)   # #55aaa733, 상류 alpha tier --alpha-color-shade-teal-400-20
  alpha-shade-teal-600-40: oklch(0.527 0.051 214 / 0.40)   # #47737d66, 상류 alpha tier --alpha-color-shade-teal-600-40
  alpha-shade-red-400: oklch(0.661 0.148 18)   # #de6870, 상류 alpha tier --alpha-color-shade-red-400
  alpha-shade-red-600: oklch(0.482 0.106 17)   # #904248, 상류 alpha tier --alpha-color-shade-red-600
  alpha-shade-red-400-20: oklch(0.661 0.148 18 / 0.20)   # #de687033, 상류 alpha tier --alpha-color-shade-red-400-20
  alpha-shade-red-600-40: oklch(0.482 0.106 17 / 0.40)   # #90424866, 상류 alpha tier --alpha-color-shade-red-600-40
  alpha-shade-green-400: oklch(0.690 0.108 154)   # #62af7c, 상류 alpha tier --alpha-color-shade-green-400
  alpha-shade-green-600: oklch(0.538 0.067 157)   # #4c7a5e, 상류 alpha tier --alpha-color-shade-green-600
  alpha-shade-green-400-20: oklch(0.690 0.108 154 / 0.20)   # #62af7c33, 상류 alpha tier --alpha-color-shade-green-400-20
  alpha-shade-green-600-40: oklch(0.538 0.067 157 / 0.40)   # #4c7a5e66, 상류 alpha tier --alpha-color-shade-green-600-40
  alpha-shade-olive-400: oklch(0.713 0.110 111)   # #a5a953, 상류 alpha tier --alpha-color-shade-olive-400
  alpha-shade-olive-600: oklch(0.549 0.085 111)   # #737638, 상류 alpha tier --alpha-color-shade-olive-600
  alpha-shade-olive-400-20: oklch(0.713 0.110 111 / 0.20)   # #a5a95333, 상류 alpha tier --alpha-color-shade-olive-400-20
  alpha-shade-olive-600-40: oklch(0.549 0.085 111 / 0.40)   # #73763866, 상류 alpha tier --alpha-color-shade-olive-600-40
  alpha-shade-yellow-400: oklch(0.786 0.142 80)   # #e8ae3c, 상류 alpha tier --alpha-color-shade-yellow-400
  alpha-shade-yellow-600: oklch(0.529 0.090 93)   # #7d6a26, 상류 alpha tier --alpha-color-shade-yellow-600
  alpha-shade-yellow-400-20: oklch(0.786 0.142 80 / 0.20)   # #e8ae3c33, 상류 alpha tier --alpha-color-shade-yellow-400-20
  alpha-shade-yellow-600-40: oklch(0.529 0.090 93 / 0.40)   # #7d6a2666, 상류 alpha tier --alpha-color-shade-yellow-600-40
  alpha-shade-orange-400: oklch(0.715 0.132 57)   # #e08c48, 상류 alpha tier --alpha-color-shade-orange-400
  alpha-shade-orange-600: oklch(0.511 0.082 58)   # #895a34, 상류 alpha tier --alpha-color-shade-orange-600
  alpha-shade-orange-400-20: oklch(0.715 0.132 57 / 0.20)   # #e08c4833, 상류 alpha tier --alpha-color-shade-orange-400-20
  alpha-shade-orange-600-40: oklch(0.511 0.082 58 / 0.40)   # #895a3466, 상류 alpha tier --alpha-color-shade-orange-600-40
  alpha-shade-pink-400: oklch(0.671 0.165 337)   # #d369ba, 상류 alpha tier --alpha-color-shade-pink-400
  alpha-shade-pink-600: oklch(0.478 0.117 337)   # #854075, 상류 alpha tier --alpha-color-shade-pink-600
  alpha-shade-pink-400-20: oklch(0.671 0.165 337 / 0.20)   # #d369ba33, 상류 alpha tier --alpha-color-shade-pink-400-20
  alpha-shade-pink-600-40: oklch(0.478 0.117 337 / 0.40)   # #85407566, 상류 alpha tier --alpha-color-shade-pink-600-40
  alpha-shade-purple-400: oklch(0.641 0.174 299)   # #9d6fe5, 상류 alpha tier --alpha-color-shade-purple-400
  alpha-shade-purple-600: oklch(0.441 0.091 300)   # #5b467d, 상류 alpha tier --alpha-color-shade-purple-600
  alpha-shade-purple-400-20: oklch(0.641 0.174 299 / 0.20)   # #9d6fe533, 상류 alpha tier --alpha-color-shade-purple-400-20
  alpha-shade-purple-600-40: oklch(0.441 0.091 300 / 0.40)   # #5b467d66, 상류 alpha tier --alpha-color-shade-purple-600-40
  alpha-shade-navy-400: oklch(0.545 0.111 276)   # #5f69b0, 상류 alpha tier --alpha-color-shade-navy-400
  alpha-shade-navy-600: oklch(0.361 0.047 277)   # #373b56, 상류 alpha tier --alpha-color-shade-navy-600
  alpha-shade-navy-400-20: oklch(0.545 0.111 276 / 0.20)   # #5f69b033, 상류 alpha tier --alpha-color-shade-navy-400-20
  alpha-shade-navy-600-40: oklch(0.361 0.047 277 / 0.40)   # #373b5666, 상류 alpha tier --alpha-color-shade-navy-600-40
  ## Semantic bg-*·txt-* (stable tier)
  txt-white-normal: "{colors.stable-white-100}"
  dark-txt-white-normal: "{colors.stable-grey-900}"
  txt-black-dark: "{colors.stable-black-40}"
  dark-txt-black-dark: "{colors.stable-white-40}"
  txt-black-darker: "{colors.stable-black-60}"
  dark-txt-black-darker: "{colors.stable-white-60}"
  txt-black-darkest: "{colors.stable-black-85}"
  dark-txt-black-darkest: "{colors.stable-white-80}"
  txt-black-pure: "{colors.stable-black-100}"
  dark-txt-black-pure: "{colors.stable-white-100}"
  bg-grey-lightest: "{colors.stable-grey-50}"
  dark-bg-grey-lightest: "{colors.stable-grey-850}"
  bg-grey-lighter: "{colors.stable-grey-100}"
  dark-bg-grey-lighter: "{colors.stable-grey-800}"
  bg-grey-light: "{colors.stable-grey-200}"
  dark-bg-grey-light: "{colors.stable-grey-700}"
  bg-grey-dim-lightest: "{colors.stable-grey-50-80}"
  dark-bg-grey-dim-lightest: "{colors.stable-grey-850-80}"
  bg-grey-dark: "{colors.stable-grey-500}"
  dark-bg-grey-dark: "{colors.stable-grey-500}"
  bg-grey-darkest: "{colors.stable-grey-900}"
  dark-bg-grey-darkest: "{colors.stable-white-100}"
  bg-black-lightest: "{colors.stable-black-3}"
  dark-bg-black-lightest: "{colors.stable-white-5}"
  bg-black-lighter: "{colors.stable-black-5}"
  dark-bg-black-lighter: "{colors.stable-white-8}"
  bg-black-light: "{colors.stable-black-8}"
  dark-bg-black-light: "{colors.stable-white-12}"
  bg-black-dark: "{colors.stable-black-15}"
  dark-bg-black-dark: "{colors.stable-white-20}"
  bg-black-darker: "{colors.stable-black-40}"
  dark-bg-black-darker: "{colors.stable-white-40}"
  bg-black-darkest: "{colors.stable-black-60}"
  dark-bg-black-darkest: "{colors.stable-white-60}"
  bg-lounge: "{colors.stable-grey-100-90}"
  dark-bg-lounge: "{colors.stable-grey-800-90}"
  bg-header-float: "{colors.stable-white-90}"
  dark-bg-header-float: "{colors.stable-grey-800-80}"
  bg-header: "{colors.stable-white-100}"
  dark-bg-header: "{colors.stable-grey-800}"
  bg-navi: "{colors.stable-grey-100-80}"
  dark-bg-navi: "{colors.stable-grey-800-80}"
  bg-gnb: "{colors.stable-grey-200-80}"
  dark-bg-gnb: "{colors.stable-grey-700-80}"
  bg-white-dim-light: "{colors.stable-white-20}"
  dark-bg-white-dim-light: "{colors.stable-black-20}"
  bg-white-dim-dark: "{colors.stable-white-60}"
  dark-bg-white-dim-dark: "{colors.stable-black-60}"
  bg-white-low: "{colors.stable-white-100}"
  dark-bg-white-low: "{colors.stable-grey-800}"
  bg-white-normal: "{colors.stable-white-100}"
  dark-bg-white-normal: "{colors.stable-grey-900}"
  bg-white-high: "{colors.stable-white-100}"
  dark-bg-white-high: "{colors.stable-grey-700}"
  ## Semantic bgtxt-* (stable tier)
  bgtxt-absolute-white-lightest: "{colors.stable-white-20}"
  dark-bgtxt-absolute-white-lightest: "{colors.stable-white-20}"
  bgtxt-absolute-white-lighter: "{colors.stable-white-40}"
  dark-bgtxt-absolute-white-lighter: "{colors.stable-white-40}"
  bgtxt-absolute-white-light: "{colors.stable-white-60}"
  dark-bgtxt-absolute-white-light: "{colors.stable-white-60}"
  bgtxt-absolute-white-normal: "{colors.stable-white-90}"
  dark-bgtxt-absolute-white-normal: "{colors.stable-white-90}"
  bgtxt-absolute-white-dark: "{colors.stable-white-100}"
  dark-bgtxt-absolute-white-dark: "{colors.stable-white-100}"
  bgtxt-absolute-black-lightest: "{colors.stable-black-20}"
  dark-bgtxt-absolute-black-lightest: "{colors.stable-black-20}"
  bgtxt-absolute-black-lighter: "{colors.stable-black-40}"
  dark-bgtxt-absolute-black-lighter: "{colors.stable-black-40}"
  bgtxt-absolute-black-light: "{colors.stable-black-60}"
  dark-bgtxt-absolute-black-light: "{colors.stable-black-60}"
  bgtxt-absolute-black-normal: "{colors.stable-black-85}"
  dark-bgtxt-absolute-black-normal: "{colors.stable-black-85}"
  bgtxt-absolute-black-dark: "{colors.stable-black-100}"
  dark-bgtxt-absolute-black-dark: "{colors.stable-black-100}"
  bgtxt-navy-lightest: "{colors.stable-navy-400-10}"
  dark-bgtxt-navy-lightest: "{colors.stable-navy-300-20}"
  bgtxt-navy-lighter: "{colors.stable-navy-400-20}"
  dark-bgtxt-navy-lighter: "{colors.stable-navy-300-30}"
  bgtxt-navy-light: "{colors.stable-navy-400-30}"
  dark-bgtxt-navy-light: "{colors.stable-navy-300-40}"
  bgtxt-navy-normal: "{colors.stable-navy-400}"
  dark-bgtxt-navy-normal: "{colors.stable-navy-300}"
  bgtxt-navy-dark: "{colors.stable-navy-500}"
  dark-bgtxt-navy-dark: "{colors.stable-navy-400}"
  bgtxt-purple-lightest: "{colors.stable-purple-400-10}"
  dark-bgtxt-purple-lightest: "{colors.stable-purple-300-20}"
  bgtxt-purple-lighter: "{colors.stable-purple-400-20}"
  dark-bgtxt-purple-lighter: "{colors.stable-purple-300-30}"
  bgtxt-purple-light: "{colors.stable-purple-400-30}"
  dark-bgtxt-purple-light: "{colors.stable-purple-300-40}"
  bgtxt-purple-normal: "{colors.stable-purple-400}"
  dark-bgtxt-purple-normal: "{colors.stable-purple-300}"
  bgtxt-purple-dark: "{colors.stable-purple-500}"
  dark-bgtxt-purple-dark: "{colors.stable-purple-400}"
  bgtxt-pink-lightest: "{colors.stable-pink-400-10}"
  dark-bgtxt-pink-lightest: "{colors.stable-pink-300-20}"
  bgtxt-pink-lighter: "{colors.stable-pink-400-20}"
  dark-bgtxt-pink-lighter: "{colors.stable-pink-300-30}"
  bgtxt-pink-light: "{colors.stable-pink-400-30}"
  dark-bgtxt-pink-light: "{colors.stable-pink-300-40}"
  bgtxt-pink-normal: "{colors.stable-pink-400}"
  dark-bgtxt-pink-normal: "{colors.stable-pink-300}"
  bgtxt-pink-dark: "{colors.stable-pink-500}"
  dark-bgtxt-pink-dark: "{colors.stable-pink-400}"
  bgtxt-red-lightest: "{colors.stable-red-400-10}"
  dark-bgtxt-red-lightest: "{colors.stable-red-300-20}"
  bgtxt-red-lighter: "{colors.stable-red-400-20}"
  dark-bgtxt-red-lighter: "{colors.stable-red-300-30}"
  bgtxt-red-light: "{colors.stable-red-400-30}"
  dark-bgtxt-red-light: "{colors.stable-red-300-40}"
  bgtxt-red-normal: "{colors.stable-red-400}"
  dark-bgtxt-red-normal: "{colors.stable-red-300}"
  bgtxt-red-dark: "{colors.stable-red-500}"
  dark-bgtxt-red-dark: "{colors.stable-red-400}"
  bgtxt-orange-lightest: "{colors.stable-orange-400-10}"
  dark-bgtxt-orange-lightest: "{colors.stable-orange-300-20}"
  bgtxt-orange-lighter: "{colors.stable-orange-400-20}"
  dark-bgtxt-orange-lighter: "{colors.stable-orange-300-30}"
  bgtxt-orange-light: "{colors.stable-orange-400-30}"
  dark-bgtxt-orange-light: "{colors.stable-orange-300-40}"
  bgtxt-orange-normal: "{colors.stable-orange-400}"
  dark-bgtxt-orange-normal: "{colors.stable-orange-300}"
  bgtxt-orange-dark: "{colors.stable-orange-500}"
  dark-bgtxt-orange-dark: "{colors.stable-orange-400}"
  bgtxt-yellow-lightest: "{colors.stable-yellow-400-10}"
  dark-bgtxt-yellow-lightest: "{colors.stable-yellow-300-20}"
  bgtxt-yellow-lighter: "{colors.stable-yellow-400-20}"
  dark-bgtxt-yellow-lighter: "{colors.stable-yellow-300-30}"
  bgtxt-yellow-light: "{colors.stable-yellow-400-30}"
  dark-bgtxt-yellow-light: "{colors.stable-yellow-300-40}"
  bgtxt-yellow-normal: "{colors.stable-yellow-400}"
  dark-bgtxt-yellow-normal: "{colors.stable-yellow-300}"
  bgtxt-yellow-dark: "{colors.stable-yellow-500}"
  dark-bgtxt-yellow-dark: "{colors.stable-yellow-400}"
  bgtxt-olive-lightest: "{colors.stable-olive-400-10}"
  dark-bgtxt-olive-lightest: "{colors.stable-olive-300-20}"
  bgtxt-olive-lighter: "{colors.stable-olive-400-20}"
  dark-bgtxt-olive-lighter: "{colors.stable-olive-300-30}"
  bgtxt-olive-light: "{colors.stable-olive-400-30}"
  dark-bgtxt-olive-light: "{colors.stable-olive-300-40}"
  bgtxt-olive-normal: "{colors.stable-olive-400}"
  dark-bgtxt-olive-normal: "{colors.stable-olive-300}"
  bgtxt-olive-dark: "{colors.stable-olive-500}"
  dark-bgtxt-olive-dark: "{colors.stable-olive-400}"
  bgtxt-green-lightest: "{colors.stable-green-400-10}"
  dark-bgtxt-green-lightest: "{colors.stable-green-300-20}"
  bgtxt-green-lighter: "{colors.stable-green-400-20}"
  dark-bgtxt-green-lighter: "{colors.stable-green-300-30}"
  bgtxt-green-light: "{colors.stable-green-400-30}"
  dark-bgtxt-green-light: "{colors.stable-green-300-40}"
  bgtxt-green-normal: "{colors.stable-green-400}"
  dark-bgtxt-green-normal: "{colors.stable-green-300}"
  bgtxt-green-dark: "{colors.stable-green-500}"
  dark-bgtxt-green-dark: "{colors.stable-green-400}"
  bgtxt-teal-lightest: "{colors.stable-teal-400-10}"
  dark-bgtxt-teal-lightest: "{colors.stable-teal-300-20}"
  bgtxt-teal-lighter: "{colors.stable-teal-400-20}"
  dark-bgtxt-teal-lighter: "{colors.stable-teal-300-30}"
  bgtxt-teal-light: "{colors.stable-teal-400-30}"
  dark-bgtxt-teal-light: "{colors.stable-teal-300-40}"
  bgtxt-teal-normal: "{colors.stable-teal-400}"
  dark-bgtxt-teal-normal: "{colors.stable-teal-300}"
  bgtxt-teal-dark: "{colors.stable-teal-500}"
  dark-bgtxt-teal-dark: "{colors.stable-teal-400}"
  bgtxt-cobalt-lightest: "{colors.stable-cobalt-400-10}"
  dark-bgtxt-cobalt-lightest: "{colors.stable-cobalt-300-20}"
  bgtxt-cobalt-lighter: "{colors.stable-cobalt-400-20}"
  dark-bgtxt-cobalt-lighter: "{colors.stable-cobalt-300-30}"
  bgtxt-cobalt-light: "{colors.stable-cobalt-400-30}"
  dark-bgtxt-cobalt-light: "{colors.stable-cobalt-300-40}"
  bgtxt-cobalt-normal: "{colors.stable-cobalt-400}"
  dark-bgtxt-cobalt-normal: "{colors.stable-cobalt-300}"
  bgtxt-cobalt-dark: "{colors.stable-cobalt-500}"
  dark-bgtxt-cobalt-dark: "{colors.stable-cobalt-400}"
  bgtxt-blue-lightest: "{colors.stable-blue-400-10}"
  dark-bgtxt-blue-lightest: "{colors.stable-blue-300-20}"
  bgtxt-blue-lighter: "{colors.stable-blue-400-20}"
  dark-bgtxt-blue-lighter: "{colors.stable-blue-300-30}"
  bgtxt-blue-light: "{colors.stable-blue-400-30}"
  dark-bgtxt-blue-light: "{colors.stable-blue-300-40}"
  bgtxt-blue-normal: "{colors.stable-blue-400}"
  dark-bgtxt-blue-normal: "{colors.stable-blue-300}"
  bgtxt-blue-dark: "{colors.stable-blue-500}"
  dark-bgtxt-blue-dark: "{colors.stable-blue-400}"
  ## Semantic bdr-* (stable tier)
  bdr-white: "{colors.stable-white-100}"
  dark-bdr-white: "{colors.stable-grey-700}"
  bdr-grey-light: "{colors.stable-grey-200}"
  dark-bdr-grey-light: "{colors.stable-grey-700}"
  bdr-black-lightest: "{colors.stable-black-3}"
  dark-bdr-black-lightest: "{colors.stable-white-5}"
  bdr-black-light: "{colors.stable-black-8}"
  dark-bdr-black-light: "{colors.stable-white-12}"
  bdr-black-dark: "{colors.stable-black-15}"
  dark-bdr-black-dark: "{colors.stable-white-20}"
  ## Semantic shdw-* (stable tier)
  shdw-inner-base: "{colors.stable-white-12}"
  dark-shdw-inner-base: "{colors.stable-white-8}"
  shdw-base: "{colors.stable-black-5}"
  dark-shdw-base: "{colors.stable-black-8}"
  shdw-small: "{colors.stable-black-8}"
  dark-shdw-small: "{colors.stable-black-15}"
  shdw-medium: "{colors.stable-black-15}"
  dark-shdw-medium: "{colors.stable-black-20}"
  shdw-large: "{colors.stable-black-22}"
  dark-shdw-large: "{colors.stable-black-40}"
  shdw-xlarge: "{colors.stable-black-30}"
  dark-shdw-xlarge: "{colors.stable-black-60}"
  ## Semantic text (beta tier)
  text-action: "{colors.blue-400}"
  dark-text-action: "{colors.blue-300}"
  text-success: "{colors.green-400}"
  dark-text-success: "{colors.green-300}"
  text-highlight: "{colors.cobalt-400}"
  dark-text-highlight: "{colors.cobalt-300}"
  text-warning: "{colors.orange-400}"
  dark-text-warning: "{colors.orange-300}"
  text-critical: "{colors.red-400}"
  dark-text-critical: "{colors.red-300}"
  text-neutral-heaviest: "{colors.black-100}"
  dark-text-neutral-heaviest: "{colors.white-100}"
  text-neutral: "{colors.black-85}"
  dark-text-neutral: "{colors.white-80}"
  text-neutral-light: "{colors.black-60}"
  dark-text-neutral-light: "{colors.white-60}"
  text-neutral-lighter: "{colors.black-40}"
  dark-text-neutral-lighter: "{colors.white-40}"
  text-accent-blue: "{colors.blue-400}"
  dark-text-accent-blue: "{colors.blue-300}"
  text-accent-cobalt: "{colors.cobalt-400}"
  dark-text-accent-cobalt: "{colors.cobalt-300}"
  text-accent-green: "{colors.green-400}"
  dark-text-accent-green: "{colors.green-300}"
  text-accent-red: "{colors.red-400}"
  dark-text-accent-red: "{colors.red-300}"
  text-accent-orange: "{colors.orange-400}"
  dark-text-accent-orange: "{colors.orange-300}"
  text-accent-yellow: "{colors.yellow-400}"
  dark-text-accent-yellow: "{colors.yellow-300}"
  text-accent-olive: "{colors.olive-300}"
  dark-text-accent-olive: "{colors.olive-300}"
  text-accent-teal: "{colors.teal-400}"
  dark-text-accent-teal: "{colors.teal-300}"
  text-accent-navy: "{colors.navy-400}"
  dark-text-accent-navy: "{colors.navy-300}"
  text-accent-purple: "{colors.purple-400}"
  dark-text-accent-purple: "{colors.purple-300}"
  text-accent-pink: "{colors.pink-400}"
  dark-text-accent-pink: "{colors.pink-300}"
  text-absolute-white: "{colors.white-100}"
  dark-text-absolute-white: "{colors.white-100}"
  text-absolute-black: "{colors.black-100}"
  dark-text-absolute-black: "{colors.black-100}"
  text-inverse: "{colors.white-100}"
  dark-text-inverse: "{colors.black-85}"
  ## Semantic icon (beta tier)
  icon-action: "{colors.blue-400}"
  dark-icon-action: "{colors.blue-300}"
  icon-success: "{colors.green-400}"
  dark-icon-success: "{colors.green-300}"
  icon-highlight: "{colors.cobalt-400}"
  dark-icon-highlight: "{colors.cobalt-300}"
  icon-warning: "{colors.orange-400}"
  dark-icon-warning: "{colors.orange-300}"
  icon-critical: "{colors.red-400}"
  dark-icon-critical: "{colors.red-300}"
  icon-neutral: "{colors.black-40}"
  dark-icon-neutral: "{colors.white-40}"
  icon-neutral-heavy: "{colors.black-60}"
  dark-icon-neutral-heavy: "{colors.white-60}"
  icon-neutral-heavier: "{colors.black-85}"
  dark-icon-neutral-heavier: "{colors.white-80}"
  icon-accent-blue: "{colors.blue-400}"
  dark-icon-accent-blue: "{colors.blue-300}"
  icon-accent-cobalt: "{colors.cobalt-400}"
  dark-icon-accent-cobalt: "{colors.cobalt-300}"
  icon-accent-green: "{colors.green-400}"
  dark-icon-accent-green: "{colors.green-300}"
  icon-accent-red: "{colors.red-400}"
  dark-icon-accent-red: "{colors.red-300}"
  icon-accent-orange: "{colors.orange-400}"
  dark-icon-accent-orange: "{colors.orange-300}"
  icon-accent-yellow: "{colors.yellow-400}"
  dark-icon-accent-yellow: "{colors.yellow-300}"
  icon-accent-olive: "{colors.olive-400}"
  dark-icon-accent-olive: "{colors.olive-300}"
  icon-accent-teal: "{colors.teal-400}"
  dark-icon-accent-teal: "{colors.teal-300}"
  icon-accent-navy: "{colors.navy-400}"
  dark-icon-accent-navy: "{colors.navy-300}"
  icon-accent-purple: "{colors.purple-400}"
  dark-icon-accent-purple: "{colors.purple-300}"
  icon-accent-pink: "{colors.pink-400}"
  dark-icon-accent-pink: "{colors.pink-300}"
  icon-absolute-white: "{colors.white-100}"
  dark-icon-absolute-white: "{colors.white-100}"
  icon-absolute-black: "{colors.black-100}"
  dark-icon-absolute-black: "{colors.black-100}"
  icon-inverse-heavier: "{colors.white-100}"
  dark-icon-inverse-heavier: "{colors.black-85}"
  ## Semantic fill (beta tier)
  fill-neutral: "{colors.black-8}"
  dark-fill-neutral: "{colors.white-12}"
  fill-neutral-heaviest: "{colors.black-85}"
  dark-fill-neutral-heaviest: "{colors.white-100}"
  fill-neutral-heavier: "{colors.black-40}"
  dark-fill-neutral-heavier: "{colors.white-40}"
  fill-neutral-heavy: "{colors.black-15}"
  dark-fill-neutral-heavy: "{colors.white-20}"
  fill-neutral-light: "{colors.black-5}"
  dark-fill-neutral-light: "{colors.white-8}"
  fill-neutral-lighter: "{colors.black-3}"
  dark-fill-neutral-lighter: "{colors.white-5}"
  fill-neutral-lightest: "{colors.black-1}"
  dark-fill-neutral-lightest: "{colors.white-3}"
  fill-neutral-transparent: "{colors.black-0}"
  dark-fill-neutral-transparent: "{colors.white-0}"
  fill-action: "{colors.blue-400}"
  dark-fill-action: "{colors.blue-300}"
  fill-action-light: "{colors.blue-400-20}"
  dark-fill-action-light: "{colors.blue-300-30}"
  fill-action-lighter: "{colors.blue-400-10}"
  dark-fill-action-lighter: "{colors.blue-300-18}"
  fill-action-transparent: "{colors.blue-400-0}"
  dark-fill-action-transparent: "{colors.blue-300-0}"
  fill-success: "{colors.green-400}"
  dark-fill-success: "{colors.green-300}"
  fill-success-light: "{colors.green-400-20}"
  dark-fill-success-light: "{colors.green-300-30}"
  fill-success-lighter: "{colors.green-400-10}"
  dark-fill-success-lighter: "{colors.green-300-18}"
  fill-success-transparent: "{colors.green-400-0}"
  dark-fill-success-transparent: "{colors.green-300-0}"
  fill-highlight: "{colors.cobalt-400}"
  dark-fill-highlight: "{colors.cobalt-300}"
  fill-highlight-light: "{colors.cobalt-400-20}"
  dark-fill-highlight-light: "{colors.cobalt-300-30}"
  fill-highlight-lighter: "{colors.cobalt-400-10}"
  dark-fill-highlight-lighter: "{colors.cobalt-300-18}"
  fill-highlight-transparent: "{colors.cobalt-400-0}"
  dark-fill-highlight-transparent: "{colors.cobalt-300-0}"
  fill-warning: "{colors.orange-400}"
  dark-fill-warning: "{colors.orange-300}"
  fill-warning-light: "{colors.orange-400-20}"
  dark-fill-warning-light: "{colors.orange-300-30}"
  fill-warning-lighter: "{colors.orange-400-10}"
  dark-fill-warning-lighter: "{colors.orange-300-18}"
  fill-warning-transparent: "{colors.orange-400-0}"
  dark-fill-warning-transparent: "{colors.orange-300-0}"
  fill-critical: "{colors.red-400}"
  dark-fill-critical: "{colors.red-300}"
  fill-critical-light: "{colors.red-400-20}"
  dark-fill-critical-light: "{colors.red-300-30}"
  fill-critical-lighter: "{colors.red-400-10}"
  dark-fill-critical-lighter: "{colors.red-300-18}"
  fill-critical-transparent: "{colors.red-400-0}"
  dark-fill-critical-transparent: "{colors.red-300-0}"
  fill-grey-light: "{colors.grey-25}"
  dark-fill-grey-light: "{colors.grey-900}"
  fill-grey: "{colors.grey-50}"
  dark-fill-grey: "{colors.grey-850}"
  fill-grey-heavy: "{colors.grey-100}"
  dark-fill-grey-heavy: "{colors.grey-800}"
  fill-grey-heavier: "{colors.grey-200}"
  dark-fill-grey-heavier: "{colors.grey-750}"
  fill-accent-blue: "{colors.blue-400-10}"
  dark-fill-accent-blue: "{colors.blue-300-18}"
  fill-accent-blue-heavy: "{colors.blue-400-20}"
  dark-fill-accent-blue-heavy: "{colors.blue-300-30}"
  fill-accent-blue-heavier: "{colors.blue-400}"
  dark-fill-accent-blue-heavier: "{colors.blue-300}"
  fill-accent-blue-transparent: "{colors.blue-400-0}"
  dark-fill-accent-blue-transparent: "{colors.blue-300-0}"
  fill-accent-cobalt: "{colors.cobalt-400-10}"
  dark-fill-accent-cobalt: "{colors.cobalt-300-18}"
  fill-accent-cobalt-heavy: "{colors.cobalt-400-20}"
  dark-fill-accent-cobalt-heavy: "{colors.cobalt-300-30}"
  fill-accent-cobalt-heavier: "{colors.cobalt-400}"
  dark-fill-accent-cobalt-heavier: "{colors.cobalt-300}"
  fill-accent-cobalt-transparent: "{colors.cobalt-400-0}"
  dark-fill-accent-cobalt-transparent: "{colors.cobalt-300-0}"
  fill-accent-green: "{colors.green-400-10}"
  dark-fill-accent-green: "{colors.green-300-18}"
  fill-accent-green-heavy: "{colors.green-400-20}"
  dark-fill-accent-green-heavy: "{colors.green-300-30}"
  fill-accent-green-heavier: "{colors.green-400}"
  dark-fill-accent-green-heavier: "{colors.green-300}"
  fill-accent-green-transparent: "{colors.green-400-0}"
  dark-fill-accent-green-transparent: "{colors.green-300-0}"
  fill-accent-red: "{colors.red-400-10}"
  dark-fill-accent-red: "{colors.red-300-18}"
  fill-accent-red-heavy: "{colors.red-400-20}"
  dark-fill-accent-red-heavy: "{colors.red-300-30}"
  fill-accent-red-heavier: "{colors.red-400}"
  dark-fill-accent-red-heavier: "{colors.red-300}"
  fill-accent-red-transparent: "{colors.red-400-0}"
  dark-fill-accent-red-transparent: "{colors.red-300-0}"
  fill-accent-orange: "{colors.orange-400-10}"
  dark-fill-accent-orange: "{colors.orange-300-18}"
  fill-accent-orange-heavy: "{colors.orange-400-20}"
  dark-fill-accent-orange-heavy: "{colors.orange-300-30}"
  fill-accent-orange-heavier: "{colors.orange-400}"
  dark-fill-accent-orange-heavier: "{colors.orange-300}"
  fill-accent-orange-transparent: "{colors.orange-400-0}"
  dark-fill-accent-orange-transparent: "{colors.orange-300-0}"
  fill-accent-yellow: "{colors.yellow-400-10}"
  dark-fill-accent-yellow: "{colors.yellow-300-18}"
  fill-accent-yellow-heavy: "{colors.yellow-400-20}"
  dark-fill-accent-yellow-heavy: "{colors.yellow-300-30}"
  fill-accent-yellow-heavier: "{colors.yellow-400}"
  dark-fill-accent-yellow-heavier: "{colors.yellow-300}"
  fill-accent-yellow-transparent: "{colors.yellow-400-0}"
  dark-fill-accent-yellow-transparent: "{colors.yellow-300-0}"
  fill-accent-olive: "{colors.olive-400-10}"
  dark-fill-accent-olive: "{colors.olive-300-18}"
  fill-accent-olive-heavy: "{colors.olive-400-20}"
  dark-fill-accent-olive-heavy: "{colors.olive-300-30}"
  fill-accent-olive-heavier: "{colors.olive-400}"
  dark-fill-accent-olive-heavier: "{colors.olive-300}"
  fill-accent-olive-transparent: "{colors.olive-400-0}"
  dark-fill-accent-olive-transparent: "{colors.olive-300-0}"
  fill-accent-teal: "{colors.teal-400-10}"
  dark-fill-accent-teal: "{colors.teal-300-18}"
  fill-accent-teal-heavy: "{colors.teal-400-20}"
  dark-fill-accent-teal-heavy: "{colors.teal-300-30}"
  fill-accent-teal-heavier: "{colors.teal-400}"
  dark-fill-accent-teal-heavier: "{colors.teal-300}"
  fill-accent-teal-transparent: "{colors.teal-400-0}"
  dark-fill-accent-teal-transparent: "{colors.teal-300-0}"
  fill-accent-navy: "{colors.navy-400-10}"
  dark-fill-accent-navy: "{colors.navy-300-18}"
  fill-accent-navy-heavy: "{colors.navy-400-20}"
  dark-fill-accent-navy-heavy: "{colors.navy-300-30}"
  fill-accent-navy-heavier: "{colors.navy-400}"
  dark-fill-accent-navy-heavier: "{colors.navy-300}"
  fill-accent-navy-transparent: "{colors.navy-400-0}"
  dark-fill-accent-navy-transparent: "{colors.navy-300-0}"
  fill-accent-purple: "{colors.purple-400-10}"
  dark-fill-accent-purple: "{colors.purple-300-18}"
  fill-accent-purple-heavy: "{colors.purple-400-20}"
  dark-fill-accent-purple-heavy: "{colors.purple-300-30}"
  fill-accent-purple-heavier: "{colors.purple-400}"
  dark-fill-accent-purple-heavier: "{colors.purple-300}"
  fill-accent-purple-transparent: "{colors.purple-400-0}"
  dark-fill-accent-purple-transparent: "{colors.purple-300-0}"
  fill-accent-pink: "{colors.pink-400-10}"
  dark-fill-accent-pink: "{colors.pink-300-18}"
  fill-accent-pink-heavy: "{colors.pink-400-20}"
  dark-fill-accent-pink-heavy: "{colors.pink-300-30}"
  fill-accent-pink-heavier: "{colors.pink-400}"
  dark-fill-accent-pink-heavier: "{colors.pink-300}"
  fill-accent-pink-transparent: "{colors.pink-400-0}"
  dark-fill-accent-pink-transparent: "{colors.pink-300-0}"
  fill-absolute-white: "{colors.white-100}"
  dark-fill-absolute-white: "{colors.white-100}"
  fill-absolute-white-light: "{colors.white-20}"
  dark-fill-absolute-white-light: "{colors.white-20}"
  fill-absolute-white-transparent: "{colors.white-0}"
  dark-fill-absolute-white-transparent: "{colors.white-0}"
  fill-absolute-black: "{colors.black-100}"
  dark-fill-absolute-black: "{colors.black-100}"
  fill-absolute-black-light: "{colors.black-20}"
  dark-fill-absolute-black-light: "{colors.black-20}"
  fill-absolute-black-transparent: "{colors.black-0}"
  dark-fill-absolute-black-transparent: "{colors.black-0}"
  fill-bright: "{colors.grey-25}"
  dark-fill-bright: "{colors.grey-650}"
  ## Semantic border (beta tier)
  border-neutral: "{colors.black-8}"
  dark-border-neutral: "{colors.white-12}"
  border-neutral-heavy: "{colors.black-15}"
  dark-border-neutral-heavy: "{colors.white-20}"
  border-neutral-heavier: "{colors.black-40}"
  dark-border-neutral-heavier: "{colors.white-40}"
  border-detach: "{colors.white-100}"
  dark-border-detach: "{colors.grey-900}"
  border-detach-highest: "{colors.white-100}"
  dark-border-detach-highest: "{colors.grey-750}"
  border-detach-higher: "{colors.white-100}"
  dark-border-detach-higher: "{colors.grey-800}"
  border-detach-high: "{colors.white-100}"
  dark-border-detach-high: "{colors.grey-850}"
  border-detach-low: "{colors.grey-50}"
  dark-border-detach-low: "{colors.grey-950}"
  border-absolute-white: "{colors.white-100}"
  dark-border-absolute-white: "{colors.white-100}"
  ## Semantic surface (beta tier)
  surface: "{colors.white-100}"
  dark-surface: "{colors.grey-900}"
  surface-highest: "{colors.white-100}"
  dark-surface-highest: "{colors.grey-750}"
  surface-higher: "{colors.white-100}"
  dark-surface-higher: "{colors.grey-800}"
  surface-high: "{colors.white-100}"
  dark-surface-high: "{colors.grey-850}"
  surface-low: "{colors.grey-50}"
  dark-surface-low: "{colors.grey-950}"
  surface-glass: "{colors.white-90}"
  dark-surface-glass: "{colors.grey-800-90}"
  surface-glass-highest: "{colors.grey-200-90}"
  dark-surface-glass-highest: "{colors.grey-750-90}"
  surface-glass-higher: "{colors.grey-100-90}"
  dark-surface-glass-higher: "{colors.grey-800-90}"
  surface-glass-high: "{colors.white-90}"
  dark-surface-glass-high: "{colors.grey-850-90}"
  ## Semantic dim·gradient·state·elevation (beta tier)
  dim-absolute-black: "{colors.black-40}"
  dark-dim-absolute-black: "{colors.black-40}"
  dim-absolute-black-heavy: "{colors.black-60}"
  dark-dim-absolute-black-heavy: "{colors.black-60}"
  dim-absolute-white: "{colors.white-40}"
  dark-dim-absolute-white: "{colors.white-40}"
  dim-absolute-white-heavy: "{colors.white-60}"
  dark-dim-absolute-white-heavy: "{colors.white-60}"
  gradient-green: "{colors.green-400}"
  dark-gradient-green: "{colors.green-400}"
  gradient-green-heavy: "{colors.green-300}"
  dark-gradient-green-heavy: "{colors.green-300}"
  state-default: "{colors.black-15}"
  dark-state-default: "{colors.white-20}"
  state-action: "{colors.blue-400}"
  dark-state-action: "{colors.blue-300}"
  state-action-light: "{colors.blue-400-30}"
  dark-state-action-light: "{colors.blue-300-45}"
  state-warning: "{colors.orange-400}"
  dark-state-warning: "{colors.orange-300}"
  state-warning-light: "{colors.orange-400-30}"
  dark-state-warning-light: "{colors.orange-300-30}"
  elevation-xlarge: "{colors.black-30}"
  dark-elevation-xlarge: "{colors.black-30}"
  elevation-large: "{colors.black-22}"
  dark-elevation-large: "{colors.black-22}"
  elevation-medium: "{colors.black-15}"
  dark-elevation-medium: "{colors.black-15}"
  elevation-small: "{colors.black-8}"
  dark-elevation-small: "{colors.black-8}"
  elevation-base: "{colors.black-5}"
  dark-elevation-base: "{colors.black-5}"
  elevation-base-inner: "{colors.white-12}"
  dark-elevation-base-inner: "{colors.white-12}"
  ## Semantic fg (alpha tier)
  alpha-fg-black-pure: "{colors.alpha-black-100}"
  dark-alpha-fg-black-pure: "{colors.alpha-white-100}"
  alpha-fg-black-darkest: "{colors.alpha-black-85}"
  dark-alpha-fg-black-darkest: "{colors.alpha-white-80}"
  alpha-fg-black-darker: "{colors.alpha-black-60}"
  dark-alpha-fg-black-darker: "{colors.alpha-white-60}"
  alpha-fg-black-dark: "{colors.alpha-black-40}"
  dark-alpha-fg-black-dark: "{colors.alpha-white-40}"
  alpha-fg-black-light: "{colors.alpha-black-15}"
  dark-alpha-fg-black-light: "{colors.alpha-white-20}"
  alpha-fg-black-lightest: "{colors.alpha-black-8}"
  dark-alpha-fg-black-lightest: "{colors.alpha-white-12}"
  alpha-fg-white-normal: "{colors.alpha-white-100}"
  dark-alpha-fg-white-normal: "{colors.alpha-grey-900}"
  alpha-fg-blue-normal: "{colors.alpha-blue-400}"
  dark-alpha-fg-blue-normal: "{colors.alpha-blue-300}"
  alpha-fg-blue-light: "{colors.alpha-blue-400-30}"
  dark-alpha-fg-blue-light: "{colors.alpha-blue-300-45}"
  alpha-fg-blue-dark: "{colors.alpha-blue-500}"
  dark-alpha-fg-blue-dark: "{colors.alpha-blue-300}"
  alpha-fg-cobalt-normal: "{colors.alpha-cobalt-400}"
  dark-alpha-fg-cobalt-normal: "{colors.alpha-cobalt-300}"
  alpha-fg-cobalt-light: "{colors.alpha-cobalt-400-30}"
  dark-alpha-fg-cobalt-light: "{colors.alpha-cobalt-300-45}"
  alpha-fg-cobalt-dark: "{colors.alpha-cobalt-500}"
  dark-alpha-fg-cobalt-dark: "{colors.alpha-cobalt-300}"
  alpha-fg-red-normal: "{colors.alpha-red-400}"
  dark-alpha-fg-red-normal: "{colors.alpha-red-300}"
  alpha-fg-red-light: "{colors.alpha-red-400-30}"
  dark-alpha-fg-red-light: "{colors.alpha-red-300-45}"
  alpha-fg-red-dark: "{colors.alpha-red-500}"
  dark-alpha-fg-red-dark: "{colors.alpha-red-300}"
  alpha-fg-orange-normal: "{colors.alpha-orange-400}"
  dark-alpha-fg-orange-normal: "{colors.alpha-orange-300}"
  alpha-fg-orange-light: "{colors.alpha-orange-400-30}"
  dark-alpha-fg-orange-light: "{colors.alpha-orange-300-45}"
  alpha-fg-orange-dark: "{colors.alpha-orange-500}"
  dark-alpha-fg-orange-dark: "{colors.alpha-orange-300}"
  alpha-fg-green-normal: "{colors.alpha-green-400}"
  dark-alpha-fg-green-normal: "{colors.alpha-green-300}"
  alpha-fg-green-light: "{colors.alpha-green-400-30}"
  dark-alpha-fg-green-light: "{colors.alpha-green-300-45}"
  alpha-fg-green-dark: "{colors.alpha-green-500}"
  dark-alpha-fg-green-dark: "{colors.alpha-green-300}"
  alpha-fg-teal-normal: "{colors.alpha-teal-400}"
  dark-alpha-fg-teal-normal: "{colors.alpha-teal-300}"
  alpha-fg-teal-light: "{colors.alpha-teal-400-30}"
  dark-alpha-fg-teal-light: "{colors.alpha-teal-300-45}"
  alpha-fg-teal-dark: "{colors.alpha-teal-500}"
  dark-alpha-fg-teal-dark: "{colors.alpha-teal-300}"
  alpha-fg-olive-normal: "{colors.alpha-olive-400}"
  dark-alpha-fg-olive-normal: "{colors.alpha-olive-300}"
  alpha-fg-olive-light: "{colors.alpha-olive-400-30}"
  dark-alpha-fg-olive-light: "{colors.alpha-olive-300-45}"
  alpha-fg-olive-dark: "{colors.alpha-olive-500}"
  dark-alpha-fg-olive-dark: "{colors.alpha-olive-300}"
  alpha-fg-yellow-normal: "{colors.alpha-yellow-400}"
  dark-alpha-fg-yellow-normal: "{colors.alpha-yellow-300}"
  alpha-fg-yellow-light: "{colors.alpha-yellow-400-30}"
  dark-alpha-fg-yellow-light: "{colors.alpha-yellow-300-45}"
  alpha-fg-yellow-dark: "{colors.alpha-yellow-500}"
  dark-alpha-fg-yellow-dark: "{colors.alpha-yellow-300}"
  alpha-fg-pink-normal: "{colors.alpha-pink-400}"
  dark-alpha-fg-pink-normal: "{colors.alpha-pink-300}"
  alpha-fg-pink-light: "{colors.alpha-pink-400-30}"
  dark-alpha-fg-pink-light: "{colors.alpha-pink-300-45}"
  alpha-fg-pink-dark: "{colors.alpha-pink-500}"
  dark-alpha-fg-pink-dark: "{colors.alpha-pink-300}"
  alpha-fg-purple-normal: "{colors.alpha-purple-400}"
  dark-alpha-fg-purple-normal: "{colors.alpha-purple-300}"
  alpha-fg-purple-light: "{colors.alpha-purple-400-30}"
  dark-alpha-fg-purple-light: "{colors.alpha-purple-300-45}"
  alpha-fg-purple-dark: "{colors.alpha-purple-500}"
  dark-alpha-fg-purple-dark: "{colors.alpha-purple-300}"
  alpha-fg-navy-normal: "{colors.alpha-navy-400}"
  dark-alpha-fg-navy-normal: "{colors.alpha-navy-300}"
  alpha-fg-navy-light: "{colors.alpha-navy-400-30}"
  dark-alpha-fg-navy-light: "{colors.alpha-navy-300-45}"
  alpha-fg-navy-dark: "{colors.alpha-navy-500}"
  dark-alpha-fg-navy-dark: "{colors.alpha-navy-300}"
  alpha-fg-absolute-black-dark: "{colors.alpha-black-100}"
  dark-alpha-fg-absolute-black-dark: "{colors.alpha-black-100}"
  alpha-fg-absolute-black-normal: "{colors.alpha-black-85}"
  dark-alpha-fg-absolute-black-normal: "{colors.alpha-black-85}"
  alpha-fg-absolute-black-light: "{colors.alpha-black-60}"
  dark-alpha-fg-absolute-black-light: "{colors.alpha-black-60}"
  alpha-fg-absolute-black-lighter: "{colors.alpha-black-40}"
  dark-alpha-fg-absolute-black-lighter: "{colors.alpha-black-40}"
  alpha-fg-absolute-black-lightest: "{colors.alpha-black-20}"
  dark-alpha-fg-absolute-black-lightest: "{colors.alpha-black-20}"
  alpha-fg-absolute-white-dark: "{colors.alpha-white-100}"
  dark-alpha-fg-absolute-white-dark: "{colors.alpha-white-100}"
  alpha-fg-absolute-white-normal: "{colors.alpha-white-90}"
  dark-alpha-fg-absolute-white-normal: "{colors.alpha-white-90}"
  alpha-fg-absolute-white-light: "{colors.alpha-white-60}"
  dark-alpha-fg-absolute-white-light: "{colors.alpha-white-60}"
  alpha-fg-absolute-white-lighter: "{colors.alpha-white-40}"
  dark-alpha-fg-absolute-white-lighter: "{colors.alpha-white-40}"
  alpha-fg-absolute-white-lightest: "{colors.alpha-white-20}"
  dark-alpha-fg-absolute-white-lightest: "{colors.alpha-white-20}"
  alpha-fg-grey-darkest: "{colors.alpha-grey-900}"
  dark-alpha-fg-grey-darkest: "{colors.alpha-white-100}"
  alpha-fg-grey-dark: "{colors.alpha-grey-500}"
  dark-alpha-fg-grey-dark: "{colors.alpha-grey-500}"
  alpha-fg-grey-normal: "{colors.alpha-grey-400}"
  dark-alpha-fg-grey-normal: "{colors.alpha-grey-600}"
  alpha-fg-grey-light: "{colors.alpha-grey-200}"
  dark-alpha-fg-grey-light: "{colors.alpha-grey-700}"
  alpha-fg-grey-lighter: "{colors.alpha-grey-100}"
  dark-alpha-fg-grey-lighter: "{colors.alpha-grey-800}"
  alpha-fg-grey-lightest: "{colors.alpha-grey-50}"
  dark-alpha-fg-grey-lightest: "{colors.alpha-grey-850}"
  alpha-fg-grey-alpha-darker: "{colors.alpha-grey-alpha-200-80}"
  dark-alpha-fg-grey-alpha-darker: "{colors.alpha-grey-alpha-800-90}"
  alpha-fg-grey-alpha-dark: "{colors.alpha-grey-alpha-100-80}"
  dark-alpha-fg-grey-alpha-dark: "{colors.alpha-grey-alpha-800-80}"
  alpha-fg-grey-alpha-light: "{colors.alpha-grey-alpha-50-80}"
  dark-alpha-fg-grey-alpha-light: "{colors.alpha-grey-alpha-850-80}"
  ## Semantic bg (alpha tier)
  alpha-bg-black-darkest: "{colors.alpha-black-60}"
  dark-alpha-bg-black-darkest: "{colors.alpha-black-60}"
  alpha-bg-black-darker: "{colors.alpha-black-40}"
  dark-alpha-bg-black-darker: "{colors.alpha-white-40}"
  alpha-bg-black-dark: "{colors.alpha-black-15}"
  dark-alpha-bg-black-dark: "{colors.alpha-white-20}"
  alpha-bg-black-light: "{colors.alpha-black-8}"
  dark-alpha-bg-black-light: "{colors.alpha-white-12}"
  alpha-bg-black-lighter: "{colors.alpha-black-5}"
  dark-alpha-bg-black-lighter: "{colors.alpha-white-8}"
  alpha-bg-black-lightest: "{colors.alpha-black-3}"
  dark-alpha-bg-black-lightest: "{colors.alpha-white-5}"
  alpha-bg-black-transparent: "{colors.alpha-black-0}"
  dark-alpha-bg-black-transparent: "{colors.alpha-white-0}"
  alpha-bg-grey-darkest: "{colors.alpha-grey-900}"
  dark-alpha-bg-grey-darkest: "{colors.alpha-white-100}"
  alpha-bg-grey-dark: "{colors.alpha-grey-500}"
  dark-alpha-bg-grey-dark: "{colors.alpha-grey-500}"
  alpha-bg-grey-light: "{colors.alpha-grey-200}"
  dark-alpha-bg-grey-light: "{colors.alpha-grey-700}"
  alpha-bg-grey-lighter: "{colors.alpha-grey-100}"
  dark-alpha-bg-grey-lighter: "{colors.alpha-grey-800}"
  alpha-bg-grey-lightest: "{colors.alpha-grey-50}"
  dark-alpha-bg-grey-lightest: "{colors.alpha-grey-850}"
  alpha-bg-grey-transparent: "{colors.alpha-grey-900-0}"
  dark-alpha-bg-grey-transparent: "{colors.alpha-white-0}"
  alpha-bg-grey-normal: "{colors.alpha-grey-400}"
  dark-alpha-bg-grey-normal: "{colors.alpha-grey-600}"
  alpha-bg-grey-alpha-darkest: "{colors.alpha-grey-alpha-200-80}"
  dark-alpha-bg-grey-alpha-darkest: "{colors.alpha-grey-alpha-700-80}"
  alpha-bg-grey-alpha-darker: "{colors.alpha-grey-alpha-100-90}"
  dark-alpha-bg-grey-alpha-darker: "{colors.alpha-grey-alpha-800-90}"
  alpha-bg-grey-alpha-dark: "{colors.alpha-grey-alpha-100-80}"
  dark-alpha-bg-grey-alpha-dark: "{colors.alpha-grey-alpha-800-80}"
  alpha-bg-grey-alpha-light: "{colors.alpha-grey-alpha-50-80}"
  dark-alpha-bg-grey-alpha-light: "{colors.alpha-grey-alpha-850-80}"
  alpha-bg-white-highest: "{colors.alpha-white-100}"
  dark-alpha-bg-white-highest: "{colors.alpha-grey-700}"
  alpha-bg-white-higher: "{colors.alpha-white-100}"
  dark-alpha-bg-white-higher: "{colors.alpha-grey-800}"
  alpha-bg-white-normal: "{colors.alpha-white-100}"
  dark-alpha-bg-white-normal: "{colors.alpha-grey-900}"
  alpha-bg-white-transparent: "{colors.alpha-white-0}"
  dark-alpha-bg-white-transparent: "{colors.alpha-white-0}"
  alpha-bg-white-alpha-lightest: "{colors.alpha-white-90}"
  dark-alpha-bg-white-alpha-lightest: "{colors.alpha-grey-alpha-800-80}"
  alpha-bg-white-alpha-lighter: "{colors.alpha-white-60}"
  dark-alpha-bg-white-alpha-lighter: "{colors.alpha-black-60}"
  alpha-bg-white-alpha-light: "{colors.alpha-white-20}"
  dark-alpha-bg-white-alpha-light: "{colors.alpha-black-20}"
  alpha-bg-white-alpha-transparent: "{colors.alpha-white-0}"
  dark-alpha-bg-white-alpha-transparent: "{colors.alpha-black-0}"
  alpha-bg-blue-normal: "{colors.alpha-blue-400}"
  dark-alpha-bg-blue-normal: "{colors.alpha-blue-300}"
  alpha-bg-blue-light: "{colors.alpha-blue-400-30}"
  dark-alpha-bg-blue-light: "{colors.alpha-blue-300-45}"
  alpha-bg-blue-lighter: "{colors.alpha-blue-400-20}"
  dark-alpha-bg-blue-lighter: "{colors.alpha-blue-300-30}"
  alpha-bg-blue-lightest: "{colors.alpha-blue-400-10}"
  dark-alpha-bg-blue-lightest: "{colors.alpha-blue-300-15}"
  alpha-bg-blue-dark: "{colors.alpha-blue-500}"
  dark-alpha-bg-blue-dark: "{colors.alpha-blue-400}"
  alpha-bg-blue-shade-lighter: "{colors.alpha-shade-blue-400-20}"
  dark-alpha-bg-blue-shade-lighter: "{colors.alpha-shade-blue-600-40}"
  alpha-bg-blue-shade-normal: "{colors.alpha-shade-blue-400}"
  dark-alpha-bg-blue-shade-normal: "{colors.alpha-shade-blue-600}"
  alpha-bg-blue-transparent: "{colors.alpha-blue-400-0}"
  dark-alpha-bg-blue-transparent: "{colors.alpha-blue-300-0}"
  alpha-bg-cobalt-normal: "{colors.alpha-cobalt-400}"
  dark-alpha-bg-cobalt-normal: "{colors.alpha-cobalt-300}"
  alpha-bg-cobalt-light: "{colors.alpha-cobalt-400-30}"
  dark-alpha-bg-cobalt-light: "{colors.alpha-cobalt-300-45}"
  alpha-bg-cobalt-lighter: "{colors.alpha-cobalt-400-20}"
  dark-alpha-bg-cobalt-lighter: "{colors.alpha-cobalt-300-30}"
  alpha-bg-cobalt-lightest: "{colors.alpha-cobalt-400-10}"
  dark-alpha-bg-cobalt-lightest: "{colors.alpha-cobalt-300-15}"
  alpha-bg-cobalt-dark: "{colors.alpha-cobalt-500}"
  dark-alpha-bg-cobalt-dark: "{colors.alpha-cobalt-400}"
  alpha-bg-cobalt-shade-lighter: "{colors.alpha-shade-cobalt-400-20}"
  dark-alpha-bg-cobalt-shade-lighter: "{colors.alpha-shade-cobalt-600-40}"
  alpha-bg-cobalt-shade-normal: "{colors.alpha-shade-cobalt-400}"
  dark-alpha-bg-cobalt-shade-normal: "{colors.alpha-shade-cobalt-600}"
  alpha-bg-cobalt-transparent: "{colors.alpha-cobalt-400-0}"
  dark-alpha-bg-cobalt-transparent: "{colors.alpha-cobalt-300-0}"
  alpha-bg-red-normal: "{colors.alpha-red-400}"
  dark-alpha-bg-red-normal: "{colors.alpha-red-300}"
  alpha-bg-red-light: "{colors.alpha-red-400-30}"
  dark-alpha-bg-red-light: "{colors.alpha-red-300-45}"
  alpha-bg-red-lighter: "{colors.alpha-red-400-20}"
  dark-alpha-bg-red-lighter: "{colors.alpha-red-300-30}"
  alpha-bg-red-lightest: "{colors.alpha-red-400-10}"
  dark-alpha-bg-red-lightest: "{colors.alpha-red-300-15}"
  alpha-bg-red-dark: "{colors.alpha-red-500}"
  dark-alpha-bg-red-dark: "{colors.alpha-red-400}"
  alpha-bg-red-shade-lighter: "{colors.alpha-shade-red-400-20}"
  dark-alpha-bg-red-shade-lighter: "{colors.alpha-shade-red-600-40}"
  alpha-bg-red-shade-normal: "{colors.alpha-shade-red-400}"
  dark-alpha-bg-red-shade-normal: "{colors.alpha-shade-red-600}"
  alpha-bg-red-transparent: "{colors.alpha-red-400-0}"
  dark-alpha-bg-red-transparent: "{colors.alpha-red-300-0}"
  alpha-bg-orange-normal: "{colors.alpha-orange-400}"
  dark-alpha-bg-orange-normal: "{colors.alpha-orange-300}"
  alpha-bg-orange-light: "{colors.alpha-orange-400-30}"
  dark-alpha-bg-orange-light: "{colors.alpha-orange-300-45}"
  alpha-bg-orange-lighter: "{colors.alpha-orange-400-20}"
  dark-alpha-bg-orange-lighter: "{colors.alpha-orange-300-30}"
  alpha-bg-orange-lightest: "{colors.alpha-orange-400-10}"
  dark-alpha-bg-orange-lightest: "{colors.alpha-orange-300-15}"
  alpha-bg-orange-dark: "{colors.alpha-orange-500}"
  dark-alpha-bg-orange-dark: "{colors.alpha-orange-400}"
  alpha-bg-orange-shade-lighter: "{colors.alpha-shade-orange-400-20}"
  dark-alpha-bg-orange-shade-lighter: "{colors.alpha-shade-orange-600-40}"
  alpha-bg-orange-shade-normal: "{colors.alpha-shade-orange-400}"
  dark-alpha-bg-orange-shade-normal: "{colors.alpha-shade-orange-600}"
  alpha-bg-orange-transparent: "{colors.alpha-orange-400-0}"
  dark-alpha-bg-orange-transparent: "{colors.alpha-orange-300-0}"
  alpha-bg-green-normal: "{colors.alpha-green-400}"
  dark-alpha-bg-green-normal: "{colors.alpha-green-300}"
  alpha-bg-green-light: "{colors.alpha-green-400-30}"
  dark-alpha-bg-green-light: "{colors.alpha-green-300-45}"
  alpha-bg-green-lighter: "{colors.alpha-green-400-20}"
  dark-alpha-bg-green-lighter: "{colors.alpha-green-300-30}"
  alpha-bg-green-lightest: "{colors.alpha-green-400-10}"
  dark-alpha-bg-green-lightest: "{colors.alpha-green-300-15}"
  alpha-bg-green-dark: "{colors.alpha-green-500}"
  dark-alpha-bg-green-dark: "{colors.alpha-green-400}"
  alpha-bg-green-shade-lighter: "{colors.alpha-shade-green-400-20}"
  dark-alpha-bg-green-shade-lighter: "{colors.alpha-shade-green-600-40}"
  alpha-bg-green-shade-normal: "{colors.alpha-shade-green-400}"
  dark-alpha-bg-green-shade-normal: "{colors.alpha-shade-green-600}"
  alpha-bg-green-transparent: "{colors.alpha-green-400-0}"
  dark-alpha-bg-green-transparent: "{colors.alpha-green-300-0}"
  alpha-bg-teal-normal: "{colors.alpha-teal-400}"
  dark-alpha-bg-teal-normal: "{colors.alpha-teal-300}"
  alpha-bg-teal-light: "{colors.alpha-teal-400-30}"
  dark-alpha-bg-teal-light: "{colors.alpha-teal-300-45}"
  alpha-bg-teal-lighter: "{colors.alpha-teal-400-20}"
  dark-alpha-bg-teal-lighter: "{colors.alpha-teal-300-30}"
  alpha-bg-teal-lightest: "{colors.alpha-teal-400-10}"
  dark-alpha-bg-teal-lightest: "{colors.alpha-teal-300-15}"
  alpha-bg-teal-dark: "{colors.alpha-teal-500}"
  dark-alpha-bg-teal-dark: "{colors.alpha-teal-400}"
  alpha-bg-teal-shade-lighter: "{colors.alpha-shade-teal-400-20}"
  dark-alpha-bg-teal-shade-lighter: "{colors.alpha-shade-teal-600-40}"
  alpha-bg-teal-shade-normal: "{colors.alpha-shade-teal-400}"
  dark-alpha-bg-teal-shade-normal: "{colors.alpha-shade-teal-600}"
  alpha-bg-teal-transparent: "{colors.alpha-teal-400-0}"
  dark-alpha-bg-teal-transparent: "{colors.alpha-teal-300-0}"
  alpha-bg-olive-normal: "{colors.alpha-olive-400}"
  dark-alpha-bg-olive-normal: "{colors.alpha-olive-300}"
  alpha-bg-olive-light: "{colors.alpha-olive-400-30}"
  dark-alpha-bg-olive-light: "{colors.alpha-olive-300-45}"
  alpha-bg-olive-lighter: "{colors.alpha-olive-400-20}"
  dark-alpha-bg-olive-lighter: "{colors.alpha-olive-300-30}"
  alpha-bg-olive-lightest: "{colors.alpha-olive-400-10}"
  dark-alpha-bg-olive-lightest: "{colors.alpha-olive-300-15}"
  alpha-bg-olive-dark: "{colors.alpha-olive-500}"
  dark-alpha-bg-olive-dark: "{colors.alpha-olive-400}"
  alpha-bg-olive-shade-lighter: "{colors.alpha-shade-olive-400-20}"
  dark-alpha-bg-olive-shade-lighter: "{colors.alpha-shade-olive-600-40}"
  alpha-bg-olive-shade-normal: "{colors.alpha-shade-olive-400}"
  dark-alpha-bg-olive-shade-normal: "{colors.alpha-shade-olive-600}"
  alpha-bg-olive-transparent: "{colors.alpha-olive-400-0}"
  dark-alpha-bg-olive-transparent: "{colors.alpha-olive-300-0}"
  alpha-bg-yellow-normal: "{colors.alpha-yellow-400}"
  dark-alpha-bg-yellow-normal: "{colors.alpha-yellow-300}"
  alpha-bg-yellow-light: "{colors.alpha-yellow-400-30}"
  dark-alpha-bg-yellow-light: "{colors.alpha-yellow-300-45}"
  alpha-bg-yellow-lighter: "{colors.alpha-yellow-400-20}"
  dark-alpha-bg-yellow-lighter: "{colors.alpha-yellow-300-30}"
  alpha-bg-yellow-lightest: "{colors.alpha-yellow-400-10}"
  dark-alpha-bg-yellow-lightest: "{colors.alpha-yellow-300-15}"
  alpha-bg-yellow-dark: "{colors.alpha-yellow-500}"
  dark-alpha-bg-yellow-dark: "{colors.alpha-yellow-400}"
  alpha-bg-yellow-shade-lighter: "{colors.alpha-shade-yellow-400-20}"
  dark-alpha-bg-yellow-shade-lighter: "{colors.alpha-shade-yellow-600-40}"
  alpha-bg-yellow-shade-normal: "{colors.alpha-shade-yellow-400}"
  dark-alpha-bg-yellow-shade-normal: "{colors.alpha-shade-yellow-600}"
  alpha-bg-yellow-transparent: "{colors.alpha-yellow-400-0}"
  dark-alpha-bg-yellow-transparent: "{colors.alpha-yellow-300-0}"
  alpha-bg-pink-normal: "{colors.alpha-pink-400}"
  dark-alpha-bg-pink-normal: "{colors.alpha-pink-300}"
  alpha-bg-pink-light: "{colors.alpha-pink-400-30}"
  dark-alpha-bg-pink-light: "{colors.alpha-pink-300-45}"
  alpha-bg-pink-lighter: "{colors.alpha-pink-400-20}"
  dark-alpha-bg-pink-lighter: "{colors.alpha-pink-300-30}"
  alpha-bg-pink-lightest: "{colors.alpha-pink-400-10}"
  dark-alpha-bg-pink-lightest: "{colors.alpha-pink-300-15}"
  alpha-bg-pink-dark: "{colors.alpha-pink-500}"
  dark-alpha-bg-pink-dark: "{colors.alpha-pink-400}"
  alpha-bg-pink-shade-lighter: "{colors.alpha-shade-pink-400-20}"
  dark-alpha-bg-pink-shade-lighter: "{colors.alpha-shade-pink-600-40}"
  alpha-bg-pink-shade-normal: "{colors.alpha-shade-pink-400}"
  dark-alpha-bg-pink-shade-normal: "{colors.alpha-shade-pink-600}"
  alpha-bg-pink-transparent: "{colors.alpha-pink-400-0}"
  dark-alpha-bg-pink-transparent: "{colors.alpha-pink-300-0}"
  alpha-bg-purple-normal: "{colors.alpha-purple-400}"
  dark-alpha-bg-purple-normal: "{colors.alpha-purple-300}"
  alpha-bg-purple-light: "{colors.alpha-purple-400-30}"
  dark-alpha-bg-purple-light: "{colors.alpha-purple-300-45}"
  alpha-bg-purple-lighter: "{colors.alpha-purple-400-20}"
  dark-alpha-bg-purple-lighter: "{colors.alpha-purple-300-30}"
  alpha-bg-purple-lightest: "{colors.alpha-purple-400-10}"
  dark-alpha-bg-purple-lightest: "{colors.alpha-purple-300-15}"
  alpha-bg-purple-dark: "{colors.alpha-purple-500}"
  dark-alpha-bg-purple-dark: "{colors.alpha-purple-400}"
  alpha-bg-purple-shade-lighter: "{colors.alpha-shade-purple-400-20}"
  dark-alpha-bg-purple-shade-lighter: "{colors.alpha-shade-purple-600-40}"
  alpha-bg-purple-shade-normal: "{colors.alpha-shade-purple-400}"
  dark-alpha-bg-purple-shade-normal: "{colors.alpha-shade-purple-600}"
  alpha-bg-purple-transparent: "{colors.alpha-purple-400-0}"
  dark-alpha-bg-purple-transparent: "{colors.alpha-purple-300-0}"
  alpha-bg-navy-normal: "{colors.alpha-navy-400}"
  dark-alpha-bg-navy-normal: "{colors.alpha-navy-300}"
  alpha-bg-navy-light: "{colors.alpha-navy-400-30}"
  dark-alpha-bg-navy-light: "{colors.alpha-navy-300-45}"
  alpha-bg-navy-lighter: "{colors.alpha-navy-400-20}"
  dark-alpha-bg-navy-lighter: "{colors.alpha-navy-300-30}"
  alpha-bg-navy-lightest: "{colors.alpha-navy-400-10}"
  dark-alpha-bg-navy-lightest: "{colors.alpha-navy-300-15}"
  alpha-bg-navy-dark: "{colors.alpha-navy-500}"
  dark-alpha-bg-navy-dark: "{colors.alpha-navy-400}"
  alpha-bg-navy-shade-lighter: "{colors.alpha-shade-navy-400-20}"
  dark-alpha-bg-navy-shade-lighter: "{colors.alpha-shade-navy-600-40}"
  alpha-bg-navy-shade-normal: "{colors.alpha-shade-navy-400}"
  dark-alpha-bg-navy-shade-normal: "{colors.alpha-shade-navy-600}"
  alpha-bg-navy-transparent: "{colors.alpha-navy-400-0}"
  dark-alpha-bg-navy-transparent: "{colors.alpha-navy-300-0}"
  alpha-bg-absolute-black-dark: "{colors.alpha-black-100}"
  dark-alpha-bg-absolute-black-dark: "{colors.alpha-black-100}"
  alpha-bg-absolute-black-normal: "{colors.alpha-black-85}"
  dark-alpha-bg-absolute-black-normal: "{colors.alpha-black-85}"
  alpha-bg-absolute-black-light: "{colors.alpha-black-60}"
  dark-alpha-bg-absolute-black-light: "{colors.alpha-black-60}"
  alpha-bg-absolute-black-lighter: "{colors.alpha-black-40}"
  dark-alpha-bg-absolute-black-lighter: "{colors.alpha-black-40}"
  alpha-bg-absolute-black-lightest: "{colors.alpha-black-20}"
  dark-alpha-bg-absolute-black-lightest: "{colors.alpha-black-20}"
  alpha-bg-absolute-black-transparent: "{colors.alpha-black-0}"
  dark-alpha-bg-absolute-black-transparent: "{colors.alpha-black-0}"
  alpha-bg-absolute-white-dark: "{colors.alpha-white-100}"
  dark-alpha-bg-absolute-white-dark: "{colors.alpha-white-100}"
  alpha-bg-absolute-white-normal: "{colors.alpha-white-90}"
  dark-alpha-bg-absolute-white-normal: "{colors.alpha-white-90}"
  alpha-bg-absolute-white-light: "{colors.alpha-white-60}"
  dark-alpha-bg-absolute-white-light: "{colors.alpha-white-60}"
  alpha-bg-absolute-white-lighter: "{colors.alpha-white-40}"
  dark-alpha-bg-absolute-white-lighter: "{colors.alpha-white-40}"
  alpha-bg-absolute-white-lightest: "{colors.alpha-white-20}"
  dark-alpha-bg-absolute-white-lightest: "{colors.alpha-white-20}"
  alpha-bg-absolute-white-transparent: "{colors.alpha-white-0}"
  dark-alpha-bg-absolute-white-transparent: "{colors.alpha-white-0}"
  ## Semantic surface, shadow (alpha tier)
  alpha-surface-lowest: "{colors.alpha-grey-100}"
  dark-alpha-surface-lowest: "{colors.alpha-grey-850}"
  alpha-surface-lower: "{colors.alpha-grey-50}"
  dark-alpha-surface-lower: "{colors.alpha-grey-900}"
  alpha-surface-normal: "{colors.alpha-white-100}"
  dark-alpha-surface-normal: "{colors.alpha-grey-950}"
  alpha-shadow-xlarge: "{colors.alpha-black-30}"
  dark-alpha-shadow-xlarge: "{colors.alpha-black-60}"
  alpha-shadow-large: "{colors.alpha-black-22}"
  dark-alpha-shadow-large: "{colors.alpha-black-40}"
  alpha-shadow-medium: "{colors.alpha-black-15}"
  dark-alpha-shadow-medium: "{colors.alpha-black-20}"
  alpha-shadow-small: "{colors.alpha-black-8}"
  dark-alpha-shadow-small: "{colors.alpha-black-15}"
  alpha-shadow-base: "{colors.alpha-black-5}"
  dark-alpha-shadow-base: "{colors.alpha-black-8}"
  alpha-shadow-base-inner: "{colors.alpha-white-12}"
  dark-alpha-shadow-base-inner: "{colors.alpha-white-8}"
  ## Semantic role → role (alpha tier)
  alpha-dim-black-light: "{colors.alpha-bg-absolute-black-lightest}"
  dark-alpha-dim-black-light: "{colors.dark-alpha-bg-absolute-black-lightest}"
  alpha-dim-black-normal: "{colors.alpha-bg-absolute-black-lighter}"
  dark-alpha-dim-black-normal: "{colors.dark-alpha-bg-absolute-black-lighter}"
  alpha-primary-bg-normal: "{colors.alpha-bg-blue-normal}"
  dark-alpha-primary-bg-normal: "{colors.dark-alpha-bg-blue-normal}"
  alpha-primary-bg-light: "{colors.alpha-bg-blue-light}"
  dark-alpha-primary-bg-light: "{colors.dark-alpha-bg-blue-light}"
  alpha-primary-bg-lighter: "{colors.alpha-bg-blue-lighter}"
  dark-alpha-primary-bg-lighter: "{colors.dark-alpha-bg-blue-lighter}"
  alpha-primary-bg-lightest: "{colors.alpha-bg-blue-lightest}"
  dark-alpha-primary-bg-lightest: "{colors.dark-alpha-bg-blue-lightest}"
  alpha-primary-bg-dark: "{colors.alpha-bg-blue-dark}"
  dark-alpha-primary-bg-dark: "{colors.dark-alpha-bg-blue-dark}"
  alpha-primary-fg-normal: "{colors.alpha-fg-blue-normal}"
  dark-alpha-primary-fg-normal: "{colors.dark-alpha-fg-blue-normal}"
  alpha-primary-fg-light: "{colors.alpha-fg-blue-light}"
  dark-alpha-primary-fg-light: "{colors.dark-alpha-fg-blue-light}"
  alpha-primary-fg-dark: "{colors.alpha-fg-blue-dark}"
  dark-alpha-primary-fg-dark: "{colors.dark-alpha-fg-blue-dark}"
  alpha-critical-bg-dark: "{colors.alpha-bg-red-dark}"
  dark-alpha-critical-bg-dark: "{colors.dark-alpha-bg-red-dark}"
  alpha-critical-bg-normal: "{colors.alpha-fg-red-normal}"
  dark-alpha-critical-bg-normal: "{colors.dark-alpha-fg-red-normal}"
  alpha-critical-bg-light: "{colors.alpha-bg-red-light}"
  dark-alpha-critical-bg-light: "{colors.dark-alpha-bg-red-light}"
  alpha-critical-bg-lighter: "{colors.alpha-bg-red-lighter}"
  dark-alpha-critical-bg-lighter: "{colors.dark-alpha-bg-red-lighter}"
  alpha-critical-bg-lightest: "{colors.alpha-bg-red-lightest}"
  dark-alpha-critical-bg-lightest: "{colors.dark-alpha-bg-red-lightest}"
  alpha-critical-fg-normal: "{colors.alpha-fg-red-normal}"
  dark-alpha-critical-fg-normal: "{colors.dark-alpha-fg-red-normal}"
  alpha-critical-fg-light: "{colors.alpha-fg-red-light}"
  dark-alpha-critical-fg-light: "{colors.dark-alpha-fg-red-light}"
  alpha-critical-fg-dark: "{colors.alpha-fg-red-dark}"
  dark-alpha-critical-fg-dark: "{colors.dark-alpha-fg-red-dark}"
  alpha-warning-bg-dark: "{colors.alpha-bg-orange-dark}"
  dark-alpha-warning-bg-dark: "{colors.dark-alpha-bg-orange-dark}"
  alpha-warning-bg-normal: "{colors.alpha-bg-orange-normal}"
  dark-alpha-warning-bg-normal: "{colors.dark-alpha-bg-orange-normal}"
  alpha-warning-bg-light: "{colors.alpha-bg-orange-light}"
  dark-alpha-warning-bg-light: "{colors.dark-alpha-bg-orange-light}"
  alpha-warning-bg-lighter: "{colors.alpha-bg-orange-lighter}"
  dark-alpha-warning-bg-lighter: "{colors.dark-alpha-bg-orange-lighter}"
  alpha-warning-bg-lightest: "{colors.alpha-bg-orange-lightest}"
  dark-alpha-warning-bg-lightest: "{colors.dark-alpha-bg-orange-lightest}"
  alpha-warning-fg-normal: "{colors.alpha-fg-orange-normal}"
  dark-alpha-warning-fg-normal: "{colors.dark-alpha-fg-orange-normal}"
  alpha-warning-fg-light: "{colors.alpha-fg-orange-light}"
  dark-alpha-warning-fg-light: "{colors.dark-alpha-fg-orange-light}"
  alpha-warning-fg-dark: "{colors.alpha-fg-orange-dark}"
  dark-alpha-warning-fg-dark: "{colors.dark-alpha-fg-orange-dark}"
  alpha-accent-bg-dark: "{colors.alpha-bg-cobalt-dark}"
  dark-alpha-accent-bg-dark: "{colors.dark-alpha-bg-cobalt-dark}"
  alpha-accent-bg-normal: "{colors.alpha-bg-cobalt-normal}"
  dark-alpha-accent-bg-normal: "{colors.dark-alpha-bg-cobalt-normal}"
  alpha-accent-bg-light: "{colors.alpha-bg-cobalt-light}"
  dark-alpha-accent-bg-light: "{colors.dark-alpha-bg-cobalt-light}"
  alpha-accent-bg-lighter: "{colors.alpha-bg-cobalt-lighter}"
  dark-alpha-accent-bg-lighter: "{colors.dark-alpha-bg-cobalt-lighter}"
  alpha-accent-bg-lightest: "{colors.alpha-bg-cobalt-lightest}"
  dark-alpha-accent-bg-lightest: "{colors.dark-alpha-bg-cobalt-lightest}"
  alpha-accent-fg-normal: "{colors.alpha-fg-cobalt-normal}"
  dark-alpha-accent-fg-normal: "{colors.dark-alpha-fg-cobalt-normal}"
  alpha-accent-fg-light: "{colors.alpha-fg-cobalt-light}"
  dark-alpha-accent-fg-light: "{colors.dark-alpha-fg-cobalt-light}"
  alpha-accent-fg-dark: "{colors.alpha-fg-cobalt-dark}"
  dark-alpha-accent-fg-dark: "{colors.dark-alpha-fg-cobalt-dark}"
  alpha-success-bg-dark: "{colors.alpha-bg-green-dark}"
  dark-alpha-success-bg-dark: "{colors.dark-alpha-bg-green-dark}"
  alpha-success-bg-normal: "{colors.alpha-bg-green-normal}"
  dark-alpha-success-bg-normal: "{colors.dark-alpha-bg-green-normal}"
  alpha-success-bg-light: "{colors.alpha-bg-green-light}"
  dark-alpha-success-bg-light: "{colors.dark-alpha-bg-green-light}"
  alpha-success-bg-lighter: "{colors.alpha-bg-green-lighter}"
  dark-alpha-success-bg-lighter: "{colors.dark-alpha-bg-green-lighter}"
  alpha-success-bg-lightest: "{colors.alpha-bg-green-lightest}"
  dark-alpha-success-bg-lightest: "{colors.dark-alpha-bg-green-lightest}"
  alpha-success-fg-normal: "{colors.alpha-fg-green-normal}"
  dark-alpha-success-fg-normal: "{colors.dark-alpha-fg-green-normal}"
  alpha-success-fg-light: "{colors.alpha-fg-green-light}"
  dark-alpha-success-fg-light: "{colors.dark-alpha-fg-green-light}"
  alpha-success-fg-dark: "{colors.alpha-fg-green-dark}"
  dark-alpha-success-fg-dark: "{colors.dark-alpha-fg-green-dark}"
typography:
  # size — 토큰명 숫자 = px (핸드오프 colors_and_type.css는 `--font-size-11:11px`로 표기).
  # 아래 rem은 1rem=10px 루트 가정의 동치값(예: font-size-11 = 11px = 1.1rem@10px-root).
  font-size-11:
    fontFamily: "'Inter', 'NotoSansKR', 'Noto Sans KR', 'NotoSansJP', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Roboto', system-ui, sans-serif"
    fontSize: 1.1rem
  font-size-12:
    fontFamily: "'Inter', 'NotoSansKR', 'Noto Sans KR', 'NotoSansJP', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Roboto', system-ui, sans-serif"
    fontSize: 1.2rem
  font-size-13:
    fontFamily: "'Inter', 'NotoSansKR', 'Noto Sans KR', 'NotoSansJP', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Roboto', system-ui, sans-serif"
    fontSize: 1.3rem
  font-size-14:
    fontFamily: "'Inter', 'NotoSansKR', 'Noto Sans KR', 'NotoSansJP', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Roboto', system-ui, sans-serif"
    fontSize: 1.4rem
  font-size-15:
    fontFamily: "'Inter', 'NotoSansKR', 'Noto Sans KR', 'NotoSansJP', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Roboto', system-ui, sans-serif"
    fontSize: 1.5rem
  font-size-16:
    fontFamily: "'Inter', 'NotoSansKR', 'Noto Sans KR', 'NotoSansJP', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Roboto', system-ui, sans-serif"
    fontSize: 1.6rem
  font-size-17:
    fontFamily: "'Inter', 'NotoSansKR', 'Noto Sans KR', 'NotoSansJP', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Roboto', system-ui, sans-serif"
    fontSize: 1.7rem
  font-size-18:
    fontFamily: "'Inter', 'NotoSansKR', 'Noto Sans KR', 'NotoSansJP', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Roboto', system-ui, sans-serif"
    fontSize: 1.8rem
  font-size-22:
    fontFamily: "'Inter', 'NotoSansKR', 'Noto Sans KR', 'NotoSansJP', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Roboto', system-ui, sans-serif"
    fontSize: 2.2rem
  font-size-24:
    fontFamily: "'Inter', 'NotoSansKR', 'Noto Sans KR', 'NotoSansJP', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Roboto', system-ui, sans-serif"
    fontSize: 2.4rem
  font-size-30:
    fontFamily: "'Inter', 'NotoSansKR', 'Noto Sans KR', 'NotoSansJP', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Roboto', system-ui, sans-serif"
    fontSize: 3.0rem
  font-size-36:
    fontFamily: "'Inter', 'NotoSansKR', 'Noto Sans KR', 'NotoSansJP', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Roboto', system-ui, sans-serif"
    fontSize: 3.6rem
spacing:
  # 관찰된 4px 그리드 케이던스 (Storybook 예시 직접 사용값)
  spacing-4: 4px
  spacing-6: 6px
  spacing-10: 10px
  spacing-16: 16px
  spacing-32: 32px
  z-index-base: 0px
  z-index-floating: 1px
  z-index-overlay: 1000px
  z-index-modal: 1100px
  z-index-toast: 1200px
  z-index-tooltip: 1300px
  z-index-important: 2000px
rounded:
  radius-2: 2px
  radius-3: 3px   # 프로그레스바 / 슬라이더 트랙
  radius-4: 4px
  radius-6: 6px
  radius-8: 8px   # 인풋 / 버튼 (주력)
  radius-12: 12px   # 배너 / 토스트 / 리스트아이템 (주력)
  radius-16: 16px
  radius-20: 20px   # 모달
  radius-32: 32px
  radius-44: 44px
  radius-42-p: 42%   # 원형 / 스쿼클 · 명세 Dimension 밖(%)이라 공식 린터 에러, 값은 유지
---

# Bezier Design System — design.md

> 채널톡을 만드는 (주)채널코퍼레이션의 오픈소스 React 디자인 시스템. 컴포넌트 라이브러리 + 디자인 토큰 + 아이콘 세트를 한 모노레포로 배포하며, 핵심 패키지는 `@channel.io/bezier-react`·`@channel.io/bezier-tokens`(0.6.0)·`@channel.io/bezier-icons`(0.60.0)이다 [src:1][src:3][src:4]. 본 문서는 사용자가 제공한 Claude Design 핸드오프 번들을 1차 출처로 추출·정리해 합성한 결과다 — 번들은 비공개이므로, 아래 정량 주장은 2026-07-29에 공개 배포물(`@channel.io/bezier-tokens` 0.6.0 · `@channel.io/bezier-icons` 0.60.0 · Storybook 인덱스 [src:5])과 전수 대조했다. 당시 이 문서의 색 토큰은 전부 ΔE ≤ 0.02로 일치했고, 컴포넌트 59개 이름도 Storybook 문서와 1:1로 대응했다.

## Brand & Style

Bezier는 채널톡의 사내 제품 UI를 외부에 그대로 공개한 드문 한국발 풀 디자인 시스템이다 — 라이선스는 Apache-2.0(© Channel Corp.)이며, 컴포넌트 59 + foundation 3 + utility(ReadMe·Changelog) 2 = 64 docs, 아이콘 602 SVG(0.60.0 기준), 빌드 CSS 변수 450개 규모다 [src:1][src:3][src:4][src:5]. 이 수치는 실측이다 — Storybook 인덱스의 docs 엔트리 64개가 `components` 59 + `foundation`/`alpha-foundation` 3 + `ReadMe`/`Changelog` 2로 정확히 갈리고, `@channel.io/bezier-tokens` 0.6.0의 기본 엔트리 CSS가 변수 450개를 발행한다 [src:3][src:5]. (핸드오프 번들이 세던 "토큰 JSON 39종"은 공개 배포물로 재현되지 않아 뺐다 — npm 패키지는 JSON을 1개만 싣고 토큰을 CSS·SCSS·JS로 발행한다. 39는 beta tier의 `--dimension-*` 변수 개수와는 일치하나 같은 대상을 세었다는 근거가 없다.) 토큰을 별도 패키지로 떼어내 라이트·다크 멀티 테마를 1급으로 다루는 성숙한 시스템이다 [src:1].

전반 인상은 밝고 깨끗한 SaaS 톤에 강채도 액센트가 얹히는 구조다 [src:3]. 중립 표면은 거의 순수한 그레이/화이트(`{colors.grey-50}` ~ `{colors.grey-100}`)이고, 그 위에 채도 높은 단일 액센트(블루/그린/레드 등)가 포인트로 올라간다 [src:3]. 형태 언어는 둥글고 부드럽다 — 버튼·인풋·배너·토스트 모서리가 `{rounded.radius-8}`~`{rounded.radius-12}`로 크게 말려 있고, 단순 `border-radius`를 넘어 iOS식 연속 곡률(squircle)을 위한 전용 컴포넌트 `{component.smooth-corners-box}`까지 두는, 부드러운 코너에 공들이는 브랜드다 [src:2][src:3].

라이트·다크 양 테마를 동등하게 그린다 — 모든 컴포넌트 autodocs가 같은 variant를 흰 배경(라이트)과 짙은 `{colors.grey-900}` 패널(다크)에 나란히 보여주며, 다크는 후처리가 아니라 시맨틱 토큰으로 1급 지원된다 [src:2]. 밀도는 중간(comfortable)이다 — 폼 필드 기본 사이즈가 `m`이고 `xl/l/m/xs` 4단계로 조절되며, 인터랙션은 빠른 150ms 트랜지션(`cubic-bezier(0.3,0,0,1)`)으로 가볍게 처리된다 [src:3].

대상 사용자는 둘로 갈린다. 채널톡 내부 개발팀에게는 한국어 설명이 섞인 컴포넌트 docs를, 오픈소스로 공개된 외부 사용자에게는 영어 API 레퍼런스를 제공해 이중 언어로 운영된다 [src:1]. 본 카탈로그 메타 문서는 평서체(~다)로 기술하며, Bezier가 채널톡 제품 UI에서 쓰는 카피 톤과는 분리한다.

카테고리는 `developer`(디자인 시스템/개발자 도구)로 분류하되, 시각 언어만 참조하고 채널톡의 B2B 메시징 도메인 개념·플로우는 자기 제품에 맞게 번안하는 것이 번들의 명시적 사용 지침이다 [src:1].

## Colors

> **대조 결과, 서술 정정, 역할 표 추가(2026-11-09).** 같은 패키지 0.6.0 은 역할 층을 세 벌(기본, beta, alpha tier) 발행하고, 아래 「Semantic」 표는 세 벌을 모두 싣는다. 기본 tier `dist/css/styles.css` 의 색 역할 103개(`--bg-*`·`--txt-*` 27개, `--bgtxt-*` 65개, `--bdr-*` 5개, `--shdw-*` 6개), beta tier `dist/beta/css/styles.css` 의 `--color-*` 역할 346개, alpha tier `dist/alpha/css/styles.css` 의 `--alpha-color-*` 역할 472개이고, 셋 다 라이트(`:root`, `[data-bezier-theme="light"]`) 블록과 다크(`[data-bezier-theme="dark"]`) 블록에서 대응을 직접 옮겼다 [src:3]. 세 tier 는 한 tgz 에서 나왔고, npm 레지스트리의 최신판이 여전히 0.6.0 이며 그 shasum 이 대조에 쓴 tgz 와 같음을 이 날짜에 확인했다. beta 역할 가운데 163개는 두 테마 모두 beta 원시값 하나를 가리켜, 그 칸은 전부 frontmatter 참조 행이다. 가리키는 원시값 130개 가운데 2026-11-01 재감사 전부터 이 문서에 있던 84개는 상류와 ΔE ≤ 0.002 로 맞았고, 46개는 그 재감사에서 상류 값으로 더했다. 나머지 183개(`-hovered` 173개와 hovered 가 아닌 `chart-theme-default-*` 10개)는 상류가 두 테마 모두 원시값을 가리키지 않고 hex 를 직접 적어 가리킬 팔레트 토큰이 상류에 없으므로, 참조 행 없이 표에만 상류 hex 와 OKLCH(저장소 변환기)로 실었다. 그중 19개(`fill-*-transparent-hovered` 계열)는 hex 가 원시값과 같지만 상류가 그 원시값을 가리키는 것은 아니어서, 칸에 그렇게 적고 참조 행을 두지 않았다. 기본 tier 역할은 기본 tier(`dist/css/styles.css`) 원시값 하나를 가리키고, 그 원시값은 beta 단계와 이름이 같아도 다른 파일의 다른 토큰이다. 그래서 기본 tier 역할이 가리키는 원시값을 `stable-` 앞붙임 팔레트로 따로 싣고(값은 그 파일의 원시값 정의, 줄 끝에 상류 hex), 역할의 라이트·다크 칸을 모두 그 키의 참조 행으로 실었다. 기본 tier 도 beta 처럼 원시값을 테마마다 다시 정의하지 않고 다크 블록이 역할만 다시 가리키므로, `dark-` 짝은 접두 없는 `stable-*` 키를 가리킨다. alpha tier 역할 472개 가운데 194개는 두 테마 모두 alpha 원시값 하나를 가리키고, 42개는 다른 alpha 역할 하나를 가리키며, 나머지 236개는 모두 `-hovered` 역할로 상류가 두 테마 모두 hex 를 직접 적었다. 다른 역할을 가리키는 42개가 가리키는 역할 41개는 모두 원시값을 가리키는 역할이다. alpha 원시값은 다크 블록이 다시 정의하지 않고, 역할이 가리키는 207개를 `alpha-` 앞붙임 팔레트로 따로 실었다(줄 끝에 상류 hex). alpha 역할 이름 가운데 12개가 이미 실린 역할 이름과 같아서(`bg-grey-light` 등), alpha 역할은 이름에도 모두 `alpha-` 를 앞붙였다. 원시값을 가리키는 alpha 역할은 두 칸 모두 접두 없는 `alpha-*` 원시값 키의 참조 행이고, 다른 역할을 가리키는 alpha 역할은 그 한 단계 건너가는 참조(홉)를 역할 참조로 실었다(다크 짝은 가리킨 역할의 `dark-` 짝을 가리킨다). hex 를 직접 적은 236개는 표에만 있고, 그중 17개는 hex 가 alpha 원시값과 같지만 상류가 그 원시값을 가리키는 것은 아니어서 칸에 그렇게 적었다. 기본 tier 와 beta 를 원시값마다 hex 로 맞대 보면, 중립색은 `black-*`·`white-*` 알파 단계와 `grey-100/200/500`·`grey-100-80/90`·`grey-200-80` 이 같은 값이고 `grey-50/700/800/850/900` 과 그 알파 단계(`grey-50-80`·`grey-700-80`·`grey-800-80/90`·`grey-850-80`)는 다르다. 액센트 계열은 대부분 값이 다르고(`pink-300`·`pink-300-30` 은 같다), `{hue}-300-20/40` 처럼 beta 에 없는 단계도 있다. 값이 같아도 beta 키를 가리키지 않는다 — 한쪽 tier 만 바뀌면 조용히 거짓이 되기 때문이다. 참조 행이 아닌 팔레트 색 토큰 482개는 published `@channel.io/bezier-tokens` 0.6.0에서 나온다 — `stable-*` 키는 기본 tier `dist/css/styles.css`, `alpha-*` 키는 alpha tier `dist/alpha/css/styles.css`, 나머지는 `dist/beta/css/styles.css` 다 [src:3]. 비공개 핸드오프 번들에서 온 43개도 이 배포물과 **전부 ΔE ≤ 0.02**로 일치한다 — 번들 값이 공개 배포물로 재현된다. 상류 원시값 블록에서 직접 옮긴 439개(기본 tier 의 `stable-*` 전부, alpha tier 의 `alpha-*` 전부와, beta 의 accent 틴트 `{hue}-400-0/10/20`·`{hue}-300-0/18/30`·`blue-400-30`·`blue-300-45`·`orange-400-30`, 불투명 `navy/purple/pink/teal-300`, `grey-650/750/950`, grey 알파 단계, `black-0/1/3/5/15/20/22/30`·`white-0/3/5/8/20/40/60/80`)는 상류 이름을 그대로 쓰고 알파는 이름이 말하는 백분율로 적었으며(`white-8` 은 `/ 0.08`), 줄 끝에 상류 hex를 적어 `audit:oklch`가 줄마다 대조한다(상류가 `#fff3`처럼 줄여 쓴 값은 8자리로 풀어 적었다). 같은 파일과 대조해 아래 「Accent global hues」의 틴트 서술을 상류 이름에 맞췄다 — 기본 `fill-accent-{hue}`는 10%(다크 `{hue}-300-18`)이고 20%는 `fill-accent-{hue}-heavy`(다크 `{hue}-300-30`)다 [src:3]. 다만 **tier를 구분해 읽어야 한다**: 이 절의 색은 `stable-*` 키와 `alpha-*` 키를 빼면 beta tier이고, 아래 Typography·Rounded·Spacing 절의 값은 기본(stable) tier다. 같은 토큰 이름이 tier마다 다른 값을 가진다 — `grey-900`이 stable에서는 `#242428` ≈ `oklch(0.262 0.007 286)`, beta에서는 `#1d1d20` ≈ `oklch(0.232 0.006 286)`이다. beta에는 stable에 없는 `grey-25/300/400/600/650/750/950`이 있고, 반대로 `radius-44`·`radius-42-p`는 stable에만 있다.

Bezier는 글로벌 원시값 → 시맨틱(라이트/다크) → 컴포넌트 3계층 토큰 구조다 [src:3][src:2]. 글로벌은 원시 색값이고, 시맨틱(`--bg-*`, `--txt-*`, `--color-*`)은 테마별로 다른 글로벌을 참조한다 [src:2][src:3]. `--bg-*`·`--txt-*`·`--bgtxt-*`·`--bdr-*`·`--shdw-*` 는 기본 tier 의 시맨틱 이름이고, `--color-` 는 beta tier 의 이름 앞붙임이다 — beta 는 원시값(`--color-grey-900`)과 시맨틱(`--color-text-neutral`)이 같은 앞붙임을 쓴다 [src:3]. alpha tier 도 원시값과 시맨틱이 같은 앞붙임 `--alpha-color-` 를 쓴다(`--alpha-color-grey-200`, `--alpha-color-bg-grey-light`) [src:3]. 특징은 navy·purple·pink·red·orange·yellow·olive·green·teal·cobalt·blue 11개 hue를 각각 300/400/500 명도 + 알파 변형으로 갖춘 무지개 액센트 팔레트다 [src:3][src:4].

아래 팔레트의 출처는 넷이다 — 핸드오프 번들 `colors_and_type.css`(Bezier **beta 토큰 팔레트**를 정답으로 삼은 파일)에서 온 43개는 번들 값을 ko-design-md 표준 OKLCH로 변환한 것이고, 나머지 beta 키는 `dist/beta` 원시값 블록에서, `stable-*` 키는 기본 tier `dist/css/styles.css` 에서, `alpha-*` 키는 alpha tier `dist/alpha/css/styles.css` 에서 직접 옮겼다(감사 메모 참조) — 1차 액션은 indigo-violet 계열 `blue-400`이고, 원본이 hex로 발행돼 OKLCH 변환에 미세한 오차가 있을 수 있다 [src:3].

### Accent global hues (300/400/500 core)

액센트는 한 hue가 **연·진 한 쌍**으로 작동한다 — **옅은 틴트를 배경 fill**로, **솔리드 hue를 텍스트·아이콘**(`text/icon-accent-*`)으로 쓴다. 틴트는 두 단계다 — 기본 `fill-accent-{hue}`는 라이트 `{hue}-400-10`(10%) · 다크 `{hue}-300-18`, 한 단계 진한 `fill-accent-{hue}-heavy`는 라이트 `{hue}-400-20`(20%) · 다크 `{hue}-300-30`이다(blue 는 `{colors.blue-400-10}` · `{colors.blue-300-18}` · `{colors.blue-400-20}` · `{colors.blue-300-30}`) [src:3]. 그래서 배너·태그·상태 칩이 "연한 틴트 위 진한 동색 글자/아이콘"으로 읽힌다. 다만 다크 쪽 반투명 토큰은 blue·green·red·navy 네 hue에서 기준색이 불투명 300과 달라(blue는 300보다 짙다), 300 값에 알파를 곱해 다시 만들면 상류와 어긋난다 — 그래서 이 토큰들은 상류 값 그대로 실려 있다 [src:3].

### Semantic (라이트/다크 분리)

시맨틱 토큰은 같은 이름이 테마별로 다른 글로벌을 참조한다 [src:3][src:2]. `@channel.io/bezier-tokens` 는 이 역할 층을 세 벌 발행한다 — 기본 tier 의 `--bg-*`·`--txt-*`·`--bgtxt-*`·`--bdr-*`·`--shdw-*`(색 역할 103개), beta tier 의 `--color-text-*`·`--color-fill-*` 등(346개 — 원시값을 가리키는 163개와 hex 를 직접 적은 183개), 그리고 alpha tier 의 `--alpha-color-fg-*`, `--alpha-color-bg-*` 등(472개 — 원시값을 가리키는 194개, 다른 alpha 역할을 가리키는 42개, hex 를 직접 적은 236개)이다 [src:3]. 이 문서는 세 벌을 모두 싣는다. 기본 tier 와 beta 는 이름 체계도 다르고(`txt-black-darkest` 대 `text-neutral`) 가리키는 원시값도 각자 자기 tier 의 것이다. 컴포넌트 문서가 부르는 이름은 beta 쪽이고(`--color-fill-accent-green-heavier` 등) [src:2], 기본 tier 이름도 패키지 기본 엔트리로 계속 발행되므로 둘 다 싣는다. 아래 표에서 beta 역할 이름은 상류 CSS 이름에서 `--color-` 를 뗀 것이다(`text-neutral` = `--color-text-neutral`). 칸이 참조 하나뿐이면 그 칸이 frontmatter 참조 행(다크는 `dark-` 앞붙임)으로도 실려 있다. beta 층에서 원시값을 가리키는 역할은 모든 칸이 beta 팔레트의 참조이고, hex 를 직접 적은 역할은 그 값을 상류 hex ≈ OKLCH 로 적은 표에만 있다. 기본 tier 층은 모든 칸이 기본 tier 원시값을 따로 실은 `stable-*` 키의 참조다 — beta 와 값이 같은 단계도 다른 파일의 다른 토큰이라 beta 키를 가리키지 않는다. alpha 층은 역할 이름과 원시값 키에 모두 `alpha-` 를 앞붙이고 자기 tier 의 키만 가리킨다(아래 「alpha 엔트리」).

- **컴포넌트 토큰**: `--color-fill-*`, `--color-text-*`, `--color-icon-*`, `--color-border-*`, `--color-surface-*`, `--color-state-action-light`, `--color-dim-absolute-black` 네임스페이스로 노출된다 [src:2].
- foundation `color.mdx`는 토큰을 Global → Light → Dark 3섹션 스와치로 문서화하며, 라이트는 흰 패널·다크는 짙은 `--color-surface` 패널에 렌더해 양 테마 동시 검수를 전제한다 [src:2].

#### 기본 tier 표면·텍스트 (`bg-*`·`txt-*`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `txt-white-normal` | `{colors.stable-white-100}` | `{colors.stable-grey-900}` |
| `txt-black-dark` | `{colors.stable-black-40}` | `{colors.stable-white-40}` |
| `txt-black-darker` | `{colors.stable-black-60}` | `{colors.stable-white-60}` |
| `txt-black-darkest` | `{colors.stable-black-85}` | `{colors.stable-white-80}` |
| `txt-black-pure` | `{colors.stable-black-100}` | `{colors.stable-white-100}` |
| `bg-grey-lightest` | `{colors.stable-grey-50}` | `{colors.stable-grey-850}` |
| `bg-grey-lighter` | `{colors.stable-grey-100}` | `{colors.stable-grey-800}` |
| `bg-grey-light` | `{colors.stable-grey-200}` | `{colors.stable-grey-700}` |
| `bg-grey-dim-lightest` | `{colors.stable-grey-50-80}` | `{colors.stable-grey-850-80}` |
| `bg-grey-dark` | `{colors.stable-grey-500}` | `{colors.stable-grey-500}` |
| `bg-grey-darkest` | `{colors.stable-grey-900}` | `{colors.stable-white-100}` |
| `bg-black-lightest` | `{colors.stable-black-3}` | `{colors.stable-white-5}` |
| `bg-black-lighter` | `{colors.stable-black-5}` | `{colors.stable-white-8}` |
| `bg-black-light` | `{colors.stable-black-8}` | `{colors.stable-white-12}` |
| `bg-black-dark` | `{colors.stable-black-15}` | `{colors.stable-white-20}` |
| `bg-black-darker` | `{colors.stable-black-40}` | `{colors.stable-white-40}` |
| `bg-black-darkest` | `{colors.stable-black-60}` | `{colors.stable-white-60}` |
| `bg-lounge` | `{colors.stable-grey-100-90}` | `{colors.stable-grey-800-90}` |
| `bg-header-float` | `{colors.stable-white-90}` | `{colors.stable-grey-800-80}` |
| `bg-header` | `{colors.stable-white-100}` | `{colors.stable-grey-800}` |
| `bg-navi` | `{colors.stable-grey-100-80}` | `{colors.stable-grey-800-80}` |
| `bg-gnb` | `{colors.stable-grey-200-80}` | `{colors.stable-grey-700-80}` |
| `bg-white-dim-light` | `{colors.stable-white-20}` | `{colors.stable-black-20}` |
| `bg-white-dim-dark` | `{colors.stable-white-60}` | `{colors.stable-black-60}` |
| `bg-white-low` | `{colors.stable-white-100}` | `{colors.stable-grey-800}` |
| `bg-white-normal` | `{colors.stable-white-100}` | `{colors.stable-grey-900}` |
| `bg-white-high` | `{colors.stable-white-100}` | `{colors.stable-grey-700}` |

#### 기본 tier 배경·글자 겸용 색 (`bgtxt-*`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `bgtxt-absolute-white-lightest` | `{colors.stable-white-20}` | `{colors.stable-white-20}` |
| `bgtxt-absolute-white-lighter` | `{colors.stable-white-40}` | `{colors.stable-white-40}` |
| `bgtxt-absolute-white-light` | `{colors.stable-white-60}` | `{colors.stable-white-60}` |
| `bgtxt-absolute-white-normal` | `{colors.stable-white-90}` | `{colors.stable-white-90}` |
| `bgtxt-absolute-white-dark` | `{colors.stable-white-100}` | `{colors.stable-white-100}` |
| `bgtxt-absolute-black-lightest` | `{colors.stable-black-20}` | `{colors.stable-black-20}` |
| `bgtxt-absolute-black-lighter` | `{colors.stable-black-40}` | `{colors.stable-black-40}` |
| `bgtxt-absolute-black-light` | `{colors.stable-black-60}` | `{colors.stable-black-60}` |
| `bgtxt-absolute-black-normal` | `{colors.stable-black-85}` | `{colors.stable-black-85}` |
| `bgtxt-absolute-black-dark` | `{colors.stable-black-100}` | `{colors.stable-black-100}` |
| `bgtxt-navy-lightest` | `{colors.stable-navy-400-10}` | `{colors.stable-navy-300-20}` |
| `bgtxt-navy-lighter` | `{colors.stable-navy-400-20}` | `{colors.stable-navy-300-30}` |
| `bgtxt-navy-light` | `{colors.stable-navy-400-30}` | `{colors.stable-navy-300-40}` |
| `bgtxt-navy-normal` | `{colors.stable-navy-400}` | `{colors.stable-navy-300}` |
| `bgtxt-navy-dark` | `{colors.stable-navy-500}` | `{colors.stable-navy-400}` |
| `bgtxt-purple-lightest` | `{colors.stable-purple-400-10}` | `{colors.stable-purple-300-20}` |
| `bgtxt-purple-lighter` | `{colors.stable-purple-400-20}` | `{colors.stable-purple-300-30}` |
| `bgtxt-purple-light` | `{colors.stable-purple-400-30}` | `{colors.stable-purple-300-40}` |
| `bgtxt-purple-normal` | `{colors.stable-purple-400}` | `{colors.stable-purple-300}` |
| `bgtxt-purple-dark` | `{colors.stable-purple-500}` | `{colors.stable-purple-400}` |
| `bgtxt-pink-lightest` | `{colors.stable-pink-400-10}` | `{colors.stable-pink-300-20}` |
| `bgtxt-pink-lighter` | `{colors.stable-pink-400-20}` | `{colors.stable-pink-300-30}` |
| `bgtxt-pink-light` | `{colors.stable-pink-400-30}` | `{colors.stable-pink-300-40}` |
| `bgtxt-pink-normal` | `{colors.stable-pink-400}` | `{colors.stable-pink-300}` |
| `bgtxt-pink-dark` | `{colors.stable-pink-500}` | `{colors.stable-pink-400}` |
| `bgtxt-red-lightest` | `{colors.stable-red-400-10}` | `{colors.stable-red-300-20}` |
| `bgtxt-red-lighter` | `{colors.stable-red-400-20}` | `{colors.stable-red-300-30}` |
| `bgtxt-red-light` | `{colors.stable-red-400-30}` | `{colors.stable-red-300-40}` |
| `bgtxt-red-normal` | `{colors.stable-red-400}` | `{colors.stable-red-300}` |
| `bgtxt-red-dark` | `{colors.stable-red-500}` | `{colors.stable-red-400}` |
| `bgtxt-orange-lightest` | `{colors.stable-orange-400-10}` | `{colors.stable-orange-300-20}` |
| `bgtxt-orange-lighter` | `{colors.stable-orange-400-20}` | `{colors.stable-orange-300-30}` |
| `bgtxt-orange-light` | `{colors.stable-orange-400-30}` | `{colors.stable-orange-300-40}` |
| `bgtxt-orange-normal` | `{colors.stable-orange-400}` | `{colors.stable-orange-300}` |
| `bgtxt-orange-dark` | `{colors.stable-orange-500}` | `{colors.stable-orange-400}` |
| `bgtxt-yellow-lightest` | `{colors.stable-yellow-400-10}` | `{colors.stable-yellow-300-20}` |
| `bgtxt-yellow-lighter` | `{colors.stable-yellow-400-20}` | `{colors.stable-yellow-300-30}` |
| `bgtxt-yellow-light` | `{colors.stable-yellow-400-30}` | `{colors.stable-yellow-300-40}` |
| `bgtxt-yellow-normal` | `{colors.stable-yellow-400}` | `{colors.stable-yellow-300}` |
| `bgtxt-yellow-dark` | `{colors.stable-yellow-500}` | `{colors.stable-yellow-400}` |
| `bgtxt-olive-lightest` | `{colors.stable-olive-400-10}` | `{colors.stable-olive-300-20}` |
| `bgtxt-olive-lighter` | `{colors.stable-olive-400-20}` | `{colors.stable-olive-300-30}` |
| `bgtxt-olive-light` | `{colors.stable-olive-400-30}` | `{colors.stable-olive-300-40}` |
| `bgtxt-olive-normal` | `{colors.stable-olive-400}` | `{colors.stable-olive-300}` |
| `bgtxt-olive-dark` | `{colors.stable-olive-500}` | `{colors.stable-olive-400}` |
| `bgtxt-green-lightest` | `{colors.stable-green-400-10}` | `{colors.stable-green-300-20}` |
| `bgtxt-green-lighter` | `{colors.stable-green-400-20}` | `{colors.stable-green-300-30}` |
| `bgtxt-green-light` | `{colors.stable-green-400-30}` | `{colors.stable-green-300-40}` |
| `bgtxt-green-normal` | `{colors.stable-green-400}` | `{colors.stable-green-300}` |
| `bgtxt-green-dark` | `{colors.stable-green-500}` | `{colors.stable-green-400}` |
| `bgtxt-teal-lightest` | `{colors.stable-teal-400-10}` | `{colors.stable-teal-300-20}` |
| `bgtxt-teal-lighter` | `{colors.stable-teal-400-20}` | `{colors.stable-teal-300-30}` |
| `bgtxt-teal-light` | `{colors.stable-teal-400-30}` | `{colors.stable-teal-300-40}` |
| `bgtxt-teal-normal` | `{colors.stable-teal-400}` | `{colors.stable-teal-300}` |
| `bgtxt-teal-dark` | `{colors.stable-teal-500}` | `{colors.stable-teal-400}` |
| `bgtxt-cobalt-lightest` | `{colors.stable-cobalt-400-10}` | `{colors.stable-cobalt-300-20}` |
| `bgtxt-cobalt-lighter` | `{colors.stable-cobalt-400-20}` | `{colors.stable-cobalt-300-30}` |
| `bgtxt-cobalt-light` | `{colors.stable-cobalt-400-30}` | `{colors.stable-cobalt-300-40}` |
| `bgtxt-cobalt-normal` | `{colors.stable-cobalt-400}` | `{colors.stable-cobalt-300}` |
| `bgtxt-cobalt-dark` | `{colors.stable-cobalt-500}` | `{colors.stable-cobalt-400}` |
| `bgtxt-blue-lightest` | `{colors.stable-blue-400-10}` | `{colors.stable-blue-300-20}` |
| `bgtxt-blue-lighter` | `{colors.stable-blue-400-20}` | `{colors.stable-blue-300-30}` |
| `bgtxt-blue-light` | `{colors.stable-blue-400-30}` | `{colors.stable-blue-300-40}` |
| `bgtxt-blue-normal` | `{colors.stable-blue-400}` | `{colors.stable-blue-300}` |
| `bgtxt-blue-dark` | `{colors.stable-blue-500}` | `{colors.stable-blue-400}` |

#### 기본 tier 보더 (`bdr-*`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `bdr-white` | `{colors.stable-white-100}` | `{colors.stable-grey-700}` |
| `bdr-grey-light` | `{colors.stable-grey-200}` | `{colors.stable-grey-700}` |
| `bdr-black-lightest` | `{colors.stable-black-3}` | `{colors.stable-white-5}` |
| `bdr-black-light` | `{colors.stable-black-8}` | `{colors.stable-white-12}` |
| `bdr-black-dark` | `{colors.stable-black-15}` | `{colors.stable-white-20}` |

#### 기본 tier 그림자 색 (`shdw-*`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `shdw-inner-base` | `{colors.stable-white-12}` | `{colors.stable-white-8}` |
| `shdw-base` | `{colors.stable-black-5}` | `{colors.stable-black-8}` |
| `shdw-small` | `{colors.stable-black-8}` | `{colors.stable-black-15}` |
| `shdw-medium` | `{colors.stable-black-15}` | `{colors.stable-black-20}` |
| `shdw-large` | `{colors.stable-black-22}` | `{colors.stable-black-40}` |
| `shdw-xlarge` | `{colors.stable-black-30}` | `{colors.stable-black-60}` |

#### beta tier 텍스트 (`text-*`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `text-action` | `{colors.blue-400}` | `{colors.blue-300}` |
| `text-success` | `{colors.green-400}` | `{colors.green-300}` |
| `text-highlight` | `{colors.cobalt-400}` | `{colors.cobalt-300}` |
| `text-warning` | `{colors.orange-400}` | `{colors.orange-300}` |
| `text-critical` | `{colors.red-400}` | `{colors.red-300}` |
| `text-neutral-heaviest` | `{colors.black-100}` | `{colors.white-100}` |
| `text-neutral` | `{colors.black-85}` | `{colors.white-80}` |
| `text-neutral-light` | `{colors.black-60}` | `{colors.white-60}` |
| `text-neutral-lighter` | `{colors.black-40}` | `{colors.white-40}` |
| `text-accent-blue` | `{colors.blue-400}` | `{colors.blue-300}` |
| `text-accent-cobalt` | `{colors.cobalt-400}` | `{colors.cobalt-300}` |
| `text-accent-green` | `{colors.green-400}` | `{colors.green-300}` |
| `text-accent-red` | `{colors.red-400}` | `{colors.red-300}` |
| `text-accent-orange` | `{colors.orange-400}` | `{colors.orange-300}` |
| `text-accent-yellow` | `{colors.yellow-400}` | `{colors.yellow-300}` |
| `text-accent-olive` | `{colors.olive-300}` | `{colors.olive-300}` |
| `text-accent-teal` | `{colors.teal-400}` | `{colors.teal-300}` |
| `text-accent-navy` | `{colors.navy-400}` | `{colors.navy-300}` |
| `text-accent-purple` | `{colors.purple-400}` | `{colors.purple-300}` |
| `text-accent-pink` | `{colors.pink-400}` | `{colors.pink-300}` |
| `text-absolute-white` | `{colors.white-100}` | `{colors.white-100}` |
| `text-absolute-black` | `{colors.black-100}` | `{colors.black-100}` |
| `text-inverse` | `{colors.white-100}` | `{colors.black-85}` |

#### beta tier 아이콘 (`icon-*`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `icon-action` | `{colors.blue-400}` | `{colors.blue-300}` |
| `icon-success` | `{colors.green-400}` | `{colors.green-300}` |
| `icon-highlight` | `{colors.cobalt-400}` | `{colors.cobalt-300}` |
| `icon-warning` | `{colors.orange-400}` | `{colors.orange-300}` |
| `icon-critical` | `{colors.red-400}` | `{colors.red-300}` |
| `icon-neutral` | `{colors.black-40}` | `{colors.white-40}` |
| `icon-neutral-heavy` | `{colors.black-60}` | `{colors.white-60}` |
| `icon-neutral-heavier` | `{colors.black-85}` | `{colors.white-80}` |
| `icon-accent-blue` | `{colors.blue-400}` | `{colors.blue-300}` |
| `icon-accent-cobalt` | `{colors.cobalt-400}` | `{colors.cobalt-300}` |
| `icon-accent-green` | `{colors.green-400}` | `{colors.green-300}` |
| `icon-accent-red` | `{colors.red-400}` | `{colors.red-300}` |
| `icon-accent-orange` | `{colors.orange-400}` | `{colors.orange-300}` |
| `icon-accent-yellow` | `{colors.yellow-400}` | `{colors.yellow-300}` |
| `icon-accent-olive` | `{colors.olive-400}` | `{colors.olive-300}` |
| `icon-accent-teal` | `{colors.teal-400}` | `{colors.teal-300}` |
| `icon-accent-navy` | `{colors.navy-400}` | `{colors.navy-300}` |
| `icon-accent-purple` | `{colors.purple-400}` | `{colors.purple-300}` |
| `icon-accent-pink` | `{colors.pink-400}` | `{colors.pink-300}` |
| `icon-absolute-white` | `{colors.white-100}` | `{colors.white-100}` |
| `icon-absolute-black` | `{colors.black-100}` | `{colors.black-100}` |
| `icon-inverse-heavier` | `{colors.white-100}` | `{colors.black-85}` |

#### beta tier 채움 (`fill-*`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `fill-neutral` | `{colors.black-8}` | `{colors.white-12}` |
| `fill-neutral-heaviest` | `{colors.black-85}` | `{colors.white-100}` |
| `fill-neutral-heavier` | `{colors.black-40}` | `{colors.white-40}` |
| `fill-neutral-heavy` | `{colors.black-15}` | `{colors.white-20}` |
| `fill-neutral-light` | `{colors.black-5}` | `{colors.white-8}` |
| `fill-neutral-lighter` | `{colors.black-3}` | `{colors.white-5}` |
| `fill-neutral-lightest` | `{colors.black-1}` | `{colors.white-3}` |
| `fill-neutral-transparent` | `{colors.black-0}` | `{colors.white-0}` |
| `fill-action` | `{colors.blue-400}` | `{colors.blue-300}` |
| `fill-action-light` | `{colors.blue-400-20}` | `{colors.blue-300-30}` |
| `fill-action-lighter` | `{colors.blue-400-10}` | `{colors.blue-300-18}` |
| `fill-action-transparent` | `{colors.blue-400-0}` | `{colors.blue-300-0}` |
| `fill-success` | `{colors.green-400}` | `{colors.green-300}` |
| `fill-success-light` | `{colors.green-400-20}` | `{colors.green-300-30}` |
| `fill-success-lighter` | `{colors.green-400-10}` | `{colors.green-300-18}` |
| `fill-success-transparent` | `{colors.green-400-0}` | `{colors.green-300-0}` |
| `fill-highlight` | `{colors.cobalt-400}` | `{colors.cobalt-300}` |
| `fill-highlight-light` | `{colors.cobalt-400-20}` | `{colors.cobalt-300-30}` |
| `fill-highlight-lighter` | `{colors.cobalt-400-10}` | `{colors.cobalt-300-18}` |
| `fill-highlight-transparent` | `{colors.cobalt-400-0}` | `{colors.cobalt-300-0}` |
| `fill-warning` | `{colors.orange-400}` | `{colors.orange-300}` |
| `fill-warning-light` | `{colors.orange-400-20}` | `{colors.orange-300-30}` |
| `fill-warning-lighter` | `{colors.orange-400-10}` | `{colors.orange-300-18}` |
| `fill-warning-transparent` | `{colors.orange-400-0}` | `{colors.orange-300-0}` |
| `fill-critical` | `{colors.red-400}` | `{colors.red-300}` |
| `fill-critical-light` | `{colors.red-400-20}` | `{colors.red-300-30}` |
| `fill-critical-lighter` | `{colors.red-400-10}` | `{colors.red-300-18}` |
| `fill-critical-transparent` | `{colors.red-400-0}` | `{colors.red-300-0}` |
| `fill-grey-light` | `{colors.grey-25}` | `{colors.grey-900}` |
| `fill-grey` | `{colors.grey-50}` | `{colors.grey-850}` |
| `fill-grey-heavy` | `{colors.grey-100}` | `{colors.grey-800}` |
| `fill-grey-heavier` | `{colors.grey-200}` | `{colors.grey-750}` |
| `fill-accent-blue` | `{colors.blue-400-10}` | `{colors.blue-300-18}` |
| `fill-accent-blue-heavy` | `{colors.blue-400-20}` | `{colors.blue-300-30}` |
| `fill-accent-blue-heavier` | `{colors.blue-400}` | `{colors.blue-300}` |
| `fill-accent-blue-transparent` | `{colors.blue-400-0}` | `{colors.blue-300-0}` |
| `fill-accent-cobalt` | `{colors.cobalt-400-10}` | `{colors.cobalt-300-18}` |
| `fill-accent-cobalt-heavy` | `{colors.cobalt-400-20}` | `{colors.cobalt-300-30}` |
| `fill-accent-cobalt-heavier` | `{colors.cobalt-400}` | `{colors.cobalt-300}` |
| `fill-accent-cobalt-transparent` | `{colors.cobalt-400-0}` | `{colors.cobalt-300-0}` |
| `fill-accent-green` | `{colors.green-400-10}` | `{colors.green-300-18}` |
| `fill-accent-green-heavy` | `{colors.green-400-20}` | `{colors.green-300-30}` |
| `fill-accent-green-heavier` | `{colors.green-400}` | `{colors.green-300}` |
| `fill-accent-green-transparent` | `{colors.green-400-0}` | `{colors.green-300-0}` |
| `fill-accent-red` | `{colors.red-400-10}` | `{colors.red-300-18}` |
| `fill-accent-red-heavy` | `{colors.red-400-20}` | `{colors.red-300-30}` |
| `fill-accent-red-heavier` | `{colors.red-400}` | `{colors.red-300}` |
| `fill-accent-red-transparent` | `{colors.red-400-0}` | `{colors.red-300-0}` |
| `fill-accent-orange` | `{colors.orange-400-10}` | `{colors.orange-300-18}` |
| `fill-accent-orange-heavy` | `{colors.orange-400-20}` | `{colors.orange-300-30}` |
| `fill-accent-orange-heavier` | `{colors.orange-400}` | `{colors.orange-300}` |
| `fill-accent-orange-transparent` | `{colors.orange-400-0}` | `{colors.orange-300-0}` |
| `fill-accent-yellow` | `{colors.yellow-400-10}` | `{colors.yellow-300-18}` |
| `fill-accent-yellow-heavy` | `{colors.yellow-400-20}` | `{colors.yellow-300-30}` |
| `fill-accent-yellow-heavier` | `{colors.yellow-400}` | `{colors.yellow-300}` |
| `fill-accent-yellow-transparent` | `{colors.yellow-400-0}` | `{colors.yellow-300-0}` |
| `fill-accent-olive` | `{colors.olive-400-10}` | `{colors.olive-300-18}` |
| `fill-accent-olive-heavy` | `{colors.olive-400-20}` | `{colors.olive-300-30}` |
| `fill-accent-olive-heavier` | `{colors.olive-400}` | `{colors.olive-300}` |
| `fill-accent-olive-transparent` | `{colors.olive-400-0}` | `{colors.olive-300-0}` |
| `fill-accent-teal` | `{colors.teal-400-10}` | `{colors.teal-300-18}` |
| `fill-accent-teal-heavy` | `{colors.teal-400-20}` | `{colors.teal-300-30}` |
| `fill-accent-teal-heavier` | `{colors.teal-400}` | `{colors.teal-300}` |
| `fill-accent-teal-transparent` | `{colors.teal-400-0}` | `{colors.teal-300-0}` |
| `fill-accent-navy` | `{colors.navy-400-10}` | `{colors.navy-300-18}` |
| `fill-accent-navy-heavy` | `{colors.navy-400-20}` | `{colors.navy-300-30}` |
| `fill-accent-navy-heavier` | `{colors.navy-400}` | `{colors.navy-300}` |
| `fill-accent-navy-transparent` | `{colors.navy-400-0}` | `{colors.navy-300-0}` |
| `fill-accent-purple` | `{colors.purple-400-10}` | `{colors.purple-300-18}` |
| `fill-accent-purple-heavy` | `{colors.purple-400-20}` | `{colors.purple-300-30}` |
| `fill-accent-purple-heavier` | `{colors.purple-400}` | `{colors.purple-300}` |
| `fill-accent-purple-transparent` | `{colors.purple-400-0}` | `{colors.purple-300-0}` |
| `fill-accent-pink` | `{colors.pink-400-10}` | `{colors.pink-300-18}` |
| `fill-accent-pink-heavy` | `{colors.pink-400-20}` | `{colors.pink-300-30}` |
| `fill-accent-pink-heavier` | `{colors.pink-400}` | `{colors.pink-300}` |
| `fill-accent-pink-transparent` | `{colors.pink-400-0}` | `{colors.pink-300-0}` |
| `fill-absolute-white` | `{colors.white-100}` | `{colors.white-100}` |
| `fill-absolute-white-light` | `{colors.white-20}` | `{colors.white-20}` |
| `fill-absolute-white-transparent` | `{colors.white-0}` | `{colors.white-0}` |
| `fill-absolute-black` | `{colors.black-100}` | `{colors.black-100}` |
| `fill-absolute-black-light` | `{colors.black-20}` | `{colors.black-20}` |
| `fill-absolute-black-transparent` | `{colors.black-0}` | `{colors.black-0}` |
| `fill-bright` | `{colors.grey-25}` | `{colors.grey-650}` |

#### beta tier 보더 (`border-*`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `border-neutral` | `{colors.black-8}` | `{colors.white-12}` |
| `border-neutral-heavy` | `{colors.black-15}` | `{colors.white-20}` |
| `border-neutral-heavier` | `{colors.black-40}` | `{colors.white-40}` |
| `border-detach` | `{colors.white-100}` | `{colors.grey-900}` |
| `border-detach-highest` | `{colors.white-100}` | `{colors.grey-750}` |
| `border-detach-higher` | `{colors.white-100}` | `{colors.grey-800}` |
| `border-detach-high` | `{colors.white-100}` | `{colors.grey-850}` |
| `border-detach-low` | `{colors.grey-50}` | `{colors.grey-950}` |
| `border-absolute-white` | `{colors.white-100}` | `{colors.white-100}` |

#### beta tier 표면 (`surface`·`surface-*`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `surface` | `{colors.white-100}` | `{colors.grey-900}` |
| `surface-highest` | `{colors.white-100}` | `{colors.grey-750}` |
| `surface-higher` | `{colors.white-100}` | `{colors.grey-800}` |
| `surface-high` | `{colors.white-100}` | `{colors.grey-850}` |
| `surface-low` | `{colors.grey-50}` | `{colors.grey-950}` |
| `surface-glass` | `{colors.white-90}` | `{colors.grey-800-90}` |
| `surface-glass-highest` | `{colors.grey-200-90}` | `{colors.grey-750-90}` |
| `surface-glass-higher` | `{colors.grey-100-90}` | `{colors.grey-800-90}` |
| `surface-glass-high` | `{colors.white-90}` | `{colors.grey-850-90}` |

#### beta tier 딤·그라디언트·입력 상태·그림자 색 (`dim-*`·`gradient-*`·`state-*`·`elevation-*`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `dim-absolute-black` | `{colors.black-40}` | `{colors.black-40}` |
| `dim-absolute-black-heavy` | `{colors.black-60}` | `{colors.black-60}` |
| `dim-absolute-white` | `{colors.white-40}` | `{colors.white-40}` |
| `dim-absolute-white-heavy` | `{colors.white-60}` | `{colors.white-60}` |
| `gradient-green` | `{colors.green-400}` | `{colors.green-400}` |
| `gradient-green-heavy` | `{colors.green-300}` | `{colors.green-300}` |
| `state-default` | `{colors.black-15}` | `{colors.white-20}` |
| `state-action` | `{colors.blue-400}` | `{colors.blue-300}` |
| `state-action-light` | `{colors.blue-400-30}` | `{colors.blue-300-45}` |
| `state-warning` | `{colors.orange-400}` | `{colors.orange-300}` |
| `state-warning-light` | `{colors.orange-400-30}` | `{colors.orange-300-30}` |
| `elevation-xlarge` | `{colors.black-30}` | `{colors.black-30}` |
| `elevation-large` | `{colors.black-22}` | `{colors.black-22}` |
| `elevation-medium` | `{colors.black-15}` | `{colors.black-15}` |
| `elevation-small` | `{colors.black-8}` | `{colors.black-8}` |
| `elevation-base` | `{colors.black-5}` | `{colors.black-5}` |
| `elevation-base-inner` | `{colors.white-12}` | `{colors.white-12}` |

#### beta tier hover 상태 — 상류가 hex 를 직접 적은 역할 (`*-hovered`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `text-action-hovered` | #5146e4ff ≈ `oklch(0.511 0.228 278)` | #9698ffff ≈ `oklch(0.722 0.148 281)` |
| `text-success-hovered` | #219c50ff ≈ `oklch(0.610 0.153 151)` | #5cce7cff ≈ `oklch(0.765 0.157 150)` |
| `text-highlight-hovered` | #2589ddff ≈ `oklch(0.616 0.155 249)` | #6cb8f5ff ≈ `oklch(0.758 0.116 244)` |
| `text-warning-hovered` | #df751fff ≈ `oklch(0.672 0.159 53)` | #f8a45cff ≈ `oklch(0.788 0.133 60)` |
| `text-critical-hovered` | #da444fff ≈ `oklch(0.604 0.186 21)` | #f87979ff ≈ `oklch(0.723 0.156 22)` |
| `text-neutral-heaviest-hovered` | #1c1c1cff ≈ `oklch(0.226 0 0)` | #edededff ≈ `oklch(0.946 0 0)` |
| `text-neutral-hovered` | #1c1c1cd9 ≈ `oklch(0.226 0 0 / 0.85)` | #edededcc ≈ `oklch(0.946 0 0 / 0.80)` |
| `text-neutral-light-hovered` | #1c1c1c99 ≈ `oklch(0.226 0 0 / 0.60)` | #ededed99 ≈ `oklch(0.946 0 0 / 0.60)` |
| `text-neutral-lighter-hovered` | #1c1c1c66 ≈ `oklch(0.226 0 0 / 0.40)` | #ededed66 ≈ `oklch(0.946 0 0 / 0.40)` |
| `text-accent-blue-hovered` | #5146e4ff ≈ `oklch(0.511 0.228 278)` | #9698ffff ≈ `oklch(0.722 0.148 281)` |
| `text-accent-cobalt-hovered` | #2589ddff ≈ `oklch(0.616 0.155 249)` | #6cb8f5ff ≈ `oklch(0.758 0.116 244)` |
| `text-accent-green-hovered` | #219c50ff ≈ `oklch(0.610 0.153 151)` | #5cce7cff ≈ `oklch(0.765 0.157 150)` |
| `text-accent-red-hovered` | #da444fff ≈ `oklch(0.604 0.186 21)` | #f87979ff ≈ `oklch(0.723 0.156 22)` |
| `text-accent-orange-hovered` | #df751fff ≈ `oklch(0.672 0.159 53)` | #f8a45cff ≈ `oklch(0.788 0.133 60)` |
| `text-accent-yellow-hovered` | #d9a010ff ≈ `oklch(0.740 0.150 82)` | #f7c736ff ≈ `oklch(0.849 0.159 89)` |
| `text-accent-olive-hovered` | #a7b328ff ≈ `oklch(0.733 0.154 115)` | #ccdb25ff ≈ `oklch(0.852 0.185 115)` |
| `text-accent-teal-hovered` | #08a5a0ff ≈ `oklch(0.652 0.111 191)` | #4cdccfff ≈ `oklch(0.815 0.123 186)` |
| `text-accent-navy-hovered` | #414c9cff ≈ `oklch(0.451 0.129 274)` | #8a95d7ff ≈ `oklch(0.687 0.098 276)` |
| `text-accent-purple-hovered` | #8247e1ff ≈ `oklch(0.553 0.220 296)` | #b686ffff ≈ `oklch(0.717 0.175 300)` |
| `text-accent-pink-hovered` | #cf3eacff ≈ `oklch(0.610 0.213 339)` | #f27fdbff ≈ `oklch(0.754 0.178 335)` |
| `text-absolute-white-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #edededff ≈ `oklch(0.946 0 0)` |
| `text-absolute-black-hovered` | #1c1c1cff ≈ `oklch(0.226 0 0)` | #0a0a0aff ≈ `oklch(0.145 0 0)` |
| `text-inverse-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #0a0a0ad9 ≈ `oklch(0.145 0 0 / 0.85)` |
| `icon-action-hovered` | #5146e4ff ≈ `oklch(0.511 0.228 278)` | #9698ffff ≈ `oklch(0.722 0.148 281)` |
| `icon-success-hovered` | #219c50ff ≈ `oklch(0.610 0.153 151)` | #5cce7cff ≈ `oklch(0.765 0.157 150)` |
| `icon-highlight-hovered` | #2589ddff ≈ `oklch(0.616 0.155 249)` | #6cb8f5ff ≈ `oklch(0.758 0.116 244)` |
| `icon-warning-hovered` | #df751fff ≈ `oklch(0.672 0.159 53)` | #f8a45cff ≈ `oklch(0.788 0.133 60)` |
| `icon-critical-hovered` | #da444fff ≈ `oklch(0.604 0.186 21)` | #f87979ff ≈ `oklch(0.723 0.156 22)` |
| `icon-neutral-hovered` | #1c1c1c66 ≈ `oklch(0.226 0 0 / 0.40)` | #ededed66 ≈ `oklch(0.946 0 0 / 0.40)` |
| `icon-neutral-heavy-hovered` | #1c1c1c99 ≈ `oklch(0.226 0 0 / 0.60)` | #ededed99 ≈ `oklch(0.946 0 0 / 0.60)` |
| `icon-neutral-heavier-hovered` | #1c1c1cd9 ≈ `oklch(0.226 0 0 / 0.85)` | #edededcc ≈ `oklch(0.946 0 0 / 0.80)` |
| `icon-accent-blue-hovered` | #5146e4ff ≈ `oklch(0.511 0.228 278)` | #9698ffff ≈ `oklch(0.722 0.148 281)` |
| `icon-accent-cobalt-hovered` | #2589ddff ≈ `oklch(0.616 0.155 249)` | #6cb8f5ff ≈ `oklch(0.758 0.116 244)` |
| `icon-accent-green-hovered` | #219c50ff ≈ `oklch(0.610 0.153 151)` | #5cce7cff ≈ `oklch(0.765 0.157 150)` |
| `icon-accent-red-hovered` | #da444fff ≈ `oklch(0.604 0.186 21)` | #f87979ff ≈ `oklch(0.723 0.156 22)` |
| `icon-accent-orange-hovered` | #df751fff ≈ `oklch(0.672 0.159 53)` | #f8a45cff ≈ `oklch(0.788 0.133 60)` |
| `icon-accent-yellow-hovered` | #d9a010ff ≈ `oklch(0.740 0.150 82)` | #f7c736ff ≈ `oklch(0.849 0.159 89)` |
| `icon-accent-olive-hovered` | #9ba212ff ≈ `oklch(0.684 0.148 113)` | #ccdb25ff ≈ `oklch(0.852 0.185 115)` |
| `icon-accent-teal-hovered` | #08a5a0ff ≈ `oklch(0.652 0.111 191)` | #4cdccfff ≈ `oklch(0.815 0.123 186)` |
| `icon-accent-navy-hovered` | #414c9cff ≈ `oklch(0.451 0.129 274)` | #8a95d7ff ≈ `oklch(0.687 0.098 276)` |
| `icon-accent-purple-hovered` | #8247e1ff ≈ `oklch(0.553 0.220 296)` | #b686ffff ≈ `oklch(0.717 0.175 300)` |
| `icon-accent-pink-hovered` | #cf3eacff ≈ `oklch(0.610 0.213 339)` | #f27fdbff ≈ `oklch(0.754 0.178 335)` |
| `icon-absolute-white-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #edededff ≈ `oklch(0.946 0 0)` |
| `icon-absolute-black-hovered` | #1c1c1cff ≈ `oklch(0.226 0 0)` | #0a0a0aff ≈ `oklch(0.145 0 0)` |
| `icon-inverse-heavier-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #0a0a0ad9 ≈ `oklch(0.145 0 0 / 0.85)` |
| `fill-neutral-hovered` | #1c1c1c1e ≈ `oklch(0.226 0 0 / 0.12)` | #ededed2f ≈ `oklch(0.946 0 0 / 0.18)` |
| `fill-neutral-heaviest-hovered` | #1c1c1cd9 ≈ `oklch(0.226 0 0 / 0.85)` | #edededff ≈ `oklch(0.946 0 0)` |
| `fill-neutral-heavier-hovered` | #1c1c1c66 ≈ `oklch(0.226 0 0 / 0.40)` | #ededed66 ≈ `oklch(0.946 0 0 / 0.40)` |
| `fill-neutral-heavy-hovered` | #1c1c1c39 ≈ `oklch(0.226 0 0 / 0.22)` | #ededed4d ≈ `oklch(0.946 0 0 / 0.30)` |
| `fill-neutral-light-hovered` | #1c1c1c14 ≈ `oklch(0.226 0 0 / 0.08)` | #ededed1e ≈ `oklch(0.946 0 0 / 0.12)` |
| `fill-neutral-lighter-hovered` | #1c1c1c0c ≈ `oklch(0.226 0 0 / 0.05)` | #ededed14 ≈ `oklch(0.946 0 0 / 0.08)` |
| `fill-neutral-lightest-hovered` | #1c1c1c05 ≈ `oklch(0.226 0 0 / 0.02)` | #ededed0c ≈ `oklch(0.946 0 0 / 0.05)` |
| `fill-neutral-transparent-hovered` | #0000000d ≈ `oklch(0 0 0 / 0.05)` — hex 가 원시값 `black-5` 그대로, 참조 아님 | #ffffff0d ≈ `oklch(1 0 0 / 0.05)` — hex 가 원시값 `white-5` 그대로, 참조 아님 |
| `fill-action-hovered` | #5146e4ff ≈ `oklch(0.511 0.228 278)` | #9698ffff ≈ `oklch(0.722 0.148 281)` |
| `fill-action-light-hovered` | #5146e44d ≈ `oklch(0.511 0.228 278 / 0.30)` | #8184ff4d ≈ `oklch(0.669 0.178 279 / 0.30)` |
| `fill-action-lighter-hovered` | #5146e427 ≈ `oklch(0.511 0.228 278 / 0.15)` | #8184ff45 ≈ `oklch(0.669 0.178 279 / 0.27)` |
| `fill-action-transparent-hovered` | #6157ea1a ≈ `oklch(0.554 0.214 280 / 0.10)` — hex 가 원시값 `blue-400-10` 그대로, 참조 아님 | #6b6eff1a ≈ `oklch(0.615 0.211 277 / 0.10)` — hex 가 상류 원시값 `blue-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-success-hovered` | #219c50ff ≈ `oklch(0.610 0.153 151)` | #5cce7cff ≈ `oklch(0.765 0.157 150)` |
| `fill-success-light-hovered` | #219c504d ≈ `oklch(0.610 0.153 151 / 0.30)` | #56cc774d ≈ `oklch(0.757 0.161 150 / 0.30)` |
| `fill-success-lighter-hovered` | #219c5027 ≈ `oklch(0.610 0.153 151 / 0.15)` | #56cc7745 ≈ `oklch(0.757 0.161 150 / 0.27)` |
| `fill-success-transparent-hovered` | #20ab551a ≈ `oklch(0.652 0.168 150 / 0.10)` — hex 가 원시값 `green-400-10` 그대로, 참조 아님 | #4bc16c1a ≈ `oklch(0.724 0.162 150 / 0.10)` — hex 가 상류 원시값 `green-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-highlight-hovered` | #2589ddff ≈ `oklch(0.616 0.155 249)` | #6cb8f5ff ≈ `oklch(0.758 0.116 244)` |
| `fill-highlight-light-hovered` | #2589dd4d ≈ `oklch(0.616 0.155 249 / 0.30)` | #6cb8f54d ≈ `oklch(0.758 0.116 244 / 0.30)` |
| `fill-highlight-lighter-hovered` | #2589dd27 ≈ `oklch(0.616 0.155 249 / 0.15)` | #6cb8f545 ≈ `oklch(0.758 0.116 244 / 0.27)` |
| `fill-highlight-transparent-hovered` | #3292e31a ≈ `oklch(0.643 0.150 248 / 0.10)` — hex 가 원시값 `cobalt-400-10` 그대로, 참조 아님 | #5cadef1a ≈ `oklch(0.724 0.125 245 / 0.10)` — hex 가 상류 원시값 `cobalt-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-warning-hovered` | #df751fff ≈ `oklch(0.672 0.159 53)` | #f8a45cff ≈ `oklch(0.788 0.133 60)` |
| `fill-warning-light-hovered` | #df751f4d ≈ `oklch(0.672 0.159 53 / 0.30)` | #f8a45c4d ≈ `oklch(0.788 0.133 60 / 0.30)` |
| `fill-warning-lighter-hovered` | #df751f27 ≈ `oklch(0.672 0.159 53 / 0.15)` | #f8a45c45 ≈ `oklch(0.788 0.133 60 / 0.27)` |
| `fill-warning-transparent-hovered` | #e67f2b1a ≈ `oklch(0.698 0.156 55 / 0.10)` — hex 가 원시값 `orange-400-10` 그대로, 참조 아님 | #f798471a ≈ `oklch(0.764 0.148 58 / 0.10)` — hex 가 상류 원시값 `orange-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-critical-hovered` | #da444fff ≈ `oklch(0.604 0.186 21)` | #f87979ff ≈ `oklch(0.723 0.156 22)` |
| `fill-critical-light-hovered` | #da444f4d ≈ `oklch(0.604 0.186 21 / 0.30)` | #f771714d ≈ `oklch(0.709 0.165 22 / 0.30)` |
| `fill-critical-lighter-hovered` | #da444f27 ≈ `oklch(0.604 0.186 21 / 0.15)` | #f7717145 ≈ `oklch(0.709 0.165 22 / 0.27)` |
| `fill-critical-transparent-hovered` | #e1535d1a ≈ `oklch(0.634 0.177 20 / 0.10)` — hex 가 원시값 `red-400-10` 그대로, 참조 아님 | #f260601a ≈ `oklch(0.677 0.180 23 / 0.10)` — hex 가 상류 원시값 `red-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-grey-light-hovered` | #d9d9ffff ≈ `oklch(0.897 0.052 285)` | #27272bff ≈ `oklch(0.274 0.007 286)` |
| `fill-grey-hovered` | #e9e9e9ff ≈ `oklch(0.934 0 0)` | #2e2e31ff ≈ `oklch(0.302 0.005 286)` |
| `fill-grey-heavy-hovered` | #e5e5e8ff ≈ `oklch(0.923 0.004 286)` | #333338ff ≈ `oklch(0.323 0.009 286)` |
| `fill-grey-heavier-hovered` | #dedee0ff ≈ `oklch(0.901 0.003 286)` | #3b3b40ff ≈ `oklch(0.354 0.009 286)` |
| `fill-accent-blue-hovered` | #5146e427 ≈ `oklch(0.511 0.228 278 / 0.15)` | #8184ff45 ≈ `oklch(0.669 0.178 279 / 0.27)` |
| `fill-accent-blue-heavy-hovered` | #5146e44d ≈ `oklch(0.511 0.228 278 / 0.30)` | #8184ff4d ≈ `oklch(0.669 0.178 279 / 0.30)` |
| `fill-accent-blue-heavier-hovered` | #5146e4ff ≈ `oklch(0.511 0.228 278)` | #9698ffff ≈ `oklch(0.722 0.148 281)` |
| `fill-accent-blue-transparent-hovered` | #6157ea1a ≈ `oklch(0.554 0.214 280 / 0.10)` — hex 가 원시값 `blue-400-10` 그대로, 참조 아님 | #6b6eff1a ≈ `oklch(0.615 0.211 277 / 0.10)` — hex 가 상류 원시값 `blue-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-accent-cobalt-hovered` | #2589dd27 ≈ `oklch(0.616 0.155 249 / 0.15)` | #6cb8f545 ≈ `oklch(0.758 0.116 244 / 0.27)` |
| `fill-accent-cobalt-heavy-hovered` | #2589dd4d ≈ `oklch(0.616 0.155 249 / 0.30)` | #6cb8f54d ≈ `oklch(0.758 0.116 244 / 0.30)` |
| `fill-accent-cobalt-heavier-hovered` | #2589ddff ≈ `oklch(0.616 0.155 249)` | #6cb8f5ff ≈ `oklch(0.758 0.116 244)` |
| `fill-accent-cobalt-transparent-hovered` | #3292e31a ≈ `oklch(0.643 0.150 248 / 0.10)` — hex 가 원시값 `cobalt-400-10` 그대로, 참조 아님 | #5cadef1a ≈ `oklch(0.724 0.125 245 / 0.10)` — hex 가 상류 원시값 `cobalt-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-accent-green-hovered` | #219c5027 ≈ `oklch(0.610 0.153 151 / 0.15)` | #56cc7745 ≈ `oklch(0.757 0.161 150 / 0.27)` |
| `fill-accent-green-heavy-hovered` | #219c504d ≈ `oklch(0.610 0.153 151 / 0.30)` | #56cc774d ≈ `oklch(0.757 0.161 150 / 0.30)` |
| `fill-accent-green-heavier-hovered` | #219c50ff ≈ `oklch(0.610 0.153 151)` | #5cce7cff ≈ `oklch(0.765 0.157 150)` |
| `fill-accent-green-transparent-hovered` | #20ab551a ≈ `oklch(0.652 0.168 150 / 0.10)` — hex 가 원시값 `green-400-10` 그대로, 참조 아님 | #4bc16c1a ≈ `oklch(0.724 0.162 150 / 0.10)` — hex 가 상류 원시값 `green-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-accent-red-hovered` | #da444f27 ≈ `oklch(0.604 0.186 21 / 0.15)` | #f7717145 ≈ `oklch(0.709 0.165 22 / 0.27)` |
| `fill-accent-red-heavy-hovered` | #da444f4d ≈ `oklch(0.604 0.186 21 / 0.30)` | #f771714d ≈ `oklch(0.709 0.165 22 / 0.30)` |
| `fill-accent-red-heavier-hovered` | #da444fff ≈ `oklch(0.604 0.186 21)` | #f87979ff ≈ `oklch(0.723 0.156 22)` |
| `fill-accent-red-transparent-hovered` | #e1535d1a ≈ `oklch(0.634 0.177 20 / 0.10)` — hex 가 원시값 `red-400-10` 그대로, 참조 아님 | #f260601a ≈ `oklch(0.677 0.180 23 / 0.10)` — hex 가 상류 원시값 `red-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-accent-orange-hovered` | #df751f27 ≈ `oklch(0.672 0.159 53 / 0.15)` | #f8a45c45 ≈ `oklch(0.788 0.133 60 / 0.27)` |
| `fill-accent-orange-heavy-hovered` | #df751f4d ≈ `oklch(0.672 0.159 53 / 0.30)` | #f8a45c4d ≈ `oklch(0.788 0.133 60 / 0.30)` |
| `fill-accent-orange-heavier-hovered` | #df751fff ≈ `oklch(0.672 0.159 53)` | #f8a45cff ≈ `oklch(0.788 0.133 60)` |
| `fill-accent-orange-transparent-hovered` | #e67f2b1a ≈ `oklch(0.698 0.156 55 / 0.10)` — hex 가 원시값 `orange-400-10` 그대로, 참조 아님 | #f798471a ≈ `oklch(0.764 0.148 58 / 0.10)` — hex 가 상류 원시값 `orange-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-accent-yellow-hovered` | #d9a01027 ≈ `oklch(0.740 0.150 82 / 0.15)` | #f7c73645 ≈ `oklch(0.849 0.159 89 / 0.27)` |
| `fill-accent-yellow-heavy-hovered` | #d9a0104d ≈ `oklch(0.740 0.150 82 / 0.30)` | #f7c7364d ≈ `oklch(0.849 0.159 89 / 0.30)` |
| `fill-accent-yellow-heavier-hovered` | #d9a010ff ≈ `oklch(0.740 0.150 82)` | #f7c736ff ≈ `oklch(0.849 0.159 89)` |
| `fill-accent-yellow-transparent-hovered` | #edae0d1a ≈ `oklch(0.789 0.161 82 / 0.10)` — hex 가 원시값 `yellow-400-10` 그대로, 참조 아님 | #f0be271a ≈ `oklch(0.824 0.160 88 / 0.10)` — hex 가 상류 원시값 `yellow-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-accent-olive-hovered` | #9ba21227 ≈ `oklch(0.684 0.148 113 / 0.15)` | #ccdb2545 ≈ `oklch(0.852 0.185 115 / 0.27)` |
| `fill-accent-olive-heavy-hovered` | #9ba2124d ≈ `oklch(0.684 0.148 113 / 0.30)` | #ccdb254d ≈ `oklch(0.852 0.185 115 / 0.30)` |
| `fill-accent-olive-heavier-hovered` | #9ba212ff ≈ `oklch(0.684 0.148 113)` | #ccdb25ff ≈ `oklch(0.852 0.185 115)` |
| `fill-accent-olive-transparent-hovered` | #a9b1101a ≈ `oklch(0.730 0.160 113 / 0.10)` — hex 가 원시값 `olive-400-10` 그대로, 참조 아님 | #b7c4271a ≈ `oklch(0.784 0.167 115 / 0.10)` — hex 가 상류 원시값 `olive-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-accent-teal-hovered` | #08a5a027 ≈ `oklch(0.652 0.111 191 / 0.15)` | #4cdccf45 ≈ `oklch(0.815 0.123 186 / 0.27)` |
| `fill-accent-teal-heavy-hovered` | #08a5a04d ≈ `oklch(0.652 0.111 191 / 0.30)` | #4cdccf4d ≈ `oklch(0.815 0.123 186 / 0.30)` |
| `fill-accent-teal-heavier-hovered` | #08a5a0ff ≈ `oklch(0.652 0.111 191)` | #4cdccfff ≈ `oklch(0.815 0.123 186)` |
| `fill-accent-teal-transparent-hovered` | #09b2ac1a ≈ `oklch(0.690 0.118 190 / 0.10)` — hex 가 원시값 `teal-400-10` 그대로, 참조 아님 | #40d3c51a ≈ `oklch(0.787 0.123 186 / 0.10)` — hex 가 상류 원시값 `teal-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-accent-navy-hovered` | #414c9c27 ≈ `oklch(0.451 0.129 274 / 0.15)` | #7b86d345 ≈ `oklch(0.644 0.116 276 / 0.27)` |
| `fill-accent-navy-heavy-hovered` | #414c9c4d ≈ `oklch(0.451 0.129 274 / 0.30)` | #7b86d34d ≈ `oklch(0.644 0.116 276 / 0.30)` |
| `fill-accent-navy-heavier-hovered` | #414c9cff ≈ `oklch(0.451 0.129 274)` | #8a95d7ff ≈ `oklch(0.687 0.098 276)` |
| `fill-accent-navy-transparent-hovered` | #424fab1a ≈ `oklch(0.469 0.147 273 / 0.10)` — hex 가 원시값 `navy-400-10` 그대로, 참조 아님 | #6f7bc81a ≈ `oklch(0.607 0.118 276 / 0.10)` — hex 가 상류 원시값 `navy-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-accent-purple-hovered` | #8247e127 ≈ `oklch(0.553 0.220 296 / 0.15)` | #b686ff45 ≈ `oklch(0.717 0.175 300 / 0.27)` |
| `fill-accent-purple-heavy-hovered` | #8247e14d ≈ `oklch(0.553 0.220 296 / 0.30)` | #b686ff4d ≈ `oklch(0.717 0.175 300 / 0.30)` |
| `fill-accent-purple-heavier-hovered` | #8247e1ff ≈ `oklch(0.553 0.220 296)` | #b686ffff ≈ `oklch(0.717 0.175 300)` |
| `fill-accent-purple-transparent-hovered` | #8e57e71a ≈ `oklch(0.591 0.208 297 / 0.10)` — hex 가 원시값 `purple-400-10` 그대로, 참조 아님 | #a970ff1a ≈ `oklch(0.670 0.205 299 / 0.10)` — hex 가 상류 원시값 `purple-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-accent-pink-hovered` | #cf3eac27 ≈ `oklch(0.610 0.213 339 / 0.15)` | #f27fdb45 ≈ `oklch(0.754 0.178 335 / 0.27)` |
| `fill-accent-pink-heavy-hovered` | #cf3eac4d ≈ `oklch(0.610 0.213 339 / 0.30)` | #f27fdb4d ≈ `oklch(0.754 0.178 335 / 0.30)` |
| `fill-accent-pink-heavier-hovered` | #cf3eacff ≈ `oklch(0.610 0.213 339)` | #f27fdbff ≈ `oklch(0.754 0.178 335)` |
| `fill-accent-pink-transparent-hovered` | #d64bb51a ≈ `oklch(0.637 0.208 338 / 0.10)` — hex 가 원시값 `pink-400-10` 그대로, 참조 아님 | #ec6fd31a ≈ `oklch(0.722 0.192 336 / 0.10)` — hex 가 상류 원시값 `pink-300-10`(이 문서에 싣지 않은 단계) 그대로, 참조 아님 |
| `fill-absolute-white-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #edededff ≈ `oklch(0.946 0 0)` |
| `fill-absolute-white-light-hovered` | #ededed4d ≈ `oklch(0.946 0 0 / 0.30)` | #ededed4d ≈ `oklch(0.946 0 0 / 0.30)` |
| `fill-absolute-white-transparent-hovered` | #ffffff0d ≈ `oklch(1 0 0 / 0.05)` — hex 가 원시값 `white-5` 그대로, 참조 아님 | #ffffff0d ≈ `oklch(1 0 0 / 0.05)` — hex 가 원시값 `white-5` 그대로, 참조 아님 |
| `fill-absolute-black-hovered` | #1c1c1cff ≈ `oklch(0.226 0 0)` | #0a0a0aff ≈ `oklch(0.145 0 0)` |
| `fill-absolute-black-light-hovered` | #1c1c1c4d ≈ `oklch(0.226 0 0 / 0.30)` | #0a0a0a4d ≈ `oklch(0.145 0 0 / 0.30)` |
| `fill-absolute-black-transparent-hovered` | #0000000d ≈ `oklch(0 0 0 / 0.05)` — hex 가 원시값 `black-5` 그대로, 참조 아님 | #0000000d ≈ `oklch(0 0 0 / 0.05)` — hex 가 원시값 `black-5` 그대로, 참조 아님 |
| `fill-bright-hovered` | #d9d9ffff ≈ `oklch(0.897 0.052 285)` | #64646aff ≈ `oklch(0.505 0.009 286)` |
| `border-neutral-hovered` | #1c1c1c1e ≈ `oklch(0.226 0 0 / 0.12)` | #ededed2f ≈ `oklch(0.946 0 0 / 0.18)` |
| `border-neutral-heavy-hovered` | #1c1c1c39 ≈ `oklch(0.226 0 0 / 0.22)` | #ededed4d ≈ `oklch(0.946 0 0 / 0.30)` |
| `border-neutral-heavier-hovered` | #1c1c1c66 ≈ `oklch(0.226 0 0 / 0.40)` | #ededed66 ≈ `oklch(0.946 0 0 / 0.40)` |
| `border-detach-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #27272bff ≈ `oklch(0.274 0.007 286)` |
| `border-detach-highest-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #3b3b40ff ≈ `oklch(0.354 0.009 286)` |
| `border-detach-higher-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #333338ff ≈ `oklch(0.323 0.009 286)` |
| `border-detach-high-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #2e2e31ff ≈ `oklch(0.302 0.005 286)` |
| `border-detach-low-hovered` | #e9e9e9ff ≈ `oklch(0.934 0 0)` | #242427ff ≈ `oklch(0.262 0.006 286)` |
| `border-absolute-white-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #edededff ≈ `oklch(0.946 0 0)` |
| `surface-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #27272bff ≈ `oklch(0.274 0.007 286)` |
| `surface-highest-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #3b3b40ff ≈ `oklch(0.354 0.009 286)` |
| `surface-higher-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #333338ff ≈ `oklch(0.323 0.009 286)` |
| `surface-high-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #2e2e31ff ≈ `oklch(0.302 0.005 286)` |
| `surface-low-hovered` | #e9e9e9ff ≈ `oklch(0.934 0 0)` | #242427ff ≈ `oklch(0.262 0.006 286)` |
| `surface-glass-hovered` | #ededede6 ≈ `oklch(0.946 0 0 / 0.90)` | #333338e6 ≈ `oklch(0.323 0.009 286 / 0.90)` |
| `surface-glass-highest-hovered` | #dedee0e6 ≈ `oklch(0.901 0.003 286 / 0.90)` | #3b3b40e6 ≈ `oklch(0.354 0.009 286 / 0.90)` |
| `surface-glass-higher-hovered` | #e5e5e8e6 ≈ `oklch(0.923 0.004 286 / 0.90)` | #333338e6 ≈ `oklch(0.323 0.009 286 / 0.90)` |
| `surface-glass-high-hovered` | #ededede6 ≈ `oklch(0.946 0 0 / 0.90)` | #2e2e31e6 ≈ `oklch(0.302 0.005 286 / 0.90)` |
| `dim-absolute-black-hovered` | #1c1c1c66 ≈ `oklch(0.226 0 0 / 0.40)` | #0a0a0a66 ≈ `oklch(0.145 0 0 / 0.40)` |
| `dim-absolute-black-heavy-hovered` | #1c1c1c99 ≈ `oklch(0.226 0 0 / 0.60)` | #0a0a0a99 ≈ `oklch(0.145 0 0 / 0.60)` |
| `dim-absolute-white-hovered` | #ededed66 ≈ `oklch(0.946 0 0 / 0.40)` | #ededed66 ≈ `oklch(0.946 0 0 / 0.40)` |
| `dim-absolute-white-heavy-hovered` | #ededed99 ≈ `oklch(0.946 0 0 / 0.60)` | #ededed99 ≈ `oklch(0.946 0 0 / 0.60)` |
| `gradient-green-hovered` | #219c50ff ≈ `oklch(0.610 0.153 151)` | #1ec35dff ≈ `oklch(0.717 0.191 150)` |
| `gradient-green-heavy-hovered` | #46ba67ff ≈ `oklch(0.703 0.159 150)` | #5cce7cff ≈ `oklch(0.765 0.157 150)` |
| `state-default-hovered` | #1c1c1c39 ≈ `oklch(0.226 0 0 / 0.22)` | #ededed4d ≈ `oklch(0.946 0 0 / 0.30)` |
| `state-action-hovered` | #5146e4ff ≈ `oklch(0.511 0.228 278)` | #9698ffff ≈ `oklch(0.722 0.148 281)` |
| `state-action-light-hovered` | #5146e44d ≈ `oklch(0.511 0.228 278 / 0.30)` | #8184ff73 ≈ `oklch(0.669 0.178 279 / 0.45)` |
| `state-warning-hovered` | #df751fff ≈ `oklch(0.672 0.159 53)` | #f8a45cff ≈ `oklch(0.788 0.133 60)` |
| `state-warning-light-hovered` | #df751f4d ≈ `oklch(0.672 0.159 53 / 0.30)` | #f8a45c4d ≈ `oklch(0.788 0.133 60 / 0.30)` |
| `elevation-xlarge-hovered` | #1c1c1c4d ≈ `oklch(0.226 0 0 / 0.30)` | #0a0a0a4d ≈ `oklch(0.145 0 0 / 0.30)` |
| `elevation-large-hovered` | #1c1c1c38 ≈ `oklch(0.226 0 0 / 0.22)` | #0a0a0a38 ≈ `oklch(0.145 0 0 / 0.22)` |
| `elevation-medium-hovered` | #1c1c1c39 ≈ `oklch(0.226 0 0 / 0.22)` | #0a0a0a39 ≈ `oklch(0.145 0 0 / 0.22)` |
| `elevation-small-hovered` | #1c1c1c1e ≈ `oklch(0.226 0 0 / 0.12)` | #0a0a0a1e ≈ `oklch(0.145 0 0 / 0.12)` |
| `elevation-base-hovered` | #1c1c1c14 ≈ `oklch(0.226 0 0 / 0.08)` | #0a0a0a14 ≈ `oklch(0.145 0 0 / 0.08)` |
| `elevation-base-inner-hovered` | #ededed2f ≈ `oklch(0.946 0 0 / 0.18)` | #ededed2f ≈ `oklch(0.946 0 0 / 0.18)` |
| `chart-theme-default-10-hovered` | #a1cadcff ≈ `oklch(0.816 0.050 226)` | #c3e0edff ≈ `oklch(0.890 0.036 227)` |
| `chart-theme-default-01-hovered` | #6459fdff ≈ `oklch(0.574 0.234 279)` | #9088fdff ≈ `oklch(0.686 0.168 284)` |
| `chart-theme-default-02-hovered` | #70d7d5ff ≈ `oklch(0.817 0.096 194)` | #8fe7e5ff ≈ `oklch(0.872 0.085 194)` |
| `chart-theme-default-03-hovered` | #fb8169ff ≈ `oklch(0.736 0.154 32)` | #fda999ff ≈ `oklch(0.813 0.103 31)` |
| `chart-theme-default-04-hovered` | #a55363ff ≈ `oklch(0.546 0.109 9)` | #be6274ff ≈ `oklch(0.609 0.119 9)` |
| `chart-theme-default-05-hovered` | #fe57aeff ≈ `oklch(0.705 0.217 352)` | #fe87c5ff ≈ `oklch(0.772 0.160 349)` |
| `chart-theme-default-06-hovered` | #c05ee6ff ≈ `oklch(0.655 0.210 315)` | #d281f2ff ≈ `oklch(0.731 0.177 316)` |
| `chart-theme-default-07-hovered` | #3b69ddff ≈ `oklch(0.554 0.185 265)` | #5881ebff ≈ `oklch(0.626 0.166 266)` |
| `chart-theme-default-08-hovered` | #66a7fdff ≈ `oklch(0.722 0.143 256)` | #96c3fdff ≈ `oklch(0.807 0.096 255)` |
| `chart-theme-default-09-hovered` | #fa75eeff ≈ `oklch(0.759 0.214 331)` | #fca6f4ff ≈ `oklch(0.834 0.141 330)` |

#### beta tier 차트 색 — 상류가 hex 를 직접 적은 역할 (hovered 가 아닌 `chart-theme-default-*`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `chart-theme-default-10` | #b4d6e5 ≈ `oklch(0.856 0.042 226)` | #b4d6e5 ≈ `oklch(0.856 0.042 226)` |
| `chart-theme-default-01` | #7c72fd ≈ `oklch(0.633 0.200 282)` | #7c72fd ≈ `oklch(0.633 0.200 282)` |
| `chart-theme-default-02` | #81dfdd ≈ `oklch(0.845 0.090 194)` | #81dfdd ≈ `oklch(0.845 0.090 194)` |
| `chart-theme-default-03` | #fc9783 ≈ `oklch(0.777 0.126 32)` | #fc9783 ≈ `oklch(0.777 0.126 32)` |
| `chart-theme-default-04` | #b1596a ≈ `oklch(0.574 0.115 9)` | #b1596a ≈ `oklch(0.574 0.115 9)` |
| `chart-theme-default-05` | #fe71ba ≈ `oklch(0.739 0.188 350)` | #fe71ba ≈ `oklch(0.739 0.188 350)` |
| `chart-theme-default-06` | #c971ec ≈ `oklch(0.694 0.192 316)` | #c971ec ≈ `oklch(0.694 0.192 316)` |
| `chart-theme-default-07` | #4a75e3 ≈ `oklch(0.589 0.174 265)` | #4a75e3 ≈ `oklch(0.589 0.174 265)` |
| `chart-theme-default-08` | #80b6fd ≈ `oklch(0.767 0.117 256)` | #80b6fd ≈ `oklch(0.767 0.117 256)` |
| `chart-theme-default-09` | #fb90f1 ≈ `oklch(0.798 0.174 331)` | #fb90f1 ≈ `oklch(0.798 0.174 331)` |

#### alpha 엔트리

별도 `@channel.io/bezier-tokens/alpha` 엔트리(`dist/alpha`)가 세 번째 tier 다 — 이름의 alpha 는 반투명 채널이 아니라 tier 이름이다. `dist/alpha` 는 `dist/beta`, `dist/css` 와 나란한 배포 경로로, `--alpha-color-fg-*`, `--alpha-color-bg-*`, `--alpha-color-surface-*`, `--alpha-color-shadow-*` 등의 역할 층과 그 원시값을 따로 발행한다 [src:3].

아래 표의 역할 이름은 상류 CSS 이름에서 `--alpha-color-` 를 떼고 `alpha-` 를 앞붙인 것이다(`alpha-bg-grey-light` = `--alpha-color-bg-grey-light`). alpha 역할 이름 일부가 기본 tier 역할 이름과 같아(`bg-grey-light`) frontmatter 키가 겹치므로, alpha 역할은 전부 이 접두를 달고 다크 짝은 그 바깥에 `dark-` 를 단다(`dark-alpha-bg-grey-light`). 원시값도 tier 를 가르는 `alpha-` 앞붙임 키로 실려 있고(`alpha-grey-200` = `--alpha-color-grey-200`), 테마마다 다시 정의되지 않으므로 다크 칸도 접두 없는 `alpha-*` 원시값 키를 가리킨다. 칸이 참조 하나뿐이면 그 칸이 frontmatter 참조 행으로도 실려 있다.

상류가 역할을 다른 역할로 가리키면(`--alpha-color-primary-bg-normal: var(--alpha-color-bg-blue-normal)`) 그 한 단계 건너가는 참조(홉)를 끝까지 풀어 원시값에 걸지 않고 역할 참조로 싣는다. 상류는 두 테마 블록에 같은 홉을 적고 블록이 색을 고르지만, 이 문서는 키 이름이 테마를 지니므로 다크 칸은 가리킨 역할의 `dark-` 짝을 가리킨다(`dark-alpha-primary-bg-normal` → `dark-alpha-bg-blue-normal`). `alpha-critical-bg-normal` 은 상류가 배경 역할이 아니라 `fg-red-normal` 을 가리키므로 그대로 옮겼다 [src:3]. `-hovered` 역할은 상류가 두 테마 모두 hex 를 직접 적어 가리킬 팔레트 토큰이 없으므로, beta 의 hover 표처럼 상류 hex ≈ OKLCH(저장소 변환기)로 표에만 실었다.

#### alpha tier 글자색 (`alpha-fg-*`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `alpha-fg-black-pure` | `{colors.alpha-black-100}` | `{colors.alpha-white-100}` |
| `alpha-fg-black-darkest` | `{colors.alpha-black-85}` | `{colors.alpha-white-80}` |
| `alpha-fg-black-darker` | `{colors.alpha-black-60}` | `{colors.alpha-white-60}` |
| `alpha-fg-black-dark` | `{colors.alpha-black-40}` | `{colors.alpha-white-40}` |
| `alpha-fg-black-light` | `{colors.alpha-black-15}` | `{colors.alpha-white-20}` |
| `alpha-fg-black-lightest` | `{colors.alpha-black-8}` | `{colors.alpha-white-12}` |
| `alpha-fg-white-normal` | `{colors.alpha-white-100}` | `{colors.alpha-grey-900}` |
| `alpha-fg-blue-normal` | `{colors.alpha-blue-400}` | `{colors.alpha-blue-300}` |
| `alpha-fg-blue-light` | `{colors.alpha-blue-400-30}` | `{colors.alpha-blue-300-45}` |
| `alpha-fg-blue-dark` | `{colors.alpha-blue-500}` | `{colors.alpha-blue-300}` |
| `alpha-fg-cobalt-normal` | `{colors.alpha-cobalt-400}` | `{colors.alpha-cobalt-300}` |
| `alpha-fg-cobalt-light` | `{colors.alpha-cobalt-400-30}` | `{colors.alpha-cobalt-300-45}` |
| `alpha-fg-cobalt-dark` | `{colors.alpha-cobalt-500}` | `{colors.alpha-cobalt-300}` |
| `alpha-fg-red-normal` | `{colors.alpha-red-400}` | `{colors.alpha-red-300}` |
| `alpha-fg-red-light` | `{colors.alpha-red-400-30}` | `{colors.alpha-red-300-45}` |
| `alpha-fg-red-dark` | `{colors.alpha-red-500}` | `{colors.alpha-red-300}` |
| `alpha-fg-orange-normal` | `{colors.alpha-orange-400}` | `{colors.alpha-orange-300}` |
| `alpha-fg-orange-light` | `{colors.alpha-orange-400-30}` | `{colors.alpha-orange-300-45}` |
| `alpha-fg-orange-dark` | `{colors.alpha-orange-500}` | `{colors.alpha-orange-300}` |
| `alpha-fg-green-normal` | `{colors.alpha-green-400}` | `{colors.alpha-green-300}` |
| `alpha-fg-green-light` | `{colors.alpha-green-400-30}` | `{colors.alpha-green-300-45}` |
| `alpha-fg-green-dark` | `{colors.alpha-green-500}` | `{colors.alpha-green-300}` |
| `alpha-fg-teal-normal` | `{colors.alpha-teal-400}` | `{colors.alpha-teal-300}` |
| `alpha-fg-teal-light` | `{colors.alpha-teal-400-30}` | `{colors.alpha-teal-300-45}` |
| `alpha-fg-teal-dark` | `{colors.alpha-teal-500}` | `{colors.alpha-teal-300}` |
| `alpha-fg-olive-normal` | `{colors.alpha-olive-400}` | `{colors.alpha-olive-300}` |
| `alpha-fg-olive-light` | `{colors.alpha-olive-400-30}` | `{colors.alpha-olive-300-45}` |
| `alpha-fg-olive-dark` | `{colors.alpha-olive-500}` | `{colors.alpha-olive-300}` |
| `alpha-fg-yellow-normal` | `{colors.alpha-yellow-400}` | `{colors.alpha-yellow-300}` |
| `alpha-fg-yellow-light` | `{colors.alpha-yellow-400-30}` | `{colors.alpha-yellow-300-45}` |
| `alpha-fg-yellow-dark` | `{colors.alpha-yellow-500}` | `{colors.alpha-yellow-300}` |
| `alpha-fg-pink-normal` | `{colors.alpha-pink-400}` | `{colors.alpha-pink-300}` |
| `alpha-fg-pink-light` | `{colors.alpha-pink-400-30}` | `{colors.alpha-pink-300-45}` |
| `alpha-fg-pink-dark` | `{colors.alpha-pink-500}` | `{colors.alpha-pink-300}` |
| `alpha-fg-purple-normal` | `{colors.alpha-purple-400}` | `{colors.alpha-purple-300}` |
| `alpha-fg-purple-light` | `{colors.alpha-purple-400-30}` | `{colors.alpha-purple-300-45}` |
| `alpha-fg-purple-dark` | `{colors.alpha-purple-500}` | `{colors.alpha-purple-300}` |
| `alpha-fg-navy-normal` | `{colors.alpha-navy-400}` | `{colors.alpha-navy-300}` |
| `alpha-fg-navy-light` | `{colors.alpha-navy-400-30}` | `{colors.alpha-navy-300-45}` |
| `alpha-fg-navy-dark` | `{colors.alpha-navy-500}` | `{colors.alpha-navy-300}` |
| `alpha-fg-absolute-black-dark` | `{colors.alpha-black-100}` | `{colors.alpha-black-100}` |
| `alpha-fg-absolute-black-normal` | `{colors.alpha-black-85}` | `{colors.alpha-black-85}` |
| `alpha-fg-absolute-black-light` | `{colors.alpha-black-60}` | `{colors.alpha-black-60}` |
| `alpha-fg-absolute-black-lighter` | `{colors.alpha-black-40}` | `{colors.alpha-black-40}` |
| `alpha-fg-absolute-black-lightest` | `{colors.alpha-black-20}` | `{colors.alpha-black-20}` |
| `alpha-fg-absolute-white-dark` | `{colors.alpha-white-100}` | `{colors.alpha-white-100}` |
| `alpha-fg-absolute-white-normal` | `{colors.alpha-white-90}` | `{colors.alpha-white-90}` |
| `alpha-fg-absolute-white-light` | `{colors.alpha-white-60}` | `{colors.alpha-white-60}` |
| `alpha-fg-absolute-white-lighter` | `{colors.alpha-white-40}` | `{colors.alpha-white-40}` |
| `alpha-fg-absolute-white-lightest` | `{colors.alpha-white-20}` | `{colors.alpha-white-20}` |
| `alpha-fg-grey-darkest` | `{colors.alpha-grey-900}` | `{colors.alpha-white-100}` |
| `alpha-fg-grey-dark` | `{colors.alpha-grey-500}` | `{colors.alpha-grey-500}` |
| `alpha-fg-grey-normal` | `{colors.alpha-grey-400}` | `{colors.alpha-grey-600}` |
| `alpha-fg-grey-light` | `{colors.alpha-grey-200}` | `{colors.alpha-grey-700}` |
| `alpha-fg-grey-lighter` | `{colors.alpha-grey-100}` | `{colors.alpha-grey-800}` |
| `alpha-fg-grey-lightest` | `{colors.alpha-grey-50}` | `{colors.alpha-grey-850}` |
| `alpha-fg-grey-alpha-darker` | `{colors.alpha-grey-alpha-200-80}` | `{colors.alpha-grey-alpha-800-90}` |
| `alpha-fg-grey-alpha-dark` | `{colors.alpha-grey-alpha-100-80}` | `{colors.alpha-grey-alpha-800-80}` |
| `alpha-fg-grey-alpha-light` | `{colors.alpha-grey-alpha-50-80}` | `{colors.alpha-grey-alpha-850-80}` |

#### alpha tier 배경 (`alpha-bg-*`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `alpha-bg-black-darkest` | `{colors.alpha-black-60}` | `{colors.alpha-black-60}` |
| `alpha-bg-black-darker` | `{colors.alpha-black-40}` | `{colors.alpha-white-40}` |
| `alpha-bg-black-dark` | `{colors.alpha-black-15}` | `{colors.alpha-white-20}` |
| `alpha-bg-black-light` | `{colors.alpha-black-8}` | `{colors.alpha-white-12}` |
| `alpha-bg-black-lighter` | `{colors.alpha-black-5}` | `{colors.alpha-white-8}` |
| `alpha-bg-black-lightest` | `{colors.alpha-black-3}` | `{colors.alpha-white-5}` |
| `alpha-bg-black-transparent` | `{colors.alpha-black-0}` | `{colors.alpha-white-0}` |
| `alpha-bg-grey-darkest` | `{colors.alpha-grey-900}` | `{colors.alpha-white-100}` |
| `alpha-bg-grey-dark` | `{colors.alpha-grey-500}` | `{colors.alpha-grey-500}` |
| `alpha-bg-grey-light` | `{colors.alpha-grey-200}` | `{colors.alpha-grey-700}` |
| `alpha-bg-grey-lighter` | `{colors.alpha-grey-100}` | `{colors.alpha-grey-800}` |
| `alpha-bg-grey-lightest` | `{colors.alpha-grey-50}` | `{colors.alpha-grey-850}` |
| `alpha-bg-grey-transparent` | `{colors.alpha-grey-900-0}` | `{colors.alpha-white-0}` |
| `alpha-bg-grey-normal` | `{colors.alpha-grey-400}` | `{colors.alpha-grey-600}` |
| `alpha-bg-grey-alpha-darkest` | `{colors.alpha-grey-alpha-200-80}` | `{colors.alpha-grey-alpha-700-80}` |
| `alpha-bg-grey-alpha-darker` | `{colors.alpha-grey-alpha-100-90}` | `{colors.alpha-grey-alpha-800-90}` |
| `alpha-bg-grey-alpha-dark` | `{colors.alpha-grey-alpha-100-80}` | `{colors.alpha-grey-alpha-800-80}` |
| `alpha-bg-grey-alpha-light` | `{colors.alpha-grey-alpha-50-80}` | `{colors.alpha-grey-alpha-850-80}` |
| `alpha-bg-white-highest` | `{colors.alpha-white-100}` | `{colors.alpha-grey-700}` |
| `alpha-bg-white-higher` | `{colors.alpha-white-100}` | `{colors.alpha-grey-800}` |
| `alpha-bg-white-normal` | `{colors.alpha-white-100}` | `{colors.alpha-grey-900}` |
| `alpha-bg-white-transparent` | `{colors.alpha-white-0}` | `{colors.alpha-white-0}` |
| `alpha-bg-white-alpha-lightest` | `{colors.alpha-white-90}` | `{colors.alpha-grey-alpha-800-80}` |
| `alpha-bg-white-alpha-lighter` | `{colors.alpha-white-60}` | `{colors.alpha-black-60}` |
| `alpha-bg-white-alpha-light` | `{colors.alpha-white-20}` | `{colors.alpha-black-20}` |
| `alpha-bg-white-alpha-transparent` | `{colors.alpha-white-0}` | `{colors.alpha-black-0}` |
| `alpha-bg-blue-normal` | `{colors.alpha-blue-400}` | `{colors.alpha-blue-300}` |
| `alpha-bg-blue-light` | `{colors.alpha-blue-400-30}` | `{colors.alpha-blue-300-45}` |
| `alpha-bg-blue-lighter` | `{colors.alpha-blue-400-20}` | `{colors.alpha-blue-300-30}` |
| `alpha-bg-blue-lightest` | `{colors.alpha-blue-400-10}` | `{colors.alpha-blue-300-15}` |
| `alpha-bg-blue-dark` | `{colors.alpha-blue-500}` | `{colors.alpha-blue-400}` |
| `alpha-bg-blue-shade-lighter` | `{colors.alpha-shade-blue-400-20}` | `{colors.alpha-shade-blue-600-40}` |
| `alpha-bg-blue-shade-normal` | `{colors.alpha-shade-blue-400}` | `{colors.alpha-shade-blue-600}` |
| `alpha-bg-blue-transparent` | `{colors.alpha-blue-400-0}` | `{colors.alpha-blue-300-0}` |
| `alpha-bg-cobalt-normal` | `{colors.alpha-cobalt-400}` | `{colors.alpha-cobalt-300}` |
| `alpha-bg-cobalt-light` | `{colors.alpha-cobalt-400-30}` | `{colors.alpha-cobalt-300-45}` |
| `alpha-bg-cobalt-lighter` | `{colors.alpha-cobalt-400-20}` | `{colors.alpha-cobalt-300-30}` |
| `alpha-bg-cobalt-lightest` | `{colors.alpha-cobalt-400-10}` | `{colors.alpha-cobalt-300-15}` |
| `alpha-bg-cobalt-dark` | `{colors.alpha-cobalt-500}` | `{colors.alpha-cobalt-400}` |
| `alpha-bg-cobalt-shade-lighter` | `{colors.alpha-shade-cobalt-400-20}` | `{colors.alpha-shade-cobalt-600-40}` |
| `alpha-bg-cobalt-shade-normal` | `{colors.alpha-shade-cobalt-400}` | `{colors.alpha-shade-cobalt-600}` |
| `alpha-bg-cobalt-transparent` | `{colors.alpha-cobalt-400-0}` | `{colors.alpha-cobalt-300-0}` |
| `alpha-bg-red-normal` | `{colors.alpha-red-400}` | `{colors.alpha-red-300}` |
| `alpha-bg-red-light` | `{colors.alpha-red-400-30}` | `{colors.alpha-red-300-45}` |
| `alpha-bg-red-lighter` | `{colors.alpha-red-400-20}` | `{colors.alpha-red-300-30}` |
| `alpha-bg-red-lightest` | `{colors.alpha-red-400-10}` | `{colors.alpha-red-300-15}` |
| `alpha-bg-red-dark` | `{colors.alpha-red-500}` | `{colors.alpha-red-400}` |
| `alpha-bg-red-shade-lighter` | `{colors.alpha-shade-red-400-20}` | `{colors.alpha-shade-red-600-40}` |
| `alpha-bg-red-shade-normal` | `{colors.alpha-shade-red-400}` | `{colors.alpha-shade-red-600}` |
| `alpha-bg-red-transparent` | `{colors.alpha-red-400-0}` | `{colors.alpha-red-300-0}` |
| `alpha-bg-orange-normal` | `{colors.alpha-orange-400}` | `{colors.alpha-orange-300}` |
| `alpha-bg-orange-light` | `{colors.alpha-orange-400-30}` | `{colors.alpha-orange-300-45}` |
| `alpha-bg-orange-lighter` | `{colors.alpha-orange-400-20}` | `{colors.alpha-orange-300-30}` |
| `alpha-bg-orange-lightest` | `{colors.alpha-orange-400-10}` | `{colors.alpha-orange-300-15}` |
| `alpha-bg-orange-dark` | `{colors.alpha-orange-500}` | `{colors.alpha-orange-400}` |
| `alpha-bg-orange-shade-lighter` | `{colors.alpha-shade-orange-400-20}` | `{colors.alpha-shade-orange-600-40}` |
| `alpha-bg-orange-shade-normal` | `{colors.alpha-shade-orange-400}` | `{colors.alpha-shade-orange-600}` |
| `alpha-bg-orange-transparent` | `{colors.alpha-orange-400-0}` | `{colors.alpha-orange-300-0}` |
| `alpha-bg-green-normal` | `{colors.alpha-green-400}` | `{colors.alpha-green-300}` |
| `alpha-bg-green-light` | `{colors.alpha-green-400-30}` | `{colors.alpha-green-300-45}` |
| `alpha-bg-green-lighter` | `{colors.alpha-green-400-20}` | `{colors.alpha-green-300-30}` |
| `alpha-bg-green-lightest` | `{colors.alpha-green-400-10}` | `{colors.alpha-green-300-15}` |
| `alpha-bg-green-dark` | `{colors.alpha-green-500}` | `{colors.alpha-green-400}` |
| `alpha-bg-green-shade-lighter` | `{colors.alpha-shade-green-400-20}` | `{colors.alpha-shade-green-600-40}` |
| `alpha-bg-green-shade-normal` | `{colors.alpha-shade-green-400}` | `{colors.alpha-shade-green-600}` |
| `alpha-bg-green-transparent` | `{colors.alpha-green-400-0}` | `{colors.alpha-green-300-0}` |
| `alpha-bg-teal-normal` | `{colors.alpha-teal-400}` | `{colors.alpha-teal-300}` |
| `alpha-bg-teal-light` | `{colors.alpha-teal-400-30}` | `{colors.alpha-teal-300-45}` |
| `alpha-bg-teal-lighter` | `{colors.alpha-teal-400-20}` | `{colors.alpha-teal-300-30}` |
| `alpha-bg-teal-lightest` | `{colors.alpha-teal-400-10}` | `{colors.alpha-teal-300-15}` |
| `alpha-bg-teal-dark` | `{colors.alpha-teal-500}` | `{colors.alpha-teal-400}` |
| `alpha-bg-teal-shade-lighter` | `{colors.alpha-shade-teal-400-20}` | `{colors.alpha-shade-teal-600-40}` |
| `alpha-bg-teal-shade-normal` | `{colors.alpha-shade-teal-400}` | `{colors.alpha-shade-teal-600}` |
| `alpha-bg-teal-transparent` | `{colors.alpha-teal-400-0}` | `{colors.alpha-teal-300-0}` |
| `alpha-bg-olive-normal` | `{colors.alpha-olive-400}` | `{colors.alpha-olive-300}` |
| `alpha-bg-olive-light` | `{colors.alpha-olive-400-30}` | `{colors.alpha-olive-300-45}` |
| `alpha-bg-olive-lighter` | `{colors.alpha-olive-400-20}` | `{colors.alpha-olive-300-30}` |
| `alpha-bg-olive-lightest` | `{colors.alpha-olive-400-10}` | `{colors.alpha-olive-300-15}` |
| `alpha-bg-olive-dark` | `{colors.alpha-olive-500}` | `{colors.alpha-olive-400}` |
| `alpha-bg-olive-shade-lighter` | `{colors.alpha-shade-olive-400-20}` | `{colors.alpha-shade-olive-600-40}` |
| `alpha-bg-olive-shade-normal` | `{colors.alpha-shade-olive-400}` | `{colors.alpha-shade-olive-600}` |
| `alpha-bg-olive-transparent` | `{colors.alpha-olive-400-0}` | `{colors.alpha-olive-300-0}` |
| `alpha-bg-yellow-normal` | `{colors.alpha-yellow-400}` | `{colors.alpha-yellow-300}` |
| `alpha-bg-yellow-light` | `{colors.alpha-yellow-400-30}` | `{colors.alpha-yellow-300-45}` |
| `alpha-bg-yellow-lighter` | `{colors.alpha-yellow-400-20}` | `{colors.alpha-yellow-300-30}` |
| `alpha-bg-yellow-lightest` | `{colors.alpha-yellow-400-10}` | `{colors.alpha-yellow-300-15}` |
| `alpha-bg-yellow-dark` | `{colors.alpha-yellow-500}` | `{colors.alpha-yellow-400}` |
| `alpha-bg-yellow-shade-lighter` | `{colors.alpha-shade-yellow-400-20}` | `{colors.alpha-shade-yellow-600-40}` |
| `alpha-bg-yellow-shade-normal` | `{colors.alpha-shade-yellow-400}` | `{colors.alpha-shade-yellow-600}` |
| `alpha-bg-yellow-transparent` | `{colors.alpha-yellow-400-0}` | `{colors.alpha-yellow-300-0}` |
| `alpha-bg-pink-normal` | `{colors.alpha-pink-400}` | `{colors.alpha-pink-300}` |
| `alpha-bg-pink-light` | `{colors.alpha-pink-400-30}` | `{colors.alpha-pink-300-45}` |
| `alpha-bg-pink-lighter` | `{colors.alpha-pink-400-20}` | `{colors.alpha-pink-300-30}` |
| `alpha-bg-pink-lightest` | `{colors.alpha-pink-400-10}` | `{colors.alpha-pink-300-15}` |
| `alpha-bg-pink-dark` | `{colors.alpha-pink-500}` | `{colors.alpha-pink-400}` |
| `alpha-bg-pink-shade-lighter` | `{colors.alpha-shade-pink-400-20}` | `{colors.alpha-shade-pink-600-40}` |
| `alpha-bg-pink-shade-normal` | `{colors.alpha-shade-pink-400}` | `{colors.alpha-shade-pink-600}` |
| `alpha-bg-pink-transparent` | `{colors.alpha-pink-400-0}` | `{colors.alpha-pink-300-0}` |
| `alpha-bg-purple-normal` | `{colors.alpha-purple-400}` | `{colors.alpha-purple-300}` |
| `alpha-bg-purple-light` | `{colors.alpha-purple-400-30}` | `{colors.alpha-purple-300-45}` |
| `alpha-bg-purple-lighter` | `{colors.alpha-purple-400-20}` | `{colors.alpha-purple-300-30}` |
| `alpha-bg-purple-lightest` | `{colors.alpha-purple-400-10}` | `{colors.alpha-purple-300-15}` |
| `alpha-bg-purple-dark` | `{colors.alpha-purple-500}` | `{colors.alpha-purple-400}` |
| `alpha-bg-purple-shade-lighter` | `{colors.alpha-shade-purple-400-20}` | `{colors.alpha-shade-purple-600-40}` |
| `alpha-bg-purple-shade-normal` | `{colors.alpha-shade-purple-400}` | `{colors.alpha-shade-purple-600}` |
| `alpha-bg-purple-transparent` | `{colors.alpha-purple-400-0}` | `{colors.alpha-purple-300-0}` |
| `alpha-bg-navy-normal` | `{colors.alpha-navy-400}` | `{colors.alpha-navy-300}` |
| `alpha-bg-navy-light` | `{colors.alpha-navy-400-30}` | `{colors.alpha-navy-300-45}` |
| `alpha-bg-navy-lighter` | `{colors.alpha-navy-400-20}` | `{colors.alpha-navy-300-30}` |
| `alpha-bg-navy-lightest` | `{colors.alpha-navy-400-10}` | `{colors.alpha-navy-300-15}` |
| `alpha-bg-navy-dark` | `{colors.alpha-navy-500}` | `{colors.alpha-navy-400}` |
| `alpha-bg-navy-shade-lighter` | `{colors.alpha-shade-navy-400-20}` | `{colors.alpha-shade-navy-600-40}` |
| `alpha-bg-navy-shade-normal` | `{colors.alpha-shade-navy-400}` | `{colors.alpha-shade-navy-600}` |
| `alpha-bg-navy-transparent` | `{colors.alpha-navy-400-0}` | `{colors.alpha-navy-300-0}` |
| `alpha-bg-absolute-black-dark` | `{colors.alpha-black-100}` | `{colors.alpha-black-100}` |
| `alpha-bg-absolute-black-normal` | `{colors.alpha-black-85}` | `{colors.alpha-black-85}` |
| `alpha-bg-absolute-black-light` | `{colors.alpha-black-60}` | `{colors.alpha-black-60}` |
| `alpha-bg-absolute-black-lighter` | `{colors.alpha-black-40}` | `{colors.alpha-black-40}` |
| `alpha-bg-absolute-black-lightest` | `{colors.alpha-black-20}` | `{colors.alpha-black-20}` |
| `alpha-bg-absolute-black-transparent` | `{colors.alpha-black-0}` | `{colors.alpha-black-0}` |
| `alpha-bg-absolute-white-dark` | `{colors.alpha-white-100}` | `{colors.alpha-white-100}` |
| `alpha-bg-absolute-white-normal` | `{colors.alpha-white-90}` | `{colors.alpha-white-90}` |
| `alpha-bg-absolute-white-light` | `{colors.alpha-white-60}` | `{colors.alpha-white-60}` |
| `alpha-bg-absolute-white-lighter` | `{colors.alpha-white-40}` | `{colors.alpha-white-40}` |
| `alpha-bg-absolute-white-lightest` | `{colors.alpha-white-20}` | `{colors.alpha-white-20}` |
| `alpha-bg-absolute-white-transparent` | `{colors.alpha-white-0}` | `{colors.alpha-white-0}` |

#### alpha tier 표면, 그림자 색 (`alpha-surface-*`, `alpha-shadow-*`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `alpha-surface-lowest` | `{colors.alpha-grey-100}` | `{colors.alpha-grey-850}` |
| `alpha-surface-lower` | `{colors.alpha-grey-50}` | `{colors.alpha-grey-900}` |
| `alpha-surface-normal` | `{colors.alpha-white-100}` | `{colors.alpha-grey-950}` |
| `alpha-shadow-xlarge` | `{colors.alpha-black-30}` | `{colors.alpha-black-60}` |
| `alpha-shadow-large` | `{colors.alpha-black-22}` | `{colors.alpha-black-40}` |
| `alpha-shadow-medium` | `{colors.alpha-black-15}` | `{colors.alpha-black-20}` |
| `alpha-shadow-small` | `{colors.alpha-black-8}` | `{colors.alpha-black-15}` |
| `alpha-shadow-base` | `{colors.alpha-black-5}` | `{colors.alpha-black-8}` |
| `alpha-shadow-base-inner` | `{colors.alpha-white-12}` | `{colors.alpha-white-8}` |

#### alpha tier 역할을 가리키는 역할 (`alpha-dim-*`, `alpha-primary-*`, `alpha-critical-*`, `alpha-warning-*`, `alpha-accent-*`, `alpha-success-*`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `alpha-dim-black-light` | `{colors.alpha-bg-absolute-black-lightest}` | `{colors.dark-alpha-bg-absolute-black-lightest}` |
| `alpha-dim-black-normal` | `{colors.alpha-bg-absolute-black-lighter}` | `{colors.dark-alpha-bg-absolute-black-lighter}` |
| `alpha-primary-bg-normal` | `{colors.alpha-bg-blue-normal}` | `{colors.dark-alpha-bg-blue-normal}` |
| `alpha-primary-bg-light` | `{colors.alpha-bg-blue-light}` | `{colors.dark-alpha-bg-blue-light}` |
| `alpha-primary-bg-lighter` | `{colors.alpha-bg-blue-lighter}` | `{colors.dark-alpha-bg-blue-lighter}` |
| `alpha-primary-bg-lightest` | `{colors.alpha-bg-blue-lightest}` | `{colors.dark-alpha-bg-blue-lightest}` |
| `alpha-primary-bg-dark` | `{colors.alpha-bg-blue-dark}` | `{colors.dark-alpha-bg-blue-dark}` |
| `alpha-primary-fg-normal` | `{colors.alpha-fg-blue-normal}` | `{colors.dark-alpha-fg-blue-normal}` |
| `alpha-primary-fg-light` | `{colors.alpha-fg-blue-light}` | `{colors.dark-alpha-fg-blue-light}` |
| `alpha-primary-fg-dark` | `{colors.alpha-fg-blue-dark}` | `{colors.dark-alpha-fg-blue-dark}` |
| `alpha-critical-bg-dark` | `{colors.alpha-bg-red-dark}` | `{colors.dark-alpha-bg-red-dark}` |
| `alpha-critical-bg-normal` | `{colors.alpha-fg-red-normal}` | `{colors.dark-alpha-fg-red-normal}` |
| `alpha-critical-bg-light` | `{colors.alpha-bg-red-light}` | `{colors.dark-alpha-bg-red-light}` |
| `alpha-critical-bg-lighter` | `{colors.alpha-bg-red-lighter}` | `{colors.dark-alpha-bg-red-lighter}` |
| `alpha-critical-bg-lightest` | `{colors.alpha-bg-red-lightest}` | `{colors.dark-alpha-bg-red-lightest}` |
| `alpha-critical-fg-normal` | `{colors.alpha-fg-red-normal}` | `{colors.dark-alpha-fg-red-normal}` |
| `alpha-critical-fg-light` | `{colors.alpha-fg-red-light}` | `{colors.dark-alpha-fg-red-light}` |
| `alpha-critical-fg-dark` | `{colors.alpha-fg-red-dark}` | `{colors.dark-alpha-fg-red-dark}` |
| `alpha-warning-bg-dark` | `{colors.alpha-bg-orange-dark}` | `{colors.dark-alpha-bg-orange-dark}` |
| `alpha-warning-bg-normal` | `{colors.alpha-bg-orange-normal}` | `{colors.dark-alpha-bg-orange-normal}` |
| `alpha-warning-bg-light` | `{colors.alpha-bg-orange-light}` | `{colors.dark-alpha-bg-orange-light}` |
| `alpha-warning-bg-lighter` | `{colors.alpha-bg-orange-lighter}` | `{colors.dark-alpha-bg-orange-lighter}` |
| `alpha-warning-bg-lightest` | `{colors.alpha-bg-orange-lightest}` | `{colors.dark-alpha-bg-orange-lightest}` |
| `alpha-warning-fg-normal` | `{colors.alpha-fg-orange-normal}` | `{colors.dark-alpha-fg-orange-normal}` |
| `alpha-warning-fg-light` | `{colors.alpha-fg-orange-light}` | `{colors.dark-alpha-fg-orange-light}` |
| `alpha-warning-fg-dark` | `{colors.alpha-fg-orange-dark}` | `{colors.dark-alpha-fg-orange-dark}` |
| `alpha-accent-bg-dark` | `{colors.alpha-bg-cobalt-dark}` | `{colors.dark-alpha-bg-cobalt-dark}` |
| `alpha-accent-bg-normal` | `{colors.alpha-bg-cobalt-normal}` | `{colors.dark-alpha-bg-cobalt-normal}` |
| `alpha-accent-bg-light` | `{colors.alpha-bg-cobalt-light}` | `{colors.dark-alpha-bg-cobalt-light}` |
| `alpha-accent-bg-lighter` | `{colors.alpha-bg-cobalt-lighter}` | `{colors.dark-alpha-bg-cobalt-lighter}` |
| `alpha-accent-bg-lightest` | `{colors.alpha-bg-cobalt-lightest}` | `{colors.dark-alpha-bg-cobalt-lightest}` |
| `alpha-accent-fg-normal` | `{colors.alpha-fg-cobalt-normal}` | `{colors.dark-alpha-fg-cobalt-normal}` |
| `alpha-accent-fg-light` | `{colors.alpha-fg-cobalt-light}` | `{colors.dark-alpha-fg-cobalt-light}` |
| `alpha-accent-fg-dark` | `{colors.alpha-fg-cobalt-dark}` | `{colors.dark-alpha-fg-cobalt-dark}` |
| `alpha-success-bg-dark` | `{colors.alpha-bg-green-dark}` | `{colors.dark-alpha-bg-green-dark}` |
| `alpha-success-bg-normal` | `{colors.alpha-bg-green-normal}` | `{colors.dark-alpha-bg-green-normal}` |
| `alpha-success-bg-light` | `{colors.alpha-bg-green-light}` | `{colors.dark-alpha-bg-green-light}` |
| `alpha-success-bg-lighter` | `{colors.alpha-bg-green-lighter}` | `{colors.dark-alpha-bg-green-lighter}` |
| `alpha-success-bg-lightest` | `{colors.alpha-bg-green-lightest}` | `{colors.dark-alpha-bg-green-lightest}` |
| `alpha-success-fg-normal` | `{colors.alpha-fg-green-normal}` | `{colors.dark-alpha-fg-green-normal}` |
| `alpha-success-fg-light` | `{colors.alpha-fg-green-light}` | `{colors.dark-alpha-fg-green-light}` |
| `alpha-success-fg-dark` | `{colors.alpha-fg-green-dark}` | `{colors.dark-alpha-fg-green-dark}` |

#### alpha tier hover 상태 — 상류가 hex 를 직접 적은 역할 (`alpha-*-hovered`)

| 역할 | 라이트 | 다크 |
| --- | --- | --- |
| `alpha-fg-black-pure-hovered` | #1c1c1cff ≈ `oklch(0.226 0 0)` | #edededff ≈ `oklch(0.946 0 0)` |
| `alpha-fg-black-darkest-hovered` | #1c1c1cd9 ≈ `oklch(0.226 0 0 / 0.85)` | #edededcc ≈ `oklch(0.946 0 0 / 0.80)` |
| `alpha-fg-black-darker-hovered` | #1c1c1c99 ≈ `oklch(0.226 0 0 / 0.60)` | #ededed99 ≈ `oklch(0.946 0 0 / 0.60)` |
| `alpha-fg-black-dark-hovered` | #1c1c1c66 ≈ `oklch(0.226 0 0 / 0.40)` | #ededed66 ≈ `oklch(0.946 0 0 / 0.40)` |
| `alpha-fg-black-light-hovered` | #1c1c1c39 ≈ `oklch(0.226 0 0 / 0.22)` | #ededed4d ≈ `oklch(0.946 0 0 / 0.30)` |
| `alpha-fg-black-lightest-hovered` | #1c1c1c1e ≈ `oklch(0.226 0 0 / 0.12)` | #ededed2f ≈ `oklch(0.946 0 0 / 0.18)` |
| `alpha-fg-white-normal-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #2e2e33ff ≈ `oklch(0.303 0.009 286)` |
| `alpha-fg-blue-normal-hovered` | #5551fcff ≈ `oklch(0.551 0.245 276)` | #93aefbff ≈ `oklch(0.761 0.115 269)` |
| `alpha-fg-blue-light-hovered` | #5551fc4d ≈ `oklch(0.551 0.245 276 / 0.30)` | #93aefb73 ≈ `oklch(0.761 0.115 269 / 0.45)` |
| `alpha-fg-blue-dark-hovered` | #4b42d5ff ≈ `oklch(0.487 0.216 277)` | #93aefbff ≈ `oklch(0.761 0.115 269)` |
| `alpha-fg-cobalt-normal-hovered` | #4088dfff ≈ `oklch(0.623 0.150 255)` | #83c4faff ≈ `oklch(0.797 0.102 245)` |
| `alpha-fg-cobalt-light-hovered` | #4088df4d ≈ `oklch(0.623 0.150 255 / 0.30)` | #83c4fa73 ≈ `oklch(0.797 0.102 245 / 0.45)` |
| `alpha-fg-cobalt-dark-hovered` | #3268c4ff ≈ `oklch(0.531 0.155 260)` | #83c4faff ≈ `oklch(0.797 0.102 245)` |
| `alpha-fg-red-normal-hovered` | #df4c4cff ≈ `oklch(0.620 0.183 24)` | #ffa2a2ff ≈ `oklch(0.805 0.111 20)` |
| `alpha-fg-red-light-hovered` | #df4c4c4d ≈ `oklch(0.620 0.183 24 / 0.30)` | #ffa2a273 ≈ `oklch(0.805 0.111 20 / 0.45)` |
| `alpha-fg-red-dark-hovered` | #ab3940ff ≈ `oklch(0.511 0.149 21)` | #ffa2a2ff ≈ `oklch(0.805 0.111 20)` |
| `alpha-fg-orange-normal-hovered` | #df751fff ≈ `oklch(0.672 0.159 53)` | #ffae74ff ≈ `oklch(0.817 0.121 56)` |
| `alpha-fg-orange-light-hovered` | #df751f4d ≈ `oklch(0.672 0.159 53 / 0.30)` | #ffae7473 ≈ `oklch(0.817 0.121 56 / 0.45)` |
| `alpha-fg-orange-dark-hovered` | #b15c0fff ≈ `oklch(0.566 0.135 55)` | #ffae74ff ≈ `oklch(0.817 0.121 56)` |
| `alpha-fg-green-normal-hovered` | #3f9e61ff ≈ `oklch(0.627 0.129 153)` | #74d68bff ≈ `oklch(0.797 0.141 150)` |
| `alpha-fg-green-light-hovered` | #3f9e614d ≈ `oklch(0.627 0.129 153 / 0.30)` | #74d68b73 ≈ `oklch(0.797 0.141 150 / 0.45)` |
| `alpha-fg-green-dark-hovered` | #347b5aff ≈ `oklch(0.528 0.089 161)` | #74d68bff ≈ `oklch(0.797 0.141 150)` |
| `alpha-fg-teal-normal-hovered` | #08a5a0ff ≈ `oklch(0.652 0.111 191)` | #4cdccfff ≈ `oklch(0.815 0.123 186)` |
| `alpha-fg-teal-light-hovered` | #08a5a04d ≈ `oklch(0.652 0.111 191 / 0.30)` | #4cdccf73 ≈ `oklch(0.815 0.123 186 / 0.45)` |
| `alpha-fg-teal-dark-hovered` | #06848bff ≈ `oklch(0.559 0.094 201)` | #4cdccfff ≈ `oklch(0.815 0.123 186)` |
| `alpha-fg-olive-normal-hovered` | #9ba212ff ≈ `oklch(0.684 0.148 113)` | #d2df3dff ≈ `oklch(0.866 0.176 114)` |
| `alpha-fg-olive-light-hovered` | #9ba2124d ≈ `oklch(0.684 0.148 113 / 0.30)` | #d2df3d73 ≈ `oklch(0.866 0.176 114 / 0.45)` |
| `alpha-fg-olive-dark-hovered` | #70751cff ≈ `oklch(0.541 0.109 113)` | #d2df3dff ≈ `oklch(0.866 0.176 114)` |
| `alpha-fg-yellow-normal-hovered` | #d9a010ff ≈ `oklch(0.740 0.150 82)` | #face4aff ≈ `oklch(0.867 0.152 90)` |
| `alpha-fg-yellow-light-hovered` | #d9a0104d ≈ `oklch(0.740 0.150 82 / 0.30)` | #face4a73 ≈ `oklch(0.867 0.152 90 / 0.45)` |
| `alpha-fg-yellow-dark-hovered` | #b58500ff ≈ `oklch(0.646 0.133 83)` | #face4aff ≈ `oklch(0.867 0.152 90)` |
| `alpha-fg-pink-normal-hovered` | #cf3eacff ≈ `oklch(0.610 0.213 339)` | #f27fdbff ≈ `oklch(0.754 0.178 335)` |
| `alpha-fg-pink-light-hovered` | #cf3eac4d ≈ `oklch(0.610 0.213 339 / 0.30)` | #f27fdb73 ≈ `oklch(0.754 0.178 335 / 0.45)` |
| `alpha-fg-pink-dark-hovered` | #a03591ff ≈ `oklch(0.517 0.176 334)` | #f27fdbff ≈ `oklch(0.754 0.178 335)` |
| `alpha-fg-purple-normal-hovered` | #8247e1ff ≈ `oklch(0.553 0.220 296)` | #bf9affff ≈ `oklch(0.759 0.145 300)` |
| `alpha-fg-purple-light-hovered` | #8247e14d ≈ `oklch(0.553 0.220 296 / 0.30)` | #bf9aff73 ≈ `oklch(0.759 0.145 300 / 0.45)` |
| `alpha-fg-purple-dark-hovered` | #6135a6ff ≈ `oklch(0.447 0.172 297)` | #bf9affff ≈ `oklch(0.759 0.145 300)` |
| `alpha-fg-navy-normal-hovered` | #414c9cff ≈ `oklch(0.451 0.129 274)` | #838fdcff ≈ `oklch(0.672 0.115 276)` |
| `alpha-fg-navy-light-hovered` | #414c9c4d ≈ `oklch(0.451 0.129 274 / 0.30)` | #838fdc73 ≈ `oklch(0.672 0.115 276 / 0.45)` |
| `alpha-fg-navy-dark-hovered` | #34377cff ≈ `oklch(0.374 0.115 277)` | #838fdcff ≈ `oklch(0.672 0.115 276)` |
| `alpha-fg-absolute-black-dark-hovered` | #1c1c1cff ≈ `oklch(0.226 0 0)` | #0a0a0aff ≈ `oklch(0.145 0 0)` |
| `alpha-fg-absolute-black-normal-hovered` | #1c1c1cd9 ≈ `oklch(0.226 0 0 / 0.85)` | #0a0a0ad9 ≈ `oklch(0.145 0 0 / 0.85)` |
| `alpha-fg-absolute-black-light-hovered` | #1c1c1c99 ≈ `oklch(0.226 0 0 / 0.60)` | #0a0a0a99 ≈ `oklch(0.145 0 0 / 0.60)` |
| `alpha-fg-absolute-black-lighter-hovered` | #1c1c1c66 ≈ `oklch(0.226 0 0 / 0.40)` | #0a0a0a66 ≈ `oklch(0.145 0 0 / 0.40)` |
| `alpha-fg-absolute-black-lightest-hovered` | #1c1c1c4d ≈ `oklch(0.226 0 0 / 0.30)` | #0a0a0a4d ≈ `oklch(0.145 0 0 / 0.30)` |
| `alpha-fg-absolute-white-dark-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #edededff ≈ `oklch(0.946 0 0)` |
| `alpha-fg-absolute-white-normal-hovered` | #ededede6 ≈ `oklch(0.946 0 0 / 0.90)` | #ededede6 ≈ `oklch(0.946 0 0 / 0.90)` |
| `alpha-fg-absolute-white-light-hovered` | #ededed99 ≈ `oklch(0.946 0 0 / 0.60)` | #ededed99 ≈ `oklch(0.946 0 0 / 0.60)` |
| `alpha-fg-absolute-white-lighter-hovered` | #ededed66 ≈ `oklch(0.946 0 0 / 0.40)` | #ededed66 ≈ `oklch(0.946 0 0 / 0.40)` |
| `alpha-fg-absolute-white-lightest-hovered` | #ededed4d ≈ `oklch(0.946 0 0 / 0.30)` | #ededed4d ≈ `oklch(0.946 0 0 / 0.30)` |
| `alpha-fg-grey-darkest-hovered` | #42424aff ≈ `oklch(0.382 0.013 286)` | #edededff ≈ `oklch(0.946 0 0)` |
| `alpha-fg-grey-dark-hovered` | #9b9b9eff ≈ `oklch(0.690 0.004 286)` | #b2b2b5ff ≈ `oklch(0.764 0.004 286)` |
| `alpha-fg-grey-normal-hovered` | #c0c0c3ff ≈ `oklch(0.809 0.004 286)` | #868686ff ≈ `oklch(0.620 0 0)` |
| `alpha-fg-grey-light-hovered` | #dedee0ff ≈ `oklch(0.901 0.003 286)` | #505253ff ≈ `oklch(0.437 0.003 229)` |
| `alpha-fg-grey-lighter-hovered` | #e5e5e8ff ≈ `oklch(0.923 0.004 286)` | #3b3c3fff ≈ `oklch(0.356 0.005 271)` |
| `alpha-fg-grey-lightest-hovered` | #eaeaeaff ≈ `oklch(0.937 0 0)` | #343538ff ≈ `oklch(0.329 0.005 271)` |
| `alpha-fg-grey-alpha-darker-hovered` | #dedee0cc ≈ `oklch(0.901 0.003 286 / 0.80)` | #3b3c3fe6 ≈ `oklch(0.356 0.005 271 / 0.90)` |
| `alpha-fg-grey-alpha-dark-hovered` | #e5e5e8cc ≈ `oklch(0.923 0.004 286 / 0.80)` | #3b3c3fcc ≈ `oklch(0.356 0.005 271 / 0.80)` |
| `alpha-fg-grey-alpha-light-hovered` | #eaeaeacc ≈ `oklch(0.937 0 0 / 0.80)` | #343538cc ≈ `oklch(0.329 0.005 271 / 0.80)` |
| `alpha-bg-black-darkest-hovered` | #1c1c1c99 ≈ `oklch(0.226 0 0 / 0.60)` | #0a0a0a99 ≈ `oklch(0.145 0 0 / 0.60)` |
| `alpha-bg-black-darker-hovered` | #1c1c1c66 ≈ `oklch(0.226 0 0 / 0.40)` | #ededed66 ≈ `oklch(0.946 0 0 / 0.40)` |
| `alpha-bg-black-dark-hovered` | #1c1c1c39 ≈ `oklch(0.226 0 0 / 0.22)` | #ededed4d ≈ `oklch(0.946 0 0 / 0.30)` |
| `alpha-bg-black-light-hovered` | #1c1c1c1e ≈ `oklch(0.226 0 0 / 0.12)` | #ededed2f ≈ `oklch(0.946 0 0 / 0.18)` |
| `alpha-bg-black-lighter-hovered` | #1c1c1c14 ≈ `oklch(0.226 0 0 / 0.08)` | #ededed1e ≈ `oklch(0.946 0 0 / 0.12)` |
| `alpha-bg-black-lightest-hovered` | #1c1c1c0c ≈ `oklch(0.226 0 0 / 0.05)` | #ededed14 ≈ `oklch(0.946 0 0 / 0.08)` |
| `alpha-bg-black-transparent-hovered` | #0000000d ≈ `oklch(0 0 0 / 0.05)` — hex 가 원시값 `alpha-black-5` 그대로, 참조 아님 | #ffffff0d ≈ `oklch(1 0 0 / 0.05)` — hex 가 원시값 `alpha-white-5` 그대로, 참조 아님 |
| `alpha-bg-grey-darkest-hovered` | #42424aff ≈ `oklch(0.382 0.013 286)` | #edededff ≈ `oklch(0.946 0 0)` |
| `alpha-bg-grey-dark-hovered` | #9b9b9eff ≈ `oklch(0.690 0.004 286)` | #b2b2b5ff ≈ `oklch(0.764 0.004 286)` |
| `alpha-bg-grey-light-hovered` | #dedee0ff ≈ `oklch(0.901 0.003 286)` | #505253ff ≈ `oklch(0.437 0.003 229)` |
| `alpha-bg-grey-lighter-hovered` | #e5e5e8ff ≈ `oklch(0.923 0.004 286)` | #3b3c3fff ≈ `oklch(0.356 0.005 271)` |
| `alpha-bg-grey-lightest-hovered` | #eaeaeaff ≈ `oklch(0.937 0 0)` | #343538ff ≈ `oklch(0.329 0.005 271)` |
| `alpha-bg-grey-transparent-hovered` | #2424280d ≈ `oklch(0.262 0.007 286 / 0.05)` | #ffffff0d ≈ `oklch(1 0 0 / 0.05)` — hex 가 원시값 `alpha-white-5` 그대로, 참조 아님 |
| `alpha-bg-grey-normal-hovered` | #c0c0c3ff ≈ `oklch(0.809 0.004 286)` | #868686ff ≈ `oklch(0.620 0 0)` |
| `alpha-bg-grey-alpha-darkest-hovered` | #dedee0cc ≈ `oklch(0.901 0.003 286 / 0.80)` | #505253cc ≈ `oklch(0.437 0.003 229 / 0.80)` |
| `alpha-bg-grey-alpha-darker-hovered` | #e5e5e8e6 ≈ `oklch(0.923 0.004 286 / 0.90)` | #3b3c3fe6 ≈ `oklch(0.356 0.005 271 / 0.90)` |
| `alpha-bg-grey-alpha-dark-hovered` | #e5e5e8cc ≈ `oklch(0.923 0.004 286 / 0.80)` | #3b3c3fcc ≈ `oklch(0.356 0.005 271 / 0.80)` |
| `alpha-bg-grey-alpha-light-hovered` | #eaeaeacc ≈ `oklch(0.937 0 0 / 0.80)` | #343538cc ≈ `oklch(0.329 0.005 271 / 0.80)` |
| `alpha-bg-white-highest-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #505253ff ≈ `oklch(0.437 0.003 229)` |
| `alpha-bg-white-higher-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #3b3c3fff ≈ `oklch(0.356 0.005 271)` |
| `alpha-bg-white-normal-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #2e2e33ff ≈ `oklch(0.303 0.009 286)` |
| `alpha-bg-white-transparent-hovered` | #ffffff0d ≈ `oklch(1 0 0 / 0.05)` — hex 가 원시값 `alpha-white-5` 그대로, 참조 아님 | #ffffff0d ≈ `oklch(1 0 0 / 0.05)` — hex 가 원시값 `alpha-white-5` 그대로, 참조 아님 |
| `alpha-bg-white-alpha-lightest-hovered` | #ededede6 ≈ `oklch(0.946 0 0 / 0.90)` | #3b3c3fcc ≈ `oklch(0.356 0.005 271 / 0.80)` |
| `alpha-bg-white-alpha-lighter-hovered` | #ededed99 ≈ `oklch(0.946 0 0 / 0.60)` | #0a0a0a99 ≈ `oklch(0.145 0 0 / 0.60)` |
| `alpha-bg-white-alpha-light-hovered` | #ededed4d ≈ `oklch(0.946 0 0 / 0.30)` | #0a0a0a4d ≈ `oklch(0.145 0 0 / 0.30)` |
| `alpha-bg-white-alpha-transparent-hovered` | #ffffff0d ≈ `oklch(1 0 0 / 0.05)` — hex 가 원시값 `alpha-white-5` 그대로, 참조 아님 | #0000000d ≈ `oklch(0 0 0 / 0.05)` — hex 가 원시값 `alpha-black-5` 그대로, 참조 아님 |
| `alpha-bg-blue-normal-hovered` | #5551fcff ≈ `oklch(0.551 0.245 276)` | #93aefbff ≈ `oklch(0.761 0.115 269)` |
| `alpha-bg-blue-light-hovered` | #5551fc4d ≈ `oklch(0.551 0.245 276 / 0.30)` | #93aefb73 ≈ `oklch(0.761 0.115 269 / 0.45)` |
| `alpha-bg-blue-lighter-hovered` | #5551fc4d ≈ `oklch(0.551 0.245 276 / 0.30)` | #93aefb4d ≈ `oklch(0.761 0.115 269 / 0.30)` |
| `alpha-bg-blue-lightest-hovered` | #5551fc27 ≈ `oklch(0.551 0.245 276 / 0.15)` | #93aefb39 ≈ `oklch(0.761 0.115 269 / 0.22)` |
| `alpha-bg-blue-dark-hovered` | #4b42d5ff ≈ `oklch(0.487 0.216 277)` | #8280fcff ≈ `oklch(0.661 0.179 281)` |
| `alpha-bg-blue-shade-lighter-hovered` | #6165d94d ≈ `oklch(0.565 0.174 278 / 0.30)` | #4e569d66 ≈ `oklch(0.481 0.114 276 / 0.40)` |
| `alpha-bg-blue-shade-normal-hovered` | #6165d9ff ≈ `oklch(0.565 0.174 278)` | #4e569dff ≈ `oklch(0.481 0.114 276)` |
| `alpha-bg-blue-transparent-hovered` | #6d6afc1a ≈ `oklch(0.607 0.211 279 / 0.10)` — hex 가 원시값 `alpha-blue-400-10` 그대로, 참조 아님 | #7d9efa1a ≈ `oklch(0.714 0.140 268 / 0.10)` |
| `alpha-bg-cobalt-normal-hovered` | #4088dfff ≈ `oklch(0.623 0.150 255)` | #83c4faff ≈ `oklch(0.797 0.102 245)` |
| `alpha-bg-cobalt-light-hovered` | #4088df4d ≈ `oklch(0.623 0.150 255 / 0.30)` | #83c4fa73 ≈ `oklch(0.797 0.102 245 / 0.45)` |
| `alpha-bg-cobalt-lighter-hovered` | #4088df4d ≈ `oklch(0.623 0.150 255 / 0.30)` | #83c4fa4d ≈ `oklch(0.797 0.102 245 / 0.30)` |
| `alpha-bg-cobalt-lightest-hovered` | #4088df27 ≈ `oklch(0.623 0.150 255 / 0.15)` | #83c4fa39 ≈ `oklch(0.797 0.102 245 / 0.22)` |
| `alpha-bg-cobalt-dark-hovered` | #3268c4ff ≈ `oklch(0.531 0.155 260)` | #5f9eecff ≈ `oklch(0.691 0.133 255)` |
| `alpha-bg-cobalt-shade-lighter-hovered` | #47a2e24d ≈ `oklch(0.685 0.128 243 / 0.30)` | #4c6a9966 ≈ `oklch(0.522 0.083 259 / 0.40)` |
| `alpha-bg-cobalt-shade-normal-hovered` | #47a2e2ff ≈ `oklch(0.685 0.128 243)` | #4c6a99ff ≈ `oklch(0.522 0.083 259)` |
| `alpha-bg-cobalt-transparent-hovered` | #5093e51a ≈ `oklch(0.657 0.141 255 / 0.10)` — hex 가 원시값 `alpha-cobalt-400-10` 그대로, 참조 아님 | #71b9f51a ≈ `oklch(0.762 0.113 245 / 0.10)` |
| `alpha-bg-red-normal-hovered` | #df4c4cff ≈ `oklch(0.620 0.183 24)` | #ffa2a2ff ≈ `oklch(0.805 0.111 20)` |
| `alpha-bg-red-light-hovered` | #df4c4c4d ≈ `oklch(0.620 0.183 24 / 0.30)` | #ffa2a273 ≈ `oklch(0.805 0.111 20 / 0.45)` |
| `alpha-bg-red-lighter-hovered` | #df4c4c4d ≈ `oklch(0.620 0.183 24 / 0.30)` | #ffa2a24d ≈ `oklch(0.805 0.111 20 / 0.30)` |
| `alpha-bg-red-lightest-hovered` | #df4c4c27 ≈ `oklch(0.620 0.183 24 / 0.15)` | #ffa2a239 ≈ `oklch(0.805 0.111 20 / 0.22)` |
| `alpha-bg-red-dark-hovered` | #ab3940ff ≈ `oklch(0.511 0.149 21)` | #ec6b6bff ≈ `oklch(0.684 0.160 22)` |
| `alpha-bg-red-shade-lighter-hovered` | #d758614d ≈ `oklch(0.626 0.160 19 / 0.30)` | #a5434a66 ≈ `oklch(0.516 0.130 19 / 0.40)` |
| `alpha-bg-red-shade-normal-hovered` | #d75861ff ≈ `oklch(0.626 0.160 19)` | #a5434aff ≈ `oklch(0.516 0.130 19)` |
| `alpha-bg-red-transparent-hovered` | #e55c5c1a ≈ `oklch(0.651 0.171 23 / 0.10)` — hex 가 원시값 `alpha-red-400-10` 그대로, 참조 아님 | #ff8c8c1a ≈ `oklch(0.765 0.140 21 / 0.10)` |
| `alpha-bg-orange-normal-hovered` | #df751fff ≈ `oklch(0.672 0.159 53)` | #ffae74ff ≈ `oklch(0.817 0.121 56)` |
| `alpha-bg-orange-light-hovered` | #df751f4d ≈ `oklch(0.672 0.159 53 / 0.30)` | #ffae7473 ≈ `oklch(0.817 0.121 56 / 0.45)` |
| `alpha-bg-orange-lighter-hovered` | #df751f4d ≈ `oklch(0.672 0.159 53 / 0.30)` | #ffae744d ≈ `oklch(0.817 0.121 56 / 0.30)` |
| `alpha-bg-orange-lightest-hovered` | #df751f27 ≈ `oklch(0.672 0.159 53 / 0.15)` | #ffae7439 ≈ `oklch(0.817 0.121 56 / 0.22)` |
| `alpha-bg-orange-dark-hovered` | #b15c0fff ≈ `oklch(0.566 0.135 55)` | #ee8a39ff ≈ `oklch(0.728 0.153 56)` |
| `alpha-bg-orange-shade-lighter-hovered` | #d9813a4d ≈ `oklch(0.686 0.137 56 / 0.30)` | #9e643566 ≈ `oklch(0.557 0.098 58 / 0.40)` |
| `alpha-bg-orange-shade-normal-hovered` | #d9813aff ≈ `oklch(0.686 0.137 56)` | #9e6435ff ≈ `oklch(0.557 0.098 58)` |
| `alpha-bg-orange-transparent-hovered` | #e67f2b1a ≈ `oklch(0.698 0.156 55 / 0.10)` — hex 가 원시값 `alpha-orange-400-10` 그대로, 참조 아님 | #ffa15e1a ≈ `oklch(0.791 0.139 55 / 0.10)` |
| `alpha-bg-green-normal-hovered` | #3f9e61ff ≈ `oklch(0.627 0.129 153)` | #74d68bff ≈ `oklch(0.797 0.141 150)` |
| `alpha-bg-green-light-hovered` | #3f9e614d ≈ `oklch(0.627 0.129 153 / 0.30)` | #74d68b73 ≈ `oklch(0.797 0.141 150 / 0.45)` |
| `alpha-bg-green-lighter-hovered` | #3f9e614d ≈ `oklch(0.627 0.129 153 / 0.30)` | #74d68b4d ≈ `oklch(0.797 0.141 150 / 0.30)` |
| `alpha-bg-green-lightest-hovered` | #3f9e6127 ≈ `oklch(0.627 0.129 153 / 0.15)` | #74d68b39 ≈ `oklch(0.797 0.141 150 / 0.22)` |
| `alpha-bg-green-dark-hovered` | #347b5aff ≈ `oklch(0.528 0.089 161)` | #41c16fff ≈ `oklch(0.721 0.163 152)` |
| `alpha-bg-green-shade-lighter-hovered` | #5aa4734d ≈ `oklch(0.657 0.105 154 / 0.30)` | #4f8d6766 ≈ `oklch(0.591 0.087 156 / 0.40)` |
| `alpha-bg-green-shade-normal-hovered` | #5aa473ff ≈ `oklch(0.657 0.105 154)` | #4f8d67ff ≈ `oklch(0.591 0.087 156)` |
| `alpha-bg-green-transparent-hovered` | #40ad671a ≈ `oklch(0.668 0.144 152 / 0.10)` — hex 가 원시값 `alpha-green-400-10` 그대로, 참조 아님 | #68cc7f1a ≈ `oklch(0.765 0.145 149 / 0.10)` |
| `alpha-bg-teal-normal-hovered` | #08a5a0ff ≈ `oklch(0.652 0.111 191)` | #4cdccfff ≈ `oklch(0.815 0.123 186)` |
| `alpha-bg-teal-light-hovered` | #08a5a04d ≈ `oklch(0.652 0.111 191 / 0.30)` | #4cdccf73 ≈ `oklch(0.815 0.123 186 / 0.45)` |
| `alpha-bg-teal-lighter-hovered` | #08a5a04d ≈ `oklch(0.652 0.111 191 / 0.30)` | #4cdccf4d ≈ `oklch(0.815 0.123 186 / 0.30)` |
| `alpha-bg-teal-lightest-hovered` | #08a5a027 ≈ `oklch(0.652 0.111 191 / 0.15)` | #4cdccf39 ≈ `oklch(0.815 0.123 186 / 0.22)` |
| `alpha-bg-teal-dark-hovered` | #06848bff ≈ `oklch(0.559 0.094 201)` | #0ac6c0ff ≈ `oklch(0.747 0.128 191)` |
| `alpha-bg-teal-shade-lighter-hovered` | #539b984d ≈ `oklch(0.642 0.073 192 / 0.30)` | #49839066 ≈ `oklch(0.576 0.064 214 / 0.40)` |
| `alpha-bg-teal-shade-normal-hovered` | #539b98ff ≈ `oklch(0.642 0.073 192)` | #498390ff ≈ `oklch(0.576 0.064 214)` |
| `alpha-bg-teal-transparent-hovered` | #09b2ac1a ≈ `oklch(0.690 0.118 190 / 0.10)` — hex 가 원시값 `alpha-teal-400-10` 그대로, 참조 아님 | #40d3c51a ≈ `oklch(0.787 0.123 186 / 0.10)` |
| `alpha-bg-olive-normal-hovered` | #9ba212ff ≈ `oklch(0.684 0.148 113)` | #d2df3dff ≈ `oklch(0.866 0.176 114)` |
| `alpha-bg-olive-light-hovered` | #9ba2124d ≈ `oklch(0.684 0.148 113 / 0.30)` | #d2df3d73 ≈ `oklch(0.866 0.176 114 / 0.45)` |
| `alpha-bg-olive-lighter-hovered` | #9ba2124d ≈ `oklch(0.684 0.148 113 / 0.30)` | #d2df3d4d ≈ `oklch(0.866 0.176 114 / 0.30)` |
| `alpha-bg-olive-lightest-hovered` | #9ba21227 ≈ `oklch(0.684 0.148 113 / 0.15)` | #d2df3d39 ≈ `oklch(0.866 0.176 114 / 0.22)` |
| `alpha-bg-olive-dark-hovered` | #70751cff ≈ `oklch(0.541 0.109 113)` | #c1ca0cff ≈ `oklch(0.805 0.178 113)` |
| `alpha-bg-olive-shade-lighter-hovered` | #969a514d ≈ `oklch(0.667 0.096 112 / 0.30)` | #86893a66 ≈ `oklch(0.611 0.102 111 / 0.40)` |
| `alpha-bg-olive-shade-normal-hovered` | #969a51ff ≈ `oklch(0.667 0.096 112)` | #86893aff ≈ `oklch(0.611 0.102 111)` |
| `alpha-bg-olive-transparent-hovered` | #a9b1101a ≈ `oklch(0.730 0.160 113 / 0.10)` — hex 가 원시값 `alpha-olive-400-10` 그대로, 참조 아님 | #c8d6301a ≈ `oklch(0.838 0.176 115 / 0.10)` |
| `alpha-bg-yellow-normal-hovered` | #d9a010ff ≈ `oklch(0.740 0.150 82)` | #face4aff ≈ `oklch(0.867 0.152 90)` |
| `alpha-bg-yellow-light-hovered` | #d9a0104d ≈ `oklch(0.740 0.150 82 / 0.30)` | #face4a73 ≈ `oklch(0.867 0.152 90 / 0.45)` |
| `alpha-bg-yellow-lighter-hovered` | #d9a0104d ≈ `oklch(0.740 0.150 82 / 0.30)` | #face4a4d ≈ `oklch(0.867 0.152 90 / 0.30)` |
| `alpha-bg-yellow-lightest-hovered` | #d9a01027 ≈ `oklch(0.740 0.150 82 / 0.15)` | #face4a39 ≈ `oklch(0.867 0.152 90 / 0.22)` |
| `alpha-bg-yellow-dark-hovered` | #b58500ff ≈ `oklch(0.646 0.133 83)` | #f9b917ff ≈ `oklch(0.823 0.166 83)` |
| `alpha-bg-yellow-shade-lighter-hovered` | #e2a52d4d ≈ `oklch(0.761 0.145 79 / 0.30)` | #927a2666 ≈ `oklch(0.587 0.104 93 / 0.40)` |
| `alpha-bg-yellow-shade-normal-hovered` | #e2a52dff ≈ `oklch(0.761 0.145 79)` | #927a26ff ≈ `oklch(0.587 0.104 93)` |
| `alpha-bg-yellow-transparent-hovered` | #edae0d1a ≈ `oklch(0.789 0.161 82 / 0.10)` — hex 가 원시값 `alpha-yellow-400-10` 그대로, 참조 아님 | #f9c8351a ≈ `oklch(0.853 0.161 89 / 0.10)` |
| `alpha-bg-pink-normal-hovered` | #cf3eacff ≈ `oklch(0.610 0.213 339)` | #f27fdbff ≈ `oklch(0.754 0.178 335)` |
| `alpha-bg-pink-light-hovered` | #cf3eac4d ≈ `oklch(0.610 0.213 339 / 0.30)` | #f27fdb73 ≈ `oklch(0.754 0.178 335 / 0.45)` |
| `alpha-bg-pink-lighter-hovered` | #cf3eac4d ≈ `oklch(0.610 0.213 339 / 0.30)` | #f27fdb4d ≈ `oklch(0.754 0.178 335 / 0.30)` |
| `alpha-bg-pink-lightest-hovered` | #cf3eac27 ≈ `oklch(0.610 0.213 339 / 0.15)` | #f27fdb39 ≈ `oklch(0.754 0.178 335 / 0.22)` |
| `alpha-bg-pink-dark-hovered` | #a03591ff ≈ `oklch(0.517 0.176 334)` | #df58bfff ≈ `oklch(0.668 0.203 338)` |
| `alpha-bg-pink-shade-lighter-hovered` | #cb5bb04d ≈ `oklch(0.638 0.173 338 / 0.30)` | #99428566 ≈ `oklch(0.517 0.142 337 / 0.40)` |
| `alpha-bg-pink-shade-normal-hovered` | #cb5bb0ff ≈ `oklch(0.638 0.173 338)` | #994285ff ≈ `oklch(0.517 0.142 337)` |
| `alpha-bg-pink-transparent-hovered` | #d64bb51a ≈ `oklch(0.637 0.208 338 / 0.10)` — hex 가 원시값 `alpha-pink-400-10` 그대로, 참조 아님 | #ec6fd31a ≈ `oklch(0.722 0.192 336 / 0.10)` |
| `alpha-bg-purple-normal-hovered` | #8247e1ff ≈ `oklch(0.553 0.220 296)` | #bf9affff ≈ `oklch(0.759 0.145 300)` |
| `alpha-bg-purple-light-hovered` | #8247e14d ≈ `oklch(0.553 0.220 296 / 0.30)` | #bf9aff73 ≈ `oklch(0.759 0.145 300 / 0.45)` |
| `alpha-bg-purple-lighter-hovered` | #8247e14d ≈ `oklch(0.553 0.220 296 / 0.30)` | #bf9aff4d ≈ `oklch(0.759 0.145 300 / 0.30)` |
| `alpha-bg-purple-lightest-hovered` | #8247e127 ≈ `oklch(0.553 0.220 296 / 0.15)` | #bf9aff39 ≈ `oklch(0.759 0.145 300 / 0.22)` |
| `alpha-bg-purple-dark-hovered` | #6135a6ff ≈ `oklch(0.447 0.172 297)` | #9a66eeff ≈ `oklch(0.629 0.197 298)` |
| `alpha-bg-purple-shade-lighter-hovered` | #905ede4d ≈ `oklch(0.597 0.188 299 / 0.30)` | #64489066 ≈ `oklch(0.465 0.116 300 / 0.40)` |
| `alpha-bg-purple-shade-normal-hovered` | #905edeff ≈ `oklch(0.597 0.188 299)` | #644890ff ≈ `oklch(0.465 0.116 300)` |
| `alpha-bg-purple-transparent-hovered` | #8e57e71a ≈ `oklch(0.591 0.208 297 / 0.10)` — hex 가 원시값 `alpha-purple-400-10` 그대로, 참조 아님 | #b184ff1a ≈ `oklch(0.709 0.177 299 / 0.10)` |
| `alpha-bg-navy-normal-hovered` | #414c9cff ≈ `oklch(0.451 0.129 274)` | #838fdcff ≈ `oklch(0.672 0.115 276)` |
| `alpha-bg-navy-light-hovered` | #414c9c4d ≈ `oklch(0.451 0.129 274 / 0.30)` | #838fdc73 ≈ `oklch(0.672 0.115 276 / 0.45)` |
| `alpha-bg-navy-lighter-hovered` | #414c9c4d ≈ `oklch(0.451 0.129 274 / 0.30)` | #838fdc4d ≈ `oklch(0.672 0.115 276 / 0.30)` |
| `alpha-bg-navy-lightest-hovered` | #414c9c27 ≈ `oklch(0.451 0.129 274 / 0.15)` | #838fdc39 ≈ `oklch(0.672 0.115 276 / 0.22)` |
| `alpha-bg-navy-dark-hovered` | #34377cff ≈ `oklch(0.374 0.115 277)` | #4353bfff ≈ `oklch(0.492 0.169 272)` |
| `alpha-bg-navy-shade-lighter-hovered` | #5761a54d ≈ `oklch(0.516 0.108 276 / 0.30)` | #3b416766 ≈ `oklch(0.388 0.065 276 / 0.40)` |
| `alpha-bg-navy-shade-normal-hovered` | #5761a5ff ≈ `oklch(0.516 0.108 276)` | #3b4167ff ≈ `oklch(0.388 0.065 276)` |
| `alpha-bg-navy-transparent-hovered` | #424fab1a ≈ `oklch(0.469 0.147 273 / 0.10)` — hex 가 원시값 `alpha-navy-400-10` 그대로, 참조 아님 | #7683d31a ≈ `oklch(0.634 0.121 275 / 0.10)` |
| `alpha-bg-absolute-black-dark-hovered` | #1c1c1cff ≈ `oklch(0.226 0 0)` | #0a0a0aff ≈ `oklch(0.145 0 0)` |
| `alpha-bg-absolute-black-normal-hovered` | #1c1c1cd9 ≈ `oklch(0.226 0 0 / 0.85)` | #0a0a0ad9 ≈ `oklch(0.145 0 0 / 0.85)` |
| `alpha-bg-absolute-black-light-hovered` | #1c1c1c99 ≈ `oklch(0.226 0 0 / 0.60)` | #0a0a0a99 ≈ `oklch(0.145 0 0 / 0.60)` |
| `alpha-bg-absolute-black-lighter-hovered` | #1c1c1c66 ≈ `oklch(0.226 0 0 / 0.40)` | #0a0a0a66 ≈ `oklch(0.145 0 0 / 0.40)` |
| `alpha-bg-absolute-black-lightest-hovered` | #1c1c1c4d ≈ `oklch(0.226 0 0 / 0.30)` | #0a0a0a4d ≈ `oklch(0.145 0 0 / 0.30)` |
| `alpha-bg-absolute-black-transparent-hovered` | #0000000d ≈ `oklch(0 0 0 / 0.05)` — hex 가 원시값 `alpha-black-5` 그대로, 참조 아님 | #0000000d ≈ `oklch(0 0 0 / 0.05)` — hex 가 원시값 `alpha-black-5` 그대로, 참조 아님 |
| `alpha-bg-absolute-white-dark-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #edededff ≈ `oklch(0.946 0 0)` |
| `alpha-bg-absolute-white-normal-hovered` | #ededede6 ≈ `oklch(0.946 0 0 / 0.90)` | #ededede6 ≈ `oklch(0.946 0 0 / 0.90)` |
| `alpha-bg-absolute-white-light-hovered` | #ededed99 ≈ `oklch(0.946 0 0 / 0.60)` | #ededed99 ≈ `oklch(0.946 0 0 / 0.60)` |
| `alpha-bg-absolute-white-lighter-hovered` | #ededed66 ≈ `oklch(0.946 0 0 / 0.40)` | #ededed66 ≈ `oklch(0.946 0 0 / 0.40)` |
| `alpha-bg-absolute-white-lightest-hovered` | #ededed4d ≈ `oklch(0.946 0 0 / 0.30)` | #ededed4d ≈ `oklch(0.946 0 0 / 0.30)` |
| `alpha-bg-absolute-white-transparent-hovered` | #ffffff0d ≈ `oklch(1 0 0 / 0.05)` — hex 가 원시값 `alpha-white-5` 그대로, 참조 아님 | #ffffff0d ≈ `oklch(1 0 0 / 0.05)` — hex 가 원시값 `alpha-white-5` 그대로, 참조 아님 |
| `alpha-surface-lowest-hovered` | #e5e5e8ff ≈ `oklch(0.923 0.004 286)` | #343538ff ≈ `oklch(0.329 0.005 271)` |
| `alpha-surface-lower-hovered` | #eaeaeaff ≈ `oklch(0.937 0 0)` | #2e2e33ff ≈ `oklch(0.303 0.009 286)` |
| `alpha-surface-normal-hovered` | #edededff ≈ `oklch(0.946 0 0)` | #242427ff ≈ `oklch(0.262 0.006 286)` |
| `alpha-shadow-xlarge-hovered` | #1c1c1c4d ≈ `oklch(0.226 0 0 / 0.30)` | #0a0a0a99 ≈ `oklch(0.145 0 0 / 0.60)` |
| `alpha-shadow-large-hovered` | #1c1c1c38 ≈ `oklch(0.226 0 0 / 0.22)` | #0a0a0a66 ≈ `oklch(0.145 0 0 / 0.40)` |
| `alpha-shadow-medium-hovered` | #1c1c1c39 ≈ `oklch(0.226 0 0 / 0.22)` | #0a0a0a4d ≈ `oklch(0.145 0 0 / 0.30)` |
| `alpha-shadow-small-hovered` | #1c1c1c1e ≈ `oklch(0.226 0 0 / 0.12)` | #0a0a0a39 ≈ `oklch(0.145 0 0 / 0.22)` |
| `alpha-shadow-base-hovered` | #1c1c1c14 ≈ `oklch(0.226 0 0 / 0.08)` | #0a0a0a1e ≈ `oklch(0.145 0 0 / 0.12)` |
| `alpha-shadow-base-inner-hovered` | #ededed2f ≈ `oklch(0.946 0 0 / 0.18)` | #ededed1e ≈ `oklch(0.946 0 0 / 0.12)` |
| `alpha-dim-black-light-hovered` | #1c1c1c4d ≈ `oklch(0.226 0 0 / 0.30)` | #0a0a0a4d ≈ `oklch(0.145 0 0 / 0.30)` |
| `alpha-dim-black-normal-hovered` | #1c1c1c66 ≈ `oklch(0.226 0 0 / 0.40)` | #0a0a0a66 ≈ `oklch(0.145 0 0 / 0.40)` |
| `alpha-primary-bg-normal-hovered` | #5551fcff ≈ `oklch(0.551 0.245 276)` | #648bf9ff ≈ `oklch(0.661 0.169 267)` |
| `alpha-primary-bg-light-hovered` | #5551fc4d ≈ `oklch(0.551 0.245 276 / 0.30)` | #648bf973 ≈ `oklch(0.661 0.169 267 / 0.45)` |
| `alpha-primary-bg-lighter-hovered` | #5551fc4d ≈ `oklch(0.551 0.245 276 / 0.30)` | #648bf94d ≈ `oklch(0.661 0.169 267 / 0.30)` |
| `alpha-primary-bg-lightest-hovered` | #5551fc27 ≈ `oklch(0.551 0.245 276 / 0.15)` | #648bf939 ≈ `oklch(0.661 0.169 267 / 0.22)` |
| `alpha-primary-bg-dark-hovered` | #4b42d5ff ≈ `oklch(0.487 0.216 277)` | #5551fcff ≈ `oklch(0.551 0.245 276)` |
| `alpha-primary-fg-normal-hovered` | #5551fcff ≈ `oklch(0.551 0.245 276)` | #648bf9ff ≈ `oklch(0.661 0.169 267)` |
| `alpha-primary-fg-light-hovered` | #5551fc4d ≈ `oklch(0.551 0.245 276 / 0.30)` | #648bf973 ≈ `oklch(0.661 0.169 267 / 0.45)` |
| `alpha-primary-fg-dark-hovered` | #4b42d5ff ≈ `oklch(0.487 0.216 277)` | #648bf9ff ≈ `oklch(0.661 0.169 267)` |
| `alpha-critical-bg-dark-hovered` | #ab3940ff ≈ `oklch(0.511 0.149 21)` | #df4c4cff ≈ `oklch(0.620 0.183 24)` |
| `alpha-critical-bg-normal-hovered` | #df4c4cff ≈ `oklch(0.620 0.183 24)` | #ff7070ff ≈ `oklch(0.719 0.175 23)` |
| `alpha-critical-bg-light-hovered` | #df4c4c4d ≈ `oklch(0.620 0.183 24 / 0.30)` | #ff707073 ≈ `oklch(0.719 0.175 23 / 0.45)` |
| `alpha-critical-bg-lighter-hovered` | #df4c4c4d ≈ `oklch(0.620 0.183 24 / 0.30)` | #ff70704d ≈ `oklch(0.719 0.175 23 / 0.30)` |
| `alpha-critical-bg-lightest-hovered` | #df4c4c27 ≈ `oklch(0.620 0.183 24 / 0.15)` | #ff707039 ≈ `oklch(0.719 0.175 23 / 0.22)` |
| `alpha-critical-fg-normal-hovered` | #df4c4cff ≈ `oklch(0.620 0.183 24)` | #ff7070ff ≈ `oklch(0.719 0.175 23)` |
| `alpha-critical-fg-light-hovered` | #df4c4c4d ≈ `oklch(0.620 0.183 24 / 0.30)` | #ff707073 ≈ `oklch(0.719 0.175 23 / 0.45)` |
| `alpha-critical-fg-dark-hovered` | #ab3940ff ≈ `oklch(0.511 0.149 21)` | #ff7070ff ≈ `oklch(0.719 0.175 23)` |
| `alpha-warning-bg-dark-hovered` | #b15c0fff ≈ `oklch(0.566 0.135 55)` | #df751fff ≈ `oklch(0.672 0.159 53)` |
| `alpha-warning-bg-normal-hovered` | #df751fff ≈ `oklch(0.672 0.159 53)` | #ff9346ff ≈ `oklch(0.765 0.158 53)` |
| `alpha-warning-bg-light-hovered` | #df751f4d ≈ `oklch(0.672 0.159 53 / 0.30)` | #ff934673 ≈ `oklch(0.765 0.158 53 / 0.45)` |
| `alpha-warning-bg-lighter-hovered` | #df751f4d ≈ `oklch(0.672 0.159 53 / 0.30)` | #ff93464d ≈ `oklch(0.765 0.158 53 / 0.30)` |
| `alpha-warning-bg-lightest-hovered` | #df751f27 ≈ `oklch(0.672 0.159 53 / 0.15)` | #ff934639 ≈ `oklch(0.765 0.158 53 / 0.22)` |
| `alpha-warning-fg-normal-hovered` | #df751fff ≈ `oklch(0.672 0.159 53)` | #ff9346ff ≈ `oklch(0.765 0.158 53)` |
| `alpha-warning-fg-light-hovered` | #df751f4d ≈ `oklch(0.672 0.159 53 / 0.30)` | #ff934673 ≈ `oklch(0.765 0.158 53 / 0.45)` |
| `alpha-warning-fg-dark-hovered` | #b15c0fff ≈ `oklch(0.566 0.135 55)` | #ff9346ff ≈ `oklch(0.765 0.158 53)` |
| `alpha-accent-bg-dark-hovered` | #3268c4ff ≈ `oklch(0.531 0.155 260)` | #4088dfff ≈ `oklch(0.623 0.150 255)` |
| `alpha-accent-bg-normal-hovered` | #4088dfff ≈ `oklch(0.623 0.150 255)` | #5cadf1ff ≈ `oklch(0.725 0.127 246)` |
| `alpha-accent-bg-light-hovered` | #4088df4d ≈ `oklch(0.623 0.150 255 / 0.30)` | #5cadf173 ≈ `oklch(0.725 0.127 246 / 0.45)` |
| `alpha-accent-bg-lighter-hovered` | #4088df4d ≈ `oklch(0.623 0.150 255 / 0.30)` | #5cadf14d ≈ `oklch(0.725 0.127 246 / 0.30)` |
| `alpha-accent-bg-lightest-hovered` | #4088df27 ≈ `oklch(0.623 0.150 255 / 0.15)` | #5cadf139 ≈ `oklch(0.725 0.127 246 / 0.22)` |
| `alpha-accent-fg-normal-hovered` | #4088dfff ≈ `oklch(0.623 0.150 255)` | #5cadf1ff ≈ `oklch(0.725 0.127 246)` |
| `alpha-accent-fg-light-hovered` | #4088df4d ≈ `oklch(0.623 0.150 255 / 0.30)` | #5cadf173 ≈ `oklch(0.725 0.127 246 / 0.45)` |
| `alpha-accent-fg-dark-hovered` | #3268c4ff ≈ `oklch(0.531 0.155 260)` | #5cadf1ff ≈ `oklch(0.725 0.127 246)` |
| `alpha-success-bg-dark-hovered` | #347b5aff ≈ `oklch(0.528 0.089 161)` | #3f9e61ff ≈ `oklch(0.627 0.129 153)` |
| `alpha-success-bg-normal-hovered` | #3f9e61ff ≈ `oklch(0.627 0.129 153)` | #5bc373ff ≈ `oklch(0.735 0.150 149)` |
| `alpha-success-bg-light-hovered` | #3f9e614d ≈ `oklch(0.627 0.129 153 / 0.30)` | #5bc37373 ≈ `oklch(0.735 0.150 149 / 0.45)` |
| `alpha-success-bg-lighter-hovered` | #3f9e614d ≈ `oklch(0.627 0.129 153 / 0.30)` | #5bc3734d ≈ `oklch(0.735 0.150 149 / 0.30)` |
| `alpha-success-bg-lightest-hovered` | #3f9e6127 ≈ `oklch(0.627 0.129 153 / 0.15)` | #5bc37339 ≈ `oklch(0.735 0.150 149 / 0.22)` |
| `alpha-success-fg-normal-hovered` | #3f9e61ff ≈ `oklch(0.627 0.129 153)` | #5bc373ff ≈ `oklch(0.735 0.150 149)` |
| `alpha-success-fg-light-hovered` | #3f9e614d ≈ `oklch(0.627 0.129 153 / 0.30)` | #5bc37373 ≈ `oklch(0.735 0.150 149 / 0.45)` |
| `alpha-success-fg-dark-hovered` | #347b5aff ≈ `oklch(0.528 0.089 161)` | #5bc373ff ≈ `oklch(0.735 0.150 149)` |

## Typography

폰트 패밀리는 한국어 우선 스택이다 — `--font-family-sans-kr`이 `'Inter', 'NotoSansKR', 'Noto Sans KR', 'NotoSansJP', 'Noto Sans JP', -apple-system, …` 순으로, 라틴은 **Inter**·국문은 **Noto Sans KR**가 본문 서체다 [src:3]. 일본어용 `--font-family-sans-jp`(Noto Sans JP 우선)와 모노 `--font-family-mono`(ui-monospace, Cascadia Code, Source Code Pro, Menlo, Consolas …)도 토큰화돼, 채널톡이 한·일 시장을 함께 겨냥하는 제품임이 토큰에 반영돼 있다 [src:3].

굵기는 단 2단계다 — `--font-weight-400`(regular)와 `--font-weight-700`(bold). 중간 굵기 없이 regular/bold 이원화이며, `--typography-text-weight-bold`를 토글버튼 등이 사용한다 [src:3][src:2].

타이포그래피 묶음 토큰은 `--typography-size-NN-{font-size,line-height,letter-spacing}` 형태로 사이즈별 3속성을 한 묶음으로 노출한다 — 예컨대 `typography-size-24`는 `font-size-24` + `line-height-32` + `letter-spacing-2`를 묶고, `{component.text}` 컴포넌트가 이 토큰 + `--b-text-*` 로컬 변수로 조립된다 [src:3][src:2]. 음수 자간(`-0.01rem`/`-0.04rem`)은 한글·라틴 혼용 가독성을 노린 세팅이다 [src:3].

스케일 아래에는 굵기·행간·자간이 각각 프리미티브로 토큰화돼 있다. 자간은 크기 구간에 따라 두 값을 쓴다:

- `weight-400`: 400 — regular
- `weight-700`: 700 — bold
- `line-height-16`: 1.6rem
- `line-height-44`: 4.4rem
- `letter-spacing-1`: -0.01rem — 15~17px
- `letter-spacing-2`: -0.04rem — 22px↑ 타이트

## Spacing

레이아웃은 `{component.stack}`(`--b-stack-spacing`)·HStack/VStack·`{component.center}`·`{component.box}` 프리미티브로 짠다 [src:2]. Storybook 문서 예시들이 `spacing={4/6/10/16/32}`(4px 그리드 계열) 값을 직접 사용한다 [src:2].

비활성 상태 공통 토큰으로 `--opacity-disabled: 0.4`가 있어, 다수 컴포넌트(버튼·인풋·아바타·스위치 등)가 disabled 표현에 이 값을 쓴다 [src:3][src:2]. 모션은 `--transition-duration-s 150ms` / `-m 300ms` / `-l 450ms`에 타이밍 `cubic-bezier(0.3,0,0,1)`이며, 컴포넌트는 `--motion-transition-fast`/`-default`로 참조한다 [src:3][src:2].

z-index 레이어는 명시적으로 단계화돼 있다 [src:3][src:2]:

> Bezier는 앱 셸/뷰포트 브레이크포인트를 토큰으로 발행하지 않는다 — 간격 리듬은 4px 그리드 위에서 컴포넌트별 로컬 변수로 처리된다(상세는 Responsive Behavior 참조) [src:3].

## Rounded

코너 반경은 2px부터 44px까지의 토큰 램프에 비율형 한 종을 더한 구조다 — `--radius-42-p 42%`는 원형/스쿼클용이다 [src:3].

관찰된 사용처는 명확하다 — 버튼은 `{rounded.radius-6}`~`{rounded.radius-16}`, 모달은 `{rounded.radius-20}`, 배너/토스트/리스트아이템은 `{rounded.radius-12}`, 프로그레스바·슬라이더 트랙은 `{rounded.radius-3}`를 쓴다 [src:3][src:2]. **8~12px가 주력**이고, 큰 컨테이너일수록 16~20px로 커진다 [src:2].

별도로 `{component.smooth-corners-box}`가 `--b-smooth-corners-box-border-radius`·`-shadow-*` 로컬 변수로 iOS식 연속 곡률(squircle)을 그리고, 아바타가 `--b-smooth-corners-box-shadow-spread-radius`를 재사용한다 — 단순 라운드를 넘어선 부드러운 코너가 브랜드 시그니처다 [src:2].

`{rounded.radius-42-p}`(`42%`)는 공식 DESIGN.md 린터가 에러로 보고한다 — 명세(`alpha`)의 Dimension 은 px·em·rem 만 받는다. 비율 곡률은 요소 크기를 따라가므로 고정 길이로 옮기면 모양이 달라져, 값 그대로 두고 알려진 한계로 기록한다.

## Elevation & Depth

엘리베이션은 `--ev-1`~`--ev-6` 6단계이며, 각 단계가 inner-shadow + base-shadow + 점증하는 blur를 합성한다 — `--ev-3`은 `…, 0 4px 12px 0 var(--shdw-medium)`, `--ev-6`은 `…, 0 12px 60px 0 var(--shdw-xlarge)` 식으로 단계가 올라갈수록 퍼짐이 커진다 [src:3]. 컴포넌트는 `--elevation-1`~`--elevation-4`로 사용하며, 모달이 `--elevation-4`, 토스트·셀렉트가 `--elevation-3`, 배너가 `--elevation-2`다 [src:2].

깊이 언어도 라이트·다크 양 테마를 동등하게 다룬다 — 라이트와 다크가 `--shdw-*`를 서로 다른 알파 단계로 매핑해 테마별 그림자 강도를 보정한다 — 라이트 `shdw-medium` 은 `{colors.stable-black-15}`, 다크는 `{colors.stable-black-20}` 이고, white 알파는 `shdw-inner-base` 하나다(Colors 절 「기본 tier 그림자 색」 표) [src:3]. 다크는 별도 후처리가 아니라 그림자 토큰 레벨에서부터 분기되는 1급 테마다 [src:3][src:2].

```text
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

핵심 액션 버튼. `ButtonColorVariant`·`ButtonStyleVariant`·`ButtonSize`·`SideContent` 타입을 받고 CTA/Floating/Async/Dropdown/Composite 등 16 스토리를 가진다 [src:2]. `{rounded.radius-6}`~`{rounded.radius-16}`, `--elevation-2`/`--elevation-3`와 다수 accent fill을 쓴다 [src:2].

```tsx
<Button colorVariant="blue" styleVariant="primary" size="m">Click me</Button>
```

- **button-primary** (`styleVariant="primary"`) — 채워진 1차 액션. 배경에 `{colors.blue-400}` 계열 accent fill, 텍스트는 흰색으로 페이지의 주 행동을 담당한다 [src:2][src:3]. 다만 `{colors.blue-400}` 은 라이트 기준이다 — 상류 beta 의 `fill-accent-blue-heavier` 는 라이트 `{colors.blue-400}`·다크 `{colors.blue-300}` 이다 [src:3].
- **button-secondary** (`styleVariant="secondary"`) — 채도를 낮춘 2차 액션. primary와 구조를 공유하되 fill 무게를 낮춰 보조 행동에 쓴다 [src:2].
- **button-floating** — CTA/Floating 스토리의 떠 있는 변종으로 `--elevation-2`/`--elevation-3`로 표면에서 부양시킨다 [src:2].

### ButtonGroup

`ButtonGroupProps`. 여러 버튼을 한 묶음으로 정렬하는 레이아웃 래퍼다 [src:2].

### AlphaButton

차세대(alpha) 버튼. `ButtonColor`·`ButtonVariant`·`ButtonSize`를 받고 11개 accent text 토큰 + `{rounded.radius-6}`~`{rounded.radius-12}` 계열을 쓴다 [src:2].

### AlphaIconButton

아이콘 전용 alpha 버튼. `IconButtonProps`를 받으며, accent fill/icon/text 토큰을 50종 이상으로 가장 폭넓게 사용한다 [src:2].

### AlphaFloatingButton

떠 있는 FAB류 alpha 버튼. `FloatingButtonColor/Variant/Size`를 받고 `--color-fill-grey`와 `--elevation-2`/`--elevation-3`를 쓴다 [src:2].

### AlphaFloatingIconButton

아이콘형 플로팅 alpha 버튼. `FloatingIconButtonProps`를 받으며 `--elevation-2`/`--elevation-3`로 부양한다 [src:2].

### AlphaToggleButton

토글 가능한 alpha 버튼. `ToggleButtonProps`를 받고 `--state-input-active/default`와 `--typography-text-weight-bold`로 선택 상태를 표시한다 [src:2].

### AlphaToggleButtonGroup

단일/다중 선택 토글 그룹(alpha). `ToggleButtonSingleGroupProps`·`ToggleButtonMultipleGroupProps`로 단일·다중 모드를 가른다 [src:2].

### AlphaToggleEmojiButtonGroup

이모지 토글 버튼 그룹(alpha). `ToggleEmojiButtonGroupProps`를 받고 `--b-toggle-emoji-button-size`와 accent blue 토큰을 쓴다 [src:2].

### SegmentedControl

세그먼트형 선택 컨트롤. `SegmentedControlSize/Type` 등을 받고 `--b-segmented-control-*` 로컬 변수 + `--elevation-1`을 쓴다 [src:2].

**Forms / Inputs** — 입력 컨트롤은 `--state-input-*`(active/default/error) 토큰과 `--b-form-field-size`로 상태·밀도를 일원화한다.

### TextField

단행 입력. `TextFieldVariant`(primary/secondary)·`TextFieldType`(number/text/email/password/tel/search/hidden)·사이즈 `xl/l/m/xs`·`allowClear`·`hasError` props를 받는다 [src:2]. `--state-input-active/default/error`와 `{rounded.radius-8}`/`{rounded.radius-12}`를 쓰며, invalid 상태의 box-shadow는 orange 계열이다 [src:2].

```tsx
<TextField size="m" variant="primary" allowClear placeholder="this is placeholder" />
```

### TextArea

다행 입력. `TextAreaHeight`·`TextAreaProps`를 받고 `--state-input-*`와 `{rounded.radius-8}`를 쓴다 [src:2].

### Select

드롭다운 선택. `SelectProps`·`SelectRef`를 받으며 팝업에 `--elevation-3`, 트리거에 `--state-input-*`와 `{rounded.radius-8}`를 쓴다 [src:2].

### Checkbox

체크박스. `CheckboxSize`·`CheckedState`를 받고(controlled/uncontrolled 스토리) 선택 상태에 `--color-fill-accent-green-heavier`, `--state-input-active/error`를 쓴다 [src:2].

### RadioGroup

라디오 묶음. `RadioGroupProps`·`RadioProps`를 받고 green accent + `--state-input-active`로 선택을 표시한다 [src:2].

### Switch

온/오프 스위치. `SwitchSize`를 받고 `--b-switch-*`와 green-heavier fill, `--elevation-2`를 쓴다 [src:2].

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

합성형 모달(`ModalHeader/Body/Footer/Title/Trigger/Close`). `ModalTitleSize`를 받고 `--b-modal-width/height/collision-padding`, `--color-dim-absolute-black`, `--elevation-4`, `{rounded.radius-20}`을 쓴다 [src:2].

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

툴팁. `TooltipPosition`을 받고 `--color-surface-high`, `--elevation-3`, `--layer-z-index-tooltip`(1300), `{rounded.radius-8}`을 쓴다 [src:2].

### LegacyTooltip

구버전 툴팁. `LegacyTooltipPosition`·`GetTooltipStyle`을 받고 `--elevation-2`를 쓴다 — 신규 코드는 `{component.tooltip}` 또는 `{component.alpha-tooltip-primitive}`를 우선한다 [src:2].

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

아이콘 렌더러(602 SVG 세트 연동). `IconSize`를 받으며(AllIcons·UsageColor·UsageSize 스토리) `--b-icon-color`와 150ms `--motion-transition-fast`를 쓴다 [src:2].

```tsx
<Icon source={ChannelIcon} size="m" color="txt-black-darkest" />
```

### Emoji

이모지 렌더러. `EmojiSize`를 받고 `--b-emoji-background-image/size`로 스프라이트를 렌더한다 [src:2].

### Text

타이포 프리미티브. `TextProps`를 받고 `--b-text-color/font-size/line-height/letter-spacing/line-clamp` 로컬 변수로 `typography-size-24` 같은 묶음 토큰을 조립한다 [src:2].

**Feedback / Status** — 알림 표면은 blue/cobalt/green/orange/red accent를 상태별로 갈라 쓰고 `{rounded.radius-12}`를 공유한다.

### Banner

페이지 상단/인라인 알림 배너. **accent 20% 틴트 배경 + 선행 filled 아이콘(`info-filled`/`check-circle-filled` 등) + 텍스트(bold 리드) + 우측 닫기(`cancel-small`)** 한 줄 구성이다. 색은 blue(info)/cobalt(highlight)/green(success)/orange(warning)/red(critical)이고 글자·아이콘은 같은 hue의 솔리드값을 쓴다. `BannerVariant`·`RenderLinkFunc`(FullWidth/MaxWidth/MinWidth/Link/NoIcon 등 9 스토리)를 받고 `{rounded.radius-12}`·`--elevation-2`다 [src:2].

### Toast

토스트 알림 — **떠 있는 다크 바**다. `fill-neutral-heaviest`(흑 85% 알파) 배경에 흰 텍스트, 선행 상태 아이콘(예 `check-circle-filled`, `{colors.green-300}`) + 우측 액션 링크(`{colors.blue-300}`, 예 "실행 취소")로 구성되며 폭 약 300px, `--elevation-3`·`{rounded.radius-12}`다. `ToastAppearance`·`ToastPlacement`·`ToastPreset`·`ToastType`·`autoDismissTimeout`(기본 3000ms)·`zIndex` props를 받는다 [src:2].

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
- 유니코드·이모지를 UI 아이콘으로 쓰지 않는다 — Bezier는 자체 602 아이콘 세트(`@channel.io/bezier-icons` [src:4], 24×24 `currentColor`, outline/`-filled` 쌍)를 단일 출처로 두며, 이모지는 콘텐츠(채팅 리액션·👋)에서만 쓴다.
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
- **beta 팔레트는 이제 검증됐다(2026-07-29 정정).** 이 항목은 원래 "beta 팔레트 값 상당수가 공개 URL로 직접 교차검증되지 않는다"고 적고 있었으나, 실제로 대조해 보니 당시 이 문서의 색 토큰 전부가 `@channel.io/bezier-tokens` 0.6.0의 beta 엔트리와 ΔE ≤ 0.02로 일치했다(Colors 절 참조). 남은 공백은 **컴포넌트 정본 스펙**(Banner/Toast 처리 등)이며, 이쪽은 Storybook 개별 docs를 `?path=/docs/<id>`로 열어 대조해야 한다 [src:3][src:2].
- **시맨틱 다크 원시값은 이제 실렸다(2026-10-28 정정).** 이 항목은 원래 "다크 측이 참조하는 일부 white-알파 원시값의 정확한 단계는 코퍼스에서 전부 발췌되지 않았다"고 적고 있었으나, 상류 beta 엔트리에서 그 단계를 확인해 다크 글자·중립 채움이 가리키는 `white-8/20/40/60/80`, 라이트 중립 채움의 `black-5/15`, accent 채움 사다리를 frontmatter에 실었다(Colors 절 참조) [src:3].
- **hex 를 직접 적은 beta, alpha 역할은 참조 행이 없다(2026-11-09).** beta 테마 블록의 `-hovered` 역할과 hovered 가 아닌 `chart-theme-default-*`, alpha 테마 블록의 `-hovered` 역할은 상류가 두 테마 모두 원시값을 거치지 않고 hex 를 직접 적어, 가리킬 팔레트 토큰이 상류에 없다. 그래서 본문 표에만 `#hex ≈ oklch(…)` 로 싣고, frontmatter 참조 행과 사이드카(Tokens 탭·use-design-md 가 읽는 토큰 JSON)에는 없다. hex 가 원시값과 같은 칸(`fill-*-transparent-hovered` 계열의 `{hue}-400-10`·`{hue}-300-10`·`black-5`·`white-5`, alpha 의 `alpha-bg-*-transparent-hovered` 계열)도 상류가 그 원시값을 가리키는 것이 아니라 참조가 아니다 [src:3].
- **alpha 역할이 가리키지 않는 alpha 원시값은 싣지 않았다(2026-11-09).** alpha 역할이 가리키는 원시값은 모두 `alpha-` 앞붙임 키로 실었다. 어느 alpha 역할도 가리키지 않는 나머지 — 각 hue 의 `100`, `200`, `600` 단계와 `black-50`, `black-70`, `grey-300`, `grey-alpha-900-90` — 는 싣지 않았다 [src:3].
- **beta 역할이 가리키지 않는 투명 단계는 싣지 않았다(2026-11-01).** beta 역할이 가리키는 원시값은 모두 실었다(`{hue}-400-0`·`{hue}-300-0`·`blue-400-30`·`blue-300-45`·`orange-400-30` 포함). 어느 역할도 가리키지 않는 나머지 — 색상 알파(`{hue}-300-10`·`{hue}-400-5`, blue 밖의 `{hue}-300-45`, blue·orange 밖의 `{hue}-400-30`)와 중립색 알파(`grey-50/100/200/700/800/850-80`·`grey-700-90`·`grey-900-0/90`·`white-22/30/50`·`black-50/70`) — 는 싣지 않았다 [src:3].
- **모바일 리플로우 미관찰.** 제공 스크린샷이 데스크톱 Storybook 캔버스 한정이라, 실제 모바일 웹/네이티브에서의 컴포넌트 리플로우·접힘 거동은 직접 확인되지 않았다 [src:2].

## References

1. https://github.com/channel-io/bezier-react — 모노레포. Apache-2.0(© Channel Corp.), 이중 언어 운영 컨텍스트.
2. https://main--62bead1508281287d3c94d25.chromatic.com/ — Chromatic에 배포된 Storybook. `main--<appId>` 형태의 브랜치 퍼머링크라 빌드마다 바뀌지 않는다. **루트 URL은 JS 셸(약 9.6KB)이라 그 자체로는 읽을 내용이 없다** — 개별 문서는 `?path=/docs/<id>` 딥링크로 접근한다(예: `?path=/docs/components-button--docs`, `?path=/docs/foundation-color--docs`). 본문에서 `[src:2]`로 인용한 컴포넌트·foundation 서술은 각각 대응하는 `components-<이름 소문자>--docs` 항목을 가리킨다.
3. https://www.npmjs.com/package/@channel.io/bezier-tokens — 토큰 패키지 0.6.0. 값의 authoritative 출처이며 `dist/css`(stable, 변수 450개)·`dist/beta`·`dist/alpha` 3 tier를 함께 배포한다.
4. https://www.npmjs.com/package/@channel.io/bezier-icons — 아이콘 패키지 0.60.0, SVG 602개.
5. https://main--62bead1508281287d3c94d25.chromatic.com/index.json — 위 Storybook의 기계 판독 인덱스(엔트리 186 = docs 64 + 스토리 122). 컴포넌트 59개 이름과 docs 개수 주장을 직접 검증할 수 있는 항목이며, 루트 URL과 달리 텍스트로 내용을 반환한다.
