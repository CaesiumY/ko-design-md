---
name: KRDS
slug: krds
category: gov
last_updated: 2026-05-09
created_at: 2026-05-09
sources:
  - https://api.anthropic.com/v1/design/h/J7mbJ1Zx_kYgPne50JpwZA
  - https://www.krds.go.kr/html/site/index.html
  - https://www.krds.go.kr/html/site/style/style_01.html
  - https://www.krds.go.kr/html/site/style/style_02.html
  - https://www.krds.go.kr/html/site/style/style_03.html
  - https://www.figma.com/community/file/1463780626774913638
  - https://uiux.egovframe.go.kr/
  - https://designcompass.org/en/2024/04/17/krds/
related_services: []
lang: ko
logo: https://getdesign.kr/logos/krds.svg
---

# KRDS — design.md

> Korea government Reusable Design System (전자정부 디자인 시스템) v1.0.0. 행정안전부가 발행하는 대한민국 공공 부문 디지털 서비스의 공식 UI/UX 표준이다 [src:1][src:6].

## Brand & Style

KRDS는 중앙행정기관·공공기관·지방자치단체가 공유하는 단일 시각 언어로, 신뢰·안정·접근성을 핵심 정서로 삼는다 [src:1][src:6]. 톤은 "informational, neutral and respectful — not marketing" — 정보 전달과 절차 안내가 목적이며, 마케팅적 과장이나 유희적 표현은 배제한다 [src:1].

대상 사용자는 세 층위로 정의된다. 디자이너에게는 Figma 라이브러리와 스타일 가이드를, 개발자에게는 컴포넌트와 토큰을, 그리고 도입·QA를 담당하는 공무원에게는 적용 지침을 제공한다 [src:5]. 최종 수혜자는 대한민국 국민이며, 그중에서도 **사용자 접근성 (accessibility)** 즉 장애인·고령자·아동·외국인을 명시적으로 고려한다 [src:1][src:7]. 이를 위해 **선명한 화면 모드 (high-contrast mode)** 가 기본 모드와 동등한 일등 시민으로 탑재된다 [src:1][src:7].

시각 언어는 절제와 정형으로 요약된다. 표면은 평면(flat)이며 그라디언트는 장식 목적으로 사용하지 않는다 [src:1]. 이미지는 마케팅 모듈에 한해 풀블리드 사진(따뜻하고 가공이 적은 실사)을 쓰고, 빈 상태(empty state)는 평면 기하학 일러스트레이션으로 처리한다. 손그림·텍스처·반복 패턴은 사용하지 않는다 [src:1]. **이모지는 어떤 자리에도 사용하지 않으며**, 유니코드 글리프로 아이콘을 대체하지도 않는다 [src:1][src:3]. 표준 스타일(Standard Style)은 정부 상징을 표시하는 중앙행정기관에 강제 적용되고, 자체 로고를 가진 공공기관에는 기본 규칙을 유지하면서 부분적으로 변형 가능한 적응 스타일(Adaptive Style)이 허용된다 [src:6].

## Colors

전체 팔레트는 `colors_and_type.css`의 CSS 커스텀 프로퍼티를 OKLCH로 변환한 값이다 [src:2]. 그레이·프라이머리·세컨더리·액센트의 4계열에 시맨틱(상태) 토큰이 더해지며, 액센트(워밍 레드)는 한 화면의 5% 미만에서만 — 알럿·치명 상태·단일 핵심 강조에 — 사용한다 [src:1][src:2].

