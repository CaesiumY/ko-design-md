import { test } from "../../../fixtures"
import { bySlug, servicePath } from "../../../support/catalog"
import {
  새로고침_후_테마_유지,
  프리뷰_테마_전환,
  프리뷰_테마_확인,
} from "../flows/preview-theme-flows"

const toss = bySlug("toss")
const SLUG = toss.frontmatter.slug

test.describe("라이브 프리뷰 테마", () => {
  test(
    "다크로 바꾸면 프리뷰가 다크가 되고, 새로고침해도 유지된다",
    { tag: ["@smoke"] },
    async ({ frame, navigation, toggle }) => {
      const ctx = { frame, navigation, toggle }
      await navigation.open(servicePath(toss))
      // Each test gets a fresh browser context, so nothing is stored yet.
      await 프리뷰_테마_확인(ctx, SLUG, "light")
      await 프리뷰_테마_전환(ctx, SLUG, "dark")
      await 새로고침_후_테마_유지(ctx, SLUG, "dark")
    }
  )
})
