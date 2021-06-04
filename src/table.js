import { create, getRelativeCoords, getRelativeCoordsOfTwoElems, insertAfter, insertBefore } from './documentUtils';
import './styles/table.pcss';
import './styles/toolbox.pcss';
import './styles/utils.pcss';
import './styles/settings.pcss';
import svgPlusButton from './img/plus.svg';
import { Toolbox } from './toolbox';

const CSS = {
  table: 'tc-table',
  row: 'tc-row',
  withHeadings: 'tc-table--heading',
  rowSelected: 'tc-row--selected',
  cell: 'tc-cell',
  cellSelected: 'tc-cell--selected',
  addRow: 'tc-add-row',
  addColumn: 'tc-add-column',
  wrapper: 'tc-table__wrap',
  toolboxAddColumnRight: 'tc-toolbox-add-column-right',
  toolboxAddColumnLeft: 'tc-toolbox-add-column-left',
  toolboxDeleteColumn: 'tc-toolbox-delete--column',
  toolboxAddRowAbove: 'tc-toolbox-add-row-above',
  toolboxAddRowBelow: 'tc-toolbox-add-row-below',
  toolboxDeleteRow: 'tc-toolbox-delete--row'
};

/**
 * Generates and manages _table contents.
 */
export class Table {
  /**
   * Creates
   *
   * @constructor
   * @param {boolean} readOnly - read-only mode flag
   */
  constructor(readOnly) {
    this.readOnly = readOnly;
    this._numberOfColumns = 0;
    this._numberOfRows = 0;
    this._toolbox = new Toolbox();
    this._element = this._createTableWrapper();
    this._table = this._element.querySelector(`.${CSS.table}`);
    this._hoveredRow = 0;
    this._hoveredColumn = 0;
    this._lastSelectedRow = 0;
    this._lastSelectedColumn = 0;

    // The cell in which the focus is currently located, if 0 and 0 then there is no focus
    // Uses to switch between cells with buttons
    this._focusedCell = {
      row: 0,
      column: 0
    };

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
      const newCell = create('div', [ CSS.cell ], { contenteditable: !this.readOnly });

      if (index > 0) {
        cell = this._table.querySelector(`.${CSS.row}:nth-child(${i}) .${CSS.cell}:nth-child(${index})`);

        if (cell) {
          insertBefore(newCell, cell);
        } else {
          cell = this._table.querySelector(`.${CSS.row}:nth-child(${i}) .${CSS.cell}:nth-child(${index - 1})`);

          insertAfter(newCell, cell);
        }
      } else {
        cell = this._table.querySelector(`.${CSS.row}:nth-child(${i})`).appendChild(newCell);
      }
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
    let newRow;
    let rowElem = create('div', [ CSS.row ]);

    if (index > 0) {
      let row = this._table.querySelector(`.${CSS.row}:nth-child(${index})`);

      if (row) {
        newRow = insertBefore(rowElem, row);
      } else {
        row = this._table.querySelector(`.${CSS.row}:nth-child(${index - 1})`);

        newRow = insertAfter(rowElem, row);
      }
    } else {
      newRow = this._table.appendChild(rowElem);
    }

    this._fillRow(newRow);

    return newRow;
  };

  /**
   * Delete a column by index
   *
   * @param {number} index
   */
  deleteColumn(index) {
    for (let i = 1; i <= this._numberOfRows; i++) {
      const cell = this._table.querySelector(`.${CSS.row}:nth-child(${i}) .${CSS.cell}:nth-child(${index})`);

      if (!cell) {
        return;
      }

      cell.remove();
    }

    this._numberOfColumns--;
  }

  /**
   * Delete a row by index
   *
   * @param {number} index
   */
  deleteRow(index) {
    this._table.querySelector(`.${CSS.row}:nth-child(${index})`).remove();

    this._numberOfRows--;
  }

