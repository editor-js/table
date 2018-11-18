import {create} from './documentUtils';
import {addDetectionAreas} from './DetectionAreas';
import './table.pcss';

const CSS = {
  table: 'tc-table',
  inputField: 'tc-table__inp',
  cell: 'tc-table__cell',
  wrapper: 'tc-table__wrap'
};

/**
 * Generates and manages _table contents.
 */
export class Table {
  /**
   * Creates
   */
  constructor() {
    this._numberOfColumns = 0;
    this._numberOfRows = 0;
    this._element = this._createTableWrapper();
    this._table = this._element.querySelector('table');
  }

  /**
   * Add column in table on index place
   * @param {number} index - number in the array of columns, where new column to insert,-1 if insert at the end
   */
  addColumn(index = -1) {
    this._numberOfColumns++;
    /** Add cell in each row */
    const rows = this._table.rows;

    for (let i = 0; i < rows.length; i++) {
      const cell = rows[i].insertCell(index);

      this._fillCell(cell);
    }
  };

  /**
   * Add row in table on index place
   * @param {number} index - number in the array of columns, where new column to insert,-1 if insert at the end
   * @return {HTMLElement} row
   */
  addRow(index = -1) {
    this._numberOfRows++;
    const row = this._table.insertRow(index);

    this._fillRow(row);
    return row;
  };

  /**
   * get html element of table
   * @return {HTMLElement}
   */
  get htmlElement() {
    return this._element;
  }

  /**
   * get real table tag
   * @return {HTMLElement}
   */
  get body() {
    return this._table;
  }

  /**
   * returns selected/editable cell
   * @return {HTMLElement}
   */
  get selectedCell() {
    return this._selectedCell;
  }

  /**
   * Creates table structure
   * @return {HTMLElement} tbody - where rows will be
   * @private
   */
  _createTableWrapper() {
    return create('div', [ CSS.wrapper ], null, [ create('table', [ CSS.table ]) ]);
  }

  /**
   * Create editable area of cell
   * @param {HTMLElement} cell - cell for which area is created
   * @return {HTMLElement} - the area
   * @private
   */
  _createContenteditableArea(cell) {
    const div = create('div', [ CSS.inputField ], {contenteditable: 'true'});

    div.addEventListener('keydown', (event) => {
      if (event.keyCode === 13 && !event.shiftKey) {
        event.preventDefault();
      }
    });
    div.addEventListener('focus', () => {
      this._selectedCell = cell;
    });
    div.addEventListener('blur', () => {
      this._selectedCell = null;
    });
    return div;
  }

  /**
   * Fills the empty cell of the editable area
   * @param {HTMLElement} cell - empty cell
   * @private
   */
  _fillCell(cell) {
    cell.classList.add(CSS.cell);
    const content = this._createContenteditableArea(cell);

    cell.appendChild(content);
    addDetectionAreas(cell, true);

    cell.addEventListener('click', () => {
      content.focus();
    });
  }

  /**
   * Fills the empty row with cells  in the size of numberOfColumns
   * @param row = the empty row
   * @private
   */
  _fillRow(row) {
    for (let i = 0; i < this._numberOfColumns; i++) {
      const cell = row.insertCell();

      this._fillCell(cell);
    }
  }
}
