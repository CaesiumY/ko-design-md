import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckIcon, CopyIcon } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

interface Props {
  raw: string
}

// Pinned as the accessible name so it survives the swap to "복사됨". This
// button's name used to come from its own text, which meant the confirmation
// depended on a screen reader re-announcing a focused control whose name
// changed — behaviour that varies by AT. The live region beside the button
// carries it instead, matching InlineCopyButton and SwatchCard.
const IDLE_LABEL = "design.md 전체 복사"

export function CopyButton({ raw }: Props) {
  const [copied, setCopied] = useState(false)
  const revertTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(revertTimer.current), [])

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(raw)
      setCopied(true)
      // Cancel the pending revert so a second click gets a full dwell instead
      // of inheriting the first click's deadline.
      window.clearTimeout(revertTimer.current)
      revertTimer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard rejection is rare in practice (requires denied permission
      // or a non-secure context); fall through silently. The button just
      // doesn't flip to the "Copied" state.
    }
  }

  return (
    <>
      <Button
        onClick={onCopy}
        size="lg"
        aria-label={IDLE_LABEL}
        className="group/copy w-full justify-between font-bold tracking-tight transition-opacity duration-200 hover:opacity-90 active:scale-[0.98]"
      >
        <span className="inline-flex items-center gap-2.5">
          <span className="relative inline-flex size-4 items-center justify-center">
            <CopyIcon
              className={cn(
                "absolute size-4 transition-all duration-200",
                copied ? "scale-0 opacity-0" : "scale-100 opacity-100"
              )}
            />
            <CheckIcon
              className={cn(
                "absolute size-4 transition-all duration-200",
                copied ? "scale-100 opacity-100" : "scale-0 opacity-0"
              )}
            />
          </span>
          <span>{copied ? "복사됨" : IDLE_LABEL}</span>
        </span>
        <span aria-hidden className="text-base">
          →
        </span>
      </Button>
      {/* Sibling, not child: a button makes its descendants presentational,
          which would strip role="status" and silence this. */}
      <span role="status" className="sr-only">
        {copied ? "design.md 복사됨" : ""}
      </span>
    </>
  )
}
