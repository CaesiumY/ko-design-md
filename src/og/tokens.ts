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

// Pick a title size based on rendered character count so long Korean service
// names don't overflow the 1040px content width at 140px.
export function pickTitleStyle(rendered: string) {
  return rendered.length > 14 ? TYPE.titleCompact : TYPE.title
}
