import { createFileRoute, notFound } from "@tanstack/react-router"
import { CopyButton } from "@/features/service-detail/components/copy-button"
import { MarkdownBody } from "@/features/service-detail/components/markdown-body"
import { ServiceMeta } from "@/features/service-detail/components/service-meta"
import { TokenBadge } from "@/features/service-detail/components/token-badge"
import { getServiceBySlug } from "@/lib/content-collection"

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const doc = getServiceBySlug(params.slug)
    if (!doc) throw notFound()
    return { doc }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { doc } = loaderData
    return {
      meta: [
        { title: `${doc.frontmatter.name} — design.md` },
        { name: "description", content: doc.tagline },
        { property: "og:title", content: `${doc.frontmatter.name} — design.md` },
        { property: "og:description", content: doc.tagline },
        { property: "og:type", content: "article" },
      ],
    }
  },
  component: ServiceDetailPage,
})

function ServiceDetailPage() {
  const { doc } = Route.useLoaderData()
  const filename = `${doc.frontmatter.slug}.md`
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-12 md:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <ServiceMeta frontmatter={doc.frontmatter} />
        <div className="mt-10">
          <MarkdownBody body={doc.body} />
        </div>
      </div>
      <aside className="md:sticky md:top-20 md:self-start">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 backdrop-blur">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-foreground/[0.04] via-transparent to-foreground/[0.06]"
            aria-hidden
          />
          <div className="flex flex-col gap-4">
            <p className="text-meta-caps">PRIMARY ACTION</p>
            <CopyButton raw={doc.raw} filename={filename} />
            <div className="border-t border-border/60 pt-4">
              <TokenBadge tokens={doc.estimatedTokens} />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              전체 design.md를 복사해 LLM 채팅창에 붙여넣은 뒤,{" "}
              <span className="text-foreground">"이 컨텍스트를 따라 화면을 만들어줘"</span>처럼 이어서 쓰세요.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}
