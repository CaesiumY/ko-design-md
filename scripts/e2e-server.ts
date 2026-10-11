// Starts the built Nitro server for the Playwright E2E smoke (`pnpm test:e2e`).
//
// The E2E suite runs against the production build, not `vite dev`: the dev
// server answers some routes differently (the `.md` routes 404 there because a
// Vite middleware intercepts them), so a pass in dev would not mean a pass in
// production.
//
// Playwright's `webServer` (playwright.config.ts) runs this script, passing the
// host and port as NITRO_HOST / NITRO_PORT, and waits for the port. The build is
// rebuilt here when it is missing or older than its sources, so a local run never
// silently exercises yesterday's code. CI builds explicitly first, and that fresh
// output is then reused as-is.
//
// Importing this module starts a server, so it exports nothing.
import { spawnSync } from "node:child_process"
import { existsSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const SERVER_ENTRY = join(ROOT, ".output", "server", "index.mjs")

// Everything `pnpm build` reads that a test could observe.
const SOURCE_DIRS = ["src", "services", "public"]
const SOURCE_FILES = ["vite.config.ts", "package.json"]

function newestMtime(path: string): number {
  const stat = statSync(path)
  if (!stat.isDirectory()) return stat.mtimeMs
  let newest = stat.mtimeMs
  for (const entry of readdirSync(path)) {
    newest = Math.max(newest, newestMtime(join(path, entry)))
  }
  return newest
}

function buildIsStale(): boolean {
  if (!existsSync(SERVER_ENTRY)) return true
  const builtAt = statSync(SERVER_ENTRY).mtimeMs
  const sources = [...SOURCE_DIRS, ...SOURCE_FILES]
    .map((name) => join(ROOT, name))
    .filter((path) => existsSync(path))
  return sources.some((path) => newestMtime(path) > builtAt)
}

function build(): void {
  console.log("[e2e-server] build missing or older than sources — pnpm build")
  // A fixed command string through a shell: `pnpm` is `pnpm.cmd` on Windows,
  // which only resolves through one, and passing an args array alongside
  // `shell: true` is deprecated (DEP0190).
  const result = spawnSync("pnpm build", {
    cwd: ROOT,
    stdio: "inherit",
    // A production build throws without a site URL (src/lib/site-config.ts).
    // Only metadata (canonical, og, JSON-LD) uses it; every in-page link is
    // relative, so the suite never navigates to the real site.
    env: {
      ...process.env,
      VITE_SITE_URL: process.env.VITE_SITE_URL || "https://getdesign.kr",
    },
    shell: true,
  })
  if (result.status !== 0) {
    throw new Error(`pnpm build failed (exit ${result.status})`)
  }
}

const { NITRO_HOST, NITRO_PORT } = process.env
if (!NITRO_HOST || !NITRO_PORT) {
  throw new Error(
    "NITRO_HOST and NITRO_PORT must be set — run this through `pnpm test:e2e`"
  )
}

if (buildIsStale()) build()

console.log(
  `[e2e-server] serving .output on http://${NITRO_HOST}:${NITRO_PORT}`
)
// The Nitro node-server entry starts listening as a side effect of being loaded.
await import(pathToFileURL(SERVER_ENTRY).href)
