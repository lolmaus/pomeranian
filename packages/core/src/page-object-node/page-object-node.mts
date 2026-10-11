import { test, type Page } from "@playwright/test";

export abstract class PageObjectNode {
  readonly #page: Page;
  readonly #name: string;

  protected constructor(page: Page, name: string) {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new TypeError("PageObjectNode name must be a nonblank string.");
    }

    this.#page = page;
    this.#name = name;
  }

  get page(): Page {
    return this.#page;
  }

  get name(): string {
    return this.#name;
  }

  protected step<Result>(action: string, body: () => Result | Promise<Result>): Promise<Result> {
    return test.step(`${this.name}.${action}`, body);
  }
}
