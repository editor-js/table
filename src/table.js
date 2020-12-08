import { create, getCoords, getSideByCoords } from './documentUtils';
import './styles/table.pcss';

const CSS = {
  table: 'tc-table',
  inputField: 'tc-table__inp',
  cell: 'tc-table__cell',
  wrapper: 'tc-table__wrap',
  area: 'tc-table__area',
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
    this._numberOfRows = 0;
    this._element = this._createTableWrapper();
    this._table = this._element.querySelector('table');

    if (!this.readOnly) {
      this._hangEvents();
    }
  }

  /**
   * Add column in table on index place
   *
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
   *
   * @param {number} index - number in the array of columns, where new column to insert,-1 if insert at the end
   * @returns {HTMLElement} row
   */
  addRow(index = -1) {
    this._numberOfRows++;
    const row = this._table.insertRow(index);

    this._fillRow(row);

    return row;
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

    cell.appendChild(create('div', [ CSS.area ], null, [ content ]));
  }

  /**
   * @private
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

    const coordsCell = getCoords(event.target.closest('TD'));
    const side = getSideByCoords(coordsCell, event.pageX, event.pageY);

    event.target.dispatchEvent(new CustomEvent('mouseInActivatingArea', {
      detail: {
        side: side,
      },
      bubbles: true,
    }));
  }
}
