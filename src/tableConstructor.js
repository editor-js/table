import './styles/table-constructor.pcss';
import {create, getCoords, getSideByCoords} from './documentUtils';
import {HorizontalBorderToolBar, VerticalBorderToolBar} from './borderToolBar';
import {Table} from './table';

const CSS = {
  editor: 'tc-editor',
  toolBarHor: 'tc-toolbar--hor',
  toolBarVer: 'tc-toolbar--ver',
  inputField: 'tc-table__inp'
};

/**
 * Entry point. Controls table and give API to user
 */
export class TableConstructor {
  /**
   * Creates
   * @param {TableData} data - previously saved data for insert in table
   * @param {object} config - configuration of table
   * @param {object} api - Editor.js API
   * @param {boolean} readOnly - read-only mode flag
   */
  constructor(data, config, api, readOnly) {
    this.readOnly = readOnly;

    /** creating table */
    this._table = new Table(readOnly);
    const size = this._initTable(data, config);

    this._fillTable(data, size);

    /** creating container around table */
    this._container = create('div', [CSS.editor, api.styles.block], null, [this._table.htmlElement]);

    /** creating ToolBars */
    this._verticalToolBar = new VerticalBorderToolBar();
    this._horizontalToolBar = new HorizontalBorderToolBar();
    this._table.htmlElement.appendChild(this._horizontalToolBar.htmlElement);
    this._table.htmlElement.appendChild(this._verticalToolBar.htmlElement);

    /** Activated elements */
    this._activatedToolBar = null;
    this._hoveredCellSide = null;

    /** Timers */
    this._plusButDelay = null;
    this._toolbarShowDelay = null;

    if (!this.readOnly) {
      this._hangEvents();
    }
  }

  /**
   * returns html element of TableConstructor;
   * @return {HTMLElement}
   */
  get htmlElement() {
    return this._container;
  }

  /**
   * @private
   *
   *  Fill table data passed to the constructor
   * @param {TableData} data - data for insert in table
   * @param {{rows: number, cols: number}} size - contains number of rows and cols
   */
  _fillTable(data, size) {
    if (data.content !== undefined) {
      for (let i = 0; i < size.rows && i < data.content.length; i++) {
        for (let j = 0; j < size.cols && j < data.content[i].length; j++) {
          // get current cell and her editable part
          const input = this._table.body.rows[i].cells[j].querySelector('.' + CSS.inputField);

          input.innerHTML = data.content[i][j];
        }
      }
    }
  }

  /**
   * @private
   *
   * resize to match config or transmitted data
   * @param {TableData} data - data for inserting to the table
   * @param {object} config - configuration of table
   * @param {number|string} config.rows - number of rows in configuration
   * @param {number|string} config.cols - number of cols in configuration
   * @return {{rows: number, cols: number}} - number of cols and rows
   */
  _initTable(data, config) {
    const isValidArray = Array.isArray(data.content);
    const isNotEmptyArray = isValidArray ? data.content.length : false;
    const contentRows = isValidArray ? data.content.length : undefined;
    const contentCols = isNotEmptyArray ? data.content[0].length : undefined;
    const parsedRows = Number.parseInt(config.rows);
    const parsedCols = Number.parseInt(config.cols);
    // value of config have to be positive number
    const configRows = !isNaN(parsedRows) && parsedRows > 0 ? parsedRows : undefined;
    const configCols = !isNaN(parsedCols) && parsedCols > 0 ? parsedCols : undefined;
    const defaultRows = 2;
    const defaultCols = 2;
    const rows = contentRows || configRows || defaultRows;
    const cols = contentCols || configCols || defaultCols;

    for (let i = 0; i < rows; i++) {
      this._table.addRow(i);
    }
    for (let i = 0; i < cols; i++) {
      this._table.addColumn(i);
    }

    return {
      rows: rows,
      cols: cols
    };
  }

  /**
   * Show ToolBar
   *
   * @private
   * @param {BorderToolBar} toolBar - which toolbar to show
   * @param {number} coord - where show. x or y depending on the grade of the toolbar
   * @param {boolean} withDelete - flag to active/deactivate delete button
   */
  _showToolBar(toolBar, coord, withDelete) {
    this._hideToolBar();

    this._activatedToolBar = toolBar;

    toolBar.showIn(coord, withDelete);
  }

  /**
   * Hide all of toolbars
   *
   * @private
   */
  _hideToolBar() {
    if (this._activatedToolBar !== null) {
      this._activatedToolBar.hide();
      this._table._clearState();
    }
  }

