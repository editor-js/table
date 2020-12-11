import { create, getCoords, getSideByCoords } from './documentUtils';
import { setActiveColRow } from './tableHelpers';
import './styles/table.pcss';

const CSS = {
  table: 'tc-table',
  inputField: 'tc-table__inp',
  row: 'tc-table__row',
  rowDeletable: 'tc-table__row--deletable',
  cell: 'tc-table__cell',
  cellDeletable: 'tc-table__cell--deletable',
  wrapper: 'tc-table__wrap',
  area: 'tc-table__area'
};

/**
 * Generates and manages _table contents.
 */
export class Table {
  /**
   * Creates
   *
   * @param {boolean} readOnly - read-only mode flag
   */
  constructor(readOnly) {
    this.readOnly = readOnly;
    this._numberOfColumns = 0;
    this._element = this._createTableWrapper();
    this._table = this._element.querySelector('table');

    if (!this.readOnly) {
      this._hangEvents();
    }
  }

  /**
   * Returns the last active cell
   *
   * @returns {string|number}
   */
  activeCell() {
    return parseInt(this._table.dataset.activeCell || 0);
  }

  /**
   * Checks if active column is first
   *
   * @returns {boolean}
   */
  activeCellIsFirst() {
    return parseInt(this._table.dataset.activeCell || 0) === 0;
  }

  /**
   * Checks if active column is last
   *
   * @returns {boolean}
   */
  activeCellIsLast() {
    return this._numberOfColumns === parseInt(this._table.dataset.activeCell || 0) + 1;
  }

  /**
   * Removes active state from row / cells
   */
  _clearState() {
    for (let rowIdx = 0; rowIdx < this._table.rows.length; rowIdx++) {
      this._table.rows[rowIdx].classList.remove(CSS.rowDeletable);

      for (let cellIdx = 0; cellIdx < this._numberOfColumns; cellIdx++) {
        this._table.rows[rowIdx].cells[cellIdx].classList.remove(CSS.cellDeletable);
      }
    }
  }

  _setRowState(rowIdx, state) {
    if (this._table.rows[rowIdx]) {
      this._table.rows[rowIdx].classList.add(state);
    }
  }

  _setColumnState(cellIdx, state) {
    for (let rowIdx = 0; rowIdx < this._table.rows.length; rowIdx++) {
      if (this._table.rows[rowIdx].cells[cellIdx]) {
        this._table.rows[rowIdx].cells[cellIdx].classList.add(state);
      }
    }
  }

  activateTopRowForToolbar() {
    this._setRowState(this.activeRow() - 1, CSS.rowDeletable);
  }

  activateBottomRowForToolbar() {
    this._setRowState(this.activeRow() + 1, CSS.rowDeletable);
  }

  activateLeftColumnForToolbar() {
    this._setColumnState(this.activeCell() - 1, CSS.cellDeletable);
  }

  activateRightColumnForToolbar() {
    this._setColumnState(this.activeCell() + 1, CSS.cellDeletable);
  }

  /**
   * Returns the last active row
   *
   * @returns {string|number}
   */
  activeRow() {
    return parseInt(this._table.dataset.activeRow || 0);
  }

  /**
   * Checks if active row is first
   *
   * @returns {boolean}
   */
  activeRowIsFirst() {
    return parseInt(this._table.dataset.activeRow || 0) === 0;
  }

  /**
   * Checks if active row is last
   *
   * @returns {boolean}
   */
  activeRowIsLast() {
    return this._table.rows.length === parseInt(this._table.dataset.activeRow || 0) + 1;
  }

  /**
   * Add column in table on index place
   *
   * @param {number} cellIndex - 0 = Insert in the beginning of each row, all others will move to the right
   */
  addColumn(cellIndex = 0) {
    const rows = this._table.rows;

    for (let i = 0; i < rows.length; i++) {
      const cell = rows[i].insertCell(cellIndex);

      this._fillCell(cell);
    }

    this._numberOfColumns++;
  };

  /**
   * Add column to the left of the active td-index
   *
   * @param {number} cellIndex - current active td
   */
  addColumnLeft(cellIndex) {
    this.addColumn(cellIndex);
  }

  /**
   * Add column to the left of the active td-index
   *
   * @param {number} cellIndex - current active td.cellIndex
   */
  addColumnRight(cellIndex) {
    this.addColumn(cellIndex + 1);
  }

  /**
   * Remove column in table on index place
   *
   * @param {number} cellIndex - will remove the td.cellIndex in every row
   */
  removeColumn(cellIndex = 0) {
    if (cellIndex < 0) { // cannot remove negative index
      return;
    }

    const rows = this._table.rows;

    if (rows.length === 0 || this._numberOfColumns <= 1) { // avoid deletion of last row/col
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      rows[i].deleteCell(cellIndex);
    }

    this._numberOfColumns--;
  };

  /**
   * Remove column in table on index place
   *
   * @param {number} cellIndex - will remove the td.cellIndex in every row
   */
  removeColumnLeft(cellIndex = 0) {
    this.removeColumn(cellIndex - 1);
  };

  /**
   * Remove column in table on index place
   *
   * @param {number} cellIndex - will remove the td.cellIndex in every row
   */
  removeColumnRight(cellIndex = 0) {
    if (this._numberOfColumns === cellIndex + 1) { // avoid deletion if column itself is last
      return;
    }
    this.removeColumn(cellIndex + 1);
  };

