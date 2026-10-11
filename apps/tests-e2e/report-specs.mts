import type { JSONReportSpec, JSONReportSuite } from "@playwright/test/reporter";

export function collectSpecs(suites: JSONReportSuite[]): JSONReportSpec[] {
  return suites.flatMap((suite) => [...suite.specs, ...collectSpecs(suite.suites ?? [])]);
}
