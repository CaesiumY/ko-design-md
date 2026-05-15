import { describe, expect, it } from "vitest"
import {
  formatServiceListNumber,
  isRecentServiceUpdate,
} from "./service-list-row"

describe("formatServiceListNumber", () => {
  it("counts backward from the current list length", () => {
    expect(formatServiceListNumber(1, 6)).toBe("06")
    expect(formatServiceListNumber(6, 6)).toBe("01")
  })

  it("keeps two-digit padding for single-digit list lengths", () => {
    expect(formatServiceListNumber(1, 3)).toBe("03")
  })

  it("pads to the total count digit length for larger lists", () => {
    expect(formatServiceListNumber(100, 100)).toBe("001")
  })
})

describe("isRecentServiceUpdate", () => {
  const nowMs = Date.UTC(2026, 4, 15)

  it("treats updates from the past week as NEW", () => {
    expect(isRecentServiceUpdate("2026-05-08", nowMs)).toBe(true)
  })

  it("does not treat updates older than one week as NEW", () => {
    expect(isRecentServiceUpdate("2026-05-07", nowMs)).toBe(false)
  })
})
