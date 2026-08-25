import { useCallback, useEffect, useRef, useState } from "react"
import { track } from "@vercel/analytics"

/**
 * How long the "복사됨" confirmation stays up. Shared so the four copy
 * affordances — and the tests that advance timers past it — cannot drift apart
 * on timing. Not a hook parameter: no caller wants a different dwell, and a
 * knob nobody turns is just a wider surface to keep working.
 */
export const COPY_DWELL_MS = 1800

/**
 * Which affordance a copy came from.
 *
 * Split finer than the components are, because two of them copy the SAME
 * string: the hero button and the md tab both hand over `doc.raw`. Collapsing
 * them would answer "how many copies" while losing the only question the split
 * can answer - whether the tab affordance earns its place, or whether everyone
 * uses the hero button and the tab one is decoration.
 */
export type CopySurface =
  | "design-md-hero"
  | "design-md-tab"
  | "tokens-json"
  | "color-token"
  | "skill-install"

export interface CopyEvent {
  surface: CopySurface
  /** Catalog entry the copy came from; absent on the home page's skill hint. */
  slug?: string
}

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
 * Measurement lives here for the same reason. Every copy affordance is a
 * `track("copy", ...)` call, and the project's primary success metric is the
 * count of them - a per-component call would be the same copy-paste this hook
 * was extracted to end, and the surface that forgot it would go unmeasured
 * without anything failing. `CopyEvent` is a REQUIRED parameter so a new
 * affordance cannot be added without saying what it is.
 *
 * Rendering stays with the caller — the icon swap, the visible label and the
 * wording of the live region differ per affordance, and that is the part that
 * legitimately varies.
 */
export function useCopyFeedback(text: string, event: CopyEvent) {
  const [copied, setCopied] = useState(false)
  const revertTimer = useRef<number | undefined>(undefined)
  const { surface, slug } = event

  useEffect(() => () => window.clearTimeout(revertTimer.current), [])

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard rejection needs a denied permission or a non-secure context,
      // so it is rare; stay idle rather than inventing an error surface.
      return
    }

    setCopied(true)
    // Cancel the pending revert first, so a second copy inside the window
    // gets a full dwell instead of inheriting the earlier deadline.
    window.clearTimeout(revertTimer.current)
    revertTimer.current = window.setTimeout(
      () => setCopied(false),
      COPY_DWELL_MS
    )

    // Last, and outside the clipboard's try. Measurement must not be able to
    // cost the user their confirmation: inside that block a throwing `track`
    // would land in the catch and be read as "the clipboard refused", leaving
    // the button silent after a copy that actually worked.
    //
    // `surface` and `slug` rather than the `event` object in the dependency
    // list: callers pass an object literal, which is a new identity every
    // render, and `copy` would be rebuilt on each one.
    track("copy", slug ? { surface, slug } : { surface })
  }, [text, surface, slug])

  return { copied, copy }
}
