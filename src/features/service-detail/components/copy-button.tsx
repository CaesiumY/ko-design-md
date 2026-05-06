import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  raw: string
  filename: string
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function CopyButton({ raw, filename }: Props) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(raw)
      setCopied(true)
      toast.success("design.md 복사됨", {
        description: `${filename} · LLM 채팅창에 그대로 붙여넣어 보세요.`,
      })
      setTimeout(() => setCopied(false), 1800)
    } catch (err) {
      toast.error("복사 실패", {
        description: err instanceof Error ? err.message : "Clipboard API 미지원",
      })
    }
  }

  return (
    <Button
      onClick={onCopy}
      size="lg"
      className="group/copy w-full transition-all duration-200 hover:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent-glow)_30%,transparent)] active:scale-[0.98]"
    >
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
      <span>{copied ? "Copied" : "Copy design.md"}</span>
    </Button>
  )
}
