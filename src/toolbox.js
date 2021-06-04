import { create, getRelativeCoordsOfTwoElems } from './documentUtils';
import toolboxIcon from './img/toolboxIcon.svg';
import newToLeftIcon from './img/new-to-left.svg';
import newToRightIcon from './img/new-to-right.svg';
import newToUp from './img/new-to-up.svg';
import newToDown from './img/new-to-down.svg';
import closeIcon from './img/cross.svg';

const CSS = {
  hidden: 'tc-hidden',
  none: 'tc-none',
  toolboxRow: 'tc-toolbox-row',
  toolboxRowMenu: 'tc-toolbox-row__menu',
  toolboxColumn: 'tc-toolbox-column',
  toolboxColumnMenu: 'tc-toolbox-column__menu',
  toolboxAddColumnRight: 'tc-toolbox-add-column-right',
  toolboxAddColumnLeft: 'tc-toolbox-add-column-left',
  toolboxAddRowAbove: 'tc-toolbox-add-row-above',
  toolboxAddRowBelow: 'tc-toolbox-add-row-below',
  toolboxDelete: 'tc-toolbox-delete',
  toolboxDeleteColumn: 'tc-toolbox-delete--column',
  toolboxDeleteRow: 'tc-toolbox-delete--row',
  toolboxOption: 'tc-toolbox-row__option',
  menuAnimation: 'tc-menu-animation'
};

/**
 * @constructor
 */
export class Toolbox {
  /**
   * Creates toolbox buttons and toolbox menus
   */
  constructor() {
    this._toolboxRow = this.createToolboxRow();
    this._toolboxColumn = this.createToolboxColumn();
    this._toolboxRowMenu = this._toolboxRow.querySelector(`.${CSS.toolboxRowMenu}`);
    this._toolboxColumnMenu = this._toolboxColumn.querySelector(`.${CSS.toolboxColumnMenu}`);

    // row and column above which the toolboxes should be displayed, 0 means hide
    this._row = 0;
    this._column = 0;
  }

  /**
   * Creating a toolbox to open menu for a manipulating rows
   *
   * @returns {HTMLElement} - row toolbox wrapper
   */
  createToolboxRow() {
    let toolboxRowMenu = this._createRowMenu();
    let toolboxRowElem = create('div', [ CSS.toolboxRow ]);

    toolboxRowElem.innerHTML = toolboxIcon;
    toolboxRowElem.append(toolboxRowMenu);

    return toolboxRowElem;
  }

  /**
   * Creating a toolbox to open menu for a manipulating columns
   *
   * @returns {HTMLElement} - column toolbox wrapper
   */
  createToolboxColumn() {
    let toolboxColumnMenu = this._createColumnMenu();
    let toolboxColumnElem = create('div', [ CSS.toolboxColumn ]);

    toolboxColumnElem.innerHTML = toolboxIcon;
    toolboxColumnElem.append(toolboxColumnMenu);

    return toolboxColumnElem;
  }

  /**
   * Creating a tooolbox row menu
   *
   * @private
   * @returns {HTMLElement} - row menu
   */
  _createRowMenu() {
    let addRowAboveText = create('span');
    let addRowBelowText = create('span');
    let deleteRowText = create('span');

    addRowAboveText.textContent = 'Add row above';
    addRowBelowText.textContent = 'Add row below';
    deleteRowText.textContent = 'Delete row';

    let addRowAbove = create('div', [CSS.toolboxAddRowAbove, CSS.toolboxOption]);

    addRowAbove.innerHTML = newToUp;
    addRowAbove.append(addRowAboveText);

    let addRowBelow = create('div', [CSS.toolboxAddRowBelow, CSS.toolboxOption]);

    addRowBelow.innerHTML = newToDown;
    addRowBelow.append(addRowBelowText);

    let deleteRow = create('div', [CSS.toolboxDelete, CSS.toolboxOption, CSS.toolboxDeleteRow]);

    deleteRow.innerHTML = closeIcon;
    deleteRow.append(deleteRowText);

    let toolboxRowMenu = create('div', [CSS.toolboxRowMenu, CSS.hidden], null, [
      addRowAbove,
      addRowBelow,
      deleteRow
    ]);

    return toolboxRowMenu;
  }

