// Builds the hits.sh SVG badge URL for a service's view counter.
//
// hits.sh renders the count into the SVG itself (we cannot read the number
// back), so styling is limited to its shields-style query params. We pin
// `flat-square` (square corners, matching NewBadge) and our muted palette
// (`color` ≈ --muted-foreground oklch(0.40 0 0)); the font stays hits.sh's
// built-in Verdana — an accepted trade-off of using an image badge.
const BADGE_PARAMS =
  "style=flat-square&label=VIEWS&color=595959&labelColor=eeeeee"

// `namespace` must be a valid URI that hits.sh accepts — a domain
// (`ko-design-md.dev`) or an `owner/repo` path (`github.com/CaesiumY/ko-design-md`).
// A bare dot-less string is rejected as "Not a valid URI". It is interpolated
// verbatim so slashes in a repo path survive; only the slug is percent-encoded.
export function hitsBadgeUrl(namespace: string, slug: string): string {
  return `https://hits.sh/${namespace}/${encodeURIComponent(slug)}.svg?${BADGE_PARAMS}`
}

// Derives the hits.sh namespace from the site's own `VITE_SITE_URL` — no
// separate env var needed. hits.sh wants a domain, so we take the host
// (`https://ko-design-md.dev` → `ko-design-md.dev`). Returns null when the
// URL is unset (the pre-deploy default) or unparseable, which makes the
// badge hide itself instead of pointing at a bogus counter or throwing.
export function hitsNamespaceFromSiteUrl(
  siteUrl: string | undefined,
): string | null {
  if (!siteUrl) return null
  try {
    return new URL(siteUrl).host || null
  } catch {
    return null
  }
}
