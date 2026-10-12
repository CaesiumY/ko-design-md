// @vitest-environment jsdom
import { useLayoutEffect } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { ServiceLogo } from "./service-logo"

// What each commit put on screen. The final DOM alone cannot tell "the right
// thing on the first commit" from "the wrong thing, then an effect fixed it" —
// `rerender` runs inside act, which flushes that effect before returning.
// The probe takes `logo` so it re-renders with the logo and is not memoized
// away by the compiler; its layout effect runs after that commit's DOM is in.
let frames: Array<"img" | "badge"> = []
function Probe({ logo }: { logo?: string }) {
  useLayoutEffect(() => {
    frames.push(document.querySelector("img") ? "img" : "badge")
  }, [logo])
  return null
}

function Subject({ logo }: { logo?: string }) {
  return (
    <>
      <ServiceLogo name="toss" logo={logo} />
      <Probe logo={logo} />
    </>
  )
}

const A = "https://getdesign.kr/logos/a.svg"
const B = "https://getdesign.kr/logos/b.svg"

beforeEach(() => {
  frames = []
  vi.spyOn(console, "warn").mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("ServiceLogo", () => {
  it("falls back to the initial badge when the logo fails to load", () => {
    const { container } = render(<Subject logo={A} />)
    fireEvent.error(container.querySelector("img")!)
    expect(container.querySelector("img")).toBeNull()
    expect(container.textContent).toBe("T")
  })

  it("draws the new logo from the first commit after the address changes", () => {
    const { container, rerender } = render(<Subject logo={A} />)
    fireEvent.error(container.querySelector("img")!)
    frames = []

    rerender(<Subject logo={B} />)

    expect(frames[0]).toBe("img")
    expect(container.querySelector("img")?.getAttribute("src")).toContain(
      "b.svg"
    )
  })

  it("remembers which address failed if it comes back", () => {
    const { container, rerender } = render(<Subject logo={A} />)
    fireEvent.error(container.querySelector("img")!)
    rerender(<Subject logo={B} />)
    frames = []

    rerender(<Subject logo={A} />)

    expect(frames[0]).toBe("badge")
    expect(container.querySelector("img")).toBeNull()
  })
})
