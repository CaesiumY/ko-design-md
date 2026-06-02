import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
  decodeDataUri,
  extractDataUris,
  extractImageUrls,
  INLINE_IMAGE_PLACEHOLDER,
  localDataUriName,
  localImageName,
  rewriteImageUrls,
  saveDataUris,
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

  it("preserves a title that contains parentheses", () => {
    // Title with `(...)` would break a naive `lastIndexOf("(")` URL-finder
    // because the title's `(` is closer to the trailing `)` than the URL's.
    const md = `![alt](https://x.com/a.png "title (something)")`
    expect(rewriteImageUrls(md, map, "crawl/images/")).toBe(
      `![alt](crawl/images/aa00-a.png "title (something)")`,
    )
  })

  it("rewrites mapped data: URIs like any other image", () => {
    // Localized inline images join the same map; rewrite must handle them too.
    const dataMap = new Map([["data:image/png;base64,AAAA", "cc22.png"]])
    const md = `![icon](data:image/png;base64,AAAA)`
    expect(rewriteImageUrls(md, dataMap, "crawl/images/")).toBe(
      "![icon](crawl/images/cc22.png)",
    )
  })

  it("strips a data: URI to the bare placeholder with an empty prefix", () => {
    // External-images mode collapses inline data URIs via an empty-prefix
    // rewrite so no `crawl/images/` path is prepended to the placeholder.
    const phMap = new Map([
      ["data:image/png;base64,AAAA", INLINE_IMAGE_PLACEHOLDER],
    ])
    const md = `![icon](data:image/png;base64,AAAA)`
    expect(rewriteImageUrls(md, phMap, "")).toBe(
      `![icon](${INLINE_IMAGE_PLACEHOLDER})`,
    )
  })
})

describe("extractDataUris", () => {
  it("collects base64 data: image URIs, keeping the full URI", () => {
    const md = `
![icon](data:image/svg+xml;base64,PHN2Zy8+)
inline ![png](data:image/png;base64,AAAA "t") end
`
    expect(extractDataUris(md)).toEqual([
      "data:image/svg+xml;base64,PHN2Zy8+",
      "data:image/png;base64,AAAA",
    ])
  })

  it("ignores http(s) and relative image URLs", () => {
    const md = `![a](https://x.com/a.png) ![b](./b.png)`
    expect(extractDataUris(md)).toEqual([])
  })

  it("ignores non-base64 data URIs", () => {
    const md = `![a](data:image/svg+xml,%3Csvg%3E)`
    expect(extractDataUris(md)).toEqual([])
  })
})

describe("decodeDataUri", () => {
  it("decodes a base64 image into a buffer with a mapped extension", () => {
    const out = decodeDataUri("data:image/svg+xml;base64,PHN2Zy8+")
    expect(out).not.toBeNull()
    expect(out?.ext).toBe(".svg")
    expect(out?.buffer.toString("utf8")).toBe("<svg/>")
  })

  it("maps common image MIME types to extensions", () => {
    expect(decodeDataUri("data:image/png;base64,AAAA")?.ext).toBe(".png")
    expect(decodeDataUri("data:image/jpeg;base64,AAAA")?.ext).toBe(".jpg")
    expect(decodeDataUri("data:image/webp;base64,AAAA")?.ext).toBe(".webp")
  })

  it("returns null for non-base64, empty, or non-image data URIs", () => {
    expect(decodeDataUri("data:image/png,rawtext")).toBeNull()
    expect(decodeDataUri("data:image/png;base64,")).toBeNull()
    expect(decodeDataUri("data:application/json;base64,e30=")).toBeNull()
    expect(decodeDataUri("https://x.com/a.png")).toBeNull()
  })
})

describe("localDataUriName", () => {
  it("is deterministic and derives the extension from the MIME type", () => {
    const uri = "data:image/png;base64,AAAA"
    expect(localDataUriName(uri)).toBe(localDataUriName(uri))
    expect(localDataUriName(uri)).toMatch(/^[0-9a-f]{8}\.png$/)
  })

  it("gives different names to different payloads", () => {
    expect(localDataUriName("data:image/png;base64,AAAA")).not.toBe(
      localDataUriName("data:image/png;base64,BBBB"),
    )
  })
})

describe("saveDataUris", () => {
  it("writes decoded images to disk and returns a URI→filename map", () => {
    const dir = mkdtempSync(join(tmpdir(), "docs-crawler-test-"))
    try {
      const uris = [
        "data:image/svg+xml;base64,PHN2Zy8+",
        "data:image/png;base64,", // undecodable → omitted from the map
      ]
      const result = saveDataUris(uris, dir)
      expect(result.size).toBe(1)
      const name = result.get("data:image/svg+xml;base64,PHN2Zy8+")
      expect(name).toMatch(/^[0-9a-f]{8}\.svg$/)
      expect(readFileSync(join(dir, name as string), "utf8")).toBe("<svg/>")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("skips inline images whose write fails instead of throwing", () => {
    // Writing into a directory whose parent does not exist makes writeFileSync
    // throw; saveDataUris must swallow it and omit the image, never abort the
    // crawl (mirrors downloadImage's resilience).
    const missingDir = join(tmpdir(), "docs-crawler-missing-zzz", "nested")
    const result = saveDataUris(
      ["data:image/svg+xml;base64,PHN2Zy8+"],
      missingDir,
    )
    expect(result.size).toBe(0)
  })
})
