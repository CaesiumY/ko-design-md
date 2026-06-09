import { useState } from "react"

import { cn } from "@/lib/utils"

interface Props {
  raw: string
  filename: string
  /** Idle-state button text. Defaults to "Copy". */
  label?: string
  className?: string
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

export function InlineCopyButton({
  raw,
  filename,
  label = "Copy",
  className,
}: Props) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(raw)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard rejection is rare; fall through silently and let the
      // button stay in its idle state instead of surfacing an error toast.
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copy ${filename}`}
      className={cn(
        "border-border bg-background/80 inline-flex h-8 items-center gap-2 border px-3 text-xs font-semibold tracking-[0.12em] uppercase backdrop-blur transition-colors",
        "hover:bg-foreground hover:text-background",
        copied && "bg-foreground text-background",
        className,
      )}
    >
      {copied ? (
        <CheckIcon className="size-3.5" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
      <span>{copied ? "Copied" : label}</span>
    </button>
  )
}
