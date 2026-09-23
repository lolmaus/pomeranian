// Print wrapper step labels, including expected failures, for report evidence.
import type { Reporter, TestCase, TestResult, TestStep } from "@playwright/test/reporter";

export default class ProbeReporter implements Reporter {
  onStepEnd(_test: TestCase, _result: TestResult, step: TestStep): void {
    if (step.category === "test.step") {
      console.log(`REPORT ${step.error ? "FAIL" : "PASS"} ${step.title}`);
    }
  }
}
