---
name: 원티드
slug: wanted
category: career
last_updated: "2026-05-12"
created_at: "2026-05-12"
sources:
  - https://api.anthropic.com/v1/design/h/j7_orggLzbQ43g24R8OfYA
  - https://www.wanted.co.kr
  - https://wanted-sans.github.io
  - https://github.com/wanteddev/wanted-sans
  - https://github.com/wanteddev/wanted-icons
  - https://github.com/orioncactus/pretendard
related_services: []
lang: ko
logo: https://getdesign.kr/logos/wanted.png
---

# 원티드 (Wanted) — design.md

> 원티드랩이 운영하는 한국 1위 채용·커리어 플랫폼. `wanted.co.kr` 잡 마켓플레이스, 채용담당자용 Wanted Talent 대시보드, 프리미엄 커리어 코칭 구독 Wanted Plus, 후보자/리크루터용 iOS/Android 앱을 단일 디자인 시스템 위에 얹는다 [src:1]. 본 문서는 Wanted Design System 핸드오프 번들(`wanted-design-system/` 익스포트 — `README.md`, `colors_and_type.css`, 14개 preview 카드, `ui_kits/wanted-web/` 마켓플레이스 재구성)을 1차 출처로 합성한 결과이며, 공개된 wanted.co.kr 마케팅 surface, Wanted Sans 오픈소스 레포(wanteddev/wanted-sans), Pretendard JP, wanted-icons 패키지를 보조 출처로 사용했다.

## Brand & Style

원티드는 한국 디자인-엔지니어링 씬에서 **정밀 스케일 토큰 시스템 + 자체 브랜드 서체 + 시그너처 그라디언트 로고**의 조합으로 알려진다 [src:1]. Figma 공개 미러("Wanted Design System (Community)")는 14-step gray + 19-step cool-neutral + 11-step hue ramp의 dual-neutral 구조를 ship하며, `Wanted Sans` (Wanted + 산돌 공동 제작 오픈소스 OFL 서체)를 display 표면에서 사용한다 [src:1][src:3]. 시스템의 가장 인지 가능한 마크는 **blue → magenta → orange** 3-stop 그라디언트로 그려진 심볼이며, 이 그라디언트는 심볼·아바타·잡카드 썸네일 placeholder에만 적용되고 CTA·헤더·풀-블리드 표면에는 적용되지 않는다 [src:1].

전체 무드는 **clean, generous, neutral-anchored** — Toss·Naver와 결이 가깝고 splashy한 서양 채용 브랜드와는 거리가 있다 [src:1]. 색은 절제되어 사용되고 타이포가 위계의 대부분을 짊어진다. 표면은 흰 캔버스(light) 또는 `oklch(0.148 0.004 277)` 다크 캔버스(dark)로 평면화되며, 텍스처·노이즈·전면 사진은 chrome에 사용되지 않는다 [src:1]. 카드는 기본적으로 그림자 없이 1px `border-subtle` 헤어라인이 구조를 짊어지고, 그림자는 popover·dropdown·modal 같은 elevated surface에서만 등장한다 [src:1].

대상 사용자는 후보자(구직자)와 리크루터 양쪽이며, 시스템은 마케팅 사이트·잡 마켓플레이스·리크루터 대시보드·네이티브 앱을 동일한 디자인 시스템으로 횡단한다 [src:1]. 본 문서는 잡 마켓플레이스(`wanted.co.kr` candidate-side) surface를 1차 관찰 대상으로 한다 — SSOT 번들의 `ui_kits/wanted-web/`이 이 surface를 1:1 재구성하기 때문이다 [src:1].

Voice는 **친근한 2인칭 + 부드러운 존댓말**로 요약된다 [src:1]. 사무어조와 격식 호칭은 회피되고, 종결어미는 격식 `-습니다`보다 따뜻한 `-요`/`-어요`/`-아요`를 표준으로 한다 — "이력서를 등록해 보세요", "받은 제안이 없어요", "지원이 완료되었어요" 같은 톤이 시스템 카피의 시그너처다 [src:1]. 버튼은 동사 — "지원하기", "저장하기", "시작하기", "둘러보기" — 가 라벨 형태이며 명사·디렉티브("여기를 눌러주세요")는 표준이 아니다 [src:1]. 본 catalog 메타 문서는 한국어 평서체(`-다`)로 기술하며, 원티드의 존댓말 정책은 product surface 카피에 한해 적용되는 규칙임을 분리해 둔다.

## Colors

원본 hex는 SSOT 번들 `colors_and_type.css`에 정의되어 있으며, 본 문서는 OKLCH로 변환해 표기한다 [src:1]. 시스템의 구조적 특징은 두 가지다 — (1) **dual neutral ramp** (`gray-*` 14-step 단순 흑백 톤 + `neutral-*` 19-step cool blue-tinted 톤이 별도 운영됨), (2) **alpha multiplier로 텍스트 위계를 합성** (별도 gray hex를 정의하는 대신 `neutral-825`/`neutral-875` 위에 13단계 알파를 곱해 라이트/다크 양쪽에서 일관된 "soft black/white" 톤을 만든다) [src:1].

### Brand

```yaml
blue-800:  oklch(0.563 0.232 257)   # core Wanted Blue (#0066FF), 단일 primary
blue-700:  oklch(0.607 0.225 257)   # hover step
blue-850:  oklch(0.529 0.220 258)
blue-900:  oklch(0.484 0.205 258)
blue-100:  oklch(0.954 0.022 250)   # --bg-brand-subtle
blue-50:   oklch(0.985 0.012 247)
blue-975:  oklch(0.149 0.069 257)   # dark theme --bg-brand-subtle
```

브랜드 primary는 `{colors.blue-800}` 단일 — 버튼, 링크, 포커스 링, 핵심 데이터에 사용된다 [src:1]. CTA 표면 외에는 배경으로 사용하지 않는다 — 채도 강조가 아니라 단일 strong stop 정책이다.

### Brand gradient (심볼 전용)

```yaml
gradient-stop-1: oklch(0.563 0.232 257)   # blue-800 (#0066FF)
gradient-stop-2: oklch(0.708 0.273 354)   # magenta (#FF53C0) — 핸드오프 README가 명시하는 mid-stop
gradient-stop-3: oklch(0.665 0.218 38)    # coral-600 (#FF5E00)
```

