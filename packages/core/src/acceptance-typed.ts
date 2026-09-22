import { loadValue } from "./acceptance-async.js";

export function probe(): Promise<number> {
  return loadValue();
}
