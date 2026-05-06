import { createFileRoute } from "@tanstack/react-router"
import { HomeHero } from "@/features/home/components/hero"
import { ServiceCardGrid } from "@/features/home/components/service-card-grid"
import { getAllServices } from "@/lib/content-collection"

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: () => ({ services: getAllServices() }),
})

function HomePage() {
  const { services } = Route.useLoaderData()
  return (
    <>
      <HomeHero />
      <ServiceCardGrid services={services} />
    </>
  )
}