심볼 마크 자체 + 일부 아바타 circle + 일부 잡카드 썸네일 placeholder에만 적용된다 [src:1]. 마케팅 hero용 변형은 `0E1F3F → blue-800 → magenta`로 깊은 navy를 추가해 `linear-gradient(120deg, ...)`로 그려지지만, 카탈로그 토큰으로 노출된 것은 아니다 [src:1].

### Gray (14-step, single tint — 채도 0)

```yaml
gray-50:   oklch(0.971 0 0)
gray-100:  oklch(0.881 0 0)
gray-150:  oklch(0.808 0 0)
gray-200:  oklch(0.747 0 0)
gray-300:  oklch(0.681 0 0)
gray-400:  oklch(0.629 0 0)
gray-500:  oklch(0.555 0 0)
gray-600:  oklch(0.471 0 0)
gray-700:  oklch(0.382 0 0)
gray-800:  oklch(0.286 0 0)
gray-850:  oklch(0.258 0 0)
gray-900:  oklch(0.184 0 0)
gray-950:  oklch(0.155 0 0)
gray-1000: oklch(0.110 0 0)
```

`gray-*` 패밀리는 채도 0의 단순 흑백 톤이며, 시스템 토큰의 baseline이 아니라 utility용이다. UI 표면 색은 거의 항상 `neutral-*` 패밀리에서 호출된다 [src:1].

### Neutral (19-step, cool blue-tinted — 워크호스 패밀리)

```yaml
neutral-50:  oklch(0.972 0.002 286)
neutral-75:  oklch(0.961 0.002 286)
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
```

`neutral-700` (`oklch(0.521 0.018 273)`)이 `border-subtle`/`border-default`/`border-strong`의 알파 베이스이며, `neutral-825` (`oklch(0.298 0.010 273)`)가 `fg-secondary`/`fg-tertiary`/`fg-disabled`의 알파 베이스, `neutral-875` (`oklch(0.259 0.010 273)`)가 `fg-default`(body)의 알파 베이스다 [src:1]. text와 border가 서로 다른 neutral 단계에서 알파를 곱하는 구조이므로, 토큰 정의 시 두 베이스를 혼동하지 않도록 분리해야 한다.

### Semantic signal (red / green / orange)

```yaml
red-700:    oklch(0.546 0.220 27)    # --fg-danger
red-600:    oklch(0.643 0.231 27)
red-100:    oklch(0.951 0.018 18)    # --bg-danger-subtle (#FEECEC)
red-200:    oklch(0.901 0.044 22)
green-600:  oklch(0.673 0.211 144)   # --fg-success
green-100:  oklch(0.968 0.052 154)   # --bg-success-subtle (#D9FFE6)
orange-700: oklch(0.625 0.148 56)    # --fg-warning
orange-600: oklch(0.733 0.179 56)
orange-100: oklch(0.967 0.030 81)    # --bg-warning-subtle (#FEF4E6)
coral-600:  oklch(0.665 0.218 38)    # brand gradient end-stop
pink-600:   oklch(0.673 0.279 339)   # brand gradient mid (atomic value; README magenta는 약간 다름)
```

이 외 lime/cyan/sky/violet/purple 패밀리도 11-step ramp로 ship되며, hover·select·일러스트 accent에 사용된다 [src:1]. 본 카탈로그는 코어 패밀리만 surface하고 나머지는 SSOT `colors_and_type.css`를 참조한다.

### Alpha 스케일 — 텍스트 oncoloring

```yaml
alpha-5:  0.05
alpha-8:  0.08
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
```

13단계 알파 ladder. Light 테마는 `oklch(0.259 0.010 273)` (= neutral-875) 위에, dark 테마는 `oklch(1 0 0)` 위에 동일한 스케일을 곱한다 — 한 베이스에서 13단계 강도를 만들어내는 구조다 [src:1].

### Semantic alias — Light

```yaml
# Background
bg-canvas:         oklch(1 0 0)
bg-surface:        oklch(1 0 0)
bg-subtle:         oklch(0.972 0.002 286)    # neutral-50, page bg
bg-muted:          oklch(0.961 0.002 286)    # neutral-75, hover fill
bg-elevated:       oklch(1 0 0)              # dialog/popover
bg-inverse:        oklch(0.148 0.004 277)    # neutral-960
bg-brand:          oklch(0.563 0.232 257)    # blue-800
bg-brand-subtle:   oklch(0.954 0.022 250)    # blue-100
bg-danger-subtle:  oklch(0.951 0.018 18)
bg-success-subtle: oklch(0.968 0.052 154)
bg-warning-subtle: oklch(0.967 0.030 81)

# Foreground (alpha multiplier on neutral-825 / neutral-875)
fg-strong:         oklch(0.148 0.004 277)              # @ alpha 1 (= neutral-960)
fg-default:        oklch(0.259 0.010 273 / 0.88)       # body
fg-secondary:      oklch(0.298 0.010 273 / 0.61)       # labels, captions
fg-tertiary:       oklch(0.298 0.010 273 / 0.43)       # placeholder
fg-disabled:       oklch(0.298 0.010 273 / 0.28)
fg-on-brand:       oklch(1 0 0)
fg-brand:          oklch(0.563 0.232 257)
fg-link:           oklch(0.563 0.232 257)
fg-danger:         oklch(0.546 0.220 27)
fg-success:        oklch(0.673 0.211 144)
fg-warning:        oklch(0.625 0.148 56)

# Borders
border-subtle:     oklch(0.521 0.018 273 / 0.08)
border-default:    oklch(0.521 0.018 273 / 0.22)
border-strong:     oklch(0.521 0.018 273 / 0.35)
border-inverse:    oklch(1 0 0 / 0.16)
border-brand:      oklch(0.563 0.232 257)
```

### Semantic alias — Dark

