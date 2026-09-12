import { readdirSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  acceptsHtml,
  agentResponse,
  isHandledElsewhere,
  notAcceptableMarkdown,
  notFoundMarkdown,
  prefersMarkdown,
} from "./agent-representation"
import { STATIC_PAGE_PATHS } from "./site-config"

const ORIGIN = "https://example.test"
const REPO_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..")

function get(path: string, accept?: string): Request {
  return new Request(`${ORIGIN}${path}`, {
    headers: accept === undefined ? {} : { Accept: accept },
  })
}

describe("acceptsHtml", () => {
  // The browser cases. Every one of these must leave SSR alone - the cost of a
  // false positive here is the whole site answering markdown to real people.
  //
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
    ["", "an empty Accept header"],
    ["text/markdown, text/html", "markdown preferred but html acceptable"],
    ["text/*", "any text type, which includes html"],
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

  // RFC 9110 §12.4.2: "a value of 0 means not acceptable". A prefix scan reads
  // the `text/html` in these as acceptance and hands back HTML the client just
  // said it cannot use.
  it.each([
    "text/markdown, text/html;q=0",
    "text/markdown, */*;q=0",
    "text/html;q=0.0",
  ])("honours an explicit refusal in %j", (accept) => {
    expect(acceptsHtml(accept)).toBe(false)
  })

  it("keeps a malformed q as acceptance rather than refusal", () => {
    // A broken parameter should not silently flip the meaning of the header.
    expect(acceptsHtml("text/html;q=banana")).toBe(true)
  })
})

describe("prefersMarkdown", () => {
  it.each([
    "text/markdown",
    "text/markdown; charset=utf-8",
    "text/x-markdown",
    "text/plain",
    "text/markdown;q=0.9, text/html;q=0",
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
    expect(
      agentResponse(get("/services/not-a-brand", "text/markdown"))?.status
    ).toBe(404)
  })

  // A page this site's own llms.txt advertises must not be called "not found"
  // just because it has no markdown form. 406 says "exists, wrong shape", and
  // the body names the request that works.
  it.each(STATIC_PAGE_PATHS)(
    "answers %s with 406, not 404, when markdown is requested",
    async (path) => {
      const response = agentResponse(get(path, "text/markdown"))
      expect(response?.status).toBe(406)
      await expect(response?.text()).resolves.toContain("Accept: text/html")
    }
  )

  // These used to reach the framework's hardcoded 500. Every one of them is a
  // negotiation outcome, not a server fault.
  it("answers an unsupported type with 406 on a real page", () => {
    expect(agentResponse(get("/", "application/json"))?.status).toBe(406)
    expect(
      agentResponse(get("/services/toss", "application/json"))?.status
    ).toBe(406)
  })

  it("answers an unsupported type with 404 on a path that does not exist", () => {
    expect(agentResponse(get("/nope", "application/json"))?.status).toBe(404)
  })

  it("answers a dotted path that no handler owns", () => {
    // `/missing.html`, or a typo like `/services/toss/llms.tx`. Treating "has a
    // dot" as "someone else handles it" sent these back to the SSR rejection.
    expect(agentResponse(get("/missing.html", "text/markdown"))?.status).toBe(
      404
    )
    expect(
      agentResponse(get("/services/toss/llms.tx", "text/markdown"))?.status
    ).toBe(404)
  })

  it("does not throw on a malformed percent escape", () => {
    // decodeURIComponent raises URIError on `%ZZ`. In practice such a request
    // is rejected by h3 or the edge before it reaches here (see the comment on
    // `serviceSlug`), so this pins the unit, not the deployed status code.
    expect(() =>
      agentResponse(get("/services/%ZZ", "text/markdown"))
    ).not.toThrow()
    expect(agentResponse(get("/services/%ZZ", "text/markdown"))?.status).toBe(
      404
    )
  })

  it("ignores non-GET methods", () => {
    const request = new Request(`${ORIGIN}/`, {
      method: "POST",
      headers: { Accept: "text/markdown" },
    })
    expect(agentResponse(request)).toBeUndefined()
  })

  it("never returns a 5xx", () => {
    // The whole point of this module: the SSR handler answers any non-HTML
    // Accept with a hardcoded 500, so nothing may reach it. A status is also
    // always produced - returning undefined here would hand the request back
    // to that same handler.
    const paths = [
      "/",
      "/about",
      "/services/toss",
      "/services/not-a-brand",
      "/nope",
      "/missing.html",
      "/services/%ZZ",
      "/deeply/nested/unknown/path",
    ]
    for (const path of paths) {
      for (const accept of [
        "text/markdown",
        "application/json",
        "text/plain",
      ]) {
        const status = agentResponse(get(path, accept))?.status
        expect(status, `${accept} ${path}`).toBeDefined()
        expect(status!, `${accept} ${path}`).toBeLessThan(500)
      }
    }
  })
})

