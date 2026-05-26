---
name: 삼성 One UI
design_system_name: Samsung One UI
slug: samsung-one-ui
category: etc
last_updated: "2026-05-26"
sources:
  - https://github.com/SamsungInternet/OneUI-Web
  - https://design.samsung.com/kr/contents/one-ui/
  - https://news.samsung.com/global/samsungs-one-ui-8-5-official-rollout-starts-may-6
  - https://design.samsung.com/global/contents/one-ui-7/
  - https://developer.samsung.com/one-ui/motion/basic.html
  - https://developer.samsung.com/one-ui/motion/intro.html
  - https://www.androidpolice.com/sneak-peak-samsung-new-one-ui-7-icons/
  - https://www.sammobile.com/opinion/one-ui-cannot-look-amazing-in-material-you-shackles/
  - https://developer.samsung.com/one-ui/color/system.html
  - https://www.samsung.com/sec/apps/one-ui/
  - https://9to5google.com/2026/05/06/samsung-galaxy-one-ui-8-5-stable-update-list/
related_services: []
lang: ko
logo: https://getdesign.kr/logos/samsung-one-ui.svg
---

# 삼성 One UI (Samsung One UI) — design.md

> Samsung이 Galaxy 디바이스(스마트폰·태블릿·워치·자동차·TV)에 적용하는 자체 디자인 시스템이자 OS UI 레이어. 2018년 SDC에서 Samsung Experience의 후속으로 발표되었으며, "보는 영역(Viewing Area)과 닿는 영역(Interaction Area)의 분리"를 통해 한 손 사용성을 시각·인터랙션 모든 층에서 일관되게 다룬다 [src:1][src:2]. 본 문서는 (a) SamsungInternet 팀이 공개한 OneUI-Web GitHub 미러(themes·utils·components·icons 22+ CSS, 2,840줄 코퍼스), (b) Samsung 공식 design.samsung.com / developer.samsung.com 자료(2026년 5월 환경에서 outbound 차단), (c) 5장의 Android One UI 캡처 + 5장의 OneUI-Web 캡처를 1차 출처로 합성한 결과다.

## Brand & Style

Samsung One UI는 Galaxy 디바이스 전반에 적용되는 자체 디자인 시스템이자 OS UI 레이어다. 2018년 SDC에서 Samsung Experience의 후속으로 공개되었으며, "한 손으로 거의 모든 조작이 가능하게" 한다는 명제를 시각·인터랙션의 모든 층에 일관되게 적용한다 [src:2][src:10].

가장 본질적인 발명은 **Viewing Area / Interaction Area** 이분법이다. 화면을 상하로 분할해 상단(보는 영역)은 페이지 제목과 의도적 여백만 두고, 하단(닿는 영역)에 검색·탭·시트·플로팅 액션 등 모든 터치 컨트롤을 모은다. OneUI-Web의 HTML 템플릿이 `class="oui-viewing"` / `class="oui-interaction"` 두 영역을 그대로 노출하는 것도 이 철학의 직접 표현이다 [src:1][src:2].

타깃은 Galaxy 사용자 전반이지만, 정보 위계와 여백 처리는 명백히 **모바일 한 손 사용**에 최적화돼 있다. 큰 폼팩터로 갈수록 동일한 Viewing/Interaction 패턴이 컨테이너 단위로 반복된다. 정서적 톤은 Material Design의 기능적·체계적 어휘와 의도적으로 거리를 둔다. One UI 7 공식 진술은 "rich emotion and visual pleasure", "heightened aesthetics and sensibilities"처럼 **감성·풍부함**의 어휘를 명시적으로 사용한다 [src:4]. 한국어 설계 카피는 "보는 영역과 닿는 영역", "한 손" 같은 **신체적·공간적 은유**를 택한다 [src:2].

2025년 One UI 7 ("A New Look, Evolved from Essence")부터 Now Bar / Now Brief, squircle 아이콘 통일, faint translucency가 도입됐고, 2026년 5월 6일 One UI 8.5가 한국에 우선 출시되며 네비게이션 바 재설계와 status/nav bar 자동 숨김, 하단 검색바 강화가 이어졌다 [src:3][src:11].

