import { createFileRoute, notFound } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { CopyButton } from "@/features/service-detail/components/copy-button"
import {
  DetailTabs,
  DetailTabsList,
  DetailTabsPanel,
  DetailTabsTab,
} from "@/features/service-detail/components/detail-tabs"
import { MarkdownBody } from "@/features/service-detail/components/markdown-body"
import {
  PreviewFrame,
  PreviewUnavailable,
} from "@/features/service-detail/components/preview-frame"
import {
  PreviewThemeToggle,
  type PreviewTheme,
} from "@/features/service-detail/components/preview-theme-toggle"
import { RawDesignMd } from "@/features/service-detail/components/raw-design-md"
import { ServiceMeta } from "@/features/service-detail/components/service-meta"
import { TokenBadge } from "@/features/service-detail/components/token-badge"
import {
  getServiceBySlug,
  hasPreview,
  truncateForMeta,
} from "@/lib/content-collection"
import { highlightRawMarkdown } from "@/lib/shiki"
import { absoluteUrl } from "@/lib/site-config"

const PREVIEW_THEME_STORAGE_KEY = "ko-design-md.preview-theme"

type DetailTab = "preview" | "md"

function parseTab(value: unknown): DetailTab {
  return value === "md" ? "md" : "preview"
}

export const Route = createFileRoute("/services/$slug")({
  validateSearch: (search: Record<string, unknown>): { tab: DetailTab } => ({
    tab: parseTab(search.tab),
  }),
  loader: async ({ params }) => {
    const doc = getServiceBySlug(params.slug)
    if (!doc) throw notFound()
    const shikiHtml = await highlightRawMarkdown(doc.raw)
    return { doc, shikiHtml, previewAvailable: hasPreview(params.slug) }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { doc } = loaderData
    const title = `${doc.frontmatter.name} design.md · ko/design.md`
    const description = truncateForMeta(doc.tagline)
    const ogImage = absoluteUrl(`/og/${doc.frontmatter.slug}.png`)
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        {
          property: "og:url",
          content: absoluteUrl(`/services/${doc.frontmatter.slug}`),
        },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: ogImage },
        {
          property: "og:image:alt",
          content: `${doc.frontmatter.name} design.md`,
        },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
    }
  },
  component: ServiceDetailPage,
})

function ServiceDetailPage() {
  const { doc, shikiHtml, previewAvailable } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const filename = `${doc.frontmatter.slug}.md`

  // Preview theme is independent of the site theme (which is locked to light).
  // Default to dark to match the editorial reference (BMW M / Apple).
  //
  // Why useState("dark") + reconcile useEffect instead of a lazy initializer:
  // a lazy useState initializer that reads localStorage diverges between SSR
  // (window undefined → "dark") and client (saved value → "light"). React 19
  // surfaces this as a hydration mismatch and refuses to patch the tree, which
  // breaks all subsequent interactivity. Hydrating to the server value first
  // and reconciling in an effect is the supported pattern. Persistence happens
  // inline in handleThemeChange so the SSR default never overwrites a saved
  // value before the reconcile lands.
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>("dark")
  useEffect(() => {
    const saved = window.localStorage.getItem(PREVIEW_THEME_STORAGE_KEY)
    if (saved === "light" || saved === "dark") setPreviewTheme(saved)
  }, [])
  function handleThemeChange(next: PreviewTheme) {
    setPreviewTheme(next)
    window.localStorage.setItem(PREVIEW_THEME_STORAGE_KEY, next)
  }

  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-x-12 gap-y-10 px-8 pt-12 pb-32 md:grid-cols-[minmax(0,1fr)_280px] md:gap-x-20 md:pt-16">
      <div className="min-w-0">
        <ServiceMeta frontmatter={doc.frontmatter} tagline={doc.tagline} />

        <DetailTabs
          value={search.tab}
          onValueChange={(value) => {
            navigate({
              search: { tab: parseTab(value) },
              replace: true,
            })
          }}
          className="mt-12"
        >
          {/* Stack on mobile, single-row with the toggle pushed right on
              ≥sm. Keeps both controls left-aligned when stacked so the
              toggle doesn't strand by itself in the right gutter. */}
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <DetailTabsList>
              <DetailTabsTab value="preview">Live Preview</DetailTabsTab>
              <DetailTabsTab value="md">DESIGN.md</DetailTabsTab>
            </DetailTabsList>
            {previewAvailable && (
              <PreviewThemeToggle
                theme={previewTheme}
                onChange={handleThemeChange}
                className="sm:ml-auto"
              />
            )}
          </div>

          <DetailTabsPanel value="preview">
            {previewAvailable ? (
              <PreviewFrame
                slug={doc.frontmatter.slug}
                theme={previewTheme}
              />
            ) : (
              <PreviewUnavailable />
            )}
            <div className="mt-12">
              <MarkdownBody body={doc.body} />
            </div>
          </DetailTabsPanel>

          <DetailTabsPanel value="md">
            <RawDesignMd shikiHtml={shikiHtml} />
          </DetailTabsPanel>
        </DetailTabs>
      </div>

      <aside className="md:sticky md:top-24 md:self-start">
        <p className="text-meta-caps mb-4">
          — <span className="text-brand font-extrabold">Primary</span> Action
        </p>
        <CopyButton raw={doc.raw} filename={filename} />
        <div
          className="mt-6 border-t pt-5"
          style={{ borderColor: "var(--rule-strong)" }}
        >
          <TokenBadge tokens={doc.estimatedTokens} />
        </div>
        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          전체 design.md를 복사해 LLM 채팅창에 붙여넣은 뒤,{" "}
          <span className="font-medium text-foreground">
            "이 컨텍스트를 따라 화면을 만들어줘"
          </span>
          처럼 이어서 쓰세요.
        </p>
      </aside>
    </div>
  )
}
