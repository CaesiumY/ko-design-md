import { createFileRoute, notFound } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { SERVICE_DETAIL_COPY } from "./-copy"
import { CopyButton } from "./-components/copy-button"
import {
  DetailTabs,
  DetailTabsList,
  DetailTabsPanel,
  DetailTabsTab,
} from "./-components/detail-tabs"
import { InlineCopyButton } from "./-components/inline-copy-button"
import {
  PreviewFrame,
  PreviewUnavailable,
} from "./-components/preview-frame"
import { PreviewThemeToggle } from "./-components/preview-theme-toggle"
import { RawDesignMd } from "./-components/raw-design-md"
import { ServiceMeta } from "./-components/service-meta"
import { TokenBadge } from "./-components/token-badge"
import type { PreviewTheme } from "./-components/preview-theme-toggle"
import type { ServiceDoc } from "@/lib/content-types"
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
    <ServiceDetailLayout
      doc={doc}
      filename={filename}
      onTabChange={(value) => {
        navigate({
          search: { tab: parseTab(value) },
          replace: true,
          // Tab change is panel switching, not navigation — preserve scroll
          // so the user keeps reading from the same vertical position.
          resetScroll: false,
        })
      }}
      onThemeChange={handleThemeChange}
      previewAvailable={previewAvailable}
      previewTheme={previewTheme}
      searchTab={search.tab}
      shikiHtml={shikiHtml}
    />
  )
}

interface ServiceDetailLayoutProps {
  doc: ServiceDoc
  filename: string
  onTabChange: (value: string) => void
  onThemeChange: (theme: PreviewTheme) => void
  previewAvailable: boolean
  previewTheme: PreviewTheme
  searchTab: DetailTab
  shikiHtml: string
}

export function ServiceDetailLayout({
  doc,
  filename,
  onTabChange,
  onThemeChange,
  previewAvailable,
  previewTheme,
  searchTab,
  shikiHtml,
}: ServiceDetailLayoutProps) {
  const { primaryAction, unofficialNotice } = SERVICE_DETAIL_COPY

  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-x-12 gap-y-10 px-8 pt-12 pb-32 md:grid-cols-[minmax(0,1fr)_280px] md:gap-x-20 md:pt-16">
      <div className="min-w-0 md:col-start-1 md:row-start-1">
        <ServiceMeta frontmatter={doc.frontmatter} tagline={doc.tagline} />
      </div>

      <aside className="md:sticky md:top-24 md:col-start-2 md:row-start-1 md:row-span-2 md:self-start">
        <p className="text-meta-caps mb-4">
          {primaryAction.mark}{" "}
          <span className="text-brand font-extrabold">
            {primaryAction.emphasis}
          </span>{" "}
          {primaryAction.suffix}
        </p>
        <CopyButton raw={doc.raw} />
        <div
          className="mt-6 border-t pt-5"
          style={{ borderColor: "var(--rule-strong)" }}
        >
          <TokenBadge tokens={doc.estimatedTokens} />
        </div>
        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          {unofficialNotice.prefix} {doc.frontmatter.name}
          {unofficialNotice.descriptionAfterName}{" "}
          <span className="font-medium text-foreground">
            {doc.frontmatter.name}
            {unofficialNotice.highlightedSuffix}
          </span>
          {unofficialNotice.suffix}
        </p>
      </aside>

      <div className="min-w-0 md:col-start-1 md:row-start-2">
        <DetailTabs value={searchTab} onValueChange={onTabChange}>
          {/* Container queries (not viewport breakpoints) because the
              detail page is a two-column grid on desktop — the row's
              available width is much smaller than the viewport. The
              outer div is the container; @sm/* on its descendants
              checks the outer's width.

              The right slot is tab-aware: Live Preview gets the
              light/dark toggle (relevant), DESIGN.md gets a quick copy
              shortcut (the action you reach for once you've opened the
              raw source). */}
          <div className="@container">
            <div className="flex flex-col items-start gap-3 @sm:flex-row @sm:items-center">
              <DetailTabsList>
                <DetailTabsTab value="preview">Live Preview</DetailTabsTab>
                <DetailTabsTab value="md">DESIGN.md</DetailTabsTab>
              </DetailTabsList>
              {previewAvailable && searchTab === "preview" && (
                <PreviewThemeToggle
                  theme={previewTheme}
                  onChange={onThemeChange}
                  className="@sm:ml-auto"
                />
              )}
              {searchTab === "md" && (
                <InlineCopyButton
                  raw={doc.raw}
                  filename={filename}
                  className="@sm:ml-auto"
                />
              )}
            </div>
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
          </DetailTabsPanel>

          <DetailTabsPanel value="md">
            <RawDesignMd
              shikiHtml={shikiHtml}
              filename={filename}
              raw={doc.raw}
            />
          </DetailTabsPanel>
        </DetailTabs>
      </div>
    </div>
  )
}
