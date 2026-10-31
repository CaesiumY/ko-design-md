---
name: 팀스파르타
slug: teamsparta
category: education
logo: https://getdesign.kr/logos/teamsparta-favicon.png
last_updated: "2026-11-01"
created_at: "2026-05-13"
lang: ko
colors:
  ## Role layer — @teamsparta/stack-tokens semantic (light = baseSemanticColor, dark- = sccDark)
  brand-strong: "{colors.red-80}"
  brand-default: "{colors.red-70}"
  brand-subtle: "{colors.red-50}"
  brand-subtler: "{colors.red-20}"
  brand-subtlest: "{colors.red-5}"
  status-success-default: "{colors.green-70}"
  status-success-subtle: "{colors.green-50}"
  status-success-subtler: "{colors.green-20}"
  status-success-subtlest: "{colors.green-10}"
  status-warning-default: "{colors.yellow-70}"
  status-warning-subtle: "{colors.yellow-50}"
  status-warning-subtler: "{colors.yellow-20}"
  status-warning-subtlest: "{colors.yellow-10}"
  status-error-default: "{colors.orange-red-70}"
  status-error-subtle: "{colors.orange-red-50}"
  status-error-subtler: "{colors.orange-red-20}"
  status-error-subtlest: "{colors.orange-red-10}"
  status-processing-default: "{colors.blue-70}"
  status-processing-subtle: "{colors.blue-50}"
  status-processing-subtler: "{colors.blue-20}"
  status-processing-subtlest: "{colors.blue-10}"
  text-primary: "{colors.neutral-100}"
  text-secondary: "{colors.neutral-80}"
  text-tertiary: "{colors.neutral-60}"
  text-quaternary: "{colors.neutral-50}"
  text-inverse: "{colors.neutral-0}"
  icon-primary: "{colors.neutral-100}"
  icon-secondary: "{colors.neutral-80}"
  icon-tertiary: "{colors.neutral-60}"
  icon-quaternary: "{colors.neutral-50}"
  icon-inverse: "{colors.neutral-0}"
  background-default: "{colors.neutral-0}"
  background-subtle: "{colors.neutral-5}"
  background-modal: "{colors.neutral-0}"
  background-popover: "{colors.neutral-0}"
  line-selected: "{colors.neutral-80}"
  fill-default: "{colors.neutral-0}"
  fill-subtle: "{colors.neutral-10}"
  fill-inverse-default: "{colors.neutral-100}"
  fill-inverse-subtle: "{colors.neutral-80}"
  dark-brand-strong: "{colors.red-50}"
  dark-brand-default: "{colors.red-70}"
  dark-brand-subtle: "{colors.red-80}"
  dark-brand-subtler: "{colors.red-90}"
  dark-brand-subtlest: "{colors.red-100}"
  dark-status-success-default: "{colors.green-60}"
  dark-status-success-subtle: "{colors.green-70}"
  dark-status-success-subtler: "{colors.green-90}"
  dark-status-success-subtlest: "{colors.green-100}"
  dark-status-warning-default: "{colors.yellow-60}"
  dark-status-warning-subtle: "{colors.yellow-70}"
  dark-status-warning-subtler: "{colors.yellow-90}"
  dark-status-warning-subtlest: "{colors.yellow-100}"
  dark-status-error-default: "{colors.orange-red-60}"
  dark-status-error-subtle: "{colors.orange-red-70}"
  dark-status-error-subtler: "{colors.orange-red-90}"
  dark-status-error-subtlest: "{colors.orange-red-100}"
  dark-status-processing-default: "{colors.blue-60}"
  dark-status-processing-subtle: "{colors.blue-70}"
  dark-status-processing-subtler: "{colors.blue-90}"
  dark-status-processing-subtlest: "{colors.blue-100}"
  dark-text-primary: "{colors.neutral-0}"
  dark-text-secondary: "{colors.neutral-20}"
  dark-text-tertiary: "{colors.neutral-50}"
  dark-text-quaternary: "{colors.neutral-60}"
  dark-text-inverse: "{colors.neutral-100}"
  dark-icon-primary: "{colors.neutral-0}"
  dark-icon-secondary: "{colors.neutral-20}"
  dark-icon-tertiary: "{colors.neutral-50}"
  dark-icon-quaternary: "{colors.neutral-60}"
  dark-icon-inverse: "{colors.neutral-100}"
  dark-background-default: "{colors.neutral-100}"
  dark-background-subtle: "{colors.neutral-90}"
  dark-background-modal: "{colors.neutral-90}"
  dark-background-popover: "{colors.neutral-80}"
  dark-line-selected: "{colors.neutral-20}"
  dark-fill-inverse-default: "{colors.neutral-0}"
  dark-fill-inverse-subtle: "{colors.neutral-30}"
  ## Brand & interaction
  primary: "{colors.brand-red}"   # 명세의 대표색 역할 — 텍스트 축의 text-primary(neutral-100)와 다른 축
  brand-red: oklch(0.621 0.251 24)   # #FA0030 — 라이브 발행값 stack semantic-brand-default, 워드마크·primary CTA·progress highlight
  brand-red-dark: oklch(0.556 0.225 24)   # #D80028 — 라이브 발행값 stack semantic-brand-strong. primary CTA hover/pressed 역할은 번들 배정이며 라이브 CTA hover 로는 관측되지 않았다
  brand-red-soft: oklch(0.944 0.029 7)   # red badge and subtle alert surface
  interaction-blue: oklch(0.429 0.297 264)   # links, info, focus ring source. sRGB 색역 밖 — 브라우저가 클리핑하며 라이브는 더 낮은 채도를 쓴다(Colors 절 감사 메모 참조)
  interaction-blue-soft: oklch(0.958 0.020 280)
  teal-strong: oklch(0.378 0.066 224)   # active sidebar, live session, data cards
  ## Neutral scale
  white: oklch(1.000 0.000 0)
  gray-50: oklch(0.979 0.003 265)
  gray-100: oklch(0.954 0.005 258)
  gray-200: oklch(0.910 0.007 269)
  gray-300: oklch(0.829 0.009 265)
  gray-400: oklch(0.729 0.013 271)
  gray-500: oklch(0.569 0.011 267)
  gray-600: oklch(0.420 0.012 267)
  gray-700: oklch(0.298 0.011 271)
  gray-800: oklch(0.210 0.008 275)
  gray-900: oklch(0.164 0.011 268)
  gray-950: oklch(0.164 0.007 271)
  black: oklch(0.000 0.000 0)
  ## Semantic status
  success: oklch(0.627 0.170 149)
  warning: oklch(0.769 0.165 70)
  danger: oklch(0.646 0.226 33)   # #F94015 — 라이브 발행값 stack semantic-status-error-default. brand-red 와 별개 값이다
  info: oklch(0.429 0.297 264)   # interaction-blue 값 — sRGB 색역 밖이라 브라우저가 클리핑한다(Colors 절 감사 메모 참조)
  ## Semantic alias
  focus-ring: oklch(0.429 0.297 264 / 0.32)   # interaction-blue 값 — sRGB 색역 밖(Colors 절 감사 메모 참조)
  modal-backdrop: oklch(0.000 0.000 0 / 0.48)
  ## Supporting badge surfaces
  badge-blue-bg: oklch(0.932 0.034 286)
  badge-teal-bg: oklch(0.941 0.021 208)
  badge-green-bg: oklch(0.962 0.043 157)
  ## Stack palette — @teamsparta/stack-tokens primitiveColor (role layer 가 가리키는 단계만)
  neutral-0: oklch(1.000 0.000 0.0)   # #FFFFFF — stack-tokens neutral[0]
  neutral-5: oklch(0.982 0.001 286.4)   # #F9F9FA — stack-tokens neutral[5]
  neutral-10: oklch(0.959 0.003 286.3)   # #F1F1F3 — stack-tokens neutral[10]
  neutral-20: oklch(0.931 0.004 271.4)   # #E7E8EB — stack-tokens neutral[20]
  neutral-30: oklch(0.879 0.006 264.5)   # #D5D7DB — stack-tokens neutral[30]
  neutral-50: oklch(0.729 0.013 271.2)   # #A4A7B0 — stack-tokens neutral[50]
  neutral-60: oklch(0.628 0.017 273.7)   # #858893 — stack-tokens neutral[60]
  neutral-80: oklch(0.378 0.017 281.0)   # #40414B — stack-tokens neutral[80]
  neutral-90: oklch(0.307 0.013 279.2)   # #2E2F36 — stack-tokens neutral[90]
  neutral-100: oklch(0.164 0.007 271.0)   # #0D0E11 — stack-tokens neutral[100]
  red-5: oklch(0.984 0.011 339.3)   # #FFF7FC — stack-tokens red[5]
  red-20: oklch(0.936 0.038 350.6)   # #FFE0ED — stack-tokens red[20]
  red-50: oklch(0.736 0.167 10.2)   # #FF7791 — stack-tokens red[50]
  red-70: oklch(0.621 0.251 24.0)   # #FA0030 — stack-tokens red[70]
  red-80: oklch(0.556 0.225 24.0)   # #D80028 — stack-tokens red[80]
  red-90: oklch(0.494 0.199 21.9)   # #B80028 — stack-tokens red[90]
  red-100: oklch(0.351 0.140 15.5)   # #720021 — stack-tokens red[100]
  orange-red-10: oklch(0.964 0.018 26.1)   # #FFEFED — stack-tokens orangeRed[10]
  orange-red-20: oklch(0.929 0.036 26.3)   # #FFDFDB — stack-tokens orangeRed[20]
  orange-red-50: oklch(0.732 0.165 28.3)   # #FF7A6B — stack-tokens orangeRed[50]
  orange-red-60: oklch(0.684 0.207 33.9)   # #FF5A36 — stack-tokens orangeRed[60]
  orange-red-70: oklch(0.646 0.226 33.4)   # #F94015 — stack-tokens orangeRed[70]
  orange-red-90: oklch(0.528 0.207 30.4)   # #C71704 — stack-tokens orangeRed[90]
  orange-red-100: oklch(0.426 0.165 30.6)   # #941103 — stack-tokens orangeRed[100]
  yellow-10: oklch(0.976 0.024 83.4)   # #FFF6E5 — stack-tokens yellow[10]
  yellow-20: oklch(0.945 0.051 80.5)   # #FFEAC7 — stack-tokens yellow[20]
  yellow-50: oklch(0.842 0.146 78.0)   # #FFBE4D — stack-tokens yellow[50]
  yellow-60: oklch(0.804 0.164 72.0)   # #FFAB24 — stack-tokens yellow[60]
  yellow-70: oklch(0.772 0.174 64.6)   # #FF9900 — stack-tokens yellow[70]
  yellow-90: oklch(0.600 0.139 61.1)   # #BA6900 — stack-tokens yellow[90]
  yellow-100: oklch(0.478 0.109 63.2)   # #874D00 — stack-tokens yellow[100]
  green-10: oklch(0.980 0.034 145.3)   # #EBFFEB — stack-tokens green[10]
  green-20: oklch(0.948 0.076 144.9)   # #CFFCCF — stack-tokens green[20]
  green-50: oklch(0.820 0.170 143.8)   # #79E079 — stack-tokens green[50]
  green-60: oklch(0.772 0.202 143.3)   # #55D455 — stack-tokens green[60]
  green-70: oklch(0.710 0.225 142.7)   # #27C227 — stack-tokens green[70]
  green-90: oklch(0.520 0.177 142.5)   # #008000 — stack-tokens green[90]
  green-100: oklch(0.387 0.107 143.2)   # #185218 — stack-tokens green[100]
  blue-10: oklch(0.969 0.015 248.0)   # #EDF6FF — stack-tokens blue[10]
  blue-20: oklch(0.927 0.037 247.0)   # #D4EAFF — stack-tokens blue[20]
  blue-50: oklch(0.741 0.140 248.4)   # #5CB1FF — stack-tokens blue[50]
  blue-60: oklch(0.671 0.180 251.5)   # #2998FF — stack-tokens blue[60]
  blue-70: oklch(0.626 0.205 254.9)   # #0085FF — stack-tokens blue[70]
  blue-90: oklch(0.431 0.138 254.1)   # #004F99 — stack-tokens blue[90]
  blue-100: oklch(0.328 0.100 252.6)   # #003566 — stack-tokens blue[100]