  /**
   * @private
   *
   * hang necessary events
   */
  _hangEvents() {
    this._container.addEventListener('mouseInActivatingArea', (event) => {
      this._toolbarCalling(event);
    });

    this._container.addEventListener('click', (event) => {
      this._clickToolbar(event);
    });

    this._container.addEventListener('input', () => {
      this._hideToolBar();
    });

    this._container.addEventListener('keydown', (event) => {
      this._containerKeydown(event);
    });

    this._container.addEventListener('mouseout', (event) => {
      this._leaveDetectArea(event);
    });

    this._container.addEventListener('mouseover', (event) => {
      this._mouseEnterInDetectArea(event);
    });
  }

  /**
   * @private
   *
   * detects a mouseenter on a special area
   * @param {MouseEvent} event
   */
  _mouseInActivatingAreaListener(event) {
    this._hoveredCellSide = event.detail.side;
    const areaCoords = getCoords(event.target);
    const containerCoords = getCoords(this._table.htmlElement);

    let addPadding = true;
    if (event.target instanceof HTMLElement && event.target.classList.contains(this._table.CSS.wrapper)) {
      addPadding = false;
    }

    if (event.target.closest('TD') === null && addPadding) {
      const paddingContainer = 11;
      areaCoords.x1 += paddingContainer;
      areaCoords.y1 += paddingContainer;
      areaCoords.x2 -= paddingContainer;
      areaCoords.y2 -= paddingContainer;
    }

    if (this._hoveredCellSide === 'top') {
      this._showToolBar(this._horizontalToolBar, areaCoords.y1 - containerCoords.y1 - 2, this._table.rowCount() > 1);

      if (this._table.hasActiveRow()) {
        this._table.isFirstRowActive()
          ? this._table.activateCurrentRow()
          : this._table.activateTopRowForToolbar();
      } else {
        this._table.activateFirstRow();
      }
    }
    if (this._hoveredCellSide === 'bottom') {
      this._showToolBar(this._horizontalToolBar, areaCoords.y2 - containerCoords.y1 - 1, this._table.rowCount() > 1);

      // this will activate the last row if we initially entered from left and never entered the table before
      if (this._table.hasActiveRow()) {
        this._table.isLastRowActive()
          ? this._table.activateCurrentRow()
          : this._table.activateBottomRowForToolbar();
      } else {
        this._table.activateLastRow();
      }
    }
    if (this._hoveredCellSide === 'left') {
      this._showToolBar(this._verticalToolBar, areaCoords.x1 - containerCoords.x1 - 2, this._table.cellCount() > 1);

      // this will activate the first column if we initially entered from left and never entered the table before
      if (this._table.hasActiveCell()) {
        this._table.isFirstCellActive()
          ? this._table.activateCurrentColumn()
          : this._table.activateLeftColumnForToolbar();
      } else {
        this._table.activateFirstColumn();
      }
    }
    if (this._hoveredCellSide === 'right') {
      this._showToolBar(this._verticalToolBar, areaCoords.x2 - containerCoords.x1 - 1, this._table.cellCount() > 1);

      // this will activate the last column if we initially entered from left and never entered the table before
      if (this._table.hasActiveCell()) {
        this._table.isLastCellActive()
          ? this._table.activateCurrentColumn()
          : this._table.activateRightColumnForToolbar();

      } else {
        this._table.activateLastColumn();
      }
    }
  }

  /**
   * @private
   *
   * Checks elem is toolbar
   * @param {HTMLElement|} elem - element
   * @return {boolean}
   */
  _isToolbar(elem) {
    return !!(elem.closest('.' + CSS.toolBarHor) || elem.closest('.' + CSS.toolBarVer));
  }

  /**
   * @private
   *
   * Hide toolbar, if mouse left area
   * @param {MouseEvent} event
   */
  _leaveDetectArea(event) {
    if (event.relatedTarget && this._isToolbar(event.relatedTarget)) {
      return;
    }
    clearTimeout(this._toolbarShowDelay);
    this._hideToolBar();
  }

  /**
   * @private
   *
   * Show toolbar when mouse in activation area
   * Showing
   * @param {MouseEvent} event
   */
  _toolbarCalling(event) {
    if (this._isToolbar(event.target)) {
      return;
    }
    clearTimeout(this._toolbarShowDelay);
    this._toolbarShowDelay = setTimeout(() => {
      this._mouseInActivatingAreaListener(event);
    }, 125);
  }

