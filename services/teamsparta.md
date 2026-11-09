---
name: 팀스파르타
slug: teamsparta
category: education
logo: https://getdesign.kr/logos/teamsparta-favicon.png
last_updated: "2026-11-10"
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
  ## Bundle-only — 핸드오프 번들 색 가운데 발행 패키지에 대응 값이 없는 것만 (Colors 절 감사 메모 참조)
  interaction-blue: oklch(0.429 0.297 264)   # 번들 전용 — links, ghost action, focus ring source. 발행 원시 팔레트에 같은 값이 없다(가장 가까운 deepBlue[80] 도 ΔE 0.106). sRGB 색역 밖 — 브라우저가 클리핑하며 라이브는 더 낮은 채도를 쓴다(Colors 절 감사 메모 참조)
  focus-ring: oklch(0.429 0.297 264 / 0.32)   # 번들 전용 — interaction-blue 값. 발행 패키지에 포커스 링 토큰이 없다. sRGB 색역 밖(Colors 절 감사 메모 참조)
  ## Stack palette — @teamsparta/stack-tokens primitiveColor (역할 계층, 컴포넌트 토큰, 컴포넌트 스펙이 가리키는 단계만)
  neutral-0: oklch(1.000 0.000 0.0)   # #FFFFFF — stack-tokens neutral[0]
  neutral-5: oklch(0.982 0.001 286.4)   # #F9F9FA — stack-tokens neutral[5]
  neutral-10: oklch(0.959 0.003 286.3)   # #F1F1F3 — stack-tokens neutral[10]
  neutral-20: oklch(0.931 0.004 271.4)   # #E7E8EB — stack-tokens neutral[20]
  neutral-30: oklch(0.879 0.006 264.5)   # #D5D7DB — stack-tokens neutral[30]
  neutral-40: oklch(0.808 0.010 267.3)   # #BDC0C7 — stack-tokens neutral[40]
  neutral-50: oklch(0.729 0.013 271.2)   # #A4A7B0 — stack-tokens neutral[50]
  neutral-60: oklch(0.628 0.017 273.7)   # #858893 — stack-tokens neutral[60]
  neutral-70: oklch(0.520 0.019 278.2)   # #666874 — stack-tokens neutral[70]
  neutral-80: oklch(0.378 0.017 281.0)   # #40414B — stack-tokens neutral[80]
  neutral-90: oklch(0.307 0.013 279.2)   # #2E2F36 — stack-tokens neutral[90]
  neutral-100: oklch(0.164 0.007 271.0)   # #0D0E11 — stack-tokens neutral[100]
  red-5: oklch(0.984 0.011 339.3)   # #FFF7FC — stack-tokens red[5]
  red-20: oklch(0.936 0.038 350.6)   # #FFE0ED — stack-tokens red[20]
  red-50: oklch(0.736 0.167 10.2)   # #FF7791 — stack-tokens red[50]
  primary: "{colors.red-70}"   # 명세의 대표색 역할 — 텍스트 축의 text-primary(neutral-100)와 다른 축
  red-70: oklch(0.621 0.251 24.0)   # #FA0030 — stack-tokens red[70]
  red-80: oklch(0.556 0.225 24.0)   # #D80028 — stack-tokens red[80]
  red-90: oklch(0.494 0.199 21.9)   # #B80028 — stack-tokens red[90]
  red-100: oklch(0.351 0.140 15.5)   # #720021 — stack-tokens red[100]
  orange-red-10: oklch(0.964 0.018 26.1)   # #FFEFED — stack-tokens orangeRed[10]
  orange-red-20: oklch(0.929 0.036 26.3)   # #FFDFDB — stack-tokens orangeRed[20]
  orange-red-50: oklch(0.732 0.165 28.3)   # #FF7A6B — stack-tokens orangeRed[50]
  orange-red-60: oklch(0.684 0.207 33.9)   # #FF5A36 — stack-tokens orangeRed[60]
  orange-red-70: oklch(0.646 0.226 33.4)   # #F94015 — stack-tokens orangeRed[70]
  orange-red-80: oklch(0.581 0.231 30.4)   # #E31700 — stack-tokens orangeRed[80]
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
  green-80: oklch(0.607 0.203 142.6)   # #099E09 — stack-tokens green[80]
  green-90: oklch(0.520 0.177 142.5)   # #008000 — stack-tokens green[90]
  green-100: oklch(0.387 0.107 143.2)   # #185218 — stack-tokens green[100]
  blue-10: oklch(0.969 0.015 248.0)   # #EDF6FF — stack-tokens blue[10]
  blue-20: oklch(0.927 0.037 247.0)   # #D4EAFF — stack-tokens blue[20]
  blue-50: oklch(0.741 0.140 248.4)   # #5CB1FF — stack-tokens blue[50]
  blue-60: oklch(0.671 0.180 251.5)   # #2998FF — stack-tokens blue[60]
  blue-70: oklch(0.626 0.205 254.9)   # #0085FF — stack-tokens blue[70]
  blue-90: oklch(0.431 0.138 254.1)   # #004F99 — stack-tokens blue[90]
  blue-100: oklch(0.328 0.100 252.6)   # #003566 — stack-tokens blue[100]
  sky-blue-10: oklch(0.959 0.029 215.7)   # #DDF7FE — stack-tokens skyBlue[10]
  sky-blue-90: oklch(0.378 0.066 224.3)   # #0B495C — stack-tokens skyBlue[90]
  deep-blue-10: oklch(0.958 0.015 270.0)   # #EDF1FC — stack-tokens deepBlue[10]
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
  elevation1: 0px 8px 24px 0px oklch(0.000 0.000 0 / 0.08), 0px 0px 4px 0px oklch(0.000 0.000 0 / 0.12)   # stack-tokens effect.shadow.elevation1 — 라이트 card.shadow
  elevation2: 0px 18px 33px 0px oklch(0.000 0.000 0 / 0.02), 0px 8px 40px 0px oklch(0.000 0.000 0 / 0.10), 0px 0px 6px 0px oklch(0.000 0.000 0 / 0.10)   # stack-tokens effect.shadow.elevation2 — 다크(sccDark) card.shadow
