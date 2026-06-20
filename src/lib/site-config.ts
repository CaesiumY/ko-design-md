// Canonical site origin used for absolute URLs in social meta. og:image,
// twitter:image, and og:url MUST be absolute — social crawlers (FB / X /
// LinkedIn / Slack / Discord / KakaoTalk) fetch the URL stand-alone with
// no page-URL context, so a relative path silently fails the preview.
//
// Set `VITE_SITE_URL=https://your-domain` at build time. See `.env.example`
// for the expected shape. Trailing slashes are stripped so callers can
// compose paths starting with "/".
//
// Production builds without the env are a hard error: shipping with
// relative og:image is one of those bugs you only discover when someone
// shares the link on Slack and the preview is blank. Dev builds keep the
// empty-fallback ergonomics — browsers resolve relative URLs against
// document.URL so local development still works.
const RAW = import.meta.env.VITE_SITE_URL ?? ""

if (import.meta.env.PROD && !RAW) {
  throw new Error(
    "VITE_SITE_URL must be set for production builds. See .env.example for the expected shape."
  )
}

export const SITE_URL = RAW.replace(/\/+$/, "")

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}

// Reverse of absoluteUrl: when SITE_URL is configured and the input URL
// shares that origin, return just the path portion. Otherwise return the
// input unchanged.
//
// Use case: design.md frontmatter stores fully-qualified URLs so the file
// stays meaningful when copied outside the site (PRD User Story 1 —
// vibe-coding flow). But in-site rendering should fetch the same-origin
// asset, not the production-domain URL — otherwise a localhost dev session
// hits the production CDN for every card-grid logo, which breaks when
// prod is down, the asset isn't deployed yet, or the user is offline.
//
// When VITE_SITE_URL is unset (test/SSR/dev-without-env), the input is
// returned unchanged — the browser will resolve it as-is.
export function siteRelativeIfSelf(
  url: string | undefined
): string | undefined {
  if (!url || !SITE_URL) return url
  if (url === SITE_URL) return "/"
  if (url.startsWith(`${SITE_URL}/`)) return url.slice(SITE_URL.length)
  return url
}

// Extracts the path portion of a logo URL for in-site rendering.
//
// design.md frontmatter stores logos as fully-qualified URLs so the file
// stays meaningful when copied outside the site (PRD User Story 1 —
// vibe-coding flow). But in-site rendering should always hit the local
// `public/logos/{slug}.{ext}` asset — design-md skill policy guarantees
// that file exists, so the URL's path component is always a safe target.
//
// Unlike `siteRelativeIfSelf`, this is origin-agnostic and has no
// VITE_SITE_URL dependency, so dev sessions work without any env setup.
// Already-relative inputs, unparseable strings, and non-http(s) URLs
// (data:, blob:, etc.) are returned unchanged — misconfigured frontmatter
// still surfaces in the onError fallback rather than being silently
// mangled, and data URIs stay intact rather than being collapsed to a
// broken relative path. Query strings and fragments survive in case
// frontmatter ever uses cache-busting params.
export function localLogoPath(url: string | undefined): string | undefined {
  if (!url) return url
  if (url.startsWith("/")) return url
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return url
    return parsed.pathname + parsed.search + parsed.hash
  } catch {
    return url
  }
}

// Canonical GitHub repository URL. Mirrors `repository.url` in package.json
// and is the single source of truth for header link, contribute dialog,
// issue template / CONTRIBUTING anchors composed at runtime.
export const GITHUB_REPO_URL = "https://github.com/caesiumy/ko-design-md"
