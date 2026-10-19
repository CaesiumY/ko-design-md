import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  SITE_FRONTMATTER_MODULE_ID,
  siteFrontmatterPlugin,
} from "./site-frontmatter-plugin"
import type { Plugin } from "vite"

// The plugin is driven through the hooks Vite calls — configResolved, then
// resolveId and load — against a throwaway project root holding fixture
// entries, so what is tested is what the build does with them.

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "site-frontmatter-"))
  mkdirSync(join(root, "services"))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

function entry(file: string, ...lines: Array<string>): void {
  writeFileSync(
    join(root, "services", file),
    ["---", ...lines, "---", "", "# Body", "", "소개 문구."].join("\n")
  )
}

const VALID = [
  "name: 토스",
  "slug: toss",
  "category: finance",
  "last_updated: 2026-10-01",
  "created_at: 2026-05-01",
  "lang: ko",
  "logo: https://getdesign.kr/logos/toss.svg",
]

interface Loaded {
  code: string
  watched: Array<string>
  warnings: Array<string>
}

// eslint-disable-next-line no-restricted-syntax -- Vite hooks are typed as unions of function/object forms; the test calls the function form.
type AnyHook = (this: unknown, ...args: Array<any>) => unknown

function load(): Loaded {
  const plugin: Plugin = siteFrontmatterPlugin()
  ;(plugin.configResolved as AnyHook).call({}, { root })
  const resolved = (plugin.resolveId as AnyHook).call(
    {},
    SITE_FRONTMATTER_MODULE_ID
  ) as string
  const watched: Array<string> = []
  const warnings: Array<string> = []
  const context = {
    addWatchFile: (file: string) => watched.push(file),
    warn: (message: string) => warnings.push(message),
    error: (message: string): never => {
      throw new Error(message)
    },
  }
  const code = (plugin.load as AnyHook).call(context, resolved) as string
  return { code, watched, warnings }
}

/** The module's export, from running the code `load` returned as a module. */
async function exported(
  code: string
): Promise<Record<string, Record<string, string | number>>> {
  const url = `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`
  const mod = (await import(/* @vite-ignore */ url)) as {
    siteFrontmatter: Record<string, Record<string, string | number>>
  }
  return mod.siteFrontmatter
}

describe("site frontmatter plugin", () => {
  it("hands the site each entry's frontmatter keyed by its glob path", async () => {
    entry("toss.md", ...VALID)
    // Keys left out stay left out, wherever they fall in the key order.
    entry(
      "seed.md",
      "name: 당근",
      "design_system_name: SEED Design",
      "slug: seed-design",
      "estimated_tokens: 1200"
    )

    expect(await exported(load().code)).toEqual({
      "/services/seed.md": {
        name: "당근",
        design_system_name: "SEED Design",
        slug: "seed-design",
        estimated_tokens: 1200,
      },
      "/services/toss.md": {
        name: "토스",
        slug: "toss",
        category: "finance",
        last_updated: "2026-10-01",
        created_at: "2026-05-01",
        lang: "ko",
        logo: "https://getdesign.kr/logos/toss.svg",
      },
    })
  })

  it("fails the build on an empty key the site reads, naming the file and the key", () => {
    entry("toss.md", ...VALID.map((l) => (l.startsWith("name:") ? "name:" : l)))

    expect(() => load()).toThrow(/services\/toss\.md.*`name`/)
  })

  it("treats YAML's null literal like an empty value", () => {
    entry(
      "toss.md",
      ...VALID.map((l) => (l.startsWith("category:") ? "category: ~" : l))
    )

    expect(() => load()).toThrow(/services\/toss\.md.*`category`/)
  })

  // The hand parser could only ever hand the site text; YAML can hand it a
  // list or a number, which the site would render or sort as something else.
  it("fails the build when a text key reads as something other than text", () => {
    entry(
      "toss.md",
      ...VALID.map((l) => (l.startsWith("lang:") ? "lang: [ko]" : l))
    )

    expect(() => load()).toThrow(/services\/toss\.md.*`lang`/)
  })

  // `slug` and `estimated_tokens` already fall back to another source when
  // absent (the file name, the estimate). Written empty, they fall back the
  // same way — the draft validator accepts both (#488), so failing the build
  // would let a file pass the gate and then break the site.
  it.each(["slug:", "slug: ~", "estimated_tokens:", "estimated_tokens: null"])(
    "leaves `%s` out so the site derives it, as when the key is absent",
    async (line) => {
      entry("toss.md", ...VALID.filter((l) => !l.startsWith("slug:")), line)

      const fm = (await exported(load().code))["/services/toss.md"]
      expect(fm).not.toHaveProperty("slug")
      expect(fm).not.toHaveProperty("estimated_tokens")
      expect(fm).toMatchObject({ name: "토스", category: "finance" })
    }
  )

  // The date check used to run in the browser; it runs in the build now.
  it("fails the build on a date that is not a real calendar date", () => {
    entry(
      "toss.md",
      ...VALID.map((l) =>
        l.startsWith("last_updated:") ? "last_updated: 2026-02-30" : l
      )
    )

    expect(() => load()).toThrow(/last_updated.*services\/toss\.md/)
  })

  // In dev, an edited, added or removed entry must reach the next page load in
  // every environment (server and browser). Measured on the dev server too:
  // without this hook the browser kept the old module.
  it("drops its module in dev when an entry file changes, and only then", () => {
    const plugin = siteFrontmatterPlugin()
    ;(plugin.configResolved as AnyHook).call({}, { root })
    const virtual = { id: "\0virtual:site-frontmatter" }
    const invalidated: Array<typeof virtual> = []
    const context = {
      environment: {
        moduleGraph: {
          getModuleById: (id: string) => (id === virtual.id ? virtual : null),
          invalidateModule: (mod: typeof virtual) => invalidated.push(mod),
        },
      },
    }
    const hotUpdate = (file: string) =>
      (plugin.hotUpdate as AnyHook).call(context, {
        type: "update",
        file,
        modules: [],
      })
    const posixRoot = root.replace(/\\/g, "/")

    expect(hotUpdate(`${posixRoot}/services/toss.tokens.json`)).toBeUndefined()
    expect(hotUpdate(`${posixRoot}/src/lib/foo.md`)).toBeUndefined()
    expect(invalidated).toEqual([])

    expect(hotUpdate(`${posixRoot}/services/toss.md`)).toEqual([virtual])
    expect(invalidated).toEqual([virtual])
  })
})
