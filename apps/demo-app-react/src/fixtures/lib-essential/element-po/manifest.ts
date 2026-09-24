import { lazy } from "react";
import { elementFixtureUrls } from "./addresses.mts";
import type { FixtureObject, ScenarioDefinitions } from "../../manifest-types";

const definitions = {
  counter: {
    label: "Counter",
    url: elementFixtureUrls.counter,
    component: lazy(() => import("./counter").then((module) => ({ default: module.Counter }))),
  },
  "delayed-counter": {
    label: "Delayed counter",
    url: elementFixtureUrls["delayed-counter"],
    component: lazy(() =>
      import("./delayed-counter").then((module) => ({ default: module.DelayedCounter })),
    ),
  },
  "replaceable-counter": {
    label: "Replaceable counter",
    url: elementFixtureUrls["replaceable-counter"],
    component: lazy(() =>
      import("./replaceable-counter").then((module) => ({ default: module.ReplaceableCounter })),
    ),
  },
  "text-collection": {
    label: "Text collection",
    url: elementFixtureUrls["text-collection"],
    component: lazy(() =>
      import("./text-collection").then((module) => ({ default: module.TextCollection })),
    ),
  },
} satisfies ScenarioDefinitions<typeof elementFixtureUrls>;

export const elementFixtures: FixtureObject = {
  id: "element-po",
  label: "Element_PO",
  scenarios: Object.entries(definitions).map(([id, definition]) => ({ id, ...definition })),
};
