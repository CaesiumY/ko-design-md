import { test } from "../../../fixtures"
import { bySlug, servicePath } from "../../../support/catalog"
import { DETAIL_TABS, 탭_상태_확인, 탭_전환 } from "../flows/detail-tabs-flows"

// toss is the fixed anchor entry (scripts/test-http.ts uses it too) and ships a
// token sidecar, so all three tabs exist.
const TOSS = servicePath(bySlug("toss"))
const [PREVIEW, TOKENS, MARKDOWN] = DETAIL_TABS

test.describe("서비스 상세 탭", () => {
  test(
    "탭을 바꾸면 패널과 주소의 tab 값이 함께 바뀐다",
    { tag: ["@smoke"] },
    async ({ navigation }) => {
      await navigation.open(TOSS)
      await 탭_상태_확인({ navigation }, PREVIEW)
      await 탭_전환({ navigation }, TOKENS)
      await 탭_전환({ navigation }, MARKDOWN)
      await 탭_전환({ navigation }, PREVIEW)
    }
  )

  test("tab 값을 단 주소로 들어오면 그 탭이 열려 있다", async ({
    navigation,
  }) => {
    await navigation.open(`${TOSS}?tab=${MARKDOWN.param}`)
    await 탭_상태_확인({ navigation }, MARKDOWN)
  })
})
