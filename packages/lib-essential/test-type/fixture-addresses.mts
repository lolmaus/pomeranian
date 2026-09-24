import {
  elementFixtureUrls,
  type ElementFixtureId,
} from "@pomeranian/demo-app-react/fixture-addresses/lib-essential/element-po";

const counter: "/fixtures/lib-essential/element-po/counter" = elementFixtureUrls.counter;
const scenario: ElementFixtureId = "counter";
void counter;
void scenario;

// @ts-expect-error Renamed or missing scenarios must not silently form valid URLs.
void elementFixtureUrls.unknown;
// @ts-expect-error Scenario identity is a closed set.
const unknown: ElementFixtureId = "unknown";
void unknown;