## Colors

One UI는 라이트/다크를 **단순 반전이 아닌 별도 토큰 세트**로 운영한다. 라이트는 회색 베이스(`oklch(0.96 0 0)`)에 진한 Galaxy Blue(`oklch(0.54 0.16 250)`) 프라이머리를 쓰고, 다크는 OLED 친화 true-black(`oklch(0.12 0 0)`)에 밝은 청(`oklch(0.66 0.20 252)`)을 쓴다 [src:1][src:9].

원자 팔레트(OneUI-Web `themes/`):

```yaml
# Light theme atomic palette
p-white:  oklch(1.00 0 0)        # FFFFFF
white:    oklch(0.99 0 0)        # FCFCFC
black:    oklch(0.31 0 0)        # 252525 — true black이 아닌 짙은 회색
d-grey:   oklch(0.53 0 0)        # 737373
m-grey:   oklch(0.80 0 0)        # C4C4C4
l-grey:   oklch(0.91 0 0)        # E6E6E6
xl-grey:  oklch(0.96 0 0)        # F2F2F2
blue:     oklch(0.54 0.16 250)   # 0865C3 — One UI Light Primary
l-blue:   oklch(0.69 0.18 252)   # 4297FF — active
xl-blue:  oklch(0.84 0.08 245)   # AAD0F5 — inactive
orange:   oklch(0.58 0.16 45)    # C65306
red:      oklch(0.61 0.25 12)    # F01346
green:    oklch(0.71 0.18 155)   # 15B76C
purple:   oklch(0.51 0.24 285)   # 6446E6
yellow:   oklch(0.80 0.17 75)    # FF9E01
```

```yaml
# Dark theme atomic palette
p-white:  oklch(1.00 0 0)        # FFFFFF
white:    oklch(0.98 0 0)        # FAFAFA
black:    oklch(0.12 0 0)        # 080808 — OLED true black
d-grey:   oklch(0.31 0 0)        # 252525
m-grey:   oklch(0.66 0 0)        # 979797
l-grey:   oklch(0.83 0 0)        # CCCCCC
xl-grey:  oklch(0.96 0 0)        # F2F2F2
blue:     oklch(0.66 0.20 252)   # 2692FF — One UI Dark Primary
d-blue:   oklch(0.24 0.10 252)   # 062E52
m-blue:   oklch(0.52 0.18 250)   # 0074D4 — active
```

시맨틱 매핑(구조는 라이트/다크 공통, 값만 테마별로 교체) [src:1]:

| 시맨틱 토큰 | 라이트 | 다크 |
|---|---|---|
| `text` | `oklch(0.31 0 0)` | `oklch(1.00 0 0)` |
| `text-secondary` | `oklch(0.53 0 0)` | `oklch(0.66 0 0)` |
| `primary` | `oklch(0.54 0.16 250)` | `oklch(0.66 0.20 252)` |
| `background` | `oklch(0.96 0 0)` | `oklch(0.12 0 0)` |
| `surface-background` | `oklch(0.99 0 0)` | `oklch(0.31 0 0)` |
| `control-background` | `oklch(0.91 0 0)` | `oklch(0.31 0 0)` |
| `on-primary` | `oklch(1.00 0 0)` | `oklch(1.00 0 0)` |
| `error` | `oklch(0.61 0.25 12)` | `oklch(0.61 0.25 12)` |
| `confirmation` | `oklch(0.71 0.18 155)` | `oklch(0.71 0.18 155)` |
| `accent-badge` | `oklch(0.58 0.16 45)` | `oklch(0.58 0.16 45)` |

**Frosted/translucency**: 라이트는 `--frosted-opacity: 0.8`, `--frosted-blur-size: 8px`로 정의되어 앱바·시트의 흐림 유리 효과를 만든다. 다크도 동일 값을 상속받는다 [src:1].

