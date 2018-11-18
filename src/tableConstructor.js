import './tableConstructor.pcss';
import {create, getCoords} from './documentUtils';
import {addDetectionAreas} from './DetectionAreas';
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
   */
  constructor(data, config) {
    /** creating table */
    this._table = new Table();
    const size = this._resizeTable(data, config);

    this._fillTable(data, size);

    /** creating container around table */
    this._container = create('div', [ CSS.editor ], null, [ this._table.htmlElement ]);
    addDetectionAreas(this._container, false);

    /** creating ToolBars */
    this._verticalToolBar = new VerticalBorderToolBar();
    this._horizontalToolBar = new HorizontalBorderToolBar();
    this._table.htmlElement.appendChild(this._horizontalToolBar.htmlElement);
    this._table.htmlElement.appendChild(this._verticalToolBar.htmlElement);

    /** Activated elements */
    this._hoveredCell = null;
    this._activatedToolBar = null;
    this._hoveredCellSide = null;

    /** Timer for delay plus button */
    this._plusButDelay = null;

    this._hangEvents();
  }

  /**
   * returns html element of TableConstructor;
   * @return {HTMLElement}
   */
  get htmlElement() {
    return this._container;
  }

  /**
   *  Fill table data passed to the constructor
   * @param {TableData} data - data for insert in table
   * @param {{rows: number, cols: number}} size - contains number of rows and cols
   * @private
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
   * resize to match config or transmitted data
   * @param {TableData} data - data for inserting to the table
   * @param {object} config - configuration of table
   * @param {number|string} config.rows - number of rows in configuration
   * @param {number|string} config.cols - number of cols in configuration
   * @return {{rows: number, cols: number}} - number of cols and rows
   * @private
   */
  _resizeTable(data, config) {
    const isValidArray = Array.isArray(data.content);
    const isNotEmptyArray = isValidArray ? data.content.length : false;
    const contentRows = isValidArray ? data.content.length : undefined;
    const contentCols = isNotEmptyArray ? data.content[0].length : undefined;
    const parsedRows = Number.parseInt(config.rows);
    const parsedCols = Number.parseInt(config.cols);
    // value of config have to be positive number
    const configRows = !isNaN(parsedRows) && parsedRows > 0 ? parsedRows : undefined;
    const configCols = !isNaN(parsedCols) && parsedCols > 0 ? parsedCols : undefined;
    const rows = configRows || contentRows || 1;
    const cols = configCols || contentCols || 1;

    for (let i = 0; i < rows; i++) {
      this._table.addRow();
    }
    for (let i = 0; i < cols; i++) {
      this._table.addColumn();
    }

    return {
      rows: rows,
      cols: cols
    };
  }

  /**
   * Show ToolBar
   * @param {BorderToolBar} toolBar - which toolbar to show
   * @param {number} coord - where show. x or y depending on the grade of the toolbar
   * @private
   */
  _showToolBar(toolBar, coord) {
    this._hideToolBar();
    this._activatedToolBar = toolBar;
    toolBar.showIn(coord);
  }

  /**
   * Hide all of toolbars
   * @private
   */
  _hideToolBar() {
    if (this._activatedToolBar !== null) {
      this._activatedToolBar.hide();
    }
  }

  /**
   * hang necessary events
   * @private
   */
  _hangEvents() {
    this._container.addEventListener('mouseInActivatingArea', (event) => {
      this._mouseInActivatingAreaListener(event);
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

    this._container.addEventListener('mouseleave', () => {
      this._hideToolBar();
    });
  }

  /**
   * detects a mouseenter on a special area
   * @param {MouseEvent} event
   * @private
   */
  _mouseInActivatingAreaListener(event) {
    this._hoveredCellSide = event.detail.side;
    const areaCoords = getCoords(event.target);
    const containerCoords = getCoords(this._table.htmlElement);

    this._hoveredCell = event.target.closest('TD');
    if (this._hoveredCell === null) {
      this._hoveredCell = this._container;
    }

    if (this._hoveredCellSide === 'top') {
      this._showToolBar(this._horizontalToolBar, areaCoords.y1 - containerCoords.y1 - 2);
    }
    if (this._hoveredCellSide === 'bottom') {
      this._showToolBar(this._horizontalToolBar, areaCoords.y2 - containerCoords.y1 - 1);
    }
    if (this._hoveredCellSide === 'left') {
      this._showToolBar(this._verticalToolBar, areaCoords.x1 - containerCoords.x1 - 2);
    }
    if (this._hoveredCellSide === 'right') {
      this._showToolBar(this._verticalToolBar, areaCoords.x2 - containerCoords.x1 - 1);
    }
  }

  /**
   * handling clicks on toolbars
   * @param {MouseEvent} event
   * @private
   */
  _clickToolbar(event) {
    if (!(event.target.classList.contains(CSS.toolBarHor) || event.target.classList.contains(CSS.toolBarVer))) {
      return;
    }
    let typeCoord;

    if (this._activatedToolBar === this._horizontalToolBar) {
      this._addRow();
      typeCoord = 'y';
    } else {
      this._addColumn();
      typeCoord = 'x';
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
      this._delayAddButtonForMultiClickingNearMouse(coord);
    } else {
      this._hideToolBar();
    }
  }

  /**
   * detects button presses when editing a table's content
   * @param {KeyboardEvent} event
   * @private
   */
  _containerKeydown(event) {
    if (event.keyCode === 13) {
      this._containerEnterPressed(event);
    }
  }

  /**
   * Leaves the PlusButton active under mouse
   * The timer gives time to press the button again, before it disappears.
   * While the button is being pressed, the timer will be reset
   * @param {number} coord - coords of mouse. x or y depending on the grade of the toolbar
   * @private
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
     * Check if the addition is initiated by the container and which side
     * @returns {number} - -1 for left or top; 0 for bottom or right; 1 if not container
     * @private
     */
  _getHoveredSideOfContainer() {
    if (this._hoveredCell === this._container) {
      return this._isBottomOrRight() ? 0 : -1;
    }
    return 1;
  }

  /**
     * check if hovered cell side is bottom or right. (lefter in array of cells or rows than hovered cell)
     * @returns {boolean}
     * @private
     */
  _isBottomOrRight() {
    return this._hoveredCellSide === 'bottom' || this._hoveredCellSide === 'right';
  }

  /**
   * Adds row in table
   * @private
   */
  _addRow() {
    const indicativeRow = this._hoveredCell.closest('TR');
    let index = this._getHoveredSideOfContainer();

    if (index === 1) {
      index = indicativeRow.sectionRowIndex;
      // if inserting after hovered cell
      index = index + this._isBottomOrRight();
    }

    this._table.addRow(index);
  }

  /**
   * Adds column in table
   * @private
   */
  _addColumn() {
    let index = this._getHoveredSideOfContainer();

    if (index === 1) {
      index = this._hoveredCell.cellIndex;
      // if inserting after hovered cell
      index = index + this._isBottomOrRight();
    }

    this._table.addColumn(index);
  }

  /**
   * if "cntrl + Eneter" is pressed then create new line under current and focus it
   * @param {KeyboardEvent} event
   * @private
   */
  _containerEnterPressed(event) {
    if (!(this._table.selectedCell !== null && !event.shiftKey)) {
      return;
    }
    const indicativeRow = this._table.selectedCell.closest('TR');
    let index = this._getHoveredSideOfContainer();

    if (index === 1) {
      index = indicativeRow.sectionRowIndex + 1;
    }
    const newstr = this._table.addRow(index);

    newstr.cells[0].click();
  }
}
