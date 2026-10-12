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

  // An outside change (e.g., the header link clearing `?q=`) replaces the local
  // text during render, so the first commit already shows it and the debounce
  // below never arms a timer for the old text — React's "adjusting state when
  // a prop changes" pattern (#537). An outside change wins over a pending
  // keystroke, as it did when this sync ran in an effect.
  const [seenValue, setSeenValue] = useState(value)
  if (value !== seenValue) {
    setSeenValue(value)
    setLocal(value)
  }

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
        className="block w-full border border-border bg-transparent py-2.5 pr-3 pl-10 text-sm transition-colors placeholder:text-muted-foreground/70 focus:border-foreground/50 focus:ring-2 focus:ring-ring focus:outline-none"
      />
    </div>
  )
}
