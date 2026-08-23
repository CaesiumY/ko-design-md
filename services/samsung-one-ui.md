---
name: 삼성 One UI
design_system_name: One UI
slug: samsung-one-ui
category: developer
last_updated: "2026-08-23"
created_at: "2026-08-13"
sources:
  - https://developer.samsung.com/one-ui/index.html
  - https://design.samsung.com/global/contents/one-ui/
  - https://developer.samsung.com/one-ui/layout/basic.html
  - https://developer.samsung.com/one-ui/layout/grid.html
  - https://developer.samsung.com/one-ui/structure/basic.html
  - https://developer.samsung.com/one-ui/structure/visual-depth.html
  - https://developer.samsung.com/one-ui/color/system.html
  - https://developer.samsung.com/one-ui/color/theme.html
  - https://design.samsung.com/global/contents/one-ui/download/oneui_design_guide_eng.pdf
  - https://design.samsung.com/global/contents/samsungone/
  - https://developer.samsung.com/one-ui/iconography/background.html
  - https://developer.samsung.com/one-ui/iconography/color.html
  - https://developer.samsung.com/one-ui/comp/app-bar.html
  - https://developer.samsung.com/one-ui/comp/bottom-bar.html
  - https://developer.samsung.com/one-ui/comp/bottom-navigation.html
  - https://developer.samsung.com/one-ui/comp/button.html
  - https://developer.samsung.com/one-ui/comp/dialog.html
  - https://developer.samsung.com/one-ui/comp/list.html
  - https://developer.samsung.com/one-ui/comp/search.html
  - https://developer.samsung.com/one-ui/comp/toast.html
  - https://developer.samsung.com/one-ui/motion/intro.html
  - https://developer.samsung.com/one-ui/motion/basic.html
  - https://developer.samsung.com/one-ui/sound-and-haptic/sound.html
  - https://developer.samsung.com/one-ui/sound-and-haptic/haptic.html
  - https://developer.samsung.com/one-ui/writing/focused-and-purposeful.html
  - https://developer.samsung.com/one-ui/writing/simple-and-human.html
  - https://developer.samsung.com/one-ui/writing/empowering.html
  - https://developer.samsung.com/one-ui/accessibility/intro.html
  - https://developer.samsung.com/one-ui/accessibility/color-contrast.html
  - https://developer.samsung.com/one-ui/accessibility/layout-and-typo.html
  - https://developer.samsung.com/one-ui/accessibility/interaction-and-control.html
  - https://developer.samsung.com/one-ui/accessibility/focus-order.html
  - https://developer.samsung.com/one-ui/accessibility/content.html
  - https://developer.samsung.com/one-ui/largescreen-and-foldable/intro.html
  - https://developer.samsung.com/one-ui/largescreen-and-foldable/large_screen_layout.html
  - https://developer.samsung.com/one-ui/largescreen-and-foldable/designing_for_foldable.html
  - https://developer.samsung.com/galaxy-z/multi-window.html
  - https://design.samsung.com/global/contents/one-ui-7/index.html
lang: ko
colors:
  primary: oklch(0.617 0.208 255.8)   # #0381fe · Light/Dark 동일 · 무버전 발행 페이지, 2019 가이드라인과 일치
  primary-dark: oklch(0.561 0.186 255.2)   # #0072de · Light 테마 값 · 무버전 발행 페이지, 2019 가이드라인과 일치
  primary-dark-on-dark: oklch(0.661 0.182 256.7)   # #3e91ff · Dark 테마의 Primary dark 값 · 무버전 페이지, 2019 가이드라인과 일치
  color-control-activated: oklch(0.661 0.182 256.7)   # #3e91ff · 양 테마 동일, 선택 컨트롤 활성 · 무버전 페이지, 2019 가이드라인과 일치
  white: oklch(0.985 0 0)   # #fafafa · 양 테마 동일 · One UI 2(2019) 발행값
  black: oklch(0 0 0)   # #000000 · Light 테마의 Black · One UI 2(2019) 발행값
  black-dark: oklch(0.134 0 0)   # #080808 · Dark 테마 배경(순흑이 아닌 근흑) · One UI 2(2019) 발행값
spacing:
  margin-side-min: 24px   # 공식 표기 24dp — 웹 1dp≈1px 매핑은 카탈로그 해석 · 좌우 최소 마진
rounded:
  radius-thumbnail-l: 26px   # 공식 표기 26dp · 큰 포커스 블록/썸네일 · One UI 2(2019)
  radius-thumbnail-m: 20px   # 공식 표기 20dp · 중간 썸네일 · One UI 2(2019)
  radius-thumbnail-s: 12px   # 공식 표기 12dp · 작은 썸네일 · One UI 2(2019)
  radius-button: 18px   # 공식 표기 18dp · 버튼 mask/background drawable 스펙
fonts:
  font-sans: Roboto, "Pretendard Variable", Pretendard, system-ui, sans-serif
font-sans-src: https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap
---

# 삼성 One UI — design.md

> 삼성전자 갤럭시 디바이스 전반(폰·태블릿·폴더블·워치·PC)에 적용되는 OS 디자인 언어 One UI를 공개된 공식 삼성 자료만으로 정리한 카탈로그 항목이다 [src:1]. **본 문서는 삼성의 공식 산출물이 아니며**, 삼성이 공개한 원칙·수치를 다운스트림 UI 생성에 쓸 수 있는 형태로 재구성한 비공식 요약이다. One UI는 열린 토큰 패키지를 발행하지 않으므로, 이 문서는 **버전 무관한 원칙(evergreen)** 을 기본값으로 삼고 **세대 종속 수치는 출처 세대를 명시해 격리한다** — 수치 토큰 대부분은 2019년 공개 One UI Design Guidelines(One UI 2 세대) 기준이다 [src:9].

## Brand & Style

