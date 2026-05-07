import type { Category } from "./content-types"

export interface CategoryStyle {
  /** English label for accessibility / search keywords. */
  label: string
  /** Korean display label, e.g. "결제". */
  koLabel: string
  /** Single Korean letter for catalog index marks, e.g. "ㄱ". */
  koIndex: string
}

const STYLES: Record<Category, CategoryStyle> = {
  finance: { label: "Finance", koLabel: "결제", koIndex: "ㄱ" },
  messenger: { label: "Messenger", koLabel: "메신저", koIndex: "ㄴ" },
  commerce: { label: "Commerce", koLabel: "커머스", koIndex: "ㄷ" },
  delivery: { label: "Delivery", koLabel: "배달", koIndex: "ㄹ" },
  mobility: { label: "Mobility", koLabel: "모빌리티", koIndex: "ㅁ" },
  content: { label: "Content", koLabel: "콘텐츠", koIndex: "ㅂ" },
  community: { label: "Community", koLabel: "커뮤니티", koIndex: "ㅅ" },
  travel: { label: "Travel", koLabel: "여행", koIndex: "ㅇ" },
  etc: { label: "Etc", koLabel: "기타", koIndex: "ㅈ" },
}

export function getCategoryStyle(category: string): CategoryStyle {
  if (category in STYLES) return STYLES[category as Category]
  return STYLES.etc
}
