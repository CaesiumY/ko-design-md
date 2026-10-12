// Live preview theme: the Light / Dark switch re-themes the preview iframe in
// place (the iframe's <html data-theme>) and the choice survives a reload.
import type { Ui } from "../../../fixtures"

type PreviewContext = Pick<Ui, "frame" | "navigation" | "toggle">

export type PreviewTheme = "light" | "dark"

const BUTTON: Record<PreviewTheme, string> = {
  light: "Light theme",
  dark: "Dark theme",
}

// The iframe's title names the slug and the theme it was told to show.
function frameTitle(slug: string, theme: PreviewTheme): string {
  return `${slug} design preview (${theme})`
}

export async function 프리뷰_테마_확인(
  { frame, toggle }: PreviewContext,
  slug: string,
  theme: PreviewTheme
) {
  const other: PreviewTheme = theme === "light" ? "dark" : "light"
  await toggle.expectPressed(BUTTON[theme], true)
  await toggle.expectPressed(BUTTON[other], false)
  await frame.expectVisible(frameTitle(slug, theme))
  await frame.expectDocumentAttribute(
    frameTitle(slug, theme),
    "data-theme",
    theme
  )
}

export async function 프리뷰_테마_전환(
  ctx: PreviewContext,
  slug: string,
  theme: PreviewTheme
) {
  await ctx.toggle.press(BUTTON[theme])
  await 프리뷰_테마_확인(ctx, slug, theme)
}

export async function 새로고침_후_테마_유지(
  ctx: PreviewContext,
  slug: string,
  theme: PreviewTheme
) {
  await ctx.navigation.reload()
  await 프리뷰_테마_확인(ctx, slug, theme)
}
