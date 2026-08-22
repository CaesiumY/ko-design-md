// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react"
import {
  HeadContent,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { afterEach, describe, expect, it } from "vitest"
import { buildServiceSeo } from "./seo"
import type { ServiceDoc } from "./content-types"

// The note at the top of `seo.ts` says a catalog string cannot break out of the
// JSON-LD script element, and until now that was a measurement taken by hand
// against a dev server (issue #270). Review kept returning to the same gap: the
// claim was pinned only by `MEASURED_MAJOR`, which assumes the router treats its
// escaping as part of the semver contract. Nothing re-took the measurement.
//
// This does, on every run, through the router's own head pipeline. It needs no
// SSR harness — `buildTagsFromMatches` applies the escaping on both paths, so a
// client render in jsdom observes the same output the server writes. (Verified:
// the string below comes out identical here and from `pnpm dev`.)
const HOSTILE = "A</script><script>alert(1)</script>B & <!-- C"

const doc = {
  frontmatter: {
    name: HOSTILE,
    slug: "escaping-probe",
    category: "etc",
    last_updated: "2026-08-18",
    created_at: "2026-08-18",
    sources: [],
    lang: "ko",
  },
  raw: "",
  body: "",
  tagline: `프로브 ${HOSTILE} 끝`,
  filePath: "/services/escaping-probe.md",
  estimatedTokens: 1,
} satisfies ServiceDoc

async function renderJsonLd(): Promise<string> {
  const rootRoute = createRootRoute({ component: () => <HeadContent /> })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    head: () => buildServiceSeo(doc, { isTabView: false }),
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  })
  // The head tags are derived from loaded matches, so the route has to resolve
  // before anything is in the tree to read.
  await router.load()
  const { container } = render(<RouterProvider router={router} />)
  const script = container.querySelector('script[type="application/ld+json"]')
  if (!script?.textContent) {
    throw new Error(
      "no JSON-LD script rendered — the router's head pipeline changed shape, so this guard is no longer measuring anything"
    )
  }
  return script.textContent
}

afterEach(cleanup)

describe("JSON-LD escaping, through the router that does it", () => {
  it("emits no character that could close the script element", async () => {
    const rendered = await renderJsonLd()

    // The control. Without it this test would pass just as happily against a
    // pipeline that had stopped escaping AND stopped including the string.
    expect(rendered).toContain("alert(1)")
    expect(JSON.stringify(doc.frontmatter.name)).toContain("</script>")

    // And the claim: not one bare angle bracket or ampersand survives, so
    // `</script>` cannot appear no matter what a catalog entry is named.
    expect(rendered).not.toContain("<")
    expect(rendered).not.toContain("&")
  })

  it("still parses back to the original characters", async () => {
    // Escaping that damaged the value would be its own bug — a crawler has to
    // read the real name. This is why `seo.ts` adds no encoder of its own: the
    // router's escaping is already lossless and a second pass would not be.
    const parsed: { headline: string; description: string } = JSON.parse(
      await renderJsonLd()
    )
    expect(parsed).toMatchObject({
      headline: expect.stringContaining(HOSTILE),
      description: expect.stringContaining(HOSTILE),
    })
  })
})