```yaml
# Gray scale (13 steps) — surface, text, divider 전반의 기반
gray-5:    oklch(0.985 0 0)          # #FAFAFA
gray-10:   oklch(0.965 0.002 247)    # #F4F5F6 — bg-subtle
gray-20:   oklch(0.92 0.003 247)     # #E6E8EA — row divider
gray-30:   oklch(0.84 0.005 247)     # #CDD1D5 — border-default (1px workhorse)
gray-40:   oklch(0.755 0.008 240)    # #B1B8BE
gray-50:   oklch(0.625 0.013 246)    # #8A949E — border-strong, fg-4 (disabled)
gray-60:   oklch(0.525 0.014 246)    # #6D7882 — fg-3 (tertiary/placeholder)
gray-70:   oklch(0.445 0.013 247)    # #58616A
gray-80:   oklch(0.37 0.011 250)     # #464C53 — fg-2 (secondary)
gray-90:   oklch(0.295 0.011 268)    # #33363D — 아이콘 기본 fill
gray-95:   oklch(0.21 0.005 264)     # #1E2124
gray-100:  oklch(0.16 0.003 264)     # #131416 — fg-1 (primary text), bg-inverse, footer/identifier strip

# Primary — Government blue (브랜드 앵커)
primary-5:    oklch(0.98 0.01 256)     # #F7FAFF
primary-10:   oklch(0.955 0.018 254)   # #ECF2FE — selected bg, 서비스 타일 아이콘 컨테이너
primary-20:   oklch(0.91 0.035 252)    # #D8E5FD
primary-30:   oklch(0.79 0.085 251)    # #A3C2F8
primary-40:   oklch(0.665 0.155 254)   # #5B92F4
primary-50:   oklch(0.575 0.205 257)   # #256EF4 — brand blue, focus outline, primary button
primary-60:   oklch(0.475 0.21 261)    # #0B50D0 — hover/pressed, fg-link
primary-70:   oklch(0.345 0.115 257)   # #063A74 — masthead 워드마크, seal 배경
primary-80:   oklch(0.275 0.092 258)   # #052B57
primary-90:   oklch(0.225 0.082 263)   # #03204A
primary-95:   oklch(0.175 0.06 264)    # #021735
primary-100:  oklch(0.13 0.035 265)    # #010C1F

# Secondary — Deep desaturated navy (헤더 chrome, 절제된 강조)
secondary-10:  oklch(0.945 0.011 248)  # #EEF2F7 — hero 배경, bg-muted
secondary-20:  oklch(0.885 0.019 247)  # #D6E0EB
secondary-30:  oklch(0.715 0.038 252)  # #98ACC5
secondary-40:  oklch(0.575 0.045 254)  # #6E84A3
secondary-50:  oklch(0.395 0.045 257)  # #39506C
secondary-60:  oklch(0.31 0.05 258)    # #223A58
secondary-70:  oklch(0.275 0.092 258)  # #052B57 — masthead chrome 앵커
secondary-80:  oklch(0.215 0.07 263)   # #032041
secondary-90:  oklch(0.155 0.045 264)  # #02132A

# Accent — Warm red (한 화면 5% 미만, 알럿/치명 상태/단일 핵심 강조 전용)
accent-10:  oklch(0.945 0.022 17)      # #FCE9E9
accent-30:  oklch(0.755 0.115 17)      # #F19A9A
accent-50:  oklch(0.605 0.205 25)      # #E84B4B
accent-60:  oklch(0.515 0.205 27)      # #C72B2B
accent-70:  oklch(0.395 0.16 28)       # #8E1A1A

# Semantic / status
info:     oklch(0.555 0.155 245)       # #0B78CB
success:  oklch(0.49 0.11 153)         # #1F7A47
warning:  oklch(0.555 0.135 55)        # #C26900
danger:   oklch(0.555 0.205 28)        # #D6322F

# Foreground & surface (default mode)
fg-1:           oklch(0.16 0.003 264)  # gray-100, 본문 1차 텍스트
fg-2:           oklch(0.37 0.011 250)  # gray-80, 2차 텍스트
fg-3:           oklch(0.525 0.014 246) # gray-60, 3차/플레이스홀더
fg-4:           oklch(0.625 0.013 246) # gray-50, disabled/muted
fg-on-primary:  oklch(1 0 0)           # #FFFFFF
fg-link:        oklch(0.475 0.21 261)  # primary-60
bg-canvas:      oklch(1 0 0)           # #FFFFFF
bg-subtle:      oklch(0.965 0.002 247) # gray-10
bg-muted:       oklch(0.945 0.011 248) # secondary-10
bg-inverse:     oklch(0.16 0.003 264)  # gray-100
border-default: oklch(0.84 0.005 247)  # gray-30, 1px 기본 디바이더
border-strong:  oklch(0.625 0.013 246) # gray-50
border-focus:   oklch(0.575 0.205 257) # primary-50
```