typography:
  xs:
    fontFamily: "\"Pretendard Variable\", Pretendard, \"Pretendard Bold Placeholder\", -apple-system, BlinkMacSystemFont, system-ui, \"Malgun Gothic\", \"Apple SD Gothic Neo\", sans-serif"
    fontSize: 10px
    fontWeight: 700
    lineHeight: 1.20
    letterSpacing: 0.08em
  sm:
    fontFamily: "\"Pretendard Variable\", Pretendard, \"Pretendard Bold Placeholder\", -apple-system, BlinkMacSystemFont, system-ui, \"Malgun Gothic\", \"Apple SD Gothic Neo\", sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.40
    letterSpacing: 0.01em
  md:
    fontFamily: "\"Pretendard Variable\", Pretendard, \"Pretendard Bold Placeholder\", -apple-system, BlinkMacSystemFont, system-ui, \"Malgun Gothic\", \"Apple SD Gothic Neo\", sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.50
  lg:
    fontFamily: "\"Pretendard Variable\", Pretendard, \"Pretendard Bold Placeholder\", -apple-system, BlinkMacSystemFont, system-ui, \"Malgun Gothic\", \"Apple SD Gothic Neo\", sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  xl:
    fontFamily: "\"Pretendard Variable\", Pretendard, \"Pretendard Bold Placeholder\", -apple-system, BlinkMacSystemFont, system-ui, \"Malgun Gothic\", \"Apple SD Gothic Neo\", sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.55
  body-lg:
    fontFamily: "\"Pretendard Variable\", Pretendard, \"Pretendard Bold Placeholder\", -apple-system, BlinkMacSystemFont, system-ui, \"Malgun Gothic\", \"Apple SD Gothic Neo\", sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.55
  h3:
    fontFamily: "\"Pretendard Variable\", Pretendard, \"Pretendard Bold Placeholder\", -apple-system, BlinkMacSystemFont, system-ui, \"Malgun Gothic\", \"Apple SD Gothic Neo\", sans-serif"
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.35
  h2:
    fontFamily: "\"Pretendard Variable\", Pretendard, \"Pretendard Bold Placeholder\", -apple-system, BlinkMacSystemFont, system-ui, \"Malgun Gothic\", \"Apple SD Gothic Neo\", sans-serif"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.30
    letterSpacing: -0.01em
  h1:
    fontFamily: "\"Pretendard Variable\", Pretendard, \"Pretendard Bold Placeholder\", -apple-system, BlinkMacSystemFont, system-ui, \"Malgun Gothic\", \"Apple SD Gothic Neo\", sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.375
    letterSpacing: -0.015em
  display:
    fontFamily: "\"Pretendard Variable\", Pretendard, \"Pretendard Bold Placeholder\", -apple-system, BlinkMacSystemFont, system-ui, \"Malgun Gothic\", \"Apple SD Gothic Neo\", sans-serif"
    fontSize: 44px
    fontWeight: 700
    lineHeight: 1.20
    letterSpacing: -0.02em
