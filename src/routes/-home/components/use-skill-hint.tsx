import { useState } from "react"

import { SKILL_INSTALL_CMD } from "@/lib/site-config"

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

// Secondary, agent-driven path shown under the hero lede. The lede sells the
// manual "click to copy design.md" flow; this hints the automated counterpart —
// the `use-design-md` skill that applies a catalogued brand to your own project.
// Kept muted (no vermillion fill) so it never competes with the catalog's primary
// copy action. The command sits in an input-like box with a small icon-only copy
// button tucked inside its right edge.
export function UseSkillHint() {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(SKILL_INSTALL_CMD)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard rejection is rare (denied permission / non-secure context);
      // fall through silently and leave the button in its idle state.
    }
  }

  return (
    <div
      className="animate-fade-in-up mt-7 break-keep sm:mt-8"
      style={{ animationDelay: "220ms" }}
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        또는 Claude Code·Cursor·Codex 등에서{" "}
        <code className="font-mono text-[0.9em] font-semibold whitespace-nowrap text-brand">
          use-design-md
        </code>{" "}
        스킬로 카탈로그 디자인을 현재 프로젝트에 바로 적용하세요.
      </p>
      <div className="mt-3 flex h-9 w-full max-w-md items-center gap-1 border border-rule-strong bg-muted pr-1 pl-3">
        <code className="min-w-0 flex-1 [scrollbar-width:none] overflow-x-auto font-mono text-xs whitespace-nowrap sm:text-sm [&::-webkit-scrollbar]:hidden">
          {SKILL_INSTALL_CMD}
        </code>
        <button
          type="button"
          onClick={onCopy}
          aria-label="use-design-md 설치 명령 복사"
          className="inline-flex size-7 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
        >
          {copied ? (
            <CheckIcon className="size-3.5" />
          ) : (
            <CopyIcon className="size-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}
