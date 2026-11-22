# 토스 프리뷰 공통 바탕 메모

> PROTOTYPE. `public/preview/toss/preview.html` 한 파일을 두 단계로 고친 기록이다.
> 1단계는 커밋 `3d22bd1`. 2단계는 1단계 결과물에 `toss-rezone.mjs` 를 돌린 출력이다(손으로 고치지 않는다. 고칠 일이 있으면 스크립트를 고쳐 다시 만든다).
> md 줄 번호는 `services/toss.md` 기준이다.

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

```
git show 3d22bd1:public/preview/toss/preview.html > <1단계 파일>
node prototypes/preview-structure/base-notes/toss-rezone.mjs --in <1단계 파일> --out public/preview/toss/preview.html
```

| 항목 | 전(1단계 뒤) | 후 |
| --- | --- | --- |
| 파일 | 2,386줄, 93,199바이트 | 2,350줄, 96,258바이트 |
| 텍스트 요소(`pnpm audit:contrast:staged`, 테마마다) | 388 | 374 |
| 대비 미달 행(같은 관측, 두 테마와 네 폭과 두 상태 합) | 100 | 91 |

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
| 05 | MENU | inputs | `menu` |
| 02 | SWITCH · CHECKBOX | selection | `switch-checkbox` |
| 04 | Segmented Control | selection | `segmented-control` |
| 01 | CHIP | selection | `chip` |
| 04 | Filter Chips | selection | `filter-chips` |
| 05 | NAVIGATION · APPS IN TOSS | navigation | `navigation-apps-in-toss` |
| 05 | TAB | navigation | `tab` |
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

구역별 칸 수: screens 5, buttons 6, inputs 6, selection 4, navigation 2, content 10, feedback 8. 모두 41칸.

판단이 갈린 곳

- **LIST-FOOTER, BOTTOM-INFO 는 버튼**으로 넣었다. md 529줄이 list-footer 를 「더보기 액션 행」, bottom-info 를 bottom-cta 위의 안내와 CTA 로 적는다. 누르면 일이 일어나는 쪽이 주된 일이라고 봤다.
- **NUMERIC-SPINNER, STEPPER, Slider 는 입력**이다. 값을 정해 넣는 일이다(md 494, 508).
- **MENU 는 입력**이다. md 461 은 메뉴를 「셀렉터 컴포넌트」라 부르고 시연도 정렬 기준 고르기다. 목록을 열어 값을 골라 넣는 쓰임이다. ADR 0015 가 쓰임으로 구역을 정하게 했고 기준 1절이 이 경우를 예로 든다. 치지직의 정렬 메뉴도 같은 구역이다.
- **밑줄 세그먼트(`.seg-line`)는 선택**에 남겼다. 생김새는 탭이지만 Segmented Control 칸 안에서 값 하나를 그 자리에서 고르는 것이다. 그래서 `role="tablist"` 가 아니라 `role="radiogroup"` 을 줬다.
- **Progress Bar, PROGRESS-STEPPER 는 피드백**이다. 일이 어디까지 됐는지를 알린다(md 504).
- **Rating 은 콘텐츠**다. md 500 은 「표시·입력」이라 적지만 시연은 점수를 보여 주는 쪽이다.
- **BORDER 는 콘텐츠**에 두었다. md 에 `### border` 절은 없고 41쪽 표(540)와 Shapes(337)에만 나온다. 기존 시연이라 지우지 않았다.

### 만들지 않은 구역

- **브랜드 고유(`brand`)**: 여섯 구역 어디에도 안 맞는 칸이 없다. 숫자 키패드(md 451~453)는 금액 입력 화면 안에만 있고, 구역에 따로 올리지 않았다.
  한때 화면 안의 키패드 마크업을 한 번 더 실어 브랜드 고유 칸을 만들었는데 뺐다. 같은 글이 두 번 나오게 되고(글 대조에서 드러났다), 기준 7절이 없던 시연을 새로 그리지 않게 한다. 쓰임으로 봐도 키패드는 값을 써넣는 것이라 브랜드 고유가 아니라 입력에 가깝다.

