// CLI argument parsing for the docs crawler. Kept in its own module so it can
// be unit-tested directly: importing crawl.ts would run its top-level `main()`
// and kick off a real crawl, so the parser lives here instead.

import { resolve } from "node:path"

export interface CliArgs {
  url: string
  outDir: string
  seeds: Array<string>
  downloadImages: boolean
}

export function parseArgs(argv: Array<string>): CliArgs {
  const args = argv.slice(2)
  let url = ""
  let outDir = ""
  let seedsRaw = ""
  // Images are localized by default so the corpus is self-contained (renderers
  // like Claude Design can't reach external URLs). Callers opt back into raw
  // external URLs with --external-images. --download-images is still accepted
  // as a now-redundant backward-compatible alias.
  let downloadImages = true
  const extraPositionals: Array<string> = []
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--out") {
      outDir = args[i + 1] ?? ""
      i++
    } else if (arg === "--seeds") {
      seedsRaw = args[i + 1] ?? ""
      i++
    } else if (arg === "--external-images") {
      downloadImages = false
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
      "Usage: tsx crawl.ts <docs-site-url> [--out <dir>] [--seeds <url1,url2,...>] [--external-images]"
    )
    process.exit(1)
  }
  if (extraPositionals.length > 0) {
    console.warn(
      `[crawl] Ignoring extra argument(s): ${extraPositionals.join(", ")} — ` +
        `the crawler uses only the first URL; the sitemap is found automatically.`
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
