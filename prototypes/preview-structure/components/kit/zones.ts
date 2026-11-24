// PROTOTYPE — throwaway code. The one list of fixed zones (STANDARD §1).
// The type of a zone id, the order the page is built in, the titles, and the
// contract check all read this list. Changing a zone means changing it here.

export const ZONES = [
  { id: "screens", title: "화면" },
  { id: "buttons", title: "버튼" },
  { id: "inputs", title: "입력" },
  { id: "selection", title: "선택" },
  { id: "navigation", title: "내비게이션" },
  { id: "content", title: "콘텐츠" },
  { id: "feedback", title: "피드백" },
  { id: "brand", title: "브랜드 고유" },
] as const

export type ZoneId = (typeof ZONES)[number]["id"]

export function zoneIndex(id: string): number {
  return ZONES.findIndex((z) => z.id === id)
}

export function zoneTitle(id: string): string | undefined {
  return ZONES.find((z) => z.id === id)?.title
}
