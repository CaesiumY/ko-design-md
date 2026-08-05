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
