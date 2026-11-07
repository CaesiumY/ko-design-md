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
        slug="demo"
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
        slug="demo"
        tokens={tokens({ radius: [{ name: "r-md", value: "8px", px: 8 }] })}
      />
    )

    expect(screen.queryByText("클릭하면 복사")).toBeNull()
  })
})

describe("TokenCardSection — role cards", () => {
  // A brand hue and a grey ramp the palette curation folds behind its
  // disclosure, plus a role that points into the ramp. The role is named like a
  // ramp step and is neutral — both reasons curation hides a palette swatch.
  const gray = [
    { name: "brand", value: "oklch(0.6 0.19 258)" },
    ...Array.from({ length: 10 }, (_, i) => ({
      name: `gray-${(i + 1) * 100}`,
      value: `oklch(${0.95 - i * 0.08} 0 0)`,
    })),
  ]
  const role = {
    name: "color-background-canvas-200",
    value: "oklch(0.95 0 0)",
    ref: "gray-100",
  }

  it("shows a role in its own block, outside the palette's folded tail", () => {
    render(
      <TokenCardSection
        slug="demo"
        tokens={tokens({ colors: [...gray, role] })}
      />
    )

    const card = screen.getByRole("button", {
      name: /^color-background-canvas-200 복사/,
    })
    expect(card.closest("details")).toBeNull()
    expect(
      screen.getByRole("button", { name: /^gray-100 복사/ }).closest("details")
    ).toBeTruthy()
    // The badge counts roles apart from the palette they point into.
    expect(
      screen.getByText(
        (_, el) =>
          el?.tagName === "P" && el.textContent === "11 Colors · 1 Roles"
      )
    ).toBeTruthy()
  })

  // The role layer is what a reader scans this block for, so a long one is
  // shown whole rather than behind a disclosure — a palette's long tail is
  // folded, a role layer is not.
  it("shows a long role layer whole, with none behind a disclosure", () => {
    const roles = Array.from({ length: 40 }, (_, i) => ({
      name: `role-${i}`,
      value: "oklch(0.95 0 0)",
      ref: "gray-100",
    }))
    render(
      <TokenCardSection
        slug="demo"
        tokens={tokens({ colors: [...gray, ...roles] })}
      />
    )

    const cards = screen.getAllByRole("button", { name: /^role-\d+ 복사/ })
    expect(cards).toHaveLength(40)
    expect(cards.filter((b) => b.closest("details"))).toHaveLength(0)
  })

  // `primary: "{colors.x}"` is the brand-colour alias the catalogue allows
  // under that spec name — the colour the brand publishes as its own, not a
  // role from a role table. It sits with the palette, arrow and all.
  it("keeps the primary brand-colour alias with the palette, not the roles", () => {
    render(
      <TokenCardSection
        slug="demo"
        tokens={tokens({
          colors: [
            ...gray,
            { name: "primary", value: "oklch(0.6 0.19 258)", ref: "brand" },
            role,
          ],
        })}
      />
    )

    expect(screen.getByText("→ brand")).toBeTruthy()
    expect(
      screen.getByText(
        (_, el) =>
          el?.tagName === "P" && el.textContent === "12 Colors · 1 Roles"
      )
    ).toBeTruthy()
    const roles = screen.getByText("Roles", { selector: "p" }).parentElement
    expect(roles?.textContent).not.toContain("primary")
  })
})

describe("TokenCardSection — dark roles", () => {
  it("leaves a dark- role out of the light-only card view and its count", () => {
    render(
      <TokenCardSection
        slug="demo"
        tokens={tokens({
          colors: [
            { name: "gray-050", value: "oklch(0.98 0 0)" },
            { name: "dark-gray-050", value: "oklch(0.2 0 0)" },
            { name: "bg-canvas", value: "oklch(0.98 0 0)", ref: "gray-050" },
            {
              name: "dark-bg-canvas",
              value: "oklch(0.2 0 0)",
              ref: "dark-gray-050",
            },
          ],
        })}
      />
    )

    expect(screen.getByRole("button", { name: /^bg-canvas 복사/ })).toBeTruthy()
    expect(screen.queryByRole("button", { name: /^dark-bg-canvas/ })).toBeNull()
    expect(
      screen.getByText(
        (_, el) =>
          el?.tagName === "P" && el.textContent === "1 Colors · 1 Roles"
      )
    ).toBeTruthy()
  })
})

describe("TokenCardSection — elevation", () => {
  it("renders a shadow chip carrying the full value as a live box-shadow", () => {
    const value = "0 4px 12px oklch(0 0 0 / 0.08)"
    const { container } = render(
      <TokenCardSection
        slug="demo"
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
        slug="demo"
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

  it("drops dark-* shadows from both the chips and the count", () => {
    // The card view is light-fixed. seed-design publishes s1..s3 and dark-s1..s3;
    // the dark trio is 50–80% black, authored for a dark canvas, and rendering it
    // on a light tile showed six chips for three tokens with the dark ones nearly
    // opaque. Colors have always been filtered — shadows have to be too.
    render(
      <TokenCardSection
        slug="demo"
        tokens={tokens({
          elevation: [
            { name: "s1", value: "0px 1px 4px 0px oklch(0 0 0 / 0.078)" },
            { name: "dark-s1", value: "0px 1px 4px 0px oklch(0 0 0 / 0.502)" },
            { name: "s2", value: "0px 2px 10px 0px oklch(0 0 0 / 0.102)" },
            { name: "dark-s2", value: "0px 2px 10px 0px oklch(0 0 0 / 0.678)" },
          ],
        })}
      />
    )

    expect(screen.getByText("s1")).toBeTruthy()
    expect(screen.queryByText("dark-s1")).toBeNull()
    // The badge counts what is drawn, not what the sidecar holds.
    expect(screen.getByText("Shadows").textContent).toBe("2 Shadows")
  })

  it("renders nothing when every shadow is a dark variant", () => {
    const { container } = render(
      <TokenCardSection
        slug="demo"
        tokens={tokens({
          elevation: [
            { name: "dark-s1", value: "0px 1px 4px 0px oklch(0 0 0 / 0.502)" },
          ],
        })}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing when elevation is the only key and it is absent", () => {
    const { container } = render(
      <TokenCardSection slug="demo" tokens={tokens()} />
    )
    expect(container.firstChild).toBeNull()
  })
})