### 이름표

- 기존 글을 그대로 옮겼다. 옛 영문 섹션 제목 여섯과 섹션 머리의 설명 문장 셋은 없앴다.
- 04 NEW 의 칸은 제목(`h4`)과 캡션이 따로였다. 둘을 쉼표로 이어 이름표 하나로 만들었다(예: `Segmented Control, pill 3-segments · underline tab, 치수 (가정)`. 가운뎃점은 원래 캡션의 글자다). 다크에서 글이 바뀌는 캡션은 `<span>` 과 `<template data-theme-variant="dark">` 를 그대로 이름표 안에 실었다.
- **`치수 (가정)` 표지를 여덟 칸의 이름표에 옮겼다.** 옛 04 섹션의 머리 캡션이 이 글로 끝났고, 섹션이 사라지면서 표지도 함께 사라질 뻔했다. 그 섹션에서 온 여덟 칸(Search Field, Slider, Segmented Control, Filter Chips, Rating, Bottom Sheet, Tooltip, Progress Bar)의 이름표 끝에 붙였다. 스크립트는 옛 캡션이 정말 그 글로 끝나는지 확인하고, 아니면 멈춘다.
- 화면 칸의 이름표는 옛 `stage-label` 의 글이다(`01. 홈 · 송금하기`).
- **새로 쓴 이름표는 하나다.** 거래 내역 카드에는 원래 이름표가 없어 md 의 컴포넌트 이름 `list-header, list-row` 를 달았다. 문장은 쓰지 않았다.
- 시연 자리 안의 상태 이름표는 그대로 두었다: Filter Chips 안의 `size · S 28 / M 34 / L 42`(`.comp-caption`), BORDER 의 `subtle / default / strong`(`.lbl`).
- `text-inventory.mjs` 로 1단계 결과물과 글을 대조했다. 빠진 글은 옛 섹션 제목, 번호, 캡션(이름표로 합쳐짐)뿐이고 더해진 글은 구역 제목 일곱과 새 이름표 하나뿐이다.

### 틀 변수

| 변수 | 준 값 | 근거 |
| --- | --- | --- |
| `--pv-font` | `var(--tds-font-sans)` | 브랜드 서체 변수가 없어 md `typography.*.fontFamily`(74)를 `--tds-font-sans` 로 새로 두고 참조했다 |
| `--pv-ink` | `var(--tds-grey-900)` | md 19, primary text |
| `--pv-ink-muted` | `var(--tds-grey-700)` | md 21, secondary text |
| `--pv-canvas` | `var(--tds-grey-50)` | 기존 `body` 바탕 |
| `--pv-surface` | `var(--tds-bg-canvas)` | 라이트 흰색, 다크 near-black. 1단계에서 생긴 토큰 |
| `--pv-line` | `var(--tds-grey-200)` | md 337, 기본 헤어라인 |
| `--pv-radius` | `var(--tds-radius-xl)` | md 187, 16px 은 cards |
| `--pv-tracking` | `-0.005em` | `body` 의 자간과 같은 값. 주지 않으면 틀이 제목과 이름표의 자간을 0 으로 덮는다 |

- `--pv-title-weight` 는 주지 않았다(틀 기본 700). 옛 섹션 제목도 700 이었다.
- **자간은 한쪽에만 맞는다.** md 의 타이포 단계는 크기마다 자간이 다르다(제목 단계 -0.020em, 작은 단계 -0.005em 과 0). 틀의 자간 변수는 하나라 구역 제목(22px)과 이름표(12px)에 같은 값이 들어간다. 본문 기본값을 줬다.
- `--pv-surface` 에 `--card`(다크 grey-100)를 쓰지 않은 이유: 다크에서 `.btn-neutral`, `.input`, `.seg` 의 바탕이 grey-100 이라 칸 바탕과 겹쳐 사라진다. 원본도 이 컴포넌트들을 near-black 섹션 위에 그렸다.