spacing:
  space-1: 4px
  space-2: 6px
  space-3: 8px
  space-4: 10px
  space-5: 12px
  space-6: 15px
  space-7: 32px
  space-8: 40px
rounded:
  radius-xs: 6px   # inputs, tooltips, checkbox, compact chips
  radius-sm: 16px   # cards, modals, media tiles, video player
  radius-md: 50px   # pills, avatars, tags, primary CTAs, progress bars
elevation:
  shadow-sm: 0 1px 2px oklch(0.164 0.011 268 / 0.06), 0 1px 1px oklch(0.164 0.011 268 / 0.04)
  shadow-md: 0 4px 10px oklch(0.164 0.011 268 / 0.08), 0 1px 3px oklch(0.164 0.011 268 / 0.06)
  shadow-lg: 0 12px 28px oklch(0.164 0.011 268 / 0.14), 0 4px 10px oklch(0.164 0.011 268 / 0.08)
components:
  button-primary-hover:
    backgroundColor: "{colors.brand-red-dark}"
  button-secondary-hover:
    backgroundColor: "{colors.gray-50}"
  button-ghost:
    textColor: "{colors.interaction-blue}"
  button-ghost-hover:
    backgroundColor: "{colors.interaction-blue-soft}"
  topbar:
    height: 56px
  search:
    backgroundColor: "{colors.gray-50}"
    rounded: "{rounded.radius-md}"
  pill-red:
    backgroundColor: "{colors.brand-red-soft}"
    textColor: "{colors.brand-red-dark}"
  pill-blue:
    backgroundColor: "{colors.badge-blue-bg}"
    textColor: "{colors.interaction-blue}"
  pill-teal:
    backgroundColor: "{colors.badge-teal-bg}"
    textColor: "{colors.teal-strong}"
  pill-green:
    backgroundColor: "{colors.badge-green-bg}"
    textColor: "{colors.success}"
