// Shared types for the docs-crawler engine.

export interface CrawlOptions {
  /** Hard cap on how many pages to crawl. */
  maxPages: number
  /** How many pages to fetch in parallel. */
  concurrency: number
  /** User-Agent string sent with every request. */
  userAgent: string
}

export type CrawlMethod = "fetch" | "playwright"

export type PageStatus = "ok" | "failed"

export interface PageResult {
  url: string
  title: string
  markdown: string
  /** Which fetch path produced the final content. */
  method: CrawlMethod
  status: PageStatus
  /** Length of extracted plain text — the JS-fallback decision signal. */
  chars: number
  error?: string
}

export interface ManifestPage {
  url: string
  /** Repo-relative path of the per-page file, or null when the page failed. */
  file: string | null
  status: PageStatus
  method: CrawlMethod
  chars: number
  error?: string
}

export interface CrawlManifest {
  docsSiteUrl: string
  crawledAt: string
  total: number
  ok: number
  failed: number
  pages: Array<ManifestPage>
}
