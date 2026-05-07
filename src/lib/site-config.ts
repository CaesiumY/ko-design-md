// Canonical site origin used for absolute URLs in social meta. og:image and
// twitter:image MUST be absolute — crawlers (FB/X/LinkedIn/Slack/Discord)
// fetch them stand-alone and have no page URL to resolve relative paths
// against.
//
// Override at build time with `VITE_SITE_URL=https://example.com`. Trailing
// slash is stripped so callers can compose paths with a leading "/" safely.
const RAW = import.meta.env.VITE_SITE_URL ?? "https://ko-design.md"

export const SITE_URL = RAW.replace(/\/+$/, "")

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}