components:
  ## stack-tokens component tokens (baseComponent = sccLight). 다크(sccDark)는 Components 절 표
  button-solid-primary:
    backgroundColor: "{colors.brand-default}"
    textColor: "{colors.neutral-0}"
    rounded: "{rounded.radius-md}"
  button-solid-primary-hover:
    backgroundColor: "{colors.brand-strong}"
  button-solid-secondary:
    backgroundColor: "{colors.neutral-100}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.radius-md}"
  button-solid-secondary-hover:
    backgroundColor: "{colors.neutral-80}"
  button-solid-tertiary:
    backgroundColor: "{colors.neutral-20}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.radius-md}"
  button-solid-tertiary-hover:
    backgroundColor: "{colors.neutral-30}"
  button-solid-error:
    backgroundColor: "{colors.orange-red-70}"
    textColor: "{colors.neutral-0}"
    rounded: "{rounded.radius-md}"
  button-solid-error-hover:
    backgroundColor: "{colors.orange-red-80}"
  button-outline-primary:
    backgroundColor: "{colors.neutral-0}"
    textColor: "{colors.brand-default}"
    rounded: "{rounded.radius-md}"
  button-outline-primary-hover:
    backgroundColor: "{colors.brand-subtlest}"
  button-outline-secondary:
    backgroundColor: "{colors.neutral-0}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.radius-md}"
  button-outline-secondary-hover:
    backgroundColor: "{colors.neutral-10}"
  switch-checked-brand:
    backgroundColor: "{colors.brand-default}"
  switch-checked-brand-hover:
    backgroundColor: "{colors.brand-strong}"
  switch-checked-green:
    backgroundColor: "{colors.green-70}"
  switch-checked-green-hover:
    backgroundColor: "{colors.green-80}"
  switch-unchecked:
    backgroundColor: "{colors.neutral-30}"
  switch-unchecked-hover:
    backgroundColor: "{colors.neutral-40}"
  checkbox-checked:
    backgroundColor: "{colors.brand-default}"
    rounded: "{rounded.radius-xs}"
  checkbox-checked-hover:
    backgroundColor: "{colors.brand-strong}"
  checkbox-unchecked:
    backgroundColor: "{colors.fill-default}"
    rounded: "{rounded.radius-xs}"
  checkbox-unchecked-hover:
    backgroundColor: "{colors.fill-subtle}"
  radio-group-checked:
    backgroundColor: "{colors.fill-default}"
  radio-group-checked-hover:
    backgroundColor: "{colors.fill-subtle}"
  radio-group-unchecked:
    backgroundColor: "{colors.fill-default}"
  radio-group-unchecked-hover:
    backgroundColor: "{colors.fill-subtle}"
  bottom-sheet-grabber:
    backgroundColor: "{colors.neutral-20}"
  calendar-nav-button:
    backgroundColor: "{colors.neutral-0}"
  calendar-nav-button-hover:
    backgroundColor: "{colors.neutral-10}"
  calendar-date-cell:
    textColor: "{colors.text-secondary}"
  calendar-date-cell-hover:
    backgroundColor: "{colors.background-subtle}"
  calendar-date-cell-selected:
    backgroundColor: "{colors.neutral-80}"
    textColor: "{colors.text-inverse}"
  calendar-date-cell-selected-hover:
    backgroundColor: "{colors.neutral-70}"
  calendar-date-cell-range-middle:
    backgroundColor: "{colors.neutral-20}"
    textColor: "{colors.text-secondary}"
  calendar-date-cell-range-middle-hover:
    backgroundColor: "{colors.neutral-30}"
  ## Bundle components — 패키지에 컴포넌트 토큰이 없어 번들 스펙을 발행 값에 다시 건 것. ghost 버튼과 blue 배지 글자의 파랑(interaction-blue)만 번들 값으로 남는다
  button-ghost:
    textColor: "{colors.interaction-blue}"
  button-ghost-hover:
    backgroundColor: "{colors.deep-blue-10}"
  topbar:
    height: 56px
  search:
    backgroundColor: "{colors.background-subtle}"
    rounded: "{rounded.radius-md}"
  pill-red:
    backgroundColor: "{colors.brand-subtlest}"
    textColor: "{colors.brand-strong}"
  pill-blue:
    backgroundColor: "{colors.blue-20}"
    textColor: "{colors.interaction-blue}"
  pill-teal:
    backgroundColor: "{colors.sky-blue-10}"
    textColor: "{colors.sky-blue-90}"
  pill-green:
    backgroundColor: "{colors.green-10}"
    textColor: "{colors.green-90}"
