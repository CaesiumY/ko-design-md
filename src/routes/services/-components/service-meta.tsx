import { ServiceMetaBar } from "./service-meta-bar"
import type { ServiceFrontmatter } from "@/lib/content-types"
import { ServiceLogo } from "@/routes/-home/components/service-logo"

interface Props {
  frontmatter: ServiceFrontmatter
  tagline?: string
}

export function ServiceMeta({ frontmatter, tagline }: Props) {
  return (
    <header
      className="border-b pb-8"
      style={{ borderColor: "var(--rule-strong)" }}
    >
      <ServiceMetaBar frontmatter={frontmatter} />

      {/* Logo + massive title — flex-wrap keeps a narrow viewport safe by
          letting the H1 drop to its own line under the 80px mark instead of
          overflowing. The mark uses the shared ServiceLogo, which already
          handles onError → initial badge fallback (HMR-safe via the
          useEffect-reset failed state). */}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
        <ServiceLogo
          name={frontmatter.name}
          logo={frontmatter.logo}
          size={80}
          // ServiceLogo의 FallbackBadge가 text-[11px]을 baseline으로
          // 가지는데, 80px 박스에선 너무 작아 폴백 발생 시 이니셜이
          // 박스 안에서 떠 보인다. cn() (tailwind-merge)이 충돌하는
          // font-size를 자동 머지해주므로 text-3xl(30px ≈ 박스의 37%)
          // 로 끌어올려 카드 그리드의 비율감(11px/24 ≈ 45%)에 근접시킨다.
          // img 분기에는 의미 없지만 부작용도 없다.
          className="text-3xl"
        />
        <h1
          className="text-display text-5xl font-black leading-[1.0] tracking-tighter sm:text-6xl lg:text-7xl"
          style={{ letterSpacing: "-0.06em" }}
        >
          {frontmatter.name}
        </h1>
      </div>

      {frontmatter.design_system_name && (
        <p className="text-meta-caps text-muted-foreground mt-4">
          Design system ·{" "}
          <span className="text-foreground font-bold">
            {frontmatter.design_system_name}
          </span>
        </p>
      )}

      {tagline && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground sm:text-xl">
          {tagline}
        </p>
      )}
    </header>
  )
}
