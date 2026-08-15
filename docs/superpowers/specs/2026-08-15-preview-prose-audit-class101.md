# 프리뷰 산문 감사 — class101 (Vibrant Design System)

- 날짜: 2026-08-15
- 대상: `public/preview/class101/{light,dark}.html`
- 기준 커밋: `5040a67`
- 상위 규칙: `CLAUDE.md` §「프리뷰 산문 감사 — 판정 근거의 등급」

## 이 슬러그는 번들이 상류가 아니다

착수 전에 상류를 확인하다 규칙의 구멍을 찾아 먼저 고쳤다(#286). `class101` 의 md 는
**번들을 한 번도 언급하지 않는다** — sources 48개가 전부 공개 출처이고 인용이 190개다:

- `vibrant-design.com` 공식 문서
- npm `@vibrant-ui/theme@0.94.37` (색 토큰 34개를 ΔE ≤ 0.02 로 실측 대조한 감사 메모가
  md `:78` 에 이미 있다)
- `github.com/pedaling/opensource` — **MIT 오픈소스 모노레포**
- `vibrant-storybook.class101.dev`

`DesignSync` 에 class101 프로젝트가 둘 있으나 **상류가 아니다.** 번들 README 가
스스로를 *"a faithful recreation of CLASS101's open-source Vibrant Design System"*
이라 적고, 출처로 크롤 코퍼스 58쪽 · 라이브 문서 · 오픈소스 저장소를 든다. **번들과
md 가 같은 공개 출처에서 갈라진 형제**다.

**그러므로 판정은 공개 문서·오픈소스 코드로 한다.**

## 대상 — `.cell-cap` 12개

컴포넌트 셀마다 하나씩 붙는 캡션이 실질적 주장을 담는 유일한 산문 표면이다
(`.text-meta-caps` 13개는 섹션 라벨, `.callout-body`·`.toast-title` 은 데모 카피).

**캡션이 쓴 API 이름 12개가 전부 md 에 실재한다** — `lineLimit` · `renderOpener` ·
`ScrollTabsLayout` · `ViewPagerTabGroup` · `panelsPerView` · `onView1` ·
`primaryContainer` · `clearable` · `dashed` · `thick` · `loop` · `snap`. 즉 이 슬러그에는
**"md 에 없음" 유형이 애초에 없다.**

## 결함 1건 — 공개 출처가 반증한다

| | |
| --- | --- |
| 표면 | Tabs 셀 `.cell-cap` (양 테마) |
| 종전 | `… 두 레이아웃이 같은 탭 바 문법과 **콘텐츠 패딩(px 20)을 공유합니다.**` |
| 정정 | `… 두 레이아웃이 같은 탭 바 문법을 공유합니다.` |

md `:484`·`:485` 가 두 컴포넌트 문서를 각각 `[src:46]`·`[src:47]` 로 싣는다. **둘 다
직접 열었다:**

- `…/scroll-tabs-layout/` — `<Paper height={200} **p={20}** backgroundColor="primaryContainer">`
- `…/view-pager-tab-group/` — `<HStack **p={12}** width="100%" height={200}>`

**패딩이 다르므로 "공유합니다" 가 성립하지 않는다.** 게다가 `p={20}` 은 사방 패딩이지
캡션이 쓴 `px`(좌우)가 아니고, 레이아웃 규칙이 아니라 데모 `Paper` 의 값이다.

> **md `:485` 의 출처 설명도 정확하지 않다** — `[src:47]` 을 "ViewPagerTabGroup
> 문서(콘텐츠 패딩 예시)" 라 적는데 그 문서의 패딩 예시는 `p={12}` 다. 이 PR 은 프리뷰만
> 고치고 md 는 손대지 않았다 — 별건이다.

## 나머지 11건 — 이번 라운드에서 반증되지 않았다

전부 md 가 뒷받침하고 컴포넌트 귀속도 어긋나지 않는다. 예: Pagination 셀 캡션이
`default · dashed · thick` 헤어라인을 함께 설명하는데, md `:371` 이
`Divider(default|dashed|thick × margin none|md|lg)` `[src:38]` 로 싣고 셀도 두 컴포넌트를
같이 보인다 — 오귀속이 아니다.

**다만 "md 가 뒷받침한다" 로 끝이 아니다.** 이 문서의 「인용은 존재가 아니라 내용 일치」
원칙상 각 `[src:N]` 을 열어 봐야 완결된다 — 위 `px 20` 건이 정확히 그렇게 나왔다.
**11건의 공개 출처 대조는 후속으로 남긴다.**

## 검증

```
validate:previews (class101)  0 blocking · 0 warn — 기준선과 동일
```

편집은 캡션 문자열 한 줄(양 테마)뿐이다.
