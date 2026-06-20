import { useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  value: string
  onChange: (next: string) => void
  className?: string
}

const DEBOUNCE_MS = 200

export function DesignSearch({ value, onChange, className }: Props) {
  const [local, setLocal] = useState(value)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  })

  // External value changes (e.g., back button) should sync into the local state.
  useEffect(() => {
    setLocal(value)
  }, [value])

  useEffect(() => {
    if (local === value) return
    const handle = setTimeout(() => {
      onChangeRef.current(local)
    }, DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [local, value])

  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Search all designs"
        aria-label="Search designs"
        className="block w-full border border-border bg-transparent py-2.5 pr-3 pl-10 text-sm transition-colors placeholder:text-muted-foreground/70 focus:border-foreground/50 focus:ring-2 focus:ring-brand/30 focus:outline-none"
      />
    </div>
  )
}
