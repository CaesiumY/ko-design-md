import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { Provider as JotaiProvider } from "jotai"
import { Toaster } from "@/components/ui/sonner"

import { SiteHeader } from "@/components/site/header"
import { SiteFooter } from "@/components/site/footer"
import appCss from "../styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "한국형 design.md 카탈로그" },
      {
        name: "description",
        content: "한국 서비스의 시그니처 디자인을 LLM 컨텍스트와 사람이 읽기 즐거운 분석으로.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "한국형 design.md 카탈로그" },
      {
        property: "og:description",
        content: "한국 서비스의 시그니처 디자인을 LLM 컨텍스트와 사람이 읽기 즐거운 분석으로.",
      },
      { property: "og:image", content: "/og-default.svg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  notFoundComponent: () => (
    <main className="mx-auto max-w-6xl px-4 py-24">
      <p className="text-meta-caps">404 — NOT FOUND</p>
      <h1 className="text-display mt-3 text-5xl font-black tracking-tighter">
        Page not found.
      </h1>
      <p className="mt-4 text-muted-foreground">요청하신 페이지를 찾을 수 없습니다.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-svh bg-background text-foreground antialiased">
        <JotaiProvider>
          <SiteHeader />
          <main className="min-h-[calc(100svh-3.5rem)]">
            {children ?? <Outlet />}
          </main>
          <SiteFooter />
          <Toaster richColors position="top-right" />
        </JotaiProvider>
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