fonts:
  font-family-mono: "\"JetBrains Mono\", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
---

# 팀스파르타 (스파르타클럽) — design.md

> 팀스파르타가 운영하는 스파르타클럽 학습 생태계의 인증 대시보드 디자인 시스템이다. 본 문서는 Claude Design handoff bundle의 `스파르타클럽 Design System` README, `colors_and_type.css`, preview cards, dashboard UI kit, chat transcript를 1차 출처로 합성했다. 공개 공식 사이트와 내일배움캠프, 기업교육, 커리어 surface는 서비스 범위와 브랜드 맥락 확인용 보조 출처로 사용했다 [src:1][src:2][src:3][src:4]. 색 역할 계층, 원시 팔레트, 컴포넌트 토큰은 팀스파르타가 npm에 발행한 토큰 패키지에서 옮겼다 [src:5]. 타이포, 스페이싱, 라운드와 컴포넌트의 크기와 여백은 이 핸드오프 번들에서 재구성했다. 색은 발행 패키지에 대응 값이 없는 번들 파랑 `interaction-blue`와, 같은 파랑에 투명도를 건 `focus-ring`과 본문의 `input-focus-ring`만 번들 값으로 남겼다(Colors 절 감사 메모 참조).

## Brand & Style

스파르타클럽은 팀스파르타의 통합 소비자 브랜드로, 내일배움캠프, AI 입문/실무 강의, 재직자 캠프, 기업교육을 한 학습 여정 안에 묶는다. 디자인 시스템의 기준 surface는 마케팅 페이지가 아니라 수강생과 운영자가 쓰는 인증 대시보드이며, catalog → enrollment → learning dashboard → community → career로 이어지는 흐름을 전제로 한다.

브랜드 무드는 **warm, encouraging, confident, implementation-focused**다. “누구나 큰일 낼 수 있어”, “완주”, “찐한 관리”처럼 학습 지속과 실행을 밀어주는 어휘가 반복되지만, 장식적 과장보다 사용자가 지금 무엇을 해야 하는지 보여주는 동사 중심 문장이 우선한다. Product copy는 `해요/합니다` 존댓말을 쓰고, 버튼은 `학습 시작`, `수강신청`, `무료 체험`, `알림 신청`처럼 4~8자 동사 라벨을 선호한다. 본 catalog 문서는 제품 표면 카피와 달리 평서체로 기술한다.

시각 언어의 핵심은 **가벼운 학습 대시보드 + 강한 Sparta red CTA + link/info blue 분리**다. 번들 README는 제공 토큰의 electric blue와 실제 라이브 브랜드의 red wordmark/CTA 사이에 의미 충돌이 있음을 명시하고, blue는 링크·정보·focus, red는 identity·primary CTA·celebration에 배정한다. 따라서 한 컴포넌트 안에서 red와 blue를 동시에 primary 상태로 섞지 않고, 표면의 목적에 따라 한 축만 선택해야 한다.

## Colors

