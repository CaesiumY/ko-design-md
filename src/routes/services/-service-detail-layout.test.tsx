// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ServiceDetailLayout } from "./$slug"

import type { ReactNode } from "react"
import type { ServiceDoc } from "@/lib/content-types"

vi.mock("./-components/copy-button", () => ({
  CopyButton: () => <button type="button">design.md 전체 복사</button>,
}))

vi.mock("./-components/detail-tabs", () => ({
  DetailTabs: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DetailTabsList: ({ children }: { children: ReactNode }) => (
    <div role="tablist">{children}</div>
  ),
  DetailTabsPanel: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DetailTabsTab: ({
    children,
    value,
  }: {
    children: ReactNode
    value: string
  }) => (
    <button role="tab" type="button" value={value}>
      {children}
    </button>
  ),
}))

vi.mock("./-components/inline-copy-button", () => ({
  InlineCopyButton: () => <button type="button">Copy</button>,
}))

vi.mock("./-components/preview-frame", () => ({
  PreviewFrame: () => <div>Preview</div>,
  PreviewUnavailable: () => <div>Preview unavailable</div>,
}))

vi.mock("./-components/preview-theme-toggle", () => ({
  PreviewThemeToggle: () => <button type="button">Theme</button>,
}))

vi.mock("./-components/raw-design-md", () => ({
  RawDesignMd: () => <pre>Source</pre>,
}))

const doc = {
  frontmatter: {
    name: "Toss",
    slug: "toss",
    category: "finance",
    last_updated: "2026-05-15",
    sources: [],
    related_services: [],
    lang: "ko",
  },
  raw: "# Toss\n\nDesign source",
  body: "Design source",
  tagline: "금융 서비스 UI를 위한 디자인 소스입니다.",
  filePath: "/services/toss.md",
  estimatedTokens: 1200,
} satisfies ServiceDoc

afterEach(cleanup)

describe("ServiceDetailLayout", () => {
  it("renders the primary copy action before the preview tabs", () => {
    render(
      <ServiceDetailLayout
        doc={doc}
        filename="toss.md"
        onTabChange={() => {}}
        onThemeChange={() => {}}
        previewAvailable={false}
        previewTheme="dark"
        searchTab="preview"
        shikiHtml="<pre><code># Toss</code></pre>"
      />,
    )

    const copyAction = screen.getByRole("button", {
      name: /design\.md 전체 복사/i,
    })
    const previewTab = screen.getByRole("tab", { name: /live preview/i })

    expect(
      copyAction.compareDocumentPosition(previewTab) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