fonts:
  font-family-mono: "\"JetBrains Mono\", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
---

# 팀스파르타 (스파르타클럽) — design.md

> 팀스파르타가 운영하는 스파르타클럽 학습 생태계의 인증 대시보드 디자인 시스템이다. 본 문서는 Claude Design handoff bundle의 `스파르타클럽 Design System` README, `colors_and_type.css`, preview cards, dashboard UI kit, chat transcript를 1차 출처로 합성했다. 공개 공식 사이트와 내일배움캠프, 기업교육, 커리어 surface는 서비스 범위와 브랜드 맥락 확인용 보조 출처로 사용했다 [src:1][src:2][src:3][src:4]. 색 역할 계층과 그것이 가리키는 팔레트 단계는 팀스파르타가 npm에 발행한 토큰 패키지에서 옮겼다 [src:5]. 그 밖의 색·타이포·스페이싱·컴포넌트 정량값은 이 핸드오프 번들에서 재구성한 것이다. 다만 색 값에 한해서는 인용된 라이브 사이트가 실제로 서빙하는 색과 대조했고, 브랜드 red 3개는 번들값이 라이브에서 다른 역할의 색이었으므로 라이브 발행값으로 바로잡았다(Colors 절 감사 메모 참조).

## Brand & Style

스파르타클럽은 팀스파르타의 통합 소비자 브랜드로, 내일배움캠프, AI 입문/실무 강의, 재직자 캠프, 기업교육을 한 학습 여정 안에 묶는다. 디자인 시스템의 기준 surface는 마케팅 페이지가 아니라 수강생과 운영자가 쓰는 인증 대시보드이며, catalog → enrollment → learning dashboard → community → career로 이어지는 흐름을 전제로 한다.

브랜드 무드는 **warm, encouraging, confident, implementation-focused**다. “누구나 큰일 낼 수 있어”, “완주”, “찐한 관리”처럼 학습 지속과 실행을 밀어주는 어휘가 반복되지만, 장식적 과장보다 사용자가 지금 무엇을 해야 하는지 보여주는 동사 중심 문장이 우선한다. Product copy는 `해요/합니다` 존댓말을 쓰고, 버튼은 `학습 시작`, `수강신청`, `무료 체험`, `알림 신청`처럼 4~8자 동사 라벨을 선호한다. 본 catalog 문서는 제품 표면 카피와 달리 평서체로 기술한다.

시각 언어의 핵심은 **가벼운 학습 대시보드 + 강한 Sparta red CTA + link/info blue 분리**다. 번들 README는 제공 토큰의 electric blue와 실제 라이브 브랜드의 red wordmark/CTA 사이에 의미 충돌이 있음을 명시하고, blue는 링크·정보·focus, red는 identity·primary CTA·celebration에 배정한다. 따라서 한 컴포넌트 안에서 red와 blue를 동시에 primary 상태로 섞지 않고, 표면의 목적에 따라 한 축만 선택해야 한다.

## Colors

