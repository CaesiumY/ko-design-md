// Image localization: extract image references from extracted Markdown,
// download external images (and decode inline base64 `data:` images) next to
// the corpus, and rewrite the Markdown to reference the local copies. Pure
// helpers stay deterministic; only `downloadImage` and `saveDataUris` do I/O.

import { createHash } from "node:crypto"
import { writeFileSync } from "node:fs"
import { join } from "node:path"

// Markdown image syntax: ![alt](url "optional title"). The url group is
// non-greedy and stops at the first space (title) or `)`. Callers decide which
// captured URLs they care about (http(s) externals vs base64 `data:` URIs).
const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\((\S+?)(?:\s+"[^"]*")?\)/g

// Substituted for inline images that cannot be turned into a local file (a
// non-base64 data URI, or one whose bytes failed to decode). Exported so
// extract.ts shares a single source of truth for the placeholder string.
export const INLINE_IMAGE_PLACEHOLDER = "inline-image-omitted"

// A base64 `data:` image URI: `data:<image-mime>;base64,<payload>`. The base64
// payload has no spaces, parens, or quotes, so it is safe to capture from and
// rewrite within markdown link syntax. Non-base64 (percent-encoded) data URIs
// are excluded — they can contain characters that break that syntax.
const DATA_URI_RE = /^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=]+)$/i

// Allowlist of inline-image MIME types we localize, mapped to a file extension.
const DATA_URI_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
  "image/bmp": ".bmp",
}

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
 * Whether `value` is a base64 `data:` image URI — safe to carry through markdown
 * link syntax and a candidate for localization. extract.ts shares this predicate
 * so the data URIs it preserves are exactly the ones the crawler later collects,
 * leaving no raw base64 unaccounted for in the corpus. Pure.
 */
export function isBase64ImageDataUri(value: string): boolean {
  return DATA_URI_RE.test(value)
}

/** Pull every base64 `data:` image URI out of a Markdown string. Pure. */
export function extractDataUris(markdown: string): Array<string> {
  const uris: Array<string> = []
  for (const match of markdown.matchAll(MARKDOWN_IMAGE_RE)) {
    const url = match[1]
    if (!url) continue
    if (isBase64ImageDataUri(url)) uris.push(url)
  }
  return uris
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
 * Decode a base64 `data:` image URI into its bytes plus a MIME-derived file
 * extension. Returns null when the URI is not a base64 image, has an
 * unsupported MIME type, or decodes to nothing. Pure.
 */
export function decodeDataUri(
  uri: string
): { buffer: Buffer; ext: string } | null {
  const match = DATA_URI_RE.exec(uri)
  if (!match) return null
  const ext = DATA_URI_EXT[match[1].toLowerCase()]
  if (!ext) return null
  const buffer = Buffer.from(match[2], "base64")
  if (buffer.length === 0) return null
  return { buffer, ext }
}

/**
 * Map a base64 `data:` URI to a stable local filename: an 8-char SHA1 prefix of
 * the full URI plus the MIME-derived extension. Different payloads hash to
 * different names. Pure.
 */
export function localDataUriName(uri: string): string {
  const hash = createHash("sha1").update(uri).digest("hex").slice(0, 8)
  const match = DATA_URI_RE.exec(uri)
  const ext = match ? (DATA_URI_EXT[match[1].toLowerCase()] ?? "") : ""
  return `${hash}${ext}`
}

/**
 * Decode each base64 `data:` URI and write it into `imagesDir`, returning a map
 * of URI → local filename for the ones that succeeded. URIs that fail to decode
 * or whose write throws are omitted so the caller can collapse them to
 * INLINE_IMAGE_PLACEHOLDER instead.
 */
export function saveDataUris(
  uris: Array<string>,
  imagesDir: string
): Map<string, string> {
  const result = new Map<string, string>()
  for (const uri of Array.from(new Set(uris))) {
    const decoded = decodeDataUri(uri)
    if (!decoded) continue
    const name = localDataUriName(uri)
    // Mirror downloadImage: an I/O failure (disk full, permissions, a bad
    // path) must not abort the crawl — skip the image instead of throwing.
    try {
      writeFileSync(join(imagesDir, name), decoded.buffer)
      result.set(uri, name)
    } catch (error) {
      console.warn(`[crawl] Failed to save inline image ${name}:`, error)
    }
  }
  return result
}

/**
 * Rewrite every mapped image reference in `markdown` to the mapped local
 * filename, prefixed with `pathPrefix`. References not in the map are left
 * alone (e.g. download failures keep the original URL so the page is still
 * navigable). Handles http(s) URLs and base64 `data:` URIs alike. Pure.
 */
export function rewriteImageUrls(
  markdown: string,
  urlToLocal: Map<string, string>,
  pathPrefix: string
): string {
  return markdown.replace(MARKDOWN_IMAGE_RE, (whole, rawUrl: string) => {
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
  timeoutMs = 20_000
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
  onProgress?: (done: number, total: number, ok: boolean) => void
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
