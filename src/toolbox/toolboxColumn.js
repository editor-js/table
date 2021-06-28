import { create, createElem } from '../documentUtils';
import toolboxIcon from '../img/toolboxIcon.svg';
import newToLeftIcon from '../img/new-to-left.svg';
import newToRightIcon from '../img/new-to-right.svg';
import closeIcon from '../img/cross.svg';

const CSS = {
  hidden: 'tc-hidden',
  displayNone: 'tc-display-none',
  toolboxColumn: 'tc-toolbox-column',
  toolboxColumnMenu: 'tc-toolbox-column__menu',
  toolboxAddColumnRight: 'tc-toolbox-add-column-right',
  toolboxAddColumnLeft: 'tc-toolbox-add-column-left',
  toolboxDelete: 'tc-toolbox-delete',
  toolboxDeleteColumn: 'tc-toolbox-delete--column',
  toolboxOption: 'tc-toolbox-row__option',
  menuAnimation: 'tc-menu-animation',
  deleteConfirm: 'tc-toolbox-delete--confirm'
};

/**
 * Toolbox for column manipulating
 */
export class ToolboxColumn {
  /**
   * Creates toolbox buttons and toolbox menus
   */
  constructor() {
    this.element = this.createToolboxColumn();

    // column above which the toolbox icon should be displayed, 0 means hide
    this.column = 0;
  }

  /**
   * Creating a toolbox to open menu for a manipulating columns
   *
   * @returns {HTMLElement} - column toolbox wrapper
   */
  createToolboxColumn() {
    let toolboxColumnMenu = this.createMenu();
    let toolboxColumnElem = create('div', [ CSS.toolboxColumn ]);

    toolboxColumnElem.innerHTML = toolboxIcon;
    this.menu = toolboxColumnElem.appendChild(toolboxColumnMenu);

    return toolboxColumnElem;
  }

  /**
   * Creating a tooolbox column menu
   *
   * @returns {HTMLElement} - column menu
   */
  createMenu() {
    let addColumnLeftText = createElem({
      tagName: 'span',
      textContent: 'Add column to left'
    });
    let addColumnRightText = createElem({
      tagName: 'span',
      textContent: 'Add column to right'
    });
    let deleteColumnText = createElem({
      tagName: 'span',
      textContent: 'Delete column'
    });

    let addColumnRight = createElem({
      tagName: 'div',
      innerHTML: newToRightIcon,
      cssClasses: [CSS.toolboxAddColumnRight, CSS.toolboxOption],
      children: [ addColumnRightText ]
    });
    let addColumnLeft = createElem({
      tagName: 'div',
      innerHTML: newToLeftIcon,
      cssClasses: [CSS.toolboxAddColumnLeft, CSS.toolboxOption],
      children: [ addColumnLeftText ]
    });
    let deleteColumn = createElem({
      tagName: 'div',
      innerHTML: closeIcon,
      cssClasses: [CSS.toolboxDelete, CSS.toolboxOption, CSS.toolboxDeleteColumn],
      children: [ deleteColumnText ]
    });

    return createElem({
      tagName: 'div',
      cssClasses: [CSS.toolboxColumnMenu, CSS.hidden],
      children: [addColumnLeft, addColumnRight, deleteColumn]
    });
  }

  /**
   * Hide delete column button for event when we only have one column left
   */
  hideDeleteButton() {
    this.menu.querySelector(`.${CSS.toolboxDeleteColumn}`).classList.add(CSS.displayNone);
  }

  /**
   * Unhide delete column button when we have more than one column left again
   */
  unhideDeleteButton() {
    this.menu.querySelector(`.${CSS.toolboxDeleteColumn}`).classList.remove(CSS.displayNone);
  }

  /**
   * Show toolbox column menu when the column toolbox was clicked
   */
  openToolboxMenu() {
    this.menu.classList.add(CSS.menuAnimation);
    this.menu.classList.remove(CSS.hidden);
  }

  /**
   * Hide toolbox column menu
   */
  closeToolboxMenu() {
    this.menu.classList.remove(CSS.menuAnimation);
    this.menu.classList.add(CSS.hidden);
    this.unsetDeleteConfiramtion();
  }

  /**
   * Set the class to confirm deletion for the column menu
   */
  setDeleteConfirmation() {
    this.menu.querySelector(`.${CSS.toolboxDelete}`).classList.add(CSS.deleteConfirm);
  }

  /**
   * Remove the class to confirm deletion for the column menu
   */
  unsetDeleteConfiramtion() {
    this.menu.querySelector(`.${CSS.toolboxDelete}`).classList.remove(CSS.deleteConfirm);
  }

  /**
   * Change column toolbox position
   *
   * @param {number} numberOfColumns - number of columns in the table
   * @param {number} column - current column, if 0 then hide toolbox
   */
  updateToolboxIconPosition(numberOfColumns = 0, column = this.column) {
    this.column = column;

    if (this.column <= 0 || this.column > numberOfColumns) {
      this.element.style.opacity = '0';
    } else {
      this.element.style.cssText = 'opacity: 1; ' + `left: calc((100% - 35px) / (${numberOfColumns} * 2) * (1 + (${column} - 1) * 2))`;
    }

    if (numberOfColumns == 1) {
      this.hideDeleteButton();
    } else {
      this.unhideDeleteButton();
    }
  }
}