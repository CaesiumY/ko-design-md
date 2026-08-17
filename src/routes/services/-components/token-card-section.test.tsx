// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { TokenCardSection } from "./token-card-section"
import type { ServiceTokens } from "@/lib/content-types"

function tokens(overrides: Partial<ServiceTokens> = {}): ServiceTokens {
  return {
    colors: [],
    typography: [],
    spacing: [],
    radius: [],
    ...overrides,
  }
}

afterEach(cleanup)

describe("TokenCardSection", () => {
  // Click-to-copy has no per-card icon, so touch users get no hover cue. A
  // standing hint next to the Colors label is the only affordance they see.
  it("tells the reader the colour swatches are click-to-copy", () => {
    render(
      <TokenCardSection
        tokens={tokens({
          colors: [{ name: "blue-500", value: "oklch(0.624 0.176 254)" }],
        })}
      />
    )

    expect(screen.getByText("클릭하면 복사")).toBeTruthy()
  })

  it("omits the copy hint when the entry has no colours to click", () => {
    render(
      <TokenCardSection
        tokens={tokens({ radius: [{ name: "r-md", value: "8px", px: 8 }] })}
      />
    )

    expect(screen.queryByText("클릭하면 복사")).toBeNull()
  })
})

describe("TokenCardSection — elevation", () => {
  it("renders a shadow chip carrying the full value as a live box-shadow", () => {
    const value = "0 4px 12px oklch(0 0 0 / 0.08)"
    const { container } = render(
      <TokenCardSection
        tokens={tokens({
          elevation: [{ name: "shadow-2", value, note: "카드" }],
        })}
      />
    )

    expect(screen.getByText("shadow-2")).toBeTruthy()
    expect(screen.getByText(value)).toBeTruthy()
    expect(screen.getByText("카드")).toBeTruthy()
    // The tile must actually carry the shadow — a value shown only as text
    // would make the card a listing, not a demonstration.
    const tile = container.querySelector<HTMLElement>('[style*="box-shadow"]')
    expect(tile?.style.boxShadow).toBe(value)
  })

  it("counts shadows in the section header", () => {
    render(
      <TokenCardSection
        tokens={tokens({
          elevation: [
            { name: "s1", value: "0 1px 2px oklch(0 0 0 / 0.06)" },
            { name: "s2", value: "0 4px 8px oklch(0 0 0 / 0.08)" },
          ],
        })}
      />
    )

    expect(screen.getByText("Shadows")).toBeTruthy()
  })

  it("renders nothing when elevation is the only key and it is absent", () => {
    const { container } = render(<TokenCardSection tokens={tokens()} />)
    expect(container.firstChild).toBeNull()
  })
})