One UI의 목표는 폰·태블릿·워치·이어버드·PC 어느 디바이스에서나 "즐겁고 편안한(joyful and comfortable)" 경험을 만드는 것이다 [src:1]. 삼성 디자인 포털은 같은 지향을 "여러 디바이스를 연결해 심리스한 경험을 제공하고, 단순함으로 누구나 쉽게 쓰게 한다"로 표현한다 [src:2]. 즉 One UI는 단일 앱의 브랜드 언어가 아니라 **디바이스 간 일관성을 강제하는 OS 수준의 디자인 언어**다.

공식 원칙 문구는 채널마다 다르게 발행되어 있다. developer 포털은 **Focus on the task at hand · Interact naturally · Be visibly comfortable · Make things responsive** 네 가지를 [src:1], 디자인 포털은 **One Makes It Natural · One Is Clean and Easy · One Keeps Consistency · One Attracts All Senses** 네 가지를 명시한다 [src:2]. 워치(Tizen)용 원칙 세트는 또 다르다. 단일 정본 목록은 공개되어 있지 않으므로, 이 문서는 두 세트가 **공통으로 말하는 durable한 개념**을 척추로 삼는다:

- **뷰잉/인터랙션 영역 분리** — 화면 상단은 보는 영역, 하단은 조작하는 영역으로 나눈다 [src:1]. 디자인 포털도 "보는 영역과 만지는 영역을 명확히 구분"한다고 같은 규칙을 확인한다 [src:2].
- **한손 도달성(reachability)** — 인터랙티브 요소는 큰 화면에서도 엄지가 닿는 범위에 둔다 [src:1]. 한손 조작이 명시적 목표다 [src:2].
- **본질 집중** — 단순하고 직관적인 디자인으로 콘텐츠에 집중시키고 [src:1], 불필요한 요소를 제거해 중요한 기능으로 안내하며 [src:2], 사용자 여정을 최대한 짧고 매끄럽게 만든다 [src:1].
- **반응형 적응** — 레이아웃이 어떤 디바이스·화면 크기에도 적응하되 조작 요소는 손 닿는 곳에 남는다 [src:1].
- **시각적 편안함** — 다크 모드(눈 피로·눈부심 감소), 고대비 키보드, 가변 폰트 크기를 접근성 장치로 명시한다 [src:1].

세대별 시각 언어는 위 원칙 위에서 변주된다. One UI 7(2025, Galaxy S25 세대)은 확장성 높은 **원(circle)** 을 화면 전반의 시각 모티프로 삼아 부드러운 곡선 윤곽을 만들고, 컴포넌트·콘텐츠 간 정보 위계를 명확히 하는 것을 목표로 명시했다 [src:38]. 이 원 모티프 서술은 One UI 7에 한정된 발행이며, 모든 세대에 소급되는 규칙이 아니다.

무드를 요약하면: **차분한 단색 표면 + 절제된 컬러 + 둥근 기하 + 하단 집중 인터랙션**. 화려한 장식이 아니라 "과제 수행을 방해하지 않는 것"이 스타일의 목적이다 [src:1].

## Colors

> **발행값 대조 — One UI 2 세대 2019-10 발행분(2026-08-13).** 아래 수치 토큰은 developer 포털 컬러 페이지 [src:7]와 2019년 공개 One UI Design Guidelines PDF [src:9]가 명시한 role 색이다. 두 채널의 값은 서로 일치하지만, PDF는 2019년(One UI 2 / Android 10 세대) 문서이고 developer 페이지에는 버전 표기가 없다. **One UI 7의 시스템 팔레트 수치는 공개 조사 범위에서 확인되지 않았으므로** [src:38], 이 값들은 "현행 전 세대 공통 팔레트"가 아니라 **공개 발행이 확인된 마지막 세대의 값**으로 취급한다. 전량 팔레트(그레이 램프 등)도 조사 범위에서 확인되지 않아 수록하지 않는다.

One UI는 "풍부한 단색(rich, solid colors)"에 의존하며, 중요한 정보의 식별성과 가독성을 위해 색의 명도·채도를 특정 범위 안에 묶는다 [src:7] (그 수치 범위 자체는 공개 조사 범위에서 텍스트로 확인되지 않았다 — Known Gaps 참조). 컬러는 role 단위로 정의된다 — Primary는 플로팅 액션 버튼·슬라이더·입력 필드·포커스 요소에, Primary dark는 강조 버튼 배경·앱바 텍스트·다이얼로그 버튼에, Color control activated는 체크박스·라디오·토글 같은 선택 컨트롤의 활성 상태에 쓰인다 [src:7].

`{colors.primary-dark-on-dark}`와 `{colors.color-control-activated}`가 같은 값을 공유하는 것은 전사 오류가 아니라 발행값 그대로다 [src:7] — "Primary dark"라는 하나의 role이 테마에 따라 값을 바꾸고, 그 다크 테마 값이 선택 컨트롤 활성색과 일치한다. 토큰명 `primary-dark-on-dark`와 `black-dark`는 발행 role명이 아니라 **카탈로그가 부여한 이름**이다 — 삼성은 "Primary dark"와 "Black" 각 하나의 이름 아래 테마별 값을 발행하는데, 토큰 사이드카가 1토큰 1값을 요구해 테마별로 편 것이다.

palette 운용 모델: One UI의 팔레트는 Android 테마 시스템의 카테고리화된 팔레트 위에서 동작한다 — 한 카테고리의 색 값을 바꾸면 그 카테고리에 속한 화면 요소가 일괄 갱신된다 [src:9]. **이는 삼성이 Android의 테마 메커니즘을 사용한다는 서술이지, Material Design의 시각 규칙이 One UI 규칙이라는 뜻이 아니다** — One UI는 그 메커니즘 위에서 자기 고유의 role 값과 배치 규칙을 강제한다 (Do's and Don'ts 참조).