**Material You와의 관계**: One UI 4(2021) 이후 사용자 월페이퍼에서 추출한 다이내믹 컬러를 시스템에 자동 적용하지만, 컬러 추출만 흡수했을 뿐 컴포넌트 셰이프·여백·타이포·모션은 모두 Samsung 고유로 유지된다 [src:8].

## Typography

OneUI-Web `utils/_font.css`는 Samsung 자체 폰트 두 패밀리를 정의한다 [src:1].

- **SamsungSharpSans** — Regular / Bold. 디스플레이·헤드라인 전용. 큰 사이즈에서도 또렷한 형태를 유지한다.
- **SamsungOne** — Weight 300 / 600 / 700 / 800. 본문·UI 텍스트 전용.

기본 본문은 **13px / weight 300**(모바일), 태블릿 이상에서 **15px**로 확대된다. 매우 가벼운 본문 weight와 헤드라인 SharpSans의 굵은 형태가 시각 리듬을 만든다.

```yaml
# Font family
display-family: "SamsungSharpSans, system-ui, sans-serif"
body-family:    "SamsungOne, Pretendard Variable, system-ui, sans-serif"

# Scale (모바일 기준; 태블릿에서 본문 13→15px)
display-l:   { size: 32px, weight: 700, family: display-family, line-height: 1.2 }
display-m:   { size: 24px, weight: 700, family: display-family, line-height: 1.25 }
heading:     { size: 18px, weight: 700, family: body-family,    line-height: 1.35 }
body-m:      { size: 13px, weight: 300, family: body-family,    line-height: 1.5 }
body-tablet: { size: 15px, weight: 300, family: body-family,    line-height: 1.5 }
label:       { size: 12px, weight: 600, family: body-family,    line-height: 1.3 }
caption:     { size: 11px, weight: 300, family: body-family,    line-height: 1.3 }
```

**한국어 처리**: 모바일 One UI는 **SamsungOne KR**을 자모 가독성과 고밀도 정보 표시에 맞춰 보강해 탑재한다 [src:1]. 웹 카탈로그·캡처용 fallback으로는 **Pretendard Variable**을 권장한다. SamsungOne의 한국어 metric에 가장 가까운 오픈 폰트이기 때문이다.

## Spacing

OneUI-Web `utils/_spacing.css`는 **단 3토큰** 시스템이다 [src:1].

```yaml
margin-s: 16px
margin-m: 24px
margin-l: 32px
```

Material/iOS의 4·8·12·16·… 8pt 그리드 대비 의도적으로 단순하다. One UI는 "여백을 통해 정보 위계를 표현"하는 철학을 따르며, 컨테이너 단위 여백을 크게 가져간다 [src:2]. 같은 화면 안에서도 Viewing 영역의 상단 패딩은 본문 카드 간 간격보다 크게 잡혀, 자연스럽게 thumb-zone으로 시선이 내려오게 만든다 [src:1].

본문 카드 내부 패딩은 `{spacing.margin-s}` 16px, 섹션 간 간격은 `{spacing.margin-m}` 24px, 페이지 상하 외곽 여백은 `{spacing.margin-l}` 32px 수준이 표준 사용이다.

## Rounded

OneUI-Web에는 단일 radius 토큰 파일이 없고, 컴포넌트 CSS별로 라운드가 정의된다 [src:1]. 캡처와 컴포넌트 CSS를 종합한 추정 스케일은 다음과 같다 (≈는 공개된 토큰이 없어 추정).

```yaml
small:    8px    # input, checkbox 등 폼 요소 ≈
medium:   12px   # button, tab item ≈
large:    20px   # dialog, sheet, bubble ≈
xlarge:   24px   # search bar, card ≈
pill:     999px  # Now Bar, badge, action chip
squircle: 28%    # 아이콘 컨테이너 (퍼센트 기반, One UI 7+)
```

아이콘 컨테이너는 단순한 둥근 사각형이 아닌 **squircle**이며, 모서리 반경은 약 22~28% 사이로 iOS squircle보다 약간 더 사각에 가깝다 [src:7].

