// Canonical site origin used for absolute URLs in social meta. og:image,
// twitter:image, and og:url MUST be absolute — social crawlers (FB / X /
// LinkedIn / Slack / Discord / KakaoTalk) fetch the URL stand-alone with
// no page-URL context, so a relative path silently fails the preview.
//
// Set `VITE_SITE_URL=https://your-domain` at build time. See `.env.example`
// for the expected shape. Without it, absoluteUrl falls back to the raw
// path — fine for local dev (browsers resolve against document.URL) but
// will break crawlers in production. Trailing slashes are stripped so
// callers can compose paths starting with "/".
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "").replace(/\/+$/, "")

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}