KRDS 색상 가이드는 단계 번호 40·50·70·90을 WCAG 명도 대비 3:1·4.5:1·7:1·15:1에 대응시키는 "매직 넘버" 규약을 둔다 [src:7]. Primary 계열의 AA 준수 단계는 통상 40–60이다 [src:1][src:7].

## Typography

**Family.** 단일 패밀리 — **Pretendard GOV (정부용 Pretendard)**, Pretendard을 공공 부문 접근성과 한글 가독성에 맞춰 튜닝한 정부 전용 컷을 사용한다 [src:1]. 스택은 다음과 같다 [src:2]:

```
"Pretendard GOV", "Pretendard", -apple-system, BlinkMacSystemFont,
"Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif
```

번들 자체의 헤더 주석에 따르면 Pretendard GOV woff2 파일이 환경에 준비되지 않았을 경우 공개 자매 컷인 Pretendard 1.3.9를 가장 가까운 대체로 로드한다 [src:2][src:4]. 다운스트림 구현체에서도 Pretendard Variable 또는 Pretendard로 폴백할 수 있다.

**Weights.** 400 / 500 / 700 — 본문 대부분은 Regular(400) 또는 Bold(700)이고, Medium·SemiBold·ExtraBold는 마스트헤드 워드마크와 일부 강조에서만 잔여로 사용된다 [src:1].

**Type scale (PC).** [src:2]

| Token | Size / Line height | 용도 |
| --- | --- | --- |
| display-l | 64px / 1.3, `-0.02em` | 배너 한정, 절제된 사용 [src:1] |
| display-m | 44px / 1.3, `-0.02em` | 히어로 H1 (sample portal 기준) [src:4] |
| display-s | 36px / 1.3, `-0.02em` | — |
| heading-l | 32px / 1.3, `-0.01em` | 섹션 타이틀 |
| heading-m | 24px / 1.3 | 카드/모듈 타이틀 |
| heading-s | 19px / 1.3 | — |
| heading-xs | 17px / 1.3 | — |
| heading-xxs | 15px / 1.3 | — |
| body-l | 19px / 1.55 | 히어로 lede |
| **body-m** | **17px / 1.55** | **기본 본문** |
| body-s | 15px / 1.55 | 보조 본문 |
| body-xs | 13px / 1.55 | 유틸리티/메타 텍스트 |

본문 사이즈에는 `*-bold` 병행 토큰이 존재한다 (예: `body-m-bold` = 17px / 700 / 1.55) [src:1][src:2]. 헤딩 위계는 본문 콘텐츠에서 H1을 사용하지 않으며 H2 이하로만 운영한다 [src:1].

**Line height.** 토큰 [src:2]: `--krds-leading-tight: 1.3`, `--krds-leading-normal: 1.5`, `--krds-leading-loose: 1.7`. 본문 기본값은 1.55이며, 한글 가독성을 위해 1.5–1.55 범위를 유지한다 [src:1][src:2].

**Letter spacing.** 기본 0 — Pretendard이 한글에 이미 타이트하게 튜닝되어 있기 때문이다 [src:1]. Display는 `-0.02em`, Heading large는 `-0.01em` [src:1][src:2].

**Mobile step-down.** 모바일에서는 Display large 47→34, Heading large 32→24로 축소된다 [src:1]. 공식 KRDS 타이포그래피 가이드는 Display L 60→44를 기록하며 body medium 17px는 PC·모바일 동일하다 [src:9].

## Spacing

엄격한 4-pt 그리드를 따른다 [src:1]. 토큰은 `colors_and_type.css`에 정의된다 [src:2].

