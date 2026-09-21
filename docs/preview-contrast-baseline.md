# 프리뷰 대비 기준선

이슈 [#359](https://github.com/CaesiumY/ko-design-md/issues/359). 카탈로그 21개 항목의
프리뷰를 라이트·다크로 렌더해 WCAG 2.x 대비를 전수 측정한 결과이고, **`pnpm gate:contrast`
가 대조하는 기록**이다. 아래 총계 표는 `src/lib/contrast-baseline.ts` 의 `BASELINE_TABLE`
과 바이트 단위로 같아야 하며(`contrast-baseline-corpus.test.ts` 가 강제한다), 그
어긋남을 CI 의 `contrast` 잡이 막는다.

**게이트가 막는 것은 수치의 움직임이지 개별 미달이 아니다.** 카탈로그는 아래 표대로
천 건이 넘는 미달을 싣고 있고 그것들은 승계된다. 막히는 것은 그 수가 달라졌을 때다 —
새로 생긴 미달도, 표를 갱신하지 않은 조용한 개선도 함께.

- 측정일: 2026-09-21 (KST)
- **수치의 정본은 CI(ubuntu, `fonts-noto-cjk`)다.** 로컬 값과 다를 수 있고, 그때는 CI 가
  맞다 — 외부 폰트 CDN 을 차단한 상태라 한글이 OS 폴백으로 그려지고, 판정은 줄바꿈된 런의
  가장 약한 줄이 정하므로 폴백이 다르면 그 줄이 달라질 수 있다.
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

- **텍스트 행은 래칫이다.** 오라클 10곳을 ±0.01로 재현하고, **같은 기계에서** 5회
  재측정하는 동안 텍스트 수치가 한 건도 흔들리지 않았다. 그래서
  `measured`·`fail`·`borderline`·`indeterminate` 네 열이 슬러그별 **양방향 정확값**으로
  강제된다. 기계가 바뀌면 달라진다 — 그래서 위에 적었듯 정본이 CI 다.
- **비텍스트 행은 래칫이 아니라 조사 목록이다.** SC 1.4.11은 "UI 컴포넌트와 그래픽
  객체"에 적용되는데, 어떤 표면이 컴포넌트인지는 의미 판단이고 이 카탈로그의 프리뷰는
  목업을 의도적으로 비시맨틱하게 만든다. 측정기는 "작고(뷰포트 면적 1% 미만) 자식이 둘
  이하이며 배경이나 1px 이상 보더를 가지고 **안에 텍스트가 없는** 요소"라는 형태
  휴리스틱으로 대상을 고르므로, 슬라이더 트랙처럼 진짜 논점인 것과 클릭 리플 장식처럼
  아닌 것이 같은 표에 섞인다. 그래서 비텍스트에서 강제되는 것은 `measured` **플로어**
  하나뿐이다 — 묻는 것이 "미달이 줄었는가"가 아니라 "측정이 아직 닿는가"다.
- **텍스트를 담은 컨트롤은 비텍스트 대상이 아니다.** 그 텍스트가 이미 SC 1.4.3 으로
  측정되고, 자기 라벨로 식별되는 컨트롤에는 별도 경계가 요구되지 않는다는 판단이다.
  라벨은 대개 한 겹 감싸여 있으므로(`<button class="chip"><span>전체</span></button>` 가
  이 카탈로그의 보통 모양이다) 직계 자식이 아니라 `textContent` 로 본다. 아이콘만 든
  버튼은 텍스트가 없으므로 그대로 측정된다. 이건 SC 1.4.11 의 한 가지 읽기이고, 경계
  자체에 3:1 을 요구하는 더 엄한 읽기도 가능하다 — 바꾸면 비텍스트 행 수가 움직이므로
  표를 함께 갱신해야 한다는 것이 그 변경의 비용이다.

**`measured` 는 행 수이고 `elements` 는 그 행들이 대표하는 요소 수다.** 쇼케이스 그리드는
CSS 규칙 하나 뒤에서 같은 컴포넌트를 반복하므로 모든 사본이 같은 값을 읽고 한 행으로
접힌다. **행**이 래칫의 단위다 — 카드를 하나 더 써도 프리뷰가 나빠지지 않고, 고칠 때 손대는
것은 규칙 하나다. 다만 행만으로는 그 결함이 화면을 얼마나 덮는지 알 수 없어서 요소 수를
함께 싣는다. 976px 에서 행 5873 개가 요소 11383 개를 대표하고, bezier 의 한 행은 요소
46 개를 대표한다.

**`텍스트` 열은 그 요소의 대표 문구이지 테마별 정확한 문구가 아니다.** 프리뷰는 다크 전용
산문을 `<template data-theme-op="swap">`으로 교체하므로 다크에서는 다른 텍스트 노드다.
행은 요소 경로와 측정값으로 접히므로, 다크 행에 라이트 쪽 문구가 실릴 수 있다.

**유보 사유는 판정이 기댄 줄의 것이다.** 줄바꿈된 텍스트는 줄마다 다른 배경 위에 앉을 수
있고, 판정은 그중 가장 약한 줄이 결정한다. 그 줄과 무관한 다른 줄의 사유는 붙지 않는다 —
합집합을 쓰면 한 줄이 나머지가 지지하는 판정을 보류시켜 실패를 숨긴다. 글꼴이 그라디언트로
칠해졌다거나 요소 자신에 필터가 걸렸다처럼 런 전체에 걸리는 사유는 어느 줄이 뽑히든 남는다.

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

**비율만으로는 고정되지 않는 경로도 함께 주장한다.** 위 앵커 열 개는 전부 판정이 나온
읽기라, 판정을 **보류하는** 분기와 fill·border 를 **비교하는** 분기가 그대로 남는다. 그래서
경로 앵커 넷을 따로 둔다 — 비율은 주장하지 않고, 주장이 경로 자체다. 기대값은 전부
fixture 의 markup·CSS 에서 나온다.

| 경로 앵커 | 고정하는 것 |
| --- | --- |
| `div.sl > span.halo` (양 테마) | 형제 `span.th` 가 같은 중심점을 덮으므로 `overlay` 로 **판정 보류** |
| 같은 요소 | 투명도가 `background` 의 `color-mix(…, transparent)` 에 있으므로 `opacityApprox` 는 **false** — `opacity` 속성으로 인한 근사와 구분된다 |
| `div.li.sel > span.radio.on` (양 테마) | border-color 와 background 가 같은 토큰이라 border 가 1.00 으로 갈리고 **fill 이 이긴다** — fill·border 를 둘 다 가진 유일한 요소 |

기존 비텍스트 앵커 셋에도 `basis` 를 붙였다. `.switch` 는 background 만, `.radio` 는 2px
border 만 선언하므로 후보가 각각 하나로 CSS 에서 확정된다.

**이 fixture 가 덮지 못하는 분기가 하나 있다.** 비텍스트의 **뒤쪽 층**에 필터·넓은 inset
그림자가 걸렸는지 보는 경로다 — samsung 파일에 그런 것이 없고, fixture 를 고치면 "결함이
이미 알려진, 손대지 않은 파일"이라는 유일한 권위가 사라진다. 덮으려면 필터를 쓰는 다른
프리뷰(toss 가 모든 버튼을 `filter: brightness(0.96)` 로 hover 한다)의 fixture 를 따로
커밋해야 한다.

여기에 더해 표본 두 건을 손으로 대조했다 — kyobobook `p.panel-note`는 `oklch(0.737 0.012 264)`
12px이 흰 카드 위에 있고(2.33:1), likelion의 태그 배지는 `oklch(0.69 0.209 42)` 12px 굵은
글씨가 `oklch(0.96 0.022 54)` 위에 있다(2.67:1). 둘 다 실제 미달이다.

## 슬러그별 총계

**이 표가 게이트가 대조하는 기록이다.** `src/lib/contrast-baseline.ts` 의 `BASELINE_TABLE`
이 같은 바이트를 들고 있고, 게이트의 실패 메시지가 뱉는 줄은 두 파일 **양쪽에 그대로**
붙는다.

| 열 | 게이트 |
| --- | --- |
| text 의 `measured` `fail` `borderline` `indeterminate` | **강제** — 슬러그별 양방향 정확값 |
| non-text 의 `measured` | **강제** — 플로어(기록값 −1 미만이면 block) |
| non-text 의 `fail` `borderline` `indeterminate` | 참고 — 어긋나면 warn 으로 출력만 |
| 양쪽의 `elements` | 참고 — 행이 래칫 단위이므로 카드 사본이 늘어도 막지 않는다 |

**참고 열은 갱신이 강제되지 않으므로 낡을 수 있다.** 마지막으로 전수 갱신한 것은
2026-09-21 이다. 게이트는 warn 행에도 붙여넣을 줄을 출력하므로, 낡은 것을 보면 그 줄로
갱신하면 된다.

새 항목은 자기 네 줄(라이트·다크 × 텍스트·비텍스트)을 여기와 `BASELINE_TABLE` 양쪽에
슬러그 순서대로 적는다. **수치는 CI 가 만든다** — `pnpm gate:contrast` 가 기록에 없는
슬러그의 네 줄을 그대로 출력하므로 그것을 붙여넣는다.

| slug | theme | kind | measured | elements | fail | borderline | indeterminate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 11st | dark | text | 95 | 183 | 12 | 0 | 12 |
| 11st | dark | non-text | 17 | 22 | 8 | 0 | 2 |
| 11st | light | text | 95 | 183 | 26 | 20 | 12 |
| 11st | light | non-text | 17 | 22 | 9 | 0 | 2 |
| baemin | dark | text | 94 | 178 | 9 | 0 | 2 |
| baemin | dark | non-text | 4 | 15 | 2 | 0 | 0 |
| baemin | light | text | 92 | 176 | 19 | 5 | 2 |
| baemin | light | non-text | 4 | 15 | 2 | 0 | 0 |
| bezier | dark | text | 183 | 370 | 56 | 11 | 15 |
| bezier | dark | non-text | 43 | 46 | 10 | 4 | 1 |
| bezier | light | text | 183 | 370 | 58 | 9 | 15 |
| bezier | light | non-text | 42 | 45 | 19 | 9 | 1 |
| class101 | dark | text | 110 | 184 | 33 | 1 | 7 |
| class101 | dark | non-text | 16 | 18 | 7 | 1 | 4 |
| class101 | light | text | 110 | 184 | 44 | 2 | 7 |
| class101 | light | non-text | 15 | 18 | 7 | 3 | 3 |
| codeit | dark | text | 153 | 255 | 8 | 3 | 0 |
| codeit | dark | non-text | 31 | 42 | 18 | 2 | 0 |
| codeit | light | text | 153 | 255 | 33 | 2 | 0 |
| codeit | light | non-text | 31 | 42 | 19 | 1 | 0 |
| gmarket | dark | text | 137 | 230 | 21 | 0 | 9 |
| gmarket | dark | non-text | 11 | 15 | 4 | 0 | 3 |
| gmarket | light | text | 135 | 228 | 44 | 0 | 9 |
| gmarket | light | non-text | 11 | 15 | 6 | 0 | 3 |
| greeting | dark | text | 231 | 664 | 18 | 54 | 2 |
| greeting | dark | non-text | 99 | 156 | 59 | 0 | 0 |
| greeting | light | text | 231 | 660 | 82 | 9 | 2 |
| greeting | light | non-text | 99 | 156 | 77 | 4 | 0 |
| gs-retail | dark | text | 91 | 185 | 6 | 0 | 0 |
| gs-retail | dark | non-text | 16 | 32 | 9 | 0 | 0 |
| gs-retail | light | text | 92 | 187 | 18 | 0 | 0 |
| gs-retail | light | non-text | 16 | 32 | 14 | 0 | 0 |
| gs-shop | dark | text | 137 | 273 | 2 | 0 | 25 |
| gs-shop | dark | non-text | 30 | 44 | 3 | 0 | 8 |
| gs-shop | light | text | 136 | 268 | 30 | 2 | 24 |
| gs-shop | light | non-text | 30 | 44 | 7 | 0 | 8 |
| krds | dark | text | 138 | 290 | 1 | 0 | 5 |
| krds | dark | non-text | 18 | 25 | 7 | 0 | 1 |
| krds | light | text | 136 | 282 | 14 | 29 | 5 |
| krds | light | non-text | 17 | 21 | 5 | 0 | 1 |
| kyobobook | dark | text | 121 | 231 | 0 | 0 | 16 |
| kyobobook | dark | non-text | 13 | 13 | 5 | 0 | 1 |
| kyobobook | light | text | 121 | 231 | 31 | 0 | 16 |
| kyobobook | light | non-text | 13 | 13 | 5 | 3 | 1 |
| likelion | dark | text | 94 | 198 | 4 | 0 | 0 |
| likelion | dark | non-text | 22 | 22 | 15 | 0 | 0 |
| likelion | light | text | 94 | 198 | 39 | 0 | 0 |
| likelion | light | non-text | 22 | 22 | 15 | 7 | 0 |
| line-design-system | dark | text | 118 | 259 | 13 | 0 | 17 |
| line-design-system | dark | non-text | 41 | 55 | 16 | 0 | 3 |
| line-design-system | light | text | 116 | 257 | 50 | 17 | 17 |
| line-design-system | light | non-text | 42 | 56 | 34 | 0 | 3 |
| samsung-one-ui | dark | text | 62 | 127 | 0 | 0 | 1 |
| samsung-one-ui | dark | non-text | 25 | 29 | 9 | 6 | 3 |
| samsung-one-ui | light | text | 62 | 127 | 2 | 2 | 1 |
| samsung-one-ui | light | non-text | 25 | 29 | 18 | 1 | 3 |
| seed-design | dark | text | 144 | 287 | 3 | 1 | 3 |
| seed-design | dark | non-text | 33 | 59 | 15 | 1 | 2 |
| seed-design | light | text | 144 | 287 | 81 | 1 | 3 |
| seed-design | light | non-text | 31 | 59 | 16 | 8 | 2 |
| socar | dark | text | 163 | 363 | 67 | 0 | 9 |
| socar | dark | non-text | 20 | 28 | 7 | 0 | 2 |
| socar | light | text | 163 | 363 | 68 | 0 | 9 |
| socar | light | non-text | 18 | 26 | 7 | 0 | 2 |
| teamsparta | dark | text | 82 | 114 | 11 | 0 | 0 |
| teamsparta | dark | non-text | 12 | 14 | 3 | 0 | 3 |
| teamsparta | light | text | 82 | 114 | 21 | 14 | 0 |
| teamsparta | light | non-text | 12 | 14 | 3 | 0 | 3 |
| toss | dark | text | 196 | 400 | 13 | 0 | 16 |
| toss | dark | non-text | 28 | 37 | 14 | 0 | 0 |
| toss | light | text | 196 | 400 | 52 | 1 | 16 |
| toss | light | non-text | 26 | 35 | 17 | 1 | 0 |
| vapor-ui | dark | text | 130 | 268 | 16 | 0 | 3 |
| vapor-ui | dark | non-text | 22 | 31 | 17 | 0 | 0 |
| vapor-ui | light | text | 131 | 271 | 2 | 14 | 3 |
| vapor-ui | light | non-text | 22 | 31 | 11 | 1 | 0 |
| wanted | dark | text | 141 | 257 | 21 | 0 | 7 |
| wanted | dark | non-text | 18 | 18 | 5 | 0 | 2 |
| wanted | light | text | 141 | 257 | 52 | 3 | 7 |
| wanted | light | non-text | 18 | 18 | 8 | 0 | 2 |
| yeogi | dark | text | 74 | 101 | 11 | 4 | 3 |
| yeogi | dark | non-text | 14 | 14 | 7 | 0 | 2 |
| yeogi | light | text | 74 | 101 | 38 | 1 | 3 |
| yeogi | light | non-text | 13 | 13 | 6 | 0 | 2 |

합계는 **의도적으로 적지 않는다.** 동시에 열린 카탈로그 PR끼리 서로를 깨뜨리지 않으려면
숫자가 슬러그 단위여야 한다는 것이 이 저장소의 기존 결론이다(#324).

## 유보 사유

판정을 보류한 읽기의 내역이다. 한 행이 두 사유를 함께 가질 수 있다.

| 사유 | 건수 |
| --- | --- |
| gradient | 203 |
| pseudo-background | 140 |
| overlay | 40 |
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
측정으로는 보이지 않는다.** 아직 고치지 않았고, 이 표에 승계돼 있다 — 고치면 게이트가
samsung 의 라이트 텍스트 줄을 갱신하라고 말한다.

| 슬러그 | 테마 | 상태 | 요소 | 텍스트 | 측정 / 기준 |
| --- | --- | --- | --- | --- | --- |
| samsung-one-ui | light | hover | `div.dlg-actions > button.btn.btn-flat` | 취소 | 4.04 / 4.5 |
| samsung-one-ui | light | hover | `div.cta-row > button.btn.btn-flat` | 건너뛰기 | 4.04 / 4.5 |

## 남은 오탐 유형

전수 표를 읽을 때 걸러야 하는 것들이다. **제외 규칙으로 넣지 않았고**(위 "오탐을 제외
규칙으로 넣지 않았다"), 그대로 세어 기준선에 승계돼 있다. 프리뷰가 `aria-disabled` 로
선언하는 식으로 줄어들면 게이트가 그 줄을 갱신하라고 말한다.

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

## 재현성 — 래칫 형태를 가른 실측

### 같은 기계 안에서

같은 커밋(99aae06)에서 로컬 5회 측정했다. **텍스트 수치는 다섯 회차가 정확히 같았다.**
흔들린 것은 `toss` 의 비텍스트 두 줄뿐이고, 관측 범위는 각 ±1행이다
(dark `measured` 26·27·28, light 25·26).

### 기계가 바뀌면

**달라진다. 그래서 정본을 CI 로 못박았다.** 같은 커밋을 Windows 로컬과 CI(ubuntu,
`fonts-noto-cjk`)에서 재니 84행 중 **11행**이 갈렸다. 갈린 슬러그는 여섯이고 전부 한글
산문이 많은 쪽이다 — baemin · gs-shop · kyobobook · socar, 그리고 이미 알려진 비텍스트
흔들림 둘(bezier · toss).

| 방향 | 움직인 열 |
| --- | --- |
| CI 가 더 많다 | `measured` +1~2 · `elements` +2~4 · `fail` +0~2 |
| 움직이지 않았다 | `borderline` · `indeterminate` — **84행 전부에서 동일** |

폰트 CDN 을 차단하므로 시스템 폴백이 곧 측정되는 글꼴이고, 줄바꿈 지점이 달라지면 한 런이
폭마다 다른 배경을 골라 **행이 갈라진다**(행 키에 비율이 들어가므로). 대비 자체가 달라진
것이 아니다 — 자기검사 23건은 CI 에서 전부 통과했고, 여기에는 4.51 경계선과 비율 앵커
열 곳이 그대로 들어 있다. 측정기는 같고 렌더가 다르다.

`borderline` 이 전 행에서 같다는 것이 아래 발행색 판정을 떠받친다.

원인은 **단 하나의 요소**다 — `div.loader-3 > span.dot`. `@keyframes tds-pulse` 가
`opacity` 를 0.28에서 돌리고 점 셋이 `animation-delay` 로 어긋나 있어, 수집기가 매번 다른
위상의 `opacity` 를 읽는다. Playwright 의 `reducedMotion: "reduce"` 가 이걸 고정하지
못하는 이유는 21개 프리뷰 중 `prefers-reduced-motion` 분기를 가진 것이 **3개뿐**이기
때문이다(samsung-one-ui · codeit · class101).

**애니메이션을 정지시키지 않는다.** 정지하면 모든 실행이 한 프레임에 합의하지만, 그
프레임이 통과 프레임인 애니메이션의 결함을 영원히 가린다 — 수집기가 이미 밝힌
"거짓 양성은 독자에게 한 줄, 거짓 음성은 설문의 존재 이유"와 반대 방향이다. 대신
`NON_TEXT_SLACK = 1` 이 흡수한다. 플로어가 행 하나를 봐주어도 그 존재 이유는 안 깎인다 —
수집기가 한 부류의 표면에 못 닿게 되면 행은 하나가 아니라 수십 개가 사라진다.

## 게이트

`pnpm gate:contrast` = `pnpm audit:contrast --check-baseline`. CI 의 **별도 `contrast` 잡**
이 돌린다. `build` 에 붙이지 않은 이유는 비용이 아니라(전수 1회 약 25초) Chromium 설치가
`build` 의 실패 표면을 넓히기 때문이다 — 브라우저 내려받기가 502를 내면 타입 검사 실패처럼
읽힌다.

`src/lib/preview-validator.ts` 안에는 넣을 수 없다. 그 파일은 런타임 의존성을 갖지 않는
것이 정책이고(게이트가 devDependency 때문에 실패하지 않도록), 이 측정은 Chromium 을
필요로 한다.

### exit code

| 0 | 통과 | | 1 | `--self-check` 실패 — 측정기 자체가 고장 | | 2 | 인자 오류 | | 3 | 기준선 어긋남 |
| --- | --- | --- | --- | --- | --- | --- | --- |

셋을 가르는 것이 요점이다. **측정기가 망가진 상태의 어긋남은 "수치가 움직였다"가 아니라
"수치를 못 잰다"** 이고, 로그가 둘을 같은 코드로 적으면 읽는 사람을 틀린 파일로 보낸다.
그래서 CI 는 셀프체크를 게이트보다 **먼저** 돌린다.

### 좁은 sweep 과는 비교하지 않는다

표는 전수 한 종류를 서술한다. `--slug`·다른 폭·한 테마·`--online` 과 함께 쓰면 exit 2 로
거부된다 — 닿지 못한 줄이 전부 "기록된 줄인데 측정되지 않음"으로 보고되어 카탈로그 전반의
회귀처럼 보이지만 실제로는 인자 실수다. `--json-out`·`--report-out`·`--verbose` 는 허용한다.

### 오탐을 제외 규칙으로 넣지 않았다

아래 "남은 오탐 유형" 네 가지는 **그대로 세어 기준선에 승계했다.** 넷 다 기계로 가르려면
게이트 안에 주관을 넣어야 하기 때문이다.

- `aria-hidden` 으로 거르는 것은 불가능하다. 이 카탈로그의 프리뷰는 의도적으로 비시맨틱한
  목업이라 samsung 의 토글이 `<span class="switch" aria-hidden="true">` 이고, 그 토글이
  바로 자기검사 앵커 둘이다. 거르면 안전망이 사라진다.
- 클래스명(`.sl-disabled`)·텍스트 내용(`"Pressed 50%"`)·부품명(`span.halo`) 판정은
  "무엇이 컴포넌트인가"를 게이트가 대신 정하는 것이다.
- 단일 글리프 제외는 `×` 닫기 버튼 라벨까지 면제해 **조용한 거짓 통과**를 만든다.

대신 정상 경로는 **프리뷰가 스스로 선언하는 것**이다. 수집기는 `:disabled` 와
`[aria-disabled="true"]` 를 이미 제외하므로, 클래스로만 그린 비활성 시연을 그렇게 선언하면
래칫이 내려가고 게이트가 그 줄을 갱신하라고 말한다. 그게 래칫이 작동하는 모습이다.

## 발행색끼리의 경계선 (2026-09-21)

`borderline` 은 두 가지를 한 이름으로 담는다 — 고치면 되는 것과, 색을 옮기면 **발행값을
버리게 되는** 것. 후자의 사례가 samsung 의 라이트 강조 버튼(4.51:1, 발행 `primary-dark`
위 흰 글자)이고, 그 파일은 값을 고치지 않고 가드 주석을 달았다.

전수의 `borderline` 257행을 `services/{slug}.md` frontmatter `colors:` 와 대조했다. 측정된
색 쌍이 이제 모든 읽기에 실리므로(`--json-out` 의 `fg`/`bg`, 리포트 표의 `색` 열) 기계로
가를 수 있다 — `readDefinitions` 로 발행 OKLCH 를 읽고 측정 hex 를 `hexToOklab` 으로
옮겨 `deltaE` 로 잰다. CI 의 `contrast` 잡이 그 JSON 을 아티팩트로 올리므로 재도출은
그것을 내려받아 같은 절차를 돌리면 된다.

**허용폭은 고르지 않고 데이터에서 읽었다.** 514개 색 읽기의 최근접 토큰 거리는 366개가
`d ≤ 0.002` 에 몰려 있고 **0.002와 0.005 사이가 정확히 비어 있다.** 그 아래가 8비트 양자화
폭 안의 토큰 일치이고 위는 토큰 근처이되 그 토큰이 아닌 색이다. 0.01로 느슨하게 잡으면
samsung 의 `#fdfdfd` 가 `white`(#fafafa)에 붙어 거짓 일치가 된다.

**결과: 257행 중 167행이 두 색 모두 발행 토큰인 쌍이다.**

| slug | 발행색 쌍 / borderline |
| --- | --- |
| 11st | 20 / 20 |
| baemin | 4 / 5 |
| bezier | 20 / 33 |
| class101 | 7 / 7 |
| codeit | 8 / 8 |
| greeting | 5 / 67 |
| gs-shop | 2 / 2 |
| krds | 29 / 29 |
| kyobobook | 3 / 3 |
| likelion | 7 / 7 |
| line-design-system | 17 / 17 |
| samsung-one-ui | 2 / 9 |
| seed-design | 11 / 11 |
| teamsparta | 14 / 14 |
| toss | 1 / 2 |
| vapor-ui | 15 / 15 |
| wanted | 2 / 3 |
| yeogi | 0 / 5 |

**이 수는 하한이다.** `fg` 는 배경 위에 합성된 값이고 `bg` 는 평탄화된 스택이라, 알파나
`opacity` 가 낀 표면은 **모든 입력이 발행 토큰이어도** 합성 결과가 어떤 단일 토큰과도 맞지
않는다. samsung 다크의 `#0381fe`(발행 `primary`, d=0.0004) × `#3a3a3a`(최근접
`black-dark` 가 d=0.2145로 멀다)가 그 모양이고, greeting 이 67행 중 5행인 것도 같은
이유로 보인다. 평면 집계로 "257행 중 167행이 못 고치는 것"이라 읽지 말 것.

### 게이트는 이것을 어떻게 다루나 — 면제 목록을 만들지 않는다

`borderline` 은 애초에 막히지 않는다. 그리고 텍스트의 `borderline` 수는 이미 양방향
정확값으로 고정돼 있어, 발행색 쌍이든 아니든 그 수가 움직이면 표를 갱신해야 한다.
그러므로 코드에 별도 면제 목록을 두면 **아무것도 막지 않는 것에 대한 예외 목록**이 된다.
판정은 이 절의 기록으로 남고, 재현 방법은 위 문단이 전부다.

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
- **겹침 판정이 페인트 순서를 보지 않는다.** `pointer-events: none` 인 칠해진 요소가 샘플
  점을 덮으면 `overlay` 로 유보하는데, 그 요소가 실제로는 텍스트보다 **뒤에** 그려지는
  장식이어도 같은 좌표를 차지하기만 하면 걸린다. 규모는 작다 — 42 회 페이지 렌더에서
  그런 후보가 통틀어 14 개였고(대부분 0, 최대 5), 위 표의 `overlay` 유보 대부분은 이
  경로가 아니라 실제 hit test 순서에서 왔다. 방향도 안전한 쪽이다(거짓 통과가 아니라 과잉 유보).
  래칫에 실린 `indeterminate` 열에 이만큼이 섞여 있다는 뜻이다.
- **이모지만으로 이뤄진 텍스트는 재지 않는다.** 컬러 이모지는 자기 글리프 테이블
  (COLR/CBDT)에서 그려져 `color` 가 닿지 않으므로, 상속된 값을 재 봐야 화면과 무관하다
  (toss 의 케이크·사자가 1.37:1 로 잡혔다). 낱말이 섞인 줄은 잰다 — 그 낱말은 여전히
  색을 입은 텍스트다. 국기·키캡·피부색 수정자처럼 코드포인트 여러 개로 된 이모지도
  포함한다.
