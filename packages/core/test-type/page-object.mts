import { PageObject, type PageObjectOptions } from "@pomeranian/core/page-object";
import type { Locator, Page } from "@playwright/test";
class SpecializedObject extends PageObject {
  ownOperation(): Promise<number> {
    return this.step("count", () => this.locator.count());
  }
}

export function checkFactoryContract(page: Page): void {
  const options: PageObjectOptions = { name: "Counter" };
  const Subject: PageObject = PageObject.create(page, "button", options);
  const Specialized: SpecializedObject = SpecializedObject.create(page, "button");
  const locator: Locator = Subject.locator;
  const result: Promise<number> = Specialized.ownOperation();
  void locator;
  void result;
  // @ts-expect-error Factories require a selector.
  PageObject.create(page);
  // @ts-expect-error Names must be strings when supplied.
  PageObject.create(page, "button", { name: 42 });
  // @ts-expect-error Locators remain read-only.
  Subject.locator = locator;
  // @ts-expect-error Construction is protected; use the factory.
  new PageObject(page, "button");
  // @ts-expect-error Inherited subclass construction is protected too.
  new SpecializedObject(page, "button");
  // @ts-expect-error The base result has no subclass-only operation.
  void Subject.ownOperation();
}
