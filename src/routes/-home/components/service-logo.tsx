import { useEffect, useState } from "react"
import { localLogoPath } from "@/lib/site-config"
import { cn } from "@/lib/utils"

interface Props {
  name: string
  logo?: string
  size?: number
  className?: string
}

function pickInitial(name: string): string {
  const trimmed = name.trim()
  if (trimmed.length === 0) return "?"
  return Array.from(trimmed)[0].toUpperCase()
}

function FallbackBadge({
  name,
  size,
  className,
  ariaHidden = true,
}: {
  name: string
  size: number
  className?: string
  ariaHidden?: boolean
}) {
  return (
    <span
      aria-hidden={ariaHidden ? true : undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-secondary text-[11px] font-bold tracking-tight text-secondary-foreground select-none",
        className
      )}
      style={{ width: size, height: size }}
    >
      {pickInitial(name)}
    </span>
  )
}

export function ServiceLogo({ name, logo, size = 24, className }: Props) {
  const [failed, setFailed] = useState(false)

  // Reset failure state if the logo path itself changes (e.g., HMR or
  // navigation to a different service).
  useEffect(() => {
    setFailed(false)
  }, [logo])

  if (logo && !failed) {
    const src = localLogoPath(logo)
    return (
      <img
        src={src}
        alt=""
        aria-hidden
        onError={() => {
          if (typeof console !== "undefined") {
            console.warn(`[ServiceLogo] failed to load "${logo}", falling back`)
          }
          setFailed(true)
        }}
        className={cn("shrink-0 object-contain select-none", className)}
        style={{ width: size, height: size }}
      />
    )
  }

  return <FallbackBadge name={name} size={size} className={className} />
}