다크 모드는 권장이 아니라 기본 제공 장치다. 다크 모드에서 배경·메뉴·UI 요소는 검정 또는 짙은 회색으로 전환되어 눈부심을 줄이고 [src:8], 출시 전 라이트·다크 두 모드 모두에서 테스트해야 한다 [src:8]. 다크 배경을 근흑 `{colors.black-dark}`로 두는 근거도 발행되어 있다 — 베젤이 검은 디바이스에서 검은 배경은 베젤과 화면의 경계를 지워 화면이 시각적으로 확장돼 보이게 한다 [src:9]. 모든 앱이 사용자가 원하는 시점(또는 예약 시각)에 다크 모드로 전환할 수 있게 하는 것이 권장된다 [src:9].

## Typography

One UI의 공개 타이포그래피 정보는 **폰트 스케일 없이** 발행되어 있다 — 공개 조사 범위의 공식 문서에서는 단계별 size/line-height 사다리가 텍스트로 확인되지 않는다 (Known Gaps 참조). 확인 가능한 사실은 다음과 같다:

- 2019년 가이드라인 기준 One UI의 **기본 시스템 폰트는 Roboto**(Android 시스템 폰트)다 [src:9]. 이후 세대의 시스템 폰트 교체 여부는 공개 문서에서 확인되지 않는다.
- **SamsungOne은 별개의 브랜드 타이페이스**다 — 26개 문자 체계, 400개 이상 언어, 25,000개 이상 글리프를 커버하는 삼성 전사 아이덴티티 폰트로 [src:10], One UI 화면의 UI 렌더링 폰트로 명시된 바 없다. 두 폰트를 혼동하지 말 것.
- 접근성 요구가 타이포그래피의 실질 규칙이다: 가변 폰트 크기 지원 [src:1], 자막·이미지 내 텍스트를 제외한 모든 텍스트는 콘텐츠·기능 손실 없이 **200%까지 확대 가능**해야 한다 [src:30].

위 스택은 카탈로그 해석이다 — 라틴은 2019년 발행 기준 Roboto를 로드하고 [src:9], 한글 글리프는 Roboto가 커버하지 않으므로 웹 환경 대체로 Pretendard를 폴백에 둔다. 한글 시스템 폰트(SamsungOneKorean 등)의 공식 웹 배포는 확인되지 않았다. weight는 Roboto 배포본의 400/500/700을 사용하되, One UI가 발행한 weight 정책은 아니다.

## Spacing

간격 체계 역시 사다리 전체가 아니라 규칙 단위로 발행되어 있다. 확인된 규칙:

- 곡면 엣지·코너와의 충돌을 피하기 위해 정보 표시와 인터랙티브 컴포넌트는 **좌우 최소 24dp 마진** 안쪽에 배치한다 [src:4]. 같은 값이 2019 가이드라인에도 명시된다 [src:9].
- 마진 영역의 오터치는 시스템이 두 존으로 차단한다 — **Reject zone**은 인터랙션 영역의 터치를, **Grip zone**은 폰을 쥘 때 발생하는 손바닥·세 손가락 터치를 무시한다 [src:4]. 존의 크기 수치는 공개 조사 범위에서 확인되지 않았다.
- 화면 상단 뷰잉 영역은 넓은 마진으로 열린 공간의 인상을 준다 [src:3] — 수치가 아니라 의도 규칙이다.
- 디바이스별 카메라 컷아웃을 피해 화면 요소를 배치한다 (90°/270° 회전 방향 각각에 대한 가이드가 존재한다) [src:4].

## Rounded

> **발행값 대조 — One UI 2 세대 2019-10 발행분(2026-08-13).** 아래 썸네일 radius는 2019 가이드라인의 Thumbnail radius 절 [src:9], 버튼 radius는 developer 포털 버튼 페이지의 drawable 스펙 [src:16]이다. One UI 7 페이지는 원 기반 곡률로의 이행을 서술할 뿐 [src:38] 수치를 싣지 않는다.

One UI의 라운드는 "일관성을 위해 표준화된 둥근 코너" [src:2]라는 원칙과, 2019년 발행 수치 두 종으로 구성된다.

썸네일 radius는 화면 그리드와 대상 크기에 따라 26/20/12dp 중에서 고른다 [src:9]. 버튼의 18dp는 규칙 산문이 아니라 공식 페이지의 구현 스펙(XML) 안에 있는 값이므로, 규칙 강도는 그만큼 낮게 취급한다 [src:16].

## Elevation & Depth

One UI의 깊이는 그림자 사다리가 아니라 **blur·dim·shadow 세 효과의 역할 분담**으로 정의된다 [src:6]:

- **Blur** — 이전 화면과의 연결을 유지하면서 현재 정보를 강조한다. 테마에 맞는 라이트/다크 딤과 결합해 쓰고, 너무 약하지도 강하지도 않게 조정한다 [src:6].
- **Dim** — 위계의 각 층을 분명히 하고 최상위 요소에 주의를 모은다. 균일하게 적용하며, 한 화면에 여러 위계 층을 동시에 노출하지 않는다 [src:6].
- **Shadow** — 부드러운 그림자는 밀접하게 관련된 정보 사이의 연결을 보여줄 때만 쓴다. **dim과 shadow를 동시에 적용하지 않는다** [src:6].

수치(블러 반경·딤 불투명도·그림자 오프셋)는 공개 조사 범위에서 확인되지 않았다 — 값을 지어내지 말고 위 역할 규칙만 이식할 것. One UI 7은 여기에 레이어드 블러와 "colored glass" 오버레이, 일부 풀스크린 앱(시계·캘린더·리마인더)의 그라디언트 배경을 추가했다 [src:38] — One UI 7 한정 서술이다.

## Shapes

One UI의 기하는 **둥근 사각형과 원**이다. 스마트 디바이스 경험을 하나로 묶기 위해 둥근 코너 같은 요소를 표준화하고 [src:2], One UI 7에서는 원을 화면 전반의 시각 모티프로 확장했다 [src:38].

