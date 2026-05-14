import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  raw: string
}

function CopyIcon({ className }: { className?: string }) {
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
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function CopyButton({ raw }: Props) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(raw)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard rejection is rare in practice (requires denied permission
      // or a non-secure context); fall through silently. The button just
      // doesn't flip to the "Copied" state.
    }
  }

  return (
    <Button
      onClick={onCopy}
      size="lg"
      className="group/copy w-full justify-between font-bold tracking-tight transition-opacity duration-200 hover:opacity-90 active:scale-[0.98]"
    >
      <span className="inline-flex items-center gap-2.5">
        <span className="relative inline-flex size-4 items-center justify-center">
          <CopyIcon
            className={cn(
              "absolute size-4 transition-all duration-200",
              copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
            )}
          />
          <CheckIcon
            className={cn(
              "absolute size-4 transition-all duration-200",
              copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
            )}
          />
        </span>
        <span>{copied ? "Copied" : "design.md 전체 복사"}</span>
      </span>
      <span aria-hidden className="text-base">→</span>
    </Button>
  )
}
