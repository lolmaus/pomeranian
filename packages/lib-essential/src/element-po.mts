import { expect, type Locator } from "@playwright/test";
import { PageObject, type PageObjectOptions } from "@pomeranian/core/page-object";

export type Element_POOptions = PageObjectOptions;

export class Element_PO extends PageObject {
  click(...args: Parameters<Locator["click"]>): Promise<void> {
    return this.step("click", () => this.locator.click(...args));
  }

  shouldHaveText(
    ...args: Parameters<ReturnType<typeof expect<Locator>>["toHaveText"]>
  ): Promise<void> {
    return expect(this.locator, `${this.name} should have text`).toHaveText(...args);
  }

  shouldNotHaveText(
    ...args: Parameters<ReturnType<typeof expect<Locator>>["toHaveText"]>
  ): Promise<void> {
    return expect(this.locator, `${this.name} should not have text`).not.toHaveText(...args);
  }
}
