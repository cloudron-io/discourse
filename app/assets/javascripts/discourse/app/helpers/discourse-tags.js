import { htmlSafe } from "@ember/template";
import { registerUnbound } from "discourse-common/lib/helpers";
import renderTags from "discourse/lib/render-tags";

export default registerUnbound("discourse-tags", function (topic, params) {
  const rendered = renderTags(topic, params);
  if (rendered) {
    return htmlSafe(rendered);
  }
});
