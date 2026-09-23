// THROWAWAY: this explores a proposed interface; it is not production source.
import { expect, test, type Locator, type Page } from "@playwright/test";

export type CreationOptions = { name?: string };
export type TextArguments = Parameters<ReturnType<typeof expect<Locator>>["toHaveText"]>;

export class Element_PO {
  readonly #page: Page;
  readonly #locator: Locator;
  protected readonly name: string;

  protected constructor(page: Page, target: string, options: CreationOptions = {}) {
    this.#page = page;
    this.#locator = page.locator(target);
    this.name = options.name ?? target;
  }

  get page(): Page {
    return this.#page;
  }

  get locator(): Locator {
    return this.#locator;
  }

  static create<T extends Element_PO>(
    this: { prototype: T } & typeof Element_PO,
    page: Page,
    target: string,
    options?: CreationOptions,
  ): T;
  static create(page: Page, target: string, options?: CreationOptions): Element_PO {
    return new this(page, target, options);
  }

  async click(...args: Parameters<Locator["click"]>): Promise<void> {
    await test.step(`${this.name}: click`, () => this.locator.click(...args));
  }

  async shouldHaveText(...args: TextArguments): Promise<void> {
    await test.step(`${this.name}: shouldHaveText`, () =>
      expect(this.locator, `${this.name}: shouldHaveText`).toHaveText(...args));
  }

  async shouldNotHaveText(...args: TextArguments): Promise<void> {
    await test.step(`${this.name}: shouldNotHaveText`, () =>
      expect(this.locator, `${this.name}: shouldNotHaveText`).not.toHaveText(...args));
  }
}