### 넣은 손끝 반응과 켜고 끄기

| 무엇 | 어떻게 | md 근거 |
| --- | --- | --- |
| 버튼 눌림 | `.btn:active`, `.dlg-btn:active`, `.bottom-info .bi-cta:active`, `.phone .bottom-cta:active` 에 `--tds-overlay-press` 를 얹는다. 기존 `.btn-brand.pressed` 와 같은 방식이다 | 319, 358, 613(press-overlay 를 fill 위에), 436(다이얼로그 CTA), 383(bottom-cta) |
| 눌림 전환 | `box-shadow 120ms cubic-bezier(0.22, 0.61, 0.36, 1)` | 324(ease), 326(dur-fast: button press) |
| 입력창 초점 | `.input:focus-visible` 에 흰 바탕과 1.5px blue-500 테두리. `.input.error` 앞에 두어 오류의 빨간 테두리가 이긴다 | 391, 337 |
| 검색창 초점 | `.search-field:focus-within` 을 기존 `.search-field.focus` 와 같은 규칙으로 묶었다 | 492 |
| 스위치 | 진짜 `<input type="checkbox" role="switch">` 를 그린 트랙 앞에 두고 `:checked +` 로 켠다. `<label>` 이 둘을 감싸 그린 트랙을 누르면 켜진다. 트랙과 손잡이 전환 200ms 는 원래 있던 값이다 | 484(dur-base, 18px translate), 327 |
| 체크박스 | 진짜 `<input type="checkbox">`, `:checked +` 로 채우고 체크 글리프를 보인다. 전환은 md 에 없어 넣지 않았다 | 484 |
| 세그먼트(`.seg`), 밑줄 세그먼트(`.seg-line`) | `role="radiogroup"`, `data-pv-toggle="aria-checked"`, 선택지는 `<button role="radio" data-pv-option>` | 488(상호 배타적 단일 선택) |
| 탭(`.tab-inline`) | `role="tablist"`, `data-pv-toggle="aria-selected"`, 선택지는 `<button role="tab" data-pv-option>`. 패널은 두지 않았다 | 528 |

넣지 않은 것

- **hover 는 새로 넣지 않았다.** md 는 hover 의 지속 시간(327 `dur-base: toggle, hover`)만 적고 생김새는 규정하지 않는다. 원본에 있던 `.btn:hover`(밝기)와 `.lrow:hover`(옅은 바탕)는 md 근거가 없지만 지우라는 지시가 없어 그대로 두었다.
- **버튼의 초점 표시**는 md 에 없어 넣지 않았다. 숨긴 진짜 입력(스위치, 체크박스)도 같은 이유로 초점 표시가 없다. 키보드로는 눌리지만 어디에 초점이 있는지 보이지 않는다.
- **칩은 켜고 끄기를 달지 않았다.** md 488 이 칩을 다중 필터라 적어 「하나만 고르는 칩」이 아니다.
- **화면 안의 하단 탭바**는 그대로 두었다. 화면 재현 안의 요소다.
- **메뉴**는 열린 모습 그대로다. 닫힌 모습(트리거)은 원본에 없어 더하지 않았다.
- 아코디언은 토스에 없다.

화면 재현에는 `role="img"` 가 없고, 원본부터 있던 진짜 `<button>` 이 그 안에 그대로 있다(`SCENARIOS.md` 의 다섯째 문제가 이 버튼을 가리킨다).

상태를 나란히 그린 칸(STATE 의 default / pressed / disabled, TEXT FIELD 의 idle / focused / error, Search Field 의 두 줄)은 그대로다. SWITCH · CHECKBOX 칸은 나란히 그린 네 줄이 그대로 진짜 입력이 됐다(초기값이 원래의 켜짐과 꺼짐이다).

