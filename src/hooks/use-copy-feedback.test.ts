// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { track } from "@vercel/analytics"
import { COPY_DWELL_MS, useCopyFeedback } from "./use-copy-feedback"
import type { CopyEvent } from "./use-copy-feedback"

// Mocked rather than left live: `track` is a network side effect, and the
// assertions below are about WHEN it is called, which a real client would
// swallow in a non-Vercel environment.
vi.mock("@vercel/analytics", () => ({ track: vi.fn() }))

const EVENT: CopyEvent = { surface: "design-md-hero", slug: "toss" }

function stubClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  })
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe("useCopyFeedback", () => {
  it("writes the text and raises the confirmation", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubClipboard(writeText)

    const { result } = renderHook(() =>
      useCopyFeedback("oklch(0.5 0.1 200)", EVENT)
    )
    expect(result.current.copied).toBe(false)

    await act(async () => {
      await result.current.copy()
    })

    expect(writeText).toHaveBeenCalledWith("oklch(0.5 0.1 200)")
    expect(result.current.copied).toBe(true)
  })

  it("drops the confirmation once the dwell elapses", async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))

    const { result } = renderHook(() => useCopyFeedback("x", EVENT))
    await act(async () => {
      await result.current.copy()
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(COPY_DWELL_MS)
    })

    expect(result.current.copied).toBe(false)
  })

  // The defect this hook exists to stop recurring: without cancelling the
  // pending revert, a second copy inherits the first one's deadline.
  it("gives a second copy a full dwell of its own", async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))

    const { result } = renderHook(() => useCopyFeedback("x", EVENT))
    await act(async () => {
      await result.current.copy()
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(COPY_DWELL_MS - 800)
    })
    await act(async () => {
      await result.current.copy()
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(COPY_DWELL_MS - 800)
    })

    expect(result.current.copied).toBe(true)
  })

  it("stays idle when the clipboard rejects", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")))

    const { result } = renderHook(() => useCopyFeedback("x", EVENT))
    await act(async () => {
      await result.current.copy()
    })

    expect(result.current.copied).toBe(false)
  })

  // The other unmount test leaves *after* the timer is armed. This one leaves
  // while the clipboard promise is still in flight, so the resolve lands on a
  // dead component and schedules a timer the cleanup has already run past.
  // React 18 dropped the unmounted-setState warning, so both are silent no-ops
  // — pinned here because the hook is shared by four affordances and this path
  // was otherwise untested.
  it("stays silent when unmounted while the clipboard write is in flight", async () => {
    let settle: () => void = () => {}
    const writeText = vi.fn(
      () => new Promise<void>((resolve) => (settle = resolve))
    )
    stubClipboard(writeText)
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    const { result, unmount } = renderHook(() => useCopyFeedback("x", EVENT))
    let pending: Promise<void> | undefined
    await act(async () => {
      // Deliberately not awaited here — the write has to still be in flight
      // when the unmount below happens. The flush only lets React commit.
      pending = result.current.copy()
      await Promise.resolve()
    })

    unmount()

    await act(async () => {
      settle()
      await pending
      await vi.advanceTimersByTimeAsync(COPY_DWELL_MS)
    })

    // Guards against the assertion passing vacuously: the write has to have
    // actually been in flight across the unmount for this path to mean anything.
    expect(writeText).toHaveBeenCalledWith("x")
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it("cancels the pending revert when the consumer unmounts", async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    const { result, unmount } = renderHook(() => useCopyFeedback("x", EVENT))
    await act(async () => {
      await result.current.copy()
    })
    unmount()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(COPY_DWELL_MS)
    })

    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })
})

// The project's primary success metric is the number of these events, and the
// hook is the only place they are raised — so what is pinned here is not that
// `track` exists but the three conditions that decide whether a copy counts.
describe("copy measurement", () => {
  beforeEach(() => vi.mocked(track).mockClear())

  it("reports a successful copy with its surface and entry", async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))

    const { result } = renderHook(() => useCopyFeedback("x", EVENT))
    await act(async () => {
      await result.current.copy()
    })

    expect(track).toHaveBeenCalledWith("copy", {
      surface: "design-md-hero",
      slug: "toss",
    })
  })

  // A refused clipboard is not a copy. Counting it would inflate the one
  // number the project steers by, and the miscount would look like success.
  it("reports nothing when the clipboard rejects", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")))

    const { result } = renderHook(() => useCopyFeedback("x", EVENT))
    await act(async () => {
      await result.current.copy()
    })

    expect(track).not.toHaveBeenCalled()
  })

  // The home page's skill hint has no entry behind it. An empty-string slug
  // would land in the analytics data as a real value to filter out later.
  it("omits the entry for an affordance that has none", async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))

    const { result } = renderHook(() =>
      useCopyFeedback("x", { surface: "skill-install" })
    )
    await act(async () => {
      await result.current.copy()
    })

    expect(track).toHaveBeenCalledWith("copy", { surface: "skill-install" })
  })
})