> **역할 계층 대조(2026-11-01).** 팀스파르타는 디자인 토큰을 npm 패키지 `@teamsparta/stack-tokens`로 발행한다 [src:5]. 이 패키지(2.6.0)는 원시 팔레트 `primitiveColor` 위에 역할 계층을 정의한다 — 라이트는 `baseSemanticColor`(스파르타클럽 테마 `sccLight`는 여기에 같은 brand 값만 다시 적는다), 다크는 `sccDark`다. 내일배움캠프는 그 역할을 `--stack-semantic-*` 커스텀 프로퍼티로 서빙한다 [src:2]. 아래 역할 표의 45개 역할은 패키지에서 옮겼고, 라이트 45개를 내일배움캠프 라이브 값과 hex로 대조하니 불일치는 0개였다. 내일배움캠프 라이브 페이지는 `--stack-semantic-*`를 라이트 값 한 벌로만 서빙하고 다크 테마 정의(`prefers-color-scheme` 분기 등)가 없어, 다크 값은 패키지로만 대조했다. 전에 frontmatter 첫머리에 있던 역할 행 11개(`bg-canvas`·`fg-primary`·`border-default` 등)는 핸드오프 번들이 붙인 이름이라 패키지에도 배포 CSS에도 없었고, 대응도 발행본과 달랐다(번들 `fg-secondary` → `gray-500`, 발행 `text-secondary` → `neutral-80`). 발행 이름이 아니므로 그 행을 지우고 발행 역할 계층으로 바꿨다. 번들 회색 `gray-*` 11단계는 발행 `neutral-*`와 거의 다른 값이라(같은 값은 `gray-400`·`gray-950` 둘) 그대로 두고, 역할이 가리키는 발행 단계는 `neutral-*`·`red-*` 등 별도 이름으로 실었다. 컴포넌트와 프리뷰는 아직 번들 값을 쓴다. 브랜드 red 3개(`brand-red`·`brand-red-dark`·`danger`)는 2026-09-24에 라이브 시맨틱 값(`brand-default`·`brand-strong`·`status-error-default`)으로 바로잡은 값이고 발행 원시 `red-70`·`red-80`·`orange-red-70`과 같다. `brand-red`는 라이브 사이트 4곳이 칠하는 브랜드 red(워드마크 fill·CTA 배경·내일배움캠프 히어로 배경·커리어 사이트 테넌트 테마)와 같은 값이다 [src:1][src:2][src:3][src:4]. `brand-red-soft`·`success` 등 번들에서 온 나머지 리터럴은 이번에 다시 맞추지 않았다.
>
> **`interaction-blue`는 sRGB 색역 밖이다.** `oklch(0.429 0.297 264)`를 선형 sRGB로 풀면 red 채널이 −0.0002로 음수라, 브라우저는 이 값을 그대로 그리지 못하고 클리핑한다. 라이브 사이트가 쓰는 가장 가까운 파랑은 `#003CDC` = `oklch(0.457 0.245 264)`로 **hue는 같고 채도가 낮은**(색역 안) 값이며 ΔE 0.059 떨어져 있다. 방침대로 값은 그대로 두고 차이만 적는다 — 이 토큰을 참조하는 `info`·`focus-ring`·`input-focus-ring`도 같은 값을 쓰므로 네 줄 모두에 같은 단서를 달았다. 다만 사이드카로 실려 나가는 건 앞의 셋뿐이다 — `input-focus-ring`은 컴포넌트 절에 있어 `tokens:build`의 색 토큰 추출 대상이 아니다.

색은 두 층이다. 역할 계층과 그것이 가리키는 `neutral-*`·`red-*`·`orange-red-*`·`yellow-*`·`green-*`·`blue-*` 단계는 발행 패키지에서 옮겼다 [src:5]. 그 밖의 팔레트(`gray-*`·`interaction-blue`·`teal-strong`·배지 표면 등)는 핸드오프 번들의 `colors_and_type.css`에서 왔다(위 대조로 라이브 발행값으로 바꾼 red 3개는 제외). 둘 다 catalog 규약에 따라 OKLCH로 변환해 표기한다. Blue는 interaction/info, red는 brand/CTA, teal은 informational active surface, cool gray는 dashboard structure를 담당한다.

### 역할 계층

역할 이름은 배포 CSS의 `--stack-semantic-<역할>` 이름이다 [src:2][src:5]. 원시 팔레트는 테마를 타지 않아서, 다크 열도 접두 없는 같은 팔레트 단계를 가리킨다. 불투명도 램프(`neutralBlueAlpha`·`neutralWhiteAlpha`·`neutralBlackAlpha`)나 리터럴을 가리키는 칸은 frontmatter 참조 행으로 싣지 않고 이 표에만 둔다.

