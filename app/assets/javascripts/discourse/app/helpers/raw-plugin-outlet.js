import { htmlSafe } from "@ember/template";
import { rawConnectorsFor } from "discourse/lib/plugin-connectors";
import { registerUnbound } from "discourse-common/lib/helpers";

registerUnbound("raw-plugin-outlet", function (params) {
  const connectors = rawConnectorsFor(params.name);
  const context = params.context || this; // 'this' is used in raw-template environments. 'params.context' is used in Glimmer contexts
  if (connectors.length) {
    const output = connectors.map((c) => c.template({ context }));
    return htmlSafe(output.join(""));
  }
});