```yaml
space-1:   4px
space-2:   8px
space-3:   12px
space-4:   16px
space-5:   20px
space-6:   24px
space-8:   32px
space-10:  40px
space-12:  48px
space-16:  64px
space-20:  80px
```

대부분의 섹션은 8의 배수(8 / 16 / 24 / 40 / 64)로 호흡한다 [src:1].

**Reference layout** [src:1][src:4]:
- 콘텐츠 너비 1248px (`.container { max-width: 1248px; padding: 0 24px; }`)
- 뷰포트 1376–1616px 기준 외곽 패딩 64px
- 컴포넌트 내부 패딩 24px
- 섹션 간 수직 리듬 40 / 64 / 80px (sample portal: `section.module { padding: 80px 0; }`)

## Rounded

보수적인 5단계 스케일이며 최댓값은 12px이다. 이는 "정부에 적합한 신뢰·안정·친근감을 유희적으로 흐르지 않게 전달하기 위한" 의도적 상한이다 [src:1].

```yaml
radius-xsmall: 4px    # 12-32px 컨테이너 (chip, badge, small icon button)
radius-small:  6px    # 40-56px (input, button, tag)
radius-medium: 8px    # 56-64px (large button, card)
radius-large:  10px   # 72-80px (panel, modal section)
radius-xlarge: 12px   # 96px+ (hero card, full panel)
radius-pill:   999px  # chip과 카운터 전용
```

[src:1][src:2]

## Elevation & Depth

4단 그림자 시스템을 사용한다 [src:2]. 그림자는 표면 색 단계와 1px 디바이더(`gray-30`)가 만드는 평면 위계를 보조하는 역할이다.

```yaml
shadow-1: 0 1px 2px rgba(19,20,22,.06), 0 1px 1px rgba(19,20,22,.04)
shadow-2: 0 2px 6px rgba(19,20,22,.08), 0 1px 2px rgba(19,20,22,.04)
shadow-3: 0 6px 16px rgba(19,20,22,.10), 0 2px 4px rgba(19,20,22,.05)
shadow-4: 0 12px 28px rgba(19,20,22,.14), 0 4px 8px rgba(19,20,22,.06)
```

기본 모드에서 그림자 1–2단은 약 6–14% 검정으로 매우 절제된다. **선명한 화면 모드에서는 그림자가 더 약해지고, 표면 색 단계가 위계를 대신한다** [src:1]. 인너 섀도우 시스템은 정의되지 않는다 [src:1].

## Shapes

기하학은 직각형 우위이며, 코너는 보수적으로 라운드된다(2–12px). 곡선·유기적 형태나 사선 분할 같은 표현은 사용하지 않는다. 카드와 패널은 흰 표면 위 1px `border-default` (`gray-30`) + 라운드 8–12px가 표준 어휘이며, 색상 좌측 보더 액센트는 사용하지 않는다 [src:1].

장식의 부재는 의도적이다. 패턴·텍스처·반복 그래픽은 비치지 않고, 사진은 풀블리드 실사로만, 일러스트레이션은 평면 기하학으로만 운영된다 [src:1]. **이모지·유니코드 장식 글리프는 어디에도 등장하지 않으며**, 상태는 아이콘·색·뱃지로만 전달한다 [src:1][src:3].

**Iconography** [src:1][src:3]:
- 라인 아이콘 약 120종, 24×24 그리드. 사이즈 변형 12 / 16 / 20 / 32 / 40px.
- 외곽선·단색, 약 1.5–2px 스트로크, 둥근 라인 캡과 조인.
- 채움(fill) 변형은 상태 아이콘(`check-circle`, `system-info`, `system-warning`, `system-danger`, `system-success`)에 한정.
- 기본 fill `oklch(0.295 0.011 268)` (`gray-90`); status info `oklch(0.555 0.155 245)`; success check-circle은 brand blue `oklch(0.575 0.205 257)`로 채워진다.
- Format: SVG. 번들 caveat: 약 120개 중 6개(search, close, home, menu, download, exclamation)만 추출되어 있어, CDN 폴백이 필요하면 **Material Symbols Outlined** (weight 400, grade 0, optical size 24)로 대체한다 [src:1][src:3].

