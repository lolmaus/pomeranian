// Compile-only design probes, deliberately never imported at runtime.
import type { Locator, Page } from "@playwright/test";
import { Element_PO, type CreationOptions } from "./element-po.prototype.ts";

declare const page: Page;
const Counter = Element_PO.create(page, '[data-test="counter"]', { name: "Counter" });
const clickResult: Promise<void> = Counter.click({ button: "left", trial: true, timeout: 50 });
const textResult: Promise<void> = Counter.shouldHaveText(["Count: 0", /Count: 1/], {
  ignoreCase: true,
  timeout: 50,
  useInnerText: true,
});
const negatedResult: Promise<void> = Counter.shouldNotHaveText(/Count: 2/);
const directPage: Page = Counter.page;
const directLocator: Locator = Counter.locator;
void [clickResult, textResult, negatedResult, directPage, directLocator];

// @ts-expect-error The selected surface requires factory creation.
new Element_PO(page, "button");
// @ts-expect-error Readonly access disallows reassignment.
Counter.page = page;
// @ts-expect-error Readonly access disallows reassignment.
Counter.locator = page.locator("button");
// @ts-expect-error Numeric expected text is not a native assertion input.
Counter.shouldHaveText(1);
// @ts-expect-error Flexible locator targets belong to a later roadmap item.
Element_PO.create(page, page.locator("button"));
// @ts-expect-error Expect injection is outside this slice.
Element_PO.create(page, "button", { expect: () => {} });

export class SpecializedCounter extends Element_PO {
  readonly marker = "specialized";
  async increment(): Promise<void> {
    await this.click();
  }
}
const Specialized: SpecializedCounter = SpecializedCounter.create(page, "button");
const marker: "specialized" = Specialized.marker;
void marker;

export class CompatibleConstructor extends Element_PO {
  protected constructor(page: Page, target: string, options?: CreationOptions) {
    super(page, target, options);
  }
}
CompatibleConstructor.create(page, "button");

export class AdditionalRequiredArgument extends Element_PO {
  protected constructor(page: Page, target: string, options: CreationOptions, extra: string) {
    super(page, target, options);
    void extra;
  }
}
// @ts-expect-error An additional required constructor argument is incompatible.
AdditionalRequiredArgument.create(page, "button");

// LIMITATION: TypeScript accepts this narrower constructor, even though inherited
// factory creation can omit options. This is documented evidence, not a guarantee
// of arbitrary developer-defined constructor compatibility.
export class RequiredOptions extends Element_PO {
  protected constructor(page: Page, target: string, options: CreationOptions) {
    super(page, target, options);
  }
}
RequiredOptions.create(page, "button");
