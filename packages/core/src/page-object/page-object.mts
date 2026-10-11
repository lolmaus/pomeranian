import type { Locator, Page } from "@playwright/test";
import { PageObjectNode } from "@pomeranian/core/page-object-node";

export type PageObjectOptions = {
  name?: string;
};

export class PageObject extends PageObjectNode {
  readonly #locator: Locator;

  protected constructor(page: Page, target: string, options: PageObjectOptions = {}) {
    if (typeof target !== "string" || target.trim().length === 0) {
      throw new TypeError("PageObject target must be a nonblank string.");
    }

    super(page, options.name === undefined ? target : options.name);
    this.#locator = page.locator(target);
  }

  static create<Instance extends PageObject>(
    this: { prototype: Instance } & typeof PageObject,
    page: Page,
    target: string,
    options?: PageObjectOptions,
  ): Instance;
  static create(page: Page, target: string, options?: PageObjectOptions): PageObject {
    return new this(page, target, options);
  }

  get locator(): Locator {
    return this.#locator;
  }
}
