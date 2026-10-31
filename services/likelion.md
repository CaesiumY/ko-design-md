---
name: 멋쟁이사자처럼
design_system_name: LIKELION Design System
slug: likelion
category: education
last_updated: 2026-11-01
created_at: 2026-08-30
lang: ko
logo: https://getdesign.kr/logos/likelion.svg
colors:
  ## Primary (오렌지 시그니처)
  primary-50: oklch(0.96 0.022 54)    # #FFEFE5
  primary-100: oklch(0.93 0.044 52)   # #FFDFCC
  primary-200: oklch(0.85 0.089 53)   # #FFBF99
  primary-300: oklch(0.79 0.135 51)   # #FFA066
  primary-400: oklch(0.73 0.177 48)   # #FF8033
  primary: "{colors.primary-500}"
  primary-500: oklch(0.69 0.209 42)   # #FF6000 브랜드 시그니처
  primary-600: oklch(0.58 0.175 42)   # #CC4D00
  primary-700: oklch(0.48 0.139 44)   # #993A00
  primary-800: oklch(0.36 0.102 45)   # #662600
  primary-900: oklch(0.30 0.082 47)   # #4D1D00
  ## Gray (쿨톤 뉴트럴)
  gray-50: oklch(0.98 0.002 245)      # #F9FAFB
  gray-100: oklch(0.97 0.003 270)     # #F3F4F6
  gray-200: oklch(0.93 0.005 255)     # #E5E7EA
  gray-300: oklch(0.87 0.010 253)     # #D1D6DC
  gray-400: oklch(0.78 0.014 252)     # #B1B8C0
  gray-500: oklch(0.67 0.021 251)     # #8A95A0
  gray-600: oklch(0.56 0.025 257)     # #6B7583
  gray-700: oklch(0.46 0.027 256)     # #4E5967
  gray-800: oklch(0.35 0.029 261)     # #333D4B
  gray-850: oklch(0.30 0.027 257)     # #262F3C
  gray-900: oklch(0.24 0.024 262)     # #191F28
  gray-950: oklch(0.22 0.007 247)     # #191C1F
  ## Semantic (bg/fg/border/info)
  white: oklch(1 0 0)                 # #FFFFFF 상류 이름은 basic-white
  bg-white: "{colors.white}"
  bg-normal: "{colors.gray-100}"
  bg-normal-hovered: "{colors.gray-50}"
  bg-normal-alternative: "{colors.gray-200}"
  bg-normal-assistive: "{colors.gray-50}"
  bg-disabled: "{colors.gray-100}"
  bg-disabled-dark: "{colors.gray-200}" # -dark 는 테마 짝이 아니라 상류의 명도 단계 이름
  bg-inverted: "{colors.gray-950}"
  bg-inverted-hovered: "{colors.gray-900}"
  bg-primary: "{colors.primary-500}"
  bg-primary-hovered: "{colors.primary-600}"
  bg-primary-weak: "{colors.primary-50}"
  fg-white: "{colors.white}"
  fg-primary: "{colors.primary-500}"
  fg-pressed: "{colors.primary-600}"
  fg-primary-inverted: "{colors.primary-300}"
  fg-strong: "{colors.gray-900}"
  fg-normal: "{colors.gray-800}"
  fg-neutral: "{colors.gray-700}"
  fg-alternative: "{colors.gray-600}"
  fg-assistive: "{colors.gray-500}"
  fg-disabled: "{colors.gray-400}"
  border-primary: "{colors.primary-500}"
  border-strong: "{colors.gray-800}"
  border-normal: "{colors.gray-300}"
  border-weak: "{colors.gray-200}"
  border-white: "{colors.white}"
  border-inverted: "{colors.gray-700}"
  border-inverted-strong: "{colors.gray-600}"
  info-white: "{colors.white}"
