import satori from "satori"
import sharp from "sharp"
import { loadOgFonts } from "./load-fonts"
import { OgTemplate } from "./template"
import { CANVAS } from "./tokens"

export interface RenderOgOptions {
  title: string
  subtitle: string
}

export async function renderOgPng(opts: RenderOgOptions): Promise<Buffer> {
  const fonts = loadOgFonts()
  const svg = await satori(
    OgTemplate({ title: opts.title, subtitle: opts.subtitle }),
    {
      width: CANVAS.width,
      height: CANVAS.height,
      fonts,
      embedFont: true,
    },
  )
  return sharp(Buffer.from(svg)).png().toBuffer()
}
