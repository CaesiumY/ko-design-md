// e2e/helpers/LinkListHelper.ts
// Not one of the e2e-flow skill's nine templates — added for this repo. Maps to
// a list rendered as a run of links (the home catalog rows). A row's accessible
// name concatenates its number, name, tagline and dates, so rows are identified
// by where they lead rather than by text.
import { expect } from "@playwright/test"
import type { Locator, Page } from "@playwright/test"

export class LinkListHelper {
  constructor(private readonly page: Page) {}

  /**
   * Assert that the links inside `within` (default: the whole page) lead
   * exactly to `hrefs`, in any order. Polls, so it also waits out a debounced
   * filter.
   */
  async expectHrefs(
    hrefs: Array<string>,
    opts?: { within?: Locator }
  ): Promise<void> {
    const links = (opts?.within ?? this.page).getByRole("link")
    await expect
      .poll(async () =>
        (
          await links.evaluateAll((nodes) =>
            nodes.map((node) => node.getAttribute("href") ?? "")
          )
        ).sort()
      )
      .toEqual([...hrefs].sort())
  }

  /** Assert that `within` holds no links at all and shows `emptyText`. */
  async expectEmpty(
    emptyText: string,
    opts?: { within?: Locator }
  ): Promise<void> {
    const root = opts?.within ?? this.page
    await expect(root.getByRole("link")).toHaveCount(0)
    await expect(root.getByText(emptyText, { exact: true })).toBeVisible()
  }
}
