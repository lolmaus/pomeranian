import assert from "node:assert/strict";
import { test } from "node:test";
import { PageObjectNode } from "@pomeranian/core/page-object-node";
import type { Page } from "@playwright/test";

class TestNode extends PageObjectNode {
  constructor(page: Page, name: string) {
    super(page, name);
  }
}

await test("a node preserves its page and name without allowing reassignment", () => {
  const page = {};
  const Node: PageObjectNode = Reflect.construct(TestNode, [page, " Counter "]);

  assert.equal(Node.page, page);
  assert.equal(Node.name, " Counter ");
  assert.equal(Reflect.set(Node, "page", {}), false);
  assert.equal(Reflect.set(Node, "name", "Replacement"), false);
  assert.equal(Node.page, page);
  assert.equal(Node.name, " Counter ");
});

await test("a node requires a nonblank name even without an element target", () => {
  for (const name of [undefined, null, false, 42, {}, [], "", " \t\n"]) {
    assert.throws(() => Reflect.construct(TestNode, [{}, name]), {
      name: "TypeError",
      message: /name.*nonblank string/i,
    });
  }
});
