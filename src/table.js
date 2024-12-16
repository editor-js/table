import Toolbox from './toolbox';
import * as $ from './utils/dom';
import throttled from './utils/throttled';

import {
  IconDirectionLeftDown,
  IconDirectionRightDown,
  IconDirectionUpRight,
  IconDirectionDownRight,
  IconCross,
  IconPlus,
  IconAddBackground,
  IconStretch,
  IconCollapse
} from '@codexteam/icons';

const CSS = {
  wrapper: 'tc-wrap',
  wrapperReadOnly: 'tc-wrap--readonly',
  table: 'tc-table',
  row: 'tc-row',
  withHeadings: 'tc-table--heading',
  rowSelected: 'tc-row--selected',
  cell: 'tc-cell',
  cellSelected: 'tc-cell--selected',
  addRow: 'tc-add-row',
  addRowDisabled: 'tc-add-row--disabled',
  addColumn: 'tc-add-column',
  addColumnDisabled: 'tc-add-column--disabled',
};

/**
 * @typedef {object} TableConfig
 * @description Tool's config from Editor
 * @property {boolean} withHeadings — Uses the first line as headings
 * @property {TableCell[][]} withHeadings — two-dimensional array with table contents
 * @property {string[]} presetColors - array of preset colors
 */

/**
 * @typedef {object} TableCell
 * @description Data per table cell
 * @property {string} content - string content for table
 * @property {string} backgroundColor - color of the cell
 * @property {float} width - relative width of the cell ( 1 == 1fr)
 */

/**
 * @typedef {object} TableData - object with the data transferred to form a table
 * @property {number} rows - number of rows in the table
 * @property {number} cols - number of columns in the table
 */


/**
 * Generates and manages table contents.
 */
export default class Table {
  /**
   * Creates
   *
   * @constructor
   * @param {boolean} readOnly - read-only mode flag
   * @param {object} api - Editor.js API
   * @param {TableData} data - Editor.js API
   * @param {TableConfig} config - Editor.js API
   */
  constructor(readOnly, api, data, config) {
    this.readOnly = readOnly;
    this.api = api;
    this.data = data;
    this.config = config;

    /**
     * DOM nodes
     */
    this.wrapper = null;
    this.table = null;

    /**
     * Toolbox for managing of columns
     */
    this.toolboxColumn = this.createColumnToolbox();
    this.toolboxRow = this.createRowToolbox();
    this.toolboxCell = this.createCellToolbox();
    this.cellColorPicker = null;

    /**
     * Create table and wrapper elements
     */
    this.createTableWrapper();

    // Current hovered row index
    this.hoveredRow = 0;

    // Current hovered column index
    this.hoveredColumn = 0;

    // Index of last selected row via toolbox
    this.selectedRow = 0;

    // Index of last selected column via toolbox
    this.selectedColumn = 0;

    // Additional settings for the table
    this.tunes = {
      withHeadings: false
    };

    /**
     * Resize table to match config/data size
     */
    this.resize();

    /**
     * Fill the table with data
     */
    this.fill();

    /**
     * The cell in which the focus is currently located, if 0 and 0 then there is no focus
     * Uses to switch between cells with buttons
     */
    this.focusedCell = {
      row: 0,
      column: 0
    };

    /**
     * Global click listener allows to delegate clicks on some elements
     */
    this.documentClicked = (event) => {
      const clickedInsideTable = event.target.closest(`.${CSS.table}`) !== null;
      const outsideTableClicked = event.target.closest(`.${CSS.wrapper}`) === null;
      const clickedOutsideToolboxes = clickedInsideTable || outsideTableClicked;

      if (clickedOutsideToolboxes) {
        this.hideToolboxes();
      }

      const clickedOnAddRowButton = event.target.closest(`.${CSS.addRow}`);
      const clickedOnAddColumnButton = event.target.closest(`.${CSS.addColumn}`);

      /**
       * Also, check if clicked in current table, not other (because documentClicked bound to the whole document)
       */
      if (clickedOnAddRowButton && clickedOnAddRowButton.parentNode === this.wrapper) {
        this.addRow(undefined, true);
        this.hideToolboxes();
      } else if (clickedOnAddColumnButton && clickedOnAddColumnButton.parentNode === this.wrapper) {
        this.addColumn(undefined, true);
        this.hideToolboxes();
      }
    };

    if (!this.readOnly) {
      this.bindEvents();
    }
  }

