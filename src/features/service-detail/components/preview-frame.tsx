import { useEffect, useRef, useState } from "react"

import type { PreviewTheme } from "./preview-theme-toggle"

interface Props {
  slug: string
  theme: PreviewTheme
}

const DEFAULT_HEIGHT = 1200

// Inline script that runs the moment the iframe element is parsed in SSR HTML —
// before React hydration. We attach a load handler so once the same-origin
// preview document is ready, we resize the iframe to its body's full height.
// This bypasses the React hydration timing issue in dev (TanStack Router lazy
// route splitting) and works identically in production.
function makeFitScript(iframeId: string) {
  return `(function(){
  var f=document.getElementById(${JSON.stringify(iframeId)});
  if(!f)return;
  function measure(){
    try{
      var d=f.contentDocument;
      var h=d&&d.body&&d.body.scrollHeight;
      if(h&&h>0){f.style.height=h+'px';}
    }catch(e){}
  }
  function attach(){
    measure();
    try{
      var d=f.contentDocument;
      if(d&&d.body&&typeof ResizeObserver!=='undefined'){
        new ResizeObserver(measure).observe(d.body);
      }
    }catch(e){}
  }
  f.addEventListener('load',attach);
  if(f.contentDocument&&f.contentDocument.readyState==='complete'){attach();}
})();`
}

export function PreviewFrame({ slug, theme }: Props) {
  const [height, setHeight] = useState<number>(DEFAULT_HEIGHT)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const iframeId = `kdmd-preview-${slug}`

  // Client-side fallback: if for any reason the inline script missed the load
  // event (e.g., SPA navigation re-mounting this component), this effect picks
  // up the same measurement loop. Both paths set iframe height directly via
  // ref + style, so they are idempotent.
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    let cancelled = false
    let observer: ResizeObserver | null = null

    function measure() {
      if (cancelled) return
      const doc = iframe?.contentDocument
      const next = doc?.body?.scrollHeight ?? 0
      if (next > 0) {
        setHeight(next)
        if (iframe) iframe.style.height = `${next}px`
      }
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
    <>
      <iframe
        ref={iframeRef}
        id={iframeId}
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
      <script
        // The script is keyed by slug so React treats it as part of the same
        // logical iframe block. It runs once when the SSR HTML is parsed.
        dangerouslySetInnerHTML={{ __html: makeFitScript(iframeId) }}
      />
    </>
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