**Focus state.** 항상 보이는 2px 솔리드 아웃라인을 `primary-50`로 그리고 2px 오프셋을 둔다. `outline:none`은 어떤 경우에도 사용하지 않는다 [src:1].

**Motion.** 모션은 매우 절제된다. 색·투명도 전이는 150–200ms `ease-out`. 바운스·스프링·패럴랙스는 사용하지 않는다. 모달과 시트는 240ms 슬라이드업, 콘텐츠 로딩은 스피너 대신 스켈레톤 로더로 처리한다 [src:1].

## Components

번들의 sample portal `ui_kits/krds-website/index.html`이 다음 명명된 컴포넌트들을 조립한다 [src:4].

### government-identifier-strip — 정부 표식 / 공식 배너

모든 정부 페이지 최상단의 검정(`{colors.gray-100}`) `{spacing.space-10}` (40px) 바. 가운데에 "이 누리집은 대한민국 공식 전자정부 누리집입니다." 문구가 들어간다. KRDS 카탈로그는 이 요소를 **공식 배너**·**운영 기관 식별자**로 명명한다 [src:4][src:5][src:11].

```tsx
<div
  role="region"
  aria-label="공식 전자정부 안내"
  className="flex h-10 items-center justify-center bg-gray-100 text-fg-on-primary text-xs"
>
  이 누리집은 대한민국 공식 전자정부 누리집입니다.
</div>
```

### header-brand-block — 마스트헤드

44×44 원형 seal(`{colors.primary-70}` 배경) + "대한민국정부" 워드마크(`{colors.primary-70}`, 22px ExtraBold) + 좌측 보더로 분리된 슬로건(`{colors.fg-3}`)으로 구성된다 [src:4]. 슬로건 예시: "국민이 주인인 나라 / 믿을 수 있는 정부" [src:4].

### utility-row

높이 `{spacing.space-10}` (40px), 우측 정렬 13px 링크(로그인, 회원가입, 고객센터, EN). 각 링크 사이는 1px × 14px 디바이더로 분리된다 [src:4].

### primary-nav

높이 56px, 17px Bold 링크. 활성 상태는 `{colors.primary-60}` 텍스트와 3px `{colors.primary-50}` 언더라인 바를 함께 표시한다 [src:4].

### hero

`{colors.secondary-10}` 배경, 수직 패딩 `{spacing.space-16}` (64px), 1.1fr / 1fr 두 열 그리드(`{spacing.space-16}` (64px) 갭). H1 44px Bold, lede 19px [src:4].

### button

KRDS Button은 3 사이즈 × 3 변형(primary / secondary / tertiary)으로 운영된다 [src:4][src:1]. 변형은 functional kind에 해당하므로 아래 `button-*` 엔트리로 분해한다. 사이즈는 각 변형에 공통:

| 사이즈 | 높이 | 텍스트 | radius |
| --- | --- | --- | --- |
| L | 56px | 19px | `{rounded.radius-medium}` (8px) |
| M | 48px | 17px | `{rounded.radius-small}` (6px) |
| S | 40px | 15px | `{rounded.radius-small}` (6px) |

라벨은 항상 동사 한 단어 또는 짧은 동사구로 작성한다(예: "신청", "확인", "취소", "계속") [src:4][src:1].

### button-primary

`{colors.primary-50}` bg, 흰 텍스트 [src:1].

```tsx
<button
  type="button"
  className="h-12 rounded-md bg-primary-50 px-6 text-[17px] font-bold text-white hover:bg-primary-60"
>
  민원 신청
</button>
```

### button-primary-hover

`{colors.primary-60}` bg로 한 단계 어두워진다. transform·scale 없음 [src:1].

### button-primary-pressed

`{colors.primary-60}`보다 한 단계 더 어둡게 swap [src:1].

### button-primary-selected

`{colors.primary-10}` bg + `{colors.primary-60}` 텍스트로 invert된다 [src:1].

### button-tertiary

