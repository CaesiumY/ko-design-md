import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  slug: string
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  )
}

export function OpenRawButton({ slug }: Props) {
  return (
    <a
      href={`/services/${slug}/llms.txt`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "mt-3 w-full justify-between tracking-tight transition-opacity duration-200 hover:opacity-90 active:scale-[0.98]"
      )}
    >
      <span className="inline-flex items-center gap-2.5">
        <ExternalLinkIcon className="size-4" />
        <span>llms.txt 열기</span>
      </span>
      <span aria-hidden className="text-base">
        ↗
      </span>
    </a>
  )
}