typography:
  display-d1: # 미확인 — fontWeight/lineHeight는 스케일 범위 안에서 고른 예시 조합
    fontSize: 52px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: -0.3px
  heading-h1: # 미확인 — fontWeight/lineHeight는 스케일 범위 안에서 고른 예시 조합
    fontSize: 35px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: -0.3px
  heading-h4: # 미확인 — fontWeight/lineHeight는 스케일 범위 안에서 고른 예시 조합
    fontSize: 23px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0px
  body-p1: # 미확인 — fontWeight/lineHeight는 스케일 범위 안에서 고른 예시 조합
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  body-p3: # 미확인 — fontWeight/lineHeight는 스케일 범위 안에서 고른 예시 조합
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  body-p5: # 미확인 — fontWeight/lineHeight는 스케일 범위 안에서 고른 예시 조합
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0px
spacing:
  space-1: 4px
  space-2: 8px
  space-3: 12px
  space-4: 16px
  space-5: 20px
  space-6: 24px
  space-8: 32px
  space-10: 40px
  space-12: 48px
rounded:
  radius-05: 2px
  radius-1: 4px
  radius-2: 8px
  radius-3: 12px
  radius-4: 16px
  radius-5: 20px
  radius-6: 24px
  radius-full: 999px
---

# 멋쟁이사자처럼 — design.md

## Brand & Style

