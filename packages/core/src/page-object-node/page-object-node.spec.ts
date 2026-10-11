import { PageObjectNode } from "@pomeranian/core/page-object-node";
import { expect, test, type Page } from "@playwright/test";

class ProbeNode extends PageObjectNode {
  constructor(page: Page) {
    super(page, " Probe ");
  }

  read(): Promise<number> {
    return this.step("read", () => 42);
  }
}

test("node actions preserve callback results", async ({ page }) => {
  const Node = new ProbeNode(page);

  expect(await Node.read()).toBe(42);
});
