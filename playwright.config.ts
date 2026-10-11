// Playwright E2E smoke for the site (`pnpm test:e2e`). Scaffolded by the
// e2e-flow skill (Phase 1) and adapted to this repo — see the E2E paragraph in
// CLAUDE.md.
import { defineConfig, devices } from "@playwright/test"

const HOST = "127.0.0.1"
// 4173 belongs to `pnpm test:http` and the `.claude/launch.json` preview, and a
// local run reuses whatever server already holds the port — sharing it would
// attach the suite to a stale server.
const PORT = 4174

// E2E_BASE_URL points the suite at an external deployment instead; no local
// server is started then.
const BASE_URL = process.env.E2E_BASE_URL ?? `http://${HOST}:${PORT}`
const USE_LOCAL_SERVER = !process.env.E2E_BASE_URL
const CI = !!process.env.CI

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: CI,
  // One retry in CI absorbs a one-off hiccup; the HTML report still lists a test
  // that passed only on retry as "flaky", so instability stays visible.
  retries: CI ? 1 : 0,
  reporter: CI ? [["list"], ["html", { open: "never" }]] : "list",

  use: {
    baseURL: BASE_URL,
    // Locally there is no retry, so keep the trace of the first failure — the
    // e2e-flow skill's self-heal phase reads it. CI records it on the retry.
    trace: CI ? "on-first-retry" : "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  expect: {
    timeout: 5_000,
  },

  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Always the production build (scripts/e2e-server.ts), locally and in CI: the
  // dev server answers some routes differently. The script rebuilds when the
  // build is missing or older than its sources, hence the long timeout.
  webServer: USE_LOCAL_SERVER
    ? {
        command: "pnpm exec tsx scripts/e2e-server.ts",
        env: { NITRO_HOST: HOST, NITRO_PORT: String(PORT) },
        url: BASE_URL,
        reuseExistingServer: !CI,
        timeout: 300_000,
        stdout: "pipe",
        stderr: "pipe",
      }
    : undefined,
})