// The two lists in `isHandledElsewhere` name things that exist outside this
// file, so they are checked against the filesystem rather than against a copy
// of themselves. A new machine endpoint or a new file in public/ fails here
// instead of quietly turning into a markdown 404.
describe("isHandledElsewhere is in step with the repo", () => {
  function walk(dir: string): Array<string> {
    return readdirSync(dir).flatMap((name) => {
      const full = join(dir, name)
      return statSync(full).isDirectory() ? walk(full) : [full]
    })
  }

  it("covers every route file whose name escapes a dot", () => {
    const routesDir = join(REPO_ROOT, "src", "routes")
    const paths = walk(routesDir)
      .filter((file) => file.endsWith(".ts") && file.includes("[.]"))
      .map((file) =>
        `/${relative(routesDir, file).split(sep).join("/")}`
          .replace(/\.ts$/, "")
          .replace(/\[\.\]/g, ".")
          // `$slug` is a parameter; any concrete value exercises the pattern.
          .replace(/\$slug/g, "toss")
      )

    expect(paths.length).toBeGreaterThan(0)
    for (const path of paths) {
      expect(isHandledElsewhere(path), path).toBe(true)
    }
  })

  it("covers every file at the root of public/", () => {
    const publicDir = join(REPO_ROOT, "public")
    const files = readdirSync(publicDir).filter(
      (name) => !statSync(join(publicDir, name)).isDirectory()
    )

    expect(files.length).toBeGreaterThan(0)
    for (const name of files) {
      expect(isHandledElsewhere(`/${name}`), name).toBe(true)
    }
  })

  it("covers every asset directory under public/", () => {
    const publicDir = join(REPO_ROOT, "public")
    const dirs = readdirSync(publicDir).filter((name) =>
      statSync(join(publicDir, name)).isDirectory()
    )

    for (const name of dirs) {
      expect(isHandledElsewhere(`/${name}/anything.png`), name).toBe(true)
    }
  })

  it("does not claim an ordinary page path", () => {
    // The guard rail for the rules above: if one of them widened to match
    // pages, content negotiation would stop happening entirely.
    for (const path of ["/", "/about", "/services/toss", "/nope"]) {
      expect(isHandledElsewhere(path), path).toBe(false)
    }
  })
})

describe("recovery bodies", () => {
  it("names the path that missed and the three recovery routes", () => {
    const body = notFoundMarkdown(ORIGIN, "/typo")
    expect(body).toContain("/typo")
    expect(body).toContain(`${ORIGIN}/llms.txt`)
    expect(body).toContain(`${ORIGIN}/sitemap.xml`)
    expect(body).toContain(`${ORIGIN}/`)
  })

  it("tells a 406 reader which request would work", () => {
    const body = notAcceptableMarkdown(ORIGIN, "/about")
    expect(body).toContain("406")
    expect(body).toContain("Accept: text/html")
    expect(body).toContain(`${ORIGIN}/about`)
  })

  it("cannot receive a pathname that would break its own code span", () => {
    // Both bodies wrap the path in a markdown inline code span without escaping
    // it, which would be a formatting bug if a backtick could get through. It
    // cannot: every caller derives the path from `new URL().pathname`, which
    // percent-encodes one. This pins the reason, so the day that changes the
    // test fails instead of the output quietly going crooked.
    const pathname = new URL(`${ORIGIN}/a\`b`).pathname
    expect(pathname).toBe("/a%60b")
    expect(notFoundMarkdown(ORIGIN, pathname)).not.toContain("`/a`")
  })
})
