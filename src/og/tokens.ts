export const CANVAS = { width: 1200, height: 630 } as const

export const PADDING_X = 80

export const COLORS = {
  bgFrom: "#161513",
  bgTo: "#23201c",
  hairline: "#3a3530",
  textPrimary: "#f8f4ec",
  textMuted: "#bdb1a0",
  textCaption: "#a39884",
} as const

export const FONT_FAMILY = "Pretendard"

export const TYPE = {
  topEyebrow: {
    fontSize: 22,
    fontWeight: 500,
    letterSpacing: 3,
    color: COLORS.textCaption,
  },
  title: {
    fontSize: 92,
    fontWeight: 900,
    letterSpacing: -3,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: 500,
    color: COLORS.textMuted,
  },
  bottomEyebrow: {
    fontSize: 20,
    fontWeight: 500,
    letterSpacing: 2,
    color: COLORS.textCaption,
  },
} as const

export const BRAND = {
  topEyebrow: "CATALOG · KOREAN DESIGN — LLM CONTEXT",
  bottomEyebrow: "KOREAN EDITORIAL · SLEEK · COPY-FIRST",
} as const

export const DEFAULT_PAGE = {
  title: "ko/design.md",
  subtitle: "한국 서비스의 시그니처 디자인을 LLM 컨텍스트로",
} as const