## Elevation & Depth

One UI의 depth language는 **그림자보다 translucency·blur**에 더 크게 의존한다. 상단 앱바와 하단 시트는 배경 위에 frosted-blur를 깔아 깊이감을 만들고, 그림자는 부속적으로만 쓴다 [src:1][src:3].

One UI 8/8.5부터는 **drop shadow + translucency**가 동시에 심화돼, 떠 있는 요소(다이얼로그, Now Bar, 토스트)는 명확한 그림자를, 시스템 바와 같이 배경에 붙어 있는 요소는 흐림 유리만 사용하는 식으로 역할이 분리됐다 [src:3].

```yaml
# 추정 elevation 스케일 (공개된 토큰 없음, 캡처 기반 ≈)
elev-0: none
elev-1: 0 1px 2px oklch(0 0 0 / 0.06)     # 인풋, 토글 thumb
elev-2: 0 4px 12px oklch(0 0 0 / 0.10)    # toast, menu
elev-3: 0 12px 32px oklch(0 0 0 / 0.16)   # dialog, sheet
frosted: backdrop-filter blur(8px) opacity(0.8)   # 시스템 바
```

다크 테마에서는 그림자 alpha를 강화하고(0.16→0.32 수준), 배경 자체가 OLED black이므로 frosted blur의 효과가 라이트보다 약하게 느껴진다.

## Shapes

One UI의 시각 언어는 **부드러운 직사각 + squircle**의 조합이다.

- **컨테이너**(카드·시트·다이얼로그)는 양쪽 모서리가 같은 큰 라운드를 갖는 둥근 사각형이다. 라운드 값은 컴포넌트가 차지하는 시야 비중이 클수록 커진다(input < button < dialog < sheet).
- **아이콘 컨테이너**는 squircle을 강제한다. One UI 7부터 메시지·설정 등 시스템 앱이 squircle로 통일됐고, 사용자 월페이퍼에서 추출한 다이내믹 톤으로 자동 재색칠된다 [src:7].
- **상태 표시**(Now Bar, badge, action chip)는 **pill** 형태를 쓴다. thumb-range에 들어가는 알약 모양 컨테이너가 One UI 7+ 시그니처다 [src:4].
- **일러스트레이션**과 큰 헤더 그래픽은 기하학적이지만 모서리는 항상 부드럽다. 날카로운 1px 라인은 구분선과 단색 아이콘 stroke(~2px)에만 한정된다 [src:1].

## Components

OneUI-Web에 22개 컴포넌트 CSS가 포함되어 있다. 카테고리별로는 Bars(`appbar`/`tab`/`header`/`search`), Surface(`dialog`/`bubble`/`toast`/`menu`), Form(`button`/`input`/`checkbox`/`radio`/`select`/`slider`/`toggle`), Display(`badge`/`icon`/`image`/`imgarticle`/`textual`/`grid`/`layout`)로 분류된다 [src:1].

### app-bar

상단 고정 바. Viewing 영역의 끝에 위치하며, 페이지 제목을 큰 사이즈로 노출한다. 배경에는 `frosted`(`backdrop-filter: blur(8px)`)를 적용해 스크롤 시 본문이 비쳐 보인다 [src:1].

```tsx
<AppBar
  title="설정"
  background="{colors.surface-background}"
  blur="{elev.frosted}"
  textStyle="{typography.display-m}"
/>
```

### tab

상단 또는 하단 고정 탭. 아이콘+라벨 조합이 기본. inactive는 `{colors.text-secondary}`, active는 `{colors.primary}`로 강조. 색 대비가 큰 편이라 active 상태가 즉시 인식된다 [src:1].

### tab-active

active 탭은 라벨 color를 `{colors.primary}`(라이트 `oklch(0.54 0.16 250)` / 다크 `oklch(0.66 0.20 252)`)로 전환하고, 아이콘도 동일 색으로 채운다. 하단 indicator bar는 두께 ~3px, color `{colors.primary}`, `{rounded.pill}` [src:1].

