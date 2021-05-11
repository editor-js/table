import { create, getCoords, getSideByCoords, insertAfter, insertBefore, hoveredCell } from './documentUtils';
import './styles/table.pcss';
import './styles/toolbox.pcss';
import './styles/utils.pcss';
import './styles/settings.pcss';
import svgPlusButton from './img/plus.svg';
import {Toolbox} from './toolbox';

const CSS = {
  table: 'tc-table',
  row: 'tc-row',
  rowHeading: 'tc-row--heading',
  rowSelected: 'tc-row--selected',
  column: 'tc-column',
  columnSelected: 'tc-column--selected',
  addRow: 'tc-add-row',
  addColumn: 'tc-add-column',
  addColumnCell: 'tc-add-column--cell',
  inputField: 'tc-table__inp',
  cell: 'tc-table__cell',
  wrapper: 'tc-table__wrap',
  area: 'tc-table__area',
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

        if (cell) {
          insertBefore(newCell, cell);
        } else {
          cell = this._table.querySelector(`.${CSS.row}:nth-child(${i}) .${CSS.column}:nth-child(${index - 1})`);
          
          insertAfter(newCell, cell);
        }
        
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
      this._table.querySelector(`.${CSS.row}:nth-child(${i}) .${CSS.column}:nth-child(${index})`).remove();
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
   * returns selected/editable cell
   *
   * @private
   * @returns {HTMLElement}
   */
  get selectedCell() {
    return this._selectedCell;
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
   * @todo fill cells
   * @private
   * @param {HTMLElement} cell - empty cell
   */
  _fillCell(cell) {
    // cell.classList.add(CSS.cell);
  }

  /**
   * Add cells to a row
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
    // Update toolboxes position depending on the mouse movements
    this._table.addEventListener('mousemove', (event) => {
      const { row, column } = hoveredCell(this._table, event, this._numberOfColumns, this._numberOfRows);

      this._updateToolboxesPosition(row, column);
    }, true);

    // Hide toolboxes when leaving the table
    this._element.addEventListener('mouseleave', (event) => {
      this._toolbox.closeToolboxColumnMenu();
      this._toolbox.closeToolboxRowMenu();
      this._updateToolboxesPosition(0, 0);
    });
    
    // Hide toolboxes when over the add column button
    this._element.querySelector(`.${CSS.addColumn}`).addEventListener('mouseover', event => {
      this._updateToolboxesPosition(0, 0);
    });

    // Hide toolboxes when over the add row button
    this._element.querySelector(`.${CSS.addRow}`).addEventListener('mouseover', event => {
      this._updateToolboxesPosition(0, 0);
    });
    
    // Add column to right
    this._toolbox.toolboxColumn.querySelector(`.${CSS.toolboxAddColumnRight}`).addEventListener('click', event => {
      event.stopPropagation();

      this.addColumn(this._hoveredColumn + 1);
      this._updateToolboxesPosition(0, 0);
    });

    // Add column to left
    this._toolbox.toolboxColumn.querySelector(`.${CSS.toolboxAddColumnLeft}`).addEventListener('click', event => {
      event.stopPropagation();

      this.addColumn(this._hoveredColumn);
      this._updateToolboxesPosition(0, 0);
    });

    // Add row above
    this._toolbox.toolboxRow.querySelector(`.${CSS.toolboxAddRowAbove}`).addEventListener('click', event => {
      event.stopPropagation();

      this.addRow(this._hoveredRow);
      this._updateToolboxesPosition(0, 0);
    });

    // Add row below
    this._toolbox.toolboxRow.querySelector(`.${CSS.toolboxAddRowBelow}`).addEventListener('click', event => {
      event.stopPropagation();

      this.addRow(this._hoveredRow + 1);
      this._updateToolboxesPosition(0, 0);
    });

    // Delete selected column
    this._toolbox.toolboxColumn.querySelector(`.${CSS.toolboxDeleteColumn}`).addEventListener('click', event => {
      this.deleteColumn(this._hoveredColumn);
      this._updateToolboxesPosition(0, 0);
    })

    // Delete selected row
    this._toolbox.toolboxRow.querySelector(`.${CSS.toolboxDeleteRow}`).addEventListener('click', event => {
      this.deleteRow(this._hoveredRow);
      this._updateToolboxesPosition(0, 0);
    })

    this._toolbox.toolboxRow.addEventListener('click', event => {
      this._selectRow(this._hoveredRow);
      this._toolbox.openToolboxRowMenu();
    });

    this._toolbox.toolboxColumn.addEventListener('click', event => {
      this._selectColumn(this._hoveredColumn);
      this._toolbox.openToolboxColumnMenu();
    });
  }

  /**
   * Update toolboxes position
   * 
   * @private
   * @param {number} row - hovered row
   * @param {number} column - hovered column
   */
  _updateToolboxesPosition(row, column) {
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
    this._toolbox.updateToolboxRowPosition(this._numberOfRows, row);
  }

  /**
   * Makes the first row headings
   * @param {boolean} withHeadings - use headings row or not
   */
  useHeadings(withHeadings) {
    if (withHeadings) {
      this._table.querySelector(`.${CSS.row}:first-child`).classList.add(CSS.rowHeading);
    } else {
      this._table.querySelector(`.${CSS.row}:first-child`).classList.remove(CSS.rowHeading);
    }
  }

  _selectRow(index) {
    this._lastSelectedRow = index;
    this._table.querySelector(`.${CSS.row}:nth-child(${index})`).classList.add(CSS.rowSelected);
  }

  _unselectRow() {
    if (this._lastSelectedRow <= 0) {
      return;
    }

    this._table.querySelector(`.${CSS.row}:nth-child(${this._lastSelectedRow})`).classList.remove(CSS.rowSelected);
    this._lastSelectedRow = 0;
  }

  _selectColumn(index) {
    for (let i = 1; i <= this._numberOfRows; i++) {
      let column = this._table.querySelector(`.${CSS.row}:nth-child(${i}) .${CSS.column}:nth-child(${index})`);
      console.log(column);  
      if (column) {
        column.classList.add(CSS.columnSelected);
      }
    }

    this._lastSelectedColumn = index;
  }

  _unselectColumn() {
    if (this._lastSelectedColumn <= 0) {
      return;
    }

    for (let i = 1; i <= this._numberOfRows; i++) {
      let column = this._table.querySelector(`.${CSS.row}:nth-child(${i}) .${CSS.column}:nth-child(${this._lastSelectedColumn})`);

      if (column) {
        column.classList.remove(CSS.columnSelected);
      }
    }

    this._lastSelectedColumn = 0;
  }
}
