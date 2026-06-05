---
name: 팀스파르타
slug: teamsparta
category: education
logo: https://getdesign.kr/logos/teamsparta-favicon.png
last_updated: "2026-05-29"
created_at: "2026-05-13"
sources:
  - https://spartaclub.kr/
  - https://nbcamp.spartaclub.kr/
  - https://b2b.spartaclub.kr/
  - https://career.spartaclub.kr/
related_services: []
lang: ko
---

# 팀스파르타 (스파르타클럽) — design.md

> 팀스파르타가 운영하는 스파르타클럽 학습 생태계의 인증 대시보드 디자인 시스템이다. 본 문서는 Claude Design handoff bundle의 `스파르타클럽 Design System` README, `colors_and_type.css`, preview cards, dashboard UI kit, chat transcript를 1차 출처로 합성했다. 공개 공식 사이트와 내일배움캠프, 기업교육, 커리어 surface는 서비스 범위와 브랜드 맥락 확인용 보조 출처로 사용했다 [src:1][src:2][src:3][src:4]. 색·타이포·스페이싱·컴포넌트의 정량값은 공개된 디자인 토큰 문서가 없어 이 핸드오프 번들에서 재구성한 것으로, 공개 출처로 교차검증되지 않는다(재구성 — 공개 소스 없음).

## Brand & Style

스파르타클럽은 팀스파르타의 통합 소비자 브랜드로, 내일배움캠프, AI 입문/실무 강의, 재직자 캠프, 기업교육을 한 학습 여정 안에 묶는다. 디자인 시스템의 기준 surface는 마케팅 페이지가 아니라 수강생과 운영자가 쓰는 인증 대시보드이며, catalog → enrollment → learning dashboard → community → career로 이어지는 흐름을 전제로 한다.

브랜드 무드는 **warm, encouraging, confident, implementation-focused**다. “누구나 큰일 낼 수 있어”, “완주”, “찐한 관리”처럼 학습 지속과 실행을 밀어주는 어휘가 반복되지만, 장식적 과장보다 사용자가 지금 무엇을 해야 하는지 보여주는 동사 중심 문장이 우선한다. Product copy는 `해요/합니다` 존댓말을 쓰고, 버튼은 `학습 시작`, `수강신청`, `무료 체험`, `알림 신청`처럼 4~8자 동사 라벨을 선호한다. 본 catalog 문서는 제품 표면 카피와 달리 평서체로 기술한다.

시각 언어의 핵심은 **가벼운 학습 대시보드 + 강한 Sparta red CTA + link/info blue 분리**다. 번들 README는 제공 토큰의 electric blue와 실제 라이브 브랜드의 red wordmark/CTA 사이에 의미 충돌이 있음을 명시하고, blue는 링크·정보·focus, red는 identity·primary CTA·celebration에 배정한다. 따라서 한 컴포넌트 안에서 red와 blue를 동시에 primary 상태로 섞지 않고, 표면의 목적에 따라 한 축만 선택해야 한다.

## Colors

원본 토큰은 `colors_and_type.css`에 정의되어 있으며, 본 문서는 catalog 규약에 따라 OKLCH로 변환해 표기한다. Blue는 interaction/info, red는 brand/CTA, teal은 informational active surface, cool gray는 dashboard structure를 담당한다.

### Brand & interaction

```yaml
brand-red:       oklch(0.613 0.214 19)   # identity, primary CTA, progress highlight
brand-red-dark:  oklch(0.525 0.197 21)   # primary CTA hover/pressed
brand-red-soft:  oklch(0.944 0.029 7)    # red badge and subtle alert surface
interaction-blue: oklch(0.429 0.297 264) # links, info, focus ring source
interaction-blue-soft: oklch(0.958 0.020 280)
teal-strong:     oklch(0.378 0.066 224)  # active sidebar, live session, data cards
```

### Neutral scale

```yaml
white:    oklch(1.000 0.000 0)
gray-50:  oklch(0.979 0.003 265)
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
black:    oklch(0.000 0.000 0)
```

### Semantic status

```yaml
success: oklch(0.627 0.170 149)
warning: oklch(0.769 0.165 70)
danger:  oklch(0.613 0.214 19)
info:    oklch(0.429 0.297 264)
```

### Semantic alias

```yaml
bg-canvas-light:   white
bg-subtle-light:   gray-50
bg-surface-light:  white
bg-canvas-dark:    gray-900
bg-surface-dark:   gray-950
fg-primary-light:  gray-900
fg-secondary-light: gray-500
fg-inverse:        white
border-default:    gray-200
border-muted:      gray-100
focus-ring:        oklch(0.429 0.297 264 / 0.32)
modal-backdrop:    oklch(0.000 0.000 0 / 0.48)
```

### Supporting badge surfaces

```yaml
badge-blue-bg:  oklch(0.932 0.034 286)
badge-teal-bg:  oklch(0.941 0.021 208)
badge-green-bg: oklch(0.962 0.043 157)
badge-red-bg:   brand-red-soft
```

## Typography

Primary typeface is **Pretendard Variable** with Korean system fallbacks. The handoff explicitly confirms Pretendard as the intended font and keeps the CDN import in the token file; production may self-host the same family without changing metrics.

```yaml
font-family-sans: >
  "Pretendard Variable", Pretendard, "Pretendard Bold Placeholder",
  -apple-system, BlinkMacSystemFont, system-ui, "Malgun Gothic",
  "Apple SD Gothic Neo", sans-serif
font-family-mono: >
  "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace
```

