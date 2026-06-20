import fs from "node:fs"
import path from "node:path"
import type { SatoriOptions } from "satori"

const FONTS_DIR = path.resolve(process.cwd(), "src/assets/fonts")

function readOtf(filename: string): ArrayBuffer {
  const fullPath = path.join(FONTS_DIR, filename)
  const buffer = fs.readFileSync(fullPath)
  // Slice into a fresh ArrayBuffer — satori rejects Node Buffers directly.
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  )
}

let cachedFonts: SatoriOptions["fonts"] | undefined

export function loadOgFonts(): SatoriOptions["fonts"] {
  if (cachedFonts) return cachedFonts
  cachedFonts = [
    {
      name: "Pretendard",
      data: readOtf("Pretendard-Medium.otf"),
      weight: 500,
      style: "normal",
    },
    {
      name: "Pretendard",
      data: readOtf("Pretendard-Black.otf"),
      weight: 900,
      style: "normal",
    },
  ]
  return cachedFonts
}
