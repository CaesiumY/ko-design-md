import { SITE_URL } from "@/lib/site-config"

/**
 * The two lines a reader pastes into a coding agent to hand an entry over
 * without installing the consumer skill: the entry's DESIGN.md address, then
 * one instruction to build the current project's UI in that design.
 *
 * The address goes first and the instruction stays a single line on purpose —
 * the point is a prompt short enough to paste blind, like Claude Design's
 * handoff. Guidance on what not to invent lives in the document itself.
 *
 * `name` is the entry's frontmatter `name`, never a hand-written label: many
 * entries publish no `design_system_name`, and a typed-in name is exactly how a
 * prompt ends up naming a design system the brand never published.
 *
 * `origin` defaults to `SITE_URL` and is a parameter only because that constant
 * is fixed from the env at import time. In dev it is empty, so the address
 * comes out site-relative — production builds require the env, so a shipped
 * page always hands over an absolute URL.
 */
export function buildHandoffPrompt(
  name: string,
  slug: string,
  origin: string = SITE_URL
): string {
  const url = `${origin.replace(/\/+$/, "")}/services/${slug}/DESIGN.md`
  return `${url}\n이 DESIGN.md 의 ${name} 디자인으로 지금 프로젝트 UI 를 구현해 줘.`
}
