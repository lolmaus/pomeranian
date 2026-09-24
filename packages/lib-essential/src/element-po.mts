import { expect, test, type Locator, type Page } from "@playwright/test";

export type Element_POOptions = {
  name?: string;
};

export class Element_PO {
  readonly #page: Page;
  readonly #locator: Locator;
  readonly #name: string;

  private constructor(page: Page, target: string, name: string) {
    this.#page = page;
    this.#locator = page.locator(target);
    this.#name = name;
  }

  static create(page: Page, target: string, options: Element_POOptions = {}): Element_PO {
    if (typeof target !== "string" || target.trim().length === 0) {
      throw new TypeError("Element_PO target must be a nonblank string.");
    }
    if (
      options.name !== undefined &&
      (typeof options.name !== "string" || options.name.trim().length === 0)
    ) {
      throw new TypeError("Element_PO name must be a nonblank string when provided.");
    }

    return new Element_PO(page, target, options.name ?? target);
  }

  get page(): Page {
    return this.#page;
  }

  get locator(): Locator {
    return this.#locator;
  }

  click(...args: Parameters<Locator["click"]>): Promise<void> {
    return test.step(`${this.#name}.click`, () => this.#locator.click(...args));
  }

  shouldHaveText(
    ...args: Parameters<ReturnType<typeof expect<Locator>>["toHaveText"]>
  ): Promise<void> {
    return expect(this.#locator, `${this.#name} should have text`).toHaveText(...args);
  }

  shouldNotHaveText(
    ...args: Parameters<ReturnType<typeof expect<Locator>>["toHaveText"]>
  ): Promise<void> {
    return expect(this.#locator, `${this.#name} should not have text`).not.toHaveText(...args);
  }
}
