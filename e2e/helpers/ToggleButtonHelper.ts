// e2e/helpers/ToggleButtonHelper.ts
// Not one of the e2e-flow skill's nine templates — added for this repo. Maps to
// buttons whose state is `aria-pressed`: the home category filter and the
// detail page's preview theme switch.
import { expect } from "@playwright/test"
import type { Locator, Page } from "@playwright/test"

export class ToggleButtonHelper {
  constructor(private readonly page: Page) {}

  private button(name: string | RegExp, within?: Locator): Locator {
    const root = within ?? this.page
    return root.getByRole("button", { name, exact: typeof name === "string" })
  }

  /** Press a toggle button and wait until it reports itself pressed. */
  async press(
    name: string | RegExp,
    opts?: { within?: Locator }
  ): Promise<void> {
    const button = this.button(name, opts?.within)
    await button.click()
    await expect(button).toHaveAttribute("aria-pressed", "true")
  }

  /** Assert a toggle button's pressed state. */
  async expectPressed(
    name: string | RegExp,
    pressed = true,
    opts?: { within?: Locator }
  ): Promise<void> {
    await expect(this.button(name, opts?.within)).toHaveAttribute(
      "aria-pressed",
      String(pressed)
    )
  }
}