아이콘 규칙은 명시적으로 발행되어 있다:

- 앱 아이콘은 **부드러운 라운드 코너와 아웃라인을 가진 정사각 배경**이다 — 둥근 사각형이 아이콘을 더 부드럽고 친근하게 만든다 [src:11]. 코너 radius 수치는 공개 조사 범위에서 확인되지 않았다.
- 배경은 **밝고 선명한 단색 + 흰 심볼**이 기본이다 — 유채색 배경과 흰 심볼의 대비가 직관적이고 뚜렷한 브랜드 아이덴티티를 만든다 [src:12].
- 그라디언트를 쓴다면 **유사색 3색 이하**로 제한한다 [src:12].
- 스트로크 아이콘은 **말단(terminal)을 둥글게**, 코너는 날카롭게 유지해 라운드 코너와의 대비를 만든다 [src:9].

(관찰) One UI 7 페이지의 아이콘 시각 자료는 원형 기반의 부드러운 곡선 형태를 보여주지만, 해당 페이지는 일부 이미지가 AI 생성 시뮬레이션임을 밝히고 있어 [src:38] 시각 관찰 이상의 규칙으로 승격하지 않는다.

## Components

아래 컴포넌트 규칙 대부분은 특정 세대 표기 없이 developer 포털에 현행 문서로 서빙된다 — 이 문서가 세대 스탬프 없이 옮긴 이유다. 각 항목의 배치는 뷰잉/인터랙션 영역 원칙 [src:3]과 같은 방향에서 읽힌다(연결은 카탈로그 해석).

### app-bar

화면 상단 뷰잉 영역의 타이틀 바. 표준(축약) 형태와 확장(extended) 형태 두 가지가 있다 [src:13]. 액션 버튼은 우측에 배치하되 **페이지당 3개 이하**를 권장하고, 더 많으면 최우측 More options로 보낸다 [src:13]. 타이틀 텍스트는 `{colors.primary-dark}` 계열의 강조를 받을 수 있다 [src:7].

### app-bar-extended

확장 앱바는 타이틀을 **확장 영역 정중앙**에 두고 [src:13], 아래로 스크롤하면 표준 높이로 축약되며 위로 스크롤하면 다시 확장된다 [src:13]. 뷰잉 영역의 넓은 마진·중앙 정렬 원칙 [src:3]이 이 컴포넌트에 응축되어 있다 — 확장 상태의 앱바가 곧 뷰잉 영역이다.

### bottom-bar

화면 하단의 액션 도구 모음. **최대 5개** 액션 버튼을 담고, **1개만 표시할 수는 없다** [src:14]. 5개를 넘으면 가장 많이 쓰는 4개를 표시하고 나머지는 최우측 More options 메뉴로 넘긴다 [src:14]. 버튼은 **아이콘과 텍스트를 함께** 포함해야 하며 [src:14], 아래로 스크롤할 때 숨을 수 있다 [src:14].

### bottom-navigation

최상위 내비게이션 탭. **4개 미만 권장, 최대 5개**이고, 탭은 **텍스트 전용**이다 [src:15]. **스와이프로 탭 간 이동은 지원하지 않는다** [src:15] — 이유는 발행되어 있지 않으므로 규칙만 이식한다: 스와이프 페이저를 붙이지 말 것. 탭이 있는 화면에서는 상단 타이틀을 생략할 수 있다 [src:15].

### button-flat

배경 없는 플랫 버튼. 툴바와 다이얼로그에서는 불필요한 레이어를 더하지 않도록 플랫 버튼을 쓴다 [src:16]. 텍스트 색은 `{colors.primary-dark}` (다크 테마에서 `{colors.primary-dark-on-dark}`) [src:7].

### button-contained

면이 있는 버튼. **회색 배경은 중간 강조, 유채색 배경은 높은 강조**를 나타낸다 [src:16]. 높은 강조 배경은 `{colors.primary}` 계열 [src:7], radius는 `{rounded.radius-button}` [src:16]. **한 화면에는 한 가지 버튼 스타일만 쓴다** [src:16] — 강조 등급은 색으로 구분하되 스타일 체계 자체를 섞지 않는다.

### dialog-choice

선택·확인 다이얼로그는 **화면 하단**에 나타난다 [src:17]. 사용자가 선택하거나, Back을 누르거나, 다이얼로그 밖을 탭하기 전까지 사라지지 않는다 [src:17]. 하단 배치는 인터랙티브 요소를 손 닿는 곳에 두는 원칙 [src:1]과 같은 방향이다(연결은 카탈로그 해석).

### dialog-info

정보 전달용 다이얼로그는 **화면 중앙**에 나타난다 [src:17]. 팝업 사용 자체는 데이터 입력·삭제 확인·개인정보 동의·중대 정보로 제한된다 [src:26].

### list-item

리스트의 메인 텍스트는 명사 또는 짧은 동사구로 쓰고 **31자 이내**로 유지해 두 줄로 넘어가지 않게 한다 [src:18]. 행에 토글이 필요하면 **행의 우측**에 배치한다 [src:18]. 리스트는 탐색이 쉽도록 우선순위 순으로 정렬한다 [src:18].

### search

모든 One UI 검색창은 **자동완성과 예측 텍스트**를 지원하고, 입력 전에 최근 검색어와 문맥별 제안을 먼저 보여준다 [src:19].

### toast

토스트는 **한 줄 안팎, 어떤 언어에서도 3줄 초과 금지**다 [src:20]. 상대적으로 가벼운 성공/실패 정보에만 쓰고, 심각한 문제는 팝업을 쓴다 [src:20]. 표시 시간 수치는 공개 조사 범위에서 확인되지 않았다.

## Motion

One UI 모션의 목적은 정서적 몰입과 인과의 이해다 — 기능과 프로세스를 이해하도록 돕고 [src:21], 터치에 즉각적이고 자연스럽게 반응하며 [src:21], 전환은 매끄럽고 끊기지 않아야 한다 [src:21].

