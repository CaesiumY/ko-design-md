import { useCallback, useEffect, useRef, useState } from "react"

/**
 * How long the "복사됨" confirmation stays up. Shared so the four copy
 * affordances — and the tests that advance timers past it — cannot drift apart
 * on timing. Not a hook parameter: no caller wants a different dwell, and a
 * knob nobody turns is just a wider surface to keep working.
 */
export const COPY_DWELL_MS = 1800

/**
 * Clipboard write plus the confirmation state that follows it.
 *
 * This was copy-pasted into every copy affordance instead of shared, and the
 * duplication cost real defects: the "a second click inherits the first one's
 * deadline" bug and the "live region nested in a button never announces" bug
 * each had to be found and fixed in three separate components, and the fourth
 * (the home skill hint) still carried the original version of both. Owning the
 * state, the timer and the cleanup in one place is what keeps the next fix from
 * having to be made four times.
 *
 * Rendering stays with the caller — the icon swap, the visible label and the
 * wording of the live region differ per affordance, and that is the part that
 * legitimately varies.
 */
export function useCopyFeedback(text: string) {
  const [copied, setCopied] = useState(false)
  const revertTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(revertTimer.current), [])

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      // Cancel the pending revert first, so a second copy inside the window
      // gets a full dwell instead of inheriting the earlier deadline.
      window.clearTimeout(revertTimer.current)
      revertTimer.current = window.setTimeout(
        () => setCopied(false),
        COPY_DWELL_MS
      )
    } catch {
      // Clipboard rejection needs a denied permission or a non-secure context,
      // so it is rare; stay idle rather than inventing an error surface.
    }
  }, [text])

  return { copied, copy }
}
