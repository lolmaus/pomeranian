export const elementFixtureUrls = {
  counter: "/fixtures/lib-essential/element-po/counter",
  "delayed-counter": "/fixtures/lib-essential/element-po/delayed-counter",
  "replaceable-counter": "/fixtures/lib-essential/element-po/replaceable-counter",
  "text-collection": "/fixtures/lib-essential/element-po/text-collection",
} as const;

export type ElementFixtureId = keyof typeof elementFixtureUrls;
