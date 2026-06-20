import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"
import pngToIco from "png-to-ico"

const cwd = process.cwd()
const SRC = path.resolve(cwd, "public/favicon.svg")
const OUTPUT_DIR = path.resolve(cwd, "public")

interface FaviconJob {
  outputName: string
  generate: (svg: Buffer) => Promise<Buffer>
}

const jobs: Array<FaviconJob> = [
  {
    outputName: "apple-touch-icon.png",
    generate: (svg) => sharp(svg).resize(180, 180).png().toBuffer(),
  },
  {
    outputName: "favicon.ico",
    generate: async (svg) => {
      const png32 = await sharp(svg).resize(32, 32).png().toBuffer()
      return pngToIco([png32])
    },
  },
]

async function main() {
  if (!fs.existsSync(SRC)) {
    throw new Error(`Source SVG not found: ${path.relative(cwd, SRC)}`)
  }
  const svg = fs.readFileSync(SRC)
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  console.log(
    `[favicons] Generating ${jobs.length} asset(s) → ${path.relative(cwd, OUTPUT_DIR)}/`
  )
  for (const job of jobs) {
    const start = Date.now()
    const buf = await job.generate(svg)
    fs.writeFileSync(path.join(OUTPUT_DIR, job.outputName), buf)
    const ms = Date.now() - start
    console.log(
      `  ✓ ${job.outputName.padEnd(28)} ${(buf.length / 1024).toFixed(1).padStart(7)} KB  (${ms}ms)`
    )
  }
  console.log(`[favicons] Done.`)
}

main().catch((err) => {
  console.error("[favicons] Failed:", err)
  process.exit(1)
})
