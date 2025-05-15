import Popover from "./utils/popover";
import * as $ from "./utils/dom";
import { IconMenuSmall } from "@codexteam/icons";

/**
 * @typedef {object} PopoverItem
 * @property {string} label - button text
 * @property {string} icon - button icon
 * @property {boolean} confirmationRequired - if true, a confirmation state will be applied on the first click
 * @property {function} hideIf - if provided, item will be hid, if this method returns true
 * @property {function} onClick - click callback
 */

/**
 * Toolbox is a menu for manipulation of rows/cols
 *
 * It contains toggler and Popover:
 *   <toolbox>
 *     <toolbox-toggler />
 *     <popover />
 *   <toolbox>
 */
export default class Toolbox {
  /**
   * Creates toolbox buttons and toolbox menus
   *
   * @param {Object} config
   * @param {any} config.api - Editor.js api
   * @param {PopoverItem[]} config.items - Editor.js api
   * @param {function} config.onOpen - callback fired when the Popover is opening
   * @param {function} config.onClose - callback fired when the Popover is closing
   * @param {string} config.cssModifier - the modifier for the Toolbox. Allows to add some specific styles.
   */
  constructor({ api, items, onOpen, onClose, cssModifier = "" }) {
    this.api = api;

    this.items = items;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.cssModifier = cssModifier;

    this.popover = null;
    this.wrapper = this.createToolbox();

    this.numberOfColumns = 0;
    this.numberOfRows = 0;
    this.currentColumn = 0;
    this.currentRow = 0;
  }

  /**
   * Style classes
   */
  static get CSS() {
    return {
      toolbox: "tc-toolbox",
      toolboxShowed: "tc-toolbox--showed",
      toggler: "tc-toolbox__toggler",
    };
  }

  /**
   * Returns rendered Toolbox element
   */
  get element() {
    return this.wrapper;
  }

  /**
   * Creating a toolbox to open menu for a manipulating columns
   *
   * @returns {Element}
   */
  createToolbox() {
    const wrapper = $.make("div", [
      Toolbox.CSS.toolbox,
      this.cssModifier ? `${Toolbox.CSS.toolbox}--${this.cssModifier}` : "",
    ]);

    wrapper.dataset.mutationFree = "true";
    const popover = this.createPopover();
    const toggler = this.createToggler();

    wrapper.appendChild(toggler);
    wrapper.appendChild(popover);

    return wrapper;
  }

  /**
   * Creates the Toggler
   *
   * @returns {Element}
   */
  createToggler() {
    const toggler = $.make("div", Toolbox.CSS.toggler, {
      innerHTML: IconMenuSmall,
    });

    toggler.addEventListener("click", () => {
      this.togglerClicked();
    });

    return toggler;
  }

  /**
   * Creates the Popover instance and render it
   *
   * @returns {Element}
   */
  createPopover() {
    this.popover = new Popover({
      items: this.items,
    });

    return this.popover.render();
  }

  /**
   * Toggler click handler. Opens/Closes the popover
   *
   * @returns {void}
   */
  togglerClicked() {
    // default: 
    // left: var(--popover-margin)
    // top: 0
    let styles = {};

    if (this.currentColumn > Math.ceil(this.numberOfColumns / 2)) {
      styles.right = "var(--popover-margin)";
      styles.left = "auto";
    } else {
      styles.left = "var(--popover-margin)";
      styles.right = "auto";
    }

    if (this.currentRow > Math.ceil(this.numberOfRows / 2)) {
      styles.bottom = 0;
      styles.top = 'auto';
    } else {
      styles.top = 0;
      styles.bottom = 'auto';
    }

    /**
     * Set 'top','bottom' style
     * Set 'left','right' style
     */
    Object.entries(styles).forEach(([prop, value]) => {
      this.popover.wrapper.style[prop] = value;
    });

    if (this.popover.opened) {
      this.popover.close();
      this.onClose();
    } else {
      this.popover.open();
      this.onOpen();
    }
  }

  /**
   * Shows the Toolbox
   *
   * @param {function} computePositionMethod - method that returns the position coordinate
   * @returns {void}
   */
  show(computePositionMethod) {
    const position = computePositionMethod();
    /**
     * Set 'top' or 'left' style
     */
    Object.entries(position.style).forEach(([prop, value]) => {
      this.wrapper.style[prop] = value;
    });

    console.log(position, this.cssModifier)
    if (this.cssModifier == 'row') {
      // row
      this.numberOfRows = position.numberOfRows;
      this.currentRow = position.currentRow;
    } else if (this.cssModifier == 'column') {
      // column 
      this.numberOfColumns = position.numberOfColumns;
      this.currentColumn = position.currentColumn;
    }

    this.wrapper.classList.add(Toolbox.CSS.toolboxShowed);
  }

  /**
   * Hides the Toolbox
   *
   * @returns {void}
   */
  hide() {
    this.popover.close();
    this.wrapper.classList.remove(Toolbox.CSS.toolboxShowed);
  }
}
