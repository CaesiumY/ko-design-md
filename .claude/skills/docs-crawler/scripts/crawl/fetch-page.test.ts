import { describe, expect, it } from "vitest"
import { isAllowed, parseRobots } from "./fetch-page"

describe("parseRobots", () => {
  it("collects Disallow rules for the wildcard agent", () => {
    const rules = parseRobots(
      "User-agent: *\nDisallow: /private\nDisallow: /tmp"
    )
    expect(rules.disallow).toEqual(["/private", "/tmp"])
  })

  it("ignores rules that belong to other named agents", () => {
    const rules = parseRobots(
      "User-agent: BadBot\nDisallow: /\n\nUser-agent: *\nDisallow: /admin"
    )
    expect(rules.disallow).toEqual(["/admin"])
  })

  it("strips comments and blank lines", () => {
    const rules = parseRobots("# header\nUser-agent: *\nDisallow: /x  # nope")
    expect(rules.disallow).toEqual(["/x"])
  })

  it("returns no rules for empty input", () => {
    expect(parseRobots("").disallow).toEqual([])
  })
})

describe("isAllowed", () => {
  const rules = { disallow: ["/private"] }

  it("blocks paths under a disallowed prefix", () => {
    expect(isAllowed("https://x.com/private/page", rules)).toBe(false)
  })

  it("allows paths outside disallowed prefixes", () => {
    expect(isAllowed("https://x.com/public/page", rules)).toBe(true)
  })

  it("allows everything when there are no rules", () => {
    expect(isAllowed("https://x.com/anything", { disallow: [] })).toBe(true)
  })
})
