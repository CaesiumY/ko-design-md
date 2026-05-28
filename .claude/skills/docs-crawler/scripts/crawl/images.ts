// External-image localization: extract image URLs from extracted Markdown,
// download them next to the corpus, and rewrite the Markdown to reference
// the local copies. Pure helpers stay deterministic; only `downloadImage`
// performs I/O.

import { createHash } from "node:crypto"
import { writeFileSync } from "node:fs"
import { join } from "node:path"

// Markdown image syntax: ![alt](url "optional title")
// The url group is non-greedy and stops at the first space (title) or `)`.
// We then filter to absolute http(s) URLs since relative paths are already
// either local or unreachable.
const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\((\S+?)(?:\s+"[^"]*")?\)/g

/** Pull every absolute http(s) image URL out of a Markdown string. Pure. */
export function extractImageUrls(markdown: string): Array<string> {
  const urls: Array<string> = []
  for (const match of markdown.matchAll(MARKDOWN_IMAGE_RE)) {
    const url = match[1]
    if (!url) continue
    if (!/^https?:\/\//i.test(url)) continue
    urls.push(url)
  }
  return urls
}

/**
 * Map an external image URL to a stable, collision-safe local filename.
 * Uses an 8-char SHA1 prefix so two different URLs sharing the same basename
 * (a common Gatsby pattern: `static/{hashA}/{size}/foo.png` and
 * `static/{hashB}/{size}/foo.png`) don't overwrite each other.
 */
export function localImageName(url: string): string {
  const hash = createHash("sha1").update(url).digest("hex").slice(0, 8)
  let basename = "image"
  let extension = ""
  try {
    const path = new URL(url).pathname
    const last = path.split("/").filter(Boolean).pop() ?? ""
    const dotIdx = last.lastIndexOf(".")
    if (dotIdx > 0 && dotIdx < last.length - 1) {
      basename = last.slice(0, dotIdx)
      extension = last.slice(dotIdx).toLowerCase()
    } else if (last) {
      basename = last
    }
  } catch {
    // keep defaults
  }
  basename = basename.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "")
  if (!basename) basename = "image"
  if (basename.length > 60) basename = basename.slice(0, 60)
  // Permit a small allowlist of image extensions; otherwise drop it to avoid
  // attaching nonsense suffixes that confuse downstream tooling.
  const safeExt = /^\.(png|jpe?g|gif|svg|webp|avif|ico|bmp)$/i.test(extension)
    ? extension
    : ""
  return `${hash}-${basename}${safeExt}`
}

/**
 * Rewrite every absolute http(s) image URL in `markdown` to the mapped local
 * filename, prefixed with `pathPrefix`. URLs not in the map are left alone
 * (e.g. download failures should keep the original reference so the page is
 * still navigable). Pure.
 */
export function rewriteImageUrls(
  markdown: string,
  urlToLocal: Map<string, string>,
  pathPrefix: string,
): string {
  return markdown.replace(MARKDOWN_IMAGE_RE, (whole, rawUrl: string) => {
    if (!/^https?:\/\//i.test(rawUrl)) return whole
    const local = urlToLocal.get(rawUrl)
    if (!local) return whole
    // Anchor on the alt-text closing `]` to find the URL group's opening `(`.
    // A `lastIndexOf("(")` approach would mis-detect when the title contains
    // parens, e.g. `![alt](url "title (something)")` — the title's `(` is
    // closer to the trailing `)` than the URL's `(` is.
    const altEnd = whole.indexOf("]")
    if (altEnd === -1) return whole
    const urlStart = whole.indexOf("(", altEnd)
    if (urlStart === -1) return whole
    const before = whole.slice(0, urlStart + 1)
    const after = whole.slice(urlStart + 1 + rawUrl.length)
    return `${before}${pathPrefix}${local}${after}`
  })
}

/**
 * Download a single image with a bounded timeout. Returns whether the write
 * succeeded — callers use this to decide whether to include the URL in the
 * rewrite map. Stays out of the page-fetch error path on purpose: a failed
 * image must not fail the page crawl.
 */
export async function downloadImage(
  url: string,
  destPath: string,
  userAgent: string,
  timeoutMs = 20_000,
): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": userAgent },
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return false
    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.length === 0) return false
    writeFileSync(destPath, buffer)
    return true
  } catch {
    return false
  }
}

/**
 * Download every URL into `imagesDir` in parallel (capped by `concurrency`).
 * Returns a map of successful URL → local filename so the caller can rewrite
 * Markdown references. Failed URLs are simply omitted from the map.
 */
export async function downloadAllImages(
  urls: Array<string>,
  imagesDir: string,
  userAgent: string,
  concurrency: number,
  onProgress?: (done: number, total: number, ok: boolean) => void,
): Promise<Map<string, string>> {
  const dedupedUrls = Array.from(new Set(urls))
  // Assign local names ahead of time; if two URLs happen to collide on the
  // 8-char hash + basename (vanishingly unlikely but theoretically possible),
  // the second URL keeps its hash slot and overwrites — which is fine because
  // hash collision means the second is effectively the same payload anyway.
  const plan = dedupedUrls.map((url) => ({ url, name: localImageName(url) }))
  const result = new Map<string, string>()
  let cursor = 0
  let done = 0
  async function worker(): Promise<void> {
    // Claim a slot atomically (idx first, bound-check next) so a future async
    // refactor adding `await` between the check and the increment can't slip
    // a second worker through the same index.
    while (true) {
      const idx = cursor++
      if (idx >= plan.length) break
      const { url, name } = plan[idx]
      const ok = await downloadImage(url, join(imagesDir, name), userAgent)
      if (ok) result.set(url, name)
      done++
      onProgress?.(done, plan.length, ok)
    }
  }
  const workerCount = Math.min(Math.max(concurrency, 1), plan.length || 1)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return result
}
