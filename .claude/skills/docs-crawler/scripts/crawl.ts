// docs-crawler engine entry point.
//
// Usage:
//   tsx crawl.ts <docs-site-url> [--out <dir>]
//                                 [--seeds <url1,url2,...>]
//                                 [--download-images]
//
// Crawls an entire documentation site (sitemap-driven, link-BFS fallback) and
// writes a Markdown corpus. Static pages are fetched directly; JS-rendered
// pages fall back to a headless browser. Images are kept as external URLs
// unless `--download-images` is set.
//
// `--seeds` lets the caller supply explicit starting URLs for BFS. Use it for
// SPA/SSG sites whose sidebar nav is client-rendered and so the default
// `[rootUrl]` queue would miss pages that aren't linked from the root HTML.
//
// `--download-images` downloads every external image into
// `{outDir}/crawl/images/` and rewrites Markdown references to relative
// paths. Use this for renderers that can't fetch external URLs (Claude
// Design, offline previews, packaged corpora).

import { mkdirSync, rmSync, writeFileSync } from "node:fs"
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
import {
  downloadAllImages,
  extractImageUrls,
  rewriteImageUrls,
} from "./crawl/images"
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
  seeds: Array<string>
  downloadImages: boolean
}

function parseArgs(argv: Array<string>): CliArgs {
  const args = argv.slice(2)
  let url = ""
  let outDir = ""
  let seedsRaw = ""
  let downloadImages = false
  const extraPositionals: Array<string> = []
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--out") {
      outDir = args[i + 1] ?? ""
      i++
    } else if (arg === "--seeds") {
      seedsRaw = args[i + 1] ?? ""
      i++
    } else if (arg === "--download-images") {
      downloadImages = true
    } else if (arg.startsWith("--")) {
      // Unknown flag — ignored.
    } else if (!url) {
      url = arg
    } else {
      // A second positional argument. The crawler takes exactly one URL; the
      // sitemap is discovered automatically, so a sitemap URL passed here is a
      // no-op. Collect it to warn rather than dropping it silently.
      extraPositionals.push(arg)
    }
  }
  if (!url) {
    console.error(
      "Usage: tsx crawl.ts <docs-site-url> [--out <dir>] [--seeds <url1,url2,...>] [--download-images]",
    )
    process.exit(1)
  }
  if (extraPositionals.length > 0) {
    console.warn(
      `[crawl] Ignoring extra argument(s): ${extraPositionals.join(", ")} — ` +
        `the crawler uses only the first URL; the sitemap is found automatically.`,
    )
  }
  let host = ""
  let origin = ""
  try {
    const parsed = new URL(url)
    host = parsed.host
    origin = parsed.origin
  } catch {
    console.error(`[crawl] Invalid URL: ${url}`)
    process.exit(1)
  }
  // Parse seeds: comma-separated, trim whitespace, resolve relatives against
  // the site origin, and drop anything malformed.
  const seeds = seedsRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      try {
        return new URL(s, origin).toString()
      } catch {
        console.warn(`[crawl] Ignoring malformed seed URL: ${s}`)
        return ""
      }
    })
    .filter((s) => s.length > 0)
  return {
    url,
    outDir: resolve(outDir || `./${host}-docs`),
    seeds,
    downloadImages,
  }
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
  const { url, outDir, seeds, downloadImages } = parseArgs(process.argv)
  const options: CrawlOptions = {
    maxPages: MAX_PAGES,
    concurrency: CONCURRENCY,
    userAgent: USER_AGENT,
    seeds: seeds.length > 0 ? seeds : undefined,
    downloadImages,
  }

  if (seeds.length > 0) {
    console.log(
      `[crawl] Using ${seeds.length} explicit seed URL(s); sitemap discovery skipped`,
    )
  }
  if (downloadImages) {
    console.log(
      `[crawl] Image downloading enabled — external images will be saved to crawl/images/`,
    )
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

  // Optionally localize external images. Pages' Markdown still holds the raw
  // external URLs at this point; we collect them, download in parallel into
  // `crawl/images/`, then rewrite each page's Markdown with a per-output
  // relative prefix below.
  let imageMap: Map<string, string> = new Map()
  if (downloadImages && okPages.length > 0) {
    const allUrls = okPages.flatMap((page) => extractImageUrls(page.markdown))
    const unique = Array.from(new Set(allUrls))
    if (unique.length > 0) {
      const imagesDir = join(outDir, "crawl", "images")
      rmSync(imagesDir, { recursive: true, force: true })
      mkdirSync(imagesDir, { recursive: true })
      console.log(
        `[crawl] Downloading ${unique.length} unique image(s) into crawl/images/ ...`,
      )
      const reportEvery = Math.max(1, Math.floor(unique.length / 10))
      imageMap = await downloadAllImages(
        unique,
        imagesDir,
        USER_AGENT,
        CONCURRENCY,
        (done, total) => {
          if (done === total || done % reportEvery === 0) {
            console.log(`[crawl]   images ${done}/${total}`)
          }
        },
      )
      console.log(
        `[crawl] Images: ${imageMap.size} downloaded, ${unique.length - imageMap.size} failed`,
      )
    }
  }

  // Wipe and recreate the pages directory so a re-run never leaves stale files
  // from a prior crawl (index slots can shift when the page list changes, e.g.
  // when seeds add/remove URLs between runs).
  const pagesDir = join(outDir, "crawl", "pages")
  rmSync(pagesDir, { recursive: true, force: true })
  mkdirSync(pagesDir, { recursive: true })
  const fileNames = new Map<string, string>()
  // Two rewrite prefixes for the two output depths:
  //   - corpus.md lives at outDir/ → uses `crawl/images/`
  //   - page files live at outDir/crawl/pages/ → uses `../images/`
  // When `--download-images` is off, imageMap is empty so rewrite is a no-op.
  const rewritePage = (md: string): string =>
    rewriteImageUrls(md, imageMap, "../images/")
  const rewriteCorpus = (md: string): string =>
    rewriteImageUrls(md, imageMap, "crawl/images/")
  okPages.forEach((page, index) => {
    const fileName = pageFileName(page.url, index)
    fileNames.set(page.url, `crawl/pages/${fileName}`)
    const localPage: PageResult = {
      ...page,
      markdown: rewritePage(page.markdown),
    }
    writeFileSync(
      join(outDir, "crawl", "pages", fileName),
      buildPageFile(localPage, crawledAt),
    )
  })
  const corpusPages: Array<PageResult> = pages.map((page) =>
    page.status === "ok"
      ? { ...page, markdown: rewriteCorpus(page.markdown) }
      : page,
  )
  writeFileSync(
    join(outDir, "crawl-corpus.md"),
    buildCorpus(url, corpusPages, crawledAt),
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