The dashboard scale is dense and Korean SaaS-oriented: small labels and rows use 12~14px, dashboard headings use 22~32px, and display moments stop at 44px. Headings and CTAs lean on 700 weight; body copy stays 400~500 and uses relaxed line-height for Korean readability.

```yaml
xs:      { size: 10, line-height: 1.20, weight: 700, tracking: 0.08em }
sm:      { size: 12, line-height: 1.40, weight: 500, tracking: 0.01em }
md:      { size: 13, line-height: 1.50, weight: 400 }
lg:      { size: 14, line-height: 1.55, weight: 400 }
xl:      { size: 15, line-height: 1.55, weight: 500 }
body-lg: { size: 16, line-height: 1.55, weight: 500 }
h3:      { size: 18, line-height: 1.35, weight: 700 }
h2:      { size: 22, line-height: 1.30, weight: 700, tracking: -0.01em }
h1:      { size: 32, line-height: 1.375, weight: 700, tracking: -0.015em }
display: { size: 44, line-height: 1.20, weight: 700, tracking: -0.02em }
```

숫자와 진행률은 dashboard scan 대상이므로 `font-variant-numeric: tabular-nums`를 적용한다. 학습 시간, 완료 강의 수, 출석일, 과제 제출률 같은 metric card는 숫자를 22px/700 이상으로 두고 label은 11~12px uppercase-style overline으로 낮춘다.

## Spacing

Spacing은 8-step scale을 사용한다. `15px`까지는 컴포넌트 내부 밀도, `32px`부터는 section/gutter 단위로 쓰며, README는 중간에 20px/24px 단계를 임의로 만들지 말라고 명시한다.

```yaml
space-1: 4px
space-2: 6px
space-3: 8px
space-4: 10px
space-5: 12px
space-6: 15px
space-7: 32px
space-8: 40px
```

Dashboard layout은 240px fixed sidebar, 56px sticky topbar, desktop content gutter 32px, mobile gutter 15px를 기준으로 한다. Card 내부 stack은 10~12px이 표준이고, card grid 간격은 14~16px의 조밀한 리듬을 사용한다.

## Rounded

Radius는 세 단계로 제한한다.

```yaml
radius-xs: 6px   # inputs, tooltips, checkbox, compact chips
radius-sm: 16px  # cards, modals, media tiles, video player
radius-md: 50px  # pills, avatars, tags, primary CTAs, progress bars
```

팀스파르타 표면의 signature는 50px pill CTA다. 일반 카드와 media tile은 16px로 부드럽게 묶고, input과 focusable control은 6px를 써서 대시보드 밀도를 유지한다.

## Elevation & Depth

시스템은 flat-first다. 기본 card, sidebar, topbar, list row는 shadow 없이 `1px` border로 구조를 만들고, elevation은 dropdown, toast, modal 같은 floating surface에만 쓴다.

```yaml
shadow-sm: >
  0 1px 2px oklch(0.164 0.011 268 / 0.06),
  0 1px 1px oklch(0.164 0.011 268 / 0.04)
shadow-md: >
  0 4px 10px oklch(0.164 0.011 268 / 0.08),
  0 1px 3px oklch(0.164 0.011 268 / 0.06)
shadow-lg: >
  0 12px 28px oklch(0.164 0.011 268 / 0.14),
  0 4px 10px oklch(0.164 0.011 268 / 0.08)
```

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

```yaml
button-primary-bg: brand-red
button-primary-hover-bg: brand-red-dark
button-primary-fg: white
button-primary-radius: radius-md
button-primary-focus: focus-ring
```

### Button secondary and ghost

Secondary는 white surface와 gray-200 border로 구조를 만들고, hover에서는 gray-50으로만 살짝 떠오른다. Ghost는 background 없이 interaction blue text를 사용하며 로그인, 보조 이동, link-like action에 쓴다.

```yaml
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

```yaml
topbar-height: 56px
search-radius: radius-md
search-bg: gray-50
```

### Card

Card는 white surface, gray-100/200 border, 16px radius, 20px padding이 기본이다. Course card는 media thumbnail, badge row, title/description, metadata footer로 구성되며, 사용자의 iteration 결과 metadata footer는 하단에 고정하고 card 높이는 row 안에서 일관되게 유지한다.

```yaml
card-bg: white
card-border: gray-100
card-radius: radius-sm
card-padding: 20px
card-gap: 10px
card-footer-pin: true
```

### Pill and badge

Pill은 50px radius, 11px/700 label, 3px 10px padding을 쓴다. Red badge는 hot/new/primary emphasis, teal은 국비지원/취업 보장 같은 정보성 상태, green은 completion/success, blue는 new/info에 배정한다.

```yaml
pill-red:   { bg: brand-red-soft, fg: brand-red-dark }
pill-blue:  { bg: badge-blue-bg, fg: interaction-blue }
pill-teal:  { bg: badge-teal-bg, fg: teal-strong }
pill-green: { bg: badge-green-bg, fg: success }
```

### Form input

Input은 6px radius, 14px text, 10px 12px padding, gray-200 border를 사용한다. Focus-visible은 border 색만 바꾸지 않고 interaction blue ring을 외곽에 둔다. Error는 red border와 red helper text를 쓰며 input background를 red로 칠하지 않는다.

```yaml
input-radius: radius-xs
input-border: gray-200
input-focus-ring: oklch(0.429 0.297 264 / 0.18)
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

## References

1. https://spartaclub.kr/ — 스파르타클럽 공식 사이트 (서비스 범위·브랜드 맥락)
2. https://nbcamp.spartaclub.kr/ — 내일배움캠프
3. https://b2b.spartaclub.kr/ — 팀스파르타 기업교육
4. https://career.spartaclub.kr/ — 팀스파르타 커리어
