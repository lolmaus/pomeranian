export const pageObjectFixtureUrls = {
  counter: "/fixtures/core/page-object/counter",
} as const;

export type PageObjectFixtureId = keyof typeof pageObjectFixtureUrls;
