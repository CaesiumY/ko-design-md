// docs-crawler engine entry point.
//
// Usage:  tsx crawl.ts <docs-site-url> [--out <dir>]
//
// Crawls an entire documentation site (sitemap-driven, link-BFS fallback) and
// writes a Markdown corpus. Static pages are fetched directly; JS-rendered
// pages fall back to a headless browser. Images are kept as external URLs.

import { mkdirSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { discoverUrls } from "./crawl/discover"
import { htmlToMarkdown } from "./crawl/extract"
import {
  closeBrowser,
  fetchRendered,
  fetchRobots,
  fetchStatic,
  isAllowed,
} from "./crawl/fetch-page"
import type { RobotsRules } from "./crawl/fetch-page"
import {
  buildCorpus,
  buildManifest,
  buildPageFile,
  pageFileName,
} from "./crawl/corpus"
import type { CrawlOptions, PageResult } from "./crawl/types"

const USER_AGENT =
  "ko-design-md-docs-crawler/0.1 (+https://github.com/CaesiumY/ko-design-md)"
// Below this much extracted text, a page is treated as a JS shell and retried
// through the headless browser.
const MIN_CONTENT_CHARS = 200
const MAX_PAGES = 200
const CONCURRENCY = 5

interface CliArgs {
  url: string
  outDir: string
}

function parseArgs(argv: Array<string>): CliArgs {
  const args = argv.slice(2)
  let url = ""
  let outDir = ""
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--out") {
      outDir = args[i + 1] ?? ""
      i++
    } else if (!url && !arg.startsWith("--")) {
      url = arg
    }
  }
  if (!url) {
    console.error("Usage: tsx crawl.ts <docs-site-url> [--out <dir>]")
    process.exit(1)
  }
  let host = ""
  try {
    host = new URL(url).host
  } catch {
    console.error(`[crawl] Invalid URL: ${url}`)
    process.exit(1)
  }
  return { url, outDir: resolve(outDir || `./${host}-docs`) }
}

/** Run `fn` over `items` with a fixed concurrency ceiling, preserving order. */
async function mapLimit<T, R>(
  items: Array<T>,
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<Array<R>> {
  const results: Array<R> = new Array(items.length)
  let cursor = 0
  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor
      cursor++
      results[index] = await fn(items[index])
    }
  }
  const workerCount = Math.min(Math.max(limit, 1), items.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return results
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function crawlPage(
  url: string,
  robots: RobotsRules,
): Promise<PageResult> {
  if (!isAllowed(url, robots)) {
    return {
      url,
      title: url,
      markdown: "",
      method: "fetch",
      status: "failed",
      chars: 0,
      error: "disallowed by robots.txt",
    }
  }
  try {
    const html = await fetchStatic(url, USER_AGENT)
    let extracted = htmlToMarkdown(html, url)
    let method: PageResult["method"] = "fetch"

    if (extracted.chars < MIN_CONTENT_CHARS) {
      try {
        const renderedHtml = await fetchRendered(url, USER_AGENT)
        const rendered = htmlToMarkdown(renderedHtml, url)
        if (rendered.chars > extracted.chars) {
          extracted = rendered
          method = "playwright"
        }
      } catch (error) {
        console.warn(
          `[crawl] JS fallback unavailable for ${url}: ${errorMessage(error)}`,
        )
      }
    }

    if (extracted.chars < MIN_CONTENT_CHARS) {
      return {
        url,
        title: extracted.title,
        markdown: extracted.markdown,
        method,
        status: "failed",
        chars: extracted.chars,
        error: "no extractable content",
      }
    }
    return {
      url,
      title: extracted.title,
      markdown: extracted.markdown,
      method,
      status: "ok",
      chars: extracted.chars,
    }
  } catch (error) {
    return {
      url,
      title: url,
      markdown: "",
      method: "fetch",
      status: "failed",
      chars: 0,
      error: errorMessage(error),
    }
  }
}

async function main(): Promise<void> {
  const { url, outDir } = parseArgs(process.argv)
  const options: CrawlOptions = {
    maxPages: MAX_PAGES,
    concurrency: CONCURRENCY,
    userAgent: USER_AGENT,
  }

  console.log(`[crawl] Discovering pages from ${url} ...`)
  const urls = await discoverUrls(url, options)
  if (urls.length === 0) {
    console.error("[crawl] No pages discovered — check the URL or its sitemap.")
    process.exit(1)
  }
  console.log(`[crawl] ${urls.length} page(s) queued`)

  const robots = await fetchRobots(new URL(url).origin, USER_AGENT)

  let pages: Array<PageResult>
  try {
    pages = await mapLimit(urls, options.concurrency, async (pageUrl) => {
      const result = await crawlPage(pageUrl, robots)
      console.log(
        `[crawl]   ${result.status === "ok" ? "ok  " : "fail"} ${pageUrl}`,
      )
      return result
    })
  } finally {
    // Always release the shared browser so the process can exit.
    await closeBrowser()
  }

  const crawledAt = new Date().toISOString()
  const okPages = pages.filter((page) => page.status === "ok")

  mkdirSync(join(outDir, "crawl", "pages"), { recursive: true })
  const fileNames = new Map<string, string>()
  okPages.forEach((page, index) => {
    const fileName = pageFileName(page.url, index)
    fileNames.set(page.url, `crawl/pages/${fileName}`)
    writeFileSync(
      join(outDir, "crawl", "pages", fileName),
      buildPageFile(page, crawledAt),
    )
  })
  writeFileSync(
    join(outDir, "crawl-corpus.md"),
    buildCorpus(url, pages, crawledAt),
  )
  writeFileSync(
    join(outDir, "crawl", "manifest.json"),
    `${JSON.stringify(buildManifest(url, pages, fileNames, crawledAt), null, 2)}\n`,
  )

  console.log(
    `[crawl] Done — ${okPages.length} ok, ${pages.length - okPages.length} failed`,
  )
  console.log(`[crawl] Corpus: ${join(outDir, "crawl-corpus.md")}`)
  if (okPages.length === 0) {
    console.error("[crawl] 0 pages succeeded.")
    process.exit(1)
  }
}

main().catch((error) => {
  console.error("[crawl] Failed:", error)
  process.exit(1)
})