### search-bar

Interaction area의 핵심 컴포넌트. One UI 8/8.5부터 **하단 배치가 강화**되어 thumb-reach에 들어온다 [src:3]. 라운드는 `{rounded.xlarge}` 24px 수준, 배경은 `{colors.control-background}`, 좌측 magnifier 아이콘은 `{colors.text-secondary}`.

```tsx
<SearchBar
  placeholder="검색"
  position="bottom"
  background="{colors.control-background}"
  radius="{rounded.xlarge}"
/>
```

### button-primary

기본 솔리드 버튼. fill `{colors.primary}`, text `{colors.on-primary}`, `{rounded.medium}` 12px 라운드, padding `{spacing.margin-s}` 16px 좌우. 본문 weight가 가벼운 시스템에서 버튼만 두꺼운 색면을 차지하므로 CTA 강도가 충분하다 [src:1].

```tsx
<Button kind="primary">계속</Button>
```

### button-primary-active

press 상태에서 fill을 `--l-blue`(`oklch(0.69 0.18 252)`)로 한 단계 밝게 이동시킨다. 라이트 테마 기준. transition은 `{motion.easeOutCubic}` 200ms 수준이 표준 [src:1].

### button-secondary

테두리만 있는 outlined 변형. border `{colors.primary}` 1px, text `{colors.primary}`, 배경 transparent. 같은 라운드/패딩을 공유한다.

### dialog

화면 중앙에 뜨는 modal. `{rounded.large}` 20px 컨테이너, `{elev-3}` 그림자, frosted backdrop. 본문 카드 영역 내부에 제목·본문·액션이 세로 정렬되고, 액션 버튼은 두 개일 때 가로, 셋 이상이면 세로로 배치되는 게 일반적이다 [src:1].

### bottom-sheet

화면 하단에서 슬라이드 인하는 시트. 상단 모서리에만 `{rounded.large}` 20px 라운드를 주고, 하단은 화면 끝에 붙는다. drag handle(작은 회색 알약)이 상단 중앙에 위치한다 [src:1].

### bubble

One UI 메신저 스타일 말풍선. 한국어 채팅 UI 영향이 강하다. 라운드는 `{rounded.large}` 수준이며 발신/수신 측에서 한쪽 모서리만 작은 라운드로 처리하는 비대칭 형태가 일반적이다 [src:1].

### toggle

Material 스타일과 유사하나 thumb shadow가 두드러진다. active state에서 track이 `{colors.primary}`로 채워지고, thumb는 `{colors.p-white}` 유지. inactive는 track `{colors.m-grey}` [src:1].

### slider

두꺼운 thumb, 진한 active track. 컬러 피커·볼륨 등에서 사용된다. active track color는 `{colors.primary}`, inactive는 `{colors.l-grey}` (라이트) / `{colors.d-grey}` (다크) [src:1].

### now-bar

One UI 7+ 잠금화면 하단의 pill-shaped 컨테이너. 음악·타이머·스포츠 스코어 같은 라이브 컨텐츠가 stacked되어 swipe로 전환된다. thumb-range에 들어오는 위치가 특징이다 — Apple Dynamic Island와 컨셉은 유사하나 잠금화면 하단이라는 위치가 차별점이다 [src:4].

```tsx
<NowBar
  shape="{rounded.pill}"
  background="{colors.surface-background}"
  blur="{elev.frosted}"
  position="lock-screen-bottom"
/>
```

### now-brief

Galaxy AI 기반 morning summary 카드. 날씨·일정·헬스 지표가 하나의 카드에 stacked. `{rounded.xlarge}` 24px 컨테이너, 본문 typography는 `{typography.body-m}`, 강조 수치는 `{typography.display-m}` [src:4].

### icon

24×24 viewBox, ~2px stroke 균일. inactive `{colors.text-secondary}`, active `{colors.primary}`. OneUI-Web 라이브러리에는 check, search, bluetooth, phone, palette, smarthome, settings 등 18개 SVG가 포함되어 있다 [src:1].

