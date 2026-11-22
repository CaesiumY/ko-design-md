# 토스 프리뷰 공통 바탕 메모

> PROTOTYPE. `public/preview/toss/preview.html` 한 파일을 두 단계로 고친 기록이다.
> 1단계는 커밋 `3d22bd1`, 2단계는 커밋하지 않은 작업 트리다.

## 1단계: 다크 복사본을 토큰 재정의로 접기

다크 시트는 라이트 규칙 326개를 `[data-theme="dark"]` 접두로 통째로 복사한 것이었다.
그중 263개는 선언까지 같았고 63개는 값 한두 개만 달랐다. 달라지는 값을 모두 토큰으로 옮겨, 다크 시트에 토큰 블록 하나와 규칙 하나만 남겼다.

| 항목 | 전 | 후 |
| --- | --- | --- |
| 파일 | 3,631줄, 140,012바이트 | 2,386줄, 93,199바이트 |
| 다크 시트 | 약 1,357줄, 52,794바이트 | 83줄, 4,305바이트 |
| 라이트 시트 | 44,188바이트 | 45,864바이트 |
| 다크 규칙(토큰 블록 제외) | 326개 | 1개 |
| 다크 토큰 블록의 선언 | 75개 | 33개에 새 토큰 27개 |

- 지운 것: 라이트와 선언이 같은 규칙 263개, 값만 다른 규칙 63개의 복사본(71곳), `@media` 블록 둘(안의 규칙이 모두 같았다), 같은 `@keyframes tds-pulse` 하나, 토큰 블록에서 `:root` 와 값이 같은 선언 42개.
- 새로 만든 토큰 27개, 이미 있던 토큰을 다시 쓴 것 2개(`--card`, `--tds-overlay-scrim`). 값 쌍은 29가지였다.
- 남긴 규칙 1개: `[data-theme="dark"] .dialog { border: 1px solid var(--tds-grey-200); }`. 라이트의 `.dialog` 에는 테두리 선언이 없어 토큰을 실을 자리가 없다. 색만 바꾸는 규칙이 아니라 테두리를 새로 만드는 규칙이다(STANDARD 4절의 "색 속성만"에 맞지 않는 유일한 곳).
- **라이트 시트도 바뀐다.** `:root` 끝에 새 토큰 27개를 더하고, 값이 달라지는 71곳을 `var(--토큰)` 으로 바꿨다. 마크업은 한 글자도 바꾸지 않았다.
- 규칙을 남기지 않고 토큰으로 옮긴 이유: `[data-theme="dark"] .chip` 은 라이트의 `.chip.active` 와 명시도가 같고 뒤에 오므로, 복사본을 지운 뒤에 남겨 두면 그 규칙을 이긴다. 토큰 재정의는 선택자를 더하지 않아 이런 일이 없다.

확인

- `dom-diff.ts` 로 원본(`e3bd246`)과 비교: **`SAME`**. 16개 패스, 패스마다 요소 716개. 첫 실행에서 수렴했다.
- `dom-diff.ts` 는 `::placeholder` 를 읽지 않는다. 토큰이 들어간 두 곳(`.input::placeholder`, `.search-field input::placeholder`)은 두 테마의 계산된 색을 따로 비교했고 같았다.
- 스크립트를 결과물에 한 번 더 돌려도 파일이 바뀌지 않는다.
- `pnpm validate:previews --slug toss`: 막힘 0, 경고 2(원본 4. 다크 쪽 경고 둘이 사라졌다).

스크립트와 손

- 전부 `toss-dedupe-dark.mjs` 가 했다. 결과물을 손으로 고친 곳은 없다.
- 손으로 정한 것은 스크립트 안의 이름 표(`NAMES`) 하나다. `종류|라이트 값|다크 값` 29쌍에 토큰 이름을 붙였고, 그중 둘은 이미 있는 토큰 이름을 가리킨다. 이 표와 `--tds-` 접두가 토스 전용이다.
- 나머지는 일반 동작이다: 두 `<style>` 을 읽어 규칙을 짝짓고, 값이 다른 조각을 찾아 토큰으로 바꾸고, 다크 토큰 블록에서 `:root` 와 같은 선언을 뺀다. 다른 항목은 `--names <json>` 으로 자기 표를 주고, 이름이 없는 쌍에는 `--dk-{종류}-{번호}` 가 붙는다.
- 토스에서 시험되지 않은 갈래: 다크에만 있는 규칙(통째로 남긴다), 한 규칙 안에 같은 속성이 두 번 나오는 경우(손으로 하라고 멈춘다), 값이 다른 `@keyframes`(남긴다).
- 라이트 값은 글자 그대로 토큰으로 옮긴다. `#fff` 와 `var(--tds-white)` 는 같은 흰색이지만 계산된 값의 표기가 `rgb(…)` 와 `oklch(…)` 로 달라서, `#fff` 자리는 기존 `--primary-foreground` 를 다시 쓰지 못하고 새 토큰(`--tds-fg-on-fill` 등 넷)이 됐다.