> **번들 팔레트 정리(2026-11-10).** 팀스파르타는 디자인 토큰을 npm 패키지 `@teamsparta/stack-tokens`로 발행한다 [src:5]. 2026-11-10에 조회한 최신판은 2.6.0이다(배포 tgz shasum `79158eaf…1edf` 가 11-01 캐시 사본과 같음). 이 패키지는 원시 팔레트 `primitiveColor` 위에 역할 계층을 정의한다 — 라이트는 `baseSemanticColor`(스파르타클럽 테마 `sccLight`는 여기에 같은 brand 값만 다시 적는다), 다크는 `sccDark`다. 컴포넌트 토큰은 `baseComponent`가 역할과 원시 단계를 가리켜 정의하고, `sccDark`가 그중 일부를 다시 가리킨다. 내일배움캠프는 역할을 `--stack-semantic-*` 커스텀 프로퍼티로 서빙한다 [src:2]. 아래 역할 표의 45개 역할은 패키지에서 옮겼고, 2026-11-01에 라이트 45개를 내일배움캠프 라이브 값과 hex로 대조하니 불일치는 0개였다. 내일배움캠프 라이브 페이지는 다크 테마 정의가 없어 다크 값은 패키지로만 대조했다. 이번에는 핸드오프 번들에서 온 팔레트를 발행값으로 옮겼다. 번들 회색 `gray-*` 11단계와 `white`, `black`은 지웠고(발행 `neutral-*`와 같은 값은 `gray-400`, `gray-950` 둘뿐이었다), 그 값을 쓰던 자리는 발행 역할(`text-primary`, `background-subtle`, `line-nonClickable` 등)이나 패키지 컴포넌트 토큰으로 옮겼다. 번들 이름으로 발행값을 싣던 `brand-red`, `brand-red-dark`, `danger`는 발행 `red-70`, `red-80`, `orange-red-70`과 같은 값이라 지우고, 대표색 별칭 `primary`가 `red-70`을 가리키게 했다. `success`, `warning`, `modal-backdrop`은 같은 자리를 맡는 발행 역할 `status-success-default`, `status-warning-default`, `dimm-default`로 바꿨고, `info`는 `interaction-blue`와 같은 값의 별칭이라 지웠다. 번들 `teal-strong`은 발행 `skyBlue[90]`과 같은 값이라 `sky-blue-90`으로 바꿨다. red 배지 바탕 `brand-red-soft`는 brand 역할의 가장 옅은 칸 `brand-subtlest`로 옮겼다. 값이 가장 가까운 칸은 `brand-subtler`(`red[20]`)지만, 다크에서 그 칸은 `red[90]`이 되어 글자 `brand-strong`(`red[50]`)과 대비가 무너진다. 나머지 번들 배지색 `badge-teal-bg`, `badge-green-bg`, `badge-blue-bg`와 green 배지 글자(번들 `success`), ghost hover 표면 `interaction-blue-soft`는 가장 가까운 발행 단계 `skyBlue[10]`, `green[10]`, `blue[20]`, `green[80]`, `deepBlue[10]`으로 옮겼다. 다만 green 배지 글자는 `green[80]`이 `green[10]` 바탕 위 3.39:1 로 글자 기준에 못 미쳐, 한 단계 어두운 `green[90]`(4.9:1)으로 다시 옮겼다. 배지 대응은 상류가 정한 것이 아니라 이 카탈로그의 선택이다(Known Gaps). 남긴 번들 색은 `interaction-blue`와 같은 값의 `focus-ring` 둘이다. 발행 원시 팔레트에 가까운 값이 없고(가장 가까운 `deepBlue[80]`도 ΔE 0.106), 패키지에 포커스 링 토큰도 없어 링크, ghost 액션, 포커스 링의 번들 파랑을 그대로 두었다.
>
> **`interaction-blue`는 sRGB 색역 밖이다.** `oklch(0.429 0.297 264)`를 선형 sRGB로 풀면 red 채널이 −0.0002로 음수라, 브라우저는 이 값을 그대로 그리지 못하고 클리핑한다. 라이브 사이트가 쓰는 가장 가까운 파랑은 `#003CDC` = `oklch(0.457 0.245 264)`로 **hue는 같고 채도가 낮은**(색역 안) 값이며 ΔE 0.059 떨어져 있다. 방침대로 값은 그대로 두고 차이만 적는다 — 이 토큰을 참조하는 `focus-ring`과 `input-focus-ring`도 같은 값을 쓰므로 세 줄 모두에 같은 단서를 달았다. 다만 사이드카로 실려 나가는 건 앞의 둘뿐이다 — `input-focus-ring`은 컴포넌트 절에 있어 `tokens:build`의 색 토큰 추출 대상이 아니다.

색은 두 층이다. 역할 계층과 그것이 가리키는 원시 팔레트 단계는 발행 패키지에서 옮겼고, 컴포넌트 토큰이 가리키는 단계(`neutral-40`, `neutral-70`, `orange-red-80`, `green-80`)와 번들 색을 옮겨 간 단계 가운데 역할이 가리키지 않던 것(`sky-blue-10`, `sky-blue-90`, `deep-blue-10`)도 같은 원시 팔레트에서 왔다 [src:5]. 번들에서 온 색은 위 메모가 남긴 파랑뿐이다. 모두 catalog 규약에 따라 OKLCH로 변환해 표기한다. Blue는 interaction/info, red는 brand/CTA, sky blue는 informational active surface, neutral은 dashboard structure를 담당한다.

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

> **그림자 정리(2026-11-09).** 번들 그림자 `shadow-sm`, `shadow-md`, `shadow-lg`는 번들 `gray-900`을 그림자색으로 쓴 번들 값이라 지우고, 패키지가 발행한 `effect.shadow`의 `elevation1`, `elevation2`를 실었다 [src:5]. 패키지 컴포넌트 토큰 가운데 그림자를 가리키는 것은 `card.shadow` 하나다.

시스템은 flat-first다. 번들 대시보드는 sidebar, topbar, list row를 shadow 없이 `1px` border로 구조를 만들고, elevation은 dropdown, toast, modal 같은 floating surface에 쓴다고 적었지만 그 표면들의 그림자는 발행되지 않았다(Known Gaps). 카드는 발행 패키지가 컴포넌트 토큰 `card.shadow`를 두어 라이트는 `elevation1`, 다크(`sccDark`)는 `elevation2`를 가리킨다 [src:5]. 둘 다 검정 알파의 넓고 옅은 그림자다.

Hover elevation은 clickable media card에만 제한적으로 허용한다. Primary CTA는 hover 때 shadow를 키우기보다 red를 어둡게 하고, active/press는 `scale(0.98)`과 shadow 제거로 반응한다.

