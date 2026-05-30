import { useState } from "react"
import { hitsBadgeUrl, hitsNamespaceFromSiteUrl } from "@/lib/hits-badge"

// Public view-count badge served by hits.sh as an SVG image. The namespace is
// derived from VITE_SITE_URL (read at render time so tests can stub it): unset
// before deploy → the badge hides; set → counts under the site's own host.
// `onError` hides it if hits.sh is down or blocked, keeping the page intact.
export function ViewCountBadge({ slug }: { slug: string }) {
  const namespace = hitsNamespaceFromSiteUrl(import.meta.env.VITE_SITE_URL)
  const [failed, setFailed] = useState(false)

  if (!namespace || failed) return null

  return (
    <img
      src={hitsBadgeUrl(namespace, slug)}
      alt={`${slug} 조회수`}
      className="inline-block h-[18px] w-auto align-baseline"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