### app-icon-squircle

홈/앱 서랍의 앱 아이콘 컨테이너. squircle 셰이프(`{rounded.squircle}`), 다이내믹 테마 모드에서는 월페이퍼 추출 톤으로 자동 재색칠되며, 단색 모드에서는 동일 채도/배경으로 강제된다 [src:7].

## Do's and Don'ts

**Do**
- Viewing(상단)과 Interaction(하단)을 시각·터치 두 측면에서 분리한다. 페이지 제목은 위, 검색·탭·CTA는 thumb-range로 모은다 [src:2].
- 라이트/다크는 **별도 토큰 세트**로 정의한다. 라이트의 `{colors.background}`는 회색(`oklch(0.96 0 0)`), 다크는 OLED true-black(`oklch(0.12 0 0)`) — 단순 반전하지 않는다 [src:9].
- 시스템 바·시트는 `frosted`(`blur(8px)`, `opacity 0.8`)로 깊이감을 만든다. 그림자는 떠 있는 요소(다이얼로그·토스트·Now Bar)에만 쓴다 [src:1].
- 본문은 `{typography.body-m}` 13px / weight 300으로 가볍게, 헤드라인은 `{typography.display-l}` SharpSans bold로 대비한다.
- 모션은 "accelerate quickly then slow down gradually" — `{motion.easeOutCubic}`, `{motion.easeOutQuint}` 같은 ease-out 곡선이 시그니처다 [src:5][src:6].
- 한국어 본문은 해요체 안내형을 쓴다("탭하면 ~를 볼 수 있어요"). Galaxy AI · Now Bar · Now Brief 같은 제품명은 영어 원어를 유지한다 [src:2].

**Don't**
- Material You의 컴포넌트 셰이프·여백·타이포·모션을 그대로 가져오지 않는다. One UI는 컬러 추출만 흡수했고 그 외 토큰은 Samsung 고유다 [src:8].
- 4·8·12·16의 8pt 그리드를 강제 적용하지 않는다. One UI spacing은 `{spacing.margin-s}` 16 / `{spacing.margin-m}` 24 / `{spacing.margin-l}` 32의 단 3토큰이며, 그 안에서 여백 위계를 표현한다 [src:1].
- 아이콘 컨테이너를 단순 둥근 사각형으로 그리지 않는다. One UI 7+ 시스템 아이콘은 squircle이 표준이다 [src:7].
- 한 단계 그림자에 의존해 모든 깊이감을 표현하지 않는다. translucency + blur가 1차 도구, 그림자는 보조다.
- 본문 weight를 무겁게(500↑) 쓰지 않는다. SamsungOne 300의 가벼운 본문이 시스템의 시각 톤을 결정한다.
- 명령형 단문("탭하세요!", "지금 시작!")은 피한다. 안내형·신체적 은유("보다·닿다·한 손")가 One UI의 한국어 voice다 [src:2].

## Responsive Behavior

OneUI-Web `utils/_media.css`에 정의된 모바일/태블릿 분기를 기준으로, Galaxy 디바이스 폼팩터 전반의 행동은 다음과 같다 [src:1].

| 브레이크포인트 | 폭 | Key Changes |
|---|---|---|
| mobile | ≤ 768px | 본문 `{typography.body-m}` 13px / weight 300. 컨테이너는 풀폭. 검색바는 하단 고정(One UI 8/8.5+). |
| tablet | 769px ~ | 본문 15px로 확대. Viewing/Interaction 분할이 컨테이너 단위로 반복돼 멀티컬럼이 등장. |
| foldable inner | ~ | tablet 분기를 따르되 좌우 패널을 Viewing/Interaction으로 매핑 (관찰 기반, 명세 비공개). |

**터치 타겟**: 최소 48×48 dp(Galaxy 표준, Android Material 기준 동일). 하단 검색바·Now Bar는 thumb-range(화면 하단 ~30%)에 의도적으로 배치한다 [src:3].

