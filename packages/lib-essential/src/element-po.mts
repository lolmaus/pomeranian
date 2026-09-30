import { expect, type Locator, type Page } from "@playwright/test";
import { PageObjectNode } from "@pomeranian/core/page-object-node";

export type Element_POOptions = {
  name?: string;
};

export class Element_PO extends PageObjectNode {
  readonly #locator: Locator;

  private constructor(page: Page, target: string, name: string) {
    super(page, name);
    this.#locator = page.locator(target);
  }

  static create(page: Page, target: string, options: Element_POOptions = {}): Element_PO {
    if (typeof target !== "string" || target.trim().length === 0) {
      throw new TypeError("Element_PO target must be a nonblank string.");
    }
    return new Element_PO(page, target, options.name === undefined ? target : options.name);
  }

  get locator(): Locator {
    return this.#locator;
  }

  click(...args: Parameters<Locator["click"]>): Promise<void> {
    return this.step("click", () => this.#locator.click(...args));
  }

  shouldHaveText(
    ...args: Parameters<ReturnType<typeof expect<Locator>>["toHaveText"]>
  ): Promise<void> {
    return expect(this.#locator, `${this.name} should have text`).toHaveText(...args);
  }

  shouldNotHaveText(
    ...args: Parameters<ReturnType<typeof expect<Locator>>["toHaveText"]>
  ): Promise<void> {
    return expect(this.#locator, `${this.name} should not have text`).not.toHaveText(...args);
  }
}
