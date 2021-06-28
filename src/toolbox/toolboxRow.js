import { create, getRelativeCoordsOfTwoElems, createElem } from '../documentUtils';
import toolboxIcon from '../img/toolboxIcon.svg';
import newToUp from '../img/new-to-up.svg';
import newToDown from '../img/new-to-down.svg';
import closeIcon from '../img/cross.svg';

const CSS = {
  hidden: 'tc-hidden',
  displayNone: 'tc-display-none',
  toolboxRow: 'tc-toolbox-row',
  toolboxRowMenu: 'tc-toolbox-row__menu',
  toolboxAddRowAbove: 'tc-toolbox-add-row-above',
  toolboxAddRowBelow: 'tc-toolbox-add-row-below',
  toolboxDelete: 'tc-toolbox-delete',
  toolboxDeleteRow: 'tc-toolbox-delete--row',
  toolboxOption: 'tc-toolbox-row__option',
  menuAnimation: 'tc-menu-animation',
  deleteConfirm: 'tc-toolbox-delete--confirm'
};

/**
 * Toolbox for row manipulating
 */
export class ToolboxRow {
  /**
   * Creates toolbox buttons and toolbox menus
   */
  constructor() {
    this.element = this.createToolboxRow();

    // row index to the left of which the toolbox icon should be displayed, 0 means hide
    this.row = 0;
  }

  /**
   * Creating a toolbox to open menu for a manipulating rows
   *
   * @returns {HTMLElement} - row toolbox wrapper
   */
  createToolboxRow() {
    let toolboxRowMenu = this.createMenu();
    let toolboxRowElem = create('div', [ CSS.toolboxRow ]);

    toolboxRowElem.innerHTML = toolboxIcon;
    this.menu = toolboxRowElem.appendChild(toolboxRowMenu);

    return toolboxRowElem;
  }

  /**
   * Creating a tooolbox row menu
   *
   * @returns {HTMLElement} - row menu
   */
  createMenu() {
    let addRowAboveText = createElem({
      tagName: 'span',
      textContent: 'Add row above'
    });
    let addRowBelowText = createElem({
      tagName: 'span',
      textContent: 'Add row below'
    });
    let deleteRowText = createElem({
      tagName: 'span',
      textContent: 'Delete row'
    });

    let addRowAbove = createElem({
      tagName: 'div',
      innerHTML: newToUp,
      cssClasses: [CSS.toolboxAddRowAbove, CSS.toolboxOption],
      children: [ addRowAboveText ]
    });
    let addRowBelow = createElem({
      tagName: 'div',
      innerHTML: newToDown,
      cssClasses: [CSS.toolboxAddRowBelow, CSS.toolboxOption],
      children: [ addRowBelowText ]
    });
    let deleteRow = createElem({
      tagName: 'div',
      innerHTML: closeIcon,
      cssClasses: [CSS.toolboxDelete, CSS.toolboxOption, CSS.toolboxDeleteRow],
      children: [ deleteRowText ]
    });

    return createElem({
      tagName: 'div',
      cssClasses: [CSS.toolboxRowMenu, CSS.hidden],
      children: [addRowAbove, addRowBelow, deleteRow]
    });
  }

  /**
   * Hide delete row button for event when we only have one row left
   */
  hideDeleteButton() {
    this.menu.querySelector(`.${CSS.toolboxDeleteRow}`).classList.add(CSS.displayNone);
  }

  /**
   * Unhide delete row button when we have more than one row left again
   */
  unhideDeleteButton() {
    this.menu.querySelector(`.${CSS.toolboxDeleteRow}`).classList.remove(CSS.displayNone);
  }

  /**
   * Show toolbox row menu when the toolbox was clicked
   */
  openMenu() {
    this.menu.classList.add(CSS.menuAnimation);
    this.menu.classList.remove(CSS.hidden);
  }

  /**
   * Hide toolbox row menu
   */
  closeMenu() {
    this.menu.classList.remove(CSS.menuAnimation);
    this.menu.classList.add(CSS.hidden);
    this.unsetDeleteConfirmation();
  }

  /**
   * Set the class to confirm deletion for the row menu
   */
  setDeleteConfirmation() {
    this.menu.querySelector(`.${CSS.toolboxDelete}`).classList.add(CSS.deleteConfirm);
  }

  /**
   * Remove the class to confirm deletion for the row menu
   */
  unsetDeleteConfirmation() {
    this.menu.querySelector(`.${CSS.toolboxDelete}`).classList.remove(CSS.deleteConfirm);
  }

  /**
   * Change row toolbox position
   *
   * @param {number} numberOfRows - number of rows
   * @param {number} row - hovered row
   * @param {HTMLElement} table - table element
   */
  updateToolboxIconPosition(numberOfRows = 0, row = this.row, table) {
    this.row = row;

    if (this.row <= 0 || this.row > numberOfRows) {
      this.element.style.opacity = '0';
    } else {
      const hoveredRowElement = table.querySelector(`.tc-row:nth-child(${this.row})`);
      const { fromTopBorder } = getRelativeCoordsOfTwoElems(table, hoveredRowElement);
      const { height } = hoveredRowElement.getBoundingClientRect();

      this.element.style.opacity = '1';
      this.element.style.top = `${fromTopBorder + height / 2}px`;
    }

    if (numberOfRows == 1) {
      this.hideDeleteButton();
    } else {
      this.unhideDeleteButton();
    }
  }
}