  /**
   * Returns the rendered table wrapper
   *
   * @returns {Element}
   */
  getWrapper() {
    return this.wrapper;
  }

  /**
   * Hangs the necessary handlers to events
   */
  bindEvents() {
    // set the listener to close toolboxes when click outside
    document.addEventListener('click', this.documentClicked);

    // Update toolboxes position depending on the mouse movements
    this.table.addEventListener('mousemove', throttled(150, (event) => this.onMouseMoveInTable(event)), { passive: true });

    // Controls some of the keyboard buttons inside the table
    this.table.onkeypress = (event) => this.onKeyPressListener(event);

    // Tab is executed by default before keypress, so it must be intercepted on keydown
    this.table.addEventListener('keydown', (event) => this.onKeyDownListener(event));

    // Determine the position of the cell in focus
    this.table.addEventListener('focusin', event => this.focusInTableListener(event));
  }

  /**
   * Configures and creates the toolbox for manipulating with columns
   *
   * @returns {Toolbox}
   */
  createColumnToolbox() {
    return new Toolbox({
      api: this.api,
      cssModifier: 'column',
      items: [
        {
          label: this.api.i18n.t('Add column to left'),
          icon: IconDirectionLeftDown,
          hideIf: () => {
            return this.numberOfColumns === this.config.maxcols
          },
          onClick: () => {
            this.addColumn(this.selectedColumn, true);
            this.hideToolboxes();
          }
        },
        {
          label: this.api.i18n.t('Add column to right'),
          icon: IconDirectionRightDown,
          hideIf: () => {
            return this.numberOfColumns === this.config.maxcols
          },
          onClick: () => {
            this.addColumn(this.selectedColumn + 1, true);
            this.hideToolboxes();
          }
        },
        {
          label: this.api.i18n.t('Delete column'),
          icon: IconCross,
          hideIf: () => {
            return this.numberOfColumns === 1;
          },
          confirmationRequired: true,
          onClick: () => {
            this.deleteColumn(this.selectedColumn);
            this.hideToolboxes();
          },
        },
        {
          label: this.api.i18n.t('Increase Width'),
          icon: IconStretch,
          onClick: () => {
            this.increaseWidth(this.selectedColumn)
            this.hideToolboxes();
          }
        },
        {
          label: this.api.i18n.t('Decrease Width'),
          icon: IconCollapse,
          onClick: () => {
            this.decreaseWidth(this.selectedColumn)
            this.hideToolboxes();
          }
        }
      ],
      onOpen: () => {
        this.selectColumn(this.hoveredColumn);
        this.hideRowToolbox();
        this.hideCellToolbox();
      },
      onClose: () => {
        this.unselectColumn();
      }
    });
  }

  /**
   * Increase the width of the specified columns by 0.1
   * EditorJS represents tables as CSS Grid
   *
   * @param {number} column - column index
   */
  increaseWidth(column) {
    for(let row = 1; row <= this.numberOfRows; row++) {
      this.setCellWidth({row, column, adjustedWidth: 0.1, defaultWidth: 1});
    }

    this.adjustColumnWidths();
  }

  /**
   * Decrease the width of the specified columns by 0.1
   * EditorJS represents tables as CSS Grid
   *
   * @param {number} column - column index
   */
  decreaseWidth(column) {
    for(let row = 1; row <= this.numberOfRows; row++) {
      this.setCellWidth({row, column, adjustedWidth: -0.1, defaultWidth: 1});
    }

    this.adjustColumnWidths();
  }

  setCellWidth({row, column, adjustedWidth = 0, defaultWidth = 1}) {
    const cell = this.getCell(row, column);
    const width = parseFloat(cell.dataset.width) || defaultWidth;
    cell.dataset.width = Math.max(width + adjustedWidth, 0.1);
  }

