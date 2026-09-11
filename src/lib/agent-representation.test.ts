import { describe, expect, it } from "vitest"
import {
  acceptsHtml,
  agentResponse,
  notFoundMarkdown,
  prefersMarkdown,
} from "./agent-representation"

const ORIGIN = "https://example.test"

function get(path: string, accept?: string): Request {
  return new Request(`${ORIGIN}${path}`, {
    headers: accept === undefined ? {} : { Accept: accept },
  })
}

describe("acceptsHtml", () => {
  // The browser cases. Every one of these must leave SSR alone - the cost of a
  // false positive here is the whole site answering markdown to real people.
  // Annotated rather than inferred: without it the mixed `string` / `null`
  // first elements widen to a UNION of tuple types, and `it.each` then demands
  // a callback assignable to every member at once - which no single-parameter
  // callback is. The annotation collapses the union to one tuple shape.
  const htmlAcceptable: Array<[accept: string | null, client: string]> = [
    [
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Chrome",
    ],
    ["*/*", "curl"],
    [null, "no Accept header at all"],
    ["text/markdown, text/html", "markdown preferred but html acceptable"],
  ]

  it.each(htmlAcceptable)("treats %j as html-acceptable (%s)", (accept) => {
    expect(acceptsHtml(accept)).toBe(true)
  })

  it.each(["text/markdown", "text/plain", "application/json"])(
    "does not treat %j as html-acceptable",
    (accept) => {
      expect(acceptsHtml(accept)).toBe(false)
    }
  )
})

describe("prefersMarkdown", () => {
  it.each([
    "text/markdown",
    "text/markdown; charset=utf-8",
    "text/x-markdown",
    "text/plain",
  ])("is true for %j", (accept) => {
    expect(prefersMarkdown(accept)).toBe(true)
  })

  // Anything that also takes HTML is a browser, however it ranked the types.
  it("is false when html is also acceptable", () => {
    expect(prefersMarkdown("text/markdown, text/html")).toBe(false)
    expect(prefersMarkdown("*/*")).toBe(false)
  })

  it("is false for a type this site has no representation for", () => {
    expect(prefersMarkdown("application/json")).toBe(false)
  })
})

describe("agentResponse", () => {
  it("leaves html requests to the router", () => {
    expect(agentResponse(get("/"))).toBeUndefined()
    expect(agentResponse(get("/services/toss", "text/html"))).toBeUndefined()
  })

  it("serves the catalog index as markdown at the site root", async () => {
    const response = agentResponse(get("/", "text/markdown"))
    expect(response?.status).toBe(200)
    expect(response?.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8"
    )
    // Without this a shared cache can hand the HTML variant to an agent.
    expect(response?.headers.get("vary")).toBe("Accept")
    await expect(response?.text()).resolves.toContain("## Catalog")
  })

  it("serves an entry's raw design.md at its canonical url", async () => {
    const response = agentResponse(get("/services/toss", "text/markdown"))
    expect(response?.status).toBe(200)
    const body = await response!.text()
    // The raw file, frontmatter and citations intact - the same bytes
    // /services/toss/llms.txt serves.
    expect(body.startsWith("---")).toBe(true)
    expect(body).toContain("slug: toss")
  })

  it("answers an unknown path with a markdown 404 that says where to look", async () => {
    const response = agentResponse(get("/nope", "text/markdown"))
    expect(response?.status).toBe(404)
    const body = await response!.text()
    expect(body).toContain("/llms.txt")
    expect(body).toContain("/sitemap.xml")
  })

  it("answers an unknown slug the same way", () => {
    const response = agentResponse(
      get("/services/not-a-brand", "text/markdown")
    )
    expect(response?.status).toBe(404)
  })

  // The load-bearing exclusion. These paths have their own `server.handlers`,
  // which the router resolves before SSR - they already answer markdown
  // requests correctly, and intercepting them would replace a working endpoint
  // with a guess. The rule is "the last path segment has an extension".
  it.each([
    "/llms.txt",
    "/robots.txt",
    "/sitemap.xml",
    "/rss.xml",
    "/services/toss/llms.txt",
    "/services/toss/DESIGN.md",
    "/.well-known/agent-skills/index.json",
    "/.well-known/agent-skills/use-design-md/SKILL.md",
    "/og/default.png",
    "/assets/index-abc123.js",
  ])("falls through for %s, which has its own handler", (path) => {
    expect(agentResponse(get(path, "text/markdown"))).toBeUndefined()
  })

  it("ignores non-GET methods", () => {
    const request = new Request(`${ORIGIN}/`, {
      method: "POST",
      headers: { Accept: "text/markdown" },
    })
    expect(agentResponse(request)).toBeUndefined()
  })
})

describe("notFoundMarkdown", () => {
  it("names the path that missed and the three recovery routes", () => {
    const body = notFoundMarkdown(ORIGIN, "/typo")
    expect(body).toContain("/typo")
    expect(body).toContain(`${ORIGIN}/llms.txt`)
    expect(body).toContain(`${ORIGIN}/sitemap.xml`)
    expect(body).toContain(`${ORIGIN}/`)
  })
})
