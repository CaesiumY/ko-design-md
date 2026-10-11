// Home catalog: every entry is listed, and the category filter and search
// narrow the list. Expected rows always come from e2e/support/catalog.ts.
import { catalog, servicePath } from "../../../support/catalog"
import type { Page } from "@playwright/test"
import type { FormHelper } from "../../../helpers/FormHelper"
import type { LinkListHelper } from "../../../helpers/LinkListHelper"
import type { NavigationHelper } from "../../../helpers/NavigationHelper"
import type { ToggleButtonHelper } from "../../../helpers/ToggleButtonHelper"
import type { CategoryFacet } from "../../../support/catalog"
import type { ServiceDoc } from "../../../../src/lib/content-types"

interface HomeContext {
  page: Page
  form: FormHelper
  linkList: LinkListHelper
  navigation: NavigationHelper
  toggle: ToggleButtonHelper
}

const SEARCH_LABEL = "Search designs"
const ALL_CATEGORIES = new RegExp(`^전체 ${catalog.length}$`)

// Every link inside `main` is a catalog row — the header's links live in the
// banner landmark, outside it.
function rows(page: Page) {
  return { within: page.getByRole("main") }
}

function categories(page: Page) {
  // The sidebar (desktop) and the chip row (mobile) share this name; only the
  // one visible at the viewport width is in the accessibility tree.
  return { within: page.getByRole("navigation", { name: "카테고리" }) }
}

export async function 전체_목록_확인({ page, linkList, toggle }: HomeContext) {
  await toggle.expectPressed(ALL_CATEGORIES, true, categories(page))
  await linkList.expectHrefs(catalog.map(servicePath), rows(page))
}

export async function 카테고리로_거르기(
  { page, linkList, navigation, toggle }: HomeContext,
  facet: CategoryFacet
) {
  await toggle.press(facet.buttonName, categories(page))
  await navigation.expectSearchParam("cat", facet.category)
  await linkList.expectHrefs(facet.docs.map(servicePath), rows(page))
}

export async function 전체로_되돌리기({
  page,
  linkList,
  navigation,
  toggle,
}: HomeContext) {
  await toggle.press(ALL_CATEGORIES, categories(page))
  await navigation.expectSearchParam("cat", null)
  await linkList.expectHrefs(catalog.map(servicePath), rows(page))
}

export async function 검색하기(
  { page, form, linkList, navigation }: HomeContext,
  query: string,
  expected: Array<ServiceDoc>
) {
  await form.fillFields({ [SEARCH_LABEL]: query })
  await navigation.expectSearchParam("q", query)
  await linkList.expectHrefs(expected.map(servicePath), rows(page))
}

export async function 결과_없음_확인(
  { page, form, linkList, navigation }: HomeContext,
  query: string
) {
  await form.fillFields({ [SEARCH_LABEL]: query })
  await navigation.expectSearchParam("q", query)
  await linkList.expectEmpty("일치하는 항목이 없습니다.", rows(page))
}