### 브랜드 쪽 스타일에서 바꾼 것

「브랜드 컴포넌트 스타일과 화면 스타일은 그대로」가 원칙이지만 틀이 바뀌어 손댄 곳이 있다.

- `.container { max-width: 1200px; margin: 0 auto; padding: 0 24px }` 를 `.container { padding: 0 var(--pv-gutter) }` 로 바꾸고 640px 이하의 `.container` 규칙을 뺐다. 히어로의 왼쪽 선이 구역과 맞는다(틀이 내용 폭 1200px 을 여백 변수로 내준다).
- `.phone` 에 `max-width: 100%` 를 더하고 640px 이하의 `.phone { width: 100%; max-width: 360px }` 를 뺐다. 좁은 칸에서 360px 폰이 넘친다.
- `.hero` 의 `border-bottom` 을 뺐다. 첫 구역의 `border-top` 과 겹쳐 2px 선이 된다.
- `.comp-card .comp-caption` 을 `.comp-caption` 으로 바꿨다. 상태 이름표로 남았는데 `.comp-card` 가 사라졌다.
- `.seg .it`, `.seg-line .it`, `.tab-inline .ti` 에 `<button>` 초기화 네 줄을 더하고 `.active` 선택자를 속성 선택자로 바꿨다. `.tds-switch.on`, `.tds-check.on` 은 `:checked +` 로 바꿨다.
- 상단 띠 `<header class="strip">` 와 `<section class="hero">` 는 `<div>` 로 바꿔 `header.pv-hero` 안에 넣었다.

지운 옛 틀 스타일: `.section`, `.section.canvas`, `.section-head` 와 그 자식 셋, `.row-label`, `.palette-row + .palette-row`, `.two-up`, `.card`, `.comp-grid`, `.comp-card`, `.comp-card h4`, `.full-grid`, `.ftile`, `.ftile .ftile-demo`, `.mock-frame` 과 그 자식 셋, 그리고 `@media` 안의 같은 선택자 11개. 다크 시트에는 1단계 덕분에 지울 것이 없었다.

## 확인

| 무엇 | 명령 | 결과 |
| --- | --- | --- |
| 스크립트가 같은 입력에 같은 출력을 냄 | 다시 돌린 출력을 `cmp` | 같음 |
| 틀 블록이 `frame.css` 와 글자까지 같고 페이지 스타일이 `.pv-` 선택자를 이름하지 않음 | `node prototypes/preview-structure/base-notes/paste-frame.mjs --check public/preview/toss/preview.html` | ok |
| 구역 순서와 제목, 칸의 자식 순서, 이름 겹침, 자기 `<script>` 없음, 패널 없음 | `pnpm exec tsx prototypes/preview-structure/base-notes/check-base.ts toss` | ok |
| 가로 넘침과 칸 밖(가로, 세로) 넘침, 히어로와 구역의 왼쪽 선. 375 / 768 / 976 / 1440 과 두 테마 | 같은 명령 | ok |
| 켜고 끄기 묶음 셋과 진짜 입력 넷을 실제로 눌러 값이 바뀌고 보이는 요소 수가 그대로임 | 같은 명령 | ok |
| 프리뷰 검증기 | `pnpm validate:previews --slug toss --verbose` | 막힘 0, 경고 2(원본 4). 남은 둘은 `.grid-list`, `.keypad-grid` 의 bare `1fr` 과 접기 없음이다. 브랜드 스타일이라 손대지 않았다 |
| 텍스트 요소 하한 80 | `pnpm audit:contrast:staged` | 테마마다 374 |
| 다크 접기 전후의 렌더 | `dom-diff.ts`(1단계에서) | `SAME` |

## 틀과 기준에 대해 알아낸 것

### 틀이 고쳐져 풀린 것

