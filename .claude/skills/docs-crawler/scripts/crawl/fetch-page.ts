// Page fetching: static fetch with retry, shared-browser Playwright fallback,
// robots.txt parsing.

import { spawnSync } from "node:child_process"
import type { Browser } from "playwright"

const FETCH_TIMEOUT_MS = 20_000
const RENDER_NAV_TIMEOUT_MS = 30_000
// After navigation, how long to wait for a client-rendered SPA to fill in.
const RENDER_SETTLE_MS = 15_000
const MAX_RETRIES = 2

export interface RobotsRules {
  /** Path prefixes disallowed for the `*` user-agent group. */
  disallow: Array<string>
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Fetch a page over plain HTTP with bounded retries. Throws on final failure. */
export async function fetchStatic(
  url: string,
  userAgent: string
): Promise<string> {
  let lastError: unknown
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": userAgent },
        redirect: "follow",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (error) {
      lastError = error
      if (attempt < MAX_RETRIES) await delay(500 * (attempt + 1))
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`fetch failed: ${String(lastError)}`)
}

// One browser is shared across the whole crawl — launching Chromium per page
// would be far too slow for a site where every page needs rendering.
let browserPromise: Promise<Browser> | null = null

async function launchBrowser(): Promise<Browser> {
  const { chromium } = await import("playwright")
  try {
    return await chromium.launch()
  } catch {
    console.log(
      "[crawl] Chromium not installed — running 'playwright install chromium' (one-time, ~150MB)..."
    )
    const result = spawnSync(
      "npx",
      ["--yes", "playwright", "install", "chromium"],
      { stdio: "inherit", shell: process.platform === "win32" }
    )
    if (result.status !== 0) {
      throw new Error(
        "Chromium install failed — run 'pnpm exec playwright install chromium' manually"
      )
    }
    return await chromium.launch()
  }
}

function getBrowser(): Promise<Browser> {
  if (!browserPromise) browserPromise = launchBrowser()
  return browserPromise
}

/** Close the shared browser. Safe to call even if one was never launched. */
export async function closeBrowser(): Promise<void> {
  const pending = browserPromise
  browserPromise = null
  if (!pending) return
  const browser = await pending.catch(() => null)
  if (browser) await browser.close()
}

/**
 * Fetch a page through a headless browser so client-rendered content is
 * present.
 *
 * Navigation waits for `domcontentloaded` rather than `networkidle`: many
 * sites never go network-idle (analytics, polling, sockets), which would make
 * every page hit the timeout. Instead, after navigation we poll for the body
 * to actually fill with text — and if it never does, we still return whatever
 * rendered rather than failing the page.
 */
export async function fetchRendered(
  url: string,
  userAgent: string
): Promise<string> {
  const browser = await getBrowser()
  const context = await browser.newContext({ userAgent })
  try {
    const page = await context.newPage()
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: RENDER_NAV_TIMEOUT_MS,
    })
    await page
      .waitForFunction(
        () =>
          document.body !== null && document.body.innerText.trim().length > 500,
        { timeout: RENDER_SETTLE_MS }
      )
      .catch(() => {
        // Content never crossed the threshold — proceed with what rendered.
      })
    return await page.content()
  } finally {
    await context.close()
  }
}

/**
 * Parse robots.txt, collecting `Disallow` rules that apply to the `*`
 * user-agent group. Intentionally simple — enough for polite crawling.
 */
export function parseRobots(text: string): RobotsRules {
  const disallow: Array<string> = []
  let appliesToAll = false
  let inGroup = false
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim()
    if (!line) continue
    const idx = line.indexOf(":")
    if (idx === -1) continue
    const key = line.slice(0, idx).trim().toLowerCase()
    const value = line.slice(idx + 1).trim()
    if (key === "user-agent") {
      appliesToAll = value === "*"
      inGroup = true
    } else if (key === "disallow" && inGroup && appliesToAll && value) {
      disallow.push(value)
    }
  }
  return { disallow }
}

/** True when `url`'s path is not blocked by the collected robots rules. */
export function isAllowed(url: string, rules: RobotsRules): boolean {
  if (rules.disallow.length === 0) return true
  let path: string
  try {
    path = new URL(url).pathname
  } catch {
    return true
  }
  return !rules.disallow.some((rule) => path.startsWith(rule))
}

/** Fetch and parse a site's robots.txt; missing/unreachable means no rules. */
export async function fetchRobots(
  origin: string,
  userAgent: string
): Promise<RobotsRules> {
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { "user-agent": userAgent },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return { disallow: [] }
    return parseRobots(await res.text())
  } catch {
    return { disallow: [] }
  }
}
