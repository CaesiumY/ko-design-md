import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { createConnection } from "node:net"
import { fileURLToPath } from "node:url"
import type { ChildProcess } from "node:child_process"

const HOST = "127.0.0.1"
const PORT = 4173
const BASE_URL = `http://${HOST}:${PORT}`
const SERVER_PATH = fileURLToPath(
  new URL("../.output/server/index.mjs", import.meta.url)
)
const MAX_SERVER_LOG = 20_000

interface HttpResult {
  method: string
  path: string
  accept: string
  status: number
  headers: Headers
  body: string
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 10_000
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

/** Return false when another process already owns the exact smoke-test port. */
function isPortAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ host: HOST, port: PORT })
    let settled = false
    const finish = (available: boolean) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve(available)
    }
    socket.once("connect", () => finish(false))
    socket.once("error", () => finish(true))
    socket.setTimeout(500, () => finish(false))
  })
}

function appendLog(current: string, chunk: Buffer | string): string {
  const next = current + chunk.toString()
  return next.length > MAX_SERVER_LOG ? next.slice(-MAX_SERVER_LOG) : next
}

function startServer(onLog: (chunk: Buffer | string) => void): ChildProcess {
  const child = spawn(process.execPath, [SERVER_PATH], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    env: {
      ...process.env,
      NITRO_HOST: HOST,
      NITRO_PORT: String(PORT),
    },
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
    windowsHide: true,
  })
  child.stdout.on("data", onLog)
  child.stderr.on("data", onLog)
  return child
}

async function waitForServer(child: ChildProcess): Promise<void> {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`server exited before readiness (code ${child.exitCode})`)
    }
    try {
      const response = await fetchWithTimeout(
        `${BASE_URL}/`,
        { headers: { Accept: "text/markdown" } },
        1_000
      )
      await response.body?.cancel()
      return
    } catch {
      await wait(250)
    }
  }
  throw new Error("server did not become ready within 30 seconds")
}

