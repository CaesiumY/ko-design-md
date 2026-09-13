// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react"
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router"
import { afterEach, describe, expect, it } from "vitest"
import { SiteFooter } from "./footer"
import { STATIC_PAGE_PATHS } from "@/lib/site-config"

afterEach(cleanup)

describe("SiteFooter", () => {
  // The sitemap and llms.txt list these pages from the same constant, but
  // neither is something a visitor or an HTML-following crawler reads. Until the
  // footer carried them, /privacy had no inbound link on the site at all.
  it("links every standing page", async () => {
    const rootRoute = createRootRoute({ component: SiteFooter })
    const router = createRouter({
      routeTree: rootRoute,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    })
    await router.load()
    const { container } = render(<RouterProvider router={router} />)

    const hrefs = [
      ...container.querySelectorAll('footer nav[aria-label="사이트 정보"] a'),
    ].map((anchor) => anchor.getAttribute("href"))
    expect(hrefs).toEqual([...STATIC_PAGE_PATHS])
  })
})