## 2단계: 기준대로 다시 짜기

전부 `toss-rezone.mjs` 가 했다. 손으로 마무리한 곳은 없다. 입력은 1단계 결과물이다.

| 항목 | 전(1단계 뒤) | 후 |
| --- | --- | --- |
| 파일 | 2,386줄, 93,199바이트 | 2,365줄, 96,904바이트 |
| 텍스트 요소(`audit:contrast` 의 elements, 테마마다) | 388 | 385 |
| 측정된 텍스트 행(테마마다) | 197 | 185 |

### 옛 칸이 간 곳

| 옛 섹션 | 옛 칸(이름표) | 구역 | `data-pv-cell` |
| --- | --- | --- | --- |
| (띠와 히어로) | 상단 워드마크 띠, 히어로 | hero | (칸 아님) |
| 06 Send-Money flow | 01. 홈 · 송금하기 | screens | `screen-send-home` |
| 06 | 02. 받는 사람 선택 | screens | `screen-send-select` |
| 06 | 03. 금액 입력 | screens | `screen-send-amount` |
| 06 | 04. 확인 | screens | `screen-send-confirm` |
| 06 | 05. 완료 | screens | `screen-send-done` |
| 01 Button | SIZE | buttons | `button-size` |
| 01 | VARIANT | buttons | `button-variant` |
| 01 | STATE | buttons | `button-state` |
| 01 | TEXT-BUTTON | buttons | `text-button` |
| 05 Full grid | BOTTOM-INFO | buttons | `bottom-info` |
| 05 | LIST-FOOTER | buttons | `list-footer` |
| 02 Inputs · Switch | TEXT FIELD | inputs | `text-field` |
| 04 NEW | Search Field | inputs | `search-field` |
| 04 | Slider | inputs | `slider` |
| 05 | NUMERIC-SPINNER | inputs | `numeric-spinner` |
| 05 | STEPPER | inputs | `stepper` |
| 02 | SWITCH · CHECKBOX | selection | `switch-checkbox` |
| 04 | Segmented Control | selection | `segmented-control` |
| 01 | CHIP | selection | `chip` |
| 04 | Filter Chips | selection | `filter-chips` |
| 05 | NAVIGATION · APPS IN TOSS | navigation | `navigation-apps-in-toss` |
| 05 | TAB | navigation | `tab` |
| 05 | MENU | navigation | `menu` |
| 03 List · Toast · Dialog | (이름표 없던 거래 내역 카드) | content | `list-row` |
| 01 | BADGE | content | `badge` |
| 04 | Rating | content | `rating` |
| 05 | BOARD-ROW | content | `board-row` |
| 05 | BAR-CHART | content | `bar-chart` |
| 05 | GRID-LIST | content | `grid-list` |
| 05 | POST | content | `post` |
| 05 | BUBBLE | content | `bubble` |
| 05 | TABLE-ROW | content | `table-row` |
| 05 | BORDER | content | `border` |
| 03 | TOAST | feedback | `toast` |
| 03 | DIALOG | feedback | `dialog` |
| 04 | Bottom Sheet | feedback | `bottom-sheet` |
| 04 | Tooltip | feedback | `tooltip` |
| 04 | Progress Bar | feedback | `progress-bar` |
| 05 | PROGRESS-BAR | feedback | `progress-bar-row` |
| 05 | PROGRESS-STEPPER | feedback | `progress-stepper` |
| 05 | LOADER | feedback | `loader` |
| (금액 입력 화면 안) | 숫자 키패드 | brand | `keypad` |

구역별 칸 수: screens 5, buttons 6, inputs 5, selection 4, navigation 3, content 10, feedback 8, brand 1. 모두 42칸.

판단이 갈린 곳

