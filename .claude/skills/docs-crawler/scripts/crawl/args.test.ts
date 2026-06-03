import { describe, expect, it } from "vitest"
import { parseArgs } from "./args"

// parseArgs reads from a full argv array (it slices off the first two entries,
// mirroring process.argv), so each case prepends two placeholder entries.
const argv = (...rest: Array<string>): Array<string> => ["node", "crawl", ...rest]

describe("parseArgs", () => {
  it("localizes images by default", () => {
    expect(parseArgs(argv("https://x.com")).downloadImages).toBe(true)
  })

  it("--external-images opts out of downloading", () => {
    expect(
      parseArgs(argv("https://x.com", "--external-images")).downloadImages,
    ).toBe(false)
  })

  it("accepts --download-images as a no-op backward-compatible alias", () => {
    expect(
      parseArgs(argv("https://x.com", "--download-images")).downloadImages,
    ).toBe(true)
  })

  it("applies the download flags in order (last wins)", () => {
    expect(
      parseArgs(argv("https://x.com", "--download-images", "--external-images"))
        .downloadImages,
    ).toBe(false)
    expect(
      parseArgs(argv("https://x.com", "--external-images", "--download-images"))
        .downloadImages,
    ).toBe(true)
  })

  it("parses --out into an absolute path", () => {
    const { outDir } = parseArgs(argv("https://x.com", "--out", "./foo"))
    expect(outDir.endsWith("foo")).toBe(true)
    expect(outDir).not.toBe("./foo") // resolved to absolute
  })

  it("parses comma-separated --seeds resolved against the site origin", () => {
    const { seeds } = parseArgs(argv("https://x.com/docs", "--seeds", "/a, /b"))
    expect(seeds).toEqual(["https://x.com/a", "https://x.com/b"])
  })

  it("captures the first positional as the site URL", () => {
    expect(parseArgs(argv("https://x.com/start")).url).toBe(
      "https://x.com/start",
    )
  })
})
