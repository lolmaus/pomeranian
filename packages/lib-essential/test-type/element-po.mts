import { Element_PO, type Element_POOptions } from "@pomeranian/lib-essential/element-po";
import { PageObjectNode } from "@pomeranian/core/page-object-node";
import type { expect, Locator, Page } from "@playwright/test";

export async function checkPublicContract(
  page: Page,
  locator: Locator,
  clickOptions: Parameters<Locator["click"]>[0],
  textArguments: Parameters<ReturnType<typeof expect<Locator>>["toHaveText"]>,
): Promise<void> {
  const options: Element_POOptions = { name: "Counter" };
  const Counter: Element_PO = Element_PO.create(page, '[data-test="counter"]', options);
  Element_PO.create(page, '[data-test="counter"]');
  Element_PO.create(page, '[data-test="counter"]', { name: undefined });

  const underlyingPage: Page = Counter.page;
  const underlyingLocator: Locator = Counter.locator;
  const Node: PageObjectNode = Counter;
  const name: string = Node.name;
  void underlyingPage;
  void underlyingLocator;
  void name;

  const clickResult: Promise<void> = Counter.click(clickOptions);
  await clickResult;
  const textResult: Promise<void> = Counter.shouldHaveText(...textArguments);
  await textResult;
  const negativeTextResult: Promise<void> = Counter.shouldNotHaveText(...textArguments);
  await negativeTextResult;
  await Counter.shouldHaveText("Count: 0");
  await Counter.shouldHaveText(/Count: \d+/);
  await Counter.shouldHaveText(["Count: 0", /Count: \d+/], {
    ignoreCase: true,
    timeout: 250,
    useInnerText: true,
  });
  await Counter.shouldNotHaveText("Count: -1");
  await Counter.shouldNotHaveText(/Not a counter/);
  await Counter.shouldNotHaveText(["Count: -1", /Not a counter/], {
    ignoreCase: false,
    timeout: 250,
    useInnerText: false,
  });

  // @ts-expect-error A target is required.
  Element_PO.create(page);
  // @ts-expect-error Targets must be selector strings.
  Element_PO.create(page, 42);
  // @ts-expect-error Locator targets belong to a later API slice.
  Element_PO.create(page, locator);
  // @ts-expect-error Names must be strings when supplied.
  Element_PO.create(page, "button", { name: 42 });
  // @ts-expect-error Creation does not accept a custom expect instance.
  Element_PO.create(page, "button", { expect: undefined });
  // @ts-expect-error The underlying page is read-only.
  Counter.page = page;
  // @ts-expect-error The underlying locator is read-only.
  Counter.locator = locator;
  // @ts-expect-error The resolved name is read-only.
  Counter.name = "Replacement";
  // @ts-expect-error The shared base has no element locator.
  void Node.locator;
  // @ts-expect-error Shared steps are available to subclass methods, not callers.
  await Node.step("read", () => 42);
  // @ts-expect-error The shared base cannot be directly constructed.
  new PageObjectNode(page, "Counter");
  // @ts-expect-error Concrete classes own creation; there is no shared factory.
  PageObjectNode.create(page, "Counter");
  // @ts-expect-error Click options retain Playwright's button union.
  await Counter.click({ button: "invalid" });
  // @ts-expect-error Native text expectations do not accept numbers.
  await Counter.shouldHaveText(42);
  // @ts-expect-error Negation retains the native expected-value contract.
  await Counter.shouldNotHaveText(42);
  // @ts-expect-error Native timeout options are numeric.
  await Counter.shouldHaveText("Count: 0", { timeout: "250" });
  // @ts-expect-error Negation retains native option types.
  await Counter.shouldNotHaveText("Count: 0", { timeout: "250" });
  // @ts-expect-error Awaited operations return void, not a fluent page object.
  const fluentResult: Element_PO = await Counter.click();
  void fluentResult;
}

class NamedNode extends PageObjectNode {}

export function checkProtectedConstruction(page: Page): void {
  // @ts-expect-error Inherited base construction remains protected.
  new NamedNode(page, "Counter");
}