흰 bg, 1px `{colors.border-default}` (`{colors.gray-30}`) 보더, `{colors.fg-1}` 텍스트. 가장 절제된 변형으로 보조 액션에 사용된다 [src:4][src:1].

### button-disabled

opacity 0.5, `{colors.fg-4}` 텍스트, cursor `not-allowed`. 색상 변형과 독립적으로 적용된다 [src:1].

### search-bar

흰 표면, `{rounded.radius-xlarge}` (12px), `{elevation.shadow-2}`, `{spacing.space-2}` (8px) 패딩. select / divider / input / submit-button 합성 구조 [src:4].

### service-tile — 4-up grid

흰 카드, 1px `{colors.border-default}`, `{rounded.radius-xlarge}`, `{spacing.space-6}` (24px) 패딩. 48×48 아이콘 컨테이너는 `{colors.primary-10}` 배경. Hover에서 보더가 `{colors.primary-50}`로 전환되고 `{elevation.shadow-2}`가 추가된다 [src:4].

### notice-list — 공지사항 / 새소식 듀얼 컬럼

상단에 2px `{colors.fg-1}` 룰, 행 사이 1px `{colors.gray-20}` 디바이더. 13px Bold 뱃지는 1px `{colors.primary-50}` 보더 + `{colors.primary-60}` 텍스트 + `{rounded.radius-xsmall}` (4px). 제목 링크는 hover 시 `{colors.primary-60}` 언더라인. 날짜는 우측 정렬 tabular-numeric, `{colors.fg-3}` [src:4].

### card-default

`{colors.bg-canvas}` bg, 1px `{colors.gray-30}` (`{colors.border-default}`) 보더, 그림자 없음. 정보 카드의 표준 상태 [src:1].

### card-elevated

`{colors.bg-canvas}` bg, 1px `{colors.gray-30}` 보더, `{elevation.shadow-2}` 적용. 페이지 안에서 강조해야 하는 정보 카드에 사용한다 [src:1].

### card-selected

`{colors.bg-canvas}` bg, 2px `{colors.primary-50}` 보더 (포커스/선택 상태), 그림자 없음. 사용자가 선택한 카드를 표시한다 [src:1].

카드는 색상 좌측 보더 액센트를 사용하지 않는다 — 위 세 상태가 표면 카드의 유일한 어휘다 [src:1].

### modal

너비 480px, 흰 표면, `{rounded.radius-xlarge}`, `{spacing.space-8}` (32px) 패딩, `{elevation.shadow-4}`. 240ms 슬라이드업, 뒤에 `rgba(19,20,22,.5)` 스크림 [src:4][src:1]. 헤더는 행동 질문형(예: "민원 신청을 시작하시겠습니까?"), 본문은 절차형 `합니다` 정중체(예: "본인 인증이 필요한 서비스입니다. 간편인증 또는 공동인증서로 본인 확인 후 진행됩니다.") [src:4].

### toast

하단 중앙 배치, `{colors.gray-100}` bg, `{rounded.radius-medium}`, `{elevation.shadow-3}`. 옵션으로 `{colors.primary-50}` 상태 점, 200ms 슬라이드업, 2.4초 자동 dismiss [src:4]. 본문은 상태 확인형 `합니다` 정중체(예: "본인 인증이 완료되었습니다.") [src:4].

### footer

`{colors.gray-100}` 배경, 라이트 그레이 텍스트 스케일, 1px `{colors.gray-95}` 분할선, 1588 고객센터 번호·주소·저작권 표기 [src:4].

Figma 원본은 Button·Input·Modal·Calendar·Tab 같은 추가 1차 컴포넌트와 28종 패턴 레이아웃을 정의한다 [src:1][src:8].

## Do's and Don'ts