  /**
   * Adjust the widths of all columns in the table to be displayed
   * EditorJS represents tables as CSS Grid, so we need to go through each
   * row and adjust the width of each column
   */
  adjustColumnWidths() {
    for(let rowNumber = 1; rowNumber <= this.numberOfRows; rowNumber++) {
      const row = this.getRow(rowNumber);

      const rowGridTemplate = []
      for(let columnNumber = 1; columnNumber <= this.numberOfColumns; columnNumber++) {
        const cell = this.getCell(rowNumber, columnNumber);
        const width = cell.dataset.width || 1;

        rowGridTemplate.push(`${width}fr`)
      }

      row.style.gridTemplateColumns = rowGridTemplate.join(" ")
    }
  }

  /**
   * Configures and creates the toolbox for manipulating with cells
   *
   * @returns {Toolbox}
   */
  createCellToolbox() {
    return new Toolbox({
      api: this.api,
      cssModifier: 'cell',
      items: [
        {
          label: this.api.i18n.t('Change background color'),
          icon: IconAddBackground,
          onClick: () => {
            this.hideToolboxes();

            this.cellColorPicker = $.make('div', 'tc-color-picker-container');
            this.cellColorPicker.style.position = 'absolute';

            const colorInput = $.make('input', 'tc-color-picker');
            colorInput.type = 'color';
            colorInput.setAttribute('list', 'tc-color-presets');

            const presets = $.make('datalist');
            presets.id = 'tc-color-presets';

            (this.config.presetColors || []).forEach(color => {
              const option = $.make('option');
              option.value = color;
              presets.appendChild(option);
            });

            colorInput.addEventListener('change', (event) => {
              const cell = this.getCell(this.focusedCell.row, this.focusedCell.column);
              if (cell) {
                this.setCellBackgroundColor(this.focusedCell.row, this.focusedCell.column, event.target.value);
              }
              this.hideToolboxes();
            });

            this.cellColorPicker.appendChild(colorInput);
            this.cellColorPicker.appendChild(presets);

            this.toolboxCell.element.appendChild(this.cellColorPicker);
          }
        },
      ],
      onOpen: () => {
        this.hideColumnToolbox();
        this.hideRowToolbox();
      },
      onClose: () => {
        this.unselectRow();
        this.unselectColumn();
      }
    })
  }

  /**
   * Configures and creates the toolbox for manipulating with rows
   *
   * @returns {Toolbox}
   */
  createRowToolbox() {
    return new Toolbox({
      api: this.api,
      cssModifier: 'row',
      items: [
        {
          label: this.api.i18n.t('Add row above'),
          icon: IconDirectionUpRight,
          hideIf: () => {
            return this.numberOfRows === this.config.maxrows
          },
          onClick: () => {
            this.addRow(this.selectedRow, true);
            this.hideToolboxes();
          }
        },
        {
          label: this.api.i18n.t('Add row below'),
          icon: IconDirectionDownRight,
          hideIf: () => {
            return this.numberOfRows === this.config.maxrows
          },
          onClick: () => {
            this.addRow(this.selectedRow + 1, true);
            this.hideToolboxes();
          }
        },
        {
          label: this.api.i18n.t('Delete row'),
          icon: IconCross,
          hideIf: () => {
            return this.numberOfRows === 1;
          },
          confirmationRequired: true,
          onClick: () => {
            this.deleteRow(this.selectedRow);
            this.hideToolboxes();
          }
        }
      ],
      onOpen: () => {
        this.selectRow(this.hoveredRow);
        this.hideColumnToolbox();
      },
      onClose: () => {
        this.unselectRow();
      }
    });
  }

  /**
   * When you press enter it moves the cursor down to the next row
   * or creates it if the click occurred on the last one
   */
  moveCursorToNextRow() {
    if (this.focusedCell.row !== this.numberOfRows) {
      this.focusedCell.row += 1;
      this.focusCell(this.focusedCell);
    } else {
      this.addRow();
      this.focusedCell.row += 1;
      this.focusCell(this.focusedCell);
      this.updateToolboxesPosition(0, 0);
    }
  }

  /**
   * Get table cell by row and col index
   *
   * @param {number} row - cell row coordinate
   * @param {number} column - cell column coordinate
   * @returns {HTMLElement}
   */
  getCell(row, column) {
    return this.table.querySelectorAll(`.${CSS.row}:nth-child(${row}) .${CSS.cell}`)[column - 1];
  }

