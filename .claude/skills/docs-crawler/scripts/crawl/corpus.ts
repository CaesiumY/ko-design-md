// Corpus assembly: per-page files, the merged corpus, and the manifest.
// Pure: deterministic given a fixed `crawledAt`.

import type { CrawlManifest, PageResult } from "./types"

/** Build a stable, collision-free per-page filename: `001-getting-started.md`. */
export function pageFileName(pageUrl: string, index: number): string {
  let path = pageUrl
  try {
    path = new URL(pageUrl).pathname
  } catch {
    // keep raw string
  }
  let slug = path
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
  if (!slug) slug = "index"
  if (slug.length > 60) slug = slug.slice(0, 60).replace(/-+$/g, "")
  return `${String(index + 1).padStart(3, "0")}-${slug}.md`
}

/** A single crawled page as a standalone Markdown file with frontmatter. */
export function buildPageFile(page: PageResult, crawledAt: string): string {
  return [
    "---",
    `source_url: ${JSON.stringify(page.url)}`,
    `title: ${JSON.stringify(page.title)}`,
    `method: ${page.method}`,
    `crawled_at: ${crawledAt}`,
    "---",
    "",
    page.markdown,
    "",
  ].join("\n")
}

/**
 * Merge all successful pages into one corpus document. Each page keeps its
 * `Source:` URL so a downstream reader can cite the exact public page.
 */
export function buildCorpus(
  docsSiteUrl: string,
  pages: Array<PageResult>,
  crawledAt: string
): string {
  const okPages = pages.filter((page) => page.status === "ok")
  const toc = okPages
    .map((page, i) => `${i + 1}. ${page.title} — ${page.url}`)
    .join("\n")
  const sections = okPages
    .map(
      (page) => `## ${page.title}\n\nSource: ${page.url}\n\n${page.markdown}`
    )
    .join("\n\n---\n\n")
  return [
    "# Crawled documentation corpus",
    "",
    `Source site: ${docsSiteUrl}`,
    `Crawled at: ${crawledAt}`,
    `Pages: ${okPages.length} of ${pages.length} attempted`,
    "",
    "## Contents",
    "",
    toc || "(no pages)",
    "",
    "---",
    "",
    sections,
    "",
  ].join("\n")
}

/** Build the audit manifest describing every attempted page. */
export function buildManifest(
  docsSiteUrl: string,
  pages: Array<PageResult>,
  fileNames: Map<string, string>,
  crawledAt: string
): CrawlManifest {
  const ok = pages.filter((page) => page.status === "ok").length
  return {
    docsSiteUrl,
    crawledAt,
    total: pages.length,
    ok,
    failed: pages.length - ok,
    pages: pages.map((page) => ({
      url: page.url,
      file: fileNames.get(page.url) ?? null,
      status: page.status,
      method: page.method,
      chars: page.chars,
      ...(page.error !== undefined ? { error: page.error } : {}),
    })),
  }
}
