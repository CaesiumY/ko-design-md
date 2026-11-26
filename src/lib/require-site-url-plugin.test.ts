import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { resolveConfig } from "vite"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { requireSiteUrlPlugin } from "./require-site-url-plugin"

// Driven through Vite's own config resolution against a throwaway root, so the
// env the plugin judges is the one a build would inline: shell variables and
// .env files alike.

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "require-site-url-"))
  // Absent, not empty: an empty shell value would override the .env file below.
  vi.stubEnv("VITE_SITE_URL", undefined)
})

afterEach(() => {
  vi.unstubAllEnvs()
  rmSync(root, { recursive: true, force: true })
})

function resolve(command: "build" | "serve") {
  return resolveConfig(
    {
      configFile: false,
      root,
      logLevel: "silent",
      plugins: [requireSiteUrlPlugin()],
    },
    command,
    command === "build" ? "production" : "development"
  )
}

describe("requireSiteUrlPlugin", () => {
  it("fails a build with no VITE_SITE_URL and says how to set it", async () => {
    await expect(resolve("build")).rejects.toThrow(
      /VITE_SITE_URL[\s\S]*\.env\.production\.local/
    )
  })

  it("treats an empty value as missing, like site-config does", async () => {
    vi.stubEnv("VITE_SITE_URL", "")
    await expect(resolve("build")).rejects.toThrow(/VITE_SITE_URL/)
  })

  it.each(["/", "//"])(
    "treats %s as missing: nothing is left after the trailing slashes",
    async (value) => {
      vi.stubEnv("VITE_SITE_URL", value)
      await expect(resolve("build")).rejects.toThrow(/VITE_SITE_URL/)
    }
  )

  it("accepts a value from the shell", async () => {
    vi.stubEnv("VITE_SITE_URL", "https://example.test")
    await expect(resolve("build")).resolves.toBeDefined()
  })

  it.each([".env.local", ".env.production.local"])(
    "accepts a value from %s",
    async (file) => {
      writeFileSync(join(root, file), "VITE_SITE_URL=https://example.test\n")
      await expect(resolve("build")).resolves.toBeDefined()
    }
  )

  it("leaves the dev server alone", async () => {
    await expect(resolve("serve")).resolves.toBeDefined()
  })

  it("is wired into vite.config.ts", () => {
    // `pnpm gates` does not build and CI's build sets the variable, so nothing
    // else would notice the plugin being dropped from the config.
    const config = readFileSync(
      new URL("../../vite.config.ts", import.meta.url),
      "utf8"
    )
    expect(config).toMatch(/^\s+requireSiteUrlPlugin\(\),$/m)
  })
})