**컴포넌트 collapse 전략**:
- `{component.app-bar}` 제목은 모바일에서 한 줄 유지, 길어지면 `…` 말줄임. 태블릿에서는 두 줄까지 허용.
- `{component.tab}`은 아이콘+라벨이 기본이나 폭이 좁아지면 아이콘만 유지(라벨 hidden).
- `{component.dialog}`는 모바일에서 화면 폭의 ~88%를 차지, 태블릿 이상에서는 max-width 480px 수준으로 제한.
- `{component.bottom-sheet}`는 폼팩터와 무관하게 하단에서 슬라이드 인.

**이미지/aspect-ratio**: Viewing 영역의 헤더 일러스트는 16:9를 기본으로, 폼팩터가 커지면 폭만 늘리고 비율은 유지한다 (no published 명세; 캡처 기반 ≈).

**시스템 바**: One UI 8.5부터 스크롤 시 status bar / nav bar가 자동 숨김 처리된다. 본문이 최대한 큰 영역을 차지하도록 의도된 변경이다 [src:3].

## Known Gaps

- 공개된 elevation/shadow 토큰 세트가 없어 `## Elevation & Depth`의 alpha 값과 blur 반경은 캡처 기반 추정이다. 공식 그림자 토큰이 발견되면 우선 적용해야 한다.
- 라디우스도 컴포넌트 CSS별로 흩어져 있어 `## Rounded`의 8/12/20/24px 분류는 OneUI-Web 컴포넌트 관측 기반 추정이며, 모바일 네이티브 One UI의 정확한 값과는 차이가 있을 수 있다 [src:1].
- 한국어 폰트 SamsungOne KR은 모바일 One UI에만 탑재되고 웹 카탈로그에서는 사용할 수 없다. 본 문서는 Pretendard Variable fallback을 권장한다 [src:1].
- Material You 다이내믹 컬러 추출 알고리즘의 구체적 파라미터(채도 클램프 범위, 명도 매핑)는 비공개이며, 본 문서는 "추출만 흡수" 수준에서 기술한다 [src:8].
- One UI 8.5의 네비게이션 바 재설계와 frosted 강화에 대한 정량 토큰(blur 반경, opacity 값)이 공식 문서로 아직 공개되지 않았다. 본 문서의 값은 One UI 7 기준 [src:3].
- form 검증 상태(error/success input 등)에 대한 명시적 토큰 매핑이 OneUI-Web에 없다. `{colors.error}` / `{colors.confirmation}`을 사용하는 정도까지만 확정 가능하다.

## References

1. https://github.com/SamsungInternet/OneUI-Web — OneUI-Web 코퍼스 (README, themes, utils, components, icons)
2. https://design.samsung.com/kr/contents/one-ui/ — Samsung One UI 공식 한국어 디자인 페이지
3. https://news.samsung.com/global/samsungs-one-ui-8-5-official-rollout-starts-may-6 — One UI 8.5 한국 우선 출시
4. https://design.samsung.com/global/contents/one-ui-7/ — One UI 7 "Evolved from Essence"
5. https://developer.samsung.com/one-ui/motion/basic.html — Samsung 공식 모션 기초
6. https://developer.samsung.com/one-ui/motion/intro.html — Samsung 공식 모션 4원칙
7. https://www.androidpolice.com/sneak-peak-samsung-new-one-ui-7-icons/ — One UI 7 squircle 아이콘
8. https://www.sammobile.com/opinion/one-ui-cannot-look-amazing-in-material-you-shackles/ — One UI ↔ Material You 관계
9. https://developer.samsung.com/one-ui/color/system.html — 컬러 시스템 / 다크 모드 별도 토큰
10. https://www.samsung.com/sec/apps/one-ui/ — Samsung One UI 공식 앱 페이지
11. https://9to5google.com/2026/05/06/samsung-galaxy-one-ui-8-5-stable-update-list/ — Galaxy One UI 8.5 stable update list