## Shapes

Shape language는 **rounded dashboard geometry**다. 사각형 컨테이너는 16px card radius를 반복하고, 행동·상태·진행 요소는 pill 또는 capsule로 처리한다. Sidebar active item은 rectangular pill에 가깝고, avatar·badge·progress fill은 모두 50px radius로 통일된다.

브랜드 그래픽은 marketing surface에서는 사람 중심 이미지와 product screenshot mockup을 쓰지만, dashboard chrome 안에서는 평면 카드와 선형 iconography가 우선한다. 아이콘은 custom font가 아니라 Lucide/Heroicons 계열의 1.5px outline을 기준으로 하며, filled icon과 outline icon을 같은 surface에서 섞지 않는다.

## Components

컴포넌트 색은 두 갈래다. 버튼(ghost 변형 제외), 스위치, 체크박스, 라디오 그룹, 바텀시트, 스피너, 스켈레톤, 아코디언, 캘린더는 발행 패키지의 컴포넌트 토큰 이름과 값을 그대로 쓴다 [src:5]. ghost 버튼, 사이드바, 탑바, 코스 카드, 배지, 입력, 진행률, 레슨 플레이어는 패키지에 색 토큰이 없어 번들 스펙의 구조(크기, 여백, 라운드)를 두고 색을 발행 역할과 단계에 다시 걸었다. 코스 카드의 그림자만은 패키지 `card.shadow`다. 예외는 번들 파랑 `interaction-blue`로, ghost 버튼과 blue 배지의 글자, 입력 포커스 링은 발행 패키지에 대응 값이 없어 번들 값 그대로다(Colors 절 감사 메모). frontmatter `components:` 맵은 라이트 값만 싣는다. 명세 맵에 테마 축이 없기 때문이다.

### 패키지 컴포넌트 토큰

토큰 이름은 패키지의 `baseComponent` 경로이고, frontmatter 키는 그 경로를 케밥 표기로 이은 것이다(`button.solidPrimary.backgroundHover` → `button-solid-primary-hover`의 `backgroundColor`). 다만 달력은 묶음 단계 `header`와 기본 상태 `default`를 키에서 뺐다(`calendar.header.navButton` → `calendar-nav-button`, `calendar.dateCell.default` → `calendar-date-cell`). 라이트 열은 `baseComponent`가 `sccLight`를 받아 낸 값, 다크 열은 `sccDark`가 다시 가리킨 값이다. `sccDark`가 다시 적지 않은 칸은 같은 원시 단계를 쓰거나 역할의 다크 짝으로 바뀐다. 불투명도 램프와 리터럴 칸은 역할 표와 같은 꼴로 적는다.