- **LIST-FOOTER, BOTTOM-INFO 는 버튼**으로 넣었다. md 529줄(문서 524행)이 list-footer 를 「더보기 액션 행」, bottom-info 를 bottom-cta 위의 안내와 CTA 로 적는다. 누르면 일이 일어나는 쪽이 주된 일이라고 봤다.
- **NUMERIC-SPINNER, STEPPER, Slider 는 입력**이다. 값을 정해 넣는 일이다(md 494, 508행).
- **Progress Bar, PROGRESS-STEPPER 는 피드백**이다. 일이 어디까지 됐는지를 알린다(md 504행).
- **MENU 는 내비게이션**에 넣었다. 기준 표의 대표 예를 따랐다. 다만 토스의 md 461행은 메뉴를 「셀렉터 컴포넌트」라 부르고 시연도 정렬 기준 고르기다. 쓰임으로만 보면 입력이나 선택으로 읽힌다(아래 「기준이 모호했던 곳」 9).
- **Rating 은 콘텐츠**다. md 500행은 「표시·입력」이라 적지만 시연은 점수를 보여 주는 쪽이다.
- **BORDER 는 콘텐츠**에 두었다. md 에 `### border` 절은 없고 41쪽 표(540행)와 Shapes(337행)에만 나온다. 기존 시연이라 지우지 않았다.

### 만들지 않은 구역

없다. 여덟 구역이 모두 있다.

- `brand` 는 **옮긴 칸이 아니라 복사한 칸** 하나로 만들었다. 원본에는 숫자 키패드가 금액 입력 화면 안에만 있었다. md 451~453행이 keypad 를 전용 컴포넌트로 규정하므로, 화면 안의 `.keypad-grid` 마크업을 그대로 한 번 더 실었다. 새 값이나 새 스타일은 없다. 이름표 `keypad` 는 md 의 컴포넌트 이름이다. 빼려면 `toss-rezone.mjs` 의 `cell("keypad", …)` 한 줄과 `CELLS.keypad`, `ORDER.brand` 를 지우면 구역째 사라진다.

### 이름표

- 기존 글을 그대로 옮겼다. 옛 영문 섹션 제목 여섯과 섹션 머리의 설명 문장 셋은 없앴다.
- 04 NEW 의 칸은 제목(`h4`)과 캡션이 따로였다. 둘을 쉼표로 이어 이름표 하나로 만들었다(예: `Segmented Control, pill 3-segments · underline tab`. 뒤쪽 가운뎃점은 원래 캡션의 글자다). 다크에서 글이 바뀌는 캡션은 `<span>` 과 `<template data-theme-variant="dark">` 를 그대로 이름표 안에 실었다.
- 화면 칸의 이름표는 옛 `stage-label` 의 글이다(`01. 홈 · 송금하기`).
- **새로 쓴 이름표는 둘이다.** 거래 내역 카드에는 원래 이름표가 없어 md 의 컴포넌트 이름 `list-header, list-row` 를 달았고, 키패드 칸에 `keypad` 를 달았다. 문장은 쓰지 않았다.
- 시연 자리 안의 상태 이름표는 그대로 두었다: Filter Chips 안의 `size · S 28 / M 34 / L 42`(`.comp-caption`), BORDER 의 `subtle / default / strong`(`.lbl`).

### 틀 변수

| 변수 | 준 값 | 근거 |
| --- | --- | --- |
| `--pv-font` | `var(--tds-font-sans)` | 브랜드 서체 변수가 없어 md `typography.*.fontFamily`(74행)를 `--tds-font-sans` 로 새로 두고 참조했다 |
| `--pv-font-display` | (주지 않음) | md 에 제목용 서체가 따로 없다 |
| `--pv-ink` | `var(--tds-grey-900)` | md 19행, primary text |
| `--pv-ink-muted` | `var(--tds-grey-700)` | md 21행, secondary text |
| `--pv-canvas` | `var(--tds-grey-50)` | 기존 `body` 바탕 |
| `--pv-surface` | `var(--tds-bg-canvas)` | 라이트 흰색, 다크 near-black. 1단계에서 생긴 토큰 |
| `--pv-line` | `var(--tds-grey-200)` | md 337행, 기본 헤어라인 |
| `--pv-radius` | `var(--tds-radius-xl)` | md 187행, 16px 은 cards |