| 첫 틀의 결함 | 드러난 곳 | 지금의 틀 | 브랜드 쪽에서 지운 것 |
| --- | --- | --- | --- |
| `.pv-stage--stack` 이 `flex-wrap: wrap` 을 물려받음 | 가로 스크롤 칩 줄이 든 Filter Chips 칸이 375, 768, 976 폭에서 칸 밖으로 넘침 | `flex-wrap: nowrap` | `.demo-block { width: 100%; min-width: 0 }` |
| 최대 폭과 가운데 정렬이 없음 | 1249px 보다 넓으면 히어로와 구역의 왼쪽 선이 어긋남(1440 에서 120px) | `--pv-gutter` 가 내용 폭 1200px 을 만든다 | `.container` 의 고정 폭과 여백 |
| 칸이 767px 까지 두 열 | 768 폭에서 칸 안쪽 310px 에 360px 폰 | 899px 이하는 한 열 | (폰의 `max-width: 100%` 는 남겼다) |

히어로가 자기 아래 선을 그리지 않는다는 것, 이름표 없던 칸에는 md 의 컴포넌트 이름을 단다는 것, 제목과 캡션은 쉼표로 잇는다는 것, 없던 시연은 새로 그리지 않는다는 것은 `STANDARD.md` 에 적었다.

### 남은 것

1. **옛 상단 띠**(워드마크, `TDS Mobile · 2026 (Apps in Toss)`, `PREVIEW · LIGHT`, `Token-driven` 배지)를 어디에 둘지 기준에 없다. 지우지 않고 `pv-hero` 안에 넣었다. 이 글들은 허용된 글 목록 어디에도 들지 않는다.
2. **자간 변수가 하나다**(위 「틀 변수」).
3. **화면 밖 칸의 `catalog-dummy`.** 거래 내역 카드 안과 표의 `<caption>` 에 있다. 시연 안에 그대로 두었다. 칸의 자식 순서 약속(이름표, 다크 변형, 더미 데이터 표기, 시연 자리)은 칸 바로 아래의 표기만 말한다.
4. **4절의 「색 속성만 바꾸는 규칙」.** `.dialog` 의 다크 테두리는 색이 아니라 테두리 자체가 생긴다. 라이트에 `border: 0 solid …` 를 두고 폭까지 토큰으로 만들면 없앨 수 있지만 렌더가 같은지 다시 봐야 한다.
5. **`data-pv-toggle` 과 키보드.** `iframe.js` 는 클릭만 처리해 화살표 키로는 옮겨 가지 않는다. radio 와 tab role 을 준 묶음에서 보조 기술이 기대하는 조작과 다르다.
6. **md 근거가 없는 기존 반응.** 원본의 `.btn:hover`, `.lrow:hover` 를 지울지 둘지 기준에 없다. 두었다.
7. **숨긴 입력의 초점 표시.** md 가 규정하지 않으면 초점 표시가 없는 컨트롤이 생긴다.
8. **화면이 다섯이면 길다.** 900px 부터 두 열이라 976 폭에서 화면 구역만 2,300px 쯤 된다. 화면 칸을 언제 넓은 칸으로 둘지는 기준에 없다.

토스에서 본 것(기준 문제는 아님)

- 탭의 밑줄은 md 528 이 blue-500 이라 적는데 프리뷰는 grey-900 으로 그린다. 원본부터 그랬고 손대지 않았다.
- `.seg` class 가 세그먼트와 진행 단계의 선(`.pstep .seg`)에 함께 쓰인다. 원본부터 그랬다.
- 다크에서 Bottom Sheet 의 스크림(검정 64%)이 near-black 칸 바탕 위라 거의 보이지 않는다. 원본은 grey-100 카드 위였다.
- 1단계에서 옮긴 `#fff` 네 개가 토큰 값으로 남아 있다. 새로 들인 hex 는 없다.
- 감싸개 `div.demo-block` 과 그 class 는 마크업에 남아 있다. 규칙은 없다.
