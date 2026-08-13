import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { Provider as JotaiProvider } from "jotai"
import { Analytics } from "@vercel/analytics/react"
import appCss from "../styles.css?url"
import { buildNotFoundSeo } from "@/lib/seo"
import { absoluteUrl } from "@/lib/site-config"

import { SiteHeader } from "@/components/site/header"
import { SiteFooter } from "@/components/site/footer"

const DOCUMENT_META = [
  { charSet: "utf-8" },
  {
    name: "viewport",
    content: "width=device-width, initial-scale=1, viewport-fit=cover",
  },
  { name: "theme-color", content: "#141414" },
]

const DOCUMENT_LINKS = [
  { rel: "stylesheet", href: appCss },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  {
    rel: "alternate",
    type: "application/rss+xml",
    title: "ko/design.md RSS",
    href: absoluteUrl("/rss.xml"),
  },
]
// Indexable child routes must provide page-specific SEO through `head()`.
// Keep this root head free of fallback title/OG metadata: a fallback masks a
// missing route head and would make not-found pages inherit site metadata.

export const Route = createRootRoute({
  head: ({ matches }) => {
    const isNotFound = matches.some(
      (match) => match.status === "notFound" || match.globalNotFound
    )
    if (isNotFound) {
      const notFoundSeo = buildNotFoundSeo()
      return {
        meta: [...DOCUMENT_META, ...notFoundSeo.meta],
        links: DOCUMENT_LINKS,
      }
    }

    return {
      meta: DOCUMENT_META,
      links: DOCUMENT_LINKS,
    }
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-6xl px-4 py-24">
      <p className="text-meta-caps">404 — NOT FOUND</p>
      <h1 className="text-display mt-3 text-5xl font-black tracking-tighter">
        Page not found.
      </h1>
      <p className="mt-4 text-muted-foreground">
        요청하신 페이지를 찾을 수 없습니다.
      </p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="light">
      <head>
        <HeadContent />
        {/* gray-matter (used by content-collection) calls Node's Buffer at
            client module init. Browsers don't ship Buffer, so without this
            shim React hydration fails silently with "Buffer is not defined".
            The shim returns input as-is — sufficient for gray-matter, which
            only uses Buffer.from(string).toString() round-trips. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(typeof window!=='undefined'&&typeof window.Buffer==='undefined'){window.Buffer={isBuffer:function(){return false},from:function(s){return s}}}",
          }}
        />
      </head>
      <body className="min-h-svh bg-background text-foreground antialiased">
        <JotaiProvider>
          <SiteHeader />
          <main className="min-h-[calc(100svh-3.5rem)]">
            {children ?? <Outlet />}
          </main>
          <SiteFooter />
        </JotaiProvider>
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Analytics />
        <Scripts />
      </body>
    </html>
  )
}