```yaml
# Background
bg-canvas:        oklch(0.148 0.004 277)      # neutral-960
bg-surface:       oklch(0.166 0.005 271)      # neutral-950
bg-subtle:        oklch(0.135 0.002 286)      # neutral-970
bg-muted:         oklch(0.196 0.008 273)      # neutral-925
bg-elevated:      oklch(0.237 0.008 273)      # neutral-900
bg-inverse:       oklch(1 0 0)
bg-brand-subtle:  oklch(0.149 0.069 257)      # blue-975
bg-danger-subtle:  oklch(0.298 0.10 22 / 0.32)    # synthesized for dark contrast
bg-success-subtle: oklch(0.298 0.10 144 / 0.28)   # synthesized
bg-warning-subtle: oklch(0.298 0.10 56 / 0.32)    # synthesized

# Foreground (alpha on white in dark theme)
fg-strong:        oklch(1 0 0)
fg-default:       oklch(1 0 0 / 0.88)
fg-secondary:     oklch(1 0 0 / 0.61)
fg-tertiary:      oklch(1 0 0 / 0.43)
fg-disabled:      oklch(1 0 0 / 0.28)
fg-on-brand:      oklch(1 0 0)
fg-brand:         oklch(0.715 0.155 255)      # blue-400 (brightened from blue-800; synthesized)
fg-danger:        oklch(0.715 0.220 27)       # synthesized (red @ ↑ lightness)
fg-success:       oklch(0.760 0.180 144)      # synthesized (green @ ↑ lightness)
fg-warning:       oklch(0.778 0.158 64)       # synthesized (orange @ ↑ lightness)

# Borders
border-subtle:    oklch(1 0 0 / 0.08)
border-default:   oklch(1 0 0 / 0.22)
border-strong:    oklch(1 0 0 / 0.35)
```

다크 모드는 light 모드의 alpha multiplier 구조를 그대로 유지한다 — text 알파 베이스가 `neutral-825`/`neutral-875` → `oklch(1 0 0)`(흰색)로 뒤집힐 뿐이다 [src:1]. SSOT가 surface한 토큰은 위 표의 핵심 alias(background canvas/surface/subtle/muted/elevated/inverse/brand-subtle, foreground strong/default/secondary/tertiary/disabled/on-brand, border subtle/default/strong)이며, `bg-danger/success/warning-subtle`과 `fg-brand/danger/success/warning`은 본 카탈로그의 preview 구현을 위해 dark 환경에서 적정 대비를 갖도록 **합성(synthesized)**한 값이다 — light 모드 같은 시맨틱 alias가 dark에서 보이지 않으면 product surface 구현이 막히기 때문에, SSOT 빈자리를 명시적 synthesized 값으로 메웠다. 시맨틱 alias의 의미(fg-default = 본문, fg-secondary = label/caption, fg-tertiary = placeholder, fg-disabled = disabled)는 양 테마에서 동일하다.

## Typography

본문/UI 디폴트 서체는 **Pretendard JP** — 한국어 우선 variable 서체로 CJK + Latin 메트릭이 모두 우수하다 [src:1][src:4]. Display 표면(대형 헤드라인, 마케팅 커버)에는 **Wanted Sans** (Wanted + 산돌 공동 제작 오픈소스 OFL 서체)가 사용된다 [src:1][src:3].

```yaml
font-sans: >
  "Pretendard JP", "Pretendard Variable", Pretendard,
  -apple-system, BlinkMacSystemFont, system-ui,
  "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic",
  "Helvetica Neue", Arial, sans-serif

font-display: >
  "Wanted Sans Variable", "Wanted Sans", "Pretendard JP",
  "Pretendard Variable", system-ui, sans-serif

font-mono: >
  "SF Mono", ui-monospace, "JetBrains Mono",
  Menlo, Consolas, "Courier New", monospace
```

`body` font-feature-settings는 `"ss20"`, `"calt"`, `"kern"`이 기본 활성화되며, `-webkit-font-smoothing: antialiased`도 함께 적용된다 [src:1].

### Type ramp (7 hierarchy × 18 named styles — `colors_and_type.css` 정의 그대로)

```yaml
# Display (3)
display1:    { size: 56, line-height: 1.286, tracking: -0.0319em, weight: 700 }
display2:    { size: 40, line-height: 1.300, tracking: -0.0282em, weight: 700 }
display3:    { size: 36, line-height: 1.334, tracking: -0.0270em, weight: 700 }
# Title (3)
title1:      { size: 32, line-height: 1.375, tracking: -0.0253em, weight: 700 }
title2:      { size: 28, line-height: 1.358, tracking: -0.0236em, weight: 700 }
title3:      { size: 24, line-height: 1.334, tracking: -0.0230em, weight: 700 }
# Heading (2)
heading1:    { size: 22, line-height: 1.364, tracking: -0.0194em, weight: 700 }
heading2:    { size: 20, line-height: 1.400, tracking: -0.0120em, weight: 700 }
# Headline (2)
headline1:   { size: 18, line-height: 1.445, tracking: -0.0020em, weight: 600 }
headline2:   { size: 17, line-height: 1.412, tracking:  0,        weight: 600 }
# Body (2 × default/read)
body1:       { size: 16, line-height: 1.500, tracking: 0.0057em,  weight: 500 }
body1-read:  { size: 16, line-height: 1.625, tracking: 0.0057em,  weight: 500 }
body2:       { size: 15, line-height: 1.467, tracking: 0.0096em,  weight: 500 }
body2-read:  { size: 15, line-height: 1.600, tracking: 0.0096em,  weight: 500 }
# Label (2)
label1:      { size: 14, line-height: 1.429, tracking: 0.0145em,  weight: 500 }
label1-read: { size: 14, line-height: 1.571, tracking: 0.0145em,  weight: 500 }
label2:      { size: 13, line-height: 1.385, tracking: 0.0194em,  weight: 500 }
# Caption (2)
caption1:    { size: 12, line-height: 1.334, tracking: 0.0252em,  weight: 500 }
caption2:    { size: 11, line-height: 1.273, tracking: 0.0311em,  weight: 500 }
```

총 18 styles. 시스템의 두 가지 시그너처 — **(1) 17px 이상 모든 스타일에 네거티브 트래킹** (Display 1이 -3.19%로 가장 타이트, Heading 2가 -1.20%으로 가장 느슨), **(2) Body 이하는 0~positive 트래킹** (Body 1이 +0.57%, Caption 2가 +3.11%) — 캡션 크기에서 가독성을 보존하려는 의도다 [src:1].

### Two reading densities

`body1`/`body2`/`label1`은 각각 **default**(1.5/1.467/1.429)와 **read**(1.625/1.600/1.571) 두 line-height를 갖는다 [src:1]. 산문 단락(잡 디테일 본문, 마케팅 long-form)은 `{typography.body1-read}`를 사용하고, UI 표면(카드 본문, 라벨)은 기본 `body1`을 사용한다.

### HTML 디폴트 매핑

