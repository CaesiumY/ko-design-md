# 프리뷰 산문 감사 5차 — toss (미감사 슬러그 1/12)

그리팅이 산문(#220 · #232)과 마크업(#233)까지 끝나면서 감사 계열은 **미감사 슬러그
12개**로 넘어간다. 전수 실측 결과 **서술 표면 327개**가 남아 있고 8~10개 PR 분량이다.

첫 대상은 **toss** 다 — 표면 54개로 최대(다음은 line-design-system 42), 캡션이 정밀
수치로 밀집해 있고(`8px track · 28px thumb` · `S 28 / M 34 / L 42` · `320ms ease`),
카탈로그에서 가장 많이 열리는 항목이라 오류 비용이 크다.

이 계열이 지키는 규칙은 하나다 — **프리뷰 산문이 `services/*.md` 가 뒷받침하지 않는
주장을 하지 않는다.** `validate:catalog` 는 md 의 `[src:N]` 만 검사하고 프리뷰 산문은
어떤 기계 검사도 받지 않으므로 이 대조는 사람이 한다.

## 대조 결과 — 7개 표면 정정

`origin/main`(`584f363`) 기준. **판정 단위는 표면**이다.

| 유형 | 수 | |
| --- | --- | --- |
| md 와 충돌 | 2 | `pill 3-segments` · `PALETTES 10 families` |
| md 에 없는 변형 주장 | 1 | `CHIP … removable` |
| 다크 재현을 시스템 사실처럼 서술 | 3 | 히어로 2문장 · `STATE pressed` |
| 재현임을 밝히지 않음 | 1 | NEW 섹션 캡션 |

**정정 0건인 자리가 훨씬 많다.** Search Field · Rating · Tooltip · Bottom Sheet ·
list-row amount · 섹션 `h2` 6개 · 컴포넌트 이름 16개 · 그리드 라벨 17개가 전부 md 와
일치한다. 0건은 정당한 결과이고, 억지로 고치면 근거 있는 서술을 무근거로 대체하게 된다.

## 이번 감사의 핵심 — 같은 캡션 안에서 "0건"이 정반대로 갈렸다

`comp-caption`: `scrim 56% · radius 24 top · grey-300 handle bar`

| 값 | 리터럴 grep | 실제 |
| --- | --- | --- |
| `56%` | md **0건** | ✅ md:126 `bg-overlay: oklch(0.000 0.000 0 / 0.56)` |
| `radius 24` | md **0건** | ✅ md:440 `20~24px top corner radius` |

**계획 단계에서 `radius 24` 를 결함으로 지목했었다.** `## Rounded` 의
`radius-2xl: 20 # sheets, dialogs` 만 보고 "용도 매핑이 한 단계 어긋났다" 고 적었는데,
`### bottom-sheet` 절이 범위를 직접 싣고 있었다.

**교훈 둘:**

1. **리터럴 grep 0건은 근거가 아니다.** 퍼센트↔알파(`56%` ↔ `/ 0.56`) · 한↔영
   (`앱인토스` ↔ `APPS IN TOSS`) · 사이즈 문자↔수치(`XL/L/M/S` ↔ `16/14/12/10`)가
   이 슬러그에서 상시 발생한다.
2. **토큰 표보다 컴포넌트 절이 우선이다.** 표는 기본값을, 절은 그 컴포넌트의 실제
   범위를 싣는다.

## 정정 문구가 다크에서 거짓이었다 — 이 계열에서 처음

`pill`(md 무근거)을 걷어내며 넣은 `white selected segment` 는 **라이트에서만 참**이다.
다크 `.seg .it.active` 는 `--tds-white` 가 아니라 `--tds-grey-200`
(`oklch(0.270 0.030 255)`, 짙은 슬레이트)이라 **캡션이 말하는 것을 그리지 않았다.**

**이게 모든 자동 검증을 통과했다:**

- 양 테마에 **같은 문자열**을 넣었으므로 테마 분기 10 → 10, 변화 없음
- 4폭 × 2테마 오버플로 0
- `validate:previews` 0 blocking

H-4 가 "분기 없음 ≠ 옳음" 을 배웠는데, 이번엔 그 원리가 **내가 만든 결함** 쪽에서
재현됐다. 커밋 전 서브에이전트 리뷰가 잡았다.

**교훈: 정정 문구는 md 만 보고 쓰면 안 된다.** md 는 라이트 카노니컬 값만 싣는다
(md:651 이 그 사실을 명시한다). **양 테마의 실제 CSS 를 함께 봐야** 한다.

## md 가 유보를 *명시* 하면 정정이 싸진다

toss `## Known Gaps`(md:651)는 이렇게 적는다:

> 핸드오프 번들은 light 모드 카노니컬 hex만 제공한다. 다크 모드 전환 시 각 semantic
> alias의 base 참조 변화는 공개되지 않았으며 … 다크 alias 전체 테이블은 surface되지
> 않았다 [src:3].

그리팅의 `gray25` 건은 md 가 침묵해서 "라이트 1280×900만 실측했다" 로부터 한 단계
추론해야 했다. toss 는 md 가 직접 말하므로 **정정 문구의 출처가 md 자신**이 된다 —
H-1 에서 "무출처 주장을 지우는 커밋이 무출처 주장을 새로 만든" 실패를 구조적으로 막는다.

**다음 슬러그를 고를 때 `## Known Gaps` 를 먼저 읽으면 어떤 정정이 값싼지 미리 안다.**

## 남긴 것 중 판단이 갈린 자리

- **NEW 섹션의 재현 표기를 카드마다 붙이지 않고 섹션 캡션에 한 번 붙였다.** 대상이
  6개(`8px track` · `28px thumb` · `S 28 / L 42` · `10px gap` · `grey-300 handle bar` ·
  progress-bar `success / danger`)라 카드마다 고치면 편집이 커지고, 그때마다 새 문구를
  쓰는 만큼 무출처 주장을 새로 만들 위험도 커진다. **다만 우산이 실제 재현 범위보다
  좁을 수 있다** — 초판은 "치수" 로만 썼다가 변형 주장(progress-bar 의 success/danger)이
  안 덮여 "치수와 변형" 으로 넓혔다.
- **다크 재현값 중 4곳은 손대지 않았다** — `focus near-black`(2) · `TOAST grey-200` ·
  tooltip `grey-200` · `scrim 64%`. 히어로 문장이 개념적으로 덮고 `TOAST` 는 자기표시
  `(다크)` 가 있다. 히어로 우산의 범위가 이들까지 닿는지는 **리뷰가 볼 문제로 남긴다.**
- **`TEXT-BUTTON · default / neutral / disabled`** — 라벨은 3종인데 렌더는 danger 포함
  4개이고 md:519 에 danger 변형이 없다. 라벨 자체가 거짓은 아니라(적게 말할 뿐) 이번엔
  두었다.
- **인라인 탭 언더라인 색** — md:519 는 `2.5px {colors.fill-brand}` 인데 양 파일 모두
  `grey-900` 이다. **캡션이 색을 주장하지 않으므로 산문 결함이 아니다** — 마크업 문제라
  산문 PR 에서 손대지 않았다(#233 과 같은 이유).

## 표면 목록 — 이번에도 빠진 게 있었다

계획서가 잡은 목록에 `row-label`(각 파일 10곳)과 `hero-meta` 의 label/value 6쌍이
없었다. **정정 7건 중 3건이 바로 그 두 표면에서 나왔다**(`PALETTES` · `STATE` · `CHIP`).

계획서가 `sub` 11곳을 목업이라 제외한 판단은 맞았다(`토스뱅크 · 1234` 같은 거래 내역).
`text-meta-caps` 18곳을 "산문이 아니라 이름 라벨" 로 보고 일괄 1회 확인한 것도 맞았다 —
17개 전부 md 에 있었다.

**계수가 다섯 번 연속 작았다** — H-1 172(단위 오류) · H-2 krds 4→30 · H-3 36→93 ·
H-4 49→그 이상 · 이번 25→28. 매번 원인이 다르다.

## 검증

- 게이트 — `typecheck` · `lint` · `test`(**427**) · `validate:previews`(toss
  **0 blocking**, warn 4는 기준선과 동일한 레이아웃 가드) · `tokens:check`(17 sidecar
  in sync) · `audit:oklch`(0 mismatched) · `validate:catalog`(17 files, 0 blocking).
- `check:last-updated` — `no services/*.md changed`. **md 를 건드리지 않았다.**
- 육안 — 4폭(375 · 768 · **976** · 1440) × 2테마 8조합에서
  `documentElement.scrollWidth - clientWidth == 0`.
- **테마 분기 10 → 11.** 늘어난 하나는 다크 Segmented Control 캡션이고 의도한 것이다 —
  히어로 · STATE 는 원래도 분기였고 문구만 바뀌었다.
- **렌더 확인** — 다크 `.seg .it.active` 의 계산 배경색이 `oklch(0.27 0.03 255)`,
  라이트가 `oklch(1 0 0)` 임을 브라우저에서 직접 읽어 각 캡션과 대조했다.

## 범위 밖

- **나머지 미감사 슬러그 11개** — line-design-system 42 · class101 33 · 11st 29 ·
  baemin 28 · codeit 24 · gmarket 24 · vapor-ui 23 · yeogi 23 · teamsparta 19 ·
  kyobobook 15 · bezier 13. **seed-design 제외**(#209).
  `line-design-system` 의 `class="drawer"`(#233 이 남긴 항목)는 그 슬러그 차례에 판단한다.
- **toss 마크업** — 인라인 탭 언더라인 색(위) · `.pb-track.l` 이 12px 인데 캡션은
  `8px track` 인 점.
- **#222**(`swatchFillCount` 줄 단위 스캔 우회 — 실측 30 → 0, 거짓 통과) ·
  **#214** · **#202** · **#187** · 묶음 **C**(로고 6개) · **F 잔여** · **G**.
- **Codex 리뷰가 쿼터 소진으로 빠진 상태다** — 이 PR 도 claude 리뷰 봇 단독 검토다.
