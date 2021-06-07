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
  toolboxDeleteRow: 'tc-toolbox-delete--row',
  toolboxColumnMenu: 'tc-toolbox-column__menu',
  toolboxRowMenu: 'tc-toolbox-row__menu'
};

/**
 * Generates and manages table contents.
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
    this.numberOfColumns = 0;
    this.numberOfRows = 0;
    this.toolbox = new Toolbox();
    this.element = this.createTableWrapper();
    this.table = this.element.querySelector(`.${CSS.table}`);
    this.hoveredRow = 0;
    this.hoveredColumn = 0;
    this.lastSelectedRow = 0;
    this.lastSelectedColumn = 0;

    // The cell in which the focus is currently located, if 0 and 0 then there is no focus
    // Uses to switch between cells with buttons
    this.focusedCell = {
      row: 0,
      column: 0
    };

    // function for event listeners to hide toolbox menus
    this.clickOutsideMenuHandler = this.clickOutsideMenus.bind(this);

    this.fillAddButtons();

    if (!this.readOnly) {
      this.hangEvents();
    }
  }

  /**
   * Add column in table on index place
   * Add cells in each row
   *
   * @param {number} index - number in the array of columns, where new column to insert, -1 if insert at the end
   */
  addColumn(index = -1) {
    this.numberOfColumns++;

    for (let i = 1; i <= this.numberOfRows; i++) {
      let cell;
      const newCell = create('div', [ CSS.cell ], { contenteditable: !this.readOnly });

      if (index > 0) {
        cell = this.table.querySelector(`.${CSS.row}:nth-child(${i}) .${CSS.cell}:nth-child(${index})`);

        if (cell) {
          insertBefore(newCell, cell);
        } else {
          cell = this.table.querySelector(`.${CSS.row}:nth-child(${i}) .${CSS.cell}:nth-child(${index - 1})`);

          insertAfter(newCell, cell);
        }
      } else {
        cell = this.table.querySelector(`.${CSS.row}:nth-child(${i})`).appendChild(newCell);
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
    this.numberOfRows++;
    let newRow;
    let rowElem = create('div', [ CSS.row ]);

    if (index > 0) {
      let row = this.table.querySelector(`.${CSS.row}:nth-child(${index})`);

      if (row) {
        newRow = insertBefore(rowElem, row);
      } else {
        row = this.table.querySelector(`.${CSS.row}:nth-child(${index - 1})`);

        newRow = insertAfter(rowElem, row);
      }
    } else {
      newRow = this.table.appendChild(rowElem);
    }

    this.fillRow(newRow);

    return newRow;
  };

  /**
   * Delete a column by index
   *
   * @param {number} index
   */
  deleteColumn(index) {
    for (let i = 1; i <= this.numberOfRows; i++) {
      const cell = this.table.querySelector(`.${CSS.row}:nth-child(${i}) .${CSS.cell}:nth-child(${index})`);

      if (!cell) {
        return;
      }

      cell.remove();
    }

    this.numberOfColumns--;
  }

  /**
   * Delete a row by index
   *
   * @param {number} index
   */
  deleteRow(index) {
    this.table.querySelector(`.${CSS.row}:nth-child(${index})`).remove();

    this.numberOfRows--;
  }

  /**
   * Add buttons to fast add row/column
   */
  fillAddButtons() {
    this.element.querySelector(`.${CSS.addColumn}`).innerHTML = svgPlusButton;
    this.element.querySelector(`.${CSS.addRow}`).innerHTML = svgPlusButton;
  }

  /**
   * get html element of table
   *
   * @returns {HTMLElement}
   */
  get htmlElement() {
    return this.element;
  }

  /**
   * get real table tag
   *
   * @returns {HTMLElement}
   */
  get body() {
    return this.table;
  }

  /**
   * Create wrapper with an additional interface
   *
   * @returns {HTMLElement} wrapper - where all buttons for a table and the table itself will be
   */
  createTableWrapper() {
    return create('div', [ CSS.wrapper ], null, [
      this.toolbox.toolboxRow,
      this.toolbox.toolboxColumn,
      create('div', [ CSS.table ]),
      create('div', [ CSS.addColumn ]),
      create('div', [ CSS.addRow ])
    ]);
  }

  /**
   * Add cells to a row
   *
   * @param {HTMLElement} row
   */
  fillRow(row) {
    for (let i = 1; i <= this.numberOfColumns; i++) {
      const newCell = create('div', [ CSS.cell ], { contenteditable: !this.readOnly });

      row.appendChild(newCell);
    }
  }

  /**
   * Hangs the necessary handlers to events
   */
  hangEvents() {
    // Update toolboxes position depending on the mouse movements
    this.table.addEventListener('mousemove', (event) => {
      const { row, column } = this.hoveredCell(event);

      this.updateToolboxesPosition(row, column);
    }, true);

    this.element.querySelector(`.${CSS.addColumn}`).addEventListener('click', (event) => {
      this.addColumn();
      this.hideEverything();
    });

    this.element.querySelector(`.${CSS.addRow}`).addEventListener('click', (event) => {
      this.addRow();
      this.hideEverything();
    });

    // Add column to right
    this.toolbox.toolboxColumn.querySelector(`.${CSS.toolboxAddColumnRight}`).addEventListener('click', event => {
      event.stopPropagation();

      this.addColumn(this.hoveredColumn + 1);
      this.hideAndUnselect();
    });

    // Add column to left
    this.toolbox.toolboxColumn.querySelector(`.${CSS.toolboxAddColumnLeft}`).addEventListener('click', event => {
      event.stopPropagation();

      this.addColumn(this.hoveredColumn);
      this.hideAndUnselect();
    });

    // Add row above
    this.toolbox.toolboxRow.querySelector(`.${CSS.toolboxAddRowAbove}`).addEventListener('click', event => {
      event.stopPropagation();

      this.addRow(this.hoveredRow);
      this.hideAndUnselect();
    });

    // Add row below
    this.toolbox.toolboxRow.querySelector(`.${CSS.toolboxAddRowBelow}`).addEventListener('click', event => {
      event.stopPropagation();

      this.addRow(this.hoveredRow + 1);
      this.hideAndUnselect();
    });

    // Delete selected column
    this.toolbox.toolboxColumn.querySelector(`.${CSS.toolboxDeleteColumn}`).addEventListener('click', event => {
      this.deleteColumn(this.hoveredColumn);
      this.hideEverything();
    });

    // Delete selected row
    this.toolbox.toolboxRow.querySelector(`.${CSS.toolboxDeleteRow}`).addEventListener('click', event => {
      this.deleteRow(this.hoveredRow);
      this.hideEverything();
    });

    // Open/close toolbox row menu
    this.toolbox.toolboxRow.addEventListener('click', event => {
      this.unselectColumn();
      this.toolbox.closeToolboxColumnMenu();
      event.stopPropagation();

      if (this.hoveredRow == this.lastSelectedRow) {
        this.unselectRow();
        this.toolbox.closeToolboxRowMenu();
        this.element.removeEventListener('click', this.clickOutsideMenuHandler, true);

        return;
      }

      this.selectRow(this.hoveredRow);
      this.toolbox.openToolboxRowMenu();
      this.element.addEventListener('click', this.clickOutsideMenuHandler, true);
    });

    // Open/close toolbox column menu
    this.toolbox.toolboxColumn.addEventListener('click', event => {
      this.unselectRow();
      this.toolbox.closeToolboxRowMenu();
      event.stopPropagation();

      if (this.hoveredColumn == this.lastSelectedColumn) {
        this.unselectColumn();
        this.toolbox.closeToolboxColumnMenu();
        this.element.removeEventListener('click', this.clickOutsideMenuHandler, true);

        return;
      }

      this.selectColumn(this.hoveredColumn);
      this.toolbox.openToolboxColumnMenu();
      this.element.addEventListener('click', this.clickOutsideMenuHandler, true);
    });

    // Controls some buttons inside the table
    this.table.onkeypress = (event) => {
      if (event.key == 'Enter' && event.shiftKey) {
        return true;
      }

      if (event.key == 'Enter') {
        if (this.focusedCell.row != this.numberOfRows) {
          this.focusedCell.row += 1;
          this.focusCell(this.focusedCell);
        } else {
          this.addRow();
          this.focusedCell.row += 1;
          this.focusCell(this.focusedCell);
          this.updateToolboxesPosition(0, 0);
        }
      }

      return event.key != 'Enter';
    };

    // Controls some buttons inside the table
    this.table.addEventListener('keydown', (event) => {
      if (event.key == 'Tab') {
        event.stopPropagation();
      }
    });

    // Determine the position of the cell in focus
    this.table.addEventListener('focusin', event => {
      const cell = event.target;
      const row = cell.parentElement;

      this.focusedCell = {
        row: Array.from(this.table.querySelectorAll(`.${CSS.row}`)).indexOf(row) + 1,
        column: Array.from(row.querySelectorAll(`.${CSS.cell}`)).indexOf(cell) + 1
      };
    });

    document.addEventListener('click', this.clickOutsideWrapper.bind(this));
  }

  /**
   * Is the column toolbox menu displayed or not
   *
   * @returns {boolean}
   */
  get isColumnMenuShowing() {
    return this.lastSelectedColumn != 0;
  }

  /**
   * Is the row toolbox menu displayed or not
   *
   * @returns {boolean}
   */
  get isRowMenuShowing() {
    return this.lastSelectedRow != 0;
  }

  /**
   * Close everything if we click outside the document
   *
   * @param {Event} - click event
   */
  clickOutsideWrapper(event) {
    if (event.target.closest(`.${CSS.wrapper}`) === null) {
      this.hideEverything();
    }
  }

  /**
   * Close toolbox menu and unselect a row/column
   * but doesn't hide toolbox button
   *
   * @param {Event} event - click event
   */
  clickOutsideMenus(event) {
    if (event.target.closest(`.${CSS.toolboxColumnMenu}`) === null) {
      this.unselectColumn();
      this.toolbox.closeToolboxColumnMenu();
    }

    if (event.target.closest(`.${CSS.toolboxRowMenu}`) === null) {
      this.unselectRow();
      this.toolbox.closeToolboxRowMenu();
    }
  }

  /**
   * Unselect row/column
   * Close toolbox menu
   * Hide toolboxes
   */
  hideEverything() {
    this.unselectRow();
    this.toolbox.closeToolboxRowMenu();
    this.unselectColumn();
    this.toolbox.closeToolboxColumnMenu();
    this.updateToolboxesPosition(0, 0);
  }

  /**
   * Unselect row/column
   * Close toolbox menu
   * Recalculates the position of the toolbox buttons
   */
  hideAndUnselect() {
    this.unselectRow();
    this.toolbox.closeToolboxRowMenu();
    this.unselectColumn();
    this.toolbox.closeToolboxColumnMenu();
    this.updateToolboxesPosition();
  }

  /**
   * Set the cursor focus to the focused cell
   */
  focusCell() {
    this.focusedCellElem.focus();
  }

  /**
   * Get current focused element
   *
   * @returns {HTMLElement} - focused cell
   */
  get focusedCellElem() {
    const { row, column } = this.focusedCell;

    return this.table.querySelector(`.${CSS.row}:nth-child(${row}) .${CSS.cell}:nth-child(${column})`);
  }

  /**
   * Update toolboxes position
   *
   * @param {number} row - hovered row
   * @param {number} column - hovered column
   */
  updateToolboxesPosition(row = this.hoveredRow, column = this.hoveredColumn) {
    if (!this.isColumnMenuShowing) {
      this.hoveredColumn = column;
      this.toolbox.updateToolboxColumnPosition(this.numberOfColumns, column);
    }

    if (!this.isRowMenuShowing) {
      this.hoveredRow = row;
      this.toolbox.updateToolboxRowPosition(this.numberOfRows, row, this.table);
    }
  }

  /**
   * Makes the first row headings
   *
   * @param {boolean} withHeadings - use headings row or not
   */
  useHeadings(withHeadings) {
    if (withHeadings) {
      this.table.classList.add(CSS.withHeadings);
    } else {
      this.table.classList.remove(CSS.withHeadings);
    }
  }

  /**
   * Add effect of a selected row
   *
   * @param {number} index
   */
  selectRow(index) {
    this.lastSelectedRow = index;
    const row = this.table.querySelector(`.${CSS.row}:nth-child(${index})`);

    if (row) {
      row.classList.add(CSS.rowSelected);
    }
  }

  /**
   * Remove effect of a selected row
   */
  unselectRow() {
    if (this.lastSelectedRow <= 0) {
      return;
    }

    const row = this.table.querySelector(`.${CSS.rowSelected}`);

    if (row) {
      row.classList.remove(CSS.rowSelected);
    }

    this.lastSelectedRow = 0;
  }

  /**
   * Add effect of a selected column
   *
   * @param {number} index
   */
  selectColumn(index) {
    for (let i = 1; i <= this.numberOfRows; i++) {
      const column = this.table.querySelector(`.${CSS.row}:nth-child(${i}) .${CSS.cell}:nth-child(${index})`);

      if (column) {
        column.classList.add(CSS.cellSelected);
      }
    }

    this.lastSelectedColumn = index;
  }

  /**
   * Remove effect of a selected column
   */
  unselectColumn() {
    if (this.lastSelectedColumn <= 0) {
      return;
    }

    let columns = this.table.querySelectorAll(`.${CSS.cellSelected}`);

    Array.from(columns).forEach(column => {
      column.classList.remove(CSS.cellSelected);
    });

    this.lastSelectedColumn = 0;
  }

  /**
   * Calculates the row and column that the cursor is currently hovering over
   *
   * @param {Event} event - mousemove event
   * @returns hovered cell coordinates as an integer row and column
   */
  hoveredCell(event) {
    let hoveredRow = 0;
    let hoveredColumn = 0;
    const { width, height, x, y } = getRelativeCoords(this.table, event);

    // Looking for hovered column
    for (let i = 1; i <= this.numberOfColumns; i++) {
      const cell = this.table.querySelector(`.${CSS.row}:first-child .${CSS.cell}:nth-child(${i})`);
      const { fromRightBorder } = getRelativeCoordsOfTwoElems(this.table, cell);

      if (x < width - fromRightBorder) {
        hoveredColumn = i;

        break;
      }
    }

    // Looking for hovered row
    for (let i = 1; i <= this.numberOfRows; i++) {
      const row = this.table.querySelector(`.${CSS.row}:nth-child(${i})`);
      const { fromBottomBorder } = getRelativeCoordsOfTwoElems(this.table, row);

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
