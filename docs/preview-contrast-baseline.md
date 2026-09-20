# 프리뷰 대비 측정 — 1단계 기준선

이슈 [#359](https://github.com/CaesiumY/ko-design-md/issues/359)의 1단계. 카탈로그 21개 항목의
프리뷰를 라이트·다크로 렌더해 WCAG 2.x 대비를 전수 측정한 결과다. **게이트가 아니다** —
수치를 남기는 것이 목적이고, 그중 무엇을 어떤 심각도로 막을지는 이 표를 보고 2단계에서 정한다.

- 측정일: 2026-09-21 (KST)
- 재생성: `pnpm audit:contrast --report-out <경로> --json-out <경로>` — 전수 1회 **약 25초**.
  `--report-out` 이 쓰는 표에는 **`pass` 행이 실리지 않는다**(아래 총계의 `measured` 와
  행 수가 맞지 않는 이유다). 판정을 포함한 전 행은 `--json-out` 쪽에 있다.
- 조건: Chromium, 폭 375 / 768 / 976 / 1440, `prefers-reduced-motion: reduce`,
  외부 폰트 CDN 차단(`--online`으로 해제), 색 전환 비활성
- 기준: 작은 텍스트 4.5:1, 18pt(24px) 이상 또는 14pt(18.67px) 이상 굵은 글씨 3:1,
  비텍스트 3:1

## 이 표를 어떻게 읽나

**판정은 네 값이다.** 8비트 색 읽기의 양자화가 비율을 ±0.02 흔들어서, 선 위의 값에
pass/fail 이진 판정을 붙이면 근거 없는 단정이 된다.

| 판정 | 뜻 |
| --- | --- |
| `pass` | 기준 + 0.1 이상 |
| `borderline` | 기준 ±0.1 — 이 폭 안에 있으면 측정 오차로 뒤집힐 수 있다 |
| `fail` | 기준 − 0.1 미만 |
| `indeterminate` | 잰 값은 있으나 판정을 보류함 (사유는 아래 표) |

**텍스트 행과 비텍스트 행의 무게가 다르다.**

- **텍스트 행은 2단계 래칫의 초기값으로 쓸 수 있다.** 오라클 10곳을 ±0.01로 재현하고,
  재측정 3회에서 텍스트 수치가 한 건도 흔들리지 않았다.
- **비텍스트 행은 래칫 초기값이 아니라 조사 목록이다.** SC 1.4.11은 "UI 컴포넌트와 그래픽
  객체"에 적용되는데, 어떤 표면이 컴포넌트인지는 의미 판단이고 이 카탈로그의 프리뷰는
  목업을 의도적으로 비시맨틱하게 만든다. 측정기는 "작고(뷰포트 면적 1% 미만) 자식이 둘
  이하이며 배경이나 1px 이상 보더를 가지고 **안에 텍스트가 없는** 요소"라는 형태
  휴리스틱으로 대상을 고르므로, 슬라이더 트랙처럼 진짜 논점인 것과 클릭 리플 장식처럼
  아닌 것이 같은 표에 섞인다.
- **텍스트를 담은 컨트롤은 비텍스트 대상이 아니다.** 그 텍스트가 이미 SC 1.4.3 으로
  측정되고, 자기 라벨로 식별되는 컨트롤에는 별도 경계가 요구되지 않는다는 판단이다.
  라벨은 대개 한 겹 감싸여 있으므로(`<button class="chip"><span>전체</span></button>` 가
  이 카탈로그의 보통 모양이다) 직계 자식이 아니라 `textContent` 로 본다. 아이콘만 든
  버튼은 텍스트가 없으므로 그대로 측정된다. 이건 SC 1.4.11 의 한 가지 읽기이고, 경계
  자체에 3:1 을 요구하는 더 엄한 읽기도 가능하다 — 2 단계에서 다시 정할 수 있게 여기
  적어 둔다.

**`텍스트` 열은 그 요소의 대표 문구이지 테마별 정확한 문구가 아니다.** 프리뷰는 다크 전용
산문을 `<template data-theme-op="swap">`으로 교체하므로 다크에서는 다른 텍스트 노드다.
행은 요소 경로와 측정값으로 접히므로, 다크 행에 라이트 쪽 문구가 실릴 수 있다.

**폭 열의 `all`은 측정한 네 폭 전부에서 같은 값이 나왔다는 뜻이다.** 대비는 폭에 거의
움직이지 않지만, `@media`가 색을 바꾸거나 `clamp()`·`vw` 타이포가 18pt 선을 넘나들면
그 폭이 자기 행으로 갈라져 나온다.

## 측정이 실제로 작동한다는 근거

수치가 맞는지를 수치로는 알 수 없다. 그래서 **결함이 이미 알려진 파일**을 정본으로 삼는다 —
`2ead71d` 직전의 samsung-one-ui, 즉 이슈 #359가 표로 적은 7행(hover가 양 테마이므로 8건)과
그 커밋 메시지가 추가로 적은 비텍스트 2건이 아직 들어 있는 상태다.

그 파일은 `scripts/fixtures/samsung-one-ui-2ead71d-parent.html` 로 **저장소에 커밋돼 있다.**
히스토리에서 읽어 오지 않는 이유는 `2ead71d` 가 이 저장소에서 도달 불가이기 때문이다 —
카탈로그는 PR 을 squash 로 머지하므로 PR #291 브랜치의 그 커밋은 `main` 의 조상이 된 적이
없고(`git merge-base --is-ancestor` 가 아니라고 답한다), `git show` 로 읽는 방식은 그 브랜치의
객체를 아직 들고 있는 클론에서만 통했다.

`pnpm audit:contrast --self-check`가 그 파일을 가상 경로로 서빙해 앵커 10곳을 대조한다.
"3.01이 수백 개 읽기 중 어딘가 나왔다"는 반증할 수 없으므로 **어느 요소에서 나와야 하는지**를
함께 고정했다. 기대값은 이 측정기의 출력이 아니라 이슈 본문과 커밋 메시지다.

| 앵커 | 테마 | 상태 | 기대(수정 전) | 측정 | 기대(현재) | 측정 |
| --- | --- | --- | --- | --- | --- | --- |
| `button.btn.btn-contained-high` | dark | 정적 | 3.01 | 3.00 | 6.39 | 6.39 |
| `button.btn.btn-contained-high` | light | hover | 3.60 | 3.61 | 6.44 | 6.46 |
| `button.btn.btn-contained-high` | dark | hover | 3.60 | 3.61 | 7.72 | 7.70 |
| `span.toast > span.act` | light | 정적 | 3.76 | 3.77 | 5.26 | 5.27 |
| `span.toast > span.act` | dark | 정적 | 4.03 | 4.03 | 4.83 | 4.83 |
| `div.panes > div.p` | light | 정적 | 3.84 | 3.84 | 4.65 | 4.65 |
| `div.panes > div.p.first` | light | 정적 | 3.88 | 3.89 | 17.34 | 17.34 |
| `div.li > span.switch` | light | 정적 | 1.64 | 1.64 | 3.58 | 3.58 |
| `div.li > span.radio` | light | 정적 | 2.63 | 2.63 | 3.60 | 3.58 |
| `div.li > span.switch` | dark | 정적 | 1.98 | 1.98 | 3.60 | 3.60 |

자기검사는 hover 강제가 실제로 걸렸는지도 따로 묻는다. CDP `CSS.forcePseudoState`는 노드
id가 어긋나면 조용히 무동작하므로, 수정 전 파일의 라이트 강조 버튼이 정지 4.51 · hover 3.61로
**다른 값**을 내야 한다.

여기에 더해 표본 두 건을 손으로 대조했다 — kyobobook `p.panel-note`는 `oklch(0.737 0.012 264)`
12px이 흰 카드 위에 있고(2.33:1), likelion의 태그 배지는 `oklch(0.69 0.209 42)` 12px 굵은
글씨가 `oklch(0.96 0.022 54)` 위에 있다(2.67:1). 둘 다 실제 미달이다.

## 슬러그별 총계

이 표가 2단계 래칫의 초기값이다. 열 이름은 기존 슬러그별 표(`TOKEN_COVERAGE` 등)로 그대로
옮겨 쓸 수 있게 맞췄다.

| slug | theme | kind | measured | fail | borderline | indeterminate |
| --- | --- | --- | --- | --- | --- | --- |
| 11st | dark | text | 95 | 12 | 0 | 12 |
| 11st | dark | non-text | 17 | 8 | 0 | 2 |
| 11st | light | text | 95 | 26 | 20 | 12 |
| 11st | light | non-text | 17 | 9 | 0 | 2 |
| baemin | dark | text | 92 | 9 | 0 | 2 |
| baemin | dark | non-text | 4 | 2 | 0 | 0 |
| baemin | light | text | 90 | 17 | 5 | 2 |
| baemin | light | non-text | 4 | 2 | 0 | 0 |
| bezier | dark | text | 183 | 56 | 11 | 15 |
| bezier | dark | non-text | 41 | 10 | 4 | 1 |
| bezier | light | text | 183 | 58 | 9 | 15 |
| bezier | light | non-text | 41 | 18 | 9 | 1 |
| class101 | dark | text | 110 | 33 | 1 | 7 |
| class101 | dark | non-text | 16 | 7 | 1 | 4 |
| class101 | light | text | 110 | 44 | 2 | 7 |
| class101 | light | non-text | 15 | 7 | 3 | 3 |
| codeit | dark | text | 153 | 8 | 3 | 0 |
| codeit | dark | non-text | 31 | 18 | 2 | 0 |
| codeit | light | text | 153 | 33 | 2 | 0 |
| codeit | light | non-text | 31 | 19 | 1 | 0 |
| gmarket | dark | text | 137 | 21 | 0 | 9 |
| gmarket | dark | non-text | 11 | 4 | 0 | 3 |
| gmarket | light | text | 135 | 44 | 0 | 9 |
| gmarket | light | non-text | 11 | 6 | 0 | 3 |
| greeting | dark | text | 231 | 18 | 54 | 2 |
| greeting | dark | non-text | 99 | 59 | 0 | 0 |
| greeting | light | text | 231 | 82 | 9 | 2 |
| greeting | light | non-text | 99 | 77 | 4 | 0 |
| gs-retail | dark | text | 91 | 6 | 0 | 0 |
| gs-retail | dark | non-text | 16 | 9 | 0 | 0 |
| gs-retail | light | text | 92 | 18 | 0 | 0 |
| gs-retail | light | non-text | 16 | 14 | 0 | 0 |
| gs-shop | dark | text | 137 | 2 | 0 | 25 |
| gs-shop | dark | non-text | 30 | 3 | 0 | 8 |
| gs-shop | light | text | 136 | 30 | 2 | 24 |
| gs-shop | light | non-text | 30 | 7 | 0 | 8 |
| krds | dark | text | 138 | 1 | 0 | 5 |
| krds | dark | non-text | 18 | 7 | 0 | 1 |
| krds | light | text | 136 | 14 | 29 | 5 |
| krds | light | non-text | 17 | 5 | 0 | 1 |
| kyobobook | dark | text | 120 | 0 | 0 | 17 |
| kyobobook | dark | non-text | 13 | 5 | 0 | 1 |
| kyobobook | light | text | 120 | 30 | 0 | 17 |
| kyobobook | light | non-text | 13 | 5 | 3 | 1 |
| likelion | dark | text | 94 | 4 | 0 | 0 |
| likelion | dark | non-text | 22 | 15 | 0 | 0 |
| likelion | light | text | 94 | 39 | 0 | 0 |
| likelion | light | non-text | 22 | 15 | 7 | 0 |
| line-design-system | dark | text | 118 | 13 | 0 | 17 |
| line-design-system | dark | non-text | 41 | 16 | 0 | 3 |
| line-design-system | light | text | 116 | 50 | 17 | 17 |
| line-design-system | light | non-text | 42 | 34 | 0 | 3 |
| samsung-one-ui | dark | text | 62 | 0 | 0 | 1 |
| samsung-one-ui | dark | non-text | 25 | 9 | 6 | 3 |
| samsung-one-ui | light | text | 62 | 2 | 2 | 1 |
| samsung-one-ui | light | non-text | 25 | 18 | 1 | 3 |
| seed-design | dark | text | 144 | 3 | 1 | 3 |
| seed-design | dark | non-text | 33 | 15 | 1 | 2 |
| seed-design | light | text | 144 | 81 | 1 | 3 |
| seed-design | light | non-text | 31 | 16 | 8 | 2 |
| socar | dark | text | 161 | 67 | 0 | 9 |
| socar | dark | non-text | 20 | 7 | 0 | 2 |
| socar | light | text | 161 | 68 | 0 | 9 |
| socar | light | non-text | 18 | 7 | 0 | 2 |
| teamsparta | dark | text | 82 | 11 | 0 | 0 |
| teamsparta | dark | non-text | 12 | 3 | 0 | 3 |
| teamsparta | light | text | 82 | 21 | 14 | 0 |
| teamsparta | light | non-text | 12 | 3 | 0 | 3 |
| toss | dark | text | 196 | 13 | 0 | 16 |
| toss | dark | non-text | 27 | 13 | 0 | 0 |
| toss | light | text | 196 | 52 | 1 | 16 |
| toss | light | non-text | 27 | 18 | 1 | 0 |
| vapor-ui | dark | text | 130 | 16 | 0 | 3 |
| vapor-ui | dark | non-text | 22 | 17 | 0 | 0 |
| vapor-ui | light | text | 131 | 2 | 14 | 3 |
| vapor-ui | light | non-text | 22 | 11 | 1 | 0 |
| wanted | dark | text | 141 | 21 | 0 | 7 |
| wanted | dark | non-text | 18 | 5 | 0 | 2 |
| wanted | light | text | 141 | 52 | 3 | 7 |
| wanted | light | non-text | 18 | 8 | 0 | 2 |
| yeogi | dark | text | 74 | 11 | 4 | 3 |
| yeogi | dark | non-text | 14 | 7 | 0 | 2 |
| yeogi | light | text | 74 | 38 | 1 | 3 |
| yeogi | light | non-text | 13 | 6 | 0 | 2 |

합계는 **의도적으로 적지 않는다.** 동시에 열린 카탈로그 PR끼리 서로를 깨뜨리지 않으려면
숫자가 슬러그 단위여야 한다는 것이 이 저장소의 기존 결론이다(#324).

## 유보 사유

판정을 보류한 읽기의 내역이다. 한 행이 두 사유를 함께 가질 수 있다.

| 사유 | 건수 |
| --- | --- |
| gradient | 203 |
| pseudo-background | 140 |
| overlay | 42 |
| filter | 22 |
| inset-shadow | 4 |
| root-transparent | 4 |
| text-fill | 2 |

- `gradient` — 배경(또는 스택 중간의 어떤 층)이 `background-image`를 그린다. 한 점의 색이
  그 구간 전체를 대표하지 못한다.
- `pseudo-background` — 스택의 어떤 요소가 `::before`/`::after`로 배경을 칠한다.
  `document.elementsFromPoint`는 의사요소를 돌려주지 않으므로 존재만 감지하고 위치는 모른다.
- `overlay` — `pointer-events: none`인 칠해진 요소가 그 점을 덮거나, 텍스트 앞에 다른 요소가 있다.
- `root-transparent` — 스택 끝까지 불투명한 층을 만나지 못했다. 사이트 chrome이 라이트
  고정이므로 흰색으로 합성했고, 다크 테마에서 이 표시가 붙은 행은 그 자체로 별도 검토 대상이다.
- `text-fill` — `background-clip: text` 또는 `-webkit-text-fill-color`. 글리프 색이 `color`가 아니다.

완전히 가려진 텍스트는 유보가 아니라 **측정에서 빠진다.** "쟀지만 판정을 보류했다"와 "애초에
화면에 없었다"는 다른 상태다.

## 이슈 #359의 표 밖에서 나온 것

**samsung-one-ui의 `.btn-flat:hover` 라이트 4.04:1 2건.** 이슈가 적은 7행에 없고, `2ead71d`도
건드리지 않았다. 정지 상태에서는 기준을 넘고 hover에서만 떨어지므로, **hover를 재지 않는
측정으로는 보이지 않는다.** 수정은 이번 범위 밖이고 2단계 후보다.

| 슬러그 | 테마 | 상태 | 요소 | 텍스트 | 측정 / 기준 |
| --- | --- | --- | --- | --- | --- |
| samsung-one-ui | light | hover | `div.dlg-actions > button.btn.btn-flat` | 취소 | 4.04 / 4.5 |
| samsung-one-ui | light | hover | `div.cta-row > button.btn.btn-flat` | 건너뛰기 | 4.04 / 4.5 |

## 남은 오탐 유형

전수 표를 읽을 때 걸러야 하는 것들이다. 이번 범위에서 고치지 않았고, 2단계 게이트를 설계할 때
무엇을 제외할지의 입력이 된다.

- **단일 구분자 문자** — `•` `|` `·` `×` `›` 같은 장식 글리프가 연한 색으로 놓인 경우.
  WCAG는 텍스트 전반에 적용되지만, 이들은 `aria-hidden`을 붙이는 쪽이 맞는 대상이다.
- **클래스로만 표현한 비활성 시연** — 측정기는 `:disabled`와 `[aria-disabled="true"]`만
  예외로 빼므로, `.sl-disabled` 같은 클래스로 비활성을 그린 시연은 미달로 잡힌다.
  WCAG는 비활성 컴포넌트를 1.4.3·1.4.11 양쪽에서 제외한다.
- **투명도 상태 시연 라벨** — "Pressed 50%", "Hover 70%" 처럼 그 투명도 자체가 전시물인 경우.
- **비텍스트의 장식 부품** — 클릭 리플(`span.halo` 류)처럼 컴포넌트를 식별하는 경계가 아닌 표면.

표 안의 요소는 통째로 빠지지 않는다. `table`·`tr`·`td` 같은 **표 구조 상자만** 제외하고 그 안의
컨트롤은 잰다 — class101 의 관리자 표에는 텍스트 노드가 없는 체크박스 네 개가 들어 있어서,
표를 통째로 빼면 텍스트 패스로도 닿지 않는 컨트롤이 전수 조사에서 사라진다.

## 재현성

같은 커밋에서 3회 연속 측정했다.

| 회차 | 측정 행 | fail | borderline | 유보 | pass |
| --- | --- | --- | --- | --- | --- |
| 1 | 6425 | 1670 | 257 | 378 | 4120 |
| 2 | 6424 | 1669 | 257 | 378 | 4120 |
| 3 | 6424 | 1669 | 257 | 378 | 4120 |

텍스트만 떼어 보면 세 회차가 **정확히 같다**(measured 5371 · fail 1126). 흔들린 것은
`toss` 의 비텍스트뿐이고, 총합의 ±1 은 그 때문이다.

**텍스트 수치는 3회 모두 동일했다.** 흔들린 것은 비텍스트 쪽 한 항목뿐이며, 그 차이는 행
하나가 들어오고 나가는 수준이다. 이 사실이 2단계 래칫 형태를 가른다 — 텍스트는 정확값
비교를 견디지만, 비텍스트에 같은 방식을 쓰면 아무도 건드리지 않은 PR에서 CI가 깨진다.

## 다음 단계 제안

### 게이트를 어디에 둘 것인가

**`src/lib/preview-validator.ts` 안에는 넣을 수 없다.** 그 파일은 런타임 의존성을 갖지 않는
것이 정책이고(파일 상단 주석: 게이트가 devDependency 때문에 실패하지 않도록), 이 측정은
Chromium을 필요로 한다. 선택지는 별도 스크립트 + 별도 CI 잡뿐이다.

비용은 문제가 아니다 — **전수 1회가 약 25초**다. `ci.yml`의 `build` 잡에 단계를 더하거나
별도 잡으로 두거나 예산상 차이가 없다. 다만 CI 러너에 Chromium 설치 단계(`playwright install
chromium`)가 필요하고, 그것이 현재 CI에 없는 유일한 새 요소다.

### 초기 심각도

- **텍스트**: 슬러그별 양방향 정확값(`TOKEN_COVERAGE` 방식)이 가능하다. 3회 재측정에서
  변동이 없었고, 실패 메시지가 붙여넣을 줄을 출력하는 그 패턴이 그대로 맞는다.
  다만 초기값이 `fail` 1,031건이므로, 게이트로 바꾸기 전에 남은 오탐 유형(위 절)을 먼저
  제외 규칙으로 넣을지 결정해야 한다.
- **비텍스트**: 정확값 래칫은 부적합하다. 재현성이 ±1행이고, 무엇이 컴포넌트인지에 대한
  판단이 사람에게 남아 있다. 단방향 플로어(`MATCH_FLOOR` 방식)도 "미달이 줄었는지"를 묻는
  방향이 아니라 "측정이 여전히 닿는지"를 묻는 방향으로만 쓸 수 있다.
- 어느 쪽이든 **warn으로 시작**하는 것이 이 저장소의 기존 도입 방식과 맞는다.

### 발행색끼리의 경계선

samsung-one-ui의 라이트 강조 버튼은 4.51:1이다 — 발행된 `primary-dark` 위 흰 글자라 색을
옮기면 발행값을 버리게 되므로, 그 파일은 값을 고치지 않고 가드 주석을 달았다.

`borderline` 판정이 이런 사례를 위한 자리다. 다만 **이번 측정은 borderline 242건 중 몇 건이
발행색 쌍인지 가르지 못한다** — 그 판정은 각 슬러그의 `services/*.md`와 대조해야 알 수 있고,
그것은 2단계의 일이다. 게이트를 만들 때는 borderline을 막지 않되 목록으로 드러내고,
발행색 쌍임이 확인된 것만 명시적 면제로 옮기는 편이 `CLAUDE.md`의 프로비넌스 규약과 맞는다.

## Known gaps

- `<input placeholder>`·`value`·`<option>`의 텍스트는 텍스트 노드가 아니라 `TreeWalker`에
  잡히지 않는다. `::placeholder`도 재지 않는다.
- SVG 아이콘과 차트의 `fill`/`stroke` 대 배경(SC 1.4.11의 "그래픽 객체"), 포커스 링,
  켜짐↔꺼짐 두 상태 사이의 구분.
- `:focus` · `:active` · `:checked` 등 hover 외의 상태.
- `.card:hover .label` 처럼 hover 대상과 색이 바뀌는 요소가 다른 규칙. 측정기는 `:hover`로
  끝나는 복합 선택자만 강제한다.
- hover는 폭 976에서만 잰다. 폭마다 다른 hover 색은 `:hover`를 감싼 `@media`여야 하는데
  그런 프리뷰가 현재 없다.
- 외부 폰트 CDN을 차단한 상태의 줄바꿈. 색·글자 크기·굵기는 CSS가 정하므로 대비와 기준
  등급에는 영향이 없고, 줄이 바뀌는 위치만 달라진다.
- 중첩 `opacity`의 정확한 그룹 합성. 조상 체인의 곱으로 근사하고 해당 행에
  `opacity-approx`를 표시한다.
- **이모지만으로 이뤄진 텍스트는 재지 않는다.** 컬러 이모지는 자기 글리프 테이블
  (COLR/CBDT)에서 그려져 `color` 가 닿지 않으므로, 상속된 값을 재 봐야 화면과 무관하다
  (toss 의 케이크·사자가 1.37:1 로 잡혔다). 낱말이 섞인 줄은 잰다 — 그 낱말은 여전히
  색을 입은 텍스트다. 국기·키캡·피부색 수정자처럼 코드포인트 여러 개로 된 이모지도
  포함한다.