`--pv-surface` 에 `--card`(다크 grey-100)를 쓰지 않은 이유: 다크에서 `.btn-neutral`, `.input`, `.seg` 의 바탕이 grey-100 이라 칸 바탕과 겹쳐 사라진다. 원본도 이 컴포넌트들을 near-black 섹션 위에 그렸다.

### 넣은 손끝 반응과 켜고 끄기

| 무엇 | 어떻게 | md 근거(`services/toss.md` 행) |
| --- | --- | --- |
| 버튼 눌림 | `.btn:active`, `.dlg-btn:active`, `.bottom-info .bi-cta:active`, `.phone .bottom-cta:active` 에 `--tds-overlay-press` 를 얹는다. 기존 `.btn-brand.pressed` 와 같은 방식이다 | 319, 358, 613(press-overlay 를 fill 위에), 436(다이얼로그 CTA), 383(bottom-cta) |
| 눌림 전환 | `box-shadow 120ms cubic-bezier(0.22, 0.61, 0.36, 1)` | 324(ease), 326(dur-fast: button press) |
| 입력창 초점 | `.input:focus-visible` 에 흰 바탕과 1.5px blue-500 테두리. `.input.error` 앞에 두어 오류의 빨간 테두리가 이긴다 | 391, 337 |
| 검색창 초점 | `.search-field:focus-within` 을 기존 `.search-field.focus` 와 같은 규칙으로 묶었다 | 492 |
| 스위치 | 진짜 `<input type="checkbox" role="switch">` 를 그린 트랙 앞에 두고 `:checked +` 로 켠다. 트랙과 손잡이 전환 200ms 는 원래 있던 값이다 | 484(dur-base, 18px translate), 327 |
| 체크박스 | 진짜 `<input type="checkbox">`, `:checked +` 로 채우고 체크 글리프를 보인다. 전환은 md 에 없어 넣지 않았다 | 484 |
| 세그먼트(`.seg`) | `role="radiogroup"`, `data-pv-toggle="aria-checked"`, 선택지는 `<button role="radio" data-pv-option>` | 488(상호 배타적 단일 선택) |
| 밑줄 탭(`.seg-line`), 탭(`.tab-inline`) | `role="tablist"`, `data-pv-toggle="aria-selected"`, 선택지는 `<button role="tab" data-pv-option>`. 패널은 두지 않았다 | 528 |

넣지 않은 것

- **hover 는 새로 넣지 않았다.** md 는 hover 의 지속 시간(327행 `dur-base: toggle, hover`)만 적고 생김새는 규정하지 않는다. 원본에 있던 `.btn:hover`(밝기)와 `.lrow:hover`(옅은 바탕)는 md 근거가 없지만 지우라는 지시가 없어 그대로 두었다.
- **버튼의 초점 표시**는 md 에 없어 넣지 않았다. 숨긴 진짜 입력(스위치, 체크박스)도 같은 이유로 초점 표시가 없다. 키보드로는 눌리지만 어디에 초점이 있는지 보이지 않는다.
- **칩은 켜고 끄기를 달지 않았다.** md 488행이 칩을 다중 필터라 적어 「하나만 고르는 칩」이 아니다.
- **화면 안의 하단 탭바**는 그대로 두었다. 화면 재현 안의 요소다.
- **메뉴**는 열린 모습 그대로다. 닫힌 모습(트리거)은 원본에 없어 더하지 않았다.
- 아코디언은 토스에 없다.

상태를 나란히 그린 칸(STATE 의 default / pressed / disabled, TEXT FIELD 의 idle / focused / error, Search Field 의 두 줄)은 그대로다. SWITCH · CHECKBOX 칸은 나란히 그린 네 줄이 그대로 진짜 입력이 됐다(초기값이 원래의 켜짐과 꺼짐이다).

### 브랜드 쪽 스타일에서 바꾼 것

「브랜드 컴포넌트 스타일과 화면 스타일은 그대로」가 원칙이지만 틀이 바뀌어 손댄 곳이 있다.

