// e2e/helpers/FrameHelper.ts
// Not one of the e2e-flow skill's nine templates — added for this repo. Maps to
// an embedded document (the detail page's preview iframe), located by its
// title like any other titled element.
import { expect } from "@playwright/test"
import type { Locator, Page } from "@playwright/test"

export class FrameHelper {
  constructor(private readonly page: Page) {}

  private frame(title: string | RegExp, within?: Locator): Locator {
    return (within ?? this.page).getByTitle(title)
  }

  /** Assert the iframe with this title is shown. */
  async expectVisible(
    title: string | RegExp,
    opts?: { within?: Locator }
  ): Promise<void> {
    await expect(this.frame(title, opts?.within)).toBeVisible()
  }

  /** Assert an attribute on the embedded document's root `<html>` element. */
  async expectDocumentAttribute(
    title: string | RegExp,
    attribute: string,
    value: string,
    opts?: { within?: Locator }
  ): Promise<void> {
    const html = this.frame(title, opts?.within).contentFrame().locator("html")
    await expect(html).toHaveAttribute(attribute, value)
  }
}
