import { PageObjectNode } from "@pomeranian/core/page-object-node";
import type { Page } from "@playwright/test";

class NamedNode extends PageObjectNode {}

export function checkNodeContract(Node: PageObjectNode, page: Page): void {
  const name: string = Node.name;
  const originalPage: Page = Node.page;
  void name;
  void originalPage;
  // @ts-expect-error Node names are read-only.
  Node.name = "Replacement";
  // @ts-expect-error Node page access is read-only.
  Node.page = page;
  // @ts-expect-error Targetless nodes have no locator contract.
  void Node.locator;
  // @ts-expect-error Steps are protected for subclass operations.
  void Node.step("read", () => 42);
  // @ts-expect-error The abstract base cannot be directly constructed.
  new PageObjectNode(page, "Counter");
  // @ts-expect-error Inherited node construction remains protected.
  new NamedNode(page, "Counter");
  // @ts-expect-error Targetless nodes have no shared factory.
  PageObjectNode.create(page, "Counter");
}
