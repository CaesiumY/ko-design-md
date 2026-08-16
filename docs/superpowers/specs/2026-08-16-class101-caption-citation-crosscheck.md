# class101 캡션 11건 — `[src:N]` 전수 대조

- 날짜: 2026-08-16
- 기준 커밋: `e5d44c9`
- 선행: `2026-08-15-preview-prose-audit-class101.md`(#287) ·
  `2026-08-16-class101-md-spacing-provenance.md`(#289)
- 대장: `2026-08-07-preview-prose-audit-false-positive-ledger.md` — 이 작업이 그
  대장의 class101 잔여 항목을 닫는다
- 상위 규칙: `CLAUDE.md` §「인용은 존재가 아니라 내용 일치」

## 왜 했나

#287 은 캡션 12건 중 1건을 고치고 나머지 11건을 **"md 가 뒷받침한다"** 까지만 확인했다.
그것으로는 부족하다 — md 가 뒷받침한다는 것은 md 안에 같은 말이 있다는 뜻일 뿐이고,
그 md 문장이 자기 `[src:N]` 을 제대로 가리키는지는 별개다. **#289 의 `px={20}` 건이
정확히 그 틈에서 나왔다.**

그래서 11건이 기대는 md 문장마다 인용된 URL 을 직접 열어 원문을 확인했다.

## 결과 — 10건 통과 · 1건 인용 오귀속

| # | 캡션이 주장하는 것 | 인용 | 원문 |
| ---: | --- | --- | --- |
| 1 | primary 수렴 · 2차 잉크 반전 · 3차 반투명 워시 · loading/disabled | `[src:13]` `[src:19]` | ✅ `secondary: { backgroundColor: 'inverseSurface' }` · `tertiary: { backgroundColor: 'surface1', onColor: 'onView1' }` · props 에 `loading`·`disabled` |
| 2 | pill · selected · **`lineLimit` 말줄임** | `[src:20]` | ⚠️ **`lineLimit` 0건** — 아래 |
| 3 | 다이내믹 라벨 · clearable · error 시 보더+helper | `[src:14]` `[src:21]` | ✅ "입력창이 포커스 되었을 때 label이 애니메이션으로 동작됩니다" · `clearable` · `state?: 'default' \| 'error'` · `helperText` |
| 4 | 잉크 표면 · 존댓말 카피 · 짧은 액션 | `[src:22]` | ✅ `kind: default\|success\|error` · `title="커스텀 문구가 적용되었습니다"` · `buttonText="미리보기"` |
| 5 | 상태 4색 + container 틴트 + 내장 버튼 | `[src:24]` `[src:2]` | ✅ `kind: default\|informative\|error\|warning\|success` · `buttonText` · `errorContainer`/`successContainer`/`warningContainer`/`informativeContainer` |
| 6 | 현재 페이지 onView1 · 5%·10% 헤어라인 · default/dashed/thick | `[src:32]` `[src:38]` | ✅ "언제나 onView1" · `kind: dashed \| default \| thick` · `margin: lg\|md\|none` |
| 7 | 배지는 확장 팔레트 보조 악센트 · 스켈레톤 동일 사이즈 | `[src:3]` `[src:36]` | ✅ "ContainedButton, OutlinedButton과 동일한 사이즈를 갖습니다" 등 4회 |
| 8 | 적응형 다이얼로그 · Primary 없이 Secondary·Sub 불가 | `[src:25]` | ✅ "모바일에서는 바텀 시트로 그 이상의 뷰포트에서는 모달로 나타납니다" · "Primary 버튼없이 Secondary 버튼이나 Sub 버튼을 사용할 수 없으며" |
| 9 | `renderOpener` · 8px 오프셋 | `[src:26]` | ✅ props 표 `spacing` 기본값 **8** (#289 에서 실측) |
| 11 | `loop`·`snap`·`panelsPerView` 캐러셀 | `[src:45]` | ✅ `loop boolean false` · `snap boolean false` · `panelsPerView` · `panelWidth` |
| 12 | 선택·정렬·필터칩 · "새로고침"/"추가" · primaryContainer 틴트 | `[src:33]` `[src:34]` | ✅ `selectable`·`selectedRowKeys`·`expandedRowKeys`·`sortable` · 예제 라벨 `새로고침`·`추가` 축자 |

10번은 #287 에서 이미 고쳤다.

## 유일한 결함 — `lineLimit` 의 인용

md `:292` 가 이렇게 적었다:

> `size: md|sm`, `selected`, `startIcon/endIcon`, `lineLimit` 말줄임, `href` 를 지원한다 `[src:20]`

**`[src:20]`(FilterChip 공식 문서)의 프롭 표에 `lineLimit` 이 없다.** 표는
`size` · `selected` · `startIcon` · `endIcon` · `disabled` · `onClick` · `children` ·
`href` 여덟 개이고, 페이지 전문에서 `lineLimit` 등장 0건이다.

**그러나 `lineLimit` 은 실재한다.** MIT 저장소 `[src:4]` 에 있다:

```
packages/vibrant-components/src/lib/FilterChip/FilterChipProps.ts
  lineLimit?: ResponsiveValue<number>;

packages/vibrant-components/src/lib/FilterChip/FilterChip.tsx
  <Body … lineLimit={lineLimit} wordBreak={lineLimit ? 'break-all' : 'normal'}>

packages/vibrant-components/src/lib/FilterChip/FilterChip.stories.tsx
  <FilterChip … children={'Item 5 '.repeat(5)} lineLimit={1} />
  <FilterChip … children={'Item 6 is long '.repeat(20)} lineLimit={2} />
```

즉 **주장은 참이고 인용만 어긋났다.** 공식 문서가 프롭 표에 싣지 않은 프롭이라
문서만 보면 존재를 확인할 수 없다.

**이 방향이 중요하다.** 이 계열의 옛 감사였다면 "출처에 없다" 를 근거로 `lineLimit` 을
캡션에서 **지웠을 것**이다. 그러면 참인 주장이 사라지고, 다음 감사는 그 빈자리를
정본으로 삼는다. `CLAUDE.md` 가 「md 또는 상류 원본이 반증함」만 결함으로 인정하는
이유가 여기 있다 — **한 출처의 침묵은 다른 출처가 말하는 것을 지우지 못한다.**

### 고친 것

- `lineLimit` 을 `[src:20]` 열거에서 떼어내 `[src:4]` 로 옮기고, `FilterChipProps.ts` ·
  `FilterChip.stories.tsx` 라는 확인 지점을 문장에 적었다
- 종전에 `lineLimit=1` 시연을 `[src:9]`(Storybook 루트, JS 셸)로 가리켰는데
  **그 URL 로는 확인할 수 없다** — `[src:48]`(index.json)도 스토리 인덱스일 뿐
  `lineLimit` 0건이다. 시연의 소재인 `FilterChip.stories.tsx` 를 직접 가리키게 했고,
  거기 있는 `lineLimit={2}` 도 함께 실었다
- 프롭 표에 있는데 md 가 빠뜨린 `disabled` 를 열거에 더해 `[src:20]` 인용이 그 문서의
  표와 정확히 맞게 했다

**프리뷰 캡션은 고치지 않았다.** "긴 라벨은 `lineLimit` 말줄임으로 접습니다" 는 참이고
`[src:4]` 가 뒷받침한다.

## 감사 메모

`## Components` 첫머리에 `> **인용 전수 대조(2026-08-16).**` 하나를 넣었다. 이 절에는
기존 메모가 없었고, 대조 대상 11건이 전부 이 H2 안에 있다.

## 남기는 교훈

**공식 문서의 프롭 표는 전수가 아니다.** `lineLimit` 은 FilterChip 이 실제로 받는
프롭인데 표에 없다. 그러므로 **"공식 문서 프롭 표에 없다" 를 부재의 근거로 쓰면 안 된다** —
이 브랜드는 MIT 저장소가 공개돼 있어 `*Props.ts` 로 확인할 수 있다. 남은 카탈로그 항목을
감사할 때도 **문서 · 패키지 · 저장소 중 하나의 침묵을 전체의 침묵으로 읽지 말 것.**

**"md 가 뒷받침한다" 는 절반이다.** #287 이 11건을 그 기준으로 통과시켰고, 전수 대조에서
1건이 걸렸다. 비율로는 낮지만 걸린 것이 하필 **공식 문서에 없는 프롭**이라, 다음 감사가
문서만 보고 지울 위험이 가장 큰 항목이었다.

## 검증

```
validate:catalog    class101.md ok — 0 blocking · 0 warn (기준선 e5d44c9 와 동일)
tokens:check        17 sidecar(s) in sync
audit:oklch         0 token(s) mismatched
check:last-updated  1 changed file — 0 issue(s)
```