- `.phone` 에 `max-width: 100%` 를 더하고 640px 이하의 `.phone { width: 100%; max-width: 360px }` 를 뺐다. 768 폭에서 칸 안쪽이 310px 이라 360px 폰이 넘친다.
- `.hero` 의 `border-bottom` 을 뺐다. 첫 구역의 `border-top` 과 겹쳐 2px 선이 된다.
- `.comp-card .comp-caption` 을 `.comp-caption` 으로 바꿨다. 상태 이름표로 남았는데 `.comp-card` 가 사라졌다.
- `.demo-block { width: 100%; min-width: 0 }` 를 새로 두었다(아래 1).
- `.seg .it`, `.seg-line .it`, `.tab-inline .ti` 에 `<button>` 초기화 네 줄을 더하고 `.active` 선택자를 속성 선택자로 바꿨다. `.tds-switch.on`, `.tds-check.on` 은 `:checked +` 로 바꿨다.
- 상단 띠 `<header class="strip">` 와 `<section class="hero">` 는 `<div>` 로 바꿔 `header.pv-hero` 안에 넣었다.

지운 옛 틀 스타일: `.section`, `.section.canvas`, `.section-head` 와 그 자식 셋, `.row-label`, `.palette-row + .palette-row`, `.two-up`, `.card`, `.comp-grid`, `.comp-card`, `.comp-card h4`, `.full-grid`, `.ftile`, `.ftile .ftile-demo`, `.mock-frame` 과 그 자식 셋, 그리고 `@media` 안의 같은 선택자 11개. 다크 시트에는 1단계 덕분에 지울 것이 없었다.

## 확인 다섯 가지

1. `pnpm -s validate:previews --slug toss --verbose`: 막힘 0, 경고 2(원본 4). 남은 둘은 화면과 컴포넌트의 `.grid-list`, `.keypad-grid` 다(bare `1fr` 과 접기 없음). 브랜드 스타일이라 손대지 않았다.
2. 가로 넘침: 375 / 768 / 976 / 1440 의 라이트와 다크 여덟 경우 모두 `scrollWidth <= clientWidth`. 칸 밖으로 나간 자손도 0 이다(스크롤 상자 안은 제외하고 쟀다).
3. 텍스트 요소: 테마마다 385(전 388). 하한 80 을 넘는다. 줄어든 3은 옛 섹션 제목과 번호, 캡션, 합쳐진 `h4` 가 빠지고 구역 제목 여덟과 키패드 칸이 들어온 차이다.
4. 눈으로 보기: 976 라이트, 976 다크, 375 라이트, 768 라이트를 조각으로 찍어 봤다. 구역 순서가 맞고 화면이 히어로 바로 아래다. 칸과 이름표가 깨진 곳은 없다. 다크에서 페이지 바탕, 칸 바탕, 선, 이름표가 브랜드 다크 값으로 바뀐다.
5. 켜고 끄기: 세그먼트 둘째를 누르면 `aria-checked` 가 `true,false,false` 에서 `false,true,false` 로 바뀌고 흰 바탕이 옮겨 간다. 탭 셋째를 누르면 밑줄이 옮겨 간다. 꺼진 스위치를 누르면 체크되고 트랙이 blue-500, 손잡이가 18px 옮겨 간다. 빈 체크박스를 누르면 체크 글리프가 보인다. 버튼을 누르고 있으면 `oklch(0 0 0 / 0.26)` inset 이 얹힌다.

구조 확인: `main.pv-page` 의 자식은 hero 와 여덟 구역 순서대로다. 42칸 모두 `p.pv-label` 과 `div.pv-stage` 둘만 자식으로 갖고, `data-pv-cell` 이 겹치지 않는다. `.pv-screen` 안에 `pv-` class 가 없다. 본문에 `<script>` 가 없다. 틀 블록은 `frame.css` 와 글자까지 같다. 페이지 스타일에 `.pv-*` 선택자가 없다.

## 기준이나 틀이 모호하거나 모자랐던 곳

frame.css

