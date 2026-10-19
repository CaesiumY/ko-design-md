// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { downloadFilename } from "./download-button"
import { PasteGuide } from "./paste-guide"

afterEach(cleanup)

describe("PasteGuide", () => {
  // Help a reader opens on purpose: the sidebar's first view stays the two
  // buttons above it.
  it("starts closed under its summary line", () => {
    const { container } = render(<PasteGuide slug="toss" />)

    expect(
      screen.getByText("어떻게 붙여 넣나요?").closest("summary")
    ).not.toBeNull()
    expect(container.querySelector("details")?.open).toBe(false)
  })

  // 2-A and 2-B are two ways through the same second step, so the labels say
  // so; a plain 1-2-3 read as "do all three".
  it("lists one shared step, then the chat-box and project-folder branches", () => {
    render(<PasteGuide slug="toss" />)

    const steps = screen.getAllByRole("listitem")
    expect(steps.map((li) => li.textContent.split(" ")[0])).toEqual([
      "1",
      "2-A",
      "2-B",
    ])
    expect(steps[1].textContent).toContain("대화창")
    expect(steps[2].textContent).toContain("프로젝트 폴더")
  })

  // The example is for reading, not copying: a copy button here would bring
  // back the paste-this prompt the sidebar dropped (ADR 0010).
  it("shows an example request under the chat-box step with nothing to copy", () => {
    const { container } = render(<PasteGuide slug="toss" />)

    expect(screen.getAllByRole("listitem")[1].textContent).toContain(
      "예: 아래 DESIGN.md 대로 지금 화면을 다시 디자인해 줘. 기능은 그대로 둬."
    )
    expect(container.querySelector("button")).toBeNull()
  })

  // The download button saves `{slug}.md`, not DESIGN.md. A folder-working AI
  // told to follow "DESIGN.md" would find no such file, so the step names the
  // file the button actually wrote.
  it("names the downloaded file in the project-folder step", () => {
    render(<PasteGuide slug="toss" />)

    const folderStep = screen.getAllByRole("listitem")[2].textContent
    expect(folderStep).toContain(
      `이 ${downloadFilename("toss")} 대로 구현해 줘`
    )
    expect(folderStep).not.toContain("DESIGN.md")
  })
})
