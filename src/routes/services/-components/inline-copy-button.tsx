import type { CopySurface } from "@/hooks/use-copy-feedback"
import { CheckIcon, CopyIcon } from "@/components/ui/icons"
import { useCopyFeedback } from "@/hooks/use-copy-feedback"
import { cn } from "@/lib/utils"

interface Props {
  raw: string
  filename: string
  /**
   * Which copy this is. Required and caller-supplied because this component is
   * used twice on the same page for different payloads - the md and the token
   * sidecar - and a shared default would merge the two into one number.
   */
  surface: CopySurface
  slug: string
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
  surface,
  slug,
  label = "복사",
  className,
}: Props) {
  const { copied, copy } = useCopyFeedback(raw, { surface, slug })

  // Visible label first so it is contained in the accessible name — voice
  // control users say what they see (WCAG 2.5.3); the filename trails as extra
  // context. Keep it stable across the copy so a focused button is not renamed
  // mid-interaction; the live region below carries the confirmation instead.
  const accessibleName = `${label} — ${filename}`

  return (
    <>
      <button
        type="button"
        onClick={copy}
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
