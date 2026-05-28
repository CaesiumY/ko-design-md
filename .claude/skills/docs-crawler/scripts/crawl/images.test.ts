import { describe, expect, it } from "vitest"
import {
  extractImageUrls,
  localImageName,
  rewriteImageUrls,
} from "./images"

describe("extractImageUrls", () => {
  it("collects every absolute http(s) image URL", () => {
    const md = `
text
![alt one](https://x.com/a.png)
inline ![](https://x.com/b.jpg) end
![with title](https://x.com/c.gif "caption")
`
    expect(extractImageUrls(md)).toEqual([
      "https://x.com/a.png",
      "https://x.com/b.jpg",
      "https://x.com/c.gif",
    ])
  })

  it("ignores relative or data URLs", () => {
    const md = `
![rel](./local.png)
![data](data:image/png;base64,AAAA)
![abs](https://x.com/keep.png)
`
    expect(extractImageUrls(md)).toEqual(["https://x.com/keep.png"])
  })

  it("returns an empty list when no images are present", () => {
    expect(extractImageUrls("just text and [a link](https://x.com)")).toEqual(
      [],
    )
  })
})

describe("localImageName", () => {
  it("uses the URL basename and an 8-char hash prefix", () => {
    const name = localImageName(
      "https://design.11stcorp.com/static/abc/123/accordion_type01.png",
    )
    expect(name).toMatch(/^[0-9a-f]{8}-accordion_type01\.png$/)
  })

  it("is deterministic — same URL produces the same name", () => {
    const url = "https://x.com/foo.png"
    expect(localImageName(url)).toBe(localImageName(url))
  })

  it("disambiguates same basename across different URLs", () => {
    const a = localImageName("https://x.com/a/foo.png")
    const b = localImageName("https://x.com/b/foo.png")
    expect(a).not.toBe(b)
    expect(a.endsWith("-foo.png")).toBe(true)
    expect(b.endsWith("-foo.png")).toBe(true)
  })

  it("drops unsafe extensions and keeps allowlisted image ones", () => {
    expect(localImageName("https://x.com/foo.exe")).toMatch(
      /^[0-9a-f]{8}-foo$/,
    )
    expect(localImageName("https://x.com/foo.png")).toMatch(
      /^[0-9a-f]{8}-foo\.png$/,
    )
  })

  it("sanitizes special characters in the basename", () => {
    const name = localImageName("https://x.com/some@weird!file.png")
    expect(name).toMatch(/^[0-9a-f]{8}-some-weird-file\.png$/)
  })

  it("falls back to `image` when no basename can be derived", () => {
    expect(localImageName("https://x.com/")).toMatch(/^[0-9a-f]{8}-image$/)
  })
})

describe("rewriteImageUrls", () => {
  const map = new Map([
    ["https://x.com/a.png", "aa00-a.png"],
    ["https://x.com/b.png", "bb11-b.png"],
  ])

  it("replaces mapped URLs with `${prefix}${name}`", () => {
    const md = `
![alt one](https://x.com/a.png)
![alt two](https://x.com/b.png)
`
    expect(rewriteImageUrls(md, map, "crawl/images/")).toContain(
      "![alt one](crawl/images/aa00-a.png)",
    )
    expect(rewriteImageUrls(md, map, "crawl/images/")).toContain(
      "![alt two](crawl/images/bb11-b.png)",
    )
  })

  it("supports different prefixes for corpus vs page files", () => {
    const md = `![x](https://x.com/a.png)`
    expect(rewriteImageUrls(md, map, "crawl/images/")).toBe(
      "![x](crawl/images/aa00-a.png)",
    )
    expect(rewriteImageUrls(md, map, "../images/")).toBe(
      "![x](../images/aa00-a.png)",
    )
  })

  it("leaves unmapped URLs untouched", () => {
    const md = `![x](https://x.com/missing.png)`
    expect(rewriteImageUrls(md, map, "crawl/images/")).toBe(md)
  })

  it("preserves alt text containing special characters", () => {
    const md = `![1. Brand Color: 탭 활성](https://x.com/a.png)`
    expect(rewriteImageUrls(md, map, "crawl/images/")).toBe(
      "![1. Brand Color: 탭 활성](crawl/images/aa00-a.png)",
    )
  })
})