**Do**
- Pretendard GOV → Pretendard → 시스템 한글 폰트 순으로 폰트 스택을 작성한다.
- 본문 기본 사이즈는 17px / line-height 1.55 / letter-spacing 0을 유지한다.
- 표면은 흰색·`{colors.gray-10}`·`{colors.secondary-10}` 세 단계만 운영하고, 위계는 1px `{colors.gray-30}` 보더와 `{elevation.shadow-1}`–`{elevation.shadow-2}`로 표현한다.
- 모든 인터랙티브 요소에 2px `{colors.primary-50}` 포커스 아웃라인 + 2px 오프셋을 적용한다.
- **선명한 화면 모드**를 기본 모드와 동등한 대안으로 설계한다 — 그림자가 약해지는 만큼 표면 색 단계로 위계를 보강한다 [src:1][src:7].
- `{component.government-identifier-strip}` (공식 배너)은 모든 정부 페이지의 최상단에 검정 40px 바로 고정 배치한다 [src:4][src:5].
- KWCAG와 WCAG 2.x AA를 동시에 만족시킨다 [src:6].
- 영문 용어는 첫 노출에서 한글 풀이를 괄호로 병기한다(예: `Primary 색상 (primary color)`). 두 번째 등장부터는 한글만 사용한다 [src:1].

**Don't**
- 이모지를 사용하지 않는다 — 장식 목적이라 해도 예외 없다 [src:1][src:3].
- 유니코드 글리프로 아이콘을 대체하지 않는다 — 항상 SVG 아이콘을 사용한다 [src:3].
- 그라디언트를 장식 목적으로 사용하지 않는다 — 히어로 사진 위 가독성 보호용 스크림에 한해 허용한다 [src:1].
- 라운드 코너 12px를 초과하지 않는다(칩·카운터의 `{rounded.radius-pill}` 제외) — 유희적 인상을 주지 않기 위함이다 [src:1].
- 본문에 H1을 사용하지 않는다 — H2 이하로 위계를 운영한다 [src:1].
- 색상 좌측 보더 액센트를 사용해 카드를 구분하지 않는다 — `{component.card-default}` / `{component.card-elevated}` / `{component.card-selected}` 세 상태가 유일한 어휘다 [src:1].
- 액센트 레드(`{colors.accent-50}`)를 한 화면의 5% 이상 노출하지 않는다 — 알럿·치명 상태·단일 핵심 강조 외에는 사용하지 않는다 [src:1].
- 손그림·텍스처·반복 패턴 그래픽을 사용하지 않는다 [src:1].
- 모션에 바운스·스프링·패럴랙스를 사용하지 않으며, 콘텐츠 로딩에 스피너를 사용하지 않는다(스켈레톤 로더 사용) [src:1].
- 마케팅 톤(과장·감탄)을 사용하지 않는다. 레퍼런스 텍스트는 `~다` 평서체, 사용자 노출 카피는 `합니다` 정중체로 분리해 작성한다 [src:1].
- "~해보세요!" 같은 챗봇 톤을 사용하지 않으며, 주어로 "여러분"·"우리"를 쓰지 않는다 — 문장의 주어는 UI 요소 자체로 둔다 [src:1].
- `outline: none`을 사용해 포커스 표시를 제거하지 않는다 [src:1].

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | ≤ 640px | Display L 47→34px, Heading L 32→24px [src:1][src:9]; 단일 컬럼; `{component.utility-row}`는 햄버거 트레이로 이동; `{component.service-tile}` 4-up → 2-up |
| Tablet | 641–1023px | `{component.service-tile}` 2-up, `{component.notice-list}` 듀얼 컬럼 → 단일 컬럼 stack |
| Desktop | 1024–1375px | 기본 레이아웃; container max-width 1248px; 외곽 패딩 24px [src:1][src:4] |
| Wide | ≥ 1376px | 외곽 패딩 64px; container locked 1248px [src:1] |

### Touch Targets

최소 44 × 44px (KWCAG 권장 기준 [src:6]). Button L (56px) / Button M (48px) 모두 충족. Button S (40px)는 desktop 한정 사용 — 모바일 surface에서는 Button M 이상 [src:1].

### Collapsing Strategy