| 역할 | 라이트 (`baseSemanticColor`) | 다크 (`sccDark`) |
| --- | --- | --- |
| `brand-strong` | `{colors.red-80}` | `{colors.red-50}` |
| `brand-default` | `{colors.red-70}` | `{colors.red-70}` |
| `brand-subtle` | `{colors.red-50}` | `{colors.red-80}` |
| `brand-subtler` | `{colors.red-20}` | `{colors.red-90}` |
| `brand-subtlest` | `{colors.red-5}` | `{colors.red-100}` |
| `brand-faint` | 리터럴 `oklch(0.670 0.219 17.9 / 0.15)` | 리터럴 `oklch(0.670 0.219 17.9 / 0.25)` |
| `status-success-default` | `{colors.green-70}` | `{colors.green-60}` |
| `status-success-subtle` | `{colors.green-50}` | `{colors.green-70}` |
| `status-success-subtler` | `{colors.green-20}` | `{colors.green-90}` |
| `status-success-subtlest` | `{colors.green-10}` | `{colors.green-100}` |
| `status-warning-default` | `{colors.yellow-70}` | `{colors.yellow-60}` |
| `status-warning-subtle` | `{colors.yellow-50}` | `{colors.yellow-70}` |
| `status-warning-subtler` | `{colors.yellow-20}` | `{colors.yellow-90}` |
| `status-warning-subtlest` | `{colors.yellow-10}` | `{colors.yellow-100}` |
| `status-error-default` | `{colors.orange-red-70}` | `{colors.orange-red-60}` |
| `status-error-subtle` | `{colors.orange-red-50}` | `{colors.orange-red-70}` |
| `status-error-subtler` | `{colors.orange-red-20}` | `{colors.orange-red-90}` |
| `status-error-subtlest` | `{colors.orange-red-10}` | `{colors.orange-red-100}` |
| `status-processing-default` | `{colors.blue-70}` | `{colors.blue-60}` |
| `status-processing-subtle` | `{colors.blue-50}` | `{colors.blue-70}` |
| `status-processing-subtler` | `{colors.blue-20}` | `{colors.blue-90}` |
| `status-processing-subtlest` | `{colors.blue-10}` | `{colors.blue-100}` |
| `text-primary` | `{colors.neutral-100}` | `{colors.neutral-0}` |
| `text-secondary` | `{colors.neutral-80}` | `{colors.neutral-20}` |
| `text-tertiary` | `{colors.neutral-60}` | `{colors.neutral-50}` |
| `text-quaternary` | `{colors.neutral-50}` | `{colors.neutral-60}` |
| `text-inverse` | `{colors.neutral-0}` | `{colors.neutral-100}` |
| `icon-primary` | `{colors.neutral-100}` | `{colors.neutral-0}` |
| `icon-secondary` | `{colors.neutral-80}` | `{colors.neutral-20}` |
| `icon-tertiary` | `{colors.neutral-60}` | `{colors.neutral-50}` |
| `icon-quaternary` | `{colors.neutral-50}` | `{colors.neutral-60}` |
| `icon-inverse` | `{colors.neutral-0}` | `{colors.neutral-100}` |
| `background-default` | `{colors.neutral-0}` | `{colors.neutral-100}` |
| `background-subtle` | `{colors.neutral-5}` | `{colors.neutral-90}` |
| `background-modal` | `{colors.neutral-0}` | `{colors.neutral-90}` |
| `background-popover` | `{colors.neutral-0}` | `{colors.neutral-80}` |
| `line-clickable` | `neutralBlueAlpha[15]` = `oklch(0.328 0.100 252.6 / 0.15)` — 불투명도 램프 | `neutralWhiteAlpha[20]` = `oklch(1.000 0.000 0.0 / 0.2)` — 불투명도 램프 |
| `line-nonClickable` | `neutralBlueAlpha[12]` = `oklch(0.328 0.100 252.6 / 0.12)` — 불투명도 램프 | `neutralWhiteAlpha[12]` = `oklch(1.000 0.000 0.0 / 0.12)` — 불투명도 램프 |
| `line-selected` | `{colors.neutral-80}` | `{colors.neutral-20}` |
| `dimm-default` | `neutralBlackAlpha[60]` = `oklch(0.164 0.007 271.0 / 0.6)` — 불투명도 램프 | `neutralBlackAlpha[60]` = `oklch(0.164 0.007 271.0 / 0.6)` — 불투명도 램프 |
| `fill-default` | `{colors.neutral-0}` | `neutralBlackAlpha[0]` = `oklch(0.164 0.007 271.0 / 0)` — 불투명도 램프 |
| `fill-subtle` | `{colors.neutral-10}` | `neutralWhiteAlpha[12]` = `oklch(1.000 0.000 0.0 / 0.12)` — 불투명도 램프 |
| `fill-inverse-default` | `{colors.neutral-100}` | `{colors.neutral-0}` |
| `fill-inverse-subtle` | `{colors.neutral-80}` | `{colors.neutral-30}` |
| `fill-transparent` | `neutralWhiteAlpha[0]` = `oklch(1.000 0.000 0.0 / 0)` — 불투명도 램프 | `neutralBlackAlpha[0]` = `oklch(0.164 0.007 271.0 / 0)` — 불투명도 램프 |

## Typography

Primary typeface is **Pretendard Variable** with Korean system fallbacks. The handoff explicitly confirms Pretendard as the intended font and keeps the CDN import in the token file; production may self-host the same family without changing metrics.

The dashboard scale is dense and Korean SaaS-oriented: small labels and rows use 12~14px, dashboard headings use 22~32px, and display moments stop at 44px. Headings and CTAs lean on 700 weight; body copy stays 400~500 and uses relaxed line-height for Korean readability.

숫자와 진행률은 dashboard scan 대상이므로 `font-variant-numeric: tabular-nums`를 적용한다. 학습 시간, 완료 강의 수, 출석일, 과제 제출률 같은 metric card는 숫자를 22px/700 이상으로 두고 label은 11~12px uppercase-style overline으로 낮춘다.

## Spacing

Spacing은 8-step scale을 사용한다. `15px`까지는 컴포넌트 내부 밀도, `32px`부터는 section/gutter 단위로 쓰며, README는 중간에 20px/24px 단계를 임의로 만들지 말라고 명시한다.

Dashboard layout은 240px fixed sidebar, 56px sticky topbar, desktop content gutter 32px, mobile gutter 15px를 기준으로 한다. Card 내부 stack은 10~12px이 표준이고, card grid 간격은 14~16px의 조밀한 리듬을 사용한다.

## Rounded

Radius는 세 단계로 제한한다.

팀스파르타 표면의 signature는 50px pill CTA다. 일반 카드와 media tile은 16px로 부드럽게 묶고, input과 focusable control은 6px를 써서 대시보드 밀도를 유지한다.

