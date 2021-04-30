import { create, getCoords, getSideByCoords, insertAfter, insertBefore, hoveredCell } from './documentUtils';
import './styles/table.pcss';
import './styles/toolbox.pcss';
import './styles/utils.pcss';
import svgPlusButton from './img/plus.svg';
import {Toolbox} from './toolbox';

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
  toolboxAddColumnRight: 'tc-toolbox-add-column-right',
  toolboxAddColumnLeft: 'tc-toolbox-add-column-left',
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
        insertBefore(newCell, cell);
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
      this._toolbox.toolboxRow,
      this._toolbox.toolboxColumn,
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
    // Update toolboxes position depending on the mouse movements
    this._table.addEventListener('mousemove', (event) => {
      const { row, column } = hoveredCell(this._table, event, this._numberOfColumns, this._numberOfRows);

      this._hoveredRow = row;
      this._hoveredColumn = column;

      this._updateToolboxesPosition(row, column);
    }, true);

    // Hide toolboxes when leaving the table
    this._element.addEventListener('mouseleave', (event) => {
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
      // this._updateToolboxesPosition(this._hoveredRow, this._hoveredColumn);

      this._updateToolboxesPosition(0, 0);
      this._toolbox.closeToolboxColumnMenu();
    });

    // Add column to left
    this._toolbox.toolboxColumn.querySelector(`.${CSS.toolboxAddColumnLeft}`).addEventListener('click', event => {
      event.stopPropagation();
      this.addColumn(this._hoveredColumn);
      // this._hoveredColumn += 1;
      // this._updateToolboxesPosition(this._hoveredRow, this._hoveredColumn);
      this._updateToolboxesPosition(0, 0);
      this._toolbox.closeToolboxColumnMenu();
    })
  }

  _updateToolboxesPosition(row, column) {
    this._toolbox.updateToolboxColumnPosition(this._numberOfColumns, column);
    this._toolbox.updateToolboxRowPosition(this._numberOfRows, row);
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
