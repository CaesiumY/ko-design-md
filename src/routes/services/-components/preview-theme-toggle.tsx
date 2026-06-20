import { cn } from "@/lib/utils"

export type PreviewTheme = "light" | "dark"

interface Props {
  theme: PreviewTheme
  onChange: (next: PreviewTheme) => void
  className?: string
}

function SunIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function PreviewThemeToggle({ theme, onChange, className }: Props) {
  return (
    <div
      role="group"
      aria-label="Preview theme"
      className={cn(
        "inline-flex items-center border border-border bg-background/80 backdrop-blur",
        className
      )}
    >
      <button
        type="button"
        aria-label="Light theme"
        aria-pressed={theme === "light"}
        onClick={() => onChange("light")}
        className={cn(
          "flex size-8 items-center justify-center transition-colors",
          theme === "light"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <SunIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Dark theme"
        aria-pressed={theme === "dark"}
        onClick={() => onChange("dark")}
        className={cn(
          "flex size-8 items-center justify-center transition-colors",
          theme === "dark"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <MoonIcon className="size-4" />
      </button>
    </div>
  )
}
