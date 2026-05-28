// Editorial Hangul OG tokens — mirror styles.css `:root` light-theme values.
// Hex equivalents are pre-computed because satori's CSS color parser does
// not handle oklch reliably across versions.

export const CANVAS = { width: 1200, height: 630 } as const

export const PADDING_X = 80
export const PADDING_TOP = 60
export const PADDING_BOTTOM = 80

export const COLORS = {
  background: "#ffffff",
  foreground: "#1c1c1c", // oklch(0.12 0 0)
  muted: "#636363", // oklch(0.40 0 0)
  brand: "#d33523", // oklch(0.55 0.22 30) — vermillion
  hairline: "#c8c8c8", // oklch(0.12 0 0 / 0.30) over white
} as const

export const FONT_FAMILY = "Pretendard"

export const TYPE = {
  metaCaps: {
    fontSize: 22,
    fontWeight: 500,
    letterSpacing: 4,
    color: COLORS.muted,
    textTransform: "uppercase" as const,
  },
  title: {
    fontSize: 140,
    fontWeight: 900,
    letterSpacing: -8,
    color: COLORS.foreground,
    lineHeight: 0.92,
  },
  titleCompact: {
    fontSize: 108,
    fontWeight: 900,
    letterSpacing: -6,
    color: COLORS.foreground,
    lineHeight: 0.92,
  },
  lede: {
    fontSize: 32,
    fontWeight: 500,
    letterSpacing: -0.5,
    color: COLORS.foreground,
    lineHeight: 1.4,
  },
} as const

// Korean glyphs render ~1.6x wider than Latin at the same Pretendard Black
// point size, so a flat character count over-estimates how much of the
// 1040px content column a title will actually eat. Weighting CJK code
// points before the threshold check keeps short Korean names at the
// larger 140px size while stepping down before titles like
// "야놀자모텔체크인" (8 glyphs ≈ 13 Latin-equiv) overflow.
const TITLE_WIDTH_BUDGET = 14
// When a brand logo sits next to the title (see template.tsx), the title's
// usable width shrinks by ~159px (logo ~119px + 40px gap) out of the 1040px
// content column — about 15%. Drop the budget by the same proportion
// (14 × 0.85 ≈ 12) so titles that JUST fit without a logo get stepped
// down to the 108px compact style when a logo is present, preventing
// silent overflow / wrap. The 108px case shrinks logo to ~92px so the
// math works out to roughly the same ratio there too.
const TITLE_WIDTH_BUDGET_WITH_LOGO = 12
const CJK_WIDTH_FACTOR = 1.6

function titleWidthScore(rendered: string): number {
  let score = 0
  for (const ch of rendered) {
    score += /[ㄱ-ㆎ가-힣]/.test(ch) ? CJK_WIDTH_FACTOR : 1
  }
  return score
}

// Pick a title size based on weighted character width so long Korean service
// names don't overflow the 1040px content width at 140px. Pass
// `hasLogo: true` when the brand mark is rendered on the same row as the
// title so the budget accounts for the reduced usable width.
export function pickTitleStyle(rendered: string, hasLogo = false) {
  const budget = hasLogo
    ? TITLE_WIDTH_BUDGET_WITH_LOGO
    : TITLE_WIDTH_BUDGET
  return titleWidthScore(rendered) > budget
    ? TYPE.titleCompact
    : TYPE.title
}