수치 규칙은 명시 발행되어 있다 [src:22]:

- 지속시간은 **최소 100ms**(인지 가능한 최소 길이) 이상, **500ms 초과 금지**(후속 과제 방해 방지).
- 기본 이징은 **Basic Path Interpolator `[0.22, 0.25, 0.00, 1.00]`** — 빠르게 가속한 뒤 서서히 감속한다. CSS로는 `cubic-bezier(0.22, 0.25, 0, 1)`로 옮긴다 (표기 변환은 카탈로그 해석).
- 크로스페이드 규칙: **이미지**는 이전 이미지가 완전히 사라지기 전에 새 이미지가 페이드인하고, **텍스트**는 이전 텍스트가 완전히 사라진 뒤에 페이드인한다 [src:22].

## Sound & Haptics

사운드는 **필요할 때만** 쓴다 — 남용은 사용자를 자극한다 [src:23]. 일반 입력과 취소/삭제 액션에 서로 다른 소리를 제공해 행위의 방향을 귀로 구분하게 하고 [src:23], **사인파(sine waveform)** 를 사용해 부드럽고 깨끗한 감을 만든다 [src:23].

햅틱은 과자극을 피하도록 **crisp하고 절제되게** 설계한다 [src:24]. 키보드 햅틱은 Delete·Spacebar·Function 같은 특수 키에 다른 피드백을 주어 촉각만으로 키 종류를 구분하게 하고 [src:24], 진동의 타이밍과 뉘앙스는 함께 일어나는 시각적 움직임과 정확히 동기화한다 [src:24].

## Writing

- **목적 없는 텍스트는 싣지 않는다** — 모든 텍스트는 사용자가 선택하거나, 행동하거나, 상황을 이해하도록 돕는다. 셋 중 어느 것도 아니면 뺀다 [src:25]. 막다른 안내 대신 행동을 준다 [src:25].
- **팝업으로 흐름을 끊는 것은 중요한 경우로 한정한다** — 데이터 입력, 삭제 확인, 개인정보 동의, 중대 정보 [src:26].
- **포용적 언어** — 성 중립 표현을 쓰고 단수 "they"를 사용하며 "he/she" 구문을 피한다 [src:26] (영문 카피 기준의 규칙이다; 한국어 카피의 존칭 체계 규칙은 공개 문서에서 확인되지 않는다 — Known Gaps 참조).
- **수사적 질문은 하나로 제한**하고 [src:27], 문제에 해법이 있으면 해법을 말하며 [src:27], 사용자를 탓하는 문구를 피한다 — "필터 적용 중에는 버스트 촬영 불가" 대신 "버스트 촬영은 필터를 제거한 뒤 사용할 수 있습니다" 방향 [src:27].

## Accessibility

One UI 접근성은 4C 원칙 — **Consideration(사용자 관점 공감) · Comprehensiveness · Coherence(모든 디바이스의 접근성) · Co-creation(사용자와의 공동 설계)** — 을 따른다 [src:28].

수치 규칙:

- 작은 텍스트는 배경과 **4.5:1 이상**, 큰 텍스트(일반 18dp 초과 또는 볼드 14dp 초과)는 **3:1 이상**의 대비를 가져야 한다 [src:29]. 2019 가이드라인은 이를 크기 구간별 표(12–13dp는 4.5:1, 14·17dp는 일반 4.5:1/볼드 3:1, 18dp 이상은 3:1)로 발행했다 [src:9]. WCAG에서 유래한 기준을 삼성이 공식 채택해 발행한 값이다.
- 자막·이미지 내 텍스트를 제외한 모든 텍스트는 **200% 확대**를 견뎌야 한다 [src:30].
- **5초를 넘는 자동 재생 콘텐츠에는 중지 컨트롤**을 제공한다 [src:31].

수치 없는 규칙:

- 터치 영역은 "쉽게 누를 수 있을 만큼 크고, 오터치를 막을 만큼 간격을 둔다" [src:30]. **공식 터치 타겟 dp 수치는 공개 조사 범위에서 확인되지 않았다** — 48dp 같은 값을 임의로 쓰지 말고, 크기·간격의 충분성만 규칙으로 이식할 것.
- 드래그 앤 드롭·멀티핑거 같은 복잡한 제스처에는 대안 조작을 제공하고, 컨트롤 위치는 일관되게 유지한다 [src:31].
- 포커스는 논리적 순서로 흐르고, 접근성 장치가 활성일 때 포커스 마크를 표시하며, 장식 요소·보조 이미지·빈 공간에는 포커스를 주지 않는다. **루핑은 지원하지 않는다** [src:32].
- 컨트롤을 모양·색·위치만으로 지칭하지 않는다 — "시작을 탭하세요"는 유효하지만 "아래 네모 버튼을 탭하세요"는 아니다 [src:33]. 오디오 신호에는 시각적 표현을 병행하고, 스트로브 효과·급격한 밝기 변화는 피한다 [src:33].
- 색만으로 정보를 전달하지 않는다 — 추가 시각 마크를 병행하고, 흑백 전환으로 정보 전달 여부를 점검한다 [src:29].

## Do's and Don'ts

**Do**

- 화면을 상단 뷰잉 영역(타이틀·비인터랙티브)과 하단 인터랙션 영역으로 나누고, 조작 요소를 하단에 모은다 [src:3].
- 결정이 필요한 다이얼로그는 화면 하단에 띄운다 [src:17].
- 좌우 마진은 최소 `{spacing.margin-side-min}`(24dp)을 지킨다 [src:4].
- 한 화면에는 한 가지 버튼 스타일만 쓰고, 강조는 회색(중간)/유채색(높음) 배경으로 구분한다 [src:16].
- 바텀 바 버튼에는 아이콘과 텍스트를 함께 넣는다 [src:14].
- 라이트·다크 두 모드 모두에서 테스트한 뒤 출시한다 [src:8].
- 모션은 100–500ms 범위에서, 빠른 가속 후 감속 곡선으로 운용한다 [src:22].
- 텍스트가 200% 확대를 견디는지, 작은 텍스트의 대비가 4.5:1 이상인지 확인한다 [src:29][src:30].
- 대형 화면에서는 팝업을 트리거한 요소 근처에 띄워 손 이동 거리를 줄인다 [src:34].

