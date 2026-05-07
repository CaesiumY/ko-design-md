import satori from "satori"
import sharp from "sharp"
import { loadOgFonts } from "./load-fonts"
import { OgTemplate, type OgTemplateProps } from "./template"
import { CANVAS } from "./tokens"

export type RenderOgOptions = OgTemplateProps

export async function renderOgPng(opts: RenderOgOptions): Promise<Buffer> {
  const fonts = loadOgFonts()
  const svg = await satori(OgTemplate(opts), {
    width: CANVAS.width,
    height: CANVAS.height,
    fonts,
    embedFont: true,
  })
  return sharp(Buffer.from(svg)).png().toBuffer()
}
