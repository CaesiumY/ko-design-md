import { useEffect, useId, useRef, useState } from "react"
import type { ColorToken } from "@/lib/content-types"

// Matches the dwell time of the other copy affordances on this page
// (CopyButton, InlineCopyButton) so the whole detail view confirms alike.
const COPIED_MS = 1800

// `flex flex-col` is load-bearing, not a style preference. Grid rows stretch
// every card to the tallest note in the row, and a <button> lays its contents
// out in an anonymous box that CENTERS that slack — splitting it above and
// below, which tears the colour band off the card's top edge. `display: block`
// does not opt out of it and neither does `align-items`; declaring a formatting
// context on the button does. A <div> never had the problem, so this only
// matters for as long as the card is a button.
const CARD_CLASS =
  "flex w-full cursor-pointer flex-col border text-left transition-colors outline-none hover:border-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

// The whole card is the copy target: the swatches sit in a dense 2–5 column
// grid, so a per-card icon would crowd them and a hover-only affordance would
// be invisible on touch. Everything inside is a <span> because <p> is not
// allowed in button content.
export function SwatchCard({ token }: { token: ColorToken }) {
  const [copied, setCopied] = useState(false)
  const revertTimer = useRef<number | undefined>(undefined)
  // The note rides aria-describedby, not aria-label: a button is announced
  // atomically, so once the card became one the usage note stopped being heard
  // at all. Keeping it out of the label also keeps that string short enough to
  // be a usable voice-control target (WCAG 2.5.3).
  const noteId = useId()

  useEffect(() => () => window.clearTimeout(revertTimer.current), [])

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(token.value)
      setCopied(true)
      // Cancel the pending revert first: without this a second click inside the
      // window inherits the first click's deadline, so its "복사됨" is cut
      // short instead of getting a full dwell of its own.
      window.clearTimeout(revertTimer.current)
      revertTimer.current = window.setTimeout(() => setCopied(false), COPIED_MS)
    } catch {
      // Clipboard rejection is rare (denied permission / non-secure context);
      // stay idle rather than surfacing an error, as the other copy buttons do.
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`${token.name} 복사 — ${token.value}`}
      aria-describedby={token.note ? noteId : undefined}
      className={CARD_CLASS}
    >
      <span
        className="block h-16 w-full border-b"
        style={{ background: token.value }}
        aria-hidden
      />
      <span className="block px-2.5 py-2">
        <span className="block text-[13px] leading-tight font-bold text-foreground">
          {token.name}
        </span>
        <span className="mt-1 flex items-center gap-1 font-mono text-[10px] break-all text-muted-foreground">
          {copied ? (
            <>
              <CheckIcon />
              <span>복사됨</span>
            </>
          ) : (
            token.value
          )}
        </span>
        {token.note && (
          <span
            id={noteId}
            className="mt-1.5 block text-[11px] leading-snug text-muted-foreground"
          >
            {token.note}
          </span>
        )}
        {/* The aria-label is deliberately static — renaming a focused button
            mid-interaction makes screen readers re-announce the whole control.
            So the confirmation rides a live region instead, and it names the
            token: 88 cards share this page and a bare "복사됨" would not say
            which one landed. Empty while idle so nothing is announced on the
            way back. */}
        <span role="status" className="sr-only">
          {copied ? `${token.name} 복사됨` : ""}
        </span>
      </span>
    </button>
  )
}
