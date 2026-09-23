import { acceptanceAsync } from "./acceptance-async.js";

export async function probe(): Promise<void> {
  await acceptanceAsync();
}