- `{component.government-identifier-strip}`: 모든 폭에서 유지 (40px 고정, 법적·식별 요구) [src:4][src:5].
- `{component.utility-row}`: ≤ 640px에서 햄버거 트레이로 이동.
- `{component.primary-nav}`: ≤ 640px에서 햄버거 메뉴; ≥ 641px에서 56px 가로 배치.
- `{component.hero}`: ≤ 640px에서 1열 stack, 수직 패딩 64→40px.
- `{component.service-tile}` 4-up grid: 4 → 2 → 1 (≥ 1024 / ≥ 641 / ≤ 640).

### Image Behavior

마케팅 모듈의 풀블리드 사진은 모바일에서 art direction 전환 — 가로 16:9 → 세로 4:5 또는 1:1 [src:1]. SVG 아이콘은 사이즈 변형 12 / 16 / 20 / 24 / 32 / 40으로 유지 [src:3].

## Known Gaps

- KRDS 번들은 약 120종 라인 아이콘을 정의하지만 [src:1][src:3], 핸드오프 추출본에는 6종(search, close, home, menu, download, exclamation)만 포함되어 있다. CDN 폴백으로 **Material Symbols Outlined**(weight 400, grade 0, optical size 24)을 권장한다 [src:1].
- 폼 검증·에러 상태의 토큰화된 정의는 본 entry 출처에서 surface되지 않았다. 운용 시 `{colors.danger}` 보더 + helper text 사용이 합리적 추정이다.
- KRDS 표준은 라이트 모드와 **선명한 화면 모드**(high-contrast)를 1등 시민으로 명시하지만 [src:1][src:7], 일반 다크 모드 변형은 현재 entry 범위 밖이며 별도 검증 대상이다.
- `{component.service-tile}` 4-up grid의 정확한 gutter·column 토큰은 sample portal CSS 추출에 한계가 있어 24px·1248px 기준의 추정값을 사용했다 [src:4].
- 모션 토큰은 duration·easing만 surface되었으며 [src:1], 컴포넌트별 transition 정의는 sample portal에 일부만 노출된다 [src:4].

## References

1. https://api.anthropic.com/v1/design/h/J7mbJ1Zx_kYgPne50JpwZA — Claude Design 번들 `project/README.md` (시각 기반, 보이스/톤 규칙, 컴포넌트 분류, 아이콘 규칙)
2. https://api.anthropic.com/v1/design/h/J7mbJ1Zx_kYgPne50JpwZA — Claude Design 번들 `project/colors_and_type.css` (모든 CSS 커스텀 프로퍼티: 정확한 hex 값, 타입·라운드·스페이싱·섀도우 토큰)
3. https://api.anthropic.com/v1/design/h/J7mbJ1Zx_kYgPne50JpwZA — Claude Design 번들 `project/SKILL.md` (보이스/팔레트 앵커 매니페스트)
4. https://api.anthropic.com/v1/design/h/J7mbJ1Zx_kYgPne50JpwZA — Claude Design 번들 `project/ui_kits/krds-website/index.html` (sample portal: identifier strip, header, hero, tiles, notice list, modal, toast)
5. https://www.krds.go.kr/html/site/index.html — KRDS 공식 사이트 랜딩(미션, 원칙, 컴포넌트 카테고리)
6. https://www.krds.go.kr/html/site/style/style_01.html — 디자인 스타일 개요(Standard vs Adaptive Style, KWCAG, AA 준수)
7. https://www.krds.go.kr/html/site/style/style_02.html — 색상 스타일 페이지(매직 넘버 대비 규약, 정부 블루/그레이/레드 앵커)
8. https://www.figma.com/community/file/1463780626774913638 — KRDS_v1.0.0 Figma community 파일 (63 페이지 / 213 프레임 범위)
9. https://www.krds.go.kr/html/site/style/style_03.html — 타이포그래피 스타일 페이지(Pretendard GOV 근거, PC/모바일 타입 스케일)
10. https://uiux.egovframe.go.kr/ — eGovFrame UI/UX 포털(KRDS 배포 채널)
11. https://designcompass.org/en/2024/04/17/krds/ — KRDS 범위와 컴포넌트 보충 해설
