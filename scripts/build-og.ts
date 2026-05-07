import fs from "node:fs"
import path from "node:path"
import { getCategoryStyle } from "../src/lib/category-style"
import { buildDoc, sortDocs } from "../src/lib/content-parser"
import type { ServiceDoc } from "../src/lib/content-types"
import { renderOgPng } from "../src/og/render"
import type {
  BreadcrumbSegment,
  TitleSegment,
} from "../src/og/template"

const cwd = process.cwd()
const SERVICES_DIR = path.resolve(cwd, "services")
const OUTPUT_DIR = path.resolve(cwd, "public/og")

// Hero issue mark — keep in sync with src/features/home/components/hero.tsx
const COLOPHON_DEFAULT = "№ 001 / 2026.05"

interface OgJob {
  outputName: string
  breadcrumb: Array<BreadcrumbSegment>
  colophon?: string
  titleSegments: Array<TitleSegment>
  lede: string
}

// Trim a long body-derived tagline to the first sentence-ish boundary so the
// 32px lede doesn't overflow the OG canvas. Korean sentences typically end
// with 다/요/죠 + 마침표; second arm covers plain ". " for English-led
// taglines; final fallback is a hard slice with ellipsis.
function ogLede(tagline: string): string {
  const koSentence = tagline.match(/^(.{8,90}?[다요죠]\.)(?:\s|$)/u)
  if (koSentence) return koSentence[1]
  const enSentence = tagline.match(/^(.{8,90}?\.)(?:\s|$)/u)
  if (enSentence) return enSentence[1]
  if (tagline.length <= 90) return tagline
  return tagline.slice(0, 87).trimEnd() + "…"
}

function buildDefaultJob(): OgJob {
  return {
    outputName: "default.png",
    breadcrumb: [
      { text: "CATALOG" },
      { text: "KOREAN DESIGN" },
      { text: "— LLM CONTEXT", brand: true },
    ],
    colophon: COLOPHON_DEFAULT,
    titleSegments: [
      { text: "ko" },
      { text: "/", brand: true },
      { text: "design.md" },
    ],
    lede: "한국 서비스의 시그니처 디자인을 LLM 컨텍스트로.",
  }
}

function buildServiceJob(doc: ServiceDoc): OgJob {
  const cat = getCategoryStyle(doc.frontmatter.category)
  const breadcrumb: Array<BreadcrumbSegment> = [
    { text: "CATALOG" },
    { text: "/" },
    { text: `${cat.koIndex}.`, brand: true },
    { text: cat.label },
  ]
  if (doc.frontmatter.tier === 1) {
    breadcrumb.push({ text: "/" }, { text: "★ TIER 1", brand: true })
  }
  return {
    outputName: `${doc.frontmatter.slug}.png`,
    breadcrumb,
    colophon: doc.frontmatter.last_updated
      ? `UPDATED · ${doc.frontmatter.last_updated}`
      : undefined,
    titleSegments: [{ text: doc.frontmatter.name }],
    lede: ogLede(doc.tagline),
  }
}

function collectJobs(): Array<OgJob> {
  const jobs: Array<OgJob> = [buildDefaultJob()]

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

  for (const doc of docs) jobs.push(buildServiceJob(doc))

  return jobs
}

async function main() {
  const jobs = collectJobs()
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  console.log(`[og] Generating ${jobs.length} OG image(s) → ${path.relative(cwd, OUTPUT_DIR)}/`)
  for (const job of jobs) {
    const start = Date.now()
    const png = await renderOgPng({
      breadcrumb: job.breadcrumb,
      colophon: job.colophon,
      titleSegments: job.titleSegments,
      lede: job.lede,
    })
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