  /**
   * Creating a tooolbox column menu
   *
   * @private
   * @returns {HTMLElement} - column menu
   */
  _createColumnMenu() {
    let addColumnLeftText = create('span');
    let addColumnRightText = create('span');
    let deleteColumnText = create('span');

    addColumnLeftText.textContent = 'Add column to left';
    addColumnRightText.textContent = 'Add column to right';
    deleteColumnText.textContent = 'Delete column';

    let addColumnRight = create('div', [CSS.toolboxAddColumnRight, CSS.toolboxOption]);

    addColumnRight.innerHTML = newToRightIcon;
    addColumnRight.append(addColumnRightText);

    let addColumnLeft = create('div', [CSS.toolboxAddColumnLeft, CSS.toolboxOption]);

    addColumnLeft.innerHTML = newToLeftIcon;
    addColumnLeft.append(addColumnLeftText);

    let deleteColumn = create('div', [CSS.toolboxDelete, CSS.toolboxOption, CSS.toolboxDeleteColumn]);

    deleteColumn.innerHTML = closeIcon;
    deleteColumn.append(deleteColumnText);

    let toolboxColumnMenu = create('div', [CSS.toolboxColumnMenu, CSS.hidden], null, [
      addColumnLeft,
      addColumnRight,
      deleteColumn
    ]);

    return toolboxColumnMenu;
  }

  /**
   * Get toolbox row element
   */
  get toolboxRow() {
    return this._toolboxRow;
  }

  /**
   * Get toolbox column element
   */
  get toolboxColumn() {
    return this._toolboxColumn;
  }

  /**
   * Hide delete column button for event when we only have one column left
   */
  hideDeleteColumnButton() {
    this._toolboxColumnMenu.querySelector(`.${CSS.toolboxDeleteColumn}`).classList.add(CSS.none);
  }

  /**
   * Unhide delete column button when we have more than one column left again
   */
  unhideDeleteColumnButton() {
    this._toolboxColumnMenu.querySelector(`.${CSS.toolboxDeleteColumn}`).classList.remove(CSS.none);
  }

  /**
   * Hide delete row button for event when we only have one row left
   */
  hideDeleteRowButton() {
    this._toolboxRowMenu.querySelector(`.${CSS.toolboxDeleteRow}`).classList.add(CSS.none);
  }

  /**
   * Unhide delete column button when we have more than one row left again
   */
  unhideDeleteRowButton() {
    this._toolboxRowMenu.querySelector(`.${CSS.toolboxDeleteRow}`).classList.remove(CSS.none);
  }

  /**
   * Show toolbox row menu when the toolbox was clicked
   */
  openToolboxRowMenu() {
    this._toolboxRowMenu.classList.add(CSS.menuAnimation);
    this._toolboxRowMenu.classList.remove(CSS.hidden);
  }

  /**
   * Hide toolbox row menu
   */
  closeToolboxRowMenu() {
    this._toolboxRowMenu.classList.remove(CSS.menuAnimation);
    this._toolboxRowMenu.classList.add(CSS.hidden);
  }

  /**
   * Show toolbox column menu when the column toolbox was clicked
   */
  openToolboxColumnMenu() {
    this._toolboxColumnMenu.classList.add(CSS.menuAnimation);
    this._toolboxColumnMenu.classList.remove(CSS.hidden);
  }

  /**
   * Hide toolbox column menu
   */
  closeToolboxColumnMenu() {
    this._toolboxColumnMenu.classList.remove(CSS.menuAnimation);
    this._toolboxColumnMenu.classList.add(CSS.hidden);
  }

  /**
   * Change column toolbox position
   *
   * @param {number} numberOfColumns - number of columns in the table
   * @param {number} column - current column, if 0 then hide toolbox
   */
  updateToolboxColumnPosition(numberOfColumns = 0, column = this._column) {
    this._column = column;

    if (this._column <= 0 || this._column > numberOfColumns) {
      this._toolboxColumn.style.opacity = '0';
    } else {
      this._toolboxColumn.style.cssText = 'opacity: 1; ' + `left: calc((100% - 35px) / (${numberOfColumns} * 2) * (1 + (${column} - 1) * 2))`;
    }

    if (numberOfColumns == 1) {
      this.hideDeleteColumnButton();
    } else {
      this.unhideDeleteColumnButton();
    }
  }

  /**
   * Change row toolbox position
   *
   * @param {number} numberOfRows - number of rows
   * @param {number} row - hovered row
   * @param {HTMLElement} table - table element
   */
  updateToolboxRowPosition(numberOfRows = 0, row = this._row, table) {
    this._row = row;

    if (this._row <= 0 || this._row > numberOfRows) {
      this._toolboxRow.style.opacity = '0';
    } else {
      const hoveredRowElement = table.querySelector(`.tc-row:nth-child(${this._row})`);
      const { fromTopBorder } = getRelativeCoordsOfTwoElems(table, hoveredRowElement);
      const { height } = hoveredRowElement.getBoundingClientRect();

      this._toolboxRow.style.opacity = '1';
      this._toolboxRow.style.top = `${fromTopBorder + height / 2}px`;
    }

    if (numberOfRows == 1) {
      this.hideDeleteRowButton();
    } else {
      this.unhideDeleteRowButton();
    }
  }
}