  /**
   * Add buttons to fast add row/column
   *
   * @private
   */
  _fillAddButtons() {
    this._element.querySelector(`.${CSS.addColumn}`).innerHTML = svgPlusButton;
    this._element.querySelector(`.${CSS.addRow}`).innerHTML = svgPlusButton;
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
   * Create wrapper with an additional interface
   *
   * @private
   * @returns {HTMLElement} wrapper - where all buttons for a table and the table itself will be
   */
  _createTableWrapper() {
    return create('div', [ CSS.wrapper ], null, [
      this._toolbox.toolboxRow,
      this._toolbox.toolboxColumn,
      create('div', [ CSS.table ]),
      create('div', [ CSS.addColumn ]),
      create('div', [ CSS.addRow ])
    ]);
  }

  /**
   * Add cells to a row
   *
   * @private
   * @param {HTMLElement} row
   */
  _fillRow(row) {
    for (let i = 1; i <= this._numberOfColumns; i++) {
      const newCell = create('div', [ CSS.cell ], { contenteditable: !this.readOnly });

      row.appendChild(newCell);
    }
  }

  /**
   * Hangs the necessary handlers to events
   *
   * @private
   */
  _hangEvents() {
    // Update toolboxes position depending on the mouse movements
    this._table.addEventListener('mousemove', (event) => {
      const { row, column } = this._hoveredCell(event);

      this._updateToolboxesPosition(row, column);
    }, true);

    // Hide toolboxes when leaving the table
    this._element.addEventListener('mouseleave', (event) => {
      this._toolbox.closeToolboxColumnMenu();
      this._toolbox.closeToolboxRowMenu();
      this._updateToolboxesPosition();
    });

    // Hide toolboxes when over the add column button
    this._element.querySelector(`.${CSS.addColumn}`).addEventListener('mouseover', event => {
      this._updateToolboxesPosition();
    });

    // Hide toolboxes when over the add row button
    this._element.querySelector(`.${CSS.addRow}`).addEventListener('mouseover', event => {
      this._updateToolboxesPosition();
    });

    // Add column to right
    this._toolbox.toolboxColumn.querySelector(`.${CSS.toolboxAddColumnRight}`).addEventListener('click', event => {
      event.stopPropagation();

      this.addColumn(this._hoveredColumn + 1);
      this._updateToolboxesPosition();
    });

    // Add column to left
    this._toolbox.toolboxColumn.querySelector(`.${CSS.toolboxAddColumnLeft}`).addEventListener('click', event => {
      event.stopPropagation();

      this.addColumn(this._hoveredColumn);
      this._updateToolboxesPosition();
    });

    // Add row above
    this._toolbox.toolboxRow.querySelector(`.${CSS.toolboxAddRowAbove}`).addEventListener('click', event => {
      event.stopPropagation();

      this.addRow(this._hoveredRow);
      this._updateToolboxesPosition();
    });

    // Add row below
    this._toolbox.toolboxRow.querySelector(`.${CSS.toolboxAddRowBelow}`).addEventListener('click', event => {
      event.stopPropagation();

      this.addRow(this._hoveredRow + 1);
      this._updateToolboxesPosition();
    });

    // Delete selected column
    this._toolbox.toolboxColumn.querySelector(`.${CSS.toolboxDeleteColumn}`).addEventListener('click', event => {
      this.deleteColumn(this._hoveredColumn);
      this._updateToolboxesPosition();
    });

    // Delete selected row
    this._toolbox.toolboxRow.querySelector(`.${CSS.toolboxDeleteRow}`).addEventListener('click', event => {
      this.deleteRow(this._hoveredRow);
      this._updateToolboxesPosition();
    });

    // Open/close toolbox row menu
    this._toolbox.toolboxRow.addEventListener('click', event => {
      this._unselectColumn();
      this._toolbox.closeToolboxColumnMenu();

      if (this._hoveredRow == this._lastSelectedRow) {
        this._unselectRow();
        this._toolbox.closeToolboxRowMenu();

        return;
      }

      this._selectRow(this._hoveredRow);
      this._toolbox.openToolboxRowMenu();
    });

    // Open/close toolbox column menu
    this._toolbox.toolboxColumn.addEventListener('click', event => {
      this._unselectRow();
      this._toolbox.closeToolboxRowMenu();

      if (this._hoveredColumn == this._lastSelectedColumn) {
        this._unselectColumn();
        this._toolbox.closeToolboxColumnMenu();

        return;
      }

      this._selectColumn(this._hoveredColumn);
      this._toolbox.openToolboxColumnMenu();
    });

    this._table.onkeypress = (event) => {
      if (event.key == 'Enter' && event.shiftKey) {
        return true;
      }

      if (event.key == 'Enter') {
        if (this._focusedCell.row != this._numberOfRows) {
          this._focusedCell.row += 1;
          this._focusCell(this._focusedCell);
        } else {
          this.addRow();
          this._focusedCell.row += 1;
          this._focusCell(this._focusedCell);
          this._updateToolboxesPosition(0, 0);
        }
      }

      return event.key != 'Enter';
    };

    this._table.addEventListener('keydown', (event) => {
      if (event.key == 'Tab') {
        event.stopPropagation();
      }
    });

    this._table.addEventListener('focusin', event => {
      const cell = event.target;
      const row = cell.parentElement;

      this._focusedCell = {
        row: Array.from(this._table.querySelectorAll(`.${CSS.row}`)).indexOf(row) + 1,
        column: Array.from(row.querySelectorAll(`.${CSS.cell}`)).indexOf(cell) + 1
      };
    });
  }

  /**
   * Set the cursor focus to the focused cell
   *
   * @private
   */
  _focusCell() {
    this._focusedCellElem.focus();
  }

  /**
   * Get current focused element
   *
   * @private
   * @returns {HTMLElement} - focused cell
   */
  get _focusedCellElem() {
    const { row, column } = this._focusedCell;

    return this._table.querySelector(`.${CSS.row}:nth-child(${row}) .${CSS.cell}:nth-child(${column})`);
  }

  /**
   * Update toolboxes position
   *
   * @private
   * @param {number} row - hovered row
   * @param {number} column - hovered column
   */
  _updateToolboxesPosition(row = 0, column = 0) {
    if (this._hoveredRow == row && this._hoveredColumn == column) {
      return;
    }

    if (this._hoveredColumn != column) {
      this._unselectColumn();
      this._toolbox.closeToolboxColumnMenu();
    }

    if (this._hoveredRow != row) {
      this._unselectRow();
      this._toolbox.closeToolboxRowMenu();
    }

    this._hoveredRow = row;
    this._hoveredColumn = column;

    this._toolbox.updateToolboxColumnPosition(this._numberOfColumns, column);
    this._toolbox.updateToolboxRowPosition(this._numberOfRows, row, this._table);
  }

  /**
   * Makes the first row headings
   *
   * @param {boolean} withHeadings - use headings row or not
   */
  useHeadings(withHeadings) {
    if (withHeadings) {
      this._table.classList.add(CSS.withHeadings);
    } else {
      this._table.classList.remove(CSS.withHeadings);
    }
  }

  /**
   * Add effect of a selected row
   *
   * @private
   * @param {number} index
   */
  _selectRow(index) {
    this._lastSelectedRow = index;
    const row = this._table.querySelector(`.${CSS.row}:nth-child(${index})`);

    if (row) {
      row.classList.add(CSS.rowSelected);
    }
  }

  /**
   * Remove effect of a selected row
   *
   * @private
   */
  _unselectRow() {
    if (this._lastSelectedRow <= 0) {
      return;
    }

    const row = this._table.querySelector(`.${CSS.rowSelected}`);

    if (row) {
      row.classList.remove(CSS.rowSelected);
    }

    this._lastSelectedRow = 0;
  }

  /**
   * Add effect of a selected column
   *
   * @private
   * @param {number} index
   */
  _selectColumn(index) {
    for (let i = 1; i <= this._numberOfRows; i++) {
      const column = this._table.querySelector(`.${CSS.row}:nth-child(${i}) .${CSS.cell}:nth-child(${index})`);

      if (column) {
        column.classList.add(CSS.cellSelected);
      }
    }

    this._lastSelectedColumn = index;
  }

  /**
   * Remove effect of a selected column
   *
   * @private
   */
  _unselectColumn() {
    if (this._lastSelectedColumn <= 0) {
      return;
    }

    let columns = this._table.querySelectorAll(`.${CSS.cellSelected}`);

    Array.from(columns).forEach(column => {
      column.classList.remove(CSS.cellSelected);
    });

    this._lastSelectedColumn = 0;
  }

  /**
   * Calculates the row and column that the cursor is currently hovering over
   *
   * @private
   * @param {Event} event - mousemove event
   * @returns hovered cell coordinates as an integer row and column
   */
  _hoveredCell(event) {
    let hoveredRow = 0;
    let hoveredColumn = 0;
    const { width, height, x, y } = getRelativeCoords(this._table, event);

    // Looking for hovered column
    for (let i = 1; i <= this._numberOfColumns; i++) {
      const cell = this._table.querySelector(`.${CSS.row}:first-child .${CSS.cell}:nth-child(${i})`);
      const { fromRightBorder } = getRelativeCoordsOfTwoElems(this._table, cell);

      if (x < width - fromRightBorder) {
        hoveredColumn = i;

        break;
      }
    }

    // Looking for hovered row
    for (let i = 1; i <= this._numberOfRows; i++) {
      const row = this._table.querySelector(`.${CSS.row}:nth-child(${i})`);
      const { fromBottomBorder } = getRelativeCoordsOfTwoElems(this._table, row);

      if (y < height - fromBottomBorder) {
        hoveredRow = i;

        break;
      }
    }

    return {
      row: hoveredRow,
      column: hoveredColumn
    };
  }
}
