import { create, getCoords, getSideByCoords, insertAfter, insertBefore } from './documentUtils';
import toolboxIcon from './img/toolboxIcon.svg';
import newToLeftIcon from './img/new-to-left.svg';
import newToRightIcon from './img/new-to-right.svg';
import closeIcon from './img/cross.svg';

const CSS = {
  hidden: 'tc-hidden',
  toolboxRow: 'tc-toolbox-row',
  toolboxRowMenu: 'tc-toolbox-row__menu',
  toolboxColumn: 'tc-toolbox-column',
  toolboxColumnMenu: 'tc-toolbox-column__menu',
  toolboxAddColumnRight: 'tc-toolbox-add-column-right',
  toolboxAddColumnLeft: 'tc-toolbox-add-column-left',
  toolboxDelete: 'tc-toolbox-delete',
  toolboxOption: 'tc-toolbox-row__option',
}

/**
 * @constructor
 */
export class Toolbox {
  constructor() {
    this._toolboxRow = this.createToolboxRow();
    this._toolboxColumn = this.createToolboxColumn();
    this._toolboxRowMenu = this._toolboxRow.querySelector(`.${CSS.toolboxRowMenu}`);
    this._toolboxColumnMenu = this._toolboxColumn.querySelector(`.${CSS.toolboxColumnMenu}`);

    // row and column above which the toolboxes should be displayed, 0 means hide
    this._row = 0;
    this._column = 0;

    // hang event on the toolboxes
    this._hangEvents();
  }

  /**
   * @private
   */
  _hangEvents() {
    this._toolboxRow.addEventListener('click', event => {
      console.log('Open row toolbox');
    });

    this._toolboxColumn.addEventListener('click', event => {
      console.log('Open column toolbox');
      this.openToolboxColumnMenu();
    });
  }
  
  createToolboxRow() {
    let toolboxRowMenu = this._createRowMenu();
    let toolboxRowElem = create('div', [ CSS.toolboxRow ]);

    toolboxRowElem.innerHTML = toolboxIcon;
    toolboxRowElem.append(toolboxRowMenu);

    return toolboxRowElem;
  }

  createToolboxColumn() {
    let toolboxColumnMenu = this._createColumnMenu();
    let toolboxColumnElem = create('div', [ CSS.toolboxColumn ]);

    toolboxColumnElem.innerHTML = toolboxIcon;
    toolboxColumnElem.append(toolboxColumnMenu);

    return toolboxColumnElem;
  }

  _createRowMenu() {
    let toolboxRowMenu = create('div', [ CSS.toolboxRowMenu ]);

    return toolboxRowMenu;
  }

  _createColumnMenu() {
    let addColumnLeftText = create('span');
    let addColumnRightText = create('span');
    let deleteColumnText = create('span');

    addColumnLeftText.textContent = 'Add column to left';
    addColumnRightText.textContent = 'Add column to right';
    deleteColumnText.textContent = 'Delete column';

    let addColumnRight = create('div', [ CSS.toolboxAddColumnRight, CSS.toolboxOption ]);
    addColumnRight.innerHTML = newToRightIcon;
    addColumnRight.append(addColumnRightText);

    let addColumnLeft = create('div', [ CSS.toolboxAddColumnLeft, CSS.toolboxOption ]);
    addColumnLeft.innerHTML = newToLeftIcon;
    addColumnLeft.append(addColumnLeftText);

    let deleteColumn = create('div', [ CSS.toolboxDelete, CSS.toolboxOption ]);
    deleteColumn.innerHTML = closeIcon;
    deleteColumn.append(deleteColumnText);

    let toolboxColumnMenu = create('div', [ CSS.toolboxColumnMenu, CSS.hidden ], null, [
      addColumnLeft, 
      addColumnRight,
      deleteColumn
    ]);

    return toolboxColumnMenu;
  }

  get toolboxRow() {
    return this._toolboxRow;
  }

  get toolboxColumn() {
    return this._toolboxColumn;
  }

  /**
   * Change column toolbox position
   * 
   * @param {*} numberOfColumns 
   * @param {*} column - 
   */
  updateToolboxColumnPosition(numberOfColumns = 0, column = this._column) {
    this._column = column;

    if (this._column <= 0 || this._column > numberOfColumns) {
      this._toolboxColumn.style.visibility = 'hidden';
    } else {
      this._toolboxColumn.style.cssText = 'visibility: visible; ' + `left: calc((100% - 2.6em) / (${numberOfColumns} * 2) * (1 + (${column} - 1) * 2))`;
    }
  }

  openToolboxColumnMenu() {
    this._toolboxColumnMenu.classList.remove(CSS.hidden);
  }

  closeToolboxColumnMenu() {
    this._toolboxColumnMenu.classList.add(CSS.hidden);
  }

  /**
   * Change row toolbox position
   * 
   * @param {number} numberOfRows - number of rows
   * @param {number} row - hovered row
   */
   updateToolboxRowPosition(numberOfRows = 0, row = this._row) {
    this._row = row;

    if (this._row <= 0 || this._row > numberOfRows) {
      this._toolboxRow.style.visibility = 'hidden';
    } else {
      this._toolboxRow.style.visibility = 'visible';
      this._toolboxRow.style.top = `calc((100% - 2.6em) / (${numberOfRows} * 2) * (1 + (${row} - 1) * 2))`;
    }
  }
}