| 컴포넌트 토큰 | 라이트 (`baseComponent`) | 다크 (`sccDark`) |
| --- | --- | --- |
| `button.solidPrimary.background` | `{colors.brand-default}` | `{colors.dark-brand-default}` |
| `button.solidPrimary.backgroundHover` | `{colors.brand-strong}` | `{colors.dark-brand-subtle}` |
| `button.solidPrimary.text` | `{colors.neutral-0}` | `{colors.neutral-0}` |
| `button.solidPrimary.icon` | `{colors.neutral-0}` | `{colors.neutral-0}` |
| `button.solidSecondary.background` | `{colors.neutral-100}` | `{colors.neutral-10}` |
| `button.solidSecondary.backgroundHover` | `{colors.neutral-80}` | `{colors.neutral-30}` |
| `button.solidSecondary.text` | `{colors.text-inverse}` | `{colors.dark-text-inverse}` |
| `button.solidSecondary.icon` | `{colors.icon-inverse}` | `{colors.dark-icon-inverse}` |
| `button.solidTertiary.background` | `{colors.neutral-20}` | `{colors.neutral-80}` |
| `button.solidTertiary.backgroundHover` | `{colors.neutral-30}` | `{colors.neutral-70}` |
| `button.solidTertiary.text` | `{colors.text-secondary}` | `{colors.dark-text-secondary}` |
| `button.solidTertiary.icon` | `{colors.icon-secondary}` | `{colors.dark-icon-secondary}` |
| `button.solidError.background` | `{colors.orange-red-70}` | `{colors.orange-red-70}` |
| `button.solidError.backgroundHover` | `{colors.orange-red-80}` | `{colors.orange-red-80}` |
| `button.solidError.text` | `{colors.neutral-0}` | `{colors.neutral-0}` |
| `button.solidError.icon` | `{colors.neutral-0}` | `{colors.neutral-0}` |
| `button.outlinePrimary.border` | `{colors.brand-default}` | `{colors.neutral-10}` |
| `button.outlinePrimary.background` | `{colors.neutral-0}` | `neutralBlackAlpha[0]` = `oklch(0.164 0.007 271.0 / 0)` — 불투명도 램프 |
| `button.outlinePrimary.backgroundHover` | `{colors.brand-subtlest}` | `neutralWhiteAlpha[12]` = `oklch(1.000 0.000 0.0 / 0.12)` — 불투명도 램프 |
| `button.outlinePrimary.text` | `{colors.brand-default}` | `{colors.dark-text-primary}` |
| `button.outlinePrimary.icon` | `{colors.brand-default}` | `{colors.dark-icon-primary}` |
| `button.outlineSecondary.border` | `{colors.neutral-30}` | `{colors.neutral-60}` |
| `button.outlineSecondary.background` | `{colors.neutral-0}` | `neutralBlackAlpha[0]` = `oklch(0.164 0.007 271.0 / 0)` — 불투명도 램프 |
| `button.outlineSecondary.backgroundHover` | `{colors.neutral-10}` | `neutralWhiteAlpha[12]` = `oklch(1.000 0.000 0.0 / 0.12)` — 불투명도 램프 |
| `button.outlineSecondary.text` | `{colors.text-secondary}` | `{colors.dark-text-secondary}` |
| `button.outlineSecondary.icon` | `{colors.icon-secondary}` | `{colors.dark-icon-secondary}` |
| `switch.checkedBrand.background` | `{colors.brand-default}` | `{colors.dark-brand-default}` |
| `switch.checkedBrand.backgroundHover` | `{colors.brand-strong}` | `{colors.dark-brand-strong}` |
| `switch.checkedGreen.background` | `{colors.green-70}` | `{colors.green-70}` |
| `switch.checkedGreen.backgroundHover` | `{colors.green-80}` | `{colors.green-60}` |
| `switch.unchecked.background` | `{colors.neutral-30}` | `{colors.neutral-70}` |
| `switch.unchecked.backgroundHover` | `{colors.neutral-40}` | `{colors.neutral-60}` |
| `card.shadow` | `elevation1` | `elevation2` |
| `bottomSheet.grabber.background` | `{colors.neutral-20}` | `{colors.neutral-80}` |
| `spinner.indicator.color` | `{colors.neutral-100}` | `{colors.neutral-0}` |
| `checkbox.checked.border` | `{colors.brand-default}` | `{colors.dark-brand-default}` |
| `checkbox.checked.background` | `{colors.brand-default}` | `{colors.dark-brand-default}` |
| `checkbox.checked.backgroundHover` | `{colors.brand-strong}` | `{colors.dark-brand-strong}` |
| `checkbox.unchecked.border` | `{colors.neutral-40}` | `{colors.neutral-60}` |
| `checkbox.unchecked.background` | `{colors.fill-default}` | `neutralBlackAlpha[0]` = `oklch(0.164 0.007 271.0 / 0)` — 불투명도 램프 |
| `checkbox.unchecked.backgroundHover` | `{colors.fill-subtle}` | `neutralWhiteAlpha[12]` = `oklch(1.000 0.000 0.0 / 0.12)` — 불투명도 램프 |
| `radioGroup.checked.accent` | `{colors.brand-default}` | `{colors.dark-brand-default}` |
| `radioGroup.checked.accentHover` | `{colors.brand-strong}` | `{colors.dark-brand-strong}` |
| `radioGroup.checked.background` | `{colors.fill-default}` | `neutralBlackAlpha[0]` = `oklch(0.164 0.007 271.0 / 0)` — 불투명도 램프 |
| `radioGroup.checked.backgroundHover` | `{colors.fill-subtle}` | `neutralWhiteAlpha[12]` = `oklch(1.000 0.000 0.0 / 0.12)` — 불투명도 램프 |
| `radioGroup.unchecked.accent` | `{colors.neutral-40}` | `{colors.neutral-60}` |
| `radioGroup.unchecked.accentHover` | `{colors.neutral-40}` | `{colors.neutral-60}` |
| `radioGroup.unchecked.background` | `{colors.fill-default}` | `neutralBlackAlpha[0]` = `oklch(0.164 0.007 271.0 / 0)` — 불투명도 램프 |
| `radioGroup.unchecked.backgroundHover` | `{colors.fill-subtle}` | `neutralWhiteAlpha[12]` = `oklch(1.000 0.000 0.0 / 0.12)` — 불투명도 램프 |
| `skeleton.background` | 리터럴 `oklch(0.328 0.100 252.6 / 0.06)` | 리터럴 `oklch(0.969 0.015 248.0 / 0.08)` |
| `accordion.arrow.color` | `{colors.icon-tertiary}` | `{colors.dark-icon-quaternary}` |
| `calendar.header.navButton.background` | `{colors.neutral-0}` | `neutralBlackAlpha[0]` = `oklch(0.164 0.007 271.0 / 0)` — 불투명도 램프 |
| `calendar.header.navButton.backgroundHover` | `{colors.neutral-10}` | `neutralWhiteAlpha[12]` = `oklch(1.000 0.000 0.0 / 0.12)` — 불투명도 램프 |
| `calendar.header.navButton.border` | `{colors.neutral-30}` | `{colors.neutral-60}` |
| `calendar.dateCell.default.text` | `{colors.text-secondary}` | `{colors.dark-text-secondary}` |
| `calendar.dateCell.default.background` | `neutralBlackAlpha[0]` = `oklch(0.164 0.007 271.0 / 0)` — 불투명도 램프 | `neutralBlackAlpha[0]` = `oklch(0.164 0.007 271.0 / 0)` — 불투명도 램프 |
| `calendar.dateCell.default.backgroundHover` | `{colors.background-subtle}` | `{colors.dark-background-subtle}` |
| `calendar.dateCell.selected.text` | `{colors.text-inverse}` | `{colors.dark-text-inverse}` |
| `calendar.dateCell.selected.background` | `{colors.neutral-80}` | `{colors.neutral-20}` |
| `calendar.dateCell.selected.backgroundHover` | `{colors.neutral-70}` | `{colors.neutral-30}` |
| `calendar.dateCell.rangeMiddle.text` | `{colors.text-secondary}` | `{colors.dark-text-secondary}` |
| `calendar.dateCell.rangeMiddle.background` | `{colors.neutral-20}` | `{colors.neutral-80}` |
| `calendar.dateCell.rangeMiddle.backgroundHover` | `{colors.neutral-30}` | `{colors.neutral-70}` |
| `calendar.dateCell.today.border` | `{colors.neutral-30}` | `{colors.neutral-60}` |

