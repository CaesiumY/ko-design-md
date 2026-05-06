import type { Category } from "./content-types"

export interface CategoryStyle {
  label: string
  coverGradient: string
}

const STYLES: Record<Category, CategoryStyle> = {
  finance: { label: "Finance", coverGradient: "from-blue-500 via-indigo-500 to-cyan-400" },
  messenger: { label: "Messenger", coverGradient: "from-yellow-300 via-amber-400 to-orange-300" },
  commerce: { label: "Commerce", coverGradient: "from-emerald-500 via-teal-500 to-emerald-300" },
  delivery: { label: "Delivery", coverGradient: "from-orange-500 via-rose-500 to-amber-300" },
  mobility: { label: "Mobility", coverGradient: "from-indigo-600 via-violet-500 to-fuchsia-400" },
  content: { label: "Content", coverGradient: "from-rose-500 via-pink-500 to-fuchsia-400" },
  community: { label: "Community", coverGradient: "from-fuchsia-500 via-purple-500 to-indigo-400" },
  travel: { label: "Travel", coverGradient: "from-sky-500 via-cyan-500 to-blue-400" },
  etc: { label: "Etc", coverGradient: "from-zinc-600 via-zinc-500 to-zinc-400" },
}

export function getCategoryStyle(category: Category): CategoryStyle {
  return STYLES[category] ?? STYLES.etc
}
