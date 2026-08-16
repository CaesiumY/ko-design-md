# toss caveat — 8개 컴포넌트 프로비넌스 대조

- 날짜: 2026-08-17
- 기준 커밋: `da62834`
- 발단: `2026-08-07-preview-prose-audit-false-positive-ledger.md` 및
  `2026-08-16-preview-prose-audit-rejection-recheck.md` §후속 — 프리뷰 산문 감사 계열의
  **마지막 열린 항목**
- 상위 규칙: `CLAUDE.md` §「프리뷰 산문 감사 — 판정 근거의 등급」

## 왜 열려 있었나

`#259`(toss·socar·11st 되돌리기)가 이 caveat 를 "기각이 유지된 1건" 으로 두면서 단서를
달았다:

> **다만 후속 검토감이다.** 이 caveat 는 8개 컴포넌트의 치수·변형을 싸잡아 "이 프리뷰의
> 재현" 으로 말하는데, 그중 일부는 번들이 실제로 발행한다. **충실한 전사를 창작으로
> 격하하는 것도 프로비넌스 오류다.** 8개를 전수 대조해 범위를 좁히는 것은 별도 작업으로
> 남긴다.

`#294`(기각 재검토)도 이 건을 유지로 확정하면서 같은 후속을 다시 적었다 — 되돌리기
문제가 아니라 **caveat 자체의 정밀화**라 성격이 다르기 때문이다.

## 결과 — 좁힐 대상이 없다. 8개 전부가 축자 전사다

`DesignSync` 프로젝트 `Toss Design System`(`019dd010-b4cf-7d7a-b1a9-7f63633fecff`)의
해당 파일 8개를 직접 읽어 프리뷰 캡션과 대조했다.

| 컴포넌트 | 프리뷰 캡션 | 번들 원문 |
| --- | --- | --- |
| Segmented Control | `pill 3-segments · underline tab` | `preview/segmented-control.html` 이 `PILL · 2 segments` · **`PILL · 3 segments`**(전체/입금/출금) · **`UNDERLINE · tab style`**(예금/적금/투자/대출) 셋을 싣고, 프리뷰가 보이는 것이 뒤 둘이다 |
| Search Field | `grey-100 resting → focus white + 1.5px blue` | `.field{…background:var(--tds-grey-100)}` · `.field.focus{background:#fff;border:1.5px solid var(--tds-blue-500)}` |
| Progress Bar | `8px track · brand / success / danger fill` | `.track{height:8px}` · `.fill.success{…green-500}` · `.fill.danger{…red-500}` |
| Rating | `5-star · half-fill · yellow-500 body` | 행마다 별 5개, half 는 `linearGradient` 50% 스톱, `fill="var(--tds-yellow-500)"` |
| Slider | `8px track · 28px thumb` | `.track{…height:8px…}` · `.thumb{width:28px;height:28px}` |
| Tooltip | `10px gap` | `/* Top tooltip — … 10px gap */` + `.tt.top{bottom:100%;margin-bottom:10px}` |
| Chip (filter chips) | `S 28 / M 34 / L 42` | `<div class="chip s">S · 28</div><div class="chip">M · 34</div><div class="chip l">L · 42</div>` |
| Bottom Sheet | `scrim 56% · radius 24 top · grey-300 handle bar` | `body::before{…rgba(0,0,0,0.56)}` · `.sheet{…border-radius:24px 24px 0 0}` · `.grab{width:36px;height:5px;…var(--tds-grey-300)}` |

**8/8 이 번들 원문과 일치한다.** 프리뷰가 지어낸 수치는 하나도 없다.

## 그래서 고친 것은 목록이 아니라 동사다

종전 caveat 는 두 가지를 말했다:

| 절 | 판정 |
| --- | --- |
| `md 가 싣지 않는 범위` | ✅ **참이다** — `#294` 가 컴포넌트별로 확인했다(md `### slider` 는 8px·28px 이 없고, `### progress-bar` 는 success/danger 변형이 없으며, `### chip` 은 34px 단일 높이만, `### tooltip` 은 10px gap 이 없다) |
| `이 프리뷰의 재현이에요` | ❌ **거짓이다** — 위 표대로 전부 전사다 |

그래서 참인 절은 두고 거짓인 절만 바꿨다:

```
종전  … md 가 싣지 않는 범위에서 이 프리뷰의 재현이에요
정정  … md 가 싣지 않아 카탈로그가 보증하지 않는 값이에요
```

**caveat 를 없애지 않은 이유**는 경고 자체가 유효하기 때문이다. 이 값들은 md 에 없고,
따라서 카탈로그의 검증 계층을 통과한 적이 없다. 독자에게 필요한 정보는 **"보증되지
않았다"** 이지 **"지어냈다"** 가 아니다.

## 번들을 이름으로 부르지 않았다

`핸드오프 번들에서 옮겼다` 로 적는 안을 검토했으나 채택하지 않았다.

`services/toss.md` 의 `sources` 11개는 전부 공개 출처다(`toss.tech` 기사 4건 ·
`tossmini-docs.toss.im` · `developers-apps-in-toss.toss.im` 2건 · `github.com/toss/tossface`
· `toss.im` 계열). **번들을 가리키지 않으므로 번들은 형제이지 상류가 아니다** —
`CLAUDE.md` 의 「번들이 상류인 것은 md 가 번들에서 나왔을 때뿐이다」 항.

그리고 이 저장소는 **프리뷰 산문이 내부 산출물을 이름으로 부르는 것을 이미 한 번
기각했다** — line-design-system 의 `타입 px·spacing 은 Claude Design 번들 재구성값입니다`
가 그 예이고, 기각 사유는 *"원본은 자신을 '번들' 이나 'Claude Design' 으로 부르지
않는다 — 정정 전 문구가 지목한 출처 이름 자체가 원본에 없다"* 였다.

## 공개 출처 확인은 하지 않았다 — 그리고 하지 않았다고 적는다

이 8개 값이 **토스가 실제로 발행한 것인지**는 확인하지 못했다. `.claude/cache/design-md/toss/`
는 크롤 코퍼스가 아니라 프리뷰 초안(`light.html`·`dark.html`)과 리뷰 JSON 이라 대조에
쓸 수 없고, `sources` 11개를 전수로 열지는 않았다.

**그래서 `공개 출처로 확인되지 않았다` 로도 적지 않았다** — 그건 확인하지 않은 부재
주장이고, 이 계열이 반복해 밟은 함정이다. `카탈로그가 보증하지 않는다` 는 **md 를 보면
그 자리에서 참거짓을 확인할 수 있는 서술**이라 그 조건을 만족한다.

## 남기는 교훈

**과잉 삭제만 오류가 아니다.** 이 계열은 "md 에 없으면 지운다" 라는 한 방향으로 오래
움직였고, 그 반대 방향 — **충실한 전사를 "이 프리뷰의 재현" 으로 격하하는 것** — 은
훨씬 늦게 보였다. 두 오류가 같은 뿌리에서 나온다: **프로비넌스를 확인하지 않고 단정하는 것.**

**caveat 도 주장이다.** 값이 아니라 값의 출처를 말할 뿐이지만 틀릴 수 있고, 틀리면
다음 감사가 그 격하를 정본으로 삼는다. `vapor-ui` 감사 메모를 *"뒷받침하지 않는다"* →
*"일부만 일치한다"* 로 좁힌 것(#293)과 같은 계열의 정정이다.

## 검증

```
validate:previews (toss)  0 blocking · 4 warn — 기준선 da62834 와 동일
편집은 캡션 한 줄 × 2 테마. 마크업·CSS·토큰 무변경
services/*.md 미변경 — check:last-updated 해당 없음
```
