import { describe, expect, it } from "vitest"
import { textNotFoundResponse } from "./agent-representation"
import { readRepoFile } from "./skill-asset-paths"

// The per-entry text endpoints an agent fetches directly. Both answer a missing
// slug, and both used to send that 404 with the success cache headers.
const PER_ENTRY_TEXT_ROUTES = [
  "src/routes/services/$slug/llms[.]txt.ts",
  "src/routes/services/$slug/DESIGN[.]md.ts",
]

describe("textNotFoundResponse", () => {
  it("answers 404 on terms a shared cache will not hold", async () => {
    // A slug that 404s now can be a real entry by the next deploy. With
    // s-maxage the edge would keep serving the 404 after the entry shipped.
    const response = textNotFoundResponse("not-yet-shipped")
    expect(response.status).toBe(404)
    expect(await response.text()).toBe("Not found: not-yet-shipped\n")
    const cacheControl = response.headers.get("cache-control") ?? ""
    expect(cacheControl).not.toContain("s-maxage")
    expect(cacheControl).toContain("must-revalidate")
    expect(response.headers.get("content-type")).toBe(
      "text/plain; charset=utf-8"
    )
    expect(response.headers.get("access-control-allow-origin")).toBe("*")
  })

  it.each(PER_ENTRY_TEXT_ROUTES)("is the only 404 that %s builds", (path) => {
    // Read from source rather than by calling the handler: a route file may
    // export only `Route`, and the handler's context type is the router's. What
    // matters is that no second 404 with the success headers can be written
    // alongside the shared one.
    const source = readRepoFile(path)
    expect(source).toContain("return textNotFoundResponse(params.slug)")
    expect(source).not.toMatch(/status:\s*404/)
  })
})
