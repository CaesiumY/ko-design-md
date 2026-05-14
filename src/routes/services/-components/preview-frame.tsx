import { useEffect, useRef, useState } from "react"

import type { PreviewTheme } from "./preview-theme-toggle"

interface Props {
  slug: string
  theme: PreviewTheme
}

const DEFAULT_HEIGHT = 1200

export function PreviewFrame({ slug, theme }: Props) {
  // Why no inline pre-hydration script: mutating iframe.style.height before
  // React hydrates triggers a mismatch error in React 19, which then refuses
  // to attach event handlers anywhere in the affected subtree (the toggle
  // becomes inert). We accept a brief 1200px → measured-height step on mount
  // in exchange for a clean hydration.
  const [height, setHeight] = useState<number>(DEFAULT_HEIGHT)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Same-origin iframe lets us read contentDocument directly. We measure on
  // load and on every body resize, plus poll briefly after mount for the
  // cached-iframe case where `load` fired before the listener attached.
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    let cancelled = false
    let observer: ResizeObserver | null = null

    function measure() {
      if (cancelled) return
      const doc = iframe?.contentDocument
      const next = doc?.body.scrollHeight ?? 0
      if (next > 0) setHeight(next)
    }

    function attachObserver() {
      if (cancelled) return
      const doc = iframe?.contentDocument
      if (!doc?.body) return
      observer?.disconnect()
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(measure)
        observer.observe(doc.body)
      }
      measure()
    }

    function onLoad() {
      attachObserver()
    }

    iframe.addEventListener("load", onLoad)
    attachObserver()
    const tries = [50, 200, 600, 1500]
    const timers = tries.map((ms) => window.setTimeout(measure, ms))

    return () => {
      cancelled = true
      iframe.removeEventListener("load", onLoad)
      observer?.disconnect()
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [theme, slug])

  const src = `/preview/${slug}/${theme}.html`

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={`${slug} design preview (${theme})`}
      scrolling="no"
      style={{
        width: "100%",
        height,
        border: "1px solid var(--rule-strong)",
        display: "block",
        background: theme === "dark" ? "#0a0a0a" : "#ffffff",
      }}
    />
  )
}

export function PreviewUnavailable() {
  return (
    <div
      className="border p-12 text-center"
      style={{ borderColor: "var(--rule-strong)" }}
    >
      <p className="text-meta-caps">PREVIEW</p>
      <p className="mt-3 text-muted-foreground">
        이 서비스는 아직 디자인 프리뷰가 준비되지 않았습니다.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        DESIGN.md 탭에서 raw 소스를 바로 확인할 수 있습니다.
      </p>
    </div>
  )
}