  /**
   * @private
   *
   * handling clicks on toolbars
   * @param {MouseEvent} event
   */
  _clickToolbar(event) {
    if (!this._isToolbar(event.target)) {
      return;
    }
    let typeCoord;

    if (event.detail && event.detail.button === 'minus') {
      if (this._activatedToolBar === this._horizontalToolBar) {
        this._removeRow();
        typeCoord = 'y';
      } else {
        this._removeColumn();
        typeCoord = 'x';
      }
    } else { // Default: Plus-Button - in this case user clicked the button OR the line
      if (this._activatedToolBar === this._horizontalToolBar) {
        this._addRow();
        typeCoord = 'y';
      } else {
        this._addColumn();
        typeCoord = 'x';
      }
    }

    /** If event has transmitted data (coords of mouse) */
    const detailHasData = isNaN(event.detail) && event.detail !== null;

    if (detailHasData) {
      const containerCoords = getCoords(this._table.htmlElement);
      let coord;

      if (typeCoord === 'x') {
        coord = event.detail.x - containerCoords.x1;
      } else {
        coord = event.detail.y - containerCoords.y1;
      }
      this._delayAddButtonForMultiClickingNearMouse(coord, event.target);
    } else {
      this._hideToolBar();
    }
  }

  /**
   * @private
   *
   * detects button presses when editing a table's content
   * @param {KeyboardEvent} event
   */
  _containerKeydown(event) {
    if (event.keyCode === 13) {
      this._containerEnterPressed(event);
    }
  }

  /**
   * @private
   *
   * Leaves the PlusButton active under mouse
   * The timer gives time to press the button again, before it disappears.
   * While the button is being pressed, the timer will be reset
   * @param {number} coord - coords of mouse. x or y depending on the grade of the toolbar
   */
  _delayAddButtonForMultiClickingNearMouse(coord) {
    this._showToolBar(this._activatedToolBar, coord);
    this._activatedToolBar.hideLine();
    clearTimeout(this._plusButDelay);
    this._plusButDelay = setTimeout(() => {
      this._hideToolBar();
    }, 500);
  }

  /**
   * Adds row in table
   *
   * @private
   */
  _addRow() {
    if (this._hoveredCellSide === 'bottom') {
      if (this._table.hasActiveRow()) {
        this._table.addRowBelow(this._table.activeRow());

        return;
      }

      this._table.addRowAtEnd();
      return;
    }

    if (this._table.hasActiveRow()) {
      this._table.addRowAbove(this._table.activeRow());

      return;
    }

    this._table.addRowAtBeginning();
  }

  /**
   * Removes row in table
   *
   * @private
   */
  _removeRow() {
    const rowIndex = this._table.activeRow();

    if (this._hoveredCellSide === 'bottom') {
      if (this._table.hasActiveRow()) {
        this._table.isLastRowActive()
          ? this._table.removeRow(rowIndex)
          : this._table.removeRowBelow(rowIndex);
      } else {
        this._table.removeLastRow();
      }

      return;
    }

    if (this._table.hasActiveRow()) {
      this._table.isFirstRowActive()
        ? this._table.removeRow(rowIndex)
        : this._table.removeRowAbove(rowIndex);
    } else {
      this._table.removeFirstRow();
    }
  }

  /**
   * Adds column in table
   *
   * @private
   */
  _addColumn() {
    if (this._hoveredCellSide === 'left') {
      if (this._table.hasActiveCell()) {
        this._table.addColumnLeft(this._table.activeCell());

        return;
      }

      this._table.addColumnAtBeginning();

      return;
    }

    if (this._table.hasActiveCell()) {
      this._table.addColumnRight(this._table.activeCell());

      return;
    }

    this._table.addColumnAtEnd();
  }

  /**
   * Removes column in table
   *
   * @private
   */
  _removeColumn() {
    const cellIndex = this._table.activeCell();

    if (this._hoveredCellSide === 'left') {
      if (this._table.hasActiveCell()) {
        this._table.isFirstCellActive()
          ? this._table.removeColumn(cellIndex)
          : this._table.removeColumnLeft(cellIndex);
      } else {
        this._table.removeFirstColumn();
      }

      return;
    }

    if (this._table.hasActiveCell()) {
      this._table.isLastCellActive()
        ? this._table.removeColumn(cellIndex)
        : this._table.removeColumnRight(cellIndex);
    } else {
      this._table.removeLastColumn();
    }
  }

  /**
   * if "cntrl + Eneter" is pressed then create new line under current and focus it
   *
   * @private
   * @param {KeyboardEvent} event
   */
  _containerEnterPressed(event) {
    if (!(this._table.selectedCell !== null && !event.shiftKey)) {
      return;
    }

    const newRow = this._table.addRowBelow(this._table.activeRow());

    newRow.cells[0].click();
  }

  /**
   * @private
   *
   * When the mouse enters the detection area
   * @param {MouseEvent} event
   */
  _mouseEnterInDetectArea(event) {
    const coords = getCoords(this._container);
    const side = getSideByCoords(coords, event.pageX, event.pageY);

    event.target.dispatchEvent(new CustomEvent('mouseInActivatingArea', {
      'detail': {
        'side': side
      },
      'bubbles': true
    }));
  }
}
