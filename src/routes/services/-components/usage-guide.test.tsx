// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { UsageGuide } from "./usage-guide"

afterEach(cleanup)

describe("UsageGuide", () => {
  // Help a reader opens on purpose: the sidebar's first view stays the buttons
  // above it.
  it("starts closed under its summary line", () => {
    const { container } = render(<UsageGuide />)

    expect(
      screen.getByText("어떻게 사용하나요?").closest("summary")
    ).not.toBeNull()
    expect(container.querySelector("details")?.open).toBe(false)
  })

  // 2-A and 2-B are two ways through the same second step, so the labels say
  // so; a plain 1-2-3 read as "do all three".
  it("lists one shared step, then the chat-box and project-folder branches", () => {
    render(<UsageGuide />)

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
    const { container } = render(<UsageGuide />)

    expect(screen.getAllByRole("listitem")[1].textContent).toContain(
      "예: 아래 DESIGN.md 대로 지금 화면을 다시 디자인해 줘. 기능은 그대로 둬."
    )
    expect(container.querySelector("button")).toBeNull()
  })

  // The folder branch calls the file DESIGN.md, as the download button's label
  // does, so the step reads the same on every brand's page - not by the
  // brand's saved name (`toss.md`).
  it("calls the downloaded file DESIGN.md in the project-folder step", () => {
    render(<UsageGuide />)

    const folderStep = screen.getAllByRole("listitem")[2].textContent
    expect(folderStep).toContain("다운로드한 DESIGN.md 를 프로젝트에 넣고")
    expect(folderStep).toContain("“이 DESIGN.md 대로 구현해 줘”")
  })
})