## Elevation & Depth

시스템은 flat-first다. 기본 card, sidebar, topbar, list row는 shadow 없이 `1px` border로 구조를 만들고, elevation은 dropdown, toast, modal 같은 floating surface에만 쓴다.

Hover elevation은 clickable media card에만 제한적으로 허용한다. Primary CTA는 hover 때 shadow를 키우기보다 red를 어둡게 하고, active/press는 `scale(0.98)`과 shadow 제거로 반응한다.

## Shapes

Shape language는 **rounded dashboard geometry**다. 사각형 컨테이너는 16px card radius를 반복하고, 행동·상태·진행 요소는 pill 또는 capsule로 처리한다. Sidebar active item은 rectangular pill에 가깝고, avatar·badge·progress fill은 모두 50px radius로 통일된다.

브랜드 그래픽은 marketing surface에서는 사람 중심 이미지와 product screenshot mockup을 쓰지만, dashboard chrome 안에서는 평면 카드와 선형 iconography가 우선한다. 아이콘은 custom font가 아니라 Lucide/Heroicons 계열의 1.5px outline을 기준으로 하며, filled icon과 outline icon을 같은 surface에서 섞지 않는다.

## Components

### Button primary

Primary button은 Sparta red 배경, white foreground, 50px radius, 700 weight를 사용한다. 주요 CTA는 `수강신청`, `무료 체험 시작`, `이어서 학습`, `참여하기`처럼 동사 중심으로 작성한다.

```tsx
<Button variant="primary" size="md">이어서 학습</Button>
```

```text
button-primary-bg: brand-red
button-primary-hover-bg: brand-red-dark
button-primary-fg: white
button-primary-radius: radius-md
button-primary-focus: focus-ring
```

### Button secondary and ghost

Secondary는 white surface와 gray-200 border로 구조를 만들고, hover에서는 gray-50으로만 살짝 떠오른다. Ghost는 background 없이 interaction blue text를 사용하며 로그인, 보조 이동, link-like action에 쓴다.

```text
button-secondary-bg: white
button-secondary-border: gray-200
button-secondary-hover-bg: gray-50
button-ghost-fg: interaction-blue
button-ghost-hover-bg: interaction-blue-soft
```

### Sidebar

Sidebar는 240px fixed width, full-height sticky, white surface, gray-100 border-right를 사용한다. Active nav item은 teal-strong fill과 white text로 처리해 red CTA와 경쟁하지 않는다.

```tsx
<Sidebar active="catalog" onNav={setScreen} />
```

### Topbar and search

Topbar는 56px sticky header이며 shadow 없이 하단 border만 사용한다. Search box는 gray-50 pill field이고, width는 desktop에서 280px를 기준으로 한다.

```text
topbar-height: 56px
search-radius: radius-md
search-bg: gray-50
```

### Card

Card는 white surface, gray-100/200 border, 16px radius, 20px padding이 기본이다. Course card는 media thumbnail, badge row, title/description, metadata footer로 구성되며, 사용자의 iteration 결과 metadata footer는 하단에 고정하고 card 높이는 row 안에서 일관되게 유지한다.

```text
card-bg: white
card-border: gray-100
card-radius: radius-sm
card-padding: 20px
card-gap: 10px
card-footer-pin: true
```

### Pill and badge

Pill은 50px radius, 11px/700 label, 3px 10px padding을 쓴다. Red badge는 hot/new/primary emphasis, teal은 국비지원/취업 보장 같은 정보성 상태, green은 completion/success, blue는 new/info에 배정한다.

```text
pill-red:   { bg: brand-red-soft, fg: brand-red-dark }
pill-blue:  { bg: badge-blue-bg, fg: interaction-blue }
pill-teal:  { bg: badge-teal-bg, fg: teal-strong }
pill-green: { bg: badge-green-bg, fg: success }
```

### Form input

Input은 6px radius, 14px text, 10px 12px padding, gray-200 border를 사용한다. Focus-visible은 border 색만 바꾸지 않고 interaction blue ring을 외곽에 둔다. Error는 red border와 red helper text를 쓰며 input background를 red로 칠하지 않는다.

```text
input-radius: radius-xs
input-border: gray-200
input-focus-ring: oklch(0.429 0.297 264 / 0.18)   # interaction-blue 값 — sRGB 색역 밖(Colors 절 감사 메모 참조)
input-error-border: danger
```

### Select

Select는 native chevron을 숨기고 오른쪽 36px padding 안에 custom chevron을 둔다. 텍스트 시작점은 input과 같은 12px left padding에 맞추며, chevron이 텍스트 baseline을 밀지 않도록 한다.

### Checkbox

Checkbox는 label과 input을 semantic하게 연결하고, label 전체가 클릭 영역이 되도록 한다. Checked state는 red fill과 white check glyph를 사용하고, focus-visible은 blue ring을 유지한다.

### Course row and progress

Course row는 52px thumbnail, badge/track, single-line title, next lesson, right-aligned progress percentage로 구성한다. Progress track은 gray-100, fill은 brand-red 또는 success green을 사용하며 radius-md로 capsule 처리한다.

### Lesson player

