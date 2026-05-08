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

export function ServiceLogo({ name, logo, size = 24, className }: Props) {
  const dimension = { width: size, height: size }

  if (logo) {
    return (
      <img
        src={logo}
        alt=""
        aria-hidden
        className={cn("shrink-0 select-none object-contain", className)}
        style={dimension}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        "bg-secondary text-secondary-foreground inline-flex shrink-0 select-none items-center justify-center text-[11px] font-bold tracking-tight",
        className,
      )}
      style={dimension}
    >
      {pickInitial(name)}
    </span>
  )
}
