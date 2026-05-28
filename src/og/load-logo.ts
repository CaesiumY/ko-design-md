import fs from "node:fs"
import path from "node:path"

const PUBLIC_DIR = path.resolve(process.cwd(), "public")

const MIME_BY_EXT: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
}

// Mirrors `localLogoPath()` in src/lib/site-config.ts. Duplicated here because
// site-config.ts touches `import.meta.env` at top level, which crashes when
// the build script is run directly under tsx/Node (no Vite env injection).
// Keeping the logic identical so frontmatter URL handling stays consistent
// across web rendering and OG generation.
function frontmatterLogoToPath(url: string | undefined): string | undefined {
  if (!url) return url
  if (url.startsWith("/")) return url
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return url
    return parsed.pathname + parsed.search + parsed.hash
  } catch {
    return url
  }
}

// Convert a frontmatter `logo:` URL into a base64 data URI ready to drop into
// a Satori `<img src>`. Returns undefined when the asset is missing or the
// extension is unsupported — callers render the OG without a logo in that
// case (text-only fallback). All errors are swallowed so one bad asset never
// kills the whole `build:og` run.
export function loadOgLogo(logoUrl: string | undefined): string | undefined {
  if (!logoUrl) return undefined

  const relPath = frontmatterLogoToPath(logoUrl)
  if (!relPath || !relPath.startsWith("/")) return undefined

  const absPath = path.join(PUBLIC_DIR, relPath.replace(/^\//, ""))
  if (!fs.existsSync(absPath)) {
    console.warn(`[og] logo missing: ${path.relative(process.cwd(), absPath)}`)
    return undefined
  }

  const ext = path.extname(absPath).toLowerCase()
  const mime = MIME_BY_EXT[ext]
  if (!mime) {
    console.warn(`[og] logo unsupported extension: ${ext} (${absPath})`)
    return undefined
  }

  try {
    const buffer = fs.readFileSync(absPath)
    return `data:${mime};base64,${buffer.toString("base64")}`
  } catch (err) {
    console.warn(`[og] logo read failed: ${absPath}`, err)
    return undefined
  }
}
