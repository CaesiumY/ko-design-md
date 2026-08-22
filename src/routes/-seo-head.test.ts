import { describe, expect, it } from "vitest"
import { Route as RootRoute } from "./__root"
import { Route as ServiceRoute } from "./services/$slug"
import { Route as HomeRoute } from "./index"
import { getServiceBySlug } from "@/lib/content-collection"

const tossDoc = getServiceBySlug("toss")!

describe("route SEO heads", () => {
  it("uses homepage metadata with the clean root URL as canonical", async () => {
    const head = await HomeRoute.options.head?.({
      match: { search: {} },
    } as never)

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
    expect(validateSearch({ tab: "" })).toEqual({
      tab: "",
    })
    expect(validateSearch({ tab: "unknown" })).toEqual({
      tab: "unknown",
    })
  })
  it("noindexes an unrecognized tab query while keeping the clean canonical URL", async () => {
    const head = await ServiceRoute.options.head?.({
      loaderData: { doc: tossDoc, shikiHtml: "", previewAvailable: true },
      match: { search: { tab: "unknown" } },
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
      matches: [{ status: "success", _notFound: true }],
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
      matches: [{ status: "notFound", _notFound: false }],
    } as never)

    expect(head?.meta).toContainEqual({
      name: "robots",
      content: "noindex,follow",
    })
  })
})

// The home list narrows with `?cat=` and `?q=`. Those URLs render the same
// cards as `/` — fewer of them, with no title or description of their own — so
// the policy is `noindex,follow` with `/` as canonical either way (issue #269).
//
// These go through `validateSearch` before `head`, in that order, because that
// is the order the router runs them and because the normalization it does is
// half the policy: a `cat` that names no category and an empty `q` produce the
// FULL list, so they must stay indexable. Asserting against a hand-built search
// object would test the head in isolation and miss that.
describe("home filter queries and indexing", () => {
  // Concrete rather than `Record<string, unknown>`: the route's own validator
  // takes the wide type because a URL is external input, but a test writes the
  // query itself and knows its shape.
  async function homeHead(raw: { cat?: string; q?: string }) {
    const validateSearch = HomeRoute.options.validateSearch
    if (typeof validateSearch !== "function") {
      throw new Error("Home route must expose a search validator function")
    }
    return await HomeRoute.options.head?.({
      match: { search: validateSearch(raw) },
    } as never)
  }

  const NOINDEX = { name: "robots", content: "noindex,follow" }
  const CANONICAL = { rel: "canonical", href: "/" }

  it.each([
    ["a category filter", { cat: "finance" }],
    ["a search query", { q: "토스" }],
    ["both at once", { cat: "finance", q: "토스" }],
  ])("noindexes %s", async (_label, raw) => {
    const head = await homeHead(raw)
    expect(head?.meta).toContainEqual(NOINDEX)
    // Canonical never follows the filter — it names the page to prefer.
    expect(head?.links).toContainEqual(CANONICAL)
  })

  it.each([
    ["the unfiltered list", {}],
    // `validateSearch` drops both of these, so the page IS the full list and
    // the head must not noindex it. Measured against the dev server, the router
    // goes further and answers these two URLs with `307 → /` rather than
    // rendering at all — so at the HTTP level they are already deduplicated,
    // and this pins the head for the case that reaches it.
    ["a cat that names no category", { cat: "없는카테고리" }],
    ["an empty q", { q: "" }],
  ])("leaves %s indexable", async (_label, raw) => {
    const head = await homeHead(raw)
    expect(head?.meta).not.toContainEqual(
      expect.objectContaining({ name: "robots" })
    )
    expect(head?.links).toContainEqual(CANONICAL)
  })
})