```yaml
h1 → title1     (32 / 700, tracking -0.0253em)
h2 → title2     (28 / 700, tracking -0.0236em)
h3 → title3     (24 / 700, tracking -0.0230em)
h4 → heading1   (22 / 700, tracking -0.0194em)
h5 → heading2   (20 / 700, tracking -0.0120em)
p  → body1-read (16 / 500, line-height 1.625)
small → caption1 (color: fg-secondary)
code, pre → font-mono, 14px
```

unstyled HTML이 그대로 reasonable한 디폴트를 갖도록 매핑되어 있다 [src:1].

### Wanted Sans

Wanted Sans는 오픈소스 (OFL 1.1) variable 서체로, 100~900 weight를 단일 파일로 ship한다 [src:3]. 한글 자형은 산돌과 공동 작업으로 그려졌으며, Pretendard 패밀리와 메트릭 호환성을 유지한다. **display 표면 전용**으로 권장되며, 본문 UI는 Pretendard JP가 표준이다 [src:1][src:3]. 번들의 `colors_and_type.css`는 두 서체를 모두 CDN으로 import한다 — Pretendard JP는 jsDelivr에서 dynamic-subset 변형, Wanted Sans는 webfontkit variable 변형 [src:1].

## Spacing

베이스 단위는 **4px**이며, 토큰 사다리는 0~128px 13단계로 정의된다 [src:1]:

```yaml
space-0:   0
space-2:   2
space-4:   4
space-8:   8
space-12:  12
space-16:  16
space-20:  20
space-24:  24
space-32:  32
space-40:  40
space-48:  48
space-64:  64
space-96:  96
space-128: 128
```

비-4의 배수(6, 10, 14, 18, 22)는 토큰에 존재하지 않는다 — discrete steps만 운영된다 [src:1]. 단 일부 컴포넌트는 SSOT preview에 명시된 ladder 외 값을 컴포넌트 로컬 padding으로 그대로 가져간다 (예: `{component.job-card}` body padding `14 16 16`, `{component.input}` 좌우 padding `14` — 모두 `colors_and_type.css` + components-* preview에서 verbatim) [src:1]. radius의 sm/lg 버튼 로컬값과 동일한 패턴이며, 새 컴포넌트를 추가할 때만 ladder 값을 사용하면 된다.

### Grid

| Surface | Columns | Gutter | Max content width |
| --- | --- | --- | --- |
| Mobile | 4 | 16 | — |
| Tablet | 8 | 24 | — |
| Desktop (marketing) | 12 | 24 | ~1080 |
| Desktop (dashboards) | 12 | 24 | ~1280 |

마케팅 표면은 보다 좁은 max-width(~1080)를 가지며, 대시보드는 ~1280으로 확장된다 [src:1]. `ui_kits/wanted-web/`는 1200을 잡고 desktop marketplace의 표준값으로 운영한다 [src:1].

### Vertical rhythm

마케팅 섹션 사이 **64–96px** 수직 간격이 표준 — 카드와 섹션은 generous한 vertical rhythm을 갖는다 [src:1]. `{component.job-card}` 그리드는 24px × 16px (row × col) gap으로 운영된다 [src:1].

## Rounded

라운드 토큰은 2~32px 8단계 + `full` 한 단계로 정의된다 [src:1]:

```yaml
radius-2:    2     # 미세 토큰
radius-4:    4     # checkbox
radius-8:    8     # 컴포넌트 디폴트 (버튼 md/lg, 카드, 입력)
radius-12:   12    # 카드, 디테일 로고 타일, 버튼 xl
radius-16:   16    # hero banner
radius-20:   20
radius-24:   24
radius-32:   32
radius-full: 9999  # pills (chip, filter-pill, toggle, avatar, icon button, search)
```

**대부분의 컴포넌트는 `{rounded.radius-8}` 또는 `{rounded.radius-12}`를 사용한다** [src:1]. Pills은 `{rounded.radius-full}`. 시스템은 **6px도 10px도 갖지 않는다** — 사다리는 discrete steps만 운영되며, "약간 둥근" 같은 임의값은 도입되지 않는다 [src:1].

버튼 라운드는 사이즈와 페어로 운영된다 — sm 6, md 8, lg 10, xl 12 [src:1]. (sm의 6은 컴포넌트 로컬값이며 글로벌 토큰은 아니다 — `components-buttons.html` preview 관찰값 [src:1].)

## Elevation & Depth

원티드는 평면이 기본이며 그림자는 elevated surface(popover, dropdown, modal, toast)에서만 등장한다 [src:1]. 카드 자체는 1px `{colors.border-subtle}` 헤어라인이 구조를 짊어진다 — 그림자가 카드 위계를 만들지 않는다 [src:1].

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

그림자 색은 `oklch(0.155 0 0)` 또는 순수 검정(`oklch(0 0 0)`) 베이스의 ~5–12% 알파로 통일된다 [src:1]. 두 톤이 함께 쌓이는 패턴(soft-tint + true-black)이 표준이며, navy-tinted 그림자(Toss 류)는 사용되지 않는다 — 단순 검정 + 흰 캔버스의 대비가 시그너처다 [src:1].

### Motion

```yaml
hover-transition: 100~150ms ease     # 빠르고 절제
press-overshoot: 없음
focus-ring:      2px blue-800 + 2px transparent offset
page-transition: ~200ms fade-in only
```

spring·bounce·parallax는 시스템 전반에서 사용되지 않는다 [src:1]. Hover는 darken(버튼) 또는 lighten(링크)이며, lift·scale은 잡 카드(translateY(-2px), 0.12s ease) 외에는 거의 등장하지 않는다 [src:1].

## Shapes

기하학은 **discrete radii + 평면 표면 + 헤어라인 보더**로 요약된다 [src:1]. 평면 흰 캔버스(또는 다크 캔버스) 위에 8~16px 라운드 카드/버튼을 얹고, chip·avatar·icon button·search·toggle에는 `{rounded.radius-full}`를 적용한다. **장식은 절제되고 색·타이포 위계가 카드 구조를 짊어진다** [src:1].

기본 보더는 **1px `{colors.border-subtle}` 헤어라인**이며 (rgba ~8%), 폼 입력·secondary 버튼은 1px `{colors.border-default}` (rgba ~22%)로 한 단계 강해진다 [src:1]. 포커스 상태는 1px `{colors.blue-800}` 보더 + 3px rgba blue glow(`oklch(0.563 0.232 257 / 0.16)` 부근)로 표현된다 [src:1]. 2px 장식용 보더, 컬러 left-rail accent 카드, color-shifted variant rim은 시스템 전반에서 사용되지 않는다 [src:1].

