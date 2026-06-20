import { describe, expect, it } from "vitest"
import {
  buildCorpus,
  buildManifest,
  buildPageFile,
  pageFileName,
} from "./corpus"
import type { PageResult } from "./types"

const okPage = (url: string, title: string): PageResult => ({
  url,
  title,
  markdown: `Content for ${title}.`,
  method: "fetch",
  status: "ok",
  chars: 500,
})

const failedPage = (url: string): PageResult => ({
  url,
  title: url,
  markdown: "",
  method: "fetch",
  status: "failed",
  chars: 0,
  error: "no extractable content",
})

const AT = "2026-05-20T00:00:00.000Z"

describe("pageFileName", () => {
  it("builds a zero-padded, slugified name", () => {
    expect(pageFileName("https://x.com/docs/getting-started", 0)).toBe(
      "001-docs-getting-started.md"
    )
  })

  it("uses 'index' for the root path", () => {
    expect(pageFileName("https://x.com/", 4)).toBe("005-index.md")
  })

  it("keeps the index prefix unique across same-slug paths", () => {
    expect(pageFileName("https://x.com/page", 0)).not.toBe(
      pageFileName("https://x.com/page", 1)
    )
  })
})

describe("buildPageFile", () => {
  it("emits frontmatter followed by the markdown body", () => {
    const file = buildPageFile(okPage("https://x.com/a", "Page A"), AT)
    expect(file).toContain('source_url: "https://x.com/a"')
    expect(file).toContain('title: "Page A"')
    expect(file).toContain("method: fetch")
    expect(file).toContain(`crawled_at: ${AT}`)
    expect(file).toContain("Content for Page A.")
  })
})

describe("buildCorpus", () => {
  const pages = [
    okPage("https://x.com/a", "Page A"),
    failedPage("https://x.com/broken"),
    okPage("https://x.com/b", "Page B"),
  ]

  it("includes only successful pages, each with its source URL", () => {
    const corpus = buildCorpus("https://x.com", pages, AT)
    expect(corpus).toContain("## Page A")
    expect(corpus).toContain("Source: https://x.com/a")
    expect(corpus).toContain("## Page B")
    expect(corpus).not.toContain("https://x.com/broken")
  })

  it("reports the attempted-vs-succeeded count", () => {
    const corpus = buildCorpus("https://x.com", pages, AT)
    expect(corpus).toContain("Pages: 2 of 3 attempted")
  })
})

describe("buildManifest", () => {
  it("counts outcomes and maps successful pages to files", () => {
    const pages = [
      okPage("https://x.com/a", "Page A"),
      failedPage("https://x.com/broken"),
    ]
    const fileNames = new Map([["https://x.com/a", "crawl/pages/001-a.md"]])
    const manifest = buildManifest("https://x.com", pages, fileNames, AT)
    expect(manifest.total).toBe(2)
    expect(manifest.ok).toBe(1)
    expect(manifest.failed).toBe(1)
    expect(manifest.pages[0].file).toBe("crawl/pages/001-a.md")
    expect(manifest.pages[1].file).toBeNull()
    expect(manifest.pages[1].error).toBe("no extractable content")
  })
})
