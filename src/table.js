import { create, getCursorPositionRelativeToElement, getRelativeCoordsOfTwoElems, insertAfter, insertBefore } from './documentUtils';
import './styles/table.pcss';
import './styles/toolbox.pcss';
import './styles/utils.pcss';
import './styles/settings.pcss';
import svgPlusButton from './img/plus.svg';
import { Toolbox } from './toolbox';
import { ToolboxColumn } from './toolbox/toolboxColumn';
import { ToolboxRow } from './toolbox/toolboxRow';

const CSS = {
  table: 'tc-table',
  row: 'tc-row',
  withHeadings: 'tc-table--heading',
  rowSelected: 'tc-row--selected',
  cell: 'tc-cell',
  cellSelected: 'tc-cell--selected',
  addRow: 'tc-add-row',
  addColumn: 'tc-add-column',
  wrapper: 'tc-wrap',
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
   * @param {object} api - Editor.js API
   */
  constructor(readOnly, api) {
    this.readOnly = readOnly;
    this.api = api;

    // Current number of columns in the table
    this.numberOfColumns = 0;

    // Current number of rows in the table
    this.numberOfRows = 0;

    // Table toolboxes
    this.toolboxRow = new Toolbox();
    this.toolboxColumn = new ToolboxColumn();
    this.toolboxRow = new ToolboxRow();

    // Table wrapper element
    this.wrapper = this.createTableWrapper();

    // Table element
    this.table = this.wrapper.querySelector(`.${CSS.table}`);

    // Current hovered row index
    this.hoveredRow = 0;

    // Current hovered column index
    this.hoveredColumn = 0;

    // Index of last selected row via toolbox
    this.lastSelectedRow = 0;

    // Index of last selected column via toolbox
    this.lastSelectedColumn = 0;

    // Toggle switches to confirm deletion
    this.showDeleteRowConfirmation = false;
    this.showDeleteColumnConfirmation = false;

    /**
     * The cell in which the focus is currently located, if 0 and 0 then there is no focus
     * Uses to switch between cells with buttons
     */
    this.focusedCell = {
      row: 0,
      column: 0
    };

    /* Listener to hide the menu when click outside of this menu */
    this.clickOutsideMenuListener = this.clickOutsideMenus.bind(this);

    // Listener to hide toolboxes and menus when click outside the table
    this.clickOutsideWrapperListener = this.clickOutsideWrapper.bind(this);

    this.fillInQuickAddButtons();

    if (!this.readOnly) {
      this.bindEvents();
    }
  }

  /**
   * Get tabel cell
   *
   * @param {number} row - cell row coordinate
   * @param {number} column - cell column coordinate
   * @returns {HTMLElement}
   */
  getCell(row, column) {
    return this.table.querySelector(`.${CSS.row}:nth-child(${row}) .${CSS.cell}:nth-child(${column})`);
  }

  /**
   * Get tabel row
   *
   * @param {number} row - row coordinate
   * @returns {HTMLElement}
   */
  getRow(row) {
    return this.table.querySelector(`.${CSS.row}:nth-child(${row})`);
  }

  /**
   * Add column in table on index place
   * Add cells in each row
   *
   * @param {number} columnIndex - number in the array of columns, where new column to insert, -1 if insert at the end
   */
  addColumn(columnIndex = -1) {
    this.numberOfColumns++;

    /**
     * Iterate all rows and add a new cell to them for creating a column
     */
    for (let rowIndex = 1; rowIndex <= this.numberOfRows; rowIndex++) {
      let cell;
      const cellElem = this.createCell();

      if (columnIndex > 0) {
        cell = this.getCell(rowIndex, columnIndex);

        if (cell) {
          insertBefore(cellElem, cell);
        } else {
          cell = this.getCell(rowIndex, columnIndex - 1);

          insertAfter(cellElem, cell);
        }
      } else {
        cell = this.getRow(rowIndex).appendChild(cellElem);
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
    let insertedRow;
    let rowElem = create('div', [ CSS.row ]);

    if (index > 0) {
      let row = this.getRow(index);

      if (row) {
        insertedRow = insertBefore(rowElem, row);
      } else {
        row = this.getRow(index - 1);

        insertedRow = insertAfter(rowElem, row);
      }
    } else {
      insertedRow = this.table.appendChild(rowElem);
    }

    this.fillRow(insertedRow);

    return insertedRow;
  };

  /**
   * Delete a column by index
   *
   * @param {number} index
   */
  deleteColumn(index) {
    for (let i = 1; i <= this.numberOfRows; i++) {
      const cell = this.getCell(i, index);

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
    this.getRow(index).remove();

    this.numberOfRows--;
  }

  /**
   * Add buttons to fast add row/column
   */
  fillInQuickAddButtons() {
    this.wrapper.querySelector(`.${CSS.addColumn}`).innerHTML = svgPlusButton;
    this.wrapper.querySelector(`.${CSS.addRow}`).innerHTML = svgPlusButton;
  }

  /**
   * Create a wrapper containing a table, toolboxes
   * and buttons for adding rows and columns
   *
   * @returns {HTMLElement} wrapper - where all buttons for a table and the table itself will be
   */
  createTableWrapper() {
    return create('div', [ CSS.wrapper ], null, [
      this.toolboxRow.element,
      this.toolboxColumn.element,
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
      const newCell = this.createCell();

      row.appendChild(newCell);
    }
  }

  /**
   * Createing a cell element
   *
   * @return {HTMLElement}
   */
  createCell() {
    return create('div', [ CSS.cell ], { contenteditable: !this.readOnly });
  }

  /**
   * Hangs the necessary handlers to events
   */
  bindEvents() {
    // Update toolboxes position depending on the mouse movements
    this.table.addEventListener('mousemove', (event) => {
      const { row, column } = this.hoveredCell(event);

      this.updateToolboxesPosition(row, column);

      // set the listener to close toolboxes when click outside
      document.addEventListener('click', this.clickOutsideWrapperListener);
    }, {passive: true});

    // Controls quick add buttons
    this.wrapper.addEventListener('click', (event) => {
      const addRowClicked = event.target.closest(`.${CSS.addRow}`);
      const addColumnClicked = event.target.closest(`.${CSS.addColumn}`);

      if (addRowClicked) {
        this.addRow();
        this.hideEverything();
      }

      if (addColumnClicked) {
        this.addColumn();
        this.hideEverything();
      }
    });

    // Controls toolbox with adding and deleting columns
    this.toolboxColumn.element.addEventListener('click', (event) => {
      event.stopPropagation();

      const toolboxColumnIconClicked = event.target.closest('svg');
      const addColumnRightClicked = event.target.closest(`.${CSS.toolboxAddColumnRight}`);
      const addColumnLeftClicked = event.target.closest(`.${CSS.toolboxAddColumnLeft}`);
      const deleteColumnClicked = event.target.closest(`.${CSS.toolboxDeleteColumn}`);

      if (addColumnRightClicked) {
        this.addColumn(this.hoveredColumn + 1);
        this.hideAndUnselect();
      }

      if (addColumnLeftClicked) {
        this.addColumn(this.hoveredColumn);
        this.hideAndUnselect();
      }

      if (deleteColumnClicked) {
        if (this.showDeleteColumnConfirmation) {
          this.deleteColumn(this.hoveredColumn);
          this.hideEverything();
          this.showDeleteColumnConfirmation = false;
        } else {
          this.toolboxColumn.setDeleteConfirmation();
          this.showDeleteColumnConfirmation = true;
        }
      }

      // Open/close toolbox column menu
      if (toolboxColumnIconClicked) {
        this.unselectRowAndHideMenu();

        if (this.hoveredColumn == this.lastSelectedColumn) {
          this.unselectColumnAndHideMenu();

          return;
        }

        this.showDeleteColumnConfirmation = false;
        this.selectColumnAndOpenMenu();
      }
    });

    // Controls toolbox with adding and deleting rows
    this.toolboxRow.element.addEventListener('click', (event) => {
      event.stopPropagation();

      const toolboxRowIconClicked = event.target.closest('svg');
      const addRowAboveClicked = event.target.closest(`.${CSS.toolboxAddRowAbove}`);
      const addRowBelowClicked = event.target.closest(`.${CSS.toolboxAddRowBelow}`);
      const deleteRowClicked = event.target.closest(`.${CSS.toolboxDeleteRow}`);

      if (addRowAboveClicked) {
        this.addRow(this.hoveredRow);
        this.hideAndUnselect();
      }

      if (addRowBelowClicked) {
        this.addRow(this.hoveredRow + 1);
        this.hideAndUnselect();
      }

      if (deleteRowClicked) {
        if (this.showDeleteRowConfirmation) {
          this.deleteRow(this.hoveredRow);
          this.hideEverything();
          this.showDeleteRowConfirmation = false;
        } else {
          this.toolboxRow.setDeleteConfirmation();
          this.showDeleteRowConfirmation = true;
        }
      }

      // Open/close toolbox column menu
      if (toolboxRowIconClicked) {
        this.unselectColumnAndHideMenu();

        if (this.hoveredRow == this.lastSelectedRow) {
          this.unselectRowAndHideMenu();

          return;
        }

        this.showDeleteRowConfirmation = false;
        this.selectRowAndOpenMenu();
      }
    });

    // Controls some of the keyboard buttons inside the table
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

    // Controls some of the keyboard buttons inside the table
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
    }, {passive: true});
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
      document.removeEventListener('click', this.clickOutsideWrapperListener);
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
      this.toolboxColumn.closeToolboxMenu();
    }

    if (event.target.closest(`.${CSS.toolboxRowMenu}`) === null) {
      this.unselectRow();
      this.toolboxRow.closeMenu();
    }

    this.wrapper.removeEventListener('click', this.clickOutsideMenuListener);
  }
  /**
   * Unselect row/column
   * Close toolbox menu
   * Hide toolboxes
   */
  hideEverything() {
    this.unselectRow();
    this.unselectColumn();
    this.toolboxRow.closeMenu();
    this.toolboxColumn.closeToolboxMenu();
    this.updateToolboxesPosition(0, 0);
  }

  /**
   * Unselect row/column
   * Close toolbox menu
   * Recalculates the position of the toolbox buttons
   */
  hideAndUnselect() {
    this.unselectRow();
    this.unselectColumn();
    this.toolboxRow.closeMenu();
    this.toolboxColumn.closeToolboxMenu();
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

    return this.getCell(row, column);
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
      this.toolboxColumn.updateToolboxIconPosition(this.numberOfColumns, column);
    }

    if (!this.isRowMenuShowing) {
      this.hoveredRow = row;
      this.toolboxRow.updateToolboxIconPosition(this.numberOfRows, row, this.table);
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
    const row = this.getRow(index);

    if (row) {
      this.lastSelectedRow = index;
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
      const cell = this.getCell(i, index);

      if (cell) {
        cell.classList.add(CSS.cellSelected);
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

    let cells = this.table.querySelectorAll(`.${CSS.cellSelected}`);

    Array.from(cells).forEach(column => {
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
    let hoveredRow = this.isHoveredRowIsCurrent(event) ? this.hoveredRow : 0;
    let hoveredColumn = this.isHoveredColumnIsCurrent(event) ? this.hoveredColumn : 0;
    let leftBorder = 0; let rightBorder = this.numberOfColumns;
    let topBorder = 0; let bottomBorder = this.numberOfRows;
    const { width, height, x, y } = getCursorPositionRelativeToElement(this.table, event);

    // Looking for hovered column using binsearch
    if (x >= 0 && !hoveredColumn) {
      let totalIterations = 0;

      while (leftBorder < rightBorder && totalIterations < 10) {
        const mid = Math.ceil((leftBorder + rightBorder) / 2);
        const cell = this.getCell(1, mid);
        const { fromRightBorder, fromLeftBorder } = getRelativeCoordsOfTwoElems(this.table, cell);

        if (x < fromLeftBorder) {
          rightBorder = mid;
        } else if (x > width - fromRightBorder) {
          leftBorder = mid;
        } else {
          hoveredColumn = mid;

          break;
        }

        totalIterations++;
      }
    }

    // Looking for hovered row using binsearch
    if (y >= 0 && !hoveredRow) {
      let totalIterations = 0;

      while (topBorder < bottomBorder && totalIterations < 10) {
        const mid = Math.ceil((topBorder + bottomBorder) / 2);
        const cell = this.getCell(mid, 1);
        const { fromTopBorder, fromBottomBorder } = getRelativeCoordsOfTwoElems(this.table, cell);

        if (y < fromTopBorder) {
          bottomBorder = mid;
        } else if (y > height - fromBottomBorder) {
          topBorder = mid;
        } else {
          hoveredRow = mid;

          break;
        }

        totalIterations++;
      }
    }

    return {
      row: hoveredRow || this.hoveredRow,
      column: hoveredColumn || this.hoveredColumn
    };
  }

  /**
   * Quick check to optimise the search of hovered row
   *
   * @param {MouseEvent} event
   * @returns {boolean}
   */
  isHoveredRowIsCurrent(event) {
    if (!this.hoveredRow) {
      return false;
    }

    const { height, y } = getCursorPositionRelativeToElement(this.table, event);
    const cell = this.getCell(this.hoveredRow, 1);
    const { fromTopBorder, fromBottomBorder } = getRelativeCoordsOfTwoElems(this.table, cell);

    return fromTopBorder <= y && y <= height - fromBottomBorder;
  }

  /**
   * Quick check to optimise the search of hovered column
   *
   * @param {MouseEvent} event
   * @returns {boolean}
   */
  isHoveredColumnIsCurrent(event) {
    if (!this.hoveredColumn) {
      return false;
    }

    const { width, x } = getCursorPositionRelativeToElement(this.table, event);
    const cell = this.getCell(1, this.hoveredColumn);
    const { fromLeftBorder, fromRightBorder } = getRelativeCoordsOfTwoElems(this.table, cell);

    return fromLeftBorder <= x && x <= width - fromRightBorder;
  }

  /**
   * Remove the selection effect from the column
   * Hide toolbox column menu and remove clickOutside handler
   */
  selectRowAndOpenMenu() {
    this.selectRow(this.hoveredRow);
    this.toolboxRow.openMenu();
    this.wrapper.addEventListener('click', this.clickOutsideMenuListener, true);
  }

  /**
   * Add the selection effect for the column
   * Open toolbox column menu and add clickOutside handler
   */
  selectColumnAndOpenMenu() {
    this.selectColumn(this.hoveredColumn);
    this.toolboxColumn.openToolboxMenu();
    this.wrapper.addEventListener('click', this.clickOutsideMenuListener);
  }

  /**
   * Remove selection effect from a column
   * Hide toolbox column menu and remove clickOutside handler
   */
  unselectColumnAndHideMenu() {
    this.unselectColumn();
    this.toolboxColumn.closeToolboxMenu();
    this.wrapper.removeEventListener('click', this.clickOutsideMenuListener);
  }

  /**
   * Remove the selection effect from the row
   * Hide toolbox column menu and remove clickOutside handler
   */
  unselectRowAndHideMenu() {
    this.unselectRow();
    this.toolboxRow.closeMenu();
    this.wrapper.removeEventListener('click', this.clickOutsideMenuListener, true);
  }
}
