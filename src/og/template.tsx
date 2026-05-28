import {
  CANVAS,
  COLORS,
  FONT_FAMILY,
  PADDING_BOTTOM,
  PADDING_TOP,
  PADDING_X,
  TYPE,
  pickTitleStyle,
} from "./tokens"

export interface BreadcrumbSegment {
  text: string
  brand?: boolean
}

export interface TitleSegment {
  text: string
  brand?: boolean
}

export interface OgTemplateProps {
  /** Top-row breadcrumb segments rendered with meta caps. */
  breadcrumb: Array<BreadcrumbSegment>
  /** Right-aligned colophon (e.g., "№ 001 / 2026.05"). */
  colophon?: string
  /** Title segments — supports brand-colored fragments (e.g., the "/" in ko/design.md). */
  titleSegments: Array<TitleSegment>
  /** Subtitle / lede paragraph below the title. */
  lede: string
  /** Base64 data URI for the brand logo. Rendered top-left when present. */
  logoDataUri?: string
}

const LOGO_SIZE = 32

export function OgTemplate({
  breadcrumb,
  colophon,
  titleSegments,
  lede,
  logoDataUri,
}: OgTemplateProps) {
  const renderedTitle = titleSegments.map((s) => s.text).join("")
  const titleStyle = pickTitleStyle(renderedTitle)

  return (
    <div
      style={{
        width: CANVAS.width,
        height: CANVAS.height,
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.background,
        fontFamily: FONT_FAMILY,
        paddingLeft: PADDING_X,
        paddingRight: PADDING_X,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          paddingTop: PADDING_TOP,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingBottom: 16,
          }}
        >
          {logoDataUri && (
            <img
              src={logoDataUri}
              width={LOGO_SIZE}
              height={LOGO_SIZE}
              style={{
                width: LOGO_SIZE,
                height: LOGO_SIZE,
                objectFit: "contain",
                marginRight: 20,
              }}
            />
          )}
          {breadcrumb.map((seg, i) => (
            <span
              key={i}
              style={{
                fontSize: TYPE.metaCaps.fontSize,
                fontWeight: seg.brand ? 700 : TYPE.metaCaps.fontWeight,
                letterSpacing: TYPE.metaCaps.letterSpacing,
                color: seg.brand ? COLORS.brand : TYPE.metaCaps.color,
                textTransform: TYPE.metaCaps.textTransform,
                marginRight: i === breadcrumb.length - 1 ? 0 : 18,
              }}
            >
              {seg.text}
            </span>
          ))}
          {colophon && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: TYPE.metaCaps.fontSize,
                fontWeight: TYPE.metaCaps.fontWeight,
                letterSpacing: TYPE.metaCaps.letterSpacing,
                color: TYPE.metaCaps.color,
                textTransform: TYPE.metaCaps.textTransform,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {colophon}
            </span>
          )}
        </div>

        <div style={{ height: 1, backgroundColor: COLORS.hairline }} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          paddingTop: 92,
          paddingBottom: PADDING_BOTTOM,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            ...titleStyle,
          }}
        >
          {titleSegments.map((seg, i) => (
            <span
              key={i}
              style={{
                color: seg.brand ? COLORS.brand : titleStyle.color,
                wordBreak: "keep-all",
              }}
            >
              {seg.text}
            </span>
          ))}
        </div>

        <span
          style={{
            marginTop: 36,
            fontSize: TYPE.lede.fontSize,
            fontWeight: TYPE.lede.fontWeight,
            letterSpacing: TYPE.lede.letterSpacing,
            color: TYPE.lede.color,
            lineHeight: TYPE.lede.lineHeight,
            wordBreak: "keep-all",
          }}
        >
          {lede}
        </span>
      </div>
    </div>
  )
}
