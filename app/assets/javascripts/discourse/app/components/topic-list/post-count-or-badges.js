import GlimmerComponent from "@glimmer/component";
import { getOwner } from "@ember/application";
import I18n from "I18n";
import { cached } from "@glimmer/tracking";

export default class PostCountOrBadges extends GlimmerComponent {
  @cached
  get currentUser() {
    // TODO: Some kind of global injection/helper for this?
    const applicationInstance = getOwner(this);
    return applicationInstance.lookup("current-user:main");
  }

  @cached
  get showBadges() {
    return this.args.postBadgesEnabled && this.args.topic.unread_posts;
  }

  @cached
  get newDotText() {
    return this.currentUser && this.currentUser.trust_level > 0
      ? ""
      : I18n.t("filters.new.lower_title");
  }
}
