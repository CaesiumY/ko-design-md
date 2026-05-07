import { BRAND, CANVAS, COLORS, FONT_FAMILY, PADDING_X, TYPE } from "./tokens"

export interface OgTemplateProps {
  title: string
  subtitle: string
}

export function OgTemplate({ title, subtitle }: OgTemplateProps) {
  return (
    <div
      style={{
        width: CANVAS.width,
        height: CANVAS.height,
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(135deg, ${COLORS.bgFrom} 0%, ${COLORS.bgTo} 100%)`,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          display: "flex",
          paddingLeft: PADDING_X,
          paddingRight: PADDING_X,
          paddingTop: 78,
          paddingBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: TYPE.topEyebrow.fontSize,
            fontWeight: TYPE.topEyebrow.fontWeight,
            letterSpacing: TYPE.topEyebrow.letterSpacing,
            color: TYPE.topEyebrow.color,
          }}
        >
          {BRAND.topEyebrow}
        </span>
      </div>

      <div
        style={{
          marginLeft: PADDING_X,
          marginRight: PADDING_X,
          height: 1,
          backgroundColor: COLORS.hairline,
        }}
      />

      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 24,
          paddingLeft: PADDING_X,
          paddingRight: PADDING_X,
        }}
      >
        <span
          style={{
            fontSize: TYPE.title.fontSize,
            fontWeight: TYPE.title.fontWeight,
            letterSpacing: TYPE.title.letterSpacing,
            color: TYPE.title.color,
            lineHeight: 1.05,
            wordBreak: "keep-all",
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: TYPE.subtitle.fontSize,
            fontWeight: TYPE.subtitle.fontWeight,
            color: TYPE.subtitle.color,
            lineHeight: 1.4,
            wordBreak: "keep-all",
          }}
        >
          {subtitle}
        </span>
      </div>

      <div
        style={{
          marginLeft: PADDING_X,
          marginRight: PADDING_X,
          height: 1,
          backgroundColor: COLORS.hairline,
        }}
      />

      <div
        style={{
          display: "flex",
          paddingLeft: PADDING_X,
          paddingRight: PADDING_X,
          paddingTop: 28,
          paddingBottom: 56,
        }}
      >
        <span
          style={{
            fontSize: TYPE.bottomEyebrow.fontSize,
            fontWeight: TYPE.bottomEyebrow.fontWeight,
            letterSpacing: TYPE.bottomEyebrow.letterSpacing,
            color: TYPE.bottomEyebrow.color,
          }}
        >
          {BRAND.bottomEyebrow}
        </span>
      </div>
    </div>
  )
}
