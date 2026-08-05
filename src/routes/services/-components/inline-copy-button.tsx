import { useEffect, useRef, useState } from "react"

import { CheckIcon, CopyIcon } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

interface Props {
  raw: string
  filename: string
  /**
   * Idle-state button text. Defaults to "복사".
   *
   * Keep it Korean: the confirmation below is a hardcoded "복사됨", so an
   * English label would switch languages mid-interaction — the exact bug this
   * component was fixed for. Types cannot enforce that, so the default is the
   * guard for callers that do not pass one.
   */
  label?: string
  className?: string
}

export function InlineCopyButton({
  raw,
  filename,
  label = "복사",
  className,
}: Props) {
  const [copied, setCopied] = useState(false)
  const revertTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(revertTimer.current), [])

  // Visible label first so it is contained in the accessible name — voice
  // control users say what they see (WCAG 2.5.3); the filename trails as extra
  // context. Keep it stable across the copy so a focused button is not renamed
  // mid-interaction; the live region below carries the confirmation instead.
  const accessibleName = `${label} — ${filename}`

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(raw)
      setCopied(true)
      // Cancel the pending revert so a second click gets a full dwell instead
      // of inheriting the first click's deadline.
      window.clearTimeout(revertTimer.current)
      revertTimer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard rejection is rare; fall through silently and let the
      // button stay in its idle state instead of surfacing an error toast.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        aria-label={accessibleName}
        className={cn(
          "inline-flex h-8 items-center gap-2 border border-border bg-background/80 px-3 text-xs font-semibold tracking-[0.12em] uppercase backdrop-blur transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
          "hover:bg-foreground hover:text-background",
          copied && "bg-foreground text-background",
          className
        )}
      >
        {copied ? (
          <CheckIcon className="size-3.5" />
        ) : (
          <CopyIcon className="size-3.5" />
        )}
        <span>{copied ? "복사됨" : label}</span>
      </button>
      {/* Sibling, not child: a button makes its descendants presentational,
          which would strip role="status" and silence this. */}
      <span role="status" className="sr-only">
        {copied ? `${filename} 복사됨` : ""}
      </span>
    </>
  )
}
