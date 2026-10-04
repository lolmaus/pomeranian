import type { ComponentType } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import type { Story } from "./story.ts";

/** Keep components, state and handlers in the browser; specs supply data props. */
export function reactStory<Props extends object>(Component: ComponentType<Props>): Story<Props> {
  return {
    create(host) {
      const failure: { error?: unknown } = {};
      const root = createRoot(host, {
        onUncaughtError(error) {
          failure.error = error;
        },
      });
      return {
        render(props) {
          delete failure.error;
          flushSync(() => root.render(<Component {...props} />));
          if ("error" in failure) throw failure.error;
        },
        unmount() {
          flushSync(() => root.unmount());
        },
      };
    },
  };
}