  /**
   * Get table row by index
   *
   * @param {number} row - row coordinate
   * @returns {HTMLElement}
   */
  getRow(row) {
    return this.table.querySelector(`.${CSS.row}:nth-child(${row})`);
  }

  /**
   * The parent of the cell which is the row
   *
   * @param {HTMLElement} cell - cell element
   * @returns {HTMLElement}
   */
  getRowByCell(cell) {
    return cell.parentElement;
  }

  /**
   * Ger row's first cell
   *
   * @param {Element} row - row to find its first cell
   * @returns {Element}
   */
  getRowFirstCell(row) {
    return row.querySelector(`.${CSS.cell}:first-child`);
  }

  /**
   * Set the sell's content by row and column numbers
   *
   * @param {number} row - cell row coordinate
   * @param {number} column - cell column coordinate
   * @param {string} content - cell HTML content
   */
  setCellContent(row, column, content) {
    const cell = this.getCell(row, column);

    cell.innerHTML = content;
  }

  setCellBackgroundColor(row, column, color) {
    if(color == null) { return; }

    const cell = this.getCell(row, column);

    cell.dataset.backgroundColor = color;
    cell.style.backgroundColor = color;
  }

  /**
   * Add column in table on index place
   * Add cells in each row
   *
   * @param {number} columnIndex - number in the array of columns, where new column to insert, -1 if insert at the end
   * @param {boolean} [setFocus] - pass true to focus the first cell
   */
  addColumn(columnIndex = -1, setFocus = false) {
    let numberOfColumns = this.numberOfColumns;
     /**
      * Check if the number of columns has reached the maximum allowed columns specified in the configuration,
      * and if so, exit the function to prevent adding more columns beyond the limit.
      */
    if (this.config && this.config.maxcols && this.numberOfColumns >= this.config.maxcols) {
      return;
  }

    /**
     * Iterate all rows and add a new cell to them for creating a column
     */
    for (let rowIndex = 1; rowIndex <= this.numberOfRows; rowIndex++) {
      let cell;
      const cellElem = this.createCell();

      if (columnIndex > 0 && columnIndex <= numberOfColumns) {
        cell = this.getCell(rowIndex, columnIndex);

        $.insertBefore(cellElem, cell);
      } else {
        cell = this.getRow(rowIndex).appendChild(cellElem);
      }

      /**
       * Autofocus first cell
       */
      if (rowIndex === 1) {
        const firstCell = this.getCell(rowIndex, columnIndex > 0 ? columnIndex : numberOfColumns + 1);

        if (firstCell && setFocus) {
          $.focus(firstCell);
        }
      }
    }

    const addColButton = this.wrapper.querySelector(`.${CSS.addColumn}`);
    if (this.config?.maxcols && this.numberOfColumns > this.config.maxcols - 1 && addColButton ){
      addColButton.classList.add(CSS.addColumnDisabled);
    }
    this.addHeadingAttrToFirstRow();
    this.adjustColumnWidths();
  };

  /**
   * Add row in table on index place
   *
   * @param {number} index - number in the array of rows, where new column to insert, -1 if insert at the end
   * @param {boolean} [setFocus] - pass true to focus the inserted row
   * @returns {HTMLElement} row
   */
  addRow(index = -1, setFocus = false) {
    let insertedRow;
    let rowElem = $.make('div', CSS.row);
    const rowBlueprint = this.getRow(1); // Use this row as the blueprint to copy the width of the columns

    if (this.tunes.withHeadings) {
      this.removeHeadingAttrFromFirstRow();
    }

    /**
     * We remember the number of columns, because it is calculated
     * by the number of cells in the first row
     * It is necessary that the first line is filled in correctly
     */
    let numberOfColumns = this.numberOfColumns;
     /**
      * Check if the number of rows has reached the maximum allowed rows specified in the configuration,
      * and if so, exit the function to prevent adding more columns beyond the limit.
      */
    if (this.config && this.config.maxrows && this.numberOfRows >= this.config.maxrows && addRowButton) {
      return;
    }

    if (index > 0 && index <= this.numberOfRows) {
      let row = this.getRow(index);

      insertedRow = $.insertBefore(rowElem, row);
    } else {
      insertedRow = this.table.appendChild(rowElem);
    }

    this.fillRow(insertedRow, numberOfColumns);
    this.copyColumnWidthsFromBlueprint(rowBlueprint, insertedRow);

    if (this.tunes.withHeadings) {
      this.addHeadingAttrToFirstRow();
    }

    const insertedRowFirstCell = this.getRowFirstCell(insertedRow);

    if (insertedRowFirstCell && setFocus) {
      $.focus(insertedRowFirstCell);
    }

    const addRowButton = this.wrapper.querySelector(`.${CSS.addRow}`);
    if (this.config && this.config.maxrows && this.numberOfRows >= this.config.maxrows && addRowButton) {
      addRowButton.classList.add(CSS.addRowDisabled);
    }

    this.adjustColumnWidths();
    return insertedRow;
  };

