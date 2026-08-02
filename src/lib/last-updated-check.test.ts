import { describe, expect, it } from "vitest"
import { checkLastUpdated } from "./last-updated-check"

// The rule: editing a services/*.md means bumping its `last_updated`. It drives
// sitemap `lastmod`, RSS ordering, and the home Updated badge, so a stale date
// is not cosmetic — the entry silently sorts as if it had not changed.
//
// Comparing the VALUE against the commit date, rather than asking whether the
// `last_updated` line appears in the diff, is deliberate. Replaying the last 18
// md-touching commits showed the two disagree in both directions:
//   • three same-day follow-up edits already carried the right date, so no diff
//     line appeared — a line-based check calls all three violations;
//   • `be494be` bumped three files to 2026-07-27 while committing on 07-29 —
//     the date was written from memory, which the rule explicitly warns about.
//     A line-based check sees a bump and passes.

function doc(lastUpdated: string | null): string {
  const lu = lastUpdated === null ? "" : `last_updated: "${lastUpdated}"\n`
  return `---\nname: 데모\nslug: demo\n${lu}created_at: "2026-05-01"\n---\n\n본문이다.\n`
}

const FILE = "services/demo.md"

describe("checkLastUpdated", () => {
  it("accepts a date equal to the commit date", () => {
    const r = checkLastUpdated({
      file: FILE,
      raw: doc("2026-08-02"),
      baseRaw: doc("2026-07-29"),
      changedOn: "2026-08-02",
    })
    expect(r).toBeNull()
  })

  it("accepts an unchanged date when the edit lands the same day", () => {
    // The follow-up-edit case: #204 and #205 both touched socar.md on 08-02
    // when it already read 2026-08-02. Nothing to bump; not a violation.
    const r = checkLastUpdated({
      file: FILE,
      raw: doc("2026-08-02"),
      baseRaw: doc("2026-08-02"),
      changedOn: "2026-08-02",
    })
    expect(r).toBeNull()
  })

  it("flags a date older than the commit that changed the file", () => {
    const r = checkLastUpdated({
      file: FILE,
      raw: doc("2026-07-27"),
      baseRaw: doc("2026-07-27"),
      changedOn: "2026-07-29",
    })
    expect(r?.rule).toBe("stale-last-updated")
  })

  it("flags a bump that lands on the wrong day", () => {
    // `be494be`: bumped 2026-07-25 → 2026-07-27 while committing on 07-29. The
    // date was recalled, not looked up. A diff-based check sees a bump here.
    const r = checkLastUpdated({
      file: FILE,
      raw: doc("2026-07-27"),
      baseRaw: doc("2026-07-25"),
      changedOn: "2026-07-29",
    })
    expect(r?.rule).toBe("stale-last-updated")
  })

  it("flags a date that moves backwards even when it clears the commit date", () => {
    // RSS ordering and the Updated badge assume monotonicity.
    const r = checkLastUpdated({
      file: FILE,
      raw: doc("2026-08-01"),
      baseRaw: doc("2026-08-02"),
      changedOn: "2026-08-01",
    })
    expect(r?.rule).toBe("last-updated-regressed")
  })

  it("accepts a new file whose date matches the commit", () => {
    const r = checkLastUpdated({
      file: FILE,
      raw: doc("2026-08-02"),
      baseRaw: null,
      changedOn: "2026-08-02",
    })
    expect(r).toBeNull()
  })

  it("stays silent when last_updated is absent", () => {
    // `validate:catalog` already blocks on `missing-last-updated`. Reporting it
    // twice makes one fix look like two problems.
    const r = checkLastUpdated({
      file: FILE,
      raw: doc(null),
      baseRaw: doc("2026-07-29"),
      changedOn: "2026-08-02",
    })
    expect(r).toBeNull()
  })

  it("names the file and both dates so the fix needs no second lookup", () => {
    const r = checkLastUpdated({
      file: FILE,
      raw: doc("2026-07-27"),
      baseRaw: doc("2026-07-27"),
      changedOn: "2026-07-29",
    })
    expect(r?.message).toContain("2026-07-27")
    expect(r?.message).toContain("2026-07-29")
    expect(r?.file).toBe(FILE)
  })
})
