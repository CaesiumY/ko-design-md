import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { serveStatic } from "../../scripts/audit-contrast-sweep"
import type { StaticServer } from "../../scripts/audit-contrast-sweep"

// The sweep's static server is reachable without a browser, so what it does
// with a hostile or malformed request can be pinned here even though the rest
// of `audit-contrast-sweep.ts` cannot. It serves the same `public/` the
// previews are loaded from, and a request it mishandles takes down a run that
// has no other way to report where it died.

describe("serveStatic", () => {
  let server: StaticServer
  let base: string

  beforeAll(async () => {
    server = await serveStatic(join(process.cwd(), "public"))
    base = `http://127.0.0.1:${server.port}`
  })
  afterAll(async () => {
    await server.close()
  })

  it("serves a real file from public/", async () => {
    const res = await fetch(`${base}/preview/_runtime/tokens.css`)
    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toContain("text/css")
  })

  it("survives a malformed percent escape instead of dying", async () => {
    // `decodeURIComponent("/logos/100%.png")` throws URIError. Thrown inside
    // the request handler that is an uncaught exception, which ends the whole
    // sweep — no report, no JSON, and an error naming a URL rather than the
    // slug being measured.
    const res = await fetch(`${base}/logos/100%.png`)
    // 400 rather than 404: the path cannot name a file at all, so the server
    // refuses it instead of guessing which file was meant.
    expect(res.status).toBe(400)
  })

  it("is still serving after the malformed request", async () => {
    const res = await fetch(`${base}/preview/_runtime/tokens.css`)
    expect(res.status).toBe(200)
  })

  it("never serves a file from outside public/, however the path is spelled", async () => {
    // Not a test of the explicit `startsWith(root + sep)` guard: `fetch`
    // normalises a literal `..` before sending, and `path.normalize` strips a
    // leading `..` from an absolute path, so a percent-encoded one lands back
    // inside `public/` as well. Measured — every spelling below comes back 404,
    // not 403. That guard is defence in depth behind those two behaviours.
    //
    // What IS pinnable is the property that matters, and it is the one a
    // refactor would break: nothing outside `public/` is ever served.
    for (const path of [
      "/../package.json",
      "/%2e%2e/package.json",
      "/preview/%2e%2e/%2e%2e/package.json",
      "/preview/../../package.json",
    ]) {
      const res = await fetch(`${base}${path}`)
      expect(res.status, path).not.toBe(200)
    }
  })

  it("404s the oracle path until a fixture is loaded", async () => {
    expect((await fetch(`${base}/__oracle/preview.html`)).status).toBe(404)
  })

  it("serves the fixture once one is loaded, without touching disk", async () => {
    server.setOracle("<!doctype html><title>fixture</title>")
    const res = await fetch(`${base}/__oracle/preview.html`)
    expect(res.status).toBe(200)
    expect(await res.text()).toContain("fixture")
    server.setOracle(null)
  })
})