Lesson player는 16:9 dark video frame, 16px radius, red radial emphasis, large 50px play button, bottom progress bar를 사용한다. Curriculum accordion은 active week를 gray-50 surface로 열고, 완료 상태는 success green, 현재 상태는 brand-red로 구분한다.

## Do's and Don'ts

### Do

- Sparta red는 아이덴티티·primary CTA·진행률 강조·축하 상태에 사용한다.
- interaction blue는 링크·정보·포커스 링·ghost 액션에 사용하고, primary 브랜드 아이덴티티에는 쓰지 않는다.
- 대시보드 표면은 1px 보더와 절제된 그림자로 평면을 유지한다.
- 리스트·메타데이터·컨트롤에는 Pretendard Variable과 12~14px 고밀도 대시보드 텍스트를 사용한다.
- 행 안의 카드 높이는 일정하게 유지하고, 비교 가능한 항목 카드는 메타데이터를 하단 가장자리에 고정한다.
- 체크박스는 시맨틱 label/input 연결을 사용하고, select 셰브론에는 충분한 우측 패딩을 둔다.
- 한국어 product 카피는 따뜻하고 구체적이며 동사 중심의 `해요/합니다` 톤으로 작성한다.

### Don't

- 한 컴포넌트 안에서 red와 blue를 경쟁하는 primary 상태로 섞지 않는다.
- 문서화된 15px와 32px 단계 사이에 20px·24px 같은 spacing 토큰을 임의로 만들지 않는다.
- 기본 카드·행·사이드바·탑바에 무거운 그림자를 적용하지 않는다.
- 대시보드 chrome 아이콘으로 이모지를 사용하지 않는다 — 아웃라인 아이콘을 사용한다.
- 포커스 상태를 보더 색만으로 표현하지 않는다.
- 입력 오류에 빨강 배경을 사용하지 않는다 — 오류 피드백은 보더·헬퍼 텍스트로 전달한다.
- 팀스파르타의 온라인 학습 제품 도메인(lesson player, 커리큘럼·진행률 아코디언, `수강신청`/`이어서 학습` 등록 흐름, catalog → enrollment → dashboard → community → career 여정)을 성격이 다른 제품에 그대로 이식하지 않는다 — 차용할 것은 시각 언어(단일 브랜드·CTA 강조색 Sparta red, 50px pill·700 weight 버튼, 12~14px 고밀도 대시보드 타이포, 평면 1px 보더 카드, 링크·포커스용 interaction blue를 브랜드 red와 분리)이지 팀스파르타의 강의 플랫폼 개념이 아니다.

## Responsive Behavior

| Breakpoint | Key Changes |
|---|---|
| Desktop | 240px sidebar, 56px topbar, 32px content gutter, 12-column grid, card gutter 24px where density allows. |
| Compact desktop/tablet | Keep sidebar if workspace permits; reduce card grid to 2 columns and use 15px compact gutters. |
| Mobile | Collapse sidebar into top navigation or drawer, use 15px content gutter, keep touch targets at least 36~40px high. |

Cards and course rows must preserve scan order: thumbnail → badge/track → title → progress/price metadata. On narrow screens, metadata can wrap below the title, but it should remain visually grouped and not detach from the card footer.

## Known Gaps

- No original Figma file or production codebase was included in the handoff bundle.
- The blue-vs-red token semantics are documented as a caveat and should be confirmed by the team before production adoption.
- The dashboard default theme is not confirmed; the bundle authored light mode as default while keeping dark-mode tokens available.
- No custom icon library was included; Lucide/Heroicons-style outline icons are the documented fallback.
- The published palette is upstream and is carried: the `neutral-*`/`red-*`/`orange-red-*`/`yellow-*`/`green-*`/`blue-*` steps the role layer points at were added from `@teamsparta/stack-tokens` [src:5]. What is not yet aligned is this entry's bundle palette (`gray-*`, `brand-red-soft`, `success`, `warning`, the `interaction-blue` family, `teal-strong`, badge surfaces) and the component specs and preview that use it — moving them to the published values means changing existing values, and a maintainer decision (2026-11-01) split that into follow-up work. The package's component tokens (`button`, `checkbox`, …) are upstream too and are left to the same follow-up.

## References

1. https://spartaclub.kr/ — 스파르타클럽 공식 사이트 (서비스 범위·브랜드 맥락)
2. https://nbcamp.spartaclub.kr/ — 내일배움캠프. 색 토큰을 `--stack-semantic-*`·`--stack-primitive-*` CSS 커스텀 프로퍼티로 서빙한다
3. https://b2b.spartaclub.kr/ — 팀스파르타 기업교육. `axis.spartapartners.ai`로 리다이렉트된다
4. https://career.spartaclub.kr/ — 팀스파르타 커리어. 외부 채용 플랫폼(Greeting) 위의 페이지라 플랫폼 고유 색 토큰이 섞여 있고, 브랜드 red는 테넌트 테마가 `--primitive-color-brand-500`을 덮어써 넣는다
5. https://cdn.jsdelivr.net/npm/@teamsparta/stack-tokens@2.6.0/dist/ — 팀스파르타가 npm에 발행한 토큰 패키지 `@teamsparta/stack-tokens` 2.6.0의 배포 파일. 원시 팔레트(`primitiveColor`), 라이트 역할 계층(`baseSemanticColor`), 서비스별 테마(`sccLight`·`sccDark` 등)가 들어 있다
