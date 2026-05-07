import fs from "node:fs"
import path from "node:path"
import { buildDoc, sortDocs } from "../src/lib/content-parser"
import { renderOgPng } from "../src/og/render"
import { DEFAULT_PAGE } from "../src/og/tokens"

const cwd = process.cwd()
const SERVICES_DIR = path.resolve(cwd, "services")
const OUTPUT_DIR = path.resolve(cwd, "public/og")

interface OgJob {
  outputName: string
  title: string
  subtitle: string
}

// Trim a long body-derived tagline to the first sentence-ish boundary so the
// 28px subtitle doesn't overflow the OG canvas. Korean sentences typically end
// with 다/요/죠 + 마침표; fall back to plain ". " then to a hard slice.
function ogSubtitle(tagline: string): string {
  const koSentence = tagline.match(/^(.{8,90}?[다요죠]\.)(?:\s|$)/u)
  if (koSentence) return koSentence[1]
  const enSentence = tagline.match(/^(.{8,90}?\.)(?:\s|$)/u)
  if (enSentence) return enSentence[1]
  if (tagline.length <= 90) return tagline
  return tagline.slice(0, 87).trimEnd() + "…"
}

function collectJobs(): Array<OgJob> {
  const jobs: Array<OgJob> = [
    {
      outputName: "default.png",
      title: DEFAULT_PAGE.title,
      subtitle: DEFAULT_PAGE.subtitle,
    },
  ]

  if (!fs.existsSync(SERVICES_DIR)) return jobs

  const fileNames = fs
    .readdirSync(SERVICES_DIR)
    .filter((f) => f.endsWith(".md"))

  const docs = sortDocs(
    fileNames.map((fileName) => {
      const fullPath = path.join(SERVICES_DIR, fileName)
      const raw = fs.readFileSync(fullPath, "utf-8")
      // Mirror Vite's import.meta.glob path style so deriveSlug() stays consistent.
      return buildDoc(`/services/${fileName}`, raw)
    }),
  )

  for (const doc of docs) {
    jobs.push({
      outputName: `${doc.frontmatter.slug}.png`,
      title: doc.frontmatter.name,
      subtitle: ogSubtitle(doc.tagline),
    })
  }

  return jobs
}

async function main() {
  const jobs = collectJobs()
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  console.log(`[og] Generating ${jobs.length} OG image(s) → ${path.relative(cwd, OUTPUT_DIR)}/`)
  for (const job of jobs) {
    const start = Date.now()
    const png = await renderOgPng({ title: job.title, subtitle: job.subtitle })
    fs.writeFileSync(path.join(OUTPUT_DIR, job.outputName), png)
    const ms = Date.now() - start
    console.log(
      `  ✓ ${job.outputName.padEnd(28)} ${(png.length / 1024).toFixed(1).padStart(7)} KB  (${ms}ms)`,
    )
  }
  console.log(`[og] Done.`)
}

main().catch((err) => {
  console.error("[og] Failed:", err)
  process.exit(1)
})
