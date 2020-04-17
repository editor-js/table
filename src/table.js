import {create} from './documentUtils';
import './styles/table.pcss';

const CSS = {
  table: 'tc-table',
  inputField: 'tc-table__inp',
  cell: 'tc-table__cell',
  wrapper: 'tc-table__wrap',
  area: 'tc-table__area',
  highlight: 'tc-table__highlight'
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
    this._selectedCell = null;

    this._attachEvents();
  }

  /**
   * returns selected/editable cell or null if row is not selected
   * @return {HTMLElement|null}
   */
  get selectedCell() {
    return this._selectedCell;
  }

  /**
   * sets a selected cell and highlights it
   * @param cell - new current cell
   */
  set selectedCell(cell) {
    if (this._selectedCell) {
      this._selectedCell.classList.remove(CSS.highlight);
    }

    this._selectedCell = cell;

    if (this._selectedCell) {
      this._selectedCell.classList.add(CSS.highlight);
    }
  }

  /**
   * returns current a row that contains current cell
   * or null if no cell selected
   * @returns {HTMLElement|null}
   */
  get selectedRow() {
    if (!this.selectedCell) return null;

    return this.selectedCell.closest('tr');
  }

  /**
   * Inserts column to the right from currently selected cell
   */
  insertColumnAfter() {
    this.insertColumn(1);
  }

  /**
   * Inserts column to the left from currently selected cell
   */
  insertColumnBefore() {
    this.insertColumn();
  }

  /**
   * Inserts new row below a current row
   */
  insertRowBefore() {
    this.insertRow();
  }

  /**
   * Inserts row above a current row
   */
  insertRowAfter() {
    this.insertRow(1);
  }

  /**
   * Insert a column into table relatively to a current cell
   * @param {number} direction - direction of insertion. 0 is insertion before, 1 is insertion after
   */
  insertColumn(direction = 0) {
    direction = Math.min(Math.max(direction, 0), 1);

    const insertionIndex = this.selectedCell
      ? this.selectedCell.cellIndex + direction
      : 0;

    this._numberOfColumns++;
    /** Add cell in each row */
    const rows = this._table.rows;

    for (let i = 0; i < rows.length; i++) {
      const cell = rows[i].insertCell(insertionIndex);

      this._fillCell(cell);
    }
  };

  /**
   * Remove column that includes currently selected cell
   * Do nothing if there's no current cell
   */
  deleteColumn() {
    if (!this.selectedCell) return;

    const removalIndex = this.selectedCell.cellIndex;

    this._numberOfColumns--;
    /** Delete cell in each row */
    const rows = this._table.rows;

    for (let i = 0; i < rows.length; i++) {
      rows[i].deleteCell(removalIndex);
    }
  };

  /**
   * Insert a row into table relatively to a current cell
   * @param {number} direction - direction of insertion. 0 is insertion before, 1 is insertion after
   * @return {HTMLElement} row
   */
  insertRow(direction = 0) {
    direction = Math.min(Math.max(direction, 0), 1);

    const insertionIndex = this.selectedRow
      ? this.selectedRow.rowIndex + direction
      : 0;

    const row = this._table.insertRow(insertionIndex);

    this._numberOfRows++;

    this._fillRow(row);
    return row;
  };

  /**
   * Remove row in table on index place
   * @param {number} index - number in the array of columns, where new column to insert,-1 if insert at the end
   */
  deleteRow(index = -1) {
    if (!this.selectedRow) return;

    const removalIndex = this.selectedRow.rowIndex;

    this._table.deleteRow(removalIndex);
    this._numberOfRows--;
  };

  /**
   * get html table wrapper
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
   * @private
   *
   * Creates table structure
   * @return {HTMLElement} tbody - where rows will be
   */
  _createTableWrapper() {
    return create('div', [ CSS.wrapper ], null, [
      create('table', [ CSS.table ])
    ]);
  }

  /**
   * @private
   *
   * Create editable area of cell
   * @return {HTMLElement} - the area
   */
  _createContenteditableArea() {
    return create('div', [ CSS.inputField ], { contenteditable: 'true' });
  }

  /**
   * @private
   *
   * Fills the empty cell of the editable area
   * @param {HTMLElement} cell - empty cell
   */
  _fillCell(cell) {
    cell.classList.add(CSS.cell);
    const content = this._createContenteditableArea();

    cell.appendChild(create('div', [ CSS.area ], null, [ content ]));
  }

  /**
   * @private
   *
   * Fills the empty row with cells  in the size of numberOfColumns
   * @param row = the empty row
   */
  _fillRow(row) {
    for (let i = 0; i < this._numberOfColumns; i++) {
      const cell = row.insertCell();

      this._fillCell(cell);
    }
  }

  /**
   * @private
   *
   * hang necessary events
   */
  _attachEvents() {
    this._table.addEventListener('focus', (event) => {
      this._focusEditField(event);
    }, true);

    this._table.addEventListener('keydown', (event) => {
      this._pressedEnterInEditField(event);
    });

    this._table.addEventListener('click', (event) => {
      this._clickedOnCell(event);
    });
  }

  /**
   * @private
   *
   * When you focus on an editable field, remembers the cell
   * @param {FocusEvent} event
   */
  _focusEditField(event) {
    this.selectedCell = event.target.tagName === 'TD'
      ? event.target
      : event.target.closest('td');
  }

  /**
   * @private
   *
   * When enter is pressed when editing a field
   * @param {KeyboardEvent} event
   */
  _pressedEnterInEditField(event) {
    if (!event.target.classList.contains(CSS.inputField)) {
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
    }
  }

  /**
   * @private
   *
   * When clicking on a cell
   * @param {MouseEvent} event
   */
  _clickedOnCell(event) {
    if (!event.target.classList.contains(CSS.cell)) {
      return;
    }
    const content = event.target.querySelector('.' + CSS.inputField);

    content.focus();
  }
}