배경은 평면 색이 기본이며, 그라디언트는 (1) **심볼 마크 자체** (3-stop blue → magenta → coral), (2) **아바타 circle** 의 같은 3-stop, (3) **잡카드 썸네일 placeholder** (같은 3-stop 또는 다크 변형 `oklch(0.166 0.005 271) → oklch(0.357 0.013 274)`), (4) **마케팅 hero banner** (`120deg`, navy `oklch(0.183 0.044 256)` → `{colors.blue-800}` → magenta `oklch(0.708 0.273 354)`) — 이렇게 네 가지 문서화된 자리에만 등장한다 [src:1]. CTA·헤더·풀-블리드 본문 표면에는 그라디언트를 적용하지 않는다 [src:1].

**Iconography (wanted-icons 시스템)** [src:1][src:5] — 자체 아이콘 셋. **24×24 그리드**, **2px stroke**, **rounded line caps + joins**. 16/20/24/32 사이즈. outline-first 정책이며, filled 변형은 selected/active 탭 상태와 16px 미니 사이즈에만 사용된다. 기하는 원·둥근 사각형·single-curve arc로 구성되고, tapered stroke·아이콘 내부 gradient·아이콘 컬러는 금지된다 — 모든 아이콘은 monochrome이며 `currentColor`를 상속한다. SSOT 번들은 production용 wanted-icons npm 패키지의 stand-in으로 Lucide CDN을 link하며, Lucide의 24×24 + 2px outline + rounded caps 시스템이 Wanted와 거의 1:1로 일치한다 [src:1][src:5].

**No emoji policy** [src:1] — 원티드는 코어 제품 UI에서 이모지를 사용하지 않는다. 빈 상태·성과·상태 pill에서도 monochrome SVG 또는 평면 일러스트 자산으로 대체한다. CTA의 "→" 같은 화살표도 unicode가 아니라 SVG로 그려진다.

## Components

본 섹션은 SSOT의 14개 preview HTML 카드 + `ui_kits/wanted-web/` 마켓플레이스 재구성(`Header.jsx`, `Filters.jsx`, `JobCard.jsx`, `JobDetail.jsx`, `JobGrid.jsx`, `Footer.jsx`, `index.html`, `styles.css`)에서 직접 관찰한 컴포넌트 명세다 [src:1]. 토큰값(`{spacing.*}`, `{rounded.*}`, `{colors.*}`, `{typography.*}`)이 모두 surface되어 있으므로 prose에서 `{group.name}` 형태로 호출한다.

### button

원티드 Button은 **sm/md/lg/xl** 4단으로 운영되며 height·radius·label font가 사이즈와 함께 변한다 [src:1]:

| 사이즈 | height | radius | label |
|---|---|---|---|
| sm | 32 | 6 (컴포넌트 로컬) | 13/500 |
| md | 40 | `{rounded.radius-8}` | 14/600 |
| lg | 48 | 10 (컴포넌트 로컬) | 16/600 |
| xl | 56 | `{rounded.radius-12}` | 17/600 |

```tsx
<Button variant="primary" size="md">지원하기</Button>
<Button variant="ghost" size="md">더보기</Button>
```

### button-primary

`{colors.bg-brand}` (`oklch(0.563 0.232 257)`) 배경 + `{colors.fg-on-brand}` (흰 텍스트). 화면당 가장 중요한 단일 액션에 사용 [src:1]. Hover 시 `{colors.blue-900}` (`oklch(0.484 0.205 258)`)로 darken.

### button-secondary

투명 배경 + 1px `{colors.border-default}` 보더 + `{colors.fg-strong}` 텍스트. 같은 화면의 보조 액션 [src:1]. Hover 시 `{colors.bg-muted}` (`oklch(0.961 0.002 286)`) 배경 채움.

### button-tertiary

`{colors.neutral-75}` (`oklch(0.961 0.002 286)`) 배경 + `{colors.fg-strong}` 텍스트, 보더 없음. secondary보다도 약한 위계, "자세히 보기" 류의 inline action에 사용된다 [src:1].

### button-ghost

투명 배경 + `{colors.fg-brand}` 텍스트, 보더 없음. Hover 시 `{colors.bg-brand-subtle}` (`oklch(0.954 0.022 250)`) 배경 채움. 텍스트 링크에 가까운 약한 위계 [src:1].

### button-danger

`{colors.red-700}` (`oklch(0.546 0.220 27)`) 배경 + 흰 텍스트. 파괴적 액션 전용 [src:1].

### button-disabled

`{colors.neutral-100}` (`oklch(0.929 0.003 286)`) 배경 + `{colors.fg-disabled}` (alpha 0.28 텍스트). 부분 회색 처리 없이 컴포넌트 전체에 적용된다 [src:1].

### input / form field

```yaml
height: 44
border: 1px {colors.border-default}
radius: {rounded.radius-8}
padding: 0 14
font: 15/500
bg: {colors.bg-surface}
placeholder-color: {colors.fg-tertiary}
```

Focus 상태는 1px `{colors.blue-800}` 보더 + `0 0 0 3px oklch(0.563 0.232 257 / 0.16)` glow [src:1]. Error 상태는 1px `{colors.red-700}` 보더 + 아래쪽 `{colors.fg-danger}` 색의 12px/1.3 helper text. Disabled는 `{colors.neutral-75}` 배경 + `{colors.fg-disabled}` 텍스트 [src:1].

```tsx
<TextField
  label="이메일"
  placeholder="email@wanted.co.kr"
  helper="회사 이메일 권장"
/>
```

### checkbox

18×18 정사각, 1.5px `{colors.border-default}` 보더, `{rounded.radius-4}` (4px) [src:1]. Checked 상태는 `{colors.bg-brand}` 채움 + 흰 체크 SVG, border도 brand 색으로 전환된다.

### toggle

40×24 pill (`{rounded.radius-full}`). Off는 `{colors.neutral-150}` (`oklch(0.896 0.005 270)`), On은 `{colors.bg-brand}` [src:1]. 내부 노브는 20×20 흰 원, `{elevation.shadow-1}` 미세 그림자. left 2 → left 18 전환은 0.15s 트랜지션.

