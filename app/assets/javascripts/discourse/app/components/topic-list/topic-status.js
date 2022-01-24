import GlimmerComponent from "@glimmer/component";
import { cached } from "@glimmer/tracking";
import I18n from "I18n";

export default class TopicListStatus extends GlimmerComponent {
  get shouldRender() {
    return this.statuses.length > 0;
  }

  @cached
  get statuses() {
    const topic = this.args.topic;
    const results = [];

    // TODO, custom statuses? via override?
    if (topic.is_warning) {
      results.push({ icon: "envelope", key: "warning" });
    }

    if (topic.bookmarked) {
      const postNumbers = topic.bookmarked_post_numbers;
      let url = topic.url;
      let extraClasses = "";
      if (postNumbers && postNumbers[0] > 1) {
        url += "/" + postNumbers[0];
      } else {
        extraClasses = "op-bookmark";
      }

      results.push({
        extraClasses,
        icon: "bookmark",
        key: "bookmarked",
        href: url,
      });
    }

    if (topic.closed && topic.archived) {
      results.push({ icon: "lock", key: "locked_and_archived" });
    } else if (topic.closed) {
      results.push({ icon: "lock", key: "locked" });
    } else if (topic.archived) {
      results.push({ icon: "lock", key: "archived" });
    }

    if (topic.pinned) {
      results.push({ icon: "thumbtack", key: "pinned" });
    }

    if (topic.unpinned) {
      results.push({ icon: "thumbtack", key: "unpinned" });
    }

    if (topic.invisible) {
      results.push({ icon: "far-eye-slash", key: "unlisted" });
    }

    if (
      this.showPrivateMessageIcon &&
      topic.isPrivateMessage &&
      !topic.is_warning
    ) {
      results.push({ icon: "envelope", key: "personal_message" });
    }

    results.forEach((result) => {
      result.title = I18n.t(`topic_statuses.${result.key}.help`);
      if (result.href || ["pinned", "unpinned"].includes(result.key)) {
        result.aTag = true;
      }
    });

    return results;
  }
}