**Don't**

- 바텀 내비게이션에 스와이프 탭 전환을 붙이지 않는다 — One UI는 지원하지 않는다 [src:15].
- dim 효과와 shadow 효과를 동시에 적용하지 않는다 [src:6].
- 색만으로 상태·정보를 전달하지 않는다 [src:29].
- 발행되지 않은 수치를 지어내지 않는다 — 터치 타겟 dp, 그림자 수치, 타이포 스케일, 딤 불투명도는 One UI 공개 문서에 없다. 이 문서에 없는 값이 필요하면 One UI의 값이 아니라 자기 제품의 결정으로 명시할 것.
- **Material Design의 기본값을 One UI 규칙으로 간주하지 않는다** — One UI는 Android 테마 메커니즘을 사용하지만 [src:9], 시각 규칙(하단 다이얼로그, 텍스트 전용 바텀 탭, 스와이프 미지원, 뷰잉/인터랙션 분리)은 Material 기본값과 다르다. Material 컴포넌트를 그대로 두고 "One UI 스타일"이라 부르지 말 것.
- 삼성의 디바이스·OS 제품 도메인(폴더블 하드웨어 개념, 커버/메인 스크린 [src:36], Lock/Home/Recents/Quick panel/Edge panel 같은 시스템 표면 [src:5], 갤럭시 설정 화면의 카피)을 성격이 다른 제품에 그대로 이식하지 않는다 — 차용할 것은 시각·행동 언어이지 갤럭시 제품 맥락이 아니다.
- 디자인 시스템 이름 자체("One UI" 워드마크, "Samsung"/"Galaxy" 표기, `sec_*`/`one_ui_*` 류 네이밍)를 생성하는 제품 UI의 헤더·타이틀·라벨·클래스 이름에 넣지 않는다 — 출처 표기가 필요하면 footer attribution에만 둔다.
- 이 문서 또는 이 문서 기반 산출물을 삼성의 공식 릴리스·공식 스펙으로 제시하지 않는다 — One UI 상표와 원본 가이드라인의 권리는 삼성전자에 있다.

## Responsive Behavior

One UI는 모든 디스플레이 크기·해상도·화면비(폰·태블릿·폴더블·DeX 모니터·분할 화면)에 대응하도록 설계된다 [src:4]. 아래 dp 임계는 developer 포털이 현행 문서로 서빙하는 값이다.

### Window classes

| Class | 폭 (dp) | 대표 디바이스 | 내비게이션 [src:34] |
| --- | --- | --- | --- |
| Compact | < 600 | 폰 세로 [src:35] | Navigation bar + modal drawer |
| Medium | 600 ≤ w < 840 | Z Fold 세로/가로, 소형 태블릿 세로 [src:35] | Navigation rail + modal drawer |
| Expanded | 840 ≤ w | 태블릿 세로/가로 [src:35] | Navigation rail + modal/standard drawer |

600dp 이상이면 대형 화면 레이아웃을 적용한다 [src:35].

### Large screens

- 폰 레이아웃을 늘려 쓰지 말 것 — 늘어난 앱은 읽기 어렵고 공간을 낭비한다. 멀티페인으로 더 많은 정보를 한 번에 보여준다 [src:34].
- 멀티페인 분할비: **600 ≤ w < 960dp에서 42% : 58%**, **960dp 이상에서 38% : 62%** [src:34]. (윈도우 클래스의 840dp와 분할비의 960dp는 서로 다른 두 임계 체계다 — 발행값 그대로다.)
- 대형 화면의 4원칙: 메뉴를 콘텐츠와 함께 표시, 그리드를 대형 화면에 맞게 조정, 컨텍스트 전환 회피(작은 입력은 전체 화면 전환 대신 팝오버), 도달성 유지 [src:35].

### Foldables

- 폴더블 전용 분할비는 **50% : 50%** 권장 [src:34].
- 앱 연속성: 화면 전환(접힘↔펼침) 시 전체 화면을 채우고, 스크롤 위치를 유지하고, 입력 중이던 텍스트와 키보드 상태를 유지한다 [src:36].
- 커버 스크린과 메인 스크린 모두에서 올바르게 표시하고, 레터박스 없이 화면을 채우고, 가로 방향을 지원한다 [src:36].
- **접힘선(crease) 근처에 인터랙티브 요소를 두지 않는다** [src:36]. 키프아웃 수치는 공개 조사 범위에서 확인되지 않았다.
- Flex mode(반접힘): 콘텐츠는 위, 컨트롤은 아래에 두고, 진입/이탈 시 시각적 전환 효과를 보여준다 [src:36]. 설정 리스트처럼 레이아웃 변경이 불필요한 화면도 있다 [src:36].

### Multi-window

대형 화면은 **분할 화면 최대 3개 + 팝업 뷰 최대 5개** 동시 사용을 지원한다 [src:34]. 창 사이 드래그 앤 드롭 공유와 앱 다중 인스턴스를 지원하는 것이 권장된다 [src:37].

## Applied Guidance for LLMs

이 절은 위 인용 원칙을 UI 생성 시점의 실행 지침으로 번역한 **카탈로그 해석**이다 — 개별 항목의 근거는 위 섹션의 인용을 따른다.

화면을 생성할 때:

