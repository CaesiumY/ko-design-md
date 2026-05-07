import { createFileRoute, notFound } from "@tanstack/react-router"
import { CopyButton } from "@/features/service-detail/components/copy-button"
import { MarkdownBody } from "@/features/service-detail/components/markdown-body"
import { ServiceMeta } from "@/features/service-detail/components/service-meta"
import { TokenBadge } from "@/features/service-detail/components/token-badge"
import { getServiceBySlug, truncateForMeta } from "@/lib/content-collection"

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const doc = getServiceBySlug(params.slug)
    if (!doc) throw notFound()
    return { doc }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { doc } = loaderData
    const title = `${doc.frontmatter.name} design.md · ko/design.md`
    const description = truncateForMeta(doc.tagline)
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: "/og-default.png" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
    }
  },
  component: ServiceDetailPage,
})

function ServiceDetailPage() {
  const { doc } = Route.useLoaderData()
  const filename = `${doc.frontmatter.slug}.md`
  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-x-12 gap-y-10 px-8 pt-12 pb-32 md:grid-cols-[minmax(0,1fr)_280px] md:gap-x-20 md:pt-16">
      <div className="min-w-0">
        <ServiceMeta frontmatter={doc.frontmatter} tagline={doc.tagline} />
        <div className="mt-12">
          <MarkdownBody body={doc.body} />
        </div>
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
