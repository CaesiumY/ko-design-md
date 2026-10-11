// Service detail: the Live Preview / Tokens / DESIGN.md tabs, and the `?tab=`
// search param that makes each one linkable. Live Preview is the default and
// carries no param at all (a `tab` param marks the page noindex).
import type { NavigationHelper } from "../../../helpers/NavigationHelper"

interface DetailContext {
  navigation: NavigationHelper
}

/** Each tab, the value it writes to `?tab=` (null = no param). */
export const DETAIL_TABS = [
  { name: "Live Preview", param: null },
  { name: "Tokens", param: "tokens" },
  { name: "DESIGN.md", param: "md" },
] as const

export type DetailTab = (typeof DETAIL_TABS)[number]

export async function 탭_상태_확인(
  { navigation }: DetailContext,
  tab: DetailTab
) {
  await navigation.expectActiveTab(tab.name)
  await navigation.expectTabPanelVisible(tab.name)
  await navigation.expectSearchParam("tab", tab.param)
}

export async function 탭_전환(ctx: DetailContext, tab: DetailTab) {
  await ctx.navigation.clickTab(tab.name)
  await 탭_상태_확인(ctx, tab)
}
