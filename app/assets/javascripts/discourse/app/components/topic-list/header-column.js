import GlimmerComponent from "@glimmer/component";
import I18n from "I18n";
import { cached } from "@glimmer/tracking";

export default class extends GlimmerComponent {
  @cached
  get tabindex() {
    return this.args.sortable ? "0" : null;
  }

  @cached
  get role() {
    return this.args.sortable ? "button" : null;
  }

  @cached
  get ariaPressed() {
    if (!this.args.sortable) {
      return null;
    }
    return this.isSorting;
  }

  @cached
  get localizedName() {
    if (this.args.forceName) {
      return this.args.forceName;
    }

    return this.args.name ? I18n.t(this.args.name) : "";
  }

  @cached
  get sortIcon() {
    const asc = this.args.currentAscending ? "up" : "down";
    return `chevron-${asc}`;
  }

  @cached
  get isSorting() {
    return this.args.sortable && this.args.currentOrder === this.args.order;
  }

  @cached
  get className() {
    const name = [];

    if (this.args.order) {
      name.push(this.args.order);
    }

    if (this.args.sortable) {
      name.push("sortable");

      if (this.isSorting) {
        name.push("sorting");
      }
    }

    if (this.args.number) {
      name.push("num");
    }

    return name.join(" ");
  }

  @cached
  get ariaSort() {
    if (!this.args.sortable) {
      return null;
    }
    if (this.isSorting) {
      return this.args.currentAscending ? "ascending" : "descending";
    } else {
      return false;
    }
  }
}