### chip (category selector)

```yaml
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

칩 active는 **invert-fill 패턴** — 채도 강조가 아니라 검정 배경 + 흰 텍스트로 명도 강조한다 [src:1].

### filter-pill

filter bar 안쪽 작은 칩 변형. resting은 chip과 동일하지만 padding이 `6 12`로 줄고, brand variant가 더 빈번하게 사용된다 (선택된 필터 노출용) [src:1].

### badge

22px height, `{rounded.radius-2}`~`{rounded.radius-4}` 사이 (관찰값 6px) — chip보다 작고 정보 밀도 높은 표면에 사용된다 [src:1]. 시맨틱 색에 매핑된 washed 배경 (예: `{colors.bg-danger-subtle}` + `{colors.fg-danger}`).

### header

```yaml
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

좌측: `{component.logo}` + nav links + Pro 분리 표시 (`margin-left: 8, padding-left: 16, border-left: 1px border-subtle`) [src:1]. 우측: `{component.search}` + icon buttons + avatar.

### nav-link

`14/600` (`-0.01em` letter-spacing), `{colors.fg-default}` [src:1]. **Active 상태는 `{colors.fg-strong}` 색 + 하단 2px solid `{colors.fg-strong}` underline** (bottom: -22px 위치로 헤더 baseline에서 떨어진다). hover state는 별도 fill 없이 색만 약간 강해진다.

### search (header)

```yaml
height: 38
width: 240
bg: {colors.bg-subtle}      # neutral-50
radius: {rounded.radius-full}
padding: 0 14
gap: 6
font: 14/500
icon-color: {colors.fg-tertiary}
```

inline pill 형태 — bordered text field가 아니라 채워진 pill이다 [src:1].

### icon-button (header right)

```yaml
size: 36
radius: {rounded.radius-full}
bg: transparent
fg: {colors.fg-default}
hover-bg: {colors.bg-muted}
notification-dot:
  size: 6
  bg: {colors.red-700}
  position: top: 8, right: 9
```

알림 도트는 상단 우측에 6px 빨간 원으로 표시된다 [src:1].

### avatar

```yaml
size: 32
radius: {rounded.radius-full}
bg: 'linear-gradient(135deg, oklch(0.563 0.232 257) 0%, oklch(0.708 0.273 354) 50%, oklch(0.665 0.218 38) 100%)'
fg: oklch(1 0 0)
font: 12/700
```

브랜드 그라디언트가 적용되는 컴포넌트 — 심볼·잡카드 placeholder 외에 그라디언트가 정식 등장하는 컴포넌트는 avatar 하나다 [src:1].

### job-card

원티드의 **시그너처 컴포넌트**. 잡 마켓플레이스 그리드의 단위.

```yaml
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
    examples: 'D-3', '마감임박', 'NEW'
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
  padding: '12 4 0' (grid) | '14 16 16' (preview)
  gap: 4-6
  company:   { font: '12-13/500', color: fg-secondary, pattern: '{company} · {region}' }
  title:     { font: '15/600',   tracking: -0.01em, color: fg-strong }
  meta:      { font: '12/500',   color: fg-tertiary, pattern: '{경력} · {계약형태}' }
  payout:    { font: '13/600',   color: fg-brand,   pattern: '채용보상금 {₩,###}원' }
```

**채용보상금** 표시가 카드 우측 하단 `{colors.fg-brand}` 색으로 항상 노출되는 것이 Wanted 잡카드의 정체성이다 — 다른 채용 사이트와 구분되는 시그너처다 [src:1].

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

잡 디테일 화면의 hero — aspect 16/8, `{rounded.radius-12}`, 좌측 하단에 56×56 회사 로고 타일(`{rounded.radius-12}`, `{elevation.shadow-2}`)이 anchored된다 [src:1]. 본문 영역은 max-width 920px, `0 24 120` padding으로 운영된다.

### hero-banner (마케팅)

```yaml
max-width: 1200
margin: 32 auto 24
height: 280
radius: {rounded.radius-16}
background: 'linear-gradient(120deg, oklch(0.183 0.044 256) 0%, oklch(0.563 0.232 257) 60%, oklch(0.708 0.273 354) 100%)'
padding: 36 40
fg: oklch(1 0 0)
content-align: flex-end (bottom-left)
```

- eyebrow: 13/600, tracking 0.04em, opacity 0.85
- title: 36/700/1.25, tracking -0.025em, max-width 580
- sub: 16/500/1.5, opacity 0.85, max-width 520
- cta: 흰 pill, fg-strong 텍스트, padding `12 22`, font 14/600 [src:1]

마케팅 hero는 **풀-블리드 그라디언트 + bottom-left 카피 + 흰색 pill CTA**의 패턴이 표준이다 [src:1]. 그라디언트 stop은 심볼 마크와 다르다 — navy를 prepend해 깊이를 만든다.

### filter-bar

```yaml
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
  position: right-aligned (margin-left: auto)
  item-font: 13/500
  resting-fg: {colors.fg-secondary}
  active-fg: {colors.fg-strong}, font-weight: 600
  divider: 1×10 {colors.border-default}
```

active filter는 brand-subtle 배경 + brand 텍스트로 표시되며, sort는 오른쪽 정렬 + bold-fg 강조로 위계를 만든다 [src:1].

### toast

`{colors.bg-inverse}` (light: `oklch(0.148 0.004 277)`) 배경 + 흰 라벨, `{rounded.radius-8}`~`{rounded.radius-12}`, `{elevation.shadow-pop}` [src:1]. 자동 dismiss 시간은 보통 4–5초.

```tsx
<Toast>지원이 완료되었어요</Toast>
```

### alert (inline)

`{colors.bg-{danger|success|warning}-subtle}` 배경 + 시맨틱 fg 색 + 좌측 아이콘 [src:1]. 인라인 알림이며 toast와 달리 dismiss 없이 페이지 흐름에 남는다.

### empty-state

```yaml
padding: 80 0
align: center
icon: 32px monochrome SVG or flat illustration (no emoji)
title: 700 18/1.3 {colors.fg-strong}
sub:   500 14/1.4 {colors.fg-secondary}
```

빈 상태 카피 패턴: "아직 받은 제안이 없어요" (alpha 88% body 톤, `-어요` 종결) [src:1].

### icon