  /**
   * Add row in table on index place
   *
   * @param {number} rowIndex - 0 = will put a new row on the beginning of the table and move all others below
   * @returns {HTMLElement}
   */
  addRow(rowIndex = 0) {
    const row = this._table.insertRow(rowIndex);

    row.classList.add(CSS.row);

    for (let i = 0; i < this._numberOfColumns; i++) {
      const cell = row.insertCell();

      this._fillCell(cell);
    }

    return row;
  };

  /**
   * Adds a new row above the rowIndex
   *
   * @param {number} rowIndex
   * @returns {HTMLElement}
   */
  addRowAbove(rowIndex) {
    return this.addRow(rowIndex);
  };

  /**
   * Adds a new row below the rowIndex
   *
   * @param {number} rowIndex
   * @returns {HTMLElement}
   */
  addRowBelow(rowIndex) {
    const rows = this._table.rows.length;

    rowIndex = rowIndex + 1;

    if (rowIndex > rows) { // Invalid rowIndex will append a new row at the end
      return this.addRow(rows);
    }

    return this.addRow(rowIndex); // Add new row below rowIndex
  };

  /**
   * Remove row in table on index place
   *
   * @param {number} rowIndex - number in the array of columns, where new column to insert,-1 if insert at the end
   */
  removeRow(rowIndex = 0) {
    if (this._table.rows.length === 1) { // avoid deletion of last row
      return;
    }

    this._table.deleteRow(rowIndex);
  };

  /**
   * Remove row above the given index
   *
   * @param {number} rowIndex - number in the array of columns, where new column to insert,-1 if insert at the end
   */
  removeRowAbove(rowIndex = 0) {
    if (this._table.rows.length === 1) { // avoid deletion of first/last row
      return;
    }

    if (rowIndex === 0) { // skip deletion because above is no row anymore
      return;
    }

    this._table.deleteRow(rowIndex - 1);
  };

  /**
   * Remove row below the given index
   *
   * @param {number} rowIndex - number in the array of columns, where new column to insert,-1 if insert at the end
   */
  removeRowBelow(rowIndex = 0) {
    if (this._table.rows.length === 1) { // avoid deletion of first/last row
      return;
    }

    if (this._table.rows.length === rowIndex + 1) { // skip deletion because below is no row anymore
      return;
    }

    this._table.deleteRow(rowIndex + 1);
  };

  /**
   * get html element of table
   *
   * @returns {HTMLElement}
   */
  get htmlElement() {
    return this._element;
  }

  /**
   * get real table tag
   *
   * @returns {HTMLElement}
   */
  get body() {
    return this._table;
  }

  /**
   * returns selected/editable cell
   *
   * @returns {HTMLElement}
   */
  get selectedCell() {
    return this._selectedCell;
  }

  /**
   * @private
   * @returns {HTMLElement} tbody - where rows will be
   */
  _createTableWrapper() {
    return create('div', [ CSS.wrapper ], null, [ create('table', [ CSS.table ]) ]);
  }

  /**
   * @private
   * @returns {HTMLElement} - the area
   */
  _createContenteditableArea() {
    return create('div', [ CSS.inputField ], { contenteditable: !this.readOnly });
  }

  /**
   * @private
   * @param {HTMLElement} cell - empty cell
   */
  _fillCell(cell) {
    cell.classList.add(CSS.cell);
    const content = this._createContenteditableArea();
    const area = create('div', [ CSS.area ], null, [ content ]);

    cell.appendChild(area);
  }

  /**
   * @private
   */
  _hangEvents() {
    this._table.addEventListener('focus', (event) => {
      this._focusEditField(event);
    }, true);

    this._table.addEventListener('blur', (event) => {
      this._blurEditField(event);
    }, true);

    this._table.addEventListener('keydown', (event) => {
      this._pressedEnterInEditField(event);
    });

    this._table.addEventListener('click', (event) => {
      this._clickedOnCell(event);
    });

    this._table.addEventListener('mouseover', (event) => {
      this._mouseEnterInDetectArea(event);
      event.stopPropagation();
    }, true);
  }

  /**
   * @private
   * @param {FocusEvent} event
   */
  _focusEditField(event) {
    if (!event.target.classList.contains(CSS.inputField)) {
      return;
    }
    this._selectedCell = event.target.closest('.' + CSS.cell);
  }

  /**
   * @private
   * @param {FocusEvent} event
   */
  _blurEditField(event) {
    if (!event.target.classList.contains(CSS.inputField)) {
      return;
    }
    this._selectedCell = null;
  }

  /**
   * @private
   * @param {KeyboardEvent} event
   */
  _pressedEnterInEditField(event) {
    if (!event.target.classList.contains(CSS.inputField)) {
      return;
    }
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
    }
  }

  /**
   * @private
   * @param {MouseEvent} event
   */
  _clickedOnCell(event) {
    if (!event.target.classList.contains(CSS.cell)) {
      return;
    }
    const content = event.target.querySelector('.' + CSS.inputField);

    content.focus();
  }

  /**
   * @private
   * @param {MouseEvent} event
   */
  _mouseEnterInDetectArea(event) {
    if (!event.target.classList.contains(CSS.area)) {
      return;
    }

    const closestTd = event.target.closest('TD');
    const coordsCell = getCoords(closestTd);
    const side = getSideByCoords(coordsCell, event.pageX, event.pageY);

    setActiveColRow(closestTd);

    event.target.dispatchEvent(new CustomEvent('mouseInActivatingArea', {
      detail: {
        side: side,
      },
      bubbles: true,
    }));
  }
}
