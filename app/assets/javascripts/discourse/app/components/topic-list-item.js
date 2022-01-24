import discourseComputed from "discourse-common/utils/decorators";
import Component from "@ember/component";
import DiscourseURL from "discourse/lib/url";
import I18n from "I18n";
import { alias } from "@ember/object/computed";
import { on } from "@ember/object/evented";
import { schedule } from "@ember/runloop";
import { topicTitleDecorators } from "discourse/components/topic-title";
import { wantsNewWindow } from "discourse/lib/intercept-click";

export function showEntrance(e) {
  let target = $(e.target);

  if (target.hasClass("posts-map") || target.parents(".posts-map").length > 0) {
    if (target.prop("tagName") !== "A") {
      target = target.find("a");
      if (target.length === 0) {
        target = target.end();
      }
    }

    this.appEvents.trigger("topic-entrance:show", {
      topic: this.topic,
      position: target.offset(),
    });
    return false;
  }
}

export function navigateToTopic(topic, href) {
  this.appEvents.trigger("header:update-topic", topic);
  DiscourseURL.routeTo(href || topic.url);
  return false;
}

export default Component.extend({
  tagName: "tr",
  classNameBindings: [":topic-list-item", "unboundClassNames", "topic.visited"],
  attributeBindings: ["data-topic-id", "role", "ariaLevel:aria-level"],
  "data-topic-id": alias("topic.id"),

  didInsertElement() {
    this._super(...arguments);

    if (this.includeUnreadIndicator) {
      this.messageBus.subscribe(this.unreadIndicatorChannel, (data) => {
        const nodeClassList = document.querySelector(
          `.indicator-topic-${data.topic_id}`
        ).classList;

        if (data.show_indicator) {
          nodeClassList.remove("read");
        } else {
          nodeClassList.add("read");
        }
      });
    }

    schedule("afterRender", () => {
      if (this.element && !this.isDestroying && !this.isDestroyed) {
        const rawTopicLink = this.element.querySelector(".raw-topic-link");

        rawTopicLink &&
          topicTitleDecorators &&
          topicTitleDecorators.forEach((cb) =>
            cb(this.topic, rawTopicLink, "topic-list-item-title")
          );
      }
    });
  },

  willDestroyElement() {
    this._super(...arguments);

    if (this.includeUnreadIndicator) {
      this.messageBus.unsubscribe(this.unreadIndicatorChannel);
    }
  },

  @discourseComputed("topic.id")
  unreadIndicatorChannel(topicId) {
    return `/private-messages/unread-indicator/${topicId}`;
  },

  @discourseComputed("topic.unread_by_group_member")
  unreadClass(unreadByGroupMember) {
    return unreadByGroupMember ? "" : "read";
  },

  @discourseComputed("topic.unread_by_group_member")
  includeUnreadIndicator(unreadByGroupMember) {
    return typeof unreadByGroupMember !== "undefined";
  },

  @discourseComputed
  newDotText() {
    return this.currentUser && this.currentUser.trust_level > 0
      ? ""
      : I18n.t("filters.new.lower_title");
  },

  @discourseComputed("topic", "lastVisitedTopic")
  unboundClassNames(topic, lastVisitedTopic) {
    let classes = [];

    if (topic.category) {
      classes.push("category-" + topic.category.fullSlug);
    }

    if (topic.tags) {
      topic.tags.forEach((tagName) => classes.push("tag-" + tagName));
    }

    if (topic.hasExcerpt) {
      classes.push("has-excerpt");
    }

    if (topic.unseen) {
      classes.push("unseen-topic");
    }

    if (topic.unread_posts) {
      classes.push("unread-posts");
    }

    ["liked", "archived", "bookmarked", "pinned", "closed"].forEach((name) => {
      if (topic[name]) {
        classes.push(name);
      }
    });

    if (topic === lastVisitedTopic) {
      classes.push("last-visit");
    }

    return classes.join(" ");
  },

  hasLikes() {
    return this.topic.like_count > 0;
  },

  hasOpLikes() {
    return this.topic.op_like_count > 0;
  },

  @discourseComputed
  expandPinned() {
    const pinned = this.topic.pinned;
    if (!pinned) {
      return false;
    }

    if (this.site.mobileView) {
      if (!this.siteSettings.show_pinned_excerpt_mobile) {
        return false;
      }
    } else {
      if (!this.siteSettings.show_pinned_excerpt_desktop) {
        return false;
      }
    }

    if (this.expandGloballyPinned && this.topic.pinned_globally) {
      return true;
    }

    if (this.expandAllPinned) {
      return true;
    }

    return false;
  },

  showEntrance,

  click(e) {
    const result = this.showEntrance(e);
    if (result === false) {
      return result;
    }

    const topic = this.topic;
    const target = $(e.target);
    if (target.hasClass("bulk-select")) {
      const selected = this.selected;

      if (target.is(":checked")) {
        selected.addObject(topic);
      } else {
        selected.removeObject(topic);
      }
    }

    if (target.hasClass("raw-topic-link")) {
      if (wantsNewWindow(e)) {
        return true;
      }
      return this.navigateToTopic(topic, target.attr("href"));
    }

    if (target.closest("a.topic-status").length === 1) {
      this.topic.togglePinnedForUser();
      return false;
    }

    return this.unhandledRowClick(e, topic);
  },

  unhandledRowClick() {},

  navigateToTopic,

  highlight(opts = { isLastViewedTopic: false }) {
    schedule("afterRender", () => {
      if (!this.element || this.isDestroying || this.isDestroyed) {
        return;
      }

      const $topic = $(this.element);
      $topic
        .addClass("highlighted")
        .attr("data-islastviewedtopic", opts.isLastViewedTopic);

      $topic.on("animationend", () => $topic.removeClass("highlighted"));
    });
  },

  _highlightIfNeeded: on("didInsertElement", function () {
    // highlight the last topic viewed
    if (this.session.get("lastTopicIdViewed") === this.topic.id) {
      this.session.set("lastTopicIdViewed", null);
      this.highlight({ isLastViewedTopic: true });
    } else if (this.topic.highlight) {
      // highlight new topics that have been loaded from the server or the one we just created
      this.set("topic.highlight", false);
      this.highlight();
    }
  }),
});