wanted-icons system [src:1][src:5] — 24×24 그리드, 2px stroke, rounded line caps + joins, monochrome, `currentColor` 상속. outline-first; filled 변형은 active 탭과 16px 사이즈에 한정. 16/20/24/32 사이즈.

### logo

브랜드 마크는 두 형태 — **symbol** (3-stop 그라디언트가 적용된 둥근 사각형/마름모 형태)과 **logotype** (`Wanted` 워드마크) [src:1]. SSOT 번들 `assets/logos/`에 `wanted-symbol-fill.png`, `wanted-symbol-mask.svg`, `wanted-logotype.svg`로 ship되며, mask SVG는 `currentColor` 적용이 가능해 단색 표면 위에서 톤을 맞추는 용도다 [src:1].

## Do's and Don'ts

**Do**

- product-facing 색은 시맨틱 alias(`{colors.bg-brand}`, `{colors.fg-strong}`, `{colors.fg-default}`, `{colors.fg-secondary}`, `{colors.border-subtle}`)로 호출하고, atomic ramp(`{colors.blue-800}`, `{colors.neutral-700}`)는 새 alias를 만들 때만 직접 참조한다 [src:1].
- 화면당 단일 강조색 정책을 유지한다 — primary CTA는 `{colors.bg-brand}` 하나로 통일하고, 보조 액션은 button-secondary/tertiary/ghost로 분리한다 [src:1].
- 텍스트 위계는 **alpha multiplier 시스템**으로 표현한다 — primary `alpha-88`, secondary `alpha-61`, tertiary `alpha-43`, disabled `alpha-28` [src:1]. 별도 gray hex로 만들지 않는다.
- 카드는 1px `{colors.border-subtle}` 헤어라인으로 구조를 만든다 — 그림자를 카드에 적용하지 않는다 [src:1]. 그림자는 popover/dropdown/modal/toast에만 사용한다.
- 라운드는 **`{rounded.radius-8}` 또는 `{rounded.radius-12}`를 디폴트**로, pills는 `{rounded.radius-full}`로 사용한다 [src:1]. "약간 둥근" 같은 임의값은 도입하지 않는다.
- 버튼 라운드는 사이즈와 페어로 운영한다 — sm 6, md `{rounded.radius-8}`, lg 10, xl `{rounded.radius-12}` [src:1].
- 본문은 `{typography.body1}` (16/500/1.5 line-height)을 기본으로, 산문 단락은 `{typography.body1-read}` (1.625 line-height)을 사용한다 [src:1].
- 17px 이상 모든 헤딩에 네거티브 트래킹을 유지한다 (`-0.0319em` ~ `-0.0120em`) — display 1이 가장 타이트하다 [src:1].
- product 카피는 **친근한 존댓말**(`-요`/`-어요`/`-아요`)로 작성한다 — "지원이 완료되었어요", "받은 제안이 없어요", "잠시 후 다시 시도해 주세요" 같은 톤 시그너처를 따른다 [src:1].
- 버튼 라벨은 **동사 형태**로 작성한다 — "지원하기", "저장하기", "시작하기", "둘러보기"가 표준이다 [src:1].
- 잡카드 우측 하단에는 **채용보상금**을 `{colors.fg-brand}` 색으로 항상 노출한다 — Wanted를 다른 잡 사이트와 구분짓는 시그너처다 [src:1].
- 태그 칩은 `#` + 단어 형태로 표기한다 — `#성장가능성`, `#스타트업` [src:1].
- 아이콘은 `currentColor`를 상속하게 둔다 — 외부 컬러 직접 주입 금지 [src:1][src:5].
- 포커스 링은 항상 visible 상태로 유지한다 — 2px `{colors.blue-800}` ring + 2px transparent offset이 표준이다 [src:1].

**Don't**

- **이모지를 product UI에 inline으로 사용하지 않는다** — 빈 상태·성공·상태 pill에서도 monochrome SVG 또는 평면 일러스트 자산으로 대체한다. CTA의 "→" 같은 화살표도 unicode가 아니라 SVG로 그린다 [src:1].
- **그라디언트를 chrome에 사용하지 않는다** — 그라디언트는 (1) 심볼 마크, (2) 아바타 circle, (3) 잡카드 썸네일 placeholder, (4) 마케팅 hero banner — 네 가지 문서화된 자리에만 사용한다. CTA·헤더·풀-블리드 본문 표면에는 적용하지 않는다 [src:1].
- 격식체(`-습니다`/`-십시오`)나 단정형 `-다`를 product 카피에 사용하지 않는다 — `-요`/`-어요`가 표준이다 [src:1].
- ALL-CAPS, Title Case In Buttons를 사용하지 않는다 — 영어는 항상 sentence case다 [src:1].
- UI 라벨이나 리스트 아이템 끝에 마침표를 찍지 않는다 [src:1].
- 마케팅 과장 ("혁신적", "차세대", "최고의") 이나 챗봇 톤 ("~해보세요!", "여기를 눌러주세요")을 product 카피에 사용하지 않는다 [src:1].
- 카드에 그림자를 적용하지 않는다 — 1px `{colors.border-subtle}` 헤어라인이 표준이다 [src:1].
- 6px·10px·14px·18px·22px 같은 비-4의 배수 spacing/radius를 도입하지 않는다 — `{spacing.*}`와 `{rounded.*}` 사다리만 사용한다 [src:1].
- 텍스처·노이즈·grain을 표면에 사용하지 않는다 — 모든 표면은 평면 색이다 [src:1].
- glassy 효과(blur backdrop, translucent toolbar)를 사용하지 않는다 — Wanted 시스템은 평면 색 + 헤어라인 보더로 깊이를 만든다 [src:1].
- 2px 장식용 보더, 컬러 left-rail accent 카드, color-shifted variant rim을 사용하지 않는다 — 기본은 1px `{colors.border-subtle}` / `{colors.border-default}` 헤어라인이다 [src:1].
- spring·bounce·parallax·page slide 모션을 사용하지 않는다 — hover transition은 100–150ms ease, page transition은 ~200ms fade-in only가 표준이다 [src:1].
- 아이콘 내부에 그라디언트·컬러를 적용하지 않는다 — 모든 아이콘은 monochrome이며 `currentColor`를 상속한다 [src:1][src:5].
- gray-* 패밀리를 UI 표면 색으로 직접 사용하지 않는다 — UI 표면은 neutral-* 패밀리(cool blue-tinted)를 사용하고, gray-*는 utility용이다 [src:1].

