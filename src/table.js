import { create, getCoords, getSideByCoords, insertAfter, insertBefore } from './documentUtils';
import './styles/table.pcss';

const CSS = {
  table: 'tc-table',
  row: 'tc-row',
  column: 'tc-column',
  preColumn: 'tc-column--pre',
  addRow: 'tc-add-row',
  addColumn: 'tc-add-column',
  addColumnCell: 'tc-add-column--cell',
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
    this._table = this._element.querySelector(`.${CSS.table}`);

    this._fillAddButtons();

    if (!this.readOnly) {
      this._hangEvents();
    }
  }

  /**
   * Add column in table on index place
   * Add cells in each row
   *
   * @param {number} index - number in the array of columns, where new column to insert, -1 if insert at the end
   */
  addColumn(index = -1) {
    this._numberOfColumns++;
   
    for (let i = 1; i <= this._numberOfRows; i++) {
      let cell;
      const newCell = create('div', [ CSS.column ],  { contenteditable: !this.readOnly });

      if (index > 0) {
        cell = this._table.querySelector(`.${CSS.row}:nth-child(${i}) .${CSS.column}:nth-child(${index})`);
      } else {
        cell = this._table.querySelector(`.${CSS.row}:nth-child(${i})`).appendChild(newCell);
      }

      this._fillCell(cell);
    }
  };

  /**
   * Add row in table on index place
   *
   * @param {number} index - number in the array of rows, where new column to insert,-1 if insert at the end
   * @returns {HTMLElement} row
   */
  addRow(index = -1) {
    this._numberOfRows++;
    let row;
    
    if (index > 0) {
      row = insertAfter(create('div', [ CSS.row ]), this._table.querySelector(`.${CSS.row}:nth-child(${index})`));
    } else {
      row = this._table.appendChild(create('div', [ CSS.row ]));
    }

    this._fillRow(row);

    return row;
  };

  /**
   * Add buttons to fast add row/column
   */
  _fillAddButtons() {
    this._element.querySelector(`.${CSS.addColumn}`).textContent = '+';
    this._element.querySelector(`.${CSS.addRow}`).textContent = '+';
  }

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
    return create('div', [ CSS.wrapper ], null, [ 
      create('div', [ CSS.table ]),
      create('div', [ CSS.addColumn ]),
      create('div', [ CSS.addRow ]) 
    ]);
  }

  /**
   * @private
   * @param {HTMLElement} cell - empty cell
   */
  _fillCell(cell) {
    // cell.classList.add(CSS.cell);
  }

  /**
   * Add pre-column cell to a row
   * 
   * @private
   * @param {HTMLElement} row
   */
  _fillRow(row) {
    for (let i = 1; i <= this._numberOfColumns; i++) {
      const newCell = create('div', [ CSS.column ],  { contenteditable: !this.readOnly });

      row.appendChild(newCell);
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
    /*if (!event.target.classList.contains(CSS.cell)) {
      return;
    }
    const content = event.target.querySelector('.' + CSS.inputField);

    content.focus();*/
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
