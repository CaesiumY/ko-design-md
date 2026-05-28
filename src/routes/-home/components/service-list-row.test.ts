import { describe, expect, it } from "vitest"
import {
  formatServiceListNumber,
  isNewService,
  isRecentServiceUpdate,
  isRecentlyUpdated,
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

// `now` = 2026-05-15.
// Window is 7 days, so anything 2026-05-08 .. 2026-05-15 is inside, and
// 2026-05-07 or earlier is outside.
describe("isNewService", () => {
  const nowMs = Date.UTC(2026, 4, 15)

  it("returns true when created_at is within the window", () => {
    expect(isNewService("2026-05-10", "2026-05-12", nowMs)).toBe(true)
  })

  it("returns false when created_at is older than the window, even if last_updated is recent", () => {
    expect(isNewService("2026-05-01", "2026-05-12", nowMs)).toBe(false)
  })

  it("falls back to last_updated when created_at is missing (legacy entries)", () => {
    expect(isNewService(undefined, "2026-05-12", nowMs)).toBe(true)
    expect(isNewService(undefined, "2026-05-01", nowMs)).toBe(false)
  })

  it("treats empty string created_at the same as missing", () => {
    expect(isNewService("", "2026-05-12", nowMs)).toBe(true)
  })
})

describe("isRecentlyUpdated", () => {
  const nowMs = Date.UTC(2026, 4, 15)

  it("fires when the entry pre-existed but was just re-synced", () => {
    expect(isRecentlyUpdated("2026-05-01", "2026-05-14", nowMs)).toBe(true)
  })

  it("does not fire when both dates are within the window (NEW takes priority)", () => {
    expect(isRecentlyUpdated("2026-05-10", "2026-05-14", nowMs)).toBe(false)
  })

  it("does not fire when last_updated is also outside the window", () => {
    expect(isRecentlyUpdated("2026-04-15", "2026-05-01", nowMs)).toBe(false)
  })

  it("does not fire when created_at and last_updated are equal", () => {
    expect(isRecentlyUpdated("2026-05-12", "2026-05-12", nowMs)).toBe(false)
  })

  it("does not fire when created_at is missing — UPDATED needs explicit birthdate", () => {
    expect(isRecentlyUpdated(undefined, "2026-05-14", nowMs)).toBe(false)
  })
})