1. **`.pv-stage--stack` 이 `flex-wrap: wrap` 을 물려받는다.** 세로 방향에 wrap 이 켜지면 여러 줄 컨테이너가 되어, 줄의 폭이 시연 자리의 폭이 아니라 가장 넓은 자식의 내용 폭이 된다. 가로 스크롤 칩 줄이 든 Filter Chips 칸이 375, 768, 976 폭에서 칸 밖으로 넘쳤다. `.pv-stage--stack` 에 `flex-wrap: nowrap` 이 있어야 한다. 지금은 브랜드 쪽 래퍼 `.demo-block { width: 100%; min-width: 0 }` 로 막았다.
2. **최대 폭과 가운데 정렬이 없다.** 구역은 화면 끝까지 퍼지는데 토스 히어로의 `.container` 는 1200px 가운데 정렬이다. 1249px 보다 넓으면 히어로의 왼쪽 선과 구역의 왼쪽 선이 어긋난다(1440 에서 120px). 틀이 폭을 정하거나, 히어로 안쪽 폭을 틀에 맞추라고 적어야 한다.
3. **히어로와 첫 구역 사이의 선.** `.pv-zone` 이 `border-top` 을 그리므로 히어로가 자기 아래 선을 그리면 겹친다. 히어로는 아래 선을 그리지 않는다고 적어야 한다.
4. **화면 칸의 폭.** 768 에서 두 열이면 칸 안쪽이 310px 이다. 360px 폰은 `pv-cell--wide` 로 한 줄에 하나씩 두거나(다섯 화면이 세로로 3,700px 쯤 된다) 폰이 줄어들어야 한다. 여기서는 두 열에 두고 폰을 줄였다. 기준의 예는 wide 인데 언제 wide 인지는 적혀 있지 않다.

STANDARD.md

5. **옛 상단 띠**(워드마크, `TDS Mobile · 2026 (Apps in Toss)`, `PREVIEW · LIGHT`, `Token-driven` 배지)를 어디에 둘지 없다. 지우지 않고 `pv-hero` 안에 넣었다. 이 글들은 2절의 허용 목록 어디에도 들지 않는다.
6. **이름표가 없던 칸.** 「새 문장을 쓰지 않는다」와 「칸은 이름표 하나를 갖는다」가 부딪친다. 컴포넌트 이름만 달았다.
7. **두 단 이름표**(제목과 캡션)를 하나로 합치는 방법이 없다. 쉼표로 이었다.
8. **화면 밖 칸의 `catalog-dummy`.** 거래 내역 카드 안과 표의 `<caption>` 에 있다. 2절은 화면 칸만 말한다. 시연 안에 그대로 두었다.
9. **메뉴의 구역.** 표의 대표 예는 내비게이션인데 23행은 쓰임을 따르라 하고, 토스의 메뉴는 정렬 기준을 고르는 셀렉터다. 표를 따랐다. 또 25행과 5절은 닫힌 모습과 열린 모습을 나란히 두라 하는데 원본에는 열린 모습만 있다.
10. **키패드.** 쓰임으로는 값을 써넣는 것이라 입력에 맞는데 지시는 브랜드 고유다. 화면 안에만 있던 컴포넌트를 구역에 올릴 때 옮기는지 복사하는지도 없다. 복사했다.
11. **4절의 「색 속성만 바꾸는 규칙」.** `.dialog` 의 다크 테두리는 색이 아니라 테두리 자체가 생긴다. 라이트에 `border: 0 solid …` 를 두고 폭까지 토큰으로 만들면 없앨 수 있지만 렌더가 같은지 다시 봐야 한다.
12. **`data-pv-toggle` 의 요소와 role.** 선택지를 `<button>` 으로 할지, role 을 줄지 적혀 있지 않다. `<button>` 과 radio / tab role 을 썼다. `iframe.js` 는 클릭만 처리해 화살표 키로는 옮겨 가지 않는다.
13. **화면 안 컴포넌트의 켜고 끄기.** 하단 탭바처럼 화면 안에만 있는 탭을 실제로 바뀌게 할지 없다. 두지 않았다.
14. **md 근거가 없는 기존 반응.** 원본의 `.btn:hover`, `.lrow:hover` 를 지울지 둘지 없다. 두었다.
15. **숨긴 입력의 초점 표시.** md 가 규정하지 않으면 초점 표시가 없는 컨트롤이 생긴다.

토스에서 본 것(기준 문제는 아님)

- 탭의 밑줄은 md 528행이 blue-500 이라 적는데 프리뷰는 grey-900 으로 그린다. 원본부터 그랬고 손대지 않았다.
- `.seg` class 가 세그먼트와 진행 단계의 선(`.pstep .seg`)에 함께 쓰인다. 원본부터 그랬다.
- 다크에서 Bottom Sheet 의 스크림(검정 64%)이 near-black 칸 바탕 위라 거의 보이지 않는다. 원본은 grey-100 카드 위였다.
- 375 폭에서 확인 화면의 `받는 계좌` 줄이 라벨과 값이 붙는다. 폰이 343px 에서 301px 로 줄어서다.
- 1단계에서 옮긴 `#fff` 네 개가 토큰 값으로 남아 있다. 새로 들인 hex 는 없다.
