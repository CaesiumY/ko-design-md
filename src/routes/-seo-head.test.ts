import { describe, expect, it } from "vitest"
import { Route as RootRoute } from "./__root"
import { Route as ServiceRoute } from "./services/$slug"
import { Route as HomeRoute } from "./index"
import { getServiceBySlug } from "@/lib/content-collection"

const tossDoc = getServiceBySlug("toss")!

describe("route SEO heads", () => {
  it("uses homepage metadata with the clean root URL as canonical", async () => {
    const head = await HomeRoute.options.head?.({} as never)

    expect(head?.meta).toContainEqual({
      title: "한국 서비스 디자인 시스템 카탈로그 | ko/design.md",
    })
    expect(head?.links).toContainEqual({ rel: "canonical", href: "/" })
  })

  it("keeps the default detail tab out of the URL", () => {
    const validateSearch = ServiceRoute.options.validateSearch
    if (typeof validateSearch !== "function") {
      throw new Error("Service route must expose a search validator function")
    }

    expect(validateSearch({})).toEqual({
      tab: undefined,
    })
  })

  it("uses the clean service URL as canonical and noindexes tab states", async () => {
    const head = await ServiceRoute.options.head?.({
      loaderData: { doc: tossDoc, shikiHtml: "", previewAvailable: true },
      match: { search: { tab: "tokens" } },
    } as never)

    expect(head?.links).toContainEqual({
      rel: "canonical",
      href: "/services/toss",
    })
    expect(head?.meta).toContainEqual({
      name: "robots",
      content: "noindex,follow",
    })
  })

  it("replaces homepage metadata with a noindex head for global 404s", async () => {
    const head = await RootRoute.options.head?.({
      matches: [{ status: "success", globalNotFound: true }],
    } as never)

    expect(head?.meta).toContainEqual({
      title: "페이지를 찾을 수 없습니다 | ko/design.md",
    })
    expect(head?.meta).toContainEqual({
      name: "robots",
      content: "noindex,follow",
    })
    expect(head?.links).not.toContainEqual(
      expect.objectContaining({ rel: "canonical" })
    )
    expect(head?.links).toContainEqual(
      expect.objectContaining({ rel: "stylesheet" })
    )
  })

  it("uses the same noindex head for route-level not-found matches", async () => {
    const head = await RootRoute.options.head?.({
      matches: [{ status: "notFound", globalNotFound: false }],
    } as never)

    expect(head?.meta).toContainEqual({
      name: "robots",
      content: "noindex,follow",
    })
  })
})