  /**
   * Copy the width of the columns from the blueprint row to the target row
   *
   * @param {HTMLElement} blueprintRow - the row to copy the width from
   * @param {HTMLElement} targetRow - the row to copy the width to
   */
  copyColumnWidthsFromBlueprint(blueprintRow, targetRow) {
    console.log('copyColumnWidthsFromBlueprint', blueprintRow, targetRow);
    if (!blueprintRow || !targetRow) {
      return;
    }

    const blueprintCells = blueprintRow.querySelectorAll(`.${CSS.cell}`);
    const targetCells = targetRow.querySelectorAll(`.${CSS.cell}`);

    blueprintCells.forEach((cell, index) => {
      if (cell.dataset.width) {
        targetCells[index].dataset.width = cell.dataset.width;
      }
    });
  }

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
    const addColButton = this.wrapper.querySelector(`.${CSS.addColumn}`);
    if (addColButton) {
      addColButton.classList.remove(CSS.addColumnDisabled);
    }
  }

  /**
   * Delete a row by index
   *
   * @param {number} index
   */
  deleteRow(index) {
    this.getRow(index).remove();
    const addRowButton = this.wrapper.querySelector(`.${CSS.addRow}`);
    if (addRowButton) {
      addRowButton.classList.remove(CSS.addRowDisabled);
    }

    this.addHeadingAttrToFirstRow();
  }

  /**
   * Create a wrapper containing a table, toolboxes
   * and buttons for adding rows and columns
   *
   * @returns {HTMLElement} wrapper - where all buttons for a table and the table itself will be
   */
  createTableWrapper() {
    this.wrapper = $.make('div', CSS.wrapper);
    this.table = $.make('div', CSS.table);

    if (this.readOnly) {
      this.wrapper.classList.add(CSS.wrapperReadOnly);
    }

    this.wrapper.appendChild(this.toolboxRow.element);
    this.wrapper.appendChild(this.toolboxColumn.element);
    this.wrapper.appendChild(this.toolboxCell.element);

    this.wrapper.appendChild(this.table);

    if (!this.readOnly) {
      const addColumnButton = $.make('div', CSS.addColumn, {
        innerHTML: IconPlus
      });
      const addRowButton = $.make('div', CSS.addRow, {
        innerHTML: IconPlus
      });

      this.wrapper.appendChild(addColumnButton);
      this.wrapper.appendChild(addRowButton);
    }
  }

  /**
   * Returns the size of the table based on initial data or config "size" property
   *
   * @return {{rows: number, cols: number}} - number of cols and rows
   */
  computeInitialSize() {
    const content = this.data && this.data.content;
    const isValidArray = Array.isArray(content);
    const isNotEmptyArray = isValidArray ? content.length : false;
    const contentRows = isValidArray ? content.length : undefined;
    const contentCols = isNotEmptyArray ? content[0].length : undefined;
    const parsedRows = Number.parseInt(this.config && this.config.rows);
    const parsedCols = Number.parseInt(this.config && this.config.cols);

    /**
     * Value of config have to be positive number
     */
    const configRows = !isNaN(parsedRows) && parsedRows > 0 ? parsedRows : undefined;
    const configCols = !isNaN(parsedCols) && parsedCols > 0 ? parsedCols : undefined;
    const defaultRows = 2;
    const defaultCols = 2;
    const rows = contentRows || configRows || defaultRows;
    const cols = contentCols || configCols || defaultCols;

    return {
      rows: rows,
      cols: cols
    };
  }

  /**
   * Resize table to match config size or transmitted data size
   *
   * @return {{rows: number, cols: number}} - number of cols and rows
   */
  resize() {
    const { rows, cols } = this.computeInitialSize();

    for (let i = 0; i < rows; i++) {
      this.addRow();
    }

    for (let i = 0; i < cols; i++) {
      this.addColumn();
    }
  }

  /**
   * Fills the table with data passed to the constructor
   *
   * @returns {void}
   */
  fill() {
    const data = this.data;

    if (data && data.content) {
      for (let i = 0; i < data.content.length; i++) {
        for (let j = 0; j < data.content[i].length; j++) {
          const cellData = data.content[i][j];
          if (typeof cellData === 'object') {
            this.setCellContent(i + 1, j + 1, cellData.content);
            this.setCellBackgroundColor(i + 1, j + 1, cellData.backgroundColor);
            this.setCellWidth({ row: i+1, column: j+1, defaultWidth: cellData.width })
          } else {
            this.setCellContent(i + 1, j + 1, data.content[i][j]);
          }
        }
      }
      this.adjustColumnWidths();
    }
  }

  /**
   * Fills a row with cells
   *
   * @param {HTMLElement} row - row to fill
   * @param {number} numberOfColumns - how many cells should be in a row
   */
  fillRow(row, numberOfColumns) {
    for (let i = 1; i <= numberOfColumns; i++) {
      const newCell = this.createCell();

      row.appendChild(newCell);
    }
  }

  /**
   * Creating a cell element
   *
   * @return {Element}
   */
  createCell() {
    return $.make('div', CSS.cell, {
      contentEditable: !this.readOnly
    });
  }

  /**
   * Get number of rows in the table
   */
  get numberOfRows() {
    return this.table.childElementCount;
  }

  /**
   * Get number of columns in the table
   */
  get numberOfColumns() {
    if (this.numberOfRows) {
      return this.table.querySelectorAll(`.${CSS.row}:first-child .${CSS.cell}`).length;
    }

    return 0;
  }

  /**
   * Is the column toolbox menu displayed or not
   *
   * @returns {boolean}
   */
  get isColumnMenuShowing() {
    return this.selectedColumn !== 0;
  }

  /**
   * Is the row toolbox menu displayed or not
   *
   * @returns {boolean}
   */
  get isRowMenuShowing() {
    return this.selectedRow !== 0;
  }

  get isCellMenuShowing() {
    return this.focusedCell.row > 0 && this.focusedCell.column > 0 && this.focusedCellElem;
  }

  /**
   * Recalculate position of toolbox icons
   *
   * @param {Event} event - mouse move event
   */
  onMouseMoveInTable(event) {
    const { row, column } = this.getHoveredCell(event);

    this.hoveredColumn = column;
    this.hoveredRow = row;

    this.updateToolboxesPosition();
  }

  /**
   * Prevents default Enter behaviors
   * Adds Shift+Enter processing
   *
   * @param {KeyboardEvent} event - keypress event
   */
  onKeyPressListener(event) {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        return true;
      }

      this.moveCursorToNextRow();
    }

    return event.key !== 'Enter';
  };

  /**
   * Prevents tab keydown event from bubbling
   * so that it only works inside the table
   *
   * @param {KeyboardEvent} event - keydown event
   */
  onKeyDownListener(event) {
    if (event.key === 'Tab') {
      event.stopPropagation();
    }
  }

  /**
   * Set the coordinates of the cell that the focus has moved to
   *
   * @param {FocusEvent} event - focusin event
   */
  focusInTableListener(event) {
    const cell = event.target;
    const row = this.getRowByCell(cell);

    this.focusedCell = {
      row: Array.from(this.table.querySelectorAll(`.${CSS.row}`)).indexOf(row) + 1,
      column: Array.from(row.querySelectorAll(`.${CSS.cell}`)).indexOf(cell) + 1
    };
  }

  /**
   * Unselect row/column
   * Close toolbox menu
   * Hide toolboxes
   *
   * @returns {void}
   */
  hideToolboxes() {
    this.hideRowToolbox();
    this.hideColumnToolbox();
    this.hideCellToolbox();
    this.updateToolboxesPosition();
  }

  /**
   * Unselect row, close toolbox
   *
   * @returns {void}
   */
  hideRowToolbox() {
    this.unselectRow();
    this.toolboxRow.hide();
  }
  /**
   * Unselect column, close toolbox
   *
   * @returns {void}
   */
  hideColumnToolbox() {
    this.unselectColumn();

    this.toolboxColumn.hide();
  }


  /**
   * close cellToolbox
   */
  hideCellToolbox() {
    this.toolboxCell.hide();
    if (this.cellColorPicker) {
      this.cellColorPicker.remove()
      this.cellColorPicker = null
    }
  }

  /**
   * Set the cursor focus to the focused cell
   *
   * @returns {void}
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
   * Update toolboxes position, this is used to display the controls at column/row/cell level
   *
   * @param {number} row - hovered row
   * @param {number} column - hovered column
   */
  updateToolboxesPosition(row = this.hoveredRow, column = this.hoveredColumn) {
    if (!this.isColumnMenuShowing) {
      if (column > 0 && column <= this.numberOfColumns) { // not sure this statement is needed. Maybe it should be fixed in getHoveredCell()
        const hoveredColumnElement = this.getCell(1, column)
        const { fromLeftBorder } = $.getRelativeCoordsOfTwoElems(this.table, hoveredColumnElement);
        const { width } = hoveredColumnElement.getBoundingClientRect();

        this.toolboxColumn.show(() => {
          return {
            left: `${fromLeftBorder + width / 2}px`
          };
        });
      }
    }

    if (!this.isRowMenuShowing) {
      if (row > 0 && row <= this.numberOfRows) { // not sure this statement is needed. Maybe it should be fixed in getHoveredCell()
        this.toolboxRow.show(() => {
          const hoveredRowElement = this.getRow(row);
          const { fromTopBorder } = $.getRelativeCoordsOfTwoElems(this.table, hoveredRowElement);
          const { height } = hoveredRowElement.getBoundingClientRect();

          return {
            top: `${Math.ceil(fromTopBorder + height / 2)}px`
          };
        });
      }
    }

    // Display the cell toolbox icon if focused
    if (this.isCellMenuShowing) {
      const cell = this.focusedCellElem;
      const cellRect = cell.getBoundingClientRect();
      const toolboxRect = this.toolboxCell.element.getBoundingClientRect();
      const { fromTopBorder, fromLeftBorder } = $.getRelativeCoordsOfTwoElems(this.table, cell);

      this.toolboxCell.show(() => {
        return {
          top: `${fromTopBorder}px`,
          left: `${fromLeftBorder + cellRect.width - toolboxRect.width}px`
        }
      });
    }
  }

  /**
   * Makes the first row headings
   *
   * @param {boolean} withHeadings - use headings row or not
   */
  setHeadingsSetting(withHeadings) {
    this.tunes.withHeadings = withHeadings;

    if (withHeadings) {
      this.table.classList.add(CSS.withHeadings);
      this.addHeadingAttrToFirstRow();
    } else {
      this.table.classList.remove(CSS.withHeadings);
      this.removeHeadingAttrFromFirstRow();
    }
  }

  /**
   * Adds an attribute for displaying the placeholder in the cell
   */
  addHeadingAttrToFirstRow() {
    for (let cellIndex = 1; cellIndex <= this.numberOfColumns; cellIndex++) {
      let cell = this.getCell(1, cellIndex);

      if (cell) {
        cell.setAttribute('heading', this.api.i18n.t('Heading'));
      }
    }
  }

  /**
   * Removes an attribute for displaying the placeholder in the cell
   */
  removeHeadingAttrFromFirstRow() {
    for (let cellIndex = 1; cellIndex <= this.numberOfColumns; cellIndex++) {
      let cell = this.getCell(1, cellIndex);

      if (cell) {
        cell.removeAttribute('heading');
      }
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
      this.selectedRow = index;
      row.classList.add(CSS.rowSelected);
    }
  }

  /**
   * Remove effect of a selected row
   */
  unselectRow() {
    if (this.selectedRow <= 0) {
      return;
    }

    const row = this.table.querySelector(`.${CSS.rowSelected}`);

    if (row) {
      row.classList.remove(CSS.rowSelected);
    }

    this.selectedRow = 0;
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

    this.selectedColumn = index;
  }

  /**
   * Remove effect of a selected column
   */
  unselectColumn() {
    if (this.selectedColumn <= 0) {
      return;
    }

    let cells = this.table.querySelectorAll(`.${CSS.cellSelected}`);

    Array.from(cells).forEach(column => {
      column.classList.remove(CSS.cellSelected);
    });

    this.selectedColumn = 0;
  }

  /**
   * Calculates the row and column that the cursor is currently hovering over
   * The search was optimized from O(n) to O (log n) via bin search to reduce the number of calculations
   *
   * @param {Event} event - mousemove event
   * @returns hovered cell coordinates as an integer row and column
   */
  getHoveredCell(event) {
    let hoveredRow = this.hoveredRow;
    let hoveredColumn = this.hoveredColumn;
    const { width, height, x, y } = $.getCursorPositionRelativeToElement(this.table, event);

    // Looking for hovered column
    if (x >= 0) {
      hoveredColumn = this.binSearch(
        this.numberOfColumns,
        (mid) => this.getCell(1, mid),
        ({ fromLeftBorder }) => x < fromLeftBorder,
        ({ fromRightBorder }) => x > (width - fromRightBorder)
      );
    }

    // Looking for hovered row
    if (y >= 0) {
      hoveredRow = this.binSearch(
        this.numberOfRows,
        (mid) => this.getCell(mid, 1),
        ({ fromTopBorder }) => y < fromTopBorder,
        ({ fromBottomBorder }) => y > (height - fromBottomBorder)
      );
    }

    return {
      row: hoveredRow || this.hoveredRow,
      column: hoveredColumn || this.hoveredColumn
    };
  }

  /**
   * Looks for the index of the cell the mouse is hovering over.
   * Cells can be represented as ordered intervals with left and
   * right (upper and lower for rows) borders inside the table, if the mouse enters it, then this is our index
   *
   * @param {number} numberOfCells - upper bound of binary search
   * @param {function} getCell - function to take the currently viewed cell
   * @param {function} beforeTheLeftBorder - determines the cursor position, to the left of the cell or not
   * @param {function} afterTheRightBorder - determines the cursor position, to the right of the cell or not
   * @returns {number}
   */
  binSearch(numberOfCells, getCell, beforeTheLeftBorder, afterTheRightBorder) {
    let leftBorder = 0;
    let rightBorder = numberOfCells + 1;
    let totalIterations = 0;
    let mid;

    while (leftBorder < rightBorder - 1 && totalIterations < 10) {
      mid = Math.ceil((leftBorder + rightBorder) / 2);

      const cell = getCell(mid);
      const relativeCoords = $.getRelativeCoordsOfTwoElems(this.table, cell);

      if (beforeTheLeftBorder(relativeCoords)) {
        rightBorder = mid;
      } else if (afterTheRightBorder(relativeCoords)) {
        leftBorder = mid;
      } else {
        break;
      }

      totalIterations++;
    }

    return mid;
  }

  /**
   * Collects data from cells into a two-dimensional array
   *
   * @returns {string[][]}
   */
  getData() {
    const data = [];

    for (let i = 1; i <= this.numberOfRows; i++) {
      const row = this.table.querySelector(`.${CSS.row}:nth-child(${i})`);
      const cells = Array.from(row.querySelectorAll(`.${CSS.cell}`));
      const isEmptyRow = cells.every(cell => !cell.textContent.trim());

      if (isEmptyRow) {
        continue;
      }

      data.push(cells.map(cell => {
        const obj = { content: cell.innerHTML }

        if (cell.dataset.backgroundColor) {
          obj.backgroundColor = cell.dataset.backgroundColor;
        }

        if (cell.dataset.width) {
          obj.width = cell.dataset.width;
        }

        return obj;
      }));
    }

    return data;
  }

  /**
   * Remove listeners on the document
   */
  destroy() {
    document.removeEventListener('click', this.documentClicked);
  }
}