async function request(
  path: string,
  accept: string,
  method = "GET"
): Promise<HttpResult> {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}${path}`, {
      method,
      headers: { Accept: accept },
      redirect: "manual",
    })
    return {
      method,
      path,
      accept,
      status: response.status,
      headers: response.headers,
      body: await response.text(),
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new Error(
      `${method} ${path} Accept=${JSON.stringify(accept)}: request failed: ${detail}`
    )
  }
}

function fail(result: HttpResult, message: string): never {
  throw new Error(
    `${result.method} ${result.path} Accept=${JSON.stringify(result.accept)}: ${message}`
  )
}

function expectStatus(result: HttpResult, expected: number): void {
  if (result.status !== expected) {
    fail(result, `expected status ${expected}, received ${result.status}`)
  }
}

function expectContentType(result: HttpResult, expected: string): void {
  const actual = result.headers.get("content-type") ?? "<missing>"
  if (!actual.toLowerCase().startsWith(expected.toLowerCase())) {
    fail(result, `expected Content-Type ${expected}, received ${actual}`)
  }
}

function expectVary(result: HttpResult, required: boolean): void {
  const vary = result.headers.get("vary")
  const hasAccept =
    vary?.split(",").some((token) => token.trim().toLowerCase() === "accept") ??
    false
  if (hasAccept !== required) {
    fail(
      result,
      required
        ? `expected Vary to include Accept, received ${vary ?? "<missing>"}`
        : `expected no Vary: Accept, received ${vary ?? "<missing>"}`
    )
  }
}

function expectCache(
  result: HttpResult,
  required: string,
  absent?: string
): void {
  const cache = result.headers.get("cache-control") ?? "<missing>"
  if (!cache.toLowerCase().includes(required.toLowerCase())) {
    fail(
      result,
      `expected Cache-Control to include ${required}, received ${cache}`
    )
  }
  if (absent && cache.toLowerCase().includes(absent.toLowerCase())) {
    fail(result, `expected Cache-Control without ${absent}, received ${cache}`)
  }
}

function summarizeBody(body: string): string {
  const preview = body.replace(/\s+/g, " ").slice(0, 200)
  const suffix =
    body.length > 200 ? `… (${body.length} chars)` : ` (${body.length} chars)`
  return `${JSON.stringify(preview)}${suffix}`
}

function expectBody(
  result: HttpResult,
  predicate: (body: string) => boolean,
  message: string
): void {
  if (!predicate(result.body)) {
    fail(result, `${message}; received body ${summarizeBody(result.body)}`)
  }
}

async function runChecks(): Promise<void> {
  const htmlRoot = await request("/", "text/html")
  expectStatus(htmlRoot, 200)
  expectContentType(htmlRoot, "text/html")
  expectVary(htmlRoot, true)
  expectBody(
    htmlRoot,
    (body) => {
      const document = body.trimEnd()
      return (
        document.startsWith("<!DOCTYPE html>") && document.endsWith("</html>")
      )
    },
    "expected a complete HTML document"
  )

  const htmlService = await request("/services/toss", "text/html")
  expectStatus(htmlService, 200)
  expectContentType(htmlService, "text/html")
  expectVary(htmlService, true)
  expectBody(
    htmlService,
    (body) => {
      const document = body.trimEnd()
      return (
        document.startsWith("<!DOCTYPE html>") && document.endsWith("</html>")
      )
    },
    "expected a complete service HTML document"
  )

  const markdownRoot = await request("/", "text/markdown")
  expectStatus(markdownRoot, 200)
  expectContentType(markdownRoot, "text/markdown")
  expectVary(markdownRoot, true)
  expectCache(markdownRoot, "s-maxage=3600", "must-revalidate")
  expectBody(
    markdownRoot,
    (body) => body.startsWith("# ko/design.md"),
    "expected the catalog Markdown"
  )

  const markdownService = await request("/services/toss", "text/markdown")
  expectStatus(markdownService, 200)
  expectContentType(markdownService, "text/markdown")
  expectVary(markdownService, true)
  expectCache(markdownService, "s-maxage=3600", "must-revalidate")
  expectBody(
    markdownService,
    (body) => body.startsWith("---") && body.includes("slug: toss"),
    "expected the toss DESIGN.md Markdown"
  )

  const plainService = await request("/services/toss", "text/plain")
  expectStatus(plainService, 200)
  expectContentType(plainService, "text/plain")
  expectVary(plainService, true)
  if (plainService.body !== markdownService.body) {
    fail(
      plainService,
      `expected the text/plain body to equal the Markdown body (${markdownService.body.length} chars), received ${plainService.body.length} chars: ${summarizeBody(plainService.body)}`
    )
  }

  const staticTextPaths = [
    "/llms.txt",
    "/services/toss/llms.txt",
    "/services/toss/DESIGN.md",
  ]
  for (const path of staticTextPaths) {
    const result = await request(path, "text/markdown")
    expectStatus(result, 200)
    expectContentType(result, "text/plain")
    expectVary(result, false)
    expectBody(
      result,
      (body) => body.length > 0,
      "expected a non-empty text endpoint"
    )
  }

  const serviceLlms = await request("/services/toss/llms.txt", "text/markdown")
  if (serviceLlms.body !== markdownService.body) {
    fail(
      serviceLlms,
      `expected the service llms.txt body to equal the Markdown body (${markdownService.body.length} chars), received ${serviceLlms.body.length} chars: ${summarizeBody(serviceLlms.body)}`
    )
  }

  const notAcceptablePaths = [
    ["/about", "text/markdown"],
    ["/", "application/json"],
  ] as const
  for (const [path, accept] of notAcceptablePaths) {
    const result = await request(path, accept)
    expectStatus(result, 406)
    expectContentType(result, "text/markdown")
    expectVary(result, true)
    expectCache(result, "must-revalidate", "s-maxage")
    expectBody(
      result,
      (body) =>
        body.includes("# 406 Not Acceptable") &&
        body.includes("Accept: text/html"),
      "expected a 406 recovery body"
    )
  }

  for (const path of ["/nope", "/services/not-a-brand", "/_probe"]) {
    const result = await request(path, "text/markdown")
    expectStatus(result, 404)
    expectContentType(result, "text/markdown")
    expectVary(result, true)
    expectCache(result, "must-revalidate", "s-maxage")
    expectBody(
      result,
      (body) => body.includes("# 404 Not Found") && body.includes("/llms.txt"),
      "expected a 404 recovery body"
    )
  }

  const wildcardService = await request("/services/toss", "text/html;q=0, */*")
  expectStatus(wildcardService, 200)
  expectContentType(wildcardService, "text/markdown")
  expectVary(wildcardService, true)
  if (wildcardService.body !== markdownService.body) {
    fail(
      wildcardService,
      "HTML-refusing wildcard request did not receive Markdown"
    )
  }

  const headCases = [
    ["/", "text/markdown"],
    ["/services/toss", "text/markdown"],
    ["/about", "text/markdown"],
    ["/nope", "text/markdown"],
    ["/services/toss/llms.txt", "text/markdown"],
  ] as const
  for (const [path, accept] of headCases) {
    const getResult = await request(path, accept)
    const headResult = await request(path, accept, "HEAD")
    if (headResult.status !== getResult.status) {
      fail(headResult, `HEAD status differs from GET (${getResult.status})`)
    }
    for (const header of ["content-type", "vary", "cache-control"]) {
      const expected = getResult.headers.get(header) ?? "<missing>"
      const actual = headResult.headers.get(header) ?? "<missing>"
      if (actual !== expected) {
        fail(
          headResult,
          `expected HEAD ${header} ${expected}, received ${actual}`
        )
      }
    }
    if (headResult.body !== "")
      fail(headResult, "HEAD returned a response body")
  }
}

async function stopServer(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null) return
  await new Promise<void>((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }
    child.once("close", finish)
    child.once("error", finish)
    child.kill("SIGTERM")
    setTimeout(() => {
      if (!settled) {
        child.kill("SIGKILL")
        setTimeout(finish, 1_000)
      }
    }, 5_000)
  })
}

async function main(): Promise<void> {
  if (!existsSync(SERVER_PATH)) {
    throw new Error(".output/server/index.mjs is missing; run pnpm build first")
  }
  if (!(await isPortAvailable())) {
    throw new Error(`HTTP smoke port ${PORT} is already in use`)
  }

  let serverOutput = ""
  const server = startServer((chunk) => {
    serverOutput = appendLog(serverOutput, chunk)
  })
  try {
    await waitForServer(server)
    await runChecks()
    console.log("[http] production server smoke checks passed")
  } catch (error) {
    console.error("[http] production server smoke checks failed")
    console.error(serverOutput || "[http] server emitted no log output")
    throw error
  } finally {
    await stopServer(server)
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
