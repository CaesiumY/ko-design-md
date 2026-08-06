// Icons for the copy affordances. They were hand-inlined in four components
// (the three copy buttons plus the home skill hint), so a stroke or viewBox
// tweak had to be repeated four times to stay consistent — and the swatch card
// already drifted to a thicker stroke without the others knowing.
//
// Sized by the caller through `className` (Tailwind `size-*`) rather than
// width/height attributes, so the icon inherits the surrounding type scale.
// `aria-hidden` is baked in: every current caller pairs the icon with its own
// text or aria-label, so announcing it would only duplicate that.

interface IconProps {
  className?: string
}

export function CopyIcon({ className }: IconProps) {
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

interface CheckIconProps extends IconProps {
  /**
   * Defaults to the 2.5 the button-sized checks use. The swatch card overrides
   * it to 3 because its check renders at 12px, where 2.5 reads as washed out.
   */
  strokeWidth?: number | string
}

export function CheckIcon({ className, strokeWidth = "2.5" }: CheckIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
