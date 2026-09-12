import type { ReactNode } from "react"

// Shared shell for the standing pages (about / contact / privacy). They are
// prose, not product surfaces, so they get one narrow column and nothing else -
// the point is that the text is there and readable, by a person and by the
// crawler that checks whether this catalog is run by someone real.
export function StaticPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: ReactNode
}) {
  return (
    // A section, not a <main>: RootDocument already wraps every route in one,
    // and a nested main landmark leaves assistive-technology landmark
    // navigation ambiguous about which is the document's main content.
    <section className="mx-auto max-w-2xl px-4 py-20 sm:py-28">
      <p className="text-meta-caps">{eyebrow}</p>
      <h1 className="text-display mt-3 text-4xl font-black tracking-tighter sm:text-5xl">
        {title}
      </h1>
      <div className="mt-10 space-y-10 text-[0.95rem] leading-7">
        {children}
      </div>
    </section>
  )
}

export function Section({
  heading,
  children,
}: {
  heading: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold tracking-tight">{heading}</h2>
      {children}
    </section>
  )
}

export function ExternalLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      className="underline underline-offset-4"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}