1. **수직 구조부터** — 타이틀·요약은 상단 뷰잉 영역(넓은 마진, 중앙 정렬, 비인터랙티브), 버튼·입력·리스트는 그 아래 인터랙션 영역에 배치한다. 화면 최하단이 가장 중요한 액션의 자리다.
2. **결정은 아래에서** — 확인/선택 다이얼로그는 bottom sheet 형태로, 정보 안내는 중앙 다이얼로그로 만든다.
3. **탭은 텍스트로, 5개 이내로** — 바텀 내비게이션에 아이콘 전용 탭이나 스와이프 페이저를 만들지 않는다.
4. **버튼 체계는 하나만** — 화면당 flat 또는 contained 한 체계를 고르고, 강조는 배경색(회색→유채색)으로만 올린다.
5. **색은 role로** — `{colors.primary}`는 FAB·입력 포커스에, `{colors.primary-dark}`는 강조 버튼·텍스트 버튼에, `{colors.color-control-activated}`는 토글·체크박스 활성에 묶는다. 값을 바꿔 리브랜딩할 때도 role 구조는 유지한다.
6. **다크 모드는 근흑으로** — 다크 배경은 순흑 대신 `{colors.black-dark}` 수준의 근흑, 두 테마를 항상 함께 생성한다.
7. **모션은 100–500ms** — `cubic-bezier(0.22, 0.25, 0, 1)`로 빠른 가속·완만한 감속. 텍스트 교체는 순차 페이드, 이미지 교체는 겹침 페이드.
8. **600dp에서 갈라진다** — 그 이상이면 멀티페인(42:58 → 960dp부터 38:62, 폴더블은 50:50)과 rail 내비게이션으로 전환한다.
9. **수치를 인용할 때 세대를 붙인다** — 이 문서의 hex/radius 값은 "One UI 2(2019) 발행값"이라는 스탬프와 함께 옮긴다. 스탬프를 떼면 그 순간부터 보편 규칙 사칭이 된다.
10. **없는 값은 없다고 말한다** — 타이포 스케일·터치 타겟·그림자 수치를 요구받으면 공개 발행값이 확인되지 않음을 밝히고 제품 자체 결정으로 명시한다.

## Known Gaps

- **원칙 문구의 정본이 없다** — developer 포털과 디자인 포털이 서로 다른 4원칙 세트를 발행하고, 워치(Tizen)는 제3의 세트를 쓴다 [src:1][src:2]. 이 문서는 교차 개념만 규칙화했다.
- **수치 토큰의 1차 근거는 2019 가이드라인(One UI 2 세대)이다** [src:9] — One UI 7의 팔레트·radius 수치는 공개 조사 범위에서 확인되지 않았다 [src:38]. 색·라운드의 세대 스탬프를 제거하지 말 것.
- **타이포그래피 스케일이 공개 조사 범위에서 확인되지 않았다** — 2019 가이드라인의 크기 표는 이미지로만 존재해 기계 판독이 불가했고, 시스템 폰트는 2019년 기준 Roboto다 [src:9]. SamsungOne은 브랜드 폰트로 별개다 [src:10]. 한국어 UI 카피의 존칭 규칙도 조사 범위의 공개 문서에서 확인되지 않는다.
- **공식 터치 타겟 수치가 없다** — 접근성 문서는 크기·간격의 충분성만 요구한다 [src:30]. 브라이트니스/새추레이션 허용 범위 [src:7], 딤/블러/그림자 수치 [src:6], 토스트 표시 시간 [src:20], Reject/Grip 존 크기 [src:4]도 수치 미발행.
- **One UI 7 시각 자료는 관찰 증거다** — 해당 페이지는 일부 이미지가 AI 생성 시뮬레이션임을 밝힌다 [src:38]. colored glass·그라디언트·원형 아이콘은 방향성이지 토큰이 아니다.

## References

