import { create, getCoords, getSideByCoords, insertAfter, insertBefore } from './documentUtils';
import toolboxIcon from './img/toolboxIcon.svg';

const CSS = {
  toolboxRow: 'tc-toolbox-row',
  toolboxColumn: 'tc-toolbox-column'
}

/**
 * @constructor
 */
export class Toolbox {
  constructor() {
    this._toolboxRow = this.createToolboxRow();
    this._toolboxColumn = this.createToolboxColumn();

    // row and column above which the toolboxes should be displayed, 0 means hide
    this._row = 0;
    this._column = 0;

  }
  
  createToolboxRow() {
    let toolboxRowElem = create('div', [ CSS.toolboxRow ]);

    toolboxRowElem.innerHTML = toolboxIcon;

    return toolboxRowElem;
  }

  createToolboxColumn() {
    let toolboxColumnElem = create('div', [ CSS.toolboxColumn ]);

    toolboxColumnElem.innerHTML = toolboxIcon;
    
    return toolboxColumnElem;
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

    if (this._column == 0 || this._column > numberOfColumns) {
      this._toolboxColumn.style.visibility = 'hidden';
    } else {
      this._toolboxColumn.style.cssText = 'visibility: visible; ' + `left: calc((100% - 2.6em) / (${numberOfColumns} * 2) * (1 + (${column} - 1) * 2))`;
    }
  }

  /**
   * Change row toolbox position
   * 
   * @param {number} numberOfRows - number of rows
   * @param {number} row - hovered row
   */
   updateToolboxRowPosition(numberOfRows = 0, row = this._row) {
    this._row = row;

    if (this._row == 0 || this._row > numberOfRows) {
      this._toolboxRow.style.visibility = 'hidden';
    } else {
      this._toolboxRow.style.visibility = 'visible';
      this._toolboxRow.style.top = `calc((100% - 2.6em) / (${numberOfRows} * 2) * (1 + (${row} - 1) * 2))`;
    }
  }
}