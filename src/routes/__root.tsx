import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { Provider as JotaiProvider } from "jotai"
import appCss from "../styles.css?url"
import { Toaster } from "@/components/ui/sonner"

import { SiteHeader } from "@/components/site/header"
import { SiteFooter } from "@/components/site/footer"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ko/design.md — 한국 서비스 디자인 컨텍스트 카탈로그" },
      {
        name: "description",
        content:
          "한국 서비스의 시그니처 디자인을 design.md 한 장으로. Claude · Cursor · v0에 그대로 붙여넣으세요.",
      },
      { name: "theme-color", content: "#141414" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ko/design.md" },
      { property: "og:locale", content: "ko_KR" },
      {
        property: "og:title",
        content: "ko/design.md — 한국 서비스 디자인 컨텍스트 카탈로그",
      },
      {
        property: "og:description",
        content:
          "한국 서비스의 시그니처 디자인을 design.md 한 장으로. Claude · Cursor · v0에 그대로 붙여넣으세요.",
      },
      { property: "og:image", content: "/og/default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "ko/design.md — 한국 서비스 디자인 컨텍스트 카탈로그",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "ko/design.md — 한국 서비스 디자인 컨텍스트 카탈로그",
      },
      {
        name: "twitter:description",
        content:
          "한국 서비스의 시그니처 디자인을 design.md 한 장으로. Claude · Cursor · v0에 그대로 붙여넣으세요.",
      },
      { name: "twitter:image", content: "/og/default.png" },
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
