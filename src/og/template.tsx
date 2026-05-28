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

// Logo sits next to the title (paired-with, not competing-with). 0.85×
// the title font keeps the mark slightly shorter than the cap height so
// it reads as a brand stamp rather than a glyph of equal weight. This
// scales automatically with `pickTitleStyle` — long Korean names that
// step the title down to 108px also shrink the logo to ~92px, preserving
// the same visual relationship across all catalog cards.
const LOGO_TO_TITLE_RATIO = 0.85

export function OgTemplate({
  breadcrumb,
  colophon,
  titleSegments,
  lede,
  logoDataUri,
}: OgTemplateProps) {
  const renderedTitle = titleSegments.map((s) => s.text).join("")
  // pickTitleStyle needs to know the logo is present so it can shrink the
  // title's usable-width budget — the logo eats ~159px (119px mark + 40px
  // gap), so a title that JUST fit at 140px without a logo could overflow
  // here. Passing hasLogo steps such cases down to the 108px compact style.
  const titleStyle = pickTitleStyle(renderedTitle, !!logoDataUri)
  const logoSize = Math.round(titleStyle.fontSize * LOGO_TO_TITLE_RATIO)

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
        {/* Logo + title — outer row keeps logo and title-box vertically
            centered, while the inner title-box preserves alignItems:
            "baseline" so mixed Hangul/Latin segments stay aligned on the
            glyph baseline. The logo is intentionally ~0.85× the title
            font (see LOGO_TO_TITLE_RATIO) so the brand mark pairs with
            the title instead of competing with it. */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {logoDataUri && (
            <img
              src={logoDataUri}
              width={logoSize}
              height={logoSize}
              style={{
                width: logoSize,
                height: logoSize,
                objectFit: "contain",
                marginRight: 40,
                // Satori uses Yoga, where flexShrink defaults to 0 — but
                // pinning it explicitly documents the intent and survives
                // any future Satori/Yoga default change. Without this, a
                // very long title could in theory squeeze the mark.
                flexShrink: 0,
              }}
            />
          )}
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
