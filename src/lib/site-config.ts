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
    "VITE_SITE_URL must be set for production builds. See .env.example for the expected shape.",
  )
}

export const SITE_URL = RAW.replace(/\/+$/, "")

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}