## Responsive Behavior

원티드 시스템은 mobile-first 표준 패턴을 유지한다 — 모바일·태블릿·데스크톱 표면을 같은 시스템 위에서 운영하지만, 마케팅 표면은 max-width ~1080px, 대시보드는 ~1280px로 운영한다 [src:1].

### Breakpoints

| Name | Width | Columns | Gutter | Key Changes |
|---|---|---|---|---|
| Mobile | ≤ 640 | 4 | 16 | `{component.job-card}` 그리드를 1–2 컬럼으로 collapse, header 검색은 inline icon button으로 축약 [src:1] |
| Tablet | 641–1023 | 8 | 24 | 잡 그리드 2–3 컬럼, hero banner full-bleed 유지 [src:1] |
| Desktop (marketing) | 1024–1279 | 12 | 24 | max-content-width ~1080; hero `{component.hero-banner}` 가 standard [src:1] |
| Desktop (dashboard) | ≥ 1280 | 12 | 24 | max-content-width ~1280; 잡 그리드는 `{component.job-card}` 4 컬럼 [src:1] |

### Touch Targets

모든 인터랙티브 표면은 최소 44×44px hit area를 보장한다 [src:1]. `{component.input}`는 44px height로 시스템 디폴트와 일치한다. `{component.button}`의 sm(32)·md(40) 사이즈는 padding을 포함해 hit area를 보장한다. `{component.chip}` (34) · `{component.icon-button}` (36)도 동일한 정책이다.

### Collapsing Strategy

- **Job grid**: desktop 4 cols → tablet 2–3 cols → mobile 1–2 cols. card aspect는 그대로 유지된다 [src:1].
- **Header**: desktop의 nav links + search + icon buttons + avatar 풀 행 → tablet에서 일부 nav를 hamburger로 collapse → mobile은 hamburger + 로고 + 1–2 icon button.
- **Hero**: full-bleed gradient banner는 모든 breakpoint에서 유지되나, height가 모바일에서 축소된다 (관찰: desktop 280 → mobile ~200) [src:1].
- **Filter bar**: filter pills는 wrap, sort는 mobile에서 우측 정렬 유지하되 라벨이 축약될 수 있다.

### Image Behavior

마케팅 사진은 full-bleed로 표면에 사용되며, 카드의 썸네일은 16/12 (그리드) 또는 16/9 (상세) aspect로 잘려 표시된다 [src:1]. 일러스트는 빈 상태·온보딩에서만 등장 — 평면, 기하학적, primary blue + neutral.

## Known Gaps

- **OKLCH 변환 정확도** — 원본 `colors_and_type.css`는 hex (또는 일부 rgba) 토큰만 ship하며, 시스템 내장 OKLCH 표기는 surface되지 않는다 [src:1]. 본 문서의 OKLCH 값은 sRGB → OKLab 표준 변환이며, 실제 design tool/브라우저의 색재현에 따라 ±0.002 lightness/chroma 오차가 있을 수 있다.
- **그라디언트 mid-stop 미세 차이** — 브랜드 그라디언트의 mid-stop은 README와 atomic 팔레트에서 약간 다른 값으로 surface된다. README/avatar gradient는 `#FF53C0`(magenta-shifted), atomic pink-600은 `#F553DA` — UI kit `styles.css`에서 실제 사용되는 hex는 `#FF53C0`이며 본 문서는 이를 우선한다 [src:1].
- **공식 motion 토큰** — duration·easing의 시스템 토큰은 명시되지 않았으며, hover transition은 100–150ms ease, page transition은 ~200ms fade-in이라는 정책만 README에 prose로 surface된다 [src:1]. 본 문서의 Motion 표는 SSOT의 정책 prose에서 추출한 권장값이며, 명시 토큰은 아니다.
- **다크 모드 alias 완전성** — SSOT의 dark theme 토큰은 background(canvas, surface, subtle, muted, elevated, inverse, brand-subtle)·foreground(strong, default, secondary, tertiary, disabled, on-brand)·border(subtle, default, strong)까지 surface되어 있다 [src:1]. `bg-danger-subtle`/`bg-success-subtle`/`bg-warning-subtle`와 `fg-brand`/`fg-danger`/`fg-success`/`fg-warning`의 다크 alias는 SSOT가 surface하지 않았으며, 본 카탈로그의 preview 구현을 위해 위 `### Semantic alias — Dark` 블록에 적정 대비값으로 **합성(synthesized)**하여 수록했다 — 다운스트림이 동일 패턴(blue-400 brightened for fg-brand, semantic hue @ ↑ lightness for fg-*, low-alpha colored fill for bg-*-subtle)으로 host 토큰을 ship할 수 있게 한다.
- **wanted-icons 토큰 인벤토리** — wanted-icons는 자체 npm 패키지로 ship되며 Figma `/Icon` 페이지에 ~340개 아이콘이 정의된다 [src:1][src:5]. SSOT 번들은 production용 wanted-icons의 stand-in으로 Lucide CDN을 link하므로, 본 catalog가 적용되는 host는 production에서 `wanted-icons` 패키지로 교체해야 한다. 개별 아이콘의 토큰 명세(이름 매핑, 16px filled 변형 ID)는 본 문서 범위 외다.

## References

1. https://api.anthropic.com/v1/design/h/j7_orggLzbQ43g24R8OfYA — Wanted Design System 핸드오프 번들 (Claude Design SSOT). `README.md`, `colors_and_type.css`, `SKILL.md`, 14개 `preview/*.html` 카드, `ui_kits/wanted-web/` (Header.jsx · Filters.jsx · JobCard.jsx · JobDetail.jsx · JobGrid.jsx · Footer.jsx · index.html · styles.css), `assets/logos/` 심볼 + 로고타입. 본 entry의 1차 출처. © 2025 Wanted Lab.
2. https://www.wanted.co.kr — 원티드 공식 마케팅 + 잡 마켓플레이스. 슬로건·카피·비주얼 톤 참조.
3. https://wanted-sans.github.io — Wanted Sans 오픈소스 typeface (OFL). Wanted + 산돌 공동 제작.
4. https://github.com/orioncactus/pretendard — Pretendard JP variable typeface. 본 시스템의 베이스 UI face.
5. https://github.com/wanteddev/wanted-icons — Wanted 자체 아이콘 셋 npm 패키지. 24×24 그리드, 2px stroke, monochrome.