1. https://developer.samsung.com/one-ui/index.html — One UI 개요. developer 포털의 4원칙(Focus on the task at hand · Interact naturally · Be visibly comfortable · Make things responsive), 크로스디바이스 철학, 뷰잉/인터랙션 영역과 reachability의 원칙 수준 서술.
2. https://design.samsung.com/global/contents/one-ui/ — 디자인 포털의 One UI 페이지. 별도 명칭의 4원칙(One Makes It Natural 외), 한손 조작, Focus Block, 상향 스와이프 일관성.
3. https://developer.samsung.com/one-ui/layout/basic.html — 기본 레이아웃. 뷰잉 영역(상단·타이틀·넓은 마진·중앙 정렬·비인터랙티브)과 인터랙션 영역(하단·논리적 그룹핑·list/card/2col/3col) 정의.
4. https://developer.samsung.com/one-ui/layout/grid.html — 그리드 시스템. 좌우 최소 24dp 마진, Reject/Grip 존, 카메라 컷아웃 회피, 전 디스플레이 대응 선언.
5. https://developer.samsung.com/one-ui/structure/basic.html — 기본 구조. Lock/Home/Recents/Quick panel/Edge panel 다섯 시스템 표면.
6. https://developer.samsung.com/one-ui/structure/visual-depth.html — 시각 깊이. blur/dim/shadow의 역할 분담과 dim+shadow 동시 적용 금지.
7. https://developer.samsung.com/one-ui/color/system.html — 컬러 시스템. Primary·Primary dark·Color control activated role의 용도와 hex 발행값. 명도·채도 범위 서술(수치 범위는 텍스트로 미발행).
8. https://developer.samsung.com/one-ui/color/theme.html — 테마. 다크 모드의 배경 전환 서술과 양 테마 테스트 요구.
9. https://design.samsung.com/global/contents/one-ui/download/oneui_design_guide_eng.pdf — One UI Design Guidelines PDF(2019-10, Mobile UX Center). **본 문서 수치값의 1차 출처 — One UI 2 세대 문서.** 팔레트(White/Black 포함), 24dp 마진, 썸네일 radius 26/20/12dp, 크기 구간별 대비 표, Roboto 기본 폰트, 아이콘 스트로크 말단 규칙, 다크 모드 권장, 베젤-화면 경계 서술.
10. https://design.samsung.com/global/contents/samsungone/ — SamsungOne 브랜드 타이페이스 소개(26개 문자 체계·400+ 언어·25,000+ 글리프). UI 시스템 폰트가 아니라 전사 브랜드 폰트라는 구분의 근거.
11. https://developer.samsung.com/one-ui/iconography/background.html — 아이콘 배경. 라운드 코너 정사각 배경과 아웃라인.
12. https://developer.samsung.com/one-ui/iconography/color.html — 아이콘 컬러. 선명한 단색 배경 + 흰 심볼, 그라디언트는 유사색 3색 이하.
13. https://developer.samsung.com/one-ui/comp/app-bar.html — 앱바. 표준/확장 형태, 확장 시 중앙 타이틀, 스크롤 축약, 액션 버튼 3개 이하 권장.
14. https://developer.samsung.com/one-ui/comp/bottom-bar.html — 바텀 바. 최대 5버튼, 1버튼 금지, 오버플로우 규칙, 아이콘+텍스트.
15. https://developer.samsung.com/one-ui/comp/bottom-navigation.html — 바텀 내비게이션. 4개 미만 권장·최대 5, 텍스트 전용 탭, 스와이프 미지원.
16. https://developer.samsung.com/one-ui/comp/button.html — 버튼. Flat/Contained 두 타입과 강조 3등급, 화면당 단일 스타일, drawable 스펙의 18dp radius.
17. https://developer.samsung.com/one-ui/comp/dialog.html — 다이얼로그. 선택/확인은 하단, 정보는 중앙, 결정 다이얼로그의 지속 규칙.
18. https://developer.samsung.com/one-ui/comp/list.html — 리스트. 메인 텍스트 31자 이내, 우측 토글, 우선순위 정렬.
19. https://developer.samsung.com/one-ui/comp/search.html — 검색. 자동완성·예측 텍스트, 입력 전 최근 검색어·제안 노출.
20. https://developer.samsung.com/one-ui/comp/toast.html — 토스트. 1줄 안팎·3줄 초과 금지, 가벼운 정보 한정.
21. https://developer.samsung.com/one-ui/motion/intro.html — 모션 소개. 정서적 몰입, 즉각적 반응, 매끄러운 전환.
22. https://developer.samsung.com/one-ui/motion/basic.html — 모션 기본. 100–500ms 범위, Basic Path Interpolator [0.22, 0.25, 0.00, 1.00], 이미지/텍스트 크로스페이드 규칙.
23. https://developer.samsung.com/one-ui/sound-and-haptic/sound.html — 사운드. 필요시에만, 입력/취소 구분음, 사인파.
24. https://developer.samsung.com/one-ui/sound-and-haptic/haptic.html — 햅틱. crisp·절제, 특수 키 구분, 시각 동기화.
25. https://developer.samsung.com/one-ui/writing/focused-and-purposeful.html — 라이팅: 목적성. 선택·행동·이해를 돕지 않는 텍스트 배제, 막다른 안내 금지.
26. https://developer.samsung.com/one-ui/writing/simple-and-human.html — 라이팅: 단순함. 팝업 한정 사유 4종, 단수 they.
27. https://developer.samsung.com/one-ui/writing/empowering.html — 라이팅: 임파워링. 질문 1개 제한, 해법 제시, 사용자 비난 금지.
28. https://developer.samsung.com/one-ui/accessibility/intro.html — 접근성 4C 원칙.
29. https://developer.samsung.com/one-ui/accessibility/color-contrast.html — 대비. 4.5:1/3:1 기준, 큰 텍스트 정의(18dp/14dp), 색 단독 전달 금지, 흑백 점검.
30. https://developer.samsung.com/one-ui/accessibility/layout-and-typo.html — 레이아웃·타이포. 200% 확대, 터치 영역 크기·간격의 정성 요구(수치 미발행).
31. https://developer.samsung.com/one-ui/accessibility/interaction-and-control.html — 인터랙션. 5초 자동재생 중지 컨트롤, 복잡 제스처 대안, 일관된 컨트롤 위치.
32. https://developer.samsung.com/one-ui/accessibility/focus-order.html — 포커스 순서. 논리적 흐름, 포커스 마크, 루핑 미지원, 장식 요소 제외.
33. https://developer.samsung.com/one-ui/accessibility/content.html — 콘텐츠. 모양·색·위치 단독 지칭 금지, 오디오의 시각 병행, 스트로브 금지.
34. https://developer.samsung.com/one-ui/largescreen-and-foldable/intro.html — 대형 화면 설계. 멀티페인 분할비(42:58 / 38:62 / 폴더블 50:50), 윈도우 클래스별 내비게이션, 분할 3+팝업 5, 팝업 근접 배치.
35. https://developer.samsung.com/one-ui/largescreen-and-foldable/large_screen_layout.html — 대형 화면 레이아웃. 600dp 임계, 윈도우 클래스(600/840dp)와 디바이스 매핑, 대형 화면 4원칙.
36. https://developer.samsung.com/one-ui/largescreen-and-foldable/designing_for_foldable.html — 폴더블 설계. 앱 연속성 3규칙, 커버/메인 스크린, 레터박스 금지, 접힘선 회피, Flex mode.
37. https://developer.samsung.com/galaxy-z/multi-window.html — 멀티윈도우(개발자 문서). 3개 이상 동시 실행, 드래그 앤 드롭, 다중 인스턴스.
38. https://design.samsung.com/global/contents/one-ui-7/index.html — One UI 7 디자인 페이지. 원 모티프, 레이어드 블러·colored glass·그라디언트 서술. 수치 미발행이며 일부 이미지는 AI 생성 시뮬레이션으로 명시됨 — 시각 자료는 관찰 증거로만 취급.
