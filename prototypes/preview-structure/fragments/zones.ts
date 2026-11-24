// PROTOTYPE — "fragments" structure (ticket 729). The ONE place that says which
// zones a preview may have, in which order, under which title (STANDARD §1).
// The assembler emits zones in this order and the promise check holds the
// served HTML to it. An item never lists zones itself: it only has one fragment
// file per zone it draws (`preview-src/{slug}/zones/{id}.html`).

export interface Zone {
  id: string
  title: string
}

/** The hero has no title and no cells; it is always first. */
export const HERO_ID = "hero"

export const ZONES: ReadonlyArray<Zone> = [
  { id: "screens", title: "화면" },
  { id: "buttons", title: "버튼" },
  { id: "inputs", title: "입력" },
  { id: "selection", title: "선택" },
  { id: "navigation", title: "내비게이션" },
  { id: "content", title: "콘텐츠" },
  { id: "feedback", title: "피드백" },
  { id: "brand", title: "브랜드 고유" },
]

/** Zones whose fragment every item must have. */
export const REQUIRED_ZONES: ReadonlyArray<string> = [HERO_ID, "screens"]

export const DISCLAIMER_HTML =
  '<div class="catalog-disclaimer" role="note"><b>ko/design.md 카탈로그 프리뷰</b> — 이 카탈로그는 어떤 브랜드와도 제휴·후원 관계가 없습니다. 이 화면은 공식 배포본이 아닌 공개 자료 기반 비공식 재현이며, 표시된 상품·가격·평점·거래·채용 정보는 레이아웃 시연용 더미 데이터입니다.</div>'

/** Where things live, relative to the repository root. */
export const SRC_ROOT = "preview-src"
export const FRAME_CSS = "prototypes/preview-structure/frame.css"
export const ZONES_FILE = "prototypes/preview-structure/fragments/zones.ts"
export const ASSEMBLER_FILE =
  "prototypes/preview-structure/fragments/assemble.ts"
