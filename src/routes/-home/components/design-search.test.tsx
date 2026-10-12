// @vitest-environment jsdom
import { useLayoutEffect } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { DesignSearch } from "./design-search"

// What the input showed on each commit. `rerender` runs inside act, which
// flushes effects before returning, so the final DOM cannot tell a first
// commit that already shows the new value from one an effect corrected.
// The probe takes `value` so the compiler does not memoize it away.
let frames: Array<string> = []
function Probe({ value }: { value: string }) {
  useLayoutEffect(() => {
    frames.push(document.querySelector("input")?.value ?? "")
  }, [value])
  return null
}

function Subject({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  return (
    <>
      <DesignSearch value={value} onChange={onChange} />
      <Probe value={value} />
    </>
  )
}

function input(): HTMLInputElement {
  return screen.getByRole("searchbox")
}

beforeEach(() => {
  frames = []
  vi.useFakeTimers()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe("DesignSearch", () => {
  it("reports typing once, after the debounce", () => {
    const onChange = vi.fn()
    render(<Subject value="" onChange={onChange} />)

    fireEvent.change(input(), { target: { value: "toss" } })
    act(() => vi.advanceTimersByTime(199))
    expect(onChange).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith("toss")
  })

  it("shows an outside change (header link clearing ?q=) from the first commit", () => {
    const onChange = vi.fn()
    const { rerender } = render(<Subject value="toss" onChange={onChange} />)
    frames = []

    rerender(<Subject value="baemin" onChange={onChange} />)

    expect(frames[0]).toBe("baemin")
    expect(input().value).toBe("baemin")
    act(() => vi.advanceTimersByTime(1000))
    expect(onChange).not.toHaveBeenCalled()
  })

  it("does not write a pending keystroke back over an outside change", () => {
    const onChange = vi.fn()
    const { rerender } = render(<Subject value="" onChange={onChange} />)
    fireEvent.change(input(), { target: { value: "to" } })

    rerender(<Subject value="baemin" onChange={onChange} />)
    act(() => vi.advanceTimersByTime(1000))

    expect(input().value).toBe("baemin")
    expect(onChange).not.toHaveBeenCalled()
  })
})
