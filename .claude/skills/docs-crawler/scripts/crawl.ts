// docs-crawler engine entry point.
//
// Usage:
//   tsx crawl.ts <docs-site-url> [--out <dir>]
//                                 [--seeds <url1,url2,...>]
//                                 [--external-images]
//
// Crawls an entire documentation site (sitemap-driven, link-BFS fallback) and
// writes a Markdown corpus. Static pages are fetched directly; JS-rendered
// pages fall back to a headless browser.
//
// Images are localized by default: every external image and inline base64
// `data:` image is saved into `{outDir}/crawl/images/` and Markdown references
// are rewritten to relative paths, so the corpus is self-contained for
// renderers that can't fetch external URLs (Claude Design, offline previews,
// packaged corpora). Pass `--external-images` to keep external URLs as-is and
// drop inline data images to a placeholder instead.
//
// `--seeds` lets the caller supply explicit starting URLs for BFS. Use it for
// SPA/SSG sites whose sidebar nav is client-rendered and so the default
// `[rootUrl]` queue would miss pages that aren't linked from the root HTML.

import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { parseArgs } from "./crawl/args"
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
  extractDataUris,
  extractImageUrls,
  INLINE_IMAGE_PLACEHOLDER,
  rewriteImageUrls,
  saveDataUris,
} from "./crawl/images"
import type { CrawlOptions, PageResult } from "./crawl/types"

const USER_AGENT =
  "ko-design-md-docs-crawler/0.1 (+https://github.com/CaesiumY/ko-design-md)"
// Below this much extracted text, a page is treated as a JS shell and retried
// through the headless browser.
const MIN_CONTENT_CHARS = 200
const MAX_PAGES = 200
const CONCURRENCY = 5

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
  console.log(
    downloadImages
      ? `[crawl] Localizing images into crawl/images/ (pass --external-images to keep external URLs)`
      : `[crawl] Keeping external image URLs (--external-images); inline data: images dropped to a placeholder`,
  )
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

  // Localize images so the corpus is self-contained. Two maps drive the rewrite
  // below: `localized` maps an external URL or base64 data: URI to a file saved
  // in `crawl/images/` (rewritten with a relative prefix), and `placeholders`
  // maps a data: URI we won't keep to the bare INLINE_IMAGE_PLACEHOLDER (no
  // prefix). With --external-images we download nothing, leave http(s) URLs
  // untouched, and only collapse inline data: images to the placeholder.
  const localized = new Map<string, string>()
  const placeholders = new Map<string, string>()
  if (okPages.length > 0) {
    const httpUrls = Array.from(
      new Set(okPages.flatMap((page) => extractImageUrls(page.markdown))),
    )
    const dataUris = Array.from(
      new Set(okPages.flatMap((page) => extractDataUris(page.markdown))),
    )
    if (downloadImages && (httpUrls.length > 0 || dataUris.length > 0)) {
      const imagesDir = join(outDir, "crawl", "images")
      rmSync(imagesDir, { recursive: true, force: true })
      mkdirSync(imagesDir, { recursive: true })
      if (httpUrls.length > 0) {
        console.log(
          `[crawl] Downloading ${httpUrls.length} external image(s) into crawl/images/ ...`,
        )
        const reportEvery = Math.max(1, Math.floor(httpUrls.length / 10))
        const httpMap = await downloadAllImages(
          httpUrls,
          imagesDir,
          USER_AGENT,
          CONCURRENCY,
          (done, total) => {
            if (done === total || done % reportEvery === 0) {
              console.log(`[crawl]   images ${done}/${total}`)
            }
          },
        )
        for (const [uri, name] of httpMap) localized.set(uri, name)
        console.log(
          `[crawl] External images: ${httpMap.size} downloaded, ${httpUrls.length - httpMap.size} failed`,
        )
      }
      if (dataUris.length > 0) {
        const dataMap = saveDataUris(dataUris, imagesDir)
        for (const [uri, name] of dataMap) localized.set(uri, name)
        // Inline images we couldn't decode collapse to the placeholder so raw
        // base64 never reaches the corpus.
        for (const uri of dataUris) {
          if (!dataMap.has(uri)) placeholders.set(uri, INLINE_IMAGE_PLACEHOLDER)
        }
        console.log(
          `[crawl] Inline images: ${dataMap.size}/${dataUris.length} saved to crawl/images/`,
        )
      }
    } else if (!downloadImages) {
      // External-images mode: http(s) URLs stay external; inline data: images
      // are still stripped so base64 never bloats the corpus.
      for (const uri of dataUris) {
        placeholders.set(uri, INLINE_IMAGE_PLACEHOLDER)
      }
    }
  }

  // Wipe and recreate the pages directory so a re-run never leaves stale files
  // from a prior crawl (index slots can shift when the page list changes, e.g.
  // when seeds add/remove URLs between runs).
  const pagesDir = join(outDir, "crawl", "pages")
  rmSync(pagesDir, { recursive: true, force: true })
  mkdirSync(pagesDir, { recursive: true })
  const fileNames = new Map<string, string>()
  // Rewrite localized references with the per-depth relative prefix, then strip
  // placeholder data: URIs with an empty prefix:
  //   - corpus.md lives at outDir/ → uses `crawl/images/`
  //   - page files live at outDir/crawl/pages/ → uses `../images/`
  // Empty maps make either rewrite a no-op.
  const rewritePage = (md: string): string =>
    rewriteImageUrls(
      rewriteImageUrls(md, localized, "../images/"),
      placeholders,
      "",
    )
  const rewriteCorpus = (md: string): string =>
    rewriteImageUrls(
      rewriteImageUrls(md, localized, "crawl/images/"),
      placeholders,
      "",
    )
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