스켈레톤의 두 리터럴은 패키지가 `rgba(…)`로 적은 값을 OKLCH로 옮긴 것이다 — 라이트는 `blue[100]`, 다크는 `blue[10]`과 같은 색에 불투명도만 걸었다. 패키지는 스켈레톤 shimmer도 같은 색이 투명, 불투명, 투명으로 바뀌는 그라디언트로 적는다.

### Button

Primary는 `button.solidPrimary`다 — brand red 바탕, 흰 글자이고 hover에서 `brand-strong`으로 어두워진다(다크는 `brand-subtle`). 보조 버튼은 패키지의 `solidSecondary`(검은 채움), `solidTertiary`(회색 채움), `outlineSecondary`(흰 바탕과 `neutral-30` 테두리) 셋이고, 오류 행동은 `solidError`, brand 테두리 버튼은 `outlinePrimary`다. 모양은 번들 스펙대로 50px radius, 700 weight이며, 주요 CTA는 `수강신청`, `무료 체험 시작`, `이어서 학습`, `참여하기`처럼 동사 중심으로 작성한다.

Ghost는 패키지에 없는 번들 변형이다. background 없이 interaction blue text를 쓰고 hover에서 `deep-blue-10` 표면을 깔며 로그인, 보조 이동, link-like action에 쓴다.

```tsx
<Button variant="primary" size="md">이어서 학습</Button>
```

```text
button-solid-primary: { bg: brand-default, fg: neutral-0, hover-bg: brand-strong }
button-outline-secondary: { bg: neutral-0, border: neutral-30, fg: text-secondary, hover-bg: neutral-10 }
button-solid-tertiary: { bg: neutral-20, fg: text-secondary, hover-bg: neutral-30 }
button-radius: radius-md
button-focus: focus-ring
button-ghost: { fg: interaction-blue, hover-bg: deep-blue-10 }
```

### Switch

`switch.checkedBrand`는 brand red, `switch.checkedGreen`은 `green[70]`, 꺼진 상태 `switch.unchecked`는 `neutral-30`(다크 `neutral-70`) 트랙을 쓴다.

### Checkbox

Checkbox는 label과 input을 semantic하게 연결하고, label 전체가 클릭 영역이 되도록 한다. 켜진 상태는 `checkbox.checked`로 brand red 테두리와 채움, 흰 체크 글리프를 쓴다. 꺼진 상태는 `checkbox.unchecked`로 `neutral-40` 테두리(다크 `neutral-60`)와 `fill-default` 바탕을 쓴다. focus-visible은 blue ring을 유지한다.

```text
checkbox-radius: radius-xs
checkbox-checked: { bg: brand-default, border: brand-default, hover-bg: brand-strong }
checkbox-unchecked: { bg: fill-default, border: neutral-40, hover-bg: fill-subtle }
```

### Radio group, bottom sheet, calendar

라디오 그룹은 선택 점을 `accent`로 칠하고(켜짐 brand red, 꺼짐 `neutral-40`), 바탕은 체크박스와 같은 `fill-default`다. 맵에는 바탕색만 실리므로 켜짐과 꺼짐 행이 같은 값이고, 상태를 가르는 `accent`는 맵이 받지 않는 속성이라 위 패키지 컴포넌트 토큰 표에만 있다. 바텀시트 grabber는 `neutral-20`, 스피너 indicator는 라이트에서 `neutral-100`이다. 캘린더는 선택한 날짜를 `neutral-80` 채움과 반전 글자로, 범위 가운데 날짜를 `neutral-20` 채움으로 표시한다.

### Sidebar

Sidebar는 240px fixed width, full-height sticky, `background-default` surface, `line-nonClickable` border-right를 사용한다. Active nav item은 `sky-blue-90` fill과 흰 text로 처리해 red CTA와 경쟁하지 않는다. 비활성 항목은 `text-secondary`다.

```tsx
<Sidebar active="catalog" onNav={setScreen} />
```

### Topbar and search

Topbar는 56px sticky header이며 shadow 없이 하단 border만 사용한다. Search box는 `background-subtle` pill field이고, width는 desktop에서 280px를 기준으로 한다.

