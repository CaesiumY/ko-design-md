import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

// `src/start.ts` exists because of two details of @tanstack/start-server-core
// that are internals, not public API: `executeRouter` answers any Accept that
// takes neither HTML nor the full wildcard with a hardcoded 500, and global
// request middleware runs before the router gets that far. The dependency is
// bumped as part of the `@tanstack/*` dependabot group on caret ranges, so an
// upgrade can change either detail without anyone reading start.ts.
//
// These tests read the installed copy of the handler and fail when either
// detail disappears. They are a tripwire, not a behaviour test: a failure does
// not mean the site is broken, it means start.ts has to be re-read - the
// workaround may have become unnecessary, or may now collide with native
// content negotiation.

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

function installedStartHandler(): { version: string; source: string } {
  // start-server-core is not a direct dependency, so pnpm does not expose it at
  // the project root. Resolve it from @tanstack/react-start, which depends on it.
  const fromRoot = createRequire(join(REPO_ROOT, "package.json"))
  const fromReactStart = createRequire(
    fromRoot.resolve("@tanstack/react-start/package.json")
  )
  const packageJsonPath = fromReactStart.resolve(
    "@tanstack/start-server-core/package.json"
  )
  // eslint-disable-next-line no-restricted-syntax -- A package.json read out of node_modules is untyped external input; only `version` is read, after narrowing.
  const parsed: unknown = JSON.parse(readFileSync(packageJsonPath, "utf8"))
  const version =
    typeof parsed === "object" &&
    parsed !== null &&
    "version" in parsed &&
    typeof parsed.version === "string"
      ? parsed.version
      : "unknown"
  const source = readFileSync(
    join(dirname(packageJsonPath), "dist", "esm", "createStartHandler.js"),
    "utf8"
  )
  return { version, source }
}

describe("TanStack Start internals that src/start.ts works around", () => {
  const { version, source } = installedStartHandler()

  it("still rejects non-HTML Accept with the hardcoded 500 the middleware pre-empts", () => {
    expect(
      source.includes("Only HTML requests are supported here"),
      `@tanstack/start-server-core ${version} no longer contains the hardcoded non-HTML rejection - re-read src/start.ts`
    ).toBe(true)
  })

  it("still runs global request middleware before the router", () => {
    expect(
      source.includes(
        "...flattenedRequestMiddlewares.map((d) => d.options.server), requestHandlerMiddleware"
      ),
      `@tanstack/start-server-core ${version} changed how request middleware is ordered - re-read src/start.ts`
    ).toBe(true)
  })
})