멋쟁이사자처럼은 코딩 교육 커뮤니티이자 취업·전직 부트캠프 브랜드다. 채도 높은 시그니처 오렌지 `oklch(0.69 0.209 42)`(#FF6000)와 쿨톤 그레이 뉴트럴을 맞세워 에너지 넘치는 색 인상을 만들고 [src:4], 부담을 낮추는 격려형 어조로 친근함을 더한다 [src:11].

브랜드는 2013년 서울대 학생 프로그래밍 동아리로 출발해 전국 단위 조직으로 성장했고, 현재 두 개의 트랙을 함께 운영한다 — 48개 대학이 참여하는 대학 컨소시엄 커뮤니티 "멋사 대학"(2025년 13기)과, 프론트엔드·백엔드·앱·게임·클라우드·데이터·UX/UI·그로스마케팅을 아우르는 취업준비생·이직희망자 대상 전문 부트캠프다 [src:12]. 슬로건 "POSSIBILITY TO REALITY, 가능성을 현실로"는 비전공자·입문자도 기술 장벽 없이 아이디어를 서비스로 만들 수 있다는 브랜드 미션을 요약한다 [src:12].

톤앤보이스는 공식 Brunch 채널에서 직접 확인된다 — "완벽한 시작을 하려고 하지 마세요"처럼 부담을 낮추는 도입부와 "여러분을 기다리겠습니다" 같은 다정한 마무리를 함께 쓰며, "좋은 프로덕트는 철학이 담긴 프로덕트다"라는 문장으로 실무적 자부심도 드러낸다 [src:11]. 즉 기업/엔터프라이즈向 격식체가 아니라, 학생·취준생에게 말을 거는 직접적이고 격려하는 어조다.

디자인 시스템(designsystem.likelion.net)은 Storybook 기반으로 7개 Foundation 토큰 그룹과 18개 재사용 컴포넌트를 문서화하며 [src:3], 외부 AI 코딩 어시스턴트가 토큰·컴포넌트를 조회할 수 있는 자체 MCP 서버(`@likelion-design/docs-mcp`, MIT)까지 배포한다 — 국내 브랜드 디자인 시스템 중에서는 이례적으로 AI 툴링에 적극적인 태도다 [src:8]. 이 draft의 시각 서술은 렌더링된 화면 스크린샷이 아니라 컴파일된 토큰 CSS 번들에서 역추출한 값에 근거한다 — likelion.net과 designsystem.likelion.net 둘 다 클라이언트 렌더 SPA 셸이라 자동 추출 도구에는 페이지 타이틀만 노출됐고(robots.txt[src:9]·sitemap.xml[src:10]도 소스로 함께 확인했다), 실제 렌더 화면 확인은 후속 스크린샷 패스가 필요하다 [src:1][src:2].

## Colors

> **역할 계층 대조 결과(2026-11-01).** 배포 토큰 CSS [src:4] 와 npm `@likelion-design/ui` 1.0.32 의 `dist/colors.css.css` [src:15] 를 다시 받아 대조했다. 두 파일의 `--color-semantic-*` 정의 62개는 한 글자도 다르지 않다. 이전 판이 싣던 역할 11개는 모두 상류 대응과 맞았고(불일치 0), 상류가 이 항목에 실린 팔레트(primary · gray · white) 단계 하나를 가리키는 역할 19개를 더했다. 역할 이름(`bg-normal` · `fg-primary` · `border-primary` 등)은 같은 패키지가 `--color-semantic-` 를 뗀 이름으로 Tailwind 테마 변수와 유틸리티로 발행하는 이름이다 [src:14]. 다크 테마의 시맨틱 정의는 상류에 없다 [src:4][src:15].

시그니처는 10단계 오렌지 램프로, 500 단계 `oklch(0.69 0.209 42)`(#FF6000)을 중심으로 밝은 배경용(50~200)과 어두운 강조용(600~900)이 대칭적으로 갈린다 [src:4]. 뉴트럴은 순수 무채색이 아니라 미세하게 푸른 기운이 도는 "gray" 램프(`#F9FAFB`→`#191F28`)로, 오렌지 액센트와 대비되는 차가운 배경 톤을 만든다 [src:4]. 시맨틱 레이어는 배경(`bg-*`)·전경(`fg-*`)·테두리(`border-*`) 세 축이 중심이고, `info-*` 와 `style-*` 가 곁에 있다 [src:15]. `bg-primary` · `fg-primary` · `border-primary` 는 오렌지 500 을 가리키고, 눌림·호버 상태(`fg-pressed` · `bg-primary-hovered`)는 600, 어두운 바탕 위 강조(`fg-primary-inverted`)는 300 을 가리킨다 [src:4][src:15].

공개 코퍼스는 `--color-*` 커스텀 프로퍼티 199개를 grep으로 확인했고, Foundation 매니페스트가 Primitive/Semantic/Style/Palette 하위 페이지를 추가로 문서화한다고 밝히고 있어 이 수치는 하한선이다 [src:2][src:3].

아래 표는 frontmatter 참조 행과 **같은 대응의 두 벌**이다. 팔레트 열이 단계 하나인 역할은 frontmatter 에도 `bg-primary: "{colors.primary-500}"` 꼴로 실려 있고, 불투명도 램프를 거치는 역할은 이 표에만 있다. 상류는 역할마다 용도를 따로 문서화하지 않아, 용도는 이름에서만 읽힌다.

**bg**

| 역할 | 팔레트 | 상류 변수 |
| --- | --- | --- |
| `bg-white` | `{colors.white}` | `--color-semantic-bg-white` [src:15] |
| `bg-normal` | `{colors.gray-100}` | `--color-semantic-bg-normal` [src:15] |
| `bg-normal-hovered` | `{colors.gray-50}` | `--color-semantic-bg-normal-hovered` [src:15] |
| `bg-normal-alternative` | `{colors.gray-200}` | `--color-semantic-bg-normal-alternative` [src:15] |
| `bg-normal-assistive` | `{colors.gray-50}` | `--color-semantic-bg-normal-assistive` [src:15] |
| `bg-disabled` | `{colors.gray-100}` | `--color-semantic-bg-disabled` [src:15] |
| `bg-disabled-dark` | `{colors.gray-200}` | `--color-semantic-bg-disabled-dark` — `-dark` 는 테마 짝이 아니라 명도 단계 [src:15] |
| `bg-inverted` | `{colors.gray-950}` | `--color-semantic-bg-inverted` [src:15] |
| `bg-inverted-hovered` | `{colors.gray-900}` | `--color-semantic-bg-inverted-hovered` [src:15] |
| `bg-primary` | `{colors.primary-500}` | `--color-semantic-bg-primary` [src:15] |
| `bg-primary-hovered` | `{colors.primary-600}` | `--color-semantic-bg-primary-hovered` [src:15] |
| `bg-primary-weak` | `{colors.primary-50}` | `--color-semantic-bg-primary-weak` [src:15] |
| `bg-primary-disabled` | `{colors.primary-500}` 값 × 24% 불투명도 | `basic-opacity-primary-24` 를 거친다 [src:15] |
| `bg-weak-primary` | `{colors.primary-500}` 값 × 8% 불투명도 | `basic-opacity-primary-8` 을 거친다 [src:15] |
| `bg-weak-primary-hovered` | `{colors.primary-500}` 값 × 16% 불투명도 | `basic-opacity-primary-16` 을 거친다 [src:15] |
| `bg-weak-neutral-light` | `{colors.white}` 값 × 8% 불투명도 | `basic-opacity-neutral-light-8` 을 거친다 [src:15] |
| `bg-weak-neutral-light-hovered` | `{colors.white}` 값 × 16% 불투명도 | `basic-opacity-neutral-light-16` 을 거친다 [src:15] |

**fg**

| 역할 | 팔레트 | 상류 변수 |
| --- | --- | --- |
| `fg-white` | `{colors.white}` | `--color-semantic-fg-white` [src:15] |
| `fg-primary` | `{colors.primary-500}` | `--color-semantic-fg-primary` [src:15] |
| `fg-pressed` | `{colors.primary-600}` | `--color-semantic-fg-pressed` [src:15] |
| `fg-primary-inverted` | `{colors.primary-300}` | `--color-semantic-fg-primary-inverted` [src:15] |
| `fg-strong` | `{colors.gray-900}` | `--color-semantic-fg-strong` [src:15] |
| `fg-normal` | `{colors.gray-800}` | `--color-semantic-fg-normal` [src:15] |
| `fg-neutral` | `{colors.gray-700}` | `--color-semantic-fg-neutral` [src:15] |
| `fg-alternative` | `{colors.gray-600}` | `--color-semantic-fg-alternative` [src:15] |
| `fg-assistive` | `{colors.gray-500}` | `--color-semantic-fg-assistive` [src:15] |
| `fg-disabled` | `{colors.gray-400}` | `--color-semantic-fg-disabled` [src:15] |

**border**

| 역할 | 팔레트 | 상류 변수 |
| --- | --- | --- |
| `border-primary` | `{colors.primary-500}` | `--color-semantic-border-primary` [src:15] |
| `border-strong` | `{colors.gray-800}` | `--color-semantic-border-strong` [src:15] |
| `border-normal` | `{colors.gray-300}` | `--color-semantic-border-normal` [src:15] |
| `border-weak` | `{colors.gray-200}` | `--color-semantic-border-weak` [src:15] |
| `border-white` | `{colors.white}` | `--color-semantic-border-white` [src:15] |
| `border-inverted` | `{colors.gray-700}` | `--color-semantic-border-inverted` [src:15] |
| `border-inverted-strong` | `{colors.gray-600}` | `--color-semantic-border-inverted-strong` [src:15] |

**info**

| 역할 | 팔레트 | 상류 변수 |
| --- | --- | --- |
| `info-white` | `{colors.white}` | `--color-semantic-info-white` [src:15] |

상류의 시맨틱 역할 가운데 이 항목에 실리지 않은 팔레트를 가리키는 것은 표에 넣지 않았다 — Known Gaps 참고.

## Typography

전 스케일이 단일 서체 **Pretendard** 하나로 통일돼 있다 — display 단계와 heading/body 단계가 모두 같은 `pretendard` 패밀리를 참조하며, 별도의 브랜드 전용 디스플레이 서체는 확인되지 않았다 [src:4]. 토큰 번들은 `pretendard.css` CDN을 직접 `@import`하므로, 프리뷰 런타임이 이미 번들링한 Pretendard와 겹쳐 별도의 `font-display-src`가 필요 없다 [src:4].

사이즈 스케일은 양 끝이 넓다 — body-p5 11px부터 display-d1 52px까지, 5단계 굵기(400/500/600/700/800)와 3단계 자간(`-tight -0.3px` · `-normal 0px` · `-loose 1px`)이 공개돼 있다 [src:4]. 다만 이 세 축(사이즈/굵기/자간)이 각 명명된 스타일에 정확히 어떻게 짝지어지는지는 코퍼스에서 개별 확인되지 않아, 위 frontmatter의 `fontWeight` 값은 문서화된 굵기 스케일 범위 안에서 고른 예시 조합이다 — Known Gaps 참고. `lineHeight`는 한 걸음 더 나아가 코퍼스에 스케일 자체가 공개돼 있지 않아, 스타일 크기별로 통상적인 비율을 적용한 완전한 추정값이다. 큰 사이즈일수록 굵고 좁은 자간(`-tight`), 본문 사이즈는 400 굵기·`normal` 자간을 쓰는 것이 스케일 구조상 자연스러운 짝짓기다 [src:4].

Foundation 매니페스트에 `foundation-typography--docs` 페이지가 별도로 존재해, Typography가 추정이 아니라 1급 문서화 그룹임은 확인된다 [src:3].

## Spacing

기준 단위는 4px다. `--spacing-primitive-*` 네임스페이스가 이 배수로 14개 토큰을 이루고, 그 위에 `gap-semantic`(13개)·`padding-semantic`(11개) 두 시맨틱 네임스페이스가 얹혀 총 24개의 시맨틱 spacing 토큰을 구성한다 [src:2][src:4]. Primitive 14개 중 9개(4~48px 구간)만 코퍼스에서 개별 재확인됐고, 나머지 단계는 Known Gaps에 남긴다.

## Rounded

`--radius-primitive-*` 스케일은 2px에서 24px까지 8개 단계를 거쳐 999px "full" 필 단계로 끝난다(총 11개 중 8개 재확인) [src:2][src:4]. 12~24px 같은 중~대형 반경이 소형 단계와 나란히 1급 스텝으로 존재한다는 점이 특징으로, 날카로운 기하학적 언어나 순수 필 형태 한 가지로만 수렴하지 않는 부드럽고 절제된 둥근 코너 체계를 시사한다 [src:4].

## Elevation & Depth

공개된 브랜드 고유 그림자/elevation 토큰이 없다 — 번들에는 Tailwind 자체의 내부 인프라 변수(`--tw-shadow` 등)만 존재하고, 별도로 이름 붙은 elevation 스텝은 확인되지 않았다 [src:2].

## Shapes

12~24px대 반경이 소형 단계와 함께 1급으로 존재하는 rounded 스케일과, 조밀하고 Hangul 가독성에 최적화된 Pretendard 단일 서체 스케일을 종합하면 각지고 기하학적이기보다는 부드럽게 둥근, 그러나 순수 필(pill) 하나로만 수렴하지 않는 절제된 곡률 언어로 읽힌다 [src:4]. 여기에 채도 높은 시그니처 오렌지가 얹혀, 교육/커뮤니티 브랜드다운 접근성과 에너지를 동시에 전달하는 조합이다 [src:4][src:12].

## Components

Storybook 매니페스트(`index.json`, 총 135 엔트리)는 각각 문서 페이지와 라이브 스토리를 갖춘 18개 컴포넌트를 나열한다: Badge, ActionButton, IconButton, Chip, Checkbox, RadioButton, Toggle, DatePicker, Dialog, Pagination, SelectBox, SelectHeader, SelectMenu, Tab, Tag, TextField, Toast, Tooltip [src:3]. 컴포넌트와 별도로 Brand Logo, Colors, Radius, Screen, Screen Grid, Space, Typography가 Foundation 그룹으로 문서화돼 있다 [src:3].

라이선스 참고: 컴포넌트 코드가 배포되는 npm 패키지 `@likelion-design/ui`(최신 `1.0.32`)는 `license` 필드가 비어 있고(null) [src:7], 문서 사이트 자체도 `/LICENSE` 요청에 403을 반환하며 [src:6], ~100개 이상의 JS/CSS 청크와 index.html을 grep해도 명시적 저작권/재배포 금지 문구는 발견되지 않았다 [src:2]. 즉 컴포넌트/토큰 콘텐츠 자체에는 명시적 허용도 명시적 금지도 없다 — 유일하게 명문화된 사용 제한은 아래 Brand Logo 규정뿐이다.

개별 컴포넌트가 정확히 어떤 토큰을 쓰는지는 렌더링된 화면이 아니라 시맨틱 토큰의 이름 자체에서 유추한 것이며(예: `border-primary`는 포커스/강조용으로 명명돼 있다), 컴포넌트별 실측 매핑은 아니다 [src:4].

### action-button

1차 CTA 버튼 계열. 시맨틱 토큰 이름 구조상 `{colors.bg-primary}` 채움과 `{colors.fg-white}` 라벨 잉크, `{rounded.radius-3}` 코너를 쓰는 것이 스케일과 정합적이다 [src:3][src:4].

```tsx
<ActionButton variant="primary">확인</ActionButton>
```

### icon-button

아이콘 전용 컴팩트 버튼. `{rounded.radius-full}` 원형 코너와 `{colors.gray-600}` 기본 아이콘 잉크, 활성/호버 시 `{colors.fg-primary}`로 전환되는 구조가 토큰 명명과 정합적이다 [src:3][src:4].

### text-field

입력 필드. 기본 상태 `{colors.border-normal}`, 포커스/강조 상태 `{colors.border-primary}`, 비활성 라벨 `{colors.fg-disabled}`를 쓰는 것이 시맨틱 토큰 이름 구조상 자연스럽다 — 정확한 상태별 매핑은 렌더링 확인이 필요하다 [src:3][src:4].

```tsx
<TextField placeholder="이메일" disabled={false} />
```

### select-box

SelectBox·SelectHeader·SelectMenu 세 엔트리가 나란히 문서화돼 있다 [src:3] — 이름 구조상 트리거 헤더 + 오버레이 메뉴로 조합되는 선택형 패턴으로 추정되나, 세 엔트리를 하나의 패턴으로 묶어 설명하는 문서 자체가 확인된 것은 아니다. 오버레이 표면에는 `{colors.bg-white}`, 구분선에는 `{colors.border-weak}`가 정합적이다 [src:4].

### dialog / toast

Dialog(모달)와 Toast(일시적 알림)는 각각 별도 스토리로 문서화된 피드백 컴포넌트다 [src:3]. 표면 배경은 `{colors.bg-white}`, 강조가 필요한 경우 `{colors.bg-primary-weak}` 배경에 `{colors.fg-primary}` 텍스트 조합을 쓰는 것이 팔레트 구조와 맞는다 [src:4].

### tag / chip

Tag와 Chip은 별도 컴포넌트로 각각 문서화돼 있다 [src:3]. 라벨류 컴포넌트답게 `{colors.bg-primary-weak}` 배경에 `{colors.fg-primary}` 텍스트, `{rounded.radius-full}` 또는 `{rounded.radius-2}` 코너를 쓰는 조합이 팔레트·radius 스케일과 정합적이다 [src:4].

### brand-logo

Foundation의 Brand Logo 그룹은 컴포넌트가 아니라 자산 규정이지만, 이 카탈로그에서 유일하게 명문화된 사용 제한을 담고 있어 함께 기록한다. 컴파일된 `Logo.mdx` 청크에서 직접 인용하면 [src:5]:

- "로고의 형태나 비율을 임의로 변경하거나 왜곡하여 사용하는 것은 금지합니다."
- "임의로 로고의 색상 / 형태 / 비례를 변형하거나 삭제하는 행위는 허용하지 않습니다."
- "다른 요소들로부터 8.2배 이상의 여백 공간을 확보해야 합니다."

위 여백 배수는 컴파일된 `Logo.mdx` 청크의 본문 텍스트를 그대로 옮긴 것이나 [src:5], 같은 문서의 Clear space 다이어그램은 로고 사방 여백을 "0.2X"로 표기하고 있어 [src:13] 본문 텍스트와 정확히 40배 어긋난다 — 브랜드 원본 자체의 내부 불일치로 보인다(다이어그램의 "0.2"가 본문에서 "8.2"로 오기됐을 가능성이 높다). 이 카탈로그는 두 값 중 하나를 임의로 정본화하지 않고 원문 그대로 병기한다.

심볼 마크는 오렌지(`oklch(0.69 0.209 42)` ≈ #FF6000)·블랙(`oklch(0 0 0)` ≈ #000000)·화이트 세 색상 변형으로만 존재하며, 공개 서빙 형태는 PNG 래스터(`/img/BrandLogo/04_Symbol.png` 등)뿐이다 — 순수 벡터는 JS 스토리 청크 안 data-URI로만 존재하고 독립 SVG 파일로는 공개되지 않는다 [src:5].

## Do's and Don'ts

**Do** 시그니처 오렌지 `{colors.bg-primary}`를 쿨톤 그레이 `{colors.gray-*}` 위에 얹어 에너지 있는 에듀테크 색 인상을 유지하고 [src:4], 카피 톤은 격려형 어조로 친근함을 더한다 [src:11].

**Do** 12~24px대의 중~대형 반경(`{rounded.radius-3}`~`{rounded.radius-6}`)을 소형 코너와 나란히 써서, 날카로운 기하학이나 순수 필 하나로 수렴하지 않는 절제된 둥근 코너 언어를 지킨다 [src:4].

**Don't** 브랜드가 다루는 부트캠프 커리큘럼명·수강신청/코호트 모집 플로우·트랙별 카피(프론트엔드/백엔드/데이터 등)를 그대로 재현하지 말 것 — 소비자가 빌려야 할 것은 오렌지+쿨그레이+절제된 라운드 코너라는 시각 언어이지, 교육/부트캠프 도메인의 제품 개념이나 모집 플로우가 아니다 [src:12].

**Don't** Brand Logo 자산을 임의로 리컬러·왜곡하거나 최소한의 여백 없이 배치하지 말 것 — 이는 브랜드가 명문화한 유일한 사용 제한이다(정확한 여백 배수는 본문 텍스트 "8.2배"와 다이어그램 "0.2X"가 서로 어긋나 확정할 수 없다 — Components/brand-logo 참고) [src:5][src:13].

**Don't** `LIKELION Design System` 워드마크·`@likelion-design/ui`·`@likelion-design/docs-mcp` 패키지명을 소비자가 생성하는 UI의 카피·헤더·타이틀·라벨·클래스명에 노출하지 말 것 — 차용할 것은 오렌지+쿨그레이 팔레트와 절제된 라운드 코너라는 시각 언어이지, 이 디자인 시스템의 이름이나 패키지 정체성이 아니다.

## Responsive Behavior

이 절은 렌더링된 제품 화면이 아니라 디자인 시스템 문서 사이트(Storybook 셸)의 번들 CSS `@media` 규칙에서 역추출한 것이라는 단서를 달아 읽어야 한다 [src:4].

| 폭 | 값 | Key Changes |
| --- | --- | --- |
| xs | 375px | 관찰된 가장 좁은 기준폭 [src:4] |
| sm | 640px | Tailwind 스톡 기본값 — 브랜드 고유 `--screen-*` 토큰 없음 [src:4] |
| (비표준) | 744px | 640/768 사이 추가 스텝, 이름 붙은 토큰 없음 [src:4] |
| md | 768px | Tailwind 스톡 기본값 [src:4] |
| lg | 1024px | Tailwind 스톡 기본값 [src:4] |
| xl | 1280px | 그리드가 2열 → 3열로 확장 (`repeat(2, minmax(0,1fr))` → `repeat(3, minmax(0,1fr))`) [src:4] |
| 2xl | 1536px | Tailwind 스톡 기본값 [src:4] |

터치 타깃 최소 크기, 컴포넌트별 축소 전략, 이미지/종횡비 처리 방식은 공개 코퍼스에서 확인되지 않았다(no published touch-target or per-component collapsing rule surfaced) — SPA 셸이 자동 추출 도구에 실제 렌더 콘텐츠를 내주지 않았기 때문이다 [src:1][src:2]. Foundation 매니페스트에 "Screen"(Specification 전용)과 "Screen Grid"(Docs 페이지 있음) 항목이 별도로 존재해 반응형/그리드 가이드 자체는 공식적으로 문서화돼 있음은 확인되지만, 구체적인 컬럼 수·거터·마진 값은 캡처되지 않았다 [src:3].

## Known Gaps

- 스크린샷/렌더 화면이 확보되지 않아 위 시각 서술은 대부분 컴파일된 토큰 CSS에서 역추출한 값이며, 실제 렌더 화면 확인이 필요하다 [src:1][src:2].
- 브랜드 고유 그림자/elevation 토큰과 모션(duration/easing) 토큰이 공개돼 있지 않다 — Tailwind 기본 인프라 변수만 존재한다 [src:2].
- Typography frontmatter의 `fontWeight` 값은 사이즈·굵기·자간 세 스케일이 각 스타일명에 정확히 어떻게 짝지어지는지가 개별 문서화돼 있지 않아 고른 예시 조합이다 [src:4] — 실제 값은 스타일별로 다를 수 있다. `lineHeight`는 코퍼스에 스케일 자체가 공개돼 있지 않아 관례적 비율을 적용한 추정값이며, 각 head row의 `# 미확인` 주석으로 표시해 뒀다.
- 18개 컴포넌트의 사이즈/색상 변형, 호버·비활성 등 상태별 세부값이 이름 목록 외에는 개별 확인되지 않았다 [src:3].
- Spacing 14개 중 9개, Radius 11개 중 8개만 코퍼스에서 개별 재확인됐다 — 나머지 스텝 값은 미확인이다 [src:2][src:4].
- 상류의 시맨틱 역할 가운데 22개는 이 항목에 실리지 않은 팔레트를 가리켜 역할 표와 참조 행에서 빠져 있다 — 색상 계열 역할 14개(`bg-blue` · `fg-red` 등, blue · green · light-green · pink · purple · red · yellow 의 50 / 500 단계), `basic-black` 을 가리키는 `bg-black` · `fg-black` · `border-black` · `info-black` 4개, `info-negative`(red-600) · `info-positive`(light-green-500) 2개, 검정 불투명도 램프를 거치는 `bg-weak-neutral-dark` · `bg-weak-neutral-dark-hovered` 2개다 [src:15]. 상류에는 이 팔레트들이 있으니 [src:4], 싣는 일은 팔레트를 함께 재감사할 몫이다. 팔레트 단계가 아니라 그라데이션·딤 값을 갖는 `--color-semantic-style-*` 5개도 싣지 않았다 [src:15].
- `@likelion-design/ui`·`@likelion-design/docs-mcp`의 라이선스 상태가 모호하다 — `license` 필드 null, 별도 LICENSE 파일 미게시, 명시적 금지 문구도 미발견으로, 명시적 허용도 명시적 금지도 없는 상태다 [src:6][src:7][src:2].

## References

1. https://likelion.net/ — SPA 셸. fetch로는 페이지 타이틀("홈 : 멋쟁이사자처럼")만 노출, 본문 콘텐츠는 자동 추출되지 않는다.
2. https://designsystem.likelion.net — Storybook 문서 사이트 루트. ~100개 이상 JS/CSS 청크·index.html grep의 대상.
3. https://designsystem.likelion.net/index.json — Storybook 매니페스트(135 엔트리). 컴포넌트 18개·Foundation 7개 그룹 목록의 1차 근거.
4. https://designsystem.likelion.net/assets/iframe-CXUH1Zgo.css — 컴파일된 토큰 CSS 번들(39,477 bytes). 색상·타이포·spacing·radius·breakpoint 값의 1차 근거.
5. https://designsystem.likelion.net/assets/Logo-dx0Jf8eZ.js — Brand Logo 사용 규정이 담긴 컴파일된 `Logo.mdx` 청크.
6. https://designsystem.likelion.net/LICENSE — 403 응답. 문서 사이트에 별도 LICENSE 파일이 게시돼 있지 않음을 확인하는 근거.
7. https://registry.npmjs.org/@likelion-design/ui — npm 레지스트리. 컴포넌트 패키지의 `license` 필드가 비어 있음(null)을 확인.
8. https://registry.npmjs.org/@likelion-design/docs-mcp — npm 레지스트리. MIT 라이선스의 MCP 서버 패키지, 5개 tool 노출.
9. https://designsystem.likelion.net/robots.txt — 크롤 접근 정책 확인용.
10. https://designsystem.likelion.net/sitemap.xml — 문서 사이트 구조 확인용.
11. https://brunch.co.kr/@likelion/59 — 공식 Brunch 채널 게시물. 톤앤보이스 샘플의 근거.
12. https://ko.wikipedia.org/wiki/멋쟁이사자처럼 — 브랜드 연혁·트랙 구성·슬로건 개요.
13. https://designsystem.likelion.net/img/BrandLogo/03_Clearspace.png — Brand Logo 문서의 Clear space 다이어그램 이미지. 여백 사방을 "0.2X"로 표기해, 같은 문서 본문 텍스트의 "8.2배" 서술과 어긋남을 확인하는 근거.
14. https://unpkg.com/@likelion-design/ui@1.0.32/tailwind.theme.css — npm 패키지의 Tailwind v4 테마 파일. 시맨틱 역할을 `--color-semantic-` 를 뗀 이름의 테마 변수(`--color-fg-primary`)와 유틸리티(`@utility bg-normal`, `@utility border-primary`)로 발행한다.
15. https://unpkg.com/@likelion-design/ui@1.0.32/dist/colors.css.css — npm 패키지의 색 토큰 CSS. `--color-semantic-*` 역할이 어느 팔레트 변수를 가리키는지의 1차 근거이고, 시맨틱 정의는 [src:4] 와 같다.
