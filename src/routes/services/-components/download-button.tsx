import { track } from "@vercel/analytics"
import { Button } from "@/components/ui/button"

interface Props {
  raw: string
  slug: string
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}

// Built from `raw` in the browser rather than linked to a server route. The
// page already holds the exact bytes the copy button hands over, so a download
// needs no round trip, and the filename is ours to fix. It also keeps this
// human-facing control off `/services/{slug}/llms.txt`, which is the agent
// surface and stays as it is.
function saveAs(raw: string, filename: string) {
  const url = URL.createObjectURL(
    new Blob([raw], { type: "text/markdown;charset=utf-8" })
  )
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  // Attached for the click and revoked late: older WebKit ignores a click on a
  // detached anchor, and revoking in the same tick can cancel a download the
  // browser has not started reading yet. The delay follows FileSaver.js; one
  // leaked blob URL for 40 s costs nothing.
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 40_000)
}

export function DownloadButton({ raw, slug }: Props) {
  function download() {
    saveAs(raw, `${slug}.md`)

    // Its own event rather than `design_md_copy`. The primary metric counts
    // copies and downloads together (#336); a separate name keeps the split
    // between the two visible. Guarded for the same reason
    // as the copy hook — a dropped analytics event must not cost the reader.
    try {
      track("design_md_download", { slug })
    } catch {
      // Measurement is best-effort.
    }
  }

  return (
    <Button
      onClick={download}
      variant="outline"
      size="lg"
      className="mt-3 w-full justify-between tracking-tight transition-opacity duration-200 hover:opacity-90 active:scale-[0.98]"
    >
      <span className="inline-flex items-center gap-2.5">
        <DownloadIcon className="size-4" />
        <span>design.md 다운로드</span>
      </span>
      <span aria-hidden className="text-base">
        ↓
      </span>
    </Button>
  )
}