```text
topbar-height: 56px
search-radius: radius-md
search-bg: background-subtle
```

### Card

Card는 `background-default` surface, `line-nonClickable` border, 16px radius, 20px padding이 기본이고, 패키지 `card.shadow`(라이트 `elevation1`)를 더한다. Course card는 media thumbnail, badge row, title/description, metadata footer로 구성되며, 사용자의 iteration 결과 metadata footer는 하단에 고정하고 card 높이는 row 안에서 일관되게 유지한다.

```text
card-bg: background-default
card-border: line-nonClickable
card-shadow: elevation1
card-radius: radius-sm
card-padding: 20px
card-gap: 10px
card-footer-pin: true
```

### Pill and badge

Pill은 50px radius, 11px/700 label, 3px 10px padding을 쓴다. Red badge는 hot/new/primary emphasis, teal은 국비지원/취업 보장 같은 정보성 상태, green은 completion/success, blue는 new/info에 배정한다. 패키지에 배지 토큰이 없어 red는 brand 역할(바탕 `brand-subtlest`, 글자 `brand-strong`)이라 테마를 따라 바뀌고, teal, green, blue는 번들 값에 가장 가까운 발행 단계(green 글자는 대비를 위해 한 단계 어두운 `green-90`, blue 글자는 번들 `interaction-blue`)라 두 테마에서 같은 색이다.

```text
pill-red:   { bg: brand-subtlest, fg: brand-strong }
pill-blue:  { bg: blue-20, fg: interaction-blue }
pill-teal:  { bg: sky-blue-10, fg: sky-blue-90 }
pill-green: { bg: green-10, fg: green-90 }
```

### Form input

Input은 6px radius, 14px text, 10px 12px padding, `line-clickable` border를 사용한다. Focus-visible은 border 색만 바꾸지 않고 interaction blue ring을 외곽에 둔다. Error는 `status-error-default` border와 helper text를 쓰며 input background를 red로 칠하지 않는다.

```text
input-radius: radius-xs
input-border: line-clickable
input-focus-ring: oklch(0.429 0.297 264 / 0.18)   # interaction-blue 값 — sRGB 색역 밖(Colors 절 감사 메모 참조)
input-error-border: status-error-default
```

### Select

Select는 native chevron을 숨기고 오른쪽 36px padding 안에 custom chevron을 둔다. 텍스트 시작점은 input과 같은 12px left padding에 맞추며, chevron이 텍스트 baseline을 밀지 않도록 한다.

### Course row and progress

Course row는 52px thumbnail, badge/track, single-line title, next lesson, right-aligned progress percentage로 구성한다. Progress track은 `fill-subtle`, fill은 `brand-default` 또는 `status-success-default`를 사용하며 radius-md로 capsule 처리한다.

### Lesson player

Lesson player는 16:9 dark video frame(`neutral-100`), 16px radius, red radial emphasis, large 50px play button, bottom progress bar를 사용한다. Curriculum accordion은 active week를 `background-subtle` surface로 열고, 완료 상태는 `status-success-default`, 현재 상태는 `brand-default`로 구분한다.

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
- The link, ghost-action and focus blue (`interaction-blue`, `focus-ring`) is still the handoff bundle's value: `@teamsparta/stack-tokens` publishes no nearby palette step and no focus-ring token for it, so it should be confirmed by the team before production adoption.
- The package publishes no badge tokens. The pill colours here are this catalog's choice, not an upstream mapping: red uses the brand roles, and teal, green and blue use the published steps nearest the bundle's badge colours, except the green text, which takes the next darker step (`green-90`) so it reaches 4.5:1 on its background.
- The package publishes only the card shadow (`card.shadow` → `elevation1`/`elevation2`). The bundle says floating surfaces (dropdown, toast, modal) are elevated, but no shadow is published for them.

## References

1. https://spartaclub.kr/ — 스파르타클럽 공식 사이트 (서비스 범위·브랜드 맥락)
2. https://nbcamp.spartaclub.kr/ — 내일배움캠프. 색 토큰을 `--stack-semantic-*`·`--stack-primitive-*` CSS 커스텀 프로퍼티로 서빙한다
3. https://b2b.spartaclub.kr/ — 팀스파르타 기업교육. `axis.spartapartners.ai`로 리다이렉트된다
4. https://career.spartaclub.kr/ — 팀스파르타 커리어. 외부 채용 플랫폼(Greeting) 위의 페이지라 플랫폼 고유 색 토큰이 섞여 있고, 브랜드 red는 테넌트 테마가 `--primitive-color-brand-500`을 덮어써 넣는다
5. https://cdn.jsdelivr.net/npm/@teamsparta/stack-tokens@2.6.0/dist/ — 팀스파르타가 npm에 발행한 토큰 패키지 `@teamsparta/stack-tokens` 2.6.0의 배포 파일. 원시 팔레트(`primitiveColor`), 라이트 역할 계층(`baseSemanticColor`), 컴포넌트 토큰(`baseComponent`), 그림자(`effect`), 서비스별 테마(`sccLight`, `sccDark` 등)가 들어 있다
