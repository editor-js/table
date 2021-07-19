import * as $ from './dom';

/**
 * @typedef {object} PopoverItem
 * @property {string} label - button text
 * @property {string} icon - button icon
 * @property {boolean} confirmationRequired - if true, a confirmation state will be applied on the first click
 * @property {function} hideIf - if provided, item will be hid, if this method returns true
 * @property {function} onClick - click callback
 */

/**
 * This cass provides a popover rendering
 */
export default class Popover {
  /**
   * @param {object} options - constructor options
   * @param {PopoverItem[]} options.items - constructor options
   */
  constructor({items}) {
    this.items = items;
    this.wrapper = undefined;
    this.itemEls = [];
  }

  static get CSS() {
    return {
      popover: 'tc-popover',
      popoverOpened: 'tc-popover--opened',
      item: 'tc-popover__item',
      itemHidden: 'tc-popover__item--hidden',
      itemConfirmState: 'tc-popover__item--confirm',
      itemIcon: 'tc-popover__item-icon',
      itemLabel: 'tc-popover__item-label'
    };
  }

  render() {
    this.wrapper = $.make('div', Popover.CSS.popover);

    this.items.forEach((item, index) => {
      const itemEl = $.make('div', Popover.CSS.item);
      const icon = $.make('div', Popover.CSS.itemIcon, {
        innerHTML: item.icon
      });
      const label = $.make('div', Popover.CSS.itemLabel, {
        textContent: item.label
      });

      itemEl.dataset.index = index;

      itemEl.appendChild(icon);
      itemEl.appendChild(label);

      this.wrapper.appendChild(itemEl);
      this.itemEls.push(itemEl);
    });

    /**
     * Delegate click
     */
    this.wrapper.addEventListener('click', (event) => {
      this.popoverClicked(event);
    });

    return this.wrapper;
  }

  popoverClicked(event) {
    const clickedItem = event.target.closest(`.${Popover.CSS.item}`);

    /**
     * Clicks outside or between item
     */
    if (!clickedItem) {
      return;
    }

    const clickedItemIndex = clickedItem.dataset.index;
    const item = this.items[clickedItemIndex];

    if (item.confirmationRequired && !this.hasConfirmationState(clickedItem)) {
      this.setConfirmationState(clickedItem);

      return;
    }

    item.onClick();
  }

  setConfirmationState(itemEl) {
    itemEl.classList.add(Popover.CSS.itemConfirmState);
  }

  clearConfirmationState(itemEl) {
    itemEl.classList.remove(Popover.CSS.itemConfirmState);
  }

  hasConfirmationState(itemEl) {
    return itemEl.classList.contains(Popover.CSS.itemConfirmState);
  }

  get opened() {
    return this.wrapper.classList.contains(Popover.CSS.popoverOpened);
  }

  open() {
    /**
     * If item provides 'hideIf()' method that returns true, hide item
     */
    this.items.forEach((item, index) => {
      if (typeof item.hideIf === 'function') {
        this.itemEls[index].classList.toggle(Popover.CSS.itemHidden, item.hideIf());
      }
    });

    this.wrapper.classList.add(Popover.CSS.popoverOpened);
  }

  close() {
    this.wrapper.classList.remove(Popover.CSS.popoverOpened);
    this.itemEls.forEach(el => {
      this.clearConfirmationState(el);
    });
  }
}
