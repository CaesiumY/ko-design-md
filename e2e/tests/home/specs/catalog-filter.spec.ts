import { expect, test } from "../../../fixtures"
import {
  bySlug,
  largestCategory,
  searchMatches,
} from "../../../support/catalog"
import {
  검색하기,
  결과_없음_확인,
  전체_목록_확인,
  전체로_되돌리기,
  카테고리로_거르기,
} from "../flows/catalog-filter-flows"

test.describe("홈 카탈로그", () => {
  test.beforeEach(async ({ navigation }) => {
    await navigation.open("/")
  })

  test(
    "카테고리를 누르면 그 카테고리 항목만 남고, 전체로 되돌릴 수 있다",
    { tag: ["@smoke"] },
    async ({ page, form, linkList, navigation, toggle }) => {
      const ctx = { page, form, linkList, navigation, toggle }
      await 전체_목록_확인(ctx)
      await 카테고리로_거르기(ctx, largestCategory())
      await 전체로_되돌리기(ctx)
    }
  )

  test("검색어가 이름·슬러그·소개에 걸리는 항목만 남는다", async ({
    page,
    form,
    linkList,
    navigation,
    toggle,
  }) => {
    const query = bySlug("toss").frontmatter.slug
    const expected = searchMatches(query)
    expect(expected.map((doc) => doc.frontmatter.slug)).toContain("toss")
    await 검색하기(
      { page, form, linkList, navigation, toggle },
      query,
      expected
    )
  })

  test("어디에도 걸리지 않는 검색어는 빈 목록 안내를 보인다", async ({
    page,
    form,
    linkList,
    navigation,
    toggle,
  }) => {
    const query = "e2e-일치하지-않는-검색어"
    expect(searchMatches(query)).toHaveLength(0)
    await 결과_없음_확인({ page, form, linkList, navigation, toggle }, query)
  })
})
