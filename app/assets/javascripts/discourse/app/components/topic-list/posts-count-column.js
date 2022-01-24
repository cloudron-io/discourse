import GlimmerComponent from "@glimmer/component";
import I18n from "I18n";
import { cached } from "@glimmer/tracking";
import { getOwner } from "@ember/application";

export default class TopicListPostsCountColumn extends GlimmerComponent {
  @cached
  get siteSettings() {
    // TODO: Some kind of global service/helper for this?
    const applicationInstance = getOwner(this);
    return applicationInstance.lookup("site-settings:main");
  }

  @cached
  get ratio() {
    const likes = parseFloat(this.args.topic.likes_count);
    const posts = parseFloat(this.args.topic.posts_count);

    if (posts < 10) {
      return 0;
    }

    return (likes || 0) / posts;
  }

  @cached
  get title() {
    return I18n.messageFormat("posts_likes_MF", {
      count: this.args.topic.replyCount,
      ratio: this.ratioText,
    }).trim();
  }

  @cached
  get ratioText() {
    const settings = this.siteSettings;
    if (this.ratio > settings.topic_post_like_heat_high) {
      return "high";
    }
    if (this.ratio > settings.topic_post_like_heat_medium) {
      return "med";
    }
    if (this.ratio > settings.topic_post_like_heat_low) {
      return "low";
    }
    return "";
  }

  @cached
  get likesHeat() {
    if (this.ratioText) {
      return `heatmap-${this.ratioText}`;
    }
  }
}
